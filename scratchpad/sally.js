// Her ask 2026-08-11, out of Sally Hogshead's note: gently emphasise that a
// REAL PERSON is behind this, on the hub rows. Two moves:
//   B) the sub-lines of the rows that are genuinely hers now speak in her voice
//   A) her signature pink heart on the same two rows the Menu already marks
// This checks the words landed on EVERY hub surface (they live on 3-4 each, so
// they can drift), that nothing wraps worse than before, and that the mark is
// on exactly the right rows and no others.
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

const HERS = ['Pieces I wear myself and recommend', "Stores I've chosen for you", 'The checklist I use with clients'];
const RETIRED = ['Hand-picked pieces you', 'Browse curated stores', 'Your personal wardrobe checklist'];

// ---- static: the words exist everywhere and the old ones are gone ----
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
console.log('\n--- the words, across every hub surface ---');
ok(src.split('Pieces I wear myself and recommend').length - 1 === 4, 'the Edit sub is in all 4 places');
ok(src.split("Stores I've chosen for you").length - 1 === 3, 'the Mall sub is in all 3 places');
ok(src.split('The checklist I use with clients').length - 1 === 3, 'the Wardrobe sub is in all 3 places');
RETIRED.forEach(r => ok(!src.includes(r), `the faceless version is gone: "${r}"`));
ok(src.split('picked by Catherine').length - 1 === 3, 'What\'s Trending still NAMES her (the page\'s one named credit)');
// ⚠️ her own honesty rule: the AI stylist must never claim to be Catherine
ok(/Expert guidance, anytime/.test(src), 'Ask your stylist is deliberately NOT in her first person');

for (const w of [390, 360, 320]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);

  const m = await page.evaluate(() => {
    // ⚠️ DRIVE the screen, do not assume the seed landed on it. A hidden row
    // yields ZERO range rects, so a "fits (0 lines)" would pass the wrap check
    // vacuously -- the false-negative shape this project has been bitten by
    // before. visibleRows below is the guard that makes the wrap checks real.
    show('s-wb'); updateWbScreen();
    const visibleRows = [...document.querySelectorAll('#s-wb .wb-row')].filter(r => r.offsetParent !== null).length;
    const rows = [...document.querySelectorAll('#s-wb .wb-row')].map(r => {
      const t = r.querySelector('.wb-lbl b, .tt'), s = r.querySelector('.wb-sub');
      const rect = s ? s.getBoundingClientRect() : null;
      // count UNIQUE line tops -- a Range reports a rect per box AND per element
      let lines = 0;
      if (s) { const rg = document.createRange(); rg.selectNodeContents(s); lines = new Set([...rg.getClientRects()].map(x => Math.round(x.top))).size; }
      return { title: t ? t.textContent.trim() : '', sub: s ? s.textContent.trim() : '', lines, heart: !!r.querySelector('.hub-ch'), overflow: rect ? rect.right > innerWidth : false };
    });
    const ch = document.querySelector('#s-wb .hub-ch');
    // ⚠️ The Menu heart is inside the CLOSED drawer, so it measures 0 unless the
    // drawer is opened first -- the standing "never assert against an element
    // that may be display:none" trap, which failed this very check once.
    menuOpen();
    const menuCh = document.querySelector('.menu-ch');
    return { rows, visibleRows, chFill: ch ? getComputedStyle(ch).fill : null, menuFill: menuCh ? getComputedStyle(menuCh).fill : null,
      chW: ch ? +ch.getBoundingClientRect().width.toFixed(1) : null,
      menuW: menuCh ? +menuCh.getBoundingClientRect().width.toFixed(1) : null,
      menuOpenOk: !!(menuCh && menuCh.getBoundingClientRect().width > 0),
      docW: document.documentElement.scrollWidth, vw: innerWidth };
  });
  await page.evaluate(() => menuClose());
  await page.waitForTimeout(200);

  console.log(`\n--- Welcome Back hub @ ${w} ---`);
  ok(m.visibleRows >= 8, `the Welcome Back rows are really on screen when measured (${m.visibleRows} visible)`);
  const hearted = m.rows.filter(r => r.heart).map(r => r.title);
  ok(hearted.length === 2, `exactly 2 rows carry the mark (${hearted.join(' / ')})`);
  ok(hearted.some(t => /Edit/.test(t)) && hearted.some(t => /Trending/.test(t)), 'they are the Edit and What\'s Trending, matching the Menu');
  ok(m.chFill === m.menuFill, `the hub heart is the same pink as the Menu's (${m.chFill})`);
  ok(m.menuOpenOk, 'the Menu heart was actually visible when measured (not a 0-width false pass)');
  ok(m.chW === m.menuW, `and the same size (${m.chW} vs ${m.menuW})`);
  // the her-voice rows carry "I"
  const voice = m.rows.filter(r => /\bI\b|I've/.test(r.sub)).map(r => r.title);
  ok(voice.length >= 3, `at least 3 rows now speak in her voice (${voice.join(' / ')})`);
  ok(!m.rows.some(r => /stylist/i.test(r.title) && /\bI\b/.test(r.sub)), 'Ask your stylist does NOT claim to be her');
  m.rows.forEach(r => ok(r.lines >= 1 && r.lines <= 2 && !r.overflow, `"${r.sub}" fits (${r.lines} line${r.lines > 1 ? 's' : ''})`));
  ok(m.docW <= m.vw, `no sideways scroll (${m.docW} vs ${m.vw})`);
  ok(!errs.length, 'zero JS errors');

  if (w === 390) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.evaluate(() => { show('s-wb'); updateWbScreen(); });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'sally-wb.png'), fullPage: true });
  }
  await page.close();
}
await browser.close(); server.close();
console.log(`\n${pass} passed, ${fail} failed`);
