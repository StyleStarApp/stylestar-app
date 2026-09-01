// Prove the per-route-titles edge function against the REAL index.html.
// Same discipline as edgepreview.mjs (2026-08-24 rewrite): IMPORT and CALL the
// real handler, never copy its transform into the harness. A copy proves a
// copy does what a copy does and goes blind the moment the real file changes.
import fs from 'fs';
import handler from '/home/user/stylestar-app/netlify/edge-functions/page-titles.js';

const ROOT = '/home/user/stylestar-app';
const before = fs.readFileSync(ROOT + '/index.html', 'utf8');
const baseTitle = before.match(/<title>([^<]*)<\/title>/)[1];
const baseDesc  = before.match(/<meta name="description" content="([^"]*)"/)[1];

let pass = 0, fail = 0;
const ok = (n, c, x) => { c ? (pass++, console.log('  ✓ ' + n))
                            : (fail++, console.log('  ✗ ' + n + (x ? '  → ' + x : ''))); };
const grab = (h, re) => { const m = h.match(re); return m ? m[1] : null; };

const ctxFor = () => ({ next: async () => new Response(before, {
  status: 200, headers: { 'content-type': 'text/html; charset=utf-8',
                          'content-length': String(Buffer.byteLength(before)) } }) });

const PAGES = ['/story', '/faq', '/contact', '/privacy', '/terms'];

// ---- each real page gets its own title/description/canonical, all distinct ----
const seen = new Set();
for (const path of PAGES) {
  const res = await handler(new Request('https://stylestar.app' + path), ctxFor());
  const html = await res.text();
  const title = grab(html, /<title>([^<]*)<\/title>/);
  const desc  = grab(html, /<meta name="description" content="([^"]*)"/);
  const ogT   = grab(html, /<meta property="og:title" content="([^"]*)"/);
  const ogD   = grab(html, /<meta property="og:description" content="([^"]*)"/);
  const twT   = grab(html, /<meta name="twitter:title" content="([^"]*)"/);
  const canon = grab(html, /<link rel="canonical" href="([^"]*)">/);

  ok(path + ': title is no longer the homepage’s', title && title !== baseTitle, title);
  ok(path + ': title never seen on another route', title && !seen.has(title));
  seen.add(title);
  ok(path + ': description is no longer the homepage’s', desc && desc !== baseDesc, desc);
  ok(path + ': og:title matches the new title', ogT === title);
  ok(path + ': og:description matches the new description', ogD === desc);
  ok(path + ': twitter:title matches the new title', twT === title);
  ok(path + ': canonical self-references this path',
     canon === 'https://stylestar.app' + path, canon);
  ok(path + ': content-length header dropped (body length changed)',
     !res.headers.get('content-length'));
  ok(path + ': status code passed through unchanged', res.status === 200);
  // The og:image stays her letterhead everywhere -- untouched here, same as
  // the wishlist preview.
  ok(path + ': og:image left untouched',
     grab(html, /<meta property="og:image" content="([^"]*)"/)
     === grab(before, /<meta property="og:image" content="([^"]*)"/));
  // A crawler that never runs JS reads title/description/canonical from the
  // raw body -- confirm they really sit inside <head>, not left dangling.
  const idx = html.indexOf('<title>' + title);
  ok(path + ': the new <title> is really inside <head>',
     idx > html.indexOf('<head') && idx < html.indexOf('</head>'));
}

// ---- the homepage --------------------------------------------------------
// ⚠️ UPDATED DELIBERATELY 2026-09-01, and it CORRECTLY caught the change that
// prompted it. This asserted the whole homepage document came back byte for
// byte, which was true while `/` had no PAGES entry at all. It has one now:
// the seven screens whose full text already lives at its own real URL are
// trimmed out of `/`, which took it from 6,403 rendered words and eight <h1>
// tags to 2,293 and one.
// ▶ The claim underneath the old assertion has not been dropped, it has been
// SHARPENED into the two halves that actually matter, and the first half is
// the load-bearing one: THE HOMEPAGE'S <head> IS STILL BYTE-IDENTICAL. Its
// og:title/og:description are deliberately DIFFERENT from its Google-facing
// title/description (the link-preview card a friend sees when Cath texts the
// app), and an unconditional rewrite would have silently collapsed them.
const home = await handler(new Request('https://stylestar.app/'), ctxFor());
const homeHtml = await home.text();
const headOf = h => h.slice(0, h.indexOf('</head>'));
ok('the homepage <head> is byte-for-byte untouched', headOf(homeHtml) === headOf(before));
ok('  ...so og:title still diverges from <title>',
   grab(homeHtml, /<meta property="og:title" content="([^"]*)"/) !== baseTitle);
ok('the homepage BODY is trimmed', homeHtml.length < before.length);
for (const id of ['s-story','s-faq','s-contact','s-privacy','s-terms','s-journal-hub','s-journal'])
  ok('  ...' + id + ' is gone from the homepage',
     !new RegExp('<div class="scr[^"]*" id="' + id + '"').test(homeHtml));
ok('the screens the app needs at boot are all still there',
   ['s-wel','s-wb','s-quiz','s-res','s-shopstyle','s-wardrobe','s-wishlist','s-chat','s-dream']
     .every(id => new RegExp('<div class="scr[^"]*" id="' + id + '"').test(homeHtml)));

const results = await handler(new Request('https://stylestar.app/results'), ctxFor());
ok('/results is untouched (deliberately outside PAGES)', (await results.text()) === before);

const list = await handler(new Request('https://stylestar.app/list/abc123'), ctxFor());
ok('/list/<token> is untouched -- that’s list-preview.js’s job, not this one’s',
   (await list.text()) === before);

const asset = await handler(new Request('https://stylestar.app/faq'), {
  next: async () => new Response('body{}', {
    status: 200, headers: { 'content-type': 'text/css' } }) });
ok('a non-HTML response passes straight through', (await asset.text()) === 'body{}');

// ---- trailing slash + no lookup miss taking the page down -----------------
const trailing = await handler(new Request('https://stylestar.app/faq/'), ctxFor());
const trailingHtml = await trailing.text();
ok('a trailing slash on a real page still gets its own title',
   grab(trailingHtml, /<title>([^<]*)<\/title>/) !== baseTitle);

const missing = await handler(new Request('https://stylestar.app/nowhere'), ctxFor());
ok('an unmapped path (should never route here, but) degrades to the real page, not a crash',
   (await missing.text()) === before);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
