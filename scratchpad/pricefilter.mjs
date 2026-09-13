// pricefilter.mjs — proves product-find.js's OWN wiring for the price filter,
// 2026-09-13. The pure logic (verifyPrice, judge, widenOptions) is already
// proven in findprod.js PART 11; this is the one file that had NO coverage at
// all before today, and it is where the actual SerpApi request gets built.
//
// No network: global fetch is mocked and every call is recorded, so this
// proves the REQUEST SHAPE the server sends without spending a real search.
//
// Run: node scratchpad/pricefilter.mjs
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? '  -> ' + extra : '')); }
};

process.env.SERPAPI_KEY = 'testkey';
// ⚠️ Deliberately NOT set: SUPABASE_URL/KEY (feedBrowse degrades to 'no-key'
// instantly, sidestepping a path this file isn't testing) and
// ANTHROPIC_API_KEY (the AI-judge branch never fires anyway — this request
// carries no colour/fabric/cut, so READ.length is 0 regardless).

const calls = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  const u = String(url);
  calls.push(u);
  if (u.includes('serpapi.com/account.json')) {
    return { ok: true, json: async () => ({ total_searches_left: 500 }) };
  }
  if (u.includes('serpapi.com/search.json')) {
    // Three products: one cheap, one dear, one with no extractable price.
    return { ok: true, json: async () => ({ shopping_results: [
      { product_id: 'p1', title: 'Reformation Linen Top', source: 'Nordstrom',
        price: '$68', extracted_price: 68 },
      { product_id: 'p2', title: 'Reformation Silk Top', source: 'Nordstrom',
        price: '$340', extracted_price: 340 },
      { product_id: 'p3', title: 'Reformation Cotton Top', source: 'Nordstrom',
        price: '', extracted_price: null },
    ] }) };
  }
  // Any look-up (serpapi_immersive_product_api) or anything else: fail closed,
  // exactly like a real dead call — `verified` stays empty and the browse wall
  // still has to carry the row, which is exactly what this test is checking.
  return { ok: false, status: 500, json: async () => ({}) };
};

function fakeReq(body) {
  const headers = new Map([
    ['host', 'www.stylestar.app'],
    ['origin', 'https://www.stylestar.app'],
    ['referer', 'https://www.stylestar.app/'],
  ]);
  return {
    method: 'POST',
    url: 'https://www.stylestar.app/.netlify/functions/product-find',
    headers: { get: (k) => headers.get(k.toLowerCase()) || null },
    json: async () => body,
  };
}

const mod = await import('../netlify/functions/product-find.js');
const handler = mod.default;

console.log('\n1. a price ceiling reaches SerpApi as max_price');
calls.length = 0;
const r1 = await handler(fakeReq({ item: 'top', price: 100 }));
const d1 = await r1.json();
const searchCalls = calls.filter(u => u.includes('engine=google_shopping'));
ok('exactly one search call (no dearer-half bonus search when she named a ceiling)',
   searchCalls.length === 1, JSON.stringify(searchCalls));
ok('...and it carries max_price=100', /max_price=100\b/.test(searchCalls[0] || ''), searchCalls[0] || '(none)');

console.log('\n2. the browse wall drops the known-over-budget piece, keeps the unknown one');
const browseTitles = (d1.browse || []).map(p => p.title);
ok('the $68 top is shown', browseTitles.includes('Reformation Linen Top'), JSON.stringify(browseTitles));
ok('the $340 top is NOT shown (known over budget)', !browseTitles.includes('Reformation Silk Top'), JSON.stringify(browseTitles));
ok('the no-price top IS still shown (unknown, not rejected — "more to browse")',
   browseTitles.includes('Reformation Cotton Top'), JSON.stringify(browseTitles));

console.log('\n3. with NO price stated, nothing above changes — old behaviour is untouched');
calls.length = 0;
const r2 = await handler(fakeReq({ item: 'top' }));
const d2 = await r2.json();
const searchCalls2 = calls.filter(u => u.includes('engine=google_shopping'));
ok('no max_price on the outbound search', searchCalls2.every(u => !u.includes('max_price')), JSON.stringify(searchCalls2));
const browseTitles2 = (d2.browse || []).map(p => p.title);
ok('the $340 top is shown when she named no ceiling at all',
   browseTitles2.includes('Reformation Silk Top'), JSON.stringify(browseTitles2));

console.log('\n4. a nonsense price is dropped by cleanReq, never reaches the search at all');
calls.length = 0;
const r3 = await handler(fakeReq({ item: 'top', price: '9999999' }));
await r3.json();
const searchCalls3 = calls.filter(u => u.includes('engine=google_shopping'));
ok('an out-of-range price never reaches max_price', searchCalls3.every(u => !u.includes('max_price')), JSON.stringify(searchCalls3));

globalThis.fetch = realFetch;
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
