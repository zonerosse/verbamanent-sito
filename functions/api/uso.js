// Pagina privata «Uso di Claude» (famiglia): https://verbamanent.app/api/uso?k=CHIAVE
// Stessa chiave della lista d'attesa: qui c'e' solo l'impronta (SHA-256), la chiave vera ce l'ha solo Paolo.
// I numeri li scrive functions/api/claude a ogni risposta di Claude (memoria ATTESA, chiavi uso:AAAA-MM:nome).
const IMPRONTA = 'df6c3259ec51a15226bf8f3c153395812eb774612d50810085469489c7f3d2b9';
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

async function sha256(t) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const dollari = x => '$ ' + (x || 0).toFixed(2).replace('.', ',');
const domande = n => (n || 0) + (n === 1 ? ' domanda' : ' domande');
const euro = x => '≈ € ' + ((x || 0) * 0.92).toFixed(2).replace('.', ',');

// dati: {'2026-10': {Paolo: {...}, Sara: {...}}, ...}
export function pagina(dati, oggi = new Date()) {
  const mesi = Object.keys(dati).sort().reverse();
  const nomeMese = m => { const [a, n] = m.split('-'); return MESI[+n - 1] + ' ' + a; };
  const quando = d => d ? new Date(d).toLocaleString('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
  const blocchi = mesi.map((m, i) => {
    const persone = Object.entries(dati[m]).sort((a, b) => (b[1].usd || 0) - (a[1].usd || 0));
    const tot = persone.reduce((s, [, d]) => s + (d.usd || 0), 0), n = persone.reduce((s, [, d]) => s + (d.n || 0), 0);
    const max = Math.max(0.0001, ...persone.map(([, d]) => d.usd || 0));
    const righe = persone.map(([nome, d]) => {
      const giorni = Object.entries(d.giorni || {}).sort((a, b) => +b[0] - +a[0]);
      return `<div class="p"><div class="r"><b>${esc(nome)}</b><span class="sp"></span><b>${dollari(d.usd)}</b><small>${euro(d.usd)}</small></div>
        <div class="bar"><i style="width:${Math.max(2, (d.usd || 0) / max * 100).toFixed(0)}%"></i></div>
        <div class="s">${domande(d.n)} · ultima ${esc(quando(d.ultimo))}</div>
        <details><summary>Giorno per giorno</summary><table>${giorni.map(([g, x]) => `<tr><td>${+g} ${MESI[+m.split('-')[1] - 1]}</td><td>${domande(x.n)}</td><td>${dollari(x.usd)}</td></tr>`).join('')}</table></details></div>`;
    }).join('');
    return `<section${i ? ' class="vecchio"' : ''}><h2>${esc(nomeMese(m))}</h2><div class="tot"><div><b>${dollari(tot)}</b><span>spesa del mese (${euro(tot)})</span></div><div><b>${n}</b><span>domande a Claude</span></div></div>${righe}</section>`;
  }).join('') || '<p class="s">Ancora nessuna domanda a Claude dalla famiglia.</p>';
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Uso di Claude · Verba Manent</title><style>
body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#eef4fa;color:#0f1b2d}
.w{max-width:760px;margin:0 auto;padding:22px 16px 40px}h1{font-size:22px;margin:0 0 4px}h2{font-size:18px;margin:26px 0 10px;text-transform:capitalize}
.s{color:#64748b;font-size:14px;margin:0 0 6px;line-height:1.5}
.tot{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.tot div,.p{background:#fff;border-radius:14px;padding:12px 14px;border:1px solid #e2e8f0}.tot b{display:block;font-size:24px;color:#0d4275}.tot span{font-size:13px;color:#64748b}
.p{margin-bottom:10px}.r{display:flex;align-items:baseline;gap:8px;font-size:16px}.sp{flex:1}.r small{color:#64748b}
.bar{height:8px;background:#e2e8f0;border-radius:6px;overflow:hidden;margin:8px 0}.bar i{display:block;height:100%;background:#0d4275}
details{margin-top:4px;font-size:14px}summary{cursor:pointer;color:#0369a1}table{width:100%;border-collapse:collapse;margin-top:6px}td{padding:5px 4px;border-top:1px solid #eef2f7}td:last-child{text-align:right}
.vecchio{opacity:.85}.nota{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:12px 14px;font-size:14px;line-height:1.5;margin-top:24px;color:#475569}
</style></head><body><div class="w"><h1>🔑 Uso di Claude · famiglia</h1>
<p class="s">Le domande a Claude fatte da Verba Manent sul web con la chiave «Verba Manent famiglia». Aggiornato al ${esc(quando(oggi.toISOString()))}.</p>
${blocchi}
<div class="nota">I costi sono calcolati qui con i prezzi ufficiali di Claude Sonnet 5.5; il conto preciso è nella console di Claude, in «Utilizzo». La cifra in euro è una stima. Claude non si ferma mai: se vedi una spesa strana, puoi cancellare la chiave «Verba Manent famiglia» nella console.</div>
</div></body></html>`;
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url), k = url.searchParams.get('k') || '';
  const priv = { 'x-robots-tag': 'noindex, nofollow', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' };
  if (!k || (await sha256(k)) !== IMPRONTA) return new Response('Non trovato', { status: 404, headers: priv });
  return rispondi(env);
}

export async function datiUso(env) {
  const dati = {};
  let cursor;
  do {
    const p = await env.ATTESA.list({ prefix: 'uso:', cursor });
    for (const c of p.keys) {
      const [, mese, nome] = c.name.split(':');
      try { (dati[mese] = dati[mese] || {})[nome] = JSON.parse(await env.ATTESA.get(c.name) || '{}'); } catch (e) {}
    }
    cursor = p.list_complete ? null : p.cursor;
  } while (cursor);
  return dati;
}

// la pagina: la usa anche l'Area privata (/privato/uso)
export async function rispondi(env, torna = '') {
  const priv = { 'x-robots-tag': 'noindex, nofollow', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' };
  if (!env.ATTESA) return new Response('Memoria non collegata (ATTESA)', { status: 503, headers: priv });
  const dati = await datiUso(env);
  return new Response(pagina(dati).replace('<div class="w">', '<div class="w">' + torna), { headers: { ...priv, 'content-type': 'text/html; charset=utf-8' } });
}
