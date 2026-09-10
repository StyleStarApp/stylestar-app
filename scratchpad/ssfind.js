// ssfind.js — the finder wired into SHOP YOUR STYLE (2026-09-09).
//
// ▶▶ HER TWO RULINGS, PUT TO HER BEFORE A LINE WAS WRITTEN, and this suite is
//   what holds them:
//   (a) "Real products lead, the six stay below."  — the finder's row goes FIRST
//       and Catherine's six named picks stay underneath as styling. Not a
//       replacement: she kept the stylist's voice on the screen.
//   (b) "Yes — one search from her profile too."   — the DEFAULT view searches
//       as well, not only the typed ask. She was told the cost plainly first
//       (~2.5¢ on every open, including refreshes) and chose it anyway.
//
// 🚨 IT SERVES THE REAL FILES OFF DISK, styles.css INCLUDED, and a guard check
//   proves the sheet is applied before any measurement is believed. That is the
//   2026-09-09 lesson from `copy`: a check that passes because it can see
//   nothing is worse than no check.
//
// Run: node scratchpad/ssfind.js
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = 8981;
let pass = 0, failn = 0;
const ok = (n, c, x) => c ? (pass++, console.log('  ok   ' + n))
                          : (failn++, console.log('  FAIL ' + n + (x ? ' — ' + x : '')));

const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html' : p.endsWith('.css') ? 'text/css' : 'application/octet-stream' });
  r.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(PORT, r));
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

/* ═══ 1 · THE PROMPT, AND ABOVE ALL ITS SCOPING ════════════════════════════ */
console.log('\n1. the ask for one search rides on the call we already make');
ok('_findAskRule exists', /function _findAskRule/.test(HTML));
const rule = (HTML.match(/function _findAskRule\(\)\{[\s\S]*?\n\}/) || [''])[0];
ok('the rule was actually found (or everything below proves nothing)', rule.length > 200, String(rule.length));
/* ⚠️ RUNTIME OUTPUT, never the source text — the rule is built by concatenation
   so its sentences are not contiguous in the file. `honest.js` learned this the
   hard way: a source-matching assertion fails on perfectly correct code. */
const runRule = ask => new Function('_ssAsk', rule + '\nreturn _findAskRule();')(ask);
const withAsk = runRule('white linen dress'), noAsk = runRule('');
ok('with an ask, it quotes HER sentence back as the only source of words',
   withAsk.includes('white linen dress'), withAsk.slice(0, 120));
/* 🚨 THE GUARANTEE. The model may READ; it may never ADD a requirement. This is
   the prompt half — `_findKeepHerWords` is the code half, checked in part 4. */
/* 🚨🚨 REWRITTEN 2026-09-10, NOT BUMPED, AND IT NOW ASSERTS THE OPPOSITE — HER
   RULING: "the stylist should not say I am going to show you lots of options of
   belted dresses and then show me random dresses with no belts... I want the
   stylist to deliver exactly what she is promising."
   ▶▶ THIS CHECK USED TO PIN THE FAULT IN PLACE. It required the prompt to say
     "leave all three EMPTY" whenever she had typed nothing — so the pick the
     stylist announced in her lead could never reach the search, and the wall came
     back full of any dress at all. The old worked example a few sections down is
     the contradiction in miniature: a lead reading "A linen midi felt most you,
     so that is where I looked" sitting above find:{cut:''}.
   ▶ THE RULE IT NAMES NOW: on a full hand-over the fields ARE the search, and
     the sentence must describe them. The her-words guard is untouched and is
     asserted separately, below, on the half it was written for. */
ok('with NO ask, the stylist\'s own pick IS the search, and she is told so',
   /THESE FIELDS ARE THE SEARCH/.test(noAsk) &&
   !/leave all three EMPTY/i.test(noAsk), noAsk.slice(0, 200));
ok('...and the sentence she writes must be the same pick as the fields',
   /THE SENTENCE AND THE FIELDS MUST BE THE SAME PICK/.test(noAsk));
ok('...while a woman who TYPED something still gets the her-words rule only',
   /ONLY with words she actually used/.test(withAsk) &&
   !/THESE FIELDS ARE THE SEARCH/.test(withAsk));
/* ⚠️ REWRITTEN 2026-09-10. "Either way it says empty is safer than a guess" was
   true when both halves were the same rule, and it stopped being true when they
   were deliberately split: on a full hand-over an empty `cut` is NOT the safe
   option, it is the fault she photographed. The two halves now say different
   things on purpose, and this names which. */
ok('when SHE typed, empty is still safer than a guess',
   /Leave a field empty rather than guessing/.test(withAsk));
ok('and on a hand-over, colour and fabric are still only for when they are the point',
   /only if they are genuinely the point/.test(noAsk), noAsk.slice(0, 300));
/* ▶ HER DELEGATION RULING, 2026-09-08: when a woman hands over the choice, the
   stylist's pick becomes a real search requirement AND the stylist must name it
   out loud, "so it stays hers to overrule". */
ok('with NO ask, the stylist must SAY the pick was hers',
   /findlead/.test(noAsk) && /overrule/i.test(noAsk), noAsk.slice(-200));
ok('...and with an ask there is no such line, because nothing was chosen for her',
   !/findlead/.test(withAsk));
/* 🚨 SCOPING, the same shape as honest.js: the cheapest way to "improve" this
   would be to spread it to the four browsing prompts, which would spend a
   search on surfaces she never ruled on. */
ok('SCOPING: _findAskRule is wired into exactly ONE prompt',
   (HTML.match(/\+_findAskRule\(\)/g) || []).length === 1,
   String((HTML.match(/\+_findAskRule\(\)/g) || []).length));
