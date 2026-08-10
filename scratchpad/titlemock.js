// Her idea: work the logo INTO the heading, so the stitched tag disappears
// entirely rather than being restyled.
//   "Catherine's style Star Wardrobe List"  /  "My style Star Wardrobe List"
// The risk is length -- the current title already runs near full width, so this
// measures how each version wraps before anything is built.
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

const HIDE_TAG = '#s-wardrobe .wdr-tagwrap{display:none!important}';

const OPTS = [
  { label: 'Current — tag + "Catherine’s Wardrobe List"', title: null, hide: false },
  { label: 'A — "Catherine’s style Star Wardrobe List"', title: 'Catherine’s style Star Wardrobe List', hide: true },
  { label: 'B — no name: "My style Star Wardrobe List"', title: 'My style Star Wardrobe List', hide: true },
  { label: 'C — shorter: "Catherine’s style Star Wardrobe"', title: 'Catherine’s style Star Wardrobe', hide: true },
];

const W = 390, H = 420, SCALE = 2;

for (const w of [390, 375, 360]) {
  console.log(`\n=== ${w}px ===`);
  const shots = [];
  for (const o of OPTS) {
    const p = await browser.newPage({ viewport: { width: w, height: H }, deviceScaleFactor: SCALE });
    await p.goto(base + '/', { waitUntil: 'load' });
    await p.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(2600);
    await p.evaluate(() => openWardrobe('list'));
    await p.waitForTimeout(700);
    const m = await p.evaluate(({ title, hide, HIDE_TAG }) => {
      if (hide) { const st = document.createElement('style'); st.textContent = HIDE_TAG; document.head.appendChild(st); }
      const t = document.getElementById('wdrTitle');
      if (title) t.textContent = title;
      const rg = document.createRange(); rg.selectNodeContents(t);
      const tops = [...new Set([...rg.getClientRects()].map(r => Math.round(r.top)))];
      const host = t.parentElement.getBoundingClientRect();
      const tr = t.getBoundingClientRect();
      return { text: t.textContent, lines: tops.length,
               widest: Math.max(...[...rg.getClientRects()].map(r => Math.round(r.width))),
               avail: Math.round(host.width), fits: tr.width <= host.width + 0.5 };
    }, { title: o.title, hide: o.hide, HIDE_TAG });
    console.log(`  ${o.label.padEnd(48)} -> ${m.lines} line(s), widest ${m.widest}px of ${m.avail}px`);
    if (w === 390) shots.push({ label: o.label, buf: (await p.screenshot()).toString('base64') });
    await p.close();
  }
  if (w === 390) {
    const cp = await browser.newPage({ viewport: { width: 100, height: 100 } });
    const out = await cp.evaluate(async ({ shots, W, H, SCALE }) => {
      const PAD = 18, LABEL = 44, HEAD = 60;
      const cw = W * SCALE, ch = H * SCALE, COLS = 2;
      const rows = Math.ceil(shots.length / COLS);
      const c = document.createElement('canvas');
      c.width = PAD + (cw + PAD) * COLS;
      c.height = HEAD + (LABEL + ch + PAD) * rows;
      const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      x.fillStyle = '#111'; x.font = 'bold 32px system-ui, sans-serif';
      x.fillText('LOGO WORKED INTO THE HEADING', PAD, 40);
      for (let i = 0; i < shots.length; i++) {
        const img = new Image(); img.src = 'data:image/png;base64,' + shots[i].buf; await img.decode();
        const col = i % COLS, row = Math.floor(i / COLS);
        const px = PAD + col * (cw + PAD), py = HEAD + row * (LABEL + ch + PAD);
        x.fillStyle = '#111'; x.font = 'bold 23px system-ui, sans-serif';
        x.fillText(shots[i].label, px, py + 28);
        x.drawImage(img, px, py + LABEL, cw, ch);
        x.strokeStyle = '#ddd'; x.lineWidth = 2; x.strokeRect(px, py + LABEL, cw, ch);
      }
      return c.toDataURL('image/png');
    }, { shots, W, H, SCALE });
    fs.writeFileSync(path.join(ROOT, 'scratchpad', 'logo-title.png'), Buffer.from(out.split(',')[1], 'base64'));
    await cp.close();
    console.log('  -> wrote logo-title.png');
  }
}
await browser.close(); server.close();
