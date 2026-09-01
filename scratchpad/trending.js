// What's Trending as a real page (2026-09-01, her ask: "I would love for
// what's trending to be searchable, that is something that even I would
// google often").
//
// ⚠️ THE ONE ASSERTION THAT MATTERS MOST IS PART A's "the trend words are in
// the RAW HTML". Until today the cards were built client-side into an empty
// div, so /trending could have shipped with a perfect title, a perfect
// canonical and a completely EMPTY body as far as GPTBot, ClaudeBot,
// PerplexityBot and Google's first pass are concerned. That is the same bug
// the Journal hub had, and it is the whole reason this page was rebuilt
// rather than merely routed.
//
// ⚠️ IMPORTS AND CALLS the real page-titles.js, never a copy of its
// transforms (the 2026-08-24 lesson).
// ⚠️ STRIPS COMMENTS AND SCRIPT/STYLE BLOCKS before counting any markup: the
// app's own JS contains the literal string `<h1`, so a bare count reads the
// source code as content.
// ⚠️ SERVES .css AS text/css in Part B. A WRONG MIME type makes Chromium
// refuse the stylesheet and silently measure an unstyled page.
import fs from 'fs';
import http from 'http';
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import handler from '/home/user/stylestar-app/netlify/edge-functions/page-titles.js';
const { chromium } = pw;

const ROOT = '/home/user/stylestar-app';
const RAW = fs.readFileSync(ROOT + '/index.html', 'utf8');
const CSS = fs.readFileSync(ROOT + '/styles.css', 'utf8');
const TOML = fs.readFileSync(ROOT + '/netlify.toml', 'utf8');
const MAP = fs.readFileSync(ROOT + '/sitemap.xml', 'utf8');
const TYPES = { '.css': 'text/css', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain' };

let pass = 0, fail = 0;
const ok = (n, c, x) => { c ? (pass++, console.log('  ✓ ' + n))
                            : (fail++, console.log('  ✗ ' + n + (x ? '  → ' + x : ''))); };

async function edge(path, body = RAW) {
  const ctx = { next: async () => new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } }) };
  return await (await handler(new Request('https://stylestar.app' + path), ctx)).text();
}
const noComments = h => h.replace(/<!--[\s\S]*?-->/g, '');
const clean = h => noComments(h).replace(/<script\b[\s\S]*?<\/script>/gi, '')
                                .replace(/<style\b[\s\S]*?<\/style>/gi, '');
const bodyOf = h => { const b = clean(h); return b.slice(b.indexOf('<body')); };
const h1s = h => (bodyOf(h).match(/<h1[^>]*>/gi) || []).length;
const hasScr = (h, id) => new RegExp('<div class="scr[^"]*" id="' + id + '"').test(h);
const tag = (h, re) => { const m = h.match(re); return m ? m[1] : null; };

// ⚠️ DECODE ENTITIES BEFORE COMPARING SCHEMA TEXT AGAINST SERVED MARKUP. The
// 2026-09-01 false alarm: the visible markup writes &rarr; while the JSON-LD
// carries the real glyph, and a comparison that skipped this reported a
// mismatch on a page that was perfectly correct.
const unesc = s => String(s)
  .replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘')
  .replace(/&rdquo;/g, '”').replace(/&ldquo;/g, '“')
  .replace(/&hellip;/g, '…').replace(/&mdash;/g, '—')
  .replace(/&ndash;/g, '–').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

// The cards as written in index.html -- the single source of truth.
const CARDS = [...RAW.matchAll(
  /<div class="wdr-tcard"><div class="ttf">([^<]*)<\/div><div class="tnf">([^<]*)<\/div>/g)]
  .map(m => ({ n: unesc(m[1]), note: unesc(m[2]) }));

