// Verification for the shared-wishlist plumbing (2026-08-22).
// Runs the REAL user-data.js handler with Supabase and MailerLite stubbed, so
// every check exercises the actual auth and allowlist logic, not a copy.
//
//   node scratchpad/sharelink.js
//
process.env.SUPABASE_URL = 'https://fake.supabase.co';
process.env.SUPABASE_KEY = 'fake-key';
process.env.RESTORE_SECRET = 'test-secret-for-verification';
delete process.env.MAILERLITE_API_KEY;

const DB = new Map();
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.startsWith('https://connect.mailerlite.com')) return new Response(JSON.stringify({ data: { id: 's' } }), { status: 200 });
  if (u.startsWith('https://fake.supabase.co')) {
    const m = u.match(/email=eq\.([^&]+)/);
    const email = m ? decodeURIComponent(m[1]) : null;
    const method = (opts.method || 'GET').toUpperCase();
    if (method === 'GET') return new Response(JSON.stringify(email && DB.has(email) ? [{ email, data: JSON.stringify(DB.get(email)) }] : []), { status: 200 });
    if (method === 'PATCH') { DB.set(email, JSON.parse(JSON.parse(opts.body).data)); return new Response(null, { status: 204 }); }
    if (method === 'POST') { const b = JSON.parse(opts.body); DB.set(b.email, JSON.parse(b.data)); return new Response(null, { status: 204 }); }
    if (method === 'DELETE') { DB.delete(email); return new Response(null, { status: 204 }); }
  }
  return realFetch(url, opts);
};

const { default: handler } = await import('../netlify/functions/user-data.js');
const GOOD = { origin: 'https://www.stylestar.app', referer: 'https://www.stylestar.app/', host: 'www.stylestar.app' };
let ipSeq = 0;
function call(method, { query = '', body = null, headers = GOOD } = {}) {
  const req = new Request('https://www.stylestar.app/.netlify/functions/user-data' + query, {
    method, headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined
  });
  const ip = '10.0.0.' + (++ipSeq);
  const orig = req.headers.get.bind(req.headers);
  req.headers.get = k => { const l = k.toLowerCase();
    if (l === 'host') return headers.host || '';
    if (l === 'x-nf-client-connection-ip') return ip;
    return orig(k); };
  return handler(req);
}
const body = async r => { try { return JSON.parse(await r.text()); } catch (e) { return null; } };
let pass = 0, fail = 0;
const ok = (n, c, x) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (x ? '  → ' + x : '')); } };

// A profile with everything private in it, so the allowlist has real things to
// fail to leak: sizes, colours, a never-wear list, a portrait, quiz answers.
const WISH = [
  { id: 'a~b', name: 'FARM Rio Maxi Dress', store: 'FARM Rio', search: 'maxi dress',
    url: 'https://www.farmrio.com/p/1', price: '$360', exact: true, note: 'Size 8, for the June wedding.' },
  { id: 'c~d', name: 'White Linen Blouse', store: 'J.Crew', search: 'white linen blouse' },
  { id: 'e~f', name: 'Poisoned row', store: 'Nowhere', search: 'x', url: 'javascript:alert(1)' },
  { id: 'g~h', name: 'Long note piece', store: 'J.Crew', search: 'y', note: 'N'.repeat(400) }
];
const PROFILE = {
  userName: 'Catherine', portrait: 'SECRETPORTRAIT', answers: [1,2,3],
  motto: 'SECRETMOTTO',
  prefs: { sizes: 'SECRETSIZE', colorsLove: ['SECRETCOLOR'], neverWear: 'SECRETNEVER' },
  wardrobe: { items: {}, wishlist: WISH, listNote: 'I am a size 8 in dresses.\nNothing red please! SECRETFREE' }
};

console.log('\n1. Sharing is off until she turns it on');
let r = await call('POST', { body: { email: 'cath@example.com', data: PROFILE } });
const TOKEN = (await body(r)).token;
ok('a first save succeeds and returns a save token', !!TOKEN);
ok('the saved row carries no _share at all', !DB.get('cath@example.com')._share);

