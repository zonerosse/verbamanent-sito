# -*- coding: utf-8 -*-
"""
Verba Manent sul web: lo stesso motore del programma (motore.py, appunti.py, ripasso.py...), dentro il browser.
Gira con Pyodide in un Web Worker (worker.js). Come android_motore.py adatta il motore al telefono,
questo lo adatta al browser, senza cambiare i file del programma:
  - thread    -> nel browser non ci sono: i lavori partono uno dopo l'altro (pompa()), i cicli infiniti no
  - rete      -> XMLHttpRequest del worker; Claude direttamente dal browser (con la chiave della persona)
  - Drive     -> il token di Google preso nella pagina (Google Identity Services), niente segreti
  - file      -> audio, slide, PDF da aprire o scaricare: indirizzi blob: fatti nel worker
Sul web non si registra e non si trascrive: le lezioni arrivano dal Google Drive, cifrate con la password.
"""
import email.parser
import http.client
import io
import json
import logging
import os
import secrets
import sys
import threading
import time
import traceback
import types
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import js
from pyodide.ffi import to_js

log = logging.getLogger("registra_lezione")
CARTELLA_APP = "/rl"

# ===================================================================================== thread
# I cicli che sul PC girano sempre (calendario, trascrizione, controlli ogni tot secondi): sul web non servono.
MAI = {"Api._sentinella", "Motore._calendario", "Motore._lavoratore", "Motore._lavoratore_appunti",
       "Motore._prepara_modello", "Motore._ciclo", "Motore._riprova_cloud", "Motore.avvia_sincronizza",
       "Motore._nv_ciclo", "Motore._sync_ciclo", "Motore._sync_giro", "Motore.controlli", "rinomina_collegamenti",
       "BaseServer.serve_forever", "_avvisi", "_sveglie", "Api._apri_mini", "_manda"}
_pendenti = []


def _nome(t):
    f = getattr(t, "_target", None)
    return getattr(f, "__qualname__", "") or getattr(f, "__name__", "") or ""


def _start(self):
    n = _nome(self)
    if n in MAI or n.endswith("serve_forever"):
        return
    self._vm_attesa = True
    _pendenti.append(self)


def _esegui(t):
    if not getattr(t, "_vm_attesa", False):
        return
    t._vm_attesa = False
    try:
        t.run()
    except Exception:
        log.exception("lavoro %s", _nome(t))


def _join(self, timeout=None):
    if self in _pendenti:
        _pendenti.remove(self)
    _esegui(self)


threading.Thread.start = _start
threading.Thread.join = _join
threading.Thread.is_alive = lambda self: bool(getattr(self, "_vm_attesa", False))


# ===================================================================================== rete
VIETATE = {"content-length", "user-agent", "host", "connection", "accept-encoding", "origin", "referer"}


class _Testa(http.client.HTTPMessage):
    pass


def _testa(grezza):
    return email.parser.Parser(_class=_Testa).parsestr(str(grezza or ""))


class _Risposta(io.BytesIO):
    def __init__(self, url, codice, testa, corpo):
        super().__init__(corpo)
        self.url, self.status, self.code, self.headers, self.reason = url, codice, codice, testa, ""

    def getcode(self):
        return self.status

    def info(self):
        return self.headers

    def geturl(self):
        return self.url

    def getheader(self, nome, predefinito=None):
        return self.headers.get(nome, predefinito)


def urlopen(req, data=None, timeout=60, *a, **k):
    """urllib.request.urlopen con XMLHttpRequest (sincrona: siamo in un worker, la pagina non si blocca)."""
    if isinstance(req, str):
        req = urllib.request.Request(req, data=data)
    url, metodo, corpo = req.full_url, req.get_method(), req.data if req.data is not None else data
    famiglia = "api.anthropic.com" in url and bool(js.vmFamiglia())
    if famiglia:
        # Claude «gia' pronto» per la famiglia: la chiave sta nella cassaforte del sito, non qui
        url = str(js.location.origin) + "/api/claude" + url.split("api.anthropic.com", 1)[1]
    xhr = js.XMLHttpRequest.new()
    xhr.open(metodo, url, False)
    xhr.responseType = "arraybuffer"
    if timeout:
        xhr.timeout = int(float(timeout) * 1000)
    for nome, valore in req.header_items():
        if nome.lower() not in VIETATE and not (famiglia and nome.lower() == "x-api-key"):
            xhr.setRequestHeader(nome, str(valore))
    if famiglia:
        t = js.vmToken()
        xhr.setRequestHeader("X-VM-Google", str(t.token) if t else "")
    elif "api.anthropic.com" in url:
        # Claude chiamato dalla pagina, con la chiave della persona: Anthropic lo permette con questa intestazione
        xhr.setRequestHeader("anthropic-dangerous-direct-browser-access", "true")
    if corpo is not None and not isinstance(corpo, (bytes, bytearray, memoryview)):
        corpo = corpo.read() if hasattr(corpo, "read") else str(corpo).encode("utf-8")
    try:
        xhr.send(to_js(bytes(corpo)) if corpo is not None else None)
    except Exception as e:
        raise urllib.error.URLError(str(e)) from None
    if not xhr.status:
        raise urllib.error.URLError("rete")
    risposta = xhr.response
    b = risposta.to_bytes() if risposta is not None else b""
    testa = _testa(xhr.getAllResponseHeaders())
    if xhr.status >= 300:
        raise urllib.error.HTTPError(url, xhr.status, str(xhr.statusText or ""), testa, io.BytesIO(b))
    return _Risposta(url, xhr.status, testa, b)


