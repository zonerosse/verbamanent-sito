/* Verba Manent sul web: le pagine sono quelle del programma; qui sotto c'e' solo cio' che serve al browser.
   1. accesso con Google (solo i file che Verba Manent ha creato nel Drive: permesso drive.file)
   2. la password degli zip (quella di Impostazioni › Sincronizza)
   3. le lezioni prese dal Drive e aperte qui, con il motore del programma che gira nel browser (worker.js)
   4. la chiave di Claude, se si vogliono Chiedi, il tutor, i test e l'interrogazione
   Niente passa da un nostro server: Drive e Claude rispondono direttamente a questa pagina. */
'use strict';
(function () {
const CLIENT_ID = '303488426536-mqi6a2cd59sis931tb6nmmltrjfrclkf.apps.googleusercontent.com';
const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const V = (document.currentScript && new URL(document.currentScript.src).searchParams.get('v')) || '0';
const IT = (navigator.language || 'it').toLowerCase().startsWith('it');
const T = IT ? {
  titolo: 'Verba Manent sul web',
  intro: 'Studia le tue lezioni da qualsiasi computer. Si aprono qui, nel browser: non passano da nessun nostro server.',
  accedi: 'Accedi con Google',
  accedi_p: 'Usa lo stesso account Google collegato in Verba Manent (Impostazioni › Sincronizza). Verba Manent vede solo i file che ha creato lui.',
  carico: 'Preparo il programma nel browser…',
  pw_t: 'La password degli zip', pw_p: 'È quella di Sincronizza: la trovi nel programma, in Impostazioni › Sincronizza.',
  ricorda: 'Ricorda su questo computer',
  pw_ok: 'Apri le mie lezioni',
  pw_pic: "Sul computer dell'università lascia la casella vuota: quando chiudi la pagina, la password e le lezioni spariscono.",
  pw_no: 'Password sbagliata: controlla in Impostazioni › Sincronizza sul PC o sul telefono.',
  vuoto: 'Nel tuo Google Drive non ci sono ancora lezioni di Verba Manent. Sul PC o sul telefono apri Impostazioni › Sincronizza, accedi con questo account e tocca «Sincronizza adesso».',
  rete: 'Il Google Drive non risponde. Controlla la connessione e riprova.',
  accesso: "L'accesso a Google è scaduto: accedi di nuovo.",
  giu_t: 'Apro le tue lezioni…', giu_p: 'Le prendo dal tuo Google Drive e le apro qui, con la tua password.',
  giu_pic: 'Le video-registrazioni restano sul PC: qui arrivano appunti, trascrizione, audio e slide.',
  giu_prima: 'La prima volta ci vuole qualche minuto: scarico tutte le lezioni.',
  avanti: 'Avanti', riprova: 'Riprova',
  cl_t: 'Le funzioni con Claude', cl_p: "Chiedi, il tutor, i test e l'interrogazione usano Claude. Sul web serve la tua chiave.",
  cl_1: 'La chiave resta solo in questa pagina e va direttamente a Claude', cl_2: 'Non passa da nessun nostro server',
  cl_3: 'Quando esci, sparisce, a meno che tu chieda di ricordarla',
  incolla: '📋 Incolla', incolla_no: 'Premi Ctrl+V per incollare',
  pw_dove: 'Dove la trovo?', pw_d1: 'Sul PC apri <b>Verba Manent</b>.', pw_d2: 'Vai in <b>Impostazioni › Sincronizza › Apri…</b>',
  pw_d3: 'Sotto <b>🔑 La password degli zip</b>: selezionala, copiala (Ctrl+C) e torna qui.', pw_d4: 'Sul telefono: Impostazioni › Sincronizza, stesso posto.',
  cl_vai: 'Apri la pagina delle chiavi di Claude ↗', cl_d1: 'Accedi con il tuo account di Claude.',
  cl_d2: 'In «Chiavi API» tocca <b>Crea chiave</b> (in inglese: Create Key), chiamala <b>Verba Manent web</b> e tocca <b>Copia</b>.',
  cl_d3: 'Torna qui: la chiave si incolla da sola (o tocca <b>📋 Incolla</b>).',
  cl_d4: 'Le chiavi che hai già (per esempio quella del programma sul PC) Claude le mostra nascoste e non si possono copiare: creane una nuova. Le vecchie continuano a funzionare.',
  cl_ok: 'Usa questa chiave', cl_dopo: 'Più tardi: per ora studio senza Claude', cl_no: 'Questa chiave non funziona: controllala e riprova.',
  bar: 'Verba Manent sul web', esci: 'Esci', salva: 'Salva nel Drive', salvato: 'Salvato nel Drive alle', salvo: 'Salvo nel Drive…',
  riaccedi: 'Accedi di nuovo per salvare', non_salvato: 'Il ripasso di oggi non è ancora nel Drive.',
  esci_t: 'Vuoi uscire?', esci_p: 'Salvo nel Drive quello che hai fatto, poi chiudo. Su questo computer non resta niente.',
  esci_p2: 'Salvo nel Drive quello che hai fatto, poi chiudo. Le lezioni restano su questo computer fino a quando esci.',
  annulla: 'Annulla', apri_file: 'Il file è pronto', apri_file_b: 'Apri',
  video: 'Il video è sul PC: qui ci sono audio, trascrizione e slide.',
  errore: 'Qualcosa non è andato: ', browser: 'Questo browser è troppo vecchio per Verba Manent sul web: usa Chrome, Edge, Firefox o Safari aggiornati.',
} : {
  titolo: 'Verba Manent on the web',
  intro: 'Study your lectures from any computer. They open here, in the browser: they never go through a server of ours.',
  accedi: 'Sign in with Google',
  accedi_p: 'Use the same Google account linked in Verba Manent (Settings › Sync). Verba Manent only sees the files it created.',
  carico: 'Getting the program ready in the browser…',
  pw_t: 'The zip password', pw_p: "It's the Sync password: you find it in the program, under Settings › Sync.",
  ricorda: 'Remember on this computer',
  pw_ok: 'Open my lectures',
  pw_pic: 'On a university computer leave the box unticked: when you close the page, the password and the lectures disappear.',
  pw_no: 'Wrong password: check Settings › Sync on your PC or phone.',
  vuoto: 'There are no Verba Manent lectures in your Google Drive yet. On your PC or phone open Settings › Sync, sign in with this account and tap «Sync now».',
  rete: 'Google Drive is not answering. Check your connection and try again.',
  accesso: 'Your Google sign-in has expired: sign in again.',
  giu_t: 'Opening your lectures…', giu_p: 'I take them from your Google Drive and open them here, with your password.',
  giu_pic: 'Video recordings stay on the PC: here you get notes, transcript, audio and slides.',
  giu_prima: 'The first time takes a few minutes: I download all your lectures.',
  avanti: 'Next', riprova: 'Try again',
  cl_t: 'The Claude features', cl_p: 'Ask, the tutor, the tests and the oral exam use Claude. On the web you need your own key.',
  cl_1: 'The key stays only in this page and goes straight to Claude', cl_2: 'It never goes through a server of ours',
  cl_3: 'When you sign out it disappears, unless you ask to remember it',
  incolla: '📋 Paste', incolla_no: 'Press Ctrl+V to paste',
  pw_dove: 'Where do I find it?', pw_d1: 'On your PC open <b>Verba Manent</b>.', pw_d2: 'Go to <b>Settings › Sync › Open…</b>',
  pw_d3: 'Under <b>🔑 The zip password</b>: select it, copy it (Ctrl+C) and come back here.', pw_d4: 'On the phone: Settings › Sync, same place.',
  cl_vai: 'Open the Claude keys page ↗', cl_d1: 'Sign in with your Claude account.',
  cl_d2: 'Tap <b>Create Key</b>, name it for example <b>Verba Manent web</b>, and tap <b>Copy</b>.',
  cl_d3: 'Come back here: the key pastes itself (or tap <b>📋 Paste</b>).',
  cl_d4: 'Keys you already have (for example the one in the PC program) are shown hidden and cannot be copied: create a new one. The old ones keep working.',
  cl_ok: 'Use this key', cl_dopo: 'Later: for now I study without Claude', cl_no: "This key doesn't work: check it and try again.",
  bar: 'Verba Manent on the web', esci: 'Sign out', salva: 'Save to Drive', salvato: 'Saved to Drive at', salvo: 'Saving to Drive…',
  riaccedi: 'Sign in again to save', non_salvato: "Today's review is not in your Drive yet.",
  esci_t: 'Sign out?', esci_p: 'I save what you did to your Drive, then I close. Nothing stays on this computer.',
  esci_p2: 'I save what you did to your Drive, then I close. The lectures stay on this computer until you sign out.',
  annulla: 'Cancel', apri_file: 'The file is ready', apri_file_b: 'Open',
  video: 'The video is on the PC: here you have audio, transcript and slides.',
  errore: 'Something went wrong: ', browser: 'This browser is too old for Verba Manent on the web: use an up-to-date Chrome, Edge, Firefox or Safari.',
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
let salvaLoc = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
let scriviLoc = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} };
document.documentElement.classList.add('web');
// tasto destro: sul web il menu del browser (Copia, Incolla...), non quello del programma, che resterebbe
// nascosto dietro le schermate di accesso e che per incollare ha bisogno di un permesso in piu'
window.addEventListener('contextmenu', e => e.stopPropagation(), true);
// schermo da telefono: le stesse pagine dell'app Android (menu in basso, tutto a una colonna)
if (!/[?&]android=1/.test(location.search) && Math.min(screen.width || 9999, window.innerWidth || 9999) < 760) {
  location.replace(location.pathname + '?android=1' + location.hash);
  return;
}

// ---------------------------------------------------------------- il motore nel worker
const W = new Worker('worker.js?v=' + V);
let nId = 0;
const attese = {};
function chiedi(tipo, dati = {}) {
  return new Promise((ok, no) => { const id = ++nId; attese[id] = {ok, no}; W.postMessage({id, tipo, ...dati}); });
}
W.onmessage = e => {
  const m = e.data;
  if (m.evento) return evento(m);
  const a = attese[m.id]; delete attese[m.id];
  if (a) m.errore !== undefined ? a.no(new Error(m.errore)) : a.ok(m.r);
};
W.onerror = e => mostraErrore(T.errore + (e.message || 'worker'));

// le stesse funzioni di window.pywebview.api del PC: arrivano al motore quando e' pronto
let pronto, prontoOk;
pronto = new Promise(ok => prontoOk = ok);
let sporco = false;
const SOLO_LETTURA = /^(stato|riepilogo|pronto|lezioni|elenco|leggi|info|cerca|stima|appunti_di|voce_|libro_info|libro_avanzamento|cal_elenco|esame_calendario|nuvola_stato|sync_stato|apri|mostra_file|video_url|letto)/;
const LOCALI = {
  cerca_aggiornamenti: () => ({}), installa_aggiornamento: () => ({}), chiudi_agg: () => ({}),
  apri_pacchetti: () => ({ok: false}), apri_base: () => ({ok: false}), esci: () => ({ok: true}),
};
window.pywebview = {api: new Proxy({}, {get: (t, n) => (...a) => {
  if (typeof n !== 'string' || n === 'then') return undefined;
  if (LOCALI[n]) return Promise.resolve(LOCALI[n](...a));
  return pronto.then(() => chiedi('chiama', {nome: n, args: a})).then(r => {
    if (!SOLO_LETTURA.test(n)) sporco = true;
    return r;
  });
}})};

// ---------------------------------------------------------------- eventi dal motore
let faseCb = null;
function evento(m) {
  if (m.evento === 'fase') { if (faseCb) faseCb(m.f); return; }
  if (m.evento === 'link') { window.open(m.url, '_blank', 'noopener'); return; }
  if (m.evento === 'ricarica') { location.reload(); return; }
  if (m.evento === 'apri') {
    if (!m.scarica && /\.(pdf|png|jpe?g|webp|txt|html)$/i.test(m.nome)) {
      const w = window.open(m.url, '_blank');
      if (w) return;
    }
    scarica(m.url, m.nome);
  }
}
function scarica(url, nome) {
  const a = document.createElement('a'); a.href = url; a.download = nome; document.body.append(a); a.click(); a.remove();
}

// ---------------------------------------------------------------- le schermate di accesso
const ov = document.createElement('div'); ov.id = 'web';
const LOGO = '<div class="wlogo">VM</div>';
function schermo(html) { ov.innerHTML = `<div class="wbox">${html}</div>`; ov.hidden = false; }
function mostraErrore(t) { const e = ov.querySelector('.werr'); if (e) e.textContent = t; else schermo(`${LOGO}<h1>${esc(T.titolo)}</h1><p class="werr">${esc(t)}</p><button class="wbtn wp" onclick="location.reload()">${esc(T.riprova)}</button>`); }
const G_SVG = '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

let ricorda = salvaLoc('vm-web-ricorda') === '1';
let caricato = null;            // il worker ha caricato Pyodide e il programma
let email = '', tok = null, salvatoPrima = {};

const SITO = IT ? {home: '/', privacy: '/privacy/', guide: '/guide/', t: ['Il sito', 'Privacy', 'Guide']}
                : {home: '/en/', privacy: '/en/privacy/', guide: '/en/guides/', t: ['Website', 'Privacy', 'Guides']};
const LINK = `<p class="wpic wlink"><a href="${SITO.home}">${SITO.t[0]}</a> · <a href="${SITO.privacy}">${SITO.t[1]}</a> · <a href="${SITO.guide}">${SITO.t[2]}</a></p>`;
function schermoAccedi(err = '') {
  schermo(`${LOGO}<h1>${esc(T.titolo)}</h1><p class="ws">${esc(T.intro)}</p><p class="werr">${esc(err)}</p>
    <button class="wbtn wg" id="wAccedi">${G_SVG}${esc(T.accedi)}</button><p class="wpic">${esc(T.accedi_p)}</p>${LINK}`);
  ov.querySelector('#wAccedi').onclick = accedi;
}

// Google Identity Services: un token per Drive (un'ora), chiesto quando serve
let gis = null, gisCb = null;
function caricaGis() {
  if (window.google && google.accounts) return Promise.resolve();
  return new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
    s.onload = ok; s.onerror = () => no(new Error('gsi')); document.head.append(s);
  });
}
async function token(prompt = '') {
  await caricaGis();
  if (!gis) gis = google.accounts.oauth2.initTokenClient({client_id: CLIENT_ID, scope: SCOPE, callback: r => gisCb && gisCb(r), error_callback: e => gisCb && gisCb({error: e.type || 'annullato'})});
  return new Promise((ok, no) => {
    gisCb = r => { gisCb = null; if (r.error || !r.access_token) return no(new Error(r.error || 'annullato')); ok(r); };
    gis.requestAccessToken({prompt, hint: email || undefined});
  });
}
async function usaToken(r) {
  tok = {token: r.access_token, scade: Date.now() + (+r.expires_in || 3600) * 1000};
  if (!email) {
    try {
      const x = await fetch('https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)', {headers: {Authorization: 'Bearer ' + tok.token}}).then(x => x.json());
      email = (x.user || {}).emailAddress || '';
    } catch (e) {}
  }
  await caricato;
  await chiedi('token', {token: tok.token, resta: +r.expires_in || 3600, email});
}