ok('and that prompt\'s JSON schema actually carries the find field',
   /"findlead":"","find":\{"item":""/.test(HTML));

/* ═══ 2 · ONE BUILDER AND ONE ROUTE, NEVER A SECOND COPY ═══════════════════ */
console.log('\n2. it shares the chat\'s machinery instead of copying it');
/* 🚨 THIS FILE'S OLDEST LESSON: a rule applied to one half is not applied. The
   marker leak and the two-row regression were both second copies. */
/* ⚠️ REWRITTEN 2026-09-10, NOT BUMPED. These two were PROXIMITY regexes — "find
   _findBlockHtml within 1600 characters of _ssFindRun" — and they went red the
   moment the painting moved into its own _ssFindPaint helper, even though that
   move makes the thing they protect HARDER to break: there is now exactly one
   painter instead of one call site that a second route could quietly bypass.
   ▶▶ A test that fails because the app got SAFER is measuring the mechanism, not
     the rule. It also could never have caught what it was written for: a second
     copy of the card loop somewhere ELSE in the file sits far outside 1600
     characters and would have passed happily. These name the rule instead. */
const fnBody = (name) => {
  const i = HTML.indexOf('function ' + name + '(');
  if (i < 0) return '';
  const j = HTML.indexOf('\nfunction ', i + 8), k = HTML.indexOf('\nasync function ', i + 8);
  const end = Math.min(j < 0 ? HTML.length : j, k < 0 ? HTML.length : k);
  return HTML.slice(i, end);
};
ok('Shop your Style renders through the SAME _findBlockHtml as the chat',
   /_findBlockHtml\(/.test(fnBody('_ssFindPaint')) &&
   (HTML.match(/function _findBlockHtml\(/g) || []).length === 1,
   'painter=' + /_findBlockHtml\(/.test(fnBody('_ssFindPaint')));
ok('and reaches the network through the SAME _findFetch',
   /_findFetch\(/.test(fnBody('_ssFindRun')) &&
   (HTML.match(/function _findFetch\(/g) || []).length === 1);
ok('...and Shop your Style paints its row in exactly ONE place',
   (HTML.match(/_ssFindPaint\(/g) || []).length === 3,
   String((HTML.match(/_ssFindPaint\(/g) || []).length));
ok('there is exactly ONE fetch of product-find in the whole app',
   (HTML.match(/functions\/product-find/g) || []).length === 1,
   String((HTML.match(/functions\/product-find/g) || []).length));
/* ⚠️ A FAILURE IS NEVER CACHED. Caching why:'search-failed' would freeze the
   honest "my search didn't come back" sentence for the rest of the sitting. */
ok('the cache stores only a real answer, never a failure',
   /if\(useCache&&data&&!data\.why\)\{[\s\S]{0,220}_FIND_CACHE\.set/.test(HTML));
/* 🚨🚨 THE CACHE IS OPT-IN AND BELONGS TO THIS SCREEN ALONE. It was global for
   one round and `chatfind` went 63 -> 59 immediately: a second chat answer
   silently re-rendered the FIRST answer's products, so its ticks and its
   unconfirmed labels described the wrong piece. ▶ The chat searches once per
   question and a woman asking again wants a fresh look, not a replay. */
ok('and the chat does NOT share it — it asks for fresh stock every time',
   /_findFetch\(req\);/.test(HTML) && /_findFetch\(req,true\);/.test(HTML),
   'chat=' + /_findFetch\(req\);/.test(HTML) + ' shopstyle=' + /_findFetch\(req,true\);/.test(HTML));

/* ═══ 3 · ON THE REAL SCREEN ══════════════════════════════════════════════ */
console.log('\n3. on the real screen');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errs = [];
/* ▶ The REAL query builder the server uses, imported rather than re-described,
   so "the shops see the word belted" is measured against what actually goes out
   and cannot drift from it. */
const { buildQueries } = await import('../netlify/functions/lib/find-products.js');
let REPLY = {}, FIND = null, FINDCALLS = [], FINDSTATUS = 200, DELAY = 0;

const product = (i, extra) => Object.assign({
  id: 'p' + i, title: 'Reformation Linen Midi Dress ' + i, brand: 'Reformation',
  store: 'Nordstrom', price: '$248', url: 'https://www.nordstrom.com/s/' + i,
  image: 'https://example.com/' + i + '.jpg' }, extra || {});
const findPayload = () => ({
  exact: [product(1, { checks: { colour: 'confirmed' }, unconfirmed: [] })],
  doors: [],
  browse: [product(2), product(3), product(4)],
});

async function fresh() {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push(e.message));
  await pg.route(u => u.pathname.includes('style-ai'),
    r => r.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ content: [{ text: JSON.stringify(REPLY) }] }) }));
  await pg.route(u => u.pathname.includes('product-find'), async r => {
    FINDCALLS.push(JSON.parse(r.request().postData() || '{}'));
    if (DELAY) await new Promise(z => setTimeout(z, DELAY));
    r.fulfill({ status: FINDSTATUS, contentType: 'application/json',
      body: JSON.stringify(FIND === null ? findPayload() : FIND) });
  });
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2300);
  await pg.evaluate(() => {
    const base = { sizes: {}, colorsLove: [], neverWear: [], neverPatterns: [],
                   neverOther: '', jewelry: '', dailyShoes: '', bagStyle: '', otherNotes: '' };
    localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath',
      answers: new Array(12).fill(6), topArchNames: ['The Timeless Classic'],
      portrait: 'p', motto: 'm', prefs: base }));
  });
  await pg.reload(); await pg.waitForTimeout(2300);
  await pg.evaluate(() => { const c = document.querySelector('.hm-entrance'); if (c) c.remove(); });
  return { ctx, pg };
}
/* 🚨🚨 A HARNESS TRAP THIS SUITE WALKED STRAIGHT INTO, AND IT IS WORTH KEEPING.
   Setting `window._ssAsk` and then calling `_openShopStyleNow` measures NOTHING:
   `_openShopStyleNow` calls `_syncShopAsk()`, whose FIRST line is `_ssAsk=''`.
   The ask is wiped before the prompt is ever built, so every "she said white
   linen" assertion silently tested the no-ask path instead — and passed, which
   is the dangerous half.
   ▶ SO: drive the REAL control. Open the screen, then put her words in the REAL
   box and call the REAL `ssAskGo()`, which is the only path a woman has.
   ⚠️ `ssAskGo` refuses while the screen is `.thinking` ("one generate at a
   time"), so the first render has to finish before the ask is typed. */
/* 🚨🚨 WAITING FOR A NEW RENDER IS THE WHOLE HARNESS PROBLEM HERE, AND TWO
   OBVIOUS WAYS BOTH FAIL:
     • waiting on `.shop-grid` returns INSTANTLY — the grid from the previous
       render is still on screen, so every assertion reads the last answer. It
       passes, which is the dangerous half.
     • waiting on the screen going `.thinking` RACES the stub — the class is
       added and removed inside one synchronous stretch when the fake style-ai
       answers instantly, so the poll never sees it and times out on correct code.
   ▶ SO: TAG the grid that is on screen now, then wait for one that is not
     tagged. Deterministic, and it cannot be satisfied by the old render. */
const stamp = pg => pg.evaluate(() => {
  const g = document.querySelector('#shopStyleContent .shop-grid');
  if (g) g.dataset.old = '1';
});
const fresh_grid = pg => pg.waitForFunction(() => {
  const s = document.getElementById('s-shopstyle');
  const g = document.querySelector('#shopStyleContent .shop-grid');
  return !!(s && !s.classList.contains('thinking') && g && !g.dataset.old);
}, { timeout: 25000 });
/* ⚠️ EACH SCENARIO STARTS WITH A COLD CACHE, or it measures the previous one.
   Stripping a colour she never said makes two different model answers collapse
   to the SAME request — which is correct, and which means the second one is a
   cache HIT that fires no call at all. A check reading an empty call log would
   then pass by seeing nothing, the exact false green this project keeps paying
   for. Section 6 is the one place the cache is deliberately left warm. */
async function ask(pg, text, keepCache, keepLog) {
  /* 🚨 BOTH LAYERS, OR EVERY CHECK BELOW GOES BLIND — 2026-09-10. Searches are
     now remembered in localStorage as well as in memory, and clearing only the
     memory left the durable copy answering every "fresh" search instantly. The
     first thing it broke was the check that measures what she sees DURING a
     wait, because there was no longer a wait to measure. ▶ A RESET THAT RESETS
     HALF THE STATE IS HOW A SUITE QUIETLY STOPS TESTING WHAT IT SAYS IT DOES. */
  if (!keepCache) await pg.evaluate(() => {
    try { _FIND_CACHE.clear() } catch (e) {}
    try { localStorage.removeItem('ss_find_v1') } catch (e) {}
  });
  FINDCALLS.length = 0;
  await stamp(pg);
  await pg.evaluate(() => { _openShopStyleNow('quiz'); });
  await fresh_grid(pg);
  if (!text) return;
  if (!keepLog) FINDCALLS.length = 0;
  await stamp(pg);
  /* ▶ The REAL control: her words in the real box, through the real ssAskGo. */
  await pg.evaluate(t => { document.getElementById('ssAskIn').value = t; ssAskGo(); }, text);
  await fresh_grid(pg);
}
const six = n => Array.from({ length: 6 }, (_, i) =>
  ({ category: 'dress', name: 'Linen Midi ' + i, search: 'linen midi dress', store: 'Nordstrom' }));

REPLY = { items: six(), find: { item: 'dress', colour: 'white', fabric: 'linen', cut: '' } };
let { ctx, pg } = await fresh();
/* ⚠️ THE STUB IS SLOWED DELIBERATELY. A real search takes 5-8s; an instant one
   would replace the placeholder before it could be measured, and the whole point
   of the two checks below is what she sees DURING the wait. */
DELAY = 1200;
await ask(pg, 'white linen dress');

