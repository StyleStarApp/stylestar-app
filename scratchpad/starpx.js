// starpx.js — THE STAR OF THE WEEK PHOTO CROP, BOTH KINDS (2026-09-07).
//
// Cath, on her phone: "the bag is sitting too low and looks cut off at the
// bottom." Rendering the whole queue to check for the same fault turned up a
// SECOND one on the Crosbie Jean, and the two need different fixes:
//
//   pxPos (object-position) — the photo is TALLER than the 3:4 frame, so the
//     frame shows a window of it. The only question is which end to keep. The
//     Serpui bag has 19.2% empty headroom and nothing below, so the default
//     "top center" spent the window on the emptiness and cut 10.6% off the bag.
//
//   pxFit (object-fit) — the photo is NARROWER than the frame and the garment
//     fills it edge to edge, so `cover` must trim something wherever it is
//     anchored. No position fixes the Crosbie Jean; only `contain` does.
//
// 🚨 AND BOTH ARE FIXED ON EVERY SURFACE THE PHOTO APPEARS ON. The same file
// renders on the Star card (.wks-px) and in the Edit (.dc-item-px), which share
// the same 3:4 top-anchored crop. A fix on one is the same photo right on one
// screen and cut off on the next -- this file's oldest lesson, in pixels.
//
// Run: node scratchpad/starpx.js
import fs from 'fs';
import vm from 'vm';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
let pass = 0, failn = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { failn++; console.log('  ✗ FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
function grab(name) {
  const start = src.indexOf('function ' + name + '(');
  if (start < 0) throw new Error('missing ' + name);
  let i = src.indexOf('{', start), depth = 0, end = -1;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) { end = j; break; } }
  }
  return src.slice(start, end + 1);
}
function literal(decl, open, close) {
  const start = src.indexOf(decl);
  let i = src.indexOf(open, start), depth = 0, end = -1, inStr = null, esc = false, inLine = false;
  for (let j = i; j < src.length; j++) {
    const c = src[j], n = src[j + 1];
    if (inLine) { if (c === '\n') inLine = false; continue; }
    if (inStr) { if (esc) { esc = false; continue; } if (c === '\\') { esc = true; continue; } if (c === inStr) inStr = null; continue; }
    if (c === '/' && n === '/') { inLine = true; j++; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === open) depth++; else if (c === close) { depth--; if (depth === 0) { end = j; break; } }
  }
  return src.slice(i, end + 1);
}

// ⚠️ URL must be in the sandbox: _affMid does `new URL(u)`, and without the
// global it throws into its own try/catch, returns '' and _wkStarPxTag renders
// NOTHING -- which looks exactly like a broken fix instead of a broken harness.
const ctx = {console, URL};
vm.createContext(ctx);
vm.runInContext(
  grab('_esc') + '\n' +
  'var _AFF_MID=' + literal('var _AFF_MID=', '{', '}') + ';\n' +
  grab('_affMid') + '\n' +
  grab('_wlSafeUrl') + '\n' +
  'var _OWN_PX_RE=' + /^stars\/[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp)$/i.toString() + ';\n' +
  grab('_wkStarPxTag') + '\n' +
  'var WEEK_STARS=' + literal('var WEEK_STARS=[', '[', ']') + ';\n', ctx);

const tag = (o) => vm.runInContext('_wkStarPxTag(' + JSON.stringify(o) + ',"wks-px")', ctx);
const stars = vm.runInContext('WEEK_STARS', ctx);
const find = (re) => stars.find(x => re.test(x.n));

console.log('\nPART 1 — the bag: keep the bottom, not the empty top');
const bag = find(/Serpui/);
ok('the queue entry carries her crop', bag && bag.pxPos === 'center bottom', bag && bag.pxPos);
const bagTag = tag(bag);
ok('the rendered <img> asks for it', /object-position:center bottom/.test(bagTag), bagTag);
ok('and does NOT force a fit it does not need', !/object-fit/.test(bagTag));

console.log('\nPART 2 — the jean: a fit, because no position can save it');
const jean = find(/Crosbie/);
ok('the queue entry carries contain', jean && jean.pxFit === 'contain', jean && jean.pxFit);
const jeanTag = tag(jean);
ok('the rendered <img> asks for it', /object-fit:contain/.test(jeanTag), jeanTag);

console.log('\nPART 3 — the same photo must not differ between screens');
for (const [label, re, want] of [
  ['the bag', /12866-ABIGAIL-WK/, 'object-position:center bottom'],
  ['the jean', /2608_J26FA0156_MEMORY_LANE_FLAT/, 'object-fit:contain'],
]) {
  const line = src.split('\n').find(l => l.includes('dc-item-px') && re.test(l));
  ok(label + ' is fixed in the Edit too', !!line && line.includes(want.split(':')[0] + ':' + want.split(':')[1]),
     line ? line.slice(line.indexOf('<img'), line.indexOf('src=')) : 'no Edit copy found');
}

console.log('\nPART 4 — an unstyled item is left exactly as it was');
// ⚠️ px2 EXCLUDED HERE ON PURPOSE (2026-09-08): a stacked entry renders a DIV, not
// a bare <img>, so it is not what "an unstyled item is left exactly as it was" is
// about. Without this the check would silently start testing the wrong thing the
// moment a stacked piece happened to sort first — a quiet change of meaning, which
// is the failure mode this suite exists to catch in the app.
const plain = stars.find(x => (x.px || x.ownPx) && !x.pxPos && !x.pxFit && !x.px2);
ok('there is still such an item to check', !!plain);
ok('it renders with NO style attribute at all', !/style=/.test(tag(plain)), tag(plain));

