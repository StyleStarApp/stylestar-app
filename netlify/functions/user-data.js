import crypto from 'crypto';

const MAILERLITE_GROUP_NAME = 'Style Star Signups';
// A SEPARATE group from the signups one, so asking for a restore link can never
// re-fire the welcome email. Cath's automation for this group is what actually
// sends the "here's your link back" email.
const MAILERLITE_RESTORE_GROUP_NAME = 'Style Star Restore Requests';
const ML_BASE = 'https://connect.mailerlite.com/api';
const mlGroupIds = new Map();
// Stand-in first name, used only so the greeting reads "Hi there," rather than
// "Hi ,". See nameIsSafeToWrite() — it must never replace a real name.
const NAME_PLACEHOLDER = 'there';

// Hosts allowed to use this function. The request's own host is always allowed
// too, so Netlify deploy previews (random-name.netlify.app) keep working.
// (Same list and same helpers as style-ai.js — deliberately kept identical.)
const ALLOWED_HOSTS = ['stylestar.app', 'www.stylestar.app'];

// A restore token is only good for 30 days. A welcome email can be forwarded,
// left in a shared inbox, or sit in an archive for years; without a clock the
// link inside it is permanent access to a woman's whole profile.
const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

// --- The 6-digit restore code (2026-08-08) -----------------------------------
// On iPhone, the home-screen app gets its own storage, completely separate from
// Safari — and an email link ALWAYS opens in Safari, never inside the installed
// app. So the restore email's button physically cannot restore a woman's
// results into the app. The code is the piece that can travel by hand: the
// restore email shows a 6-digit code next to the gold button, she types it into
// the app, and the exchange (GET ?email=&code=) returns her results right there.
//
// The code lives INSIDE the row's data JSON (data._restore = {c, exp, tries})
// rather than its own column, so no Supabase schema change is needed. It is
// server-owned: stripped from every response and from every client save.
//
// ⚠️ The 24-hour lifetime is NOT arbitrary: MailerLite sends the restore email
// at most once per person per 24h (platform rule), so a second request in a day
// produces NO new email. The stored code must therefore stay valid — and stay
// IDENTICAL to the one sitting in her most recent email — for that whole
// window, which is also why a still-valid code is REUSED instead of re-minted.
// A shorter expiry would strand exactly the woman who asks twice.
const CODE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
// 6 tries against a million combinations, then the code dies. Generous enough
// for fat fingers, hopeless for guessing.
const CODE_MAX_TRIES = 6;
function mintCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}
// Still usable: exists, not expired, tries left. (Plaintext in the row on
// purpose: the DB already holds everything the code protects, so hashing it
// buys nothing — while plaintext lets a repeat request re-send the SAME code
// to MailerLite, keeping the emailed code and the stored code in lockstep.)
function codeUsable(rc) {
  return !!(rc && rc.c && rc.exp && Date.now() < Number(rc.exp) &&
    Number(rc.tries || 0) < CODE_MAX_TRIES);
}
// Constant-time compare via equal-length digests (same trick as isAdminReq).
function codeMatches(given, stored) {
  const a = crypto.createHash('sha256').update(String(given)).digest();
  const b = crypto.createHash('sha256').update(String(stored)).digest();
  return crypto.timingSafeEqual(a, b);
}
// _restore and _share are the server's own bookkeeping — neither may ever ride
// along into a response body or survive inside a client-supplied save.
function stripServerFields(data) {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const copy = { ...data };
    delete copy._restore;
    delete copy._share;
    return copy;
  }
  return data;
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

