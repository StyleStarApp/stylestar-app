// Footer final-look renders (2026-08-08, after Cath's from-zero rethink):
// the settled set — main row Home ★ Shop ★ FAQ (self-link omitted per page),
// quiet row Privacy · Terms · Instagram — shown WITH and WITHOUT the gold
// hairline, on My Story (her example page), for her hairline call.
//   foot2-plain.png    — no hairline
//   foot2-hairline.png — thin gold hairline above the quiet row
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

const IG = '<a class="ig-a" href="#" aria-label="Instagram"><svg class="ig-g" viewBox="0 0 24 24" fill="none" stroke="#6f6a63" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="#6f6a63" stroke="none"/></svg></a>';
// My Story page → its own link is omitted; My Story is CUT from all footers
// anyway, so the main row everywhere is at most Home ★ Shop ★ FAQ.
const MAIN = '<span class="lnk">Home</span><span class="star">&#9733;</span><span class="lnk">Shop</span><span class="star">&#9733;</span><span class="lnk">FAQ</span>';
const ROW2 = '<div class="sf-row2"><span class="lnk2">Privacy</span><span class="dot">&#183;</span><span class="lnk2">Terms</span><span class="dot">&#183;</span>' + IG + '</div>';

const OPTIONS = {
  plain: '<div class="sf-row">' + MAIN + '</div>' + ROW2,
  hairline: '<div class="sf-row">' + MAIN + '</div><div class="sf-hairwrap"><span class="sf-hair"></span></div>' + ROW2.replace('sf-row2', 'sf-row2 sf-tight')
};
const EXTRA_CSS = `
[data-std-foot] .sf-hairwrap{display:flex;justify-content:center;margin-top:10px}
[data-std-foot] .sf-hair{width:132px;height:1px;background:linear-gradient(90deg,transparent,#D8C285 18%,#D8C285 82%,transparent)}
[data-std-foot] .sf-tight{margin-top:7px}
`;

const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto(base + '/', { waitUntil: 'load' });
await page.waitForTimeout(2600);
await page.evaluate(() => showStory());
await page.waitForTimeout(400);
await page.addStyleTag({ content: EXTRA_CSS });

for (const [key, html] of Object.entries(OPTIONS)) {
  await page.evaluate((h) => {
    document.querySelector('#s-story [data-std-foot]').innerHTML = h;
    const f = document.querySelector('#s-story [data-std-foot]').getBoundingClientRect();
    window.scrollTo(0, f.top + window.scrollY - 120);
  }, html);
  await page.waitForTimeout(200);
  const clip = await page.evaluate(() => {
    const f = document.querySelector('#s-story [data-std-foot]').getBoundingClientRect();
    return { x: 0, y: Math.max(0, f.top - 60), width: 390, height: f.height + 90 };
  });
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'foot2-' + key + '.png'), clip });
  console.log('saved foot2-' + key + '.png');
}
if (errs.length) console.log('JS ERRORS: ' + errs.join(' | '));
await browser.close(); server.close();
