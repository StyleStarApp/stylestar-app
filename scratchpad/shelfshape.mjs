// What a real Wardrobe Ideas row actually looks like with the feed ceiling on.
// Real app, her real products.json, and the REAL live feed pools captured from
// stylestar.app -- so this measures the shelf she will get, not a fixture.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from 'playwright';
const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE = process.argv[2];
const SLOTS = ['to3','to1','to2','dr1','bg1','sh1'];
const TYPES = {'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.css':'text/css'};
const srv = http.createServer((rq,rs)=>{
  const f = path.join(ROOT, rq.url.split('?')[0]==='/' ? 'index.html' : rq.url.split('?')[0]);
  fs.readFile(f,(e,d)=> e ? (rs.writeHead(404),rs.end()) :
    (rs.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'text/plain'}),rs.end(d)));
}).listen(8971);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const band = p => p<60?'$':p<175?'$$':p<500?'$$$':'$$$$';
console.log('row   cards  feed  hers   prices');
for (const slot of SLOTS) {
  let pool=[]; try{ pool=JSON.parse(fs.readFileSync(path.join(CACHE,'sw-'+slot+'.json'),'utf8')).products||[] }catch(e){}
  if(!pool.length){ console.log(slot.padEnd(5)+'  (no captured feed)'); continue; }
  const ctx = await b.newContext(); const pg = await ctx.newPage();
  await pg.route('**/.netlify/functions/**', r=>r.fulfill({status:200,body:'{}'}));
  await pg.goto('http://localhost:8971/'); await pg.waitForTimeout(2400);
  const r = await pg.evaluate(async ([slot,pool])=>{
    localStorage.setItem('ss_data',JSON.stringify({userName:'C',answers:[8,7,6,9,7,6,7,7,8,10,7,9]}));
    // Cath's own Style Signature, read off her screenshot
    answers.splice(0,12,8,7,6,9,7,6,7,7,8,10,7,9); quizTaken=true;
    await _loadProducts();
    _feedBySlot[slot]=pool;
    const picks=curatedPicks(slot,prefs,_herFamily(),4).picks;
    return picks.map(x=>({n:x.name,feed:!!x.feed,p:Number(x.price)||0,r:x.retailer}));
  },[slot,pool]);
  await ctx.close();
  const feed=r.filter(x=>x.feed).length;
  console.log(slot.padEnd(5)+String(r.length).padStart(6)+String(feed).padStart(6)+String(r.length-feed).padStart(6)+
    '   '+r.map(x=>(x.feed?'F':'H')+'$'+x.p).join(' '));
  r.forEach(x=>console.log('        '+(x.feed?'FEED ':'HERS ')+('$'+x.p).padStart(7)+' '+band(x.p).padEnd(5)+' '+String(x.n).slice(0,44)));
}
await b.close(); srv.close();
