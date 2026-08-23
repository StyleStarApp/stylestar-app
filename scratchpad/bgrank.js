// Does Baby Gold really suit "anyone and everyone" (Cath, 2026-08-23)?
// Ranks it for deliberately opposite women, and against the other jewelry
// stores, so her claim is measured rather than assumed.
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
const JW=['Baby Gold','Gorjana','Mejuri','Kendra Scott','Tiffany & Co.'];
const WOMEN=[
  ['quiet relaxed natural (her mother)', [3,2,6,6,3,6,3,6,3,6,3,6]],
  ['classic polished professional',      [3,5,6,6,8,6,4,6,7,6,5,6]],
  ['trendy glam alluring',               [10,10,6,6,9,6,8,6,10,6,10,6]],
  ['sporty casual comfort',              [6,3,6,6,2,6,4,6,4,6,3,6]],
  ['bold colorful creative',             [9,7,6,6,6,6,10,6,6,6,6,6]],
];
console.log('Rank out of 102, jewelry stores only, for five very different women:\n');
console.log('woman'.padEnd(34)+JW.map(j=>j.split(' ')[0].slice(0,9).padStart(10)).join(''));
for(const [label,ans] of WOMEN){
  const r=rank(hd(ans));
  console.log(label.padEnd(34)+JW.map(j=>String('#'+(r.indexOf(j)+1)).padStart(10)).join(''));
}
console.log('\nAnd where it sits among ALL 102 for each woman:');
for(const [label,ans] of WOMEN){
  const r=rank(hd(ans)), p=r.indexOf('Baby Gold')+1;
  const best=JW.map(j=>({j,n:r.indexOf(j)+1})).sort((a,b)=>a.n-b.n)[0];
  console.log(`  ${label.padEnd(34)} Baby Gold #${String(p).padStart(3)}   best jewelry for her: ${best.j} (#${best.n})`);
}
