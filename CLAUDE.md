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
🚨 **THE ONE-LINE TRUTH ABOUT THE AFFILIATE CEILING, AND IT IS STILL TRUE: the thing standing between
Style Star and a mid-market feed is USERS, not code and not craft.**
⚠️⚠️ **BUT READ THE NEXT LINE BEFORE SAYING IT TO HER, BECAUSE IT STOPPED BEING AN ACTION ON 2026-09-09:
SHE HAS ALREADY SHARED THE APP — *"I have already asked many friends and put it out on Instagram."***
▶▶ **SO "you need users" IS A FACT ABOUT AFFILIATES, NOT A THING SHE STILL HAS TO DO.** Claude repeated
it several times that day as if it were her next step, and it was not: **she had already taken it.**
✅ **CLOSED 2026-09-11 (second session): SHE AND CLAUDE HAVE ALREADY BEEN OVER WHAT CAME BACK, IN
DETAIL, IN A PRIOR CONVERSATION.** ⚠️ **DO NOT ASK HER THIS AGAIN.** She'll surface more feedback as she
gathers it going forward — that's an open, ongoing thing, not a one-time question waiting on an answer.

### ⭐ THE BOARD — ALL FOUR CLOSED, AND THAT IS WHY THE NEXT MOVE IS A QUESTION, NOT A BUILD
| # | What | Who | State |
|---|---|---|---|
| 1 | ~~Hand the store brief to ChatGPT~~ ✅ **CLOSED 2026-09-08 — she sent her own roster instead. 122 shops, and she is DONE adding for now.** | — | ✅ done |
| 2 | ~~Re-run her three chat messages~~ ✅ **CLOSED 2026-09-09 — she tested the live build herself, twice, and her verdict is *"The chat is now working with scrollable photo options!!!"*** | — | ✅ done |
| 3 | ~~Shop your Style — wire the finder into it~~ ✅ **BUILT 2026-09-09, BOTH FORKS ANSWERED BY HER FIRST.** Real products lead, her six stay below; the default view searches too. `ssfind` **52** checks. | — | ✅ done |
| 4 | ~~A save heart on `_findCard`~~ ✅ **BUILT 2026-09-09 — every card the finder shows now carries the EXISTING `_wlSaveBtn`, and a saved piece keeps its photograph.** | — | ✅ done |
| 5 | ~~Homework 7 — first testers~~ ✅ **CLOSED 2026-09-09 BY HER: *"I have already asked many friends and put it out on Instagram."*** | — | ✅ done |
| 6 | ~~Three Edit pieces + the Edit's order~~ ✅ **BUILT AND LIVE 2026-09-10 — her Simkhai tote, Simkhai sandal and Zoe Lev necklace, all Olivela and all EARNING; the shops that pay her now LEAD. ⚠️ **The Edit was 35 that day, 33 after two Amazon pieces moved to `/finds`, and is 30 now** — she also removed the J. Reneé Soncino sandal, the Felina bra and the Good American jeans.** | — | ✅ done |
| 7 | ~~The Edit strip could not see one of her photos~~ ✅ **HER CATCH, FIXED 2026-09-10 — and it turned up a latent bug that would have shipped a broken card when the Star rotation moved on.** | — | ✅ done |
| 8 | ~~The strip cropped her photos and showed the Star twice~~ ✅ **HER THREE CATCHES OFF ONE SCREENSHOT, ALL FIXED AND LIVE 2026-09-10. The strip now CROPS NOTHING, renders a `px2` stack as a stack, and can no longer duplicate the Star.** | — | ✅ done |
| 9 | ~~The whisper promised "the same pieces waiting" and a resume searched again~~ ✅ **HER CATCH, FIXED AND LIVE 2026-09-10 — and the check that was supposed to guard it had been a FALSE GREEN for a day.** | — | ✅ done |
| 10 | ~~The stylist says "belted" and searches "dress"~~ ✅ **HER RULING, BUILT AND LIVE 2026-09-10: *"I want the stylist to deliver exactly what she is promising."*** | — | ✅ done |
| 16 | ~~The Wardrobe list saw only her 9 affiliate shops~~ ✅✅ **HER DECISION, BUILT AND LIVE 2026-09-10 — ALL THREE SHOPPING SURFACES NOW SEARCH HER SHOPS PLUS ALL 132.** She chose the layout by LOOKING at both rendered at phone size, and ruled the apologising line off. | — | ✅ done |
| 17 | ~~Every search was a cold 4-12s search, even a repeat~~ ✅ **LIVE 2026-09-10 — the app remembers what it has already paid for. ⚠️ IN HER BROWSER, NOT THE DATABASE; the shared version was written and THROWN AWAY on security grounds. See the ledger.** | — | ✅ done |
| 18 | 🚨 **"COULDN'T LOAD OPTIONS RIGHT NOW"** — she photographed it on Shop your Style. **The stylist call failing, NOT the search. Cause still unknown.** | Claude | ⏳ **OPEN — the last known live fault** |
| 20 | ~~Her two failed searches: "vacation dress" and "white jeans"~~ ✅ **BUILT AND LIVE 2026-09-10.** *White jeans WORKED* — Google's half was flapping (0 results one minute, 23 the next) and her own shelf carried it. *Vacation dress* found nothing because the word went INTO the search. | — | ✅ done |
| 21 | ~~Five of the app's own nine suggested prompts were things it could not do~~ ✅ **HER CATCH 2026-09-10 — three occasions now translate, and the two PRICE prompts came off, her ruling.** | — | ✅ done |
| 22 | 💰 **A PRICE FILTER — THE SEARCH HAS NO PRICE FIELD AT ALL.** A find request carries item · colour · fabric · cut · size · width and nothing else, so *"under $100"* was never filtered, only ignored. ▶ **When it is built, put `Try: tops under $100` and `Try: white jeans under $150` straight back — the only thing wrong with them was that they were promises.** | Claude, hers to green-light | ⏳ **OPEN** |
| 19 | ⭐⭐⭐ **APPLY TO THE 41 BRANDS THAT PUBLISH CATALOGUES** — Everlane · Boden · Tuckernuck · Universal Standard · Cuyana · Alo Yoga · Summersalt · Good American · Veronica Beard and more. **CJ is FREE and still not done.** | **HERS, and worth more than anything Claude can build** | ⏳ **OPEN** |
| 11 | ⏸️ **THE FINDER HAS NEVER BEEN SHOWN HER STYLE PROFILE** — her *"I like fitted clothing and many of them were shapeless"*. She is **8 leaning fitted** on her own Style Signature and the finder gets an item and a cut, nothing else. **PARKED BY HER 2026-09-10: *"Let's park that piece for right now."*** ▶ **Not dropped — it keeps its place on this list and she reopens it.** | Hers | ⏸️ **PARKED, NOT STARTED** |
| 23 | 🛍️ **IMPROVE THE WISHLIST PAGE — HER ASK, 2026-09-10, ANSWERED 2026-09-12: THE FITTING ROOM.** She confirmed it's for comparison — fit, price, does it work with what she owns, is it worth the money — and greenlit building it the same session. **BUILT AND LIVE: a List View/Fitting Room toggle, same list, no second thing to save into.** Full build story (the reload-survival bug it caught, the three upstream photo gaps it fixed, the 24-check suite) is in `CLAUDE-archive.md`'s 2026-09-12 (second session) entry. ⭐ **A follow-up round the same session, also merged live:** the toggle's tappable-arrow indicator was rebuilt to match Wardrobe's real tabs after her first version came out wrong (arrow beside the label instead of stacked below it, per her catch), and "List" became "List View" so the pairing with "Fitting Room" reads as two views of one list. | — | ✅ done |
| 24 | 🔗 **THE EDIT AS A SHAREABLE LINK — HER ASK, 2026-09-10: *"I want the Edit to be a shareable link."*** ▶▶ **YES IT NEEDS ITS OWN URL, AND THE MACHINERY IS ALREADY BUILT AND PROVEN EIGHT TIMES.** `_ROUTES` today: `/privacy` `/terms` `/story` `/faq` `/contact` `/trending` `/wardrobe` `/results`, plus `/journal/<slug>` and the token-carrying shared wishlist. **The Edit (`s-dream`) is simply not in it.** ▶ **THE BUILD IS THE DOCUMENTED THREE EDITS:** one `_ROUTES` line · one `[[redirects]]` block in `netlify.toml` (status **200**, a rewrite not a 301) · one line in `_openRoute()`. 🚨🚨 **AND THE TRAP, FOUND BY READING THE CODE BEFORE BUILDING: `_openRoute` MUST CALL `showDream()`, NEVER A BARE `show('s-dream')`.** **`showDream()` is what calls `_wlDecorateEdit()`, and `_wlDecorateEdit()` IS WHAT AFFILIATE-WRAPS EVERY EDIT LINK AT RUNTIME** (`index.html:9963`). ▶ **A direct landing that skipped it would render her whole Edit with RAW product links that earn NOTHING — the exact "one route of four forgot" shape as the `<<FIND>>` marker leak.** ⚠️ **Assert it in a test: land on the path cold and check an `.dc-item-btn` href contains `click.linksynergy.com`.** | Claude | ⏳ **OPEN — she asked for it** |
| 25 | 🛒 **AN AMAZON FINDS PAGE — HER ASK, 2026-09-10, AND STRATEGICALLY IT IS THE BEST IDEA ON THIS BOARD.** ***"I want to make an Amazon finds page. Another Sharable page dedicated to Amazon finds. I want to also feature some of them on Star of the week and our normal edit."*** ▶▶ **WHY IT MATTERS MORE THAN IT LOOKS: THIS FILE HAS SAID FOR WEEKS THAT WHAT THE APP LACKS IS A MID-MARKET GENERALIST** (every fed store is `$$$`/`$$$$`, dress median $398, 0 of 200 dresses under $100). **Amazon IS that, and it is the one such programme she can join without being declined for traffic.** ⚠️ **SO HER INSTINCT ANSWERS THE AFFORDABILITY PROBLEM THIS FILE KEPT CALLING UNSOLVABLE-WITHOUT-USERS.** 🚨🚨 **BUT THE ORDER SHE PROPOSED IS BACKWARDS AND IT IS WORTH REAL MONEY TO GET RIGHT — SEE THE AMAZON BLOCK IN THE MONEY PATH.** ▶ **THE PAGE ITSELF NEEDS NO CATALOGUE AND NO API: hand-picked links, exactly like the Edit, which is also the only version that honours her own disclosure that every piece is personally selected by the founder.** | Claude to build, HERS to pick the pieces | ⏳ **OPEN — she asked for it** |
| 24b | ✅✅ **THE EDIT IS A SHAREABLE LINK — BUILT AND LIVE 2026-09-10: `stylestar.app/edit`.** ▶ **SIX edits, not the three the routing note promised**, because sharing needs more than a route: the `netlify.toml` rewrite (200) · an `[[edge_functions]]` registration · `PAGES['/edit']` in `page-titles.js` · `_ROUTES` · `_PAGE_META` · an `_openRoute` branch · **and the sitemap entry (priority 0.9)**. 🚨🚨 **THE TRAP IT NEARLY SHIPPED WITH, AND IT WAS MEASURED: `_openRoute` MUST CALL `showDream()`.** Planting a bare `show('s-dream')` rendered **17 links on merchants she IS approved for completely UNWRAPPED** — earning nothing, on the one page she actually sends to people, **with every card looking perfectly normal.** ▶ **`scratchpad/editshare.js`, 26 checks, built around that money check and PROVEN TO BITE.** ⚠️ **The title and description live in TWO files that cannot import from each other; §4 of the suite asserts they match word for word.** ✅ **Verified on the SERVED file, not the deploy badge.** | — | ✅ done |
| 25b | ✅✅ **AMAZON FINDS IS BUILT AND LIVE — `stylestar.app/finds`, 2026-09-10. ⭐⭐ HER FIRST PIECES LANDED 2026-09-11 AND IT IS IN THE SITEMAP NOW (priority 0.9).** Her ask: *"let's go ahead and move the Amazon pieces that are currently on the Edit over the Finds page now"* — **the Badu stacking bangles $16.99 and the PRETTYGARDEN maxi $46.99, MOVED not copied, so the Edit went 35 → 33 and holds no Amazon piece at all.** ⚠️ **THE BANGLES STAY IN `WEEK_STARS` ON PURPOSE — her own *"I want to also feature some of them on Star of the week"*. That table was NOT touched.** ✅ **IN THE APP'S NAV SINCE 2026-09-11, HER CALL: *"let's go ahead and put it in"*** — the MENU's Shop group, directly beneath Style Star Edit, calling `openFinds`. ▶ **It was kept out of the sitemap while it was empty — a crawler that meets an empty page first tends to keep believing it is empty.** 🚨 **THE NAMING DECISION, AND IT IS THE PART THAT MATTERS: THE HEADING SAYS *AMAZON FINDS* AND THE PATH SAYS `/finds`, DELIBERATELY DIFFERENT.** Her words: *"I want it to be Amazon Finds or something with Amazon in it FOR NOW. If later we get Target or kohls approved maybe could change."* ▶▶ **A HEADING IS FREE TO CHANGE; A PATH CAN NEVER MOVE ONCE SHARED (her own standing rule). Separating them is what makes her "maybe change later" actually possible.** ⚠️ **RENAME THE HEADING FREELY. NEVER RENAME THE PATH.** | — | ✅ live, **51 pieces in 8 categories** (2026-09-12 batch: +7 new, 6 note revisions), indexed |
| 12 | ~~The wall arrives in Google's order, not hers~~ ✅ **HER DECISION, BUILT AND LIVE 2026-09-10 — her ten dimensions order the browse row. Measured: Google sent `Old Navy > Nordstrom > Kohl's > Talbots`, she sees `Nordstrom > Talbots > Old Navy > Kohl's`.** | — | ✅ done |
| 13 | ~~The app promises before it knows it can deliver~~ ✅ **HER DECISION, BUILT AND LIVE 2026-09-10 — the stylist's sentence is HELD until there are cards to keep it with. Retires a FAMILY of faults, not one.** | — | ✅ done |
| 14 | ~~Affiliate shops should appear "somewhere in there"~~ ✅ **POSITION was already built (`_findSpread`, 2026-09-09). ⚠️ Her ruling was in NEITHER file; it is in the ledger now.** | — | ✅ done |
| 15 | ~~Her affiliate shops never appear at all~~ ✅✅ **HER CATCH AND HER DECISION, BUILT AND LIVE 2026-09-10 — the finder now searches HER OWN NIGHTLY FEED beside Google. Google will not surface her small luxury shops (0 of 120, then 0 of 33), so this was PRESENCE, not position, and no sort could ever have fixed it.** | — | ✅ done |
🚨🚨 **THE BOARD IS NO LONGER CLEAR — SHE TESTED THE LIVE APP ON 2026-09-10 AND FOUND THREE THINGS.
Two are fixed and live; ROWS 11 AND 12 ARE HER OWN WORDS AND NEITHER IS STARTED.** ⚠️ **SHE ASKED FOR
THEM ONE AT A TIME — *"Ok let's go slow here one at a time"* — so do NOT bundle them, and do not start
either without her.** ▶ **Read the block below before
offering her anything else; the belted fork is the most valuable question on this page.**
▶▶ *The note that stood while rows 1-9 were all closed, kept because its advice is still right the next
time the board empties:* **EVERY ROW IS DONE. There is no approved next build.** ⭐ **The next session's job is to ASK — what her
testers said, and what a fitting room means to her — and let her answers set the work. See "WHAT CLAUDE
BUILDS NEXT" below, which is deliberately a list of UNAPPROVED options rather than a queue.**
⭐⭐ **AND 2026-09-10 FOUND THE ANSWER TO "WHAT DO WE DO WHEN THERE IS NO APPROVED BUILD": SHE BROUGHT
CONTENT.** Three Edit pieces in one sitting, each verified against the shop's own data before it shipped.
▶ **That is the highest-value thing she can do that needs no approval from anyone — her curation is the
moat, and it is the one half of this app Claude may never do for her.** **Offer it whenever the board is
clear.**

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
- ✅✅ **Shop your Style — BUILT 2026-09-09**, both forks answered by her first. **Its spec is in the
  STANDING REFERENCE section below; the build story is in `CLAUDE-archive.md`.**
