// Regenerate the /faq FAQPage schema from the REAL rendered page.
// Standing rule (CLAUDE.md 2026-08-26): read it live with a headless browser
// reading textContent -- never hand-type or hand-edit the JSON, or the schema
// silently drifts from what a visitor sees (which is exactly what happened
// after the 08-29 and 08-31 copy edits).
//
// Two details this script gets right that the 08-26 pass did not:
//  1. <br><br> inside an answer becomes a SPACE, not a join -- otherwise
//     "...train it.Your chats..." and the text stops matching the page.
//  2. NO trailing period is appended. The 08-26 extractor added one to every
//     answer, which produced `...conversation.".` on the two answers that end
//     in a quoted sentence. Take the page's text exactly as it reads.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
import http from 'http'; import fs from 'fs'; import path from 'path';

const root = process.cwd();
const srv = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]) === '/' ? 'index.html' : req.url.split('?')[0]);
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('nope'); }
    const ext = path.extname(f);
    res.writeHead(200, { 'content-type': ext === '.html' ? 'text/html' : ext === '.png' ? 'image/png' : 'text/plain' });
    res.end(d);
  });
});
await new Promise(r => srv.listen(8931, r));

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const pg = await b.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e)));
await pg.goto('http://localhost:8931/', { waitUntil: 'domcontentloaded' });
// The FAQ screen is a hidden div until shown. Show it, so we are reading a
// genuinely rendered page rather than a display:none element.
await pg.evaluate(() => showFAQ());
await pg.waitForTimeout(400);

const qa = await pg.evaluate(() => {
  const out = [];
  document.querySelectorAll('#s-faq .faq-item').forEach(item => {
    const qEl = item.querySelector('.faq-q'), aEl = item.querySelector('.faq-a');
    if (!qEl || !aEl) return;
    // innerText, NOT textContent. These answers contain <div> and <ol><li>
    // blocks; textContent welds them together with no separator, producing
    // "Open stylestar.app in Safari.Tap the Share icon". innerText respects
    // the rendered block boundaries and gives real line breaks, which we then
    // collapse to single spaces. This is why the screen must be SHOWN first --
    // innerText is empty for a display:none element.
    const clean = el => el.innerText.replace(/\s+/g, ' ').trim();
    out.push({ q: clean(qEl), a: clean(aEl), visible: aEl.offsetHeight > 0 });
  });
  return out;
});

await b.close(); srv.close();

if (errs.length) { console.error('JS ERRORS:', errs); process.exit(1); }
if (!qa.length) { console.error('FATAL: no .faq-item found -- refusing to write an empty schema'); process.exit(1); }
const hidden = qa.filter(x => !x.visible).length;
if (hidden) { console.error(`FATAL: ${hidden} answers measured 0 height (screen not rendered)`); process.exit(1); }

const schema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: qa.map(x => ({
    '@type': 'Question',
    name: x.q,
    acceptedAnswer: { '@type': 'Answer', text: x.a },
  })),
};
fs.writeFileSync('scratchpad/faq-schema.json', JSON.stringify(schema, null, 6));
console.log(`Extracted ${qa.length} Q&A pairs from the rendered page.`);
qa.forEach((x, i) => console.log(`  ${String(i + 1).padStart(2)}. ${x.q}`));
