// Cath's second finding: the real iOS flow is Share -> View More -> scroll ->
// Add to Home Screen. Our two-step copy undercounts it. Render the honest
// wording two ways so she can confirm it matches what she actually saw.
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
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const SEED = { userName: 'Sarah', answers: [6,6,6,6,6,6,6,6,6,6,6,6], topArchNames: ['Timeless Classic','Modern Muse','Coastal Chic'], portrait: 'A test portrait.', motto: 'Shine on.' };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

const SHARE = `<svg viewBox="0 0 24 24" fill="none" stroke="#F2D889" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M8.5 7 12 3.5 15.5 7"/><path d="M7 10H5.8C5 10 4.4 10.6 4.4 11.4v8.2c0 .8.6 1.4 1.4 1.4h12.4c.8 0 1.4-.6 1.4-1.4v-8.2c0-.8-.6-1.4-1.4-1.4H17"/></svg>`;
const HEART = `<span style="display:inline-block;width:13px;height:13px;vertical-align:-2px"><svg viewBox="0 0 24 24" fill="#F49AC1"><path d="M12 21.6 C10.7 18.9 8.2 17 5.9 14.7 C3.6 12.4 2 10.4 2 7.7 C2 4.8 4.2 2.7 7 2.7 C9.5 2.7 11.3 4.6 12 7.1 C12.7 4.6 14.5 2.7 17 2.7 C19.8 2.7 22 4.8 22 7.7 C22 10.4 20.4 12.4 18.1 14.7 C15.8 17 13.3 18.9 12 21.6 Z"/></svg></span>`;

// shared styling for both: 14px upright, steps aligned to the FIRST line
const BASE = `#a2hs .a2-t{font:400 14px/1.55 'Jost',sans-serif!important;font-style:normal!important}
#a2hs .a2-lead{display:block;font:600 14.5px/1.4 'Jost',sans-serif;color:#F2D889;margin-bottom:9px}
#a2hs .a2-step{display:flex;align-items:flex-start;gap:9px;text-align:left;max-width:262px;margin:0 auto 7px}
#a2hs .a2-n{flex:0 0 auto;width:20px;height:20px;margin-top:1px;border-radius:50%;border:1.2px solid rgba(242,216,137,.6);color:#F2D889;font:600 11px/1 'Jost',sans-serif;display:flex;align-items:center;justify-content:center}
#a2hs .a2-chip{display:inline-flex;align-items:center;justify-content:center;width:25px;height:25px;border-radius:7px;background:rgba(255,255,255,.09);border:1px solid rgba(232,226,210,.28);vertical-align:-8px;margin:0 2px}
#a2hs .a2-chip svg{width:14px;height:14px}
#a2hs .a2-note{display:block;font:400 12.5px/1.45 'Jost',sans-serif;color:#B9B3A4;margin-top:7px}`;

const OPTIONS = {
  a3: {
    label: 'A1  ·  three honest steps',
    css: BASE,
    html: `<img src="apple-touch-icon.png" alt="" class="a2-ico">
<span class="a2-t"><span class="a2-lead">Add Style Star as a free app</span>
<span class="a2-step"><span class="a2-n">1</span><span>Tap <span class="a2-chip">${SHARE}</span> in your browser's toolbar</span></span>
<span class="a2-step"><span class="a2-n">2</span><span>Tap <b>View More</b> if you see it</span></span>
<span class="a2-step"><span class="a2-n">3</span><span>Scroll to <b>Add to Home Screen</b> ${HEART}</span></span></span>`
  },
  a2note: {
    label: 'A2  ·  two steps, the fiddly part as a quiet note',
    css: BASE,
    html: `<img src="apple-touch-icon.png" alt="" class="a2-ico">
<span class="a2-t"><span class="a2-lead">Add Style Star as a free app</span>
<span class="a2-step"><span class="a2-n">1</span><span>Tap <span class="a2-chip">${SHARE}</span> in your browser's toolbar</span></span>
<span class="a2-step"><span class="a2-n">2</span><span>Scroll down to <b>Add to Home Screen</b> ${HEART}</span></span>
<span class="a2-note">It sits a little way down the list, under <b style="color:#B9B3A4;font-weight:600">View More</b> on some phones.</span></span>`
  }
};

for (const [key, opt] of Object.entries(OPTIONS)) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: IOS_UA, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
  await page.addInitScript(d => localStorage.setItem('ss_data', JSON.stringify(d)), SEED);
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.show === 'function');
  await page.evaluate(() => { const e = document.getElementById('ssEntrance'); if (e) e.remove(); });
  await page.waitForSelector('#s-wb.act', { timeout: 6000 });
  await page.waitForTimeout(500);

  await page.evaluate(({ css, html, label }) => {
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    document.getElementById('a2hs').innerHTML = html;
    const el = document.getElementById('a2hs');
    el.insertAdjacentHTML('beforebegin', '<div id="__lbl" style="font:700 12px/1.35 \'Jost\',sans-serif;letter-spacing:.05em;color:#fff;background:#C8971E;padding:8px 10px;text-align:center;margin:0 14px 10px;border-radius:4px">' + label + '</div>');
    document.getElementById('__lbl').scrollIntoView({ block: 'center' });
  }, opt);
  await page.waitForTimeout(400);

  const box = await page.evaluate(() => {
    const a = document.getElementById('__lbl').getBoundingClientRect();
    const b = document.getElementById('a2hs').getBoundingClientRect();
    const top = Math.max(0, a.top - 10);
    return { x: 0, y: top, width: 390, height: Math.min(window.innerHeight - top, (b.bottom - a.top) + 24) };
  });
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'a2hs3-' + key + '.png'), clip: box });
  if (errs.length) console.log('  JS ERRORS on ' + key + ': ' + errs.join(' | '));
  console.log('rendered a2hs3-' + key + '.png');
  await ctx.close();
}
await browser.close(); server.close();
