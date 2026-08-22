// THE WAY BACK, rendered. Two testers lost their place after tapping a product
// link. The app already knows what they lost -- the chat is persisted, and the
// six pieces could be -- and says neither. Three ways to say it, in the real
// whisper voice, on the real Welcome Back screen.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';import path from 'path';
const ROOT=path.resolve('.');
const HTML=fs.readFileSync(ROOT+'/index.html','utf8');
const GF=fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8');
const srv=http.createServer((q,res)=>{const u=q.url.split('?')[0];
  if(u.startsWith('/fonts/')){const f=ROOT+'/scratchpad'+u;if(fs.existsSync(f)){res.writeHead(200,{'Content-Type':'font/woff2'});return res.end(fs.readFileSync(f));}}
  if(u==='/gf.css'){res.writeHead(200,{'Content-Type':'text/css'});return res.end(GF);}
  res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);});
await new Promise(r=>srv.listen(8956,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});

const H='<svg class="wbn-h" viewBox="0 0 24 24" fill="#F49AC1" aria-hidden="true"><path d="M12 21.6 C10.7 18.9 8.2 17 5.9 14.7 C3.6 12.4 2 10.4 2 7.7 C2 4.8 4.2 2.7 7 2.7 C9.5 2.7 11.3 4.6 12 7.1 C12.7 4.6 14.5 2.7 17 2.7 C19.8 2.7 22 4.8 22 7.7 C22 10.4 20.4 12.4 18.1 14.7 C15.8 17 13.3 18.9 12 21.6 Z"/></svg>';
const OPTS={
 CURRENT:null,
 A_chat:'Your conversation with <b>your stylist</b> is right where you left it '+H,
 B_pieces:'<b>Shop your style</b> is right where you left it, with the same pieces waiting '+H,
 C_both:'Pick up where you left off, your <b>pieces</b> and your <b>conversation</b> are both still here '+H,
};
for(const [name,html] of Object.entries(OPTS)){
  const ctx=await b.newContext({viewport:{width:375,height:1100},deviceScaleFactor:3});
  const pg=await ctx.newPage();
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:GF}));
  await pg.addInitScript(()=>{
    localStorage.setItem('ss_data',JSON.stringify({userName:'Kathy',answers:[8,7,6,5,9,4,7,6,8,5,7,6],
      topArchNames:['Modern Glam'],portrait:'P.',motto:'P.'}));
    localStorage.setItem('ss_prefs',JSON.stringify({sizes:{},colorsLove:[],neverWear:[],neverPatterns:[],neverOther:''}));
    // a woman who has been around: refined, seen the places, and has a chat going
    ['ss_seen_wardrobe','ss_seen_shopstyle','ss_seen_wishlist','ss_trending_seen'].forEach(k=>localStorage.setItem(k,'1'));
    localStorage.setItem('ss_chat',JSON.stringify([{role:'user',text:'What should I wear to a formal wedding?'},
      {role:'assistant',text:'A long column dress from Reformation would be lovely.'}]));
    localStorage.setItem('ss_hearttip','1');
  });
  await pg.goto('http://localhost:8956/',{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2600);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  if(html)await pg.evaluate(h=>{
    const n=document.getElementById('wbNext');
    n.classList.add('on');
    const t=n.querySelector('.wbn-t'); t.innerHTML=h;
  },html);
  await pg.waitForTimeout(400);
  const m=await pg.evaluate(()=>{const n=document.getElementById('wbNext');
    const t=n.querySelector('.wbn-t');
    return {shown:n.classList.contains('on'),
      h:Math.round(t.getBoundingClientRect().height),
      lines:Math.round(t.getBoundingClientRect().height/(14*1.6)),
      says:t.textContent.replace(/\s+/g,' ').trim().slice(0,80)};});
  console.log(name.padEnd(10),JSON.stringify(m));
  await pg.screenshot({path:`scratchpad/resume-${name}.png`,clip:{x:0,y:0,width:375,height:600}});
  await ctx.close();
}
// compose
const pg=await b.newPage({viewport:{width:1200,height:800}});
const P=[['resume-CURRENT.png','NOW  — she comes back and the app says nothing about what she lost'],
 ['resume-A_chat.png','A  — name the CONVERSATION   (Kathy lost Reformation this way)'],
 ['resume-B_pieces.png','B  — name the PIECES   (Jen wanted to go back and forth)'],
 ['resume-C_both.png','C  — one resume line, naming both']];
const imgs=P.map(([f,l])=>['data:image/png;base64,'+fs.readFileSync('scratchpad/'+f).toString('base64'),l]);
const D=await pg.evaluate(async imgs=>{
  const CROP=1800,LAB=100,W=1125;
  const c=document.createElement('canvas');c.width=W;c.height=imgs.length*(CROP+LAB);
  const x=c.getContext('2d');x.fillStyle='#141414';x.fillRect(0,0,c.width,c.height);let y=0;
  for(const [src,label] of imgs){const im=new Image();im.src=src;await im.decode();
    x.fillStyle='#141414';x.fillRect(0,y,W,LAB);
    x.fillStyle='#F2D889';x.font='600 33px system-ui,sans-serif';x.textBaseline='middle';
    x.fillText(label,26,y+LAB/2);
    x.drawImage(im,0,0,im.width,Math.min(CROP,im.height),0,y+LAB,W,Math.min(CROP,im.height));
    y+=CROP+LAB;}
  return c.toDataURL('image/png');},imgs);
fs.writeFileSync('scratchpad/resume-options.png',Buffer.from(D.split(',')[1],'base64'));
await b.close();srv.close();console.log('scratchpad/resume-options.png');
