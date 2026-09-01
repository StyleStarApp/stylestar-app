// Drives the REAL app in Chromium against edge-function output, so the article
// route is genuinely trimmed and must self-heal, exactly like production.
// ⚠️ Serves .css as text/css (a wrong type makes Chromium refuse the sheet and
// silently render an unstyled page). ⚠️ /index.html is served UNTRIMMED on
// purpose -- it is the file self-heal fetches; trimming it would fake a pass.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const {chromium}=pw;
import http from 'http'; import fs from 'fs'; import path from 'path';
import handler from '../netlify/edge-functions/page-titles.js';
const RAW=fs.readFileSync('index.html','utf8');
const TYPES={'.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.json':'application/json','.xml':'application/xml'};
const EDGE=['/','/story','/faq','/contact','/privacy','/terms','/journal'];
const srv=http.createServer(async (req,res)=>{
  const p=decodeURIComponent(req.url.split('?')[0]);
  if(EDGE.includes(p)||p.startsWith('/journal/')){
    const r=await handler(new Request('https://stylestar.app'+p),
      {next:async()=>new Response(RAW,{status:200,headers:{'content-type':'text/html'}})});
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(await r.text());
  }
  const f=path.join(process.cwd(), p==='/index.html'?'/index.html':p);
  if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end('nf');}
  res.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'text/html; charset=utf-8'});
  res.end(fs.readFileSync(f));
});
await new Promise(r=>srv.listen(8802,r));
const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
let pass=0,fail=0;
const ok=(n,c,d='')=>{c?pass++:fail++;console.log((c?'  ok   ':'  FAIL ')+n+(c?'':'   <- '+d));};
const page=async()=>{const p=await br.newPage({viewport:{width:390,height:844}});
  const e=[];p.on('pageerror',x=>e.push(String(x)));p._errs=e;return p;};

// ---- 1. cold landing on the trimmed article route ----
console.log('\n== cold landing on /journal/how-to-dress-for-fall-in-florida ==');
let pg=await page();
await pg.goto('http://localhost:8802/journal/how-to-dress-for-fall-in-florida',{waitUntil:'domcontentloaded'});
await pg.waitForTimeout(1400);
let r=await pg.evaluate(()=>{
  const s=document.getElementById('s-journal-fall-florida');
  const act=[...document.querySelectorAll('.scr.act')].map(x=>x.id);
  return {visible:!!s&&s.offsetHeight>0, active:act,
    h1:[...document.querySelectorAll('h1')].filter(h=>h.offsetHeight>0).map(h=>h.innerText.trim()),
    healed:document.querySelectorAll('.scr').length,
    title:document.title, url:location.pathname,
    footer:(document.querySelector('#s-journal-fall-florida .pg-foot')||{}).innerText||''};
});
ok('article screen is visible', r.visible);
ok('exactly ONE screen is active', r.active.length===1, r.active.join(','));
ok('the active screen is the article', r.active[0]==='s-journal-fall-florida');
ok('exactly one VISIBLE h1, and it is the article title', r.h1.length===1 && /Fall in Florida/.test(r.h1[0]), r.h1.join(' | '));
ok('self-heal put the other screens back', r.healed>20, r.healed+' screens in DOM');
ok('address bar keeps the article path', r.url==='/journal/how-to-dress-for-fall-in-florida', r.url);
ok('footer filled after heal', r.footer.trim().length>0, JSON.stringify(r.footer.slice(0,40)));

// ---- 2. the trending tap link, on this trimmed route ----
console.log('\n== the What\'s Trending tap link ==');
await pg.evaluate(()=>{document.querySelector('#s-journal-fall-florida .faq-a span.lnk').click();});
await pg.waitForTimeout(1200);
let t=await pg.evaluate(()=>{
  const act=[...document.querySelectorAll('.scr.act')].map(x=>x.id);
  const tab=document.querySelector('.wdr-tab[data-tab="trend"]');
  return {active:act, trendTabOn:!!(tab&&tab.classList.contains('on')),
    trendVisible:!!(document.querySelector('#s-wardrobe .wdr-pane[data-pane="trend"]')||{}).offsetHeight,
    trendItems:document.querySelectorAll('#wdrTrendBody .wdr-tcard').length};
});
ok('tap lands on the wardrobe screen', t.active[0]==='s-wardrobe', t.active.join(','));
ok('and on the What\'s Trending TAB specifically', t.trendTabOn);
ok('the trend PANE is visible', !!t.trendVisible);
ok('and it has real trend cards in it', t.trendItems>0, t.trendItems+' cards');
ok('no JS errors through the whole flow', pg._errs.length===0, pg._errs.slice(0,2).join(' | '));
await pg.close();

