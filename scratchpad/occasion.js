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

  console.log('\n── PART 5c: a religious service, and the substring traps ──');
  for(const ask of ['what to wear to church','synagogue outfit','mosque visit','religious service dress']){
    const d=await pg.evaluate(a=>{_ssAsk=a;return _askedForRule()},ask);
    ok(d.indexOf('Covered shoulders')>=0,            `"${ask}" carries the modesty rule`);
    ok(d.indexOf('Color and print are welcome')>=0,  `"${ask}" allows colour (NOT the sombre rule)`);
    ok(d.indexOf('NEVER a mini skirt')<0,            `"${ask}" does NOT inherit the sombre definition`);
  }
  // 🚨 SUBSTRING TRAPS. _askOccasion matches by indexOf, so a short phrase can
  // fire on an unrelated word. These are the ones that would really happen.
  for(const [ask,shouldMatch] of [
      ['a classic black dress',   false],   // 'class' would have fired -> deliberately absent
      ['something classy',        false],
      ['massage robe',            false],   // 'mass' would have fired -> deliberately absent
      ['a massive tote bag',      false],
      ['courtside seats outfit',  false],
      ['what to wear to church',  true ],
      ['school outfit',           true ]]){
    const got=await pg.evaluate(a=>_askOccasion(a)!==null,ask);
    ok(got===shouldMatch, `"${ask}" ${shouldMatch?'matches':'matches NOTHING'}`);
  }
  // 🚨🚨 THE MIRRORED SUBSTRING TRAP, AND IT IS HER MOTHER'S OWN REPRO
  // (2026-08-24). She typed "Grandmother of the bride" and every one of the six
  // cards came back named "Mother of the Bride Dress", because
  // "grandmother of the bride" CONTAINS "mother of the bride".
  // ▶ THE CASES ABOVE PIN THE OPPOSITE DIRECTION - a SHORT phrase firing inside
  // a longer WORD ('mass' in "massage"). This is a longer WORD swallowing the
  // phrase from the FRONT, which is why those six could not catch it. Keep both
  // families here so neither direction can regress.
  console.log('\n── PART 5d: the relations, and her mother\'s repro ──');
  for(const [ask,want] of [
      ['Grandmother of the bride',  'grandmother of the bride'],
      ['grandmother of the groom',  'grandmother of the groom'],
      ['godmother of the bride',    'godmother of the bride'],
      ['godmother of the groom',    'godmother of the groom'],
      ['stepmother of the bride',   'stepmother of the bride'],
      ['stepmother of the groom',   'stepmother of the groom'],
      ['mother of the bride',       'mother of the bride'],
      ['mother of the groom',       'mother of the groom']]){
    const got=await pg.evaluate(a=>{const o=_askOccasion(a);return o?o.p:null},ask);
    ok(got===want, `"${ask}" resolves to "${want}"`, got);
  }
  // HER TWO CALLS, pinned so neither can drift: identical formality to the
  // mother, and all six relations treated the same.
  const rel=await pg.evaluate(()=>['grandmother of the bride','grandmother of the groom',
      'godmother of the bride','godmother of the groom','stepmother of the bride',
      'stepmother of the groom','mother of the bride','mother of the groom']
      .map(p=>{const o=_askOccasion(p);return o?[o.f,o.retail,!!o.range,!!o.define].join():'MISSING'}));
  ok(rel.every(r=>r===rel[0]), 'all eight relations carry identical formality and flags', rel.join(' | '));
  ok(rel[0]==='1,true,false,false', 'and that is f=1.0, retail:true, no range, no definition', rel[0]);
  // ▶ THE POINT OF THE WHOLE FIX: the app says HER word back to her. The prompt
  // must carry the phrase she typed, and must NOT carry the one she did not.
  for(const [ask,her,notHers] of [
      ['Grandmother of the bride dress', 'grandmother of the bride', 'mother of the bride dress'],
      ['stepmother of the bride dress',  'stepmother of the bride',  'mother of the bride dress']]){
    const d=await pg.evaluate(a=>{_ssAsk=a;return _askedForRule()},ask);
    ok(d.indexOf('SHE HAS NAMED AN OCCASION: "'+her+'"')>=0, `"${ask}" puts HER phrase in the prompt`);
    ok(d.indexOf('RIGHT: "'+notHers)<0, `"${ask}" never holds up "${notHers}" as the model search`);
    ok(d.indexOf('the 2-to-4-word limit above DOES NOT APPLY')>=0, `"${ask}" keeps the word-cap exemption`);
  }
  await pg.evaluate(()=>{_ssAsk=''});

  // 🚨 HER FORMAL-GOWN STORE RESTRICTION (2026-08-24). Her mother's second
  // finding: three of her six cards were stores that do not stock the category.
  // ⚠️ THE LIST IS HERS. These assertions exist so it cannot be grown by
  // keyword-matching c: lines, which is how "occasion" came to mean two things.
  console.log('\n── PART 5e: formal gowns, her word and her list ──');
  const GOWN=['Nordstrom',"Dillard's","Macy's",'Bloomingdales','Belk','Saks',
    'Neiman Marcus','Bergdorf Goodman','NET-A-PORTER','Nordstrom Rack','Alice + Olivia'];
  const gs=await pg.evaluate(()=>({list:_GOWN_STORES.slice(),known:_GOWN_STORES.filter(k=>!STORES[k])}));
  ok(gs.known.length===0, 'every gown store is a real key in STORES', gs.known.join());
  ok(JSON.stringify(gs.list)===JSON.stringify(GOWN), 'her eleven, unchanged', gs.list.join(' | '));
  // The three she crossed off, and the three her mother was actually sent to.
  // ⚠️ 'Baltic Born' WAS in this list and is DELETED, not silenced: she removed
  // the store from the table entirely on 2026-08-24, so its SUBJECT is retired
  // and the assertion would now pass vacuously -- a store that does not exist
  // cannot be in _GOWN_STORES. (The hiwcheck.js precedent.)
  ['Revolve','LoveShackFancy','Anthropologie','Tuckernuck','J.Crew','Ann Taylor','Reformation']
    .forEach(k=>ok(gs.list.indexOf(k)<0, `${k} is NOT a formal-gown store`));
  // Which asks carry it, and which deliberately do not.
  for(const [ask,want] of [
      ['Grandmother of the bride dress', true ],
      ['mother of the groom outfit',     true ],
      ['stepmother of the bride dress',  true ],
      ['black tie wedding',              true ],
      ['gala dress',                     true ],
      ['formal dress',                   true ],
      ['prom dress',                     false],   // her call: Revolve is great for prom
      ['homecoming dress',               false],
      ['bridesmaid dress',               false],   // J.Crew genuinely does these
      ['wedding guest dress',            false],
      ['cocktail dress',                 false]]){
    const d=await pg.evaluate(a=>{_ssAsk=a;return _askedForRule()},ask);
    const has=d.indexOf('THIS CALLS FOR A FORMAL GOWN')>=0;
    ok(has===want, `"${ask}" ${want?'restricts to the gown stores':'is NOT restricted'}`);
  }
  // The rule must NAME the failures, which is what makes a rule land here.
  const gr=await pg.evaluate(()=>{_ssAsk='mother of the bride dress';return _askedForRule()});
  ['J.Crew','Ann Taylor','Tuckernuck'].forEach(k=>
    ok(gr.indexOf(k)>=0, `the rule names ${k} as a WRONG store`));
  GOWN.forEach(k=>ok(gr.indexOf(k)>=0, `the rule offers ${k}`));
  ok(gr.indexOf('Order the list above by how well each store suits her')>=0,
     'FIT BEATS DEPTH survives inside the restriction');
  // ⚠️ black tie / gala / formal are retail:FALSE, so the restriction must live
  // outside the retail branch or they would silently lose it.
  const bt=await pg.evaluate(()=>{_ssAsk='black tie gala';return _askedForRule()});
  ok(bt.indexOf('THIS CALLS FOR A FORMAL GOWN')>=0, 'a retail:false occasion still gets the gown stores');
  ok(bt.indexOf('keep that word OUT of the search terms')>=0, 'and still keeps its own retail:false rule');
  await pg.evaluate(()=>{_ssAsk=''});

  // ── PART 5f: PROM AND HOMECOMING, her list (2026-08-24) ──────────────────
  // Step 5 of her own ladder. The load-bearing claim is that this is a THIRD
  // department: nine of the twelve overlap with the gown list, and the three
  // that differ are the entire reason it is a separate list.
  console.log('\n── PART 5f: prom and homecoming, her twelve ──');
  const PROM=['Nordstrom',"Dillard's","Macy's",'Bloomingdales','Belk','Saks',
    'Neiman Marcus','Bergdorf Goodman','Nordstrom Rack','TJ Maxx','Amazon','Revolve'];
  const ps=await pg.evaluate(()=>({list:_PROM_STORES.slice(),
    unknown:_PROM_STORES.filter(k=>!STORES[k])}));
  ok(ps.unknown.length===0, 'every prom store is a real key in STORES', ps.unknown.join());
  ok(JSON.stringify(ps.list)===JSON.stringify(PROM), 'her twelve, unchanged', ps.list.join(' | '));
  // ⚠️ NOT vacuous: every name below EXISTS in STORES, and NET-A-PORTER and
  // Alice + Olivia are both on the GOWN list, so they are the exact stores a
  // careless "reuse the gown list" would have dragged in. Her words on
  // NET-A-PORTER: "not so much for teens".
  ['NET-A-PORTER','Alice + Olivia','J.Crew','Ann Taylor','Tuckernuck','LoveShackFancy']
    .forEach(k=>ok(ps.list.indexOf(k)<0, `${k} is NOT a prom store`));
  // The two lists are genuinely different, which is the whole argument for two.
  const both=await pg.evaluate(()=>({
    onlyProm:_PROM_STORES.filter(k=>_GOWN_STORES.indexOf(k)<0),
    onlyGown:_GOWN_STORES.filter(k=>_PROM_STORES.indexOf(k)<0)}));
  ok(both.onlyProm.length>0&&both.onlyGown.length>0,
     'the prom and gown lists really do differ in BOTH directions',
     'prom-only '+both.onlyProm.join()+' / gown-only '+both.onlyGown.join());
  ok(both.onlyGown.indexOf('NET-A-PORTER')>=0, 'NET-A-PORTER is gown-only, her call');
  // 🚨 'homecoming' USED TO MATCH NOTHING AT ALL -- it was absent from the table,
  // so a woman typing it got no occasion, no formality and no store list.
  const hc=await pg.evaluate(()=>_askOccasion('homecoming dress'));
  ok(!!hc, 'a woman typing "homecoming" now matches an occasion at all');
  ok(hc&&hc.f===0.9, 'homecoming carries prom\'s formality, her pairing', hc&&String(hc.f));
  ok(hc&&hc.retail===true, 'homecoming is retail:true -- MEASURED at Dillard\'s, 146 mentions against 0 on the gibberish control');
  for(const [ask,want] of [
      ['prom dress',                     true ],
      ['homecoming dress',               true ],
      ['I need a homecoming outfit',     true ],
      ['mother of the bride dress',      false],
      ['black tie wedding',              false],
      ['wedding guest dress',            false],
      ['cocktail dress',                 false]]){
    const d=await pg.evaluate(x=>{_ssAsk=x;return _askedForRule()},ask);
    const has=d.indexOf('THIS IS A PROM OR HOMECOMING DRESS')>=0;
    ok(has===want, `"${ask}" ${want?'restricts to the prom stores':'is NOT prom-restricted'}`);
  }
  // ⚠️ THE TWO RESTRICTIONS MUST NEVER BOTH FIRE: they name different, partly
  // contradictory store lists, so a prompt carrying both would be incoherent.
  const pr=await pg.evaluate(()=>{_ssAsk='prom dress';return _askedForRule()});
  ok(pr.indexOf('THIS CALLS FOR A FORMAL GOWN')<0, 'prom does NOT also get the gown restriction');
  PROM.forEach(k=>ok(pr.indexOf(k)>=0, `the prom rule offers ${k}`));
  ok(pr.indexOf('Order the list above by how well each store suits her')>=0,
     'FIT BEATS DEPTH survives inside the prom restriction too');
  ok(pr.indexOf('"prom" whole and unbroken')>=0||pr.indexOf('prom dress" / "prom gown')>=0,
     'and prom keeps its retail:true search rule');
  await pg.evaluate(()=>{_ssAsk=''});

  // The dress-down end, her new territory.
  const low=await pg.evaluate(()=>({
    school:(_askOccasion('school outfit')||{}).f, concert:(_askOccasion('concert outfit')||{}).f,
    festival:(_askOccasion('festival dress')||{}).f, picnic:(_askOccasion('picnic dress')||{}).f,
    game:(_askOccasion('game day outfit')||{}).f,
    gym:_askOccasion('gym clothes'), pool:_askOccasion('pool party'), beach:_askOccasion('beach day')}));
  ok(low.school===0.35&&low.concert===0.5&&low.festival===0.45&&low.picnic===0.4&&low.game===0.3,
     'the dress-down band carries her numbers');
  // 🚨 HER LIST'S OWN FINDING: these three are CATEGORY asks, not occasions, and
  // adding them would send a quiet woman to Frank & Eileen for activewear.
  // ⚠️ Game day must NOT force its phrase into all six searches: it is an
  // OUTFIT occasion, not a one-garment one. Marked retail:true first and the
  // live run came back with six items all named "Game Day <something>".
  const gd=await pg.evaluate(()=>{_ssAsk='game day outfit';return _askedForRule()});
  ok(gd.indexOf('no sequins, no strappy heels')>=0,'game day bans sequins and strappy heels (her call)');
  ok(gd.indexOf('sneakers and boots are welcome')>=0,'game day WELCOMES sneakers');
  ok(gd.indexOf('A mini skirt is fine')>=0,'game day allows a mini skirt (her call)');
  // 🚨 Sneakers are banned in the professional rule and welcomed here. Same word,
  // opposite standing, both hers. This pins that they never drift together.
  const iv=await pg.evaluate(()=>{_ssAsk='job interview outfit';return _askedForRule()});
  ok(iv.indexOf('NEVER flip flops or sneakers')>=0 && gd.indexOf('sneakers and boots are welcome')>=0,
     'sneakers stay BANNED for an interview and WELCOME for game day');
  const ch=await pg.evaluate(()=>{_ssAsk='what to wear to church';return _askedForRule()});
  ok(ch.indexOf('NEVER satin')>=0,'church bans satin (her call)');
  ok(ch.indexOf('Color and print are welcome')>=0,'church still welcomes colour and print');
  ok(gd.indexOf('whole and unbroken')<0,'game day does NOT force its phrase into every search');
  ok(gd.indexOf('keep that word OUT of the search')>=0,'game day lets the garment carry it instead');
  ok(low.gym===null&&low.pool===null&&low.beach===null,
     'gym, pool party and beach day are deliberately NOT occasions (see scratchpad/lowform.js)');

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