/* ▶ THE GUARD, before any measurement is believed. */
const dressed = await pg.evaluate(() => {
  const w = document.querySelector('.ss-find-wait');
  return w ? parseFloat(getComputedStyle(w).height) : -1;
});
ok('styles.css is actually applied (else every number below is a default)',
   dressed !== 0 && dressed !== -1, 'wait height=' + dressed);
/* 🚨🚨 HER CATCH, 2026-09-09: "The spinning star is way too small. Needs to be
   bigger and indicate more that shopping/searching is happening since it takes a
   while." ▶ THESE PIN THE THREE THINGS SHE ASKED FOR — big, turning, and SAYING
   what is happening — and they pin them as RULES, not as the exact numbers, so
   tuning the size stays free while losing the signal does not. */
const waiting = await pg.evaluate(() => {
  const w = document.querySelector('.ss-find-wait');
  const st = w && w.querySelector('.ss-find-star');
  const t = w && w.querySelector('.ss-find-wait-t');
  if (!st) return { star: 0 };
  const cs = getComputedStyle(st), pa = getComputedStyle(st.querySelector('path'));
  return { star: st.getBoundingClientRect().width, anim: cs.animationName,
           dir: cs.animationDirection, fill: pa.fill, stroke: pa.stroke,
           words: t ? (t.textContent || '').trim() : '' };
});
console.log('     [measured] waiting star: ' + waiting.star.toFixed(0) + 'px, "' + waiting.words + '"');
ok('the waiting star is BIG, not the speck she photographed',
   waiting.star >= 44, 'star=' + waiting.star.toFixed(1) + 'px');
/* 🚨🚨 GOLD, NOT PINK — HER RULING, 2026-09-09: "66px but I want the gold one not
   pink. Pink only for the chat." ▶ It answers a question the pink chat star
   shipped with, and it is her own 2026-08-09 mark system holding: gold = hers,
   pink = when Catherine herself is speaking. ⚠️ A future session "unifying" this
   star with the chat's would repaint it pink; this is what stops that. */
ok('...and it is GOLD, never the chat\'s pink',
   /rgb\(230, 194, 78\)/.test(waiting.fill) && !/rgb\(236, 72, 153\)/.test(waiting.fill),
   JSON.stringify(waiting));
/* ⚠️ SAME MOTION AS EVERY OTHER WAIT IN THE APP. The colour is allowed to differ
   per surface; the turning never is. `chatfind` holds the same rule across all
   five stars by selector membership. */
ok('...and it turns the app\'s one spin, reversed, like every other wait',
   waiting.anim === 'spin' && waiting.dir === 'reverse', JSON.stringify(waiting));
/* ▶ "indicate more that shopping/searching is happening" — the words are the
   half that does that, and they are HERS, from the one _FIND_STEPS list. */
ok('...and it SAYS what is happening, in her words',
   /looking through all the shops/i.test(waiting.words), waiting.words);
/* 🚨 HER BRAND RULE, 2026-09-09: "I don't want it to ever say your stores." It is
   obeyed here for free because the words come from the ONE list — asserted so a
   future second copy on this surface cannot reintroduce it. */
ok('...and never says "your shops"', !/your (shops|stores)/i.test(waiting.words), waiting.words);
/* 🚨🚨 HER RULE IS NARROW, AND THIS CHECK EXISTS BECAUSE CLAUDE WIDENED IT.
   ▶▶ WHAT SHE SAID FIRST: "I don't want the pink star on shop your style. That is
     only for stylist chat. I want the gold one." That READS screen-wide, and the
     whole screen was swept gold.
   ▶▶ WHAT SHE MEANT, IN HER OWN CORRECTION: "I didn't want you to change those
     other stars. Just the one I said — the large spinning one I want gold those
     others can stay pink please."
   🚨 SO THE RULE HAS TWO HALVES AND BOTH ARE ASSERTED. The big spinning WAITING
     star is gold; the small stylist MARKS — the one beside "Looking for something
     specific?" and the one beside "shopping your style..." — STAY PINK, because
     pink means the stylist is working and that is her own mark system.
   ⚠️ A CHECK THAT ONLY PINNED "no pink here" WOULD HAVE BLESSED CLAUDE'S MISTAKE.
     That is the point of the second half. */
{const ask = await pg.evaluate(() => {
   const sv = document.querySelector('#s-shopstyle .sa-star');
   const sh = sv && sv.querySelector('polygon,path');
   return sh ? getComputedStyle(sh).fill : '(missing)';
 });
 ok('the "Looking for something specific?" mark STAYS PINK — she put it back herself',
    ask === 'rgb(236, 72, 153)', ask);
 /* ⚠️ THE LOADING STAR IS READ FROM THE SOURCE, NOT THE SCREEN, AND THAT IS NOT
    LAZINESS: `_shopStyleGen` writes it into `.ss-shop-logo` when the generate
    STARTS and replaces it with plain text when the generate ENDS, so by the time
    a settled screen can be measured the element no longer exists. The colour is a
    hardcoded literal in that one line, so the source IS the fact. */
 {const line = (HTML.match(/shop-load-star[\s\S]{0,420}?<\/svg>/) || [''])[0];
  ok('the loading star was actually found (or the check below proves nothing)',
     line.length > 100, String(line.length));
  ok('...and it STAYS PINK too', /fill="#EC4899"/.test(line), line.slice(-120));}}

/* 🚨🚨 HER RULE: NOTHING MAY JUMP. The six paint in ~1s, the search takes 5-8s,
   so the row's space must be reserved from the first paint or the whole page
   lurches downward under a woman already reading it. */
const before = await pg.evaluate(() =>
  document.querySelector('#shopStyleContent .shop-grid').getBoundingClientRect().top);
await pg.waitForSelector('#ssFindWrap .find-card', { timeout: 20000 });
const after = await pg.evaluate(() =>
  document.querySelector('#shopStyleContent .shop-grid').getBoundingClientRect().top);
const real = await pg.evaluate(() => {
  const w = document.getElementById('ssFindWrap');
  const r = w.getBoundingClientRect();
  const cs = getComputedStyle(w);
  return { block: r.height, mb: parseFloat(cs.marginBottom),
           head: (w.querySelector('.find-head') || { getBoundingClientRect: () => ({ height: 0 }) }).getBoundingClientRect().height,
           hint: (w.querySelector('.find-hint') || { getBoundingClientRect: () => ({ height: 0 }) }).getBoundingClientRect().height,
           row: (w.querySelector('.find-cards') || { getBoundingClientRect: () => ({ height: 0 }) }).getBoundingClientRect().height };
});
console.log('     [measured] filled row: block=' + real.block.toFixed(1) +
            ' head=' + real.head.toFixed(1) + ' hint=' + real.hint.toFixed(1) +
            ' cards=' + real.row.toFixed(1));
ok('NOTHING JUMPS: the six do not move when the products land',
   Math.abs(after - before) <= 24, 'before=' + before.toFixed(1) + ' after=' + after.toFixed(1));
DELAY = 0;

const v = await pg.evaluate(() => {
  const w = document.getElementById('ssFindWrap');
  const g = document.querySelector('#shopStyleContent .shop-grid');
  return {
    cards: w ? w.querySelectorAll('.find-card').length : 0,
    hearts: w ? w.querySelectorAll('.find-card .wl-save').length : 0,
    ticks: w ? w.querySelectorAll('.fc-yes').length : 0,
    six: document.querySelectorAll('#shopStyleContent .shop-card').length,
    leads: !!(w && g && (w.compareDocumentPosition(g) & Node.DOCUMENT_POSITION_FOLLOWING)),
    lead: w && w.querySelector('.ss-find-lead') ? w.querySelector('.ss-find-lead').textContent : null,
    discs: [...document.querySelectorAll('#s-shopstyle .shop-disclosure,#shopStyleContent .find-disc,#shopStyleContent .shopdisc')]
             .filter(e => /commission/i.test(e.textContent || '')).length,
  };
});
ok('HER RULING (a): the real products LEAD', v.leads, JSON.stringify(v));
ok('...and Catherine\'s six are still there below', v.six === 6, String(v.six));
ok('the row holds real product cards', v.cards === 4, 'cards=' + v.cards);
ok('every one of them carries the save heart, from the shared builder',
   v.hearts === v.cards, 'hearts=' + v.hearts + ' of ' + v.cards);
