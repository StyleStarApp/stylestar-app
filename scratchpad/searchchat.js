// Web search in the stylist chat (2026-07-30).
//
// Part A drives the REAL netlify/functions/style-ai.js handler in Node with
// the Anthropic API stubbed: the search tool is added server-side with fixed
// caps, domains are validated, client tools are never forwarded, the SSE body
// passes through, and the non-search path is byte-for-byte unchanged.
//
// Part B drives the REAL index.html chat in Chromium against a genuinely
// STREAMING fake function endpoint (Playwright routes can't drip chunks, so
// the harness http server implements the endpoint): searching status appears
// mid-stream, text renders progressively, the final message is linkified and
// saved, and the JSON fallback + error paths still behave.
//
//   node scratchpad/searchchat.js
//
import http from 'http';
import fs from 'fs';
import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
};

// ===========================================================================
// PART A — the real function handler
// ===========================================================================
process.env.ANTHROPIC_API_KEY = 'test-key';
const handler = (await import(path.join(ROOT, 'netlify/functions/style-ai.js'))).default;

let lastUpstream = null;          // { url, body } of the stubbed Anthropic call
let upstreamReply = null;         // function returning a Response
const realFetch = global.fetch;
global.fetch = async (url, opts) => {
  if (String(url).includes('api.anthropic.com')) {
    lastUpstream = { url: String(url), body: JSON.parse(opts.body) };
    return upstreamReply();
  }
  return realFetch(url, opts);
};

function fnReq(body, headers) {
  return new Request('https://stylestar.app/.netlify/functions/style-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', origin: 'https://stylestar.app', ...(headers || {}) },
    body: JSON.stringify(body)
  });
}
const MSGS = [{ role: 'user', content: 'hi' }];
const GOOD_DOMAINS = ['nordstrom.com', 'Macys.com', 'shop.mango.com', 'nordstrom.com'];

console.log('\nA1. Non-search requests are unchanged');
upstreamReply = () => new Response(JSON.stringify({ content: [{ type: 'text', text: 'plain' }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
let res = await handler(fnReq({ max_tokens: 500, messages: MSGS }));
let data = await res.json();
ok('JSON reply passes through', data.content && data.content[0].text === 'plain');
ok('no tools sent upstream', !('tools' in lastUpstream.body));
ok('no stream flag sent upstream', !('stream' in lastUpstream.body));
ok('content-type is JSON', (res.headers.get('content-type') || '').includes('application/json'));

console.log('\nA2. Client-supplied tools are never forwarded');
await handler(fnReq({ max_tokens: 500, messages: MSGS, tools: [{ type: 'web_search_20260209', name: 'web_search' }] }));
ok('injected tools dropped', !('tools' in lastUpstream.body));

console.log('\nA3. search:true builds the tool server-side with fixed caps');
const SSE_BODY = 'event: message_start\ndata: {"type":"message_start"}\n\n';
upstreamReply = () => new Response(SSE_BODY, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
res = await handler(fnReq({ max_tokens: 600, messages: MSGS, search: true, search_domains: GOOD_DOMAINS }));
const tool = (lastUpstream.body.tools || [])[0] || {};
ok('web_search tool added (basic variant, no code-exec filtering)', tool.type === 'web_search_20250305' && tool.name === 'web_search');
ok('max_uses fixed at 3 by the server', tool.max_uses === 3);
ok('domains lowercased and deduped', JSON.stringify(tool.allowed_domains) === JSON.stringify(['nordstrom.com', 'macys.com', 'shop.mango.com']));
ok('stream requested upstream', lastUpstream.body.stream === true);
ok('response is an event stream', (res.headers.get('content-type') || '').includes('text/event-stream'));
ok('SSE body passes through verbatim', (await res.text()) === SSE_BODY);

console.log('\nA4. Bad domain lists are rejected with 400');
for (const [label, domains] of [
  ['not an array', 'nordstrom.com'],
  ['empty array', []],
  ['over 150 entries', Array.from({ length: 151 }, (_, i) => 'a' + i + '.com')],
  ['a URL, not a hostname', ['https://nordstrom.com']],
  ['a path smuggled in', ['nordstrom.com/evil']],
  ['a non-string', [42]],
  ['no dot (not a domain)', ['localhost']]
]) {
  lastUpstream = null;
  res = await handler(fnReq({ max_tokens: 500, messages: MSGS, search: true, search_domains: domains }));
  ok(label + ' → 400, nothing sent upstream', res.status === 400 && lastUpstream === null);
}

console.log('\nA5. The origin gate still guards the search path');
res = await handler(new Request('https://stylestar.app/.netlify/functions/style-ai', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: MSGS, search: true, search_domains: ['nordstrom.com'] })
}));
ok('no origin/referer → 403', res.status === 403);

console.log('\nA6. An upstream API error on the search path comes back as JSON');
upstreamReply = () => new Response(JSON.stringify({ type: 'error', error: { type: 'invalid_request_error' } }), { status: 400, headers: { 'Content-Type': 'application/json' } });
res = await handler(fnReq({ max_tokens: 500, messages: MSGS, search: true, search_domains: ['nordstrom.com'] }));
ok('status 200 with JSON error (page shows friendly message)', res.status === 200 && (res.headers.get('content-type') || '').includes('application/json'));
data = await res.json();
ok('error body intact, no content field', !data.content && data.type === 'error');

console.log('\nA7. A crawler-blocked store is pruned and the call retried (found live: Gucci)');
const blockedErr = (list) => new Response(JSON.stringify({
  type: 'error',
  error: { type: 'invalid_request_error', message: "The following domains are not accessible to our user agent: [" + list.map(d => "'" + d + "'").join(', ') + "]. Read more: https://support.anthropic.com/..." }
}), { status: 400, headers: { 'Content-Type': 'application/json' } });
let upstreamCalls = [], replyQueue = [];
upstreamReply = () => { upstreamCalls.push(lastUpstream.body.tools[0].allowed_domains.slice()); return replyQueue.shift()(); };

// One blocked domain → pruned, retried, streams.
upstreamCalls = [];
replyQueue = [() => blockedErr(['gucci.com']),
              () => new Response(SSE_BODY, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })];
res = await handler(fnReq({ max_tokens: 600, messages: MSGS, search: true, search_domains: ['gucci.com', 'nordstrom.com', 'saks.com'] }));
ok('retried once', upstreamCalls.length === 2);
ok('first call carried gucci.com', upstreamCalls[0].includes('gucci.com'));
ok('retry pruned only the blocked store', JSON.stringify(upstreamCalls[1]) === JSON.stringify(['nordstrom.com', 'saks.com']));
ok('reply streams through after the prune', (res.headers.get('content-type') || '').includes('text/event-stream') && (await res.text()) === SSE_BODY);

// Two rounds of pruning still succeed.
upstreamCalls = [];
replyQueue = [() => blockedErr(['a.com']), () => blockedErr(['b.com']),
              () => new Response(SSE_BODY, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })];
