/* ── scratchpad/chatjudge.mjs ────────────────────────────────────────────────
   The chat now gets Cath's RANKED store list with her scores, and her FIT BEATS
   DEPTH rule — and deliberately NOT the "go further down for a specialist"
   clause that sent Kathy to Revolve.
   ⚠️ THE RISK THIS SUITE EXISTS FOR: the chat's links are built by matching store
   names in the model's prose (linkStores). The list used to be bare names; every
   line now reads "Name [tier; archetype; ...; description]". If the model ever
   writes the bracket into its answer, the link breaks — so the naming rule and
   the extractor are both checked, not assumed. */
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=process.cwd(),PORT=8999;
let pass=0,fail=0;
const ok=(c,m)=>{c?(pass++,console.log('  ok   '+m)):(fail++,console.log('  FAIL '+m))};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';
 fs.readFile(path.join(ROOT,u.replace(/^\//,'')),(e,b)=>{if(e){r.writeHead(404);r.end();return}
 r.writeHead(200,{'Content-Type':{'.css':'text/css','.html':'text/html','.png':'image/png','.json':'application/json'}[path.extname(u)]||'application/octet-stream'});r.end(b)})});
await new Promise(r=>srv.listen(PORT,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});

async function sys(sliders){
  const pg=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  let captured='';
  await pg.route('**/.netlify/**',r=>{
    /* ⚠️ THE PROMPT RIDES messages[0].content, NOT a `system` field — sendChat
       builds it as the first USER message followed by a primed assistant reply.
       Reading d.system returns undefined, and the first version of this harness
       did exactly that: every content assertion failed while "the escape hatch
       is NOT in the chat" PASSED, because an empty string trivially contains
       nothing. ▶ A NEGATIVE ASSERTION PASSES VACUOUSLY ON EMPTY INPUT, so the
       capture is proven non-empty below before any of them are believed.
       (This is also why an earlier live harness got replies in markdown
       headings: it posted the question with no system prompt at all.) */
    try{const d=JSON.parse(r.request().postData()||'{}');
        captured=(d.messages&&d.messages[0]&&d.messages[0].content)||'';}catch(e){}
    r.fulfill({status:200,contentType:'application/json',body:'{"content":[{"text":"ok"}]}'});
  });
  await pg.route('https://fonts.googleapis.com/**',r=>r.abort());
  await pg.route('https://plausible.io/**',r=>r.fulfill({status:200,body:''}));
  await pg.goto(`http://localhost:${PORT}/`); await pg.waitForTimeout(1200);
  const extra=await pg.evaluate(async(sl)=>{
    userName='Test'; answers=sl; quizTaken=true;
    topArchNames=getTopArch().map(a=>a.n);
    openChat(); await new Promise(r=>setTimeout(r,300));
    const i=document.getElementById('chatInput');
    i.value='I need a cocktail dress'; i.dispatchEvent(new Event('input',{bubbles:true}));
    sendChat(); await new Promise(r=>setTimeout(r,600));
    /* The extractor, exercised directly: a name written plainly must still link,
       and the bracket must never end up inside one. */
    const plain=linkStores('The Ponte Sheath Dress from Talbots (~$139)');
    const withBracket=linkStores('A dress from Talbots [$$; timeless workwear] (~$139)');
    return {plain,withBracket};
  },sliders);
  await pg.context().close();
  return {captured,extra};
}

const MODEST=[3,2,3,3,4,5,3,3,2,4,1,3], GLAM=[10,10,8,9,8,6,8,8,10,9,10,10];
const m=await sys(MODEST), g=await sys(GLAM);

console.log('\nWHAT THE CHAT IS HANDED NOW');
ok(m.captured.length>4000&&g.captured.length>4000,
   'a real system prompt was captured for both women ('+m.captured.length+' / '+g.captured.length+
   ' chars) — without this every negative assertion below passes vacuously');
