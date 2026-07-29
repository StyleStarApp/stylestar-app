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
let mlCalls = [];

const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.startsWith('https://connect.mailerlite.com')) {
    mlCalls.push(((opts.method || 'GET').toUpperCase()) + ' ' + u.replace(ML, ''));
    if (u.includes('/groups?')) return new Response(JSON.stringify({ data: [{ id: 'g-signups', name: 'Style Star Signups' }] }), { status: 200 });
    if (u.endsWith('/groups')) return new Response(JSON.stringify({ data: { id: 'g-restore' } }), { status: 200 });
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
      return new Response('', { status: 204 });
    }
    if (method === 'DELETE') { DB.delete(email); return new Response('', { status: 204 }); }
    if (method === 'POST') {
      const b = JSON.parse(opts.body);
      DB.set(b.email, JSON.parse(b.data));
      return new Response('', { status: 204 });
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
   mlCalls.some(c => c === 'POST /subscribers'), mlCalls.join(' | '));
const joinIdx = mlCalls.findIndex(c => c === 'POST /subscribers/sub-1/groups/g-restore');
const leaveIdx = mlCalls.findIndex(c => c === 'DELETE /subscribers/sub-1/groups/g-restore');
ok('she is added to the restore group (this is what sends the email)', joinIdx !== -1, mlCalls.join(' | '));
ok('she is removed from it FIRST, so a repeat request re-triggers',
   leaveIdx !== -1 && leaveIdx < joinIdx, mlCalls.join(' | '));
ok('the signups group is never touched (no re-sent welcome email)',
   !mlCalls.some(c => c.includes('g-signups')), mlCalls.join(' | '));

// Asking twice must send twice — that's the whole point of the leave/rejoin.
mlCalls = [];
await call('GET', { query: '?email=new@example.com' });
ok('asking a second time joins the group again',
   mlCalls.filter(c => c === 'POST /subscribers/sub-1/groups/g-restore').length === 1, mlCalls.join(' | '));

// An address with no account must trigger NOTHING — otherwise a stranger could
// use this to mail a woman, and the timing would leak who has an account.
mlCalls = [];
res = await call('GET', { query: '?email=nobody@example.com' });
ok('an unknown address sends no email at all', mlCalls.length === 0, mlCalls.join(' | '));
ok('…and still returns the identical 200', res.status === 200);
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
delete process.env.ADMIN_SECRET;
delete process.env.MAILERLITE_API_KEY;
res = await call('DELETE', { query: '?email=x@y.com', headers: { ...GOOD, 'x-admin-secret': 'admin-pass' } });
ok('with no ADMIN_SECRET configured, that header does nothing', res.status === 401, 'got ' + res.status);

console.log('\n11. Shape checks');
res = await call('GET');
ok('no token and no email → 400', res.status === 400, 'got ' + res.status);
res = await call('PUT');
ok('unsupported method → 405', res.status === 405, 'got ' + res.status);
res = await call('POST', { body: { email: 'x@y.com' } });
ok('missing data → 400', res.status === 400, 'got ' + res.status);

console.log('\n' + (fail ? '✗ ' + fail + ' FAILED, ' : '✓ ') + pass + ' passed');
process.exit(fail ? 1 : 0);
