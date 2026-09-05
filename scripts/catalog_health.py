#!/usr/bin/env python3
"""Is the catalog actually readable the way a wardrobe shelf reads it?

READ-ONLY. Answers the one question the app itself cannot: when a shelf comes
back empty, is that an empty catalog, an untagged catalog, or a query the
database is refusing?

▶ WHY THIS EXISTS. product-search.js returns an EMPTY POOL on every failure --
  no credentials, a PostgREST error, a thrown fetch -- because a missing catalog
  must fall back to the AI path exactly as it did before the feed existed. That
  is right for a woman tapping Ideas and useless for diagnosis: a broken read
  and an untagged catalog look identical from outside. This tells them apart.
"""
import os, sys, json, urllib.request, urllib.error, urllib.parse

URL = (os.environ.get("SUPABASE_URL") or "").rstrip("/")
KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY") or ""

def log(m): print(m, flush=True)

def get(path, prefer=None):
    """Returns (status, body, headers). Never raises on an HTTP error status."""
    req = urllib.request.Request(f"{URL}/rest/v1/{path}")
    req.add_header("apikey", KEY)
    req.add_header("Authorization", "Bearer " + KEY)
    if prefer:
        req.add_header("Prefer", prefer)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode("utf-8", "replace"), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace"), dict(e.headers)

def count(path):
    st, body, hdrs = get(path + ("&" if "?" in path else "?") + "select=count",
                         prefer="count=exact")
    # ⚠️ 206 IS SUCCESS HERE, NOT AN ERROR. PostgREST answers a counted query
    #    with 206 Partial Content whenever it returns a range, which a count
    #    always is. Treating it as a failure made this tool report ERROR beside
    #    a perfectly good number -- a harness that lies is worse than no harness.
    if st not in (200, 206):
        return None, f"HTTP {st} {body[:200]}"
    try:
        return int(json.loads(body)[0]["count"]), None
    except Exception:
        cr = hdrs.get("Content-Range", "")
        if "/" in cr:
            return int(cr.split("/")[-1]), None
        return None, f"unreadable body {body[:120]}"

def main():
    if not URL or not KEY:
        log("FAIL: SUPABASE_URL / key not set"); return 1

    import hashlib
    # 🔒 A short one-way fingerprint of the project, never the URL itself --
    # these logs are public. It exists so the app and the ingest can be compared
    # without either revealing an endpoint: if product-search reports a
    # different fingerprint, the two are talking to different databases, and a
    # url-and-key pair from different projects authenticates as nothing (401).
    log("=" * 66)
    log("CATALOG HEALTH")
    log("=" * 66)
    log(f"  project fingerprint         : "
        f"{hashlib.sha256(URL.encode()).hexdigest()[:8]}")

    # 1. Is there a catalog at all?
    n, err = count("products?in_stock=is.true")
    log(f"  garments in stock           : {n if n is not None else 'ERROR ' + err}")

    # 2. Does the VIEW the shelves read exist and answer?
    n, err = count("product_cards")
    log(f"  readable through the view   : {n if n is not None else 'ERROR ' + err}")

    # 3. Is anything TAGGED? This is the question the app cannot ask.
    #    `not.eq.{}` on a text[] is how PostgREST spells "has any slot".
    n, err = count("products?slots=neq.%7B%7D")
    log(f"  garments carrying a slot    : {n if n is not None else 'ERROR ' + err}")

    # 4. THE REAL QUERY, byte for byte what product-search.js sends. A 400 here
    #    with 42703 means PostgREST is serving a STALE SCHEMA CACHE -- it has not
    #    noticed the `slots` column yet -- and the cure is one line in the SQL
    #    editor: notify pgrst, 'reload schema';
    log("")
    log("  the shelf query, exactly as the app sends it:")
    for slot in ("dr1", "to3", "dr3", "sh9", "bg1"):
        p = urllib.parse.urlencode({
            "select": "piece_key,store,brand,name,url,image_url,price,"
                      "list_price,on_sale,color,material,pattern,sizes",
            "slots": "cs.{%s}" % slot,
            "in_stock": "is.true",
            "price": "not.is.null",
            "image_url": "not.is.null",
            "limit": "3",
        })
        st, body, _ = get("product_cards?" + p)
        if st != 200:
            log(f"    {slot}: HTTP {st}  {body[:220]}")
            continue
        try:
            rows = json.loads(body)
        except Exception:
            log(f"    {slot}: unreadable body {body[:120]}"); continue
        log(f"    {slot}: {len(rows)} row(s)")
        for r in rows[:2]:
            log(f"        · {str(r.get('name'))[:52]}  {r.get('store')}  ${r.get('price')}")

    log("")
    log("Nothing was written. Read-only.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
