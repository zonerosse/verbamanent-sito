// La vendita degli abbonamenti: SPENTA finche' Paolo non la accende nel pannello (/privato/abbonati).
// Le impostazioni stanno nella memoria del sito (chiave config:vendita); le chiavi del servizio di pagamento
// stanno SOLO nella cassaforte di Cloudflare (variabili segrete), mai nel codice:
//   Lemon Squeezy: LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID, LEMONSQUEEZY_WEBHOOK_SECRET
//   Paddle:        PADDLE_API_KEY, PADDLE_WEBHOOK_SECRET   (PADDLE_SANDBOX=1 per le prove)
//   GET /api/vendita  -> {attiva:false}  oppure  {attiva:true, piani:[{piano, mese, anno, claude}]}
// Le altre strade: /api/vendita/checkout (paga), /api/vendita/webhook (il servizio ci avvisa), /api/vendita/mio.

export const PIANI_VENDITA = ['Studente', 'Studente Plus'];
const ESEMPIO = {
  'Studente': { mese: 6.99, anno: 69.90, claude: 3, codice_mese: '', codice_anno: '' },
  'Studente Plus': { mese: 11.99, anno: 119.90, claude: 6, codice_mese: '', codice_anno: '' },
};
export const FORNITORI = {
  lemonsqueezy: { nome: 'Lemon Squeezy', segreti: ['LEMONSQUEEZY_API_KEY', 'LEMONSQUEEZY_STORE_ID', 'LEMONSQUEEZY_WEBHOOK_SECRET'], commissione: [0.05, 0.50] },
  paddle: { nome: 'Paddle', segreti: ['PADDLE_API_KEY', 'PADDLE_WEBHOOK_SECRET'], commissione: [0.05, 0.50] },
};
const PRIV = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', 'content-type': 'application/json' };
export const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: PRIV });

export async function impostazioniVendita(env) {
  let c = {};
  try { c = JSON.parse(await env.ATTESA.get('config:vendita') || '{}'); } catch (e) {}
  const prezzi = {};
  for (const p of PIANI_VENDITA) prezzi[p] = { ...ESEMPIO[p], ...((c.prezzi || {})[p] || {}) };
  return { attiva: !!c.attiva, dal: c.dal || null, fornitore: FORNITORI[c.fornitore] ? c.fornitore : (c.fornitore === '' ? '' : 'lemonsqueezy'),   // scelto da Paolo: Lemon Squeezy
    prezzi_ok: !!c.prezzi_ok, condizioni: !!c.condizioni, fiscale: !!c.fiscale, prezzi };
}
export async function salvaVendita(env, c) {
  await env.ATTESA.put('config:vendita', JSON.stringify(c));
}

// Le quattro cose da fare prima di poter accendere: [{ok, titolo, dettaglio}]
export function controlli(env, c) {
  const f = FORNITORI[c.fornitore];
  const mancano = f ? f.segreti.filter(s => !env[s]) : [];
  const codici = PIANI_VENDITA.every(p => c.prezzi[p].codice_mese && c.prezzi[p].codice_anno);
  const pag = !!f && !mancano.length && codici;
  return [
    { id: 'pagamento', ok: pag, auto: true, titolo: 'Servizio di pagamento collegato',
      dettaglio: !f ? 'Account Lemon Squeezy o Paddle, chiavi in Cloudflare' : mancano.length ? `${f.nome}: in Cloudflare mancano ${mancano.join(', ')}` : !codici ? `${f.nome}: mancano i codici dei piani (qui sotto)` : `${f.nome}, chiavi in Cloudflare` },
    { id: 'prezzi', ok: c.prezzi_ok, auto: true, titolo: 'Prezzi decisi', dettaglio: c.prezzi_ok ? 'Salvati qui sotto' : 'Qui sotto, per ogni piano: poi «Salva i prezzi»' },
    { id: 'condizioni', ok: c.condizioni, titolo: "Condizioni d'uso e privacy pronte", dettaglio: 'Le prepara Claude, le controlli tu' },
    { id: 'fiscale', ok: c.fiscale, titolo: 'Posizione fiscale a posto', dettaglio: 'La spunti tu, dopo il commercialista' },
  ];
}

// piano e periodo a partire dal codice del servizio di pagamento (variante Lemon Squeezy o prezzo Paddle)
export function dalCodice(c, codice) {
  for (const p of PIANI_VENDITA) {
    const x = c.prezzi[p];
    if (String(x.codice_mese) === String(codice)) return { piano: p, periodo: 'mese', prezzo: x.mese, claude: x.claude };
    if (String(x.codice_anno) === String(codice)) return { piano: p, periodo: 'anno', prezzo: x.anno, claude: x.claude };
  }
  return null;
}

export async function onRequestGet({ env }) {
  if (!env.ATTESA) return json({ attiva: false });
  const c = await impostazioniVendita(env);
  if (!c.attiva) return json({ attiva: false });
  return new Response(JSON.stringify({ attiva: true, piani: PIANI_VENDITA.map(p => ({ piano: p, mese: c.prezzi[p].mese, anno: c.prezzi[p].anno, claude: c.prezzi[p].claude })) }),
    { headers: { ...PRIV, 'cache-control': 'public, max-age=60' } });
}
