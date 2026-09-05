-- ============================================================================
-- Style Star — the product catalog tables
--
-- Run this ONCE, by hand, in the Supabase SQL editor:
--     supabase.com -> your project -> SQL Editor -> New query -> paste -> Run
-- Safe to run twice; everything is IF NOT EXISTS.
--
-- ⚠️ IF THE TABLES ALREADY EXIST, `create table if not exists` will NOT add a
--    column that was introduced later -- it sees the table and stops. Anything
--    added after the first run therefore also needs an `alter table` below, and
--    those live at the very bottom of this file under MIGRATIONS. Running the
--    whole file again is always safe and always brings an old database up to
--    date.
--
-- Written 2026-09-05 against MEASURED numbers, never a guess. The seven approved
-- Rakuten stores deliver 329,835 feed lines, 266,368 kept after the womenswear
-- filter, 78,299 distinct garments, with zero missing images, zero missing
-- prices and zero duplicate ids. See docs/product-feeds-plan.md.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- ⭐ THE GRAIN — the one real design decision, and it was MEASURED on a real
--    Postgres 16 with 54,056 realistic rows rather than reasoned about.
--
-- The feed carries ONE ROW PER SIZE. A garment in XS-XL arrives as five rows
-- sharing a `parent_sku`. So the catalog can be stored two ways:
--
--   flat  — one table, one row per feed row .......... MEASURED  266 MB
--   split — a garment table + a small sizes table ....  MEASURED  90 MB
--
-- ▶ SPLIT WINS AND IT IS NOT CLOSE. The flat table repeats a 157-byte affiliate
--   URL, a 77-byte image URL, the name, both categories and a 240-byte search
--   vector once PER SIZE — about 3.4 times over. Supabase's free tier is 500MB
--   for the WHOLE database, which also holds the users table and WAL, so 266MB
--   is a real risk and 90MB is comfortable with room for Etsy and more stores.
--   ⚠️ The first draft of this file was the flat design, on the reasoning that
--      delta files are per-row so feed grain makes a delta a plain upsert. That
--      reasoning was WRONG: a delta row carries the garment's fields too, so it
--      upserts both tables just as easily. Measuring beat arguing.
--
-- 🚨 AND THE PIECE KEY IS (parent_sku + COLOUR), NOT parent_sku ALONE.
--    Whether a merchant's parent_sku means "this style" or "this style in this
--    colour" is NOT KNOWN — it varies by merchant and nobody has measured it.
--    Keying on parent_sku alone would, at a merchant who groups colourways
--    together, silently show ONE colour and hide the rest — and colourways are
--    exactly what a woman shopping wants to see. Keying on the pair is
--    identical where parent_sku is already per-colour, and correct where it is
--    not. ▶ It costs nothing to be right in both cases, so be right in both.
-- ---------------------------------------------------------------------------