- ▶ **A SPEND CAP + CACHING for SerpApi.** ⭐ **THE CACHING HALF LANDED WITH SHOP YOUR STYLE** — a repeat
  of the same question on that screen now costs nothing (`_FIND_CACHE`, opt-in, that screen only). ⚠️ **A
  cap is still unbuilt, and her stance on it has not moved: WARN, NEVER BLOCK.** ~15¢ per shopping question and it is the app's **first
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
  **Style Star Edit**, and the frozen catalog. **`scratchpad/linkwatch.js`, 27 checks.**
  🚨🚨 **FOUR SURFACES FROM 2026-09-11 — AMAZON FINDS JOINED, AND THE WAY IT JOINED IS THE LESSON.**
  `collectEdit` split the WHOLE source on `<div class="dc-item">`, which was correct while one screen
  used that markup. **The Finds page uses the same blocks, so the moment her first two pieces landed,
  her Finds pieces were filed under *"THE STYLE STAR EDIT"* — in a report whose only job is telling her
  which page to go and fix.** ▶ **Both parsers are SCOPED BY SCREEN now (`s-dream` / `s-finds`),
  `SURFACE` has a `finds` row, and the report loop and `--only` know it.** ⚠️ **A THIRD CURATED SCREEN
  WILL DO THIS AGAIN: with no slice and no `SURFACE` row, its pieces vanish from the report with NO
  error.** ✅ **So `linkwatch` now asserts the two screens' counts ADD UP to every `.dc-item` in the
  file — an unwatched screen fails the suite instead of going quiet.** ⭐ **The failure that started it
  was the good kind: `collected 33 of 35`.**
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
  ✅✅ **THE REAL GAP IS CLOSED — BUILT 2026-09-09.** `_findCard` carries the **EXISTING** `_wlSaveBtn`
  now, on every card of the row, checked and browse alike, and the wishlist entry carries `image`. ▶ **So
  the piece the fitting-room view was waiting on exists: saved pieces now have photographs.** Nothing
  renders them yet, on purpose — that IS the parked view, and it is still hers to start.
  🚨 **AND ONE HONESTY DECISION INSIDE IT THAT MUST NOT BE "TIDIED" AWAY:** a CHECKED card saves as
  `exact` (real product page → the row keeps its price and says *"Shop it"*); a BROWSE card saves as the
  ordinary kind (store + search term → the row rebuilds the search, says *"Find it"*, shows NO price).
  **Saving both the same way would have put a price and "Shop it" on a row that lands on a results
  page**, which is exactly the *"generic store search dressed as a find"* she banned on 2026-09-06.
  ▶ **The card never claimed it, so the saved row may not either.** Pinned by `chatfallback` section 15,
  and the two checks were **proven to bite** by putting the wrong version back.
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
- ✅✅ **MORE STYLE STAR EDIT ITEMS — SHE ADDED THREE ON 2026-09-10 AND THEY ARE LIVE.** Simkhai Devon
  Suede Tote $695 · Simkhai Stella Suede Block Heel Sandal $445 · Zoe Lev Diamond & 14k Gold Bezel
  Pendant Necklace $825, **all from Olivela, so all three EARN.** ▶ **The Edit is 28 items** (35 → 33
  when two Amazon pieces moved to `/finds` → 30 when she removed the Soncino sandal, the Felina bra and
  the Good American jeans → 28 when she removed the Lucky Brand espadrille wedge and the Align Pant),
  ordered her way since 2026-09-10: **the shops that pay her lead, the text cards follow.** ⚠️ **CLAUDE MUST
  NEVER PICK THE PRODUCTS** — the disclosure says every piece is personally selected by the founder.
  **Protect that.** ⭐ **The working pattern that produced three in one sitting: she sends a link, a
  price and her note; Claude verifies the price and stock against the shop's own data, strips the
  tracking, picks or renders the photo choices, and shows her the card before it ships.**
- ⭐ **HOMEWORK 6 — THE REAL QUALITY GATE, still IN PROGRESS and still the highest-value thing she can
  do:** tap through 10-15 suggestions across Shop your style, Wardrobe Ideas and Complete the Look and
  say **where the searches land wrong.** Claude can prove a link returns results; **only she can judge
  whether the search term was the right one.**
- ▶ **HOMEWORK 4 — SPOT-VERIFY THE UNVERIFIED STORES** with the address-bar trick. Outstanding: Talbots ·
  Kendra Scott · SKIMS · Lane Bryant · Dia&Co · Sam Edelman · Lacoste · Tory Burch · Belk · Bergdorf
  Goodman · TJ Maxx · Sunglass Hut · Warby Parker · Dillard's. **Only worth doing for stores she would
  actually send a client to.**
- ✅✅✅ **HOMEWORK 7 IS DONE — SHE HAS SHARED IT, 2026-09-09. HER WORDS: *"I have already asked many
  friends and put it out on Instagram."*** 🚨🚨 **THIS IS LIVE OPERATIONAL STATUS AND IT NEVER ARCHIVES.**
  ▶▶ **SHE WENT FURTHER THAN THE 5-10 WARM TESTERS THIS FILE KEPT RECOMMENDING — INSTAGRAM IS A PUBLIC
  POST, NOT A HAND-PICKED CIRCLE.** ⚠️ **SO THE SOFT-LAUNCH POSTURE RECORDED SINCE 2026-07-14 HAS BEEN
  RETIRED BY HER, and the file must stop protecting a caution she has already set aside.**
  🚨🚨 **AND STOP TELLING HER SHE NEEDS TESTERS. SHE HAS ASKED.** Claude said "the answer is users" many
  times across 2026-09-09 — correct as an affiliate fact, and **wrong as a next action, because she had
  already taken it.** ▶ **THE OPEN THREAD IS NO LONGER OUTREACH, IT IS WHAT COMES BACK: has anyone used
  it, and what did they say?** **ASK HER THAT — do not re-propose finding testers.**
  ⚠️ **WHAT IS WORTH OFFERING INSTEAD, and only if she wants it: there is NO analytics answer to "did
  anyone use it" in this file.** `track()` exists; nobody has looked. **If she wants to know whether the
  Instagram post produced real sessions, that is a real, small, unstarted piece of work.**

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

## ▶▶▶ WHERE WE LEFT OFF — 2026-09-12 (fourth session, end of session). READ THIS FIRST.
🚨 **THIS BLOCK IS THE CURRENT TRUTH. Everything below it is standing reference — if a line further
down contradicts this one, THIS ONE WINS.**
📁 **The third-session 2026-09-12 entry (the Mall/Finds reorder, the footer repoints) moved to
`CLAUDE-archive.md` in this commit, VERBATIM**, under its own heading. Nothing was deleted.

### 🚨🚨 THE BIG FINDING THIS SESSION: SUPABASE WAS SILENTLY REJECTING EVERY SAVE, FOUND AND FIXED
She reported the wishlist's "Get my link" button failing with *"That didn't go through."* ▶▶ **THE REAL
CAUSE WAS NOT THE SHARE FEATURE — IT WAS THE DATABASE ITSELF.** Traced end to end with live diagnostics
(never guessed): a direct test of the live save endpoint came back `"detail":"supabase 401"` — **the
`SUPABASE_KEY` Netlify was using had gone stale, so NO save had been reaching the database, for an
UNKNOWN PERIOD, for (most likely) EVERY user, not just her.**
▶ **WHY IT WENT UNNOTICED: everything lives on-device first.** The wishlist, results and preferences all
work fine locally; the database is only touched in the background, silently, and nothing surfaced a
failure — until the share flow tried to read a saved row back and found nothing there.
✅ **SHE FIXED IT HERSELF, LIVE, WALKING THROUGH IT TOGETHER:** confirmed in Supabase the project itself
was healthy (not paused) → found the current `service_role` secret key under Project Settings → API →
"Legacy anon, service_role API keys" → pasted it into Netlify's `SUPABASE_KEY` environment variable →
triggered a redeploy. **Re-tested live immediately after: both the save endpoint (`success:true,
saved:true`) and the actual share-link creation (`success:true, sharing:true, shareToken:...`) now work
end to end.**
⚠️ **A LIKELY EXPLANATION, NOT CONFIRMED:** Supabase's dashboard was showing a newer "Publishable and
secret API keys" tab alongside the "Legacy anon, service_role" one she used — that split, plus a sudden
401 she never caused, is consistent with Supabase rotating the underlying JWT signing secret on their
side, which silently invalidates old legacy keys. Worth remembering if this recurs: check Supabase's own
key pages first, not just "is the project paused."
🚨🚨 **STILL OPEN, WORTH A LOOK: HOW LONG WAS THIS BROKEN, AND DID ANY REAL SIGNUP'S DATA NEVER MAKE IT
TO THE DATABASE?** MailerLite signups kept arriving throughout (that call runs independently of the
Supabase save), so her email list is NOT missing anyone — but any woman who completed the quiz, saved
results, or built a wishlist during the broken window has data that lives ONLY on her own phone, with no
server copy and no way to restore it on a new device. **No way to know the start date from here** —
worth asking Supabase support for the API error history if she wants to know how far back it goes.

### ✅ ALSO FOUND AND FIXED ALONG THE WAY: A REAL CLIENT-SIDE BUG, INDEPENDENT OF THE SUPABASE OUTAGE
The server hands back a save token even on a FAILED save (502) — by design, so a retry of the SAME save
can reuse it (see its own comment in `user-data.js`). **The client was adopting that token
UNCONDITIONALLY**, so a device whose very first save ever failed walked away holding a real, valid,
non-expiring-for-30-days token for an email with NO row behind it. Everything kept working locally, so
nothing looked wrong, until "Get my link" tried to read that row back and 404'd in a way that looked
identical to an expired-token 403 from the outside — which is what sent this session down the wrong path
first. ▶ **FIXED: `saveUserRecord()` now only adopts the token (and backfills the email) from a save that
actually succeeded (`res.ok`).** Proven with a new test that a 502 carrying a token no longer leaves the
device believing it's synced. **This is now also a STANDING DON'T — see that section.**
▶ **A genuinely useful, honest side-fix landed too, and it stays regardless of the Supabase incident:**
"Get my link" now tells the difference between an EXPIRED token (403/token_required — nothing can fix
itself, so it routes straight to the existing "Find my results" restore flow) and a genuine transient
failure (keeps the old "try again" message, since retrying really can help there). `_goRestore()` is the
new function; it navigates home and reveals the restore card since that UI only exists on `s-wel`.
⚠️ **A temporary diagnostic tag was added mid-investigation (a small grey technical line under the error
message) to find the real cause faster, then REMOVED once the cause was confirmed and fixed** — a debug
string is not a place to leave something once it's done its job.
🚨 **TWO DISPOSABLE TEST ARTIFACTS WERE LEFT BEHIND FROM VERIFYING THIS LIVE, FLAGGED TO HER:** one throwaway
row in the Supabase `users` table and two subscribers in the "Style Star Signups" MailerLite group, all
under `claude-diag-test-...@example.invalid` addresses. Harmless (no real person's data), easy to find
and delete by searching "claude-diag-test", entirely optional to clean up.

### ✅ THE FITTING ROOM PLACEHOLDER — REBUILT WITH HER, ITERATIVELY, OVER SEVERAL ROUNDS
Her ask: improve the line art on the Fitting Room's no-photo placeholder (a small plain hanger alone in a
lot of empty tan). Iterated LIVE with rendered mockups at true card size rather than guessing once:
1. First round offered four directions (bigger hanger with a dress on it, a dashed "photo coming soon"
   frame, a closet rail with two garments, the current baseline). **She liked the frame+caption from one
   and the rod from another, but flagged the DRESS SHAPE as wrong** — a card can be a bag, a belt or
   trousers, so hanging a garment silhouette on a generic placeholder looks broken the moment the real
   item isn't a dress. ▶ **The lesson generalises: a placeholder that stands in for ANY item type must
   never imply a specific one.**
2. Second round dropped the garment entirely for three hangers + her gold star in the middle; she asked
   for just the ONE hanger, and for the star's outline to be silver instead of gold.
