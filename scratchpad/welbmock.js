// Renders the REAL Welcome Back screen four ways for the "concierge next step" session
// (Cath approved the idea 2026-08-03 and gave HER discovery order: Refine → Wardrobe List →
// Shop your Style → Shop Wishlist → What's Trending, with Analyze + Chat as DAILY tools).
// The rendered suggestion is the Wardrobe List one (mid-journey, shows the checklist copy).
//   CURRENT — as live today, no guidance
//   A — a slim gold strip between the greeting mirror and the actions mirror, with ✕
//   B — a "Next for you" row INSIDE the actions mirror, first position, gold Next pill
//   C — Catherine's whisper: a quiet founder-voice line under the greeting mirror, with ✕
// Per-option 2x labelled images (the phone-readable format) + one compare strip.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0].slice(1)));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  const ext = path.extname(file);
  res.writeHead(200, { 'Content-Type': {'.css':'text/css', '.html': 'text/html', '.png': 'image/png' }[ext] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

const SEED = {
  userName: 'Sarah', answers: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  topArchNames: ['Timeless Classic', 'Modern Muse', 'Coastal Chic'],
  portrait: 'A test portrait.', motto: 'Shine on.'
};

const X = '<svg style="width:13px;height:13px;display:block" viewBox="0 0 24 24" fill="none" stroke="#a09a8e" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const ARR = '<svg style="width:14px;height:14px;flex:0 0 auto;vertical-align:-2px" viewBox="0 0 24 24" fill="none" stroke="#C89A2C" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h13"/><path d="M12 6.5 18.5 12 12 17.5"/></svg>';

const VARIANTS = {
  A: `
    const css = document.createElement('style');
    css.textContent = '#nsA{display:flex;align-items:center;gap:10px;margin:12px 14px;padding:10px 12px;background:#FCFAF4;border:1px solid #D8C285;border-radius:10px;text-align:left}' +
      '#nsA .tx{flex:1;min-width:0}' +
      '#nsA .k{display:block;font:600 9.5px/1 Jost,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#BC9022;margin-bottom:4px}' +
      '#nsA .t{font:600 13px/1.3 Jost,sans-serif;color:#26231F}' +
      '#nsA .s{display:block;font:400 11.5px/1.4 Jost,sans-serif;color:#6b655a;margin-top:2px}' +
      '#nsA .x{flex:0 0 auto;padding:4px;cursor:pointer}';
    document.head.appendChild(css);
    const el = document.createElement('div'); el.id = 'nsA';
    el.innerHTML = '<div class="tx"><span class="k">Next for you</span><span class="t">Build your Wardrobe List ${ARR}</span><span class="s">My checklist of 100 pieces shows what your closet is missing</span></div><span class="x">${X}</span>';
    document.querySelector('.wb-acts').before(el);
  `,
  B: `
    const css = document.createElement('style');
    css.textContent = '#nsB{display:flex;align-items:center;gap:11px;padding:11px 12px;margin-bottom:10px;background:#FCFAF4;border:1px solid #E4D3A0;border-radius:10px;text-align:left}' +
      '#nsB .pill{flex:0 0 auto;font:700 9px/1 Jost,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#5c470f;background:linear-gradient(150deg,#FEEF98,#F6CE3E 70%);border-radius:8px;padding:4px 7px;box-shadow:0 1px 3px rgba(201,154,46,.4)}' +
      '#nsB .t{font:600 13px/1.3 Jost,sans-serif;color:#26231F}' +
      '#nsB .s{display:block;font:400 11.5px/1.4 Jost,sans-serif;color:#6b655a;margin-top:2px}';
    document.head.appendChild(css);
    const el = document.createElement('div'); el.id = 'nsB';
    el.innerHTML = '<span class="pill">Next</span><div><span class="t">Build your Wardrobe List ${ARR}</span><span class="s">My checklist of 100 pieces shows what your closet is missing</span></div>';
    document.querySelector('.wb-item').before(el);
  `,
  C: `
    const css = document.createElement('style');
    css.textContent = '#nsC{display:flex;align-items:flex-start;justify-content:center;gap:8px;margin:10px 22px 2px;text-align:center}' +
      '#nsC .t{font:italic 400 12.5px/1.55 Jost,sans-serif;color:#E8E2D2}' +
      '#nsC .t b{font-weight:600;color:#F2D889;border-bottom:1px solid rgba(242,216,137,.55);cursor:pointer;font-style:normal}' +
      '#nsC .x{flex:0 0 auto;padding:3px;margin-top:2px;cursor:pointer}';
    document.head.appendChild(css);
    const el = document.createElement('div'); el.id = 'nsC';
    el.innerHTML = '<span class="t">Next, peek at <b>my wardrobe checklist</b> — 100 pieces a complete closet could hold. Heart what yours is missing <svg style="width:11px;height:11px" viewBox="0 0 24 24" fill="#F49AC1"><path d="M12 21.6 C10.7 18.9 8.2 17 5.9 14.7 C3.6 12.4 2 10.4 2 7.7 C2 4.8 4.2 2.7 7 2.7 C9.5 2.7 11.3 4.6 12 7.1 C12.7 4.6 14.5 2.7 17 2.7 C19.8 2.7 22 4.8 22 7.7 C22 10.4 20.4 12.4 18.1 14.7 C15.8 17 13.3 18.9 12 21.6 Z"/></svg></span><span class="x">${X}</span>';
    document.querySelector('.wb-greet').after(el);
  `,
};

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 1600 }, deviceScaleFactor: 2 });
  await page.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
  await page.addInitScript(d => localStorage.setItem('ss_data', JSON.stringify(d)), SEED);

  const shoot = async (inject) => {
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.show === 'function');
    await page.evaluate(() => { document.getElementById('ssEntrance')?.remove(); document.querySelector('.hm-entrance')?.remove(); });
    await page.addStyleTag({ content: '#s-wb *{animation:none!important;opacity:1}' });
    await page.waitForSelector('#s-wb.act', { timeout: 5000 });
    if (inject) await page.evaluate(new Function(inject));
    await page.waitForTimeout(400);
    const rect = await page.evaluate(() => {
      const top = document.querySelector('.wb-greet').getBoundingClientRect().top + scrollY;
      const bot = document.querySelector('.wb-acts').getBoundingClientRect().bottom + scrollY;
      return { top, bot };
    });
    return await page.screenshot({ clip: { x: 0, y: Math.max(0, rect.top - 10), width: 390, height: rect.bot - rect.top + 24 } });
  };

  const shots = { CURRENT: await shoot(null) };
  const proof = {};
  for (const [k, inj] of Object.entries(VARIANTS)) {
    shots[k] = await shoot(inj);
    proof[k] = await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (!el) return 'MISSING';
      const b = el.getBoundingClientRect();
      return b.width > 0 && b.height > 0 ? 'visible ' + Math.round(b.width) + 'x' + Math.round(b.height) : 'ZERO-SIZE';
    }, 'ns' + k);
  }
  console.log('render proof:', JSON.stringify(proof));
  if (Object.values(proof).some(v => v === 'MISSING' || v === 'ZERO-SIZE')) { console.log('A VARIANT DID NOT RENDER — aborting'); process.exit(1); }

  const DESC = {
    CURRENT: 'As it is today. Greeting mirror, then the action list. Nothing points at what she has not tried yet.',
    A: 'Option A — a slim "NEXT FOR YOU" card between the greeting and the actions. Its own quiet frame, a ✕ to dismiss. One suggestion at a time, gone forever once she has explored everything.',
    B: 'Option B — the suggestion lives INSIDE the action list as the first row, marked with a gold NEXT pill. Feels native to the list; rotates to the next untried tool automatically.',
    C: 'Option C — Catherine’s whisper. One italic line in your voice under the greeting mirror, with your pink heart. The quietest version, dismissible with the ✕.',
  };
  const single = await browser.newPage({ viewport: { width: 430, height: 100 }, deviceScaleFactor: 2 });
  for (const [k, buf] of Object.entries(shots)) {
    await single.setContent(`<body style="margin:0;background:#f4f1ea;font-family:Georgia,serif">
      <div style="padding:18px 20px 14px;text-align:center">
        <div style="font-size:24px;font-weight:bold;margin-bottom:5px">${k === 'CURRENT' ? 'TODAY' : 'OPTION ' + k}</div>
        <div style="font-size:14px;color:#555;margin:0 auto 12px;max-width:390px">${DESC[k]}</div>
        <img src="data:image/png;base64,${buf.toString('base64')}" style="width:390px;border:1px solid #bbb;border-radius:8px">
      </div></body>`);
    const out = path.join(import.meta.dirname, 'nextstep-' + k.toLowerCase() + '.png');
    await single.screenshot({ path: out, fullPage: true });
    console.log('wrote', out);
  }
  await browser.close();
  server.close();
})();
