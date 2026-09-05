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
- Feed access applied for on all 8 approved Rakuten advertisers, and **confirmed
  visually by Cath**: she connected to the server and saw real files in all 8 MID
  folders, plus `ADDITIONAL` and `GLOBAL` at the top level.
  ⚠️ **CORRECTION 2026-09-05: she connected through macOS FINDER, not Cyberduck.** The
  2026-09-04 notes say Finder failed silently and Cyberduck was the working fallback;
  her own account is the reverse, and hers is the one to trust. **So the "Finder is
  unreliable for this, use Cyberduck" lesson recorded on 2026-09-04 is WITHDRAWN** —
  do not repeat that advice, and do not send her to install anything. Finder worked.
  ▶ The substance is unchanged and stands: the files are really there.
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

**▶ THE TRANSPORT QUESTION IS ANSWERED (2026-09-05): run the job on GitHub Actions.**
The open flag was whether a scheduled job could reach `aftp.linksynergy.com` at all,
given that this dev sandbox cannot. Measured rather than assumed:

| port | from this dev sandbox |
|---|---|
| 21 (FTP) | blocked |
| 22 (SFTP) | blocked |
| 990 (FTPS) | blocked |
| 443 (HTTPS) | open, but see the correction below |

⚠️ **DNS was never the problem** — `aftp.linksynergy.com` resolves fine (69.46.3.107).
The block is this sandbox's HTTPS-only proxy, a hard environment policy. It is NOT a
property of Netlify or GitHub Actions.

🚨 **A CORRECTION, recorded because the wrong version was briefly written into this very
file and it is the kind of error that would have cost a day.** A first pass found that
`aftp.linksynergy.com` shares an IP with `products.linksynergy.com`, that the latter
answers on 443 as a `Rakuten S3 Gateway` running SFTPGo, and that it really authenticates
(unauthenticated → `AccessDenied`; a deliberately bogus AWS SigV4 key → `InvalidAccessKeyId`,
confirmed on three consecutive attempts). That was all true, **and all beside the point:
`aftp.linksynergy.com` itself does NOT answer on 443 (three consecutive attempts, all
connection failures), so the S3 gateway is a different Rakuten service that merely shares
a machine.** It is not proven to serve her publisher feeds, and there is no reason to
think her FTP credentials work against it. ▶ **THE LESSON, and it is this project's own
oldest one: a working door into a building nearby is not a door into YOUR building.
Verify against the exact host that holds the files, not a neighbour.**

▶ **SO THE ANSWER IS THE PLAIN ONE, and it was available without any of that cleverness:
use the documented FTP/SFTP path, and run the job on GITHUB ACTIONS**, whose runners have
unrestricted outbound egress and can therefore reach ports 21 and 22 that this sandbox
cannot. Also free on this repo (so it never touches the Netlify build minutes this project
watches), and its 6-hour ceiling comfortably fits large compressed feeds where Netlify's
function timeouts (~30s sync, 15 min background) would be tight.
⚠️ **Consequence to plan around: the fetch cannot be tested from this sandbox at all.**
Every connection test has to run as a real GitHub Actions job. Budget for that loop being
slower than local iteration, and make the recon job print enough to be useful in one run.

### What the support email settled (case 407562, 2026-09-04)
- **Host** `aftp.linksynergy.com` · **username** `rkp_4740535` · password issued separately
  (**GitHub Secret only — never the repo, never chat**).
- **Her SID is `4740535`**, which matches the Rakuten publisher SID already recorded in
  CLAUDE.md. Good consistency check.
- ⚠️ **Files are GZIP-COMPRESSED; transfer mode must be BINARY.** Rakuten warns explicitly
  that ASCII mode silently corrupts the file rather than failing loudly.
- ⚠️ **NEVER OPEN MORE THAN FIVE CONCURRENT CONNECTIONS.** Rakuten states this as a hard
  limit for automated downloads. With 8 advertisers the job must cap concurrency at 5, or
  fetch serially. Do not "optimise" this away.
- **File naming, with `MID` = advertiser and `SID` = 4740535:**
  | purpose | filename |
  |---|---|
  | complete product file | `MID_SID_mp.txt.gz` |
  | **delta (changes only)** | `MID_SID_mp_delta.txt.gz` |
  | category list | `MID/MID_category_list.txt` |
  | category product file | `MID/MID_SID_categoryID_cmp.txt.gz` |
  | template | `MID_SID_mp_template.txt.gz` |
  | delta template | `MID_SID_mp_deltatemplate.txt.gz` |
  So FARM Rio's full file is `44912_4740535_mp.txt.gz`.
- ⭐ **THE DELTA FILES ARE THE PRIZE AND SHOULD SHAPE THE DESIGN.** Mytheresa alone has
  ~290,667 products; pulling every full catalog nightly is a lot of bytes for a handful of
  changes. Take the full file once to seed, then ride the deltas. Re-seed from the full
  file periodically (weekly) so a missed delta cannot silently rot the table.
- ⚠️ **The column layout is still UNKNOWN.** Rakuten's guidelines PDF sits behind a
  Cloudflare wall that this sandbox cannot pass, and the public feed spec on
  rakutenadvertising.com is the ADVERTISER-side upload spec, not the publisher-side
  download format. ▶ **Do not write the parser against a guess — read the header row off a
  real downloaded file first.** That is the whole job of the recon workflow.