const run = async () => {
console.log('\n== PART A — the bytes that ship ==');
const T = await edge('/trending');

ok('index.html holds the 15 trend cards as STATIC markup', CARDS.length === 15, 'got ' + CARDS.length);
ok('/trending keeps s-trending', hasScr(T, 's-trending'));
ok('/trending drops the wardrobe screen', !hasScr(T, 's-wardrobe'));
ok('/trending drops the welcome screen', !hasScr(T, 's-wel'));
ok('/trending drops every journal screen', !hasScr(T, 's-journal') && !hasScr(T, 's-journal-hub'));
ok('/trending serves exactly ONE <h1>', h1s(T) === 1, 'got ' + h1s(T));
ok('that h1 is the page name', /<h1 class="wdr-title">What's Trending<\/h1>/.test(T));
ok('<body> is stamped data-ss-trimmed', /<body data-ss-trimmed="1">/.test(T));

// ▶ THE LOAD-BEARING ONE.
let inRaw = 0;
const TB = bodyOf(T);
CARDS.forEach(c => { if (TB.includes(c.n) && TB.includes(c.note)) inRaw++; });
ok('all 15 trend names AND notes are in the RAW served body', inRaw === 15, inRaw + '/15');

ok('title is set and inside Google\'s display budget',
  tag(T, /<title>([\s\S]*?)<\/title>/i) && tag(T, /<title>([\s\S]*?)<\/title>/i).length <= 60,
  String(tag(T, /<title>([\s\S]*?)<\/title>/i)));
ok('description is set and inside budget',
  (tag(T, /<meta name="description" content="([^"]*)"/i) || '').length > 60 &&
  (tag(T, /<meta name="description" content="([^"]*)"/i) || '').length <= 162,
  String((tag(T, /<meta name="description" content="([^"]*)"/i) || '').length));
ok('og:title matches the page title',
  tag(T, /<meta property="og:title" content="([^"]*)"/i) === tag(T, /<title>([\s\S]*?)<\/title>/i));
ok('canonical self-references /trending',
  tag(T, /<link rel="canonical" href="([^"]*)"/i) === 'https://stylestar.app/trending');

// Schema, generated FROM the page
const ld = [...T.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(m => { try { return JSON.parse(m[1]); } catch (e) { return null; } });
const list = ld.find(x => x && x['@type'] === 'CollectionPage' && x.mainEntity);
ok('every JSON-LD block on the page parses', ld.every(Boolean), ld.length + ' blocks');
ok('an ItemList schema is present', !!list);
ok('the ItemList holds all 15 trends', list && list.mainEntity.itemListElement.length === 15,
   list ? String(list.mainEntity.itemListElement.length) : 'none');
let match = 0;
if (list) list.mainEntity.itemListElement.forEach((it, i) => {
  if (CARDS[i] && it.name === CARDS[i].n && it.description === CARDS[i].note) match++;
});
ok('every schema entry matches the visible card VERBATIM, in order', match === 15, match + '/15');
ok('the schema is DERIVED, not typed into page-titles.js',
   !fs.readFileSync(ROOT + '/netlify/edge-functions/page-titles.js', 'utf8').includes(CARDS[0].n));

// The homepage must not serve the same words
const HOME = await edge('/');
ok('the homepage DROPS s-trending', !hasScr(HOME, 's-trending'));
ok('the homepage still keeps s-wardrobe', hasScr(HOME, 's-wardrobe'));
ok('the homepage still serves exactly ONE <h1>', h1s(HOME) === 1, 'got ' + h1s(HOME));
let leaked = 0;
CARDS.forEach(c => { if (bodyOf(HOME).includes(c.note)) leaked++; });
ok('no trend note is left on the homepage', leaked === 0, leaked + ' leaked');

// /index.html must stay whole -- it is what self-heal fetches
ok('the raw index.html still carries s-trending (self-heal source)', hasScr(RAW, 's-trending'));

// Plumbing
ok('netlify.toml rewrites /trending', /from = "\/trending"[\s\S]{0,80}status = 200/.test(TOML));
ok('netlify.toml scopes the edge function to /trending',
   /\[\[edge_functions\]\]\s*\n\s*path = "\/trending"/.test(TOML));
ok('sitemap.xml lists /trending', MAP.includes('<loc>https://stylestar.app/trending</loc>'));
ok('_ROUTES maps s-trending -> /trending', RAW.includes("'s-trending':'/trending'"));
ok('_openRoute has an s-trending branch', RAW.includes("id==='s-trending')openTrending()"));

// The CSS twins -- the A2HS-heart trap
// ⚠️ STRIP COMMENTS FIRST. Both files carry long comments that NAME these
// selectors, and counting those reported a false pass (equal totals, different
// lists) on the first run of this suite.
const CSSCODE = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
const JSCODE = RAW.replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*\/\/.*$/gm, '');
const wardrobeSel = [...CSSCODE.matchAll(/#s-wardrobe(?![-\w])([^,{}\n]*)/g)].map(m => m[1]);
const trendingSel = [...CSSCODE.matchAll(/#s-trending(?![-\w])([^,{}\n]*)/g)].map(m => m[1]);
ok('every #s-wardrobe selector has a #s-trending twin',
   wardrobeSel.length === trendingSel.length && wardrobeSel.every((x, i) => x === trendingSel[i]),
   wardrobeSel.length + ' vs ' + trendingSel.length);
ok('there is no second trend list left in the JS',
   !/(?:const|var|let)\s+trendItems\s*=/.test(JSCODE));
ok('nothing still calls the old openWardrobe(\'trend\')', !RAW.includes("openWardrobe('trend')"));

console.log('\n== PART B — the real app in a real browser ==');
const srv = http.createServer(async (req, res) => {
  const p = req.url.split('?')[0];
  // ⚠️ UNTRIMMED ON PURPOSE: this is the file _selfHealScreens() fetches.
  if (p === '/index.html') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(RAW); }
  const ext = p.slice(p.lastIndexOf('.'));
  if (TYPES[ext] && fs.existsSync(ROOT + p)) {
    res.writeHead(200, { 'content-type': TYPES[ext] }); return res.end(fs.readFileSync(ROOT + p));
  }
  try {
    const html = await edge(p === '/' ? '/' : p.replace(/\/+$/, ''));
    res.writeHead(200, { 'content-type': 'text/html' }); res.end(html);
  } catch (e) { res.writeHead(404); res.end('no'); }
});
await new Promise(r => srv.listen(8994, r));
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

async function page(width = 390) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 } });
  await ctx.route('**/*', r => (new URL(r.request().url()).host === 'localhost:8994') ? r.continue() : r.abort());
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e)));
  return { ctx, pg, errs };
}
// ⚠️ SEED SHAPE, corrected 2026-09-01: _hasQuizData() reads d.userName, NOT
// d.name, so the old seed here saved without error and was read as a woman who
// had NEVER taken the quiz. Nothing in this suite rested on it (these tests are
// about navigation, not quiz state), but it is the documented "a shape the app
// never produces" trap and a future assertion would have inherited a false
// premise. The real shape is written at genResult().
const seed = async ctx => ctx.addInitScript(() => {
  localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: new Array(12).fill(6),
    topArchNames: ['Classic Sophisticate'], portrait: 'A real portrait sentence.', motto: 'Shine.' }));
});

