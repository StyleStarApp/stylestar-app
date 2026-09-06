# Style Star — store scoring brief

**What this is:** everything needed to add a new store to Style Star, written so it can be
handed to another tool (ChatGPT) to draft, and then corrected by Catherine.

⚠️ **CLAUDE NEVER INVENTS A STORE'S TAGS.** A draft she approves is not an invention; a tag
that appears without her seeing it is. This document exists so the drafting can happen
somewhere fast, and the judging still happens with her.

---

## 1. THE RULES A STORE MUST PASS FIRST — business model, before any scoring

A store must be a place a woman can browse and **BUY AND KEEP** a specific item.
**Three standing exclusions, all Catherine's explicit calls:**

1. **No subscription styling boxes** — Stitch Fix, Dia&Co, Trunk Club, Wantable, Fabletics.
   *"No subscription boxes I cannot stand those things."* A box picks FOR her; Style Star
   helps her see and choose for herself.
2. **No rentals** — Rent the Runway, Nuuly. *"No rentals either, same reason."*
3. **No fast fashion** — Shein, Temu, Cider, Princess Polly, Meshki, Peppermayo, Cotton On.
   **Also excluded on the same grounds: Fashion Nova, boohoo, Ardene.**

**Also excluded, for a different reason: resale and marketplaces** — eBay, Poshmark, Mercari,
ThredUp, Vestiaire, Depop, Etsy. A woman cannot reliably buy a specific item in a specific
size from a listing that is one person's wardrobe.

⚠️ **Walmart was deliberately left out as a quality call and is still Catherine's to make.**

▶ **Check the BUSINESS MODEL, not just whether the search URL works.** A working URL on the
wrong kind of company is still wrong.

---

## 2. WHAT EVERY STORE NEEDS — five fields

| Field | What it is |
|---|---|
| **Price tier** | `$` `$$` `$$$` `$$$$`, or a range like `$$-$$$$` for a store that genuinely spans |
| **Archetype** | 1–2 short style labels, Catherine's own vocabulary (list below) |
| **Sizes carried** | any of `petite` `plus` `tall` `wide` (wide = shoe widths). Blank if none |
| **Best for** | free text, the categories this store is genuinely a go-to for |
| **10 scores** | the dimension set below, each **1–10** |

