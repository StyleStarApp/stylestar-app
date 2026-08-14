// startqguard.js — regression guard for the July-reported startQ() restart
// scramble (leave the quiz at question 5, restart, screen shows q1 but
// answers write to answers[4] and Continue jumps to q6). The 2026-08-14
// verification found the bug NOT reproducible — startQ() resets cur=0 and
// _quizRestore() only moves it with a FRESH (<30 min) autosave, in which case
// the screen and the write slot move TOGETHER. This suite pins the invariant
// that actually matters: the QUESTION ON SCREEN and the ANSWER SLOT WRITTEN
// can never disagree, on any restart path.
// Run: node scratchpad/startqguard.js
import http from 'http'; import fs from 'fs'; import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
const ROOT = path.resolve(import.meta.dirname, '..');
const srv = http.createServer((req, res) => { try { res.end(fs.readFileSync(path.join(ROOT, req.url === '/' ? 'index.html' : req.url.split('?')[0]))) } catch (e) { res.statusCode = 404; res.end() } }).listen(8946);

let pass = 0, fail = 0;
const ok = (n, c, x) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ FAIL ' + n + (x ? ' — ' + x : '')); } };
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
const errs = [];
async function fresh() {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}});
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push(e.message));
  await pg.route('**/.netlify/**', r => r.fulfill({status: 500, body: '{}'}));
  await pg.goto('http://localhost:8946/');
  await pg.waitForTimeout(2600);
  return {ctx, pg};
}
// The invariant probe: what question does the screen show, and which slot
// would the slider write? (updHint writes answers[cur] — cur IS the slot.)
const probe = pg => pg.evaluate(() => ({
  shown: document.getElementById('pl').textContent, // "N of 12"
  slot: cur,
  next: document.getElementById('nb').textContent
}));

console.log('startqguard — the leave-and-restart paths');

// 1. Fresh visitor: answer to question 5, exit via the Menu's goHome, restart
let {ctx, pg} = await fresh();
await pg.evaluate(() => { startQ(); });
await pg.waitForTimeout(300);
// walk to question 5 with distinct answers
await pg.evaluate(() => { for (let i = 0; i < 4; i++) { document.getElementById('sl').value = 9; updHint(9, cur); nextQ(); } });
let st = await probe(pg);
ok('at question 5 before leaving', /5 of 12/.test(st.shown) && st.slot === 4, JSON.stringify(st));
await pg.evaluate(() => goHome());
await pg.waitForTimeout(300);
await pg.evaluate(() => startQ());
await pg.waitForTimeout(300);
st = await probe(pg);
ok('restart shows the SAME question it will write (screen == slot)', parseInt(st.shown) === st.slot + 1, JSON.stringify(st));
ok('fresh autosave resumes at question 5, not a silent q1-writing-slot-5', /5 of 12/.test(st.shown) && st.slot === 4, JSON.stringify(st));
// the answer commits in nextQ(): answers[cur] takes the slider value, so
// the slot written is exactly the question shown
await pg.evaluate(() => { document.getElementById('sl').value = 11; nextQ(); });
let ans = await pg.evaluate(() => answers.slice(0, 6));
ok('Continue writes answers[4] while "5 of 12" was shown', ans[4] === 11, JSON.stringify(ans));
st = await probe(pg);
ok('Continue goes 5 → 6, no jump', /6 of 12/.test(st.shown) && st.slot === 5, JSON.stringify(st));
await ctx.close();

// 2. STALE autosave (>30 min): restart really starts over at question 1,
//    writing answers[0] — the exact July repro, now impossible
({ctx, pg} = await fresh());
await pg.evaluate(() => {
  const save = {a: [9, 9, 9, 9, 6, 6, 6, 6, 6, 6, 6, 6], c: 4, t: Date.now() - 31 * 60 * 1000};
  localStorage.setItem('ss_quiz', JSON.stringify(save));
  startQ();
});
await pg.waitForTimeout(300);
st = await probe(pg);
ok('stale save: restart begins at question 1', /1 of 12/.test(st.shown) && st.slot === 0, JSON.stringify(st));
await pg.evaluate(() => { document.getElementById('sl').value = 2; nextQ(); });
ans = await pg.evaluate(() => ({a0: answers[0], a4: answers[4]}));
ok('stale save: Continue writes answers[0], never answers[4]', ans.a0 === 2 && ans.a4 === 6, JSON.stringify(ans));
await ctx.close();

// 3. Returning user retake via the Menu: same invariant
({ctx, pg} = await fresh());
await pg.evaluate(() => {
  localStorage.setItem('ss_data', JSON.stringify({userName: 'T', answers: new Array(12).fill(7), topArchNames: ['The Timeless Classic'], portrait: 'p', motto: 'm'}));
});
await pg.reload(); await pg.waitForTimeout(2600);
await pg.evaluate(() => menuQuiz());
await pg.waitForTimeout(300);
st = await probe(pg);
ok('retake starts at question 1 writing slot 0', /1 of 12/.test(st.shown) && st.slot === 0, JSON.stringify(st));
await ctx.close();

ok('zero JS errors', errs.length === 0, errs.slice(0, 2).join('|'));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
