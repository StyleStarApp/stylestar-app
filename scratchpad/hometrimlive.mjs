// Drive the REAL trimmed homepage in a real browser (2026-09-01).
//
// The edge-function suite proves the right BYTES ship. This one proves the
// app still works when they do: every screen trimmed off `/` has to come
// back, with its real content, the moment she taps toward it.
//
// ⚠️ SERVES .css AS text/css. Chromium REFUSES a stylesheet with a wrong MIME
// type and silently renders an UNSTYLED page -- the failure that had 34
// harnesses measuring nothing after the CSS moved out of index.html on
// 2026-09-01. No Content-Type at all is fine (Chromium sniffs); a WRONG one
// is not.
// ⚠️ `/index.html` is served UNTRIMMED on purpose: it is the file
// _selfHealScreens() fetches. Trimming it here would fake a passing test.
import fs from 'fs';
import http from 'http';
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import handler from '/home/user/stylestar-app/netlify/edge-functions/page-titles.js';
const { chromium } = pw;

const ROOT = '/home/user/stylestar-app';
const RAW = fs.readFileSync(ROOT + '/index.html', 'utf8');
const TYPES = { '.css': 'text/css', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain' };

async function edge(path) {
  const ctx = { next: async () => new Response(RAW, { headers: { 'content-type': 'text/html; charset=utf-8' } }) };
  return await (await handler(new Request('https://stylestar.app' + path), ctx)).text();
}

let pass = 0, fail = 0;
const ok = (n, c, x) => { c ? (pass++, console.log('  ✓ ' + n))
                            : (fail++, console.log('  ✗ ' + n + (x ? '  → ' + x : ''))); };

const srv = http.createServer(async (req, res) => {
  const p = req.url.split('?')[0];
  if (p === '/index.html') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(RAW); }
  const ext = p.slice(p.lastIndexOf('.'));
  if (TYPES[ext] && fs.existsSync(ROOT + p)) {
    res.writeHead(200, { 'content-type': TYPES[ext] }); return res.end(fs.readFileSync(ROOT + p));
  }
  try {
    const html = await edge(p === '/' ? '/' : p.replace(/\/+$/, ''));
    res.writeHead(200, { 'content-type': 'text/html' }); res.end(html);
  } catch (e) { res.writeHead(404); res.end('no'); }
});

const run = async () => {
await new Promise(r => srv.listen(8996, r));
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
// Off-origin (Google Fonts, retail CDNs) is unreachable from this sandbox and
// would hang the load; abort it so every onerror fires immediately.
await ctx.route('**/*', r => (new URL(r.request().url()).host === 'localhost:8996') ? r.continue() : r.abort());
const pg = await ctx.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e)));

