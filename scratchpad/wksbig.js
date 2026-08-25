/* wksbig.js — the bigger STAR OF THE WEEK label + the gradient star
 * (2026-08-25, her pick "B2").
 *
 * ⚠️ SHE ASKED FOR "the same exact as the word SHOP" AND IT DOES NOT FIT.
 *    SHOP is Jost 700 21px/.2em but SHOP is FOUR letters; hers is sixteen, and
 *    .2em tracking alone costs 67px at 21px. Measured on the real label with
 *    the real fonts, 21px/.2em wraps to two lines at 390, 375 AND 360.
 *    19px/.10em is the largest that holds one line at all three.
 * ⚠️ NEGATIVE CONTROLS:
 *    font-size:19px -> 21px and letter-spacing .10em -> .20em  → Part 1 fails
 *    delete the @media(max-width:344px) block                  → Part 1 fails at 320
 *    _wksStarSvg's fill back to a flat "#E0B84C"               → Part 2 fails
 *    .wks-card padding-top 10px -> 14px                        → Part 4 fails
 */
import pwmod from '/opt/node22/lib/node_modules/playwright/index.js';
const pw=pwmod;
import fs from 'fs'; import http from 'http'; import path from 'path';
import { fileURLToPath } from 'url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(__dirname,'..');
let pass=0,fail=0;
const ok=(n,c,d)=>{c?(pass++,console.log('  ✓ '+n)):(fail++,console.log('  ✗ '+n+(d!==undefined?'  → '+String(d).slice(0,120):'')))};

const T={'.html':'text/html','.js':'text/javascript','.png':'image/png','.css':'text/css','.woff2':'font/woff2','.json':'application/json','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const PORT=8961;
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x')}
  r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});

