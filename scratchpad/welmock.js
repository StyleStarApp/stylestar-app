// Renders the REAL welcome screen four ways for the "How it works" 1-2-3 session
// (the founder line already shipped in #692, so the open question is only the path):
//   CURRENT — as live today, no path shown
//   A — three steps with arrows ABOVE the quiz CTA (path before the button)
//   B — a "How it works" mini-section after the founder line (most readable, most room)
//   C — one quiet single line under the CTA (the restraint option)
// One tall labelled image, id-scoped CSS, computed-style proof the variants differ.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0].slice(1)));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  const ext = path.extname(file);
  res.writeHead(200, { 'Content-Type': {'.css':'text/css', '.html': 'text/html', '.png': 'image/png', '.json': 'application/json' }[ext] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

const VARIANTS = {
  A: `
    const css = document.createElement('style');
    css.textContent = '#hiwA{display:flex;align-items:flex-start;justify-content:center;gap:7px;margin:15px 8px 0}' +
      '#hiwA .st{display:flex;flex-direction:column;align-items:center;gap:5px;width:96px}' +
      '#hiwA .n{display:flex;align-items:center;justify-content:center;width:23px;height:23px;border-radius:50%;border:1.3px solid #C8971E;color:#8a6a14;font:600 12px/1 Jost,sans-serif;background:#FCFAF4}' +
      '#hiwA .t{font:400 11.5px/1.35 Jost,sans-serif;color:#4a463e;text-align:center}' +
      '#hiwA .arr{margin-top:6px;color:#C8971E;flex:0 0 auto}';
    document.head.appendChild(css);
    const el = document.createElement('div'); el.id = 'hiwA';
    const arr = '<svg class="arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13"/><path d="M13 6.5 18.5 12 13 17.5"/></svg>';
    el.innerHTML = '<div class="st"><span class="n">1</span><span class="t">Take the<br>style quiz</span></div>' + arr +
      '<div class="st"><span class="n">2</span><span class="t">Meet your<br>Style Portrait</span></div>' + arr +
      '<div class="st"><span class="n">3</span><span class="t">Shop<br>your style</span></div>';
    document.querySelector('.hm-cta').before(el);
  `,
  B: `
    const css = document.createElement('style');
    css.textContent = '#hiwB{margin:16px auto 2px;max-width:298px}' +
      '#hiwB .hd{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:10px}' +
      '#hiwB .hd .hair{height:1px;width:34px;background:linear-gradient(90deg,transparent,#D8C285)}' +
      '#hiwB .hd .hair.r{background:linear-gradient(90deg,#D8C285,transparent)}' +
      '#hiwB .hd .lbl{font:600 11px/1 Jost,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#BC9022;white-space:nowrap}' +
      '#hiwB .row{display:flex;align-items:flex-start;gap:11px;text-align:left;margin-top:9px}' +
      '#hiwB .n{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:23px;height:23px;border-radius:50%;border:1.3px solid #C8971E;color:#8a6a14;font:600 12px/1 Jost,sans-serif;background:#FCFAF4}' +
      '#hiwB .tx b{display:block;font:600 13px/1.3 Jost,sans-serif;color:#26231F}' +
      '#hiwB .tx span{font:400 11.5px/1.45 Jost,sans-serif;color:#6b655a}';
    document.head.appendChild(css);
    const el = document.createElement('div'); el.id = 'hiwB';
    el.innerHTML = '<div class="hd"><span class="hair"></span><span class="lbl">How it works</span><span class="hair r"></span></div>' +
      '<div class="row"><span class="n">1</span><div class="tx"><b>Take the style quiz</b><span>12 quick questions, no wrong answers</span></div></div>' +
      '<div class="row"><span class="n">2</span><div class="tx"><b>Meet your Style Portrait</b><span>Your signature style, in words made for you</span></div></div>' +
      '<div class="row"><span class="n">3</span><div class="tx"><b>Shop your style</b><span>Stores and pieces picked to fit it</span></div></div>';
    document.querySelector('.hm-founder').after(el);
  `,
  C: `
    const css = document.createElement('style');
    css.textContent = '#hiwC{margin:11px 6px 0;font:400 12px/1.5 Jost,sans-serif;color:#6b655a;text-align:center}' +
      '#hiwC b{font-weight:600;color:#8a6a14}#hiwC .it{display:inline-block;white-space:nowrap}';
    document.head.appendChild(css);
    const el = document.createElement('div'); el.id = 'hiwC';
    el.innerHTML = '<span class="it"><b>1</b> Take the quiz</span> &nbsp;&middot;&nbsp; <span class="it"><b>2</b> Meet your Style Portrait</span> &nbsp;&middot;&nbsp; <span class="it"><b>3</b> Shop your style</span>';
    document.querySelector('.hm-cta').after(el);
  `,
};

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 1600 }, deviceScaleFactor: 2 });

  const shoot = async (inject) => {
    await page.goto(base + '/', { waitUntil: 'load' });
    await page.evaluate(() => { document.getElementById('ssEntrance')?.remove(); document.querySelector('.hm-entrance')?.remove(); });
    await page.addStyleTag({ content: '#s-wel *{animation:none!important;opacity:1}' });
    await page.evaluate(() => document.fonts.ready.then(() => {}));
    if (inject) await page.evaluate(new Function(inject));
    await page.waitForTimeout(350);
    const rect = await page.evaluate(() => {
      const top = document.querySelector('.hm-h1').getBoundingClientRect().top + scrollY;
      const bot = document.querySelector('.hm-divwrap').getBoundingClientRect().bottom + scrollY;
      return { top, bot };
    });
    return await page.screenshot({ clip: { x: 0, y: Math.max(0, rect.top - 16), width: 390, height: rect.bot - rect.top + 30 } });
  };

  const shots = { CURRENT: await shoot(null) };
  const proof = {};
  for (const [k, inj] of Object.entries(VARIANTS)) {
    shots[k] = await shoot(inj);
    proof[k] = await page.evaluate((id) => {
      const el = document.getElementById(id);
      return el ? getComputedStyle(el).fontFamily.slice(0, 20) + ' / children:' + el.children.length : 'MISSING';
    }, 'hiw' + k);
  }
  console.log('computed-style proof:', JSON.stringify(proof));
  if (Object.values(proof).some(v => v === 'MISSING')) { console.log('A VARIANT DID NOT RENDER — aborting'); process.exit(1); }

  const DESC = {
    CURRENT: 'As it is today. Headline, quiz button, your founder line. The path itself is never named.',
    A: 'Option A — the path BEFORE the button. Three steps with gold arrows sit right above the quiz CTA, so she sees where the button leads before she taps it.',
    B: 'Option B — a "How it works" mini-section after your founder line, matching the Or Explore divider style. The most readable version, and the roomiest.',
    C: 'Option C — the restraint option. One quiet line under the button, gold step numbers, nothing else added.',
  };
  const compose = await browser.newPage({ viewport: { width: 470, height: 100 } });
  const panels = Object.entries(shots).map(([k, buf]) =>
    `<div style="padding:22px 24px 6px;text-align:center">
      <div style="font-size:20px;font-weight:bold;margin-bottom:3px">${k === 'CURRENT' ? 'TODAY' : 'OPTION ' + k}</div>
      <div style="font-size:13px;color:#555;margin:0 auto 10px;max-width:400px">${DESC[k]}</div>
      <img src="data:image/png;base64,${buf.toString('base64')}" style="width:390px;border:1px solid #bbb;border-radius:8px">
    </div>`).join('');
  await compose.setContent(`<body style="margin:0;background:#f4f1ea;font-family:Georgia,serif">${panels}<div style="height:16px"></div></body>`);
  await compose.screenshot({ path: path.join(import.meta.dirname, 'welcome-compare.png'), fullPage: true });
  console.log('wrote welcome-compare.png');

  // Also one big labelled image PER option, so they're readable on a phone.
  const single = await browser.newPage({ viewport: { width: 430, height: 100 }, deviceScaleFactor: 2 });
  for (const [k, buf] of Object.entries(shots)) {
    await single.setContent(`<body style="margin:0;background:#f4f1ea;font-family:Georgia,serif">
      <div style="padding:18px 20px 14px;text-align:center">
        <div style="font-size:24px;font-weight:bold;margin-bottom:5px">${k === 'CURRENT' ? 'TODAY' : 'OPTION ' + k}</div>
        <div style="font-size:14px;color:#555;margin:0 auto 12px;max-width:390px">${DESC[k]}</div>
        <img src="data:image/png;base64,${buf.toString('base64')}" style="width:390px;border:1px solid #bbb;border-radius:8px">
      </div></body>`);
    const out = path.join(import.meta.dirname, 'welcome-' + k.toLowerCase() + '.png');
    await single.screenshot({ path: out, fullPage: true });
    console.log('wrote', out);
  }
  await browser.close();
  server.close();
})();
