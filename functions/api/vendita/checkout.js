// Il pagamento: chi ha scelto il piano accede con Google e qui gli prepariamo la pagina di pagamento
// del servizio esterno (Lemon Squeezy o Paddle). I dati della carta li vede solo il servizio, mai noi.
// L'abbonamento resta legato al Gmail di Google (non all'email scritta nel pagamento).
//   POST /api/vendita/checkout  {piano, periodo: 'mese'|'anno', lingua}  + intestazione X-VM-Google
//   -> {url}  pagina di pagamento  ·  {gia: true}  e' gia' abbonato  ·  {errore}
import { chi, ammesso } from '../claude/[[percorso]].js';
import { impostazioniVendita, controlli, json, PIANI_VENDITA } from './index.js';

export async function onRequestPost({ request, env }) {
  if (!env.ATTESA) return json({ errore: 'spenta' }, 503);
  const c = await impostazioniVendita(env);
  let d = {};
  try { d = await request.json(); } catch (e) {}
  const prova = d.prova === true && !c.attiva;       // la prova di Paolo: vendita spenta, solo famiglia
  if (prova ? !controlli(env, c)[0].ok : (!c.attiva || !controlli(env, c).every(x => x.ok))) return json({ errore: 'spenta' }, 403);
  const piano = PIANI_VENDITA.includes(d.piano) ? d.piano : null, periodo = d.periodo === 'anno' ? 'anno' : 'mese';
  if (!piano) return json({ errore: 'piano' }, 400);
  const email = await chi(request.headers.get('x-vm-google') || '');
  if (!email) return json({ errore: 'accesso' }, 401);
  const a = await ammesso(env, '', email);
  if (prova && (!a || a.piano !== 'Famiglia')) return json({ errore: 'spenta' }, 403);
  if (a && !prova) return json({ gia: true });

  const codice = c.prezzi[piano][periodo === 'anno' ? 'codice_anno' : 'codice_mese'];
  const origine = new URL(request.url).origin;
  const ritorno = origine + (d.lingua === 'en' ? '/en/subscription-active/' : '/abbonamento-attivo/') + (prova ? '?prova=1' : '');
  try {
    if (c.fornitore === 'lemonsqueezy') {
      const r = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
        method: 'POST',
        headers: { Accept: 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json', Authorization: 'Bearer ' + env.LEMONSQUEEZY_API_KEY },
        body: JSON.stringify({ data: { type: 'checkouts',
          attributes: { ...(prova ? { test_mode: true } : {}), checkout_data: { email, custom: prova ? { email, prova: '1' } : { email } }, product_options: { redirect_url: ritorno, enabled_variants: [+codice] } },
          relationships: { store: { data: { type: 'stores', id: String(env.LEMONSQUEEZY_STORE_ID) } }, variant: { data: { type: 'variants', id: String(codice) } } } } }),
      });
      const x = await r.json();
      const url = x && x.data && x.data.attributes && x.data.attributes.url;
      if (!r.ok || !url) return json({ errore: 'servizio' }, 502);
      return json({ url });
    }
    if (c.fornitore === 'paddle') {
      const base = env.PADDLE_SANDBOX ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';
      const r = await fetch(base + '/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.PADDLE_API_KEY },
        body: JSON.stringify({ items: [{ price_id: codice, quantity: 1 }], custom_data: prova ? { email, prova: '1' } : { email } }),
      });
      const x = await r.json();
      const url = x && x.data && x.data.checkout && x.data.checkout.url;
      if (!r.ok || !url) return json({ errore: 'servizio' }, 502);
      return json({ url });
    }
  } catch (e) {
    return json({ errore: 'servizio' }, 502);
  }
  return json({ errore: 'spenta' }, 403);
}

export function onRequest() {
  return new Response('Metodo non ammesso', { status: 405 });
}
