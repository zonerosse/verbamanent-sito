/* Modello per il PDP: la famiglia (o lo studente all'universita') spunta strumenti e misure e si scrive un foglio A4
   da stampare, salvare in PDF o scaricare in Word. Tutto resta nel browser: non si manda niente a nessuno. */
(function () {
  const box = document.getElementById('pdp');
  if (!box) return;
  const EN = (document.documentElement.lang || '').startsWith('en');
  const T = EN ? {
    per: 'Who is it for', scuola: 'School', uni: 'University', nome: 'Name and surname', nomePh: 'e.g. Mark Rossi',
    classe: 'Class and school', classePh: 'e.g. Year 11 (3ªB) – Liceo Ariosto, Ferrara', corso: 'Degree course and university', corsoPh: 'e.g. Law – University of Ferrara',
    diag: 'Diagnosis (as written in the certificate)', diagPh: 'e.g. dyslexia and dysorthographia', materie: 'Subjects where it matters most (optional)', materiePh: 'e.g. Italian, English, history',
    sc: 'Assistive tools', md: 'Exemptions', vv: 'Tests and assessment', note: 'Anything else the school should know', notePh: 'e.g. He has been using text-to-speech at home for two years.',
    stampa: '🖨 Print or save as PDF', word: '⬇ Download in Word', svuota: 'Start again', priv: '🔒 What you write stays on this device: nothing is sent to anyone.',
    vm: 'with Verba Manent: ', titS: 'Proposal for the personalised plan (PDP) – tools and measures (Law 170/2010)', titU: 'Proposal of measures for exams (Law 170/2010)',
    subS: 'To be discussed with the class council', subU: 'To be discussed with the university disability and SpLD service', anno: 'school year',
    st: 'Student', cl: 'Class', co: 'Course', dg: 'Diagnosis', mt: 'Subjects', nf: 'Notes from the family', ns: 'Notes from the student',
    fS: ['Family', 'Class coordinator', 'Head teacher'], fU: ['Student', 'SpLD service', 'Lecturer'],
    piede: s => `This is a proposal prepared by ${s ? 'the family' : 'the student'}: the official document is written by ${s ? 'the school' : 'the university'}. Free template from verbamanent.app`,
    file: 'PDP proposal'
  } : {
    per: 'Per chi è', scuola: 'Scuola', uni: 'Università', nome: 'Nome e cognome', nomePh: 'es. Marco Rossi',
    classe: 'Classe e scuola', classePh: 'es. 3ªB – Liceo Ariosto, Ferrara', corso: 'Corso di laurea e università', corsoPh: 'es. Giurisprudenza – Università di Ferrara',
    diag: 'Diagnosi (come scritta nella certificazione)', diagPh: 'es. dislessia e disortografia', materie: 'Materie dove serve di più (se vuoi)', materiePh: 'es. italiano, inglese, storia',
    sc: 'Strumenti compensativi', md: 'Misure dispensative', vv: 'Verifiche e valutazione', note: 'Altro da dire alla scuola', notePh: 'es. Usa già la sintesi vocale a casa da due anni.',
    stampa: '🖨 Stampa o salva PDF', word: '⬇ Scarica in Word', svuota: 'Ricomincia', priv: '🔒 Quello che scrivi resta su questo dispositivo: non viene mandato a nessuno.',
    vm: 'con Verba Manent: ', titS: 'Proposta per il PDP – strumenti e misure (L. 170/2010)', titU: 'Proposta di misure per gli esami (L. 170/2010)',
    subS: 'Da discutere con il consiglio di classe', subU: 'Da discutere con il servizio disabilità e DSA dell\'ateneo', anno: 'anno scolastico',
    st: 'Studente', cl: 'Classe', co: 'Corso', dg: 'Diagnosi', mt: 'Materie', nf: 'Note della famiglia', ns: 'Note dello studente',
    fS: ['Famiglia', 'Coordinatore di classe', 'Dirigente scolastico'], fU: ['Studente', 'Servizio DSA', 'Docente'],
    piede: s => `Questa è una proposta preparata ${s ? 'dalla famiglia' : 'dallo studente'}: il documento ufficiale lo scrive ${s ? 'la scuola' : 'l\'università'}. Modello gratuito da verbamanent.app`,
    file: 'Proposta PDP'
  };
  // [testo, spiegazione, funzione di Verba Manent, solo per: 's' scuola / 'u' universita' / '' tutti]
  const L = EN ? {
    sc: [['Text-to-speech', 'to read books, notes and test instructions', 'Read to me, Listen to the notes'], ['Recording lessons', 'to listen again at home', 'records and writes the notes'],
      ['Concept maps and formula sheets', 'also during tests, checked by the teacher beforehand', 'Test map'], ['Word processor with spell checker', 'instead of handwriting', ''],
      ['Speech-to-text dictation', 'to write by speaking', 'Write by speaking'], ['Calculator', '', ''], ['Tables of rules, times tables, dates', '', ''],
      ['Digital textbooks and audiobooks', '', ''], ['Highly legible font', 'larger, more spaced texts on a tinted background', 'Dyslexia mode'], ['Computer or tablet in class and in tests', '', '']],
    md: [['Reading aloud in class', '', '', 's'], ['Copying from the board', 'notes or handouts instead', '', 's'], ['Writing in cursive', 'block capitals or the computer allowed', '', 's'],
      ['Learning lists by heart', 'tables, dates, definitions, poems', ''], ['Note-taking under fast dictation', '', ''], ['Written test in foreign languages', 'oral assessment preferred', ''],
      ['More than one test per day', '', 's'], ['Homework reduced in quantity', 'same objectives, fewer exercises', 's']],
    vv: [['Extra time (30%)', 'or fewer exercises in the same time', ''], ['Tests and oral exams scheduled in advance', '', ''], ['Instructions read aloud', 'by the teacher or by text-to-speech', ''],
      ['Oral exam instead of written when needed', '', ''], ['Assess the content, not the form', 'spelling and handwriting do not lower the mark', ''], ['Multiple-choice or structured tests', 'instead of open questions', ''],
      ['Tests split into shorter parts', '', ''], ['Clear, large-print test sheets', 'one instruction at a time', '']]
  } : {
    sc: [['Sintesi vocale', 'per leggere libri, appunti e consegne', 'Leggimi, Ascolta gli appunti'], ['Registrazione delle lezioni', 'da riascoltare a casa', 'registra e scrive gli appunti'],
      ['Mappe concettuali e formulari', 'anche durante le verifiche, visti prima dal docente', 'Mappa per la verifica'], ['Videoscrittura con correttore ortografico', 'al posto della scrittura a mano', ''],
      ['Dettatura vocale', 'per scrivere parlando', 'Scrivi parlando'], ['Calcolatrice', '', ''], ['Tabelle di regole, tabelline, date', '', ''],
      ['Libri digitali e audiolibri', '', ''], ['Carattere ad alta leggibilità', 'testi più grandi e spaziati, sfondo tenue', 'Modalità DSA'], ['Computer o tablet in classe e in verifica', '', '']],
    md: [['Lettura ad alta voce in classe', '', '', 's'], ['Copiatura dalla lavagna', 'appunti o fotocopie al posto', '', 's'], ['Scrittura in corsivo', 'ammessi stampatello o computer', '', 's'],
      ['Studio mnemonico', 'tabelle, date, definizioni, poesie', ''], ['Appunti sotto dettatura veloce', '', ''], ['Prova scritta nelle lingue straniere', 'privilegiare l\'orale', ''],
      ['Più di una verifica nello stesso giorno', '', 's'], ['Compiti a casa ridotti nella quantità', 'stessi obiettivi, meno esercizi', 's']],
    vv: [['Tempo in più (30%)', 'oppure meno esercizi a parità di tempo', ''], ['Verifiche e interrogazioni programmate', '', ''], ['Consegne lette a voce', 'dal docente o dalla sintesi vocale', ''],
      ['Interrogazione orale al posto dello scritto quando serve', '', ''], ['Valutare il contenuto, non la forma', 'ortografia e grafia non abbassano il voto', ''], ['Verifiche a scelta multipla o strutturate', 'al posto delle domande aperte', ''],
      ['Verifiche divise in parti più brevi', '', ''], ['Testi delle verifiche chiari e a caratteri grandi', 'una consegna alla volta', '']]
  };
  const PRIMI = {sc: [0, 1, 2], md: [0, 1], vv: [0, 1, 4]};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const CHIAVE = 'vm-modello-pdp';
  let S = {ord: 'scuola', nome: '', classe: '', diag: '', materie: '', note: '', sc: PRIMI.sc, md: PRIMI.md, vv: PRIMI.vv};
  try { const x = JSON.parse(localStorage.getItem(CHIAVE) || 'null'); if (x && typeof x === 'object') S = Object.assign(S, x); } catch (e) {}
  const salva = () => { try { localStorage.setItem(CHIAVE, JSON.stringify(S)); } catch (e) {} };

  const campo = (k, lbl, ph, area) => `<label class="pdp-l" for="pdp-${k}">${esc(lbl)}</label>` + (area
    ? `<textarea id="pdp-${k}" data-k="${k}" rows="3" placeholder="${esc(ph)}"></textarea>` : `<input type="text" id="pdp-${k}" data-k="${k}" placeholder="${esc(ph)}" maxlength="120">`);
  const lista = g => L[g].map((x, i) => `<label class="pdp-ck" data-solo="${x[3] || ''}"><input type="checkbox" data-g="${g}" data-i="${i}"><span>${esc(x[0])}${x[1] ? `<small>${esc(x[1])}</small>` : ''}${x[2] ? `<small class="pdp-vm">${esc(T.vm + x[2])}</small>` : ''}</span></label>`).join('');
  box.innerHTML = `<div class="pdp-form">
      <div class="pdp-l">${esc(T.per)}</div><div class="pdp-seg" role="group"><button type="button" data-o="scuola">${esc(T.scuola)}</button><button type="button" data-o="uni">${esc(T.uni)}</button></div>
      ${campo('nome', T.nome, T.nomePh)}<div id="pdp-cl"></div>${campo('diag', T.diag, T.diagPh)}${campo('materie', T.materie, T.materiePh)}
      <fieldset><legend class="pdp-l">${esc(T.sc)}</legend>${lista('sc')}</fieldset>
      <fieldset><legend class="pdp-l">${esc(T.md)}</legend>${lista('md')}</fieldset>
      <fieldset><legend class="pdp-l">${esc(T.vv)}</legend>${lista('vv')}</fieldset>
      ${campo('note', T.note, T.notePh, true)}
      <div class="pdp-bt"><button type="button" class="btn btn-p" id="pdp-stampa">${esc(T.stampa)}</button><button type="button" class="btn pdp-b2" id="pdp-word">${esc(T.word)}</button><button type="button" class="pdp-lnk" id="pdp-svuota">${esc(T.svuota)}</button></div>
      <p class="pdp-priv">${esc(T.priv)}</p>
    </div>
    <div class="pdp-foglio" id="pdp-foglio" aria-live="polite"></div>`;

  function campi() {
    const uni = S.ord === 'uni';
    box.querySelector('#pdp-cl').innerHTML = campo('classe', uni ? T.corso : T.classe, uni ? T.corsoPh : T.classePh);
    box.querySelectorAll('[data-k]').forEach(x => { x.value = S[x.dataset.k] || ''; });
    box.querySelectorAll('.pdp-seg button').forEach(b => b.classList.toggle('on', b.dataset.o === S.ord));
    box.querySelectorAll('.pdp-ck').forEach(l => { l.hidden = l.dataset.solo === 's' && uni; });
    box.querySelectorAll('input[data-g]').forEach(c => { c.checked = (S[c.dataset.g] || []).includes(+c.dataset.i); });
  }
  function foglio() {
    const s = S.ord !== 'uni', y = new Date(), a = y.getMonth() >= 7 ? y.getFullYear() : y.getFullYear() - 1;
    const voci = g => L[g].filter((x, i) => S[g].includes(i) && !(x[3] === 's' && !s));
    const ul = v => v.length ? '<ul>' + v.map(x => `<li>${esc(x[0])}${x[1] ? ' – ' + esc(x[1]) : ''}</li>`).join('') + '</ul>' : '<p class="pdp-vuoto">—</p>';
    const riga = (k, v) => `<div class="pdp-riga"><span>${esc(k)}</span><b>${esc(v || '…')}</b></div>`;
    const firme = s ? T.fS : T.fU;
    return `<h3>${esc(s ? T.titS : T.titU)}</h3><p class="pdp-sub">${esc(s ? T.subS : T.subU)}${s ? ` · ${esc(T.anno)} ${a}/${a + 1}` : ''}</p>
      ${riga(T.st, S.nome)}${riga(s ? T.cl : T.co, S.classe)}${riga(T.dg, S.diag)}${S.materie.trim() ? riga(T.mt, S.materie) : ''}
      <h4>${esc(T.sc)}</h4>${ul(voci('sc'))}<h4>${esc(T.md)}</h4>${ul(voci('md'))}<h4>${esc(T.vv)}</h4>${ul(voci('vv'))}
      ${S.note.trim() ? `<h4>${esc(s ? T.nf : T.ns)}</h4><p>${esc(S.note).replace(/\n/g, '<br>')}</p>` : ''}
      <div class="pdp-firme">${firme.map(f => `<div>${esc(f)}</div>`).join('')}</div><p class="pdp-piede">${esc(T.piede(s))}</p>`;
  }
  const disegna = () => { box.querySelector('#pdp-foglio').innerHTML = foglio(); };

  box.addEventListener('input', e => { const k = e.target.dataset.k; if (k) { S[k] = e.target.value; salva(); disegna(); } });
  box.addEventListener('change', e => {
    const g = e.target.dataset.g; if (!g) return;
    const i = +e.target.dataset.i; S[g] = S[g].filter(x => x !== i); if (e.target.checked) S[g].push(i); S[g].sort((a, b) => a - b);
    salva(); disegna();
  });
  box.querySelector('.pdp-seg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; S.ord = b.dataset.o; salva(); campi(); disegna(); });
  box.querySelector('#pdp-stampa').onclick = () => {
    // si stampa una copia del foglio messa da sola nella pagina: cosi' esce un foglio solo, senza pagine bianche
    let c = document.getElementById('pdp-copia'); if (c) c.remove();
    c = document.createElement('div'); c.id = 'pdp-copia'; c.className = 'pdp-foglio'; c.innerHTML = foglio(); document.body.appendChild(c);
    document.documentElement.classList.add('pdp-stampa');
    const via = () => { document.documentElement.classList.remove('pdp-stampa'); const x = document.getElementById('pdp-copia'); if (x) x.remove(); window.removeEventListener('afterprint', via); };
    window.addEventListener('afterprint', via); window.print(); setTimeout(via, 60000);
  };
  box.querySelector('#pdp-word').onclick = () => {
    const html = `<html><head><meta charset="utf-8"><style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt}h3{font-size:15pt}h4{font-size:11pt;color:#0369a1;text-transform:uppercase;margin:14pt 0 4pt}.pdp-sub,.pdp-piede{color:#64748b;font-size:9pt}.pdp-riga span{display:inline-block;width:110pt;color:#64748b}.pdp-firme div{display:inline-block;width:150pt;margin-right:14pt;border-top:1px solid #94a3b8;padding-top:3pt;margin-top:30pt;font-size:9pt;color:#64748b}</style></head><body>${foglio()}</body></html>`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿', html], {type: 'application/msword'}));
    a.download = `${T.file}${S.nome.trim() ? ' – ' + S.nome.trim() : ''}.doc`;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };
  box.querySelector('#pdp-svuota').onclick = () => {
    S = {ord: S.ord, nome: '', classe: '', diag: '', materie: '', note: '', sc: PRIMI.sc.slice(), md: PRIMI.md.slice(), vv: PRIMI.vv.slice()};
    salva(); campi(); disegna();
  };
  campi(); disegna();
})();
