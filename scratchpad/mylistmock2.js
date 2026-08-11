// Three ways to say "this is a wardrobe BUILDING list" at the clean-list
// summary (Cath's ask, 2026-08-12). Rendered on the real built feature.
// A: the lead names the destination — "on your wardrobe list"
// B: the card gets a worksheet-style header, BUILDING MY WARDROBE (gold bar)
// C: a quiet Catherine line under the card, her "well-rounded" vocabulary
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

async function openPage() {
  const p = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(base + '/', { waitUntil: 'load' });
  await p.evaluate(() => {
    localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' }));
    localStorage.setItem('ss_wardrobe', JSON.stringify({
      items: { to1: 'want', bo1: 'want', dr5: 'want', ja5: 'want', sh1: 'want', bg8: 'want' },
      custom: [], hidden: [], wishlist: [], pretap0: true,
    }));
  });
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(2600);
  await p.evaluate(() => openWardrobe('list'));
  await p.waitForTimeout(600);
  return p;
}

async function shoot(p, name) {
  await p.evaluate(() => document.getElementById('wdrShopEnd').scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(250);
  const r = await p.evaluate(() => {
    const b = document.querySelector('#wdrShopEnd').getBoundingClientRect();
    return { y: Math.max(0, b.top - 70), h: Math.min(844, b.height + 130) };
  });
  await p.screenshot({ path: path.join(ROOT, 'scratchpad', name), clip: { x: 0, y: r.y, width: 390, height: r.h } });
}

/* A: the lead names the destination */
{
  const p = await openPage();
  await p.evaluate(() => {
    const lead = document.querySelector('#wdrShopEnd .wse-lead');
    lead.textContent = lead.textContent.replace('on your list', 'on your wardrobe list');
  });
  await shoot(p, 'mylist2-a.png');
  await p.close();
  console.log('A done');
}

/* B: worksheet-style header on the card, the catmark gold-bar pattern */
{
  const p = await openPage();
  await p.evaluate(() => {
    const css = document.createElement('style');
    css.textContent = `#mk2b{font:700 11px/1 'Jost',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#26221c;display:inline-block;padding-bottom:4px;border-bottom:2px solid #D8A52E;margin:1px 0 5px}`;
    document.head.appendChild(css);
    const card = document.querySelector('#wdrShopEnd .wdr-mylist');
    const h = document.createElement('div');
    h.id = 'mk2b';
    h.textContent = 'Building my wardrobe';
    card.insertBefore(h, card.firstChild);
  });
  await shoot(p, 'mylist2-b.png');
  await p.close();
  console.log('B done');
}

/* C: a quiet Catherine line under the card, her own vocabulary */
{
  const p = await openPage();
  await p.evaluate(() => {
    const css = document.createElement('style');
    css.textContent = `#mk2c{font:italic 500 13.5px/1.5 'Jost',sans-serif;color:#6b655a;margin:-4px auto 12px;max-width:300px;text-align:center}
      #mk2c svg{width:12px;height:12px;vertical-align:-1.5px;margin-left:3px;transform:rotate(11deg)}`;
    document.head.appendChild(css);
    const line = document.createElement('div');
    line.id = 'mk2c';
    line.innerHTML = 'Piece by piece, a well-rounded wardrobe<svg viewBox="0 0 24 24" fill="#F49AC1"><path d="M12 21.6 C10.7 18.9 8.2 17 5.9 14.7 C3.6 12.4 2 10.4 2 7.7 C2 4.8 4.2 2.7 7 2.7 C9.5 2.7 11.3 4.6 12 7.1 C12.7 4.6 14.5 2.7 17 2.7 C19.8 2.7 22 4.8 22 7.7 C22 10.4 20.4 12.4 18.1 14.7 C15.8 17 13.3 18.9 12 21.6 Z"/></svg>';
    const card = document.querySelector('#wdrShopEnd .wdr-mylist');
    card.parentNode.insertBefore(line, card.nextSibling);
  });
  await shoot(p, 'mylist2-c.png');
  await p.close();
  console.log('C done');
}

await browser.close();
server.close();
console.log('renders written');
