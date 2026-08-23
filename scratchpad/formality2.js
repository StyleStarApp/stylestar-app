// Cath's question, 2026-08-23: if her mother types "mother of the bride", she
// must not be sent to Tommy Bahama (too casual) NOR to Alice + Olivia / Revolve
// (they carry gowns, but they are contemporary and alluring -- wrong for this
// woman at this occasion). This measures whether her EXISTING dimensions
// already separate those three cases, before anything new is built.
const fs=require('fs');
const s=fs.readFileSync('index.html','utf8');
const STORES=eval('('+s.match(/const STORES=\{[\s\S]*?\n\};/)[0].replace('const STORES=','').replace(/;\s*$/,'')+')');
const REL=0,ALL=1,POL=2,CLA=3,TRE=4,CAS=5,DRE=6,FIT=7,NEU=8,COL=9;
const herDims=a=>{const t=v=>1+(v-1)*0.9,w=v=>(v-1)/10;
  return {all:t((a[1]+a[10])/2),trendy:w(a[0]),dressy:w(a[4]),fitted:w(a[8]),color:w(a[6])}};
function fit(k,her){const d=STORES[k].d;
  return (1-her.fitted)*d[REL]+her.fitted*d[FIT]+(1-her.trendy)*d[CLA]+her.trendy*d[TRE]
    +(1-her.dressy)*d[CAS]+her.dressy*d[DRE]+(1-her.color)*d[NEU]+her.color*d[COL]
    -Math.abs(d[ALL]-her.all)*2.5+d[POL]*0.15}
// The candidate: a bounded bonus on how DRESSY a store is, for this ask only.
const fitF=(k,her,W)=>fit(k,her)+W*(STORES[k].d[DRE]/10);
const rank=(her,W)=>Object.keys(STORES).map(k=>({k,f:W?fitF(k,her,W):fit(k,her)}))
  .sort((a,b)=>b.f-a.f).map(x=>x.k);

const mum=herDims([3,2,6,6,3,6,3,6,3,6,3]);   // relaxed, classic, natural, casual, neutral
const WATCH=['Tommy Bahama','Alice + Olivia','Revolve','Talbots','Nordstrom',"Dillard's",
             'Eileen Fisher','Ann Taylor',"Macy's",'J.Crew','Bloomingdales','Saks'];
console.log('Her mother reads as: alluring '+mum.all.toFixed(1)+'/10, dressy-lean '+mum.dressy.toFixed(2)+', trendy-lean '+mum.trendy.toFixed(2)+'\n');
console.log('RANK OUT OF 101, for the stores she named and their peers:');
console.log('store'.padEnd(17)+'allur dressy | today  W=3   W=5   W=8');
const runs=[0,3,5,8].map(W=>rank(mum,W));
WATCH.forEach(k=>{
  const d=STORES[k].d;
  const cells=runs.map(r=>String(r.indexOf(k)+1).padStart(5)).join(' ');
  console.log(k.padEnd(17)+String(d[ALL]).padStart(5)+String(d[DRE]).padStart(7)+' |'+cells);
});
console.log('\nTop 8 with a formality bonus of W=5:');
rank(mum,5).slice(0,8).forEach((k,i)=>console.log(`  ${i+1}. ${k} [allur ${STORES[k].d[ALL]}, dressy ${STORES[k].d[DRE]}]`));
