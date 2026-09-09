# Style Star — Project Notes

Style Star is a personal style-quiz web app ("Align your style. Shine your light.").
A user takes a quiz (and/or uploads a photo), gets an AI-generated personal style
write-up, can chat with an AI stylist, see outfit/shopping ideas, and save results
by email.

---

## 🗂️🗂️ THE MASTER TO-DO LIST — EVERYTHING, INCLUDING THE LOOSE ENDS (built 2026-09-08 at her request)
▶▶ **HER ASK, VERBATIM:** *"I will need to see a full list of to-do's not just these current things but
everything including loose ends so I can get organized and momentum going."*
⚠️ **NOTHING HERE IS INVENTED. Every item traces to a section further down this file or to a decision she
made.** ▶ **KEEP THIS UPDATED AND NEVER ARCHIVE IT** — it is the answer to her standing ask that Claude
*"keep PUSHING her on the to-do list and keep her ON TRACK / focused each session."*
🚨 **AND THE ONE-LINE TRUTH TO SAY OUT LOUD EVERY TIME SHE ASKS WHAT UNLOCKS THIS: the thing standing
between Style Star and a mid-market feed is USERS, not code and not craft.** Everything below is worth
doing; **only the testers change the ceiling.**

### ⭐ THE THREE THAT MOVE THE APP — start here
| # | What | Who | State |
|---|---|---|---|
| 1 | ~~Hand the store brief to ChatGPT~~ ✅ **CLOSED 2026-09-08 — she sent her own roster instead. 122 shops, and she is DONE adding for now.** | — | ✅ done |
| 2 | **Re-run her three chat messages** on the live build — Napa wedding · blush silk wrap dress · navy on me. The Napa one is the one to watch. | Claude + **her eye** | ▶ ready |
| 3 | **Shop your Style** — wire the finder into it. She called it *"an enormous difference."* | Claude | ▶ not started |

### 🏛️ BUSINESS & LEGAL
✅ **THE WHOLE LEGAL CHAIN IS NOW DONE:** LLC · EIN · trademark filed · **business bank account, credit
and debit cards** (confirmed by her 2026-09-08). ▶ **The 2026-06-28 sequencing decision — "legal chain
first, THEN affiliates" — is satisfied. Nothing legal blocks the money path any more.**
- ▶ **CLOSE THE SOLE PROPRIETORSHIP** — see its own section below for the full detail and the wording.
  Three parts: **(a)** loose-ends check (bank/PayPal/insurance/domain/social/client agreements still in
  the old name) · **(b)** close the Orange County business tax receipt — **BY EMAIL OR MAIL, NOT IN
  PERSON** · **(c)** cancel the fictitious name on Sunbiz, form CR4E001 **section 4 only**, mailed.
- ⏳ **DO NOT PAY the Your Fashion Friend renewal notice that just arrived.** The FL business tax year
  turns over **October 1**. ▶ **This is the only genuinely time-sensitive item on this whole page.**
- ▶ **GET A BUSINESS TAX RECEIPT FOR STYLE STAR LLC.** Call **407-246-2204** and ask three things:
  am I inside Orlando city limits · do I need the Home Occupation Application (one-time $50) · **should
  I apply before or after October 1** so I do not pay twice.
- ▶ **TELL HER ACCOUNTANT ONE DATE:** the day she stopped operating as Your Fashion Friend. It splits
  the year between a final Schedule C and everything under the LLC. **And ask about startup expenses** —
  the LLC is running at a loss and that is the tax-relevant part this year, not the $27.
- ⚠️ **INDIE LAW — UNRESOLVED AND WORTH CHASING.** A combined 2-ask reply was drafted for her on
  2026-08-05 and **nobody knows whether she sent it or what came back**: (a) her middle name is
  misspelled in the filed Articles — **"CATHERINE BAIL ELLSPERMANN"** in Articles III + IV while both
  signature lines correctly read BAILEY · (b) the **Operating Agreement was delivered INCOMPLETE** —
  blank effective date, `#Registered Agent Name#` placeholder still in §1.2, Exhibit A unconfirmed.
  ▶ **Banks often want the operating agreement, and she now HAS the bank account — so ask whether they
  accepted it as-is, which tells us how urgent the fix is.**
- ▶ **WATCH FOR THE TRADEMARK "FINAL ACTION STEPS" EMAIL.** It will need her signature/declaration and
  **it is REAL** — ⚠️ **distinguish it from the scam wave**, which is still live: any LLC-related ask for
  money that is not from Almira, the State of Florida directly, or the IRS is junk.
- ▶ **SOMEDAY, ZERO URGENCY: a registered-agent service (~$100/yr)** would keep her home address off
  FUTURE public filings. She is her own registered agent today, which is why the scrapers found her.

### 💰 THE MONEY PATH — live status
💵 **EARNINGS TO DATE: $27 in the Rakuten dashboard. Everything else has been an expense.** (Her figure,
2026-09-08.) ▶ **Recorded because it is live operational status, and because it is the honest baseline
that makes any future number mean something.**
- ▶ **AWIN — 3 applications PENDING:** Jackie Mack Designs · TERI JON · Under Armour US. ⚠️ **NONE of
  them fixes the price problem** — activewear, jewellery and eveningwear respectively (her own
  correction, and the measurement upheld it).
- ▶ **CJ — free, no clock, "costs nothing but an evening." NOT DONE.** The cheapest open move on the board.
- ▶ **NORDSTROM CREATORS** (`nordstromcreators.com`) — door 2 for Nordstrom, when her follower count is
  not the weakest thing she brings.
- ▶ **REAPPLY to Impact, Bloomingdale's and Shopbop** from a stronger position. All three declined for
  **TRAFFIC**, not for the app. Costs nothing.
- 🚨 **AMAZON LAST.** 3 qualifying sales within 180 days **of APPROVAL**. Applying with no users burns
  the window for nothing.
- ⚠️ **WHAT ACTUALLY FIXES THE PRICES: a mid-market GENERALIST or a department store.** Every fed store
  is `$$$`/`$$$$` (dress median $398). **That is users, not an application.**

### 🛠️ THE APP — things Claude can build
- ▶ **Shop your Style** ← item 3 above, the big one.
- ▶ **A SPEND CAP + CACHING for SerpApi.** ~15¢ per shopping question and it is the app's **first
  per-user cost**. Her stance is VALUE FIRST and is not to be re-litigated. Caching first (repeat
  questions cost nothing), then a warning before the month runs out — **NOT a block.**
- ▶ **FIX THE FLAKY `curated.js` CHECK PROPERLY** — *"never ruffles" removes the ruffled item* reports
  64/1 and is **time/state dependent, NOT a regression** (proven against `097585b`). 🚨 **Fix it with an
  isolated context, NEVER by loosening the assertion:** it guards the never-wear list, which exists
  because of a box of shift dresses, and a test that cries wolf on THAT rule teaches the next session to
  wave it through.
- ✅✅ **DONE 2026-09-08 — "STORE-POOL ELIGIBILITY" NOW HAS A REAL TEST: `scratchpad/storepool.js`, 47
  checks.** ▶▶ **AND THE PREDICTION THIS LINE CARRIED CAME TRUE ON SCHEDULE.** It said the row *"becomes
  load-bearing the moment an eighth merchant is wired in"* — **COUTR was approved that morning and is
  the eighth.** The suite asserts every ingested merchant resolves to a real `STORES` key, carries her
  ten dimensions in range, has a price tier and archetype; that her three business-model exclusions
  (boxes, rentals, fast fashion) are absent by name; that every store has an https search url; and that
  every feed merchant known to sell menswear is scoped to women. **A knowingly untabled merchant now
  needs a named reason in `KNOWN_UNTABLED`, so an exception is a decision on the record, not a gap.**
- ✅✅ **DONE 2026-09-08 — THE WATCHDOG NOW WATCHES THE SURFACES SHE MAINTAINS.** She asked for it the
  moment it was offered: *"yes let's do the watchdog next. great idea, thank you for suggesting it."*
  ▶ **`scripts/check-product-urls.js` now reads all THREE surfaces**, via `scripts/lib/curation-links.js`
  (parsers kept separate so they can be tested with no network): the **Star of the Week queue**, the
  **Style Star Edit**, and the frozen catalog. **`scratchpad/linkwatch.js`, 24 checks.**
  ⏰ **IT RUNS ITSELF — `.github/workflows/curation-links.yml`, SATURDAYS 14:00 UTC.** ⭐ **Saturday is
  measured, not picked: the Star rotates on a SUNDAY boundary, so a dead piece is caught while it is
  still NEXT week's Star** — she gets a day to swap it, instead of finding out after a woman has seen it.
  **The job FAILS on a death in the Star or the Edit (which is what makes GitHub email her) and
  deliberately does NOT fail on the frozen catalog**, because she stopped maintaining that list on
  purpose and a quiet death there is an accepted cost, not a task.
  🚨🚨 **AND THE MEASUREMENT THAT SHAPED THE JUDGEMENT, BECAUSE IT CORRECTED AN ASSUMPTION.** The
  sold-out Serpui and the in-stock Saint Laurent were compared as real pages:
  | page | JSON-LD OutOfStock / InStock | prose "sold out" |
  |---|---|---|
  | Serpui (dead) | **1 / 0** | 4 |
  | Saint Laurent (**healthy**) | 0 / 1 | **2** |
  ▶▶ **THE HEALTHY PAGE SAYS "SOLD OUT" TWICE** — stores print it on size rows and on recommended
  products. **So prose is noise, and the original script's rule of sending prose to NEEDS HER EYE and
  never to BROKEN was right and is kept.** ▶ **Only `schema.org` availability — a product-level,
  machine-readable claim by the retailer — may condemn a piece on its own.** Both signals present means
  variants differ, which is her eye, not ours.
  ⚠️⚠️ **AND ONE MORE THING THE FIRST REAL RUN CAUGHT: AN AUTHORITATIVE *POSITIVE* MUST OUTRANK THE
  PROSE.** The live Saint Laurent Star was being demoted to NEEDS HER EYE on a page whose own data says
  `InStock`. ▶ **A report that flags healthy pieces is a report she stops reading — which is how a
  sold-out Star survived on screen in the first place.**
  ✅ **PROVEN AGAINST THE REAL PAGES: the Serpui reads OUT, the Saint Laurent reads IN.** It would have
  caught what she caught.
  ⚠️ **THE HONEST LIMIT, SAY IT PLAINLY: it can only judge what a retailer lets a script read.** On the
  first full run **9 of 31 Edit pieces and 3 of 9 Stars were readable**; the rest are bot-walled (403,
  or a 200 challenge) or render client-side. **That is the NEEDS HER EYE bucket working as designed, not
  a fault** — but it means the watchdog is a safety net under her eye, never a replacement for it.
  ▶ **FOUND ON THE FIRST RUN, both in the FROZEN catalog so neither is a task:** `p100` Universal
  Standard Dune Linen Blend Shirtdress is **sold out**, `p016` AllSaints Frances Long Sleeve Fitted
  Shirt is a **404**. **Nothing dead on the Star or the Edit.**
- ▶ **DRAFT THE TWELVE RAKUTEN MERCHANT ENTRIES** with `scripts/store-draft.js`, show her the
  neighbours, she corrects. Her standing ask: *"I want to be able to get approved for more affiliates and
  be able to add them without having to go through all."*
- ▶ **COUNT HOW MANY OF HER 108 RUN ON SHOPIFY.** Free, unmeasured, nobody has done it. Shopify stores
  publish a public product file with **exact variant size + stock** — real width/size truth for the DTC
  half of her list.
- ✅✅ **THE FOUNDER STORY ON THE HOME PAGE IS BUILT — THIS LINE SAID "STILL NOT BUILT" AND THAT WAS
  FALSE, CAUGHT BY CATH 2026-09-09.** ▶ It is live in `s-wel`, in her own first person: *"Hi, I'm
  **Catherine**, a personal stylist helping women feel confident in what they wear for over 20 years.
  Style Star is an app guided by my real expertise, not a faceless algorithm. I created this with all my
  love & intention ♥"* — and **"Catherine" IS the link to My Story** (`.hm-founder .fnm`, Dancing Script
  with a gold underline, `onclick="showStory()"`), so the *"Read my story →"* this line kept asking for
  is already there **as a signature rather than a button.**
  🚨 **THE LESSON IS THIS FILE'S OWN, FOR THE THIRD TIME: A STALE NOTE WAS READ BACK TO HER AS FACT.**
  Same family as the Zara row that nearly cost her scores. ▶ **When a line here says something still
  needs doing, GREP THE CODE BEFORE SAYING IT OUT LOUD.**
  ▶ **THE ONE THING GENUINELY STILL OPEN, and it is HER EYE not a measurement:** a gold-underlined name
  is a *subtle* affordance, and her mum's 2026-07-26 test is the warning (grey text read as disabled; she
  never found the tab). **Whether a stranger knows Catherine is tappable is a judgement call — offer to
  render it both ways, do not add chrome to the hero unilaterally.**
