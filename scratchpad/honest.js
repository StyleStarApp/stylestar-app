// honest.js — "I couldn't find it", the honest line when an ask cannot be served.
//
// Her call, 2026-08-24: "6 cards for something no store carries is worse than an
// honest line." ▶ AND THE CAUSE WAS NEVER MODEL DRIFT: the ask prompt said
// "Suggest 6 specific shoppable pieces that are exactly that." Six, with no
// escape — so with nothing honest to say the model could only disobey or invent,
// and it invented. Same shape as the 2026-08-22 chat bug, where the searching
// rules demanded a bracketed address with no results to copy one from.
//
// ⚠️ SCOPED TO THE ASK BOX. The other four card surfaces pick from her whole
// world, where "nothing exists" is essentially never true, so permission to come
// up short there would only thin good shelves. Part 1 pins that scoping — it is
// the assertion most likely to matter later, because the cheapest way to "improve"
// this feature would be to spread it, and that would make the app apologetic.
//
// Run: node scratchpad/honest.js
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = 8996;
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

/* ═══ PART 1 · the prompt, and above all its SCOPING ═══════════════════════ */
console.log('\n1. The escape hatch exists, and only where it should');

ok('_honestyRule exists', /function _honestyRule/.test(HTML));
const rule = (HTML.match(/function _honestyRule\(\)\{[\s\S]*?\n\}/) || [''])[0];
ok('it says she does NOT have to return 6', /do NOT have to return 6/.test(rule));
ok('it allows an empty items array', /empty items array/.test(rule));
ok('a short answer MUST carry a note', /MUST also return a "note"/.test(rule));
ok('and it is framed as a LAST RESORT, not a shortcut',
   /LAST RESORT/.test(rule) && /prefer showing her what you CAN find/i.test(rule));

// ⚠️ HER WORDING, and the two edits she approved. Pinned by exact string so a
// later "tidy" cannot quietly reintroduce either problem.
// ⚠️ These assert the rule's RUNTIME OUTPUT, never the source text. The source
// builds it by concatenation, so her sentences are not contiguous there and a
// source-matching assertion fails on perfectly correct code -- which is exactly
// what it did on the first run. What the MODEL receives is the real claim anyway.
const runRule = ask => { const f = new Function('_ssAsk', rule + '\nreturn _honestyRule();'); return f(ask); };
const emitted = runRule('neon gym bag');
ok('it emits nothing at all when there is no ask', runRule('') === '');
ok('HER LINE: the near-things sentence is hers, verbatim',
   emitted.includes("I couldn't find real neon gym bags today. Would you be open to browsing something else?"));
ok('HER LINE: the nothing-near sentence is hers, verbatim',
   emitted.includes("That's not something I can shop well for you right now."));
ok('EDIT 1: it never claims to have checked "any stores" — the app only knows HERS',
   !/in any stores/i.test(emitted));
