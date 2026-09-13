// fetchretry.mjs — the one quiet retry before she ever sees a failure, 2026-09-13.
//
// ▶▶ HER OWN QUESTION BEFORE THIS WAS BUILT: "What is your opinion on this? Does it
//   take a lot of time? And what are the chances it would work a second time?"
//   She wanted a real answer, not the decision handed back to her cold. The answer
//   given and accepted: a one-off network blip usually clears on a retry; a real
//   outage or the style-ai 32KB prompt-length rejection (_PROMPT_SAFE) fails
//   IDENTICALLY twice. So: exactly one retry, after a short pause, never a loop —
//   bounded cost, genuine chance of helping on the everyday case.
//
// This pins `_fetchRetry` itself, the ONE helper wired into all four call sites
// her complaint named (`_findFetch`, `_shopStyleGen`, `_wardrobeIdeaGen`,
// `_wdrMoreIdeas`) — never `sendChat` or photo analysis, which were not part of
// what she asked for.
//
// Run: node scratchpad/fetchretry.mjs
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = 8997;
let pass = 0, failn = 0;
const ok = (n, c, x) => c ? (pass++, console.log('  ok   ' + n))
                          : (failn++, console.log('  FAIL ' + n + (x ? ' — ' + x : '')));

const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html' : p.endsWith('.css') ? 'text/css' : 'application/octet-stream' });
  r.end(fs.readFileSync(f));
});
await new Promise(r => srv.listen(PORT, r));

console.log('\n1. _fetchRetry is wired into exactly her four named surfaces, never chat or photo analysis');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
ok('_fetchRetry exists as one shared helper', /async function _fetchRetry\(url,opts\)/.test(HTML));
ok('_findFetch (chat + Shop your Style + Wardrobe search) uses it', /_fetchRetry\('\/\.netlify\/functions\/product-find'/.test(HTML));
const styleAiRetryCount = (HTML.match(/_fetchRetry\("\/\.netlify\/functions\/style-ai"/g) || []).length;
ok('style-ai is retried at exactly 3 call sites (_shopStyleGen, _wardrobeIdeaGen, _wdrMoreIdeas)', styleAiRetryCount === 3, 'found ' + styleAiRetryCount);
const bareStyleAiCount = (HTML.match(/[^y]fetch\("\/\.netlify\/functions\/style-ai"/g) || []).length;
ok('the remaining style-ai call sites (chat, photo analysis) are untouched, deliberately', bareStyleAiCount >= 4, 'found ' + bareStyleAiCount);

/* ⚠️ ONE SHARED PAGE FOR ALL THREE LIVE SCENARIOS, deliberately — a fresh browser
   context per scenario proved flaky in this sandbox (background telemetry noise
   through the sandbox's own egress proxy destabilises a 3rd/4th context in one
   process), unrelated to the app. `unroute` swaps the fake endpoint's behavior
   between scenarios instead of spinning up a new context each time. */
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext();
const pg = await ctx.newPage();
await pg.goto(`http://localhost:${PORT}/`);

console.log('\n2. a transient failure clears on the retry — the everyday case this exists for');
{
  let n = 0;
  await pg.route(u => u.pathname.includes('/fake'), r => {
    n++;
    return n === 1 ? r.fulfill({ status: 500, body: 'nope' })
                   : r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  const res = await pg.evaluate(async () => {
    const t0 = Date.now();
    const r = await _fetchRetry('/fake', {});
    return { ok: r.ok, status: r.status, ms: Date.now() - t0 };
  });
  ok('recovers on the second try', res.ok && res.status === 200);
  ok('waits before retrying — not an instant hammer', res.ms >= 1200);
  ok('exactly 2 requests were made for one failure', n === 2);
  await pg.unroute(u => u.pathname.includes('/fake'));
}

console.log('\n3. a persistent failure (her real-outage case) costs exactly one extra call, never a loop');
{
  let n = 0;
  await pg.route(u => u.pathname.includes('/fake'), r => { n++; return r.fulfill({ status: 500, body: 'still nope' }); });
  const res = await pg.evaluate(async () => {
    const r = await _fetchRetry('/fake', {});
    return { ok: r.ok, status: r.status };
  });
  ok('the caller still sees the failure (its own if(!r.ok)throw 0 still fires)', !res.ok && res.status === 500);
  ok('bounded at exactly 2 requests, an outage is never spent on in a loop', n === 2);
  await pg.unroute(u => u.pathname.includes('/fake'));
}

console.log('\n4. a thrown network error (not just a bad status) is caught and retried too');
{
  let n = 0;
  await pg.route(u => u.pathname.includes('/fake'), r => {
    n++;
    return n === 1 ? r.abort() : r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  const res = await pg.evaluate(async () => {
    try { const r = await _fetchRetry('/fake', {}); return { threw: false, ok: r.ok }; }
    catch (e) { return { threw: true }; }
  });
  ok('a dropped connection on attempt 1 does not throw out to the caller', !res.threw && res.ok);
}

console.log(`\n${pass} passed, ${failn} failed`);
await ctx.close();
await browser.close();
srv.close();
process.exit(failn ? 1 : 0);
