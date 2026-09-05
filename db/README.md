# The product catalog database — setup

✅ **Both steps below were done by Cath on 2026-09-05.** They are kept because they
are the recipe for the next project, or for rebuilding this one — not because
anything is outstanding.

> ⚠️ **ONE SMALL THING TO RE-RUN (2026-09-05).** **Open the SQL Editor and run
> `db/products.sql` again.** It is safe to run any number of times — everything
> in it is `if not exists`, and re-running is exactly how it is meant to be
> updated.
>
> It does two things this time:
>
> 1. **Adds a `slots` column** — which of your 100 wardrobe checklist rows each
>    garment belongs on. The tables already exist, and `create table if not
>    exists` sees an existing table and stops, so it cannot add a new column on
>    its own. The next nightly run fills it in; until then it is simply empty
>    and nothing else changes.
> 2. **Lets the app read the catalog** — read only, and only the catalog. This
>    is what makes the shelves actually draw. Without it the wardrobe carousels
>    keep working exactly as they do today, they just never show a feed garment.
>
> ▶ **To check it worked**, start a new query and run:
>
> ```sql
> set local role anon;  select count(*) from product_cards;
> ```
>
> A number means the app can draw shelves. An error or `0 rows` means it cannot.
> (It will read `0` until the first nightly run, which is fine — a *number* is
> what you are looking for, not a big one.)
>
> ✅ **And nothing needs adding to Netlify.** That was the other way of doing
> this, and it would have meant copying the powerful `service_role` key into a
> second place. See *Why the app reads with the ordinary key* below.

---

## 1. Create the tables

1. Go to **supabase.com** and open the Style Star project.
2. Left sidebar → **SQL Editor** → **New query**.
3. Open `db/products.sql`, copy the whole file, paste it in, press **Run**.
4. You should see `Success. No rows returned.` Left sidebar → **Table Editor**
   should now list **products**, **product_sizes** and **product_syncs**, all empty.

It is safe to run twice. Running it again just says "already exists, skipping".

---

## 2. Add two GitHub Secrets

**Settings → Secrets and variables → Actions → New repository secret**, the same
screen where `RAKUTEN_FTP_PASSWORD` already lives.

| Secret name | Where to find it |
|---|---|
| `SUPABASE_URL` | The project home page → **Copy** → *Project URL*. Looks like `https://abcdefgh.supabase.co` |
| `SUPABASE_SERVICE_KEY` | **Settings → API Keys → Secret keys** → the `sb_secret_…` one |

⚠️ **The screens have been renamed.** Supabase now calls these *publishable* and
*secret* keys rather than `anon` and `service_role`; the old pair still exists
under a **Legacy anon, service_role API keys** tab. Either naming works — the
distinction below is what matters, not the label.

⚠️ **Copying the secret name out of a set of instructions overwrites your
clipboard**, which is a genuinely easy way to lose the value you just copied.
Copy the value, then **type** the name.

### 🚨 It must be the secret (`service_role`) key, not the publishable (`anon`) one

This is the one thing likely to go wrong, so it is worth being clear about.

The tables have **row level security** switched on with no policies, which means
the ordinary public key (`anon`) can read and write **nothing**. That is
deliberate: nobody's browser should ever be able to query the catalog directly,
and it keeps the standing rule that no client-supplied SQL reaches the database.
Only the `service_role` key is allowed through.

⚠️ **So do NOT copy the value already sitting in Netlify.** That one is very
likely the `anon` key, and if it goes into GitHub the ingest will fail with a
permissions error that does not obviously say "wrong key". The secret is
deliberately named `SUPABASE_SERVICE_KEY` rather than `SUPABASE_KEY` so the two
can never be confused.

⚠️ **And treat that key carefully — it is the powerful one.** `service_role`
bypasses every security rule in the database, including on the `users` table, so
it could read every woman's saved results. It is safe in a GitHub Secret
(GitHub masks secrets in logs, and secrets are never given to pull requests from
forks), the workflows here only run manually or on a schedule, and the ingest
script never prints it. But it is not a value to put into a chat, an email, or
anywhere else — **and a screenshot counts.**

