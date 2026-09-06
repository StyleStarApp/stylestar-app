# Style Star — Project Notes

Style Star is a personal style-quiz web app ("Align your style. Shine your light.").
A user takes a quiz (and/or uploads a photo), gets an AI-generated personal style
write-up, can chat with an AI stylist, see outfit/shopping ideas, and save results
by email.

---

## ▶ NEXT SESSION — START HERE (2026-09-06 — WE MEASURED A WAY TO SHOP ALL 108 STORES WITHOUT A SINGLE NEW APPROVAL)

### ⭐⭐⭐ THE ONE-LINE SUMMARY, AND IT IS THE FIRST LEVER FOUND THAT IS NOT BLOCKED ON TRAFFIC
▶▶ **A REAL TEST WAS RUN AGAINST A LIVE SHOPPING-SEARCH SERVICE, 11 SEARCHES, AND IT RETURNS REAL,
BUYABLE, AFFORDABLE PRODUCTS FROM HER OWN 108 STORES — INCLUDING THE 101 SHE IS NOT AN AFFILIATE FOR.**
🚨 **NOTHING WAS BUILT. NO APP CODE WAS CHANGED. This entry is a measurement, not a feature.**
▶ **Her framing, and it should govern the build:** ***"The service finds. Style Star chooses."*** The
service is a $25/mo commodity anyone can buy; her twelve dimensions, her never-wear list and 20 years of
judgement are the part no competitor can. **Finding is bought. Choosing is hers.**

### 🚨 WHY THIS CAME UP — HER QUESTION, AND IT WAS THE RIGHT ONE
She asked how Style Star could answer ***"Find me a women's red leather boot, size 6, wide width"*** with
REAL products and DIRECT product links, instead of the AI inventing a plausible name and opening a store
SEARCH page. **Measured against the existing app, the answer was: it cannot, and for a structural reason.**
- ⚠️ **`netlify/functions/product-search.js` ACCEPTS ONLY A SLOT ID** (`/^[a-z]{2}[0-9]{1,2}$/`). The only
  question the catalog can be asked is *"give me the pool for Ankle boots"*. **There is no free-text door
  at all**, and colour/material/size cannot be filtered even though they are stored.
- ⚠️ **AND THE FEED IS WIRED INTO EXACTLY ONE PLACE** — the Wardrobe Ideas carousels. Chat, Shop your
  Style and Complete the Look never call it. **That is HER deliberate scope call and it still stands.**
- ✅ **WHAT THE FEED CAN ALREADY VERIFY:** boot (`slots`, tagged at ingest) · size 6 (`product_sizes`,
  265,774 real sizes) · red (`color`, 663 values, 15% blank, case-inconsistent, FARM Rio's column is a
  PRINT NAME) · leather (`material`, free text, 25,209 spellings — good as a substring).
- ❌ **WIDTH DOES NOT EXIST ANYWHERE IN THE PIPELINE.** Grepped end to end: the only "wide" in the whole
  feed system is **wide-leg pants**, a trouser cut. Rakuten's 38 columns never carried it.
- ▶ **`description` IS PARSED AND THEN THROWN AWAY** — `db/products.sql` says so on purpose and predicted
  this exact moment: *"ADD IT BACK the day the stylist chat queries this catalog."* One `alter table`.

### ✅ THE MEASUREMENT THAT CHANGED THE STRATEGY — HER OWN STORE TABLE IS ALREADY MID-MARKET
▶▶ **Of her 108 `STORES` entries, 57 START AT `$$` OR BELOW. Only 15 are `$$$$` throughout.**
🚨 **HER FEED IS 7 STORES AND EVERY ONE IS `$$$`/`$$$$`.** ▶ **So the affordability problem was NEVER her
taste or her curation. She already picked a broad, affordable set of shops — the feed just reaches the
dearest seventh of them, because those are the ones that approved her.** A search across all 108 fixes
the price problem **with no new affiliate approval at all.**
⭐ **AND SHE ALREADY TAGGED WHICH STORES CARRY WIDE WIDTHS, back in July — 8 of them:** Nordstrom ·
Macy's · Nordstrom Rack · Amazon · Naturalizer · Lane Bryant · Zappos · DSW. **She answered the width
question months ago; the app just never used her answer to FIND anything.**

### ✅ THE LIVE TEST — SerpApi (Google Shopping), free tier, 11 of 250 searches used
🔒 **Account is `catherine@stylestar.app`, FREE plan, no card, `plan_searches_left` 239.** The key lived
only in the session scratchpad, was never committed, and **she should regenerate it on serpapi.com.**
▶ **Raw JSON and the scorer are in the session scratchpad only — NOT committed.** Re-runnable from this
entry alone.

| search | from HER 108 | resale junk | price range |
|---|---|---|---|
| Women's blazer | **30/40** ⭐ | 1 | $11–$198 |
| Petite black trousers | **30/40** ⭐ | 0 | $17–$135 |
| Jumpsuit | 27/40 | 0 | $15–$198 |
| Black leather tote | 23/40 | 0 | $80–$595 |
| Black ankle boots | 20/40 | 1 | $20–$1,295 |
| White sneakers size 8 | 16/40 | 3 | $10–$168 |
| White shirt under $50 | 15/40 | 8 | $4–$50 |
| **Red leather boot, size 6, wide** | **8/40** ⚠️ | 12 | $23–$665 |
| **Blush silk wrap dress** | **5/40** ⚠️ | 15 | $15–$695 |
| Emerald silk opera gloves | 4/40 | 9 | $3–$260 |

🚨🚨 **THE FINDING THAT MUST SHAPE THE BUILD, AND IT IS THE OPPOSITE OF THE OBVIOUS DESIGN: THE MORE
SPECIFIC THE SEARCH, THE WORSE THE STORE MATCH.** Her own red-boot sentence was the second-worst of the
ten. Piling colour + material + size + width into one query pushes Google toward **eBay and Poshmark**,
because that is where oddly-specific one-off items live. ▶▶ **SO: SEARCH BROAD, NARROW AFTERWARDS.**
"Red leather boots" then check sizes — never the whole sentence as one query. **Only a test could have
found this; every instinct says pass the full sentence through.**
⭐ **AFFORDABILITY, PROVEN WITH REAL ROWS** (white shirt under $50, her stores only): Old Navy **$13.99** ·
Target **$17.50** · Target $19.60 · Old Navy $20.99 · Macy's $23.70 · Express $30.00 · Lands' End $30.36 ·
Quince $39.90 · Macy's $49.99. **Against a feed whose dress median is $398.**
✅ **THE MENSWEAR GUARD HELD ON THE NEW SOURCE: 0 of 40 menswear-named titles on "women's blazer."** One
query only, so it is a green light, not a proof. **A third picker still needs the rule and the test.**
✅ **PETITE CAME BACK REAL:** LOFT · Ann Taylor · Talbots · Gap — her actual petite retailers, unprompted.

### ✅ DIRECT PRODUCT LINKS WORK, BUT COST A SECOND CALL
⚠️ **The search results carry NO retailer link** — only a Google redirect. A **second call per product**
returns the real offers, and those are excellent:
```
DSW · $251.99 · "In stock online" · 60-day returns
dsw.com/product/naturalizer-deesha-boot/567667?...&size=6&width=...
```
▶ **Real page, size preselected, LIVE STOCK STATUS.** ⚠️ **COST MODEL: ~1 search + ~4 product look-ups
per woman's question ≈ 5 searches ≈ 15¢ at the $25/1,000 plan.** The free 250 is ~40 questions.

### 🚨🚨 TWO TRAPS FOUND, AND BOTH ARE THE "WOMEN'S CONTAINS MEN" SHAPE AGAIN
1. ⚠️⚠️ **"WIDE" MEANS TWO DIFFERENT THINGS IN SHOES, AND ONE PRODUCT CARRIED BOTH.** DSW's own title
   read *"Naturalizer **Wide Width** Deesha Boot … Size 6"* while its own link said
   `width=Medium Width, **Wide Calf**`. **Wide calf is the shaft; wide width is the foot. Different
   fits, and the shop's data disagreed with itself.** ▶ **A naive `contains("wide")` tells a woman with
   wide feet that a medium-width boot fits her.** This is exactly the promise her whole app exists to
   never make.
2. ⚠️ **"W" USUALLY MEANS WOMEN'S, NOT WIDE.** Three results read *"Size W 7"* — a women's 7.
▶▶ **NEITHER IS AN ARGUMENT AGAINST THE PLAN. Both are arguments FOR her rule:** say confirmed only when
it is genuinely confirmed, and never infer a fit from a word that has two meanings.
⚠️ **ALSO: the search asked for LEATHER and the best match was SUEDE**, and asked for RED and got
"Mahogany". **Verification has to read the offer, not trust the query.**

### ▶▶ THE AGREED EXPERIENCE, IN HER WORDS AND APPROVED BY HER THIS SESSION
1. The AI reads her sentence into a checklist (item · colour · material · size · width). **It invents nothing.**
2. **The service FINDS** real products. ← the only new piece
3. **Her 108-store allowlist throws away everything else** — and it already excludes fast fashion,
   rentals and subscription boxes, because those were never in the table.
4. **Each product is CHECKED against the checklist — comparing facts, never guessing.** No tick without
   evidence.
5. **`curatedPicks()` runs — the SAME picker**, never a copy. Never-wear, colour no's, price spread,
   max-two-per-retailer.
6. **Her sliders and her store dimensions order the results.**
🚨🚨 **AND THE ANSWER SHE GAVE TO THE HARD QUESTION — what if red, leather and size 6 verify but WIDTH
CANNOT?** Not hide it (she sees nothing), **not show it silently (THAT IS THE SHIFT-DRESS BOX)** — but
**show it, labelled honestly, confirmed ones first.** Her stylist voice: *"These three I can confirm in
your width. These two are worth a call to check."* ▶ **HER RULE, GIVEN THIS SESSION, VERBATIM: never
imply that a specific size, width, colour, material or other requirement is confirmed unless we can
actually verify it.**

### ▶ WHAT IS STILL OPEN ON THIS, AND WHAT THE NEXT SESSION SHOULD ASK HER FIRST
1. ✅✅ **HER VERDICT IS IN, 2026-09-06: "MIXED — THE DVF IS RIGHT, BUT THE REST AREN'T CLOSE ENOUGH TO
   WHAT I WOULD WANT STYLE STAR TO RECOMMEND AS MATCHES."** Her call on the service itself: ***"promising,
   but we need to work on the search and filtering so Style Star is much more precise about what the woman
   actually asked for."*** ▶ **SO THE SERVICE IS NOT THE PROBLEM AND IS NOT ON TRIAL ANY MORE. PRECISION IS
   THE WORK.**
   🚨🚨 **AND THE FIRST ATTEMPT AT PRECISION WAS MEASURED AND IT FAILED IN THE MOST INSTRUCTIVE WAY
   POSSIBLE. Strict title filtering — must say silk, must be a real wrap, must say blush — passes ZERO of
   the 5 results from her stores, INCLUDING THE DVF SHE APPROVED.** The DVF is *"Jeanne Silk Jersey Wrap
   Dress"*: **the colour is not in the title at all**, it is a variant one level down. Meanwhile the two
   Etsy dresses DO pass wrap+blush and fail only on silk. ▶▶ **SO A STRICTER TEXT MATCH KEEPS THE WORSE
   RESULTS AND DELETES THE BEST ONE. Precision must come from BETTER DATA (the per-product second call,
   which carries real colour, material and variants) AND FROM JUDGEMENT — never from tighter string
   matching on a title.**
   ⚠️ **THE TWO FAULTS SHE SPOTTED ARE BOTH STYLIST KNOWLEDGE, NOT STRING BUGS: "FAUX-WRAP IS NOT A WRAP"
   and "SATIN IS NOT SILK" (satin is a WEAVE, silk is a FIBRE — a stylist distinction a text filter cannot
   make).** Any precision work has to encode those, and there will be more of them.
   ▶ **THE FIVE SHE RULED ON, kept because they are the benchmark any precision work must beat:**
   Nordstrom Rack $123.72 DVF Jeanne Silk Jersey Wrap (**the one she approved**) · Nordstrom $598 Kobi
   Halperin *faux*-wrap · Quince $80 stretch **satin**, not silk · Etsy $318 · Etsy $334.
2. ▶ **IF SHE SAYS YES:** the shape is known — search broad · filter to her 108 · drop resale and
   second-hand · verify per-offer · **route through `curatedPicks()`, never a second copy of her rules.**
3. ▶ **IF THE BLUSH DRESS DISAPPOINTS HER:** the fault is the AI's SEARCH WORDS, not the service. Also
   cheaply testable, 239 searches remain.
4. ⚠️ **THIS WOULD BE A THIRD PICKER.** The 2026-09-06 lesson is absolute: **a rule applied to one half
   is not applied.** It needs a ledger row and a test BEFORE it ships, not after.
5. ▶ **FREE AND UNMEASURED: how many of her 108 run on Shopify.** Shopify stores publish a public
   product file with **exact variant size + stock**, no API and no cost — real width/size truth for the
   DTC half of her list. **Nobody has counted yet.**
6. ⚠️ **THE LEGAL POSITION, MEASURED NOT ASSUMED:** Google sued SerpApi; **in July 2026 the court GRANTED
   SerpApi's motion to dismiss**, striking the DMCA claim for results with no copyrighted content, with
   no leave to refile. Google amended in August, narrowed to *licensed* content (Reddit snippets in
   Knowledge Panels). ▶ **Product listings are facts — the strongest side of a ruling that already went
   against Google.** Still live litigation. **Mitigation: keep the integration behind ONE small swappable
   piece so changing vendor is an afternoon.** ⚠️ SerpApi's legal shield does NOT cover the $25/$75 tiers.
