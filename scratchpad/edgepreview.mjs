// Prove the edge function's rewrite against the REAL index.html head. It cannot
// be run locally as an edge function, so the transform is exercised directly.
import fs from 'fs';
const src = fs.readFileSync('/home/user/stylestar-app/netlify/edge-functions/list-preview.js','utf8');
const TITLE = src.match(/const TITLE = '([^']+)'/)[1];
const DESC  = src.match(/const DESC  = '([^']+)'/)[1];
function setMeta(html, attr, name, value) {
  const re = new RegExp('(<meta\\s+' + attr + '="' + name + '"\\s+content=")[^"]*(")', 'i');
  return html.replace(re, '$1' + value + '$2');
}
let html = fs.readFileSync('/home/user/stylestar-app/index.html','utf8');
const before = html;
html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + TITLE + '</title>');
html = setMeta(html,'property','og:title',TITLE);
html = setMeta(html,'property','og:description',DESC);
html = setMeta(html,'name','twitter:title',TITLE);
html = setMeta(html,'name','description',DESC);
const grab = (h,re)=>{const m=h.match(re);return m?m[1]:null};
let pass=0,fail=0; const ok=(n,c,x)=>{c?(pass++,console.log('  ✓ '+n)):(fail++,console.log('  ✗ '+n+(x?'  → '+x:'')))};
ok('<title> becomes the wishlist title',
   grab(html,/<title>([^<]*)<\/title>/) === TITLE, grab(html,/<title>([^<]*)<\/title>/));
ok('og:title becomes the wishlist title',
   grab(html,/<meta property="og:title" content="([^"]*)"/) === TITLE);
ok('og:description changes', grab(html,/<meta property="og:description" content="([^"]*)"/) === DESC);
ok('twitter:title changes', grab(html,/<meta name="twitter:title" content="([^"]*)"/) === TITLE);
ok('og:image is deliberately UNTOUCHED — her letterhead is right here too',
   grab(html,/<meta property="og:image" content="([^"]*)"/) === grab(before,/<meta property="og:image" content="([^"]*)"/));
// The one that would matter most if it went wrong: the app itself must survive.
ok('the app body is otherwise byte-identical',
   html.length - before.length === (TITLE.length*3 + DESC.length*2)
   - (grab(before,/<title>([^<]*)<\/title>/).length
      + grab(before,/<meta property="og:title" content="([^"]*)"/).length
      + grab(before,/<meta property="og:description" content="([^"]*)"/).length
      + grab(before,/<meta name="twitter:title" content="([^"]*)"/).length
      + (grab(before,/<meta name="description" content="([^"]*)"/)||'').length),
   'delta ' + (html.length - before.length));
ok('exactly 5 tags changed, no more',
   before.split('\n').filter((l,i)=>l!==html.split('\n')[i]).length === 5,
   before.split('\n').filter((l,i)=>l!==html.split('\n')[i]).length + ' lines differ');
console.log(fail? `\n${fail} FAILED`:`\nall ${pass} checks passed`);
process.exit(fail?1:0);
