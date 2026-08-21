// B+C combined, in HER wording. Two variants: with and without the hanging
// gold heart ornament above the note.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';

const ROOT = path.resolve('/home/user/stylestar-app');
const PORT = 8953;
const css = fs.readFileSync(ROOT + '/scratchpad/fonts/gf.css', 'utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const srv = http.createServer((q, r) => {
  const p = decodeURIComponent(q.url.split('?')[0]); const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('x'); }
  r.writeHead(200, { 'content-type': p.endsWith('.woff2') ? 'font/woff2' : p.endsWith('.html') ? 'text/html' : 'text/plain' });
  fs.createReadStream(f).pipe(r);
});
await new Promise(r => srv.listen(PORT, r));

const HEART = 'M12 21s-8.5-5.4-8.5-11A4.7 4.7 0 0 1 12 7a4.7 4.7 0 0 1 8.5 3c0 5.6-8.5 11-8.5 11z';
const ROWS = [
  { kind:'x', name:'Diane von Furstenberg Flag Scarf — Myrtle Berry', store:'Diane von Furstenberg', price:'$198' },
  { kind:'x', name:'Black studded shoulder bag', store:'Valentino', price:'$1,890' },
  { kind:'x', name:'FARM Rio Pink Garden Terrace Maxi Dress', store:'FARM Rio', price:'$360' },
  { kind:'f', name:'White Linen Button-Front Blouse', store:'J.Crew' },
  { kind:'f', name:'Tan Pointed Ballet Flats', store:'Nordstrom' },
];
const row = r => `<div class="row"><div class="rb"><span class="nm">${r.name}</span>
  <span class="st">${r.store}${r.price ? `<span class="pr">${r.price}</span>` : ''}</span></div>
  <a class="go" href="#">${r.kind === 'x' ? 'Shop it' : 'Find it'} &rarr;</a></div>`;
const group = (label, kind) => `<div class="divwrap"><span class="hair"></span><span class="divlbl">${label}</span><span class="hair"></span></div>
  <div class="card">${ROWS.filter(r => r.kind === kind).map(row).join('')}</div>`;

// GOLD heart, not pink: pink is Catherine's own signature mark, and this page
// is signed by whoever shared it. Gold is the wishlist's own mark anyway.
const goldHeart = w => `<svg viewBox="0 0 24 24" style="width:${w}px;height:${w}px;display:inline-block;vertical-align:-2px;fill:#E0B84C;stroke:#C89A2C;stroke-width:.8;transform:rotate(12deg)"><path d="${HEART}"/></svg>`;

const BASE = `*{box-sizing:border-box;margin:0;padding:0}
  body{background:#1a1a1a;font-family:'Jost',sans-serif}
  .lbl{font:600 12px/1.4 'DM Sans',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#F2D889;padding:14px 16px 4px}
  .lbl span{display:block;font:400 12px/1.5 'DM Sans',sans-serif;letter-spacing:0;text-transform:none;color:#b9b2a4;margin-top:4px}
  .paper{background:#FBFAF7;border:1px solid #e7e0cf;margin:0 16px 18px;padding:0 16px 22px}
  .rod{position:relative;height:2px;background:#E0B84C;margin:0 -16px 0}
  .orn{position:relative;width:74px;height:74px;margin:0 auto}
  .orn .chain{position:absolute;left:calc(50% - 3px);top:-2px;width:6px;height:22px;
      background:repeating-linear-gradient(#C89A2C 0 5px,transparent 5px 8px)}
  .orn svg{position:absolute;left:50%;transform:translateX(-50%);top:18px;width:52px;height:52px;fill:#FEF6D6;stroke:#C89A2C;stroke-width:.7}
  .note{font:400 17px/1.5 'Lora',Georgia,serif;color:#3a352c;text-align:center}
  .sig{font:400 26px/1 'Dancing Script',cursive;color:#1f1d19;margin-top:9px;text-align:center}
  .disc{font:400 11.5px/1.4 'DM Sans',sans-serif;color:#6e6e6e;text-align:center;margin:15px 0 0}
  .card{background:#fff;border:1px solid #e7e0cf;padding:2px 12px 4px;margin-top:5px}
  .row{display:flex;align-items:center;gap:10px;padding:13px 0;border-top:1px solid #efe9dc}
  .row:first-child{border-top:0}
  .rb{flex:1;min-width:0}
  .nm{display:block;font:600 14px/1.35 'Jost',sans-serif;color:#26221c}
  .st{display:block;font:500 10.5px/1.35 'Jost',sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#8a8272;margin-top:3px}
  .pr{font:700 10.5px/1 'Jost',sans-serif;letter-spacing:.03em;color:#C8971E;margin-left:7px;text-transform:none}
  .go{flex:0 0 auto;font:600 11px/1 'Jost',sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#fff;
      background:#1a1a1a;border-radius:999px;padding:9px 12px;text-decoration:none;white-space:nowrap}
  .divwrap{display:flex;align-items:center;gap:9px;margin:17px 0 2px}
  .hair{flex:1;height:1px;background:#dcd3bd}
  .divlbl{font:600 9.5px/1 'Jost',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#8a6d20;white-space:nowrap}
  .foot{text-align:center;margin-top:20px}
  .foot .f1{font:400 11.5px/1.5 'Jost',sans-serif;color:#8a8272}
  .foot .f1 b{color:#3a352c;font-weight:600}
  .foot .f2{display:inline-block;margin-top:9px;font:600 11px/1 'Jost',sans-serif;letter-spacing:.06em;
      text-transform:uppercase;color:#1a1a1a;border:1px solid #D8A52E;padding:9px 14px;text-decoration:none}`;

