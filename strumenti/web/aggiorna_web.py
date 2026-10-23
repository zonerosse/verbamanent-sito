# -*- coding: utf-8 -*-
"""
Verba Manent sul web (verbamanent.app/studia/): copia nel sito le pagine e il motore del programma.

Il programma non si cambia: da registra-lezione si prende solo una copia dei file
  app/interfaccia/*     -> static/studia/           (le stesse pagine; i video della guida no)
  app/*.py, _vendor     -> static/studia/py/rl.zip  (il motore, con i font dei PDF dell'app Android)
e si aggiunge quello che serve al browser (strumenti/web/pagina e strumenti/web/py):
  web.js, web.css, worker.js  -> le schermate di accesso, la riga in basso, il motore in un worker
  py/java.py, py/web_motore.py -> dentro rl.zip: il motore adattato al browser
Pyodide (Python per il browser) sta in static/studia/pyodide/: solo i file che servono.

Uso: python strumenti/web/aggiorna_web.py ../registra-lezione CARTELLA_PYODIDE CARTELLA_RUOTE
     (CARTELLA_PYODIDE = release 0.27.7 scompattata; CARTELLA_RUOTE = fpdf2 2.8.9 e defusedxml 0.7.1)
"""
import hashlib
import json
import re
import shutil
import sys
import time
import zipfile
from pathlib import Path

SITO = Path(__file__).resolve().parents[2]
QUI = Path(__file__).resolve().parent
DEST = SITO / "static" / "studia"
PYODIDE = ["pyodide.js", "pyodide.asm.js", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"]
PACCHETTI = ["numpy-2.0.2-cp312-cp312-pyodide_2024_0_wasm32.whl", "pillow-10.2.0-cp312-cp312-pyodide_2024_0_wasm32.whl",
             "fonttools-4.51.0-py3-none-any.whl", "ssl-1.0.0-cp312-cp312-pyodide_2024_0_wasm32.whl", "openssl-1.1.1w.zip",
             "sqlite3-1.0.0-cp312-cp312-pyodide_2024_0_wasm32.whl",
             "hashlib-1.0.0-cp312-cp312-pyodide_2024_0_wasm32.whl"]
RUOTE = ["fpdf2-2.8.9-py3-none-any.whl", "defusedxml-0.7.1-py2.py3-none-any.whl"]
# file del programma che sul web non servono (finestre del PC, prove, registrazione dal vivo)
NO_PY = {"prova_exe.py", "classica.py", "registra_lezione.py", "manca_edge.py"}
NO_PAGINE = {"video", "mini.html"}


def main():
    rl, pyo, ruote = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve(), Path(sys.argv[3]).resolve()
    app = rl / "app"
    versione = json.loads((app / "versione.json").read_text(encoding="utf-8"))["versione"]

    # 1. le pagine del programma
    for p in DEST.iterdir() if DEST.exists() else []:
        if p.name not in ("prova", "pyodide", "zipaes.js"):
            shutil.rmtree(p) if p.is_dir() else p.unlink()
    DEST.mkdir(parents=True, exist_ok=True)
    for p in (app / "interfaccia").iterdir():
        if p.name in NO_PAGINE or p.name == "__pycache__":
            continue
        (shutil.copytree if p.is_dir() else shutil.copy2)(p, DEST / p.name)
    for n in ("web.js", "web.css", "worker.js"):
        shutil.copy2(QUI / "pagina" / n, DEST / n)

    # 2. il motore: un solo zip
    (DEST / "py").mkdir(exist_ok=True)
    zp = DEST / "py" / "rl.zip"
    with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for p in sorted(app.rglob("*")):
            r = p.relative_to(app)
            if p.is_dir() or "__pycache__" in r.parts or r.parts[0] == "interfaccia" or r.name in NO_PY:
                continue
            if r.suffix in (".ico", ".exe", ".log"):
                continue
            z.write(p, r.as_posix())
        for p in sorted((rl / "android" / "risorse" / "font").iterdir()):
            z.write(p, "font/" + p.name)
        for p in sorted((QUI / "py").glob("*.py")):
            z.write(p, p.name)
    for n in RUOTE:
        shutil.copy2(ruote / n, DEST / "py" / n)

    # 3. Pyodide (solo i file usati)
    (DEST / "pyodide").mkdir(exist_ok=True)
    for n in PYODIDE + PACCHETTI:
        if not (DEST / "pyodide" / n).exists() or (DEST / "pyodide" / n).stat().st_size != (pyo / n).stat().st_size:
            shutil.copy2(pyo / n, DEST / "pyodide" / n)

    # 4. la pagina: le stesse del programma, con web.css e web.js; un numero di versione contro la cache
    h = hashlib.sha256()
    for p in sorted(DEST.rglob("*")):
        if p.is_file() and "pyodide" not in p.parts and "prova" not in p.parts and p.name != "index.html":
            h.update(p.name.encode())
            h.update(p.read_bytes())
    v = h.hexdigest()[:10]
    ind = (app / "interfaccia" / "index.html").read_text(encoding="utf-8")
    ind = ind.replace("<head>", '<head>\n<meta name="robots" content="noindex,nofollow">', 1)
    ind = re.sub(r"<title>.*?</title>", "<title>Verba Manent sul web</title>", ind, count=1, flags=re.S)
    ind = ind.replace('href="stile.css"', f'href="stile.css?v={v}"').replace(
        f'href="stile.css?v={v}">', f'href="stile.css?v={v}">\n<link rel="stylesheet" href="web.css?v={v}">', 1)
    for js in ("testi.js", "guida.js", "android.js", "qrcode.js", "app.js"):
        ind = ind.replace(f'<script src="{js}"></script>', f'<script src="{js}?v={v}"></script>')
    ind = ind.replace(f'<script src="app.js?v={v}"></script>', f'<script src="web.js?v={v}"></script>\n<script src="app.js?v={v}"></script>', 1)
    assert "web.js" in ind and "web.css" in ind, "index.html del programma cambiato: aggiorna aggiorna_web.py"
    (DEST / "index.html").write_text(ind, encoding="utf-8")
    # Scripta Manent sul web (verbamanent.app/scripta/): una copia delle pagine (circa 3 MB); Pyodide e il motore
    # li prende da /studia/ (vedi worker.js), cosi' non si scaricano due volte
    smd = SITO / "static" / "scripta"
    shutil.rmtree(smd, ignore_errors=True)
    shutil.copytree(DEST, smd, ignore=shutil.ignore_patterns("pyodide", "py", "prova"))
    sm = re.sub(r"<title>.*?</title>", "<title>Scripta Manent sul web</title>", ind, count=1, flags=re.S)
    sm = sm.replace(f'<script src="web.js?v={v}"></script>', f'<script>window.VM_EDIZIONE = "scripta";</script>\n<script src="web.js?v={v}"></script>', 1)
    assert "VM_EDIZIONE" in sm
    (smd / "index.html").write_text(sm, encoding="utf-8")
    (DEST / "versione-web.json").write_text(json.dumps({"programma": versione, "web": v, "data": time.strftime("%Y-%m-%d")}),
                                           encoding="utf-8")
    print(f"studia: programma {versione}, web {v}, rl.zip {zp.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