ok('the checked one still wears its tick, and only it', v.ticks === 1, 'ticks=' + v.ticks);
/* 🚨 ONE DISCLOSURE PER SCREEN. This file's audit records Wardrobe once showing
   FIVE on one page. The row deliberately adds none: the screen already has its
   own, and _findBlockHtml's DISC is empty since her 2026-09-09 ask. */
ok('exactly ONE affiliate disclosure on the screen, never two', v.discs === 1, 'discs=' + v.discs);
ok('no line names a choice, because SHE chose', v.lead === null, String(v.lead));

/* ═══ 4 · HER WORDS ARE STILL THE AUTHORITY ═══════════════════════════════ */
console.log('\n4. the model may READ, it may never ADD a requirement');
/* 🚨 The rule that exists because the model once recommended a jewel tone and
   then searched for one as though she had asked. It is enforced in CODE, before
   anything can reach an outbound search — not by asking the prompt nicely. */
ok('a colour she DID say survives into the search',
   FINDCALLS.length === 1 && FINDCALLS[0].colour === 'white', JSON.stringify(FINDCALLS[0]));
ok('and a fabric she DID say survives too',
   FINDCALLS[0].fabric === 'linen', JSON.stringify(FINDCALLS[0]));

REPLY = { items: six(), find: { item: 'dress', colour: 'emerald', fabric: '', cut: 'fitted' } };
await ask(pg, 'a dress for a wedding', false, true);
await pg.waitForTimeout(1200);
/* 🚨🚨 IT READS THE LAST CALL, NOT THE FIRST — AND THAT MATTERS AS OF 2026-09-10.
   `ask(..., keepLog)` keeps BOTH searches: the default open (a full hand-over,
   where the stylist's own emerald and fitted are now HERS TO CHOOSE and rightly
   survive) and then the one her typed sentence produced. This block is about the
   TYPED one.
   ▶▶ IT USED TO ASSERT `FINDCALLS.length === 1` AND READ `[0]`, AND IT PASSED
     ONLY BECAUSE BOTH CALLS WERE STRIPPED IDENTICALLY. The two halves were the
     same rule, so it could not tell which call it was measuring — and the moment
     they legitimately differed it failed, pointing at the delegated call while
     naming the typed one. A check that cannot say WHICH thing it measured is one
     legitimate change away from a false report, in either direction. */
const typed = FINDCALLS[FINDCALLS.length - 1];
ok('a colour she NEVER said is deleted before the search goes out',
   FINDCALLS.length === 2 && !typed.colour, JSON.stringify(FINDCALLS));
ok('and so is a cut she never said', !typed.cut, JSON.stringify(typed));
ok('...but the garment she DID ask for is kept',
   typed.item === 'dress', JSON.stringify(typed));
/* 🚨 THE PAIR THAT PROVES THE SPLIT IS A SPLIT AND NOT A LOOSENING: the SAME
   model answer, on the SAME page, seconds apart — kept when she handed the
   choice over, deleted the moment she used her own words. */
ok('...and the SAME invented cut DID survive on the hand-over just before it',
   FINDCALLS[0].cut === 'fitted' && FINDCALLS[0].colour === 'emerald',
   JSON.stringify(FINDCALLS[0]));

/* ═══ 5 · THE DEFAULT VIEW SEARCHES TOO — HER RULING (b) ══════════════════ */
console.log('\n5. the default "show me a mix" searches too, and says whose choice it was');
/* 🚨🚨 HER OWN CASE, 2026-09-10, REBUILT FROM HER SCREENSHOT. The lead said "I
   chose a belted dress", her six styling picks included a Printed Belted Midi
   Dress, and NOT ONE photographed product was belted.
   ▶▶ THE FIXTURE USED TO BE find:{cut:''} UNDER A LEAD PROMISING "a linen midi",
     which is the contradiction she found, written into the suite as though it
     were correct. It asserted that a search went out and that a sentence
     appeared, and NEVER that they agreed — so it passed all the way through the
     fault. This is the same shape as the resume's false green: a check can name
     a behaviour and still measure nothing about it. */
REPLY = { items: six(), findlead: 'I chose a belted dress, you told me you love them.',
          find: { item: 'dress', colour: '', fabric: '', cut: 'belted' } };
await ask(pg, '');
await pg.waitForSelector('#ssFindWrap .find-card', { timeout: 20000 });
const d = await pg.evaluate(() => {
  const w = document.getElementById('ssFindWrap');
  return { lead: w.querySelector('.ss-find-lead') ? w.querySelector('.ss-find-lead').textContent : null,
           cards: w.querySelectorAll('.find-card').length };
});
ok('HER RULING (b): it searched even with nothing typed', FINDCALLS.length === 1, String(FINDCALLS.length));
ok('...and real products came back', d.cards === 4, String(d.cards));
/* ▶ HER DELEGATION RULING: name the pick out loud so it stays hers to overrule. */
ok('the stylist SAYS the choice was hers', /belted dress/i.test(d.lead || ''), String(d.lead));
/* 🚨 THE CHECK HER SCREENSHOT ASKED FOR: the promise and the search are ONE. */
ok('HER RULING: the pick she was PROMISED is the pick that gets searched',
   FINDCALLS[0].cut === 'belted', JSON.stringify(FINDCALLS[0]));
/* 🚨🚨 THE PROMISE ARRIVES WITH THE GOODS — HER DECISION, 2026-09-10. Measured
   DURING the wait, with the stub deliberately slowed, because "before the cards"
   is the only moment this can be got wrong. ⚠️ THIS IS THE CHECK THAT COULD MOST
   EASILY BE VACUOUS: if the search finished before it looked, an absent promise
   would prove nothing. So it asserts the star is STILL TURNING at the same
   instant — the wait is real and the promise is genuinely not there yet. */
DELAY = 2500;
REPLY = { items: six(), findlead: 'I chose a belted dress, you told me you love them.',
          find: { item: 'dress', colour: '', fabric: '', cut: 'belted' } };
await ask(pg, '');
await pg.waitForSelector('#ssFindWrap .ss-find-wait', { timeout: 20000 });
const during = await pg.evaluate(() => ({
  waiting: !!document.querySelector('#ssFindWrap .ss-find-wait'),
  promise: !!document.querySelector('#ssFindWrap .ss-find-lead'),
  txt: (document.getElementById('ssFindWrap') || {}).innerText || '' }));
ok('DURING the wait she is told work is happening, and promised NOTHING',
   during.waiting && !during.promise && !/belted/i.test(during.txt),
   JSON.stringify(during));
await pg.waitForSelector('#ssFindWrap .find-card', { timeout: 20000 });
const afterw = await pg.evaluate(() => ({
  promise: !!document.querySelector('#ssFindWrap .ss-find-lead'),
  txt: (document.getElementById('ssFindWrap') || {}).innerText || '' }));
ok('...and the promise appears in the same breath as the cards that keep it',
   afterw.promise && /belted dress/i.test(afterw.txt), JSON.stringify(afterw).slice(0, 140));
DELAY = 0;
ok('...and the words the shops actually see carry it on EVERY query',
   buildQueries(FINDCALLS[0]).length > 0 &&
   buildQueries(FINDCALLS[0]).every(q => /belted/.test(q)),
   JSON.stringify(buildQueries(FINDCALLS[0])));
