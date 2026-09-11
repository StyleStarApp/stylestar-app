#!/usr/bin/env node
/* STAMP THE STYLESHEET LINK WITH styles.css's OWN CONTENT HASH.
 *
 * 🚨 WHY THIS EXISTS, AND IT WAS PAID FOR ON 2026-09-11. Cath opened the live
 * Amazon Finds page on her phone and saw NO tan background and the WRONG font
 * on her own subtitle. Both rules were provably live -- the served styles.css
 * was byte-identical to the repo -- and what her screen showed matched the OLD
 * base `.dc-subtitle` rule exactly. Her browser was rendering yesterday's
 * stylesheet against today's markup.
 *
 * ▶▶ THE FAILURE MODE IS THE DANGEROUS PART: nothing errors. The page loads,
 * every element is there, and it is simply WRONG in ways that look exactly like
 * a build that did not deploy. She spent a round of her own time on it, and so
 * did this session.
 *
 * ⚠️ Netlify already sends `max-age=0, must-revalidate` on styles.css, so this
 * is NOT a missing header -- it is a browser holding an in-memory copy anyway.
 * The only thing a cache cannot serve is a URL it has never seen, so the fix is
 * the URL, not the header.
 *
 * ▶ index.html itself always revalidates, so a new ?v= reaches every returning
 * woman on her next load with nothing for her to clear.
 *
 * USAGE
 *   node scripts/css-version.js --check   exit 1 if the stamp is stale
 *   node scripts/css-version.js --write   restamp it after a CSS edit
 *
 * ⚠️ THE STAMP IS DERIVED, NEVER TYPED. A hand-kept version number is a thing
 * to forget; this one is computed from the file, so --check cannot be fooled.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CSS = path.join(ROOT, 'styles.css');
const HTML = path.join(ROOT, 'index.html');
const LINK = /<link rel="stylesheet" href="\/styles\.css(\?v=[A-Za-z0-9]+)?">/;

const want = crypto.createHash('sha256')
  .update(fs.readFileSync(CSS)).digest('hex').slice(0, 10);

const html = fs.readFileSync(HTML, 'utf8');
const m = LINK.exec(html);
if (!m) {
  console.error('✗ could not find the stylesheet <link> in index.html.');
  console.error('  It must read exactly: <link rel="stylesheet" href="/styles.css">');
  console.error('  ⚠️ The href must stay ABSOLUTE — a relative one 404s on /journal/<slug>.');
  process.exit(2);
}
const have = (m[1] || '').replace('?v=', '');

if (process.argv.includes('--write')) {
  if (have === want) { console.log(`✓ already stamped ?v=${want}`); process.exit(0); }
  fs.writeFileSync(HTML, html.replace(LINK, `<link rel="stylesheet" href="/styles.css?v=${want}">`));
  console.log(`✓ stamped ?v=${want}${have ? ` (was ${have})` : ' (was unstamped)'}`);
  process.exit(0);
}

if (have === want) { console.log(`✓ stylesheet stamp is current (?v=${want})`); process.exit(0); }
console.error(`✗ THE STYLESHEET STAMP IS STALE — styles.css changed and the link did not.`);
console.error(`  link says ?v=${have || '(nothing)'} · styles.css hashes to ${want}`);
console.error(`  ▶ Every returning woman would keep her OLD stylesheet against the NEW markup,`);
console.error(`    with no error anywhere. Fix it with:  node scripts/css-version.js --write`);
process.exit(1);