const page = (orn, note, sig) => `<div class="paper"><div class="rod"></div>
  ${orn ? `<div class="orn"><div class="chain"></div><svg viewBox="0 0 24 24"><path d="${HEART}"/></svg></div>` : '<div style="height:22px"></div>'}
  <div class="note">${note}</div>
  ${sig ? `<div class="sig">${sig} ${goldHeart(16)}</div>` : ''}
  <div class="disc">Some links may earn a commission.</div>
  ${group('Buy exactly this','x')}
  ${group('Anything like this','f')}
  <div class="foot"><div class="f1">Made with <b>Style Star</b></div>
    <a class="f2" href="#">Take the free style quiz &rarr;</a></div></div>`;

const OPTS = [
  ['orn',  'With the hanging heart', 'The wishlist&rsquo;s own ornament, wordless, above her line.',
   page(true, 'This is my shopping wishlist!', 'Catherine')],
  ['bare', 'Her line alone', 'No ornament. Quieter, and her words land first.',
   page(false, 'This is my shopping wishlist!', 'Catherine')],
  ['noname', 'No name saved', 'The fallback, for a woman who never gave her first name.',
   page(true, 'This is my Style Star shopping wishlist!', '')],
];

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const [k, title, blurb, html] of OPTS) {
  const pg = await b.newPage({ viewport: { width: 390, height: 1200 }, deviceScaleFactor: 2 });
  await pg.route('**/fonts.googleapis.com/**', r => r.fulfill({ status:200, contentType:'text/css', body: css }));
  fs.mkdirSync(ROOT + '/scratchpad/_mock', { recursive: true });
  fs.writeFileSync(`${ROOT}/scratchpad/_mock/b${k}.html`, `<!doctype html><html><head><meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?x" rel="stylesheet"><style>${BASE}</style></head><body>
    <div class="lbl">${title}<span>${blurb}</span></div>${html}</body></html>`);
  await pg.goto(`http://localhost:${PORT}/scratchpad/_mock/b${k}.html`);
  await pg.waitForTimeout(1100);
  try { await pg.evaluate(() => document.fonts.ready); } catch {}
  await pg.waitForTimeout(400);
  if (k === 'orn') console.log(await pg.evaluate(() => {
    const mk = ff => { const s=document.createElement('span'); s.textContent='Catherine';
      s.style.cssText=`position:absolute;visibility:hidden;font:600 26px ${ff}`; document.body.appendChild(s);
      const x=s.getBoundingClientRect().width; s.remove(); return Math.round(x*10)/10; };
    return { realFontsLoaded: mk("'Dancing Script',cursive") !== mk('serif') };
  }));
  const h = await pg.evaluate(() => document.body.scrollHeight);
  await pg.setViewportSize({ width: 390, height: Math.ceil(h) + 10 });
  await pg.waitForTimeout(200);
  await pg.screenshot({ path: `${ROOT}/scratchpad/sharebuilt-${k}.png` });
  await pg.close();
  console.log(`  rendered ${k} (${h}px)`);
}
await b.close(); srv.close();
