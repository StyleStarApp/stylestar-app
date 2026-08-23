/* ── scratchpad/chatrank.js ──────────────────────────────────────────────────
   HER OWN TEST CASES, 2026-08-24, verbatim:
     "a relaxed woman who is very modest should never be sent to Revolve even if
      she is looking for a cocktail dress, and a glam, alluring, trendy woman
      should never be sent to J Jill or Chico's even if she is looking for a
      linen dress."
   ▶ SHE ALREADY WROTE THAT RULE. It is in _shopRules from 2026-08-15 and it
   names Revolve: "FIT BEATS DEPTH, ALWAYS ... the wrong door for a relaxed,
   preppy or natural dresser no matter how much it stocks." The chat prompt has
   contained it ZERO times.
   This measures what the ranking would hand the chat, BEFORE the prompt changes,
   so the effect is known rather than hoped. */
import fs from 'fs';
const s=fs.readFileSync('index.html','utf8');
const STORES=eval('('+s.match(/const STORES=\{[\s\S]*?\n\};/)[0].replace('const STORES=','').replace(/;\s*$/,'')+')');
const REL=0,ALL=1,POL=2,CLA=3,TRE=4,CAS=5,DRE=6,FIT=7,NEU=8,COL=9;
const KEYS=Object.keys(STORES);
const herDims=a=>{const t=v=>1+(v-1)*0.9,w=v=>(v-1)/10;
  return {all:t((a[1]+a[10])/2),trendy:w(a[0]),dressy:w(a[4]),fitted:w(a[8]),color:w(a[6])}};
const fit=(k,her)=>{const d=STORES[k].d;
  return (1-her.fitted)*d[REL]+her.fitted*d[FIT]+(1-her.trendy)*d[CLA]+her.trendy*d[TRE]
    +(1-her.dressy)*d[CAS]+her.dressy*d[DRE]+(1-her.color)*d[NEU]+her.color*d[COL]
    -Math.abs(d[ALL]-her.all)*2.5+d[POL]*0.15};
const rank=her=>KEYS.map(k=>({k,f:fit(k,her)})).sort((a,b)=>b.f-a.f).map(x=>x.k);

/* Sliders: 0 classic-trendy, 1 natural-glam, 2 preppy-edgy, 3 simple-detailed,
   4 casual-dressy, 5 sporty-professional, 6 neutral-colorful, 7 solids-prints,
   8 relaxed-fitted, 9 comfort-style, 10 modest-alluring, 11 understated-statement */
const WOMEN={
  'HER CASE 1 — relaxed + very modest':[3,2,3,3,4,5,3,3,2,4,1,3],
  'HER CASE 2 — glam, alluring, trendy':[10,10,8,9,8,6,8,8,10,9,10,10],
  'polished professional'              :[5,6,4,6,8,10,4,4,7,7,5,7],
  'preppy classic'                     :[3,4,2,5,6,6,5,6,5,5,4,5],
  'sporty / comfort-first'             :[5,3,4,3,2,2,5,4,5,2,3,4]
};
const WATCH=['Revolve','J.Jill',"Chico's",'Alice + Olivia','Reformation','Eileen Fisher',
             'Soft Surroundings','Bergdorf Goodman','Talbots','Nordstrom'];

console.log('WHERE THE RANKING PUTS HER TEST STORES  (rank of '+KEYS.length+')\n');
console.log('store'.padEnd(20)+Object.keys(WOMEN).map((_,i)=>('w'+(i+1)).padStart(6)).join(''));
const runs=Object.values(WOMEN).map(a=>rank(herDims(a)));
WATCH.forEach(k=>console.log(k.padEnd(20)+runs.map(r=>String(r.indexOf(k)+1).padStart(6)).join('')));
Object.keys(WOMEN).forEach((n,i)=>console.log('  w'+(i+1)+' = '+n));

console.log('\n▶ HER TWO CLAIMS, CHECKED AGAINST THE RANKING SHE BUILT:');
const w1=rank(herDims(WOMEN['HER CASE 1 — relaxed + very modest']));
const w2=rank(herDims(WOMEN['HER CASE 2 — glam, alluring, trendy']));
console.log('  a relaxed, very modest woman ranks Revolve  ' + (w1.indexOf('Revolve')+1) + ' of ' + KEYS.length);
console.log('  a glam, alluring, trendy woman ranks J.Jill ' + (w2.indexOf('J.Jill')+1) +
            "  and Chico's " + (w2.indexOf("Chico's")+1));
console.log('  ▶ so her judgment is ALREADY in the table. The chat simply cannot see it.\n');

console.log('WHAT THE CHAT WOULD BE HANDED — top 8 for each of her two cases:');
console.log('\n  relaxed + very modest:');
w1.slice(0,8).forEach((k,i)=>console.log('    '+String(i+1).padStart(2)+'. '+k.padEnd(20)+'['+STORES[k].t+'] '+(STORES[k].c||'').slice(0,52)));
console.log('\n  glam, alluring, trendy:');
w2.slice(0,8).forEach((k,i)=>console.log('    '+String(i+1).padStart(2)+'. '+k.padEnd(20)+'['+STORES[k].t+'] '+(STORES[k].c||'').slice(0,52)));

/* ⚠️ THE COVERAGE QUESTION, because a chat answer must still be able to find a
   COCKTAIL DRESS for the modest woman - that is the whole point of her example.
   If the stores that suit her carry no occasion dresses, ordering them first
   would be worse than the flat list, not better. */
console.log('\n⚠️ CAN HER TOP 20 ACTUALLY ANSWER THE ASK? (the modest woman, cocktail dress)');
const dressy=w1.slice(0,20).filter(k=>STORES[k].d[DRE]>=6||/dress|occasion/i.test(STORES[k].c||''));
console.log('  stores in her top 20 that carry dressy/occasion: '+dressy.length);
dressy.slice(0,8).forEach(k=>console.log('    '+k.padEnd(20)+'dressy '+STORES[k].d[DRE]+' - '+(STORES[k].c||'').slice(0,46)));
