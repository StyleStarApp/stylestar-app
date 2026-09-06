#!/usr/bin/env node
/**
 * store-draft.js — DRAFT A NEW STORE'S TAGS FROM THE ONES CATH ALREADY WROTE.
 *
 * Cath, 2026-09-07: "I want to be able to get approved for more affiliates and
 * be able to add them without having to go through all."
 *
 * Adding a merchant is four edits and three are mechanical (the MID→name map,
 * BUILD_MIDS, the search-domain list). The only real cost is the STORES entry:
 * price tier, archetype, sizes carried, TEN dimension scores, category
 * strengths. This turns that from a blank form into a two-minute review.
 *
 * ▶▶ IT DOES NOT BREAK "NEVER INVENT A STORE'S TAGS". That rule (the Garnet
 * Hill lesson) is about inventing SILENTLY. Every number here is the MEDIAN of
 * stores SHE scored, each neighbour is named on screen, and nothing is written
 * to any file — it prints a line for her to approve, change, or throw away.
 * ⚠️ If she does not recognise the neighbours, the draft is wrong. That is the
 * whole point of printing them.
 *
 * Usage:
 *   node scripts/store-draft.js "Anthropologie" --like "Free People,Madewell,Boden"
 *   node scripts/store-draft.js "Some Boutique" --tier '$$$' --arch "Modern Minimalist"
 *   node scripts/store-draft.js --list            # every store she has tagged
 */
// ⚠️ package.json sets "type":"module", so this is ESM, not CommonJS.
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HTML = path.join(ROOT, 'index.html');

const DIMS = ['relaxed','alluring','polish','classic','trendy','casual','dressy','fitted','neutral','colorful'];

// ⚠️ Read ONLY the STORES table out of index.html, never the whole file into a
// summary. The file is ~905KB; this pulls the one object literal it needs.
function loadStores() {
  const src = fs.readFileSync(HTML, 'utf8');
  const start = src.indexOf('const STORES=');
  if (start < 0) throw new Error('STORES table not found in index.html');
  // Walk braces from the first { after the '=' to find the literal's end.
  // ⚠️⚠️ COMMENTS MUST BE SKIPPED, NOT JUST STRINGS. The STORES table is full of
  // Cath's prose, and one apostrophe in a comment ("don't", "Cath's") opens a
  // string that never closes, so the walker runs to the end of a 905KB file and
  // returns garbage. Found the first time this ran.
  let i = src.indexOf('{', start), depth = 0, end = -1, inStr = null, esc = false, inLine = false, inBlock = false;
  for (let j = i; j < src.length; j++) {
    const c = src[j], n = src[j + 1];
    if (inLine) { if (c === '\n') inLine = false; continue; }
    if (inBlock) { if (c === '*' && n === '/') { inBlock = false; j++; } continue; }
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '/' && n === '/') { inLine = true; j++; continue; }
    if (c === '/' && n === '*') { inBlock = true; j++; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { end = j; break; } }
  }
  if (end < 0) throw new Error('could not find the end of the STORES literal');
  const literal = src.slice(i, end + 1);
  // eslint-disable-next-line no-new-func
  return new Function('return (' + literal + ')')();
}

function median(nums) {
  const a = nums.slice().sort((x, y) => x - y);
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2);
}

const args = process.argv.slice(2);
const stores = loadStores();
const tagged = Object.keys(stores).filter(k => stores[k] && Array.isArray(stores[k].d) && stores[k].d.length === 10);

if (args.includes('--list') || !args.length) {
  console.log(`${tagged.length} stores carry Cath's own dimension scores:\n`);
  tagged.sort().forEach(k => {
    const s = stores[k];
    console.log(`  ${k.padEnd(28)} ${String(s.t || '').padEnd(5)} ${s.a || ''}`);
  });
  console.log('\nUsage: node scripts/store-draft.js "New Store" --like "Store A,Store B,Store C"');
  process.exit(0);
}

const name = args[0];
const getOpt = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
const likeRaw = getOpt('--like');

