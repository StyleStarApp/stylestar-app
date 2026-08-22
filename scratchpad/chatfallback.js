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
let mode='healthy', calls=[];
const sse=o=>'event: '+o.type+'\ndata: '+JSON.stringify(o)+'\n\n';

const srv=http.createServer((q,res)=>{
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
      return res.end(JSON.stringify({content:[{type:'text',text:'For a formal wedding, go with a floor length gown from Nordstrom.'}]}));
    }
    if(mode==='notok'){res.writeHead(500);return res.end('{}');}
    res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache'});
    res.write(sse({type:'message_start',message:{id:'m',content:[]}}));
    if(mode==='deadsilence'||mode==='bothfail'){ // searches, writes nothing, connection dies
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
 ok('retry prompt drops the address rule',sys.indexOf('AN ITEM WITHOUT ITS ADDRESS')<0);
 ok('retry prompt forbids inventing one',sys.indexOf('cannot look up live inventory')>=0);
 ok('search prompt still intact on call 1',String(calls[0].messages[0].content).indexOf('AN ITEM WITHOUT ITS ADDRESS')>=0);
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

console.log('\n7. the prompt swap cannot silently fail');
{mode='healthy';calls=[];
 const ctx=await b.newContext();const pg=await ctx.newPage();
 await pg.goto('http://localhost:8992/',{waitUntil:'domcontentloaded'});
 await pg.waitForTimeout(2000);
 // A system prompt that does NOT contain the searching block at all: the swap
 // has nothing to match, so the no-search rules must be appended instead.
 await pg.evaluate(()=>_chatNoSearchReply([{role:'user',content:'You are a stylist. No searching block here.'},{role:'user',content:'hi'}]));
 const sys=calls.length?String(calls[calls.length-1].messages[0].content):'';
 ok('no-search rules appended anyway',sys.indexOf('cannot look up live inventory')>=0,sys.slice(0,120));
 ok('address rule still absent',sys.indexOf('AN ITEM WITHOUT ITS ADDRESS')<0);
 await ctx.close();}

console.log(`\n${pass} passed, ${fail} failed`);
await b.close();srv.close();
process.exit(fail?1:0);
