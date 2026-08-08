// Verification for the user-data.js lockdown (2026-07-29).
// Runs the REAL exported handler with Supabase and MailerLite stubbed, so every
// check below exercises the actual auth logic rather than a copy of it.
//
//   node scratchpad/sec.js
//
process.env.SUPABASE_URL = 'https://fake.supabase.co';
process.env.SUPABASE_KEY = 'fake-key';
process.env.RESTORE_SECRET = 'test-secret-for-verification';
delete process.env.MAILERLITE_API_KEY; // keep MailerLite out of it entirely

const DB = new Map(); // email -> data object
const ML = 'https://connect.mailerlite.com/api';
const ML_SUBS = new Map(); // email -> the name currently on her subscriber record
let mlCalls = [];

// The timing tests give MailerLite realistic latency so a real send takes
// real time; everywhere else the stub answers instantly.
let ML_DELAY = 0;

const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.startsWith('https://api.anthropic.com')) {
    return new Response(JSON.stringify({ content: [{ type: 'text', text: 'stubbed' }] }), { status: 200 });
  }
  if (u.startsWith('https://connect.mailerlite.com')) {
    if (ML_DELAY) await new Promise(r => setTimeout(r, ML_DELAY));
    const method = (opts.method || 'GET').toUpperCase();
    mlCalls.push(method + ' ' + u.replace(ML, '') + (opts.body ? ' ' + opts.body : ''));
    if (u.includes('/groups?')) return new Response(JSON.stringify({ data: [{ id: 'g-signups', name: 'Style Star Signups' }] }), { status: 200 });
    if (u.endsWith('/groups')) return new Response(JSON.stringify({ data: { id: 'g-restore' } }), { status: 200 });
    // Looking up an existing subscriber by email (used by the name guard).
    const look = u.match(/\/subscribers\/([^/]+)$/);
    if (method === 'GET' && look) {
      const who = decodeURIComponent(look[1]);
      if (!ML_SUBS.has(who)) return new Response('', { status: 404 });
      return new Response(JSON.stringify({ data: { id: 'sub-1', fields: { name: ML_SUBS.get(who) } } }), { status: 200 });
    }
    return new Response(JSON.stringify({ data: { id: 'sub-1' } }), { status: 200 });
  }
  if (u.startsWith('https://fake.supabase.co')) {
    const m = u.match(/email=eq\.([^&]+)/);
    const email = m ? decodeURIComponent(m[1]) : null;
    const method = (opts.method || 'GET').toUpperCase();
    if (method === 'GET') {
      const row = email && DB.has(email) ? [{ email, data: JSON.stringify(DB.get(email)) }] : [];
      return new Response(JSON.stringify(row), { status: 200 });
    }
    if (method === 'PATCH') {
      DB.set(email, JSON.parse(JSON.parse(opts.body).data));
      return new Response(null, { status: 204 });
    }
    if (method === 'DELETE') { DB.delete(email); return new Response(null, { status: 204 }); }
    if (method === 'POST') {
      const b = JSON.parse(opts.body);
      DB.set(b.email, JSON.parse(b.data));
      return new Response(null, { status: 204 });
    }
  }
  return realFetch(url, opts);
};

const { default: handler } = await import('../netlify/functions/user-data.js');

const GOOD = { origin: 'https://www.stylestar.app', referer: 'https://www.stylestar.app/', host: 'www.stylestar.app' };

// Each call gets its own client IP by default, so the rate limiter in one
// section can't spill into the next. The rate-limit test pins a single IP.
let ipSeq = 0;
function call(method, { query = '', body = null, headers = GOOD, ip = null } = {}) {
  const req = new Request('https://www.stylestar.app/.netlify/functions/user-data' + query, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined
  });
  // Request() drops `host`; the function reads it for deploy-preview support.
  const clientIp = ip || ('10.0.0.' + (++ipSeq));
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

const PROFILE = { userName: 'Catherine', portrait: 'Your style is...', prefs: { sizes: '8' }, wardrobe: {} };

// ---------------------------------------------------------------------------
console.log('\n1. A brand-new user can save, and gets a token back');
let res = await call('POST', { body: { email: 'new@example.com', data: PROFILE } });
let j = await body(res);
ok('first save succeeds', res.status === 200 && j.success === true, 'status ' + res.status);
ok('response carries a token', typeof j.token === 'string' && j.token.length > 20);
ok('the row really landed in the database', DB.has('new@example.com'));
const OWNER_TOKEN = j.token;

