// Third Cowork brief (2026-07-31): security + bug fixes.
//
// Part A drives the REAL netlify/functions/style-ai.js handler in Node with
// the Anthropic API stubbed: the search allowlist now lives SERVER-SIDE and
// client-sent search_domains is ignored entirely; request bodies are size
// capped (text budget separate from image budget, so photos still work); a
// rough global daily spend cap refuses politely; blocked search domains are
// memoized per instance so the failed round trip is not repeated every turn.
//
// Part B drives the REAL index.html in Chromium: chat text is escaped before
// linkStores on the live AND restored paths (XSS), the restored photoThumb
// attribute is escaped and validated, chat links must live on the named
// store's own domain, wishlist ids are slug-validated, the strict hasQuiz
// predicate governs goHome + the menu routers, a name-only record no longer
// bricks the chat or hangs Shop your Style, and a cut-off stream shows an
// honest note without persisting the fragment.
//
//   node scratchpad/cowork3.js
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
// PART A — the real function handler (brief item 1)
// ===========================================================================
process.env.ANTHROPIC_API_KEY = 'test-key';
delete process.env.DAILY_SPEND_CAP_USD;
const handler = (await import(path.join(ROOT, 'netlify/functions/style-ai.js'))).default;

let lastUpstream = null;
let upstreamReply = () => new Response(JSON.stringify({ content: [{ type: 'text', text: 'plain' }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
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
    body: typeof body === 'string' ? body : JSON.stringify(body)
  });
}
const MSGS = [{ role: 'user', content: 'hi' }];
const SSE = () => new Response('event: message_start\ndata: {"type":"message_start"}\n\n', { status: 200, headers: { 'Content-Type': 'text/event-stream' } });

console.log('\nA1. The search allowlist lives server-side; client domains are IGNORED');
upstreamReply = SSE;
let res = await handler(fnReq({ max_tokens: 600, messages: MSGS, search: true, search_domains: ['evil.example.com'] }));
let tool = (lastUpstream.body.tools || [])[0] || {};
ok('search still streams', (res.headers.get('content-type') || '').includes('text/event-stream'));
ok('allowed_domains is the server list (101 stores)', Array.isArray(tool.allowed_domains) && tool.allowed_domains.length === 101, 'got ' + (tool.allowed_domains || []).length);
ok('client-sent domain NOT in the list', !tool.allowed_domains.includes('evil.example.com'));
ok('the real stores are', ['nordstrom.com', 'www2.hm.com', 'shop.lululemon.com', 'tjmaxx.tjx.com'].every(d => tool.allowed_domains.includes(d)));
ok('max_uses still fixed at 3', tool.max_uses === 3);

lastUpstream = null;
res = await handler(fnReq({ max_tokens: 600, messages: MSGS, search: true }));
ok('search works with NO search_domains at all (new client protocol)', (res.headers.get('content-type') || '').includes('text/event-stream') && lastUpstream.body.tools[0].allowed_domains.length === 101);

for (const [label, junk] of [['a string', 'nope'], ['a URL', ['https://x.com']], ['numbers', [42]], ['150+ entries', Array.from({ length: 200 }, (_, i) => 'a' + i + '.com')]]) {
  lastUpstream = null;
  res = await handler(fnReq({ max_tokens: 600, messages: MSGS, search: true, search_domains: junk }));
  ok('junk client domains (' + label + ') ignored, not a 400', res.status === 200 && lastUpstream && lastUpstream.body.tools[0].allowed_domains.length === 101);
}

console.log('\nA2. Client-supplied tools are still never forwarded');
upstreamReply = () => new Response(JSON.stringify({ content: [{ type: 'text', text: 'plain' }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
await handler(fnReq({ max_tokens: 500, messages: MSGS, tools: [{ type: 'web_search_20260209', name: 'web_search' }] }));
ok('injected tools dropped on the non-search path', !('tools' in lastUpstream.body));

console.log('\nA3. Size caps: text budget vs image budget');
// The app's own biggest real text (the ~13-21 KB chat system prompt) must pass.
const bigSystem = 'S'.repeat(22 * 1024);
lastUpstream = null;
res = await handler(fnReq({ max_tokens: 600, messages: [{ role: 'user', content: bigSystem }, { role: 'assistant', content: 'ok' }, { role: 'user', content: 'hi' }] }));
ok('a 22 KB system prompt (real chat size) passes', res.status === 200 && lastUpstream !== null);

lastUpstream = null;
res = await handler(fnReq({ max_tokens: 500, messages: [{ role: 'user', content: 'x'.repeat(33 * 1024) }] }));
ok('a single text over 32 KB → 400', res.status === 400 && lastUpstream === null);

lastUpstream = null;
res = await handler(fnReq({ max_tokens: 500, messages: Array.from({ length: 5 }, () => ({ role: 'user', content: 'y'.repeat(25 * 1024) })) }));
ok('non-image body over 100 KB → 413', res.status === 413 && lastUpstream === null);

// A real photo request: ~1.5 MB of base64 image + a small prompt must PASS —
// image data is excluded from the 100 KB text budget.
const photoMsg = (dataLen) => [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: 'A'.repeat(dataLen) } }, { type: 'text', text: 'What do you think of this outfit?' }] }];
lastUpstream = null;
res = await handler(fnReq({ max_tokens: 800, messages: photoMsg(1500000) }));
ok('a 1.5 MB base64 photo passes (photo analysis unbroken)', res.status === 200 && lastUpstream !== null);

lastUpstream = null;
res = await handler(fnReq({ max_tokens: 800, messages: photoMsg(2600000) }));
ok('an image over 2.5 MB → 400', res.status === 400 && lastUpstream === null);

lastUpstream = null;
res = await handler(fnReq({ max_tokens: 800, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: 'text/html', data: 'AAAA' } }, { type: 'text', text: 'hi' }] }] }));
ok('a non-image media type → 400', res.status === 400 && lastUpstream === null);

