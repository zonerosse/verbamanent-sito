// Area privata di Paolo: https://verbamanent.app/privato
// Si entra con la password messa in Cloudflare (variabile segreta VM_PASSWORD): nel codice non c'e'.
// «Ricordami» = un biscotto firmato valido 30 giorni su quel computer (cambiando la password, scadono tutti).
//   /privato        entra / i due riquadri
//   /privato/lista  lista d'attesa (con ?csv=1 il file Excel)
//   /privato/uso    uso di Claude della famiglia
//   /privato/esci   esce
import { rispondi as lista } from '../api/lista.js';
import { rispondi as uso, datiUso } from '../api/uso.js';

const GIORNI = 30;
const PRIV = { 'x-robots-tag': 'noindex, nofollow', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-frame-options': 'DENY' };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

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

const STILE = `body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#eef4fa;color:#0f1b2d}
.w{max-width:560px;margin:0 auto;padding:40px 16px}
.box{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:28px 26px;text-align:center}
.logo{width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#0d4275,#0369a1);display:inline-grid;place-items:center;font-size:24px}
h1{font-size:22px;margin:12px 0 6px}.s{color:#64748b;font-size:14.5px;margin:0 0 18px;line-height:1.5}.err{color:#dc2626;font-size:14.5px;margin:0 0 12px}
input.in{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:12px;padding:12px 14px;font:inherit;font-size:16px;margin:0 0 12px}
.ck{display:flex;gap:8px;align-items:center;justify-content:center;font-size:14px;margin:0 0 16px}
.btn{width:100%;border:0;border-radius:12px;padding:13px;font:inherit;font-weight:600;font-size:16px;background:#0d4275;color:#fff;cursor:pointer}
.top{display:flex;align-items:center;gap:10px;margin-bottom:18px}.top h1{margin:0;flex:1;text-align:left}
.esci{border:1px solid #cbd5e1;background:#fff;border-radius:10px;padding:8px 12px;font-size:14px;color:#0d4275;text-decoration:none}
.card{display:flex;align-items:center;gap:14px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px 18px;margin-bottom:12px;text-decoration:none;color:inherit}
.card:hover{border-color:#0369a1}.card .ic{font-size:26px}.card b{display:block;font-size:16.5px}.card span{color:#64748b;font-size:14px}.card .fr{margin-left:auto;color:#0369a1;font-weight:700}
.nota{color:#64748b;font-size:13px;text-align:center;margin-top:16px}`;
const html = (corpo, extra = {}) => new Response(`<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Area privata · Verba Manent</title><style>${STILE}</style></head><body><div class="w">${corpo}</div></body></html>`,
  { status: extra.status || 200, headers: { ...PRIV, 'content-type': 'text/html; charset=utf-8', ...(extra.headers || {}) } });

function entra(errore = '') {
  return html(`<form class="box" method="post" action="/privato"><div class="logo">🔒</div><h1>Area privata</h1><p class="s">Solo per Paolo: lista d'attesa e uso di Claude.</p>
    ${errore ? `<p class="err">${esc(errore)}</p>` : ''}
    <input class="in" type="password" name="password" placeholder="Password" aria-label="Password" autocomplete="current-password" autofocus required>
    <label class="ck"><input type="checkbox" name="ricorda" value="1" checked> Ricordami su questo computer per ${GIORNI} giorni</label>
    <button class="btn">Entra</button></form>`, { status: errore ? 401 : 200 });
}
const TORNA = '<p style="margin:0 0 14px"><a href="/privato" style="display:inline-block;background:#0d4275;color:#fff;text-decoration:none;padding:9px 14px;border-radius:10px;font-weight:600">← Area privata</a></p>';

export async function onRequest({ request, env, params }) {
  const via = [].concat(params.p || []).join('/');
  if (!env.VM_PASSWORD) return html('<div class="box"><h1>Area privata</h1><p class="s">La password non è ancora in Cloudflare (VM_PASSWORD).</p></div>', { status: 503 });

  if (request.method === 'POST' && !via) {
    const ip = request.headers.get('cf-connecting-ip') || '';
    const lim = 'limite:privato:' + ip;                         // al massimo 10 tentativi all'ora dallo stesso indirizzo
    const n = env.ATTESA ? parseInt(await env.ATTESA.get(lim) || '0', 10) : 0;
    if (n >= 10) return entra('Troppi tentativi: riprova tra un\'ora.');
    const f = await request.formData();
    const pw = String(f.get('password') || '');
    if (!uguali(await firma(env.VM_PASSWORD, pw), await firma(env.VM_PASSWORD, env.VM_PASSWORD))) {
      if (env.ATTESA) await env.ATTESA.put(lim, String(n + 1), { expirationTtl: 3600 });
      return entra('Password sbagliata.');
    }
    const ricorda = f.get('ricorda') === '1';
    const scade = Date.now() + (ricorda ? GIORNI : 1) * 86400000;
    const biscotto = `vm_privato=${scade}.${await firma(env.VM_PASSWORD, String(scade))}; Path=/privato; HttpOnly; Secure; SameSite=Strict` + (ricorda ? `; Max-Age=${GIORNI * 86400}` : '');
    return new Response(null, { status: 303, headers: { ...PRIV, location: '/privato', 'set-cookie': biscotto } });
  }
  if (via === 'esci') {
    return new Response(null, { status: 303, headers: { ...PRIV, location: '/privato', 'set-cookie': 'vm_privato=; Path=/privato; HttpOnly; Secure; SameSite=Strict; Max-Age=0' } });
  }
  if (!await dentro(request, env)) return entra();

  if (via === 'lista') return lista(env, new URL(request.url), '/privato/lista?csv=1', TORNA);
  if (via === 'uso') return uso(env, TORNA);

  // i due riquadri, con il numero principale gia' in vista
  let iscritti = 0, spesa = 0, domande = 0;
  if (env.ATTESA) {
    let cursor;
    do {
      const p = await env.ATTESA.list({ cursor });
      iscritti += p.keys.filter(c => !c.name.startsWith('limite:') && !c.name.startsWith('uso:')).length;
      cursor = p.list_complete ? null : p.cursor;
    } while (cursor);
    const ora = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
    const mese = ora.getFullYear() + '-' + String(ora.getMonth() + 1).padStart(2, '0');
    for (const d of Object.values((await datiUso(env))[mese] || {})) { spesa += d.usd || 0; domande += d.n || 0; }
  }
  const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const meseNome = MESI[new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' })).getMonth()];
  return html(`<div class="top"><h1>🔒 Area privata</h1><a class="esci" href="/privato/esci">Esci</a></div>
    <a class="card" href="/privato/lista"><span class="ic">📋</span><div><b>Lista d'attesa</b><span>${iscritti} ${iscritti === 1 ? 'iscritto' : 'iscritti'}</span></div><span class="fr">Apri ›</span></a>
    <a class="card" href="/privato/uso"><span class="ic">🔑</span><div><b>Uso di Claude · famiglia</b><span>${meseNome[0].toUpperCase() + meseNome.slice(1)}: $ ${spesa.toFixed(2).replace('.', ',')} · ${domande} ${domande === 1 ? 'domanda' : 'domande'}</span></div><span class="fr">Apri ›</span></a>
    <p class="nota">Con «Ricordami» resti dentro per ${GIORNI} giorni su questo computer, poi la password te la richiede.</p>`);
}