async function accedi() {
  const b = ov.querySelector('#wAccedi'); if (b) b.disabled = true;
  try { await usaToken(await token('')); }
  catch (e) { return schermoAccedi(String(e.message) === 'annullato' || /popup/.test(e.message) ? '' : T.errore + e.message); }
  if (salvatoPrima.chiave && (!salvatoPrima.email || salvatoPrima.email === email)) return apri(salvatoPrima.chiave, false);
  schermoPassword();
}

// una casella con accanto «📋 Incolla»
const campo = (id, ph, et, stile = '') => `<div class="wcampo"><input class="win" id="${id}" autocomplete="off" spellcheck="false" placeholder="${ph}" aria-label="${esc(et)}"${stile}><button class="winc" type="button" data-inc="${id}">${esc(T.incolla)}</button></div>`;
async function incolla(id, solo) {
  const i = ov.querySelector('#' + id); if (!i) return false;
  try {
    const x = (await navigator.clipboard.readText() || '').trim();
    if (solo && !solo.test(x)) return false;
    if (x) { i.value = x; i.focus(); return true; }
  } catch (e) { if (!solo) { i.focus(); mostraErrore(T.incolla_no); } }
  return false;
}
function tastiIncolla() { ov.querySelectorAll('[data-inc]').forEach(b => b.onclick = () => incolla(b.dataset.inc)); }
const dove = (tit, voci, sotto, prima = '') => `<details class="wdove" open><summary>${esc(tit)}</summary>${prima}<ol>${voci.map(v => `<li>${v}</li>`).join('')}</ol><small>${esc(sotto)}</small></details>`;

