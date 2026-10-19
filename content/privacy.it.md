---
date: 2026-10-16
title: "Privacy"
description: "Come Verba Manent tratta i tuoi dati: le registrazioni restano sul tuo computer, nessun dato biometrico, nessun addestramento di intelligenza artificiale."
---

<div class="bozza"><b>Bozza.</b> Questo testo va fatto rileggere da un esperto di privacy prima della pubblicazione.</div>

<div class="evid">

**In breve**

- Le registrazioni, le trascrizioni e gli appunti restano **sul tuo computer**. Noi non li riceviamo e non li conserviamo.
- **Nessun dato biometrico.** “Chi parla” distingue le voci solo mentre lavora, poi cancella ogni traccia. Verba Manent non conserva nessuna impronta della voce.
- Le tue lezioni e riunioni **non vengono usate per addestrare** nessuna intelligenza artificiale.

</div>

{{< vm-schermata img="prima-di-iniziare" didascalia="Al primo avvio Verba Manent riassume tutto questo in un riquadro, e lo rileggi quando vuoi in Impostazioni › Privacy." >}}

## Chi è il titolare del trattamento

Sara Boldrini, che opera con il nome commerciale Punto Web Ferrara  
Ostellato (FE), Italia  
Email: [info@puntowebferrara.com](mailto:info@puntowebferrara.com)

## Cosa resta sul tuo computer

Registrazioni audio e video, trascrizioni, appunti, flashcard, nomi che dai alle voci e impostazioni restano in una cartella del tuo computer scelta da te. La tua chiave Claude, se la usi, è salvata sul tuo computer protetta dal sistema operativo.

## Cosa esce dal tuo computer, e verso chi