ok(/FIT BEATS DEPTH, ALWAYS/.test(m.captured),'her FIT BEATS DEPTH rule is in the chat prompt');
ok(/ORDERED by how well each store suits HER/.test(m.captured),'the list is declared as ordered by fit');
/* ⚠️ THE OMISSION IS THE POINT OF THE CHANGE, so it is asserted, not assumed. */
ok(!/Go further down only when the piece needs a specialist/.test(m.captured),
   'the specialist escape hatch is NOT in the chat — the clause that sent Kathy to Revolve');
/* ⚠️ UPDATED DELIBERATELY. This asserted "Revolve [" and was right to fail: for
   the MODEST woman Revolve now ranks 102nd and is correctly a bare name, which
   is the change working. The claim that matters is that the stores which DO
   suit her carry her detail — so it is asserted on the top of HER list. */
ok(/Eileen Fisher \[\$/.test(m.captured),
   'the stores that suit her carry her per-store detail, not bare names');
ok(/^Revolve$/m.test(m.captured),
   'and Revolve, ranked last for her, is named without a description');
ok(/never reach past the ones that do/.test(m.captured),'the rule names the reaching-past failure');

/* HER TWO CASES, read out of the real prompt: position in the list is what the
   model is being told, so that is what gets measured. */
/* ⚠️ Past the detail cap a line is a BARE NAME, so matching only "Name [" would
   miss exactly the stores this change is about — the ones ranked last. */
const order=t=>{const L=t.split('\n');
  const i=n=>L.findIndex(l=>l===n||l.startsWith(n+' ['));
  return {rev:i('Revolve'),jj:i('J.Jill'),ch:i("Chico's"),first:(L.find(l=>/^\w.*\[\$/.test(l))||'').split(' [')[0]};};
const om=order(m.captured), og=order(g.captured);
console.log('\nHER TWO CASES, as the chat now sees them');
ok(om.rev>om.jj,'modest woman: Revolve sits BELOW J.Jill in her list (Revolve '+om.rev+', J.Jill '+om.jj+')');
ok(og.jj>og.rev,'glam woman: J.Jill sits BELOW Revolve in hers (J.Jill '+og.jj+', Revolve '+og.rev+')');
ok(og.ch>og.rev,"glam woman: Chico's sits below Revolve too ("+og.ch+')');
ok(om.first!==og.first,'the two women are handed different stores first ('+om.first+' vs '+og.first+')');

/* ⚠️⚠️ THE SIZE GUARANTEE, and it is the one that would take the chat down
   rather than merely make it worse. style-ai.js REFUSES any message over
   32 * 1024 chars outright, so a prompt that grows past it does not degrade the
   answer, it kills the chat for the women carrying the most data — the ones who
   have used the app most. Measured on the heaviest realistic profile, handing
   the chat the FULLY detailed list left 2,054 chars of headroom before a photo
   analysis was even added. Naming the far end without describing it brings it
   back to ~7,100, within 400 chars of where the prompt sat before this change. */
console.log('\nTHE PROMPT STILL FITS');
const CAP=32*1024;
ok(m.captured.length<CAP*0.85,'a normal profile leaves real headroom ('+
   (CAP-m.captured.length)+' chars of '+CAP+')');
ok(/listed by name only/.test(m.captured),
   'the prompt explains that the far end is named but not described');
{ /* the far end really is bare, or the cap is not doing its job */
  const L=m.captured.split('\n');
  const first=L.findIndex(l=>/^\w[^\n]*\[\$/.test(l));
  const detailed=L.slice(first).filter(l=>/^\w[^\n]*\[\$/.test(l)).length;
  ok(detailed>0&&detailed<=45,'only the top 45 stores carry a description ('+detailed+')');
}

console.log('\nTHE LINKS STILL BUILD');
ok(/<a[^>]+>Talbots<\/a>/.test(m.extra.plain),'a plainly named store still becomes a link');
ok(!/\[\$\$/.test(m.extra.plain),'no bracket leaks into a normal answer');
/* If the model ever DOES copy the bracket, the link must still resolve rather
   than the answer losing its store entirely. */
ok(/<a[^>]/.test(m.extra.withBracket),'even if the bracket is copied, the store still links');

console.log('\nchatjudge: '+pass+' checks, '+fail+' failures');
await b.close();srv.close();
process.exit(fail?1:0);