// ---------------------------------------------------------------------------
console.log('\n2. Reading by EMAIL never returns user data (criterion 1)');
const existing = await call('GET', { query: '?email=new@example.com' });
const missing = await call('GET', { query: '?email=nobody@example.com' });
const eb = await body(existing), mb = await body(missing);
ok('existing account: status 200', existing.status === 200);
ok('existing account: no data field', !eb.data, JSON.stringify(eb));
ok('existing account: no name leaked', !JSON.stringify(eb).includes('Catherine'));
ok('existing account: no portrait leaked', !JSON.stringify(eb).includes('Your style is'));
ok('unknown account: identical status', missing.status === existing.status);
ok('unknown account: identical body', JSON.stringify(mb) === JSON.stringify(eb),
   JSON.stringify(mb) + ' vs ' + JSON.stringify(eb));

// ---------------------------------------------------------------------------
console.log('\n3. Reading by TOKEN returns the right profile (criterion 2)');
res = await call('GET', { query: '?token=' + encodeURIComponent(OWNER_TOKEN) });
j = await body(res);
ok('status 200', res.status === 200);
ok('returns her profile', j.success === true && j.data && j.data.userName === 'Catherine');
ok('hands back a fresh token so the device can save', typeof j.token === 'string' && j.token.length > 20);

// ---------------------------------------------------------------------------
console.log('\n4. Bad tokens are rejected cleanly (criterion 3)');
for (const [label, t] of [
  ['tampered', OWNER_TOKEN.slice(0, -4) + 'AAAA'],
  ['truncated', OWNER_TOKEN.slice(0, 20)],
  ['garbage', 'not-a-token'],
  ['empty-ish', '....']
]) {
  const r = await call('GET', { query: '?token=' + encodeURIComponent(t) });
  const b = await body(r);
  ok(label + ' token → 401, not 500', r.status === 401, 'got ' + r.status);
  ok(label + ' token → no data', !b || !b.data);
}

// ---------------------------------------------------------------------------
console.log('\n5. Cross-origin callers are rejected (criterion 4)');
// A browser making a cross-origin call still sends Host = OUR host; only the
// Origin/Referer identify the attacker. The forged-host case is a non-browser
// client (curl) setting every header itself.
for (const [label, h] of [
  ['evil.com origin', { origin: 'https://evil.com', referer: 'https://evil.com/', host: 'www.stylestar.app' }],
  ['no origin or referer', { host: 'www.stylestar.app' }],
  ['lookalike domain', { origin: 'https://stylestar.app.evil.com', referer: 'https://stylestar.app.evil.com/', host: 'www.stylestar.app' }],
  ['forged Host header (curl)', { origin: 'https://evil.com', referer: 'https://evil.com/', host: 'evil.com' }],
  ['forged Host, netlify lookalike', { origin: 'https://netlify.app.evil.com', referer: 'https://netlify.app.evil.com/', host: 'netlify.app.evil.com' }]
]) {
  const r = await call('GET', { query: '?token=' + encodeURIComponent(OWNER_TOKEN), headers: h });
  const b = await body(r);
  ok(label + ' → 403', r.status === 403, 'got ' + r.status);
  ok(label + ' → no data', !b || !b.data);
}
// CORS header must never echo a stranger's origin
const evil = await call('OPTIONS', { headers: { origin: 'https://evil.com', host: 'evil.com' } });
ok('CORS never reflects a stranger origin',
   evil.headers.get('access-control-allow-origin') === 'https://www.stylestar.app',
   evil.headers.get('access-control-allow-origin'));
ok('CORS is no longer the wildcard *', evil.headers.get('access-control-allow-origin') !== '*');
ok('Vary: Origin is set', (evil.headers.get('vary') || '').toLowerCase().includes('origin'));
const good = await call('OPTIONS');
ok('our own origin is reflected', good.headers.get('access-control-allow-origin') === 'https://www.stylestar.app');

