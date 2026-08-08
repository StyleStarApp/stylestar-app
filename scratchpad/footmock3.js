// Footer harmony renders (2026-08-08, Cath's catch on the final-look pair):
// "gold stars on top, gray bullets below, different sizes — doesn't look right."
// Three ways to make the two rows one family, all with the Instagram glyph in
// its REAL brand gradient (her ask — the recognizable form is the gradient
// tile with the white camera):
//   foot3-a.png — separators unified: tiny gold stars on the quiet row too
//   foot3-b.png — one voice: both rows the same size, stars everywhere
//   foot3-c.png — middle: quiet row up to 13px, separators gold dots
//   foot3-d.png — HER layout: Home * Shop * [IG tile] / Privacy * Terms * FAQ
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

// The real Instagram glyph: gradient rounded square, white camera. Gradient is
// the official-feel radial (yellow low-left through orange/pink to purple).
const IG_REAL = '<a class="ig-a" href="#" aria-label="Instagram"><svg class="ig-real" viewBox="0 0 24 24">'
  + '<defs><radialGradient id="igG" cx="30%" cy="107%" r="150%">'
  + '<stop offset="0" stop-color="#FDF497"/><stop offset=".09" stop-color="#FDF497"/>'
  + '<stop offset=".45" stop-color="#FD5949"/><stop offset=".6" stop-color="#D6249F"/>'
  + '<stop offset=".9" stop-color="#285AEB"/></radialGradient></defs>'
  + '<rect x="1.5" y="1.5" width="21" height="21" rx="5.4" fill="url(#igG)"/>'
  + '<circle cx="12" cy="12" r="4.4" fill="none" stroke="#fff" stroke-width="1.7"/>'
  + '<circle cx="17.4" cy="6.6" r="1.25" fill="#fff"/>'
  + '</svg></a>';

const MAIN = '<span class="lnk">Home</span><span class="star">&#9733;</span><span class="lnk">Shop</span><span class="star">&#9733;</span><span class="lnk">FAQ</span>';

const OPTIONS = {
  a: {
    label: 'A — quiet row keeps its size, separators become tiny gold stars',
    html: '<div class="sf-row">' + MAIN + '</div>'
      + '<div class="sf-row2"><span class="lnk2">Privacy</span><span class="star s2">&#9733;</span><span class="lnk2">Terms</span><span class="star s2">&#9733;</span>' + IG_REAL + '</div>'
  },
  b: {
    label: 'B — one voice: both rows the same size, gold stars everywhere',
    html: '<div class="sf-row">' + MAIN + '</div>'
      + '<div class="sf-row2 sf-big"><span class="lnk2 l-big">Privacy</span><span class="star sb">&#9733;</span><span class="lnk2 l-big">Terms</span><span class="star sb">&#9733;</span>' + IG_REAL + '</div>'
  },
  c: {
    label: 'C — middle: quiet row at 13px, separators gold dots',
    html: '<div class="sf-row">' + MAIN + '</div>'
      + '<div class="sf-row2"><span class="lnk2 l-mid">Privacy</span><span class="dot gdot">&#183;</span><span class="lnk2 l-mid">Terms</span><span class="dot gdot">&#183;</span>' + IG_REAL + '</div>'
  },
  d: {
    label: 'D — Instagram RIGHT: Home * Shop * [IG]',
    html: '<div class="sf-row"><span class="lnk">Home</span><span class="star">&#9733;</span><span class="lnk">Shop</span><span class="star">&#9733;</span>' + IG_REAL + '</div>'
      + '<div class="sf-row2 sf-big"><span class="lnk2 l-big">Privacy</span><span class="star sb">&#9733;</span><span class="lnk2 l-big">Terms</span><span class="star sb">&#9733;</span><span class="lnk2 l-big">FAQ</span></div>'
  },
  dmid: {
    label: 'D-middle — Instagram CENTER: Home * [IG] * Shop',
    html: '<div class="sf-row"><span class="lnk">Home</span><span class="star">&#9733;</span>' + IG_REAL + '<span class="star">&#9733;</span><span class="lnk">Shop</span></div>'
      + '<div class="sf-row2 sf-big"><span class="lnk2 l-big">Privacy</span><span class="star sb">&#9733;</span><span class="lnk2 l-big">Terms</span><span class="star sb">&#9733;</span><span class="lnk2 l-big">FAQ</span></div>'
  },
  dleft: {
    label: 'D-left — Instagram LEFT: [IG] * Home * Shop',
    html: '<div class="sf-row">' + IG_REAL + '<span class="star">&#9733;</span><span class="lnk">Home</span><span class="star">&#9733;</span><span class="lnk">Shop</span></div>'
      + '<div class="sf-row2 sf-big"><span class="lnk2 l-big">Privacy</span><span class="star sb">&#9733;</span><span class="lnk2 l-big">Terms</span><span class="star sb">&#9733;</span><span class="lnk2 l-big">FAQ</span></div>'
  }
};
const EXTRA_CSS = `
[data-std-foot] .ig-real{width:16px;height:16px;display:block}
[data-std-foot] .sf-row2 .star.s2{color:#E6C24E;font-size:9px;line-height:1}
[data-std-foot] .sf-row2 .star.sb{color:#E6C24E;font-size:12px;line-height:1}
[data-std-foot] .sf-big{gap:10px}
[data-std-foot] .l-big{font-size:14px}
[data-std-foot] .l-mid{font-size:13px}
[data-std-foot] .sf-row2 .dot.gdot{color:#E6C24E;font-size:13px}
`;

const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto(base + '/', { waitUntil: 'load' });
await page.waitForTimeout(2600);
await page.evaluate(() => showStory());
await page.waitForTimeout(400);
await page.addStyleTag({ content: EXTRA_CSS });

for (const [key, opt] of Object.entries(OPTIONS)) {
  await page.evaluate((h) => {
    document.querySelector('#s-story [data-std-foot]').innerHTML = h;
    const f = document.querySelector('#s-story [data-std-foot]').getBoundingClientRect();
    window.scrollTo(0, f.top + window.scrollY - 120);
  }, opt.html);
  await page.waitForTimeout(200);
  const clip = await page.evaluate(() => {
    const f = document.querySelector('#s-story [data-std-foot]').getBoundingClientRect();
    return { x: 0, y: Math.max(0, f.top - 60), width: 390, height: f.height + 90 };
  });
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'foot3-' + key + '.png'), clip });
  console.log('saved foot3-' + key + '.png  (' + opt.label + ')');
}
if (errs.length) console.log('JS ERRORS: ' + errs.join(' | '));
await browser.close(); server.close();