-- =========================== ONE ROW PER GARMENT ============================
-- ~78,000 rows. This is what a shelf card is made of.
create table if not exists products (
  -- Deterministic: mid : parent_sku : lowercased colour. Built by the ingest so
  -- a re-seed and a delta always produce the same key for the same garment.
  piece_key           text primary key,

  mid                 text not null,          -- Rakuten advertiser id
  -- The EXACT key in the app's own STORES table, so a catalog row joins to
  -- Catherine's own ten dimension scores and can be ordered by _storeFit().
  -- ⚠️ Vilebrequin is ingested but is NOT yet a STORES key — plan doc explains.
  store               text not null,

  parent_sku          text,                   -- feed column 28
  name                text not null,
  brand               text,
  category_primary    text,                   -- feed column 3
  category_secondary  text,                   -- feed column 4, '~~' expanded to ' > '
  merchant_category   text,                   -- feed column 29, the merchant's breadcrumb

  -- ⭐ Feed column 5 ARRIVES ALREADY AFFILIATE-TAGGED with her real publisher id
  -- (jZNkkinrr1k), byte-identical to the one in the app's own _affUrl. A feed
  -- product therefore earns from the moment it is shown.
  -- 🚨 STORE IT VERBATIM. Never pass it through _affUrl, never rebuild it, never
  --    "tidy" its parameters. That string is the commission attribution.
  url                 text not null,
  image_url           text,

  -- 🚨 NEVER read a raw feed price column. Vilebrequin and FARM Rio fill column
  --    10 (list price); Olivela, Marissa Collections, Mytheresa and Fleur du Mal
  --    leave column 10 EMPTY and put the number in column 13. Reading either one
  --    alone loses the price for stores, and loses it QUIETLY. rakuten_feed.py
  --    resolves it; this column holds that resolved answer.
  -- ▶ HER DECISION 2026-09-05: feed products show the CURRENT price, sale or
  --   regular. The Style Star Edit keeps its evergreen regular-price rule,
  --   because the Edit is hand-maintained and a sale typed into it goes stale
  --   while a nightly feed cannot. Two mechanisms, two rules, each tracking its
  --   own reason. Do NOT unify them.
  price               numeric(10,2),
  -- Kept so a marked-down card can show the original crossed out beside the new
  -- price. Her words: "shoppers love that."
  list_price          numeric(10,2),
  on_sale             boolean not null default false,
  currency            text not null default 'USD',

  color               text,                   -- feed column 32
  -- Material and pattern are kept deliberately, and NOT for display: a woman's
  -- never-wear list names FABRICS and PATTERNS ("ribbed", "satin", "leopard"),
  -- and filterNeverWear() presently has to match those against the item NAME.
  -- Real columns let that guarantee work structurally instead of by string luck.
  material            text,                   -- feed column 31
  pattern             text,                   -- feed column 34

  -- Kept even though the ingest filter already used it, because it separates
  -- "the merchant said Female" from "the merchant said nothing" — and that
  -- distinction IS the DVF trap: Diane von Furstenberg leaves gender blank on
  -- all 2,873 rows, so a keep-only-Female rule silently deletes an entire
  -- womenswear house. Worth six bytes a row never to relearn that.
  gender              text,

  -- ⭐ WHICH OF CATHERINE'S 100 CHECKLIST ROWS THIS GARMENT BELONGS ON, computed
  -- by the ingest from data/slot-rules.json (scripts/slot_match.py) and stored
  -- rather than re-derived when a shelf is drawn.
  -- ▶ WHY STORED. The shelf could instead ask "give me things that look like a
  --   white top" on every tap -- but then the rules would exist twice, once in
  --   Python and once in the JavaScript that serves the shelf, and a rule in two
  --   places drifts. Computing it once nightly makes the live read a single
  --   indexed lookup (`slots @> '{to1}'`) that cannot disagree with the report
  --   that measured it.
  -- ⚠️ It is an ARRAY because a garment honestly belongs on more than one row:
  --    a white silk shirt is both "Professional blouses" and "Dressy tops".
  --    Empty is normal and expected -- the catalog carries plenty the checklist
  --    has no row for.
  -- ⚠️ THE COST: a rules change reaches the shop on the next nightly run, not
  --    instantly. At most a day, against a class of bug that then cannot happen.
  slots               text[] not null default '{}',

  in_stock            boolean not null default true,
  updated_at          timestamptz not null default now(),

  -- Postgres full-text search: built in, free, and what Phase 2's product-search
  -- endpoint will query. Generated, so it can never drift from its own columns.
  search              tsvector generated always as (
                        to_tsvector('english',
                          coalesce(name, '')               || ' ' ||
                          coalesce(brand, '')              || ' ' ||
                          coalesce(color, '')              || ' ' ||
                          coalesce(material, '')           || ' ' ||
                          coalesce(pattern, '')            || ' ' ||
                          coalesce(category_secondary, '') || ' ' ||
                          coalesce(merchant_category, '')
                        )
                      ) stored
);

-- ---------------------------------------------------------------------------
-- ⚠️ THE DESCRIPTION COLUMN IS DELIBERATELY ABSENT, and that is reversible.
-- The feed carries a long description (column 9) and it is the largest field in
-- the file. Nothing reads it today: a shelf card shows name, brand, price,
-- image, colour and store.
-- ▶ ADD IT BACK the day the stylist chat queries this catalog and genuinely
--   wants it to judge a piece:  alter table products add column description text;
--   plus one line in the ingest, then a re-seed. Cheap to add later, wasteful to
--   have carried for months unread.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- ⚠️ EARLY MIGRATIONS — columns added after the tables first shipped.
--    These MUST run before the indexes and the view below, because those
--    reference the columns. `create table if not exists` above is skipped
--    entirely on an existing database, so it never adds them.
--    MEASURED 2026-09-05 on a real Postgres 16 reproducing Cath's database:
--    without this, an existing database fails with
--    `ERROR: 42703: column "slots" does not exist`.
-- ---------------------------------------------------------------------------
alter table products add column if not exists slots text[] not null default '{}';


