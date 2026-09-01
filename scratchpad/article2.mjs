// Drives the REAL edge function (imported, never reimplemented) over the REAL
// index.html, for the new article route, the hub, and a control URL.
// ⚠️ Strips <script>, <style> and <!-- --> before counting any markup.
import fs from 'fs';
import handler from '../netlify/edge-functions/page-titles.js';
const RAW = fs.readFileSync('index.html','utf8');

const strip = s => s.replace(/<!--[\s\S]*?-->/g,'')
                    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')
                    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
const screens = s => (strip(s).match(/class="scr[^"]*"\s*id=/g)||[]).length;
const TOTAL = screens(RAW);            // DERIVED, never restated
const words = s => { const b=s.slice(s.indexOf('<body'));
  return strip(b).replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&rarr;/g,'→')
    .replace(/&[a-z]+;/g,' ').split(/\s+/).filter(Boolean).length; };

async function serve(path){
  const req = new Request('https://stylestar.app'+path);
  const ctx = { next: async () => new Response(RAW,{status:200,headers:{'content-type':'text/html'}}) };
  const res = await handler(req, ctx);
  return await res.text();
}

let pass=0, fail=0;
const ok=(name,cond,detail='')=>{ cond?pass++:fail++; console.log((cond?'  ok   ':'  FAIL ')+name+(cond?'':'   <- '+detail)); };

