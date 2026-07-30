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

### Phase 0 — Approval day inventory (Cath + Claude, ~an hour)
- List which of the 102 stores are available through each network she is approved on.
- Enable "product feed" / "datafeed" access in each network dashboard (usually a
  checkbox or a request button; some networks grant it automatically).
- Record per-network feed format (most are CSV/TSV over HTTPS or FTP; some have APIs).
- Decide the starting store set: begin with the 15 to 25 stores that carry the most
  suggestion traffic (the `_storeFit` top ranks) rather than all 102 on day one.

### Phase 1 — Ingestion (Claude, the real build)
- A scheduled nightly job (GitHub Action or Netlify scheduled function) downloads each
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
This plan starts the day Cath forwards the first "you're approved" email from any
affiliate network. Until then the gate is: Florida LLC → trademarks → EIN → business
bank → network applications.
