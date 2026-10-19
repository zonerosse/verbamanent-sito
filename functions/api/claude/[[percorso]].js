// Claude «gia' pronto» per la famiglia e gli abbonati su Verba Manent sul web (/studia/).
// La chiave di Claude sta SOLO nella cassaforte di Cloudflare (variabile segreta ANTHROPIC_API_KEY):
// non e' nel codice e non arriva mai al browser. Chi chiama deve mandare il suo accesso Google
// (X-VM-Google): controllo che sia stato dato a Verba Manent e che l'account sia nell'elenco.
// Nell'elenco ci sono solo le impronte (SHA-256) degli indirizzi, non gli indirizzi.
//   GET  /api/claude/stato        -> {famiglia: true|false}
//   GET  /api/claude/v1/models    -> come Claude (prova della chiave)
//   POST /api/claude/v1/messages  -> come Claude
// Le domande passano di qui e vanno a Claude: non si salvano da nessuna parte.
const CLIENT_ID = '303488426536-mqi6a2cd59sis931tb6nmmltrjfrclkf.apps.googleusercontent.com';
// gli accessi Google validi: quelli dati a Verba Manent (pagina web e programma, stesso progetto Google)
const PROGETTO = '303488426536-';
const nostro = t => [t.aud, t.azp].some(x => String(x || '').startsWith(PROGETTO) && String(x).endsWith('.apps.googleusercontent.com'));
const IMPRONTE = new Map([
  ['3a1ab56353f71b067bd217e90c3a098a3d10971d2dd44648935354c908713900', 'Paolo'],
  ['1a8850eab1d16634bb85e18444151ba896a454ed059d3f511c6b49ace7dc5790', 'Sara'],
  ['45ee0a913732bce39f3a47f99a39723a3a003e0b19d3351ea6c92e0e27168e94', 'Lorenzo'],
]);
// prezzi in dollari per milione di token (platform.claude.com/docs/en/about-claude/pricing, ottobre 2026)
const PREZZI = {
  'sonnet': { in: 2, out: 10, cw: 2.5, cr: 0.10 },
  'haiku': { in: 0.10, out: 0.50, cw: 0.125, cr: 0.01 },
  'opus': { in: 4, out: 20, cw: 5, cr: 0.20 },
};
const PRIV = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', 'content-type': 'application/json' };
const visti = new Map();      // token -> {email, fino}: per non chiedere a Google a ogni domanda

async function sha256(t) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: PRIV });
const errore = (status, msg) => json({ type: 'error', error: { type: 'vm', message: msg } }, status);

export async function chi(token) {
  if (!token) return null;
  const v = visti.get(token);
  if (v && v.fino > Date.now()) return v.email;
  const ti = await fetch('https://oauth2.googleapis.com/tokeninfo?access_token=' + encodeURIComponent(token));
  if (!ti.ok) return null;
  const t = await ti.json();
  if (!nostro(t)) return null;          // accesso dato a un'altra app: no
  const ab = await fetch('https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)', { headers: { Authorization: 'Bearer ' + token } });
  if (!ab.ok) return null;
  const email = String(((await ab.json()).user || {}).emailAddress || '').trim().toLowerCase();
  if (!email) return null;
  visti.set(token, { email, fino: Date.now() + Math.min(50, Math.max(1, +t.expires_in / 60 || 5)) * 60000 });
  if (visti.size > 500) visti.delete(visti.keys().next().value);
  return email;
}

