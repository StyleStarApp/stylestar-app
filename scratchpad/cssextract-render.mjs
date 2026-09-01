// Before/after render sweep for the CSS extraction (2026-09-01).
//
// The whole bar for this change is that it must be INVISIBLE to a human. A
// byte-level diff of index.html proves nothing about that -- only a pixel
// comparison of the real rendered screens does. So: run this once on the
// current file (--tag before), make the change, run it again (--tag after),
// then diff the PNGs pair by pair. Anything that moves is a regression.
//
// Serves the REAL typefaces locally: this sandbox's Chromium cannot reach
// fonts.googleapis.com, and a fallback render would hide any change that
// depends on real metrics. Same trick as scratchpad/renderfonts.mjs.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const PORT = 8947;
const TAG = (process.argv.find(a => a.startsWith('--tag=')) || '--tag=before').split('=')[1];
const OUT = path.join('scratchpad', 'cssx', TAG);
fs.mkdirSync(OUT, { recursive: true });

const T = { '.html':'text/html', '.js':'text/javascript', '.png':'image/png', '.json':'application/json',
  '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.css':'text/css', '.woff2':'font/woff2', '.ttf':'font/ttf' };

// Serves any real file from the repo (so /styles.css resolves after the
// change) and falls back to index.html for the SPA routes.
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  const f = path.join(ROOT, p === '/' ? 'index.html' : p.replace(/^\//, ''));
  if (f.startsWith(ROOT) && fs.existsSync(f) && fs.statSync(f).isFile()) {
    r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' });
    return fs.createReadStream(f).pipe(r);
  }
  r.writeHead(200, { 'content-type': 'text/html' });
  fs.createReadStream(path.join(ROOT, 'index.html')).pipe(r);
});
await new Promise(r => srv.listen(PORT, r));
const ORIGIN = 'http://localhost:' + PORT;

