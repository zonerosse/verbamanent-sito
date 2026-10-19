// Le pagine per i clienti: Prezzi, Abbonati (accedi con Google -> pagamento), Abbonamento attivo, Il mio abbonamento.
// A vendita spenta (pannello › Abbonati › Vendita) Prezzi, Abbonati e Abbonamento attivo dicono «non ancora uscito»
// e raccolgono le email per la lista d'attesa. «Il mio abbonamento» funziona sempre (famiglia e abbonati a mano).
(function () {
  'use strict';
  var R = document.getElementById('vendita');
  if (!R) return;
  var PAG = R.dataset.pagina, IT = R.dataset.lingua !== 'en', L = {}, EMAIL_VM = R.dataset.email || '';
  try { L = JSON.parse(R.dataset.link || '{}'); } catch (e) {}
  var CLIENT_ID = '303488426536-mqi6a2cd59sis931tb6nmmltrjfrclkf.apps.googleusercontent.com';
  var SCOPE = 'https://www.googleapis.com/auth/drive.file';

  var T = IT ? {
    kick: 'Prezzi', h1: 'Scegli come usare Claude',
    lead: 'Il programma, la registrazione e la trascrizione sul tuo dispositivo sono sempre compresi. Cambia solo come paghi Claude, che fa appunti, tutor, test e interrogazione.',
    mese: 'Mensile', anno: 'Annuale', gratis2: function (n) { return n + ' mesi gratis'; },
    tua: 'Con la tua chiave', tua_p: 'paghi Claude ad Anthropic, circa 0,20 $ per ora registrata',
    tua_l: ['Tutto il programma, su PC, telefono e web', 'Trascrizione sul dispositivo, senza limiti', 'Ti serve una chiave di Claude'], scarica: 'Scarica gratis',
    al_mese: '/ mese', al_anno: '/ anno', rin_m: 'rinnovo mensile, disdici quando vuoi', rin_a: function (m) { return 'come ' + m + ' al mese, un pagamento l\'anno'; },
    top: 'Il più scelto', abbonati: 'Abbonati',
    s_l: function (h) { return ['Claude compreso, senza chiavi da mettere', 'Appunti, tutor, test e interrogazione', 'Appunti di circa ' + h + ' ore di lezione al mese, più tutor e test', 'PC, telefono e web con lo stesso Google']; },
    sp_l: function (h, nome) { return ['Tutto di ' + nome, 'Il doppio di Claude: circa ' + h + ' ore di lezione al mese', 'Per chi registra tutti i giorni']; },
    nota: 'Prezzi IVA inclusa. Le tue lezioni restano tue: se disdici, restano sul tuo PC e nel tuo Drive.',
    gia: 'Hai già un abbonamento?', mio: 'Il mio abbonamento',
    ab_t: function (p) { return 'Abbonamento ' + p; },
    ab_p: 'Accedi con Google: l\'abbonamento sarà legato a questo account. Usa lo stesso Gmail con cui usi Verba Manent (Sincronizza).',
    google: 'Accedi con Google', google_p: 'Verba Manent vede solo il tuo indirizzo e i file che crea lui nel tuo Drive.',
    vai: 'Ti porto alla pagina di pagamento…', paga_p: 'Il pagamento lo fa un servizio esterno sicuro: carta, PayPal, Apple Pay, Google Pay. La ricevuta con l\'IVA arriva per email. Noi non vediamo i dati della carta.',
    cambia: '← Cambia piano', gia_ab: 'Questo account ha già Claude compreso in Verba Manent.',
    e_annullato: 'Accesso annullato. Riprova quando vuoi.', e_servizio: 'Il servizio di pagamento non risponde. Riprova tra qualche minuto.', e_generico: 'Qualcosa non è andato. Riprova.',
    ok_t: 'Abbonamento attivo', ok_ciao: 'Benvenuto in Verba Manent!', ok_p: 'Claude è compreso: non devi mettere nessuna chiave.', ok_entra: 'Entra con',
    web: 'Apri sul web', prog: 'Scarica il programma', ok_nota: 'La ricevuta è nella tua email. Puoi gestire o disdire l\'abbonamento da «Il mio abbonamento».',
    ok_attesa: 'Se tra un minuto il programma non vede ancora l\'abbonamento, chiudilo e riaprilo.',
    mio_p: 'Accedi con lo stesso Google con cui ti sei abbonato.', esci: 'Esci',
    attivo: 'Attivo', disdetto: 'Disdetto', scaduto: 'Scaduto', prezzo: 'Prezzo', rinnovo: 'Prossimo rinnovo', finisce: 'Attivo fino al', pagamento: 'Pagamento',
    nessuna_scad: 'nessuna scadenza', incluso: 'Claude compreso',
    claude_mese: 'Claude questo mese', usato: function (p, g) { return 'Hai usato il ' + p + '% di quello compreso · si azzera il 1° ' + g; },
    avviso80: 'All\'80% te lo diciamo nel programma, così non resti a metà di un ripasso.', senza_tetto: 'Senza tetto mensile.',
    gestisci: 'Gestisci', g_carta: 'Cambia carta o metodo di pagamento', g_ric: 'Scarica le ricevute', g_piano: 'Cambia piano', g_disd: 'Disdici l\'abbonamento',
    disd_p: function (d) { return 'Se disdici, Claude resta fino al ' + d + '; le lezioni restano sul tuo PC e nel tuo Drive.'; },
    manuale: function (e) { return 'Il tuo abbonamento lo gestisce direttamente Verba Manent. Per qualsiasi cosa scrivi a ' + e + '.'; },
    portale_no: 'La pagina per gestirlo non risponde adesso. Riprova tra qualche minuto.',
    non_ab: 'Questo account non ha un abbonamento', non_ab_p: 'Puoi usare Verba Manent gratis con la tua chiave di Claude.', scad_p: 'Il tuo abbonamento è finito. Le lezioni restano sul tuo PC e nel tuo Drive.',
    vedi_prezzi: 'Vedi i prezzi', altro: 'Usa un altro account',
    sp_t: 'Verba Manent non è ancora uscito', sp_p: 'Stiamo finendo il programma che registra le lezioni e prepara gli appunti. Quando esce potrai scegliere:',
    sp_g: '<b>Gratis</b>: il programma completo. Per gli appunti fatti dall\'intelligenza artificiale usi un tuo account Claude.',
    sp_a: '<b>Con l\'abbonamento</b>: tutto già pronto, non devi configurare niente.',
    sp_m: 'Lasciaci la tua email: ti scriviamo una volta sola, il giorno in cui esce.', sp_e: 'La tua email', sp_b: 'Avvisami quando esce',
    sp_ok: '✓ Fatto! Ti scriviamo il giorno in cui esce.', sp_no: 'Non è andata: controlla l\'email e riprova.', sp_priv: 'Privacy', home: '← Torna al sito',
    mesi: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
  } : {
    kick: 'Prices', h1: 'Choose how to use Claude',
    lead: 'The app, recording and on-device transcription are always included. Only the way you pay for Claude changes: Claude makes the notes, the tutor, the tests and the oral quiz.',
    mese: 'Monthly', anno: 'Yearly', gratis2: function (n) { return n + ' months free'; },
    tua: 'With your own key', tua_p: 'you pay Anthropic for Claude, about $0.20 per recorded hour',
    tua_l: ['The whole app, on PC, phone and web', 'On-device transcription, no limits', 'You need a Claude key'], scarica: 'Download free',
    al_mese: '/ month', al_anno: '/ year', rin_m: 'renews monthly, cancel anytime', rin_a: function (m) { return 'like ' + m + ' a month, paid once a year'; },
    top: 'Most popular', abbonati: 'Subscribe',
    s_l: function (h) { return ['Claude included, no keys to set up', 'Notes, tutor, tests and oral quiz', 'Notes for about ' + h + ' hours of lectures a month, plus tutor and tests', 'PC, phone and web with the same Google account']; },
    sp_l: function (h, nome) { return ['Everything in ' + nome, 'Twice the Claude: about ' + h + ' hours of lectures a month', 'For those who record every day']; },
    nota: 'Prices include VAT. Your lectures stay yours: if you cancel, they stay on your PC and in your Drive.',
    gia: 'Already subscribed?', mio: 'My subscription',
    ab_t: function (p) { return p + ' subscription'; },
    ab_p: 'Sign in with Google: the subscription will be linked to this account. Use the same Gmail you use with Verba Manent (Sync).',
    google: 'Sign in with Google', google_p: 'Verba Manent only sees your address and the files it creates in your Drive.',
    vai: 'Taking you to the payment page…', paga_p: 'Payment is handled by a secure external service: card, PayPal, Apple Pay, Google Pay. The VAT receipt arrives by email. We never see your card details.',
    cambia: '← Change plan', gia_ab: 'This account already has Claude included in Verba Manent.',
    e_annullato: 'Sign-in cancelled. Try again whenever you like.', e_servizio: 'The payment service is not responding. Try again in a few minutes.', e_generico: 'Something went wrong. Please try again.',
    ok_t: 'Subscription active', ok_ciao: 'Welcome to Verba Manent!', ok_p: 'Claude is included: no key to set up.', ok_entra: 'Sign in with',
    web: 'Open on the web', prog: 'Download the app', ok_nota: 'The receipt is in your email. You can manage or cancel the subscription from «My subscription».',
    ok_attesa: 'If the app doesn\'t see the subscription within a minute, close it and open it again.',
    mio_p: 'Sign in with the same Google account you subscribed with.', esci: 'Sign out',
    attivo: 'Active', disdetto: 'Cancelled', scaduto: 'Expired', prezzo: 'Price', rinnovo: 'Next renewal', finisce: 'Active until', pagamento: 'Payment',
    nessuna_scad: 'no end date', incluso: 'Claude included',
    claude_mese: 'Claude this month', usato: function (p, g) { return 'You have used ' + p + '% of what is included · resets on ' + g + ' 1'; },
    avviso80: 'At 80% the app tells you, so you are never cut off halfway through a review.', senza_tetto: 'No monthly cap.',
    gestisci: 'Manage', g_carta: 'Change card or payment method', g_ric: 'Download receipts', g_piano: 'Change plan', g_disd: 'Cancel subscription',
    disd_p: function (d) { return 'If you cancel, Claude stays until ' + d + '; your lectures stay on your PC and in your Drive.'; },
    manuale: function (e) { return 'Your subscription is managed directly by Verba Manent. For anything, write to ' + e + '.'; },
    portale_no: 'The management page is not responding right now. Try again in a few minutes.',
    non_ab: 'This account has no subscription', non_ab_p: 'You can use Verba Manent for free with your own Claude key.', scad_p: 'Your subscription has ended. Your lectures stay on your PC and in your Drive.',
    vedi_prezzi: 'See prices', altro: 'Use another account',
    sp_t: 'Verba Manent is not out yet', sp_p: 'We are finishing the app that records lectures and prepares notes. When it\'s out you can choose:',
    sp_g: '<b>Free</b>: the complete app. For the AI-made notes you use your own Claude account.',
    sp_a: '<b>With a subscription</b>: everything ready, nothing to set up.',
    sp_m: 'Leave your email: we\'ll write once, on the day it comes out.', sp_e: 'Your email', sp_b: 'Tell me when it\'s out',
    sp_ok: '✓ Done! We\'ll write on the day it comes out.', sp_no: 'That didn\'t work: check the email and try again.', sp_priv: 'Privacy', home: '← Back to the site',
    mesi: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var eur = function (x) { if (!x) return IT ? '0 €' : '€0'; return IT ? x.toFixed(2).replace('.', ',') + ' €' : '€' + x.toFixed(2); };
  var data = function (d) { d = new Date(d); return IT ? d.getDate() + ' ' + T.mesi[d.getMonth()] + ' ' + d.getFullYear() : T.mesi[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); };
  var ore = function (claude) { return Math.round(claude * 5); };
  var LOGO = '<span class="vnd-logo"><svg width="26" height="26" aria-hidden="true"><use href="#i-logo"/></svg></span>';
  var G_SVG = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
  var mostra = function (html) { R.innerHTML = html; };
  var centro = function (html) { mostra('<div class="vnd-centro"><div class="vnd-box">' + html + '</div></div>'); };
  var q = new URLSearchParams(location.search);

  // ---- Google: un accesso solo per sapere il Gmail (lo stesso permesso del programma e del web)
  var gis = null, gisCb = null;
  function caricaGis() {
    if (window.google && google.accounts) return Promise.resolve();
    return new Promise(function (ok, no) {
      var s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onload = ok; s.onerror = function () { no(new Error('gsi')); }; document.head.appendChild(s);
    });
  }
  function token() {
    return caricaGis().then(function () {
      if (!gis) gis = google.accounts.oauth2.initTokenClient({ client_id: CLIENT_ID, scope: SCOPE,
        callback: function (r) { if (gisCb) gisCb(r); }, error_callback: function (e) { if (gisCb) gisCb({ error: e.type || 'annullato' }); } });
      return new Promise(function (ok, no) {
        gisCb = function (r) { gisCb = null; if (r.error || !r.access_token) return no(new Error('annullato')); ok(r.access_token); };
        gis.requestAccessToken({ prompt: 'select_account' });
      });
    });
  }
  function bottoneGoogle(id) { return '<button class="vnd-g" id="' + id + '" type="button">' + G_SVG + esc(T.google) + '</button><p class="vnd-pic">' + esc(T.google_p) + '</p>'; }

  // ---- vendita spenta: «non ancora uscito» + lista d'attesa
  function spenta() {
    centro(LOGO + '<h1>' + esc(T.sp_t) + '</h1><p>' + esc(T.sp_p) + '</p>' +
      '<ul class="vnd-scelte"><li>' + T.sp_g + '</li><li>' + T.sp_a + '</li></ul><p>' + esc(T.sp_m) + '</p>' +
      '<form id="vAtt" class="vnd-att"><label class="skip" for="vEm">' + esc(T.sp_e) + '</label><input id="vEm" type="email" required autocomplete="email" placeholder="' + esc(T.sp_e) + '">' +
      '<input type="text" name="sito" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">' +
      '<button class="btn btn-p">' + esc(T.sp_b) + '</button><div class="vnd-msg" role="status"></div></form>' +
      '<p class="vnd-pic"><a href="' + esc(L.privacy || '/privacy/') + '">' + esc(T.sp_priv) + '</a> · <a href="' + esc(L.home || '/') + '">' + esc(T.home) + '</a></p>');
    var f = document.getElementById('vAtt');
    f.onsubmit = function (e) {
      e.preventDefault();
      var m = f.querySelector('.vnd-msg'), b = f.querySelector('button'); b.disabled = true;
      fetch('/api/attesa', { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: document.getElementById('vEm').value, uso: IT ? 'Dalla pagina Prezzi' : 'From the Prices page', sito: f.sito.value, lingua: IT ? 'it' : 'en' }) })
        .then(function (r) { return r.json(); }).then(function (j) { m.textContent = j.ok ? T.sp_ok : T.sp_no; m.className = 'vnd-msg ' + (j.ok ? 'ok' : 'no'); if (j.ok) f.querySelector('input').disabled = true; else b.disabled = false; })
        .catch(function () { m.textContent = T.sp_no; m.className = 'vnd-msg no'; b.disabled = false; });
    };
  }

  // ---- Prezzi
  function prezzi(v) {
    var per = q.get('periodo') === 'anno' ? 'anno' : 'mese';
    var s = v.piani[0], risp = Math.max(0, Math.round(12 - s.anno / s.mese));
    function carta(p, i) {
      var cifra = per === 'anno' ? p.anno : p.mese;
      var punti = i === 0 ? T.s_l(ore(p.claude)) : T.sp_l(ore(p.claude), v.piani[0].piano);
      var href = (L.abbonati || '/abbonati/') + '?piano=' + encodeURIComponent(p.piano) + '&periodo=' + per;
      return '<div class="vnd-pi' + (i === 0 ? ' top' : '') + '"' + (i === 0 ? ' data-top="' + esc(T.top) + '"' : '') + '><h3>' + esc(p.piano) + '</h3>' +
        '<div class="vnd-p">' + esc(eur(cifra)) + ' <small>' + esc(per === 'anno' ? T.al_anno : T.al_mese) + '</small></div>' +
        '<div class="vnd-ps">' + esc(per === 'anno' ? T.rin_a(eur(p.anno / 12)) : T.rin_m) + '</div>' +
        '<ul>' + punti.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        '<a class="vnd-b ' + (i === 0 ? 'p1' : 'p2') + '" href="' + esc(href) + '">' + esc(T.abbonati) + '</a></div>';
    }
    mostra('<div class="wrap vnd-wrap"><div class="kicker">' + esc(T.kick) + '</div><h1>' + esc(T.h1) + '</h1><p class="vnd-lead">' + esc(T.lead) + '</p>' +
      '<div class="vnd-sw" role="tablist"><button role="tab" data-per="mese"' + (per === 'mese' ? ' class="on" aria-selected="true"' : '') + '>' + esc(T.mese) + '</button>' +
      '<button role="tab" data-per="anno"' + (per === 'anno' ? ' class="on" aria-selected="true"' : '') + '>' + esc(T.anno) + (risp ? ' · ' + esc(T.gratis2(risp)) : '') + '</button></div>' +
      '<div class="vnd-piani"><div class="vnd-pi"><h3>' + esc(T.tua) + '</h3><div class="vnd-p">' + esc(eur(0)) + '</div><div class="vnd-ps">' + esc(T.tua_p) + '</div>' +
      '<ul>' + T.tua_l.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul><a class="vnd-b p2" href="' + esc(L.pc_e_telefono || '/pc-e-telefono/') + '">' + esc(T.scarica) + '</a></div>' +
      v.piani.map(carta).join('') + '</div><p class="vnd-nota">' + esc(T.nota) + '</p>' +
      '<p class="vnd-nota">' + esc(T.gia) + ' <a href="' + esc(L.il_mio_abbonamento || '/il-mio-abbonamento/') + '">' + esc(T.mio) + ' ›</a></p></div>');
    R.querySelectorAll('.vnd-sw button').forEach(function (b) {
      b.onclick = function () { var u = new URL(location.href); u.searchParams.set('periodo', b.dataset.per); history.replaceState(null, '', u); prezzi(v); };
    });
  }

  // ---- Abbonati: accedi con Google, poi la pagina di pagamento del servizio
  function abbonati(v) {
    var p = v.piani.filter(function (x) { return x.piano === q.get('piano'); })[0] || v.piani[0];
    var per = q.get('periodo') === 'anno' ? 'anno' : 'mese', cifra = per === 'anno' ? p.anno : p.mese;
    centro(LOGO + '<h1>' + esc(T.ab_t(p.piano)) + '</h1><div class="vnd-riep"><div><span>' + esc(p.piano) + '</span><b>' + esc(eur(cifra)) + ' ' + esc(per === 'anno' ? T.al_anno : T.al_mese) + '</b></div></div>' +
      '<p>' + esc(T.ab_p) + '</p><p class="vnd-err" role="alert"></p>' + bottoneGoogle('vG') +
      '<p class="vnd-pic">' + esc(T.paga_p) + '</p><p class="vnd-pic"><a href="' + esc((L.prezzi || '/prezzi/') + '?periodo=' + per) + '">' + esc(T.cambia) + '</a></p>');
    var b = document.getElementById('vG'), err = R.querySelector('.vnd-err');
    b.onclick = function () {
      b.disabled = true; err.textContent = '';
      token().then(function (tk) {
        b.innerHTML = esc(T.vai);
        return fetch('/api/vendita/checkout', { method: 'POST', headers: { 'content-type': 'application/json', 'x-vm-google': tk },
          body: JSON.stringify({ piano: p.piano, periodo: per, lingua: IT ? 'it' : 'en' }) }).then(function (r) { return r.json(); });
      }).then(function (j) {
        if (j.url) { location.href = j.url; return; }
        if (j.gia) { err.innerHTML = esc(T.gia_ab) + ' <a href="' + esc(L.il_mio_abbonamento || '/il-mio-abbonamento/') + '">' + esc(T.mio) + ' ›</a>'; }
        else err.textContent = j.errore === 'servizio' ? T.e_servizio : T.e_generico;
        b.disabled = false; b.innerHTML = G_SVG + esc(T.google);
      }).catch(function (e) {
        err.textContent = String(e.message) === 'annullato' ? T.e_annullato : T.e_generico;
        b.disabled = false; b.innerHTML = G_SVG + esc(T.google);
      });
    };
  }

  // ---- Abbonamento attivo (ci torna il servizio di pagamento)
  function attivo() {
    centro('<span class="vnd-ok">✓</span><h1>' + esc(T.ok_t) + '</h1><p><b>' + esc(T.ok_ciao) + '</b> ' + esc(T.ok_p) + '</p>' +
      '<div class="vnd-row"><a class="vnd-b p1" href="' + esc(L.studia) + '">' + esc(T.web) + '</a><a class="vnd-b p2" href="' + esc(L.pc_e_telefono || '/pc-e-telefono/') + '">' + esc(T.prog) + '</a></div>' +
      '<p class="vnd-pic">' + esc(T.ok_nota) + ' <a href="' + esc(L.il_mio_abbonamento || '/il-mio-abbonamento/') + '">' + esc(T.mio) + ' ›</a></p><p class="vnd-pic">' + esc(T.ok_attesa) + '</p>');
  }

  // ---- Il mio abbonamento
  var tok = null;
  function mioAccedi(errore) {
    centro(LOGO + '<h1>' + esc(T.mio) + '</h1><p>' + esc(T.mio_p) + '</p><p class="vnd-err" role="alert">' + esc(errore || '') + '</p>' + bottoneGoogle('vG') +
      '<p class="vnd-pic"><a href="' + esc(L.home || '/') + '">' + esc(T.home) + '</a></p>');
    var b = document.getElementById('vG');
    b.onclick = function () {
      b.disabled = true;
      token().then(function (tk) { tok = tk; return carica(); }).catch(function (e) { mioAccedi(String(e.message) === 'annullato' ? T.e_annullato : T.e_generico); });
    };
  }
  function carica() {
    return fetch('/api/vendita/mio', { headers: { 'x-vm-google': tok } }).then(function (r) { return r.json(); }).then(mio);
  }
  function esci() {
    try { if (tok && window.google) google.accounts.oauth2.revoke(tok, function () {}); } catch (e) {}
    tok = null; mioAccedi('');
  }
  function mio(d) {
    if (d.errore) return mioAccedi(T.e_generico);
    var testa = '<div class="vnd-mio-t"><div><h1>' + esc(T.mio) + '</h1><span class="vnd-pic">' + esc(d.email) + '</span></div><button class="vnd-b p2" id="vEsci" type="button">' + esc(T.esci) + '</button></div>';
    var corpo;
    if (!d.abbonato) {
      corpo = '<div class="vnd-carta"><h3>' + esc(T.non_ab) + '</h3><p>' + esc(d.scaduto ? T.scad_p : T.non_ab_p) + '</p>' +
        '<div class="vnd-row">' + (d.vendita ? '<a class="vnd-b p1" href="' + esc(L.prezzi || '/prezzi/') + '">' + esc(T.vedi_prezzi) + '</a>' : '') + '<button class="vnd-b p2" id="vAltro" type="button">' + esc(T.altro) + '</button></div></div>';
    } else {
      var pag = d.origine === 'pagamento', disd = d.stato === 'cancelled';
      var stato = disd ? '<span class="vnd-badge att">' + esc(T.disdetto) + '</span>' : '<span class="vnd-badge">' + esc(T.attivo) + '</span>';
      var r2 = function (a, b) { return '<div class="vnd-r2"><span>' + esc(a) + '</span><b>' + b + '</b></div>'; };
      var righe = '';
      if (pag && d.prezzo) righe += r2(T.prezzo, esc(eur(d.prezzo) + ' ' + (d.periodo === 'anno' ? T.al_anno : T.al_mese)));
      if (pag && d.rinnovo && !disd) righe += r2(T.rinnovo, esc(data(d.rinnovo)));
      else if (d.scade) righe += r2(T.finisce, esc(data(d.scade)));
      else righe += r2(T.incluso, esc(T.nessuna_scad));
      if (pag && d.carta) righe += r2(T.pagamento, esc(d.carta));
      corpo = '<div class="vnd-carta"><div class="vnd-mio-p"><h3>' + esc(d.piano) + '</h3>' + stato + '</div>' + righe + '</div>';
      var prossimo = T.mesi[(new Date().getMonth() + 1) % 12];
      if (d.tetto) {
        var pc = Math.min(100, Math.round((d.usato || 0) / d.tetto * 100));
        corpo += '<div class="vnd-carta"><h3>' + esc(T.claude_mese) + '</h3><div class="vnd-bar"><i style="width:' + pc + '%"></i></div><p class="vnd-pic" style="text-align:left">' + esc(T.usato(pc, prossimo)) + '</p><p class="vnd-pic" style="text-align:left">' + esc(T.avviso80) + '</p></div>';
      } else {
        corpo += '<div class="vnd-carta"><h3>' + esc(T.claude_mese) + '</h3><p class="vnd-pic" style="text-align:left">' + esc(T.senza_tetto) + '</p></div>';
      }
      if (pag) {
        var link = function (t, cls) { return d.portale ? '<a class="vnd-link' + (cls || '') + '" href="' + esc(d.portale) + '" target="_blank" rel="noopener">' + esc(t) + ' ›</a>' : ''; };
        corpo += '<div class="vnd-carta"><h3>' + esc(T.gestisci) + '</h3>' + (d.portale ? link(T.g_carta) + link(T.g_ric) + link(T.g_piano) + (disd ? '' : link(T.g_disd, ' r')) : '<p>' + esc(T.portale_no) + '</p>') +
          (disd || !d.scade ? '' : '<p class="vnd-pic" style="text-align:left">' + esc(T.disd_p(data(d.rinnovo || d.scade))) + '</p>') + '</div>';
      } else {
        corpo += '<div class="vnd-carta"><p class="vnd-pic" style="text-align:left;margin:0">' + esc(T.manuale(EMAIL_VM)) + '</p></div>';
      }
      corpo += '<div class="vnd-row"><a class="vnd-b p1" href="' + esc(L.studia) + '">' + esc(T.web) + '</a><a class="vnd-b p2" href="' + esc(L.pc_e_telefono || '/pc-e-telefono/') + '">' + esc(T.prog) + '</a></div>';
    }
    mostra('<div class="wrap vnd-mio">' + testa + corpo + '<p class="vnd-pic"><a href="' + esc(L.home || '/') + '">' + esc(T.home) + '</a></p></div>');
    document.getElementById('vEsci').onclick = esci;
    var alt = document.getElementById('vAltro'); if (alt) alt.onclick = esci;
  }

  // ---- via
  if (PAG === 'mio') { mioAccedi(''); return; }
  fetch('/api/vendita').then(function (r) { return r.json(); }).catch(function () { return { attiva: false }; }).then(function (v) {
    if (!v || !v.attiva || !v.piani || !v.piani.length) return spenta();
    if (PAG === 'prezzi') prezzi(v);
    else if (PAG === 'abbonati') abbonati(v);
    else if (PAG === 'attivo') attivo();
  });
})();
