// Prove _aiJSON recovers HER exact failing reply (2026-08-25) and still throws
// on a genuine failure. Drives the REAL function out of the real index.html.
import fs from 'fs';
const h=fs.readFileSync('index.html','utf8');
const m=h.match(/function _aiJSON\(raw\)\{[\s\S]*?\n\}/);
if(!m){console.log('FAIL: _aiJSON not found');process.exit(1);}
const _aiJSON=new Function('return ('+m[0].replace('function _aiJSON','function')+')')();
let f=0,c=0; const ok=(n,cond,x)=>{c++;console.log((cond?'PASS ':'FAIL ')+n+(x?'  ['+x+']':''));if(!cond)f++;};

// HER ACTUAL REPLY, captured live from stylestar.app for "Skinny jeans".
const HERS=`The instructions say Catherine must NEVER suggest skinny jeans - it is on her absolute veto list as a dated silhouette. She cannot shop this request.

\`\`\`json
{
  "note": "Skinny jeans are one I can't recommend in good conscience right now - but I'd love to find you a great pair of slim straight or barrel jeans instead if you're open to it.",
  "items": []
}
\`\`\``;
let r=null; try{ r=_aiJSON(HERS); }catch(e){ r=null; }
ok('her real failing reply now parses', !!r, r?'':'still throws');
ok('  ...and the note survives whole', !!r && /slim straight or barrel jeans/.test(r.note||''));
ok('  ...and items is an empty array', !!r && Array.isArray(r.items) && r.items.length===0);

// The shapes that already worked must keep working, byte for byte.
ok('plain JSON still parses', _aiJSON('{"items":[{"name":"A"}]}').items.length===1);
ok('fenced JSON still parses', _aiJSON('```json\n{"items":[]}\n```').items.length===0);
ok('trailing prose after JSON recovers', _aiJSON('{"items":[]}\nHope that helps!').items.length===0);
ok('prose on BOTH sides recovers', _aiJSON('Here you go:\n{"note":"x","items":[]}\nLet me know.').note==='x');
ok('nested braces survive', _aiJSON('pre {"a":{"b":[1,2]},"items":[]} post').a.b[1]===2);

// ⚠️ THE NEGATIVE CONTROL. A reply with no object must STILL throw, so a real
// failure reaches the catch block and she gets an honest error, not a blank shelf.
const mustThrow=(label,txt)=>{let threw=false;try{_aiJSON(txt)}catch(e){threw=true}ok(label,threw);};
mustThrow('pure prose still throws', 'I am sorry, I cannot help with that.');
mustThrow('empty reply still throws', '');
mustThrow('a lone opening brace still throws', 'oops {');
mustThrow('unparseable braces still throw', 'x { not json at all ; } y');
console.log(`\n${c} checks, ${f} failures`);
process.exit(f?1:0);
