// storedepth.js — catalog DEPTH in the store table (her call 2026-08-15).
// Born from her Tuckernuck screenshot: "print wrap top" at a small boutique
// answered with a wrap skirt and a perfume. 25 of her 101 stores are marked
// deep enough to take a specific multi-word search; everything else is a store
// to send what it is KNOWN FOR.
//
// ⚠️ The assertion that matters most is FIT BEATS DEPTH. Her guard, verbatim:
// "Revolve is only for someone who likes their clothing very fitted, alluring,
// trendy, edgy... not for a relaxed, preppy, natural type." A depth signal that
// outranked taste would quietly undo the whole matching system.
import http from 'http'; import fs from 'fs'; import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
const ROOT = path.resolve(import.meta.dirname, '..');
const srv = http.createServer((q, s) => { try { s.end(fs.readFileSync(path.join(ROOT, q.url === '/' ? 'index.html' : q.url.split('?')[0]))) } catch (e) { s.statusCode = 404; s.end() } }).listen(8961);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
let pass = 0, fail = 0;
const ok = (l, c, x) => { console.log((c ? '  ✓ ' : '  ✗ ') + l + (!c && x ? '  → ' + x : '')); c ? pass++ : fail++; };

const ctx = await b.newContext({viewport: {width: 390, height: 900}});
const pg = await ctx.newPage();
const errs = []; pg.on('pageerror', e => errs.push(String(e)));
await pg.route('**/.netlify/**', r => r.fulfill({status: 500, body: '{}'}));
await pg.goto('http://localhost:8961/');
await pg.waitForTimeout(2600);

console.log('1. The table: exactly her list, nothing invented');
const t = await pg.evaluate(() => {
  const full = Object.keys(STORES).filter(k => STORES[k].deep === 1);
  const cat = Object.keys(STORES).filter(k => typeof STORES[k].deep === 'string');
  return {full, cat: cat.map(k => k + ':' + STORES[k].deep), total: Object.keys(STORES).length,
          none: Object.keys(STORES).filter(k => !STORES[k].deep).length};
});
// The MIDDLE TIER, her call 2026-08-20, from her own address-bar testing. The
// split used to be binary, so Talbots (a national chain) was filed exactly like
// Tuckernuck (a small resort boutique). She searched each store herself:
// "the rest came up decent". Anthropologie honoured 3 of her 4 words
// (green/floral/dress) and dropped only the LENGTH word, which is a separate
// every-store problem, NOT a depth failure. Boden was MEASURED and correctly
// stays out: "dress" and "floral dress" both return a capped 1000 results, so
// extra words buy nothing there at all.
const MIDDLE = ["Talbots", "J.Crew", "Free People", "Anthropologie"];
const HERS = ["Nordstrom","Macy's","Dillard's","Belk","Bloomingdales","Saks","Neiman Marcus","NET-A-PORTER",
              "Shopbop","Nordstrom Rack","TJ Maxx","Target","Amazon","Revolve","Zara","H&M"];
// hardcoded ON PURPOSE, unlike the derived counts below: this one's whole job
// is to notice a store quietly appearing or vanishing. 101 as of 2026-08-24.
// ⚠️ Vilebrequin was added and then REMOVED the same day, on her own testing —
// their search returns a false negative on a product they stock, so the brand is
// kept for the Edit and the Star and out of the searchable table. It is still an
// approved advertiser and still earns; see the block comment at its old place in
// STORES. This is the ONE suite that should fail when the table changes — bump it
// deliberately, never find-and-replace it.
ok('store count is 101', t.total === 101, String(t.total));   // -Baltic Born, 2026-08-24 (Cath)
ok('the 16 she confirmed are all flagged deep', HERS.every(n => t.full.includes(n)), HERS.filter(n => !t.full.includes(n)).join());
ok('the 4 middle-tier stores she added are flagged', MIDDLE.every(n => t.full.includes(n)), MIDDLE.filter(n => !t.full.includes(n)).join());
ok('nothing else was flagged deep', t.full.length === HERS.length + MIDDLE.length,
   t.full.filter(n => !HERS.includes(n) && !MIDDLE.includes(n)).join());
