#!/usr/bin/env python3
"""
The smallest possible Supabase client, for the nightly catalog ingest.

STANDARD LIBRARY ONLY, deliberately. The GitHub Actions workflow installs nothing,
so a dependency here would mean a pip step that can break the nightly job for
reasons that have nothing to do with Style Star.

It talks to PostgREST, which is the HTTP face of the Postgres database:
    POST   /rest/v1/<table>   with Prefer: resolution=merge-duplicates  -> upsert
    DELETE /rest/v1/<table>?<filters>                                   -> sweep
    GET    /rest/v1/<table>?<filters> with Prefer: count=exact          -> count

🚨 IT USES THE SERVICE ROLE / SECRET KEY. Row level security is ON with no policies
   (see db/products.sql), so the publishable key can read and write NOTHING here.
   The key is a GitHub Secret and must never be printed: every error goes through
   redact() before it is logged, the same guard rakuten-ingest.py uses for the FTP
   password.
"""
import json, time, urllib.request, urllib.error, urllib.parse


class SupabaseError(RuntimeError):
    pass


class Supabase:
    def __init__(self, url, key, timeout=180, log=print):
        if not url or not key:
            raise SupabaseError("SUPABASE_URL and SUPABASE_SERVICE_KEY must both be set")
        self.base = url.rstrip("/") + "/rest/v1/"
        self.key = key
        self.timeout = timeout
        self.log = log

    # -- keys must never reach a log line, however the failure arrives ----------
    def redact(self, text):
        return text.replace(self.key, "***") if self.key and self.key in text else text

    def _headers(self, extra=None):
        h = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if extra:
            h.update(extra)
        return h

    def _request(self, method, path, body=None, prefer=None, tries=4):
        """One request, retried only on the failures that are worth retrying.

        ⚠️ A 4xx other than 429 is NOT retried. Those mean the request itself is
        wrong (bad column, broken key, failed foreign key) and retrying just hides
        a bug behind four identical failures.
        """
        url = self.base + path
        data = json.dumps(body).encode("utf-8") if body is not None else None
        headers = self._headers({"Prefer": prefer} if prefer else None)
        delay = 2
        last = ""
        for attempt in range(1, tries + 1):
            req = urllib.request.Request(url, data=data, headers=headers, method=method)
            try:
                with urllib.request.urlopen(req, timeout=self.timeout) as r:
                    return r.status, r.read(), dict(r.headers)
            except urllib.error.HTTPError as e:
                detail = ""
                try:
                    detail = e.read().decode("utf-8", "replace")[:400]
                except Exception:
                    pass
                last = f"HTTP {e.code} {detail}"
                if e.code != 429 and 400 <= e.code < 500:
                    raise SupabaseError(self.redact(f"{method} {path}: {last}"))
            except Exception as e:                      # timeouts, resets, DNS
                last = f"{type(e).__name__}: {e}"
            if attempt < tries:
                self.log(f"    retrying ({attempt}/{tries - 1}) after {self.redact(last)}")
                time.sleep(delay)
                delay *= 2
        raise SupabaseError(self.redact(f"{method} {path}: gave up after {tries} — {last}"))

    # -- the three things the ingest actually needs -----------------------------
    def upsert(self, table, rows, chunk=500):
        """Insert-or-update by primary key. Returns the number of rows sent."""
        sent = 0
        for i in range(0, len(rows), chunk):
            batch = rows[i:i + chunk]
            self._request("POST", table, batch,
                          prefer="resolution=merge-duplicates,return=minimal")
            sent += len(batch)
        return sent

    def count(self, table, filters):
        """How many rows match. filters is a list of raw PostgREST clauses."""
        q = "&".join(filters + ["select=count"])
        status, body, _ = self._request("GET", f"{table}?{q}",
                                        prefer="count=exact,head=false")
        try:
            return int(json.loads(body)[0]["count"])
        except Exception:
            raise SupabaseError(f"count({table}) returned an unreadable body")

    def delete(self, table, filters):
        """Delete matching rows. Returns how many went."""
        q = "&".join(filters)
        status, body, headers = self._request("DELETE", f"{table}?{q}",
                                              prefer="return=minimal,count=exact")
        rng = headers.get("Content-Range", "")
        if "/" in rng:
            tail = rng.split("/")[-1]
            if tail.isdigit():
                return int(tail)
        return 0


def eq(column, value):
    return f"{column}=eq.{urllib.parse.quote(str(value), safe='')}"


def lt(column, value):
    return f"{column}=lt.{urllib.parse.quote(str(value), safe='')}"


def like_prefix(column, prefix):
    """PostgREST `like`, where * is the wildcard (not %)."""
    return f"{column}=like.{urllib.parse.quote(str(prefix), safe='')}*"
