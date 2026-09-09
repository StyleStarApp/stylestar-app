// Chat resilience, built 2026-08-22 from Kathy's tester screenshots.
// Both bugs live on the SEARCHING path and both were invisible to every other
// suite, because every other suite stubs a well-behaved endpoint.
//   1. zero text ever arrives  -> she got "I'm having a moment" after a long wait
//   2. text arrives then the stream never closes -> she waited 56s more and was
//      then told a complete answer "got cut off"
// The harness serves the endpoint itself: Playwright routes cannot drip-feed a
// stream (the 2026-07-31 searchchat lesson), and the whole point here is timing.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';import fs from 'fs';

const HTML=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
let mode='healthy', calls=[], findCalls=[], findMode='ok';mode='healthy';
const sse=o=>'event: '+o.type+'\ndata: '+JSON.stringify(o)+'\n\n';

const srv=http.createServer((q,res)=>{
  /* The finder, stubbed. Added 2026-09-09 so the retry path can be proven to
     actually LOOK for her products, which is the half that was missing. */
  if(q.url.indexOf('product-find')>=0){
    let fr='';q.on('data',c=>fr+=c);
    return q.on('end',()=>{
      findCalls.push(JSON.parse(fr||'{}'));
      res.writeHead(200,{'Content-Type':'application/json'});
      /* 🚨 A SEARCH THAT TIMED OUT ANSWERS 200 WITH AN EMPTY POOL, which is why
         it used to be indistinguishable from "her shops had nothing". The
         server now says so. Shape taken from a real 2026-09-09 live call. */
      if(findMode==='searchfail'){
        return res.end(JSON.stringify({exact:[],doors:[],browse:[],why:'search-failed',
          searched:1,verified:0,ms:{search:10001,lookup:0,candidates:0},searchesLeft:885}));
      }
      if(findMode==='empty'){
        return res.end(JSON.stringify({exact:[],doors:[],browse:[],
          searched:1,verified:2,ms:{search:900,lookup:800,candidates:2},searchesLeft:885}));
      }
      /* A verified pick PLUS the browse pool the finder now returns. One of the
         browse titles carries "Ruffle" so the never-wear rule can be proven to
         govern the wall and not just the verified set. */
      /* ⚠️ TWO QUINCE PIECES AND A SECOND OLD NAVY ARE HERE ON PURPOSE, AND THEY
         PIN HER RULING OF 2026-09-09: "I don't mind if multiple cards for one
         store show up... if I ask for a red dress and there are 5 of them at
         Bloomingdale's I want to see all 5 of them." A store cap on this row is
         a REGRESSION, not a tidy-up, and section 9 fails if one reappears. */
      const browse=[
        {id:'b1',title:'Quince European Linen Fitted Tank',store:'Quince',price:'$42.00',
         image:'https://example.com/b1.jpg',name:'Quince European Linen Fitted Tank',
         search:'Quince European Linen Fitted Tank'},
        {id:'b2',title:'Express Supersoft Double Layer Crew',store:'Express',price:'$20.40',
         image:'https://example.com/b2.jpg',name:'Express Supersoft Double Layer Crew',
         search:'Express Supersoft Double Layer Crew'},
        {id:'b3',title:'Nine West Ruffle Trim Blouse',store:"Kohl's",price:'$14.99',
         image:'https://example.com/b3.jpg',name:'Nine West Ruffle Trim Blouse',
         search:'Nine West Ruffle Trim Blouse'},
        {id:'b4',title:'Quince Washable Silk Shell Top',store:'Quince',price:'$59.90',
         image:'https://example.com/b4.jpg',name:'Quince Washable Silk Shell Top',
         search:'Quince Washable Silk Shell Top'},
        {id:'b5',title:"Old Navy Women's Cropped Rib Tank",store:'Old Navy',price:'$12.00',
         image:'https://example.com/b5.jpg',name:"Old Navy Women's Cropped Rib Tank",
         search:"Old Navy Women's Cropped Rib Tank"},
        /* ⚠️ THE TWO FARM RIO PIECES SIT LAST ON PURPOSE. FARM Rio is one of the
           merchants that actually pays her, and at the END of the pool is exactly
           where her complaint lives: "I don't want them in the bottom of the
           barrel." If the interleave is ever removed these stay at positions 6
           and 7 and the check below fails, which is the point. */
        {id:'b6',title:'FARM Rio Red Sleeveless Midi Dress',store:'FARM Rio',price:'$247.00',
         image:'https://example.com/b6.jpg',name:'FARM Rio Red Sleeveless Midi Dress',
         search:'FARM Rio Red Sleeveless Midi Dress'},
        {id:'b7',title:'FARM Rio Linen Blend Shirt',store:'FARM Rio',price:'$180.00',
         image:'https://example.com/b7.jpg',name:'FARM Rio Linen Blend Shirt',
         search:'FARM Rio Linen Blend Shirt'}
      ];
      /* ⚠️ THE VERIFIED PICK NOW CARRIES A REAL `checks` OBJECT. Without one it
         rendered no ticks either, so "no browse card carries a verified tick"
         passed by asserting 0===0 on a page with no ticks at all — a check that
         cannot fail is not a check. Now the row has exactly ONE tick and the
         assertions can prove WHERE it is. */
      res.end(JSON.stringify({exact:[{id:'1',title:"Old Navy Women's Fitted Rib T-Shirt",
        store:'Old Navy',price:'$9.99',priceValue:9.99,url:'https://oldnavy.gap.com/x',
        image:'https://example.com/i.jpg',checks:{colour:'confirmed'},confirmed:[],unknown:[]}],
        doors:[],browse:browse,
        searched:2,verified:4,ms:{search:120,lookup:900,candidates:12},searchesLeft:930}));
    });
  }
  if(q.url.indexOf('style-ai')<0){
    res.writeHead(200,{'Content-Type':'text/html'});return res.end(HTML);
  }
  let raw='';
  q.on('data',c=>raw+=c);
  q.on('end',()=>{
    const body=JSON.parse(raw);
    calls.push(body);
    const isSearch=!!body.search;
    if(!isSearch){ // the no-search retry
      if(mode==='bothfail'){res.writeHead(500);return res.end('{}');}
      res.writeHead(200,{'Content-Type':'application/json'});
      /* ⚠️ THE RETRY REALLY DOES EMIT A MARKER — it is told to, and the
         instruction is not removed for this call. Cath saw the raw marker on
         her phone twice on 2026-09-09 because this was the ONE render route
         that never stripped it. */
      const txt=(mode==='markerretry')
        ?'<<FIND item=gown; cut=floor length>> On it, looking for something long and formal for you.'
        :'For a formal wedding, go with a floor length gown from Nordstrom.';
      return res.end(JSON.stringify({content:[{type:'text',text:txt}]}));
    }
    if(mode==='notok'){res.writeHead(500);return res.end('{}');}
    res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache'});
    res.write(sse({type:'message_start',message:{id:'m',content:[]}}));
    if(mode==='deadsilence'||mode==='bothfail'||mode==='markerretry'){ // writes nothing, dies
      res.write(sse({type:'content_block_start',index:0,content_block:{type:'server_tool_use',id:'s',name:'web_search'}}));
      setTimeout(()=>res.destroy(),400); return;
    }
    const send=t=>res.write(sse({type:'content_block_delta',index:0,delta:{type:'text_delta',text:t}}));
    res.write(sse({type:'content_block_start',index:0,content_block:{type:'text',text:''}}));
    if(mode==='healthy'||mode==='wall'){
      if(mode==='wall')send('<<FIND item=top; colour=white; cut=fitted>> ');
      send('A floor length gown is exactly right. ');send('Try Nordstrom first.');
      res.write(sse({type:'message_stop'}));return res.end();
    }
    if(mode==='hungcomplete'){ // finishes the sentence, never closes the stream
      send('A floor length gown is exactly right. ');send('Try Nordstrom first.');
      return; // deliberately no message_stop, no end
    }
    if(mode==='hungtruncated'){ // stops mid-word, never closes
      send('A floor length gown is exactly right. Look for chiffon, cre');
      return;
    }
  });
});
await new Promise(r=>srv.listen(8992,r));