// Allow the request only if it looks like it came from our own site. This is a
// speed bump, not authentication — Origin and Referer are trivially set by any
// non-browser client — so it sits IN FRONT of the token checks below, never
// instead of them.
function isAllowed(req) {
  const requestHost = (req.headers.get('host') || '').toLowerCase();
  const allowed = new Set(ALLOWED_HOSTS);
  // Deploy previews get a random *.netlify.app host, so the request's own host
  // is allowed — but ONLY when it looks like one of ours: otherwise a
  // non-browser client could send Host and Origin both set to its own domain
  // and walk straight through. (style-ai.js used to trust any self-reported
  // host; the same restriction was backported there 2026-07-29, so the two
  // checks are identical again.)
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

// --- Restore-link cooldown ----------------------------------------------------
// At most one restore email per ADDRESS per 5 minutes, however many times the
// form is submitted and from however many IPs — so nobody can flood one woman's
// inbox (and our MailerLite group churn) by hammering "Find my results" with
// her address. Independent of the per-IP limit above, in-memory like it and
// imperfect for the same acceptable reasons. MailerLite's own once-per-24h
// automation rule sits behind this as the real backstop.
const RESTORE_COOLDOWN_MS = 5 * 60 * 1000;
const restoreSentAt = new Map(); // email -> when we last triggered a send
function restoreOnCooldown(email) {
  const last = restoreSentAt.get(email);
  return !!last && (Date.now() - last) < RESTORE_COOLDOWN_MS;
}
function markRestoreSent(email) {
  restoreSentAt.set(email, Date.now());
  if (restoreSentAt.size > 5000) {
    const now = Date.now();
    for (const [k, t] of restoreSentAt) {
      if (now - t > RESTORE_COOLDOWN_MS) restoreSentAt.delete(k);
    }
  }
}

// --- Admin credential ---------------------------------------------------------
// A valid x-admin-secret is stronger proof than an Origin header (anyone can
// type an Origin into curl; only Cath knows the secret), so it also bypasses
// the origin check — that is what makes the DELETE usable from a terminal,
// where there is no Origin at all:
//
//   curl -X DELETE -H "x-admin-secret: $ADMIN_SECRET" \
//     "https://stylestar.app/.netlify/functions/user-data?email=her@example.com"
//
// With ADMIN_SECRET unset in Netlify the header is ignored entirely. Both
// sides are hashed before comparing so the comparison is constant-time
// (timingSafeEqual needs equal-length inputs, and checking the length first
// would itself leak).
function isAdminReq(req) {
  const secret = process.env.ADMIN_SECRET;
  const given = req.headers.get('x-admin-secret');
  if (!secret || !given) return false;
  const a = crypto.createHash('sha256').update(String(given)).digest();
  const b = crypto.createHash('sha256').update(String(secret)).digest();
  return crypto.timingSafeEqual(a, b);
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

  // ⚠️ A SHARE TOKEN MUST NEVER RESTORE AN ACCOUNT. A restore token unlocks a
  // woman's whole profile; a share link is handed to other people on purpose.
  // A share payload carries no issued-at, so the clock check at the bottom
  // would already refuse it — this is the explicit belt in front of the braces.
  if (payload && typeof payload === 'object' && payload.k === 's') return null;

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

// --- The share link (2026-08-21) --------------------------------------------
// Her wishlist as a page someone else can buy from — the registry she has been
// asking for since June. Two things make it safe to hand to a stranger:
//
//   1. THE TOKEN IS A DIFFERENT KIND FROM A RESTORE TOKEN, and readToken()
//      refuses it outright. If a share link were a restore token, everyone she
//      sent her wishlist to could restore her entire profile.
//   2. THE PUBLIC RESPONSE IS BUILT FIELD BY FIELD (publicList below), never by
//      stripping. An allowlist cannot leak a field somebody adds later; a
//      denylist eventually does.
//
// Revocation is by REVISION, which is what lets this ship with no schema change
// and no JSON-path query: the token carries the revision it was minted at, the
// row keeps the current one (data._share = {r, on}), and "Stop sharing" bumps
// r so every link minted before that moment stops resolving. Sharing again
// mints a NEW link, deliberately — a revoked link that can come back to life
// was never revoked.
//
// ⚠️ SHARE LINKS DO NOT EXPIRE, unlike restore tokens. A restore token has a
// 30-day clock because a forwarded email must not be permanent access to a
// profile. A registry link that quietly died a month later would just be a
// broken promise to whoever she gave it to. Revocation is the control instead.
function makeShareToken(email, rev) {
  const key = _restoreKey();
  if (!key || !email) return '';
  try {
    const payload = JSON.stringify({ k: 's', e: String(email), r: Number(rev) || 0 });
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const enc = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString('base64url');
  } catch (e) { return ''; }
}
function readShareToken(token) {
  const key = _restoreKey();
  if (!key || !token) return null;
  try {
    const buf = Buffer.from(String(token), 'base64url');
    const iv = buf.subarray(0, 12), tag = buf.subarray(12, 28), enc = buf.subarray(28);
    const d = crypto.createDecipheriv('aes-256-gcm', key, iv);
    d.setAuthTag(tag);
    const payload = JSON.parse(Buffer.concat([d.update(enc), d.final()]).toString('utf8'));
    if (!payload || payload.k !== 's' || !payload.e) return null;
    return { email: String(payload.e), rev: Number(payload.r) || 0 };
  } catch (e) { return null; }
}

// Her own words about a piece — size, colour, the occasion it is for. Capped so
// one long note can never swamp a row on the shared page.
const SHARE_NOTE_MAX = 140;
// Her one paragraph for whoever is shopping (item two). Longer than a per-item
// note because it carries her sizes, her colors and the occasion at once.
const SHARE_LIST_NOTE_MAX = 600;
function publicListNote(data) {
  const raw = (data && data.wardrobe && typeof data.wardrobe.listNote === 'string')
    ? data.wardrobe.listNote : '';
  return raw.slice(0, SHARE_LIST_NOTE_MAX);
}

// ⚠️ THE ALLOWLIST IS THE PRIVACY GUARANTEE. Build every field explicitly and
// never spread the stored entry. Her sizes, colours, never-wear list, portrait
// and quiz answers are not reachable from here at all — the only personal words
// on a shared page are the ones she typed into a note herself.
function publicList(data) {
  const src = (data && data.wardrobe && Array.isArray(data.wardrobe.wishlist))
    ? data.wardrobe.wishlist : [];
  const out = [];
  for (const it of src) {
    if (!it || !it.name) continue;
    // Only ever an http(s) link, matching the app's own _wlSafeUrl rule: a
    // stored URL comes back out of a woman's localStorage, which she can edit.
    const url = (typeof it.url === 'string' && /^https?:\/\//i.test(it.url)) ? it.url : '';
    const row = {
      name: String(it.name).slice(0, 200),
      store: String(it.store || '').slice(0, 80),
      search: String(it.search || '').slice(0, 200),
      note: String(it.note || '').slice(0, SHARE_NOTE_MAX),
      exact: !!url
    };
    if (url) { row.url = url; row.price = String(it.price || '').slice(0, 24); }
    out.push(row);
  }
  return out;
}
// Her first name heads the page. "You" is the quiz's placeholder and "there"
// is MailerLite's — neither is a name, and both must fall through to the
// no-name wording rather than greet a reader as You.
function publicName(data) {
  const raw = String((data && (data.userName || data.name)) || '').trim();
  const low = raw.toLowerCase();
  if (!raw || low === 'you' || low === NAME_PLACEHOLDER) return '';
  return raw.slice(0, 40);
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
// "there" is the placeholder we send when a woman never gave us her first name,
// so the welcome email reads "Hi there," rather than "Hi ,". It must never
// overwrite a real name she gave us on an earlier save — otherwise a save from
// a screen that doesn't know her name silently turns "Hi Sarah," into
// "Hi there," for good.
async function nameIsSafeToWrite(apiKey, email, name) {
  if (name !== NAME_PLACEHOLDER) return true; // a real name always wins
  try {
    const res = await fetch(ML_BASE + '/subscribers/' + encodeURIComponent(email), { headers: mlHeaders(apiKey) });
    if (!res.ok) return true; // no existing subscriber (or can't tell) — safe to set it
    const json = await res.json();
    const existing = json && json.data && json.data.fields && json.data.fields.name;
    const trimmed = String(existing || '').trim();
    return !trimmed || trimmed.toLowerCase() === NAME_PLACEHOLDER;
  } catch (e) {
    return true;
  }
}

async function addToMailerLite(email, name, token) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) return; // not configured — skip quietly
  let subId = null;
  // 1) Create/update the subscriber (most important step)
  try {
    const body = { email: email };
    const fields = {};
    if (name && await nameIsSafeToWrite(apiKey, email, name)) fields.name = name;
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

// ▶ WHY THESE LOGS EXIST (2026-08-09, after Cath's second "no email arrived").
// The response to the client is byte-identical in EVERY outcome below, and has
// to be: saying "no account here" would turn this endpoint back into a way to
// find out who uses Style Star (closed 2026-07-29). So the confirmation on
// screen can never be a delivery receipt, and the Netlify function log is the
// only place that can name which branch actually ran. Read it at
// app.netlify.com → Functions → user-data. The address is masked: enough to
// match against the one she typed, not a plaintext dump of anyone's email.
function maskEmail(email) {
  const parts = String(email || '').split('@');
  return (parts[0] || '').slice(0, 2) + '***@' + (parts[1] || '?');
}
function restoreLog(email, outcome) {
  console.log('[restore] ' + maskEmail(email) + ' — ' + outcome);
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
async function sendRestoreLink(email, code) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) { restoreLog(email, 'NO SEND: MAILERLITE_API_KEY is not set'); return; }
  // One email per address per 5 minutes, marked BEFORE the send so two
  // simultaneous requests can't both slip past the check.
  if (restoreOnCooldown(email)) { restoreLog(email, 'NO SEND: within the 5-minute per-address cooldown'); return; }
  markRestoreSent(email);
  const token = makeToken(email);
  if (!token) { restoreLog(email, 'NO SEND: could not mint a token (RESTORE_SECRET missing?)'); return; }
  try {
    // The code rides on the subscriber record next to the token, so the email
    // template can show it with {$restore_code}. Written on EVERY send — even
    // when the code was reused — so the field self-heals if an earlier write
    // failed.
    const fields = { restore_token: token };
    if (code) fields.restore_code = code;
    let res = await fetch(ML_BASE + '/subscribers', {
      method: 'POST',
      headers: mlHeaders(apiKey),
      body: JSON.stringify({ email: email, fields: fields })
    });
    // If MailerLite doesn't know the restore_code field yet (it must exist in
    // Subscribers → Fields before the API will accept it), retry WITHOUT the
    // code rather than letting the whole restore email die on it. The log
    // names the fix so the field-missing state can't hide.
    if (!res.ok && code && res.status >= 400 && res.status < 500) {
      restoreLog(email, 'restore_code field write refused (' + res.status + ') — create a "restore_code" text field in MailerLite (Subscribers → Fields); sending without the code');
      res = await fetch(ML_BASE + '/subscribers', {
        method: 'POST',
        headers: mlHeaders(apiKey),
        body: JSON.stringify({ email: email, fields: { restore_token: token } })
      });
    }
    if (!res.ok) { restoreLog(email, 'NO SEND: MailerLite /subscribers returned ' + res.status); return; }
    const json = await res.json();
    const subId = json && json.data && json.data.id;
    if (!subId) { restoreLog(email, 'NO SEND: MailerLite returned no subscriber id'); return; }

    const groupId = await mlGroupId(apiKey, MAILERLITE_RESTORE_GROUP_NAME, true);
    if (!groupId) { restoreLog(email, 'NO SEND: could not find or create the restore group'); return; }

    const groupUrl = ML_BASE + '/subscribers/' + subId + '/groups/' + groupId;
    try { await fetch(groupUrl, { method: 'DELETE', headers: mlHeaders(apiKey) }); } catch (e) {}
    const join = await fetch(groupUrl, { method: 'POST', headers: mlHeaders(apiKey) });
    // Past this line MailerLite owns the outcome: the join fired, so if no email
    // arrives the answer is in her Activity log (the 24h-per-person rule, or the
    // automation), not in this function.
    restoreLog(email, (join && join.ok === false)
      ? 'NO SEND: group join returned ' + join.status
      : 'GROUP JOINED — handed off to the MailerLite automation');
  } catch (e) { restoreLog(email, 'NO SEND: threw ' + (e && e.message ? e.message : e)); }
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

  // Door check: must look like it came from our own site. One exception: an
  // admin DELETE proves itself with the secret instead of an Origin header, so
  // Cath can action a deletion request from a plain terminal (see isAdminReq
  // for the exact curl command). DELETE only — the secret is a deletion
  // credential, not a master key to the rest of the API.
  const isAdmin = req.method === 'DELETE' && isAdminReq(req);
  if (!isAllowed(req) && !isAdmin) {
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
      const body = await req.json();
      const { data, token } = body;
      let { email } = body;

      // --- Turning the share link on or off --------------------------------
      // Ownership is proved with her SAVE TOKEN, the same credential that
      // authorises overwriting her profile. An email address is never enough
      // here, and it is not enough for this either.
      if (body.share === 'on' || body.share === 'off') {
        // 🚨 THE TOKEN CARRIES THE EMAIL, so the client must never be required to
        // send one. The first version demanded both and refused the request when
        // the email was missing — which is exactly what happened to the first
        // real person who tapped "Get my link" (2026-08-21): a woman who
        // restored her results from the emailed link or the 6-digit code has
        // ss_token but NO ss_email, because _applyRestoredRecord never wrote it.
        // ▶ Asking the client for an identity the credential already proves is
        //   a whole class of bug invented for nothing. Derive it instead.
        const owner = token ? readToken(token) : null;
        if (!owner) {
          return new Response(JSON.stringify({ error: 'Not authorized', reason: 'token_required' }), { status: 403, headers });
        }
        const key = String(owner).toLowerCase().trim();
        // An email sent alongside must still MATCH — no weaker than before.
        if (email && String(email).toLowerCase().trim() !== key) {
          return new Response(JSON.stringify({ error: 'Not authorized', reason: 'token_required' }), { status: 403, headers });
        }
        let rowData = null;
        try {
          const look = await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key) + '&select=data', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
          });
          const rows = await look.json();
          if (rows && rows.length > 0 && rows[0].data) {
            rowData = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
          }
        } catch (e) { rowData = null; }
        if (!rowData) {
          return new Response(JSON.stringify({ error: 'No results found' }), { status: 404, headers });
        }
        const cur = (rowData._share && typeof rowData._share === 'object') ? rowData._share : {};
        // Turning it OFF bumps the revision, which is what kills every link
        // already out in the world. Turning it back on mints a new one.
        const next = (body.share === 'on')
          ? { r: Number(cur.r || 0), on: true }
          : { r: Number(cur.r || 0) + 1, on: false };
        rowData._share = next;
        try {
          await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key), {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY,
              'Content-Type': 'application/json', 'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ data: JSON.stringify(rowData) })
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: 'Could not save' }), { status: 500, headers });
        }
        return new Response(JSON.stringify({
          success: true,
          sharing: next.on,
          shareToken: next.on ? makeShareToken(key, next.r) : null
        }), { status: 200, headers });
      }

      // 🚨 THE SAME BUG AS THE SHARE BRANCH, AND FAR WORSE, because it failed
      // SILENTLY: syncPrefsToServer() returns early when ss_email is missing,
      // so on any device where a woman RESTORED her results — token yes,
      // ss_email no — nothing she did ever reached Supabase. Not her wishlist,
      // not her notes, not her preferences. No error, no sign, just a device
      // quietly saving nothing (found 2026-08-21 when her own shared page came
      // up empty while her phone showed a full list).
      // ▶ The token carries the address. Derive it, exactly as the share branch
      //   now does, and stop asking the client for an identity it already proved.
      if (!email && token) {
        const owner = readToken(token);
        if (owner) email = owner;
      }
      if (!email || !data) {
        return new Response(JSON.stringify({ error: 'Email and data required' }), { status: 400, headers });
      }
      const key = email.toLowerCase().trim();
      const saveData = { ...data, updatedAt: new Date().toISOString() };
      // _restore is server-owned: a client body can never plant its own code
      // (delete), and a save from another device must not wipe an outstanding
      // one (carried over from the existing row below).
      delete saveData._restore;
      delete saveData._share;

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
          // Keep any outstanding restore code alive across the save, so a save
          // from one device doesn't invalidate the code sitting in her email.
          if (d && d._restore) saveData._restore = d._restore;
          // Likewise the share state: a save from one device must not silently
          // turn off a link she has already given somebody.
          if (d && d._share) saveData._share = d._share;
        } catch (e) { hasPortrait = false; }

        if (!owns && hasPortrait) {
          return new Response(JSON.stringify({
            error: 'Not authorized',
            reason: 'token_required'
          }), { status: 403, headers });
        }
      }

      // Save to Supabase (isolated — a DB hiccup must NOT block the MailerLite signup)
      //
      // 🚨🚨 THIS BLOCK USED TO SWALLOW EVERYTHING AND STILL ANSWER success:true,
      // so a woman could be told her results were saved when they were not, come
      // back weeks later and find nothing. TWO separate holes, and the second is
      // the one that hid for months:
      //   (1) catch (e) {}  — a thrown network error vanished silently;
      //   (2) fetch RESOLVES on a 4xx/5xx. Nothing read `.ok`, so a cleanly
      //       REJECTED write (bad key, RLS refusal, schema drift) looked exactly
      //       like a successful one. The 2026-09-06 key fix stopped it being
      //       rejected that day; it never fixed the lie.
      // ▶ The outcome is recorded and reported honestly below. The MailerLite
      // signup still runs either way — that is what "isolated" was always meant
      // to mean, and it is why this does not simply return early.
      let saved = true, saveDetail = '';
      try {
        const w = existingRow
          ? await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key), {
              method: 'PATCH',
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + SUPABASE_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({ data: JSON.stringify(saveData) })
            })
          : await fetch(baseUrl, {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + SUPABASE_KEY,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({ email: key, data: JSON.stringify(saveData) })
            });
        saved = !!(w && w.ok);
        // ⚠️ The status is worth keeping (it is how a 401 key problem is told
        // apart from a 500 outage) but the BODY is not logged: it can echo the
        // row, and that is her data.
        if (!saved) saveDetail = 'supabase ' + (w && w.status);
      } catch (e) {
        saved = false;
        saveDetail = 'network';
      }

      // Also add the signup to the MailerLite email list (never block the save if it fails)
      // Use "there" when no real name was given (the quiz uses "You" as a placeholder),
      // so the welcome email reads "Hi there," instead of "Hi ,".
      const rawName = String((data && (data.userName || data.name)) || '').trim();
      const mlName = (!rawName || rawName.toLowerCase() === 'you') ? NAME_PLACEHOLDER : rawName;
      const restoreToken = makeToken(key);
      try { await addToMailerLite(key, mlName, restoreToken); } catch (e) {}

      // ▶ AN HONEST ANSWER. Her results are still safe in this phone's own
      // storage, and her email did reach MailerLite, so this is "not saved to
      // your account", never "lost" — the front end says exactly that.
      // The token still rides back so the device can simply try again: it is
      // derived from the address, so it is the same token a successful save
      // would have returned.
      if (!saved) {
        return new Response(JSON.stringify({
          success: false, saved: false, token: restoreToken, email: key,
          message: 'We could not save to your account just now.', detail: saveDetail
        }), { status: 502, headers });
      }
      // Hand the token back so this device can prove ownership on later saves.
      // The address rides back so a device that only ever had a token can
      // record which account it belongs to (see _applyRestoredRecord).
      return new Response(JSON.stringify({ success: true, saved: true, token: restoreToken, email: key }), { status: 200, headers });
    }

    if (req.method === 'GET') {
      const q = new URL(req.url).searchParams;
      const tokenParam = q.get('token');
      const emailParam = q.get('email');
      const codeParam = q.get('code');

      // --- A SHARED WISHLIST: the list, and nothing else. -------------------
      // No authentication, by design — the token IS the credential, and it is
      // unguessable. A dead, revoked or unknown token is one indistinguishable
      // 404, so the page can say the same kind thing to every one of them.
      const shareParam = q.get('share');
      if (shareParam) {
        const s = readShareToken(shareParam);
        if (!s) {
          return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers });
        }
        const key = s.email.toLowerCase().trim();
        let data = null;
        try {
          const look = await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key) + '&select=data', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
          });
          const rows = await look.json();
          if (rows && rows.length > 0 && rows[0].data) {
            data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
          }
        } catch (e) { data = null; }
        const sh = data && data._share;
        if (!sh || !sh.on || Number(sh.r || 0) !== s.rev) {
          return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers });
        }
        return new Response(JSON.stringify({
          success: true, name: publicName(data),
          listNote: publicListNote(data), list: publicList(data)
        }), { status: 200, headers });
      }

      if (!tokenParam && !emailParam) {
        return new Response(JSON.stringify({ error: 'Email or token required' }), { status: 400, headers });
      }

      // --- EMAIL + CODE exchanges the emailed 6-digit code for her results. --
      // This is what makes restore work INSIDE the installed home-screen app,
      // where the email's link physically cannot reach (it always opens in the
      // browser). The failure response is IDENTICAL for a wrong code, an
      // expired code, and an address with no account — and everything waits
      // out the same floor — so this path is no more an enumeration oracle
      // than the send path above it.
      if (!tokenParam && emailParam && codeParam) {
        const CODE_RESPONSE_FLOOR_MS = 800;
        const started = Date.now();
        const key = String(emailParam).toLowerCase().trim();
        const given = String(codeParam).replace(/\D/g, '');
        let out = null;
        try {
          const look = await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key) + '&select=data', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
          });
          const rows = await look.json();
          if (rows && rows.length > 0 && rows[0].data) {
            const data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
            const rc = data && data._restore;
            if (codeUsable(rc) && given.length === 6 && codeMatches(given, rc.c)) {
              // Single-use: the code dies the moment it works.
              delete data._restore;
              await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key), {
                method: 'PATCH',
                headers: {
                  'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY,
                  'Content-Type': 'application/json', 'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ data: JSON.stringify(data) })
              });
              restoreLog(key, 'CODE OK — results restored by code');
              out = { success: true, data: stripServerFields(data), token: makeToken(key), email: key };
            } else if (rc && rc.c) {
              // A wrong try burns one of the code's lives, even when the code
              // is already expired — cheap, and it keeps the bookkeeping dumb.
              data._restore = { ...rc, tries: Number(rc.tries || 0) + 1 };
              await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key), {
                method: 'PATCH',
                headers: {
                  'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY,
                  'Content-Type': 'application/json', 'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ data: JSON.stringify(data) })
              });
              restoreLog(key, 'CODE FAIL: ' + (!codeUsable(rc) ? 'code expired or out of tries' : 'wrong code') + ' (try ' + (Number(rc.tries || 0) + 1) + ' of ' + CODE_MAX_TRIES + ')');
            } else {
              restoreLog(key, 'CODE FAIL: no code outstanding for that address');
            }
          } else {
            restoreLog(key, 'CODE FAIL: no Supabase row for that address');
          }
        } catch (e) {
          restoreLog(key, 'CODE FAIL: threw ' + (e && e.message ? e.message : e));
        }
        const wait = CODE_RESPONSE_FLOOR_MS - (Date.now() - started);
        if (wait > 0) await new Promise(r => setTimeout(r, wait));
        if (out) return new Response(JSON.stringify(out), { status: 200, headers });
        return new Response(JSON.stringify({ success: false, message: 'That code did not match' }), { status: 401, headers });
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
        // ⚠️ Constant-time on purpose. The BODY is identical either way, but
        // the MailerLite round-trips only happen when the account exists —
        // roughly 380ms vs 60ms — which quietly answers "does she use Style
        // Star?" for anyone with a stopwatch. So both outcomes wait out the
        // same floor before responding. Deliberately NOT fire-and-forget: a
        // Netlify function can be frozen the moment its response returns, so
        // an un-awaited send would sometimes silently never happen — breaking
        // the restore email to hide a side-channel. The floor covers a normal
        // send with room to spare; only an unusually slow MailerLite call can
        // still peek past it, an accepted tail.
        const EMAIL_RESPONSE_FLOOR_MS = 1200;
        const started = Date.now();
        try {
          const look = await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key) + '&select=data', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
          });
          const rows = await look.json();
          if (rows && rows.length > 0) {
            // The cooldown is checked BEFORE minting anything: a request that
            // sends no email must not rotate the code out from under the email
            // she already has. (sendRestoreLink re-checks it as belt and braces.)
            if (restoreOnCooldown(key)) {
              restoreLog(key, 'NO SEND: within the 5-minute per-address cooldown');
            } else {
              let rowData = {};
              try { rowData = (typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data) || {}; } catch (e) { rowData = {}; }
              let code = codeUsable(rowData._restore) ? rowData._restore.c : '';
              if (!code) {
                // Mint a fresh 6-digit code and store it on her row. Reusing a
                // still-valid one (the branch above) is what keeps the stored
                // code identical to the emailed one across MailerLite's
                // one-email-per-24h window.
                code = mintCode();
                rowData._restore = { c: code, exp: Date.now() + CODE_MAX_AGE_MS, tries: 0 };
                await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key), {
                  method: 'PATCH',
                  headers: {
                    'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY,
                    'Content-Type': 'application/json', 'Prefer': 'return=minimal'
                  },
                  body: JSON.stringify({ data: JSON.stringify(rowData) })
                });
              }
              await sendRestoreLink(key, code);
            }
          }
          else restoreLog(key, 'NO SEND: no Supabase row for that address');
        } catch (e) {
          restoreLog(key, 'NO SEND: the Supabase lookup threw ' + (e && e.message ? e.message : e));
        }
        const wait = EMAIL_RESPONSE_FLOOR_MS - (Date.now() - started);
        if (wait > 0) await new Promise(r => setTimeout(r, wait));
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
        // A fresh token so a restored device can save again. (_restore stripped:
        // the outstanding code is server bookkeeping, never response payload.)
        return new Response(JSON.stringify({ success: true, data: stripServerFields(data), token: makeToken(key), email: key }), { status: 200, headers });
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
      // isAdmin was decided at the door check above (constant-time compare).

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
      //
      // 🚨🚨 THE SAME FAULT AS THE SAVE PATH, AND THE WORST PLACE IN THE APP TO
      // HAVE IT. This swallowed everything and still answered success:true, so a
      // woman exercising her right to be deleted could be told her data was gone
      // while it sat in the table. That is the one promise the Privacy Policy has
      // to keep literally, and it is the promise the comment below ASSUMED —
      // "the results, which are the sensitive part, are already gone" — while
      // nothing checked. A described safeguard is not a safeguard.
      // ⚠️ And the same second hole: fetch RESOLVES on a 4xx, so a refused
      // DELETE never threw at all.
      // ▶ A deletion we cannot confirm is reported as a FAILURE, never as a
      // success. She must be able to ask again, or ask a human.
      let dataRemoved = false, delDetail = '';
      try {
        const d = await fetch(baseUrl + '?email=eq.' + encodeURIComponent(key), {
          method: 'DELETE',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        dataRemoved = !!(d && d.ok);
        if (!dataRemoved) delDetail = 'supabase ' + (d && d.status);
      } catch (e) {
        dataRemoved = false;
        delDetail = 'network';
      }

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

      // ⚠️ mailRemoved stays a separate, softer signal: her RESULTS are the
      // sensitive part, and a MailerLite hiccup must not make a real deletion
      // look failed. But the results themselves are now load-bearing.
      if (!dataRemoved) {
        return new Response(JSON.stringify({
          success: false, dataRemoved: false, mailRemoved,
          message: 'We could not confirm your results were deleted. Please try the link again, or email us and a person will do it.',
          detail: delDetail
        }), { status: 502, headers });
      }
      return new Response(JSON.stringify({ success: true, dataRemoved: true, mailRemoved }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', detail: err.message }), { status: 500, headers });
  }
};