▶ **If it is ever exposed, rotate it rather than reasoning about who might have
seen it.** Settings → API Keys → **+ New secret key** → copy it → update the
GitHub secret → delete the old key from its `⋮` menu. Two minutes, and it makes
every copy of the old key inert wherever it ended up. Deleting the message that
exposed it does not, because the value has already travelled.
⚠️ *This happened once, on 2026-09-05, from a screenshot of the GitHub form. It
was rotated the same hour.*

### Why the app reads with the ordinary key

The wardrobe shelves are drawn by a small Netlify function, and Netlify already
holds the ordinary `SUPABASE_KEY`. So the catalog tables now carry a **read-only
rule** that lets that key read them, and only them, and only read.

The alternative was to copy the `service_role` key into Netlify as well. That
key bypasses every rule in the database **including on the `users` table**, so
it can read every woman's name, email, sizes, portrait and wishlist. Putting a
master key in a second place so a function can look up some product names is the
wrong trade — a read-only rule on two catalog tables is a far smaller door.

What that rule exposes, exactly: product names, brands, prices, images and
affiliate links. **No personal data at all** — the `users` table is untouched by
it. Writing is still refused, which is why the nightly ingest still needs the
`service_role` key and still keeps it in a GitHub Secret and nowhere else.

---

## What the tables are

| table | one row per | roughly |
|---|---|---|
| `products` | **garment, in one colour** — what a shelf card is made of | 78,000 |
| `product_sizes` | **size** of a garment — what makes "in your size" honest | 266,000 |
| `product_syncs` | one store, one nightly run — the data-quality record | 7 a night |

Each garment also carries **`slots`** — the list of Catherine's own checklist rows
it belongs on (`{to1, to5}` for a white silk blouse, empty for the many things
the checklist has no row for). It is worked out during the nightly run rather
than when a shelf is drawn, so the rules live in exactly one place. Changing a
rule means editing `data/slot-rules.json` and waiting for the next run — and
running **Actions → Rakuten checklist coverage** first, which prints what every
row would hold with three real sample product names.

Plus a view, `product_cards`, which is a garment with its sizes already gathered,
so one query fills a carousel.

**Measured size of the whole thing: about 144 MB**, on a real local Postgres 16
loaded with 54,056 realistic rows and extrapolated — not estimated. This project
is on Supabase **Pro**, which includes 8 GB, so the catalog is under 2% of what
is already paid for, with comfortable room for Etsy and for every store still to
approve. The reasoning behind every column, and the two
silent-failure traps the design protects against, are written into
`db/products.sql` itself.

---

## Filling it

**It fills itself, every night at 21:37 UTC** (5:37pm New York). The job runs the
offline tests first, so a broken writer never reaches the database, then
downloads all seven catalogs, writes the garments, writes their sizes, and
removes anything the feeds no longer carry. About 80 seconds.

To run it by hand — after adding a store, or to check something — go to
**Actions → Rakuten feed ingest → Run workflow**. Tick **Report only, write
nothing** for a dry run that touches nothing.

⚠️ **If a night fails, GitHub emails the repository owner.** Worth not filing
those away unread: the catalog quietly going stale looks exactly like the
catalog being fine.

---

## Checking on it later

In the SQL Editor:

```sql
-- how fresh is the catalog, and did last night go cleanly?
select run_at, store, kind, ok, rows_written, rows_removed, seconds
  from product_syncs order by run_at desc limit 20;

-- how big has it got?
select pg_size_pretty(pg_total_relation_size('products')
                    + pg_total_relation_size('product_sizes')) as catalog_size;

-- what is actually in there, per store?
select store, count(*) as garments, min(price) as cheapest, max(price) as dearest
  from products group by store order by garments desc;

-- which checklist rows have something to show, and which are empty?
select slot, count(*) as garments
  from products, unnest(slots) as slot
 group by slot order by garments desc;

-- one row's shelf, the way the app will ask for it
select store, brand, name, price from products
 where slots @> '{to1}' order by price limit 20;
```
