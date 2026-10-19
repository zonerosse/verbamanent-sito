---
date: 2026-10-19
title: "Privacy: le aggiunte per prova e abbonamento"
description: "Bozza delle aggiunte alla privacy di Verba Manent IA per la prova gratuita e l'abbonamento."
nascosta: true
url: "/privacy-abbonamento/"
build:
  list: never
sitemap:
  disable: true
---

<div class="bozza"><b>Bozza da rileggere.</b> Sono le parti da aggiungere alla pagina <a href="/privacy/">Privacy</a> il giorno in cui accendi la prova gratuita o la vendita. Finché sono spente, la privacy pubblicata resta com'è.</div>

## Cosa cambia nella tabella «Cosa esce dal tuo computer»

La riga «Codice di attivazione e un identificativo del computer → il servizio che gestisce le vendite» **si toglie** e al suo posto vanno queste due:

| Cosa | Verso chi | Perché |
|---|---|---|
| Il tuo **indirizzo Gmail**, solo se la prova gratuita è attiva o se ti abboni | Il nostro sito verbamanent.app | Per sapere quanti giorni di prova ti restano, o se hai l'abbonamento. Lo prendiamo da Google con lo stesso permesso di Drive descritto sotto |
| Il tuo **indirizzo email e i dati di pagamento**, solo se ti abboni | Lemon Squeezy, che vende l'abbonamento per noi | Per incassare, applicare l'IVA e mandarti le ricevute. Noi non vediamo i dati della carta |

## Nuova sezione: «Prova gratuita e abbonamento»

**Cosa conserviamo sul nostro sito** (memoria di Cloudflare, in Europa e negli Stati Uniti):

- **Prova gratuita:** il tuo indirizzo Gmail, il giorno in cui hai iniziato la prova e l'ultimo giorno in cui hai usato il programma.
- **Abbonamento:** il tuo indirizzo Gmail, il piano, da quando sei abbonato, la scadenza o il rinnovo, lo stato (attivo o disdetto), il tipo di carta e le ultime 4 cifre, e i codici con cui Lemon Squeezy riconosce il tuo abbonamento.
- **Uso di Claude compreso:** per ogni giorno, quante domande hai fatto a Claude e quanto sono costate. **Non conserviamo il contenuto** delle domande né delle risposte: il testo passa dal nostro sito solo per arrivare ad Anthropic, poi non resta da nessuna parte.

**Perché:** per darti il servizio che hai chiesto (contare i giorni di prova, sapere se hai l'abbonamento, rispettare il tetto mensile di Claude). La base giuridica è il contratto con te.

**Per quanto tempo:** finché sei in prova o abbonato, e poi per [12 mesi] dalla fine, per poterti riconoscere se torni e per rispondere a eventuali richieste. Dopo li cancelliamo. Puoi chiedere di cancellarli prima scrivendo a [info@puntowebferrara.com](mailto:info@puntowebferrara.com).

**Lemon Squeezy** (Lemon Squeezy LLC, una società del gruppo Stripe) vende l'abbonamento come *merchant of record*. Per il pagamento è un **titolare autonomo** dei tuoi dati: riceve il nome, l'email, il Paese e i dati di pagamento, li tratta secondo la [sua informativa privacy](https://lemonsqueezy.com/privacy) e conserva le ricevute per il tempo richiesto dalle leggi fiscali. Lemon Squeezy ha sede negli Stati Uniti: il trasferimento dei dati è protetto dalle garanzie previste dal GDPR.

**Anthropic** riceve il testo delle domande a Claude anche con l'abbonamento, come già spiegato sopra, ma attraverso la nostra chiave e non la tua: Anthropic non sa chi sei.

## Nella sezione «Questo sito»

Si aggiunge una riga: le pagine Abbonati e Il mio abbonamento usano l'accesso con Google solo per leggere il tuo indirizzo Gmail. Il sito non mette cookie per questo: l'accesso dura finché la pagina è aperta.
