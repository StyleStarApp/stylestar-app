// feedphoto.js — the feed garment's PHOTOGRAPH on the wardrobe shelf, and the
// bare quote marks that appeared beside it.
//
// Both bugs Cath saw on her own phone the first night the catalog reached her
// shelves (2026-09-06), and both are the SAME cause: _curatedCard was written
// for her 107 hand-picks, which carry a note and no photo. A feed garment is
// the mirror image -- a photo and no note -- so the card rendered neither the
// picture it had nor anything but empty quotes where the note it didn't have
// would go. Measured that night: 107/107 of hers have a note and 0 an image;
// 200/200 of a live feed slot have an image and 0 a note.
//
// Run: NODE_PATH=/opt/node22/lib/node_modules node scratchpad/feedphoto.js
import fs from 'fs';
import path from 'path';
import https from 'https';
import os from 'os';
import { execFileSync } from 'child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = 8951;

let pass = 0, failn = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { failn++; console.log('  ✗ FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// A real 6x8 PNG, CRCs and all. ⚠️ Generated, never hand-typed: the first
// draft of this file carried a plausible-looking base64 blob whose IHDR and
// IDAT checksums were both wrong, so Chromium fetched it, refused to decode
// it, fired onerror -- and every photo check read as a code failure for an
// hour. A decoding image is the instrument here; verify the instrument.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAYAAAAICAIAAABVpBlvAAAAEUlEQVR4nGM4sW8VGmIYDEIANAlpAQERR0YAAAAASUVORK5CYII=',
  'base64');

const chromium = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default.chromium;
// ⚠️ HTTPS, with a throwaway self-signed cert. The card deliberately renders a
// photo ONLY for an https:// url, so a plain http test server can never
// exercise the real path -- every "the photo is visible" check would quietly
// measure the onerror branch instead and report a false green. That is exactly
// the trap this file exists to avoid, so the harness matches production.
const CERTDIR = fs.mkdtempSync(path.join(os.tmpdir(), 'feedphoto-'));
execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048',
  '-keyout', CERTDIR + '/key.pem', '-out', CERTDIR + '/cert.pem',
  '-days', '1', '-nodes', '-subj', '/CN=localhost',
  '-addext', 'subjectAltName=DNS:localhost'], { stdio: 'ignore' });
const TLS = { key: fs.readFileSync(CERTDIR + '/key.pem'), cert: fs.readFileSync(CERTDIR + '/cert.pem') };
const srv = https.createServer(TLS, (rq, rs) => {
  let u = rq.url.split('?')[0]; if (u === '/') u = '/index.html';
  if (u === '/testpic.png') { rs.setHeader('content-type', 'image/png'); return rs.end(PNG); }
  const f = path.join(ROOT, decodeURIComponent(u));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) {
    rs.setHeader('content-type', u.endsWith('.html') ? 'text/html' : u.endsWith('.json') ? 'application/json'
      : u.endsWith('.css') ? 'text/css' : 'application/octet-stream');
    rs.end(fs.readFileSync(f));
  } else { rs.statusCode = 404; rs.end('nf'); }
});
await new Promise(r => srv.listen(PORT, r));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const errs = [];

// ⚠️ THE PHOTO MUST REALLY DECODE, or every check below silently measures the
// onerror branch instead and reports a false green. Two things that seem fine
// and are not: an https://img/... placeholder (what feedshelf.js uses, quite
// correctly, since it only ever cares about the text) can never resolve; and
// serving it from this file's own TLS server RESET the connection under four
// concurrent requests -- measured, ERR_CONNECTION_RESET, three of four images.
// So Playwright fulfils the image itself, which cannot be flaky.
const PIC = 'https://cdn.test.example/pic.png';
const PIC_404 = 'https://cdn.test.example/gone.png';

function feedItem(i, over) {
  return Object.assign({
    id: 'mid:' + i + ':c', slot: 'to5', feed: true, active: true,
    brand: 'Brand ' + i, name: 'Silk Blouse ' + i,
    retailer: ['Mytheresa', 'Olivela', 'Fleur du Mal', 'FARM Rio'][i % 4],
    url: 'https://click.linksynergy.com/deeplink?id=jZNkkinrr1k&n=' + i,
    image: PIC,
    price: 200 + i, listPrice: null, onSale: false, band: '$$$',
    colors: ['Black'], pattern: '', attrs: ['100% Silk'], families: [],
    petite: false, tall: false, plus: false, sizes: ['S', 'M'],
    note: '',                       // ← a feed garment never has one
  }, over || {});
}
const AI_ITEMS = { items: [
  { name: 'AI Blouse A', search: 'silk professional blouse', store: 'Nordstrom' },
  { name: 'AI Blouse B', search: 'cotton professional blouse', store: 'Talbots' },
  { name: 'AI Blouse C', search: 'crepe professional blouse', store: 'Ann Taylor' },
  { name: 'AI Blouse D', search: 'poplin professional blouse', store: 'Boden' }] };

