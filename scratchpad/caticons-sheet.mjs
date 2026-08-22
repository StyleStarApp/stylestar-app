import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const P = {
  top:        'M9 3.7 4.4 5.8 3 9.6l3.2 1.1V20.3h11.6V10.7L21 9.6l-1.4-3.8L15 3.7M9 3.7c.7 2.2 5.3 2.2 6 0',
  bottom:     'M5.6 3.7h12.8l1.1 16.6h-4.9L12 10.4l-2.6 9.9H4.5zM5.6 7h12.8',
  dress:      'M9 3.7 6.4 5.5l1.2 4.2-2.4 10.6h13.6L16.4 9.7l1.2-4.2L15 3.7M9 3.7c.7 2 5.3 2 6 0',
  jacket:     'M8.8 3.6 4.2 5.9 3 9.9l2.8 1.1v9.4h12.4v-9.4L21 9.9l-1.2-4-4.6-2.3M8.8 3.6l3.2 4.6 3.2-4.6M12 8.2v12.2',
  shoes:      'M8.2 3.4h5.2l.5 8.2c.1 1.6 1 3 2.4 3.8l2.6 1.5c1 .6 1.6 1.6 1.6 2.7v.6H8.2zM7.9 14.2h5.9',
  bag:        'M5.8 8.5h12.4l-.8 10.6a1.2 1.2 0 0 1-1.2 1.1H7.8a1.2 1.2 0 0 1-1.2-1.1zM8.3 8.5C8.3 4.2 15.7 4.2 15.7 8.5',
  jewelry:    'M5.4 4.6c0 5.8 2.9 9.4 6.6 9.4s6.6-3.6 6.6-9.4M12 14v2.2M12 16.2a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2z',
  activewear: 'M9 3.5 5.4 5.4l1.3 4.1v8.4h10.6V9.5l1.3-4.1-3.6-1.9M9 3.5c.4 2.8 1.6 4.2 3 4.2s2.6-1.4 3-4.2',
  belt:       'M2.6 9.1h18.8v6H2.6zM8.7 7.4h6.6v9.4H8.7zM12 7.4v9.4',
  accessory:  'M12 3.4 14 9.3l6.2.2-4.9 3.8 1.8 6-5.1-3.5-5.1 3.5 1.8-6L1.8 9.5 8 9.3z',
};
const svg = (p,s) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:${s}px;height:${s}px"><path d="${p}"/></svg>`;
const cells = Object.keys(P).map(k => `<div class=c><div class=b>${svg(P[k],64)}</div><div class=s>${svg(P[k],26)}</div><div class=t>${svg(P[k],21)}</div><div class=l>${k}</div></div>`).join('');
fs.writeFileSync('scratchpad/caticons-set.html', `<!doctype html><meta charset=utf-8><style>body{margin:0;padding:22px;background:#fff;font:400 12px system-ui;color:#26221c}h2{font:600 14px system-ui;margin:0 0 3px}p{margin:0 0 16px;font-size:11.5px;color:#6b6355}.g{display:grid;grid-template-columns:repeat(5,1fr);gap:16px 8px}.c{text-align:center}.b{height:70px;display:flex;align-items:center;justify-content:center}.s{height:32px;display:flex;align-items:center;justify-content:center}.t{height:30px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#efe3c9,#d6bf8e);width:40px;border-radius:9px;margin:2px auto 0}.l{font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;color:#6b6355;margin-top:4px}</style><h2>Category icons — revised</h2><p>64px &middot; 26px (grid card) &middot; 21px inside the real 40&times;40 gold tile</p><div class=g>${cells}</div>`);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const pg = await b.newPage({ viewport:{width:760,height:560}, deviceScaleFactor:2 });
await pg.goto('file://' + process.cwd() + '/scratchpad/caticons-set.html');
await pg.waitForTimeout(250);
await pg.screenshot({ path:'scratchpad/caticons-set.png', fullPage:true });
await b.close(); console.log('ok');
