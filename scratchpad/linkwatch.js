// linkwatch.js — THE WATCHDOG NOW WATCHES THE SURFACES SHE MAINTAINS.
//
// 🚨 WHY THIS SUITE EXISTS. On 2026-09-08 Cath found the Star of the Week SOLD
// OUT while it was live on screen. The link-rot script already detected "sold
// out" — it was simply pointed at products.json, the catalog she FROZE, and had
// never read the Edit or the WEEK_STARS queue. ▶ These checks pin the coverage
// and the judgement, so neither can quietly narrow again.
//
// ⚠️ NO NETWORK. The parsers run against the real index.html; the stock
// judgement runs against fixtures whose shapes were MEASURED off two real pages
// on 2026-09-08 (the sold-out Serpui and the in-stock Saint Laurent).
//
// Run: node scratchpad/linkwatch.js
import fs from 'fs';
import path from 'path';
import {collectStars, collectEdit, collectFinds, collectCatalog, collectAll, stockVerdict, SURFACE, ROOT}
  from '../scripts/lib/curation-links.js';

let pass = 0; const fails = [];
const ok = (l, c, d) => { if (c) { pass++; console.log('  ✓ ' + l); }
  else { fails.push(l); console.log('  ✗ ' + l + (d ? '  → ' + d : '')); } };

const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

console.log('\nPART 1 — it reads the surfaces she actually maintains');
const stars = collectStars(), edit = collectEdit(), finds = collectFinds(), cat = collectCatalog(ROOT);
ok('the Star queue is read', stars.length > 0, String(stars.length));
ok('the Edit is read', edit.length > 0, String(edit.length));
ok('Amazon Finds is read', finds.length > 0, String(finds.length));
ok('the frozen catalog is still read', cat.length > 0, String(cat.length));
// ⚠️ DERIVED, never a frozen number — the 2026-09-08 lesson. Her Edit grows when
// she adds a piece, and a test that fails on that teaches the next session to
// bump a number without reading it.
// 🚨 SCOPED BY SCREEN SINCE 2026-09-11. This used to count `.dc-item` across the
// WHOLE file, which was right while one screen used that markup. Amazon Finds
// now uses the same blocks, so an unscoped count quietly compared the Edit's 33
// against the file's 35 — and the failure it produced is the GOOD kind: the
// parser really had started filing her Finds pieces under the Edit.
const slice = (id, next) => {
  const i = src.indexOf(`id="${id}"`), j = src.indexOf(`id="${next}"`, i);
  return i < 0 ? '' : src.slice(i, j < 0 ? src.length : j);
};
const count = t => (t.match(/<div class="dc-item">/g) || []).length;
const domCount = count(slice('s-dream', 's-finds'));
const findsCount = count(slice('s-finds', 's-shop'));
ok('every Edit item in the markup is collected, none dropped',
   edit.length === domCount, `collected ${edit.length} of ${domCount}`);
ok('every Amazon Finds item in the markup is collected, none dropped',
   finds.length === findsCount, `collected ${finds.length} of ${findsCount}`);
// ⚠️ AND THE WHOLE-FILE TOTAL STILL HAS TO ADD UP, or a THIRD curated screen
// could appear one day and go entirely unwatched with every check above green.
ok('no .dc-item anywhere in the file is unwatched',
   domCount + findsCount === count(src),
   `${domCount} + ${findsCount} of ${count(src)}`);
