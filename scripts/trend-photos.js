#!/usr/bin/env node
/* What's Trending photos, built ONCE A WEEK so every woman sees them instantly.
   Cath's ask, 2026-10-06: open the page and see full visuals, no 5-8s wait.

   For each trend card in index.html (#wdrTrendBody .ttf) this asks the LIVE
   finder for the same request a tap sends ({item:<trend name>}), in LEAN mode:
   one search, no look-ups (~23 searches a week). Her nightly feed is searched
   beside Google for free, so her paying shops appear when they genuinely have
   the piece, and only then — her "case by case".

   ⚠️ AMAZON IS NOT STORED HERE, ON PURPOSE. Amazon's terms limit how long its
     product data may be kept, so the page fetches Amazon live (free) and seats
     it into the row at runtime, exactly as every other finder row does.
   ⚠️ PRICES ARE DROPPED. A week-old price can be wrong in the dearer direction,
     and her rule is that a woman never arrives to find a piece dearer than the
     card said. The card shows the piece and the shop; the shop shows the price.
   ⚠️ PHOTOS ARE LINKS to the shops' own images, never copies on our server.

   Usage: node scripts/trend-photos.js            (writes data/trend-photos.json)
          node scripts/trend-photos.js --dry      (prints counts only) */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {trendKeep} from './lib/trend-rules.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data', 'trend-photos.json');
const BASE = process.env.SITE || 'https://stylestar.app';
const DRY = process.argv.includes('--dry');
/* --only "Chocolate Brown,Butter Yellow" re-searches just those trends (the rest
   keep their rows); --refilter re-applies data/trend-rules.json to the stored
   rows with NO searches at all, for a rule change between Mondays. */
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7).split(',').map(s => s.trim()).filter(Boolean);
const REFILTER = process.argv.includes('--refilter');
const RULES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'trend-rules.json'), 'utf8'));
const PAUSE_MS = 9000;          // product-find allows 8 requests a minute per IP
const KEEP = 24;                // plenty for a swipe row; keeps the file small

function trendNames() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const a = html.indexOf('id="wdrTrendBody"');
  if (a < 0) throw new Error('wdrTrendBody not found in index.html');
  const b = html.indexOf('</div>\n</div>', a);
  const slice = html.slice(a, b > a ? b : a + 20000);
  const out = [];
  const re = /<div class="ttf">([^<]+)<\/div>/g;
  let m;
  while ((m = re.exec(slice))) {
    out.push(m[1].replace(/&amp;/g, '&').replace(/&rsquo;/g, '’').trim());
  }
  return out;
}

/* `name`/`search` stay because filterNeverWear() on the page reads them, so her
   never-wear list governs this row too. `url` is kept ONLY for a feed piece:
   a Google result's url points at google.com, and the page knows that. */
const slim = (p) => ({
  id: p.id, title: p.title, name: p.name || p.title, search: p.search || p.title,
  brand: p.brand || '', store: p.store, image: p.image,
  ...(p.feed ? {feed: true, url: p.url} : {}),
});

