/* What's Trending rows: the page's _trendKeep and the weekly job's trendKeep
   (scripts/lib/trend-rules.js) must give the SAME answer — a rule applied to
   one half is not applied. Also pins her rulings by RULE, not by row content. */
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';
import {trendKeep} from '../scripts/lib/trend-rules.js';
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const R=JSON.parse(fs.readFileSync(ROOT+'/data/trend-rules.json','utf8'));
const PX=JSON.parse(fs.readFileSync(ROOT+'/data/trend-photos.json','utf8'));
let pass=0,fail=0;const ok=(c,m)=>{c?pass++:(fail++,console.log('FAIL',m))};
const cases=[];for(const [t,r] of Object.entries(PX.trends))for(const p of r.items)cases.push([t,p]);
const synth=[['Chocolate Brown',{name:'Birkenstock Arizona Soft Footbed Slide Sandal in Taupe'},false],
 ['Loafers',{name:'Boston Clog Suede Loafer',brand:'Birkenstock'},false],
 ['Chocolate Brown',{name:'LAMARQUE Pascale Jacket in Wine'},false],
 ['Chocolate Brown',{name:'Sam Edelman Sylvia Knee High Boot in Chocolate Brown'},true],
 ['Leopard Print',{name:'Zimmermann leopard-print halterneck swimsuit'},false],
 ['Suede',{name:'Gianvito Rossi Suede-trimmed platform espadrilles'},false],
 ['Velvet',{name:'Aquazzura velvet platform sandals'},true],
 ['Fall Florals',{name:'Pumpkin Season Floral Graphic Sweatshirt'},false],
 ['Belts',{name:'Leather Belt'},true],
 ['Belted Shirt Dresses',{name:'SHIRTY Mixed Stripe Long Sleeve Shirtdress in Navy'},false],
 ['Belted Shirt Dresses',{name:"Karen Millen Women's Crepe Buckle Waist Midi Shirt Dress"},true],
 ['Faux Fur',{name:'Ruslan Baginskiy Faux fur hat'},false],
 ['Faux Fur',{name:'Monnalisa Girl Eco-Faux Fur Coat'},false],
 ['Wide-Leg Jeans',{name:'Wide Leg Girlfriend Jeans'},true],
 ['Loafers',{name:"Madden Girl Women's Millie Lug-Sole Tailored Loafers"},true],
 ['Trench Coats',{name:"Burberry Men's Long Silk Hoxton Trench Coat"},false],
 ['Fall Florals',{name:'FARM Rio Emily Tapestry Floral Print Midi Dress in Off-White'},false],
 ['Fall Florals',{name:'FARM Off-White Emily Floral Tapestry Drawstring Blouse'},true],
 ['Loafers',{name:'Isabel Marant Felsa fringed suede loafers'},false],
 ['Suede',{name:'Blundstone Footwear Chelsea Boot in Steel Grey Suede'},false],
 ['Velvet',{name:'Velvet Fallon linen shorts'},false],
 ['Velvet',{name:"L'orsobruno Mini Velvet Corduroy Trousers"},false],
 ['Velvet',{name:'Ganni Velvet midi dress'},true],
 ['Belts',{name:'CHLOÉ High-rise Tailored Pants in Lower-impact Wool, Gathered at the Waist with a Belt'},false],
 ['Loafers',{name:'Sebago Portland Suede Flesh Out Loafers'},false],
 ['Ballet Flats',{name:'Simone Rocha Ghillie glitter ballet flats'},false],
 ['Burgundy',{name:'Victoria Burgundy Tiempo-Inspired Mini Sneakers with Hook-and-Loop Straps'},false]];
for(const [t,p,want] of synth)ok(trendKeep(R,t,p)===want,`job: ${t} / ${p.name} should be ${want}`);
for(const [t,r] of Object.entries(PX.trends))for(const p of r.items)ok(trendKeep(R,t,p),`stored piece breaks her rules: ${t} / ${p.name}`);
ok(Object.keys(PX.trends).length>=20,'at least 20 trends carry photos');
const b=await chromium.launch();const pg=await b.newPage();
await pg.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='stylestar.app')return r.abort();
  let f=u.pathname==='/'||!path.extname(u.pathname)?'/index.html':u.pathname;f=ROOT+f;return fs.existsSync(f)?r.fulfill({path:f}):r.fulfill({status:404});});
await pg.goto('https://stylestar.app/trending');await pg.waitForTimeout(2500);
const pageAns=await pg.evaluate(([R,cs])=>{_TREND_RULES=R;return cs.map(([t,p])=>_trendKeep(t,p))},[R,cases.concat(synth.map(s=>[s[0],s[1]]))]);
const all=cases.concat(synth.map(s=>[s[0],s[1]]));
all.forEach(([t,p],i)=>ok(pageAns[i]===trendKeep(R,t,p),`page and job disagree: ${t} / ${p.name}`));
const shown=await pg.evaluate(()=>document.querySelectorAll('#s-trending .trend-strip').length);
ok(shown>=20,'the page draws a photo row on at least 20 trend cards (got '+shown+')');
await b.close();
console.log(`${pass} passed, ${fail} failed`);process.exit(fail?1:0);
