// The CSS extraction, pinned (2026-09-01).
//
// The three inline <style> blocks that used to fill index.html's <head> now
// live in /styles.css. This suite exists so the two things that would break it
// silently can never come back:
//
//   1. THE HREF MUST STAY ABSOLUTE. The app is one page served at /faq,
//      /story and /journal/<slug>; a relative href resolves to
//      /journal/styles.css on an article route and 404s, leaving that page
//      completely unstyled. A human would notice, but only after it shipped.
//   2. THE THREE SECTIONS MUST KEEP THEIR ORDER. The cascade is
//      order-dependent -- proved, not assumed: rebuilding styles.css as
//      1,3,2 changed the Style Portrait's rendered height by 16px.
//
// It also asserts the stylesheet really APPLIES rather than merely being
// linked, because a stylesheet that 404s or is refused still leaves a perfectly
// valid-looking <link> in the markup.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
import http from 'http';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const ROOT = path.resolve('.');
const PORT = 8951;
const ORIGIN = 'http://localhost:' + PORT;

let pass = 0, fail = 0;
const ok = (n, c, e) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (e ? '  → ' + e : '')); } };

// ── Part 1: the files themselves ────────────────────────────────────────────
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');

// ⚠️ Strip HTML comments first: the markup carries a comment ABOUT the former
// <style> blocks, and matching the bare string finds that instead of a real
// tag. (Same trap this project has hit twice before, counting an <h1> written
// out inside a comment as a second heading.)
const noComments = html.replace(/<!--[\s\S]*?-->/g, '');
ok('no <style> element left in index.html', !/<style[^>]*>/.test(noComments));
const links = [...noComments.matchAll(/<link[^>]+rel="stylesheet"[^>]*>|<link[^>]+href="\/styles\.css"[^>]*>/g)].map(m => m[0]);
const local = links.filter(l => !/https?:/.test(l));
// Two stylesheet links total, and exactly one of them is ours -- the other is
// the Google Fonts one that has always been there.
ok('exactly one LOCAL stylesheet link', local.length === 1, 'found ' + local.length + ' of ' + links.length);
ok('the other stylesheet link is still Google Fonts',
   links.some(l => l.includes('fonts.googleapis.com')), links.join(' | '));
ok('the href is ABSOLUTE (/styles.css), not relative',
   /href="\/styles\.css"/.test(html), local[0]);
ok('the link sits in the <head>', html.indexOf('/styles.css') < html.indexOf('<body'));
ok('it still comes after the Google Fonts link (order unchanged)',
   html.indexOf('fonts.googleapis.com') < html.indexOf('/styles.css'));

// Byte-for-byte: styles.css must be the three original blocks, in order.
// Walk back until we find the last commit that still had the inline blocks,
// so this suite works whether or not the extraction has been committed yet.
// ⚠️ DERIVED FROM HISTORY, NEVER A FIXED LOOKBACK (fixed 2026-09-01). This
// used to walk HEAD..HEAD~3 hunting for the last commit that still had the
// inline blocks -- so it went red the moment three more commits landed on top
// of the extraction, which is exactly what happened, and it had nothing to do
// with the CSS. A fixed window is a restated number wearing a different hat.
// ▶ Ask git which commit ADDED styles.css and read its parent: that is the
// pre-extraction tree by definition, however deep the history gets.
let orig = '', blocks = [];
const added = execFileSync('git', ['log', '--format=%H', '--diff-filter=A', '--', 'styles.css'],
  { encoding: 'utf8' }).trim().split('\n').filter(Boolean).pop();