console.log('\nPART 5 — the fit is whitelisted, not passed through');
ok('a junk fit is dropped', !/object-fit/.test(tag(Object.assign({}, bag, {pxFit: 'fill;background:url(x)'}))));
ok('"cover" is allowed', /object-fit:cover/.test(tag(Object.assign({}, bag, {pxFit: 'cover'}))));
// A quote in a crop value must be ESCAPED, not able to close the attribute and
// start a new one. _esc turns it into &quot;, so the style value holds no raw
// quote at all -- assert exactly that rather than pattern-matching the whole tag.
{
  const t = tag(Object.assign({}, bag, {pxPos: 'center "x'}));
  const m = /style="([^"]*)"/.exec(t);
  ok('a quote in a crop value is escaped, not able to break the attribute',
     !!m && m[1].indexOf('&quot;') >= 0 && m[1].indexOf('"') < 0, m && m[1]);
}
ok('both together render together',
   /object-fit:contain;object-position:center bottom/.test(tag(Object.assign({}, bag, {pxFit: 'contain'}))));

console.log('\nPART 6 — the stacked pair (her idea, 2026-09-08)');
// A wide, short object leaves a 3:4 card two-thirds empty, and neither pxPos nor
// pxFit can touch that: pxPos picks which END of a too-tall photo to keep, pxFit
// chooses whether to letterbox, and both assume the piece FILLS its photo.
const glasses = find(/Saint Laurent SL M136/);
ok('the entry carries a second view', !!(glasses && glasses.px2), glasses && glasses.px2);
const gTag = tag(glasses);
ok('it renders as a stack, not a lone image', /^<div class="wks-px is-stack">/.test(gTag), gTag.slice(0, 90));
ok('both views are in it', (gTag.match(/<img /g) || []).length === 2);
ok('the FRONT view is on top and the angled one below',
   gTag.indexOf('1229377') < gTag.indexOf('1229376'), gTag.slice(0, 200));
ok('the second view has its own alt, not a duplicate of the first',
   /alt="Side view showing the gold YSL monogram on the arm"/.test(gTag));
// 🚨 THE LICENSING GATE MUST COVER BOTH HALVES. px is gated on _affMid because an
// approval is what licenses a retailer's photograph; a px2 that slipped past that
// would be an unlicensed image on the same card.
ok('px2 is gated on the affiliate approval exactly as px is',
   !/is-stack/.test(tag(Object.assign({}, glasses, {url: 'https://www.nordstrom.com/s/1'}))),
   tag(Object.assign({}, glasses, {url: 'https://www.nordstrom.com/s/1'})).slice(0, 80));
ok('a javascript: second view is refused', !/is-stack/.test(
   tag(Object.assign({}, glasses, {px2: 'javascript:alert(1)'}))));
ok('an entry with NO px2 still renders a plain <img>', /^<img /.test(tag(bag)));
// pxPos / pxPos2 steer the two halves independently.
{
  const t = tag(Object.assign({}, glasses, {pxPos: 'center top', pxPos2: 'center 40%'}));
  ok('pxPos steers the TOP half', /1229377[^>]*object-position:center top/.test(t) ||
     /object-position:center top[^>]*1229377/.test(t), t.slice(0, 220));
  ok('pxPos2 steers the BOTTOM half', /object-position:center 40%/.test(t));
}
{
  const t = tag(Object.assign({}, glasses, {px2Alt: 'a "quoted" view'}));
  const m = /alt="([^"]*)"/g; let last; while (true) { const r = m.exec(t); if (!r) break; last = r[1]; }
  ok('a quote in the second alt is escaped', last.indexOf('&quot;') >= 0 && last.indexOf('"') < 0, last);
}

console.log('\nPART 7 — and the Edit shows the SAME pair (a rule applied to one half is not applied)');
{
  // The Star card and the Edit render the same piece off two classes that share one
  // 3:4 geometry. A stack on one and a single photo on the other is the Serpui bag
  // cut off on one screen and right on the next, in a new costume.
  const block = src.slice(src.indexOf('Saint Laurent SL M136 Sunglasses</div>') - 2200,
                          src.indexOf('Saint Laurent SL M136 Sunglasses</div>'));
  ok('the Edit copy is a stack too', /class="dc-item-px is-stack"/.test(block));
  ok('...with both the same two photos', /1229377/.test(block) && /1229376/.test(block));
  ok('...in the same order, front first', block.indexOf('1229377') < block.indexOf('1229376'));
  const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
  ok('ONE css rule covers both surfaces, never one each',
     /\.wks-px\.is-stack,\.dc-item-px\.is-stack/.test(css) &&
     /\.wks-px\.is-stack>img,\.dc-item-px\.is-stack>img/.test(css));
  ok('each half is a half-height cover box anchored to the bottom',
     /\.is-stack>img[^}]*height:50%/.test(css) &&
     /\.is-stack>img[^}]*object-position:center bottom/.test(css));
}

console.log('\n' + (failn ? '✗ ' + failn + ' FAILED, ' : '✓ ') + pass + ' checks passed');
process.exit(failn ? 1 : 0);
