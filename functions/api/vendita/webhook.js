// Il servizio di pagamento ci avvisa qui (nuovo abbonamento, rinnovo, disdetta, scadenza).
// Indirizzo da mettere nel servizio: https://verbamanent.app/api/vendita/webhook
// Ogni avviso e' firmato con il segreto messo in Cloudflare: senza la firma giusta lo scartiamo.
// L'abbonato entra (o si aggiorna) nell'elenco del pannello con origine «pagamento».
// Funziona anche a vendita spenta: chi ha gia' pagato continua a ricevere rinnovi e disdette.
import { impostazioniVendita, dalCodice, json } from './index.js';

const GRAZIA = 3 * 86400000;            // 3 giorni dopo il rinnovo, se il pagamento tarda
const esa = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
async function hmac(segreto, testo) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(segreto), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return esa(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(testo)));
}
function uguali(a, b) {
  a = String(a || ''); b = String(b || '');
  if (!a || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
const dopo = (d, ms) => d ? new Date(new Date(d).getTime() + ms).toISOString() : null;

// Lemon Squeezy -> {email, sub, cliente, codice, stato, rinnovo, fine, carta}
function daLemon(x) {
  if (!x.data || x.data.type !== 'subscriptions') return null;
  const a = x.data.attributes || {}, cu = (x.meta || {}).custom_data || {};
  return { fornitore: 'lemonsqueezy', email: cu.email || a.user_email, sub: String(x.data.id), cliente: String(a.customer_id || ''),
    codice: String(a.variant_id || ''), stato: a.status, rinnovo: a.renews_at || null, fine: a.ends_at || null,
    carta: a.card_last_four ? `${a.card_brand ? a.card_brand[0].toUpperCase() + a.card_brand.slice(1) : 'Carta'} •••• ${a.card_last_four}` : '' };
}
// Paddle -> stessa forma
function daPaddle(x) {
  if (!String(x.event_type || '').startsWith('subscription.')) return null;
  const d = x.data || {}, cu = d.custom_data || {};
  const it = (d.items || [])[0] || {};
  const sc = d.scheduled_change && d.scheduled_change.action === 'cancel' ? d.scheduled_change.effective_at : null;
  const stato = d.status === 'canceled' ? 'expired' : sc ? 'cancelled' : d.status;
  return { fornitore: 'paddle', email: cu.email, sub: String(d.id || ''), cliente: String(d.customer_id || ''), codice: String((it.price || {}).id || ''),
    stato, rinnovo: d.next_billed_at || null, fine: sc || (d.status === 'canceled' ? (d.canceled_at || (d.current_billing_period || {}).ends_at) : null), carta: '' };
}

export async function onRequestPost({ request, env }) {
  if (!env.ATTESA) return json({ ok: false }, 503);
  const corpo = await request.text();
  let ev = null;
  const ls = request.headers.get('x-signature'), pd = request.headers.get('paddle-signature');
  try {
    if (ls && env.LEMONSQUEEZY_WEBHOOK_SECRET) {
      if (!uguali(ls, await hmac(env.LEMONSQUEEZY_WEBHOOK_SECRET, corpo))) return json({ ok: false }, 401);
      ev = daLemon(JSON.parse(corpo));
    } else if (pd && env.PADDLE_WEBHOOK_SECRET) {
      const p = Object.fromEntries(pd.split(';').map(s => s.split('=')));
      if (!p.ts || Math.abs(Date.now() / 1000 - +p.ts) > 300) return json({ ok: false }, 401);
      if (!uguali(p.h1, await hmac(env.PADDLE_WEBHOOK_SECRET, p.ts + ':' + corpo))) return json({ ok: false }, 401);
      ev = daPaddle(JSON.parse(corpo));
    } else return json({ ok: false }, 401);
  } catch (e) { return json({ ok: false }, 400); }
  if (!ev) return json({ ok: true, ignorato: true });

  const email = String(ev.email || '').trim().toLowerCase();
  if (!email) return json({ ok: true, ignorato: 'email' });
  const c = await impostazioniVendita(env), quale = dalCodice(c, ev.codice);
  const k = 'abbonato:' + email;
  let ab = null;
  try { ab = JSON.parse(await env.ATTESA.get(k) || 'null'); } catch (e) {}
  if (ab && ab.piano === 'Famiglia') return json({ ok: true, ignorato: 'famiglia' });

  const attivo = ['active', 'on_trial', 'past_due', 'trialing'].includes(ev.stato);
  let scade;
  if (attivo) scade = dopo(ev.rinnovo, GRAZIA) || dopo(new Date().toISOString(), 35 * 86400000);
  else if (ev.stato === 'cancelled') scade = ev.fine || dopo(ev.rinnovo, 0);
  else scade = ev.fine || new Date().toISOString();         // expired, unpaid, paused: finito
  const nuovo = { ...(ab || {}), nome: (ab && ab.nome) || email.split('@')[0], piano: quale ? quale.piano : ((ab && ab.piano) || 'Studente'),
    dal: (ab && ab.dal) || new Date().toISOString(), scade, tetto: quale ? quale.claude : ((ab && ab.tetto) || null), origine: 'pagamento',
    pag: { fornitore: ev.fornitore, sub: ev.sub, cliente: ev.cliente, stato: ev.stato, periodo: quale ? quale.periodo : ((ab && ab.pag && ab.pag.periodo) || 'mese'),
      prezzo: quale ? quale.prezzo : ((ab && ab.pag && ab.pag.prezzo) || null), rinnovo: attivo ? ev.rinnovo : null, fine: attivo ? null : scade,
      carta: ev.carta || ((ab && ab.pag && ab.pag.carta) || ''), agg: new Date().toISOString() } };
  // privacy: finito l'abbonamento, i suoi dati si cancellano da soli 12 mesi dopo la fine
  const via = attivo ? null : Math.floor(Math.max(new Date(scade).getTime() || 0, Date.now()) / 1000) + 365 * 86400;
  await env.ATTESA.put(k, JSON.stringify(nuovo), via ? { expiration: via } : undefined);
  return json({ ok: true });
}

export function onRequest() {
  return new Response('Metodo non ammesso', { status: 405 });
}
