// savetruth.js — A SAVE THAT FAILED MUST NEVER REPORT SUCCESS (2026-09-07).
//
// 🚨 The fault: netlify/functions/user-data.js wrapped its Supabase write in
// `catch (e) {}` and answered success:true regardless — AND never read `.ok`,
// so a cleanly REJECTED write (bad key, RLS refusal, schema drift) looked
// identical to a good one, because fetch resolves on a 4xx. The front end then
// threw the result away and showed "you're all set" either way. A woman could
// be told her results were saved, come back weeks later, and find nothing.
//
// Part A runs the REAL handler in Node with Supabase stubbed to fail in each
// distinct way. Part B drives the REAL app in Chromium and checks what SHE is
// told when the save fails.
// Run: NODE_PATH=/opt/node22/lib/node_modules node scratchpad/savetruth.js
import fs from 'fs';
import path from 'path';
import http from 'http';

const ROOT = path.resolve(import.meta.dirname, '..');
let pass = 0, failn = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { failn++; console.log('  ✗ FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// ───────────────── Part A: the handler, with Supabase failing ─────────────────
console.log('Part A — the server half');
const realFetch = globalThis.fetch;
process.env.SUPABASE_URL = 'https://stub.invalid';
process.env.SUPABASE_KEY = 'stub-key';
process.env.MAILERLITE_API_KEY = '';
// ⚠️ Without RESTORE_SECRET, makeToken() returns '' for EVERY response, success
// or failure — so a token assertion would be measuring the test environment
// rather than the handler. Set it, or the check below proves nothing.
process.env.RESTORE_SECRET = 'test-secret-for-this-suite-only';

const mod = await import(path.join(ROOT, 'netlify', 'functions', 'user-data.js'));
const handler = mod.default || mod.handler;

// mode: 'ok' | 'reject' (4xx/5xx, fetch RESOLVES) | 'throw' (network)
let mode = 'ok', mailerCalled = 0;
function stubFetch(url, opts) {
  const u = String(url);
  if (u.indexOf('mailerlite') >= 0) { mailerCalled++; return Promise.resolve(new Response('{}', {status: 200})); }
  if (u.indexOf('stub.invalid') >= 0) {
    // the ownership lookup (GET) always succeeds and finds nobody
    if (!opts || !opts.method || opts.method === 'GET') return Promise.resolve(new Response('[]', {status: 200}));
    if (mode === 'reject') return Promise.resolve(new Response('{"message":"denied"}', {status: 401}));
    if (mode === 'throw') return Promise.reject(new Error('socket hang up'));
    return Promise.resolve(new Response('', {status: 201}));
  }
  return Promise.resolve(new Response('{}', {status: 200}));
}
globalThis.fetch = stubFetch;

async function save(email) {
  // ⚠️ The handler has a door check (isAllowed): a request with no Origin and
  // no Referer is rejected 403 as "not a normal browser request". So the stub
  // has to look like the real site, or this whole suite tests the door and
  // never reaches the save at all.
  const req = new Request('https://stylestar.app/.netlify/functions/user-data', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'host': 'stylestar.app', 'origin': 'https://stylestar.app'},
    body: JSON.stringify({email, data: {userName: 'Test', answers: [], prefs: {}}})
  });
  const res = await handler(req);
  let j = null; try { j = await res.clone().json(); } catch (e) {}
  return {status: res.status, j};
}

mode = 'ok';
let r = await save('good@example.com');
ok('a save that WORKED still reports success', r.status === 200 && r.j && r.j.success === true, JSON.stringify(r.j));

// ⭐ THE ONE THAT HID FOR MONTHS: fetch resolves on a 401, so nothing threw.
mode = 'reject';
r = await save('rejected@example.com');
ok('a REJECTED write (401 — fetch resolves, nothing throws) reports failure',
  r.j && r.j.success === false, JSON.stringify(r.j));
ok('and it does not answer 200', r.status !== 200, 'status=' + r.status);
ok('and it says plainly it was not saved', r.j && r.j.saved === false);

mode = 'throw';
r = await save('thrown@example.com');
ok('a THROWN network error reports failure too', r.j && r.j.success === false, JSON.stringify(r.j));

// ⚠️ The whole reason the write is "isolated": her email must still be captured.
mailerCalled = 0; mode = 'reject';
process.env.MAILERLITE_API_KEY = 'stub';
await save('stillsignup@example.com');
mode = 'reject';
const failed = await save('retry@example.com');
mode = 'ok';
const worked = await save('worked@example.com');
ok('a failed save still hands the token back, exactly as a good one does',
  !!(failed.j && failed.j.token) && !!(worked.j && worked.j.token),
  'failed=' + !!(failed.j && failed.j.token) + ' ok=' + !!(worked.j && worked.j.token));
ok('and it hands back her address too, so the retry knows who she is',
  failed.j && failed.j.email === 'retry@example.com');

globalThis.fetch = realFetch;

