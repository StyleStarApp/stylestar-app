// ⭐ THIS WEEK'S STAR (2026-08-13, her design, her name): Cath's weekly
// hand-picked item on Welcome Back — the return loop. Drives the real app.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req,res)=>{try{res.end(fs.readFileSync(path.join(ROOT, req.url==='/'?'index.html':req.url.split('?')[0])))}catch(e){res.statusCode=404;res.end()}}).listen(8937);

let pass=0, fail=0;
const ok=(l,c,d)=>{console.log((c?'  ✓ ':'  ✗ ')+l+(!c&&d?('  → '+d):'')); c?pass++:fail++;};
const lum=([r,g,b])=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
const ratio=(a,b)=>{const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+.05)/(y+.05)};
const px=s=>s.match(/\d+/g).slice(0,3).map(Number);

const browser = await chromium.launch();
const errors=[];
const page = await browser.newPage({viewport:{width:390,height:900}});
page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://localhost:8937/'); await page.waitForTimeout(700);

console.log('1. The card renders on Welcome Back');
await page.evaluate(()=>{show('s-wb')}); await page.waitForTimeout(300);
const card = await page.evaluate(()=>{
  const el=document.getElementById('wbStar');
  const a=el.querySelector('.wks-shop');
  return {
    on: el.classList.contains('on') && el.querySelector('.wks-card')!==null,
    visible: el.getBoundingClientRect().height>40,
    label: el.querySelector('.wks-lbl').textContent.trim(),
    twinStars: el.querySelectorAll('.wks-lbl svg path[fill="#E0B84C"]').length===2
      && !!el.querySelector('.wks-lbl svg.l') && !!el.querySelector('.wks-lbl svg.r'),
    name: el.querySelector('.wks-name').textContent,
    store: el.querySelector('.wks-store').textContent,
    href: a.getAttribute('href'), rel: a.getAttribute('rel'), tgt: a.getAttribute('target'),
    note: (el.querySelector('.wks-note')||{textContent:''}).textContent,
    pinkHeart: !!el.querySelector('.wks-note .wks-ch'),
    disc: (el.querySelector('.wks-disc')||{textContent:''}).textContent.trim()
  };
});
ok('card is on and visible', card.on && card.visible);
// Renamed 2026-08-13, her call: "I like Star of the Week better" + her pick C
// (twin tilted flanking stars) from the three-way render.
ok('label reads STAR OF THE WEEK flanked by twin gold stars', /STAR OF THE WEEK/.test(card.label) && card.twinStars);
ok('her first pick: the Tommy Hilfiger Claihre sandal', /Tommy Hilfiger Claihre/.test(card.name));
ok('store line says Nordstrom', /NORDSTROM/i.test(card.store));
ok('Shop it = her exact canonical product URL', card.href==='https://www.nordstrom.com/s/8960533');
ok('rel sponsored noopener + new tab (the standing link rules)', /sponsored/.test(card.rel) && /noopener/.test(card.rel) && card.tgt==='_blank');
ok('her note renders with her tilted pink heart (Catherine speaking)', card.note.length>10 && card.pinkHeart);
ok('the disclosure sits with the first product link on this screen', card.disc==='Some links may earn a commission.');

console.log('2. Saving the star');
const save = await page.evaluate(()=>{
  const btn=document.querySelector('#wbStar .wl-save');
  btn.click();
  const wl=(wardrobeData&&wardrobeData.wishlist)||[];
  const e=wl[wl.length-1]||{};
  return {n:wl.length, pick:!!e.pick, url:e.url, label:btn.textContent.trim(), pressed:btn.classList.contains('on')};
});
ok('heart tap saves it to Your Wishlist', save.n>=1);
ok('saved as a pick with the exact product URL', save.pick && save.url==='https://www.nordstrom.com/s/8960533');
ok('the control flips to Saved', /Saved/.test(save.label) && save.pressed);
const row = await page.evaluate(()=>{
  openWishlist();
  const html=document.getElementById('s-wishlist').innerHTML;
  return {badge:/Catherine&rsquo;s pick|Catherine’s pick/.test(html), shopIt:/Shop it/.test(html)};
});
ok('the wishlist row wears the Catherine’s pick badge', row.badge);
ok('and its button says Shop it (exact link, not a search)', row.shopIt);
await page.evaluate(()=>{const btn=document.querySelector('#wbStar .wl-save'); show('s-wb'); document.querySelector('#wbStar .wl-save').click();});

console.log('3. Readability and layout');
const contrast = await page.evaluate(()=>{
  const el=document.getElementById('wbStar');
  const bg=getComputedStyle(el.querySelector('.wks-card')).backgroundColor;
  const c=s=>getComputedStyle(el.querySelector(s)).color;
  const behind=getComputedStyle(document.querySelector('#s-wb .wb-wrap')||document.getElementById('s-wb')).backgroundColor;
  return {bg,lbl:c('.wks-lbl'),name:c('.wks-name'),note:c('.wks-note'),store:c('.wks-store'),disc:c('.wks-disc'),behind};
});
ok('label contrast ≥ 4.5', ratio(px(contrast.lbl),px(contrast.bg))>=4.5, contrast.lbl);
ok('name contrast ≥ 4.5', ratio(px(contrast.name),px(contrast.bg))>=4.5);
ok('note contrast ≥ 4.5', ratio(px(contrast.note),px(contrast.bg))>=4.5);
ok('store line contrast ≥ 4.5', ratio(px(contrast.store),px(contrast.bg))>=4.5);
for (const w of [390,360,320]) {
  await page.setViewportSize({width:w,height:900});
  await page.evaluate(()=>{show('s-wel');show('s-wb')}); await page.waitForTimeout(150);
  const r = await page.evaluate(()=>{
    const el=document.getElementById('wbStar');
    const wide=[...el.querySelectorAll('*')].some(n=>n.getBoundingClientRect().right>innerWidth+0.5||n.getBoundingClientRect().left<-0.5);
    return {wide, pageWide: document.documentElement.scrollWidth>innerWidth+1};
  });
  ok(w+'px: nothing overflows', !r.wide && !r.pageWide);
}

console.log('4. Graceful absence');
const off = await page.evaluate(()=>{
  const old=WEEK_STAR; WEEK_STAR=null; _renderWeekStar();
  const hidden=!document.getElementById('wbStar').classList.contains('on');
  WEEK_STAR=old; _renderWeekStar();
  return {hidden, back:document.getElementById('wbStar').classList.contains('on')};
});
ok('no item set → no card, no error', off.hidden);
ok('and it comes back when the star returns', off.back);
ok('zero JS errors', errors.length===0);
if(errors.length)console.log(errors.slice(0,3));

await browser.close(); server.close();
console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
