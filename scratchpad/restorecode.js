// The 6-digit restore code (2026-08-08) — Cath's home-screen discovery.
//
// On iPhone the installed app has its own storage, separate from Safari, and
// an email link can only ever open Safari — so the restore email's button
// cannot restore results INTO the app. The code travels by hand instead.
//
// Part A runs the REAL user-data.js handler with Supabase + MailerLite stubbed:
// minting, reuse across the 24h email window, the exchange, single-use, tries,
// expiry, the enumeration defense and its timing floor, and the server-owned
// _restore field never leaking or being forgeable.
// Part B drives the REAL index.html in Chromium: the code row on the card, a
// wrong code failing kindly, and a right code landing her in her portrait.
//
//   node scratchpad/restorecode.js
//
process.env.SUPABASE_URL = 'https://fake.supabase.co';
process.env.SUPABASE_KEY = 'fake-key';
process.env.RESTORE_SECRET = 'test-secret-for-verification';
process.env.MAILERLITE_API_KEY = 'fake-ml-key';

const DB = new Map(); // email -> data object
let mlFieldWrites = []; // every fields payload written to /subscribers

const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  const method = (opts.method || 'GET').toUpperCase();
  if (u.startsWith('https://connect.mailerlite.com')) {
    if (method === 'POST' && u.endsWith('/subscribers')) {
      const b = JSON.parse(opts.body);
      mlFieldWrites.push(b.fields || {});
      return new Response(JSON.stringify({ data: { id: 'sub-1' } }), { status: 200 });
    }
    if (u.includes('/groups?')) return new Response(JSON.stringify({ data: [{ id: 'g-restore', name: 'Style Star Restore Requests' }] }), { status: 200 });
    return new Response(JSON.stringify({ data: { id: 'g-restore' } }), { status: 200 });
  }
  if (u.startsWith('https://fake.supabase.co')) {
    const m = u.match(/email=eq\.([^&]+)/);
    const email = m ? decodeURIComponent(m[1]) : null;
    if (method === 'GET') {
      const row = email && DB.has(email) ? [{ email, data: JSON.stringify(DB.get(email)) }] : [];
      return new Response(JSON.stringify(row), { status: 200 });
    }
    if (method === 'PATCH') { DB.set(email, JSON.parse(JSON.parse(opts.body).data)); return new Response(null, { status: 204 }); }
    if (method === 'POST') { const b = JSON.parse(opts.body); DB.set(b.email, JSON.parse(b.data)); return new Response(null, { status: 204 }); }
    if (method === 'DELETE') { DB.delete(email); return new Response(null, { status: 204 }); }
  }
  return realFetch(url, opts);
};

// The cooldown and code lifetimes are driven by Date.now(); skew lets the test
// travel forward without waiting.
const realNow = Date.now;
let skew = 0;
Date.now = () => realNow() + skew;

const { default: handler } = await import('../netlify/functions/user-data.js');

const GOOD = { origin: 'https://www.stylestar.app', referer: 'https://www.stylestar.app/', host: 'www.stylestar.app' };
let ipSeq = 0;
function call(method, { query = '', body = null, headers = GOOD } = {}) {
  const req = new Request('https://www.stylestar.app/.netlify/functions/user-data' + query, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined
  });
  const clientIp = '10.0.0.' + (++ipSeq);
  const orig = req.headers.get.bind(req.headers);
  req.headers.get = (k) => {
    const lk = k.toLowerCase();
    if (lk === 'host') return headers.host || '';
    if (lk === 'x-nf-client-connection-ip') return clientIp;
    return orig(k);
  };
  return handler(req);
}
const body = async (res) => { try { return JSON.parse(await res.text()); } catch (e) { return null; } };

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
}

const EMAIL = 'cath@example.com';
const PROFILE = { userName: 'Catherine', portrait: 'Your style is timeless.', answers: [6,6,6,6,6,6,6,6,6,6,6,6], prefs: { sizes: '8' }, wardrobe: {} };
DB.set(EMAIL, { ...PROFILE });

