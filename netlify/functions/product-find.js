// REAL PRODUCTS FOR ONE REQUEST A WOMAN TYPED IN HER OWN WORDS.
//
// ▶▶ CATH, 2026-09-06: "The service finds. Style Star chooses."
//    This function is the FINDING half and nothing else. It searches, filters to
//    her shops, verifies each product on its own retailer offer, and hands back
//    a pool with an honest verdict on every requirement she stated.
// ⚠️⚠️ IT DOES NOT APPLY HER RULES. Never-wear, her colour no's and the price
//    spread run ON THE PAGE, through filterNeverWear() and the same picker every
//    other shopping surface uses. A second copy of her brief here IS the bug this
//    project paid for four times in one day. Do not add one.
//
// 🔒 THE SEARCH KEY LIVES HERE, NEVER IN THE PAGE. env: SERPAPI_KEY.
//    Without it this returns an empty pool rather than an error, so the chat
//    degrades to advice instead of showing a woman a failure.
import {
  buildQueries, matchStore, isResale, judge, widenOptions,
} from './lib/find-products.js';
import {buildJudgePrompt, parseJudgement, statedKeys} from './lib/judge-products.js';
import STORES from './lib/store-domains.js';

const ALLOWED_HOSTS = ['stylestar.app', 'www.stylestar.app'];
const hostOf = (v) => { try { return new URL(v).host.toLowerCase(); } catch { return ''; } };
// Same speed bump as user-data.js, style-ai.js and product-search.js,
// deliberately identical — including the *.netlify.app restriction.
function isAllowed(req) {
  const requestHost = (req.headers.get('host') || '').toLowerCase();
  const allowed = new Set(ALLOWED_HOSTS);
  if (/(^|\.)netlify\.app$/.test(requestHost)) allowed.add(requestHost);
  const o = hostOf(req.headers.get('origin')), r = hostOf(req.headers.get('referer'));
  if (!o && !r) return false;
  return allowed.has(o) || allowed.has(r);
}

// ⚠️ A SHOPPING SEARCH COSTS REAL MONEY PER CALL, which no other function here
//    does, so the rate limit is TIGHTER than product-search.js's 60/min and the
//    per-request ceiling is hard. Cath's stance (2026-09-06) is experience first,
//    cost understood later — but a cap is the seatbelt, not a second-guess.
const RATE_MAX = 8, RATE_WINDOW_MS = 60 * 1000;
const MAX_QUERIES = 4;        // pooled, never one broad replacing one narrow
const MAX_VERIFY = 6;         // second calls, the expensive half

/* 🚨🚨🚨 THE NUMBER THAT REFRAMES THE WHOLE COST QUESTION, worked out 2026-09-08:
   ONE SHOPPING QUESTION IS NOT ONE SEARCH. It is up to MAX_QUERIES searches plus
   up to MAX_VERIFY product look-ups, and SerpApi counts every call as a search.
   ▶▶ So up to TEN per question — and a "250 searches a month" free plan is really
      about 25 to 60 shopping questions a month, in total, across all users.
   ⚠️ On 2026-09-08 the account stood at 216/250 with 34 left, i.e. THREE TO EIGHT
      more questions. Most of that was a single afternoon of testing against the
      live endpoint, which is a mistake not to repeat: build against the captured
      fixtures in scratchpad/findprod.js, not against her allowance.

   ▶ THE RESERVE FLOOR BELOW IS THE SEATBELT SHE ASKED FOR (her words, 2026-09-06:
     "a cap is the seatbelt, not a second-guess"). It asks SERPAPI ITSELF how many
     searches are left, which is free — the account endpoint is not a search — and
     exact, and needs nothing set up. Below the floor the finder stops searching
     and says so honestly, rather than quietly returning nothing, which is the
     failure mode this whole app is built against. */
