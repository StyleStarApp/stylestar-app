// Cath's live finding (2026-08-08): she tried TAPPING the icon, the wording and
// the inline share glyph, not realising she had to use Safari's own share button
// — and the 12.5px italic is hard to read. Render three fixes on the real screen.
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
const HEART = `<svg viewBox="0 0 24 24" fill="#F49AC1"><path d="M12 21.6 C10.7 18.9 8.2 17 5.9 14.7 C3.6 12.4 2 10.4 2 7.7 C2 4.8 4.2 2.7 7 2.7 C9.5 2.7 11.3 4.6 12 7.1 C12.7 4.6 14.5 2.7 17 2.7 C19.8 2.7 22 4.8 22 7.7 C22 10.4 20.4 12.4 18.1 14.7 C15.8 17 13.3 18.9 12 21.6 Z"/></svg>`;

const OPTIONS = {
  current: { label: 'NOW  ·  12.5px italic, glyph looks tappable', css: '', html: null },

  a: {
    label: 'A  ·  bigger, upright, two numbered steps',
    css: `#a2hs .a2-t{font:400 14px/1.6 'Jost',sans-serif!important;font-style:normal!important}
#a2hs .a2-lead{display:block;font:600 14.5px/1.45 'Jost',sans-serif;color:#F2D889;margin-bottom:8px}
#a2hs .a2-step{display:flex;align-items:center;gap:9px;justify-content:flex-start;text-align:left;max-width:260px;margin:0 auto 6px}
#a2hs .a2-n{flex:0 0 auto;width:20px;height:20px;border-radius:50%;border:1.2px solid rgba(242,216,137,.6);color:#F2D889;font:600 11px/1 'Jost',sans-serif;display:flex;align-items:center;justify-content:center}
#a2hs .a2-chip{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:7px;background:rgba(255,255,255,.09);border:1px solid rgba(232,226,210,.28);vertical-align:-8px;margin:0 3px}
#a2hs .a2-chip svg{width:15px;height:15px}
#a2hs .a2-h{width:13px;height:13px}`,
    html: `<img src="apple-touch-icon.png" alt="" class="a2-ico">
<span class="a2-t"><span class="a2-lead">Add Style Star as a free app</span>
<span class="a2-step"><span class="a2-n">1</span><span>Tap <span class="a2-chip">${SHARE}</span> in the bar at the bottom of your screen</span></span>
<span class="a2-step"><span class="a2-n">2</span><span>Choose <b>Add to Home Screen</b> <span style="display:inline-block;width:13px;height:13px;vertical-align:-2px">${HEART}</span></span></span></span>`
  },

  b: {
    label: 'B  ·  bigger + an arrow pointing at the real button',
    css: `#a2hs .a2-t{font:400 14px/1.6 'Jost',sans-serif!important;font-style:normal!important}
#a2hs .a2-lead{display:block;font:600 15px/1.4 'Jost',sans-serif;color:#F2D889;margin-bottom:6px}
#a2hs .a2-chip{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:7px;background:rgba(255,255,255,.09);border:1px solid rgba(232,226,210,.28);vertical-align:-8px;margin:0 3px}
#a2hs .a2-chip svg{width:15px;height:15px}
#a2hs .a2-point{display:block;margin-top:9px;font:600 12.5px/1.3 'Jost',sans-serif;color:#F2D889;opacity:.92}
#a2hs .a2-point .arw{display:block;font-size:17px;line-height:1;margin-top:2px;animation:a2bob 1.8s ease-in-out infinite}
@keyframes a2bob{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}`,
    html: `<img src="apple-touch-icon.png" alt="" class="a2-ico">
<span class="a2-t"><span class="a2-lead">Add Style Star as a free app</span>
Tap <span class="a2-chip">${SHARE}</span> then choose <b>Add to Home Screen</b> <span style="display:inline-block;width:13px;height:13px;vertical-align:-2px">${HEART}</span>
<span class="a2-point">your browser's Share button, down here<span class="arw">&#8595;</span></span></span>`
  },

  c: {
    label: 'C  ·  tap the line to open the how-to (honours the tap)',
    css: `#a2hs .a2-t{font:400 14px/1.6 'Jost',sans-serif!important;font-style:normal!important}
#a2hs .a2-lead{display:block;font:600 15px/1.4 'Jost',sans-serif;color:#F2D889;margin-bottom:4px}
#a2hs .a2-how{display:inline-block;margin-top:2px;font:600 13px/1.3 'Jost',sans-serif;color:#F2D889;border-bottom:1px solid rgba(242,216,137,.55)}
#a2hs .a2-panel{margin:10px auto 0;max-width:270px;background:rgba(255,255,255,.06);border:1px solid rgba(232,226,210,.22);border-radius:10px;padding:12px 13px;text-align:left}
#a2hs .a2-step{display:flex;align-items:center;gap:9px;margin-bottom:7px;font:400 13.5px/1.45 'Jost',sans-serif;color:#E8E2D2}
#a2hs .a2-step:last-child{margin-bottom:0}
#a2hs .a2-n{flex:0 0 auto;width:20px;height:20px;border-radius:50%;border:1.2px solid rgba(242,216,137,.6);color:#F2D889;font:600 11px/1 'Jost',sans-serif;display:flex;align-items:center;justify-content:center}
#a2hs .a2-chip{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:7px;background:rgba(255,255,255,.09);border:1px solid rgba(232,226,210,.28);vertical-align:-7px;margin:0 2px}
#a2hs .a2-chip svg{width:14px;height:14px}`,
    html: `<img src="apple-touch-icon.png" alt="" class="a2-ico">
<span class="a2-t"><span class="a2-lead">Add Style Star as a free app to your phone</span>
<span class="a2-how">Show me how</span>
<span class="a2-panel">
<span class="a2-step"><span class="a2-n">1</span><span>Tap <span class="a2-chip">${SHARE}</span> in the bar at the bottom of your screen</span></span>
<span class="a2-step"><span class="a2-n">2</span><span>Choose <b>Add to Home Screen</b> <span style="display:inline-block;width:13px;height:13px;vertical-align:-2px">${HEART}</span></span></span>
</span></span>`
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
    if (css) { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }
    if (html) document.getElementById('a2hs').innerHTML = html;
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
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'a2hs2-' + key + '.png'), clip: box });
  if (errs.length) console.log('  JS ERRORS on ' + key + ': ' + errs.join(' | '));
  console.log('rendered a2hs2-' + key + '.png');
  await ctx.close();
}
await browser.close(); server.close();
