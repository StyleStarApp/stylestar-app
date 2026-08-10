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

const probe = () => {
  const tag = document.querySelector('.hdr .tag');
  const hdr = document.querySelector('.hdr');
  const rg = document.createRange(); rg.selectNodeContents(tag);
  const rects = [...rg.getClientRects()].map(r => ({ t: Math.round(r.top), w: Math.round(r.width) }));
  const tops = [...new Set(rects.map(r => r.t))];
  const tr = tag.getBoundingClientRect();
  const cs = getComputedStyle(tag);
  return {
    hdrDisplay: getComputedStyle(hdr).display,
    hdrH: Math.round(hdr.getBoundingClientRect().height),
    tagH: Math.round(tr.height), lineH: cs.lineHeight, fs: cs.fontSize,
    visualLines: tops.length, rectCount: rects.length, rects,
    tagW: Math.round(tr.width),
    ssCount: document.querySelectorAll('.ss').length,
  };
};

for (const w of [390, 360, 320]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  for (const [label, fn] of [['welcome', null], ['story', 'showStory()'], ['faq', 'showFAQ()']]) {
    if (fn) { await page.evaluate(f => eval(f), fn); await page.waitForTimeout(350); }
    const m = await page.evaluate(probe);
    console.log(w, label, JSON.stringify(m));
  }
  await page.close();
}
await browser.close(); server.close();