ok('J.Jill and Boden deliberately stay known-for only', !t.full.includes('J.Jill') && !t.full.includes('Boden'));
// The category-deep roster, pinned by name ON PURPOSE. Each entry is a store
// that can take a specific search inside ONE lane and nowhere else, so the list
// is a deliberate roll-call rather than a number: DVF returns 363 results for
// "wrap dress" and a flat 0 for "sneakers".
ok('the 6 category-deep stores, each in its own lane',
   t.cat.sort().join(',') === "Athleta:activewear,DSW:shoes,Diane von Furstenberg:dresses,Lands' End:swimwear,Sunglass Hut:eyewear,Zappos:shoes", t.cat.join());
// derived, never restated: a test that hardcodes a number must be edited every
// time the list grows; a derived one never does (the curated.js lesson).
ok('every remaining store carries no depth flag', t.none === t.total - t.full.length - t.cat.length,
   t.none + ' of ' + t.total);
// the apostrophe stores are the ones a naive pass misses (the Bloomingdale's lesson)
ok("Macy's and Dillard's really got flagged", t.full.includes("Macy's") && t.full.includes("Dillard's"));

console.log('\n2. The prompt actually carries it (data the model cannot otherwise see)');
const p = await pg.evaluate(() => {
  quizTaken = true;
  const list = _storeListForPrompt();
  const rules = _shopRules();
  return {
    nordstrom: /Nordstrom \[[^\]]*DEEP catalog/.test(list),
    zappos: /Zappos \[[^\]]*DEEP catalog for shoes/.test(list),
    tuckernuck: /Tuckernuck \[[^\]]*DEEP/.test(list),
    deepCount: (list.match(/DEEP catalog/g) || []).length,
    tableDeep: Object.keys(STORES).filter(k => STORES[k].deep).length,
    fitBeats: /FIT BEATS DEPTH, ALWAYS/.test(rules),
    revolveNamed: /Revolve is deep, but it is for a woman/.test(rules),
    tiebreak: /tie-breaker BETWEEN stores that already suit her/.test(rules)
  };
});
ok('a deep store is marked in the list', p.nordstrom);
ok('a category-deep store names its category', p.zappos);
ok('a focused store is NOT marked', !p.tuckernuck);
ok('every deep store in the table reaches the prompt', p.deepCount === p.tableDeep, p.deepCount + ' markers vs ' + p.tableDeep + ' in the table');
ok('the FIT BEATS DEPTH rule is present', p.fitBeats);
ok('her Revolve example is named in the rule', p.revolveNamed);
ok('depth is stated as a tie-breaker, not a preference', p.tiebreak);

console.log('\n3. HER GUARD: depth must not drag the wrong store up the ranking');
const rank = await pg.evaluate(() => {
  // a relaxed / classic / natural dresser -- the woman she said Revolve is wrong for.
  // sliders are 1-11: 1 classic, 5 casual, 9 relaxed
  answers = new Array(12).fill(6);
  answers[0] = 1;   // very classic, not trendy
  answers[8] = 1;   // very relaxed, not fitted
  answers[1] = 1;   // natural, not glam
  answers[10] = 1;  // modest, not alluring
  answers[4] = 2;   // casual, not dressy
  quizTaken = true;
  const relaxed = _rankedStores();
  // and the opposite woman, who Revolve genuinely suits
  answers[0] = 11; answers[8] = 11; answers[1] = 11; answers[10] = 11; answers[4] = 10;
  const glam = _rankedStores();
  return {
    relaxedRevolve: relaxed.indexOf('Revolve'),
    glamRevolve: glam.indexOf('Revolve'),
    relaxedTop10: relaxed.slice(0, 10),
    total: relaxed.length
  };
});
ok('a relaxed/classic dresser does not get Revolve near the top', rank.relaxedRevolve > 40,
   'rank ' + rank.relaxedRevolve + ' of ' + rank.total);
ok('the woman it suits still gets it high', rank.glamRevolve < 15, 'rank ' + rank.glamRevolve);
ok('depth did not flood her top 10 with big catalogs',
   rank.relaxedTop10.filter(k => k === 'Revolve').length === 0, rank.relaxedTop10.join(' · '));
console.log('    relaxed dresser top 10: ' + rank.relaxedTop10.join(' · '));

ok('zero JS errors', errs.length === 0, errs.join(' | '));
await ctx.close(); await b.close(); srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
