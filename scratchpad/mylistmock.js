// Renders 3 placements for Cath's "clean list of what she starred" idea.
// A: the end-of-list payoff block grows the named list (her bottom instinct)
// B: a "just my list" filter that collapses the worksheet to starred rows
// C: a summary card up top, above the worksheet
// Seeds 6 starred items across categories. All mock CSS is id-scoped (#mkX).
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

const STARRED = { to1: 'want', bo1: 'want', dr5: 'want', ja5: 'want', sh1: 'want', bg8: 'want' };

async function openPage() {
  const p = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(base + '/', { waitUntil: 'load' });
  await p.evaluate((starred) => {
    localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' }));
    localStorage.setItem('ss_wardrobe', JSON.stringify({ items: starred, custom: [], hidden: [], wishlist: [], pretap0: true }));
  }, STARRED);
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(2600);
  await p.evaluate(() => openWardrobe('list'));
  await p.waitForTimeout(700);
  return p;
}

// The starred items with their categories, read from the live table so names never drift.
function getPicks() {
  const picks = [];
  wardrobeItems.forEach(c => c.items.forEach(it => {
    if (wardrobeData.items[it.id] === 'want') picks.push({ id: it.id, n: it.n, cat: c.cat });
  }));
  return picks;
}
const PICKER = getPicks.toString();

/* ---------- A: the end-of-list block names the pieces ---------- */
{
  const p = await openPage();
  await p.evaluate((PICKER) => {
    const picks = new Function('return (' + PICKER + ')()')();
    const end = document.querySelector('#wdrShopEnd .wdr-shopend');
    const css = document.createElement('style');
    css.textContent = `
      #mkA{border:1px solid #D6C9A8;background:#fff;margin:12px 0 14px;padding:13px 14px 11px;text-align:left}
      #mkA .mka-row{display:flex;align-items:baseline;gap:9px;padding:6.5px 0;border-bottom:1px solid #EFEAE0}
      #mkA .mka-row:last-child{border-bottom:none}
      #mkA .mka-star{flex:none;width:14px;height:14px;align-self:center}
      #mkA .mka-n{font:500 14.5px/1.3 'Jost',sans-serif;color:#26221c;flex:1}
      #mkA .mka-c{font:600 9.5px/1 'Jost',sans-serif;letter-spacing:.09em;text-transform:uppercase;color:#5f5647;flex:none}
    `;
    document.head.appendChild(css);
    const star = '<svg class="mka-star" viewBox="0 0 24 24" fill="#E0B84C" stroke="#C9A02C" stroke-width="1" stroke-linejoin="round"><path d="M12 1.6L14.47 8.6L21.89 8.79L15.99 13.3L18.11 20.41L12 16.2L5.89 20.41L8.01 13.3L2.11 8.79L9.53 8.6Z"/></svg>';
    const list = document.createElement('div');
    list.id = 'mkA';
    list.innerHTML = picks.map(x => `<div class="mka-row">${star}<span class="mka-n">${x.n}</span><span class="mka-c">${x.cat}</span></div>`).join('');
    end.insertBefore(list, end.querySelector('.wse-sub'));
  }, PICKER);
  await p.evaluate(() => document.getElementById('wdrShopEnd').scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const b = document.querySelector('#wdrShopEnd').getBoundingClientRect();
    return { y: Math.max(0, b.top - 60), h: Math.min(844, b.height + 120) };
  });
  await p.screenshot({ path: path.join(ROOT, 'scratchpad', 'mylist-a.png'), clip: { x: 0, y: r.y, width: 390, height: r.h } });
  await p.close();
  console.log('A done');
}

