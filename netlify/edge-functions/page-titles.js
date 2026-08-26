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
    // Both trimmed to fit Google's real display budget (~60 chars for a
    // title, ~155-160 for a description) -- the first versions were 72 and
    // 178 chars and would have been truncated mid-sentence in the result.
    title: 'How to Find Your Personal Style | Style Star',
    desc: 'How to find your personal style, from a personal stylist of 20+ years. Start with the outfit you already love, then take the free Style Star quiz.',
    // Article schema (2026-08-26): tells Google who wrote this and when, the
    // same authorship signal Google's own E-E-A-T guidance looks for. Kept as
    // a per-page field here, injected below, rather than in index.html --
    // index.html is shared by every screen, so an Article schema block
    // written there would claim to describe the WHOLE app, not this one page.
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'How to Find Your Personal Style',
      description: 'How to find your personal style, from a personal stylist of 20+ years.',
      author: { '@type': 'Person', name: 'Catherine Ellspermann', jobTitle: 'Personal Stylist', url: 'https://stylestar.app/story' },
      publisher: { '@type': 'Organization', name: 'Style Star', url: 'https://stylestar.app' },
      datePublished: '2026-08-26',
      dateModified: '2026-08-26',
      mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://stylestar.app/journal/how-to-find-your-personal-style' },
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

  // Rebuild the headers rather than reusing them: the body length changed, so a
  // carried-over content-length would be wrong.
  const headers = new Headers(res.headers);
  headers.delete('content-length');
  return new Response(html, { status: res.status, headers });
};