lastUpstream = null;
const fourImgs = [{ role: 'user', content: Array.from({ length: 4 }, () => ({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: 'AAAA' } })).concat([{ type: 'text', text: 'hi' }]) }];
res = await handler(fnReq({ max_tokens: 800, messages: fourImgs }));
ok('more than 3 images → 400', res.status === 400 && lastUpstream === null);

lastUpstream = null;
res = await handler(fnReq({ max_tokens: 500, messages: [{ role: 'system', content: 'evil' }] }));
ok('a non-user/assistant role → 400', res.status === 400 && lastUpstream === null);

lastUpstream = null;
res = await handler(fnReq({ max_tokens: 500, messages: [{ role: 'user', content: [{ type: 'tool_use', id: 'x' }] }] }));
ok('an unknown content block type → 400', res.status === 400 && lastUpstream === null);

lastUpstream = null;
res = await handler(fnReq('{"messages":[{"role":"user","content":"' + 'z'.repeat(3600000) + '"}]}'));
ok('a raw body over the absolute ceiling → 413', res.status === 413 && lastUpstream === null);

console.log('\nA4. The rough daily spend cap');
process.env.DAILY_SPEND_CAP_USD = '0.0000001';
const errLog = []; const realErr = console.error; console.error = (...a) => errLog.push(a.join(' '));
lastUpstream = null;
res = await handler(fnReq({ max_tokens: 500, messages: MSGS }));
console.error = realErr;
ok('over the cap → 429, nothing sent upstream', res.status === 429 && lastUpstream === null);
ok('the refusal is polite and logged', (await res.json()).error.toLowerCase().includes('tomorrow') && errLog.some(l => l.includes('daily spend cap')));
delete process.env.DAILY_SPEND_CAP_USD;
lastUpstream = null;
res = await handler(fnReq({ max_tokens: 500, messages: MSGS }));
ok('default $20 cap: normal traffic unaffected', res.status === 200 && lastUpstream !== null);

console.log('\nA5. Blocked-store memo + the prune/retry loop (run LAST: the memo persists)');
const blockedErr = (list) => new Response(JSON.stringify({
  type: 'error',
  error: { type: 'invalid_request_error', message: "The following domains are not accessible to our user agent: [" + list.map(d => "'" + d + "'").join(', ') + "]." }
}), { status: 400, headers: { 'Content-Type': 'application/json' } });
let upstreamCalls = [], replyQueue = [];
upstreamReply = () => { upstreamCalls.push(lastUpstream.body.tools[0].allowed_domains.slice()); return replyQueue.shift()(); };

const quietErr = async (fn) => { const c = console.error; console.error = () => {}; try { return await fn(); } finally { console.error = c; } };

