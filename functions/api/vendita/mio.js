// «Il mio abbonamento»: chi ha accesso con Google vede il suo piano, il rinnovo e quanto Claude ha usato.
// Per cambiare carta, scaricare le ricevute, cambiare piano o disdire lo mandiamo alla pagina del servizio di pagamento.
//   GET /api/vendita/mio  + intestazione X-VM-Google
//   -> {email, abbonato: false, vendita}  oppure  {email, abbonato: true, piano, stato, origine, scade, rinnovo, periodo, prezzo, carta, tetto, usato, portale, vendita}
import { chi, ammesso, usato } from '../claude/[[percorso]].js';
import { impostazioniVendita, json } from './index.js';

async function portale(env, pag) {
  try {
    if (pag.fornitore === 'lemonsqueezy' && env.LEMONSQUEEZY_API_KEY && pag.sub) {
      const r = await fetch('https://api.lemonsqueezy.com/v1/subscriptions/' + encodeURIComponent(pag.sub), {
        headers: { Accept: 'application/vnd.api+json', Authorization: 'Bearer ' + env.LEMONSQUEEZY_API_KEY } });
      const x = await r.json();
      return (((x.data || {}).attributes || {}).urls || {}).customer_portal || null;
    }
    if (pag.fornitore === 'paddle' && env.PADDLE_API_KEY && pag.cliente) {
      const base = env.PADDLE_SANDBOX ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';
      const r = await fetch(`${base}/customers/${encodeURIComponent(pag.cliente)}/portal-sessions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.PADDLE_API_KEY },
        body: JSON.stringify({ subscription_ids: pag.sub ? [pag.sub] : [] }) });
      const x = await r.json();
      return (((x.data || {}).urls || {}).general || {}).overview || null;
    }
  } catch (e) {}
  return null;
}

export async function onRequestGet({ request, env }) {
  const email = await chi(request.headers.get('x-vm-google') || '');
  if (!email) return json({ errore: 'accesso' }, 401);
  if (!env.ATTESA) return json({ email, abbonato: false, vendita: false });
  const vendita = (await impostazioniVendita(env)).attiva;
  const a = await ammesso(env, '', email);
  let ab = null;
  try { ab = JSON.parse(await env.ATTESA.get('abbonato:' + email) || 'null'); } catch (e) {}
  if (!a) return json({ email, abbonato: false, scaduto: !!ab, vendita });
  const pag = (ab && ab.pag) || null;
  return json({ email, abbonato: true, vendita, piano: a.piano, origine: (ab && ab.origine) || 'manuale',
    stato: pag ? pag.stato : 'active', scade: (ab && ab.scade) || null, rinnovo: pag ? pag.rinnovo : null, periodo: pag ? pag.periodo : null,
    prezzo: pag ? pag.prezzo : null, carta: pag ? pag.carta : '', tetto: a.tetto, usato: a.tetto ? await usato(env, a.id) : null,
    portale: pag ? await portale(env, pag) : null });
}