console.log('\n2. Turning it on needs proof of ownership');
r = await call('POST', { body: { email: 'cath@example.com', share: 'on' } });
ok('no token at all is refused (403)', r.status === 403);
r = await call('POST', { body: { email: 'other@example.com', data: { userName: 'Other', portrait: 'p' } } });
const OTHER = (await body(r)).token;
r = await call('POST', { body: { email: 'cath@example.com', share: 'on', token: OTHER } });
ok("another woman's token is refused (403)", r.status === 403);
r = await call('POST', { body: { email: 'cath@example.com', share: 'on', token: TOKEN } });
let out = await body(r);
const SHARE1 = out && out.shareToken;
ok('her own token turns sharing on', r.status === 200 && out.sharing === true && !!SHARE1);

console.log('\n2b. HER REAL BUG (2026-08-22): the token alone must be enough');
// 🚨 The first person ever to tap "Get my link" got an error, because she had
// restored her results on that phone: ss_token was set, ss_email was not, and
// the share call demanded an email the client had no way to know. Asking for an
// identity the credential already proves is a bug class invented for nothing.
r = await call('POST', { body: { email: '', share: 'on', token: TOKEN } });
out = await body(r);
ok('an EMPTY email still works — the token carries it', r.status === 200 && !!out.shareToken);
r = await call('POST', { body: { share: 'on', token: TOKEN } });
out = await body(r);
ok('...and so does no email field at all', r.status === 200 && !!out.shareToken);
// ⚠️ NOT byte-identical, and that is correct rather than a fault: makeShareToken
// encrypts with a fresh random IV every call, so the same {email, revision}
// produces a different-LOOKING token each time. What idempotence means here is
// that they all resolve to the same list and all stay alive together — asking
// twice must never invalidate the link already in somebody's hands.
let r2 = await call('GET', { query: '?share=' + encodeURIComponent(out.shareToken) });
let r3 = await call('GET', { query: '?share=' + encodeURIComponent(SHARE1) });
ok('a re-minted link works AND the earlier one still does',
   r2.status === 200 && r3.status === 200);
ok('...and both show the same list',
   JSON.stringify((await body(r2)).list) === JSON.stringify((await body(r3)).list));
r = await call('POST', { body: { email: 'someone@else.com', share: 'on', token: TOKEN } });
ok('but an email that CONTRADICTS the token is still refused', r.status === 403);
r = await call('POST', { body: { email: 'cath@example.com', share: 'on' } });
ok('and no token is still refused', r.status === 403);
// The restore paths must hand the address back, or the device can never learn it.
r = await call('GET', { query: '?token=' + encodeURIComponent(TOKEN) });
ok('restoring by token returns the address it belongs to',
   (await body(r)).email === 'cath@example.com');

console.log('\n2c. THE SILENT ONE: a save with a token but no email must WORK');
// 🚨 The worse half of the same bug, and the reason her shared page came up
// empty while her phone showed a full list: syncPrefsToServer() returned early
// when ss_email was missing, so on a device where she had RESTORED, nothing
// ever reached Supabase. No error, no sign — a phone quietly saving nothing.
r = await call('POST', { body: { token: TOKEN, data: { ...PROFILE,
  wardrobe: { items: {}, wishlist: WISH, listNote: 'saved with no email at all' } } } });
ok('a save with NO email field succeeds', r.status === 200);
ok('...and it landed on the right account',
   (DB.get('cath@example.com').wardrobe.listNote || '') === 'saved with no email at all');
ok('...and the response hands the address back to the device',
   (await body(r)).email === 'cath@example.com');
r = await call('POST', { body: { email: '', token: TOKEN, data: { ...PROFILE,
  wardrobe: { items: {}, wishlist: WISH, listNote: 'empty email too' } } } });
