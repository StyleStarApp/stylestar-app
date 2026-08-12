// LIVE model test for the 2026-08-12 second-retest fix: names and searches
// must lead with the PIECE, never a color, on non-color items — proven
// against the real deployed function (the sandbox has no ANTHROPIC_API_KEY,
// but the live function does; same Origin-header pattern as the chat fixes).
//
// Scenario = Cath's exact reported failure: prefs.colorsLove = hot pink +
// royal blue, then the three wardrobe items from her screenshot plus the
// Shop-your-style surface that still carried the stray "prioritize" bullet.
//
// Costs a few cents of the production key (4 small calls) — the same
// deliberate trade as the 2026-08-08 live checks.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import path from 'path';
import http from 'http';
import fs from 'fs';

const COLOR_WORDS = ['pink','blue','white','black','red','green','brown','purple','yellow','orange','tan','blush','cream','ivory','navy','gold','silver','beige','camel','emerald','hot','royal'];
const LOVED = /hot ?pink|royal ?blue/i;

function leadsWithColor(s){
  if(!s) return false;
  const first = s.trim().toLowerCase().split(/\s+/)[0];
  return COLOR_WORDS.includes(first);
}

  // serve the repo so index.html loads with its real relative assets
  const root = path.resolve(import.meta.dirname, '..');
  const server = http.createServer((req,res)=>{
    const p = path.join(root, req.url==='/'?'index.html':req.url.split('?')[0]);
    try{ res.end(fs.readFileSync(p)); }catch(e){ res.statusCode=404; res.end(); }
  }).listen(8931);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  // capture every style-ai body instead of letting the page call it
  const captured = [];
  await page.route('**/style-ai', r => {
    captured.push(JSON.parse(r.request().postData()));
    r.fulfill({ status: 500, body: '{}' }); // page shows its error state, fine
  });
  await page.goto('http://localhost:8931/');
  await page.waitForTimeout(800);

  // seed her exact scenario and open the wardrobe so boxes exist
  await page.evaluate(() => {
    prefs.colorsLove = ['Hot Pink','Royal Blue'];
    openWardrobe();
  });
  for (const id of ['to7','to5','to6']) {
    await page.evaluate(id => { wardrobeSeeIdeas(id); }, id);
    await page.waitForTimeout(300);
  }
  // the Shop-your-style surface with the (now fixed) stray bullet
  await page.evaluate(() => { genOutfits('page'); });
  await page.waitForTimeout(400);
  await browser.close();
  server.close();

  const prompts = captured.map(b => b.messages[0].content).filter(c => typeof c === 'string');
  console.log('captured ' + prompts.length + ' prompts');
  let fails = 0;
  const okp = (label, cond) => { console.log((cond?'  ✓ ':'  ✗ ') + label); if(!cond) fails++; };

  // static sanity on the captured prompts before spending the key
  prompts.forEach((p,i) => {
    okp('prompt '+i+' carries no "prioritize those colors"', !p.includes('prioritize those colors'));
    okp('prompt '+i+' carries the new naming rule', /leading with the piece itself|LEAD WITH THE PIECE|led by the piece itself/.test(p));
  });

  // now the live model
  const labels = ['Tank tops/Camisoles','Professional blouses','Dressy or going-out tops','Shop your style'];
  for (let i = 0; i < prompts.length; i++) {
    const body = JSON.stringify({ max_tokens: 600, messages: [{ role: 'user', content: prompts[i] }] });
    const res = await fetch('https://stylestar.app/.netlify/functions/style-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'https://stylestar.app' },
      body
    });
    const d = await res.json();
    const text = (d.content||[]).map(c => c.text||'').join('');
    let items;
    try { items = JSON.parse(text.replace(/```json|```/g,'').trim()).items; }
    catch(e){ okp(labels[i]+': model returned parseable JSON', false); continue; }
    console.log('\n' + labels[i] + ':');
    items.forEach(it => console.log('    name: "'+it.name+'"  search: "'+it.search+'"  @ '+it.store));
    okp(labels[i]+': no NAME leads with a color', !items.some(it => leadsWithColor(it.name)));
    okp(labels[i]+': no SEARCH leads with a color', !items.some(it => leadsWithColor(it.search)));
    okp(labels[i]+': her loved colors never forced in', !items.some(it => LOVED.test(it.name+' '+it.search)));
    okp(labels[i]+': name colors (if any) are in the search too', items.every(it => {
      const nameColors = (it.name||'').toLowerCase().split(/[\s-]+/).filter(w => COLOR_WORDS.includes(w));
      return nameColors.every(c => (it.search||'').toLowerCase().includes(c));
    }));
  }
console.log('\n' + (fails ? fails + ' FAILURES' : 'ALL GREEN'));
process.exit(fails ? 1 : 0);