ok('EDIT 2: it never says "having trouble" — that is the CHAT\'S ERROR message, so a woman would read a judgment as a malfunction',
   !/having trouble/i.test(emitted) && /I'm having a moment/.test(HTML));

// scoping: the ask prompt gets it, the four browsing prompts must not
// ⚠️ 2026-08-25: this used to anchor on `prompt='You are Catherine...`, and the
// ask branch became a builder function (_mkQuiz) so the prompt could be rebuilt
// with less store detail when it approaches style-ai's 32KB hard cap. The regex
// then matched NOTHING and three assertions failed against an empty string.
// Anchored on _askedForLead() itself now -- the thing that actually marks this
// as the ask prompt -- and guarded, because an empty match is the difference
// between a real failure and a test measuring nothing.
const askPrompt = (HTML.match(/_mkQuiz\s*=\s*function[\s\S]*?"store":"Store Name"\}\]\}';/) || [''])[0];
ok('the ASK prompt was actually found (or the three below prove nothing)', askPrompt.length>500, askPrompt.length);
ok('the ASK prompt calls the rule', /_honestyRule\(\)/.test(askPrompt));
ok('the ASK prompt\'s schema carries "note"', /\{"note":""/.test(askPrompt));
ok('the schema tells it note is only for a short answer',
   /note" only when you returned fewer than 6/.test(askPrompt));
ok('SCOPING: _honestyRule is wired into exactly ONE prompt',
   (HTML.match(/\+_honestyRule\(\)/g) || []).length === 1,
   String((HTML.match(/\+_honestyRule\(\)/g) || []).length));
ok('SCOPING: the four browsing prompts still demand their six',
   (HTML.match(/suggest 6 specific shoppable items/gi) || []).length >= 2);

/* ═══ PART 2 · what she actually sees ══════════════════════════════════════ */
console.log('\n2. On the real screen');

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errs = [];
let REPLY = { items: [] };
let CALLS = 0;

async function fresh(w, prefs) {
  const ctx = await b.newContext({ viewport: { width: w || 390, height: 844 } });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push(e.message));
  await pg.route(u => u.pathname.includes('style-ai'),
    r => { CALLS++; r.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ content: [{ text: JSON.stringify(REPLY) }] }) }); });
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2300);
  // ⚠️ HARNESS TRAP, and it cost a hang before it was found: seeding `prefs:{}`
  // is a shape the APP NEVER PRODUCES. getPrefsForPrompt reaches for
  // prefs.sizes.tops, so a bare object throws "Cannot read properties of
  // undefined" before the try block is even entered -- which looks exactly like
  // the fetch hanging, because the spinner is already on screen and nothing
  // clears it. Seed the real default (index.html's own `let prefs = {...}`) and
  // override only what a case needs. Third sighting of a seed-shape trap.
  await pg.evaluate(p => {
    const base = { sizes: {}, colorsLove: [], neverWear: [], neverPatterns: [],
                   neverOther: '', jewelry: '', dailyShoes: '', bagStyle: '', otherNotes: '' };
    localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath',
      answers: new Array(12).fill(6), topArchNames: ['The Timeless Classic'],
      portrait: 'p', motto: 'm', prefs: Object.assign(base, p || {}) }));
  }, prefs || {});
  await pg.reload(); await pg.waitForTimeout(2300);
  await pg.evaluate(() => { const c = document.querySelector('.hm-entrance'); if (c) c.remove(); });
  return { ctx, pg };
}
// drive the REAL entry point, then type into the REAL ask box — the 2026-08-24
// harness lesson: _openShopStyleNow clears #ssAskIn, and the prompt reads the
// GLOBAL _ssAsk, so a harness that only fills the input measures nothing.
async function ask(pg, text) {
  await pg.evaluate(t => { window._ssAsk = t; _openShopStyleNow('quiz'); }, text);
  // ⚠️ Wait on the SHELF rather than on a card -- half these cases deliberately
  // have none. And ATTACHED, not visible: an empty .shop-grid has zero height,
  // so Playwright's default visibility check calls it hidden and times out on a
  // page that rendered perfectly. Another "the harness fails on correct code".
  await pg.waitForSelector('#shopStyleContent .shop-grid', { state: 'attached', timeout: 20000 });
  await pg.waitForTimeout(200);
}
const read = pg => pg.evaluate(() => {
  const n = document.querySelector('#shopStyleContent .shop-honest');
  const g = document.querySelector('#shopStyleContent .shop-grid');
  return {
    note: n ? n.textContent.trim() : null,
    hasLink: !!(n && n.querySelector('.shop-honest-go')),
    cards: document.querySelectorAll('#shopStyleContent .shop-card').length,
    noteBeforeGrid: !!(n && g && (n.compareDocumentPosition(g) & Node.DOCUMENT_POSITION_FOLLOWING)),
  };
});

const item = (n, s) => ({ category: 'bag', name: n, search: s, store: 'Nordstrom' });

// (a) a full, honest six — the note must not appear at all
REPLY = { items: [item('Canvas Tote','canvas tote'), item('Leather Satchel','leather satchel'),
                  item('Nylon Crossbody','nylon crossbody'), item('Top Handle Bag','top handle bag'),
                  item('Quilted Shoulder Bag','quilted shoulder bag'), item('Woven Clutch','woven clutch')] };
let { ctx, pg } = await fresh(390);
await ask(pg, 'bags');
let v = await read(pg);
ok('a full six shows NO honest line', v.note === null && v.cards === 6, JSON.stringify(v));

// (b) a short answer with a note — the line leads, the cards follow
REPLY = { note: "I couldn't find real neon gym bags today. Would you be open to browsing something else?",
          items: [item('Canvas Gym Bag','canvas gym bag'), item('Nylon Duffle','nylon duffle')] };
await ask(pg, 'neon gym bag');
v = await read(pg);
ok('a short answer shows her line', /couldn.t find real neon gym bags today/i.test(v.note || ''), v.note);
ok('...above the shelf, not below it', v.noteBeforeGrid, JSON.stringify(v));
ok('...and the pieces it DID find are still shown', v.cards === 2, String(v.cards));
ok('...with no chat link, because there IS something to look at', !v.hasLink);

// ⚠️ THE RESUME. A woman taps out to a store and comes back; the app re-renders
// the SAME picks through the SAME path and never asks the model again. Without
// the note riding along in storage, her honest line would silently vanish on the
// way back, leaving a two-card shelf with nothing explaining why it is short.
// ⚠️ Checked HERE, after a case that really saved. Checking it after an
// empty-shelf case fails for a correct reason -- _saveShopPicks stores nothing
// when there are no picks, because there is nothing to come back to.
const saved = await pg.evaluate(() => JSON.parse(localStorage.getItem('ss_shoppicks') || 'null'));
ok('the saved session carries her note', /neon gym bags/i.test((saved || {}).n || ''), JSON.stringify(saved && saved.n));
const before = CALLS;
const resumed = await pg.evaluate(async () => {
  window._shopResume = JSON.parse(localStorage.getItem('ss_shoppicks'));
  await _shopStyleGen();
  const n = document.querySelector('#shopStyleContent .shop-honest');
  return { note: n ? n.textContent.trim() : null,
           cards: document.querySelectorAll('#shopStyleContent .shop-card').length };
});
ok('coming back from a store still shows her line', /neon gym bags/i.test(resumed.note || ''), resumed.note);
ok('...with the same pieces', resumed.cards === 2, String(resumed.cards));
ok('...and without asking the model again', CALLS === before, `${CALLS - before} extra call(s)`);

