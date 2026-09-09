// Checks the privacy-copy rewrite (2026-07-29) against the REAL rendered pages.
// The point is not that the strings exist in the file, but that a woman
// actually SEES them and no longer sees the promises we can't keep.
//
//   node scratchpad/copy.js
//
import http from 'http';
import fs from 'fs';
import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PORT = 8901, ORIGIN = 'http://localhost:' + PORT;
const server = http.createServer((req, res) => {
  const p = new URL(req.url, ORIGIN).pathname;
  const f = path.join(ROOT, p === '/' ? 'index.html' : p.replace(/^\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200); res.end(fs.readFileSync(f)); return; }
  res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(fs.readFileSync(path.join(ROOT, 'index.html')));
});
await new Promise(r => server.listen(PORT, r));

let pass = 0, fail = 0;
const ok = (n, c, e) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n + (e ? '  → ' + e : '')); } };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, body: '{"success":true}' }));
await page.goto(ORIGIN + '/', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.showPrivacy === 'function');

// Text a visitor can actually see on the given screen.
async function visibleText(open) {
  await page.evaluate(open);
  await page.waitForTimeout(250);
  return page.evaluate(() => {
    const s = document.querySelector('.scr.act');
    return s ? s.innerText : '';
  });
}

// ---------------------------------------------------------------------------
console.log('\n1. The promises we could not keep are gone from the whole app');
const raw = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
for (const gone of [
  'never stored on our servers',
  'It never touches our servers',
  'No person at Style Star, including me, ever has access',
  'Your details are private (no one sees them)',
  'private (no one reads them)',
  'processed in real time'
]) {
  ok('gone: "' + gone + '"', !raw.includes(gone));
}

// ---------------------------------------------------------------------------
console.log('\n2. Privacy Policy');
let t = await visibleText(() => window.showPrivacy());
ok('names Anthropic as the AI provider', t.includes('Anthropic'));
ok('names Supabase', t.includes('Supabase'));
ok('names MailerLite', t.includes('MailerLite'));
ok('names Netlify', t.includes('Netlify'));
ok('names Plausible', t.includes('Plausible'));
ok('has a "Where your information goes" heading', t.includes('Where your information goes'));
ok('has a California section', /If you live in California/.test(t));
ok('states plainly that we do not sell', /do not sell personal information/i.test(t));
ok('collection list mentions the wardrobe', /Your Wardrobe/.test(t));
ok('collection list mentions the motto', /motto/i.test(t));
ok('says chats pass through but are not kept', /pass through our systems .* not kept/is.test(t));
ok('chat history is described as on her own device', /saved on your own device/.test(t));
ok('deletion covers the email list too', /from our email list/.test(t));
ok('still carries the affiliate disclosure', /affiliate links/i.test(t));
ok('dated today', t.includes('Last updated July 29, 2026'));
ok('no leftover "never sell or share with third parties" absolute', !/never sell or share your personal information with third parties/i.test(t));

// ---------------------------------------------------------------------------
console.log('\n3. Terms');
t = await visibleText(() => window.showTerms());
ok('photo line is honest', /sent to our AI provider to be understood in the moment/.test(t));
ok('says Style Star does not store it', /not stored by Style Star/.test(t));
ok('dated today', t.includes('Last updated July 29, 2026'));

// ---------------------------------------------------------------------------
console.log('\n4. FAQ');
t = await visibleText(() => window.showFAQ());
ok('names Claude and Anthropic', /Claude/.test(t) && /Anthropic/.test(t));
ok('says the data is not used to train it', /not used to train/.test(t));
ok('admits Catherine can reach the database', /I can reach that database/.test(t));
ok('and that she does not browse it', /I don't browse it/.test(t));
ok('photo answer mentions the copy kept on her device', /on your own device/.test(t));
ok('tells her how to clear it', /Start a fresh conversation/.test(t));

// ---------------------------------------------------------------------------
console.log('\n5. The two in-context privacy lines');
const chatLine = await page.evaluate(() => { const e = document.querySelector('.chat-privacy'); return e ? e.textContent : ''; });
ok('chat line says photos go to the AI', /go to our AI stylist/.test(chatLine), chatLine);
ok('chat line says history stays on her device', /stays on your own device/.test(chatLine), chatLine);
// The preferences line is built by renderPrefSizes() at runtime, so it isn't in
// the DOM until that step renders. Render it into a scratch node and read back.
const prefLine = await page.evaluate(() => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  window.renderPrefSizes(host);
  const e = host.querySelector('.pref-private');
  const txt = e ? e.textContent : '(no .pref-private rendered)';
  host.remove();
  return txt;
});
ok('preferences line says kept securely', /kept securely/.test(prefLine), prefLine);
ok('preferences line promises no selling', /never sold or shared with marketers/.test(prefLine), prefLine);
ok('preferences line no longer claims nobody sees them', !/no one sees them/.test(prefLine), prefLine);

// ---------------------------------------------------------------------------
console.log('\n6. Housekeeping');
// A reviewer's bot runs no JS, so the policy has to be in the served HTML.
ok('policy text is in the raw served HTML', raw.includes('Where your information goes'));
ok('no mojibake introduced', !/Ã|â€|Â/.test(raw));
ok('no em dashes in the new copy (house style)', !/Style Star is run by a small number[^<]*—/.test(raw));
// Nothing should overflow the phone at the narrow width Display Zoom users get.
await page.setViewportSize({ width: 360, height: 780 });
await visibleText(() => window.showPrivacy());
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok('no horizontal overflow at 360px', overflow <= 1, 'overflow ' + overflow + 'px');
ok('zero JS errors', errors.length === 0, errors.join(' | '));

