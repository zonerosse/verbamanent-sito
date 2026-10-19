// Elenco privato della lista d'attesa: https://verbamanent.app/api/lista?k=CHIAVE
// Qui c'e' solo l'impronta (SHA-256) della chiave: la chiave vera ce l'ha solo Paolo.
const IMPRONTA = 'df6c3259ec51a15226bf8f3c153395812eb774612d50810085469489c7f3d2b9';

async function sha256(t) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url), k = url.searchParams.get('k') || '';
  const priv = { 'x-robots-tag': 'noindex, nofollow', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' };
  if (!k || (await sha256(k)) !== IMPRONTA) return new Response('Non trovato', { status: 404, headers: priv });
  if (!env.ATTESA) return new Response('Lista non collegata (ATTESA)', { status: 503, headers: priv });
  const righe = [];
  let cursor;
  do {
    const p = await env.ATTESA.list({ cursor });
    for (const c of p.keys) {
      if (c.name.startsWith('limite:') || c.name.startsWith('uso:')) continue;
      let v = {};
      try { v = JSON.parse(await env.ATTESA.get(c.name) || '{}'); } catch (e) {}
      righe.push({ email: c.name, uso: v.uso || '', lingua: v.lingua || '', data: v.data || '' });
    }
    cursor = p.list_complete ? null : p.cursor;
  } while (cursor);
  righe.sort((a, b) => b.data.localeCompare(a.data));
  if (url.searchParams.get('csv')) {
    const csv = '﻿email;uso;lingua;data\n' + righe.map(r => [r.email, r.uso, r.lingua, r.data.slice(0, 16).replace('T', ' ')].map(x => '"' + String(x).replace(/"/g, '""') + '"').join(';')).join('\n');
    return new Response(csv, { headers: { ...priv, 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="lista-attesa-verbamanent.csv"' } });
  }
  const data = d => d ? new Date(d).toLocaleString('it-IT', { timeZone: 'Europe/Rome', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
  const conta = u => righe.filter(r => r.uso.includes(u)).length;
  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Lista d'attesa · Verba Manent</title><style>
body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#eef4fa;color:#0f1b2d}
.w{max-width:900px;margin:0 auto;padding:22px 16px}h1{font-size:22px;margin:0 0 4px}.s{color:#64748b;font-size:14px;margin:0 0 16px}
.n{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:16px}
.n div{background:#fff;border-radius:14px;padding:12px 14px;border:1px solid #e2e8f0}.n b{display:block;font-size:26px;color:#0d4275}.n span{font-size:13px;color:#64748b}
a.b{display:inline-block;background:#0369a1;color:#fff;text-decoration:none;padding:10px 16px;border-radius:12px;font-weight:700;margin-bottom:14px}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:14px;overflow:hidden;font-size:14px}
th,td{padding:10px 12px;border-bottom:1px solid #edf2f7;text-align:left}th{background:#f1f6fb;color:#0d4275;font-size:12.5px}
td.e{word-break:break-all}.v{color:#64748b;text-align:center;padding:30px}</style></head><body><div class="w">
<h1>Lista d'attesa</h1><p class="s">Chi vuole essere avvisato quando Verba Manent esce. Pagina privata: non condividere il link.</p>
<div class="n"><div><b>${righe.length}</b><span>iscritti in tutto</span></div><div><b>${conta('stud')}</b><span>per studiare</span></div><div><b>${conta('lavoro') + conta('work')}</b><span>per lavoro e riunioni</span></div><div><b>${conta('tutti') + conta('both')}</b><span>tutti e due</span></div></div>
<a class="b" href="?k=${encodeURIComponent(k)}&csv=1">⬇ Scarica l'elenco (Excel)</a>
<table><tr><th>Email</th><th>Lo userebbe per</th><th>Lingua</th><th>Iscritto il</th></tr>
${righe.length ? righe.map(r => `<tr><td class="e">${esc(r.email)}</td><td>${esc(r.uso.replace(/^.*?:\s*/, ''))}</td><td>${r.lingua === 'en' ? 'EN' : 'IT'}</td><td>${data(r.data)}</td></tr>`).join('') : '<tr><td colspan="4" class="v">Ancora nessun iscritto.</td></tr>'}
</table></div></body></html>`;
  return new Response(html, { headers: { ...priv, 'content-type': 'text/html; charset=utf-8' } });
}
