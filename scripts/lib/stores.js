// The ONE reader for Cath's STORES table.
//
// ⚠️⚠️ THIS EXISTS BECAUSE A SECOND COPY IS THE BUG. The store table drifted
// away from SEARCH_DOMAINS once already, and CLAUDE.md's rule ledger says it in
// one line: a rule applied to one half is not applied. Anything that needs her
// store list — the tag drafter, the domain generator, any future picker —
// imports this. Nobody re-parses index.html themselves.
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const HTML = path.join(ROOT, 'index.html');

// ⚠️ Read ONLY the STORES table out of index.html, never the whole file into a
// summary. The file is ~905KB; this pulls the one object literal it needs.
export function loadStores(htmlPath = HTML) {
  const src = fs.readFileSync(htmlPath, 'utf8');
  const start = src.indexOf('const STORES=');
  if (start < 0) throw new Error('STORES table not found in index.html');
  // Walk braces from the first { after the '=' to find the literal's end.
  // ⚠️⚠️ COMMENTS MUST BE SKIPPED, NOT JUST STRINGS. The STORES table is full of
  // Cath's prose, and one apostrophe in a comment ("don't", "Cath's") opens a
  // string that never closes, so the walker runs to the end of a 905KB file and
  // returns garbage. Found the first time this ran.
  let i = src.indexOf('{', start), depth = 0, end = -1, inStr = null, esc = false, inLine = false, inBlock = false;
  for (let j = i; j < src.length; j++) {
    const c = src[j], n = src[j + 1];
    if (inLine) { if (c === '\n') inLine = false; continue; }
    if (inBlock) { if (c === '*' && n === '/') { inBlock = false; j++; } continue; }
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '/' && n === '/') { inLine = true; j++; continue; }
    if (c === '/' && n === '*') { inBlock = true; j++; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { end = j; break; } }
  }
  if (end < 0) throw new Error('could not find the end of the STORES literal');
  const literal = src.slice(i, end + 1);
  // eslint-disable-next-line no-new-func
  return new Function('return (' + literal + ')')();
}

// The bare host a store's search URL points at, lowercased, `www.` removed.
// This is what a shopping result's seller name has to be matched back to.
export function storeHost(entry) {
  const m = /^https?:\/\/([^/]+)/i.exec(String(entry && entry.u || ''));
  return m ? m[1].toLowerCase().replace(/^www\./, '') : '';
}
