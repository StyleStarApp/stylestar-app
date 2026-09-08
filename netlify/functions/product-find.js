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
    const t0 = Date.now();
    const queries = buildQueries(request).slice(0, MAX_QUERIES);
    const pages = await pooled(queries, q =>
      get('https://serpapi.com/search.json?' + new URLSearchParams({
        engine: 'google_shopping', q, gl: 'us', hl: 'en', num: '60', api_key: KEY,
      })).catch(() => null), 2);
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

    // --- 4. JUDGE, THEN OFFER HER DOORS ------------------------------------
    const shaped = verified.map(p => {
      const v = judge(request, p);
      return {
        ...p,
        // What the page needs to speak honestly about this piece.
        checks: v.checks, unconfirmed: v.unknown, exact: v.exact,
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
      ms: {search: tSearch, lookup: tLook, candidates: mine.length}};
    cacheSet(cacheKey, payload);
    return json(payload, headers);
  } catch (e) {
    console.error('[product-find] ' + (e && e.message));
    // Same principle as every failure above: an empty pool, never an error.
    return json({exact: [], doors: [], why: 'threw'}, headers);
  }
};
