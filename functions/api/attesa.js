// Lista d'attesa di Verba Manent: salva email, uso e lingua in Cloudflare KV (collegamento ATTESA).
// Le iscrizioni si vedono in Cloudflare: Storage & Databases › KV › verbamanent-attesa.
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

export async function onRequestPost({ request, env }) {
  const risposta = (ok, codice, stato = 200) =>
    new Response(JSON.stringify({ ok, codice }), { status: stato, headers: { 'content-type': 'application/json' } });
  if (!env.ATTESA) return risposta(false, 'non_attivo', 503);
  let d;
  try { d = await request.json(); } catch (e) { return risposta(false, 'dati', 400); }
  if (d.sito) return risposta(true, 'ok');                       // campo nascosto riempito: è un robot
  const email = String(d.email || '').trim().toLowerCase();
  if (!EMAIL.test(email)) return risposta(false, 'email', 400);
  const ip = request.headers.get('cf-connecting-ip') || '';
  const limite = 'limite:' + ip;                                 // al massimo 5 iscrizioni all'ora dallo stesso indirizzo
  const n = parseInt(await env.ATTESA.get(limite) || '0', 10);
  if (n >= 5) return risposta(false, 'troppe', 429);
  await env.ATTESA.put(limite, String(n + 1), { expirationTtl: 3600 });
  const gia = await env.ATTESA.get(email);
  if (!gia) {
    await env.ATTESA.put(email, JSON.stringify({
      uso: String(d.uso || '').slice(0, 60),
      lingua: d.lingua === 'en' ? 'en' : 'it',
      data: new Date().toISOString(),
    }));
  }
  return risposta(true, 'ok');
}

export function onRequest() {
  return new Response('Metodo non ammesso', { status: 405 });
}