// ⚠️ .wdr-curated is BOTH catalogs. The app really does fetch her 107
// hand-picks from products.json here (only product-search is stubbed), so a
// shelf legitimately mixes her pieces with the feed's -- which is the whole
// design. Assert on each source by NAME, never on the shared class.
const FEED = r => r.cards.filter(c => /Silk Blouse [1-9]/.test(c.name));
const HERS = r => r.cards.filter(c => c.curated && !/Silk Blouse [1-9]/.test(c.name));

async function shelf(feed) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: true });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await pg.route('**/cdn.test.example/**', r =>
    /gone/.test(r.request().url()) ? r.fulfill({ status: 404, body: '' })
                                   : r.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
  await pg.route('**/.netlify/functions/product-search', r =>
    r.fulfill({ status: 200, contentType: 'application/json',
                body: JSON.stringify({ products: feed || [], slot: 'to5' }) }));
  await pg.route('**/.netlify/functions/style-ai', r =>
    r.fulfill({ status: 200, contentType: 'application/json',
                body: JSON.stringify({ content: [{ text: JSON.stringify(AI_ITEMS) }] }) }));
  await pg.goto('https://localhost:' + PORT + '/');
  await pg.waitForTimeout(2600);
  await pg.evaluate(() => {
    localStorage.setItem('ss_data', JSON.stringify({ userName: 'T', answers: new Array(12).fill(6),
      topArchNames: ['The Statement Maker', 'The Modern Classic', 'The Serene Grace'], portrait: 'p', motto: 'm' }));
    topArchNames = ['The Statement Maker', 'The Modern Classic', 'The Serene Grace'];
    quizTaken = true;
    openWardrobe();
  });
  await pg.waitForTimeout(200);
  await pg.evaluate(() => wardrobeSeeIdeas('to5'));
  await pg.waitForTimeout(1200);
  // loading="lazy": an off-screen card never fetches its photo, so scroll the
  // shelf into view and give the decode a moment before measuring anything.
  await pg.evaluate(() => { const b = document.getElementById('wx_to5'); if (b) b.scrollIntoView({ block: 'center' }); });
  await pg.waitForTimeout(900);
  const cards = await pg.evaluate(() => {
    const box = document.getElementById('wx_to5');
    return [...(box ? box.querySelectorAll('.shop-card') : [])].map(c => {
      const img = c.querySelector('img.wdr-cur-photo');
      const note = c.querySelector('.wdr-cur-note');
      const cr = c.getBoundingClientRect();
      const ir = img ? img.getBoundingClientRect() : null;
      return {
        curated: c.classList.contains('wdr-curated'),
        haspic: c.classList.contains('wdr-haspic'),
        name: (c.querySelector('.shop-item-name') || {}).textContent || '',
        hasImgEl: !!img,
        src: img ? img.getAttribute('src') : '',
        loaded: img ? (img.complete && img.naturalWidth > 0) : false,
        shown: img ? getComputedStyle(img).display !== 'none' : false,
        iw: ir ? Math.round(ir.width) : 0, ih: ir ? Math.round(ir.height) : 0,
        cw: Math.round(cr.width),
        bw: parseFloat(getComputedStyle(c).borderLeftWidth) || 0,
        // full-bleed: the photo reaches the card's own left and right edges
        bleedL: ir ? Math.round(ir.left - cr.left) : null,
        bleedR: ir ? Math.round(cr.right - ir.right) : null,
        bleedT: ir ? Math.round(ir.top - cr.top) : null,
        overflowsCard: ir ? (ir.left < cr.left - 0.5 || ir.right > cr.right + 0.5) : false,
        noteEl: !!note,
        noteTxt: note ? note.textContent.trim() : '',
      };
    });
  });
  const overflow = await pg.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  await ctx.close();
  return { cards, overflow };
}

// ── 1. A feed garment: photo shown, no bare quote marks ──────────────────
console.log('A feed garment (photo, no note)');
let r = await shelf([1, 2, 3, 4].map(i => feedItem(i)));
let fed = FEED(r);
// ⚠️ COUNTS RELAXED FROM 2 TO 1, 2026-09-06. These were written when the feed
// could take a whole row. Cath then chose "feed as a garnish" and the ceiling
// admits ONE feed garment per row while her own picks are available, so `>= 2`
// now asserts the behaviour she reported as the bug.
// ▶ THE EVIDENCE THIS IS A COUNT CHANGE AND NOT A COVER-UP: on the run that
// failed, every BEHAVIOURAL check passed untouched -- the photo really decoded,
// it was 3:4 and not stretched, a 404 hid rather than leaving a torn icon, a
// non-https url produced no <img> at all, a photo-less piece got no phantom
// image, and the card measured 128px wide, a whole card. Only the counts moved.
// ⚠️ The width assertion (cw > 100) is the one that actually guards the card,
// and it is deliberately KEPT on every line below.
ok('feed garments reached the shelf', fed.length >= 1, String(fed.length));
ok('every feed card carries an <img>', fed.every(c => c.hasImgEl));
ok('…flagged with wdr-haspic', fed.every(c => c.haspic));
ok('…pointing at the catalog photo', fed.every(c => /pic\.png$/.test(c.src)));
ok('…and the image really DECODED (not just an element)', fed.every(c => c.loaded),
   JSON.stringify(fed.map(c => c.loaded)));
