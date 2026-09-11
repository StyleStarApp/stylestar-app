// findscsv.js — the Amazon Finds CSV importer (2026-09-11, her batch-adding ask).
//
//   node scratchpad/findscsv.js
//
// ▶ NO NETWORK AND NO LIVE PAGE: it drives scripts/finds-from-csv.js directly,
// which is this project's standing rule — build against captured fixtures, never
// against her live allowance or her live site.
//
// ▶▶ §1 IS THE ONE THAT MATTERS. The rounding is CEILING, never nearest, and the
// difference is one of her own rules: a woman who arrives to find a piece DEARER
// than the page said feels misled, and only the cheaper surprise is recoverable.
// Nearest-rounding prints ~$16 for a $16.25 piece. Ceiling cannot.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { renderPrice, render, load, region } from '../scripts/finds-from-csv.js';

let pass = 0, fail = 0;
const ok = (n, c, e) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (e ? '  → ' + e : '')); } };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'findscsv-'));
const csv = (body) => { const p = path.join(tmp, 'f' + Math.random().toString(36).slice(2) + '.csv'); fs.writeFileSync(p, body); return p; };
const HEAD = 'name,store,price,note,url,category\n';
const ROW = (over = {}) => {
  const r = { name: 'A Piece', store: 'Amazon', price: '16.99', note: 'Lovely.', url: 'https://www.amazon.com/dp/B0CWD1RYK3', category: '', ...over };
  return [r.name, r.store, r.price, r.note, r.url, r.category].map(v => /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v).join(',');
};
const shown = s => (/>([^<]*)<\/span>/.exec(renderPrice(s) || '') || [])[1] || '';

console.log('\n1. THE PRICE ROUNDS UP, NEVER TO THE NEAREST — her sale-price rule, one step out');
/* 🚨 THIS IS THE CHECK THAT WOULD HAVE CAUGHT THE SPEC AS IT WAS FIRST WRITTEN.
   "Rounded to the nearest whole dollar" reads harmless and breaks her rule on
   every price whose cents are under 50. $16.25 is the whole argument. */
ok('$16.25 shows ~$17, never ~$16 — she can only be surprised the good way', shown('16.25') === '~$17', shown('16.25'));
ok('$16.99 → ~$17', shown('16.99') === '~$17', shown('16.99'));
ok('$46.99 → ~$47', shown('46.99') === '~$47', shown('46.99'));
ok('$8.50 → ~$9', shown('8.50') === '~$9', shown('8.50'));
ok('$16.01 → ~$17 — a single cent still rounds up', shown('16.01') === '~$17', shown('16.01'));
ok('a whole $32 stays ~$32 and is not inflated to ~$33', shown('32') === '~$32', shown('32'));
ok('no price anywhere ever shows cents', ['16.99', '8.50', '9.99 for 4', '1200.45']
   .every(p => !/\.\d/.test(shown(p))), ['16.99', '8.50', '9.99 for 4', '1200.45'].map(shown).join(' | '));
ok('a leading $ in her cell is tolerated', shown('$16.99') === '~$17', shown('$16.99'));

console.log('\n2. THE PRICE FIELD IS OPTIONAL, AND A TRAILING QUALIFIER SURVIVES');
/* ⚠️ HER GOLD PONYTAIL CUFF READS "$9.99 for 4". A rounder that assumed a bare
   number would have thrown those words away and quietly changed what the card
   claims — four cuffs for ~$10 is a different offer from one. */
ok('"9.99 for 4" keeps her words → ~$10 for 4', shown('9.99 for 4') === '~$10 for 4', shown('9.99 for 4'));
ok('an empty price renders NO price span at all — no placeholder', renderPrice('') === '');
ok('and no "price varies" text sneaks in', !/varies/i.test(renderPrice('') || ''));
ok('the exact figure is still STORED on the card', /data-price="16\.99"/.test(renderPrice('16.99')));
ok('the stored figure keeps her qualifier too', /data-price="9\.99 for 4"/.test(renderPrice('9.99 for 4')));
ok('an unparseable price is refused, never guessed at', renderPrice('ask me') === null);

