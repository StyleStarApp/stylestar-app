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

// ── Body trim (2026-08-28, the route-rendering audit) ─────────────────────
//
// 🚨 UNTIL THIS, EVERY ROUTE SERVED THE SAME BODY. Style Star ships as one
// static index.html with all ~25 screens' markup always present -- the app
// shows one at a time client-side, but nothing server- or edge-side ever
// trimmed the RAW HTML, so a crawler that doesn't run JavaScript (most AI
// crawlers, and the first pass any search engine does) read the journal
// article's page as mostly Terms of Service and FAQ text with the real
// article buried in the middle. Proven live: she Googled her own name and
// Google's synthesized title read "Style Journal | Style Star - Discover
// your signature..." -- stitched from two different screens on the SAME
// document, because as far as Google could tell they were the same page.
//
// ▶ THE FIX: for every route below, strip every OTHER screen's markup out
// of the body before it's served, keeping only that route's own screen(s)
// (named in `scrId`) plus everything that ISN'T a screen at all -- the
// Menu, the entrance curtain, the shared footer, every CSS rule, every
// line of JS. None of those live inside a `.scr` div (confirmed by reading
// the real markup, not assumed), so this never touches them.
//
// ⚠️ A REAL HUMAN LANDING HERE COLD STILL NEEDS TO BE ABLE TO TAP ANYWHERE
// ELSE IN THE APP. index.html's own `_selfHealScreens()` + a guard inside
// `show()` handle that: the moment she taps something needing a screen
// that got trimmed out, the app quietly fetches the real, untouched
// /index.html (that literal filename bypasses every rewrite and this
// function -- neither is scoped to it) and merges the missing screens
// back in before the tap completes. Ship the two together; the trim alone
// would break navigation for a real visitor. See index.html for that half.
//
// ⚠️ NEVER LET A TRIM BUG TAKE DOWN THE PAGE. trimScreens() below is
// wrapped in try/catch at its one call site -- any failure serves the full,
// untrimmed (but still correctly titled) body instead, exactly what every
// route already served before today.
function findDivEnd(html, openTagStart) {
  const gt = html.indexOf('>', openTagStart);
  if (gt === -1) throw new Error('no > for opening tag at ' + openTagStart);
  let depth = 1, pos = gt + 1;
  while (depth > 0) {
    const nextOpen = html.indexOf('<div', pos);
    const nextClose = html.indexOf('</div>', pos);
    if (nextClose === -1) throw new Error('unbalanced <div> near ' + pos);
    if (nextOpen !== -1 && nextOpen < nextClose) { depth++; pos = nextOpen + 4; }
    else { depth--; pos = nextClose + 6; }
  }
  return pos;
}
// ⚠️ BOUNDED TO THE REAL SCREENS REGION ONLY -- <body> up to the first real
// <script> tag. A search over the WHOLE document also matches a code
// COMMENT elsewhere that happens to contain the literal text
// `<div class="scr" id="...">` as a written-out example (found the hard
// way, prototyping this against the real file before it ever touched this
// function) -- that "block" has no real closing tag and would throw.
// Confirmed separately: zero <script> tags exist inside any real screen, so
// this bound can never clip a genuine block short.
function findScrBlocks(html) {
  const bodyStart = html.indexOf('<body>');
  const scriptStart = html.indexOf('<script', bodyStart);
  if (bodyStart === -1 || scriptStart === -1) throw new Error('could not bound the screens region');
  const re = /<div class="scr[^"]*" id="([^"]+)"/g;
  re.lastIndex = bodyStart;
  const blocks = [];
  let m;
  while ((m = re.exec(html)) && m.index < scriptStart) {
    const start = m.index, id = m[1];
    blocks.push({ id, start, end: findDivEnd(html, start) });
  }
  return blocks;
}
function trimScreens(html, keepIds) {
  const blocks = findScrBlocks(html);
  let out = html;
  for (let i = blocks.length - 1; i >= 0; i--) {
    const b = blocks[i];
    if (!keepIds.includes(b.id)) out = out.slice(0, b.start) + out.slice(b.end);
  }
  return out;
}

const PAGES = {
  '/story': {
    title: 'Meet Catherine, Your Personal Stylist | Style Star',
    desc: 'Meet Catherine, a personal stylist and certified image consultant with 20+ years of experience, and the story behind Style Star.',
    scrId: 's-story',
  },
  '/faq': {
    title: 'Frequently Asked Questions | Style Star',
    desc: "Answers about Style Star: what it is, how the AI stylist works alongside real styling expertise, and how your privacy is handled.",
    scrId: 's-faq',
    // FAQPage schema (2026-08-26): all 18 real Q&A pairs, pulled straight off
    // the live page with a headless browser reading .textContent (not typed
    // by hand) so this can never drift from what a visitor actually sees.
    // Google can render an FAQ's questions as expandable results directly in
    // the search listing -- real estate no other page on the site can get.
    // ⚠️ If a question is ever added/edited/removed in index.html, this
    // block must be regenerated the same way, not hand-edited -- see the
    // extraction method in CLAUDE.md dated 2026-08-26.
    schema:     {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
                {
                      "@type": "Question",
                      "name": "What is Style Star?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Style Star combines the insight and care of a real personal stylist with the brilliance of modern technology. All in one place, you can take our fun style quiz, ask questions, get styling advice and honest photo feedback, and follow shopping links straight to the good stuff, making it all fun and easy. It's designed to align your style, so you can step out and shine your light."
                      }
                },
                {
                      "@type": "Question",
                      "name": "What if I don't know what my style is?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "That's exactly why Style Star exists. You don't need to have it all figured out. That's our job. We help you discover what suits your personality, lifestyle, and preferences, so shopping feels easier, getting dressed feels faster, and every piece you bring home brings out the best in you. Your discernment, combined with our expertise, is where your style comes to life."
                      }
                },
                {
                      "@type": "Question",
                      "name": "What makes Style Star different?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Style Star was created by me, Catherine, a personal stylist of over 20 years. It's not a faceless algorithm. It's real styling from a real stylist who genuinely cares, brought to you with expertise and love. And where most style advice pushes everyone toward the same trends and brands, I start with you. Instead of asking \"What's fashionable?\" I ask \"What feels most like you?\" I'm not here to tell you what's beautiful. I'm here to help you recognize what feels beautiful to you, and shine a light on exactly that."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Is this a real stylist or AI, and does anyone see what I share?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "It's both. I'm Catherine, and I built Style Star's AI stylist to think the way I do, my approach and my philosophy, written into how it works. The AI itself is Claude, made by Anthropic. Your photos and chats are sent there to be understood in the moment, and are not used to train it.Your chats and photos are never stored by Style Star, and no one here reads them. The details you choose to save, your name, email, sizes, colors, likes and dislikes, are kept in a secure database so your results can follow you from your phone to your laptop. I run Style Star, so I can reach that database if I need to fix something or delete your information when you ask. I don't browse it, I never sell it, and it never goes to anyone who wants to market to you."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Is my information private?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes. We use your details only to personalize your styling and save your results, we never sell them, and you can read exactly how we handle everything in our Privacy Policy and Terms of Service."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Do I have to take the quiz?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Not at all. You're welcome to chat with your stylist, analyze a photo, or browse and shop anytime. The quiz helps us understand the nuances of your style so everything feels more personal, but it's completely optional."
                      }
                },
                {
                      "@type": "Question",
                      "name": "What is my Style Portrait?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Your Style Portrait is a snapshot of your personal style from the quiz. It highlights your natural preferences and becomes the foundation for the guidance, shopping ideas, and advice you'll get throughout the app."
                      }
                },
                {
                      "@type": "Question",
                      "name": "How does Style Star help me build my wardrobe?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Style Star includes a list feature, called Your Wardrobe List, to help you build a complete, well-rounded closet. I took the same checklist I use in my real closet consultations and turned it into an easy list, so you can tap a star on anything you\u2019d love to add and see at a glance what would round out your closet. Then just tap anything you\u2019d like for shopping ideas matched to your style, or peek at What\u2019s Trending to see what\u2019s fresh right now."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Can I share my results?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes, and we'd love that! After the quiz, you'll get a beautiful card to share: your style, your own motto, and the notes that make it yours. Text it to a friend or post it on Instagram. It's a fun way to celebrate your style, and to invite the women you love to discover theirs."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Can I upload a photo for style advice?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes. Share an outfit or a piece you're considering, and your stylist will give you thoughtful feedback to elevate the look while keeping it true to you. Your photo is sent to our AI to be looked at in the moment, and Style Star never stores it. If you share it in the stylist chat, a copy stays in that conversation on your own device so you can scroll back, and clearing it is as easy as tapping \"Start a fresh conversation.\"."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Can I retake the quiz or change my results?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes, as many times as you want. Your style can evolve, and your results can grow right along with it."
                      }
                },
                {
                      "@type": "Question",
                      "name": "How do I get my results back on another device?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Just your email. You don't need to create a password or remember anything. Simply save your results with your email address and you can pick up right where you left off, on any device."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Can I add Style Star to my phone like an app?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes! You can add Style Star to your home screen so it opens full-screen with its own icon, just like an app. No app store needed. On an iPhone (using Safari): Open stylestar.app in Safari. Tap the Share icon at the bottom of the screen (the square with an arrow pointing up). Scroll down and tap \"Add to Home Screen.\" Tap \"Add\" in the top right. On an Android phone (using Chrome): Open stylestar.app in Chrome. Tap the menu (the three dots in the top right). Tap \"Add to Home screen,\" then \"Add.\"."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Is Style Star free?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes, Style Star is free to use. If you shop through some of our links, we may earn a small commission at no extra cost to you, and that's what helps keep it free."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Do you sell the clothes?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No, we don't sell anything ourselves. We point you to the stores and pieces that suit your style. In the Style Star Edit, you'll find pieces personally hand-selected by me, the ones I wear myself and recommend to my clients."
                      }
                },
                {
                      "@type": "Question",
                      "name": "Is Style Star for every body, age, and budget?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Absolutely. Style is personal, and Style Star is here to celebrate yours, whatever your size, age, or budget. Beautiful style exists at every price point, and you don't need to be a fashion expert. We meet you exactly where you are."
                      }
                },
                {
                      "@type": "Question",
                      "name": "How do I get in touch?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "I'd love to hear from you. Reach me at hello@stylestar.app."
                      }
                },
                {
                      "@type": "Question",
                      "name": "What is the heart behind Style Star?",
                      "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "I believe style has the power to help you shine your light, and when you feel confident in yourself, that light naturally reaches the people around you."
                      }
                }
          ]
    },
  },
  '/contact': {
    title: 'Contact Style Star — Get in Touch with Catherine',
    desc: "I'd love to hear from you. Whether it's a style question, an idea for Style Star, or something you need help with, reach out.",
    scrId: 's-contact',
  },
  '/privacy': {
    title: 'Privacy Policy | Style Star',
    desc: 'How Style Star collects, uses and protects your personal information, including your quiz answers, photos and account details.',
    scrId: 's-privacy',
  },
  '/terms': {
    title: 'Terms of Service | Style Star',
    desc: 'The terms and conditions for using Style Star, including your rights, our affiliate disclosures, and how the service works.',
    scrId: 's-terms',
  },
};

