// La prova gratuita e' accesa? E quanti giorni dura? (senza accesso Google: serve al programma al primo avvio)
import { impostazioniProva } from './index.js';

export async function onRequestGet({ env }) {
  const c = env.ATTESA ? await impostazioniProva(env) : { attiva: false, giorni: 14 };
  return new Response(JSON.stringify(c), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
