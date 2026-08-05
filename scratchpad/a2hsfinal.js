// Shoots the SHIPPED Add to Home Screen whisper both ways:
//   iPhone — her two-tap wording (what Cath will see on her own phone)
//   Android — the same whisper ending in a tappable "Add it now"
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

const SEED = { userName: 'Sarah', answers: [6,6,6,6,6,6,6,6,6,6,6,6],
  topArchNames: ['Timeless Classic','Modern Muse','Coastal Chic'], portrait: 'A test portrait.', motto: 'Shine on.' };
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

const browser = await chromium.launch();
const shoot = async (opts, fakePrompt) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, ...opts });
  const page = await ctx.newPage();
  await page.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
  await page.addInitScript(d => localStorage.setItem('ss_data', JSON.stringify(d)), SEED);
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.show === 'function');
  await page.evaluate(() => { document.getElementById('ssEntrance')?.remove(); });
  await page.addStyleTag({ content: '#s-wb *{animation:none!important;opacity:1}' });
  await page.waitForSelector('#s-wb.act', { timeout: 5000 });
  if (fakePrompt) await page.evaluate(() => {
    const e = new Event('beforeinstallprompt'); e.prompt = () => {}; e.userChoice = Promise.resolve({ outcome: 'dismissed' });
    window.dispatchEvent(e);
  });
  await page.waitForTimeout(400);
  const rect = await page.evaluate(() => {
    const el = document.getElementById('a2hs');
    el.scrollIntoView({ block: 'center' });
    const b = el.getBoundingClientRect();
    const f = document.querySelector('.wb-foot').getBoundingClientRect();
    const top = Math.max(0, Math.min(b.top, f.top) - 150);
    return { top, h: Math.min(844, Math.max(b.bottom, f.bottom) + 14) - top,
      on: el.classList.contains('on') };
  });
  if (!rect.on) { console.log('NOT VISIBLE — aborting'); process.exit(1); }
  const shot = await page.screenshot({ clip: { x: 0, y: rect.top, width: 390, height: rect.h } });
  await ctx.close();
  return shot;
};

const ios = await shoot({ userAgent: IOS_UA, isMobile: true, hasTouch: true }, false);
const android = await shoot({}, true);

const DESC = {
  iphone: ['ON HER iPHONE — AS BUILT', 'Her wording, whisper voice: the two taps iPhones need, share glyph, pink heart, &#10005; left. Sits above the footer, below Retake.', ios],
  android: ['ON ANDROID — AS BUILT', 'Same whisper, but Android allows a real install prompt, so the line ends in a tappable gold &ldquo;Add it now&rdquo;.', android],
};
const single = await browser.newPage({ viewport: { width: 430, height: 100 }, deviceScaleFactor: 2 });
for (const [k, [title, desc, buf]] of Object.entries(DESC)) {
  await single.setContent(`<body style="margin:0;background:#f4f1ea;font-family:Georgia,serif">
    <div style="padding:18px 20px 14px;text-align:center">
      <div style="font-size:24px;font-weight:bold;margin-bottom:5px">${title}</div>
      <div style="font-size:14px;color:#555;margin:0 auto 12px;max-width:390px">${desc}</div>
      <img src="data:image/png;base64,${buf.toString('base64')}" style="width:390px;border:1px solid #bbb;border-radius:8px">
    </div></body>`);
  await single.waitForTimeout(200);
  const out = path.join(import.meta.dirname, 'a2hsfinal-' + k + '.png');
  await single.screenshot({ path: out, fullPage: true });
  console.log('wrote', out);
}
await browser.close(); server.close();
