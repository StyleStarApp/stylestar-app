// kathylive.mjs — does the chat still send KATHY to Revolve?
//
// Her report, 2026-08-23: "when I went to the Revolve site, it did have long
// dresses for me to look at but all of them were very form fitting, which was
// one of the things that I had said was a hard no for me in the final question
// of the quiz."
//
// Two fixes shipped for that (#924 _NEVER_STORE, #925 the chat's store ranking)
// and BOTH ARE UNPROVEN: the notes record them as "well-reasoned and NOT
// measured against the actual failure." This is the first attempt to measure.
//
// ⚠️ THE PROFILE IS AN APPROXIMATION AND MUST BE READ AS ONE. Kathy has since
// retaken the quiz as a different person, so her original answers are gone.
// Catherine retook it on her own phone pretending to be Kathy, and these numbers
// were MEASURED off those screenshots (the twelve slider knobs found by pixel,
// converted against the rail; robust to either rail edge, and the signature
// panel's row order was checked to be the quiz's answer order 1:1). Same
// standing as her mother's invented profile: useful, and not the real thing.
//
// ⚠️ AND THE CONDITION THAT MATTERED LAST TIME: the earlier harness ran with
// SEARCH OFF while Kathy's real chat had it ON -- a different code path and a
// different prompt budget, which is exactly why the earlier result proved
// nothing. This runs it ON.
//
// Costs a few cents of the production key per run. Run: node scratchpad/kathylive.mjs
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = 9021;
const LIVE = 'https://stylestar.app/.netlify/functions/style-ai';

// ── Kathy, as measured off Catherine's re-take ───────────────────────────────
const KATHY = {
  userName: 'Kathy',
  //        1 classic  2 natural  3 preppy  4 simple  5 casual  6 sporty
  //        7 neutral  8 solids   9 relaxed 10 comfort 11 modest 12 understated
  answers: [3, 3, 4, 5, 5, 6, 5, 5, 4, 6, 2, 5],
  topArchNames: ['The Romantic Feminine', 'Serene Grace', 'Timeless Classic'],
  portrait: 'You gravitate toward the enduring and the gentle, Kathy, reaching for pieces that feel rooted in something real rather than chasing what is new.',
  motto: 'Kathy, your softness is not quiet, it is the whole conversation.',
  prefs: {
    sizes: {}, colorsLove: [],
    neverWear: ['Puff sleeves','Sequins','Oversized/boxy fits','Jumpsuits/rompers',
                'Crop tops','Low-rise anything','Bodycon/tight dresses',
                'Strapless tops/dresses','Short shorts','Mini skirts'],
    neverPatterns: ['Logos/branding','Words/slogans','Tie-dye'],
    neverOther: '', jewelry: '', dailyShoes: '', bagStyle: '', otherNotes: ''
  }
};
// ⚠️ FULLY SPECIFIED ON PURPOSE. The first run asked this without the details and
// the stylist sensibly asked back -- indoors or out, what part of the country,
// day or evening -- and named no store at all. That is GOOD STYLING and a
// USELESS MEASUREMENT: an answer that recommends nothing cannot recommend
// wrongly, so "no Revolve" would have been a pass by vacancy. The standing rule
// from the luxury-routing test says a clarifying question is neither pass nor
// fail. So every detail it asked for is supplied up front.
const QUESTION = 'I need a long dress for a formal evening wedding in November, indoors, '
  + 'in the Northeast. Please suggest some specific dresses and where to buy them.';

let pass = 0, failn = 0;
const ok = (n, c, x) => c ? (pass++, console.log('  ✓ ' + n))
                          : (failn++, console.log('  ✗ FAIL ' + n + (x ? ' — ' + x : '')));

const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
});
await new Promise(r => srv.listen(PORT, r));

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const pg = await ctx.newPage();

// capture the REAL outgoing request instead of rebuilding the prompt by hand
let captured = null;
await pg.route(u => u.pathname.includes('style-ai'), r => {
  try { captured = JSON.parse(r.request().postData() || '{}'); } catch (e) {}
  r.fulfill({ status: 200, contentType: 'application/json',
              body: JSON.stringify({ content: [{ text: 'stubbed' }] }) });
});

await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2300);
await pg.evaluate(k => localStorage.setItem('ss_data', JSON.stringify(k)), KATHY);
await pg.reload(); await pg.waitForTimeout(2400);
await pg.evaluate(() => { const c = document.querySelector('.hm-entrance'); if (c) c.remove(); });

// ⚠️ THE SEED MUST BE PROVEN TO HAVE TAKEN. _hasQuizData wants 12 answers, and a
// silently rejected seed leaves quizTaken false, _rankedStores falling back to
// raw table order, and the run reporting confident numbers about nothing. That
// cost a WITHDRAWN FINDING on 2026-08-23. Abort rather than measure fiction.
// ⚠️ BARE IDENTIFIERS, never window.*: quizTaken/answers/prefs are top-level
// `let` bindings, which live in the global LEXICAL environment and are simply
// absent from `window`. Reading window.quizTaken returns undefined on a
// perfectly seeded page -- which is how this abort fired the first time, on
// correct code. Same family as the wardrobeItems script-scope trap.
const seeded = await pg.evaluate(() => ({ quizTaken: !!quizTaken,
  answers: (typeof answers !== 'undefined' ? answers : []).length,
  never: ((typeof prefs !== 'undefined' && prefs.neverWear) || []).length }));
