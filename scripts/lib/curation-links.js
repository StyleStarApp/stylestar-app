// curation-links.js — WHERE HER LIVE LINKS ACTUALLY ARE.
//
// 🚨 WHY THIS EXISTS. On 2026-09-08 Cath found the Star of the Week SOLD OUT --
// the Serpui Abigail Handbag, on screen, the one piece the app puts in front of
// every woman that week. Nothing caught it but her.
// ▶ The link-rot watchdog already detected "sold out" perfectly well. It was
//   just pointed at `products.json` -- the 107-item catalog she FROZE on
//   2026-09-05 and no longer maintains -- and had NEVER looked at the Style Star
//   Edit or the WEEK_STARS queue, which are two of the exact three places
//   CLAUDE.md says her curation now lives, and the two always on screen.
// ⚠️⚠️ THE STAKES WERE INVERTED FROM WHERE THE WATCHING WAS. A dead link among
//   107 unphotographed catalog rows dies quietly BY DESIGN (an accepted cost of
//   freezing). A sold-out Star is the week's single headline piece, and a
//   sold-out Edit pick is one of ~31 she has personally vouched for.
//
// Parsers live here rather than in the script so they can be tested with no
// network at all -- scratchpad/linkwatch.js.
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import {fileURLToPath} from 'url';

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const html = () => fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const unent = s => String(s || '')
  .replace(/&mdash;/g, '—').replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/&middot;/g, '\u00b7').replace(/&rsquo;/g, '\u2019').trim();

/* THE FROZEN CATALOG. Still checked, but it is the LOWEST priority surface now:
   she adds no rows and checks no links, and a death here is accepted. */
export function collectCatalog(root = ROOT) {
  const f = path.join(root, 'products.json');
  if (!fs.existsSync(f)) return [];
  const {products} = JSON.parse(fs.readFileSync(f, 'utf8'));
  return products.filter(p => p.active).map(p => ({
    source: 'catalog', id: p.id, name: p.name, brand: p.brand,
    retailer: p.retailer, url: p.url
  }));
}

/* THE STYLE STAR EDIT — hand-written .dc-item blocks in index.html. Every one is
   a piece she personally chose, and the disclosure says so out loud, which is
   exactly why a dead one matters more than a catalog row. */
/* 🚨 SCOPED BY SCREEN SINCE 2026-09-11, AND THE REASON IS THE USEFUL PART. This
   used to split the WHOLE source file, which was correct while `.dc-item` lived
   on exactly one screen. Amazon Finds now uses the same markup, so an unscoped
   split silently filed her Finds pieces under "THE STYLE STAR EDIT" — a report
   that sends her to the wrong page to fix a dead link is worse than no report.
   ⚠️ A THIRD CURATED SCREEN WILL DO THIS AGAIN: give it a slice here and a
   SURFACE entry below, or its pieces vanish from the report with no error. */
function screenSlice(src, id, nextId) {
  const i = src.indexOf(`id="${id}"`);
  if (i < 0) return '';
  const j = src.indexOf(`id="${nextId}"`, i);
  return src.slice(i, j < 0 ? src.length : j);
}

export function collectEdit(src = html(), opts = {}) {
  const source = opts.source || 'edit';
  const scope = opts.scope === undefined
    ? screenSlice(src, 's-dream', 's-finds')
    : opts.scope;
  const out = [];
  const blocks = String(scope).split('<div class="dc-item">').slice(1);
  for (const b of blocks) {
    const block = b.slice(0, b.indexOf('</div>\n    </div>') + 1 || 4000);
    const name = /<div class="dc-item-name">([\s\S]*?)<\/div>/.exec(block);
    const store = /<span class="dc-store">([\s\S]*?)<\/span>/.exec(block);
    const price = /<span class="dc-price">([\s\S]*?)<\/span>/.exec(block);
    const href = /<a class="dc-item-btn"[^>]*href="([^"]+)"/.exec(block);
    if (!name || !href) continue;
    out.push({
      source, id: source, name: unent(name[1]), brand: '',
      retailer: unent(store && store[1]), price: unent(price && price[1]),
      url: unent(href[1])
    });
  }
  return out;
}

/* AMAZON FINDS — the same hand-written markup on her second curated screen.
   Same rule, same loudness: she vouched for these out loud too. */
export function collectFinds(src = html()) {
  return collectEdit(src, {
    source: 'finds',
    scope: screenSlice(src, 's-finds', 's-shop')
  });
}

/* THE STAR OF THE WEEK QUEUE. Only names in WEEK_STAR_PHOTO_ORDER rotate — that
   list is the whitelist, not a sort hint (her rule, 2026-08-26), so an entry
   whose name is absent renders NOWHERE and is not worth waking her about.
   ⚠️ The retired Serpui entry is exactly such an entry and must stay excluded. */
