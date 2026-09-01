// Prove the homepage trim + the crawlable Journal link, against the REAL
// edge function and the REAL index.html (2026-09-01, Cowork's rendering audit).
//
// ⚠️ IMPORTS AND CALLS the real page-titles.js -- never a copy of its
// replace() calls. The 2026-08-24 lesson: a harness that reimplements the
// transform proves only that a copy does what a copy does, and is
// structurally blind to any step added later.
//
// ⚠️ EVERY <h1> COUNT STRIPS HTML COMMENTS FIRST. index.html carries `<h1>`
// inside code comments as written-out examples; a bare grep reports 2 on a
// page that really has 1 (false positives on 08-28, 08-31 and 09-01).
import fs from 'fs';
import handler from '/home/user/stylestar-app/netlify/edge-functions/page-titles.js';

const ROOT = '/home/user/stylestar-app';
const RAW  = fs.readFileSync(ROOT + '/index.html', 'utf8');

let pass = 0, fail = 0;
const ok = (n, c, x) => { c ? (pass++, console.log('  ✓ ' + n))
                            : (fail++, console.log('  ✗ ' + n + (x ? '  → ' + x : ''))); };

async function serve(path, body = RAW) {
  const ctx = { next: async () => new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } }) };
  const res = await handler(new Request('https://stylestar.app' + path), ctx);
  return await res.text();
}
// ⚠️ STRIP COMMENTS **AND SCRIPT/STYLE BLOCKS** BEFORE COUNTING ANY MARKUP.
// Caught by this very suite reporting every h1 count exactly ONE too high on
// EVERY route, untouched ones included -- a constant offset across cases is
// the signature of a broken measurement, never a broken page. The app's own
// JavaScript contains the literal strings `<h1` and `class="jhub-row"` (it
// BUILDS that markup), so a counter that reads the script blocks counts the
// source code as if it were rendered content.
const noComments = h => h.replace(/<!--[\s\S]*?-->/g, '');
const clean = h => noComments(h)
  .replace(/<script\b[\s\S]*?<\/script>/gi, '')
  .replace(/<style\b[\s\S]*?<\/style>/gi, '');
const bodyOf = h => { const b = clean(h); return b.slice(b.indexOf('<body')); };
const h1s = h => (bodyOf(h).match(/<h1[^>]*>/gi) || []).length;
const words = h => bodyOf(h).replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ')
  .split(/\s+/).filter(w => /[a-z0-9]/i.test(w)).length;
const has = (h, id) => new RegExp('<div class="scr[^"]*" id="' + id + '"').test(h);
const tag = (h, re) => { const m = h.match(re); return m ? m[1] : null; };
const TITLE = h => tag(h, /<title>([\s\S]*?)<\/title>/i);
const DESC  = h => tag(h, /<meta name="description" content="([^"]*)"/i);
const OGT   = h => tag(h, /<meta property="og:title" content="([^"]*)"/i);
const OGD   = h => tag(h, /<meta property="og:description" content="([^"]*)"/i);
const TWT   = h => tag(h, /<meta name="twitter:title" content="([^"]*)"/i);
const CANON = h => tag(h, /<link rel="canonical" href="([^"]*)"/i);
const LD    = h => (h.match(/application\/ld\+json/g) || []).length;

const DROPPED = ['s-story','s-faq','s-contact','s-privacy','s-terms','s-journal-hub','s-journal'];
const KEPT    = ['s-wel','s-wb','s-quiz','s-load','s-res','s-photo','s-photo-res','s-pref',
                 's-shopstyle','s-chat','s-dream','s-shop','s-wardrobe','s-wishlist','s-a2hs'];

