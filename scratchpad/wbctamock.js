// Renders for Cath (2026-08-09): the two Welcome Back catches.
//   1. The "See your full Style Portrait" CTA — a flat black-bordered rectangle,
//      the only hard-edged box on a screen of marquee bulbs and gold. Options:
//      wbcta-current.png  as live
//      wbcta-a.png        A: marquee pill — black lacquer, gold text (the app's own CTA family)
//      wbcta-b.png        B: gilded invitation — cream, thin gold frame, serif, gold star
//      wbcta-c.png        C: no box — a gold underlined line, quiet, restraint pick
//   2. The #wbNext whisper at 12.5px italic (her catch: small, hard to read):
//      wbwhisper-current.png / wbwhisper-italic14.png / wbwhisper-upright14.png
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = import.meta.dirname;
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0].slice(1)));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const base = 'http://127.0.0.1:' + server.address().port;
const SEED = { userName: 'Sarah', answers: [6,6,6,6,6,6,6,6,6,6,6,6],
  topArchNames: ['Timeless Classic','Modern Muse','Coastal Chic'],
  portrait: 'A test portrait.', motto: 'You are every woman and entirely yourself, all at once.' };

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

async function boot() {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
  await page.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
  await page.addInitScript(d => localStorage.setItem('ss_data', JSON.stringify(d)), SEED);
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => { document.getElementById('ssEntrance')?.remove(); show('s-wb'); updateWbScreen(); window.scrollTo(0, 0); });
  await page.waitForTimeout(400);
  return page;
}
async function clipAround(page, sel, name, padTop, padBottom) {
  const r = await page.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { t: b.top + scrollY, b: b.bottom + scrollY }; }, sel);
  const y = Math.max(0, r.t - (padTop || 20));
  await page.screenshot({ path: path.join(OUT, name), clip: { x: 0, y, width: 390, height: r.b - r.t + (padTop || 20) + (padBottom || 20) } });
  console.log('wrote ' + name);
}

// ── the CTA, four ways ──────────────────────────────────────────────────────
let page = await boot();
await clipAround(page, '.wb-portrait', 'wbcta-current.png', 30, 24);

// A: marquee pill — the app's black-pill CTA family, dressed in gold
await page.addStyleTag({ content: `
  #s-wb .wb-port-cta{background:#1a1a1a !important;color:#F2D889 !important;border:1px solid #C99A2C !important;border-radius:999px !important;padding:11px 20px !important;letter-spacing:.04em !important}
  #s-wb .wb-port-cta svg{stroke:#F2D889 !important}
`});
await page.waitForTimeout(120);
await clipAround(page, '.wb-portrait', 'wbcta-a.png', 30, 24);
await page.close();

// B: gilded invitation — cream, thin gold frame, serif, a small gold star
page = await boot();
await page.addStyleTag({ content: `
  #s-wb .wb-port-cta{background:#FDFBF4 !important;border:1px solid #D8A52E !important;border-radius:2px !important;padding:10px 18px !important;font-family:'DM Serif Display',Georgia,serif !important;font-size:15px !important;font-weight:400 !important;color:#26221c !important;letter-spacing:.02em !important}
  #s-wb .wb-port-cta svg{stroke:#C8971E !important}
`});
await page.evaluate(() => {
  const cta = document.querySelector('#s-wb .wb-port-cta');
  const star = document.createElement('span');
  star.textContent = '✦';
  star.style.cssText = 'color:#D8A52E;font-size:13px;margin-right:2px;font-family:Georgia,serif';
  cta.insertBefore(star, cta.firstChild);
});
await page.waitForTimeout(120);
await clipAround(page, '.wb-portrait', 'wbcta-b.png', 30, 24);
await page.close();

// C: no box at all — one quiet gold underlined line
page = await boot();
await page.addStyleTag({ content: `
  #s-wb .wb-port-cta{background:transparent !important;border:none !important;border-radius:0 !important;padding:6px 0 2px !important;font-size:14px !important;color:#8a6415 !important;letter-spacing:.03em !important}
  #s-wb .wb-port-cta span{border-bottom:1px solid #D8A52E;padding-bottom:2px}
  #s-wb .wb-port-cta svg{stroke:#8a6415 !important}
`});
await page.waitForTimeout(120);
await clipAround(page, '.wb-portrait', 'wbcta-c.png', 30, 24);
await page.close();

// ── the whisper, three ways ─────────────────────────────────────────────────
page = await boot();
await clipAround(page, '#wbNext', 'wbwhisper-current.png', 26, 26);
await page.addStyleTag({ content: `
  #wbNext .wbn-t{font-size:14px !important;line-height:1.6 !important}
  #wbNext .wbn-h{width:12.5px;height:12.5px}
  #wbNext .wbn-x svg{width:15px;height:15px}
`});
await page.waitForTimeout(120);
await clipAround(page, '#wbNext', 'wbwhisper-italic14.png', 26, 26);
await page.addStyleTag({ content: `#wbNext .wbn-t{font-style:normal !important}` });
await page.waitForTimeout(120);
await clipAround(page, '#wbNext', 'wbwhisper-upright14.png', 26, 26);
await page.close();

await browser.close();
server.close();
