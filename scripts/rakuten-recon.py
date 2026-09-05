#!/usr/bin/env python3
"""
Rakuten Product Catalog — RECON ONLY. Looks, reports, downloads one small file.

WHY THIS EXISTS: the column layout of a publisher-side Rakuten feed is not documented
anywhere this project can read (the guidelines PDF is behind a Cloudflare wall, and the
public spec on rakutenadvertising.com is the ADVERTISER-side upload format, which is a
different thing). So the parser must be written against a REAL header row, not a guess.
This job goes and gets that header row.

It also answers the question no sandbox can: whether an automated job can reach
aftp.linksynergy.com at all. Ports 21/22 are blocked from the dev sandbox by a hard
HTTPS-only proxy policy, so every connection test has to run here, as a real Actions job.

RULES BAKED IN, do not "optimise" them away:
  * BINARY transfer mode. Rakuten warns ASCII mode silently CORRUPTS the .gz rather
    than failing loudly, which is the worst kind of bug.
  * NEVER more than 5 concurrent connections (Rakuten's stated hard limit). This script
    opens exactly ONE, serially.
  * The password comes from the environment and is NEVER printed, and no feed data is
    ever written into the repository. This repo is PUBLIC: an affiliate approval lets
    the APP use a retailer's catalog, it does not let us republish it.
"""
import io, os, sys, gzip, ftplib

HOST = "aftp.linksynergy.com"
USER = os.environ.get("RAKUTEN_FTP_USER", "rkp_4740535")
PASSWORD = os.environ.get("RAKUTEN_FTP_PASSWORD", "")
SID = os.environ.get("RAKUTEN_SID", "4740535")

# Her 8 approved Rakuten advertisers (CLAUDE.md, 2026-09-04).
MIDS = {
    "44912": "FARM Rio",
    "53590": "Diane von Furstenberg",
    "43322": "Vilebrequin",
    "50334": "Olivela",
    "36537": "Marissa Collections",
    "43172": "Mytheresa",
    "50739": "Fleur du Mal",
    "54027": "Etsy",
}

def log(msg=""):
    print(msg, flush=True)

def redact(text):
    """Belt and braces: never let the password reach the log, even inside an error."""
    if PASSWORD and PASSWORD in text:
        text = text.replace(PASSWORD, "***REDACTED***")
    return text

def connect():
    log(f"Connecting to {HOST} as {USER} ...")
    ftp = ftplib.FTP()
    ftp.connect(HOST, 21, timeout=60)
    ftp.login(USER, PASSWORD)
    ftp.set_pasv(True)
    log(f"  connected. Server says: {ftp.getwelcome()}")
    return ftp

def listing(ftp, path=""):
    """Return {name: size_or_None}. Prefers MLSD; falls back to NLST + SIZE."""
    out = {}
    try:
        for name, facts in ftp.mlsd(path or "."):
            if name in (".", ".."):
                continue
            size = facts.get("size")
            out[name] = int(size) if size and size.isdigit() else None
    except Exception:
        try:
            for name in ftp.nlst(path or "."):
                base = name.rsplit("/", 1)[-1]
                if base in (".", ".."):
                    continue
                try:
                    ftp.voidcmd("TYPE I")
                    out[base] = ftp.size(name)
                except Exception:
                    out[base] = None
        except Exception as e:
            log(f"  (could not list {path or '/'}: {redact(str(e))})")
    return out

def human(n):
    if n is None:
        return "?"
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.0f}{unit}"
        n /= 1024.0
    return f"{n:.1f}TB"

def main():
    if not PASSWORD:
        log("FAIL: RAKUTEN_FTP_PASSWORD is not set.")
        log("Add it as a GitHub Secret named RAKUTEN_FTP_PASSWORD, then re-run.")
        return 1

    try:
        ftp = connect()
    except ftplib.all_errors as e:
        log(f"FAIL: could not connect or log in: {redact(str(e))}")
        log("If this is a network/timeout error, the runner cannot reach FTP and we")
        log("should try SFTP (port 22) instead. If it is a login error, the password")
        log("or username is wrong.")
        return 1

    log()
    log("=" * 68)
    log("TOP LEVEL")
    log("=" * 68)
    top = listing(ftp)
    if not top:
        log("  (empty)")
    for name in sorted(top):
        log(f"  {name:<48} {human(top[name]):>10}")

    # Which of her 8 advertisers actually have data? This is the question the
    # 2026-09-04/05 Cyberduck-vs-Finder confusion left genuinely unsettled.
    log()
    log("=" * 68)
    log("HER 8 ADVERTISERS — is the full product file really there?")
    log("=" * 68)
    found = []
    for mid, brand in MIDS.items():
        fname = f"{mid}_{SID}_mp.txt.gz"
        size = top.get(fname)
        if size is None and fname not in top:
            # Some accounts nest per-MID; look inside the folder too.
            sub = listing(ftp, mid) if mid in top else {}
            if fname in sub:
                size = sub[fname]
                log(f"  {brand:<24} {mid:<7} FOUND in {mid}/  {human(size):>10}")
                found.append((size or 0, f"{mid}/{fname}", brand))
                continue
            log(f"  {brand:<24} {mid:<7} -- not found --")
            if sub:
                for n in sorted(sub)[:6]:
                    log(f"      {mid}/ contains: {n}")
            continue
        log(f"  {brand:<24} {mid:<7} FOUND            {human(size):>10}")
        found.append((size or 0, fname, brand))

    log()
    log(f"  => {len(found)} of {len(MIDS)} advertisers have a full product file.")

    # Download the SMALLEST one only. Small is deliberate: this run exists to read a
    # header row, not to move gigabytes.
    if found:
        found.sort()
        size, path, brand = found[0]
        log()
        log("=" * 68)
        log(f"SAMPLE: downloading the smallest — {brand} ({path}, {human(size)})")
        log("=" * 68)
        buf = io.BytesIO()
        try:
            ftp.voidcmd("TYPE I")          # BINARY. Non-negotiable, see module docstring.
            ftp.retrbinary(f"RETR {path}", buf.write)
        except Exception as e:
            log(f"  download failed: {redact(str(e))}")
            ftp.quit()
            return 1

        raw = buf.getvalue()
        log(f"  downloaded {human(len(raw))}")
        try:
            text = gzip.decompress(raw).decode("utf-8", errors="replace")
        except Exception as e:
            log(f"  could not gunzip: {redact(str(e))}")
            log(f"  first bytes: {raw[:40]!r}")
            ftp.quit()
            return 1

        lines = text.splitlines()
        log(f"  uncompressed to {human(len(text))}, {len(lines):,} lines")
        log()
        for delim, label in (("\t", "TAB"), ("|", "PIPE"), (",", "COMMA")):
            if lines and delim in lines[0]:
                log(f"  delimiter looks like: {label}  ({lines[0].count(delim)+1} columns)")
                break
        log()
        log("  --- HEADER ROW (this is what the parser gets written against) ---")
        if lines:
            for i, col in enumerate(lines[0].replace("|", "\t").split("\t")):
                log(f"    {i:>3}  {col.strip()[:70]}")
        log()
        log("  --- FIRST DATA ROW ---")
        if len(lines) > 1:
            for i, val in enumerate(lines[1].replace("|", "\t").split("\t")):
                log(f"    {i:>3}  {val.strip()[:70]}")

    ftp.quit()
    log()
    log("Recon complete. No feed data was written to the repository.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
