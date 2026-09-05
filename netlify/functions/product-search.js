// One wardrobe checklist row's worth of real products, out of the nightly feed
// catalog in Supabase.
//
// ⭐ WHAT THIS DELIBERATELY DOES NOT DO: pick, rank, or filter for the woman.
// It hands back a POOL for one slot, shaped exactly like a row of
// products.json, and curatedPicks() in index.html does the rest -- her
// never-wear list, her colour no's, her size ranges, the price spread, the
// max-two-per-retailer variety rule and the Sunday rotation. That is the whole
// point: her 107 hand-picks and 78,000 feed pieces go through ONE picker, so a
// rule cannot apply to one source and quietly not the other.
// ▶ It matters most for the never-wear list. Her words, 2026-09-05: "when
//   someone says no shift dresses, that means absolutely no shift dresses."
//   Running that filter server-side as well would be a second implementation
//   of it, and a rule in two places drifts. One implementation, on every pick.
//
// 🔒 The catalog tables have row level security on, and carry exactly ONE rule:
// the ordinary key may SELECT the two product tables. No writing, no ops
// record, and no access at all to `users`. Writing still needs the service
// role key, which lives in a GitHub Secret and nowhere else.
// ▶ It is still a server function rather than a fetch from the page, for the
//   reason that has not changed: no client-supplied filter reaches the
//   database. The slot id is validated here against a strict pattern before it
//   is ever put into a query.

const ALLOWED_HOSTS = ['stylestar.app', 'www.stylestar.app'];

function hostOf(value) {
  if (!value) return '';
  try { return new URL(value).host.toLowerCase(); } catch (e) { return ''; }
}

// Same speed bump as user-data.js and style-ai.js, deliberately identical --
// including the *.netlify.app restriction, so a non-browser client cannot set
// Host and Origin to its own domain and walk through.
function isAllowed(req) {
  const requestHost = (req.headers.get('host') || '').toLowerCase();
  const allowed = new Set(ALLOWED_HOSTS);
  if (/(^|\.)netlify\.app$/.test(requestHost)) allowed.add(requestHost);
  const originHost = hostOf(req.headers.get('origin'));
  const refererHost = hostOf(req.headers.get('referer'));
  if (!originHost && !refererHost) return false;
  return allowed.has(originHost) || allowed.has(refererHost);
}