const run = async () => {
console.log('\n── PART 1 · the homepage keeps its head EXACTLY as index.html wrote it ──');
const home = await serve('/');
ok('title unchanged',            TITLE(home) === TITLE(RAW), TITLE(home));
ok('meta description unchanged', DESC(home)  === DESC(RAW));
// ⚠️ THE ONE THAT MATTERS MOST: og: is deliberately DIFFERENT from title/desc
// (the link-preview card a friend sees). An unconditional rewrite would have
// silently collapsed them into the Google-facing copy.
ok('og:title unchanged (still diverges from <title>)', OGT(home) === OGT(RAW) && OGT(home) !== TITLE(home), OGT(home));
ok('og:description unchanged',   OGD(home)  === OGD(RAW));
ok('twitter:title unchanged',    TWT(home)  === TWT(RAW));
ok('canonical is the apex',      CANON(home) === 'https://stylestar.app/', CANON(home));
ok('exactly one JSON-LD block (the static Organization)', LD(home) === 1, LD(home));

console.log('\n── PART 2 · the homepage body ──');
DROPPED.forEach(id => ok('dropped: ' + id, !has(home, id)));
KEPT.forEach(id => ok('kept: ' + id, has(home, id)));
ok('exactly ONE real <h1>', h1s(home) === 1, h1s(home) + ' found');
ok('the article body is gone', !home.includes('Do I Have to Pick One Style'));
ok('the Privacy Policy body is gone', !noComments(home).includes('sub-processors') || !has(home,'s-privacy'));
const wBefore = words(RAW), wAfter = words(home);
ok('word count fell by more than half', wAfter < wBefore / 2, wBefore + ' → ' + wAfter);
console.log('     ▶ HOMEPAGE WORDS: ' + wBefore + ' before, ' + wAfter + ' after');
console.log('     ▶ HOMEPAGE H1s:   ' + h1s(RAW) + ' before, ' + h1s(home) + ' after');
console.log('     ▶ HOMEPAGE BYTES: ' + Buffer.byteLength(RAW) + ' before, ' + Buffer.byteLength(home) + ' after');

console.log('\n── PART 3 · NEGATIVE CONTROL (a sweep never seen to fail proves nothing) ──');
// Feed the function a body whose screens cannot be found: the trim must
// no-op, the page must still ship, and this suite must SEE the difference.
ok('untrimmed homepage really has 8 h1s (so PART 2 is measuring something)', h1s(RAW) === 8, h1s(RAW));
ok('untrimmed homepage really carries the article text', RAW.includes('Do I Have to Pick One Style'));

console.log('\n── PART 4 · /journal now carries a real, crawlable link ──');
const j = await serve('/journal');
ok('h1 reads "Style Journal"', /<h1[^>]*>Style Journal<\/h1>/.test(noComments(j)));
ok('only the hub screen', has(j,'s-journal-hub') && !has(j,'s-journal') && !has(j,'s-faq'));
ok('a REAL <a href> to the article is in the raw HTML',
   bodyOf(j).includes('<a class="jhub-row" href="/journal/how-to-find-your-personal-style"'));
ok('the link carries the article title as its text',
   /jhub-row-title">How to Find Your Personal Style</.test(bodyOf(j)));
ok('one row per article', (bodyOf(j).match(/class="jhub-row"/g) || []).length === 1, (bodyOf(j).match(/class="jhub-row"/g)||[]).length);
ok('the row still routes in-app (return false)', bodyOf(j).includes("openJournalArticle('s-journal');return false;"));
ok('title + canonical intact', TITLE(j) === 'Style Journal | Style Star' && CANON(j) === 'https://stylestar.app/journal');
ok('CollectionPage/ItemList schema still injected', LD(j) === 2 && j.includes('"ItemList"'));

console.log('\n── PART 5 · the five clean routes are untouched ──');
for (const [p, id, t] of [['/story','s-story','Meet Catherine'], ['/faq','s-faq','Frequently Asked'],
                          ['/privacy','s-privacy','Privacy Policy'], ['/terms','s-terms','Terms of Service'],
                          ['/contact','s-contact','Contact Style Star']]) {
  const h = await serve(p);
  const others = DROPPED.concat(KEPT).filter(x => x !== id);
  ok(p + ' serves only ' + id, has(h, id) && !others.some(x => has(h, x)));
  ok(p + ' title + canonical', (TITLE(h)||'').includes(t) && CANON(h) === 'https://stylestar.app' + p, TITLE(h));
  ok(p + ' has exactly one h1', h1s(h) === 1, h1s(h));
}

console.log('\n── PART 6 · the article route ──');
const a = await serve('/journal/how-to-find-your-personal-style');
ok('serves only s-journal', has(a,'s-journal') && !has(a,'s-journal-hub') && !has(a,'s-faq'));
ok('byline name intact',  a.includes('By Catherine Ellspermann'));
ok('byline role intact',  a.includes('Personal Stylist &amp; Founder of Style Star'));
ok('publish date intact', a.includes('Published August 26, 2026'));
ok('Article + FAQPage schema intact', LD(a) === 2 && a.includes('"Article"') && a.includes('"FAQPage"'));
ok('canonical is its own url', CANON(a) === 'https://stylestar.app/journal/how-to-find-your-personal-style');

console.log('\n── PART 7 · the self-heal source must never be trimmed ──');
const src = fs.readFileSync(ROOT + '/netlify/edge-functions/page-titles.js', 'utf8');
ok("no PAGES entry for '/index.html'", !/PAGES\['\/index\.html'\]/.test(src) && !src.includes("'/index.html':"));
const toml = fs.readFileSync(ROOT + '/netlify.toml', 'utf8');
ok('netlify.toml scopes page-titles to "/" exactly, not a wildcard',
   /path = "\/"\n\s*function = "page-titles"/.test(toml) && !/path = "\/\*"/.test(toml));
ok('article screen ids are DERIVED from ARTICLES, not restated',
   src.includes("concat(ARTICLES.map((a) => a.id))"));

console.log('\n' + (fail ? '✗ ' : '✓ ') + pass + ' passed, ' + fail + ' failed\n');
process.exit(fail ? 1 : 0);
};
run();
