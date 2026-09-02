// 🚨 REPRODUCES AND VERIFIES THE FIX FOR CATHERINE'S "logo and photo not
// appearing" report (2026-09-02). Every render harness in this project's
// history loaded the app at ROOT ("/") and then SPA-navigated to a screen via
// openJournalArticle()/show() -- which means every <img> tag was already
// parsed (and its relative src already resolved) against the ROOT base URL
// BEFORE any client-side routing ever touched the address bar. That is why
// this bug was invisible to measure2.mjs, measure3.mjs, article2.mjs and
// every other test: none of them ever did a REAL, FULL navigation straight to
// a two-segment URL, which is exactly what happens the moment a real visitor
// taps a shared /journal/<slug> link.
//
// ▶ THE MECHANISM: nearly every <img src="..."> and <link href="..."> in the
// whole file was written WITHOUT a leading slash ("logo-star.png", not
// "/logo-star.png"). A relative URL resolves against the CURRENT DOCUMENT
// ADDRESS, stripping only its final path segment. On "/" or any ONE-segment
// route ("/journal", "/faq", "/story"...) that strips down to "/" either way,
// so it has always accidentally worked. "/journal/<slug>" and "/list/<token>"
// are the ONLY two-segment routes this site has ever had -- stripping the
// slug leaves "/journal/", so "logo-star.png" resolved to
// ".../journal/logo-star.png", which 404s. Every relative asset on the page
// breaks the same way: the masthead logo (her "logo not showing"), the
// og-journal hero image (her "photo not appearing"), even the manifest and
// apple-touch-icon links in <head>.
//
// styles.css already carries the correct lesson in its own comment ("this
// href must stay ABSOLUTE, a relative one 404s on /journal/<slug>") -- it
// just was never applied to the <img>/<link> tags. Fixed 2026-09-02: every
// one of them now carries a leading "/".
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve('/home/user/stylestar-app'), PORT = 8971;
const T = { '.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json',
  '.svg':'image/svg+xml','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2' };
const RAW = fs.readFileSync(ROOT + '/index.html', 'utf8');
// The exact same mutation reverted, to PROVE this suite would have caught the
// real bug -- a scratch buffer only, the real file on disk is never touched.
const BROKEN = RAW
  .replace('src="/og-journal-personal-style.png"', 'src="og-journal-personal-style.png"')
  .replace('src="/og-journal-fall-florida.png"', 'src="og-journal-fall-florida.png"')
  .replace(/class="pp-lh-logo go-home"/g, m => m) // (logos share one src string, handled next)
  ;
// (the masthead logo's src="/logo-star.png" is identical across every use, so
// one global un-fix covers all of them, including both journal mastheads)
const BROKEN_ALL = BROKEN.replaceAll('src="/logo-star.png"', 'src="logo-star.png"');

function makeServer(html) {
  return http.createServer((q, r) => {
    const p = decodeURIComponent(q.url.split('?')[0]);
    // Mimic netlify.toml: /journal/<slug> is a REWRITE to index.html content,
    // served WHILE THE BROWSER'S ADDRESS BAR STAYS ON THE TWO-SEGMENT PATH --
    // that address, not the file on disk, is what the browser uses to resolve
    // every relative URL in the document it just received.
    if (p === '/' || p.startsWith('/journal/') || p === '/journal') {
      r.writeHead(200, { 'content-type': 'text/html' });
      return r.end(html);
    }
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
    r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(r);
  });
}

let pass = 0, fail = 0;
const ok = (n, c, x) => { c ? (pass++, console.log('  ✓ ' + n)) : (fail++, console.log('  ✗ ' + n + (x ? '  → ' + x : ''))); };

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

