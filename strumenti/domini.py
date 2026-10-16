"""Controlla con whois quali domini dell'elenco strumenti/domini.txt sono liberi.
Scrive strumenti/domini.csv (dominio, stato, dettaglio)."""
import csv, re, subprocess, time

LIBERO = re.compile(r"no match|not found|no data found|no entries found|status:\s*available|domain not found|is free|no object found|^%% no match", re.I | re.M)
OCCUPATO = re.compile(r"creation date|created:|registered:|registrar:|status:\s*(ok|active|client)|domain status", re.I)

righe = []
for d in [r.strip() for r in open("strumenti/domini.txt") if r.strip() and not r.startswith("#")]:
    try:
        out = subprocess.run(["whois", d], capture_output=True, text=True, timeout=40).stdout
    except Exception as e:
        out = f"ERRORE {e}"
    if LIBERO.search(out):
        stato = "LIBERO"
    elif OCCUPATO.search(out):
        stato = "occupato"
    else:
        stato = "?"
    m = re.search(r"(creation date|created|registered)[^:\n]*:\s*(.+)", out, re.I)
    righe.append([d, stato, (m.group(2).strip()[:40] if m else "")])
    print(d, stato)
    time.sleep(2)
with open("strumenti/domini.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["dominio", "stato", "registrato_dal"]); w.writerows(righe)