3. **FINAL, SHIPPED:** one plain hanger + her own star (gold gradient, `#9AA0A6` silver outline — the
   EXACT same colors already used on `.dc-corner-star`, the Edit page's jewel star, reused not invented)
   + a dashed "reserved space" frame + a "Photo coming soon" caption, all percentage-sized so it scales
   with the 2-up grid at any phone width.
🚨🚨 **HER CATCH, AND IT MATTERS: THE FIRST SHIPPED STAR WAS A HAND-DRAWN APPROXIMATION, NOT THE REAL
ONE.** She asked outright *"is that star the same dimensions and shape as the stars we use throughout
the app?"* — and it was not. The real mark (`_WL_STAR_PATH`, used 37 times elsewhere: Star of the Week,
the Edit's corner star, etc.) has its own specific, hand-tuned point geometry; the placeholder used a
similar-looking but genuinely different path. **FIXED to reference `_WL_STAR_PATH` directly** (not a
second copy of the coordinates), so it can never quietly drift from the real mark again.
▶ Verified against the real render at phone width (`scratchpad/fitroom.js`, 24/24 clean throughout every
round) and the CSS content-hash was restamped per the project's own rule for any `styles.css` edit.

### ▶ ONE MORE THING THIS SESSION SETTLED: THE 32KB PROMPT-CAP THEORY IS RULED OUT
Board row 18 (*"Couldn't load options right now"* on Shop your Style) named the 32KB prompt cap as the
remaining suspect, with the instruction *"measure it before claiming it."* ▶ **MEASURED: `scratchpad/
promptcap.mjs` passes clean, 10/10, with real headroom on every shopping surface** (Shop your Style, the
wantlist, Wardrobe Ideas) — the shrink ladder built for this in an earlier session is working. **A
20-ask live sweep against the real model also came back 100% clean** — every reply parsed as valid JSON.
🚨 **SO THE PROMPT CAP IS NOT THE CAUSE. The fault's real cause is still unknown** — this rules out the
one lead the board had, it does not solve it. Next session needs a fresh theory, not this one repeated.

### ▶▶ WHAT IS WAITING ON HER — her own priority order (full detail in the Master To-Do List above)
1. ⏳ The Oct 1 tax-receipt clock (~3 weeks out) — the only real deadline on her board.
2. ⭐⭐⭐ Apply to the affiliate programmes. CJ is free and still not done.
3. ⭐ More Edit/Finds pieces — she's on a roll and the machinery makes it cheap now.
4. ▶ Optional: clean up the two `claude-diag-test-...@example.invalid` artifacts in Supabase/MailerLite.
5. ▶ Optional: ask Supabase support how far back the 401 errors go, if she wants to know whether any
   real woman's save was silently lost during the outage.

### ▶▶ WHAT IS OPEN FOR CLAUDE
1. 🚨 "Couldn't load options right now" on Shop your Style — the prompt-cap theory is now RULED OUT (see
   above). Cause still genuinely unknown; needs a fresh live-diagnosis approach next time, not a repeat
   of the cap measurement.
2. 💰 A price filter — a find request carries item · colour · fabric · cut · size · width and no price
   field at all. When built, put `Try: tops under $100` and `Try: white jeans under $150` back verbatim.
3. ⭐ Wire her Style Signature into the finder (board row 11, her *"many of them were shapeless"*) —
   parked by her; hers to green-light, one thing at a time.
4. ▶ Read her analytics. `track()` exists and nobody has looked. Still worth doing.
5. ▶ A shared remembered cache — today's is per-browser. Must live server-only (Netlify Blobs), never
   through the publishable key.
6. ▶ Amazon's disclosure "I" vs "we"/"Style Star LLC" — flagged to her, not guessed at.
7. ▶ `affq.js`'s `EDIT_N` counter needs scoping to `#s-dream` — low priority, real debt.
🚨 **SERPAPI'S OUTAGE — RE-CHECK BEFORE ASSUMING IT'S OVER:**
`curl -s https://status.serpapi.com/api/v2/summary.json` — `Google: major_outage` means it isn't. **Still
showing `major_outage` as of this session.**

### 🎯 STANDING RULE FOR CLAUDE — NEVER ASK HER TO MAKE A GIT DECISION
Her words: *"Why are you asking me about putting something on main? I don't even know what that means.
I count on you to decide what needs to be saved or archived or put on main or the branch and all of
that. I need you to keep track of everything and be honest with me."* ▶ **Branch, commit, archive,
merge to `main` — all of it is Claude's to decide and do, then report in one plain line** ("saved and
live"). **The only thing that still goes to her is a PRODUCT decision** — what the app should do, what
a woman sees, what her words mean. ⚠️ **The second half of her sentence is load-bearing too: "keep
track of everything and be honest with me."** Deciding for her is not permission to be vague about what
was decided — say what was saved and where, in one line. *(See also "THE ARCHIVING RULE" below, which
this generalises — Claude's process, never hers to referee.)*

### ▶ TEST STATE — re-measured 2026-09-12 (fourth session)
`savetruth` 19/19 · `sharelink` 54/54 · `fitroom` 24/24 (run repeatedly through every placeholder
iteration) · `promptcap` 10/10 · `copy` 50/50 · both inline `<script>` blocks parse clean, checked after
every edit this session. New, session-specific tests written and passing: a token-adoption test (proves
a failed save no longer leaves a device believing it's synced) and an expired-token-vs-transient-failure
test for the wishlist share message. Not re-run this session, no code of theirs touched: `hubs` 49/49 ·
`mallverify` 14/14 · `findscsv` 50 · `findspage` 102 · `linkwatch` 27 · `tabtops` 49 · `catmark`
132/3-pre-existing · `wldoortest` 55/65-pre-existing · `curated` 62-63/65 (3 named pre-existing failures
— see the standing section below).

## 📌📌 STANDING REFERENCE — WHAT IS STILL TRUE (compacted from 2026-09-06 through 2026-09-11)
🚨 **THE SESSION BLOCKS BEHIND THIS SECTION WERE ARCHIVED IN WAVES AND NOTHING WAS DELETED** — they are
in `CLAUDE-archive.md` under *"ARCHIVED 2026-09-10"* and *"ARCHIVED 2026-09-11 (second session)"*, in
full, and git holds every version. The 2026-09-11 wave alone was **written straight into this section
without ever being compacted** and had pushed the whole file back to ~68,000 tokens — the same failure
mode this file was cut back from twice before, now fixed the same way both times.
▶▶ **EVERY PARAGRAPH WAS PUT THROUGH HER OWN TEST FIRST — *is this what HAPPENED, or is this what is
TRUE RIGHT NOW?*** Everything in the second category is rewritten below. **The blow-by-blow of how each
was found and built is in the archive; read it for how something came to be.**

### 🏬🏬 HER STORE ROSTER — **132 SHOPS**, HER LIST
🚨🚨 **THE LIST IS CLOSED. HER WORDS, 2026-09-08:** ***"the list i gave you is complete for now. I don't
want to add any more. Of course if we get more affilates approved, we will add them, but for now I don't
want to add any more stores."*** ▶▶ **SO DO NOT ASK HER FOR STORE NAMES, and do not re-propose the
~200 goal** — she reviewed the field herself and stopped. **THE ONLY TRIGGER FOR ADDING A SHOP IS AN
AFFILIATE APPROVAL.**
▶ **She reopened it once, on 2026-09-09, and only because Claude brought her EVIDENCE**: a gap list
built from sellers Google was already returning and discarding across 13 real searches. She picked ten
— **Gap Factory · Moda Operandi · Merlette · ViX Swimwear · ASTR the Label · Pact · PacSun · Tommy
Hilfiger · Aeropostale · FWRD**. ⚠️ **That is the ONLY way to bring her more shops: she chooses from
evidence, she does not do homework.** **Measured gain: 243 → 273 usable products across the same 13
searches, 47% → 53%.**
▶ **She also ruled ETSY back IN** (*"They are great for jewelry especially"*) and flagged **Saks OFF
5th as closed down**. **Kohl's and Zara are both IN and Zara carries her full scores.**
▶ **`docs/current-stores.txt` holds the live list.** **132 in `STORES`, 32 unscored, generated
allowlist in sync.**
⚠️ **AN UNSCORED SHOP IS FINDABLE, NOT RECOMMENDABLE** — it sits at the end of the store ranking and
the stylist will not describe it. **A shop needs a NAME and a SEARCH URL to be found. THAT IS ALL SHE
OWES.**
⚠️ **MANY SEARCH URLS ARE UNVERIFIED** (bot-walled, or results render client-side so a real term and
gibberish come back identical) and are marked `// ⚠️ url unverified`. **This does NOT affect whether
her products are found — the finder matches by DOMAIN.** It only shapes an outbound "find this at X"
link. **Fix one opportunistically from her address bar if a link lands wrong; do not ask her for
fifteen.** ⚠️ **AERIE AND AMERICAN EAGLE SHARE `ae.com` ON PURPOSE.**
⚠️ **SIX OF HER 107 CATALOG PICKS ARE DEACTIVATED because their shop is gone** (`p001` `p015` `p057`
`p064` `p089` `p104` — Madewell, COS, Marine Layer). **101 active.**

### ▶ THE PRODUCT FINDER — WHAT IS BUILT AND WHAT IT KNOWS
▶ **THE FILES:** `netlify/functions/product-find.js` (server, holds the key) · `netlify/functions/lib/
find-products.js` (the finder) · `netlify/functions/lib/store-domains.js` (**generated**) ·
`scripts/build-store-domains.js` · `scripts/lib/stores.js` (the ONE `STORES` reader) ·
`scratchpad/findprod.js` **63** · `scratchpad/chatfind.js` **63** · `scratchpad/ssfind.js` **96** ·
`scratchpad/findlive.js` (live bench).
⭐ **IT SERVES ALL THREE SHOPPING SURFACES** — the stylist chat, Shop your Style and the Wardrobe rows
— through the ONE `_findBlockHtml` builder, the ONE `_ssFindPaint` painter and the ONE `_findFetch`,
so there is exactly one `product-find` call site in the app. **A second card loop is how the `<<FIND>>`
marker leaked and how the two-row regression happened.**
⚠️ **THE FINDER FINDS; THE PAGE CHOOSES.** `find-products.js` holds NO copy of her brief and never
ranks for style. **`curatedPicks()` and `filterNeverWear()` remain the ONE picker** — adding her rules
to the finder would make it the fourth copy, which is the bug this project paid for four times in one
day.
**HER RULE IS STRUCTURAL: three verdicts, never two** — `CONFIRMED` · `REJECTED` · `UNKNOWN`, and
**UNKNOWN IS NEVER A PASS.** A product is an exact match only when every requirement she stated is
CONFIRMED. **Everything she KEEPS must be CONFIRMED; only what she RELEASED may be unknown.**
⚠️ **`size` AND `width` ARE DELIBERATELY SOFT, AND THIS IS NOT A LOOSENING — READ BEFORE "RESTORING"
IT.** Her saved size comes from her profile, not her sentence, and most retailer offers do not publish
size — so an UNKNOWN on size was demoting every dress and the app was honestly reporting nothing exact
about products that matched every word she typed. **An unknown on size/width no longer blocks
exactness; an unknown on anything SHE SAID still does, and a REJECTED on anything still does.**
**THE FOUR TRAPS, ENCODED AND PINNED BY TESTS BUILT ON REAL CAPTURED PRODUCTS:**
1. **A print is not a colour** — "Palace Tiger Pink" must never confirm blush.
2. **Satin is a weave, silk is a fibre** — `95% polyester` REJECTS silk outright.
3. **Faux-wrap is not a wrap** — and only the retailer's own title said so; Google's tidy title passed it.
4. **Wide calf is not wide width, and "W 7" is a women's 7** — an explicit non-wide width beats any
   marketing phrase. ⚠️ **One real DSW boot contradicted ITSELF** across its title and its variant.
**FIVE MEASURED CORRECTIONS THAT MUST NOT BE UNDONE:**
- **Queries are POOLED, never replaced.** Broadening CHANGES the pool rather than enlarging it — the
  broad query lost the DVF that the narrow one found.
- **Size and width stay OUT of the search words** (in the words scored **8/40** against **30/40**, by
  pushing Google toward eBay and Poshmark).
- **COLOUR, FABRIC and CUT must appear in HER OWN SENTENCE or they are dropped** (`_findKeepHerWords`,
  and it is **WORD-LEVEL** — `"fitted midi"` where only *midi* was hers becomes `"midi"`).
  **ITEM may still be inferred; SIZE/WIDTH come from her saved prefs.**
  🚨 **THIS IS A CODE RULE BECAUSE THE PROMPT RULE FAILED HER.** The prompt already said "never invent
  a requirement she did not give"; the model recommended a jewel tone, then searched for one as if she
  had asked. **A rule checked in code before it can reach a card is the fix. That is the Stitch Fix
  lesson.**
- **A REQUEST WITH AN ITEM ALWAYS PRODUCES AT LEAST ONE QUERY.** `buildQueries` once excluded the bare
  `women's <item>`, built ZERO queries, searched for nothing, and reported *"I could not find that in
  your shops"* — ▶ **the most convincing way possible to be wrong.**
- **`matchStore` ANCHORS ON LEADING TOKENS, NEVER ON A SHORTER LENGTH GUARD.** Its old `k.length > 4`
  rule silently threw away **thirteen** of her shops (Belk · Saks · Zara · Etsy · IZOD · NYDJ · Soma ·
  LOFT · Quay · ASOS · H&M · Gap · DSW) because Google almost never writes a bare name. ⚠️ **Dropping
  the guard to `>3` would let "saks" match INSIDE a name.** The longest prefix is tried first so
  *"Nordstrom Rack"* never resolves to Nordstrom. **Knowingly accepted: "Saks OFF 5TH" → Saks and "Gap
  Factory" → Gap.**
**HOW CHAT TRIGGERS IT:** the stylist emits ONE marker as the FIRST thing in her reply —
`<<FIND item=dress; colour=blush; fabric=silk; cut=wrap>>` — then answers normally. ▶▶ **FIRST ON
PURPOSE: the reply streams ~16-20s and a search takes ~5-8s, so firing on the marker runs them TOGETHER
and the wait is the LONGER of the two, never the sum.** ⚠️ **She never sees it** — stripped in
`addChatMsg`, the ONE choke point every bot bubble passes through.
⚠️ **`filterNeverWear` MUST BE HANDED HER WHOLE REQUEST** (`item + colour + fabric + cut`), not just
the noun. `_SEARCH_VETO` contains "wrap", so passing only `"dress"` made the app **silently delete
every wrap dress from her own answer to "blush silk WRAP dress."**
⚠️ **THE BROWSE WALL LANDS ON A STORE SEARCH FOR THE EXACT TITLE, NOT ON THE PRODUCT PAGE — AND THAT
IS HER APPROVED DESIGN, NOT A DOWNGRADE.** Her sketch was *spend a look-up when she taps*; she was told
why it was built differently and said ***"ok let's try this it sounds good, let's see how we like
it."*** **The verified cards keep their exact product links, and feed cards carry the product's own
url.** ⚠️ **iOS blocks a link opened after an `await` as a pop-up**, which is why a look-up-on-tap
would silently do nothing for some women. ▶ **If she ever wants the exact landing it is about four
lines.**
⚠️ **`?debug=1` ON THE URL** shows a panel BELOW the cards naming what was searched, searches fired,
products in her shops, look-ups spent, exact/near-miss/browse counts, timings and searches left.
**Read ONCE at boot** so there is nothing to leave switched on. ▶ **It has paid for itself twice**;
`search time` pinned exactly at the ceiling beside `products in your shops 0` is a HUNG request and
nothing else.
⚠️ **Caps: 4 searches + 6 product look-ups per request, 8 requests/minute per IP, 9-second per-call
ceiling, 30-minute warm-instance cache, plus a 24-hour per-browser cache.**

### 💰🚨 SERPAPI — HOW IT IS BUDGETED, AND WHAT MUST NEVER BE DONE TO IT
▶▶ **ONE SHOPPING QUESTION IS NOT ONE SEARCH.** It is up to **4 searches + 6 product look-ups = TEN
calls**, and SerpApi counts every one. **So a 250/month plan is really 25–60 shopping questions a
month, across all users.**
▶ **THE STANDING RULE THAT CAME OUT OF THAT: BUILD AGAINST CAPTURED FIXTURES, NEVER HER LIVE
ALLOWANCE.** `scratchpad/findprod.js` works this way — real product data captured once, tested forever,
no network. **~141 of her searches were burned in one afternoon of testing against the live endpoint.**
✅ **THE SEATBELT IS BUILT:** the finder asks SerpApi how many searches remain **before spending one**
(the account endpoint is free and exact) and stops with `why:'budget'` below `SERPAPI_RESERVE`
(default **20**, settable in Netlify). ⚠️ **It fails OPEN on purpose** — refusing to shop because a
diagnostic call broke would take the feature down to protect a budget.
⚠️⚠️ **DO NOT RAISE THE PER-CALL CEILING.** It was 10s, raised to 20s on the reasoning that successes
land at 6.6–8.7s — **and the next failure pinned at exactly `20001ms`.** ▶ **A request pinned to the
millisecond on the ceiling is HUNG, not slow, and a bigger ceiling only makes a woman wait longer for
the same honest sentence.** **It sits at 9s today, chosen from real successes.**
⚠️ **A MEASUREMENT FROM THIS SANDBOX IS NOT EVIDENCE ABOUT THE OUTSIDE WORLD UNTIL IT REPEATS.** The
sandbox cannot reach retail sites at all, and its own egress proxy drops connections; a single timeout
from it proves nothing. **Her Netlify function is the only instrument that measures her app.**
▶ **THE RUNNER-UP IF SERPAPI DISAPPOINTS: SearchApi — same $25, ~10× the searches.** ⚠️ **SerpApi's
legal shield does NOT cover the $25/$75 tiers — confirm that with them before paying.** ▶ **The
litigation: Google sued SerpApi; in July 2026 the court GRANTED SerpApi's motion to dismiss. Product
listings are facts — the strongest side of a ruling that already went against Google.** **Mitigation:
keep the integration behind ONE small swappable piece.**
🔒 **`SERPAPI_KEY` is set in Netlify. If she regenerates it, Netlify must be updated or the app quietly
loses its product cards — no error, just advice.**

### ▶▶ THE AGREED SHOPPING EXPERIENCE — **CLAUDE'S SUMMARY OF A FLOW SHE APPROVED. NOT HER WORDS.**
🚨🚨 **THIS USED TO BE HEADED "IN HER WORDS" AND THAT WAS FALSE. Corrected 2026-09-08 when she read
step 4 and said: *"this is not my voice. I did not say this."* She was right** — not one of the six
steps carries this file's marker for her words, while everything genuinely hers below does. ⚠️ **AND
THE DAMAGE WAS REAL: it was quoted back to her as evidence that SHE had been clear, when it was Claude
quoting Claude.** ▶ **APPROVAL IS REAL AND STILL STANDS. It is the AUTHORSHIP that was misstated —
never call these her words again.**
1. The AI reads her sentence into a checklist (item · colour · material · size · width). **It invents nothing.**
2. **The service FINDS** real products.
3. **Her store allowlist throws away everything else** — it already excludes fast fashion, rentals and
   subscription boxes, because those were never in the table.
4. **Each product is CHECKED against the checklist — comparing facts, never guessing.** No tick without evidence.
5. **`curatedPicks()` runs — the SAME picker**, never a copy.
6. **Her sliders and her store dimensions order the results.**
🚨 **NOTE WHAT THAT MEANS: her rule says never CLAIM a requirement is verified unless it can be. IT
SAYS NOTHING ABOUT HOW TO VERIFY.** The mechanism was always Claude's choice — so the 8-word `CUT`
lookup table was Claude's error alone, and flagging the fork was Claude's job alone.

**🚨🚨 HER RULES INSIDE IT, ALL VERBATIM AND ALL STILL LOAD-BEARING:**
▶ **A THIN RESULT SET.** Offered "show the one", "pad the screen" or "show the one and offer to widen",
she chose the third: ***"If there is only one true match, I would rather confidently show her the one
true match than fill the screen with things that aren't what she asked for. Then I would offer to widen
the search."***
▶▶ **AND THE PART SHE ADDED, WHICH IS BETTER THAN ANYTHING OFFERED: THE WOMAN CHOOSES *WHICH
REQUIREMENT* TO RELEASE, ONE AT A TIME.** ***"maybe she wants to keep silk but is open to another shade
of pink, or maybe blush matters most and she is open to satin. That feels much more like how I would
work with a client."*** ⚠️ **So "widen" is not one button, and the app never decides for her which of
her own words mattered least.**
▶ **WHEN A REQUIREMENT CANNOT BE VERIFIED — not hide it, not show it silently (THAT IS THE SHIFT-DRESS
BOX) — show it, labelled honestly, confirmed ones first.** Her stylist voice: *"These three I can
confirm in your width. These two are worth a call to check."*
🚨 **HER RULE, VERBATIM: *never imply that a specific size, width, colour, material or other requirement
is confirmed unless we can actually verify it.*** ⚠️ **She gave it while NOTHING was built** — for once
a rule existed before the picker it governs.
▶ **WHAT CHAT SAYS WHEN IT FINDS NOTHING — HER CALL, and the second sentence is standing:** ***"If
Style Star genuinely looked and there is nothing that meets her requirements, I want it to tell her that
clearly and then help her widen the search. I do not want it falling back to an invented product or
making a generic store search look like something Style Star actually found."*** And: ***"I would
rather show nothing exact than recommend something that isn't what she asked for."*** Her own copy:
***"I couldn't find an exact match today. Would you like me to keep the blush and look at satin, or
keep the silk and look at other shades of pink?"*** Her framing: ***"I don't think finding nothing
exact is a failure if we handle it like a good stylist would."***
🚨🚨 **THIS CHANGED THE APP'S DOCUMENTED FLOOR, ON CHAT ONLY, AND IT IS DELIBERATE. READ BEFORE
"RESTORING" ANYTHING.** Tier 3 — the AI names a plausible piece and opens a store SEARCH — **is removed
in chat and replaced with honesty. Wardrobe Ideas and Shop your Style keep it.** A future session
finding "chat sometimes returns no products" must NOT treat it as a regression.
▶ **HOW A NEAR MISS IS SHOWN — HER SENTENCE, VERBATIM, AND IT BEAT ALL FIVE DRAFTED FOR HER:**
***"I couldn't find exactly what you asked for. This is the closest I could come up with."***
⚠️ **DO NOT PARAPHRASE IT BLANDER AND DO NOT RE-ADD A QUESTION TO IT.** ⭐ **WHY IT IS BETTER, and it
generalises: IT STATES THE TRUTH AND STOPS.**
▶ **AND SHOW THE CLOSEST, DO NOT ASK FIRST — her call:** *"simplify with the closest thing and just let
her know. Simplest answer."* ▶▶ **SHOWING DOES NOT TAKE HER CHOICE AWAY; ASKING WOULD HAVE DELAYED IT**
— it makes her commit to a trade-off before she has seen a single dress, and it costs a second search.
⚠️⚠️ **THE ONE THING THAT MUST HOLD: THE GROUP LABELS.** *"Right colour"* over one set, *"Right fabric
and style"* over another. **If those are dropped or blurred it really does become the app choosing for
her.** ▶ **They appear only when there is more than one group** — one group is nothing to choose
between; two are.
▶ **WHEN CHAT SEARCHES — the stylist JUDGES it, not a button and not a keyword.** ***"I want the
conversation to feel natural, like she is talking to a personal stylist, not operating a shopping
search tool."*** **The case she named:** *"I have a wedding in Napa in October and nothing to wear"*
MUST trigger a search. ⚠️ **And her limit, which is the harder half:** ***"I don't want it searching
just because a product or shopping topic comes up in conversation. It should search when finding real
products is actually NEEDED TO ANSWER what she is asking."*** ▶ **The trigger is NEED, not TOPIC.**
▶ **HOW THE WAIT FEELS — she combined two options into a better one: a warm reply FIRST, a quiet status
line underneath while it works, cards below.** ***"when there is a long time to wait she could think
broken and click out, if she gets a reassurance the search is on, that is much better than just looking
at the screen, I also like the conversational approach of B."*** ⭐ **THE STATUS LINE IS IN HER VOICE,
NOT THE MACHINE'S** — because it tells a woman something no competitor can say: she is watching a
stylist do what a stylist would do. **THE WAIT BECOMES THE PROOF.**
⚠️ **THREE THINGS THAT TURN IT INTO A LOADING SCREEN: (a) the line must REPLACE ITSELF, never stack ·
(b) NOTHING MAY JUMP — cards appear BELOW what she is reading · (c) if the answer is fast the line must
NOT APPEAR AT ALL rather than flash.**
▶ **COST — HER STANCE, RECORDED SO IT IS NOT RE-LITIGATED:** ***"The cost difference does not change my
answer right now. I would rather make the experience excellent first and then understand and control
the cost once we see how women actually use it."*** ▶ **HER CORRECTION 2026-09-08:** ***"at this point
my focus is on making the app as good as it can be, not adding resistance."*** ⚠️⚠️ **SO: WARN, NEVER
BLOCK.** 🚨 **A phrase Claude coined — *"the cap is the seatbelt"* — was quoted back to her twice as
hers and used to justify a cap she never asked for. Only her actual words go in triple-asterisk
italics.**
✅ **THE AFFILIATE TIE-BREAK — ASKED AND ANSWERED: "A", NO EXCEPTION. The app NEVER knows which shops
pay her. Fit and price decide, full stop — even when two options are exactly equally good.** ⚠️ **CLOSED.
Do not re-open it, and do not propose a "tie-break only" softening later — that WAS the option offered
and she declined it.** ▶ **The argument generalises: a tie-break's failure mode is SILENT. No test can
prove a tie was genuine.** 💰 **She was told plainly she will earn less than she could, and chose it.**

### ⭐⭐⭐ HER DECISION: SHOW HER LOTS TO SCROLL THROUGH — BROWSING IS THE POINT
▶▶ ***"yes yes yes the more options she can browse, the better, even if they're not all perfect
matches, even if they are close, if she can scroll through a lot of visuals, that makes it more fun."***
⭐⭐ **AND THE FOUNDER PRINCIPLE UNDERNEATH IT, WHICH REFRAMES THE WHOLE FEATURE:** ***"a stylist loves
to show the client as many options as possible. This is what is great about online shopping. You can
browse sooo many more options than live shopping or than a stylist can physically present to her so the
big browse (even if not a perfect search) is fun, easy and clients love eye candy of swiping photos and
seeing more."***
▶▶ **SO "NOT A PERFECT MATCH" IS NOT A FAILURE ON THIS SURFACE — IT IS THE POINT.** This is the answer
to every future instinct to trim, cap or tidy the row. ⚠️ **It does NOT loosen her honesty rule: it
governs how MANY she sees, never what the app CLAIMS.**
🚨 **NO STORE CAP ON THE PRODUCT ROW — HER EXPLICIT DECISION, and Claude nearly built one by
misreading her:** ***"I don't mind if multiple cards for one store show up. For example if I ask for a
red dress and there are 5 of them at Bloomingdale's I want to see all 5 of them, plus 5 more from
Nordstrom plus whatever mytheresa or Marissa or farm Rio has too. I want to show as many cards for her
to swipe as possible. Not limited."*** ⚠️ **The max-two rule still stands in the Wardrobe compare
carousel and `_shopRules`. This is a recorded EXCEPTION, not a reversal.** ⚠️ **Separate the two things:
the same STORE twice is her design; the same DRESS twice is noise.**
✅✅ **AND IT IS AFFORDABLE, WHICH IS WHY IT CHANGES THE BUILD.** A **search** (~2.5¢) returns up to 60
products already carrying title, store, price and photo; a **look-up** (~2.5¢) checks ONE product and
is what earns a tick — and is **the only way to get a link that reaches the shop and can earn** (every
raw search link points at `google.com/search`). ▶▶ **MORE CARDS: FREE. MORE SEARCHES: 2.5¢ EACH. A
TICK: 2.5¢ EACH.**
⭐ **THE DESIGN THAT FALLS OUT AND IS STILL NOT BUILT: RENDER MANY, LOOK UP LAZILY.** Today the app
spends 6 look-ups every time whether she taps anything or not. **Render a wide row from the one search,
verify the top few, spend a look-up only on pieces she actually reaches for.** 💰 **At 1000 users, 10
searches per question is −$132/month and 4 is +$18/month.** ▶ **More options AND fewer searches — the
two goals point the same way, which is rare enough to write down.**
▶ **THE OTHER UNSTARTED LEVER, HERS TO SAY YES TO: her belted-dress question fired only 1 of the 4
searches `MAX_QUERIES` allows.** Three or four would multiply the pool for about 5-7¢ a question.

### ▶ HER TWELVE SLIDER POSITIONS — ⚠️ **NEVER ARCHIVE THIS**
✅ **Recorded 2026-09-08 from her own Style Signature screenshot, read off the pixels, not estimated:**
the track spans x=368..1040 and **every one of the twelve knobs lands within 0.025 of a whole stop.**
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
▶ **Her derived matching profile, through the app's own `_herDims()`: alluring 6.40 · trendy 0.70 ·
dressy 0.60 · fitted 0.70 · color 0.60.** ⭐ **THIS IS THE PROFILE TO MEASURE ANY STORE RANKING
AGAINST.** ⚠️ **It is a fact she supplied, not a build that happened, and it was asked for twice before
because nobody wrote it down. Re-ask only if she says she has retaken the quiz.**

### ⭐⭐ STAR OF THE WEEK — HOW IT WORKS
🚨 **HER RULE, 2026-09-11: *"star of the week is only for items we have photos of."*** Two tables, not
the same thing: `WEEK_STARS` (34 entries) is the LIBRARY — being there does nothing on its own.
`WEEK_STAR_PHOTO_ORDER` (15 names) is the WHITELIST, and the only thing that rotates. A photo is only
ours to show when `_affMid()` resolves — an affiliate approval with that retailer licenses it, never the
fact that the image is fetchable. ⚠️⚠️ **SO THE STAR CAN ONLY EVER SHOW PIECES FROM HER NINE APPROVED
SHOPS, ALL LUXURY — that is why every Star is $45+, and no curation changes it.** 19 of the 34 have no
photo and can never rotate today.
🚨🚨 **THE TRAP: THE PLAY ORDER IS NOT LIST ORDER.** The star is
`pool[floor(days-since-anchor/7) mod pool.length]` — the array is ROTATED relative to what a woman sees,
so entries at the top are reached LAST, after the wrap. **"Append at the end" is NOT safe** — it can shove
earlier entries weeks later (caught only by computing the whole schedule before and after committing).
**The list's LENGTH is the modulus**, so adding or removing even one piece re-maps every week.
⚠️⚠️ **NEVER EDIT THIS LIST WITHOUT RE-RUNNING THE SCHEDULE, WEEK BY WEEK.** The anchor (`2026-08-09`) is
load-bearing; reorder the list instead of moving it. ⭐ **Use the instrument, not hand math:** call the
app's own `_weekStar(date)` in Playwright for each Sunday.
▶ **THE LIVE SCHEDULE AS OF 2026-09-11 — 15 weeks, then repeats from 20 Dec** (re-measure rather than
trusting this — every list edit moves it):
| Sun | Piece | Store | Price |
|---|---|---|---|
| Sep 6 | Saint Laurent SL M136 Sunglasses | COUTR | $363 |
| Sep 13 | Vilebrequin Long Mesh Cover-Up Dress | Vilebrequin | $405 |
| Sep 20 | Veronica Beard Crosbie Jean | Marissa Collections | $248 |
| Sep 27 | Simkhai Stella Suede Block Heel Sandal | Olivela | $445 |
| Oct 4 | Isabella Celini Stackable Love Bracelet | Etsy | ~$50 |
| Oct 11 | Love Hearts Find Me Pendant Necklace | Jane Win · Olivela | $278 |
| Oct 18 | DVF Jeanne Silk Jersey Wrap Dress | Diane von Furstenberg | $678 |
| Oct 25 | Valentino Garavani Rockstud Medium Suede Pouch | Mytheresa | $790 |
| Nov 1 | Gucci GG Canvas Mini Shoulder Bag | Mytheresa | $1,100 |
| Nov 8 | Simkhai Devon Suede Tote | Olivela | $695 |
| Nov 15 | Fleur du Mal Sculpt Molded Sports Bra | Fleur du Mal | $98 |
| Nov 22 | Zoe Lev Diamond & 14k Gold Bezel Pendant Necklace | Olivela | $825 |
| Nov 29 | Valentino Garavani VLOGO Reversible Belt | Mytheresa | $570 |
| Dec 6 | Open Heart Necklace | Etsy | ~$45 |
| Dec 13 | Valentino Square Oversized Sunglasses | Marissa Collections | $465 |
▶ **Retired-not-deleted, both deliberate:** the sold-out Serpui bag and the FARM Rio maxi (a TIMING call
about one dress, not a rule about FARM Rio) — both keep their `WEEK_STARS` entries because each carries
a `pxPos` crop `starpx` uses as a worked example. ⚠️ **The Star queue is NOT a mirror of the Edit** — a
piece removed from the Edit (the bangles, the Soncino, the Good American jeans) stays in the Star
library. Photo-gated, not Edit-gated.

### 🎨 THE FINDS PAGE — HER SETTLED DESIGN, AND WHY
The Finds page shares the Edit's own frame (`dream-mirror` toggle, not a copy), hides the shared logo,
and its two hearts tilt toward each other. 🚨 **HER COLOUR: the lightest tan, `#ECBD83`** (Amazon's own
header colour) as the page **BLEED ONLY** — the separation from the card comes from the card's own black
8px frame and silver inset, never from the bleed depth, so it may never be darkened.
🚨🚨 **THERE IS NO TAN ACCENT — CLOSED BY HER.** A tan accent set (tagline, rule, bag, invitation) was
built and shown to her; she ruled it off: *"I think I want HAND SELECTED BY CATHERINE to be in the same
teal color as it is written on the edit page."* ▶▶ **EVERYTHING INSIDE THE FRAME IS THE EDIT'S, BYTE FOR
BYTE** — teal tagline, gold rule, teal bag, teal invitation, all deleted as per-page overrides rather than
recoloured, so the day she changes the Edit's teal this page follows on its own. **Do not re-add a
per-page accent.** ⚠️ **The tan is a background and may never be text — 1.73:1 on white, well under the
4.5:1 floor.**
⚠️ **NO LINEN BACKGROUND ON THIS PAGE ONLY** (her ask — *"take out the background linen... make the whole
page all white"*). The linen is painted by the SHELL (`.ss.dream-mirror`), not the screen, which is why
"make the screen white" alone couldn't touch it; it's overridden via the `finds-velvet` html class,
scoped so the Edit keeps its linen untouched (she said "this page," not "everywhere").
⚠️ **Category headings are 16px** (were 11.5px — a real hierarchy inversion she caught: smaller than her
own note text), with RELATIONAL spacing, never a fixed pixel value — 38px after a card, 20px after the
first heading (which follows the disclosure and has nothing to separate from).
⚠️ **Footer links use TALL tap targets (13px block padding) instead of more gap between them** — two
slim strips with a gap between is a miss-zone, not a bigger target; the padding IS the target.
⚠️ **Each page's closing invitation names the OTHER page** (never itself — a copy-paste risk, asserted
crosswise) in the app's pink `#EC4899` (Edit→Finds; 3.53:1, an improvement on the teal it replaced at
2.94:1, both bold+underlined); the trending link on both stays teal. The invitation is a structural
`display:block` (not dependent on how long the link text happens to be) — selector must be
`.dc-xlink>span`, never `.dc-xlink span` (the nested `.nb` weld breaks otherwise), and the child needs its
own `text-wrap:wrap` since `balance` inherits from the parent sentence.
⚠️ **Both curated subtitles keep a period before the closing heart** ("...I hope you'll love them too.
♥" / "...I hope you love these great finds... ♥") — her deliberate, narrow exception to the app's usual
"no period before a heart" pattern, scoped to exactly those two lines. Don't unify them with the other
nine hearts in the app.
⚠️ **A text widow (the heart orphaning alone) is fixed with `text-wrap:balance` + an `.nb` weld — never
by shortening her copy.** Both curated subtitles carry both, since either could orphan.
🚨🚨 **A CSS CHANGE CAN REACH A RETURNING BROWSER A DAY LATE WITH NO ERROR, EVEN WITH CORRECT
CACHE-CONTROL HEADERS AND NO SERVICE WORKER** — a browser can hold an in-memory copy of the old
stylesheet regardless. The fix is a content-hash query string: `/styles.css?v=<sha256 prefix>`
(`scripts/css-version.js --write`, restamp after every CSS edit — `copy.js` fails on a stale stamp).
✅ **Indexing: requesting it is one-time per page** — both engines re-crawl on their own after that, and
she never needs to resubmit for a content change. **`<lastmod>` in the sitemap is the forever half and
is Claude's job** (`scripts/sitemap-lastmod.js --write` after any edit to `/edit`, `/finds` or
`/trending` — hashes content only, never styling; a first run with no baseline SEEDS, it never stamps,
to avoid lying to a crawler about an unchanged page).
✅ **Menu entry: one row in the Shop group beneath the Edit, calling `openFinds()`** — never a bare
`show('s-finds')`, the same affiliate-wrap trap as `/edit`.
⚠️ **TWO HARNESS LESSONS FROM BUILDING THIS PAGE, BOTH GENERALISE:** a render that injects CSS overrides
on top of the real stylesheet is not a render of the real app — delete any `addStyleTag` override before
photographing the real thing; and a deploy check that greps for a colour value can pass on an old
comment that happens to name the same hex — grep the RULE (the selector plus its declaration), never
the bare value.

### 🛒 HIGH/LOW — HER OWN WORRY, ANSWERED BY MEASUREMENT
Her worry: mixing high and low without the app reading as a discount platform. She proposed a third,
splurge-only page and doubted it herself. ✅ **Measurement settled it: her Edit is ALREADY a high/low
mix** (roughly a third under $100, a third $100–299, a third $300+ at every count so far) — **no third
page was needed**, and building one would have split her best page and given her a third thing to
maintain. 🚨 **HER OWN LINE, ON BOTH PAGES, EACH POINTING AT THE OTHER — NEVER REWORD IT:**
***"Mixing high and low is how I dress my clients — here's the other half."***

### 🛒 AMAZON — WHAT CAN AND CANNOT BE DONE FROM HERE
- ⚠️ **Amazon product pages are bot-walled — price and stock can never be verified from this session.**
  Always say so plainly on an Amazon piece; her figure is the only source (same bucket as lululemon and
  Target). The Saturday watchdog files an Amazon piece as NEEDS HER EYE, never BROKEN, by design.
- ▶ **Canonicalise every link to `https://www.amazon.com/dp/<ASIN>`** — strip `ref=` (pure tracking off
  her orders page); keep `th=`/`psc=` only when she deliberately pinned a colourway.
- 🚨🚨 **NO AMAZON PRODUCT PHOTOS, EVER, EVEN AFTER APPROVAL.** The Product Advertising API that licenses
  them is itself gated behind her first 3 qualifying sales, so the permission arrives AFTER selling, not
  before — hotlinking one now would risk her whole Associates account. Her rule: *"Photos on Finds will
  be my own, or none."* `ownPx` (her own photography of a piece she owns) is the one open door.
- ✅ **`/finds` prices round UP, never to the nearest** (`Math.ceil`, printed with a tilde — `~$17`) —
  a cheaper surprise is recoverable, a dearer one is not (her 2026-07-31 sale-price rule, one step out).
  A trailing qualifier survives rounding ("$9.99 for 4" → "~$10 for 4"). Exact price stays in
  `data-price`. **The Edit keeps exact prices — its shops CAN be read. Do not unify the two pages; the
  difference is a truth difference, not a style one.**
- ✅ **No colour in ANY Finds name** (widened by her from 3 pieces to the whole page), unless the colour
  IS the piece's identity rather than a colourway it happens to ship in — and if a name drops its
  colour, the note must say so ("comes in gold or silver") so nobody arrives to an unexpected variant.
- ▶ **No dashes in Finds copy unless grammatically needed** — her rule, deliberately left untested; it's
  a judgement call (`2-in-1`, `Non-Slip` etc. are all correct), never a regex, and her own copy is never
  rewritten to satisfy it.
- ▶ **A pack goes in the name** ("Ponytail Cuff, 4 Pack"); **a brand goes in the store column**
  ("CRZ YOGA · Amazon") — both measured off her own existing page (3-of-4 and 10-of-11 already did it
  that way), not invented conventions.
- ✅✅ **SHE IS APPROVED (CONDITIONAL) — 2026-09-12. `_AMZ_TAG='stylestar01-20'`, live everywhere.**
  Every Amazon link in the app now tags itself at runtime through the one `_affUrl` branch — the Finds
  page, the Mall, and any Amazon result the live finder surfaces on chat, Shop your Style, Wardrobe
  Ideas or Complete the Look. ⚠️ **She has 180 days from approval for 3 qualifying sales, and only
  TAGGED clicks count** — this edit is what actually starts the clock earning.
  ⚠️ **"CONDITIONAL" MEANS BOUND BY THE OPERATING AGREEMENT** — she flagged this herself; if that
  status ever changes (revoked, or moves to unconditional), it belongs here, live operational status.
  ✅ **Amazon's required sentence, her exact wording, is now on every screen an Amazon link can
  reach** — *"As an Amazon Associate, I earn from qualifying purchases."* (note the comma — this is
  HER wording, not the placeholder that used to sit in this comment).
  ✅ **DISCLOSURE PRESENTATION, SETTLED 2026-09-12 AFTER SHE CALLED THE COMBINED WORDING "CRINGY"
  ON `/finds`.** Her words: *"is there way to make the disclosures look and sound less cringy?"*
  Neither sentence's WORDING changed (Amazon's is contractual, the generic one is her own settled
  copy) — only presentation and placement moved. **`/finds`** drops the generic "Some links may earn a
  commission." line entirely — the whole page is Amazon links, so Amazon's own sentence alone covers
  it; `.dc-disclosure` there reads only *"As an Amazon Associate, I earn from qualifying purchases."*
  **The Mall** moved Amazon's sentence OFF the page-top blanket notice (which wrongly implied all 25
  stores are an Amazon relationship) DOWN to sit under the **"Value & Basics"** category heading — the
  one category with an Amazon card (new `.mall-az` div, injected in `renderMall()` only when
  `group.cat==='Value & Basics'`); the page-top notice reverts to the generic line only. ⚠️ **If a
  second Amazon-tagged store ever lands in a different category, that check needs a second home too.**
  **Everywhere both sentences still apply** (both Shop your Style `shopdisc` locations, Complete the
  Look, the Shop your Style/wishlist screen, chat, both Wardrobe tabs, the Wishlist page) they render on
  **separate lines** via a new `.disc-az{display:block;margin-top:3px}` span, so two facts read as two
  facts rather than one sentence restating itself.
  ⚠️ **SHE ALSO ASKED WHETHER "I" COULD BECOME "we" OR "Style Star LLC" — LEFT AS "I", DELIBERATELY,
  PENDING CONFIRMATION.** No authoritative source found on whether a first-person swap satisfies
  Amazon's required-wording rule, and she is bound by the Operating Agreement now. **Not guessed at;
  flagged to her as a real open question if she wants to pursue confirming it with Amazon directly.**
  ⚠️ **NOT on the Edit** — it carries zero Amazon links today (both moved to `/finds` 2026-09-11); add
  the sentence the day one returns. ⚠️ **NOT on the Star of the Week `.wks-disc`** either, for the same
  reason — no Amazon piece is in `WEEK_STAR_PHOTO_ORDER` today.
  ▶ **The Finds page is the SEVENTH disclosure location**; counting Mall, both Wardrobe tabs and the
  Wishlist too, Amazon's sentence lives on eleven screens — identical everywhere except Finds (alone)
  and the Mall (both sentences, two different places on the page).
  🚨 **THREE WRAP/CENTRE BUGS HER OWN SCREENSHOTS CAUGHT THE SAME DAY, ALL FIXED AND VERIFIED WITH REAL
  RENDERS AT 390/375/360/320px — full measurements are in `CLAUDE-archive.md`:**
  1. **"purchases" wrapped alone onto a second line on Shop your Style and the Wishlist** (her words:
     *"I prefer how it looks on wardrobe list where it all stays on one line"*) — and, found while
     checking every location, on chat too. All three sit inside a 28px side-padding frame that
     Wardrobe's own screen doesn't fight (it already bleeds its own `.scr` into that padding for
     unrelated reasons). Fixed: `.disc-az` on those three now carries a matching `-28px` margin,
     recovering that padding for just the disclosure line — verified to match Wardrobe's own behavior
     exactly, wrapping only at the extreme 320px width as Wardrobe does too.
  2. **That fix's side effect: Shop your Style's disclosure text shifted off-centre.** Cause: CSS's
     over-constrained-margin rule — `#s-shopstyle .ss-disc-top` still inherited `max-width:320px`, and
     with BOTH margins explicitly `-28px` (neither `auto`), the browser silently recalculated
     `margin-right` to force the fit, shifting the whole box left (measured: centre landed at 183px in
     a 390px frame whose true centre is 195px). Fixed with `max-width:none` on that one selector —
     verified centred exactly (195px) at 390 and 360px.
  3. **A second, separately-missed wrap: `/finds`'s own standalone `.dc-disclosure`** — the fix above
     only touched `.disc-az`, a span used where BOTH sentences appear; `/finds` shows Amazon's sentence
     alone with no span, so it was never in scope. Fixed with its own `-36px` margin (an extra 8px
     `.dc-wrap` layer sits on top of `.inner`'s own 28px, so it needs both), scoped to `#s-finds` only —
     the Edit's own longer paragraph shares the base selector and is supposed to wrap. Verified one line
     at all four widths.
  ▶ **THE SHOP YOUR STYLE WAITING STAR, HER ASK, TWO ROUNDS — final CSS: `.ss-find-wait{justify-
  content:flex-start;gap:68px}` plus `margin-top:65px` on `.ss-find-star`.** She wanted the star centred
  between the disclosure and the "Checking what's actually in stock..." caption below it (its horizontal
  centring was already correct, measured, no change needed there). ⚠️ **HER CORRECTION, KEPT GENERAL:
  when two elements are out of balance, the one she's always seen in one spot should anchor — the one
  that's wrong is the one that moves.** Round 1 (`justify-content:flex-start` alone) balanced the gap
  mathematically but did it by pulling the CAPTION up from where it always sat; she caught it —
  *"put the bottom phrase back where it was before and bring the star down. Instead of bringing the
  words up."* Round 2 measured the true midpoint (star's spin animation frozen first, since a live CSS
  transform otherwise inflates `getBoundingClientRect`) and built it as `margin-top:65px` on the star
  plus `gap:68px` on the container — the caption lands back within half a pixel of its original spot
  while the star sits at the true midpoint, 68px clear on both sides. Full numbers in the archive.
