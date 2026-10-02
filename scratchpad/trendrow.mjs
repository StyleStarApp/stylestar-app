// Render What's Trending "See ideas in your style": during the search and after.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';import path from 'path';
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const SP='/tmp/claude-0/-home-user-stylestar-app/ccd2d3bd-13d7-5b8a-a78c-9f83c0ce0e88/scratchpad/';
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==','base64');
const IDEAS={items:[{name:'Faux Fur Coat',search:'faux fur coat',store:'Bloomingdales'},{name:'Faux Fur Jacket',search:'faux fur jacket',store:'Zara'},{name:'Faux Fur Trim Coat',search:'faux fur trim coat',store:'Nordstrom'},{name:'Faux Fur Vest',search:'faux fur vest',store:'Macys'}]};
const FIND={exact:[],doors:[],browse:[1,2,3,4].map(i=>({id:'p'+i,title:'Sema Fluff Coat '+i,store:'Bloomingdales',brand:'UGG',price:'$308.00',image:'https://img.test/c'+i+'.png'}))};
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();
await p.route('**/*',async r=>{const u=new URL(r.request().url());
  if(u.pathname.startsWith('/__font/'))return r.fulfill({path:SP+'fonts/'+u.pathname.slice(8),contentType:'font/woff2'});
  if(u.hostname==='fonts.googleapis.com')return r.fulfill({path:SP+'fonts/fonts.css',contentType:'text/css'});
  if(u.pathname.includes('style-ai'))return r.fulfill({contentType:'application/json',body:JSON.stringify({content:[{text:JSON.stringify(IDEAS)}]})});
  if(u.pathname.includes('product-find')){await new Promise(z=>setTimeout(z,3500));return r.fulfill({contentType:'application/json',body:JSON.stringify(FIND)}).catch(()=>{});}
  if(u.pathname.includes('product-search'))return r.fulfill({contentType:'application/json',body:'{"products":[]}'});
  if(u.hostname==='img.test')return r.fulfill({path:SP+'sl1.jpg'});
  if(u.hostname==='stylestar.app'){let f=u.pathname==='/'||!path.extname(u.pathname)?'/index.html':u.pathname;f=ROOT+f;return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404});}
  if(r.request().resourceType()==='image')return r.fulfill({body:PNG,contentType:'image/png'});
  return r.abort();});
await p.goto('https://stylestar.app/');await p.waitForTimeout(1200);
await p.evaluate(()=>{try{openTrending()}catch(e){}});await p.waitForTimeout(800);
await p.evaluate(()=>{try{wardrobeSeeIdeas('trend0')}catch(e){}});
await p.waitForSelector('#wdrFind_trend0 .ss-find-wait');await p.waitForTimeout(1300);
const shot=async n=>{const bb=await (await p.$('#wx_trend0')).boundingBox();await p.screenshot({path:SP+n,clip:{x:0,y:bb.y-20,width:390,height:Math.min(bb.height+40,520)},fullPage:true});};
await shot('trend-wait.png');
await p.waitForSelector('#wx_trend0 .find-card',{timeout:10000});await p.waitForTimeout(400);

await shot('trend-done.png');
await b.close();
