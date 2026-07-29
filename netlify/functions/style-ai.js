// Hosts allowed to use this function. The request's own host is always allowed
// too, so Netlify deploy previews (random-name.netlify.app) keep working.
const ALLOWED_HOSTS = ['stylestar.app', 'www.stylestar.app'];

// Hard ceiling on response size so no single request can be made expensive.
// Most calls ask for 500-800. The exception is "Shop my whole wishlist", which
// returns one pick per wishlist item (up to 16) and so needs real room; the
// ceiling has to clear that or the JSON truncates mid-object and the page shows
// "Couldn't load options right now". Still a hard bound on abuse.
const MAX_TOKENS_CAP = 1536;

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
  const allowed = new Set([...ALLOWED_HOSTS, requestHost].filter(Boolean));
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

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens,
        messages: body.messages
      })
    });

    const data = await anthropicRes.json();

    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to process request' }), { status: 500, headers });
  }
};
