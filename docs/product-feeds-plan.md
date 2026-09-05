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

### ✅ THE PARSER IS BUILT AND RUN AGAINST ALL SEVEN (2026-09-05)
`scripts/rakuten_feed.py` (parse + filter) · `scripts/test_rakuten_feed.py` (30 checks,
negative-controlled) · `scripts/rakuten-ingest.py` (dry run today, writes later).
**A full pass over all seven catalogs takes 24 SECONDS on a GitHub Actions runner.**

| store | feed rows | kept rows | **distinct pieces** | share |
|---|---|---|---|---|
| FARM Rio | 4,683 | 4,681 | 1,089 | 1.4% |
| Diane von Furstenberg | 2,874 | 2,872 | 598 | 0.8% |
| Vilebrequin | 529 | 188 | 188 | 0.2% |
| Olivela | 12,825 | 12,803 | 3,883 | 5.0% |
| Marissa Collections | 8,731 | 8,729 | 8,729 | 11.1% |
| **Mytheresa** | 296,522 | 233,524 | **63,024** | **80.5%** |
| Fleur du Mal | 3,671 | 3,571 | 788 | 1.0% |
| **total** | **329,835** | **266,368** | **78,299** | |

Dropped: 37,910 menswear · 25,543 kids.
⭐ **Zero missing images, zero missing prices, zero duplicate ids across all 266,368 rows.**
⭐ **DVF keeps 2,872 of 2,874** — the blank-gender rule working. Under keep-only-Female: 0.

🚨 **THE CATALOG IS 78,299 PIECES, NOT 266,368 — AND THE WRONG NUMBER WAS REPORTED TWICE
BEFORE THE PARENT SKU WAS MEASURED.** The feed carries **one row per size**, so Mytheresa's
233,524 rows are 63,024 garments at ~3.7 sizes each. ⚠️ Merchants differ: Marissa
Collections and Vilebrequin file **one row per piece** (1.0 sizes each) while Mytheresa,
Olivela, FARM Rio and Fleur du Mal break sizes out. ▶ **So `parent_sku` (column 28) is the
grouping key, and any count of "products" that does not group by it is wrong.** This is
good news, not bad: per-size rows are exactly what makes an honest **"in your size"**
possible again, the promise removed on 2026-07-27.