/* ⚠️⚠️ THE CARD PHOTO AND THE CHAT FOOTER — her screenshot, 2026-09-09.
   ▶▶ HER WORDS: "I don't like how the photos are cut off here. Can't see top of
     dress or head of the model." MEASURED against 11 real captured thumbnails
     before anything changed: SIX are square, FIVE are portrait (0.77-0.84). The
     frame was a square 150x150 with `cover`, so every portrait photo lost ~20%
     of its height, half off the top -- the missing head, the missing hem.
   🚨🚨 THESE LIVE IN `copy` AND NOT IN `chatfallback`, AND THAT IS THE WHOLE
     LESSON OF THE DAY. They were written into chatfallback first, where they
     read object-fit:fill, height:0 and a 16px arrow -- CSS DEFAULTS, because
     that harness serves index.html from memory and NEVER SERVES styles.css.
     Two of the six then PASSED anyway: "the letterbox matches the card" was
     comparing transparent to transparent. ▶ A CHECK THAT PASSES BECAUSE IT CAN
     SEE NOTHING IS WORSE THAN NO CHECK -- it is the false green this file keeps
     warning about, in its own test suite. `copy` serves the real files off
     disk, so the numbers below are the real painted ones.
   ▶ THEY ASSERT THE RULE, NOT THE NUMBERS. "No product photo is ever cropped"
     is the promise; 170px is one way to keep the bands small and may be tuned.
     `cover` is what must never come back -- it is the entire fault, and it is
     exactly the tidy-looking one-word change a later session would make. */
await page.setViewportSize({ width: 390, height: 844 });
{
  const m = await page.evaluate(() => {
    const d = document.createElement('div');
    d.innerHTML = '<div class="find-cards"><a class="find-card"><img class="fc-img"></a></div>';
    document.body.appendChild(d);
    const im = getComputedStyle(d.querySelector('.fc-img'));
    const card = getComputedStyle(d.querySelector('.find-card'));
    const r = { fit: im.objectFit, h: parseFloat(im.height),
                bg: im.backgroundColor, cardBg: card.backgroundColor };
    d.remove();
    const chat = document.getElementById('s-chat');
    const was = chat ? chat.style.display : null;
    if (chat) chat.style.display = 'block';
    const hh = s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().height : 0; };
    const cf = document.getElementById('chatFresh');
    const cs = cf ? getComputedStyle(cf) : null;
    r.foot = hh('.chat-privacy') + hh('.chat-disclosure') +
      (cf ? cf.getBoundingClientRect().height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom) : 0);
    const sum = document.querySelector('.chat-privacy summary');
    r.arrow = sum ? parseFloat(getComputedStyle(sum, '::after').fontSize) : 0;
    r.words = parseFloat(getComputedStyle(document.querySelector('.chat-privacy')).fontSize);
    const btn = document.querySelector('.chat-fresh');
    r.tap = btn ? btn.getBoundingClientRect().height : 0;
    if (chat) chat.style.display = was;
    return r;
  });
  /* ▶ THE GUARD THAT STOPS THIS SUITE LYING THE WAY THE FIRST ATTEMPT DID:
     if styles.css did not load, every reading below is a browser default and
     every conclusion drawn from it is worthless. Prove the sheet is applied
     BEFORE trusting a single number off it. */
  ok('styles.css is actually applied (else every number below is a default)',
     m.h > 0 && m.fit !== 'fill', 'height=' + m.h + ' fit=' + m.fit);
  ok('NOTHING IS EVER CROPPED OFF A PRODUCT PHOTO', m.fit === 'contain', 'object-fit=' + m.fit);
  ok('the frame is taller than it is wide, so a portrait photo barely bands',
     m.h > 150, 'height=' + m.h);
  /* ▶ The band only disappears if it is the SAME white as the card. A cream
     placeholder here is what would turn `contain` into a visible letterbox. */
  ok('and the letterbox is the same colour as the card, so it cannot be seen',
     m.bg === m.cardBg && m.bg !== 'rgba(0, 0, 0, 0)', m.bg + ' vs ' + m.cardBg);
  /* ▶ Her second ask the same day: "those 3 lines appear to be double spaced.
     Can we make them much tighter." Measured 60.5px before, 50px after. Asserted
     as a CEILING, so tightening further is free and re-inflating it is not. */
  ok('the three chat footer lines stay under 56px', m.foot < 56, 'foot=' + m.foot.toFixed(1) + 'px');
  ok('the Private-to-you arrow is bigger than the words beside it',
     m.arrow > m.words, 'arrow=' + m.arrow + ' words=' + m.words);
  /* ⚠️ A TAP TARGET IS THE FLOOR THAT TIGHTENING MUST NOT CROSS. Her audience
     runs to 80; "save space" must never shrink a button below the thumb. */
  ok('and "Start a fresh conversation" is still a real tap target',
     m.tap >= 16, 'tap=' + m.tap.toFixed(1) + 'px');
}

await browser.close();
server.close();
console.log('\n' + (fail ? '✗ ' + fail + ' FAILED, ' : '✓ ') + pass + ' passed');
process.exit(fail ? 1 : 0);
