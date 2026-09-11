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

// 🚨🚨 EXTENDED 2026-09-08, AND THE REASON IS THE WHOLE POINT: Cath found the
// STAR OF THE WEEK sold out -- on screen, the one piece the app shows every woman
// that week -- and nothing here caught it, because this script only ever read
// products.json. That is the catalog she FROZE and no longer maintains. It had
// never looked at the Style Star Edit or the WEEK_STARS queue: two of the exact
// three places her curation lives, and the two always on screen.
// ▶ THE WATCHDOG WAS POINTED AT THE LIST THAT DOES NOT CHANGE AND BLIND TO THE
//   ONES THAT DO. It now reads all three, and reports the Star first.
// Run:  node scripts/check-product-urls.js            (everything)
//       node scripts/check-product-urls.js --only star (just this week's piece)
import {collectAll, collectStars, collectEdit, collectFinds, collectCatalog, stockVerdict, SURFACE}
  from './lib/curation-links.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const onlyArg = (process.argv.find(a => a.startsWith('--only')) || '').split(/[= ]/)[1]
             || (process.argv[process.argv.indexOf('--only') + 1] || '');
const only = ['star', 'edit', 'finds', 'catalog'].includes(onlyArg) ? onlyArg : null;
const items = only === 'star' ? collectStars()
            : only === 'edit' ? collectEdit()
            : only === 'finds' ? collectFinds()
            : only === 'catalog' ? collectCatalog(ROOT)
            : collectAll(ROOT);

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
    // 🚨 A STRUCTURED, PRODUCT-LEVEL CLAIM BY THE RETAILER IS ALLOWED TO SAY
    // SOLD OUT ON ITS OWN. Prose still is not -- measured 2026-09-08 on two real
    // pages, and the HEALTHY one said "sold out" twice. See stockVerdict.
    const stock = stockVerdict(body);
    if (stock.state === 'out') return {p, bucket: 'SOLD', why: stock.why, ms};
    if (stock.state === 'mixed') return {p, bucket: 'EYE', why: stock.why, ms};
    // ⚠️⚠️ AN AUTHORITATIVE *POSITIVE* MUST OUTRANK THE PROSE, AND GETTING THIS
    // ORDER WRONG WAS CAUGHT ON THE FIRST REAL RUN. The Saint Laurent page — the
    // live Star, confirmed in stock — was being demoted to NEEDS HER EYE by the
    // prose regex, on a page whose own schema.org data says InStock. That is the
    // exact noise the 2026-09-08 measurement found (the healthy page says "sold
    // out" twice, on size rows and recommended products).
    // ▶ A report that flags healthy pieces is a report she stops reading, which
    //   is how the sold-out Star survived on screen in the first place.
    if (stock.state === 'in') return {p, bucket: 'OK', why: stock.why, ms};
    if (OOS.test(body)) return {p, bucket: 'EYE', why: 'page mentions "sold out / unavailable" — may be one size variant, worth a look', ms};
    if (nameVisible)
      return {p, bucket: 'OK', why: `product name visible (${hits}/${nameWords.length} words)`, ms};
    return {p, bucket: 'EYE', why: 'page answered but renders client-side, name not readable', ms};
  } catch (e) {
    const why = e.name === 'AbortError' ? 'timed out (25s)' : String(e.cause && e.cause.code || e.message).slice(0, 80);
    return {p, bucket: 'EYE', why: 'unreachable from here: ' + why, ms: Date.now() - started};
  }
}

console.log(`Checking ${items.length} live links`
  + (only ? ` on the ${SURFACE[only].label}` : ' across the Star of the Week, the Edit, Amazon Finds and the frozen catalog')
  + `...\n`);

const results = [];
// small batches — polite, and parallel enough to finish fast
for (let i = 0; i < items.length; i += 5) {
  results.push(...await Promise.all(items.slice(i, i + 5).map(check)));
}

const line = r => `  ${(r.p.id || '').padEnd(9)} ${r.p.name}${r.p.retailer ? '  (' + r.p.retailer + ')' : ''}\n              ${r.why}`;

// ▶ REPORTED BY SURFACE, STAR FIRST. The old report was one flat list of 107
//   catalog rows, which is precisely how a dead Star would have been lost in it
//   even once it was being checked. Where a thing appears decides how loud it is.
let exitBad = 0;
for (const key of ['star', 'edit', 'finds', 'catalog']) {
  const mine = results.filter(r => r.p.source === key);
  if (!mine.length) continue;
  const S = SURFACE[key];
  console.log(`\n${'═'.repeat(72)}\n${S.label}  — ${S.note}\n${'═'.repeat(72)}`);
  for (const [bucket, title] of [
    ['SOLD',   '🚨 SOLD OUT — the retailer says so in its own structured data'],
    ['BROKEN', '🚨 BROKEN'],
    ['EYE',    'NEEDS HER EYE — bot-walled, client-rendered, or variant-level'],
    ['OK',     'LOOKS OK'],
  ]) {
    const rows = mine.filter(r => r.bucket === bucket);
    if (!rows.length) continue;
    console.log(`\n${title} — ${rows.length}`);
    rows.sort((a, b) => (a.p.due ?? 99) - (b.p.due ?? 99)).forEach(r => console.log(line(r)));
  }
  // A dead Star or Edit pick is a real problem; the frozen catalog is a note.
  if (key !== 'catalog') exitBad += mine.filter(r => r.bucket === 'SOLD' || r.bucket === 'BROKEN').length;
}

// ⚠️ THE ONE LINE SHE SHOULD READ FIRST.
const live = results.find(r => r.p.source === 'star' && r.p.due === 0);
if (live) {
  const verdict = live.bucket === 'OK' ? '✅ looks fine'
    : live.bucket === 'SOLD' ? '🚨 SOLD OUT — swap it today'
    : live.bucket === 'BROKEN' ? '🚨 BROKEN — swap it today'
    : '⚠️ needs her eye';
  console.log(`\n${'─'.repeat(72)}\nTHIS WEEK'S STAR: ${live.p.name} — ${verdict}\n${'─'.repeat(72)}`);
}

console.log(exitBad
  ? `\n⚠️  ${exitBad} problem(s) on a surface she maintains. Those are the ones to act on.`
  : '\n✅ Nothing dead on the Star or the Edit.');
process.exit(exitBad ? 1 : 0);
