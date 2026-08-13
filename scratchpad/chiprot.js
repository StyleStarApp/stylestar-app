// The fresh-chat chip rotation (2026-08-13, her design): photo chip anchored,
// her four most-asked questions ride a ring, two showing per visit, advancing
// one step each fresh-chat open. Drives the real app in Chromium.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req,res)=>{try{res.end(fs.readFileSync(path.join(ROOT, req.url==='/'?'index.html':req.url.split('?')[0])))}catch(e){res.statusCode=404;res.end()}}).listen(8935);

let pass=0, fail=0;
const ok=(label,cond)=>{console.log((cond?'  ✓ ':'  ✗ ')+label); cond?pass++:fail++;};

const browser = await chromium.launch();
const errors=[];
const page = await browser.newPage({viewport:{width:390,height:844}});
page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://localhost:8935/'); await page.waitForTimeout(700);

const readChips = () => page.evaluate(() =>
  [...document.querySelectorAll('#chatSuggestions .chat-sug-chips .chat-chip')].map(b=>b.textContent.trim()));
const openFresh = () => page.evaluate(() => { openChat(); });
const leave = () => page.evaluate(() => { show('s-wb'); });

console.log('1. The rotation advances one step per fresh-chat visit');
await openFresh(); let c1 = await readChips();
ok('visit 1: two ring chips + the photo anchor (3 total)', c1.length===3 && c1[2]==='Send a photo for advice');
ok('visit 1 shows Dress me for an event + What’s in this season?', c1[0]==='Dress me for an event' && /season/.test(c1[1]));
await leave(); await openFresh(); let c2 = await readChips();
ok('visit 2 advanced: Season + My essentials', /season/.test(c2[0]) && c2[1]==='My essentials');
await leave(); await openFresh(); let c3 = await readChips();
ok('visit 3: My essentials + Shift one notch (her method chip rides the ring)', c3[0]==='My essentials' && c3[1]==='Shift one notch');
await leave(); await openFresh(); let c4 = await readChips();
ok('visit 4: Shift one notch + wraps to Dress me for an event', c4[0]==='Shift one notch' && c4[1]==='Dress me for an event');
await leave(); await openFresh(); let c5 = await readChips();
ok('visit 5 wraps the ring cleanly', c5[0]==='Dress me for an event');
ok('photo anchor present on every visit', [c1,c2,c3,c4,c5].every(c=>c[2]==='Send a photo for advice'));

console.log('2. Tapping a ring chip sends her clients’ exact words');
const sent = await page.evaluate(() => {
  let captured=null;
  const orig=window.fetch; window.fetch=(u,o)=>{captured=o&&o.body; return new Promise(()=>{})};
  document.querySelector('#chatSuggestions .chat-sug-chips .chat-chip').click();
  window.fetch=orig;
  const msgs=[...document.querySelectorAll('#chatMessages .chat-msg.user')];
  return {last:msgs.length?msgs[msgs.length-1].textContent:'', sugHidden:document.getElementById('chatSuggestions').style.display==='none'};
});
ok('the event chip sends the full client question', /I have an event and I don’t know what to wear/.test(sent.last) && /nail the right vibe/.test(sent.last));
ok('suggestions hide once she asks', sent.sugHidden);

console.log('3. Layout and hygiene');
await page.evaluate(()=>{try{localStorage.setItem('ss_chiprot','0')}catch(e){}});
for (const w of [390,360,320]) {
  await page.setViewportSize({width:w,height:844});
  await leave(); await openFresh();
  const r = await page.evaluate(() => {
    const chips=[...document.querySelectorAll('#chatSuggestions .chat-sug-chips .chat-chip')];
    return {over:chips.some(ch=>ch.getBoundingClientRect().right>innerWidth+0.5), n:chips.length};
  });
  ok(w+'px: 3 chips, no sideways overflow', r.n===3 && !r.over);
}
const rc = await page.evaluate(() => {
  // a return conversation shows the continue set, not the rotation
  chatHistory=[{role:'user',content:'hi'},{role:'assistant',content:'hello'}];
  try{localStorage.setItem('ss_chat',JSON.stringify(chatHistory))}catch(e){}
  show('s-wb'); chatHistory=[]; openChat();
  return [...document.querySelectorAll('#chatSuggestions .chat-sug-chips .chat-chip')].map(b=>b.textContent.trim());
});
ok('a returning conversation still gets the continue chips, not the ring', rc.includes('Pick up our chat'));
const cleared = await page.evaluate(() => { doClearChat(); return [...document.querySelectorAll('#chatSuggestions .chat-sug-chips .chat-chip')].map(b=>b.textContent.trim()); });
ok('Start fresh restores the rotation (3 chips incl. photo)', cleared.length===3 && cleared[2]==='Send a photo for advice');
ok('zero JS errors', errors.length===0);
if(errors.length)console.log(errors.slice(0,3));

await browser.close(); server.close();
console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
