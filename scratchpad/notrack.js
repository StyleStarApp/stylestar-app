// notrack.js — the analytics own-visit switch (2026-08-15).
// Drives the REAL page: /?notrack sets it, ordinary visits stay private,
// /?track undoes it, and an ?r= restore token in the same URL survives.
// Run: NODE_PATH=/opt/node22/lib/node_modules node scratchpad/notrack.js
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT = '/home/user/stylestar-app';
const srv = http.createServer((rq, rs) => {
  let p = rq.url.split('?')[0]; if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!fs.existsSync(f)) { rs.writeHead(404); return rs.end(); }
  rs.writeHead(200, { 'Content-Type': p.endsWith('.json') ? 'application/json' : 'text/html' });
  rs.end(fs.readFileSync(f));
});
(async () => {
  const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
  await new Promise(r => srv.listen(8099, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  let pass = 0, fail = 0;
  const ok = (n, c, x) => { c ? pass++ : fail++; console.log((c ? '  OK   ' : '  FAIL ') + n + (c ? '' : ' — ' + x)); };
  // One context throughout = one browser, the way her phone behaves.
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  let hits = []; await pg.route('**plausible.io/**', r => { hits.push(r.request().url()); r.abort(); });

  console.log('1. NORMAL VISIT (before she opts out)');
  await pg.goto('http://localhost:8099/'); await pg.waitForTimeout(700);
  ok('counted: script loads', hits.length > 0);
  ok('no banner shown', await pg.evaluate(() => !document.getElementById('ssTrackNote')));

  console.log('2. SHE VISITS /?notrack ON HER PHONE');
  hits = []; await pg.goto('http://localhost:8099/?notrack'); await pg.waitForTimeout(800);
  ok('plausible script NOT loaded', hits.length === 0, hits.join(','));
  ok('flag stored in this browser', await pg.evaluate(() => localStorage.getItem('plausible_ignore') === 'true'));
  const note = await pg.evaluate(() => { const d = document.getElementById('ssTrackNote'); return d ? d.textContent : null; });
  ok('she sees a confirmation', !!note && /private now/.test(note), String(note));
  ok('switch removed from the address bar', await pg.evaluate(() => !/notrack/.test(location.search)),
     await pg.evaluate(() => location.href));
  ok('banner is readable size + on screen', await pg.evaluate(() => {
    const r = document.getElementById('ssTrackNote').getBoundingClientRect();
    return r.width > 120 && r.left >= 0 && r.right <= innerWidth;
  }));

  console.log('3. NORMAL VISITS AFTERWARDS STAY PRIVATE');
  hits = []; await pg.goto('http://localhost:8099/'); await pg.waitForTimeout(700);
  ok('still not loaded, no address needed', hits.length === 0);
  ok('track() is a no-op', await pg.evaluate(() => {
    const before = (window.plausible.q || []).length; window.track('X', { a: 1 });
    return (window.plausible.q || []).length === before;
  }));
  ok('no banner on an ordinary visit', await pg.evaluate(() => !document.getElementById('ssTrackNote')));
  ok('app still works', await pg.evaluate(() => !!document.querySelector('.scr')));

  console.log('4. /?track PUTS IT BACK');
  hits = []; await pg.goto('http://localhost:8099/?track'); await pg.waitForTimeout(800);
  ok('counted again: script loads', hits.length > 0);
  ok('flag cleared', await pg.evaluate(() => localStorage.getItem('plausible_ignore') === null));
  ok('confirmation says counted again', await pg.evaluate(() => {
    const d = document.getElementById('ssTrackNote'); return !!d && /counted/.test(d.textContent);
  }));

  console.log('5. A RESTORE LINK IN THE SAME URL SURVIVES');
  await pg.goto('http://localhost:8099/?r=tok123&notrack'); await pg.waitForTimeout(700);
  ok('?r= token preserved for the boot path', await pg.evaluate(() => /r=tok123/.test(location.search)),
     await pg.evaluate(() => location.href));
  ok('notrack still stripped', await pg.evaluate(() => !/notrack/.test(location.search)));

  console.log('6. FIVE TAPS ON THE LOGO — the door that works INSIDE the installed app');
  // Where she really is: no address bar, flag currently cleared by step 4/5's
  // ?r= visit leaving notrack set — so normalise to counted first.
  await pg.goto('http://localhost:8099/?track'); await pg.waitForTimeout(800);
  await pg.goto('http://localhost:8099/'); await pg.waitForTimeout(2600); // entrance curtain
  const tap = async () => {
    // Re-query every time: a tap navigates home, so the mark she tapped may
    // no longer be the visible one.
    await pg.locator('.go-home').locator('visible=true').first().click({ timeout: 4000 });
    await pg.waitForTimeout(120);
  };
  await tap();
  ok('one tap does NOT trip the switch', await pg.evaluate(() => localStorage.getItem('plausible_ignore') === null));
  ok('one tap still goes home', await pg.evaluate(() => {
    const s = document.querySelector('.scr.on, .scr.active') || [...document.querySelectorAll('.scr')].find(x => x.offsetParent);
    return !!s && /^s-(wb|wel)$/.test(s.id);
  }), await pg.evaluate(() => ([...document.querySelectorAll('.scr')].find(x => x.offsetParent) || {}).id));
  for (let i = 0; i < 4; i++) await tap();
  ok('five taps set the private flag', await pg.evaluate(() => localStorage.getItem('plausible_ignore') === 'true'));
  ok('it takes effect immediately, no reload', await pg.evaluate(() => {
    const before = (window.plausible.q || []).length; window.track('X', { a: 1 });
    return window.__ssNoTrack === true && (window.plausible.q || []).length === before;
  }));
  ok('she sees the same confirmation', await pg.evaluate(() => {
    const d = document.getElementById('ssTrackNote'); return !!d && /private now/.test(d.textContent);
  }));
  hits = []; await pg.goto('http://localhost:8099/'); await pg.waitForTimeout(700);
  ok('and it sticks: next open loads no script', hits.length === 0, hits.join(','));

  console.log('7. FIVE MORE TAPS UNDO IT');
  await pg.waitForTimeout(2000);
  for (let i = 0; i < 5; i++) await tap();
  ok('flag cleared again', await pg.evaluate(() => localStorage.getItem('plausible_ignore') === null));
  ok('confirmation says counted again', await pg.evaluate(() => {
    const d = document.getElementById('ssTrackNote'); return !!d && /counted/.test(d.textContent);
  }));

  ok('zero JS errors across all of it', errs.length === 0, errs.join(' | '));
  await b.close(); srv.close();
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})();
