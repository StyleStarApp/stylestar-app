/* Her call: the pink stylist star PLUS a pale yellow fill on the row when a
   conversation is waiting. Good instinct — the app already uses pale yellow to
   mean "this one is yours/active" (a starred wardrobe row fills #FAF1DA), so the
   row speaks a language she has already established.
   ⚠️ BUT THE DRAWER PAPER IS #FBFAF7, near-white. A pale yellow on near-white is
   the wishlist-frame trap: she caught that one because its INNER edge dissolved
   and only the outer edge read at all. And the wardrobe divider at #f0ebe0
   measured 1.14:1 on paper and effectively did not exist. So the fill is
   MEASURED against the paper it sits on, not chosen by eye. */
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=process.cwd(),PORT=8997;
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';
 fs.readFile(path.join(ROOT,u.replace(/^\//,'')),(e,b)=>{if(e){r.writeHead(404);r.end();return}
 r.writeHead(200,{'Content-Type':{'.css':'text/css','.html':'text/html','.png':'image/png','.json':'application/json'}[path.extname(u)]||'application/octet-stream'});r.end(b)})});
const rel=c=>{const v=c.map(n=>{n/=255;return n<=.03928?n/12.92:Math.pow((n+.055)/1.055,2.4)});
  return .2126*v[0]+.7152*v[1]+.0722*v[2]};
const ratio=(a,b)=>{const l1=rel(a),l2=rel(b);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)};
const hex=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
const PAPER=hex('#FBFAF7'), INK=hex('#1a1a1a');

/* Three depths. #FAF1DA is the wardrobe's own starred-row fill, so it is the
   consistent choice; the other two are there to show what depth actually buys. */
/* ⚠️ THE WARDROBE'S OWN YELLOW DOES NOT TRANSFER, and the reason is the one she
   already learned on the wishlist frame: VALUE, not hue. #FAF1DA works on the
   wardrobe because that page sits on the app's LINEN; the drawer paper is
   #FBFAF7, near-white, so the same fill reads 1.08:1 there — fainter than the
   #f0ebe0 divider she called invisible at 1.14:1.
   ▶ SO THE FOURTH OPTION IS HER OWN PRIOR SOLUTION TO THIS EXACT PROBLEM: when
   the pale wishlist frame dissolved into its paper she did not deepen it, she
   gave it a gold HAIRLINE. Definition, not more colour. */
const FILLS={'1_FAF1DA (the wardrobe\'s own)':'#FAF1DA','2_F7E9C0 (a notch deeper)':'#F7E9C0','3_F3DFA6 (deeper still)':'#F3DFA6','4_FAF1DA+gold edge (her wishlist fix)':'#FAF1DA'};
console.log('THE FILL AGAINST THE DRAWER PAPER (#FBFAF7)');
for(const [n,h] of Object.entries(FILLS)){
  console.log('  '+n.padEnd(30)+'vs paper '+ratio(hex(h),PAPER).toFixed(2)+':1'
    +'   row ink on it '+ratio(INK,hex(h)).toFixed(2)+':1');
}
console.log('  (for scale: the wardrobe divider she called invisible measured 1.14:1)\n');

await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [name,h] of Object.entries(FILLS)){
  const pg=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3})).newPage();
  await pg.route('https://fonts.googleapis.com/**',r=>r.abort());
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(1100);
  await pg.evaluate(e=>{window.__edge=e},name.indexOf('gold edge')>-1);
  const clip=await pg.evaluate((fill)=>{
    const st=document.createElement('style');
    st.textContent='.cw-on{background:'+fill+';box-shadow:-18px 0 0 '+fill+',18px 0 0 '+fill+'}'
      +(window.__edge?'.cw-on{border-left:3px solid #C89A2C;padding-left:6px}':'')
      +'.cw-star{width:11px;height:11px;margin-left:8px;vertical-align:middle;position:relative;top:-1px;fill:#EC4899}';
    document.head.appendChild(st);
    menuOpen();
    const rows=[...document.querySelectorAll('.menu-row')];
    const ask=rows.find(r=>r.textContent.trim().startsWith('Ask your Stylist'));
    ask.classList.add('cw-on');
    ask.insertAdjacentHTML('beforeend','<svg class="cw-star" viewBox="0 0 76 76"><polygon points="38,4 46,25 69,27 51,42 57,65 38,52 19,65 25,42 7,27 30,25"/></svg>');
    const a=rows.find(r=>r.textContent.trim().startsWith('Refine')).getBoundingClientRect();
    const bb=ask.getBoundingClientRect();
    const p=document.getElementById('menuPanel').getBoundingClientRect();
    return {x:p.left,y:a.top-6,width:p.width,height:(bb.bottom+10)-(a.top-6)};
  },h);
  await pg.waitForTimeout(200);
  await pg.screenshot({path:'scratchpad/cr-'+name.split(' ')[0]+'.png',clip});
  await pg.context().close();
}
await b.close();srv.close();
console.log('rendered');
