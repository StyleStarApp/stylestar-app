// Cath: "I don't like the brown color... especially the line on the left."
// The bar is #C8971E and the envelope stroke #8a6a14 — both dark antique golds,
// which is the documented go-brown-at-small-sizes trap. Render the app's real
// golds against the built card so she can see the difference at phone size.
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

// bar = the left accent, ink = the envelope glyph, rule = the hairline above the
// fallback line, edge = the 1px card border
const GOLDS = {
  brown:  { label: 'NOW  ·  #C8971E  (the one reading brown)', bar: '#C8971E', ink: '#8a6a14', rule: 'rgba(200,151,30,.25)', edge: '#D8C285' },
  star:   { label: 'GOLD 1  ·  #E0B84C  — the app\'s star gold', bar: '#E0B84C', ink: '#D8A52E', rule: 'rgba(224,184,76,.4)', edge: '#E0C57F' },
  mall:   { label: 'GOLD 2  ·  #D8A52E  — the Mall sign gold', bar: '#D8A52E', ink: '#D8A52E', rule: 'rgba(216,165,46,.32)', edge: '#DFC07A' },
  leaf:   { label: 'GOLD 3  ·  gold-leaf gradient bar', bar: 'linear-gradient(180deg,#F6E08F,#E0B84C 45%,#C9A24E)', ink: '#D8A52E', rule: 'rgba(224,184,76,.4)', edge: '#E0C57F' }
};

for (const [key, g] of Object.entries(GOLDS)) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.route('**/user-data*', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true,"sent":true}' }));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => { showRestore(); document.getElementById('restoreEmail').value = 'cath@example.com'; });
  await page.evaluate(() => restoreResults());
  await page.waitForTimeout(400);

  await page.evaluate(({ g, label }) => {
    const s = document.createElement('style');
    s.textContent = `#restoreForm .rc-card{border-left:4px solid transparent!important;border-left-color:${/gradient/.test(g.bar) ? 'transparent' : g.bar}!important;border-color:${g.edge};border-left-width:4px;position:relative;overflow:hidden}
${/gradient/.test(g.bar) ? `#restoreForm .rc-card::before{content:'';position:absolute;left:-4px;top:-1px;bottom:-1px;width:4px;background:${g.bar}}` : ''}
#restoreForm .rc-h svg{stroke:${g.ink}!important}
#restoreForm .rc-q{border-top-color:${g.rule}!important}`;
    document.head.appendChild(s);
    const bar = document.createElement('div');
    bar.id = '__lbl'; bar.textContent = label;
    bar.style.cssText = "font:700 12px/1.3 'Jost',sans-serif;letter-spacing:.08em;color:#fff;background:#1a1a1a;padding:9px 10px;text-align:center;margin-bottom:10px;border-radius:4px";
    const form = document.getElementById('restoreForm');
    form.parentNode.insertBefore(bar, form);
  }, { g, label: g.label });
  await page.waitForTimeout(250);

  await page.evaluate(() => {
    const a = document.getElementById('__lbl');
    window.scrollTo(0, a.getBoundingClientRect().top + window.scrollY - 14);
  });
  await page.waitForTimeout(250);
  const box = await page.evaluate(() => {
    const a = document.getElementById('__lbl').getBoundingClientRect();
    const c = document.querySelector('#restoreForm .rc-card').getBoundingClientRect();
    const top = Math.max(0, a.top - 8);
    return { x: 8, y: top, width: 374, height: Math.min(window.innerHeight - top, (c.bottom - a.top) + 20) };
  });
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'gold-' + key + '.png'), clip: box });
  if (errs.length) console.log('JS ERRORS on ' + key + ': ' + errs.join(' | '));
  console.log('rendered gold-' + key + '.png');
  await page.close();
}
await browser.close(); server.close();
