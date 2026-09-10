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
ok('with NO ask, it orders colour/fabric/cut left EMPTY rather than guessed',
   /leave all three EMPTY/i.test(noAsk), noAsk.slice(0, 200));
ok('either way it says empty is safer than a guess',
   /Leave a field empty rather than guessing/.test(withAsk) &&
   /Leave a field empty rather than guessing/.test(noAsk));
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
ok('Shop your Style renders through the SAME _findBlockHtml as the chat',
   /_ssFindRun[\s\S]{0,1600}_findBlockHtml\(/.test(HTML));
ok('and reaches the network through the SAME _findFetch',
   /_ssFindRun[\s\S]{0,900}_findFetch\(/.test(HTML));
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
  if (!keepCache) await pg.evaluate(() => { try { _FIND_CACHE.clear() } catch (e) {} });
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
/* 🚨🚨 NO PINK STAR ANYWHERE ON THIS SCREEN — HER RULING, 2026-09-09, GIVEN TWICE:
   "I don't want the pink star on shop your style. That is only for stylist chat.
   I want the gold one."
   ▶▶ IT OVERTURNS A WRITTEN RATIONALE, which is why it needs a check rather than
     a comment: the markup carried a note saying the pink star meant "the stylist
     is working", so a future session has a documented-looking reason to put pink
     back. She was shown that reasoning and chose gold anyway.
   ⚠️ THIS COUNTS EVERY STAR ON THE SCREEN, not just the waiting one — the two she
     was actually looking at were the mark beside "Looking for something specific?"
     and the little one beside "shopping your style...", neither of which was the
     star being tuned at the time. A check scoped to one star would have missed
     exactly what she reported. */
{const pinks = await pg.evaluate(() => {
   const out = [];
   document.querySelectorAll('#s-shopstyle svg').forEach(sv => {
     const shape = sv.querySelector('polygon,path');
     if (!shape) return;
     const cs = getComputedStyle(shape);
     if (/rgb\(236, 72, 153\)/.test(cs.fill) || /rgb\(236, 72, 153\)/.test(cs.stroke))
       out.push(sv.getAttribute('class') || '(unclassed)');
   });
   return out;
 });
 ok('NO pink star anywhere on Shop your Style — pink is the chat\'s alone',
    pinks.length === 0, 'pink: ' + pinks.join(', '));}

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
ok('a colour she NEVER said is deleted before the search goes out',
   FINDCALLS.length === 1 && !FINDCALLS[0].colour, JSON.stringify(FINDCALLS[0]));
ok('and so is a cut she never said', !FINDCALLS[0].cut, JSON.stringify(FINDCALLS[0]));
ok('...but the garment she DID ask for is kept',
   FINDCALLS[0].item === 'dress', JSON.stringify(FINDCALLS[0]));

/* ═══ 5 · THE DEFAULT VIEW SEARCHES TOO — HER RULING (b) ══════════════════ */
console.log('\n5. the default "show me a mix" searches too, and says whose choice it was');
REPLY = { items: six(), findlead: 'A linen midi felt most you, so that is where I looked.',
          find: { item: 'dress', colour: '', fabric: '', cut: '' } };
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
ok('the stylist SAYS the choice was hers', /that is where I looked/i.test(d.lead || ''), String(d.lead));

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
/* 🚨 Her rule, one surface further out. Here the honest move is QUIETER than in
   chat, because her six styling picks are on the screen underneath: the row
   removes itself rather than printing an apology over advice that is good. */
REPLY = { items: six(), find: { item: 'skirt', colour: '', fabric: '', cut: '' } };
FINDSTATUS = 500; await ask(pg, 'a skirt');
await pg.waitForTimeout(1800);
let f = await pg.evaluate(() => ({ wrap: !!document.getElementById('ssFindWrap'),
  six: document.querySelectorAll('#shopStyleContent .shop-card').length,
  txt: (document.getElementById('shopStyleContent') || {}).innerText || '' }));
ok('a dead search leaves NO empty row behind', !f.wrap, 'wrap still there');
ok('...and her six styling picks are untouched', f.six === 6, String(f.six));
ok('...and nothing on screen claims her shops had nothing',
   !/nothing close enough/i.test(f.txt) && !/couldn.t find exactly/i.test(f.txt));
FINDSTATUS = 200;

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
/* ▶ The real return path: reload, then resume, exactly as a woman coming back
   from a store does. The model is answered with NOTHING so a resume that
   secretly re-asked would render an empty screen and be caught here. */
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
}));
ok('the products are STILL THERE after she comes back', back.cards === 4, 'cards=' + back.cards);
ok('...and her six styling picks came back with them', back.six === 6, String(back.six));
ok('...and the save hearts came back too', back.hearts === back.cards, String(back.hearts));
ok('a resume asked the finder with HER words, not a broadened search',
   FINDCALLS.length === 1 && FINDCALLS[0].colour === 'white' && FINDCALLS[0].fabric === 'linen',
   JSON.stringify(FINDCALLS));

ok('zero JS errors across every scenario', errs.length === 0, errs.join(' | '));
await ctx.close();

console.log(`\n${pass} passed, ${failn} failed`);
await b.close(); srv.close();
process.exit(failn ? 1 : 0);
