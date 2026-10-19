"""Il «PC» finto: fa un giro di Sincronizza verso un Drive finto salvato in una cartella (drive/stato.json + file).
Uso: python drive_pc.py BASE_PC DRIVE  (crea o aggiorna il Drive), stampa le unita'."""
import io, json, sys, os
from pathlib import Path
B, D = Path(sys.argv[1]), Path(sys.argv[2])
os.environ["HOME"] = str(B.parent / "home"); Path(os.environ["HOME"]).mkdir(exist_ok=True)
sys.path.insert(0, "/home/claude/registra-lezione/app")
import nuvola as nv
CHIAVE = "ABCD-EFGH-JKLM-NPQR"
class CloudCartella(nv.Cloud):
    def __init__(self):
        super().__init__("finto"); D.mkdir(exist_ok=True)
        self.f = D / "stato.json"; self.s = json.loads(self.f.read_text()) if self.f.exists() else {"n": 0, "file": {}}
    def _salva(self): self.f.write_text(json.dumps(self.s, indent=1))
    def token(self): return "finto"
    def cartella(self):
        for i, x in self.s["file"].items():
            if x["name"] == nv.CARTELLA and x.get("folder"): return i, False
        self.s["n"] += 1; i = "cart%d" % self.s["n"]; self.s["file"][i] = {"name": nv.CARTELLA, "folder": True, "parents": []}; self._salva(); return i, True
    def elenco(self, cid):
        return {x["name"]: {"id": i, "s": (D / i).stat().st_size} for i, x in self.s["file"].items() if cid in x.get("parents", [])}
    def _url_file(self, fid): return io.BytesIO((D / fid).read_bytes())
    def carica(self, cid, nome, sorgente, fid=None):
        b = bytes(sorgente) if isinstance(sorgente, (bytes, bytearray)) else Path(sorgente).read_bytes()
        if not fid:
            self.s["n"] += 1; fid = "f%d" % self.s["n"]; self.s["file"][fid] = {"name": nome, "parents": [cid]}
        else: self.s["file"][fid]["name"] = nome
        (D / fid).write_bytes(b); self._salva(); return {"id": fid}
    def elimina(self, fid): self.s["file"].pop(fid); (D / fid).unlink(missing_ok=True); self._salva()
pac = B.parent / "pacchetti"; pac.mkdir(exist_ok=True)
r = nv.giro(CloudCartella(), B, pac, {}, {}, CHIAVE, nome_disp="PC")
print(json.dumps(r, default=str)[:400])
