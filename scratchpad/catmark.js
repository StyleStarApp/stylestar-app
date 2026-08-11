// Her 2026-08-10 round: centre the shop disclosure, and give the wardrobe
// category headers the Menu's short gold underline instead of a full-width rule.
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

for (const w of [390, 360, 320]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);

  // ---- the shop disclosure, centred ----
  console.log(`\n--- shop disclosure centred @ ${w} ---`);
  const d = await page.evaluate(() => {
    try { _openShopStyleNow('style'); } catch (e) {}
    const el = document.querySelector('#s-shopstyle .shop-disclosure');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    // the painted TEXT centre, not the box centre
    const rg = document.createRange(); rg.selectNodeContents(el);
    const tr = rg.getBoundingClientRect();
    const host = el.parentElement.getBoundingClientRect();
    return {
      align: getComputedStyle(el).textAlign,
      textOffCentre: +(((tr.left + tr.right) / 2) - ((host.left + host.right) / 2)).toFixed(2),
      boxOffCentre: +(((r.left + r.right) / 2) - ((host.left + host.right) / 2)).toFixed(2),
      text: el.textContent.trim(),
    };
  });
  ok(d !== null, 'disclosure renders on Shop your style');
  ok(d.align === 'center', `text-align is centre (${d.align})`);
  ok(Math.abs(d.textOffCentre) <= 1.5, `the TEXT itself is centred (off by ${d.textOffCentre}px)`);
  // ⚠️ DELIBERATE WORDING UPDATE (her call 2026-08-11), not a silenced test. The
  // line lost its pronoun: "Some links may earn us a commission." -> "Some links
  // may earn a commission." ▶ She rejected both "us" and "me" -- the problem was
  // never the PRONOUN, it was that the sentence foregrounded her earning money,
  // and naming her sharpened it. Making the links the subject removes her from
  // the sentence while the legal fact survives. The claim under test (one exact
  // shared wording, byte-identical everywhere) is unchanged.
  ok(d.text === 'Some links may earn a commission.', 'wording is the pronoun-free line');
  ok(!/\b(us|me|we|I)\b/.test(d.text), 'nobody is named in it');

  // ---- wardrobe category underlines ----
  console.log(`\n--- wardrobe category underlines @ ${w} ---`);
  await page.evaluate(() => openWardrobe('list'));
  await page.waitForTimeout(700);
  const c = await page.evaluate(() => {
    const cats = [...document.querySelectorAll('#s-wardrobe .wdr-cat-t')];
    if (!cats.length) return null;
    const menuGrp = document.querySelector('.menu-grp');
    const mAfter = menuGrp ? getComputedStyle(menuGrp, '::after') : null;
    const rows = cats.slice(0, 6).map(el => {
      const cs = getComputedStyle(el);
      const af = getComputedStyle(el, '::after');
      const er = el.getBoundingClientRect();
      const rg = document.createRange(); rg.selectNodeContents(el);
      const tr = rg.getBoundingClientRect();
      const host = el.parentElement.getBoundingClientRect();
      return {
        name: el.textContent.trim(),
        display: cs.display,
        borderBottom: cs.borderBottomWidth,
        barH: af.height, barBg: af.backgroundColor,
        boxW: Math.round(er.width), textW: Math.round(tr.width),
        hostW: Math.round(host.width),
        hugsWord: er.width - tr.width < 12,
        notFullWidth: er.width < host.width - 20,
      };
    });
    return { rows, menuBarBg: mAfter ? mAfter.backgroundColor : null, menuBarH: mAfter ? mAfter.height : null };
  });
  ok(c !== null && c.rows.length > 0, `category headers render (${c ? c.rows.length : 0} sampled)`);
  for (const r of c.rows) {
    ok(r.display === 'inline-block', `${r.name}: inline-block so the bar hugs the word`);
    ok(r.borderBottom === '0px', `${r.name}: the old full-width rule is gone`);
    ok(r.barH === '2px', `${r.name}: 2px bar (${r.barH})`);
    ok(r.barBg === 'rgb(216, 165, 46)', `${r.name}: gold bar ${r.barBg}`);
    ok(r.hugsWord, `${r.name}: bar hugs the word (box ${r.boxW}px vs text ${r.textW}px)`);
    ok(r.notFullWidth, `${r.name}: not spanning the card (${r.boxW}px of ${r.hostW}px)`);
  }
  ok(c.menuBarBg === 'rgb(216, 165, 46)' && c.menuBarH === '2px',
     `matches the Menu's own group mark (${c.menuBarH} ${c.menuBarBg})`);
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no sideways scroll');
  ok(errs.length === 0, 'zero JS errors');

  if (w === 390) {
    await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'catmark-wardrobe.png'), clip: { x: 0, y: 0, width: w, height: 800 } });
  }
  await page.close();
}

// a shot of the centred disclosure on the shop screen
{
  const page = await browser.newPage({ viewport: { width: 390, height: 760 }, deviceScaleFactor: 2 });
  await page.route('**/.netlify/functions/style-ai', () => {});
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => _openShopStyleNow('style'));
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'catmark-disclosure.png'), clip: { x: 0, y: 0, width: 390, height: 420 } });
  await page.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close(); server.close();
process.exit(fail ? 1 : 0);
