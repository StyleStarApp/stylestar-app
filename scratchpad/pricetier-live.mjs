// pricetier-live.mjs — HOW EXPENSIVE ARE THE AI'S PICKS, REALLY? (2026-09-06)
//
// Cath's question after seeing a luxury-heavy feed shelf: "the AI searches
// too?" The feed's price problem is measurable in code; the AI's is not,
// because _shopRules only ASKS the model to spread the prices. This file
// answers it the only honest way: capture the REAL prompts out of the running
// app, send them to the LIVE deployed function, and score the stores the model
// actually chose against CATH'S OWN price tags.
//
// ⚠️ The AI never returns a price, so "expensive" here means the PRICE TIER OF
//    THE STORE it sent her to, read from STORES[key].t -- her own $ to $$$$
//    notation. That is the only price signal an AI pick carries.
// Costs a few cents of the production key. Run: NODE_PATH=/opt/node22/lib/node_modules node scratchpad/pricetier-live.mjs
import path from 'path'; import http from 'http'; import fs from 'fs';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = 8961;

const srv = http.createServer((rq, rs) => {
  const p = path.join(ROOT, rq.url === '/' ? 'index.html' : rq.url.split('?')[0]);
  try { rs.end(fs.readFileSync(p)); } catch (e) { rs.statusCode = 404; rs.end(); }
}).listen(PORT);

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

// Two opposite women. The dressy one is the RISK CASE: her best-matched stores
// skew expensive because dressy correlates with price in Cath's own tags.
const PROFILES = {
  'dressy/glam':   { answers: [9, 10, 6, 6, 10, 6, 6, 6, 9, 6, 9, 6], arch: ['The Glamorous Icon', 'The Bold Romantic', 'The Modern Muse'] },
  'relaxed/casual':{ answers: [3, 2, 6, 6, 2, 6, 6, 6, 2, 6, 3, 6],  arch: ['The Effortless Natural', 'The Easy Classic', 'The Cozy Minimalist'] },
};

async function capture(profile) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const pg = await ctx.newPage();
  const caught = {};
  let label = null;
  await pg.route('**/style-ai', r => {
    if (label) caught[label] = JSON.parse(r.request().postData());
    r.fulfill({ status: 500, body: '{}' });
  });
  await pg.route('**/product-search', r =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"products":[]}' }));
  await pg.goto('http://localhost:' + PORT + '/');
  await pg.waitForTimeout(2400);
  await pg.evaluate(p => {
    answers = p.answers.slice(); topArchNames = p.arch.slice(); quizTaken = true;
    localStorage.setItem('ss_data', JSON.stringify({ userName: 'T', answers, topArchNames, portrait: 'p', motto: 'm' }));
  }, profile);

  label = 'Shop your style';
  await pg.evaluate(() => genOutfits('page')); await pg.waitForTimeout(500);
  label = 'Wardrobe Ideas';
  await pg.evaluate(() => { openWardrobe(); }); await pg.waitForTimeout(300);
  await pg.evaluate(() => wardrobeSeeIdeas('to5')); await pg.waitForTimeout(700);
  label = 'Stylist chat';
  // ⚠️ The chat is the one surface that does NOT go through _shopRules(), so it
  //    is the one most worth measuring. Open it through the real control and
  //    wait for the screen, or sendChat runs against a chatInput that is not
  //    there yet and the prompt is never built (0 picks, which looks exactly
  //    like a well-behaved answer and is not).
  await pg.evaluate(() => openChat());
  await pg.waitForSelector('#chatInput', { state: 'attached', timeout: 5000 });
  await pg.waitForTimeout(600);
  await pg.evaluate(() => {
    document.getElementById('chatInput').value = 'I need a few nice tops for work. What should I buy?';
    sendChat();
  }); await pg.waitForTimeout(1200);
  if (!caught['Stylist chat']) console.log('  ⚠️ chat prompt was never captured — not measured');

  // Cath's own price tag per store, plus the resolver, read from the live app.
  const tiers = await pg.evaluate(() => {
    const o = {};
    for (const k in STORES) o[k] = STORES[k].t || '';
    return o;
  });
  const resolveMap = await pg.evaluate(() => {
    const m = {}; for (const k in STORES) m[k.toLowerCase()] = k;
    try { for (const a in _STORE_ALIAS) m[a.toLowerCase()] = _STORE_ALIAS[a]; } catch (e) {}
    return m;
  });
  await ctx.close();
  return { caught, tiers, resolveMap };
}

async function live(body) {
  const r = await fetch('https://stylestar.app/.netlify/functions/style-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://stylestar.app' },
    body: JSON.stringify(body),
  });
  if (!r.ok) return null;
  const d = await r.json();
  return (d.content || []).map(c => c.text || '').join('');
}

// The cheapest end of a range is what decides "could she buy anything here" --
// the same reading _tierOf uses, and the honest one for a budget question.
const cheapEnd = t => (String(t).split('-')[0].match(/\$+/) || [''])[0];

for (const [name, prof] of Object.entries(PROFILES)) {
  console.log('\n════ ' + name + ' ════');
  const { caught, tiers, resolveMap } = await capture(prof);
  for (const [surface, body] of Object.entries(caught)) {
    const raw = await live(body);
    if (!raw) { console.log('  ' + surface + ': live call failed'); continue; }
    let stores = [];
    try {
      const m = raw.match(/\{[\s\S]*\}/);
      const items = JSON.parse(m[0]).items;
      // ⚠️ The chat answers in PROSE, and a prose answer can still contain a
      //    brace pair that parses. Parsing "something" is not parsing ITEMS --
      //    treating it as success reported 0 picks, which reads exactly like a
      //    clean answer and is not. Only a real items array counts.
      if (!Array.isArray(items) || !items.length) throw 0;
      stores = items.map(i => i.store);
    } catch (e) {
      // The chat answers in prose: "… from Neiman Marcus". Pull store names by
      // matching the table itself rather than guessing at the sentence shape.
      stores = Object.values(resolveMap)
        .filter((k, i, a) => a.indexOf(k) === i)
        .filter(k => new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(raw));
    }
    const got = stores.map(s => {
      const k = resolveMap[String(s || '').toLowerCase()] || s;
      return { store: k, tier: tiers[k] || '?' };
    });
    const cheap = got.filter(g => ['$', '$$'].includes(cheapEnd(g.tier))).length;
    console.log('  ' + surface + ' — ' + got.length + ' picks, ' + cheap + ' reachable ($ or $$)');
    if (!got.length) console.log('      RAW: ' + raw.slice(0, 500).replace(/\n/g, ' '));
    got.forEach(g => console.log('      ' + (g.tier || '?').padEnd(8) + g.store));
  }
}
await b.close(); srv.close();