/* ⚠️ THE OTHER HALF, AND IT IS WHAT KEEPS THE GUARD HONEST: a stylist pick is
   searchable ONLY on a full hand-over. The moment she types, her sentence is the
   authority again and an invented cut still dies in code (section 4 above). */

/* ═══ 6 · THE CACHE — HER RULING (b) IS WHY IT EXISTS ═════════════════════ */
console.log('\n6. the same question twice costs one search, not two');
/* ⚠️ `true` = leave the cache WARM. This is the ONE section that must, because
   the thing under test is the cache itself; everywhere else a cold start is
   what keeps the measurement honest. */
await ask(pg, '', true);
await pg.waitForTimeout(1500);
ok('a second identical open spends NO new search', FINDCALLS.length === 0, String(FINDCALLS.length));
REPLY = { items: six(), find: { item: 'top', colour: '', fabric: '', cut: '' } };
await ask(pg, '', true);
await pg.waitForTimeout(1500);
ok('...but a DIFFERENT question really does search again', FINDCALLS.length === 1, String(FINDCALLS.length));

/* ═══ 7 · WHEN IT CANNOT DELIVER, IT CLAIMS NOTHING ═══════════════════════ */
console.log('\n7. a search that fails never reads as "I looked and found nothing"');
/* 🚨🚨 REWRITTEN 2026-09-10 AFTER SHE HIT IT LIVE: "The star started spinning
   promising to find me belted dresses then nothing came up. Just this
   screenshot. No photos."
   ▶▶ THE OLD CHECK REQUIRED THE SILENCE. It asserted the row must VANISH when a
     search died — right in September, when nothing had been promised, and wrong
     the moment the stylist began announcing her pick BEFORE the search returned.
     She read a promise, watched the star turn, and the promise deleted itself.
   ▶ SO THE TWO OUTCOMES ARE NOW SEPARATE, and only one of them is silent:
     a search that DIED says so; a search that RAN AND FOUND NOTHING stays quiet
     because her six picks are good advice on their own. The second half is
     asserted immediately below and is UNCHANGED. */
REPLY = { items: six(), find: { item: 'skirt', colour: '', fabric: '', cut: '' } };
FINDSTATUS = 500; await ask(pg, 'a skirt');
await pg.waitForTimeout(1800);
let f = await pg.evaluate(() => ({ wrap: !!document.getElementById('ssFindWrap'),
  six: document.querySelectorAll('#shopStyleContent .shop-card').length,
  txt: (document.getElementById('shopStyleContent') || {}).innerText || '' }));
ok('a dead search SAYS SO instead of vanishing',
   /didn.t come back just then/i.test(f.txt), f.txt.slice(0, 160));
ok('...and her six styling picks are untouched', f.six === 6, String(f.six));
ok('...and nothing on screen claims her shops had nothing',
   !/nothing close enough/i.test(f.txt) && !/couldn.t find exactly/i.test(f.txt));
/* 🚨 THE HALF THAT MATTERS MOST: A DEAD SEARCH IS NEVER STORED. Caching it would
   freeze the apology in place for six hours and a resume would never look again. */
const deadStore = await pg.evaluate(() => JSON.parse(localStorage.getItem('ss_shoppicks') || '{}'));
ok('...and a dead search is never stored for the resume to replay', !deadStore.d,
   JSON.stringify(deadStore.d || null).slice(0, 80));
FINDSTATUS = 200;

/* ▶ HER OWN CASE, END TO END: the stylist promises, the search dies, and the
   PROMISE IS STILL ON SCREEN above the honest sentence — so she can see what was
   looked for and that it was not her fault. */
REPLY = { items: six(), findlead: 'I chose a belted dress, you told me you love them.',
          find: { item: 'dress', colour: '', fabric: '', cut: 'belted' } };
FINDSTATUS = 200; FIND = { exact: [], doors: [], browse: [], why: 'search-failed' };
await ask(pg, '');
await pg.waitForTimeout(1800);
f = await pg.evaluate(() => ({
  txt: (document.getElementById('shopStyleContent') || {}).innerText || '',
  lead: !!document.querySelector('#ssFindWrap .ss-find-lead') }));
ok('HER CASE: a promise that could not be kept is answered, not deleted',
   /didn.t come back just then/i.test(f.txt), f.txt.slice(0, 160));
/* 🚨🚨 REWRITTEN THE SAME DAY IT WAS WRITTEN, AND THE REASON IS THE POINT.
   This check used to require the stylist's promise to stay on screen BESIDE the
   apology — the best that could be done while the promise was spoken during the
   wait. Her decision an hour later was better and removed the need for it: THE
   PROMISE IS NOW HELD UNTIL THERE ARE CARDS TO KEEP IT WITH.
   ▶▶ So a woman whose search died was never told what was coming, and there is
     nothing to apologise for. The fix is not a kinder apology, it is HAVING
     NOTHING TO APOLOGISE FOR. */
ok('...and she was never promised anything the search could not deliver',
   !f.lead && !/belted dress/i.test(f.txt), 'lead=' + f.lead + ' txt=' + f.txt.slice(0, 90));
FIND = null;

REPLY = { items: six(), find: { item: 'clogs', colour: '', fabric: '', cut: '' } };
FIND = { exact: [], doors: [], browse: [] };
await ask(pg, 'clogs');
await pg.waitForTimeout(1800);
f = await pg.evaluate(() => ({ wrap: !!document.getElementById('ssFindWrap'),
  six: document.querySelectorAll('#shopStyleContent .shop-card').length }));
ok('a genuinely empty search also leaves no empty row', !f.wrap);
ok('...with her six still standing', f.six === 6, String(f.six));
FIND = null;

/* ═══ 8 · THE ROW SURVIVES HER LEAVING AND COMING BACK ════════════════════ */
console.log('\n8. she taps out to a store and comes back');
/* 🚨🚨 THIS IS THE FAULT SHE REPORTED ON THE CHAT, ON A NEW SURFACE: "the
   searched photo cards disappearing when user leaves and comes back" — and the
   stylist then promised to "pull them back up" with no code that could.
   ▶ A resume re-renders the same six WITHOUT calling the model again, so unless
     the find request rides along in storage the products row silently vanishes:
     her styling picks still there, the photographs she was shopping gone.
   ⚠️ AND THE HALF THAT KEEPS IT HONEST: the stored request must NOT be stripped
     a SECOND time. `_ssAsk` is empty on a resume, so re-running the guard would
     delete the colour and fabric SHE DID SAY and quietly broaden her search. */
REPLY = { items: six(), find: { item: 'dress', colour: 'white', fabric: 'linen', cut: '' } };
await ask(pg, 'white linen dress');
await pg.waitForSelector('#ssFindWrap .find-card', { timeout: 20000 });
const stored = await pg.evaluate(() => JSON.parse(localStorage.getItem('ss_shoppicks') || '{}'));
ok('her words are stored with the picks, already checked against her sentence',
   stored.f && stored.f.item === 'dress' && stored.f.colour === 'white' && stored.f.fabric === 'linen',
   JSON.stringify(stored.f));
/* 🚨🚨 HER CATCH, 2026-09-10, AND THE CHECK BELOW USED TO BE A FALSE GREEN.
   Her words: "I got the whisper that said Shop your style is right where you
   left it with the same pieces waiting. So I clicked on it and this was not
   true. The spinning star took a long time and pieces came up."
   ▶▶ "the products are STILL THERE" PASSED ON THE BROKEN CODE, because this
     harness answered every search with the SAME four products. The app really
     was searching again on every resume — a long turning star, a real bill, and
     in life a different set of dresses — and the stub made the second search
     look exactly like the first. THE TEST COULD NOT SEE THE BUG IT NAMED.
   ▶ THE FIX IS TO MAKE THE SEARCH ANSWER DIFFERENTLY. Now a resume that
     secretly re-asks paints Cara Cara pieces instead of Reformation ones and is
     caught by name. This file's own question, asked of every new check: could
     this pass if the thing it measures were simply absent? Not any more. */
