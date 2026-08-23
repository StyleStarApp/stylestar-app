// scratchpad/occasion.js — the occasion half of her ask (2026-08-23).
// Drives the REAL page in Chromium. Born from her mother's "mother of the bride
// dresses" search returning six ordinary midi dresses.
// ▶ THE LOAD-BEARING ASSERTION IS PART 1: a woman who has typed NOTHING must
//   get byte-identical behaviour to before this feature existed. Everything
//   else is upside; that one is the regression guard.
import http from 'http';
import fs from 'fs';
import path from 'path';
const chromium=(await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
process.chdir(path.resolve(path.dirname(new URL(import.meta.url).pathname),'..'));

let pass=0,fail=0;
const ok=(c,m)=>{c?(pass++,console.log('  ok   '+m)):(fail++,console.log('  FAIL '+m))};
const eq=(a,b,m)=>ok(a===b,m+'  (got '+JSON.stringify(a)+')');

(async()=>{
  const srv=http.createServer((rq,rs)=>{
    let f=rq.url.split('?')[0]; if(f==='/')f='/index.html';
    const fp=path.join(process.cwd(),f);
    if(!fs.existsSync(fp)){rs.writeHead(404);return rs.end('x')}
    rs.writeHead(200,{'Content-Type':f.endsWith('.json')?'application/json':'text/html'});
    rs.end(fs.readFileSync(fp));
  });
  await new Promise(r=>srv.listen(0,r));
  const port=srv.address().port;
  const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const pg=await br.newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto(`http://127.0.0.1:${port}/`,{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(400);

  // Seed a relaxed / classic / natural woman, the shape her mother's results point at.
  await pg.evaluate(()=>{
    quizTaken=true;
    answers=[3,2,6,6,3,6,3,6,3,6,3];
    topArchNames=['The Easygoing Natural'];
  });

  console.log('\n── PART 1: nothing typed, nothing changes (the regression guard) ──');
  const base=await pg.evaluate(()=>{
    _ssAsk='';
    return {occ:_askOccF(),rule:_askedForRule(),top:_rankedStores().slice(0,12),
            rules:_shopRules(),full:_rankedStores().join('|')};
  });
  eq(base.occ,null,'_askOccF() is null with no ask');
  eq(base.rule,'','_askedForRule() is empty with no ask');
  ok(base.rules.indexOf('For THIS request the order also carries')<0,
     'no occasion sentence reaches _shopRules() without an ask');
  ok(base.rules.indexOf('2 to 4 plain words')>=0,'the word cap is still stated');

  // The same ranking computed the OLD way (no argument at all), proving the new
  // optional parameter is inert when unused.
  const inert=await pg.evaluate(()=>_rankedStores(undefined).join('|'));
  eq(inert,base.full,'_rankedStores(undefined) is identical to _rankedStores()');
  const nulled=await pg.evaluate(()=>_rankedStores(null).join('|'));
  eq(nulled,base.full,'_rankedStores(null) is identical too');

  console.log('\n── PART 2: the vocabulary matches, longest phrase wins ──');
  const m=await pg.evaluate(()=>({
    mob:(_askOccasion('mother of the bride dresses')||{}).p,
    wg:(_askOccasion('wedding guest dress')||{}).p,
    wed:(_askOccasion('what to wear to a wedding')||{}).p,
    bt:(_askOccasion('black tie event')||{}).p,
    none:_askOccasion('tote bag'),
    empty:_askOccasion(''),
    caps:(_askOccasion('MOTHER OF THE BRIDE')||{}).p
  }));
  eq(m.mob,'mother of the bride','"mother of the bride dresses" matches');
  eq(m.wg,'wedding guest','"wedding guest dress" beats the shorter "wedding"');
  eq(m.wed,'wedding','a plain wedding still matches "wedding"');
  eq(m.bt,'black tie','"black tie event" matches');
  eq(m.none,null,'"tote bag" is not an occasion');
  eq(m.empty,null,'an empty ask is not an occasion');
  eq(m.caps,'mother of the bride','matching is case-insensitive');

  console.log('\n── PART 3: her two worries, measured on the real ranking ──');
  const r=await pg.evaluate(()=>{
    const today=_rankedStores(), formal=_rankedStores(1.0);
    const at=(l,k)=>l.indexOf(k)+1;
    return {tbT:at(today,'Tommy Bahama'),tbF:at(formal,'Tommy Bahama'),
            revT:at(today,'Revolve'),revF:at(formal,'Revolve'),
            aoT:at(today,'Alice + Olivia'),aoF:at(formal,'Alice + Olivia'),
            talT:at(today,'Talbots'),talF:at(formal,'Talbots'),
            norT:at(today,'Nordstrom'),norF:at(formal,'Nordstrom'),
            n:today.length,nf:formal.length};
  });
  eq(r.n,r.nf,'every store is still in the list, none trimmed');
  ok(r.tbF>r.tbT+10,`Tommy Bahama steps back for a formal ask (${r.tbT} -> ${r.tbF})`);
  ok(r.revF>90,`Revolve STAYS at the bottom for a quiet woman (${r.revT} -> ${r.revF})`);
  ok(r.aoF>90,`Alice + Olivia STAYS at the bottom (${r.aoT} -> ${r.aoF})`);
  ok(r.talF<r.talT,`Talbots climbs (${r.talT} -> ${r.talF})`);
  ok(r.norF<r.norT,`Nordstrom climbs (${r.norT} -> ${r.norF})`);

  console.log('\n── PART 4: the search rule, retail:true (her mother) ──');
  const t=await pg.evaluate(()=>{_ssAsk='mother of the bride dresses';
    return {rule:_askedForRule(),occ:_askOccF(),rules:_shopRules('',_askOccF())}});
  eq(t.occ,1.0,'formality 1.0 reaches the ranking');
  ok(t.rule.indexOf('mother of the bride" whole and unbroken')>=0,'the phrase must be carried whole');
  ok(t.rule.indexOf('DOES NOT APPLY')>=0,'the 2-to-4-word limit is explicitly waived');
  ok(t.rule.indexOf('RIGHT: "mother of the bride dress"')>=0,'a RIGHT example is named');
  ok(t.rule.indexOf('WRONG: "occasion midi dress"')>=0,'her mother\'s actual bad search is the WRONG example');
  ok(t.rule.indexOf('ONE clear level of formality')>=0,'a named role does not spread across formality');
  ok(t.rule.indexOf('COVER THE RANGE')<0,'and COVER THE RANGE is correctly absent');
  ok(t.rules.indexOf('For THIS request the order also carries')>=0,'the store list explains its new order');

  console.log('\n── PART 5: the search rule, retail:false (abstract formality) ──');
  const f=await pg.evaluate(()=>{_ssAsk='black tie gala dress'; return _askedForRule()});
  ok(f.indexOf('keep that word OUT of the search')>=0,'an abstract formality word stays out of the search');
  ok(f.indexOf('DOES NOT APPLY')<0,'and the word cap is NOT waived for it');
  const wed=await pg.evaluate(()=>{_ssAsk='wedding outfit'; return _askedForRule()});
  ok(wed.indexOf('COVER THE RANGE')>=0,'a genuinely ambiguous occasion still covers the range');

  console.log('\n── PART 5b: her garment definition for the sombre occasions ──');
  // Cath, 2026-08-23. ⚠️ The load-bearing assertion here is the LAST one: the
  // store ranking must stay untouched, because she overruled a store-level
  // modesty cap ("a glam woman can find a funeral outfit at Neiman Marcus").
  for(const ask of ['something for a funeral','a memorial service','job interview outfit',
                    'what to wear to a court appearance','outfit for a legal appointment']){
    const d=await pg.evaluate(a=>{_ssAsk=a;return _askedForRule()},ask);
    ok(d.indexOf('NEVER anything sexy or revealing')>=0, `"${ask}" carries her modesty rule`);
    ok(d.indexOf('darker colors and solid colors')>=0,   `"${ask}" carries her colour preference`);
    ok(d.indexOf('NEVER a mini skirt')>=0,               `"${ask}" carries her exclusion list`);
    ok(d.indexOf('closed-toe')>=0 && d.indexOf('NEVER flip flops or sneakers')>=0, `"${ask}" carries her shoe rule`);
    ok(d.indexOf('This rule is absolute')>=0,            `"${ask}" closes absolute (the dr3 shape)`);
    ok(d.indexOf('Silk is welcome, but NEVER satin and NEVER velvet')>=0, `"${ask}" carries her fabric call`);
  }
  for(const [ask,want] of [['courtside seats outfit',false],['a food court lunch',false],
                           ['court date outfit',true]]){
    const d=await pg.evaluate(a=>{_ssAsk=a;return _askedForRule()},ask);
    const hit=d.indexOf('NEVER a mini skirt')>=0;
    ok(hit===want, `"${ask}" ${want?'DOES':'does NOT'} trip the professional rule`);
  }
  // An occasion she did NOT write a definition for must not inherit one.
  const noDef=await pg.evaluate(()=>{_ssAsk='wedding guest dress';return _askedForRule()});
  ok(noDef.indexOf('NEVER a mini skirt')<0,'a wedding guest ask does NOT inherit the sombre definition');
  // 🚨 THE ONE SHE OVERRULED: a glam woman asking for a funeral must still be
  // ranked to HER stores. No modesty cap on the ranking, ever.
  const glam=await pg.evaluate(()=>{
    answers=[10,10,6,6,9,6,8,6,10,6,10,6];
    const r=_rankedStores(0.7);
    return {top:r.slice(0,6),loud:r.slice(0,10).filter(k=>STORES[k].d[1]>=7).length};
  });
  ok(glam.loud>=6, 'a glam woman keeps her own loud stores for a funeral ('+glam.loud+' of her top 10) — no store-level modesty cap');
  await pg.evaluate(()=>{answers=[3,2,6,6,3,6,3,6,3,6,3,6]});   // restore the quiet seed

  console.log('\n── PART 6: an ordinary ask is untouched ──');
  const p=await pg.evaluate(()=>{_ssAsk='tote bag';
    return {rule:_askedForRule(),occ:_askOccF(),rules:_shopRules('',_askOccF())}});
  eq(p.occ,null,'a non-occasion ask does not re-rank the stores');
  ok(p.rule.indexOf('COVER THE RANGE')>=0,'it keeps the original cover-the-range wording');
  ok(p.rule.indexOf('DOES NOT APPLY')<0,'and never waives the word cap');
  ok(p.rules.indexOf('For THIS request the order also carries')<0,'no occasion sentence in the store list');

  console.log('\n── PART 7: the other seven shopping surfaces cannot be reached ──');
  const other=await pg.evaluate(()=>{_ssAsk='mother of the bride dresses';
    return {compare:_shopRules('compare'),plain:_shopRules()}});
  ok(other.compare.indexOf('For THIS request the order also carries')<0,
     'the Wardrobe Ideas carousel is unaffected even with an ask set');
  ok(other.plain.indexOf('For THIS request the order also carries')<0,
     'a bare _shopRules() call is unaffected even with an ask set');

  eq(errs.length,0,'zero JS errors on the page');
  await br.close(); srv.close();
  console.log(`\nTOTAL ${pass+fail} checks · passed ${pass} · failed ${fail}`);
  process.exit(fail?1:0);
})();