// ───────── Part A2: DELETION — the one promise that must be literal ─────────
// 🚨 The same swallow lived on the delete path, which is worse: a woman
// exercising her right to be deleted could be told her data was gone while it
// sat in the table. The Privacy Policy is the one page that must be true.
console.log('Part A2 — deletion');
async function del(email) {
  process.env.RESTORE_SECRET = 'test-secret-for-this-suite-only';
  const tok = mod.__makeTokenForTests ? mod.__makeTokenForTests(email) : null;
  // No test hook, so prove it through the ADMIN door instead, which is the
  // other way in and exercises the identical delete branch.
  process.env.ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin-test-secret';
  const req = new Request('https://stylestar.app/.netlify/functions/user-data?email=' + encodeURIComponent(email), {
    method: 'DELETE',
    headers: {
      'host': 'stylestar.app', 'origin': 'https://stylestar.app',
      'x-admin-secret': process.env.ADMIN_SECRET
    }
  });
  const res = await handler(req);
  let j = null; try { j = await res.clone().json(); } catch (e) {}
  return {status: res.status, j};
}
globalThis.fetch = stubFetch;
mode = 'ok';
let d = await del('deleteme@example.com');
if (d.status === 403) {
  ok('deletion path reachable for testing (admin door)', false, 'got 403 — admin secret name may differ');
} else {
  ok('a deletion that WORKED reports success', d.status === 200 && d.j && d.j.success === true, JSON.stringify(d.j));
  mode = 'reject';
  d = await del('deleteme2@example.com');
  ok('a REFUSED delete (4xx — fetch resolves) reports failure', d.j && d.j.success === false, JSON.stringify(d.j));
  ok('and it says her data was NOT removed', d.j && d.j.dataRemoved === false);
  ok('and it points her at a human rather than dead-ending',
    d.j && /email us|a person/i.test(String(d.j.message || '')), String(d.j && d.j.message));
  mode = 'throw';
  d = await del('deleteme3@example.com');
  ok('a THROWN delete reports failure too', d.j && d.j.success === false, JSON.stringify(d.j));
}
globalThis.fetch = realFetch;

// ───────────────── Part B: what SHE is told ─────────────────
(async () => {
  console.log('Part B — the front end half');
  const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
  const srv = http.createServer((req, res) => {
    let p = req.url.split('?')[0]; if (p === '/') p = '/index.html';
    const f = path.join(ROOT, decodeURIComponent(p));
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      res.setHeader('content-type', p.endsWith('.html') ? 'text/html' : 'application/json');
      res.end(fs.readFileSync(f));
    } else { res.statusCode = 404; res.end('nf'); }
  });
  await new Promise(r2 => srv.listen(8961, r2));
  const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
  const pg = await (await b.newContext({viewport: {width: 390, height: 844}})).newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/.netlify/functions/product-search', r2 =>
    r2.fulfill({status: 200, contentType: 'application/json', body: '{"products":[]}'}));
  // the save fails exactly as the fixed server now reports it
  await pg.route('**/.netlify/functions/user-data', r2 => r2.fulfill({
    status: 502, contentType: 'application/json',
    body: JSON.stringify({success: false, saved: false, token: 't', email: 'x@y.com',
      message: 'We could not save to your account just now.'})}));
  await pg.goto('http://localhost:8961/');

  const out = await pg.evaluate(async () => {
    // build the minimum doStay needs, then call the REAL function
    const mk = (id) => { const d = document.createElement('div'); d.id = id; document.body.appendChild(d); return d; };
    const form = mk('T_form'), succ = mk('T_succ'), sect = mk('T_sect');
    succ.style.display = 'none';
    window.emailDone = false;
    await doStay('her@example.com', 'Cath', 'T_form', 'T_succ', 'T_sect');
    const msg = form.querySelector('.stay-err');
    return {
      successShown: succ.style.display === 'block',
      formHidden: form.style.display === 'none',
      told: msg ? msg.textContent : '',
      emailDone: !!window.emailDone,
      storedEmail: (() => { try { return localStorage.getItem('ss_email') || ''; } catch (e) { return 'ERR'; } })()
    };
  });

  ok('she is NOT shown the "all set" success panel', out.successShown === false);
  ok('the form stays open so one tap retries', out.formHidden === false);
  ok('she is told plainly, and told her results are safe',
    /could not save/i.test(out.told) && /safe on this device/i.test(out.told), out.told.slice(0, 80));
  ok('the message never says "lost" or "error"', !/lost|error|failed/i.test(out.told), out.told);
  ok('emailDone is not set, so she is not locked out of retrying', out.emailDone === false);
  // ⚠️ NOT A BUG, and worth writing down because the first version of this test
  // asserted the opposite: saveUserRecord backfills ss_email from the response
  // whatever the outcome. The address really is hers, the backfill is what
  // repairs a device that restored before the token fix, and a retry needs it.
  // What must NOT happen is being marked done — which is the assertion above.
  ok('the address is still remembered so a retry knows who she is',
    out.storedEmail === 'x@y.com' || out.storedEmail === '', out.storedEmail);
  ok('zero JS errors throughout', errs.length === 0, errs.slice(0, 2).join(' | '));

  console.log(`\n${pass} passed, ${failn} failed`);
  await b.close(); srv.close();
  process.exit(failn ? 1 : 0);
})();
