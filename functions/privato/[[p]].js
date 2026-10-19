// Pannello di controllo di Verba Manent IA: https://verbamanent.app/privato (link «Area riservata» nel footer)
// Si entra con la password messa in Cloudflare (variabile segreta VM_PASSWORD): nel codice non c'e'.
// «Mantieni l'accesso» = un biscotto firmato valido 30 giorni su quel dispositivo (cambiando la password, scadono tutti).
//   /privato        Panoramica
//   /privato/abbonati  Abbonati: chi ha Claude incluso (aggiungi, +1 mese, modifica, togli)
//   /privato/lista  Lista d'attesa (con ?csv=1 il file Excel)
//   /privato/uso    Consumi Claude della famiglia
//   /privato/esci   Esci
import { rispondi as listaCsv } from '../api/lista.js';
import { datiUso } from '../api/uso.js';

const GIORNI = 30;
const PRIV = { 'x-robots-tag': 'noindex, nofollow', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-frame-options': 'DENY' };
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const usd = x => '$ ' + (x || 0).toFixed(2).replace('.', ',');
const eur = x => '€ ' + ((x || 0) * 0.92).toFixed(2).replace('.', ',');
const roma = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
const quando = d => d ? new Date(d).toLocaleString('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
const plur = (n, u, m) => n + ' ' + (n === 1 ? u : m);

// ------------------------------------------------------------------ accesso
async function firma(segreto, testo) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode('vm-privato:' + segreto), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const b = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(testo));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
function uguali(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
async function dentro(request, env) {
  const m = (request.headers.get('cookie') || '').match(/(?:^|;\s*)vm_privato=(\d+)\.([0-9a-f]{64})/);
  if (!m || +m[1] < Date.now()) return false;
  return uguali(m[2], await firma(env.VM_PASSWORD, m[1]));
}

// ------------------------------------------------------------------ aspetto
const STILE = `:root{--navy:#0d4275;--navy-d:#082c4f;--navy-dd:#061e36;--blue:#0369a1;--cyan:#22d3ee;--ink:#0f1b2d;--txt:#334155;--mut:#64748b;--line:#e2e8f0;--soft:#f4f7fb}
*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;background:var(--soft);color:var(--txt);font-size:14.5px}
a{color:var(--blue)}
.acc{min-height:100vh;display:grid;place-items:center;padding:30px 16px;background:radial-gradient(900px 420px at 80% -10%,#0b5fa8 0%,transparent 60%),linear-gradient(180deg,var(--navy-dd),var(--navy-d))}
.card-acc{background:#fff;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.35);padding:34px 32px 28px;width:100%;max-width:400px}
.marchio{display:flex;align-items:center;gap:10px;margin-bottom:22px;text-decoration:none}.vm{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,var(--navy),var(--blue));display:grid;place-items:center;color:var(--cyan);font-weight:800;font-size:15px;flex:none}
.marchio b{color:var(--ink);font-size:15.5px;display:block}.marchio small{color:var(--mut);font-size:12.5px}
.card-acc h1{font-size:21px;color:var(--ink);margin:0 0 4px}.card-acc p{color:var(--mut);margin:0 0 20px;font-size:14px}
.err{color:#dc2626!important;font-weight:600}
label.l{display:block;font-size:13px;font-weight:600;color:var(--ink);margin:0 0 6px}
.in{width:100%;border:1px solid #cbd5e1;border-radius:10px;padding:11px 13px;font:inherit;font-size:15px;margin:0 0 14px}
.ck{display:flex;gap:8px;align-items:center;font-size:13.5px;margin:0 0 18px}
.bp{width:100%;border:0;border-radius:10px;padding:12px;font:inherit;font-weight:600;font-size:15px;background:var(--navy);color:#fff;cursor:pointer}.bp:hover{background:var(--blue)}
.sicuro{margin-top:16px;font-size:12.5px;color:var(--mut)}.sito{display:block;text-align:center;margin-top:14px;font-size:13px}
.top{background:var(--navy-dd);color:#cbd5e1;display:flex;align-items:center;gap:16px;padding:0 22px;min-height:60px;flex-wrap:wrap}
.top .marchio{margin:0}.top .marchio b{color:#fff}.top .marchio small{color:#94a3b8}
.tabs{display:flex;gap:4px;margin-left:18px}.tabs a{color:#cbd5e1;text-decoration:none;padding:8px 12px;border-radius:8px;font-weight:500;font-size:14px}.tabs a.on{background:rgba(255,255,255,.1);color:#fff}
.chi{margin-left:auto;display:flex;align-items:center;gap:12px;font-size:13.5px}.av{width:32px;height:32px;border-radius:50%;background:#1e3a5f;color:#fff;display:grid;place-items:center;font-weight:700;font-size:13px}
.chi b{color:#fff;display:block;font-weight:600}.chi small{color:#94a3b8}
.esci{border:1px solid rgba(255,255,255,.25);color:#fff;border-radius:8px;padding:6px 12px;font-size:13px;text-decoration:none}
.main{max-width:1120px;margin:0 auto;padding:26px 22px 50px}
.tit{display:flex;align-items:flex-end;gap:12px;margin-bottom:18px;flex-wrap:wrap}.tit h2{margin:0;font-size:22px;color:var(--ink)}.tit span{color:var(--mut);font-size:13.5px;margin-left:auto}
.kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px}
.k{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px 18px}.k small{color:var(--mut);font-size:12.5px;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
.k b{display:block;font-size:28px;color:var(--ink);margin:6px 0 2px;font-variant-numeric:tabular-nums}.k span{font-size:13px;color:var(--mut)}
.griglia{display:grid;grid-template-columns:1.6fr 1fr;gap:14px}
.box{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px 18px 14px;margin-bottom:14px}.box h3{margin:0 0 2px;font-size:15.5px;color:var(--ink)}.box .s{color:var(--mut);font-size:13px;margin:0 0 12px}
.griglia .box{margin-bottom:0}
table{width:100%;border-collapse:collapse;font-size:14px}th{text-align:left;color:var(--mut);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;padding:8px 6px;border-bottom:1px solid var(--line)}
td{padding:10px 6px;border-bottom:1px solid #f1f5f9;font-variant-numeric:tabular-nums;word-break:break-word}td.n,th.n{text-align:right}.vuoto{color:var(--mut);text-align:center;padding:26px}
.chart{position:relative}.tt{position:absolute;pointer-events:none;background:var(--ink);color:#fff;font-size:12.5px;padding:6px 9px;border-radius:7px;white-space:nowrap;transform:translate(-50%,-110%);display:none}
.azioni{display:flex;gap:8px;margin-bottom:12px;align-items:center;flex-wrap:wrap}.azioni h3{margin:0;flex:1}
.bs{border:1px solid var(--line);background:#fff;border-radius:8px;padding:7px 12px;font-size:13px;color:var(--navy);text-decoration:none;font-weight:500}
.nota{color:var(--mut);font-size:12.5px;margin-top:14px;line-height:1.5}
details summary{cursor:pointer;color:var(--blue);font-size:13.5px;margin-top:6px}
.badge{display:inline-block;font-size:12px;font-weight:600;padding:3px 9px;border-radius:999px;background:#e0f2fe;color:#0d4275}
.badge.off{background:#f1f5f9;color:#64748b}.badge.ok{background:#dcfce7;color:#166534}.badge.att{background:#fef3c7;color:#92400e}.badge.no{background:#fee2e2;color:#991b1b}
.bp2{border:0;border-radius:8px;padding:8px 14px;font:inherit;font-weight:600;font-size:13.5px;background:var(--navy);color:#fff;cursor:pointer;text-decoration:none}
.form{display:grid;grid-template-columns:2fr 1.2fr 1.3fr 1fr 1fr auto;gap:10px;align-items:end;background:var(--soft);border:1px solid var(--line);border-radius:12px;padding:14px;margin-bottom:14px}
.form label{font-size:12px;font-weight:600;color:var(--mut);display:block;margin-bottom:4px}
.form input,.form select{width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:8px 10px;font:inherit;font-size:14px;background:#fff}
.mini{height:6px;background:var(--line);border-radius:4px;overflow:hidden;margin-top:4px;width:110px}.mini i{display:block;height:100%;background:var(--navy)}
.az{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}.az form{margin:0}.az button,.az a{border:1px solid var(--line);background:#fff;border-radius:7px;padding:5px 9px;font:inherit;font-size:12.5px;color:var(--navy);cursor:pointer;text-decoration:none}.az .r{color:#b91c1c}
.pag{display:flex;gap:12px;align-items:center;background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px 18px;margin-bottom:14px;flex-wrap:wrap}.pag b{color:var(--ink)}.pag span{color:var(--mut);font-size:13.5px}
.msg{background:#dcfce7;color:#166534;border-radius:10px;padding:10px 14px;margin-bottom:14px;font-weight:600}
@media(max-width:860px){.form{grid-template-columns:1fr 1fr}}
@media(max-width:860px){.kpi{grid-template-columns:1fr 1fr}.griglia{grid-template-columns:1fr}.chi div{display:none}.tabs{margin-left:0;order:3;width:100%;padding-bottom:8px;overflow:auto}}`;
const MARCHIO = '<div class="vm">VM</div><div><b>Verba Manent IA</b><small>Pannello di controllo</small></div>';
const html = (titolo, corpo, extra = {}) => new Response(`<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(titolo)} · Verba Manent IA</title><style>${STILE}</style></head><body>${corpo}</body></html>`,
  { status: extra.status || 200, headers: { ...PRIV, 'content-type': 'text/html; charset=utf-8', ...(extra.headers || {}) } });

function accesso(errore = '') {
  return html('Accesso riservato', `<div class="acc"><form class="card-acc" method="post" action="/privato">
    <a class="marchio" href="/">${MARCHIO}</a>
    <h1>Accesso riservato</h1><p${errore ? ' class="err"' : ''}>${esc(errore || "Area di gestione: lista d'attesa e consumi di Claude.")}</p>
    <label class="l" for="pw">Password</label><input class="in" id="pw" type="password" name="password" autocomplete="current-password" autofocus required>
    <label class="ck"><input type="checkbox" name="ricorda" value="1" checked> Mantieni l'accesso su questo dispositivo per ${GIORNI} giorni</label>
    <button class="bp">Accedi</button>
    <div class="sicuro">🔒 Connessione protetta · dopo 10 tentativi errati l'accesso si blocca per un'ora</div>
    <a class="sito" href="/">← Torna al sito</a></form></div>`, { status: errore ? 401 : 200 });
}

function pannello(scheda, titolo, sotto, corpo) {
  const t = (id, href, nome) => `<a href="${href}"${scheda === id ? ' class="on" aria-current="page"' : ''}>${nome}</a>`;
  return html(titolo, `<div class="top"><a class="marchio" href="/privato">${MARCHIO}</a>
    <nav class="tabs" aria-label="Pannello">${t('pan', '/privato', 'Panoramica')}${t('abb', '/privato/abbonati', 'Abbonati')}${t('lista', '/privato/lista', "Lista d'attesa")}${t('uso', '/privato/uso', 'Consumi Claude')}</nav>
    <div class="chi"><div><b>Paolo Boldrini</b><small>CEO</small></div><span class="av">PB</span><a class="esci" href="/privato/esci">Esci</a></div></div>
    <main class="main"><div class="tit"><h2>${esc(titolo)}</h2><span>${esc(sotto)}</span></div>${corpo}</main>`);
}

// ------------------------------------------------------------------ dati
async function iscritti(env) {
  const out = [];
  if (!env.ATTESA) return out;
  let cursor;
  do {
    const p = await env.ATTESA.list({ cursor });
    for (const c of p.keys) {
      if (c.name.startsWith('limite:') || c.name.startsWith('uso:') || c.name.startsWith('abbonato:')) continue;
      let v = {};
      try { v = JSON.parse(await env.ATTESA.get(c.name) || '{}'); } catch (e) {}
      out.push({ email: c.name, uso: v.uso || '', lingua: v.lingua || '', data: v.data || '' });
    }
    cursor = p.list_complete ? null : p.cursor;
  } while (cursor);
  return out.sort((a, b) => b.data.localeCompare(a.data));
}
const tipo = u => /stud/i.test(u) ? 'Studio' : /lavoro|work/i.test(u) ? 'Lavoro' : /tutti|both/i.test(u) ? 'Tutti e due' : (u.replace(/^.*?:\s*/, '') || '—');
const meseOra = () => { const o = roma(); return o.getFullYear() + '-' + String(o.getMonth() + 1).padStart(2, '0'); };
const nomeMese = m => { const [a, n] = m.split('-'); return MESI[+n - 1][0].toUpperCase() + MESI[+n - 1].slice(1) + ' ' + a; };

function righeIscritti(lista) {
  return lista.length ? lista.map(r => `<tr><td>${esc(r.email)}</td><td>${esc(tipo(r.uso))}</td><td>${r.lingua === 'en' ? 'EN' : 'IT'}</td><td>${esc(quando(r.data))}</td></tr>`).join('')
    : '<tr><td colspan="4" class="vuoto">Ancora nessun iscritto.</td></tr>';
}
const TESTA_ISCRITTI = '<tr><th>Email</th><th>Uso</th><th>Lingua</th><th>Iscritto il</th></tr>';

// grafico a barre: una serie sola (spesa del giorno), base zero, griglia leggera, tooltip al passaggio
function grafico(valori, mese) {
  const n = valori.length, W = 640, H = 230, m = { l: 40, r: 8, t: 10, b: 26 };
  const top = Math.max(0.1, ...valori);
  const passo = top <= 0.5 ? 0.1 : top <= 1 ? 0.2 : top <= 2.5 ? 0.5 : Math.ceil(top / 5);
  const max = Math.ceil(top / passo) * passo, bw = (W - m.l - m.r) / Math.max(n, 1), hh = H - m.t - m.b;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Spesa Claude al giorno, ${esc(mese)}">`;
  for (let v = 0; v <= max + 1e-9; v += passo) {
    const y = m.t + hh * (1 - v / max);
    s += `<line x1="${m.l}" x2="${W - m.r}" y1="${y}" y2="${y}" stroke="#eef2f7"/><text x="${m.l - 6}" y="${y + 4}" font-size="11" fill="#64748b" text-anchor="end">${v.toFixed(passo < 1 ? 1 : 0).replace('.', ',')}</text>`;
  }
  valori.forEach((v, i) => {
    const h = hh * v / max, w = Math.max(2, bw * 0.56), x = m.l + i * bw + (bw - w) / 2;
    s += `<rect x="${m.l + i * bw}" y="${m.t}" width="${bw}" height="${hh}" fill="transparent" data-g="${i + 1}" data-v="${v.toFixed(2).replace('.', ',')}"/>`;
    if (h >= 4) s += `<path d="M${x},${H - m.b} v${-(h - 4)} q0,-4 4,-4 h${w - 8} q4,0 4,4 v${h - 4} z" fill="#0d4275" pointer-events="none"/>`;
    else if (h > 0) s += `<rect x="${x}" y="${H - m.b - h}" width="${w}" height="${h}" fill="#0d4275" pointer-events="none"/>`;
    if (i === 0 || (i + 1) % 5 === 0) s += `<text x="${x + w / 2}" y="${H - 8}" font-size="11" fill="#64748b" text-anchor="middle">${i + 1}</text>`;
  });
  const meseMin = esc(mese.split(' ')[0].toLowerCase());
  return `<div class="chart" id="ch"><div class="tt" id="tt"></div>${s}</svg></div>
    <script>(()=>{const ch=document.getElementById('ch'),tt=document.getElementById('tt');ch.querySelectorAll('rect[data-g]').forEach(r=>{r.onmousemove=e=>{const b=ch.getBoundingClientRect();tt.style.display='block';tt.style.left=(e.clientX-b.left)+'px';tt.style.top=(e.clientY-b.top)+'px';tt.textContent=r.dataset.g+' ${meseMin} · $ '+r.dataset.v};r.onmouseleave=()=>tt.style.display='none'})})()</script>`;
}

function tabellaPersone(persone) {
  const tot = persone.reduce((s, [, d]) => [s[0] + (d.n || 0), s[1] + (d.usd || 0)], [0, 0]);
  return `<table><tr><th>Persona</th><th class="n">Domande</th><th class="n">Spesa</th></tr>
    ${persone.length ? persone.map(([nome, d]) => `<tr><td>${esc(nome)}</td><td class="n">${d.n || 0}</td><td class="n">${usd(d.usd)}</td></tr>`).join('') : '<tr><td colspan="3" class="vuoto">Ancora nessuna domanda.</td></tr>'}
    ${persone.length ? `<tr><td><b>Totale</b></td><td class="n"><b>${tot[0]}</b></td><td class="n"><b>${usd(tot[1])}</b></td></tr>` : ''}</table>`;
}
const NOTA_COSTI = '<p class="nota">Stima con i prezzi ufficiali di Claude Sonnet 5.5; l\'euro è indicativo. Il conto preciso e il credito residuo sono nella console di Claude.</p>';

// ------------------------------------------------------------------ pagine
async function panoramica(env) {
  const lista = await iscritti(env), uso = await datiUso(env), m = meseOra(), mese = nomeMese(m);
  const settimana = lista.filter(r => r.data && Date.now() - new Date(r.data) < 7 * 86400000).length;
  const stud = lista.filter(r => tipo(r.uso) === 'Studio').length, lav = lista.filter(r => tipo(r.uso) === 'Lavoro').length;
  const nomi = Object.fromEntries((await abbonati(env)).map(a => [a.email, a.nome || a.email]));
  const persone = Object.entries(uso[m] || {}).map(([id, d]) => [nomi[id] || id, d]).sort((a, b) => (b[1].usd || 0) - (a[1].usd || 0));
  const spesa = persone.reduce((s, [, d]) => s + (d.usd || 0), 0), domande = persone.reduce((s, [, d]) => s + (d.n || 0), 0);
  const oggi = roma().getDate(), giorni = Array.from({ length: oggi }, (_, i) => persone.reduce((s, [, d]) => s + (((d.giorni || {})[String(i + 1).padStart(2, '0')] || {}).usd || 0), 0));
  const ora = roma().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  return pannello('pan', 'Panoramica', `${mese} · aggiornato alle ${ora}`, `
    <div class="kpi">
      <div class="k"><small>Lista d'attesa</small><b>${lista.length}</b><span>+${settimana} negli ultimi 7 giorni</span></div>
      <div class="k"><small>Studio / lavoro</small><b>${stud} / ${lav}</b><span>${lista.length ? Math.round(stud / lista.length * 100) + '% studenti' : '—'}</span></div>
      <div class="k"><small>Spesa Claude · mese</small><b>${usd(spesa)}</b><span>≈ ${eur(spesa)} · ${plur(persone.length, 'persona', 'persone')}</span></div>
      <div class="k"><small>Domande a Claude · mese</small><b>${domande}</b><span>${domande ? 'media ' + usd(spesa / domande).replace(/,(\d\d)$/, ',$1') + ' a domanda' : 'nessuna ancora'}</span></div>
    </div>
    <div class="griglia">
      <div class="box"><h3>Spesa Claude al giorno</h3><p class="s">${esc(mese)}, in dollari · passa sopra una barra per i dettagli</p>${grafico(giorni, mese)}</div>
      <div class="box"><h3>Consumi per persona</h3><p class="s">${esc(mese)}</p>${tabellaPersone(persone)}${NOTA_COSTI}</div>
    </div>
    <div class="box" style="margin-top:14px"><div class="azioni"><h3>Ultimi iscritti alla lista d'attesa</h3><a class="bs" href="/privato/lista?csv=1">⬇ Esporta Excel</a><a class="bs" href="/privato/lista">Vedi tutti ›</a></div>
      <table>${TESTA_ISCRITTI}${righeIscritti(lista.slice(0, 5))}</table></div>`);
}

async function paginaLista(env) {
  const lista = await iscritti(env);
  const c = t => lista.filter(r => tipo(r.uso) === t).length;
  return pannello('lista', "Lista d'attesa", plur(lista.length, 'iscritto', 'iscritti'), `
    <div class="kpi">
      <div class="k"><small>Iscritti</small><b>${lista.length}</b><span>in tutto</span></div>
      <div class="k"><small>Studio</small><b>${c('Studio')}</b><span>per studiare</span></div>
      <div class="k"><small>Lavoro</small><b>${c('Lavoro')}</b><span>riunioni e lavoro</span></div>
      <div class="k"><small>Tutti e due</small><b>${c('Tutti e due')}</b><span>studio e lavoro</span></div>
    </div>
    <div class="box"><div class="azioni"><h3>Tutti gli iscritti</h3><a class="bs" href="/privato/lista?csv=1">⬇ Esporta Excel</a></div>
      <table>${TESTA_ISCRITTI}${righeIscritti(lista)}</table></div>`);
}

async function paginaUso(env) {
  const uso = await datiUso(env), mesi = Object.keys(uso).sort().reverse();
  const nomi = Object.fromEntries((await abbonati(env)).map(a => [a.email, a.nome || a.email]));
  for (const m of mesi) uso[m] = Object.fromEntries(Object.entries(uso[m]).map(([id, d]) => [nomi[id] || id, d]));
  const blocchi = mesi.map(m => {
    const persone = Object.entries(uso[m]).sort((a, b) => (b[1].usd || 0) - (a[1].usd || 0));
    const dettagli = persone.map(([nome, d]) => {
      const giorni = Object.entries(d.giorni || {}).sort((a, b) => +b[0] - +a[0]);
      return `<details><summary>${esc(nome)} · giorno per giorno (ultima domanda ${esc(quando(d.ultimo))})</summary><table><tr><th>Giorno</th><th class="n">Domande</th><th class="n">Spesa</th></tr>${giorni.map(([g, x]) => `<tr><td>${+g} ${MESI[+m.split('-')[1] - 1]}</td><td class="n">${x.n}</td><td class="n">${usd(x.usd)}</td></tr>`).join('')}</table></details>`;
    }).join('');
    return `<div class="box"><h3>${esc(nomeMese(m))}</h3><p class="s">Chiave «Verba Manent famiglia» nella cassaforte del sito</p>${tabellaPersone(persone)}${dettagli}</div>`;
  }).join('') || '<div class="box"><p class="vuoto">Ancora nessuna domanda a Claude dalla famiglia.</p></div>';
  return pannello('uso', 'Consumi Claude', 'famiglia e abbonati · per mese e per persona', blocchi + NOTA_COSTI);
}

// ------------------------------------------------------------------ abbonati
const PIANI = { Famiglia: 'badge', Omaggio: 'badge att', Studente: 'badge ok', 'Studente Plus': 'badge ok' };
async function abbonati(env) {
  const out = [];
  let cursor;
  do {
    const p = await env.ATTESA.list({ prefix: 'abbonato:', cursor });
    for (const c of p.keys) {
      try { out.push({ email: c.name.slice(9), ...JSON.parse(await env.ATTESA.get(c.name) || '{}') }); } catch (e) {}
    }
    cursor = p.list_complete ? null : p.cursor;
  } while (cursor);
  const ord = { Famiglia: 0, Omaggio: 1, Studente: 2, 'Studente Plus': 3 };
  return out.sort((a, b) => (ord[a.piano] ?? 9) - (ord[b.piano] ?? 9) || String(a.nome).localeCompare(String(b.nome)));
}
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
const giorno = d => d ? new Date(d).toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
function piuMesi(da, n) { const d = new Date(da); d.setMonth(d.getMonth() + n); return d.toISOString(); }

async function salvaAbbonato(env, f) {
  const azione = String(f.get('azione') || ''), email = String(f.get('email') || '').trim().toLowerCase();
  if (!EMAIL.test(email)) return 'Indirizzo non valido.';
  const k = 'abbonato:' + email;
  let ab = null;
  try { ab = JSON.parse(await env.ATTESA.get(k) || 'null'); } catch (e) {}
  if (azione === 'togli') { await env.ATTESA.delete(k); return `${email} tolto.`; }
  if (azione === 'mese') {
    if (!ab) return 'Abbonato non trovato.';
    const base = ab.scade && new Date(ab.scade) > new Date() ? ab.scade : new Date().toISOString();
    ab.scade = piuMesi(base, 1);
    await env.ATTESA.put(k, JSON.stringify(ab));
    return `Un mese in più a ${ab.nome || email}: scade il ${giorno(ab.scade)}.`;
  }
  const piano = Object.keys(PIANI).includes(String(f.get('piano'))) ? String(f.get('piano')) : 'Omaggio';
  const sc = String(f.get('scadenza') || ''), tetto = parseFloat(String(f.get('tetto') || '').replace(',', '.'));
  const nuovo = { ...(ab || {}), nome: String(f.get('nome') || '').trim().slice(0, 40) || email.split('@')[0], piano,
    dal: (ab && ab.dal) || new Date().toISOString(), tetto: tetto > 0 ? tetto : null, origine: (ab && ab.origine) || 'manuale' };
  if (sc === 'nessuna') nuovo.scade = null;
  else if (/^\d+$/.test(sc)) nuovo.scade = piuMesi(new Date().toISOString(), +sc);
  await env.ATTESA.put(k, JSON.stringify(nuovo));
  return `${nuovo.nome} salvato.`;
}

async function paginaAbbonati(env, url, messaggio = '') {
  const elenco = await abbonati(env), uso = (await datiUso(env))[meseOra()] || {};
  const mod = url.searchParams.get('modifica'), m = elenco.find(x => x.email === mod) || null;
  const ora = Date.now(), attivo = a => !a.scade || new Date(a.scade) > ora;
  const attivi = elenco.filter(attivo);
  const conta = p => attivi.filter(a => a.piano === p).length;
  const scadono = attivi.filter(a => a.scade && new Date(a.scade) - ora < 7 * 86400000).length;
  const spesa = elenco.reduce((s, a) => s + ((uso[a.id || a.email] || {}).usd || 0), 0);
  const opz = (v, t, sel) => `<option value="${esc(v)}"${sel ? ' selected' : ''}>${esc(t)}</option>`;
  const form = `<form class="form" method="post" action="/privato/abbonati"><input type="hidden" name="azione" value="salva">
    <div><label>Gmail</label><input name="email" type="email" required placeholder="nome@gmail.com" value="${esc(m ? m.email : '')}"${m ? ' readonly' : ''}></div>
    <div><label>Nome</label><input name="nome" maxlength="40" placeholder="per riconoscerlo" value="${esc(m ? m.nome : '')}"></div>
    <div><label>Piano</label><select name="piano">${['Famiglia', 'Omaggio', 'Studente', 'Studente Plus'].map(p => opz(p, p === 'Famiglia' ? 'Famiglia (gratis)' : p, m ? m.piano === p : p === 'Omaggio')).join('')}</select></div>
    <div><label>Scadenza</label><select name="scadenza">${m ? opz('', 'come adesso' + (m.scade ? ' (' + giorno(m.scade) + ')' : ' (nessuna)'), true) : ''}${opz('nessuna', 'Nessuna', !m)}${opz('1', '1 mese')}${opz('3', '3 mesi')}${opz('12', '1 anno')}</select></div>
    <div><label>Tetto Claude al mese</label><select name="tetto">${opz('', 'Senza tetto', m ? !m.tetto : true)}${[3, 5, 10].map(v => opz(v, '$ ' + v, m && +m.tetto === v)).join('')}</select></div>
    <button class="bp2">${m ? 'Salva modifiche' : 'Aggiungi'}</button></form>`;
  const righe = elenco.map(a => {
    const d = uso[a.id || a.email] || {}, sp = d.usd || 0;
    const stato = attivo(a) ? `<span class="${PIANI[a.piano] || 'badge'}">${esc(a.piano)}</span>` : '<span class="badge no">Scaduto</span>';
    const cons = usd(sp) + (a.tetto ? ` di ${usd(+a.tetto)}<div class="mini"><i style="width:${Math.min(100, sp / a.tetto * 100).toFixed(0)}%"></i></div>` : ' · senza tetto');
    const bott = (az, t, cls = '') => `<form method="post" action="/privato/abbonati"${az === 'togli' ? ` onsubmit="return confirm('Togliere ${esc(a.nome || a.email)}?')"` : ''}><input type="hidden" name="azione" value="${az}"><input type="hidden" name="email" value="${esc(a.email)}"><button${cls ? ` class="${cls}"` : ''}>${t}</button></form>`;
    return `<tr><td><b>${esc(a.nome || '')}</b><br><small style="color:#64748b">${esc(a.email)}</small></td><td>${stato}</td><td>${giorno(a.dal)}</td><td>${a.scade ? giorno(a.scade) : 'nessuna'}</td><td>${cons}</td><td>${a.origine === 'pagamento' ? '💳 pagamento' : '✋ a mano'}</td>
      <td><div class="az">${a.scade ? bott('mese', '+1 mese') : ''}<a href="/privato/abbonati?modifica=${encodeURIComponent(a.email)}">Modifica</a>${bott('togli', 'Togli', 'r')}</div></td></tr>`;
  }).join('') || '<tr><td colspan="7" class="vuoto">Ancora nessun abbonato. La famiglia entra da sola la prima volta che usa Claude sul web.</td></tr>';
  return pannello('abb', 'Abbonati', 'Chi ha Claude incluso in Verba Manent', `
    ${messaggio ? `<div class="msg">✓ ${esc(messaggio)}</div>` : ''}
    <div class="pag"><span class="badge off">⏸ Pagamenti spenti</span><div><b>Vendita non ancora attiva.</b> <span>Quando la accendi, chi paga sul sito entra qui da solo e ne esce quando scade o disdice.</span></div></div>
    <div class="kpi">
      <div class="k"><small>Abbonati attivi</small><b>${attivi.length}</b><span>${conta('Famiglia')} famiglia · ${plur(conta('Studente') + conta('Studente Plus'), 'studente', 'studenti')} · ${conta('Omaggio')} omaggio</span></div>
      <div class="k"><small>In scadenza</small><b>${scadono}</b><span>nei prossimi 7 giorni</span></div>
      <div class="k"><small>Spesa Claude · mese</small><b>${usd(spesa)}</b><span>tutti gli abbonati</span></div>
      <div class="k"><small>Incassi · mese</small><b>—</b><span>con i pagamenti accesi</span></div>
    </div>
    <div class="box"><div class="azioni"><h3>${m ? 'Modifica ' + esc(m.nome || m.email) : 'Aggiungi abbonato'}</h3>${m ? '<a class="bs" href="/privato/abbonati">Annulla</a>' : ''}</div>${form}
      <table><tr><th>Abbonato</th><th>Piano</th><th>Dal</th><th>Scadenza</th><th>Claude questo mese</th><th>Origine</th><th></th></tr>${righe}</table>
      <p class="nota">Con un tetto, all'80% Verba Manent lo dice all'abbonato e al 100% Claude si ferma fino al mese dopo; la famiglia non ha tetto. Gli indirizzi stanno nella memoria privata del sito, non nel codice.</p></div>`);
}

// ------------------------------------------------------------------ ingresso
export async function onRequest({ request, env, params }) {
  const via = [].concat(params.p || []).join('/');
  if (!env.VM_PASSWORD) return html('Accesso riservato', '<div class="acc"><div class="card-acc"><h1>Accesso riservato</h1><p>La password non è ancora in Cloudflare (VM_PASSWORD).</p></div></div>', { status: 503 });

  if (request.method === 'POST' && !via) {
    const ip = request.headers.get('cf-connecting-ip') || '';
    const lim = 'limite:privato:' + ip;                         // al massimo 10 tentativi all'ora dallo stesso indirizzo
    const n = env.ATTESA ? parseInt(await env.ATTESA.get(lim) || '0', 10) : 0;
    if (n >= 10) return accesso("Troppi tentativi: riprova tra un'ora.");
    const f = await request.formData();
    const pw = String(f.get('password') || '');
    if (!uguali(await firma(env.VM_PASSWORD, pw), await firma(env.VM_PASSWORD, env.VM_PASSWORD))) {
      if (env.ATTESA) await env.ATTESA.put(lim, String(n + 1), { expirationTtl: 3600 });
      return accesso('Password sbagliata.');
    }
    const ricorda = f.get('ricorda') === '1';
    const scade = Date.now() + (ricorda ? GIORNI : 1) * 86400000;
    const biscotto = `vm_privato=${scade}.${await firma(env.VM_PASSWORD, String(scade))}; Path=/privato; HttpOnly; Secure; SameSite=Lax` + (ricorda ? `; Max-Age=${GIORNI * 86400}` : '');
    return new Response(null, { status: 303, headers: { ...PRIV, location: '/privato', 'set-cookie': biscotto } });
  }
  if (via === 'esci') {
    return new Response(null, { status: 303, headers: { ...PRIV, location: '/privato', 'set-cookie': 'vm_privato=; Path=/privato; HttpOnly; Secure; SameSite=Lax; Max-Age=0' } });
  }
  if (!await dentro(request, env)) return accesso();
  if (!env.ATTESA) return pannello('pan', 'Panoramica', '', '<div class="box"><p class="vuoto">Memoria non collegata (ATTESA).</p></div>');

  if (via === 'lista') {
    const url = new URL(request.url);
    return url.searchParams.get('csv') ? listaCsv(env, url, '') : paginaLista(env);
  }
  if (via === 'abbonati') {
    if (request.method === 'POST') {
      const msg = await salvaAbbonato(env, await request.formData());
      return new Response(null, { status: 303, headers: { ...PRIV, location: '/privato/abbonati?fatto=' + encodeURIComponent(msg) } });
    }
    const url = new URL(request.url);
    return paginaAbbonati(env, url, url.searchParams.get('fatto') || '');
  }
  if (via === 'uso') return paginaUso(env);
  return panoramica(env);
}
