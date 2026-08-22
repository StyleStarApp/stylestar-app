// Read HER screenshots' real pixels to work out the effective CSS width of her
// phone.  The device is an iPhone 15 (1179x2556 = 393pt @3x) -- but Display
// Zoom / larger text would make the CSS viewport narrower than 393, and that is
// exactly what the wrap measurement hinges on.
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const pg=await b.newPage();
for(const [name,file,y0,y1] of [
  ['open  (11:33)','72a07d30-image.png',540,760],
  ['closed(11:25)','fe1024fd-image.png',740,960],
]){
  const data='data:image/png;base64,'+fs.readFileSync('/root/.claude/uploads/753d6962-5b5f-55de-b8da-d6d25ba5625d/'+file).toString('base64');
  const r=await pg.evaluate(async ([src,y0,y1])=>{
    const img=new Image();img.src=src;await img.decode();
    const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
    c.getContext('2d').drawImage(img,0,0);
    const d=c.getContext('2d').getImageData(0,y0,img.width,y1-y0).data;
    const rows=[];
    for(let y=0;y<y1-y0;y++){
      let lo=1e9,hi=-1,n=0;
      for(let x=100;x<img.width-100;x++){   // skip the black window frame at both edges
        const i=(y*img.width+x)*4;
        const lum=(d[i]*.299+d[i+1]*.587+d[i+2]*.114);
        if(lum<120){n++;if(x<lo)lo=x;if(x>hi)hi=x;}
      }
      if(n>6)rows.push({y:y0+y,lo,hi,n});
    }
    return {w:img.width,rows};
  },[data,y0,y1]);
  // cluster rows into lines (gaps > 8px start a new line)
  const lines=[];let cur=null;
  for(const row of r.rows){ if(!cur||row.y-cur.y1>8){cur={y0:row.y,y1:row.y,lo:row.lo,hi:row.hi};lines.push(cur);}
    else {cur.y1=row.y;cur.lo=Math.min(cur.lo,row.lo);cur.hi=Math.max(cur.hi,row.hi);} }
  console.log('=== '+name+'  imgW '+r.w+' ===');
  for(const L of lines) console.log('   y '+L.y0+'..'+L.y1+'  x '+L.lo+'->'+L.hi+'  span '+(L.hi-L.lo)+'  ('+((L.hi-L.lo)/r.w*100).toFixed(1)+'%)');
}
await b.close();
