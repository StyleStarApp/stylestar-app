// Her picks, 2026-08-10:
//  1. the Edit bleeds its own Curated-by-Catherine turquoise #0FA6B6
//  2. Your Wardrobe List flips with the tab -- My List gold bleed / black frame,
//     What's Trending black bleed / gold frame, stitches unchanged either way
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

// ⚠️ frameW, not just the colour: borderTopColor still reports a value when the
// border-style is none, so a colour-only probe would happily "pass" on a frame
// that is not painted at all. That exact false positive showed up when the
// wardrobe frame was removed.
const skin = () => ({
  bleed: getComputedStyle(document.body).backgroundColor,
  frame: getComputedStyle(document.querySelector('.ss')).borderTopColor,
  frameW: getComputedStyle(document.querySelector('.ss')).borderTopWidth,
  stitchContent: getComputedStyle(document.querySelector('.ss'), '::before').content,
  cls: document.documentElement.className,
});

// ⚠️ DELIBERATE REWRITE (her rethink 2026-08-10), not a silenced test. The
// wardrobe's gold/black tab flip is GONE -- bleed, frame and stitch with it --
// so the gold constants it used are gone too. What remains is the bleed FAMILY:
// the Edit's turquoise, My Story's pink, the Wishlist's black. Those are the
// pages that are ABOUT Catherine; the wardrobe is a tool and now sits on linen.
const BLACK = 'rgb(26, 26, 26)', TEAL = 'rgb(15, 166, 182)';
const LINEN = 'rgb(245, 243, 239)', PLAIN = LINEN;

for (const w of [390, 360]) {
  const page = await browser.newPage({ viewport: { width: w, height: 780 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  console.log(`\n--- @ ${w} ---`);

  // 1. the Edit
  await page.evaluate(() => showDream());
  await page.waitForTimeout(500);
  const e = await page.evaluate(skin);
  const lettering = await page.evaluate(() => getComputedStyle(document.querySelector('.dc-tagline')).color);
  ok(e.bleed === TEAL, `Edit bleeds the turquoise (${e.bleed})`);
  ok(e.bleed === lettering, `it is the EXACT colour of the Curated-by lettering (${lettering})`);

  // 2. ▶ HER RETHINK (2026-08-10): the wardrobe's bleed AND frame are GONE, and
  //    so is the per-tab flip. This block used to assert the gold/black mirror;
  //    it now asserts the opposite, DELIBERATELY. The rule behind it: colour
  //    bleeds belong on the pages that are ABOUT Catherine, never on a working
  //    tool where she is judging garment colours. Detail lives in wdrcalmcheck.js.
  await page.evaluate(() => openWardrobe('list'));
  await page.waitForTimeout(700);
  const l = await page.evaluate(skin);
  ok(l.bleed === LINEN, `My List sits on the app's own linen, no bleed (${l.bleed})`);
  ok(l.frameW === '0px', `My List has no frame (${l.frameW})`);
  ok(l.stitchContent === 'none', 'the dashed stitch is gone');

  // 3. What's Trending must look IDENTICAL -- that is the whole point of
  //    dropping the flip, and this is the assertion that fails if it returns.
  await page.evaluate(() => wardrobeTab('trend'));
  await page.waitForTimeout(500);
  const t = await page.evaluate(skin);
  ok(t.bleed === l.bleed && t.frameW === l.frameW,
     'Trending is the SAME treatment as My List (the flip is gone)');
  ok(!/wdr-(gold|black)/.test(t.cls), `no bleed class on the tab switch (${t.cls || 'none'})`);

  // ⚠️ the screen can be opened STRAIGHT onto trending -- openWardrobe('trend')
  // does that from the Build hub, so it must be right without a tab tap.
  await page.evaluate(() => show('s-wb'));
  await page.waitForTimeout(300);
  await page.evaluate(() => openWardrobe('trend'));
  await page.waitForTimeout(700);
  const direct = await page.evaluate(skin);
  ok(direct.bleed === LINEN && direct.frameW === '0px', 'opening straight onto Trending is calm too');

  // leaving the wardrobe clears it
  await page.evaluate(() => show('s-wb'));
  await page.waitForTimeout(400);
  const gone = await page.evaluate(skin);
  ok(gone.bleed === PLAIN, `leaving the wardrobe clears the bleed (${gone.bleed})`);
  ok(!/wdr-gold|wdr-black/.test(gone.cls), `no stray classes left (${gone.cls.trim() || 'none'})`);

  // and the other velvets still work
  await page.evaluate(() => showStory());
  await page.waitForTimeout(400);
  ok((await page.evaluate(skin)).bleed === 'rgb(244, 154, 193)', 'My Story pink is untouched');
  await page.evaluate(() => openWishlist());
  await page.waitForTimeout(400);
  ok((await page.evaluate(skin)).bleed === BLACK, 'the Wishlist black velvet is untouched');

  ok(errs.length === 0, `zero JS errors (${errs.slice(0, 2).join(' | ')})`);

  if (w === 390) {
    for (const [fn, name] of [['showDream()', 'velvet-edit'], ["openWardrobe('list')", 'velvet-list'], ["openWardrobe('trend')", 'velvet-trend']]) {
      await page.evaluate(f => eval(f), fn);
      await page.waitForTimeout(700);
      await page.screenshot({ path: path.join(ROOT, 'scratchpad', name + '.png'), clip: { x: 0, y: 0, width: w, height: 560 } });
    }
  }
  await page.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close(); server.close();
process.exit(fail ? 1 : 0);