create index if not exists products_search_idx on products using gin (search);
create index if not exists products_store_idx  on products (store);
create index if not exists products_price_idx  on products (price);
create index if not exists products_brand_idx  on products (brand);
-- The sweep after each store's sync removes rows the feed no longer carries, by
-- (store, updated_at). This makes that a scan of one store, never the whole table.
create index if not exists products_store_seen_idx on products (store, updated_at);
-- The shelf query is `slots @> '{to1}'`, so it needs a GIN index or it becomes a
-- scan of 78,000 rows every time a woman taps a checklist row.
create index if not exists products_slots_idx on products using gin (slots);


-- ============================ ONE ROW PER SIZE ==============================
-- ~266,000 rows, and deliberately narrow: this table exists so that "in your
-- size" — the promise removed from the app on 2026-07-27 because a store search
-- cannot filter — can come back as the truth. Measured at ~26MB.
create table if not exists product_sizes (
  -- Feed column 0. Measured unique across all 266,368 rows, so it is the key,
  -- and it is what a delta file upserts against.
  product_id  text primary key,
  -- 🚨 ORDERING MATTERS ON INGEST: the garment must be written BEFORE its sizes,
  --    or this reference fails. The ingest does pieces first, per store.
  piece_key   text not null references products(piece_key) on delete cascade,
  size        text,                          -- feed column 30
  -- Per-size price, because some merchants really do price sizes differently.
  -- The garment's own `price` is the lowest of these.
  price       numeric(10,2),
  in_stock    boolean not null default true,
  updated_at  timestamptz not null default now()
);
create index if not exists product_sizes_piece_idx on product_sizes (piece_key);
create index if not exists product_sizes_size_idx  on product_sizes (size) where size <> '';


-- ---------------------------------------------------------------------------
-- Sync history. The plan asks for a data-quality report per store on every run,
-- and today that report exists only in a GitHub Actions log, which expires after
-- 90 days. This is the same numbers somewhere durable, so "refreshed nightly" is
-- a claim that can be CHECKED rather than assumed. Seven rows a night is nothing.
-- ---------------------------------------------------------------------------
create table if not exists product_syncs (
  id            bigserial primary key,
  run_at        timestamptz not null default now(),
  store         text not null,
  mid           text not null,
  kind          text not null default 'full',   -- 'full' | 'delta'
  ok            boolean not null default true,
  feed_lines    integer,
  rows_kept     integer,
  pieces        integer,
  rows_written  integer,
  rows_removed  integer,
  dropped_male  integer,
  dropped_kids  integer,
  no_price      integer,
  no_image      integer,
  seconds       numeric(8,1),
  note          text
);
create index if not exists product_syncs_run_idx on product_syncs (run_at desc);


-- ---------------------------------------------------------------------------
-- 🔒 ROW LEVEL SECURITY — enabled, with NO policies, on purpose.
--
-- RLS on with no policy means the anon and authenticated roles can read
-- NOTHING, until a policy says otherwise. The ingest writes with the
-- service_role key (a GitHub Actions secret), which bypasses RLS entirely.
-- It also honours the standing rule that no client-supplied SQL reaches the DB.
--
-- ⚠️ THE CONSEQUENCE, and it is the thing most likely to trip up setup: THE ANON
--    KEY CANNOT WRITE TO THESE TABLES. The ingest must use the SERVICE ROLE key.
--    See db/README.md — it is a different key from the one in Netlify today.
--
-- ▶ ONE POLICY WAS ADDED LATER, on 2026-09-05, and it is READ ONLY: the app's
--   own Netlify function draws the wardrobe shelves with the ordinary key, so
--   that key may SELECT the two catalog tables and do nothing else. The full
--   reasoning, and why that beats putting the service_role key into Netlify,
--   is in the MIGRATIONS section at the bottom of this file.
-- ---------------------------------------------------------------------------
alter table products      enable row level security;
alter table product_sizes enable row level security;
alter table product_syncs enable row level security;


-- ---------------------------------------------------------------------------
-- A shelf card with its sizes already gathered, so one query fills a carousel.
-- A plain view, not materialized: Postgres answers it from the piece index
-- quickly, and a materialized view would need refreshing after every nightly
-- delta, which is one more thing to get wrong at 3am.
--
-- security_invoker = on is LOAD-BEARING, do not remove it. A Postgres view
-- runs as its OWNER by default, so without this the view would happily read
-- these tables for a caller that row level security is supposed to be blocking
-- -- the view becomes a back door around the RLS above. With it on, the view
-- runs as whoever is asking, so the same rules apply through the view as
-- through the tables. Supabase's own linter flags the default as critical.
-- ---------------------------------------------------------------------------
-- ⚠️ DROP then CREATE, never `create or replace`. Adding a column to `products`
--    changes the column ORDER this view returns (it selects p.*), and Postgres
--    refuses to rename a view column in place:
--    `ERROR: 42P16: cannot change name of view column "sizes" to "slots"`.
--    A view holds no data, so dropping it costs nothing. The grant below
--    re-grants it, and must stay AFTER this.
drop view if exists product_cards;
create view product_cards with (security_invoker = on) as
  select p.*,
         (select array_agg(distinct s.size order by s.size)
            from product_sizes s
           where s.piece_key = p.piece_key
             and s.in_stock
             and coalesce(s.size, '') <> '') as sizes
    from products p
   where p.in_stock;