ok('…visible, with real pixels on screen', fed.every(c => c.shown && c.iw > 40 && c.ih > 40),
   JSON.stringify(fed.map(c => [c.iw, c.ih])));
// Flush to the card's PADDING box, i.e. inset by exactly the card's own 1px
// hairline border and nothing else — the border should frame the photograph,
// not be covered by it. Measured against the border rather than hard-coded, so
// changing the card's frame does not turn this red for the wrong reason.
ok('…full-bleed to the card’s own edges, inside its hairline',
   fed.every(c => c.bw > 0 && c.bleedL === Math.round(c.bw) && c.bleedR === Math.round(c.bw) && c.bleedT === Math.round(c.bw)),
   JSON.stringify(fed.map(c => ({ border: c.bw, inset: [c.bleedL, c.bleedR, c.bleedT] }))));
ok('…and never spilling past them', fed.every(c => !c.overflowsCard));
ok('…shot 3:4, not stretched', fed.every(c => Math.abs(c.ih / c.iw - 4 / 3) < 0.06),
   JSON.stringify(fed.map(c => (c.ih / c.iw).toFixed(2))));
// ⭐ THE BUG SHE SAW: '' still got wrapped in “ ”.
ok('NO empty quote marks where a note would be', fed.every(c => !c.noteEl),
   JSON.stringify(fed.map(c => c.noteTxt)));
ok('the page still does not scroll sideways', !r.overflow);

// ── 2. Her own hand-pick: note shown, no photo, exactly as before ─────────
console.log('One of her 107 hand-picks (note, no photo) — no regression');
r = await shelf([1, 2, 3, 4].map(i =>
  feedItem(i, { image: '', note: 'A quiet silk that reads expensive. Wear it with everything.' })));
fed = FEED(r);
ok('a note-carrying, photo-less piece reaches the shelf', fed.length >= 1, String(fed.length));
ok('no <img> is invented for a piece with no photo', fed.every(c => !c.hasImgEl));
ok('…and no wdr-haspic class', fed.every(c => !c.haspic));
ok('the note still shows, in quotes', fed.every(c => c.noteEl && /reads expensive/.test(c.noteTxt)),
   JSON.stringify(fed.map(c => c.noteTxt)));
// And her REAL 107, loaded from the real products.json alongside the feed.
const hers = HERS(r);
ok('her own hand-picks are on the same shelf', hers.length > 0, String(hers.length));
ok('…each still wearing its note', hers.every(c => c.noteEl && c.noteTxt.length > 3),
   JSON.stringify(hers.map(c => c.noteTxt.slice(0, 30))));
ok('…and none given a phantom photo', hers.every(c => !c.hasImgEl));

// ── 3. A broken photo url must leave an ordinary card, not a torn icon ────
console.log('A photo that 404s');
r = await shelf([1, 2, 3, 4].map(i => feedItem(i, { image: PIC_404 })));
fed = FEED(r);
ok('the broken image is hidden, not left as a torn icon', fed.every(c => !c.shown),
   JSON.stringify(fed.map(c => c.shown)));
ok('…and the card is still a whole card', fed.length >= 1 && fed.every(c => c.cw > 100), JSON.stringify(fed.map(c => c.cw)));
ok('…with no sideways scroll', !r.overflow);

// ── 4. The url is catalog data: it never gets to choose its own scheme ────
console.log('An image url that is not https');
r = await shelf([
  feedItem(1, { image: 'javascript:alert(1)' }),
  feedItem(2, { image: 'data:image/svg+xml,<svg onload="alert(1)"/>' }),
  feedItem(3, { image: 'http://insecure.example/x.jpg' }),
  feedItem(4, { image: '//protocol.relative/x.jpg' }),
]);
fed = FEED(r);
ok('no <img> at all for a non-https url', fed.every(c => !c.hasImgEl),
   JSON.stringify(fed.map(c => c.src)));
ok('…and those cards still render fully', fed.length >= 1 && fed.every(c => c.cw > 100), String(fed.length));

ok('zero JS errors throughout', errs.length === 0, errs.join(' | '));

await b.close(); srv.close();
fs.rmSync(CERTDIR, { recursive: true, force: true });
console.log(`\n${pass} passed, ${failn} failed`);
process.exit(failn ? 1 : 0);