| Cosa | Verso chi | Perché |
|---|---|---|
| Il **testo** della trascrizione (mai l'audio) | Anthropic, che fornisce l'intelligenza artificiale Claude | Per creare gli appunti. Con l'abbonamento il testo passa dal nostro server, che lo inoltra e **non lo conserva** |
| L'**audio**, solo se scegli tu «Sul server» in Impostazioni › Dove trascrivo | Il tuo server di trascrizione su RunPod (il tuo conto, in Europa) | Per trascrivere più in fretta. L'audio viene cancellato dal server a lavoro finito. Di serie questa opzione è spenta e l'audio non esce dal computer |
| Una **copia** di appunti, trascrizione e, se lo scegli, audio, **solo se attivi «Copia nel cloud»** | Il tuo Google Drive, il tuo OneDrive o una cartella che scegli tu | Per ritrovare le lezioni dal telefono o da un altro computer. Noi non vediamo niente: è il tuo spazio |
| Lezioni, appunti e ripasso, **solo se colleghi il telefono a un computer con «Sincronizza»** (Wi-Fi) | Direttamente all'altro tuo dispositivo, sulla tua rete di casa o sull'hotspot del telefono | Per avere le stesse lezioni sul PC e sul telefono. Non passa da internet né da nessun nostro server |
| Le lezioni chiuse in **zip con password**, **solo se attivi «Sincronizza anche fuori casa»** | Il tuo Google Drive o il tuo OneDrive | Per sincronizzare PC e telefono anche quando sono lontani. Senza la password nessuno apre gli zip, nemmeno Google, Microsoft o noi. Vedi sotto |
| Il tuo **indirizzo Gmail**, solo se la prova gratuita è attiva o se hai l'abbonamento (anche «Omaggio» o famiglia) | Il nostro sito verbamanent.app | Per sapere quanti giorni di prova ti restano, o se Claude è compreso per te. Vedi «Prova gratuita e abbonamento» qui sotto |
| Rapporti tecnici sugli errori, **solo se acconsenti** (puoi cambiare idea in Impostazioni › Privacy) | Sentry, con i dati in Europa (Germania) | Per correggere i problemi. Contengono solo il punto del programma in cui è successo l'errore, la versione e il tipo di computer. Mai registrazioni, trascrizioni, appunti, nomi di file o di persone, chiavi |

## Google Drive e OneDrive («Sincronizza anche fuori casa»)

Se attivi questa funzione, accedi con il tuo account Google o Microsoft e dai a Verba Manent il permesso **più piccolo possibile**:

- **Google Drive:** Verba Manent vede e gestisce **solo i file che crea lui** (permesso «drive.file»), cioè la cartella «Verba Manent IA». Non vede, non legge e non modifica nessun altro file del tuo Drive. Legge anche la tua **email**, solo per mostrarti a quale account è collegato.
- **OneDrive:** Verba Manent usa **solo la sua cartella** (App › Verba Manent IA) e legge il tuo nome utente o la tua email per lo stesso motivo.

Cosa mette Verba Manent nel tuo cloud: uno zip per lezione e uno per lo studio, **cifrati con AES-256** con una password creata sul tuo dispositivo, più un elenco delle lezioni (anch'esso cifrato) e un file di istruzioni. Gli zip hanno **un codice al posto del nome**: chi guarda il tuo Drive non vede quali lezioni hai.

L'accesso al tuo cloud resta **solo sui tuoi dispositivi**: non lo riceviamo e non abbiamo server che leggono il tuo Drive o il tuo OneDrive. Quando colleghi il telefono al PC con il QR, il PC gli passa accesso e password direttamente, sulla tua rete. Non usiamo i dati del tuo cloud per pubblicità, non li vendiamo e non li usiamo per addestrare intelligenze artificiali.

Puoi togliere il permesso quando vuoi: in Verba Manent con «Scollega il cloud», oppure dal tuo account ([Google](https://myaccount.google.com/permissions), [Microsoft](https://account.live.com/consent/Manage)). Gli zip restano nel tuo cloud finché non li cancelli tu.

L'uso e il trasferimento ad altre app delle informazioni ricevute dalle API di Google da parte di Verba Manent IA rispettano le [Norme sui dati utente dei servizi API di Google](https://developers.google.com/terms/api-services-user-data-policy), inclusi i requisiti di Uso limitato.

## Prova gratuita e abbonamento

**Cosa conserviamo sul nostro sito** (memoria di Cloudflare):

- **Prova gratuita:** il tuo indirizzo Gmail, il giorno in cui hai iniziato la prova e l'ultimo giorno in cui hai usato il programma.
- **Abbonamento** (anche «Omaggio» e famiglia): il tuo indirizzo Gmail, il piano, da quando ce l'hai, l'eventuale scadenza e il tetto mensile di Claude.
- **Uso di Claude compreso:** per ogni giorno, quante domande hai fatto a Claude e quanto sono costate (si cancellano da sole dopo circa 13 mesi). **Non conserviamo il contenuto** delle domande né delle risposte: il testo passa dal nostro sito solo per arrivare ad Anthropic, poi non resta da nessuna parte. Anthropic lo riceve con la nostra chiave, non con la tua: non sa chi sei.

**Perché:** per darti il servizio che hai chiesto (contare i giorni di prova, sapere se Claude è compreso per te, rispettare il tetto mensile). La base giuridica è il contratto con te.

**Per quanto tempo:** finché sei in prova o abbonato, e poi per 12 mesi dalla fine, per poterti riconoscere se torni. Dopo si cancellano da soli. Puoi chiedere di cancellarli prima scrivendo a [info@puntowebferrara.com](mailto:info@puntowebferrara.com).

{{% solo-vendita %}}
**Se ti abboni pagando**, conserviamo anche lo stato dell'abbonamento (attivo o disdetto), il giorno del rinnovo, il tipo di carta e le ultime 4 cifre, e i codici con cui Lemon Squeezy riconosce il tuo abbonamento.

**Lemon Squeezy** (Lemon Squeezy LLC, una società del gruppo Stripe) vende l'abbonamento come *merchant of record*. Per il pagamento è un **titolare autonomo** dei tuoi dati: riceve il nome, l'email, il Paese e i dati di pagamento, li tratta secondo la [sua informativa privacy](https://lemonsqueezy.com/privacy) e conserva le ricevute per il tempo richiesto dalle leggi fiscali. Lemon Squeezy ha sede negli Stati Uniti: il trasferimento dei dati è protetto dalle garanzie previste dal GDPR. Noi non riceviamo i dati della tua carta.
{{% /solo-vendita %}}

## “Chi parla” e la tua voce

Per distinguere chi parla, Verba Manent confronta le voci **solo dentro la stessa registrazione e solo mentre la elabora**. Finito il lavoro, ogni traccia della voce viene cancellata: nel file resta solo l'etichetta, per esempio “Voce 1 = Docente”. Verba Manent non riconosce le persone da una registrazione all'altra e non conserva impronte della voce.

## Le altre persone che registri

Se registri lezioni o riunioni, registri anche la voce di altre persone. Il permesso di registrare devi averlo tu: molte università hanno regole precise e il docente ha diritti sulla sua lezione. A ogni registrazione Verba Manent ti propone un messaggio pronto per avvisare i partecipanti.

## Questo sito

Se ti iscrivi alla lista d'attesa conserviamo la tua email e l'uso che indichi, solo per avvisarti dell'uscita del programma. Puoi chiederne la cancellazione quando vuoi. Le statistiche di visita del sito non usano cookie. Le pagine «Il mio abbonamento» e Verba Manent sul web usano l'accesso con Google per sapere il tuo indirizzo Gmail; il sito non mette cookie per questo.

## I tuoi diritti

Puoi chiedere in ogni momento di vedere, correggere o cancellare i dati che ti riguardano, e puoi presentare reclamo al Garante per la protezione dei dati personali. Per le richieste scrivi a [info@puntowebferrara.com](mailto:info@puntowebferrara.com).