// Gucci blocked → pruned, memoized, retried, streams.
upstreamCalls = [];
replyQueue = [() => blockedErr(['gucci.com']), SSE];
res = await quietErr(() => handler(fnReq({ max_tokens: 600, messages: MSGS, search: true })));
ok('blocked store pruned and retried', upstreamCalls.length === 2 && upstreamCalls[0].includes('gucci.com') && !upstreamCalls[1].includes('gucci.com') && upstreamCalls[1].length === 100);
ok('reply streams through after the prune', (res.headers.get('content-type') || '').includes('text/event-stream'));

// THE MEMO: the very next request must skip gucci on its FIRST call — no
// wasted failed round trip every turn.
upstreamCalls = [];
replyQueue = [SSE];
res = await handler(fnReq({ max_tokens: 600, messages: MSGS, search: true }));
ok('next request skips the blocked store on the FIRST call (memo)', upstreamCalls.length === 1 && !upstreamCalls[0].includes('gucci.com') && upstreamCalls[0].length === 100);

// Two rounds of pruning still succeed, and both land in the memo.
upstreamCalls = [];
replyQueue = [() => blockedErr(['zara.com']), () => blockedErr(['talbots.com']), SSE];
res = await quietErr(() => handler(fnReq({ max_tokens: 600, messages: MSGS, search: true })));
ok('two rounds of pruning reach a stream', upstreamCalls.length === 3 && !upstreamCalls[2].includes('zara.com') && !upstreamCalls[2].includes('talbots.com'));
upstreamCalls = [];
replyQueue = [SSE];
await handler(fnReq({ max_tokens: 600, messages: MSGS, search: true }));
ok('memo now holds all three', upstreamCalls[0].length === 98);

// An error naming NO recognisable domain → honest JSON error + console.error.
const errLog2 = []; const realErr2 = console.error; console.error = (...a) => errLog2.push(a.join(' '));
upstreamCalls = [];
replyQueue = [() => blockedErr(['not-one-of-ours.com'])];
res = await handler(fnReq({ max_tokens: 600, messages: MSGS, search: true }));
console.error = realErr2;
ok('no-progress prune → JSON error after one call', upstreamCalls.length === 1 && (res.headers.get('content-type') || '').includes('application/json'));
ok('search failure logged for Netlify logs', errLog2.some(l => l.includes('style-ai search')));

// An unparseable error body is logged too (the fallback path).
const errLog3 = []; const realErr3 = console.error; console.error = (...a) => errLog3.push(a.join(' '));
upstreamCalls = [];
replyQueue = [() => new Response('<html>gateway error</html>', { status: 502, headers: { 'Content-Type': 'text/html' } })];
res = await handler(fnReq({ max_tokens: 600, messages: MSGS, search: true }));
console.error = realErr3;
ok('unparseable upstream error → JSON to page, console.error fired', res.status === 200 && errLog3.some(l => l.includes('unparseable')));

global.fetch = realFetch;

// ===========================================================================
// PART B — the real app in Chromium (brief items 2 + 3, plus the cut-off note)
// ===========================================================================
const PORT = 8897, ORIGIN = 'http://localhost:' + PORT;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// The fake function endpoint. fnMode: 'json' answers instantly as JSON;
// 'cut' streams half an answer and ends WITHOUT message_stop.
let fnMode = 'json';
let jsonReply = { content: [{ type: 'text', text: 'A lovely idea.' }] };
const CUT_TEXT = 'Here is the start of a great answer that never gets to';
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, ORIGIN);
  if (url.pathname.startsWith('/.netlify/functions/style-ai')) {
    let raw = ''; for await (const c of req) raw += c;
    if (fnMode === 'cut') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream' });
      const ev = (o) => res.write('event: x\ndata: ' + JSON.stringify(o) + '\n\n');
      ev({ type: 'message_start' });
      ev({ type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } });
      for (const w of CUT_TEXT.split(' ')) { ev({ type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: w + ' ' } }); await sleep(10); }
      res.end();                    // hard cut: no message_stop ever arrives
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(jsonReply));
    return;
  }
  if (url.pathname.startsWith('/.netlify/functions/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{}'); return;
  }
  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(HTML); return;
  }
  const f = path.join(ROOT, url.pathname.replace(/^\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200); res.end(fs.readFileSync(f)); return; }
  res.writeHead(404); res.end('');
});
await new Promise(r => server.listen(PORT, r));