// ── Style Journal (2026-08-26, her ask: "each time we post another article
// do we need to update this?") ──────────────────────────────────────────
//
// One small ARTICLES list, and everything else -- each article's own PAGES
// entry (title/desc/Article schema) AND the hub page's ItemList -- is BUILT
// from it below. An edge function is its own bundle and cannot import from
// index.html, so a new article still needs an entry HERE as well as its
// matching entry in JOURNAL_ARTICLES in index.html. But that is now the
// ONLY other place it needs touching: no more hand-typed schema block, no
// hub-listing edit, no second title/description to keep in sync by hand.
//
// Both title and description are trimmed to Google's real display budget
// (~60 chars for a title, ~155-160 for a description) before they are
// written here -- a longer one gets truncated mid-sentence in the result.
//
// ⚠️ `id` (added 2026-08-28, the route-rendering fix) MUST match this
// article's screen id in index.html's OWN JOURNAL_ARTICLES exactly -- it's
// what trimScreens() below keeps when serving this article's raw HTML. A
// third place a new article's identity has to be typed by hand, for the
// same reason the slug already is: this file cannot import from index.html.
//
// ⚠️ `faq` (added 2026-08-28, the route-rendering fix -- Cowork's own brief
// called this "the single highest-value item" in the whole audit): every
// H2 in the article whose text genuinely ends in "?" -- a real question --
// paired verbatim with the paragraph text that follows it, up to the next
// H2. EXTRACTED PROGRAMMATICALLY off the real article markup in index.html,
// never hand-typed or paraphrased, the same discipline as the FAQ page's own
// schema above (see its own comment). Of this article's 8 headings, 4 are
// genuine questions; the other 4 (an intro heading combining a question with
// a directive, and three narrative/concluding headings with no "?") are
// deliberately excluded -- Google's FAQPage guidelines require the marked-up
// content to actually be question-and-answer content, and marking up a
// heading that only sounds vaguely like a question risks the rich result
// being disabled, or worse on a pattern of misuse.
// ⚠️ IF THE ARTICLE'S QUESTIONS EVER CHANGE: regenerate this array the same
// way (walk the real H2/paragraph pairs, keep only headings ending in "?"),
// never hand-edit it out of sync with what a reader actually sees.
const ARTICLES = [
  {
    slug: 'how-to-find-your-personal-style',
    id: 's-journal',
    title: 'How to Find Your Personal Style',
    description: 'How to find your personal style, from a personal stylist of 20+ years.',
    metaTitle: 'How to Find Your Personal Style | Style Star',
    metaDesc: 'How to find your personal style, from a personal stylist of 20+ years. Start with the outfit you already love, then take the free Style Star quiz.',
    datePublished: '2026-08-26',
    dateModified: '2026-08-26',
    faq: [
      { q: 'How Do I Stop Buying Things Just Because Everyone Else Has Them?', a: 'We are surrounded by fashion. We see what our friends are wearing. We see certain brands everywhere. We scroll past countless outfits, ads, influencers, and lists telling us what is in style and what we absolutely must have. After seeing something enough times, it is easy to start thinking we love it. So I think one of the most valuable questions you can ask yourself when you are shopping is: “Do I really love this for me?” Would I be drawn to this if I had not seen everyone else wearing it? Does it feel like me when I put it on? There is nothing wrong with loving trends. Fashion should be fun, and seeing what is new is part of the fun. But being stylish does not require becoming a copy of someone else. The goal is to take inspiration from what is happening in fashion and filter it through your own personal style.' },
      { q: 'Does My Personal Style Have to Match My Everyday Life?', a: 'Personal style is not just about what you find beautiful. It also needs to work for the life you actually live. We all need clothes for ordinary days, pieces that are comfortable, appropriate, and easy to wear while still making us feel good. But I also believe in having a well-rounded, fully functioning wardrobe. Life happens. There are lunches, dinners, meetings, celebrations, services, vacations, and unexpected invitations. Your wardrobe should support you through all of it. That does not mean you need an enormous amount of clothing. It means you need the right clothing. I want women to be able to open their closets when an invitation arrives and feel a sense of possibility instead of panic. A wardrobe works best when it reflects both who you are and where your life actually takes you.' },
      { q: 'How Do I Update My Style Without Losing Myself?', a: 'This is one of my favorite principles of personal styling: going one notch. When I look at an outfit, I can often see one small change that would make the entire look feel fresher. Maybe it is changing the shoe to something just as comfortable but a little more current. Maybe it is updating the shape of your jeans. Maybe it is adding a sleek bag, trying trousers instead of shorts, wearing a monochromatic color combination, or introducing a beautiful new color. Sometimes all an outfit needs is one piece of jewelry, or what I call the third piece, a jacket, scarf, or statement necklace that takes a simple outfit and makes it feel finished. You do not need to dress like someone you are not in order to be more stylish. In fact, I think the opposite is true. The best style evolution happens when you still feel completely like yourself, just a little more current, polished, and confident.' },
      { q: 'Do I Have to Pick One Style “Type”?', a: 'I have never believed that every woman can be neatly placed into one style category, classic, trendy, romantic, edgy, minimal, glamorous. Real personal style is much more nuanced than that. I think of style almost like a fingerprint. No two of us are exactly alike. We each land at different places along a continuum of preferences. You might lean classic but still enjoy something modern. You might love an easy, relaxed silhouette but prefer a very polished handbag. You might dress mostly in neutrals but adore one unexpected burst of color. It is the combination that makes your style yours, a melody of preferences. That melody can shift. Your style may look slightly different on vacation than it does at home. It can evolve as your lifestyle changes or as fashion changes over time. But underneath those shifts, there is usually a range where you consistently feel most like yourself. Finding that range gives you clarity.' },
    ],
  },
];

