// ── Style Star: archetype share card, design options ──────────────────────────
// Draws each candidate on a REAL canvas at the shipping size (1080x1350) with the
// REAL webfonts served locally, then screenshots the canvas. So what she picks is
// literally what the pipeline would produce — not an HTML mockup of it.
//
// Fonts: Chromium in this sandbox cannot reach fonts.googleapis.com, so the cached
// woff2 files in scratchpad/fonts are served locally (the renderfonts.mjs pattern,
// 2026-08-17). A render in fallback faces looks plausible and is worthless.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PORT = 8971;

const MIME = {'.css':'text/css','.woff2':'font/woff2','.png':'image/png','.html':'text/html'};
const srv = http.createServer((req,res)=>{
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]).replace(/^\//,''));
  fs.readFile(f,(e,buf)=>{
    if(e){res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});
    res.end(buf);
  });
});
await new Promise(r=>srv.listen(PORT,r));   // resolve must BE the callback (2026-08-21)

const browser = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const page = await browser.newPage({viewport:{width:1200,height:1500},deviceScaleFactor:1});

await page.goto(`http://localhost:${PORT}/scratchpad/cardpage.html`);
await page.waitForFunction(()=>window.__fontsReady===true, null, {timeout:20000});
await page.evaluate(()=>window.__logoReady);   // a half-loaded logo paints nothing and looks like a design choice

// Prove the real faces painted — a computed font-family returns the DECLARED stack,
// so it lies. Width against generic serif is the honest probe (2026-08-17).
// Probe each face in the EXACT style the cards paint it. A computed font-family
// returns the declared stack, and document.fonts.check() returns true for a
// fallback, so width-against-generic is the only honest test (2026-08-17).
const fontProof = await page.evaluate(async ()=>{
  const c=document.createElement('canvas').getContext('2d');
  const w=spec=>{c.font=spec;return c.measureText('The Statement Maker').width;};
  return {
    dmserif:  w('72px "DM Serif Display", serif'),  dmserifBase:  w('72px serif'),
    loraItal: w('italic 400 72px "Lora", serif'),   loraItalBase: w('italic 400 72px serif'),
    jost:     w('600 72px "Jost", sans-serif'),     jostBase:     w('600 72px sans-serif')
  };
});
const pairs=[['DM Serif Display','dmserif','dmserifBase'],['Lora italic','loraItal','loraItalBase'],['Jost','jost','jostBase']];
let bad=false;
for(const [label,a,b] of pairs){
  const d=Math.abs(fontProof[a]-fontProof[b]);
  console.log((d<1?'FAIL':'ok  ')+'  '+label+'  '+fontProof[a].toFixed(1)+' vs generic '+fontProof[b].toFixed(1));
  if(d<1)bad=true;
}
if(bad){console.error('A render in fallback faces looks plausible and is worthless. Stopping.');process.exit(1);}

const OPTS = (process.argv[2]||'A,B,C').split(',');
for(const o of OPTS){
  const stress = o.endsWith('!');
  let key = stress ? o.slice(0,-1) : o;
  let mode='linen';
  const m=key.match(/^([A-Z])-(\w+)$/); if(m){key=m[1];mode=m[2];}
  await page.evaluate(([k,st,pm])=>{window.setPaper(pm);window.setStress&&window.setStress(st);window.drawOption(k);}, [key,stress,mode]);
  const el = await page.$('#card');
  await el.screenshot({path:`scratchpad/share-${o.replace('!','-stress')}.png`});
  console.log('wrote scratchpad/share-'+o.replace('!','-stress')+'.png');
}

await browser.close();
srv.close();
