// Her ten new occasions would be the app's first DRESS-DOWN entries. Everything
// in _OCCASIONS today sits at 0.6+. This measures what the bottom of the scale
// actually does, for two very different women, before any of it is proposed.
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
const GLAM =[10,10,6,6,9,6,8,6,10,6,10,6];
const QUIET=[3,2,6,6,3,6,3,6,3,6,3,6];
for(const [label,ans] of [['GLAM  ',GLAM],['QUIET ',QUIET]]){
  const base=hd(ans);
  console.log('\n'+label+' (her own dressy lean is '+base.dressy.toFixed(2)+')');
  for(const f of [null,0.6,0.3,0.15,0.0]){
    const h=f===null?base:Object.assign({},base,{dressy:f});
    const top=rank(h).slice(0,6);
    console.log('  '+(f===null?'her own lean':'occasion '+f.toFixed(2)).padEnd(16)+top.join(' · '));
  }
}
// Does an activewear store ever actually reach the top for a gym ask?
console.log('\nWhere the activewear stores land at occasion 0.15:');
for(const [label,ans] of [['GLAM',GLAM],['QUIET',QUIET]]){
  const r=rank(Object.assign({},hd(ans),{dressy:0.15}));
  console.log('  '+label+': '+['Alo Yoga','Athleta','Vuori','Lululemon','Old Navy','Target']
    .map(k=>k+' #'+(r.indexOf(k)+1)).join(' · '));
}
