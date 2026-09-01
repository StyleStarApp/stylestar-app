// Measure every heading's PAINTED geometry in the rendered DOM, so demoting an
// imported <h1> to <h2> can be proven invisible rather than assumed.
// ⚠️ THE TRAP THIS EXISTS FOR: the browser's own UA stylesheet gives h1 and h2
// DIFFERENT default margins (0.67em vs 0.83em). .story-title sets font-size and
// margin-bottom but NOT margin-top, so a naive demotion silently moves every
// legal/story/journal heading down a few pixels.
import fs from 'fs'; import http from 'http';
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import handler from '/home/user/stylestar-app/netlify/edge-functions/page-titles.js';
const { chromium } = pw;
const ROOT='/home/user/stylestar-app', RAW=fs.readFileSync(ROOT+'/index.html','utf8');
const T={'.css':'text/css','.png':'image/png'};
const srv=http.createServer(async(q,r)=>{const p=q.url.split('?')[0];
  if(p==='/index.html'){r.writeHead(200,{'content-type':'text/html'});return r.end(RAW);}
  const e=p.slice(p.lastIndexOf('.'));
  if(T[e]&&fs.existsSync(ROOT+p)){r.writeHead(200,{'content-type':T[e]});return r.end(fs.readFileSync(ROOT+p));}
  const ctx={next:async()=>new Response(RAW,{headers:{'content-type':'text/html'}})};
  r.writeHead(200,{'content-type':'text/html'});
  r.end(await (await handler(new Request('https://stylestar.app'+(p==='/'?'/':p)),ctx)).text());});
await new Promise(r=>srv.listen(8998,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({viewport:{width:390,height:844}});
await c.route('**/*',r=>new URL(r.request().url()).host==='localhost:8998'?r.continue():r.abort());
const pg=await c.newPage();
await pg.goto('http://localhost:8998/',{waitUntil:'domcontentloaded'});
await pg.waitForTimeout(1200);
// Show each screen in turn so its heading is really laid out (a display:none
// element yields zero geometry -- the standing never-measure-a-hidden-element rule).
const out=await pg.evaluate(async()=>{
  const ids=['s-wel','s-story','s-faq','s-contact','s-journal-hub','s-journal','s-privacy','s-terms'];
  const res={}; 
  for(const id of ids){
    const el=document.getElementById(id); if(!el){res[id]='MISSING';continue;}
    document.querySelectorAll('.scr').forEach(s=>s.classList.remove('act'));
    el.classList.add('act');
    await new Promise(r=>requestAnimationFrame(r));
    const h=el.querySelector('h1,h2.story-title,h2.hm-h1');
    if(!h){res[id]='NO HEADING';continue;}
    const cs=getComputedStyle(h), rc=h.getBoundingClientRect();
    res[id]={tag:h.tagName,fontSize:cs.fontSize,weight:cs.fontWeight,family:cs.fontFamily.slice(0,22),
             mt:cs.marginTop,mb:cs.marginBottom,w:Math.round(rc.width*10)/10,h:Math.round(rc.height*10)/10,
             text:(h.innerText||'').trim().slice(0,34)};
  }
  res._h1count=document.querySelectorAll('h1').length;
  return res;
});
console.log(JSON.stringify(out,null,1));
await b.close(); srv.close();
