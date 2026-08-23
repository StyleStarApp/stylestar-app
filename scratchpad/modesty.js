// Cath, 2026-08-23, on funeral / memorial / interview: "closer to professional
// and more modest (less alluring)". Her ALLURING dimension already scores every
// store, so the question is only HOW an occasion should touch it.
// ▶ THE DESIGN QUESTION THIS ANSWERS: replace her alluring the way formality
//   replaces her dressy lean, or CAP it? They behave very differently for the
//   woman who is already modest.
const fs=require('fs');
const S=eval('('+fs.readFileSync('index.html','utf8').match(/const STORES=\{[\s\S]*?\n\};/)[0].replace('const STORES=','').replace(/;\s*$/,'')+')');
const REL=0,ALL=1,POL=2,CLA=3,TRE=4,CAS=5,DRE=6,FIT=7,NEU=8,COL=9;
const hd=a=>{const t=v=>1+(v-1)*0.9,w=v=>(v-1)/10;
  return {all:t((a[1]+a[10])/2),trendy:w(a[0]),dressy:w(a[4]),fitted:w(a[8]),color:w(a[6])}};
const fit=(k,h)=>{const d=S[k].d;
  return (1-h.fitted)*d[REL]+h.fitted*d[FIT]+(1-h.trendy)*d[CLA]+h.trendy*d[TRE]
    +(1-h.dressy)*d[CAS]+h.dressy*d[DRE]+(1-h.color)*d[NEU]+h.color*d[COL]
    -Math.abs(d[ALL]-h.all)*2.5+d[POL]*0.15};
const rank=h=>Object.keys(S).map(k=>({k,f:fit(k,h)})).sort((a,b)=>b.f-a.f).map(x=>x.k);

const GLAM =[10,10,6,6,9,6,8,6,10,6,10,6];  // alluring reads ~10
const QUIET=[3,2,6,6,3,6,3,6,3,6,3,6];      // alluring reads ~2.4
const MODEST_TARGET=3;                       // the candidate cap

function show(label,ans,occF){
  const base=hd(ans);
  const her=Object.assign({},base,{dressy:occF});
  const capped=Object.assign({},her,{all:Math.min(her.all,MODEST_TARGET)});
  const replaced=Object.assign({},her,{all:MODEST_TARGET});
  const r0=rank(her), rC=rank(capped), rR=rank(replaced);
  console.log(`\n${label}  (her alluring reads ${base.all.toFixed(1)}/10)`);
  console.log('  formality only      : '+r0.slice(0,6).map(k=>`${k}(a${S[k].d[ALL]})`).join(' '));
  console.log('  + modesty CAP       : '+rC.slice(0,6).map(k=>`${k}(a${S[k].d[ALL]})`).join(' '));
  console.log('  + modesty REPLACE   : '+rR.slice(0,6).map(k=>`${k}(a${S[k].d[ALL]})`).join(' '));
  const loud=l=>l.slice(0,10).filter(k=>S[k].d[ALL]>=7).length;
  console.log(`  loud stores (alluring>=7) in the top 10:  formality-only ${loud(r0)}  ·  cap ${loud(rC)}  ·  replace ${loud(rR)}`);
}
show('A GLAM WOMAN asks for a funeral', GLAM, 0.7);
show('A QUIET WOMAN asks for a funeral', QUIET, 0.7);
show('A GLAM WOMAN asks for an interview', GLAM, 0.7);
