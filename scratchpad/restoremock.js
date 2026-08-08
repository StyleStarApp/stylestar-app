// Render the "Check your email" confirmation four ways for Cath to pick from.
// Drives the REAL welcome screen into the REAL sent state (fetch stubbed to a
// 200), then swaps the message markup + id-scoped CSS per option. 2x images,
// her preferred phone-readable format.
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

const LINKS = `<div class="rc-alt">Typed the wrong address? <b onclick="restoreAskAgain()">Try a different email</b>.</div>
<div class="rc-alt">Nothing there? You may not have saved your results yet. Want to <b onclick="startQ()">take our fun style quiz</b>?</div>`;

const MAIL = `<svg viewBox="0 0 24 24" fill="none" stroke="#8a6a14" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.2"/><path d="m3.2 6.4 8.1 6.1a1.2 1.2 0 0 0 1.4 0l8.1-6.1"/></svg>`;

const OPTIONS = {
  current: { label: 'WHAT IT LOOKS LIKE NOW', css: '', html: null },

  a: {
    label: 'OPTION A  ·  bordered card + envelope',
    css: `
#restoreForm .rc-card{background:#FBF6EA;border:1px solid #D8C285;border-radius:10px;padding:15px 15px 14px;text-align:left;display:flex;gap:12px;align-items:flex-start;box-shadow:0 4px 14px -8px rgba(120,90,20,.45)}
#restoreForm .rc-ic{flex:0 0 auto;width:38px;height:38px;border-radius:9px;background:#F5EFE2;border:1px solid #D8C285;display:flex;align-items:center;justify-content:center}
#restoreForm .rc-ic svg{width:21px;height:21px;display:block}
#restoreForm .rc-tx{flex:1;min-width:0}
#restoreForm .rc-h{font:600 15px/1.25 'Jost',sans-serif;color:#211E1A;margin-bottom:4px}
#restoreForm .rc-b{font:400 12.5px/1.55 'Jost',sans-serif;color:#4a463e}
#restoreForm .rc-q{display:block;font:400 12px/1.5 'Jost',sans-serif;color:#6b655a;margin-top:6px}
#restoreForm .rc-alt{font:400 12px/1.55 'Jost',sans-serif;color:#4a463e;margin-top:11px;text-align:center}
#restoreForm .rc-alt b{color:#1a1a1a;font-weight:600;text-decoration:underline;cursor:pointer}`,
    html: `<div class="rc-card"><span class="rc-ic">${MAIL}</span><div class="rc-tx">
<div class="rc-h">Check your email</div>
<div class="rc-b">We've just sent a link back to your results. Tap the button in it and you'll land right back in your Style Portrait.
<span class="rc-q">It's in your welcome email too, if that's quicker.</span></div>
</div></div>${LINKS}`
  },

  b: {
    label: 'OPTION B  ·  gold divider, no box (lightest touch)',
    css: `
#restoreForm .rc-divwrap{display:flex;align-items:center;justify-content:center;gap:10px;margin:2px 0 9px}
#restoreForm .rc-hair{height:1px;width:34px}
#restoreForm .rc-hair.l{background:linear-gradient(90deg,transparent,#C9A24E)}
#restoreForm .rc-hair.r{background:linear-gradient(270deg,transparent,#C9A24E)}
#restoreForm .rc-divlbl{font:600 11px/1 'Jost',sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#BC9022;white-space:nowrap}
#restoreForm .rc-b{font:400 13.5px/1.6 'Jost',sans-serif;color:#332F29;text-wrap:balance}
#restoreForm .rc-q{display:block;font:400 12px/1.5 'Jost',sans-serif;color:#6b655a;margin-top:7px}
#restoreForm .rc-alt{font:400 12px/1.55 'Jost',sans-serif;color:#4a463e;margin-top:11px}
#restoreForm .rc-alt b{color:#1a1a1a;font-weight:600;text-decoration:underline;cursor:pointer}`,
    html: `<div class="rc-divwrap"><span class="rc-hair l"></span><span class="rc-divlbl">Check your email</span><span class="rc-hair r"></span></div>
<div class="rc-b">We've just sent a link back to your results. Tap the button in it and you'll land right back in your Style Portrait.
<span class="rc-q">It's in your welcome email too, if that's quicker.</span></div>${LINKS}`
  },

  c: {
    label: 'OPTION C  ·  gold accent bar, strongest highlight',
    css: `
#restoreForm .rc-card{position:relative;background:linear-gradient(180deg,#FDF8EC,#F8F1DE);border:1px solid #D8C285;border-left:4px solid #C8971E;border-radius:8px;padding:14px 14px 13px 15px;text-align:left;box-shadow:0 5px 16px -8px rgba(120,90,20,.5)}
#restoreForm .rc-h{display:flex;align-items:center;gap:8px;font:700 16px/1.2 'Jost',sans-serif;color:#1A1814;margin-bottom:6px}
#restoreForm .rc-h svg{width:19px;height:19px;flex:0 0 auto}
#restoreForm .rc-b{font:400 13px/1.55 'Jost',sans-serif;color:#3b372f}
#restoreForm .rc-q{display:block;font:400 12px/1.5 'Jost',sans-serif;color:#6b655a;margin-top:7px;padding-top:7px;border-top:1px solid rgba(200,151,30,.25)}
#restoreForm .rc-alt{font:400 12px/1.55 'Jost',sans-serif;color:#4a463e;margin-top:11px;text-align:center}
#restoreForm .rc-alt b{color:#1a1a1a;font-weight:600;text-decoration:underline;cursor:pointer}`,
    html: `<div class="rc-card">
<div class="rc-h">${MAIL}Check your email</div>
<div class="rc-b">We've just sent a link back to your results. Tap the button in it and you'll land right back in your Style Portrait.
<span class="rc-q">It's in your welcome email too, if that's quicker.</span></div>
</div>${LINKS}`
  }
};