const WAS = await pg.$$eval('#ssFindWrap .find-card', els =>
  els.map(e => (e.textContent || '').trim()).join(' | '));
FIND = { exact: [], doors: [], browse: [
  product(91, { title: 'Cara Cara Poplin Maxi 91' }),
  product(92, { title: 'Cara Cara Poplin Maxi 92' })] };
REPLY = { items: [], find: null };
FINDCALLS.length = 0;
await pg.reload(); await pg.waitForTimeout(2300);
await pg.evaluate(() => { const c = document.querySelector('.hm-entrance'); if (c) c.remove(); });
await pg.evaluate(() => { try { resumeShop() } catch (e) { } });
await pg.waitForSelector('#ssFindWrap .find-card', { timeout: 20000 });
const back = await pg.evaluate(() => ({
  cards: document.querySelectorAll('#ssFindWrap .find-card').length,
  six: document.querySelectorAll('#shopStyleContent .shop-card').length,
  hearts: document.querySelectorAll('#ssFindWrap .find-card .wl-save').length,
  titles: [...document.querySelectorAll('#ssFindWrap .find-card')]
            .map(e => (e.textContent || '').trim()).join(' | '),
}));
ok('the products are STILL THERE after she comes back', back.cards === 4, 'cards=' + back.cards);
ok('...and her six styling picks came back with them', back.six === 6, String(back.six));
ok('...and the save hearts came back too', back.hearts === back.cards, String(back.hearts));
/* ⚠️ REWRITTEN 2026-09-10, NOT BUMPED. This asserted that a resume asked the
   finder with her ORIGINAL words rather than a broadened search — a real rule,
   guarding against the stored request being stripped a second time against an
   empty _ssAsk. ▶ It is now guarded by something stronger: a resume does not ask
   AT ALL, so there is no second strip to get wrong, and the words she typed
   cannot be re-interpreted by anything. The two checks below say that. */
ok('a resume spends NO search at all', FINDCALLS.length === 0, JSON.stringify(FINDCALLS));
ok('...and shows her the SAME pieces, not whatever the shops hold now',
   back.titles === WAS && back.titles.indexOf('Cara Cara') < 0,
   'was[' + WAS.slice(0, 60) + '] now[' + back.titles.slice(0, 60) + ']');

/* ═══ 9 · NICER SHOPS FIRST — HER DECISION, 2026-09-10 ════════════════════ */
console.log('\n9. her own store scores order the browse row');
/* ▶▶ HER WORDS after testing the live app: "very few from the nicer stores...
   none of them honestly I would ever wear." The row arrived in GOOGLE'S order
   and nothing in it had ever consulted the ten dimensions she scored herself.
   ⚠️ SHE WAS ASKED WHICH OF TWO BUILDS SHE MEANT and chose NICER SHOPS GENUINELY
     FIRST, with her 2026-09-09 "best match first" surviving as the TIE-BREAK.
   ⚠️ NONE OF THESE FOUR SHOPS IS AN AFFILIATE, deliberately: _findSpread is then
     a no-op, so what is measured here is the store sort alone and not the two
     orderings tangled together. Her paying shops keep their own seat, and that
     is asserted where it belongs, in the affiliate checks. */
const SHOPS = ['Old Navy', 'Nordstrom', "Kohl's", 'Talbots'];
FIND = { exact: [], doors: [], browse: SHOPS.map((st, i) =>
  product(50 + i, { store: st, title: 'Belted Midi ' + st })) };
REPLY = { items: six(), findlead: 'I chose a belted dress, you told me you love them.',
          find: { item: 'dress', colour: '', fabric: '', cut: 'belted' } };
await ask(pg, '');
await pg.waitForSelector('#ssFindWrap .find-card', { timeout: 20000 });
const seen = await pg.evaluate(shops => [...document.querySelectorAll('#ssFindWrap .find-card')]
  .map(c => shops.find(st => (c.textContent || '').includes(st)) || '?'), SHOPS);
/* ▶ The expected order comes from HER TABLE, not from the code under test: the
   ten numbers she wrote, through the same _storeFit the chat has always used.
   An unscored shop has no honest place and sorts last rather than being given
   an invented score -- her standing rule, never invent a store's tags. */
const want = await pg.evaluate(shops => {
  const her = _herDims();
  return shops.map(st => ({ st, sc: (STORES[st] && STORES[st].d) ? _storeFit(st, her) : -Infinity }))
              .sort((a, b) => b.sc - a.sc).map(x => x.st);
}, SHOPS);
console.log('     [measured] google sent: ' + SHOPS.join(' > '));
console.log('     [measured] she sees   : ' + seen.join(' > '));
ok('the browse row is ordered by HER ten store scores',
   seen.join('|') === want.join('|'), 'got ' + seen.join(' > ') + ' want ' + want.join(' > '));
/* 🚨 THE ANTI-VACUOUS HALF, AND THIS SUITE HAS NOW NEEDED IT FOUR TIMES: if the
   order the server sent already happened to match her order, the check above
   would pass with the sort deleted. This asserts the row REALLY MOVED. */
ok('...and that is genuinely NOT the order the shops came back in',
   seen.join('|') !== SHOPS.join('|'), 'unchanged: ' + seen.join(' > '));
ok('...and an UNSCORED shop sinks to the end instead of crashing the row',
   seen[seen.length - 1] === "Kohl's" && seen.length === 4, seen.join(' > '));
FIND = null;

/* ═══ 10 · HER OWN SHELF IS IN THE ROW — HER DECISION, 2026-09-10 ═════════ */
console.log('\n10. her affiliate shops reach the row, with their own addresses');
/* ▶▶ HER CATCH: "none from farm Rio, mytheresa Marissa's or Olivela came up in
   the search of 60 shown." MEASURED TWICE and she is right both times — Google
   Shopping will not surface her small luxury shops (0 of 120 on 2026-09-09, 0 of
   33 on 2026-09-10). _findSpread can only reorder what is in the pool, so THE
   PROBLEM IS PRESENCE, NOT POSITION. Her nightly Rakuten feed already holds
   these shops' real products WITH PHOTOGRAPHS; the finder had never looked.
   ⚠️ A FEED PIECE IS THE ONLY CARD IN THIS ROW THAT KNOWS ITS OWN ADDRESS, and
     that is what lets it honestly say "Shop it" and keep its price. Everything
     from Google lands on a shop SEARCH and must say "Find it" with no price --
     her rule, and it is applied here rather than relaxed. */
FIND = { exact: [], doors: [], browse: [
  /* ⚠️ `feed: true` IS THE MARKER, and it is what the page trusts. The Nordstrom
     fixture below deliberately carries a `url` WITHOUT it — a Google result
     always has one and it points at google.com/search, so a build that read
     "has a url" as "knows the product page" would send her somewhere useless.
     ▶ THAT IS NOT HYPOTHETICAL: the first version of this did exactly that, and
       this pair of cards is what caught it. */
  { id: 'feed:https://www.farmrio.com/p/belted-midi', title: 'Belted Midi Dress',
    store: 'FARM Rio', brand: 'FARM Rio', price: '$225', image: 'https://example.com/f.jpg',
    feed: true, url: 'https://www.farmrio.com/p/belted-midi',
    name: 'Belted Midi Dress', search: 'Belted Midi Dress' },
  product(70, { store: 'Nordstrom', title: 'Belted Midi Dress Nordstrom' }) ] };
REPLY = { items: six(), findlead: 'I chose a belted dress, you told me you love them.',
          find: { item: 'dress', colour: '', fabric: '', cut: 'belted' } };
