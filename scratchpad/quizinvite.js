// scratchpad/quizinvite.js — THE COLD-VISITOR QUIZ INVITATION
//
// Her catch (2026-09-01): "see ideas in your style" means she would have had
// to take the quiz for us to know her style, but if she lands there we could
// still show her ideas.
//
// ⚠️ THE FINDING THIS SUITE PROTECTS, AND IT IS NOT THE OBVIOUS ONE: nothing
// was ever gated. A woman who has never taken the quiz taps that link today
// and gets four REAL cards with four working links; the prompt simply omits
// the "Her style: X" line. So the FIRST assertions here are that the ideas
// still arrive in full for her — the invitation is an offer sitting under
// real value, never a toll gate (her own value-first rule). If a future
// change ever makes the ideas conditional on the quiz, this suite fails.
//
// ⚠️ SEED SHAPE IS LOAD-BEARING: _hasQuizData() requires d.userName (NOT
// d.name), 12 answers AND a non-empty portrait. A seed with `name` looks
// correct, saves without error, and is read as a woman who never took the
// quiz — the documented "a shape the app never produces" trap. The real
// shape is written at genResult(): {userName, answers, topArchNames,
// portrait, motto}.
import fs from 'fs';
import http from 'http';
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import handler from '/home/user/stylestar-app/netlify/edge-functions/page-titles.js';
const { chromium } = pw;

const ROOT = '/home/user/stylestar-app';
const RAW = fs.readFileSync(ROOT + '/index.html', 'utf8');
const TYPES = { '.css': 'text/css', '.png': 'image/png', '.xml': 'application/xml',
                '.txt': 'text/plain', '.json': 'application/json' };

let pass = 0, fail = 0;
const ok = (n, c, x) => { c ? (pass++, console.log('  ✓ ' + n))
                            : (fail++, console.log('  ✗ FAIL: ' + n + (x ? '  [' + x + ']' : ''))); };

async function edge(path) {
  const ctx = { next: async () => new Response(RAW, { headers: { 'content-type': 'text/html' } }) };
  return await (await handler(new Request('https://stylestar.app' + path), ctx)).text();
}

// Strip comments before matching source, or a check counts the prose that
// describes it (the documented false pass, twice over on 2026-09-01).
const JSCODE = RAW.replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*\/\/.*$/gm, '');

// Relative luminance / WCAG contrast, computed against the REAL painted paint.
const lum = c => { const s = c.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => {
  v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05); };

const run = async () => {

console.log('\n== PART A — the source ==');

ok('A: _wdrQuizInvite is defined exactly once',
   (JSCODE.match(/function _wdrQuizInvite/g) || []).length === 1);
ok('A: it stands down the moment she has quiz data',
   /function _wdrQuizInvite\(\)\{\s*if\(_hasQuizData\(\)\)return '';/.test(JSCODE));
ok('A: it is called from BOTH render paths (the two cannot drift)',
   (JSCODE.match(/_wdrQuizInvite\(\)/g) || []).length - 1 === 2,
   String((JSCODE.match(/_wdrQuizInvite\(\)/g) || []).length - 1));
// Wording A, HER pick from three rendered options (2026-09-01).
ok('A: her chosen wording, verbatim',
   JSCODE.includes("I don\\'t know your style yet, so these are a general mix.")
   && JSCODE.includes('for picks made just for you.'));
ok('A: the tappable half opens the quiz',
   /<span onclick="startQ\(\)">Take the free style quiz<\/span>/.test(JSCODE));
ok('A: no dashes in it (house style)',
   !/I\\'m|—|--/.test(JSCODE.slice(JSCODE.indexOf('function _wdrQuizInvite'),
                                   JSCODE.indexOf('function _wdrQuizInvite') + 500)
                        .replace(/^.*?return/s, '')));
// It reuses .wdr-colorhint, so it inherits the voice AND the #s-trending twin.
ok('A: it wears the established whisper class',
   /_wdrQuizInvite[\s\S]{0,400}?class="wdr-colorhint"/.test(JSCODE));
