#!/usr/bin/env node
// Generate data/store-domains.json from Cath's STORES table in index.html.
//
// ▶ WHY A GENERATED FILE AT ALL: a Netlify function cannot parse a 905KB HTML
//   page on every request, and the shopping-search finder has to know which
//   sellers are hers. So the list is DERIVED, never hand-written.
// ⚠️⚠️ IF YOU EVER FIND YOURSELF TYPING A STORE NAME INTO THIS FILE OR INTO THE
//   JSON, STOP. index.html is the single source of truth. Hand-copying it is the
//   exact drift that produced the SEARCH_DOMAINS bug. `scratchpad/findprod.js`
//   asserts the two are in sync and fails if they are not.
//
//   node scripts/build-store-domains.js          # write it
//   node scripts/build-store-domains.js --check  # verify it is current (CI-safe)
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {loadStores, storeHost} from './lib/stores.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'netlify', 'functions', 'lib', 'store-domains.js');

export function buildDomains() {
  const stores = loadStores();
  const out = {};
  for (const [name, entry] of Object.entries(stores)) {
    const host = storeHost(entry);
    if (!host) continue;                       // no search url -> cannot be matched back
    out[name] = {
      host,
      tier: entry.t || '',
      // Her own size ranges, kept because the finder uses them to say which
      // shops honestly carry a width or a petite line. Never inferred.
      sizes: Array.isArray(entry.s) ? entry.s.slice() : [],
    };
  }
  return out;
}

// ⚠️ A JS MODULE, NOT JSON, AND THAT IS DELIBERATE: JSON import syntax has
//    changed twice across Node versions (`assert` then `with`), and a serverless
//    runtime on the wrong one fails at DEPLOY time, not in any test here. A plain
//    module import works on every version there is.
const payload = () => '// GENERATED from the STORES table in index.html by\n' +
  '// scripts/build-store-domains.js. DO NOT EDIT BY HAND — run the script.\n' +
  '// `node scripts/build-store-domains.js --check` fails if this is stale.\n' +
  'export default ' + JSON.stringify(buildDomains(), null, 1) + ';\n';

if (process.argv[1] && process.argv[1].endsWith('build-store-domains.js')) {
  const next = payload();
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (cur !== next) {
      console.error('✗ netlify/functions/lib/store-domains.js is STALE. Run: node scripts/build-store-domains.js');
      process.exit(1);
    }
    console.log('✓ store-domains.js is in sync with index.html');
  } else {
    fs.mkdirSync(path.dirname(OUT), {recursive: true});
    fs.writeFileSync(OUT, next);
    console.log(`✓ wrote netlify/functions/lib/store-domains.js — ${Object.keys(buildDomains()).length} stores`);
  }
}
