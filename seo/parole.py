"""Chiede a DataForSEO i volumi di ricerca (Italia, italiano) delle parole in seo/parole.txt
e le idee collegate ai semi in seo/semi.txt. Scrive seo/volumi.csv e seo/idee.csv.
Credenziali dai segreti del repository: DATAFORSEO_LOGIN e DATAFORSEO_PASSWORD."""
import base64, csv, json, os, sys, urllib.error, urllib.request

LOGIN, PWD = os.environ.get("DATAFORSEO_LOGIN"), os.environ.get("DATAFORSEO_PASSWORD")
def errore(msg):
    open(os.path.join("seo", "errore.txt"), "w", encoding="utf-8").write(msg + "\n")
    sys.exit(msg)


if not LOGIN or not PWD:
    errore("Mancano i segreti DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD")
AUTH = "Basic " + base64.b64encode(f"{LOGIN}:{PWD}".encode()).decode()
BASE = "https://api.dataforseo.com/v3/keywords_data/google_ads/"
LUOGO = {"location_code": 2380, "language_code": "it"}   # Italia, italiano


def chiama(endpoint, corpo):
    req = urllib.request.Request(BASE + endpoint, data=json.dumps([corpo]).encode(),
                                 headers={"Authorization": AUTH, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            d = json.load(r)
    except urllib.error.HTTPError as e:
        errore(f"DataForSEO HTTP {e.code}: {e.read()[:500]!r}")
    t = d["tasks"][0]
    if t["status_code"] != 20000:
        errore(f"DataForSEO: {t['status_code']} {t['status_message']}")
    print(f"{endpoint}: costo {d.get('cost')} $")
    return t.get("result") or []


def leggi(nome):
    p = os.path.join("seo", nome)
    if not os.path.exists(p):
        return []
    return [r.strip() for r in open(p, encoding="utf-8") if r.strip() and not r.startswith("#")]


def scrivi(nome, righe):
    righe.sort(key=lambda r: -(r["search_volume"] or 0))
    with open(os.path.join("seo", nome), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["parola", "ricerche_mese", "concorrenza", "cpc_euro"])
        for r in righe:
            w.writerow([r["keyword"], r["search_volume"] or 0, r.get("competition") or "", r.get("cpc") or ""])


parole = leggi("parole.txt")
if parole:
    scrivi("volumi.csv", chiama("search_volume/live", {**LUOGO, "keywords": parole}))
semi = leggi("semi.txt")
if semi:
    idee = chiama("keywords_for_keywords/live", {**LUOGO, "keywords": semi[:20], "sort_by": "search_volume"})
    scrivi("idee.csv", [r for r in idee if (r.get("search_volume") or 0) >= 10][:400])

p = os.path.join("seo", "errore.txt")
if os.path.exists(p):
    os.remove(p)