// ⚠️ SUPERSEDE, NOT STACK: a woman with no quiz has no saved colours either.
ok('A: the colour hint is the ELSE branch, so the two never stack',
   /const _inv=_wdrQuizInvite\(\);\s*if\(_inv\)html\+=_inv;\s*else if\(noColorData\)/.test(JSCODE));
{
  // Position: it must be built AFTER "+ See more ideas" in both paths.
  const main = JSCODE.indexOf('const _inv=_wdrQuizInvite()');
  const mainMore = JSCODE.lastIndexOf('+ See more ideas', main);
  const cat = JSCODE.indexOf("chtml+=_wdrQuizInvite()");
  const catMore = JSCODE.lastIndexOf('+ See more ideas', cat);
  ok('A: main path builds it after "+ See more ideas"', mainMore > 0 && mainMore < main);
  ok('A: catalog-only path builds it after "+ See more ideas"', catMore > 0 && catMore < cat);
}

console.log('\n== PART B — the real app in a real browser ==');

const srv = http.createServer((req, res) => {
  const p = req.url.split('?')[0];
  if (p === '/index.html') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(RAW); }
  const ext = p.slice(p.lastIndexOf('.'));
  if (TYPES[ext] && fs.existsSync(ROOT + p)) {   // .css AS text/css or Chromium refuses it
    res.writeHead(200, { 'content-type': TYPES[ext] }); return res.end(fs.readFileSync(ROOT + p));
  }
  edge(p === '/' ? '/' : p.replace(/\/+$/, ''))
    .then(h => { res.writeHead(200, { 'content-type': 'text/html' }); res.end(h); })
    .catch(() => { res.writeHead(404); res.end('no'); });
});
await new Promise(r => srv.listen(8987, r));

const AI_OK = JSON.stringify({ content: [{ type: 'text', text: JSON.stringify({ items: [
  { name: 'Butter Yellow Linen Shirt', store: 'Madewell', search: 'butter yellow linen shirt', why: 'x' },
  { name: 'Butter Yellow Knit Tank',   store: 'J.Crew',   search: 'butter yellow knit tank',   why: 'x' },
  { name: 'Butter Yellow Midi Dress',  store: 'Boden',    search: 'butter yellow midi dress',  why: 'x' },
  { name: 'Butter Yellow Cardigan',    store: 'Talbots',  search: 'butter yellow cardigan',    why: 'x' }] }) }] });

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

async function page(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: opts.w || 390, height: 900 } });
  if (opts.quizzed) await ctx.addInitScript(() => {
    localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath',
      answers: new Array(12).fill(6), topArchNames: ['Classic Sophisticate'],
      portrait: 'A real portrait sentence.', motto: 'Shine.' }));
  });
  if (opts.prefs) await ctx.addInitScript(p => { localStorage.setItem('ss_prefs', p); }, JSON.stringify(opts.prefs));
  await ctx.route('**/*', r => {
    const u = r.request().url();
    if (u.includes('/.netlify/functions/style-ai')) {
      return opts.aiFails ? r.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
                          : r.fulfill({ status: 200, contentType: 'application/json', body: AI_OK });
    }
    return (new URL(u).host === 'localhost:8987') ? r.continue() : r.abort();
  });
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e)));
  return { ctx, pg, errs };
}