// ---------- 1. the new article route ----------
const P='/journal/how-to-dress-for-fall-in-florida';
const a = await serve(P);
console.log('\n== '+P+' ==');
ok('serves exactly ONE screen', screens(a)===1, screens(a)+' screens');
ok('the screen is the article', a.includes('id="s-journal-fall-florida"'));
ok('article #1 is NOT served here', !a.includes('id="s-journal">'));
ok('exactly one real <h1>', (strip(a).match(/<h1[ >]/g)||[]).length===1);
ok('body carries data-ss-trimmed', /<body data-ss-trimmed="1">/.test(a));
// DERIVED from the edge function's own entry, so re-wording the title needs no
// test edit -- the claim is "the served <title> IS the configured metaTitle".
const PT = fs.readFileSync('netlify/edge-functions/page-titles.js','utf8');
const entry = PT.slice(PT.indexOf("slug: 'how-to-dress-for-fall-in-florida'"));
const META_TITLE = /metaTitle: '((?:[^'\\]|\\.)*)'/.exec(entry)[1].replace(/\\'/g,"'");
ok('<title> is exactly the configured metaTitle', a.includes('<title>'+META_TITLE+'</title>'), META_TITLE);
// Google truncates around 60 characters; a longer one loses "| Style Star".
ok('metaTitle fits Google\'s display budget (<=60 chars)', META_TITLE.length<=60, META_TITLE.length+' chars');
ok('canonical is the article URL', a.includes('<link rel="canonical" href="https://stylestar.app'+P+'"'));
ok('meta description present', a.includes('Keep your summer clothes, just wear them differently.'));
ok('visible publish date in raw HTML', a.includes('Published September 1, 2026'));
const ld=[...a.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
const flat=ld.flatMap(x=>Array.isArray(x)?x:[x]);
ok('Article schema present', flat.some(x=>x['@type']==='Article'));
ok('FAQPage schema present', flat.some(x=>x['@type']==='FAQPage'));
const faq=flat.find(x=>x['@type']==='FAQPage');
ok('FAQPage carries 12 questions', faq && faq.mainEntity.length===12, faq?faq.mainEntity.length:'none');
const art=flat.find(x=>x['@type']==='Article');
ok('datePublished 2026-09-01', art && art.datePublished==='2026-09-01');
ok('author jobTitle carried', art && /Certified Image Consultant/.test(JSON.stringify(art.author)));
// every schema string must appear verbatim in the served page
let verb=0, miss=[];
faq.mainEntity.forEach(q=>{
  const qt=q.name, at=q.acceptedAnswer.text;
  const hay=strip(a).replace(/<[^>]+>/g,' ').replace(/&rarr;/g,'→').replace(/&amp;/g,'&').replace(/\s+/g,' ');
  const has = hay.includes(qt.replace(/\s+/g,' ')) ;
  if(has) verb++; else miss.push(qt.slice(0,45));
});
ok('all 12 schema QUESTIONS appear verbatim on the page', verb===12, miss.join(' | '));
// ⚠️ The ANSWERS are what drifted on /faq (2026-09-01): a snapshot taken once,
// then two copy edits landed and nobody regenerated it. Schema that contradicts
// the visible text is a Google structured-data violation. Check both halves.
let averb=0, amiss=[];
{ const hay=strip(a).replace(/<[^>]+>/g,' ').replace(/&rarr;/g,'→').replace(/&amp;/g,'&')
    .replace(/&[a-z]+;/g,' ').replace(/\s+/g,' ').trim();
  faq.mainEntity.forEach(q=>{
    const at=q.acceptedAnswer.text.replace(/\s+/g,' ').trim();
    if(hay.includes(at)) averb++; else amiss.push(q.name.slice(0,40));
  });
}
ok('all 12 schema ANSWERS appear verbatim on the page', averb===12, amiss.join(' | '));
ok('rendered words in a sane range (900-1600)', words(a)>900&&words(a)<1600, words(a)+' words');
console.log('   rendered words: '+words(a));

// ---------- 2. the hub ----------
const h = await serve('/journal');
console.log('\n== /journal ==');
const rows=[...h.matchAll(/<a class="jhub-row" href="([^"]+)"[^>]*><span class="jhub-row-title">([^<]*)<\/span>/g)];
ok('hub server-renders TWO crawlable <a href> rows', rows.length===2, rows.length+' rows');
ok('row 1 links article #1', rows[0]&&rows[0][1]==='/journal/how-to-find-your-personal-style');
ok('row 2 links article #2', rows[1]&&rows[1][1]===P, rows[1]?rows[1][1]:'missing');
ok('row 2 anchor text is the article title', rows[1]&&rows[1][2]==="How to Dress for Fall in Florida When It&#39;s Still 90 Degrees" || (rows[1]&&rows[1][2].includes('How to Dress for Fall in Florida')), rows[1]?rows[1][2]:'');
ok('hub serves exactly ONE screen', screens(h)===1, screens(h)+' screens');
ok('hub list anchor was really replaced', !h.includes('<div id="journalHubList" class="jhub-list"></div>'));

// ---------- 3. controls ----------
console.log('\n== controls ==');
const home = await serve('/');
ok('CONTROL /: article #2 absent', !home.includes('id="s-journal-fall-florida"'));
ok('CONTROL /: still one real <h1>', (strip(home).match(/<h1[ >]/g)||[]).length===1);
ok('CONTROL /: welcome present', home.includes('id="s-wel"'));
ok('CONTROL /: drops MORE than it keeps but keeps most', screens(home)>10 && screens(home)<TOTAL, screens(home)+' of '+TOTAL);
// ⚠️ /index.html is NOT routed through this edge function -- netlify.toml scopes
// it to "/" EXACTLY, deliberately, because _selfHealScreens() fetches that file
// to put the missing screens back. So the honest control is the RAW file plus
// the scoping itself; running the handler on that path tests something that
// cannot happen in production.
const toml = fs.readFileSync('netlify.toml','utf8');
ok('netlify.toml still scopes the trim to "/" exactly (never a wildcard)', /\n  path = "\/"\n  function = "page-titles"/.test(toml));
// ⚠️ Check the BODY TAG, not the string: `data-ss-trimmed` also appears inside
// _selfHealScreens(), which READS it. A bare string test fails on correct code.
const bodyTag = s => (s.match(/<body[^>]*>/i)||[''])[0];
ok('CONTROL raw index.html: plain <body>, untrimmed', bodyTag(RAW)==='<body>', bodyTag(RAW));
ok('CONTROL raw index.html: carries ALL '+TOTAL+' screens incl. article #2', screens(RAW)===TOTAL && RAW.includes('id="s-journal-fall-florida"'));

console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
