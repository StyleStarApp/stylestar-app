// Machine sweep of the unverified store-search URLs (2026-08-01).
// For each store not already human-verified: fetch the search URL with two
// different terms. Classify:
//   BLOCKED      - 403/429/timeout/reset: only Cath's browser can tell.
//   SUSPECT      - redirect strips the search (the Boden shape), or both
//                  terms return byte-identical bodies on a server-rendered page.
//   LIKELY OK    - term words visibly present in the HTML, query survives.
//   CLIENT-SIDE  - 200, query survives, but results render in JS: the size
//                  test can't see inside. Not provably ok, not suspicious.
import fs from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
const run = promisify(execFile);

const HTML = fs.readFileSync('/home/user/stylestar-app/index.html', 'utf8');
const storeRe = /^\s*'([^']+(?:\\'[^']*)*)':\{u:'([^']+)'/gm;
const stores = [];
for (const m of HTML.matchAll(/'((?:[^'\\]|\\.)+)':\{u:'([^']+)'/g)) {
  stores.push({ name: m[1].replace(/\\'/g, "'"), u: m[2] });
}

// Human-verified already (July audit + 2026-08-01 session). Skip.
const VERIFIED = new Set([
  'Nordstrom','Sunglass Hut','Warby Parker','SKIMS','Belk','TJ Maxx','Vuori','Ann Taylor',
  'Mejuri',"Chico's",'White House Black Market','Soma','Sam Edelman','Naturalizer','Madewell',
  'J.Crew','Sézane',"Dillard's",'Lacoste','Boden','Theory',"Levi's","Macy's",'Bloomingdales',
  'Tory Burch','Aritzia','Banana Republic','Gap','Old Navy','Athleta','Banana Republic Factory',
  'Quay','Spanx','lululemon','J.Jill','Mango','Kendra Scott',
]);

const targets = stores.filter(s => !VERIFIED.has(s.name));
console.error(`${stores.length} stores in table, ${targets.length} to sweep`);

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const TERM_A = 'pink midi dress', TERM_B = 'leather tote bag';

async function fetchUrl(url) {
  try {
    const { stdout } = await run('curl', [
      '-sL', '--max-time', '15', '--compressed',
      '-A', UA,
      '-H', 'Accept: text/html,application/xhtml+xml',
      '-w', '\n===META=== %{http_code} %{url_effective} %{size_download}',
      url,
    ], { maxBuffer: 30 * 1024 * 1024 });
    const i = stdout.lastIndexOf('\n===META=== ');
    const body = stdout.slice(0, i);
    const [code, finalUrl, size] = stdout.slice(i + 12).trim().split(' ');
    return { code: +code, finalUrl, size: +size, body };
  } catch (e) {
    return { code: 0, finalUrl: '', size: 0, body: '', err: (e.message || '').slice(0, 80) };
  }
}

function termWords(t) { return t.split(' '); }

function classify(store, a, b) {
  const enc = t => encodeURIComponent(t);
  if ((a.code === 0 || a.code >= 400) && (b.code === 0 || b.code >= 400))
    return { cls: 'BLOCKED', note: `HTTP ${a.code}/${b.code} ${a.err || ''}`.trim() };
  // Did the redirect strip the search? (query AND path segment both gone)
  const carried = u => {
    const dec = decodeURIComponent(u.finalUrl || '').toLowerCase();
    return termWords(TERM_A).some(w => dec.includes(w)) || (u.finalUrl || '').includes(enc(TERM_A).slice(0, 10)) ||
           dec.includes('search') || dec.includes('?q') || dec.includes('query') || dec.includes('keyword');
  };
  if (a.code < 400 && !carried(a))
    return { cls: 'SUSPECT', note: `redirects to ${a.finalUrl} (search stripped - the Boden shape)` };
  const bodyHasTerm = termWords(TERM_A).filter(w => a.body.toLowerCase().includes(w)).length >= 2;
  const sizeDelta = Math.abs(a.size - b.size);
  if (bodyHasTerm) return { cls: 'LIKELY OK', note: `term visible in HTML, ${a.size}b` };
  if (a.size > 0 && sizeDelta < 200 && a.body.length > 0)
    return { cls: 'CLIENT-SIDE', note: `term not in HTML, sizes ~equal (${a.size}b vs ${b.size}b)` };
  if (sizeDelta >= 200) return { cls: 'LIKELY OK', note: `server-rendered, sizes differ ${a.size}b vs ${b.size}b` };
  return { cls: 'CLIENT-SIDE', note: `inconclusive (${a.code}, ${a.size}b)` };
}

const results = [];
const pool = 8;
let idx = 0;
async function worker() {
  while (idx < targets.length) {
    const s = targets[idx++];
    const a = await fetchUrl(s.u + encodeURIComponent(TERM_A));
    const b = await fetchUrl(s.u + encodeURIComponent(TERM_B));
    const r = classify(s, a, b);
    results.push({ name: s.name, u: s.u, ...r });
    console.error(`[${results.length}/${targets.length}] ${r.cls.padEnd(11)} ${s.name}`);
  }
}
await Promise.all(Array.from({ length: pool }, worker));

results.sort((x, y) => x.cls.localeCompare(y.cls) || x.name.localeCompare(y.name));
const out = { when: '2026-08-01', results };
fs.writeFileSync(new URL('sweep2-results.json', import.meta.url).pathname, JSON.stringify(out, null, 2));
const counts = {};
for (const r of results) counts[r.cls] = (counts[r.cls] || 0) + 1;
console.log(JSON.stringify(counts));
for (const r of results) console.log(`${r.cls.padEnd(11)} | ${r.name.padEnd(28)} | ${r.note}`);