7. ▶ **THE RUNNER-UP IF SerpApi DISAPPOINTS: SearchApi** — same $25, ~10× the searches. Test second;
   search QUALITY matters more than volume while she has no users.
8. ✅✅ **STORE EXPANSION — HER DECISION, 2026-09-06: ADD KOHL'S AND ZARA.** Measured from the 400 test
   results: **178 (44%) already came from her 108.** ⭐ **KOHL'S ALONE IS +28 AND APPEARED IN 8 OF THE 10
   SEARCHES** — one store worth as much as the next nine candidates combined. Zara is +4 and was flagged
   as an anomaly (**H&M was on her list and Zara was not**; she confirmed it should be). ▶ **Both still
   need HER TAGS before they go in — price tier, archetype, sizes, strengths and the 10 dimension
   scores. `scripts/store-draft.js` drafts from neighbours she already scored; she corrects. NEVER
   invent them.** ⚠️ **NOT ADDED and deliberately: Fashion Nova · boohoo · Ardene — FAST FASHION, her
   standing exclusion. Walmart was left out as a quality call and is still hers to make.**
   🚨 **THE SHAPE OF THE GAIN IS A POWER LAW, so do NOT bulk-add: 98 of the 123 missing sources appeared
   exactly ONCE in 400 results.** Ten adds would take coverage 44% → 60%; the long tail is worthless.
   ⚠️⚠️ **AND EXPANSION FIXES VOLUME, NOT JUDGEMENT: her "blush silk wrap dress" search gained ZERO
   results from all ten candidate stores.** That query failed because it is hard to ASK FOR, not because
   shops were missing. **Adding stores will never fix a wording problem.**

### ▶ WHAT SHE NEEDS TO DECIDE / WHAT HAPPENS NEXT — every one of these is still open
1. ✅✅ **HER TWELVE SLIDER POSITIONS — RECORDED 2026-09-08, THE ASK IS CLOSED.** She sent her Style
   Signature screenshot. **Read off the pixels, not estimated:** the track spans x=368..1040 on the
   retina screenshot and **every one of the twelve knobs lands within 0.025 of a whole slider stop**,
   which is what proves the scale is right rather than merely plausible.
   ```
   answers = [8, 7, 6, 9, 7, 6, 7, 7, 8, 10, 7, 9]
   ```
   | # | Slider | Her value |
   |---|---|---|
   | 0 | Style direction · Classic→Trendy | **8** leaning trendy |
   | 1 | Overall vibe · Natural→Glam | **7** slightly glam |
   | 2 | Style flavor · Preppy→Edgy | **6** a mix of both |
   | 3 | Outfit complexity · Simple→Detailed | **9** mostly detailed |
   | 4 | Dress level · Casual→Dressy | **7** slightly dressy |
   | 5 | Lifestyle · Sporty→Professional | **6** a blend of both |
   | 6 | Color preference · Neutral→Colorful | **7** slightly colorful |
   | 7 | Pattern preference · Solids→Prints | **7** slightly print-forward |
   | 8 | Fit preference · Relaxed→Fitted | **8** leaning fitted |
   | 9 | Style priority · Comfort→Style | **10** very style-driven |
   | 10 | Modesty level · Modest→Alluring | **7** slightly alluring |
   | 11 | Presence · Understated→Statement | **9** strong presence |
   ▶ **Her derived matching profile, through the app's own formulas** (`_herDims()`):
   **alluring 6.40 · trendy 0.70 · dressy 0.60 · fitted 0.70 · color 0.60.**
   ⭐ **THIS IS THE PROFILE TO MEASURE GATE 2 AND ANY STORE RANKING AGAINST FROM NOW ON.** The five
   profiles used in the 2026-09-07 Gate 2 measurement were Claude's approximations; **these are hers.**
   ⚠️ **NEVER ARCHIVE THIS.** It is a fact she supplied, not a build that happened — and it was asked
   for twice before because nobody wrote it down. **Re-ask only if she says she has retaken the quiz.**
2. ⚠️ **STILL TRUE AND FIXED BY NO CODE: the prices.** Every fed store is `$$$`/`$$$$`. Live medians:
   **dresses $398 · tops $260 · shoes $790 · bags $1,490**; 0 of 200 dresses under $100. **No filter
   makes Mytheresa affordable — only an affordable or mid-market affiliate does.**
   🚨 **AND NOT UNDER ARMOUR — HER CORRECTION, 2026-09-08, MEASURED AND UPHELD.** *"That is only sporty
   workout clothes."* It reaches ~13 of her 100 rows and none of the 75 that hurt. **All three pending
   AWIN applications are activewear, jewellery and eveningwear, so none of them moves this.** The fix is
   a mid-market GENERALIST or a department store — which is what declined her, for traffic. **The answer
   is users.**
3. ▶ **THE TAXONOMY GAPS THAT ARE HERS TO DECIDE, none invented:** mini skirts · jumpsuits/rompers ·
   gloves · clogs · wellingtons · bags named only "Bag". **Plus four defaults set for her and confessed:**
   a plain "Sandal" → Flat sandals · a plain "Boot" → Ankle boots · a plain "Hat" → Sun hats · a plain
   "Skirt" → Flowy skirt. **And two rows that are honestly EMPTY:** `ac11` Matching athletic sets and
   `sl2` Nightgowns.
4. ⚠️ **THE FEED STILL CARRIES NO WIDTH DATA AT ALL**, so fed shoes cannot be ranked for width. Shoe
   width is built and tested on her 107; that is a question for a future merchant's feed, not code.
5. ▶ **THE STORE-TAGGING HELPER IS BUILT: `scripts/store-draft.js`** (16 checks, `scratchpad/storedraft.js`).
   `node scripts/store-draft.js --list`, then `node scripts/store-draft.js "New Store" --like "A,B,C"`.
   ⚠️ **It DRAFTS, it never writes.** ▶ **THE STANDING PROPOSAL, her words 2026-09-07:** *"I want to be
   able to get approved for more affiliates and be able to add them without having to go through all."*
   **Adding a Rakuten merchant is FOUR edits and three are mechanical**; only the `STORES` entry needs
   her. **Draft all twelve from stores she already scored, show the neighbours, she corrects.**
   ⚠️ **This does NOT break "never invent a store's tags" — the Garnet Hill lesson was about inventing
   SILENTLY. A draft she approves is not an invention.**
6. ✅ **VILEBREQUIN STAYS — HER DECISION, 2026-09-08.** Her words: ***"I think it is fine to keep
   Vilebrequin. It should not come often but since they approved us I think it is fine to keep them in
   our mix."*** ▶ **So this is settled and is NOT to be reopened as a bug.** Its feed is majority
   menswear (301 Male / 156 Female / 70 Unisex; 529 rows in, **188 kept**), and the womenswear guard now
   holds on both the column and the name. ⚠️ **"It should not come often" is already how the shelf
   behaves** — the feed ceiling caps the feed at a third of any row and `_storeCap('compare')` allows
   ONE card per store — **so nothing further is needed, and nothing should be added to suppress it.**
7. ⚠️ **SHOPBOP AND BLOOMINGDALE'S ARE STILL BEING SHOWN AS STORES, AND BOTH REJECTED HER.** Those taps
   earn **$0** today. ▶ **NOT A BUG — commission data stays OUT of the app on purpose** so picks are
   never biased by what pays best (standing rule, 2026-07-27). Recorded so nobody "fixes" it, and so she
   knows what she is looking at.

