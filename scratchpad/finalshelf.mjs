// finalshelf.mjs — renders of the FINAL blended, unattributed shelf, as built.
import http from 'http'; import fs from 'fs'; import path from 'path';
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
const ROOT = path.resolve(import.meta.dirname, '..');
const srv = http.createServer((req,res)=>{try{res.end(fs.readFileSync(path.join(ROOT,req.url==='/'?'index.html':req.url.split('?')[0])))}catch(e){res.statusCode=404;res.end()}}).listen(8953);
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const AI = {items:[
 {name:'Silk Professional Blouse',search:'silk professional blouse',store:'Nordstrom'},
 {name:'Woven Button-Front Blouse',search:'woven button front blouse',store:'Dillard’s'},
 {name:'Crepe Wrap Blouse',search:'crepe wrap blouse',store:'Macy’s'},
 {name:'Poplin Tailored Shirt',search:'poplin tailored shirt',store:'LOFT'}]};
async function shoot(slot,file,label,tapMore){
  const ctx=await b.newContext({viewport:{width:390,height:1100},deviceScaleFactor:2});
  const pg=await ctx.newPage();
  await pg.route('**/.netlify/**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({content:[{text:JSON.stringify(AI)}]})}));
  await pg.goto('http://localhost:8953/');await pg.waitForTimeout(2600);
  await pg.evaluate(()=>{
    localStorage.setItem('ss_data',JSON.stringify({userName:'Test',answers:new Array(12).fill(6),topArchNames:['The Timeless Classic'],portrait:'p',motto:'m'}));
    topArchNames=['The Timeless Classic'];quizTaken=true;openWardrobe();
  });
  await pg.waitForTimeout(300);
  await pg.evaluate(s=>wardrobeSeeIdeas(s),slot);
  await pg.waitForTimeout(900);
  if(tapMore){await pg.evaluate(async s=>{await _wdrMoreIdeas(s)},slot);await pg.waitForTimeout(500);}
  await pg.evaluate(([s,lbl])=>{
    const box=document.getElementById('wx_'+s);
    const tag=document.createElement('div');
    tag.style.cssText='font:700 13px/1.4 -apple-system,sans-serif;background:#1a1a1a;color:#F2D889;padding:8px 12px;margin:0 0 8px;border-radius:6px';
    tag.textContent=lbl;box.parentNode.insertBefore(tag,box);
    box.scrollIntoView({block:'start'});window.scrollBy(0,-64);
  },[slot,label]);
  await pg.waitForTimeout(250);
  const bb=await (await pg.$('#wx_'+slot)).boundingBox();
  await pg.screenshot({path:path.join(ROOT,'scratchpad',file),clip:{x:0,y:Math.max(0,bb.y-48),width:390,height:Math.min(bb.height+64,1000)}});
  console.log('wrote',file);
  await ctx.close();
}
await shoot('to5','finalshelf-blouses.png','FINAL — blouses: your 4 lead, AI fills to 6, no labels');
await shoot('bo1','finalshelf-jeans.png','FINAL — jeans: same blended shelf');
await shoot('to5','finalshelf-more.png','FINAL — after one "+ See more ideas" tap',true);
await b.close();srv.close();
