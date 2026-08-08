// Footer audit renders (2026-08-08, Cath's two catches):
//   (1) seven screens link to THEMSELVES in their own footer — every option
//       below omits the current page's link (shown on My Story, her example);
//   (2) the Privacy · Terms second row "does not look tidy" — the options
//       differ on how that row is treated.
// Per-option 2x images, her preferred phone-readable format:
//   foot-current.png  — as it is today (self-link included, row2 as-is)
//   foot-a.png        — self-link omitted, row2 untouched (lightest)
//   foot-b.png        — ONE row: everything folded together (with measurement)
//   foot-c.png        — two rows + a gold hairline rule above the quiet row
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
// On My Story, the "My Story" link is omitted in every option (her fix).
const MAIN3 = '<span class="lnk">Home</span><span class="star">&#9733;</span><span class="lnk">Shop</span><span class="star">&#9733;</span><span class="lnk">FAQ</span>';
const MAIN4 = '<span class="lnk">Home</span><span class="star">&#9733;</span><span class="lnk">Shop</span><span class="star">&#9733;</span><span class="lnk">My Story</span><span class="star">&#9733;</span><span class="lnk">FAQ</span>';

const OPTIONS = {
  current: {
    label: 'CURRENT — links to the page you are on; quiet second row',
    html: '<div class="sf-row">' + MAIN4 + '</div><div class="sf-row2"><span class="lnk2">Privacy</span><span class="dot">&#183;</span><span class="lnk2">Terms</span><span class="dot">&#183;</span>' + IG + '</div>'
  },
  a: {
    label: 'A — self-link removed, second row kept exactly as it is',
    html: '<div class="sf-row">' + MAIN3 + '</div><div class="sf-row2"><span class="lnk2">Privacy</span><span class="dot">&#183;</span><span class="lnk2">Terms</span><span class="dot">&#183;</span>' + IG + '</div>'
  },
  b: {
    label: 'B — everything on ONE row (Privacy & Terms join the main line)',
    html: '<div class="sf-row sf-one">' + MAIN3 + '<span class="star">&#9733;</span><span class="lnk">Privacy</span><span class="star">&#9733;</span><span class="lnk">Terms</span>' + IG + '</div>'
  },
  c: {
    label: 'C — a thin gold hairline above the quiet row, gap tightened',
    html: '<div class="sf-row">' + MAIN3 + '</div><div class="sf-hairwrap"><span class="sf-hair"></span></div><div class="sf-row2 sf-tight"><span class="lnk2">Privacy</span><span class="dot">&#183;</span><span class="lnk2">Terms</span><span class="dot">&#183;</span>' + IG + '</div>'
  }
};
// Option-specific CSS, id-scoped by nothing here because we swap ONE footer's
// innerHTML in place — the overrides ride inline <style> with distinct classes.
const EXTRA_CSS = `
[data-std-foot] .sf-one{row-gap:8px}
[data-std-foot] .sf-one .ig-a{margin-left:-2px}
[data-std-foot] .sf-hairwrap{display:flex;justify-content:center;margin-top:10px}
[data-std-foot] .sf-hair{width:132px;height:1px;background:linear-gradient(90deg,transparent,#D8C285 18%,#D8C285 82%,transparent)}
[data-std-foot] .sf-tight{margin-top:7px}
`;

for (const w of [390, 360]) {
  const page = await browser.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => showStory());
  await page.waitForTimeout(400);
  await page.addStyleTag({ content: EXTRA_CSS });

  for (const [key, opt] of Object.entries(OPTIONS)) {
    const m = await page.evaluate((html) => {
      const foot = document.querySelector('#s-story [data-std-foot]');
      foot.innerHTML = html;
      const fr = foot.getBoundingClientRect();
      const rows = [...foot.children].map(r => { const b = r.getBoundingClientRect(); return { w: Math.round(b.width), lines: Math.round(b.height) } });
      // does the main row wrap? compare tops of first and last link
      const links = foot.querySelectorAll('.sf-row .lnk, .sf-row .ig-a');
      const tops = [...links].map(l => Math.round(l.getBoundingClientRect().top));
      const contentW = Math.max(...[...foot.querySelectorAll('*')].map(e => e.getBoundingClientRect().right)) - Math.min(...[...foot.querySelectorAll('*')].map(e => e.getBoundingClientRect().left));
      return { wrapped: new Set(tops).size > 1, contentW: Math.round(contentW), footW: Math.round(fr.width) };
    }, opt.html);
    console.log(w + 'px ' + key + ': content ' + m.contentW + 'px in ' + m.footW + 'px' + (m.wrapped ? '  ⚠️ MAIN ROW WRAPS' : '  one line'));

    if (w === 390) {
      const box = await page.evaluate(() => {
        const f = document.querySelector('#s-story [data-std-foot]').getBoundingClientRect();
        window.scrollTo(0, f.top + window.scrollY - 120);
        return null;
      });
      await page.waitForTimeout(200);
      const clip = await page.evaluate(() => {
        const f = document.querySelector('#s-story [data-std-foot]').getBoundingClientRect();
        return { x: 0, y: Math.max(0, f.top - 60), width: 390, height: f.height + 90 };
      });
      await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'foot-' + key + '.png'), clip });
      console.log('  saved foot-' + key + '.png  (' + opt.label + ')');
    }
  }
  if (errs.length) console.log('JS ERRORS: ' + errs.join(' | '));
  await page.close();
}
await browser.close(); server.close();