export function collectStars(src = html()) {
  const lit = (start, open, close) => {
    const i = src.indexOf(start);
    if (i < 0) return null;
    const j = src.indexOf(open, i);
    let d = 0;
    for (let k = j; k < src.length; k++) {
      if (src[k] === open) d++;
      else if (src[k] === close && --d === 0) return src.slice(j, k + 1);
    }
    return null;
  };
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext('var WEEK_STARS=' + lit('var WEEK_STARS=[', '[', ']') + ';'
    + 'var ORDER=' + lit('var WEEK_STAR_PHOTO_ORDER=[', '[', ']') + ';', ctx);
  const stars = vm.runInContext('WEEK_STARS', ctx);
  const order = vm.runInContext('ORDER', ctx);
  // ⚠️ The anchor is READ OUT OF THE APP, never restated here. A second copy of a
  // date is a second thing to keep in step, and this file's whole subject is what
  // happens when one copy quietly stops matching the other.
  const m = /Date\.UTC\((\d{4}),(\d{1,2}),(\d{1,2})\)/.exec(src.slice(src.indexOf('Which week is it?')));
  const anchor = m ? Date.UTC(+m[1], +m[2], +m[3]) : Date.UTC(2026, 7, 9);
  const now = new Date();
  const days = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - anchor) / 86400000);
  const week = Math.max(0, Math.floor(days / 7));
  const pool = order.map(n => stars.find(s => s.n === n)).filter(s => s && (s.px || s.ownPx));
  return pool.map((s, i) => {
    // how many weeks until this one is the live Star (0 = on screen right now)
    const due = ((i - (week % pool.length)) + pool.length) % pool.length;
    return {source: 'star', id: due === 0 ? 'LIVE NOW' : 'in ' + due + 'wk',
            due, name: s.n, brand: '', retailer: s.store, price: s.price, url: s.url};
  });
}

export function collectAll(root = ROOT) {
  return [...collectStars(), ...collectEdit(), ...collectFinds(), ...collectCatalog(root)];
}

/* ── IS IT ACTUALLY IN STOCK? ────────────────────────────────────────────────
   🚨 MEASURED ON TWO REAL PAGES ON 2026-09-08, AND THE MEASUREMENT CHANGED THE
   DESIGN. The sold-out Serpui and the in-stock Saint Laurent were compared:

     page       JSON-LD OutOfStock / InStock     prose "sold out"
     Serpui           1 / 0                            4
     Saint Laurent    0 / 1                            2   ← A HEALTHY PAGE

   ▶▶ THE HEALTHY PAGE SAYS "SOLD OUT" TWICE. Prose is noise — stores print it on
   size rows and on recommended products — which is exactly why the original
   script sent prose to NEEDS HER EYE and never to BROKEN. That judgement was
   right and is kept.
   ▶ But schema.org availability is a PRODUCT-LEVEL, machine-readable claim by the
   retailer, and it separated the two cleanly. So that, and only that, is allowed
   to say SOLD OUT on its own.
   ⚠️ MIXED (both InStock and OutOfStock present) means variants differ — some
   sizes gone, product alive. That is her eye, not ours. */
export function stockVerdict(body) {
  const s = String(body || '');
  const out = (s.match(/"availability"\s*:\s*"[^"]*OutOfStock/gi) || []).length
            + (s.match(/availability"?\s*content="[^"]*OutOfStock/gi) || []).length;
  const inn = (s.match(/"availability"\s*:\s*"[^"]*InStock/gi) || []).length
            + (s.match(/availability"?\s*content="[^"]*InStock/gi) || []).length;
  if (out && !inn) return {state: 'out', why: 'the retailer\'s own schema.org availability says OutOfStock'};
  if (out && inn) return {state: 'mixed', why: 'some variants OutOfStock, some InStock — likely sizes, worth a look'};
  if (inn) return {state: 'in', why: 'schema.org availability says InStock'};
  return {state: 'unknown', why: ''};
}

/* How loudly to shout, by surface. A dead Star this week is an emergency; a dead
   catalog row is a note. Sorting by this is what makes the report readable. */
export const SURFACE = {
  star:    {rank: 0, label: 'STAR OF THE WEEK', note: 'the piece every woman sees this week'},
  edit:    {rank: 1, label: 'THE STYLE STAR EDIT', note: 'pieces she personally vouched for'},
  finds:   {rank: 2, label: 'AMAZON FINDS', note: 'pieces she personally vouched for'},
  catalog: {rank: 3, label: 'the frozen catalog', note: 'no longer maintained — a death here is accepted'}
};
