// shopask.js — the front door for "I already know what I want", plus the retirement
// of the category emoji.
//
// Built 2026-08-21 from three tester reports that were all the same finding: Haley
// typed a price limit into the preferences free-text box because no field existed;
// Alice said she'd use the app "if I needed a dress quickly for an event"; and
// Cath's mother asked "I want to look at fancy floor length dresses via StyleStar.
// How do I let the app know that?" — with the answer (dr10 Formal gowns) three taps
// away and no door to it.
//
// Run: node scratchpad/shopask.js
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = 8995;
let pass = 0, failn = 0;
const ok = (n, c, x) => c ? (pass++, console.log('  ✓ ' + n))
                          : (failn++, console.log('  ✗ FAIL ' + n + (x ? ' — ' + x : '')));

const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});
await new Promise(r => srv.listen(PORT, r));

const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const AI = { items: [
  { category: 'top',    name: 'Satin Button-Front Blouse', search: 'satin button front blouse', store: 'Nordstrom' },
  { category: 'dress',  name: 'Wrap Midi Dress',           search: 'wrap midi dress',           store: 'Anthropologie' },
  { category: 'top',    name: 'Ribbed Knit Tank',          search: 'ribbed knit tank',          store: 'Quince' },
  { category: 'bag',    name: 'Structured Top Handle Bag', search: 'top handle bag',            store: 'Cuyana' },
]};

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errs = [];
const prompts = [];
async function fresh(w) {
  const ctx = await b.newContext({ viewport: { width: w || 390, height: 844 } });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/.netlify/**', r => {
    try { prompts.push(JSON.parse(r.request().postData() || '{}').messages[0].content); } catch (e) { prompts.push(''); }
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [{ text: JSON.stringify(AI) }] }) });
  });
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2300);
  await pg.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath',
    answers: new Array(12).fill(6), topArchNames: ['The Timeless Classic'], portrait: 'p', motto: 'm' })));
  await pg.reload(); await pg.waitForTimeout(2300);
  await pg.evaluate(() => { const c = document.querySelector('.hm-entrance'); if (c) c.remove(); });
  return { ctx, pg };
}
const openShopRest = async (pg, mode) => {
  await pg.evaluate(m => _openShopStyleNow(m), mode || 'quiz');
  await pg.waitForSelector('#shopStyleContent .shop-card', { timeout: 20000 });
};
// HER PICK B, 2026-08-22: the box no longer leads the page. It is collapsed behind
// a named line, so every section that types into it must OPEN it first, exactly as
// a woman would. openShopRest is the at-rest view, used where the closed state is
// the thing under test.
const reveal = async pg => { await pg.evaluate(() => _ssAskReveal()); await pg.waitForTimeout(140); };
const openShop = async (pg, mode) => { await openShopRest(pg, mode); await reveal(pg); };

// ── 1. The emoji are gone, at the source ────────────────────────────────────
console.log('\n1. The category emoji are retired');
ok('no catEmoji map survives', !/catEmoji/.test(HTML));
ok('no photoShopEmoji map survives', !/photoShopEmoji/.test(HTML));
ok('no .shop-emoji markup or rule survives', !/shop-emoji/.test(HTML));
// The sparkle was the deliberate icon for `accessory` on Complete the Look, not a
// fallback — the AI-slop mark on the one app whose whole positioning is a real stylist.
// ⚠️ This assertion started life as "no sparkle anywhere" and was WRONG: the save
// toasts still use one, and the wider emoji audit (the camera on Analyze, the toasts,
// the og:title) is deliberately a separate conversation with her. So it pins what is
// left, which is the useful claim — a sparkle creeping back into a RENDERER fails.
const sparkLines = HTML.split('\n').filter(l => /✨/.test(l));
// The survivors, all deliberate: 4 save/share toasts, the share alert, and 2 lines
// in the stylist's own chat voice (its system prompt permits one emoji per reply).
// None of them is an ICON in a renderer, which is the thing this change retired.
ok('the only sparkles left are toasts and the stylist\'s chat voice, out of scope by her call',
   sparkLines.every(l => /Saved!|One more thing|saved as an image|only good at style|having a moment/.test(l)),
   sparkLines.length + ' lines');

// ── 2. At rest: she gets pieces without touching anything ───────────────────
console.log('\n2. At rest — the six still arrive untouched');
let { ctx, pg } = await fresh();
await openShopRest(pg);
let r = await pg.evaluate(() => {
  const a = document.getElementById('ssAsk');
  return {
    visible: getComputedStyle(a).display !== 'none',
    outside: !document.getElementById('shopStyleContent').contains(a),
    chipsHidden: getComputedStyle(document.getElementById('ssAskMore')).display === 'none',
    placeholder: document.getElementById('ssAskIn').placeholder,
    cards: document.querySelectorAll('#shopStyleContent .shop-card').length,
    star: !!document.querySelector('#ssAsk .sa-star'),
    heart: !!document.querySelector('#ssAsk .pinkheart'),
    voxText: document.querySelector('#ssAsk .sa-vox').textContent.trim(),
    voxFont: getComputedStyle(document.querySelector('#ssAsk .sa-vox')).fontFamily,
    voxStyle: getComputedStyle(document.querySelector('#ssAsk .sa-vox')).fontStyle,
    escInAsk: !!document.querySelector('#ssAsk .sa-esc'),
    escBelow: (() => { const t = document.querySelector('#s-shopstyle .ss-shop-talk'),
      c = document.getElementById('shopStyleContent');
      return !!t && !!(c.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING); })(),
    align: getComputedStyle(document.getElementById('ssAskIn')).textAlign,
    boxRadius: getComputedStyle(document.getElementById('ssAskIn')).borderTopLeftRadius,
    // Her call, 2026-08-21: the star leads the sentence rather than trailing it.
    // Measured by PAINTED POSITION, not by DOM order — a float or a margin could put
    // the mark on the right while the markup still reads left-first.
    starLeads: (() => { const s = document.querySelector('#ssAsk .sa-star'),
      v = document.querySelector('#ssAsk .sa-vox');
      if (!s || !v) return false;
      // ⚠️ UPDATED DELIBERATELY 2026-08-22, and the CLAIM is unchanged: the star
      // still has to lead the sentence. What changed is that the line is centred
      // now that it stands alone, so measuring the star against the BUTTON's left
      // edge measured the centring offset rather than the mark. Compared to the
      // painted start of the words instead, which is the stronger test: a float or
      // a margin putting the mark after the text still fails.
      const tn = [...v.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
      if (!tn) return false;
      const rg = document.createRange(); rg.selectNodeContents(tn);
      const tr = rg.getBoundingClientRect(), sr = s.getBoundingClientRect();
      return sr.right <= tr.left + 2; })(),
    askClosed: !document.getElementById('ssAsk').classList.contains('open'),
    boxHidden: getComputedStyle(document.getElementById('ssAskIn')).display === 'none',
    voxTag: document.querySelector('#ssAsk .sa-vox').tagName,
    voxUnderlined: /underline/.test(getComputedStyle(document.querySelector('#ssAsk .sa-vox')).textDecorationLine),
    voxTap: Math.round(document.querySelector('#ssAsk .sa-vox').getBoundingClientRect().height),
    pulledGone: !document.querySelector('#s-shopstyle .ss-shop-pulled'),
    subHidden: getComputedStyle(document.querySelector('#s-shopstyle .ss-shop-sub')).display === 'none',
    nowHidden: getComputedStyle(document.getElementById('ssAskNow')).display === 'none',
  };
});
// The box is squared like the cards and the chips before it — her store-window
// reading, applied to the one control on the screen that was still rounded.
ok('the box is squared, not rounded', r.boxRadius === '0px', r.boxRadius);
ok('the pink star LEADS the sentence', r.starLeads);
// ── HER PICK B: the pieces lead, the hunt is offered ───────────────────────
// The page used to open with a DEMAND, and the box competed with the six for the
// same moment. Her words: a well rounded selection her stylist pulled for her to
// enjoy, and THEN the one specific thing she came in for.
ok('the box is CLOSED when she lands', r.askClosed && r.boxHidden);
ok('...but the door is still NAMED at the top', /Looking for something specific/.test(r.voxText || ''), r.voxText);
ok('...and it looks tappable', r.voxUnderlined);
ok('...and it really is a button, not a styled div', r.voxTag === 'BUTTON', r.voxTag);
ok('...with a tap target a woman of 80 can hit', r.voxTap >= 36, r.voxTap + 'px');
// ⚠️ TWO ASSERTIONS REMOVED HERE 2026-08-22, DELIBERATELY, because their SUBJECT
// was retired and not because they were failing. A landed line naming the
// selection ("A few pieces I pulled for you") was built and cut the same day,
// hers: "I think that is going to get redundant... it might be just obvious to
// land on it and see what is there, especially when we have product photos." The
// surviving half of the claim is the one that still means something: the
// WAITING tagline must stand down once the pieces arrive.
ok('the waiting tagline has stood down once the pieces land', r.subHidden);
ok('...and no landed line crept back in to replace it', r.pulledGone,
   'a line under the header is the clutter she removed twice');
ok('nothing about a filter shows before she has asked for anything', r.nowHidden);
ok('the ask is on screen', r.visible);
// It must live outside #shopStyleContent: that container's innerHTML is replaced on
// every generate, so an input inside it would lose her typing on her own refresh.
ok('it lives OUTSIDE the container that gets re-rendered', r.outside);
ok('the chips are hidden until she taps in', r.chipsHidden);
ok('the placeholder comes from the ring', /^Try: /.test(r.placeholder), r.placeholder);
ok('the six pieces render without her touching it', r.cards > 0, r.cards + ' cards');
// Her call after live testing: with the escalation above the pieces the top grew to
// label + box + link before she saw a single garment, and it read as crowded. Below
// them it asks "none of these?" at the moment she is actually thinking it.
ok('the stylist line sits BELOW the pieces, not above them', r.escBelow);
ok('...and the ask no longer carries one of its own', !r.escInAsk);
// Her mark system: pink HEART = Catherine speaking, pink STAR = the stylist working.
// This screen is the stylist working, which is why its loader star is pink too.
ok('the mark is the stylist PINK STAR', r.star);
ok('...and NOT her pink heart', !r.heart);
// A centred placeholder sits in the middle of the field looking like a value, which
// is precisely why it read to her as text she had to delete.
ok('the box reads left to right like a field, not centred like a label', r.align === 'left', r.align);
ok('the sentence is in her light-paper voice (Lora, upright)',
   /Lora/.test(r.voxFont) && r.voxStyle !== 'italic', r.voxFont + ' / ' + r.voxStyle);

// ── 3. Tapping in reveals the chips; a chip fills the box ───────────────────
console.log('\n3. Tap in — chips appear, and a chip FILLS the box');
await reveal(pg);
await pg.focus('#ssAskIn'); await pg.waitForTimeout(250);
r = await pg.evaluate(() => ({
  shown: getComputedStyle(document.getElementById('ssAskMore')).display !== 'none',
  occ: [...document.querySelectorAll('#ssAskOcc .sa-chip')].map(e => e.textContent),
  cat: [...document.querySelectorAll('#ssAskCat .sa-chip')].map(e => e.textContent),
}));
ok('the SHOW ME button appears on focus', r.shown);
// The chip rows are GONE, her call after live testing: she typed "white linen dress",
// tapped Vacation, and the chip OVERWROTE her sentence. A control that silently
// destroys what she just wrote is worse than no control.
ok('no chips survive to overwrite what she typed', r.occ.length === 0 && r.cat.length === 0);
// Her other live catch: a centred placeholder reads as text already in the box.
r = await pg.evaluate(() => ({ ph: document.getElementById('ssAskIn').placeholder }));
ok('the example clears the moment she taps in', r.ph === '', JSON.stringify(r.ph));
await pg.evaluate(() => document.getElementById('ssAskIn').blur());
await pg.waitForTimeout(150);
ok('...and comes back if she leaves the box empty',
   /^Try: /.test(await pg.evaluate(() => document.getElementById('ssAskIn').placeholder)));
await pg.fill('#ssAskIn', 'white linen dress');
ok('what she typed is never replaced by anything',
   (await pg.inputValue('#ssAskIn')) === 'white linen dress');

// ── 4. Her ask reaches the picks ────────────────────────────────────────────
console.log('\n4. What she types reaches the prompt');
prompts.length = 0;
await pg.fill('#ssAskIn', 'floor length gown');
await pg.click('.sa-go');
await pg.waitForTimeout(1600);
let p = prompts.join('\n');
ok('the prompt carries her exact words', /ASKED FOR SOMETHING SPECIFIC: "floor length gown"/.test(p));
ok('it is stated as an absolute rule, where the hard rules live', /This rule is absolute/.test(p));
// A broad ask becomes a SPREAD across the six rather than one guessed formality —
// which is what makes "For an event" a good chip instead of a vague one.
ok('a broad ask is covered as a RANGE, not guessed', /COVER THE RANGE across the 6/.test(p));

// 🚨 Her live test: she typed "bags" and got a dress, trousers, heels, rings and a
// blazer. The ask was not weak, it was contradicted by the bullet directly beneath it.
ok('the ask reframes the whole task, not just a rule at the bottom',
   /is looking for: "floor length gown"\. Suggest 6 specific shoppable pieces that are exactly that/.test(p));
ok('the contradicting "mix categories" bullet is REMOVED when she asks',
   !/Mix categories and price points/.test(p));
ok('...replaced by one that varies price without varying the piece',
   /every single one must be the thing she asked for/.test(p));

console.log('\n5. The ask survives a refresh but never outlives the visit');
prompts.length = 0;
await pg.click('.shop-refresh-btn');
await pg.waitForTimeout(1600);
// "Show me different options" after asking for gowns must return more gowns.
ok('"Show me different options" keeps her ask', /floor length gown/.test(prompts.join('\n')));
prompts.length = 0;
await openShop(pg, 'quiz');            // she leaves and comes back
await pg.waitForTimeout(400);
ok('re-opening the screen clears it', !/floor length gown/.test(prompts.join('\n')));
ok('...and the box is empty again', (await pg.inputValue('#ssAskIn')) === '');

// ── 6. The veto trap ────────────────────────────────────────────────────────
prompts.length = 0;
await openShop(pg, 'quiz');   // no ask this time
await pg.waitForTimeout(300);
ok('with NO ask, the normal mix-categories bullet is back',
   /Mix categories and price points/.test(prompts.join('\n')));

console.log('\n6. Her own request is not eaten by the search veto');
// _SEARCH_VETO holds 'wrap'. Without passing her ask into filterNeverWear, a woman
// typing "wrap dress" would have every pick silently dropped and see an empty shelf.
prompts.length = 0;
await pg.fill('#ssAskIn', 'wrap dress'); await pg.click('.sa-go'); await pg.waitForTimeout(1600);
let txt = await pg.evaluate(() => document.getElementById('shopStyleContent').innerText);
ok('typing "wrap dress" keeps the wrap pick', /Wrap Midi Dress/i.test(txt));
// But taste is never waived by asking.
ok('...while the ribbed piece is STILL vetoed (taste never waives)', !/Ribbed/i.test(txt));
await pg.fill('#ssAskIn', 'ribbed knit tank'); await pg.click('.sa-go'); await pg.waitForTimeout(1600);
txt = await pg.evaluate(() => document.getElementById('shopStyleContent').innerText);
ok('even asking for ribbed by name does not override her stylist veto', !/Ribbed/i.test(txt));

// ── 6b. The way back to a variety ───────────────────────────────────────────
// 🚨 Her question — "should we have an option for her to click on variety of items
// rather than something specific?" — turned out to name a real DEAD END: once an ask
// was set, emptying the box and tapping SHOW ME did nothing at all, so the only
// escape was leaving the screen. Both halves are tested: the visible control, and
// the empty box that a woman would try first.
console.log('\n6b. Getting back to a mixed six');
prompts.length = 0;
await openShop(pg, 'quiz'); await pg.waitForTimeout(300);
await pg.fill('#ssAskIn', 'bags'); await pg.click('.sa-go'); await pg.waitForTimeout(1600);
r = await pg.evaluate(() => { const n = document.getElementById('ssAskNow');
  return { shown: getComputedStyle(n).display !== 'none', txt: n.innerText,
           link: !!n.querySelector('span'),
           // It must sit under the BOX, not down with the refresh button: the
           // question "why is everything a bag" is asked at the top, where the word
           // she typed is still on screen.
           underBox: (() => { const i = document.getElementById('ssAskIn');
             return !!(i.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING)
                 && document.getElementById('ssAsk').contains(n); })(),
           // And it must NOT be inside the container that is replaced on every
           // generate, or it would blink out on her own refresh.
           safe: !document.getElementById('shopStyleContent').contains(n) };
});
ok('once she asks, the screen names what it is showing', r.shown && /Showing bags/.test(r.txt), r.txt);
ok('...directly under the box, where the confusion is', r.underBox);
ok('...outside the container that gets re-rendered', r.safe);
ok('...and it offers the way out', r.link && /mix instead/.test(r.txt));
prompts.length = 0;
await pg.click('#ssAskNow span'); await pg.waitForTimeout(1600);
ok('tapping it brings back a mixed six', /Mix categories and price points/.test(prompts.join('\n')));
ok('...and her ask is gone from the prompt', !/"bags"/.test(prompts.join('\n')));
ok('...the box is empty again', (await pg.inputValue('#ssAskIn')) === '');
ok('...and the filter line stands down',
   await pg.evaluate(() => getComputedStyle(document.getElementById('ssAskNow')).display === 'none'));
// The mechanism a woman would try before she found the link.
prompts.length = 0;
await pg.fill('#ssAskIn', 'bags'); await pg.click('.sa-go'); await pg.waitForTimeout(1600);
prompts.length = 0;
await pg.fill('#ssAskIn', ''); await pg.click('.sa-go'); await pg.waitForTimeout(1600);
ok('emptying the box and tapping SHOW ME also returns a mix',
   /Mix categories and price points/.test(prompts.join('\n')));
// But an empty box with no ask in force must do nothing at all — she has simply not
// typed anything yet, and firing a generate there would spin the star for no reason.
prompts.length = 0;
await pg.focus('#ssAskIn'); await pg.waitForTimeout(200);   // SHOW ME only shows on focus
await pg.click('.sa-go'); await pg.waitForTimeout(900);
ok('an empty box with nothing asked does not fire a pointless search', prompts.length === 0);

// ── 7. Mode gating ──────────────────────────────────────────────────────────
console.log('\n7. Quiz mode only — her call');
for (const [mode, why] of [['look', 'it is told to MIRROR the outfit she shared'],
                           ['wantlist', 'it owes one pick per starred row']]) {
  await pg.evaluate(m => _openShopStyleNow(m), mode);
  await pg.waitForTimeout(1500);
  const hidden = await pg.evaluate(() => getComputedStyle(document.getElementById('ssAsk')).display === 'none');
  ok(`hidden in ${mode} mode — ${why}`, hidden);
}
await openShop(pg, 'quiz');
ok('back on Shop your style it returns', await pg.evaluate(() =>
  getComputedStyle(document.getElementById('ssAsk')).display !== 'none'));

// ── 8. The placeholder ring ─────────────────────────────────────────────────
console.log('\n8. The placeholder rotates, and only on open');
// DERIVED from the ring, never restated: she can add or cut an example without
// anyone having to edit a number here (the curated.js lesson).
const RING = await pg.evaluate(() => _ASK_RING.length);
ok('the ring has real examples in it', RING >= 4, RING + ' entries');
const seen = [];
for (let i = 0; i <= RING; i++) { await openShop(pg, 'quiz'); seen.push(await pg.evaluate(() => document.getElementById('ssAskIn').placeholder)); }
ok('a different example on every visit until it runs out',
   new Set(seen.slice(0, RING)).size === RING, seen.slice(0, RING).join(' | '));
ok('...then it wraps round to the first', seen[RING] === seen[0]);
ok('every example is prefixed so it reads as a suggestion, not as typed text',
   seen.every(s => /^Try: /.test(s)));
const before = await pg.evaluate(() => document.getElementById('ssAskIn').placeholder);
await pg.click('.shop-refresh-btn'); await pg.waitForTimeout(1500);
// Advanced in _openShopStyleNow, never in _shopStyleGen, so a refresh cannot shuffle
// it under her fingers — the same reasoning that holds the subtitle still.
ok('a refresh does NOT shuffle it', (await pg.evaluate(() => document.getElementById('ssAskIn').placeholder)) === before);

// ── 8b. Every example fits its box, at every width ──────────────────────────
console.log('\n8b. No example is cut off — measured, not eyeballed');
// A placeholder that is too long is CLIPPED, not overflowed, so the overflow sweep
// in section 12 cannot see it. This is the exact failure the wishlist add-form hit:
// "The piece, e.g. black studded shoulder bag" needed 287px inside a 230px box and
// was cut on EVERY phone. Measure the painted text against the real inner width.
for (const w of [390, 375, 360, 320]) {
  const f = await fresh(w); await openShop(f.pg, 'quiz');
  const worst = await f.pg.evaluate(() => {
    const inp = document.getElementById('ssAskIn'), cs = getComputedStyle(inp);
    const inner = inp.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const c = document.createElement('canvas').getContext('2d');
    c.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    let worstName = '', worstOver = -1e9;
    _ASK_RING.forEach(s => { const over = c.measureText(s).width - inner;
      if (over > worstOver) { worstOver = over; worstName = s; } });
    return { name: worstName, over: Math.round(worstOver), inner: Math.round(inner) };
  });
  ok(`${w}px: the longest example still fits ("${worst.name}")`, worst.over <= 0,
     worst.over + 'px too wide in a ' + worst.inner + 'px box');
  await f.ctx.close();
}

// ── 9. The card is a pane in a shop window ──────────────────────────────────
console.log('\n9. The cards read as panes, and carry no icon');
r = await pg.evaluate(() => {
  const c = document.querySelector('#s-shopstyle .shop-card'), s = getComputedStyle(c);
  return { radius: s.borderTopLeftRadius, col: s.borderTopColor,
    frame: getComputedStyle(document.querySelector('.ss.shop-mirror')).borderTopColor,
    // ⚠️ Count only the card's TOP slot. A naive `.shop-card svg` also counts the
    // Save heart, which is an SVG by design and must stay — the first version of
    // this check failed on a perfectly correct card.
    icons: [...document.querySelectorAll('#shopStyleContent .shop-card')].reduce((n, c) => {
      const first = c.firstElementChild;
      return n + (first ? first.querySelectorAll('svg,img').length : 0); }, 0) };
});
ok('squared, not rounded', r.radius === '0px', r.radius);
// Not a new black: #17171c is already the window frame and the awning stripes.
ok('the hairline IS the window frame black', r.col === r.frame, r.col + ' vs ' + r.frame);
ok('no icon above the name', r.icons === 0, r.icons + ' found');
const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2700}-\u{27BF}✨⭐]/u;
ok('zero emoji characters in the rendered shelf',
   !emojiRe.test(await pg.evaluate(() => document.getElementById('shopStyleContent').innerText)));

console.log('\n10. Complete the Look lost its gold tile with the emoji');
await pg.evaluate(() => { show('s-photo-res'); document.getElementById('s-photo-res').classList.add('rv-open');
  _renderShop([{ category: 'accessory', name: 'Silk Neck Scarf', search: 'silk neck scarf', store: 'Nordstrom', why: 'a finishing touch' }]); });
await pg.waitForTimeout(400);
r = await pg.evaluate(() => ({ rows: document.querySelectorAll('#pShopList .shoprow').length,
  tiles: document.querySelectorAll('#pShopList .shoprow .si').length,
  txt: document.getElementById('pShopList').innerText }));
ok('the row still renders', r.rows === 1);
ok('the gold tile is gone', r.tiles === 0);
ok('and with it the sparkle that was the accessory icon', !emojiRe.test(r.txt));

// ── 11. The surfaces that never had an icon still do not ────────────────────
console.log('\n11. The no-icon surfaces are untouched');
ok('_shopCard still takes an optional icon slot (wantlist uses it)',
   /_shopCard\(item,\s*top\)/.test(HTML) && /shop-want-for/.test(HTML));
ok('wardrobe Ideas and See-more still pass none', (HTML.match(/_shopCard\(item\)/g) || []).length >= 2);

// ── 12. Contrast, overflow, errors ──────────────────────────────────────────
console.log('\n12. Readable, and it fits every phone');
await openShop(pg, 'quiz');
const lum = c => { const [r0,g0,b0] = c.match(/\d+/g).slice(0,3).map(Number).map(v => { v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4); }); return .2126*r0+.7152*g0+.0722*b0; };
const paint = await pg.evaluate(() => {
  const bgOf = el => { let n = el; while (n) { const c = getComputedStyle(n).backgroundColor;
    if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; n = n.parentElement; } return 'rgb(255,255,255)'; };
  const g = s => { const e = document.querySelector(s); return e ? { fg: getComputedStyle(e).color, bg: bgOf(e) } : null; };
  const n = document.getElementById('ssAskNow'); if (n) { n.style.display = ''; }
  return { vox: g('#ssAsk .sa-vox'), esc: g('#s-shopstyle .ss-shop-talk'), go: g('#ssAsk .sa-go'),
           now: g('#ssAskNow') };
});
for (const [k, v] of Object.entries(paint)) {
  if (!v) { ok(k + ' measured', false); continue; }
  const l1 = lum(v.fg), l2 = lum(v.bg), ratio = (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
  ok(`${k} clears AA against the real painted background`, ratio >= 4.5, ratio.toFixed(2) + ':1');
}
await ctx.close();
for (const w of [390, 375, 360, 320]) {
  const f = await fresh(w); await openShop(f.pg, 'quiz');
  await f.pg.focus('#ssAskIn'); await f.pg.waitForTimeout(250);
  const bad = await f.pg.evaluate(() => {
    const out = [];
    document.querySelectorAll('#ssAsk, #ssAsk *').forEach(e => {
      const r = e.getBoundingClientRect();
      // .sa-row scrolls sideways on purpose; its children may exceed it.
      if (e.closest('.sa-row') && e !== e.closest('.sa-row')) return;
      if (r.width && (r.left < -1 || r.right > innerWidth + 1)) out.push(e.className || e.tagName);
    });
    return { out, scroll: document.documentElement.scrollWidth > innerWidth + 1 };
  });
  ok(`${w}px: nothing in the ask overflows`, bad.out.length === 0, bad.out.join(','));
  ok(`${w}px: no sideways page scroll`, !bad.scroll);
  await f.ctx.close();
}
ok('zero JS errors anywhere', errs.length === 0, errs.slice(0, 3).join(' | '));

await b.close(); srv.close();
console.log(failn ? `\n✗ ${failn} FAILED, ${pass} passed` : `\nall ${pass} checks passed`);
process.exit(failn ? 1 : 0);