function schermoPassword(err = '') {
  schermo(`<div class="wlogo">🔒</div><h1>${esc(T.pw_t)}</h1><p class="ws">${esc(T.pw_p.split(':')[0])}.</p><p class="werr">${esc(err)}</p>
    ${campo('wPw', 'ABCD-EFGH-JKLM-NPQR', T.pw_t)}
    ${dove(T.pw_dove, [T.pw_d1, T.pw_d2, T.pw_d3], T.pw_d4)}
    <label class="wck"><input type="checkbox" id="wRic"${ricorda ? ' checked' : ''}> ${esc(T.ricorda)}</label>
    <button class="wbtn wp" id="wPwOk">${esc(T.pw_ok)}</button><p class="wpic">${esc(T.pw_pic)}</p>${LINK}`);
  const i = ov.querySelector('#wPw'), b = ov.querySelector('#wPwOk');
  tastiIncolla();
  i.focus();
  i.onkeydown = e => { if (e.key === 'Enter') b.click(); };
  b.onclick = async () => {
    const k = i.value.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/(.{4})(?=.)/g, '$1-');
    if (k.length < 9) return schermoPassword(T.pw_no);
    b.disabled = true; b.textContent = '…';
    let r;
    try { r = await chiedi('password', {chiave: k}); } catch (e) { return schermoPassword(T.errore + e.message); }
    if (r.errore === 'vuoto') return schermoPassword(T.vuoto);
    if (r.errore === 'accesso') return schermoAccedi(T.accesso);
    if (r.errore) return schermoPassword(T.rete);
    if (!r.ok) return schermoPassword(T.pw_no);
    ricorda = ov.querySelector('#wRic').checked;
    apri(k, true);
  };
}

