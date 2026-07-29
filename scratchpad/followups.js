// Verification for the four product follow-ups (2026-07-29):
//   1. startQ() resets cur — restarting the quiz can't scramble the answers
//   2. colorsSkip is gone — no dead field, no prompt promising it
//   3. filterNeverWear() — AI results are validated against her never-wear list
//   4. Plausible custom events fire (and carry no personal data)
//
// Drives the REAL index.html in Chromium with style-ai stubbed.
//
//   node scratchpad/followups.js
//
import http from 'http';
import fs from 'fs';
import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const PORT = 8898, ORIGIN = 'http://localhost:' + PORT;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, ORIGIN);
  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML);
    return;
  }
  const f = path.join(ROOT, url.pathname.replace(/^\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200); res.end(fs.readFileSync(f)); return; }
  res.writeHead(404); res.end('');
});
await new Promise(r => server.listen(PORT, r));

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
// Capture every Plausible event before the app's queue shim can claim the name.
await ctx.addInitScript(() => {
  window._ev = [];
  window.plausible = (n, o) => window._ev.push([n, (o && o.props) || null]);
  window.plausible.init = () => {};
});
const errors = [];
const page = await ctx.newPage();
page.on('pageerror', e => errors.push(String(e)));

// The style-ai stub's reply is settable per test section.
let aiText = 'stub';
await page.route('**/.netlify/functions/style-ai', r =>
  r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [{ text: aiText }] }) }));
await page.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
await page.goto(ORIGIN + '/', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.startQ === 'function');

// ---------------------------------------------------------------------------
console.log('\n1. Restarting the quiz can no longer scramble her answers');
await page.evaluate(() => {
  startQ();
  // She answers four questions…
  for (let i = 0; i < 4; i++) { document.getElementById('sl').value = 9; nextQ(); }
});
ok('mid-quiz she is on question 5', await page.evaluate(() => cur) === 4);
// …then leaves without finishing (browser Back / a footer link — anything
// that isn't prevQ all the way out) and starts the quiz again.
await page.evaluate(() => { show('s-wel'); startQ(); });
ok('the restart really shows question 1', await page.evaluate(() =>
  document.getElementById('pl').textContent) === '1 of 12');
ok('and cur is reset to 0 (the bug)', await page.evaluate(() => cur) === 0);
await page.evaluate(() => { document.getElementById('sl').value = 2; onSl(2); });
ok('moving the slider writes to answers[0], not answers[4]',
   await page.evaluate(() => answers[0]) === 2);
ok("…and question 5's earlier answer is untouched",
   await page.evaluate(() => answers[4]) !== 2);
await page.evaluate(() => { document.getElementById('sl').value = 2; nextQ(); });
ok('Continue goes to question 2, not question 6', await page.evaluate(() =>
  document.getElementById('pl').textContent) === '2 of 12');

// ---------------------------------------------------------------------------
console.log('\n2. colorsSkip is gone everywhere');
ok('no colorsSkip field in the code (only the tombstone comment)',
   (HTML.match(/colorsSkip/g) || []).length === 1);
ok('no prompt claims "colors she skips"', !/colors she skips/i.test(HTML));
ok('no prompt claims "colors she avoids"', !/colors she avoids/i.test(HTML));
ok('the dead .color-dot.hate styling is gone', !/color-dot\.hate/.test(HTML));
// The dots still work, loves-only: tap = love, tap again = clear, never a ✕.
const dot = await page.evaluate(() => {
  const div = document.createElement('div');
  renderPrefColors(div);
  const d = div.querySelector('.color-dot');
  d.click(); const afterOne = d.className;
  d.click(); const afterTwo = d.className;
  return { afterOne, afterTwo };
});
ok('tapping a color marks it loved', /\blove\b/.test(dot.afterOne), dot.afterOne);
ok('tapping again clears it', !/\blove\b/.test(dot.afterTwo), dot.afterTwo);
ok('no tap state ever says hate', !/hate/.test(dot.afterOne + dot.afterTwo));
ok('an OLD saved profile with a colorsSkip key still builds a prompt safely',
   await page.evaluate(() => {
     prefs.colorsSkip = ['Red']; // simulating a pre-change localStorage blob
     const p = getPrefsForPrompt();
     delete prefs.colorsSkip;
     return !/Colors to avoid/.test(p);
   }));

