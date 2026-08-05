// Renders Cath's icon-preview idea (2026-08-05) two ways on the SHIPPED whisper:
//   TOP — the real app icon as a little home-screen preview above the line
//   INLINE — a small icon tucked into the line itself
// (plus the current no-icon build for comparison). iPhone UA = her wording.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0].slice(1)));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  const ext = path.extname(f);
  res.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.png': 'image/png' }[ext] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const base = 'http://127.0.0.1:' + server.address().port;

const SEED = { userName: 'Sarah', answers: [6,6,6,6,6,6,6,6,6,6,6,6],
  topArchNames: ['Timeless Classic','Modern Muse','Coastal Chic'], portrait: 'A test portrait.', motto: 'Shine on.' };
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

const VARIANTS = {
  current: null,
  top: `
    const css = document.createElement('style');
    css.textContent = '#a2hs .a2-ico{display:block;width:46px;height:46px;border-radius:10.5px;margin:0 auto 7px;box-shadow:0 3px 10px rgba(0,0,0,.45);border:1px solid rgba(242,216,137,.35)}';
    document.head.appendChild(css);
    const img = document.createElement('img'); img.className = 'a2-ico'; img.src = 'apple-touch-icon.png'; img.alt = '';
    document.getElementById('a2hs').insertBefore(img, document.getElementById('a2hsTxt'));
  `,
  inline: `
    const css = document.createElement('style');
    css.textContent = '#a2hs .a2-ico{width:20px;height:20px;border-radius:5px;vertical-align:-5px;margin-right:2px;box-shadow:0 1px 4px rgba(0,0,0,.4);border:1px solid rgba(242,216,137,.35)}';
    document.head.appendChild(css);
    const t = document.getElementById('a2hsTxt');
    t.innerHTML = '<img class="a2-ico" src="apple-touch-icon.png" alt=""> ' + t.innerHTML;
  `,
};

const browser = await chromium.launch();
const shots = {};
for (const [k, inject] of Object.entries(VARIANTS)) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, userAgent: IOS_UA, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
  await page.addInitScript(d => localStorage.setItem('ss_data', JSON.stringify(d)), SEED);
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.show === 'function');
  await page.evaluate(() => { document.getElementById('ssEntrance')?.remove(); });
  await page.addStyleTag({ content: '#s-wb *{animation:none!important;opacity:1}' });
  await page.waitForSelector('#s-wb.act', { timeout: 5000 });
  if (inject) await page.evaluate(new Function(inject));
  await page.waitForTimeout(500);
  const rect = await page.evaluate(() => {
    const el = document.getElementById('a2hs');
    el.scrollIntoView({ block: 'center' });
    const b = el.getBoundingClientRect();
    const f = document.querySelector('.wb-foot').getBoundingClientRect();
    const top = Math.max(0, Math.min(b.top, f.top) - 130);
    return { top, h: Math.min(844, Math.max(b.bottom, f.bottom) + 14) - top, on: el.classList.contains('on') };
  });
  if (!rect.on) { console.log(k + ' NOT VISIBLE — aborting'); process.exit(1); }
  shots[k] = await page.screenshot({ clip: { x: 0, y: rect.top, width: 390, height: rect.h } });
  await ctx.close();
}

const DESC = {
  current: 'AS SHIPPED — no icon. The quietest.',
  top: 'ICON ABOVE — the real app icon, rounded like it will look on her home screen, floating above your line. Shows her exactly what she is getting.',
  inline: 'ICON IN THE LINE — a small version tucked into the sentence itself. More compact, less of a moment.',
};
const single = await browser.newPage({ viewport: { width: 430, height: 100 }, deviceScaleFactor: 2 });
for (const [k, buf] of Object.entries(shots)) {
  await single.setContent(`<body style="margin:0;background:#f4f1ea;font-family:Georgia,serif">
    <div style="padding:18px 20px 14px;text-align:center">
      <div style="font-size:24px;font-weight:bold;margin-bottom:5px">${k.toUpperCase()}</div>
      <div style="font-size:14px;color:#555;margin:0 auto 12px;max-width:390px">${DESC[k]}</div>
      <img src="data:image/png;base64,${buf.toString('base64')}" style="width:390px;border:1px solid #bbb;border-radius:8px">
    </div></body>`);
  await single.waitForTimeout(200);
  const out = path.join(import.meta.dirname, 'a2hsicon-' + k + '.png');
  await single.screenshot({ path: out, fullPage: true });
  console.log('wrote', out);
}
await browser.close(); server.close();
