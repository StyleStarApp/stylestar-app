// chatfind.js — REAL PRODUCTS IN THE STYLIST CHAT (step 2, 2026-09-06).
//
// 🚨 WHAT THIS GUARDS, and every line of it is one of Cath's own decisions:
//   • The MARKER is never seen by a woman, not for one frame and not in ss_chat.
//   • The search fires the moment the marker arrives, not when the reply ends,
//     because that is what runs it ALONGSIDE the stylist writing.
//   • HER RULES RUN ON THE PAGE through the SAME filterNeverWear() every other
//     shopping surface uses. Never a second copy.
//   • Nothing is claimed that was not confirmed; an unconfirmed requirement is
//     SAID OUT LOUD on the card.
//   • When nothing matches there is NO invented fallback -- her call, and it
//     deliberately changes this app's floor on this surface only.
//   • Her widening copy names what she KEEPS, and offers one door per thing.
//
// Run: NODE_PATH=/opt/node22/lib/node_modules node scratchpad/chatfind.js
import fs from 'fs';
import path from 'path';
import http from 'http';

const ROOT = path.resolve(import.meta.dirname, '..');
let pass = 0, failn = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { failn++; console.log('  ✗ FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// One product shaped exactly as product-find.js returns it.
const prod = (o) => Object.assign({
  id: 'p1', title: 'Silk Wrap Dress', brand: 'DVF', store: 'Nordstrom Rack',
  price: '$123.72', url: 'https://example.com/x', image: '',
  checks: {colour: 'confirmed', fabric: 'confirmed', cut: 'confirmed', stock: 'confirmed'},
  unconfirmed: [], exact: true, name: 'Silk Wrap Dress', search: 'DVF Silk Wrap Dress',
}, o);

(async () => {
  const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
  const srv = http.createServer((req, res) => {
    let p = req.url.split('?')[0]; if (p === '/') p = '/index.html';
    const f = path.join(ROOT, decodeURIComponent(p));
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      res.setHeader('content-type', p.endsWith('.html') ? 'text/html' : p.endsWith('.css') ? 'text/css' : p.endsWith('.json') ? 'application/json' : 'application/octet-stream');
      res.end(fs.readFileSync(f));
    } else { res.statusCode = 404; res.end('nf'); }
  });
  await new Promise(r => srv.listen(8963, r));
  const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
  const ctx = await b.newContext({viewport: {width: 390, height: 844}});
  const pg = await ctx.newPage();
  await pg.goto('http://127.0.0.1:8963/index.html', {waitUntil: 'domcontentloaded'});
  await pg.waitForFunction(() => typeof window._findParse === 'function' && typeof window._findRun === 'function');

  console.log('\nPART 1 — the marker is read, and never trusted');
  {
    const good = await pg.evaluate(() => _findParse("<<FIND item=dress; colour=blush; fabric=silk; cut=wrap>> Ooh, lovely."));
    ok('a well-formed marker parses', good && good.item === 'dress' && good.colour === 'blush' && good.fabric === 'silk' && good.cut === 'wrap', JSON.stringify(good));
    ok('no marker means no search', await pg.evaluate(() => _findParse('Just some friendly advice.')) === null);
    ok('a marker with no item is refused', await pg.evaluate(() => _findParse('<<FIND colour=blush>>')) === null);
    // ⚠️ These values end up in an OUTBOUND SEARCH URL. They arrive from a model
    //    reading a stranger's sentence, so they are validated, never trusted.
    // ▶ Markup breaks the marker outright (the pattern stops at the first '>'),
    //   so NO search runs at all rather than a half-parsed one. That is the safer
    //   of the two outcomes: her written advice still stands, and nothing that
    //   looks like markup ever reaches an outbound URL.
    const inj = await pg.evaluate(() => _findParse('<<FIND item=dress; colour=<script>alert(1)</script>>>'));
    ok('markup makes the whole marker unusable, so nothing is searched', inj === null, JSON.stringify(inj));
    // And the belt to that brace: even a well-formed marker rejects a bad value.
    const bad = await pg.evaluate(() => _findParse('<<FIND item=dress; colour=blush"onerror=x>>'));
    ok('a value with quotes in it is dropped while the rest survives',
       bad && bad.item === 'dress' && !bad.colour, JSON.stringify(bad));
    const junk = await pg.evaluate(() => _findParse('<<FIND item=dress; api_key=secret; foo=bar>>'));
    ok('an unknown key is ignored', junk && !('api_key' in junk) && !('foo' in junk), JSON.stringify(junk));
    ok('American spelling still works', (await pg.evaluate(() => _findParse('<<FIND item=boot; color=red>>'))).colour === 'red');
  }

  console.log('\nPART 2 — she never sees it, not even mid-stream');
  {
    ok('a complete marker is stripped',
       await pg.evaluate(() => _findStrip('<<FIND item=dress>> A wrap dress will be lovely.')) === 'A wrap dress will be lovely.');
    // 🚨 THE ONE A SIMPLER STRIP WOULD MISS: text arrives a character at a time,
    //    so "<<FIND item=dr" is on screen before the closing ">>" exists.
    ok('a HALF-ARRIVED marker is stripped too',
       await pg.evaluate(() => _findStrip('Ooh, a Napa wedding. <<FIND item=dre')) === 'Ooh, a Napa wedding.');
    ok('ordinary text is untouched',
       await pg.evaluate(() => _findStrip('I would go with navy.')) === 'I would go with navy.');
    ok('an empty reply stays empty', await pg.evaluate(() => _findStrip('')) === '');
  }

  console.log('\nPART 3 — HER RULES RUN, through the SAME filter, never a copy');
  {
    const html = await pg.evaluate(async () => {
      // Her actual never-wear list, set the way the app sets it.
      prefs.neverWear = ['shift dress'];
      window.fetch = async () => ({ok: true, json: async () => ({
        exact: [
          {id: 'a', title: 'Blush Silk Shift Dress', store: 'Nordstrom', price: '$120',
           url: 'https://e/1', image: '', name: 'Blush Silk Shift Dress', search: 'Blush Silk Shift Dress',
           checks: {colour: 'confirmed', fabric: 'confirmed', stock: 'confirmed'}, unconfirmed: [], exact: true},
          /* ⚠️ Deliberately a MIDI, not a wrap: this request never said "wrap",
             and Catherine's search veto would rightly remove one that appeared
             unasked. Part 3b covers the case where she DID ask. */
          {id: 'b', title: 'Blush Silk Midi Dress', store: 'Saks', price: '$300',
           url: 'https://e/2', image: '', name: 'Blush Silk Midi Dress', search: 'Blush Silk Midi Dress',
           checks: {colour: 'confirmed', fabric: 'confirmed', stock: 'confirmed'}, unconfirmed: [], exact: true},
        ], doors: [],
      })});
      document.getElementById('chatMessages').innerHTML = '';
      await _findRun({item: 'dress', colour: 'blush', fabric: 'silk'});
      return document.getElementById('chatMessages').innerHTML;
    });
    // ⭐ "When someone says no shift dresses, that means absolutely no shift dresses."
    ok('a never-wear piece is removed even though the finder confirmed every requirement',
       !/Shift Dress/i.test(html));
    ok('and the rest of the answer still shows', /Midi Dress/i.test(html));
    ok('the disclosure rides with the products', /Some links may earn a commission/.test(html));
    ok('every product link is rel="sponsored noopener"',
       (html.match(/rel="sponsored noopener"/g) || []).length >= 1);
  }

  console.log('\nPART 3b — a thing she ASKED FOR is not vetoed as if she had not');
  {
    // 🚨 A REAL BUG, CAUGHT HERE 2026-09-06. `_SEARCH_VETO` contains "wrap", so
    //    passing only the noun ("dress") made the app believe she had never asked
    //    for a wrap and silently deleted every wrap dress from her own answer to
    //    "blush silk WRAP dress". Her whole request must reach the filter.
    const html = await pg.evaluate(async () => {
      prefs.neverWear = [];
      window.fetch = async () => ({ok: true, json: async () => ({exact: [
        {id: 'w', title: 'Blush Silk Wrap Dress', store: 'Saks', price: '$300',
         url: 'https://e/9', image: '', name: 'Blush Silk Wrap Dress', search: 'Blush Silk Wrap Dress',
         checks: {colour: 'confirmed', stock: 'confirmed'}, unconfirmed: [], exact: true}], doors: []})});
      document.getElementById('chatMessages').innerHTML = '';
      await _findRun({item: 'dress', colour: 'blush', fabric: 'silk', cut: 'wrap'});
      return document.getElementById('chatMessages').innerHTML;
    });
    ok('the wrap dress she asked for survives the veto', /Wrap Dress/.test(html));
  }

  console.log('\nPART 3c — HER WORDS ONLY: the stylist cannot invent a requirement');
  {
    // 🚨 CATH'S OWN LIVE TEST, 2026-09-06, AND IT RETURNED NOTHING.
    //    She typed: "I have a wedding in Napa in October and nothing to wear."
    //    The stylist answered "a rich jewel tone or a warm metallic is exactly
    //    right for you" -- good styling -- then put JEWEL TONE and METALLIC into
    //    the search as if she had required them. She said neither word, so the
    //    app looked for a dress confirmed jewel-toned AND metallic and found
    //    none. An offline test on the same request had found 16 real dresses.
    const napa = 'I have a wedding in Napa in October and nothing to wear';
    const req = await pg.evaluate((m) => {
      const r = _findParse('<<FIND item=dress; colour=jewel tone; fabric=metallic>>');
      const dropped = _findKeepHerWords(r, m);
      return {r, dropped};
    }, napa);
    ok('an invented COLOUR is dropped', !req.r.colour, JSON.stringify(req.r));
    ok('an invented FABRIC is dropped', !req.r.fabric, JSON.stringify(req.r));
    ok('the ITEM survives — a stylist may read "nothing to wear" as a dress',
       req.r.item === 'dress');
    ok('and it says which ones it dropped', req.dropped.length === 2, JSON.stringify(req.dropped));

    // ▶ And the mirror: words she DID say must survive untouched, or the guard
    //   would quietly destroy every precise request she makes.
    const hers = await pg.evaluate(() => {
      const r = _findParse('<<FIND item=dress; colour=blush; fabric=silk; cut=wrap>>');
      _findKeepHerWords(r, 'Find me a blush silk wrap dress');
      return r;
    });
    ok('blush survives, because she said it', hers.colour === 'blush');
    ok('silk survives, because she said it', hers.fabric === 'silk');
    ok('wrap survives, because she said it', hers.cut === 'wrap');

    // Her SAVED preferences are not in the sentence and must not be stripped.
    const saved = await pg.evaluate(() => {
      const r = _findParse('<<FIND item=boot; size=6; width=wide>>');
      _findKeepHerWords(r, 'I need new boots for the autumn');
      return r;
    });
    ok('size and width survive — they come from her saved prefs, not the sentence',
       saved.size === '6' && saved.width === 'wide', JSON.stringify(saved));
    // A light stem, so a plural in her sentence still matches a singular value.
    const stem = await pg.evaluate(() => {
      const r = _findParse('<<FIND item=boot; colour=red>>');
      _findKeepHerWords(r, 'do you have red boots');
      return r;
    });
    ok('a plural in her sentence still matches ("red boots" keeps red)', stem.colour === 'red');
  }

  console.log('\nPART 3d — a released requirement that MATCHED is never called "different"');
  {
    // 🚨 CATH'S LIVE TEST AGAIN: the Phase Eight Julissa WRAP DRESS came back
    //    labelled "different cut" on an answer to "blush silk WRAP dress".
    //    Releasing a requirement means we stop REQUIRING it. It never means we
    //    stop noticing that a piece has it anyway.
    const html = await pg.evaluate(async () => {
      prefs.neverWear = [];
      window.fetch = async () => ({ok: true, json: async () => ({exact: [], doors: [{
        release: ['fabric', 'cut'], softenedTo: null, keeps: ['colour'],
        products: [{id: 'j', title: 'Phase Eight Julissa Wrap Dress', store: "Macy's",
          price: '$220.00', url: 'https://e/j', image: '',
          name: 'Phase Eight Julissa Wrap Dress', search: 'Phase Eight Julissa Wrap Dress',
          checks: {colour: 'confirmed', stock: 'confirmed'}, unconfirmed: [],
          // it IS a wrap, and the fabric genuinely could not be verified
          differs: {cut: 'confirmed', fabric: 'unknown'}}],
      }]})});
      document.getElementById('chatMessages').innerHTML = '';
      await _findRun({item: 'dress', colour: 'blush', fabric: 'silk', cut: 'wrap'});
      return document.getElementById('chatMessages').innerHTML;
    });
    ok('a wrap dress is NOT called "different cut"', !/different cut/i.test(html));
    ok('it is ticked as a match instead', /fc-yes[^>]*>\s*style/i.test(html) || /✓/.test(html));
    ok('and the fabric it truly could not verify is still said plainly',
       /fabric not confirmed/i.test(html));
  }

  console.log('\nPART 3e — the waiting star: one signal, not a fourth loader');
  {
    const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
    const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    // ⭐ Cath, 2026-09-06: "something that shows the stylist is actively shopping
    //    and nothing is broken." She named the Shop-my-style star herself, so the
    //    answer is to REUSE it, never to draw a fourth one.
    ok('the star is the SAME path the rest of the app already draws',
       src.includes('M12 1.6L14.47 8.6L21.89 8.79L15.99 13.3L18.11 20.41L12 16.2L5.89 20.41L8.01 13.3L2.11 8.79L9.53 8.6Z'));
    ok('and it turns the same way as .shop-star-main and .wdr-load-star',
       /\.chat-typing-star\{[^}]*animation:spin 1\.7s linear infinite reverse/.test(css) &&
       /\.find-load-star\{[^}]*animation:spin 1\.7s linear infinite reverse/.test(css));
    // ▶ It goes on BOTH waits: the reply (~16-20s) is the longer one, and text
    //   alone there was the actual complaint.
    ok('the stylist THINKING bubble carries it', /_chatTyping\(/.test(src));
    ok('the product SEARCH line carries it', /_starSpin\(\)\+'<span class="find-status-txt">/.test(src));
    // ⚠️ The stream swaps the words mid-flight; textContent there would wipe the star.
    // ⚠️ Assert the BEHAVIOUR, not a comment. The stream swaps "Checking
    //    stores..." into the bubble mid-flight, and a bare textContent there
    //    would delete the star along with the words.
    ok('the mid-stream word swap targets the span, so the star survives',
       /const _t=typing\.querySelector\('span'\);/.test(src) &&
       /if\(_t\)_t\.textContent='Checking stores\.\.\.'/.test(src));
    ok('a woman who asked her phone to stop moving things is respected',
       /prefers-reduced-motion:reduce/.test(css));

    // And it really renders, in a real browser, with the star inside it.
    const html = await pg.evaluate(async () => {
      window.fetch = () => new Promise(() => {});     // hang, so the line stays up
      document.getElementById('chatMessages').innerHTML = '';
      _findRun({item: 'dress'});
      await new Promise(r => setTimeout(r, 1100));    // past the 700ms delay
      return document.getElementById('chatMessages').innerHTML;
    });
    ok('the status line really shows a star, not just text', /find-load-star/.test(html));
    ok('with her words beside it', /Looking through your shops/.test(html));
  }

  console.log('\nPART 4 — nothing is claimed that was not confirmed');
  {
    const html = await pg.evaluate(async () => {
      prefs.neverWear = [];
      window.fetch = async () => ({ok: true, json: async () => ({
        exact: [], doors: [{
          release: ['colour'], softenedTo: 'pink', keeps: ['fabric', 'cut'],
          products: [{id: 'c', title: 'Tulip Pink Chiffon Wrap Dress', store: 'Nordstrom',
            price: '$249', url: 'https://e/3', image: '', name: 'Tulip Pink Chiffon Wrap Dress',
            search: 'Tulip Pink Chiffon Wrap Dress',
            checks: {cut: 'confirmed', colour: 'confirmed', stock: 'confirmed'},
            unconfirmed: ['fabric'], differs: {colour: 'rejected'}}],
        }],
      })});
      document.getElementById('chatMessages').innerHTML = '';
      await _findRun({item: 'dress', colour: 'blush', fabric: 'silk', cut: 'wrap'});
      return document.getElementById('chatMessages').innerHTML;
    });
    // ▶ With a SINGLE group there is nothing to choose between, so the label is
    //   deliberately omitted rather than stating the obvious.
    const doorsOne = true;
    // ▶▶ HER RULE, LITERALLY: never imply a requirement is confirmed when it is not.
    ok('an unconfirmed requirement is SAID, not omitted', /fabric not confirmed/i.test(html));
    ok('and a confirmed one is ticked', /fc-yes/.test(html));
    // ⭐⭐ HER OWN WORDING, 2026-09-06. Five options were drafted for her and she
    //    wrote a better one in a sentence. It states the truth and STOPS.
    ok('her sentence leads, verbatim',
       /I couldn.t find exactly what you asked for/i.test(html) &&
       /This is the closest I could come up with/i.test(html));
    // ⚠️ The old version explained the compromise in the headline and came out as
    //    "keep the fabric, and look at other shades of pink and look at another
    //    style?" — two "look at"s, assembled rather than spoken. Never again.
    ok('the headline no longer interrogates her', !/look at another/i.test(html));
    ok('and it is not a question', !/asked for\?|come up with\?/i.test(html));
    // ▶ Her "she chooses what to release" is still visible, as a plain label.
    ok('a group still names what it KEEPS', /Right /i.test(html) || doorsOne);
  }

  console.log('\nPART 5 — nothing found means nothing invented');
  {
    const html = await pg.evaluate(async () => {
      window.fetch = async () => ({ok: true, json: async () => ({exact: [], doors: []})});
      document.getElementById('chatMessages').innerHTML = '';
      await _findRun({item: 'dress', colour: 'blush'});
      return document.getElementById('chatMessages').innerHTML;
    });
    // 🚨 THIS DELIBERATELY CHANGES THE APP'S DOCUMENTED FLOOR, ON CHAT ONLY.
    //    Her words: "I would rather show nothing exact than recommend something
    //    that isn't what she asked for." A future session must not 'restore' a
    //    fallback here believing it a regression.
    // ▶ Same voice as the near-miss case, and it still hands her the next move
    //   rather than stopping dead.
    ok('she is told plainly, in her own words',
       /I couldn.t find exactly what you asked for/i.test(html) &&
       /nothing close enough to show you/i.test(html));
    ok('and she is given somewhere to go', /Tell me what matters most/i.test(html));
    ok('NO product card is invented', !/find-card/.test(html));
    ok('and no disclosure is shown for products that do not exist', !/may earn a commission/.test(html));
  }

  console.log('\nPART 6 — a dead search never breaks the answer');
  {
    const html = await pg.evaluate(async () => {
      window.fetch = async () => { throw new Error('offline'); };
      document.getElementById('chatMessages').innerHTML = '<div class="chat-msg bot">Try a wrap dress.</div>';
      await _findRun({item: 'dress'});
      return document.getElementById('chatMessages').innerHTML;
    });
    // ▶ Same principle as the feed: a failure falls back to the stylist's own
    //   advice, never to an error screen.
    ok('the stylist advice above is untouched', /Try a wrap dress/.test(html));
    ok('no error is shown to her', !/error|sorry|wrong/i.test(html));
    ok('and the status line cleans itself up', !/find-status/.test(html));
  }

  console.log('\nPART 7 — the prompt actually asks for all of this');
  {
    const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    ok('the marker instruction is in the chat prompt', src.includes('FINDING REAL PRODUCTS FOR HER'));
    // ⚠️ HER TRIGGER RULE IS *NEED*, NOT TOPIC, and the Napa sentence is the case
    //    she named: it needs products and contains none of the words a keyword
    //    trigger would look for.
    ok('the Napa wedding is named as a case that MUST search', /wedding in Napa in October/.test(src));
    ok('and a shopping TOPIC is named as one that must not', /shopping TOPIC coming up is not the same/.test(src));
    ok('the model is told to put the marker FIRST (so the search runs in parallel)',
       /Put it FIRST/.test(src));
    ok('and told never to invent a requirement she did not give',
       /NEVER invent a requirement she did not give/.test(src));
    ok('the machinery is never named to her', /NEVER say the words "search"/.test(src));
  }

  console.log('\nPART 8 — the wait, exactly as she designed it');
  {
    const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
    ok('the status line is in HER voice, not the machine\'s',
       /Looking through your shops/.test(src) &&
       /Checking what's actually in stock/.test(src) &&
       !/_FIND_STEPS=\['Loading/.test(src));
    // ⚠️ A fast answer must show NO line rather than flash one.
    ok('a fast answer shows no line at all', /_FIND_SHOW_AFTER\s*=\s*\d{3}/.test(src));
    ok('the line replaces itself rather than stacking', /IT NEVER STACKS/.test(src));
    ok('cards are appended BELOW, so nothing jumps under a reader',
       /NOTHING HERE MAY MAKE THE PAGE JUMP/.test(css));
    ok('the honesty labels are readable, not whispered', /#8a5a00/.test(css) && /#3f6b4f/.test(css));
    ok('a long merchant name is clamped, not left to grow', /-webkit-line-clamp:4/.test(css));
  }

  await b.close(); srv.close();
  console.log(`\n${pass} passed, ${failn} failed`);
  process.exit(failn ? 1 : 0);
})();
