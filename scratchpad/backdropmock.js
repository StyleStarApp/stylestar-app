// Backdrop options for the four DESTINATION pages (her question, 2026-08-10).
// Renders each page's current state plus three candidate full-bleed backdrops,
// then composites them into one labelled image per page.
//
// ⚠️ Mockup lesson from 2026-07-26: PROVE the variants actually differ before
// sending her anything. Each render's computed html/body background is captured
// and printed, and the script fails loudly if any two options match.
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

// Each page gets three candidates chosen to suit its own frame.
const PAGES = [
  { key: 'edit', title: 'STYLE STAR EDIT', open: 'showDream()', note: 'silver + gold frame',
    opts: [
      { label: 'Current (no backdrop)', css: null },
      { label: 'A — Deep teal  #0E7C88', css: '#0E7C88' },
      { label: 'B — Black velvet  #1a1a1a', css: '#1a1a1a' },
      { label: 'C — Champagne  #E6D9B8', css: '#E6D9B8' },
    ] },
  { key: 'mall', title: 'STYLE STAR MALL', open: 'showShop()', note: 'squared card',
    opts: [
      { label: 'Current (no backdrop)', css: null },
      { label: 'A — Black velvet  #1a1a1a', css: '#1a1a1a' },
      { label: 'B — Warm taupe  #C9B99B', css: '#C9B99B' },
      { label: 'C — Deep teal  #0E7C88', css: '#0E7C88' },
    ] },
  { key: 'wardrobe', title: 'YOUR WARDROBE LIST', open: "openWardrobe('list')", note: 'black frame + graph paper',
    opts: [
      { label: 'Current (no backdrop)', css: null },
      { label: 'A — Warm kraft  #C9B99B', css: '#C9B99B' },
      { label: 'B — Her pink  #F49AC1', css: '#F49AC1' },
      { label: 'C — Black velvet  #1a1a1a', css: '#1a1a1a' },
    ] },
  { key: 'photo', title: 'ANALYZE YOUR OUTFIT', open: 'showPhoto()', note: 'panel already fills the card',
    opts: [
      { label: 'Current (no backdrop)', css: null },
      { label: 'A — Black velvet  #1a1a1a', css: '#1a1a1a' },
      { label: 'B — Deep teal  #0E7C88', css: '#0E7C88' },
      { label: 'C — Her pink  #F49AC1', css: '#F49AC1' },
    ] },
];

const W = 390, H = 470, SCALE = 2;

for (const page of PAGES) {
  const shots = [];
  const seen = new Map();
  for (const opt of page.opts) {
    const p = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
    await p.goto(base + '/', { waitUntil: 'load' });
    await p.evaluate(SEED);
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(2600);
    await p.evaluate(f => { try { eval(f); } catch (e) {} }, page.open);
    await p.waitForTimeout(700);
    const bg = await p.evaluate(c => {
      if (c) {
        document.documentElement.style.background = c;
        document.body.style.background = c;
      }
      return getComputedStyle(document.body).backgroundColor;
    }, opt.css);
    await p.waitForTimeout(150);
    shots.push({ label: opt.label, buf: (await p.screenshot()).toString('base64') });
    if (seen.has(bg)) throw new Error(`${page.key}: "${opt.label}" renders the SAME background as "${seen.get(bg)}" (${bg})`);
    seen.set(bg, opt.label);
    console.log(`  ${page.key.padEnd(9)} ${opt.label.padEnd(30)} -> ${bg}`);
    await p.close();
  }

  // composite 2x2 with labels
  const canvasPage = await browser.newPage({ viewport: { width: 100, height: 100 } });
  const out = await canvasPage.evaluate(async ({ shots, title, note, W, H, SCALE }) => {
    const PAD = 18, LABEL = 46, HEAD = 74;
    const cw = W * SCALE, ch = H * SCALE;
    const c = document.createElement('canvas');
    c.width = PAD + (cw + PAD) * 2;
    c.height = HEAD + (LABEL + ch + PAD) * 2;
    const x = c.getContext('2d');
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, c.width, c.height);
    // ⚠️ measure the title with the TITLE's font still set, or the note lands
    // on top of it (it did on the first run).
    x.fillStyle = '#111'; x.font = 'bold 34px system-ui, sans-serif';
    x.fillText(title, PAD, 44);
    const titleW = x.measureText(title).width;
    x.fillStyle = '#777'; x.font = '22px system-ui, sans-serif';
    x.fillText(note, PAD + titleW + 24, 44);
    for (let i = 0; i < shots.length; i++) {
      const img = new Image(); img.src = 'data:image/png;base64,' + shots[i].buf; await img.decode();
      const col = i % 2, row = Math.floor(i / 2);
      const px = PAD + col * (cw + PAD);
      const py = HEAD + row * (LABEL + ch + PAD);
      x.fillStyle = '#111'; x.font = 'bold 26px system-ui, sans-serif';
      x.fillText(shots[i].label, px, py + 30);
      x.drawImage(img, px, py + LABEL, cw, ch);
      x.strokeStyle = '#ddd'; x.lineWidth = 2; x.strokeRect(px, py + LABEL, cw, ch);
    }
    return c.toDataURL('image/png');
  }, { shots, title: page.title, note: page.note, W, H, SCALE });
  fs.writeFileSync(path.join(ROOT, 'scratchpad', `backdrop-${page.key}.png`),
    Buffer.from(out.split(',')[1], 'base64'));
  await canvasPage.close();
  console.log(`  -> wrote backdrop-${page.key}.png\n`);
}

await browser.close(); server.close();
console.log('all four rendered, every option proven distinct');
