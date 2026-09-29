// Amazon Finds — her new curated page (2026-09-10).
//
//   node scratchpad/findspage.js
//
// ▶▶ SECTIONS 2 AND 3 ARE WHY THIS SUITE EXISTS.
// §2 is the same money check that caught the Edit's trap: the page's links are
// tagged at RUNTIME by _wlDecorateEdit(), which only openFinds() calls. A bare
// show('s-finds') would serve her hand-picked page with untagged links and
// every card would look perfectly normal.
// §3 guards the decision she actually made: the HEADING may say Amazon and the
// PATH may not, because a path can never move once shared and she has already
// said she might broaden this page beyond Amazon.
import http from 'http';
import fs from 'fs';
import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PORT = 8934, ORIGIN = 'http://localhost:' + PORT;
const server = http.createServer((req, res) => {
  const p = new URL(req.url, ORIGIN).pathname;
  const f = path.join(ROOT, p === '/' ? 'index.html' : p.replace(/^\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200); res.end(fs.readFileSync(f)); return; }
  res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(fs.readFileSync(path.join(ROOT, 'index.html')));
});
await new Promise(r => server.listen(PORT, r));

let pass = 0, fail = 0;
const ok = (n, c, e) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (e ? '  → ' + e : '')); } };

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, body: '{"success":true}' }));

const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const toml = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
const edge = fs.readFileSync(path.join(ROOT, 'netlify/edge-functions/page-titles.js'), 'utf8');

console.log('\n1. A COLD LANDING ON /finds OPENS HER PAGE');
await page.goto(ORIGIN + '/finds', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.openFinds === 'function');
await page.waitForTimeout(450);
ok('the active screen is s-finds', (await page.evaluate(() => (document.querySelector('.scr.act') || {}).id)) === 's-finds');
const txt = await page.evaluate(() => document.querySelector('.scr.act').innerText);
ok('the heading says Amazon Finds', /amazon finds/i.test(txt));
ok('it says the pieces are hand selected by her', /hand selected by catherine/i.test(txt));
ok('the address bar stays /finds', (await page.evaluate(() => location.pathname)) === '/finds');
ok('exactly one affiliate disclosure', (await page.evaluate(() => document.querySelectorAll('#s-finds .dc-disclosure').length)) === 1);

console.log('\n2. 🚨 THE MONEY CHECK — HER LINKS TAG THEMSELVES');
// ✅ SET 2026-09-12: she is approved (conditional) and _AMZ_TAG carries her
// real tag now. This used to assert the tag came back EMPTY -- that was
// correct for the pre-approval state and is now the good kind of stale. The
// mechanism itself (never invent a tag when there isn't one) is still tested
// by clearing it temporarily below, isolated to this one evaluate() call so
// production state is never actually mutated on the page.
const wrap = await page.evaluate(() => {
  const real = window._AMZ_TAG;
  const live = window._affUrl('https://www.amazon.com/dp/B01234567');
  window._AMZ_TAG = '';
  const untouched = window._affUrl('https://www.amazon.com/dp/B01234567');
  window._AMZ_TAG = 'stylestar-20';
  const after = window._affUrl('https://www.amazon.com/dp/B01234567');
  const q = window._affUrl('https://www.amazon.com/s?k=white+dress');
  const twice = window._affUrl(after);
  const rak = window._affUrl('https://www.olivela.com/products/x');
  window._AMZ_TAG = real; // restore her REAL tag, not the empty/test value
  return { real, live, untouched, after, q, twice, rak };
});
ok('she is approved: _AMZ_TAG carries her real tag, not empty', !!wrap.real && wrap.real !== '', wrap.real);
ok('a live Amazon link tags itself automatically with her real tag', wrap.live.indexOf('tag=' + encodeURIComponent(wrap.real)) >= 0, wrap.live);
ok('the mechanism still never invents a tag when there is none', wrap.untouched === 'https://www.amazon.com/dp/B01234567', wrap.untouched);
ok('with a tag set an Amazon link carries it', /[?&]tag=stylestar-20/.test(wrap.after), wrap.after);
ok('a url that already has a query gets & not ?', /\?k=white\+dress&tag=/.test(wrap.q), wrap.q);
ok('it never double-tags', (wrap.twice.match(/tag=/g) || []).length === 1, wrap.twice);
ok('Rakuten shops still wrap the old way, untouched by the Amazon branch',
   wrap.rak.indexOf('click.linksynergy.com') >= 0);

// ⚠️ THE PAGE IS EMPTY UNTIL SHE ADDS HER PIECES, so nothing above proves the
// decorator REACHES this new screen. Inject a real .dc-item, reopen the page the
// way a woman does, and check it came out tagged. This is the check that bites
// if _wlEditItems' selector ever narrows back to #s-dream alone, or if anything
// opens this page with a bare show().
const injected = await page.evaluate(() => {
  const wrap = document.querySelector('#s-finds .dc-wrap');
  const d = document.createElement('div');
  d.className = 'dc-item';
  d.innerHTML = '<div class="dc-item-name">Test Piece</div>'
    + '<a class="dc-item-btn" href="https://www.amazon.com/dp/TEST123" rel="sponsored noopener">Shop this item</a>';
  wrap.appendChild(d);
  window._AMZ_TAG = 'stylestar-20';
  window.openFinds();
  const a = document.querySelector('#s-finds .dc-item-btn[href*="TEST123"]');
  const href = a ? a.getAttribute('href') : '';
  const saved = !!d.querySelector('.wl-save');
  d.remove(); window._AMZ_TAG = '';
  return { href, saved };
});
ok('a piece added to THIS page gets affiliate-tagged when the page opens',
   /[?&]tag=stylestar-20/.test(injected.href), injected.href || '(no link found)');