### 🚨 MYTHERESA IS 80.5% OF THE CATALOG — the store-variety problem, in numbers
▶ **HER FRAMING, 2026-09-05, and it is the clearest statement of this principle yet:
"it is the style star app not the mytheresa app."** It is the same worry she raised on
2026-07-27 (*"if Style Star gives every single suggestion at Nordstrom she might think
well I can just go straight to Nordstrom.com and skip this"*), now measurable.

**AS DECIDED (her call: "let's go with your best recommendation"):**
1. ⚠️ **DO NOT CAP WHAT IS INGESTED.** A piece that exists should be findable; capping
   storage means a woman searching for something specific cannot find it even though the
   store carries it. ▶ **This is deliberately the same call as 2026-07-27's "SORT, DO NOT
   TRIM"** — sorting did all the quality work there and trimming only ever saved money.
2. ⭐ **ORDER CATALOG RESULTS BY `_storeFit`, HER OWN STORE SCORES — never by store size.**
   The ranking machinery she built in July already knows which stores suit which woman.
   Reuse it rather than inventing a second notion of relevance.
3. **Apply her existing shelf rules to catalog results, unchanged:** no more than two
   picks from one store in a set, and include a smaller store where it honestly fits.
⚠️ **HONEST LIMIT, flagged: a per-store cap cannot fix genuine scarcity.** If only
Mytheresa carries what she asked for, she gets Mytheresa, and that is correct — the cap
prevents crowding, not honest answers.
▶ **Her hope that this eases as more stores are approved is right in direction**, but
worth holding loosely: Mytheresa is a genuinely large multi-brand retailer, so it may stay
the biggest for a long while. **That is fine if the ordering is by fit rather than volume**,
which is exactly why point 2 matters more than point 3.

### 🚨 A SECOND SILENT-FAILURE COLUMN, found by the dry run contradicting itself
The first dry run reported **"0 without a price"** while printing **`?`** for the price of
four stores. Those cannot both be true, and the contradiction was the bug.
▶ **Vilebrequin and FARM Rio populate column 10 (list price). Olivela, Marissa
Collections, Mytheresa and Fleur du Mal leave column 10 EMPTY and put the number in
column 13.** Reading column 10 alone loses the price for **four of the seven stores**, and
loses it quietly.
⚠️ **So never read a raw price column. Resolve through `price`.**
▶ **HER DECISION 2026-09-05, AND IT SUPERSEDES THE EDIT'S REGULAR-PRICE RULE FOR FEED
PRODUCTS ONLY: show the CURRENT price, markdown or not**, *"whether it is sale or
regular."* The regular-price rule (2026-07-26) exists because **the Edit is hand-maintained
and evergreen** — a sale price typed into it once sits there for months and goes stale. A
nightly feed cannot go stale that way, so the reason for the rule evaporates.
⚠️ **THE EDIT KEEPS ITS OWN RULE. Two mechanisms, two rules, each tracking its own reason
— do not "unify" them.**
⭐ **AND MARKED-DOWN CARDS SHOW BOTH PRICES, her call: "shoppers love that."** `list_price`
is retained so a discounted piece can render its original crossed out beside the new one;
`on_sale` says when that is honest.
▶ **THE REUSABLE LESSON: a report that disagrees with its own sample output is a bug, not
a display quirk.** Both feed bugs found today were of this shape — a rule that looked
right and quietly deleted data.

### 🚨 WHAT THIS ACTUALLY CHANGES FOR A WOMAN USING THE APP (2026-09-05 discussion)
Her question, and it was the right one: *"will she be receiving a mix of stores based on
her quiz results and refinements... so chances are she may or may not see one of these
stores depending on her style and preferences? seems like if that is the case then we
don't need to worry about mytheresa overwhelming her shopping suggestions."*

✅ **SHE IS RIGHT, and the mechanism confirms it.** `_rankedStores()` already orders all
102 stores by how well they suit HER, on the ten dimensions Cath scored herself in July,
and `_shopRules()` tells the model to favour the top. So Mytheresa's 80.5% share of the
catalog does NOT become 80.5% of any woman's shelf — a relaxed, casual, budget dresser's
top stores are Talbots, J.Jill, Lands' End and Quince, none of which are fed. **The
store-crowding worry is genuinely smaller than it looked, and it was already solved in
July.**

🚨🚨 **BUT CHECKING IT INVERTED THE WORRY, AND THIS IS THE REAL FINDING: EVERY FED STORE
IS `$$$` OR `$$$$`.**
Mytheresa `$$$$` · DVF `$$$$` · Olivela `$$$$` · Marissa Collections `$$$$` · Vilebrequin
`$$$$` · Fleur du Mal `$$$-$$$$` · FARM Rio `$$$`. **The only one spanning affordable is
Etsy `$-$$$$`, and Etsy is the one deferred.**
▶▶ **SO THE DIVIDE IS NOT BY STYLE, IT IS BY BUDGET. A woman who dresses up and can spend
gets a visibly richer app with real photos and prices. A woman on a budget gets today's
experience, unchanged.** ⚠️ **That runs directly against Cath's own founding value:
"literally any woman, 18 to 80+, no age or income bracket."**
⚠️ **AND A SUBTLER SECOND-ORDER EFFECT: her price-spread rule still fires, so a shelf
still includes something affordable — but THE AFFORDABLE PICKS WILL SYSTEMATICALLY BE THE
TEXT-ONLY ONES**, because the cheap stores have no feed. A shelf reads as two beautiful
photo cards at $600 and $400 beside four plain cards at $60. ▶ **The app would quietly
look more expensive than it is.** Watch for this the first time it is live.

▶▶ **THIS RESHAPES THE AFFILIATE PRIORITY, and it is the most actionable thing here:
another LUXURY approval adds almost nothing to the experience. A MID-MARKET or AFFORDABLE
approval is now worth far more than a designer one.** That makes **Under Armour** (one of
the three pending AWIN applications) more valuable than it looked, and it is a reason to
get to **CJ**. Weigh future applications by what they add to the CHEAP end of the shelf,
not by brand prestige.

### The mixed photo/no-photo shelf — the pattern already exists and she has blessed it
Feed products will sit beside AI-guessed ones, so some cards carry a real photograph and
price while others are text with a "Find it" search link. ⭐ **That design is already
built and already approved: the blended shelf from 2026-08-14** — up to 4 catalog pieces
lead, the AI fills the set to 6, ONE seamless carousel, **no badges and no attribution**
(her call then, and her words on the render: *"i like how that looks with no badges"*).
It is live in `_wardrobeIdeaGen` today for her hand-built 107-product catalog. **The feed
catalog rides the same machinery** — wiring, not new design.
⚠️ **ONE DIFFERENCE TO EXPECT: at 107 products the catalog rarely filled all four slots,
so it read as mostly-AI with a few real pieces. At 78,299 it will fill them constantly for
the women it suits, so the look flips to MOSTLY REAL.** Better, but the visual seam she
accepted at low volume becomes the dominant impression. ▶ **Her eye on a real phone, not
a judgement made here.**
▶ **RECOMMENDED ROLLOUT ORDER, agreed: Wardrobe Ideas FIRST** (the blend already exists
and she has seen it), **look at it on her phone, then widen.** Do not ship the mixed shelf
across every surface at once.

| surface | today | after |
|---|---|---|
| Wardrobe Ideas | blend already built | real photos fill it — biggest immediate change |
| Shop your Style | all AI-guessed | needs the same blend added |
| Complete the Look | all AI-guessed | same |
| Stylist chat | web search, ~5-10¢, 10-20s | queries our own catalog: faster, cheaper, exact |
| Your Wishlist | rebuilt search links | real prices, re-checked nightly |

### ✅ DONE 2026-09-05 — THE TABLES AND THE WRITER
1. ✅ **The tables exist**, `db/products.sql`, run by Cath in the Supabase SQL editor.
   ⭐ **The grain was MEASURED, not argued**: 54,056 realistic rows loaded into a real
   local Postgres 16 showed **flat 266 MB vs split 90 MB**, so a garment table plus a
   narrow sizes table won and it was not close. The first draft was the flat design on
   reasoning that turned out to be wrong. **The piece key is `mid : parent_sku : colour`**
   because whether a merchant's parent_sku is per-style or per-colourway is unmeasured
   and varies — keying on the pair is identical where it is already per-colour and
   correct where it is not.
2. ✅ **Two GitHub Secrets added** (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`).
   🚨 **It is the SERVICE/SECRET key, not the publishable one.** RLS is on with no
   policies, so the publishable key can read and write nothing here — which is the point.
3. ✅ **The ingest WRITES.** `scripts/supabase_io.py` (stdlib only, so the workflow still
   installs nothing) upserts through PostgREST; `rakuten-ingest.py` writes garments, then
   sizes, then sweeps what the feed no longer carries, then records a `product_syncs` row
   per store. ⚠️ **Ordering is load-bearing** — a size references its garment, so garments
   go first; the offline test enforces the foreign key exactly as the database does.
   ▶ **Three guards worth knowing, because each protects against an expensive night:**
   - **The sweep only runs on a FULL feed.** A delta carries only what changed, so
     sweeping after one would read the other 99% as "gone" and delete the whole store.
   - **The sweep refuses** when a feed accounts for under 60% of what we already hold
     AND at least 500 rows would go. ⚠️ **Both conditions, because proportion alone is
     wrong for a small store**: Vilebrequin's 188 pieces can move 40% in an ordinary
     week, and a brake that jams on it stays jammed every night after.
   - **A failed store fails the job**, so a half-empty catalog cannot look healthy in the
     Actions list.

### 📏 WHAT THE FIRST REAL RUNS MEASURED (2026-09-05, three runs, all seven stores)
**78,278 garments and 265,774 sizes, written in 77 seconds.** Zero without an image,
zero without a price, zero duplicate ids. The shape report earned its keep immediately,
and every finding below came from a CONCRETE EXAMPLE rather than a count — the counts
only said the rows differed, which would have been easy to wave away.

1. 🚨 **THREE MERCHANTS BAKE THE SIZE INTO THE PRODUCT NAME.** Fleur du Mal:
   *"Collared Bodysuit with Dotted Tulle Black Size Small"* vs *"... Size Medium"*, on
   **646 of 791** pieces. FARM Rio does it too, with the colour: *"Red Fish Top Maxi
   Dress, RED / XXS"*, **873** pieces. The garment row keeps whichever size came first,
   so a shelf card would have read "Size Small" as though it were part of the piece.
   ▶ **`tidy_name()` recovers the garment from the common prefix of its size rows.**
   ⚠️ It cuts back to a word boundary ONLY when the prefix really stops mid-word — bra
   sizes 30A and 30B share *"... Size 30"* — and never otherwise, or *"Silk Dress"*
   beside *"Silk Dress Long"* comes back as *"Silk"*. Both pinned by tests.
2. 🚨 **EVERY SIZE HAS ITS OWN PRODUCT URL** at Mytheresa (100% of 42,726 multi-size
   pieces), Olivela, DVF, FARM Rio and Fleur du Mal — the Rakuten `offerid` differs per
   row. And some merchants **price sizes differently** (Fleur du Mal $18 vs $24 on one
   piece; FARM Rio $50 vs $100). The garment shows the LOWEST price, so **the link and
   the photo now come from that same row**, or a card offering $18 would have sent her
   to the $24 size's page.
   ▶ **The per-size URLs are deliberately NOT stored.** Repeating a 157-byte affiliate
   URL 266,000 times is the whole thing the split design avoids (+42 MB), and the
   promise "in your size" is about FILTERING what she is shown, not deep-linking to one
   size — every retailer lets her pick the size on the page she lands on.
3. ⚠️ **A REAL GAP FOR "IN YOUR SIZE", NOT YET SOLVED: FARM Rio leaves the size COLUMN
   EMPTY on 2,968 of its 4,475 rows and writes the size only into the name**
   (*"FARMLAB HAVAIANAS SANDALS, FARMLAB / 6"*, size column blank). Marissa Collections
   names no size at all on any of its 8,755 rows, which is honest — it is mostly jewelry.
   ▶ **So a size filter will be blind to those pieces.** Recovering the size from the
   name is possible but store-specific and speculative; **decide it when the size filter
   is actually built**, against what a shelf looks like, not now.

### 🕗 THE NIGHTLY SCHEDULE — 21:37 UTC, AND IT RUNS THE **FULL** FEED
🚨 **THIS REVERSES THIS DOCUMENT'S OWN "ride the deltas" INSTRUCTION, and the reason is
that the instruction was written before anything had been measured.** It rested on
*"pulling every full catalog nightly is a lot of bytes"*. It is **27 MB and 77 seconds**
for all seven, on a public repo where Actions minutes are free. That premise was wrong.
- ▶▶ **AND THE FULL FEED BUYS THE ONE THING A DELTA CANNOT: THE SWEEP.** The sweep is
  what removes a garment the merchant has stopped carrying, and it is deliberately
  disabled on a delta (a delta lists only what changed, so sweeping after one would read
  the untouched 99% as gone and delete the store). On deltas the catalog is only
  corrected at the weekly re-seed — **up to seven days of shelf cards pointing at
  sold-out pieces. Nightly full: at most one.** For an app whose whole promise is honest
  shopping, that is the trade, and it is not close.
- ▶ Three smaller reasons, all pointing the same way: **the delta format has never been
  read** (building against an unread format is the mistake this project keeps paying
  for) · **GitHub can DROP a scheduled run under load**, and a missed full run costs one
  stale day while a missed delta silently rots the table · one code path, not two.
- ⚠️ **KEEP THE DELTA MACHINERY.** `FEED_KIND` still gates the sweep, and deltas become
  genuinely necessary the day **Etsy** joins — 5 GB full against 1 GB delta is a
  different question from 27 MB.

⭐ **THE HOUR IS MEASURED TOO.** Every feed's first line carries the merchant's own build
stamp, which the parser had been discarding as "header" since it was written. Kept and
logged, the seven read **03:23 · 05:00 · 06:02 · 07:01 · 10:45 · 13:02 · 14:13**, so the
last lands early afternoon.
⚠️ **That clock is US EASTERN, not UTC, and an accident pinned it: FARM Rio's catalog
changed between a 14:43 UTC run and an 18:30 UTC one while still stamped 13:02.**
Impossible if 13:02 were UTC — it predates both. Exactly right at 17:02 UTC. So the last
build is ~18:13 UTC and the job runs three hours later.
⚠️ **`:37`, never `:00`** — GitHub delays and sometimes drops scheduled runs when load
spikes, and load spikes at the top of every hour.
⚠️ **GitHub disables a scheduled workflow after 60 days with no commits** to the repo. It
emails the owner. Unlikely here, but if the catalog ever goes quietly stale after a long
break, look there before looking at the code.

### ▶ NEXT, IN ORDER
1. ✅ **Run it for real — DONE.** 78,278 garments, 77 seconds, all seven clean.
2. ✅ **Put it on a nightly schedule — DONE.** See above: full feed, 21:37 UTC.
3. **Then the surfaces**, in the plan's own order: stylist chat first, then real photos
   and prices on the shopping cards, then "in your size", then the wishlist.
4. ▶ **ETSY IS DEFERRED, NOT DROPPED — her call, 2026-09-05.** Its own conversation once
   the seven work.
5. ⭐ **VILEBREQUIN GOES BACK INTO `STORES` — HER DECISION 2026-09-05, WITH A CONDITION
   ATTACHED THAT IS NOT YET MET.** Her words: *"as long as it can be properly searched,
   there is now no reason to leave it out."*
   ⚠️ **That condition is precisely the part that is still false today.** `STORES` is not
   only the catalog's store list: it also drives `getStoreUrl()`, which builds search
   links on the STORE'S OWN SITE, and it feeds `SEARCH_DOMAINS` for the stylist chat's
   web search. **A feed fixes neither of those paths.** Re-adding it now would restore the
   exact bug it was removed for on 2026-08-21 — a woman told Vilebrequin has no cover-up
   dresses when they do.
   ▶ **SO: add it back at the moment the catalog actually powers the shopping surfaces**,
   so it is reached through the feed rather than through their search box. Same decision,
   correct sequencing. Its 188 women's pieces are ingested meanwhile.

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