console.log('\n3. THE LINK IS CANONICALISED — tracking off, one shape only');
const one = p => load(p)[0];
ok('a bare /dp/ link is kept', one(csv(HEAD + ROW())).url === 'https://www.amazon.com/dp/B0CWD1RYK3');
ok('her own orders-page crumbs come off',
   one(csv(HEAD + ROW({ url: 'https://www.amazon.com/dp/B0CWD1RYK3/ref=ppx_yo2ov_dt_b_fed_asin_title?th=1&psc=1' }))).url
   === 'https://www.amazon.com/dp/B0CWD1RYK3');
ok('a /gp/product/ link resolves to the same card',
   one(csv(HEAD + ROW({ url: 'https://www.amazon.com/gp/product/B0CWD1RYK3' }))).url === 'https://www.amazon.com/dp/B0CWD1RYK3');
ok('a bare ASIN is enough — she said "Amazon link or ASIN"',
   one(csv(HEAD + ROW({ url: 'B0CWD1RYK3' }))).url === 'https://www.amazon.com/dp/B0CWD1RYK3');
const bad = (body, why) => { try { load(csv(body)); return ''; } catch (e) { return e.message; } };
ok('a non-Amazon link is refused rather than rendered',
   /not an Amazon product link/.test(bad(HEAD + ROW({ url: 'https://www.nordstrom.com/s/123456' }))));
ok('the same piece twice is caught, not shown twice',
   /already row 2/.test(bad(HEAD + ROW() + '\n' + ROW({ name: 'Same thing again' }))));
ok('a row with no name is refused', /no name/.test(bad(HEAD + ROW({ name: '' }))));
ok('a row with no link is refused', /no Amazon link/.test(bad(HEAD + ROW({ url: '' }))));
ok('a wrong header is refused before anything renders',
   /header must be exactly/.test(bad('name,price,url\nA,1,B0CWD1RYK3')));

console.log('\n4. CATEGORIES GROUP IN HER OWN ROW ORDER');
/* ▶ HER SPREADSHEET IS THE LAYOUT. The order a category first APPEARS is the
   order it lands on the page, so she rearranges the page by rearranging rows —
   nothing to configure and nobody to ask. */
const grouped = render(load(csv(HEAD
  + ROW({ name: 'Dress One', url: 'B000000001', category: 'Dresses' }) + '\n'
  + ROW({ name: 'Ring One', url: 'B000000002', category: 'Jewelry' }) + '\n'
  + ROW({ name: 'Dress Two', url: 'B000000003', category: 'Dresses' }))));
const cats = [...grouped.matchAll(/<div class="dc-cat">([^<]*)<\/div>/g)].map(m => m[1]);
ok('each category appears exactly once, not once per piece', cats.join('|') === 'Dresses|Jewelry', cats.join('|'));
ok('and in the order her rows first name them', cats[0] === 'Dresses');
ok('a piece filed later still joins its own group',
   grouped.indexOf('Dress Two') < grouped.indexOf('Ring One'), 'Dress Two should sit under Dresses');
ok('every piece is still rendered', (grouped.match(/class="dc-item"/g) || []).length === 3);
/* ⚠️ A HEADING MUST NEVER BE COUNTABLE AS A PIECE. linkwatch and findspage both
   count .dc-item blocks and .dc-item-name; a heading that looked like either
   would silently inflate her page's count and be reported as a dead link. */
ok('a heading is not a .dc-item', (grouped.match(/class="dc-item"/g) || []).length === 3);
ok('a heading is not a .dc-item-name', (grouped.match(/class="dc-item-name"/g) || []).length === 3);

console.log('\n5. AN EMPTY CATEGORY COLUMN LEAVES THE PAGE EXACTLY AS IT IS TODAY');
const flat = render(load(csv(HEAD + ROW() + '\n' + ROW({ name: 'Second', url: 'B000000009' }))));
ok('no category column filled in means NO headings at all', !/dc-cat/.test(flat));
ok('and the pieces still render', (flat.match(/class="dc-item"/g) || []).length === 2);
const mixed = render(load(csv(HEAD
  + ROW({ name: 'Loose One', url: 'B000000011' }) + '\n'
  + ROW({ name: 'Filed One', url: 'B000000012', category: 'Shoes' }))));