-- ============================== MIGRATIONS ==================================
-- Columns added after the tables were first created. `create table if not
-- exists` above cannot add them to an existing table, so they are repeated here
-- as alters. Every one is IF NOT EXISTS, so running this file again is safe.
-- ---------------------------------------------------------------------------

-- 2026-09-05 — the checklist match, computed at ingest. See the column comment
-- in the products table above for why it is stored rather than derived.
alter table products add column if not exists slots text[] not null default '{}';
create index if not exists products_slots_idx on products using gin (slots);


-- ---------------------------------------------------------------------------
-- 2026-09-05 — LET THE APP READ THE CATALOG, AND ONLY READ, AND ONLY THIS.
--
-- ⚠️ THIS SOFTENS THE no-policies STANCE ABOVE ON PURPOSE, AND THE REASON IS
--    LEAST PRIVILEGE, NOT CONVENIENCE. The wardrobe shelves are drawn by a
--    Netlify function (product-search), and Netlify holds SUPABASE_KEY. The
--    alternative was to put the SERVICE ROLE key into Netlify as well -- and
--    that key bypasses every rule in this database, including on the `users`
--    table, so it can read every woman's name, email, sizes, portrait and
--    wishlist. Copying it into a second platform to let a function read some
--    product names is the wrong trade. A read-only policy on two catalog
--    tables is a far smaller door than a master key.
--
-- What this grants, exactly: SELECT on the two catalog tables. Nothing else.
-- No insert, no update, no delete -- the ingest still needs the service role
-- key, which is why it lives in a GitHub Secret and nowhere else. And
-- product_syncs deliberately gets NO policy: it is the ops record, the app
-- never reads it, so it stays sealed.
--
-- ⚠️ product_cards inherits this rather than needing its own policy, because
--    the view is security_invoker = on. That is the flag doing the work; if
--    anyone ever removes it the view becomes a back door instead.
--
-- ▶ WHAT IS NOW READABLE BY A LEAKED PUBLISHABLE KEY: product names, brands,
--   prices, images and affiliate links. Not a single row of anyone's personal
--   data -- `users` is untouched by this and keeps whatever it had. The honest
--   residual risk is that the retailer catalog itself is licensed to the APP
--   rather than for redistribution (the same rule that keeps feed data out of
--   this public repo), so it is a licensing exposure, not a privacy one.
--
-- To verify in the SQL editor after running this:
--     set local role anon;  select count(*) from product_cards;
--   -- a number = the app can draw shelves.  0 rows or an error = it cannot.
--   (Then just start a new query; `set local` only lasts the transaction.)
-- ---------------------------------------------------------------------------
-- ⚠️ THE GRANT IS NOT OPTIONAL, AND THIS WAS PROVEN ON A REAL POSTGRES 16, NOT
--    ASSUMED. A policy is checked AFTER the ordinary SQL privileges, so a role
--    with a permissive policy and no GRANT still gets "permission denied for
--    view product_cards". Supabase normally grants this by default on new
--    tables, so it may already be in place -- but if it were not, the function
--    would fail and, because a failure is deliberately an EMPTY POOL rather
--    than an error, the shelves would just quietly look like they did before.
--    A silent nothing is the worst failure this pipeline can have, so the file
--    grants it explicitly instead of hoping. Re-granting is harmless.
-- ⚠️ AND THE VIEW NEEDS ITS OWN GRANT. Granting the underlying tables is not
--    enough -- product_cards is a separate object, and without this line the
--    shelf query still gets "permission denied for view product_cards" even
--    though every table behind it is readable. Also measured, not assumed.
--    Both grants are required: security_invoker = on means the caller needs
--    SELECT on the view AND on the tables it reads.
grant select on products, product_sizes, product_cards to anon, authenticated;
drop policy if exists products_read      on products;
drop policy if exists product_sizes_read on product_sizes;
create policy products_read      on products      for select to anon, authenticated using (true);
create policy product_sizes_read on product_sizes for select to anon, authenticated using (true);