- ▶ **Amazon's trademark rules** (read from their own guidelines): a descriptive heading like "Amazon
  Finds" is fine; their marks may never appear in a domain/subdomain (a second reason the path is
  `/finds`); displaying their LOGO triggers a further attribution requirement — so the page uses only
  the word and her own gold star, never their logo.

### 📦 BATCH-ADDING FINDS PIECES — `data/amazon-finds.csv` is the source of truth
```
node scripts/finds-from-csv.js data/amazon-finds.csv          # dry run
node scripts/finds-from-csv.js data/amazon-finds.csv --write  # applies it
node scripts/finds-from-csv.js --check                        # does the page still match the CSV?
```
Columns: `name,store,price,note,url,category` (url takes a full Amazon link or a bare 10-char ASIN,
canonicalised automatically; a non-Amazon link is refused). Category is optional — empty everywhere means
the flat page with no headings; her row order is the page order, and a category first appears where it
lands. Removals are blocked by default (`--allow-removals` to override) so a spreadsheet missing rows
can't silently delete her page. ⚠️ **Pieces are matched by ASIN, never by name** — a rename prints as
`~ old → new` and needs no override, because the ASIN is the piece and the name is a label she edits.
Restamp the sitemap after every batch (`node scripts/sitemap-lastmod.js --write`).
🚨🚨 **EVERY `.dc-*` ANCHOR IS NOW AMBIGUOUS BETWEEN THE EDIT AND FINDS SCREENS.** Always slice by screen
id (`s-dream` / `s-finds`) before searching for one — the importer, `linkwatch` and the watchdog have all
already been bitten by matching the WHOLE file and filing Finds pieces under "the Edit."

