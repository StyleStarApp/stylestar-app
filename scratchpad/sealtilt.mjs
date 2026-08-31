// Render the CTA seal star at several tilts, with the dimensional (off-centre)
// gradient restored, so Cath can pick a tilt before anything ships.
//
// ⚠️ Two things this harness deliberately does:
//   1. Serves the REAL fonts locally (the documented sandbox limitation: this
//      Chromium cannot reach fonts.googleapis.com, so a render without this
//      silently falls back to generic faces).
//   2. FREEZES the seal at its shimmer RESTING state (animation:none plus the
//      shimmer 0%/100% filter applied statically) so every variant is captured
//      at the identical phase. Otherwise the shimmer's brightness pulse lands
//      at a random point per variant and the comparison is meaningless.
//      A still cannot show the pulse itself; this shows the resting look.
// ⚠️ Absolute path, never the bare name — the documented sandbox trap. And it
// is CommonJS, so it needs a DEFAULT import destructured, not a named one.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const PORT = 8947;
const W = 390;

// The gradient centre is expressed in the star's OWN rotating coordinate space,
// so a bigger tilt carries the highlight round with it. These cx/cy values are
// the original 42%/36% counter-rotated so the highlight still lands where it
// did at the original -10deg, i.e. reading as lit from the upper left.
const DIM = { cx: '47%', cy: '34%' };

const VARIANTS = [
  { key: 'live',  label: 'CURRENT (live now):  tilt -20,  centred gradient', deg: -20, cx: '50%', cy: '50%' },
  { key: 'a',     label: 'A:  tilt -26,  dimensional gradient restored',     deg: -26, ...DIM },
  { key: 'b',     label: 'B:  tilt -32,  dimensional gradient restored',     deg: -32, ...DIM },
  { key: 'c',     label: 'C:  tilt -38,  dimensional gradient restored',     deg: -38, ...DIM },
];

const T = { '.html':'text/html', '.js':'text/javascript', '.png':'image/png', '.json':'application/json',
  '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.css':'text/css', '.woff2':'font/woff2', '.ttf':'font/ttf' };

const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});
await new Promise(r => srv.listen(PORT, r));

const css = fs.readFileSync('scratchpad/fonts/gf.css', 'utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(http://localhost:${PORT}/scratchpad/fonts/$1)`);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

for (const v of VARIANTS) {
  const pg = await b.newPage({ viewport: { width: W, height: 1100 }, deviceScaleFactor: 3 });
  await pg.route('**/fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
  await pg.goto(`http://localhost:${PORT}/`);
  await pg.waitForTimeout(2600);
  await pg.evaluate(() => { const c = document.querySelector('.hm-entrance'); if (c) c.remove(); });
  try { await pg.evaluate(() => document.fonts.ready); } catch {}

  await pg.evaluate(({ deg, cx, cy }) => {
    const s = document.createElement('style');
    s.textContent = `.hm-cta-seal{animation:none !important;transform:rotate(${deg}deg) !important;` +
      `filter:drop-shadow(0 0 6px rgba(244,208,102,.58)) drop-shadow(0 3px 4px rgba(120,90,20,.4)) brightness(1.04) !important}`;
    document.head.appendChild(s);
    const g = document.getElementById('hmSeal');
    if (g) { g.setAttribute('cx', cx); g.setAttribute('cy', cy); }
  }, v);
  await pg.waitForTimeout(500);

  // Prove the override actually took, rather than trusting it.
  const proof = await pg.evaluate(() => {
    const el = document.querySelector('.hm-cta-seal');
    const g = document.getElementById('hmSeal');
    return { transform: getComputedStyle(el).transform,
             cx: g && g.getAttribute('cx'), cy: g && g.getAttribute('cy') };
  });
  console.log(v.key, JSON.stringify(proof));

  const box = await pg.evaluate(() => {
    const a = document.querySelector('.hm-body').getBoundingClientRect();
    const z = document.querySelector('.hm-hiwline').getBoundingClientRect();
    // Start just BELOW the sub line, or each panel opens on a clipped sliver of
    // it and reads like a rendering fault rather than a crop.
    return { x: 0, y: Math.max(0, a.top + 3), width: 390, height: (z.bottom + 14) - (a.top + 3) };
  });
  await pg.screenshot({ path: `scratchpad/seal-${v.key}.png`, clip: box });
  await pg.close();
}

await b.close();
srv.close();
fs.writeFileSync('scratchpad/seal-labels.json', JSON.stringify(VARIANTS.map(v => ({ key: v.key, label: v.label })), null, 1));
console.log('rendered');
