// The wardrobe title now carries the brand name inside it, so it wraps to TWO
// lines. The gold "slider" rule under it is sized as a percentage of the TITLE
// BLOCK (left:8%;right:8%) and the bead sits at left:63% -- both were tuned
// against a ONE-line title. This measures the rule against the LAST LINE of
// text, which is what the eye actually compares it to.
const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
import http from 'http';
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve(import.meta.dirname, '..');
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0].slice(1)));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200); fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

const CASES = [
  { name: 'Catherine', label: 'with her name' },
  { name: '', label: 'no name' },
];

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const ruleByWidth = [];

const shots = [];
for (const w of [390, 375, 360]) {
  console.log(`\n=== ${w}px ===`);
  for (const c of CASES) {
    const p = await browser.newPage({ viewport: { width: w, height: 400 }, deviceScaleFactor: 2 });
    await p.goto(base + '/', { waitUntil: 'load' });
    await p.evaluate(n => localStorage.setItem('ss_data', JSON.stringify({ userName: n || 'You', answers: Array(12).fill(6), topArchNames: ['Timeless Classic'], portrait: 'x', motto: 'y' })), c.name);
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(2600);
    await p.evaluate(() => openWardrobe('list'));
    await p.waitForTimeout(700);
    const m = await p.evaluate(() => {
      const t = document.querySelector('#s-wardrobe .wdr-title');
      const rg = document.createRange(); rg.selectNodeContents(t);
      const rects = [...rg.getClientRects()].filter(r => r.width > 1);
      const byTop = new Map();
      for (const r of rects) {
        const k = Math.round(r.top);
        const e = byTop.get(k) || { left: Infinity, right: -Infinity };
        e.left = Math.min(e.left, r.left); e.right = Math.max(e.right, r.right);
        byTop.set(k, e);
      }
      const lines = [...byTop.entries()].sort((a, b) => a[0] - b[0])
        .map(([, e]) => ({ left: e.left, right: e.right, w: e.right - e.left }));
      const box = t.getBoundingClientRect();
      const cs = getComputedStyle(t, '::after');
      const bs = getComputedStyle(t, '::before');
      // ⚠️ getComputedStyle on a pseudo-element resolves percentages to USED
      // pixels, so a percentage must never be re-applied to the block width --
      // the first version of this harness did and reported a 156px rule where
      // the real one is 268px. Take the px value as-is.
      const px = s => parseFloat(s);
      const ruleL = box.left + px(cs.left);
      const ruleR = box.right - px(cs.right);
      const beadC = box.left + px(bs.left) + px(bs.width) / 2;
      return {
        text: t.textContent,
        lines: lines.map(l => ({ w: Math.round(l.w), left: Math.round(l.left), right: Math.round(l.right) })),
        box: { left: Math.round(box.left), right: Math.round(box.right), w: Math.round(box.width) },
        rule: { left: Math.round(ruleL), right: Math.round(ruleR), w: Math.round(ruleR - ruleL) },
        bead: Math.round(beadC),
      };
    });
    const last = m.lines[m.lines.length - 1];
    const overhangL = Math.round(last.left - m.rule.left);
    const overhangR = Math.round(m.rule.right - last.right);
    console.log(`  ${c.label.padEnd(14)} "${m.text}"`);
    console.log(`    ${m.lines.length} line(s): ${m.lines.map(l => l.w + 'px').join(' / ')}   block ${m.box.w}px`);
    console.log(`    rule ${m.rule.w}px  |  vs LAST line ${last.w}px  ->  sticks out ${overhangL}px left, ${overhangR}px right`);
    console.log(`    bead at ${m.bead} (${((m.bead - m.rule.left) / (m.rule.w) * 100).toFixed(0)}% along the rule)`);
    // ⚠️ THE ONE THAT MATTERS: the block must HUG its widest line. An
    // inline-block that wraps takes the full available width instead, which
    // silently makes the percentage-sized rule a function of the SCREEN.
    const widest = Math.max(...m.lines.map(l => l.w));
    ok(Math.abs(m.box.w - widest) <= 2, `${c.label}: title block hugs its widest line (${m.box.w} vs ${widest})`);
    ok(m.rule.w < widest, `${c.label}: rule sits inside the title, not past it (${m.rule.w} < ${widest})`);
    ok(Math.abs((m.bead - m.rule.left) - (m.rule.right - m.bead)) < m.rule.w,
       `${c.label}: bead is on the rule`);
    if (c.name) ruleByWidth.push(m.rule.w);
    if (w === 390) shots.push({ label: `${c.label} — ${w}px`, buf: (await p.screenshot()).toString('base64') });
    await p.close();
  }
}

const cp = await browser.newPage({ viewport: { width: 100, height: 100 } });
const out = await cp.evaluate(async ({ shots, W, H, SCALE }) => {
  const PAD = 18, LABEL = 40, HEAD = 60;
  const cw = W * SCALE, ch = H * SCALE;
  const c = document.createElement('canvas');
  c.width = PAD + (cw + PAD) * shots.length;
  c.height = HEAD + LABEL + ch + PAD;
  const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = '#111'; x.font = 'bold 30px system-ui, sans-serif';
  x.fillText('THE TITLE + ITS GOLD RULE', PAD, 40);
  for (let i = 0; i < shots.length; i++) {
    const img = new Image(); img.src = 'data:image/png;base64,' + shots[i].buf; await img.decode();
    const px = PAD + i * (cw + PAD);
    x.fillStyle = '#111'; x.font = 'bold 22px system-ui, sans-serif';
    x.fillText(shots[i].label, px, HEAD + 26);
    x.drawImage(img, px, HEAD + LABEL, cw, ch);
    x.strokeStyle = '#ddd'; x.lineWidth = 2; x.strokeRect(px, HEAD + LABEL, cw, ch);
  }
  return c.toDataURL('image/png');
}, { shots, W: 390, H: 400, SCALE: 2 });
fs.writeFileSync(path.join(ROOT, 'scratchpad', 'titlerule.png'), Buffer.from(out.split(',')[1], 'base64'));
await cp.close();
console.log('\n-> wrote titlerule.png');

// The rule must be the same length on every phone -- that is the whole point of
// the forced break. If this ever fails, the block has gone back to filling the
// screen and the rule is being sized by the viewport again.
ok(new Set(ruleByWidth).size === 1,
   `rule is the same length at 390/375/360 (${ruleByWidth.join(' / ')})`);
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close(); server.close();
if (fail) process.exit(1);