// --- the seed really is read as a quiz-taker (guards the shape trap above)
{
  const { ctx, pg } = await page();
  await seed(ctx);
  await pg.goto('http://localhost:8994/', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(700);
  ok('B: the seeded woman really reads as a quiz-taker',
     await pg.evaluate(() => _hasQuizData()) === true);
  await ctx.close();
}

// --- landing cold on /trending, the way a search result does
{
  const { ctx, pg, errs } = await page();
  await pg.goto('http://localhost:8994/trending', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(900);
  const st = await pg.evaluate(() => {
    const s = document.getElementById('s-trending');
    const cards = [...document.querySelectorAll('#s-trending .wdr-tcard')];
    return {
      active: !!s && s.classList.contains('act'),
      visible: !!s && s.getBoundingClientRect().height > 200,
      cards: cards.length,
      links: document.querySelectorAll('#s-trending .wdr-tcard .tlf').length,
      boxes: document.querySelectorAll('#s-trending .wdr-tcard .wdr-expand').length,
      h1: (document.querySelector('#s-trending h1') || {}).textContent,
      framed: !!document.querySelector('.ss.wardrobe-mirror'),
      titleFont: s ? getComputedStyle(s.querySelector('.wdr-title')).fontFamily : '',
      cardBg: cards[0] ? getComputedStyle(cards[0]).backgroundColor : '',
      path: location.pathname,
      seen: localStorage.getItem('ss_trending_seen'),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  ok('B: /trending opens the screen', st.active && st.visible);
  ok('B: all 15 cards render', st.cards === 15, String(st.cards));
  ok('B: every card got its "See ideas" link at runtime', st.links === 15, String(st.links));
  ok('B: every card got its carousel box', st.boxes === 15, String(st.boxes));
  ok('B: the h1 reads What\'s Trending', st.h1 === "What's Trending", String(st.h1));
  ok('B: it wears the display-case frame', st.framed);
  // The A2HS-heart trap: styling must survive the move to a new screen.
  ok('B: the title keeps its serif face (CSS twin works)', /DM Serif Display/.test(st.titleFont), st.titleFont);
  ok('B: the cards keep their linen fill', st.cardBg === 'rgb(245, 239, 226)', st.cardBg);
  ok('B: the address bar stays on /trending', st.path === '/trending', st.path);
  ok('B: visiting stamps the New pill as seen', st.seen === '15', String(st.seen));
  ok('B: no sideways scroll at 390', st.overflow <= 0, String(st.overflow));
  ok('B: zero JS errors on a cold landing', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// --- the wardrobe tab now navigates
{
  const { ctx, pg, errs } = await page();
  await seed(ctx);
  await pg.goto('http://localhost:8994/', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(1200);
  await pg.evaluate(() => openWardrobe());
  await pg.waitForTimeout(400);
  const before = await pg.evaluate(() => ({
    panes: document.querySelectorAll('#s-wardrobe .wdr-pane').length,
    trendPane: document.querySelectorAll('#s-wardrobe .wdr-pane[data-pane="trend"]').length,
    teaser: document.querySelectorAll('#s-wardrobe #wdrTeaserBody .wdr-tt-card').length,
    seeAll: document.querySelectorAll('#s-wardrobe .wdr-tt-all').length,
  }));
  ok('B: the wardrobe keeps ONE pane (My List)', before.panes === 1, String(before.panes));
  ok('B: the trend pane is gone from the wardrobe', before.trendPane === 0);
  // ⚠️ The "See all trending" card carries BOTH classes, so the strip is 4
  //    cards of which one is the tail. A first run asserted 3 and failed on a
  //    perfectly correct strip.
  ok('B: the teaser strip still shows 3 trends + a See all card',
     before.teaser === 4 && before.seeAll === 1, before.teaser + '/' + before.seeAll);
  await pg.evaluate(() => document.querySelector('#s-wardrobe .wdr-tab[data-tab="trend"]').click());
  await pg.waitForTimeout(500);
  const after = await pg.evaluate(() => ({
    act: (document.querySelector('.scr.act') || {}).id, path: location.pathname,
    cards: document.querySelectorAll('#s-trending .wdr-tcard .tlf').length,
  }));
  ok('B: the tab navigates to the Trending screen', after.act === 's-trending', String(after.act));
  ok('B: and writes /trending into the address bar', after.path === '/trending', after.path);
  ok('B: the cards are decorated when reached this way too', after.cards === 15, String(after.cards));
  await pg.evaluate(() => closeTrending());
  await pg.waitForTimeout(400);
  const back = await pg.evaluate(() => (document.querySelector('.scr.act') || {}).id);
  ok('B: Back returns to the wardrobe she came from', back === 's-wardrobe', String(back));
  ok('B: zero JS errors across the round trip', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// --- ⚠️ THE PAIR MUST WORK BOTH WAYS (her catch on the live page)
// It shipped one-way: the wardrobe could reach Trending, Trending could only
// go Back. The two tabs had read as a two-way switch for months.
{
  const { ctx, pg, errs } = await page();
  await seed(ctx);
  await pg.goto('http://localhost:8994/trending', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(700);
  const bar = await pg.evaluate(() => {
    const tabs = [...document.querySelectorAll('#s-trending .wdr-tab')];
    return {
      n: tabs.length,
      labels: tabs.map(t => t.textContent.trim()),
      activeIs: (tabs.find(t => t.classList.contains('on')) || {}).dataset,
      badges: document.querySelectorAll('#s-trending .wdr-tab-badge').length,
      hint: (document.querySelector('#s-trending .wdr-tabhint') || {}).textContent,
      // both arrows point out to their own side, exactly as on the wardrobe
      leftFlipped: getComputedStyle(
        document.querySelector('#s-trending .wdr-tab[data-tab="list"] .wdr-tab-ar')).transform,
    };
  });
  ok('B: Trending carries the same two-tab bar', bar.n === 2, String(bar.n));
  ok('B: with What\'s Trending as the ACTIVE one', bar.activeIs && bar.activeIs.tab === 'trend',
     JSON.stringify(bar.activeIs));
  ok('B: and My List as the other door', /MY LIST|My List/i.test(bar.labels[0]), JSON.stringify(bar.labels));
  ok('B: the My List arrow is mirrored to point left', /matrix\(-1/.test(bar.leftFlipped), bar.leftFlipped);
  ok('B: it carries the same "Tap either list" hint', /Tap either list/.test(bar.hint || ''), String(bar.hint));
  // ⚠️ No "New" pill here: reaching the page is what stands it down.
  ok('B: no New pill on this copy of the tab', bar.badges === 0, String(bar.badges));

  const backToList = await pg.evaluate(async () => {
    document.querySelector('#s-trending .wdr-tab[data-tab="list"]').click();
    await new Promise(r => setTimeout(r, 600));
    return { act: (document.querySelector('.scr.act') || {}).id, path: location.pathname,
             listOn: !!document.querySelector('#s-wardrobe .wdr-pane[data-pane="list"].on') };
  });
  ok('B: tapping My List returns to the wardrobe', backToList.act === 's-wardrobe', String(backToList.act));
  ok('B: ...on My List, at the app root', backToList.listOn && backToList.path === '/', backToList.path);
  const roundTrip = await pg.evaluate(async () => {
    document.querySelector('#s-wardrobe .wdr-tab[data-tab="trend"]').click();
    await new Promise(r => setTimeout(r, 600));
    return (document.querySelector('.scr.act') || {}).id;
  });
  ok('B: and the round trip goes back the other way', roundTrip === 's-trending', String(roundTrip));
  ok('B: zero JS errors across the round trip', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// --- every other door
{
  const { ctx, pg, errs } = await page();
  await seed(ctx);
  await pg.goto('http://localhost:8994/', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(1200);
  const viaMenu = await pg.evaluate(async () => {
    menuOpen();
    const row = [...document.querySelectorAll('.menu-row')].find(r => /What's Trending/.test(r.textContent));
    if (!row) return 'no row';
    row.click();
    await new Promise(r => setTimeout(r, 500));
    return (document.querySelector('.scr.act') || {}).id;
  });
  ok('B: the Menu row reaches it', viaMenu === 's-trending', String(viaMenu));
  const viaTeaser = await pg.evaluate(async () => {
    openWardrobe(); await new Promise(r => setTimeout(r, 300));
    document.querySelector('#s-wardrobe .wdr-tt-all').click();
    await new Promise(r => setTimeout(r, 500));
    return (document.querySelector('.scr.act') || {}).id;
  });
  ok('B: the teaser\'s "See all trending" card reaches it', viaTeaser === 's-trending', String(viaTeaser));
  ok('B: zero JS errors across every door', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// --- landing cold on a trimmed route, then tapping through
// This is the real shape of a search visitor's journey, and the one case where
// #s-trending genuinely is not in the served HTML at all.
// ⚠️ THE LINK IS ON THE JOURNAL ARTICLE, NOT ON /faq. A first run of this
// suite hunted for it in #s-faq and reported "no link" on perfectly correct
// code: her 2026-09-01 FAQ addition went into ARTICLE #2's own FAQ block, not
// the site's FAQ page. That distinction is recorded in CLAUDE.md; the harness
// had simply not read it.
{
  // First, on the BYTES -- the DOM is the wrong instrument here, because
  // self-heal has usually already run by the time networkidle fires. A first
  // run asserted against the DOM and failed on correct code.
  const ART = await edge('/journal/how-to-dress-for-fall-in-florida');
  ok('B: the article route is served WITHOUT s-trending', !hasScr(ART, 's-trending'));
  ok('B: the article route still carries its own screen', hasScr(ART, 's-journal-fall-florida'));

  const { ctx, pg, errs } = await page();
  await seed(ctx);
  await pg.goto('http://localhost:8994/journal/how-to-dress-for-fall-in-florida', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(1800);   // let self-heal fetch /index.html
  const healed = await pg.evaluate(async () => {
    const lnk = [...document.querySelectorAll('#s-journal-fall-florida .lnk')]
      .find(l => /trending/i.test(l.textContent));
    if (!lnk) return { err: 'no trending link in the article' };
    lnk.click();
    await new Promise(r => setTimeout(r, 600));
    return {
      act: (document.querySelector('.scr.act') || {}).id,
      path: location.pathname,
      cards: document.querySelectorAll('#s-trending .wdr-tcard .tlf').length,
      sig: wbTrendSig(),
    };
  });
  ok('B: the article\'s link reaches Trending after a cold landing',
     healed.act === 's-trending', JSON.stringify(healed));
  ok('B: and lands on the real address', healed.path === '/trending', String(healed.path));
  ok('B: the healed screen is decorated too', healed.cards === 15, String(healed.cards));
  ok('B: the trend count recovers (no empty answer cached)', healed.sig === 15, String(healed.sig));

  const teaser = await pg.evaluate(async () => {
    openWardrobe(); await new Promise(r => setTimeout(r, 600));
    return document.querySelectorAll('#wdrTeaserBody .wdr-tt-card').length;
  });
  ok('B: the teaser strip fills from the healed markup', teaser === 4, String(teaser));
  ok('B: zero JS errors on the trimmed route', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// --- ⚠️ THE RACE: tapping through BEFORE self-heal lands
// This is the bug this suite exists to keep fixed. With the card decoration
// and the "New" stamp living in openTrending() instead of show(), a woman who
// landed on an article from a search result and tapped through on a slow
// connection got the page with all fifteen cards and ZERO "See ideas" links,
// because show() returns early on a trimmed route and replays after the fetch.
// Measured at the time: 15 cards, 0 links, no stamp.
{
  const slow = http.createServer(async (req, res) => {
    const p = req.url.split('?')[0];
    if (p === '/index.html') {                 // the self-heal source, made slow
      await new Promise(r => setTimeout(r, 3000));
      res.writeHead(200, { 'content-type': 'text/html' }); return res.end(RAW);
    }
    const ext = p.slice(p.lastIndexOf('.'));
    if (TYPES[ext] && fs.existsSync(ROOT + p)) {
      res.writeHead(200, { 'content-type': TYPES[ext] }); return res.end(fs.readFileSync(ROOT + p));
    }
    try { res.writeHead(200, { 'content-type': 'text/html' });
          res.end(await edge(p === '/' ? '/' : p.replace(/\/+$/, ''))); }
    catch (e) { res.writeHead(404); res.end('no'); }
  });
  await new Promise(r => slow.listen(8990, r));
  const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await c.route('**/*', r => (new URL(r.request().url()).host === 'localhost:8990') ? r.continue() : r.abort());
  const pg = await c.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto('http://localhost:8990/journal/how-to-dress-for-fall-in-florida',
                { waitUntil: 'domcontentloaded' });
  await pg.evaluate(() => { try { localStorage.removeItem('ss_trending_seen'); } catch (e) {} openTrending(); });
  await pg.waitForTimeout(5000);
  const r = await pg.evaluate(() => ({
    act: (document.querySelector('.scr.act') || {}).id,
    cards: document.querySelectorAll('#s-trending .wdr-tcard').length,
    links: document.querySelectorAll('#s-trending .wdr-tcard .tlf').length,
    stamped: localStorage.getItem('ss_trending_seen'),
  }));
  ok('B: tapping through before the heal still lands on Trending', r.act === 's-trending', String(r.act));
  ok('B: ...with all 15 cards', r.cards === 15, String(r.cards));
  ok('B: ...AND all 15 decorated (the replay hydrates them)', r.links === 15, String(r.links));
  ok('B: ...AND the New pill stands down', r.stamped === '15', String(r.stamped));
  ok('B: the hydration lives in show(), not in openTrending',
     /if\(id==='s-trending'\)\{try\{_decorateTrendCards\(\);/.test(RAW));
  ok('B: zero JS errors racing the heal', errs.length === 0, errs.join(' | '));
  await c.close(); slow.close();
}

// --- narrow widths
for (const w of [360, 320]) {
  const { ctx, pg, errs } = await page(w);
  await pg.goto('http://localhost:8994/trending', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(700);
  const m = await pg.evaluate(() => {
    const over = [...document.querySelectorAll('#s-trending *')].filter(e => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && (r.right > document.documentElement.clientWidth + 1 || r.left < -1);
    }).map(e => e.className).slice(0, 4);
    return { over, scroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
             cards: document.querySelectorAll('#s-trending .wdr-tcard').length };
  });
  ok('B: nothing overflows its screen at ' + w, m.over.length === 0, JSON.stringify(m.over));
  ok('B: no sideways page scroll at ' + w, m.scroll <= 0, String(m.scroll));
  ok('B: all 15 cards still render at ' + w, m.cards === 15);
  ok('B: zero JS errors at ' + w, errs.length === 0, errs.join(' | '));
  await ctx.close();
}

await browser.close();
srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
};
run().catch(e => { console.error(e); process.exit(1); });
