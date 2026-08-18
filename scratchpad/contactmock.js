// Contact page — three directions for Cath to pick from (2026-08-17).
//
// Renders each option INTO THE REAL index.html, so the letterhead, the fonts,
// the .story-wrap paper and the footer are the real ones and not a lookalike.
// Per-option 2x images (her preferred format — a phone can actually read them).
//
// ⚠️ Mockup CSS is id-scoped (#vA .cc-card, never .cc-card) — the 2026-07-26
// lesson: unscoped variant CSS matched every block on the page and rendered
// five "different" options identically.
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
const PORT = 8899;

const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
  '.png':'image/png', '.jpg':'image/jpeg', '.json':'application/json', '.svg':'image/svg+xml' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('no'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

// ---- the shared pieces every option uses -------------------------------
// Her voice on light paper = Lora upright 15.5px #4a463e (the 2026-08-13 rule).
const LEAD = `I'd love to hear from you. Whether you have a question, something isn't working right, or you just want to say hello, this reaches me.`;
const SIGN = `I read every message myself.`;

const HELLO = 'hello@stylestar.app';
const PARTNERS = 'partners@stylestar.app';

const HEAD = `
  <div class="pp-head">
    <img src="logo-star.png" alt="Style Star — tap for home" class="pp-lh-logo">
    <button class="top-back">&larr; Back</button>
  </div>
  <div class="story-title">Contact</div>`;

// ---- OPTION A: two cards, one per audience ------------------------------
const A_CSS = `
#vA .cc-lead{font:400 15.5px/1.65 'Lora',Georgia,serif;color:#4a463e;text-wrap:balance;margin:0 auto 18px;max-width:320px}
#vA .cc-card{border:1px solid #D8A52E;background:#FDFBF5;padding:15px 14px;margin:0 auto 12px;max-width:320px;text-align:center}
#vA .cc-h{font:400 17px/1.25 'DM Serif Display',Georgia,serif;color:#1a1a1a;margin-bottom:5px}
#vA .cc-w{font:400 13.5px/1.5 'Jost',sans-serif;color:#6b6355;margin-bottom:9px}
#vA .cc-a{font:500 15px/1.3 'Jost',sans-serif;color:#A0761B;text-decoration:underline;word-break:break-word}
#vA .cc-sign{font:400 14px/1.6 'Lora',Georgia,serif;color:#6b655a;margin-top:16px}`;
const A_HTML = `
  <div class="cc-lead">${LEAD}</div>
  <div class="cc-card"><div class="cc-h">Questions &amp; help</div>
    <div class="cc-w">Anything about your results, your saved details, or the app itself.</div>
    <span class="cc-a">${HELLO}</span></div>
  <div class="cc-card"><div class="cc-h">Brands &amp; partners</div>
    <div class="cc-w">Retailers, partnerships, affiliate programs and press.</div>
    <span class="cc-a">${PARTNERS}</span></div>
  <div class="cc-sign">${SIGN}</div>`;

// ---- OPTION B: one warm note, addresses quietly labelled ----------------
const B_CSS = `
#vB .cc-lead{font:400 15.5px/1.65 'Lora',Georgia,serif;color:#4a463e;text-wrap:balance;margin:0 auto 20px;max-width:320px}
#vB .cc-pair{max-width:320px;margin:0 auto}
#vB .cc-l{font:600 11px/1 'Jost',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#6b6355;margin-bottom:5px}
#vB .cc-a{font:500 16px/1.3 'Jost',sans-serif;color:#A0761B;text-decoration:underline;word-break:break-word;display:block}
#vB .cc-blk{margin-bottom:18px}
#vB .cc-sign{font:400 14px/1.6 'Lora',Georgia,serif;color:#6b655a;margin-top:6px}`;
const B_HTML = `
  <div class="cc-lead">${LEAD}</div>
  <div class="cc-pair">
    <div class="cc-blk"><div class="cc-l">Questions &amp; help</div><span class="cc-a">${HELLO}</span></div>
    <div class="cc-blk"><div class="cc-l">Brands &amp; partners</div><span class="cc-a">${PARTNERS}</span></div>
    <div class="cc-sign">${SIGN}</div>
  </div>`;

// ---- OPTION C: lead + two rows in the app's own row pattern -------------
// Gold hairline rows, the Menu/worksheet grammar the app already speaks.
const C_CSS = `
#vC .cc-lead{font:400 15.5px/1.65 'Lora',Georgia,serif;color:#4a463e;text-wrap:balance;margin:0 auto 18px;max-width:320px}
#vC .cc-rows{max-width:320px;margin:0 auto;text-align:left}
#vC .cc-row{padding:13px 2px;border-top:1px solid rgba(33,30,26,.12)}
#vC .cc-row:last-child{border-bottom:1px solid rgba(33,30,26,.12)}
#vC .cc-h{font:400 16px/1.25 'DM Serif Display',Georgia,serif;color:#1a1a1a;margin-bottom:2px}
#vC .cc-w{font:400 13px/1.45 'Jost',sans-serif;color:#6b6355;margin-bottom:6px}
#vC .cc-a{font:500 15px/1.3 'Jost',sans-serif;color:#A0761B;text-decoration:underline;word-break:break-word}
#vC .cc-sign{font:400 14px/1.6 'Lora',Georgia,serif;color:#6b655a;margin-top:16px;text-align:center}`;
const C_HTML = `
  <div class="cc-lead">${LEAD}</div>
  <div class="cc-rows">
    <div class="cc-row"><div class="cc-h">Questions &amp; help</div>
      <div class="cc-w">Your results, your saved details, or the app itself.</div>
      <span class="cc-a">${HELLO}</span></div>
    <div class="cc-row"><div class="cc-h">Brands &amp; partners</div>
      <div class="cc-w">Retailers, partnerships, affiliate programs and press.</div>
      <span class="cc-a">${PARTNERS}</span></div>
  </div>
  <div class="cc-sign">${SIGN}</div>`;

const OPTIONS = [
  { id:'vA', label:'A — two cards',      css:A_CSS, html:A_HTML },
  { id:'vB', label:'B — one warm note',  css:B_CSS, html:B_HTML },
  { id:'vC', label:'C — labelled rows',  css:C_CSS, html:C_HTML },
];

const run = async () => {
  await new Promise(r => server.listen(PORT, r));
  // The container ships its own Chromium; the freshly-installed playwright
  // package pins a newer build number, so point at the real binary rather
  // than downloading one (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD is set here).
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  for (const opt of OPTIONS) {
    const page = await browser.newPage({
      viewport: { width: 390, height: 900 }, deviceScaleFactor: 2,
    });
    await page.goto(`http://localhost:${PORT}/index.html`);
    await page.waitForTimeout(2600);          // let the entrance curtain finish
    await page.evaluate(() => {
      const c = document.querySelector('.hm-entrance'); if (c) c.remove();
      document.querySelectorAll('.scr').forEach(s => s.classList.remove('act'));
      const qf = document.querySelector('.quiz-footer'); if (qf) qf.style.display = 'none';
    });
    await page.evaluate(({ id, css, html, head }) => {
      const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
      const d = document.createElement('div');
      d.className = 'scr act'; d.id = id;
      d.innerHTML = `<div class="story-wrap">${head}${html}
        <button class="btn-outline" style="max-width:260px;margin:1.5rem auto 0;display:block">Back</button>
        <div class="pg-foot" data-std-foot></div></div>`;
      document.querySelector('.ss').appendChild(d);
      // real footer, same template every other page uses
      d.querySelectorAll('[data-std-foot]').forEach(el => { el.innerHTML = window._stdFootHTML ? window._stdFootHTML('') : ''; });
    }, { id: opt.id, css: opt.css, html: opt.html, head: HEAD });
    await page.waitForTimeout(700);

    // PROVE the variants really differ (the id-scoping lesson)
    const probe = await page.evaluate((id) => {
      const a = document.querySelector(`#${id} .cc-a`);
      const cs = a ? getComputedStyle(a) : null;
      const card = document.querySelector(`#${id} .cc-card`);
      const row = document.querySelector(`#${id} .cc-row`);
      const el = document.getElementById(id);
      return {
        addrFont: cs ? cs.fontSize : null,
        hasCard: !!card, hasRow: !!row,
        height: Math.round(el.getBoundingClientRect().height),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    }, opt.id);
    console.log(opt.label, JSON.stringify(probe));

    await page.locator(`#${opt.id}`).screenshot({ path: `scratchpad/contact-${opt.id.slice(1).toLowerCase()}.png` });
    await page.close();
  }

  await browser.close();
  server.close();
  console.log('\nrendered: scratchpad/contact-a.png · contact-b.png · contact-c.png');
};

run().catch(e => { console.error(e); server.close(); process.exit(1); });
