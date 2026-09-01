// Guarantee: every question and answer in the /faq FAQPage schema appears
// VERBATIM as visible text on the rendered page. This is the check that would
// have caught the 08-29 and 08-31 drift, so it exists now rather than living
// only as a comment. Re-run after ANY edit to the FAQ copy.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
import http from 'http'; import fs from 'fs'; import path from 'path';

// Pull the live schema object straight out of the edge function source.
const src = fs.readFileSync('netlify/edge-functions/page-titles.js', 'utf8');
const faq = src.indexOf("  '/faq': {");
const st = src.indexOf('    schema:', faq); const br = src.indexOf('{', st);
let d = 0, end = 0;
for (let i = br; i < src.length; i++) {
  if (src[i] === '{') d++; else if (src[i] === '}') { d--; if (!d) { end = i + 1; break; } }
}
const schema = JSON.parse(src.slice(br, end));

const root = process.cwd();
const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(root, u === '/' ? 'index.html' : u);
  fs.readFile(f, (e, dd) => {
    if (e) { res.writeHead(404); return res.end(''); }
    res.writeHead(200, { 'content-type': path.extname(f) === '.html' ? 'text/html' : 'text/plain' });
    res.end(dd);
  });
});
await new Promise(r => srv.listen(8932, r));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const pg = await b.newPage();
const errs = []; pg.on('pageerror', e => errs.push(String(e)));
await pg.goto('http://localhost:8932/', { waitUntil: 'domcontentloaded' });
await pg.evaluate(() => showFAQ());
await pg.waitForTimeout(400);
const vis = await pg.evaluate(() => {
  const el = document.getElementById('s-faq');
  return { text: el.innerText.replace(/\s+/g, ' ').trim(), h: el.offsetHeight };
});
await b.close(); srv.close();

let pass = 0, fail = 0;
const bad = [];
if (vis.h === 0) { console.error('FATAL: #s-faq not rendered'); process.exit(1); }
for (const e of schema.mainEntity) {
  for (const [kind, t] of [['Q', e.name], ['A', e.acceptedAnswer.text]]) {
    const norm = t.replace(/\s+/g, ' ').trim();
    if (vis.text.includes(norm)) pass++;
    else { fail++; bad.push(`${kind} not on page: ${e.name.slice(0, 55)}`); }
  }
}
console.log(`schema questions: ${schema.mainEntity.length}`);
console.log(`verbatim on rendered page: ${pass}/${pass + fail}`);
bad.forEach(x => console.log('  MISMATCH ' + x));
if (errs.length) console.log('JS ERRORS: ' + errs.join(' | '));
console.log(fail === 0 && !errs.length ? '\nPASS' : '\nFAIL');
process.exit(fail === 0 && !errs.length ? 0 : 1);
