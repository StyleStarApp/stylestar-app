// prefdone.js — the refine-done screen after her pick "A" (2026-08-15 night).
// The way forward ("Let's go shopping") is on the screen for everyone now,
// above the email ask, and "Maybe later" stays a plain dismissal.
// Run: NODE_PATH=/opt/node22/lib/node_modules node scratchpad/prefdone.js
import fs from 'fs';
import path from 'path';
import http from 'http';

const ROOT = path.resolve(import.meta.dirname, '..');
let pass = 0, failn = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { failn++; console.log('  ✗ FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

(async () => {
  const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
  const srv = http.createServer((req, res) => {
    let p = req.url.split('?')[0]; if (p === '/') p = '/index.html';
    const f = path.join(ROOT, decodeURIComponent(p));
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      res.setHeader('content-type', p.endsWith('.html') ? 'text/html' : p.endsWith('.json') ? 'application/json' : 'application/octet-stream');
      res.end(fs.readFileSync(f));
    } else { res.statusCode = 404; res.end('nf'); }
  });
  await new Promise(r => srv.listen(8953, r));
  const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
  const errs = [];

  async function open(w, saved) {
    const ctx = await b.newContext({viewport: {width: w, height: 900}});
    const pg = await ctx.newPage();
    pg.on('pageerror', e => errs.push(w + ': ' + e.message));
    await pg.route('**/.netlify/**', r => r.fulfill({status: 200, contentType: 'application/json', body: '{"content":[{"text":"{}"}]}'}));
    await pg.goto('http://localhost:8953/');
    await pg.waitForTimeout(2600);
    await pg.evaluate(s => {
      localStorage.setItem('ss_data', JSON.stringify({userName: 'Cath', answers: new Array(12).fill(6), topArchNames: ['The Timeless Classic'], portrait: 'p', motto: 'm'}));
      emailDone = !!s;
      showPrefDone();
      show('s-pref-done');
    }, saved);
    await pg.waitForTimeout(350);
    return {ctx, pg};
  }
  // Count UNIQUE line tops, clustering within 6px: a rect is emitted per text
  // box AND per element, and an inline mark's skew moves a top ~2px while a
  // real wrap moves a full line-height. Both lessons from 2026-08-10/11.
  const LINES = `el => {
    const r = document.createRange(); r.selectNodeContents(el);
    const tops = [...r.getClientRects()].map(x => Math.round(x.top));
    const cl = []; tops.sort((a, b) => a - b).forEach(t => { if (!cl.some(c => Math.abs(c - t) < 6)) cl.push(t); });
    return cl.length;
  }`;

  console.log('The unsaved state — a woman who has not given her email');
  let {ctx, pg} = await open(390, false);
  const un = await pg.evaluate(() => {
    const vis = e => !!(e && e.offsetParent !== null);
    const shop = document.querySelector('#prefSaveBlock .pref-shop-now');
    const sub = document.querySelector('#prefSaveBlock .pref-done-sub');
    const later = document.querySelector('#prefSaveBlock button.retake');
    const form = document.getElementById('prefSaveForm');
    const keep = document.querySelector('.pref-keep');
    const pos = e => e.getBoundingClientRect().top;
    return {
      shopVis: vis(shop), shopText: shop ? shop.innerText.trim() : '',
      // ★ the whole point: shopping is ABOVE the ask, not behind it
      shopAboveForm: shop && form ? pos(shop) < pos(form) : false,
      shopBelowSub: shop && sub ? pos(shop) > pos(sub) : false,
      keepAboveForm: keep && form ? pos(keep) < pos(form) : false,
      laterVis: vis(later), laterText: later ? later.textContent.trim() : '',
      laterBelowForm: later && form ? pos(later) > pos(form) : false,
      // the seal must not land on the sentence above it
      sealTop: (() => { const s = shop.querySelector('.hm-cta-seal').getBoundingClientRect(); const b2 = sub.getBoundingClientRect(); return Math.round(s.top - b2.bottom); })(),
      onlyOneShop: document.querySelectorAll('#s-pref-done .btn-pink:not([style*="display:none"])').length,
      visibleShops: [...document.querySelectorAll('#s-pref-done .btn-pink')].filter(vis).length,
      // a duplicated SVG def id is the Safari hidden-defs trap
      sealIds: [...document.querySelectorAll('#s-pref-done radialGradient')].map(g => g.id),
      subText: sub.textContent.trim()
    };
  });
  ok('"Let\'s go shopping" is on screen without an email', un.shopVis, un.shopText);
  ok('★ it sits ABOVE the email ask', un.shopAboveForm);
  ok('it sits below the celebration line', un.shopBelowSub);
  ok('the save ask follows underneath', un.keepAboveForm);
  ok('"Maybe later" survives, still a plain dismissal', un.laterVis && /Maybe later/i.test(un.laterText));
  ok('"Maybe later" stays at the bottom, below the form', un.laterBelowForm);
  ok('exactly ONE shopping button is visible', un.visibleShops === 1, String(un.visibleShops));
  ok('the two seals have distinct gradient ids', new Set(un.sealIds).size === un.sealIds.length, un.sealIds.join(','));
  ok('the hanging seal clears the line above it', un.sealTop >= 0, un.sealTop + 'px');

  // ★ HER CATCH ON THE RENDER: "fun" was straggling alone on a third line.
  for (const w of [390, 375, 360, 320]) {
    const {ctx: c2, pg: p2} = w === 390 ? {ctx, pg} : await open(w, false);
    const m = await p2.evaluate(([lineFn]) => {
      const f = eval(lineFn);
      const sub = document.querySelector('#prefSaveBlock .pref-done-sub');
      const note = document.querySelector('.pref-keep-note');
      const words = sub.textContent.trim().split(/\s+/);
      // Measure the LAST line's word count by walking the final word's rect.
      const r = document.createRange(); r.selectNodeContents(sub);
      const rects = [...r.getClientRects()];
      const bottomTop = Math.max(...rects.map(x => x.top));
      // rebuild per-word rects to count how many sit on that last line
      const t = sub.firstChild; let lastLineWords = 0, i = 0;
      words.forEach((wd) => {
        const idx = sub.textContent.indexOf(wd, i); i = idx + wd.length;
        const rr = document.createRange(); rr.setStart(t, idx); rr.setEnd(t, i);
        const rc = rr.getBoundingClientRect();
        if (Math.abs(rc.top - bottomTop) < 6) lastLineWords++;
      });
      return {subLines: f(sub), noteLines: f(note), lastLineWords,
              scroll: document.documentElement.scrollWidth <= window.innerWidth + 1};
    }, [LINES]);
    ok('★ ' + w + ': no straggling last word in the celebration line (' + m.lastLineWords + ' words, ' + m.subLines + ' lines)', m.lastLineWords >= 2, JSON.stringify(m));
    ok(w + ': no sideways page scroll', m.scroll);
    // ★ Her second catch: "Privacy Policy ·" sat alone with "Terms" beneath it.
    // ⚠️ COUNT UNIQUE TOPS, NOT RECTS — getClientRects() on an inline element
    // returns a rect per CHILD box as well, so the three fragments of this span
    // look like three lines when they are one. That trap cost a false failure
    // here; it is the same rect-per-element lesson as 2026-08-10/11.
    const pv = await p2.evaluate(() => {
      const d = [...document.querySelectorAll('#prefSaveBlock div')]
        .find(x => /never share your email/.test(x.textContent) && x.children.length);
      const links = d.querySelector('.priv-links');
      const tops = [...links.getClientRects()].map(r => Math.round(r.top));
      const uniq = []; tops.forEach(t => { if (!uniq.some(u => Math.abs(u - t) < 6)) uniq.push(t); });
      return {lineOfLinks: uniq.length, ws: getComputedStyle(links).whiteSpace,
              boxW: Math.round(d.getBoundingClientRect().width),
              linkW: Math.round(links.getBoundingClientRect().width)};
    });
    ok('★ ' + w + ': Privacy Policy and Terms sit on ONE line together', pv.lineOfLinks === 1, JSON.stringify(pv));
    ok(w + ': the links still fit their box (' + pv.linkW + ' of ' + pv.boxW + 'px)', pv.linkW <= pv.boxW, JSON.stringify(pv));
    if (w !== 390) await c2.close();
  }
  await ctx.close();

  console.log('The saved state — untouched by this change');
  ({ctx, pg} = await open(390, true));
  const sv = await pg.evaluate(() => {
    const vis = e => !!(e && e.offsetParent !== null);
    return {
      askHidden: !vis(document.getElementById('prefSaveBlock')),
      savedShown: vis(document.getElementById('prefSavedBlock')),
      visibleShops: [...document.querySelectorAll('#s-pref-done .btn-pink')].filter(vis).length,
      acts: document.querySelectorAll('#prefSavedBlock .pda').length
    };
  });
  ok('the email ask stands down once she has saved', sv.askHidden && sv.savedShown);
  ok('still exactly ONE shopping button visible', sv.visibleShops === 1, String(sv.visibleShops));
  ok('the saved screen keeps its other actions', sv.acts >= 1, String(sv.acts));

  // Both buttons must really reach shopping.
  const went = await pg.evaluate(() => {
    document.querySelector('#prefSavedBlock .btn-pink').click();
    return (document.querySelector('.scr.act') || {}).id;
  });
  ok('saved-state button opens Shop your style', went === 's-shopstyle', went);
  await ctx.close();

  ({ctx, pg} = await open(390, false));
  const went2 = await pg.evaluate(() => {
    document.querySelector('#prefSaveBlock .pref-shop-now').click();
    return (document.querySelector('.scr.act') || {}).id;
  });
  ok('★ unsaved-state button opens Shop your style too', went2 === 's-shopstyle', went2);
  await ctx.close();

  // "Maybe later" must still mean what it says: a dismissal, not a redirect.
  ({ctx, pg} = await open(390, false));
  const later = await pg.evaluate(() => {
    prefReturnScreen = 's-res';
    document.querySelector('#prefSaveBlock button.retake').click();
    return (document.querySelector('.scr.act') || {}).id;
  });
  ok('★ "Maybe later" still dismisses, it does NOT secretly go shopping', later !== 's-shopstyle', later);
  await ctx.close();

  ok('zero JS errors', errs.length === 0, errs.join(' | '));
  await b.close(); srv.close();
  console.log('\n' + pass + ' passed, ' + failn + ' failed');
  process.exit(failn ? 1 : 0);
})();
