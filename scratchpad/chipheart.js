// Her two calls, 2026-08-10:
//  1. the Menu chip now shows on Ask your Stylist (it was the last screen with
//     no route to the rest of the app)
//  2. ONE tilted pink heart trailing the "My Story" title
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0].slice(1)));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

let pass = 0, fail = 0;
const ok = (c, m) => { c ? (pass++, console.log('  ok  ' + m)) : (fail++, console.log('  FAIL ' + m)); };

for (const w of [430, 390, 375, 360, 320]) {
  const page = await browser.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);

  // ---------- 1. the chip on Ask your Stylist ----------
  console.log(`\n--- Menu chip on Ask your Stylist @ ${w} ---`);
  await page.evaluate(() => { try { openChat(); } catch (e) {} });
  await page.waitForTimeout(800);
  const c = await page.evaluate(() => {
    const chip = document.getElementById('menuChip');
    const cs = getComputedStyle(chip);
    const rect = e => { const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
    const hit = (a, b) => !(a.r <= b.l || a.l >= b.r || a.b <= b.t || a.t >= b.b);
    const cb = rect(chip);
    const parts = {};
    for (const [k, sel] of [['star', '#s-chat .chat-hdr-star'], ['title', '#s-chat .chat-hdr-title'],
                            ['sub', '#s-chat .chat-hdr-sub'], ['back', '#s-chat .chat-close'],
                            ['input', '#s-chat .chat-input, #s-chat input[type=text], #s-chat textarea']]) {
      const el = document.querySelector(sel);
      parts[k] = el ? hit(cb, rect(el)) : null;
    }
    return {
      onChat: (document.querySelector('.scr.act') || {}).id === 's-chat',
      visible: cs.display !== 'none' && cb.w > 0,
      label: chip.textContent.trim(),
      tapW: Math.round(cb.w), tapH: Math.round(cb.h),
      overlaps: parts,
      docW: document.documentElement.scrollWidth, winW: window.innerWidth,
    };
  });
  ok(c.onChat, 'we are really on the chat screen');
  ok(c.visible, 'the Menu chip is shown here now');
  ok(c.label === 'Menu', `still labelled in WORDS ("${c.label}"), not a bare icon`);
  ok(c.tapW >= 44 && c.tapH >= 32, `tap target is finger-sized (${c.tapW}x${c.tapH})`);
  for (const [k, v] of Object.entries(c.overlaps)) {
    if (v === null) continue;
    ok(v === false, `does not cover the chat's ${k}`);
  }
  ok(c.docW <= c.winW, 'no sideways page scroll');

  // it must actually open the drawer, and leave the chat when she picks a row
  const works = await page.evaluate(async () => {
    document.getElementById('menuChip').click();
    await new Promise(r => setTimeout(r, 350));
    const open = document.body.classList.contains('menu-open');
    const rowsVisible = [...document.querySelectorAll('.menu-row')].filter(r => r.getBoundingClientRect().width > 0).length;
    menuClose();
    await new Promise(r => setTimeout(r, 350));
    return { open, rowsVisible, closed: !document.body.classList.contains('menu-open'),
             stillChat: (document.querySelector('.scr.act') || {}).id === 's-chat' };
  });
  ok(works.open, 'tapping it opens the drawer from inside the chat');
  ok(works.rowsVisible > 10, `the whole map is reachable (${works.rowsVisible} rows)`);
  ok(works.closed && works.stillChat, 'closing it leaves her in the chat where she was');

  // ---------- 2. the heart on My Story ----------
  console.log(`\n--- My Story heart @ ${w} ---`);
  await page.evaluate(() => showStory());
  await page.waitForTimeout(500);
  const h = await page.evaluate(() => {
    const t = document.querySelector('#s-story .story-title');
    const hs = t.querySelectorAll('svg.st-ch');
    const el = hs[0];
    if (!el) return { n: 0 };
    const cs = getComputedStyle(el);
    const tr = t.parentElement.getBoundingClientRect(), er = el.getBoundingClientRect();
    const menuCh = document.querySelector('.menu-ch');
    const mcs = menuCh ? getComputedStyle(menuCh) : null;
    // is it AFTER the words?
    const rg = document.createRange(); rg.setStart(t.firstChild, 0); rg.setEnd(t.firstChild, t.firstChild.textContent.length);
    const words = rg.getBoundingClientRect();
    const card = document.querySelector('.ss').getBoundingClientRect();
    const sig = document.querySelector('#s-story .story-sig svg.pinkheart');
    return {
      n: hs.length,
      fill: cs.fill, transform: cs.transform,
      w: Math.round(er.width),
      trailing: er.left >= words.right - 1,
      sameLine: Math.abs(er.top - words.top) < 22,
      titleLines: [...new Set([...rg.getClientRects()].map(r => Math.round(r.top)))].length,
      wordsOffCentre: +(((words.left + words.right) / 2) - ((tr.left + tr.right) / 2)).toFixed(2),
      heartGap: Math.round(er.left - words.right),
      insideCard: er.left > card.left && er.right < card.right,
      menuChFill: mcs ? mcs.fill : null,
      sigHeartStillThere: !!sig,
      titleText: t.textContent.trim(),
      docW: document.documentElement.scrollWidth, winW: window.innerWidth,
    };
  });
  ok(h.n === 1, `exactly ONE heart, not flanking (${h.n})`);
  ok(h.fill === 'rgb(244, 154, 193)', `her signature pink #F49AC1 (${h.fill})`);
  ok(h.fill === h.menuChFill, 'the same pink as the Menu row that marks this page hers');
  ok(h.transform !== 'none', 'it is tilted');
  ok(h.trailing, 'it trails the words, like the Menu row and her sign-off');
  // ⚠️ HER CATCH: the WORDS must centre on their own, with the heart hanging off
  // as an add-on. Measure the painted words against the container, never the
  // title box (which includes the heart and so centres the pair, not the words).
  ok(Math.abs(h.wordsOffCentre) <= 1.5, `the WORDS "My Story" are centred (off by ${h.wordsOffCentre}px)`);
  ok(h.heartGap <= 7, `heart sits close to the words (${h.heartGap}px)`);
  ok(h.sameLine, 'it sits on the title line, not below it');
  ok(h.titleLines === 1, `"My Story" still holds one line (${h.titleLines})`);
  ok(h.insideCard, 'inside the card');
  ok(h.sigHeartStillThere, 'her "With love, Catherine" heart is untouched');
  ok(h.titleText === 'My Story', 'the title text is unchanged');
  ok(h.docW <= h.winW, 'no sideways page scroll');

  // the FAQ / legal pages share .story-title and must NOT get a heart
  const others = await page.evaluate(async () => {
    const out = {};
    for (const [k, fn] of [['faq', showFAQ], ['privacy', showPrivacy], ['terms', showTerms]]) {
      fn(); await new Promise(r => setTimeout(r, 250));
      const t = document.querySelector('.scr.act .story-title');
      out[k] = t ? t.querySelectorAll('svg.st-ch').length : -1;
    }
    return out;
  });
  for (const [k, n] of Object.entries(others)) ok(n === 0, `${k} shares .story-title and correctly has NO heart (${n})`);
  ok(errs.length === 0, `zero JS errors (${errs.slice(0, 2).join(' | ')})`);

  if (w === 390) {
    await page.evaluate(() => showStory());
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'ch-story.png'), clip: { x: 0, y: 0, width: w, height: 430 } });
    await page.evaluate(() => { try { openChat(); } catch (e) {} });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'ch-chat.png'), clip: { x: 0, y: 0, width: w, height: 430 } });
  }
  await page.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close(); server.close();
process.exit(fail ? 1 : 0);
