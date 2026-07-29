# Option 3 — Your own curated catalog

**Goal:** make the archetype do real work, and make every recommendation a real product that exists, without waiting on anyone's approval.

---

## The idea in one paragraph

Right now the AI invents an item name and sends her to a search box. Instead, you build a list of real products *you* have chosen, tag each one so the app knows who it suits, and let the archetype filter that list. She still gets a personalized set of shopping ideas — but every item exists, at a real price, from a real store, with your note explaining why. The AI stays in the picture for anything your list doesn't cover, clearly marked as a suggestion rather than a promise.

---

## The good news: you already built the skeleton

Your `wardrobeItems` list — 10 categories, 100 pieces, straight off your real closet-consult clipboard — is already the taxonomy. You don't need to invent categories or decide what a complete wardrobe is. **Every product you add slots into one of those 100 items.**

That has a nice consequence: Your Wardrobe stops being a checklist and becomes a store. She taps the heart on "Belted trench," and instead of a search page she gets four real trenches you picked, in her price range and her size, each with a line from you.

---

## Step 1 — Style families

Tagging every product against 28 archetypes is too much work. Tagging against **9 families** is manageable, and because your archetypes are already positioned on 12 sliders, they cluster naturally.

Here is the mapping, derived from the actual vectors in your `archetypes` array:

| Family | Archetypes it covers |
|---|---|
| **Classic** | The Timeless Classic · The Modern Classic · The Serene Grace · The Polished Sophisticate |
| **Minimal** | The Clean Minimalist · The Understated Luxury |
| **Natural** | The Natural Chic · The Easygoing Natural · The Elevated Casual |
| **Sporty** | The Sporty Luxe · The Vibrant Athlete |
| **Professional** | The Polished Professional · The Rising Star |
| **Romantic** | The Romantic Feminine · The Soft Glam · The Refined Elegance |
| **Glam** | The Golden Hour · The Glamorous Maximalist · The Enchantress · The Sculpted Chic |
| **Bold** | The Bold Expressionist · The Creative Original · The Pop of Color · The Sunny Classic · The Free Spirit |
| **Edgy** | The Modern Trendsetter · The Statement Maker |

**The Beautifully Balanced** is the exact centre of your map — all twelves at 6. She doesn't belong to a family; she should see the broadest, most-liked selection across all of them. Treat her as a special case rather than forcing a label.

Two notes on judgment calls you may want to overrule: I put **The Sunny Classic** in Bold rather than Classic because her colour and print scores are 9 and 8, which drives product choice more than her preppy lean does. And **The Sculpted Chic** went to Glam on the strength of a 10 on fitted. You know these women better than the numbers do — move them if they feel wrong.

Each product gets **1 to 4 family tags.** A good white blouse might be Classic + Minimal + Professional. A sequinned slip dress is just Glam.

---

## Step 2 — What each product needs

One row per product. Nothing here is optional except where noted.

| Field | Example | Why |
|---|---|---|
| `id` | `p001` | Stable reference |
| `slot` | `ja6` | Which wardrobe item — matches your existing ids |
| `name` | Belted Wool Trench | What she sees |
| `brand` | Mango | Trust signal |
| `retailer` | Nordstrom | Must match a name in your `STORES` list |
| `url` | *(bare product URL)* | Affiliate tag gets added by the wrapper, never stored here |
| `price` | 189 | Number, no symbol — so you can filter |
| `band` | `$$` | `$` under 50 · `$$` 50–150 · `$$$` 150–400 · `$$$$` 400+. Used to **spread** prices across a set, never to filter — see Step 4 |
| `families` | `Classic, Professional` | From the nine above |
| `sizes` | `XS-XL` | Whatever the retailer lists |
| `sizeExtras` | `petite, tall` | Blank if none — this is how petite/plus women stop seeing dead ends |
| `colors` | `camel, black` | Ranks toward colours she loves, and lets a free-text "no orange" be honoured without a colours-to-avoid screen |
| `attrs` | `belted` | Structural tags matching your never-wear list: `puff-sleeve`, `ruffles`, `sequins`, `turtleneck`, `oversized`, `jumpsuit`, `crop`, `low-rise`, `bodycon`, `strapless`, `short-shorts`, `mini` |
| `patterns` | *(blank)* | `animal`, `floral`, `stripe`, `polka`, `plaid`, `logo`, `slogan`, `tie-dye`, `camo` |
| `note` | "The belt is what makes it — cinch it and it flatters everyone." | **The most important field.** No note, no publish. |
| `checked` | `2026-07-29` | Last time you confirmed the link works |
| `active` | `yes` | Flip to `no` when it's discontinued |

