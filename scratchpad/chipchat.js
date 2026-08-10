// Would the Menu chip fit on Ask your Stylist? Force it visible on s-chat and
// measure it against the chat's own header, with and without a safe-area inset,
// and with the keyboard-style viewport shrink that typing causes on iOS.
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

for (const w of [390, 360]) {
  const page = await browser.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2 });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => { try { openChat(); } catch (e) {} });
  await page.waitForTimeout(700);

  const r = await page.evaluate(() => {
    // force the chip on, exactly as it would be if we simply stopped hiding it
    document.body.classList.remove('menu-hidechip');
    const chip = document.getElementById('menuChip');
    const star = document.querySelector('#s-chat .chat-hdr-star');
    const title = document.querySelector('#s-chat .chat-hdr-title');
    const sub = document.querySelector('#s-chat .chat-hdr-sub');
    const back = document.querySelector('#s-chat .chat-close');
    const rect = e => { const b = e.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom) }; };
    const hit = (a, b) => !(a.r <= b.l || a.l >= b.r || a.b <= b.t || a.t >= b.b);
    const c = rect(chip);
    const out = { chip: c, chipVisible: getComputedStyle(chip).display !== 'none' };
    for (const [k, el] of [['star', star], ['title', title], ['sub', sub], ['back', back]]) {
      if (!el) { out[k] = null; continue; }
      const q = rect(el);
      out[k] = { box: q, overlaps: hit(c, q), vGap: q.t - c.b };
    }
    return out;
  });
  console.log(`\n=== ${w}px, no safe-area inset (the worst case: chip sits highest) ===`);
  console.log('  chip', JSON.stringify(r.chip));
  for (const k of ['star', 'title', 'sub', 'back']) {
    if (r[k]) console.log(`  vs ${k.padEnd(5)} overlaps=${r[k].overlaps}  vertical gap=${r[k].vGap}px  ${JSON.stringify(r[k].box)}`);
  }
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', `chipchat-${w}.png`), clip: { x: 0, y: 0, width: w, height: 320 } });
  await page.close();
}
await browser.close(); server.close();