for (const ref of [added ? added + '~1:index.html' : null, 'HEAD:index.html'].filter(Boolean)) {
  try { orig = execFileSync('git', ['show', ref], { encoding: 'utf8', maxBuffer: 1 << 28 }); } catch { continue; }
  blocks = [];
  for (const m of orig.matchAll(/<style[^>]*>/g)) blocks.push(orig.slice(m.index + m[0].length, orig.indexOf('</style>', m.index)));
  if (blocks.length === 3) break;
}
ok('found the pre-extraction commit, with its 3 <style> blocks', blocks.length === 3, 'found ' + blocks.length);
// ⚠️ SPLIT IN TWO on 2026-09-01, and the reason generalises. This was one
// assertion -- "the working tree's styles.css equals the three original
// blocks joined, byte for byte" -- which was a ONE-TIME PROOF wearing the
// costume of a standing check: it could only ever hold until the first
// deliberate CSS edit, and it went red on exactly that (a two-property
// addition to .jhub-row). A test that must fail the first time the file it
// watches is legitimately edited is not protecting anything.
// ▶ The two halves it was really making, kept apart:
//   1. THE EXTRACTION WAS FAITHFUL. A fact about history, compared against
//      styles.css AS COMMITTED by the extraction itself, so it is true
//      forever and no future edit can make it lie.
//   2. THE THREE SECTIONS ARE STILL IN ORDER. The living property, and the
//      one that actually matters: the cascade is order-dependent, so a
//      reordering silently changes how things look (proved on 09-01 -- a
//      1,3,2 rebuild moved the Style Portrait's height by 16px).
const asExtracted = execFileSync('git', ['show', added + ':styles.css'],
  { encoding: 'utf8', maxBuffer: 1 << 28 });
const extractedBody = asExtracted.slice(asExtracted.indexOf('*/') + 3);
ok('the extraction itself was byte-for-byte faithful (a fact about history)',
   extractedBody === blocks.join('\n'));
const body = css.slice(css.indexOf('*/') + 3);
const marks = blocks.map(b => b.replace(/^\s+/, '').slice(0, 200));
const at = marks.map(m => body.indexOf(m));
ok('all three sections are still present in styles.css', at.every(i => i !== -1), at.join(','));
ok('and still IN THE ORIGINAL ORDER (the cascade depends on it)',
   at[0] < at[1] && at[1] < at[2], at.join(' < '));
ok('nothing was minified or reformatted', body.includes('\n  ') || body.includes('\n\n'));
ok('braces balance', (body.match(/{/g) || []).length === (body.match(/}/g) || []).length);
ok('no @import (would defeat the single-request win)', !css.includes('@import'));
ok('no relative url() that would break from a new base',
   ![...css.matchAll(/url\((["']?)(?!data:|#|%23)([^)"']+)/g)].some(m => !/^https?:/.test(m[2])));

// ── Part 2: it actually applies, in a browser ───────────────────────────────
// ⚠️ Deliberately serves real files with NO Content-Type, which is what
// several of this project's own harnesses do. If Chromium ever refuses a
// stylesheet served that way, every layout and contrast assertion in every
// other suite would silently be measuring an unstyled page.
const srv = http.createServer((q, r) => {
  const p = decodeURIComponent(q.url.split('?')[0]);
  const f = path.join(ROOT, p === '/' ? 'index.html' : p.replace(/^\//, ''));
  if (f.startsWith(ROOT) && fs.existsSync(f) && fs.statSync(f).isFile()) {
    r.writeHead(200); return r.end(fs.readFileSync(f));   // no Content-Type, on purpose
  }
  r.writeHead(200, { 'Content-Type': 'text/html' });
  r.end(fs.readFileSync(path.join(ROOT, 'index.html')));
});
await new Promise(r => srv.listen(PORT, r));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));

// A rule that only exists in the stylesheet: .hm-h1 is the welcome headline.
const probe = () => page.evaluate(() => {
  const el = document.querySelector('.hm-h1');
  if (!el) return { found: false };
  const cs = getComputedStyle(el);
  return { found: true, size: parseFloat(cs.fontSize), family: cs.fontFamily, sheets: document.styleSheets.length };
});

for (const route of ['/', '/faq', '/journal/how-to-find-your-personal-style']) {
  await page.goto(ORIGIN + route, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const applied = await page.evaluate(() => {
    // The stylesheet must be present AND parsed, not merely requested.
    const l = [...document.styleSheets].find(s => (s.href || '').endsWith('/styles.css'));
    let rules = 0;
    try { rules = l ? l.cssRules.length : 0; } catch { rules = -1; }
    return { linked: !!l, rules };
  });
  ok(`${route}: the stylesheet is loaded and parsed`, applied.linked && applied.rules > 100,
     JSON.stringify(applied));
}

await page.goto(ORIGIN + '/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(400);
const p = await probe();
ok('the welcome headline is really styled by it', p.found && p.size > 20 && /DM Serif/i.test(p.family),
   JSON.stringify(p));
ok('served with NO Content-Type, Chromium still applies it', p.found && p.size > 20);
ok('zero JS errors', errors.length === 0, errors[0]);

await browser.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
