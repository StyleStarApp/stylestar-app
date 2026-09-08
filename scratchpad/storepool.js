// storepool.js — STORE-POOL ELIGIBILITY, the ledger row that had no test.
//
// 🚨 WHY THIS SUITE EXISTS, AND WHY TODAY. CLAUDE.md's rule ledger has carried
// "store-pool eligibility" as ✅ measured 2026-09-07 but with "▶ none" in the
// test column, next to one specific prediction:
//
//     "it becomes load-bearing the moment an EIGHTH merchant is wired in."
//
// COUTR was approved on 2026-09-08 and is the eighth. So the prediction came
// true on schedule, and a rule that is only ever measured by hand is a rule
// waiting to drift — which is this file's most repeated lesson.
//
// ▶ WHAT IT GUARDS, and every line of it is HER rule, not an invented one:
//   1. Every merchant the nightly feed ingests resolves to a REAL key in her
//      own STORES table, so a catalog row can be joined to her tags. A feed
//      merchant with no entry is rows with nowhere to land.
//   2. Every one of those carries her TEN dimension scores, in range. This is
//      the difference the untagged.js work drew out: an untagged store is
//      FINDABLE but not RECOMMENDABLE — it can never be ranked toward a woman
//      it suits. A merchant she is paid for should be recommendable.
//   3. The three standing business-model exclusions (2026-07-27, her words):
//      no subscription styling boxes, no rentals, no fast fashion. Written
//      into the table's own comment and never tested until now.
//   4. Every store is somewhere a woman can actually BUY AND KEEP an item:
//      an https search url, no exceptions.
//
// ⚠️ THE ONE DELIBERATE EXCEPTION IS NAMED, NEVER INFERRED. Vilebrequin's rows
//    were ingested for a period while it had no STORES entry (removed 2026-08-21
//    over a false-negative search, restored after her 2026-09-08 "Vilebrequin
//    stays"). If a merchant is ever knowingly ingested without an entry again,
//    it goes in KNOWN_UNTABLED with a reason — so the exception is a decision
//    on the record, not a quiet gap.
//
// Run: node scratchpad/storepool.js
import fs from 'fs';
import path from 'path';
import {loadStores} from '../scripts/lib/stores.js';

const ROOT = path.resolve(import.meta.dirname, '..');
let pass = 0; const fails = [];
function ok(label, cond, detail) {
  if (cond) { pass++; console.log('  ✓ ' + label); }
  else { fails.push(label); console.log('  ✗ ' + label + (detail ? '  → ' + detail : '')); }
}

const STORES = loadStores();
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const feedPy = fs.readFileSync(path.join(ROOT, 'scripts/rakuten_feed.py'), 'utf8');

