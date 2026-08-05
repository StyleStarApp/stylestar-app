// Renders the "Add to Home Screen" hint THREE ways on the real Welcome Back
// (Cath approved the idea 2026-08-03: "I LOVE this idea yes let's do that").
// All target the returning woman; iOS has no install API so each shows the
// two taps (Share -> Add to Home Screen); Android would swap in a real button.
//   A — a slim boutique card between the actions mirror and the footer, ✕ left
//   B — Catherine's whisper voice: one cream italic line under the mirror, ✕ left
//   C — a one-time bottom sheet rising from the bottom, "Maybe later" dismiss
// Per-option 2x labelled images (the phone-readable format).
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

// iOS share glyph (square + up arrow), gold, inline widths (the &quot; trap)
const SHARE = (c, w) => `<svg style="width:${w}px;height:${w}px;vertical-align:-2px" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M8.5 7 12 3.5 15.5 7"/><path d="M7 10H5.8C5 10 4.4 10.6 4.4 11.4v8.2c0 .8.6 1.4 1.4 1.4h12.4c.8 0 1.4-.6 1.4-1.4v-8.2c0-.8-.6-1.4-1.4-1.4H17"/></svg>`;
const XGREY = '<svg style="width:13px;height:13px;display:block" viewBox="0 0 24 24" fill="none" stroke="#a09a8e" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const STARTILE = '<svg style="width:20px;height:20px;display:block" viewBox="0 0 24 24"><path fill="#E0B84C" stroke="#8a6c1c" stroke-width="0.8" stroke-linejoin="round" d="M12 1.6L14.47 8.6L21.89 8.79L15.99 13.3L18.11 20.41L12 16.2L5.89 20.41L8.01 13.3L2.11 8.79L9.53 8.6Z"/></svg>';

