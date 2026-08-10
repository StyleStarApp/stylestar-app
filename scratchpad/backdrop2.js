// Her picks, 2026-08-10: the exact Curated-by-Catherine turquoise on the Edit,
// and a range of golds on Your Wardrobe List (she suspects gold may go brown).
// Every gold shown is one already in use somewhere in the app, so nothing here
// invents a new brand colour.
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

const SEED = () => localStorage.setItem('ss_data', JSON.stringify({
  userName: 'Cath', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y',
}));

const PAGES = [
  { key: 'edit2', title: 'STYLE STAR EDIT', open: 'showDream()', note: 'her pick: the Curated-by-Catherine turquoise',
    opts: [
      { label: 'Current', css: null },
      { label: 'Curated-by turquoise  #0FA6B6', css: '#0FA6B6' },
    ] },
  { key: 'wardrobe2', title: 'YOUR WARDROBE LIST', open: "openWardrobe('list')", note: 'gold range, every one already used in the app',
    opts: [
      { label: 'Current', css: null },
      { label: 'A — Star gold  #E0B84C  (lightest)', css: '#E0B84C' },
      { label: 'B — Menu-bar gold  #D8A52E', css: '#D8A52E' },
      { label: 'C — Rail gold  #CFA02E', css: '#CFA02E' },
      { label: 'D — Rim gold  #C99A2C  (deepest)', css: '#C99A2C' },
      { label: 'E — Deep gold  #C8971E', css: '#C8971E' },
    ] },
];

const W = 390, H = 470, SCALE = 2;

for (const page of PAGES) {
  const shots = []; const seen = new Map();
  for (const opt of page.opts) {
    const p = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
    await p.goto(base + '/', { waitUntil: 'load' });
    await p.evaluate(SEED);
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(2600);
    await p.evaluate(f => { try { eval(f); } catch (e) {} }, page.open);
    await p.waitForTimeout(700);
    const bg = await p.evaluate(c => {
      if (c) { document.documentElement.style.background = c; document.body.style.background = c; }
      return getComputedStyle(document.body).backgroundColor;
    }, opt.css);
    await p.waitForTimeout(150);
    shots.push({ label: opt.label, buf: (await p.screenshot()).toString('base64') });
    if (seen.has(bg)) throw new Error(`${page.key}: "${opt.label}" is identical to "${seen.get(bg)}"`);
    seen.set(bg, opt.label);
    console.log(`  ${page.key.padEnd(11)} ${opt.label.padEnd(36)} -> ${bg}`);
    await p.close();
  }

  const canvasPage = await browser.newPage({ viewport: { width: 100, height: 100 } });
  const out = await canvasPage.evaluate(async ({ shots, title, note, W, H, SCALE }) => {
    const PAD = 18, LABEL = 46, HEAD = 74, COLS = 2;
    const rows = Math.ceil(shots.length / COLS);
    const cw = W * SCALE, ch = H * SCALE;
    const c = document.createElement('canvas');
    c.width = PAD + (cw + PAD) * COLS;
    c.height = HEAD + (LABEL + ch + PAD) * rows;
    const x = c.getContext('2d');
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#111'; x.font = 'bold 34px system-ui, sans-serif';
    x.fillText(title, PAD, 44);
    const tw = x.measureText(title).width;
    x.fillStyle = '#777'; x.font = '22px system-ui, sans-serif';
    x.fillText(note, PAD + tw + 24, 44);
    for (let i = 0; i < shots.length; i++) {
      const img = new Image(); img.src = 'data:image/png;base64,' + shots[i].buf; await img.decode();
      const col = i % COLS, row = Math.floor(i / COLS);
      const px = PAD + col * (cw + PAD);
      const py = HEAD + row * (LABEL + ch + PAD);
      x.fillStyle = '#111'; x.font = 'bold 26px system-ui, sans-serif';
      x.fillText(shots[i].label, px, py + 30);
      x.drawImage(img, px, py + LABEL, cw, ch);
      x.strokeStyle = '#ddd'; x.lineWidth = 2; x.strokeRect(px, py + LABEL, cw, ch);
    }
    return c.toDataURL('image/png');
  }, { shots, title: page.title, note: page.note, W, H, SCALE });
  fs.writeFileSync(path.join(ROOT, 'scratchpad', `backdrop-${page.key}.png`), Buffer.from(out.split(',')[1], 'base64'));
  await canvasPage.close();
  console.log(`  -> wrote backdrop-${page.key}.png\n`);
}
await browser.close(); server.close();
console.log('done, all options proven distinct');
