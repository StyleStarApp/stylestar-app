// One tall labelled image beats five crops (the 2026-07-26 lesson).
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const P=[
 ['askopt-A_current.png',  'NOW  — wraps on your phone (7px of margin, Chromium holds it, Safari breaks it)'],
 ['askopt-B_nochevron.png','B  — the chevron goes when closed   (27px margin)'],
 ['askopt-C_font165.png',  'C  — everything kept, type 17.5 → 16.5px   (20px margin)'],
 ['askopt-D_trimAll.png',  'D  — everything kept, marks + type trimmed a touch   (21px margin)'],
 ['askopt-E_shortword.png','E  — "Something specific?"  star + chevron both stay   (93px margin)'],
];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const pg=await b.newPage({viewport:{width:1200,height:800}});
const imgs=P.map(([f,l])=>['data:image/png;base64,'+fs.readFileSync('scratchpad/'+f).toString('base64'),l]);
const H=await pg.evaluate(async (imgs)=>{
  const CROP=760, LAB=96, W=1125;
  const c=document.createElement('canvas');
  c.width=W; c.height=imgs.length*(CROP+LAB);
  const x=c.getContext('2d');
  x.fillStyle='#141414'; x.fillRect(0,0,c.width,c.height);
  let y=0;
  for(const [src,label] of imgs){
    const im=new Image(); im.src=src; await im.decode();
    x.fillStyle='#141414'; x.fillRect(0,y,W,LAB);
    x.fillStyle='#F2D889'; x.font='600 34px system-ui,sans-serif'; x.textBaseline='middle';
    x.fillText(label, 26, y+LAB/2);
    x.drawImage(im, 0,0,W,CROP, 0,y+LAB,W,CROP);
    y+=CROP+LAB;
  }
  return c.toDataURL('image/png');
}, imgs);
fs.writeFileSync('scratchpad/ask-options.png', Buffer.from(H.split(',')[1],'base64'));
await b.close();
console.log('scratchpad/ask-options.png');
