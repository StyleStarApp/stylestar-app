// storedraft.js — the new-store tagging helper (scripts/store-draft.js).
// It exists to answer Cath, 2026-09-07: "I want to be able to get approved for
// more affiliates and be able to add them without having to go through all."
// Run: node scratchpad/storedraft.js
import {execFileSync} from 'child_process';
import path from 'path';
import {fileURLToPath} from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let pass = 0, failn = 0;
function ok(n, c, e) { if (c) { pass++; console.log('  ✓ ' + n); } else { failn++; console.log('  ✗ FAIL ' + n + (e ? ' — ' + e : '')); } }
function run(args) {
  try { return {code: 0, out: execFileSync('node', [path.join(ROOT, 'scripts', 'store-draft.js'), ...args], {encoding: 'utf8'})}; }
  catch (e) { return {code: e.status, out: String(e.stdout || '') + String(e.stderr || '')}; }
}

// ⚠️ THE ONE THAT ACTUALLY BROKE: the STORES literal is full of Cath's prose,
// and a single apostrophe in a comment ("don't") opened a string the brace
// walker never closed, so it ran off the end of a 905KB file.
let r = run(['--list']);
ok('it parses the REAL STORES table out of index.html', r.code === 0 && /stores carry/.test(r.out), r.out.slice(0, 200));
const n = (r.out.match(/^(\d+) stores carry/m) || [])[1];
ok('and finds the whole table, not a truncated prefix', Number(n) > 100, 'found ' + n);
ok('an apostrophe in a comment does not derail it', !/undefined|SyntaxError/.test(r.out));

r = run(['Under Armour', '--like', 'Athleta,Alo Yoga,Lululemon']);
ok('it drafts from stores she scored', r.code === 0 && /DRAFT TAGS FOR: Under Armour/.test(r.out));
ok('every dimension is drafted', (r.out.match(/^  (relaxed|alluring|polish|classic|trendy|casual|dressy|fitted|neutral|colorful) /gm) || []).length === 10);
// medians of Athleta/Alo/Lululemon: casual 10/10/10 -> 10, dressy 2/3/2 -> 2
ok('the numbers really are the median of her own scores', /casual\s+10\s/.test(r.out) && /dressy\s+2\s/.test(r.out));
ok('▶ it NAMES the neighbours, so she can reject the comparison',
  /Athleta/.test(r.out) && /Alo Yoga/.test(r.out) && /Lululemon/.test(r.out));
ok('it prints a paste-ready STORES line', /'Under Armour':\{u:/.test(r.out));
ok('it leaves the URL blank for her to verify in her own address bar', /PUT THE SEARCH URL HERE/.test(r.out));
ok('it leaves "best for" blank — no median can supply stylist knowledge', /WHAT IT IS BEST FOR/.test(r.out));

// ▶▶ THE GUARANTEE THAT KEEPS "never invent a store's tags" INTACT.
ok('it says plainly that nothing was written', /NOTHING HAS BEEN WRITTEN/.test(r.out));
const before = execFileSync('git', ['status', '--porcelain', 'index.html'], {cwd: ROOT, encoding: 'utf8'});
run(['Another Store', '--like', 'Athleta']);
const after = execFileSync('git', ['status', '--porcelain', 'index.html'], {cwd: ROOT, encoding: 'utf8'});
ok('and it really does not touch index.html', before === after);

r = run(['Anthropologie', '--like', 'Athleta']);
ok('it refuses to redraft a store she has ALREADY tagged', /ALREADY in the STORES table/.test(r.out));

r = run(['X', '--like', 'lululemon']);
ok('a misspelled neighbour is refused, not silently guessed', r.code !== 0 && /not stores she has scored/.test(r.out));
ok('and it suggests the right spelling', /did you mean: Lululemon/.test(r.out));

r = run(['X']);
ok('with no neighbours it asks rather than inventing', r.code !== 0 && /name the stores it most resembles/.test(r.out));

console.log(`\n${pass} passed, ${failn} failed`);
process.exit(failn ? 1 : 0);
