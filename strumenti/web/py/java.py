# -*- coding: utf-8 -*-
"""
Il «ponte» per Verba Manent sul web, con gli stessi nomi del ponte Android (Ponte, Registrazione, Whisper),
cosi' android_motore.py prepara il motore senza cambiarlo. Qui il telefono non c'e': c'e' il browser.
Sul web non si registra e non si trascrive: le lezioni arrivano gia' fatte dal Google Drive.
"""
import base64
from pathlib import Path

import js            # le funzioni del worker (worker.js)

DATI = Path("/dati")
CACHE = Path("/tmp/vm")
DATI.mkdir(parents=True, exist_ok=True)
CACHE.mkdir(parents=True, exist_ok=True)


def jfloat(x):
    return float(x)


def jarray(_tipo):
    return lambda x: list(x)


class _Ponte:
    def contesto(self):
        return None

    def cartellaDati(self):
        return str(DATI)

    def cartellaCache(self):
        return str(CACHE)

    def versione(self):
        return "web"

    def codice(self):
        return 0

    def getScaricati(self):
        return 0

    def getTotale(self):
        return 0

    def riavvia(self):
        js.vmRicarica()

    def inCarica(self):
        return True

    def batteria(self):
        return 100

    def apri(self, percorso):
        """Apre il file in una scheda nuova del browser (PDF, immagini) o lo scarica."""
        return bool(js.vmApri(str(percorso), False))

    def condividi(self, percorso):
        """«Mostra» / «Manda»: sul web il file si scarica."""
        return bool(js.vmApri(str(percorso), True))

    def apriLink(self, url):
        js.vmLink(str(url))

    def scegliFile(self, _tipo):
        return ""

    def scarica(self, _url, _dest):
        return "web"

    def pdfInPng(self, _pdf, _cartella, _larghezza):
        return 0

    def unisciAudio(self, _wavs, _uscita):
        return False

    # la chiave di Claude resta nella memoria di questa pagina (o del browser, se si chiede di ricordarla)
    def cifra(self, testo):
        return base64.b64encode(str(testo).encode("utf-8")).decode("ascii")

    def decifra(self, dati):
        return base64.b64decode(str(dati)).decode("utf-8")

    def notifica(self, _titolo, _testo):
        pass

    def email(self, *_a):
        return False

    def evento(self, *_a):
        return False

    def sveglia(self, *_a):
        pass

    def togliSveglia(self, *_a):
        pass

    def tagliaAudio(self, *_a):
        return False

    def decodificaWav(self, *_a):
        return False

    def impronta(self, *_a):
        return None


class _Registrazione:
    @staticmethod
    def tieniSveglio(*_a):
        pass

    @staticmethod
    def livelloAdesso():
        return 0.0


class _Whisper:
    pass


_CLASSI = {"Ponte": _Ponte(), "Registrazione": _Registrazione, "Whisper": _Whisper}


def jclass(nome):
    return _CLASSI.get(str(nome).rsplit(".", 1)[-1], _Whisper)