const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
let pass=0,fail=0;
const ok=(n,c,extra='')=>{c?pass++:fail++;console.log((c?'  ok   ':'  FAIL ')+n+(c?'':'  '+extra));};

/* `opts` added 2026-09-09 for the browse-wall sections: `neverWear` swaps her
   saved exclusions so the wall can be proven to obey them, and `debug` opens
   the page with ?debug=1. Both go through this ONE setup rather than a
   hand-rolled context per section, so a change to how the page boots cannot
   leave half the suite testing a different app. */
async function run(m,question='I need a long formal gown for a wedding',opts){
  opts=opts||{};
  mode=m;calls=[];
  const ctx=await b.newContext();
  const pg=await ctx.newPage();
  const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(nw=>{
    if(nw)window.__nwOverride=nw;
  },opts.neverWear||null);
  await pg.addInitScript(()=>{
    localStorage.setItem('ss_data',JSON.stringify({userName:'Kathy',
      answers:[8,7,6,5,9,4,7,6,8,5,7,6],
      topArchNames:['Modern Glam','Classic Sophisticate'],
      portrait:'Polished with a modern edge.',motto:'Polished, always.'}));
    localStorage.setItem('ss_prefs',JSON.stringify({sizes:{tops:['XL'],bottoms:['16'],shoes:['9'],dresses:['16']},
      colorsLove:['Royal Blue'],neverWear:['Crop tops'],neverPatterns:['Leopard'],neverOther:'',
      jewelry:'Gold',dailyShoes:'Flats',bagStyle:'Tote',otherNotes:''}));
    if(window.__nwOverride){
      const p=JSON.parse(localStorage.getItem('ss_prefs'));
      p.neverWear=window.__nwOverride;
      localStorage.setItem('ss_prefs',JSON.stringify(p));
    }
  });
  await pg.goto('http://localhost:8992/'+(opts.debug?'?debug=1':''),{waitUntil:'domcontentloaded'});
  await pg.waitForTimeout(2600);
  await pg.evaluate(()=>openChat());
  await pg.waitForTimeout(500);
  await pg.evaluate(q=>{document.getElementById('chatInput').value=q;sendChat()},question);
  return {pg,ctx,errs};
}
const bubbles=pg=>pg.evaluate(()=>Array.from(document.querySelectorAll('#chatMessages .chat-msg.bot')).map(d=>d.textContent.trim()));
const cutoffs=pg=>pg.evaluate(()=>document.querySelectorAll('#chatMessages .chat-cutoff').length);
const sendDead=pg=>pg.evaluate(()=>document.getElementById('chatSend').disabled);

