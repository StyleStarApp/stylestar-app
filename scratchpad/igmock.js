// Where should the Instagram link live? Render the two placements on the real
// pages so Cath can pick. Nothing is built yet. Per-option 2x images.
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

const IG = `<svg class="ig-g" viewBox="0 0 24 24" fill="none" stroke="#6f6a63" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="#6f6a63" stroke="none"/></svg>`;

const label = (t) => `<div style="font:700 12px/1.35 'Jost',sans-serif;letter-spacing:.06em;color:#fff;background:#1a1a1a;padding:9px 10px;text-align:center;margin:0 0 12px;border-radius:4px">${t}</div>`;

const OPTIONS = {
  'foot-current': {
    label: 'FOOTER AS IT IS NOW',
    run: async (page) => { await page.evaluate(() => showStory()); }
  },
  'foot-inline': {
    label: 'FOOTER A · glyph on the quiet row, after Terms',
    run: async (page, IG) => {
      await page.evaluate(() => showStory());
      await page.evaluate((ig) => {
        const s = document.createElement('style');
        s.textContent = `[data-std-foot] .ig-g{width:15px;height:15px;display:block}
[data-std-foot] .ig-a{display:flex;align-items:center;cursor:pointer}`;
        document.head.appendChild(s);
        document.querySelectorAll('#s-story [data-std-foot] .sf-row2').forEach(r => {
          r.insertAdjacentHTML('beforeend', '<span class="dot">&#183;</span><span class="ig-a">' + ig + '</span>');
        });
      }, IG);
    }
  },
  'foot-own-line': {
    label: 'FOOTER B · glyph on its own line, centred',
    run: async (page, IG) => {
      await page.evaluate(() => showStory());
      await page.evaluate((ig) => {
        const s = document.createElement('style');
        s.textContent = `[data-std-foot] .ig-g{width:19px;height:19px;display:block}
[data-std-foot] .sf-row3{display:flex;justify-content:center;margin-top:11px}
[data-std-foot] .sf-row3 .ig-a{cursor:pointer;padding:3px}`;
        document.head.appendChild(s);
        document.querySelectorAll('#s-story [data-std-foot] .sf-row2').forEach(r => {
          r.insertAdjacentHTML('afterend', '<div class="sf-row3"><span class="ig-a">' + ig + '</span></div>');
        });
      }, IG);
    }
  },
  'menu-row': {
    label: 'MENU · a named row under Share Style Star',
    run: async (page) => {
      await page.evaluate(() => menuOpen());
      await page.evaluate(() => {
        const rows = [...document.querySelectorAll('.menu-row')];
        const share = rows.find(r => /Share Style Star/.test(r.textContent));
        share.insertAdjacentHTML('afterend', '<div class="menu-row">Follow on Instagram</div>');
      });
    }
  }
};

for (const [key, opt] of Object.entries(OPTIONS)) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await opt.run(page, IG);
  await page.waitForTimeout(350);

  const shot = path.join(ROOT, 'scratchpad', 'ig-' + key + '.png');
  if (key === 'menu-row') {
    await page.locator('#menuPanel').screenshot({ path: shot });
  } else {
    const sel = '#s-story [data-std-foot]';
    // put the label directly above the footer, then scroll the pair into view
    await page.evaluate(({ s, l }) => {
      const t = document.querySelector(s);
      t.insertAdjacentHTML('beforebegin', '<div id="__lbl">' + l + '</div>');
      document.getElementById('__lbl').scrollIntoView({ block: 'center' });
    }, { s: sel, l: label(opt.label) });
    await page.waitForTimeout(300);
    const box = await page.evaluate((s) => {
      const a = document.getElementById('__lbl').getBoundingClientRect();
      const b = document.querySelector(s).getBoundingClientRect();
      const top = Math.max(0, a.top - 8);
      const h = Math.min(window.innerHeight - top, (b.bottom - a.top) + 20);
      return { x: 0, y: top, width: 390, height: Math.max(40, h) };
    }, sel);
    await page.screenshot({ path: shot, clip: box });
  }

  // width safety at 360 for the footer options
  if (key.startsWith('foot')) {
    await page.setViewportSize({ width: 360, height: 844 });
    await page.waitForTimeout(250);
    const over = await page.evaluate(() => {
      const f = document.querySelector('#s-story [data-std-foot]');
      const r = f.getBoundingClientRect();
      return Math.round(Math.max(0, ...[...f.querySelectorAll('*')].map(e => e.getBoundingClientRect().right)) - r.right);
    });
    console.log('  360px overflow: ' + over + 'px');
  }
  if (errs.length) console.log('  JS ERRORS: ' + errs.join(' | '));
  console.log('rendered ig-' + key + '.png');
  await page.close();
}
await browser.close(); server.close();
