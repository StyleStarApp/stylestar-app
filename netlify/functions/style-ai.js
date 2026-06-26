const https = require('https');

// Hosts allowed to use this function. The request's own host is always allowed
// too, so Netlify deploy previews (random-name.netlify.app) keep working.
const ALLOWED_HOSTS = ['stylestar.app', 'www.stylestar.app'];

// Hard ceiling on response size so no single request can be made expensive.
// The app only ever asks for 300-500, so real usage is unaffected.
const MAX_TOKENS_CAP = 1024;

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
function isAllowed(event) {
  const h = event.headers || {};
  const requestHost = (h.host || h.Host || '').toLowerCase();
  const allowed = new Set([...ALLOWED_HOSTS, requestHost].filter(Boolean));
  const originHost = hostOf(h.origin || h.Origin);
  const refererHost = hostOf(h.referer || h.Referer);

  // If neither header is present, it's not a normal browser request → reject.
  if (!originHost && !refererHost) return false;
  return allowed.has(originHost) || allowed.has(refererHost);
}

exports.handler = async (event) => {
  // Reflect the caller's origin only if it's one of ours; otherwise lock to the
  // primary domain. (Same-origin app calls don't rely on this, but it stops
  // other sites' JavaScript from reading our responses.)
  const reqOrigin = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const allowOrigin = ALLOWED_HOSTS.includes(hostOf(reqOrigin)) ? reqOrigin : 'https://www.stylestar.app';

  const headers = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // Door check: must look like it came from our own site.
  if (!isAllowed(event)) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  try {
    const body = JSON.parse(event.body);

    // Basic shape guard: messages must be a non-empty, sensibly sized array.
    if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 40) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) };
    }

    const maxTokens = Math.min(parseInt(body.max_tokens, 10) || 500, MAX_TOKENS_CAP);

    const requestBody = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      messages: body.messages
    });

    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(requestBody)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            reject(new Error('Failed to parse API response: ' + responseData.substring(0, 200)));
          }
        });
      });

      req.on('error', (e) => reject(e));
      req.write(requestBody);
      req.end();
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Failed to process request' })
    };
  }
};
