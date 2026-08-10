// Her 2026-08-10 empty-state round: gold SVG heart instead of the red emoji,
// tighter space around the open heart, and the wishing link becomes a bigger
// boxed button with a +. Measures the button so the bigger font cannot quietly
// overflow, and rasterises the heart to prove it is really gold.
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

for (const w of [430, 390, 375, 360, 320]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => openWishlist());
  await page.waitForTimeout(500);
  console.log(`\n--- Your Wishlist empty state @ ${w} ---`);
  const m = await page.evaluate(() => {
    const emp = document.querySelector('#s-wishlist .wl-empty');
    const heart = emp.querySelector('.we-h');
    const gold = emp.querySelector('.we-goldh');
    const btn = emp.querySelector('.we-addlnk');
    const span = btn.querySelector('.wab-t');
    const card = document.querySelector('#s-wishlist .wl-card');
    const h4 = emp.querySelector('h4');
    const p = emp.querySelector('p');
    const cta = emp.querySelector('.we-cta');
    const cs = getComputedStyle(btn);
    const br = btn.getBoundingClientRect(), cr = card.getBoundingClientRect();
    // natural one-line width of the button label
    const clone = span.cloneNode(true);
    clone.style.cssText = 'position:absolute;white-space:nowrap;visibility:hidden;left:-9999px';
    clone.style.font = getComputedStyle(span).font;
    clone.style.letterSpacing = getComputedStyle(span).letterSpacing;
    btn.appendChild(clone);
    const natural = Math.ceil(clone.getBoundingClientRect().width);
    clone.remove();
    const rg = document.createRange(); rg.selectNodeContents(span);
    const lines = [...new Set([...rg.getClientRects()].map(r => Math.round(r.top)))].length;
    return {
      goldExists: !!gold,
      goldFill: gold ? gold.getAttribute('fill') : null,
      goldIsSvg: gold ? gold.tagName.toLowerCase() === 'svg' : false,
      pText: p.textContent.replace(/\s+/g, ' ').trim(),
      hasEmojiHeart: /[♥♡]/.test(p.textContent),
      padTop: cs && getComputedStyle(emp).paddingTop,
      heartMarginBottom: getComputedStyle(heart).marginBottom,
      gapAboveHeart: Math.round(heart.getBoundingClientRect().top - emp.getBoundingClientRect().top),
      gapBelowHeart: Math.round(h4.getBoundingClientRect().top - heart.getBoundingClientRect().bottom),
      btnFont: cs.fontSize, btnBorder: cs.borderTopWidth + ' ' + cs.borderTopStyle,
      btnBorderColor: cs.borderTopColor, btnRadius: cs.borderTopLeftRadius,
      btnText: span.textContent.trim(),
      btnW: Math.round(br.width), natural, lines,
      btnInsideCard: br.left >= cr.left - 0.5 && br.right <= cr.right + 0.5,
      tapH: Math.round(br.height),
      isButton: btn.tagName.toLowerCase() === 'button',
      ctaThere: !!cta, h4Text: h4.textContent.trim(),
      docW: document.documentElement.scrollWidth, winW: window.innerWidth,
      cardH: Math.round(cr.height),
    };
  });
  ok(m.goldExists && m.goldIsSvg, 'the Save heart in the sentence is an inline SVG');
  ok(m.goldFill === '#F2D889', `it is the app's filled gold (${m.goldFill})`);
  ok(!m.hasEmojiHeart, 'no bare heart glyph left in that sentence (the red-emoji trap)');
  ok(m.isButton, 'the wishing control is a real <button>');
  ok(m.btnText === '+ Add anything you’re wishing for', `button reads "${m.btnText}"`);
  ok(parseFloat(m.btnFont) >= 13, `font is bigger: ${m.btnFont} (was 12px)`);
  ok(m.btnBorder === '1px solid', `it has a box: ${m.btnBorder}`);
  ok(m.btnBorderColor === 'rgb(216, 165, 46)', `box is the wishlist gold (${m.btnBorderColor})`);
  ok(m.btnRadius === '0px', 'squared, matching the card language');
  ok(m.btnInsideCard, 'button sits inside the card');
  ok(m.docW <= m.winW, 'no sideways page scroll');
  ok(m.tapH >= 34, `tap target is finger-sized (${m.tapH}px)`);
  ok(m.gapAboveHeart <= 12, `space above the open heart tightened (${m.gapAboveHeart}px)`);
  ok(m.gapBelowHeart <= 12, `space below the open heart tightened (${m.gapBelowHeart}px)`);
  ok(m.ctaThere && m.h4Text === 'Nothing saved yet', 'headline and Shop my style untouched');
  // ⚠️ MEASURED, not hoped for: at 13.5px the label needs 231px and the button
  // gets 260px at 390 (fits, 11px headroom) but only 245 at 375 and 230 at 360.
  // Below 390 it falls to two BALANCED lines deliberately -- shrinking the type
  // would undo her "bigger font" ask. Assert one line only where it is possible.
  if (w >= 390) ok(m.lines === 1, `label holds ONE line (needs ${m.natural}px, has ${m.btnW}px)`);
  else ok(m.lines <= 2, `wraps to at most two balanced lines at ${w} (needs ${m.natural}px, has ${m.btnW}px)`);
  ok(errs.length === 0, 'zero JS errors');
  console.log(`      (card ${m.cardH}px tall; button label needs ${m.natural}px)`);
  if (w === 390) await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'empty-390.png'), clip: { x: 0, y: 0, width: w, height: 760 } });
  if (w === 360) await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'empty-360.png'), clip: { x: 0, y: 0, width: w, height: 760 } });
  await page.close();
}

// Rasterise: is the heart in the sentence actually painted gold, not red?
{
  const SCALE = 6;
  const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: SCALE });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => openWishlist());
  await page.waitForTimeout(500);
  const b64 = (await (await page.$('#s-wishlist .wl-empty .we-goldh')).screenshot()).toString('base64');
  const m = await page.evaluate(async ({ b64 }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const cx = c.getContext('2d'); cx.drawImage(img, 0, 0);
    const d = cx.getImageData(0, 0, c.width, c.height).data;
    let gold = 0, red = 0, ink = 0;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i+1], b = d[i+2], a = d[i+3];
      if (a < 60) continue;
      // ⚠️ an element screenshot includes the CARD BACKGROUND behind the glyph.
      // Counting that as "ink" made a perfectly gold heart read 40% gold on the
      // first run. Only saturated pixels are ink here.
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      if (mx - mn < 45) continue;
      ink++;
      if (r > 150 && g > 110 && b < 190 && r - b > 45) gold++;      // gold family
      if (r > 170 && g < 110 && b < 110) red++;                     // emoji red
    }
    return { ink, gold, red, goldPct: +(100 * gold / Math.max(ink, 1)).toFixed(1) };
  }, { b64 });
  console.log('\n--- the Save heart, rasterised ---');
  ok(m.ink > 0, 'the heart paints something');
  ok(m.goldPct > 60, `it is painted GOLD (${m.goldPct}% of its ink)`);
  ok(m.red === 0, `no red pixels at all (${m.red})`);
  await page.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close(); server.close();
process.exit(fail ? 1 : 0);
