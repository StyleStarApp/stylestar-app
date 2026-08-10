// Her rethink: the gold/yellow bleed on My List and the very gold frame on
// Trending are "too much muchness," and -- her strongest reason -- a woman who
// does not like yellow should not be made to sit in a yellow room while judging
// garment colours. Also the TAB FLIP repaints the whole page on a tap, which is
// most of the noise. These options all drop the flip: one treatment, both tabs.
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

// Kill the flip, then restate the surround. !important because the live rules
// are toggled by class on <html>.
const NOFLIP = c => `
  html.wdr-gold,html.wdr-gold body,html.wdr-black,html.wdr-black body{background:${c}!important}
  html.wdr-black .ss.wardrobe-mirror{border-color:#1a1a1a!important}
`;

const OPTS = [
  { key: 'current', label: 'Current — gold/black, flipping per tab', css: '' },
  { key: 'a', label: 'A — the app’s own linen, one treatment', css: NOFLIP('#F5F3EF') },
  { key: 'b', label: 'B — quiet charcoal, one treatment', css: NOFLIP('#2B2926') },
  { key: 'c', label: 'C — warm greige, one treatment', css: NOFLIP('#E5E0D6') },
  { key: 'd', label: 'D — no bleed at all (plain page)', css: NOFLIP('#F5F3EF') + `
      .ss.wardrobe-mirror{border:none!important;box-shadow:none!important;background:transparent!important}
      .ss.wardrobe-mirror::before{display:none!important}` },
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
      const card = document.querySelector('.ss.wardrobe-mirror'), cs = getComputedStyle(card);
      return `bleed ${getComputedStyle(document.documentElement).backgroundColor} | frame ${cs.borderTopWidth} ${cs.borderTopColor}`;
    }, o.css);
    if (seen.has(sig)) throw new Error(`${tab}: "${o.label}" renders identically to "${seen.get(sig)}"`);
    seen.set(sig, o.label);
    console.log(`  ${tab.padEnd(5)} ${o.label.padEnd(40)} -> ${sig}`);
    shots.push({ label: o.label, buf: (await p.screenshot()).toString('base64') });
    await p.close();
  }

  const cp = await browser.newPage({ viewport: { width: 100, height: 100 } });
  const out = await cp.evaluate(async ({ shots, title, W, H, SCALE }) => {
    const PAD = 20, LABEL = 46, HEAD = 64, COLS = 3;
    const cw = W * SCALE, ch = H * SCALE;
    const rows = Math.ceil(shots.length / COLS);
    const c = document.createElement('canvas');
    c.width = PAD + (cw + PAD) * COLS;
    c.height = HEAD + (LABEL + ch + PAD) * rows;
    const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#111'; x.font = 'bold 34px system-ui, sans-serif';
    x.fillText(title, PAD, 44);
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
  }, { shots, title: tab === 'list' ? 'MY LIST — quieter surrounds' : "WHAT'S TRENDING — the same treatment, no flip", W, H, SCALE });
  fs.writeFileSync(path.join(ROOT, 'scratchpad', `wdrcalm-${tab}.png`), Buffer.from(out.split(',')[1], 'base64'));
  await cp.close();
  console.log(`  -> wrote wdrcalm-${tab}.png\n`);
}
await browser.close(); server.close();
console.log('rendered, every option proven distinct');