res = await handler(fnReq({ max_tokens: 600, messages: MSGS, search: true, search_domains: ['a.com', 'b.com', 'c.com'] }));
ok('two rounds of pruning reach a stream', upstreamCalls.length === 3 && JSON.stringify(upstreamCalls[2]) === JSON.stringify(['c.com']) && (res.headers.get('content-type') || '').includes('text/event-stream'));

// Every domain blocked → honest JSON error, no infinite loop.
upstreamCalls = [];
replyQueue = [() => blockedErr(['a.com', 'b.com'])];
res = await handler(fnReq({ max_tokens: 600, messages: MSGS, search: true, search_domains: ['a.com', 'b.com'] }));
ok('all blocked → JSON error after one call', upstreamCalls.length === 1 && (res.headers.get('content-type') || '').includes('application/json'));

// Retry cap: never more than 3 upstream calls.
upstreamCalls = [];
replyQueue = [() => blockedErr(['a.com']), () => blockedErr(['b.com']), () => blockedErr(['c.com']),
              () => new Response(SSE_BODY, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })];
res = await handler(fnReq({ max_tokens: 600, messages: MSGS, search: true, search_domains: ['a.com', 'b.com', 'c.com', 'd.com'] }));
ok('capped at 3 upstream calls, then JSON', upstreamCalls.length === 3 && (res.headers.get('content-type') || '').includes('application/json'));

global.fetch = realFetch;

// ===========================================================================
// PART B — the real chat UI against a streaming endpoint
// ===========================================================================
const PORT = 8894, ORIGIN = 'http://localhost:' + PORT;
const sleep = ms => new Promise(r => setTimeout(r, ms));