async function findReq(req) {
  const r = await fetch(BASE + '/.netlify/functions/product-find', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Origin: BASE, Referer: BASE + '/trending'},
    body: JSON.stringify({...req, lean: true}),
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
const poolOf = d => [].concat(d.exact || [], ...(d.doors || []).map(x => x.products || []), d.browse || []);
/* A trend with its own searches in data/trend-rules.json (the colour trends:
   a bare "Chocolate Brown" brings back random shoes) runs each one and deals
   the results out in turn, so the row mixes sweater, coat, dress... */
async function findOne(name) {
  const qs = (RULES.queries || {})[name];
  if (!qs) return findReq({item: name});
  const lists = [];
  for (let i = 0; i < qs.length; i++) {
    try { const d = await findReq(qs[i]); if (d && !d.why) lists.push(poolOf(d)); } catch (e) {}
    if (i < qs.length - 1) await new Promise(r => setTimeout(r, PAUSE_MS));
  }
  if (!lists.length) return {why: 'all-failed'};
  const seen = new Set(), browse = [];
  for (let k = 0; lists.some(l => k < l.length); k++)
    for (const l of lists) { const p = l[k]; if (p && !seen.has(p.id)) { seen.add(p.id); browse.push(p); } }
  return {browse};
}

await (async () => {
  const all = trendNames();
  console.log('trends found:', all.length);
  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {trends: {}};
  if (REFILTER) {
    for (const [n, row] of Object.entries(prev.trends || {})) {
      const before = row.items.length;
      row.items = row.items.filter(p => trendKeep(RULES, n, p));
      console.log(n.padEnd(26), before, '->', row.items.length);
      if (!row.items.length) delete prev.trends[n];
    }
    if (!DRY) fs.writeFileSync(OUT, JSON.stringify(prev) + '\n');
    return;
  }
  const names = ONLY.length ? all.filter(n => ONLY.includes(n)) : all;
  if (ONLY.length) for (const n of all) if (!names.includes(n) && prev.trends && prev.trends[n]) {
    /* untouched this run: keep, but still under today's rules */
    prev.trends[n].items = prev.trends[n].items.filter(p => trendKeep(RULES, n, p));
  }
  const trends = {};
  let fresh = 0, kept = 0, failRun = 0, stopped = false;
  for (let i = 0; i < names.length; i++) {
    const n = names[i];
    let row = null;
    try {
      const d = await findOne(n);
      if (d && !d.why) {
        const pool = poolOf(d);
        /* her rules BEFORE the cap, so a dropped piece makes room for a good one */
        const ok = pool.filter(p => p && p.image && p.store && p.title && trendKeep(RULES, n, p));
        /* a fair mix: her nightly feed answers some trends with dozens of
           luxury pieces, which would fill all 24 seats before a single Kohl's
           or Gap piece; deal feed and Google results in turn instead */
        const feed = ok.filter(p => p.feed), web = ok.filter(p => !p.feed), mix = [];
        for (let k = 0; mix.length < KEEP && (k < feed.length || k < web.length); k++) {
          if (k < web.length) mix.push(web[k]);
          if (k < feed.length && mix.length < KEEP) mix.push(feed[k]);
        }
        /* a dead photo link (404/410) never reaches the page. Only a definite
           "gone" drops a piece: some shops refuse scripts (403), and that says
           nothing about whether a woman's browser can see the photo. */
        const items = [];
        for (const p of mix) {
          let gone = false;
          try {
            const r = await fetch(p.image, {method: 'GET', headers: {Range: 'bytes=0-0', 'User-Agent': 'Mozilla/5.0'}});
            gone = r.status === 404 || r.status === 410;
          } catch (e) {}
          if (!gone) items.push(slim(p));
        }
        if (items.length) row = {items, at: new Date().toISOString()};
      } else console.log('  ', n, '->', d && d.why);
    } catch (e) { console.log('  ', n, '-> failed', e.message); }
    /* a failed week keeps LAST week's photos rather than emptying the card */
    /* 🚨 STOP EARLY WHEN THE SEARCH SERVICE IS DOWN. A failed call still spends
       searches; the first run (2026-10-06, during a SerpApi outage) spent 41
       for one trend's photos. Three failures in a row = stop and keep last
       week's file untouched. */
    failRun = row ? 0 : failRun + 1;
    if (failRun >= 3) {
      console.log('3 failures in a row - search service looks down; stopping.');
      stopped = !fresh;          // nothing new at all: leave the file untouched
      break;
    }
    if (row) { trends[n] = row; fresh++; }
    else if (prev.trends && prev.trends[n]) { trends[n] = prev.trends[n]; kept++; }
    console.log(String(i + 1).padStart(2), n, row ? row.items.length + ' photos' : '(kept last week)');
    if (i < names.length - 1) await new Promise(r => setTimeout(r, PAUSE_MS));
  }
  const out = {generated: new Date().toISOString(), trends};
  console.log(`fresh ${fresh}, kept ${kept}, empty ${names.length - fresh - kept}`);
  if (!DRY && !stopped) {
    /* names not reached this week keep last week's photos */
    for (const n of all) if (!trends[n] && prev.trends && prev.trends[n] && prev.trends[n].items.length) trends[n] = prev.trends[n];
    fs.writeFileSync(OUT, JSON.stringify(out) + '\n');
  }
})();
