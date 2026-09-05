# The product catalog database — setup

Two things to do, both at a desk, both about ten minutes. After that the nightly
ingest can run and nothing here needs touching again.

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
| `SUPABASE_URL` | Supabase → Project Settings → **API** → *Project URL*. Looks like `https://abcdefgh.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase → Project Settings → **API** → **`service_role`** key |

### 🚨 It must be the `service_role` key, not the `anon` key

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
script never prints it. But it is not a value to paste into a chat, an email, or
anywhere else. If it is ever exposed, Supabase → Project Settings → API →
**Reset** issues a new one and the old one dies instantly.

---

## What the tables are

| table | one row per | roughly |
|---|---|---|
| `products` | **garment, in one colour** — what a shelf card is made of | 78,000 |
| `product_sizes` | **size** of a garment — what makes "in your size" honest | 266,000 |
| `product_syncs` | one store, one nightly run — the data-quality record | 7 a night |

Plus a view, `product_cards`, which is a garment with its sizes already gathered,
so one query fills a carousel.

**Measured size of the whole thing: about 144 MB.** Supabase's free tier allows
500 MB for the entire database, so there is comfortable room for Etsy and for
more stores as they approve. The reasoning behind every column, and the two
silent-failure traps the design protects against, are written into
`db/products.sql` itself.

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