### 🚨 `.dc-sign` NOW EXISTS ON TWO PAGES — same trap as above, generalised
Anything anchored on `<div class="dc-sign">With love, Catherine` finds the EDIT'S copy first, because
that's the first occurrence in the file. Slice the screen first (`index('id="s-finds"')` to
`index('id="s-shop"')`), then anchor inside that range. **After any curated-page edit, print BOTH
screens' item counts before doing anything else** — the cheapest habit that catches this every time.

### 💰 WHICH EDIT PIECES EARN
Measured 2026-09-10 at 35 items (17 earning, 18 not) and again after moves to 33 — **the Edit is now 30,
so both counts are stale; re-measure rather than quoting them.** What's still true regardless of count:
**`_wlDecorateEdit()` rewrites every `.dc-item-btn` href to an affiliate link AT RUNTIME**
(`index.html:9963`) — the raw hrefs sitting in markup are the SOURCE, not the live link, so a `grep` for
`_affUrl` in the Edit's markup finding zero proves nothing is broken. ⚠️ **Never hard-code affiliate URLs
into the Edit's markup** — it would strand saved wishlist rows on a stale affiliate id and break her
add-by-hand workflow. Nordstrom (declined for Impact/traffic) and Amazon (no `_AMZ_TAG` yet) are the two
biggest earning-nothing blocks; both light up the moment their approval lands, on pieces already chosen.

### 🚨 ADDING A MERCHANT IS **FIVE** EDITS — and two of them fail SILENTLY
**(1)** the `STORES` entry, `index.html` — **the only one that needs her** ·
**(2)** `_AFF_MID`, `index.html` — the domain → MID map, or nothing earns ·
**(3)** `MID_TO_STORE`, `scripts/rakuten_feed.py` ·
**(4)** `BUILD_MIDS`, same file, or the nightly feed never ingests it ·
**(5)** ⚠️ **`netlify/functions/lib/store-domains.js` — GENERATED. Run `node
scripts/build-store-domains.js`.** This is the finder's allowlist; miss it and the finder cannot see
inside the shop she was just approved for. **`--check` fails if it is stale. Run it.**
▶ **A SIXTH EDIT WAS RETIRED: `SEARCH_DOMAINS` in `style-ai.js` is now DERIVED from the same generated
file** — it went stale twice in one day when it was hand-typed. ⚠️ **Keep it derived, and do not re-add
a search tool to the stylist to give it a job.**
▶▶ **BOTH SILENT MISSES WERE CAUGHT BY DERIVED TESTS AND BY NOTHING ELSE.** On screen everything looked
perfectly normal — a shop in her table that quietly could not be searched.
▶ **`scripts/store-draft.js` DRAFTS a new store's tags from neighbours she already scored; she
corrects. It never writes.** Her standing ask: *"I want to be able to get approved for more affiliates
and be able to add them without having to go through all."* ⚠️ **A draft she approves is not an
invention — the Garnet Hill lesson was about inventing SILENTLY.**

### 🚨 STANDING DON'Ts LIFTED OUT OF THE ARCHIVED BLOCKS — every one was paid for
- ⚠️⚠️ **NEVER ADOPT A SAVE TOKEN FROM A RESPONSE THAT WASN'T A SUCCESS.** `user-data.js` hands back a
  token even on a FAILED save (502) — by design, so a retry of the SAME save can reuse it. `saveUserRecord()`
  on the client used to adopt it unconditionally, found 2026-09-12: a device whose very first save ever
  failed (the Supabase-401 incident that day) walked away holding a real, valid token for an email with
  NO row behind it, and everything kept working locally until "Get my link" tried to read that row back
  and 404'd in a way that looked exactly like an expired token from the outside. **Gate every token/email
  adoption on `res.ok`, never just on the field being present.**
