// Pins the 2026-08-10 header fix: the shared tagline holds ONE line on real
// phone widths, the gap down to "My Story" is tight, and nothing overflows.
//
// ⚠️ LINE COUNTING: Range.getClientRects() returns a rect per text box AND per
// element, and .tag contains a <span>, so ONE visual line reports as 3 rects.
// Count UNIQUE rect tops, never rect count. (The first run of this suite failed
// 29 checks for exactly that reason, plus asserting against a hidden .hdr.)
//
// ⚠️ The shared .hdr is display:none on most screens (each shows its own
// letterhead). Only screens that really show it are asserted.
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

let pass = 0, fail = 0;
const ok = (c, m) => { c ? (pass++, console.log('  ok  ' + m)) : (fail++, console.log('  FAIL ' + m)); };

// Runs in the page. Returns null when the shared header is not on this screen.
const PROBE = `(() => {
  const tag = document.querySelector('.hdr .tag');
  const hdr = document.querySelector('.hdr');
  if (!tag || getComputedStyle(hdr).display === 'none' || getComputedStyle(tag).display === 'none') return null;
  const rg = document.createRange(); rg.selectNodeContents(tag);
  const rects = [...rg.getClientRects()];
  const tops = [...new Set(rects.map(r => Math.round(r.top)))].sort((a,b)=>a-b);
  const lineW = tops.map(t => Math.round(Math.max(...rects.filter(r=>Math.round(r.top)===t).map(r=>r.width))));
  const tr = tag.getBoundingClientRect();
  const card = document.querySelector('.ss').getBoundingClientRect();
  const logo = document.querySelector('.hdr .logo-img').getBoundingClientRect();
  return {
    lines: tops.length, lineW,
    text: tag.textContent.replace(/\\s+/g,' ').trim(),
    balance: getComputedStyle(tag).textWrap,
    fontSize: getComputedStyle(tag).fontSize,
    leftIn: Math.round(tr.left - card.left), rightIn: Math.round(card.right - tr.right),
    logoOff: Math.round((logo.left - card.left) - (card.right - logo.right)),
    docW: document.documentElement.scrollWidth, winW: window.innerWidth,
  };
})()`;

// ---------- Part 1: My Story, the screen she reported ----------
for (const w of [430, 390, 375, 360]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => showStory());
  await page.waitForTimeout(400);
  console.log(`\n--- My Story @ ${w} ---`);
  const m = await page.evaluate(PROBE);
  const g = await page.evaluate(() => {
    const tag = document.querySelector('.hdr .tag').getBoundingClientRect();
    const t = document.querySelector('#s-story .story-title');
    const ti = t.getBoundingClientRect();
    return { gap: Math.round(ti.top - tag.bottom), visible: ti.height > 0, txt: t.textContent.trim() };
  });
  ok(m !== null, 'shared header is shown on My Story');
  ok(m.lines === 1, `tagline is ONE line (${m.lineW.join(' / ')}px)`);
  ok(m.text === 'Align your style. Shine your light.', 'wording unchanged');
  ok(m.fontSize === '16px', 'font size NOT shrunk (readability rule)');
  ok(g.gap >= 6 && g.gap <= 14, `gap to "My Story" is tight: ${g.gap}px`);
  ok(g.gap < 24, 'gap genuinely reduced from the old 24px');
  ok(m.leftIn > 0 && m.rightIn > 0, `tagline inside the card (${m.leftIn}/${m.rightIn}px)`);
  ok(Math.abs(m.leftIn - m.rightIn) <= 2, 'tagline centered');
  ok(Math.abs(m.logoOff) <= 2, 'logo still centered');
  ok(m.docW <= m.winW, 'no sideways page scroll');
  ok(g.visible && g.txt === 'My Story', '"My Story" still renders');
  ok(errs.length === 0, 'zero JS errors');
  await page.close();
}

// ---------- Part 2: 320 falls to TWO BALANCED lines, deliberately ----------
{
  const page = await browser.newPage({ viewport: { width: 320, height: 900 } });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => showStory());
  await page.waitForTimeout(400);
  console.log('\n--- My Story @ 320 (deliberate 2-line fallback) ---');
  const m = await page.evaluate(PROBE);
  ok(m.lines === 2, `two lines, not three (${m.lineW.join(' / ')}px)`);
  ok(m.balance === 'balance', 'text-wrap:balance is on');
  ok(Math.min(...m.lineW) > 100, 'neither line is a stranded word');
  ok(Math.abs(m.lineW[0] - m.lineW[1]) <= 20, 'the two lines are balanced at the sentence seam');
  ok(m.docW <= m.winW, 'no sideways page scroll at 320');
  await page.close();
}

// ---------- Part 3: every screen that shows the shared header ----------
const SCREENS = [
  ['welcome', null], ['story', 'showStory()'], ['FAQ', 'showFAQ()'],
  ['privacy', 'showPrivacy()'], ['terms', 'showTerms()'], ['shop', 'showShop()'],
  ['edit', 'showDream()'], ['photo', 'showPhoto()'], ['wardrobe', 'openWardrobe()'],
];
for (const w of [390, 360]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  console.log(`\n--- every header-bearing screen @ ${w} ---`);
  let shown = 0;
  for (const [label, fn] of SCREENS) {
    if (fn) { await page.evaluate(f => eval(f), fn); await page.waitForTimeout(320); }
    const m = await page.evaluate(PROBE);
    if (m === null) { console.log(`  --  ${label}: own letterhead, shared header hidden (not asserted)`); continue; }
    shown++;
    ok(m.lines === 1, `${label}: tagline one line (${m.lineW.join(' / ')}px)`);
    ok(m.leftIn > 0 && m.rightIn > 0, `${label}: tagline inside the card`);
    ok(Math.abs(m.logoOff) <= 2, `${label}: logo still centered`);
    ok(m.docW <= m.winW, `${label}: no sideways scroll`);
  }
  ok(shown > 0, `at least one screen really shows the shared header (${shown})`);
  ok(errs.length === 0, 'zero JS errors across those screens');
  await page.close();
}

// ---------- Screenshots for her eye ----------
for (const [w, name] of [[390, 'tagfix-390'], [360, 'tagfix-360']]) {
  const page = await browser.newPage({ viewport: { width: w, height: 720 }, deviceScaleFactor: 2 });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => showStory());
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', name + '.png') });
  await page.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close(); server.close();
process.exit(fail ? 1 : 0);
