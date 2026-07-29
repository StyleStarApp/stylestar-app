import crypto from 'crypto';

const MAILERLITE_GROUP_NAME = 'Style Star Signups';
// A SEPARATE group from the signups one, so asking for a restore link can never
// re-fire the welcome email. Cath's automation for this group is what actually
// sends the "here's your link back" email.
const MAILERLITE_RESTORE_GROUP_NAME = 'Style Star Restore Requests';
const ML_BASE = 'https://connect.mailerlite.com/api';
const mlGroupIds = new Map();

// Hosts allowed to use this function. The request's own host is always allowed
// too, so Netlify deploy previews (random-name.netlify.app) keep working.
// (Same list and same helpers as style-ai.js — deliberately kept identical.)
const ALLOWED_HOSTS = ['stylestar.app', 'www.stylestar.app'];

// A restore token is only good for 30 days. A welcome email can be forwarded,
// left in a shared inbox, or sit in an archive for years; without a clock the
// link inside it is permanent access to a woman's whole profile.
const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

// Pull the hostname out of an Origin or Referer header value.
function hostOf(value) {
  if (!value) return '';
  try {
    return new URL(value).host.toLowerCase();
  } catch (e) {
    return '';
  }
}

// Allow the request only if it looks like it came from our own site. This is a
// speed bump, not authentication — Origin and Referer are trivially set by any
// non-browser client — so it sits IN FRONT of the token checks below, never
// instead of them.
function isAllowed(req) {
  const requestHost = (req.headers.get('host') || '').toLowerCase();
  const allowed = new Set(ALLOWED_HOSTS);
  // Deploy previews get a random *.netlify.app host, so the request's own host
  // is allowed — but ONLY when it looks like one of ours. style-ai.js trusts
  // any self-reported host; this function guards personal data, so it doesn't:
  // otherwise a non-browser client could send Host and Origin both set to its
  // own domain and walk straight through.
  if (/(^|\.)netlify\.app$/.test(requestHost)) allowed.add(requestHost);
  const originHost = hostOf(req.headers.get('origin'));
  const refererHost = hostOf(req.headers.get('referer'));

  // If neither header is present, it's not a normal browser request → reject.
  if (!originHost && !refererHost) return false;
  return allowed.has(originHost) || allowed.has(refererHost);
}

// --- Rate limiting -----------------------------------------------------------
// In-memory and per-instance, so it resets on a cold start and doesn't span
// concurrent instances. Imperfect on purpose: it costs nothing and it still
// stops a single machine hammering the endpoint, which is the realistic abuse.
const RATE_MAX = 20;              // requests…
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
  // Keep the map from growing without bound on a long-lived instance.
  if (rateHits.size > 5000) {
    for (const [k, v] of rateHits) {
      if (!v.length || now - v[v.length - 1] > RATE_WINDOW_MS) rateHits.delete(k);
    }
  }
  return hits.length > RATE_MAX;
}

// --- Opaque restore token ---------------------------------------------------
// The welcome email's button link carries an opaque token (never the raw
// email). The app sends it back on load; we decrypt it to the email and return
// the saved results. Encrypted with RESTORE_SECRET so only this function can
// read it. If RESTORE_SECRET is unset, tokens are simply disabled (no breakage).
//
// The payload is JSON — {e: email, t: issued-at} — so the token can expire.
function _restoreKey() {
  const s = process.env.RESTORE_SECRET;
  if (!s) return null;
  return crypto.createHash('sha256').update(String(s)).digest(); // 32 bytes
}
function makeToken(email) {
  const key = _restoreKey();
  if (!key || !email) return '';
  try {
    const payload = JSON.stringify({ e: String(email), t: Date.now() });
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const enc = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, enc]).toString('base64url');
  } catch (e) { return ''; }
}
function readToken(token) {
  const key = _restoreKey();
  if (!key || !token) return null;
  let plain;
  try {
    const buf = Buffer.from(String(token), 'base64url');
    const iv = buf.subarray(0, 12), tag = buf.subarray(12, 28), enc = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    plain = Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  } catch (e) { return null; }

  let payload;
  try { payload = JSON.parse(plain); } catch (e) { payload = null; }

  // Legacy token: the payload is a bare email string, issued before tokens
  // carried a timestamp. Honour it so links in already-sent welcome emails
  // don't break overnight.
  // TODO (drop after ~2026-11): stop accepting legacy tokens and return null.
  if (!payload || typeof payload !== 'object' || !payload.e) {
    if (plain && plain.includes('@')) {
      console.log('user-data: accepted legacy restore token (no timestamp)');
      return plain;
    }
    return null;
  }

  if (!payload.t || (Date.now() - Number(payload.t)) > TOKEN_MAX_AGE_MS) return null;
  return String(payload.e);
}

