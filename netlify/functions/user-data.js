const MAILERLITE_GROUP_NAME = 'Style Star Signups';
const ML_BASE = 'https://connect.mailerlite.com/api';
let mlGroupIdCache = null;

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
async function addToMailerLite(email, name) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) return; // not configured — skip quietly
  let subId = null;
  // 1) Create/update the subscriber (most important step)
  try {
    const body = { email: email };
    if (name) body.fields = { name: name };
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

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Database not configured' }) };
  }

  const baseUrl = SUPABASE_URL + '/rest/v1/users';

  try {
    if (event.httpMethod === 'POST') {
      const { email, data } = JSON.parse(event.body);
      if (!email || !data) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and data required' }) };
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
      // Treat the app's "You" placeholder as no name, so the email can fall back to "there".
      const rawName = (data && (data.userName || data.name)) || '';
      const mlName = String(rawName).trim().toLowerCase() === 'you' ? '' : rawName;
      try { await addToMailerLite(key, mlName); } catch (e) {}

      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    if (event.httpMethod === 'GET') {
      const email = event.queryStringParameters?.email;
      if (!email) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email required' }) };
      }
      const key = email.toLowerCase().trim();

      const res = await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key) + '&select=data', {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
      });
      const rows = await res.json();

      if (rows && rows.length > 0 && rows[0].data) {
        const data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, data }) };
      }

      return { statusCode: 404, headers, body: JSON.stringify({ success: false, message: 'No results found' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error', detail: err.message }) };
  }
};
