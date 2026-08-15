// csvjoin.js — the split-catalog join step (2026-08-15).
// The catalog arrives from Cowork in numbered parts plus a manifest, because
// Cowork can upload small files to Drive but not large ones. A PARTIAL catalog
// is the dangerous case: it converts perfectly and silently loses products, so
// every one of these failures must STOP the run and leave products.json alone.
// Run: NODE_PATH=/opt/node22/lib/node_modules node scratchpad/csvjoin.js
import { execFileSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const ROOT = path.resolve(import.meta.dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'products-from-csv.js');
const PARTS = path.join(ROOT, 'data', 'parts');
let pass = 0, failn = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { failn++; console.log('  ✗ FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
// ⚠️ spawnSync, not execFileSync: execFileSync returns ONLY stdout on success,
// so a console.warn (which goes to stderr) is invisible unless the command
// also fails. That cost two false failures on the body-talk guard, which was
// working perfectly the whole time. Capture BOTH streams, always.
function run(arg) {
  const r = spawnSync('node', [SCRIPT, arg], { encoding: 'utf8' });
  return { code: r.status, out: String(r.stdout || '') + String(r.stderr || '') };
}
// Every failure case runs against a COPY, and products.json is fingerprinted
// before and after so "it refused" is proven, not assumed.
function sandbox(mutate) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'join-'));
  fs.readdirSync(PARTS).forEach(f => fs.copyFileSync(path.join(PARTS, f), path.join(dir, f)));
  if (mutate) mutate(dir);
  const before = crypto.createHash('md5').update(fs.readFileSync(path.join(ROOT, 'products.json'))).digest('hex');
  const r = run(dir);
  const after = crypto.createHash('md5').update(fs.readFileSync(path.join(ROOT, 'products.json'))).digest('hex');
  return { ...r, untouched: before === after, dir };
}
const M = 'style-star-products-MANIFEST.txt';
const P1 = 'style-star-products-1of3.csv', P2 = 'style-star-products-2of3.csv', P3 = 'style-star-products-3of3.csv';

console.log('The real export');
const good = run(PARTS);
ok('joins the three real parts and converts', good.code === 0 && /107 products/.test(good.out), good.out.slice(-200));
ok('reports the manifest md5 as verified', /md5 585c84235950ce0394abb68912b1bc0d ✓/.test(good.out));
ok('the joined row count matches the manifest', /joined 3 parts → 107 data rows/.test(good.out));
ok('the new dr1 dresses slot really landed', /dr1:15/.test(good.out), good.out.slice(-120));
ok('pointing at the MANIFEST works as well as the folder',
  run(path.join(PARTS, M)).code === 0);
ok('a single joined CSV still converts, as before',
  run(path.join(ROOT, 'data', 'style-star-products.csv')).code === 0);

console.log('Every way it can go wrong');
let r = sandbox(d => fs.unlinkSync(path.join(d, P2)));
ok('a MISSING part stops the run', r.code !== 0);
ok('...and names the file that is missing', /not on disk/.test(r.out) && r.out.includes(P2), r.out.slice(0, 160));
ok('...and products.json is untouched', r.untouched);

// The most dangerous case: a part that is real but SHORT. Row count catches it.
r = sandbox(d => {
  const f = path.join(d, P3);
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  fs.writeFileSync(f, lines.slice(0, -6).join('\n') + '\n');
});
ok('★ a TRUNCATED part stops the run (the partial-catalog case)', r.code !== 0);
ok('...and says it is partial, in those words', /PARTIAL catalog/.test(r.out) && /row count mismatch/.test(r.out), r.out.slice(0, 200));
ok('...and products.json is untouched', r.untouched);

// Right parts, wrong order — row count still passes, so only md5 catches this.
r = sandbox(d => {
  const m = fs.readFileSync(path.join(d, M), 'utf8')
    .replace('order: ' + P1 + ', ' + P2 + ', ' + P3, 'order: ' + P1 + ', ' + P3 + ', ' + P2);
  fs.writeFileSync(path.join(d, M), m);
});
ok('★ parts in the WRONG ORDER stop the run (row count alone would pass)', r.code !== 0);
ok('...caught by the md5, and it says so', /md5 mismatch/.test(r.out), r.out.slice(0, 160));
ok('...and products.json is untouched', r.untouched);

// A part missing its trailing newline glues two rows together silently.
r = sandbox(d => {
  const f = path.join(d, P1);
  const b = fs.readFileSync(f);
  fs.writeFileSync(f, b.subarray(0, b.length - 1));
});
ok('★ a part with NO TRAILING NEWLINE stops the run', r.code !== 0);
ok('...and explains it would glue two rows together', /glue its last row/.test(r.out), r.out.slice(0, 200));
ok('...and products.json is untouched', r.untouched);

r = sandbox(d => {
  const hdr = fs.readFileSync(path.join(d, P1), 'utf8').split('\n')[0];
  fs.writeFileSync(path.join(d, P2), hdr + '\n' + fs.readFileSync(path.join(d, P2), 'utf8'));
});
ok('a part 2 carrying its own HEADER stops the run', r.code !== 0);
ok('...and products.json is untouched', r.untouched);

r = sandbox(d => {
  fs.writeFileSync(path.join(d, M), fs.readFileSync(path.join(d, M), 'utf8').replace(/^md5_of_joined_file:.*$/m, ''));
});
ok('a manifest with NO CHECKSUM is refused outright', r.code !== 0 && /Refusing to join without a checksum/.test(r.out));

r = sandbox(d => {
  fs.writeFileSync(path.join(d, M), fs.readFileSync(path.join(d, M), 'utf8').replace('parts: 3', 'parts: 4'));
});
ok('a manifest whose part count disagrees with its own order line is refused',
  r.code !== 0 && /says 4 parts but "order:" lists 3/.test(r.out), r.out.slice(0, 160));

// The manifest is sometimes handed back markdown-escaped ("total\_data\_rows").
r = sandbox(d => {
  fs.writeFileSync(path.join(d, M), fs.readFileSync(path.join(d, M), 'utf8').replace(/_/g, '\\_'));
});
ok('an escaped-underscore manifest is still read correctly', r.code === 0, r.out.slice(0, 160));

console.log('Her body-talk guard');
const warn = run(PARTS);
ok('★ the received export trips the body-talk warning', /name a body, against her standing rule/.test(warn.out), warn.out.slice(-200));
ok('...and names the row and the sheet to fix it in', /p001/.test(warn.out) && /Cowork sheet/.test(warn.out));
ok('...but does NOT fail the convert (they are her words)', warn.code === 0);
// Put the repo back the way it was: the canonical CSV carries her deletion.
execFileSync('git', ['checkout', '--', 'data/style-star-products.csv'], { cwd: ROOT });
const restored = run(path.join(ROOT, 'data', 'style-star-products.csv'));
ok('the canonical CSV (with her deletion) converts clean and warning-free',
  restored.code === 0 && !/name a body/.test(restored.out), restored.out.slice(-160));

console.log('\n' + pass + ' passed, ' + failn + ' failed');
process.exit(failn ? 1 : 0);
