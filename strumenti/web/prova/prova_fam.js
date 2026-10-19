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
  const fam = [];
  await ctx.route('http://127.0.0.1:8765/api/claude/**', r => { const q = r.request(), h = q.headers(); fam.push(q.method() + ' ' + new URL(q.url()).pathname + ' google=' + h['x-vm-google'] + ' key=' + (h['x-api-key'] || '-'));
    if (q.url().endsWith('/stato')) return r.fulfill({contentType: 'application/json', body: JSON.stringify({famiglia: h['x-vm-google'] === 'finto'})});
    r.fulfill({contentType: 'application/json', body: JSON.stringify({data: [{id: 'c'}], content: [{type: 'text', text: 'ok'}], usage: {input_tokens: 1, output_tokens: 1}})}); });
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
  await p.waitForSelector('#webBar', {timeout: 30000});
  await p.waitForFunction(() => !document.getElementById('splash'), null, {timeout: 60000});
  await p.waitForTimeout(1500);
  for (let i = 0; i < 5; i++) { const bs = await p.$$('.velo .dlg button'); if (!bs.length) break; await bs[bs.length - 1].click().catch(() => {}); await p.waitForTimeout(300); }
  await foto('w5-studia');
  const r1 = await p.evaluate(async () => { await caricaLezioni(); return await A.mappa(LZ.lezioni[0].cartella, true); });
  console.log('mappa:', JSON.stringify(r1).slice(0, 120)); console.log('famiglia:', JSON.stringify([...new Set(fam)]));
  console.log('richieste:', JSON.stringify([...new Set(richieste)]));
  console.log('errori:', JSON.stringify(err.slice(0, 12)));
  await b.close();
})().catch(e => { console.error('ERRORE', e); process.exit(1); });