let fnMode = 'stream';            // 'stream' | 'json' | 'error'
let lastFnBody = null;
const PRODUCT_URL = 'https://www.nordstrom.com/s/hazel-pump/7654321';
const REPLY = 'Found it. The Sam Edelman Hazel pump from Nordstrom (~$140) [' + PRODUCT_URL + '] is the closest real match to your photo.';
const VISIBLE = 'Found it. The Sam Edelman Hazel pump from Nordstrom (~$140) is the closest real match to your photo.';

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, ORIGIN);
  if (url.pathname.startsWith('/.netlify/functions/style-ai')) {
    let raw = '';
    for await (const c of req) raw += c;
    lastFnBody = JSON.parse(raw || '{}');
    if (fnMode === 'json') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ content: [{ type: 'text', text: 'Plain JSON answer from Nordstrom.' }] }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    const ev = (o) => res.write('event: x\ndata: ' + JSON.stringify(o) + '\n\n');
    ev({ type: 'message_start' });
    if (fnMode === 'error') {
      await sleep(120);
      ev({ type: 'error', error: { type: 'overloaded_error' } });
      res.end();
      return;
    }
    // A search starts...
    ev({ type: 'content_block_start', index: 0, content_block: { type: 'server_tool_use', id: 't1', name: 'web_search' } });
    await sleep(700);              // ...the page should be saying so right now
    ev({ type: 'content_block_stop', index: 0 });
    ev({ type: 'content_block_start', index: 1, content_block: { type: 'web_search_tool_result', tool_use_id: 't1' } });
    ev({ type: 'content_block_stop', index: 1 });
    ev({ type: 'content_block_start', index: 2, content_block: { type: 'text', text: '' } });
    const words = REPLY.split(' ');
    for (let i = 0; i < words.length; i++) {
      ev({ type: 'content_block_delta', index: 2, delta: { type: 'text_delta', text: (i ? ' ' : '') + words[i] } });
      await sleep(25);
    }
    ev({ type: 'content_block_stop', index: 2 });
    ev({ type: 'message_delta', delta: { stop_reason: 'end_turn' } });
    ev({ type: 'message_stop' });
    res.end();
    return;
  }
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

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
await page.goto(ORIGIN + '/', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.sendChat === 'function');

console.log('\nB1. The domain allowlist is built from the real STORES table');
const domains = await page.evaluate(() => _searchDomains());
ok('covers the whole store table', domains.length >= 90, 'got ' + domains.length);
ok('includes nordstrom.com', domains.includes('nordstrom.com'));
ok('www. stripped everywhere', domains.every(d => !d.startsWith('www.')));
ok('all plain hostnames', domains.every(d => /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(d)));
ok('no duplicates', new Set(domains).size === domains.length);

console.log('\nB2. A streamed searching answer, end to end');
await page.evaluate(() => { openChat(); document.getElementById('chatInput').value = 'Find me blush pumps like this'; sendChat(); });
await page.waitForFunction(() => {
  const t = document.querySelector('.chat-typing');
  return t && t.textContent.indexOf('Checking your stores') === 0;
}, null, { timeout: 5000 }).then(() => ok('typing line says "Checking your stores..." while the search runs', true))
  .catch(() => ok('typing line says "Checking your stores..." while the search runs', false));
await page.waitForFunction(() => {
  const b = document.querySelectorAll('#chatMessages .chat-msg.bot');
  const last = b[b.length - 1];
  return last && last.style.display !== 'none' && last.textContent.indexOf('Found it.') === 0 && last.textContent.length < 90;
}, null, { timeout: 5000 }).then(() => ok('reply renders progressively mid-stream', true))
  .catch(() => ok('reply renders progressively mid-stream', false));
await page.waitForFunction((visible) => {
  const b = document.querySelectorAll('#chatMessages .chat-msg.bot');
  const last = b[b.length - 1];
  return last && last.textContent === visible && last.querySelector('a');
}, VISIBLE, { timeout: 8000 }).then(() => ok('final message complete, marker stripped, linkified', true))
  .catch(() => ok('final message complete, marker stripped, linkified', false));
const finalState = await page.evaluate(() => {
  const b = document.querySelectorAll('#chatMessages .chat-msg.bot');
  const last = b[b.length - 1];
  const hrefs = last ? Array.prototype.map.call(last.querySelectorAll('a'), a => a.href) : [];
  let hist = [];
  try { hist = JSON.parse(localStorage.getItem('ss_chat') || '[]'); } catch (e) {}
  return {
    hrefs: hrefs, typingGone: !document.querySelector('.chat-typing'),
    hiddenBubbles: document.querySelectorAll('#chatMessages .chat-msg.bot[style*="display: none"]').length,
    lastHist: hist[hist.length - 1] || {}
  };
});
ok('the tap target is the EXACT product page the stylist saw', finalState.hrefs.includes(PRODUCT_URL));
ok('typing indicator removed', finalState.typingGone);
ok('the live bubble was replaced, none left hidden', finalState.hiddenBubbles === 0);
ok('reply saved to chat history', finalState.lastHist.role === 'assistant' && String(finalState.lastHist.content).indexOf('Found it.') === 0);
ok('request carried search:true', lastFnBody.search === true);
ok('request carried the domain allowlist', Array.isArray(lastFnBody.search_domains) && lastFnBody.search_domains.includes('nordstrom.com') && lastFnBody.search_domains.length >= 90);
ok('no other request fields leaked tools', !('tools' in lastFnBody));