**On `attrs` and `patterns`:** these are why the never-wear list finally becomes a real rule instead of a polite request to the AI. A woman who said "never ruffles" can be *structurally* prevented from seeing anything tagged `ruffles`. That's the promise you couldn't keep before.

**On images:** they lift clicks a lot, but hotlinking a retailer's images without permission is a grey area, and affiliate networks often provide approved image URLs on approval. My suggestion: skip images in this first pass, add them when you have feed access and clear rights.

---

## Step 3 — How much to build (and please don't start with 200)

Honest arithmetic: finding a product, checking sizes, and writing a real note is 6–10 minutes each. Two hundred items is 20 to 30 hours. That's several weekends, and it would be miserable to discover at hour 25 that the filtering doesn't feel right.

**So do 60 first.** Ten slots, six products each — spread across price bands and families. That's around eight hours, and it's enough to see the whole thing working end to end.

Ten slots I'd pick, because they're high purchase intent and show off family differences well:

`bo1` Blue jeans · `ja2` Blazers · `ja6` Belted trench · `dr1` Daytime casual dresses · `dr9` Cocktail dresses · `to5` Professional blouses · `sh7` Ankle boots · `sh9` Fashion sneakers · `bg1` Tote bags · `ex2` Statement earrings

Cocktail dresses and statement earrings are in there deliberately — they're where Classic and Glam should produce *obviously* different results. If your filtering works, that's where you'll see it.

Then expand in this order:

- **Phase 2 (to ~30 slots, ~200 items):** the rest of the aspirational pieces — coats, skirts, heels, crossbody bags, necklaces, the remaining dresses.
- **Phase 3:** the basics. Lower intent (most women own black tops already) but high repeat purchase, so worth having eventually.
- **Never bother:** slippers, athletic socks, cosmetic bags. Let the AI handle the long tail.

Target roughly 4–8 products per slot: at least two price bands, and enough family spread that no archetype comes up empty. You do **not** need every family in every slot — but check that each family has *something* in most slots, or a Bold woman will find your list thin.

---

## Step 4 — How the filtering works

In plain terms, four stages. The first is the one that earns her trust.

**1. Hard filters — remove, never rank down.** Drop anything that: is `active: no`; matches her never-wear `attrs` or `patterns`; doesn't come in her size (including petite/tall/plus when she's said so); or matches a colour she named in her free-text notes as a no. An item failing any of these must never appear. One violation costs more than ten good picks earn.

**Deliberately NOT hard filters: budget and colour preference.** Both were in an earlier draft; Catherine argued them out, correctly. Most women are open to most colours, so a "tap the colours you hate" screen asks a question most don't have an answer to — and the free-text field already catches the one who does. And a hard price cutoff strips out aspiration, which is a real part of how styling works: a beautiful £400 coat makes the £90 one next to it feel like a find.

**2. Family match.** Look up her archetype's family, keep products carrying that tag. If she's Beautifully Balanced, keep everything.

**3. Diversity, including the price spread.** Cap at 2 items per slot in any one set. Then shape the price mix: **most of the set should sit in the band she actually shops, with at most one deliberate stretch piece above it.**

That's the real fix for the problem the Edit has today — seventeen items from $17 to $295 with nothing connecting them. One stretch item in six is aspiration. Four in six reads as *this app doesn't know me*, and she won't tell you that, she'll just stop coming back.

Where does "the band she actually shops" come from, given you're not asking her? Two sources, neither of which needs a question:

- **What she clicks and saves.** Behaviour beats self-report on money, every time. Once there's traffic, the median band of her clicked and saved items is her range.
- **Until then, a sensible default.** Lead with `$$`, always include at least one `$`, allow at most one item two bands above the set's median.

**4. Rank.** Prefer items in colours she loves, then more recently checked ones.

**When fewer than 4 items survive:** don't show an empty screen and don't quietly relax a hard filter. Name the constraint — *"There isn't much here in your size yet — want me to look wider?"* — and offer the AI as the fallback, labelled as a suggestion rather than something you've vouched for.

Sketch, so Claude Code has the shape:

```
function curatedPicks(slot, prefs, family, count) {
  let pool = PRODUCTS.filter(p => p.active && p.slot === slot);

  // Colours she named as a no, pulled out of her free text — no extra UI.
  const avoidColours = coloursMentionedAsNo(prefs.neverOther);

  // 1. hard filters
  pool = pool.filter(p =>
    !p.attrs.some(a    => prefs.neverAttrs.includes(a)) &&
    !p.patterns.some(x => prefs.neverPatterns.includes(x)) &&
    !p.colors.some(c   => avoidColours.includes(c)) &&
    fitsHer(p, prefs.sizes)
  );

  // 2. family
  if (family !== 'Balanced') pool = pool.filter(p => p.families.includes(family));

  // 3. rank
  pool.sort(byLovedColour(prefs).then(byRecentlyChecked));

  // 4. max 2 per slot, then shape the price mix — mostly in range,
  //    at most one stretch piece. Never a cutoff.
  return shapePriceMix(pool, count, inferredBand(prefs));
}
```

**No new preference fields are needed.** This runs entirely on what the app already collects — sizes, the never-wear chips, loved colours, and her free-text notes. `colorsSkip` stays deleted, and there's no budget question. That was the right call: it's less to ask her and less to build.

---

## Step 5 — Keeping it alive

This is the part that kills curated catalogs, so plan for it now.

- **Monthly pass.** Sort by oldest `checked`, open the links, update or deactivate. Half an hour a month at 200 items.
- **Never claim live stock.** Say *"hand-picked and checked in July"* — honest, and it turns maintenance into a trust signal rather than a liability.
- **A "this link is broken" tap** on every product. Your users will maintain the list for you if you let them.
- **Automate the boring half.** A weekly script that requests each URL and flags anything returning a 404 catches most discontinuations without you looking. Worth asking Claude Code for once you're past 100 items.

---

## Step 6 — How you'll actually enter 200 products

Not by editing code. Use a spreadsheet — one row per product, with dropdowns for families, bands, attrs and patterns so you can't typo a tag. Then a small script converts it to the JSON the app reads.

I've built you that spreadsheet; it's the other file. The workflow:

1. Add rows in the spreadsheet whenever you're browsing anyway
2. Export as CSV
3. Run the converter → `products.json`
4. Commit, and it's live

That way adding products is an afternoon with a cup of tea, not a coding session.

---

## What to tell Claude Code

> I'm building a curated product catalog so the archetype can actually filter real products instead of the AI inventing item names. Please:
>
> 1. Create `products.json` at the repo root, plus a `scripts/products-from-csv.js` converter that turns my spreadsheet CSV export into it. Validate on convert: every `slot` must match an id in `wardrobeItems`, every `retailer` must match a key in `STORES`, every `family` must be one of the nine, `price` must be a number, `note` must be non-empty. Fail loudly with the row number on any bad row.
> 2. Add an `ARCHETYPE_FAMILY` map from all 28 archetype names to their family, with "The Beautifully Balanced" mapped to `Balanced`. Derive her family from `topArchNames[0]`.
> 3. Add `curatedPicks(slot, prefs, family, count)` implementing the four stages above — hard filters as removals before any ranking, never as score penalties. **Budget is not a hard filter and there is no budget question**; price is shaped at the diversity stage instead (mostly in range, at most one stretch item). **Do not reintroduce `prefs.colorsSkip` or a colours-to-avoid screen** — instead parse colour mentions out of her existing free-text `neverOther` field and match them against each product's `colors`.
> 4. Wire it into Your Wardrobe first: tapping a checklist item shows curated products for that slot if any survive the filters, and falls back to the current AI suggestions if fewer than 4 do. Label the two differently — curated items are "picked by Catherine," AI items are "an idea to explore."
> 5. No new preference fields. This should run on what the app already collects: sizes, never-wear chips, loved colours, and free-text notes.
> 6. Write tests: a woman who said "never ruffles" never sees a ruffled item; a woman who wrote "no orange" in her notes never sees an orange item; a Classic and a Glam woman get demonstrably different sets from the same slot; no set of six contains more than one item two price bands above its median; a woman whose filters leave fewer than 4 items gets the named-constraint message rather than an empty screen.

---

## What this fixes, and what it doesn't

**Fixes:** the archetype does real work. Every curated item exists at a real price. Never-wear becomes an enforced rule rather than a request. Sizes finally matter, and price becomes deliberate rather than random. Links go to product pages, which convert far better than search pages. And your voice — the actual asset — is on every single recommendation.

**Doesn't fix:** breadth. Two hundred items is not all of retail, and a woman looking for something specific will still fall through to the AI. Stock can go stale between checks. And it costs your time, which is the scarcest thing you have.

**The honest trade:** you're swapping infinite pretend coverage for narrow real coverage. I think that's the right trade for you specifically, because narrow-and-real is what a stylist *is* — nobody hires one to be shown everything.