ok('and it gets the save control too, with nothing for her to add by hand',
   injected.saved);

console.log('\n3. HER NAMING DECISION IS GUARDED');
ok('the PATH carries no Amazon mark (it can never move once shared)',
   !/from = "\/[^"]*amazon/i.test(toml) && !/'s-finds':'\/[^']*amazon/i.test(idx));
ok('the path is /finds', /'s-finds':'\/finds'/.test(idx));
ok('/finds is a 200 rewrite, not a 301', /from = "\/finds"\s*\n\s*to = "\/index\.html"\s*\n\s*status = 200/.test(toml));
ok('/finds is registered as an edge function', /path = "\/finds"\s*\n\s*function = "page-titles"/.test(toml));
ok('the HEADING is free to say Amazon, and does', /Amazon Finds<\/div>/.test(idx));
ok('Amazon\'s own LOGO is never used (keeps their trademark notice untriggered)',
   !/amazon[-_]?logo|logo.*amazon\.(png|svg|jpg)/i.test(idx));

console.log('\n4. THE SHARE PREVIEW, AND THE TWO COPIES DO NOT DRIFT');
const meta = await page.evaluate(() => ({
  t: document.title,
  d: (document.querySelector('meta[name="description"]') || {}).content || '',
  u: (document.querySelector('meta[property="og:url"]') || {}).content || '',
}));
ok('the tab title is her page, not the homepage', /Amazon Finds/.test(meta.t), meta.t);
ok('the description carries her high/low sentence', /high and low/i.test(meta.d), meta.d.slice(0, 70));
ok('og:url points at /finds', /\/finds$/.test(meta.u), meta.u);
const eT = (edge.match(/PAGES\['\/finds'\][\s\S]{0,400}?title: '([^']+)'/) || [])[1] || '';
const eD = (edge.match(/PAGES\['\/finds'\][\s\S]{0,400}?desc: '([^']+)'/) || [])[1] || '';
const iT = (idx.match(/'s-finds':\{title:'([^']+)'/) || [])[1] || '';
const iD = (idx.match(/'s-finds':\{title:'[^']+',desc:'([^']+)'/) || [])[1] || '';
ok('title matches word for word in both files', !!eT && eT === iT, eT + '  vs  ' + iT);
ok('description matches word for word in both files', !!eD && eD === iD);

console.log('\n5. THE TWO PAGES POINT AT EACH OTHER — HER OWN LINE');
ok('the Finds page carries her sentence', /mixing high and low is how i dress my clients/i.test(txt));
ok('and it links to the Edit', (await page.evaluate(() => !!document.querySelector('#s-finds .dc-xlink[onclick*="showDream"]'))));
/* ⚠️ REWRITTEN 2026-09-11 TO NAME THE RULE RATHER THAN THE WORDS. This used to
   assert the literal string "click here to explore more", and it went red when
   she renamed the link to say WHERE it goes — the app changed, it did not break.
   ▶ The rule she actually gave is about EMPHASIS: her sentence reads plainly and
   only the invitation is set apart, because emphasising the whole thing turns a
   stylist's sentence into a banner. That survives any rewording.
   ▶ The WORDS are asserted in §9, against the page each link must name.
   ⚠️ REWRITTEN AGAIN 2026-09-29, AND FOR THE SAME REASON AS LAST TIME: it used to
   assert the invitation was UNDERLINED, which named the MECHANISM rather than the
   rule. Her 2026-09-29 ruling turned the invitation into a framed white pill
   ("Make the button white but framed pink and teal with silver edged mirror
   around the button"), so the underline went away and a correct page went red.
   ▶ HOW it is set apart is hers to change; THAT it is set apart while her own
   sentence stays plain is the rule. Underline OR frame both satisfy it. */
ok('the sentence reads plainly and only the INVITATION is set apart — her ask',
   (await page.evaluate(() => {
     const el = document.querySelector('#s-finds .dc-xlink');
     if (!el) return false;
     const sp = el.querySelector('span');
     const plain = el.childNodes[0];
     if (!sp || !plain || plain.nodeType !== 3 || plain.textContent.trim().length <= 20) return false;
     const cs = getComputedStyle(sp);
     const setApart = cs.textDecorationLine.includes('underline')
         || parseFloat(cs.borderTopWidth) > 0
         || cs.boxShadow !== 'none';
     return getComputedStyle(el).textDecorationLine === 'none' && setApart;
   })));
await page.evaluate(() => window.showDream());
await page.waitForTimeout(350);
const etxt = await page.evaluate(() => document.querySelector('.scr.act').innerText);
ok('the Edit carries the same sentence', /mixing high and low is how i dress my clients/i.test(etxt));
ok('and it links back to Finds', (await page.evaluate(() => !!document.querySelector('#s-dream .dc-xlink[onclick*="openFinds"]'))));
ok('the Edit still works and still wraps its own links',
   (await page.evaluate(() => {
     const mid = Object.keys(window._AFF_MID || {});
     return [...document.querySelectorAll('#s-dream .dc-item-btn')].every(a => {
       const h = a.getAttribute('href') || '';
       let host = ''; try { host = new URL(h.indexOf('murl=') >= 0 ? decodeURIComponent(h.split('murl=')[1]) : h).hostname.replace(/^www\./, ''); } catch (e) {}
       return !mid.some(d => host === d || host.endsWith('.' + d)) || h.indexOf('click.linksynergy.com') >= 0;
     });
   })));

console.log('\n6. IT WEARS THE EDIT\'S FRAME IN HER OWN COLOUR — her ask 2026-09-11');
await page.goto(ORIGIN + '/finds', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.openFinds === 'function');
await page.waitForTimeout(500);
const look = await page.evaluate(() => {
  const g = (e, p) => e ? getComputedStyle(e, p) : null;
  const hdr = document.querySelector('.hdr');
  const card = document.querySelector('.ss');
  const left = document.querySelector('#s-finds .dc-tagline .pinkheart');
  return {
    headerHidden: !hdr || hdr.style.display === 'none',
    frame: card ? card.classList.contains('dream-mirror') : false,
    bleed: g(document.body).backgroundColor,
    velvet: document.documentElement.classList.contains('finds-velvet'),
    teal: document.documentElement.classList.contains('edit-velvet'),
    leftHeart: left ? left.classList.contains('hl') : false,
    leftTilt: left ? g(left).transform : '',
    subtitleFont: g(document.querySelector('#s-finds .dc-subtitle')).fontFamily,
    tagline: g(document.querySelector('#s-finds .dc-tagline')).color,
    editTagline: g(document.querySelector('#s-dream .dc-tagline')).color,
    rule: g(document.querySelector('#s-finds .dc-logo'), '::after').backgroundColor,
    xlink: g(document.querySelector('#s-finds .dc-xlink span')).color,
    editXlink: g(document.querySelector('#s-dream .dc-xlink span')).color,
    xlinkFont: g(document.querySelector('#s-finds .dc-xlink>span')).fontFamily,
    editXlinkFont: g(document.querySelector('#s-dream .dc-xlink>span')).fontFamily,
    xlinkSize: g(document.querySelector('#s-finds .dc-xlink>span')).fontSize,
    editXlinkSize: g(document.querySelector('#s-dream .dc-xlink>span')).fontSize,
  };
});
ok('the shared Style Star logo is hidden, same as the Edit', look.headerHidden);
ok('it wears the Edit\'s own frame (dream-mirror), not a copy', look.frame);
ok('the background bleeds her tan, not the Edit\'s teal', look.velvet && !look.teal, look.bleed);
ok('the bleed is a warm tan', /^rgb\(2\d\d, 1\d\d, \d+\)$/.test(look.bleed), look.bleed);
ok('the LEFT heart mirrors the right one — her catch', look.leftHeart, look.leftTilt);
ok('the subtitle is the Edit\'s serif, not the default sans', /Lora/i.test(look.subtitleFont), look.subtitleFont);
/* 🚨 HER RULING 2026-09-11: "I think I want HAND SELECTED BY CATHERINE to be in
   the same teal color as it is written on the edit page." A tan accent set was
   built here first and she turned it down, so ONLY THE BLEED DIFFERS now.
   ▶ These compare the two SCREENS against each other rather than against a
   hex, so the day she changes the Edit's teal, the Finds page follows and this
   still passes -- which is the whole point of "the same colour as the Edit". */
ok('HAND SELECTED BY CATHERINE is the Edit\'s exact teal — her ruling',
   !!look.tagline && look.tagline === look.editTagline, look.tagline + '  vs  ' + look.editTagline);
/* 🚨🚨 THIS USED TO ASSERT THE TWO PAGES' INVITATIONS WERE THE SAME COLOUR, AND HER
   2026-09-29 RULING RETIRED THAT: a pill wears the colour of WHERE IT GOES, and
   these two go to different places (Finds -> The Edit, pink; the Edit -> Amazon,
   tan). ▶ The 2026-09-11 rule underneath it SURVIVES and is what is asserted now:
   no PER-PAGE accent — both invitations are built by the one shared pill rule, so
   they share their typography and differ only in the one thing she made differ.
   Compared screen-against-screen, never against a hex, so a restyle of the pill
   carries both pages together exactly as her "same as the Edit page" asked. */
ok('both pages\' invitations come off the ONE shared pill rule — no per-page accent',
   !!look.xlinkFont && look.xlinkFont === look.editXlinkFont
     && !!look.xlinkSize && look.xlinkSize === look.editXlinkSize,
   look.xlinkFont + ' ' + look.xlinkSize + '  vs  ' + look.editXlinkFont + ' ' + look.editXlinkSize);
ok('and no tan accent survived inside the frame',
   !/rgb\(140, 90, 30\)|rgb\(201, 139, 60\)/.test([look.tagline, look.rule, look.xlink].join(' ')),
   [look.tagline, look.rule, look.xlink].join(' '));

console.log('\n8. HER FIRST PIECES ARE ON IT — moved off the Edit at her ask, 2026-09-11');
const pieces = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('#s-finds .dc-item')];
  return {
    n: rows.length,
    hrefs: rows.map(r => (r.querySelector('.dc-item-btn') || {}).href || ''),
    rels: rows.map(r => (r.querySelector('.dc-item-btn') || {}).rel || ''),
    names: rows.map(r => (r.querySelector('.dc-item-name') || {}).textContent || ''),
    saves: rows.filter(r => r.querySelector('.wl-save')).length,
    empty: document.querySelectorAll('#s-finds .dc-empty-note').length,
  };
});
ok('her pieces are on the page', pieces.n >= 2, String(pieces.n));
ok('the waiting placeholder is gone now that they have landed', pieces.empty === 0);
ok('every piece is an Amazon link', pieces.hrefs.every(h => /(^|\.)amazon\.com\//.test(h)), pieces.hrefs.join(' | '));
ok('every outbound link is rel="sponsored noopener" — affq\'s rule',
   pieces.rels.every(r => /sponsored/.test(r) && /noopener/.test(r)), pieces.rels.join(' | '));
ok('every piece carries the save heart, added at runtime', pieces.saves === pieces.n, String(pieces.saves));
/* ⚠️ THE OTHER HALF OF A MOVE: it is only a move if it LEFT. A copy would look
   identical on this page and quietly double her Amazon pieces across the app. */
await page.goto(ORIGIN + '/edit', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.showDream === 'function');
await page.waitForTimeout(400);
const leftBehind = await page.evaluate(() => ({
  n: document.querySelectorAll('#s-dream .dc-item').length,
  amazon: [...document.querySelectorAll('#s-dream .dc-item-btn')]
            .filter(a => /(^|\.)amazon\.com\//.test(a.href)).length,
}));
ok('they really LEFT the Edit — it holds no Amazon piece', leftBehind.amazon === 0, String(leftBehind.amazon));
/* 🚨🚨 THIS PINNED 25 AND WENT RED AGAIN 2026-09-12 WHEN SHE DELETED ELEVEN
   NON-EARNING, NO-PHOTO EDIT ITEMS BY HER OWN EXPLICIT CALL (28 → 18) — the
   exact same shape of failure as the 33-count version of this line: a count
   she is free to change, pinned as if it were a promise. THE RULE this line
   exists for is that moving her Amazon pieces to /finds did not empty the
   Edit, not that the Edit sits above any particular size — it is
   hand-maintained markup and its count is hers to change whenever she likes.
   ▶ FIXED to a low structural floor (5) that only catches actual gutting —
   an empty or near-empty page — never her own editorial choices, however
   far she takes them. The Amazon check above still carries the real claim. */
ok('and the Edit is still a real curated page, not gutted by the move',
   leftBehind.n >= 5, String(leftBehind.n));

console.log('\n8b. THE PRICES ARE ROUNDED UP WITH A TILDE — her ask, 2026-09-11');
/* 🚨 WHY THIS PAGE AND NOT THE EDIT, AND IT IS A TRUTH DIFFERENCE RATHER THAN A
   STYLE ONE: Amazon product pages are BOT-WALLED (measured 2026-09-11 — one
   serves an automated-access wall, the other 166KB with no price in it), so an
   Amazon price can never be verified from here and moves daily. A tilde is
   honest about a number nobody can check. The Edit's shops CAN be read, so the
   Edit keeps exact prices. ⚠️ A future tidy-up will want to unify the two. It
   must not — these pages differ here because the FACTS differ. */
const editPrices = await page.evaluate(() =>
  [...document.querySelectorAll('#s-dream .dc-price')].map(e => e.textContent.trim()));
/* ⚠️ MEASURED RATHER THAN ASSUMED, AND IT CORRECTED THIS CHECK AS FIRST WRITTEN:
   the Edit ALREADY carries a tilde on 6 of its 33 prices (~$50, ~$295, ...), so
   "the Edit shows exact prices" was simply false. The tilde is not a new
   convention on /finds — it is one she already uses where a figure is
   approximate. ▶ What is worth guarding is that the Edit was not SWEPT into the
   Finds rule: its readable shops still print what they really charge. */
ok('the Edit is not swept into the Finds rule — most of it still prints exact prices',
   editPrices.filter(p => p[0] !== '~').length > editPrices.length / 2,
   editPrices.filter(p => p[0] === '~').length + ' of ' + editPrices.length + ' tilded');
await page.goto(ORIGIN + '/finds', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.openFinds === 'function');
await page.waitForTimeout(300);
const money = await page.evaluate(() =>
  [...document.querySelectorAll('#s-finds .dc-price')]
    .map(e => ({ shown: e.textContent.trim(), exact: e.getAttribute('data-price') })));
ok('every Finds price carries a tilde', money.length > 0 && money.every(m => /^~/.test(m.shown)), JSON.stringify(money));
ok('and not one of them shows cents', money.every(m => !/\.\d/.test(m.shown)), money.map(m => m.shown).join(' | '));
/* ⚠️ CEILING, NEVER NEAREST. Nearest prints ~$16 for a $16.25 piece and she
   arrives to find it DEARER than the page said — her own sale-price rule broken
   by a rounding mode. This asserts the RULE, not the four numbers on it today. */
ok('each shown price is her real figure rounded UP, never down', money.every(m => {
  /* ⚠️ TAKE THE LEADING NUMBER ONLY. "~$10 for 4" has a 4 in its qualifier, and
     stripping every non-digit turned it into 104 — a check that failed on a card
     that was perfectly correct. */
  const num = t => parseFloat((/([0-9]+(?:\.[0-9]+)?)/.exec(String(t || '')) || [])[1]);
  const n = num(m.exact), s = num(m.shown);
  return !isFinite(n) || s === Math.ceil(n);
}), JSON.stringify(money));
ok('the exact figure she typed is still stored on every card',
   money.every(m => m.exact && m.exact.length > 0), JSON.stringify(money));
/* ▶ A TRAILING QUALIFIER IS NOT DECORATION: four cuffs for ~$10 is a different
   offer from one, so the rounder may never throw those words away. */
ok('a price qualifier survives the rounding',
   money.filter(m => / for \d/.test(String(m.exact))).every(m => / for \d/.test(m.shown)),
   money.map(m => m.shown).join(' | '));


console.log('\n9. HER FIVE DESIGN NOTES, 2026-09-11');
/* 🚨 THE TAP TARGETS ARE A SAFETY ASK, NOT A TASTE ONE: "those buttons need to
   be spaced out a bit more so finger doesn't bump the wrong one." Her audience
   runs to 80. 44px is the platform minimum and it is asserted as a FLOOR on
   BOTH screens, so a future type or padding tweak cannot quietly shrink it. */
const foot = async (route, screen) => {
  await page.goto(ORIGIN + route, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  return page.evaluate(s => {
    const g = e => e ? getComputedStyle(e) : null;
    const sc = document.getElementById(s);
    const q = x => document.querySelector('#' + s + ' ' + x);
    const xl = q('.dc-xlink'), tl = q('.dc-trend-link');
    const sp = xl && xl.querySelector(':scope > span');
    return {
      hasBoth: !!xl && !!tl,
      xlH: xl ? xl.getBoundingClientRect().height : 0,
      tlH: tl ? tl.getBoundingClientRect().height : 0,
      gap: (xl && tl) ? tl.getBoundingClientRect().top - xl.getBoundingClientRect().bottom : 0,
      tlSize: tl ? parseFloat(g(tl).fontSize) : 0,
      xlSize: xl ? parseFloat(g(xl).fontSize) : 0,
      /* ⚠️ THE INVITATION'S OWN SIZE, WHICH IS NOT ITS PARENT'S. `.dc-xlink` is the
         block holding HER SENTENCE (14px Lora); the invitation is the `>span`
         inside it, and since 2026-09-29 that span is the pill. Comparing the
         trending pill against the PARENT compared a button to a sentence. */
      spSize: sp ? parseFloat(g(sp).fontSize) : 0,
      spFont: sp ? g(sp).fontFamily.split(',')[0].replace(/['"]/g, '') : '',
      tlFont: tl ? g(tl).fontFamily.split(',')[0].replace(/['"]/g, '') : '',
      spW: sp ? Math.round(sp.getBoundingClientRect().width) : 0,
      tlW: tl ? Math.round(tl.getBoundingClientRect().width) : 0,
      /* ⚠️ WHERE A PILL WEARS ITS COLOUR IS HERS TO MOVE; THAT IT WEARS IT IS THE
         RULE. Before 2026-09-29 pink and teal were the TEXT colour; her ruling
         moved them into the frame and made the writing black. So the colour is
         looked for across every property that can carry it, not just `color`. */
      spInk: sp ? [g(sp).color, g(sp).boxShadow, g(sp).borderTopColor, g(sp).backgroundImage, g(sp).backgroundColor].join(' | ') : '',
      spBg: sp ? g(sp).backgroundColor : '',
      /* 🚨 HER RULING 2026-09-29: "I don't want the silver to be gradient." The
         framed pills' silver edge must be ONE FLAT COLOUR. Read as: no gradient
         anywhere on the pill (a gradient shows up as a `background-image`, which is
         how the first build painted it), and the four border sides all the same. */
      framedEdges: [...sc.querySelectorAll('.dc-xlink>span,.dc-trend-link')].map(e => {
        const c = g(e);
        return {
          grad: c.backgroundImage !== 'none',
          sides: [c.borderTopColor, c.borderRightColor, c.borderBottomColor, c.borderLeftColor],
          w: c.borderTopWidth,
        };
      }),
      /* 🚨 HER TWO ASKS, 2026-09-29: "Make the spacing between buttons even" and
         "all of the pills the same size". ▶ Both are claims about the WHOLE run of
         closing pills, not about one pair, so the run is read in document order and
         its gaps and heights are compared against each other -- never against a
         pixel value she is free to restyle. The run grows on its own (the Amazon
         Storefront pill joined it 2026-09-22) and these still hold. */
      pillRun: (() => {
        const els = [...sc.querySelectorAll('.dc-xlink>span,.dc-trend-link,.dc-store-btn.is-bottom')]
          .map(e => e.getBoundingClientRect()).sort((a, b) => a.top - b.top);
        return {
          n: els.length,
          gaps: els.slice(1).map((r, i) => +(r.top - els[i].bottom).toFixed(1)),
          heights: els.map(r => +r.height.toFixed(1)),
          widths: els.map(r => Math.round(r.width)),
        };
      })(),
      tlInk: tl ? [g(tl).color, g(tl).boxShadow, g(tl).borderTopColor, g(tl).backgroundImage].join(' | ') : '',
      /* her sentence and her invitation each sit on their OWN line: no word of the
         sentence may share a line with the pill. Measured as a real geometric
         overlap between the sentence's own text rects and the pill's box, which
         survives any change of font, padding or pill shape. */
      sentenceSharesPillLine: (() => {
        if (!xl || !sp) return true;
        const t = xl.childNodes[0];
        if (!t || t.nodeType !== 3) return true;
        const r = document.createRange(); r.selectNodeContents(t);
        const pill = sp.getBoundingClientRect();
        return [...r.getClientRects()].some(b => b.bottom > pill.top + 1 && b.top < pill.bottom - 1);
      })(),
      /* and the invitation itself is ONE pill, never split into two boxes */
      pillBoxes: sp ? sp.getClientRects().length : 0,
      /* ⚠️ An arrow or a heart alone on a line is the fault she caught. These
         welds are font- and width-independent, which a hand-typed &nbsp; tuned
         to one screen would not be. */
      welds: document.querySelectorAll('#' + s + ' .dc-xlink .nb, #' + s + ' .dc-trend-link .nb').length,
      crosslinks: document.querySelectorAll('#' + s + ' .dc-xlink, #' + s + ' .dc-trend-link').length,
      xlText: (xl || {}).textContent || '',
      xlGo: (xl && xl.getAttribute('onclick')) || '',
      xlColour: xl ? g(xl.querySelector('span')).color : '',
      /* her sentence and her invitation each get ONE line of their own at phone
         width, on BOTH pages — the layout may not depend on how long the link
         text happens to be. Measured in line-heights, which cannot lie. */
      xlSentenceLines: xl ? +( (xl.getBoundingClientRect().height
          - parseFloat(g(xl).paddingTop) - parseFloat(g(xl).paddingBottom)
          - xl.querySelector('span').getBoundingClientRect().height)
          / parseFloat(g(xl).lineHeight) ).toFixed(2) : 0,
      xlLinkLines: xl ? +( xl.querySelector('span').getBoundingClientRect().height
          / parseFloat(g(xl.querySelector('span')).lineHeight) ).toFixed(2) : 0,
      nbInline: xl ? g(xl.querySelector('.nb')).display : '',
      tlColour: tl ? g(tl).color : '',
      subtitleWeld: !!q('.dc-subtitle .nb'),
    subtitleTail: (q('.dc-subtitle .nb') || {}).textContent || '',
      balanced: g(q('.dc-subtitle')).textWrap || g(q('.dc-subtitle')).textWrapStyle,
      linen: /rgba\(150, 140, 120/.test(g(document.querySelector('.ss')).backgroundImage),
    };
  }, screen);
};
for (const [route, screen, label] of [['/finds', 's-finds', 'Amazon Finds'], ['/edit', 's-dream', 'the Edit']]) {
  const f = await foot(route, screen);
  ok(label + ': both closing links are there — her "make both pages look the same"', f.hasBoth);
  ok(label + ': the explore line is a real tap target (>=44px)', f.xlH >= 44, f.xlH + 'px');
  ok(label + ': the trending line is a real tap target (>=44px)', f.tlH >= 44, f.tlH + 'px');
  ok(label + ': and they are held apart so a thumb cannot bump the wrong one', f.gap >= 8, f.gap + 'px');
  /* 🚨 HER ASK, 2026-09-29: "Make the spacing between buttons even." The first gap
     measured 27px against 14px for every gap below it, because `.dc-xlink`'s own
     bottom padding sat underneath the first pill and added itself to the next
     pill's margin. ▶ Asserted as EQUAL TO EACH OTHER, never as a number, so the
     day she changes the rhythm the check follows her instead of fighting her. */
  ok(label + ': every gap between the closing buttons is the same — her ask',
     f.pillRun.gaps.length > 0 && new Set(f.pillRun.gaps).size === 1,
     f.pillRun.gaps.join(' / '));
  /* 🚨 AND "all of the pills the same size", which the thicker frame nearly broke:
     a 4px frame made the framed pills 2px taller than the tan one. Every pill now
     carries the same border box, so a future change to the frame's weight moves
     all of them together. */
  /* 🚨🚨 HER RULING 2026-09-29, AND IT OVERTURNED A CHOICE THAT LOOKED SAFE:
     "I don't want the silver to be gradient." The first build used `.dream-mirror`'s
     own 7-stop metallic gradient, reasoning that it is the app's existing chrome.
     ▶ It is — at a 13px PAGE FRAME. At a 5px BUTTON EDGE it read as a smear and it
     dulled her pink and teal beside it, which is why the colours looked wrong to her
     while the hex values were provably exact. ⚠️ Asserted as "no gradient and one
     flat edge", never as a hex, so the silver itself stays hers to change. */
  ok(label + ': the silver edge is FLAT, never a gradient — her ruling',
     f.framedEdges.length > 0 && f.framedEdges.every(e =>
       !e.grad && new Set(e.sides).size === 1 && parseFloat(e.w) > 0),
     JSON.stringify(f.framedEdges));
  ok(label + ': ...and every one of them is the same size as the others — her ask',
     new Set(f.pillRun.heights).size === 1 && new Set(f.pillRun.widths).size === 1,
     f.pillRun.heights.join('/') + ' x ' + f.pillRun.widths.join('/'));
  /* 🚨 HER RULING 2026-09-29: "Make all of the pills the same size and same font
     and same look to the arrow." ▶ SO THE RULE IS NOW ABOUT THE PAIR, NOT ABOUT
     ONE BEING BIGGER. This used to read `tlSize >= xlSize`, comparing the trending
     PILL against `.dc-xlink`, which is the block holding HER SENTENCE — a button
     measured against a paragraph. It happened to pass while both were 14px and
     went red the moment the pills got their own type scale. */
  ok(label + ': both closing pills are the same size as each other — her ruling',
     f.spSize === f.tlSize && f.spW === f.tlW,
     f.spSize + 'px/' + f.spW + 'px vs ' + f.tlSize + 'px/' + f.tlW + 'px');
  ok(label + ': ...and the same font — also her ruling',
     !!f.spFont && f.spFont === f.tlFont, f.spFont + ' vs ' + f.tlFont);
  ok(label + ': ...and each is smaller than her own sentence, which still leads',
     f.spSize < f.xlSize, f.spSize + ' vs ' + f.xlSize);
  // Pinned to the RULE (every closing crosslink's arrow is welded to its word,
  // whatever the count), not a hardcoded 2 -- the count itself is free to grow
  // (Finds added a third, the Storefront link, 2026-09-22) and that is not a
  // regression. See CLAUDE.md's "pin the rule, never the string" lesson.
  ok(label + ': the arrows are welded to their words, so none can strand',
     f.welds === f.crosslinks && f.crosslinks >= 2, f.welds + ' welds / ' + f.crosslinks + ' crosslinks');
  ok(label + ': the closing heart is welded to her last words', f.subtitleWeld);
  /* 🚨 HER RULING 2026-09-11, AND IT DELIBERATELY BREAKS THE HOUSE PATTERN, WHICH
     IS EXACTLY WHY IT IS ASSERTED. Asked whether these two lines needed a period
     before the heart, the app was MEASURED: 9 of 11 hearts across the whole app
     close with NO period, her own "With love, Catherine ♥" among them. She was
     shown that and chose the period anyway, for THESE TWO LINES ONLY:
     "let's add the period just to these 2 spots on Finds and Edit. Keep the rest
     of the app as is."
     ▶ A future session will find the inconsistency and want to fix it. It must
     not: the inconsistency IS the decision. */
  ok(label + ': her subtitle ends with a period before the heart — her ruling',
     /\.\s*$/.test(f.subtitleTail), JSON.stringify(f.subtitleTail));
  ok(label + ': the subtitle balances its lines at any width', /balance/.test(f.balanced || ''), f.balanced);
  /* 🚨 HER RULING 2026-09-11: each page NAMES where its link goes, instead of
     the old "explore more" which said nothing. "Click here to explore Amazon
     Finds" / "Click here to explore The Edit".
     ▶ The pair is asserted CROSSWISE on purpose — the commonest way to break
     this is to copy one page's markup onto the other, which would leave a page
     inviting a woman to explore the page she is already standing on. */
  const goesTo = label === 'Amazon Finds'
    ? { names: /explore\s+The Edit/i, calls: /showDream/, notItself: /Amazon Finds/i,
        ink: 'rgb(236, 72, 153)', inkName: 'PINK, the Edit\'s colour' }
    : { names: /explore\s+Amazon Finds/i, calls: /openFinds/, notItself: /The Edit/i,
        ink: 'rgb(236, 189, 131)', inkName: 'TAN, Amazon\'s colour' };
  ok(label + ': its closing link NAMES the other page', goesTo.names.test(f.xlText), f.xlText.trim());
  ok(label + ': ...and actually goes there', goesTo.calls.test(f.xlGo), f.xlGo);
  ok(label + ': ...and never invites her to the page she is already on',
     !goesTo.notItself.test(f.xlText.replace(/^[^]*?explore/i, '')), f.xlText.trim());
  /* 🚨 HER RULING, AND THE TWO HALVES ARE EQUALLY HER WORDS: "let's make that
     pink instead of turquoise. Keep the Curious what's trending line turquoise."
     ▶ So the test asserts they DIFFER, not just that one is pink — the failure
     she would actually mind is a sweep that recolours both. */
  /* 🚨🚨 REWRITTEN TWICE ON 2026-09-29, AND THE SECOND REWRITE IS THE REAL RULE.
     (1) These read `color` on the invitation and the trending link, which was right
     while the words themselves were pink and teal. Her ruling that morning made the
     WRITING BLACK and moved her colours into the frame, so they went red on a
     correct page — the property is hers to move, the colour is the rule.
     (2) Then the pink one was asserted on BOTH pages, reading "The Edit stays pink"
     as a rule about the PAGE. She caught it from a screenshot of the EDIT page:
     "The Amazon button is supposed to be tan." ▶▶ A PILL WEARS THE COLOUR OF WHERE
     IT GOES, NOT OF THE PAGE IT SITS ON — and the two pages' invitations point at
     DIFFERENT places, which is why one rule looked like two.
     ▶ Asserted CROSSWISE off `goesTo`, the same shape as the wording check right
     above, so the commonest break (copying one page's markup onto the other) fails
     on the colour as well as on the words. */
  ok(label + ': its closing link wears ' + goesTo.inkName + ' — the colour of where it GOES',
     f.spInk.includes(goesTo.ink), f.spInk);
  ok(label + ': and the trending pill beside it STAYS turquoise — her ruling',
     f.tlInk.includes('rgb(15, 166, 182)'), f.tlInk);
  ok(label + ': ...and neither has picked up the other\'s colour — the sweep she would mind',
     !f.spInk.includes('rgb(15, 166, 182)') && !f.tlInk.includes(goesTo.ink));
  /* 🚨 AND THE TAN IS A FILL, NEVER THIN INK — she ruled on exactly that on
     2026-09-22 (a tan outline read "greenish brown" to her even after it was
     darkened to pass contrast; her own fix was to FILL the pill instead). So on
     the page whose invitation goes to Amazon, the tan must be the BACKGROUND. */
  if (goesTo.ink === 'rgb(236, 189, 131)')
    ok(label + ': ...and that tan is a FILL, not an outline — her 2026-09-22 ruling',
       f.spBg === 'rgb(236, 189, 131)', f.spBg);
  /* 🚨 HER ASK 2026-09-11: "the spacing looks better on the edit. Can you make it
     match on finds?" Nothing was styled differently — the two pages carry the
     SAME sentence and DIFFERENT link text, and `text-wrap:balance` split them at
     different points. The break is STRUCTURAL now, so it cannot drift again the
     next time she renames a link. ▶ Asserted on BOTH pages, because "match" is
     a claim about the pair. */
  /* ⚠️ REWRITTEN 2026-09-29 — THE RULE SURVIVED, THE ARITHMETIC DID NOT. Both of
     these used to divide a leftover height by a line-height, which only works
     while the invitation is plain inline text. It is a padded, bordered pill now,
     so the subtraction counted its padding and border as lines of her sentence.
     ▶ HER RULE IS THE STRUCTURAL BREAK: the invitation is never jammed onto the
     end of her sentence. That is now measured as a real geometric overlap, which
     no change of font, padding or pill shape can fool. */
  ok(label + ': her sentence and the invitation never share a line — her ask',
     f.sentenceSharesPillLine === false);
  ok(label + ': and the invitation is one unbroken pill, not split across lines',
     f.pillBoxes === 1, String(f.pillBoxes));
  /* ⚠️ THE MISTAKE THIS CAUGHT, AND IT COST A ROUND: `.dc-xlink span` matches the
     `.nb` weld nested INSIDE the invitation as well, so `display:block` on the
     loose selector put "The Edit →" on a line of its own at any width. The
     selector must be `>`; the weld must stay inline. */
  ok(label + ': the arrow weld stays inline, not a block of its own',
     f.nbInline === 'inline', f.nbInline);
}
/* ⚠️ HER ASK WAS SCOPED TO ONE PAGE — "take out the background linen on THIS
   page". The Edit keeps its linen deliberately; asserting BOTH halves is what
   stops a later tidy-up sweeping the Edit along with it. */
ok('Amazon Finds is plain white paper now — her ask', (await foot('/finds', 's-finds')).linen === false);
ok('...and the Edit KEEPS its linen, which she did not ask to change',
   (await foot('/edit', 's-dream')).linen === true);
/* ▶ Her "let's go ahead and put it in": the app's own nav, next to the Edit. */
ok('Amazon Finds has a way in from inside the app (the menu, beside the Edit)',
   await page.evaluate(() => {
     const rows = [...document.querySelectorAll('.menu-panel .menu-row')];
     const i = rows.findIndex(r => /amazon finds/i.test(r.textContent));
     const e = rows.findIndex(r => /style star edit/i.test(r.textContent));
     return i > 0 && e > 0 && Math.abs(i - e) === 1
         && /openFinds/.test(rows[i].getAttribute('onclick') || '');
   }));
/* 🩷 HER ASK 2026-09-11: "Should we put our heart on Amazon finds since they are
   hand picked?" — and the answer came out of her own app rather than an opinion.
   The mark means A PERSON CHOSE WHAT IS ON THIS ROW, and Amazon Finds is the one
   page whose own subtitle says HAND SELECTED BY CATHERINE in the Edit's own teal.
   🚨 THE TWO PAGES ARE A MATCHED PAIR BY HER DESIGN, so the assertion is CROSSWISE
   like the closing links: they wear the mark TOGETHER. Marking one and not the
   other is "a rule applied to one half" landing in the navigation — and a later
   sweep is exactly how that happens. */
const marked = await page.evaluate(() => Object.fromEntries(
  [...document.querySelectorAll('.menu-panel .menu-row')]
    .map(r => [r.textContent.trim().replace(/\s+/g, ' '), !!r.querySelector('.menu-ch')])));
ok('the Edit wears her maker\'s mark', marked['Style Star Edit'] === true);
ok('...and so does Amazon Finds, which is hand selected too', marked['Amazon Finds'] === true);
/* ⚠️ AND THE RESTRAINT HALF, WHICH IS THE WHOLE REASON THE MARK MEANS ANYTHING:
   the rows that are the APP WORKING carry none, however much of her taste is in
   them. This is the check that would catch a sweep spraying hearts down the list. */
for (const row of ['Shop your Style', 'Your Wishlist', 'Style Star Mall'])
  ok(`${row} carries no mark — it is the app working, not Catherine speaking`,
     marked[row] === false);

/* 📏 HER CATCH, 2026-09-11: "the font is small on those, i almost missed them when I
   was scrolling." The heading was 11.5px against a 20px product name — THE SECTION
   LABEL WAS SMALLER THAN EVERYTHING IT GOVERNED, which is why it disappeared.
   ▶ ASSERTED AS A RELATION, NEVER AS A PIXEL VALUE: a heading outranks the note it
   sits above and stays under the product names, so it organises the page without
   competing with the pieces. That survives any future restyling of either; a
   hardcoded 15 would go stale the first time she nudged a size. */
const type = await page.evaluate(() => {
  const n = s => +getComputedStyle(document.querySelector('#s-finds ' + s)).fontSize.replace('px', '');
  return { cat: n('.dc-cat'), name: n('.dc-item-name'), note: n('.dc-item-note'), store: n('.dc-store') };
});
ok('a category heading outranks the note beneath it', type.cat > type.note,
   `cat ${type.cat} vs note ${type.note}`);
ok('...and the store line it sits above', type.cat > type.store, `cat ${type.cat} vs store ${type.store}`);
ok('...but stays under the product names, so it organises rather than competes',
   type.cat < type.name, `cat ${type.cat} vs name ${type.name}`);
/* ⚠️ AND THE OTHER HALF OF WHY SHE MISSED IT: it had 30px of air above against 17px
   between two cards, so it floated between them instead of belonging to what follows. */
const air = await page.evaluate(() => {
  const c = document.querySelectorAll('#s-finds .dc-cat')[1];
  const items = [...document.querySelectorAll('#s-finds .dc-item')];
  return { above: Math.round(c.getBoundingClientRect().top - c.previousElementSibling.getBoundingClientRect().bottom),
           between: Math.round(items[1].getBoundingClientRect().top - items[0].getBoundingClientRect().bottom) };
});
ok('and it is set apart — clearly more air above it than between two cards',
   air.above >= air.between * 2, `above ${air.above} vs between ${air.between}`);

console.log('\n10. NOTHING THREW');
ok('no page errors', errors.length === 0, errors[0]);

console.log('\n' + (fail ? '✗ ' : '✓ ') + pass + ' passed, ' + fail + ' failed\n');
await browser.close(); server.close();
process.exit(fail ? 1 : 0);