function mlHeaders(apiKey) {
  return {
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
}

// Look up a MailerLite group id by name (lists groups and matches; cached).
// createIfMissing is used only for the restore group, so the first request
// doesn't fail just because the group hasn't been made in the UI yet.
async function mlGroupId(apiKey, name, createIfMissing) {
  if (mlGroupIds.has(name)) return mlGroupIds.get(name);
  try {
    const res = await fetch(ML_BASE + '/groups?limit=100', { headers: mlHeaders(apiKey) });
    if (res.ok) {
      const json = await res.json();
      const wanted = name.trim().toLowerCase();
      const group = (json.data || []).find(g => g.name && g.name.trim().toLowerCase() === wanted);
      if (group && group.id) { mlGroupIds.set(name, group.id); return group.id; }
    }
  } catch (e) {}
  if (!createIfMissing) return null;
  try {
    const res = await fetch(ML_BASE + '/groups', {
      method: 'POST', headers: mlHeaders(apiKey), body: JSON.stringify({ name })
    });
    if (res.ok) {
      const json = await res.json();
      const id = json && json.data && json.data.id;
      if (id) { mlGroupIds.set(name, id); return id; }
    }
  } catch (e) {}
  return null;
}
function mlGetGroupId(apiKey) { return mlGroupId(apiKey, MAILERLITE_GROUP_NAME, false); }

// Add (or update) a subscriber in MailerLite, then assign to the signups group.
// Create is done first and isolated so the group logic can never block a signup.
async function addToMailerLite(email, name, token) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) return; // not configured — skip quietly
  let subId = null;
  // 1) Create/update the subscriber (most important step)
  try {
    const body = { email: email };
    const fields = {};
    if (name) fields.name = name;
    if (token) fields.restore_token = token; // populates the welcome-email link
    if (Object.keys(fields).length) body.fields = fields;
    const res = await fetch(ML_BASE + '/subscribers', {
      method: 'POST',
      headers: mlHeaders(apiKey),
      body: JSON.stringify(body)
    });
    if (res.ok) {
      const json = await res.json();
      subId = json && json.data && json.data.id;
    }
  } catch (e) { return; }
  // 2) Best-effort: assign to the group (never let this throw out of the function)
  try {
    if (!subId) return;
    const groupId = await mlGetGroupId(apiKey);
    if (!groupId) return;
    await fetch(ML_BASE + '/subscribers/' + subId + '/groups/' + groupId, {
      method: 'POST',
      headers: mlHeaders(apiKey)
    });
  } catch (e) {}
}

