// Variant B, and it is a cleaner statement of the rule than a bonus:
// for THIS request only, the OCCASION supplies her casual/dressy lean, and
// every other dimension stays hers. A stylist does exactly this -- a relaxed
// woman still dresses formally for her daughter's wedding, and she is still
// the same relaxed, unflashy, classic woman while she does it.
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
// Occasion overrides ONLY the dressy lean. Nothing else about her moves.
const fitOcc=(k,her,occ)=>fit(k,Object.assign({},her,{dressy:occ}));
const rank=(her,occ)=>Object.keys(STORES)
  .map(k=>({k,f:occ==null?fit(k,her):fitOcc(k,her,occ)}))
  .sort((a,b)=>b.f-a.f).map(x=>x.k);

const mum=herDims([3,2,6,6,3,6,3,6,3,6,3]);
const WATCH=['Tommy Bahama','Faherty','Madewell','Gap','Alice + Olivia','Revolve','Saks',
             'Talbots','Nordstrom',"Dillard's","Macy's",'Eileen Fisher','Ann Taylor','J.Crew','Bloomingdales'];
console.log('OCCASION OVERRIDES HER DRESSY LEAN ONLY (her lean today = 0.20)\n');
console.log('store'.padEnd(17)+'allur dres | today  occ.5 occ.8 occ1.0');
const runs=[null,0.5,0.8,1.0].map(o=>rank(mum,o));
WATCH.forEach(k=>{const d=STORES[k].d;
  console.log(k.padEnd(17)+String(d[ALL]).padStart(5)+String(d[DRE]).padStart(6)+' |'+
    runs.map(r=>String(r.indexOf(k)+1).padStart(6)).join(''))});
console.log('\nTOP 12 for a FORMAL occasion (occ = 1.0):');
rank(mum,1.0).slice(0,12).forEach((k,i)=>
  console.log(`  ${String(i+1).padStart(2)}. ${k.padEnd(18)} [${STORES[k].t}] allur ${STORES[k].d[ALL]}, dressy ${STORES[k].d[DRE]}`));
