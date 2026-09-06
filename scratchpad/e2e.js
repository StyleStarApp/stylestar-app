// End-to-end check of the save / restore journey after the user-data lockdown.
// Criterion 8 of the security brief: "a new user can finish the quiz, save,
// close the tab, click the emailed link, and get her results back."
//
// This serves the REAL index.html and routes /.netlify/functions/user-data to
// the REAL handler (Supabase and MailerLite stubbed), so it exercises the
// actual client + server integration rather than a re-implementation.
//
//   NODE_PATH=/opt/node22/lib/node_modules node scratchpad/e2e.js
//
import http from 'http';
import fs from 'fs';
import path from 'path';
// ESM ignores NODE_PATH, so reach the global install by absolute path.
// Playwright is CommonJS and attaches `chromium` dynamically, so the named
// ESM export is undefined — go through `default`.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;

process.env.SUPABASE_URL = 'https://fake.supabase.co';
process.env.SUPABASE_KEY = 'fake-key';
process.env.RESTORE_SECRET = 'e2e-secret';
delete process.env.MAILERLITE_API_KEY;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DB = new Map();

const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.startsWith('https://connect.mailerlite.com')) {
    return new Response(JSON.stringify({ data: { id: '1' } }), { status: 200 });
  }
  if (u.startsWith('https://fake.supabase.co')) {
    const m = u.match(/email=eq\.([^&]+)/);
    const email = m ? decodeURIComponent(m[1]) : null;
    const method = (opts.method || 'GET').toUpperCase();
    if (method === 'GET') {
      return new Response(JSON.stringify(
        email && DB.has(email) ? [{ email, data: JSON.stringify(DB.get(email)) }] : []
      ), { status: 200 });
    }
    // ⚠️⚠️ `new Response('', {status:204})` THROWS in Node — 204 is a null-body
    // status, so an empty STRING is still a body and the constructor rejects it.
    // This stub had been throwing on every single write, and user-data.js's old
    // `catch (e) {}` swallowed it and answered success:true regardless — so the
    // two "save returns 200" checks below were passing on the very lie that
    // suite exists to catch. Surfaced 2026-09-07 the moment the handler started
    // reporting write failures honestly. Body must be null.
    if (method === 'PATCH') { DB.set(email, JSON.parse(JSON.parse(opts.body).data)); return new Response(null, { status: 204 }); }
    if (method === 'POST') { const b = JSON.parse(opts.body); DB.set(b.email, JSON.parse(b.data)); return new Response(null, { status: 204 }); }
  }
  return realFetch(url, opts);
};

const { default: userData } = await import('../netlify/functions/user-data.js');

const PORT = 8899, ORIGIN = 'http://localhost:' + PORT;
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, ORIGIN);
  if (url.pathname === '/.netlify/functions/user-data') {
    let raw = '';
    for await (const c of req) raw += c;
    // Netlify sends the real Host/Origin; localhost stands in for our domain.
    const fake = new Request('https://www.stylestar.app' + url.pathname + url.search, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: (req.method === 'POST') ? raw : undefined
    });
    const orig = fake.headers.get.bind(fake.headers);
    fake.headers.get = (k) => {
      const lk = k.toLowerCase();
      if (lk === 'host') return 'www.stylestar.app';
      if (lk === 'origin') return 'https://www.stylestar.app';
      if (lk === 'referer') return 'https://www.stylestar.app/';
      if (lk === 'x-nf-client-connection-ip') return '10.1.1.' + Math.floor(Math.random() * 250 + 1);
      return orig(k);
    };
    const out = await userData(fake);
    res.writeHead(out.status, { 'Content-Type': 'application/json' });
    res.end(await out.text());
    return;
  }
  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(path.join(ROOT, 'index.html')));
    return;
  }
  const f = path.join(ROOT, url.pathname.replace(/^\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200); res.end(fs.readFileSync(f)); return; }
  res.writeHead(404); res.end('');
});
await new Promise(r => server.listen(PORT, r));

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
};

const browser = await chromium.launch();
const errors = [];

async function newPage(query = '') {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  // Block outbound calls the AI screens make; we're testing save/restore only.
  await page.route('**/.netlify/functions/style-ai', r => r.fulfill({ status: 200, body: '{"content":[{"text":"stub"}]}' }));
  await page.goto(ORIGIN + '/' + query, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.saveUserRecord === 'function');
  return { ctx, page };
}

const EMAIL = 'e2e@example.com';