// (c) nothing at all — the line plus a way onward
REPLY = { note: "That's not something I can shop well for you right now.", items: [] };
await ask(pg, 'a solid gold gym bag');
v = await read(pg);
ok('nothing found shows her second line', /shop well for you right now/i.test(v.note || ''), v.note);
ok('...and offers the stylist, because a dead end was the whole objection', v.hasLink);
ok('...and there are no cards', v.cards === 0, String(v.cards));
const wentToChat = await pg.evaluate(async () => {
  document.querySelector('#shopStyleContent .shop-honest-go').click();
  await new Promise(r => setTimeout(r, 600));
  return document.getElementById('s-chat').classList.contains('act');
});
ok('...and the link really opens the chat', wentToChat);

// (d) 🚨 THE PRE-EXISTING HOLE: filterNeverWear runs AFTER the model answers, so a
// never-wear list that happens to catch every pick used to leave a bare empty grid
// with a refresh button and nothing explaining it.
await ctx.close();
REPLY = { items: [item('Ribbed Knit Tank','ribbed tank'), item('Ribbed Cotton Tank','ribbed cotton tank')] };
({ ctx, pg } = await fresh(390, { neverWear: ['ribbed'] }));
await ask(pg, 'tank tops');
v = await read(pg);
ok('EMPTY SHELF: her never-wear list catching everything is explained, not silent',
   v.note !== null && v.cards === 0, JSON.stringify(v));
ok('...and it offers the stylist too', v.hasLink);

// (f) the note is model output landing in innerHTML
REPLY = { note: '<img src=x onerror="window.__pwn=1">Nope.', items: [] };
await ask(pg, 'xss');
const pwn = await pg.evaluate(() => ({ pwn: !!window.__pwn,
  imgs: document.querySelectorAll('#shopStyleContent .shop-honest img').length }));
ok('a note is escaped — no injected markup runs', !pwn.pwn && pwn.imgs === 0, JSON.stringify(pwn));

// (g) readable, and inside the page, at every width
REPLY = { note: "I couldn't find real neon gym bags today. Would you be open to browsing something else?",
          items: [item('Canvas Gym Bag','canvas gym bag')] };
const lum = c => { const [r,g,bl] = c.match(/\d+/g).map(Number).map(x => { x /= 255;
  return x <= 0.03928 ? x/12.92 : Math.pow((x+0.055)/1.055, 2.4); });
  return 0.2126*r + 0.7152*g + 0.0722*bl; };
for (const w of [390, 360, 320]) {
  await ctx.close();
  ({ ctx, pg } = await fresh(w));
  await ask(pg, 'neon gym bag');
  const m = await pg.evaluate(() => {
    const n = document.querySelector('#shopStyleContent .shop-honest');
    const r = n.getBoundingClientRect(), cs = getComputedStyle(n);
    // the painted background behind it, walked up until something is opaque
    let el = n, bg = 'rgba(0, 0, 0, 0)';
    while (el && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) { bg = getComputedStyle(el).backgroundColor; el = el.parentElement; }
    return { color: cs.color, bg, font: cs.fontFamily, style: cs.fontStyle, size: parseFloat(cs.fontSize),
             left: r.left, right: r.right, vw: innerWidth,
             scrollW: document.documentElement.scrollWidth };
  });
  const L1 = lum(m.color), L2 = lum(m.bg);
  const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  ok(w + 'px: the line clears AA on the real painted paper', ratio >= 4.5, ratio.toFixed(2) + ':1');
  ok(w + 'px: it sits inside the screen', m.left >= 0 && m.right <= m.vw + 0.5, `${m.left}–${m.right} of ${m.vw}`);
  ok(w + 'px: nothing pushes the page sideways', m.scrollW <= m.vw + 1, `${m.scrollW} vs ${m.vw}`);
  if (w === 390) {
    // ⚠️ HER VOICE RULE (2026-08-13): on light paper she is Lora UPRIGHT 15.5 in
    // the readable ink. No italics — they cost readability on an 18-to-80 audience.
    ok('her voice: Lora, upright, 15.5px', /Lora/.test(m.font) && m.style === 'normal' && Math.abs(m.size - 15.5) < 0.6,
       `${m.font} ${m.style} ${m.size}`);
    // NO PINK HEART: a heart means Catherine herself is speaking; this is the
    // stylist reporting on a search she just ran. Her own mark system.
    const heart = await pg.evaluate(() => document.querySelectorAll('#shopStyleContent .shop-honest svg, #shopStyleContent .shop-honest .pinkheart').length);
    ok('no pink heart — this is the stylist speaking, not Catherine', heart === 0, String(heart));
  }
}

ok('zero JS errors throughout', errs.length === 0, errs.join(' | '));

await ctx.close(); await b.close(); srv.close();
console.log(`\n${pass} passed, ${failn} failed`);
process.exit(failn ? 1 : 0);
