// Shared pieces for the functions that talk to Amazon's Creators API
// (amazon-search.js). OAuth2 client_credentials, NOT the old PA-API SigV4.
// ⚠️ amazon-images.js still carries its own copy of these; fold it onto this
//   file the next time it is touched, so there is one copy.

export const PARTNER_TAG = process.env.AMAZON_PARTNER_TAG || 'stylestar01-20';
const TOKEN_URL = 'https://api.amazon.com/auth/o2/token';
const ALLOWED_HOSTS = ['stylestar.app', 'www.stylestar.app'];

function hostOf(value) {
  if (!value) return '';
  try { return new URL(value).host.toLowerCase(); } catch (e) { return ''; }
}

// Same speed bump as the other functions, deliberately identical.
export function isAllowed(req) {
  const requestHost = (req.headers.get('host') || '').toLowerCase();
  const allowed = new Set(ALLOWED_HOSTS);
  if (/(^|\.)netlify\.app$/.test(requestHost)) allowed.add(requestHost);
  const originHost = hostOf(req.headers.get('origin'));
  const refererHost = hostOf(req.headers.get('referer'));
  if (!originHost && !refererHost) return false;
  return allowed.has(originHost) || allowed.has(refererHost);
}

const RATE_MAX = 30, RATE_WINDOW_MS = 60 * 1000, rateHits = new Map();
export function rateLimited(req) {
  const ip = req.headers.get('x-nf-client-connection-ip') ||
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const hits = (rateHits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  hits.push(now); rateHits.set(ip, hits);
  if (rateHits.size > 5000) rateHits.clear();
  return hits.length > RATE_MAX;
}

let tokenCache = { value: '', expires: 0 };
export async function getToken(id, secret) {
  if (tokenCache.value && Date.now() < tokenCache.expires) return tokenCache.value;
  const r = await fetch(TOKEN_URL, { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', client_id: id, client_secret: secret,
      scope: 'creatorsapi::default' }) });
  if (!r.ok) throw new Error('token ' + r.status);
  const j = await r.json();
  if (!j.access_token) throw new Error('token missing');
  const life = Math.max(60, (Number(j.expires_in) || 3600) - 120) * 1000;
  tokenCache = { value: j.access_token, expires: Date.now() + life };
  return tokenCache.value;
}
