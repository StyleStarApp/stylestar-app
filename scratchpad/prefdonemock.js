// prefdonemock.js — the "Maybe later" dead end (Cath's find, 2026-08-15 night).
// Finishing Refine without giving an email currently lands her back on the
// portrait she already read, because the "Let's go shopping" button lives
// inside prefSavedBlock (display:none until she saves).
// Renders the current screen + three directions, per-option 2x, her format.
// Run: NODE_PATH=/opt/node22/lib/node_modules node scratchpad/prefdonemock.js
import fs from 'fs';
import path from 'path';
import http from 'http';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = import.meta.dirname;

(async () => {
  const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
  const srv = http.createServer((req, res) => {
    let p = req.url.split('?')[0]; if (p === '/') p = '/index.html';
    const f = path.join(ROOT, decodeURIComponent(p));
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      res.setHeader('content-type', p.endsWith('.html') ? 'text/html' : p.endsWith('.json') ? 'application/json' : 'application/octet-stream');
      res.end(fs.readFileSync(f));
    } else { res.statusCode = 404; res.end('nf'); }
  });
  await new Promise(r => srv.listen(8952, r));
  const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});

  async function shot(variant, label) {
    const ctx = await b.newContext({viewport: {width: 390, height: 1000}, deviceScaleFactor: 2});
    const pg = await ctx.newPage();
    await pg.route('**/.netlify/**', r => r.fulfill({status: 200, contentType: 'application/json', body: '{"content":[{"text":"{}"}]}'}));
    await pg.goto('http://localhost:8952/');
    await pg.waitForTimeout(2600);
    await pg.evaluate(v => {
      localStorage.setItem('ss_data', JSON.stringify({userName: 'Cath', answers: new Array(12).fill(6), topArchNames: ['The Timeless Classic'], portrait: 'p', motto: 'm'}));
      show('s-pref-done');
      const save = document.getElementById('prefSaveBlock');
      const title = document.getElementById('prefDoneTitle');
      const sub = save.querySelector('.pref-done-sub');
      const form = document.getElementById('prefSaveForm');
      const legal = save.querySelector('div[style*="12.5px"]');
      const later = save.querySelector('button.retake');
      // The real button, lifted from prefSavedBlock so every render shows the
      // genuine thing rather than a drawing of it.
      const shopBtn = document.querySelector('#prefSavedBlock .btn-pink').cloneNode(true);
      shopBtn.setAttribute('onclick', 'prefShopNow()');
      // ⚠️ .hm-cta-seal is position:absolute at top:-32px right:-18px — the
      // gold star HANGS above the button's corner. In prefSavedBlock the recap
      // chips give it that room; anywhere else it collides with the line above.
      shopBtn.style.marginTop = '30px';
      // A cloned <defs> would duplicate the prefSeal gradient id, and Safari
      // has refused to paint a def that lives inside a hidden screen before.
      shopBtn.querySelector('radialGradient').id = 'prefSealMock';
      shopBtn.querySelector('path[fill]').setAttribute('fill', 'url(#prefSealMock)');
      const hair = () => {
        const d = document.createElement('div');
        d.style.cssText = 'height:1px;background:#e4ded0;max-width:250px;margin:20px auto 16px';
        return d;
      };
      const lbl = t => {
        const d = document.createElement('div');
        d.style.cssText = "font:600 11px/1.3 'DM Sans',sans-serif;letter-spacing:.14em;color:#8a8474;margin-bottom:9px";
        d.textContent = t;
        return d;
      };
      if (v === 'a') {
        // A — shopping leads, the email ask follows below a hairline.
        sub.textContent = 'Your preferences are set. From here, shopping only gets easier and more fun.';
        sub.style.marginBottom = '1rem';
        save.insertBefore(shopBtn, sub.nextSibling);
        const h = hair(); save.insertBefore(h, shopBtn.nextSibling);
        const l = lbl('KEEP THEM FOR NEXT TIME'); save.insertBefore(l, h.nextSibling);
        const note = document.createElement('div');
        note.style.cssText = 'font-size:14px;color:#666;margin-bottom:12px;line-height:1.5';
        note.textContent = 'Save your details so they are always ready for you, on any device.';
        save.insertBefore(note, l.nextSibling);
        later.textContent = 'Maybe later';
      } else if (v === 'b') {
        // B — shopping leads, the email ask sits in a quiet bordered card so it
        // reads as plainly optional.
        sub.textContent = 'Your preferences are set. From here, shopping only gets easier and more fun.';
        sub.style.marginBottom = '1rem';
        save.insertBefore(shopBtn, sub.nextSibling);
        const card = document.createElement('div');
        card.style.cssText = 'border:1px solid #D8A52E;border-radius:2px;padding:14px 12px 10px;max-width:300px;margin:22px auto 0;background:linear-gradient(180deg,#FFFDF7,#FBF4E2)';
        card.appendChild(lbl('KEEP THEM FOR NEXT TIME'));
        const note = document.createElement('div');
        note.style.cssText = 'font-size:13.5px;color:#4a463e;margin-bottom:11px;line-height:1.5';
        note.textContent = 'Save your details so they are always ready for you, on any device.';
        card.appendChild(note);
        card.appendChild(form);
        card.appendChild(legal);
        card.appendChild(later);
        save.appendChild(card);
        later.style.marginTop = '4px';
      } else if (v === 'c') {
        // C — HER OWN INSTINCT, faithfully: the ask stays first and the
        // dismissal itself becomes the forward step.
        later.replaceWith(shopBtn);
        shopBtn.style.marginTop = '14px';
      }
      // Label the render so the images are readable side by side on her phone.
      const tag = document.createElement('div');
      tag.style.cssText = "font:700 12px/1.4 'DM Sans',sans-serif;letter-spacing:.1em;color:#8a8474;text-align:center;padding:10px 0 2px";
      tag.textContent = v === 'cur' ? 'CURRENT — Maybe later goes back to the portrait'
        : v === 'a' ? 'A — shopping leads, saving follows'
        : v === 'b' ? 'B — shopping leads, saving in its own quiet card'
        : 'C — your instinct: Maybe later becomes the shopping button';
      const card2 = document.querySelector('#s-pref-done .pref-done');
      card2.parentNode.insertBefore(tag, card2);
    }, variant);
    await pg.waitForTimeout(500);
    await pg.screenshot({path: path.join(OUT, 'prefdone-' + variant + '.png'), fullPage: true});
    console.log('  rendered prefdone-' + variant + '.png');
    await ctx.close();
  }

  for (const v of ['cur', 'a', 'b', 'c']) await shot(v, v);
  await b.close(); srv.close();
})();