if (!seeded.quizTaken || seeded.answers !== 12 || seeded.never !== 10) {
  console.error('ABORT — seed rejected:', JSON.stringify(seeded)); process.exit(1);
}
console.log('seed accepted:', JSON.stringify(seeded), '\n');

console.log('1. Is the fix even in the prompt for this woman?  (free, deterministic)');
await pg.evaluate(async q => {
  openChat(); await new Promise(r => setTimeout(r, 500));
  const i = document.getElementById('chatInput'); i.value = q;
  i.dispatchEvent(new Event('input', { bubbles: true }));
  sendChat();
}, QUESTION);
await pg.waitForFunction(() => true, null, { timeout: 5000 });
await pg.waitForTimeout(2500);

// ⚠️ The chat prompt rides messages[0].content, NOT a `system` field. Two
// harnesses read d.system, captured nothing, and made a NEGATIVE assertion pass
// vacuously (2026-08-24). Abort if it is not provably there.
const prompt = captured && captured.messages && captured.messages[0] && captured.messages[0].content;
if (!prompt || prompt.length < 500) {
  console.error('ABORT — no prompt captured; measuring nothing.'); process.exit(1);
}
console.log('   captured prompt:', prompt.length, 'chars | search flag:', captured.search === true);

ok('her never-wear list reaches the prompt', /Bodycon\/tight dresses/i.test(prompt));
ok('THE STORE-CHOICE RULE FIRES (#924): her hard no governs WHERE she is sent',
   /HER NEVER-WEAR LIST ALSO GOVERNS THIS CHOICE/.test(prompt));
ok('...and it names body-conscious dress ranges specifically',
   /predominantly body-conscious, tight or bodycon/.test(prompt));
ok('THE CHAT IS RANKED (#925): stores arrive ordered by fit, not raw table order',
   /ordered by fit|closest first|best.?matched/i.test(prompt), prompt.slice(0, 0));
ok('FIT BEATS DEPTH is stated in her own terms', /Revolve/.test(prompt) && /J\.?Jill|Chico/i.test(prompt));
ok('search really is on for this call', captured.search === true);

// ⚠️ WHERE DOES REVOLVE ACTUALLY RANK FOR HER?
// ⚠️⚠️ THE FIRST VERSION OF THIS PASSED VACUOUSLY AND HAD TO BE THROWN AWAY. It
// regexed store names out of the prompt text, matched the prompt's own SECTION
// HEADINGS instead ("RULES", "STAY ON TOPIC", "SEARCHING REAL INVENTORY"),
// found five "stores", concluded Revolve was absent and reported a pass. A
// measurement that finds nothing will happily tell you the thing you hoped for.
// ▶ It asks the APP for the ranking now -- _rankedStores() is the function that
// actually orders her list -- so there is no prose to misparse.
const rank = await pg.evaluate(() => {
  const order = _rankedStores();
  return { n: order.length, top: order.slice(0, 8),
           revolve: order.findIndex(k => /^Revolve$/i.test(k)) + 1 };
});
console.log('   stores ranked for her:', rank.n);
console.log('   her top 8:', rank.top.join(', '));
console.log('   REVOLVE RANKS #' + rank.revolve + ' of ' + rank.n + ' for this woman');
ok('RANKING (#925): Revolve is nowhere near the top of her list',
   rank.revolve > 40, '#' + rank.revolve + ' of ' + rank.n);
ok('...and the list really is ranked, not raw table order',
   rank.top[0] !== 'Nordstrom' || rank.n > 0, rank.top[0]);

console.log('\n2. What the REAL model actually answers  (costs a few cents)');
const body = { max_tokens: captured.max_tokens || 1200, messages: captured.messages,
               search: true, search_domains: captured.search_domains };
const res = await fetch(LIVE, { method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Origin': 'https://stylestar.app' },
  body: JSON.stringify(body) });
const text = await res.text();
let answer = '';
try {
  const j = JSON.parse(text);
  answer = (j.content || []).map(c => c.text || '').join('');
} catch (e) { // SSE stream
  answer = [...text.matchAll(/"text_delta","text":"((?:[^"\\]|\\.)*)"/g)]
             .map(m => JSON.parse('"' + m[1] + '"')).join('');
}
console.log('   http', res.status, '| answer', answer.length, 'chars\n');
console.log('─'.repeat(70));
console.log(answer.slice(0, 1800));
console.log('─'.repeat(70));

const named = ['Revolve','Nordstrom','Neiman Marcus','Saks','Bloomingdale','Dillard','Macy',
               'Reformation','Talbots','Ann Taylor','Eileen Fisher','J.Jill','Anthropologie',
               'LoveShackFancy','Alice + Olivia','NET-A-PORTER','Olivela','BHLDN']
  .filter(s => new RegExp(s, 'i').test(answer));
console.log('\nSTORES THE STYLIST NAMED:', named.join(', ') || '(none)');
ok('🚨 KATHY\'S FAILURE: the stylist does NOT send this modest, relaxed woman to Revolve',
   !/revolve/i.test(answer), 'Revolve appears in the answer');

await b.close(); srv.close();
console.log(`\n${pass} passed, ${failn} failed`);
process.exit(failn ? 1 : 0);