// Re-issue a restore link for someone who already has an account.
//
// Writes a FRESH token onto her subscriber record (the automation's email builds
// the link from that field), then drops her into the restore group — and joining
// that group is what fires Cath's automation and sends the email.
//
// ⚠️ She is removed from the group FIRST. MailerLite fires "when a subscriber
// joins a group" on the join itself, so a woman already sitting in the group
// would ask for a link and silently get nothing. Leaving and rejoining makes
// every request a real join. The removal happens before the trigger, so it
// can't race with the send it's about to cause.
async function sendRestoreLink(email) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) return; // not configured — skip quietly
  const token = makeToken(email);
  if (!token) return;
  try {
    const res = await fetch(ML_BASE + '/subscribers', {
      method: 'POST',
      headers: mlHeaders(apiKey),
      body: JSON.stringify({ email: email, fields: { restore_token: token } })
    });
    if (!res.ok) return;
    const json = await res.json();
    const subId = json && json.data && json.data.id;
    if (!subId) return;

    const groupId = await mlGroupId(apiKey, MAILERLITE_RESTORE_GROUP_NAME, true);
    if (!groupId) return;

    const groupUrl = ML_BASE + '/subscribers/' + subId + '/groups/' + groupId;
    try { await fetch(groupUrl, { method: 'DELETE', headers: mlHeaders(apiKey) }); } catch (e) {}
    await fetch(groupUrl, { method: 'POST', headers: mlHeaders(apiKey) });
  } catch (e) {}
}