const RATE_MAX = 60;              // requests…
const RATE_WINDOW_MS = 60 * 1000; // …per minute, per IP
const rateHits = new Map();
function clientIp(req) {
  return (req.headers.get('x-nf-client-connection-ip') ||
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown');
}
function rateLimited(req) {
  const ip = clientIp(req);
  const now = Date.now();
  const hits = (rateHits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  hits.push(now);
  rateHits.set(ip, hits);
  if (rateHits.size > 5000) {
    for (const [k, v] of rateHits) {
      if (!v.length || now - v[v.length - 1] > RATE_WINDOW_MS) rateHits.delete(k);
    }
  }
  return hits.length > RATE_MAX;
}

// A slot id is two letters and a number ('to1', 'bg14'). Validated rather than
// trusted, because it goes into a PostgREST query string -- an unvalidated one
// would let a caller shape a filter of their own.
const SLOT_RE = /^[a-z]{2}[0-9]{1,2}$/;

// The pool handed back per slot. Big enough that curatedPicks has real choice
// after her never-wear list, her colours and her sizes have taken their cut,
// small enough to stay a fast query and a small payload. ~200 rows of these
// fields is roughly 60KB.
const POOL = 200;

// The app's own price bands, so a feed product sorts and spreads exactly like
// one of her hand-picked ones. Thresholds match the bands products.json uses.
function bandOf(price) {
  const p = Number(price) || 0;
  if (p < 60) return '$';
  if (p < 175) return '$$';
  if (p < 500) return '$$$';
  return '$$$$';
}

// Size ranges, read from what the merchant actually stocks rather than assumed.
// ⚠️ Honest by omission: a garment only claims Plus, Petite or Tall when its own
// size list says so, because curatedPicks uses these to decide whether a woman
// who shops those ranges is shown the piece at all. Claiming falsely is worse
// than showing nothing -- it sends her to a page that has nothing for her.
const PLUS_RE = /^(1x|2x|3x|4x|5x|xxl|xxxl|0x)$|^(1[6-9]|2[0-9])$/i;
const PETITE_RE = /petite|\bp$/i;
const TALL_RE = /\btall\b|\bt$/i;
function ranges(sizes) {
  const s = (sizes || []).map(v => String(v || '').trim()).filter(Boolean);
  return {
    plus: s.some(v => PLUS_RE.test(v)),
    petite: s.some(v => PETITE_RE.test(v)),
    tall: s.some(v => TALL_RE.test(v)),
  };
}

// products.json's own shape, field for field, so curatedPicks needs no special
// case for a feed row -- except the `feed` flag, which exempts it from the
// archetype-family filter. Her hand-picks carry a family SHE judged; nobody has
// judged 78,000 feed garments, and inventing that judgment is exactly the thing
// the standing store-tag rule says not to do. The STORE is the style signal for
// these, and her own ten dimension scores already order the stores.
function shape(row, slot) {
  const sizes = Array.isArray(row.sizes) ? row.sizes : [];
  const r = ranges(sizes);
  return {
    id: row.piece_key,
    slot,
    feed: true,
    active: true,
    brand: row.brand || row.store,
    name: row.name,
    retailer: row.store,
    // ⭐ VERBATIM. Feed column 5 arrives already carrying her publisher id, so
    // this string IS the commission attribution. Never rebuilt, never tidied,
    // and deliberately NOT passed through _affUrl on the page either.
    url: row.url,
    image: row.image_url || '',
    price: row.price,
    listPrice: row.on_sale ? row.list_price : null,
    onSale: !!row.on_sale,
    band: bandOf(row.price),
    colors: row.color ? [row.color] : [],
    pattern: row.pattern || '',
    // Material is free text (25,209 distinct spellings), useless as a category
    // but exactly right here: curatedPicks matches her never-wear FABRICS
    // against this, so "no polyester" can finally work on the fabric field
    // instead of hoping the word appears in the product's name.
    attrs: row.material ? [row.material] : [],
    families: [],
    petite: r.petite, tall: r.tall, plus: r.plus,
    sizes,
    note: '',
  };
}

export default async (req) => {
  const reqOrigin = req.headers.get('origin') || '';
  const allowOrigin = ALLOWED_HOSTS.includes(hostOf(reqOrigin)) ? reqOrigin : 'https://www.stylestar.app';
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (!isAllowed(req)) return new Response(JSON.stringify({ error: 'Not allowed' }), { status: 403, headers });
  if (rateLimited(req)) return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  let body = {};
  try { body = await req.json(); } catch (e) { body = {}; }
  const slot = String(body.slot || '').trim().toLowerCase();
  // ⭐ WHY A DIAGNOSTIC FLAG EXISTS AT ALL. Every failure below answers with an
  // EMPTY POOL, on purpose, so a broken catalog falls back to the AI path
  // rather than showing a woman an error. The cost is that "no credentials",
  // "the database refused the query" and "that row genuinely has nothing" are
  // indistinguishable from outside -- and a silent nothing is the worst failure
  // this pipeline can have. `diag:true` adds a `why` field saying which it was.
  // 🔒 IT NEVER RETURNS A KEY, A URL, OR ANY DATABASE TEXT: only whether
  //    credentials were configured, and the numeric upstream status. That is
  //    the same much a 500 would tell you, and nothing a leak could use.
  const diag = body.diag === true;
  // A short, one-way fingerprint of which Supabase project this function is
  // pointed at. 🔒 NOT the URL and NOT a key -- eight hex characters of a hash,
  // which reveals nothing and cannot be reversed into an endpoint. It exists to
  // answer one question that is otherwise unanswerable from outside: is the app
  // talking to the SAME project the nightly ingest writes to? A mismatched
  // url-and-key pair authenticates against nothing and returns 401, which looks
  // exactly like a bad key.
  const fp = async (v) => {
    if (!v) return null;
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v));
    return Array.from(new Uint8Array(b)).slice(0, 4)
      .map(x => x.toString(16).padStart(2, '0')).join('');
  };
  if (!SLOT_RE.test(slot)) {
    return new Response(JSON.stringify({ error: 'Unknown slot' }), { status: 400, headers });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  // ⭐ THE ORDINARY KEY ON PURPOSE — the same one user-data.js already uses, and
  // deliberately PREFERRED over the service key rather than the other way
  // round. The catalog tables carry a read-only rule for it (db/products.sql,
  // 2026-09-05 migration), so this function can read product names and nothing
  // else: no writes, no ops record, and no access whatsoever to `users`.
  // ▶ The alternative was to put the SERVICE ROLE key into Netlify. That key
  //   bypasses every rule in the database including on `users`, so it can read
  //   every woman's name, email, sizes, portrait and wishlist. A master key in
  //   a second platform, so that a function can look up some product names, is
  //   the wrong trade.
  // ⚠️ SO THE ORDER HERE IS LOAD-BEARING, do not "tidy" it back. If the service
  //    key is ever added to Netlify for some other reason, this function must
  //    NOT quietly start using it. It falls back to it only when nothing else
  //    is set, so the shelf still works in a stripped environment.
  const KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !KEY) {
    console.error('[product-search] no Supabase credentials configured');
    // An empty pool, never an error: a missing catalog must fall back to the
    // AI path exactly as it did before this feature existed. A woman tapping
    // Ideas still gets ideas.
    return new Response(JSON.stringify({ products: [], slot,
      ...(diag ? { why: 'no-credentials',
                   haveUrl: !!SUPABASE_URL, haveKey: !!KEY } : {}) }),
      { status: 200, headers });
  }

  // product_cards is the view: a garment with its in-stock sizes gathered, so
  // one query fills a carousel. `slots=cs.{to1}` is the GIN-indexed containment
  // lookup the nightly ingest exists to make possible.
  const params = new URLSearchParams();
  params.set('select', 'piece_key,store,brand,name,url,image_url,price,list_price,on_sale,color,material,pattern,sizes');
  params.set('slots', `cs.{${slot}}`);
  params.set('in_stock', 'is.true');
  params.set('price', 'not.is.null');
  params.set('image_url', 'not.is.null');
  params.set('limit', String(POOL));

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/product_cards?${params}`, {
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY },
    });
    if (!r.ok) {
      const detail = (await r.text()).slice(0, 300);
      console.error(`[product-search] ${slot}: Supabase ${r.status} ${detail}`);
      return new Response(JSON.stringify({ products: [], slot,
        ...(diag ? { why: 'upstream', upstream: r.status,
                     project: await fp(SUPABASE_URL) } : {}) }),
        { status: 200, headers });
    }
      const rows = await r.json();
    const products = (Array.isArray(rows) ? rows : [])
      .filter(x => x && x.piece_key && x.name && x.url && x.price)
      .map(x => shape(x, slot));
    return new Response(JSON.stringify({ products, slot,
      ...(diag ? { why: 'ok', returned: Array.isArray(rows) ? rows.length : 0 } : {}) }),
      { status: 200, headers });
  } catch (e) {
    console.error(`[product-search] ${slot}: ${e && e.message}`);
    return new Response(JSON.stringify({ products: [], slot,
      ...(diag ? { why: 'threw' } : {}) }), { status: 200, headers });
  }
};