async function apri(chiave, nuova) {
  schermo(`<div class="wlogo">⬇</div><h1>${esc(T.giu_t)}</h1><p class="ws">${esc(T.giu_p)}</p>
    <div class="wbarra"><i id="wBar"></i></div><p class="wpic" id="wFase" style="margin:0 0 6px">${esc(salvatoPrima.chiave ? '' : T.giu_prima)}</p>
    <p class="werr"></p><p class="wpic">${esc(T.giu_pic)}</p>`);
  const bar = ov.querySelector('#wBar');
  faseCb = f => { bar.style.width = Math.max(3, Math.round(f * 100)) + '%'; };
  try {
    const a = await chiedi('avvia', {lingua: IT ? 'it' : 'en', chiave, ricorda, prima: nuova});
    if (!a || !a.ok) throw new Error((a && a.errore) || 'motore');
    scriviLoc('vm-web-ricorda', ricorda ? '1' : null);
    const g = await chiedi('giro');
    faseCb = null;
    if (!g.ok) {
      console.warn('giro', JSON.stringify(g));
      if (g.errore === 'chiave') return schermoPassword(T.pw_no);
      if (g.errore === 'accesso') return schermoAccedi(T.accesso);
      mostraErrore(T.rete);
      return;
    }
    bar.style.width = '100%';
    ultimoGiro = Date.now(); sporco = false;
  } catch (e) { return mostraErrore(T.errore + e.message); }
  if (!salvatoPrima.claude && salvaLoc('vm-web-claude-dopo') !== '1') return schermoClaude();
  entra();
}