console.log('\n1. A new user saves her results');
let { ctx, page } = await newPage();
// saveFromSheet() is the real results-screen save (the bottom sheet). Note:
// saveUserData()/saveUserDataPhoto() are dead code — they reference stayInput /
// stayName ids that no longer exist in the markup. Pre-existing, left alone.
await page.evaluate((email) => {
  window.userName = 'Catherine';
  window.answers = new Array(12).fill(6);
  window.topArchNames = ['Timeless Classic'];
  const rp = document.getElementById('rp');
  if (rp) rp.textContent = 'Your style is quietly confident.';
  document.getElementById('sheetEmail').value = email;
  document.getElementById('sheetName').value = 'Catherine';
  return window.saveFromSheet();
}, EMAIL);
await page.waitForFunction(() => !!localStorage.getItem('ss_token'), null, { timeout: 5000 }).catch(() => {});
let tok = await page.evaluate(() => localStorage.getItem('ss_token'));
ok('the save landed in the database', DB.has(EMAIL));
ok('her portrait was stored', !!(DB.get(EMAIL) || {}).portrait);
ok('the device kept a token', !!tok && tok.length > 20, String(tok));

console.log('\n2. The same device can save again (the token is accepted)');
DB.get(EMAIL).marker = 'before';
let again = await page.evaluate(() => window.saveUserRecord(localStorage.getItem('ss_email'), { userName: 'Catherine', portrait: 'Updated portrait', answers: window.answers }));
ok('second save returns 200, not 403', again.status === 200, 'got ' + again.status);
ok('the update really applied', (DB.get(EMAIL) || {}).portrait === 'Updated portrait');

console.log('\n3. A stranger cannot overwrite her profile');
const strangerRes = await page.evaluate(async (email) => {
  const r = await fetch('/.netlify/functions/user-data', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, data: { userName: 'Attacker', portrait: 'hacked' } })
  });
  return r.status;
}, EMAIL);
ok('a save with no token is refused', strangerRes === 403, 'got ' + strangerRes);
ok('her portrait is intact', (DB.get(EMAIL) || {}).portrait === 'Updated portrait');

console.log('\n4. A stranger cannot read her profile by email');
const peek = await page.evaluate(async (email) => {
  const r = await fetch('/.netlify/functions/user-data?email=' + encodeURIComponent(email));
  return { status: r.status, body: await r.text() };
}, EMAIL);
ok('status 200 (same as for an unknown address)', peek.status === 200);
ok('no name in the response', !peek.body.includes('Catherine'), peek.body);
ok('no portrait in the response', !peek.body.includes('portrait'), peek.body);

console.log('\n5. The in-app "Find my results" box points her at her email');
// Drive it the way she reaches it: on the welcome screen, form opened via
// showRestore(). Without this, #restoreForm stays display:none and every
// visibility assertion below would pass or fail for the wrong reason.
await page.evaluate(() => {
  document.querySelectorAll('.scr').forEach(s => s.classList.remove('act'));
  document.getElementById('s-wel').classList.add('act');
  window.showRestore();
});
await page.evaluate(() => { document.getElementById('restoreEmail').value = 'e2e@example.com'; return window.restoreResults(); });
await page.waitForTimeout(400);
const msg = await page.evaluate(() => document.getElementById('restoreMsg').textContent);
ok('it says to check her email', /check your email/i.test(msg), msg);
// wording tightened 2026-08-09 with the Option C card ("we've just sent a link
// back to your results"); the claim under test is unchanged
ok('it says a link has just been sent', /just sent (you )?a link/i.test(msg), msg);
ok('it names the welcome email as a fallback', /welcome email/i.test(msg), msg);
ok('it still offers the quiz as a way forward', /style quiz/i.test(msg), msg);
ok('it does not dump her results on screen', !/quietly confident|Updated portrait/i.test(msg));
// The form has done its job — a big black button above the quiet confirmation
// is the loudest thing on screen at the moment it means least.
let askShown = await page.evaluate(() => {
  const a = document.getElementById('restoreAsk');
  return !!a && a.offsetParent !== null;
});
ok('the email field and button stand down after sending', !askShown);
ok('but she is offered a way back if she mistyped', /different email/i.test(msg), msg);
// …and that way back really works.
await page.evaluate(() => window.restoreAskAgain());
await page.waitForTimeout(200);
const backState = await page.evaluate(() => {
  const a = document.getElementById('restoreAsk');
  return {
    shown: !!a && a.offsetParent !== null,
    value: document.getElementById('restoreEmail').value,
    msg: document.getElementById('restoreMsg').textContent
  };
});
ok('"Try a different email" brings the form back', backState.shown);
ok('…cleared, ready for a new address', backState.value === '' && backState.msg === '');
// Send again so the rest of the section tests the sent state.
await page.evaluate(() => { document.getElementById('restoreEmail').value = 'e2e@example.com'; return window.restoreResults(); });
await page.waitForTimeout(300);
// The message must be identical for an address that has no account — otherwise
// this box tells a stranger who uses Style Star.
await page.evaluate(() => { document.getElementById('restoreEmail').value = 'nobody-at-all@example.com'; return window.restoreResults(); });
await page.waitForTimeout(400);
const msg2 = await page.evaluate(() => document.getElementById('restoreMsg').textContent);
ok('identical message for an unknown address', msg2 === msg);
await ctx.close();