// Deploy previews must keep working — that's why self-host is allowed at all.
const preview = { origin: 'https://deploy-preview-42--stylestar.netlify.app', referer: 'https://deploy-preview-42--stylestar.netlify.app/', host: 'deploy-preview-42--stylestar.netlify.app' };
res = await call('GET', { query: '?token=' + encodeURIComponent(OWNER_TOKEN), headers: preview });
ok('a Netlify deploy preview still works', res.status === 200, 'got ' + res.status);

// ---------------------------------------------------------------------------
console.log('\n6. Writes to an existing profile need the token (criterion 5)');
res = await call('POST', { body: { email: 'new@example.com', data: { userName: 'Attacker', portrait: 'hacked' } } });
ok('no token → 403', res.status === 403, 'got ' + res.status);
ok('her record is untouched', DB.get('new@example.com').userName === 'Catherine',
   DB.get('new@example.com').userName);

res = await call('POST', { body: { email: 'new@example.com', data: { userName: 'Attacker', portrait: 'x' }, token: 'garbage' } });
ok('bad token → 403', res.status === 403, 'got ' + res.status);
ok('her record is still untouched', DB.get('new@example.com').userName === 'Catherine');

res = await call('POST', { body: { email: 'new@example.com', data: { ...PROFILE, userName: 'Cath' }, token: OWNER_TOKEN } });
ok('her own token → save succeeds', res.status === 200, 'got ' + res.status);
ok('the update really applied', DB.get('new@example.com').userName === 'Cath');

// A token for a DIFFERENT account must not unlock this one.
await call('POST', { body: { email: 'other@example.com', data: PROFILE } });
const otherToken = (await body(await call('POST', { body: { email: 'other@example.com', data: PROFILE, token: null } }))) || {};
res = await call('POST', { body: { email: 'new@example.com', data: { userName: 'Nope', portrait: 'y' }, token: otherToken.token || '' } });
ok("another account's token → 403", res.status === 403, 'got ' + res.status);
ok('her record survived that too', DB.get('new@example.com').userName === 'Cath');