// ---------------------------------------------------------------------------
console.log('\nA1. A restore request mints a 6-digit code onto her row');
await call('GET', { query: '?email=' + EMAIL });
let rc = (DB.get(EMAIL) || {})._restore;
ok('the row now carries _restore', !!rc, JSON.stringify(DB.get(EMAIL)));
ok('the code is exactly 6 digits', !!rc && /^\d{6}$/.test(rc.c), rc && rc.c);
ok('it expires in ~24h (the MailerLite once-a-day window)', !!rc && Math.abs((rc.exp - Date.now()) - 24 * 3600e3) < 60e3);
ok('tries start at 0', !!rc && rc.tries === 0);
const write1 = mlFieldWrites[mlFieldWrites.length - 1] || {};
ok('MailerLite got the SAME code in restore_code', write1.restore_code === rc.c, JSON.stringify(write1));
ok('and still got the restore_token for the gold button', typeof write1.restore_token === 'string' && write1.restore_token.length > 20);
const CODE1 = rc.c;

// ---------------------------------------------------------------------------
console.log('\nA2. A second request past the cooldown REUSES the still-valid code');
skew += 6 * 60e3; // past the 5-minute cooldown, inside the 24h code window
await call('GET', { query: '?email=' + EMAIL });
rc = (DB.get(EMAIL) || {})._restore;
ok('the code did not rotate (emailed code stays right all day)', rc && rc.c === CODE1, rc && rc.c);
const write2 = mlFieldWrites[mlFieldWrites.length - 1] || {};
ok('the field write self-heals with the same code', write2.restore_code === CODE1, JSON.stringify(write2));

// ---------------------------------------------------------------------------
console.log('\nA3. Within the cooldown, nothing is minted and nothing is written');
const writesBefore = mlFieldWrites.length;
await call('GET', { query: '?email=' + EMAIL }); // immediately again
rc = (DB.get(EMAIL) || {})._restore;
ok('code unchanged', rc && rc.c === CODE1);
ok('no MailerLite write happened', mlFieldWrites.length === writesBefore, String(mlFieldWrites.length - writesBefore));

// ---------------------------------------------------------------------------
console.log('\nA4. A wrong code fails generically and burns a try');
let res = await call('GET', { query: '?email=' + EMAIL + '&code=000000' });
let j = await body(res);
ok('status 401', res.status === 401, String(res.status));
ok('no data leaked', !j.data && !JSON.stringify(j).includes('Catherine'), JSON.stringify(j));
rc = (DB.get(EMAIL) || {})._restore;
ok('tries incremented', rc && rc.tries === 1, rc && String(rc.tries));
const WRONG_BODY = JSON.stringify(j);

// ---------------------------------------------------------------------------
console.log('\nA5. The right code returns her whole world, once');
const t0 = realNow();
res = await call('GET', { query: '?email=' + EMAIL + '&code=' + CODE1 });
const okDur = realNow() - t0;
j = await body(res);
ok('status 200 success', res.status === 200 && j && j.success === true, String(res.status));
ok('her data came back', j && j.data && j.data.portrait === PROFILE.portrait);
ok('a fresh save-token came with it', j && typeof j.token === 'string' && j.token.length > 20);
ok('_restore is NOT in the response', j && j.data && !('_restore' in j.data), JSON.stringify(j && j.data && j.data._restore));
ok('the success path also waits out the floor', okDur >= 780, okDur + 'ms');
ok('the code is cleared from the row (single use)', !(DB.get(EMAIL) || {})._restore);
const FRESH_TOKEN = j.token;

res = await call('GET', { query: '?email=' + EMAIL + '&code=' + CODE1 });
ok('the same code refused a second time', res.status === 401, String(res.status));

res = await call('GET', { query: '?token=' + encodeURIComponent(FRESH_TOKEN) });
j = await body(res);
ok('the fresh token really works for later saves/restores', res.status === 200 && j.success === true && j.data.portrait === PROFILE.portrait);

