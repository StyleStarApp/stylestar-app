// LIVE model test — her 2026-08-15 catch: the White tops shelf offered a
// "Satin Draped Top" whose search was "white satin top". The name promised
// DRAPED, the search never carried it, and Revolve answered with boxy cotton
// tees. Same bug one card to its left: "Linen Relaxed Top".
//
// This is the name-is-the-search parity rule failing on SILHOUETTE/FIT words.
// The 2026-08-13 live harness classed those as "soft" leftovers and tolerated
// one per surface; her screenshot says they are structural — draped, relaxed,
// oversized and friends change what the piece IS, and a store's results page
// shows the difference immediately.
//
// Runs the REAL captured prompts against the LIVE deployed function (this
// sandbox has no ANTHROPIC_API_KEY; the deployed one does). Costs a few cents
// of the production key per run — the same deliberate trade as every other
// live check in this project.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import path from 'path';
import http from 'http';
import fs from 'fs';

const COLOR_WORDS = ['pink','blue','white','black','red','green','brown','purple','yellow','orange','tan','blush','cream','ivory','navy','gold','silver','beige','camel'];
// Words that change what the garment IS. A results page shows the difference,
// so a name may not promise one unless the search carries it.
const STRUCTURAL = ['button','front','professional','work','career','wrap','bodycon','midi','maxi','mini','pencil','wide','high','cropped','sleeveless','strapless','turtleneck','collar','kitten','block','platform','wedge','going','dressy','sequin','lace','satin','silk','linen','denim','leather','suede','cotton','knit','poplin','crepe','jersey','cashmere','ribbed',
  // ▶ ADDED 2026-08-15 (her catch): silhouette + fit words. "Satin Draped Top"
  // over a search for "white satin top" is the same broken promise as
  // "Satin Button-Front Blouse" over "satin blouse".
  'draped','relaxed','oversized','fitted','boxy','slouchy','tailored','flowy','ruched','structured','slim','straight','tie','peplum','puff','balloon','halter','square','scoop','vneck','v-neck','mock','crew','off-shoulder','one-shoulder','tank','camisole','blouson','swing','shift','bias'];
const JEWELRY_MOOD = ['statement','chunky','dainty','layered','delicate'];

const root = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req, res) => {
  const p = path.join(root, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  try { res.end(fs.readFileSync(p)); } catch (e) { res.statusCode = 404; res.end(); }
}).listen(8933);

const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const page = await browser.newPage();
const captured = [];
await page.route('**/style-ai', r => { captured.push(JSON.parse(r.request().postData())); r.fulfill({status: 500, body: '{}'}); });
await page.goto('http://localhost:8933/');
await page.waitForTimeout(2600);

// Her exact scenario: a Timeless Classic on the colour-named Tops rows.
await page.evaluate(() => {
  localStorage.setItem('ss_data', JSON.stringify({userName: 'Cath', answers: new Array(12).fill(6), topArchNames: ['The Timeless Classic'], portrait: 'p', motto: 'm'}));
  topArchNames = ['The Timeless Classic']; quizTaken = true;
  openWardrobe();
});
const SLOTS = [['to1', 'White tops'], ['to2', 'Black tops'], ['to5', 'Professional blouses']];
for (const [id] of SLOTS) { await page.evaluate(i => wardrobeSeeIdeas(i), id); await page.waitForTimeout(350); }
await browser.close(); server.close();

const prompts = captured.map(b => b.messages[0].content).filter(c => typeof c === 'string');
console.log('captured ' + prompts.length + ' prompts\n');
let fails = 0;
const okp = (l, c, extra) => { console.log((c ? '  ✓ ' : '  ✗ ') + l + (extra && !c ? '  → ' + extra : '')); if (!c) fails++; };

for (let i = 0; i < prompts.length; i++) {
  const label = (SLOTS[i] || [, 'surface ' + i])[1];
  const res = await fetch('https://stylestar.app/.netlify/functions/style-ai', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'Origin': 'https://stylestar.app'},
    body: JSON.stringify({max_tokens: 600, messages: [{role: 'user', content: prompts[i]}]})
  });
  const d = await res.json();
  const text = (d.content || []).map(c => c.text || '').join('');
  let items;
  try { items = JSON.parse(text.replace(/```json|```/g, '').trim()).items; }
  catch (e) { okp(label + ': parseable JSON', false, text.slice(0, 120)); continue; }

  console.log(label + ':');
  const offenders = [];
  items.forEach(it => {
    const search = (it.search || '').toLowerCase();
    const isJewelry = /earring|necklace|bracelet|ring/i.test(it.name || '');
    // The row's OWN colour may live in the search and not the name — the shelf
    // header already promises it ("White tops"), so repeating it on all four
    // cards is redundant, not dishonest. Every OTHER name word must survive.
    const left = (it.name || '').toLowerCase().split(/[\s-]+/)
      .filter(w => w && !COLOR_WORDS.includes(w))
      .filter(w => !(isJewelry && JEWELRY_MOOD.includes(w)))
      .filter(w => !search.includes(w.replace(/s$/, '')));
    const bad = left.filter(w => STRUCTURAL.includes(w));
    console.log('    "' + it.name + '"  ←→  "' + it.search + '"  @ ' + it.store + (bad.length ? '   ⚠ promises: ' + bad.join(', ') : ''));
    if (bad.length) offenders.push(it.name + ' (' + bad.join(',') + ')');
  });
  okp(label + ': no name promises a shape the search drops', offenders.length === 0, offenders.join(' | '));
  okp(label + ': searches stay 2-4 words', items.every(it => (it.search || '').trim().split(/\s+/).length <= 4), items.map(i => i.search).join(' | '));
}
console.log('\n' + (fails ? fails + ' FAILED' : 'all clean'));
process.exit(fails ? 1 : 0);