ok('an EMPTY email works the same way', r.status === 200 &&
   DB.get('cath@example.com').wardrobe.listNote === 'empty email too');
r = await call('POST', { body: { data: PROFILE } });
ok('but no email AND no token is still refused', r.status === 400);
r = await call('POST', { body: { token: 'not-a-real-token', data: PROFILE } });
ok('...and so is a junk token with no email', r.status === 400);
// ▶ The whole point: what she saves is what her shared page shows.
r = await call('GET', { query: '?share=' + encodeURIComponent(SHARE1) });
out = await body(r);
ok('the shared page shows the list that token-only save wrote',
   Array.isArray(out.list) && out.list.length === 4, JSON.stringify(out.list && out.list.length));
// ⚠️ Put the profile back: this section deliberately overwrites listNote, and
// section 3b below asserts the original. A test that leaves the fixture dirty
// fails its neighbour and looks like a code bug (it did, on the first run).
await call('POST', { body: { email: 'cath@example.com', token: TOKEN, data: PROFILE } });

console.log('\n3. The shared page gets the list, and only the list');
r = await call('GET', { query: '?share=' + encodeURIComponent(SHARE1) });
out = await body(r);
const raw = JSON.stringify(out);
ok('the link resolves (200)', r.status === 200 && out.success === true);
ok('her first name comes through', out.name === 'Catherine');
ok('every wishlist row is there', Array.isArray(out.list) && out.list.length === 4);
ok('an exact row keeps its url and price',
   out.list[0].exact === true && out.list[0].url === 'https://www.farmrio.com/p/1' && out.list[0].price === '$360');
ok('a search row carries store + search and no url',
   out.list[1].exact === false && out.list[1].store === 'J.Crew' && !out.list[1].url);
ok('her own note comes through', out.list[0].note === 'Size 8, for the June wedding.');
ok('a note is capped at 140 characters', out.list[3].note.length === 140);
ok('a javascript: url never becomes a link',
   !raw.includes('javascript:') && out.list[2].exact === false && !out.list[2].url);
// The sweep: nothing private may appear anywhere in the response body.
const LEAKS = ['SECRETPORTRAIT', 'SECRETMOTTO', 'SECRETSIZE', 'SECRETCOLOR', 'SECRETNEVER',
               'cath@example.com', '_restore', '_share', 'answers', 'prefs', 'portrait'];
const found = LEAKS.filter(w => raw.includes(w));
ok('NOTHING private is anywhere in the response', found.length === 0, 'leaked: ' + found.join(', '));
ok('the row ids are not published either', !raw.includes('a~b'));

console.log('\n3b. Her open note travels with the list');
ok('the paragraph comes through', /size 8 in dresses/.test(out.listNote || ''), out.listNote);
ok('...keeping her line break', (out.listNote || '').includes('\n'));
r = await call('POST', { body: { email: 'cath@example.com', token: TOKEN,
  data: { ...PROFILE, wardrobe: { ...PROFILE.wardrobe, listNote: 'z'.repeat(2000) } } } });
r = await call('GET', { query: '?share=' + encodeURIComponent(SHARE1) });
ok('a 2000-character note is cut to 600', ((await body(r)).listNote || '').length === 600);
r = await call('POST', { body: { email: 'cath@example.com', token: TOKEN,
  data: { ...PROFILE, wardrobe: { items: {}, wishlist: WISH } } } });
r = await call('GET', { query: '?share=' + encodeURIComponent(SHARE1) });
ok('no note means an empty string, never undefined in the body',
   (await body(r)).listNote === '');

console.log('\n4. A share token is not a restore token, and vice versa');
r = await call('GET', { query: '?token=' + encodeURIComponent(SHARE1) });
ok('a share token cannot restore an account (401)', r.status === 401);
r = await call('POST', { body: { email: 'cath@example.com', data: { ...PROFILE, portrait: 'HIJACKED' }, token: SHARE1 } });
ok('a share token cannot authorise a save (403)', r.status === 403);
ok('...and the profile is untouched', DB.get('cath@example.com').portrait === 'SECRETPORTRAIT');
r = await call('GET', { query: '?share=' + encodeURIComponent(TOKEN) });
ok('a restore token is not accepted as a share link (404)', r.status === 404);