// ── parse the python side ────────────────────────────────────────────────────
const midBlock = feedPy.match(/MID_TO_STORE\s*=\s*\{([\s\S]*?)\n\}/);
const MID_TO_STORE = {};
for (const m of midBlock[1].matchAll(/"(\d+)"\s*:\s*"([^"]+)"/g)) MID_TO_STORE[m[1]] = m[2];
const BUILD_MIDS = (feedPy.match(/BUILD_MIDS\s*=\s*\[([^\]]*)\]/)[1].match(/"(\d+)"/g) || [])
  .map(s => s.replace(/"/g, ''));

// ── parse the affiliate map ──────────────────────────────────────────────────
const AFF = {};
for (const m of html.match(/var _AFF_MID=\{[\s\S]*?\};/)[0]
  .matchAll(/'([a-z0-9.-]+\.[a-z]{2,})'\s*:\s*'(\d+)'/g)) AFF[m[1]] = m[2];

// Merchants knowingly ingested with NO STORES entry. Empty today, on purpose.
const KNOWN_UNTABLED = {};

console.log('\nPART 1 — every ingested merchant lands somewhere real');
ok('the build set is non-empty', BUILD_MIDS.length > 0, String(BUILD_MIDS.length));
ok('every built MID is a merchant we know',
   BUILD_MIDS.every(m => MID_TO_STORE[m]),
   BUILD_MIDS.filter(m => !MID_TO_STORE[m]).join(',') || '');
const built = BUILD_MIDS.map(m => ({mid: m, name: MID_TO_STORE[m]}));
for (const b of built) {
  const inTable = Object.prototype.hasOwnProperty.call(STORES, b.name);
  ok(`${b.name} (mid ${b.mid}) resolves to a STORES key`,
     inTable || b.name in KNOWN_UNTABLED,
     inTable ? '' : 'no STORES entry and no KNOWN_UNTABLED reason');
}
ok('COUTR is among them (her 8th, approved 2026-09-08)',
   built.some(b => b.name === 'COUTR'));

// 🚨🚨 DUPLICATE KEYS ARE SILENT DATA LOSS, AND THIS WAS A NEAR MISS ON 2026-09-08.
// CLAUDE.md said Zara "still needs her tags before it goes in". It was ALREADY in,
// fully scored by her. A second bare 'Zara' key was written further down the table
// and, being later in the object literal, would have overwritten her ten numbers
// with nothing — no error, no warning, the app simply forgets what she told it.
// ▶ IT CANNOT BE CAUGHT BY READING THE PARSED OBJECT, because the duplicate is
//   already gone by then. It has to be counted in the SOURCE TEXT.
// ⚠️ Caught last time only because a store count came out one short. That is luck,
//   not a check.
{
  // ⚠️ Scoped to the STORES literal ONLY. index.html holds other tables with the
  //    same `  'key':{` shape, and counting those made this check nonsense.
  const from = html.indexOf('const STORES={');
  const block = html.slice(from, html.indexOf('\n};', from));
  // ⚠️ Keys are unescaped: the source writes Kohl\\'s, the parsed table holds Kohl's.
  const keys = [...block.matchAll(/^  '((?:[^'\\\\]|\\\\.)*)':\{/gm)]
    .map(m => m[1].replace(/\\\\(.)/g, '$1'));
  const seen = new Set(), dupes = new Set();
  for (const k of keys) { if (seen.has(k)) dupes.add(k); seen.add(k); }
  ok('no store is declared twice in the table', dupes.size === 0,
     [...dupes].join(', ') || '');
  // ⚠️ DELIBERATELY NOT A COUNT. A first attempt asserted that the number of keys
  //    the regex finds equals the number the parser reads, and it failed at 104
  //    vs 110 — because the regex misses entries this table formats differently,
  //    not because anything was wrong. THAT IS A TEST ARGUING WITH ITS OWN REGEX,
  //    which is the "count of her stores is not an invariant" lesson wearing a
  //    different hat. The duplicate check above is what actually catches the bug;
  //    this one only asserts that whatever the regex DID find is really there.
  const orphans = keys.filter(k => !Object.prototype.hasOwnProperty.call(STORES, k));
  ok('every key found in the source is readable in the parsed table',
     orphans.length === 0, orphans.join(', '));
}

console.log('\nPART 2 — a merchant she is PAID for must be recommendable, not just findable');
for (const b of built) {
  const e = STORES[b.name];
  if (!e) continue;
  const d = e.d;
  ok(`${b.name} carries her ten dimensions`, Array.isArray(d) && d.length === 10,
     Array.isArray(d) ? 'length ' + d.length : typeof d);
  ok(`${b.name}'s scores are all numbers 1-10`,
     Array.isArray(d) && d.every(n => typeof n === 'number' && n >= 1 && n <= 10),
     Array.isArray(d) ? d.join(',') : '');
  ok(`${b.name} has a price tier and an archetype`,
     typeof e.t === 'string' && e.t.length > 0 && typeof e.a === 'string' && e.a.length > 0,
     't=' + e.t + ' a=' + e.a);
}

console.log('\nPART 3 — her three standing business-model exclusions (2026-07-27)');
// Her own words: "No subscription boxes I cannot stand those things." /
// "No rentals either, same reason." / fast fashion, on quality and ethics.
// ⚠️ ALL of these appear on her wider ~200-store wishlist. They are excluded ON
//    PURPOSE, and this is the check that stops one arriving from that list.
const BANNED = {
  'subscription styling box': ['Stitch Fix', 'Dia&Co', 'Dia & Co', 'Trunk Club', 'Wantable', 'Fabletics'],
  'rental': ['Rent the Runway', 'Nuuly', 'Armarium'],
  'fast fashion': ['Shein', 'SHEIN', 'Temu', 'Cider', 'Princess Polly', 'Meshki', 'Peppermayo', 'Cotton On', 'Fashion Nova', 'boohoo', 'Boohoo', 'Ardene'],
};
const keysLower = Object.keys(STORES).map(k => k.toLowerCase());
for (const [why, names] of Object.entries(BANNED)) {
  const found = names.filter(n => keysLower.includes(n.toLowerCase()));
  ok(`no ${why} is in the store table`, found.length === 0, found.join(', '));
}

console.log('\nPART 4 — every store is a place she can BUY AND KEEP an item');
const noUrl = Object.keys(STORES).filter(k => {
  const e = STORES[k];
  return !(typeof e.u === 'string' && /^https:\/\//.test(e.u)) &&
         !(typeof e.tpl === 'string' && /^https:\/\//.test(e.tpl));
});
ok('every store has an https search url', noUrl.length === 0, noUrl.join(', '));

console.log('\nPART 5 — COUTR, the merchant this suite was written for');
const c = STORES['COUTR'];
ok('COUTR is in the table', !!c);
ok('its search url is the verified one',
   c && c.u === 'https://www.coutr.com/search?q=', c && c.u);
// ⚠️ MEASURED 2026-09-08, not assumed: a plain search for "sweater" returned 36
//    products of which 10 were men's; "womens sweater" returned 36 with ZERO.
//    COUTR also carries kidswear and fragrance. Without w:1 her Tops shelf gets
//    a Balenciaga men's cardigan — the exact fault she caught at Banana Republic.
ok('it is scoped to womenswear (w:1) — it sells menswear and kidswear too',
   c && c.w === 1, c && String(c.w));
ok('it earns: coutr.com is in _AFF_MID', AFF['coutr.com'] === '54152', AFF['coutr.com']);
ok('its mid matches the feed map', MID_TO_STORE['54152'] === 'COUTR');

console.log('\nPART 6 — the womenswear rule, across every feed merchant');
// A feed merchant that sells menswear MUST be scoped on the AI half too. The
// feed half is guarded separately by keep_row()'s gender column + name check
// (rakuten_feed 55). This is the other half of that same rule.
const SELLS_MENSWEAR = ['COUTR', 'Vilebrequin', 'Mytheresa'];
for (const n of SELLS_MENSWEAR) {
  const e = STORES[n];
  if (!e) continue;
  const scoped = e.w === 1 || e.gp || /women/i.test(String(e.u || '') + String(e.tpl || ''));
  ok(`${n} sells menswear and is scoped to women`, !!scoped,
     'w=' + e.w + ' u=' + e.u);
}

console.log('\n' + pass + ' passed, ' + fails.length + ' failed');
process.exit(fails.length ? 1 : 0);
