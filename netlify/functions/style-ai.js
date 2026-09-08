import STORE_DOMAINS from './lib/store-domains.js';
// Hosts allowed to use this function. The request's own host is allowed too
// when it is a *.netlify.app one, so deploy previews keep working.
const ALLOWED_HOSTS = ['stylestar.app', 'www.stylestar.app'];

// Hard ceiling on response size so no single request can be made expensive.
// Most calls ask for 500-800. The exception is "Shop my whole wishlist", which
// returns one pick per wishlist item (up to 16) and so needs real room; the
// ceiling has to clear that or the JSON truncates mid-object and the page shows
// "Couldn't load options right now". Still a hard bound on abuse.
const MAX_TOKENS_CAP = 1536;

// --- Request size caps (2026-07-31 security pass) ----------------------------
// Bound what a forged request can make us send upstream. The numbers are sized
// against the app's own REAL traffic, measured, not guessed:
//   • the chat system prompt is ~13-21 KB of text (rules + the 102-store list +
//     her profile + her wardrobe list), so the per-text cap is 32 KB, NOT the
//     "8 KB per message" a smaller app could use — 8 KB would break the chat.
//   • photos upload as base64 JPEG at up to 1600px (~0.5-1.5 MB of base64), so
//     images get their OWN generous cap and are excluded from the text budget —
//     a 100 KB total-body cap would break Analyze an Outfit outright.
// The text budget (everything except image data) is capped at 100 KB total;
// real requests measure under ~30 KB.
const MAX_BODY_CHARS = 3500000;      // absolute ceiling on the raw body
const MAX_NONIMAGE_CHARS = 100 * 1024; // body minus base64 image data
const MAX_TEXT_CHARS = 32 * 1024;    // any single text content / block
const MAX_IMAGE_CHARS = 2500000;     // any single base64 image block
const MAX_IMAGES = 3;                // the app never sends more than 1
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Validate the messages array shape and measure it. Returns
// { imageChars } on success or { error: true } on any malformed message.
function checkMessages(messages) {
  let imageChars = 0, images = 0;
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) return { error: true };
    if (typeof m.content === 'string') {
      if (m.content.length > MAX_TEXT_CHARS) return { error: true };
    } else if (Array.isArray(m.content)) {
      for (const b of m.content) {
        if (!b || typeof b !== 'object') return { error: true };
        if (b.type === 'text') {
          if (typeof b.text !== 'string' || b.text.length > MAX_TEXT_CHARS) return { error: true };
        } else if (b.type === 'image') {
          const s = b.source || {};
          if (s.type !== 'base64' || !IMAGE_TYPES.includes(s.media_type)) return { error: true };
          if (typeof s.data !== 'string' || s.data.length > MAX_IMAGE_CHARS) return { error: true };
          images++;
          if (images > MAX_IMAGES) return { error: true };
          imageChars += s.data.length;
        } else {
          return { error: true };
        }
      }
    } else {
      return { error: true };
    }
  }
  return { imageChars };
}

// --- Rough global daily spend cap (2026-07-31) -------------------------------
// A polite circuit breaker on the whole function: estimate each request's cost
// before calling Anthropic and refuse once the day's estimate passes the cap.
// Set DAILY_SPEND_CAP_USD in Netlify env to change it (default $20/day).
// In-memory and per-instance, like the rate limiter: it resets on a cold start
// and each warm instance counts its own traffic, so it is a rough brake against
// runaway abuse, not an accounting system. Estimates deliberately round UP
// (max_tokens counted as if fully used).
const DAILY_CAP_DEFAULT_USD = 20;
let _spendDay = '', _spendUsd = 0;
function dailyCapUsd() {
  const v = parseFloat(process.env.DAILY_SPEND_CAP_USD);
  return (isFinite(v) && v > 0) ? v : DAILY_CAP_DEFAULT_USD;
}
// claude-sonnet pricing: ~$3/M input tokens, ~$15/M output, $10/1000 searches.
function estimateCostUsd(nonImageChars, imageChars, maxTokens) {
  const inputTokens = nonImageChars / 4 + imageChars / 1500;
  // ⚠️ The per-search surcharge went with the web search tool (2026-09-09).
  // A chat turn is now plain tokens, so a shopping answer costs LESS than it
  // did, not more, and the daily circuit breaker goes further.
  return inputTokens * 3 / 1e6 + maxTokens * 15 / 1e6;
}
function overDailyBudget(costUsd) {
  const day = new Date().toISOString().slice(0, 10);
  if (day !== _spendDay) { _spendDay = day; _spendUsd = 0; }
  if (_spendUsd + costUsd > dailyCapUsd()) return true;
  _spendUsd += costUsd;
  return false;
}