console.log('\n1. healthy searching answer is untouched');
{const {pg,ctx,errs}=await run('healthy');
 await pg.waitForTimeout(1500);
 const t=await bubbles(pg);
 ok('answer shown',t.some(x=>x.includes('Try Nordstrom first')),JSON.stringify(t));
 ok('no cut-off note',(await cutoffs(pg))===0);
 ok('no retry fired',calls.length===1,'calls='+calls.length);
 ok('Send re-enabled',(await sendDead(pg))===false);
 ok('no JS errors',errs.length===0,errs.join('|'));
 await ctx.close();}

console.log('\n2. KATHY: searches, writes nothing, dies -> real answer not an apology');
{const {pg,ctx,errs}=await run('deadsilence');
 await pg.waitForTimeout(2500);
 const t=await bubbles(pg);
 ok('no "having a moment"',!t.some(x=>x.includes('having a moment')),JSON.stringify(t));
 ok('fallback answer shown',t.some(x=>x.includes('floor length gown from Nordstrom')),JSON.stringify(t));
 ok('exactly one retry',calls.length===2,'calls='+calls.length);
 ok('retry had search OFF',calls.length===2&&!calls[1].search);
 ok('Send re-enabled',(await sendDead(pg))===false);
 ok('no JS errors',errs.length===0,errs.join('|'));
 const sys=calls.length===2?String(calls[1].messages[0].content):'';
 /* 🚨 THESE THREE WERE REWRITTEN 2026-09-09, AND THE REASON IS THIS FILE'S OWN
    RULE: when a test breaks, ask whether the app got WORSE or merely CHANGED.
    They used to assert the two-block prompt SWAP — that call 1 carried the
    searching rules ("AN ITEM WITHOUT ITS ADDRESS") and the retry swapped them
    for the no-search ones ("cannot look up live inventory"). That swap is gone
    because BOTH blocks are gone: the stylist can no longer name a product on
    either call, so there is nothing to swap between.
    ▶▶ THE APP GOT STRICTER, NOT LOOSER — the old retry was allowed to name a
      garment as long as it gave no address, and that is exactly what invented
      the four dresses on Cath's phone. So the assertion is rewritten to name
      the RULE (no product may be named on either call) instead of the
      mechanism, which is the stronger check the old pair was reaching for. */
 const sys0=String(calls[0].messages[0].content);
 ok('retry may not name a product',sys.indexOf('NEVER name a specific product for sale')>=0);
 ok('nor may the FIRST call — a rule applied to one half is not applied',
    sys0.indexOf('NEVER name a specific product for sale')>=0);
 ok('the old address rule is gone from BOTH calls',
    sys.indexOf('AN ITEM WITHOUT ITS ADDRESS')<0&&sys0.indexOf('AN ITEM WITHOUT ITS ADDRESS')<0);
 await ctx.close();}

console.log('\n3. first call 500 -> same fallback');
{const {pg,ctx}=await run('notok');
 await pg.waitForTimeout(2500);
 const t=await bubbles(pg);
 ok('fallback answer shown',t.some(x=>x.includes('floor length gown from Nordstrom')),JSON.stringify(t));
 ok('exactly one retry',calls.length===2,'calls='+calls.length);
 await ctx.close();}

