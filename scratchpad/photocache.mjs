// Every product photo the app hotlinks, cached locally for the render and
// verification harnesses.
//
// ⚠️⚠️ DELIBERATELY NOT COMMITTED — scratchpad/photos/ is gitignored. This repo
// is PUBLIC, and a retailer's product photograph is their copyrighted work. The
// affiliate approval that licenses the APP to display it (by hotlinking, gated
// on _affMid) does not clearly cover redistributing a copy of the file from a
// public repo. Technical access is not legal permission — the standing rule
// from 2026-08-20. Fetched on demand, kept out of git.
//
// WHY THIS REPLACES THE ONE-URL starphoto.mjs (2026-09-01): that helper pinned
// a single hardcoded URL, the DVF scarf. The Star of the Week ROTATES, so the
// moment the Gucci bag came round the suites' `**/cdn/shop/**` interception
// stopped matching (mytheresa serves from /image/, not /cdn/shop/) — the photo
// silently failed, and discopage/discostar/editpx started asserting against a
// card with no photo in it. ▶ A harness pinned to one item cannot survive a
// rotating feature. This one reads every external photo URL out of index.html
// at run time, so a new Edit piece or a re-ordered queue needs no edit here.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';

const DIR = 'scratchpad/photos';

// Pull the URLs out of the app itself rather than restating them.
export function photoUrls(htmlPath = 'index.html') {
  const s = fs.readFileSync(htmlPath, 'utf8');
  const found = new Set();
  for (const m of s.matchAll(/https:\/\/[^"'\s\\]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s\\]*)?/gi)) {
    // The markup carries both raw and HTML-escaped (&amp;) forms of the same URL.
    const u = m[0].replace(/&amp;/g, '&');
    if (!u.includes('stylestar.app')) found.add(u);
  }
  return [...found];
}

const fileFor = u => path.join(DIR, crypto.createHash('md5').update(u).digest('hex').slice(0, 16) +
  (/\.png(\?|$)/i.test(u) ? '.png' : '.jpg'));

// Fetch anything not already on disk. curl CAN reach the retail CDNs even in
// sessions where Chromium cannot — that asymmetry is the whole reason this
// file exists. ⚠️ Reachability VARIES BY SESSION, so a miss is reported and
// skipped rather than throwing: a suite is better off saying a photo could not
// be fetched than dying before it runs a single check.
export function ensurePhotos(urls = photoUrls()) {
  fs.mkdirSync(DIR, { recursive: true });
  const map = new Map();
  let fetched = 0, failed = 0;
  for (const u of urls) {
    const f = fileFor(u);
    if (!fs.existsSync(f) || fs.statSync(f).size < 1000) {
      try {
        execFileSync('curl', ['-sL', '--max-time', '45', '-o', f, u], { stdio: 'ignore' });
        if (!fs.existsSync(f) || fs.statSync(f).size < 1000) throw new Error('empty');
        fetched++;
      } catch { failed++; try { fs.unlinkSync(f); } catch {} continue; }
    }
    map.set(u, f);
  }
  if (fetched || failed) console.log(`  [photocache] ${map.size} available` +
    (fetched ? `, ${fetched} newly fetched` : '') + (failed ? `, ${failed} UNREACHABLE this session` : ''));
  return map;
}

// Intercept every off-origin image and serve the cached copy.
// ⚠️ Anything off-origin that is NOT a cached photo is ABORTED, deliberately:
// an unreachable request that hangs and then fails at an unpredictable moment
// changes full-page height between runs, which is exactly what made the CSS
// extraction's first before/after diff meaningless.
export async function routePhotos(pg, opts = {}) {
  const map = ensurePhotos();
  const byKey = new Map();
  for (const [u, f] of map) byKey.set(u.split('?')[0], f);
  await pg.route('**/*', route => {
    const u = route.request().url();
    if (/^(data:|blob:)/.test(u) || u.includes('localhost') || u.includes('127.0.0.1')) return route.continue();
    const f = byKey.get(u.split('?')[0]);
    if (f) return route.fulfill({ status: 200,
      contentType: f.endsWith('.png') ? 'image/png' : 'image/jpeg', body: fs.readFileSync(f) });
    if (opts.allow && opts.allow(u, route)) return;   // caller handles it (fonts, stubs)
    return route.abort();
  });
  return map;
}
