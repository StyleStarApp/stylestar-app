#!/usr/bin/env node
// check-product-urls.js — the catalog link-rot watchdog. Requests every URL
// in products.json and sorts them into three honest buckets:
//
//   LOOKS OK      — the page answered and looks like a product page
//   NEEDS HER EYE — the store bot-walls automated requests (403/challenge) or
//                   renders client-side, so only a human browser can judge it
//   BROKEN        — a real 404/410, a redirect that stripped the product path,
//                   or "sold out / out of stock / waitlist" visible in the page
//
// Run weekly (or before any launch moment):
//   node scripts/check-product-urls.js
//
// ▶ Built BEFORE 100 items on purpose: filling the first two slots found
// roughly one product in four already dead, discontinued, sold out, or
// menswear — link rot is worse than the July spec assumed.
// ▶ Honesty rules baked in: a bot-walled store is NEVER reported broken (a
// 403 from Bloomingdale's means nothing is wrong — the standing curl lesson),
// and this script never claims live stock either way. `checked` in the
// spreadsheet is the only freshness the app promises.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const {products} = JSON.parse(fs.readFileSync(path.join(ROOT, 'products.json'), 'utf8'));

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const OOS = /\b(sold out|out of stock|no longer available|waitlist(ed)?|discontinued|item is unavailable|currently unavailable)\b/i;

async function check(p) {
  const started = Date.now();
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 25000);
    const res = await fetch(p.url, {
      redirect: 'follow', signal: ctl.signal,
      headers: {'user-agent': UA, 'accept': 'text/html,application/xhtml+xml', 'accept-language': 'en-US,en;q=0.9'}
    });
    clearTimeout(t);
    const finalUrl = res.url || p.url;
    const status = res.status;
    let body = '';
    try { body = (await res.text()).slice(0, 400000); } catch (e) {}
    const ms = Date.now() - started;

    if (status === 404 || status === 410) return {p, bucket: 'BROKEN', why: `HTTP ${status}`, ms};
    if (status === 403 || status === 429 || /captcha|access denied|bot detection|are you a human|px-captcha|challenge-platform/i.test(body.slice(0, 8000)))
      return {p, bucket: 'EYE', why: `bot wall (HTTP ${status})`, ms};
    if (status >= 500) return {p, bucket: 'EYE', why: `HTTP ${status} (server trouble, retry later)`, ms};
    if (status >= 400) return {p, bucket: 'BROKEN', why: `HTTP ${status}`, ms};

    // A redirect that lost the product path usually means "retired product,
    // dumped on the homepage or a category page."
    const origPath = new URL(p.url).pathname.replace(/\/+$/, '');
    const endPath = new URL(finalUrl).pathname.replace(/\/+$/, '');
    if (origPath.length > 1 && (endPath === '' || endPath === '/') )
      return {p, bucket: 'BROKEN', why: `redirected to homepage (${finalUrl})`, ms};

    // Does the page visibly carry the product? Client-side renderers (the
    // Nordstrom JS-shell class) won't — that's an EYE, not a fail.
    const nameWords = p.name.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const hay = body.toLowerCase();
    const hits = nameWords.filter(w => hay.includes(w)).length;
    const nameVisible = nameWords.length && hits >= Math.ceil(nameWords.length / 2);
    // ⚠ "sold out" appearing SOMEWHERE in the page is a flag, never proof —
    // stores print it per size variant on perfectly healthy products. Only a
    // human eye can tell a sold-out size row from a dead product, so this
    // lands in NEEDS HER EYE, not BROKEN.
    if (OOS.test(body)) return {p, bucket: 'EYE', why: 'page mentions "sold out / unavailable" — may be one size variant, worth a look', ms};
    if (nameVisible)
      return {p, bucket: 'OK', why: `product name visible (${hits}/${nameWords.length} words)`, ms};
    return {p, bucket: 'EYE', why: 'page answered but renders client-side, name not readable', ms};
  } catch (e) {
    const why = e.name === 'AbortError' ? 'timed out (25s)' : String(e.cause && e.cause.code || e.message).slice(0, 80);
    return {p, bucket: 'EYE', why: 'unreachable from here: ' + why, ms: Date.now() - started};
  }
}

const active = products.filter(p => p.active);
console.log(`Checking ${active.length} active product links...\n`);
const results = [];
// small batches — polite, and parallel enough to finish fast
for (let i = 0; i < active.length; i += 5) {
  results.push(...await Promise.all(active.slice(i, i + 5).map(check)));
}

const buckets = {OK: [], EYE: [], BROKEN: []};
results.forEach(r => buckets[r.bucket].push(r));
const line = r => `  ${r.p.id}  ${r.p.brand} — ${r.p.name}  (${r.p.retailer})\n        ${r.why}`;
console.log(`LOOKS OK — ${buckets.OK.length}`);
buckets.OK.forEach(r => console.log(line(r)));
console.log(`\nNEEDS HER EYE — ${buckets.EYE.length} (bot-walled or client-rendered; only a phone browser can judge these)`);
buckets.EYE.forEach(r => console.log(line(r)));
console.log(`\nBROKEN — ${buckets.BROKEN.length}${buckets.BROKEN.length ? '  ⚠ fix these in the spreadsheet, then re-run the converter' : ''}`);
buckets.BROKEN.forEach(r => console.log(line(r)));
process.exit(buckets.BROKEN.length ? 1 : 0);
