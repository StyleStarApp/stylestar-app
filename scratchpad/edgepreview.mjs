// Prove the shared-wishlist edge function against the REAL index.html head.
//
// ⚠️⚠️ REWRITTEN 2026-08-24, AND THE REASON IS THE WHOLE POINT OF THIS FILE.
// The previous version COPY-PASTED the edge function's five replace() calls
// into the harness and ran those instead of the real thing. So it proved that
// a copy of the transform did what a copy of the transform did — and when a
// sixth step (the noindex tag) was added to the real function, this suite
// reported "all 7 checks passed" while being structurally incapable of seeing
// it. That is the documented worst shape: A HARNESS THAT MEASURES NOTHING
// REPORTS A CLEAN PASS.
//
// ▶ It now IMPORTS the real edge function and CALLS it, with a fake context
// whose next() hands back the real index.html. Nothing is duplicated, so a
// future step added to the function is exercised here automatically.
// (An edge function cannot be *deployed* locally; it can perfectly well be
// executed, because it is a plain ES module taking a Request and a context.)
import fs from 'fs';
import handler from '/home/user/stylestar-app/netlify/edge-functions/list-preview.js';

const ROOT = '/home/user/stylestar-app';
const src  = fs.readFileSync(ROOT + '/netlify/edge-functions/list-preview.js', 'utf8');
const TITLE = src.match(/const TITLE = '([^']+)'/)[1];
const DESC  = src.match(/const DESC  = '([^']+)'/)[1];
const before = fs.readFileSync(ROOT + '/index.html', 'utf8');

let pass = 0, fail = 0;
const ok = (n, c, x) => { c ? (pass++, console.log('  ✓ ' + n))
                            : (fail++, console.log('  ✗ ' + n + (x ? '  → ' + x : ''))); };
const grab = (h, re) => { const m = h.match(re); return m ? m[1] : null; };

// ---- run the REAL handler ---------------------------------------------------
const ctx = { next: async () => new Response(before, {
  status: 200, headers: { 'content-type': 'text/html; charset=utf-8',
                          'content-length': String(Buffer.byteLength(before)) } }) };
const res  = await handler(new Request('https://stylestar.app/list/abc123'), ctx);
const html = await res.text();

// ---- the preview card, which is what she reported in the first place --------
ok('<title> becomes the wishlist title', grab(html, /<title>([^<]*)<\/title>/) === TITLE,
   grab(html, /<title>([^<]*)<\/title>/));
ok('og:title becomes the wishlist title',
   grab(html, /<meta property="og:title" content="([^"]*)"/) === TITLE);
ok('og:description changes', grab(html, /<meta property="og:description" content="([^"]*)"/) === DESC);
ok('twitter:title changes', grab(html, /<meta name="twitter:title" content="([^"]*)"/) === TITLE);
ok('og:image is deliberately UNTOUCHED — her letterhead is right here too',
   grab(html, /<meta property="og:image" content="([^"]*)"/)
   === grab(before, /<meta property="og:image" content="([^"]*)"/));

// ---- 🚨 the privacy guarantee (2026-08-24) ---------------------------------
// The token IS the credential, so a shared wishlist must never become a search
// result. noindex is the tool that actually removes a page; see the long note
// in robots.txt for why a Disallow would be WEAKER, not stronger.
const robots = grab(html, /<meta name="robots" content="([^"]*)"/);
ok('a shared wishlist says noindex', /noindex/i.test(robots || ''), robots);
ok('...and nofollow, so no crawler trail leads out of a private page',
   /nofollow/i.test(robots || ''), robots);
ok('the robots tag really is inside <head>',
   html.indexOf('name="robots"') > html.indexOf('<head') &&
   html.indexOf('name="robots"') < html.indexOf('</head>'));
ok('the ORDINARY app carries no robots tag — only /list/* is hidden',
   !/<meta name="robots"/i.test(before));

// ---- the app itself must survive the rewrite --------------------------------
ok('the app body still parses as one document',
   (html.match(/<\/html>/gi) || []).length === 1 &&
   (html.match(/<script/gi) || []).length === (before.match(/<script/gi) || []).length);
ok('nothing but the head was touched',
   html.slice(html.indexOf('</head>')) === before.slice(before.indexOf('</head>')));
ok('content-length was dropped, so the new body length is not contradicted',
   !res.headers.get('content-length'));

console.log(fail ? `\n${fail} FAILED` : `\nall ${pass} checks passed`);
process.exit(fail ? 1 : 0);
