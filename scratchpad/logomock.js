// The wardrobe's stitched "style Star" tag is the only letterhead of its kind
// in the app -- her catch. Renders it against the app's standard treatments so
// she can pick. ⚠️ id-scoped injection per variant, and each render's computed
// letterhead is captured so look-alike mockups cannot reach her.
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

// The wishlist/photo letterhead, reproduced exactly: DM Serif "style Star",
// gold rule, gold bead. This is the app's standard mark.
const MAST = `
  #s-wardrobe .wdr-tagwrap{display:none!important}
  #s-wardrobe .mockmast{position:absolute;top:18px;left:2px;z-index:6;
    font:400 19px/1 'DM Serif Display',Georgia,serif;color:#1a1a1a;
    -webkit-text-stroke:.35px #1a1a1a;padding-bottom:7px;display:inline-block}
  #s-wardrobe .mockmast::after{content:"";position:absolute;left:0;right:0;bottom:1px;height:2px;background:#E0B84C}
  #s-wardrobe .mockmast::before{content:"";position:absolute;bottom:-1.5px;left:50%;width:7px;height:7px;border-radius:50%;
    background:radial-gradient(circle at 38% 34%,#F8EEC0,#DFB94E 58%,#AF811C);z-index:1}
`;
const MAST_CENTRE = MAST + `
  #s-wardrobe .mockmast{position:static;display:inline-block;margin:2px 0 14px}
  #s-wardrobe .mockwrap{text-align:center}
`;

const OPTS = [
  { label: 'Current — stitched box', css: null, mast: false },
  { label: 'A — standard letterhead, top-left (matches Wishlist)', css: MAST, mast: true },
  { label: 'B — same letterhead, centred', css: MAST_CENTRE, mast: true },
];

const W = 390, H = 430, SCALE = 2;

for (const tab of ['list', 'trend']) {
  const shots = []; const seen = new Map();
  for (const o of OPTS) {
    const p = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
    await p.goto(base + '/', { waitUntil: 'load' });
    await p.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(2600);
    await p.evaluate(t => openWardrobe(t), tab);
    await p.waitForTimeout(700);
    const sig = await p.evaluate(({ css, mast }) => {
      if (css) {
        const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
        const scr = document.getElementById('s-wardrobe');
        const wrap = document.createElement('div'); wrap.className = 'mockwrap';
        const m = document.createElement('div'); m.className = 'mockmast'; m.textContent = 'style Star';
        wrap.appendChild(m);
        scr.insertBefore(wrap, scr.querySelector('.wdr-head'));
      }
      const tag = document.querySelector('#s-wardrobe .wdr-tag');
      const mm = document.querySelector('#s-wardrobe .mockmast');
      const el = mm || tag;
      const r = el.getBoundingClientRect();
      return `${mm ? 'mast' : 'tag'} ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`;
    }, o);
    if (seen.has(sig)) throw new Error(`${tab}: "${o.label}" renders identically to "${seen.get(sig)}"`);
    seen.set(sig, o.label);
    console.log(`  ${tab.padEnd(6)} ${o.label.padEnd(52)} -> ${sig}`);
    shots.push({ label: o.label, buf: (await p.screenshot()).toString('base64') });
    await p.close();
  }

  const cp = await browser.newPage({ viewport: { width: 100, height: 100 } });
  const out = await cp.evaluate(async ({ shots, title, W, H, SCALE }) => {
    const PAD = 18, LABEL = 44, HEAD = 66;
    const cw = W * SCALE, ch = H * SCALE;
    const c = document.createElement('canvas');
    c.width = PAD + (cw + PAD) * shots.length;
    c.height = HEAD + LABEL + ch + PAD;
    const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#111'; x.font = 'bold 32px system-ui, sans-serif';
    x.fillText(title, PAD, 42);
    for (let i = 0; i < shots.length; i++) {
      const img = new Image(); img.src = 'data:image/png;base64,' + shots[i].buf; await img.decode();
      const px = PAD + i * (cw + PAD);
      x.fillStyle = '#111'; x.font = 'bold 23px system-ui, sans-serif';
      x.fillText(shots[i].label, px, HEAD + 28);
      x.drawImage(img, px, HEAD + LABEL, cw, ch);
      x.strokeStyle = '#ddd'; x.lineWidth = 2; x.strokeRect(px, HEAD + LABEL, cw, ch);
    }
    return c.toDataURL('image/png');
  }, { shots, title: tab === 'list' ? 'MY LIST' : "WHAT'S TRENDING", W, H, SCALE });
  fs.writeFileSync(path.join(ROOT, 'scratchpad', `logo-${tab}.png`), Buffer.from(out.split(',')[1], 'base64'));
  await cp.close();
  console.log(`  -> wrote logo-${tab}.png\n`);
}
await browser.close(); server.close();
console.log('rendered, every option proven distinct');