ok('an unfiled piece keeps its place above the first heading — nothing is lost',
   mixed.indexOf('Loose One') < mixed.indexOf('dc-cat'), mixed.slice(0, 120));

console.log('\n6. EVERY GENERATED LINK IS STILL AFFILIATE-READY');
const many = render(load(csv(HEAD + ROW() + '\n' + ROW({ name: 'B', url: 'B000000021' }) + '\n' + ROW({ name: 'C', url: 'B000000022' }))));
const anchors = [...many.matchAll(/<a class="dc-item-btn"[^>]*>/g)].map(m => m[0]);
ok('every outbound anchor is rel="sponsored noopener" — affq\'s rule',
   anchors.length === 3 && anchors.every(a => /rel="sponsored noopener"/.test(a)), String(anchors.length));
/* 🚨 THE HREF MUST STAY RAW. Hard-coding a tagged url here would strand every
   saved wishlist row on a stale id and break the add-by-hand workflow — the
   exact thing _wlDecorateEdit() exists to avoid. */
ok('no anchor carries a baked-in ?tag= — the tag is added at runtime',
   !/[?&]tag=/.test(many));
ok('every anchor opens in a new tab', anchors.every(a => /target="_blank"/.test(a)));

console.log('\n7. IT WRITES TO ONE SCREEN AND CANNOT REACH THE EDIT');
/* 🚨🚨 THE TRAP THIS PAID FOR ONCE ALREADY: every .dc-* anchor is ambiguous now
   that two screens share the markup, and the FIRST occurrence in the file is the
   EDIT'S. Two Amazon pieces once landed on the Edit exactly this way. */
const idx = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'index.html'), 'utf8');
const { from, to } = region(idx);
const fStart = idx.indexOf('id="s-finds"'), fEnd = idx.indexOf('id="s-shop"', fStart);
ok('the generated region starts inside s-finds', from > fStart && from < fEnd, `${from} vs ${fStart}..${fEnd}`);
ok('and ends inside s-finds', to > from && to < fEnd);
ok('it sits entirely AFTER the Edit ends', from > idx.indexOf('id="s-finds"'));
ok('the Edit keeps its 33 pieces, untouched by any of this',
   (idx.slice(idx.indexOf('id="s-dream"'), fStart).match(/<div class="dc-item">/g) || []).length === 33);

console.log('\n7b. A RENAME IS NOT A REMOVAL — pieces are matched by ASIN, never by name');
/* 🚨 THIS FIRED FOR REAL ON HER FIRST RENAME, 2026-09-11. Dropping the colourway
   off seven names read as SEVEN REMOVALS AND SEVEN ADDITIONS with the count
   unchanged at 16, and the only way past it was --allow-removals — on a run that
   removed nothing. ▶ A guard that cannot tell a rename from a deletion teaches
   the next session to pass the override by reflex, and then it guards nothing. */
const idxNow = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'index.html'), 'utf8');
const byAsin = new Map();
{
  const a = idxNow.indexOf('id="s-finds"'), b = idxNow.indexOf('id="s-shop"', a);
  const re = /<div class="dc-item-name">([\s\S]*?)<\/div>[\s\S]{0,1200}?<a class="dc-item-btn"[^>]*href="[^"]*\/dp\/([A-Z0-9]{10})/g;
  for (const m of idxNow.slice(a, b).matchAll(re)) byAsin.set(m[2], m[1]);
}
/* ⚠️ COUNTED FROM THE PAGE, NEVER TYPED. A hardcoded 16 here would have gone red
   on her very next batch — on GOOD NEWS — and the rule being guarded is not "there are
   sixteen pieces", it is that EVERY live piece is reachable by its ASIN. A piece the
   regex cannot see is a piece the rename/removal guard silently stops protecting. */
const finds = (idxNow.slice(idxNow.indexOf('id="s-finds"'),
                            idxNow.indexOf('id="s-shop"', idxNow.indexOf('id="s-finds"')))
                    .match(/<div class="dc-item">/g) || []).length;
ok('every live piece is found by its ASIN, not its label', byAsin.size === finds,
   `by asin ${byAsin.size} vs cards ${finds}`);
