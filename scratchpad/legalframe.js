// Her catch: the FAQ/Terms/Privacy frame "looks not symmetrical."
// ▶ She is literally right, and it is not a feeling: the frame is painted with
// linear-gradient(135deg,...) on border-box, so the top-left of the frame is
// pale #F3E6B8 and the bottom-right is #E8CE7E with a dark #B8891F band across
// it. Opposite sides of the same frame are DIFFERENT COLOURS by construction.
// She wants one flat colour. Two open questions this renders for her:
// which gold, and whether the silver inner band stays.
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

const FLAT = c => `.ss.faq-mirror{background:#fff!important;border:8px solid ${c}!important}`;
const OPTS = [
  { label: 'Current — the 135° gradient', css: '' },
  { label: 'A — flat #DFB94E + silver', css: FLAT('#DFB94E') },
  { label: 'B — flat #D8A52E + silver', css: FLAT('#D8A52E') },
  { label: 'C — flat #DFB94E, no silver', css: FLAT('#DFB94E') + '.ss.faq-mirror{box-shadow:0 7px 40px rgba(0,0,0,.18)!important}' },
  { label: 'D — flat #E0B84C + silver', css: FLAT('#E0B84C') },
];

const W = 390, H = 460, SCALE = 2;
const shots = []; const seen = new Map();

for (const o of OPTS) {
  const p = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
  await p.goto(base + '/', { waitUntil: 'load' });
  await p.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(2600);
  await p.evaluate(() => showFAQ());
  await p.waitForTimeout(500);
  const sig = await p.evaluate(css => {
    if (css) { const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
    const el = document.querySelector('.ss.faq-mirror'), cs = getComputedStyle(el);
    return `${cs.borderTopColor} | ${cs.backgroundImage.slice(0, 60)} | ${cs.boxShadow.slice(0, 50)}`;
  }, o.css);
  if (seen.has(sig)) throw new Error(`"${o.label}" renders identically to "${seen.get(sig)}"`);
  seen.set(sig, o.label);
  console.log(`  ${o.label.padEnd(32)} -> ${sig}`);
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
  x.fillText('FAQ / TERMS / PRIVACY — one flat colour instead of the gradient', PAD, 44);
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
fs.writeFileSync(path.join(ROOT, 'scratchpad', 'legalframe.png'), Buffer.from(out.split(',')[1], 'base64'));
await cp.close();
console.log('\n-> wrote legalframe.png (every option proven distinct)');
await browser.close(); server.close();
