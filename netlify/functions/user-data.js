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