console.log('\n6. A NEW device restores from the emailed link (criterion 8)');
// Mint the link the welcome email carries.
const mod = await import('../netlify/functions/user-data.js');
const linkRes = await (async () => {
  const r = await fetch(ORIGIN + '/.netlify/functions/user-data?email=' + encodeURIComponent(EMAIL));
  return r.status;
})();
ok('requesting a link returns 200', linkRes === 200);
// The token as the welcome email would carry it.
const crypto = await import('crypto');
const key = crypto.createHash('sha256').update('e2e-secret').digest();
const iv = crypto.randomBytes(12);
const c = crypto.createCipheriv('aes-256-gcm', key, iv);
const enc = Buffer.concat([c.update(JSON.stringify({ e: EMAIL, t: Date.now() }), 'utf8'), c.final()]);
const emailToken = Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64url');

// Give the stored record a marker we can see land on the new device. (The app's
// `userName` is a module-scoped `let`, so it isn't readable from the test — what
// it persists to localStorage is, and that's the thing that has to survive.)
DB.set(EMAIL, {
  userName: 'Catherine',
  portrait: 'Your style is quietly confident.',
  prefs: { sizes: '8', marker: 'restored-prefs' },
  wardrobe: { items: [], wishlist: [], pretap0: true }
});

({ ctx, page } = await newPage('?r=' + encodeURIComponent(emailToken)));
await page.waitForTimeout(1200);
const restored = await page.evaluate(() => ({
  prefs: localStorage.getItem('ss_prefs') || '',
  token: localStorage.getItem('ss_token'),
  done: localStorage.getItem('ss_emailDone')
}));
ok('her saved preferences came back', restored.prefs.includes('restored-prefs'), restored.prefs);
ok('the restored device got a token', !!restored.token && restored.token.length > 20);
ok('she counts as a saved user again', restored.done === 'true');

console.log('\n7. …and that restored device can save again');
const afterRestore = await page.evaluate((email) =>
  window.saveUserRecord(email, { userName: 'Catherine', portrait: 'Saved from new device' }), EMAIL);
ok('save from the restored device returns 200', afterRestore.status === 200, 'got ' + afterRestore.status);
ok('the update applied', (DB.get(EMAIL) || {}).portrait === 'Saved from new device');

console.log('\n8. An expired link is refused, gracefully');
const iv2 = crypto.randomBytes(12);
const c2 = crypto.createCipheriv('aes-256-gcm', key, iv2);
const enc2 = Buffer.concat([c2.update(JSON.stringify({ e: EMAIL, t: Date.now() - 40 * 864e5 }), 'utf8'), c2.final()]);
const oldToken = Buffer.concat([iv2, c2.getAuthTag(), enc2]).toString('base64url');
const expired = await page.evaluate(async (t) => {
  const r = await fetch('/.netlify/functions/user-data?token=' + encodeURIComponent(t));
  return { status: r.status, body: await r.text() };
}, oldToken);
ok('expired link → 401', expired.status === 401, 'got ' + expired.status);
ok('expired link leaks nothing', !expired.body.includes('Catherine'), expired.body);
await ctx.close();

console.log('\n9. No JavaScript errors anywhere in that journey');
ok('zero page errors', errors.length === 0, errors.join(' | '));

await browser.close();
server.close();
console.log('\n' + (fail ? '✗ ' + fail + ' FAILED, ' : '✓ ') + pass + ' passed');
process.exit(fail ? 1 : 0);
