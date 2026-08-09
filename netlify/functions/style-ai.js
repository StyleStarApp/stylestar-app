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
function estimateCostUsd(nonImageChars, imageChars, maxTokens, isSearch) {
  const inputTokens = nonImageChars / 4 + imageChars / 1500;
  return inputTokens * 3 / 1e6 + maxTokens * 15 / 1e6 + (isSearch ? SEARCH_MAX_USES * 0.01 : 0);
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
// tool config, max_uses, and the domains. A forged request can therefore spend
// at most SEARCH_MAX_USES searches per call, only inside Cath's own stores,
// inside the same origin + rate-limit + daily-budget gates as every call.
const SEARCH_MAX_USES = 3;

// ⚠️ KEEP IN SYNC WITH `STORES` IN index.html. One hostname per store (the
// hostname of each store's `u` search URL, minus a leading "www."). When Cath
// adds or renames a store in index.html, add/fix its hostname here too, or the
// stylist's search simply won't see inside that store (nothing breaks, links
// still work — search just can't look there). Generated from the real table
// 2026-07-31; 101 stores (Saks Off 5th removed 2026-08-03 — they closed their online store).
const SEARCH_DOMAINS = [
  'abercrombie.com', 'aliceandolivia.com', 'allsaints.com', 'aloyoga.com',
  'altardstate.com', 'amazon.com', 'anntaylor.com', 'anthropologie.com',
  'aritzia.com', 'athleta.gap.com', 'balticborn.com', 'bananarepublic.gap.com',
  'bananarepublicfactory.gapfactory.com', 'belk.com', 'bergdorfgoodman.com', 'bloomingdales.com',
  'chicos.com', 'coach.com', 'cos.com', 'cuyana.com',
  'dillards.com', 'dsw.com', 'eileenfisher.com', 'eloquii.com',
  'everlane.com', 'everythingbutwater.com', 'express.com', 'fahertybrand.com',
  'farmrio.com', 'frankandeileen.com', 'freepeople.com', 'gap.com',
  'garnethill.com', 'goodamerican.com', 'gorjana.com', 'gucci.com',
  'izod.com', 'jcrew.com', 'jennikayne.com', 'jjill.com',
  'jmclaughlin.com', 'johnnywas.com', 'katespade.com', 'kendrascott.com',
  'lacoste.com', 'landsend.com', 'lanebryant.com', 'levi.com',
  'loft.com', 'loveshackfancy.com', 'macys.com', 'madewell.com',
  'marinelayer.com', 'mejuri.com', 'mmlafleur.com', 'naturalizer.com',
  'neimanmarcus.com', 'net-a-porter.com', 'nordstrom.com', 'nordstromrack.com',
  'nydj.com', 'oldnavy.gap.com', 'petitestudionyc.com', 'quay.com',
  'quince.com', 'rag-bone.com', 'railsclothing.com', 'revolve.com',
  'saksfifthavenue.com', 'samedelman.com', 'sezane.com',
  'shop.lululemon.com', 'shop.mango.com', 'shopbop.com', 'skims.com',
  'softsurroundings.com', 'soma.com', 'spanx.com', 'summersalt.com',
  'sunglasshut.com', 'talbots.com', 'target.com', 'theory.com',
  'thereformation.com', 'tiffany.com', 'tjmaxx.tjx.com', 'tnuck.com',
  'tommybahama.com', 'torrid.com', 'toryburch.com', 'uniqlo.com',
  'universalstandard.com', 'us.boden.com', 'veronicabeard.com', 'vince.com',
  'vuoriclothing.com', 'warbyparker.com', 'whitehouseblackmarket.com', 'www2.hm.com',
  'zappos.com', 'zara.com',
];

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
    if (overDailyBudget(estimateCostUsd(nonImageChars, sized.imageChars, maxTokens, isSearch))) {
      console.error('style-ai: daily spend cap reached (' + dailyCapUsd() + ' USD), refusing until tomorrow (UTC)');
      return new Response(JSON.stringify({ error: 'Daily budget reached, please try again tomorrow' }), { status: 429, headers });
    }

    const payload = {
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      messages: body.messages
    };
    const callAnthropic = () => fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    // Note: client-sent search_domains (the pre-2026-07-31 protocol) is ignored;
    // the allowlist is SEARCH_DOMAINS above, minus stores already known blocked.
    const searchable = isSearch ? SEARCH_DOMAINS.filter(d => !BLOCKED_DOMAINS.has(d)) : [];
    if (isSearch && searchable.length) {
      // ⚠️ The BASIC search variant, deliberately. The newer _20260209 variant
      // runs code-execution rounds to filter results, and a live run spent 60+
      // seconds in that machinery without ever writing a word, hitting the
      // platform's ~60s stream cut. Basic search goes query → results → answer.
      payload.tools = [{
        type: 'web_search_20250305',
        name: 'web_search',
        max_uses: SEARCH_MAX_USES,
        allowed_domains: searchable
      }];
      // Streaming does two jobs: a searching answer can run well past the
      // platform's synchronous function time limit, and the page can show
      // "checking your stores" the moment a search actually starts.
      payload.stream = true;

      // ⚠️ A store can block Anthropic's crawler (Gucci does, found LIVE on
      // 2026-07-30), and ONE blocked domain in allowed_domains fails the WHOLE
      // request with "The following domains are not accessible to our user
      // agent: [...]". Which stores block is their choice and can change any
      // day, so it cannot be a hardcoded list: parse the error, prune the
      // blocked domains, memo them so the next turn skips the failed round
      // trip, and retry. Search simply doesn't see inside those stores; every
      // other store keeps working.
      for (let attempt = 0; ; attempt++) {
        const anthropicRes = await callAnthropic();
        if (anthropicRes.ok && anthropicRes.body) {
          return new Response(anthropicRes.body, {
            status: 200,
            headers: { ...headers, 'Content-Type': 'text/event-stream' }
          });
        }
        // An API error is plain JSON. Either prune-and-retry, or hand it back
        // as JSON so the page's non-stream path shows its friendly error.
        // Logged either way so search failures show up in the Netlify function
        // logs instead of dissolving into the page's generic error bubble.
        const err = await anthropicRes.json().catch((e) => {
          console.error('style-ai search: unparseable error body from API (status ' + anthropicRes.status + ')', e && e.message);
          return {};
        });
        const msg = (err && err.error && err.error.message) || '';
        const listMatch = msg.match(/not accessible[^\[]*\[([^\]]*)\]/);
        if (!listMatch || attempt >= 2) {
          console.error('style-ai search: upstream error, returning to page as JSON (status ' + anthropicRes.status + ')', msg || '(no message)');
          return new Response(JSON.stringify(err), { status: 200, headers });
        }
        const blocked = listMatch[1].split(',')
          .map(s => s.trim().replace(/^["']|["']$/g, '').toLowerCase());
        blocked.forEach(d => { if (d) BLOCKED_DOMAINS.add(d); });
        const pruned = payload.tools[0].allowed_domains.filter(d => !blocked.includes(d));
        // No progress (nothing recognised, or nothing left) → give up honestly.
        if (!pruned.length || pruned.length === payload.tools[0].allowed_domains.length) {
          console.error('style-ai search: blocked-domain prune made no progress, returning error', msg);
          return new Response(JSON.stringify(err), { status: 200, headers });
        }
        payload.tools[0].allowed_domains = pruned;
      }
    }

    const anthropicRes = await callAnthropic();
    const data = await anthropicRes.json();

    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to process request' }), { status: 500, headers });
  }
};
