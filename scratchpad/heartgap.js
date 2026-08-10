// Her catch (2026-08-10): the RIGHT heart on the curated-by lines looks farther
// from the words than the left one. Both sit in identical boxes with the same
// flex gap, so if it looks asymmetric the INK must sit differently inside the
// box -- the two hearts are tilted in opposite directions. Measure the painted
// ink (the <path> rect, which includes the CSS rotation), not the element box.
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

const PROBE = (sel) => {
  const by = document.querySelector(sel);
  const svgs = [...by.querySelectorAll('svg.pinkheart')];
  const span = by.querySelector('span');
  const sr = span.getBoundingClientRect();
  // the real painted text edges (the span box can be wider than the glyphs)
  const rg = document.createRange(); rg.selectNodeContents(span);
  const tr = rg.getBoundingClientRect();
  const inkOf = (svg) => svg.querySelector('path').getBoundingClientRect();
  const L = svgs[0], R = svgs[1];
  const lb = L.getBoundingClientRect(), rb = R.getBoundingClientRect();
  const li = inkOf(L), ri = inkOf(R);
  // the LAST GLYPH's right edge, ignoring the trailing letter-space that
  // letter-spacing:.2em adds after the final character
  const t = span.firstChild;
  const lastCh = document.createRange();
  lastCh.setStart(t, t.textContent.length - 1); lastCh.setEnd(t, t.textContent.length);
  const lastR = lastCh.getBoundingClientRect();
  const firstCh = document.createRange();
  firstCh.setStart(t, 0); firstCh.setEnd(t, 1);
  const firstR = firstCh.getBoundingClientRect();
  return {
    trailingSpace: +(tr.right - lastR.right).toFixed(2),
    visGapL: +(firstR.left - li.right).toFixed(2),
    visGapR: +(ri.left - lastR.right).toFixed(2),
    // box-to-text gaps (what CSS thinks it is doing)
    boxGapL: +(tr.left - lb.right).toFixed(2),
    boxGapR: +(rb.left - tr.right).toFixed(2),
    // ink-to-text gaps (what her eye actually sees)
    inkGapL: +(tr.left - li.right).toFixed(2),
    inkGapR: +(ri.left - tr.right).toFixed(2),
    // how far the ink sits inside its own box, each side
    leftInkInsetR: +(lb.right - li.right).toFixed(2),
    rightInkInsetL: +(ri.left - rb.left).toFixed(2),
    boxW: +lb.width.toFixed(2), inkWL: +li.width.toFixed(2), inkWR: +ri.width.toFixed(2),
    gap: getComputedStyle(by).gap,
    rotL: getComputedStyle(L).transform, rotR: getComputedStyle(R).transform,
  };
};

for (const [label, open, sel] of [
  ['Trending', "openWardrobe('trend')", '#s-wardrobe .wdr-trend-by'],
  ['The Edit', 'showDream()', '.dc-tagline'],
]) {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(f => eval(f), open);
  await page.waitForTimeout(500);
  const m = await page.evaluate(PROBE, sel);
  console.log('\n' + label);
  console.log('  box gaps   L=' + m.boxGapL + '  R=' + m.boxGapR + '   (CSS gap ' + m.gap + ')');
  console.log('  INK gaps   L=' + m.inkGapL + '  R=' + m.inkGapR + '   (range box, includes trailing letter-space)');
  console.log('  VISIBLE    L=' + m.visGapL + '  R=' + m.visGapR + '   <-- glyph edge to heart ink, what she sees');
  console.log('  trailing letter-space after the last letter: ' + m.trailingSpace + 'px');
  console.log('  ink inset inside box: left-heart right edge ' + m.leftInkInsetR + ', right-heart left edge ' + m.rightInkInsetL);
  console.log('  box w ' + m.boxW + ', ink w ' + m.inkWL + ' / ' + m.inkWR);
  await page.close();
}
await browser.close(); server.close();
