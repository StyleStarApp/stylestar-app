// The clean-list summary (Cath's pick "A", 2026-08-12): her starred pieces
// written out together inside the end-of-list payoff block, between the
// "That's N pieces" lead and the "Shop them all together" sub.
// Covers: presence/order/custom rows, XSS on custom names, live update on
// star taps, removed-item exclusion, empty state, star DIMENSIONS (the
// .wdr-star cascade lesson), AA contrast, and no overflow at 390/360/320.
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
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const STARRED = { to1: 'want', bo1: 'want', dr5: 'want', ja5: 'want', sh1: 'want', bg8: 'want' };
const XSS = '<img src=x onerror="window.__xss=1">Silk scarf';

function lum(c) { const [r, g, b] = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4) }); return .2126 * r + .7152 * g + .0722 * b }
function ratio(a, b) { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05) }
const px = s => (s.match(/\d+(\.\d+)?/g) || []).map(Number);

async function openPage(w, starred, custom) {
  const p = await browser.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(base + '/', { waitUntil: 'load' });
  await p.evaluate(({ starred, custom }) => {
    localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' }));
    localStorage.setItem('ss_wardrobe', JSON.stringify({ items: starred, custom: custom || [], hidden: [], wishlist: [], pretap0: true }));
  }, { starred, custom });
  await p.reload({ waitUntil: 'load' });
  await p.waitForTimeout(2600);
  await p.evaluate(() => openWardrobe('list'));
  await p.waitForTimeout(600);
  return { p, errs };
}

/* ---------- Part 1: content, order, custom rows, XSS @390 ---------- */
{
  console.log('\n--- content / order / XSS @390 ---');
  const custom = [
    { id: 'c~one', n: XSS, state: 'want' },
    { id: 'c~two', n: 'Not starred custom', state: 'unset' },
  ];
  const { p, errs } = await openPage(390, STARRED, custom);
  const m = await p.evaluate(() => {
    const card = document.querySelector('#wdrShopEnd .wdr-mylist');
    if (!card) return { card: false };
    const rows = [...card.querySelectorAll('.wml-row')];
    const names = rows.map(r => r.querySelector('.wml-n').textContent);
    const cats = rows.map(r => r.querySelector('.wml-c').textContent);
    const end = card.closest('.wdr-shopend');
    const kids = [...end.children].map(e => e.className);
    // Live update: un-star one checklist item through the real handler.
    window.__before = rows.length;
    wardrobeWant('bo1', false);
    const after = document.querySelectorAll('#wdrShopEnd .wml-row').length;
    const lead = document.querySelector('#wdrShopEnd .wse-lead').textContent;
    // And remove a starred item entirely — it must leave the summary too.
    wardrobeRemove('dr5', false);
    const afterRemove = document.querySelectorAll('#wdrShopEnd .wml-row').length;
    return {
      card: true, names, cats, kids,
      xssFired: !!window.__xss,
      imgInCard: !!card.querySelector('img'),
      after, afterRemove, lead,
      catOrder: (typeof _wardrobeCatOrder === 'function') ? _wardrobeCatOrder() : null,
    };
  });
  ok(m.card, 'summary card renders inside the shopend block');
  // Her call 2026-08-12: the Catherine line REPLACED the "Shop them all
  // together" sub — deliberate test change, not a silence.
  ok(m.kids.join(',') === 'wse-lead,wdr-mylist,wml-cath,wdr-shopwrap', `lead > card > Catherine line > button, no sub (${m.kids.join(' > ')})`);
  ok(m.names.length === 7, `7 rows: 6 checklist + 1 starred custom (${m.names.length})`);
  ok(m.names[m.names.length - 1].indexOf('Silk scarf') >= 0, 'custom addition rides last');
  ok(m.cats[m.cats.length - 1] === 'My Additions', `custom row labelled My Additions (${m.cats[m.cats.length - 1]})`);
  ok(m.names.indexOf('Not starred custom') < 0, 'un-starred custom item stays off the list');
  // Order: rows must follow the page's own category order.
  const seen = m.cats.slice(0, -1).map(c => m.catOrder.indexOf(c));
  ok(seen.every((v, i) => i === 0 || v >= seen[i - 1]), `rows follow category order (${m.cats.join(' · ')})`);
  ok(!m.xssFired && !m.imgInCard, 'a hostile custom name renders inert (escaped, no element)');
  ok(m.after === 6, `un-starring live-updates the summary (7 → ${m.after})`);
  ok(/6 pieces/.test(m.lead), `lead count updates with it (${m.lead.trim()})`);
  ok(m.afterRemove === 5, `removing a starred item drops its row (6 → ${m.afterRemove})`);
  ok(errs.length === 0, `zero JS errors (${errs.join('; ') || 'none'})`);
  await p.close();
}

/* ---------- Part 2: empty state ---------- */
{
  console.log('\n--- empty state ---');
  const { p, errs } = await openPage(390, {}, []);
  const m = await p.evaluate(() => ({
    card: !!document.querySelector('#wdrShopEnd .wdr-mylist'),
    shopend: !!document.querySelector('#wdrShopEnd .wdr-shopend'),
  }));
  ok(!m.card && !m.shopend, 'nothing starred → no summary, no payoff block');
  ok(errs.length === 0, 'zero JS errors');
  await p.close();
}