export default async (req) => {
  // Reflect the caller's origin only if it's one of ours; otherwise lock to the
  // primary domain, so another site's JavaScript can't read our responses.
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

  // Door check: must look like it came from our own site.
  if (!isAllowed(req)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers });
  }

  if (rateLimited(req)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), { status: 500, headers });
  }

  const baseUrl = SUPABASE_URL + '/rest/v1/users';

  try {
    if (req.method === 'POST') {
      const { email, data, token } = await req.json();
      if (!email || !data) {
        return new Response(JSON.stringify({ error: 'Email and data required' }), { status: 400, headers });
      }
      const key = email.toLowerCase().trim();
      const saveData = { ...data, updatedAt: new Date().toISOString() };

      // Does a record already exist for this email? A first save is open (that's
      // a brand-new user); overwriting an EXISTING profile needs proof of
      // ownership, or anyone could type a stranger's address and replace her
      // sizes, colors and portrait.
      let existingRow = null;
      try {
        const look = await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key) + '&select=data', {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        const rows = await look.json();
        if (rows && rows.length > 0) existingRow = rows[0];
      } catch (e) { existingRow = null; }

      if (existingRow) {
        const tokenEmail = token ? readToken(token) : null;
        const owns = !!tokenEmail && String(tokenEmail).toLowerCase().trim() === key;

        // A record with no portrait was never a finished profile, so a real
        // first save is allowed to take it over. That softens the case where
        // someone creates an empty record on an address that hasn't signed up.
        // TODO: this still lets a squatter park on an address. At this scale
        // that's a nuisance, not a breach — deliberately NOT solving it with
        // email verification.
        let hasPortrait = false;
        try {
          const d = typeof existingRow.data === 'string' ? JSON.parse(existingRow.data) : existingRow.data;
          hasPortrait = !!(d && d.portrait);
        } catch (e) { hasPortrait = false; }

        if (!owns && hasPortrait) {
          return new Response(JSON.stringify({
            error: 'Not authorized',
            reason: 'token_required'
          }), { status: 403, headers });
        }
      }

      // Save to Supabase (isolated — a DB hiccup must NOT block the MailerLite signup)
      try {
        if (existingRow) {
          await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key), {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': 'Bearer ' + SUPABASE_KEY,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ data: JSON.stringify(saveData) })
          });
        } else {
          await fetch(baseUrl, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': 'Bearer ' + SUPABASE_KEY,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ email: key, data: JSON.stringify(saveData) })
          });
        }
      } catch (e) {}

      // Also add the signup to the MailerLite email list (never block the save if it fails)
      // Use "there" when no real name was given (the quiz uses "You" as a placeholder),
      // so the welcome email reads "Hi there," instead of "Hi ,".
      const rawName = String((data && (data.userName || data.name)) || '').trim();
      const mlName = (!rawName || rawName.toLowerCase() === 'you') ? 'there' : rawName;
      const restoreToken = makeToken(key);
      try { await addToMailerLite(key, mlName, restoreToken); } catch (e) {}

      // Hand the token back so this device can prove ownership on later saves.
      return new Response(JSON.stringify({ success: true, token: restoreToken }), { status: 200, headers });
    }

    if (req.method === 'GET') {
      const q = new URL(req.url).searchParams;
      const tokenParam = q.get('token');
      const emailParam = q.get('email');

      if (!tokenParam && !emailParam) {
        return new Response(JSON.stringify({ error: 'Email or token required' }), { status: 400, headers });
      }

      // --- Reading by EMAIL never returns data. ---------------------------
      // An email address is not a secret, so treating it as one let anyone look
      // up any woman's name, sizes, colors and portrait. Instead we send her a
      // link to her own results.
      //
      // The response is IDENTICAL whether or not the account exists. Otherwise
      // this endpoint is still an enumeration oracle — a way to check whether a
      // given woman uses Style Star, which is its own privacy leak.
      if (!tokenParam) {
        const key = String(emailParam).toLowerCase().trim();
        try {
          const look = await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key) + '&select=email', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
          });
          const rows = await look.json();
          if (rows && rows.length > 0) await sendRestoreLink(key);
        } catch (e) {}
        return new Response(JSON.stringify({ success: true, sent: true }), { status: 200, headers });
      }

      // --- Reading by TOKEN returns her results. ---------------------------
      const decoded = readToken(tokenParam);
      if (!decoded) {
        // Tampered, truncated, or older than 30 days.
        return new Response(JSON.stringify({ error: 'Invalid or expired link' }), { status: 401, headers });
      }
      const key = String(decoded).toLowerCase().trim();

      const res = await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key) + '&select=data', {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
      });
      const rows = await res.json();

      if (rows && rows.length > 0 && rows[0].data) {
        const data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
        // A fresh token so a restored device can save again.
        return new Response(JSON.stringify({ success: true, data, token: makeToken(key) }), { status: 200, headers });
      }

      return new Response(JSON.stringify({ success: false, message: 'No results found' }), { status: 404, headers });
    }

    // --- DELETE: honour a deletion request in one call ----------------------
    // The policy promises we'll remove her information. Doing that by hand
    // across Supabase and MailerLite is the kind of promise that quietly gets
    // harder to keep, so it's a mechanism instead.
    //
    // Two ways in: her own restore token (self-service, ready for a button in
    // the app), or ADMIN_SECRET so Cath can action an emailed request without
    // touching two dashboards. Never by bare email — that would let anyone
    // delete anyone.
    if (req.method === 'DELETE') {
      const q = new URL(req.url).searchParams;
      const adminSecret = process.env.ADMIN_SECRET;
      const isAdmin = !!adminSecret && req.headers.get('x-admin-secret') === adminSecret;

      let key = '';
      if (isAdmin && q.get('email')) {
        key = String(q.get('email')).toLowerCase().trim();
      } else {
        const decoded = q.get('token') ? readToken(q.get('token')) : null;
        if (!decoded) {
          return new Response(JSON.stringify({ error: 'Invalid or expired link' }), { status: 401, headers });
        }
        key = String(decoded).toLowerCase().trim();
      }

      // 1) Remove her saved results.
      try {
        await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key), {
          method: 'DELETE',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
      } catch (e) {}

      // 2) Remove her from the email list (best effort — a MailerLite hiccup
      //    must not make the request look like it failed when the results,
      //    which are the sensitive part, are already gone).
      let mailRemoved = false;
      try {
        const apiKey = process.env.MAILERLITE_API_KEY;
        if (apiKey) {
          const look = await fetch(ML_BASE + '/subscribers/' + encodeURIComponent(key), { headers: mlHeaders(apiKey) });
          if (look.ok) {
            const json = await look.json();
            const subId = json && json.data && json.data.id;
            if (subId) {
              const del = await fetch(ML_BASE + '/subscribers/' + subId, { method: 'DELETE', headers: mlHeaders(apiKey) });
              mailRemoved = del.ok;
            }
          }
        }
      } catch (e) {}

      return new Response(JSON.stringify({ success: true, mailRemoved }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', detail: err.message }), { status: 500, headers });
  }
};