urllib.request.urlopen = urlopen


# ===================================================================================== file per la pagina
_blob = {}


def registra(percorso):
    """Al posto del piccolo server dei video del PC: un indirizzo blob: per audio, slide e immagini."""
    p = Path(str(percorso))
    if not p.is_file():
        return None
    st = p.stat()
    k = (str(p), st.st_mtime, st.st_size)
    if k not in _blob:
        _blob[k] = str(js.vmBlob(str(p)))
    return _blob[k]


# ===================================================================================== Google Drive
def _prepara_drive():
    import nuvola as nv

    def rinnova(self):
        t = js.vmToken()
        if not t or not t.token:
            raise nv.ErroreAccesso()
        return {"access_token": str(t.token), "expires_in": max(60, int(t.resta or 0))}

    def email(self):
        return str(js.vmEmail() or "")

    carica_grande = nv.Drive.carica

    def carica(self, cid, nome, sorgente, fid=None):
        """Fino a 5 MB in una richiesta sola (multipart); oltre, a pezzi come sul PC."""
        dati = bytes(sorgente) if isinstance(sorgente, (bytes, bytearray)) else None
        n = len(dati) if dati is not None else os.path.getsize(sorgente)
        if n > 5 * 1024 * 1024:
            return carica_grande(self, cid, nome, sorgente, fid)
        if dati is None:
            dati = Path(sorgente).read_bytes()
        meta = {"name": nome} if fid else {"name": nome, "parents": [cid]}
        conf = "vm" + secrets.token_hex(12)
        corpo = (f"--{conf}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{json.dumps(meta)}\r\n"
                 f"--{conf}\r\nContent-Type: application/octet-stream\r\n\r\n").encode("utf-8") + dati + f"\r\n--{conf}--".encode()
        return self._req("PATCH" if fid else "POST",
                         f"{self.SU}/files" + (f"/{fid}" if fid else "") + "?uploadType=multipart&fields=id",
                         dati=corpo, testa={"Content-Type": f"multipart/related; boundary={conf}"}, tempo=600)

    nv.Drive._rinnova = rinnova
    nv.Drive.email = email
    nv.Drive.carica = carica


# ===================================================================================== avvio
M = None          # il motore
API = None        # finestra_web.Api


def avvia(lingua, chiave_zip, email_, prima_volta):
    """Prepara il motore. chiave_zip = la password di Sincronizza (gia' controllata dalla pagina)."""
    global M, API
    sys.path[:0] = [CARTELLA_APP, CARTELLA_APP + "/_vendor"]
    os.environ["HOME"] = "/dati"
    lingua = "it" if str(lingua).lower().startswith("it") else "en"
    # la configurazione prima del motore: lingua, privacy (detta nella pagina di accesso), Drive collegato
    cfg_f = Path("/dati/.config/RegistraLezione/config.json")
    cfg = {}
    if cfg_f.exists():
        try:
            cfg = json.loads(cfg_f.read_text(encoding="utf-8"))
        except ValueError:
            cfg = {}
    cfg.setdefault("lingua", lingua)
    cfg.setdefault("privacy_ok", time.strftime("%Y-%m-%dT%H:%M:%S"))
    cfg.setdefault("rapporti_errori", False)
    n = dict(cfg.get("nuvola") or {})
    n.update(provider="google", refresh="web", email=str(email_ or ""), chiave=str(chiave_zip), solo_wifi=False)
    n.pop("no", None)
    cfg["nuvola"] = n
    cfg["sync_dispositivi"] = []
    cfg_f.parent.mkdir(parents=True, exist_ok=True)
    cfg_f.write_text(json.dumps(cfg, ensure_ascii=False), encoding="utf-8")

    import android_motore as am
    mt = am._prepara(CARTELLA_APP, lingua)
    import servi_video
    servi_video.registra = registra
    import aggiorna as agg
    agg.cerca = lambda *a, **k: None
    import rapporti
    rapporti.segnala = lambda *a, **k: None
    _prepara_drive()
    import nuvola as nv
    nv.credenziali = lambda: {"google": {"id": "web"}, "microsoft": None}

    import finestra_web as fw
    API = fw.Api()
    API._win = types.SimpleNamespace(evaluate_js=lambda *a: None, minimize=lambda: None, restore=lambda: None,
                                     show=lambda: None, destroy=lambda: None)
    am._api_android(API, mt)
    API._carica()
    M = API._m
    if M is None:
        return {"ok": False, "errore": API._errore or "motore"}
    M.aspetta_carica = False
    am._stato_android(M)
    M.nome_dispositivo = lambda: "Web"
    _ripara_stato(M)
    return {"ok": True}