function schermoClaude(err = '') {
  schermo(`<div class="wlogo">🔑</div><h1>${esc(T.cl_t)}</h1><p class="ws">${esc(T.cl_p)}</p>
<p class="werr">${esc(err)}</p>
    ${campo('wCl', 'sk-ant-…', T.cl_t, ' style="letter-spacing:0"')}
    ${dove(T.pw_dove.replace(/la trovo|find it/, IT ? 'trovo la chiave' : 'find the key'), [T.cl_d1, T.cl_d2, T.cl_d3], T.cl_d4,
      `<a class="wvai" id="wClVai" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">${esc(T.cl_vai)}</a>`)}
    <ul class="wlista"><li>${esc(T.cl_1)}</li><li>${esc(T.cl_3)}</li></ul>
    <button class="wbtn wp" id="wClOk">${esc(T.cl_ok)}</button><button class="wbtn wg" id="wClDopo">${esc(T.cl_dopo)}</button>`);
  const i = ov.querySelector('#wCl'), b = ov.querySelector('#wClOk');
  tastiIncolla();
  // dopo «Apri la pagina delle chiavi»: quando torni qui, la chiave copiata entra da sola nella casella
  ov.querySelector('#wClVai').onclick = () => {
    const torna = async () => {
      if (!document.getElementById('wCl') || document.visibilityState !== 'visible') return;
      if (await incolla('wCl', /^sk-ant-[\w-]{20,}$/)) { window.removeEventListener('focus', torna); ov.querySelector('#wClOk').focus(); }
    };
    window.addEventListener('focus', torna);
  };
  i.onkeydown = e => { if (e.key === 'Enter') b.click(); };
  b.onclick = async () => {
    const k = i.value.trim();
    if (!k) return;
    b.disabled = true; b.textContent = '…';
    let r = {};
    try { r = await chiedi('chiama', {nome: 'prova_chiave', args: [k]}); } catch (e) { r = {ok: false}; }
    if (!r || r.ok === false) return schermoClaude((r && (r.msg || r.errore)) || T.cl_no);
    entra();
  };
  ov.querySelector('#wClDopo').onclick = () => { scriviLoc('vm-web-claude-dopo', '1'); entra(); };
}

// ---------------------------------------------------------------- dentro: le pagine del programma
// La tessera «Video» resta, ma dice la verita': il video e' sul PC; qui si ascolta l'audio della lezione
function adattaPagine() {
  try {
    TESTI.it['tl.vid.s'] = 'Il video è sul PC: qui l\'audio';
    TESTI.en['tl.vid.s'] = 'The video is on the PC: audio here';
  } catch (e) {}
  const video = async l => {
    let u = null;
    try { u = await window.pywebview.api.video_url(l.cartella); } catch (e) {}
    window.dialogo({titolo: (l.nome || ''), html: `<p class="tx" style="margin:0 0 12px">${esc(T.video)}</p>` +
      (u ? `<audio controls autoplay preload="metadata" src="${esc(u)}" style="width:100%"></audio>` : '')});
  };
  // Impostazioni: via le parti che servono solo dove si registra (sync Wi-Fi, trascrizione, cloud, calendario...)
  const imp = document.getElementById('v-imp');
  if (imp) {
    const NO = new Set(['sy.lbl', 'ho.h', 'dv.h', 'cl.h', 'and.imp', 'cg.h', 'cal.h', 'inv.h']);
    imp.querySelectorAll('.lbl[data-t]').forEach(l => { if (NO.has(l.dataset.t)) { const c = l.closest('.card'); if (c) c.classList.add('web-no'); } });
    let avz = imp.querySelector('.imsez[data-t="im.avz"]');
    for (let x = avz; x; x = x.nextElementSibling) x.classList.add('web-no');
  }
  for (const n of ['tileLezione', 'azioneLezione']) {
    const f = window[n];
    if (typeof f === 'function') window[n] = (l, a, ...r) => a === 'video' ? video(l) : f(l, a, ...r);
  }
}

function entra() {
  adattaPagine();
  ov.hidden = true;
  document.body.classList.add('web-on');
  barra();
  prontoOk();
  // si parte da Studia (sul web non si registra)
  const via = setInterval(() => {
    if (document.getElementById('splash')) return;
    clearInterval(via);
    if (typeof window.vai === 'function') { try { window.vai('studia'); } catch (e) {} }
  }, 200);
  setInterval(() => { if (sporco && Date.now() - ultimoGiro > 4 * 60000) salvaDrive(); }, 30000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && sporco) salvaDrive(); });
}

let ultimoGiro = 0, giroInCorso = null;
function barra() {
  let b = document.getElementById('webBar');
  if (!b) { b = document.createElement('div'); b.id = 'webBar'; document.body.append(b); }
  b.innerHTML = `<span>🌐 <b class="wb-tit">${esc(T.bar)}</b></span><span class="wb-acc">${esc(email)}</span><span class="wb-sync" id="wbSync"></span>
    <button id="wbSalva">${esc(T.salva)}</button><button id="wbEsci">${esc(T.esci)}</button>`;
  b.querySelector('#wbSalva').onclick = () => salvaDrive(true);
  b.querySelector('#wbEsci').onclick = esci;
  statoSync();
}
function statoSync(t) {
  const s = document.getElementById('wbSync'); if (!s) return;
  const ora = d => d.toLocaleTimeString(IT ? 'it-IT' : 'en-GB', {hour: '2-digit', minute: '2-digit'});
  s.textContent = t || (ultimoGiro ? `${T.salvato} ${ora(new Date(ultimoGiro))}` : '');
}
async function salvaDrive(daTasto = false) {
  if (giroInCorso) return giroInCorso;
  giroInCorso = (async () => {
    if (!tok || Date.now() > tok.scade - 90000) {
      if (!daTasto) { statoSync(T.riaccedi); return false; }
      try { await usaToken(await token('')); } catch (e) { statoSync(T.riaccedi); return false; }
    }
    statoSync(T.salvo);
    const prima = sporco; sporco = false;
    let g = {};
    try { g = await chiedi('giro'); } catch (e) { g = {ok: false}; }
    if (g.ok) { ultimoGiro = Date.now(); statoSync(); return true; }
    sporco = sporco || prima;
    statoSync(g.errore === 'accesso' ? T.riaccedi : T.rete);
    return false;
  })();
  try { return await giroInCorso; } finally { giroInCorso = null; }
}
window.addEventListener('beforeunload', e => { if (sporco && prontoOk) { e.preventDefault(); e.returnValue = T.non_salvato; } });

async function esci() {
  const v = document.createElement('div'); v.className = 'velo';
  v.innerHTML = `<div class="dlg"><h3>${esc(T.esci_t)}</h3><div class="tx">${esc(ricorda ? T.esci_p2 : T.esci_p)}</div><div class="bt">
    <button class="btn b-sm b-ghost" data-v="0">${esc(T.annulla)}</button><button class="btn b-sm b-main" data-v="1">${esc(T.esci)}</button></div></div>`;
  document.body.append(v);
  const si = await new Promise(ok => v.querySelectorAll('button').forEach(b => b.onclick = () => ok(b.dataset.v === '1')));
  v.remove();
  if (!si) return;
  if (sporco) await salvaDrive(true);
  sporco = false;
  try { await chiedi('esci'); } catch (e) {}
  scriviLoc('vm-web-ricorda', null); scriviLoc('vm-web-claude-dopo', null);
  try { if (tok && window.google) google.accounts.oauth2.revoke(tok.token, () => {}); } catch (e) {}
  location.replace(location.pathname);
}

// ---------------------------------------------------------------- partenza
// I link del menu del programma non hanno indirizzo (li gestisce app.js): qui ne hanno uno vero,
// cosi' la pagina non sembra una trappola a chi controlla i link (alcuni antivirus); il clic resta al programma.
function indirizzi() {
  document.querySelectorAll('a:not([href])').forEach(a => {
    a.setAttribute('href', location.pathname + '?vai=' + encodeURIComponent(a.dataset.p || a.id || 'home'));
    a.dataset.vmInt = '1';
  });
}
document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[data-vm-int]'); if (a) e.preventDefault(); }, true);

function parti() {
  indirizzi();
  if (!window.Worker || !window.WebAssembly || !window.DecompressionStream) { schermo(`${LOGO}<h1>${esc(T.titolo)}</h1><p class="werr">${esc(T.browser)}</p>`); return; }
  document.body.append(ov);
  schermoAccedi();
  caricato = chiedi('carica', {ricorda}).then(s => { salvatoPrima = s || {}; return true; });
  caricato.catch(e => mostraErrore(T.errore + e.message));
  caricaGis().catch(() => {});
}
if (document.body) parti(); else document.addEventListener('DOMContentLoaded', parti, {once: true});
window.VM_WEB = {T, chiedi};
})();
