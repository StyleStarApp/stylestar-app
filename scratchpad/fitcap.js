/* ── scratchpad/fitcap.js ────────────────────────────────────────────────────
   KATHY, 2026-08-24: she ticked "Bodycon/tight dresses" as a hard no and the app
   sent her to REVOLVE, whose scores are relaxed 2 / fitted 10 — the most
   form-fitting store in the table. Every long dress on that landing page was
   form-fitting, exactly as she reported.

   ▶ THE STRUCTURAL FACT: _storeFit reads `prefs` ZERO times. The store ranking is
   built entirely from her 12 quiz sliders, so her never-wear list — the one place
   she says NEVER rather than "less" — has no influence at all on WHICH STORE she
   is sent to. Same shape as her mother's mother-of-the-bride bug: a thing she
   told the app changes the words and not the store list.

   ⚠️ THIS FILE EXISTS BECAUSE OF THE MODESTY CAP. On 2026-08-23 a store-level
   cap was designed, measured, looked clean — and she overruled it: "I am ok with
   all of these stores for a glam woman." MEASURE FIRST, then put numbers to her.
   The question this answers is not "does the cap work" but "what does it COST a
   woman who did not ask for it, and does it move the store that actually offended". */
import fs from 'fs';
const s=fs.readFileSync('index.html','utf8');
const STORES=eval('('+s.match(/const STORES=\{[\s\S]*?\n\};/)[0].replace('const STORES=','').replace(/;\s*$/,'')+')');
const REL=0,ALL=1,POL=2,CLA=3,TRE=4,CAS=5,DRE=6,FIT=7,NEU=8,COL=9;
const KEYS=Object.keys(STORES);
const herDims=a=>{const t=v=>1+(v-1)*0.9,w=v=>(v-1)/10;
  return {all:t((a[1]+a[10])/2),trendy:w(a[0]),dressy:w(a[4]),fitted:w(a[8]),color:w(a[6])}};
const base=(k,her)=>{const d=STORES[k].d;
  return (1-her.fitted)*d[REL]+her.fitted*d[FIT]+(1-her.trendy)*d[CLA]+her.trendy*d[TRE]
    +(1-her.dressy)*d[CAS]+her.dressy*d[DRE]+(1-her.color)*d[NEU]+her.color*d[COL]
    -Math.abs(d[ALL]-her.all)*2.5+d[POL]*0.15};

/* THE CAP IS ONE-SIDED ON PURPOSE. A distance penalty (the shape `alluring` uses)
   would push her toward some ideal fittedness and drag stores UP as well as down.
   She did not say "I want a particular fit", she said "never this". So it only
   ever subtracts, and only from stores past the line — every store she already
   liked keeps its exact score and the list is RE-ORDERED, never trimmed.
   That is her standing guard from 2026-08-15: FIT BEATS DEPTH, the list is
   re-ordered and never cut. */
const cap=(k,her,dim,thr,w)=>base(k,her)-Math.max(0,STORES[k].d[dim]-thr)*w;
const rank=(her,dim,thr,w)=>KEYS.map(k=>({k,f:dim==null?base(k,her):cap(k,her,dim,thr,w)}))
  .sort((a,b)=>b.f-a.f).map(x=>x.k);

// ── what does the table even look like on this axis? ────────────────────────
const hist={};KEYS.forEach(k=>{const v=STORES[k].d[FIT];hist[v]=(hist[v]||0)+1});
console.log('HOW FITTED ARE THE 102 STORES?  (fitted score -> how many)');
console.log('  '+Object.keys(hist).sort((a,b)=>a-b).map(v=>v+':'+hist[v]).join('  '));
const worst=KEYS.filter(k=>STORES[k].d[FIT]>=9).sort((a,b)=>STORES[b].d[FIT]-STORES[a].d[FIT]);
console.log('  fitted >= 9 ('+worst.length+' stores): '+worst.join(', '));
const boxy=KEYS.filter(k=>STORES[k].d[REL]>=9);
console.log('  relaxed >= 9 ('+boxy.length+' stores): '+boxy.join(', ')+'\n');

/* Five women, deliberately opposite, so the cost is measured on the ones who did
   NOT ask for it as well as the one who did. */
const WOMEN={
  'Kathy-ish (relaxed, modest)'   :[4,3,4,4,4,5,4,4,3,5,3,4],
  'relaxed / classic / natural'   :[2,2,3,3,3,5,3,3,2,4,2,3],
  'glam / fitted / trendy'        :[10,10,8,9,9,7,8,8,10,8,10,10],
  'polished professional'         :[5,6,4,6,8,10,4,4,7,7,5,7],
  'preppy classic'                :[3,4,2,5,6,6,5,6,5,5,4,5]
};
const SETTINGS=[[null,null,null],[FIT,8,1.5],[FIT,8,3],[FIT,9,3],[FIT,7,3]];
const LBL=['no cap','>8 x1.5','>8 x3','>9 x3','>7 x3'];

console.log('WHERE DOES REVOLVE LAND?  (rank of 102, fitted 10 — the store that offended)');
console.log('woman'.padEnd(30)+LBL.map(l=>l.padStart(9)).join(''));
for(const [name,ans] of Object.entries(WOMEN)){
  const her=herDims(ans);
  console.log(name.padEnd(30)+SETTINGS.map(([d,t,w])=>
    String(rank(her,d,t,w).indexOf('Revolve')+1).padStart(9)).join(''));
}

console.log('\nWHAT DOES IT COST A WOMAN WHO DID NOT ASK?  (top-10 churn vs no cap)');
console.log('woman'.padEnd(30)+LBL.slice(1).map(l=>l.padStart(9)).join(''));
for(const [name,ans] of Object.entries(WOMEN)){
  const her=herDims(ans), before=rank(her,null).slice(0,10);
  console.log(name.padEnd(30)+SETTINGS.slice(1).map(([d,t,w])=>{
    const after=rank(her,d,t,w).slice(0,10);
    return String(before.filter(k=>!after.includes(k)).length+' out').padStart(9);
  }).join(''));
}

console.log('\nHER TOP TEN, the setting recommended (>8 x3):');
for(const [name,ans] of Object.entries(WOMEN)){
  const her=herDims(ans);
  console.log('\n  '+name);
  console.log('    was: '+rank(her,null).slice(0,10).map(k=>k+'('+STORES[k].d[FIT]+')').join(', '));
  console.log('    now: '+rank(her,FIT,8,3).slice(0,10).map(k=>k+'('+STORES[k].d[FIT]+')').join(', '));
}
