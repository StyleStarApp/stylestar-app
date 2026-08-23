/* ── scratchpad/mallmock.mjs ─────────────────────────────────────────────────
   Where do FARM Rio and DVF go in the Mall? Her ask 2026-08-24.
   ▶ THE MONEY ARGUMENT is what makes this worth doing at all: they are her two
   approved Rakuten advertisers, so of the 25 stores in the Mall today they would
   be the only two whose links can earn. ⚠️ WHICH IS ALSO WHY THE MALL NEEDS THE
   AFFILIATE WRAP FIRST — see the finding recorded with this change; the Mall
   renders s.u raw and affwrap.js does not cover it.
   ▶ Her own scores are what the options are built from, not taste: both are
   COLOURFUL 10, and that is the only dimension where they agree. FARM Rio is
   trendy 10 / classic 3 / casual 7 (playful, boho, vacation). DVF is dressy 9 /
   polish 9 / classic 7 (wrap dresses, occasion, wedding guest). */
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=process.cwd(),PORT=9003;
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';
 fs.readFile(path.join(ROOT,u.replace(/^\//,'')),(e,b)=>{if(e){r.writeHead(404);r.end();return}
 r.writeHead(200,{'Content-Type':{'.html':'text/html','.png':'image/png','.json':'application/json'}[path.extname(u)]||'application/octet-stream'});r.end(b)})});
await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});

/* ⚠️ THE BLURBS ARE CLAUDE DRAFTS, condensed from HER OWN c: lines, and she may
   reword either. Every other blurb in the Mall is hers. */
const FARM={n:'FARM Rio',d:'Bold prints and color, made for vacation',u:'https://www.farmrio.com'};
const DVF ={n:'Diane von Furstenberg',d:'Wrap dresses and prints for occasions',u:'https://www.dvf.com'};

const PLANS={
  A_both_designer:{note:'both into Elevated & Designer',
    add:[['Elevated & Designer',FARM],['Elevated & Designer',DVF]]},
  C_split:{note:'FARM Rio beside Anthropologie, DVF beside Saks',
    add:[['Contemporary & Everyday',FARM],['Elevated & Designer',DVF]]},
  D_new_group:{note:'a sixth group, Color & Print',
    newGroup:{cat:'Color & Print',stores:[FARM,DVF]}}
};

for(const [name,plan] of Object.entries(PLANS)){
  const pg=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();
  await pg.route('https://fonts.googleapis.com/**',r=>r.abort());
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(1200);
  await pg.evaluate(p=>{
    if(p.newGroup) mallStores.push(p.newGroup);
    (p.add||[]).forEach(([cat,st])=>{
      const g=mallStores.find(x=>x.cat===cat); if(g)g.stores.push(st);
    });
    showShop();
  },plan);
  await pg.waitForTimeout(600);
  /* Clip to the groups that actually changed, so she is comparing the change and
     not scrolling five near-identical malls (the lesson from the menu renders). */
  /* ⚠️ FIND THE HEADERS, DO NOT WALK SIBLINGS. The first version matched any
     element whose text equalled a category name — which caught a CONTAINER as
     well as the heading, so the "clip" spanned the whole Mall and produced a
     7,590px comparison image. Locating the headings and cutting between two of
     them is both simpler and correct. */
  const clip=await pg.evaluate(name=>{
    const sy=window.scrollY||document.documentElement.scrollTop||0;
    const heads=[...document.querySelectorAll('#s-shop .mall-cat, #s-shop h2, #s-shop h3')]
      .filter(e=>e.getBoundingClientRect().height>0);
    const byText=t=>heads.find(h=>(h.textContent||'').trim().toUpperCase()===t);
    let from,to;
    if(name==='D_new_group'){ from=byText('COLOR & PRINT'); to=null; }
    else { from=byText('CONTEMPORARY & EVERYDAY'); to=byText('VALUE & BASICS'); }
    if(!from)return null;
    const t=from.getBoundingClientRect().top+sy-16;
    const bt=to?to.getBoundingClientRect().top+sy-10:t+560;
    return {x:0,y:Math.max(0,t),width:390,height:Math.max(200,Math.min(bt-t,2600))};
  },name);
  await pg.screenshot({path:'scratchpad/mall-'+name+'.png',clip:clip||undefined,fullPage:true});
  console.log(name.padEnd(18)+plan.note+(clip?'':'   (full page — clip failed)'));
  await pg.context().close();
}
await b.close();srv.close();