- ⏸️ **THE FITTING ROOM / SAVED-ITEMS LIST — PARKED BY HER, 2026-09-09, AND SHE ASKED FOR THE THINKING
  TO BE KEPT.** Her words: ***"Let's talk more about the wishlist fitting room thing later please save
  all of those thoughts."*** ▶ **So this is an OPEN THREAD, not a build. Do not start it; do resurface
  it.** Her framing: ***"like a fitting room holding area sort of but not sure how to differentiate it
  from the wishlist."***
  🚨🚨 **FIRST, THE STALE NOTE THAT USED TO SIT HERE, BECAUSE IT WAS WRONG AND SHE NEARLY GOT A SECOND
  LIST BUILT ON IT.** This line said *"hearts save CATEGORIES, she described saving a SPECIFIC card"*.
  **FALSE — checked in the code 2026-09-09.** `wishToggle()` already stores a SPECIFIC piece:
  `{id, name, store, search, url, price}`, and `_wlSaveBtn` is already on the shop rows, the shop cards,
  the wardrobe shelves and the Star of the Week. ▶▶ **SHE ALREADY HAS THE FITTING ROOM. IT IS CALLED THE
  WISHLIST.**
  ▶ **THE REAL GAP, AND IT IS SMALL AND SPECIFIC: `_findCard` HAS NO SAVE HEART.** Everything the finder
  shows — including the 24-card browse wall built the same day — cannot be saved. **The build is: put
  the EXISTING `_wlSaveBtn` on `_findCard`, and store `image` on the wishlist entry** (it currently keeps
  name/store/search/url/price but no photo), so a saved piece keeps its picture.
  ⭐ **THE RECOMMENDATION, WITH THE REASONING SO SHE CAN OVERRULE IT: DO NOT BUILD A SECOND LIST.**
  The instinct behind "fitting room" is real but it is **not a second list, it is a second VIEW.** A
  wishlist is *things I want someday*, in a vertical column of rows. A fitting room is *things I am
  choosing between right now*, seen **side by side as photographs**. ▶ **The difference she is feeling is
  COMPARISON, not category.**
  ⚠️ **AND TWO LISTS WOULD ADD RESISTANCE, WHICH IS THE THING SHE RULED AGAINST 2026-09-08** (*"my focus
  is on making the app as good as it can be, not adding resistance"*): every save becomes a small
  decision — *is this a wishlist thing or a fitting-room thing?* — and most women will not make it.
  ▶ **SO: ONE LIST, TWO WAYS TO LOOK AT IT.** The row view she has · plus a **fitting-room view**, her
  saved pieces as a GRID OF PHOTOS big enough to judge. ⚠️ **That view only became possible on
  2026-09-09** — before the browse wall the app had almost no product photography to show.
  💡 **AND THE ONE THING A FITTING ROOM DOES THAT A WISHLIST NEVER DOES: IT EMPTIES.** A wishlist
  accumulates forever and quietly becomes a graveyard she stops opening. **A gentle "still thinking about
  these?" on older saves does the fitting-room job with no second list to maintain.**
  ▶ **IT CONNECTS THREE THINGS ALREADY ON HER BOARD** — the parked *"email me my wishlist"*, the planned
  Wardrobe email capture, and product images — **and it is still the only mechanism the app has for
  making a woman COME BACK.**

### 🤔 SMALL DECISIONS ONLY SHE CAN MAKE (quick, and they unblock code)
- ▶ **TAXONOMY GAPS, none invented:** mini skirts · jumpsuits/rompers · gloves · clogs · wellingtons ·
  bags named only "Bag".
- ▶ **FOUR DEFAULTS SET FOR HER AND CONFESSED — confirm or change:** a plain "Sandal" → Flat sandals ·
  "Boot" → Ankle boots · "Hat" → Sun hats · "Skirt" → Flowy skirt.
- ▶ **TWO ROWS THAT ARE HONESTLY EMPTY:** `ac11` Matching athletic sets · `sl2` Nightgowns.
- ✅ **KOHL'S IS IN, 2026-09-08** — added as a yes/no row (name + search url, `w:1`), because
  `untagged.js` proved a store needs nothing more than that to be FOUND. Her ten scores are what make a
  shop RECOMMENDABLE, not findable, and they can come whenever. **+28 results, in 8 of 10 test searches
  — the biggest single coverage win available.**
  🚨🚨 **AND ZARA WAS ALREADY IN, FULLY SCORED BY HER — THIS LINE USED TO SAY OTHERWISE AND IT NEARLY
  COST HER THE SCORES.** Acting on the stale note, a second bare `'Zara'` key was written into `STORES`;
  being LATER in the object literal it would have **silently overwritten** her `$$` / Trendsetter /
  ten-number entry with nothing. **No error, no warning — the app would simply have forgotten what she
  told it.** ▶ Caught only because a store count came out one short, which is luck, not a check.
  ✅ **`storepool` now asserts there are no duplicate keys**, counted in the SOURCE TEXT — a duplicate is
  already gone by the time the table is parsed, so it cannot be seen any other way. **Proven against a
  planted duplicate.**
  ⚠️ **THE LESSON IS ABOUT THIS FILE, NOT THE CODE: A STALE NOTE SENT SOMEONE TO ADD A STORE THAT WAS
  ALREADY THERE.** Same family as the `n/a` that goes stale in the ledger. **When a line here says
  something still needs doing, check the code before doing it.**
  ✅ **KOHL'S SEARCH URL IS VERIFIED — SHE PASTED A REAL ONE THE SAME DAY.** kohls.com 403s every
  automated request, real term and gibberish alike, so it could never be checked from here; her address
  bar settled it, the same method that fixed J.Crew, Sézane and Madewell.
  ▶ **Her live link:** `…/search.jsp?submit-search=web-regular&search=white+dress&kls_sbp=5399…`
  ⚠️ **`kls_sbp` STRIPPED** — a session/tracking token, and outbound links carry none: they go stale,
  they make links fragile, and once affiliate links are live an extra tracking param can interfere with
  commission attribution. ▶ **`submit-search=web-regular` KEPT** — it is the form's own submit value and
  may be load-bearing; it costs nothing, and the lesson here is to read the WHOLE url she pasted rather
  than only the parameter that looks interesting.
- ▶ **WALMART — still hers to rule on.** Left out as a quality call, not a rule.
- ▶ **BREADTH vs FIT** — Nordstrom tops 20 of 28 archetypes because it is strong on both sides of every
  pair. **Deliberately left alone: a stylist judgment, not an engineering one.**

### 📝 CONTENT — only she can do these
- ▶ **MORE "WHAT'S TRENDING" ITEMS.** Claude drafts in her voice, **she approves/cuts/rewrites** — she is
  the trend authority. Re-sort seasonally; every addition relights the New pill automatically.
- ▶ **MORE STYLE STAR EDIT ITEMS.** Same pattern. ⚠️ **CLAUDE MUST NEVER PICK THE PRODUCTS** — the
  disclosure says every piece is personally selected by the founder. **Protect that.**
- ⭐ **HOMEWORK 6 — THE REAL QUALITY GATE, still IN PROGRESS and still the highest-value thing she can
  do:** tap through 10-15 suggestions across Shop your style, Wardrobe Ideas and Complete the Look and
  say **where the searches land wrong.** Claude can prove a link returns results; **only she can judge
  whether the search term was the right one.**
- ▶ **HOMEWORK 4 — SPOT-VERIFY THE UNVERIFIED STORES** with the address-bar trick. Outstanding: Talbots ·
  Kendra Scott · SKIMS · Lane Bryant · Dia&Co · Sam Edelman · Lacoste · Tory Burch · Belk · Bergdorf
  Goodman · TJ Maxx · Sunglass Hut · Warby Parker · Dillard's. **Only worth doing for stores she would
  actually send a client to.**
- ▶ **HOMEWORK 7 — FIRST TESTERS, her own timing.** 5-10 warm, constructive people; skip the AI-hostile;
  include a couple who do NOT know her, to judge the product not the person. **Her soft-launch instinct
  is legitimate and protected.**

### 🔒 BLOCKED UNTIL AFFILIATE APPROVALS LAND (surface at money-path step 7)
- ▶ **More swim stores + a proper swim section in the Mall** (her own ask).
- ▶ **Deep PRODUCT links instead of store searches** — the whole app still uses `getStoreUrl()` search
  links, which convert far worse.
- ▶ **Audit every outbound link for her tag:** Mall · Edit · Complete the Look · Wardrobe Ideas · Shop
  your style.
- ▶ **PRODUCT IMAGES** on the Edit, Mall and Wardrobe — turns them into real lookbooks, **and it is the
  answer to the Build hub feeling small.** She asked to be reminded of that connection at this moment.
- ▶ **AMAZON'S REQUIRED SENTENCE, exact wording, the moment the first Amazon link goes live:**
  *"As an Amazon Associate I earn from qualifying purchases."* **The edit list is the SIX disclosure
  places** already catalogued below.
- ▶ **Confirm final FTC disclosure wording/placement with Almira.**

### ⚖️ LOW PRIORITY, FLAGGED NOT FIXED
- ▶ **The privacy policy does not name its sub-processors** (Supabase, MailerLite, Anthropic) and has
  **no California/CCPA section.** Neither blocks affiliate approval. **Worth asking Almira when the
  trademarks are done.**
- ⚠️ **Shopbop and Bloomingdale's are still shown as stores and both rejected her** — those taps earn
  $0. **NOT A BUG**: commission data stays out of the app on purpose. Recorded so nobody "fixes" it.

---

## ▶ NEXT SESSION — START HERE (2026-09-09 — SHE SAID "THE CHAT IS NOT WORKING WELL." SHE WAS RIGHT, AND ALL OF IT CAME FROM ONE ROOT.)

### ✅ DEPLOYED AND VERIFIED LIVE 2026-09-09
▶ **Pushed to `main` and confirmed by FETCHING stylestar.app ~30s later and finding all five markers in
the served page** — not by trusting the Post-processing badge, which is the standing rule here.
⭐ **AND THE SPEED FIX IS VISIBLE IN THE LIVE FUNCTION: a real streamed reply now begins writing and
completes in ~9s**, where the old build sat silent past its 30-second stall guard. **The three silent
web searches were the whole wait.**

### ✅✅✅ HER VERDICT IS IN, 2026-09-09, AND IT IS A YES
▶▶ **HER WORDS: *"The chat is now working with scrollable photo options!!!"***
🚨 **SO THE CHAT IS NO LONGER ON TRIAL.** She arrived saying *"the chat is not working well"* and left
with a working wall of photographs. **Measured on her own test phrase, *"I need a fitted white top"*:**
| | before | after |
|---|---|---|
| products she can see | **3** | **27** |
| verified, with ticks | 3 | 3 |
| browsable cards | **0** | **24** |
▶ **Real shops, real prices: Old Navy $12 · Kohl's $14.99 · Kohl's $28.49 · American Eagle $32.97 ·
Kohl's $33.99 · Ann Taylor $59.15.** All from her 122, all instantly tappable, all affiliate-wrapped.
⭐ **THE NEXT THING TO ASK HER: the fitting-room view** — she parked it herself and asked for the
thinking to be kept. **It is written up in the master to-do; do not restart it from scratch.**

### ⭐⭐⭐ THE DAY IN ONE LINE
▶▶ **THE STYLIST WAS RUNNING HER OWN WEB SEARCHES, AND THAT ONE FEATURE CAUSED ALL FOUR FAULTS SHE
FOUND. IT IS GONE.** She invented four dresses and four prices, she leaked the internal `<<FIND>>`
marker onto the screen, she showed no product cards at all, and she took 30+ seconds to say anything.
**One removal fixed the lot, and made the chat faster and cheaper at the same time.**

### 🚨🚨🚨 THE WORST FAULT THIS APP HAS HAD: THE STYLIST INVENTED PRODUCTS AND PRICES
▶▶ **HER WORDS, AND THEY ARE THE RIGHT REACTION: *"What in the world is she doing making up lies? What
is happening?"***
**Asked "Did you find anything??" the stylist replied:** *"The search didn't come back with direct links
I can share, so let me give you my best specific picks to shop right now."* **Then it wrote four dresses
and four prices out of its own memory** — Diane von Furstenberg ~$398 · Anthropologie ~$168 · FARM Rio
~$248 · Reformation ~$278. **Nothing was found. Not one price was real.** A second reply offered
*"FRAME Le High Straight Jeans from Nordstrom (~$228) **in size 26**"* — a size claim on a product that
does not exist, at two shops that have rejected her and pay $0.
🚨🚨 **THE PROMPT ALREADY FORBADE THIS, IN CAPITALS — "AN ITEM WITHOUT ITS ADDRESS DOES NOT EXIST" and
"Never invent an item". THE MODEL READ IT AND DID IT ANYWAY.** ▶▶ **THAT IS THE STITCH FIX BOX,
HAPPENING INSIDE THE APP BUILT TO PREVENT THE STITCH FIX BOX.** She wrote a note saying no shift
dresses; a person read it and sent shift dresses. **A rule that lives only in words gets ignored.**
✅ **SO THE ABILITY WAS REMOVED, NOT RE-FORBIDDEN.** The stylist can no longer name a product, a price,
a size or a link — at all, on any call. She gives styling; **products come from ONE place, the finder,
which opens the shop's own page and checks it.** She cannot invent what she is not holding.
⚠️⚠️ **DO NOT RE-ADD A WEB SEARCH TOOL TO CHAT TO "HELP HER FIND MORE."** That is precisely what was
removed and precisely what lied. The finder is the only product route in chat, on purpose.

### 🚨 THE ROOT CAUSE, MEASURED — AND IT EXPLAINS ALL FOUR SYMPTOMS AT ONCE
`style-ai.js` attached a `web_search` tool with `max_uses: 3`. **A web search writes NOTHING to the
stream while it runs**, and the prompt actively encouraged repeats (*"a second or third search... is
always worth the few extra seconds"*). ▶ **So up to three searches ran in silence, the page's 30-second
stall guard fired, the answer was abandoned, and it fell through to the no-search RETRY.**
| what she saw | why |
|---|---|
| raw `<<FIND item=white top; cut=fitted; size=XS>>` on screen | the retry is still told to emit a marker, **and it was the ONE render route of four that never stripped it** |
| **no product cards, ever** | **the retry never parsed the marker either, so it never LOOKED** |
| four invented dresses | the stylist filled the silence it had created |
| 30s+ of nothing | the three silent searches |
🚨🚨 **THE MARKER LEAK IS THIS FILE'S OWN SENTENCE, IN PUBLIC: A RULE APPLIED TO ONE HALF IS NOT
APPLIED.** Four routes render a bot bubble (main · cut-off · live stream · retry). **Three stripped. One
did not.** ✅ **The strip now lives in `addChatMsg`, the one place every bot bubble passes through, so a
route added later cannot leak it.**
✅✅ **AND THE FINDER WAS HEALTHY THE ENTIRE TIME, which is the galling part.** Run directly against her
two real requests while she was seeing nothing:
| her request | what it actually found |
|---|---|
| fitted white top | Old Navy **$9.99** · H&M **$7.49** · Old Navy $12.00 |
| dress (the bridal shower) | Old Navy **$19.99** · Calvin Klein at Belk **$59.97** |
▶ **Real, affordable, in her shops — the coverage win landing exactly as designed. She never saw one of
them.**

### ✅ WHAT SHIPPED 2026-09-09
1. **The stylist's own web search is REMOVED** (`style-ai.js`). Streaming is KEPT — it is what lets the
   finder run WHILE the reply is written; without it the wait becomes the sum, not the longer, of the two.
2. **The stylist may no longer name a product, price, size or link** — one prompt block, both calls.
   ⚠️ **SCOPED TO CHAT.** Wardrobe Ideas and Shop your Style keep their tier-3 floor. Her 2026-09-06
   ruling removed that floor in chat and **nowhere else**. Do not "restore" it.
3. **The marker is stripped in `addChatMsg`** — the choke point, not the call sites.
4. **The retry now runs the finder**, so a stalled answer still gets her real cards.
5. **The card row is uncapped from 4 to 12** (near-miss groups 3 → 8). ⭐ **`.find-cards` was ALREADY a
   horizontal touch-scroller** — her swipe question was answered by code that already existed; she had
   simply never seen it work, because no cards ever rendered.
6. **`SEARCH_MAX_USES` retired**; the per-search cost surcharge removed, so a shopping answer now costs
   LESS than it did.
▶ **`scratchpad/chatfallback.js` — 35 checks, was 29.** Section 8 pins her exact screenshot: no raw
marker in any bubble, the retry really looks, a real card appears.
⚠️ **THREE OF ITS CHECKS WERE REWRITTEN, NOT BUMPED.** They asserted the old two-block prompt SWAP,
which no longer exists because both blocks are gone. **The app got STRICTER, not looser** — the old
retry was allowed to name a garment so long as it gave no address, and that is exactly what invented the
four dresses. **Rewritten to name the RULE (no product may be named on EITHER call), per this file's own
"rewrite the assertion, never bump the number".**

### ⭐⭐ THE BROWSE WALL AND THE DEBUG VIEW — BUILT AND LIVE 2026-09-09, BOTH AT HER ASK
▶▶ **HER WORDS: *"i would definitely like a scrollable wall, as full as possible"*** and, on the debug
view, ***"yes on the debug view sounds good."***

**1. THE WALL.** `product-find.js` now returns a `browse` array — **the whole pool of products from her
shops**, not just the four that fit under `MAX_VERIFY`. The page renders every one into the horizontal
touch-scroller that already existed.
🚨 **THE HONESTY LINE IS HERS AND IS PINNED BY TESTS: showing MORE is not claiming more.** The verified
set leads and keeps its ticks; **a browse card carries NO ticks and claims nothing** (`no browse card
carries a verified tick`). **And her never-wear list governs the wall** — the same `keep()` runs over it
with her whole request, proven by planting a ruffled piece and watching it disappear.
⚠️ **ONE CARD RENDERER, NEVER A SECOND COPY.** `_findCard` draws both halves, so `_feedName` still
strips a size clause and any future card change lands on both at once.
⚠️ **ONLY ONE AFFILIATE DISCLOSURE PER ANSWER, asserted** — the wall deliberately does NOT add a second.
This file's audit records Wardrobe once showing five on one page. ▶ **If the verified block is ever
absent while the wall shows, the one disclosure has to MOVE there.**

**⚠️⚠️ THE DESIGN FORK, FLAGGED BEFORE BUILDING AND APPROVED BY HER — THIS IS THE RULE WORKING.**
Her sketch said *spend a look-up when she taps*. **It was built differently and she was told why first**,
then said: ***"ok let's try this it sounds good, let's see how we like it."***
| | her sketch: look-up on tap | what shipped: store search for the exact title |
|---|---|---|
| lands on | the exact product page | that shop's search for that exact piece — usually the item, sometimes a short results page |
| cost | a paid look-up **every tap** | **nothing** |
| wait | a second or two | **instant** |
| earns | yes | **yes — `getStoreUrl` returns `_affUrl(...)`, the same wrapper as every other link** |
| ⚠️ **iOS** | **a link opened after an await is BLOCKED as a pop-up — some taps would silently do nothing** | cannot be blocked |
▶ **THE VERIFIED CARDS KEEP THEIR EXACT PRODUCT LINKS. This applies to the wall only, so it is a hybrid,
not a downgrade.** ⚠️ **AND IT IS NOT THE "generic store search dressed as a find" SHE BANNED** — the
product is real, from her shop, with its own title, price and photograph; only the *landing* is a search
for that exact piece. Nothing is claimed that was not read off the result.
▶ **If she ever wants the exact landing, it is about four lines** — swap the `url` the browse card is
built with.

**2. THE DEBUG VIEW — `?debug=1` ON THE URL.** A plain panel BELOW the cards (never above: nothing may
jump under a reader) naming **what was searched for · searches fired · products in her shops · how many
were looked up · exact / near-miss / browse counts · search and look-up times · searches left**.
▶▶ **WHY IT EXISTS, AND IT IS THIS SESSION ITSELF: her five screenshots took HOURS to diagnose by
reasoning backwards from photographs, and every number that would have answered it in a minute was
already being computed and never shown.** ⚠️ **Read ONCE at boot, so there is nothing to leave switched
on by accident, and one `setTimeout` covers EVERY return path — failed, budget, no data, found —
instead of a line at each one.**
▶ **`scratchpad/chatfallback.js` — 55 checks, was 35.** Sections 9, 10 and 11.

### 🚨🚨 FOUND BY RE-VERIFYING AFTER A CONTAINER RESTART: A TIMED-OUT SEARCH WAS TELLING HER HER SHOPS HAD NOTHING
▶▶ **A live call on 2026-09-09 came back `search: 10001ms · candidates: 0` — pinned to the millisecond
on the 10-second ceiling — and the page told her *"I couldn't find exactly what you asked for, and
nothing close enough to show you."*** **The search had never completed. Her 122 shops were never asked.**
🚨 **THAT IS THE ONE THING HER RULE FORBIDS, and this file had already written the sentence:** a failed
search shown as an empty result *"has exactly the shape of a lie, because it is indistinguishable from
the truth."* The page-level version of this was fixed on 2026-09-08; **this was the same fault one layer
down, where the page could not see it** — `get()` swallows a timeout with `.catch(() => null)`, so the
server answered **200 with an honest-looking empty pool.**
✅ **FIXED WHERE THE DIFFERENCE IS ACTUALLY KNOWN — SERVER-SIDE.** When **every** query dies,
`product-find.js` now returns `why: 'search-failed'` and the page shows her approved sentence
*"My search didn't come back just then…"* instead. ⚠️ **Only when EVERY query dies** — one dead query
among several is normal and the surviving pool still stands.
⚠️⚠️ **AND THE HALF THAT KEEPS THE FIX HONEST IS TESTED TOO: a GENUINELY empty search must still say
HER words.** Fixing one must not silence the other. **`chatfallback` 55 → 61, sections 12 and 13.**
▶ **THE RETRY IMMEDIATELY AFTERWARDS WORKED — 19 in her shops, 3 exact, 16 browse** — so this is
intermittent, and it is the **same "pinned at the ceiling" signature this file already records as a
suspected concurrent-request limit.** ⚠️ **Still unproven; it needs her dashboard.** What is now certain
is that when it happens **she is told the truth about it.**
⭐ **AND THE DEBUG VIEW EARNED ITSELF ON ITS FIRST REAL USE:** `search time 10001ms` beside
`products in your shops 0` is what named this in seconds. **Before it, this looked exactly like "your
shops have nothing."**
🚨🚨 **AND A WRONG TURN WORTH KEEPING, BECAUSE THE NEXT SESSION WILL BE TEMPTED BY IT: RAISING THE
SEARCH CEILING DOES NOT HELP.** The ceiling was 10s; it was raised to 20s on the reasoning that
successful searches land at 6.6–8.7s and SerpApi's own processing is only 1.6–3.4s, so the headroom
looked too thin. ▶▶ **MEASURED IMMEDIATELY AFTERWARDS: the next failure pinned at `20001ms` — exactly
the new ceiling.** ⚠️ **SO THESE REQUESTS ARE NOT SLOW, THEY ARE HUNG.** A hung request stays hung, and
a bigger ceiling only makes a woman wait twice as long for the same honest sentence.
▶ **SETTLED AT 12s, chosen from the real successes and not from hope** — observed: 122ms (warm cache) ·
6.6s · 6.9s · 8.7s. **It clears the slowest success seen, then FAILS FAST, which is the kinder half.**
⚠️ **SUSPECTED CAUSE, STILL UNPROVEN AND DO NOT ACT ON IT WITHOUT EVIDENCE: the hangs cluster under
rapid back-to-back calls, which is how they were found.** Three fresh live terms in a row gave
**21 browse · 20 browse · hung** — so it is intermittent, and **a woman asking ONE question may never
see it.** ▶ **If she reports it, the debug panel now shows the number: `search time` at exactly the
ceiling with `products in your shops 0` is this, and nothing else.**

### 🚨 THE SIX EDITS TO ADD A MERCHANT ARE NOW FIVE
▶ **Edit (6), `SEARCH_DOMAINS` in `style-ai.js`, no longer arms anything** — the stylist has no search
to allow domains for. ⚠️ **The constant is deliberately KEPT and still DERIVED** from the same generated
file the finder reads, so it cannot go stale and `searchtune` still asserts the derivation. **Do not
hand-maintain it, and do not re-add a search tool to give it a job.**

### ▶ TEST STATE AS THIS SESSION ENDED — READ BEFORE BELIEVING A RED SUITE
✅ **GREEN:** chatfind 61 · chatfallback **35** · findprod 56 · stylistjudge 33 · storepool 49 · affq 40 ·
affwrap 35 · untagged · feedshelf.
⚠️ **THREE PRE-EXISTING FAILURES, ALL VERIFIED AGAINST CLEAN `HEAD` IN A WORKTREE, NONE MINE:**
- `searchtune` **80 checks, 1 failure** — *"her voice: Lora upright 15.5 + gold bolds"*, a `styles.css`
  check. **Identical on clean `HEAD`.** `styles.css` was not touched this session.
- `curated` — *"good CSV converts clean"* fails on **Madewell · COS · Marine Layer**, which is simply
  **the consequence of her closing the roster at 122 on 2026-09-08**; those shops are gone, so their
  catalog rows no longer resolve. ▶ **Not a bug — it is the deactivation this file already recorded.**
  Also *"every family sees ≥3 jeans"* (Professional gets 2). **Both identical on clean `HEAD`.**
- `curated` — *"never ruffles" removes the ruffled item* — **THE KNOWN FLAKE**, still time/state
  dependent, still in the master to-do to be fixed with an isolated context. **Verify against `HEAD`
  before believing it; never loosen it.**

### ▶▶ WHAT IS WAITING ON HER
1. ⭐ **HER RETEST OF THE CHAT — and this time the question is "did you get cards?"** Nothing else gets
   built on chat until she answers.
2. ⏳ **THE OCT 1 CLOCK — the only genuinely time-sensitive thing on her whole board.** Do NOT pay the
   Your Fashion Friend renewal; close the county receipt by email or mail.
3. ✅ **SerpApi is NOT a constraint: 932 searches left, measured 2026-09-09 via the free account probe.**
   The old "34 left" note is stale. **Testing is affordable again** — but still build against
   `scratchpad/fixtures/`, never her live allowance.

### ▶ WHAT CLAUDE BUILDS NEXT, IN ORDER (unchanged except item 1, which today's removal already did)
1. ~~Cut the query count~~ — **partly done for free.** Removing the stylist's own search removed up to
   three calls per answer. `buildQueries` still fires up to four finder searches; **measure the real
   remaining wait on her retest before cutting further.**
2. ✅✅ **BUILT AND LIVE 2026-09-09 — THE BROWSE WALL.** Her words on seeing the plan: *"i would
   definitely like a scrollable wall, as full as possible."* **The cap is gone: the finder now returns
   the WHOLE pool from her shops and every one renders as a swipeable card.** See "THE BROWSE WALL"
   below for what shipped and the one design fork she approved. ▼ *The original entry, kept because it
   is the measurement that named the blocker:*
   **MANY CARDS, LAZY LOOK-UPS** — her explicit ask, said three times now, and **the thing she was
   actually complaining about on 2026-09-09**: *"I thought by paying for the search service it would
   land on a full selection of photos with tappable links that our user could slide through."*
   🚨🚨 **THE MEASUREMENT THAT NAMES THE REAL BLOCKER, TAKEN 2026-09-09: `MAX_VERIFY = 4` IN
   `product-find.js`.** The finder searches 2-4 queries, filters to her shops — and then **only ever
   looks up the FIRST FOUR**, so only four can ever become cards, and after verification she typically
   sees TWO OR THREE. ▶▶ **A WALL OF PHOTOS IS STRUCTURALLY IMPOSSIBLE TODAY. It is not a tuning
   problem, it is a hard cap.**
   ✅ **AND THE POOL IS ALREADY PAID FOR: one search returns ~40 products, ~12 in her shops, and all 12
   ALREADY CARRY photo + price + store + title** (re-measured against `scratchpad/fixtures/`). **They
   are fetched and then thrown away.**
   ⚠️⚠️ **THE HONEST SELF-CRITICISM THAT BELONGS WITH THIS, BECAUSE IT IS THE REASON SHE IS
   FRUSTRATED: she gave this decision on 2026-09-08, it was recorded, it was written into the plan as
   item 2 — AND THE STRICTEST POSSIBLE OPPOSITE WAS BUILT AND SHIPPED INSTEAD.** Her honesty rule is
   about what the app **CLAIMS**; it was implemented as a filter on what she **SEES**. She drew that
   exact distinction herself — *"it changes how MANY pieces she sees, not what the app CLAIMS about
   them."* ▶ **Same family as the eight-word `CUT` list: her words in, a stricter interpretation out,
   and no flag on the difference.**
   ▶ **THE BUILD: return the unverified pool too, render every one of them as a card, let the verified
   ones lead and say so, and spend a look-up ONLY when she taps.** ⚠️ The look-up is still the only
   source of a buyable, affiliate-wrappable link (0 of 12 raw results had one), so **an un-looked-up
   card must resolve its link ON TAP** before it can go anywhere.
3. **THE DELEGATED CUT** (she ruled yes): when she hands over the choice, the stylist's own silhouette
   becomes a real search requirement, and the stylist says out loud that it was her pick.
   ⚠️ **STILL LIVE AND SEEN AGAIN TODAY:** her *"bridal shower in October in Florida. A brunch."*
   produced a marker asking for `colour=bright; cut=fitted midi; fabric=lightweight` — **none of which
   she said** — so the code correctly stripped all three and searched plain "women's dress" while the
   prose promised bright, fitted and lightweight. **The prose still writes cheques the search will not
   cash.**
4. **THEN SHOP YOUR STYLE**, same engine.


### 🚨 THREE TIMES TODAY CLAUDE PUT WORDS IN HER MOUTH. ALL THREE ARE CORRECTED IN THIS FILE.
1. ***"the cap is the seatbelt"*** — Claude's phrase, quoted back to her twice as hers, and used to
   justify a spend cap she never asked for. **Her actual position is close to the opposite.**
2. ***"the shrug"*** — coined shorthand, used as if shared vocabulary. She asked what it meant.
3. **THE WORST: "THE AGREED EXPERIENCE, IN HER WORDS"** — six numbered steps that are **Claude's summary
   of a flow Claude proposed**, and were quoted back to her that same day as evidence *she* had been
   clear. **Not one of the six carries this file's marker for her words.** ▶ **A file she cannot trust
   as a record of her own voice is worse than no file.** An audit found 45 other places quote her
   correctly; that one heading was the only offender, and it is fixed.
▶▶ **THE RULE THAT CAME OUT OF IT, now beside "a rule applied to one half is not applied": WHEN HER
WORDS ADMIT TWO BUILDS, SAY SO BEFORE BUILDING.** *"Your words could mean A or B; I am building B
because X."* **It costs a sentence and it would have caught the eight-word list in September.**

### 🚨🚨 AND THE STANDING DIRECTION SHE GAVE, WHICH OUTRANKS THE INSTINCT TO ADD MACHINERY
***"I want the AI to be using intelligence and I would like to reduce the amount of rules and breakable
things we put in there."*** ▶ **Test before building anything: is this a PROMISE or a JUDGEMENT?**
Promises stay in code and the list is short. Judgements go to the stylist, who can read. **Every fault
she found today was a judgement built as a promise.**

### 🚨🚨 THE LESSON OF THE DAY, AND IT IS A NEW ONE: **A COUNT OF HER STORES IS NOT AN INVARIANT.**
▶▶ **FOUR separate tests broke the moment she was approved for a shop** — `rakuten_feed`'s *"the other
seven are"*, `searchtune`'s *"40 keyword-scoped + 7 param-scoped"*, `findprod`'s *"108 stores come out of
index.html"*, and `affwrap`'s Vilebrequin example. **None of them found a bug. All of them failed because
something good happened.**
⚠️⚠️ **A TEST THAT FAILS ON SUCCESS TEACHES THE NEXT SESSION TO BUMP A NUMBER WITHOUT READING IT** — and
`searchtune`'s own comment already records that number being bumped three times and once sitting red for
weeks, under the note *"a permanently-red suite is how a false green happens."* **The file diagnosed the
disease and kept the symptom.**
▶ **ALL FOUR ARE NOW DERIVED, and each got STRONGER in the rewrite, not weaker:**
· *"every known merchant except Etsy is built"* — now catches a merchant silently **dropped**, which a
count never could · *"every store known to sell menswear is scoped to women"* — now **names the store**
that broke instead of a total · *"the generated allowlist is in sync with her table"* — **this is the
check that caught the real bug today** · *"an advertiser with NO store entry still earns"*, proven with a
**synthetic** domain, because every real advertiser now has a table entry and the old check had gone
quietly inert.
🚨 **THE GENERAL RULE TO KEEP: WHEN A TEST BREAKS, ASK WHETHER THE APP GOT WORSE OR MERELY BIGGER. If it
merely got bigger, the assertion was measuring the wrong thing — rewrite it to name the rule, never to
bump the number.**
⚠️⚠️ **AND THE EXCEPTION, WHICH IS WHAT KEEPS THAT RULE FROM BECOMING AN EXCUSE — `affq`'s `TEMPLATES`
COUNT STAYS HARDCODED.** It was also found red on 2026-09-08 (**pre-existing**: `HEAD` already had 14
outbound templates against a `TEMPLATES = 13`), and the 14th turned out to be **`_renderDiscoStar()`'s
"Shop it"** — a second `.wks-shop` anchor beside `_renderWeekStar()`'s, both `_affUrl`-wrapped and both
carrying `rel="sponsored noopener"`. **Verified before bumping, not assumed.**
▶▶ **WHY THIS ONE IS DIFFERENT, AND IT IS THE WHOLE TEST OF THE RULE: the four counts that were derived
away all moved when SHE WAS APPROVED FOR SOMETHING — they failed on good news. This one counts CODE
PATHS OUT OF THE APP**, which must never grow without a person looking: an unnoticed outbound anchor is
an untagged link that earns nothing, or an untracked way for a woman to leave the app. **A tripwire is
supposed to be tripped.** ▶ **When it goes red: find the new anchor, check it is sponsored and wrapped,
then bump the number with a line naming the template. Never derive it away.**

### ▶ WHAT IS WAITING ON HER, AND IT IS SHORT
1. ⏳ **THE OCT 1 CLOCK — the only genuinely time-sensitive thing on the whole board.** Do NOT pay the
   Your Fashion Friend renewal; close the county receipt by email or mail. See its own section.
2. ✅✅ **THE COUTR EDIT ITEM / STAR OF THE WEEK IS BUILT — HER PICK, BOTH PLACES, SAME PIECE.**
   **Saint Laurent SL M136 Sunglasses · COUTR · $363**, her note verbatim: *"This style is mysterious
   and cute at the same time. YSL chic and fabulous!"* ⭐ **It is the FIRST piece in this app to arrive
   PHOTOGRAPHED ON DAY ONE**, because `_wkStarPxTag` honours `px` only when `_affMid(url)` resolves and
   `coutr.com` went into `_AFF_MID` the same morning. **Edit item live immediately (32 items now); Star
   of the Week APPENDED to `WEEK_STAR_PHOTO_ORDER` → 11 October.**
   ▶ **APPENDED, NOT INSERTED, AND VERIFIED AGAINST THE REAL ROTATION CODE, not arithmetic:** every
   piece already scheduled between now and **4 Oct keeps its exact week**, and **Vilebrequin stays
   13 Sept, safely inside the 20 Sept cutoff she set for it.** Growing the pool 9 → 10 does move the two
   that wrap round (the pendant and the DVF) back one week each. ▶ **If she wants it sooner, say so —
   an insert is one line, but it pushes everything after it, Vilebrequin included.**
   🚨 **THE PHOTO PROBLEM WAS THE OPPOSITE OF THE BAG'S, AND IT IS WORTH REMEMBERING.** The source is
   **900x1200 — EXACTLY 3:4**, the same ratio as `.wks-px`/`.dc-item-px`, so `cover` crops **nothing**
   and `pxPos` has nothing to choose between. **Nothing is cut off; the trouble is emptiness** — the
   glasses sit at **66%–96% of the frame height** with white above.
   ⚠️⚠️ **AND IT CANNOT BE FIXED BY CROPPING, WHICH WAS MEASURED RATHER THAN ASSUMED.** Shopify's CDN
   *can* bottom-crop to enlarge them — **but only by leaving 3:4**, and the glasses span **3%–97% of the
   WIDTH**, so every non-3:4 source either **clips both arms** under `cover` or **letterboxes with
   visible cream bands** under `contain`. ▶ **Four versions were rendered at the true card size and
   LOOKED AT** (the FARM Rio lesson: measure to find candidates, look to decide) — **and every one of
   them was a compromise: either the glasses stayed tiny in an empty card, or the frame clipped, or
   cream letterbox bands appeared.**
   ⭐⭐ **THEN SHE SOLVED IT, AND HER ANSWER WAS BETTER THAN ALL FOUR.** Her words: ***"Is it possible to
   stack the 2 photos into one? So we can see the front of the glasses and the side with the logo and
   fill up the space on the card too?"*** ▶▶ **SHIPPED AS `px2`** — the front view on top, the angled one
   below showing the gold YSL monogram her note is about. **It fills the card completely, shows the piece
   twice, and clips nothing.** ▶ **A WIDE, SHORT OBJECT IN A TALL FRAME IS A NEW SHAPE OF THIS PROBLEM —
   belts, clutches and cuffs will all hit it, and `px2` is now the mechanism for them.** See the rule
   ledger's photo row for the full note; the short version is that both halves stay **hotlinked** behind
   the same `_affMid` gate, and **ONE css rule names both surfaces**.
   💡 **AND THE LESSON ABOUT WHO SOLVES THESE: four crops were measured, rendered and ruled on, and the
   answer was not among them because every one of them accepted the premise that a card shows ONE photo.
   She did not.** That is the second time in two days her eye beat the measurement (the first was Under
   Armour). ▶ **Show her the renders and the trade-offs; do not just pick the least-bad one.**
   ⚠️ **$363 IS NOT A MARKDOWN, CHECKED ON THE PAGE:** the JSON-LD offer says 363 and there is no higher
   "was" price. Their `compareAtPrice` reads **358 — LOWER than the price**, which is backwards from how
   compare-at is normally used, so it is their data quirk, not a sale. **Listing 363 is accurate and is
   also the conservative direction** (arriving to find a piece cheaper feels lucky; dearer feels misled).
   ▶ **The ANGLED photo was chosen over the straight-on one their `og:image` uses**, because it shows the
   gold YSL monogram on the arm — which is the detail her note is actually about.
3. **Hand `docs/store-scoring-brief.md` to ChatGPT** — the ~200-store list, still her desk job.
4. **Re-run her three chat messages**, then **Shop your Style**.

### 🚨 AND SHE CAUGHT A SOLD-OUT STAR OF THE WEEK, LIVE, WHICH NOTHING WAS WATCHING
▶▶ **Her words, 2026-09-08: *"The red bag we have on as Star of the week is sold out. So let's delete it
and add this in its place now. All others stay same order."*** ✅ **VERIFIED BEFORE ACTING rather than
taken on trust** — marissacollections.com returns `schema.org/OutOfStock`, `"available":false` and
"Sold out". **She was right.**
▶ **DONE EXACTLY AS SHE ASKED: the Serpui Abigail Handbag was SWAPPED IN PLACE for the Saint Laurent**,
so the pool stays 9 and **every other piece keeps the exact week it already had** (Vilebrequin 13 Sept,
Crosbie 20 Sept, Fleur du Mal 27 Sept, bracelet 4 Oct). **The sunglasses are the LIVE Star now.**
▶ **Its Edit pick was pulled too, her call when told** — the same bag was one of her Edit items, so that
link was dead as well. **Edit: 32 → 31.**
⚠️ **Its `WEEK_STARS` entry is deliberately KEPT and marked SOLD OUT.** It is inert (the photo order is a
whitelist, not a sort hint), and it carries the `pxPos` crop her 2026-09-07 catch produced, which
`starpx` still pins as its worked example. **Deleting an entry that already renders nowhere would only
throw the lesson away.** ▶ **Do not put that name back in `WEEK_STAR_PHOTO_ORDER` without checking stock.**
🚨🚨 **THE REAL FINDING IS THAT NOTHING WAS WATCHING — see the watchdog item in the master to-do.** The
link-rot script detects "sold out" perfectly well and is pointed at the FROZEN catalog, not at the Edit
or the Star queue. ▶▶ **A curated surface she updates is exactly the one that goes stale, and it was the
only one unmonitored.** **She is not the stock checker; a script should be.**

### 🚨🚨🚨 THE STYLIST CHAT IS NOT LANDING — HER TESTING, 2026-09-08, AND FOUR SEPARATE FAULTS
▶▶ **HER WORDS: *"I did some testing on stylist chat and very disappointed."*** She sent four phone
screenshots. **She was right about every one of them, and they were four DIFFERENT faults, not one.**

**1. 🚨 THE ROOT CAUSE — THE FINDER ONLY KNOWS DRESS WORDS. STILL OPEN; THIS IS THE REBUILD.**
`CUT` in `find-products.js` has **EIGHT entries**: wrap · a-line · shift · midi · maxi · mini · ankle ·
knee-high. **Every one comes from the single "blush silk wrap dress" case it was built against.** It
knows nothing about denim, tops or trousers. Measured against the real titles:
| she asks for | the product's own title says | verdict |
|---|---|---|
| high rise | "Ultra **High Rise** 90s **Straight** Jean" | ❌ unknown |
| straight leg | "Ultra High Rise 90s **Straight** Jean" | ❌ unknown |
| fitted | "The **Fitted** Cotton Poplin Shirt" | ❌ unknown |
| wrap | "Jeanne Silk **Wrap** Dress" | ✅ confirmed |
▶▶ **AND BECAUSE UNKNOWN IS NEVER A PASS — her rule, and the right one — ANY REQUEST NAMING A CUT IT
DOES NOT KNOW CAN NEVER PRODUCE AN EXACT MATCH.** `jeans size 26` returns 3 matches; add `straight leg`
and it returns **ZERO**, while one of the three is literally a *90s Straight Jean*.
⚠️ **DO NOT FIX THIS BY ADDING FIFTY MORE WORDS.** Her three tests would pass and the fifty-first would
fail the same silent way. **A list can only know what someone typed into it.**
⭐ **HER OWN DIAGNOSIS WAS RIGHT AND IS THE DESIGN: *"I feel like our app already knows what we are
trying to deliver."*** It does — measured: "relaxed" appears **39** times in the app's own taxonomy,
"fitted" **31**, "cropped" **21**, "skinny" **11**. ▶ **The app knows. The finder was never given it.**
▶▶ **THE FRAME THAT MADE IT CLICK FOR HER, AND IT IS WORTH KEEPING: THE APP HAS TWO KINDS OF RULE.**
**GUARANTEES** (never a shift dress · never claim a size we cannot verify · max two per shop) **must be
code**, because a promise that depends on an AI's mood is not a promise — that is the Stitch Fix lesson
and it does not move. **JUDGEMENTS** (*is this jean high-rise? is this top fitted?*) **need reading.**
🚨 **I BUILT A JUDGEMENT AS IF IT WERE A GUARANTEE — a word list where eyes belonged.** That is the whole
glitch. ▶ **THE AGREED FIX: let the stylist READ the products** (the same AI already writing her
replies) **and require it to quote the product's own words as proof.** Code keeps the guarantees.

**2. ✅ FIXED — SPEED. AND IT WAS NOT WHAT ANYONE GUESSED.** Instrumented rather than guessed a third
time: **the SEARCH took 33–134ms; the LOOK-UPS came back at 12,001 / 12,002 / 12,002 / 12,016ms** —
pinned to the millisecond on a shared 12s ceiling. ▶▶ **NOTHING WAS SLOW EXCEPT THE WAITING.** 2–5 of 6
look-ups answer fast, one never answers, and `Promise.all` waits for the slowest. **Every request paid
12 seconds for one straggler**, and past ~30s it was a 504. ✅ Calls are now **parallel with a small
concurrency pool** (searches 2 wide, look-ups 3 wide) and look-ups get **6s** while the search keeps a
long ceiling — losing a search loses everything; losing one look-up of six is invisible.
⚠️ **AND A SUSPICION, NOT A FINDING: after parallelising, FRESH searches began pinning at their ceiling
too (10,002 / 10,008 / 10,009ms), which sequential calls never did.** Most likely a **concurrent-request
limit** on her plan — a queued call looks exactly like a slow one. **Unverified; it needs her dashboard.**

**3. ✅ FIXED — A FAILED SEARCH READ AS "I LOOKED AND FOUND NOTHING."** The page returned early and
rendered nothing so the advice would stand, **and the PREVIOUS answer's cards were still above it** —
which is exactly what she reported as *"you just showed me the exact same thing when I asked for
something different."* **It had shown her nothing. The old cards were simply still there.**
▶ **This is her 2026-09-06 rule one step further out:** she rejected a silent fallback because an
invented pick *looks identical to a real find*. **A failed search shown as silence has that same shape.**
⚠️ **The two new sentences are CLAUDE'S and are marked in the code as placeholders for HERS.**

**4. ⏳ HER RULING NEEDED — THE STYLIST WRITES A CHEQUE THE SEARCH DOES NOT CASH.** It said *"straight
leg mid rise is the most current silhouette… let me pull some real options"* and then searched only
`jeans + size 26`, because **colour/fabric/cut are searched ONLY if they came from her mouth**
(`_findKeepHerWords`) — the rule that exists because the model once recommended a jewel tone and then
searched for one as though she had asked. **The rule is right. The prose is not bound by it.**
✅✅ **ANSWERED BY HER, 2026-09-08: YES.** When a woman asks *"what's in style now?"* she is
**DELEGATING the choice**, so the stylist's own recommended silhouette **becomes a real search
requirement**. Her words: ***"yes, that makes sense."***
🚨 **THIS IS A NARROW EXCEPTION AND ITS EDGES MATTER — DO NOT WIDEN IT.** The rule it bends
(`_findKeepHerWords`: colour/fabric/cut only if SHE said them) exists because the model once
recommended a jewel tone and then searched for one **as though she had asked**. That failure is a
requirement invented from nowhere. ▶ **THE DIFFERENCE IS DELEGATION: she asked the stylist to choose.**
⚠️ **SO THE TEST IS NOT "did the stylist name a cut" — it is "did the woman hand over the choice".**
*"What's in style now?"* · *"What do you recommend?"* · *"You pick"* → the stylist's cut is searchable.
*"I want a blush silk wrap dress"* → only her words, exactly as now.
▶ **AND THE STYLIST MUST SAY WHOSE CHOICE IT WAS**, so a woman is never quietly given a requirement she
did not set: name it out loud ("straight leg is the most current, so that's where I looked") and it
stays hers to overrule. **That is the honest version of choosing for her.**
▶ **THE ALTERNATIVE WAS OFFERED AND IS NOW CLOSED:** the stylist could instead have been forbidden from
naming a silhouette it was not going to search for. **She chose the better half — advice and results
that agree — rather than advice made vaguer to match a narrow search.**

### ⭐⭐⭐ HER DECISION, 2026-09-08: SHOW HER LOTS TO SCROLL THROUGH — BROWSING IS THE POINT
▶▶ **HER WORDS, VERBATIM:** ***"yes yes yes the more options she can browse, the better, even if
they're not all perfect matches, even if they are close, if she can scroll through a lot of visuals,
that makes it more fun."***
🚨 **THIS IS A REAL CHANGE OF SHAPE AND IT MUST NOT BE READ AS LOOSENING HER HONESTY RULE.** It does
not contradict *"never imply a requirement is confirmed unless we can verify it"* — **it changes how
MANY pieces she sees, not what the app CLAIMS about them.** Show many; label honestly; claim nothing
that was not checked.
⚠️ **AND IT IS A DELIBERATE SOFTENING OF THE 2026-09-06 "SHOW THE ONE TRUE MATCH" INSTINCT, BY HER.**
That decision was made when the choice was *one verified dress* versus *a screen padded with things she
did not ask for*. **She has now seen that the real alternative is a browsable wall of close pieces with
photos, and she prefers it.** ▶ **Both of her sentences still hold: the confirmed ones lead and say so;
the rest are there to browse and promise nothing.**
✅✅ **AND IT IS AFFORDABLE, WHICH IS WHY IT CHANGES THE BUILD — MEASURED 2026-09-08.** One search for
*"women's white fitted top"* returned **40 products**, and per product, with **NO look-up spent**:
| what a card needs | available from the one search |
|---|---|
| title · store · price · photo | ✅ **12 of 12** |
| **a direct, buyable, affiliate-wrappable store link** | ❌ **0 of 12** — every link points at `google.com/search` |
▶▶ **SO SHOWING IS CHEAP AND TAPPING IS NOT.** The per-product look-up is not only how a requirement is
verified — **it is the only way to get a link that reaches the shop and can earn.**
⭐ **THE DESIGN THAT FALLS OUT OF THAT, AND IT IS BETTER THAN WHAT EXISTS: RENDER MANY, LOOK UP LAZILY.**
Today the app spends **6 look-ups every time, whether she taps anything or not.** Instead: render a wide
scrollable row from the one search, verify the top few so the confirmed set exists, and **spend a
look-up only on the pieces she actually reaches for.**
💰 **AND THIS IS NOT A NICETY, IT IS THE BUSINESS MODEL — at her real price of $0.025/search, middle
case, 1000 users: 10 searches per question is −$132/month and 4 is +$18/month.** ▶ **More options for
her AND fewer searches. The two goals point the same way, which is rare enough to write down.**

### ▶▶ WHAT IS WAITING ON HER — AND IT IS ALMOST NOTHING
1. ⭐ **HER VERDICT ON THE CHAT.** She is testing it now. **Nothing else should be built on top until she
   reports back.**
2. ⏳ **THE OCT 1 CLOCK — the only thing on her whole board with a real deadline.** Do NOT pay the Your
   Fashion Friend renewal.
3. ▶ **THE $75 SPEED ADD-ON: DECIDE NOTHING YET.** See above. Cut the query count first.
4. ✅ **NOT the store list — she closed it at 122 and does not want more until an affiliate approval.**
5. ✅ **NOT store descriptions or scores — measured: the model already knows her shops.**

### ▶ WHAT CLAUDE BUILDS NEXT, IN ORDER
1. **CUT THE QUERY COUNT** (speed + money, and it settles the $75 question).
2. **MANY CARDS, LAZY LOOK-UPS** — her explicit ask: *"the more options she can browse, the better."*
   One search already carries ~40 products with title, store, price and photo; only the look-up costs,
   and it is the only source of a buyable link, so an un-looked-up card must resolve its link ON TAP.
3. **THE DELEGATED CUT** (ruled yes): when she asks *"what's in style now"* the stylist's own silhouette
   becomes a real search requirement, and the stylist says out loud that it was her pick.
4. **THEN SHOP YOUR STYLE**, same engine. **THEN the Wardrobe shelves — and that is what finally retires
   the 107-item spreadsheet**, which she has been asking about and which only survives because those
   shelves still read it.


### 🛠️🛠️ THE CHAT REBUILD — THE PLAN, AGREED WITH HER 2026-09-08. START HERE NEXT SESSION.
▶▶ **EVERY DECISION IS MADE. NOTHING BELOW NEEDS ASKING AGAIN — BUILD IT.**
🚨 **AND BUILD IT OFFLINE. `scratchpad/fixtures/search-white-fitted-top.json` is a real captured search
(40 products, 12 saved). `?capture=1&q=...` on `product-find` grabs more for ONE search each.** Her
allowance is not a test harness — that lesson cost 141 searches in one afternoon.

**1. THE STYLIST READS THE PRODUCTS. (the root cause, fault 1)**
Replace the 8-word `CUT` lookup in `find-products.js` with a real reading step: hand the AI the actual
product text and let it judge, **required to quote the product's own words as evidence**. It may say
CONFIRMED only by pointing at where the page says so.
⚠️ **THE THREE VERDICTS AND "UNKNOWN IS NEVER A PASS" DO NOT MOVE.** Nor does `_findKeepHerWords`, nor
`filterNeverWear`, nor `curatedPicks`. **Guarantees stay in code; only the JUDGING becomes reading.**
▶ **THE FRAME THAT MADE THIS CLICK FOR HER, KEEP IT:** *guarantees* (never a shift dress, never claim
an unverified size, max two per shop) **must be code** — a promise that depends on an AI's mood is not
a promise. *Judgements* (is this fitted? is this high-rise?) **need reading.** The bug was building a
judgement as if it were a guarantee.
⚠️ **DO NOT "FIX" THIS BY ADDING 50 MORE WORDS TO THE LIST.** Her three tests would pass and the 51st
would fail the same silent way.

**2. MANY CARDS, LAZY LOOK-UPS. (her ask, and the economics)**
Render a wide scrollable row from the ONE search — title, store, price, photo are all there free —
verify the top few, and **spend a look-up only on what she reaches for.** ⚠️ **The look-up is the only
source of a buyable, affiliate-wrappable link (0 of 12 raw results had one), so an un-looked-up card
must resolve its link ON TAP** before it can go anywhere.

**3. THE DELEGATED CUT. (fault 4, ruled yes above)**
When she hands over the choice, the stylist's silhouette becomes a real search requirement, and the
stylist says out loud that it was her pick.

**4. ALREADY DONE 2026-09-08, DO NOT REDO:** parallel + pooled calls · per-call timeouts (search long,
look-up 6s) · a failed search says so instead of rendering silence · `SERPAPI_RESERVE` defaults to 0
(warn, never block) · the Saturday budget check.
⚠️ **HER COPY RULING: the two failure sentences are APPROVED AS WRITTEN.** Her words: *"I think what you
came up with is fine and the stylist chat already has a good personality and words things well."*
**They are no longer placeholders. Do not rewrite them.**

### 🏬🏬 HER STORE ROSTER — 122 SHOPS, HER LIST, 2026-09-08
🚨🚨 **THE LIST IS CLOSED AT 122. HER WORDS, 2026-09-08:** ***"the list i gave you is complete for now.
I don't want to add any more. Of course if we get more affilates approved, we will add them, but for
now I don't want to add any more stores."***
▶▶ **SO DO NOT ASK HER FOR STORE NAMES AGAIN, and do not re-propose the ~200 goal.** The 2026-09-06
target of 200 is **superseded by her own decision**: she reviewed the field herself and stopped at 122.
✅ **THIS CLOSES THE ITEM THAT SAT AT THE TOP OF HER MASTER TO-DO FOR DAYS** — *"hand
`docs/store-scoring-brief.md` to ChatGPT"*. She did the job her own way and did not need the brief.
**The brief and `docs/store-list-prompt.md` stay in the repo for the day an affiliate approval brings a
new shop; they are no longer waiting on her.**
▶ **THE ONLY TRIGGER FOR ADDING A SHOP NOW IS AN AFFILIATE APPROVAL.** Her rule, her words above.
▶▶ **She sent 21 shops to ADD, 9 to REMOVE, and a final roster of 122. The diff was checked against the
table BEFORE touching anything and matched her instruction exactly, then checked again afterwards —
empty in both directions.** `docs/current-stores.txt` holds the live list.
**IN:** Aerie · American Eagle · ASOS · Ashley Stewart · City Chic · Club Monaco · Frances Valentine ·
Honeylove · Karen Millen · L*Space · L.L.Bean · Lilly Pulitzer · Long Tall Sally · Lord & Taylor ·
Mestiza New York · MZ Wallace · Ramy Brook · Reiss · Rothy's · Staud · Teri Jon
**OUT:** COS · Garnet Hill · Jenni Kayne · Johnny Was · Kendra Scott · Madewell · Marine Layer · Rails ·
Soft Surroundings
⚠️ **SIX OF HER 107 CATALOG PICKS WERE DEACTIVATED, because their shop is gone:** `p001` Madewell
Perfect Vintage Jean · `p015` COS Pintucked Blouse · `p057` Madewell Woven Tote · `p064` Madewell
Earrings · `p089` Reebok Club C (Madewell) · `p104` Marine Layer Camila Midi. **101 active.** ▶ A pick
from a shop she no longer approves should not be shown; this is the consequence of her decision, not a
separate one. **Say so rather than letting them vanish quietly.**
✅ **SEARCH URLS WERE FOUND AND PROBED HERE, NOT ASKED OF HER** (the "she owes names" rule). **Verified
with a real term AND a gibberish control: Ashley Stewart · Frances Valentine · Lord & Taylor · MZ
Wallace · Staud · Teri Jon.** ⚠️ **The other 15 could not be checked from here** — bot-walled, or the
results render client-side so a real term and gibberish come back byte-identical. **They carry the most
likely pattern for that platform and are marked `// ⚠️ url unverified` in the table.**
🚨 **THIS DOES NOT AFFECT WHETHER HER PRODUCTS ARE FOUND — the finder matches by DOMAIN.** An unverified
url only shapes the AI's own "find this at X" link. **Fix one opportunistically from her address bar if
a link ever lands wrong; do not ask her for fifteen.**
⚠️ **AERIE AND AMERICAN EAGLE SHARE `ae.com` ON PURPOSE** — aerie.com redirects there, Aerie is a brand
inside AE's site, so its products genuinely live on that domain.
⭐⭐ **AND THE 2026-09-07 UNTAGGED-STORE GUARD GOT ITS FIRST REAL TEST AND PASSED.** 22 of the 122 now
carry no dimension scores. Measured in the live page: **all 122 rank, all 22 unscored sit at the END,
`_shopRules` builds, zero page errors.** ▶ **`untagged` now proves it with her REAL table rather than a
fixture: "her REAL table would have crashed the pre-guard code" ✓ and "the guarded code ranks all 122"
✓.** The September fix was written for exactly this week and nobody knew it yet.
✅✅ **`SEARCH_DOMAINS` IS NOW DERIVED, WHICH RETIRES ONE OF THE SIX EDITS FOREVER.** It was a hand-typed
list in `style-ai.js` — one of the two that fail SILENTLY — and it went stale TWICE in one day (COUTR by
hand, then 13 short after this roster). **It now reads the same generated file the product finder uses,
so the stylist's search and the finder's allowlist cannot disagree.** ▶ **Adding a merchant is now FIVE
edits, not six**, and `searchtune` asserts the derivation rather than a count.

### 💰🚨 SERPAPI — LIVE OPERATIONAL STATUS, AND THE MATHS THAT REFRAMES IT (2026-09-08)
🚨🚨 **HER DASHBOARD, 2026-09-08: 216 OF 250 USED. 34 LEFT.** Her file said ~75 on 2026-09-06 — **so
~141 went in one afternoon, and almost all of it was Claude testing against the LIVE endpoint.**
▶▶ **THE NUMBER THAT CHANGES THE PICTURE: ONE SHOPPING QUESTION IS NOT ONE SEARCH.** It is up to
**4 searches + 6 product look-ups = TEN calls**, and SerpApi counts every call. **So 250/month is really
about 25–60 shopping questions a month, across all users.** The 34 left are **three to eight questions**.
▶ **THE STANDING RULE THIS PRODUCED: BUILD AGAINST CAPTURED FIXTURES, NEVER HER LIVE ALLOWANCE.**
`scratchpad/findprod.js` already works this way — real product data captured once, tested forever, no
network. **That is how the rebuild gets built.**
✅ **THE SEATBELT IS NOW BUILT** (her word, 2026-09-06): the finder asks SerpApi itself how many searches
remain **before spending one** — the account endpoint is free, exact, and needs no setup — and stops with
`why:'budget'` below `SERPAPI_RESERVE` (default **20**, settable in Netlify). ⚠️ **It fails OPEN on
purpose:** refusing to shop because a diagnostic call broke would take the feature down to protect a
budget. ▶ **With 34 left and a floor of 20 she has ~14 for her own phone testing** — lower
`SERPAPI_RESERVE` if she wants more.
▶ **HER QUESTION, ANSWERED: SHOULD SHE BUY MORE? NOT YET.** Those searches were spent by testing, not by
users, and there are no users. **The honest trigger for paying is women using the app.** ⚠️ **If she ever
does buy, two things first:** check the **reset date**, and re-read this file's own note that
**SerpApi's legal shield does NOT cover the $25/$75 tiers** — confirm that with them before paying. The
alternative to price against is **SearchApi** (same $25, ~10× the searches).

### ⚠️ TWO THINGS I GOT WRONG ON 2026-09-07, KEPT BECAUSE THE PATTERN REPEATS
1. ⚠️⚠️ **AN AUTOMATED CHECK ACCUSED HER FARM RIO FIX OF BEING BROKEN, AND IT WAS WRONG.** A script
   measuring "where does the garment end" reported the dress cut off by 4.9%. **Rendering all 10 Star
   photos and LOOKING at them disproved it: her `center 60%` is correct and the sandals are in frame.**
   ▶ **The detector was measuring a full-bleed grey studio backdrop as though it were the dress.** It
   only works on products shot on plain white. 🚨 **SO: MEASURE TO FIND CANDIDATES, LOOK TO DECIDE.
   Reporting that number to her unchecked would have been a fault she then had to disprove herself.**
2. ⚠️ **A TEST I WROTE THE SAME DAY WAS FRAGILE IN A WAY THAT LIES.** `untagged.js` compared against
   `HEAD:index.html` to prove the store crash was real — so it passed **exactly once**, on the commit
   that introduced the fix, and on the very next commit began reporting **that the bug had never
   existed.** ▶▶ **A BASELINE THAT MOVES IS NOT A BASELINE.** Pinned to `3d1aad4`, and it skips cleanly
   rather than failing falsely if that object is missing from a clone.

### ▶ THE PRODUCT FINDER — WHAT IS BUILT AND WHAT IT KNOWS (distilled 2026-09-07; the build story is in the archive)
▶ **THE FILES:** `netlify/functions/product-find.js` (server, holds the key) · `netlify/functions/lib/
find-products.js` (the finder) · `netlify/functions/lib/store-domains.js` (**generated**) ·
`scripts/build-store-domains.js` · `scripts/lib/stores.js` (the ONE `STORES` reader) ·
`scratchpad/findprod.js` **54** · `scratchpad/chatfind.js` **61** · `scratchpad/findlive.js` (live bench).
⚠️ **THE FINDER FINDS; THE PAGE CHOOSES.** `find-products.js` holds NO copy of her brief and never ranks
for style. **`curatedPicks()` and `filterNeverWear()` remain the ONE picker** — adding her rules to the
finder would make it the fourth copy, which is the bug this project paid for four times in one day.
**HER RULE IS STRUCTURAL: three verdicts, never two** — `CONFIRMED` · `REJECTED` · `UNKNOWN`, and
**UNKNOWN IS NEVER A PASS.** A product is an exact match only when every requirement she stated is
CONFIRMED. **Everything she KEEPS must be CONFIRMED; only what she RELEASED may be unknown.**
**THE FOUR TRAPS, ENCODED AND PINNED BY TESTS BUILT ON REAL CAPTURED PRODUCTS:**
1. **A print is not a colour** — "Palace Tiger Pink" must never confirm blush.
2. **Satin is a weave, silk is a fibre** — `95% polyester` REJECTS silk outright.
3. **Faux-wrap is not a wrap** — and only the retailer's own title said so; Google's tidy title passed it.
4. **Wide calf is not wide width, and "W 7" is a women's 7** — an explicit non-wide width beats any
   marketing phrase. ⚠️ **One real DSW boot contradicted ITSELF** across its title and its variant.
**FOUR MEASURED CORRECTIONS THAT MUST NOT BE UNDONE:**
- **Queries are POOLED, never replaced.** Broadening CHANGES the pool rather than enlarging it — the
  broad query lost the DVF that the narrow one found.
- **Size and width stay OUT of the search words** (in the words scored **8/40** against **30/40**, by
  pushing Google toward eBay and Poshmark).
- **COLOUR, FABRIC and CUT must appear in HER OWN SENTENCE or they are dropped** (`_findKeepHerWords`).
  Those three NARROW a search and so those three can silently empty it. **ITEM may still be inferred**
  (a stylist may read *"nothing to wear"* as a dress); **SIZE/WIDTH come from her saved prefs.**
  🚨 **THIS IS A CODE RULE BECAUSE THE PROMPT RULE FAILED HER.** The prompt already said "never invent a
  requirement she did not give"; the model recommended a jewel tone, then searched for one as if she had
  asked. **A rule checked in code before it can reach a card is the fix. That is the Stitch Fix lesson.**
- **A REQUEST WITH AN ITEM ALWAYS PRODUCES AT LEAST ONE QUERY.** `buildQueries` once excluded the bare
  `women's <item>` and so built ZERO queries, searched for nothing, and reported *"I could not find that
  in your shops"* — ▶ **the most convincing way possible to be wrong: a confident, honest-sounding no
  with no search behind it.**
**HOW CHAT TRIGGERS IT:** the stylist emits ONE marker as the FIRST thing in her reply —
`<<FIND item=dress; colour=blush; fabric=silk; cut=wrap>>` — then answers normally. ▶▶ **FIRST ON
PURPOSE: the reply streams ~16-20s and a search takes ~5-8s, so firing on the marker runs them TOGETHER
and the wait is the LONGER of the two, never the sum.** ⚠️ **She never sees it** — stripped from the live
stream, the shown reply, and `ss_chat`.
⚠️ **`filterNeverWear` MUST BE HANDED HER WHOLE REQUEST** (`item + colour + fabric + cut`), not just the
noun. `_SEARCH_VETO` contains "wrap", so passing only `"dress"` made the app believe she never asked for
a wrap and **silently delete every wrap dress from her own answer to "blush silk WRAP dress."**
**THE WAITING STAR:** one signal across the app — byte-identical star path to `.wdr-load-star`, same
`spin 1.7s linear infinite reverse` as `.shop-star-main`, `_starSpin()` the one definition. ⚠️ **The words
replace themselves and never stack; the mid-stream swap targets the SPAN (a bare `textContent` would
delete the star); `prefers-reduced-motion` keeps the star and stops it turning.**
🔒 **SerpApi: ~75 of 250 free searches used. `SERPAPI_KEY` is set in Netlify** — if she regenerates it,
Netlify must be updated or **the chat quietly loses its product cards (no error, just advice).**
⚠️ **Caps: 4 searches + 6 product look-ups per request, 8 requests/minute per IP, 30-minute cache.**

### ✅ THE MEASUREMENT THAT CHANGED THE STRATEGY — HER OWN STORE TABLE IS ALREADY MID-MARKET
▶▶ **Of her 108 `STORES` entries, 57 START AT `$$` OR BELOW. Only 15 are `$$$$` throughout.**
🚨 **HER FEED IS 7 STORES AND EVERY ONE IS `$$$`/`$$$$`.** ▶ **So the affordability problem was NEVER her
taste or her curation. She already picked a broad, affordable set of shops — the feed just reaches the
dearest seventh of them, because those are the ones that approved her.** A search across all 108 fixes
the price problem **with no new affiliate approval at all.**
⭐ **AND SHE ALREADY TAGGED WHICH STORES CARRY WIDE WIDTHS, back in July — 8 of them:** Nordstrom ·
Macy's · Nordstrom Rack · Amazon · Naturalizer · Lane Bryant · Zappos · DSW. **She answered the width
question months ago; the app just never used her answer to FIND anything.**

### ▶▶ THE AGREED EXPERIENCE — **CLAUDE'S SUMMARY OF A FLOW SHE APPROVED. NOT HER WORDS.**
🚨🚨 **THIS HEADING USED TO READ "IN HER WORDS" AND THAT WAS FALSE. Corrected 2026-09-08 when she read
step 4 and said: *"this is not my voice. I did not say this."* She was right.** ▶ **Not one of the six
steps below carries this file's own marker for her words (`***…***`), while everything genuinely hers in
this same section does** — *"These three I can confirm in your width"*, and the rule labelled VERBATIM
further down. **The six steps are a summary Claude wrote of a flow Claude proposed and she approved.**
⚠️⚠️ **AND THE DAMAGE WAS REAL, NOT COSMETIC. On 2026-09-08 this section was quoted back to her as
evidence that SHE had been clear** — *"here are your words"* — **when it was Claude quoting Claude.** ▶ A
file she cannot trust as a record of her own voice is worse than no file: **it is the one place she
should be able to check what she actually said.**
▶▶ **SO BE EXACT ABOUT WHO SAID WHAT HERE. WHAT IS HERS FROM THAT SESSION (all quoted and marked
below): the thin-result-set decision · the per-requirement widening · the width answer · and the rule
"never imply that a specific size, width, colour, material or other requirement is confirmed unless we
can actually verify it." WHAT IS CLAUDE'S: these six steps, and every mechanism inside them.**
🚨 **NOTE WHAT THAT MEANS FOR THE 8-WORD `CUT` LIST: her rule says never CLAIM a requirement is verified
unless it can be. IT SAYS NOTHING ABOUT HOW TO VERIFY.** ▶ **The mechanism was always Claude's choice —
so getting it wrong was Claude's error alone, and flagging the fork was Claude's job alone.** The
earlier account ("her step 4 was clear and it was misread") was itself wrong: **step 4 was never hers.**
▶ **APPROVAL IS REAL AND STILL STANDS — she agreed to this flow. It is the AUTHORSHIP that was
misstated.** Keep the steps; keep the approval; never call them her words again.
1. The AI reads her sentence into a checklist (item · colour · material · size · width). **It invents nothing.**
2. **The service FINDS** real products. ← the only new piece
3. **Her 108-store allowlist throws away everything else** — and it already excludes fast fashion,
   rentals and subscription boxes, because those were never in the table.
4. **Each product is CHECKED against the checklist — comparing facts, never guessing.** No tick without
   evidence.
5. **`curatedPicks()` runs — the SAME picker**, never a copy. Never-wear, colour no's, price spread,
   max-two-per-retailer.
6. **Her sliders and her store dimensions order the results.**
🚨🚨 **HER RULE FOR A THIN RESULT SET — HER DECISION, 2026-09-06, AND SHE IMPROVED ON EVERY OPTION
OFFERED.** Precision will often leave very FEW matches; honestly narrowing her own blush-dress test left
**one**. Asked whether to show the one, pad the screen with near-misses, or show the one and offer to
widen, **she chose to show the one and offer** — her words: ***"If there is only one true match, I would
rather confidently show her the one true match than fill the screen with things that aren't what she
asked for. Then I would offer to widen the search."***
▶▶ **AND THE PART SHE ADDED, WHICH IS BETTER THAN ANYTHING PROPOSED AND IS THE ACTUAL DESIGN: THE WOMAN
CHOOSES *WHICH REQUIREMENT* TO RELEASE, ONE AT A TIME.** Her words: ***"maybe she wants to keep silk but
is open to another shade of pink, or maybe blush matters most and she is open to satin. That feels much
more like how I would work with a client."***
⚠️ **SO "WIDEN" IS NOT ONE BUTTON. Each requirement she asked for is separately releasable** — keep
silk / open on colour · keep blush / open on fabric — **and the app never decides for her which of her
own words mattered least.** That is the dressing-room behaviour, and it is the opposite of a search
engine quietly dropping terms until something comes back.
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
2. ✅✅ **THE SURFACE IS DECIDED — HER CALL, 2026-09-06: THE STYLIST CHAT FIRST, SHOP YOUR STYLE SECOND.**
   ▶ **This is the green light the 2026-09-05 scope decision was waiting for, and it is a REVERSAL of
   "wardrobe list first" — made deliberately, with her reason.** Her words: ***"That feels like the most
   important place to test this because that is where a woman can tell Style Star exactly what she is
   looking for in her own words. I want to know whether Style Star can take a real request, understand
   what matters, find real products, and then use my styling logic and her personal preferences to give
   her genuinely good recommendations."*** On Shop your Style: ***"I think that will make an enormous
   difference."***
   ⚠️ **WHY CHAT AND NOT THE SAFER SURFACES, and the reasoning is sound: HER OWN SENTENCE ONLY EXISTS IN
   CHAT.** Shop your Style and the Wardrobe rows build a request from her profile or a checklist row, so
   neither ever receives a sentence — **and therefore neither would exercise the precision work she just
   asked for at all.** The "blush silk wrap dress" problem is a CHAT problem.
   ⚠️ **SO THE WARDROBE IDEAS CAROUSELS ARE NOT FIRST AND THAT IS DELIBERATE.** The feed still powers
   them and nothing there changes.
3. ✅✅ **WHEN CHAT SEARCHES — HER CALL, 2026-09-06: THE STYLIST JUDGES IT, NOT A BUTTON AND NOT A
   KEYWORD.** Her words: ***"I want the conversation to feel natural, like she is talking to a personal
   stylist, not operating a shopping search tool."*** ▶ **The case she named and it is the test to build
   against: *"I have a wedding in Napa in October and nothing to wear"* MUST trigger a search — it is
   obviously a shopping request and it contains none of the words a keyword trigger would look for.**
   ⚠️⚠️ **AND THE LIMIT SHE DREW IN THE SAME BREATH, WHICH IS THE HARDER HALF: *"I don't want it
   searching just because a product or shopping topic comes up in conversation. It should search when
   finding real products is actually NEEDED TO ANSWER what she is asking."*** ▶ **So the trigger is
   NEED, not TOPIC.** "What do you think of navy on me?" is a shopping topic and needs no products;
   the Napa wedding names no product and needs them badly. **A topic classifier gets both wrong.**
   ⚠️ **A BUTTON WAS OFFERED AND REJECTED, and her mum's 2026-07-26 test agrees: content beats chrome.**
4. ✅ **COST — HER STANCE, 2026-09-06, RECORDED SO IT IS NOT RE-LITIGATED EVERY SESSION.** Told plainly
   that judging intent searches ~3-5× more than a button, her answer: ***"The cost difference does not
   change my answer right now. I would rather make the experience excellent first and then understand
   and control the cost once we see how women actually use it."*** ▶ **This is her VALUE FIRST principle
   applied to infrastructure, and it is consistent, so do not re-open it as a concern.**
   ⚠️ **BUT IT IS STILL THE APP'S FIRST PER-USER COST** — Netlify, Supabase and the nightly feed are
   FIXED whether 10 women or 10,000 use it; this one scales with usage. **~15¢ per shopping question.**
   ▶ **A SPEND CAP IS NOT A COMPROMISE ON THE EXPERIENCE and should be set anyway** — caching first
   (repeat questions cost nothing), then a hard monthly ceiling, so a surprise is impossible rather
   than unlikely.
   🚨🚨 **A MISATTRIBUTION, CAUGHT BY HER ON 2026-09-08 AND CORRECTED HERE.** This line used to end
   *"the cap is the seatbelt, not a second-guess"* and that phrase was quoted back to her twice as
   though it were HERS. **It was never hers. It is Claude's.** Her words are the ones actually in
   quotes above — *"I would rather make the experience excellent first and then understand and control
   the cost once we see how women actually use it"* — which carries close to the OPPOSITE emphasis, and
   the invented phrase was then used to justify a cap she had not asked for.
   ▶ **HER CORRECTION, VERBATIM 2026-09-08: *"at this point my focus is on making the app as good as it
   can be, not adding resistance."*** ⚠️ **SO: WARN, NEVER BLOCK.** A ceiling that silently degrades her
   app IS resistance, and it is the thing she has objected to since the Stitch Fix box.
   🚨 **THE LESSON, AND IT IS THIS FILE'S OWN: A PHRASE CLAUDE COINED, PUT NEAR HER QUOTES, BECAME HER
   QUOTE.** Bold text next to italic quotes reads as one voice. ▶ **Only her actual words go in
   ***triple-asterisk italics***. Anything Claude framed stays plainly framed, and is never quoted back
   to her as her own.**
5. ✅✅ **THE AFFILIATE TIE-BREAK — ASKED AND ANSWERED, 2026-09-06: "A". THE RULE HOLDS COMPLETELY, WITH
   NO EXCEPTION.** ▶▶ **The app NEVER knows which shops pay her. Fit and price decide, full stop — even
   when two options are exactly equally good and one earns and the other does not.**
   ⚠️ **THIS WAS FLAGGED IN THIS FILE SINCE 2026-07-29 AS "a decision she will face; it should be a
   deliberate one, not a drift." IT ARRIVED WITH THE CHAT DECISION AND SHE MADE IT DELIBERATELY. It is
   CLOSED. Do not re-open it, and do not propose a "tie-break only" softening later — that WAS the
   option offered and she declined it.**
   ▶ **The argument that decided it, and it generalises to any future rule of this kind: a tie-break's
   failure mode is SILENT. No test can prove a tie was genuine, so only intent keeps it honest — and
   this file holds three separate examples of a rule quietly drifting when nothing was watching it.
   Option A is the only version that cannot rot.**
   💰 **THE PRICE SHE KNOWINGLY PAID: she will earn less than she could, on purchases that were going to
   happen anyway.** She was told that plainly before choosing.
6. ✅✅ **WHAT CHAT SAYS WHEN IT FINDS NOTHING — HER CALL, 2026-09-06: "B". TELL HER PLAINLY, THEN OFFER
   TO WIDEN. NO FALLBACK TO AN INVENTED PRODUCT.** Her words, and the second sentence is a STANDING RULE:
   ***"If Style Star genuinely looked and there is nothing that meets her requirements, I want it to tell
   her that clearly and then help her widen the search. I do not want it falling back to an invented
   product or making a generic store search look like something Style Star actually found."*** And:
   ***"I would rather show nothing exact than recommend something that isn't what she asked for."***
   ⭐⭐ **HER OWN COPY, VERBATIM, AND IT IS THE MODEL FOR THE REAL WORDING — DO NOT PARAPHRASE IT INTO
   SOMETHING BLANDER:** ***"I couldn't find an exact match today. Would you like me to keep the blush and
   look at satin, or keep the silk and look at other shades of pink?"***
   ▶ **Note what that sentence does: it names the TWO requirements she gave and offers to release ONE of
   them, her choice. That is the per-requirement widening from item 4 above, written out.** Her framing:
   ***"I don't think finding nothing exact is a failure if we handle it like a good stylist would."***
   🚨🚨 **THIS CHANGES THE APP'S DOCUMENTED FLOOR, ON THE CHAT SURFACE ONLY, AND IT IS DELIBERATE. READ
   THIS BEFORE "RESTORING" ANYTHING.** This file has said since 2026-09-05 that tier 3 — the AI names a
   plausible piece and opens a store SEARCH — *"is the app's floor, it has always been the floor, and it
   is what every woman got before the feed existed."* ▶▶ **IN CHAT, THAT FLOOR IS NOW REMOVED AND
   REPLACED WITH HONESTY.** A future session finding "chat sometimes returns no products" must NOT treat
   it as a regression and must not re-add the fallback. **Wardrobe Ideas and Shop your Style keep their
   existing behaviour; this decision is scoped to chat.**
   ⚠️ **AND IT IS THE FIRST REAL APPLICATION OF HER "never claim a requirement is verified when it is
   not" LEDGER ROW.** Option A — falling back silently — was rejected precisely because an invented pick
   *looks identical to a real find*. **Not a lie, but indistinguishable from the truth, which she judged
   the same thing.**
7. ✅✅ **HOW THE WAIT FEELS — HER CALL, 2026-09-06, AND SHE COMBINED TWO OPTIONS INTO A BETTER ONE.**
   A real search takes **~5-8 seconds** against chat's current ~1. Offered "wait for one answer" (A),
   "warm reply first, cards follow" (B) or "show progress" (C), **she asked for B AND C together** — her
   reasoning: ***"when there is a long time to wait she could think broken and click out, if she gets a
   reassurance the search is on, that is much better than just looking at the screen, I also like the
   conversational approach of B."*** ▶ **She is right and they do not conflict: B removes the feeling of
   being IGNORED, C removes the fear that it is BROKEN. Different moments, different problems.**
   **THE SHAPE:** warm stylist sentence IMMEDIATELY → a quiet status line underneath while it works →
   the cards appear below.
   ⭐ **THE REFINEMENT AGREED: THE STATUS LINE IS IN HER VOICE, NOT THE MACHINE'S.** Not *"Checking
   sizes…"* (a loading message) but ***"Looking through your shops…"*** then ***"Checking what's actually
   in stock in your size…"*** ▶▶ **Because that sentence tells a woman something NO COMPETITOR CAN SAY.
   She is not watching a spinner, she is watching a stylist do what a stylist would do. THE WAIT BECOMES
   THE PROOF** — which is Sally Hogshead's differentiation note landing somewhere nobody expected. **Most
   apps hide the work because there is none.**
   ⚠️ **THREE THINGS THAT TURN THIS INTO A LOADING SCREEN IF GOT WRONG:**
   **(a) The line must REPLACE ITSELF, never stack** — three messages piling up is a progress bar in a
   dress. **(b) NOTHING MAY JUMP.** Her audience runs to 80 and a screen that shifts under a reader is
   genuinely disorienting: **cards appear BELOW what she is already reading, never pushing it around.**
   **(c) If the answer comes back fast the line must NOT APPEAR AT ALL** rather than flash for half a
   second.
   ▶ **And when nothing is found, the status line resolves straight into her own sentence from item 6**
   — *"I couldn't find an exact match today…"* — **so the honest answer arrives in the same place the
   good news would have.**
8. ✅✅✅ **THE PRECISION TEST WAS RUN, 2026-09-06, AND IT ANSWERED THE QUESTION: PRECISION IS
   ACHIEVABLE, AND IT COMES FROM THE SECOND CALL.** 19 of 250 searches used, 231 left. Still no code.
   ⭐ **BOTH OF HER STYLIST OBJECTIONS ARE DETECTABLE IN REAL DATA, AND ONLY ON THE SECOND CALL:**
   the Kensie *"Blouson **Wrap** Dress"* carries `95% polyester, 5% spandex` in its description (**not
   silk**) and Dillard's own offer title calls it a *"Self-Tie Waist **FAUX WRAP** Blouson Dress"*
   (**not a wrap**). **Google's title says "Wrap Dress" and would have passed it.** Hobbs Ariel says
   *"Pure silk"* in its description ✓ but its colour is **"Yellowmulti"** — correctly rejected.
   🚨🚨🚨 **AND THE FINDING THAT MATTERS MOST, BECAUSE IT CORRECTS ME AND NOT HER: THE DVF SHE APPROVED
   IS NOT BLUSH. IT IS A TIGER PRINT.** The second call gives the real colourway:
   *"Jeanne Long Sleeve Silk Wrap Dress in **PALACE TIGER PINK**"* (Nordstrom Rack $123.72), and the
   other colourways are **Chain Link Medium Black · Fuji Dusk Blue · Giant Snow Leopard Tobacco ·
   Heritage Snow Cheetah · Twigs Green**. **Silk ✓, wrap ✓, blush ✗ — not one colourway is.**
   ▶▶ **IT WAS PUT IN FRONT OF HER LABELLED AS THE RIGHT ANSWER, ON THE STRENGTH OF ITS TITLE, AND THE
   TITLE FOOLED CLAUDE EXACTLY AS IT WOULD HAVE FOOLED A WOMAN USING THE APP.** That is the entire case
   for verifying on the offer rather than the title, made accidentally and at her expense.
   ▶▶ **SO THE HONEST ANSWER TO "blush silk wrap dress" ACROSS ALL 110 SHOPS TODAY IS ZERO EXACT
   MATCHES — INCLUDING THE ONE SHE APPROVED.** Her rule was right and stricter than anyone was being.
   ⭐⭐ **AND HER WIDENING DESIGN WORKS ON REAL DATA. The candidate exists: MISS CIRCLE ODELLE,
   Nordstrom $249 — real wrap ✓, TULIP PINK ✓, crinkle CHIFFON not silk.** That is exactly *"keep the
   blush, open on the fabric"*, in stock, in her shops. **Her design is not theoretical.**
   ⚠️⚠️ **"SEARCH BROAD, NARROW AFTER" NEEDS A CORRECTION — IT IS NOT FREE.** The broad query
   *"women's silk wrap dress"* returned 13 of her shops but **DID NOT RETURN THE DVF AT ALL**, which the
   original narrow query did find. **Broadening changes the pool, it does not merely enlarge it.** ▶ The
   real shape is **SEVERAL queries (broad AND narrow), pooled, then verified** — not one broad query
   replacing one narrow one. Across both broad searches **not a single result was silk AND a true wrap.**
   ✅ **THE NAPA SENTENCE WORKED IMMEDIATELY AND NEEDED NO PRECISION WORK AT ALL: 16 of 40 from her
   shops, $25-$498** — Adrianna Papell · JS Collections · Dress the Population · Betsy & Adam · Old Navy
   at $24.99. Real occasion brands across every budget. ▶▶ **THE VAGUE FEELING-LED REQUEST OUTPERFORMED
   THE PRECISE ONE**, because broad asks are what a shopping index is good at. **So the hard case is the
   NARROW request, not the conversational one — the opposite of the worry.**
   🚨 **THE CONSEQUENCE FOR THE BUILD, AND IT RESIZES THE WORK: "NOTHING EXACT" IS A MAIN PATH, NOT AN
   EDGE CASE.** If a request as ordinary as *blush silk wrap dress* returns zero, the widening flow will
   run often. ▶ **It must be as beautiful and as finished as the results screen itself.**
9. ▶ **IF SHE SAYS YES:** the shape is known — search broad · filter to her 108 · drop resale and
   second-hand · verify per-offer · **route through `curatedPicks()`, never a second copy of her rules.**
10. ▶ **IF THE BLUSH DRESS DISAPPOINTS HER — SUPERSEDED BY ITEM 8, WHICH RAN THE TEST:** the fault is the AI's SEARCH WORDS, not the service. Also
   cheaply testable, 239 searches remain.
11. ⚠️ **THIS WOULD BE A THIRD PICKER.** The 2026-09-06 lesson is absolute: **a rule applied to one half
   is not applied.** It needs a ledger row and a test BEFORE it ships, not after.
12. ▶ **FREE AND UNMEASURED: how many of her 108 run on Shopify.** Shopify stores publish a public
   product file with **exact variant size + stock**, no API and no cost — real width/size truth for the
   DTC half of her list. **Nobody has counted yet.**
13. ⚠️ **THE LEGAL POSITION, MEASURED NOT ASSUMED:** Google sued SerpApi; **in July 2026 the court GRANTED
   SerpApi's motion to dismiss**, striking the DMCA claim for results with no copyrighted content, with
   no leave to refile. Google amended in August, narrowed to *licensed* content (Reddit snippets in
   Knowledge Panels). ▶ **Product listings are facts — the strongest side of a ruling that already went
   against Google.** Still live litigation. **Mitigation: keep the integration behind ONE small swappable
   piece so changing vendor is an afternoon.** ⚠️ SerpApi's legal shield does NOT cover the $25/$75 tiers.
14. ▶ **THE RUNNER-UP IF SerpApi DISAPPOINTS: SearchApi** — same $25, ~10× the searches. Test second;
   search QUALITY matters more than volume while she has no users.
15. ✅✅ **STORE EXPANSION — HER DECISION, 2026-09-06: ADD KOHL'S AND ZARA.** Measured from the 400 test
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

### ⚠️⚠️ A KNOWN PRE-EXISTING FAILURE IN `curated.js` — DO NOT PANIC, AND DO NOT DISMISS IT EITHER
🚨 **`curated` reports 64/1 on the check *"never ruffles" removes the ruffled item*, and it is NOT a
regression.** ▶ **PROVEN by running the SAME suite in a git worktree at `097585b` — this morning's `main`,
before a single line of today's work — and getting the IDENTICAL failure.** It also passed 65/0 twice
earlier the same day, so it is **time- or state-dependent, not code-dependent.**
✅✅ **AND HER NEVER-WEAR RULE ITSELF IS FINE. Measured three ways on today's code:**
`filterNeverWear` on the exact item goes **1 → 0** with `neverWear:['ruffles']` · `curatedPicks` with the
test's own four-item fixture returns x1 **without** the preference and **not** with it · both halves of
the assertion pass in isolation. **The rule works. The TEST is what is fragile.**
▶ **THE LIKELY CAUSE, not yet proven: `curated.js` runs many checks in one page, and earlier ones mark
pieces "seen this week". By the time this check runs the rotation/staleness state has moved**, so whether
the fixture surfaces at all depends on what ran before it and when.
🚨🚨 **WHY THIS IS WORTH FIXING PROPERLY AND SOON, RATHER THAN LOOSENING: this test guards the
never-wear list, which exists because of a box of shift dresses. A test that cries wolf on THAT rule is
worse than no test, because the next session learns to wave it through.** ▶ **The fix is to give it an
isolated context/state, NOT to relax the assertion.** ⚠️ **Until then: if this one check fails, verify
against `097585b` before believing it; if ANY OTHER check in `curated` fails, treat it as real.**

### ✅✅ CLOSED — HOW A NEAR MISS IS SHOWN, AND HER OWN WORDING FOR IT (2026-09-06)
⭐⭐ **HER SENTENCE, VERBATIM, AND IT BEAT ALL FIVE DRAFTED FOR HER:**
***"I couldn't find exactly what you asked for. This is the closest I could come up with."***
▶ **WHY IT IS BETTER, and it generalises: IT STATES THE TRUTH AND STOPS.** The built version tried to
say what went wrong AND explain the trade-off in one breath and came out as *"keep the fabric, and look
at other shades of pink and look at another style?"* — two "look at"s, **assembled rather than spoken.**
⚠️ **DO NOT PARAPHRASE IT INTO SOMETHING BLANDER AND DO NOT RE-ADD A QUESTION TO IT.** The detail
belongs on the CARDS, where every requirement already carries its own tick or its own honest note.

🚨 **AND THE SHAPE IS DECIDED TOO — SHOW THE CLOSEST, DO NOT ASK FIRST. HER CALL, and it is a
deliberate REFINEMENT of her own earlier "the woman chooses which requirement to release", not a
retreat from it.** Her words: *"simplify with the closest thing and just let her know. Simplest answer."*
▶▶ **THE ARGUMENT THAT MADE IT RIGHT RATHER THAN MERELY SIMPLER: SHOWING DOES NOT TAKE HER CHOICE AWAY;
ASKING WOULD HAVE DELAYED IT.** Her original worry was that the app must never decide WHICH OF HER WORDS
MATTERED LEAST. Showing every near miss, each labelled with what it keeps and what it gives up, decides
nothing — it puts every option in front of her at once. **Asking would have been MORE app-driven: it
makes her commit to a trade-off before she has seen a single dress.**
▶ **Three more things landed on that side:** her mum's 2026-07-26 lesson (**content is more discoverable
than chrome** — a question is chrome, the dresses are content) · **asking costs a SECOND search**, ~15¢
and another 5-8s, to reach pieces already found and paid for · and a simple line is harder to word badly,
which is exactly what went wrong with the first attempt.
⚠️⚠️ **THE ONE THING THAT MUST HOLD, AND IT IS WHAT PRESERVES HER RULE: THE GROUP LABELS.** *"Right
colour"* over one set, *"Right fabric and style"* over another. **If those are ever dropped or blurred it
really does become the app choosing for her.** ▶ They appear only when there is more than one group —
with a single set there is nothing to choose between and a label would be noise.

### 🚨🚨🚨 START HERE NEXT SESSION — THE STORE LIST, AND SHE HAS NOT HANDED IT OVER YET
▶▶ **THE FILE IS WRITTEN AND COMMITTED: `docs/store-scoring-brief.md`.** It was sent to her on
2026-09-06 and **she had not yet given it to ChatGPT when the session ended.** ⚠️ **SO THE FIRST
QUESTION NEXT SESSION IS SIMPLY: "did you get a chance to run the store brief through ChatGPT?"** —
not a re-explanation, not a redesign. **The work is waiting on one handoff, nothing else.**

**⭐ HER GOAL, HER WORDS, 2026-09-06: 200 STORES.** ***"I can do 200. I don't want to limit to 15. I want
the searches to be amazing and able to find users what they want."*** ▶ **So plan for ~200, up from 108.
Do NOT re-propose a small batch — she was offered fifteen and explicitly rejected the ceiling.**
▶ **HER METHOD, and it is a good one:** ***"I can get chat to help me with that because chat is good at
searching store inventory fast."*** **She drafts with ChatGPT, Claude checks the rows against her
existing 108, she corrects. That does NOT break "never invent a store's tags" — a draft she approves is
not an invention (the Garnet Hill lesson was about inventing SILENTLY).**

**WHAT `docs/store-scoring-brief.md` CONTAINS, so it never has to be rebuilt:** the business-model
exclusions FIRST (boxes, rentals, fast fashion, **and resale/marketplaces**) · the five fields a store
needs · the ten scores in exact order with **the pairs explained as pairs** · the polish-ranks-never-
matches rule · her own 30-label archetype vocabulary · **the measured range and mean of every dimension
across her 108** so a drafter calibrates instead of guessing · **all 108 stores with her real scores as
anchors** · and the live affiliate status marked business-planning-only.
⚠️ **THE FAILURE IT EXISTS TO PREVENT: her ~200-store wishlist from 2026-07-27 was referenced in this
file for six weeks and was NEVER SAVED ANYWHERE.** It lived in a chat and is gone. **This one is in the
repo.**
⚠️ **WHAT TO WATCH IN WHATEVER COMES BACK: a flat table.** ChatGPT will want to score everything a 7,
and a table where nothing varies cannot rank anything. **Her own 108 use the full 1-10 range on every
dimension except polish** (4-10, because she already excluded the stores that would score lower).
▶ **MEASURED PRIORITIES ALREADY APPROVED BY HER: Kohl's (+28, in 8 of 10 test searches) and Zara.**
Both still need scores. **Walmart is still hers to rule on.**

### ✅✅✅ ANSWERED AND BUILT, 2026-09-07: THE TWO JOBS **ARE** SEPARABLE — HER 200 STORES CAN BE A YES/NO LIST
▶▶ **THE QUESTION THIS FILE CARRIED AS UNVERIFIED — does a store need her FULL ten scores just to have
its products allowed through? — WAS MEASURED, NOT REASONED ABOUT, and the answer is NO.** It was checked
before being offered to her as a plan, exactly as the old entry demanded. **`scratchpad/untagged.js`, 18
checks**, runs the REAL functions out of `index.html`.
| The path | An untagged store |
|---|---|
| **(A) the finder's allowlist** | ✅ **passes on a NAME + SEARCH URL alone** — `find-products.js` never reads her ten scores at all |
| **Gate 2, the feed shelf** | ✅ **passes** — it already guarded itself and keeps the garment |
| **(B) the chat's store ranking** | 🚨 **CRASHED** — and that is now fixed |
🚨🚨 **THE CHECK FOUND A LIVE LATENT CRASH, AND IT IS THE SAME SHAPE AS EVERY BUG IN THIS FILE.**
`_rankedStores` mapped EVERY key through `_storeFit`, which reads all ten dimensions off `d` with no
guard. **One untagged store in the `STORES` table and every shopping prompt threw** — `_shopRules`,
the chat, Shop your Style, the lot, with no `try` anywhere above it. ▶ **This file already warned about
exactly this family for a RENAME (*"`STORES[key].u` throws, taking the whole page down"*); it was the
same hole one field over, and nothing was watching it.**
⭐ **THE FIX IS NOT AN INVENTED SCORE AND NOT A DROP, because both would break a rule of hers.** An
unscored store **keeps its place at the END of the list and is listed by NAME ONLY.** Ranking it would
mean making her numbers up (**never invent a store's tags**); dropping it would break **SORT, DO NOT
TRIM** and quietly hide a shop she had approved. **"We cannot honestly place this one" is the truthful
position, and the end of the list is already where the stores that go undescribed live.**
✅ **PROVEN NON-DISRUPTIVE: her 108 tagged stores rank in a BYTE-IDENTICAL order and the prompt store
list is byte-identical**, asserted against `git show HEAD:index.html` inside the suite itself.
▶▶ **WHAT THIS MEANS FOR HER EVENING, AND IT IS NOW SAFE TO OFFER: she can approve ~200 shops as a
plain YES/NO list — a name and a search URL each — and the finder will search all of them.** The deep
ten-score tagging becomes **OPTIONAL, and only for the shops she wants the stylist to NAME OUT LOUD**,
because that is the half that feeds `_storeFit`.
⚠️ **THE ONE THING THAT IS STILL TRUE AND SHE SHOULD HEAR: an untagged store is findable but NOT
recommendable.** It can never be ranked toward a woman it suits, and the chat will not describe it. **So
the ten scores are not busywork — they are what makes a shop RECOMMENDED rather than merely reachable.**
▶ **Her measured priorities are unchanged: Kohl's (+28, in 8 of 10 test searches) and Zara** — and both
could go in as yes/no rows today and be scored later, in that order.

### ▶ STEP 3 — WHAT SHE ALREADY DID, AND WHAT IS LEFT
1. ✅ **`SERPAPI_KEY` IS SET IN NETLIFY.** She added it and redeployed herself.
2. ✅ **SHE TESTED ALL THREE CASES ON HER PHONE AND FOUND FOUR FAULTS** — see the section above. Three
   were fixed the same evening; the fourth was the copy, and **she wrote the replacement herself.**
3. ✅ **EVERYTHING IS MERGED TO `main` AND LIVE.** The finder, the chat integration, the three fixes,
   the star and her wording — **and, 2026-09-07, the store guard and both photo crops.** ⚠️ **The
   2026-09-07 merge was VERIFIED LIVE by fetching stylestar.app and finding the markers in the served
   page (~20s after the push), not by trusting the deploy badge.** ▶ **Do that every time: the
   Post-processing badge sits on "In progress" long after the site is already live, and she has
   already been caught by it once.**
4. ▶ **STILL TO DO: re-run her three messages against the CURRENT build.** The Napa one is the one to
   watch — it returned nothing before the fix and returns real dresses ($39.97-$160) in testing now.
5. ▶ **THEN SHOP YOUR STYLE**, which she called ***"an enormous difference."*** Not started.
🔒 **SerpApi: ~75 of 250 free searches used on 2026-09-06. Her key is live and she may regenerate it at
any time — if she does, `SERPAPI_KEY` in Netlify must be updated too or the chat quietly loses its
product cards (no error, just advice).**

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
   🚨🚨 **CORRECTED 2026-09-08 BY DOING IT: ADDING A RAKUTEN MERCHANT IS *SIX* EDITS, NOT FOUR.** This
   file said four for weeks and it was wrong — **and the two it missed are the two that fail SILENTLY**,
   which is why nobody noticed. The full list, in the order they were found wiring COUTR:
   **(1)** the `STORES` entry, `index.html` — **the only one that needs her** ·
   **(2)** `_AFF_MID`, `index.html` — the domain → MID map, or nothing earns ·
   **(3)** `MID_TO_STORE`, `scripts/rakuten_feed.py` ·
   **(4)** `BUILD_MIDS`, same file, or the nightly feed never ingests it ·
   **(5)** ⚠️ **`netlify/functions/lib/store-domains.js` — GENERATED, run `node
   scripts/build-store-domains.js`.** This is the **product finder's** allowlist. Miss it and the finder
   simply cannot see inside the shop she was just approved for ·
   **(6)** ⚠️ **`SEARCH_DOMAINS` in `netlify/functions/style-ai.js`** — the **stylist's** allowlist.
   Miss it and the chat cannot search it either.
   ▶▶ **BOTH MISSES WERE CAUGHT BY DERIVED TESTS AND BY NOTHING ELSE** (`searchtune`'s "every store in
   the table also reaches SEARCH_DOMAINS", and `findprod`'s generated-file sync check). **On screen
   everything would have looked perfectly normal — a shop in her table that quietly could not be
   searched.** That is the same shape as every bug in this file.
   ▶ **`node scripts/build-store-domains.js --check` fails if (5) is stale. Run it.**
   **Draft all twelve from stores she already scored, show the neighbours, she corrects.**
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
🚨🚨🚨 **HER STANDING DIRECTION, 2026-09-08, AND IT OUTRANKS THE INSTINCT TO ADD MACHINERY:**
***"I want the AI to be using intelligence and I would like to reduce the amount of rules and breakable
things we put in there."***
▶▶ **THE TEST TO APPLY BEFORE BUILDING ANY NEW MECHANISM: is this a PROMISE or a JUDGEMENT?**
**PROMISES** — never a never-wear item · never claim a size/colour/fabric that was not checked · only
her shops · womenswear only · don't stack one store. **These are the whole list, and they stay in code**,
because a promise that depends on a good day is not a promise. **JUDGEMENTS** — is this fitted? is this
her? is it worth showing? **These go to the stylist, who can read.**
⚠️ **EVERY FAULT SHE FOUND ON 2026-09-08 WAS A JUDGEMENT BUILT AS A PROMISE.** The 8-word `CUT` list is
the clearest: a question needing eyes, answered by a lookup table.
▶ **AND THE SAME TEST RETIRES WORK SHE WAS ABOUT TO DO.** Her ~200 new stores were going to need ten
hand-scored numbers each. **They do not.** ▶▶ **A shop needs a NAME to be findable. THAT IS ALL SHE
OWES.**
🚨🚨 **SHE PUSHED ONE STEP FURTHER AND SHE WAS RIGHT AGAIN — MEASURED 2026-09-08, NOT ASSUMED.** Told she
should supply one describing sentence per shop, she asked: ***"why do I need to provide that? I would
think the AI would know all of these answers already."*** **It does.** Asked cold, with an instruction
to say NOT SURE rather than guess:
| shop | the stylist, with nothing supplied |
|---|---|
| Kohl's | *budget-friendly · everyday basics and activewear · carries plus and petite* ✅ |
| Tuckernuck | *mid-to-higher · classic preppy American style · limited plus, some petite* ✅ |
| Baby Gold | *mid-range · delicate minimalist gold jewelry* ✅ |
| Sexy Little Robe | **NOT SURE** |
| Jackie Mack Designs | **NOT SURE** |
▶▶ **SO THE ONLY THING THAT IS GENUINELY HERS IS *WHICH* SHOPS — the curation and the quality bar.**
What a shop IS, the model already knows; and where it does not, **it says so rather than inventing**,
which is the same honesty the whole app is built on. **The gaps come back as a short list of tiny
independent labels, and only those need her.**
⚠️ **DO NOT ASK HER FOR PRICE TIERS, ARCHETYPES, SIZE TAGS OR SCORES ON NEW STORES. ASK FOR NAMES.**
▶ **Her existing 108 tags STAY — they are real stylist knowledge, they are hers, and the Wardrobe
shelves still read the numbers. Keep them; just never ask for more.**
🚨 **SO WHEN A FUTURE SESSION WANTS TO ADD A TABLE, A LIST, A SCORE OR A KEYWORD RULE, THE QUESTION IS:
would a good stylist need this written down, or would she just look?** If she would just look, **let
her look.**

⚠️⚠️ **THE SENTENCE TO KEEP: A RULE APPLIED TO ONE HALF IS NOT APPLIED.**
🚨🚨 **AND ON 2026-09-09 THAT SENTENCE CAME TRUE IN THE MOST LITERAL FORM IT EVER HAS.** Four code
routes render a stylist bubble — the main answer, the cut-off answer, the live stream, and the retry.
**THREE of them stripped the internal marker. ONE did not**, and that is the one Cath photographed:
`<<FIND item=white top; cut=fitted; size=XS>>` sitting on her screen as though the stylist had typed it.
▶▶ **THE FIX IS THE GENERAL LESSON: A RULE THAT MUST HOLD ON EVERY ROUTE BELONGS AT THE CHOKE POINT,
NOT AT EACH CALL SITE.** The strip now lives inside `addChatMsg`, where every bot bubble passes, so a
fifth route added next year cannot forget it. **When you find yourself applying the same rule at three
call sites, that is the signal to move it underneath them — the fourth call site is already coming.**
🚨🚨 **THE SECOND LESSON OF THAT DAY, AND IT IS THE HARDER ONE: A PROMPT RULE IN CAPITAL LETTERS IS
STILL ONLY A PROMPT RULE.** The stylist's instructions said *"AN ITEM WITHOUT ITS ADDRESS DOES NOT
EXIST"* and *"Never invent an item"*. **It invented four items and four prices anyway**, and told her
it was doing so. ▶ **Shouting at the model is not enforcement. REMOVING THE ABILITY is.** The stylist
no longer holds products at all, so there is nothing left to invent — which is the same move as
`filterNeverWear` running in code instead of asking nicely in a prompt.
🚨🚨 **AND THE SECOND SENTENCE TO KEEP, ADDED 2026-09-08 AFTER SHE ASKED THE RIGHT QUESTION:
WHEN HER WORDS ADMIT TWO BUILDS, SAY SO BEFORE BUILDING — NOT AFTER SHE FINDS IT ON HER PHONE.**
▶ **WHAT PROMPTED IT.** Her step 4 of the agreed shopping experience reads: *"Each product is CHECKED
against the checklist — comparing facts, never guessing. No tick without evidence."* **That sentence is
clear.** It was then built as a fixed list of eight words — because *"never guessing"* was read as
*"never let the AI decide"*, which is a live fear here (the Stitch Fix box IS someone ignoring her
written note). ▶▶ **BUT "COMPARING FACTS" MEANS READING THEM.** A stylist who reads `95% polyester` and
says *"that is not silk"* is comparing facts, not guessing.
⚠️⚠️ **THE MISTAKE IN ONE LINE: "DON'T GUESS" WAS COLLAPSED INTO "DON'T THINK."** They are not the same,
and the difference was the entire fault she found six weeks later.
🚨 **THE WORSE HALF WAS THE SILENCE, NOT THE CHOICE.** Her sentence honestly admitted two builds; one
was picked without a word, and she discovered it from a screenshot. ▶ **A fork taken silently is
indistinguishable from a spec that was followed — which is the same shape as every other bug in this
file.**
▶ **HER QUESTION, WHICH IS THE REASON THIS ROW EXISTS: *"Am I not clear about how I want this to
actually function?"* THE ANSWER IS NO — SHE WAS CLEAR.** Her six numbered steps are still accurate
months later and none of them needed rewriting. **The gap was never in her brief; it was between her
brief and the build, and nothing was watching that gap.**
⚠️ **THREE TIMES IN ONE DAY, ALL THE SAME SHAPE:** a phrase Claude coined (*"the cap is the seatbelt"*)
quoted back as hers · a coined shorthand (*"the shrug"*) used as if shared · and her *"comparing facts"*
built as string matching. **Her words in, an interpretation out, and no flag on the difference.**
▶▶ **THE HABIT: ONE LINE, BEFORE BUILDING. "Your words could mean A or B; I am building B because X."**
It costs a sentence and it is the cheapest test in this whole file.
▶ **THE TWO HALVES.** The **AI path**: `_shopRules`, `_sizeGuidance`, `_wardrobeIdeaGen`, `sendChat`.
The **feed/shelf path**: `curatedPicks`, `scripts/slot_match.py`, `data/slot-rules.json`,
`netlify/functions/product-search.js`.
▶ **WHEN A NEW PICKER IS ADDED, IT MUST CALL THESE, NEVER COPY THEM.** Adding a second copy IS the bug —
that is the whole lesson of 2026-09-06 and it repeated twice more on 2026-09-07.

| Her rule | AI half | Shelf/feed half | Test | State |
|---|---|---|---|---|
| Never-wear list | `filterNeverWear` + prompt | `curatedPicks`, **same `_nwHit`** | curated · feedshelf · **chatfallback 55** | ✅ one shared implementation — **and it governs the 2026-09-09 browse wall too, tested** |
| Colour no's | `neverOther` verbatim in prompt | `_wdrNoColors` | curated | ✅ both |
| **Size range PER CATEGORY** | `_sizeGuidance`, built from `_FIT_FAMILIES` | `_fitApplies()` | **sizefit 38** | ✅ **fixed 2026-09-07** |
| A sweater is not a top | `_WDR_IDEA_EXCLUDE` | `data/slot-rules.json` | slot_match · feedshelf | ✅ both |
| The sibling-row map | `_WDR_IDEA_EXCLUDE` in prompt | Gate 1 in `curatedPicks` | feedshelf | ✅ both |
| **Store variety per surface** | `_shopRules` from `_STORE_CAP` | `_storeCap(mode)` | **storecap 15** | ✅ **fixed 2026-09-07** |
| Price spread | prompt line (`index.html:5015`) | band logic + feed ceiling | curated | ✅ both |
| Luxury via her retailers | `sendChat` prompt | n/a — feed links ARE her affiliates | ▶ none | ✅ verified by reading |
| **Store-pool eligibility** | `STORES` table only | **all 8 feed stores resolve, all have her dimensions** | **storepool 47** | ✅ **TESTED 2026-09-08 — the prediction came true on schedule** |
| **Never invent a store's tags** | **an unscored store is NAMED, never described** | Gate 2 uses her own tables | **untagged 18** | ✅ **both, tested 2026-09-07** |
| Never name her body/size back | prompts, `_sizeWordsOut` | **`_feedName()` strips a trailing size clause** | **feedname** | ✅ **both, 2026-09-08** |
| Never ask her age | app-wide, no age question | n/a | ▶ none | ✅ |
| **Womenswear only** | store list + prompts; `getStoreUrl` women's scoping (`w`/`gp`) | `keep_row()` gender column **+ NAME** | **rakuten_feed 55 · searchtune 79 · storepool 47** | ✅ **both halves tested 2026-09-08** |
| **Width is a shoe rule** | `_sizeGuidance` width line | `widthFit` via `_isShoeSlot` | **sizefit 46** | ✅ **built 2026-09-07** |
| **Never claim a save that failed** | n/a | `user-data.js` + `doStay` | **savetruth 14** | ✅ **fixed 2026-09-07** |
| Checklist is a possibility map | copy + framing | n/a | ▶ none | ✅ copy-only rule |
| **One photo renders the SAME on every screen** | **`pxPos`/`pxFit`/`px2` on the Star card (`.wks-px`)** | **the same override on the Edit (`.dc-item-px`), off ONE shared css rule** | **starpx 29** | ✅ **both, `px2` added 2026-09-08** |
| **Never claim a requirement is verified when it is not** | **the chat's cards: `judge()` + the three verdicts** | **`verifySize`/`verifyColour`/`verifyFabric`/`verifyCut`/`verifyWidth` in `find-products.js`** | **findprod 54 · chatfind 61** | ✅ **BUILT 2026-09-06, and the `n/a`s below have now expired as predicted** |
| **NEVER NAME A PRODUCT WE DID NOT FIND** | **the stylist may not name a product, price, size or link AT ALL — the ability is removed, not forbidden** | **every card carries a real verified offer from `find-products.js`** | **chatfallback 35** | ✅ **BUILT 2026-09-09, after she was shown four invented dresses** |
| **The internal `<<FIND>>` marker is never seen** | **stripped in `addChatMsg`, the ONE choke point every bot bubble passes through** | n/a — the shelves render no stylist prose | **chatfallback 35** | ✅ **fixed 2026-09-09; it had leaked from the one render route of four that forgot** |
⚠️⚠️ **THIS ROW WAS WRITTEN BEFORE ITS CODE EXISTED, AND THAT WAS THE POINT.** Her words, 2026-09-06:
*"we should never imply that a specific size, width, colour, material or other requirement is confirmed
unless we can actually verify it."* **She gave it while NOTHING was built** — so for once a rule existed
before the picker it governs, instead of being reverse-engineered after she found the fault on her phone.
✅✅ **AND THE PREDICTION IN THIS PARAGRAPH CAME TRUE, WHICH IS WHY THE TABLE'S `n/a` WARNING WORKS.**
It used to read *"the two `n/a`s here are honest TODAY and expire the moment a product search ships"* —
**the product search shipped that same evening, and the row sat stale until 2026-09-07.** ▶ **Filled in
now: the rule is enforced STRUCTURALLY, not by a prompt** — `CONFIRMED` · `REJECTED` · `UNKNOWN`, and
**UNKNOWN IS NEVER A PASS**, so a product is an exact match only when every requirement she stated is
CONFIRMED, and everything she KEEPS must be CONFIRMED while only what she RELEASED may be unknown.
🚨 **THE LESSON IS ABOUT THE TABLE, NOT THE RULE: AN `n/a` GOES STALE SILENTLY.** Nothing failed, nothing
broke, and the row simply described an app that no longer existed. **Re-read every `n/a` in this table
whenever a new surface ships — that is what this column is for.**
🚨 **This is the direct answer to the 2026-09-08 lesson — "a rule too obvious to write down is the one
that drifts." Womenswear-only had no row and a men's shirt reached her Tops shelf. This one has a row on
day zero.**
🚨🚨 **THE PHOTO ROW IS NEW ON 2026-09-07 AND IT IS THE LEDGER'S OWN THESIS ARRIVING THROUGH A PICTURE
RATHER THAN A PICKER.** Her Star of the Week bag was cut off, and the SAME photo file renders both on the
Star card and in the Edit off two classes that share one 3:4 top-anchored crop. ▶ **Fixing one and not
the other is the same bag cut off on one screen and right on the next** — *a rule applied to one half is
not applied*, in pixels. **The Crosbie Jean proved it twice over: the Edit had already fixed that photo
correctly on 2026-08-25 and the Star card had never been told.**
⚠️ **SO THE ROW IS NOT ABOUT CROPPING. It is about any per-item presentation override**, and the next one
added must be applied to every surface that renders that item, not just the one she happened to be
looking at when she noticed.
✅✅ **AND THE NEXT ONE ARRIVED ON 2026-09-08 AND OBEYED THAT SENTENCE ON DAY ZERO: `px2`, A STACKED
PAIR — HER IDEA.** Her words on the Saint Laurent sunglasses: *"Is it possible to stack the 2 photos
into one? So we can see the front of the glasses and the side with the logo and fill up the space on the
card too?"* ▶ **It renders two views of one piece, one above the other, filling a card that a single
wide-short photo leaves two-thirds empty.**
▶▶ **IT IS A THIRD MECHANISM RATHER THAN A FOURTH VALUE ON AN EXISTING ONE, AND THE REASON GENERALISES:
`pxPos` picks which END of a too-tall photo to keep, `pxFit` chooses whether to letterbox — and BOTH
ASSUME THE GARMENT FILLS ITS PHOTO.** A wide, short object does not. The sunglasses sit at 66%–96% of a
3:4 frame and span 3%–97% of its WIDTH, so nothing is cut off and yet the card is mostly empty, and no
crop can fix it (any crop that enlarges them must leave 3:4, and at any other ratio the frame clips both
arms under `cover` or shows cream bands under `contain`). **Measured, then four versions rendered at the
true card size and looked at.** ▶ **Belts, clutches and cuffs will all hit this. `px2` is for them.**
🚨 **THE CSS IS ONE RULE NAMING BOTH CLASSES — `.wks-px.is-stack,.dc-item-px.is-stack` — DELIBERATELY,
and `starpx` asserts exactly that.** Giving the stack a rule per surface is precisely how the Serpui bag
ended up right on one screen and cut off on the next. **One rule, both classes, always.**
🚨🚨 **AND THE LICENSING DID NOT MOVE, WHICH IS WHY IT IS BUILT THIS WAY.** Both halves are the
RETAILER'S OWN photos, **hotlinked**, behind the same `_affMid` gate as `px` — asserted by a test that an
unapproved store renders no stack at all. ⚠️ **DO NOT "simplify" it by compositing the two into one file
served from `/stars/`: that is re-publishing their photography from our own server, and `ownPx` is
reserved for HER OWN pictures of pieces she owns, where there is nobody to ask.**

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
are inline in `index.html`.

🚨 **CORRECTED 2026-09-07: THE CSS IS **NOT** INLINE ANY MORE. It lives in its own
`styles.css` (~331 KB), pulled in by one `<link rel="stylesheet" href="/styles.css">`
at `index.html:239`.** This paragraph claimed otherwise and cost a real detour: a
search for the Star of the Week photo rule found the class used in `index.html` and
styled nowhere, which looks like a missing rule rather than a stale note.
▶ **SO: markup, data tables and JavaScript are in `index.html`; every `.class{...}`
rule is in `styles.css`.** Grep the one you need, not the one the note names.

So: to change a feature, text or data, edit `index.html`; to change how something
LOOKS, edit `styles.css`.

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

- **`product-search.js`** — one wardrobe checklist row's worth of feed products
  out of Supabase. Takes a SLOT ID only. Requires `SUPABASE_URL` + `SUPABASE_KEY`.
- **`product-find.js`** — **NEW 2026-09-06.** Real products for a request a woman
  typed in her own words, out of the live shopping index, restricted to her own
  108 stores. Called from the stylist chat.
  🚨🚨 **IT NEEDS `SERPAPI_KEY` SET IN NETLIFY AND CATH HAS TO ADD IT.** Netlify →
  Site configuration → Environment variables. **Until it is set the chat simply
  gives ordinary stylist advice with no product cards — no error, no broken
  screen** (the function returns an empty pool on purpose).
  ⚠️ **THIS IS THE APP'S FIRST PER-USE COST.** ~15¢ a shopping question. The
  function caps itself at **4 searches + 6 product look-ups per request**, rate
  limits to **8 requests/minute per IP** (tighter than every other function here,
  because this one spends money), and caches for 30 minutes on a warm instance.

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

### ✅✅ DECISION (2026-06-28): affiliate applications ON HOLD until LLC + EIN + business bank — **THE HOLD IS LIFTED, 2026-09-08**
🚨🚨 **THIS CONDITION IS NOW FULLY SATISFIED AND THE HOLD NO LONGER APPLIES. Confirmed by Cath
2026-09-08: the LLC is active, the EIN is issued, the trademarks are filed, and she now has the
BUSINESS BANK ACCOUNT INCLUDING CREDIT AND DEBIT CARDS.** ▶▶ **So "waiting on the legal chain" is NOT a
reason to defer an affiliate application any more — and it was the reason for two months. The next
sequence item is LIVE: apply.** ⚠️ **CJ is free and still not done; that is the cheapest open move on
the board.** **Amazon still goes LAST, for the 180-day clock, which is a separate reason and still holds.**
▶ *The original decision, kept because it explains why the gap existed:*
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
### 🏛️ CLOSING THE SOLE PROPRIETORSHIP — HER DECISION 2026-09-08, AND THE FULL HOW
⭐⭐ **HER DECISION, IN HER WORDS: *"I decided I don't want to keep the name. I am going fully into Style
Star now."*** ▶ **So "Your Fashion Friend", the d/b/a she has operated under since 2005, is being CLOSED,
not transferred.** She was offered the alternative — a fictitious name **can** be owned by an LLC, so it
could have continued as a d/b/a of Style Star by Catherine, LLC, preserving twenty years of name
recognition with her personal-shopping clients — **and she declined it deliberately.** ⚠️ **DO NOT
RE-PROPOSE IT.** Her personal shopping now runs under the LLC.
▶ **WHAT PROMPTED IT:** her business tax receipt arrived in the mail and reminded her. She had looked at
the website and believed she had to go to the office in person.

**🚨 THE CORRECTION THAT SAVED THE TRIP: SHE DOES NOT.** Closing a business tax receipt in Orange County
is done **by email or by mail.** ▶ **The in-person requirement she found applies to CHANGES** — address,
ownership, name — **not to closures.** (In-person changes are at 301 S. Rosalind Avenue.)

**▶▶ AND THE FRAMING THAT TOOK THE WEIGHT OFF: THERE IS NOTHING TO "DISSOLVE."** A sole proprietorship is
not a registered entity in Florida — it is just her, doing business. **Only three things exist and each
closes separately: the fictitious name registration (state) · the business tax receipt (county, and city
if inside Orlando limits) · her tax filings.** It is admin, not a legal unwinding.

**THE STEPS, IN ORDER:**
1. ⚠️ **LOOSE-ENDS CHECK FIRST** — cancelling the name does not move what is attached to it: any bank
   account, PayPal/Venmo/Zelle/Stripe in the old name · business insurance · domain, email, social
   handles (**cancelling the registration does NOT release the domain**) · any client mid-engagement or
   invoice in the old name.
2. ⏳ **CLOSE THE COUNTY BUSINESS TAX RECEIPT — TIME-SENSITIVE.** The Florida business tax year runs
   **Oct 1 – Sep 30**, so the notice that arrived is for the year starting October 1. 🚨 **DO NOT PAY
   IT.** Write on the notice *"NO LONGER IN BUSINESS…"* with the business name, receipt number, effective
   date and signature, and mail to **Tax Department, P.O. Box 545100, Orlando, FL 32854** — or email the
   **Notice of Business Closure** form to **btpc@octaxcol.com**. **Keep a photo of whatever she sends.**
3. ▶ **CANCEL THE FICTITIOUS NAME.** Form **CR4E001**, **section 4 ONLY**, printed and mailed — **it
   cannot be done online.** She needs the registration number, free to look up on Sunbiz by name.
   ⚠️ **Florida's Fictitious Name Act asks for this within 30 DAYS of ceasing to use the name.**
   ⚠️ **The cancellation FEE was NOT confirmed** — she was told plainly to check it on the form.
4. ▶ **GET STYLE STAR'S OWN BUSINESS TAX RECEIPT.** Home-based businesses in Florida still owe local
   business tax — **Fla. Stat. 559.955 (2021) limits what else a city may impose, but not the tax
   itself.** If she is inside Orlando city limits the city wants **two applications together**: the
   **Home Occupation Application** (one-time **$50**, zoning review, includes a floor-plan sketch, and a
   notarized letter if she does not own the residence) **and** the Business Tax Receipt application, plus
   proof of business name from Sunbiz. **Permitting: 407-246-2204.**
   ⚠️ **An Orlando MAILING ADDRESS does not prove city limits — she must confirm.**
5. ▶ **HER ACCOUNTANT NEEDS ONE DATE:** the day she stopped operating as the sole prop. **And the
   startup-expense conversation** — the LLC is at a loss and that is what matters this year.
6. ▶ **KEEP THE YOUR FASHION FRIEND RECORDS** — 7 years is the safe figure.

⚠️ **CLAUDE IS NOT HER LAWYER OR HER ACCOUNTANT AND SAID SO PLAINLY.** The research above was fetched
live from the state, county and city sources on 2026-09-08 rather than recalled. **The tax-timing
questions are genuinely her accountant's.**

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

💵💵 **EARNINGS TO DATE, HER FIGURE 2026-09-08: $27 IN THE RAKUTEN DASHBOARD. EVERYTHING ELSE HAS BEEN
AN EXPENSE.** ▶ **Recorded because it is live operational status and because it is the honest baseline
that makes any future number mean something.** ⚠️ **It is also the whole argument in one line: the app
works, the feed works, the finder works — and $27 is what no users looks like.** **Not a failure, a
measurement.** ▶ **And the expenses are the tax-relevant half this year — see the accountant item.**

**✅ RAKUTEN — publisher APPROVED, SID 4740535.** This is the whole live feed today, **8 stores**:
**Mytheresa · FARM Rio (MID 44912) · Diane von Furstenberg (53590) · Vilebrequin (43322) · Olivela ·
Marissa Collections · Fleur du Mal · COUTR (54152).** ⚠️ **Every one is `$$$`/`$$$$` — that is the
affordability problem at its source, and no amount of code fixes it.**
⭐ **COUTR — APPROVED 2026-09-08, HER 8TH MERCHANT, WIRED THE SAME MORNING.** A designer marketplace
(Balenciaga, Bottega, Burberry, Celine, Fendi, Ganni, Golden Goose, Jacquemus, Prada, Saint Laurent).
Women's prices measured on their own pages: **$30 to $2,719, median $479.**
▶ **THREE THINGS ABOUT IT WORTH KEEPING:**
**(a) IT IS NOT RESALE, AND THAT WAS CHECKED RATHER THAN ASSUMED.** The word "marketplace" would have
disqualified it under her scoring brief, so it was verified first: their own page says *"Every item on
COUTR is brand new and 100% authentic, sourced directly from trusted vendors"* — new stock from designer
boutiques, one checkout. It passes her real rule (browse and **BUY AND KEEP** a specific item), and it is
none of her three exclusions. **Pinned by a test so nobody "tidies" it onto the resale list on the
strength of the word.**
**(b) ITS SEARCH URL IS GENUINELY VERIFIED FROM THE SANDBOX, WHICH ALMOST NEVER HAPPENS.**
`https://www.coutr.com/search?q=` returns 35 products for *silk blouse* and **ZERO for a gibberish
term** — the control that **Olivela and Mytheresa both FAIL**, which is why those two are still marked
unverified. **She was not asked for her address bar on this one.**
**(c) IT SELLS MENSWEAR, KIDSWEAR AND FRAGRANCE, so it carries `w:1`, and that was MEASURED:** a plain
search for *sweater* returned 36 products of which **10 were men's**; *womens sweater* returned 36 with
**ZERO**. Same fault she caught live in her Banana Republic results on 2026-08-08.
⚠️ **AND THE HONEST HALF, SAID PLAINLY: IT DOES NOT FIX THE PRICES.** Median $479 sits right alongside
the existing `$$$$` feed. **It is an eighth luxury store, not a mid-market one.** It earns, it unlocks
photography for anything she picks from it, and it is a genuine addition to the luxury-routing list
(it stocks Celine, Saint Laurent and Bottega, the exact houses that rule was written for) — **but the
answer to affordability is still users.**

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
