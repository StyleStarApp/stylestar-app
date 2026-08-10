// Her catch: the 11px #FEF6D6 frame is too pale and gets lost. The reason is
// value, not hue -- the pale yellow sits very close to the paper (#FBFAF7) it
// surrounds, so its INNER edge dissolves and only the outer edge (against the
// black velvet) reads at all. Four ways out, rendered for her pick.
// ⚠️ id-scoped injection per option, and each render's computed frame is
// captured so two look-alike options can never both reach her.
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

// A hairline is drawn with box-shadow rather than a second border, so it costs
// ZERO layout width -- the empty-state wishing button has only 13px of headroom.
const OPTS = [
  { key: 'current', label: 'Current — plain 11px pale', css: '' },
  { key: 'gold', label: 'A — pale + gold hairline both edges', css:
    `.ss.wishlist-mirror{box-shadow:0 8px 44px rgba(0,0,0,.16),0 0 0 1px #C89A2C,inset 0 0 0 1px #C89A2C}` },
  { key: 'black', label: 'B — pale + black hairline both edges', css:
    `.ss.wishlist-mirror{box-shadow:0 8px 44px rgba(0,0,0,.16),0 0 0 1px #1a1a1a,inset 0 0 0 1px #1a1a1a}` },
  { key: 'deeper', label: 'C — one deeper gold, no hairline', css:
    `.ss.wishlist-mirror{border-color:#EBD9A0}` },
  { key: 'deepest', label: 'D — the heart’s own gold, no hairline', css:
    `.ss.wishlist-mirror{border-color:#E8CF86}` },
];

const W = 390, H = 560, SCALE = 2;
const shots = []; const seen = new Map();

for (const o of OPTS) {
  const p = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
  await p.goto(base + '/', { waitUntil: 'load' });
  await p.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(2600);
  await p.evaluate(() => openWishlist());
  await p.waitForTimeout(600);
  const sig = await p.evaluate(css => {
    if (css) { const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
    const el = document.querySelector('.ss.wishlist-mirror');
    const cs = getComputedStyle(el);
    return `${cs.borderTopWidth} ${cs.borderTopColor} | ${cs.boxShadow}`;
  }, o.css);
  if (seen.has(sig)) throw new Error(`"${o.label}" renders identically to "${seen.get(sig)}"`);
  seen.set(sig, o.label);
  console.log(`  ${o.label.padEnd(44)} -> ${sig.slice(0, 110)}`);
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
  x.fillText('THE WISHLIST FRAME — giving the pale yellow an edge', PAD, 44);
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
fs.writeFileSync(path.join(ROOT, 'scratchpad', 'wlframe2.png'), Buffer.from(out.split(',')[1], 'base64'));
await cp.close();
console.log('\n-> wrote wlframe2.png (every option proven distinct)');
await browser.close(); server.close();
