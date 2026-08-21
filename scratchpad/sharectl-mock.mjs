// Step 3 options: the share control on Your Wishlist, and the note field.
// id-scoped CSS per option; real fonts served locally.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve('/home/user/stylestar-app'), PORT = 8965;
const css = fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const srv = http.createServer((q,r)=>{const p=decodeURIComponent(q.url.split('?')[0]),f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x')}
  r.writeHead(200,{'content-type':p.endsWith('.woff2')?'font/woff2':'text/html'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(PORT,r));

const HEART='M12 21s-8.5-5.4-8.5-11A4.7 4.7 0 0 1 12 7a4.7 4.7 0 0 1 8.5 3c0 5.6-8.5 11-8.5 11z';
const ROWS=[
  {n:'Diane von Furstenberg Flag Scarf — Myrtle Berry',s:'Diane von Furstenberg',p:'$198',
   note:'Any colour but the red one!',x:1},
  {n:'FARM Rio Pink Garden Terrace Maxi Dress',s:'FARM Rio',p:'$360',
   note:'Size 8. This is the one for the wedding in June.',x:1},
  {n:'White Linen Button-Front Blouse',s:'J.Crew',note:'',x:0}
];
const row = r => `<div class="wl-row">
  <span class="wl-del">&times;</span>
  <div class="wl-b"><span class="wl-nm">${r.n}</span>
    <span class="wl-st">${r.s}${r.p?`<span class="wl-pr">${r.p}</span>`:''}</span>
    ${r.note?`<span class="wl-note">${r.note}<span class="wl-noteedit">Edit</span></span>`
            :`<span class="wl-addnote">+ Add a note</span>`}</div>
  <a class="wl-go" href="#">${r.x?'Shop it':'Find it'} &rarr;</a></div>`;
const CARD = `<div class="wl-card">${ROWS.map(row).join('')}</div>`;

const BASE=`*{box-sizing:border-box;margin:0;padding:0}
 body{background:#1a1a1a;font-family:'Jost',sans-serif}
 .lbl{font:600 12px/1.4 'DM Sans',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#F2D889;padding:14px 16px 4px}
 .lbl span{display:block;font:400 12px/1.5 'DM Sans',sans-serif;letter-spacing:0;text-transform:none;color:#b9b2a4;margin-top:4px}
 .paper{background:#FBFAF7;border:1px solid #e7e0cf;margin:0 16px 18px;padding:16px 16px 22px}
 .wl-lead{font:400 13px/1.55 'Jost',sans-serif;color:#5a554c;background:#f7f6f3;border:1px solid #e4e1d9;padding:11px 14px;text-align:center}
 .wl-disc{font:400 11.5px/1.4 'DM Sans',sans-serif;color:#6e6e6e;text-align:center;margin:12px 0 0}
 .wl-card{background:#fff;border:1px solid #e7e0cf;padding:2px 12px 4px;margin-top:5px}
 .wl-row{display:flex;align-items:flex-start;gap:10px;padding:13px 0;border-top:1px solid #efe9dc}
 .wl-row:first-child{border-top:0}
 .wl-b{flex:1;min-width:0}
 .wl-nm{display:block;font:600 14px/1.35 'Jost',sans-serif;color:#26221c}
 .wl-st{display:block;font:500 10.5px/1.35 'Jost',sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#6b6355;margin-top:3px}
 .wl-pr{font:700 10.5px/1 'Jost',sans-serif;letter-spacing:.03em;color:#C8971E;margin-left:7px;text-transform:none}
 .wl-note{display:block;font:400 12.5px/1.5 'Jost',sans-serif;color:#5a554c;margin-top:7px;padding-left:9px;border-left:2px solid #E0B84C}
 .wl-noteedit{font:600 10.5px/1 'Jost',sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#8a6d20;margin-left:8px;white-space:nowrap}
 .wl-addnote{display:inline-block;font:500 11.5px/1 'Jost',sans-serif;letter-spacing:.03em;color:#8a6d20;margin-top:8px}
 .wl-del{flex:0 0 auto;color:#a8a294;font-size:21px;line-height:1;padding:2px 3px}
 .wl-go{flex:0 0 auto;margin-top:2px;font:600 11px/1 'Jost',sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#fff;background:#1a1a1a;border-radius:999px;padding:9px 12px;text-decoration:none;white-space:nowrap}
 .shopall{display:block;width:100%;margin-top:14px;font:600 11.5px/1 'Jost',sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#fff;background:#1a1a1a;border:none;padding:14px 20px;text-align:center}
 /* A — its own card, the "Keep your wishlist safe" language */
 .shcard{margin-top:16px;background:#F7F1E1;border:1px solid #e4d9bd;padding:15px 14px 14px;text-align:center}
 .shcard .st{font:400 17px/1.25 'DM Serif Display',Georgia,serif;color:#1f1d19;margin-bottom:5px}
 .shcard .ss{font:400 12.5px/1.55 'Jost',sans-serif;color:#5a554c;margin:0 auto 11px;max-width:290px}
 .shcard .sb{display:inline-block;font:600 11.5px/1 'Jost',sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#fff;background:#1a1a1a;border-radius:999px;padding:12px 20px;border:none}
 /* B — paired with Shop my whole list */
 .pairwrap{display:flex;gap:8px;margin-top:14px}
 .pairwrap .shopall{margin-top:0;flex:1}
 .pairbtn{flex:0 0 auto;font:600 11.5px/1 'Jost',sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#1a1a1a;background:#fff;border:1px solid #D8A52E;padding:14px 16px}
 /* the shared state */
 .linkbox{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #D8A52E;padding:10px 11px;margin:0 auto 10px;max-width:300px}
 .linkbox code{flex:1;min-width:0;font:400 11.5px/1.4 'DM Sans',monospace;color:#3a352c;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}
 .linkbox .cp{flex:0 0 auto;font:600 10.5px/1 'Jost',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:#1a1a1a;border-radius:999px;padding:8px 10px}
 .stopl{display:inline-block;font:500 11.5px/1 'Jost',sans-serif;color:#8a8272;text-decoration:underline;margin-top:2px}`;

const lead = '<div class="wl-lead">Here&rsquo;s everything you saved, ready when you are.</div>';
const A = `<div class="paper">${lead}<div class="wl-disc">Some links may earn a commission.</div>${CARD}
  <button class="shopall">Shop my whole list &rarr;</button>
  <div class="shcard"><div class="st">Share your wishlist</div>
    <div class="ss">Send one link to anyone who asks what you&rsquo;d love. They see your list, and nothing else.</div>
    <button class="sb">Get my link</button></div></div>`;
const B = `<div class="paper">${lead}<div class="wl-disc">Some links may earn a commission.</div>${CARD}
  <div class="pairwrap"><button class="shopall">Shop my whole list &rarr;</button>
    <button class="pairbtn">Share</button></div></div>`;
const C = `<div class="paper">${lead}<div class="wl-disc">Some links may earn a commission.</div>${CARD}
  <button class="shopall">Shop my whole list &rarr;</button>
  <div class="shcard"><div class="st">Your list is shared</div>
    <div class="ss">Anyone with this link can see your list. It stays up to date as you add pieces.</div>
    <div class="linkbox"><code>stylestar.app/list/AbCd1234_-EfGh…</code><span class="cp">Copy</span></div>
    <span class="stopl">Stop sharing</span></div></div>`;

const OPTS=[['A','A card of its own','Sits under Shop my whole list, in the same language as the "keep your wishlist safe" card.',A],
            ['B','Paired with Shop','Share sits beside Shop my whole list — the two things you can do with the WHOLE list.',B],
            ['C','After you share','What A becomes once the link exists. Same card, three new pieces.',C]];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [k,t,bl,html] of OPTS){
  const pg=await b.newPage({viewport:{width:390,height:1200},deviceScaleFactor:2});
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  fs.mkdirSync(ROOT+'/scratchpad/_mock',{recursive:true});
  fs.writeFileSync(`${ROOT}/scratchpad/_mock/sc${k}.html`,`<!doctype html><html><head><meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?x" rel="stylesheet"><style>${BASE}</style></head><body>
    <div class="lbl">${t}<span>${bl}</span></div>${html}</body></html>`);
  await pg.goto(`http://localhost:${PORT}/scratchpad/_mock/sc${k}.html`);
  await pg.waitForTimeout(1100); try{await pg.evaluate(()=>document.fonts.ready)}catch{}
  await pg.waitForTimeout(400);
  const h=await pg.evaluate(()=>document.body.scrollHeight);
  await pg.setViewportSize({width:390,height:Math.ceil(h)+8}); await pg.waitForTimeout(200);
  await pg.screenshot({path:`${ROOT}/scratchpad/sharectl-${k}.png`});
  await pg.close(); console.log(`  ${k}: ${h}px`);
}
await b.close(); srv.close();