/* ---------- Part 3: geometry, dimensions, contrast at 3 widths ---------- */
for (const w of [390, 360, 320]) {
  console.log(`\n--- geometry @ ${w} ---`);
  // Include the widest category label + a long item name: the honest worst case.
  const { p, errs } = await openPage(w, { ...STARRED, to3: 'want', ex1: 'want' }, []);
  const m = await p.evaluate(() => {
    const card = document.querySelector('#wdrShopEnd .wdr-mylist');
    card.scrollIntoView({ block: 'center' });
    const cr = card.getBoundingClientRect();
    const star = card.querySelector('.wml-row svg').getBoundingClientRect();
    const h = card.querySelector('.wml-h');
    const hS = h ? getComputedStyle(h) : null;
    const hr = h ? h.getBoundingClientRect() : null;
    const cath = document.querySelector('#wdrShopEnd .wml-cath');
    const cathS = cath ? getComputedStyle(cath) : null;
    const heart = cath ? cath.querySelector('svg.pinkheart') : null;
    const heartS = heart ? getComputedStyle(heart) : null;
    let cathLines = null;
    if (cath) { const rg = document.createRange(); rg.selectNodeContents(cath);
      cathLines = new Set([...rg.getClientRects()].map(x => Math.round(x.top))).size; }
    let outside = 0, wraps = 0;
    card.querySelectorAll('.wml-row').forEach(r => {
      const rr = r.getBoundingClientRect();
      if (rr.left < cr.left || rr.right > cr.right + 0.5) outside++;
      const n = r.querySelector('.wml-n');
      const rg = document.createRange(); rg.selectNodeContents(n);
      const tops = [...new Set([...rg.getClientRects()].map(x => Math.round(x.top)))];
      if (tops.length > 1) wraps++;
    });
    const nS = getComputedStyle(card.querySelector('.wml-n'));
    const cS = getComputedStyle(card.querySelector('.wml-c'));
    return {
      starW: star.width, starH: star.height,
      outside, wraps, rows: card.querySelectorAll('.wml-row').length,
      over: document.documentElement.scrollWidth > window.innerWidth,
      nCol: nS.color, cCol: cS.color, cSize: parseFloat(cS.fontSize),
      hText: h ? h.textContent : null,
      hBar: hS ? hS.borderBottomWidth + ' ' + hS.borderBottomColor : null,
      hHugs: h ? hr.width < cr.width * 0.8 : null,
      subGone: !document.querySelector('#wdrShopEnd .wse-sub'),
      cathText: cath ? cath.textContent : null,
      cathItalic: cathS ? cathS.fontStyle : null,
      cathCol: cathS ? cathS.color : null,
      cathLines,
      heartFill: heartS ? heartS.fill : null,
      heartTilt: heartS ? heartS.transform : null,
      heartW: heart ? heart.getBoundingClientRect().width : 0,
    };
  });
  ok(Math.abs(m.starW - 14) < 0.5 && Math.abs(m.starH - 14) < 0.5, `star is really 14px (${m.starW}x${m.starH}) — dimension asserted`);
  ok(m.hText === 'Building my wardrobe', `card title present (${m.hText})`);
  ok(/^2px rgb\(216, 165, 46\)/.test(m.hBar), `title wears the category-header gold bar (${m.hBar})`);
  ok(m.hHugs, 'the bar hugs the words (inline-block), not the card width');
  ok(m.subGone, 'the old "Shop them all together" sub is gone (her call, replaced)');
  ok(/^Piece by piece, a well-rounded wardrobe/.test(m.cathText || ''), `Catherine line present (${m.cathText})`);
  ok(m.cathItalic === 'italic', 'Catherine line is italic (her whisper voice)');
  const heartFill = (m.heartFill.match(/\d+/g) || []).map(Number);
  ok(heartFill.join() === '244,154,193', `heart is her signature pink (${m.heartFill})`);
  ok(m.heartTilt !== 'none', `heart is tilted (${m.heartTilt})`);
  ok(Math.abs(m.heartW - 12) < 3, `heart is really painted at ~12px (${m.heartW.toFixed(1)}) — dimension asserted`);
  console.log(`  info: Catherine line holds ${m.cathLines} line(s)`);
  ok(ratio((m.cathCol.match(/\d+/g)).map(Number), [251, 250, 247]) >= 4.5, `Catherine line AA on the paper (${ratio((m.cathCol.match(/\d+/g)).map(Number), [251, 250, 247]).toFixed(2)}:1)`);
  ok(m.outside === 0, 'no row escapes the card');
  ok(!m.over, 'no sideways page scroll');
  console.log(`  info: ${m.rows} rows, ${m.wraps} wrapped name(s)`);
  const parse = c => c.match(/\d+/g).map(Number);
  ok(ratio(parse(m.nCol), [255, 255, 255]) >= 4.5, `item name AA on white (${ratio(parse(m.nCol), [255, 255, 255]).toFixed(2)}:1)`);
  ok(ratio(parse(m.cCol), [255, 255, 255]) >= 4.5, `category label AA on white (${ratio(parse(m.cCol), [255, 255, 255]).toFixed(2)}:1)`);
  ok(m.cSize >= 10.5, `category label at the readability floor (${m.cSize}px)`);
  ok(errs.length === 0, 'zero JS errors');
  await p.close();
}

await browser.close();
server.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