// Chi puo' usare Claude di Verba Manent: la famiglia (impronte qui sopra, sempre) e gli abbonati
// dell'elenco nel pannello (memoria ATTESA, chiavi abbonato:<email>). Torna {id, nome, piano, tetto} o null.
// id = la riga dei consumi (uso:AAAA-MM:<id>): il nome per la famiglia, l'email per gli altri.
export async function ammesso(env, token, email_ = null) {
  const email = email_ || await chi(token);
  if (!email) return null;
  const fam = IMPRONTE.get(await sha256(email));
  let ab = null;
  if (env.ATTESA) { try { ab = JSON.parse(await env.ATTESA.get('abbonato:' + email) || 'null'); } catch (e) {} }
  if (fam) {
    if (!ab && env.ATTESA) {       // la famiglia entra da sola nell'elenco del pannello (l'indirizzo arriva da Google, non dal codice)
      ab = { id: fam, nome: fam, piano: 'Famiglia', dal: new Date().toISOString(), scade: null, tetto: null, origine: 'manuale' };
      await env.ATTESA.put('abbonato:' + email, JSON.stringify(ab));
    }
    return { id: fam, nome: fam, piano: 'Famiglia', tetto: null };
  }
  const extra = String(env.VM_FAMIGLIA || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
  if (extra.includes(email)) return { id: email, nome: email.split('@')[0], piano: 'Famiglia', tetto: null };
  if (!ab || (ab.scade && new Date(ab.scade) < new Date())) return null;
  return { id: email, nome: ab.nome || email.split('@')[0], piano: ab.piano || 'Studente', tetto: ab.tetto ? +ab.tetto : null };
}

const meseRoma = () => { const o = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' })); return o.getFullYear() + '-' + String(o.getMonth() + 1).padStart(2, '0'); };
export async function usato(env, id) {
  if (!env.ATTESA) return 0;
  try { return +(JSON.parse(await env.ATTESA.get(`uso:${meseRoma()}:${id}`) || '{}').usd || 0); } catch (e) { return 0; }
}

// «Uso di Claude»: quante domande e quanto si spende, per persona e per giorno (nella memoria ATTESA, chiavi uso:...)
async function segna(env, nome, risposta) {
  if (!env.ATTESA) return;
  const u = risposta.usage || {};
  const fam = Object.keys(PREZZI).find(k => String(risposta.model || '').includes(k)) || 'sonnet';
  const p = PREZZI[fam];
  const t = { in: +u.input_tokens || 0, out: +u.output_tokens || 0, cw: +u.cache_creation_input_tokens || 0, cr: +u.cache_read_input_tokens || 0 };
  const usd = (t.in * p.in + t.out * p.out + t.cw * p.cw + t.cr * p.cr) / 1e6;
  const ora = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' }));
  const mese = ora.getFullYear() + '-' + String(ora.getMonth() + 1).padStart(2, '0'), giorno = String(ora.getDate()).padStart(2, '0');
  const chiave = `uso:${mese}:${nome}`;
  let d = {};
  try { d = JSON.parse(await env.ATTESA.get(chiave) || '{}'); } catch (e) {}
  d.n = (d.n || 0) + 1; d.usd = (d.usd || 0) + usd;
  for (const k of Object.keys(t)) d[k] = (d[k] || 0) + t[k];
  d.giorni = d.giorni || {};
  const g = d.giorni[giorno] || { n: 0, usd: 0 };
  g.n++; g.usd += usd; d.giorni[giorno] = g;
  d.ultimo = new Date().toISOString();
  await env.ATTESA.put(chiave, JSON.stringify(d));
}

export async function onRequest({ request, env, params, waitUntil }) {
  const percorso = [].concat(params.percorso || []).join('/');
  const token = request.headers.get('x-vm-google') || '';
  if (percorso === 'stato') {
    const a = env.ANTHROPIC_API_KEY ? await ammesso(env, token) : null;
    if (!a) return json({ famiglia: false });
    return json({ famiglia: true, piano: a.piano, tetto: a.tetto, usato: a.tetto ? await usato(env, a.id) : null });
  }
  const permesso = (percorso === 'v1/messages' && request.method === 'POST') || (percorso.startsWith('v1/models') && request.method === 'GET');
  if (!permesso) return errore(404, 'non trovato');
  if (!env.ANTHROPIC_API_KEY) return errore(503, 'Claude di Verba Manent non è ancora acceso (manca la chiave in Cloudflare).');
  const a = await ammesso(env, token);
  if (!a) return errore(403, "Questo account Google non ha l'abbonamento a Verba Manent: metti la tua chiave di Claude in Impostazioni.");
  if (a.tetto && percorso === 'v1/messages' && await usato(env, a.id) >= a.tetto) {
    return errore(400, 'Hai usato tutto il Claude compreso nel tuo abbonamento per questo mese: si riattiva il 1° del mese prossimo. Puoi passare a Studente Plus da «Il mio abbonamento».');
  }
  const u = new URL(request.url);
  const r = await fetch('https://api.anthropic.com/' + percorso + u.search, {
    method: request.method,
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': request.headers.get('anthropic-version') || '2023-06-01',
      'content-type': 'application/json',
    },
    body: request.method === 'POST' ? await request.arrayBuffer() : undefined,
  });
  const corpo = await r.text();
  if (r.ok && percorso === 'v1/messages') {
    try { const x = segna(env, a.id, JSON.parse(corpo)); waitUntil ? waitUntil(x) : await x; } catch (e) {}
  }
  return new Response(corpo, { status: r.status, headers: { ...PRIV, 'content-type': r.headers.get('content-type') || 'application/json' } });
}
