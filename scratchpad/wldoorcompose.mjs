import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const P=[
 ['wldoor-CURRENT.png',    'NOW  — two pieces saved, and the screen says nothing at all'],
 ['wldoor-A_caption.png',  'A  — quiet caption   (the "Showing bags" voice)'],
 ['wldoor-B_papervoice.png','B  — your paper voice, same weight as the Tip it replaces'],
 ['wldoor-C_chip.png',     'C  — a boxed door   (the wardrobe "Ideas" chip)'],
];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const pg=await b.newPage({viewport:{width:1200,height:800}});
const imgs=P.map(([f,l])=>['data:image/png;base64,'+fs.readFileSync('scratchpad/'+f).toString('base64'),l]);
const H=await pg.evaluate(async (imgs)=>{
  const CROP=1250, LAB=100, W=1125;
  const c=document.createElement('canvas'); c.width=W; c.height=imgs.length*(CROP+LAB);
  const x=c.getContext('2d'); x.fillStyle='#141414'; x.fillRect(0,0,c.width,c.height);
  let y=0;
  for(const [src,label] of imgs){
    const im=new Image(); im.src=src; await im.decode();
    x.fillStyle='#141414'; x.fillRect(0,y,W,LAB);
    x.fillStyle='#F2D889'; x.font='600 34px system-ui,sans-serif'; x.textBaseline='middle';
    x.fillText(label, 26, y+LAB/2);
    x.drawImage(im, 0,0,im.width,Math.min(CROP,im.height), 0,y+LAB,W,Math.min(CROP,im.height));
    y+=CROP+LAB;
  }
  return c.toDataURL('image/png');
}, imgs);
fs.writeFileSync('scratchpad/wl-door-options.png', Buffer.from(H.split(',')[1],'base64'));
await b.close(); console.log('scratchpad/wl-door-options.png');