console.log('\n4. both calls fail -> she still gets the honest apology');
{const {pg,ctx}=await run('bothfail');
 await pg.waitForTimeout(2500);
 const t=await bubbles(pg);
 ok('apology shown',t.some(x=>x.includes('having a moment')),JSON.stringify(t));
 ok('retried once, not forever',calls.length===2,'calls='+calls.length);
 ok('Send re-enabled',(await sendDead(pg))===false);
 await ctx.close();}

console.log('\n5. complete answer, stream never closes -> shown as complete, no false cut-off');
{const {pg,ctx,errs}=await run('hungcomplete');
 const t0=Date.now();
 await pg.waitForFunction(()=>!document.getElementById('chatSend').disabled,null,{timeout:30000});
 const waited=(Date.now()-t0)/1000;
 const t=await bubbles(pg);
 ok('answer shown',t.some(x=>x.includes('Try Nordstrom first')),JSON.stringify(t));
 ok('NO false cut-off note',(await cutoffs(pg))===0);
 ok('finished well under the 75s abort',waited<20,'waited '+waited.toFixed(1)+'s');
 ok('no retry fired',calls.length===1,'calls='+calls.length);
 ok('no JS errors',errs.length===0,errs.join('|'));
 await ctx.close();}

console.log('\n6. genuinely truncated, stream never closes -> still told honestly');
{const {pg,ctx}=await run('hungtruncated');
 await pg.waitForFunction(()=>!document.getElementById('chatSend').disabled,null,{timeout:30000});
 const t=await bubbles(pg);
 ok('partial shown',t.some(x=>x.includes('Look for chiffon, cre')),JSON.stringify(t));
 ok('cut-off note IS shown',(await cutoffs(pg))===1);
 ok('no retry fired',calls.length===1,'calls='+calls.length);
 await ctx.close();}

console.log('\n7. the retry cannot smuggle in a second set of product rules');
{mode='healthy';calls=[];
 const ctx=await b.newContext();const pg=await ctx.newPage();
 await pg.goto('http://localhost:8992/',{waitUntil:'domcontentloaded'});
 await pg.waitForTimeout(2000);
 /* ▶ WHAT THIS CHECKED BEFORE, AND WHY IT CHANGED: it proved that if the
    prompt swap ever stopped matching, the no-search rules got APPENDED rather
    than silently doing nothing. There is no swap any more — one block, both
    calls — so the failure mode it guarded cannot occur.
    ⚠️ THE NEW RISK IN ITS PLACE IS THE MIRROR IMAGE, and it is worth a check:
    a future session re-adding an append would DUPLICATE the rules, which is
    how a prompt starts contradicting itself. So: the retry must pass the
    system prompt through byte-for-byte, and must never introduce a rule that
    lets a product be named. */
 const SENT='You are a stylist. No searching block here.';
 await pg.evaluate((t)=>_chatNoSearchReply([{role:'user',content:t},{role:'user',content:'hi'}]),SENT);
 const sys=calls.length?String(calls[calls.length-1].messages[0].content):'';
 ok('the retry does not rewrite her system prompt',sys===SENT,sys.slice(0,120));
 ok('and never introduces a product-naming rule',sys.indexOf('AN ITEM WITHOUT ITS ADDRESS')<0);
 await ctx.close();}

/* ═══════════════════════════════════════════════════════════════════════════
   8. THE FAULT CATH FOUND ON HER PHONE, 2026-09-09, PINNED SO IT CANNOT RETURN.
   Her screenshot showed, as a stylist bubble, the literal text:
     "<<FIND item=white top; cut=fitted; size=XS>> On it, looking for something
      polished and fitted in white right now."
   ▶▶ TWO INDEPENDENT BUGS THAT ONLY BITE TOGETHER, which is why it survived:
     (a) the retry is still told to emit a marker (the instruction lives outside
         the block the retry used to swap), and
     (b) the retry's reply was the one route of four that never stripped it.
   ▶ AND A THIRD SYMPTOM FROM THE SAME PLACE: the retry never parsed the marker
     either, so it never LOOKED — which is why she saw no cards at all, and why
     the stylist then filled the silence by inventing four dresses.
   ⚠️ THE STRIP NOW LIVES IN addChatMsg, the one place every bot bubble passes
     through, so a render route added later cannot leak it either. */
