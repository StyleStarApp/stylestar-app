// untagged.js — A STORE CATH HAS NOT TAGGED YET MUST NOT TAKE THE APP DOWN.
//
// 🚨 WHY THIS SUITE EXISTS. CLAUDE.md carried an UNVERIFIED question that was
// about to size a whole evening of her work: does a store need her full ten
// dimension scores just to have its products allowed through, or are those two
// separable jobs? She wants ~200 stores, up from 108, and the answer decides
// whether that is a yes/no list or 200 rows of hand-scoring.
//
// Measured 2026-09-07, and it was half good news and half a live crash:
//   • the FINDER'S ALLOWLIST needs a name and a search URL and nothing else —
//     find-products.js never reads her ten scores at all.
//   • GATE 2, the feed shelf, already guarded itself and keeps the garment.
//   • the CHAT'S STORE RANKING **threw**: _rankedStores mapped every key
//     through _storeFit, which reads all ten dimensions off `d`. One untagged
//     store in the table and every shopping prompt died. Same crash family as
//     a rename breaking _STORE_ALIAS, which this file already warns about.
//
// ▶ THE FIX IS NOT AN INVENTED SCORE AND NOT A DROP. An unscored store keeps
//   its place at the END of the list and is listed by NAME ONLY. Ranking it
//   would mean making her numbers up; dropping it would break SORT, DO NOT
//   TRIM and quietly hide a shop she approved.
//
// Run: node scratchpad/untagged.js
import fs from 'fs';
import vm from 'vm';
import path from 'path';
import {execFileSync} from 'child_process';
import {loadStores, storeHost} from '../scripts/lib/stores.js';

const ROOT = path.resolve(import.meta.dirname, '..');
let pass = 0, failn = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { failn++; console.log('  ✗ FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// Pull a named function out of index.html by walking its braces, so the test
// runs THE REAL CODE rather than a paraphrase of it.
function grab(src, name) {
  const start = src.indexOf('function ' + name + '(');
  if (start < 0) throw new Error('missing ' + name);
  let i = src.indexOf('{', start), depth = 0, end = -1;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { end = j; break; } }
  }
  return src.slice(start, end + 1);
}

// Her own twelve slider positions, recorded 2026-09-08 from her Style Signature
// screenshot, run through the app's own formulas. Not an approximation.
const HER = {all: 6.40, trendy: 0.70, dressy: 0.60, fitted: 0.70, color: 0.60};

function build(src, stores) {
  const ctx = {STORES: stores, quizTaken: true, console};
  vm.createContext(ctx);
  vm.runInContext(
    'const _DIM_REL=0,_DIM_ALL=1,_DIM_POL=2,_DIM_CLA=3,_DIM_TRE=4,_DIM_CAS=5,' +
    '_DIM_DRE=6,_DIM_FIT=7,_DIM_NEU=8,_DIM_COL=9;\n' +
    'function _herDims(){return {all:' + HER.all + ',trendy:' + HER.trendy +
    ',dressy:' + HER.dressy + ',fitted:' + HER.fitted + ',color:' + HER.color + '}}\n' +
    grab(src, '_storeFit') + '\n' +
    grab(src, '_rankedStores') + '\n' +
    grab(src, '_storeListForPrompt') + '\n', ctx);
  return ctx;
}

const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
// ⚠️ PINNED TO A SHA, NOT TO HEAD. This suite compares against the app as it
// stood BEFORE the untagged-store guard, to prove two things at once: that the
// crash was real, and that fixing it moved nothing for her 108 tagged stores.
// Written against "HEAD" it passed exactly once -- on the commit that introduced
// the fix -- and started failing on the very next commit, claiming the bug had
// never existed. A baseline that moves is not a baseline.
// 3d1aad4 is the last commit before the guard (parent of 995a4dd).
const BASE = '3d1aad4';
let before = null;
try { before = execFileSync('git', ['show', BASE + ':index.html'], {cwd: ROOT, maxBuffer: 1 << 30}).toString(); }
catch (e) { console.log('  ⚠ baseline ' + BASE + ' not in this clone — the before/after checks are SKIPPED'); }
const stores = loadStores();
const names = Object.keys(stores);

console.log('\nPART 1 — nothing about her SCORED stores changes');
// 🚨🚨 REWRITTEN 2026-09-08, AND THE REASON IS THE BEST NEWS IN THIS SUITE.
// This used to assert that EVERY store carries her ten scores, and to run the
// pre-fix code against the whole live table. Both were fine while every shop she
// had was scored. ▶ On 2026-09-08 she sent a roster of 122 with 21 shops added as
// plain names — exactly the yes/no approval this fix was built to allow — and the
// old code CRASHED on the real table, which is precisely the bug it exists to
// stop, arriving for real instead of as a fixture.
// ▶ SO THE COMPARISON NOW RUNS ON THE SCORED STORES ONLY. That still proves the
//   guarantee it was written for — her scored shops rank in exactly the order they
//   did before the guard existed — while PART 2 proves the crash using her real
//   unscored shops rather than a synthetic one.
const scoredOnly = {};
for (const k of Object.keys(stores)) if (Array.isArray(stores[k].d) && stores[k].d.length === 10) scoredOnly[k] = stores[k];
const scoredNames = Object.keys(scoredOnly);
const unscoredNames = Object.keys(stores).filter(k => !scoredOnly[k]);
const now = build(src, JSON.parse(JSON.stringify(scoredOnly)));
const was = before ? build(before, JSON.parse(JSON.stringify(scoredOnly))) : null;
ok('every SCORED store carries all ten of her numbers',
   scoredNames.every(k => stores[k].d.length === 10), String(scoredNames.length));