await pg.goto('http://localhost:8996/', { waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(400);

console.log('\n── boot on the trimmed homepage ──');
const TRIMMED = ['s-faq','s-privacy','s-terms','s-story','s-contact','s-journal-hub','s-journal'];
// The BYTES are what a crawler reads, so assert on the bytes -- not on the
// DOM, which self-heal has already repaired by the time anything is measured.
const servedHome = await (await fetch('http://localhost:8996/')).text();
TRIMMED.forEach(id => ok('absent from the SERVED bytes: ' + id,
  !new RegExp('<div class="scr[^"]*" id="' + id + '"').test(servedHome)));
ok('the served page is stamped data-ss-trimmed', /<body data-ss-trimmed="1">/.test(servedHome));
const boot = await pg.evaluate(() => ({
  act: [...document.querySelectorAll('.scr.act')].map(s => s.id),
  present: [...document.querySelectorAll('.scr')].map(s => s.id),
}));
ok('exactly ONE screen is active at boot', boot.act.length === 1, boot.act.join(','));
ok('a fresh visitor lands on the welcome screen', boot.act[0] === 's-wel', boot.act[0]);
// ▶ AND THE POINT OF THE WHOLE DESIGN: she never waits for any of this. The
// background heal at boot has already put every trimmed screen back before
// she can tap anything, and none of them arrived active (the 2026-08-29 bug
// where a merged s-wel stacked a second full screen under the real one).
TRIMMED.forEach(id => ok('healed back in the background, before any tap: ' + id, boot.present.includes(id)));

console.log('\n── every trimmed screen heals with REAL content ──');
const cases = [
  ['showFAQ()',        's-faq',         'Frequently Asked Questions'],
  ['showPrivacy()',    's-privacy',     'Privacy Policy'],
  ['showTerms()',      's-terms',       'Terms of Service'],
  ['showContact()',    's-contact',     'Contact'],
  ['showStory()',      's-story',       'My Story'],
  ['openJournalHub()', 's-journal-hub', 'Style Journal'],
];
for (const [call, id, needle] of cases) {
  await pg.evaluate(c => eval(c), call);
  await pg.waitForFunction(i => !!document.getElementById(i), id, { timeout: 8000 }).catch(() => {});
  await pg.waitForTimeout(250);
  const r = await pg.evaluate(i => {
    const el = document.getElementById(i);
    const act = [...document.querySelectorAll('.scr.act')].map(s => s.id);
    const foot = el && el.querySelector('[data-std-foot]');
    return { exists: !!el, act, words: el ? (el.innerText || '').trim().split(/\s+/).length : 0,
             text: el ? (el.innerText || '').slice(0, 90) : '', footLinks: foot ? foot.querySelectorAll('a,span[onclick]').length : -1 };
  }, id);
  ok(call + ' → ' + id + ' exists after heal', r.exists);
  ok(call + ' → it is the ONLY active screen', r.act.length === 1 && r.act[0] === id, r.act.join(','));
  ok(call + ' → it has real content', r.words > 12, r.words + ' words: ' + r.text.replace(/\n/g, ' '));
  ok(call + ' → its heading is right', r.text.includes(needle), r.text.replace(/\n/g, ' '));
  // The 2026-08-29 regression: healed screens came back with EMPTY footers.
  ok(call + ' → its footer is filled', r.footLinks > 2, 'links: ' + r.footLinks);
}

console.log('\n── the two runtime-filled screens (the bugs this trim would have caused) ──');
await pg.evaluate(() => openJournalHub());
await pg.waitForTimeout(300);
const hub = await pg.evaluate(() => {
  const l = document.getElementById('journalHubList');
  const a = l && l.querySelector('a.jhub-row');
  return { rows: l ? l.children.length : -1, isAnchor: !!a, href: a ? a.getAttribute('href') : null,
           title: a ? a.innerText.trim() : null,
           deco: a ? getComputedStyle(a).textDecorationLine : null };
});
ok('the healed hub actually LISTS the article (not an empty page)', hub.rows === 1, 'rows: ' + hub.rows);
ok('the row is a real anchor', hub.isAnchor);
ok('with the right href', hub.href === '/journal/how-to-find-your-personal-style', hub.href);
ok('showing the article title', (hub.title || '').includes('How to Find Your Personal Style'), hub.title);
ok('NOT rendering as a default blue underlined link', hub.deco === 'none', hub.deco);

await pg.evaluate(() => { goHome(); });
await pg.waitForTimeout(200);
await pg.evaluate(() => showStory());
await pg.waitForTimeout(300);
const story = await pg.evaluate(() => {
  const q = document.getElementById('storyQuiz');
  return { exists: !!q, disp: q ? q.style.display : null, act: [...document.querySelectorAll('.scr.act')].map(s => s.id) };
});
ok('My Story healed and #storyQuiz exists', story.exists);
ok('#storyQuiz shows the quiz CTA when she came from the home page', story.disp === 'block', story.disp);

console.log('\n── tapping the healed link opens the article ──');
await pg.evaluate(() => openJournalHub());
await pg.waitForTimeout(250);
await pg.click('a.jhub-row');
await pg.waitForTimeout(600);
const art = await pg.evaluate(() => {
  const act = [...document.querySelectorAll('.scr.act')].map(s => s.id);
  const el = document.getElementById('s-journal');
  return { act, path: location.pathname, byline: el ? (el.innerText || '').includes('By Catherine Ellspermann') : false };
});
ok('the article screen is the only one showing', art.act.length === 1 && art.act[0] === 's-journal', art.act.join(','));
ok('the tap stayed in-app (no full page load to a raw url)', art.path === '/journal/how-to-find-your-personal-style', art.path);
ok('the byline is on the article', art.byline);

ok('ZERO JavaScript errors through all of it', errs.length === 0, errs.slice(0, 3).join(' | '));

await browser.close(); srv.close();
console.log('\n' + (fail ? '✗ ' : '✓ ') + pass + ' passed, ' + fail + ' failed\n');
process.exit(fail ? 1 : 0);
};
run();