for (const [key, opt] of Object.entries(OPTIONS)) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  // the restore GET always answers 200 by design, so a stub is faithful here
  await page.route('**/user-data*', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true,"sent":true}' }));
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.evaluate(() => { showRestore(); document.getElementById('restoreEmail').value = 'cath@example.com'; });
  await page.evaluate(() => restoreResults());
  await page.waitForTimeout(400);

  await page.evaluate(({ css, html, label }) => {
    if (css) { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }
    if (html) document.getElementById('restoreMsg').innerHTML = html;
    const bar = document.createElement('div');
    bar.id = '__lbl';
    bar.textContent = label;
    bar.style.cssText = "font:700 12px/1.3 'Jost',sans-serif;letter-spacing:.1em;color:#fff;background:#1a1a1a;padding:9px 10px;text-align:center;margin-bottom:10px;border-radius:4px";
    const form = document.getElementById('restoreForm');
    form.parentNode.insertBefore(bar, form);
  }, opt);
  await page.waitForTimeout(200);

  // scroll the block to the top of the viewport so the clip can't run past it
  await page.evaluate(() => {
    const a = document.getElementById('__lbl');
    window.scrollTo(0, a.getBoundingClientRect().top + window.scrollY - 14);
  });
  await page.waitForTimeout(250);
  const box = await page.evaluate(() => {
    const a = document.getElementById('__lbl').getBoundingClientRect();
    const b = document.getElementById('restoreForm').getBoundingClientRect();
    return { x: 8, y: Math.max(0, a.top - 8), width: 374, height: Math.min(window.innerHeight - Math.max(0, a.top - 8), (b.bottom - a.top) + 18) };
  });
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', 'restore-' + key + '.png'), clip: box });
  if (errs.length) console.log('JS ERRORS on ' + key + ': ' + errs.join(' | '));
  console.log('rendered restore-' + key + '.png   (' + Math.round(box.height) + 'px tall)');
  await page.close();
}
await browser.close(); server.close();
