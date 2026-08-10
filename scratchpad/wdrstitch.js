// Her question on top of picking D: "do we keep just the stitches though?"
// The stitch used to sit INSIDE a frame, where it read as a sewn detail on the
// paper. With the frame gone it becomes the only line on the page, so it has to
// carry itself. ⚠️ The risk: a dashed rectangle with nothing inside it to frame
// reads as the UI convention for an EMPTY/placeholder box.
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
const ST = '.ss.wardrobe-mirror::before';
const OPTS = [
  { label: 'A — stitches as they are (2px #4a453c)', css: '' },
  { label: 'B — stitches lightened (1px, soft taupe)', css: `${ST}{border:1px dashed #C9C2B2!important}` },
  { label: 'C — no stitches at all', css: `${ST}{display:none!important}` },
];
const W = 390, H = 620, SCALE = 2;
for (const tab of ['list', 'trend']) {
  const shots = []; const seen = new Map();
  for (const o of OPTS) {
    const p = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
    await p.goto(base + '/', { waitUntil: 'load' });
    await p.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(2600);
    await p.evaluate(t => openWardrobe(t), tab);
    await p.waitForTimeout(700);
    const sig = await p.evaluate(css => {
      if (css) { const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
      const b = getComputedStyle(document.querySelector('.ss.wardrobe-mirror'), '::before');
      return `${b.display} ${b.borderTopWidth} ${b.borderTopColor}`;
    }, o.css);
    if (seen.has(sig)) throw new Error(`${tab}: "${o.label}" identical to "${seen.get(sig)}"`);
    seen.set(sig, o.label);
    console.log(`  ${tab.padEnd(5)} ${o.label.padEnd(42)} -> ${sig}`);
    shots.push({ label: o.label, buf: (await p.screenshot()).toString('base64') });
    await p.close();
  }
  const cp = await browser.newPage({ viewport: { width: 100, height: 100 } });
  const out = await cp.evaluate(async ({ shots, title, W, H, SCALE }) => {
    const PAD = 20, LABEL = 46, HEAD = 64;
    const cw = W * SCALE, ch = H * SCALE;
    const c = document.createElement('canvas');
    c.width = PAD + (cw + PAD) * shots.length;
    c.height = HEAD + LABEL + ch + PAD;
    const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#111'; x.font = 'bold 34px system-ui, sans-serif';
    x.fillText(title, PAD, 44);
    for (let i = 0; i < shots.length; i++) {
      const img = new Image(); img.src = 'data:image/png;base64,' + shots[i].buf; await img.decode();
      const px = PAD + i * (cw + PAD);
      x.fillStyle = '#111'; x.font = 'bold 24px system-ui, sans-serif';
      x.fillText(shots[i].label, px, HEAD + 30);
      x.drawImage(img, px, HEAD + LABEL, cw, ch);
      x.strokeStyle = '#ddd'; x.lineWidth = 2; x.strokeRect(px, HEAD + LABEL, cw, ch);
    }
    return c.toDataURL('image/png');
  }, { shots, title: tab === 'list' ? 'MY LIST (D built) — do the stitches stay?' : "WHAT'S TRENDING (D built) — do the stitches stay?", W, H, SCALE });
  fs.writeFileSync(path.join(ROOT, 'scratchpad', `wdrstitch-${tab}.png`), Buffer.from(out.split(',')[1], 'base64'));
  await cp.close();
  console.log(`  -> wrote wdrstitch-${tab}.png\n`);
}
await browser.close(); server.close();
console.log('rendered, every option proven distinct');
