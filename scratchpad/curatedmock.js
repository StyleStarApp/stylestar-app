// curatedmock.js — RENDERS ONLY, nothing ships from here. Five decision
// images for Cath on the real page with her real 21 products:
//   curated-badge-a.png   badge on every card (as currently built)
//   curated-badge-b.png   badge once on the shelf header, cards clean
//   curated-more.png      "+ See more ideas" tap open: labelled AI cards below
//   curated-notforme.png  the "Not for me" dismissal on each card
//   curated-starved.png   Tall-only shopper: named constraint + AI fallback
import http from 'http'; import fs from 'fs'; import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
const ROOT = path.resolve(import.meta.dirname, '..');
const srv = http.createServer((req, res) => { try { res.end(fs.readFileSync(path.join(ROOT, req.url === '/' ? 'index.html' : req.url.split('?')[0]))) } catch (e) { res.statusCode = 404; res.end() } }).listen(8948);
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});

const AI_ITEMS = {items: [
  {name: 'Silk Professional Blouse', search: 'silk professional blouse', store: 'Nordstrom'},
  {name: 'Woven Button-Front Blouse', search: 'woven button front blouse', store: 'Talbots'},
  {name: 'Crepe Professional Blouse', search: 'crepe professional blouse', store: 'Ann Taylor'},
  {name: 'Poplin Tailored Shirt', search: 'poplin tailored shirt', store: 'Boden'}]};

async function page(opts) {
  opts = opts || {};
  const ctx = await b.newContext({viewport: {width: 390, height: 1100}, deviceScaleFactor: 2});
  const pg = await ctx.newPage();
  await pg.route('**/.netlify/**', r => opts.aiOk
    ? r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({content: [{text: JSON.stringify(AI_ITEMS)}]})})
    : r.fulfill({status: 500, body: '{}'}));
  await pg.goto('http://localhost:8948/');
  await pg.waitForTimeout(2600);
  await pg.evaluate(patch => {
    localStorage.setItem('ss_data', JSON.stringify({userName: 'Test', answers: new Array(12).fill(6), topArchNames: ['The Timeless Classic'], portrait: 'p', motto: 'm'}));
    topArchNames = ['The Timeless Classic']; quizTaken = true;
    Object.assign(prefs, patch || {});
    openWardrobe();
  }, opts.prefs || {});
  await pg.waitForTimeout(300);
  await pg.evaluate(() => wardrobeSeeIdeas('to5'));
  await pg.waitForTimeout(900);
  return {ctx, pg};
}
async function shoot(pg, name, label) {
  await pg.evaluate(lbl => {
    const box = document.getElementById('wx_to5');
    const tag = document.createElement('div');
    tag.style.cssText = 'font:700 13px/1.4 -apple-system,sans-serif;background:#1a1a1a;color:#F2D889;padding:8px 12px;margin:0 0 8px;border-radius:6px';
    tag.textContent = lbl;
    box.parentNode.insertBefore(tag, box);
    // pull the row into view
    box.scrollIntoView({block: 'start'});
    window.scrollBy(0, -60);
  }, label);
  await pg.waitForTimeout(250);
  const el = await pg.$('#wx_to5');
  const bb = await el.boundingBox();
  await pg.screenshot({path: path.join(ROOT, 'scratchpad', name), clip: {x: 0, y: Math.max(0, bb.y - 44), width: 390, height: Math.min(bb.height + 60, 980)}});
  console.log('wrote', name);
}

// A — as built: badge on every card
let {ctx, pg} = await page();
await shoot(pg, 'curated-badge-a.png', 'A — "Picked by Catherine" badge on EVERY card (as built)');
await ctx.close();

// B — badge once on the shelf header, cards clean
({ctx, pg} = await page());
await pg.evaluate(() => {
  document.querySelectorAll('#wx_to5 .wdr-pick').forEach(n => n.remove());
  const lbl = document.querySelector('#wx_to5 .wdr-expand-lbl');
  lbl.insertAdjacentHTML('afterend', '<div style="text-align:center;margin:2px 0 8px"><span class="wdr-pick" style="margin-bottom:0"><svg viewBox="0 0 24 24"><path d="' + _WL_HEART_PATH + '"/></svg>Every piece picked by Catherine</span></div>');
});
await shoot(pg, 'curated-badge-b.png', 'B — the SHELF carries the badge once, cards stay clean');
await ctx.close();

// C — "+ See more ideas" tapped open: labelled AI cards under her picks
({ctx, pg} = await page());
await pg.evaluate(() => {
  const box = document.getElementById('wx_to5');
  const chk = box.querySelector('.wdr-cur-checked');
  let more = '<div style="text-align:center;margin:12px 0 10px"><span style="display:inline-block;font:600 13.5px/1 \'Jost\',sans-serif;letter-spacing:.04em;color:#3a352c;border:1px solid #D8A52E;padding:9px 14px;background:#fff">+ See more ideas</span></div>';
  more += '<div class="wdr-expand-lbl" style="margin-top:4px">Ideas to explore beyond my shelf</div><div class="shop-grid hscroll">';
  const ai = [['Silk Professional Blouse', 'Nordstrom'], ['Woven Button-Front Blouse', 'Talbots'], ['Crepe Professional Blouse', 'Ann Taylor']];
  ai.forEach(([n, s]) => {
    more += '<div class="shop-card"><div><span class="wdr-ailbl">An idea to explore</span><div class="shop-item-name">' + n + '</div><div class="shop-item-store">' + s + '</div></div><div class="shop-card-act"><a class="shop-link">Find it &rarr;</a><span class="wl-save">♡<span class="wl-save-t">Save</span></span></div></div>';
  });
  more += '</div>';
  chk.insertAdjacentHTML('afterend', more);
});
await shoot(pg, 'curated-more.png', 'C — "+ See more ideas" tapped: labelled AI ideas render BELOW her picks');
await ctx.close();

// D — "Not for me" dismissal on each card
({ctx, pg} = await page());
await pg.evaluate(() => {
  document.querySelectorAll('#wx_to5 .wdr-linkflag').forEach(n => {
    n.insertAdjacentHTML('beforebegin', '<span class="wdr-linkflag" style="margin-top:7px">✕ Not for me</span>');
    n.style.marginTop = '3px';
  });
});
await shoot(pg, 'curated-notforme.png', 'D — a quiet "Not for me" tap on each card (hides it for her, for good)');
await ctx.close();

// E — starved shelf as built: Tall-only shopper, named constraint + AI fallback
({ctx, pg} = await page({aiOk: true, prefs: {sizes: {fit: ['Tall']}}}));
await shoot(pg, 'curated-starved.png', 'E — shelf starved by her size: honest line + labelled AI ideas (as built)');
await ctx.close();

await b.close(); srv.close();
