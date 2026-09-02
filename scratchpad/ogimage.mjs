// Verify the two Journal articles' share cards, by IMPORTING and CALLING the
// real page-titles.js handler against the real index.html -- never a copy of
// its transforms (the documented edgepreview.mjs lesson).
import fs from 'fs';
import handler from '/home/user/stylestar-app/netlify/edge-functions/page-titles.js';

const ROOT = '/home/user/stylestar-app';
const RAW = fs.readFileSync(ROOT + '/index.html', 'utf8');

let pass = 0, fail = 0;
const ok = (n, c, x) => { c ? (pass++, console.log('  ✓ ' + n))
                            : (fail++, console.log('  ✗ ' + n + (x ? '  → ' + x : ''))); };
const grab = (h, re) => { const m = h.match(re); return m ? m[1] : null; };

async function serve(path) {
  const ctx = { next: async () => new Response(RAW, { headers: { 'content-type': 'text/html' } }) };
  const res = await handler(new Request('https://stylestar.app' + path), ctx);
  return await res.text();
}

const home = await serve('/');
const a1 = await serve('/journal/how-to-find-your-personal-style');
const a2 = await serve('/journal/how-to-dress-for-fall-in-florida');

// -- Homepage: untouched image, but now carries the new default alt --
ok('home og:image is still the logo card',
  grab(home, /property="og:image" content="([^"]*)"/) === 'https://www.stylestar.app/og-image.png?v=2');
ok('home og:image:alt is the new site-wide default',
  /property="og:image:alt" content="The Style Star logo/.test(home));
ok('home twitter:image:alt is the new site-wide default',
  /name="twitter:image:alt" content="The Style Star logo/.test(home));
ok('home og:url is unchanged (still www, deliberate)',
  grab(home, /property="og:url" content="([^"]*)"/) === 'https://www.stylestar.app');

// -- Article 1: its own card --
ok('article1 og:image points at its own file',
  grab(a1, /property="og:image" content="([^"]*)"/) === 'https://stylestar.app/og-journal-personal-style.png');
ok('article1 og:image:alt is her spectrum alt',
  grab(a1, /property="og:image:alt" content="([^"]*)"/) === 'Three of the Style Star quiz spectrums: Classic to Trendy, Natural to Glam, and Understated to Statement, each with a marker placed along the line.');
ok('article1 twitter:image matches og:image',
  grab(a1, /name="twitter:image" content="([^"]*)"/) === 'https://stylestar.app/og-journal-personal-style.png');
ok('article1 twitter:image:alt matches og:image:alt',
  grab(a1, /name="twitter:image:alt" content="([^"]*)"/) === 'Three of the Style Star quiz spectrums: Classic to Trendy, Natural to Glam, and Understated to Statement, each with a marker placed along the line.');
ok('article1 og:url is its own path, not the homepage',
  grab(a1, /property="og:url" content="([^"]*)"/) === 'https://stylestar.app/journal/how-to-find-your-personal-style');
ok('article1 og:title is its own metaTitle',
  grab(a1, /property="og:title" content="([^"]*)"/) === 'How to Find Your Personal Style | Style Star');
ok('article1 og:description is its own metaDesc',
  /Start with the outfit you already love/.test(grab(a1, /property="og:description" content="([^"]*)"/) || ''));
ok('article1 twitter:card is summary_large_image (unchanged site default)',
  grab(a1, /name="twitter:card" content="([^"]*)"/) === 'summary_large_image');
ok('article1 canonical is its own path',
  grab(a1, /rel="canonical" href="([^"]*)"/) === 'https://stylestar.app/journal/how-to-find-your-personal-style');
ok('article1 raw <title> is its own metaTitle',
  grab(a1, /<title>([^<]*)<\/title>/) === 'How to Find Your Personal Style | Style Star');

// -- Article 2: its own card --
ok('article2 og:image points at its own file',
  grab(a2, /property="og:image" content="([^"]*)"/) === 'https://stylestar.app/og-journal-fall-florida.png');
ok('article2 og:image:alt is her palette alt',
  grab(a2, /property="og:image:alt" content="([^"]*)"/) === 'Eight fall colors that work in hot weather: chocolate brown, burgundy, rust, camel, olive, deep green, navy and off white.');
ok('article2 twitter:image matches og:image',
  grab(a2, /name="twitter:image" content="([^"]*)"/) === 'https://stylestar.app/og-journal-fall-florida.png');
ok('article2 og:url is its own path',
  grab(a2, /property="og:url" content="([^"]*)"/) === 'https://stylestar.app/journal/how-to-dress-for-fall-in-florida');
ok('article2 og:title is its own metaTitle',
  /When It's Hot/.test(grab(a2, /property="og:title" content="([^"]*)"/) || ''));

// -- Both articles: exactly one image tag of each kind, no leftover dupes --
for (const [name, html] of [['article1', a1], ['article2', a2]]) {
  ok(name + ' has exactly one og:image tag', (html.match(/property="og:image"/g) || []).length === 1);
  ok(name + ' has exactly one og:image:alt tag', (html.match(/property="og:image:alt"/g) || []).length === 1);
  ok(name + ' has exactly one twitter:image tag', (html.match(/name="twitter:image"/g) || []).length === 1);
  ok(name + ' has exactly one og:image:width tag, value 1200', grab(html, /property="og:image:width" content="([^"]*)"/) === '1200');
  ok(name + ' og:image:height is 630', grab(html, /property="og:image:height" content="([^"]*)"/) === '630');
}

// -- The image files themselves: real, right size, right dimensions --
for (const f of ['og-journal-personal-style.png', 'og-journal-fall-florida.png']) {
  const buf = fs.readFileSync(ROOT + '/' + f);
  // PNG IHDR: width at bytes 16-19, height at 20-23, big-endian.
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  ok(f + ' is exactly 1200x630', w === 1200 && h === 630, `${w}x${h}`);
  ok(f + ' is a real, non-trivial PNG (>10KB)', buf.length > 10000, buf.length + ' bytes');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