// ⚠️ THIS LOCAL SERVER SERVES THE RAW, UNTRIMMED index.html FOR EVERY
// /journal/* PATH -- the real Netlify edge function trims the body
// server-side to exactly ONE screen (proven in article2.mjs), which this
// harness does not reproduce. So a bare `.jrnl-img` here can match the
// WRONG article (whichever comes first in DOM order) purely as a test
// artifact -- caught live: the first run of this file reported the
// fall-florida route resolving to the personal-style image, which was this
// harness picking up #s-journal's copy, not a real bug. Scope every
// selector to the screen id the route actually opens, matching what a real
// visitor's trimmed page would contain.
async function checkArticle(html, path, imgClass, imgFile, expectBroken) {
  const srv = makeServer(html);
  await new Promise(r => srv.listen(PORT, r));
  const ctx = await b.newContext({ viewport: { width: 390, height: 1200 } });
  const pg = await ctx.newPage();
  const failedRequests = [];
  pg.on('requestfailed', req => failedRequests.push(req.url()));
  pg.on('response', res => { if (res.status() === 404) failedRequests.push(res.url() + ' (404)'); });
  // A REAL, FULL navigation straight to the two-segment URL -- never a root
  // load followed by a client-side transition. This is what a tap on a
  // shared link actually does.
  await pg.goto(`http://localhost:${PORT}${path}`, { waitUntil: 'load' });
  await pg.waitForTimeout(900);
  const info = await pg.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    return { resolvedSrc: el.src, rawSrc: el.getAttribute('src'),
             naturalWidth: el.naturalWidth, complete: el.complete };
  }, imgClass);
  await ctx.close(); srv.close();
  const label = expectBroken ? '[NEGATIVE CONTROL] ' : '';
  const resolvesRight = info && info.resolvedSrc === `http://localhost:${PORT}/${imgFile}`;
  if (expectBroken) {
    // A real negative control PASSES when the old (reverted) markup genuinely
    // resolves WRONG -- proving this harness would have caught the bug --
    // never by asserting the same "resolves right" condition and expecting
    // the harness itself to fail.
    ok(label + `${path} -> ${imgClass} resolves WRONG (proves this harness catches the real bug)`,
       !resolvesRight, info ? info.resolvedSrc : 'element missing');
    ok(label + `${path} -> ${imgClass} actually FAILS to load (proves the control is real)`,
       !(info && info.naturalWidth > 0), info ? `naturalWidth=${info.naturalWidth}` : '');
  } else {
    ok(`${path} -> ${imgClass} resolves to the ROOT file, not /journal/...`,
       resolvesRight, info ? info.resolvedSrc : 'element missing');
    ok(`${path} -> ${imgClass} actually LOADS (naturalWidth > 0)`,
       info && info.naturalWidth > 0, info ? `naturalWidth=${info.naturalWidth}` : '');
    ok(`${path} -> no failed/404 requests for this asset`,
       !failedRequests.some(u => u.includes(imgFile)), failedRequests.join(', '));
  }
}

console.log('== THE FIX, on the real (current) file ==');
await checkArticle(RAW, '/journal/how-to-find-your-personal-style', '#s-journal .jrnl-img', 'og-journal-personal-style.png', false);
await checkArticle(RAW, '/journal/how-to-dress-for-fall-in-florida', '#s-journal-fall-florida .jrnl-img', 'og-journal-fall-florida.png', false);
// The masthead logo on the article page itself -- her literal "logo not showing".
await checkArticle(RAW, '/journal/how-to-find-your-personal-style', '#s-journal .pp-lh-logo', 'logo-star.png', false);
await checkArticle(RAW, '/journal/how-to-dress-for-fall-in-florida', '#s-journal-fall-florida .pp-lh-logo', 'logo-star.png', false);

console.log('\n== NEGATIVE CONTROL: the pre-fix file, same test, must fail ==');
await checkArticle(BROKEN_ALL, '/journal/how-to-find-your-personal-style', '#s-journal .jrnl-img', 'og-journal-personal-style.png', true);
await checkArticle(BROKEN_ALL, '/journal/how-to-dress-for-fall-in-florida', '#s-journal-fall-florida .jrnl-img', 'og-journal-fall-florida.png', true);
await checkArticle(BROKEN_ALL, '/journal/how-to-find-your-personal-style', '#s-journal .pp-lh-logo', 'logo-star.png', true);

console.log('\n== CONTROL: root ("/") is untouched by this, still works either way ==');
await checkArticle(RAW, '/', '.wb-word-img', 'logo-star-text.png', false).catch(() => {});
// the welcome logo lives under a different id at boot; check the one that is
// actually in the DOM on a fresh load instead
{
  const srv = makeServer(RAW);
  await new Promise(r => srv.listen(PORT, r));
  const ctx = await b.newContext({ viewport: { width: 390, height: 1200 } });
  const pg = await ctx.newPage();
  await pg.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
  await pg.waitForTimeout(1200);
  const info = await pg.evaluate(() => {
    const el = document.querySelector('img.logo-img') || document.querySelector('.ss-star-logo');
    return el ? { resolvedSrc: el.src, naturalWidth: el.naturalWidth } : null;
  });
  await ctx.close(); srv.close();
  ok('root "/": a logo still resolves to the root file and loads',
     info && info.resolvedSrc === `http://localhost:${PORT}/logo-star.png` && info.naturalWidth > 0,
     info ? JSON.stringify(info) : 'element missing');
}

await b.close();
console.log('\n' + (fail ? `${fail} FAILED` : `all ${pass} checks passed`));
process.exit(fail ? 1 : 0);
