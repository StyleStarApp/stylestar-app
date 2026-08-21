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
const openShop = async (pg, mode) => {
  await pg.evaluate(m => _openShopStyleNow(m), mode || 'quiz');
  await pg.waitForSelector('#shopStyleContent .shop-card', { timeout: 20000 });
};

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
await openShop(pg);
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
    voxFont: getComputedStyle(document.querySelector('#ssAsk .sa-vox')).fontFamily,
    voxStyle: getComputedStyle(document.querySelector('#ssAsk .sa-vox')).fontStyle,
  };
});
ok('the ask is on screen', r.visible);
// It must live outside #shopStyleContent: that container's innerHTML is replaced on
// every generate, so an input inside it would lose her typing on her own refresh.
ok('it lives OUTSIDE the container that gets re-rendered', r.outside);
ok('the chips are hidden until she taps in', r.chipsHidden);
ok('the placeholder comes from the ring', /^Try: /.test(r.placeholder), r.placeholder);
ok('the six pieces render without her touching it', r.cards > 0, r.cards + ' cards');
// Her mark system: pink HEART = Catherine speaking, pink STAR = the stylist working.
// This screen is the stylist working, which is why its loader star is pink too.
ok('the mark is the stylist PINK STAR', r.star);
ok('...and NOT her pink heart', !r.heart);
ok('the sentence is in her light-paper voice (Lora, upright)',
   /Lora/.test(r.voxFont) && r.voxStyle !== 'italic', r.voxFont + ' / ' + r.voxStyle);

// ── 3. Tapping in reveals the chips; a chip fills the box ───────────────────
console.log('\n3. Tap in — chips appear, and a chip FILLS the box');
await pg.focus('#ssAskIn'); await pg.waitForTimeout(250);
r = await pg.evaluate(() => ({
  shown: getComputedStyle(document.getElementById('ssAskMore')).display !== 'none',
  occ: [...document.querySelectorAll('#ssAskOcc .sa-chip')].map(e => e.textContent),
  cat: [...document.querySelectorAll('#ssAskCat .sa-chip')].map(e => e.textContent),
}));
ok('both chip rows appear on focus', r.shown);
ok('occasion row first, and it leads with her testers\' words',
   r.occ[0] === 'For an event', r.occ.join('|'));
ok('category row present', r.cat.includes('Dresses'), r.cat.join('|'));
await pg.click('#ssAskOcc .sa-chip');
r = await pg.evaluate(() => ({ v: document.getElementById('ssAskIn').value,
  focused: document.activeElement && document.activeElement.id === 'ssAskIn' }));
// A chip FILLS rather than fires: an occasion is ambiguous (a garden party and a
// black-tie gala are both events), so she finishes the sentence, we don't guess.
ok('the chip fills the box rather than running a search', /^for an event\s*$/.test(r.v), JSON.stringify(r.v));
ok('...and focus stays put so the keyboard does not drop', r.focused);

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
const seen = [];
for (let i = 0; i < 5; i++) { await openShop(pg, 'quiz'); seen.push(await pg.evaluate(() => document.getElementById('ssAskIn').placeholder)); }
ok('a different example on each visit', new Set(seen.slice(0, 4)).size === 4, seen.join(' | '));
ok('the ring wraps round to the first', seen[4] === seen[0]);
const before = await pg.evaluate(() => document.getElementById('ssAskIn').placeholder);
await pg.click('.shop-refresh-btn'); await pg.waitForTimeout(1500);
// Advanced in _openShopStyleNow, never in _shopStyleGen, so a refresh cannot shuffle
// it under her fingers — the same reasoning that holds the subtitle still.
ok('a refresh does NOT shuffle it', (await pg.evaluate(() => document.getElementById('ssAskIn').placeholder)) === before);

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
  return { vox: g('#ssAsk .sa-vox'), esc: g('#ssAsk .sa-esc'), chip: g('#ssAsk .sa-chip') };
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