// ---------------------------------------------------------------------------
console.log('\nA6. Six wrong tries kill a code for good');
skew += 6 * 60e3;
await call('GET', { query: '?email=' + EMAIL }); // mint a new one
let CODE2 = (DB.get(EMAIL) || {})._restore.c;
ok('a new code was minted after the old one was used', /^\d{6}$/.test(CODE2) && CODE2 !== CODE1, CODE2);
for (let i = 0; i < 6; i++) {
  const wrong = CODE2 === '999999' ? '999998' : '999999';
  await call('GET', { query: '?email=' + EMAIL + '&code=' + wrong });
}
res = await call('GET', { query: '?email=' + EMAIL + '&code=' + CODE2 });
ok('the RIGHT code fails after 6 wrong tries', res.status === 401, String(res.status));

// ---------------------------------------------------------------------------
console.log('\nA7. Codes expire after 24 hours');
skew += 6 * 60e3;
await call('GET', { query: '?email=' + EMAIL });
CODE2 = (DB.get(EMAIL) || {})._restore.c;
skew += 25 * 3600e3; // a day and an hour later
res = await call('GET', { query: '?email=' + EMAIL + '&code=' + CODE2 });
ok('yesterday\'s code is refused', res.status === 401, String(res.status));
await call('GET', { query: '?email=' + EMAIL });
const CODE3 = (DB.get(EMAIL) || {})._restore.c;
ok('a fresh request mints a fresh code', /^\d{6}$/.test(CODE3) && CODE3 !== CODE2, CODE3);

// ---------------------------------------------------------------------------
console.log('\nA8. Unknown addresses are indistinguishable from wrong codes');
const tA = realNow();
res = await call('GET', { query: '?email=nobody@example.com&code=123456' });
const durUnknown = realNow() - tA;
j = await body(res);
ok('identical status', res.status === 401, String(res.status));
ok('identical body', JSON.stringify(j) === WRONG_BODY, JSON.stringify(j) + ' vs ' + WRONG_BODY);
const tB = realNow();
await call('GET', { query: '?email=' + EMAIL + '&code=000001' });
const durWrong = realNow() - tB;
ok('both wait out the same floor (~800ms)', durUnknown >= 780 && durWrong >= 780, durUnknown + 'ms / ' + durWrong + 'ms');
ok('timing gap too small to enumerate', Math.abs(durUnknown - durWrong) < 300, Math.abs(durUnknown - durWrong) + 'ms');

// ---------------------------------------------------------------------------
console.log('\nA9. Typed formatting is forgiven');
skew += 6 * 60e3;
await call('GET', { query: '?email=' + EMAIL });
const CODE4 = (DB.get(EMAIL) || {})._restore.c;
res = await call('GET', { query: '?email=' + EMAIL + '&code=' + encodeURIComponent(CODE4.slice(0, 3) + ' ' + CODE4.slice(3)) });
j = await body(res);
ok('"482 917" works as well as "482917"', res.status === 200 && j.success === true, String(res.status));

// ---------------------------------------------------------------------------
console.log('\nA10. _restore is server-owned: never leaked, never forgeable, never wiped');
// token path must not leak an outstanding code
skew += 6 * 60e3;
await call('GET', { query: '?email=' + EMAIL });
const CODE5 = (DB.get(EMAIL) || {})._restore.c;
res = await call('GET', { query: '?token=' + encodeURIComponent(FRESH_TOKEN) });
j = await body(res);
ok('token restore does not include _restore', j && j.data && !('_restore' in j.data));
// a save from another device must not wipe the outstanding code
res = await call('POST', { body: { email: EMAIL, data: { ...PROFILE, userName: 'Catherine B' }, token: FRESH_TOKEN } });
ok('the save itself succeeded', res.status === 200);
rc = (DB.get(EMAIL) || {})._restore;
ok('the outstanding code survived the save', rc && rc.c === CODE5, JSON.stringify(rc));
// a client cannot plant its own code on a fresh row
await call('POST', { body: { email: 'squat@example.com', data: { userName: 'X', _restore: { c: '111111', exp: Date.now() + 9e9, tries: 0 } } } });
ok('a client-planted _restore is dropped on save', !(DB.get('squat@example.com') || {})._restore, JSON.stringify(DB.get('squat@example.com')));
res = await call('GET', { query: '?email=squat@example.com&code=111111' });
ok('and the planted code opens nothing', res.status === 401, String(res.status));

