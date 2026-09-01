// Move the three inline <style> blocks out of index.html into /styles.css.
//
// WHY: the homepage's raw HTML was 1,160,663 bytes, over Bing's stated 1 MB
// soft limit by ~112 KB, and 317 KB of that (29% of the whole document) was
// three <style> blocks filling the <head> -- so <body> did not begin until
// the 29% mark, which is exactly the "extraneous code pushes the content down
// in the page source" that Bing's own panel names. Moving the CSS out takes
// the homepage to ~849 KB and /faq to ~675 KB, both under the limit, and the
// browser then caches those 317 KB across every route.
//
// ⚠️ The JavaScript is deliberately NOT moved. CSS alone clears the limit;
// the JS would mean hoisting, scope and execution order across ~77 inline
// functions for no additional benefit against it.
//
// This is a pure byte-for-byte move: the three blocks are concatenated IN
// DOCUMENT ORDER and nothing is reformatted or minified.
import fs from 'fs';

const HTML = 'index.html';
const CSS = 'styles.css';
const src = fs.readFileSync(HTML, 'utf8');

// Find every <style> block.
const blocks = [];
const re = /<style[^>]*>/g;
let m;
while ((m = re.exec(src))) {
  const close = src.indexOf('</style>', m.index);
  if (close === -1) throw new Error('unclosed <style> at ' + m.index);
  blocks.push({ open: m.index, inner: m.index + m[0].length, close, end: close + 8 });
}
if (blocks.length !== 3) throw new Error('expected 3 <style> blocks, found ' + blocks.length);

// They must be one contiguous run (whitespace only between them), or replacing
// the whole span in place would move markup that sits between them.
for (let i = 1; i < blocks.length; i++) {
  const between = src.slice(blocks[i - 1].end, blocks[i].open);
  if (between.trim() !== '') throw new Error('non-whitespace between style blocks ' + i);
}
// And they must all sit in the <head>, above <body>.
const bodyAt = src.indexOf('<body');
if (!(blocks[2].end < bodyAt)) throw new Error('a style block is not in the head');

const header = `/* Style Star -- the whole app's stylesheet.
 *
 * ⚠️⚠️ THIS FILE IS THE THREE INLINE <style> BLOCKS THAT USED TO LIVE IN THE
 * <head> OF index.html, CONCATENATED IN THAT EXACT ORDER (2026-09-01). The
 * cascade is order-dependent, so the three sections below must keep their
 * relative order -- moving one above another silently changes how things look.
 *
 * WHY IT WAS MOVED OUT: the homepage's raw HTML was 1,160,663 bytes, over
 * Bing's 1 MB soft limit, and 332,193 of those bytes (29% of the document)
 * sat ABOVE any visible content because these blocks filled the head. That is
 * precisely the "extraneous code can push the content down in the page source"
 * their panel names. Homepage is now ~849 KB, /faq ~675 KB, and a browser
 * caches this file once across every route instead of re-downloading 317 KB
 * of identical CSS on each one.
 *
 * ⚠️ THE HONEST TRADE, accepted deliberately: an external stylesheet is
 * render-blocking, so a COLD first paint is marginally later. Every repeat
 * visit is faster. That trade was made for a real reason -- weak-signal
 * failures on a real phone, and an audience that is out and about.
 *
 * ⚠️ index.html links this as href="/styles.css", ABSOLUTE and not relative.
 * The app is a single page served at /faq, /story, /journal/<slug> and more,
 * so a relative href would resolve to /journal/styles.css on an article route
 * and 404, leaving that page completely unstyled. Never make it relative.
 *
 * ⚠️ Nothing here is minified or reformatted; it is a byte-for-byte move, so
 * this file can be diffed against the old inline blocks at any time.
 */
`;

const parts = blocks.map(b => src.slice(b.inner, b.close));
const css = header + parts.join('\n');

// Replace the whole run with one link, in the same position, so the document
// order relative to the Google Fonts <link> above it is unchanged.
const link = `<!-- The app's stylesheet, moved out of this file 2026-09-01. See the header
  comment in styles.css for why, and for the two rules that matter: the three
  former <style> blocks must keep their order, and this href must stay
  ABSOLUTE (a relative one 404s on /journal/<slug> and every nested route). -->
  <link rel="stylesheet" href="/styles.css">`;

const out = src.slice(0, blocks[0].open) + link + src.slice(blocks[2].end);

fs.writeFileSync(CSS, css);
fs.writeFileSync(HTML, out);

const sum = parts.reduce((a, p) => a + p.length, 0);
console.log('style blocks moved :', parts.map(p => p.length).join(' + '), '=', sum, 'bytes of CSS');
console.log('styles.css written :', css.length, 'bytes');
console.log('index.html         :', src.length, '->', out.length, `(-${src.length - out.length})`);
console.log('body now begins at :', out.indexOf('<body'), `(was ${bodyAt})`);