- ⚠️⚠️ **DO NOT RE-ADD A WEB SEARCH TOOL TO THE STYLIST CHAT "to help her find more."** That is exactly
  what invented four dresses and four prices for her. **The finder is the only product route in chat.**
- ⚠️ **DO NOT REBUILD THE STORE WORD INDEX.** A rarity-weighted index over her 100 store descriptions
  was built, shown to her and `git revert`ed whole on her word: ***"I don't want this to be complicated.
  I feel like the AI is intelligent enough to already know what each store specializes in."***
- ⚠️ **DO NOT REINTRODUCE "your shops" / "your stores"** in a status line, an empty state or a debug
  label. ***"Clients want me to check all stores. Not just 'your stores' that wording is off so let's
  get rid of it everywhere please."***
- ⚠️ **DO NOT ADD THE THREE DOTS TO `_findStatus`.** **DOTS MEAN THINKING, THE TURNING STAR MEANS
  SHOPPING** — her distinction, and collapsing them throws it away. ⚠️ **And the chat star's gold stroke
  is 1.5 on purpose: at 0.9 it melts into the pink at that size. Do not thin it back because it looks
  heavy in a diff — it was judged at the size it actually renders.**
- ⚠️ **DO NOT TIGHTEN THE PADDING INSIDE A CONTROL.** *"Start a fresh conversation"* has vertical
  padding because that padding IS its tap target; at zero it becomes a 14px-tall button and **her
  audience runs to 80.** ▶ **Tighten the MARGINS around a control, never the padding inside it.**
- ⚠️ **DO NOT PUT THE SOLD-OUT SERPUI BAG BACK IN `WEEK_STAR_PHOTO_ORDER` without checking stock.** Its
  `WEEK_STARS` entry is deliberately KEPT and marked SOLD OUT because it carries the `pxPos` crop that
  `starpx` uses as its worked example.
- ⚠️ **DO NOT DELETE `scratchpad/chatfallback.js` SECTION 13 TO SPEED THE SUITE UP.** It reloads the
  page for real, and it is the only thing that caught a `wrap is not defined` crash where not one card
  rendered. **No parser, no grep and no static test saw it.**
- ⚠️ **A HARNESS THAT DOES NOT SERVE `styles.css` MEASURES BROWSER DEFAULTS AND CALLS THEM FACTS.**
  Seven checks once read `object-fit:fill`, `height:0` and a 60px footer that way — and **two of them
  PASSED, comparing transparent to transparent.** ▶ **`copy.js` serves the real files off disk and runs
  a GUARD CHECK first. Put any rendered-number check there.**
- ⚠️ **`untagged.js` IS PINNED TO `3d1aad4`, NOT TO `HEAD`.** A baseline that moves is not a baseline —
  compared against `HEAD` it passed exactly once and then began reporting that the bug never existed.
- ⚠️ **`affq`'s `TEMPLATES` COUNT STAYS HARDCODED — it is the one count that must not be derived away.**
  It counts CODE PATHS OUT OF THE APP, and an unnoticed outbound anchor is an untagged link that earns
  nothing. **A tripwire is supposed to be tripped: find the new anchor, check it is `sponsored` and
  `_affUrl`-wrapped, then bump the number with a line naming the template.**
- 🚨🚨🚨 **PIN THE RULE, NEVER THE STRING — THIS COST FIVE ROUNDS IN ONE DAY (2026-09-11) AND EVERY ONE
  WAS A CHECK WRITTEN HOURS EARLIER IN THE SAME SESSION.** Each failed on GOOD NEWS: her copy improved,
  or she edited her own page, and a test written for the previous wording went red.
  | what was pinned | what broke it | the rule it should have named |
  |---|---|---|
  | `name.includes('—')` | her legitimate *"— 5 Pack"* | no appended COLOURWAY |
  | `note` contains `"gold or silver"` | her better *"both gold and silver"* | the note names BOTH METALS |
  | `name === 'Ponytail Cuff'` | *"Ponytail Cuff, 4 Pack"* | the name carries no METAL |
  | `Edit count === 33` | she removed two pieces | the importer cannot REACH the Edit |
  | `class="dc-cat"` exactly | a second class was added | match `dc-cat[^"]*` |
  ▶▶ **THE TELL IS ALWAYS THE SAME: the assertion names a VALUE she is free to change.** A count she
  edits weekly, a word she is free to reword, an attribute another class can join. ⚠️ **AND IT KEEPS
  HAPPENING BECAUSE THE STRING IS ALWAYS THE EASIER LINE TO WRITE** — the rule takes a sentence of
  thought and the string takes none. ▶ **Before writing an assertion, ask: could SHE change this
  legitimately tomorrow? If yes, it is not the rule.**
- 🚨 **WHEN A TEST BREAKS, ASK WHETHER THE APP GOT WORSE OR MERELY BIGGER.** Four suites broke the day
  she was approved for a shop — **they failed on good news.** ▶ **If it merely got bigger, rewrite the
  assertion to name the RULE, never to bump the number.** All four got STRONGER in the rewrite.
- ⚠️ **MEASURE TO FIND CANDIDATES, LOOK TO DECIDE.** A crop detector once accused her FARM Rio fix of
  being broken; rendering all ten Star photos and looking disproved it — **it was measuring a grey
  studio backdrop as though it were the dress.** ▶ **Reporting that number to her unchecked would have
  been a fault she then had to disprove herself.**

### ⚠️⚠️ THREE KNOWN PRE-EXISTING FAILURES IN `curated.js` — DO NOT PANIC, AND DO NOT DISMISS THEM EITHER
🚨 **`curated` reports 64/1 on *"never ruffles" removes the ruffled item*, and it is NOT a regression.**
▶ **PROVEN by running the SAME suite in a worktree at `097585b` and getting the IDENTICAL failure.** It
also passed 65/0 twice the same day, so it is **time- or state-dependent, not code-dependent.**
✅ **HER NEVER-WEAR RULE ITSELF IS FINE, measured three ways.** ▶ **The likely cause: `curated.js` runs
many checks in one page and earlier ones mark pieces "seen this week", so by the time this check runs
the rotation state has moved.**
🚨🚨 **FIX IT WITH AN ISOLATED CONTEXT, NEVER BY LOOSENING THE ASSERTION: it guards the never-wear list,
which exists because of a box of shift dresses, and a test that cries wolf on THAT rule teaches the next
session to wave it through.**
⚠️ **THE SECOND ONE: *"good CSV converts clean"* fails on her six DEACTIVATED catalog picks**
(`p001` `p015` `p057` `p064` `p089` `p104` — Madewell, COS, Marine Layer named in the frozen catalog CSV
but no longer keys in `STORES`, because she froze the catalog and those shops closed). Not a bug; the
converter doesn't yet know a deactivated row may name a dead store.
⚠️ **THE THIRD, ADDED 2026-09-12 AFTER IT WAS WRONGLY ASSUMED TO NEED CHECKING: *"every family sees ≥3
jeans"* is ALSO pre-existing** — proven the same way, against a worktree at `8140b92` (the commit before
this line was written), which reproduces it identically. It has nothing to do with the Edit; it's a
catalog/feed coverage gap unrelated to anything a session touches by removing an Edit item.
🚨 **SO: `curated` PASSES AT 62-63 OF 65, NOT 65 OF 65, ON A CLEAN CHECKOUT — three named failures, all
proven pre-existing.** ⚠️ **If any OTHER check in `curated` fails, treat it as real** — verify against
the current `origin/main` HEAD in a worktree before believing a new one, the same method used here.

### ▶ WHAT IS STILL OPEN OUT OF THOSE DAYS
1. ⚠️ **THE PRICES, AND NO CODE FIXES IT.** Every fed store is `$$$`/`$$$$`. Live medians: **dresses
   $398 · tops $260 · shoes $790 · bags $1,490**; 0 of 200 dresses under $100. ▶ **But her own STORES
   table is already mid-market — 57 of 108 entries START at `$$` or below and only 15 are `$$$$`
   throughout.** ⭐⭐ **SO THE AFFORDABILITY PROBLEM WAS NEVER HER TASTE OR HER CURATION: the feed just
   reaches the dearest seventh of her list, because those are the ones that approved her.** A search
   across all her shops fixes it with no new approval at all — which is what the finder now does.
2. ⭐ **SHE ALREADY TAGGED WHICH STORES CARRY WIDE WIDTHS, back in July — 8 of them:** Nordstrom ·
   Macy's · Nordstrom Rack · Amazon · Naturalizer · Lane Bryant · Zappos · DSW. **She answered the width
   question months ago; the app just never used her answer to FIND anything.**
3. ⚠️ **THE FEED CARRIES NO WIDTH DATA AT ALL**, so fed shoes cannot be ranked for width. **A question
   for a future merchant's feed, not code.**
4. ✅ **VILEBREQUIN STAYS — HER DECISION:** ***"I think it is fine to keep Vilebrequin. It should not
   come often but since they approved us I think it is fine to keep them in our mix."*** ⚠️ **NOT to be
   reopened as a bug.** *"It should not come often"* is already how the shelf behaves (feed ceiling +
   `_storeCap('compare')`) — **nothing further is needed and nothing should be added to suppress it.**
5. ▶ **`docs/store-scoring-brief.md` AND `docs/store-list-prompt.md` STAY IN THE REPO** for the day an
   affiliate approval brings a new shop. **They are no longer waiting on her** — she sent her own roster
   instead. ▶ **What the brief contains, so it never has to be rebuilt:** the business-model exclusions
   first · the five fields a store needs · the ten scores in order with the pairs explained as pairs ·
   the polish-ranks-never-matches rule · her 30-label archetype vocabulary · the measured range and mean
   of every dimension across her 108 · and all 108 with her real scores as anchors. ⚠️ **WHAT TO WATCH
   IN ANY DRAFTED TABLE: a flat table.** A model will want to score everything a 7, and a table where
   nothing varies cannot rank anything. **Her own 108 use the full 1-10 range on every dimension except
   polish.**
