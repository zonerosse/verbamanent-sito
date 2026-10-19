/* Verba Manent sul web: il motore del programma (Python) dentro il browser, con Pyodide.
   Gira in un Web Worker, cosi' la pagina resta libera mentre il motore lavora (Drive, Claude, PDF).
   Messaggi dalla pagina: {id, tipo, ...} -> risposta {id, r} oppure {id, errore}.
   Messaggi verso la pagina senza id: {evento: 'apri' | 'link' | 'fase' | 'ricarica', ...}. */
'use strict';
const V = new URL(location.href).searchParams.get('v') || '0';
importScripts('pyodide/pyodide.js?v=' + V);

let py = null, wm = null, token = null, scade = 0, email = '', ricorda = false, salvare = false;

// ---------------------------------------------------------------- funzioni che Python chiama (java.py, web_motore.py)
const MIME = {pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif',
  m4a: 'audio/mp4', mp4: 'video/mp4', mp3: 'audio/mpeg', wav: 'audio/wav', webm: 'video/webm', txt: 'text/plain;charset=utf-8',
  html: 'text/html;charset=utf-8', csv: 'text/csv;charset=utf-8', json: 'application/json', zip: 'application/zip',
  apkg: 'application/octet-stream', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ics: 'text/calendar'};
const tipo = p => MIME[(p.split('.').pop() || '').toLowerCase()] || 'application/octet-stream';
self.vmBlob = p => URL.createObjectURL(new Blob([py.FS.readFile(p)], {type: tipo(p)}));
self.vmApri = (p, scarica) => {
  try {
    if (py.FS.isDir(py.FS.stat(p).mode)) return false;
    postMessage({evento: 'apri', url: self.vmBlob(p), nome: p.split('/').pop(), scarica: !!scarica});
    return true;
  } catch (e) { return false; }
};
self.vmLink = u => postMessage({evento: 'link', url: String(u)});
self.vmRicarica = () => postMessage({evento: 'ricarica'});
self.vmToken = () => token && Date.now() < scade ? {token, resta: Math.floor((scade - Date.now()) / 1000)} : null;
self.vmEmail = () => email;
let famiglia = false;
self.vmFamiglia = () => famiglia;
self.vmFase = f => postMessage({evento: 'fase', f: Number(f) || 0});

// ---------------------------------------------------------------- avvio
async function carica(m) {
  ricorda = !!m.ricorda;
  py = await loadPyodide({indexURL: new URL('pyodide/', location.href).href});
  const pacchetti = py.loadPackage(['numpy', 'pillow', 'fonttools', 'ssl', 'hashlib', 'sqlite3', 'py/fpdf2-2.8.9-py3-none-any.whl', 'py/defusedxml-0.7.1-py2.py3-none-any.whl'].map(
    x => x.startsWith('py/') ? new URL(x, location.href).href : x), {messageCallback: () => {}});
  const rl = fetch('py/rl.zip?v=' + V).then(r => { if (!r.ok) throw new Error('rl.zip ' + r.status); return r.arrayBuffer(); });
  py.FS.mkdirTree('/dati');
  if (ricorda) {          // «Ricorda su questo computer»: le lezioni restano nel browser (IndexedDB) fino a «Esci»
    py.FS.mount(py.FS.filesystems.IDBFS, {}, '/dati');
    await new Promise(ok => py.FS.syncfs(true, () => ok()));
  }
  py.unpackArchive(await rl, 'zip', {extractDir: '/rl'});
  await pacchetti;
  py.runPython("import sys; sys.path[:0] = ['/rl', '/rl/_vendor']");
  wm = py.pyimport('web_motore');
  return true;
}

// la configurazione salvata (solo con «Ricorda»): password degli zip e chiave di Claude
function salvato() {
  try {
    const c = JSON.parse(py.FS.readFile('/dati/.config/RegistraLezione/config.json', {encoding: 'utf8'}));
    return {chiave: (c.nuvola || {}).chiave || '', email: (c.nuvola || {}).email || '', claude: !!c.chiave};
  } catch (e) { return {}; }
}

async function salva() {
  if (!ricorda || !py) return;
  salvare = false;
  await new Promise(ok => py.FS.syncfs(false, () => ok()));
}

// ---------------------------------------------------------------- lavori in attesa (sul PC sarebbero thread)
let pompando = false;
function pompa() {
  if (pompando || !wm) return;
  pompando = true;
  setTimeout(() => {
    let ancora = false;
    try { ancora = wm.pompa(); } catch (e) { console.error(e); }
    pompando = false;
    salvare = true;
    if (ancora) pompa(); else salva();
  }, 0);
}
setInterval(() => { if (salvare) salva(); }, 20000);

// ---------------------------------------------------------------- messaggi dalla pagina
const fa = {
  async carica(m) { await carica(m); return salvato(); },
  token(m) { token = m.token || null; scade = Date.now() + Math.max(0, (m.resta || 0) - 60) * 1000; if (m.email) email = m.email; return true; },
  famiglia(m) { famiglia = !!m.si; return famiglia; },
  password(m) { return JSON.parse(wm.controlla_password(m.chiave)); },
  async avvia(m) {
    if (m.ricorda && !ricorda) {     // «Ricorda» scelto adesso: da qui in poi le lezioni restano nel browser
      ricorda = true;
      py.FS.mount(py.FS.filesystems.IDBFS, {}, '/dati');
      await new Promise(ok => py.FS.syncfs(true, () => ok()));
    }
    const r = wm.avvia(m.lingua, m.chiave, email, !!m.prima);
    return r.toJs({dict_converter: Object.fromEntries});
  },
  giro() {
    try { return JSON.parse(wm.giro()); } finally { salvare = true; salva(); }
  },
  chiama(m) {
    const r = wm.chiama(m.nome, JSON.stringify(m.args || []));
    if (wm.occupato()) pompa(); else salvare = true;
    return JSON.parse(r);
  },
  async salva() { await salva(); return true; },
  async esci() {
    if (ricorda) { try { py.FS.unmount('/dati'); } catch (e) {} await new Promise(ok => { const r = indexedDB.deleteDatabase('/dati'); r.onsuccess = r.onerror = r.onblocked = () => ok(); }); }
    return true;
  },
};

onmessage = async e => {
  const m = e.data;
  try {
    const r = await fa[m.tipo](m);
    postMessage({id: m.id, r});
  } catch (err) {
    postMessage({id: m.id, errore: String(err && err.message || err)});
  }
};