await ask(pg, '');
await pg.waitForSelector('#ssFindWrap .find-card', { timeout: 20000 });
const fd = await pg.evaluate(() => {
  const cards = [...document.querySelectorAll('#ssFindWrap .find-card')];
  const farm = cards.find(c => (c.textContent || '').includes('FARM Rio'));
  const nord = cards.find(c => (c.textContent || '').includes('Nordstrom'));
  const href = c => (c && c.querySelector('a.fc-go') || {}).href || '';
  return { n: cards.length, farmHref: href(farm), nordHref: href(nord),
           ticks: document.querySelectorAll('#ssFindWrap .find-card .fc-yes').length };
});
ok('a piece from HER OWN SHELF reaches the row', /farmrio\.com\/p\/belted-midi/.test(fd.farmHref),
   fd.farmHref.slice(0, 90));
/* 🚨 THE ANTI-VACUOUS HALF: a Google card in the SAME row must still land on a
   shop search, or this check would pass on a build that gave every card a
   product link it does not have. */
ok('...while a Google card in the same row still lands on a shop SEARCH',
   !!fd.nordHref && !/\/s\/70\b/.test(fd.nordHref), fd.nordHref.slice(0, 90));
ok('...and neither wears a tick, because neither was verified',
   fd.ticks === 0, 'ticks=' + fd.ticks);
/* ▶ HER SAVED-ROW RULE, ONE SURFACE FURTHER OUT: the piece that owns its address
   saves as "Shop it" WITH its price; the one that does not saves as "Find it". */
const saved = await pg.evaluate(() => {
  const cards = [...document.querySelectorAll('#ssFindWrap .find-card')];
  const hit = t => cards.find(c => (c.textContent || '').includes(t));
  const tap = c => { const b = c && c.querySelector('.wl-save'); if (b) b.click(); };
  tap(hit('FARM Rio')); tap(hit('Nordstrom'));
  const wl = (wardrobeData && wardrobeData.wishlist) || [];
  const f = wl.find(x => x && /FARM Rio/.test(x.store || '')),
        n = wl.find(x => x && /Nordstrom/.test(x.store || ''));
  return { feedExact: !!(f && f.exact), feedPrice: (f && f.price) || '',
           googleExact: !!(n && n.exact) };
});
ok('a saved feed piece keeps its real address and its price',
   saved.feedExact && /225/.test(saved.feedPrice), JSON.stringify(saved));
ok('...and a saved Google piece still claims no more than it can',
   !saved.googleExact, JSON.stringify(saved));
FIND = null;

/* ═══ 11 · GOOGLE DIES, HER OWN SHOPS STILL ANSWER ═══════════════════════ */
console.log('\n11. a dead Google search no longer costs her her own shops');
/* 🚨🚨 HER CATCH, 2026-09-10, MINUTES AFTER HER SHELF WAS WIRED IN. She searched,
   read "My search didn't come back just then", and saw no photographs -- while
   the function was HOLDING 24 belted dresses from FARM Rio, Mytheresa and COUTR,
   fetched seconds earlier and thrown away by the search-failed early return.
   ▶▶ THE FEED IS A SECOND SOURCE, NOT A GARNISH. Google dying is a reason to
     show her fewer pieces, never a reason to show her none.
   ⚠️ AND IT EXPLAINED HER SECOND COMPLAINT TOO -- "the whisper promised shop your
     style would be saved and it was not". A row that never painted is never
     stored, so the resume had nothing to bring back. ONE ROOT, TWO SYMPTOMS. */
FIND = { exact: [], doors: [], browse: [
  { id: 'feed:https://www.farmrio.com/p/belted', title: 'Belted Maxi Dress',
    store: 'FARM Rio', brand: 'FARM Rio', price: '$298', image: 'https://example.com/r.jpg',
    feed: true, url: 'https://www.farmrio.com/p/belted',
    name: 'Belted Maxi Dress', search: 'Belted Maxi Dress' }],
  googleFailed: true };
REPLY = { items: six(), findlead: 'I chose a belted dress, you told me you love them.',
          find: { item: 'dress', colour: '', fabric: '', cut: 'belted' } };
await ask(pg, '');
await pg.waitForSelector('#ssFindWrap .find-card', { timeout: 20000 });
const rescue = await pg.evaluate(() => ({
  cards: document.querySelectorAll('#ssFindWrap .find-card').length,
  txt: (document.getElementById('shopStyleContent') || {}).innerText || '',
  promise: !!document.querySelector('#ssFindWrap .ss-find-lead') }));
ok('her own shops are shown even though Google returned nothing',
   rescue.cards === 1 && /FARM Rio/.test(rescue.txt), 'cards=' + rescue.cards);
/* 🚨 AND NO APOLOGY OVER REAL PIECES. "My search didn't come back" is for when
   there is genuinely nothing; printing it above her own merchants' dresses would
   be the app apologising for an answer it actually gave. */
ok('...and she is NOT told the search came back with nothing',
   !/didn.t come back just then/i.test(rescue.txt), rescue.txt.slice(0, 120));
ok('...and the promise is kept, because there are cards to keep it with',
   rescue.promise && /belted dress/i.test(rescue.txt), 'promise=' + rescue.promise);
/* ▶ HER SECOND SYMPTOM, CLOSED BY THE SAME ROOT: a row that paints is a row that
   is stored, so the whisper's "same pieces waiting" is true again. */
const rstore = await pg.evaluate(() => JSON.parse(localStorage.getItem('ss_shoppicks') || '{}'));
ok('...and the row is stored, so the resume really has something to bring back',
   !!(rstore.d && (rstore.d.browse || []).length === 1),
   JSON.stringify(rstore.d ? {browse: (rstore.d.browse || []).length} : null));
FIND = null;

/* ═══ 12 · IT REMEMBERS WHAT IT ALREADY PAID FOR ══════════════════════════ */
console.log('\n12. a search she has already run survives a reload');
/* 🚨🚨 HER QUESTION, 2026-09-10: "do we need to rebuild the shopping searches
   from scratch? I want this to land clearly and easily." THE ANSWER WAS NO, and
   this is the reason: TWO caches already existed and BOTH lived in memory, so
   almost every search she ran was a COLD 4-12 second search -- including the
   identical one she had just run.
   ⚠️ THE RELOAD IS THE WHOLE TEST. An in-memory cache passes any check that
     never reloads, which is exactly how the old ones looked like they worked. */
FIND = null;
REPLY = { items: six(), findlead: 'I chose a belted dress, you told me you love them.',
          find: { item: 'dress', colour: '', fabric: '', cut: 'belted' } };
await ask(pg, '');
await pg.waitForSelector('#ssFindWrap .find-card', { timeout: 20000 });
const firstShown = await pg.evaluate(() =>
  document.querySelectorAll('#ssFindWrap .find-card').length);
const kept = await pg.evaluate(() => {
  try { return Object.keys(JSON.parse(localStorage.getItem('ss_find_v1') || '{}')).length } catch (e) { return -1 }
});
ok('the answer is written down, not only held in memory', kept === 1, 'entries=' + kept);

/* ▶ THE REAL RETURN PATH: a full reload, which is what Back from a shop does and
   what wiped the old caches every single time. */
await pg.reload(); await pg.waitForTimeout(2300);
await pg.evaluate(() => { const c = document.querySelector('.hm-entrance'); if (c) c.remove(); });
FINDCALLS.length = 0;
FINDSTATUS = 500;          // 🚨 the network is DEAD now: only memory can answer
await pg.evaluate(() => { _openShopStyleNow('quiz'); });
await pg.waitForSelector('#ssFindWrap .find-card', { timeout: 20000 });
const backAfter = await pg.evaluate(() => ({
  cards: document.querySelectorAll('#ssFindWrap .find-card').length,
  txt: (document.getElementById('shopStyleContent') || {}).innerText || '' }));
ok('...and after a reload her pieces come back with the search DEAD',
   backAfter.cards === firstShown && backAfter.cards > 0,
   'cards=' + backAfter.cards + ' first=' + firstShown);