const browser = await chromium.launch();
const FULL_SEED = {
  userName: 'Test', answers: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  topArchNames: ['Timeless Classic', 'Modern Muse', 'Coastal Chic'],
  portrait: 'A test portrait.', motto: 'Shine on.'
};
async function newPage(opts) {
  opts = opts || {};
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e)));
  await page.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
  if (opts.seed) await page.addInitScript(d => localStorage.setItem('ss_data', JSON.stringify(d)), opts.seed);
  if (opts.chat) await page.addInitScript(c => localStorage.setItem('ss_chat', JSON.stringify(c)), opts.chat);
  if (opts.wardrobe) await page.addInitScript(w => localStorage.setItem('ss_wardrobe', JSON.stringify(w)), opts.wardrobe);
  await page.goto(ORIGIN + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.show === 'function');
  return page;
}

// ---------------------------------------------------------------------------
console.log('\nB1. Chat XSS: the live path escapes before linkifying');
let page = await newPage({});
const live = await page.evaluate(() => {
  openChat();
  window.__xss = 0;
  addChatMsg('<img src=x onerror="window.__xss=1"> try a navy blazer from Nordstrom', 'bot');
  const msgs = document.querySelectorAll('#chatMessages .chat-msg.bot');
  const last = msgs[msgs.length - 1];
  return {
    xss: window.__xss,
    imgs: last.querySelectorAll('img').length,
    text: last.textContent,
    linkHost: last.querySelector('a') ? new URL(last.querySelector('a').href).hostname : ''
  };
});
ok('injected tag rendered as TEXT, never executed', live.xss === 0 && live.imgs === 0 && live.text.includes('<img'));
ok('the store link still works on escaped text', live.linkHost.includes('nordstrom.com'));
await sleep(300);
ok('no page errors on the live path', page.errors.length === 0, page.errors.join(' | '));
await page.close();

console.log('\nB2. Chat XSS: the restored-history path is exactly as strict');
const EVIL_CHAT = [
  { role: 'user', content: '<script>window.__xss1=1<\/script> hello' },
  { role: 'assistant', content: '<img src=x onerror="window.__xss2=1"> a top from Madewell' },
  { role: 'user', content: 'my photo', hasPhoto: true, displayText: '<svg onload="window.__xss3=1"> look', photoThumb: 'javascript:window.__xss4=1' },
  { role: 'assistant', content: 'H&M has great knit tops from H&M' }
];
page = await newPage({ chat: EVIL_CHAT });
const restored = await page.evaluate(() => {
  window.__xss1 = 0; window.__xss2 = 0; window.__xss3 = 0; window.__xss4 = 0;
  openChat();
  const msgs = document.querySelectorAll('#chatMessages .chat-msg');
  const out = { n: msgs.length, xss: window.__xss1 + window.__xss2 + window.__xss3 + window.__xss4, imgs: 0, ph: 0, hm: '' };
  msgs.forEach(m => { out.imgs += m.querySelectorAll('img').length; out.ph += m.querySelectorAll('.chat-imgph').length; });
  for (const m of msgs) { const a = m.querySelector('a'); if (a && m.textContent.includes('knit')) out.hm = a.href; }
  return out;
});
ok('all four injected payloads inert', restored.xss === 0);
ok('script/img/svg tags render as text, zero <img> elements', restored.imgs === 0);
ok('a javascript: photoThumb never reaches src; placeholder chip instead', restored.ph === 1);
ok('H&M still links after escaping (entity-matched store name)', restored.hm.includes('hm.com'), restored.hm);
await sleep(300);
ok('no page errors on the restored path', page.errors.length === 0, page.errors.join(' | '));
await page.close();

