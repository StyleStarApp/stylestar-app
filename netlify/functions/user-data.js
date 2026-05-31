const { getStore } = require("@netlify/blobs");

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
    const store = getStore("users");

    if (event.httpMethod === 'POST') {
      const { email, data } = JSON.parse(event.body);
      if (!email || !data) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and data required' }) };
      }
      const key = email.toLowerCase().trim();
      const saveData = {
        ...data,
        email: key,
        updatedAt: new Date().toISOString()
      };
      await store.setJSON(key, saveData);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    if (event.httpMethod === 'GET') {
      const email = event.queryStringParameters?.email;
      if (!email) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email required' }) };
      }
      const key = email.toLowerCase().trim();
      try {
        const data = await store.get(key, { type: 'json' });
        if (data) {
          return { statusCode: 200, headers, body: JSON.stringify({ success: true, data }) };
        } else {
          return { statusCode: 404, headers, body: JSON.stringify({ success: false, message: 'No results found' }) };
        }
      } catch (e) {
        return { statusCode: 404, headers, body: JSON.stringify({ success: false, message: 'No results found' }) };
      }
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) };
  }
};