/* 🚨🚨 DEFAULT ZERO — WARN, NEVER BLOCK. Corrected 2026-09-08 after she read what
   the floor actually did and said plainly: "at this point my focus is on making
   the app as good as it can be, not adding resistance."
   ▶ SHE IS RIGHT, AND THE ORIGINAL 20 WAS ARGUED FROM A PHRASE SHE NEVER SAID.
     "The cap is the seatbelt" was Claude's line, quoted back to her as hers. Her
     real position, 2026-09-06, is the opposite emphasis: "I would rather make
     the experience excellent first and then understand and control the cost once
     we see how women actually use it."
   ⚠️ AND A RESERVE IS WORSE THAN IT LOOKS: on a fixed monthly allowance it saves
     no money at all — it only decides WHO gets the last searches. A floor of 20
     meant a real woman got the degraded app so that testing could continue. That
     is exactly backwards.
   ▶ SO THE CEILING IS NOW A WARNING, NOT A GATE: the Saturday watchdog reports
     what is left and shouts before it runs out (her ask: "I don't want it to run
     out"). This constant stays at 0 so nothing is ever refused while searches
     remain; it is kept, and settable, only for a future METERED plan where
     overspending would mean a real bill rather than simply running out. */
const RESERVE = Number(process.env.SERPAPI_RESERVE || 0);
let acct = {at: 0, left: null};
async function searchesLeft(KEY) {
  if (Date.now() - acct.at < 10 * 60 * 1000) return acct.left;
  let left = null;
  try {
    const r = await fetch('https://serpapi.com/account.json?api_key=' + KEY,
      {signal: AbortSignal.timeout(4000)});
    if (r.ok) {
      const d = await r.json();
      const n = Number(d.total_searches_left ?? d.plan_searches_left);
      if (Number.isFinite(n)) left = n;
    }
  } catch { /* fail OPEN, briefly — see below */ }
  // ⚠️ FAIL OPEN, AND DELIBERATELY. If the account check itself fails we do NOT
  //    block shopping: refusing to search because a diagnostic call broke would
  //    take the feature down to protect a budget, which is the wrong trade. The
  //    10-minute memo means a broken check is retried soon rather than sticking.
  acct = {at: Date.now(), left};
  return left;
}
const rateHits = new Map();
const clientIp = (req) => req.headers.get('x-nf-client-connection-ip') ||
  (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
function rateLimited(req) {
  const ip = clientIp(req), now = Date.now();
  const hits = (rateHits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  hits.push(now); rateHits.set(ip, hits);
  if (rateHits.size > 2000) for (const [k, v] of rateHits)
    if (!v.length || now - v[v.length - 1] > RATE_WINDOW_MS) rateHits.delete(k);
  return hits.length > RATE_MAX;
}

// ⭐ CACHING IS THE REAL COST LEVER, and it is why "black ankle boots" asked by
//    500 women is one search. Warm-instance only, so it is a bonus and never a
//    guarantee — never build anything that depends on a hit.
const CACHE = new Map(), CACHE_TTL = 30 * 60 * 1000, CACHE_MAX = 200;
const cacheGet = (k) => { const e = CACHE.get(k); if (!e) return null;
  if (Date.now() - e.at > CACHE_TTL) { CACHE.delete(k); return null; } return e.v; };
const cacheSet = (k, v) => { if (CACHE.size >= CACHE_MAX) CACHE.delete(CACHE.keys().next().value);
  CACHE.set(k, {at: Date.now(), v}); };

// ⚠️ EVERY FIELD IS VALIDATED, NOT TRUSTED. The values reach an outbound URL, and
//    they arrive from a model reading a stranger's sentence. Short, plain, capped.
const CLEAN = /^[a-z0-9][a-z0-9 '\-/.]{0,39}$/i;
function cleanReq(body) {
  const out = {};
  for (const k of ['item', 'colour', 'fabric', 'cut', 'size', 'width']) {
    const v = String(body[k] ?? '').trim();
    if (v && CLEAN.test(v)) out[k] = v.toLowerCase();
  }
  return out.item ? out : null;
}

const json = (body, headers, status = 200) =>
  new Response(JSON.stringify(body), {status, headers});

export default async (req) => {
  const reqOrigin = req.headers.get('origin') || '';
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_HOSTS.includes(hostOf(reqOrigin)) ? reqOrigin : 'https://www.stylestar.app',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
  if (req.method === 'OPTIONS') return new Response(null, {status: 204, headers});

  /* ▶ THE BUDGET PROBE — free, and the reason the Saturday watchdog needs no new
     secret. SerpApi's account endpoint is NOT a search, so asking it costs
     nothing. Deliberately outside the origin guard: a GitHub Action has no
     Origin or Referer header, and the only thing this returns is how many
     searches are left, which is already on every normal response. It never
     searches and never touches the key beyond that one call. */
  /* ▶ FIXTURE CAPTURE, added 2026-09-08. Runs ONE search and returns the RAW
     shopping results, so the whole rebuild can be developed and tested offline
     against real data instead of against her allowance — the way findprod.js
     already works. Costs one search, once, rather than one per test run.
     ⚠️ Behind the same origin guard as everything else, and it returns only what
     a shopping search returns. It exists to answer a specific question: what can
     a card honestly say WITHOUT the expensive per-product look-up? */
  if (new URL(req.url).searchParams.get('capture') === '1' && isAllowed(req)) {
    const KEY1 = process.env.SERPAPI_KEY;
    const q = (new URL(req.url).searchParams.get('q') || '').slice(0, 60);
    if (!KEY1 || !q) return json({error: 'need q'}, headers, 400);
    try {
      const r = await fetch('https://serpapi.com/search.json?' + new URLSearchParams({
        engine: 'google_shopping', q, gl: 'us', hl: 'en', num: '60', api_key: KEY1,
      }), {signal: AbortSignal.timeout(20000)});
      const d = await r.json();
      return json({q, count: (d.shopping_results || []).length,
                   results: (d.shopping_results || []).slice(0, 12)}, headers);
    } catch (e) { return json({error: String(e).slice(0, 120)}, headers, 502); }
  }

  if (new URL(req.url).searchParams.get('budget') === '1') {
    const KEY0 = process.env.SERPAPI_KEY;
    if (!KEY0) return json({searchesLeft: null, why: 'no-key'}, headers);
    return json({searchesLeft: await searchesLeft(KEY0)}, headers);
  }
  if (!isAllowed(req)) return json({error: 'Not allowed'}, headers, 403);
  if (rateLimited(req)) return json({error: 'Too many requests'}, headers, 429);
  if (req.method !== 'POST') return json({error: 'Method not allowed'}, headers, 405);

  let body = {}; try { body = await req.json(); } catch { body = {}; }
  const request = cleanReq(body);
  if (!request) return json({error: 'Unknown request'}, headers, 400);

  const KEY = process.env.SERPAPI_KEY;
  // ▶ NO KEY IS NOT AN ERROR. The chat must fall back to ordinary stylist advice,
  //   never show a woman a broken screen. `why` says which, for diagnosis only.
  if (!KEY) return json({exact: [], doors: [], why: 'no-key'}, headers);

  const cacheKey = JSON.stringify(request);
  const hit = cacheGet(cacheKey);
  if (hit) return json({...hit, cached: true}, headers);

  // ⏱⏱ THE TIMEOUTS ARE PER-CALL AND DELIBERATELY DIFFERENT, MEASURED 2026-09-08.
  //    Instrumenting the two halves settled an argument that guessing had lost
  //    twice. On four live requests the SEARCH took 33ms, 93ms, 134ms and 5.9s —
  //    while the LOOK-UPS came back at 12,001 / 12,002 / 12,002 / 12,016ms, i.e.
  //    pinned to the millisecond on the old shared 12s ceiling.
  // ▶▶ SO NOTHING WAS SLOW EXCEPT THE WAITING. 2 to 5 of the 6 look-ups answer
  //    quickly; at least one never answers at all, and Promise.all waits for the
  //    slowest, so EVERY request paid 12 seconds for one straggler.
  // ⚠️ A shopping answer that takes 12s is a woman deciding the app is broken and
  //    clicking out — and past ~30s it was a 504 that reached her as silence.
  //    The design assumed 5-8s.
  // ▶ The search keeps a long ceiling because losing it loses EVERYTHING. A
  //   look-up is one product among six, so it gets a short one and the batch
  //   moves on without it. Missing one card is invisible; waiting is not.
  const get = async (url, ms = 10000) => {
    const r = await fetch(url, {signal: AbortSignal.timeout(ms)});
    if (!r.ok) throw new Error('upstream ' + r.status);
    return r.json();
  };
  const LOOKUP_MS = 6000;

  /* 🚨🚨 CONCURRENCY IS CAPPED, AND THE REASON MATTERS MORE THAN THE NUMBER.
     Making the calls parallel took a common search from 12s to well under 1s —
     and then FRESH searches started pinning at their ceiling too (10,002 /
     10,008 / 10,009ms), which sequential calls never did.
     ▶ The most likely cause is the plan's own CONCURRENT-REQUEST limit: firing
       up to 4 searches AND 6 look-ups at once means ten simultaneous calls, and
       a queued request looks exactly like a slow one from here.
     ⚠️ UNVERIFIED — it needs the SerpApi dashboard, which only Cath can see, so
       it is written as a suspicion and not as a finding. Do not "confirm" it
       from the code.
     ▶ Either way a small pool is the right shape: it keeps almost all of the
       parallel win (the slowest call sets the pace, not the sum) without ever
       asking the upstream for ten things at once. */
  async function pooled(items, fn, width = 3) {
    const out = new Array(items.length);
    let next = 0;
    await Promise.all(Array.from({length: Math.min(width, items.length)}, async () => {
      while (true) {
        const i = next++;
        if (i >= items.length) return;
        out[i] = await fn(items[i], i);
      }
    }));
    return out;
  }

  try {
    // --- 1. POOL SEVERAL QUERIES ------------------------------------------
    // ⚠️ Measured 2026-09-06: broadening CHANGES the pool rather than enlarging
    //    it, so a broad query alone loses pieces the narrow one found.
    // 🚨🚨 PARALLEL, NOT SEQUENTIAL — FIXED 2026-09-08 AND IT WAS THE WHOLE SPEED
    //    PROBLEM. This ran the queries one after another, then the second calls
    //    one after another: up to 4 + 6 = TEN round trips end to end, each with a
    //    12s ceiling. Measured on the live site before the fix: 9.7s, 13.2s,
    //    18.1s, and two that died at ~31s with a 504.
    // ▶▶ AND A TIMEOUT REACHED HER AS SILENCE. The page renders nothing when the
    //    call fails (deliberately, so the stylist's advice still stands), so a
    //    woman saw advice with no products and the PREVIOUS search's cards still
    //    above it — which is exactly what Cath reported as "you just showed me
    //    the exact same thing when I asked for something different".
    // ⚠️ ORDER IS STILL PRESERVED ON PURPOSE. The pool is filled in QUERY order,
    //    not completion order, because the 2026-09-06 measurement showed
    //    broadening CHANGES the pool rather than enlarging it — the narrow query
    //    found the DVF the broad one lost. Promise.all keeps array order, so the
    //    dedup still favours the earlier (narrower) query exactly as before.
    // ⏱ TIMED, because the first speed fix did not land where it was expected and
    //   guessing twice is worse than measuring once. Returned on the response so
    //   a slow search can be diagnosed from outside without redeploying.
    // ▶ THE FLOOR, CHECKED BEFORE A SINGLE SEARCH IS SPENT. Honest on the way
    //   out: `why: 'budget'` is NOT the same as "I looked and found nothing", and
    //   the page must never render it as though it were.
    const left = await searchesLeft(KEY);
    if (left !== null && left <= RESERVE) {
      return json({exact: [], doors: [], request, why: 'budget', searchesLeft: left}, headers);
    }

    const t0 = Date.now();
    const queries = buildQueries(request).slice(0, MAX_QUERIES);
    const pages = await pooled(queries, q =>
      get('https://serpapi.com/search.json?' + new URLSearchParams({
        engine: 'google_shopping', q, gl: 'us', hl: 'en', num: '60', api_key: KEY,
      })).catch(() => null), MAX_QUERIES);
    /* ⚠️ WIDTH RAISED FROM 2 TO ALL-AT-ONCE, 2026-09-08, AND THE REASON CHANGED.
       The narrow pool was a guess at a free-plan concurrency limit, made when
       fresh searches started pinning at their ceiling. She has since moved to a
       PAID plan, so the queries run together again: with a width of 2 a
       four-query request paid for TWO rounds of the slowest search, which
       measured 12.8s on its own. The look-ups keep their smaller pool — there
       are more of them and they matter less individually. */
    const pool = new Map();
    for (const d of pages) {
      if (!d) continue;                       // one dead query must not kill the rest
      for (const x of d.shopping_results || []) {
        const id = x.product_id || x.title;
        if (id && !pool.has(id)) pool.set(id, x);
      }
    }

    // --- 2. HER SHOPS ONLY, NO RESALE --------------------------------------
    const mine = [...pool.values()]
      .map(x => ({raw: x, store: matchStore(x.source, STORES)}))
      .filter(x => x.store && !isResale(x.raw.source) && !x.raw.second_hand_condition);

    // Spend the expensive second calls where the title already agrees most.
    // ▶ A cheap ORDERING heuristic only. It never decides anything: judge() does.
    const promise = (t = '') => ['colour', 'fabric', 'cut']
      .reduce((n, k) => n + (request[k] && t.toLowerCase().includes(request[k]) ? 1 : 0), 0);
    mine.sort((a, b) => promise(b.raw.title) - promise(a.raw.title));

    // --- 3. VERIFY ON THE REAL OFFER, NEVER THE TITLE ----------------------
    // 🚨 The whole reason this step exists: the DVF "Jeanne Silk Jersey Wrap
    //    Dress" reads perfectly in its title and is a TIGER PRINT in its offer.
    // ⚠️ ALSO PARALLEL NOW, same reason. These are the EXPENSIVE half (one call per
    //    product), so running six of them in series was most of the wall clock.
    //    ▶ Order is preserved: Promise.all returns in input order, so the
    //      "spend the second calls where the title already agrees most" sort above
    //      still decides which pieces get looked at, and in what order they land.
    const tSearch = Date.now() - t0, t1 = Date.now();
    const looked = await pooled(mine.slice(0, MAX_VERIFY), c =>
      c.raw.serpapi_immersive_product_api
        ? get(c.raw.serpapi_immersive_product_api + '&api_key=' + KEY, LOOKUP_MS)
            .then(d => ({c, d})).catch(() => null)
        : Promise.resolve(null), 3);

    const tLook = Date.now() - t1;
    const verified = [];
    for (const got of looked) {
      if (!got) continue;
      const {c, d} = got;
      const p = d.product_results || {};
      const offers = (p.stores || []).filter(o => matchStore(o.name, STORES) && !isResale(o.name));
      const best = offers.sort((a, b) => (a.extracted_price ?? 1e9) - (b.extracted_price ?? 1e9))[0];
      if (!best || !best.link) continue;
      const variants = p.variants || [];
      const pick = (re) => (variants.find(v => re.test(v.title || '')) || {}).items || [];
      verified.push({
        id: c.raw.product_id || best.link,
        title: p.title || c.raw.title,
        brand: p.brand || '',
        store: matchStore(best.name, STORES),
        price: best.price || '',
        priceValue: best.extracted_price ?? null,
        url: best.link,
        image: c.raw.thumbnail || (p.thumbnails || [])[0] || '',
        offerTitle: best.title || '',
        description: (p.about_the_product || {}).description || '',
        colourway: pick(/colou?r/i).map(i => i.name).filter(n => n && !/^any /i.test(n)).join(' '),
        sizes: pick(/size/i).map(i => i.name).filter(n => n && !/^any /i.test(n)),
        details: best.details_and_offers || [],
      });
    }

    // --- 4. THE STYLIST READS THEM, THEN HER DOORS -------------------------
    /* 🚨🚨 THE CHANGE OF 2026-09-08. Judging used to be an 8-word lookup table and
       it could not tell that "The Fitted Cotton Poplin Shirt" is fitted. Cath's
       own diagnosis: "I feel like our app already knows what we are trying to
       deliver" — it does, and the finder was the one part never told.
       ▶ THE SPLIT IS DELIBERATE AND IT IS THE PROMISE/JUDGEMENT LINE:
         COLOUR, FABRIC and CUT go to the STYLIST, because they need reading.
         SIZE, WIDTH and STOCK stay in CODE, because they are factual lookups
         against structured variant data — and width especially is safety
         critical (telling a woman with wide feet that a medium fits is the
         promise this app exists never to make; verifyWidth already encodes the
         DSW boot that contradicts itself).
       ⚠️ AND THE FALLBACK IS THE OLD PATH, NOT AN EMPTY ONE. If the model call
         fails, judge() runs exactly as before, so this can never be WORSE than
         what shipped yesterday. */
    const READ = ['colour', 'fabric', 'cut'].filter(k => request[k]);
    let read = null;
    if (READ.length && verified.length && process.env.ANTHROPIC_API_KEY) {
      const sub = Object.fromEntries([['item', request.item], ...READ.map(k => [k, request[k]])]);
      try {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {'Content-Type': 'application/json',
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'},
          body: JSON.stringify({
            /* ⚠️ A FAST MODEL HERE ON PURPOSE, AND THE VALIDATOR IS WHY IT IS SAFE.
               This is a narrow, well-scoped reading task — does this product's own
               text show what she asked for — and parseJudgement throws away any
               "confirmed" whose quote is not genuinely in that product's text. So
               the honesty does not rest on the model's care; it rests on the check.
               ▶ Measured before the change: the reading step cost ~6s of an 18-24s
                 answer, on a screen where the design assumed 5-8s in total. */
            model: 'claude-haiku-4-5-20251001', max_tokens: 1500,
            messages: [{role: 'user', content: buildJudgePrompt(sub, verified)}],
          }),
          signal: AbortSignal.timeout(12000),
        });
        if (r.ok) {
          const d = await r.json();
          const text = (d.content || []).map(c => c.text || '').join('');
          read = parseJudgement(text, sub, verified);
        }
      } catch { read = null; }   // -> falls back to judge() below
    }

    const shaped = verified.map((p, i) => {
      const v = judge(request, p);
      /* ▶ MERGE: the stylist's reading REPLACES the word list for the three keys
         she read, and nothing else moves. Her verdicts have already been through
         parseJudgement, which throws away any "confirmed" whose quote is not
         genuinely in that product's own text — so an invented tick cannot reach
         here. Everything it could not confirm is UNKNOWN, and unknown is never
         a pass, exactly as before. */
      if (read && read[i]) {
        const ev = {};
        for (const k of READ) {
          v.checks[k] = read[i].checks[k].verdict;
          if (read[i].checks[k].evidence) ev[k] = read[i].checks[k].evidence;
        }
        const stated = Object.entries(v.checks).filter(([k]) => k !== 'stock');
        v.rejected = stated.filter(([, x]) => x === 'rejected').map(([k]) => k);
        v.unknown  = stated.filter(([, x]) => x === 'unknown').map(([k]) => k);
        v.exact = v.rejected.length === 0 && v.unknown.length === 0 && v.checks.stock !== 'rejected';
        v.evidence = ev;
      }
      return {
        ...p,
        // What the page needs to speak honestly about this piece.
        checks: v.checks, unconfirmed: v.unknown, exact: v.exact,
        // ▶ The stylist's own words for each tick. This is what turns a green
        //   check into something a woman can trust: not "silk ✓" but "silk ✓,
        //   because the page says 100% silk".
        evidence: v.evidence || null,
        // filterNeverWear() on the page reads these two, so give it real text.
        name: p.title, search: [p.brand, p.title].filter(Boolean).join(' '),
      };
    });
    const exact = shaped.filter(p => p.exact);
    // ▶ HER RULE: show the one true match confidently; only then offer to widen,
    //   and let HER choose which requirement to release.
    const doors = exact.length ? [] : widenOptions(request, verified).map(d => ({
      release: d.releases, softenedTo: d.softenedTo, keeps: d.keeps,
      products: d.products.map(({product, verdict, differs}) => {
        const s = shaped.find(x => x.id === product.id) || product;
        return {...s, checks: verdict.checks, unconfirmed: verdict.unknown, differs};
      }),
    }));

    const payload = {exact, doors, request, searched: queries.length, verified: verified.length,
      // ⏱ ms spent in each half. Cheap, and it is what turned 'the finder is
      //   slow' into 'the SEARCH is slow and the look-ups are fine', which are
      //   completely different repairs.
      ms: {search: tSearch, lookup: tLook, candidates: mine.length},
      // Free to know and worth knowing: how close the month is to its ceiling.
      searchesLeft: left};
    cacheSet(cacheKey, payload);
    return json(payload, headers);
  } catch (e) {
    console.error('[product-find] ' + (e && e.message));
    // Same principle as every failure above: an empty pool, never an error.
    return json({exact: [], doors: [], why: 'threw'}, headers);
  }
};