const VARIANTS = {
  A: `
    const css = document.createElement('style');
    css.textContent = '#hsA{display:flex;align-items:center;gap:10px;margin:14px 16px 4px;padding:11px 13px;background:#FCFAF4;border:1px solid #D8C285;border-radius:10px;text-align:left}' +
      '#hsA .x{flex:0 0 auto;padding:3px;cursor:pointer}' +
      '#hsA .tile{flex:0 0 auto}' +
      '#hsA .t{font:600 13px/1.3 Jost,sans-serif;color:#26231F}' +
      '#hsA .s{display:block;font:400 11.5px/1.45 Jost,sans-serif;color:#6b655a;margin-top:2.5px}';
    document.head.appendChild(css);
    const el = document.createElement('div'); el.id = 'hsA';
    el.innerHTML = '<span class="x">${XGREY}</span><span class="tile">${STARTILE}</span><div><span class="t">Keep Style Star on your phone</span><span class="s">Tap ${SHARE('#A0761B', 13)} Share below, then &ldquo;Add to Home Screen&rdquo; &mdash; my star lands right on your screen</span></div>';
    document.querySelector('.wb-foot').before(el);
  `,
  B: `
    const css = document.createElement('style');
    css.textContent = '#hsB{position:relative;margin:12px 14px 2px;padding:0 22px;text-align:center}' +
      '#hsB .t{display:block;font:italic 400 12.5px/1.55 Jost,sans-serif;color:#E8E2D2;cursor:pointer;text-wrap:balance}' +
      '#hsB .t b{font-weight:600;color:#F2D889;border-bottom:1px solid rgba(242,216,137,.55);font-style:normal}' +
      '#hsB .x{position:absolute;left:0;top:2px;padding:3px;cursor:pointer}';
    document.head.appendChild(css);
    const el = document.createElement('div'); el.id = 'hsB';
    el.innerHTML = '<span class="x">${XGREY}</span><span class="t">Keep me close. Tap ${SHARE('#F2D889', 12)} Share, then <b>Add to Home Screen</b>, and my star is one tap away <svg style="width:11px;height:11px;vertical-align:-1px" viewBox="0 0 24 24" fill="#F49AC1"><path d="M12 21.6 C10.7 18.9 8.2 17 5.9 14.7 C3.6 12.4 2 10.4 2 7.7 C2 4.8 4.2 2.7 7 2.7 C9.5 2.7 11.3 4.6 12 7.1 C12.7 4.6 14.5 2.7 17 2.7 C19.8 2.7 22 4.8 22 7.7 C22 10.4 20.4 12.4 18.1 14.7 C15.8 17 13.3 18.9 12 21.6 Z"/></svg></span>';
    document.querySelector('.wb-foot').before(el);
  `,
  C: `
    const css = document.createElement('style');
    css.textContent = '#hsC{position:fixed;left:0;right:0;bottom:0;z-index:9500;background:#FCFAF4;border-top:1px solid #D8C285;border-radius:16px 16px 0 0;padding:18px 22px 20px;box-shadow:0 -8px 30px rgba(0,0,0,.35);text-align:center}' +
      '#hsC .h{font:600 15px/1.3 Jost,sans-serif;color:#26231F;margin-bottom:6px}' +
      '#hsC .b{font:400 12.5px/1.55 Jost,sans-serif;color:#6b655a;max-width:300px;margin:0 auto}' +
      '#hsC .later{display:inline-block;margin-top:12px;font:500 12px/1 Jost,sans-serif;color:#8a8474;text-decoration:underline;cursor:pointer}' +
      '#hsC .star{margin-bottom:8px}';
    document.head.appendChild(css);
    const el = document.createElement('div'); el.id = 'hsC';
    el.innerHTML = '<div class="star" style="display:flex;justify-content:center">${STARTILE}</div><div class="h">Put the star on your phone</div><div class="b">Style Star works like an app. Tap the ${SHARE('#A0761B', 13)} Share button below, then choose &ldquo;Add to Home Screen&rdquo;.</div><span class="later">Maybe later</span>';
    document.body.appendChild(el);
  `,
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await page.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.route('https://plausible.io/**', r => r.fulfill({ status: 200, body: '' }));
  await page.addInitScript(d => localStorage.setItem('ss_data', JSON.stringify(d)), SEED);

  const shoot = async (k, inject) => {
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.show === 'function');
    await page.evaluate(() => { document.getElementById('ssEntrance')?.remove(); document.querySelector('.hm-entrance')?.remove(); });
    await page.addStyleTag({ content: '#s-wb *{animation:none!important;opacity:1}' });
    await page.waitForSelector('#s-wb.act', { timeout: 5000 });
    await page.evaluate(new Function(inject));
    await page.waitForTimeout(400);
    const proof = await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (!el) return 'MISSING';
      const b = el.getBoundingClientRect();
      return b.width > 0 && b.height > 0 ? 'visible ' + Math.round(b.width) + 'x' + Math.round(b.height) : 'ZERO-SIZE';
    }, 'hs' + k);
    let shot;
    if (k === 'C') {
      // sheet is fixed at the viewport bottom; show the lower half of the screen
      shot = await page.screenshot({ clip: { x: 0, y: 420, width: 390, height: 424 } });
    } else {
      const rect = await page.evaluate((id) => {
        const el = document.getElementById(id);
        el.scrollIntoView({ block: 'center' });
        const b = el.getBoundingClientRect();
        const f = document.querySelector('.wb-foot').getBoundingClientRect();
        const top = Math.max(0, Math.min(b.top, f.top) - 150);
        const bot = Math.min(844, Math.max(b.bottom, f.bottom) + 14);
        return { top, h: bot - top };
      }, 'hs' + k);
      shot = await page.screenshot({ clip: { x: 0, y: rect.top, width: 390, height: rect.h } });
    }
    return { shot, proof };
  };

  const out = {};
  for (const [k, inj] of Object.entries(VARIANTS)) out[k] = await shoot(k, inj);
  console.log('render proof:', JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.proof]))));
  if (Object.values(out).some(v => v.proof === 'MISSING' || v.proof === 'ZERO-SIZE')) { console.log('A VARIANT DID NOT RENDER — aborting'); process.exit(1); }

  const DESC = {
    A: 'Option A — a slim boutique card under the Shop &amp; Style mirror. Star tile, plain-words how-to, ✕ on the left to dismiss forever. The most instructional of the three.',
    B: 'Option B — Catherine&rsquo;s whisper voice, matching the journey whispers exactly: one cream italic line, gold link, pink heart, ✕ left. The quietest; the how-to lives in the line itself.',
    C: 'Option C — a one-time bottom sheet that rises on her second visit. The most noticeable; &ldquo;Maybe later&rdquo; dismisses it forever. Nothing else on screen moves.',
  };
  const single = await browser.newPage({ viewport: { width: 430, height: 100 }, deviceScaleFactor: 2 });
  for (const [k, v] of Object.entries(out)) {
    await single.setContent(`<body style="margin:0;background:#f4f1ea;font-family:Georgia,serif">
      <div style="padding:18px 20px 14px;text-align:center">
        <div style="font-size:24px;font-weight:bold;margin-bottom:5px">OPTION ${k}</div>
        <div style="font-size:14px;color:#555;margin:0 auto 12px;max-width:390px">${DESC[k]}</div>
        <img src="data:image/png;base64,${v.shot.toString('base64')}" style="width:390px;border:1px solid #bbb;border-radius:8px">
      </div></body>`);
    await single.waitForTimeout(200);
    const outPath = path.join(import.meta.dirname, 'a2hs-' + k.toLowerCase() + '.png');
    await single.screenshot({ path: outPath, fullPage: true });
    console.log('wrote', outPath);
  }
  await browser.close();
  server.close();
})();
