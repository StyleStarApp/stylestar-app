// Verify the as-built "Check your email" card (Cath's Option C): it renders on
// the real sent state, every line clears the AA contrast bar it used to fail,
// the two follow-up links still work, and nothing overflows at 390 or 360.
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
let fails = 0, checks = 0;
const ok = (n, c, x) => { checks++; console.log((c ? 'PASS ' : 'FAIL ') + n + (x ? '  [' + x + ']' : '')); if (!c) fails++; };

const CONTRAST = `(() => {
  const lum = c => { const [r,g,b] = c.map(v => { v/=255; return v<=.03928 ? v/12.92 : Math.pow((v+.055)/1.055,2.4); }); return .2126*r+.7152*g+.0722*b; };
  const parse = s => s.match(/[\\d.]+/g).slice(0,3).map(Number);
  const bgOf = el => { let n = el; while (n && n !== document.documentElement) { const c = getComputedStyle(n).backgroundColor; if (c && !/rgba\\(0, 0, 0, 0\\)|transparent/.test(c)) return parse(c); n = n.parentElement; } return [255,255,255]; };
  window.__ratio = sel => { const e = document.querySelector(sel); if (!e) return null; const a = lum(parse(getComputedStyle(e).color)), b = lum(bgOf(e)); const [hi,lo] = a>b?[a,b]:[b,a]; return +((hi+.05)/(lo+.05)).toFixed(2); };
})()`;

for (const w of [390, 360]) {
  const page = await browser.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: w === 390 ? 2 : 1 });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.route('**/user-data*', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true,"sent":true}' }));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => showRestore());

  // the plain status strings share #restoreMsg — they used to be 12px #777 too
  await page.evaluate(() => { document.getElementById('restoreEmail').value = 'nope'; restoreResults(); });
  await page.waitForTimeout(150);
  await page.evaluate(CONTRAST);
  const errMsg = await page.evaluate(() => ({ text: document.getElementById('restoreMsg').textContent, r: window.__ratio('#restoreMsg') }));
  ok(w + ': invalid-email message shown', /valid email/.test(errMsg.text));
  ok(w + ': status text clears AA (4.5:1)', errMsg.r >= 4.5, errMsg.r + ':1');

  await page.evaluate(() => { document.getElementById('restoreEmail').value = 'cath@example.com'; });
  await page.evaluate(() => restoreResults());
  await page.waitForTimeout(400);
  await page.evaluate(CONTRAST);

  const m = await page.evaluate(() => {
    const card = document.querySelector('#restoreForm .rc-card');
    const h = document.querySelector('#restoreForm .rc-h');
    const form = document.getElementById('restoreForm');
    const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    return {
      hasCard: !!card && vis(card),
      headline: h ? h.textContent.trim() : '',
      headlineSize: h ? parseFloat(getComputedStyle(h).fontSize) : 0,
      accent: card ? getComputedStyle(card).borderLeftWidth : '',
      hasSvg: !!(h && h.querySelector('svg')),
      bodySize: parseFloat(getComputedStyle(document.querySelector('#restoreForm .rc-b')).fontSize),
      fallback: (document.querySelector('#restoreForm .rc-q') || {}).textContent || '',
      askHidden: getComputedStyle(document.getElementById('restoreAsk')).display === 'none',
      altCount: document.querySelectorAll('#restoreForm .rc-alt').length,
      overflow: Math.round(Math.max(0, ...[...form.querySelectorAll('*')].map(e => e.getBoundingClientRect().right)) - form.getBoundingClientRect().right),
      docScroll: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });

  ok(w + ': the card renders', m.hasCard);
  ok(w + ': headline reads "Check your email"', m.headline === 'Check your email', m.headline);
  ok(w + ': headline is 16px (was 12px body text)', m.headlineSize === 16, m.headlineSize + 'px');
  ok(w + ': gold accent bar present', parseFloat(m.accent) >= 4, m.accent);
  ok(w + ': envelope glyph rendered', m.hasSvg);
  ok(w + ': body text is 13px', m.bodySize === 13, m.bodySize + 'px');
  ok(w + ': welcome-email fallback line kept', /welcome email/.test(m.fallback), m.fallback.trim());
  ok(w + ': the ask form stood down', m.askHidden);
  ok(w + ': both follow-up links present', m.altCount === 2, String(m.altCount));
  ok(w + ': nothing overflows the form', m.overflow <= 0, m.overflow + 'px');
  ok(w + ': page does not scroll sideways', m.docScroll <= 0, m.docScroll + 'px');

  const r = await page.evaluate(() => ({
    h: window.__ratio('#restoreForm .rc-h'),
    b: window.__ratio('#restoreForm .rc-b'),
    q: window.__ratio('#restoreForm .rc-q'),
    alt: window.__ratio('#restoreForm .rc-alt')
  }));
  ok(w + ': headline contrast >= 4.5', r.h >= 4.5, r.h + ':1');
  ok(w + ': body contrast >= 4.5 (was 4.29)', r.b >= 4.5, r.b + ':1');
  ok(w + ': fallback line contrast >= 4.5', r.q >= 4.5, r.q + ':1');
  ok(w + ': follow-up links contrast >= 4.5', r.alt >= 4.5, r.alt + ':1');

  if (w === 390) {
    await page.evaluate(() => {
      const f = document.getElementById('restoreForm');
      window.scrollTo(0, f.getBoundingClientRect().top + window.scrollY - 20);
    });
    await page.waitForTimeout(250);
    const box = await page.evaluate(() => {
      const f = document.getElementById('restoreForm').getBoundingClientRect();
      return { x: 8, y: Math.max(0, f.top - 12), width: 374, height: Math.min(window.innerHeight - Math.max(0, f.top - 12), f.height + 24) };
    });
    await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'restore-built.png'), clip: box });
  }

  // "Try a different email" must bring the ask back and clear the card
  await page.evaluate(() => restoreAskAgain());
  await page.waitForTimeout(150);
  const back = await page.evaluate(() => ({
    askBack: getComputedStyle(document.getElementById('restoreAsk')).display !== 'none',
    cleared: document.getElementById('restoreMsg').innerHTML === '',
    inputEmpty: document.getElementById('restoreEmail').value === ''
  }));
  ok(w + ': "Try a different email" restores the form', back.askBack);
  ok(w + ': the card is cleared with it', back.cleared);
  ok(w + ': the field is emptied for retyping', back.inputEmpty);
  ok(w + ': zero JS errors', errs.length === 0, errs.join(' | '));
  await page.close();
}
await browser.close(); server.close();
console.log('\n' + checks + ' checks, ' + fails + ' failures');
process.exit(fails ? 1 : 0);