// ---------------------------------------------------------------------------
console.log('\nA11. The origin gate covers the code path');
res = await call('GET', { query: '?email=' + EMAIL + '&code=123456', headers: { origin: 'https://evil.example', referer: 'https://evil.example/', host: 'www.stylestar.app' } });
ok('forged origin gets 403', res.status === 403, String(res.status));

// ===========================================================================
// Part B — the real page in Chromium
// ===========================================================================
Date.now = realNow;
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
const http = await import('http');
const fs = await import('fs');
const path = await import('path');
const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req2, res2) => {
  const f = path.join(ROOT, req2.url === '/' ? 'index.html' : decodeURIComponent(req2.url.split('?')[0].slice(1)));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res2.writeHead(404); return res2.end(); }
  res2.writeHead(200); fs.createReadStream(f).pipe(res2);
});
await new Promise(r => server.listen(0, r));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

const RESTORED = {
  success: true,
  token: 'fresh-token-from-code',
  data: { userName: 'Cath', portrait: 'Your style is warm and timeless.', motto: 'Shine your light.', answers: [6,6,6,6,6,6,6,6,6,6,6,6], prefs: { sizes: '8' }, wardrobe: {} }
};

for (const w of [390, 360]) {
  console.log('\nB. The page at ' + w + 'px');
  const page = await browser.newPage({ viewport: { width: w, height: 844 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  let codeCalls = 0;
  await page.route('**/user-data*', r => {
    const u = new URL(r.request().url());
    const code = u.searchParams.get('code');
    if (code) {
      codeCalls++;
      if (code.replace(/\D/g, '') === '482917') return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(RESTORED) });
      return r.fulfill({ status: 401, contentType: 'application/json', body: '{"success":false,"message":"That code did not match"}' });
    }
    return r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true,"sent":true}' });
  });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => showRestore());
  await page.evaluate(() => { document.getElementById('restoreEmail').value = 'cath@example.com'; return restoreResults(); });
  await page.waitForTimeout(300);

  const m = await page.evaluate(() => {
    const card = document.querySelector('#restoreForm .rc-card');
    const codeBlock = document.querySelector('#restoreForm .rc-code');
    const input = document.getElementById('restoreCode');
    const btn = document.getElementById('restoreCodeBtn');
    const label = document.querySelector('#restoreForm .rc-cl');
    const vis = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const form = document.getElementById('restoreForm');
    return {
      cardShown: vis(card), codeShown: vis(codeBlock) && vis(input) && vis(btn),
      labelText: label ? label.textContent : '',
      inputmode: input ? input.getAttribute('inputmode') : '',
      autocomplete: input ? input.getAttribute('autocomplete') : '',
      labelSize: label ? parseFloat(getComputedStyle(label).fontSize) : 0,
      inputBorder: input ? getComputedStyle(input).borderTopColor : '',
      btnText: btn ? btn.textContent.trim() : '',
      fallbackKept: /welcome email/.test((document.querySelector('#restoreForm .rc-q') || {}).textContent || ''),
      overflow: Math.round(Math.max(0, ...[...form.querySelectorAll('*')].map(e => e.getBoundingClientRect().right)) - form.getBoundingClientRect().right),
      docScroll: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  ok(w + ': card + code row both render', m.cardShown && m.codeShown);
  ok(w + ': label names the 6-digit code and the email', /6-digit code/.test(m.labelText) && /email/.test(m.labelText), m.labelText.trim());
  ok(w + ': numeric keypad on phones', m.inputmode === 'numeric' && m.autocomplete === 'one-time-code');
  ok(w + ': input border is the card\'s own gold', m.inputBorder === 'rgb(216, 165, 46)', m.inputBorder);
  ok(w + ': button says Restore', m.btnText === 'Restore', m.btnText);
  ok(w + ': welcome-email fallback line kept', m.fallbackKept);
  ok(w + ': nothing overflows the form', m.overflow <= 0, m.overflow + 'px');
  ok(w + ': no sideways page scroll', m.docScroll <= 0, m.docScroll + 'px');

  // a short/garbled code never even calls the network
  await page.evaluate(() => { document.getElementById('restoreCode').value = '12 34'; return restoreWithCode(); });
  await page.waitForTimeout(150);
  let msg = await page.evaluate(() => document.getElementById('restoreCodeMsg').textContent);
  ok(w + ': too-short code caught locally', /6 digits/.test(msg), msg);
  ok(w + ': …without a network call', codeCalls === 0, String(codeCalls));

  // a wrong code fails kindly and leaves the card standing
  await page.evaluate(() => { document.getElementById('restoreCode').value = '111111'; return restoreWithCode(); });
  await page.waitForTimeout(300);
  msg = await page.evaluate(() => ({ t: document.getElementById('restoreCodeMsg').textContent, card: !!document.querySelector('#restoreForm .rc-card'), }));
  ok(w + ': wrong code shows the didn\'t-match note', /didn't match/.test(msg.t), msg.t);
  ok(w + ': the card stays for another try', msg.card);
  const ratio = await page.evaluate(`(() => {
    const lum = c => { const [r,g,b] = c.map(v => { v/=255; return v<=.03928 ? v/12.92 : Math.pow((v+.055)/1.055,2.4); }); return .2126*r+.7152*g+.0722*b; };
    const parse = s => s.match(/[\\d.]+/g).slice(0,3).map(Number);
    const el = document.getElementById('restoreCodeMsg');
    let n = el, bg = [255,255,255];
    while (n && n !== document.documentElement) { const c = getComputedStyle(n).backgroundColor; if (c && !/rgba\\(0, 0, 0, 0\\)|transparent/.test(c)) { bg = parse(c); break; } n = n.parentElement; }
    const a = lum(parse(getComputedStyle(el).color)), b = lum(bg);
    const [hi,lo] = a>b?[a,b]:[b,a]; return +((hi+.05)/(lo+.05)).toFixed(2);
  })()`);
  ok(w + ': the error text clears AA (4.5:1)', ratio >= 4.5, ratio + ':1');

  // the right code lands her in her portrait, in THIS storage context
  await page.evaluate(() => { document.getElementById('restoreCode').value = '482 917'; return restoreWithCode(); });
  await page.waitForTimeout(600);
  const done = await page.evaluate(() => ({
    screen: (document.querySelector('.scr.act') || {}).id,
    ssData: !!localStorage.getItem('ss_data'),
    name: (JSON.parse(localStorage.getItem('ss_data') || '{}').userName) || '',
    token: localStorage.getItem('ss_token') || '',
    emailDone: localStorage.getItem('ss_emailDone') === 'true'
  }));
  ok(w + ': her portrait screen opened', done.screen === 's-res', done.screen);
  ok(w + ': results persisted to this context\'s storage', done.ssData && done.name === 'Cath', done.name);
  ok(w + ': the fresh save-token was stored', done.token === 'fresh-token-from-code', done.token);
  ok(w + ': emailDone remembered', done.emailDone);
  ok(w + ': zero JS errors', errs.length === 0, errs.join(' | '));
  await page.close();
}
await browser.close(); server.close();
console.log('\n' + (pass + fail) + ' checks, ' + fail + ' failures');
process.exit(fail ? 1 : 0);