### ⚠️ THE CLONE QUIRK, IT WILL HAPPEN AGAIN
**The session's LOCAL `main` is a stale checkout with unrelated history**, so `git checkout main && git
merge` fails with *"refusing to merge unrelated histories."* ▶ **Nothing is wrong with the repo.** Never
touch local `main`: verify `git merge-base --is-ancestor origin/main <branch>` then
`git push origin <branch>:main`. **Check `origin/main`, never local `main`.**

## 🚨🚨🚨 THE RULE LEDGER — EVERY RULE SHE HAS GIVEN, BOTH HALVES, AND THE TEST THAT GUARDS IT
▶▶ **THIS SECTION NEVER ARCHIVES. It is the answer to her question of 2026-09-06:** *"The confusion of
one half of the app following some rules and the other half not — I do not understand how this happened
because the overall intent and goal of this whole app is very clear."*
⚠️⚠️ **THE SENTENCE TO KEEP: A RULE APPLIED TO ONE HALF IS NOT APPLIED.**
▶ **THE TWO HALVES.** The **AI path**: `_shopRules`, `_sizeGuidance`, `_wardrobeIdeaGen`, `sendChat`.
The **feed/shelf path**: `curatedPicks`, `scripts/slot_match.py`, `data/slot-rules.json`,
`netlify/functions/product-search.js`.
▶ **WHEN A NEW PICKER IS ADDED, IT MUST CALL THESE, NEVER COPY THEM.** Adding a second copy IS the bug —
that is the whole lesson of 2026-09-06 and it repeated twice more on 2026-09-07.

| Her rule | AI half | Shelf/feed half | Test | State |
|---|---|---|---|---|
| Never-wear list | `filterNeverWear` + prompt | `curatedPicks`, **same `_nwHit`** | curated · feedshelf | ✅ one shared implementation |
| Colour no's | `neverOther` verbatim in prompt | `_wdrNoColors` | curated | ✅ both |
| **Size range PER CATEGORY** | `_sizeGuidance`, built from `_FIT_FAMILIES` | `_fitApplies()` | **sizefit 38** | ✅ **fixed 2026-09-07** |
| A sweater is not a top | `_WDR_IDEA_EXCLUDE` | `data/slot-rules.json` | slot_match · feedshelf | ✅ both |
| The sibling-row map | `_WDR_IDEA_EXCLUDE` in prompt | Gate 1 in `curatedPicks` | feedshelf | ✅ both |
| **Store variety per surface** | `_shopRules` from `_STORE_CAP` | `_storeCap(mode)` | **storecap 15** | ✅ **fixed 2026-09-07** |
| Price spread | prompt line (`index.html:5015`) | band logic + feed ceiling | curated | ✅ both |
| Luxury via her retailers | `sendChat` prompt | n/a — feed links ARE her affiliates | ▶ none | ✅ verified by reading |
| Store-pool eligibility | `STORES` table only | **all 7 feed stores resolve, all have her dimensions** | ▶ none | ✅ measured 2026-09-07 |
| Never invent a store's tags | — | Gate 2 uses her own tables | ▶ none | ✅ by design |
| Never name her body/size back | prompts, `_sizeWordsOut` | **`_feedName()` strips a trailing size clause** | **feedname** | ✅ **both, 2026-09-08** |
| Never ask her age | app-wide, no age question | n/a | ▶ none | ✅ |
| **Womenswear only** | store list + prompts; `getStoreUrl` women's scoping (`w`/`gp`) | `keep_row()` gender column **+ NAME** | **rakuten_feed 52** | ✅ **fixed 2026-09-08** |
| **Width is a shoe rule** | `_sizeGuidance` width line | `widthFit` via `_isShoeSlot` | **sizefit 46** | ✅ **built 2026-09-07** |
| **Never claim a save that failed** | n/a | `user-data.js` + `doStay` | **savetruth 14** | ✅ **fixed 2026-09-07** |
| Checklist is a possibility map | copy + framing | n/a | ▶ none | ✅ copy-only rule |
| **Never claim a requirement is verified when it is not** | n/a — no surface asks yet | n/a — no surface asks yet | ▶ **none yet** | ▶▶ **HER RULE, GIVEN 2026-09-06. NOTHING IMPLEMENTS IT YET — written down BEFORE the build on purpose.** |
⚠️⚠️ **THE LAST ROW IS DELIBERATELY AHEAD OF THE CODE, AND THAT IS THE POINT.** Her words, 2026-09-06:
*"we should never imply that a specific size, width, colour, material or other requirement is confirmed
unless we can actually verify it."* **She gave it while NOTHING was built** — so for once a rule exists
before the picker it governs, instead of being reverse-engineered after she finds the fault on her phone.
▶ **The two `n/a`s here are honest TODAY and expire the moment a product search ships.** By this table's
own standing warning, an `n/a` is a CLAIM: **re-read this row before merging any product-search work.**
🚨 **This is the direct answer to the 2026-09-08 lesson — "a rule too obvious to write down is the one
that drifts." Womenswear-only had no row and a men's shirt reached her Tops shelf. This one has a row on
day zero.**
⚠️ **THE "never name her body/size back" ROW SAID `n/a — the feed writes no prose` AND THAT QUIETLY
STOPPED BEING TRUE.** The feed writes no prose but it does write a NAME, and hers carried
**"- Size M"** on a card. ▶ **An `n/a` in this table is a CLAIM, not a shrug — re-read every one when a
new source of text is added.**
🚨🚨 **THE ROW ABOVE WAS MISSING UNTIL 2026-09-08, AND ITS ABSENCE IS WHY A MEN'S SHIRT REACHED HER
TOPS SHELF.** "An app for women shows womenswear" felt too obvious to write down, so it was the one
rule with no row and no test — and it had ALREADY been fixed once, on the AI half, in August. ▶▶ **A
RULE TOO OBVIOUS TO WRITE DOWN IS THE ONE THAT DRIFTS, because nothing is watching it.** When a rule
feels unnecessary to add here, that is the argument for adding it.
⚠️ **The rows marked ▶ have no test yet.** Four of them are genuinely AI-only or copy-only rules where a
shelf-side test would assert nothing; **"store-pool eligibility" is the one worth a real test**, because
it becomes load-bearing the moment an eighth merchant is wired in.
⚠️ **`_storeFit` is now called in TWO places** (Gate 2 and the store ranking). It was called in exactly
one when a comment claimed it was the feed's style safeguard. **Grep for the call site before believing
a comment — a described safeguard is not a safeguard.**

## 📁 Where the history went
The session-by-session build history lives in **`CLAUDE-archive.md`** — **moved in two waves,
2026-07-28 and 2026-09-05, nothing deleted either time.** Read it for how something came to be: a
design tried and rejected, why a screen looks as it does, the detail of a build. **This file holds
what is still true**: standing rules, current decisions, the store system, open threads.

### 🚨 THE ARCHIVING RULE — READ THIS BEFORE ADDING A SESSION ENTRY (set 2026-09-05, after two cut-offs)
**`CLAUDE.md` is loaded in full at the start of every session, before Cath types a word. So its size
is not housekeeping, it is the session's working room.** On 2026-09-05 this file had reached
**1.3 MB (~327,000 tokens) against a context window of roughly 200,000** — larger than the whole
window — and sessions were being cut off before any work could begin. It was cut back to ~28,000
tokens. ⚠️ **It had already been archived once, on 2026-07-28, and grew back to THREE TIMES the size
of its own archive in six weeks**, because every session added a full entry and none were ever
retired. Archiving once does not fix this; the rule does.
- ▶ **THE RULE: when a session's notes are saved, the PREVIOUS session's entry moves to the archive
  in the same commit.** One "START HERE" entry lives here; everything older lives in the archive.
  **The file stops growing instead of needing rescuing.**
- 🚨🚨 **THREE THINGS NEVER ARCHIVE, and each was learned by losing it on 2026-09-06:**
  **(a) LIVE OPERATIONAL STATUS** — her affiliate approvals and rejections. **(b) A DECISION ABOUT SCOPE**
  — what we deliberately chose NOT to build yet, and why. I archived "the feed powers Wardrobe Ideas
  only" that evening and then re-derived it from the code hours later and presented it to her as a
  discovery. **(c) ANY RULE SHE GAVE** — see the wiring rule below.
  ▶ **THE TEST TO APPLY TO EVERY PARAGRAPH BEFORE MOVING IT: is this what HAPPENED, or is this what is
  TRUE RIGHT NOW? Only the first may move.** A build is what happened. A decision still governing the
  app is what is true.
- 🚨🚨 **LIVE OPERATIONAL STATUS NEVER ARCHIVES — added 2026-09-06 after this rule failed in exactly this
  way.** Cath's affiliate rejections (Impact, Bloomingdale's, Shopbop) were recorded correctly and then
  archived, so a session could hold 234 mentions of them in a file it does not read and 4 in the file it
  does — none naming a rejection. She had to tell me herself, and asked, rightly, whether her history was
  being lost. ▶ **A FINISHED BUILD is history. AN APPLICATION'S OUTCOME IS NOT — it is the current state of
  her business.** Before archiving anything, ask of every paragraph: *is this what happened, or is this
  what is true right now?* **Only the first may move.**
- ▶ **WHAT STAYS HERE, always, and it is never archived:** the standing rules (store-pool
  eligibility, the brand framing rule, the size-range rule, luxury routing, the disclosure list, the
  naming/voice rule, the catalog-vs-feed decision below), the founder truths and Cath's origin story,
  the app/hosting/backend notes, the "For Cath" instructions, and every open thread. **Rules and open
  threads are what "still true" means. A finished build's blow-by-blow is not.**
- ⚠️ **NOTHING IS EVER DELETED, and say so to Cath every time** — it moves to `CLAUDE-archive.md`,
  which is still in the repo and still searchable, and git holds every version regardless. This
  file's own history is one `git log` away.
- ⚠️ **A SECOND, SEPARATE SIZE COST: `index.html` is ~905 KB (~226,000 tokens) on its own**, which
  is LARGER than the whole context window. Archiving cannot touch it. ▶ **It is handled by a working
  rule instead — see "NEVER READ `index.html` WHOLE" above, which is the single most important
  operational rule in this file.**

## How the app is structured (important!)

The **entire front-end app lives in a single file: `index.html`.** It is a
single-page app — there are no separate HTML pages. Instead it shows/hides
"screens" using elements with `id="s-..."` (e.g. `s-wel` welcome, `s-quiz`,
`s-photo`, `s-chat`, `s-pref`, `s-res` results). All ~77 JavaScript functions
and all CSS are inline in `index.html`.

So: to change almost any feature, text, color, or layout, edit `index.html`.

### 🚨🚨 NEVER READ `index.html` WHOLE — IT IS BIGGER THAN THE CONTEXT WINDOW (rule set 2026-09-06)
**`index.html` is ~905 KB, which is roughly 226,000 tokens. A session's context window is about
200,000.** So reading this file end to end does not fill the session, it **overflows it in a single
move** — and `/compact` cannot rescue that, because compaction has to hold the thing it is
summarising. ▶ **This is what "Prompt is too long" followed by two failed compactions looks like,
and Cath hit it in a real session before this rule existed.**
- ▶▶ **THE RULE: locate first, then read a RANGE. Never open the whole file.**
  `grep -n "functionName" index.html` to find the line, then `sed -n '4300,4380p' index.html`.
  The dedicated Read tool must always be given an `offset` and a `limit` here.
- ⚠️ **A careless `grep` is the other way in.** A pattern matching hundreds of lines dumps them all
  into the session. **Pipe through `head`, and prefer `grep -c` when you only need to know whether
  something exists.**
- ⚠️ **Same trap in the harnesses:** a script that prints the built page, or a Playwright run that
  dumps `innerHTML`, lands the same weight in the transcript. **Print measurements, not markup.**
- ▶ **This is NOT a problem to fix by splitting the file.** One file is the design, and splitting it
  would be a large risky refactor of a live app for no user benefit. **It is a problem to fix by how
  the file is READ**, which costs nothing.

## Hosting & deploy

- **Netlify** hosts the site. `netlify.toml` sets `publish = "."` (the repo root)
  and `functions = "netlify/functions"`.
- Deploys happen **automatically** when the `main` branch updates on GitHub.
  (GitHub `main` → Netlify build → live site.)
- It's a PWA: `manifest.json` + `icon-192.png` / `icon-512.png` / `apple-touch-icon.png`.

## Backend (Netlify Functions)

Two serverless functions in `netlify/functions/`:

- **`style-ai.js`** — proxies requests to the Anthropic (Claude) API to generate
  the personalized style write-ups, photo analysis, and stylist chat replies.
  Requires env var `ANTHROPIC_API_KEY`. Called from the front-end via
  `fetch("/.netlify/functions/style-ai", ...)`.
- **`user-data.js`** — email capture + saving/loading a user's results. Backed by
  **Supabase** (a `users` table). Requires env vars `SUPABASE_URL` and
  `SUPABASE_KEY`. Called via `/.netlify/functions/user-data`. On each save it also
  adds the signup to **MailerLite** (group "Style Star Signups", looked up by name)
  so the list can be emailed — requires env var `MAILERLITE_API_KEY`. The MailerLite
  call is wrapped so a failure never blocks the Supabase save.

There is also a hidden Netlify Forms form (`name="style-star-emails"`) in
`index.html` as a backup email-capture mechanism.

> Note: only the copies inside `netlify/functions/` are deployed. Do not
> reintroduce root-level `style-ai.js` / `user-data.js` — earlier stray copies
> there were outdated duplicates and were removed.

## Fonts

Google Fonts are loaded in the `<head>` of `index.html`: **DM Sans** (default body
font), **Fraunces** (elegant display serif), **Cormorant Garamond**, and
**Noto Serif**. To use one, set `font-family` in the relevant CSS rule — no extra
setup needed since they're already loaded.

## Working with this repo

- Make changes on a feature branch, open a Pull Request against `main`, review the
  "Files changed" tab, then merge. Merging to `main` is what makes a change go live.
- For tiny/safe tweaks, merging directly to `main` is also fine.
- Everything is tracked in git history, so prior versions are always recoverable.

---

## For Cath — how to come back and work on this

**You can never lose your work.** Everything real lives in **two permanent places on
GitHub** (`StyleStarApp/stylestar-app`): your **code** (the whole app) and **this
`CLAUDE.md`** (our shared memory — roadmap, decisions, where we left off). The chat is
just the conversation, like a phone call; GitHub is the filing cabinet, and it's
permanent. Even if a chat window disappears, the work does **not**.

### ▶ Each time you come back — do this:
1. Open the Claude app → **Code** tab (or go to **claude.ai/code**).
2. Click **"New session"** — start a *new* one each time. (A new session is also what
   activates the upgraded **network access** we set up 2026-06-25, so Claude can see the
   live site.) Our sessions show under **Recents** (e.g. "Claude code identification").
3. Choose the **stylestar-app** repo/project.
4. Paste this **restart phrase**:

   > _Continue my Style Star project. Read CLAUDE.md and tell me where we left off._

   (No branch name needed — each session gets its own, and Claude reads the current state from
   `main`. Naming an old branch here only ever caused confusion.)

5. Claude reads this file automatically, resurfaces the roadmap, and you pick up exactly
   where you stopped.

### 🧭 If you ever feel lost
Just say: **"Read CLAUDE.md and tell me where we left off."** Claude can always do this,
because it's saved on GitHub.

### How things "save"
- **Merging a Pull Request = saving + going live.** That's it.
- Anything merged (or pushed to a branch) is on GitHub forever and recoverable.
- The temporary chat workspace disappears between sessions — that's fine; the real
  project is always safe on GitHub.

### Quick reference
- **Code & history:** github.com/StyleStarApp/stylestar-app
- **Working branch:** a fresh `claude/...` branch each session; everything real lives on `main`
- **Live site:** served by Netlify (auto-deploys from `main`) — **stylestar.app**
- **Legal pages (for affiliate application forms):** stylestar.app/privacy · /terms · /story · /faq
- **Emails / user data:** Supabase (stores data) + MailerLite (sends email)

### ▶ DECISION (2026-06-28): affiliate applications ON HOLD until LLC + EIN + business bank
Cath decided to **wait** on applying to affiliate programs until the **LLC, EIN, and
business bank account** are set up — so all affiliate income flows through the business
from day one (clean books / proper separation). This supersedes the earlier "Amazon
anytime" framing. So the new sequence is: **legal chain first (Almira → LLC → EIN → bank)
→ THEN apply to affiliates → THEN [Claude] wire affiliate links + product images + FTC
disclosure.** (Confirm tax-timing with her accountant; she'll also ask Almira.) None of
this blocks app work; the glow-up continues meanwhile.

### ▶ LEGAL — THE LLC IS ACTIVE. **STYLE STAR BY CATHERINE, LLC**, Florida document
**L26000395689**, filed **27 July 2026**, verified by Cath on Sunbiz herself.
Florida first refused "Style Star, LLC" (too close to the unrelated STYLESTAR USA, INC.,
which still coexists fine); her first-choice replacement cleared. **The brand name is
untouched — the LLC legal name and the brand/TM name never had to match.**
📁 *The full story — the rejection, the three ranked names, Almira's replies, the timeline —
is in `CLAUDE-archive.md`.*
- ⚠️ **STANDING RULE, and it still matters: any LLC-related ask for money that is not from
  Almira, the State of Florida directly, or the IRS is JUNK.** Public Sunbiz filings are
  scraped instantly, so expect fake "EIN service", "Certificate of Status", "annual report"
  and "labor law poster" approaches by text AND paper mail. **Her EIN comes through the Indie
  Law TM Max package; she never pays a third party for it.** Don't click, don't reply STOP.
- **Her home address is on the filing** (she is her own registered agent) — that is why the
  scrapers reached the household phones. Normal for a small LLC. A registered-agent service
  (~$100/yr) would keep it off FUTURE filings. Someday-option, zero urgency.
### ▶ LEGAL UPDATE (2026-08-05 — Indie Law replied: LLC DOCS DELIVERED, TM word mark → FINAL ACTION STEPS)
Cath's follow-up email (sent this morning) got a same-day reply from the Indie Client Care Team:
**"Nothing further is needed from you for the trademark. We're sending your word mark application over for
the final action steps."** LLC documents delivered in a Google Drive folder (readable via the Drive
connector; folder id `1Hr9zRw0KnWSEGn7WvlqpgxBxPC2Wrzd_`). **Both documents were read and inventoried:**
1. **Articles of Organization (filed PDF)** — filed **July 27, 2026** (the state approved 4 days before the
   scam texts tipped us off), Document L26000395689. ▶ This is the document the BANK will want for the
   business account. **It answers the registered-agent question Cath cut from her email: she is her OWN
   registered agent at her home address (1559 Harston Ave, Orlando)** — that's why the scrapers found the
   household phones. Normal for small LLCs, nothing wrong; a registered-agent service (~$100/yr) can keep
   the home address off FUTURE public records if the junk mail ever annoys her. Someday-option, zero urgency.
2. **LLC Operating Agreement (docx)** — ⚠️ **DELIVERED INCOMPLETE: the effective date is blank and §1.2
   still reads `#Registered Agent Name#` (an unfilled template placeholder); Exhibit A (member name,
   ownership %, capital contribution) needs confirming.** Flagged to Cath with the suggestion to ask Indie
   Law to complete it or confirm she should fill + sign it herself. Banks often ask for this document too.
