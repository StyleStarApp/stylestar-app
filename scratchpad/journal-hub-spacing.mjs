// Measure her two catches on the hub page: does the intro paragraph still
// strand "Star." alone on a widow line, and is there real breathing room
// between the article list's own hairline and the footer's hairline now.
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const PORT = 8949;
const T = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.woff2':'font/woff2', '.png':'image/png' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  if (p === '/journal' || p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});
await new Promise(res => srv.listen(PORT, res));
const css = fs.readFileSync('scratchpad/fonts/gf.css', 'utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(http://localhost:${PORT}/scratchpad/fonts/$1)`);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

async function check(width) {
  const pg = await b.newPage({ viewport: { width, height: 1100 }, deviceScaleFactor: 2 });
  pg.setDefaultTimeout(6000);
  pg.setDefaultNavigationTimeout(6000);
  await pg.route('**/fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: css }));
  await pg.goto(`http://localhost:${PORT}/journal`, { waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(1800);
  await pg.evaluate(() => { const c = document.querySelector('.hm-entrance'); if (c) c.remove(); });
  await pg.waitForTimeout(400);

  const data = await pg.evaluate(() => {
    const activeId = document.querySelector('.scr.act')?.id;
    const scope = document.getElementById('s-journal-hub');
    const intro = scope.querySelector('.jhub-intro');
    // Count real visual lines of the intro paragraph by clustering text-node
    // rect tops (the established method: getClientRects returns one rect per
    // line AND per child element, so cluster by top rather than counting rects).
    const range = document.createRange();
    range.selectNodeContents(intro);
    const rects = [...range.getClientRects()];
    const tops = [...new Set(rects.map(r => Math.round(r.top)))].sort((a, b) => a - b);
    const lastLineRect = rects[rects.length - 1];
    const maxWidth = Math.max(...rects.map(r => r.width));

    // Walk every word, bucket it by which line-top its rect belongs to, so we
    // can print the ACTUAL words on each line rather than just widths.
    const words = intro.textContent.trim().split(/\s+/);
    const lineWords = tops.map(() => []);
    let idx = 0;
    for (const w of words) {
      const wr = document.createRange();
      const textNode = intro.firstChild;
      wr.setStart(textNode, idx);
      wr.setEnd(textNode, idx + w.length);
      const r = wr.getClientRects()[0];
      if (r) {
        const lineIdx = tops.findIndex(t => Math.abs(t - Math.round(r.top)) < 3);
        if (lineIdx >= 0) lineWords[lineIdx].push(w);
      }
      idx += w.length + 1;
    }

    const list = scope.querySelector('.jhub-list');
    const foot = scope.querySelector('.pg-foot');
    const listRect = list.getBoundingClientRect();
    const footRect = foot.getBoundingClientRect();
    const wrapRect = scope.querySelector('.story-wrap').getBoundingClientRect();

    return {
      activeId,
      wrapWidth: Math.round(wrapRect.width),
      lineBreakdown: lineWords.map(l => l.join(' ')),
      introLines: tops.length,
      lastLineWidth: Math.round(lastLineRect.width),
      maxLineWidth: Math.round(maxWidth),
      introText: intro.textContent.trim(),
      gapBetweenListAndFooter: Math.round(footRect.top - listRect.bottom),
      listMarginBottom: getComputedStyle(list).marginBottom,
      footMarginTop: getComputedStyle(foot).marginTop,
    };
  });
  console.log(`\n=== width ${width} ===`);
  console.log(data);
  await pg.screenshot({ path: `scratchpad/journal-hub-spacing-${width}.png` });
  await pg.close();
}

await check(390);
await check(360);
await check(320);
await b.close();
srv.close();
console.log('\ndone');