ok('every collected link is https', collectAll(ROOT).every(i => /^https:\/\//.test(i.url)),
   collectAll(ROOT).filter(i => !/^https:\/\//.test(i.url)).map(i => i.name).join(', '));
ok('every item carries a name and a surface',
   collectAll(ROOT).every(i => i.name && SURFACE[i.source]));

console.log('\nPART 2 — the rotation, so the LIVE piece is the loudest row');
ok('exactly one Star is LIVE NOW', stars.filter(s => s.due === 0).length === 1,
   stars.filter(s => s.due === 0).map(s => s.n).join(', '));
ok('every queued Star gets a turn (no duplicate weeks)',
   new Set(stars.map(s => s.due)).size === stars.length);
// ⚠️ THE ANCHOR IS READ OUT OF THE APP, NEVER RESTATED. A second copy of a date
// is a second thing to keep in step — and drift between two copies is this whole
// file's subject.
ok('the anchor date is parsed from index.html, not hardcoded here',
   /Date\.UTC\(2026,7,9\)/.test(src) && !/Date\.UTC\(/.test(
     fs.readFileSync(path.join(ROOT, 'scripts/lib/curation-links.js'), 'utf8')
       .split('const m =')[0]));

console.log('\nPART 3 — a retired piece must NOT be woken about');
// The sold-out Serpui's WEEK_STARS entry is kept on purpose (it carries the pxPos
// crop her catch produced) but its name is gone from WEEK_STAR_PHOTO_ORDER, which
// is the whitelist. It renders nowhere, so it must not appear in a report either.
ok('the WEEK_STARS entry still exists (the lesson is kept)',
   /\{n:'Serpui Abigail Handbag/.test(src));
ok('...and is marked SOLD OUT so nobody re-enrols it', /SOLD OUT AND RETIRED FROM ROTATION/.test(src));
ok('...but it is NOT in the rotation', !stars.some(s => /Serpui/.test(s.name)),
   stars.map(s => s.name).join(', '));
ok('...and NOT in the Edit any more', !edit.some(e => /Serpui/.test(e.name)));

console.log('\nPART 4 — the stock judgement, measured on two real pages');
// 🚨 THE MEASUREMENT THAT SHAPED THIS, 2026-09-08:
//        page            JSON-LD OutOfStock/InStock    prose "sold out"
//        Serpui                1 / 0                          4
//        Saint Laurent         0 / 1                          2  ← HEALTHY
// ▶ The healthy page says "sold out" twice. Prose is noise; schema.org is a
//   product-level claim by the retailer. Only the latter may condemn a piece.
const SERPUI = '"availability" : "http://schema.org/OutOfStock" ... sold out ... sold out ... "available":false';
const YSL    = '"availability":"https://schema.org/InStock" ... sold out ... sold out';
ok('the real sold-out page reads OUT', stockVerdict(SERPUI).state === 'out');
ok('the real in-stock page reads IN, despite saying "sold out" twice',
   stockVerdict(YSL).state === 'in', JSON.stringify(stockVerdict(YSL)));
ok('both signals present means VARIANTS, which is her eye not ours',
   stockVerdict('"availability":"schema.org/InStock" "availability":"schema.org/OutOfStock"').state === 'mixed');
ok('a page with no structured signal is UNKNOWN, never condemned',
   stockVerdict('<html>sold out</html>').state === 'unknown');
ok('the <meta content=> form is read too',
   stockVerdict('<meta itemprop="availability" content="https://schema.org/OutOfStock">').state === 'out');
ok('an empty body is not an accusation', stockVerdict('').state === 'unknown');
ok('prose alone NEVER reads as out — the honesty rule this script shipped with',
   stockVerdict('Sold out. Out of stock. No longer available.').state === 'unknown');

console.log('\nPART 5 — the report must shout in the right order');
ok('the Star outranks the Edit, which outranks the frozen catalog',
   SURFACE.star.rank < SURFACE.edit.rank && SURFACE.edit.rank < SURFACE.catalog.rank);
const script = fs.readFileSync(path.join(ROOT, 'scripts/check-product-urls.js'), 'utf8');
ok('a dead piece on a surface she maintains fails the run',
   /if \(key !== 'catalog'\) exitBad/.test(script));
ok('...and the frozen catalog deliberately does NOT fail it',
   /a death here is accepted/.test(
     fs.readFileSync(path.join(ROOT, 'scripts/lib/curation-links.js'), 'utf8')));
ok('an authoritative InStock outranks the noisy prose check',
   script.indexOf("stock.state === 'in'") < script.indexOf('OOS.test(body)'));

console.log('\n' + pass + ' passed, ' + fails.length + ' failed');
process.exit(fails.length ? 1 : 0);
