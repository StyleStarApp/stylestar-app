// D as built: no bleed, no frame, no stitch, no tab flip. Two things to prove.
// 1. Removing an 11px border gives the rows 22px MORE width, so the narrow-phone
//    trim that was added FOR that frame may no longer be needed. Measure name
//    wraps rather than guess.
// 2. Nothing may overflow sideways, and the content must not end up flush
//    against the screen edge now that the frame is not holding it in.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0].slice(1)));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m); } };

for (const w of [390, 375, 360]) {
  console.log(`\n--- @ ${w} ---`);
  const p = await browser.newPage({ viewport: { width: w, height: 800 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(base + '/', { waitUntil: 'load' });
  await p.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(2600);
  await p.evaluate(() => openWardrobe('list'));
  await p.waitForTimeout(700);
  const m = await p.evaluate(() => {
    const card = document.querySelector('.ss.wardrobe-mirror'), cs = getComputedStyle(card);
    const before = getComputedStyle(card, '::before');
    const names = [...document.querySelectorAll('#s-wardrobe .wdr-item')];
    let wrapped = 0, minGap = Infinity;
    for (const n of names) {
      const t = n.querySelector('.wdr-name') || n.firstElementChild;
      if (!t) continue;
      const rg = document.createRange(); rg.selectNodeContents(t);
      const tops = [...new Set([...rg.getClientRects()].map(r => Math.round(r.top)))];
      if (tops.length > 1) wrapped++;
      const r = n.getBoundingClientRect();
      minGap = Math.min(minGap, r.left, window.innerWidth - r.right);
    }
    return {
      frame: cs.borderTopWidth, shadow: cs.boxShadow, stitch: before.content,
      bleed: getComputedStyle(document.documentElement).backgroundColor,
      cls: document.documentElement.className,
      rows: names.length, wrapped, minGap: Math.round(minGap),
      over: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  ok(m.frame === '0px', `no frame (${m.frame})`);
  ok(m.shadow === 'none', `no drop shadow (${m.shadow})`);
  ok(m.stitch === 'none', `no dashed stitch (content: ${m.stitch})`);
  ok(!/wdr-(gold|black)/.test(m.cls), `no colour bleed class left (${m.cls || 'none'})`);
  ok(!m.over, 'no sideways scroll');
  ok(m.minGap >= 8, `rows keep a breathing gap from the screen edge (${m.minGap}px)`);
  console.log(`      ${m.rows} rows sampled, ${m.wrapped} name(s) wrap`);
  // Trending must look identical now -- that is the whole point of dropping the flip.
  const t = await p.evaluate(() => { wardrobeTab('trend'); return new Promise(r => setTimeout(() => { const c = getComputedStyle(document.querySelector('.ss.wardrobe-mirror')); r({ frame: c.borderTopWidth, bleed: getComputedStyle(document.documentElement).backgroundColor, cls: document.documentElement.className }); }, 400)); });
  ok(t.frame === m.frame && t.bleed === m.bleed, 'Trending is the SAME treatment as My List (the flip is gone)');
  ok(!/wdr-(gold|black)/.test(t.cls), 'switching tabs adds no bleed class');
  ok(errs.length === 0, `zero JS errors (${errs.join('; ') || 'none'})`);
  await p.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close(); server.close();
if (fail) process.exit(1);