// Read the box once, the same way for every case.
const readBox = boxId => `(() => {
  const b = document.getElementById('${boxId}');
  if (!b) return { err: 'no box' };
  const hints = [...b.querySelectorAll('.wdr-colorhint')];
  const grid = b.querySelector('.shop-grid.hscroll');
  const more = b.querySelector('.wdr-morewrap');
  const inv  = hints.find(h => /style quiz/i.test(h.textContent));
  const kids = [...b.children];
  return {
    cards: grid ? grid.querySelectorAll('.shop-card').length : 0,
    links: b.querySelectorAll('.shop-grid a[href]').length,
    hints: hints.length,
    invite: !!inv,
    colour: hints.some(h => /Refine your Preferences/.test(h.textContent)),
    text: inv ? inv.textContent.trim() : '',
    span: inv ? !!inv.querySelector('span[onclick*="startQ"]') : false,
    last: inv ? kids.indexOf(inv) === kids.length - 1 : false,
    afterGrid: (inv && grid) ? kids.indexOf(inv) > kids.indexOf(grid) : false,
    afterMore: (inv && more) ? kids.indexOf(inv) > kids.indexOf(more) : false,
    ink:  inv ? getComputedStyle(inv).color : '',
    linkInk: inv && inv.querySelector('span') ? getComputedStyle(inv.querySelector('span')).color : '',
    bg: (() => { let e = b; while (e) { const c = getComputedStyle(e).backgroundColor;
      if (c && c !== 'rgba(0, 0, 0, 0)' && !/, 0\\)$/.test(c)) return c; e = e.parentElement; } return 'rgb(255,255,255)'; })(),
    // ⚠️ .shop-grid.hscroll is a HORIZONTAL SCROLLER by design (overflow-x:auto,
    // cards flex:0 0 128px), so its own children legitimately sit past the
    // viewport edge. A first run flagged every card and failed on correct
    // code. Measure what does NOT live inside the scroller.
    over: [...b.querySelectorAll('*')].filter(e => !e.closest('.shop-grid.hscroll'))
      .filter(e => { const r = e.getBoundingClientRect();
        return r.width > 0 && (r.right > document.documentElement.clientWidth + 1 || r.left < -1); })
      .map(e => e.className).slice(0, 4),
  };
})()`;

const openTrendIdeas = async pg => {
  await pg.evaluate(() => document.querySelector('#s-trending .wdr-tcard .tlf').click());
  await pg.waitForTimeout(1500);
};