6. ⭐ **THE STORE-EXPANSION SHAPE IS A POWER LAW, so do NOT bulk-add: 98 of the 123 missing sources
   appeared exactly ONCE in 400 results.** Ten adds took coverage 44% → 60%; the long tail is worthless.
   ⚠️⚠️ **AND EXPANSION FIXES VOLUME, NOT JUDGEMENT: her "blush silk wrap dress" search gained ZERO from
   all ten candidates.** That query failed because it is hard to ASK FOR. **Adding stores will never fix
   a wording problem.**

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
| **Store variety per surface** | `_shopRules` from `_STORE_CAP` | `_storeCap(mode)` | **storecap 15** | ✅ **fixed 2026-09-07** — ⚠️ **and DELIBERATELY SUSPENDED on the chat's product row, her ruling 2026-09-09: *"I don't mind if multiple cards for one store show up... I want to show as many cards for her to swipe as possible. Not limited."* Not a regression.** |
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
| **Never claim a requirement is verified when it is not** | **the chat's cards: `judge()` + the three verdicts** | **`verifySize`/`verifyColour`/`verifyFabric`/`verifyCut`/`verifyWidth` in `find-products.js`** | **findprod 63 · chatfind 63** | ✅ **BUILT 2026-09-06, and the `n/a`s below have now expired as predicted** |
| **A cut the STYLIST chose is searchable only when SHE handed over the choice** | **the stylist may name a silhouette AND search for it when a woman delegates — and must say out loud that it was her own pick, so it stays hers to overrule. 🚨 ON SHOP YOUR STYLE THE TEST IS MECHANICAL AND EXACT: `_ssAsk` EMPTY = a full hand-over, so `_findKeepHerWords` does not run and the stylist's `cut` reaches all four queries; `_ssAsk` NON-EMPTY = her words, and it runs unchanged** | **`_findKeepHerWords` still deletes colour/fabric/cut she did not say on every other path** | **findprod 63 · chatfind 63 · ssfind 60** | ✅ **HER RULING 2026-09-08 (*"yes, that makes sense"*), LIFTED HERE 2026-09-09 when its home block was archived. 🚨🚨 AND IT REACHED SHOP YOUR STYLE ONLY ON 2026-09-10, AFTER SHE FOUND IT MISSING ON HER PHONE — the lead said *"I chose a belted dress"* and the shops received `["women's dress"]`. HER WORDS: *"I want the stylist to deliver exactly what she is promising."* ▶ A LEDGER ROW IS NOT A GUARANTEE THAT EVERY SURFACE OBEYS IT: this row existed, was correct, named its test suites, and one of the two surfaces had never been wired to it. **When a row says "when a woman delegates", check EVERY surface where she can delegate.** 🚨 A NARROW EXCEPTION — DO NOT WIDEN IT. The test is NOT "did the stylist name a cut", it is "did the woman HAND OVER the choice": *"what's in style now?"* / *"you pick"* → searchable; *"I want a blush silk wrap dress"* → her words only. The rule it bends exists because the model once recommended a jewel tone and then searched for one as though she had asked.** |
| **The chat's two failure sentences are APPROVED AS WRITTEN** | **the "my search didn't come back" and "nothing close enough" lines in `_findBlockHtml`** | n/a — the shelves write no such prose | **chatfallback 105 §12-13** | ✅ **HER RULING 2026-09-08, LIFTED HERE 2026-09-09 when its home block was archived: *"I think what you came up with is fine and the stylist chat already has a good personality and words things well."* ⚠️ They are NO LONGER placeholders. Do not rewrite them.** |
| **NEVER NAME A PRODUCT WE DID NOT FIND** | **the stylist may not name a product, price, size or link AT ALL — the ability is removed, not forbidden** | **every card carries a real verified offer from `find-products.js`** | **chatfallback 35** | ✅ **BUILT 2026-09-09, after she was shown four invented dresses** |
| **The internal `<<FIND>>` marker is never seen** | **stripped in `addChatMsg`, the ONE choke point every bot bubble passes through** | n/a — the shelves render no stylist prose | **chatfallback 35** | ✅ **fixed 2026-09-09; it had leaked from the one render route of four that forgot** |
| **Never say "your shops" / "your stores"** | **status lines, empty states, row headers — the phrase is absent, asserted** | n/a — the shelves write no such prose | **chatfallback 81 · copy 69** | ✅ **her rule, 2026-09-09: *"Clients want me to check all stores"*** |
| **A product photo is never cropped** | **the chat's AND Shop your Style's cards: `.fc-img` is `contain` in a 150x170 frame, banded in the card's own white — AND, since 2026-09-10, the "More from the Edit" strip (`#wbEditTeaser .wet-card>img`, `contain` in a 3:4 frame banded `#F5EFE2`)** | n/a — the shelves and the Star use `pxPos`/`pxFit`/`px2`, which choose a crop for ONE known photo | **copy 49 · wbedittasr 42** | ✅ **her catch 2026-09-09, and SHE CLOSED THE BAND QUESTION THE SAME DAY: *"I have not noticed a white band on anything."*** ⚠️ **The shoe-photo complaint is NOT this rule failing — it is the retailer's own margin, measured at 9-10% fill. A zoom to fix it would break this row.** 🚨🚨 **THE STRIP JOINED THIS ROW ON 2026-09-10 AFTER SHE SAID IT TWICE: *"can't see the whole Jean"*, then *"Jeans are cut off at the bottom."* THE FIRST FIX MATCHED THE STRIP TO THE EDIT CARD'S CROP AND WAS STILL WRONG — matching the Edit was Claude's inference from her *"it looks fine in the main page"*; her requirement was seeing the WHOLE piece. ▶ WHICH SURFACE A NEW PHOTO ROW BELONGS TO IS DECIDED BY ONE QUESTION: has a PERSON looked at this exact photograph? The Star and the Edit are hand-tuned per item, so they may crop. The finder's cards and this strip show many photos of many shapes sight-unseen, so they may not.** ⚠️ **The EDIT PAGE still crops and that is deliberate — she said it looks fine and it was left alone, not swept along.** |
| **The finder's honesty rules hold on EVERY surface that shows found products** | **chat AND Shop your Style render through the ONE `_findBlockHtml` and fetch through the ONE `_findFetch` — there is exactly one `product-find` call site in the app, asserted** | n/a — the shelves show feed products, judged by `curatedPicks` | **ssfind 52 · chatfallback 105** | ✅ **BUILT 2026-09-09 with Shop your Style. A second card loop is how the `<<FIND>>` marker leaked and how the two-row regression happened; there is none here to drift.** |
| **A SAVED ROW MAY CLAIM NO MORE THAN THE CARD IT WAS SAVED FROM** | **`_findCard`: a CHECKED card saves `exact` (real product page → "Shop it" + price); a BROWSE card saves store+search (→ "Find it", no price)** | **`renderWishlist` labels off that same flag, and rebuilds the search link every render** | **chatfallback 98, §15 — and both checks proven to bite** | ✅ **BUILT 2026-09-09 with the save heart. It is her 2026-09-06 rule one surface further out: a price and "Shop it" on a row that lands on a RESULTS PAGE is the "generic store search dressed as a find" she banned.** |
| **GOLD IS THE APP'S VOICE, PINK IS CATHERINE'S** | **the LARGE spinning waiting star (`.ss-find-star`, 66px) is GOLD and has NO `path` colour rule — it keeps `_starSpin`'s own gold** | **the small stylist MARKS stay PINK (`.sa-star`, `.shop-load-star`), and `.chat-typing-star,.find-load-star` IS the pink selector** | **ssfind 52, both halves** | ✅ **HER RULING 2026-09-09, LIFTED INTO THE LEDGER 2026-09-10 because it lived only in a session block and was one archive away from being lost: *"66px but I want the gold one not pink. Pink only for the chat."* and, correcting a sweep: *"I didn't want you to change those other stars. Just the one I said."* 🚨 NEVER add `.ss-find-star` to the pink path selector. Her 2026-08-09 mark system: gold = hers, pink = when Catherine herself is speaking.** |
| **HER OWN COPY IS NEVER PARAPHRASED FULLER** | **the product row says exactly *"Here are some options."*** | n/a — the shelves write no such prose | **chatfallback 105 pins it verbatim AND asserts the excusing wording is gone** | ✅ **HER LINE 2026-09-09, replacing Claude's *"Showing you as much as I could find."* LIFTED HERE 2026-09-10. ⭐ WHY HERS IS BETTER AND IT GENERALISES: Claude's line APOLOGISED for the row before a woman had found anything wrong with it. Hers just opens the door — the same instinct as her near-miss sentence, STATE THE TRUTH AND STOP.** |
| **A SHOE IS JUDGED ON POINT OF VIEW, NEVER ON SIZE** | **the Edit's hand-picked cards: a photo is chosen by LOOKING at the angle, and the empty space a correct angle costs is an accepted price** | n/a — the finder shows hundreds of unknown photos a minute and can hand-tune none of them | **▶ none; it is a judgement, not a promise** | ✅ **HER RULE, GIVEN 2026-09-09 AND RE-PROVEN 2026-09-10: *"it is not the size that is the problem it is the particular photo the angle of the shoe is not right... It's the point of view and angle of shoe."* 🚨🚨 IT HAS NOW BEEN BROKEN TWICE THE SAME WAY: fill percentage was measured and recommended from, and FILL IS A SIZE METRIC. On 2026-09-10 the measurement said the top-down filled 92% of the card and the three-quarter only 24%; SHE CHOSE THE THREE-QUARTER, because it shows the block heel. ▶ MEASURE TO FIND CANDIDATES, RENDER THEM ALL, AND LET HER LOOK — the renders are the only reason this was caught.** |
| **THE SEARCH HOLDS WORDS A SHOP PRINTS, NEVER AN OCCASION OR A SENTENCE** | **the prompt says so on every surface; `_findShopWords` is the floor under it — three words maximum, never ending on a dangling joiner** | n/a | **ssfind 96, on the three values the LIVE stylist actually wrote** | ✅ **HER CATCH 2026-09-10: *"I asked it for vacation dress and for white jeans and neither one of those worked."* 🚨 MEASURED LIVE, three replies put 46, 35 and 50 CHARACTERS OF PROSE into `cut` — and `cleanReq` accepts 40 and DROPS the rest SILENTLY, so TWO OF THREE sent the shops a bare "dress" beneath a sentence promising a wrap. That is her morning's complaint returning in a new costume hours after it was fixed. ▶ THE PROMPT IS THE FIX; THE FLOOR IS UNDER IT, because a prompt rule is only ever a prompt rule. ⚠️ AND A DANGLING JOINER IS NO BETTER THAN A SENTENCE — cutting at three words alone leaves "belted wrap with", which no shop prints either.** |
| **AN OCCASION IS TRANSLATED, NOT SEARCHED** | **`chose` — a field of its own, filled ONLY when her own words hold nothing searchable, applied ONLY when the her-words guard dropped NOTHING, and always NAMED in the lead** | n/a | **ssfind 96, and the same reply is checked for an invented colour in the same run** | ✅ **HER RULING 2026-09-10, AND IT OVERTURNED CLAUDE'S ANSWER AN HOUR EARLIER. She was told translating "vacation" into linen would break her own honesty rule. HER ARGUMENT: *"Vacation dress is one of the example prompts we give on the shop your style so we really need to be able to find that for her if we are suggesting it as a search term."* ▶▶ THE APP PUT THE WORDS IN HER MOUTH, so answering its own suggestion is the job, not an invention — and checking her point found FIVE of the NINE suggestions were things the app could not do. 🚨🚨 THE HOLE THE SUITE CAUGHT BEFORE IT SHIPPED, AND IT GENERALISES: the fields end up empty for TWO OPPOSITE REASONS — she named nothing, OR everything the model wrote was thrown out as invented — and afterwards THOSE LOOK IDENTICAL. So a translation is taken only from a reply that invented NOTHING: a stylist who has just made up a colour does not then get to choose the cut. ⚠️ AND THE LEAD IS FORCED ON, on a path that is otherwise silent: a translation she cannot see is the app narrowing her search behind her back.** |
| **THE APP MAY NOT SUGGEST WHAT IT CANNOT DO** | **`_ASK_RING` — every one of the nine suggested prompts must be answerable by a find request** | n/a | **ssfind 96 asserts no prompt promises a price filter** | ✅ **HER RULING 2026-09-10: *"Let's take the price off if we can't honor it."* ▶▶ A SUGGESTED PROMPT IS THE APP PUTTING WORDS IN HER MOUTH, which is why it is held to a higher standard than anything a woman types herself — and it is the same reasoning that made the occasion translation right rather than an invention. ⚠️ THE CLAUSE CAME OFF, THE PROMPTS STAYED ("tops", "white jeans"): they are good examples and the only thing wrong with them was the promise. ▶ PUT THEM BACK VERBATIM THE DAY A PRICE FILTER EXISTS.** |
| **THE APP REMEMBERS WHAT IT HAS ALREADY PAID FOR** | **`_findLSGet`/`_findLSSet` keep a search's answer in HER BROWSER for 24h; a hit paints instantly and a stale one refreshes behind her** | n/a | **ssfind 84 — and the check RELOADS the page with the network killed** | ✅ **HER DECISION 2026-09-10. TWO caches already existed and BOTH LIVED IN MEMORY, so almost every search she ran was a COLD 4-12 second search INCLUDING the identical one she had just run. 🚨🚨 AND WHY IT IS NOT IN THE DATABASE, WHICH MUST NOT BE "IMPROVED" LATER: the shared version was written first and thrown away. Remembering server-side means WRITING to Supabase, and her schema deliberately gives Netlify a READ-ONLY key (db/products.sql, 2026-09-05 — the writing key can also read every woman's name, email, sizes and wishlist). ▶▶ A WRITE DOOR ON A KEY THAT IS PUBLIC IN THE PAGE'S SOURCE WOULD LET ANYONE INSERT FAKE PRODUCTS WITH LINKS TO ANYWHERE, SERVED AS REAL FINDS — a phishing vector in a shopping app. A shared cache must go somewhere SERVER-ONLY (Netlify Blobs), never through the publishable key.** |
| **NO APOLOGY WHERE SHE ASKED FOR NOTHING** | **`_findBlockHtml(data,req,quiet)` — the caller that knows she named nothing sets `quiet`; the Wardrobe does, chat and the ask box never do** | n/a | **ssfind 84, both halves** | ✅ **HER RULING 2026-09-10, made by LOOKING at the shelf rendered at phone size: *"take the apologizing line off"*. ▶ On the Wardrobe she TAPPED A ROW and named nothing, so there is no exact match to fall short of and *"Nothing came back as an exact match"* apologises over real products at real prices. Her own rule one surface out: STATE THE TRUTH AND STOP. ⚠️ SCOPED, NOT DELETED — it still appears wherever she NAMED a thing. ⚠️ AND `quiet` COMES FROM THE CALLER, never inferred from the request, which would be the same guessing this app keeps paying for.** |
| **HER PAYING SHOPS GET A SEAT, NEVER THE HEAD OF THE TABLE** | **`_findSpread` interleaves affiliate pieces 1:1 through the BROWSE stretch, starting with a non-paying card so the natural order still leads. No cap: five FARM Rio pieces stay five.** | n/a — the shelves show feed products, and the feed IS her affiliates | **ssfind** | ✅ **HER RULING 2026-09-09: *"is there a way to make affiliated stores be in the searched mix more often - I don't want them at the very top but I also don't want them in the bottom of the barrel either... How can we have them have some level of priority but not maximum?"* 🚨🚨 THIS ROW WAS ADDED 2026-09-10 AFTER SHE ASKED FOR THE SAME THING AGAIN AND IT WAS ALREADY BUILT — her ruling existed ONLY in a code comment, in NEITHER `CLAUDE.md` NOR the archive, so nobody reading her file could know. ▶ A RULING THAT LIVES ONLY IN CODE IS A RULING SHE WILL BE ASKED FOR TWICE. ⚠️ IT IS NOT HER OPTION A TIE-BREAK, and the distinction is the whole justification: Option A governs RECOMMENDATIONS, the checked cards that wear a tick and make a claim. Those lead the row and their order is pure merit, untouched. This reorders only the browse stretch, which claims nothing about anything.** |
| **THE APP NEVER PROMISES BEFORE IT KNOWS IT CAN DELIVER** | **the stylist's `findlead` is HELD in `_ssPromise` and spoken by `_ssFindPaint` only when real cards exist. During the wait: the turning star and `_FIND_STEPS`, which claim nothing.** | n/a — the shelves make no promise ahead of their own contents | **ssfind 68, measured DURING the wait with the star still turning** | ✅ **HER DECISION 2026-09-10, AFTER THREE FAULTS IN ONE DAY TURNED OUT TO BE ONE SHAPE: *"the same pieces waiting"* → different pieces · *"I chose a belted dress"* → any dress · *"I chose a belted dress"* → nothing at all. ▶▶ EVERY ONE WAS A PROMISE MADE BEFORE THE APP KNEW IT COULD KEEP IT. ⭐ AND NOTE WHAT THE FIX IS NOT: not a rule, not a guard, not a test to maintain. The promise is unbreakable BY CONSTRUCTION because it cannot be spoken until the thing it promises is in hand — her standing direction, fewer rules and breakable things, applied to a bug. ⚠️ DO NOT MOVE THE LEAD BACK INTO THE WAITING MARKUP to "reassure her sooner"; the star already does that.** |
| **HER OWN STORE SCORES ORDER THE BROWSE ROW** | **`_findByHerShops` sorts by `_storeFit` before `_findSpread` seats her affiliates through it; an UNSCORED shop sorts LAST and is never given an invented score** | n/a | **ssfind 68, and the check asserts the row really MOVED, not merely that it is in some order** | ✅ **HER DECISION 2026-09-10: *"I would like to see the nicer shops first."* ⚠️ SHE WAS ASKED WHICH OF TWO BUILDS SHE MEANT, because this and her 2026-09-09 *"one row starting with the ones that match her search terms the best"* point different ways. SHE CHOSE NICER SHOPS GENUINELY FIRST, and her September order survives as the TIE-BREAK (the sort is stable, so within one shop the best match still leads). ▶ DO NOT SILENTLY RESTORE THE OLD ORDER. ⚠️ ONE BUILDER, so it lands on the CHAT's row too, deliberately and with her told: "nicer shops first" is her taste, not a screen setting.** |
| **AN EDIT NAME CARRIES NO COLOURWAY, AND MAY DISAGREE WITH THE SHOP'S OWN TITLE** | n/a — the stylist names no products at all | **the Edit's hand-written `.dc-item` names, and the rule is written into the markup beside them** | **▶ none; it is a judgement, and the markup carries the warning** | ✅ **HER TWO RULINGS, 2026-09-10, LIFTED INTO THE LEDGER WHEN THEIR SESSION BLOCK WAS ARCHIVED — a rule she gave never archives. (a) *"Let's take the dash and the word Beige off of this Edit item"*, then unprompted on the sandal *"don't call it brown, just leave the color out."* (b) Olivela's own title says *"Diamond & 14k Gold **LARGE** Bezel Pendant Necklace"* and her ruling is *"leave out the word large. They call it large, but it is not really large."* 🚨 THAT IS HER SALE-PRICE RULE ONE STEP OUT: a woman who arrives to find a piece DAINTIER than billed feels misled; one who finds it as delicate as described does not. ⚠️ A FUTURE SESSION WILL SEE THE MISMATCH WITH THE SHOP'S TITLE AND WANT TO "FIX" IT. It must not. ⚠️ The urls still say `beige`/`brown`/`large` — the shops' own product handles, never shown to a woman and not ours to change. 🚨🚨 **AND SHE SHARPENED IT INTO A TEST ON 2026-09-11, ON THE FINDS PAGE: IF THE NOTE BRAGS ABOUT THE COLOUR RANGE, THE NAME CARRIES NO COLOUR.** Her words: *"on the 3 pieces that name a color and then brag about the range - should we not say the color, that seems like the best fix there. She can see the colors when she clicks on it, we don't need to name it."* ▶ Three names lost their colourway first (the ones whose notes say *comes in lots of colors*) — 🚨🚨 **AND MINUTES LATER SHE WIDENED IT TO THE WHOLE PAGE: *"actually I don't think I want to put color on any of them."*** ▶▶ **SO NO NAME ON `/finds` CARRIES A COLOURWAY AT ALL — all 7 came off, her own PRETTYGARDEN maxi included.** ⚠️ **THE SCOPE IS THE APPENDED SUFFIX ONLY: "Gold Ponytail Cuff" keeps its gold, because that is the piece's identity rather than a colourway she picked.** ⚠️ **AND THE EDIT WAS NOT SWEPT — 4 of its 33 still carry one and she has not ruled on them; ask, do not assume.** ⭐ **A LOOK BEFORE THE SWEEP CAUGHT ONE THAT IS NOT A COLOUR AT ALL: the Edit's *"Align Pant — Full Length 28″"* matches the same em-dash pattern and is a LENGTH.** ▶ **A regex over her copy needs eyes on its matches before it runs.** ⭐ AND IT PAIRS WITH THE 2026-07-31 RULE RATHER THAN REPLACING IT: link to the BASE product when the note brags about range — now the NAME matches that link instead of arguing with it.** |
| **A RESUME SHOWS HER THE PIECES SHE LEFT, NOT A FRESH SEARCH** | **Shop your Style: `_saveShopFind` stores the found row beside the six picks, and `_ssFindPaint` paints it before the waiting star is ever set going** | n/a — the shelves rebuild from the feed, and promise nothing about sameness | **ssfind 54, and the check answers the resume with DIFFERENT products so it can tell memory from a re-ask** | ✅ **HER CATCH, 2026-09-10: *"the whisper said... the same pieces waiting. So I clicked on it and this was not true."* 🚨 THE WHISPER IS A PROMISE, AND HALF THE SHELF WAS KEPT: the six text cards are advice, the PHOTOGRAPHS are what she came back for. ⚠️ `t` is never re-stamped by a late row, or a slow search would quietly extend the six-hour promise. 🚨🚨 AND THE CHECK GUARDING THIS PASSED ON THE BROKEN CODE FOR A WHOLE DAY, because the harness answered every search identically: A STUB THAT ALWAYS ANSWERS THE SAME THING CANNOT TELL "it remembered" FROM "it asked again".** |
| **A PRICE SHE CANNOT CHECK IS ROUNDED UP, NEVER TO THE NEAREST** | n/a — the stylist names no prices at all, by construction | **`/finds`: `renderPrice()` in `scripts/finds-from-csv.js` ceilings her real figure and prints `~$17`; the exact cents stay on the card in `data-price`. The Edit keeps EXACT prices, because its shops can be read** | **findscsv 45 · findspage 92** | ✅ **HER ASK 2026-09-11, and the ROUNDING MODE was corrected before it shipped. The spec said "nearest", which prints ~$16 for a $16.25 piece — she arrives to find it DEARER than the page said, which is her own 2026-07-31 sale-price rule broken by a word. 🚨 CEILING ONLY: the cheaper surprise is the only recoverable one. ▶ WHY FINDS AND NOT THE EDIT IS A TRUTH DIFFERENCE, NOT A STYLE ONE — Amazon pages are bot-walled, so the price can never be verified from here and moves daily; the Edit's shops can be read. ⚠️ DO NOT UNIFY THE TWO PAGES. ⭐ AND THE EDIT ALREADY TILDES 6 OF ITS 33 PRICES, measured — the convention is hers already, not a new invention. ⚠️ A QUALIFIER SURVIVES THE ROUNDING: "$9.99 for 4" → "~$10 for 4", because four cuffs for ~$10 is a different offer from one.** |
| **NO DASHES IN HER COPY UNLESS GRAMMATICALLY NEEDED** | n/a — the stylist writes no product copy | **`/finds` names and notes; the four originals were CHECKED against it, not assumed** | ▶ none — it is a judgement about her voice | ✅ **HER RULE, 2026-09-11, given with her 20-row sheet: *"1. No dashes in app copy unless grammatically needed."*** ⚠️ **DELIBERATELY UNTESTED. Her standing direction is fewer rules and breakable things, and "grammatically needed" is a judgement only she can make — a regex would fail on `2-in-1`, `Non-Slip`, `Roll-Up`, `built-in` and `3-Piece`, all of which are correct.** ▶ **THE ONE SURVIVING EM-DASH WAS HERS AND WAS FLAGGED RATHER THAN EDITED** — *"Interchangeable Gold Purse Chains — 5 Pack"* — and she changed it herself to a comma. **Never rewrite her copy to satisfy a rule she wrote.** |
| **NO COLOURS IN PRODUCT TITLES — AND ONLY SHE KNOWS WHICH COLOURS ARE THE PIECE** | n/a | **`/finds`: no name carries an appended colourway; a colour that IS the piece's identity stays** | **findscsv 50 §7b** | ✅ **HER RULE 2026-09-11, widened by her from 3 pieces to the whole page: *"actually I don't think I want to put color on any of them."*** 🚨🚨 **AND THE PART THAT GENERALISES, LEARNED THE SAME DAY: "IS THIS COLOUR THE PIECE, OR A COLOURWAY?" IS A QUESTION ABOUT THE PRODUCT, NOT ABOUT THE WORDS.** The ledger's worked example used to be *"Gold Ponytail Cuff keeps its gold"* — then she found the cuff and the bangles **also come in silver**, so their gold had never been identity at all. **Both names lost it and both notes gained *"Comes in gold or silver."*** ▶ **The example moved to the purse chains, which she ruled on by name: *"keep the gold on the purse chains."*** ⚠️ **A NAME THAT DROPS ITS COLOUR MUST SAY SO IN THE NOTE, or a woman reaches a silver piece off a page that told her nothing. Asserted.** |
| **A PACK GOES IN THE NAME; A BRAND GOES IN THE STORE COLUMN** | n/a | **`/finds`: `Ponytail Cuff, 4 Pack` · `CRZ YOGA · Amazon`, `PRETTYGARDEN · Amazon`** | ▶ none — a convention, not a promise | ✅ **HER ASK 2026-09-11: *"there are three CRZ YOGA pieces now, so worth picking one"* — and she left the choice to Claude.** ▶▶ **BOTH WERE DECIDED BY COUNTING HER OWN PAGE, NOT BY TASTE: 3 of 4 multipacks already put the pack in the NAME, and 10 of 11 branded pieces already put the brand in the STORE column.** ⭐ **She asked a taste question and got a count of her own app back — the pattern that has worked every time.** ⚠️ **AND A COLLISION WAS FLAGGED RATHER THAN RESOLVED SILENTLY: her "keep the four originals exactly as they are" and her "your call which way to standardise" cannot both hold, because the two pieces she asked about WERE originals. The later, more specific instruction won, and both changes were named to her.** ▶ **PRETTYGARDEN had the identical split and was NOT swept — she had written it that way in that very sheet, so she was asked. She said move it.** |
| **A SECTION HEADING OUTRANKS WHAT IT GOVERNS** | n/a | **`/finds` category headings: bigger than her note and her store line, smaller than the product names, with more air above than sits between two cards** | **findspage 101** | ✅ **HER CATCH 2026-09-11: *"the font is small on those, i almost missed them when I was scrolling."*** ▶▶ **MEASURED, AND SHE HAD FOUND A REAL HIERARCHY INVERSION: 11.5px heading against a 20px product name and a 15.5px note — THE SECTION LABEL WAS THE SMALLEST TEXT ON THE PAGE.** On a page a woman scrolls, that label is the only thing telling her where she is. 🚨 **AND 16px NOT 15, BECAUSE A TEST SAID SO: 15 still lost to her 15.5px note and only LOOKED bigger because it is uppercase, bold and letterspaced. OPTICAL WEIGHT IS NOT SIZE, and "looks fine to me" is the judgement that let 11.5px ship.** ⚠️⚠️ **HER TWO ASKS ON THIS ELEMENT PULL OPPOSITE WAYS AN HOUR APART — "I almost missed them", then "too much white space" — AND THE ANSWER IS NOT A COMPROMISE, IT IS TWO DIFFERENT GAPS: a heading after a CARD keeps 38px; the FIRST heading follows the DISCLOSURE, has nothing to separate from, and takes 20px.** ▶ **The guard is RELATIONAL, never a pixel value, so it survives any restyle.** |
🚨🚨 **THE "A PRODUCT PHOTO IS NEVER CROPPED" ROW IS SEPARATE FROM THE `px2` PHOTO ROW ON PURPOSE, AND
THE DIFFERENCE IS THE USEFUL PART.** `pxPos`, `pxFit` and `px2` are **per-item overrides she or Claude
choose by LOOKING at one known photograph** — the Star of the Week, an Edit pick. They work because
somebody eyeballed that exact picture. ▶▶ **The finder's cards are the opposite: hundreds of unknown
photos a minute, from shops nobody has looked at, in shapes measured at anything from 0.77 to 1.00.**
**Nothing can be hand-tuned there, so the rule has to be a GUARANTEE that holds sight-unseen — and the
only crop that is safe on every unknown photo is no crop at all.**
⚠️ **DO NOT "unify" the two rows by giving the cards a `pxPos`.** A per-item override needs a person;
this surface will never have one.
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
The session-by-session build history lives in **`CLAUDE-archive.md`** — **moved in three waves,
2026-07-28, 2026-09-05 and 2026-09-10, nothing deleted any time.** Read it for how something came to be: a
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
- 🚨🚨 **THE RULE WAS NOT BEING FOLLOWED, AND THE THIRD WAVE (2026-09-10) IS WHY IT IS RESTATED HERE.**
  The 2026-09-09 entry was left in place while 2026-09-10's was written above it, so the file carried
  TWO full session entries and had grown back to **~70,000 tokens — 27,500 of them (39%) in the
  2026-09-09 block alone.** ▶▶ **Archiving is not a chore to do when the file gets big; it is part of
  writing the session's notes.** ⭐ **THE METHOD THAT WORKED, USE IT AGAIN: archive the old block
  VERBATIM first, then read it back paragraph by paragraph and rewrite only what is TRUE RIGHT NOW into
  a compact STANDING REFERENCE.** It took 27,500 tokens down to 8,000 and lost nothing — and it is
  safer than editing in place, because the archive copy is made before a single word is cut.
  ⚠️ **THEN PROVE IT: grep the new file for every one of her verbatim rulings, every live status
  figure and every open thread BY NAME.** Five came back "missing" on the first pass and all five were
  line-wrapping — **which is exactly why the check has to be run rather than assumed.**
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
- 🎯 **ARCHIVING ITSELF IS ONE OF THE THINGS CLAUDE DECIDES, NEVER CATH — HER STANDING RULE, 2026-09-10.**
  Her words: *"Why are you asking me about putting something on main? I don't even know what that means.
  I count on you to decide what needs to be saved or archived or put on main or the branch and all of
  that. I need you to keep track of everything and be honest with me."* ▶ **Branch, commit, archive,
  merge to `main` — all of it is Claude's to decide and do, then report in one plain line** ("saved and
  live"). The only thing that still goes to her is a PRODUCT decision. ⚠️ **And the second half of her
  sentence is load-bearing too: deciding for her is not permission to be vague about what was decided —
  say what was saved and where.**

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
- 🚨🚨 **SUPERSEDED BY HER OWN ACTION, 2026-09-09 — READ THIS BEFORE THE PARAGRAPH BELOW.** She has now
  SHARED IT: ***"I have already asked many friends and put it out on Instagram."*** ▶▶ **INSTAGRAM IS A
  PUBLIC POST, not the hand-picked circle this paragraph recommends, so she went FURTHER than the advice
  here.** ⚠️ **DO NOT "protect" a soft launch she has ended, and do not offer to help her find testers.**
  ▶ **The paragraph is KEPT because the FEARS in it are real and still hers** — the "evil eye", the
  AI-hostile friends, the worry that people won't understand the links aren't wired in. **Those matter
  when her feedback starts arriving, and some of it may be unkind.** *The original, as written:*
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
⚠️ **STILL SIX AFTER 2026-09-09, AND THAT IS DELIBERATE — CHECKED, NOT ASSUMED.** Shop your Style's new
row of real products adds **NO seventh**: `_findBlockHtml`'s `DISC` is empty (her own ask, *"please
let's take off that extra affiliate link wording too"*) and the screen already carries
`.shop-disclosure`. **`ssfind` asserts exactly ONE on that screen, never two.** ▶ **If the row is ever
moved to a surface with no disclosure of its own, the one disclosure has to MOVE there.**
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