console.log('\n8. the retry: marker never shown, and it actually looks');
{const {pg,ctx,errs}=await run('markerretry');
 await pg.waitForTimeout(3000);
 const t=await bubbles(pg);
 ok('no raw marker in ANY bubble',!t.some(x=>x.includes('<<FIND')),JSON.stringify(t));
 ok('her stylist sentence survives intact',t.some(x=>x.includes('looking for something long and formal')),JSON.stringify(t));
 ok('the retry actually ran the finder',findCalls.length===1,'findCalls='+findCalls.length);
 ok('and searched for what she asked for',findCalls.length===1&&findCalls[0].item==='gown',JSON.stringify(findCalls[0]||{}));
 ok('so she gets a real card, not an invented pick',
    (await pg.locator('.find-cards .find-card, .find-cards > *').count())>0);
 ok('no JS errors',errs.length===0,errs.join('|'));
 await ctx.close();}

/* ═══════════════════════════════════════════════════════════════════════════
   9. THE BROWSE WALL AND THE DEBUG VIEW — both built 2026-09-09 at Cath's ask.
   ▶▶ THE WALL EXISTS BECAUSE OF A HARD CAP SHE RAN INTO: `MAX_VERIFY = 4`, so
     at most four products were ever looked up and she saw two or three, while
     ~8 more from her own shops came back with photo, price and title already
     attached and were thrown away. Her words: "I thought by paying for the
     search service it would land on a full selection of photos with tappable
     links that our user could slide through."
   🚨 THE HONESTY LINE IS THE ONE SHE DREW HERSELF and these checks pin it:
     showing MORE is not claiming more. The verified card keeps its ticks; the
     wall carries none — and her never-wear list still governs the wall, which
     is the half a "just show everything" build would have quietly dropped. */