// --- CASE 1: she has never taken the quiz, landing cold on /trending
{
  const { ctx, pg, errs } = await page();
  await pg.goto('http://localhost:8987/trending', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(900);
  await openTrendIdeas(pg);
  const b = await pg.evaluate(readBox('wx_trend0'));
  // ▶ VALUE FIRST: the ideas themselves must be untouched.
  ok('B1: a woman who never took the quiz still gets 4 real ideas', b.cards === 4, JSON.stringify(b));
  ok('B1: ...with 4 working links (nothing is gated)', b.links === 4, String(b.links));
  ok('B1: the invitation appears for her', b.invite, JSON.stringify(b));
  ok('B1: exactly one whisper, never two', b.hints === 1, String(b.hints));
  ok('B1: her wording, on the page', /I don't know your style yet/.test(b.text)
     && /picks made just for you/.test(b.text), b.text);
  ok('B1: the quiz half is tappable', b.span);
  ok('B1: it sits at the very BOTTOM of the box', b.last, 'last=' + b.last);
  ok('B1: ...after the ideas themselves', b.afterGrid);
  ok('B1: ...and after "+ See more ideas"', b.afterMore);
  ok('B1: the body ink clears AA on the real paint', ratio(b.ink, b.bg) >= 4.5,
     b.ink + ' on ' + b.bg + ' = ' + ratio(b.ink, b.bg).toFixed(2));
  ok('B1: the tappable half clears AA too', ratio(b.linkInk, b.bg) >= 4.5,
     b.linkInk + ' on ' + b.bg + ' = ' + ratio(b.linkInk, b.bg).toFixed(2));
  ok('B1: nothing overflows at 390', b.over.length === 0, JSON.stringify(b.over));

  // "+ See more ideas" appends into the GRID, so it must not duplicate or displace it.
  const after = await pg.evaluate(async (js) => {
    document.querySelector('#wx_trend0 .wdr-more').click();
    await new Promise(r => setTimeout(r, 1400));
    return eval(js);
  }, readBox('wx_trend0'));
  ok('B1: "+ See more ideas" really adds cards', after.cards > b.cards, b.cards + ' -> ' + after.cards);
  ok('B1: ...and does NOT duplicate the invitation', after.hints === 1, String(after.hints));
  ok('B1: ...and it is still the last thing in the box', after.last);

  // It really is a door.
  const landed = await pg.evaluate(async () => {
    document.querySelector('#wx_trend0 .wdr-colorhint span[onclick*="startQ"]').click();
    await new Promise(r => setTimeout(r, 600));
    return (document.querySelector('.scr.act') || {}).id;
  });
  ok('B1: tapping it opens the quiz', landed === 's-quiz', String(landed));
  ok('B1: zero JS errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// --- CASE 2: she HAS taken the quiz — it must never nag her
{
  const { ctx, pg, errs } = await page({ quizzed: true });
  await pg.goto('http://localhost:8987/trending', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(900);
  const gate = await pg.evaluate(() => _hasQuizData());
  ok('B2: the seed really reads as a quiz-taker (guards the seed-shape trap)', gate === true);
  await openTrendIdeas(pg);
  const b = await pg.evaluate(readBox('wx_trend0'));
  ok('B2: she still gets her 4 ideas', b.cards === 4, JSON.stringify(b));
  ok('B2: and NO invitation at all', !b.invite && b.hints === 0, JSON.stringify(b));
  ok('B2: zero JS errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// --- CASE 3: the supersede. No quiz means no colours either, so the one
// colour-dependent checklist item must show ONE whisper, and it is the quiz.
{
  const { ctx, pg, errs } = await page();
  await pg.goto('http://localhost:8987/', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(900);
  await pg.evaluate(async () => {
    openWardrobe();
    await new Promise(r => setTimeout(r, 500));
    wardrobeSeeIdeas('to3');            // "Tops in your favorite colors"
  });
  await pg.waitForTimeout(1600);
  const b = await pg.evaluate(readBox('wx_to3'));
  ok('B3: the colour item still shows its 4 ideas', b.cards === 4, JSON.stringify(b));
  ok('B3: exactly ONE whisper, never a stack of two', b.hints === 1, String(b.hints));
  ok('B3: and it is the quiz one, not the colour one', b.invite && !b.colour, JSON.stringify(b));
  ok('B3: zero JS errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// --- CASE 4: the colour hint is NOT retired — a quizzed woman with no
// colours saved must still be nudged to Refine. (The supersede fires only
// for a woman with no quiz at all.)
{
  const { ctx, pg, errs } = await page({ quizzed: true });
  await pg.goto('http://localhost:8987/', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(900);
  await pg.evaluate(async () => {
    openWardrobe();
    await new Promise(r => setTimeout(r, 500));
    wardrobeSeeIdeas('to3');
  });
  await pg.waitForTimeout(1600);
  const b = await pg.evaluate(readBox('wx_to3'));
  ok('B4: the colour hint still fires for a quizzed woman with no colours',
     b.colour && !b.invite, JSON.stringify(b));
  ok('B4: still exactly one whisper', b.hints === 1, String(b.hints));
  ok('B4: zero JS errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// --- CASE 5: the AI-failed, catalog-only shelf carries it too, or the two
// render paths drift apart the first time the model has a bad minute.
{
  const { ctx, pg, errs } = await page({ aiFails: true });
  await pg.goto('http://localhost:8987/', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(900);
  await pg.evaluate(async () => {
    openWardrobe();
    await new Promise(r => setTimeout(r, 700));
    wardrobeSeeIdeas('to1');            // White tops — has real catalog products
  });
  await pg.waitForTimeout(2000);
  const b = await pg.evaluate(readBox('wx_to1'));
  ok('B5: the catalog shelf still renders when the AI fails', b.cards > 0, JSON.stringify(b));
  ok('B5: ...and carries the invitation', b.invite, JSON.stringify(b));
  ok('B5: ...at the bottom, after "+ See more ideas"', b.last && b.afterMore);
  ok('B5: zero JS errors', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

// --- narrow widths (Display Zoom is where wrapping bites)
for (const w of [360, 320]) {
  const { ctx, pg, errs } = await page({ w });
  await pg.goto('http://localhost:8987/trending', { waitUntil: 'networkidle' });
  await pg.waitForTimeout(900);
  await openTrendIdeas(pg);
  const b = await pg.evaluate(readBox('wx_trend0'));
  const scroll = await pg.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok('B: the invitation still shows at ' + w, b.invite, JSON.stringify(b));
  ok('B: nothing in the box overflows at ' + w, b.over.length === 0, JSON.stringify(b.over));
  ok('B: no sideways page scroll at ' + w, scroll <= 0, String(scroll));
  ok('B: zero JS errors at ' + w, errs.length === 0, errs.join(' | '));
  await ctx.close();
}

await browser.close();
srv.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
};
run().catch(e => { console.error(e); process.exit(1); });