🚨🚨 **DATABASE INCIDENT, FOUND AND FIXED 2026-09-12 (fourth session) — LIVE OPERATIONAL STATUS, NEVER
ARCHIVES.** The `SUPABASE_KEY` Netlify was using went stale (Supabase rejecting it with a 401), so **no
save reached the database for an unknown period, for most likely every user, not just her.** Found via a
live diagnostic on the wishlist share endpoint, fixed by her: got the current `service_role` secret from
Supabase (Project Settings → API → the legacy keys tab) and updated it in Netlify, then redeployed.
✅ **RE-VERIFIED LIVE, FIXED:** both the save endpoint and real share-link creation now succeed end to
end. ⚠️ **STILL OPEN AND WORTH DOING IF SHE WANTS TO KNOW: no way from here to tell how long it was
broken, or whether any real woman's save was silently lost during the window** (her own testing/local use
kept working regardless, since everything lives on-device first) — Supabase support could tell her their
API error history if she asks. **MailerLite signups were unaffected** (that call runs independently of
the Supabase save), so her email list itself is not missing anyone.
▶ **The likely trigger, not confirmed:** Supabase silently rotating the underlying JWT signing secret,
which invalidates old legacy `anon`/`service_role` keys without warning. If `SUPABASE_KEY` ever goes
stale again with no code change on this side, check Supabase's own API-keys page FIRST, not just whether
the project is paused. Full story of the hunt is in this session's "WHERE WE LEFT OFF" above (moves to
`CLAUDE-archive.md` next session, but the incident line here does not).

👥👥 **SHE HAS SHARED THE APP — 2026-09-09, HER WORDS: *"I have already asked many friends and put it out
on Instagram."*** 🚨 **LIVE OPERATIONAL STATUS, WHICH BY THIS FILE'S OWN RULE NEVER ARCHIVES.** ▶ **It is
the first time Style Star has been put in front of anyone but her.**
✅ **CLOSED, 2026-09-11 (second session): what came back has already been discussed with her, in
detail — do not ask her again.** ⚠️ **The content of that feedback isn't written down anywhere in this
file, because the conversation that covered it happened outside a session that saved its notes here —
worth asking her whether it's worth capturing, so it isn't lost the way chat-only context always is.**
More feedback is an ONGOING thing now, not a single pending question. ⚠️ **No analytics have ever been
read** — `track()` exists and has never been looked at. **That's still a small unstarted job.**

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
4. **AMAZON — SHE ASKED TO APPLY 2026-09-10, AND THE FACTS WERE RE-CHECKED LIVE RATHER THAN RECALLED.**
   ✅✅ **APPROVED (CONDITIONAL) — 2026-09-12. The 180-day clock for 3 qualifying sales is now RUNNING.**
   `_AMZ_TAG` is set and every Amazon link in the app tags itself — see "AMAZON — WHAT CAN AND CANNOT BE
   DONE FROM HERE" in the Standing Reference for the full detail (disclosure locations, what's still
   NOT wired). ⚠️ **"Conditional" means bound by the Operating Agreement, her own words — watch for
   that status to change.** *The original entry below is kept for the reasoning that's still true: why
   the catalogue couldn't come first, and why the Finds page never needed it.*
   ***"I want to go ahead and apply and start using their catalog."***
   🚨🚨 **THE CATALOGUE CANNOT COME FIRST, AND THIS IS THE PART THAT CHANGES HER PLAN: Amazon's Product
   Advertising API (the catalogue) IS GATED BEHIND SALES SHE HAS NOT MADE YET.** ▶ **Access needs the
   3 qualifying sales first — the catalogue is the REWARD for selling, never the tool to sell with.**
   ⚠️ **AND KEEPING IT IS HARDER THAN GETTING IT: reported at 10 qualifying sales in a TRAILING 30 DAYS
   in 2026, with keys revoked after 30 days without 3.** ⚠️ **THAT 10-SALE FIGURE IS REPORTED, NOT
   CONFIRMED BY AMAZON HERE — say so, and re-read the terms on the day she applies; programme rules
   change and this file has been burned by a stale number before.**
   🚨 **THE 180-DAY CLOCK IS REAL AND STARTS AT APPROVAL, NOT AT LAUNCH.** 3 qualifying sales within
   180 days or the account closes. **Applying while the app has no measured users spends the window.**
   ✅✅ **BUT — AND THIS IS WHY HER IDEA STILL WORKS — AN AMAZON FINDS PAGE NEEDS NEITHER.** ▶▶ **Plain
   hand-picked Associates links work from day one with no API and no sales.** **The catalogue was never
   what her page needed; her own curation is, and her disclosure REQUIRES that every piece be personally
   selected by the founder anyway.** ⚠️ **So the only real question is TIMING THE CLOCK, not whether to
   build the page.**
   ▶▶ **WHAT DECIDES IT, AND IT IS ALREADY ON HER BOARD AS AN UNSTARTED JOB: READ HER ANALYTICS.**
   `track()` exists and nobody has ever looked. **3 sales in 180 days is a traffic question, and this
   project has never once measured its own traffic.** ⭐ **That makes "read the analytics" the thing
   that answers "should I start the Amazon clock" — a small, unblocked, Claude-side job that turns a
   guess into a decision.** ▶ **SHE WAS TOLD THE RISK ONCE, PLAINLY. IF SHE STILL WANTS TO APPLY, THAT
   IS HER CALL AND IT GETS BUILT — do not re-litigate it a second time.**
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
**7. ✅ DONE 2026-09-09 — SHE SHARED IT WITH FRIENDS AND ON INSTAGRAM. See the master to-do; do not
re-propose this.** *(The original wording, kept because the reasoning about WHO still applies if she ever
wants a second, more targeted round.)* (No pressure, her own timing) THINK ABOUT FIRST TESTERS. Once the shopping is honest, who are the 5-10 warm,
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