// ---------------------------------------------------------------------------
console.log('\n3. filterNeverWear really is the guarantee');
const f = (items, nw, np, no) => page.evaluate(({ items, nw, np, no }) => {
  prefs.neverWear = nw; prefs.neverPatterns = np; prefs.neverOther = no;
  return filterNeverWear(items).map(i => i.name);
}, { items, nw, np, no });
let out = await f([
  { name: 'Leopard Midi Skirt', search: 'leopard midi skirt' },
  { name: 'White Silk Blouse', search: 'white silk blouse' },
  { name: 'Chic Ballet Flats', search: 'leopard ballet flats' },
  { name: 'Animal Print Scarf', search: 'silk scarf' },
  { name: 'Neon Green Tank', search: 'neon green tank' },
  { name: 'Cropped Tan Suede Jacket', search: 'cropped suede jacket' }
], ['Leopard'], ['Animal print'], 'no crop tops, neon');
ok('a never-wear chip drops a matching name', !out.includes('Leopard Midi Skirt'), out.join(', '));
ok('…and a matching SEARCH term, even with a clean name', !out.includes('Chic Ballet Flats'));
ok('a pattern chip drops a match', !out.includes('Animal Print Scarf'));
ok('a free-text hard no drops a match ("neon")', !out.includes('Neon Green Tank'));
ok('clean items survive', out.includes('White Silk Blouse'));
ok('"no crop tops" does NOT kill a cropped jacket (phrase, not words)',
   out.includes('Cropped Tan Suede Jacket'), out.join(', '));
out = await f([{ name: 'Perfect Skinny Jean', search: 'dark skinny jean' }], ['Skinny jeans'], [], '');
ok('a plural chip catches the singular item', out.length === 0, out.join(', '));
out = await f([{ name: 'Leopard Coat' }, { name: 'Trench' }], [], [], '');
ok('with no never-wears, nothing is filtered', out.length === 2);
ok('a non-array becomes an empty list, not a crash',
   await page.evaluate(() => Array.isArray(filterNeverWear(null)) && filterNeverWear(null).length === 0));

// And on the real render path: Shop-your-style picks with a violation baked in.
await page.evaluate(() => {
  prefs.neverWear = ['Leopard']; prefs.neverPatterns = []; prefs.neverOther = '';
  quizTaken = true; topArchNames = ['Timeless Classic'];
});
aiText = JSON.stringify({ items: [
  { category: 'top', name: 'Ribbed Cream Tank', search: 'ribbed cream tank', store: 'Nordstrom' },
  { category: 'shoes', name: 'Leopard Print Pumps', search: 'leopard print pumps', store: 'Nordstrom' },
  { category: 'bag', name: 'Tan Leather Satchel', search: 'tan leather satchel', store: 'Madewell' }
] });
await page.evaluate(() => genOutfits('quiz'));
await page.waitForFunction(() => document.querySelectorAll('#shopContent .shop-card').length > 0);
const cards = await page.evaluate(() => ({
  n: document.querySelectorAll('#shopContent .shop-card').length,
  txt: document.getElementById('shopContent').textContent
}));
ok('the AI sent 3 picks, only 2 render', cards.n === 2, 'rendered ' + cards.n);
ok('the leopard pumps never reach the screen', !/leopard/i.test(cards.txt));

