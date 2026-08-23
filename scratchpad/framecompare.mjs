/* Lays the frame variants out as ONE tall labelled image for her phone.
   ⚠️ Each row shows the whole card AND a zoomed corner: the whole card is what
   shows whether the metal is even on all four sides (her actual complaint), and
   the corner is where the mitre and the bleed are legible. Neither alone
   answers the question. */
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const V=[
  ['0_live','LIVE TODAY','the diagonal sweep, and a white margin outside the frame'],
  ['A_bleedOnly','A — bleed only','same metal, white margin gone. Is the bleed most of it?'],
  ['B_flat','B — one flat silver','no shine at all. Symmetrical beyond argument.'],
  ['C_mirror','C — mirror bevel','one metal, mitred corners, bright out / shadow in'],
  ['D_softer','D — softer bevel','the same profile, gentler. Brushed, not chrome.']
];
const rows=V.map(([f,t,s])=>`
  <div class="row">
    <div class="lab"><b>${t}</b><span>${s}</span></div>
    <div class="pics">
      <img class="full" src="data:image/png;base64,${fs.readFileSync('scratchpad/frame-'+f+'.png').toString('base64')}">
      <div class="zoomwrap"><img class="zoom" src="data:image/png;base64,${fs.readFileSync('scratchpad/frame-'+f+'.png').toString('base64')}"></div>
    </div>
  </div>`).join('');
const html=`<!doctype html><meta charset=utf-8><style>
 body{margin:0;background:#111;font-family:system-ui,sans-serif;padding:16px 14px 22px}
 .row{margin-bottom:20px}
 .lab{color:#fff;margin:0 0 7px 2px}
 .lab b{font-size:19px;letter-spacing:.02em}
 .lab span{display:block;color:#a9a49b;font-size:14px;margin-top:2px}
 .pics{display:flex;gap:12px;align-items:flex-start}
 .full{width:250px;height:auto;display:block;box-shadow:0 0 0 1px #333}
 /* the zoom is the same file, scaled up and clipped to its top-left corner */
 .zoomwrap{width:250px;height:312px;overflow:hidden;position:relative;box-shadow:0 0 0 1px #333}
 .zoom{position:absolute;top:0;left:0;width:1080px;height:1350px;transform:scale(.63);transform-origin:0 0}
 .hd{color:#f0d98a;font-size:15px;letter-spacing:.14em;text-transform:uppercase;margin:0 0 14px 2px}
 .sub{color:#8d8880;font-size:13px;margin:-10px 0 16px 2px}
</style>
<div class="hd">Silver frame — pick one</div>
<div class="sub">Left: the whole card. Right: the top-left corner, zoomed.</div>
${rows}`;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await (await b.newContext({viewport:{width:560,height:900},deviceScaleFactor:2})).newPage();
await p.setContent(html);await p.waitForTimeout(500);
await p.screenshot({path:'scratchpad/frame-compare.png',fullPage:true});
await b.close();
console.log('ok');
