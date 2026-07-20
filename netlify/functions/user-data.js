import crypto from 'crypto';

const MAILERLITE_GROUP_NAME = 'Style Star Signups';
const ML_BASE = 'https://connect.mailerlite.com/api';
let mlGroupIdCache = null;

// --- Opaque restore token ---------------------------------------------------
// The welcome email's button link carries an opaque token (never the raw
// email). The app sends it back on load; we decrypt it to the email and return
// the saved results. Encrypted with RESTORE_SECRET so only this function can
// read it. If RESTORE_SECRET is unset, tokens are simply disabled (no breakage).
function _restoreKey() {
  const s = process.env.RESTORE_SECRET;
  if (!s) return null;
  return crypto.createHash('sha256').update(String(s)).digest(); // 32 bytes
}
function makeToken(email) {
  const key = _restoreKey();
  if (!key || !email) return '';
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const enc = Buffer.concat([cipher.update(String(email), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, enc]).toString('base64url');
  } catch (e) { return ''; }
}
function readToken(token) {
  const key = _restoreKey();
  if (!key || !token) return null;
  try {
    const buf = Buffer.from(String(token), 'base64url');
    const iv = buf.subarray(0, 12), tag = buf.subarray(12, 28), enc = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  } catch (e) { return null; }
}

function mlHeaders(apiKey) {
  return {
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
}

// Look up the MailerLite group id by name (lists groups and matches; cached)
async function mlGetGroupId(apiKey) {
  if (mlGroupIdCache) return mlGroupIdCache;
  const res = await fetch(ML_BASE + '/groups?limit=100', { headers: mlHeaders(apiKey) });
  if (!res.ok) return null;
  const json = await res.json();
  const list = json.data || [];
  const wanted = MAILERLITE_GROUP_NAME.trim().toLowerCase();
  const group = list.find(g => g.name && g.name.trim().toLowerCase() === wanted);
  if (group && group.id) { mlGroupIdCache = group.id; return group.id; }
  return null;
}

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

export default async (req) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), { status: 500, headers });
  }

  const baseUrl = SUPABASE_URL + '/rest/v1/users';

  try {
    if (req.method === 'POST') {
      const { email, data } = await req.json();
      if (!email || !data) {
        return new Response(JSON.stringify({ error: 'Email and data required' }), { status: 400, headers });
      }
      const key = email.toLowerCase().trim();
      const saveData = { ...data, updatedAt: new Date().toISOString() };

      // Save to Supabase (isolated — a DB hiccup must NOT block the MailerLite signup)
      try {
        const res = await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key), {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        const existing = await res.json();

        if (existing && existing.length > 0) {
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

      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    if (req.method === 'GET') {
      const q = new URL(req.url).searchParams;
      // Look up by opaque token (from the welcome-email link) or by email.
      let email = q.get('email');
      if (!email && q.get('token')) {
        const decoded = readToken(q.get('token'));
        if (decoded) email = decoded;
      }
      if (!email) {
        return new Response(JSON.stringify({ error: 'Email or token required' }), { status: 400, headers });
      }
      const key = email.toLowerCase().trim();

      const res = await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key) + '&select=data', {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
      });
      const rows = await res.json();

      if (rows && rows.length > 0 && rows[0].data) {
        const data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
        return new Response(JSON.stringify({ success: true, data }), { status: 200, headers });
      }

      return new Response(JSON.stringify({ success: false, message: 'No results found' }), { status: 404, headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', detail: err.message }), { status: 500, headers });
  }
};
