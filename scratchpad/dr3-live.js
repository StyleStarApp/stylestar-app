// LIVE model test for "Work-appropriate dresses" (dr3) — the second retest
// that 2026-08-12 called for and that never happened. Her FIRST test showed a
// Bloomingdale's one-shoulder dress, spaghetti straps and satin, all three
// explicitly against her own definition. The fix moved her definition INSIDE
// the RULES list as an imperative NEVER closed with "This rule is absolute",
// and named those three violations by word. Nothing has verified it since.
//
// TWO runs, deliberately: her own note says the dresses definition needed a
// second pass before it landed, so a single clean run proves nothing.
// Costs a few cents of the production key — the standing trade.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import path from 'path'; import http from 'http'; import fs from 'fs';

// straight from her definition; each is a phrase she named or the rule spells out
const VIOLATIONS = [
  [/one[- ]?shoulder|asymmetric/i,        'one-shoulder / asymmetric'],
  [/spaghetti/i,                          'spaghetti straps'],
  [/strapless|tube dress/i,               'strapless'],
  [/plunging|deep v\b/i,                  'plunging neckline'],
  [/satin|charmeuse/i,                    'satin'],
  [/sequin|metallic|shiny|glitter/i,      'sequined / shiny'],
  [/sheer|organza|chiffon/i,              'sheer'],
  [/\bmini\b|micro|above[- ]the[- ]knee/i,'above-knee hemline'],
  [/high slit|thigh slit|side slit/i,     'high slit'],
  [/halter/i,                             'halter (narrow strap)'],
  [/bodycon|body[- ]?con/i,               'bodycon (clingy)'],
];
// the three rows the exclusion map is supposed to keep out
const BLEED = [[/cocktail/i,'cocktail dress bleed'],[/gown|ball ?gown/i,'formal gown bleed'],[/sundress|sun dress/i,'sundress bleed']];

const root = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req,res)=>{ const p=path.join(root, req.url==='/'?'index.html':req.url.split('?')[0]);
  try{ res.end(fs.readFileSync(p)); }catch(e){ res.statusCode=404; res.end(); } }).listen(8934);

const browser = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const page = await browser.newPage();
let captured = null;
await page.route('**/style-ai', r => { captured = JSON.parse(r.request().postData()); r.fulfill({status:500, body:'{}'}); });
await page.goto('http://localhost:8934/');
await page.waitForTimeout(1200);
await page.evaluate(() => { openWardrobe(); });
await page.evaluate(() => { wardrobeSeeIdeas('dr3'); });
await page.waitForTimeout(600);
await browser.close(); server.close();

if (!captured) { console.log('FAILED to capture the dr3 prompt'); process.exit(1); }
const prompt = captured.messages[0].content;

let fails = 0;
const okp = (l,c,x) => { console.log((c?'  ✓ ':'  ✗ ')+l+(!c&&x?'  → '+x:'')); if(!c) fails++; };

console.log('1. The prompt itself (before spending anything)');
okp('her definition is present', /NEVER suggest one-shoulder or asymmetric/.test(prompt));
okp('it is closed as absolute', /This rule is absolute, the same weight as her never-wear list\.\s*$|absolute[\s\S]{0,80}never-wear list/.test(prompt));
okp('it sits INSIDE the RULES list', prompt.indexOf('RULES:') < prompt.indexOf('NEVER suggest one-shoulder'));
okp('it follows the never-wear rule it must match in weight',
    prompt.indexOf('NEVER suggest anything on her never-wear list') < prompt.indexOf('NEVER suggest one-shoulder'));
okp('the three sibling rows are excluded', /Cocktail dresses/.test(prompt) && /Formal gowns/.test(prompt) && /Sundresses/.test(prompt));
okp('Daytime casual is NOT excluded (her call)', !/Daytime casual/.test(prompt));

console.log('\n2. The live model, two independent runs');
const allItems = [];
for (let run = 1; run <= 2; run++) {
  const res = await fetch('https://stylestar.app/.netlify/functions/style-ai', {
    method:'POST', headers:{'Content-Type':'application/json','Origin':'https://stylestar.app'},
    body: JSON.stringify({max_tokens:600, messages:[{role:'user', content:prompt}]})
  });
  const d = await res.json();
  const text = (d.content||[]).map(c=>c.text||'').join('');
  let items;
  try { items = JSON.parse(text.replace(/```json|```/g,'').trim()).items; }
  catch(e) { okp('run '+run+': model returned parseable JSON', false, text.slice(0,120)); continue; }
  console.log('\n  RUN ' + run + ':');
  items.forEach(it => console.log('    "'+it.name+'"   search: "'+it.search+'"   @ '+it.store));
  allItems.push(...items);
  const blob = items.map(it => it.name+' '+it.search).join(' | ');
  VIOLATIONS.forEach(([re,label]) => okp('run '+run+': no '+label, !re.test(blob), (blob.match(re)||[''])[0]));
  BLEED.forEach(([re,label]) => okp('run '+run+': no '+label, !re.test(blob), (blob.match(re)||[''])[0]));
  okp('run '+run+': 4 options returned', items.length === 4, String(items.length));
}

console.log('\n3. Across both runs');
const blob = allItems.map(it=>it.name+' '+it.search).join(' | ');
okp('zero violations of her definition, 8 items total',
    !VIOLATIONS.some(([re])=>re.test(blob)) && !BLEED.some(([re])=>re.test(blob)));
console.log('\n' + (fails ? fails+' FAILED' : 'all passed') + '  (' + allItems.length + ' items judged)');
