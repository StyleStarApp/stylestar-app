// Renders the Style Portrait's first-reveal "next step" TWO ways for Cath's
// consistency question (2026-08-05): she spotted that the portrait strip is a
// different visual language than Catherine's whisper on Welcome Back.
//   CURRENT — the gold-star card strip as live today (#refineNext)
//   WHISPER — the same suggestion re-dressed in the whisper style (cream italic,
//             gold link, pink heart, ✕), using her own refine whisper line.
// Per-option 2x labelled images, the phone-readable format she prefers.
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

const SEED = { userName: 'Sarah', answers: [6,6,6,6,6,6,6,6,6,6,6,6],
  topArchNames: ['Timeless Classic','Modern Muse','Coastal Chic'], portrait: 'A test portrait.', motto: 'Shine on.' };

// Whisper markup mirrors #wbNext — BUT the portrait strip sits inside the IVORY
// p3 panel (rgb(252,252,251) measured), not on lacquer, so the cream/gold
// dark-background colors must adapt: ink italic + deeper gold, same voice.
const WHISPER_INJECT = `
  const css = document.createElement('style');
  css.textContent = '#rnW{display:flex;align-items:flex-start;justify-content:center;gap:8px;margin:12px 22px 2px;text-align:center}' +
    '#rnW .t{font:italic 400 12.5px/1.55 Jost,sans-serif;color:#6b655a;cursor:pointer}' +
    '#rnW .t b{font-weight:600;color:#A0761B;border-bottom:1px solid rgba(160,118,27,.45);font-style:normal}' +
    '#rnW .x{flex:0 0 auto;padding:3px;margin-top:2px;cursor:pointer}';
  document.head.appendChild(css);
  const el = document.createElement('div'); el.id = 'rnW';
  el.innerHTML = '<span class="t">Next, <b>add your sizes, colors and faves</b>. Defining preferences is how we enhance our style ' +
    '<svg style="width:11px;height:11px;vertical-align:-1px" viewBox="0 0 24 24" fill="#F49AC1"><path d="M12 21.6 C10.7 18.9 8.2 17 5.9 14.7 C3.6 12.4 2 10.4 2 7.7 C2 4.8 4.2 2.7 7 2.7 C9.5 2.7 11.3 4.6 12 7.1 C12.7 4.6 14.5 2.7 17 2.7 C19.8 2.7 22 4.8 22 7.7 C22 10.4 20.4 12.4 18.1 14.7 C15.8 17 13.3 18.9 12 21.6 Z"/></svg></span>' +
    '<span class="x"><svg style="width:13px;height:13px;display:block" viewBox="0 0 24 24" fill="none" stroke="#a09a8e" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></span>';
  const cur = document.getElementById('refineNext');
  cur.after(el); cur.style.display = 'none';
`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
await page.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
await page.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
await page.addInitScript(d => localStorage.setItem('ss_data', JSON.stringify(d)), SEED);

// The reveal screen re-flows under clipped screenshots (flowshot lesson), so
// shoot the save button + the next-step element and re-stack on the lacquer.
const shoot = async (inject) => {
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.evaluate(() => { document.getElementById('ssEntrance')?.remove(); show('s-res');
    document.getElementById('s-res').classList.add('rv-open'); });
  await page.waitForTimeout(2500);
  if (inject) await page.evaluate(new Function(inject));
  await page.waitForTimeout(300);
  const sel = inject ? '#rnW' : '#refineNext';
  const proof = await page.evaluate((s) => {
    const el = document.querySelector(s); if (!el) return 'MISSING';
    const b = el.getBoundingClientRect();
    return b.width > 0 && b.height > 0 ? 'visible ' + Math.round(b.width) + 'x' + Math.round(b.height) : 'ZERO-SIZE';
  }, sel);
  const save = await page.locator('#resSaveBtn').screenshot();
  const strip = await page.locator(sel).screenshot();
  return { save, strip, proof };
};

const cur = await shoot(null);
const whi = await shoot(WHISPER_INJECT);
console.log('render proof: current=' + cur.proof + ' whisper=' + whi.proof);
if ([cur.proof, whi.proof].some(p => p === 'MISSING' || p === 'ZERO-SIZE')) { console.log('DID NOT RENDER — aborting'); process.exit(1); }

const DESC = {
  current: 'TODAY — the gold-star card strip under Save. Louder: its own cream frame, bold title, arrow. Built before the whisper existed.',
  whisper: 'WHISPER STYLE — the same suggestion in the whisper voice: italic line, gold link, pink heart, quiet &#10005;. The portrait panel is ivory (not dark like Welcome Back), so the cream/gold adapts to ink + deeper gold — same voice, readable here.',
};
const single = await browser.newPage({ viewport: { width: 430, height: 100 }, deviceScaleFactor: 2 });
for (const [k, shot] of [['current', cur], ['whisper', whi]]) {
  await single.setContent(`<body style="margin:0;background:#f4f1ea;font-family:Georgia,serif">
    <div style="padding:18px 20px 14px;text-align:center">
      <div style="font-size:24px;font-weight:bold;margin-bottom:5px">${k === 'current' ? 'TODAY' : 'WHISPER STYLE'}</div>
      <div style="font-size:14px;color:#555;margin:0 auto 12px;max-width:390px">${DESC[k]}</div>
      <div style="width:390px;margin:0 auto;background:#FCFCFB;border:1px solid #bbb;border-radius:8px;padding:22px 18px;box-sizing:border-box">
        <img src="data:image/png;base64,${shot.save.toString('base64')}" style="width:100%;display:block;margin-bottom:12px">
        <img src="data:image/png;base64,${shot.strip.toString('base64')}" style="width:100%;display:block">
      </div>
    </div></body>`);
  await single.waitForTimeout(200);
  const out = path.join(import.meta.dirname, 'refinestrip-' + k + '.png');
  await single.screenshot({ path: out, fullPage: true });
  console.log('wrote', out);
}
await browser.close(); server.close();