// --- Web search (stylist chat only) ------------------------------------------
// The chat can look at real inventory instead of guessing. The allowlist lives
// HERE, server-side, and any client-sent search_domains is ignored entirely
// (until 2026-07-31 the client sent the list, which let a forged request search
// ANY domain on Cath's key). The server is the authority on everything: the
// tool config, max_uses, and the domains.
// ▶ 2026-09-09: SEARCH_MAX_USES retired with the web search tool itself. A chat
//   turn can no longer spend a search of any kind, so a forged request now costs
//   only tokens, inside the same origin + rate-limit + daily-budget gates.

// ⚠️ KEEP IN SYNC WITH `STORES` IN index.html. One hostname per store (the
// hostname of each store's `u` search URL, minus a leading "www."). When Cath
// adds or renames a store in index.html, add/fix its hostname here too, or the
// stylist's search simply won't see inside that store (nothing breaks, links
// still work — search just can't look there). Generated from the real table
// 2026-07-31; 102 stores (Saks Off 5th removed 2026-08-03 — they closed their
// online store; Fleur du Mal added 2026-08-26).
/* 🚨🚨 DERIVED, NOT HAND-MAINTAINED — CHANGED 2026-09-08 AND IT RETIRES A WHOLE
   CLASS OF BUG. This used to be a hand-typed list, and it was one of the SIX
   edits needed to add a merchant — one of the two that fail SILENTLY, because a
   shop missing from here is simply invisible to the stylist's search while
   everything on screen looks perfectly normal.
   ▶ It went stale twice in one day: COUTR had to be added by hand, and then her
     2026-09-08 roster (21 shops in, 9 out) left it 13 short. Both times the only
     thing that noticed was a derived test.
   ▶▶ NOW IT READS THE SAME GENERATED FILE THE PRODUCT FINDER USES, so the
     stylist's search and the finder's allowlist can never disagree again, and
     adding a shop is one edit fewer. `node scripts/build-store-domains.js`
     regenerates it from her table; `--check` fails if it is stale. */
const SEARCH_DOMAINS = Object.values(STORE_DOMAINS).map(s => s.host).filter(Boolean);

// Per-instance memo of domains the search API has reported as blocked (a store
// can block Anthropic's crawler — Gucci does — and ONE blocked domain fails the
// whole request). Remembering them means the failed round trip + retry happens
// once per instance, not on every single chat turn. Resets on a cold start,
// which is exactly right: which stores block is their choice and can change.
const BLOCKED_DOMAINS = new Set();

