// Renders for Cath (2026-08-09): the Menu drawer's type hierarchy.
// Her catches: STYLE/SHOP/BUILD/ABOUT group labels too small + faint
// (measured: 10.5px #8a8474 ≈ 3.5:1, below AA), and "Refine your
// Preferences" wrapping to 2 lines on her phone. Her idea: swap the fonts —
// serif for the group names, block letters for the items.
//   menufont-current.png  as live
//   menufont-a.png        A (her swap): groups in serif ink, items in Jost
//   menufont-b.png        B (full block): groups serif, items UPPERCASE Jost
//   menufont-c.png        C (no swap): items stay serif, groups promoted only
// Prints per-variant: widest row width vs the drawer's content box.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = import.meta.dirname;
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0].slice(1)));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const base = 'http://127.0.0.1:' + server.address().port;
const SEED = { userName: 'Sarah', answers: [6,6,6,6,6,6,6,6,6,6,6,6],
  topArchNames: ['Timeless Classic','Modern Muse','Coastal Chic'], portrait: 'x', motto: 'm' };
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

const VARIANTS = {
  a: `
    .menu-grp{font:400 16px/1.1 'DM Serif Display',Georgia,serif !important;letter-spacing:.02em !important;text-transform:none !important;color:#1a1a1a !important;margin:18px 0 5px !important}
    .menu-row{font:500 14.5px/1.3 'Jost',sans-serif !important;color:#26221c !important;padding:11px 2px !important}
  `,
  b: `
    .menu-grp{font:400 16px/1.1 'DM Serif Display',Georgia,serif !important;letter-spacing:.02em !important;text-transform:none !important;color:#1a1a1a !important;margin:18px 0 5px !important}
    .menu-row{font:600 12px/1.35 'Jost',sans-serif !important;letter-spacing:.07em !important;text-transform:uppercase !important;color:#26221c !important;padding:12px 2px !important}
  `,
  c: `
    .menu-grp{font:600 12px/1 'Jost',sans-serif !important;letter-spacing:.18em !important;text-transform:uppercase !important;color:#4a463e !important;margin:18px 0 5px !important}
  `
};
const GROUP_CASE = { a: s => s.charAt(0) + s.slice(1).toLowerCase(), b: s => s.charAt(0) + s.slice(1).toLowerCase() };

async function shoot(variant) {
  const page = await browser.newPage({ viewport: { width: 390, height: 1080 }, deviceScaleFactor: 2 });
  await page.addInitScript(d => localStorage.setItem('ss_data', JSON.stringify(d)), SEED);
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => { document.getElementById('ssEntrance')?.remove(); show('s-wb'); updateWbScreen(); menuOpen(); });
  await page.waitForTimeout(350);
  if (variant !== 'current') {
    await page.addStyleTag({ content: VARIANTS[variant] });
    if (GROUP_CASE[variant]) await page.evaluate(() => {
      // serif group names read in Title Case, not caps (CSS text-transform:none shows source text, which is already title case in markup? normalize)
      document.querySelectorAll('.menu-grp').forEach(g => { g.textContent = g.textContent.charAt(0).toUpperCase() + g.textContent.slice(1).toLowerCase(); });
    });
    await page.waitForTimeout(150);
  }
  const m = await page.evaluate(() => {
    const panel = document.querySelector('.menu-panel');
    const cs = getComputedStyle(panel);
    const content = panel.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    let widest = { w: 0, t: '' }, wraps = [];
    document.querySelectorAll('.menu-row').forEach(r => {
      const c = document.createElement('canvas').getContext('2d');
      const rcs = getComputedStyle(r);
      c.font = rcs.fontWeight + ' ' + rcs.fontSize + ' ' + rcs.fontFamily;
      const t = rcs.textTransform === 'uppercase' ? r.textContent.trim().toUpperCase() : r.textContent.trim();
      let w = c.measureText(t).width;
      const ls = parseFloat(rcs.letterSpacing) || 0;
      w += ls * t.length;
      if (w > widest.w) widest = { w: Math.round(w), t: r.textContent.trim() };
      const lh = parseFloat(rcs.lineHeight);
      if (r.getBoundingClientRect().height - parseFloat(rcs.paddingTop) - parseFloat(rcs.paddingBottom) > lh * 1.5) wraps.push(r.textContent.trim());
    });
    return { content: Math.round(content), widest, wraps };
  });
  console.log(variant + ': content box ' + m.content + 'px, widest row "' + m.widest.t + '" needs ' + m.widest.w + 'px' + (m.wraps.length ? ' — WRAPS: ' + m.wraps.join(', ') : ' — all one line'));
  const panel = await page.$('.menu-panel');
  await panel.screenshot({ path: path.join(OUT, 'menufont-' + variant + '.png') });
  console.log('wrote menufont-' + variant + '.png');
  await page.close();
}

for (const v of ['current', 'a', 'b', 'c']) await shoot(v);
await browser.close();
server.close();