(async()=>{
  await new Promise(r=>srv.listen(PORT,r));
  const css=fs.readFileSync(path.join(ROOT,'scratchpad/fonts/gf.css'),'utf8')
    .replace(/url\((f\d+\.woff2)\)/g,`url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
  // ⚠️ the Star's photo hotlinks a retail CDN this sandbox cannot reach and the
  //    <img> removes itself on error, so without a stub the card measures ~145px
  //    short and every fold assertion below would pass vacuously.
  const stub=fs.readFileSync('/tmp/stub.png');
  const b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});

  async function at(W){
    const pg=await b.newPage({viewport:{width:W,height:844}});
    const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
    await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
    await pg.route(/cdn\.shop|shopify|farmrio|images\./i,r=>r.fulfill({status:200,contentType:'image/png',body:stub}));
    await pg.addInitScript(a=>localStorage.setItem('ss_data',JSON.stringify({userName:'Catherine',answers:a,
      topArchNames:['Modern Glam'],portrait:'x',motto:'m'})),[8,8,9,9,9,6,6,4,6,6,6,6]);
    await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2400);
    const o=await pg.evaluate(async()=>{
      await document.fonts.ready;
      const lbl=document.querySelector('#wbStar .wks-lbl');
      if(!lbl) return {missing:true};
      const c=getComputedStyle(lbl), card=document.querySelector('#wbStar .wks-card');
      const px=document.querySelector('#wbStar .wks-px');
      const shop=document.querySelector('#wbStar .wks-shop');
      const tn=[...lbl.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
      const rng=document.createRange(); rng.selectNodeContents(tn);
      // ⚠️ cluster rect tops: a rotated inline SVG's rect sits ~2px off the text
      //    line and would count as a phantom second line (the 2026-08-11 trap).
      const tops=[...rng.getClientRects()].map(r=>Math.round(r.top));
      const svg=lbl.querySelector('svg'), sc=getComputedStyle(svg);
      const ids=[...document.querySelectorAll('radialGradient[id^=wksStarG]')].map(g=>g.id);
      return {
        lines:new Set(tops.map(t=>Math.round(t/6))).size||1,
        fs:parseFloat(c.fontSize), ls:c.letterSpacing, wt:c.fontWeight,
        starW:parseFloat(sc.width), fill:svg.querySelector('path').getAttribute('fill'),
        ids:ids.length, uniq:new Set(ids).size,
        photoStubbed: !!px && px.getBoundingClientRect().height>50,
        shopBot: shop?+shop.getBoundingClientRect().bottom.toFixed(1):null,
        cardH:+card.getBoundingClientRect().height.toFixed(1),
        overflow: document.documentElement.scrollWidth>document.documentElement.clientWidth
      };
    });
    await pg.close();
    return {...o, errs};
  }

  console.log('\nPART 1 — one line at every phone width');
  const M={};
  for(const W of [430,390,375,360,320]){
    const o=await at(W); M[W]=o;
    ok(W+'px: the label holds ONE line', o.lines===1, 'lines='+o.lines);
    ok(W+'px: nothing overflows sideways', o.overflow===false);
    ok(W+'px: zero JS errors', o.errs.length===0, o.errs[0]);
  }
  ok('19px / .10em / 700 at 375 (her phone)', M[375].fs===19 && M[375].ls==='1.9px' && M[375].wt==='700',
     M[375].fs+'px '+M[375].ls+' '+M[375].wt);
  ok('and 58% bigger than the 12px it replaces', +(M[375].fs/12).toFixed(2)===1.58);
  ok('320px steps DOWN to 15px rather than wrapping', M[320].fs===15, M[320].fs);

  console.log('\nPART 2 — her star: the gradient one, not the flat one');
  ok('the star fill references a gradient, not a flat colour',
     /^url\(#wksStarG\d+\)$/.test(M[375].fill), M[375].fill);
  ok('it is NOT the old flat #E0B84C', M[375].fill!=='#E0B84C');
  ok('star scaled up with the type (22px, was 17)', M[375].starW===22, M[375].starW);
  // ⚠️ this markup is injected 4x across two screens. Duplicate ids all resolve
  //    to the first in document order, and a defs inside a display:none screen
  //    may not paint in Safari (the prefSeal2 lesson).
  ok('every gradient id on the page is UNIQUE', M[375].ids>0 && M[375].ids===M[375].uniq,
     M[375].ids+' ids, '+M[375].uniq+' unique');

  console.log('\nPART 3 — the photo stub is really in place (or the fold check is vacuous)');
  ok('the Star photo rendered at a real height', M[375].photoStubbed===true);

  console.log('\nPART 4 — HER ASK: keep the spacing the same. The fold must not move.');
  ok('card is the SAME height as before the change (441.5px)', M[375].cardH===441.5, M[375].cardH);
  ok('"Shop it" still clears a real 700px fold', M[375].shopBot!==null && M[375].shopBot<=690,
     M[375].shopBot);

  console.log('\nPART 5 — the Discovery Star shares the star and keeps its own label');
  const pg=await b.newPage({viewport:{width:375,height:844}});
  await pg.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  await pg.route(/cdn\.shop|shopify|farmrio|images\./i,r=>r.fulfill({status:200,contentType:'image/png',body:stub}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(2400);
  const d=await pg.evaluate(async()=>{
    await document.fonts.ready;
    const hd=document.querySelector('#dsStar .dss-hd');
    if(!hd) return {missing:true};
    const svg=hd.querySelector('svg');
    return {fill:svg?svg.querySelector('path').getAttribute('fill'):null,
            lblPx:parseFloat(getComputedStyle(hd.querySelector('b')).fontSize),
            starW:svg?parseFloat(getComputedStyle(svg).width):null};
  });
  await pg.close();
  ok('Discovery Star uses the same gradient star', !d.missing && /^url\(#wksStarG\d+\)$/.test(d.fill), d.fill);
  ok('but keeps its OWN 11px label, untouched', d.lblPx===11, d.lblPx);
  ok('and its own 13px star size', d.starW===13, d.starW);

  await b.close(); srv.close();
  console.log('\n'+(pass+fail)+' checks, '+fail+' failures');
  process.exit(fail?1:0);
})().catch(e=>{console.error('HARNESS ERROR:',e.message);srv.close();process.exit(1)});