def _ripara_stato(m):
    """Sul web non ci sono batteria ne' registrazione: lo stato dice solo che e' il web."""
    base = m.stato

    def stato():
        s = base()
        s.update(web=True, android=False, in_carica=True, avviso=s.get("avviso") if not s.get("registro") else "")
        return s
    m.stato = stato


# ===================================================================================== la pagina chiama
def chiama(nome, argomenti):
    """Una funzione delle pagine (le stesse di window.pywebview.api sul PC). Torna il risultato in JSON."""
    try:
        if nome.startswith("_") or not hasattr(API, nome):
            raise AttributeError(nome)
        r = getattr(API, nome)(*json.loads(argomenti or "[]"))
    except Exception as e:
        log.exception("api %s", nome)
        r = {"ok": False, "errore": str(e)}
    try:
        _passo()
        return json.dumps(r)
    except TypeError:
        return json.dumps(r, default=str)


def _passo():
    if M is not None:
        try:
            M._passo(0)
        except Exception:
            log.exception("passo")


class _Basta(Exception):
    pass


class _CodaSoloOra:
    """La coda degli appunti letta fino a quando e' vuota (poi il «lavoratore» si ferma)."""

    def __init__(self, q):
        self.q = q

    def get(self, *a, **k):
        try:
            return self.q.get_nowait()
        except Exception:
            raise _Basta() from None

    def __getattr__(self, n):
        return getattr(self.q, n)


def pompa():
    """I lavori in attesa (quelli che sul PC partono in un thread), uno alla volta. Torna True se ne restano."""
    if _pendenti:
        t = _pendenti.pop(0)
        _esegui(t)
        _passo()
        return bool(_pendenti) or not M.lavori_appunti.empty()
    if M is not None and not M.lavori_appunti.empty():
        vera = M.lavori_appunti
        M.lavori_appunti = _CodaSoloOra(vera)
        try:
            M._lavoratore_appunti()
        except _Basta:
            pass
        finally:
            M.lavori_appunti = vera
        _passo()
    return bool(_pendenti)


def occupato():
    return bool(_pendenti) or (M is not None and not M.lavori_appunti.empty())


# ===================================================================================== Drive
def giro():
    """Un giro con il Drive: scarica le novita' e rimanda su ripasso, voti, appunti cambiati."""
    if M is None:
        return json.dumps({"ok": False, "errore": "motore"})
    M._nv()
    M._nv_stato = _StatoFase(M._nv_stato)
    M._nv_giro()
    st = dict(M._nv_stato)
    return json.dumps({"ok": not st.get("errore"), "errore": st.get("errore") or "", "giro": st.get("giro")}, default=str)


class _StatoFase(dict):
    """Lo stato del giro: ogni passo avanti arriva subito alla pagina (la barra «Apro le tue lezioni»)."""

    def update(self, *a, **k):
        super().update(*a, **k)
        if "fase" in k:
            js.vmFase(float(k["fase"] or 0))


def fase():
    st = getattr(M, "_nv_stato", None) or {}
    return float(st.get("fase") or 0)


def controlla_password(chiave):
    """Prima di aprire: la password e' giusta? (si legge solo la verifica in chiaro di indice.json)."""
    sys.path[:0] = [CARTELLA_APP, CARTELLA_APP + "/_vendor"]
    os.environ["HOME"] = "/dati"
    _prepara_drive()
    import nuvola as nv
    try:
        c = nv.Drive("web")
        # la cartella la cerco soltanto: se non c'e', il programma non ha ancora sincronizzato (non la creo io)
        q = urllib.parse.quote(f"name='{nv.CARTELLA}' and mimeType='application/vnd.google-apps.folder' and trashed=false")
        r = c._req("GET", f"{c.API}/files?q={q}&fields=files(id)&spaces=drive")
        if not r.get("files"):
            return json.dumps({"ok": False, "errore": "vuoto"})
        ind = c.leggi_json(nv.INDICE, c.elenco(r["files"][0]["id"])) or {}
        if not ind.get("verifica"):
            return json.dumps({"ok": False, "errore": "vuoto"})
        return json.dumps({"ok": bool(nv.chiave_giusta(str(chiave), ind["verifica"])), "errore": ""})
    except nv.ErroreAccesso:
        return json.dumps({"ok": False, "errore": "accesso"})
    except Exception as e:
        log.exception("password")
        return json.dumps({"ok": False, "errore": nv.motivo(e), "dettaglio": traceback.format_exc()[-600:]})
