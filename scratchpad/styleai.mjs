// styleai.mjs — proves style-ai.js's OWN wiring for the "Couldn't load
// options right now" diagnosis, 2026-09-13. This file had NO test coverage
// at all before today, the same gap product-find.js had until pricefilter.mjs.
//
// THE BUG: the plain (non-chat) path always forced status 200 back to the
// page regardless of what Anthropic actually said, and logged nothing on a
// failure. So a real Anthropic error (rate limit, overload, safety refusal)
// vanished with zero trace anywhere -- not in Netlify's logs, not in the
// response. Every client call site already does `if(!r.ok)throw`, so that
// check was dead code: it never actually ran, because `r.ok` was always true.
//
// No network: global fetch is mocked and every call is recorded.
// Run: node scratchpad/styleai.mjs
let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? '  -> ' + extra : '')); }
};

process.env.ANTHROPIC_API_KEY = 'testkey';

const errors = [];
const realConsoleError = console.error;
console.error = (...args) => { errors.push(args.join(' ')); };

let anthropicReply = null;
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  if (String(url).includes('api.anthropic.com')) return anthropicReply;
  throw new Error('unexpected fetch: ' + url);
};

function fakeReq(body) {
  const headers = new Map([
    ['host', 'www.stylestar.app'],
    ['origin', 'https://www.stylestar.app'],
    ['referer', 'https://www.stylestar.app/'],
  ]);
  return {
    method: 'POST',
    headers: { get: (k) => headers.get(k.toLowerCase()) || null },
    text: async () => JSON.stringify(body),
  };
}

const mod = await import('../netlify/functions/style-ai.js');
const handler = mod.default;

console.log('\n1. a real Anthropic success passes through unchanged (status 200)');
errors.length = 0;
anthropicReply = { ok: true, status: 200, json: async () => ({ content: [{ text: '{"note":"hi"}' }] }) };
const r1 = await handler(fakeReq({ max_tokens: 400, messages: [{ role: 'user', content: 'hi' }] }));
const d1 = await r1.json();
ok('status is 200', r1.status === 200, String(r1.status));
ok('content passed through', !!(d1.content && d1.content[0].text), JSON.stringify(d1));
ok('nothing logged on a clean success', errors.length === 0, JSON.stringify(errors));

console.log('\n2. an Anthropic overload (529) is no longer masked as 200, and IS logged');
errors.length = 0;
anthropicReply = { ok: false, status: 529, json: async () => ({ type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } }) };
const r2 = await handler(fakeReq({ max_tokens: 400, messages: [{ role: 'user', content: 'hi' }] }));
const d2 = await r2.json();
ok('the REAL status (529) reaches the page, not a fake 200',
   r2.status === 529, String(r2.status));
ok('the real error body reaches the page too',
   d2 && d2.error && d2.error.type === 'overloaded_error', JSON.stringify(d2));
ok('the failure is logged server-side, so Netlify logs finally show WHY',
   errors.some(e => e.includes('upstream error') && e.includes('529') && e.includes('Overloaded')),
   JSON.stringify(errors));

console.log('\n3. a rate-limit (429) from Anthropic also propagates and logs');
errors.length = 0;
anthropicReply = { ok: false, status: 429, json: async () => ({ type: 'error', error: { type: 'rate_limit_error', message: 'Rate limited' } }) };
const r3 = await handler(fakeReq({ max_tokens: 400, messages: [{ role: 'user', content: 'hi' }] }));
ok('status 429 reaches the page', r3.status === 429, String(r3.status));
ok('logged with the real message', errors.some(e => e.includes('Rate limited')), JSON.stringify(errors));

console.log('\n4. an unparseable upstream body cannot crash the function');
errors.length = 0;
anthropicReply = { ok: false, status: 502, json: async () => { throw new SyntaxError('Unexpected token'); } };
const r4 = await handler(fakeReq({ max_tokens: 400, messages: [{ role: 'user', content: 'hi' }] }));
const d4 = await r4.json();
ok('status 502 still reaches the page (not swallowed into 200)', r4.status === 502, String(r4.status));
ok('body degrades to {} rather than throwing', JSON.stringify(d4) === '{}', JSON.stringify(d4));
ok('the parse failure itself is logged', errors.some(e => e.includes('unparseable')), JSON.stringify(errors));

console.log('\n5. every existing client call site already anticipates this — confirm the pattern');
// index.html: every call site does `if(!r.ok)throw` (or an equivalent check).
// This is not new client code; it proves the client was ALREADY ready for a
// real status, and the server was the only thing that never sent one.
import fs from 'fs';
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const callSites = [...html.matchAll(/functions\/style-ai["'][\s\S]{0,400}?if\(!r\.ok\)/g)];
ok('at least 4 call sites already guard on r.ok (dead code until this fix)',
   callSites.length >= 4, String(callSites.length));

globalThis.fetch = realFetch;
console.error = realConsoleError;
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
