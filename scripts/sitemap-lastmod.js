#!/usr/bin/env node
/* KEEP <lastmod> HONEST ON THE PAGES CATH ACTUALLY CHANGES.
 *
 * 🚨 WHY: lastmod is THE ONE SITEMAP FIELD CRAWLERS USE. Google ignores
 * changefreq and priority outright; lastmod is what tells it a page is worth
 * re-crawling. So a stale lastmod is not cosmetic — it is the difference
 * between her new Edit pieces being found next week and being found whenever
 * Google happens to wander back.
 *
 * ▶▶ AND IT HAS ALREADY GONE STALE ONCE (found 2026-08-31: the home page and
 * /faq still claimed 2026-08-24 after a week of real edits). A date a human has
 * to remember to bump is a date that goes stale, which is exactly the failure
 * this repo already fixed for the stylesheet stamp.
 *
 * ▶ THE THREE SURFACES HERE ARE HER OWN CURATION SURFACES — the Style Star
 * Edit, Amazon Finds and What's Trending. They are the pages whose CONTENT
 * changes, which is the only kind of change a crawler cares about.
 *
 * USAGE
 *   node scripts/sitemap-lastmod.js --check   exit 1 if content moved and the date did not
 *   node scripts/sitemap-lastmod.js --write   stamp today's date and record the new content
 *
 * ⚠️ THE TRIGGER IS A CONTENT HASH, NEVER A JUDGEMENT. Restyling a page is not
 * a reason to tell Google it changed; adding one of her pieces is.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const STATE = path.join(ROOT, 'data', 'sitemap-content.json');

/* Each surface is the slice of index.html a woman actually reads on that page.
   ⚠️ Bounded by the NEXT screen id, the same way the link watchdog scopes its
   parsers — an unbounded slice would hash the whole rest of the file and cry
   wolf on every unrelated edit. */
const SURFACES = [
  { path: '/edit',     from: 'id="s-dream"',    to: 'id="s-finds"' },
  { path: '/finds',    from: 'id="s-finds"',    to: 'id="s-shop"' },
  { path: '/trending', from: 'id="s-trending"', to: 'id="s-wardrobe"' },
];

const hashOf = ({ from, to }) => {
  const i = HTML.indexOf(from);
  if (i < 0) return null;
  const j = HTML.indexOf(to, i);
  const slice = HTML.slice(i, j < 0 ? HTML.length : j);
  /* Only the words and links she curates — so a CSS class rename or a comment
     does not read as "this page changed" to a search engine. */
  const content = (slice.match(/>[^<>]+</g) || []).join('')
                + (slice.match(/href="[^"]+"/g) || []).join('');
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
};

const prev = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};
const today = new Date().toISOString().slice(0, 10);
const missing = SURFACES.filter(s => hashOf(s) === null);
if (missing.length) {
  console.error('✗ could not find these screens in index.html: ' + missing.map(s => s.from).join(', '));
  process.exit(2);
}
const moved = SURFACES.filter(s => prev[s.path] !== hashOf(s));

/* ⚠️ FIRST RUN SEEDS, IT DOES NOT STAMP — and the distinction is not pedantry.
   With no baseline every surface reads as "changed", so a stamping first run
   would have written TODAY onto /trending, which has not been touched since
   2026-09-03. ▶ That is a LIE TO A CRAWLER, and lastmod's whole value is that
   it is honest; a sitemap that cries "new!" on an unchanged page is one Google
   learns to discount. Seed the hashes, leave the dates where they are. */
const seeding = !fs.existsSync(STATE);
if (process.argv.includes('--write') && seeding) {
  fs.writeFileSync(STATE, JSON.stringify(
    Object.fromEntries(SURFACES.map(s => [s.path, hashOf(s)])), null, 2) + '\n');
  console.log('✓ seeded the content baseline. Sitemap dates untouched on a first run,');
  console.log('  because "no baseline" is not the same fact as "the page changed".');
  process.exit(0);
}
if (process.argv.includes('--write')) {
  if (!moved.length) { console.log('✓ nothing moved; sitemap dates left alone'); process.exit(0); }
  let xml = fs.readFileSync(SITEMAP, 'utf8');
  for (const s of moved) {
    const re = new RegExp(`(<loc>https://stylestar\\.app${s.path}</loc>\\s*<lastmod>)[0-9-]+(</lastmod>)`);
    if (!re.test(xml)) { console.error(`✗ ${s.path} has no sitemap row — add one before stamping it.`); process.exit(2); }
    xml = xml.replace(re, `$1${today}$2`);
  }
  fs.writeFileSync(SITEMAP, xml);
  fs.writeFileSync(STATE, JSON.stringify(
    Object.fromEntries(SURFACES.map(s => [s.path, hashOf(s)])), null, 2) + '\n');
  console.log(`✓ stamped ${today} on: ${moved.map(s => s.path).join(', ')}`);
  process.exit(0);
}

if (seeding) {
  console.error('✗ no content baseline yet. Seed it once with:  node scripts/sitemap-lastmod.js --write');
  process.exit(1);
}
if (!moved.length) { console.log('✓ every curated page\'s <lastmod> matches its content'); process.exit(0); }
console.error('✗ CONTENT CHANGED BUT THE SITEMAP DATE DID NOT: ' + moved.map(s => s.path).join(', '));
console.error('  ▶ <lastmod> is the ONE field crawlers actually use. Left stale, her new pieces');
console.error('    wait for Google to wander back instead of being fetched.');
console.error('  ▶ Fix it with:  node scripts/sitemap-lastmod.js --write');
process.exit(1);