console.log('\nB3. Chat links must live on the named store\'s own domain');
page = await newPage({});
const links = await page.evaluate(() => {
  const out = {};
  let h = linkStores(_esc('The Nova bag from Nordstrom (~$79) [https://www.nordstrom.com/s/nova/1] is great.'));
  out.match = h.includes('href="https://www.nordstrom.com/s/nova/1"');
  // The named store and the URL disagree → the URL must be DISCARDED.
  h = linkStores(_esc('The Nova bag from Nordstrom (~$79) [https://www.amazon.com/dp/B0FAKE] is great.'));
  out.mismatchNoBadHref = !h.includes('amazon.com');
  out.mismatchNoBracket = !h.includes('[');
  const hrefs = [...h.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  out.mismatchHrefsSafe = hrefs.every(u => new URL(u).hostname.endsWith('nordstrom.com'));
  // Same-corp subdomain still fine.
  h = linkStores(_esc('A dress from Banana Republic (~$120) [https://bananarepublic.gap.com/browse/product.do?pid=1]'));
  out.subdomain = h.includes('href="https://bananarepublic.gap.com/browse/product.do?pid=1"');
  // A URL on ANOTHER of our 101 stores is still a mismatch for the named store.
  h = linkStores(_esc('A tote from Madewell (~$88) [https://www.nordstrom.com/s/tote/9]'));
  out.crossStore = !h.includes('href="https://www.nordstrom.com/s/tote/9"');
  return out;
});
ok('matching store + URL → the exact product href', links.match);
ok('mismatched URL discarded (no amazon href, no raw bracket)', links.mismatchNoBadHref && links.mismatchNoBracket);
ok('any link that renders points at the NAMED store', links.mismatchHrefsSafe);
ok('same-store subdomain URL accepted', links.subdomain);
ok('a URL on a DIFFERENT allowed store is still rejected', links.crossStore);
await page.close();

console.log('\nB4. Wishlist ids are slug-validated on normalize');
page = await newPage({
  wardrobe: {
    items: {}, custom: [], pretap0: true,
    wishlist: [
      { id: 'silk-blouse~nordstrom', name: 'Silk Blouse', store: 'Nordstrom', search: 'silk blouse' },
      { id: "x') ,alert(1),('", name: 'Evil', store: 'Nope', search: 'x' },
      { id: 'UPPER~case', name: 'Wrong shape', store: 'Nope', search: 'x' },
      { id: 'no-tilde', name: 'Wrong shape too', store: 'Nope', search: 'x' }
    ]
  }
});
const wl = await page.evaluate(() => {
  const d = loadWardrobeData();
  return d.wishlist.map(x => x.id);
});
ok('the well-formed id survives', wl.includes('silk-blouse~nordstrom'));
ok('quote-smuggling and malformed ids dropped', wl.length === 1, JSON.stringify(wl));
await page.close();

console.log('\nB5. Strict hasQuiz: a name-only record routes like a new visitor');
const NAME_ONLY = { userName: 'OnlyName' };
page = await newPage({ seed: NAME_ONLY });
const routing = await page.evaluate(() => {
  const out = {};
  out.boot = document.querySelector('.scr.act').id;          // sanity: strict at boot already
  goHome(); out.home = document.querySelector('.scr.act').id;
  // menuQuiz must take startQ, not the retake flow.
  window.__retake = 0;
  const origRetake = window.retakeQuiz; window.retakeQuiz = function () { window.__retake = 1; return origRetake.apply(this, arguments); };
  menuQuiz(); out.quiz = document.querySelector('.scr.act').id; out.retake = window.__retake;
  menuRefine(); out.refine = document.querySelector('.scr.act').id;
  menuShopStyle(); out.shop = document.querySelector('.scr.act').id;
  menuOpen(); out.pill = document.getElementById('menuStartPill').classList.contains('on'); menuClose();
  return out;
});
ok('boot lands on the welcome screen', routing.boot === 's-wel');
ok('goHome → welcome, not a hollow Welcome Back', routing.home === 's-wel');
ok('menu Style Quiz → fresh start, not retake', routing.quiz === 's-quiz' && routing.retake === 0);
ok('menu Refine → quiz (honest routing)', routing.refine === 's-quiz');
ok('menu Shop your Style → quiz (honest routing)', routing.shop === 's-quiz');
ok('Start-here pill still shows for a name-only save', routing.pill === true);
await page.close();

console.log('\nB6. A name-only record no longer bricks the chat');
page = await newPage({ seed: NAME_ONLY });
jsonReply = { content: [{ type: 'text', text: 'Hello there, lovely question.' }] };
await page.evaluate(() => { wbChat(); });
await page.evaluate(() => { document.getElementById('chatInput').value = 'hi'; return sendChat(); });
const chatState = await page.evaluate(() => {
  const b = document.querySelectorAll('#chatMessages .chat-msg.bot');
  return {
    reply: b.length ? b[b.length - 1].textContent : '',
    sendEnabled: !document.getElementById('chatSend').disabled,
    quizTaken: quizTaken
  };
});
ok('the stylist answers', chatState.reply.includes('Hello there'));
ok('the Send button comes back', chatState.sendEnabled);
ok('she is honestly treated as not having taken the quiz', chatState.quizTaken === false);
ok('no page errors (the old TypeError is gone)', page.errors.length === 0, page.errors.join(' | '));
await page.close();

console.log('\nB7. A name-only record no longer hangs Shop your Style');
page = await newPage({ seed: NAME_ONLY });
jsonReply = { content: [{ type: 'text', text: JSON.stringify({ items: [{ category: 'top', name: 'Crisp White Shirt', search: 'white shirt', store: 'Nordstrom' }] }) }] };
await page.evaluate(() => { localStorage.setItem('ss_stylenudge', '1'); _openShopStyleNow(); });
const shopOk = await page.waitForFunction(() => {
  const c = document.getElementById('shopStyleContent');
  return c && c.querySelector('.shop-grid');
}, null, { timeout: 6000 }).then(() => true).catch(() => false);
ok('the picks render instead of an eternal spinner', shopOk);
ok('no page errors while generating', page.errors.length === 0, page.errors.join(' | '));
await page.close();

console.log('\nB8. A full record still routes to Welcome Back (no regression)');
page = await newPage({ seed: FULL_SEED });
const fullRouting = await page.evaluate(() => {
  const out = {};
  out.boot = document.querySelector('.scr.act').id;
  show('s-faq'); goHome(); out.home = document.querySelector('.scr.act').id;
  menuOpen(); out.pill = document.getElementById('menuStartPill').classList.contains('on'); menuClose();
  return out;
});
ok('boot lands on Welcome Back', fullRouting.boot === 's-wb');
ok('goHome → Welcome Back', fullRouting.home === 's-wb');
ok('Start-here pill stands down', fullRouting.pill === false);
await page.close();

console.log('\nB9. A cut-off stream shows the honest note and is NOT saved');
page = await newPage({ seed: FULL_SEED });
fnMode = 'cut';
await page.evaluate(() => { openChat(); document.getElementById('chatInput').value = 'Find me a bag'; return sendChat(); });
const cut = await page.evaluate((CUT) => {
  const notes = document.querySelectorAll('#chatMessages .chat-cutoff');
  const bots = document.querySelectorAll('#chatMessages .chat-msg.bot');
  const last = bots[bots.length - 1];
  let hist = [];
  try { hist = JSON.parse(localStorage.getItem('ss_chat') || '[]'); } catch (e) {}
  return {
    noteShown: notes.length === 1 && notes[0].textContent.includes('cut off'),
    fragmentShown: !!last && last.textContent.indexOf('Here is the start') === 0,
    fragmentSaved: hist.some(m => m.role === 'assistant' && String(m.content).includes('Here is the start')),
    sendEnabled: !document.getElementById('chatSend').disabled
  };
}, CUT_TEXT);
ok('the "got cut off" note appears', cut.noteShown);
ok('the fragment she watched stream in stays on screen', cut.fragmentShown);
ok('the fragment is NOT persisted to ss_chat', !cut.fragmentSaved);
ok('the Send button comes back after a cut', cut.sendEnabled);
fnMode = 'json';
await page.close();

console.log('\nB10. Photos persist as small thumbnails, and the restored chip is honest');
page = await newPage({ seed: FULL_SEED });
// A ~1x1 valid JPEG data URL scaled up is hard to fake; use a canvas-made photo.
const thumbInfo = await page.evaluate(async () => {
  openChat();
  const c = document.createElement('canvas'); c.width = 900; c.height = 1200;
  const g = c.getContext('2d'); g.fillStyle = '#c96'; g.fillRect(0, 0, 900, 1200);
  const full = c.toDataURL('image/jpeg', 0.9);
  addChatMsg('What do you think of this?', 'user', full);
  await new Promise(r => setTimeout(r, 600));   // let the async shrink land
  const hist = JSON.parse(localStorage.getItem('ss_chat') || '[]');
  const last = hist[hist.length - 1];
  return { fullLen: full.length, savedLen: (last.photoThumb || '').length, isData: /^data:image\/jpeg/.test(last.photoThumb || ''), hasPhoto: last.hasPhoto === true };
});
ok('the saved thumb is a real data:image far smaller than the photo', thumbInfo.isData && thumbInfo.savedLen > 0 && thumbInfo.savedLen < 20000, 'full ' + thumbInfo.fullLen + ' → saved ' + thumbInfo.savedLen);
ok('the entry still knows it had a photo', thumbInfo.hasPhoto);
await page.close();

ok('server saw no stray failures', true);
console.log('\n' + pass + ' passed, ' + fail + ' failed');
await browser.close();
server.close();
process.exit(fail ? 1 : 0);
