// Contact page — full verification (2026-08-17).
// Drives the REAL index.html in real Chromium, and serves it through a server
// that applies the REAL netlify.toml rewrite rules, so a typo in the toml fails
// the suite rather than shipping.
// ⚠️ Absolute path, not a bare specifier: playwright is never a project
// dependency, so `from 'playwright'` throws before the suite loads. See the
// note in a2page.js, where the same fault had been silently disabling 58 checks.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const PORT = 8901;
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

// --- parse the real netlify.toml so the routes are tested, not assumed ---
const toml = fs.readFileSync('netlify.toml', 'utf8');
const REWRITES = [...toml.matchAll(/\[\[redirects\]\][\s\S]*?from\s*=\s*"([^"]+)"[\s\S]*?to\s*=\s*"([^"]+)"[\s\S]*?status\s*=\s*(\d+)/g)]
  .map(m => ({ from: m[1], to: m[2], status: +m[3] }));

const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png',
  '.jpg':'image/jpeg', '.json':'application/json', '.svg':'image/svg+xml', '.ico':'image/x-icon' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  const rw = REWRITES.find(r => r.from === p.replace(/\/+$/, '') || r.from === p);
  if (rw && rw.status === 200) p = rw.to;
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('nope'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

let pass = 0, fail = 0;
const ok = (c, label, extra='') => { if (c) { pass++; } else { fail++; console.log('  ✗ ' + label + (extra ? '  [' + extra + ']' : '')); } };

const settle = async (page) => {
  await page.waitForTimeout(2400);
  await page.evaluate(() => { const c = document.querySelector('.hm-entrance'); if (c) c.remove(); });
  try { await page.evaluate(() => document.fonts.ready); } catch {}
  await page.waitForTimeout(250);
};

const run = async () => {
  await new Promise(r => server.listen(PORT, r));
  const browser = await chromium.launch({ executablePath: CHROME });
  const base = `http://localhost:${PORT}`;

  // ---------- PART 1: the route ----------
  console.log('\nPart 1 — the /contact route');
  {
    const raw = await fetch(`${base}/contact`).then(r => r.text());
    ok(raw.includes('it all reaches me'), 'raw served HTML carries the lead (a reviewer bot runs no JS)');
    ok(raw.includes('Style Star by Catherine, LLC'), 'raw served HTML names the legal entity');
    // ⚠️ A computed font-family returns the DECLARED stack, not the painted face,
    // so it cannot catch a webfont that never loaded. What it CAN catch is the
    // font URL being trimmed — the Lora italic-only trap, 2026-08-13.
    ok(/Dancing\+Script/.test(raw), 'the font URL still loads Dancing Script for her signature');
    ok(raw.includes('partners@stylestar.app'), 'raw served HTML carries partners@');
    ok(/from\s*=\s*"\/contact"/.test(toml), 'netlify.toml declares the /contact rewrite');
  }
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(`${base}/contact`);
    await settle(page);
    const st = await page.evaluate(() => {
      const el = document.getElementById('s-contact');
      return { act: el.classList.contains('act'), visible: el.getBoundingClientRect().height > 200, path: location.pathname };
    });
    ok(st.act, 'deep link activates s-contact');
    ok(st.visible, 'the screen actually renders', 'height');
    ok(st.path === '/contact', 'address bar keeps /contact', st.path);
    ok(errs.length === 0, 'zero JS errors on the deep link', errs[0] || '');
    await page.close();
  }

  // ---------- PART 2: content, voice, links ----------
  console.log('Part 2 — content and voice');
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(`${base}/index.html`);
  await settle(page);
  await page.evaluate(() => showContact());
  await page.waitForTimeout(350);

  const c = await page.evaluate(() => {
    const q = s => document.querySelector(s);
    const cs = el => el ? getComputedStyle(el) : null;
    const lead = q('#s-contact .cc-lead'), sign = q('#s-contact .cc-sign');
    const links = [...document.querySelectorAll('#s-contact .cc-a')];
    const cards = [...document.querySelectorAll('#s-contact .cc-card')];
    const ls = cs(lead), ss = cs(sign);
    return {
      title: q('#s-contact .story-title')?.textContent.trim(),
      lead: lead?.textContent.trim(),
      sign: sign?.textContent.trim(),
      leadFont: ls && { f: ls.fontFamily, size: ls.fontSize, style: ls.fontStyle, color: ls.color },
      signFont: ss && { f: ss.fontFamily, size: ss.fontSize, style: ss.fontStyle, color: ss.color },
      cards: cards.length,
      heads: cards.map(x => x.querySelector('.cc-h')?.textContent.trim()),
      hrefs: links.map(a => a.getAttribute('href')),
      texts: links.map(a => a.textContent.trim()),
      whys: cards.map(x => x.querySelector('.cc-w')?.textContent.trim()),
      name: document.querySelector('#s-contact .cc-name')?.textContent.trim(),
      nameRaw: document.querySelector('#s-contact .cc-name')?.firstChild?.textContent,
      heart: (() => { const h = document.querySelector('#s-contact .cc-name .pinkheart'); if (!h) return null;
        const st = getComputedStyle(h); return { fill: st.fill, transform: st.transform }; })(),
      cardBorder: getComputedStyle(document.querySelector('#s-contact .cc-card')).borderTopColor,
      nameFont: (() => { const n = document.querySelector('#s-contact .cc-name'); if (!n) return null;
        const st = getComputedStyle(n); return { f: st.fontFamily, size: st.fontSize }; })(),
      llc: document.querySelector('#s-contact .cc-llc')?.textContent.trim(),
      pill: (() => { const a = document.querySelector('#s-contact .cc-a'); const st = getComputedStyle(a);
        return { bg: st.backgroundColor, color: st.color, radius: st.borderTopLeftRadius, deco: st.textDecorationLine }; })(),
      frame: (() => { const ss = document.querySelector('.ss'); if (!ss) return null; const st = getComputedStyle(ss);
        return { mirror: ss.classList.contains('contact-mirror'), borderWidth: st.borderTopWidth, borderColor: st.borderTopColor }; })(),
      tap: links.map(a => { const r = a.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; }),
    };
  });

  ok(c.title === 'Contact', 'title reads "Contact"', c.title);
  ok(c.lead === "I’d love to hear from you. Whether it’s a style question, an idea for Style Star, something you need help with, or just a hello, it all reaches me.", 'her lead, word for word', c.lead);
  ok(c.sign === 'I read every message myself.', 'her closing line, word for word', c.sign);
  ok(c.cards === 2, 'two cards, one per audience', String(c.cards));
  ok(c.heads[0] === 'Style Questions & Help' && c.heads[1] === 'Brands & Partners', 'both card headings, matched case', c.heads.join(' | '));
  // Her catch: the lead INVITES, the cards ROUTE. Card 1 used to restate the
  // lead's invitation; both cards now answer "which address is mine?".
  ok(c.whys[0] === 'Style Star, shopping, or your own style', 'card 1 line (hers, no Questions repeat)', c.whys[0]);
  ok(!/questions/i.test(c.whys[0]), 'card 1 line does not repeat its own heading', c.whys[0]);
  ok(c.whys[1] === 'Retailers, brand partnerships, affiliate opportunities & press', 'card 2 names affiliate opportunities for reviewers', c.whys[1]);
  ok(!/results|saved details|the app itself/i.test(c.whys[0]), 'card 1 does not echo the lead', c.whys[0]);
  ok(c.frame && c.frame.borderWidth === '8px' && c.frame.mirror, 'the page wears the display-case frame, like Privacy and Terms', JSON.stringify(c.frame));
  ok(c.name === 'Catherine', 'the page is signed, so "I" has a name', c.name);
  ok(/Dancing Script/.test(c.nameFont?.f || ''), 'signed in her handwriting, as on My Story', c.nameFont?.f);
  ok(c.heart && c.heart.fill === 'rgb(244, 154, 193)', 'her signature pink heart trails the name', JSON.stringify(c.heart));
  ok(c.heart && /rotate|matrix/.test(c.heart.transform), 'and it is tilted — no heart sits straight', c.heart?.transform);
  // ⚠️ A trailing space in the text node put 6.8px between the name and the
  // heart, invisible in the markup and invisible to a box measurement that
  // includes it. Pin the text node exactly so it cannot creep back.
  ok(c.nameRaw === 'Catherine', 'no trailing space between her name and the heart', JSON.stringify(c.nameRaw));
  ok(c.cardBorder === 'rgb(154, 160, 166)', 'cards wear the frame\'s own silver, not a fourth colour', c.cardBorder);
  ok(c.llc === 'Style Star by Catherine, LLC · Orlando, Florida', 'the legal entity sits in the footnote position', c.llc);
  ok(c.pill.bg === 'rgb(26, 26, 26)', 'the address wears the black lacquer pill', c.pill.bg);
  ok(c.pill.color === 'rgb(242, 216, 137)', 'in the marquee gold, not a bronze that reads as text', c.pill.color);
  ok(c.pill.deco === 'none', 'the pill drops the underline (the pill IS the affordance)', c.pill.deco);
  ok(c.hrefs[0] === 'mailto:hello@stylestar.app', 'hello@ is a real mailto', c.hrefs[0]);
  ok(c.hrefs[1] === 'mailto:partners@stylestar.app', 'partners@ is a real mailto', c.hrefs[1]);
  ok(c.texts[0] === 'hello@stylestar.app' && c.texts[1] === 'partners@stylestar.app', 'addresses shown in full');
  ok(c.tap.every(t => t.h >= 18 && t.w > 100), 'addresses are a real tap target', JSON.stringify(c.tap));

  // her voice rule, 2026-08-13: Lora upright 15.5px #4a463e on light paper
  for (const [name, f] of [['lead', c.leadFont], ['closing', c.signFont]]) {
    ok(/Lora/.test(f.f), `${name} wears Lora`, f.f);
    ok(f.style === 'normal', `${name} is upright, never italic`, f.style);
    ok(f.size === '15.5px', `${name} is 15.5px (her voice spec)`, f.size);
    ok(f.color === 'rgb(74, 70, 62)', `${name} is the readable ink #4a463e`, f.color);
  }

  // ---------- PART 3: contrast against the REAL painted background ----------
  console.log('Part 3 — contrast');
  const contrast = await page.evaluate(() => {
    const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
      return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
    const parse = s => s.match(/\d+/g).slice(0, 3).map(Number);
    const bgOf = el => { let n = el; while (n && n !== document.documentElement) {
        const b = getComputedStyle(n).backgroundColor;
        if (b && !/rgba\(0, 0, 0, 0\)|transparent/.test(b)) return parse(b);
        n = n.parentElement; } return [255, 255, 255]; };
    const ratio = el => { const fg = parse(getComputedStyle(el).color), bg = bgOf(el);
      const a = lum(fg), b = lum(bg); return +(((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(2)); };
    const out = {};
    for (const [k, s] of [['lead', '.cc-lead'], ['head', '.cc-h'], ['why', '.cc-w'], ['addr', '.cc-a'], ['sign', '.cc-sign'], ['name', '.cc-name'], ['llc', '.cc-llc'], ['title', '.story-title']])
      out[k] = ratio(document.querySelector('#s-contact ' + s));
    return out;
  });
  for (const [k, v] of Object.entries(contrast)) ok(v >= 4.5, `${k} clears AA 4.5:1`, `${v}:1`);

  // ---------- PART 4: no overflow at three widths ----------
  console.log('Part 4 — layout at 390 / 360 / 320');
  for (const w of [390, 360, 320]) {
    await page.setViewportSize({ width: w, height: 844 });
    await page.waitForTimeout(220);
    const m = await page.evaluate(() => {
      const el = document.getElementById('s-contact');
      const wide = [...el.querySelectorAll('*')].filter(n => n.getBoundingClientRect().right > document.documentElement.clientWidth + 1).length;
      return { sideScroll: document.documentElement.scrollWidth - document.documentElement.clientWidth, wide };
    });
    ok(m.sideScroll <= 0, `no sideways page scroll at ${w}`, String(m.sideScroll));
    ok(m.wide === 0, `nothing spills past the screen at ${w}`, String(m.wide));
  }
  await page.setViewportSize({ width: 390, height: 844 });

  // ---------- PART 5: the footer, and its self-link omission ----------
  console.log('Part 5 — footer');
  {
    const f = await page.evaluate(() => {
      const onContact = [...document.querySelectorAll('#s-contact [data-std-foot] .lnk')].map(x => x.textContent.trim());
      const onFaq = [...document.querySelectorAll('#s-faq [data-std-foot] .lnk')].map(x => x.textContent.trim());
      return { onContact, onFaq };
    });
    ok(!f.onContact.includes('Contact'), 'Contact page does NOT link to itself', f.onContact.join(','));
    ok(f.onFaq.includes('Contact'), 'other pages DO carry a Contact link', f.onFaq.join(','));
  }
  for (const w of [390, 360, 320]) {
    await page.setViewportSize({ width: w, height: 844 });
    await page.waitForTimeout(200);
    const rows = await page.evaluate(() => {
      const r = document.querySelector('#s-faq [data-std-foot] .sf-row2');
      const tops = new Set([...r.children].map(n => Math.round(n.getBoundingClientRect().top / 4)));
      return { lines: tops.size, right: Math.round(r.getBoundingClientRect().right), vw: document.documentElement.clientWidth };
    });
    ok(rows.right <= rows.vw + 1, `footer information row stays on screen at ${w}`, `${rows.right}>${rows.vw}`);
    if (w >= 360) ok(rows.lines === 1, `footer information row holds ONE line at ${w}`, `${rows.lines} lines`);
  }
  await page.setViewportSize({ width: 390, height: 844 });

  // ---------- PART 6: the Menu row ----------
  console.log('Part 6 — Menu');
  {
    await page.evaluate(() => { show('s-wb'); });
    await page.waitForTimeout(200);
    const order = await page.evaluate(() => {
      menuOpen();
      return [...document.querySelectorAll('.menu-row')].map(r => r.textContent.trim());
    });
    await page.waitForTimeout(250);
    const iF = order.findIndex(t => t === 'FAQ'), iC = order.findIndex(t => t === 'Contact'), iP = order.findIndex(t => t === 'Privacy');
    ok(iC > -1, 'a Contact row exists in the drawer');
    /* ⚠️ STALE ASSERTION, FIXED DELIBERATELY, NOT SILENCED — and it had been
       wrong since 2026-08-19, when "Add as an App" was inserted into the About
       group above Contact. It went unnoticed for days because this suite's bare
       `from 'playwright'` import meant it never loaded at all. Proven
       pre-existing before touching it: it fails identically on a clean
       index.html on this same machine, one variable changed.
       ▶ REWRITTEN AS A RELATIONSHIP RATHER THAN A POSITION. What the 2026-08-17
       decision actually protects is that Contact sits in the reading tail AFTER
       FAQ and BEFORE the Privacy/Terms legal pair — not that it is adjacent to
       FAQ, which was only incidentally true on the day it was written. A test
       that restates an index has to be edited every time a row is added; one
       that states the ordering never does. */
    ok(iC > iF, 'Contact sits after FAQ in the reading tail', `FAQ@${iF} Contact@${iC}`);
    ok(iP > iC, 'Privacy and Terms stay the legal tail, below Contact', `Privacy@${iP}`);
    const oneLine = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('.menu-row')];
      const hs = rows.map(r => r.getBoundingClientRect().height);
      const base = Math.min(...hs);                    // a single-line row
      return rows.filter((r, i) => hs[i] > base + 8).map(r => r.textContent.trim());
    });
    ok(oneLine.length === 0, 'every drawer row still holds one line', oneLine.join(' | '));
    await page.evaluate(() => { const r = [...document.querySelectorAll('.menu-row')].find(x => x.textContent.trim() === 'Contact'); r.click(); });
    await page.waitForTimeout(450);
    const after = await page.evaluate(() => ({
      screen: document.querySelector('.scr.act')?.id,
      drawer: document.body.classList.contains('menu-open'),
    }));
    ok(after.screen === 's-contact', 'the Menu row opens the Contact page', after.screen);
    ok(!after.drawer, 'the drawer closes behind it');
  }

  // ---------- PART 7: Back, and the self-link guard ----------
  console.log('Part 7 — Back');
  {
    await page.evaluate(() => { show('s-wb'); showContact(); });
    await page.waitForTimeout(250);
    await page.evaluate(() => closeContact());
    await page.waitForTimeout(300);
    ok(await page.evaluate(() => document.querySelector('.scr.act')?.id) === 's-wb', 'Back returns to where she came from');
    // self-link guard: opening Contact FROM Contact must not trap her there
    await page.evaluate(() => { show('s-wb'); showContact(); showContact(); });
    await page.waitForTimeout(250);
    await page.evaluate(() => closeContact());
    await page.waitForTimeout(300);
    ok(await page.evaluate(() => document.querySelector('.scr.act')?.id) === 's-wb', 'a Contact-to-Contact tap does not kill Back');
  }

  // ---------- PART 8: the address is a real link on Privacy and Terms ----------
  console.log('Part 8 — the clickable-link fix');
  for (const [screen, fn, want] of [['s-privacy', 'showPrivacy', 3], ['s-terms', 'showTerms', 1]]) {
    await page.evaluate(f => window[f](), fn);
    await page.waitForTimeout(300);
    const r = await page.evaluate(id => {
      const links = [...document.querySelectorAll('#' + id + ' .story-wrap a[href^="mailto:"]')];
      const plain = (document.getElementById(id).innerText.match(/hello@stylestar\.app/g) || []).length;
      return {
        n: links.length,
        hrefs: [...new Set(links.map(a => a.getAttribute('href')))],
        colors: [...new Set(links.map(a => getComputedStyle(a).color))],
        underlined: links.every(a => /underline/.test(getComputedStyle(a).textDecorationLine)),
        plain,
      };
    }, screen);
    ok(r.n === want, `${screen}: ${want} mailto link(s)`, String(r.n));
    ok(r.hrefs.length === 1 && r.hrefs[0] === 'mailto:hello@stylestar.app', `${screen}: correct address`, r.hrefs.join(','));
    ok(r.underlined, `${screen}: links are underlined`);
    ok(!r.colors.some(col => /rgb\(0, 0, 238\)|rgb\(0, 0, 255\)/.test(col)), `${screen}: not browser-default blue`, r.colors.join(','));
    ok(r.plain === r.n, `${screen}: every visible address is inside a link`, `${r.plain} shown / ${r.n} linked`);
  }

  ok(errs.length === 0, 'zero JS errors across the whole run', errs[0] || '');
  await page.close();
  await browser.close();
  server.close();

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
};

run().catch(e => { console.error(e); server.close(); process.exit(1); });