// Complete the Look (its own renderer) is guarded too.
await page.evaluate(() => _renderShop([
  { category: 'jacket', name: 'Camel Structured Blazer', search: 'camel blazer', store: 'J.Crew' },
  { category: 'shoes', name: 'Leopard Flats', search: 'leopard flats', store: 'DSW' }
]));
const rows = await page.evaluate(() => ({
  n: document.querySelectorAll('#pShopList .shoprow').length,
  txt: document.getElementById('pShopList').textContent
}));
ok('Complete the Look drops the violation as well', rows.n === 1 && !/leopard/i.test(rows.txt),
   rows.n + ' rows');

// ---------------------------------------------------------------------------
console.log('\n4. Plausible events (anonymous, no personal data)');
const ev = () => page.evaluate(() => window._ev);
let events = await ev();
ok('Quiz Started fired on both starts', events.filter(e => e[0] === 'Quiz Started').length === 2);
const qNums = events.filter(e => e[0] === 'Quiz Question').map(e => e[1] && e[1].question);
ok('each answered question reports its number', JSON.stringify(qNums) === JSON.stringify([1, 2, 3, 4, 1]),
   JSON.stringify(qNums));
// Finish the quiz from question 12 — Quiz Completed fires as the portrait builds.
aiText = 'Your style is quietly confident and warm.';
await page.evaluate(() => { cur = 11; document.getElementById('sl').value = 6; nextQ(); });
events = await ev();
ok('Quiz Completed fired', events.some(e => e[0] === 'Quiz Completed'));

// Preferences: finishing the last refine step is the "saved" moment.
await page.evaluate(() => { prefStep = 4; nextPref(); });
events = await ev();
ok('Preferences Saved fired', events.some(e => e[0] === 'Preferences Saved'));

// An outbound product click reports retailer + surface — from ANY surface,
// including future ones (the listener is delegated, not wired per card).
await page.evaluate(() => {
  const a = document.createElement('a');
  a.href = 'https://www.nordstrom.com/s/some-shoe';
  a.textContent = 'Find it';
  a.addEventListener('click', e => e.preventDefault()); // don't actually leave
  document.querySelector('.scr.act').appendChild(a);
  a.click();
});
events = await ev();
const click = events.find(e => e[0] === 'Product Click');
ok('Product Click fired', !!click);
ok('…with the retailer domain', click && click[1].retailer === 'nordstrom.com', JSON.stringify(click));
ok('…and the screen she was on', click && /^s-/.test(click[1].surface), JSON.stringify(click));
await page.evaluate(() => {
  const a = document.createElement('a');
  a.href = 'https://www.stylestar.app/privacy';
  a.addEventListener('click', e => e.preventDefault());
  document.body.appendChild(a); a.click();
});
events = await ev();
ok('our own pages are never counted as products',
   events.filter(e => e[0] === 'Product Click').length === 1);

// Photo analysis fires its event (and the shop list it renders is filtered —
// belt and braces with section 3's direct _renderShop check).
aiText = JSON.stringify({ celebrate: 'The proportions are lovely.',
  tips: [{ title: 'Add structure', text: 'A blazer sharpens it.' }],
  shop: [{ category: 'jacket', name: 'Camel Blazer', search: 'camel blazer', store: 'J.Crew' }] });
await page.evaluate(() => { photoData = 'x'; photoType = 'image/jpeg'; return runPhotoAnalysis(); });
events = await ev();
ok('Photo Analyzed fired', events.some(e => e[0] === 'Photo Analyzed'));
const flat = JSON.stringify(events);
ok('no event carries an answer, a name, or an email',
   !/Catherine|@|"answers"/.test(flat), flat.slice(0, 200));

// ---------------------------------------------------------------------------
console.log('\n5. No JavaScript errors anywhere in that journey');
ok('zero page errors', errors.length === 0, errors.join(' | '));

console.log('\n' + (fail ? '✗ ' + fail + ' FAILED, ' : '✓ ') + pass + ' passed');
await browser.close();
server.close();
process.exit(fail ? 1 : 0);
