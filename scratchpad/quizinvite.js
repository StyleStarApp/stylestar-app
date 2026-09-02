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
// Wording A, HER pick from three rendered options (2026-09-01), with HER
// 2026-09-02 tail edit. ⚠️ UPDATED DELIBERATELY, not silenced: the old
// assertion pinned "for picks made just for you" and correctly failed on her
// change. SUIT is a stylist's own word and the truer claim -- the app chooses
// picks that suit her, it does not make them for her.
ok('A: her chosen wording, verbatim',
   JSCODE.includes("I don\\'t know your style yet, so these are a general mix.")
   && JSCODE.includes('for picks that suit you best.'));
// ⚠️ SCOPED TO THE INVITE, not the whole file: the COLOUR hint legitimately
// still reads "for picks made just for you" and she did not ask for that to
// change. A file-wide check failed on correct code (harness bug, 2026-09-02).
ok('A: the retired tail cannot creep back INTO THE INVITE',
   !/function _wdrQuizInvite\(\)\{[\s\S]{0,400}?picks made just for you/.test(JSCODE));
ok('A: the tappable half opens the quiz',
   /<span onclick="startQ\(\)">Take the free style quiz/.test(JSCODE));
// ⚠️ Her 2026-09-02 asks, in the source. The star must be the CHAT header's
// star, not a lookalike: same polygon points, same #EC4899. If the chat star
// is ever restyled this fails, which is the whole point.
{
  const chat = /class="chat-hdr-star"[\s\S]{0,300}?points="([^"]+)"[\s\S]{0,120}?fill="(#[0-9A-Fa-f]{6})"/.exec(RAW);
  const qi   = /var _QI_STAR=[\s\S]{0,400}?points="([^"]+)"[\s\S]{0,120}?fill="(#[0-9A-Fa-f]{6})"/.exec(RAW);
  ok('A: the invitation carries a star at all', !!qi);
  ok('A: ...and it is the STYLIST star, byte-identical to the chat header',
     !!chat && !!qi && chat[1] === qi[1] && chat[2] === qi[2],
     chat && qi ? chat[2] + ' vs ' + qi[2] : 'not found');
  ok('A: ...pink #EC4899, the stylist mark (never the gold star)',
     !!qi && qi[2].toUpperCase() === '#EC4899', qi ? qi[2] : '');
}
ok('A: the star LEADS the sentence, before the words',
   /return '<div class="wdr-colorhint wdr-qi">'\+_QI_STAR\+'I don/.test(JSCODE));
// ⚠️ _WDR_ARR ITSELF, never a second copy of its path -- the house arrow
// cannot drift, only its layout is overridden in CSS.
ok('A: the arrow is _WDR_ARR itself, inside the tappable span',
   /Take the free style quiz'\+_WDR_ARR\+'<\/span>/.test(JSCODE));
ok('A: the star and arrow hang off .wdr-qi, so the colour hint keeps neither',
   /class="wdr-colorhint wdr-qi"/.test(JSCODE)
   && !/wdr-qi[\s\S]{0,200}Refine your Preferences/.test(JSCODE));
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

// ⚠️ EVERY #s-wardrobe rule owes a #s-trending twin, or the invitation renders
// unstyled on /trending -- the star at default SVG size and the arrow as a
// block. Written as a DUPLICATED selector, never :is(), so an unsupported
// selector cannot invalidate the whole rule.
{
  const CSS = fs.readFileSync(ROOT + '/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const cls of ['.wdr-qi-star', '.wdr-qi span', '.wdr-qi .wdr-see-ar']) {
    const w = CSS.includes('#s-wardrobe ' + cls + '{') || CSS.includes('#s-wardrobe ' + cls + ',');
    const t = CSS.includes('#s-trending ' + cls + '{') || CSS.includes('#s-trending ' + cls + ',');
    ok('A: ' + cls + ' is twinned for #s-trending', w && t, 'wardrobe=' + w + ' trending=' + t);
  }
  ok('A: the underline really is declared on the tappable half',
     /#s-trending \.wdr-qi span\{[^}]*text-decoration:underline/.test(CSS));
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
    // Her 2026-09-02 edits, measured as PAINTED, never as source. A star that
    // renders at default SVG size, or an arrow still display:block, passes
    // every source check and looks wrong on her phone.
    star: (() => { if (!inv) return null; const st = inv.querySelector('.wdr-qi-star');
      if (!st) return null; const r = st.getBoundingClientRect();
      const poly = st.querySelector('polygon');
      return { w: +r.width.toFixed(1), h: +r.height.toFixed(1),
               fill: poly ? getComputedStyle(poly).fill : '',
               // leads the line: nothing painted to its left inside the box
               first: inv.firstElementChild === st,
               disp: getComputedStyle(st).display }; })(),
    arrow: (() => { if (!inv) return null; const sp = inv.querySelector('span');
      const a = sp && sp.querySelector('.wdr-see-ar'); if (!a) return null;
      const r = a.getBoundingClientRect();
      // ⚠️ MEASURE AGAINST THE SPAN'S LAST LINE BOX, never its bounding rect:
      // an inline span that wraps reports its FIRST line's top, so a perfectly
      // placed arrow read as "wrong line" and failed on correct code
      // (harness bug, 2026-09-02 -- the documented rect-per-element trap).
      const boxes = [...sp.getClientRects()];
      const last = boxes[boxes.length - 1];
      return { w: +r.width.toFixed(1), h: +r.height.toFixed(1),
               disp: getComputedStyle(a).display,
               lineBoxes: boxes.length,
               stroke: getComputedStyle(a).stroke,
               sameLine: Math.abs(r.top - last.top) < 12,
               // ⚠️ MEASURE AGAINST THE WORDS, NOT THE SPAN'S BOX. The link is
               // display:block now, so its box spans the full 280px container
               // while its centred text does not -- comparing to the box read
               // "arrow not at the end" on a correct render (harness bug,
               // 2026-09-02, the second sighting of this family today).
               atEnd: (() => { const tn = [...sp.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim());
                 if (!tn.length) return false;
                 const rg = document.createRange(); rg.selectNodeContents(tn[tn.length - 1]);
                 const wr = [...rg.getClientRects()].filter(x => x.width > 1);
                 if (!wr.length) return false;
                 const words = wr[wr.length - 1];
                 return r.left >= words.right - 1 && Math.abs(r.top - words.top) < 12; })() }; })(),
    underline: inv && inv.querySelector('span')
      ? getComputedStyle(inv.querySelector('span')).textDecorationLine : '',
    // Walk every text node OUTSIDE the link and assert none of its painted
    // rects sits on the link's line. Catches crowding from EITHER side --
    // a trailing "for" after it, or a rebalanced "mix." in front of it.
    linkAlone: (() => { if (!inv) return null; const sp = inv.querySelector('span');
      if (!sp) return null; const boxes = [...sp.getClientRects()];
      if (!boxes.length) return null;
      const tops = boxes.map(b => b.top);
      const wk = document.createTreeWalker(inv, NodeFilter.SHOW_TEXT); let n;
      while ((n = wk.nextNode())) {
        if (sp.contains(n) || !n.textContent.trim()) continue;
        const r = document.createRange(); r.selectNodeContents(n);
        for (const rr of r.getClientRects()) {
          if (rr.width > 1 && tops.some(t => Math.abs(rr.top - t) < 8)) return false;
        } }
      return true; })(),
    // The colour hint must gain NEITHER mark.
    hintStar: hints.filter(h => /Refine your Preferences/.test(h.textContent))
                   .some(h => h.querySelector('.wdr-qi-star') || h.querySelector('.wdr-see-ar')),
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
     && /picks that suit you best/.test(b.text), b.text);
  ok('B1: the quiz half is tappable', b.span);
  // ▶ HER 2026-09-02 EDITS, measured as PAINTED on the real card.
  ok('B1: the stylist star is painted, leading the line', !!b.star && b.star.first,
     JSON.stringify(b.star));
  ok('B1: ...at a real size, not the SVG default',
     !!b.star && b.star.w > 9 && b.star.w < 20 && Math.abs(b.star.w - b.star.h) < 1.5,
     JSON.stringify(b.star));
  ok('B1: ...in the stylist pink, inline with the words',
     !!b.star && /236,\s*72,\s*153/.test(b.star.fill) && b.star.disp === 'inline-block',
     JSON.stringify(b.star));
  ok('B1: the tappable half is UNDERLINED (her ask)',
     /underline/.test(b.underline), b.underline);
  ok('B1: the arrow is painted INSIDE the link, on its last line, at the end',
     !!b.arrow && b.arrow.sameLine && b.arrow.atEnd, JSON.stringify(b.arrow));
  // ▶ THE LINK MUST NOT BREAK ACROSS LINES. It already did before her edit
  // (measured: "Take the free style / quiz" at 390 and 360), and plain
  // coloured text got away with it -- an UNDERLINED link split in two, with
  // the arrow stranded on the second half, reads as two things and works
  // directly against the affordance she asked for. white-space:nowrap holds
  // it whole; measured 167px inside a 280px box, so it can never overflow.
  ok('B1: the whole link stays on ONE line, arrow included',
     !!b.arrow && b.arrow.lineBoxes === 1, 'line boxes=' + (b.arrow && b.arrow.lineBoxes));
  // ▶ HER SECOND LOOK, 2026-09-02: "put the word for down on the bottom line
  // with picks that suit you best so the button is all on one line". The link
  // is display:block, so it OWNS its line -- no word of the sentence may share
  // it from either side.
  // ⚠️ A <br> after the link was tried first and REJECTED BY THE RENDER: it
  // moved "for" but text-wrap:balance then rebalanced the lead and pushed
  // "mix." up onto the link's line, which is the same crowding one word over.
  // Only display:block isolates it from BOTH sides.
  ok('B1: the link OWNS its line, nothing shares it', !!b.linkAlone, JSON.stringify(b.linkAlone));
  ok('B1: ...laid out inline, not as the chip\'s block arrow',
     !!b.arrow && b.arrow.disp === 'inline-block' && b.arrow.w > 8 && b.arrow.w < 18,
     JSON.stringify(b.arrow));
  ok('B1: ...and it takes the link\'s own ink, so the two can never diverge',
     !!b.arrow && b.arrow.stroke === b.linkInk,
     b.arrow ? b.arrow.stroke + ' vs ' + b.linkInk : 'none');
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
  // ⚠️ The Refine hint must stay a BARE whisper. The star is the stylist's
  // mark and the arrow is a call to action; Refine is neither, and two
  // decorated whispers would read as two asks in a row.
  ok('B4: the colour hint gains NEITHER the star nor the arrow',
     b.hintStar === false, 'hintStar=' + b.hintStar);
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
  // The three marks must survive Display Zoom, where wrapping bites hardest.
  ok('B: the star is still painted at ' + w, !!b.star && b.star.w > 9, JSON.stringify(b.star));
  ok('B: the link is still underlined at ' + w, /underline/.test(b.underline), b.underline);
  ok('B: the link still holds ONE line at ' + w,
     !!b.arrow && b.arrow.lineBoxes === 1 && b.arrow.atEnd,
     JSON.stringify(b.arrow));
  ok('B: the link still OWNS its line at ' + w, !!b.linkAlone, JSON.stringify(b.linkAlone));
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
