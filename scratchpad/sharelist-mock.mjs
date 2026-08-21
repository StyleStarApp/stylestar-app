// Renders three answers to "what does a SHARED wishlist page look like".
// id-scoped CSS per option (the 2026-07-26 lesson: .v .x matches every block).
// Real fonts served locally (Chromium here cannot reach fonts.googleapis.com).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';

const ROOT = path.resolve('/home/user/stylestar-app');
const PORT = 8952;
const css = fs.readFileSync(ROOT + '/scratchpad/fonts/gf.css', 'utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(http://localhost:${PORT}/scratchpad/fonts/$1)`);

const srv = http.createServer((q, r) => {
  const p = decodeURIComponent(q.url.split('?')[0]);
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': p.endsWith('.woff2') ? 'font/woff2' : p.endsWith('.html') ? 'text/html' : 'text/plain', 'access-control-allow-origin': '*' });
  fs.createReadStream(f).pipe(r);
});
await new Promise(r => srv.listen(PORT, r));

const HEART = 'M12 21s-8.5-5.4-8.5-11A4.7 4.7 0 0 1 12 7a4.7 4.7 0 0 1 8.5 3c0 5.6-8.5 11-8.5 11z';

// A believable list: two exact-link rows with prices, two rebuilt searches,
// one of Cath's own Edit picks.
const ROWS = [
  { kind:'pick',  name:'Diane von Furstenberg Flag Scarf — Myrtle Berry', store:'Diane von Furstenberg', price:'$198' },
  { kind:'own',   name:'Black studded shoulder bag',       store:'Valentino',  price:'$1,890' },
  { kind:'exact', name:'FARM Rio Pink Garden Terrace Maxi Dress', store:'FARM Rio', price:'$360' },
  { kind:'find',  name:'White Linen Button-Front Blouse',  store:'J.Crew' },
  { kind:'find',  name:'Tan Pointed Ballet Flats',         store:'Nordstrom' },
];

const heartSvg = (w,fill,stroke,tilt) =>
  `<svg viewBox="0 0 24 24" style="width:${w}px;height:${w}px;display:block;flex:0 0 auto;fill:${fill};stroke:${stroke};stroke-width:1;transform:rotate(${tilt}deg)"><path d="${HEART}"/></svg>`;

const row = (r, opts={}) => {
  const exact = r.kind !== 'find';
  const badge = r.kind === 'pick'
    ? `<span class="b-pick">${heartSvg(9,'#F49AC1','none',-11)}Catherine&rsquo;s pick</span>`
    : (r.kind === 'own' && opts.ownBadge !== false
       ? `<span class="b-own">${heartSvg(9,'#E0B84C','none',-11)}Her pick</span>` : '');
  return `<div class="row">
    <div class="rb">${badge}<span class="nm">${r.name}</span>
      <span class="st">${r.store}${exact && r.price ? `<span class="pr">${r.price}</span>` : ''}</span></div>
    <a class="go" href="#">${exact ? 'Shop it' : 'Find it'} &rarr;</a>
  </div>`;
};

const BASE = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#1a1a1a;font-family:'Jost',sans-serif}
  .lbl{font:600 12px/1.4 'DM Sans',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#F2D889;padding:14px 16px 4px}
  .lbl span{display:block;font:400 12px/1.5 'DM Sans',sans-serif;letter-spacing:0;text-transform:none;color:#b9b2a4;margin-top:4px}
  .paper{background:#FBFAF7;border:1px solid #e7e0cf;margin:0 16px 18px;padding:20px 16px 22px}
  .rod{position:relative;height:2px;background:#E0B84C;margin:0 -16px 0}
  .crown{position:relative;width:150px;height:150px;margin:-6px auto 0}
  .crown svg.h{position:absolute;inset:0;width:100%;height:100%;display:block;fill:#FEF6D6;stroke:#C89A2C;stroke-width:.6}
  .ct{position:absolute;left:50%;transform:translateX(-50%);top:31%;z-index:2;text-align:center;
      font:400 20px/1.16 'DM Serif Display',Georgia,serif;color:#1a1a1a}
  .chain{position:absolute;left:calc(50% - 3px);bottom:calc(100% - 46px);width:6px;height:48px;
      background:repeating-linear-gradient(#C89A2C 0 5px,transparent 5px 8px)}
  .lead{font:400 13px/1.55 'Jost',sans-serif;color:#5a554c;background:#f7f6f3;border:1px solid #e4e1d9;
      padding:11px 13px;text-align:center;margin-top:2px}
  .lead b{color:#26221c;font-weight:600}
  .disc{font:400 11.5px/1.4 'DM Sans',sans-serif;color:#6e6e6e;text-align:center;margin:12px 0 0}
  .card{background:#fff;border:1px solid #e7e0cf;padding:2px 12px 4px;margin-top:5px}
  .row{display:flex;align-items:center;gap:10px;padding:13px 0;border-top:1px solid #efe9dc}
  .row:first-child{border-top:0}
  .rb{flex:1;min-width:0}
  .nm{display:block;font:600 14px/1.35 'Jost',sans-serif;color:#26221c}
  .st{display:block;font:500 10.5px/1.35 'Jost',sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#8a8272;margin-top:3px}
  .pr{font:700 10.5px/1 'Jost',sans-serif;letter-spacing:.03em;color:#C8971E;margin-left:7px;text-transform:none}
  .go{flex:0 0 auto;font:600 11px/1 'Jost',sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#fff;
      background:#1a1a1a;border-radius:999px;padding:9px 12px;text-decoration:none;white-space:nowrap}
  .b-pick,.b-own{display:inline-flex;align-items:center;gap:4px;font:700 8.5px/1 'Jost',sans-serif;letter-spacing:.09em;
      text-transform:uppercase;background:#fff;border-radius:999px;padding:3px 7px 3px 6px;margin-bottom:5px}
  .b-pick{color:#087E8C;border:1px solid #F49AC1}
  .b-own{color:#8a6d20;border:1px solid #E0B84C}
  .foot{text-align:center;font:400 11.5px/1.5 'Jost',sans-serif;color:#8a8272;margin-top:18px}
  .foot a{color:#8a6d20;font-weight:600;text-decoration:none}
  .divwrap{display:flex;align-items:center;gap:9px;margin:16px 0 2px}
  .hair{flex:1;height:1px;background:#dcd3bd}
  .divlbl{font:600 9.5px/1 'Jost',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#8a6d20;white-space:nowrap}
  .sig{font:400 25px/1 'Dancing Script',cursive;color:#1f1d19;margin-top:14px;text-align:center}
  .note{font:400 15.5px/1.6 'Lora',Georgia,serif;color:#4a463e;text-align:center;margin:2px 0 0}
`;

const crown = (title) => `<div class="rod"></div><div class="crown">
  <div class="chain"></div>
  <svg class="h" viewBox="0 0 24 24"><path d="${HEART}"/></svg>
  <div class="ct">${title}</div></div>`;

const A = `<div class="paper">
  ${crown('Catherine&rsquo;s<br>Wishlist')}
  <div class="lead">These are the pieces <b>Catherine</b> is wishing for. Tap any one to see it.</div>
  <div class="disc">Some links may earn a commission.</div>
  <div class="card">${ROWS.map(r=>row(r)).join('')}</div>
  <div class="foot">Made with <a href="#">Style Star</a></div>
</div>`;

const B = `<div class="paper">
  ${crown('Catherine&rsquo;s<br>Wishlist')}
  <div class="lead">These are the pieces <b>Catherine</b> is wishing for.</div>
  <div class="disc">Some links may earn a commission.</div>
  <div class="divwrap"><span class="hair"></span><span class="divlbl">Exactly this</span><span class="hair"></span></div>
  <div class="card">${ROWS.filter(r=>r.kind!=='find').map(r=>row(r,{ownBadge:false})).join('')}</div>
  <div class="divwrap"><span class="hair"></span><span class="divlbl">Something like this</span><span class="hair"></span></div>
  <div class="card">${ROWS.filter(r=>r.kind==='find').map(r=>row(r)).join('')}</div>
  <div class="foot">Made with <a href="#">Style Star</a></div>
</div>`;

const C = `<div class="paper">
  <div class="rod"></div>
  <div style="height:16px"></div>
  <div class="note">A few things I&rsquo;m wishing for.<br>Every one of them is a yes from me.</div>
  <div class="sig">Catherine ${'<span style="display:inline-block;width:15px;height:15px;vertical-align:-2px">'+heartSvg(15,'#F49AC1','none',12)+'</span>'}</div>
  <div class="disc">Some links may earn a commission.</div>
  <div class="card">${ROWS.map(r=>row(r)).join('')}</div>
  <div class="foot">Made with <a href="#">Style Star</a></div>
</div>`;

const OPTS = [
  ['A', 'The list, shared', 'Exactly her wishlist, read-only. Warm, simple, nothing new to learn.', A],
  ['B', 'The registry',     'The two kinds of row split apart — exact pieces vs. searches. Most honest about what each tap does.', B],
  ['C', 'Her note',         'Opens in her own voice and handwriting. Least app-like, most giftable.', C],
];

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const [k, title, blurb, html] of OPTS) {
  const pg = await b.newPage({ viewport: { width: 390, height: 1200 }, deviceScaleFactor: 2 });
  await pg.route('**/fonts.googleapis.com/**', r => r.fulfill({ status:200, contentType:'text/css', body: css }));
  const page = `<!doctype html><html><head><meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?x" rel="stylesheet">
    <style>${BASE}</style></head><body>
    <div class="lbl">Option ${k} &middot; ${title}<span>${blurb}</span></div>
    ${html}</body></html>`;
  fs.mkdirSync(ROOT + '/scratchpad/_mock', { recursive: true });
  fs.writeFileSync(`${ROOT}/scratchpad/_mock/${k}.html`, page);
  await pg.goto(`http://localhost:${PORT}/scratchpad/_mock/${k}.html`);
  await pg.waitForTimeout(1200);
  try { await pg.evaluate(() => document.fonts.ready); } catch {}
  await pg.waitForTimeout(400);
  if (k === 'C') console.log(await pg.evaluate(() => {
    const mk = ff => { const s=document.createElement('span'); s.textContent='Catherine';
      s.style.cssText=`position:absolute;visibility:hidden;font:600 26px ${ff}`; document.body.appendChild(s);
      const x=s.getBoundingClientRect().width; s.remove(); return Math.round(x*10)/10; };
    return { realFontsLoaded: mk("'Dancing Script',cursive") !== mk('serif'),
             faces: [...new Set([...document.fonts].map(f=>f.family))].sort() };
  }));
  const h = await pg.evaluate(() => document.body.scrollHeight);
  await pg.setViewportSize({ width: 390, height: Math.ceil(h) + 10 });
  await pg.waitForTimeout(200);
  await pg.screenshot({ path: `${ROOT}/scratchpad/sharelist-${k}.png` });
  await pg.close();
  console.log(`  rendered option ${k} (${h}px)`);
}
await b.close(); srv.close();