console.log('\nB3. JSON fallback still works (old function, API error path)');
fnMode = 'json';
await page.evaluate(() => { document.getElementById('chatInput').value = 'And a bag?'; sendChat(); });
await page.waitForFunction(() => {
  const b = document.querySelectorAll('#chatMessages .chat-msg.bot');
  const last = b[b.length - 1];
  return last && last.textContent.indexOf('Plain JSON answer') === 0;
}, null, { timeout: 5000 }).then(() => ok('JSON reply renders as before', true))
  .catch(() => ok('JSON reply renders as before', false));

console.log('\nB4. A stream error shows the friendly message');
fnMode = 'error';
await page.evaluate(() => { document.getElementById('chatInput').value = 'One more?'; sendChat(); });
await page.waitForFunction(() => {
  const b = document.querySelectorAll('#chatMessages .chat-msg.bot');
  const last = b[b.length - 1];
  return last && last.textContent.indexOf("I'm having a moment") === 0;
}, null, { timeout: 5000 }).then(() => ok('friendly error shown', true))
  .catch(() => ok('friendly error shown', false));
const stuck = await page.evaluate(() => ({
  typing: !!document.querySelector('.chat-typing'),
  hidden: document.querySelectorAll('#chatMessages .chat-msg.bot[style*="display: none"]').length
}));
ok('no leftover typing or hidden live bubbles', !stuck.typing && stuck.hidden === 0);

console.log('\nB5. The direct-link pass, case by case');
const linkCases = await page.evaluate((PU) => {
  const run = (t) => linkStores(t);
  const cases = {};
  // Canonical: exact product URL becomes the href, marker vanishes.
  let h = run('Try the Hazel pump from Nordstrom (~$140) [' + PU + '] for fall.');
  cases.canonical = { html: h, ok: h.includes('href="' + PU + '"') && !h.includes('[') && h.includes('(~$140)') };
  // Subdomain of an allowed store is allowed.
  h = run('The Nova bag from Nordstrom (~$79) [https://m.nordstrom.com/s/nova/1]');
  cases.subdomain = h.includes('href="https://m.nordstrom.com/s/nova/1"');
  // A URL outside the 102 stores: marker stripped, store falls back to a search link.
  h = run('A tote from Madewell (~$88) [https://evil.example.com/steal] is cute.');
  cases.offList = !h.includes('evil.example.com') && !h.includes('[') && /href="[^"]*madewell/.test(h);
  // javascript: smuggled in brackets never becomes a link.
  h = run('A bag from Madewell (~$88) [javascript:alert(1)] is cute.');
  cases.jsUrl = !h.includes('javascript:');
  // Stray marker with no store in front never shows raw brackets.
  h = run('This one is lovely [https://www.nordstrom.com/s/x/2] I promise.');
  cases.stray = !h.includes('[') && !h.includes('href="https://www.nordstrom.com/s/x/2"');
  // Two searched items in one answer both get their own product link.
  h = run('The A bag from Nordstrom (~$79) [https://www.nordstrom.com/s/a/1] or the B bag from Saks (~$150) [https://www.saksfifthavenue.com/p/b-2]');
  cases.two = h.includes('href="https://www.nordstrom.com/s/a/1"') && h.includes('href="https://www.saksfifthavenue.com/p/b-2"');
  // A plain unsearched suggestion still gets the classic search link.
  h = run('Try a navy linen blazer from Madewell for spring.');
  cases.classic = /href="[^"]*madewell[^"]*navy/i.test(h) || /href="[^"]*madewell/.test(h);
  return cases;
}, PRODUCT_URL);
ok('canonical marker → exact product href, brackets gone, price kept', linkCases.canonical.ok, linkCases.canonical.html.slice(0, 200));
ok('subdomain of an allowed store accepted', linkCases.subdomain);
ok('URL outside the 102 stores rejected, falls back to search link', linkCases.offList);
ok('javascript: URL never linked', linkCases.jsUrl);
ok('stray marker stripped, never linked', linkCases.stray);
ok('two searched items → two product links', linkCases.two);
ok('unsearched suggestions keep the classic search link', linkCases.classic);

console.log('\nB6. Restored history renders the same direct link');
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.openChat === 'function');
const restored = await page.evaluate((PU) => {
  openChat();
  const b = document.querySelectorAll('#chatMessages .chat-msg.bot');
  for (const el of b) {
    const a = el.querySelector('a[href="' + PU + '"]');
    if (a) return { found: true, noBrackets: el.textContent.indexOf('[') < 0 };
  }
  return { found: false };
}, PRODUCT_URL);
ok('reloaded chat still links straight to the product', restored.found && restored.noBrackets);

ok('zero page errors', errors.length === 0, errors.join(' | '));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await browser.close();
server.close();
process.exit(fail ? 1 : 0);
