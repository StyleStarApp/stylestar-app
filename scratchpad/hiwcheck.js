// Quick render check: the reworded How It Works step 2 at 390 + 360.  node scratchpad/hiwcheck.js
import http from 'http';
import fs from 'fs';
import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const PORT = 8931, ORIGIN = 'http://localhost:' + PORT;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, ORIGIN);
  if (url.pathname === '/' || url.pathname === '/index.html') { res.writeHead(200, {'Content-Type':'text/html'}); res.end(HTML); return; }
  const f = path.join(ROOT, url.pathname.replace(/^\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200); res.end(fs.readFileSync(f)); return; }
  res.writeHead(404); res.end();
});
await new Promise(r => server.listen(PORT, r));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let fails = 0, checks = 0;
const ok = (name, cond, extra) => { checks++; console.log((cond?'PASS ':'FAIL ')+name+(extra?'  ['+extra+']':'')); if(!cond) fails++; };

// 320 added 2026-08-21, her catch: at Display Zoom width step 2's sub wrapped
// with "you" stranded alone on line two. It genuinely cannot hold one line
// there, so the bar at 320 is BALANCED, not unwrapped -- and the font is
// deliberately not shrunk (readability beats an even list, 18-80 audience).
for (const w of [390, 375, 360, 320]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 844 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(ORIGIN + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600); // entrance curtain

  const r = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.hm-hiw .hiw-row')];
    const row2 = rows[1];
    const b = row2.querySelector('b'), s = row2.querySelector('.hiw-tx span');
    const lines = el => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
    return {
      head: b.textContent, sub: s.textContent,
      headLines: lines(b), subLines: lines(s),
      // words on the LAST visual line -- a widow is what she actually sees, and
      // a line count alone cannot tell a balanced wrap from a stranded word.
      lastLineWords: (() => {
        const node = s.firstChild, txt = s.textContent, ws = txt.trim().split(/\s+/);
        const rng = document.createRange(); const rows = []; let idx = 0;
        for (const wd of ws) { const st = txt.indexOf(wd, idx); rng.setStart(node, st); rng.setEnd(node, st + wd.length);
          const t = Math.round(rng.getBoundingClientRect().top);
          let L = rows.find(x => Math.abs(x.top - t) <= 6); if (!L) { L = { top: t, n: 0 }; rows.push(L); } L.n++; idx = st + wd.length; }
        rows.sort((a, b2) => a.top - b2.top); return rows[rows.length - 1].n; })(),
      balance: getComputedStyle(s).textWrap || getComputedStyle(s).textWrapStyle,
      disp: getComputedStyle(s).display,
      subMargin: [getComputedStyle(s).marginTop, getComputedStyle(s).marginBottom].join('/'),
      rowH: Math.round(row2.getBoundingClientRect().height),
      visible: row2.getBoundingClientRect().height > 0,
      docOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      rowRight: Math.round(row2.getBoundingClientRect().right), vw: document.documentElement.clientWidth
    };
  });
  ok(w+': headline text', r.head === 'Reveal your Style Portrait');
  ok(w+': sub text', r.sub === 'Your signature style, made clear for you');
  ok(w+': headline on one line', r.headLines === 1, r.headLines+' line(s)');
  ok(w+': sub on one line', w <= 320 || r.subLines === 1, r.subLines+' line(s)');
  ok(w+': sub never strands a single word', r.lastLineWords >= 2,
     'last line has '+r.lastLineWords+' word(s)');
  // ⚠️ text-wrap:balance does NOTHING on inline text -- display:block is what
  // makes it work, and dropping it would silently bring the widow back.
  ok(w+': the sub is block-level, so balance can apply', r.disp === 'block', r.disp);
  ok(w+': text-wrap:balance is on', /balance/.test(r.balance), r.balance);
  // ⚠️ The 3px margins put back LEADING that display:block removed: as an
  // inline this text sat in an anonymous block box sized by the parent's strut.
  // Without them every row loses 6px and the whole page rides 19px higher --
  // a spacing change she never asked for, riding in on a widow fix.
  ok(w+': the restored leading is intact', r.subMargin === '3px/3px', r.subMargin);
  ok(w+': the row keeps its original height', w <= 320 || r.rowH === 40, r.rowH+'px');
  ok(w+': row visible, no page overflow', r.visible && !r.docOverflow, 'right='+r.rowRight+' vw='+r.vw);
  ok(w+': zero JS errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}
await browser.close();
server.close();
console.log(checks+' checks, '+fails+' failures');
process.exit(fails ? 1 : 0);