*(A search URL is also needed but that is Claude's job, not hers.)*

---

## 3. THE 10 SCORES — 4 PAIRS + 2 SINGLES, and the set is COMPLETE

Always in this exact order:

```
relaxed, alluring, polish, classic, trendy, casual, dressy, fitted, neutral, colorful
```

⚠️ **The order reads oddly on purpose.** `relaxed` replaced an earlier single `fitted` score
in slot 0 and its partner was appended at the end. Keep the order exactly as written.

### The four PAIRS — score each side independently, 1–10

| Pair | Low end (1) | High end (10) |
|---|---|---|
| **relaxed** ↔ **fitted** | this store does almost nothing loose / almost nothing fitted | it is a real strength |
| **classic** ↔ **trendy** | " | " |
| **casual** ↔ **dressy** | " | " |
| **neutral** ↔ **colorful** | " | " |

▶▶ **SCORE BOTH SIDES SEPARATELY. THIS IS THE MOST IMPORTANT INSTRUCTION IN THIS DOCUMENT.**
A store can be high on both — Nordstrom is **8 classic AND 7 trendy** because it genuinely
serves both. Talbots is **10 classic, 1 trendy**.
⚠️ **Collapsed onto a single axis, a store that serves EVERYBODY looks identical to one that
serves NOBODY** — both land mid-scale. That is why these are pairs and not sliders.

### The two SINGLES

| Single | What it means |
|---|---|
| **alluring** | how body-conscious / revealing / sexy the store's clothes run. 1 = modest, 10 = overtly sexy. **This is a MATCH score, not a quality score** — it is used as a distance penalty, so a modest woman is kept away from a 10 and vice versa |
| **polish** | how refined and well-made the store is. 1 = rough, 10 = beautifully finished |

🚨🚨 **POLISH RANKS, IT NEVER MATCHES.** Everything else is TASTE; polish is QUALITY, and
**nobody wants less of it.** A woman who dresses casually wants the most refined CASUAL store,
not the least refined one. **Getting this backwards sends relaxed dressers to Old Navy.**

⚠️ **DO NOT SCORE ANY OTHER DIMENSION.** The set is deliberately complete. Every axis added
dilutes the others, and the twelve quiz sliders are not independent — scoring all of them
would make matching *worse*.

### Calibration, measured across the existing 108

| dimension | range used | mean |
|---|---|---|
| relaxed | 1–10 | 6.2 |
| alluring | 1–10 | 4.9 |
| polish | 4–10 | **8.1** |
| classic | 1–10 | 7.2 |
| trendy | 1–10 | 5.8 |
| casual | 1–10 | 6.9 |
| dressy | 1–10 | 6.1 |
| fitted | 2–10 | 6.4 |
| neutral | 2–10 | 8.0 |
| colorful | 1–10 | 6.3 |

▶ **Polish rarely goes below 4** because Catherine already excluded the stores that would
score lower. **Use the full 1–10 range on the others** — a table where everything is a 7 is
a table that cannot rank anything.

---

## 4. HER ARCHETYPE VOCABULARY — reuse these, do not invent new ones

Most used: **Universal · Casual Classic · Modern Minimalist · Classic Sophisticate ·
Glamorous Luxe · Elevated Natural · Coastal Chic · Quiet Luxury · Casual Everyday ·
Romantic Feminine · Bohemian Chic · Relaxed Feminine · Professional Power · Edgy Chic ·
Modern Glam · Trendsetter · Modern Chic · Luxury Fashion · Playful Chic · Athletic Luxe ·
Preppy Classic · Parisian Chic · European Chic · Resort Chic · Comfort Chic · Modern Luxe ·
Treasure Hunter · California Casual · Modern Sexy · Playful Classic**

**One or two, comma-separated.** e.g. `Quiet Luxury, Modern Minimalist`

---

## 5. THE OUTPUT FORMAT WANTED BACK

One row per store, pipe-separated:

```
Store Name | tier | archetype | sizes | relaxed alluring polish classic trendy casual dressy fitted neutral colorful | best for
```

Example, copied from a real existing entry:

```
Nordstrom | $$-$$$$ | Universal | petite plus tall wide | 8 5 9 8 7 7 8 8 10 9 | almost everything, dresses, shoes, denim, jewelry
```

---

## 6. AFFILIATE STATUS — live, and it is NOT used for ranking

🚨 **Commission data stays OUT of the app on purpose**, so picks are never biased toward what
pays best. This is here for Catherine's business planning only. **Her decision, 2026-09-06:
fit and price decide, full stop — even when two options are exactly equally good and one
earns and the other does not.**

- **✅ Rakuten, APPROVED (SID 4740535) — 7 stores:** Mytheresa · FARM Rio · Diane von
  Furstenberg · Vilebrequin · Olivela · Marissa Collections · Fleur du Mal
- **❌ Declined, all for TRAFFIC:** Impact (network level, 2026-08-20) · Bloomingdale's
  (2026-08-21) · Shopbop · Nordstrom (via Impact)
- **⏳ Pending on AWIN:** Jackie Mack Designs · TERI JON · Under Armour US
- **Not yet applied:** CJ (free), Nordstrom Creators, Amazon (apply last — 3 sales in 180 days)

⚠️ **A store does NOT need an affiliate program to be added.** A plain link to a public product
page needs nobody's permission. Approval only decides whether a click earns.

---

## 7. THE 108 STORES ALREADY IN — use these to calibrate

▶ **Do not re-score these; they are Catherine's own and are not to be "tidied".** They are here
so a new store can be scored *relative to* ones she has already judged.

| Store | Tier | Archetype | Sizes | relaxed alluring polish classic trendy casual dressy fitted neutral colorful | Best for | Affiliate |
|---|---|---|---|---|---|---|
| Abercrombie | $$ | Casual Trendy, Elevated Casual | petite tall | 6 6 7 5 8 9 4 8 8 6 | denim, dresses, everyday fashion |  |
| Alice + Olivia | $$$-$$$$ | Glamorous Luxe, Modern Glam | — | 2 9 9 6 10 3 10 10 5 10 | statement dresses, occasionwear |  |
| AllSaints | $$$ | Edgy Chic, Modern Minimalist | — | 4 8 9 5 9 6 8 9 9 3 | leather jackets, edgy contemporary fashion |  |
| Alo Yoga | $$$ | Modern Glam, Athletic Luxe | — | 3 8 8 4 9 10 3 10 7 8 | luxury activewear, athleisure |  |
| Altar'd State | $$ | Romantic Feminine, Bohemian Chic | — | 7 5 6 6 7 8 5 6 6 8 | dresses, casual feminine fashion |  |
| Amazon | $-$$$ | Universal | petite plus tall wide | 8 5 5 7 6 8 6 6 8 8 | almost everything, basics, accessories, shoes |  |
| Ann Taylor | $$ | Professional Power, Classic Sophisticate | petite tall | 3 3 9 10 2 4 8 8 10 3 | workwear, dresses, blazers |  |
| Anthropologie | $$-$$$ | Romantic Feminine, Bohemian Chic | petite plus | 8 6 8 6 8 7 7 5 6 9 | dresses, occasion, unique pieces |  |
| Aritzia | $$-$$$ | Modern Minimalist, Quiet Luxury | — | 5 6 9 7 8 7 7 9 9 5 | elevated basics, tailoring, outerwear |  |
| Athleta | $$ | Elevated Natural, Athletic Luxe | petite plus tall | 6 3 8 6 5 10 2 7 8 6 | activewear, travel, everyday performance |  |
| Baby Gold | $$ | Universal | — | 5 4 9 8 7 8 7 5 9 4 | solid 14K fine jewelry, personalized names and charms, diamo |  |
| Banana Republic | $$ | Classic Sophisticate, Modern Minimalist | petite tall | 4 4 9 9 4 5 9 8 10 4 | workwear, elevated basics, tailoring |  |
| Banana Republic Factory | $-$$ | Classic Sophisticate | petite tall | 5 3 7 8 3 7 6 7 9 4 | affordable workwear, tailoring, basics |  |
| Belk | $$ | Casual Classic | petite plus | 8 5 6 8 5 8 6 5 8 7 | everyday, dresses, shoes, jewelry |  |
| Bergdorf Goodman | $$$$ | Luxury Fashion | — | 2 9 10 10 9 2 10 10 10 9 | couture, designer, fine jewelry |  |
| Bloomingdales | $$$ | Modern Luxe | petite plus | 6 7 9 8 8 6 9 8 9 8 | designer, denim, shoes, jewelry | ❌ declined 2026-08-21 (traffic) |
| Boden | $$ | Playful Classic | petite tall | 6 3 8 9 5 6 7 6 6 9 | colorful dresses, prints |  |
| Chico's | $$ | Relaxed Classic | petite | 9 2 7 8 2 9 3 3 6 8 | travel pieces, easy separates |  |
| Coach | $$$ | Classic Sophisticate, Modern Luxe | — | 5 5 9 9 5 6 8 5 8 7 | leather handbags, wallets, accessories |  |
| COS | $$ | Modern Minimalist | — | 9 2 9 9 7 6 7 4 10 2 | architectural basics, tailoring |  |
| Cuyana | $$$ | Quiet Luxury, Modern Minimalist | — | 8 2 10 10 2 6 7 4 10 1 | leather handbags, timeless accessories |  |
| Diane von Furstenberg | $$$$ | Modern Glam, Romantic Feminine | — | 5 7 9 7 6 4 9 8 4 10 | wrap dresses, printed dresses, occasion, wedding guest | ✅ Rakuten |
| Dillard's | $$ | Classic Sophisticate | petite plus | 6 5 7 8 5 6 8 7 9 8 | dresses, occasion, workwear, jewelry |  |
| DSW | $$ | Universal | wide | 6 5 6 6 6 8 5 5 7 8 | shoes, handbags, accessories, extended widths |  |
| Eileen Fisher | $$$ | Elevated Natural, Modern Minimalist | petite plus | 10 1 9 10 1 8 6 2 10 2 | sustainable luxury, linen, relaxed tailoring |  |
| Eloquii | $$ | Modern Glam | plus | 6 7 8 6 7 5 8 8 7 8 | dresses, workwear |  |
| Etsy | $-$$$$ | Universal | — | 8 4 5 3 7 8 4 4 7 8 | handmade goods, vintage finds, personalized jewelry and gift |  |
| Everlane | $$ | Modern Minimalist, Elevated Natural | — | 9 2 9 9 4 8 5 4 10 2 | elevated basics, denim, outerwear |  |
| Everything But Water | $$$ | Coastal Chic, Glamorous Luxe | plus | 5 8 9 8 7 6 9 8 6 10 | designer swimwear, resort fashion |  |
| Express | $$ | Modern Glam, Professional Power | petite | 3 8 7 4 8 5 8 10 8 7 | going-out looks, workwear, denim |  |
| Faherty | $$$ | Coastal Chic, Elevated Natural | — | 10 2 8 7 3 10 3 3 8 6 | resortwear, knitwear, beach lifestyle |  |
| FARM Rio | $$$ | Playful Chic, Bohemian Chic | — | 7 7 8 3 10 7 7 5 2 10 | colorful dresses, vacation wear, statement prints | ✅ Rakuten |
| Fleur du Mal | $$$-$$$$ | Glamorous Luxe, Romantic Feminine | — | 1 10 8 1 10 2 4 10 6 6 | sexy lingerie, nightgowns, slips, robes, sleepwear, a small  | ✅ Rakuten |
| Frank & Eileen | $$$ | Elevated Natural, Coastal Chic | — | 10 2 9 9 2 10 3 2 10 2 | button-downs, relaxed luxury, travel |  |
| Free People | $$-$$$ | Bohemian Chic, Romantic Feminine | petite | 10 6 6 4 8 10 3 3 5 9 | boho fashion, sweaters, dresses |  |
| Gap | $-$$ | Casual Classic | petite plus tall | 10 2 6 7 3 10 2 4 8 4 | everyday basics, denim, casualwear |  |
| Garnet Hill | $$ | Elevated Natural | petite plus | 9 2 8 8 2 9 3 3 9 4 | natural fibers, sleepwear |  |
| Good American | $$$ | Modern Sexy | plus | 5 8 8 4 8 7 6 10 9 6 | premium denim, curve fit |  |
| Gorjana | $$ | Elevated Natural, Coastal Chic | — | 5 3 8 7 6 8 4 5 9 4 | everyday jewelry, layering pieces |  |
| Gucci | $$$$ | Glamorous Luxe, Luxury Fashion | — | 3 10 10 8 10 4 10 9 8 10 | designer handbags, shoes, belts, accessories |  |
| H&M | $ | Trendsetter, Casual Everyday | plus | 7 5 5 3 9 8 4 6 6 8 | affordable trends, basics |  |
| IZOD | $$ | Casual Classic | — | 8 2 6 8 2 9 3 5 8 5 | polos, golfwear, casual basics |  |
| J.Crew | $$ | Classic Sophisticate, Playful Classic | petite tall | 5 3 9 10 3 7 8 8 9 6 | timeless classics, workwear, denim, dresses |  |
| J.Jill | $$ | Elevated Natural | petite plus tall | 10 1 8 8 1 10 2 2 10 3 | linen, relaxed essentials |  |
| J.McLaughlin | $$$ | Coastal Classic, Resort Chic | — | 6 3 9 10 2 6 7 6 8 7 | resortwear, polished casual, prints |  |
| Jenni Kayne | $$$$ | Elevated Natural, Quiet Luxury | — | 10 2 10 10 2 8 5 3 10 2 | luxury casualwear, cashmere, sweaters |  |
| Johnny Was | $$$ | Bohemian Chic, Elevated Natural | petite plus | 10 4 8 5 6 9 4 3 4 10 | embroidered tops, resortwear, relaxed luxury |  |
| Kendra Scott | $$ | Playful Chic, Modern Glam | — | 5 5 7 6 7 7 6 5 5 10 | fashion jewelry, gifts, statement earrings |  |
| Lacoste | $$$ | Classic Sport, Preppy Classic | — | 7 3 8 9 4 8 4 6 8 6 | polos, casual sportswear, sneakers |  |
| Lands' End | $$ | Classic Casual | petite plus tall | 10 1 6 8 1 10 2 3 9 5 | swimwear, outerwear, basics, uniforms |  |
| Lane Bryant | $$ | Casual Classic | plus wide | 8 4 6 6 4 8 4 6 8 7 | bras, denim, basics |  |
| Levi's | $$ | Casual Classic | petite plus | 6 3 7 8 5 10 2 7 9 4 | denim, casualwear, jackets |  |
| LOFT | $$ | Casual Classic | petite plus tall | 8 3 7 8 3 8 5 5 8 5 | relaxed workwear, denim |  |
| LoveShackFancy | $$$$ | Romantic Feminine, Playful Chic | — | 7 8 9 6 9 5 9 6 4 10 | feminine dresses, occasion, florals |  |
| Lululemon | $$$ | Elevated Natural, Athletic Luxe | — | 4 6 8 5 7 10 2 9 7 8 | premium activewear, athleisure |  |
| M.M.LaFleur | $$$ | Professional Power, Modern Minimalist | plus | 2 3 10 10 3 3 10 9 10 2 | executive workwear, tailoring |  |
| Macy's | $$ | Classic, Everyday | petite plus tall wide | 7 5 6 8 6 7 7 6 8 8 | everyday, dresses, shoes, handbags, jewelry |  |
| Madewell | $$ | Elevated Natural, Casual Classic | petite plus tall | 10 3 8 7 5 10 3 5 8 6 | denim, casual essentials, leather goods |  |
| Mango | $$ | Modern Minimalist, European Chic | — | 5 6 8 6 8 6 7 8 8 7 | workwear, elevated trends, outerwear |  |
| Marine Layer | $$ | Casual Classic, Elevated Natural | — | 10 2 7 6 4 10 2 3 8 5 | soft basics, casualwear, weekend style |  |
| Marissa Collections | $$$$ | Glamorous Luxe | — | 3 8 10 8 8 3 10 8 9 9 | designer dresses, fine jewelry, shoes, sunglasses, jackets a | ✅ Rakuten |
| Mejuri | $$$ | Quiet Luxury, Modern Minimalist | — | 5 2 10 9 5 7 5 5 10 2 | fine jewelry, everyday essentials |  |
| Mytheresa | $$$$ | Luxury Fashion, Universal | — | 9 5 10 9 9 2 10 9 9 9 | designer fashion across every style, bags, shoes and jewelry | ✅ Rakuten |
| Naturalizer | $$ | Classic Sophisticate, Comfort Chic | wide narrow | 6 2 8 9 2 7 6 5 8 5 | comfortable dress shoes, work shoes |  |
| Neiman Marcus | $$$$ | Glamorous Luxe | — | 3 9 10 9 8 3 10 9 10 9 | designer, evening, shoes, fine jewelry |  |
| NET-A-PORTER | $$$$ | Luxury Fashion, Quiet Luxury | — | 4 9 10 9 9 3 10 8 10 9 | luxury designer clothing, handbags, shoes |  |
| Nordstrom | $$-$$$$ | Universal | petite plus tall wide | 8 5 9 8 7 7 8 8 10 9 | almost everything, dresses, shoes, denim, jewelry | ❌ declined via Impact (traffic) |
| Nordstrom Rack | $-$$ | Universal | petite plus wide | 8 5 7 7 6 8 6 7 9 8 | designer deals, shoes, denim, jewelry |  |
| NYDJ | $$$ | Classic Sophisticate | petite plus | 6 3 8 8 3 8 4 8 9 4 | premium denim, flattering fit |  |
| Old Navy | $ | Casual Everyday | petite plus tall | 10 2 4 5 4 10 1 3 7 6 | budget basics, activewear, family essentials |  |
| Olivela | $$$$ | Luxury Fashion, Glamorous Luxe | — | 5 6 10 7 7 4 8 6 8 7 | unique jewelry, bags, shoes, resort wear, swimwear, silk sle | ✅ Rakuten |
| Petite Studio | $$$ | Modern Minimalist | petite | 4 4 9 8 6 5 8 8 9 4 | petite tailoring, dresses |  |
| Quay | $$ | Trendsetter, Modern Glam | — | 5 7 6 3 10 8 5 5 6 9 | fashion sunglasses |  |
| Quince | $$ | Quiet Luxury, Elevated Natural | plus | 9 2 9 10 3 8 6 4 10 2 | cashmere, linen, silk, luxury basics |  |
| Rag & Bone | $$$ | Edgy Chic, Modern Minimalist | — | 6 5 9 7 8 7 6 7 9 4 | premium denim, modern essentials |  |
| Rails | $$$ | Elevated Natural, California Casual | — | 9 3 8 6 5 9 4 4 8 5 | soft shirts, dresses, casual luxury |  |
| Reformation | $$$ | Romantic Feminine, Modern Chic | petite plus | 3 9 9 6 9 5 9 10 7 8 | dresses, sustainable fashion, occasion |  |
| Revolve | $$$ | Glamorous Luxe, Trendsetter | — | 2 10 8 2 10 4 10 10 7 9 | occasion dresses, vacation, designer contemporary |  |
| Sachin & Babi | $$$$ | Glamorous Luxe, Classic Sophisticate | plus | 6 5 10 8 5 1 10 8 9 8 | evening gowns, mother of the bride, wedding guest, occasion |  |
| Saks | $$$$ | Glamorous Luxe | petite plus | 3 9 10 8 9 3 10 9 10 9 | designer, bags, occasion, fine jewelry |  |
| Sam Edelman | $$$ | Modern Chic, Classic Sophisticate | — | 5 6 8 7 7 6 8 7 7 7 | fashion shoes, boots, sandals |  |
| Sézane | $$$ | Parisian Chic, Romantic Feminine | — | 6 5 9 9 7 6 7 7 8 7 | knitwear, blouses, timeless french style |  |
| Shopbop | $$$ | Modern Chic, Trendsetter | — | 5 7 8 6 9 6 8 8 8 8 | contemporary designers, denim, shoes | ❌ declined (traffic) |
| SKIMS | $$$ | Modern Glam, Modern Minimalist | plus | 2 10 8 3 10 8 4 10 9 4 | shapewear, loungewear, basics |  |
| Soft Surroundings | $$ | Relaxed Feminine | petite plus tall | 10 2 6 7 1 10 2 2 8 5 | soft knits, travel |  |
| Soma | $$ | Relaxed Feminine | plus | 5 5 8 7 4 9 3 7 8 5 | bras, lingerie, sleepwear |  |
| Spanx | $$$ | Modern Minimalist, Professional Power | plus | 2 6 9 7 8 7 5 10 9 4 | shapewear, leggings, smoothing basics |  |
| Summersalt | $$ | Modern Minimalist, Coastal Chic | plus | 4 7 8 6 7 8 5 9 7 8 | swimwear, resortwear, travel |  |
| Sunglass Hut | $$-$$$$ | Universal | — | 5 5 8 7 8 6 7 5 7 8 | designer sunglasses, eyewear |  |
| Talbots | $$ | Classic Sophisticate | petite plus | 6 2 9 10 1 6 7 6 9 5 | timeless workwear, knits |  |
| Target | $ | Casual Everyday | petite plus tall | 9 3 5 6 6 10 4 5 8 8 | affordable fashion, basics, accessories |  |
| Theory | $$$ | Modern Minimalist, Professional Power | — | 2 3 10 10 4 3 10 9 10 2 | tailoring, workwear, luxury basics |  |
| Tiffany & Co. | $$$$ | Luxury Fashion, Classic Sophisticate | — | 5 6 10 10 4 2 10 5 9 6 | fine jewelry, luxury gifts |  |
| TJ Maxx | $ | Treasure Hunter | plus | 8 5 5 5 6 9 5 6 8 8 | value finds, handbags, shoes |  |
| Tommy Bahama | $$$ | Coastal Chic, Elevated Natural | — | 10 2 8 7 2 10 3 3 7 8 | resortwear, vacation clothing, linen |  |
| Torrid | $$ | Casual Trendy | plus | 7 8 7 4 8 8 5 8 7 8 | denim, everyday, lingerie |  |
| Tory Burch | $$$ | Classic Sophisticate, Coastal Chic | — | 5 5 9 9 6 6 8 6 8 8 | handbags, shoes, workwear, resort |  |
| Tuckernuck | $$$ | Classic Sophisticate, Coastal Chic | — | 6 5 9 9 5 5 9 7 8 8 | dresses, polished separates, occasion, resort |  |
| Uniqlo | $ | Modern Minimalist | — | 8 2 8 8 5 8 4 5 10 3 | basics, layering pieces, outerwear |  |
| Universal Standard | $$ | Modern Minimalist | plus | 7 4 8 7 5 7 6 7 9 6 | tailoring, elevated basics |  |
| Veronica Beard | $$$$ | Professional Power, Classic Sophisticate | — | 3 8 10 9 8 4 10 10 9 7 | blazers, premium denim, elevated separates |  |
| Vilebrequin | $$$$ | Coastal Chic, Playful Chic | — | 9 6 7 8 6 8 5 5 3 10 | swimwear, resortwear, beach cover-ups, vacation dresses | ✅ Rakuten |
| Vince | $$$ | Quiet Luxury, Modern Minimalist | — | 7 2 10 10 4 6 8 7 10 2 | luxury basics, knitwear, outerwear |  |
| Vuori | $$$ | Elevated Natural, Coastal Chic | — | 8 3 8 6 6 10 2 5 9 4 | premium athleisure, casual basics |  |
| Warby Parker | $$ | Modern Minimalist | — | 5 2 9 9 5 8 4 5 8 6 | prescription glasses, sunglasses |  |
| White House Black Market | $$ | Professional Power, Modern Glam | petite | 3 7 9 8 6 4 9 9 10 2 | sleek workwear, occasion |  |
| Zappos | $$ | Universal | wide narrow | 6 5 7 6 5 9 5 5 7 8 | shoes, sneakers, boots, comfort footwear, extended widths |  |
| Zara | $$ | Trendsetter, Modern Chic | — | 5 7 7 3 10 6 7 9 7 8 | fashion-forward trends, statement pieces |  |
---

## 8. WHAT TO ASK FOR

**Catherine's goal, her words 2026-09-06:** *"I want the searches to be amazing and able to
find users what they want."* Target is **~200 stores**, up from 108.

**So the ask is:** propose stores that pass section 1, are not already in section 7, and would
genuinely widen what a woman can be shown — **especially mid-market and affordable**, since
every currently-fed store is `$$$`/`$$$$` and that is the app's real gap.

⚠️ **Measured priority from a 400-result live test (2026-09-06):** the single highest-value
addition was **Kohl's** (appeared in 8 of 10 searches). **Zara** was the other confirmed add.
Both are approved by her and still need the scores above.

⚠️ **Nothing here is final until Catherine has read it.** Anything she has not seen does not
go in.
