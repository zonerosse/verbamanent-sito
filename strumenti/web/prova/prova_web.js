// Prova di Verba Manent sul web con Google Drive, Google (accesso) e Claude finti.
// Uso: NODE_PATH=/opt/npm-tools/node_modules node prova_web.js URL DRIVE FOTO [ricorda]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [URL_, D, FOTO, RIC] = process.argv.slice(2);
const stato = () => JSON.parse(fs.readFileSync(path.join(D, 'stato.json')));
const salva = s => fs.writeFileSync(path.join(D, 'stato.json'), JSON.stringify(s, null, 1));
const CORS = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*', 'Access-Control-Expose-Headers': '*'};
const richieste = [];

async function drive(route) {
  const r = route.request(), u = new URL(r.url()), m = r.method();
  richieste.push(m + ' ' + u.pathname + (u.searchParams.get('uploadType') ? '?' + u.searchParams.get('uploadType') : ''));
  if (m === 'OPTIONS') return route.fulfill({status: 204, headers: CORS});
  if ((r.headers()['authorization'] || '') !== 'Bearer finto') return route.fulfill({status: 401, headers: CORS, body: '{"error":{"code":401}}', contentType: 'application/json'});
  const s = stato(), json = (o, st = 200) => route.fulfill({status: st, headers: CORS, contentType: 'application/json; charset=UTF-8', body: JSON.stringify(o)});
  const p = u.pathname;
  if (p === '/drive/v3/about') return json({user: {emailAddress: 'paolo.studente@gmail.com'}});
  if (p === '/drive/v3/files' && m === 'GET') {
    const q = u.searchParams.get('q');
    let f = Object.entries(s.file);
    let mm;
    if ((mm = q.match(/name='([^']+)' and mimeType/))) f = f.filter(([i, x]) => x.folder && x.name === mm[1]);
    else if ((mm = q.match(/'([^']+)' in parents/))) f = f.filter(([i, x]) => (x.parents || []).includes(mm[1]));
    return json({files: f.map(([id, x]) => ({id, name: x.name, size: x.folder ? undefined : String(fs.statSync(path.join(D, id)).size)}))});
  }
  if (p === '/drive/v3/files' && m === 'POST') {
    const b = JSON.parse(r.postData()); s.n++; const id = 'cart' + s.n; s.file[id] = {name: b.name, folder: true, parents: []}; salva(s); return json({id});
  }
  let mm = p.match(/^\/drive\/v3\/files\/([^/]+)$/);
  if (mm && m === 'GET' && u.searchParams.get('alt') === 'media') return route.fulfill({status: 200, headers: CORS, contentType: 'application/octet-stream', body: fs.readFileSync(path.join(D, mm[1]))});
  if (mm && m === 'DELETE') { delete s.file[mm[1]]; fs.rmSync(path.join(D, mm[1]), {force: true}); salva(s); return route.fulfill({status: 204, headers: CORS}); }
  mm = p.match(/^\/upload\/drive\/v3\/files(?:\/([^/]+))?$/);
  if (mm && u.searchParams.get('uploadType') === 'multipart') {
    const ct = r.headers()['content-type'], conf = ct.split('boundary=')[1], buf = r.postDataBuffer();
    const sep = Buffer.from('--' + conf);
    const parti = []; let i = buf.indexOf(sep);
    while (i >= 0) { const j = buf.indexOf(sep, i + sep.length); if (j < 0) break; parti.push(buf.subarray(i + sep.length + 2, j - 2)); i = j; }
    const corpo = x => x.subarray(x.indexOf('\r\n\r\n') + 4);
    const meta = JSON.parse(corpo(parti[0]).toString()), dati = corpo(parti[1]);
    let id = mm[1];
    if (!id) { s.n++; id = 'f' + s.n; s.file[id] = {name: meta.name, parents: meta.parents || []}; } else if (meta.name) s.file[id].name = meta.name;
    fs.writeFileSync(path.join(D, id), dati); salva(s);
    return json({id});
  }
  console.log('DRIVE: non gestita', m, r.url());
  return route.fulfill({status: 500, headers: CORS, body: 'non gestita'});
}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport: {width: 1280, height: 860}, deviceScaleFactor: 1, locale: 'it-IT'});
  await ctx.route('https://accounts.google.com/gsi/client', r => r.fulfill({contentType: 'text/javascript', body:
    `window.google={accounts:{oauth2:{initTokenClient:o=>({requestAccessToken:()=>setTimeout(()=>o.callback({access_token:'finto',expires_in:3600}),50)}),revoke:(t,c)=>c&&c()}}};`}));
  await ctx.route('https://www.googleapis.com/**', drive);
  await ctx.route('https://api.anthropic.com/**', r => {
    richieste.push('CLAUDE ' + r.request().method() + ' ' + new URL(r.request().url()).pathname + ' dba=' + r.request().headers()['anthropic-dangerous-direct-browser-access']);
    if (r.request().method() === 'OPTIONS') return r.fulfill({status: 204, headers: CORS});
    r.fulfill({status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify({data: [{id: 'claude'}], content: [{type: 'text', text: 'Risposta finta.'}], usage: {input_tokens: 1, output_tokens: 1}})});
  });
  const p = await ctx.newPage();
  const err = []; p.on('pageerror', x => err.push(x.message)); p.on('console', m => { console.log('[' + m.type() + '] ' + m.text().slice(0, 300)); }); p.on('worker', w => console.log('WORKER', w.url()));
  const foto = async n => { await p.waitForTimeout(700); await p.screenshot({path: `${FOTO}/${n}.png`}); console.log('foto', n); };
  const t0 = Date.now();
  await p.goto(URL_);
  await p.waitForSelector('#wAccedi'); await foto('w1-accedi');
  await p.click('#wAccedi');
  await p.waitForSelector('#wPw', {timeout: 60000}).catch(async e => { console.log('SCHERMO:', await p.textContent('#web')); await foto('dbg'); throw e; }); console.log('password dopo', Date.now() - t0, 'ms'); await foto('w2-password');
  await p.fill('#wPw', 'abcd efgh jklm npqx'); const v0 = await p.$('#wPwOk'); await p.click('#wPwOk'); await p.waitForFunction(e => !e.isConnected, v0);
  await p.waitForSelector('#web .werr:not(:empty)', {timeout: 30000}); console.log('password sbagliata:', await p.textContent('#web .werr'));
  await p.fill('#wPw', 'abcd efgh jklm npqr'); if (RIC) await p.check('#wRic');
  const vecchio = await p.$('#wPwOk'); await p.click('#wPwOk');
  await p.waitForFunction(e => !e.isConnected, vecchio, {timeout: 60000});
  await p.waitForTimeout(600); await foto('w3-apro');
  await p.waitForSelector('#wCl, #web .werr:not(:empty)', {timeout: 180000});
  if (!(await p.$('#wCl'))) { console.log('SCHERMO:', await p.textContent('#web')); throw new Error('niente chiave'); } console.log('lezioni aperte dopo', Date.now() - t0, 'ms'); await foto('w4-claude');
  await p.fill('#wCl', 'sk-ant-finta'); await p.click('#wClOk');
  await p.waitForSelector('#webBar', {timeout: 30000});
  await p.waitForFunction(() => !document.getElementById('splash'), null, {timeout: 60000});
  await p.waitForTimeout(1500);
  for (let i = 0; i < 5; i++) { const bs = await p.$$('.velo .dlg button'); if (!bs.length) break; await bs[bs.length - 1].click().catch(() => {}); await p.waitForTimeout(300); }
  await foto('w5-studia');
  await p.evaluate(() => vai('arch')); await p.waitForTimeout(1500); await foto('w6-lezioni');
  const lz = await p.evaluate(async () => { await caricaLezioni(); return LZ.lezioni.map(l => [l.nome, l.stato, !!l.video, l.n_appunti]); });
  console.log('lezioni:', JSON.stringify(lz));
  await p.evaluate(() => apriLezione(LZ.lezioni.find(l => /Analisi/.test(l.nome)))); await p.waitForTimeout(1500); await foto('w7-lezione');
  await p.click('[data-ta="video"]').catch(e => console.log('video: no tessera')); await p.waitForTimeout(1200); await foto('w8-video');
  await p.evaluate(() => document.querySelectorAll('.velo').forEach(x => x.remove()));
  await p.evaluate(() => apriLezione(LZ.lezioni.find(l => /Analisi/.test(l.nome))));
  await p.click('[data-ta="karaoke"]').catch(e => console.log('karaoke: no')); await p.waitForTimeout(2500); await foto('w9-karaoke');
  const au = await p.evaluate(() => { const a = KK && KK.au; return a ? {src: String(a.src).slice(0, 30), dur: a.duration} : null; }); console.log('karaoke audio:', JSON.stringify(au));
  // il ripasso: un voto, poi «Salva nel Drive»
  const prima = Object.keys(stato().file).length, primaZip = JSON.stringify(stato().file);
  const rv = await p.evaluate(async () => { const l = LZ.lezioni.find(x => /Analisi/.test(x.nome)); const r = await A.ripasso([l.cartella]); const c = (r.carte || [])[0]; if (!c) return r; const v = await A.ripasso_voto(c.cartella || l.cartella, c.id, false); return {carte: r.carte.length, id: c.id, voto: v}; });
  console.log('ripasso:', JSON.stringify(rv).slice(0, 300));
  await p.evaluate(() => A.imposta('lettura_facilitata', true));
  await p.click('#wbSalva'); await p.waitForFunction(() => /Salvato/.test(document.getElementById('wbSync').textContent), null, {timeout: 60000});
  console.log('barra:', await p.textContent('#webBar'));
  const dopo = stato();
  console.log('Drive cambiato:', JSON.stringify(dopo.file) !== primaZip, 'file', prima, '->', Object.keys(dopo.file).length);
  await foto('w10-salvato');
  console.log('richieste:', JSON.stringify([...new Set(richieste)]));
  console.log('errori:', JSON.stringify(err.slice(0, 12)));
  await b.close();
})().catch(e => { console.error('ERRORE', e); process.exit(1); });
