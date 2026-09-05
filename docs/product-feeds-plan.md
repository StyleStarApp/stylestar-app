# Style Star Product Feeds — Build Plan

*Written 2026-07-30, after Cath's ChatGPT comparison test. Execute at money-path step 7,
the day the first affiliate network approves Style Star. Nothing here requires new
invention; it is ordinary plumbing waiting on business approvals.*

## What this is

ChatGPT answered Cath's suede-bag test better than Style Star because retailers upload
their live product catalogs (feeds) into OpenAI's private shopping database. That
database has no door for outside apps. But the same retailers hand the same feeds to
**affiliate networks** (Rakuten, CJ, ShareASale, Impact, Awin), and approved publishers
can download them: product name, today's price, every colorway with its own URL, images,
sizes, stock.

The plan: pull those feeds for Style Star's approved stores into our own database, and
have every shopping surface answer from real inventory. Same class of data as ChatGPT,
restricted to the 102 stores Catherine vetted, with her affiliate tag on every link.

## What each phase unlocks

### Phase 0 — Approval day inventory ✅ DONE 2026-09-04/05
- Rakuten Product Catalog FTP account issued (support case 407562), preferred feed
  format set to `.txt`, Auto Enrollment already ON so future advertiser approvals
  request feed access automatically.
- Feed access applied for on all 8 approved Rakuten advertisers.
  🚨 **DISPUTED, DO NOT TREAT AS CONFIRMED.** The 2026-09-04 session notes record Cath
  opening the server in Cyberduck and sending screenshots of real files in all 8 MID
  folders (plus `ADDITIONAL` and `GLOBAL`). **On 2026-09-05 she said plainly: "I never
  opened Cyberduck."** The disagreement is unresolved and not worth resolving, because
  either way **nobody on this side has independently seen the files**. ▶ Treat the feeds
  as UNVERIFIED until the pipeline itself connects and lists them. Do not build on the
  assumption that all 8 folders have data in them.
- **The 8 MIDs:** FARM Rio 44912 · Diane von Furstenberg 53590 · Vilebrequin 43322 ·
  Olivela 50334 · Marissa Collections 36537 · Mytheresa 43172 · Fleur du Mal 50739 ·
  Etsy 54027.

**▶ STARTING STORE SET = ALL 8, and this SUPERSEDES the original "15 to 25 stores"
line.** That line assumed she would be approved on the high-traffic department stores;
she is not, and her call (2026-09-05) is to do the best possible job with what she
actually has. Her words: *"we are changing that because I have not been approved for
those, and want to do the best we can with what we have so far."* So Phase 1 ingests
all 8, not a subset. The `_storeFit` top-ranks selection returns only if she is ever
approved on enough stores that ingesting all of them costs something.

### Phase 1 — Ingestion (Claude, the real build)

**▶ THE TRANSPORT QUESTION IS ANSWERED (2026-09-05), and the answer is better than any
of the three fallbacks that were anticipated.** The open flag was whether a scheduled
job could reach `aftp.linksynergy.com` on port 21 at all, given that this dev sandbox
cannot. Measured rather than assumed:

| port | from this sandbox | notes |
|---|---|---|
| 21 (FTP) | blocked | proxy is HTTPS-only; a hard environment policy |
| 22 (SFTP) | blocked | same |
| 990 (FTPS) | blocked | same |
| **443 (HTTPS)** | **OPEN and authenticating** | see below |

⚠️ **DNS was never the problem** — `aftp.linksynergy.com` resolves fine (69.46.3.107),
and resolves to the **same IP as `products.linksynergy.com`**. That host answers on 443
with `Server: Rakuten S3 Gateway`, `X-Amz-Request-Id` headers, an `<HostId>sftpgo-rakutenN</HostId>`
in its error bodies (so Rakuten runs **SFTPGo** behind it), and a valid TLS certificate
whose SAN is `aftp.linksynergy.com` itself.

▶▶ **AND IT REALLY AUTHENTICATES, proven not inferred: an unauthenticated request
returns `AccessDenied`, while a request signed with a DELIBERATELY BOGUS AWS SigV4 key
returns `InvalidAccessKeyId` — "The Access Key Id you provided does not exist in our
records."** The error changing shape with credentials is what proves the endpoint is a
live credential-accepting S3 API rather than a wall. Confirmed on three consecutive
attempts (the standing never-trust-one-fetch rule). `/api/v2/user/folders` also answers
in SFTPGo's own JSON (`{"status":"fail","message":"access_denied"}`), so the SFTPGo REST
API is exposed too.