if (stores[name]) {
  console.log(`\n⚠️  "${name}" is ALREADY in the STORES table. Her tags, unchanged:\n`);
  console.log('   ' + JSON.stringify(stores[name], null, 1).replace(/\n/g, '\n   '));
  console.log('\n   Nothing to draft. If it needs changing, that is her call, not this script\'s.\n');
  process.exit(0);
}

if (!likeRaw) {
  console.log(`\n▶ To draft "${name}", name the stores it most resembles — ones SHE has already scored.\n`);
  console.log('  node scripts/store-draft.js "' + name + '" --like "Store A,Store B,Store C"\n');
  console.log('  (--list shows all ' + tagged.length + ' she has tagged.)\n');
  process.exit(1);
}

const like = likeRaw.split(',').map(s => s.trim()).filter(Boolean);
const missing = like.filter(k => !stores[k] || !Array.isArray(stores[k].d));
if (missing.length) {
  console.log('\n🚨 These are not stores she has scored, so nothing can be anchored to them:');
  missing.forEach(m => {
    const near = tagged.filter(k => k.toLowerCase().includes(m.toLowerCase().slice(0, 5)));
    console.log(`   "${m}"` + (near.length ? `  — did you mean: ${near.slice(0, 4).join(', ')}?` : ''));
  });
  console.log('\n   Run --list to see the exact spellings.\n');
  process.exit(1);
}

// ── the draft ──────────────────────────────────────────────────────────────
const d = DIMS.map((_, i) => median(like.map(k => stores[k].d[i])));
const tiers = like.map(k => stores[k].t).filter(Boolean);
const tier = getOpt('--tier') || tiers.sort((a, b) =>
  tiers.filter(t => t === a).length - tiers.filter(t => t === b).length).pop() || '$$$';
const sizes = Array.from(new Set([].concat(...like.map(k => stores[k].s || []))));
const arch = getOpt('--arch') || stores[like[0]].a || '';

console.log(`\n${'═'.repeat(72)}`);
console.log(`  DRAFT TAGS FOR: ${name}`);
console.log(`${'═'.repeat(72)}`);
console.log(`\n  Every number below is the MEDIAN of these stores, which YOU scored:\n`);
like.forEach(k => console.log(`     · ${k.padEnd(26)} ${String(stores[k].t || '').padEnd(5)} ${stores[k].a || ''}`));
console.log(`\n  ⚠️  If those do not feel like the right comparison, the draft is wrong.`);
console.log(`      That is exactly why they are printed.\n`);
console.log(`  ${'DIMENSION'.padEnd(12)} ${'DRAFT'.padStart(5)}   ${like.map(k => k.slice(0, 10).padStart(11)).join('')}`);
console.log(`  ${'-'.repeat(12)} ${'-'.repeat(5)}   ${like.map(() => '-'.repeat(11)).join('')}`);
DIMS.forEach((dim, i) => {
  console.log(`  ${dim.padEnd(12)} ${String(d[i]).padStart(5)}   ` +
    like.map(k => String(stores[k].d[i]).padStart(11)).join(''));
});
console.log(`\n  price tier   ${String(tier).padStart(5)}   ` + like.map(k => String(stores[k].t || '').padStart(11)).join(''));
console.log(`  sizes        ${(sizes.length ? sizes.join('/') : '(none)')}`);
console.log(`  archetype    ${arch}`);

console.log(`\n${'─'.repeat(72)}`);
console.log(`  THE LINE TO PASTE INTO THE STORES TABLE, once you are happy with it:`);
console.log(`${'─'.repeat(72)}\n`);
console.log(`  '${name}':{u:'PUT THE SEARCH URL HERE',t:'${tier}',a:'${arch}',` +
  `s:[${sizes.map(x => `'${x}'`).join(',')}],d:[${d.join(',')}],c:'WHAT IT IS BEST FOR'},\n`);
console.log(`  ▶ Two blanks are deliberately left for you: the SEARCH URL (verify it in`);
console.log(`    your own address bar — half these sites block us) and what the store is`);
console.log(`    BEST FOR, which is stylist knowledge no median can supply.\n`);
console.log(`  ⚠️  NOTHING HAS BEEN WRITTEN. This printed a suggestion; you decide.\n`);