- A scheduled nightly job (**GitHub Action**, per the finding above) downloads each
  enabled store's feed.
### ✅ MEASURED AGAINST THE REAL FEEDS (2026-09-05, two GitHub Actions recon runs)
`scripts/rakuten-recon.py` + `scripts/rakuten-format.py`, both manual-dispatch workflows.
**Plain FTP on port 21 works from a GitHub Actions runner on the first try** (`220 SFTPGo
2.0.4 ready`). No SFTP fallback was needed. ▶ **8 of 8 advertisers have a full product
file waiting** — Phase 0 is now confirmed independently, not just on Cath's word.

| store | MID | full file | delta | rows |
|---|---|---|---|---|
| Vilebrequin | 43322 | 122 KB | 4 KB | 528 |
| Diane von Furstenberg | 53590 | 209 KB | 4 KB | 2,873 |
| Fleur du Mal | 50739 | 442 KB | 6 KB | 3,670 |
| FARM Rio | 44912 | 554 KB | 54 KB | — |
| Olivela | 50334 | 1 MB | 2 KB | — |
| Marissa Collections | 36537 | 2 MB | 91 KB | — |
| Mytheresa | 43172 | 23 MB | 269 KB | — |
| **Etsy** | 54027 | **5 GB** | **1 GB** | — |

🚨 **ETSY IS A 5 GB OUTLIER AND MUST BE EXCLUDED FROM THE FIRST BUILD.** It is 200× the
next largest store, its *delta alone* is 1 GB, and it is a marketplace of millions of
independent-seller listings rather than a curated store. The other seven total ~27 MB
combined, which is trivial. ▶ **Ingest the seven, ship something that works, and treat
Etsy as its own separate problem later** (streaming filter, never storing the whole
thing). Her Edit currently contains exactly one Etsy piece, so the cost of deferring is
near zero.

### The file format — CONFIRMED, not inferred
Pipe-delimited (`|`), no quoting, gzip, **38 columns, and NO COLUMN-NAME ROW**.
⚠️ **The file is wrapped in a header and a trailer record, and the parser MUST skip both.**
Line 1 is `HDR|MID|Merchant Name|MM/DD/YYYY HH:MM:SS`; the last line is a short trailer.
The recon proved this by measuring column counts across every row: **`[2, 38]`** — one row
in each file has 2 columns, not 38. A parser that assumes every line has 38 fields will
crash or insert garbage on the very first and last line of every feed.

| # | field | # | field |
|---|---|---|---|
| 0 | product id (MID+GTIN) | 20 | manufacturer |
| 1 | product name | 22 | **availability** (`in-stock`) |
| 2 | GTIN | 23 | UPC |
| 3 | primary category | 24 | (60 — constant, unidentified) |
| 4 | secondary category (`~~` separated) | 25 | currency (`USD`) |
| 5 | ⭐ **affiliate product URL** | 27 | tracking pixel URL |
| 6 | image URL | 28 | parent SKU |
| 8 / 9 | description (short / long) | 29 | merchant category breadcrumb |
| 10 | price | 30 | **size** |
| 11 / 12 | discount type / amount | 31 | material |
| 13 | sale price | 32 | **color** |
| 16 | brand | 33 | **gender** |
| 19 | SKU | 34 | pattern |
| | | 35 | **age group** (`Adult` / `Kids`) |

⭐⭐ **COLUMN 5 ARRIVES ALREADY AFFILIATE-TAGGED WITH HER REAL PUBLISHER ID**
(`click.linksynergy.com/link?id=jZNkkinrr1k&...`), which is byte-identical to the id
already in the app's own `_affUrl`. ▶ **So feed products EARN THE MOMENT THEY ARE SHOWN,
with no wrapping step at all.** Use column 5 verbatim; do not pass it through `_affUrl`
and do not rebuild it. (The `_template.txt.gz` files are the same data with `<LSN EID>`
placeholders instead of her id — they are a sample, NOT a column-name key.)

### 🚨 THE FILTERING TRAP, and it would have silently deleted a whole store
Style Star is womenswear for adults, so the obvious ingest rule is "keep gender = Female".
**Measured, that rule is wrong and expensive:**

| store | gender column |
|---|---|
| Fleur du Mal | 3,571 Female · 98 Male |
| Vilebrequin | **301 Male · 156 Female · 70 Unisex** |
| Diane von Furstenberg | **BLANK on all 2,873 rows** |

▶ **A blanket `gender == 'Female'` filter would drop DVF's ENTIRE CATALOG — 2,873 products
from a womenswear house — and nothing would look broken.** That is precisely the silent
class of failure this project has been bitten by before. **So: DROP rows explicitly marked
`Male`, KEEP `Female`, `Unisex` and BLANK.** Blank means "the merchant did not say", not
"not for women".
⚠️ **And filter `age group` too** — Vilebrequin's feed carries `Kids` rows (a girls'
swimsuit was in the first three sampled). Keep `Adult` and blank; drop `Kids`.
⚠️ **Vilebrequin being 57% menswear is not a surprise** — it is a men's-swim house
historically, which is the same fact that got it removed from the searchable store table
on 2026-08-21. Its ~156 women's rows are the real prize there, not the 528.

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
