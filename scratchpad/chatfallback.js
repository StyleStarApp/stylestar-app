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
let mode='healthy', calls=[], findCalls=[];
const sse=o=>'event: '+o.type+'\ndata: '+JSON.stringify(o)+'\n\n';

const srv=http.createServer((q,res)=>{
  /* The finder, stubbed. Added 2026-09-09 so the retry path can be proven to
     actually LOOK for her products, which is the half that was missing. */
  if(q.url.indexOf('product-find')>=0){
    let fr='';q.on('data',c=>fr+=c);
    return q.on('end',()=>{
      findCalls.push(JSON.parse(fr||'{}'));
      res.writeHead(200,{'Content-Type':'application/json'});
      res.end(JSON.stringify({exact:[{id:'1',title:"Old Navy Women's Fitted Rib T-Shirt",
        store:'Old Navy',price:'$9.99',priceValue:9.99,url:'https://oldnavy.gap.com/x',
        image:'https://example.com/i.jpg',confirmed:[],unknown:[]}],doors:[]}));
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
    if(mode==='healthy'){
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

async function run(m,question='I need a long formal gown for a wedding'){
  mode=m;calls=[];
  const ctx=await b.newContext();
  const pg=await ctx.newPage();
  const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(()=>{
    localStorage.setItem('ss_data',JSON.stringify({userName:'Kathy',
      answers:[8,7,6,5,9,4,7,6,8,5,7,6],
      topArchNames:['Modern Glam','Classic Sophisticate'],
      portrait:'Polished with a modern edge.',motto:'Polished, always.'}));
    localStorage.setItem('ss_prefs',JSON.stringify({sizes:{tops:['XL'],bottoms:['16'],shoes:['9'],dresses:['16']},
      colorsLove:['Royal Blue'],neverWear:['Crop tops'],neverPatterns:['Leopard'],neverOther:'',
      jewelry:'Gold',dailyShoes:'Flats',bagStyle:'Tote',otherNotes:''}));
  });
  await pg.goto('http://localhost:8992/',{waitUntil:'domcontentloaded'});
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

console.log(`\n${pass} passed, ${fail} failed`);
await b.close();srv.close();
process.exit(fail?1:0);
