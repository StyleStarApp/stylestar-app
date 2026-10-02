// Amazon's own product photos for the pieces on Amazon Finds, by ASIN.
//
// ⭐ WHY THIS EXISTS: her rule "photos on Finds will be my own, or none" was
// retired by her on 2026-09-22 ("If we could use Amazon photos that would be
// amazing") after two real testers asked for photos the same day. The gate was
// Amazon's Creators API, which only answers an Associate with enough recent
// qualifying sales. Her account passed on 2026-10-02.
//
// 🔒 LICENSING, AND WHY IT IS BUILT THIS WAY RATHER THAN BAKED INTO THE PAGE:
//   - Amazon's terms let us SHOW their catalogue images, served from Amazon's
//     own image host, linked to the product page with her tag. We hotlink; we
//     never copy an image onto our own server.
//   - Data from the API may be kept for at most 24 hours. So the photo URLs are
//     fetched live and cached for 12 hours (the CDN header below), never written
//     into index.html or the CSV, where they would go stale and break the terms.
//
// 🔑 NEEDS TWO NETLIFY ENVIRONMENT VARIABLES, and the keys live nowhere else:
//   AMAZON_CREATORS_ID      the Credential ID     (amzn1.application-oa2-client…)
//   AMAZON_CREATORS_SECRET  the Secret            (amzn1.oa2-cs.v1…)
// Until both are set this returns an empty answer and every Finds card simply
// stays the text card it has always been. No error, no broken screen.
//
// ⚠️ KEEPING ACCESS: Amazon withdraws it if the account falls under about 10
// qualifying sales in a trailing 30 days. When that happens Amazon answers
// AssociateNotEligible, this returns empty, and the page quietly goes back to
// text cards. Nothing here ever invents a photo.
//
// ▶ The auth is OAuth2 client_credentials (Login with Amazon), NOT the old
//   PA-API's AWS SigV4 signing. Resource names are camelCase.

const ALLOWED_HOSTS = ['stylestar.app', 'www.stylestar.app'];
const PARTNER_TAG = process.env.AMAZON_PARTNER_TAG || 'stylestar01-20';
const TOKEN_URL = 'https://api.amazon.com/auth/o2/token';
const ITEMS_URL = 'https://creatorsapi.amazon/catalog/v1/getItems';
const ASIN_RE = /^[A-Z0-9]{10}$/;
const MAX_ASINS = 10;               // getItems takes at most 10 ids per call
const CACHE_SECONDS = 12 * 60 * 60; // well inside Amazon's 24-hour limit

function hostOf(value) {
  if (!value) return '';
  try { return new URL(value).host.toLowerCase(); } catch (e) { return ''; }
}

// Same speed bump as the other functions, deliberately identical.
function isAllowed(req) {
  const requestHost = (req.headers.get('host') || '').toLowerCase();
  const allowed = new Set(ALLOWED_HOSTS);
  if (/(^|\.)netlify\.app$/.test(requestHost)) allowed.add(requestHost);
  const originHost = hostOf(req.headers.get('origin'));
  const refererHost = hostOf(req.headers.get('referer'));
  if (!originHost && !refererHost) return false;
  return allowed.has(originHost) || allowed.has(refererHost);
}

const RATE_MAX = 40;
const RATE_WINDOW_MS = 60 * 1000;
const rateHits = new Map();
function rateLimited(req) {
  const ip = req.headers.get('x-nf-client-connection-ip') ||
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const hits = (rateHits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  hits.push(now);
  rateHits.set(ip, hits);
  if (rateHits.size > 5000) rateHits.clear();
  return hits.length > RATE_MAX;
}

// The token lives an hour; keep it on a warm instance rather than asking for a
// new one on every call.
let tokenCache = { value: '', expires: 0 };
async function getToken(id, secret) {
  if (tokenCache.value && Date.now() < tokenCache.expires) return tokenCache.value;
  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', client_id: id,
      client_secret: secret, scope: 'creatorsapi::default' }),
  });
  if (!r.ok) throw new Error('token ' + r.status);
  const j = await r.json();
  if (!j.access_token) throw new Error('token missing');
  const life = Math.max(60, (Number(j.expires_in) || 3600) - 120) * 1000;
  tokenCache = { value: j.access_token, expires: Date.now() + life };
  return tokenCache.value;
}

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function getItems(token, asins) {
  const body = JSON.stringify({ itemIds: asins, itemIdType: 'ASIN',
    marketplace: 'www.amazon.com', partnerTag: PARTNER_TAG,
    resources: ['images.primary.large'] });
  // A new Associate starts at about one request a second, so one polite retry
  // on a throttle rather than giving up on the whole batch.
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await fetch(ITEMS_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token,
        'x-marketplace': 'www.amazon.com' },
      body,
    });
    if (r.status === 429 && attempt === 0) { await sleep(1200); continue; }
    return { status: r.status, json: await r.json().catch(() => ({})) };
  }
  return { status: 429, json: {} };
}

export default async (req) => {
  const headers = { 'Content-Type': 'application/json' };
  if (!isAllowed(req)) return new Response(JSON.stringify({ error: 'Not allowed' }), { status: 403, headers });
  if (rateLimited(req)) return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers });
  if (req.method !== 'GET') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  const raw = new URL(req.url).searchParams.get('asins') || '';
  const asins = [...new Set(raw.split(',').map(s => s.trim().toUpperCase()))]
    .filter(a => ASIN_RE.test(a)).slice(0, MAX_ASINS);
  if (!asins.length) return new Response(JSON.stringify({ images: {} }), { status: 200, headers });

  const id = process.env.AMAZON_CREATORS_ID;
  const secret = process.env.AMAZON_CREATORS_SECRET;
  if (!id || !secret) {
    return new Response(JSON.stringify({ images: {}, why: 'unconfigured' }), { status: 200, headers });
  }

  try {
    const token = await getToken(id, secret);
    const { status, json } = await getItems(token, asins);
    const images = {};
    const items = (json.itemsResult && json.itemsResult.items) || [];
    for (const it of items) {
      const img = it && it.images && it.images.primary && it.images.primary.large;
      // Only ever an Amazon-hosted https image; anything else is dropped.
      if (it && ASIN_RE.test(it.asin || '') && img && /^https:\/\/m\.media-amazon\.com\//.test(img.url || '')) {
        images[it.asin] = { url: img.url, w: img.width || 0, h: img.height || 0 };
      }
    }
    // Cache ONLY a real answer, so a throttle or an eligibility lapse is never
    // pinned in the CDN for twelve hours.
    if (status === 200) {
      headers['Cache-Control'] = 'public, max-age=3600';
      headers['Netlify-CDN-Cache-Control'] = `public, s-maxage=${CACHE_SECONDS}, durable`;
    } else {
      const code = (json.errors && json.errors[0] && json.errors[0].code) || '';
      console.error(`[amazon-images] ${status} ${code}`);
    }
    return new Response(JSON.stringify({ images }), { status: 200, headers });
  } catch (e) {
    console.error(`[amazon-images] ${e && e.message}`);
    return new Response(JSON.stringify({ images: {} }), { status: 200, headers });
  }
};