// ---- 3. hub: client markup must equal server markup BYTE FOR BYTE ----
console.log('\n== hub rows: server vs client ==');
const srvHtml=await (await handler(new Request('https://stylestar.app/journal'),
  {next:async()=>new Response(RAW,{status:200,headers:{'content-type':'text/html'}})})).text();
// ⚠️ TWO traps in this one comparison, both of which made it fail on CORRECT code:
// (1) the doc comment above _renderJournalHub() contains the literal row
//     template, so scanning the raw document finds a PHANTOM third row --
//     strip comments and scripts first, every time;
// (2) reading .innerHTML back from the DOM returns the browser's
//     RE-SERIALIZED markup ("→" where the source said "&rarr;"), so comparing
//     server SOURCE against client innerHTML can never match. The fair test
//     puts BOTH sides through the same DOM normalisation.
const stripDoc = x => x.replace(/<!--[\s\S]*?-->/g,'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
const anchors = x => (stripDoc(x).match(/<a class="jhub-row"[\s\S]*?<\/a>/g)||[]).join('');
const srvRowSrc = anchors(srvHtml);
pg=await page();
await pg.goto('http://localhost:8802/journal',{waitUntil:'domcontentloaded'});
await pg.waitForTimeout(1400);
const cmp=await pg.evaluate((serverSrc)=>{
  // Capture the string _renderJournalHub ASSIGNS, before the browser parses it.
  // Reading .innerHTML back gives the browser's re-serialisation ("→" for
  // "&rarr;", "'" for "&#39;"), which silently hides real source differences --
  // it made this suite pass with the escaping bug reintroduced.
  const realGet=document.getElementById.bind(document);
  let raw=null;
  const sink={set innerHTML(v){raw=v;},get innerHTML(){return raw;}};
  document.getElementById=(id)=>id==='journalHubList'?sink:realGet(id);
  try{ _renderJournalHub(); } finally { document.getElementById=realGet; }
  _renderJournalHub();                                   // now really render it
  const client=realGet('journalHubList').innerHTML;
  const t=document.createElement('div'); t.innerHTML=serverSrc;   // same normalisation
  return {raw, client, serverNorm:t.innerHTML,
          n:(client.match(/<a class="jhub-row"/g)||[]).length};
},srvRowSrc);
ok('server emits exactly 2 rows (comments stripped)', (srvRowSrc.match(/<a class="jhub-row"/g)||[]).length===2,
   (srvRowSrc.match(/<a class="jhub-row"/g)||[]).length+'');
ok('client renders 2 rows', cmp.n===2, cmp.n+'');
ok('server and client row markup are IDENTICAL after equal normalisation',
   cmp.serverNorm===cmp.client,
   '\n    server: '+cmp.serverNorm.slice(0,160)+'\n    client: '+cmp.client.slice(0,160));
// The strict one: compare SOURCE to SOURCE, so an escaping divergence cannot
// hide behind the browser's normalisation.
ok('server and client row SOURCE are byte identical',
   anchors(cmp.raw)===srvRowSrc,
   '\n    server: '+JSON.stringify(srvRowSrc.slice(150,300))+'\n    client: '+JSON.stringify(anchors(cmp.raw).slice(150,300)));
const hub=await pg.evaluate(()=>{
  const a=[...document.querySelectorAll('.jhub-row')];
  return {n:a.length, hrefs:a.map(x=>x.getAttribute('href')), titles:a.map(x=>x.innerText.trim())};
});
ok('both rows are real <a href>', hub.hrefs.every(h=>h&&h.startsWith('/journal/')), hub.hrefs.join(','));
// tap through to article #2 from the hub
await pg.evaluate(()=>{[...document.querySelectorAll('.jhub-row')][1].click();});
await pg.waitForTimeout(900);
const landed=await pg.evaluate(()=>({act:[...document.querySelectorAll('.scr.act')].map(x=>x.id),url:location.pathname}));
ok('tapping row 2 opens article #2 in-app', landed.act[0]==='s-journal-fall-florida', landed.act.join(','));
ok('and writes the article URL', landed.url==='/journal/how-to-dress-for-fall-in-florida', landed.url);
ok('no JS errors on the hub flow', pg._errs.length===0, pg._errs.slice(0,2).join(' | '));
await pg.close();
await br.close(); srv.close();
console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