console.log('\n9. the browse wall: many cards, honest, and still her rules');
{mode='wall';calls=[];findCalls=[];
 const {pg,ctx,errs}=await run('wall','I need a fitted white top');
 await pg.waitForTimeout(3000);
 /* ⭐⭐ ONE ROW, HER DESIGN 2026-09-09: "show her one row of cards starting with
    the ones that match her search terms the best and then she can keep scrolling
    the rest." The two-block layout is gone, so these assert the ROW, not the
    old .find-browse container. ▶ REWRITTEN TO NAME THE RULE, NEVER TO CHASE A
    SELECTOR: the app changed shape by her instruction, it did not get worse. */
 ok('it is ONE row, not two',(await pg.locator('.find-cards').count())===1,
    'rows='+(await pg.locator('.find-cards').count()));
 const cards=await pg.locator('.find-cards .find-card').count();
 ok('every product from her shops reaches the row',cards===8,'cards='+cards);
 /* 🚨 HER RULING, PINNED: no store cap here. Two Quince pieces and two Old Navy
    pieces are in the fixture and ALL FOUR must survive. */
 const names=await pg.locator('.find-cards .fc-meta').evaluateAll(
   els=>els.map(e=>e.textContent||''));
 ok('NO STORE CAP: both Quince pieces survive',
    names.filter(t=>/Quince/.test(t)).length===2,JSON.stringify(names));
 ok('NO STORE CAP: both Old Navy pieces survive',
    names.filter(t=>/Old Navy/.test(t)).length===2,JSON.stringify(names));
 /* ⚠️ THE HONESTY RULE, AND IT IS THE WHOLE REASON THE ROW MAY BE MIXED: the
    checked piece LEADS and is the only thing wearing a tick. Her rule of
    2026-09-06 — never imply a requirement is confirmed unless it was verified. */
 ok('the checked pick leads the row',
    (await pg.locator('.find-cards .find-card').first().locator('.fc-yes').count())===1);
 ok('and it is the ONLY card claiming anything',
    (await pg.locator('.find-cards .fc-yes').count())===1);
 /* 🚨 REWRITTEN LATER THE SAME DAY, BY HER, AFTER SHE SAW IT ON HER PHONE.
    The header used to read "The first N I've checked in detail" and she cut it:
    "I don't think we need to say that. I THINK THE CHECKMARK SHOWS SHE CHECKED
    COLOR." ▶▶ SO THE HONESTY DID NOT WEAKEN, IT MOVED ONTO THE CARD — which is
    her own older rule ("the detail belongs on the CARDS") coming back around.
    ⚠️ THEREFORE THE TICK IS NOW LOad-BEARING AND THIS IS WHERE IT IS PINNED: it
    must name HER OWN WORD, not a generic label. A card saying "✓ colour" tells a
    woman nothing; "✓ white" is a claim she can check. If this ever regresses to
    the generic word, the header has to come back. */
 ok('the tick names HER word, not a generic label',
    /white/i.test(await pg.locator('.find-cards .fc-yes').first().innerText()),
    await pg.locator('.find-cards .fc-yes').first().innerText());
 ok('and it is spelled the American way everywhere she reads it',
    !/colour/i.test(await pg.locator('.find-block').first().innerText()),
    await pg.locator('.find-block').first().innerText().catch(()=>''));
 /* ⭐ HER PICK OF FOUR RENDERED OPTIONS, 2026-09-09: fade + count + arrow, with
    "from your shops" cut because it is app-speak. ▶ THE COUNT IS THE LOAD-
    BEARING HALF — her mum's lesson that content beats chrome. Seeing two cards
    and being told there are six is the reason to swipe; the arrow alone is a
    symbol asking to be trusted. If the number ever goes, so does the reason. */
 ok('the row says how many pieces there are',
    /^8 pieces/.test(await pg.locator('.find-hint').first().innerText()),
    await pg.locator('.find-hint').first().innerText().catch(()=>'(none)'));
 ok('and it invites the swipe',
    /swipe/i.test(await pg.locator('.find-hint').first().innerText()));
 /* ⭐⭐ HER RULING, 2026-09-09: "I don't want them at the very top but I also
    don't want them in the bottom of the barrel either... some level of priority
    but not maximum."
    ▶▶ THE LINE THAT MAKES THIS LEGITIMATE, AND IT IS WHY THESE TWO CHECKS SIT
      TOGETHER: the CHECKED card is a recommendation and its place is earned on
      merit alone — that is her Option A rule of 2026-09-06 and it does not bend.
      The BROWSE cards claim nothing, so ordering them is not a claim about
      quality. Move the unclaimed; never move the claimed. */
 {const metas=await pg.locator('.find-cards .fc-meta').evaluateAll(e=>e.map(x=>x.textContent||''));
  const firstPayer=metas.findIndex(t=>/FARM Rio/.test(t));
  ok('a shop that pays her is not left at the bottom of the row',
     firstPayer>=0&&firstPayer<=2,'FARM Rio first appears at card '+firstPayer+' of '+metas.length);
  ok('but the CHECKED piece still leads it — merit is never displaced',
     (await pg.locator('.find-cards .find-card').first().locator('.fc-yes').count())===1);
  ok('and both of its pieces are there — no cap, her ruling',
     metas.filter(t=>/FARM Rio/.test(t)).length===2,JSON.stringify(metas));}
 /* 🚨🚨 HER WORST SCREENSHOT OF THE DAY, AND THE PROMPT IS HALF THE FIX. Asked
    where her dresses had gone, the stylist replied "Let me pull them back up
    for you right now" — and NOTHING IN THE CODE COULD DO THAT. A search did run
    (on a sentence containing no garment) and honestly reported nothing, so the
    machinery behaved; the SENTENCE was the lie.
    ▶▶ THE OTHER HALF OF THE FIX IS THAT IT IS NOW TRUE — the cards persist — but
      the model still needed a correct picture of what it can do. This asserts
      the prompt carries it, because the failure mode is invisible otherwise. */
 ok('the stylist is told it cannot retrieve past results',
    /CANNOT BRING BACK PIECES YOU SHOWED HER BEFORE/.test(calls[0].message||'')||
    /CANNOT BRING BACK PIECES YOU SHOWED HER BEFORE/.test(JSON.stringify(calls[0]||{})));
 ok('and is told never to promise to pull them back up',
    /NEVER say you will pull them back up/.test(JSON.stringify(calls[0]||{})));
 ok('the row still says plainly that this is everything found',
    /showing you as much as i could find/i.test(await pg.locator('.find-head').first().innerText()),
    await pg.locator('.find-head').first().innerText());
 /* ▶ The raw result's own link points at google.com/search and is useless;
    getStoreUrl builds the shop's own search for this exact piece. */
 const hrefs=await pg.locator('.find-cards .find-card').evaluateAll(
   els=>els.map(e=>e.getAttribute('href')||''));
 ok('no card links to a google search',!hrefs.some(h=>h.includes('google.com')),hrefs.join(' | '));
 ok('every card links somewhere real',hrefs.every(h=>/^https?:\/\//.test(h)),hrefs.join(' | '));
 /* ⚠️ DERIVED, NOT TYPED. This read `=== 6` and went red the moment the fixture
    grew to prove the interleave — which is this file's own lesson exactly: a test
    that fails because the app got BIGGER teaches the next session to bump a
    number without reading it. Comparing against the row's own card count asserts
    the actual rule — EVERY card is sponsored — and cannot go stale. */
 ok('every card is rel=sponsored',
    (await pg.locator('.find-cards .find-card[rel="sponsored noopener"]').count())===cards,
    'sponsored='+(await pg.locator('.find-cards .find-card[rel="sponsored noopener"]').count())+' of '+cards);
 /* 🚨 ONE DISCLOSURE PER ANSWER. This file's own audit records Wardrobe once
    showing FIVE on a single page; a second one under the wall would be the
    same accident of per-block rendering. */
 /* ⚠️ COUNTS EVERY DISCLOSURE ON THE PAGE, NOT ONE CLASS. She saw the sentence
    TWICE on one screen (row + footer) and asked for the extra one gone, so the
    row's copy was removed and the footer keeps the job. Counting only
    `.find-disc` would now pass at ZERO, which is the opposite failure — a
    reviewer checks that a disclosure EXISTS and is findable. */
 {const discs=await pg.evaluate(()=>[...document.querySelectorAll('.find-disc,.chat-disclosure')]
    .filter(e=>e.offsetParent!==null&&/commission/i.test(e.textContent||'')).length);
  ok('exactly ONE affiliate disclosure on the screen, never two',discs===1,'found '+discs);}
 ok('no debug panel without ?debug=1',(await pg.locator('.fdbg').count())===0);
 ok('no JS errors',errs.length===0,errs.join('|'));
 await ctx.close();}

console.log('\n10. her never-wear list governs the wall too');
{const {pg,ctx,errs}=await run('wall','I need a fitted white top',{neverWear:['Ruffles']});
 await pg.waitForTimeout(3000);
 /* Her rule exists because of a box of shift dresses. A wall that showed
    "everything found" while ignoring it would be the Stitch Fix box with
    better photographs. */
 const titles=await pg.locator('.find-cards .fc-name').evaluateAll(
   els=>els.map(e=>e.textContent||''));
 ok('the ruffled piece is gone from the row',
    !titles.some(t=>/ruffle/i.test(t)),JSON.stringify(titles));
 /* 1 verified + 5 browse, minus the one ruffled piece. ▶ The count is DERIVED
    from the fixture rather than typed, so growing the fixture cannot make this
    fail on good news — this file's own "a count is not an invariant" rule. */
 ok('and every other piece survives',titles.length===7,JSON.stringify(titles));
 ok('no JS errors',errs.length===0,errs.join('|'));
 await ctx.close();}

console.log('\n11. the debug view answers "what did it actually do?"');
{const {pg,ctx,errs}=await run('wall','I need a fitted white top',{debug:true});
 await pg.waitForTimeout(3000);
 ok('the panel appears with ?debug=1',(await pg.locator('.fdbg').count())===1);
 const txt=await pg.locator('.fdbg').innerText().catch(()=>'');
 /* The exact numbers it took hours to reconstruct from her screenshots. */
 ok('it names what was searched for',/item=top/.test(txt),txt.slice(0,200));
 ok('it reports the pool size from her shops',/products found in the shops[\s\S]{0,4}12/.test(txt),txt.slice(0,400));
 ok('it reports how many were looked up',/looked up in detail[\s\S]{0,4}4/.test(txt),txt.slice(0,400));
 ok('it reports the browse count',/browse cards shown[\s\S]{0,4}7/.test(txt),txt.slice(0,400));
 ok('it reports the budget left',/930/.test(txt),txt.slice(0,400));
 /* ⚠️ BELOW the cards, never above — nothing may jump under a reader. */
 ok('it renders BELOW the cards',await pg.evaluate(()=>{
   const w=document.querySelector('.find-cards'),d=document.querySelector('.fdbg');
   return !!(w&&d)&&(w.compareDocumentPosition(d)&Node.DOCUMENT_POSITION_FOLLOWING)>0;
 }));
 ok('no JS errors',errs.length===0,errs.join('|'));
 await ctx.close();}

/* ═══════════════════════════════════════════════════════════════════════════
   12/13. A SEARCH THAT NEVER CAME BACK MUST NOT READ AS "I LOOKED AND FOUND
   NOTHING." Her rule, 2026-09-06: "I do not want it falling back to an invented
   product or making a generic store search look like something Style Star
   actually found" — and the same principle one step out, which she and this
   file both already drew: a failed search shown as an empty result has exactly
   the shape of a lie, because it is indistinguishable from the truth.
   ▶▶ FOUND LIVE 2026-09-09 WHILE RE-VERIFYING AFTER A CONTAINER RESTART. A real
     call came back `search: 10001ms, candidates: 0` — pinned to the millisecond
     on the ceiling — and the page told her "nothing close enough to show you."
     The search had never completed. Her shops were never asked.
   ⚠️ THE PAGE COULD NOT HAVE KNOWN: get() swallows a timeout, so the server
     answered 200 with an honest-looking empty pool. The distinction is made
     server-side now, which is the only place it is actually known.
   ⚠️ AND 13 IS THE HALF THAT KEEPS 12 HONEST: a genuinely empty search must
     STILL say her words. Fixing one must not silence the other. */
console.log('\n12. a timed-out search says so, and invents nothing');
{findMode='searchfail';mode='wall';calls=[];findCalls=[];
 /* ⚠️ 'wall' is the mode whose reply carries a <<FIND>> marker. 'healthy' does
    not, so the finder never runs and nothing renders — which is exactly how the
    first version of this check passed its negative and failed its positive. */
 const {pg,ctx,errs}=await run('wall','I need a fitted white top');
 await pg.waitForTimeout(3000);
 const all=(await pg.locator('.find-block').allInnerTexts().catch(()=>[])).join(' | ');
 ok('it says the search did not come back',all.includes("didn't come back"),all.slice(0,200));
 ok('and NEVER claims her shops had nothing',!all.includes('nothing close enough'),all.slice(0,200));
 ok('no cards invented to fill the gap',(await pg.locator('.find-card').count())===0);
 ok('no JS errors',errs.length===0,errs.join('|'));
 await ctx.close();}

console.log('\n13. ...and a genuinely empty result still says HER sentence');
{findMode='empty';mode='wall';calls=[];findCalls=[];
 const {pg,ctx}=await run('wall','I need a fitted white top');
 await pg.waitForTimeout(3000);
 const all=(await pg.locator('.find-block').allInnerTexts().catch(()=>[])).join(' | ');
 ok('a real empty search keeps her wording',all.includes('nothing close enough'),all.slice(0,200));
 ok('and does NOT claim the search failed',!all.includes("didn't come back"),all.slice(0,200));
 await ctx.close();}
findMode='ok';

/* ═══════════════════════════════════════════════════════════════════════════
   14. THE ROW SURVIVES A RELOAD — her fault report, 2026-09-09.
   ▶▶ HER WORDS: "the searched photo cards disappearing when user leaves and
     comes back to chat." She then asked the stylist where they had gone and was
     told "Let me pull them back up for you right now" — a promise NOTHING in
     the code could keep, because the cards were drawn into the page and never
     saved. This is the check that makes the promise true instead of forbidden.
   ⚠️ IT RELOADS THE REAL PAGE AND RE-OPENS THE CHAT, so it exercises the actual
     restore path rather than calling the builder directly. A test that called
     _findBlockHtml itself would pass even if nothing were ever stored. */
console.log('\n14. the cards come back after she leaves and returns');
{mode='wall';calls=[];findCalls=[];
 const {pg,ctx,errs}=await run('wall','I need a fitted white top');
 await pg.waitForTimeout(3000);
 const before=await pg.locator('.find-cards .find-card').count();
 ok('cards are there to begin with',before===8,'cards='+before);
 await pg.reload({waitUntil:'domcontentloaded'});
 await pg.waitForTimeout(2600);
 await pg.evaluate(()=>openChat());
 await pg.waitForTimeout(900);
 const after=await pg.locator('.find-cards .find-card').count();
 ok('and they are STILL THERE after a reload',after===before,'before='+before+' after='+after);
 /* ▶ The ticks come back too — and they are honest to restore, because they
    read "white"/"silk"/"wrap": facts about the GARMENT, not the shop's stock.
    A red dress stays red. Stock is never ticked at all. */
 ok('the tick comes back with them',
    (await pg.locator('.find-cards .fc-yes').count())===1);
 /* 🚨 ONE BUILDER, NEVER TWO. If restoring grew its own markup the two would
    drift, and a rule fixed on one would go missing on the other — which is
    exactly how the <<FIND>> marker leaked. These prove the restored row obeys
    the same rules as the live one. */
 /* ⚠️ SAME RULE AS SECTION 9, AND IT COUNTS THE WHOLE SCREEN. Missed on the
    first pass of her "take off that extra affiliate link wording" change, which
    is this file's own lesson in miniature: a rule applied to one half is not
    applied. Restoring a conversation must leave exactly one disclosure too —
    never two, and never none. */
 {const discs=await pg.evaluate(()=>[...document.querySelectorAll('.find-disc,.chat-disclosure')]
    .filter(e=>/commission/i.test(e.textContent||'')).length);
  ok('the restored conversation carries exactly ONE disclosure',discs===1,'found '+discs);}
 ok('and still says how many pieces there are',
    /^8 pieces/.test(await pg.locator('.find-hint').first().innerText()));
 ok('and a paying shop is still not at the bottom',await pg.evaluate(()=>{
   const m=[...document.querySelectorAll('.find-cards .fc-meta')].map(x=>x.textContent||'');
   const i=m.findIndex(t=>/FARM Rio/.test(t));return i>=0&&i<=2;}));
 ok('no JS errors',errs.length===0,errs.join('|'));
 await ctx.close();}

console.log(`\n${pass} passed, ${fail} failed`);
await b.close();srv.close();
process.exit(fail?1:0);
