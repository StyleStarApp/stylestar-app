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

const skin = () => ({
  bleed: getComputedStyle(document.body).backgroundColor,
  frame: getComputedStyle(document.querySelector('.ss')).borderTopColor,
  stitch: getComputedStyle(document.querySelector('.ss'), '::before').borderTopColor,
  stitchStyle: getComputedStyle(document.querySelector('.ss'), '::before').borderTopStyle,
  cls: document.documentElement.className,
});

// ⚠️ DELIBERATE UPDATE (her call 2026-08-10), not a silenced test: the My List
// BLEED moved from the star gold #E0B84C to #EDD98F. #E0B84C is an accent colour
// doing an accent's job and read too gold as a full-page backdrop. The Trending
// FRAME keeps the star gold, so the two are no longer exact colour swaps of each
// other -- that assertion is replaced by one that pins each side on its own.
const GOLD = 'rgb(224, 184, 76)', BLEED_GOLD = 'rgb(237, 217, 143)',
      BLACK = 'rgb(26, 26, 26)', TEAL = 'rgb(15, 166, 182)';
const PLAIN = 'rgb(245, 243, 239)';

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

  // 2. My List = gold bleed, black frame
  await page.evaluate(() => openWardrobe('list'));
  await page.waitForTimeout(700);
  const l = await page.evaluate(skin);
  ok(l.bleed === BLEED_GOLD, `My List bleeds the softer yellow (${l.bleed})`);
  ok(l.frame === BLACK, `My List frame stays black (${l.frame})`);
  ok(l.stitchStyle === 'dashed', 'the stitch is still dashed');
  const stitchOnList = l.stitch;

  // 3. What's Trending = the opposite pairing
  await page.evaluate(() => wardrobeTab('trend'));
  await page.waitForTimeout(500);
  const t = await page.evaluate(skin);
  ok(t.bleed === BLACK, `Trending bleeds black (${t.bleed})`);
  ok(t.frame === GOLD, `Trending frame turns gold (${t.frame})`);
  // The two tabs still INVERT (one bleeds dark and frames light, the other the
  // reverse); they are no longer the same two hex values swapped.
  ok(t.bleed === l.frame, 'Trending bleeds what My List frames (still inverted)');
  ok(t.frame !== t.bleed && l.frame !== l.bleed, 'each tab still contrasts its own frame against its own bleed');
  ok(t.stitch === stitchOnList && t.stitchStyle === 'dashed', `the stitches are unchanged (${t.stitch})`);

  // switching back
  await page.evaluate(() => wardrobeTab('list'));
  await page.waitForTimeout(400);
  const back = await page.evaluate(skin);
  ok(back.bleed === BLEED_GOLD && back.frame === BLACK, 'switching back to My List restores yellow/black');

  // ⚠️ the screen can be opened STRAIGHT onto trending -- openWardrobe('trend')
  // does that from the Build hub, so the skin must be right without a tab tap.
  await page.evaluate(() => show('s-wb'));
  await page.waitForTimeout(300);
  await page.evaluate(() => openWardrobe('trend'));
  await page.waitForTimeout(700);
  const direct = await page.evaluate(skin);
  ok(direct.bleed === BLACK && direct.frame === GOLD, 'opening straight onto Trending gets the black/gold skin');

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
