const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 480, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + path.join(__dirname, 'compare.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  // ---- PROOF: variants genuinely differ (computed, not assumed) ----
  const proof = await page.evaluate(() => {
    const out = [];
    for (const id of ['vA', 'vB', 'vC', 'vD', 'vD2']) {
      const p = document.getElementById(id);
      const links = [...p.querySelectorAll('.lnk')].map(l => l.textContent);
      const l2 = [...p.querySelectorAll('.lnk2')].map(l => l.textContent);
      const first = p.querySelector('.lnk');
      const cs = getComputedStyle(first);
      // cluster centers with 5px tolerance: the 12px stars and 14px links sit on
      // the same visual line but their box tops differ by a pixel or two
      const centers = [...p.querySelectorAll('.row .lnk')]
        .map(e => { const r = e.getBoundingClientRect(); return r.top + r.height / 2; })
        .sort((a, b) => a - b);
      const tops = [];
      for (const c of centers) if (!tops.length || c - tops[tops.length - 1] > 5) tops.push(c);
      const phone = p.querySelector('.phone').getBoundingClientRect();
      out.push({
        id, links: links.join('|'), quietRow: l2.join('|') || '(none)',
        font: cs.fontFamily.split(',')[0] + ' ' + cs.fontSize,
        color: cs.color, mainRowLines: tops.length, phoneWidth: Math.round(phone.width)
      });
    }
    return out;
  });
  console.table(proof);

  const by = Object.fromEntries(proof.map(p => [p.id, p]));
  const checks = [
    ['A has 3 links, no Home', by.vA.links === 'Shop|My Story|FAQ'],
    ['B has 4 links, Home first', by.vB.links === 'Home|Shop|My Story|FAQ'],
    ['C = B plus quiet Privacy·Terms row', by.vC.links === 'Home|Shop|My Story|FAQ' && by.vC.quietRow === 'Privacy|Terms'],
    ['D has all 6 in the main row', by.vD.links === 'Home|Shop|My Story|FAQ|Privacy|Terms'],
    ['A, B, C main rows each fit on ONE line at 390', by.vA.mainRowLines === 1 && by.vB.mainRowLines === 1 && by.vC.mainRowLines === 1],
    ['Jost really loaded at 14px', proof.every(p => /Jost/.test(p.font) && /14px/.test(p.font))],
    ['390 vs 360 strips really differ', by.vD.phoneWidth === 390 && by.vD2.phoneWidth === 360],
    ['no JS errors', errs.length === 0],
  ];
  // D wrapping is reported, not asserted — the point is to SHOW it honestly
  console.log('D line count @390: ' + by.vD.mainRowLines + '  @360: ' + by.vD2.mainRowLines);
  let fail = 0;
  for (const [name, ok] of checks) { console.log((ok ? 'PASS' : 'FAIL') + '  ' + name); if (!ok) fail++; }

  await page.screenshot({ path: path.join(__dirname, 'footer-options.png'), fullPage: true });
  await browser.close();
  console.log(fail ? 'FAILURES: ' + fail : 'ALL CHECKS PASS');
  process.exit(fail ? 1 : 0);
})();
