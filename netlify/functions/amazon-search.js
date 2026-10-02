// Amazon's own catalogue search, for real products with licensed photos.
//
// ⭐ WHY (her call, 2026-10-02, "yes definitely let's do all of this"): her
// Creators API access includes SEARCH, not just photos. A search is FREE (the
// Google Shopping finder costs ~2.5¢), returns Amazon's own licensed photo, a
// current price and a link carrying her tag, and Amazon is the affordable half
// of her high/low. Every shop that pays her today is luxury.
//
// ▶ STEP 1 OF HER PLAN: this function exists so the results can be TESTED on her
//   real searches and shown to her BEFORE anything reaches a screen. Nothing in
//   index.html calls it yet. Her answer for when it does: THREE Amazon cards per
//   row, mixed in, never a flood (the app must never read as "an Amazon shop").
//
// 🔒 Same licensing rules as amazon-images.js: Amazon-hosted images only,
//   hotlinked, cached at most 12 hours (Amazon allows 24), never written into
//   the page. Same two Netlify variables, AMAZON_CREATORS_ID/_SECRET.
// ⚠️ QUALITY FLOOR, applied at Amazon's end: the Fashion department, new items
//   only, in stock, 4+ star average. Her taste is applied afterwards, never here.
// ⚠️ IF ACCESS LAPSES (under ~10 sales in 30 days) this returns an empty list and
//   the app simply shows no Amazon cards. Nothing here ever invents a product.

import { getToken, isAllowed, rateLimited, PARTNER_TAG } from './lib/amazon-creators.js';

const SEARCH_URL = 'https://creatorsapi.amazon/catalog/v1/searchItems';
const CACHE_SECONDS = 12 * 60 * 60;
const RESOURCES = ['images.primary.large', 'itemInfo.title', 'itemInfo.byLineInfo',
  'offersV2.listings.price', 'offersV2.listings.availability'];

const sleep = ms => new Promise(res => setTimeout(res, ms));
const str = v => (v && typeof v === 'object' ? (v.displayValue ?? v.DisplayValue ?? '') : (v || '')) + '';

function shape(it) {
  const img = it && it.images && it.images.primary && it.images.primary.large;
  const info = (it && it.itemInfo) || {};
  const listing = it && it.offersV2 && Array.isArray(it.offersV2.listings) ? it.offersV2.listings[0] : null;
  const money = listing && listing.price && listing.price.money;
  const url = String((it && it.detailPageURL) || '');
  if (!/^[A-Z0-9]{10}$/.test((it && it.asin) || '')) return null;
  if (!img || !/^https:\/\/m\.media-amazon\.com\//.test(img.url || '')) return null;   // no photo, no card
  if (!/^https:\/\/www\.amazon\.com\//.test(url)) return null;
  const title = str(info.title).trim();
  if (!title) return null;
  return {
    asin: it.asin, title,
    brand: str(info.byLineInfo && info.byLineInfo.brand).trim(),
    price: money && typeof money.amount === 'number' ? money.amount : null,
    priceText: (money && money.displayAmount) || '',
    image: img.url, url,
  };
}

export default async (req) => {
  const headers = { 'Content-Type': 'application/json' };
  if (!isAllowed(req)) return new Response(JSON.stringify({ error: 'Not allowed' }), { status: 403, headers });
  if (rateLimited(req)) return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers });
  if (req.method !== 'GET') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  const q = new URL(req.url).searchParams;
  const keywords = (q.get('q') || '').replace(/[^\w '&-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  const maxPrice = Math.max(0, Math.min(100000, parseInt(q.get('max') || '0', 10) || 0));
  const minPrice = Math.max(0, Math.min(100000, parseInt(q.get('min') || '0', 10) || 0));
  if (!keywords) return new Response(JSON.stringify({ items: [] }), { status: 200, headers });

  const id = process.env.AMAZON_CREATORS_ID, secret = process.env.AMAZON_CREATORS_SECRET;
  if (!id || !secret) return new Response(JSON.stringify({ items: [], why: 'unconfigured' }), { status: 200, headers });

  const body = { partnerTag: PARTNER_TAG, marketplace: 'www.amazon.com',
    keywords: /\bwom[ae]n/i.test(keywords) ? keywords : "women's " + keywords,
    searchIndex: 'Fashion', itemCount: 10, condition: 'New', availability: 'Available',
    minReviewsRating: 4, resources: RESOURCES };
  if (maxPrice) body.maxPrice = maxPrice * 100;   // lowest denomination: cents
  if (minPrice) body.minPrice = minPrice * 100;   // a price floor, being tested with her (2026-10-02)

  try {
    const token = await getToken(id, secret);
    let status = 0, json = {};
    for (let attempt = 0; attempt < 2; attempt++) {
      const r = await fetch(SEARCH_URL, { method: 'POST', headers: { 'content-type': 'application/json',
        authorization: 'Bearer ' + token, 'x-marketplace': 'www.amazon.com' }, body: JSON.stringify(body) });
      status = r.status; json = await r.json().catch(() => ({}));
      if (status === 429 && attempt === 0) { await sleep(1200); continue; }
      break;
    }
    const raw = (json.searchResult && json.searchResult.items) || [];
    const items = raw.map(shape).filter(Boolean);
    if (status === 200) {
      headers['Cache-Control'] = 'public, max-age=3600';
      headers['Netlify-CDN-Cache-Control'] = `public, s-maxage=${CACHE_SECONDS}, durable`;
    } else {
      const code = (json.errors && json.errors[0] && json.errors[0].code) || '';
      console.error(`[amazon-search] ${status} ${code}`);
      return new Response(JSON.stringify({ items: [], why: code || ('status ' + status) }), { status: 200, headers });
    }
    return new Response(JSON.stringify({ items }), { status: 200, headers });
  } catch (e) {
    console.error(`[amazon-search] ${e && e.message}`);
    return new Response(JSON.stringify({ items: [], why: 'error' }), { status: 200, headers });
  }
};