ok('and the unscored ones are her deliberate yes/no rows, not accidents',
   unscoredNames.every(k => typeof stores[k].u === 'string' && /^https:\/\//.test(stores[k].u)),
   unscoredNames.join(', '));
console.log('     (' + scoredNames.length + ' scored, ' + unscoredNames.length + ' name-only)');
const rankNow = vm.runInContext('_rankedStores(null)', now);
const promptNow = vm.runInContext('_storeListForPrompt(null,45)', now);
if (was) {
  ok('the ranking is byte-identical to before the fix',
     JSON.stringify(rankNow) === JSON.stringify(vm.runInContext('_rankedStores(null)', was)));
  ok('the prompt store list is byte-identical to before the fix',
     promptNow === vm.runInContext('_storeListForPrompt(null,45)', was));
}
ok('an occasion still re-orders the list',
   JSON.stringify(vm.runInContext('_rankedStores(0.95)', now)) !== JSON.stringify(rankNow));

// ▶▶ THE REGRESSION PROOF, NOW WITH HER REAL TABLE RATHER THAN A FIXTURE.
if (was && unscoredNames.length) {
  const fullOld = build(before, JSON.parse(JSON.stringify(stores)));
  const fullNew = build(src, JSON.parse(JSON.stringify(stores)));
  let oldThrew = false;
  try { vm.runInContext('_rankedStores(null)', fullOld); } catch (e) { oldThrew = true; }
  ok('her REAL table would have crashed the pre-guard code', oldThrew,
     'it did not throw — has the baseline moved?');
  let newOk = false;
  try { newOk = vm.runInContext('_rankedStores(null)', fullNew).length === Object.keys(stores).length; } catch (e) {}
  ok('...and the guarded code ranks all ' + Object.keys(stores).length + ' of them', newOk);
}

console.log('\nPART 2 — the crash the fix exists to stop');
// Exactly what a yes/no approval produces: a name, a search URL, and her
// price tier and size ranges. No dimension scores.
const UNTAGGED = {u: 'https://www.kohls.com/search.jsp?search=', t: '$-$$', s: ['petite', 'plus', 'tall']};
const withNew = JSON.parse(JSON.stringify(stores));
withNew['Kohls'] = UNTAGGED;
if (before) {
  let threwBefore = false;
  try { vm.runInContext('_rankedStores(null)', build(before, JSON.parse(JSON.stringify(withNew)))); }
  catch (e) { threwBefore = true; }
  ok('BEFORE the fix an untagged store threw (this is the bug)', threwBefore);
}

const nowNew = build(src, withNew);
let ranked = null, threwNow = null;
try { ranked = vm.runInContext('_rankedStores(null)', nowNew); }
catch (e) { threwNow = e.message; }
ok('AFTER the fix the ranking survives it', threwNow === null, threwNow);

console.log('\nPART 3 — sort, do not trim: she approved it, so it stays');
ok('the untagged store is still in the list', !!ranked && ranked.indexOf('Kohls') >= 0);
ok('every tagged store is still in the list too',
   !!ranked && names.every(k => ranked.indexOf(k) >= 0));
ok('it sorts to the END, because we cannot honestly place it',
   !!ranked && ranked[ranked.length - 1] === 'Kohls');
// ⚠️ COMPARED AGAINST THE FULL LIVE TABLE, not the scored-only one used in PART 1.
//    PART 1 asks "did the guard disturb her scored shops" and needs a scored-only
//    baseline; THIS asks "does adding one more untagged shop disturb anything at
//    all", so its baseline must be the real table she actually has — which since
//    2026-09-08 contains 21 name-only shops of her own.
const rankFull = vm.runInContext('_rankedStores(null)',
  build(src, JSON.parse(JSON.stringify(stores))));
ok('every other store keeps its exact place when one more is added',
   !!ranked && JSON.stringify(ranked.filter(k => k !== 'Kohls')) === JSON.stringify(rankFull));

console.log('\nPART 4 — named, never described: no invented tags');
let prompt = null, threwPrompt = null;
try { prompt = vm.runInContext('_storeListForPrompt(null,45)', nowNew); }
catch (e) { threwPrompt = e.message; }
ok('the prompt builder survives an untagged store', threwPrompt === null, threwPrompt);
const lines = (prompt || '').split('\n');
const mine = lines.filter(l => l === 'Kohls' || l.indexOf('Kohls [') === 0);
ok('the untagged store appears exactly once', mine.length === 1, JSON.stringify(mine));
ok('it is listed by NAME ONLY — no bracket, no invented description',
   mine[0] === 'Kohls', mine[0]);
ok('no fabricated price tier or size claim reaches the prompt',
   !(prompt || '').includes('Kohls ['));
ok('her tagged stores are still described in full',
   lines.filter(l => l.indexOf(' [') > 0).length >= 45);

console.log('\nPART 5 — the two halves that were ALREADY safe, pinned so they stay safe');
ok('the finder allowlist needs only a name and a URL', storeHost(UNTAGGED) === 'kohls.com');
ok('find-products.js never reads her ten scores',
   !/\bd\[_DIM|\.d\b\s*\[/.test(fs.readFileSync(path.join(ROOT, 'netlify/functions/lib/find-products.js'), 'utf8')));
// Gate 2's own line, lifted verbatim from index.html.
const gate2 = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
  .includes("if(!_sk||!STORES[_sk]||!STORES[_sk].d)return true;");
ok('Gate 2 still keeps a garment from an untagged store', gate2);

console.log('\n' + (failn ? '✗ ' + failn + ' FAILED, ' : '✓ ') + pass + ' checks passed');
process.exit(failn ? 1 : 0);