console.log('\n5. Bad links all fail the same way');
for (const [what, tok] of [['tampered', SHARE1.slice(0, -4) + 'AAAA'], ['truncated', SHARE1.slice(0, 20)],
                           ['nonsense', 'not-a-token'], ['empty-ish', '%20']]) {
  r = await call('GET', { query: '?share=' + tok });
  ok(`a ${what} link is 404`, r.status === 404);
}

console.log('\n6. She can take a link back');
r = await call('POST', { body: { email: 'cath@example.com', share: 'off', token: TOKEN } });
out = await body(r);
ok('turning it off succeeds and returns no token', r.status === 200 && out.sharing === false && out.shareToken === null);
r = await call('GET', { query: '?share=' + encodeURIComponent(SHARE1) });
ok('the link she already gave out is dead (404)', r.status === 404);
r = await call('POST', { body: { email: 'cath@example.com', share: 'on', token: TOKEN } });
const SHARE2 = (await body(r)).shareToken;
ok('sharing again mints a DIFFERENT link', !!SHARE2 && SHARE2 !== SHARE1);
r = await call('GET', { query: '?share=' + encodeURIComponent(SHARE2) });
ok('the new link works', r.status === 200);
r = await call('GET', { query: '?share=' + encodeURIComponent(SHARE1) });
ok('the revoked link STAYS dead — revocation is permanent', r.status === 404);

console.log('\n7. _share is server-owned');
r = await call('GET', { query: '?token=' + encodeURIComponent(TOKEN) });
out = await body(r);
ok('a normal restore never returns _share', !JSON.stringify(out).includes('_share'));
r = await call('POST', { body: { email: 'cath@example.com', token: TOKEN,
  data: { ...PROFILE, _share: { r: 999, on: true } } } });
ok('a client save cannot plant its own _share',
   DB.get('cath@example.com')._share.r !== 999);
ok('...and a save from another device carries the real one forward',
   DB.get('cath@example.com')._share.on === true);
r = await call('GET', { query: '?share=' + encodeURIComponent(SHARE2) });
ok('so the link she gave out still works after that save', r.status === 200);

console.log('\n8. The no-name page, an empty list, and a stranger');
// ⚠️ ONE save only. A second save over a record that already has a portrait is
// correctly refused without a token — saving twice here made the harness, not
// the code, look broken.
r = await call('POST', { body: { email: 'noname@example.com', data: { userName: 'You', portrait: 'p', wardrobe: { wishlist: [] } } } });
const NN = (await body(r)).token;
r = await call('POST', { body: { email: 'noname@example.com', share: 'on', token: NN } });
const NNS = (await body(r)).shareToken;
r = await call('GET', { query: '?share=' + encodeURIComponent(NNS) });
out = await body(r);
ok('the quiz placeholder "You" is not treated as a name', r.status === 200 && out.name === '');
ok('an empty list is a 200 with no rows, not an error', Array.isArray(out.list) && out.list.length === 0);
r = await call('POST', { body: { email: 'ghost@example.com', share: 'on', token: TOKEN } });
ok('you cannot turn on sharing for an address you do not own', r.status === 403);

console.log('\n9. The origin gate still applies to the shared page');
r = await call('GET', { query: '?share=' + encodeURIComponent(SHARE2),
  headers: { origin: 'https://evil.example', referer: 'https://evil.example/', host: 'evil.example' } });
ok("another site's JavaScript cannot read a shared list (403)", r.status === 403);

console.log('\n' + (fail ? `${fail} FAILED, ${pass} passed` : `all ${pass} checks passed`));
process.exit(fail ? 1 : 0);
