// v2, from her four notes: the REAL wishlist crown (copied verbatim from
// #s-wishlist, not rebuilt), the disclosure pushed lower, much bigger group
// headers, and her own written note under any item she annotates.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve('/home/user/stylestar-app'), PORT = 8955;
const css = fs.readFileSync(ROOT+'/scratchpad/fonts/gf.css','utf8')
  .replace(/url\((f\d+\.woff2)\)/g, `url(http://localhost:${PORT}/scratchpad/fonts/$1)`);
const srv = http.createServer((q,r)=>{const p=decodeURIComponent(q.url.split('?')[0]),f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('x')}
  r.writeHead(200,{'content-type':p.endsWith('.woff2')?'font/woff2':'text/html'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(PORT,r));

const HEART = 'M12 21s-8.5-5.4-8.5-11A4.7 4.7 0 0 1 12 7a4.7 4.7 0 0 1 8.5 3c0 5.6-8.5 11-8.5 11z';
// Copied VERBATIM from #s-wishlist in index.html: the ellipse-pattern chain,
// the ring/ringf curtain-ring interlock, and the two-path heart. Don't redraw.
const CROWN_PATH = 'M12 21.6 C10.7 18.9 8.2 17 5.9 14.7 C3.6 12.4 2 10.4 2 7.7 C2 4.8 4.2 2.7 7 2.7 C9.5 2.7 11.3 4.6 12 7.1 C12.7 4.6 14.5 2.7 17 2.7 C19.8 2.7 22 4.8 22 7.7 C22 10.4 20.4 12.4 18.1 14.7 C15.8 17 13.3 18.9 12 21.6 Z';
const crown = inner => `<div class="wl-crown">
  <svg class="wl-chain" viewBox="0 0 8 66" preserveAspectRatio="none" aria-hidden="true"><defs><pattern id="wlChainPat" x="0" y="0" width="8" height="16" patternUnits="userSpaceOnUse"><ellipse cx="4" cy="4.5" rx="2.9" ry="4.2" fill="none" stroke="#DDAF3F" stroke-width="1.4"/><ellipse cx="4" cy="12.5" rx="1.2" ry="4.2" fill="none" stroke="#C89A2C" stroke-width="1.4"/></pattern></defs><rect x="0" y="0" width="8" height="66" fill="url(#wlChainPat)"/></svg>
  <span class="wl-ring"></span><span class="wl-ringf"></span>
  <svg class="wl-crownheart" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="#C89A2C" stroke-width=".82" d="${CROWN_PATH}"/><path fill="#FEF6D6" stroke="#EBD9A0" stroke-width=".55" d="${CROWN_PATH}"/></svg>
  ${inner}</div>`;

const ROWS = [
  { k:'x', name:'Diane von Furstenberg Flag Scarf — Myrtle Berry', store:'Diane von Furstenberg', price:'$198',
    note:'Any colour but the red one!' },
  { k:'x', name:'Black studded shoulder bag', store:'Valentino', price:'$1,890',
    note:'Black hardware if they have it.' },
  { k:'x', name:'FARM Rio Pink Garden Terrace Maxi Dress', store:'FARM Rio', price:'$360',
    note:'Size 8. This is the one for the wedding in June.' },
  { k:'f', name:'White Linen Button-Front Blouse', store:'J.Crew',
    note:'Size medium, I like them a little oversized.' },
  { k:'f', name:'Tan Pointed Ballet Flats', store:'Nordstrom' },
];
const row = r => `<div class="row"><div class="rb"><span class="nm">${r.name}</span>
  <span class="st">${r.store}${r.price?`<span class="pr">${r.price}</span>`:''}</span>
  ${r.note?`<span class="onote">${r.note}</span>`:''}</div>
  <a class="go" href="#">${r.k==='x'?'Shop it':'Find it'} &rarr;</a></div>`;

const grp = (hdr, label, k) => `${hdr(label)}<div class="card">${ROWS.filter(r=>r.k===k).map(row).join('')}</div>`;
// h1: her own section-header language (the wardrobe categories' 2px gold bar), grown.
const h1 = l => `<div class="gh1"><span>${l}</span></div>`;
// h2: the same gold bar, but the heading set in the app's display serif.
const h2 = l => `<div class="gh2"><span>${l}</span></div>`;

const BASE = `*{box-sizing:border-box;margin:0;padding:0}
  body{background:#1a1a1a;font-family:'Jost',sans-serif}
  .lbl{font:600 12px/1.4 'DM Sans',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#F2D889;padding:14px 16px 4px}
  .lbl span{display:block;font:400 12px/1.5 'DM Sans',sans-serif;letter-spacing:0;text-transform:none;color:#b9b2a4;margin-top:4px}
  .paper{background:#FBFAF7;border:1px solid #e7e0cf;margin:0 16px 18px;padding:0 16px 22px}
  /* the rod, verbatim gradient from #s-wishlist .wl-rod */
  .rodwrap{position:relative;height:8px;margin:0 -16px}
  .rod{position:absolute;inset:0;background:linear-gradient(180deg,#FBF1C2 0%,#EAC24E 40%,#C89A2C 74%,#8a6a17 100%);
    box-shadow:0 4px 9px -3px rgba(120,90,20,.5),inset 0 1px 0 rgba(255,255,255,.6)}
  .wl-crown{position:relative;width:196px;height:196px;margin:6px auto 0}
  .wl-chain{position:absolute;left:calc(50% - 4px);bottom:calc(100% - 60px);width:8px;height:66px;z-index:1}
  .wl-ring,.wl-ringf{position:absolute;left:calc(50% - 6px);bottom:calc(100% + 4px);width:12px;height:12px;
    border-radius:50%;border:2px solid #C89A2C;background:transparent}
  .wl-ring{z-index:5} .wl-ringf{z-index:7;clip-path:inset(50% 0 0 0)}
  .wl-crownheart{position:absolute;inset:0;width:100%;height:100%;display:block}
  .wl-ct{position:absolute;left:50%;transform:translateX(-50%);top:36%;z-index:2;text-align:center;
    font:400 30px/1.1 'Dancing Script',cursive;color:#1f1d19}
  .note{font:400 17px/1.5 'Lora',Georgia,serif;color:#3a352c;text-align:center;margin-top:2px}
  .sig{font:400 26px/1 'Dancing Script',cursive;color:#1f1d19;margin-top:9px;text-align:center}
  /* Pushed lower, her ask -- but it stays ABOVE the first link, which is the
     one thing about its placement that is not a taste call. */
  .disc{font:400 11.5px/1.4 'DM Sans',sans-serif;color:#6e6e6e;text-align:center;margin:26px 0 0}
  .card{background:#fff;border:1px solid #e7e0cf;padding:2px 12px 4px;margin-top:9px}
  .row{display:flex;align-items:flex-start;gap:10px;padding:14px 0;border-top:1px solid #efe9dc}
  .row:first-child{border-top:0}
  .rb{flex:1;min-width:0}
  .nm{display:block;font:600 14px/1.35 'Jost',sans-serif;color:#26221c}
  .st{display:block;font:500 10.5px/1.35 'Jost',sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#8a8272;margin-top:3px}
  .pr{font:700 10.5px/1 'Jost',sans-serif;letter-spacing:.03em;color:#C8971E;margin-left:7px;text-transform:none}
  /* HER OWN words about the piece: size, colour, occasion. Marked with a gold
     rule so it reads as an annotation, never as the retailer's copy. */
  .onote{display:block;font:400 12.5px/1.5 'Jost',sans-serif;color:#5a554c;margin-top:7px;
    padding-left:9px;border-left:2px solid #E0B84C}
  .go{flex:0 0 auto;margin-top:2px;font:600 11px/1 'Jost',sans-serif;letter-spacing:.05em;text-transform:uppercase;
    color:#fff;background:#1a1a1a;border-radius:999px;padding:9px 12px;text-decoration:none;white-space:nowrap}
  /* Both group headers reuse her approved section-header mark: a 2px #D8A52E
     bar hugging the word (the wardrobe categories and the Menu groups). */
  .gh1,.gh2{margin:24px 0 0;text-align:center}
  .gh1 span{display:inline-block;position:relative;padding:0 2px 6px;
    font:700 15px/1 'Jost',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#26221c}
  .gh2 span{display:inline-block;position:relative;padding:0 2px 6px;
    font:400 24px/1.1 'DM Serif Display',Georgia,serif;color:#1f1d19}
  .gh1 span::after,.gh2 span::after{content:"";position:absolute;left:2px;right:-2px;bottom:0;height:2px;background:#D8A52E}
  .foot{text-align:center;margin-top:24px}
  .foot .f1{font:400 11.5px/1.5 'Jost',sans-serif;color:#8a8272}
  .foot .f1 b{color:#3a352c;font-weight:600}
  .foot .f2{display:inline-block;margin-top:9px;font:600 11px/1 'Jost',sans-serif;letter-spacing:.06em;
    text-transform:uppercase;color:#1a1a1a;border:1px solid #D8A52E;padding:9px 14px;text-decoration:none}`;

const page = (inHeart, hdr, showSig) => `<div class="paper">
  <div class="rodwrap"><div class="rod"></div></div>
  ${crown(inHeart ? `<div class="wl-ct">${inHeart}</div>` : '')}
  <div class="note">This is my shopping wishlist!</div>
  ${showSig ? `<div class="sig">Catherine <svg viewBox="0 0 24 24" style="width:16px;height:16px;display:inline-block;vertical-align:-2px;fill:#E0B84C;stroke:#C89A2C;stroke-width:.8;transform:rotate(12deg)"><path d="${HEART}"/></svg></div>` : ''}
  <div class="disc">Some links may earn a commission.</div>
  ${grp(hdr,'Buy exactly this','x')}
  ${grp(hdr,'Anything like this','f')}
  <div class="foot"><div class="f1">Made with <b>Style Star</b></div>
    <a class="f2" href="#">Take the free style quiz &rarr;</a></div></div>`;

const OPTS = [
  ['caps',  'Headers in bigger caps', 'The real crown, wordless. Group headers 15px caps with her gold bar.',
   page('', h1, true)],
  ['serif', 'Headers in the display serif', 'Same page, headers set in DM Serif Display at 24px.',
   page('', h2, true)],
  ['inheart','Her name inside the heart', 'Her handwriting sits in the gold heart, so no separate signature.',
   page('Catherine', h2, false)],
];

const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const [k,title,blurb,html] of OPTS) {
  const pg = await b.newPage({ viewport:{width:390,height:1200}, deviceScaleFactor:2 });
  await pg.route('**/fonts.googleapis.com/**', r=>r.fulfill({status:200,contentType:'text/css',body:css}));
  fs.mkdirSync(ROOT+'/scratchpad/_mock',{recursive:true});
  fs.writeFileSync(`${ROOT}/scratchpad/_mock/v2${k}.html`,`<!doctype html><html><head><meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?x" rel="stylesheet"><style>${BASE}</style></head><body>
    <div class="lbl">${title}<span>${blurb}</span></div>${html}</body></html>`);
  await pg.goto(`http://localhost:${PORT}/scratchpad/_mock/v2${k}.html`);
  await pg.waitForTimeout(1100); try{await pg.evaluate(()=>document.fonts.ready)}catch{}
  await pg.waitForTimeout(400);
  const h = await pg.evaluate(()=>document.body.scrollHeight);
  await pg.setViewportSize({width:390,height:Math.ceil(h)+10}); await pg.waitForTimeout(200);
  await pg.screenshot({path:`${ROOT}/scratchpad/sharev2-${k}.png`});
  await pg.close(); console.log(`  rendered ${k} (${h}px)`);
}
await b.close(); srv.close();
