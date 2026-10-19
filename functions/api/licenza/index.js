// La prova gratuita del programma: quanti giorni restano a chi accede con Google.
// La data di inizio la tiene il sito (memoria ATTESA, chiavi prova:<email>), cosi' reinstallare non la fa ripartire.
// Le impostazioni le decide Paolo nel pannello (chiave config:prova = {attiva, giorni}): finche' e' spenta, tutti «libero».
//   GET /api/licenza/prova  -> {attiva, giorni}  (senza accesso: il programma sa se deve chiedere di accedere)
//   GET /api/licenza   (intestazione X-VM-Google: l'accesso Google del programma o della pagina web)
//   -> {stato: 'libero'}                         prova spenta: il programma funziona come sempre
//   -> {stato: 'abbonato', piano, tetto, usato}  famiglia o abbonato: Claude compreso
//   -> {stato: 'prova', giorni, fine}            in prova: giorni che restano (contando oggi)
//   -> {stato: 'scaduta', fine}                  prova finita: le lezioni restano, niente registrazioni e appunti nuovi
//   -> {stato: 'accesso'} (401)                  accesso Google mancante o scaduto
import { chi, ammesso, usato } from '../claude/[[percorso]].js';

const ANNO = 365 * 86400;
const PRIV = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', 'content-type': 'application/json' };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: PRIV });

export async function impostazioniProva(env) {
  let c = {};
  try { c = JSON.parse(await env.ATTESA.get('config:prova') || '{}'); } catch (e) {}
  return { attiva: !!c.attiva, giorni: Math.max(1, Math.min(90, parseInt(c.giorni, 10) || 14)) };
}

export async function onRequestGet({ request, env }) {
  if (!env.ATTESA) return json({ stato: 'libero' });
  const email = await chi(request.headers.get('x-vm-google') || '');
  if (!email) return json({ stato: 'accesso' }, 401);
  const a = await ammesso(env, '', email);
  if (a) return json({ stato: 'abbonato', piano: a.piano, tetto: a.tetto, usato: a.tetto ? await usato(env, a.id) : null });
  const cfg = await impostazioniProva(env);
  if (!cfg.attiva) return json({ stato: 'libero' });
  const k = 'prova:' + email;
  let p = null;
  try { p = JSON.parse(await env.ATTESA.get(k) || 'null'); } catch (e) {}
  if (!p) {
    p = { inizio: new Date().toISOString(), ultimo: new Date().toISOString() };
  }
  p.ultimo = new Date().toISOString();
  const fine = new Date(new Date(p.inizio).getTime() + cfg.giorni * 86400000);
  // privacy: la prova si cancella da sola 12 mesi dopo la fine (o dopo l'ultimo uso, se e' piu' tardi)
  const via = Math.floor(Math.max(fine.getTime(), Date.now()) / 1000) + ANNO;
  await env.ATTESA.put(k, JSON.stringify(p), { expiration: via });
  const resta = fine - Date.now();
  if (resta > 0) return json({ stato: 'prova', giorni: Math.ceil(resta / 86400000), fine: fine.toISOString(), giorni_prova: cfg.giorni });
  return json({ stato: 'scaduta', fine: fine.toISOString(), giorni_prova: cfg.giorni });
}
