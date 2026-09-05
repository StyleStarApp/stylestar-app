# The product catalog database — setup

✅ **Both steps below were done by Cath on 2026-09-05.** They are kept because they
are the recipe for the next project, or for rebuilding this one — not because
anything is outstanding.

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

---

## What the tables are

| table | one row per | roughly |
|---|---|---|
| `products` | **garment, in one colour** — what a shelf card is made of | 78,000 |
| `product_sizes` | **size** of a garment — what makes "in your size" honest | 266,000 |
| `product_syncs` | one store, one nightly run — the data-quality record | 7 a night |

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
```