⚠️ **AND CATH'S OWN CATCH: her middle name is misspelled in the filed Articles** — "CATHERINE BAIL
ELLSPERMANN" in Articles III + IV (registered agent + member fields), while both signature lines correctly
say BAILEY. A data-entry truncation, not a validity problem (LLC name is perfect; the TM files under the
LLC, banks care about LLC name + EIN + her ID) — but it's her legal record, so it goes in the same reply
to Indie Law: fixable via amendment or the annual report, THEIR fix to make. **A combined 2-ask draft
reply (name correction + operating-agreement blanks) was given to her 2026-08-05 — check whether she sent
it and what Indie Law answered.**
▶ **WHAT TO WATCH NEXT:** (a) the TM word mark "final action steps" email — will need HER signature/
declaration, and it is REAL (distinguish from the scam wave); (b) the **EIN** (included in the TM Max
package — she never pays a third party for it); (c) then her two steps: business bank account (bring
Articles + EIN + operating agreement) → affiliate applications (NETWORKS FIRST, Amazon only with real
traffic). The money path is genuinely moving now.

### ▶ NORTH STAR (2026-07-14, from Sally Hogshead — award-winning marketing expert, author of "How to Fascinate"): DIFFERENTIATION = THE REAL STYLIST BEHIND IT
Sally (Cath's friend, a marketing/branding genius) gave Cath the single most important strategic note yet:
**Style Star must clearly, loudly differentiate on the one thing no competitor can copy — that it is built with
love, expertise, and real care by a REAL, experienced personal stylist (Cath, 20+ years).** Otherwise it reads
as "just another styling app / faceless AI." Sally believes what Cath offers is genuinely golden, unique, and
valuable — but the app needs CLARITY around that human/expert distinction, up front and everywhere.
- **The gap:** a brand-new visitor who doesn't know Cath cannot currently FEEL the "real stylist who cares"
  difference on the first screen. The AI, the quiz, the design are table stakes; the human soul is the moat.
- **▶ ACTION (next session, high priority — Cath wants this): surface the human/founder story on the HOME page**
  (`s-wel`, "Discover your signature style"). Add a small, elegant **founder line** — ideally first-person so a
  stranger feels met by a person, not a product — with a soft link to the existing **Our Story** page ("Read my
  story →"). Wording options offered (Cath to pick/refine): "Hi, I'm Cath. I've styled women for two decades.
  This is my gift to you." / "Created with love by Cath, a personal stylist of over 20 years." / "Real styling,
  from a stylist who's spent 20 years helping women feel like themselves." / "Personal styling from a real
  stylist who truly cares, not an algorithm." Design/placement to be built beautifully (don't crowd the hero).
- **Bigger principle:** weave the "real stylist, built with love + expertise" thread through the WHOLE app, not
  just home — welcome email, stylist chat, results, Our Story, FAQ. This is the positioning; make it felt
  everywhere. (Ties to the already-live chat line "Created with love by a real stylist, powered by AI" and the
  Style Star Edit "Curated by Catherine.") This north star should shape copy + design decisions going forward.

### ▶ FOUNDER & PRODUCT TRUTHS (from Cath, 2026-07-12 — north star + monetization + audience)
- **Audience = literally any woman, 18 to 80+.** No age or income bracket; every woman can use it, enjoy
  it, and gain value. Her hunch: women ~50s (her age) may use it most, but it's for EVERYONE, and for
  anyone who will share it. → Keep the tone warm/inclusive and the design highly READABLE (older users
  matter); never gate by sophistication or budget.
- **Monetization priority = AFFILIATE, and she loves it BECAUSE it's passive and quiet.** She is NOT
  looking to add more paid 1:1 styling (she has plenty already) — the app is NOT a funnel to her 1:1
  business. Substack: she doesn't know it, parked (offer a plain-English explainer if she's curious). A
  future in-app PAID TIER is possible *eventually*, but see the principle below.
- **▶ PRODUCT PRINCIPLE (Cath, strong conviction): VALUE FIRST, never pay-to-try.** She's frustrated by
  apps that demand payment before you get any value or even know if you like it. So: the core Style Star
  experience stays FREE; affiliate is the quiet income; ANY future paid tier must come only AFTER the
  user has already received real value (e.g., an OPTIONAL premium upgrade like a deluxe Style Guide /
  Vision Board), never a paywall up front. Bake this into every monetization decision.
- **North star:** a **lifestyle business she loves and is passionate about — her gift to the world.**
  Dream outcome: it would be amazing to make **a million dollars** from it. It is NOT lead-gen for her
  1:1 work; the app itself IS the business.
- **Origin / heart (use to keep copy + brand true):** 20+ years styling women; everyone kept telling her
  she's gifted at this and should help more people, but she couldn't figure out HOW to scale it — until
  **AI**. She took AI classes, got curious, and realized she could combine her craft with AI and offer it
  to the world as a way of **shining her own light and sharing her God-given gifts** and her creativity.
  It has been a **delightful** project for her. (Emotional core: the expansion of her gift + "shine your
  light" — protect it in every design and copy choice.)


### ▶ FOUNDER CONTEXT + COACHING NOTES (2026-07-14 — Cath's priorities, fears, and how to help her)
- **#1 priority right now:** make the app **beautiful, cohesive, on-brand, user-friendly** so a NEW user who
  doesn't know Cath **instantly "gets it," loves it, and gains value.** Clarity of vision + the Sally
  differentiation above are the frame for all app work.
- **Design confidence:** Cath worries she's "not a graphic designer" and fears the app could read **too Vegas /
  cartoonish / tacky** vs the **upscale-boutique + fun** feel she wants. Honest assessment given to her: it is
  NOT tacky — the chrome/gold/dressing-room world + DM Serif Display + linen cards read genuinely boutique. The
  refinement levers going forward are **RESTRAINT** (fewer shiny/shimmer/sparkle/reveal effects happening at
  once; more calm + negative space — luxury whispers) and **unifying the few off-palette bits** (the bright
  red/pink/teal icon tiles; emoji ⭐📸💫 vs the custom gold SVG stars — be intentional which is where). ▶ Offered
  a future **"sophistication / restraint audit"** (screen-by-screen, flag anything tipping tacky, pare back).
  Reassure her: her eye IS good — her calls (amber reads cheap, rounded-vs-square, shimmer let-down,
  readability for older users) are sophisticated instincts. Her worry is a confidence gap, not a competence gap.
- **Launch / testers (Cath's emotional strategy — HONOR IT):** she is **deliberately NOT sharing widely yet.**
  She fears losing momentum, "evil eye," jealousy, negativity, and that people won't understand the affiliate
  links aren't wired in. Most of her friends don't understand AI and are somewhat anti-AI. She's confident in
  what she's building and wants zero negative noise until truly ready. This is legit soft-launch strategy, not
  silliness — protect it. When she IS ready for feedback: recommend a **small hand-picked circle of 5–10 warm,
  constructive testers** (skip AI-hostile people; consider a couple who DON'T know her to judge the product not
  the person), framed as a private in-progress honor, with a note that some links aren't live yet. (Offered a
  tester-invite message; she said not yet.)
- **▶ Cath explicitly asked me to keep PUSHING her on the to-do list and keep her ON TRACK / focused each
  session** (surface the master to-do, nudge toward the next step, gently guard against endless polishing).
- **Honest strengths/weaknesses shared with Cath (she asked directly):** STRENGTHS — exceptional ear for tone/
  warmth + copy; crystal-clear brand values (shine your light, value-first, never make a woman feel bad, every
  age/body/budget); authentic heart (the moat); courage to embrace AI when peers won't; persistence + craft.
  GROWTH EDGES — perfectionism can become a hiding place (more solo polish < 10 real users; the app is good
  enough to start learning from people; biggest risk to the dream is staying in the workshop too long); she
  UNDERESTIMATES herself (confidence gap, not competence gap); fear of others' judgment can become a ceiling;
  many directions → guard the "one lever at a time" discipline. The single most useful criticism: **her standard
  for the product is higher than her belief in herself, and that gap is what's most likely to slow her down —
  trust the work, and herself, more.** (Use this to gently encourage her toward shipping/sharing when ready.)

### ▶ REAL USER TESTING (2026-07-26): Cath's MOM used the app — still the best feedback yet
She **loved it and could not stop clicking the shopping links**, even told they weren't wired
up. **But she never found What's Trending from the tab** — only from the teaser strip at the
bottom. 📁 *Full build detail in `CLAUDE-archive.md`.* What must not be re-learned:
- ▶▶ **CONTENT IS MORE DISCOVERABLE THAN CHROME.** She found it at the bottom because that is
  where the actual *trends* were — she didn't need a control, she saw clothes she wanted.
  **Apply this to every future discovery problem before adding another button.**
- ⚠️ **GREY TEXT READS AS DISABLED.** The unselected tab was grey-on-transparent, so the pair
  read as "one button + one greyed-out label" rather than a two-sided switch. Amplified for a
  less app-fluent user, which is squarely inside an 18-to-80 audience.
- ⚠️ **ALWAYS RENDER BOTH STATES OF A TOGGLE BEFORE SHIPPING.** The fix shipped with a single
  arrow that pointed the wrong way in the other state; the mockups had only ever shown one side.
- **NET: three routes to What's Trending now** — the Build hub button, the bottom teaser strip,
  and the tab itself. **Adding a `trendItems` entry relights the New pill automatically.**
- ▶ **PARKED (her call): a strip of trending ITEMS near the top of My List.** The strongest
  version of the fix, but it competes with the list and two entry points already landed.
### ▶▶ THE SPREADSHEET IS FROZEN, NOT DELETED — WHERE SHOPPING RESULTS COME FROM (her decision, 2026-09-05)
**Her words, and she is right on the merits:** *"the spreadsheet was not a sustainable thing for me to
maintain and the goal moving forward is to get more stores wired in, and my curation is for the Edit,
Star of the Week and trends. The spreadsheet will go stale and it is not possible for me to fill the
whole thing out and check on every item every week."*
- ▶ **THE DECISION: the 107-item hand-picked catalog (`data/style-star-products.csv` → `products.json`)
  is FROZEN. She adds no more rows and checks no links. It is NOT deleted, and it still shows on the
  shelves.** ⚠️ **This was never formally decided before — her staleness worry was recorded on
  2026-08-14 and no retirement call was ever written down. It is written down now.**
- ▶▶ **WHY IT IS NOT DELETED, and this is the whole argument: EVERY SINGLE FED STORE IS `$$$` OR
  `$$$$`.** Mytheresa, DVF, Olivela, Marissa Collections and Vilebrequin are `$$$$`; Fleur du Mal
  `$$$-$$$$`; FARM Rio `$$$`. **So her 107 hand-picks are currently the app's ONLY affordable
  real-product inventory with a photo.** Deleting them today would make the whole app look dearer than
  it is, which runs straight against her founding value ("literally any woman, 18 to 80+, no age or
  income bracket").
- ▶ **THREE TIERS OF COVERAGE, and the answer to her question "what happens when the search is for
  something that is not in our fed stores and not on the spreadsheet either?":**
  1. **Feed match** — a real garment, real photo, real current price, exact product page. 6 stores today.
  2. **Spreadsheet match** — a real garment she chose, real price, exact product page, no photo. 107 items.
  3. **Everything else** — the AI names a plausible piece and builds a STORE SEARCH across all 108
     stores. **No photo, no stock check, no size check.** ▶ **This is the app's floor, it has always
     been the floor, and it is what every woman got before the feed existed. Nothing got worse; two
     better tiers were added above it.**
  ⚠️ **The tiers BLEND, they do not compete.** `curatedPicks()` merges her picks and the feed into ONE
  pool and applies the identical rules to both (never-wear, colour no's, size ranges, price spread,
  max two per retailer, the Sunday rotation). Two sources, one picker. A woman never sees a seam.
- ▶ **HER CURATION LIVES IN EXACTLY THREE PLACES NOW, and nowhere else: the Style Star Edit · Star of
  the Week · What's Trending.** Those are small, hers, and sustainable. **Do not ask her to fill in
  catalog rows again.**
- ▶▶ **THE TRIGGER THAT RETIRES THE SPREADSHEET: an AFFORDABLE or MID-MARKET store getting wired in.**
  The moment the feed carries real inventory a woman on a budget can buy, the 107 stop being
  load-bearing and can be dropped without a word. ⚠️ **NOT Under Armour — see the affiliate section: it
  covers ~13 activewear-ish rows of 100 and none of the apparel that matters (her correction,
  2026-09-08). Watch for a MID-MARKET GENERALIST or a department store instead.** ⚠️ **A mid-market approval is therefore worth MORE to this app than
  another luxury one** — say so when the affiliate order comes up.
- ⚠️ **Until that day, if a link in the 107 dies, it dies quietly.** That is an accepted cost of
  freezing, not an oversight. The Monday catalog-link Routine still reports them; nobody has to act.

### ▶ STORE-POOL ELIGIBILITY — THE FULL RULE (confirmed by Cath 2026-07-27)
Every store in the `STORES` table must be a place a woman can browse and **BUY AND KEEP** a specific
item, and must meet Cath's quality bar. **Three standing exclusions, all her explicit calls:**
1. **No subscription styling boxes** — Stitch Fix, Dia&Co, Trunk Club, Wantable, **Fabletics** (VIP
   membership model). Her words: *"No subscription boxes I cannot stand those things."* Coherent with
   the brand: a box picks FOR her; Style Star helps her see and choose for herself.
2. **No rentals** — Rent the Runway, Nuuly. *"No rentals either, same reason."* Clothes that go back
   are not hers.
3. **No fast fashion** — Shein, Temu, and (confirmed 2026-07-27) **Cider, Princess Polly, Meshki,
   Peppermayo, Cotton On**. Quality and ethics.
⚠️ **All of these names appear on Cath's wider retailer wishlist document** (the ~200-store universe she
sent 2026-07-27). They are excluded ON PURPOSE. **Do not add them from that list.** The rule is also
written into the comment above the `STORES` table in `index.html`.
▶ **Lesson that produced this:** when adding stores, check the BUSINESS MODEL, not just whether the
search URL works. A working URL on the wrong kind of company is still wrong.

### ▶ EVERY STORE CARRIES CATH'S OWN TAGS AND HER OWN SCORES (2026-07-27)
Cath reviewed all 102 stores herself and sent price tier, style archetype, sizes carried and
"best for" — then four further tables scoring every store 1-10 on dimensions she defined.
**This is real stylist knowledge and the most valuable thing in the table.**
📁 *The build detail, her vocabulary, the measured before/after, and the two bugs simulation
caught are all in `CLAUDE-archive.md`.* The standing rules:
- ▶▶ **IF A NEW STORE IS EVER ADDED, GET HER TAGS FOR IT. Do not invent them, and do not
  "tidy" hers.** (The Garnet Hill lesson, and the same rule the feed obeys.)
- ⚠️ **A RENAME IS A CRASH RISK.** `_STORE_ALIAS` values must be REAL keys in `STORES`, or
  `resolveStore` returns a key with no entry and `STORES[key].u` throws, taking the whole page
  down. **Rename a store → update its aliases → verify the OLD spelling still resolves**, since
  the AI has years of habit calling it the old name.
- ▶ **THE BUSINESS FIELDS STAY OUT OF THE APP.** Affiliate status, commission rate and AI
  priority belong in a spreadsheet she owns. **Commission data in the app would quietly bias
  picks toward what pays best, which is the exact opposite of the brand.** The app only ever
  knows what helps a woman shop: price, style, sizes, strengths.

#### ▶ THE DIMENSION SET — 4 PAIRS + 2 SINGLES, and it is COMPLETE
`d` is **10 numbers** per store:
`[relaxed, alluring, polish, classic, trendy, casual, dressy, fitted, neutral, colorful]`
⚠️ **The order reads oddly on purpose** (`relaxed` replaced an earlier single `fitted` score in
slot 0 and its partner was appended at the end). **Always go through the `_DIM_*` constants,
never a bare index.**
- **FOUR PAIRS, weighted preference scores** (more of her own side is simply better):
  relaxed/fitted ← slider 9 · classic/trendy ← slider 1 · casual/dressy ← slider 5 ·
  neutral/colorful ← slider 7.
- **TWO SINGLES:** `alluring` is a distance PENALTY (×2.5, so one axis still counts against four
  pairs). `polish` is a refinement tie-break (×0.15).
- ▶▶ **WHY INDEPENDENT PAIRS BEAT A SINGLE AXIS, and this generalises:** Nordstrom is 8 classic
  AND 7 trendy because it genuinely serves both; Talbots is 10/1. **Collapsed to one slider, a
  store that serves EVERYBODY looks identical to one that serves NOBODY** — both land mid-scale.
- ▶▶ **POLISH RANKS, IT NEVER MATCHES.** Two of her dimensions are TASTE; polish is QUALITY, and
  nobody wants less of it. A woman who dresses casually wants the most refined CASUAL store, not
  the least refined one. **Getting this backwards sends relaxed dressers to Old Navy.**
- ▶ **STOP HERE. Do NOT score the remaining sliders.** Every axis added dilutes the others, and
  the 12 sliders are not independent. Scoring all twelve would make matching *worse*.

#### ▶▶ SORT, DO NOT TRIM — the AI gets ALL 102 stores, best-fit first (reversed 2026-07-27)
Cath's priority, in her words: *"the last thing I want is for her to not get shown something she
would actually want."* A shortlist was built and then **deleted**: sorting does 100% of the
quality work, trimming only ever saved money, and the money is **under half a cent per shop**.
Measurement said the trim was riskier than it looked — for one archetype the best store in a
whole category sat at **rank 72**. ⚠️ **And two genuine bugs turned up in the coverage apparatus
that patched around the trim. The safest code is the code not written.**
▶ **If cost ever genuinely matters** (it will not until there are thousands of users), the honest
lever is caching, not trimming. **Re-read this before revisiting.**
- ⚠️ **A REAL RISK THE AXES CREATED: the dressier a woman's taste, the more her best-matched
  stores skew expensive**, because dressy correlates with price in her tags. The prompt line
  promising to match "including her budget range" was **deleted** (the app never asks her budget)
  and replaced with an explicit instruction to **spread the prices** and always include something
  genuinely affordable. ▶ **This is the same skew the 2026-09-06 measurement found again on both
  the feed shelves and the AI's own picks — see the affordability thread at the top.**
- ▶ **OPEN QUESTION FOR CATH — BREADTH vs FIT.** A store strong on BOTH sides of every pair scores
  near the max whatever her lean is, so **Nordstrom tops 20 of the 28 archetypes' top-5.** Arguably
  correct — she PREFERS department stores for wardrobe building — but a stylist's value is partly
  sending someone somewhere specific. **Deliberately left alone: a stylist judgment, not an
  engineering one.** The one-line lever is to subtract a small "breadth" term (the store's mean
  across a pair) from each pair's score.
### ▶ STORE VARIETY — "she could just go to Nordstrom" (Cath, 2026-07-27)
Cath's product insight, and it is an existential one: *"if Style Star gives every single suggestion at
Nordstrom she might think well I can just go straight to Nordstrom.com and skip this."* Also her
stylist view, which reframes the earlier Nordstrom-dominance worry entirely: **she PREFERS department
stores for wardrobe building** (better odds on size, colour, stock, returns) and uses boutiques for
the unique or non-mainstream piece. So big stores are not the problem. **A set that is ALL one big
store is.** The fix belongs in variety-within-a-set, NOT in the matching.
- **▶ FOUND: the chat prompt was actively causing it.** It said *"try to group from the same store when
  possible so she can shop in one place."* That is the "everything at Nordstrom" instruction, in
  writing.
- **The rules now differ by feature, on purpose:**
  - **Wardrobe "Ideas" carousel** — `_shopRules('compare')`. The 4 options are alternatives for ONE
    piece she is choosing between, so **every one must be a different store**. Four white blouses at
    one store tells her nothing she could not have found herself.
  - **Shop your style / wishlist / Complete the Look** — default `_shopRules()`. **No more than two
    picks at the same store**, plus include at least one smaller or specialist store when one honestly
    suits the piece better.
  - **Stylist chat** — Cath's call, and she is right: *"if she is getting suggestions on the chat of
    what to purchase it is easier for her to buy all at one store."* Chat answers are usually
    outfit-shaped and she is BUYING, so one order = one checkout, one shipping, one return. Chat now
    **groups within an answer** but is told **not to default to the same store across answers**, which
    is what protects against the go-direct problem.
- ⚠️ **A VARIETY RULE WITH NO BRAKE CREATES ITS OWN BUG.** The first live test came back with
  **Gorjana, a jewelry brand, selling a canvas tote** — the AI reaching for a different name and
  landing somewhere that cannot possibly stock the item. Added an explicit line: never pick a store
  that does not sell that kind of thing; repeating a store is better than sending her somewhere
  impossible. Re-tested clean (Naturalizer→pumps, Cuyana→satchel, Mejuri→necklace).
- ⚠️ **REAL BUG FOUND AND FIXED IN THE SIZE RULE, caught only by a live call.** `_sizeGuidance()`
  always emitted "add a size word to pants, dresses, tops…" even for a woman with NO size range saved.
  The AI dutifully looked for a size word, found none, and **invented one — appending "regular" to
  every search term** ("white poplin top regular"), which lands on a worse page than no word at all.
  Now the whole block returns `''` when she has given no fit or width, and when it does appear it says
  explicitly: only the words named below, never invent one, never write "regular"/"standard"/"misses".
- **▶ TESTING LESSON worth keeping:** prompt rules are only real if the model follows them, and
  headless render tests cannot tell you that. `scratchpad/variety.js` builds the REAL prompts for
  three archetypes plus the compare carousel and calls the LIVE `stylestar.app` function, then asserts
  store-repeat counts and store/category sanity. **Both bugs above were invisible to every static
  test and obvious on the first live call.** Use this pattern whenever a prompt rule changes.

### ▶ STORE-URL VERIFICATION STATUS (2026-07-28) — do not redo the confirmed ones
**FIXED AND LIVE this session (12):** Mejuri (`?q=`→`?query=`) · Chico's, White House Black Market, Soma
(`?q=`→`?searchTerm=`) · Sam Edelman, Naturalizer (`?q=`→**`#q=`**, hash) · Madewell (`/search?q=` →
`/search-results/?r_productGender=women&q=`) · J.Crew (retired `?Ntrm=` → `?term=`) · Sézane (`/us/search?q=` →
`/us-en/search?s=`) · Dillard's (`?text=` → path `/search-term/`) · Lacoste (needs a **`tpl` template**, term
appears twice) · Boden (`bodenusa.com/en-us/search?q=` → `us.boden.com/search?q=`; the old one 200'd but
redirected to the homepage with `/search` stripped).
**CONFIRMED ALREADY CORRECT, leave alone:** **Macy's** `/shop/search?keyword=` · **Bloomingdales**
`/shop/search?keyword=` · **Tory Burch** `/en-us/search/?q=` (byte-identical to Cath's) — all verified in her
browser. ⚠️ **Macy's and Bloomingdales are the same company and platform, and BOTH rewrite a typed search to
`/shop/featured/<hyphenated-term>`.** That rewrite looks like proof our url is wrong and is not: the plain
`?keyword=` search works on both. Do not "fix" either on the strength of a `/shop/featured/` url.
**THE WHOLE GAP FAMILY, confirmed by one URL:** Cath's Banana Republic search came back byte-identical to ours,
`https://bananarepublic.gap.com/browse/search.do?searchText=`. **Gap, Old Navy, Athleta and Banana Republic
Factory all use that same `/browse/search.do?searchText=` pattern on their own subdomain**, so one paste
effectively validated five stores. They had all been stuck in the "cannot tell" pile because they render results
client-side. **Lesson: when a store belongs to a family, verifying one usually verifies the siblings** — the same
was true in reverse for Chico's / Soma / White House Black Market, where one broken parameter meant three.
✅ **THE TWELVE-STORE PRIORITY LIST IS COMPLETE.** Cath checked every one in her browser. **14 fixed** (the 12
above plus Theory `?q=` → `/search/?lang=default&q=` and Levi's `?q=` → path `/search/`), **7 confirmed already
correct** (Macy's, Bloomingdales, Tory Burch, Aritzia, Banana Republic + the Gap family). Only a long tail of
rarely-surfacing stores was never checked; nothing left above 8/28 exposure.
✅ **EVERY CHANGE IS PROVEN END TO END.** Cath pasted the generated url for each store that could not be tested
from here and confirmed real results, including Theory (`/search/?lang=default&q=white%20skirt`) and Lacoste.
- ✅ **Lacoste confirmed by Cath**, `%20` inside the JSON parameter works exactly as `+` does. No encoding change needed.
- ⚠️ **A CLIENT-SIDE SEARCH LOADS THE PAGE FIRST AND THEN APPLIES THE QUERY, so there is a visible DELAY** before
  the results appear. Cath saw it on Lacoste. It is inherent to `#q=` and JSON-parameter stores (Lacoste, Sam
  Edelman, Naturalizer) and is NOT a broken link. Do not "fix" a slow store, and do not read a brief empty page
  as failure when testing one.
▶ **Rerun `scratchpad/render/priority.js` to regenerate that ranking** (it scores every unverified store by how
often `_storeFit` puts it in a woman's top 20).

### ▶ THE ADDRESS-BAR WORKFLOW, AND ITS BEST TRICK (2026-07-28)
Retail sites block this environment completely: `curl` gets 403 from about half of them, and **Chromium cannot
load a single one** (tested with the proxy, without it, and with `--proxy-server` forced; the requests never even
reach the proxy). So for any store that blocks us, **Cath's address bar is the only instrument that exists.**
It has now solved J.Jill, Mango, Kendra Scott, Sam Edelman, Naturalizer, Madewell, J.Crew and Sézane.
- **The normal ask:** search on the store's site, send the URL from the RESULTS page. The term must be visible in it.
- ⚠️ **▶ THE TRICK THAT RESCUED SÉZANE, and it generalises: a site can ACCEPT a parameter it never PRODUCES.**
  Sézane's own search box leaves the address bar on `/us-en/search` with no term at all, which looks like proof
  that it cannot be deep-linked. It is not. Claude proposed three candidate URLs, Cath pasted each into her address
  bar, and **`?s=` worked** while `?q=` and `?query=` did not. **So "the URL does not change when I search" NEVER
  means "this store cannot be linked."** Always propose 3 or 4 candidate parameters (`q`, `query`, `s`, `term`,
  `keyword`, `searchTerm`, `text`) for her to paste. She is the test harness for everything unreachable from here.
- **Two fixes usually hide in one URL.** Sézane needed BOTH a locale change (`/us/` → `/us-en/`) and a parameter
  change (`?q=` → `?s=`); Madewell needed a path change AND kept a women's filter; J.Crew's was an entirely retired
  URL format. Read the whole URL, not just the parameter.
- **A store url does NOT have to end in a parameter.** `getStoreUrl` simply appends the encoded term to `u`, so a
  PATH-based search works too: Dillard's is `https://www.dillards.com/search-term/` and the term becomes the next
  path segment. `%20` is fine in a path. Any test asserting the url shape must allow a trailing `/` as well as
  `?x=`, `&x=` and `#x=`.
- ⚠️ **Watch for an AUTOCOMPLETE url, it is not a search url.** Cath's first Macy's link was
  `/shop/featured/women-red-dress?cm_kws_ac=red+&ss=true`; `cm_kws_ac` means she clicked a dropdown SUGGESTION,
  which lands on a curated page rather than running a search. Always ask her to TYPE the term and press Enter.
  (Macy's then still rewrites to `/shop/featured/<hyphenated-term>`, so whether the plain `?keyword=` search url
  also works is still an open question at the time of writing.)

### ▶ DECISION (2026-07-28, Cath): LUXURY GOES THROUGH OUR RETAILERS, NEVER DIRECT TO THE BRAND
**Cath's words: "Definitely would prefer we direct her to purchase luxury from one of our affiliates instead
of have her purchase at Louis Vuitton for example."** This is now a standing rule, and it is a MONEY rule as
much as a styling one.
- **The stylist still names the designer freely** (that is real expertise and the whole differentiation), but the
  PURCHASE is always routed to a shop we carry: **Neiman Marcus, Saks, Bergdorf Goodman, NET-A-PORTER, Nordstrom,
  Bloomingdales**. Written as *"the Celine Shopping Tote at Neiman Marcus"*, never *"from Celine"*.
- **WHY IT MATTERS COMMERCIALLY:** Louis Vuitton and the other houses sell direct and have **no affiliate program**,
  so a link to louisvuitton.com can never earn a cent. The six retailers above all have programs. Same advice,
  same bag, but the click can actually pay once money-path step 7 lands.
- ✅ **BUILT** as a rule in the `sendChat` system prompt (the chat was the only shopping surface NOT already
  constrained to the store list; `_shopRules()` already says "PICK THE STORE from this list ONLY").
- ✅ **VERIFIED AGAINST THE LIVE API, 6/6 with ZERO direct-to-brand links**, including the hardest case
  ("Where should I buy a Louis Vuitton Neverfull?" → Saks, Neiman Marcus, Bloomingdales). A clarifying question
  back to her counts as neither pass nor fail; that is good styling, not a routing failure.
- ⚠️ **KNOWN EDGE, flagged to Cath, deliberately NOT special-cased:** a few houses genuinely do not wholesale at
  all (**Louis Vuitton, Chanel, Hermès**), so a department-store search for those specific bags may land on
  nothing or on resale. Every other house (Celine, Saint Laurent, Bottega, Gucci, Prada, Loewe) really is stocked
  there and works properly. Cath's preference is explicit, so the rule stands as written; revisit only if she sees
  it land badly in testing.
- **The Google Shopping fallback stays as a safety net** underneath this (PR #650), for when the model names a
  brand directly anyway. Belt and braces.
- ▶ **DO NOT add Louis Vuitton / Celine / Chanel as their own STORES entries.** They would need Cath's tags, they
  earn nothing, and the four multi-brand luxury retailers already in the 102 stock the same bags.

### ▶ THE LEGAL PAGES HAVE REAL URLs — `/privacy` · `/terms` · `/story` · `/faq`
Affiliate approval needs a URL for the privacy policy, and a single-page app had none.
`netlify.toml` **rewrites** these four (status **200**, not 301) to `/index.html`, and a small
router opens the matching screen — so the address bar keeps the pretty path and a reviewer sees
the real designed page. **The policy text is not duplicated anywhere.**
📁 *Build detail, the 56-check verification, and the boot-order reasoning are in `CLAUDE-archive.md`.*
- 🚨 **NEVER CHANGE THESE PATHS once a URL has been submitted to an affiliate network.**
  Also written into `netlify.toml` and the code comment.
- **To add a page later:** one entry in `_ROUTES`, one `[[redirects]]` block, one line in
  `_openRoute()`. ⚠️ **Every routeless screen must report `/`**, or the URL gets stranded.
- ⚠️ **DO NOT "TIDY" THE POLICY BACK INTO AN ABSOLUTE PROMISE.** It once read *"We never sell or
  share your personal information with third parties"* — but her email goes to MailerLite and her
  results to Supabase. **The absolute wording was the problem, not the practice.** It now reads
  *"We never sell your personal information, and we never share it with anyone who wants to market
  to you. We do share it with the trusted service providers who help us run Style Star…"*
  ▶ **A legal page is the one place a sentence must be literally true.**
- ▶ **STILL TO DO, low priority, flagged not fixed:** the policy does not name its sub-processors
  (Supabase, MailerLite, Anthropic) and has no California/CCPA section. Neither blocks affiliate
  approval. **Worth asking Almira when the trademarks are done.**
- ⚠️ **Amazon's required sentence is deliberately NOT on the page yet** — she is not an Associate
  and has no Amazon links, so it would be a false statement on the one page that must be true.
  See money-path step 7.

### ▶ EVERY SHOPPING SURFACE CARRIES AN AFFILIATE DISCLOSURE — the SIX places it lives
**This is the edit list for Amazon's required sentence at approval time.** One wording, byte-identical
everywhere, asserted by a test: **"Some links may earn us a commission."**
1. `.shopdisc` under **Complete the Look** (`#pShopList`, photo results)
2. `.shopdisc` under **Shop your style** on the photo results (`#shopContentPhoto`)
3. `.shopdisc` under **Shop your style** on the Style Portrait (`#shopContent`)
4. `.shop-disclosure` on the **Shop your style / wishlist screen** (`s-shopstyle`)
5. `.wdr-disclosure` **once at the top of Your Wardrobe**, below the tabs
6. `.chat-disclosure` in the **stylist chat** (the linkifier turns store names into links)
📁 *The audit, the width measurement, and the frequency decision are in `CLAUDE-archive.md`.* The rules:
- ⚠️ **The Edit and the Mall keep their own longer "nothing here is chosen by AI" version.
  DO NOT "unify" them with this one.** The fuller wording also stays in the Privacy Policy, FAQ
  and Terms, where there is room.
- ▶ **"at no extra cost to you" was CUT deliberately** — 25 of 67 characters, **not legally
  required**, and the apologetic part. Cutting it fixed a two-line wrap AND the tone at once.
  Cath's words: *"I don't like reminding our user so much about the commissions."*
- ▶ **ONE PER PAGE IS THE NORM.** Reviewers check a disclosure exists and is findable, not how
  many times it appears. Wardrobe once showed five on one 7,300px page; that was an accident of
  per-carousel rendering, not a compliance decision.
- ⚠️ **IT MUST NOT GO INSIDE `.wdr-howto`** — that block collapses once she has hearted 3+ items,
  so a disclosure living there would vanish for exactly the returning users who shop most.
- ⚠️⚠️ **A DISCLOSURE THAT CANNOT BE READ IS NOT A DISCLOSURE.** The instinct to make a legal
  notice the quietest thing on screen is **backwards**, and doubly so for an 18-to-80 audience.
  First attempt measured **2.5:1** and failed; now `#6e6e6e` at 11px, **4.6:1**. **Measure contrast
  against the REAL painted background** — a colour that reads fine on a light card vanishes on the
  dark results screen.
- ▶ **Before offering to SHRINK something to fit, measure whether shrinking can possibly close the
  gap.** Here it never could: 380px of text into a 240px carousel. **The font was never the lever;
  the words were.**

### ▶ NAVIGATION AUDIT (2026-07-29) — ✅ BUILT 2026-07-30
Eight different footer link sets, no Home button anywhere, 12+ screens exiting only via a small
grey Back. Fixed by making the logo go home everywhere and standardising one footer.
📁 *The full audit and the reasoning against a dropdown are in `CLAUDE-archive.md`.*
⚠️ **The reason it is NOT a dropdown is her mom's user test: a dropdown hides navigation behind a
tap AND a mental model — the same failure mode one level deeper.**
### ▶ CATH'S PARKED QUESTIONS (raised 2026-07-29, answered in chat, nothing built yet)
She wrote these down so they would not be lost. **Do not treat any of them as approved work** — they are
questions she wanted understood, plus one feature idea she likes. Resurface when the money path unblocks.
- **1. "Will the shopping change completely once we wire in affiliate links?"** ▶ The answer she was given, and
  the distinction is the important part, because **three separate things were being conflated**:
  **(a) affiliate TAGS** — appending her tracking id to the links that already exist. A day's work, changes
  nothing about how items are chosen, just makes the same click earn. **(b) PRODUCT-LEVEL links** — landing on
  a specific product page instead of a store search. Needs product feeds from the networks; a real build.
  **(c) the AI actually SEEING real inventory** — ⚠️ **it does not today, and she did not know that.** Right
  now the model invents a well-judged item name from its training knowledge ("Blush Strappy Block-Heel
  Sandals"), picks a store it believes carries that kind of thing, and `getStoreUrl()` runs a SEARCH for it.
  Nothing checks that the item exists, is in stock, or is in her size. **That is exactly why her homework item
  6, the quality gate, is the highest-value thing she can do** — only she can judge whether the search term was
  the right one. Approval alone does NOT fix this; product feeds are what fix it.
  - **Partial approvals degrade gracefully:** approved stores get tagged links, unapproved ones stay plain
    search links. Same experience, some earn and some do not.
  - ⚠️ **A DECISION SHE WILL FACE, flag it before it arrives:** whether to prefer an approved store when two are
    equally good. The standing rule (2026-07-27) is that commission data stays OUT of the app so picks are never
    biased by what pays best. Preferring an approved store as a TIE-BREAK is defensible; letting it outrank fit
    is not. **Her call, and it should be a deliberate one, not a drift.**
  - ▶ **THE PRIZE NOBODY HAS NAMED YET: product feeds would let the app honestly say "in your size" again.**
    That promise was removed from four places on 2026-07-27 because a store search cannot filter size. Real
    feeds carry size and stock, so the feature could come back for real. Worth remembering when she weighs
    whether feeds are worth the effort.
  - **A cheaper middle step than full feeds:** many retailers accept size/colour FILTERS in the search URL, so
    `getStoreUrl` could build a filtered search rather than a bare one. Much less work than ingesting catalogs,
    and lands her closer. Needs per-store research, same address-bar method as the URL audit.
- **2. "Can she save items she wants to buy later — a Style Star cart or faves list?"** ▶ She likes this and it
  is a genuinely good idea. **Most of the machinery already exists:** `wardrobeData` already persists hearts to
  localStorage AND Supabase, so a saved-items list is an extension, not a new system. **The gap is what gets
  saved:** the Wardrobe hearts save CATEGORIES ("White tops"), whereas she is describing saving a SPECIFIC
  suggestion — the actual card, item name + store + link. So: a save control on `_shopCard`, a new list, a
  screen to see it.
  ▶ **Why this is the strongest feature idea on the board: it connects three things already on the roadmap** —
  the long-parked **"Email me my wishlist"**, the planned **email capture on the Wardrobe page** (a high-intent
  moment), and **product images** at money-path step 7. It is also the natural reason for a woman to COME BACK,
  which is the one thing the app currently has no mechanism for.
- **3. She asked for other ideas.** ⚠️ **Deliberately given only a few, and told plainly that the honest answer
  is she does not need more ideas — she needs users.** Per her own stated growth edge (perfectionism as a
  hiding place, many directions at once), the useful move is to protect the one-lever-at-a-time discipline.
  **If she builds one more thing before testers, it should be the saved list.**

### ▶ CONTENT TO-DO (Cath, 2026-07-26 — she wants these, resurface each session)
- **📝 Add MORE items to What's Trending.** Cath explicitly wants to keep growing this list. Working pattern:
  Claude drafts candidate names + one-line blurbs in her voice (dash-free), Cath approves/cuts/rewrites — she is
  the trend authority, Claude never adds unilaterally. Remember to **re-sort seasonally** (first three feed the
  teaser). Every addition automatically relights the New pill for returning users.
- **📝 Add MORE items to the Style Star Edit** (`s-dream`, the founder-curated product list, `.dc-item`s in the
  markup). Cath wants to do this soon. NOTE the Edit's own "NEW" pill works the same way (`wbEditSig()` = the
  number of `.dc-item`s, stamped against `ss_edit_seen`), so adding items lights it up automatically too.
  When affiliate programs approve, this is also where product images + tagged links land (money-path step 7).

### ▶ RULES LEARNED / REAFFIRMED THIS SESSION (apply to all future Edit + Mall additions)
- **▶ EVERY new outbound product link gets `rel="sponsored noopener"`** (2026-07-31, affiliate-readiness
  pass). The 17 existing Edit links, the Mall cards and all AI shopping surfaces carry it; a new `.dc-item`
  added by hand must too, or `scratchpad/affq.js` fails on the anchor count/rel check.
- **▶ ALWAYS TRIM TRACKING PARAMETERS off product links.** Three reasons, the third is the money one: they go
  stale, they make links fragile, and **once affiliate links are live, extra tracking params can interfere with
  commission attribution.** What was stripped this session: Nordstrom `origin=`/`recs_*`/`breadcrumb=`/`color=`;
  Everything But Water `nav=root`, `List=Site+Search`, and a malformed empty `&=&`.
  **Canonical forms:** Nordstrom `https://www.nordstrom.com/s/<id>` · Bloomingdale's
  `/shop/product/<slug>?ID=<id>` (**the `?ID=` is REQUIRED, not tracking — do NOT strip it**) · Zappos
  `/p/<slug>/product/<id>/color/<n>` (already canonical; the short `/product/<id>` just redirects to it) ·
  **lululemon** `/p/<category>/<Name>/_/prod<id>` — strip BOTH `?color=` and `cid=` (the latter comes off their
  share button). **Confirmed working on-device by Cath 2026-07-27**, which matters because lululemon 403s every
  automated request including its own homepage, so it can never be machine-verified. · **Target**
  `/p/<slug>/-/A-<tcin>` (already canonical; note Target renders PRICE client-side and walls its own API, so the
  price always has to come from Cath).
- **▶ LIST THE REGULAR PRICE, NEVER THE SALE PRICE** (Cath asked directly about the $79/$71.10 espadrilles).
  Sales expire and the Edit is meant to be evergreen. The asymmetry is the argument: arriving to find an item
  **cheaper** than listed feels lucky; arriving to find it **more expensive** feels misled. Only one is recoverable.
- **▶ NAMING: brand first**, matching the existing entries ("L'AGENCE Dani Silk Charmeuse Blouse"). Append
  **" — Colour"** only when the link pins a specific colourway. Drop internal colour codes (Good American's
  "Indigo446" reads like a typo).
- **▶ LINK TO THE BASE PRODUCT (no colour pinned) when the note brags about colour range**, so the shopper sees
  all of them. Done for the Seafolly ("six beautiful colors") and the Felina ("get it in both nude and black").
- **▶ CLAUDE MUST NEVER PICK THE PRODUCTS.** The disclosure says "Nothing in the Style Star Edit is chosen by AI.
  Every piece is personally selected by our founder." Claude identifies GAPS and polishes NOTES; the picks are
  Cath's. Same for Mall stores. Protect this.
- **▶ RETAILER BOT BEHAVIOUR (saves re-testing):** **Bloomingdale's returns 403 to everything**, including its own
  homepage — a 403 there means nothing is wrong; verified by testing the long-live MZ Wallace link as a control.
  **Nordstrom returns 200 but serves a JS shell**, so the page loads yet the product name isn't readable
  server-side. **Zappos and Everything But Water serve real content** — those two can be fully verified (product
  name, price, even colour count). Always say plainly which details were verified and which weren't.
- **▶ VERIFICATION PATTERN for content-only edits** (no render harness needed): a Node script that (1) re-parses
  BOTH inline `<script>` blocks — all the app's JS lives in one block, so a stray character is fatal, (2) evaluates
  `trendItems`/`mallStores` directly in a VM to confirm counts and shape, (3) counts `.dc-item` blocks and checks
  stars/names/metas/links are all aligned with unique https URLs, (4) checks div-nesting balance after any
  hand-edited HTML, and (5) greps for mojibake (`Ã|â€|Â`).
- ⚠️ **GIT: `git cherry-pick` has NO `-q` flag.** Using it exits 129 *after* `git checkout -B` has already reset the
  branch, orphaning the just-made commit. Recovery: `git reflog --format="%H %gs" | grep -m1 "<subject>"` then
  cherry-pick that SHA. Nothing is lost, but check `git log` before assuming.
- ⚠️ **GIT: `--force-with-lease` fails if the remote-tracking ref is stale** (e.g. after fetching only `main`).
  Fix: `git fetch origin <branch>`, then confirm the remote branch holds only already-merged content with
  `git diff origin/<branch> origin/main --stat -- index.html` (empty = safe), then force.
- ⚠️ **GIT: two Edit items added in separate PRs WILL conflict** — every new `.dc-item` inserts at the same anchor
  (just above `<div class="dc-sign">`). Resolve by keeping BOTH, then re-verify item counts and div balance.

### ⭐⭐⭐ NEXT SESSION, AGREED WITH CATH 2026-09-06: WRITE HER BRIEF DOWN ONCE, AND TEST BOTH HALVES
▶▶ **THE JOB: go through every rule she has ever given, check that BOTH halves of the app obey each one,
write the list somewhere it can never be archived, and put a test on each.** Her words for why:
*"The confusion of one half of the app following some rules and the other half not — I do not understand
how this happened because the overall intent and goal of this whole app is very clear. It needs to match
her style with excellent searches and it needs to be user friendly."*

**⚠️ SHE ASKED WHETHER SHE NEEDS A NEW PROJECT FILE. THE ANSWER IS NO, and say so plainly if it comes up
again:** starting over would throw away her 107 picks, her store tags, her ten dimension tables and the
whole history, and would fix nothing — the file was never the problem.

**▶ THE DIAGNOSIS, in the words that finally landed with her: the app has TWO STYLISTS picking clothes.**
The AI, which has had her brief for months. And the nightly feed, added 2026-09-02, **which was never
handed the brief at all.** Nothing in this app says "when a new picker arrives, give it every rule", so
each rule had to be copied across by hand — and the ones that were missed looked exactly like working
rules until she saw them on her phone. **Four separate faults in one day, all the same shape:**
never-wear (two drifting copies) · her Tops sibling map (AI only) · the style filter (feed exempt) ·
her sweater call (feed only, and my half-fix made it MORE visible because the ceiling gave the AI more
cards). **Her intent was never unclear. It was in one head and not the other.**

**▶ THE RULES TO SWEEP, none invented — every one is hers and is written in this file or the archive:**
never-wear list · colour no's · size ranges per category · sweaters not on Tops · the sibling-row map
(`_WDR_IDEA_EXCLUDE`) · max two per retailer / all-different in a compare carousel · price spread ·
luxury routed through her retailers, never direct to the brand · store-pool eligibility (no subscription
boxes, no rentals, no fast fashion) · never invent a store's tags · never name her body or size back to
her · never ask her age · the checklist is a possibility map, never a requirement.
**▶ THE TWO HALVES to check each against:** the AI path (`_shopRules`, `_wardrobeIdeaGen`, `sendChat`
prompts) and the feed path (`curatedPicks`, `slot_match.py`, `data/slot-rules.json`).
⚠️ **A rule applied to one half is NOT applied. That is the sentence to keep.**

### 🚨 WHAT THE FEED DOES AND DOES NOT POWER — HER DECISION, NOT A LIMITATION
▶▶ **The nightly feed fills the 100 rows of the Wardrobe checklist ONLY. It is called from exactly one
place in the app.** The stylist chat, Shop your Style and Complete the Look do NOT consult it: there the
AI names a good piece, picks a store and opens that store's SEARCH page — no photo, no stock check.
✅ **THIS IS DELIBERATE AND IT IS CATH'S OWN CALL:** test the 6 new product feeds on the wardrobe list
first, with her eye on a real phone, before letting them reach the other shopping surfaces.
⚠️ **SO "more affiliate approvals" DOES NOT by itself improve chat or Shop your Style.** Those surfaces
have to be wired to the feed as a separate piece of work, and that work is hers to green-light.
🚨 **RESTORED 2026-09-06 AFTER I ARCHIVED IT AND THEN RE-DISCOVERED IT FROM THE CODE, and told her she
probably did not know it — her own decision, handed back to her as news.** It was in this file at the
start of that session; I moved it to the archive a few hours before. ▶ **A DECISION ABOUT SCOPE — what
we chose NOT to do yet, and why — is an open thread, not a finished build. It never archives.**

### 💰💰 AFFILIATE STATUS — LIVE, AND IT NEVER GOES TO THE ARCHIVE (restored 2026-09-06)
🚨 **WHY THIS SECTION EXISTS: on 2026-09-06 Cath said she had been rejected by Bloomingdale's, Nordstrom and
Shopbop, and I did not know. Measured immediately: the archive held 234 mentions of her affiliate networks;
`CLAUDE.md` held 4, and NOT ONE named a rejection.** The history was recorded properly and then archived —
but the archive is not loaded at session start, so from inside a session it may as well not exist.
▶▶ **THIS IS LIVE OPERATIONAL STATUS, WHICH IS AN OPEN THREAD, WHICH BY THIS FILE'S OWN RULE IS NEVER
ARCHIVED. Keep it here and keep it current.** Her words: *"all of that is important to overall strategy."*

**✅ RAKUTEN — publisher APPROVED, SID 4740535.** This is the whole live feed today, 7 stores:
**Mytheresa · FARM Rio (MID 44912) · Diane von Furstenberg (53590) · Vilebrequin (43322) · Olivela ·
Marissa Collections · Fleur du Mal.** ⚠️ **Every one is `$$$`/`$$$$` — that is the affordability problem
at its source, and no amount of code fixes it.**

**❌ THE REJECTIONS, AND THE ONE THING THEY ALL HAVE IN COMMON:**
| Who | When | Level | Reason |
|---|---|---|---|
| **Impact** | 2026-08-20 | **NETWORK** | **Traffic** (confirmed by their support 08-21; they invite reapplication) |
| **Bloomingdale's** | 2026-08-21 | one advertiser | **Traffic**, by elimination |
| **Shopbop** | — | one advertiser | one advertiser, reapplyable, predicted |
▶▶ **ALL THREE WERE TRAFFIC. NOT the app, NOT the policy pages, NOT the build.** For Bloomingdale's, three
of the four possible reasons were **ruled out by measurement the same hour**: the site returns 200 to any
user agent, apex and www 301 correctly, `/privacy` `/terms` `/faq` all 200, and — the one that actually
mattered for a single-page app — **the page renders fully readable WITH JAVASCRIPT OFF** (`scratchpad/nojs.mjs`
re-runs it; `scratchpad/reviewer-jsoff.png` is the proof).
⚠️ **DO NOT WEIGH THE IMPACT DECLINE LIKE THE OTHER TWO. It is NETWORK level and it gates NORDSTROM (6 of her
22 Edit items) AND PRODUCT PHOTOS.** The other two are single advertisers and cost her nothing to reapply.
▶ **Contacting a declining advertiser now is LOW VALUE — if the reason is traffic there is nothing to say
yet. Reapply from a stronger position; it costs nothing.**
⭐⭐ **THE STRATEGIC CONSEQUENCE, and it is the honest answer whenever she asks what unlocks the app: the
thing standing between Style Star and a mid-market feed is USERS, not code and not craft.** That is also
the strongest argument this file has for her own stated growth edge — *more solo polish < 10 real users*.
**Say it plainly when the affordability question comes round again; it is the same answer.**

**▶ THE ORDER TO APPLY, unchanged and still right:**
1. **AWIN** — ⚠️ **3 applications PENDING: Jackie Mack Designs · TERI JON · Under Armour US.**
   ⚠️ Small **REFUNDABLE** deposit to apply (their spam filter, refunded against the first commission) —
   **verify the amount on the day.**
   🚨🚨 **CORRECTED 2026-09-08, BY CATH, AND THE OLD CLAIM HERE WAS WRONG.** This file used to say
   *"Under Armour is the nearest thing to a mid-market approval on the board, which is why this file
   keeps naming it"* — which quietly turned into "Under Armour would fix the prices." **Her words:
   *"That is only sporty workout clothes. It won't change much at all."*** ▶▶ **MEASURED against her own
   100 checklist rows, and she is right: Under Armour could serve about 13 of them** — the 11 activewear
   rows (`ac1` legging · `ac2` jogger · `ac3` training short · `ac4` sports bra · `ac5`-`ac7` training
   tops · `ac8` track jacket · `ac11` athletic set · `ac12` skort · `ac13` socks), plus `sh10` running
   shoe and `bg6` gym bag. **It touches NONE of the 75 rows where the luxury skew actually hurts:** 8
   tops · 8 dresses · 10 bottoms · 10 jackets/coats · 15 other shoes · 12 other bags · 12 jewellery and
   accessories. **It is performance kit, not clothes a woman gets dressed in.**
   ⚠️ **AND NEITHER DO THE OTHER TWO PENDING ONES: Jackie Mack Designs is jewellery, TERI JON is
   occasion/eveningwear.** So **none of the three pending AWIN applications changes the price problem.**
   ▶ **WHAT ACTUALLY FIXES IT IS A MID-MARKET GENERALIST** — a department store, or a broad brand
   carrying tops, dresses, bottoms, jackets, shoes AND bags across price bands. **That is exactly what
   Bloomingdale's and Nordstrom were, and both declined her for TRAFFIC.**
   ⚠️ **SO THE ANSWER IS STILL USERS, NOT AN APPLICATION** — which is the uncomfortable one, and the
   honest one. Say it plainly instead of naming a brand that sounds like progress.
   ▶ **THE LESSON FOR THIS FILE: "the only mid-market thing pending" is NOT the same claim as "the thing
   that fixes affordability", and it silently became one.** She caught it; the numbers agreed with her.
2. **CJ** — free, no clock, "costs nothing but an evening". Not done yet.
3. **NORDSTROM CREATORS** (`nordstromcreators.com`, Impact's creator product) — **door 2 for Nordstrom**,
   when her follower count is not the weakest thing she brings.
4. **AMAZON LAST.** 🚨 **3 qualifying sales within 180 days of APPROVAL, and the clock starts at APPROVAL,
   not at launch.** Applying while the app has no users burns the window for nothing.
🚨 **STANDING CORRECTION — SHAREASALE NO LONGER EXISTS.** Awin bought it and closed it at the end of 2025.
**The live list is: Rakuten Advertising · Awin · Impact · CJ.** Any older entry naming ShareASale is stale.

### ▶ REMINDER FOR WHEN AFFILIATE APPROVALS LAND (Cath asked 2026-07-27 to be reminded — surface at money-path step 7)
Cath's own words: *"when it comes time for us to get approved for affiliate links please remind me to think about
adding more swim stores to the mall and also figure out how to make the most of our links and provide broad ranges etc."*
So, at that moment, walk her through:
1. **Add more swim stores to the Mall** and split out a proper dedicated swim section (see the 2-column-grid note above).
2. **Get the most out of every link** — deep-link to actual PRODUCTS rather than store search URLs (the whole app
   still uses `getStoreUrl()` search links, which convert far worse than product links), and audit every outbound
   link so each carries her tag: Mall stores, Style Star Edit items, "Complete the Look" on outfit results, the
   "Ideas" carousels in Your Wardrobe, and Shop-your-style picks.
3. **Provide broad ranges** — price (she already spans $17 to $510, keep it), sizes (inclusive/extended, petite,
   tall, wide-width), and store mix, so every woman in an 18-to-80 audience finds something she can actually buy.
4. **Prefer retailers with real affiliate programs.** Flagged this session: **Sexy Little Robe** and **Baby Gold**
   are small independent brands that may have NO affiliate program, so those two Edit items may earn $0 forever.
   Fine for genuine loves, worth knowing. Big multi-brand retailers are also more DURABLE (a sold-out product on
   Nordstrom still resolves; a small brand's link breaks).
5. Then: product images on the Edit + Mall + Your Wardrobe List (turning them into real lookbooks), and confirm
   final **FTC disclosure** wording/placement with Almira. ▶ **Cath asked (2026-07-31) to be REMINDED at this
   moment: product images are also the answer to the Build hub feeling small** — real photos turn the wardrobe
   list + trending into a lookbook, which is why Build stayed its own hub. Raise it when feeds land.
6. ⚠️ **ADD AMAZON'S REQUIRED SENTENCE — deliberately NOT shipped yet, see 2026-07-29 below.** The moment the
   Associates account is approved AND the first Amazon link goes live, the exact string must appear:
   **"As an Amazon Associate I earn from qualifying purchases."** Not a paraphrase — Amazon requires that
   wording. Put it in the Privacy Policy's Affiliate links section and beside the link surfaces.
   ✅ **Every shopping surface now carries a disclosure (done 2026-07-29)** — see the audit section below for
   the list of **six** places the wording lives, which is exactly the list to edit at that moment.
7. ⚠️ **AMAZON'S 180-DAY CLOCK — a sequencing trap, tell her before she applies.** Once accepted, Amazon
   requires **3 qualifying sales within 180 days** or it closes the account. The clock starts at APPROVAL, not
   at launch. So applying to Amazon the day the business bank account opens, while the app still has no users,
   burns the window for nothing. **Apply to the networks without that rule first** (most of the 102 stores run
   through Rakuten / Awin / Impact / CJ — ⚠️ **NOT ShareASale, which Awin closed at the end of 2025**),
   and save Amazon until there is real traffic. Re-check the
   current terms at application time; program rules change.

### ▶ BRAND FRAMING RULE: how to talk about "10 categories, 100 items" (agreed 2026-07-27)
Cath wants 10-and-100 as a memorable talking point. It's a strong hook, but the FRAMING matters and she sensed it
herself (she wrote "need (or want)" and hedged).
- **❌ Avoid:** "women NEED 100 items for a complete closet." To a woman on a budget, or one who owns thirty things,
  that lands as a bill she can't pay. It's the one framing that works against the brand's core promise that she is
  never lacking.
- **✅ Use instead, a MAP not a MANDATE:** **"10 categories. 100 pieces. Everything a complete wardrobe could hold."**
  Or: *"The 100 pieces that make up a fully rounded closet, heart the ones missing from yours."* The number keeps
  all its memorable power; the promise becomes *here is the whole territory* rather than *here is what you owe*.
  It's also truer to the feature: nobody wants all 100, and the list never asks her to.
- **⚠️ Practical consequence:** once 100 is said publicly, the list is PINNED at 100. Every future addition needs a
  matching cut. Healthy constraint on a curated list, but a real one. Flag it before she uses the number in copy.
- This rule generalizes: **the checklist is a possibility map, never a requirement list.** Apply it to any future
  copy, marketing, or the eventual paid Style Guide.

### ▶ SIZE RANGES: what we can honestly promise (decided 2026-07-27)
- ⚠️ **The app currently OVER-PROMISES "in your size" in FOUR places** and cannot deliver it: the Wardrobe how-to ("tap
  Ideas to see them in your size and style"), every trending card and teaser card ("See ideas in your size →"), and the
  FAQ ("shopping ideas in your size"). A store search returns every size; nothing filters. **Cath's call: fix the copy,
  do not promise size finds we can't do.** What IS true today: colors mostly carry through (colour is in the search
  words), and never-wear exclusions are honoured absolutely by the prompt.
- ✅ **What we CAN honestly do: size RANGES via the search term.** `petite midi dress`, `plus size midi dress`,
  `tall trousers` all return real results at most major retailers. So numeric sizes no, ranges yes.
- ✅ **Refine question changing** from the pants-length question (`pantsFit`, ~line 4339: "I often need shorter/cropped
  lengths / Standard lengths work fine / I usually need longer lengths") to a direct **"Do you usually shop petite,
  regular, tall, or plus?" — MULTI-SELECT** (petite-plus is real). Migrate old saved answers: shorter/cropped → petite,
  longer → tall, standard → regular. Cath and other early users already have saved prefs, so don't drop them.
- **▶ CATH'S KEY RULE (stylist insight, protect this): size range applies PER CATEGORY, never globally.** Her words:
  short clients still wear regular-length dresses, athletic wear, bags and accessories, "so let's make sure our special
  sizing ladies don't get fewer pickings because of that."
  - **Petite/Tall** matter for: pants, jeans, trousers, maxi dresses, coats, anything length-driven. **Irrelevant for:**
    bags, jewelry, accessories, shoes, most tops, most dresses.
  - **Plus** matters for apparel generally. **Irrelevant for:** bags, jewelry, sunglasses, hats, shoes.
  - The size qualifier AND any store narrowing apply ONLY where fit depends on it. Everywhere else she sees the full
    store list. **Nobody gets a smaller world because of her body.**
  - Consequence: prefer petite/plus-carrying stores for a petite trouser; ignore that entirely for a handbag (sending a
    plus-size woman to Zara for a dress is a bad experience no matter how good the search is).

### ▶ CATH'S HOMEWORK — things only she can do (list requested 2026-07-27, resurface each session)
Cath asked what she can do to be more thorough between sessions. These are genuinely blocked on her expertise or her
phone, not on Claude's time. Roughly in value order.
⚠️ **STATUS 2026-07-27 night: items 1, 2, 3 and 5 are DONE** — Cath tagged all 102 stores herself across three
batches, then sent four more dimension tables (fitted/alluring/polish, classic/trendy/casual/dressy,
relaxed/fitted, neutral/colorful). Item 6, the real quality gate, is IN PROGRESS: she has started tapping through
and found two things so far. **Only 4, 6 and 7 remain.**
**1. ✅ DONE — SIZE METADATA PER STORE.** For each of the ~70 stores: does it carry **petite**,
   **plus**, **tall**, and (for shoes) **wide/narrow widths**? She has already given petite for Talbots, LOFT and
   Banana Republic. Claude will draft the full set and she corrects it, but anything she notes while shopping is
   directly usable. Remember the reframing: petite/tall is mostly a SUB-LINE of stores already on the list, so this is
   tagging work, not sourcing work.
**2. ✅ DONE — CATEGORY STRENGTHS — pure stylist knowledge Claude cannot infer.** Which store is her go-to for dresses? For
   denim? Work clothes? Occasion? Shoes? Jewelry? This is what lets the AI send a woman to the right place instead of
   a plausible one, and it is exactly the expertise that differentiates the app.
**3. ✅ DONE — PRICE TIER SANITY CHECK.** Claude will assign budget / mid / luxe per store; Cath knows where each really sits
   for HER audience, which spans 18 to 80 and every budget.
**4. SPOT-VERIFY THE UNVERIFIABLE STORES** using the address-bar trick that solved J.Jill and Mango (search on the
   site, send the URL). Only worth doing for stores she would actually send a client to. Currently unverified:
   Talbots, Kendra Scott, SKIMS, Lane Bryant, Dia&Co, Sam Edelman, Lacoste, Tory Burch, Belk, Bergdorf Goodman,
   TJ Maxx, Sunglass Hut, Warby Parker, Dillard's, plus the ~11 bot-walled ones already proven by being live today.
**5. ✅ DONE — THE TWO PIECES OF COPY.** ("Find it" chosen; "in your style" replaced every size promise.) Originally: (a) The card wording — is "Find this at Nordstrom →" right, or does she
   have better? (b) The four "in your size" spots — replacement wording in her voice ("in your style"? "picked for
   you"?).
**6. ⭐ IN PROGRESS — THE REAL QUALITY GATE:** tap through 10-15 suggestions across Shop your style, Wardrobe
   Ideas and Complete the Look, and tell Claude **where the searches land wrong**. Claude can verify a link returns
   results; only Cath can judge whether "pink midi dress" is the right search for a blush silk wrap dress. This single
   step is the difference between the fix working and half-working.
**7. (No pressure, her own timing) THINK ABOUT FIRST TESTERS.** Once the shopping is honest, who are the 5-10 warm,
   constructive people? Her soft-launch instinct is legitimate and protected — this is just so the list exists when
   she wants it.

---

### ▶ WHY STYLE STAR LOOKS THE WAY IT DOES (Cath, 2026-09-04) — her own origin story, in full, so it never has to be re-derived
She said she had never said this out loud before. Recorded here verbatim-ish because it is the deepest founder-truth
document in this whole file, and every standing product rule below it can be traced straight back to one line in it.

**Why she built it at all.** Before Style Star existed she tried, and PAID FOR, every competitor styling app and
subscription box on the market — not as competitive research, in her words, but in the spirit of *"I am a stylist,
wouldn't it be fun for me to have a stylist too."* She has always been curious about AI, thought it would be a fun way
to enhance her own wardrobe, and was genuinely willing to pay because she loves clothes and accessories and shoes, and
because looking the part is part of her job. **Every single app disappointed her.**

**The Stitch Fix story — the sharpest one, and it is the origin of the never-wear guarantee.** Her first box asked her
to write a note to her assigned stylist describing her style and her likes and dislikes. She wrote something detailed
and specific: she does **NOT** like shift dresses; she has broad shoulders and prefers halter necklines, spaghetti
straps and 3/4 sleeves; she never, ever wears a shift dress or a wide-strap tank top, because neither is flattering on
her. She also wrote admiringly about Cindy Crawford's casual street style — jeans, relaxed-shoulder blouses, belts,
good shoes and bags — and noted she is about Cindy's own age and size. **She received a box full of shift dresses.**
She was mortified, and cancelled immediately. Her own words: *"Stitch Fix's marketing made me feel like a real person
would read my note."* It didn't. (She's fair-minded about it — she assumes they've improved their practices since.)
▶ **This is the real-world failure that Style Star's `filterNeverWear()` GUARANTEE exists to make structurally
impossible** — a rule stated in a prompt is exactly what failed her; a rule enforced in code, checked on every card
before it renders, is the fix.

**The other failures, and what each one built:**
- **Closet-photography apps** ("photograph your whole closet first") — would take *"one million years,"* would
  frustrate her, and she'd hate for her own clients to have to do it. Her line: *"People want fresh new clothes, not a
  cleaning project. That is a whole other service."* ▶ This is why the Wardrobe checklist is a **possibility map, never
  an inventory requirement** — the standing brand-framing rule (2026-07-27) that the 100 items are things a closet
  COULD hold, never a bill she owes.
- **Generic like/dislike outfit-photo quizzes** — she never liked any of the photos shown; too generic to express her
  real style. ▶ Style Star's quiz uses her own sliders (Classic↔Trendy, Casual↔Dressy, Natural↔Glam, etc.) and produces
  a written archetype, never a photo-tinder pass.
- **Invasive personal questions** — age, height, weight, job, and selfie/body-photo asks, all "annoying." ▶ **This is
  the direct origin of two already-standing rules**: the app never asks a woman her age (reaffirmed 2026-08-22, the
  prom/homecoming conversation), and the app never mentions a woman's body or size range back to her while she is
  shopping (2026-07-28). Both traced back to this exact complaint.
- **An immediate, non-dismissible email ask, and paywalls before trying any feature** — *"incredibly annoying."*
  ▶ This is the direct origin of the standing **VALUE FIRST, never pay-to-try** principle (2026-07-12) and of the
  house rule that every in-app whisper/nudge is dismissible, non-blocking, and appears only after real value has
  already been shown — most recently the 2026-08-20 refine-done screen rebuild, which put the "Let's go shopping"
  button in front of EVERY woman rather than hiding it behind an email ask.
- **A Rachel Zoe-backed app** (she loves Rachel Zoe) that composited her photo onto a featured outfit — a fun idea in
  theory, but *"absolutely ridiculous"* in practice, because real body measurements and size charts aren't matched by
  that technology yet, so it never worked like an actual try-on. ▶ This is the honest boundary behind why Analyze an
  Outfit gives feedback ON what she's already wearing rather than compositing her photo onto new garments — an honest
  limit, not an oversight.

**The business philosophy, stated as an analogy she chose herself:** she knows it would probably be smarter, business-
wise, to grab emails immediately and charge for a subscription up front — and she finds that cringy. She compared it to
Zappos launching free shipping and free returns: *"it was like what? a shoe company home try-ons and free returns"* —
it felt outrageous at the time and became beloved and huge because of exactly that generosity. Her words: *"I want this
to be awesome to use, fun, easy, free but I also want it to gain followers/users so we can make it better than ever."*

**The competitive frame she wants remembered:** she looked at another shopping app that was raising millions of dollars
to launch and could not see the value in it. Her own words, kept verbatim because they are the truest sentence in this
whole file about what this project actually is: *"This thing is just you and me alone building it. No millions of
dollars, but thousands of micro decisions made and a lot of tenacity to stick with it."*

**Her closing ask, held onto for every future session:** *"Sometimes I feel like I am losing momentum or not going to
get it done. Don't let me quit."* ▶ **STANDING INSTRUCTION: answer this with real, specific, countable momentum, never
generic cheerleading, every time it comes up again.**