**CONSEQUENCES, and they shape the whole build:**
1. **No raw FTP is needed anywhere.** Feeds are reachable over ordinary HTTPS on 443.
2. **The pipeline can be built AND TESTED from this sandbox**, not written blind and
   hoped for in production. That is worth a great deal on a data pipeline.
3. ⚠️ **Rakuten's own published guidance still says SFTP is strongly recommended and
   plain FTP is merely "currently supported"** — so SFTP (port 22) is the documented,
   supported path and HTTPS is the undocumented one. **Build the fetch layer so the
   transport is swappable**, and prefer SFTP in production if it proves equally easy.
   Do not hard-wire the S3 gateway as if it were a promise Rakuten has made.

**▶ RUN THE JOB ON GITHUB ACTIONS, not a Netlify scheduled function.** Reasons, in
order: GitHub Actions runners have unrestricted outbound egress, so **all three
transports work there** and the choice above stays reversible; it is free on this public
repo, so it does not touch the Netlify build minutes this project already watches; and
its 6-hour ceiling comfortably fits large compressed feeds where Netlify's function
timeouts (~30s sync, 15 min background) would be tight.

🚨 **STANDING RULE, and it is the 2026-08-21 photo-cache rule pointed at a new surface:
THIS REPO IS PUBLIC. Feed data must NEVER be committed to it.** An affiliate approval
licenses the APP to use a retailer's product data; it does not license this repository
to redistribute their catalog. Ingested rows go to Supabase and nowhere else; any local
working copy is gitignored. Credentials live in GitHub Secrets (masked in logs), never
in the repo and never in chat.

- A scheduled nightly job (**GitHub Action**, per the finding above) downloads each
  enabled store's feed.
- Normalize into one `products` table in Supabase (which we already run):
  `store, brand, name, category, color, sizes, price, sale_price, in_stock,
  product_url (with affiliate tag), image_url, updated_at`.
- Filter on ingest: womenswear categories only, drop out-of-stock, cap per-store rows.
  Feeds are big; the filter keeps Supabase small and queries fast.
- Data-quality report per store on every sync (row counts, price sanity, dead image
  URLs), because feed quality varies by network and store.

### Phase 2 — The catalog search endpoint (Claude)
- A new `product-search` Netlify function: query by keywords, category, color, size
  range, price band; returns the top matches as JSON.
- Postgres full-text search first (built into Supabase, free). Smarter matching
  (embeddings) only if real usage shows it is needed.
- Same gates as every function: origin check, rate limit, no client-supplied SQL.

### Phase 3 — Surface upgrades, in order of value
1. **Stylist chat**: for shopping questions, the app queries our catalog and hands the
   stylist real candidate products to choose from. Exact bag, in her color, at today's
   price, linking to that colorway's own page. Web search stays for trends and context.
2. **Shopping cards** (Shop your style, Wardrobe Ideas, Complete the Look): cards carry
   the real product photo, name, and price. The app becomes a lookbook.
3. **"In your size" returns**: feeds carry sizes and stock, so the promise removed on
   2026-07-27 can come back as truth, per category, per Cath's sizing rules.
4. **My Wishlist**: saved items can hold the exact product URL and price, re-checked
   nightly so a dead or repriced item is marked instead of silently rotting.

## Standing rules that carry over unchanged
- **Commission data never influences ranking.** Which store pays best stays in Cath's
  spreadsheet, out of the app (standing rule, 2026-07-27).
- Never-wear filtering applies to catalog results exactly as it does to AI suggestions.
- Price-spread and store-variety rules apply to what surfaces show.
- The Style Star Edit stays 100% Catherine's picks, never auto-filled from feeds.

## Costs and operations
- Nightly sync: effectively free (scheduled job, no servers).
- Storage: small after category filtering; well within Supabase's existing plan.
- AI cost per shopping answer goes **down**: catalog rows injected into a prompt are
  cheaper than web searches (no 1¢/search fee, fewer tokens than search results).

## Honest limits and risks
- Not every store offers a feed, and not every store will approve Style Star at once.
  Unapproved or feedless stores keep today's behavior (search links, chat web search).
  The app degrades store by store, never as a whole.
- Feeds are typically refreshed daily, so a same-day price change can lag a few hours.
  Still vastly fresher than web-search snippets.
- Amazon is excluded at launch by the 180-day/3-sales trap (see money-path notes);
  apply there only once real traffic exists.

## The trigger
~~This plan starts the day Cath forwards the first "you're approved" email from any
affiliate network.~~ **TRIGGERED. Phase 0 is complete and Phase 1 is the live build as
of 2026-09-05.** The whole upstream gate (Florida LLC → trademarks → EIN → business
bank → network applications) is cleared.
