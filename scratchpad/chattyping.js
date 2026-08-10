// Her live findings on Ask your Stylist, 2026-08-10:
//  1. with the keyboard open the fixed Menu chip rode up into the status bar
//     and then popped back -> it now stands down while the KEYBOARD is on screen
//  2. the "Done" button under the input read as "done typing" -> removed
//     (it ran chatDone(), which was byte-identical to chatBack())
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

for (const w of [390, 360]) {
  const page = await browser.newPage({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => localStorage.setItem('ss_data', JSON.stringify({ userName: 'Cath', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => { try { openChat(); } catch (e) {} });
  await page.waitForTimeout(800);
  console.log(`\n--- Ask your Stylist @ ${w} ---`);

  const chipVis = () => page.evaluate(() => {
    const c = document.getElementById('menuChip');
    return getComputedStyle(c).display !== 'none' && c.getBoundingClientRect().width > 0;
  });

  // ⚠️ openChat() AUTOFOCUSES the field, so the chip must still be showing here.
  // A focus-based rule hid it on arrival -- that was the first version and it
  // failed exactly this check.
  ok(await chipVis(), 'chip is visible on arrival, even though the field is autofocused');
  ok(await page.evaluate(() => document.activeElement.id === 'chatInput'), 'the field really is autofocused (the trap)');

  // she can type with no keyboard on screen, and the chip stays put
  await page.type('#chatInput', 'what shoes go with a navy dress');
  await page.waitForTimeout(150);
  const typed = await page.evaluate(() => document.getElementById('chatInput').value);
  ok(typed === 'what shoes go with a navy dress', 'typing works normally');

  // now simulate the KEYBOARD: the visual viewport shrinks under the layout one
  const kbHidden = await page.evaluate(async () => {
    const vv = window.visualViewport;
    const realH = vv.height;
    Object.defineProperty(vv, 'height', { configurable: true, get: () => realH - 320 });
    vv.dispatchEvent(new Event('resize'));
    await new Promise(r => setTimeout(r, 200));
    const c = document.getElementById('menuChip');
    const hidden = getComputedStyle(c).display === 'none';
    const flag = document.body.classList.contains('kb-open');
    return { hidden, flag };
  });
  ok(kbHidden.flag, 'the keyboard is detected from the visual viewport');
  ok(kbHidden.hidden, 'chip stands down while the keyboard covers the screen');

  // keyboard dismissed
  const kbBack = await page.evaluate(async () => {
    const vv = window.visualViewport;
    delete vv.height;
    vv.dispatchEvent(new Event('resize'));
    await new Promise(r => setTimeout(r, 200));
    const c = document.getElementById('menuChip');
    return { shown: getComputedStyle(c).display !== 'none', flag: document.body.classList.contains('kb-open') };
  });
  ok(!kbBack.flag, 'the flag clears when the keyboard goes');
  ok(kbBack.shown, 'chip comes straight back');

  // a small viewport nudge (a collapsing URL bar) must NOT be read as a keyboard
  const smallNudge = await page.evaluate(async () => {
    const vv = window.visualViewport;
    const realH = vv.height;
    Object.defineProperty(vv, 'height', { configurable: true, get: () => realH - 60 });
    vv.dispatchEvent(new Event('resize'));
    await new Promise(r => setTimeout(r, 200));
    const flag = document.body.classList.contains('kb-open');
    delete vv.height; vv.dispatchEvent(new Event('resize'));
    await new Promise(r => setTimeout(r, 150));
    return flag;
  });
  ok(!smallNudge, 'a 60px viewport nudge (URL bar) is NOT mistaken for a keyboard');

  // ---- the Done button is gone, and an exit still exists ----
  const d = await page.evaluate(() => {
    const chat = document.getElementById('s-chat');
    const txt = [...chat.querySelectorAll('button')].map(b => b.textContent.trim());
    const back = chat.querySelector('.chat-close');
    const send = chat.querySelector('.chat-send');
    return {
      hasDone: txt.some(t => t === 'Done'),
      backText: back ? back.textContent.trim() : null,
      backVisible: back ? back.getBoundingClientRect().width > 0 : false,
      sendVisible: send ? send.getBoundingClientRect().width > 0 : false,
      buttons: txt,
    };
  });
  ok(!d.hasDone, `no "Done" button under the input any more (${d.buttons.filter(Boolean).join(' / ') || 'none'})`);
  ok(d.backVisible && /Back/.test(d.backText), `"${d.backText}" is still the way out`);
  ok(d.sendVisible, 'the send arrow is still there and is now the only control under the field');
  ok(await page.evaluate(() => typeof window.chatDone === 'undefined'), 'the dead chatDone() function is gone too');

  // Back still leaves the chat
  const left = await page.evaluate(async () => {
    document.querySelector('#s-chat .chat-close').click();
    await new Promise(r => setTimeout(r, 400));
    return (document.querySelector('.scr.act') || {}).id;
  });
  ok(left !== 's-chat', `Back still exits the chat (landed on ${left})`);

  ok(errs.length === 0, `zero JS errors (${errs.slice(0, 2).join(' | ')})`);
  await page.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close(); server.close();
process.exit(fail ? 1 : 0);