const gf = fs.readFileSync('scratchpad/fonts/gf.css', 'utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(${ORIGIN}/scratchpad/fonts/$1)`);

// A fully refined, returning woman -- so the personalised screens really
// render rather than falling back to an empty state. answers.length must be
// 12 or _hasQuizData() rejects the whole record (documented trap).
const SEED = {
  ss_data: JSON.stringify({
    userName: 'Catherine',
    answers: [6,4,7,5,3,8,6,5,4,7,3,6],
    topArchNames: ['Classic Sophisticate','Elevated Natural','Coastal Chic'],
    portrait: 'You have a beautifully grounded sense of style that reads as effortless without ever looking careless. Your instinct for clean lines and quiet colour is the thread that runs through everything you wear.',
    motto: 'Quiet confidence, always.'
  }),
  ss_email: 'test@example.com',
  ss_emailDone: '1',
  ss_prefs: JSON.stringify({ sizes:{ tops:['M'], bottoms:['8'], shoes:['8'] }, colorsLove:['Navy','Cream'],
    neverWear:['bodycon'], jewelry:'Gold', fit:'regular' }),
  ss_wardrobe: JSON.stringify({ pretap0:true, items:{ to1:1, dr3:1 }, wishlist:[] })
};

// Drive each screen through the app's OWN entry function where one exists --
// show('s-wardrobe') paints the page chrome but never builds the 100-row
// worksheet, which is where a large share of the CSS actually lives. `open`
// is called in preference to `screen`; both fall back to show().
const SCREENS = [
  ['welcomeback','/',       's-wb',        null],
  ['portrait',  '/results', 's-res',       null],
  ['faq',       '/faq',     null,          null],
  ['story',     '/story',   null,          null],
  ['privacy',   '/privacy', null,          null],
  ['terms',     '/terms',   null,          null],
  ['contact',   '/contact', null,          null],
  ['journal',   '/journal', null,          null],
  ['article',   '/journal/how-to-find-your-personal-style', null, null],
  ['mall',      '/',        's-shop',      'showShop'],
  ['edit',      '/',        's-dream',     'showDream'],
  ['wardrobe',  '/',        's-wardrobe',  'openWardrobe'],
  ['wdrtrend',  '/',        's-wardrobe',  'openWardrobeTrend'],
  ['wishlist',  '/',        's-wishlist',  'openWishlist'],
  ['refine',    '/',        's-pref',      'openPrefs'],
  ['analyze',   '/',        's-photo',     'showPhoto'],
  ['chat',      '/',        's-chat',      'openChat'],
  ['shopstyle', '/',        's-shopstyle', null]
];

// ⚠️ TWO SOURCES OF NONDETERMINISM had to be closed before a before/after
// pixel diff meant anything -- proved by running the SAME file twice and
// getting 9 differing pairs:
//   1. ANIMATIONS. The seal star shimmers forever and several screens fade in,
//      so two captures land at different points in the same animation. Frozen
//      with animation:none / transition:none, applied identically to both
//      sides. (A still cannot show a pulse; it can show a resting state.)
//   2. OFF-ORIGIN REQUESTS. Retail photo CDNs are unreachable from this
//      sandbox, so each hotlinked <img> fails and removes itself at a slightly
//      different moment -- which changes full-page HEIGHT between runs (the
//      Edit page varied by 644px). Aborting them up front makes every onerror
//      fire immediately and identically.
const FREEZE = `*,*::before,*::after{animation:none!important;transition:none!important;
  animation-duration:0s!important;transition-duration:0s!important;caret-color:transparent!important}`;
async function armFor(pg) {
  await pg.route('**/*', route => {
    const u = route.request().url();
    if (u.startsWith(ORIGIN) || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
    return route.abort();
  });
  await pg.addInitScript(css => {
    document.addEventListener('DOMContentLoaded', () => {
      const st = document.createElement('style');
      st.textContent = css;
      document.head.appendChild(st);
    });
  }, FREEZE);
}

const WIDTHS = [390, 320];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
let n = 0;

for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
  // Seed BEFORE any script runs, and never for the fresh-welcome capture.
  await ctx.addInitScript(seed => {
    for (const k in seed) localStorage.setItem(k, seed[k]);
  }, SEED);
  const page = await ctx.newPage();
  // Serve the real typefaces in place of the unreachable Google Fonts link.
  await page.route('**/css2*', route => route.fulfill({ contentType: 'text/css', body: gf }));
  await armFor(page);

  for (const [name, route, screen, opener] of SCREENS) {
    await page.goto(ORIGIN + route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    // Clear the entrance curtain, then drive to the requested screen through
    // the app's own show() so nothing is faked into place.
    await page.evaluate(([s, op]) => {
      document.querySelectorAll('.hm-entrance').forEach(e => e.remove());
      if (op === 'openWardrobeTrend') {
        if (typeof openWardrobe === 'function') openWardrobe();
        if (typeof wardrobeTab === 'function') wardrobeTab('trend');
      } else if (op && typeof window[op] === 'function') {
        window[op]();
      } else if (s && typeof show === 'function') {
        show(s);
      }
      if (s === 's-res') document.getElementById('s-res')?.classList.add('rv-open');
    }, [screen, opener]).catch(() => {});
    await page.waitForTimeout(500);
    await page.addStyleTag({ content: FREEZE }).catch(() => {});
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, `${name}-${w}.png`), fullPage: true });
    n++;
  }
  await ctx.close();

  // The fresh-visitor welcome screen, in a context with NO seed at all.
  const fresh = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
  const fp = await fresh.newPage();
  await fp.route('**/css2*', route => route.fulfill({ contentType: 'text/css', body: gf }));
  await armFor(fp);
  await fp.goto(ORIGIN + '/', { waitUntil: 'domcontentloaded' });
  await fp.waitForTimeout(300);
  await fp.evaluate(() => document.querySelectorAll('.hm-entrance').forEach(e => e.remove()));
  await fp.waitForTimeout(500);
  await fp.addStyleTag({ content: FREEZE }).catch(() => {});
  await fp.evaluate(() => document.fonts && document.fonts.ready);
  await fp.waitForTimeout(400);
  await fp.screenshot({ path: path.join(OUT, `welcome-${w}.png`), fullPage: true });
  n++;
  await fresh.close();
}
await browser.close();
srv.close();
console.log(`${TAG}: captured ${n} screenshots into ${OUT}`);
