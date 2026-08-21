// Step 3 options: the share control, the per-item note, and her OPEN note.
// Also renders the shared page BLENDED (no group split) so the "it should
// arrive as she sees it" question can be judged with her eyes rather than
// argued about.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve('/home/user/stylestar-app'), PORT = 8975;
const css = fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const srv = http.createServer((q,r)=>{const p=decodeURIComponent(q.url.split('?')[0]),f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x')}
  r.writeHead(200,{'content-type':p.endsWith('.woff2')?'font/woff2':'text/html'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(PORT,r));

const HEART='M12 21s-8.5-5.4-8.5-11A4.7 4.7 0 0 1 12 7a4.7 4.7 0 0 1 8.5 3c0 5.6-8.5 11-8.5 11z';
const OPEN_NOTE = "I'm a size 8 in dresses and a medium in tops. I love green and anything with a print, and please nothing red! The FARM Rio dress is for the June wedding, so that one matters most.";
const ROWS=[
  {n:'Diane von Furstenberg Flag Scarf — Myrtle Berry',s:'Diane von Furstenberg',p:'$198',note:'Any color but the red one!',x:1},
  {n:'FARM Rio Pink Garden Terrace Maxi Dress',s:'FARM Rio',p:'$360',note:'Size 8. This is the one for the wedding in June.',x:1},
  {n:'White Linen Button-Front Blouse',s:'J.Crew',note:'Size medium, I like them a little oversized.',x:0},
  {n:'Tan Pointed Ballet Flats',s:'Nordstrom',note:'',x:0}
];
// Her own wishlist row: keeps its ✕, and gains the note affordance.
const ownRow = r => `<div class="wl-row"><span class="wl-del">&times;</span>
  <div class="wl-b"><span class="wl-nm">${r.n}</span>
    <span class="wl-st">${r.s}${r.p?`<span class="wl-pr">${r.p}</span>`:''}</span>
    ${r.note?`<span class="wl-note">${r.note}<span class="wl-ne">Edit</span></span>`
            :`<span class="wl-addnote">+ Add a note</span>`}</div>
  <a class="wl-go" href="#">${r.x?'Shop it':'Find it'} &rarr;</a></div>`;
// The shared row: no ✕, no note affordance, just her words.
const shRow = r => `<div class="wl-row">
  <div class="wl-b"><span class="wl-nm">${r.n}</span>
    <span class="wl-st">${r.s}${r.p?`<span class="wl-pr">${r.p}</span>`:''}</span>
    ${r.note?`<span class="wl-note">${r.note}</span>`:''}</div>
  <a class="wl-go" href="#">${r.x?'Shop it':'Find it'} &rarr;</a></div>`;

const BASE=`*{box-sizing:border-box;margin:0;padding:0}
 body{background:#1a1a1a;font-family:'Jost',sans-serif}
 .lbl{font:600 12px/1.4 'DM Sans',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#F2D889;padding:14px 16px 4px}
 .lbl span{display:block;font:400 12px/1.5 'DM Sans',sans-serif;letter-spacing:0;text-transform:none;color:#b9b2a4;margin-top:4px}
 .paper{background:#FBFAF7;border:1px solid #e7e0cf;margin:0 16px 18px;padding:16px 16px 22px}
 .wl-lead{font:400 13px/1.55 'Jost',sans-serif;color:#5a554c;background:#f7f6f3;border:1px solid #e4e1d9;padding:11px 14px;text-align:center}
 .wl-lead b{color:#26221c;font-weight:600}
 .wl-disc{font:400 11.5px/1.4 'DM Sans',sans-serif;color:#6e6e6e;text-align:center;margin:10px 0 0}
 .wl-card{background:#fff;border:1px solid #e7e0cf;padding:2px 12px 4px;margin-top:5px}
 .wl-row{display:flex;align-items:flex-start;gap:10px;padding:13px 0;border-top:1px solid #efe9dc}
 .wl-row:first-child{border-top:0}
 .wl-b{flex:1;min-width:0}
 .wl-nm{display:block;font:600 14px/1.35 'Jost',sans-serif;color:#26221c}
 .wl-st{display:block;font:500 10.5px/1.35 'Jost',sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#6b6355;margin-top:3px}
 .wl-pr{font:700 10.5px/1 'Jost',sans-serif;letter-spacing:.03em;color:#C8971E;margin-left:7px;text-transform:none}
 .wl-note{display:block;font:400 12.5px/1.5 'Jost',sans-serif;color:#5a554c;margin-top:7px;padding-left:9px;border-left:2px solid #E0B84C}
 .wl-ne{font:600 10.5px/1 'Jost',sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#8a6d20;margin-left:8px}
 .wl-addnote{display:inline-block;font:500 11.5px/1 'Jost',sans-serif;letter-spacing:.03em;color:#8a6d20;margin-top:8px}
 .wl-del{flex:0 0 auto;color:#a8a294;font-size:21px;line-height:1;padding:2px 3px}
 .wl-go{flex:0 0 auto;margin-top:2px;font:600 11px/1 'Jost',sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#fff;background:#1a1a1a;border-radius:999px;padding:9px 12px;text-decoration:none;white-space:nowrap}
 .shopall{display:block;width:100%;margin-top:14px;font:600 11.5px/1 'Jost',sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#fff;background:#1a1a1a;border:none;padding:14px 20px;text-align:center}
 /* the OPEN note — her paragraph for whoever is shopping from the list */
 .onote{margin-top:16px;background:#fff;border:1px solid #e7e0cf;padding:13px 13px 12px}
 .onote .ot{font:700 10.5px/1 'Jost',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#26221c;display:inline-block;position:relative;padding:0 2px 5px;margin-bottom:9px}
 .onote .ot::after{content:"";position:absolute;left:2px;right:-2px;bottom:0;height:2px;background:#D8A52E}
 .onote .ob{font:400 12.5px/1.6 'Jost',sans-serif;color:#5a554c;padding-left:9px;border-left:2px solid #E0B84C}
 .onote .ph{color:#8a8272}
 .onote .oe{display:inline-block;font:500 11.5px/1 'Jost',sans-serif;color:#8a6d20;margin-top:10px}
 /* the share card */
 .shcard{margin-top:16px;background:#F7F1E1;border:1px solid #e4d9bd;padding:15px 14px 14px;text-align:center}
 .shcard .st{font:400 17px/1.25 'DM Serif Display',Georgia,serif;color:#1f1d19;margin-bottom:5px}
 .shcard .ss{font:400 12.5px/1.55 'Jost',sans-serif;color:#5a554c;margin:0 auto 11px;max-width:290px}
 .shcard .sb{display:inline-block;font:600 11.5px/1 'Jost',sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#fff;background:#1a1a1a;border-radius:999px;padding:12px 20px;border:none}
 .linkbox{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #D8A52E;padding:9px 10px;margin:0 auto 9px;max-width:300px}
 .linkbox code{flex:1;min-width:0;font:400 11px/1.4 'DM Sans',monospace;color:#3a352c;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}
 .linkbox .cp{flex:0 0 auto;font:600 10.5px/1 'Jost',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:#1a1a1a;border-radius:999px;padding:8px 10px}
 .stopl{display:inline-block;font:500 11.5px/1 'Jost',sans-serif;color:#8a8272;text-decoration:underline;margin-top:2px}
 .tip{font:400 12px/1.55 'Jost',sans-serif;color:#5a554c;margin:0 auto 10px;max-width:290px}
 .tip b{color:#8a6d20}
 /* the shared page, for the shape comparison */
 .rodwrap{position:relative;height:8px;margin:0 -16px 0}
 .rod{position:absolute;inset:0;background:linear-gradient(180deg,#FBF1C2 0%,#EAC24E 40%,#C89A2C 74%,#8a6a17 100%)}
 .crown{position:relative;width:150px;height:150px;margin:5px auto 0}
 .crown svg.h{position:absolute;inset:0;width:100%;height:100%;fill:#FEF6D6;stroke:#C89A2C;stroke-width:.7}
 .crown .cn{position:absolute;left:50%;transform:translateX(-50%);top:35%;z-index:2;width:120px;text-align:center;font:400 24px/1.1 'Dancing Script',cursive;color:#1f1d19}
 .chain{position:absolute;left:calc(50% - 3px);top:-6px;width:6px;height:22px;background:repeating-linear-gradient(#C89A2C 0 5px,transparent 5px 8px)}
 .shlead{font:400 17px/1.5 'Lora',Georgia,serif;color:#3a352c;text-align:center;margin-top:2px}
 .gh{margin:22px 0 0;text-align:center}
 .gh span{display:inline-block;position:relative;padding:0 2px 6px;font:700 15px/1 'Jost',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#26221c}
 .gh span::after{content:"";position:absolute;left:2px;right:-2px;bottom:0;height:2px;background:#D8A52E}
 .foot{text-align:center;margin-top:22px}
 .f2{display:inline-block;font:600 11px/1 'Jost',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#1a1a1a;border:1px solid #D8A52E;padding:11px 16px}
 .legal{font:400 11px/1.5 'Jost',sans-serif;color:#8a8272;margin-top:14px}`;

const lead='<div class="wl-lead">Here&rsquo;s everything you saved, ready when you are. Tap <b>+ Add a note</b> on any piece to say your size, the color you want, or what it&rsquo;s for.</div>';
const ownList=`<div class="wl-card">${ROWS.map(ownRow).join('')}</div>`;
const openNoteEmpty=`<div class="onote"><div class="ot">A note for whoever is shopping</div>
  <div class="ob ph">Sizes, colors, an occasion &mdash; anything you&rsquo;d like them to know.</div>
  <span class="oe">+ Write a note</span></div>`;
const openNoteFull=`<div class="onote"><div class="ot">A note for whoever is shopping</div>
  <div class="ob">${OPEN_NOTE}</div><span class="oe">Edit</span></div>`;

const A=`<div class="paper">${lead}<div class="wl-disc">Some links may earn a commission.</div>${ownList}
 <button class="shopall">Shop my whole list &rarr;</button>
 ${openNoteEmpty}
 <div class="shcard"><div class="st">Share your wishlist</div>
   <div class="ss">Send one link to anyone who asks what you&rsquo;d love. They see your list, and nothing else.</div>
   <button class="sb">Get my link</button></div></div>`;

const B=`<div class="paper">${lead}<div class="wl-disc">Some links may earn a commission.</div>${ownList}
 <button class="shopall">Shop my whole list &rarr;</button>
 ${openNoteFull}
 <div class="shcard"><div class="st">Your list is shared</div>
   <div class="tip">Anyone with this link sees your list. It stays up to date as you add pieces.<br>
     <b>Add a note to anything you want them to get right.</b></div>
   <div class="linkbox"><code>stylestar.app/list/AbCd1234_-EfGh&hellip;</code><span class="cp">Copy</span></div>
   <span class="stopl">Stop sharing</span></div></div>`;

const C=`<div class="paper" style="padding:0 16px 22px">
 <div class="rodwrap"><div class="rod"></div></div>
 <div class="crown"><div class="chain"></div><svg class="h" viewBox="0 0 24 24"><path d="${HEART}"/></svg><div class="cn">Catherine</div></div>
 <div class="shlead">This is my shopping wishlist!</div>
 <div class="wl-disc">Some links may earn a commission.</div>
 <div class="wl-card" style="margin-top:6px">${ROWS.map(shRow).join('')}</div>
 <div class="onote"><div class="ot">A note from Catherine</div><div class="ob">${OPEN_NOTE}</div></div>
 <div class="foot"><span class="f2">Browse the Style Star Mall &rarr;</span>
   <div class="legal"><b>Style Star</b> &middot; Privacy &middot; Terms</div></div></div>`;

const OPTS=[['own','Your Wishlist, with the new parts','+ Add a note on every piece, an open note at the bottom, and the share card.',A],
            ['shared','Your Wishlist, once you have shared','Same page after tapping Get my link: the link, Copy, and Stop sharing.',B],
            ['asis','The shared page, ARRIVING AS SHE SEES IT','No two-group split. One list, same order, her note at the bottom where she wrote it.',C]];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [k,t,bl,html] of OPTS){
  const pg=await b.newPage({viewport:{width:390,height:1200},deviceScaleFactor:2});
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  fs.mkdirSync(ROOT+'/scratchpad/_mock',{recursive:true});
  fs.writeFileSync(`${ROOT}/scratchpad/_mock/s3${k}.html`,`<!doctype html><html><head><meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?x" rel="stylesheet"><style>${BASE}</style></head><body>
    <div class="lbl">${t}<span>${bl}</span></div>${html}</body></html>`);
  await pg.goto(`http://localhost:${PORT}/scratchpad/_mock/s3${k}.html`);
  await pg.waitForTimeout(1100); try{await pg.evaluate(()=>document.fonts.ready)}catch{}
  await pg.waitForTimeout(400);
  const h=await pg.evaluate(()=>document.body.scrollHeight);
  await pg.setViewportSize({width:390,height:Math.ceil(h)+8}); await pg.waitForTimeout(200);
  await pg.screenshot({path:`${ROOT}/scratchpad/step3-${k}.png`});
  await pg.close(); console.log(`  ${k}: ${h}px`);
}
await b.close(); srv.close();
