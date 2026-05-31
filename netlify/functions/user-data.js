exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const rawContext = process.env.NETLIFY_BLOBS_CONTEXT;
    if (!rawContext) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Storage not available' }) };
    }

    const ctx = JSON.parse(Buffer.from(rawContext, 'base64').toString());
    const storeName = 'users';

    if (event.httpMethod === 'POST') {
      const { email, data } = JSON.parse(event.body);
      if (!email || !data) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and data required' }) };
      }
      const key = encodeURIComponent(email.toLowerCase().trim());
      const saveData = { ...data, email: email.toLowerCase().trim(), updatedAt: new Date().toISOString() };

      await fetch(`${ctx.apiURL}/${ctx.siteID}/${storeName}/${key}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${ctx.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData)
      });

      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    if (event.httpMethod === 'GET') {
      const email = event.queryStringParameters?.email;
      if (!email) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email required' }) };
      }
      const key = encodeURIComponent(email.toLowerCase().trim());

      const res = await fetch(`${ctx.apiURL}/${ctx.siteID}/${storeName}/${key}`, {
        headers: { 'Authorization': `Bearer ${ctx.token}` }
      });

      if (res.ok) {
        const data = await res.json();
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, data }) };
      }

      return { statusCode: 404, headers, body: JSON.stringify({ success: false, message: 'No results found' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error', detail: err.message }) };
  }
};
