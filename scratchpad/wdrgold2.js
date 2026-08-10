// Her catch: the My List bleed (#E0B84C) reads too gold, and she wants the
// YELLOW tone she sees on the FAQ frame. That frame is a gradient, so "the FAQ
// yellow" is not one value -- these are its actual stops, rendered as the bleed
// so she can pick the exact one.
//   linear-gradient(135deg,#F3E6B8 0%,#DFB94E 32%,#B8891F 62%,#E8CE7E 100%)
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

const OPTS = [
  { key: 'current', label: 'Current — #E0B84C', css: '' },
  { key: 'a', label: 'A — #E8CE7E (FAQ soft yellow)', css: 'html.wdr-gold,html.wdr-gold body{background:#E8CE7E}' },
  { key: 'b', label: 'B — #F3E6B8 (FAQ palest yellow)', css: 'html.wdr-gold,html.wdr-gold body{background:#F3E6B8}' },
  { key: 'c', label: 'C — #EDD98F (between A and B)', css: 'html.wdr-gold,html.wdr-gold body{background:#EDD98F}' },
  { key: 'd', label: 'D — the FAQ gradient itself', css: 'html.wdr-gold,html.wdr-gold body{background:linear-gradient(135deg,#F3E6B8 0%,#DFB94E 32%,#B8891F 62%,#E8CE7E 100%)!important;background-attachment:fixed}' },
];

const W = 390, H = 520, SCALE = 2;
const shots = []; const seen = new Map();

for (const o of OPTS) {
  const p = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
  await p.goto(base + '/', { waitUntil: 'load' });
  await p.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(2600);
  await p.evaluate(() => openWardrobe('list'));
  await p.waitForTimeout(600);
  const sig = await p.evaluate(css => {
    if (css) { const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
    const cs = getComputedStyle(document.documentElement);
    return cs.backgroundImage !== 'none' ? cs.backgroundImage.slice(0, 90) : cs.backgroundColor;
  }, o.css);
  if (seen.has(sig)) throw new Error(`"${o.label}" renders identically to "${seen.get(sig)}"`);
  seen.set(sig, o.label);
  console.log(`  ${o.label.padEnd(34)} -> ${sig}`);
  shots.push({ label: o.label, buf: (await p.screenshot()).toString('base64') });
  await p.close();
}

const cp = await browser.newPage({ viewport: { width: 100, height: 100 } });
const out = await cp.evaluate(async ({ shots, W, H, SCALE }) => {
  const PAD = 20, LABEL = 46, HEAD = 64, COLS = 3;
  const cw = W * SCALE, ch = H * SCALE;
  const rows = Math.ceil(shots.length / COLS);
  const c = document.createElement('canvas');
  c.width = PAD + (cw + PAD) * COLS;
  c.height = HEAD + (LABEL + ch + PAD) * rows;
  const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = '#111'; x.font = 'bold 34px system-ui, sans-serif';
  x.fillText('MY LIST — a yellower bleed, from the FAQ frame’s own colours', PAD, 44);
  for (let i = 0; i < shots.length; i++) {
    const img = new Image(); img.src = 'data:image/png;base64,' + shots[i].buf; await img.decode();
    const col = i % COLS, row = Math.floor(i / COLS);
    const px = PAD + col * (cw + PAD), py = HEAD + row * (LABEL + ch + PAD);
    x.fillStyle = '#111'; x.font = 'bold 24px system-ui, sans-serif';
    x.fillText(shots[i].label, px, py + 30);
    x.drawImage(img, px, py + LABEL, cw, ch);
    x.strokeStyle = '#ddd'; x.lineWidth = 2; x.strokeRect(px, py + LABEL, cw, ch);
  }
  return c.toDataURL('image/png');
}, { shots, W, H, SCALE });
fs.writeFileSync(path.join(ROOT, 'scratchpad', 'wdrgold2.png'), Buffer.from(out.split(',')[1], 'base64'));
await cp.close();
console.log('\n-> wrote wdrgold2.png (every option proven distinct)');
await browser.close(); server.close();
