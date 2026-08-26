// Per-route titles for the five real pages (2026-08-25, her ask).
//
// 🚨 WHY THIS CANNOT LIVE IN THE APP: Style Star is one file. /story, /faq,
// /contact, /privacy and /terms are all rewrites onto the same index.html, so
// until now every one of them served the IDENTICAL raw <title> and
// <meta name="description"> — "Style Star | Discover your signature style" —
// regardless of which page a search engine, a link-preview bot, or a browser
// tab was actually looking at. A crawler that never runs JavaScript (and even
// Google's JS-rendering pass starts from this same raw markup) had no way to
// tell her FAQ page from her homepage.
//
// ▶ So, exactly like the wishlist preview (list-preview.js), the tags have to
//   change BEFORE the HTML reaches the crawler. That is an edge function,
//   scoped to these five paths alone via netlify.toml — no other page on the
//   site passes through it.
//
// ⚠️ THE CANONICAL TAG NOW SELF-REFERENCES INSTEAD OF POINTING HOME. The head
// comment above <link rel="canonical"> used to justify pointing every page at
// "/" on the grounds that all six addresses served "identical raw HTML" — true
// before this function existed, and it was the right call then: with no title
// or description of its own, telling Google to fold /faq into the homepage was
// the honest, safe move. Now that each page has real, distinct metadata, doing
// that would actively work against her — it would tell Google not to index
// these pages on their own, which defeats the entire point of this file.
// Home's own canonical still points at itself; nothing changes there.
//
// ⚠️ og:title / og:description / twitter:title move too, for the same reason
// the wishlist page's did: if she or a woman ever texts a link to /story or
// /faq, the preview card should say what that page actually is, not repeat
// the homepage's tagline.
//
// ⚠️ /results and /list/* are DELIBERATELY untouched here. /results already
// has its own reasoning in the sitemap for staying out of this (it's
// device-dependent, so a crawler with no saved results sees the plain
// homepage). /list/* has its own edge function already, and a shared wishlist
// must never be told it's indexable — see list-preview.js.

const PAGES = {
  '/story': {
    title: 'Meet Catherine, Your Personal Stylist | Style Star',
    desc: 'Meet Catherine, a personal stylist and certified image consultant with 20+ years of experience, and the story behind Style Star.',
  },
  '/faq': {
    title: 'Frequently Asked Questions | Style Star',
    desc: "Answers about Style Star: what it is, how the AI stylist works alongside real styling expertise, and how your privacy is handled.",
  },
  '/contact': {
    title: 'Contact Style Star — Get in Touch with Catherine',
    desc: "I'd love to hear from you. Whether it's a style question, an idea for Style Star, or something you need help with, reach out.",
  },
  '/privacy': {
    title: 'Privacy Policy | Style Star',
    desc: 'How Style Star collects, uses and protects your personal information, including your quiz answers, photos and account details.',
  },
  '/terms': {
    title: 'Terms of Service | Style Star',
    desc: 'The terms and conditions for using Style Star, including your rights, our affiliate disclosures, and how the service works.',
  },
  '/journal/how-to-find-your-personal-style': {
    title: "How to Find Your Personal Style: A Personal Stylist's Guide | Style Star",
    desc: 'A personal stylist of 20+ years explains how to find your personal style, starting with the outfit you already love. Take the free Style Star quiz to see your own Style Portrait.',
  },
};

// Swap the CONTENT of a specific tag, matching the tag by its identifying
// attribute so the replacement cannot wander onto a different meta tag.
function setMeta(html, attr, name, value) {
  const re = new RegExp('(<meta\\s+' + attr + '="' + name + '"\\s+content=")[^"]*(")', 'i');
  return html.replace(re, '$1' + value + '$2');
}

export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const page = PAGES[path];

  const res = await context.next();
  // No entry for this path (shouldn't happen given how netlify.toml scopes
  // this function, but a lookup miss must never take the page down) or not
  // HTML (an asset, a redirect) — pass straight through untouched.
  const type = res.headers.get('content-type') || '';
  if (!page || !type.includes('text/html')) return res;

  let html = await res.text();
  html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + page.title + '</title>');
  html = setMeta(html, 'name', 'description', page.desc);
  html = setMeta(html, 'property', 'og:title', page.title);
  html = setMeta(html, 'property', 'og:description', page.desc);
  html = setMeta(html, 'name', 'twitter:title', page.title);
  html = html.replace(/<link rel="canonical" href="[^"]*">/i,
    '<link rel="canonical" href="https://stylestar.app' + path + '">');

  // Rebuild the headers rather than reusing them: the body length changed, so a
  // carried-over content-length would be wrong.
  const headers = new Headers(res.headers);
  headers.delete('content-length');
  return new Response(html, { status: res.status, headers });
};
