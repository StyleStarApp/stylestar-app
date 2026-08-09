// "Catherine's Style" panel on the photo-results screen (2026-08-09, her ask):
// she doesn't like the big framed keepsake tiles — "make the buttons back to
// our usual style in the hubs." Renders on the REAL page:
//   pgrid-current.png — as it is today (3 tiles, Constellation full-width)
//   pgrid-b.png       — hub-style rows INSIDE the pearl panel (keeps its identity)
//   pgrid-c.png       — the panel dissolved into a plain hub section like Shop/Build
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

const AR = '<svg class="ar" style="color:#26221c" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h13"/><path d="M12 6.5 18.5 12 12 17.5"/></svg>';
function row(onclick, icon, title, sub) {
  return '<div class="act" data-shelf>'
    + '<div class="actrow"><span class="chip" style="background:#F5EFE2;border:1px solid #D8C285">' + icon + '</span>'
    + '<div class="tx"><div class="tt-row"><span class="tt">' + title + '</span>' + AR + '</div>'
    + '<span class="actsub" style="display:block">' + sub + '</span></div></div>'
    + '<div class="shelf"></div><div class="brk-row"><span class="brk l"></span><span class="brk r"></span></div>'
    + '</div>';
}
const IC_STAR = '<svg viewBox="0 0 24 24" fill="none" stroke="#26221c" stroke-width="1.5" stroke-linejoin="round" style="width:23px;height:23px"><path d="M12 2.4l2.4 6.7 7.1.2-5.6 4.3 2 6.8-5.9-4-5.9 4 2-6.8L2.5 9.3l7.1-.2z"/></svg>';
const IC_SIG = '<svg viewBox="0 0 24 24" fill="none" stroke="#26221c" stroke-width="1.6" stroke-linecap="round" style="width:23px;height:23px"><path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="1.9" fill="#E0B84C" stroke="#26221c" stroke-width="1"/><circle cx="15" cy="12" r="1.9" fill="#E0B84C" stroke="#26221c" stroke-width="1"/><circle cx="7" cy="17" r="1.9" fill="#E0B84C" stroke="#26221c" stroke-width="1"/></svg>';
const IC_CONST = '<svg viewBox="0 0 24 24" fill="none" stroke="#26221c" stroke-width="1.4" stroke-linecap="round" style="width:23px;height:23px"><path d="M4 17l5-6 4 3 7-9"/><circle cx="4" cy="17" r="1.6" fill="#E0B84C" stroke="none"/><circle cx="9" cy="11" r="1.6" fill="#E0B84C" stroke="none"/><circle cx="13" cy="14" r="1.6" fill="#E0B84C" stroke="none"/><circle cx="20" cy="5" r="1.6" fill="#E0B84C" stroke="none"/></svg>';

const ROWS = row('loadSaved()', IC_STAR, 'Style Portrait', 'Your portrait, whenever you want it')
  + row('showSignature()', IC_SIG, 'Style Signature', 'Your 12 style spectrums at a glance')
  + row('saveStyleCard()', IC_CONST, 'Style Constellation', 'Your shareable star-map keepsake');

const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.addInitScript(() => {
  localStorage.setItem('ss_data', JSON.stringify({ userName: 'Catherine', answers: [6,6,6,6,6,6,6,6,6,6,6,6], topArchNames: ['The Beautifully Balanced','Soft Glam','Pop of Color'], portrait: 'p', motto: 'm' }));
});
await page.route('**/.netlify/functions/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.show === 'function');
await page.evaluate(() => {
  show('s-photo-res');
  // the reveal curtain covers screenshots — jump straight to the done state
  const s = document.getElementById('s-photo-res');
  s.classList.remove('rv-compose', 'rv-open', 'rv-quick');
  s.classList.add('rv-done');
  document.body.classList.remove('curtain');
  document.querySelectorAll('.hm-entrance,.rv-doors,.rv-overlay').forEach(e => e.remove());
  const hub = document.getElementById('photoPortraitHub');
  hub.style.display = '';
  try { _renderCardThumb(); _renderSigThumb(); } catch (e) {}
});
await page.waitForTimeout(900);

async function shot(name) {
  await page.evaluate(() => {
    const h = document.getElementById('photoPortraitHub').getBoundingClientRect();
    window.scrollTo(0, h.top + window.scrollY - 70);
  });
  await page.waitForTimeout(250);
  const clip = await page.evaluate(() => {
    const h = document.getElementById('photoPortraitHub').getBoundingClientRect();
    return { x: 0, y: Math.max(0, h.top - 16), width: 390, height: Math.min(h.height + 40, 820) };
  });
  await page.screenshot({ path: path.join(ROOT, 'scratchpad', name), clip });
  console.log('saved ' + name);
}

// as built — the page IS option B now
await shot('pgrid-built.png');
if (errs.length) console.log('JS ERRORS: ' + errs.join(' | '));
await browser.close(); server.close();
