// 🚨 HER TWO KINDS OF NO (2026-08-25). Catherine's veto is a CURATION preference
// and waives when a woman asks by name; the WOMAN'S OWN never-wear list is her
// boundary and never waives. Drives the REAL filterNeverWear out of index.html.
import fs from 'fs';
const h=fs.readFileSync('index.html','utf8');
const grab=re=>{const m=h.match(re); if(!m) throw new Error('not found: '+re); return m[0];};
const src=[grab(/const _STYLIST_VETO=\[[^\]]*\];/),
           grab(/const _SEARCH_VETO=\[[^\]]*\];/),
           grab(/function filterNeverWear\(items,askedFor\)\{[\s\S]*?\n\}/)].join('\n');
let f=0,c=0; const ok=(n,cond,x)=>{c++;console.log((cond?'PASS ':'FAIL ')+n+(x?'  ['+x+']':''));if(!cond)f++;};
const run=(items,asked,prefs)=>new Function('prefs','items','asked',
  src+'\nreturn filterNeverWear(items,asked);')(prefs,items,asked);
const P=(o={})=>Object.assign({neverWear:[],neverPatterns:[],neverOther:''},o);
const I=(...n)=>n.map(x=>({name:x,search:x.toLowerCase()}));

// ── CATHERINE'S VETO: silent unless asked, fetched when asked ────────────────
ok('unasked, skinny jeans are still dropped',
   run(I('Skinny Jeans','Straight Leg Jeans'),'',P()).length===1);
ok('unasked, ribbed is still dropped',
   run(I('Ribbed Knit Tank','Cotton Tank'),'',P()).length===1);
ok('SHE ASKS for skinny jeans -> she gets them',
   run(I('Skinny Jeans','High Rise Skinny Jeans'),'skinny jeans',P()).length===2);
ok('SHE ASKS for ribbed -> she gets it',
   run(I('Ribbed Knit Tank'),'ribbed tank',P()).length===1);
ok('asking for skinny jeans does NOT unlock ribbed',
   run(I('Ribbed Tank'),'skinny jeans',P()).length===0);
ok('a near-miss ask does not unlock it',
   run(I('Skinny Jeans'),'straight leg jeans',P()).length===0);

// ── 🚨 THE LINE THAT MUST NOT MOVE: HER OWN never-wear list ─────────────────
ok('HER never-wear still blocks even when she asks by name',
   run(I('Skinny Jeans'),'skinny jeans',P({neverWear:['skinny jeans']})).length===0);
ok('HER never-wear still blocks a Catherine-vetoed word she asked for',
   run(I('Ribbed Tank'),'ribbed tank',P({neverWear:['ribbed']})).length===0);
ok('HER free-text hard no still blocks when asked for',
   run(I('Crop Top'),'crop top',P({neverOther:'no crop tops'})).length===0);
ok('HER pattern no still blocks when asked for',
   run(I('Leopard Midi Dress'),'leopard dress',P({neverPatterns:['leopard']})).length===0);

// ── the search veto is unchanged ────────────────────────────────────────────
ok('wrap still dropped unasked', run(I('Wrap Dress'),'',P()).length===0);
ok('wrap still allowed when asked', run(I('Wrap Dress'),'wrap dress',P()).length===1);

// ── ordinary shopping is untouched ─────────────────────────────────────────
ok('an ordinary six survives untouched',
   run(I('Black Midi Dress','Silk Blouse','Wide Leg Trouser','Tote Bag','Gold Hoops','Ballet Flats'),'black midi dress',P()).length===6);
console.log(`\n${c} checks, ${f} failures`);
process.exit(f?1:0);