// --- Rate limiting -----------------------------------------------------------
// The origin check is a speed bump, not authentication — Origin and Referer are
// trivially set by any non-browser client — and every call here costs real money
// against the Anthropic key. In-memory and per-instance, so it resets on a cold
// start; imperfect, and still far better than nothing.
// The cap is generous: a woman shopping hard moves through several calls a
// minute, and this must never bite a real visitor.
const RATE_MAX = 30;              // requests…
const RATE_WINDOW_MS = 60 * 1000; // …per minute, per IP
const rateHits = new Map();
function clientIp(req) {
  return (req.headers.get('x-nf-client-connection-ip') ||
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown');
}
function rateLimited(req) {
  const ip = clientIp(req);
  const now = Date.now();
  const hits = (rateHits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  hits.push(now);
  rateHits.set(ip, hits);
  if (rateHits.size > 5000) {
    for (const [k, v] of rateHits) {
      if (!v.length || now - v[v.length - 1] > RATE_WINDOW_MS) rateHits.delete(k);
    }
  }
  return hits.length > RATE_MAX;
}

// Pull the hostname out of an Origin or Referer header value.
function hostOf(value) {
  if (!value) return '';
  try {
    return new URL(value).host.toLowerCase();
  } catch (e) {
    return '';
  }
}

// Allow the request only if it looks like it came from our own site.
// Real browsers send Origin and/or Referer on a same-origin request; random
// scripts hitting the URL directly do not. This blocks the "free Claude proxy"
// abuse without affecting any real visitor.
function isAllowed(req) {
  const requestHost = (req.headers.get('host') || '').toLowerCase();
  const allowed = new Set(ALLOWED_HOSTS);
  // Deploy previews get a random *.netlify.app host, so the request's own host
  // is allowed — but ONLY when it looks like one of ours. Trusting ANY
  // self-reported host (as this function did until 2026-07-29) let a
  // non-browser client set Host and Origin both to its own domain and use this
  // function as a free Claude proxy on Cath's API key. Backported from
  // user-data.js; the two checks are identical again.
  if (/(^|\.)netlify\.app$/.test(requestHost)) allowed.add(requestHost);
  const originHost = hostOf(req.headers.get('origin'));
  const refererHost = hostOf(req.headers.get('referer'));

  // If neither header is present, it's not a normal browser request → reject.
  if (!originHost && !refererHost) return false;
  return allowed.has(originHost) || allowed.has(refererHost);
}

export default async (req) => {
  // Reflect the caller's origin only if it's one of ours; otherwise lock to the
  // primary domain. (Same-origin app calls don't rely on this, but it stops
  // other sites' JavaScript from reading our responses.)
  const reqOrigin = req.headers.get('origin') || '';
  const allowOrigin = ALLOWED_HOSTS.includes(hostOf(reqOrigin)) ? reqOrigin : 'https://www.stylestar.app';

  const headers = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  // Door check: must look like it came from our own site.
  if (!isAllowed(req)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers });
  }

  if (rateLimited(req)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers });
  }

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_CHARS) {
      return new Response(JSON.stringify({ error: 'Request too large' }), { status: 413, headers });
    }
    const body = JSON.parse(raw);

    // Basic shape guard: messages must be a non-empty, sensibly sized array.
    if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 40) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers });
    }
    const sized = checkMessages(body.messages);
    if (sized.error) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers });
    }
    // Everything that isn't base64 image data must fit the text budget.
    const nonImageChars = raw.length - sized.imageChars;
    if (nonImageChars > MAX_NONIMAGE_CHARS) {
      return new Response(JSON.stringify({ error: 'Request too large' }), { status: 413, headers });
    }

    const maxTokens = Math.min(parseInt(body.max_tokens, 10) || 500, MAX_TOKENS_CAP);
    const isSearch = body.search === true;

    // The daily circuit breaker. 429 keeps it in the "come back later" family;
    // the page shows its normal friendly retry message.
    if (overDailyBudget(estimateCostUsd(nonImageChars, sized.imageChars, maxTokens))) {
      console.error('style-ai: daily spend cap reached (' + dailyCapUsd() + ' USD), refusing until tomorrow (UTC)');
      return new Response(JSON.stringify({ error: 'Daily budget reached, please try again tomorrow' }), { status: 429, headers });
    }

    const payload = {
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      messages: body.messages
    };
    // ▶ PROMPT CACHING (2026-08-15). Launch readiness, not a saving today: at
    // current traffic the 5-minute window expires between visitors and this
    // does nothing. It starts paying the moment two turns land close together.
    //
    // ⚠️ THE HANDOFF SAID "cache the static system-prompt block" AND THERE IS
    // NO SYSTEM BLOCK TO CACHE. This function never sends a `system` field --
    // index.html builds one big prompt string and posts it as messages[0].
    // So the breakpoint has to go on a MESSAGE, which is what top-level
    // cache_control does: the API places it on the last cacheable block.
    //
    // ⚠️ AND IT IS GATED TO MULTI-TURN ON PURPOSE. A cache WRITE costs 1.25x
    // the normal input price and only pays back on a later READ (~0.1x), so
    // it breaks even at two requests sharing a prefix. Every single-message
    // call here is a one-shot generation whose prompt carries that woman's own
    // preferences -- no second request ever shares its prefix, so caching one
    // would be a guaranteed 25% surcharge for nothing. Only the stylist chat
    // resends a growing history, and only from its second turn on.
    //
    // ⚠️ THE PRUNING BELOW FIGHTS THIS, KNOWINGLY. Prompt caching is a PREFIX
    // match and `tools` renders before `messages`, so the first time a store
    // turns out to block the crawler, allowed_domains shrinks and the whole
    // cached prefix is invalidated once. It re-warms on the next turn and the
    // memo is per-instance, so this is a small one-off cost, not a leak --
    // but it is why cache hits will look ragged rather than perfect.
    //
    // Sonnet 4.6's minimum cacheable prefix is 1024 tokens; the chat prompt
    // runs 13-21 KB (~3.5-5.5K tokens), comfortably above it. Below that
    // minimum the API silently does not cache -- no error, just no saving.
    // To confirm it is working, read usage.cache_read_input_tokens on a
    // second chat turn; a zero there across repeated turns means something in
    // the prefix is changing between requests.
    if (Array.isArray(body.messages) && body.messages.length > 1) {
      payload.cache_control = { type: 'ephemeral' };
    }
    const callAnthropic = () => fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    // ═══ THE STREAMING CHAT TURN ═════════════════════════════════════════
    // 🚨🚨 THE STYLIST'S OWN WEB SEARCH WAS REMOVED HERE, 2026-09-09, AND ONE
    // REMOVAL FIXED FOUR SEPARATE FAULTS CATH FOUND ON HER PHONE.
    // What it used to do: attach a web_search tool with max_uses 3, restricted
    // to SEARCH_DOMAINS, so the stylist could look products up herself and type
    // their names, prices and links straight into her prose.
    // ▶▶ WHY IT HAD TO GO, and both halves were MEASURED, not reasoned about:
    //   (a) IT INVENTED PRODUCTS. Asked "Did you find anything??" it said "the
    //       search didn't come back with direct links I can share" and then
    //       wrote four dresses and four prices from memory — DVF ~$398,
    //       Anthropologie ~$168, FARM Rio ~$248, Reformation ~$278 — plus jeans
    //       "in size 26" at three shops. Nothing found, no price real. The
    //       prompt forbade this IN CAPITALS and the model did it anyway, which
    //       is the Stitch Fix box happening inside the app built to prevent it.
    //   (b) IT BROKE THE CHAT. A search writes NOTHING to the stream while it
    //       runs, so up to three of them ran in silence, the page's 30s stall
    //       guard fired, and the answer fell through to the retry path — which
    //       is how the raw <<FIND>> marker reached her screen and why she saw
    //       NO PRODUCT CARDS AT ALL. The finder was healthy throughout: run
    //       directly, her two real requests returned Old Navy $9.99 / H&M $7.49
    //       and Old Navy $19.99 / Belk $59.97.
    // ▶ PRODUCTS NOW COME FROM EXACTLY ONE PLACE: the <<FIND>> marker and
    //   product-find.js, which opens the shop's own page and verifies against
    //   it. One picker, not two. "The service finds. Style Star chooses."
    // ⚠️ STREAMING IS KEPT AND MUST STAY. It is what lets the page fire the
    //   finder the instant the marker arrives, so the search runs WHILE the
    //   reply is being written. Without it the wait becomes the sum, not the
    //   longer, of the two — about eight seconds worse on every answer.
    // ⚠️ SEARCH_DOMAINS is deliberately KEPT even though nothing arms a tool
    //   with it now. It is DERIVED from the same generated file the finder
    //   uses, so it cannot go stale, and searchtune still asserts that
    //   derivation. Do not hand-maintain it and do not re-add a search tool.
    if (isSearch) {
      payload.stream = true;
      const streamRes = await callAnthropic();
      if (streamRes.ok && streamRes.body) {
        return new Response(streamRes.body, {
          status: 200,
          headers: { ...headers, 'Content-Type': 'text/event-stream' }
        });
      }
      // An API error is plain JSON. Hand it back as JSON so the page's
      // non-stream path shows its friendly error, and log it so a chat failure
      // shows up in the Netlify logs instead of dissolving into a bubble.
      const err = await streamRes.json().catch((e) => {
        console.error('style-ai chat: unparseable error body (status ' + streamRes.status + ')', e && e.message);
        return {};
      });
      console.error('style-ai chat: upstream error, returning to page as JSON (status ' + streamRes.status + ')',
        (err && err.error && err.error.message) || '(no message)');
      return new Response(JSON.stringify(err), { status: 200, headers });
    }

    const anthropicRes = await callAnthropic();
    const data = await anthropicRes.json();

    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to process request' }), { status: 500, headers });
  }
};
