// Final proofs for the story-velvet simplification + viewport-fixed rod.
// story: pink bleed, ONE plain teal border on the scrolling card, no white line,
//        frame scrolls WITH the words (screenshot at top and mid-scroll).
// rod:   edge-to-edge at 390 (insets 0/0) and unchanged geometry vs chain.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const __dirname = import.meta.dirname;
const PORT = 8899;

const server = http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (fs.existsSync(f) && fs.statSync(f).isFile()) {
    const ext = path.extname(f);
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.jpg': 'image/jpeg' }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(fs.readFileSync(f));
  } else { res.writeHead(404); res.end('nf'); }
});

(async () => {
  await new Promise(r => server.listen(PORT, r));
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.addInitScript(() => {
    if (!localStorage.getItem('__seeded')) {
      localStorage.setItem('__seeded', '1');
      localStorage.setItem('ss_wardrobe', JSON.stringify({ pretap0: true, items: {}, wishlist: [
        { id: 'tan~sandals', n: 'Tan Kitten-Heel Mules', s: 'Sam Edelman', q: 'tan kitten heel mules' },
        { id: 'own~valentino', n: 'Black studded shoulder bag', s: 'Bloomingdales', own: true, url: 'https://www.bloomingdales.com/shop/product/valentino-bag?ID=123' }
      ] }));
    }
  });
  await page.goto('http://localhost:' + PORT + '/');
  await page.waitForTimeout(2600);

  // ---- MY STORY ----
  await page.evaluate(() => showStory());
  await page.waitForTimeout(700);
  const story = await page.evaluate(() => {
    const card = document.querySelector('.ss');
    const cs = getComputedStyle(card);
    const html = document.documentElement;
    return {
      velvet: html.classList.contains('story-velvet'),
      pageBg: getComputedStyle(document.body).backgroundColor,
      border: cs.borderTopWidth + ' ' + cs.borderTopColor,
      shadow: cs.boxShadow,
      position: cs.position,
      stFrame: !!document.querySelector('.st-frame')
    };
  });
  console.log('STORY:', JSON.stringify(story, null, 1));
  await page.screenshot({ path: path.join(__dirname, 'storyfix-top.png') });
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(400);
  // is any fixed element overlapping the story text mid-scroll?
  const overlap = await page.evaluate(() => {
    const els = [...document.querySelectorAll('#s-story *')].filter(e => getComputedStyle(e).position === 'fixed' && e.offsetParent !== null);
    return els.map(e => e.className);
  });
  console.log('fixed elements inside s-story mid-scroll (should be [] or only Menu chrome):', JSON.stringify(overlap));
  await page.screenshot({ path: path.join(__dirname, 'storyfix-mid.png') });

  // ---- WISHLIST ROD ----
  await page.evaluate(() => { window.scrollTo(0, 0); openWishlist(); });
  await page.waitForTimeout(700);
  const rod = await page.evaluate(() => {
    const r = document.querySelector('#s-wishlist .wl-rod').getBoundingClientRect();
    const chain = document.querySelector('.wl-chain').getBoundingClientRect();
    const cx = chain.left + chain.width / 2;
    return { rodLeft: r.left, rodRight: innerWidth - r.right, rodTop: r.top, pos: getComputedStyle(document.querySelector('#s-wishlist .wl-rod')).position,
      chainTop: chain.top, rodBottom: r.bottom, chainCenteredOffset: Math.abs(cx - innerWidth / 2) };
  });
  console.log('ROD:', JSON.stringify(rod, null, 1));
  const ok = rod.rodLeft === 0 && rod.rodRight === 0 && rod.pos === 'fixed' && rod.chainTop <= rod.rodBottom + 3;
  console.log(ok ? 'ROD GEOMETRY OK (edge-to-edge, chain meets rod)' : 'ROD GEOMETRY FAIL');
  await page.screenshot({ path: path.join(__dirname, 'rodfix-top.png') });

  await browser.close();
  server.close();
})();
