// Contact card treatments — her call: the cream card, the gold card border and
// the bronze address all have to go. The address must still clear AA 4.5:1,
// which is what forced the bronze in the first place, so each option solves
// that a different way. id-scoped CSS + a computed-style probe proves they differ.
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=path.resolve('.'), PORT=8911;
const T={'.css':'text/css','.html':'text/html','.js':'text/javascript','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/contact'||p==='/')p='/index.html';
 const f=path.join(ROOT,p); if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x');}
 r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>srv.listen(PORT,r));

const PILL = `display:inline-block;background:#1a1a1a;color:#F2D889;border:1px solid #C99A2C;
  border-radius:999px;padding:10px 16px;text-decoration:none;font:600 15px/1 'Jost',sans-serif;letter-spacing:.01em`;

const OPTS = {
  a: { label:'A  quiet paper', css:`
    #s-contact .cc-card{background:#fff;border:1px solid #DDD8CB}
    #s-contact .cc-a{color:#1a1a1a;text-decoration:underline;text-underline-offset:3px}` },
  b: { label:'B  marquee address', css:`
    #s-contact .cc-card{background:#fff;border:1px solid #D8A52E}
    #s-contact .cc-a{${PILL}}` },
  c: { label:'C  no cards, just a rule', css:`
    #s-contact .cc-card{background:transparent;border:0;border-top:1px solid #DDD8CB;padding:18px 6px 14px}
    #s-contact .cc-card:last-of-type{border-bottom:1px solid #DDD8CB}
    #s-contact .cc-a{${PILL}}` },
  d: { label:'D  linen, no border', css:`
    #s-contact .cc-card{background:#F5F2E9;border:0;padding:17px 14px}
    #s-contact .cc-a{color:#1a1a1a;text-decoration:underline;text-underline-offset:3px}` },
};

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const lum=null;
for(const [k,o] of Object.entries(OPTS)){
  const pg=await b.newPage({viewport:{width:390,height:900},deviceScaleFactor:2});
  await pg.goto(`http://localhost:${PORT}/contact`);
  await pg.waitForTimeout(2600);
  await pg.evaluate(()=>{const c=document.querySelector('.hm-entrance');if(c)c.remove();});
  try{await pg.evaluate(()=>document.fonts.ready);}catch{}
  await pg.evaluate(css=>{const s=document.createElement('style');s.textContent=css;document.head.appendChild(s);},o.css);
  await pg.waitForTimeout(500);
  const m=await pg.evaluate(()=>{
    const L=([r,g,bb])=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(bb)};
    const P=s=>s.match(/\d+/g).slice(0,3).map(Number);
    const bgOf=el=>{let n=el;while(n&&n!==document.documentElement){const bb=getComputedStyle(n).backgroundColor;
      if(bb&&!/rgba\(0, 0, 0, 0\)|transparent/.test(bb))return P(bb);n=n.parentElement}return[255,255,255]};
    const a=document.querySelector('#s-contact .cc-a');
    const cs=getComputedStyle(a);
    const fg=P(cs.color), bg=bgOf(a);
    const l1=L(fg),l2=L(bg);
    const r=a.getBoundingClientRect();
    return{ addr:cs.color, cardBg:getComputedStyle(document.querySelector('#s-contact .cc-card')).backgroundColor,
      contrast:+(((Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)).toFixed(2)),
      tapH:Math.round(r.height), tapW:Math.round(r.width),
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth };
  });
  console.log(o.label.padEnd(24), JSON.stringify(m));
  await pg.screenshot({path:`scratchpad/cc-${k}.png`});
  await pg.close();
}
await b.close(); srv.close();
