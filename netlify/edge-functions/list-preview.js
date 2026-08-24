// The link preview for a shared wishlist (2026-08-21, her catch).
//
// 🚨 WHY THIS CANNOT LIVE IN THE APP: iMessage, WhatsApp and every other
// messenger build their preview card by FETCHING THE URL AND READING THE RAW
// HTML. They never run JavaScript. Style Star is one file served for every
// address, so /list/<token> handed them the homepage's og: tags and every
// shared wishlist previewed as "Discover your signature style" — identical to
// sharing the whole app, which is what she saw and reported.
//
// ▶ So the tags have to change BEFORE the HTML reaches the phone. That is an
//   edge function, and it is scoped to /list/* alone: no other page on the
//   site passes through it, so the blast radius is exactly this one path.
//
// ⚠️ The og:image is deliberately LEFT ALONE. It is her flattened Style Star
//    letterhead, which is right for a wishlist page too, and the same mark now
//    signs the foot of the page itself.
//
// ⚠️ Previews are CACHED PER URL by Apple and the rest. A link already sent
//    keeps its old card; new links get this one. Nothing to fix, just expected.
//
// ⚠️ Deliberately NO NAME in the card. Naming whose list it is would mean
//    decrypting the share token here, which is real machinery for a nicer
//    sentence — and the name is on the page itself either way, so nothing is
//    gained in privacy or lost in warmth. Revisit only if she asks.

const TITLE = 'Style Star Wishlist';
const DESC  = 'A wishlist to shop from, made with Style Star.';

// Swap the CONTENT of a specific tag, matching the tag by its identifying
// attribute so the replacement cannot wander onto a different meta tag.
function setMeta(html, attr, name, value) {
  const re = new RegExp('(<meta\\s+' + attr + '="' + name + '"\\s+content=")[^"]*(")', 'i');
  return html.replace(re, '$1' + value + '$2');
}

export default async (request, context) => {
  const res = await context.next();
  const type = res.headers.get('content-type') || '';
  // Only ever touch HTML. Anything else (an asset, a redirect) passes straight
  // through untouched.
  if (!type.includes('text/html')) return res;

  let html = await res.text();
  html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + TITLE + '</title>');

  // 🚨 KEEP A WOMAN'S WISHLIST OUT OF GOOGLE (2026-08-24). Until now /list/<token>
  // returned a real, fully indexable page: verified live, 200 with no robots
  // directive anywhere on it. Nobody has been harmed by that -- these links get
  // sent by text, so a crawler has no way to find one -- but discovery only has
  // to happen ONCE (she posts hers publicly, a link ends up on a forum) and then
  // her list, and the token that opens it, is a search result.
  //
  // ⚠️ THE TOKEN IS THE CREDENTIAL, which is why noindex is the right tool and
  // robots.txt is NOT. A Disallow would stop the crawl, so the crawler would
  // never SEE this instruction, and Google can still list a disallowed URL it
  // found linked elsewhere -- showing the bare address, which is the entire
  // leak. Letting it crawl and telling it "noindex" is what actually removes
  // the page. robots.txt says the same thing in a comment so nobody helpfully
  // "tightens" it later.
  //
  // ⚠️ nofollow too: the page is full of outbound retailer links she chose, and
  // there is no reason to hand a crawler a trail out from a private page.
  // ⚠️ Messenger previews are UNAFFECTED. iMessage reads og: tags and does not
  // care about robots directives, so her share card looks exactly as before.
  html = html.replace(/<head(\s[^>]*)?>/i,
    '$&\n<meta name="robots" content="noindex, nofollow">');
  html = setMeta(html, 'property', 'og:title', TITLE);
  html = setMeta(html, 'property', 'og:description', DESC);
  html = setMeta(html, 'name', 'twitter:title', TITLE);
  html = setMeta(html, 'name', 'description', DESC);

  // Rebuild the headers rather than reusing them: the body length changed, so a
  // carried-over content-length would be wrong.
  const headers = new Headers(res.headers);
  headers.delete('content-length');
  return new Response(html, { status: res.status, headers });
};
