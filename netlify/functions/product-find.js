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

  const get = async (url) => {
    const r = await fetch(url, {signal: AbortSignal.timeout(12000)});
    if (!r.ok) throw new Error('upstream ' + r.status);
    return r.json();
  };

  try {
    // --- 1. POOL SEVERAL QUERIES ------------------------------------------
    // ⚠️ Measured 2026-09-06: broadening CHANGES the pool rather than enlarging
    //    it, so a broad query alone loses pieces the narrow one found.
    const queries = buildQueries(request).slice(0, MAX_QUERIES);
    const pool = new Map();
    for (const q of queries) {
      let d; try {
        d = await get('https://serpapi.com/search.json?' + new URLSearchParams({
          engine: 'google_shopping', q, gl: 'us', hl: 'en', num: '60', api_key: KEY,
        }));
      } catch { continue; }
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
    const verified = [];
    for (const c of mine.slice(0, MAX_VERIFY)) {
      if (!c.raw.serpapi_immersive_product_api) continue;
      let d; try { d = await get(c.raw.serpapi_immersive_product_api + '&api_key=' + KEY); } catch { continue; }
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

    const payload = {exact, doors, request, searched: queries.length, verified: verified.length};
    cacheSet(cacheKey, payload);
    return json(payload, headers);
  } catch (e) {
    console.error('[product-find] ' + (e && e.message));
    // Same principle as every failure above: an empty pool, never an error.
    return json({exact: [], doors: [], why: 'threw'}, headers);
  }
};
