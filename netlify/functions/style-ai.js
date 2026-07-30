// Hosts allowed to use this function. The request's own host is allowed too
// when it is a *.netlify.app one, so deploy previews keep working.
const ALLOWED_HOSTS = ['stylestar.app', 'www.stylestar.app'];

// Hard ceiling on response size so no single request can be made expensive.
// Most calls ask for 500-800. The exception is "Shop my whole wishlist", which
// returns one pick per wishlist item (up to 16) and so needs real room; the
// ceiling has to clear that or the JSON truncates mid-object and the page shows
// "Couldn't load options right now". Still a hard bound on abuse.
const MAX_TOKENS_CAP = 1536;

// --- Web search (stylist chat only) ------------------------------------------
// The chat can look at real inventory instead of guessing. The client sends
// search:true plus the domain list built from its own STORES table, so there is
// ONE source of truth for which stores exist and nothing server-side to drift
// when Cath adds or renames a store. The server stays the authority on the
// CAPS: the tool config is built HERE, max_uses is fixed HERE, and the list is
// only accepted as plain hostnames. Client-supplied `tools` are never
// forwarded. A forged request can therefore spend at most SEARCH_MAX_USES
// searches per call, inside the same origin + rate-limit gates as every call.
const SEARCH_MAX_USES = 5;
const DOMAIN_RE = /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i;
function searchDomains(body) {
  if (body.search !== true) return null;
  const list = body.search_domains;
  if (!Array.isArray(list) || list.length === 0 || list.length > 150) return { error: true };
  const out = new Set();
  for (const d of list) {
    if (typeof d !== 'string' || d.length > 80 || !DOMAIN_RE.test(d)) return { error: true };
    out.add(d.toLowerCase());
  }
  return { domains: [...out] };
}

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
    const body = await req.json();

    // Basic shape guard: messages must be a non-empty, sensibly sized array.
    if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 40) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers });
    }

    const maxTokens = Math.min(parseInt(body.max_tokens, 10) || 500, MAX_TOKENS_CAP);

    const search = searchDomains(body);
    if (search && search.error) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers });
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

    if (search) {
      payload.tools = [{
        type: 'web_search_20260209',
        name: 'web_search',
        max_uses: SEARCH_MAX_USES,
        allowed_domains: search.domains
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
      // blocked domains, and retry. Search simply doesn't see inside those
      // stores; every other store keeps working.
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
        const err = await anthropicRes.json().catch(() => ({}));
        const msg = (err && err.error && err.error.message) || '';
        const listMatch = msg.match(/not accessible[^\[]*\[([^\]]*)\]/);
        if (!listMatch || attempt >= 2) {
          return new Response(JSON.stringify(err), { status: 200, headers });
        }
        const blocked = listMatch[1].split(',')
          .map(s => s.trim().replace(/^["']|["']$/g, '').toLowerCase());
        const pruned = payload.tools[0].allowed_domains.filter(d => !blocked.includes(d));
        // No progress (nothing recognised, or nothing left) → give up honestly.
        if (!pruned.length || pruned.length === payload.tools[0].allowed_domains.length) {
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