// ---------------------------------------------------------------------------
console.log('\n7. Token expiry (criterion 7)');
const crypto = await import('crypto');
function forgeToken(email, issuedAt) {
  const key = crypto.createHash('sha256').update(process.env.RESTORE_SECRET).digest();
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([c.update(JSON.stringify({ e: email, t: issuedAt }), 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64url');
}
function forgeLegacy(email) { // pre-timestamp format: a bare email string
  const key = crypto.createHash('sha256').update(process.env.RESTORE_SECRET).digest();
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([c.update(email, 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64url');
}
const DAY = 24 * 60 * 60 * 1000;
res = await call('GET', { query: '?token=' + encodeURIComponent(forgeToken('new@example.com', Date.now() - 29 * DAY)) });
ok('29 days old → still works', res.status === 200, 'got ' + res.status);
res = await call('GET', { query: '?token=' + encodeURIComponent(forgeToken('new@example.com', Date.now() - 31 * DAY)) });
ok('31 days old → 401', res.status === 401, 'got ' + res.status);
ok('expired token returns no data', !(await body(res)).data);
res = await call('GET', { query: '?token=' + encodeURIComponent(forgeToken('new@example.com', Date.now() - 400 * DAY)) });
ok('a year old → 401', res.status === 401);

// Legacy tokens (already sitting in sent welcome emails) must keep working.
res = await call('GET', { query: '?token=' + encodeURIComponent(forgeLegacy('new@example.com')) });
j = await body(res);
ok('legacy pre-timestamp token still restores', res.status === 200 && j.data && j.data.userName === 'Cath',
   'status ' + res.status);

// ---------------------------------------------------------------------------
console.log('\n8. Rate limiting (criterion: task 5)');
mlCalls = [];
let served = 0, limited = 0;
for (let i = 0; i < 40; i++) {
  const r = await call('GET', { query: '?token=' + encodeURIComponent(OWNER_TOKEN), ip: '203.0.113.9' });
  if (r.status === 429) limited++; else if (r.status === 200) served++;
}
ok('a burst of 40 from one IP gets throttled', limited > 0, 'none were limited');
ok('the first 20 are served', served === 20, 'served ' + served);
ok('the rest are refused', limited === 20, 'limited ' + limited);
// A different visitor must not be punished for someone else's burst.
res = await call('GET', { query: '?token=' + encodeURIComponent(OWNER_TOKEN), ip: '198.51.100.4' });
ok('a different IP is unaffected', res.status === 200, 'got ' + res.status);

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
console.log('\n9. Asking for a restore link (the on-demand send)');
process.env.MAILERLITE_API_KEY = 'fake-ml-key';
mlCalls = [];
res = await call('GET', { query: '?email=new@example.com' });
ok('an existing account gets a 200', res.status === 200);
ok('a fresh token is written to her subscriber record',
   mlCalls.some(c => c.startsWith('POST /subscribers {') && c.includes('restore_token')), mlCalls.join(' | '));
const joinIdx = mlCalls.findIndex(c => c === 'POST /subscribers/sub-1/groups/g-restore');
const leaveIdx = mlCalls.findIndex(c => c === 'DELETE /subscribers/sub-1/groups/g-restore');
ok('she is added to the restore group (this is what sends the email)', joinIdx !== -1, mlCalls.join(' | '));
ok('she is removed from it FIRST, so a repeat request re-triggers',
   leaveIdx !== -1 && leaveIdx < joinIdx, mlCalls.join(' | '));
ok('the signups group is never touched (no re-sent welcome email)',
   !mlCalls.some(c => c.includes('g-signups')), mlCalls.join(' | '));

// Asking again IMMEDIATELY must send nothing — one email per address per five
// minutes, however many IPs the asks come from, so one inbox can't be flooded.
mlCalls = [];
res = await call('GET', { query: '?email=new@example.com' });
ok('a second ask inside 5 minutes sends nothing', mlCalls.length === 0, mlCalls.join(' | '));
ok('…and still returns the identical 200', res.status === 200 &&
   JSON.stringify(await body(res)) === JSON.stringify({ success: true, sent: true }));

// After the window she can ask again — and the leave/rejoin still re-triggers
// the automation (asking on different days must send on different days).
const _realNow = Date.now;
Date.now = () => _realNow() + 6 * 60 * 1000;
mlCalls = [];
await call('GET', { query: '?email=new@example.com' });
Date.now = _realNow;
const join2 = mlCalls.findIndex(c => c === 'POST /subscribers/sub-1/groups/g-restore');
const leave2 = mlCalls.findIndex(c => c === 'DELETE /subscribers/sub-1/groups/g-restore');
ok('after the cooldown she can ask again (a fresh send happens)',
   mlCalls.filter(c => c === 'POST /subscribers/sub-1/groups/g-restore').length === 1, mlCalls.join(' | '));
ok('and she is still removed from the group first', leave2 !== -1 && leave2 < join2, mlCalls.join(' | '));

// An address with no account must trigger NOTHING — otherwise a stranger could
// use this to mail a woman, and the timing would leak who has an account.
mlCalls = [];
res = await call('GET', { query: '?email=nobody@example.com' });
ok('an unknown address sends no email at all', mlCalls.length === 0, mlCalls.join(' | '));
ok('…and still returns the identical 200', res.status === 200);

// ---------------------------------------------------------------------------
console.log('\n9b. The email lookup takes the same TIME whether the account exists');
// The bodies were already identical; this closes the stopwatch. MailerLite
// gets 200ms of latency per call here so the exists-path really is doing slow
// work, and both paths must still come back together (at the response floor).
ML_DELAY = 200;
await call('POST', { body: { email: 'clock@example.com', data: PROFILE } });
mlCalls = [];
let t0 = Date.now();
res = await call('GET', { query: '?email=clock@example.com' });
const existsMs = Date.now() - t0;
ok('the slow path really ran (a send actually happened)',
   mlCalls.some(c => c === 'POST /subscribers/sub-1/groups/g-restore'), mlCalls.join(' | '));
t0 = Date.now();
res = await call('GET', { query: '?email=ghost@example.com' });
const unknownMs = Date.now() - t0;
ok('existing vs unknown within 150ms (' + existsMs + 'ms vs ' + unknownMs + 'ms)',
   Math.abs(existsMs - unknownMs) <= 150);
ok('neither returns before the floor', existsMs >= 1150 && unknownMs >= 1150,
   existsMs + 'ms / ' + unknownMs + 'ms');
ML_DELAY = 0;
delete process.env.MAILERLITE_API_KEY;

// ---------------------------------------------------------------------------
console.log('\n10. Deletion is a real mechanism, not just a promise');
DB.set('goodbye@example.com', { userName: 'Jennifer', portrait: 'p' });
res = await call('DELETE', { query: '?email=goodbye@example.com' });
ok('a bare email cannot delete anyone', res.status === 401, 'got ' + res.status);
ok('her record survives that', DB.has('goodbye@example.com'));

const strangerTok = (await body(await call('POST', { body: { email: 'stranger@example.com', data: { userName: 's' } } }))).token;
res = await call('DELETE', { query: '?token=' + encodeURIComponent(strangerTok) + '&email=goodbye@example.com' });
ok("another woman's token cannot delete her record", DB.has('goodbye@example.com'));

// Her own link deletes her, in both systems.
process.env.MAILERLITE_API_KEY = 'fake-ml-key';
DB.set('goodbye@example.com', { userName: 'Jennifer', portrait: 'p' });
ML_SUBS.set('goodbye@example.com', 'Jennifer'); // she's on the email list too
const hers = forgeToken('goodbye@example.com', Date.now());
mlCalls = [];
res = await call('DELETE', { query: '?token=' + encodeURIComponent(hers) });
ok('her own link deletes her results', res.status === 200 && !DB.has('goodbye@example.com'), 'status ' + res.status);
ok('and removes her from the email list', mlCalls.some(c => c.startsWith('DELETE /subscribers/')), mlCalls.join(' | '));

// Cath can action an emailed request without touching two dashboards.
process.env.ADMIN_SECRET = 'admin-pass';
DB.set('goodbye@example.com', { userName: 'Jennifer', portrait: 'p' });
res = await call('DELETE', { query: '?email=goodbye@example.com', headers: { ...GOOD, 'x-admin-secret': 'wrong' } });
ok('a wrong admin secret is refused', res.status === 401 && DB.has('goodbye@example.com'), 'got ' + res.status);
res = await call('DELETE', { query: '?email=goodbye@example.com', headers: { ...GOOD, 'x-admin-secret': 'admin-pass' } });
ok('the right admin secret deletes her', res.status === 200 && !DB.has('goodbye@example.com'), 'got ' + res.status);

// From a terminal there is no Origin or Referer at all — the secret must be
// enough on its own for DELETE, and ONLY for DELETE.
DB.set('goodbye@example.com', { userName: 'Jennifer', portrait: 'p' });
res = await call('DELETE', { query: '?email=goodbye@example.com', headers: { host: 'www.stylestar.app', 'x-admin-secret': 'admin-pass' } });
ok('curl with the secret and no Origin works', res.status === 200 && !DB.has('goodbye@example.com'), 'got ' + res.status);
DB.set('goodbye@example.com', { userName: 'Jennifer', portrait: 'p' });
res = await call('DELETE', { query: '?email=goodbye@example.com', headers: { host: 'www.stylestar.app', 'x-admin-secret': 'wrong' } });
ok('curl with a wrong secret is refused at the door', res.status === 403 && DB.has('goodbye@example.com'), 'got ' + res.status);
res = await call('GET', { query: '?email=goodbye@example.com', headers: { host: 'www.stylestar.app', 'x-admin-secret': 'admin-pass' } });
ok('the secret does NOT open GET (deletion credential, not a master key)', res.status === 403, 'got ' + res.status);
delete process.env.ADMIN_SECRET;
delete process.env.MAILERLITE_API_KEY;
res = await call('DELETE', { query: '?email=x@y.com', headers: { ...GOOD, 'x-admin-secret': 'admin-pass' } });
ok('with no ADMIN_SECRET configured, that header does nothing', res.status === 401, 'got ' + res.status);

// ---------------------------------------------------------------------------
console.log('\n11. The "there" placeholder never overwrites a real name');
process.env.MAILERLITE_API_KEY = 'fake-ml-key';
const nameOf = () => {
  const c = mlCalls.find(x => x.startsWith('POST /subscribers {'));
  if (!c) return '(no subscriber write)';
  try { return (JSON.parse(c.slice(c.indexOf('{'))).fields || {}).name ?? '(none sent)'; }
  catch (e) { return '(unparseable)'; }
};

// A woman who gives her name gets it written.
DB.delete('sarah@example.com'); ML_SUBS.delete('sarah@example.com');
mlCalls = [];
let r = await body(await call('POST', { body: { email: 'sarah@example.com', data: { userName: 'Sarah', portrait: 'p' } } }));
const sarahTok = r.token;
ok('a real name is written', nameOf() === 'Sarah', nameOf());

// Now she saves again from a screen that doesn't know her name. (Her own token,
// so this is a legitimate save, not the 403 path.)
ML_SUBS.set('sarah@example.com', 'Sarah');
mlCalls = [];
await call('POST', { body: { email: 'sarah@example.com', data: { userName: 'You', portrait: 'p2' }, token: sarahTok } });
ok('"there" does NOT overwrite her real name', nameOf() === '(none sent)', nameOf());

// A brand-new woman with no name still gets the placeholder, so the greeting
// reads "Hi there," rather than "Hi ,".
DB.delete('anon@example.com'); ML_SUBS.delete('anon@example.com');
mlCalls = [];
r = await body(await call('POST', { body: { email: 'anon@example.com', data: { userName: '', portrait: 'p' } } }));
const anonTok = r.token;
ok('a nameless new subscriber still gets "there"', nameOf() === 'there', nameOf());

// And "there" may replace "there" (no harm, keeps the field populated).
ML_SUBS.set('anon@example.com', 'there');
mlCalls = [];
await call('POST', { body: { email: 'anon@example.com', data: { userName: 'You', portrait: 'p2' }, token: anonTok } });
ok('"there" may replace "there"', nameOf() === 'there', nameOf());

// She later tells us her name — that must win.
mlCalls = [];
await call('POST', { body: { email: 'anon@example.com', data: { userName: 'Jennifer', portrait: 'p3' }, token: anonTok } });
ok('a real name replaces the placeholder', nameOf() === 'Jennifer', nameOf());
delete process.env.MAILERLITE_API_KEY;

console.log('\n12. Shape checks');
res = await call('GET');
ok('no token and no email → 400', res.status === 400, 'got ' + res.status);
res = await call('PUT');
ok('unsupported method → 405', res.status === 405, 'got ' + res.status);
res = await call('POST', { body: { email: 'x@y.com' } });
ok('missing data → 400', res.status === 400, 'got ' + res.status);

// ---------------------------------------------------------------------------
console.log('\n13. style-ai.js: the forged-Host hole is closed (2026-07-29 backport)');
process.env.ANTHROPIC_API_KEY = 'fake-anthropic-key';
const { default: styleAi } = await import('../netlify/functions/style-ai.js');
function aiCall(h) {
  const req = new Request('https://www.stylestar.app/.netlify/functions/style-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...h },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] })
  });
  const clientIp = '10.9.9.' + (++ipSeq);
  const orig = req.headers.get.bind(req.headers);
  req.headers.get = (k) => {
    const lk = k.toLowerCase();
    if (lk === 'host') return h.host || '';
    if (lk === 'x-nf-client-connection-ip') return clientIp;
    return orig(k);
  };
  return styleAi(req);
}
res = await aiCall({ origin: 'https://evil.com', referer: 'https://evil.com/', host: 'evil.com' });
ok('forged Host + Origin (the free-Claude-proxy case) → 403', res.status === 403, 'got ' + res.status);
res = await aiCall({ origin: 'https://netlify.app.evil.com', referer: 'https://netlify.app.evil.com/', host: 'netlify.app.evil.com' });
ok('netlify.app lookalike domain → 403', res.status === 403, 'got ' + res.status);
res = await aiCall({ origin: 'https://deploy-preview-42--stylestar.netlify.app', referer: 'https://deploy-preview-42--stylestar.netlify.app/', host: 'deploy-preview-42--stylestar.netlify.app' });
ok('a real deploy preview still works', res.status === 200, 'got ' + res.status);
res = await aiCall(GOOD);
ok('the live site still works', res.status === 200, 'got ' + res.status);
delete process.env.ANTHROPIC_API_KEY;

console.log('\n' + (fail ? '✗ ' + fail + ' FAILED, ' : '✓ ') + pass + ' passed');
process.exit(fail ? 1 : 0);
