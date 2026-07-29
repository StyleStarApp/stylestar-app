// Renders the "Find my results" box before and after sending, side by side,
// so Cath can judge the change on a real phone width rather than from a
// description. Labels are drawn into the page so one image carries everything.
import http from 'http';
import fs from 'fs';
import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PORT = 8907, ORIGIN = 'http://localhost:' + PORT;
const server = http.createServer((req, res) => {
  const p = new URL(req.url, ORIGIN).pathname;
  if (p.startsWith('/.netlify/functions/')) { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"success":true,"sent":true}'); return; }
  const f = path.join(ROOT, p === '/' ? 'index.html' : p.replace(/^\//, ''));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200); res.end(fs.readFileSync(f)); return; }
  res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(fs.readFileSync(path.join(ROOT, 'index.html')));
});
await new Promise(r => server.listen(PORT, r));

const browser = await chromium.launch();

// mode 'now'      = what the live site does today (form stays up after sending)
// mode 'proposed' = the change (form stands down)
async function shot(file, mode) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(ORIGIN + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.showRestore === 'function');
  // Skip the opening star reveal — it's a fixed full-screen overlay (.hm-entrance)
  // and it sits over everything for the first couple of seconds.
  await page.evaluate(() => {
    document.body.classList.remove('ss-anim', 'ss-play');
    document.body.classList.add('ss-done');
    document.querySelectorAll('.hm-entrance').forEach(e => e.remove());
  });
  await page.evaluate(() => { document.querySelectorAll('.scr').forEach(s => s.classList.remove('act')); document.getElementById('s-wel').classList.add('act'); });
  await page.evaluate(() => window.showRestore());
  await page.evaluate((e) => { document.getElementById('restoreEmail').value = e; }, 'cath.ellspermann+emailtester@icloud.com');
  await page.evaluate(() => window.restoreResults());
  await page.waitForTimeout(500);
  if (mode === 'now') {
    // Put the form back up, which is exactly what the live site leaves on screen.
    await page.evaluate(() => {
      document.getElementById('restoreAsk').style.display = '';
      const m = document.getElementById('restoreMsg');
      m.innerHTML = m.innerHTML.replace(/Typed the wrong address\?.*?<br><br>/, '');
    });
    await page.waitForTimeout(150);
  }
  const el = await page.$('#restoreForm');
  const box = await el.boundingBox();
  await page.screenshot({
    path: file,
    clip: { x: Math.max(0, box.x - 14), y: Math.max(0, box.y - 14), width: Math.min(390, box.width + 28), height: box.height + 28 }
  });
  await ctx.close();
  return box.height;
}

const hBefore = await shot('/tmp/before.png', 'now');
const hAfter = await shot('/tmp/after.png', 'proposed');

// Compose the two into one labelled image.
const ctx2 = await browser.newContext({ viewport: { width: 900, height: 700 }, deviceScaleFactor: 2 });
const page2 = await ctx2.newPage();
const b64 = f => fs.readFileSync(f).toString('base64');
await page2.setContent(`
<style>
  body{margin:0;background:#fff;font:400 14px/1.5 -apple-system,system-ui,sans-serif;color:#1a1a1a}
  .wrap{display:flex;gap:28px;padding:22px;align-items:flex-start}
  .col{flex:1}
  h2{font-size:15px;margin:0 0 4px}
  p{font-size:12.5px;color:#666;margin:0 0 12px;min-height:34px}
  img{width:100%;border:1px solid #e3e0d8;border-radius:6px;display:block}
  .tag{display:inline-block;font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;margin-bottom:6px}
  .now{background:#f3e3e3;color:#8a3a3a}
  .new{background:#e3efe3;color:#2f6b34}
</style>
<div class="wrap">
  <div class="col">
    <span class="tag now">NOW</span>
    <h2>After she taps Find my results</h2>
    <p>The black button is still the loudest thing on screen, right when it means least.</p>
    <img src="data:image/png;base64,${b64('/tmp/before.png')}">
  </div>
  <div class="col">
    <span class="tag new">PROPOSED</span>
    <h2>After she taps Find my results</h2>
    <p>Form stands down. The message is the only thing left, with a quiet way back if she mistyped.</p>
    <img src="data:image/png;base64,${b64('/tmp/after.png')}">
  </div>
</div>`);
await page2.waitForTimeout(300);
const el2 = await page2.$('.wrap');
await el2.screenshot({ path: path.join(ROOT, 'scratchpad', 'restore-compare.png') });
await ctx2.close();

await browser.close();
server.close();
console.log('before height:', Math.round(hBefore) + 'px   after height:', Math.round(hAfter) + 'px');
console.log('wrote scratchpad/restore-compare.png');