ok('an ASIN maps to exactly one name', new Set(byAsin.keys()).size === byAsin.size);
/* ▶ HER RULING, 2026-09-11, WIDENED FROM THREE PIECES TO ALL OF THEM: "actually I
   don't think I want to put color on any of them."
   🚨 THE ASSERTION NAMES THE RULE, NOT THE PUNCTUATION. It used to forbid the EM-DASH
   itself, and her next batch arrived carrying "Interchangeable Gold Purse Chains — 5 Pack"
   — a legitimate name that would have turned this red for no reason. The thing she
   ruled off is an APPENDED COLOURWAY, so that is what is checked. */
const COLOURS = /^(white|black|blue|red|green|pink|beige|brown|tan|navy|ivory|cream|grey|gray|gold|silver|nude|blush|khaki|olive|burgundy|taupe|multi)\b/i;
const suffixed = [...byAsin.values()].filter(n => {
  const i = n.indexOf('—');
  return i >= 0 && COLOURS.test(n.slice(i + 1).trim());
});
ok('no Finds name carries an appended colourway', suffixed.length === 0, suffixed.join(' | '));
/* ⚠️ AND THE SCOPE: only the APPENDED colourway went. A colour word that is the
   piece's IDENTITY stays, and she ruled on this one by name: "keep the gold on the
   purse chains".
   🚨 THIS CHECK USED TO CITE "Gold Ponytail Cuff" AND WENT RED ON 2026-09-11 — ON A
   FACT, NOT A BUG. She found the cuff and the bangles also come in SILVER, so their
   gold was never identity at all; it was a colourway, and both names lost it while
   the notes gained "Comes in gold or silver." ▶ THE LESSON: "is this colour the
   piece's identity?" is a question about the PRODUCT, not about the words, and only
   she can answer it. The example moved to the one she has actually ruled on. */
ok('a colour word that IS the piece survives — the purse chains keep their gold',
   [...byAsin.values()].some(n => /^Interchangeable Gold Purse Chains, 5 Pack$/.test(n)),
   [...byAsin.values()].join(' | '));
/* ▶ AND THE OTHER HALF OF HER RULE: a name that dropped its colour must say so in the
   note, or a woman reaches a silver piece off a page that told her nothing. */
for (const [nm, asin] of [['the bangles', 'B0CWD1RYK3'], ['the ponytail cuff', 'B0FQC2PCXS']]) {
  /* ⚠️ EQUALITY AGAIN. This read `=== nm`, so renaming the cuff to "Ponytail Cuff,
     4 Pack" — a pack count, not a colour — failed the colour rule. The rule is that
     the NAME CARRIES NO METAL, and everything else about the name is hers to edit. */
  ok(`${nm} carries no colour in its name`,
     !!byAsin.get(asin) && !/\b(gold|silver|rose gold)\b/i.test(byAsin.get(asin)),
     byAsin.get(asin));
  const row = load(path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'data/amazon-finds.csv'))
    .find(r => r.url.includes(asin));
  /* 🚨 THIS PINNED THE LITERAL "gold or silver" AND WENT RED WITHIN THE HOUR, when she
     changed the bangles to "both gold and silver" — a BETTER sentence, failing a check
     written for the sentence it replaced. The rule is that the note names BOTH metals,
     never which joiner sits between them; the joiner is her voice and it is hers to
     change. ▶ Same lesson as the em-dash check two commits ago: pin the RULE, not the
     wording. It keeps happening because pinning the string is always the easier line
     to write. */
  ok(`...and its note names both metals instead`,
     /gold/i.test(row.note) && /silver/i.test(row.note), row.note);
}

console.log('\n8. HER LIVE PAGE AND HER SPREADSHEET AGREE');
const live = (idx.slice(fStart, fEnd).match(/<div class="dc-item">/g) || []).length;
const sheet = load(path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'data/amazon-finds.csv'));
ok('the CSV holds every piece that is on her page', sheet.length === live, `csv ${sheet.length} vs page ${live}`);
ok('every row is an Amazon product link', sheet.every(r => /^https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]{10}$/.test(r.url)));

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${fail ? '✗' : '✓'} ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