ok('...and she is not told the search failed, because it did not need to run',
   !/didn.t come back just then/i.test(backAfter.txt), backAfter.txt.slice(0, 110));
FINDSTATUS = 200;

/* 🚨 THE ANTI-VACUOUS HALF: a DIFFERENT question must still really search, or
   this check would pass on a build that simply showed the last row forever. */
FINDCALLS.length = 0;
await ask(pg, 'a linen skirt', true);
await pg.waitForTimeout(1500);
ok('...while a question she has NOT asked before really does search',
   FINDCALLS.length === 1, JSON.stringify(FINDCALLS));

/* ═══ 13 · THE APOLOGY ONLY WHERE SHE ASKED FOR SOMETHING ═════════════════ */
console.log('\n13. it apologises only where she actually asked for something');
/* 🚨 HER RULING, 2026-09-10, after seeing the Wardrobe shelf rendered at phone
   size: "take the apologizing line off". ▶▶ ON THE WARDROBE SHE TYPED NOTHING --
   she tapped a checklist row -- so there is no exact match to fall short of, and
   "Nothing came back as an exact match" apologises over six real products from
   real shops at real prices. Her own rule: STATE THE TRUTH AND STOP.
   ⚠️ AND THE HALF THAT KEEPS IT HONEST IS ASSERTED FIRST: it must STILL appear
     wherever she named a thing, or this would be a quiet loosening rather than
     a scoping. */
FIND = { exact: [], doors: [], browse: [
  product(80, {store: 'Nordstrom', title: 'Poplin Shirt'}),
  product(81, {store: 'Everlane', title: 'Silky Cotton Shirt'})] };
REPLY = { items: six(), find: { item: 'blouse', colour: 'white', fabric: '', cut: '' } };
await ask(pg, 'a white blouse');
await pg.waitForSelector('#ssFindWrap .find-card', { timeout: 20000 });
const asked = await pg.evaluate(() =>
  (document.getElementById('ssFindWrap') || {}).innerText || '');
ok('she ASKED for a white blouse, so she is still told it was not exact',
   /Nothing came back as an exact match/i.test(asked), asked.slice(0, 90));

/* ▶ The same data, same builder, through the caller that knows she named
   nothing. Rendered into a scratch wrap so this measures the BUILDER's rule
   rather than the Wardrobe screen's plumbing. */
const quiet = await pg.evaluate(() => {
  const d = {exact: [], doors: [], browse: [
    {id: 'q1', title: 'Poplin Shirt', store: 'Nordstrom', brand: 'Nordstrom',
     price: '$59', image: '', name: 'Poplin Shirt', search: 'Poplin Shirt'}]};
  const loud = _findBlockHtml(d, {item: 'blouse'}, false);
  const soft = _findBlockHtml(d, {item: 'blouse'}, true);
  return {loud: /Nothing came back as an exact match/i.test(loud),
          soft: /Nothing came back as an exact match/i.test(soft),
          softStillHasCards: soft.indexOf('find-card') >= 0};
});
ok('...and the SAME builder keeps quiet when the caller says she asked for nothing',
   quiet.loud && !quiet.soft, JSON.stringify(quiet));
/* 🚨 THE ANTI-VACUOUS HALF: quiet must remove the APOLOGY, not the products. */
ok('...while still showing her every piece it found',
   quiet.softStillHasCards, JSON.stringify(quiet));
FIND = null;

/* ═══ 14 · THE SEARCH HOLDS WORDS A SHOP PRINTS ═════════════════════════ */
console.log('\n14. what goes to the shops is words a shop actually prints');
/* 🚨🚨 HER TWO FAILED SEARCHES, 2026-09-10: "I asked it for vacation dress and
   for white jeans and neither one of those worked."
   ▶▶ MEASURED LIVE, AND THEY FAILED FOR DIFFERENT REASONS:
     · white jeans  — Google's half was flapping (0 results one minute, 23 the
       next). Her own shelf carried it: 9 pieces, Marissa Collections $238.
     · vacation dress — the word "vacation" went INTO the search, and NO garment
       on earth is named "vacation", so it matched nothing at all.
   ▶ AND THE SAME ROOT WAS ALREADY BREAKING THE DEFAULT VIEW. Three live replies
     put these in `cut`: 46, 35 and 50 characters of PROSE. `cleanReq` accepts 40
     and DROPS the rest SILENTLY, so two of three sent the shops a bare "dress"
     under a sentence promising a wrap — her exact complaint of that morning,
     returning in a new form hours after it was fixed.
   ⚠️ THE PROMPT IS THE REAL FIX; THIS IS THE FLOOR UNDER IT, because a prompt
     rule is only ever a prompt rule -- this file's own hardest lesson. */
const shopWords = await pg.evaluate(() => {
  const t = (cut) => (_findShopWords({item: 'dress', cut}).cut || '');
  return {
    long1: t('belted wrap with midi length and fitted bodice'),
    long2: t('fitted wrap silhouette with self-tie belt at waist'),
    mid:   t('belted midi wrap with defined waist'),
    good:  t('belted'),
    two:   t('belted midi'),
  };
});
/* The server's own rule, copied here deliberately: if these two ever disagree a
   value passes this check and is still dropped in the function. */
const SERVER_CLEAN = /^[a-z0-9][a-z0-9 '\-/.]{0,39}$/i;
ok('a sentence becomes searchable words instead of being dropped',
   shopWords.long1 === 'belted wrap' && SERVER_CLEAN.test(shopWords.long1),
   JSON.stringify(shopWords.long1));
ok('...and so does the longest one the live stylist actually wrote',
   shopWords.long2 === 'fitted wrap silhouette' && SERVER_CLEAN.test(shopWords.long2),
   JSON.stringify(shopWords.long2));
/* 🚨 THE DANGLING-JOINER HALF: cutting at three words alone would leave "belted
   wrap with", which no shop prints either. A trim has to end on a real word. */
ok('...and never ends on a dangling joiner',
   !/\b(with|and|at|in|on|of|for|a|an|the)$/i.test(shopWords.mid), JSON.stringify(shopWords.mid));
/* 🚨 THE ANTI-VACUOUS HALF: it must not shorten a value that was ALREADY right,
   or "it trims" would be indistinguishable from "it destroys". */
ok('...while a value that was already right is untouched',
   shopWords.good === 'belted' && shopWords.two === 'belted midi', JSON.stringify(shopWords));
/* ▶ AND EVERY ROUTE RUNS IT, not just the one that was broken.
   ⚠️ REWRITTEN, NOT BUMPED: this first asserted a COUNT of 6 and found 5, and the
     app was right — 5 is one definition plus the four routes that exist. A count
     I guessed is exactly the "bump the number without reading it" this file
     warns about. ▶ IT NAMES THE RULE NOW: THE TWO GUARDS TRAVEL TOGETHER. Every
     place that checks her words against a model's request must also trim that
     request to searchable words, because both faults arrive on the same reply —
     and a count of one of them can never say that. */
const kw = (HTML.match(/_findKeepHerWords\(/g) || []).length - 1;   // less its definition
const sw = (HTML.match(/_findShopWords\(/g) || []).length - 1;
ok('the her-words guard and the shop-words floor run on the SAME routes',
   kw === sw && kw === 4, 'keepHerWords=' + kw + ' shopWords=' + sw);
/* ▶ AND THE PROMPT SIDE, WHICH IS THE ACTUAL FIX: an occasion is never searched. */
ok('the stylist is told an occasion is never a search word',
   /No garment is NAMED "vacation"/.test(noAsk) && /No garment is NAMED "vacation"/.test(withAsk));

ok('zero JS errors across every scenario', errs.length === 0, errs.join(' | '));
await ctx.close();

console.log(`\n${pass} passed, ${failn} failed`);
await b.close(); srv.close();
process.exit(failn ? 1 : 0);