// Article schema: tells Google who wrote this and when, the same authorship
// signal Google's own E-E-A-T guidance looks for. Lives here, one article at
// a time, rather than in index.html -- index.html is shared by every screen,
// so a schema block written there would claim to describe the WHOLE app,
// not this one page.
function articleSchema(a) {
  const path = '/journal/' + a.slug;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    // jobTitle confirmed accurate by her directly (2026-08-28) -- matches
    // her own My Story opening line and this file's own /story description.
    author: { '@type': 'Person', name: 'Catherine Ellspermann', jobTitle: 'Personal Stylist & Certified Image Consultant', url: 'https://stylestar.app/story' },
    publisher: { '@type': 'Organization', name: 'Style Star', url: 'https://stylestar.app' },
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://stylestar.app' + path },
  };
}

// FAQPage schema for an article's genuine questions (see the long comment
// above ARTICLES). Returns null when an article carries no `faq` entries,
// so a future article without any real questions in it simply gets the
// Article schema alone -- never an empty, meaningless FAQPage block.
function articleFaqSchema(a) {
  if (!a.faq || !a.faq.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: a.faq.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

for (const a of ARTICLES) {
  const faqSchema = articleFaqSchema(a);
  PAGES['/journal/' + a.slug] = {
    title: a.metaTitle,
    desc: a.metaDesc,
    schema: faqSchema ? [articleSchema(a), faqSchema] : articleSchema(a),
    scrId: a.id,
  };
}

// The hub, /journal: lists every article, so it carries a real ItemList --
// another thing Google can pull straight into a search result, and the one
// entry a brand-new article should never be left out of.
PAGES['/journal'] = {
  title: 'Style Journal | Style Star',
  desc: 'Style notes and articles from Catherine, personal stylist and founder of Style Star.',
  scrId: 's-journal-hub',
  schema: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Style Journal',
    url: 'https://stylestar.app/journal',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: ARTICLES.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: 'https://stylestar.app/journal/' + a.slug,
        name: a.title,
      })),
    },
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
  if (page.schema) {
    html = html.replace('</head>',
      '<script type="application/ld+json">' + JSON.stringify(page.schema) + '</script></head>');
  }
  // The body trim (see the long comment above trimScreens): never allowed to
  // take the page down. A failure here still ships everything above --
  // correct title, description, canonical, schema -- just with the body every
  // route has always served, exactly today's behavior. Logged so a real
  // failure is never silent.
  if (page.scrId) {
    try {
      html = trimScreens(html, [page.scrId]);
    } catch (e) {
      try { console.error('[page-titles] body trim failed for', path, e); } catch (e2) {}
    }
  }

  // Rebuild the headers rather than reusing them: the body length changed, so a
  // carried-over content-length would be wrong.
  const headers = new Headers(res.headers);
  headers.delete('content-length');
  return new Response(html, { status: res.status, headers });
};