/* ---------- B: "just my list" filter collapses the worksheet ---------- */
{
  const p = await openPage();
  await p.evaluate(() => {
    const css = document.createElement('style');
    css.textContent = `
      #mkB{display:flex;gap:8px;margin:10px 0 4px}
      #mkB .mkb-t{flex:1;text-align:center;font:600 12.5px/1 'Jost',sans-serif;letter-spacing:.05em;padding:9px 4px;border:1px solid #C9B893;color:#5f5647;background:#F5EFE2}
      #mkB .mkb-t.on{background:#1a1a1a;color:#F2D889;border-color:#1a1a1a}
      #mkB .mkb-t.on svg{vertical-align:-2px;margin-right:5px}
    `;
    document.head.appendChild(css);
    const star = '<svg width="13" height="13" viewBox="0 0 24 24" fill="#F2D889" stroke="#C99A2C" stroke-width="1" stroke-linejoin="round"><path d="M12 1.6L14.47 8.6L21.89 8.79L15.99 13.3L18.11 20.41L12 16.2L5.89 20.41L8.01 13.3L2.11 8.79L9.53 8.6Z"/></svg>';
    const bar = document.createElement('div');
    bar.id = 'mkB';
    bar.innerHTML = `<span class="mkb-t">Full checklist &middot; 100</span><span class="mkb-t on">${star}My list &middot; 6</span>`;
    const howto = document.getElementById('wdrHowto');
    howto.parentNode.insertBefore(bar, howto.nextSibling);
    // Filtered state: only starred rows survive; empty categories drop away.
    document.querySelectorAll('#s-wardrobe .wdr-item:not(.want)').forEach(el => el.style.display = 'none');
    document.querySelectorAll('#s-wardrobe .wdr-cat').forEach(cat => {
      if (!cat.querySelector('.wdr-item.want')) cat.style.display = 'none';
    });
    const rm = document.querySelector('#s-wardrobe .wdr-removed'); if (rm) rm.style.display = 'none';
    window.scrollTo(0, 0);
  });
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(ROOT, 'scratchpad', 'mylist-b.png'), clip: { x: 0, y: 0, width: 390, height: 844 } });
  await p.close();
  console.log('B done');
}

/* ---------- C: summary card up top ---------- */
{
  const p = await openPage();
  await p.evaluate((PICKER) => {
    const picks = new Function('return (' + PICKER + ')()')();
    const css = document.createElement('style');
    css.textContent = `
      #mkC{border:1px solid #D6C9A8;background:#fff;margin:10px 0 6px;padding:12px 14px 10px}
      #mkC .mkc-h{font:700 11px/1 'Jost',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#26221c;display:inline-block;padding-bottom:4px;border-bottom:2px solid #D8A52E;margin-bottom:7px}
      #mkC .mkc-row{display:flex;align-items:baseline;gap:8px;padding:5px 0}
      #mkC .mkc-star{flex:none;width:13px;height:13px;align-self:center}
      #mkC .mkc-n{font:500 14px/1.3 'Jost',sans-serif;color:#26221c;flex:1}
      #mkC .mkc-c{font:600 9.5px/1 'Jost',sans-serif;letter-spacing:.09em;text-transform:uppercase;color:#5f5647;flex:none}
    `;
    document.head.appendChild(css);
    const star = '<svg class="mkc-star" viewBox="0 0 24 24" fill="#E0B84C" stroke="#C9A02C" stroke-width="1" stroke-linejoin="round"><path d="M12 1.6L14.47 8.6L21.89 8.79L15.99 13.3L18.11 20.41L12 16.2L5.89 20.41L8.01 13.3L2.11 8.79L9.53 8.6Z"/></svg>';
    const card = document.createElement('div');
    card.id = 'mkC';
    card.innerHTML = `<div class="mkc-h">On my list &middot; ${picks.length} pieces</div>`
      + picks.map(x => `<div class="mkc-row">${star}<span class="mkc-n">${x.n}</span><span class="mkc-c">${x.cat}</span></div>`).join('');
    const howto = document.getElementById('wdrHowto');
    howto.parentNode.insertBefore(card, howto.nextSibling);
    window.scrollTo(0, 0);
  }, PICKER);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(ROOT, 'scratchpad', 'mylist-c.png'), clip: { x: 0, y: 0, width: 390, height: 844 } });
  await p.close();
  console.log('C done');
}

await browser.close();
server.close();
console.log('all renders written');
