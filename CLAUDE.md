# Style Star — Project Notes

Style Star is a personal style-quiz web app ("Align your style. Shine your light.").
A user takes a quiz (and/or uploads a photo), gets an AI-generated personal style
write-up, can chat with an AI stylist, see outfit/shopping ideas, and save results
by email.

---

## ▶ NEXT SESSION — START HERE (2026-08-21 LATEST — ✍️ SHE RETIRED "HOW IT WORKS", AND THE STAR ROSE)

### ⏸ WHERE THIS SESSION IS — ⚠️ BUILT, TESTED, PUSHED, **NOT MERGED**, AWAITING HER WORD
Branch `claude/style-star-markdown-3rdfdz`, tree clean, **ZERO Netlify builds so far** — nothing is live yet.
▶ **THE FIRST THING TO DO: ask whether to merge.** One `index.html` change is sitting on the branch.
▶▶ **WHAT SHE DID, and it is the shape of the session: she stopped a build queue to look at a shipped
screen critically.** Her words: *"I am not liking how we have HOW IT WORKS and then the sneak peak star of
the week and then the Explore buttons. Something doesn't feel right with the set up... I wonder if we should
put the star of the week down at the very bottom OR make it thumbnail size or if we should even need to have
the HOW IT WORKS - not sure if it is obvious how it works I guess not I probably think that because I already
know how it works ha."* **Her three asks (the emailable wishlist, the affiliates, the loose ends) are
UNTOUCHED and all still waiting** — the entry below this one holds them and nothing in it went stale.

### 🚨⭐⭐ THE DIAGNOSIS, AND IT IS THE REUSABLE HALF: THREE SECTIONS WEARING THE SAME COSTUME
She could feel it and not name it. **Measured: `─ HOW IT WORKS ─`, `─ ★ STAR OF THE WEEK ★ ─` and
`─ OR EXPLORE ─` stacked within 800px at IDENTICAL weight** — same gold, same caps, same hairlines, same
`.hm-divwrap` construction. ▶ **So the page read as A LIST OF EQUALLY-IMPORTANT SECTIONS instead of a
journey, and nothing on it said which mattered most.** That was the feeling, not the Star.
- ⭐⭐ **AND HOW IT WORKS WAS THE ONE TO CUT, because it repeated the page above it.** Pulled apart row by row:
  **step 1 "Take the style quiz" restated the giant `.hm-cta` 150px above it** · step 2's sub restated the
  `.hm-h1` ("Discover your **signature** style") · step 3's restated `.hm-body` ("personalized shopping, all
  in one place"). ▶ **EXACTLY ONE of its six lines said anything new: "12 quick questions, no wrong
  answers"** — which answers the two silent objections a stranger has (how long, and what if I get it wrong).
- ▶ **HER SELF-DIAGNOSIS WAS HALF RIGHT AND WORTH SAYING BACK TO HER: she assumed she found it redundant
  because she already knows how the app works. She found it redundant because it largely WAS.**

### ✅ WHAT SHIPPED — HER PICK "B" FROM FIVE RENDERED OPTIONS
`.hm-hiw` and its three numbered rows are **deleted**; one quiet line sits under the quiz button instead:
**"12 quick questions. No wrong answers."** (`.hm-hiwline`, no divider, no numbers, no header — the whole
point was to stop it competing with the two dividers that remain).
- ⭐⭐ **THE MEASURED PAYOFF, and it is why B beat cutting the block whole: THE STAR OF THE WEEK ROSE FROM
  y=702 TO y=560.** It had been sitting ONE PIXEL BELOW a ~700px iPhone fold, so a stranger saw **none** of
  it without scrolling. **Now ~140px of a REAL GARMENT — the gold frame and the top of the scarf — is on her
  FIRST screen** (72px even at 320). ▶ **Her two questions turned out to have one answer.**
- ✅ **The quiz CTA never moved (y=346) and still leads.** That was the thing that actually had to be
  protected, and a test now holds that line.
- **Page 1543 → 1401px at 390.**
- ⚠️ **ONE LINE at 390/375/360, TWO BALANCED lines at 320 (Display Zoom), deliberately.** The font was
  **NOT** shrunk to force one line — readability beats an even line on an 18-80 audience, and this is the
  screen a stranger meets first. Her standing trade, applied again.

### ▶ THE TWO OPTIONS SHE RAISED AND DID NOT TAKE — keep the reasons, they will come back
1. ⚠️ **THUMBNAIL BUYS ALMOST NOTHING, and the number is the argument: 110px photo → 407px card · 96px →
   388 · 84px → 372. Only 35px between biggest and smallest, BECAUSE THE NOTE AND THE NAME SET THAT CARD'S
   HEIGHT, NOT THE PICTURE.** So shrinking the photo costs the thing that makes the card hers and saves
   about twenty pixels. (Her own 08-21 argument for option C over her word "thumbnail" still stands: A and B
   show a product with a price, which any shop does — only C carries her note.)
2. ⚠️ **BOTTOM PLACEMENT QUIETLY KILLS IT.** Rendered honestly rather than argued away, and **it reads
   better than expected** — a nice closing note, and it groups How It Works with the explore cards. **But it
   lands at y=1015, BELOW THREE TAP-OUT DOORS.** A woman who taps "Meet your stylist" never sees it. ▶ **If
   it ever goes there, the honest question is not where to put it but whether to keep it.**
- **Also rendered and not taken: `starup`** (Star above How It Works) — it fixes the fold but keeps all
  three dividers, so it does not touch the actual problem.
- **Renders kept:** `scratchpad/disco-{current-full,nohiw,hiwline,starup,starbot,B2,built}.png`, all made by
  manipulating the REAL page in the browser, so every one is the real thing rather than a mockup.

### ⭐ TEST HYGIENE — one suite DELETED, one assertion deliberately INVERTED
- 🚨 **`scratchpad/hiwcheck.js` IS DELETED (44 checks), not silenced — its SUBJECT was retired.** Every one
  of its assertions measured the 1-2-3 rows' leading, widow behaviour and 40px row height. ▶ **Its real job
  lives on in the successor, `scratchpad/discopage.mjs` (56 checks): hold the quiz reassurance readable and
  unwrapped at every width, and never shrink the font to get there.** The successor also pins the 1-2-3
  really gone, her sentence verbatim, **exactly ONE `.hm-divlbl` left besides the Star's own header**, the
  Star reaching the first screen, the CTA still leading, and the framed edge flush with `.hm-founder`.
- 🚨🚨 **`discostar` 96 → 104, AND ONE ASSERTION IS DELIBERATELY INVERTED — read the comment before "fixing"
  it.** It used to demand `star.top >= 690`, i.e. that the Star cost NOTHING above the fold. **That was
  correct while it sat below How It Works and is now exactly backwards: reaching the first screen IS the
  point of her change.** It now asserts `star.top < 700` **and** `star.top > cta.bot`, so the gain is pinned
  without the quiz ever losing the top of the screen.
- **Green at pause:** discopage 56 (new) · discostar 104 · nav 82 · menu 87 · hubs 49 · e2e · copy · affq 40.
  ⚠️ affq's documented "results saved" timing flake hit once; clean on rerun, as always.

### ⚠️ THREE LESSONS FROM THIS SESSION, ALL REUSABLE
1. 🚨 **A PATCH SCRIPT THAT SLICES `s[:a] + s[b:]` SILENTLY DUPLICATES WHEN `b < a`.** The block bound was
   found with `s.index('<b>Shop your style</b>')` — **and that exact string also lives in the Welcome Back
   hub row, earlier in the file** — so `b` landed BEFORE `a` and the slice pasted 3.3KB of markup back in
   instead of removing it. ▶ **ANCHOR EVERY BOUND SEARCH TO THE ONE BEFORE IT (`s.index(x, a)`), and assert
   `b > a` before slicing.** The tell was a duplicate-count assertion failing on something untouched.
2. ⚠️ **"A test that fails on a correct value is usually a broken harness" — proven again, same day.** The
   new suite compared `.dss-wrap`'s raw left against `.hm-founder` and was off by **exactly 7px at every
   width**, which is the frame's own `inset:-7px` spread. **A constant offset at every width is the
   signature of a measurement bug, not a layout bug.** `discostar.js` had it right all along.
3. ⚠️ **THE RENDER WAS MISSING THE PRODUCT PHOTO AND THE FIRST JUDGMENT WOULD HAVE BEEN WRONG.** The harness
   aborted `**/cdn/shop/**` (this sandbox's Chromium cannot reach retail CDNs), so the Star card rendered
   145px shorter with a hole where the scarf goes. ▶ **`curl` CAN reach them: fetch once, serve it locally.**

### 🚨⭐ A LICENSING CALL THAT IS NEW, AND IT EXTENDS HER OWN 2026-08-20 RULE
The render harnesses need a local copy of the Star's photo. **It is fetched on demand by
`scratchpad/starphoto.mjs` and GITIGNORED, deliberately.** ▶ **THIS REPO IS PUBLIC, and an affiliate
approval licenses the APP to DISPLAY a retailer's photograph by hotlinking (gated on `_affMid`) — it does
not license this repository to REDISTRIBUTE a copy of the image file.** Technical access is not legal
permission, which is her own rule pointed at a surface it had not been pointed at before. **The reasoning is
written at `.gitignore` and at the top of `starphoto.mjs` so a future session does not helpfully commit it.**

### ▶ THE FIRST THINGS NEXT SESSION
1. ⚠️⚠️ **MERGE THE DISCOVERY-PAGE CHANGE (or don't) — it is built and pushed and NOT live.** Then
   curl-verify, per the standing #809/#811 lesson that a green merge proves nothing.
2. 👀 **How it feels on her phone.** ⚠️ She almost never sees that screen — the reminder is her own standing
   one: **private browsing, and type `stylestar.app/?notrack`.**
3. ⭐⭐ **HER THREE ASKS, ALL STILL WAITING AND ALL STILL ACCURATE in the entry below: (1) the EMAILABLE
   WISHLIST, (2) WHICH AFFILIATES NEXT, (3) the LOOSE-ENDS SWEEP.**
4. ⚠️ **THE 20 SEPTEMBER PIN** — still the only thing with a real clock. Raise it; do not let it pass.
5. 🆕 **A STALE ROUTINE FOUND THIS SESSION, add it to the loose-ends sweep: `trig_01SZerTsvKoeUYzeT1HX6iWs`
   "Style Star — catalog + bank check-in" fires ONCE on 26 AUGUST carrying an Aug-12 brief.** It will ask her
   about a 6-row jeans catalog (it is 107 products), whether Almira replied (she did) and whether the bank
   account opened (it did). ▶ **Update or delete it before it wakes her with old news.** (The two link-check
   Routines are unchanged; the recommendation to keep Sunday and retire Monday still stands, her call.)

## ▶ PREVIOUS — EARLIER THE SAME DAY (2026-08-21 LATE — ⭐ A STRANGER MEETS A REAL GARMENT NOW)

### ⏸ WHERE THIS SESSION PAUSED (her call: "let's save everything to the claude .md")
**ONE PR, #890, merged and CURL-VERIFIED LIVE on stylestar.app.** Branch resynced to main, tree clean,
everything at `0e0ee9e`. ⚠️ **ONE Netlify build for the whole session** — the renders and the measuring
harnesses were committed WITHOUT touching index.html, so nothing built until she said go.
▶▶ **THE HEADLINE: THE STAR OF THE WEEK IS ON THE DISCOVERY PAGE.** A woman who has never taken the quiz
now meets a real garment, a real photo, a real price and Catherine's own note, right under How It Works.
Her words on the idea: *"could be able to get a peak at the star of the week."*
▶ **AND HER THREE ASKS FOR TOMORROW, in her own order: (1) COMPLETE THE EMAIL WISHLIST, (2) decide WHICH
AFFILIATES TO APPLY TO NEXT, (3) sweep any other LOOSE ENDS.** Each has its own entry below so none of it
has to be re-derived.

### ⭐⭐ THE DISCOVERY-PAGE STAR — her idea, her picks, shipped the same day
Two rounds of renders, her pick at every step: **option C** (the full card, WITH her note) · **photo 96px**
· **card WHITE** to match the Welcome Back change · **gold frame kept** · **tap goes straight to the item**.
- ▶ **THE ARGUMENT THAT PICKED C OVER HER OWN WORD "thumbnail", and it is the reusable half: A AND B SHOW A
  PRODUCT WITH A PRICE, WHICH ANY SHOP DOES. ONLY C CARRIES HER NOTE.** Directly above it a stranger reads
  "Hi, I'm Catherine, I've styled women for over 20 years" — and then, for the first time on that screen,
  watches her actually style something. **That is the Sally differentiation shown instead of claimed.**
  She was offered A as completely defensible on height grounds and chose C anyway.
- ⭐ **PLACEMENT WAS MEASURED, NOT ASSUMED: the block's top lands at y=702 against a ~700px iPhone fold, so
  it costs NOTHING above the fold at any width.** ⚠️⚠️ **STALE AS OF LATER THE SAME DAY — she retired How
  It Works, so the Star now sits at y=560 and DELIBERATELY reaches the first screen. See the entry above.** ▶ **And the reframe that settled her tap worry: the quiz
  CTA sits at y≈390, so a woman who reaches the Star has ALREADY scrolled past the quiz once and not tapped
  it. The Star is not competing with the quiz — it is catching someone already drifting toward the exit.**
- ⭐ **HEIGHT BY PHOTO SIZE, measured: 110px → 407 · 96px → 388 · 84px → 372.** Only 35px separates the
  largest from the smallest, **because the NOTE and the name set this card's height, not the picture** —
  so the size was a pure taste call and she gave up nothing by not going smallest.
- ⭐⭐ **THE CARD REUSES THE `.wks-*` CLASSES LITERALLY and overrides only SIZES.** So the gold leaf gradient,
  the paper, the border, the ink, the pink heart and the black lacquer pill have ONE definition and the two
  Stars can physically never drift on colour or frame — the `.wdr-trend-by` class-reuse pattern again.
- ⭐⭐ **THE LICENSING GATE IS NOW A SHARED `_wkStarPxTag()`, and this is the structural win.** An unapproved
  retailer's photo is refused on BOTH Star surfaces from ONE implementation, and **a future third Star
  surface inherits the rule by calling the helper.** ⚠️ **The suite asserts NEITHER renderer re-derives the
  condition** (`_affMid` must not appear inside either), so the rule cannot be quietly copied and drift.
- 🚨🚨 **THE FINDING THE RENDER HAD TO PROVE, AND IT INVERTS ONE OF HER OWN RULES: the welcome mirror's paper
  is `#FBFAF7`, near-white, so a WHITE card has almost NO value contrast of its own there. THE GOLD LEAF
  FRAME IS THE ONLY THING SEPARATING THE CARD FROM THE PAGE.** ▶ **On this screen the frame is STRUCTURAL,
  not decoration** — the opposite direction from her anti-layered-edge rule, and the same distinction that
  earned the wishlist hairline (DEFINITION, not a second EMPHASIS device). **Written in capitals at the CSS:
  never quieten, flatten or remove it while the card stays white.**
- ⚠️ **DELIBERATELY NO SAVE HEART**, unlike the front door's card: a first-time visitor has no wishlist and
  no context for what a heart would do. Asserted, so it cannot be helpfully added later.
- ⚠️ **`s-wel` CARRIES A PRODUCT LINK FOR THE FIRST TIME, so it carries a disclosure too.** The inventory
  comment at `_shopCard` is updated **NINE places → TEN**. That grep is still the Amazon-sentence edit list.
- ⚠️ **BOTH CALL SITES ARE LOAD-BEARING, and the boot-path lesson repeated exactly:** `fallbackInitialScreen`
  adds `.act` to `s-wel` DIRECTLY without going through `show()`, the same as it does for `s-wb`. **A Star
  wired only into `show()` would never appear on a cold landing** — which is the only way a stranger arrives.

### ⭐ HER TAP QUESTION, ANSWERED — reuse this verbatim, it is a good answer
Her words: *"I wonder if she taps to buy if she would come back in... It feels like it should take her
instantly to the item. But can she find her way back easily?"* **Her instinct was right and the worry was
smaller than she feared. The three facts, in this order:**
1. **SHE DOES NOT LOSE THE APP.** `target="_blank"` opens a **new tab**, so Style Star sits right behind it
   exactly where she left off. Every product link in the app already works this way.
2. ⚠️ **THE REAL RISK IS NOT THE TAB, IT IS iOS.** With the store's app installed, iOS hands the tap to the
   APP — the documented lululemon / Nordstrom Rack universal-links behaviour — and the way back is the small
   **◀ Style Star** breadcrumb. DVF has no app, but the queue rotates through Nordstrom, Amazon, Target and
   Lululemon, which all do. **Apple offers no way to prevent it.**
3. ⭐ **AND THE COMMERCIAL HALF: a stranger who taps out and BUYS pays her, whether or not she returns.**
   That is affiliate doing exactly its job. **A visit that earns $4 and never comes back beats a visit that
   returns nothing.**
▶ **DECIDED: no "come back" nudge on the front door** — clutter for a problem the new tab mostly solves.
**If testers report losing their place, the lever is one quiet line, not a redesign.**

### ⚠️⚠️ THREE MEASUREMENT TRAPS THIS SESSION, ALL REUSABLE, ALL CAUGHT BY TESTS NOT BY EYE
1. 🚨 **AUTO CROSS-AXIS MARGINS DISABLE FLEX STRETCH.** A flex item with `margin:auto` sizes to
   **fit-content** and ignores what its container can spare. At 320 the card's own nowrap header pinned that
   to ~264px and pushed the card **24px past the mirror's content box**. `width:100%` fixes it.
   ▶▶ **AND THE SAME TRAP EXPLAINS A NUMBER THAT HAD BEEN LYING ALL ALONG: `.hm-hiw` renders 236px wide, NOT
   the 298px it states**, because it also carries `margin:auto`. **So How It Works is the WRONG alignment
   reference on that screen.** The suite measures against **`.hm-founder`**, which really does fill the paper.
2. 🚨🚨 **THE LEADING TRAP, THIRD TIME IN THIS FILE AND THE MOST EXPENSIVE ONE HERE.** Her widow fix needed
   `text-wrap:balance`, which **does nothing on inline text**, so the span had to become `display:block` —
   **and that silently TIGHTENED ALL THREE How It Works ROWS BY 6px AND PULLED THE WHOLE PAGE UP 19px.** No
   margin changed anywhere. ▶ **As an inline, the text sat in an ANONYMOUS BLOCK BOX whose line box was
   sized by the PARENT'S INHERITED STRUT (~23px), not by its own 1.45 line-height (~17px).** Going block
   dropped that invisible air. **`margin:3px 0` restores it exactly — rows measure 40px again, identical to
   before, and the Star's top returns to 702 from 703.**
   ▶▶ **THE RULE: WHEN A GAP MOVES AND NO MARGIN DID, SUSPECT LEADING.** (Joins the 2026-08-18 sign-off pair:
   a trailing space and `line-height:normal`.) ⭐ **AND THE SECOND RULE, which is the judgment one: WHEN A FIX
   SHE ASKED FOR CHANGES SPACING SHE DID NOT ASK ABOUT, RESTORE THE SPACING RATHER THAN SHIP THE SIDE
   EFFECT.** She has blessed that screen; a 19px shift was never in scope.
   ⭐ **It was only visible because `discostar` asserts an ABSOLUTE position (the fold). A test measuring
   position is what turned an invisible side effect into a loud failure.**
3. ⚠️ **`getClientRects()` ON A BLOCK ELEMENT RETURNS ONE BOX, not one per line** — so the first line-counting
   harness reported "1 line" for text that was visibly wrapping. **Count lines with a RANGE walk over the
   words, clustering tops within 6px.** (The rect-per-element trap's mirror image.)
- ⚠️ **A HARNESS BUG OF CLAUDE'S OWN, and the tell is worth knowing: eight page loads at ~2.4s each blew a
  2-minute foreground timeout.** Run render sweeps as a BACKGROUND task with a generous `timeout`, never in
  the foreground.

### ✍️ HER WIDOW CATCH — and it was PRE-EXISTING, not caused by the build
Her words on the 320px render: *"the 'you' is all alone on the next line - can that be fixed somehow?"*
- ✅ **Fixed with `text-wrap:balance`, her standing widow lever: at 320 step 2's sub goes `[6,1]` → `[3,4]`.**
  Every other sub at every width is byte-identical; steps 1 and 3 never change at all.
- ⚠️ **THE FONT WAS DELIBERATELY NOT SHRUNK** — readability beats an even list on an 18-80 audience, and
  this is the screen a stranger meets first. Her standing trade, applied again.
- ▶ **Worth telling her plainly: this widow is ON THE LIVE SITE TODAY and always was.** The Star render is
  simply the first time 320px (Display Zoom) got looked at closely. **A new feature's render is a free audit
  of the screen it lands on.**

### ⭐ TEST HYGIENE
- **NEW `scratchpad/discostar.js`, 96 checks.** ⭐ **The ones that matter are the SWEEP pair: the licensing
  gate proven across BOTH Star surfaces** (approved shows · unapproved shows on NEITHER · a `javascript:` px
  url refused · neither renderer re-deriving the condition), plus the frame real at PAINT time with no
  antique gold, the framed edge flush with the paper at 390/375/360/320, AA contrast on the disclosure
  against the REAL painted linen, the pin obeyed, empty queue and bad url leaving no hole, and a returning
  quiz-taker never seeing it.
- **`hiwcheck` 12 → 44**, widened to 390/375/360/320 and pinning exactly what would silently regress: the sub
  never strands a single word · it is block-level · balance is really on · **the restored leading is intact
  (`3px/3px`)** · the row keeps its original 40px.
  ⚠️⚠️ **STALE — `hiwcheck.js` WAS DELETED later the same day when she retired the block it tested. Its
  successor is `scratchpad/discopage.mjs`. See the entry at the top of this file.**
- **`affq` 38 → 40, UPDATED DELIBERATELY:** its outbound-anchor census caught the **11th** JS template exactly
  as designed. ⭐ **The template count is now a named `TEMPLATES` constant** while the Edit total stays
  DERIVED — so an Edit addition never needs a test edit, and a new anchor template still fails loudly.
  ⚠️ affq's documented "results saved" timing flake hit once; clean on rerun, as always.
- **Green at pause:** discostar 96 (new) · hiwcheck 44 · affq 40 · weekstar 39 · starframe 40 · editpx 49 ·
  affwrap 26 · hubs 49 · e2e 29 · nav 82 · menu 87 · copy 41.

### 📬 THE TWO LINK-CHECK ROUTINES — READ AT LAST, and they do DIFFERENT jobs (ninth session, now answered)
Both are firing correctly; she has simply never opened the reports. **They are not duplicates:**
- **`trig_017ShUWoMN8xE12AS3m6tLfr` — Sunday 9:00 AM ET.** Fresh CCR session, runs
  `scripts/check-product-urls.js` against the repo catalog, reports LOOKS OK / NEEDS HER EYE / BROKEN in
  chat, and reminds her to click her Cowork link page alongside. **Push notification only.**
  ⚠️ Its prompt still says "21 products as of setup" — **stale wording, harmless**, since it just runs the
  script against whatever is there (107 now).
- **`trig_01UyHJkk8pFNSxbZMptgtJHY` — Monday 8:00 AM ET.** Reads the CSV from her **Google Drive**, fetches
  every URL itself, and **writes a dated report file back to Drive**. **Push AND email.** It carries its own
  known-bot-wall list and a do-not-cry-wolf rule.
- ▶ **THE HONEST RECOMMENDATION FOR HER LOOSE-ENDS SWEEP: KEEP THE SUNDAY ONE, RETIRE THE MONDAY ONE.**
  Sunday uses the repo script (deterministic, honest about bot walls, no Drive round trip), lands on the
  app's own change day, and is the one whose instrument this file documents. **The Monday one duplicates the
  job through a slower path and is the one that emails her, which is why the unread pile feels heavier than
  it is.** ⚠️ **Her call, not Claude's — put it to her rather than deleting anything.**

### ▶▶ HER ASK #1 FOR TOMORROW — COMPLETE THE EMAILABLE WISHLIST (named a SIXTH time)
Everything needed is already decided and scattered; **collected here so tomorrow is a build, not a re-derive:**
- ⚠️⚠️ **THE CONSTRAINT THAT SHAPES THE WHOLE THING: AMAZON ASSOCIATES BANS AFFILIATE LINKS IN EMAIL.** So the
  email can NEVER carry retailer links. ▶ **It carries ONE link into a shareable wishlist PAGE, and the
  retailer links live there.** ⭐ **That is also the better product: a page stays current as she adds pieces,
  where an email freezes.**
- ⚠️ **TWO DIFFERENT FEATURES, keep them apart:** (a) the long-parked MailerLite desk item **"Email me my
  wishlist"** sends it to HERSELF; (b) **the SHAREABLE registry** sends it to SOMEONE ELSE to buy from.
  ▶ **(b) is the one she keeps asking for** — her words: *"Like how you can share a wedding registry with
  someone."*
- ⭐ **THE FOUNDATION IS ALREADY BUILT: the two wishlist row kinds ARE the registry grammar** — "buy exactly
  this" (her own added links + Edit picks, exact URLs) and "anything like this" (AI-rebuilt searches).
- ⚠️ **THE PRIVACY LINE IS ALREADY DECIDED (2026-08-08): the shared view is the LIST ONLY** — never her
  sizes, never her preferences, never anything personal.
- ▶ **WHAT IT NEEDS THAT DOES NOT EXIST YET: a server-side PUBLIC wishlist page behind a share token.** That
  is genuinely new surface (Supabase + a route), so it is a real build, not a copy edit.
- ▶ **NOTHING BLOCKS DESIGNING IT NOW. Renders first, her pick, as always.**

### ▶▶ HER ASK #2 FOR TOMORROW — WHICH AFFILIATES TO APPLY TO NEXT (the state, so it is not re-derived)
- ✅ **RAKUTEN — publisher APPROVED, SID 4740535.** Advertisers approved: **FARM Rio (MID 44912) · Diane von
  Furstenberg (53590) · Vilebrequin (43322)**. **Shopbop DECLINED** (one advertiser, reapplyable, predicted).
  **Bloomingdale's still PENDING** — ⭐ **and a department-store approval is the trigger for product feeds.**
- ❌ **IMPACT — DECLINED at NETWORK level 2026-08-20**, with **no reasons listed in the email** (a broken
  template, not her mistake). **Support ticket filed; answer due ~27-29 August.** ⚠️ **It gates PHOTOS too —
  Nordstrom is 6 of her 22 Edit items and runs on Impact.**
- ▶ **THE ORDER TO PUT TO HER, unchanged and still right: AWIN next** (⚠️ small **REFUNDABLE** deposit to
  apply — their spam filter, refunded against the first commission; **verify the amount on the day**),
  **then CJ** (free), **then NORDSTROM CREATORS** when her follower count is not the weakest thing she brings,
  **AMAZON LAST**.
- 🚨 **AMAZON'S CLOCK IS THE WHOLE REASON IT IS LAST: 3 qualifying sales within 180 days of APPROVAL, and the
  clock starts at APPROVAL, not at launch.** ⭐ **And her own 2026-08-20 reasoning still holds and is the
  better argument: she is not ready for the clock because search quality is still her blocker, and an Amazon
  approval changes NOTHING a woman can see** (it is one URL parameter; even the product IMAGES sit behind the
  same 3-sale gate via the Product Advertising API).
- 🚨 **ShareASale NO LONGER EXISTS** — Awin closed it end of 2025. Any entry naming it is stale.
- ⭐ **THE REFRAME WORTH REPEATING TO HER: every advertiser approval is a DOUBLE unlock — the link EARNS and
  the photo becomes LICENSED.** That is why applying broadly is worth an evening even with small traffic.

### ▶ HER ASK #3 — THE LOOSE ENDS, gathered
1. ⚠️⚠️ **THE PIN, AND IT IS THE ONLY THING WITH A REAL CLOCK: the cover-up dress reaches Star of the Week
   ONLY IF SHE UNPINS BEFORE 20 SEPTEMBER.** After that it waits for the 18-week cycle — **24 January 2027**.
   ▶ **`WEEK_STAR_PIN` back to `null` is the whole change.** ⚠️ **And ASK her whether she wants the queue
   reordered at that moment** — it is 18 items now, so the week-to-item mapping has shifted again.
2. ⚖️ **ALMIRA — she SENT the reply and there is still NO ANSWER.** Two live questions: **is $900 the FULL
   cost or the USPTO's share only**, and **what a specimen must look like for CLASS 045**. ▶ **045 has real
   work behind it and a 2027 deadline** (her styling services still run under the sole proprietorship).
   Also watch for the Statement of Correction being MAILED and ACCEPTED by the state.
3. 📊 **Rakuten** — the ~$3.96 DVF commission should move from PENDING to confirmed once the return window
   closes. ⭐ **Worth telling her plainly: the chain is proven, so from here the only variable is TRAFFIC.**
4. 📬 **Impact's support answer, due ~27-29 August.**
5. 🔎 **The LINKS ▾ menu in Rakuten** — bulk feed export or FTP? ⚠️ **And the LINK BUILDER's creative**, the
   properly-licensed image source. ⭐ **Also still unoffered and free: browsing an advertiser's product links
   in her dashboard is a REAL WORKFLOW UPGRADE TODAY, no build at all** — she picks Edit pieces from a
   browsable catalog with photos and prices instead of hunting the retailer's site.
6. 📱 **Her search-quality verdict** — still the one blocker on testers, and testers release the pin AND
   produce the next real sale.
7. ⭐ **Her other two parked ideas:** the NEW SHAREABLE and her NEXT INSTAGRAM POST.
8. 💳 **The recurring-payments switch** — a Routine fires **28 August** with the full list (Claude Max,
   Anthropic API credits, Netlify, the domain, MailerLite). Her cards have arrived.

### ▶ THE FIRST THINGS NEXT SESSION
1. ⭐⭐ **THE EMAILABLE WISHLIST — her #1, and everything it needs is in the entry above.** Renders first.
2. ⭐ **THE AFFILIATE CONVERSATION — her #2.** AWIN then CJ; the state is in the entry above so nothing needs
   re-deriving. ⚠️ Verify AWIN's deposit amount on the day.
3. ▶ **THE LOOSE-ENDS SWEEP — her #3**, incl. **her call on retiring one of the two link-check Routines**.
4. ⚠️ **THE 20 SEPTEMBER PIN.** Raise it; do not let it pass silently.
5. 👀 **How the Discovery Star feels on her phone.** ⚠️ **She almost never sees that screen** — the reminder
   to give her is her own standing one: **private browsing, and type `stylestar.app/?notrack`.**

## ▶ PREVIOUS — EARLIER THE SAME DAY (2026-08-21 — 💰 STYLE STAR HAS EARNED ITS FIRST MONEY)

### ⏸ WHERE THIS SESSION PAUSED (her call: "yes let's save everything to the .md")
**THREE PRs merged and ALL CURL-VERIFIED LIVE: #886 · #887 · #888.** Branch resynced to main, tree clean,
everything at `fc0d561`. ⚠️ **Three Netlify builds.**
▶▶ **THE HEADLINE, AND IT CLOSES THE THING OPEN SINCE THE PLUMBING WENT IN: THE MONEY CHAIN IS PROVEN END TO
END. Her mother saw the DVF scarf on the front door, tapped Shop it IN THE APP, bought it — and the sale
appeared in Rakuten Reports.** Click → sale → commission, on a real purchase through the live app.
Her words on the frame: *"the frame looks good live."*
▶ **AND HER NEW IDEA, THE FIRST THING TO PICK UP: the STAR OF THE WEEK on the DISCOVERY page, for a woman
who has not taken the quiz yet.** See its own entry below — it is not built, and it is a good instinct.

### 💰💰 THE MONEY CHAIN IS CLOSED — and how to read it next time
**3 clicks in Rakuten, then the sale.** ▶ **THE SPLIT THAT MATTERS AND IS WORTH REUSING WHENEVER SHE PANICS
ABOUT A DASHBOARD: CLICKS ARE LOGGED BY RAKUTEN'S OWN SERVER, so they appear INSTANTLY. A SALE has to come
the other way — the advertiser reports the transaction back to the network, batched on THEIR schedule, so
24-48h is normal.** Clicks-but-no-sales on the same day is the expected shape, not a fault.
- ⚠️ **The commission sits PENDING until DVF's return window closes.** ~$3.96 (2% of $198).
- ⚠️ **SHE WAS TOLD, AND SHE ALREADY KNEW: do not test this herself, and her husband must not either.**
  Her words: *"I told my husband he can't buy anything!"* ▶ **Her mother is a separate household, which is
  a different thing from self-referral — but the authoritative text is her RAKUTEN PUBLISHER AGREEMENT,
  READ WHILE LOGGED IN** (her own standing rule). Not answered here.
- ▶ **THE NEXT REAL SIGNAL SHOULD COME FROM SOMEONE UNRELATED TO HER**, which means testers, which means
  her search-quality verdict. Same gate as always.

### ⭐⭐ THE GOLD LEAF FRAME — her pick "E", and TWO rules came out of it
Her parked item from 08-20 night, built after **two rounds of renders**. Her first-round verdict killed all
four options: *"I am not liking any of these."* The two things she said next are the keepers.
- 🚨⭐ **1. THE WIDTH WAS A REAL BUG AND SHE SPOTTED IT BY EYE.** Her words: *"I would like for it to be the
  exact width of the other cards on the page rather than a hair more narrow."* **MEASURED: both mirrors run
  16→374; the Star card ran 30→360.** Inset 14px a side, **28px narrower than everything else on the front
  door.** `#wbStar`'s margin is now **7px, exactly the frame's own thickness**, so the framed OUTER edge
  lands on 16/374. ⚠️⚠️ **IF THE FRAME THICKNESS EVER CHANGES, THAT MARGIN CHANGES WITH IT** or the
  alignment silently breaks — written at the code, asserted at 390/375/360/320.
  ⭐ **AND THE FIX PAID FOR ITSELF: a wider card wraps her note in TWO lines instead of three, so Save's
  bottom moved 697 → 673. The frame is free AND the fold is 24px better than before it.**
- 🚨⭐⭐ **2. THE GOLD WENT BROWN, AND THE REASON GENERALISES.** Her words: *"I don't like how the gold looks
  - a bit orange or brown."* Round one used `#CFA02E` and `#8a6a14` — **the antique-gold trap already
  documented in this file, walked into anyway.** ▶▶ **THE RULE, and it is the reusable half: A FLAT
  MID-GOLD AT FRAME SCALE ALWAYS READS BROWN. A HIGHLIGHT-TO-SHADOW RAMP IS WHAT READS AS METAL.** That is
  why her marquee bulbs look like gold and a flat band looks like paint. The frame is the **wb-chip's own
  gradient** (`#FEEF98 → #F6CE3E → #E4B02E → #F3DC8B`), the brightest gold already on that screen.
  **The suite FAILS if an antique gold appears in it or if the gradient is flattened.**
- ⚠️ **MECHANICS, all three worth keeping:**
  1. **A gradient cannot be a box-shadow**, so the frame is an absolutely positioned **`::before` at
     `inset:-7px`** — still **zero height cost**, which is what made it affordable on the front door.
  2. 🚨 **A NEGATIVE z-index CHILD PAINTS *ABOVE* ITS OWN STACKING CONTEXT'S BACKGROUND.** Putting
     `z-index:0` on `.wks-card` made the gradient **cover the white paper**. **The context belongs on the
     PARENT (`#wbStar`).** Two failed attempts before this landed.
  3. ⚠️ **The ring spreads 7px BELOW the card onto `.wks-disc`, its own next sibling** — measured gap
     **exactly 0** at every width. The disclosure sits at 14px now.
- ⚠️ **RENDER-HARNESS TRAP, new and it made the first comparison worthless: the greeting quote ROTATES
  through six messages of different heights** (`WB_MSGS`), so five renders of the same screen are not
  comparable between runs. **Pin it to `WB_MSGS[0]`.**
- ⚠️ **A HARNESS BUG OF CLAUDE'S OWN THAT HUNG FOR 5 MINUTES: `new Promise(r=>srv.listen(0))` never
  resolves** — the resolve must be the listen CALLBACK, `srv.listen(0,r)`. The tell was a live node process
  with no chromium beside it.
- **New `scratchpad/starframe.js`, 40 checks** — the framed edge flush with BOTH mirrors at four widths, the
  gradient real at PAINT time, no antique gold, the stacking context on the parent, the disclosure clear,
  Shop it and Save above a real 700px fold.

### 🚨⭐⭐ VILEBREQUIN: APPROVED, ADDED, AND REMOVED THE SAME DAY — and the removal is the keeper
Her third Rakuten advertiser (**MID 43322**, joined 2026-08-20). ▶ **A DOUBLE UNLOCK, as expected: the link
earns AND the photo is licensed by the same approval.** It went into the store table with her own scores,
and **came back out an hour later on her own testing.** That sequence is the valuable part.
- ▶▶ **THE RULE THIS SETTLES, AND IT IS A NEW FAILURE CLASS — THE FOURTH: `deep` ASSUMES A STORE'S SEARCH
  WORKS AND IS MERELY SHALLOW. WHEN A STORE'S SEARCH *LIES*, KEEP THE BRAND FOR CURATION (Edit, Star of the
  Week) AND OUT OF THE SEARCHABLE TABLE.** Tuckernuck padded a thin page with a perfume — survivable, and a
  tighter `c:` line fixes it. **Vilebrequin's search told her they DO NOT CARRY COVER-UP DRESSES WHEN THEY
  DO.** That tells a woman "they don't have it" when they do, and **no prompt rule of ours can reach it.**
- **HER EVIDENCE, in increasing order of seriousness:** their entire women's range is **~179 pieces (95 swim
  + 84 clothing)** · `womens linen shirt` **works** (⭐ so the womens keyword is PROVEN GOOD here, unlike
  Abercrombie) **but returns ELEVEN results** · and the false negative above.
- ⚠️ **THEIR SITE HAS NO GENDER FILTER ON SEARCH AT ALL.** Refinement attributes are size, motif, collection
  and sub-category; **gender is expressed as a CATEGORY (`cgid`)**. ▶ **That is why every URL she sent was a
  category page — she was sending the only thing their site offers, and Claude asked three times for
  something that does not exist.** The `cgid=women` parameter Claude proposed is **ignored** (her test
  returned MEN'S). ⚠️ **Their search also DEFAULTS TO MEN'S for an ambiguous term** — they are a men's-swim
  house historically.
- 🚨🚨 **THE ASYMMETRY THIS CREATES IS DELIBERATE, INVISIBLE AND FRAGILE — DO NOT "TIDY" IT.** Vilebrequin
  stays in **`_AFF_MID`** (so its Edit item and Star entry still EARN) while being absent from **`STORES`**
  and **`SEARCH_DOMAINS`**. ▶ **That works only because `_affUrl` matches by HOSTNAME, never by store key** —
  the 08-20 design decision paying off. **A future tidy-up that "aligns" `_AFF_MID` with `STORES` would
  silently stop her being paid on every Vilebrequin tap, with nothing on screen looking any different.**
  ⭐ **`affwrap` now asserts exactly that: an approved advertiser that is NOT in the store table still earns.**
- ▶ **HER SCORES ARE KEPT VERBATIM in the comment where the entry used to sit**, so re-adding is one line if
  their catalog grows: `d:[9,6,7,8,6,8,5,5,3,10]` · `$$$$` · Coastal Chic, Playful Chic · `s:[]` ·
  `deep:'swimwear and resortwear'` · `w:1`. **Nine of the ten dimensions are hers verbatim; alluring 6 is
  hers too**, set against her own anchors after she was shown them (the DVF pattern, second time).
  ⚠️ **`s:[]` IS HER FACT, NOT A GAP:** *"xxs-XXL is their sizing no petites or tall."*
- ⚠️ **AND THE NONSENSE-WORD CONTROL EARNED ITS KEEP A THIRD TIME:** four candidate search URLs probed from
  the sandbox all returned a page **byte-identical to gibberish**. Their search renders client-side, so
  **every number measurable from here was worthless and her address bar was the only instrument.**

### ⭐ THE COVER-UP IS IN THE EDIT AND THE STAR QUEUE — and she refined her own content rule to allow it
**"Vilebrequin Long Mesh Cover-Up Dress — Off White", $405, the 22nd Edit item, with the 4th photo.**
- ⭐⭐ **HER RULE, REFINED BY HER, AND IT IS NARROWER THAN IT WAS: the bar for Star of the Week is BIKINI OR
  LINGERIE, NOT THE SWIM CATEGORY.** Her words: *"Even though it is a swim-wear type item, this can go on
  Star of the Week because it is not a bikini or lingerie. It is see-through, but tasteful enough that I
  deem it ok to go on the welcome back page."* ▶ **So a cover-up, a kaftan or a resort dress MAY be the
  Star; a bikini, a swimsuit or anything intimates may not.** ⚠️ The suite's own regex already encoded
  exactly that line, so it needed no change — **do NOT add 'cover-up' or 'mesh' to it.**
- ✅ **VERIFIED BEFORE ADDING, per the standing rules:** 200 · real product name "Women Long Mesh Dress" ·
  **$405 is the REGULAR price** (pricebook `US-USD-RET`, `priceRanges` min = max, no sale price anywhere —
  her evergreen rule) · XS-L orderable, XL out.
- ⚠️ **THE NAME ON THE CARD IS HERS, NOT THE RETAILER'S:** *"they call this Women Long Mesh Dress but I would
  call it Long Mesh Cover-up Dress."* Her word is the more useful one and this is her Edit.
- ⭐ **THE PHOTO IS 4:5 AGAINST OUR 3:4 FRAME, WHICH IS LUCKY: the crop takes 6% off the SIDES and keeps FULL
  HEIGHT**, so a long dress stays full length. **The FARM Rio knee-cut lesson applied before it could bite.**
  ⚠️ Demandware sizing is `?sw=800` (their equivalent of Shopify's `&width=800`).
- ⭐ **THE QUEUE MOVE, her call:** *"Definitely want the cover up dress to come into star of the week before
  December. closer to summer would be best."* ▶ **It SWAPS with the MZ Wallace tote rather than being
  inserted** — inserting would shift all thirteen items below it a week later and **quietly move her claw
  clip and her scarf off the Thanksgiving-weekend slots she chose on purpose.** The tote is the one genuinely
  seasonless piece (a carry-on travel bag) and December is holiday-travel season. **Cover-up Dec 6 → Sep 20 ·
  tote Sep 20 → Dec 6 · every other item exactly where she put it.** Her verdict: *"all good."*
- ⚠️⚠️ **THE PIN GOVERNS THIS AND IT IS WORTH SAYING AGAIN: the week is computed from the ACTUAL DATE, not
  from where the rotation left off. So the cover-up only appears if she UNPINS BEFORE 20 SEPTEMBER** — after
  that it waits for the 18-week cycle (24 January 2027). ▶ **If testers slip past mid-September, either move
  it again or pin it to the cover-up for its first week. RAISE THIS, don't let it pass silently.**

### ⭐⭐ TEST DISCIPLINE: THE DERIVED-COUNT LESSON, PAID FOR AND THEN IMMEDIATELY REPAID
**Eleven assertions across six suites failed on arrival this session and EVERY ONE was a restated count, not
a regression.** Rather than find-and-replacing numbers again (the 2026-08-03 lesson about THREE different
arithmetics), they were made **DERIVED**:
- **`editpx`** — the licensing sweep now asserts a **RELATIONSHIP** ("every photo sits on an approved
  retailer, and there is at least one") instead of "exactly 3"; the wrap count is **computed from how many
  items have an approved host**; item counts read from the page.
- **`weekstar` / `affwrap`** — queue length and the advertiser list assert **SHAPE** (non-empty, well-formed,
  bare host → numeric MID) rather than a number. The individual MIDs stay pinned so a bad edit is loud.
- **`searchchat` / `cowork3`** — `SRV_N` is read straight out of `style-ai.js`, **including the pruned-list
  arithmetic** (`SRV_N-1` after one blocked store, `SRV_N-3` once the memo holds three). ⚠️ **Those two are
  exactly what a blind find-replace broke in August.**
- ⭐⭐ **`searchtune`'s restated total was replaced by THE STANDING RULE IT SHOULD ALWAYS HAVE BEEN TESTING:
  STORES and SEARCH_DOMAINS must agree.** Derived from both files. **A store added to one but not the other
  is a store the stylist's search cannot see inside, and nothing anywhere complained before.**
- ⚠️ **`storedepth` KEEPS ITS HARDCODED TOTAL, DELIBERATELY** — its own comment says its whole job is to
  notice a store quietly appearing or vanishing, so it is the ONE place that SHOULD fail when the table
  changes. **Bump it by hand; never find-and-replace it.**
- ▶▶ **AND THE PAYOFF WAS IMMEDIATE AND IS THE ARGUMENT FOR EVER DOING THIS: when Vilebrequin came back OUT
  an hour later, 102 → 101, the derived suites absorbed it with ZERO EDITS. Only storedepth needed touching.**
- **Suites at pause, all green:** **starframe 40 (new)** · editpx 49 · weekstar 39 · affwrap 26 ·
  storedepth 19 · searchtune 70 · searchchat 57 · cowork3 69.

### ▶▶ HER NEW IDEA, RAISED AT THE PAUSE AND NOT BUILT — THE STAR OF THE WEEK ON THE DISCOVERY PAGE
Her words: *"I am wondering if the Discovery page - for first time users, before she even takes the quiz -
could be able to get a peak at the star of the week - maybe even a thumbnail version or something eye
catching?"*
- ▶ **THIS IS A GOOD INSTINCT AND IT FIXES A REAL GAP, the same shape as the A2HS one she already fixed:
  the Star card is WELCOME-BACK-ONLY, so a first-time visitor never sees it at all.**
- ⭐⭐ **THE ARGUMENT FOR IT, and it is the Sally north star made concrete: everything a stranger currently
  sees on `s-wel` is a PROMISE** — the tagline, the founder line, How It Works 1-2-3. **The Star of the Week
  is the only piece of REAL PRODUCT on the whole app: a real garment, a real photo, a real price, chosen
  this week by a real stylist.** It is the difference between *claiming* a person is behind this and
  *showing* it. It also proves the app is ALIVE (something changed this week), which nothing else on that
  screen does.
- ⚠️ **THE TENSIONS TO WEIGH WITH HER, none fatal:** (1) **the welcome screen's first job is the QUIZ** — a
  product card competing with "Take our fun style quiz" could cost conversions, so placement probably sits
  AFTER How It Works, not before; (2) **HEIGHT** — that screen already carries hero + tagline + founder line
  + How It Works + restore, so measure against the fold before choosing full-card vs her thumbnail idea;
  (3) **the photo is gated on `_affMid()`** and inherits that automatically, so nothing new is owed there.
- ▶ **RENDERS FIRST, HER PICK, as always** — full card vs thumbnail row vs a teaser strip. **Her own word was
  "thumbnail", so lead with that.**

### ▶ THE FIRST THINGS NEXT SESSION
1. ⭐ **HER DISCOVERY-PAGE STAR IDEA** — the entry above. Renders first.
2. ⚖️ **ALMIRA — she SENT the reply and has had NO ANSWER YET.** The two live questions: **is $900 the FULL
   cost or the USPTO's share only**, and **what must a specimen look like for CLASS 045**. ▶ **045 is the
   one with real work behind it and a 2027 deadline.** Also watch for the Statement of Correction being
   MAILED and ACCEPTED by the state.
3. 📊 **Rakuten again in a few days** — the commission should move from PENDING to confirmed once DVF's
   return window closes. ⭐ **And it is worth telling her plainly: the chain is proven, so from here the
   only variable is TRAFFIC.**
4. 📬 **Impact's support answer, due ~27-29 August.** ⚠️ It gates photos too — Nordstrom is 6 of her 22 Edit
   items and runs on Impact.
5. 🔎 **The LINKS ▾ menu in Rakuten — bulk feed export or FTP?** ⚠️ **And the LINK BUILDER's creative**, which
   is the properly-licensed image source. ⭐ **Also worth offering: browsing an advertiser's product links in
   the dashboard is a REAL WORKFLOW UPGRADE FOR HER TODAY, with no build at all** — she picks Edit pieces
   from a browsable catalog with photos and prices instead of hunting the retailer's website.
6. ⭐ **PRODUCT FEEDS — her question this session was excellent and the answer should be reused verbatim:**
   *"once we had affiliate link approval that meant the app could have full access to their info and
   inventory?"* ▶ **SHE IS RIGHT THAT APPROVAL GIVES HER THE DATA. The app simply does not READ it yet.**
   `docs/product-feeds-plan.md` is shovel-ready. ⚠️ **BUT THE HONEST TIMING ANSWER HELD: feeds from DVF,
   FARM Rio and Vilebrequin would NOT fix her search-quality complaint, because her frustration is with the
   BROAD asks (a work dress, a white top, jeans) and three resort/designer brands carry none of that.**
   ▶ **A DEPARTMENT STORE APPROVAL IS THE TRIGGER — Bloomingdale's is still pending.**
7. 📱 **Her search-quality verdict** — still the one blocker on testers, and testers are what release the pin
   AND produce the next real sale.
8. ⭐ **Her three parked ideas, all needing nobody else:** the NEW SHAREABLE, her NEXT INSTAGRAM POST, and the
   EMAILABLE WISHLIST (named a fifth time).
9. ⚠️ **The two link-check Routines are STILL unread, eighth session running.**

## ▶ PREVIOUS — 2026-08-20 NIGHT (📸 THE EDIT HAS PHOTOS, AND THE LICENSING RULE IS THE KEEPER)

### ⏸ WHERE THIS SESSION PAUSED (her call: "let's save everything to the .md for now... I just got a reply from almira")
**THREE PRs merged and ALL CURL-VERIFIED LIVE: #881 · #882 · #883.** Branch resynced to main, tree clean,
everything at the #883 merge. ⚠️ **Three Netlify builds.**
▶▶ **THE HEADLINE: STYLE STAR HAS PRODUCT PHOTOS FOR THE FIRST TIME.** Her two DVF pieces and the FARM Rio
dress carry real photography on the Edit, and **her scarf is the Star of the Week on the front door with its
photo, on a white card.** Her words: *"I love seeing photos on the Edit... just having something up there
makes me happy, for now."*
▶ **AND THE FIRST THING TO ASK: SHE HAS A REPLY FROM ALMIRA and was opening a new session to bring it.**
Ask for it before anything else.

### 🚨🚨 THE RULE OF THE DAY, AND IT IS THE MOST REUSABLE THING HERE: A PHOTO IS LICENSED BY AN AFFILIATE APPROVAL
**Her question stopped the build and she was RIGHT to ask it:** *"I am confused about photo usage. I thought
it was not legal to use product photos? I thought from the beginning of when we built the Edit we purposefully
didn't put any photos on there because we didn't have any legal affiliate approval to do so?"* **Her memory was
correct and her original instinct was correct.**
- ▶ **THE ANSWER, and it should be given in exactly this shape whenever photos come up again: a product photo
  is the RETAILER'S COPYRIGHTED WORK. What licenses it is an AFFILIATE APPROVAL with that retailer — NEVER the
  fact that we link to the piece, and NEVER the fact that the image is technically fetchable.** An affiliate
  programme grants a limited, revocable licence to its creative assets for the purpose of promoting them; that
  is why affiliate sites carry product photos at all. It generally covers assets served THROUGH the network
  (the feed, the link builder, the banner library) and does NOT cover scraping the retailer's website.
- ⚠️⚠️ **THE TRAP, MEASURED, AND IT IS WHY THE RULE HAD TO GO INTO CODE: TECHNICAL ACCESS AND LEGAL PERMISSION
  ARE ALMOST UNRELATED.** All 21 Edit items were swept for an `og:image`. **7 of 21 gave one up.** But four of
  those seven are **Zappos, Target, Sexy Little Robe and Baby Gold — stores she has NO relationship with.**
  Meanwhile Nordstrom (which holds **6** of her items) serves **250KB of JavaScript shell with ZERO `og:` tags**
  and Amazon returned a **3.7KB bot-block page**. ▶ **So "I can grab it" never means "I may use it."**
- ▶ **THE REAL COUNT IS 3 OF 21:** the two DVF pieces + the FARM Rio dress, because `_AFF_MID` holds exactly
  two advertisers. Everything else is Nordstrom ×6 · Bloomingdale's ×2 (pending) · Amazon ×2 · Zappos ·
  Express · Athleta · Target · lululemon · Everything But Water · Sexy Little Robe · Baby Gold.
- ⭐⭐ **SO IT IS A GUARANTEE IN CODE, NOT A NOTE — the `filterNeverWear` / `_nameParity` / affwrap-sweep
  pattern, applied again:** `scratchpad/editpx.js` renders the real Edit and **asserts ZERO photos on an
  unapproved retailer**, and the Star card's photo is **gated on `_affMid()` itself** — the very function that
  decides whether a link earns. ▶ **ONE SOURCE OF TRUTH: IF THE LINK CANNOT EARN, THE PHOTO IS NOT OURS TO
  SHOW.** A future Star given a `px:` url for an unapproved store silently shows no photo rather than a
  liability. **Written in capitals at the CSS: GREP _AFF_MID BEFORE ADDING ONE.**
- ⚠️ **CLAUDE GOT THIS WRONG FIRST AND SHE CAUGHT IT.** The advice offered was "paste an image URL per item"
  for the fourteen we cannot fetch — **bad advice**, because those are exactly the stores with no licence.
  Corrected to her plainly. ▶ **Weigh any future "just add photos" suggestion against the approval list first.**
- ▶ **NOT LEGAL ADVICE, AND SHE WAS TOLD SO: the authoritative text is her RAKUTEN PUBLISHER AGREEMENT, READ
  WHILE LOGGED IN** (her own standing rule, the one the advertiser-directory error taught), **and it is worth
  a line to Almira** since she is already engaged. ⚠️ **The cleanest version pulls creative from Rakuten's
  LINK BUILDER rather than the product page — worth adding to the support ticket already open.**
- ⭐ **THE REFRAME THAT LANDED, and it is true: advertiser approvals are not just commission, they are the
  VISUAL GLOW-UP.** Every approval converts its items from text cards to photo cards. That is her own Path A /
  Path B conversation made concrete. ⚠️ **And the dependency is worth naming: SIX of her 21 items are
  NORDSTROM, which runs on IMPACT — the network that declined her, ticket still open.**

### ⭐⭐ THE PHOTO CARD IS "A3 WITH THE 3:4" — her pick from four rendered options
**INSET AND FRAMED, not full-bleed**, so the photo respects the card's own border, which is the display-case
language the rest of the app already speaks. **3:4** because a **SQUARE crop cuts a full-length maxi off at the
knee** (measured on her own FARM Rio dress) and **a card headed "Maxi Dress" must not show a midi.**
- 🚨⭐ **PHOTOS BESIDE THE TEXT WERE RENDERED AND REJECTED ON MEASUREMENT, NOT TASTE, and the finding
  generalises: HER ITEM NAMES RUN 46-60 CHARS AND ALREADY WRAP 3-4 LINES AT FULL WIDTH.** Take 96-118px away
  for a photo column and "FARM Rio Pink Garden Terrace 3D One-Shoulder Maxi Dress" becomes **SEVEN LINES**, the
  Shop button wraps to three, and the note clips. ▶ **A photo can sit ABOVE this card's content, never beside
  it.** Don't re-propose a thumbnail layout.
- **Heights measured across three cards:** current 1308px · **A3 2217** · square 2116 · full-bleed 3:4 2392.
- ⚠️ **Images HOTLINK from the retailer CDN over https** (`?v=...&width=800` on Shopify) with
  **`onerror="this.remove()"`**, so a dead url degrades to exactly today's text card instead of painting a
  broken-image icon. ⚠️ **`http://` would be blocked as MIXED CONTENT — the og:image comes back http, always
  upgrade it.**
- ⭐ **AND THE WORRY CLAUDE RAISED WAS WRONG, said plainly to her: 3 photo cards among 18 text cards DOES NOT
  look broken.** The seam was rendered (kitten heel into the scarf) and it reads as *the newer pieces have
  photos*. **She was right to push ahead.** Her words: *"I know it's not ideal for consistency, but just having
  something up there makes me happy, for now."*

### ⭐ THE STAR OF THE WEEK IS PINNED TO HER SCARF — and she reaffirmed it at the pause
Her ask: hold the DVF scarf **until she is ready to invite testers / launch**, then resume the Sunday rotation.
- ▶▶ **`WEEK_STAR_PIN` DOES IT. TO RESUME: SET IT BACK TO `null`. Nothing else to change.** There is **no timer
  and nothing that can expire it** — it holds until someone edits that one line. Told to her that way.
- ⭐ **PINNED BY NAME, NOT BY INDEX, and the reason generalises: her queue gets REORDERED FOR SEASON** (the
  2026-08-14 pass moved four items), **so an index would silently start pointing at a different piece.** A pin
  naming an item no longer in the queue **falls through to the rotation** rather than blanking the front door.
- **The scarf joined the queue, 16 → 17**, with her Edit note condensed to a one-liner in her own words
  ("This is the definition of wearable art. 100% silk, and the floral print is stunning.") per the 2026-08-14
  rule — only her words, nothing invented.
- ⚠️⚠️ **AT THE MOMENT SHE UNPINS: THE QUEUE IS 17 NOW, NOT 16, so the week-to-item mapping has SHIFTED**
  (week mod 17). ▶ **ASK HER whether she wants it reordered rather than guessing** — the queue order is her
  seasonal calendar.

### ⭐ THE STAR CARD: HER PHOTO AT 140px, AND SHE MADE IT WHITE
Her ask: *"yes definitely I want it to feature the photo there please"*, then *"I would like for the background
to be white, like on the edit page, instead of that cream color."*
- ⭐⭐ **THE SIZE WAS MEASURED AGAINST A DRAWN IPHONE FOLD, and that is the reusable move: the Star card is the
  FRONT DOOR, so height is more precious there than anywhere.** Baseline: card 212px, whisper ends 604px, fold
  ~700px — about **96px of headroom**. A full-width photo is **395px tall** and pushes the whisper and the SHOP
  awning well below the fold, which fights her own stated value for that screen (*"I don't want her to miss a
  thing"*). **At 190px the fold cut through her note and dropped Shop it below it. At 140px the WHOLE card
  clears: label, photo, name, price, note, Shop it AND Save.** Two assertions pin it.
- **`.wks-card` cream `#FBF6E9` → `#fff`**, matching `.dc-item` on the Edit. ⭐ **It also matches the marquee
  mirror directly above it, so the top of the front door now reads as ONE material instead of two.**
- ✅ **weekstar's contrast checks read the COMPUTED background, not a hardcoded colour, so they followed the
  change on their own** — the derived-not-restated lesson paying off again.

### ✅ THE TWO NEW EDIT ITEMS + THE SCARF'S "100% SILK" (#881)
- **DVF Jeanne Silk Jersey Wrap Dress $678** · **FARM Rio Pink Garden Terrace 3D One-Shoulder Maxi Dress $360**.
  Both verified BEFORE adding: 200, in stock, real product names matching hers, and **FARM Rio's
  `compare_at_price` is null so $360 is the REGULAR price, not a sale** (her standing evergreen rule).
- ⚠️ **THE DVF DRESS DELIBERATELY CARRIES NO COLOUR SUFFIX**, against the usual convention, for two reasons:
  **her note is ABOUT the colour range** ("comes in lots of colors. My favorites are the green and the chain
  link black"), so pinning one colourway fights the note; and **measured**, the suffix ran the name to 4/5/6
  lines at 390/360/320 — the tallest in the Edit — against 3/4/5 without.
- **The scarf's note now reads "...wearable art. 100% silk, and the floral print is stunning."** — leading with
  the fabric matches her own two existing notes that open "100% linen gives high vibes!" and "100% silk".
- ⭐ **Both new hosts were ALREADY in `_AFF_MID`, so both pieces earned from the moment they went live** with
  no plumbing change.

### ⚠️ SESSION LESSONS
- 🚨 **A JS ARRAY'S LAST ENTRY HAS NO TRAILING COMMA, so appending to it produces `}{` and a syntax error that
  takes out THE WHOLE SCRIPT BLOCK.** Cost one broken build. ▶ **The diagnostic that found it in one step:
  parse `git show HEAD:index.html` AND the working tree and compare** — proving the failure is yours before
  hunting for it. (A line-by-line bisect is USELESS here: it cuts multi-line string concatenations and blames
  innocent code — it fingered the Instagram footer, live and untouched for weeks.)
- 🚨 **AN IDEMPOTENCY GUARD MUST MATCH SOMETHING UNIQUE.** The patch script skipped adding the Star's photo url
  because it guarded on the substring `'px:'`, which occurs elsewhere in the file — **so the card would have
  shipped with no photo at all.** ▶ **Found only by CHECKING THE EDIT LANDED rather than trusting the script's
  own edit count.** Always grep for the new content afterwards.
- ⚠️ **"A test that fails on a correct value is usually a broken harness" — proven again:** the new suite's
  no-intimates check matched **"bra" inside "Lucky Brand"**. Word-boundary it. (weekstar's own copy already
  did, which is why only the new one failed.)
- 🚨 **THIS SANDBOX'S CHROMIUM CANNOT REACH RETAIL CDNs** (the same wall as fonts.googleapis.com), so an
  in-browser image-load check **hangs forever** if the promise has no timeout. ▶ **The suite now RACES the load
  against a 4s timeout and SKIPS HONESTLY, saying so**; reachability is proven by `curl` instead. **For
  RENDERS, intercept `**/cdn/shop/**` and serve local copies** — the real urls are curl-proven 200.
- ⚠️ **`sleep` chained after a command is blocked by the harness** — use a background task or an until-loop.
- ⚠️ **SendUserFile can return a 503; a straight retry worked.**

### ✅ TEST HYGIENE
- **NEW `scratchpad/editpx.js`, 48 checks** — ⭐ the licensing SWEEP (zero photos on an unapproved retailer),
  the gate both ways (swap the pinned Star's url to Nordstrom → no photo; swap back → photo), the pin holding
  across 52 weeks, rotation resuming across all 17 when unpinned, the affiliate wrap still reaching all three
  links, photo boxes measured 3:4 + inset + above the name, **Shop it and Save proven above a real 390×844
  fold**, no overflow 390/360/320, zero JS errors.
- **weekstar 35 → 39, THREE ASSERTIONS UPDATED DELIBERATELY:** the queue count 16 → 17 · **the Star's link is
  affiliate-wrapped now (#879), so the assertion became STRONGER — unwrap `murl` and require the exact product
  url, so a wrap can never quietly change where the tap lands** · rotation arithmetic measured with the pin
  cleared and restored. ⭐ **And the wrap-around date now DERIVES from queue length instead of restating it** —
  the `curated.js` lesson, so it never needs editing again.
- **affwrap 23 · affq 40 · e2e 29 · hubs 49** green. ⚠️ affq's documented "results saved" timing flake hit
  once, clean on rerun.

### ⚖️⚖️ ALMIRA ANSWERED THE STATEMENT-OF-USE QUESTIONS — AND ONE ANSWER CREATES REAL WORK
Her reply arrived the same night, three points, all logged:
1. ✅ **The signed Statement of Correction is received and escalated for the team to MAIL to the state.**
   ⚠️ **No date given.** ▶ The drafted reply asks her to confirm once it is mailed AND accepted, so it cannot
   quietly sit (the pattern this file already documents).
2. **NOTICE OF ALLOWANCE EXPECTED IN ~7-14 MONTHS**, i.e. roughly **March to October 2027**, then the Statement
   of Use follows. **USPTO fee $150 per class, per application = $900 total.**
   ✅ **THE ARITHMETIC CHECKS OUT: $150 × 3 classes × 2 marks = $900.** ⭐ **Her own divide-the-lump-sum-by-the-
   unit-price habit ran again and this time it CLEARS** — worth telling her, since the same check found $700
   missing in July.
   ⚠️⚠️ **BUT NOTICE WHAT THE EMAIL DOES NOT SAY: her wording is "the USPTO filing fee," which is the
   GOVERNMENT share and is silent on Indie Law's.** ▶ **The reply asks whether preparing and filing the SOUs is
   inside her existing package or a separate fee.** Same shape as the July gap; ask before signature time.
3. ⭐ **THE COMPLIMENTARY PROTECTION PLAN IS STILL ON THE TABLE**, taking effect at registration.
   ▶ **She should take it: the fault is closed now, so the 08-17 reason for declining is gone, and it commits
   nothing today.** The reply accepts it and asks what it includes + whether it renews into a paid plan.

### 🚨⭐ THE 045 FLAG — THE ONE ANSWER WITH REAL WORK BEHIND IT, AND IT HAS A 2027 DEADLINE NOW
**Both marks are Section 1(b) INTENT TO USE, so a Statement of Use requires the mark to be IN USE IN COMMERCE
for EACH class before it can be filed.** That quietly puts a clock on something that does not exist yet.
- **042 (the technology / website)** — the app is live, looks straightforward.
- **035 (retail / advertising services)** — her affiliate links now earn, which helps.
- ⚠️⚠️ **045 (personal styling / fashion consultancy) IS THE EXPOSED ONE.** She fought for this class
  specifically, in her own June words: *"I'm an actively practicing personal stylist and will be operating
  under the Style Star name"*, **and her plan was to DISSOLVE THE SOLE PROPRIETORSHIP and run those services
  under Style Star. THAT HAS NOT HAPPENED YET.** ▶ **The live app alone probably cannot prove 045 — that class
  is about HER doing styling under the Style Star name.** It would be a bad way to lose the class she refused
  to sign without.
- ▶ **The reply asks Almira what a specimen must look like PER CLASS, especially 045, and whether there is
  anything she should be doing NOW to build proof of use.** ⚠️ **Deliberately asked as a QUESTION FOR THE
  LAWYER, never answered here — the standing never-give-legal-or-tax-advice rule.**
- ⚠️ **Mechanics worth knowing so they cannot ambush her: after a Notice of Allowance there are 6 MONTHS to
  file, extendable in 6-month increments, EACH EXTENSION COSTING A FEE.** And **USPTO fees move over a 1-2 year
  horizon, so budget the $900 with headroom.** The reply asks how extensions work.
- ▶▶ **REALISTIC TIMELINE FOR THE ® SWITCH: registration is Notice of Allowance + SOU + examination, so
  2028 territory.** The ™ line on Terms stays exactly as it is. **The capitals at the markup still stand:
  NEVER change ™ to ® until Almira confirms registration is GRANTED.**

### ✅ HER REPLY IS DRAFTED AND WAITING (she asked for it; check whether she sent it)
Three numbered asks mirroring Almira's own three, plus a confirm-when-mailed on the correction. **Deliberately
says NOTHING about the earlier delays** — that thread is closed, the correction is moving, and it reads better
as a client planning ahead than one keeping score. ⭐ **Her tone across this whole thread has been impeccable;
protect it.** The full text is in the 2026-08-20 night chat.

### ✅ THE TRADEMARK LINE WAS ALREADY DONE — she asked, and it was CHECKED not remembered
**Live at stylestar.app/terms**, under "Our brand and content": *"STYLE STAR and the Style Star logo are
trademarks of Style Star by Catherine, LLC."* Shipped in #878. ⚠️ It appears in the raw HTML of every route
because the whole app is one file, but it only RENDERS on Terms. **There is still deliberately NO ™ symbol
beside the logo — her call, and the reasoning holds** (a floating ™ reads as "we are worried someone will copy
this", not "we are established").

### ▶ HER NEW BUILD ITEM, PARKED BY HER: A FRAME AROUND THE WHITE STAR CARD
Her words on the live front door: *"I think this looks amazing and I love it! I think we need to add a frame
around the white card but we can add that to our list."* ▶ **NOT built, her call to defer.** ⚠️ **When it is
designed, weigh it against her own anti-layered-edge rule** (2026-08-10: her retirements of the restore card's
4px bar and My Story's white+pink rings) — the card already carries a **1px `#D8A52E` border and a drop
shadow** on black velvet, so the question is whether a frame is DEFINITION (which earned the wishlist
hairline) or a second EMPHASIS device on something already loud. **Renders first, her pick, as always.**
⚠️ And it is the FRONT DOOR, so anything that adds height is measured against the ~700px iPhone fold.

### ▶ THE FIRST THINGS NEXT SESSION
1. ⚖️⚖️ **DID SHE SEND THE DRAFTED REPLY TO ALMIRA, and has Almira answered?** The two live questions are
   **whether $900 is the FULL cost or the USPTO's share only**, and **what a specimen must look like for
   CLASS 045**. ▶ **045 is the one with real work behind it — see the flag above.** Also watch for
   confirmation that the Statement of Correction was actually MAILED and ACCEPTED by the state.
2. 📊 **Ask her to tap the scarf on the live site and check Rakuten REPORTS a day later.** ⚠️ **STILL the only
   unproven link in the money chain, and now it is the Star on the front door, so it is easier than ever.**
3. ✅ ~~How the photos feel on her phone~~ **BLESSED 2026-08-20 NIGHT on her own screenshot: "I think this
   looks amazing and I love it!"** ▶ **Her one follow-up is A FRAME AROUND THE WHITE STAR CARD, parked by her
   — see the entry above before designing it.**
4. 🔎 **The LINKS ▾ menu in Rakuten — bulk feed export or FTP?** ⚠️ **And now ALSO ask about the LINK BUILDER's
   creative**, which is the properly-licensed source of product images.
5. 📬 **Impact's support answer, due ~27-29 August.** ⚠️ **It now gates the photos too** — Nordstrom is 6 of
   her 21 Edit items and runs on Impact.
6. ⭐ **ANY new advertiser approval is now a DOUBLE unlock: commission AND photos.** One line in `_AFF_MID`,
   then a `px:`/`<img class="dc-item-px">` per item at that store.
7. 📱 **Her search-quality verdict** — still the one blocker on testers, and testers are what releases the pin.
8. ⭐ **Her three parked ideas, all needing nobody else:** the NEW SHAREABLE, her NEXT INSTAGRAM POST, and the
   EMAILABLE WISHLIST (named a fourth time).
9. ⚠️ **The two link-check Routines are STILL unread, seventh session running.**


## ▶ PREVIOUS — EARLIER THE SAME DAY (2026-08-20 LATE — 🎉 THE TRADEMARKS ARE FILED AND STYLE STAR EARNS MONEY)

### ⏸ WHERE THIS SESSION PAUSED (her call: "let's do the .md save now. I will open up in a new chat with some more items for the Edit")
**FOUR PRs merged and ALL CURL-VERIFIED LIVE: #876 · #877 · #878 · #879.** Branch resynced to main, tree clean,
everything at `a6b39fa`. ⚠️ **Four Netlify builds — a heavy day, watch the meter.**
▶▶ **THE HEADLINE, AND SAY IT FIRST BECAUSE THE REJECTIONS WILL CROWD IT OUT: STYLE STAR NOW EARNS MONEY.**
Two Rakuten advertisers approved her, the affiliate plumbing is built and tested, and her DVF silk scarf is
the first Edit piece whose link pays her from the moment it went live.
▶ **AND THE OTHER HEADLINE: BOTH TRADEMARKS ARE FILED, WITH ALL THREE CLASSES.** The thing open since 16 July.

### ✅✅ THE TRADEMARKS ARE FILED — AND SHE WON THE 045 ARGUMENT ON PAPER
| Mark | Serial | Filed | Classes | Paid |
|---|---|---|---|---|
| **STYLE STAR** (word) | **50060992** | 2026-08-20 00:31 ET | 035 · 042 · **045** | $1,050 |
| **STYLE STAR** (logo) | **50060998** | 2026-08-20 00:45 ET | 035 · 042 · **045** | $1,050 |
- ⭐⭐ **HER ARITHMETIC FROM 08-17 CLOSED PERFECTLY: 3 classes × $350 × 2 marks = $2,100.** She found four
  filings where six were paid for, refused to sign, held the line through a call, and **every dollar is now
  accounted for.** ▶ **Reuse the move: when a firm quotes a lump sum, divide it by the unit price.**
- ✅ **Both receipts reviewed line by line:** owner is the LLC (not her personally), entity Florida LLC,
  signature reads **Catherine Bailey Ellspermann** — Bailey spelled correctly, so the "Bail" typo now lives
  ONLY in the filed Articles. Signed 08/18, filed 08/20. **Priority date is 20 August.**
- ✅ **HER 08-17 LOGO WORRY IS ANSWERED ON THE RECORD: "Color is not claimed as a feature of the mark."**
  That is the greyscale question, and it was the right call — no colour claim means protection in ANY colour.
  **She checked the resolution herself and it is fine**, so the high-res file she offered is not needed.
- ⚠️ **Filing basis is Section 1(b) INTENT TO USE on all three classes**, so registration still needs a later
  **Statement of Use** with a specimen and **another per-class fee**. ▶ **She asked Almira for the timing and
  cost — watch for that answer.**
- ⚠️⚠️ **HER HOME ADDRESS (1559 Harston Ave) IS NOW IN A PUBLIC FEDERAL DATABASE.** That is the same exposure
  that produced the scam texts to her husband's phone after the Sunbiz filing. ▶ **EXPECT A WORSE WAVE —
  USPTO scams are aggressive** (fake publication fees, fake directory listings, real employee names). The
  receipt itself says trademark directory listings are never necessary. **She decided not to pursue an
  address change; do not re-raise it unless she does.**
- ▶ **TSDR (tsdr.uspto.gov) is the independent check** — both marks appear within 5 business days, and the
  standing advice is to look every 3-4 months so nothing is missed.

### ✅ THE OTHER TWO LEGAL ITEMS CLOSED
- **The Statement of Correction needs NO mailing and NO check.** Almira: scan it or photograph it and email
  it. ✅ **SHE SENT IT the same day, signed, attached.** They handle the state filing and payment. That
  resolves the 08-18 contradiction where the cover letter had her mailing it and the email said otherwise.
- **The LLC-name-on-the-site question is answered and needs NO action.** Almira: optional, largely
  preference, the brand name matters more client-facing. **Her Contact page already carries it (shipped
  08-17), so the answer is leave it.** Question open since 08-17, now closed.
- ▶ **AMBER'S PARKED SWEETENER (free year of TM oversight + quarterly calls) was offered to her as an
  optional paragraph in the reply and she did not take it up.** Still available; the fault is fixed so it is
  fair game whenever she wants it.

### 💰 SHE HAS MONEY PLUMBING NOW — THE $100 AND TWO ADVERTISERS
- ✅ **THE $100 INITIAL CAPITAL CONTRIBUTION IS TRANSFERRED.** First entry in the books, and **Exhibit A of
  her Operating Agreement is now a fact rather than a sentence.** Open since 17 August.
- ✅✅ **TWO RAKUTEN ADVERTISER APPROVALS: FARM Rio and Diane von Furstenberg US** (both joined 2026-08-20).
  **FARM Rio pays 5% baseline; DVF pays 2% of net sales** (0-2% on monthly tiers). ▶ **Roughly the same per
  sale — 2% of a $500 DVF dress and 5% of a $200 FARM Rio dress are both about $10.**
- ⚠️ **SHE ALSO GOT DECLINES: Shopbop on Rakuten, and IMPACT AT NETWORK LEVEL.** See the entry below.
- ⭐ **FARM Rio was ALREADY in her store table** (`$$$`, Playful Chic + Bohemian Chic, colourful 10, trendy
  10) — so those links had been running unpaid all along and now earn. **DVF was not, and was added.**

### ⭐⭐ THE AFFILIATE PLUMBING IS BUILT — READ THIS BEFORE ADDING A THIRD ADVERTISER
**Rakuten does NOT work like Amazon.** Amazon appends a tag; Rakuten WRAPS the destination:
`https://click.linksynergy.com/deeplink?id=<publisher>&mid=<advertiser>&murl=<encoded destination>`
- ▶ **THE THREE NUMBERS, LOGGED SO THEY NEVER HAVE TO BE HUNTED AGAIN:**
  **publisher `id` = `jZNkkinrr1k`** ⚠️ (NOT her SID 4740535 — a different encoded form; the SID appears in
  Rakuten's own redirect params but is not what goes in a link) · **FARM Rio `mid` = 44912** ·
  **DVF `mid` = 53590**.
- ✅ **VERIFIED LIVE BEFORE ANY CODE WAS WRITTEN, and this was the load-bearing test: a deeplink to an
  ARBITRARY page 302s correctly**, so **SEARCH pages work and not only the pre-listed products.** That
  mattered because Style Star builds searches, not product URLs. Both MIDs tested, both redirect with
  `ranMID`/`ranEAID` attached and the query intact.
- ⭐ **MATCHED BY HOSTNAME, NOT BY STORE KEY, and the reason generalises:** the exact product URLs in this app
  (Edit picks, catalog rows, links she pastes herself) do NOT always carry a resolvable store key — an Edit
  pick's store field reads "Badu · Amazon", a brand AND a retailer. **The hostname is always there and never
  ambiguous**, and one function then covers both kinds of link.
- **Applied at EVERY place a URL becomes an href:** `getStoreUrl`'s three real-store returns, `_curatedCard`,
  both exact-URL wishlist rows, the Star of the Week, and **the Edit's hardcoded anchors rewritten at runtime
  in `_wlDecorateEdit`** — so a piece she adds by hand needs nothing done to it, the same self-maintaining
  reason the Save control is generated there.
- ⚠️⚠️ **ORDER IS LOAD-BEARING IN THE EDIT REWRITE:** `_wlEditItems()` captures the RAW url before the href is
  rewritten, so **the wishlist stores the plain product URL and re-wraps at render.** A change of affiliate id
  then still reaches pieces saved months ago; storing the wrapped URL would strand them. `_affUrl` never
  double-wraps, so calling it on both sides is safe and asserted.
- ⚠️ **An unknown host returns the URL UNCHANGED**, so the other 99 stores are untouched, and **the Google
  Shopping fallback is deliberately never wrapped.**
- ⚠️ **The publisher id is PUBLIC BY NECESSITY** — it must reach the browser for a click to be credited. Every
  affiliate site exposes one. **Written at the code so it is never mistaken for a leak.**
- ▶▶ **TO ADD A THIRD ADVERTISER: one line in `_AFF_MID`. Nothing else.** Get the MID from the advertiser's
  page (`/advertisers/<MID>/` in the address bar, or the "Search Advertiser or MID" box).
- **New `scratchpad/affwrap.js`, 23 checks.** ⭐ **The one that matters is the SWEEP: it renders the real
  surfaces and asserts ZERO bare links to an approved store escape.** There are ~10 anchor templates and a
  rule applied by hand at N sites drifts the moment an 11th appears — **the sweep is the guarantee, the same
  reasoning as `filterNeverWear` and `_nameParity`.**
- ⚠️ **STILL UNPROVEN, and it is the only thing left: nobody has confirmed a click actually lands in her
  Rakuten REPORTS.** ▶ **Ask her to tap the scarf on the live site and check Reports a day later.** That
  closes the chain end to end.

### ⭐ HER DVF SILK SCARF IS THE FIRST PIECE THAT EARNS
**"Diane von Furstenberg Flag Scarf — Myrtle Berry", $198, her note verbatim. The 19th Edit item.**
- ✅ **Verified before adding, not after:** both URL forms 200 (**the canonical `/products/` path is used**, so
  reorganising a collection cannot break it), real product name is "Flag Scarf", price $198, **both
  availability flags true.** ⚠️ **A "Sold Out" string DOES appear in that page's source and is a Shopify theme
  label, not this product** — the standing `check-product-urls.js` rule that per-variant sold-out text never
  means a broken link held again.
- **The anchor is copied verbatim from an existing item with only the href swapped**, so the bag icon and
  `rel="sponsored noopener"` cannot drift from the other eighteen.
- ▶ **Naming follows her own convention:** brand first, then **` — Colour`** when the link pins a colourway
  (as with "Express Editor High Waisted Flare Trouser — Pitch Black"). ⚠️ **The store field is the RETAILER**,
  with "Brand · Retailer" only when the brand is not obvious from the retailer. DVF sells direct, so it is
  just the one name.
- ⚠️ **Her phrase "100% silk" is NOT currently anywhere on the card** — it read as her describing the piece to
  Claude rather than as note copy. **Offer to add it if she wants it.**

### 🚨⭐ A STANDING RULE NEEDS REFINING — the luxury routing rule
**2026-07-28 says luxury goes through OUR retailers, never direct to the brand.** ▶ **But the reason was
COMMERCIAL, not stylistic: Louis Vuitton and its like sell direct and run no affiliate programme, so a link
there could never earn.** DVF now HAS a programme and she is approved on it.
▶▶ **SO THE RULE SHOULD READ: route luxury through a retailer we carry UNLESS the brand itself is an
approved advertiser.** Linking direct to DVF is not the exception to that rule, it is what the rule was for.

### 🚨 THE IMPACT DECLINE — AND THE EMAIL LISTED NO REASONS AT ALL
**Impact declined her media partner application (account 7645411) on 2026-08-20**, one day after applying.
- ⚠️⚠️ **THE EMAIL SAYS "declined for one or more of the reasons listed below" AND THEN LISTS NOTHING.** The
  only link is to the Partner User Agreement. **She did not miss them — Impact sent a broken email.**
- ✅ **THE AGREEMENT WAS READ IN FULL AND CONTAINS NO ELIGIBILITY BAR SHE FAILS:** no traffic minimum, no
  site-age rule, **no AI-content clause of any kind**, and the only excluded categories are under-18s and
  Impact's own competitors. Its prohibited METHODS are fraud (scraping, fake redirects, bots, cookie
  stuffing). ▶ **Worth saying to her again if she worries: the app being AI-powered is not a problem there.**
  ⚠️ **But that document is the CONTRACT, not the acceptance criteria** — it does not explain the decline.
- ⚠️ **Clause 1.3's "each User utilizes its own unique log-in and password" caused her a scare and is a
  NOTHING:** "User" means someone she gives access to her Impact ACCOUNT, not visitors to stylestar.app. She
  is a solo operator with one login and is compliant automatically.
- ✅ **SHE WAS NOT LOCKED OUT** — the account still works and she filed a support ticket from inside the
  platform. ⚠️ **Rakuten's auto-reply said 5-7 BUSINESS DAYS, so an answer is due roughly 27-29 August**
  (Zara Wright acknowledged it). ▶ **The ticket leads with the template fault**, which is factual and gives
  them something concrete to fix, and asks for the specific reason plus whether reapplication is possible.
- ▶ **THE HONEST READ TO GIVE HER: the likeliest cause is TRAFFIC**, the one thing on any decline list she
  could not have fixed. **It is not a verdict on the app.** She passed Rakuten's publisher review two days
  earlier, and that is the higher bar.
- ⚠️ **Shopbop also declined on Rakuten. That is ONE advertiser and was predicted in her own prep sheet** —
  reapplyable, costs nothing, and her publisher status is untouched. **Do not let the two declines be weighed
  as equal; only the Impact one is network-level.**

### ⭐⭐ THE FEEDS QUESTION IS ANSWERED, AND IT IS BETTER THAN EXPECTED
Her Rakuten dashboard shows **DVF: Product links (2,752) · Text links (9) · Banners (12)**.
- ▶ **That is a PRODUCT FEED with a browser on top of it.** Each card carries a **real product photo**, name,
  price, SKU, product category, and a **structured attribute description**: *"Bandeau neckline Tiered skirt
  Straight silhouette Maxi length."*
- ⭐⭐ **THOSE ATTRIBUTES ARE THE STRUCTURAL FIX FOR THE TWO PROBLEMS OF THIS WHOLE WEEK.** "Maxi length" is a
  FIELD, not a hoped-for search word — so the length-word finding (stores silently drop "midi") stops
  mattering. And **"Bandeau neckline" would fail her work-appropriate-dresses rule automatically**, which is
  the exclusion problem a 3-word search box structurally cannot encode.
- ⚠️ **THE FEED IS NOT CLEAN: "Shipping Protection, $63" is in the catalog.** Real feeds carry warranties,
  gift cards and shipping add-ons that must be filtered before anything reaches a woman's shelf.
- ⚠️ **STILL UNKNOWN: whether there is a BULK export or FTP feed file.** Browsing 2,752 products fifteen at a
  time is not usable. **She had not opened the LINKS ▾ menu when the session paused — that is where to look.**

### ⭐ THE PATH A / PATH B EXPLANATION SHE ASKED FOR — reuse it verbatim
Her question: *"I am not clear on the differences between path A and B. I feel like I have been wanting the
full pipeline all along?"*
▶▶ **THE ANSWER THAT LANDED: A AND B ARE NOT ALTERNATIVES. A IS PART OF B.** A feed product still needs a
tracking link wrapped around it to earn anything. **B without A is a beautiful shop where the till is not
plugged in.** · **A (wrap the links)** changes what she EARNS, not what a woman SEES. **B (ingest the feed)**
changes what a woman SEES, and earns nothing on its own. · **Why B waits: two designer brands is not worth a
pipeline.** Build it the day a DEPARTMENT STORE approves, and it pays off across the whole app.
⭐ **AND THE REFRAME SHE LIKED: she is already doing B by hand.** Her Edit and her 107-product catalog ARE
curated product data with real URLs and prices. **The feed adds scale and photos, not the idea.**

### ✅ THE TRADEMARK CLAIM IS IN TERMS — AND THERE IS NO ™ ON THE LOGO, HER CALL
One line in the "Our brand and content" section: **"STYLE STAR and the Style Star logo are trademarks of
Style Star by Catherine, LLC."** It is also **the first place Terms names the entity**, which is where the
legal name always belonged (Contact stays human, the 08-17 reasoning).
- ▶ **WHY NO SYMBOL BESIDE THE LOGO, and it is her restraint budget applied again: a floating ™ reads as "we
  are worried someone will copy this", not "we are established."** Premium brands do not carry it in-app.
  **What makes her look official is already there** — a named entity on Contact, /privacy, /terms, her own
  domain, a real founder. A symbol buys none of it.
- 🚨🚨 **NEVER CHANGE ™ TO ® UNTIL ALMIRA CONFIRMS REGISTRATION IS GRANTED.** Using ® before registration can
  damage the applications and the marks' enforceability, and both are 1(b) intent-to-use, so registration is
  a Statement of Use away. **Written in capitals at the markup.**

### ✅ DIANE VON FURSTENBERG IS STORE 101 — nine of ten dimensions are hers verbatim
`d:[relaxed 5, alluring 7, polish 9, classic 7, trendy 6, casual 4, dressy 9, fitted 8, neutral 4, colorful 10]`
· `$$$$` · Modern Glam, Romantic Feminine · `deep:'dresses'` · `s:[]`
- ⚠️ **ALLURING WAS THE ONLY GAP** — her table had no such column, so she was shown the calibration against
  her own existing scores (Veronica Beard 8, Alice + Olivia 9, Anthropologie 6, Talbots 2) and **set it at 7
  herself.** Nothing inferred.
- ⚠️ **`s:[]` IS HER FACT, NOT A GAP**, in her words: *"no petites or tall, XXL and 16 is barely plus."* It
  means the app steers a petite, tall or plus woman elsewhere for anything length-dependent.
- ⭐ **`deep:'dresses'` is her read AND measured:** dvf.com returns 363 for "wrap dress", 169 for "silk
  blouse", 46 for "cashmere sweater", **1 for "handbag", 0 for "sneakers", 0 for gibberish.** ▶ **It narrows
  honestly and admits what it does not carry — the best-behaved store search measured all week.**
- ⭐ **A COLLISION WORTH KNOWING: DVF is THE wrap dress house, and "wrap" is in `_SEARCH_VETO`.** Her own
  exemption for **dr7 "Wrap dresses"** means DVF surfaces exactly where wrap is deliberate and nowhere else.
- ⚠️ **Store count 100 → 101, and THREE DIFFERENT ARITHMETICS live in the suites** (the full list, the list
  minus one blocked store, the list minus three memoised ones). **A blind find-replace would have broken two
  of them** — the 2026-08-03 lesson, paid for twice.

### ⚠️ SESSION LESSONS
- ⭐ **A NONSENSE-WORD CONTROL IS NOW PROVEN TWICE.** It caught two false store-search readings in the morning
  and **verified DVF's search URL in the afternoon** (gibberish → 0 results and half the page weight).
- 🚨 **A STASH-AND-RERUN THAT CHANGES TWO VARIABLES PROVES NOTHING.** `curated.js` failed, the stashed clean
  tree passed, and the conclusion "the failure is mine" was WRONG — the clean run was also a FRESH SINGLE
  run, while the failing one came after four browser suites back to back. **Re-run under identical
  conditions.** It was resource contention; curated is 65/0.
- ⚠️ **A test that fails on a correct value is usually a broken harness.** `affwrap`'s first Talbots assertion
  checked a hardcoded character offset and failed on a perfectly good URL.
- ⚠️ **Write patch scripts to a FILE, never inline `node -e`,** when the content carries quotes. Cost one
  mangled run again.
- ⚠️ **affq's "results saved" check flakes on timing** — clean on rerun, a documented pattern now.

### ▶ THE FIRST THINGS NEXT SESSION
1. 🛍 ~~**SHE IS COMING BACK WITH MORE EDIT ITEMS.**~~ ⚠️ **STALE — DONE 2026-08-20 NIGHT: the DVF Jeanne
   wrap dress and the FARM Rio maxi are in (#881), the Edit is 21 items, and both earn. See the top of this
   file.**
2. 📊 **Ask her to tap the scarf on the live site and check Rakuten REPORTS a day later.** The only unproven
   link in the chain.
3. 🔎 **The LINKS ▾ menu in Rakuten — is there a bulk feed export or FTP?** The one open feeds question.
4. 📬 **Impact's support answer, due ~27-29 August.** Silence past that needs a nudge.
5. ⭐ **Any DEPARTMENT STORE approval is the real trigger for building feeds** (Bloomingdale's is pending).
6. 📱 **Her search-quality verdict** — still the one blocker on testers, and six stores changed yesterday.
7. ⏳ **Almira on Statement of Use timing and cost.** And log the TSDR appearance (~5 business days).
8. ⭐ **Her three parked ideas, all needing nobody else:** the NEW SHAREABLE, her NEXT INSTAGRAM POST, and the
   EMAILABLE WISHLIST (named a fourth time).
9. ⚠️ **The two link-check Routines are STILL unread**, sixth session running.

## ▶ EARLIER THE SAME DAY (2026-08-20 morning — THE SEARCH TIER, FOUR DRAFTS CLOSED, AND A NEW FAILURE CLASS)

### ⏸ WHERE THIS SESSION PAUSED (her call: "let's do the .md save now and then I will come back on new chat")
**ONE PR, #876, merged and CURL-VERIFIED LIVE on all four strings. ONE Netlify build for the whole batch.**
Branch resynced to main via the documented force-with-lease, tree clean, everything at `7daf335`.
▶ **THE SHAPE OF THE DAY: no new features at all — it was a session of CLOSING THINGS.** Four unblessed
drafts settled, one verification that had been outstanding for eight days finally run, and one parked
decision (the store middle tier) made. ▶ **Her own words on why that mattered: "I don't want to forget any
little thing."**

### ⭐⭐ THE HEADLINE FINDING, AND IT IS A THIRD FAILURE CLASS: STORE SEARCHES SILENTLY DROP LENGTH WORDS
Her own address-bar test, and it is the most reusable thing from the session. She searched Anthropologie for
**"green floral midi dress"** and got **lots of green floral dresses, none of them midi.**
- ▶ **THE FAMILY IS NOW THREE, and keeping them apart is what stops the wrong fix being applied:**
  1. **The NAME promises more than the search** — fixed by `_nameParity` (2026-08-15).
  2. **The SEARCH asks for something the store cannot return at all** — fixed by the `deep` flag (2026-08-15,
     her Tuckernuck screenshot: "print wrap top" → a wrap skirt, a sarong and a perfume).
  3. ⭐ **NEW: the SEARCH asks for something the store's engine silently IGNORES.** ⚠️ **`_nameParity`
     structurally cannot catch this — "midi" genuinely IS in the search, so parity passes.**
- ▶ **WHY: a length word is a FILTER at most stores, not a word in the product title.** That is exactly the
  lesson she taught about colour on 2026-08-12 ("I would never lead with color. Always lead with the item,
  and once she is inside the store she selects color"). **Length words are the same shape as colour words.**
- ⚠️ **SILHOUETTE WORDS SURVIVE, LENGTH WORDS DO NOT.** "Sheath", "wide leg", "button front", "tailored" all
  carry. "Midi", "maxi", "mini", "knee-length", "cropped" are the fragile ones. ▶ **That distinction matters
  for dr3 — see the retest entry below, where it half-killed the planned fallback.**
- ▶ **DECIDED: LOG IT, DO NOT CHASE IT.** The landing is still good (green floral dresses when she asked for a
  green floral midi dress is a fine page to arrive on), and **the real cure is PRODUCT FEEDS picking an actual
  midi dress rather than a search box being asked to honour the word.** Chasing it with more prompt rules is
  the exact thing her own standing rule warns against.

### ⭐⭐ THE STORE MIDDLE TIER IS DECIDED — the 2026-08-15 revisit trigger, closed
The depth split was BINARY, so **Talbots — a national chain with hundreds of tops — was filed exactly like
Tuckernuck, a small resort boutique.** The app was being over-cautious with stores that can genuinely answer.
**She tested each store's own search box herself: "the rest came up decent."**
- **AS SHIPPED, 19 → 25 of 100 deep:** **Talbots · J.Crew · Free People · Anthropologie → `deep:1`** ·
  **Athleta → `deep:'activewear'`** · **Lands' End → `deep:'swimwear'`** · **J.Jill and Boden UNCHANGED.**
- ⭐ **THE REFRAME THAT DID THE WORK, and it generalises: DEPTH ONLY HAS TO MEAN "DEEP WITHIN ITS OWN LANE."**
  Her dimension scores already steer women toward stores that suit them, so Talbots mostly gets asked for
  classic things and Free People mostly for boho things. "Deep" never had to mean "can answer anything a
  stranger asks." That lower bar is what made four of these a yes.
- ⭐ **BODEN WAS MEASURED, NOT JUDGED, and the control is the point:** `dress` → **1000 results**,
  `floral dress` → **the same 1000**, gibberish → **0**. The control passes, so the numbers are real: **extra
  words buy nothing at Boden.** Its existing setting was right and is now proven rather than assumed.
- ⚠️ **ANTHROPOLOGIE WENT IN ON EVIDENCE THAT FIRST LOOKED LIKE A FAILURE.** Her midi test above honoured 3 of
  4 words and the right category, against Tuckernuck's 0 of 3 and a perfume. ▶ **A strict search returning
  almost nothing is BETTER behaviour than a loose one padding the page.**
- ✅ **HER GUARD HELD AND WAS CHECKED, NOT ASSUMED: fit beats depth, always.** The relaxed/classic/natural
  dresser's top ten came back **byte-identical** to before (Eileen Fisher · Lands' End · J.Jill · Frank &
  Eileen · Jenni Kayne · Tommy Bahama · Faherty · Quince · Soft Surroundings · Chico's). None of the newly
  deep stores crowd it.
- ▶ **STILL PARKED, the other half of the 08-15 question:** should a FOCUSED store's `c:` "known for" line be
  TIGHTENED so the app can send Tuckernuck a specific DRESS search but never a specific TOP one? Tuckernuck's
  line currently reads "dresses, polished separates, occasion, resort", and **"polished separates" is vague
  enough to sound like it covers tops — which is how her screenshot happened.** Store by store as her testing
  surfaces them, never a sitting.

### ✅✅ THE WORK-APPROPRIATE DRESSES RETEST FINALLY RAN — AND IT PASSES
**The open item since 2026-08-12: the code was finished and never verified.** Her FIRST test showed a
Bloomingdale's one-shoulder dress, spaghetti straps and satin, all three against her own definition; the fix
moved her definition INSIDE the RULES list as an imperative NEVER closed with "This rule is absolute" and
named those three violations by word. **Then the session ended and the second test never happened.**
- ✅ **TWO INDEPENDENT LIVE RUNS, EIGHT ITEMS, ZERO VIOLATIONS** of any clause — no one-shoulder or
  asymmetric, no spaghetti straps, no strapless, no plunging, no satin, no sequins, no sheer, no above-knee
  hemline, no slits, no bodycon. **The sibling exclusions held too:** no cocktail, gown or sundress bleed.
  What came back: **Ponte Sheath · Crepe Midi Work · Tailored Midi · Knit Sheath Midi · Knit Workwear** at
  Ann Taylor, M.M.LaFleur, Banana Republic Factory, Nordstrom and Talbots. **Name and search matched word for
  word on all eight.** ⚠️ **TWO runs deliberately — her own note says this definition needed a second pass
  before it landed, so one clean run proves nothing.**
- ⚠️⚠️ **WHAT IS STILL NOT PROVEN, AND IT IS THE HALF SHE CARES MOST ABOUT: WHAT THE STORE PAGE SHOWS.**
  ▶ **Three of the four searches lean on "midi" to guarantee the hemline — and length words are exactly what
  the new finding above says stores drop.** So the knee-length clause rides on the weakest word in the search.
  The other words (sheath, tailored, ponte, crepe, workwear) survive and carry most of the weight.
  ▶ **THE DIAGNOSTIC TO GIVE HER: if a bad dress appears it will be on the RESULTS PAGE, not on the card. The
  cards are proven clean.** Those are two different problems with two different fixes, and only feeds fix the
  second.
- 🚨 **AND THE OLD FALLBACK PLAN IS HALF DEAD.** 2026-08-12 said: if violations persist, the next lever is a
  qualifying word in the SEARCH TERM, "sheath" or "knee-length". ▶ **"knee-length" would be DROPPED like
  "midi". "Sheath" survives because it is a SILHOUETTE word.** The lever is sheath-shaped, not length-shaped.
- **New `scratchpad/dr3-live.js`, committed rather than thrown away** — this row is the app's only
  EXCLUSION-defined item, so it is the most fragile to prompt drift and the most expensive to check by hand.
  ⚠️ Costs a few cents of the production key per run, the standing trade. **Re-run it after any prompt change
  near dr3.**

### ✅ ALL FOUR UNBLESSED DRAFTS ARE CLOSED — three shipped, one she had already done
1. ⭐ **BASIC TOPS (to1/to2/to3) — every word is hers now.** Her own 2026-08-15 sentence opens the rule
   (**"A black top should just be a black top"**, generalised to "A top like this should just be a top"
   because one string serves all three colour-generic rows) and she approved the positive half verbatim.
   ⚠️ "Plain, **wearable** top" lost "wearable" — filler, every top is wearable.
   ▶▶ **FABRIC IS DELIBERATELY LEFT OPEN, HER CALL, and it is written at the code as a DECISION so a later
   session does not helpfully close it.** It was put to her that satin is banned while nothing says what a
   basic top SHOULD be, so chiffon or organza would technically comply; **she chose to leave it open** rather
   than name cotton/jersey/knit. **Do not add a fabric list here without her.**
2. ⭐ **DRESSY TOPS (to6) — two fabric calls, both hers.** **Sequins OUT** of the welcome list ("let's take
   out saying sequins"). **Velvet stays but is BRAKED** ("velvet is ok, but don't want to over use it") —
   ▶ **a bare mention beside satin and lace invited the model to reach for it as readily as anything else, so
   it carries an explicit frequency limit instead**, the same shape as `_colorPrefRule`'s vary-across-your-picks.
   ⚠️ **SEQUINS IS UNMENTIONED HERE, NOT VETOED** — the narrow reading of what she asked for. `_STYLIST_VETO`
   is TASTE and only ever grows on her express word. Sequins stays banned on the basic rows where she put it.
3. ⭐ **THE SEASON CHAT CHIP** now sends her client's question and nothing else. The Claude-added second
   sentence ("What trends should I know about?") **made one chip ask two things, which reads like a form
   rather than a woman talking.** ▶ **The ring is hers end to end now.**
   ▶ **PARKED PRODUCT THOUGHT, not a reword: her own note on that question was "That is exactly why we have
   What's Trending page," and the chip's answer never mentions that page exists.** Should the stylist point
   her there? Small build, her call.
4. ✅ **THE IMPACT PROFILE DESCRIPTION IS DONE — she used the Claude draft as written and submitted it.**
   ⚠️ **The 2026-08-19 entry below calls it "STILL A DRAFT SHE HAS NOT REWORDED" and that is now STALE.**
   The deliberate judgment inside it stands and was re-offered to her: **it does not say her traffic is
   small**, because the application form already took the real number honestly and this field is the
   brand-facing shop window.

### ⭐⭐ THE AMAZON CONVERSATION — SHE RESOLVED TO WAIT, AND THE REASONING IS THE KEEPER
She opened wanting to apply ("I feel confident we can get [3 sales]... more important I am really wanting to
see how the app changes with some links wired in, and I wonder if that might help approvals from Rakuten,
Impact and others?"). **She talked herself out of it, on better grounds than the original rule.**
- 🚨 **HER REASON 3 DOES NOT HOLD, said plainly: an Amazon approval does NOT help Rakuten or Impact.**
  Networks do not look at each other, both applications were already submitted, and no form asks whether you
  are an Associate.
- 🚨⭐ **HER REASON 2 IS THE CRUX AND IT INVERTS: AMAZON APPROVAL CHANGES NOTHING SHE CAN SEE.** What she gets
  is a tracking tag — one URL parameter, invisible to a user. ▶▶ **AND THE PRODUCT PHOTOS SHE IS EXCITED
  ABOUT DO NOT COME FROM AMAZON EITHER: Amazon's images come through the Product Advertising API, which has
  historically been behind the SAME 3-qualifying-sales gate.** ⚠️ Verify at application time; rules move.
  ▶ **So Amazon is the SLOWEST route to the visible change, not the fastest. The fast route is already in
  flight: ONE Rakuten or Impact advertiser approval starts the feeds.**
- ▶ **MEASURED, and it settled her flooding worry: only 2 of her 107 catalog products are Amazon**, 2 of 18
  Edit picks, 1 of 100 stores. ⭐⭐ **AND HER OWN JULY SCORING ALREADY PREVENTS THE FLOODING SHE FEARED —
  she scored Amazon POLISH 5, level with Target, against Nordstrom 9, Bloomingdale's 9, Talbots 9, Neiman 10,
  NET-A-PORTER 10.** Polish is the refinement tie-break running across every ranking, so **Amazon
  structurally cannot lead.** Her words: *"I want it to be more department store and mall stores and upscale
  in general although of course Amazon is great for certain things."* **Her instinct was already in the code.**
  ▶ **So: more Amazon Edit picks are SAFE and welcome in the affordable-accessories lane** (her existing two
  are $16.99 bangles and a $46.99 maxi — exactly right), and they serve her every-budget value.
- ⚠️ **FACTS SHE NEEDED AND DID NOT HAVE:** she **cannot buy through her own links**, and Amazon extends that
  to her household, so her own and her husband's purchases do not count. **And missing the 3 sales is NOT a
  lifetime ban** — the account closes and she can reapply. ▶ **The old "burns the window" framing was too
  heavy and was corrected to her.**
- ▶▶ **THE HONEST RESOLUTION, and it is hers: "I am just feeling nervous about getting approved. And I don't
  feel ready to launch it out yet because I'm still not happy with search results."** ⭐ **The approval is not
  the risk — she passed Rakuten's publisher review, whose bar is HIGHER than Amazon's signup bar, and Amazon's
  real scrutiny lands at the 3-sale mark, not at the door. The risk is the CLOCK, and she said herself there
  is nothing to feed it yet.** ▶ **SO AMAZON STAYS LAST — but now for HER reason, not the old rule's.**
- ⭐ **THE CHAIN TO GIVE HER WHEN IT COMES UP AGAIN:** *search quality is the blocker → feeds fix search
  quality → one advertiser approval gives feeds → then the searches show real products with photos → then she
  is happy → then testers → then traffic → then Amazon has something to feed its clock.*
- ▶ **AND NOTHING IS LOST BY WAITING: every Amazon product she adds to the Edit keeps its URL, and adding the
  tag later is one find-and-replace.** There is no money on the table today because there is no traffic.
- ⚠️ **AWIN and CJ have NO CLOCK and cost nothing but an evening** — worth doing any time she is in an
  applying mood. Still next in her order.

### ⚠️⚠️ THE MEASUREMENT LESSON OF THE DAY: A NONSENSE-WORD CONTROL CAUGHT TWO FALSE READINGS
Probing the eight middle-tier stores from the sandbox, **two of the five reachable ones gave confidently WRONG
answers** and only a control exposed them.
- **Athleta reported "0 items" — even for `leggings`.** **Talbots reported the same string for gibberish as
  for a real query.** Both were a page SHELL being scraped before its JavaScript drew the results.
- ▶ **STANDING: when probing a store's search from a script, ALWAYS send a nonsense word too.** If gibberish
  returns the same shape as a real query, the number is not a result count and the reading is worthless.
  **Boden was the only clean measurement of the five, precisely because its control returned 0.**
- ⚠️ **Four of the eight (Lands' End, J.Crew, Anthropologie, Free People) are BOT-WALLED and unmeasurable from
  any sandbox.** ▶ **Her address bar remains the only instrument, exactly as the standing rule says. Every
  real find today came from her testing, not from the probe.**
- ⚠️ **Shell quoting mangled a node -e patch script mid-session** (curly apostrophes + nested quotes).
  ▶ **Write patch scripts to a FILE and run them, never inline `node -e` for anything with quotes in it.**

### ✅ TEST HYGIENE THIS SESSION
- **storedepth 17 → 19**, updated DELIBERATELY not silenced: a `MIDDLE` list pins the four additions, a new
  assertion pins J.Jill and Boden as deliberate exclusions, and ⭐ **TWO COUNTS WERE MADE DERIVED RATHER THAN
  RESTATED** (the no-flag count and the prompt-marker count now compute from the table) — **the `curated.js`
  lesson applied before it could bite: a test that restates a number must be edited every time the data
  grows; a derived one never does.**
- **searchtune 70 · searchchat 57 · cowork3 69 · chiprot 15 · e2e 29**, all green.
- ⚠️ **Nothing pinned the changed strings** — `chiprot` asserts the season chip's LABEL, not what it sends,
  and the "sequin" hits elsewhere are a chat link-extraction test case plus two word lists in the paid
  live-model scripts. **Checked before assuming, which is why no assertion needed changing.**
- ⚠️ **Playwright needs no install** — the suites import it from `/opt/node22/lib/node_modules/playwright`
  and the browser is at `/opt/pw-browsers/chromium`. **package.json was never touched.**

### ▶ THE FIRST THINGS NEXT SESSION
1. 📬 ~~Did Impact answer?~~ ⚠️ **STALE — ANSWERED 2026-08-20: DECLINED, with no reasons given in the email.
   A support ticket is filed; see the entry at the top of this file.**
2. ⭐ **ANY Rakuten or Impact advertiser approval is the trigger for PRODUCT FEEDS** — `docs/product-feeds-plan.md`
   is shovel-ready, and **feeds are what she is actually excited about** (photos, real products, "in your
   size"). **Ask whether an approval email has landed.**
3. 🔎 **The advertiser directory search on BOTH networks** — Nordstrom, Macy's, Bloomingdale's, her store
   table. Still the highest-value thing she can report. Probably gated until approval.
4. 📱 **HER TESTING, and today's merge went straight at it:** six stores can now take specific searches.
   ▶ **Ask how the searches feel — it is still the one real blocker on testers, and she named it again today.**
   Also: **work-appropriate dresses on the RESULTS PAGE** (the cards are proven clean; a bad hemline would be
   the store dropping "midi").
5. ⚠️ **The two link-check Routines are STILL unread, fifth session running.** Do not let her decision become
   permanent by neglect.
6. ⭐ **THE THREE THINGS SHE RAISED AND PARKED HERSELF TODAY, all needing nobody else:** a **NEW SHAREABLE
   IDEA** (she did not describe it yet — ask), her **NEXT INSTAGRAM POST**, and the **EMAILABLE WISHLIST**
   (named a fourth time; nothing blocks designing it, renders first).
7. 💳 The $100 initial capital contribution, and the recurring payments when the cards arrive.
8. ⏳ ~~Indie Law: the mailing address, and the TM filing dates + serial numbers.~~ ⚠️ **STALE — ALL ANSWERED
   2026-08-20. Both marks filed (50060992 / 50060998), and the correction needs no mailing at all: scan and
   email it, which she has done. See the top of this file.**

## ▶ PREVIOUS — 2026-08-19 LATE (TWO NETWORKS IN TWO DAYS, AND IMPACT HAS TWO DOORS)

### ✅✅ THE IMPACT APPLICATION IS IN — SUBMITTED, DOMAIN VERIFIED, IN REVIEW
**Account "Style Star by Catherine, LLC", ID `7645411`. Status: In Review.** ⭐ **AND THE TIMELINE IS
SOURCED, NOT GUESSED: Impact emailed her saying it usually takes 72 HOURS**, which lands a response around
**Friday 22 August.** ▶ **Log both network identities together, support conversations start with them:**
**Rakuten SID `4740535`** (publisher approved; FARM Rio + DVF approved 08-20, Shopbop declined) ·
**Impact `7645411`** ⚠️ **(DECLINED 2026-08-20 with no stated reason; support ticket filed).**
- ▶ **THE CHAIN NOW READS: LLC ✅ → EIN ✅ → BANK ✅ → RAKUTEN ✅ → IMPACT ❌ (declined 08-20).** Two networks in two days,
  after two months blocked behind lawyers. **She registered under the exact legal name on her Articles, not
  "Style Star"** — which is the entire reason she waited from June rather than applying as an individual.
- ⚠️ **NOTHING IS OWED BY HER NOW. Do not let her sit refreshing the dashboard.** As with Rakuten, the
  approved-partners list reads empty until something is actually approved; that is correct, not a decline.

### ⭐⭐ THE HEADLINE FINDING: IMPACT HAS TWO FRONT DOORS, AND ONLY ONE FITS STYLE STAR
Her question was *"let's apply to Impact. I think that is the one that Nordstrom is in?"* **She was right that
Nordstrom runs on Impact. What could not be seen from outside is that "Impact" names two different products.**
- **DOOR 1, HERS: Impact as an AFFILIATE PARTNER** (`app.impact.com`). Site-based. Judged on whether you are a
  legitimate business with a real website. **This is the one she applied to.**
- **DOOR 2, NOT YET: NORDSTROM CREATORS** (`nordstromcreators.com`). **Impact's CREATOR/INFLUENCER product,
  running on their Activate platform.** Judged on AUDIENCE SIZE.
- ▶ **THE EVIDENCE, recorded so this never has to be re-derived:** nordstromcreators.com serves its fonts and
  logos from **`cdn.impactcreator-go.com`** · its privacy policy points at **`www.impact.com/privacy-policy`** ·
  it calls Impact's creator API at **`activate.social`** · **the page's own internal class name is literally
  `InfluencerApplicationPage`** · Instagram (64), Facebook (59) and TikTok (55) appear more than fifty times
  each in its markup, against twelve mentions of a website.
- ⭐ **The curated storefront that made Nordstrom Creators sound so much like the Style Star Edit IS REAL and
  IS worth having** — it sits behind the creator door. ▶ **REVISIT TRIGGER: when her follower count is not the
  weakest thing she brings.** Nothing is lost by knocking later from a stronger position.
- 🚨⚠️ **AND THE STANDING RULE WAS HONOURED THIS TIME, ONE DAY AFTER IT COST US: she was NOT told Nordstrom's
  affiliate programme is in Impact's marketplace.** Yesterday Rakuten was recommended on the basis that it ran
  Nordstrom and Macy's, she opened the real directory, and **neither was there.** ▶ **THE ONLY TRUSTWORTHY
  SOURCE IS THE NETWORK'S OWN ADVERTISER DIRECTORY, READ WHILE LOGGED IN.**
- ▶▶ **STILL OWED, AND IT IS THE FIRST THING TO ASK AFTER APPROVAL: SEARCH IMPACT'S ADVERTISER DIRECTORY**
  for Nordstrom, Macy's, Bloomingdale's and her store table, and report what is really in it. ⚠️ **It is
  probably GATED until the partner review clears** — most networks lock the marketplace behind approval, so an
  empty or greyed directory today is the gate, not a fault. **Told to her that way deliberately.**

### ⭐ HER FOLLOWER ANXIETY, RAISED AND ANSWERED — AND THE TWO-DOORS FINDING IS WHY THE ANSWER HOLDS
Her words at the start of the session: *"I am a little nervous about this since I only have 16 insta followers
and did not even list my social media on Rakuten. I am just hoping that doesn't lower my chances."*
▶ **THE ANSWER TO GIVE, and it is economic rather than reassuring: A CREATOR PROGRAMME PAYS FOR REACH, so an
audience number is the whole product being bought. AN AFFILIATE PROGRAMME PAYS A COMMISSION ON A SALE THAT
ALREADY HAPPENED, so the retailer's downside is near zero and the question is legitimacy, not size.**
- **What she actually brings, and very few 16-follower applicants have any of it:** registered LLC · EIN ·
  business bank account · live site on its own domain · **/privacy · /terms · /contact** · `partners@stylestar.app` ·
  an affiliate disclosure on every surface carrying a link.
- ⭐⭐ **THE PROOF LANDED MID-FORM AND IS WORTH REUSING: Impact's "who promotes primarily through" dropdown
  offered website(s) / mobile apps / browser extension / newsletters — NO SOCIAL MEDIA OPTION AT ALL.** The
  partner door does not have a field for a follower count. **Said to her exactly that way and it visibly settled it.**
- ⚠️⚠️ **AND THE RULE THAT CAME OUT OF IT, apply to every future form: DO NOT VOLUNTEER THE FOLLOWER COUNT
  WHERE THE FORM HAS NOT ASKED.** Impact's channels step nudges *"Brands prioritize partners with connected
  channels"* and offers Instagram/TikTok/YouTube/X/Facebook OAuth buttons. **She connected WEBSITE ONLY.**
  Connecting Instagram would have published her weakest number to every brand browsing the directory, unprompted.
  ▶ **A connected website IS a connected channel. One is enough.** (It also avoids the OAuth hijack trap.)
- ▶ **THE HONEST HALF, given and not softened: some individual advertisers WILL decline, and some will be ones
  she wants.** That is about traffic volume, it is reapplyable, and **"a Nordstrom decline in September is not
  a verdict on the app, it is a verdict on a visitor count that is three weeks old."**

### ✅ HER FORM ANSWERS, ALL OF THEM (so a re-application or another network can reuse them)
Impact builds a sentence: **"I am [a publisher] operating as [editorial content] who promotes primarily
through [website(s)]."**
- **a publisher** — the partner door, not the creator one.
- ⭐ **editorial content** — original writing and curation about products, which is exactly the Style Portrait
  write-ups, the Edit notes, Trending and the checklist. ⚠️ **NOT "product & service reviews"** (a review site
  rates and compares; she styles) and 🚩 **emphatically NOT "deals / coupon"**, the category networks are most
  sceptical of and the exact thing **Rakuten's own tooltip went out of its way to say she was not.**
  ⚠️ She checked and confirmed there were **no options above "editorial content"** before choosing.
- **website(s)** — not newsletters (MailerLite is real but not primary) and **not mobile apps: Style Star is a
  website that can be added to a home screen, which is a different thing, and they verify the DOMAIN.**
- **Profile description (1000 char limit, she pasted a Claude draft at 975).** ✅ **CLOSED 2026-08-20: she kept
  the draft as written and it is submitted. The "still a draft" note here was true only until then.** It opens with *"I'm Catherine, a personal stylist of more than
  twenty years"* (the Sally differentiator in the first line a brand reads), sells **QUALIFICATION rather than
  reach** (*"Nothing reaches a woman until it suits her style, her sizing and her colours"*), and closes
  *"I would rather send you fewer, better matched visitors than volume."*
  ▶ **ONE DELIBERATE JUDGMENT CALL, FLAGGED TO HER AS HERS TO OVERRULE: it does NOT say her traffic is small.**
  The application form already took the real number and she gave it honestly. **This field is the brand-facing
  shop window, and there is a difference between being honest and volunteering your weakest fact in the one
  place designed to attract.** It says *"Style Star launched in 2026"* instead: true, calibrating, not apologetic.

### ✅ stylestar.app IS NOW A VERIFIED DOMAIN — PR #874, MERGED AND CURL-VERIFIED LIVE
Impact verifies domain ownership before advertisers review a partner, so this was the gate in front of every
application. **One line in the `<head>` of index.html. Netlify built in ~20 seconds; the tag was confirmed live
on BOTH the apex and the www redirect before she clicked Verify. It verified first time.**
⚠️ **DELIBERATE: she was told NOT to click Verify until the deploy was confirmed serving** — a failed check can
put the property into a state that needs redoing, and a green merge proves nothing about what is live (the
standing #809/#811 lesson).
- ⚠️⚠️ **THE TAG IS PASTED VERBATIM AND MUST STAY THAT WAY, with a comment at the markup saying so:**
  `<meta name='impact-site-verification' value='...'>` — **Impact writes `value=` where every other meta tag on
  the page writes `content=`, and single quotes where the whole file uses double.** That reads like a mistake
  and is not one. **Their verifier may match the RAW SOURCE, so "tidying" either could quietly un-verify the
  site and stall every advertiser application behind it.**
- 🚨⭐ **THE REAL JUDGMENT CALL, and it generalises to every future verification prompt: THE TRACKING-SCRIPT
  OPTION WAS REFUSED.** Impact offered five methods; a tracking script would have put a third-party script on
  every page load. ▶ **`/privacy` NAMES ITS SUB-PROCESSORS BY NAME (Anthropic, Supabase, MailerLite, Netlify,
  Plausible), so adding a sixth silently would have made a PUBLISHED LEGAL PAGE INACCURATE — on the exact page
  affiliate reviewers read.** It would also cost load time on every visit for no user benefit. **A meta tag
  brings no processor at all, so the policy stays true.**
- ⚠️ Email verification was passed over on a real constraint: those flows usually demand a specific address at
  the domain (`admin@`, `webmaster@`) and **iCloud caps this domain at THREE addresses, all three in use.**
- ✅ **Impact pulled her LOGO through automatically**, which is proof their crawler read the site.

### ▶ HER PREP SHEET IS AN ARTIFACT
https://claude.ai/code/artifact/ab604a44-11c7-4fb8-bc5e-f86a33d0b81e — the two doors and the evidence, the
fields to paste, the directory-check warning, and the network order. (The Rakuten one is
https://claude.ai/code/artifact/cefa1ee4-ee17-4a5a-987d-ac9ac48e192b.)

### ✅ THE "ADD AS AN APP" PAGE IS MERGED, LIVE AND BLESSED — the 08-19 morning entry below is STALE on this
It shipped as **PR #873** and she has now seen it on her phone: **"Add as an app looks great. I am happy with
how that turned out."** ⚠️ **The 08-19 morning entry lower down described it as unmerged and unseen; both of
its stale lines are corrected in place, but trust this one.**

### ▶ THE ORDER OF NETWORKS FROM HERE (unchanged, with Impact struck through)
**Rakuten ✅ · Impact ❌ (declined 08-20, appeal pending) · then AWIN** (⚠️ small REFUNDABLE deposit to apply, their spam filter, verify the
amount on the day) **· then CJ** (free) **· then NORDSTROM CREATORS when the followers are not the weak point
· AMAZON LAST**, because the **3 qualifying sales within 180 days of APPROVAL** clock starts at approval, not
at launch. 🚨 **ShareASale no longer exists** — Awin closed it at the end of 2025; any entry in this file
naming it is out of date.

### ▶ THE FIRST THINGS NEXT SESSION
1. 📬 **Did Impact respond?** Their own email says ~72 hours, so **Friday 22 August**. ⚠️ Silence past that is
   still not a decline; it is a queue.
2. 🔎 **THE DIRECTORY SEARCH, the moment Impact approves** — Nordstrom, Macy's, Bloomingdale's, her store
   table. **This is the highest-value thing she can report**, and it is what settles whether Nordstrom is
   reachable here at all. Same question stands on Rakuten.
3. ⭐ **ANY advertiser approval, on EITHER network, is the trigger for PRODUCT FEEDS** —
   `docs/product-feeds-plan.md` is shovel-ready. That is what turns a store SEARCH into a real product and
   what would let the app honestly say **"in your size"** again.
4. 💳 **The recurring payments + the $100 "initial capital contribution"** — still waiting on the cards.
5. ⏳ **Indie Law: the MAILING ADDRESS for the Statement of Correction**, and the **TM filing dates + serial
   numbers.** Signed ≠ filed.
6. ⭐ **The emailable wishlist** — she has named it FOUR times now (again 2026-08-20). Nothing blocks
   DESIGNING it; renders first.
7. ⚠️ **The two link-check Routines are still unread**, fourth session running.

## ▶ EARLIER THE SAME DAY (2026-08-19 morning — 🎉 THE BANK IS OPEN AND CLASS 045 IS ON BOTH MARKS)

### ⭐⭐ THE TWO THINGS THAT WERE BLOCKING EVERYTHING BOTH CLEARED (Aug 18)
**Both of the questions the 08-17 entry said to ask first came back YES.** The money path is genuinely
unblocked for the first time since June.
1. ✅✅ **THE TRUIST BUSINESS ACCOUNT IS OPEN** (Tue Aug 18, in person, as planned). ⚠️ **Her debit and
   credit cards are being MAILED and have not arrived** — ▶ **and that blocks NOTHING that matters today:
   affiliate networks pay by ACH/direct deposit or check using the ROUTING + ACCOUNT numbers, which she has
   had since the moment the account opened.** A card is only needed for the recurring-payment migration.
2. ✅✅ **CLASS 045 IS ON BOTH TRADEMARK APPLICATIONS — SHE WON THE ARGUMENT.** Indie sent CORRECTED
   three-class applications (035 + 042 + 045) for the word mark AND the logo, and **she has signed both.**
   ▶ **THE WHOLE 08-17 SESSION IS VINDICATED: she found the missing class herself, refused to sign, did the
   $2,100 ÷ $350 = SIX filings arithmetic, and got it fixed inside 24 hours.** Reuse the move: when a firm
   quotes a lump sum, divide it by the unit price — the quote itself proves the scope.
   ⚠️ **AND THE REASON IT HAD TO BE CAUGHT BEFORE SIGNING STANDS AS A PERMANENT LESSON: a class cannot be
   ADDED to a trademark application after filing, only removed.** Signing is not filing, so there was still a
   window — but she never needed it, because she held the line.

### ✅ THE OTHER LEGAL PIECES, ALL SIGNED (Aug 18)
She signed **everything**: the **Operating Agreement** (which is what Truist wanted, and what makes Exhibit A
true), the **Statement of Correction** (Bail → Bailey), and **both trademark applications**.
- ⏳ **THE ONE THING STILL WAITING ON INDIE: the MAILING ADDRESS for the paper correction.** The Statement of
  Correction is a physical filing to Tallahassee with a physical check, and the cover letter's instructions
  contradicted their email (it had HER mailing it; the email said send it back to them). **She is waiting on
  Almira to say where it goes.** ▶ **ASK NEXT SESSION whether that address arrived** — a signed correction
  sitting in a drawer fixes nothing.
- ⚠️ **STILL UNLOGGED AND WORTH CHASING: the TM FILING DATES + SERIAL NUMBERS.** Signed ≠ filed. **Log them
  here the moment they arrive**, and remember the filing basis is **Section 1(b) INTENT TO USE**, so the
  priority date lands on filing day but registration waits for a later Statement of Use with a specimen and
  another per-class fee. Ask Indie for that timing and cost.
- ▶ **AMBER'S PARKED SWEETENER: a free year of TM oversight + quarterly calls.** She declined it on 08-17
  while the fault was still open, which was the right call. **The corrections are done now, so it can be
  revisited** — never accept a sweetener while the fault is open, but a settled one is fair game.

### ▶ SO THE CHAIN NOW READS: LLC ✅ → EIN ✅ → BANK ✅ → **AFFILIATE APPLICATIONS** ← WE ARE HERE
Everything upstream is done. ⭐ **HER STATED GOAL FOR 2026-08-19, in her words: "it feels like an enormous
goal for today would be to submit first affiliate application???"** That is the right goal and she is ready.
- ⚠️ **THE SEQUENCING RULE IS UNCHANGED AND LOAD-BEARING: NETWORKS FIRST (ShareASale/Awin · Rakuten · Impact ·
  CJ), AMAZON LAST.** Amazon Associates requires **3 qualifying sales within 180 days of APPROVAL** or the
  account closes — and the clock starts at approval, not at launch. Applying to Amazon before there is real
  traffic burns the window for nothing.
- ⚠️ **The "Bail" typo does NOT block an application.** A W-9 asks for the LLC's legal NAME + EIN, and both are
  clean (the typo is a middle name inside Articles III/IV only). Do not let it become a reason to wait.

### 💰 THE AFFILIATE RESEARCH, DONE 2026-08-19 — RAKUTEN IS THE FIRST APPLICATION
▶ **HER PREP SHEET IS AN ARTIFACT:** https://claude.ai/code/artifact/cefa1ee4-ee17-4a5a-987d-ac9ac48e192b
(the fields to paste, the drafted site description, the two cautions, and the post-approval store order).
- 🚨 **STANDING-RULE CORRECTION: SHAREASALE NO LONGER EXISTS.** Awin bought it and **closed it at the end of
  2025**. Every earlier entry in this file that says "NETWORKS FIRST (ShareASale/Rakuten/Impact/CJ)" is naming
  a dead network. ▶ **The live list is: Rakuten Advertising · Awin · Impact · CJ.** ⚠️ **Awin charges a small
  REFUNDABLE deposit to apply** (reported as $5, more recently $1) — not a scam, it is their spam filter, and
  it is refunded against the first commission. Verify the amount at application time.
- 🚨🚨 **CORRECTED THE SAME MORNING, BY HER OWN SEARCH OF THE LIVE DIRECTORY — THE PREMISE WAS WRONG:**
  Claude recommended Rakuten first because blog sources said **Nordstrom, Macy's and Bloomingdale's** all ran
  through it. ▶ **In the real advertiser directory: NORDSTROM IS NOT THERE. MACY'S IS NOT THERE.
  BLOOMINGDALE'S IS**, along with plenty of other stores from her table.
  ▶▶ **NORDSTROM RUNS ON IMPACT**, via the **Nordstrom Creator Program — https://www.nordstromcreators.com**
  (verified live). It offers a **curated storefront of favourite Nordstrom products**, which is essentially the
  Style Star Edit, so it may fit her better than a plain affiliate link. **That is now the highest-value single
  application left, and it is a separate day's work.** Macy's network is still unidentified — find it before
  assuming.
  ⚠️⚠️ **THE STANDING LESSON, and it cost the headline reason for a whole recommendation: AFFILIATE-NETWORK
  MAPPINGS FROM BLOGS AND DIRECTORIES ARE UNRELIABLE AND GO STALE.** Programs move networks and the write-ups
  do not follow. ▶ **The ONLY trustworthy source is the network's own advertiser directory, read while logged
  in.** Never again promise her that a specific store is on a specific network before it has been seen there.
- ✅ **RAKUTEN IS STILL WORTH HOLDING, on the evidence rather than the pitch:** Bloomingdale's (~2%, **90-day
  cookie**) plus "lots of other good ones" she recognised from her own store table. The account is live, the
  payment details are verified, and she now understands the process. **It is probably her SECOND network
  rather than her first.**
- **Mechanics worth remembering:** free to apply · **approval in 2-5 business days** · **TWO STAGES** (Rakuten
  approves the PUBLISHER first, then she applies to each advertiser separately, each with its own bar) · the
  form asks for **monthly visitors** · payouts are **direct deposit, held until they reach $25**.
  Nordstrom is ~2-11% with a 30-day cookie; Macy's ~6%; Bloomingdale's ~2% with a **90-day** cookie.
- ⚠️ **THE CARDS BEING IN THE MAIL BLOCK NOTHING.** Affiliate networks pay by **ACH/direct deposit** using the
  routing + account numbers, which she has had since the account opened. Cards only matter for the recurring-
  payment migration.
- ⚠️ **THE ONE FIELD TO GET RIGHT, AND IT IS NOT OURS TO ANSWER: the W-9 entity type for a SINGLE-MEMBER LLC**,
  and whether the EIN or her SSN belongs in the tax-ID box. ▶ **Told her to ask her accountant, deliberately —
  the standing rule is never give tax advice**, and this is exactly the case it exists for.
- ⚠️ **SET HER EXPECTATIONS HONESTLY AND IT WAS DONE IN THE SHEET: her traffic is small, the honest number is
  the one to give, and NETWORK approval is likely while some individual ADVERTISERS will decline at first.**
  That costs nothing and is reapplyable. ▶ **A Nordstrom decline in September is not a verdict on the app** —
  say it that way if it happens.
- ✅ **She is genuinely ready, and the Contact page is why.** Every field a reviewer looks for exists:
  legal name · EIN · business bank · https://stylestar.app · **/privacy · /terms · /contact** ·
  `partners@stylestar.app` · an affiliate disclosure on every surface that carries a link.
  ⚠️ **The "Bail" typo does NOT block it** — a W-9 wants the LLC's legal NAME + EIN, both clean.
- ▶ **POST-APPROVAL ORDER, which is just her traffic ranked:** Nordstrom → Macy's → Bloomingdale's → every
  other Rakuten advertiser that matches her store table.
- ⭐ **AND THE SECOND PRIZE IS THE REAL ONE: approved publishers can pull PRODUCT FEEDS** (names, prices, stock,
  sizes). That is what turns a store SEARCH into an actual product and what would let the app honestly say
  **"in your size"** again. `docs/product-feeds-plan.md` is shovel-ready. **Trigger: the first approval email.**
- ⚠️ **AMAZON STAYS LAST, unchanged: 3 qualifying sales within 180 days of APPROVAL** or the account closes,
  and the clock starts at approval, not at launch.

### ✅✅ SHE IS A RAKUTEN PUBLISHER — LIVE 2026-08-19, 8:33 AM (the goal, met)
**Publisher Dashboard is open. Account "Style Star", `SID 4740535`, channel Status ACTIVE.** ▶ **THE CHAIN THAT
STARTED IN JUNE IS COMPLETE: LLC ✅ → EIN ✅ → BANK ✅ → FIRST AFFILIATE APPLICATION ✅.** Her stated
"enormous goal for today" was to SUBMIT one; she is through and approved instead.
- **What she answered:** business set-up **Part of a company** (the LLC, not an individual — the whole reason
  she waited since June) · category **Shopping/Marketplace** · primary channel **https://stylestar.app** ·
  social **deliberately SKIPPED** (addable later from ACCOUNT → CHANNELS) · tax ID entered.
- ✅ **PAYMENT METHOD IS IN AND VERIFIED** (direct deposit, Truist). ⚠️ **The form REQUIRED a SWIFT code even
  with Country US** — Truist's is **BRBTUS33** (from truist.com's own wire documents; BRBTUS3X and SNTRUS3A are
  also accepted for incoming). ▶ **The pay-to name is the LLC, not her** — ACH bounces when the payee does not
  match the account title, and the 1099 will be issued to the LLC. **Not tax advice, just plumbing** — say it
  that way so she does not stall waiting on an accountant for it.
- ✅✅ **SHE APPLIED TO A LOT OF ADVERTISERS the same morning**, working her own deep-catalog list. **Bloomingdale's
  confirmed "we will email you."** ⚠️ **MY ADVERTISERS reads "no partnerships at this time" and THAT IS CORRECT:
  it lists APPROVED partnerships only, and nothing has been reviewed yet.** Pending applications usually sit
  behind a status filter that defaults to Approved. ▶ **Realistic timeline to give her: a few hours for the
  auto-approvers, 2-10 business days for most, and some decline silently.** Rakuten also had **scheduled
  maintenance Fri Aug 21** which may slow the weekend.
- ⭐ **AND THE REASON TO APPLY NOW RATHER THAN WAIT FOR TRAFFIC: ONE advertiser approval unlocks PRODUCT FEEDS**,
  which is the thing that turns a store SEARCH into a real product and lets the app honestly say "in your size"
  again. `docs/product-feeds-plan.md` is shovel-ready. **Trigger: the first approval email.**

### ⚠️ THE THREE TRAPS THAT COST HER AN HOUR ON THAT FORM — ALL REUSABLE
She hit every one of these in sequence and briefly thought she had ruined the application. **She had not: an
UNVERIFIED account is not an application, nothing was submitted, and no advertiser ever saw a failed attempt.**
▶ **Say that first if she ever panics mid-form again** — the reassurance is factual, not comfort.
1. 🚨 **THE `.com` / `.app` TYPO, AGAIN.** She registered first with `partners@stylestar.com`, which does not
   exist, so the verification email could never arrive. ▶ **This is the THIRD time `.app` has bitten this
   project** (the dead signature links, the plain-text auto-link failure). **The dead account is inert — leave
   it, do not try to delete or recover it.** The fix was to log in to the `.app` account that already existed.
   ⚠️ **"Email already exists" was GOOD NEWS, not a wall** — it meant the account she wanted was already made.
2. 🚨 **iOS HANDED HER TO THE INSTAGRAM APP AND KILLED THE FORM.** Tapping the Instagram step on her phone
   opened the Instagram APP, which threw her out of Rakuten mid-application. ▶ **The exact universal-links
   behaviour already documented here for lululemon and Nordstrom Rack — not fixable, only avoidable.**
   ⚠️ **STANDING: do long multi-step forms on the LAPTOP, and skip any social CONNECT step** (a plain text
   field for a URL is harmless; an OAuth "connect" button is what hijacks). Social is addable later.
3. 🚨 **RAKUTEN'S URL VERIFIER DOES NOT FOLLOW A REDIRECT.** `http://stylestar.app` failed with "Unable to
   verify URL" because Netlify answers it with a **301 to https**, and the checker reads the 301 as a failure.
   **`https://stylestar.app` validates instantly.** ▶ **STANDING: always give any verifier the full `https://`
   form** — the site is fine, the checker is literal.
- ⭐⭐ **AND THE ONE THAT WAS CLAUDE'S TO GET WRONG: THE PUBLISHER CATEGORY.** Claude recommended
  **Creator/Influencer** by inferring Rakuten's taxonomy from general industry usage, and **the recommendation
  was WRONG — her own first instinct, Shopping/Marketplace, was right.** Rakuten's own `?` tooltip settles it:
  Shopping/Marketplace is *"browse from a curated selection of products and brands... **hand-selected products**...
  a **virtual mall experience**... or offer **personal shopping/concierge services**"* and explicitly **NOT** a
  deals/coupons destination — which is a description of the Style Star **Mall** and **Edit**. Creator/Influencer
  is defined as content *"created for social media"*; Content & Media is *"editorial content"*. Neither is her.
  ▶ **THE LESSON, and it generalises past this form: WHEN A FORM SHIPS ITS OWN DEFINITIONS, READ THEM BEFORE
  REASONING FROM WHAT THE LABEL USUALLY MEANS.** Telling her to tap the `?` is what caught it.

### ▶ HER OTHER ASKS FROM THIS MESSAGE (all recorded, none started)
1. 💳 **MOVE THE RECURRING PAYMENTS TO THE BUSINESS CARD — she wants to, but NOT YET** (the cards are still in
   the mail). The list, unchanged: **Claude Max ~$250/mo (iCloud account) · Anthropic API credits (gmail
   account, consider moving the org to a business email) · Netlify · the stylestar.app domain · MailerLite.**
   `BUSINESS-EXPENSES.md` tracks the personal-card spend. ⚠️ **Flag an accountant for the pre-bank expenses;
   never give tax advice.** ▶ **Also still to do the moment the account is usable: transfer $100 labelled
   "initial capital contribution"** — the first entry in the books, and what makes Exhibit A true.
2. ⭐ **THE EMAILABLE WISHLIST — she named it again, third time now.** See the full entry lower in this file
   (2026-08-16). ⚠️ **The constraint that shapes the whole build: AMAZON ASSOCIATES BANS AFFILIATE LINKS IN
   EMAIL**, so the email carries ONE link into a shareable wishlist PAGE and the retailer links live there.
   The privacy line is already decided: the shared view is the **LIST ONLY**, never her sizes or preferences.
   **Nothing blocks DESIGNING it now; renders first, per the standing rule.**
3. ✅✅ **BUILT AND MERGED-READY 2026-08-19 — THE "ADD AS AN APP" PAGE.** See its own entry below.
   ▶ **ORIGINAL ASK, kept for the reasoning:** an "Add Style Star to your phone" page at the bottom
   of the Menu.** Her words: *"maybe at the
   very bottom of our drop down menu we could put an Add Style Star as an app on your phone page and explain
   how to do that. I know we put it in as a small thing but could be cool to have it in the drop down menu
   too."* ▶ **This is a genuinely good instinct and it fixes a REAL gap already flagged in this file: the A2HS
   whisper is WELCOME-BACK-ONLY, so a first-time visitor never sees it at all**, and the whisper is a nudge
   she can scroll past rather than a place she can go looking for. **A menu row is findable by name — the mom
   lesson.** ⚠️ **When it is built, reuse the 2026-08-05 wording and the A2HS lessons wholesale:** her own
   copy, the real app-icon preview, the numbered steps that do NOT undercount the iOS flow (Share → sometimes
   View More → SCROLL → Add to Home Screen), *"your browser's toolbar"* and NEVER "at the bottom of your
   screen", and **nothing on the iOS path that looks tappable** (Apple exposes no install API, so a
   button-shaped thing there is a promise the platform cannot keep). Android keeps its real working button.
   ⚠️ **The Menu is 19 rows now and its tail already sits below the fold — measure, do not assume.**
4. ✅ **THE CONTACT PAGE IS BLESSED ON HER PHONE: "looks great on my phone all good there."** The 08-17
   open item is closed.
5. ⚠️ **THE TWO LINK-CHECK ROUTINES ARE STILL UNREAD**, third session running. Her decision on which to keep
   is still open. Do not let it quietly become permanent by neglect.

### ✅✅ THE "ADD AS AN APP" PAGE IS BUILT (2026-08-19, her ask → her picks → shipped same session)
**`s-a2hs`, reachable from a new Menu row in the About group above Contact. ✅ MERGED AS PR #873 AND
BLESSED ON HER PHONE 2026-08-19: "Add as an app looks great. I am happy with how that turned out."** ▶ **Why it exists, and it is a real gap not a nicety: the A2HS whisper is
WELCOME-BACK-ONLY, so a first-time visitor never meets it at all**, and a whisper is something she scrolls
past rather than a place she can go looking for.
- **HER PICKS, all three:** layout **B** of three renders (the app icon shown on a mock home screen, so the
  page answers "what do I actually get?" with a picture) · row label **"Add as an App"** · and she **agreed
  the row belongs in the About group beside Share and Instagram, NOT at the literal bottom** — the Menu is
  20 rows and its tail sits below the fold, so the very bottom is the LEAST visible row on it.
- ⭐⭐ **HER INSIGHT THAT SHAPED THE WHOLE PAGE, and it is the keeper: "Add to Home Screen is not intuitive
  to most users... some people might think it's like changing background photo on their phone."** ▶ **So the
  ROW says "Add as an App" in plain words and the PAGE explains what her phone's own button will say:**
  *"Add to Home Screen just means the screen your apps live on, so nothing about your wallpaper or your
  photos changes."* ⚠️ **Her second edit on that line: the first draft opened "Your phone calls it…" and she
  caught that it reads like a TELEPHONE CALL.** Leading with the button name instead also ties it to step 2.
- ⭐ **NO PINK HEART ON THIS PAGE, her call: "it's not really my voice here."** ▶ **That is HER OWN MARK
  SYSTEM applied correctly** (2026-08-10: tilted pink heart = CATHERINE SPEAKING). This page is
  instructions. **The Welcome Back whisper keeps its heart** — that one IS her voice. Asserted both ways.
- ⚠️ **FOUR STATES, because a page she navigated to DELIBERATELY must never be blank** — which is why
  desktop gets a real answer here ("open stylestar.app on your phone") where the whisper correctly shows
  nothing at all. iOS = steps · Android = a real button off a real `beforeinstallprompt` · already
  installed = says so. **Her wording from 2026-08-05 is otherwise kept verbatim.**
- 🚨⭐ **TWO BUGS THE RENDER CAUGHT THAT 53 GREEN CHECKS DID NOT, both reusable:**
  1. **THE HEART RENDERED ENORMOUS.** `_A2_HEART` carries `class="a2-h"`, whose size lives under **`#a2hs`
     — the WHISPER's scope** — so on the new page the rule did not apply and the SVG fell back to its
     default size. ▶ **ASSERT DIMENSIONS, NOT JUST POSITIONS** (the 2026-08-11 lesson, violated the same
     day it was quoted): the test measured `.ap-step svg` and got the SHARE glyph, and every positional
     check passed. ⚠️ **A class carries its styling only inside the scope that defines it** — moving markup
     to a new screen does NOT bring its CSS.
  2. **REMOVING THE LETTERHEAD LOGO (her call) REMOVED THE CHIP CLEARANCE.** The logo was the only thing
     holding the title clear of the fixed Menu chip; without it the title sat **0px** below it. ⚠️ **In the
     sandbox that reads as merely touching — on a real iPhone `env(safe-area-inset-top)` pushes the chip
     down ~47px and it would land ON the title.** ▶ **The title now borrows the SAME `env()` the chip uses**
     (`margin-top:calc(18px + env(safe-area-inset-top,0px))`), so the clearance holds on every phone.
     **Don't replace it with a flat margin.**
- ⚠️ **The heart was also stranded alone on step 2's second line** — fixed with **`text-wrap:balance`**, her
  standing widow lever, which ⚠️ **needs `display:block` to work on a flex item**. Moot now the heart is
  gone, kept because the wording still sits near the width limit. ▶ **"Choose Add to Home Screen" fits one
  line at every width and was DELIBERATELY NOT TAKEN: it drops "scroll down", and she declined that exact
  trade on 2026-08-08** — an instruction that undercounts the real iOS flow is worse than none.
- **Suites: new `scratchpad/a2page.js` 58 checks** (menu row → page, all four states, nothing tappable on
  the iOS path, the wallpaper explanation present, hearts absent here + still present in the whisper, AA
  contrast on every text against the real painted paper, no overflow 390/360/320, Back returns, zero JS
  errors) · **menu 87 · nav 82 · e2e 29 green.** ⚠️ **THREE COUNTS UPDATED DELIBERATELY, NOT SILENCED:**
  the Menu is **20 rows** and there are **14 standard footers**. ▶ **Verified separately that NOTHING WRAPS
  before touching the count** — every row measured 43-44px against a 46px threshold, so only the count moved.
  ⚠️ **`menu.js` and `menux.js` both test single-line by HEIGHT ÷ line-height, and that is the right
  instrument: rect-top clustering FALSELY flags the four rows carrying inline marks** (the Start here pill,
  the pink hearts), because `getClientRects` returns a rect per ELEMENT.
- ✅ **CLOSED 2026-08-19: merged as PR #873 and blessed on her phone.** See the late-session entry at the top.

### ⚠️ FOUR PRs SHIPPED 2026-08-18 THAT THE 08-17 ENTRY NEVER RECORDED (#869 · #870 · #871 · #872)
All merged to main, branch level with main, tree clean. **A sign-off polish round off her live testing, and
the diagnosis is the reusable part.**
- **#869** — her **name was 10px left of centre** on Contact, because the line was centring the word PLUS the
  heart. **A negative right margin cancels the heart's footprint so the WORD centres and the heart overhangs**,
  which is what a handwritten sign-off does anyway (the My Story title-mark trick). Measured 0px off now.
- 🚨⭐ **#870 — BOTH GAPS SHE WANTED TIGHTENED WERE INVISIBLE IN THE MARKUP AND INVISIBLE TO THE OBVIOUS
  MEASUREMENT, and this is the lesson:** (1) the gap between her name and the heart was mostly a **TRAILING
  SPACE in the text node**, 6.8px of it — **a box measurement cannot see it because the box INCLUDES the
  space**, which is why the rects kept reporting 1.4px while her eye saw far more; removing it took the
  visual gap 7.9px → 2.1px. (2) The white space above the title was **LEADING, not margin** —
  `line-height:normal` gave DM Serif Display a **36px line box for 17px of cap height**, so 9.5px sat INSIDE
  the box where no margin change could reach it (which is why cutting the margin to 2px barely moved
  anything). `line-height:1` took the ink gap 11.5px → 4.5px. ▶ **Add both to the measurement-trap family:
  when a gap will not close, suspect a trailing space or leading before you touch margins again.**
- **#871 / #872 — the same trailing space was on My Story (7.3px) and the Style Star Edit (7.8px).** **All
  three sign-offs now measure 2.1px** and match. ⚠️ **The inline styles are stripped to width/height on all
  three so the RULE owns the position and cannot silently lose to an inline value; a comment at `.dc-sign`
  names the grep that finds all three, because they now have to move together.**
- **`scratchpad/contact.js` is 81 checks**, with the trailing space pinned by exact text-node value so it
  cannot creep back invisibly.

## ▶ PREVIOUS — 2026-08-17 (THE LEGAL DAY: A PAID-FOR TRADEMARK CLASS WAS MISSING, AND SHE CAUGHT IT)

### ⏸ WHERE THIS SESSION IS (the call HAPPENED; ▶ SHE HAS A TRUIST APPOINTMENT TUE AUG 18, 1 PM)
**NO APP CODE SHIPPED TODAY. Zero Netlify builds.** One commit on `claude/style-star-hg3dut`: the Contact page
RENDERS + harness, nothing live. ▶ **THE WHOLE DAY WENT TO THE LEGAL THREAD, and it was worth it.**
Her prep sheet is an artifact: https://claude.ai/code/artifact/bfb0a0d4-001f-4ab4-8bba-69dbec4c8546
- ▶▶ **THE FIRST TWO THINGS TO ASK NEXT SESSION: (1) did the Truist account open, (2) did Indie Law's written
  follow-up actually arrive.** Then **LOG THE TM FILING DATES + SERIAL NUMBERS HERE.**

### ☎️ THE CALL: AN APOLOGY AND AN ESCALATION, NO ANSWERS YET (12:30 PM Mon Aug 17)
It was with **AMBER, not Almira** — the third person on this case. ⚠️ **She had NOT read Cath's email**, so Cath
asked her to pull it up and read it live. **Her reaction was "OH MY."** ▶ **THAT IS THE WHOLE CALL: the 045
finding is now UNDISPUTED on their side.** Nobody argued the class was deliberately dropped or that the $700 was
accounted for. Amber blamed a "new system" migration and said the ball got dropped.
- ⭐⭐ **CATH'S BEST MOVE, and it is the one worth remembering: Amber offered a FREE YEAR OF TM OVERSIGHT + QUARTERLY
  CALLS, and Cath declined it and went straight back to "let's get this corrected."** That was a sweetener offered
  BEFORE the problem was fixed; most people would have taken it and lost the thread. ▶ **The offer is parked, not
  rejected — revisit it once the corrections are actually done. Never accept a sweetener while the fault is open.**
- She asked for: correction, a **written follow-up saying how each item will be addressed and when**, and a
  **callback by end of day**. Amber gave her direct phone number and said she is **escalating to management**.
  ⚠️⚠️ **"ESCALATING TO MANAGEMENT" IS WORD-FOR-WORD WHAT THEY SAID ON AUG 13 with no date attached. That is a
  REPEAT, not progress.** The only thing that makes today count is whether the written follow-up lands.
- ✅ **She sent a RECAP EMAIL straight after the call** — the five items, the deadline, and the standing line
  **"I will not be signing either application until Class 045 is included in both."** ▶ **Standing move: a verbal
  promise with no written trace is exactly what has failed her for two months. Always recap a call in writing.**
- ▶ **She raised her son (a 2nd-year law student who told her to hire a specialist) and said she feels a student
  could have done better. She second-guessed it afterwards; the read given was that it is fine** — warm in tone,
  concrete rather than abstract, and Amber apologized rather than getting defensive. ⚠️ **It is a card that plays
  ONCE. Do not let her return to it.**
- **NOTHING IS SIGNED.** Hold that line.

### ⭐⭐ THE UNLOCK SHE ALMOST MISSED: THE BANK ACCOUNT WAS NEVER BLOCKED BY THE TRADEMARK MESS
She was experiencing the legal thread as one big blockage. **It is two threads.** Articles ✅ + EIN ✅ is what a
bank needs; Indie Law gates none of it. ▶ **Told to her plainly, and it visibly changed her day** ("wowwww").
- ✅ **APPOINTMENT BOOKED: TRUIST, in person, TUE AUG 18, 1 PM.** She banks with Truist personally.
- **WHY TRUIST, and the reasoning generalises:** **Truist Simple Business Checking has NO monthly maintenance
  fee** (50 free transactions/mo, $2,000/mo free cash deposits — she will use ~10-15 and zero cash). Plus
  **instant transfers between her personal and business accounts**, which she will use constantly.
  ⚠️ **The Orlando-local options were RULED OUT ON HER NUMBERS, not on principle: FAIRWINDS needs a $35,000
  average balance to waive its fee and Orlando Credit Union needs $7,500.** Space Coast CU and MIDFLORIDA CU are
  genuinely free with no minimum and were the recommendation until she said she banks at Truist. ▶ **Online-only
  business banks (Novo/Relay/Bluevine) were argued AGAINST for her specifically — no branch, support-queue only,
  and she is already managing one relationship that exists only through a queue.**
- **WHAT SHE TAKES:** Articles of Organization · **EIN letter (CP575)** · signed+dated Operating Agreement ·
  driver's license · doc number L26000395689. ⚠️ **The ONLY thing not ready is her SIGNATURE on the Operating
  Agreement** — she has VIEW access only, so it is the .DOCX download, fill the effective date, sign, keep a copy.
- ⚠️ **The "Bail" typo does NOT block the bank** (they care about LLC name + EIN + her ID), and the EIN letter
  reading "STYLE STAR BY CATHERINE LLC" without the comma is normal IRS formatting, not a mismatch.
- ▶ **THE MOMENT IT OPENS, in order:** (1) **transfer $100 labelled "initial capital contribution"** · (2) move
  the recurring payments off her personal card — **Claude Max ~$250/mo (iCloud account) · Anthropic API credits
  (gmail account, consider moving the org to a business email) · Netlify · the stylestar.app domain · MailerLite**
  (`BUSINESS-EXPENSES.md` tracks the personal-card spend; ⚠️ **flag an accountant for the pre-bank expenses,
  never give tax advice**) · (3) **affiliate applications — NETWORKS FIRST (ShareASale/Rakuten/Impact/CJ),
  AMAZON LAST** because the 180-day/3-sales clock starts at APPROVAL, not at launch.

### 🚨⭐⭐ THE HEADLINE: CLASS 045 WAS MISSING FROM BOTH TRADEMARK APPLICATIONS AND SHE PAID FOR IT
Indie Law sent both TM applications for her signature. **She opened them and found Class 045 absent from BOTH
the word mark and the logo.** ▶ **THE EVIDENCE CHAIN IS AIRTIGHT and lives in her Jun 25 → Jul 2 email thread:**
- **Jun 25** she asked for it in her own words: *"I'd like to add Class 045 (personal stylist / fashion
  consultancy services). I'm an actively practicing personal stylist and will be operating under the Style Star
  name."* ⭐ **HER PLAN, RECORD IT: dissolve her personal-shopping SOLE PROPRIETORSHIP and run those services
  under Style Star.** That is why 045 is not optional for her.
- **Jun 30** Indie agreed, wrote the 045 description, and quoted: *"For both the word mark and the logo across
  your selected classes, the total government filing fees come to $2,100."*
- **Jul 2** she confirmed all three classes in writing and paid $2,100. They replied *"all set to move forward."*
- **Aug 17** both applications show **2 classes (035 + 042), $700 each**.
- ⚠️⚠️ **THE ARITHMETIC IS EXACT AND IT IS THE WHOLE ARGUMENT: $2,100 ÷ $350 = SIX class filings (3 classes ×
  2 marks). The drafts cover FOUR. $700 of her money is unaccounted for — precisely the two missing 045
  filings.** ▶ **Reuse this move: when a firm quotes a lump sum, divide it by the unit price. The quote itself
  proves the scope.**
- ⚠️⚠️ **WHY IT HAD TO STOP BEFORE SIGNING: A CLASS CANNOT BE ADDED TO A TM APPLICATION AFTER FILING** (removed
  yes, added never). The only route is a NEW application at a LATER PRIORITY DATE — the exact thing she has been
  protecting since June. **She has not signed. Do not let her sign until 045 is on both.**
- **She sent a firm email before the call** (her ask: firm tone, and include the pattern). It leads with 045 +
  the $700, then the Statement of Correction, then the pattern, and asks for: 045 on both before filing · where
  the $700 sits · a corrected Statement · a specific filing date · **nothing filed without her written approval.**

### ✅ THE EIN EXISTS — THE MONEY PATH IS UNBLOCKED
**IRS Notice CP575, issued August 4 2026**, sitting in Indie's Drive folder. She was never told; she learned it
**Aug 17, thirteen days later**, in a subordinate clause. ⚠️ **She had a drafted line ready saying she would get
the EIN herself from the IRS — sending it would have created a DUPLICATE EIN.** Their silence nearly cost her that.
- ✅ **Verified clean: it reads CATHERINE ELLSPERMANN, no "BAIL".** Federal record is correct.
- ✅ **She downloaded and emailed herself a copy.** ⚠️ **STANDING: the IRS issues CP575 ONCE and will not reissue
  it** (a lost one means phoning for a 147C). Same rule applied to every doc living in the firm's Drive.
- ▶ **SO THE CHAIN IS NOW: LLC ✅ + EIN ✅ → BUSINESS BANK ACCOUNT → affiliate applications** (networks first;
  Amazon last, the 180-day/3-sales clock). **Bank wants: Articles + CP575 + her ID (+ maybe the Operating Agreement).**

### 🚨 THE STATEMENT OF CORRECTION CORRECTS NOTHING (Claude's catch, she confirmed by zooming)
The form meant to fix "Bail" → "Bailey" reads: *incorrectly listed as "Catherine **Bailey** Ellspermann" … the
correct name is "Catherine **Bailey** Ellspermann"*. **Both fields say Bailey.** As drafted it is a no-op that
would cost $25 and a trip to Tallahassee. Also: **it addresses ONLY the registered agent, but the typo sits in
Articles III AND IV** (IV is the MEMBER field, her ownership record). And the cover letter has HER mailing it with
HER check, while their email said to send it back to them. All three are in her email.
- ✅ **Answered: the wet signature is genuine** — it is a paper filing mailed to Tallahassee with a physical check.
- ⭐ **The typo now sits in exactly ONE place: the filed Articles.** EIN clean, Operating Agreement clean. That
  disagreement between her state filing and her federal record is the real reason to fix it, not the $25.

### ✅ THE OPERATING AGREEMENT IS COMPLETE (the Aug 5 open items are closed)
§1.2 now reads "Catherine Bailey Ellspermann" (the `#Registered Agent Name#` placeholder is gone), and **Exhibit A
is filled: 100% ownership, $100 capital contribution.** Only the effective date is blank, correctly — hers to date.
- ⭐⭐ **NEW ACTION ITEM CREATED BY SIGNING IT, add to the bank-account list: TRANSFER $100 from personal into the
  business account and label it "initial capital contribution."** It is the first entry in the books and it is what
  makes Exhibit A true; the liability shield rests on business and personal money being genuinely separate.
- ⚠️ She only has VIEW access to that Google Doc — she needs the .DOCX download to sign, and her own saved copy.

### ⚠️ THE TRADEMARK APPLICATIONS, EVERYTHING ELSE SEEN
- **Filing basis is Section 1(b), INTENT TO USE**, on both. Conservative and probably right (app is live but free).
  ▶ **Consequence: she gets her PRIORITY DATE on filing day, but no registration until a later STATEMENT OF USE
  with a specimen, which carries another per-class fee.** Ask timing + cost.
- **The 035 and 042 descriptions are genuinely well drafted** and accurately describe the app. No concerns.
- ⚠️ **The logo image is BLURRY/low-res** — real concern, she offered to send a high-res file.
- ⚠️⚠️ **The logo is GREYSCALE, and this is probably CORRECT, not an error — flagged to her so she would not
  overreach:** a logo filed in black and white with no colour claim is protected **in ANY colour**; filed in
  colour it is protected only in those colours. **Raised as a question, never an accusation** — a weak point
  standing next to the airtight 045 point weakens the whole email. ▶ **Reusable: never let a shaky claim ride
  alongside a certain one.**
- Principal Register, correct. Two applications total ("STYLE STAR" and "STYLE STAR (LOGO)").

### ▶ THE PATTERN SHE ASKED TO PUT IN WRITING (her call, and the 045 find justified it)
LLC approved **Jul 27** — she found it herself on Sunbiz **Aug 5** while being told it was monitored. EIN issued
**Aug 4** — told **Aug 17**. Now a class she asked for, they confirmed, and she paid for is missing from both
applications. **She has found every one of these herself, having paid $3,999 + $130 + $2,100 = $6,229.**
⚠️ **Claude first advised keeping the communication complaint for the CALL, not the email. She overruled it and
she was right** — once it stopped being "poor communication" and became a documented service failure, the pattern
is context, not grievance. ▶ **Her judgment on her own relationships has been better than Claude's twice now.**

### ✅✅ THE CONTACT PAGE SHIPPED — PR #868, MERGED AND CURL-VERIFIED LIVE (2026-08-17)
**`stylestar.app/contact` is live**, on the same rewrite machinery as /privacy and /terms, so she has a URL to
paste into every affiliate application form. **One Netlify build.** Branch resynced to main, tree clean.
- **HER PICKS, every one of them:** two cards · the address as the **BLACK LACQUER + GOLD MARQUEE PILL** ·
  **SILVER `#9AA0A6` card borders** (the display-case frame's OWN silver, so the page settles into THREE
  materials instead of gaining a fourth) · her signature + pink heart · the LLC line beneath.
- ⭐⭐ **THE BRONZE LESSON, and it generalises: a gold dark enough to be READABLE AS TEXT stops looking gold.**
  #A0761B measured **3.98:1** on the cream card and the AA-passing #8F6410 read brown — the third time she has
  rejected a dark antique gold. ▶ **THE FIX WAS TO STOP ASKING GOLD TO BE TEXT: on black lacquer it does not
  have to be, so the marquee pill she already approved (SAVED, the portrait CTA) took over and contrast went
  3.98 → 12.4:1.** Reuse this whenever a gold has to clear AA.
- ⭐ **HER CATCH THAT MADE THE PAGE: "I read every message myself" never says who "I" is.** ▶ **The answer is
  her NAME, not her ENTITY** — the LLC name answers *what company is this*, a different question, and reads cold
  under a warm sentence. So the page is signed **"Catherine ♥" in Dancing Script with the shared `.pinkheart`**,
  identical to the My Story and Edit sign-offs, and the LLC line sits below in the footnote position.
- ⭐ **HER OTHER CATCH: the lead and card one were redundant.** ▶ **The rule that came out of it: THE LEAD
  INVITES, THE CARDS ROUTE.** Card one was listing what you might write about (the lead's job); it now says who
  it is for, like card two. A test fails if it ever drifts back.
- ⭐ **AND SHE CAUGHT THE MISSING FRAME**, which was a real gap not a preference: **`show()` hands every legal
  page a skin class that paints the display-case frame** and Contact never got one. ⚠️ **Two related
  inconsistencies fixed with it: `show()` now hides the shared header + global footer for `s-contact` too**,
  which showContact() had been doing alone.
- ✅ **THE CLICKABLE-LINK FIX:** the address was a link in the FAQ but PLAIN TEXT in Privacy (×2) and Terms (×1),
  and the privacy deletion sentence said "email us" naming **no address at all**. All four are mailto links now;
  the shared legal-page rule covers `<a>` as well as `.lnk` so they cannot render browser-default blue.
- **Contact is in the Menu after FAQ** (19 rows) **and the footer's information row** (each page still omits its
  own link). **New `scratchpad/contact.js` 80 checks.** nav 82 + menu 87 updated DELIBERATELY (13 footers, 19
  rows). copy 41 · affq 40 · e2e 29 · hubs 49 green.
- ▶ **STILL OPEN:** she has NOT seen it on her phone yet. And **Almira never answered whether the LLC name
  belongs on the site** — it shipped on the page anyway, which is normal and safe; move it if the lawyer says so.
- ⭐ **`partners@stylestar.app` EXISTS AND WORKS**, with `hello@`, `partners@` and `catherine@` each routed to
  their own iCloud folder. ⚠️ **iCloud caps a domain at THREE addresses per person — she is at the cap.**
  The escape hatch is sharing the domain with another Apple ID. ⚠️ **`catherine@` is deliberately NOT on the
  site**; it is for her outbound mail. Her email signature is set on both Mac and phone.
- ⚠️⚠️ **THE `.app` TLD DOES NOT AUTO-LINK.** Her signature's links were dead until written as full
  `https://stylestar.app` — most link detectors work from a list of known TLDs and `.app` is not on it, and
  `@style_star.app` reads as an EMAIL ADDRESS to a parser. ▶ **STANDING: anywhere she writes the app's address
  in plain text — texts, Instagram captions, DMs, tester invitations — use `https://stylestar.app` or the link
  will not be tappable.** A link that does not turn blue is a visit she does not get.

### ⏸ SUPERSEDED — the parked state of the Contact page, kept for the reasoning
She asked whether she needs a **Contact page**, a **For Brand Partners page**, and a **separate affiliate email**.
- ▶ **THE ANSWERS GIVEN: Contact YES (as a real page with a `/contact` URL, because application forms ask for a
  pasteable URL) · Brand Partners NO, NOT YET (it is a media-kit page whose job is to show audience numbers she
  does not have yet; an empty one reads worse than none) · separate email YES.**
  ⚠️ **REVISIT TRIGGER for the partners page: when she has a few months of real Plausible numbers.** Direct brand
  deals pay far better than network commissions, and that page is how brands find her.
- ✅ **DISCOVERED: `hello@stylestar.app` ALREADY EXISTS and works** (FAQ + Privacy + Terms). **stylestar.app mail
  routes to iCloud** (mx01/mx02.mail.icloud.com; SPF covers icloud + MailerLite), so **adding `partners@` is a
  settings change, not a new subscription.** ▶ **Recommended `partners@` over `affiliates@`** (covers brand deals
  later) **as an ALIAS INTO HER NORMAL INBOX** — an address she does not check is worse than one she does, and an
  Amazon 180-day notice cannot be allowed to sit unread. **SHE ASKED FOR HELP SETTING IT UP — still to do.**
- ⚠️⚠️ **SEQUENCING RULE: do not publish `partners@` before the alias exists.** A live page with a bouncing
  address is worse than no page, especially when an affiliate reviewer is the one emailing it.
- **Three renders made and she likes them** (`scratchpad/contactmock.js` → `contact-{a,b,c}.png`): **A two cards ·
  B one warm note · C labelled rows. A was recommended** (most obviously a real business; the gold-bordered cream
  card is already the app's own language). **SHE HAS NOT NAMED A LETTER.**
- ▶ **HER OPEN QUESTIONS, unanswered:** wording changes she wants · **whether her full legal name and "Style Star
  by Catherine, LLC" should appear on the page** · whether a date or other official wording belongs there.
  ⭐ **She was told to ask the lawyer whether the LLC's legal name should appear on the site and where** — Claude's
  instinct is the **Terms** are the home for the legal entity and the Contact page stays human. **Get her answer.**
- **Also in scope when it builds:** the email is a clickable link in the FAQ but **plain text in Privacy (×2) and
  Terms (×1)**, and the privacy deletion sentence says "email us" with no address at all. All to be linked.
- **Claude drafts, unblessed:** the lead paragraph, "I read every message myself", and "Contact" vs "Get in touch".
- ⚠️ **The Menu would go to 19 rows** (its tail already sits below the fold). Proposed placement: **after FAQ**,
  keeping Privacy/Terms as the legal tail. **Measure, do not assume.**

### 🚨⚠️ THE RENDER TRAP FOUND 2026-08-17: SCREENSHOTS HAVE BEEN USING FALLBACK FONTS
**Chromium in this sandbox CANNOT reach fonts.googleapis.com** (`ERR_CONNECTION_RESET` direct; with the proxy
configured it makes NO request at all). So every screenshot silently renders in generic serif/sans, and
**`'Dancing Script',cursive` comes out as a BOLD SERIF** — which is how her handwriting signature was nearly
shipped looking wrong. ⚠️ **The tell is subtle: DM Serif Display still looks like a serif and Jost still looks
like a sans, so a render looks plausible while no real face is loaded.**
- ⚠️⚠️ **A COMPUTED `font-family` CANNOT CATCH THIS — it returns the DECLARED stack, not the painted face.**
  The suite asserted `/Dancing Script/` and passed while the browser painted Times. ▶ **The real probe is a
  WIDTH TEST: render the same string in the target face and in `serif` and assert the widths DIFFER** (90.6 vs
  111.2 here). `document.fonts.check()` also lies — it returns true for a fallback.
- ✅ **FIXED, and reusable: `curl` CAN reach Google Fonts even though Chromium cannot.** `scratchpad/fonts/`
  now holds the real woff2 files + a rewritten `gf.css`, and **`scratchpad/renderfonts.mjs`** serves them by
  intercepting the page's own stylesheet link. ▶ **USE IT FOR EVERY DESIGN RENDER FROM NOW ON:**
  `node scratchpad/renderfonts.mjs /contact contact-real 390,320`. It prints `realFontsLoaded:true` and the
  list of faces, so a silent regression is visible.
- **To refresh the cache** if the font URL in index.html changes: fetch the css with a browser User-Agent
  (a bare curl gets ttf, not woff2), then download each `fonts.gstatic.com` URL and sed it to the local name.
- ▶ **CONSEQUENCE WORTH KNOWING: renders from earlier sessions may have had the same problem.** Layout,
  spacing, sizes and COLOURS in those renders are trustworthy; the TYPEFACES are not. If a past typography
  decision ever looks wrong on her phone, this is the first thing to suspect.

### ⚠️ SESSION HYGIENE NOTES
- **Playwright is NOT installed in a fresh container.** `npm install playwright`, then launch with
  `executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'` — the npm package pins a newer build than
  the pre-installed browser and will otherwise demand a download. ⚠️ **`npm install` also adds itself to
  package.json — revert that**, it has never been a project dependency. **A `.gitignore` now covers
  `node_modules/` + `package-lock.json`.**
- ⚠️ **Two link-check Routines still overlap** (Sunday 9 AM ET fired for the first time **Aug 16, confirmed**;
  an older Monday one fires 8 AM ET). **She has not read either report yet** — "I did not work on the link check,
  but need to later." Her decision on which to keep is still open.
- ✅ **The first automatic Star swap WORKED** — she confirmed the bangles: *"the new Star of the Week looks great!"*
- ✅ **The refine-done screen sub is BLESSED: "all good."** No longer a flagged draft.

## ▶ PREVIOUS — START HERE (2026-08-15 NIGHT → 08-16 — HER TESTING FOUND FOUR BUGS, ONE OF THEM OURS TWICE OVER)

### ⏸ WHERE THIS SESSION PAUSED (her call: "let's save to the .md now")
**FOUR PRs merged and ALL CURL-VERIFIED LIVE: #863 · #864 · #865 · #866.** Branch resynced to main, working
tree clean, remote in sync. ⚠️ **Four Netlify builds** — watch the meter.
▶ **THE SHAPE OF IT: every one of the four came from HER OWN SCREENSHOTS, and two were bugs where the CODE
was breaking a rule the app enforces on the model.** (1) `_nameParity` faithfully copying her size range onto
every card; (2) `getStoreUrl` prepending a fifth word to a search the prompt caps at four. ▶ **The reusable
lesson: when a rule is stated to the model AND implemented in code, check the code before blaming drift.**
- ⭐⭐ **HER NEW WANT, RAISED AT THE PAUSE AND SHE WANTS IT REMEMBERED — THE EMAILABLE WISHLIST.** Her words:
  *"work on making the wish list email-able. Like how you can share a wedding registry with someone — you can
  share what gifts you would like to have kind of thing."* ▶ **This REAFFIRMS her 2026-08-08 future-idea #2
  (the shareable registry, full entry lower in this file) and adds the EMAIL framing, which is new.**
  ▶ **TWO DIFFERENT FEATURES, and keeping them apart matters:** (a) the long-parked MailerLite desk item
  **"Email me my wishlist"** sends it to HERSELF; (b) THIS one sends it to SOMEONE ELSE so they can buy from
  it. Same list, different audience, and (b) is the one she just asked for.
  ⚠️⚠️ **THE CONSTRAINT THAT SHAPES THE WHOLE BUILD, and it is already recorded elsewhere in this file:
  AMAZON ASSOCIATES BANS AFFILIATE LINKS IN EMAIL.** So the email can NEVER carry retailer links — it must
  carry ONE link into a shareable wishlist PAGE in the app, and the retailer links live there. ▶ **That is
  also the better product: a page can stay current as she adds pieces, where an email freezes.**
  ⚠️ **The privacy line is already decided (2026-08-08): the shared view is the LIST ONLY — never her sizes,
  preferences, never anything personal.** ▶ **And the foundation is already built:** the two wishlist row
  kinds ARE the registry grammar ("buy exactly this" for her own added links and Edit picks, "anything like
  this" for AI rebuilt searches — the 2026-08-09 wladd entry).
  ▶ **STILL GATED ON AFFILIATE APPROVAL to actually earn** — the standing sequencing (registry FIRST when
  approval lands) is unchanged. **Nothing about it is blocked from being DESIGNED now, though; renders first,
  per the standing rule.**
- ✅ **The p001 Cowork edit is DONE — she told Cowork to delete the line**, so the body-shape sentence will not
  return on the next export. The converter's body-talk warning stays as the standing guard.
- ▶ **THE FIRST THINGS NEXT SESSION:**
  1. ⚖️ **THE ALMIRA CALL: MONDAY AUG 17, 12:30 PM.** Ask how it went and **LOG THE TM FILING DATES +
     SERIAL NUMBERS HERE.** Still the money path.
  2. 📱 **Sunday Aug 16: the first automatic Star swap (kitten heel → bangles) + the first link-check Routine
     fire (9:00 AM ET).** Both should have happened with nothing from her — **ask whether they did.**
  3. 🔎 **Her re-tap of the Zappos platform-heels card** — the four-word search is the one fix only a real tap
     can judge. Same for any repeat of a wrong-store pairing (the gym-bag class), which is deliberately
     prompt-only and would earn a code veto on a second sighting.
  4. 👀 **The 107-product catalog on her phone**, incl. the new dr1 Daytime casual dresses shelf.
  5. ✍️ **Her verdict on the drafted sub on the refine-done screen** (Claude's words, not hers).

### ⏸ WHERE THE 2026-08-15 NIGHT SESSION IS (a short session off HER OWN testing, four screenshots)
She refined with **ONLY plus sizes saved** and tested Shop your style. Three separate finds, all real, plus
one design question of hers. ▶ **THE SHAPE OF IT, and it is the reusable lesson: her screenshots showed one
symptom ("the same items keep coming up") and contained THREE different bugs, one of which she had not
noticed at all and was the most serious.** Read screenshots for what they SHOW, not only for what she reports.
- 🚨⭐⭐ **THE APP WAS SAYING HER SIZE RANGE BACK TO HER, ON EVERY CARD — she did not report it, it was
  sitting in her own screenshots.** "**Plus** Wide Leg Trouser" · "**Plus** Linen Button-Front Blouse" ·
  "**Plus** Wrap Midi Dress" · "**Wide Width** Loafers". ▶ **That breaks HER OWN standing rule (2026-07-28,
  reaffirmed 2026-08-13), in her words: "I don't want to remind a plus or petite woman of her sizing in that
  moment."** Sizing is supposed to pick the STORE and the SEARCH and never appear in the words.
  ▶ **CAUSE, and it is the interesting part: TWO CORRECT RULES COLLIDING, neither one wrong.**
  `_sizeGuidance()` says *lead the search term with her size word* (right — "plus wide leg trousers" genuinely
  filters better at the store) and `_shopRules()` says *the name IS the search written beautifully, same
  words* (right — that is the name-parity guarantee from 08-15 morning). So the size word entered the search
  legitimately and parity faithfully copied it onto the card. ⚠️ **`_nameParity` structurally CANNOT catch
  this: it strips name words the search does not carry, and "plus" IS in the search, so parity passes.**
  ▶ **Built as `_sizeWordsOut()`, a DELIBERATE SECOND EXCEPTION to name/search parity** (the colour one was
  the first: the name may read "Hot Pink" while the search says "pink"). ⚠️ **Unlike that one it exists to
  protect a BRAND rule, not a search behaviour — which is exactly why it is a guarantee in code and not one
  more line of prompt** (the never-wear and name-parity precedents: a rule nothing checks on the way back
  drifts). ⚠️ **Runs AFTER `_nameParity`, always** — parity can REBUILD a name from the search, size word and
  all. ⚠️ **THE SEARCH IS NEVER TOUCHED**, so the store still filters to her size; only the card stops
  announcing it. ⚠️ **"Wide" and "tall" are also real GARMENT words, so the match is anchored, never loose:
  a leading size range only, plus the unambiguous "wide/narrow width" phrase. "Wide-Leg Trouser" survives
  untouched, asserted twice.** Shoe width goes too, on her own 08-15 words: *"I don't want to make a big deal
  of it."*
- ✅ **"SHOW ME DIFFERENT PICKS" HAD NO MEMORY — her actual report, confirmed in the code.** Her two
  screenshots: 5 of 6 items identical after the refresh, only the earrings became a necklace. The refresh
  buttons re-ran the SAME prompt with no idea what they had just shown, so the model returned its best answer
  again, correctly. ▶ **THE FIX ALREADY EXISTED IN THE APP: the wardrobe "+ See more ideas" path
  (`_wdrMoreIdeas`) has always passed the already-shown names in.** Ported as shared `_rememberPicks()` /
  `_seenPicksLine()` across all four browsing prompts, wording identical to the wardrobe one. ⚠️ **Capped at
  24 and the cap is load-bearing** — uncapped it would grow the prompt every tap and eventually crowd out her
  preferences and the store table; oldest fall off so a long session cycles rather than starves.
- ⭐ **WRAP IS A VETO NOW, HER CALL — AND IT IS A NEW KIND OF LIST, KEPT SEPARATE ON PURPOSE.** Her words:
  *"unless she is specifically asking for a wrap top or wrap dress we don't need to be searching for it."*
  Her Anthropologie screenshot is the proof: "Plus Wrap Midi Dress" returned **1 product**, and it was not a
  wrap dress. The 08-15 morning prompt rule names this exact failure and the model drifted past it — the
  standing signal to move a rule into code. ▶ **`_SEARCH_VETO` is DELIBERATELY NOT `_STYLIST_VETO`:** the
  latter is TASTE (a garment she would never put on a client — wrong everywhere, always, no exemption ever,
  asserted); the new one is about what a store search can RETURN, and she was explicit wrap is not a bad
  garment. ⚠️ **THREE EXEMPTIONS, all from her one sentence:** (1) **`dr7 "Wrap dresses"` IS ONE OF HER OWN
  100 CHECKLIST ROWS** — a blanket veto would have silently BLANKED that shelf, caught before shipping;
  tapping Ideas there IS specifically asking, so the filter waives itself; (2) the same waiver on "Shop my
  whole list" when she starred that row; (3) **the stylist chat never runs this filter at all**, so asking
  there just works. ⚠️ **And it deliberately does NOT reach the curated catalog (`curatedPicks`) — her own
  products carry exact URLs, so no search is run and the whole reason for the veto is absent.**
  ⚠️ **Also found and fixed: the wantlist prompt's NAMING EXEMPLAR was literally "Wrap Midi Dress"** — the
  same trap as the 08-15 morning one where the naming bullet held up *wrap* as a model defining word. Grep
  exemplars whenever a word gets vetoed.
- ⚠️ **TWO BUGS OF CLAUDE'S OWN THAT ONLY THE TESTS CAUGHT, both worth the pattern:** (1) **`_openShopStyleNow`
  maps anything not look/wantlist to `'quiz'`, NOT `'style'`** — a hardcoded `'ss-style'` prompt key never
  matched what `_rememberPicks` wrote, so the memory silently did nothing. **Both sides derive from
  `_shopStyleMode` now, so the write key and the read key cannot drift.** ▶ **The test drives the real entry
  point rather than setting the mode by hand, so a future rename fails loudly.** (2) A code comment named
  `_wdrPickCurated`, **a function that does not exist** (it is `curatedPicks`) — an assertion that greps the
  real function caught the fiction.
- ⚠️ **`nameparity.js` FAILED ON ARRIVAL AND IT WAS NOT A REGRESSION — the `curated.js` lesson, one day
  later.** It pinned "Poplin Top", the 4th AI item in its stub; once to1 White tops gained 12 catalog
  products the blended shelf gave the AI only 2 of 6 slots and Poplin stopped rendering. **Proved stale by
  stashing the change and watching it fail identically.** Rewritten to run that claim on a **catalog-free
  slot** (to2) so catalog growth in any slot can never break it again. ▶ **Always stash-and-rerun before
  believing a suite failure is yours.**
- **Suites: `sizeveto.js` 42 (new) · `prefdone.js` 32 (new) · `csvjoin.js` 27 (new) · `wordbudget.js` 23 (new) · nameparity 25 (was 23, +2 and one deliberate rewrite) · curated 65 ·
  searchtune 70 · searchchat 57 · cowork3 69 · wladd 102 · storedepth 17 · e2e 29 · hubs 49 · affq 40 — all green.**
- ✅⭐ **THE "MAYBE LATER" DEAD END IS FIXED — her pick "A" from four renders, built same session.** Finishing
  Refine without giving an email landed her back on the **portrait she had already read**. ▶ **THE DIAGNOSIS
  THAT SHARPENED HER OWN INSTINCT: the "Let's go shopping" button ALREADY EXISTED on that screen — inside
  `prefSavedBlock`, `display:none` until she handed over her email.** So a woman who declined lost the
  JOURNEY, not just the convenience, which inverts her own value-first rule ("never make her earn the value").
  ▶ **As built: the button is on the screen for EVERYONE, above the email ask**, with the save ask following
  under a hairline + "KEEP THEM FOR NEXT TIME". ⚠️ **DELIBERATELY NOT wired to "Maybe later", though that was
  her first framing** — a dismissal that secretly takes you somewhere new is surprising, so shopping is a
  visible CHOICE and "Maybe later" still just dismisses (asserted: it must NOT land on s-shopstyle).
  ⚠️ **TWO COPIES OF THE BUTTON now exist, one per state** — `showPrefDone` shows exactly one, so only one is
  ever on screen (the commission-line precedent). **BOTH must change together: grep `prefShopNow`.**
  ⚠️ **The second seal's gradient id is `prefSeal2`, NOT a duplicate `prefSeal`** — the Safari hidden-defs trap.
  ⚠️ **THE RENDER EARNED ITS KEEP TWICE:** (1) `.hm-cta-seal` **hangs at `top:-32px`**, so the gold star sits
  ABOVE the button and lands on the sentence above unless given explicit clearance — invisible when reading the
  CSS, obvious the moment it was drawn; (2) **her own instinct as option C looked wrong once rendered** — with
  the button below the form and the privacy line, the payoff reads as an afterthought. **She was right about
  where the woman should END UP; the render is what settled where it goes on screen.**
  ✍️ **Her catch on the chosen render: "fun" straggled alone on a third line.** Fixed with **`text-wrap:balance`,
  her standing widow lever** (the `.hm-h1` fix, reused on the tagline and the wardrobe closing line) — NOT
  margins, which could not have fixed a widow. **Measured 5 words on the last line at 390/375/360/320.**
  ⚠️ The shortened sub is a **Claude draft** ("Your preferences are set. From here, shopping only gets easier
  and more fun.") — the old sentence ended by selling the email save, which read oddly once shopping led.
  **She has not blessed the wording; one string in the markup.**
  ✍️ **Her second catch: "Privacy Policy ·" sat alone with "Terms" stranded below it.** Fixed by keeping the
  two links together (`.priv-links{white-space:nowrap}`) so the line breaks after the SENTENCE instead of
  between them — ⚠️ **nowrap rather than a hardcoded `<br>`, so a wider container still holds one line**, and
  applied to **all FOUR copies** of that sentence (grep `never share your email`).
  ⚠️ **THE RECT-PER-ELEMENT TRAP COST A FALSE FAILURE HERE, third time in this file:** the fix looked broken
  because `getClientRects()` on the inline span returned THREE rects — one per child box — when all three
  shared the same `top`. **Count UNIQUE tops, never rects.** New `scratchpad/prefdone.js` **32 checks**.
- ▶ **STILL OPEN ON IT, her eye:** how it feels on her phone, and the drafted sub above.
- ▶ **SUPERSEDED — the original diagnosis, kept for the reasoning:**
  Finishing Refine without giving an email lands her back on the **portrait she already read**. ▶ **THE
  DIAGNOSIS THAT SHARPENS HER OWN INSTINCT: the "Let's go shopping" button ALREADY EXISTS on that screen —
  it lives inside `prefSavedBlock`, `display:none` until she hands over her email.** So a woman who declines
  loses the JOURNEY, not just the convenience, which inverts her own value-first rule ("never make her earn
  the value"). ▶ **RECOMMENDED, and it differs from her first framing: do NOT make "Maybe later" navigate to
  shopping** — a dismissal that secretly takes you somewhere new is surprising, and it should keep meaning
  what it says. **Put "Let's go shopping" on the screen for EVERYONE, above the email ask**, and let "Maybe
  later" stay a quiet dismissal. Same destination, visible as a choice; it also fixes the SAVED path, where
  the email currently reads as a toll gate before the payoff. **She said "let's do 3 when you are ready" —
  render 2-3 versions for her pick first, per the standing rule.**
- ✅ **THE 5 REWORDED NOTES ARE CLOSED, her call.** Reminded of what they were (Cowork quietly rewrote five of
  HER product notes between exports), she read the three that could be diffed and kept them — with **one
  deletion on p001 Madewell Perfect Vintage Jean: the whole sentence "The curvy fit is the one to take if
  you're waist-small and hip-full" is GONE, her words: "just delete that line."** ▶ **Consistent with her
  standing boundary — the app never names bodies** (2026-08-13: no copy about slimming or flattery), and the
  clause was the one piece of body-shape talk left in the catalog. Note is now the first sentence only.
  ⚠️ **p035/p051 stay undiffable and she is content;** the standing keep-the-previous-export rule stands.
  ⚠️⚠️ **THE CSV IS DOWNSTREAM OF HER COWORK SHEET, so this edit is fragile: unless she makes the same
  deletion in Cowork, the sentence RETURNS on her next export.** Flagged to her. ▶ **STANDING: any note edited
  here must be edited in Cowork too, or the converter will faithfully put it back.**
- ▶ **STILL OPEN FROM THE ENTRY BELOW, unchanged:** the Almira call **Monday Aug 17 12:30** · **Sunday Aug 16**
  first automatic Star swap + first link-check Routine fire · the **5 reworded notes** (⚠️ **only p001/p007/
  p011 could be diffed — p035/p051's "before" text lived only in her FIRST export, which was never saved.
  ▶ STANDING: keep the previous CSV before each new one lands so a diff is always possible**) · her own
  visits stopped counting in Plausible, so a drop is the exclusion working.
- ⭐⭐ **THE CATALOG ARRIVES IN PIECES NOW, PERMANENTLY — AND THE CONVERTER JOINS THEM (2026-08-15 night,
  from Cowork).** Cowork can upload small files to Drive reliably but not large ones, so every future export
  is **numbered parts + a MANIFEST** (part count, order, row count, md5 of the joined file). ▶ **Built into
  `products-from-csv.js`: point it at the manifest OR the folder and it rebuilds, VERIFIES, then converts;
  a single CSV path still works unchanged.** ⚠️ **Expected values are read FROM THE MANIFEST, never
  hardcoded** — they change every export, which is the whole reason it ships.
  ▶ **WHY THE VALIDATION MATTERS MORE HERE THAN ANYWHERE ELSE: a PARTIAL catalog is more dangerous than a
  malformed one, because it converts perfectly and silently loses products.** Nothing downstream would ever
  notice. So any failure stops the run and **products.json is left untouched, asserted on every failure case.**
  ⚠️ **The failure mode worth naming, and the tests pin it: a part missing its trailing newline GLUES its
  last row onto the next part's first row.** The md5 would catch it as a number; the message says what
  actually happened. **Wrong ORDER is the other sneaky one — row count still passes, only md5 catches it.**
  **Pulled live: 92 → 107 products, 10 slots, `dr1` Daytime casual dresses is NEW (15).** md5 verified
  byte-for-byte against Cowork's manifest. New `scratchpad/csvjoin.js` **27 checks**.
- 🚨 **AND THE COWORK-OVERWRITES-HER-EDIT CAVEAT PROVED ITSELF WITHIN THE HOUR.** The new export **restored
  the body-shape sentence she had just deleted** from p001 (Madewell Perfect Vintage Jean) — because the
  deletion was made in the repo and the CSV is downstream of her Cowork sheet. ▶ **Built a standing guard:
  the converter now WARNS (never fails) when any note names a body**, listing the row and saying the fix
  belongs in the Cowork sheet. ⚠️ **A WARNING not a failure, deliberately: these are HER words and a false
  positive must never block a whole catalog.** Her deletion is re-applied in the canonical CSV.
  ✅ **DONE 2026-08-16: she told Cowork to delete the line**, so it will not come back. The warning stays.
- ⚠️ **COWORK'S OWN "STILL TO DO" LIST WAS STALE and was checked rather than obeyed** — it asked for
  Plausible events, prompt caching and the Haiku-vs-Sonnet read, **all three of which shipped on 2026-08-15
  late.** ▶ **The standing rule, third time now: CHECK BEFORE BUILDING ANYTHING A BRIEF ASKS FOR.**
- ⚠️ **HARNESS TRAP, and it cost two false failures: `execFileSync` returns ONLY stdout on success**, so a
  `console.warn` (stderr) is invisible unless the command also fails. The body-talk guard was working the
  whole time. **Use `spawnSync` and capture both streams.**
- 🚨⭐ **THE STORE SCOPING WAS BLOWING THE SEARCH WORD BUDGET — her Zappos screenshot, 2026-08-16.** A search
  for **"womens narrow width platform heels"** came back with **Birkenstock platform SANDALS**. ▶ **CAUSE, and
  it is the code breaking the prompt's own rule: `_shopRules` caps a search at "2 to 4 plain words" and the
  model obeyed** ("narrow width platform heels", 4 words) — **then `getStoreUrl`'s `w:` scoping prepended a
  FIFTH.** Zappos spent its parsing on the prefixes (its own screenshot shows it made "Womens" and "Shoes"
  into filters), matched "platform", and **lost "heels"**. ▶ **Fixed with `_alreadyWomens()`: a store's
  "womens" keyword STANDS DOWN when the term already leads with a size range or shoe width.** Two reasons,
  the second is the real one: (1) nobody sells "petite trousers" or "narrow width heels" to men, so the word
  buys nothing; (2) **the garment words are worth more than the department hint.** ⚠️ **DELIBERATELY NARROW —
  it only stands down for the words `_sizeGuidance` may emit, so the 2026-08-08 men's-suit-pants bug that
  `w:` exists to fix stays fixed.** ⚠️ **"Wide leg" is a SILHOUETTE and keeps its scoping** (as does "medium
  wash") — asserted three ways, because a loose match there would resurrect that bug.
  New `scratchpad/wordbudget.js` **23 checks**.
- ⚠️ **"NEON GYM BAG" AT REVOLVE, her other screenshot: 914 items, no neon, no gym bags.** Two faults, one
  mechanical and one drift: **"neon" is a BRIGHTNESS word, not a filter value at any store** (the same family
  as the retired "raspberry"/"hot pink"), so the retail-plain colour rule now names neon/electric/acid
  explicitly; and **Revolve does not stock gym bags**, which is the existing precision-to-store rule drifting.
  ▶ **The store-fit half is prompt-only for now — watch whether it recurs before moving it into code.**
- ✅ **HER SCREENSHOTS ALSO PROVED ALL THREE OF THE 08-15 NIGHT FIXES LIVE:** zero "Plus" on any card, zero
  wrap, and the refresh returned a genuinely different six (only the store repeated). **The reported symptom
  is fixed; what is left is search QUALITY, which is a different problem.**
- ⚠️ **TEST-HARNESS TRAP: Revolve is URL-scoped (`d=Womens` in its base URL), so asserting "no womens" against
  the WHOLE URL reads as a keyword prepend that never happened.** Assert against the SEARCH TERM.
  **Scoping mechanism ≠ search text.**
- ⚠️ **CATALOG COVERAGE, CORRECTED: the 92 products sit in NINE slots, not "many"** — sh9 17 · to5 16 ·
  to1 12 · bo1 8 · ja2 8 · sh7 8 · bg1 8 · ex2 8 · ja6 7. The entry below overstates this. The other 91 slots
  are still all-AI, which is what to tell her before she goes looking on her phone.

## ▶ PREVIOUS — 2026-08-15 LATE (THE CATALOG QUADRUPLED AND HER ANALYTICS BECAME REAL)

### ⏸ WHERE THE 2026-08-15 LATE SESSION PAUSED (her call: "let's pause here and save to the .md")
**THREE PRs merged and curl-verified live: #859 · #860 · #861. Three Netlify builds.** Branch resynced to
main, working tree clean, remote in sync. ▶ **THE SHAPE OF THIS SESSION: it was a COWORK HANDOFF session** —
she is running a second Claude session (Cowork) that fills the catalog spreadsheet while this one builds the
code, and **the whole session was about making that handoff work without either side guessing.** The reusable
lesson is at the top of the list below.
- ⭐⭐ **THE CATALOG IS 92 PRODUCTS NOW, up from 21** (bo1 Blue jeans 8 · to5 Professional blouses 13 · plus
  71 new across many slots, incl. **sh9 Fashion sneakers at 17 across 9 retailers** — Cowork's own fix after
  a first pass put 9 products across only 2 retailers, which the max-2-per-retailer rule would have capped at
  4 picks with zero slack). ▶ **THE HANDOFF INSTRUMENT THAT MADE IT WORK, and it is the thing to reuse: a
  written CSV SPEC brief she pastes to Cowork** (`scratchpad/cowork-catalog-brief.md`, sent to her in chat) —
  the exact header, every column rule, the note-trimming rule, the veto warning, the shelf-quality targets,
  the three standing store exclusions, **all 100 slot ids and all 100 STORES keys with exact punctuation**.
  ⚠️ **The spec ends by naming index.html as the final authority**, because the converter parses slots and
  stores out of it at convert time — a brief that goes stale is worse than none.
  ⚠️ **DIFF THE EXPORT, NEVER ASSUME IT IS ADDITIVE.** Her second export was diffed row by row: 8 added,
  **0 removed, and 5 NOTES SILENTLY REWORDED** (p001 · p007 · p011 · p035 · p051 — every one of them removing
  body-flattery language, which is consistent with her standing rule, but they are HER notes and she has not
  seen the rewordings). ▶ **Flagged to her, still unanswered: those 5 want her eye.**
  ⚠️ **Two files named `style-star-products.csv` now exist in her Drive** — sort by modified time on any pull.
- ⚠️ **THE `width` COLUMN, and the correction that saved it:** the handoff described values like N/S/M/W/WW,
  and **the real export writes WORDS** ("medium", "narrow, medium, wide"), so a letter-code whitelist would
  have failed every shoe row. It is carried through verbatim, split on commas like `colors`, **deliberately
  NOT validated against a vocabulary**, and **nothing filters on it yet** — ▶ **her call, verbatim: "most
  shoes only come in medium. if a woman truly needs a narrow or a wide I want her to be able to find it but
  I don't want to make a big deal of it."** So the data is captured and the filtering is not built. Don't
  build it without her.
- ⭐ **HER ANALYTICS TELL HER SOMETHING NOW — five new events + the own-visit exclusion.** ⚠️ **Two of the
  brief's five items were ALREADY BUILT and were recorded rather than rebuilt** (the freshness machinery
  2026-08-14; six Plausible events since 2026-07-29) — **check before building anything a brief asks for.**
  New events: **Photo Uploaded** (the gap to Photo Analyzed IS the failure rate) · **Chat Message Sent**
  (with/without photo, **never the text**) · **Wishlist Save** (store + kind: edit-pick/catalog/ai) ·
  **Wardrobe Star** (slot). **Quiz Completed now carries her archetype** — ⚠️ the `track` call had to MOVE
  below `topArchNames`, it was firing before the archetype existed. **Product Click now carries `slot`**, via
  a `data-slot` attribute on the Ideas box — which is what finally answers "which checklist rows actually
  convert". ⚠️ **No event ever carries her answers, name, or email**; a test asserts it.
- ⭐⭐ **THE OWN-VISIT EXCLUSION HAS TWO DOORS, and the second one is the whole lesson.** Full detail in the
  📊 entry below (incl. **the verbatim incognito answer she asked to be reminded of** — give it whenever she
  mentions testing as a beginner). ▶ **The reusable shape: a switch is only built when it is reachable ON THE
  DEVICE SHE USES.** Door 1 (`/?notrack`) exists because iPhone Safari has no console. **Door 2 (FIVE TAPS on
  any brand mark) exists because her home-screen app has no address bar AND keeps its own storage container**
  — Claude shipped door 1 first and caught the gap only by asking where she actually tests. ✅ **She has now
  done both the app and regular Safari and confirmed it worked.** New `scratchpad/notrack.js` **25 checks**.
- ⚙️ **PROMPT CACHING went in, but SMALLER than the brief asked — and the brief's premise was wrong.** It
  assumed a static `system` block in `style-ai.js`; **there is no `system` field in that function at all**,
  every surface builds its prompt into `messages`. And a cache WRITE costs 1.25×, so caching a single-shot
  call (which every card surface is) would pay a 25% surcharge for a cache nothing ever reads. **So it is
  gated to `messages.length > 1`, i.e. the chat only**, which is the one genuinely multi-turn surface.
  ⚠️ Also noted at the code: the `allowed_domains` crawler-block pruning invalidates the prefix once, and
  Sonnet's minimum cacheable prefix is 1024 tokens.
- 🧠 **HAIKU FOR STYLIST CHAT: recommended AGAINST, no code changed** (the brief asked for a view only).
  The chat is the surface carrying her 20-years-of-styling voice and her never-wear guarantees, it is the
  one place a woman is in conversation, and it is **already the cheapest thing per woman** next to a 5-10¢
  searching answer. ▶ **The honest framing given to her: the cost lever is the SEARCH tool, not the model.**
- ⚠️ **TEST-SUITE LESSON, and it cost real time: `curated.js` failed 15 checks when the catalog went 21 → 84,
  and every one was STALE TEST DATA, not a regression.** Fixed by **deriving every expectation from the data**
  (row count from the CSV, per-slot counts computed, the empty-slot case FOUND rather than hardcoded as
  `to1`) — ▶ **a test that restates a number has to be edited every time the data grows; a test that derives
  it never does.** ⚠️ **And the harness trap underneath it: `const wardrobeItems` / `let _productsCatalog`
  are script-scope declarations, NOT properties of `window`**, so Playwright's injected `evaluate` cannot see
  them. Two attempts failed on this before the value was computed in Node instead.
- **Suites at pause, all green:** **notrack 25** (new) · curated 64 · e2e 29 · nav 80 · menu 87.
- ▶ **THE FIRST THINGS NEXT SESSION, in order:**
  1. ⚖️ **THE ALMIRA CALL: MONDAY, AUGUST 17, 12:30 PM.** Unchanged and still the money path — ask how it
     went and **LOG THE TM FILING DATES + SERIAL NUMBERS HERE.**
  2. 📱 **Sunday Aug 16: the first automatic Star swap AND the first link-check Routine fire (9:00 AM ET).**
     Ask whether both happened with nothing from her. ⚠️ **TWO link-check Routines now overlap** — her call,
     deliberately deferred: *"let's see how the check in routines go this week and we can decide about those
     next week."* Raise it next week, not before.
  3. 👀 **How the 92-product shelves feel on her phone** — this is the first time most slots have ANY catalog
     behind them, so the blended shelf (≤4 catalog leading, AI filling to 6) is newly visible almost
     everywhere. Watch for retailer repetition and price-band clumping, the two things the shelf rules guard.
  4. ✍️ **The 5 reworded notes** (p001 · p007 · p011 · p035 · p051) want her eye.
  5. 📊 **Her Plausible dashboard has real events in it now** — ⚠️ **but her own visits stopped counting the
     same day**, so a drop in visitor numbers is the exclusion working, NOT a problem. Say this before she
     reads the dashboard.
- 📊 **HER ANALYTICS ARE HERS-ONLY NOW, and there is ONE STANDING ANSWER she has asked to be reminded of.**
  Her own testing was being counted as real visitors, so a `plausible_ignore` flag is enforced by simply
  **never loading the Plausible script** (belt and braces: `track()` checks the same flag). ⚠️ **TWO DOORS,
  and the second exists because the first is unreachable where she actually tests:** (1) `stylestar.app/?notrack`
  once per browser, `/?track` to undo — ⚠️ **the ADDRESS is the point, because iPhone Safari has no console and
  the documented way to set this flag is a console command**; (2) ⭐ **FIVE TAPS on any Style Star brand mark**,
  which is the only switch reachable from her HOME-SCREEN APP — no address bar, and an installed iOS web app
  keeps its **own storage container** (the 2026-08-08 restore-code lesson), so a flag set in Safari never
  reaches it. Taps only COUNT (every tap still navigates home), reset after 3s of quiet, and **toggle BOTH
  ways** so she can never lock herself out. ✅ **DONE by her on 2026-08-15: the home-screen app AND regular
  Safari.**
  ▶▶ **THE REMINDER SHE ASKED FOR, VERBATIM ANSWER — give it whenever she mentions testing as a beginner, a
  new user, a fresh start, or incognito/private mode:** *"Open private browsing and type
  **stylestar.app/?notrack** — every time, because private mode forgets it when you close it."* ⚠️ **Do NOT
  tell her to use the five taps there:** the taps fire AFTER the page has already counted the visit, while the
  address is read BEFORE the script ever loads, so only the address makes a private session truly invisible.
  ⚠️ And private mode is the ONE place this can never be made permanent — iPhone throws the flag away with the
  session. Nothing is broken when she reports it "not sticking" in incognito; that is the platform.
- ▶ **Everything from the 2026-08-15 morning entry below is unchanged by this work.**

## ▶ PREVIOUS — 2026-08-15 morning (HER FIRST LIVE TEST OF THE CATALOG SHELF)

### ⏸ WHERE THE 2026-08-15 MORNING SESSION PAUSED (her call: "let's save everything to the md and pause here")
**FOUR PRs merged on her word and ALL CURL-VERIFIED LIVE: #854 · #855 · #856 · #857. Four Netlify builds
for the whole day** (commits batched deliberately while she tested). Branch resynced to main, working tree
clean. ▶ **THE SHAPE OF THE DAY, and it is the reusable lesson: FOUR screenshots that all looked like "the
searches are bad" turned out to be FOUR genuinely different causes** — (1) a card NAME promising what its
search could not deliver, (2) a missing category DEFINITION (a basic top), (3) a search WORD no store
stocks ("wrap"), (4) the wrong STORE for a specific search. Each needed its own fix; two were only findable
because she was tapping through on a real phone. ⚠️ **And the honest pattern underneath three of them: the
prompt rule was already RIGHT and the model DRIFTED.** Where that happens the answer is a guarantee in code
(`_nameParity`, the `filterNeverWear` precedent), not more prompt wording.
- **Her words through the day:** *"I feel like I want to delete the not for me and broken link"* · *"it
  should not promise draped"* · *"A black top should just be a black top"* · *"that is more of a dressy or
  going out top so let's put it there instead"* · *"I would like to keep that card/paragraph on there
  permanently"* · *"lower it down to sit closer to the line"* · *"wrap tops are not very popular... it's
  just not something that is likely to come up in a search"* · *"Revolve is only for someone who likes
  their clothing very fitted, alluring, trendy, edgy."*
- ⭐⭐ **"NOT FOR ME" AND "LINK BROKEN?" ARE DELETED, her call — and it was her instinct at build time
  too ("she could swipe past it, we will see").** Her words this session: *"I feel like I want to delete
  the not for me and broken link. It seems like she can just swipe past it?"* **The full reasoning is in
  a block comment above `_wdrTrimNote` so it never reads as an accident**, incl. two faults found while
  removing them: (1) ⚠️ **"Not for me" had NO UNDO** — one mis-tap hid a piece from her shelf forever and
  nothing in the app ever cleared `ss_dismissed`; (2) ⚠️ **"Link broken?" answered "Thank you, we'll check
  it ♡", true ONLY while the Plausible dashboard is watched** — the standing honesty rule (the "in your
  size" removal, the restore-email copy) says never promise what the app does not do. Also: both put two
  tappable-looking words on catalog cards that AI cards lack, breaking her ONE seamless carousel.
  ▶ **THE DISMISSAL FILTER CAME OUT OF THE PICKER TOO, deliberately — so any piece she waved off while
  testing is back in her rotation.** ▶ **THE TRIGGER TO REVISIT, written at the code: when the catalog
  outgrows her own eye (~60+ items, or real users at volume), bring back "Link broken?" ONLY, never "Not
  for me", and only with a dashboard she actually reads.** curated.js 60 → **64**, four assertions
  DELIBERATELY REVERSED (the controls asserted GONE: no nodes, no handlers, no storage write, no promise
  on screen; a stale `ss_dismissed` asserted NOT to hide a piece).
- ⭐⭐ **THE NAME IS THE SEARCH — NOW GUARANTEED IN CODE, NOT JUST IN THE PROMPT (`_nameParity`).** Her
  catch: the White tops shelf offered a **"Satin Draped Top" whose search was "white satin top"**, and
  Revolve answered with boxy cotton tees. Her words: *"it should not promise draped."* The card beside it
  had the same fault ("Linen Relaxed Top"). ▶ **THE DIAGNOSIS THAT CHANGED THE FIX, and it generalises:
  the prompt rule was NOT wrong — a live re-test of three slots came back word-for-word perfect ("White
  Linen Top" ←→ "white linen top"). This was model DRIFT on a rule the prompt calls absolute, which is
  exactly the never-wear shape: a rule nothing checks on the way back.** So the name is now TRIMMED to
  what its search can deliver, before render, on all four card surfaces (`_shopCard`) and Complete the
  Look (`_renderShop`). Puffery goes the same way ("Classic White Crewneck Tee" → "White Crewneck Tee").
  ⚠️ **THE SEARCH TERM IS NEVER TOUCHED** — every link searches exactly what it did; only the promise
  moves. **Two deliberate allowances:** the search MAY carry a word the name does not (a colour-named row
  already promises it in the header — her own reasoning), and jewellery mood words survive (the prompt's
  small-catalogue rule). ⚠️ **A name is modifier-modifier-NOUN, so when the HEAD NOUN is the word that
  goes, the name is rebuilt from the search** ("White Scoop Neck Tee" over "white scoop neck top" would
  otherwise trim to "White Scoop Neck", which names nothing — a real live run produced that pair).
  ⚠️ A trimmed name changes `_wlMakeId`, so a piece saved under the old puffed name reads as unsaved on a
  fresh card; pre-launch that is noise, migrate ids in `_normalizeWardrobe` if it ever matters.
  New `scratchpad/nameparity.js` **24 checks** + `scratchpad/nameparity-live.js` (re-runs the REAL model
  against the REAL captured prompts; costs a few cents of the production key, the standing trade).
- ⭐ **A BASIC TOP IS JUST A TOP — her definition, from her catch on the live Black tops shelf** (it
  offered a "Long Sleeve Bodysuit" and a "Knit Turtleneck Top"). Her words, verbatim and now the rule:
  *"A black top should just be a black top. Not a tank top, not a collared blouse, just a top."* ▶ **WHY
  THE EXISTING MACHINERY COULD NOT CATCH IT, worth remembering: `_WDR_IDEA_EXCLUDE` only blocks OTHER ROWS
  on her checklist, and a bodysuit and a turtleneck are not rows — there was nothing to exclude them
  from.** Same gap as "work-appropriate": obvious to a stylist, wide open to a model. So it gets a
  `_WDR_IDEA_DEFINE` entry in the proven shape (imperative NEVER, inside the RULES list, closed with
  "This rule is absolute" — the placement lesson from her first dresses retest), applied to **to1 White
  tops · to2 Black tops · to3 Tops in your favorite colors**, the same trio that share the exclusions.
  ✅ **PROVEN LIVE, TWO RUNS PER SLOT** (the dresses definition needed a second pass, so one clean run
  proves nothing): all four runs clean — crew/scoop/V necks and sleeve lengths, zero bodysuits,
  turtlenecks, tanks or blouses. ⚠️ **The NEVER list is entirely HERS; the positive half is a flagged
  Claude draft she has NOT blessed — reword freely. Satin is deliberately NOT banned** (she objected to
  "draped", not the fabric) — ▶ ask if a basic top should exclude satin.
- ✅ **HER NORDSTROM RACK QUESTION, answered and NOT a bug:** her tap landed in the Rack APP on its home
  page with no search. **iOS universal links** — with the app installed the system hands the tap over
  before Safari sees the URL, and their app drops the search path. The tell in her own screenshot:
  "◀ Style Star" top-left + it greeted her as Catherine. **Same family as lululemon (2026-08-08); a woman
  WITHOUT the app lands on the real results page, and Apple offers no way to force the browser.** The
  heart-tip is the standing mitigation. Nothing to build.
- ⭐ **HER SUNDAY LINK-CHECK ROUTINE IS SET UP, her ask** (*"I would like to get into a weekly routine
  where I check the links with cowork"*): a Routine fires **every Sunday 9:00 AM ET** into a FRESH session
  that runs `scripts/check-product-urls.js` and hands her the results, so she clicks through her Cowork
  link page alongside it. **Sunday deliberately — the app's own change day** (Star of the Week + the
  catalog rotation both turn at midnight into Sunday). ⚠️ Retires the old standing "nudge her every week
  or two" reminder; the Routine IS the nudge now.
- ⭐ **SECOND SCREENSHOT PASS, same morning, merged in the same PR (#855):**
  1. ⚠️ **SATIN IS OUT OF BASIC TOPS AND INTO DRESSY, her call:** *"that is more of a dressy or going out
     top so let's put it there instead."* Banned on to1/to2/to3 AND named as belonging on **to6** — ▶ **a
     piece she rules out of one row is not rejected, it is FILED where a stylist would put it.** Proven
     live, two runs per slot: zero satin on White tops, satin leading Dressy tops both runs. ⚠️ The to6
     line is minimal and a flagged draft apart from her satin sentence — don't grow it into a full
     definition without talking the row through with her.
  2. ⭐ **THE HOW-TO CARD IS PERMANENT, her call** (*"I would like to keep that card/paragraph on there
     permanently. It would be more consistent with the trending page"*). The 2026-07-26 collapse-to-one-
     line behaviour is **deleted, not dormant** — markup, CSS and the header-hiding rule all gone;
     `_wdrSyncHowto` survives as a no-op that clears any stale class (the `_wdrSkin` precedent). ▶ **She
     is right that the tabs are siblings now** (08-13 gave them the same header construction + framed
     card), so one shedding its intro broke the pair. **The ~100px is a cost she accepted knowingly.**
     tabtops' collapse assertion **DELIBERATELY REVERSED**: five real star taps through the real handler,
     then the card, header and her full paragraph all asserted still standing.
  3. ⭐ **THE COMMISSION LINE MOVED INSIDE EACH PANE**, under that tab's intro card and directly above its
     first link (her pick from 4 renders). ▶ **Why: in the old spot a legal notice was the last thing read
     before HER paragraph, and it kept reading as a tagline for the PAGE rather than a caption for the
     LINKS.** ⚠️ **TWO COPIES NOW, one per pane** — only one ever on screen, and **BOTH must change when
     Amazon's sentence lands** (grep `may earn a commission`). ⚠️ **DELIBERATELY UNEVEN spacing, her second
     call** (*"lower it down to sit closer to the line"*): **16px above / 3px below**, measured identical
     on both tabs at 390/360/320 — centred at 9/9 it floated between two cards and belonged to neither.
     ⚠️ **THIS SPOT ONLY BECAME SAFE WITH ITEM 2** — while the how-to could collapse, anything beside it
     risked vanishing for returning users. **If that card is ever made collapsible again, this notice moves
     back out** (noted at the markup). **tabtops 15 → 49** — nothing had ever pinned this position, which
     is how it drifted twice; now asserted per tab per width (inside the pane, after the intro card, the
     uneven gaps as a RELATIONSHIP not exact numbers, one visible copy, above every link, shared wording).
  4. ✅ **"Tap either list" STAYS BELOW the buttons, her decision from a 2-way render** — ▶ above, it lands
     in the page-subtitle slot and reads as describing the PAGE, and **it is the only thing telling her the
     unselected tab is tappable (her mom's original catch)**. Tightened under them, 8/4 → 4/2.
- ⭐⭐ **CATALOG DEPTH IS IN THE STORE TABLE NOW, her answers (#857) — and HER GUARD IS THE POINT.** Born from
  her Tuckernuck screenshot (below): **19 of 100 stores carry `deep`** ⚠️ **(25 as of 2026-08-20 — the MIDDLE
  TIER was decided; see the top of this file)** — the 16 she confirmed (Nordstrom ·
  Macy's · Dillard's · Belk · Bloomingdales · Saks · Neiman Marcus · NET-A-PORTER · Shopbop · Nordstrom Rack ·
  TJ Maxx · Target · Amazon · Revolve · Zara · H&M) plus **Zappos + DSW for shoes and Sunglass Hut for
  eyewear, marked for THAT CATEGORY ONLY** (`deep:'shoes'`). The other 81 are stores to send **what they are
  KNOWN FOR**, never a niche multi-word search. ⚠️ **Nothing inferred — the list is hers**, and the marker
  rides in the store LINE (`_storeListForPrompt`), the same reasoning as her colour scores: a rule about data
  the model cannot see is not a rule. ⚠️ **The apostrophe stores (`"Macy's"`, `"Dillard's"`) use DOUBLE-quoted
  keys and a naive single-quote pass silently misses them** — the Bloomingdale's-apostrophe lesson, third time.
  ▶ ⭐ **HER GUARD, verbatim, and it caught a change Claude would otherwise have shipped wrong:** *"Revolve is
  only for someone who likes their clothing very fitted, alluring, trendy, edgy... not for a relaxed, preppy,
  natural type."* **A depth signal alone would have pushed EVERY woman toward the biggest catalogs regardless
  of fit — undoing her whole matching system to fix a smaller bug.** So the rule is **FIT BEATS DEPTH, ALWAYS:
  depth is a tie-breaker BETWEEN stores that already suit her, never a reason to reach past the ones that do**,
  with her Revolve sentence named in it. ✅ Her own July dims already rank Revolve 10 alluring/10 trendy/2
  classic, so the ordering knew; this stops the new signal overriding it. **Proven: a relaxed/classic/natural
  dresser ranks Revolve past 40th while the woman it suits keeps it top 15** (her top 10 = Eileen Fisher ·
  Lands' End · J.Jill · Frank & Eileen · Jenni Kayne · Tommy Bahama · Faherty · Quince · Soft Surroundings ·
  Chico's). Live, 3 runs of Print tops as that dresser: zero Revolve, zero Tuckernuck, zero wrap.
  New `scratchpad/storedepth.js` **17 checks**.
  ▶▶ **REVISIT TRIGGER, flagged to her and deliberately NOT built: THE MIDDLE TIER.** The split is binary, so
  it currently treats **Talbots exactly like Tuckernuck** — a national chain with hundreds of tops filed the
  same as a small boutique. The live runs made it visible: every pick went to a non-deep store (Talbots ·
  J.Jill · Lands' End · Boden · Madewell) and they were all good calls, so nothing is broken — but the app
  cannot yet tell "big enough for a specific search" from "go for what it's known for" in that band.
  ▶ **The handful to ask her about when she has appetite: Talbots · J.Jill · Lands' End · Boden · J.Crew ·
  Anthropologie · Free People · Athleta.** ⚠️ **Ask, never infer** — the standing rule (the Garnet Hill
  keyword-matching error) and her own track record: the walkthroughs guessed wrong 3 of 4 times and every real
  find came from her live testing. ▶ **The other half of the same question, also parked:** for a FOCUSED store,
  should its `c:` "known for" line be tightened so the app can send Tuckernuck a specific DRESS search but
  never a specific TOP one? That is what would actually have caught her screenshot. Her call, one store at a
  time as her testing surfaces them.
- ⭐ **SEARCH SHAPES MUST BE ONES STORES STOCK (#856), from her Tuckernuck catch** — "Print Wrap Top" opened on
  13 products: a wrap SKIRT, a perfume atomiser, a sarong. ⚠️ **The name and search matched WORD FOR WORD, so
  the parity guarantee worked exactly as built — this was a THIRD, distinct failure class.** Her read found the
  root: *"wrap tops are not very popular... it's just not something that is likely to come up in a search."*
  ⚠️ **DELIBERATELY NOT A VETO — she was explicit it is about what a search can RETURN, not about the garment
  being bad; `_STYLIST_VETO` is untouched and only grows on her express word.** Two fixes: (1) **the naming
  rule's own exemplar read "(button-front, professional, wrap)"** — the prompt was holding up *wrap* as a model
  defining word in the one bullet the model leans on for every card it names; swapped for long-sleeve; (2) a new
  rule naming the mainstream shape words (long/short sleeve, sleeveless, crew/v/scoop neck, button front,
  cropped, oversized, midi, maxi) — **a niche shape returns a thin page padded with whatever else matched, even
  at exactly the right store.** Also: **precision-to-store matching now cuts BOTH ways** (it used to push only
  TOWARD small focused stores for precise searches — half the truth). Live, 3 runs: zero wrap, all mainstream.
- **Suites at pause, all green:** **storedepth 17** (new) · nameparity **24** (new) · curated **64** ·
  **tabtops 49** · cowork3 69 · searchchat 57 · searchtune 70 ·
  wladd 102 · wdrworksheet 73 · wdrcalmcheck 27 · hubs 49 · affq 40 · e2e 29 · catmark 135.
  ⚠️ **wdrworksheet/wdrcalmcheck/catmark were green BEFORE the final 6px spacing tweak and not re-run
  after it** (CSS margins at the page top only) — re-run them first thing if anything looks off.
- ▶ **THE FIRST THINGS NEXT SESSION, in order:**
  1. ⚖️ **THE ALMIRA CALL: MONDAY, AUGUST 17, 12:30 PM** (amber-quinn HubSpot, phone). **Ask how it went
     and LOG THE TM FILING DATES + SERIAL NUMBERS HERE.** The loaded agenda rode the booking form (both
     filings incl. the logo mark silent since July 16 · corrected Articles "Bail"→Bailey · the completed
     Operating Agreement, open since Aug 5 · EIN status · a written timeline). This is the money path.
  2. 📱 **Sunday Aug 16 was the first automatic Star swap** (kitten heel → bangles) **AND the first firing
     of the link-check Routine, 9:00 AM ET.** Both should have happened with nothing from her — **ask
     whether they did.** A missed Routine fire or a Star that did not turn is a real bug, not a nothing.
  3. 👀 **How the TRIMMED NAMES read on her phone.** The honest cost of the parity guarantee is plainer
     cards ("Satin Top", not "Satin Draped Top"). ▶ **If they feel too bare, the lever is letting the
     SEARCH carry the extra word, never weakening the guarantee.**
  4. ✍️ **Her verdict on the two flagged DRAFTS she has not blessed:** the positive half of the basic-top
     definition (the NEVER list is hers, the crew/scoop/V half is Claude's), and the to6 dressy line
     beyond her satin sentence.
  5. ▶ **The store MIDDLE TIER** (the revisit trigger above) — Talbots · J.Jill · Lands' End · Boden ·
     J.Crew · Anthropologie · Free People · Athleta. **Ask, never infer.** Nothing is blocked on it.
- ▶ **UNCHANGED AND STILL WAITING:** her Cowork spreadsheet rhythm (new CSV export → "new export" → the
  converter validates → commit; no code changes should EVER be needed for new rows) · MailerLite desk items
  ("Email me my wishlist" · photo-tips email) · more Trending/Edit content · the parked triggers (the
  registry at affiliate approval · her My Story photo · the holiday gift guide as Star machinery in
  November costume · organising the Edit at ~25-30 items).
- ▶ Everything from the 2026-08-14 entries below is unchanged by this work.

## ▶ PREVIOUS — 2026-08-14 evening (THE CURATED CATALOG IS BUILT)

### ⏸ WHERE THE 2026-08-14 EVENING SESSION PAUSED
**MERGED as PR #852 on her explicit word ("let's go ahead and merge it") after the full talk-through — all
five build items + both Cowork docs + renders of the FINAL blended shelf, which she approved ("i like how
that looks with no badges"). One Netlify build.** The talk-through reshaped the design mid-session; the
final form below is what shipped. Verify live per the standing rule if anything looks off.
- 📄 **Drive is the working handoff channel now** (her Desktop was unreachable from the cloud container).
  Three files arrived: "Style Star - Claude Code handoff.md" + "style-star-products.csv" (21 real products,
  bo1 Blue jeans ×8 · to5 Professional blouses ×13) + "Style Star - freshness addendum.md".
- ⭐⭐ **THE HEADLINE DECISION, hers after a full discussion — THE CATALOG IS DELIBERATELY UNATTRIBUTED:**
  no "Picked by Catherine" on catalog cards, no hand-picked/checked line, no labels dividing her products
  from AI ideas. Her reasons, recorded in the code comment above `_curatedCard` so this never reads as an
  accident: (1) she can't promise the spreadsheet stays perfectly current, and her NAME on a stale item
  breaks trust personally where an anonymous miss costs nothing; (2) a badge on hundreds of items stops
  being special. Her words: **"It's ok if she thinks the AI stylist is doing the work and it is just a
  brilliant app."** The Sally real-stylist signal lives at the PAGE level (checklist framing, founder line)
  and the **Edit + Star of the Week stay fully, visibly hers** — she'll keep building those. Attribution can
  be turned ON later as an upgrade; removed later it reads as a demotion. ▶ The ONE surviving distinction is
  functional and unbadged: catalog "Shop it" = exact product page, AI "Find it" = store search.
- ⭐ **THE BLENDED SHELF (her design, supersedes the built-then-reworked curated-only version):** on a
  wardrobe Ideas tap, **up to 4 catalog pieces lead, the AI fills the set to 6, one seamless carousel**, and
  **"+ See more ideas" keeps extending it forever** — her requirement verbatim: *"I want her to be able to
  sort through tons and tons of options if she wants to... always be able to keep looking."* The button is
  on EVERY slot (catalogued or not); first tap uses buffered leftovers (instant), later taps fetch 4 more
  with an already-shown list in the prompt so the model never repeats. AI failure with catalog present →
  catalog-only shelf, never blank. Slots with no catalog (98 of 100) = today's behavior + the See more door.
  Cards lead with the BRAND ("L'Agence", not "Nordstrom"), retailer secondary ("at Nordstrom · $385"), her
  note trimmed to its first sentence(s) (`_wdrTrimNote`, ≤150 chars — full notes made cards very tall).
- ⭐ **THE FRESHNESS MACHINERY (the addendum, built as amended):** rotation week turns **midnight into
  Sunday on her local clock, anchor Sunday 2026-08-09 — the Star of the Week's own anchor, keep them in
  step**. Within a week the shelf is stable; each Sunday it rotates (seeded shuffle: `ss_seed` per device +
  slot + week). **Staleness is WEEK-scale, prior weeks only** — ⚠️ deliberate deviation from the addendum's
  letter, which wanted day-scale "shown yesterday sinks hard" AND same-week stability (contradictory; weeks
  reconcile its own principles). Seen-tracking is `ss_seen` in localStorage (the ss_* pattern), counted once
  per week, written on render — ⚠️ deliberately NOT the addendum's per-render Supabase write. A **saved**
  piece is exempt from staleness. **"Not for me"** (`ss_dismissed`) is the one staleness hard-exclusion +
  fires a Plausible `Not For Me` event → her dashboard learns which pieces to review. ⚠️ Her stance: unsure
  but willing — "she could swipe past it, we will see." Loosely held; one line to remove if live use says so.
  ⚠️ **`_wdrHash` is FNV-1a + finalizer, NOT h*31 — the classic hash is order-preserving on p009/p010-style
  ids and silently reduced the weekly shuffle to plain id order (measured). Don't simplify it.**
- ✅ **Saves from the shelf land PLAIN on the wishlist** (`exact:true` — real URL + price + "Shop it", NO
  badge; the third exact-URL row kind after Edit picks and her own added links). wladd 102 still green.
- 📄 **The rest of the first build round stands as shipped earlier in the session:** the strict converter
  (`scripts/products-from-csv.js` → `products.json`, slots + store keys parsed OUT of index.html at convert
  time, fails loudly with row numbers, the Bloomingdale's-apostrophe case caught by name, load-bearing
  params survive, failed convert never touches products.json; canonical CSV at `data/style-star-products.csv`)
  · `ARCHETYPE_FAMILY` (28 archetypes → 9 families; ⚠️ SHE CLARIFIED: her archetype NAMES never change —
  the families are Cowork's sorting vocabulary, the map is hidden plumbing; assignments are still a Claude
  draft for her eye, esp. Statement Maker→Edgy, Sculpted Chic→Minimal, Free Spirit→Natural) ·
  `scripts/check-product-urls.js` (7 LOOKS OK · 14 NEEDS HER EYE · 0 BROKEN; bot walls and per-variant
  "sold out" text are never called broken) · startQ() closed as not-reproducible with `startqguard.js` 9
  pinning screen==write-slot on every restart path · the handoff's "still open" list verified STALE (all
  three fixed 2026-07-29, by grep).
- ▶ **PARKED, her calls:** the "new since you were here" badge + `added` CSV column — future-ideas list. Her
  insight, keep it: **a "new" badge sets an expectation of weekly newness, so any quiet week suddenly LOOKS
  stale.** Rotation gives freshness without promising it. Also parked: catalog feeding other surfaces (Shop
  your Style etc.) — wardrobe Ideas only for now, the pattern is set when she wants more.
- **Suites, all green:** curated.js **60** (converter strict-mode · blended shelf shape ≤4+fill-to-6 · zero
  attribution asserted · Shop it vs Find it · plain saves incl. badge-free wishlist row · Classic vs Glam
  differ · week-stability + cross-week rotation + dismissal-forever + staleness-sinks + saved-exempt +
  seen-written-once-per-week · price/retailer/note invariants all 28 archetypes · ruffles/no-orange/leopard
  removals · Tall-only all-AI never-empty · petite-true only · See more appends · no overflow 390/360/320 ·
  zero JS errors) · startqguard 9 · affq 40 (census 27→28 deliberate: the curated card is the 10th outbound-
  anchor template) · wdrworksheet 73 · wdrcalmcheck 27 · e2e 29 · hubs 49 · weekstar 35 · wladd 102.
  Decision renders in scratchpad: `curated-badge-{a,b}.png · curated-more.png · curated-notforme.png ·
  curated-starved.png` (pre-rework look; regenerate via curatedmock.js if needed).
- ✅ **Her post-render calls, all in:** no badges look = approved · ARCHETYPE_FAMILY pairings = "those look
  good" · **the 14 needs-her-eye links = SHE ALREADY CHECKED THEM on the Cowork side** (Cowork keeps a
  clickable page of all catalog links; they looked good as of 2026-08-14). ▶ **STANDING REMINDER, her ask:
  nudge her every week or two to re-check the catalog links on that Cowork page** (and rerun
  `scripts/check-product-urls.js` alongside — the two instruments cover different stores). "Not for me" +
  "Link broken?" both ship; if the card bottom ever feels busy, "Not for me" is the one to cut (rotation
  partly substitutes; nothing substitutes for Link broken — users are the only detector for bot-walled
  stores).
- ▶ **THE FIRST THINGS NEXT SESSION:**
  1. **How the live blended shelf feels on her phone** — first real look at Blue jeans + Professional
     blouses Ideas with her own products leading.
  2. **Her spreadsheet rhythm:** fill rows in Cowork → export CSV to the Drive folder → say "new export" →
     converter validates (names bad rows) → commit. Works at 5 rows or 50; no code changes should ever be
     needed for new rows — if one is, the data model is wrong, say so loudly (the brief's own rule).
  3. **The legal thread: SHE BOOKED THE CALL — Monday, August 17, 2026, 12:30 PM (amber-quinn HubSpot,
     phone), booked Friday night after Indie stayed silent past her deadline.** The booking form's prep box
     carries the full loaded agenda (both TM filing dates + serial numbers · corrected Articles "Bail"→
     Bailey + completed Operating Agreement, open since Aug 5 · EIN status with her I-will-get-it-myself
     line · a written timeline for anything outstanding), so their team must pull answers before the call.
     The firmer email was deliberately SKIPPED — the booking itself carries the message, the calmer move.
     ▶ First thing after Monday: ask how the call went and log the dates/serial numbers here.
- ▶ Everything from the day session below (Star of the Week autopilot, legal thread, her testing) is
  unchanged by this work.

## ▶ PREVIOUS — 2026-08-14 day session (THE STAR OF THE WEEK RUNS ITSELF NOW)

### ⏸ WHERE 2026-08-14 PAUSED (her call: "let's save everything to the .md and pause here")
**ONE PR this session, #850, merged and CURL-VERIFIED LIVE on stylestar.app; branch resynced to main,
working tree clean. ONE Netlify build.** Her words on it: "I love how this is set up" · "This is great.
I love it." What shipped, all in #850:
- ⭐⭐ **THE STAR OF THE WEEK ROTATES AUTOMATICALLY EVERY SUNDAY (her ask: "I like the idea of Sunday
  being the change day... Is that something we can set up as automatic?").** `WEEK_STAR` became
  **`WEEK_STARS`, a queue of 16**: her kitten heel first, then her 15 approved Edit picks in the Edit's
  page order (reshuffled for season, below). `_weekStarIndex()` computes the week from the visitor's
  LOCAL calendar — **anchor Sunday 2026-08-09, load-bearing, don't move it; reorder the queue instead**
  — so the new star appears at midnight into Sunday on every device with NO deploy and NO build
  minutes; the queue wraps when it ends (fine pre-launch). ▶ **Her weekly send-an-item ritual is
  RETIRED pre-launch — nothing manual on Sundays now.** This week's item is always the entry at the
  current index, still one edit if she ever wants to override. **First automatic swap: Sunday Aug 16
  (the bangles). She may check her phone Sunday to watch it happen by itself.**
- 🚫 **HER CONTENT RULE, NEW AND STANDING, pinned in the tests: NO intimates or swim as the Star** —
  the card is the first thing seen on opening the app, and *"a bra or bikini could be too much muchness
  at opening glance."* The Felina bra and Seafolly bikini stay in the Edit, deliberately NOT in the
  queue. Size-fits-everyone (bags/shoes/accessories) remains her general lean, "not a hard rule."
- ✍️ **STAR NOTES ARE ONE-LINERS trimmed from her own Edit notes (her ask: "help trim the lines...
  right length and tone")** — her blessed kitten-heel line is the tone model; only her words,
  condensed, nothing invented. ▶ **Two registers, one voice: the Edit page keeps her FULL notes; only
  the Star card speaks in one-liners.** She saw the full trim table in chat and approved the setup;
  she may still reword any single one (one string each in WEEK_STARS).
- 👠 **THE KITTEN HEEL JOINED THE EDIT (18th item, her call: "let's have it join the Edit and rotation
  queue")** — last before her sign-off, note = her blessed one-liner. The Edit's New pill lights for
  returning users automatically (wbEditSig counts items). ⚠️ **affq.js updated deliberately, not
  silenced: 17→18 hardcoded Edit links, 26→27 outbound product anchors** (the census caught the new
  anchor exactly as designed).
- ☀️ **SEASONAL ORDERING, her calls:** the Athleta linen pant and PRETTYGARDEN maxi dress moved up to
  **Aug 23 / Aug 30** ("summer items... need to be sooner, before we get to fall/winter"), and the
  espadrille wedge to **Sep 6** (Claude's flag under her own rule, her enthusiastic yes). The calendar
  now runs: kitten heel (now) → bangles Aug 16 → linen pant → maxi dress → espadrille → sandal → tote →
  Gucci sunnies → Express trouser → robe → necklace → silk blouse → blazer → jeans → Align pant → claw
  clip Nov 22 → wraps Nov 29. ▶ The back half runs right into the holidays — the parked gift-guide
  idea could wear this machinery in November costume.
- **Suites: weekstar 23 → 35, updated deliberately** (Sunday-midnight boundary Sat-11pm-vs-Sun-00:00,
  wrap-around, pre-anchor clock clamp, queue integrity incl. safe https URLs + no duplicates, HER
  no-intimates rule, and EVERY queue item rendered at 390/360/320 with zero overflow; render
  assertions compare against the live queue index so the suite stays green whichever week it runs in).
  hubs 49 · e2e 29 · affq 40 green (affq's known timing flake hit once, clean on rerun).
- ▶ **PARKED WITH A TRIGGER, her question ("when the edit page gets super long... search bar or sort?"):
  organize the Edit at ~25-30 items — category GROUPING in her stylist vocabulary (the wardrobe list's
  own gold-bar/sticky-header pattern) over a search bar** (search is inventory language; grouping keeps
  the organizing job in her hands, curation not chrome). She agreed. ⚠️ Design it properly at the
  feeds/product-photo redesign moment, with renders — don't build structure the photo redesign would
  rework. Claude flags it when the Edit approaches the threshold.
- ▶ **THE OTHER THREADS, checked this session, all still open:**
  1. **Legal:** no word from Almira as of Friday morning 08-14; Cath is giving Central-time hours
     before emailing again. **The Friday 08-15 plan stands:** if no specific date arrives, she sends
     the firmer email or books the amber-quinn call loaded with the question list (corrected Articles ·
     Operating Agreement · BOTH TM filing dates incl. the logo mark silent since July 16 · serial
     numbers · EIN status). The EIN one-liner draft is still ready in the 2026-08-13 chat; the
     irs.gov-in-15-minutes unlock stands (ask Indie first — one EIN per entity).
  2. **Her testing:** none yet this session, "but I will soon." The three retest questions stand:
     wardrobe Ideas item-led? Shop your style item-led? loved colors ONLY on the favorites item?
  3. **Sunday is still launch day — but now it launches itself.** When she comes up with more star
     items ("I will come up with more"), they slot into the queue, and new Edit additions can join it.
- ▶ **Everything else unchanged:** Cowork spreadsheet (jeans started) · MailerLite desk items · more
  Trending/Edit content · parked triggers (registry at affiliate approval · her My Story photo ·
  holiday gift guide).

## ▶ PREVIOUS — 2026-08-13 (THE BIGGEST BUILD DAY YET, plus a short evening session the same day)

### ⏸ THE SHORT EVENING SESSION OF 2026-08-13 (her call: "Good pausing point... I'll come back on new chat tomorrow 🤗")
One housekeeping PR, **#848, merged and grep-verified on main; branch resynced, working tree clean.**
The stale wladd.js suite is reconciled (the ✅ block below has the full detail) — 102/102 green, plus its
one real catch fixed live: the 320px "Copy & paste link (optional)" placeholder cut. Netlify: 2 builds
this session (the PR + this pause-note merge). **Her check-ins this session:**
- **Legal:** still Thursday, no change — she's hoping Almira/Indie wraps everything by FRIDAY 08-15.
  **If not, she WANTS to send another email — offer the draft first thing Friday** (specific-date ask +
  both TM filing dates + serial numbers + EIN status + corrected Articles + Operating Agreement). The
  EIN one-liner draft also still stands. She thanked us for helping her stay calm on this — keep doing that.
- **Her testing:** "I have done a little more testing on the wardrobe list and things are doing better.
  Will keep on testing some more." The three retest questions (item-led Ideas? item-led Shop your style?
  loved colors only on the favorites item?) remain open for her next report.
- **Sunday is still the Star of the Week swap** — she sends item/store/link/price/one-liner.

### ⏸ WHERE 2026-08-13 (main session) PAUSED
**SIXTEEN PRs merged and curl-verified live (#830–#846), working tree clean, branch resynced to main.**
In order: the item-led search fix proven against the REAL live model (#830) · name-is-the-search parity
(#831) · her two stylist vetoes, no skinny jeans / nothing ribbed (#832) · the chat chip rotation from
her most-asked client questions (#833) · the chat's "makeup for a dress" link bug fixed (#834) · **STAR
OF THE WEEK built and live** (#835, renamed + twin flanking stars #837) · the graduation whisper in her
words (#836, her trim #846: the opening sentence deleted) · **her voice unified: Lora upright 15.5px
everywhere she speaks on light paper** (#838, round two #841: seven stragglers) · the Edit hub rows now
say "Every item selected by Catherine" (#839) · the two wardrobe tabs made true siblings (#842, finished
#844 after her caught-it-half-done) · the heart-tilt sweep, no heart sits straight (#843) · the wishlist
count pill gold + 11px (#845) · the pause-notes save (#840). Her words through the day: "It is working
better" · "I love love love This Week's Star" · "I love this progress" · "I appreciate all the attention
to detail." ⚠️ **Netlify: ~16 builds today — watch the meter.**
- **Suites at pause, all green:** searchtune 70 · searchchat 57 · cowork3 69 · e2e 29 · hubs 49 ·
  menu 87 · sally 74 · heartnudge 20 · weekstar 23 (new) · chiprot 15 (new) · tabtops 15 (new) ·
  wdrworksheet 73 · wdrcalmcheck 27 · catmark 135 · a2hs 38 · affq 40.
- ✅ **THE STALE wladd.js SUITE IS RECONCILED (2026-08-13 evening session, shipped as #848): 102 checks, 0 failures — three assertions
  updated deliberately to the current design, and ONE real 320px bug the suite legitimately caught was
  fixed.** The reconciliations, each recorded in a comment at the assertion: (1) *ring-encircles-rail* →
  the ring hangs THREADED over the rail's lower edge since the rod went viewport-fixed (measured: ring
  33-45px over rod 32-40 — rail passes through it, ringf interlock intact; her screenshots accepted the
  look). New assertion pins real overlap ≥4px + really hanging below ≥2px. (2) *gold-rail-band* → the
  08-09 5px band was retired by her 08-10 hairline pick; wladd now asserts the band STAYS retired
  (::before display:none) + the twin #C89A2C hairlines are present, deferring frame detail to wlframe.js
  (the deep truth, 36 checks). (3) *collapsed-button-one-line* → width-aware: one line at 390; at 360
  her wording falls to two BALANCED lines deliberately (the empty-state button's own trade; the old
  assertion pinned the pre-velvet paper width). (4) **The real bug: "Copy & paste link (optional)"
  was cut at 320 (needed 183px, had 178)** — fixed with the established narrow-width lever, `.wl-add`
  side padding 14→6 inside the existing ≤374px media query (font untouched), now 11px of headroom.
  Verified: wladd 102 · wlframe 36 · wlfoot 13 · e2e 29 · weekstar 23 all green; 320px form render
  eyeballed clean (`scratchpad/wladd-320-fixed.png` in the session scratchpad).
- ▶ **THE FIRST THINGS TO ASK HER:**
  1. **The legal thread + her energy.** She ended the session HEATED at Indie Law (rightly — see the
     ⚖️ entry below) and paused before sending the EIN one-liner. **The draft is in the 2026-08-13 chat,
     ready to paste: "has my EIN application been submitted yet? If not I will obtain it directly from
     the IRS myself this week."** If Indie gave no specific date by Friday 08-15, she books the call
     (amber-quinn HubSpot link) loaded with the question list: corrected Articles date · completed
     Operating Agreement · word mark filing date · **logo mark filing date (silent since July 16!)** ·
     serial numbers · EIN status. ▶ **The EIN unlock, told to her: the IRS issues EINs free at irs.gov
     in ~15 min (LLC legal name + her SSN; the "Bail" typo does NOT block it) — but ONE EIN per entity,
     so ask Indie first whether they already applied.** EIN + Articles + ID likely opens the bank too.
  2. **How the live retest keeps going** — the whole search overhaul is now proven against the real
     model, but her verdict on "dialed in" is still the tester gate.
  3. **Sunday: the new Star of the Week** — she sends item/store/link/price/one-liner; the Tommy
     Hilfiger sandal rolls into the Edit at the same moment.
- ▶ **Everything else on the list is unchanged:** Cowork spreadsheet (jeans started) · MailerLite desk
  items · more Trending/Edit content · the parked triggers (registry at affiliate approval · her My
  Story photo · holiday gift guide = Star machinery in November costume).

## ▶ THE DETAIL OF 2026-08-12/13 (the two-day mega-entry the pause block above summarizes)
- 🚨⭐ **HER RETEST SCREENSHOTS PROVED THE "LEAD WITH THE ITEM" REBUILD HADN'T LANDED: wardrobe Ideas still
  color-led everywhere ("Blush Satin Camisole", "White Silk Professional Blouse", "Hot Pink Sequin Going-Out
  Blouse" — hot pink = her loved color, on a non-color item), Shop your style partly ("Gold Kitten-Heel Mules",
  "Blush Fitted Wrap Blouse").** Diagnosis found THREE separate writing bugs, all Claude's own:
  1. **The naming formula "color + style + item" lived in ALL SEVEN prompt sites** (genOutfits' Complete-the-Look
     spec, the 6-item genOutfits(source) prompt, shopMyStyle, both _shopStyleGen branches, the mirror branch,
     _wardrobeIdeaGen) — the model was literally INSTRUCTED to lead every card name with a color, and a
     color-led name drags the search with it. The SHAPE rule only ever governed the SEARCH.
  2. **The original bare "If she has color preferences, prioritize those colors" bullet SURVIVED in the
     genOutfits(source) prompt** (the Style Portrait / photo-results / Shop-your-style 6-card surface) — the
     2026-08-12 morning replacement caught five copies; this sixth never called `_colorPrefRule()` at all.
  3. **genOutfits' Complete-the-Look search spec still read "the color word ... + garment"** — color-first,
     contradicting the new SHAPE rule sitting in the same prompt.
- ⚠️ **THE 08-12-MORNING NAME/SEARCH COLOR EXCEPTION IS DELIBERATELY RETIRED** (names could carry a color the
  search dropped): a card promising "Blush Satin Camisole" over a search for "satin camisole" lands on every
  color — the name-is-a-promise rule and the exception could not coexist. **Now: names lead with the piece
  (fabric/silhouette + item, "Satin Button-Front Blouse"), and a color belongs in a name ONLY when the search
  carries the same color.** searchtune's exception assertion was updated deliberately, not silenced (it
  correctly failed), replaced by four assertions pinning the new parity.
- ⭐⭐ **HER THIRD CATCH OF THE DAY, on the SHIPPED item-led version: "Satin Button-Front Blouse" opened on a
  search for just "satin blouse" — lots without button front... it says silk professional blouse and the search
  says silk blouse so the items shown are not at all professional."** The name and search were still allowed to
  DIFFER (name got fabric + silhouette, search was capped at ONE defining word), so the name structurally
  over-promised — and for "Professional blouses" the item's own defining word was the one traded away. ▶ **THE
  FIX: name and search are ONE THING now — "the name is THE SEARCH WRITTEN BEAUTIFULLY: the same words,
  properly cased, nothing the search does not carry."** Searches get room for a second defining word when the
  piece is not itself without it ("button front blouse" is a different blouse than "blouse" — the one-word cap
  was the structural cause). The wardrobe Ideas prompt now demands the ITEM's own defining word (or a true
  store-known synonym) in EVERY search, naming her exact failure ("satin blouse" loses the professional part).
  ⚠️ **The abstract rule alone was NOT enough — the live model still left one word behind per name ("Ruched
  Bodycon Top" / "ruched going out top") until a WRONG/RIGHT example pair was added naming the violation**
  (the Work-appropriate-dresses placement lesson, again). After the example pair: word-for-word parity on 17 of
  18 live items ("Silk Professional Blouse / silk professional blouse", "Woven Button-Front Blouse / woven
  button front blouse", "Sequin Going-Out Top / sequin going out top"), the 18th a harmless soft word
  ("structured" on a top-handle bag). ⚠️ **ONE deliberate exception, written into the rule: jewelry mood words
  ("Statement Hoop Earrings" / "hoop earrings") stay out of boutique searches** — the standing small-catalog
  rule; full parity there would empty Kendra Scott. nocolor-live.js now asserts the real bar: piece-DEFINING
  words (button/front/professional/wrap/bodycon/fabrics...) must ALWAYS carry; at most one soft leftover per
  surface — chasing soft words with more prompt weight risks the 5-word-pileup failure in the other direction.
  searchtune 66 → 68 (the "at most ONE defining word" assertion updated deliberately — that cap WAS the bug).
- ⭐ **`_colorPrefRule()`'s default branch sharpened after a live test showed the model leaning "Pink Satin
  Blouse" into 1 of 6 general picks: on browsing cards the lean shows in WHICH pieces and stores are chosen,
  never as a color word in the name or search** — a specific-color ask belongs to stylist chat (her own July
  framing, now written into the rule). Complete-the-Look keeps a deliberate door open: color allowed when the
  pairing with her outfit genuinely depends on it.
- ✅✅ **PROVEN AGAINST THE REAL LIVE MODEL THIS TIME — the thing the morning session couldn't do.** The sandbox
  has no ANTHROPIC_API_KEY, but the DEPLOYED function does: `scratchpad/nocolor-live.js` captures the real
  prompts from the edited page (her exact scenario seeded, `prefs.colorsLove=['Hot Pink','Royal Blue']`) and
  POSTs them to the live function with the Origin header (the 2026-07-30 debugging pattern). **Results: Tank
  tops/Camisoles, Professional blouses, Dressy or going-out tops, and Shop your style ALL item-led against the
  real model** ("Ribbed Cotton Tank Top / ribbed tank top", "Satin Button-Front Blouse / satin blouse", "Sequin
  Going-Out Top / sequin top", "Wrap Midi Dress / wrap midi dress") — zero color-led names or searches, zero
  loved-color forcing. **And the over-correction check passed too: "Tops in your favorite colors" still leads
  with Hot Pink / Royal Blue in names with "pink"/"blue" retail words in searches** — which is exactly what
  fires the real color FILTER at Nordstrom/Macy's. ⚠️ Each run of nocolor-live.js costs a few cents of the
  production key (4 small live calls) — the same deliberate trade as the 2026-08-08 live checks.
- ⭐ **HER FOURTH ROUND (2026-08-13, same retest): "It is working better" — plus TWO STYLIST VETOES, her
  professional calls, now standing app-wide:** "skinny jeans are out of style now" and "I would never
  recommend ribbed anything to any of my clients." ▶ **Built as `_STYLIST_VETO` (['ribbed','skinny jeans'])
  prepended inside `filterNeverWear()`** — applies to EVERY woman before her personal never-wear list even
  loads, so a non-compliant model output is dropped before render — plus an absolute bullet in `_shopRules()`.
  **The Kate Spade principle applied to garment vocabulary: the app is her curation, so a piece she wouldn't
  stand behind has no place being suggested as if she picked it.** ⚠️ **Extend the list ONLY on her explicit
  word** — a first draft of the rule named "current" denim silhouettes (barrel, bootcut...) and was trimmed
  the same minute: Claude inventing a trend list violates the she-is-the-trend-authority rule the veto itself
  rests on. Live-model check on Blue jeans Ideas: "Straight Leg / Wide Leg / Bootcut / High Rise Jeans", zero
  skinny, zero ribbed, full name/search parity. searchtune 68 → 70.
- ▶ **STORE-SIDE TRAP SEEN IN HER LEVI'S SCREENSHOT, noted not built:** her "high rise skinny jeans" tap
  landed on Levi's "Sky High Farm Goods" COLLAB PAGE (10 items, mostly not jeans) — their search engine
  matched "high" against a collection name and redirected, the same family as the Macy's bare-category-word
  redirect (2026-08-12). Store-side, not fixable from our end; fewer/plainer search words (already the rule)
  is the only mitigation. Watch whether it recurs on other stores.
- **Suites at this point: searchtune 70 (was 62; assertions updated deliberately at each step) ·
  searchchat 54 · cowork3 69 · e2e 29, all green.**
- ▶ **FOR HER NEXT RETEST, the same three questions still apply** — this time the live-model evidence says they
  should pass: wardrobe Ideas item-led? Shop your style item-led? Her loved colors appearing ONLY on "Tops in
  your favorite colors"?

## ▶ PREVIOUS — earlier the same day (2026-08-12 — THE DEPARTMENT-STORE COLOR FILTERS ARE BUILT, AND KATE SPADE IS GONE)
Loose-ends session, all store-table work, all her calls. Cath sent Almira a follow-up email this morning
(awaiting reply) and confirmed the Cowork spreadsheet is the **Option 3 curated-catalog companion sheet** —
she started the jeans category, more to come, no rush.
- ⭐⭐ **THE BIGGEST FIND OF THE SESSION: "PRIORITIZE HER COLOR PREFERENCES" WAS QUIETLY HURTING EVERY SHOPPING
  SURFACE IN THE APP, not just the wardrobe list — her own live testing caught it while we worked through
  categories.** Once she'd refined and saved loved colors, she noticed searches like "blush midi dress," "royal
  blue sweatshirt," "hot pink matching athletic set" — a specific favorite color forced into EVERY search, even
  for items that were never about color at all (a work-appropriate dress, a workout top). Worst case: "red wrap
  dress" opened to dresses that were neither red nor wrapped. **Her diagnosis, verbatim-ish, and it's exactly
  right: "if we are looking for a work appropriate dress, the search does not need to limit by color... if she
  needs specifically a pink dress she can ask stylist chat to find it."** That's a real, correct product
  distinction — chat is the tool for a precise single ask (it searches, retries, asks questions); the
  multi-card browsing surfaces (wardrobe Ideas, Shop your style, Complete the Look, wishlist regen) are for
  possibilities, and forcing an exact unavailable shade into a fast 4-card glance just breaks it.
  - **Root cause: the bare bullet `"- Prioritize her color preferences"` was duplicated in FIVE separate prompt
    strings** (`shopMyStyle`, both branches of `_shopStyleGen`, `_wardrobeIdeaGen`), unconditionally pushing one
    of her exact loved colors into the leading color slot of every search, on every item, regardless of whether
    that item's own identity had anything to do with color.
  - **Fixed with ONE new shared function, `_colorPrefRule()`**, replacing all five copies so they can never
    drift apart again: *"Her loved colors are a LEAN, not a requirement... never force one of her exact colors
    onto a piece whose real point is something else... never promise a color you are not genuinely confident
    that store carries... vary colors naturally across your picks instead of repeating one."*
  - ▶ **Her other idea, considered and NOT taken, for a real reason she agreed with:** renaming "Tops in your
    favorite colors" to "Tops in popular colors" to depersonalize it. Recommended keeping the personal name
    instead — "your" is core to the brand's whole differentiation (a real stylist speaking to her, not a trend
    list) — and fixing the SEARCH BEHAVIOR instead of the item's identity gets her the same result (searches
    that aren't artificially narrowed) without losing that. She didn't push back.
  - ⚠️ **The existing `colorFallbackLine`/`noColorData` logic (the whisper + "show a spread when unrefined"
    fix from earlier this same session) was LEFT AS IS, deliberately** — it solves a different, still-real
    problem (zero color signal at all for the one color-NAMED item) and is complementary to, not overlapping
    with, this new general softening. Both apply together for "Tops in your favorite colors" now.
  - Verified live in Chromium across all four surfaces (`shopMyStyle`'s template-literal prompt included, which
    needed `${_colorPrefRule()}` interpolation syntax rather than the string-concat form the other three use):
    the new rule text is present, the old bare bullet is gone everywhere, zero JS errors.
  - 🚨 **AND SHE CAUGHT IT STILL BROKEN THE SAME SESSION — a genuine bug in the rule's own WORDING, hers to
    find:** she asked "has that gone live yet," tested, and screenshotted Tank tops/Camisoles and Professional
    blouses Ideas still landing on Hot Pink and Royal Blue — both of which turned out to be HER OWN saved loved
    colors. ▶ **ROOT CAUSE, and it's Claude's own writing bug, not a model-compliance failure this time:** the
    first `_colorPrefRule()` literally listed *"tops, dresses, jewelry, accessories"* as garment KINDS where
    color is "naturally the point" — but Tank tops and Professional blouses ARE tops, so the model correctly
    followed the rule AS WRITTEN, which was backwards from what was meant. **The reusable lesson: garment KIND
    was never the right test for whether color matters; whether THAT SPECIFIC ITEM's own identity is about
    color is.** Fixed two ways: (1) rewrote the rule to say explicitly that being a top or dress does NOT by
    itself make color the point; (2) `_colorPrefRule()` now takes an optional `itemColorSpecific` argument, and
    `_wardrobeIdeaGen` — the one caller that already knows per-item whether an item is color-named (`colorDependent`,
    built earlier this session) — passes it in directly instead of leaving it to inference: `true` for "Tops in
    your favorite colors" ("lean into them, vary across the 4 picks"), `false` for everything else in the
    checklist ("do not reach for her exact loved colors on it, no matter what kind of garment it is"). The three
    general multi-item surfaces (`shopMyStyle`, both `_shopStyleGen` branches) don't know a single item ahead of
    time, so they keep the sharpened-but-still-general wording.
  - Re-verified live in Chromium with her exact reported colors (`prefs.colorsLove=['hot pink','royal blue']`):
    Tank tops/Camisoles and Professional blouses both now carry "This item is NOT about color" · Tops in your
    favorite colors still correctly carries "Her loved colors are the whole point of this item" · the general
    surfaces carry the sharpened undefined-branch wording. `searchtune.js` green after the change.
  - ⭐⭐ **HER FOLLOW-UP TOOK THIS DEEPER, TO THE ORIGINAL AUGUST SHAPE RULE ITSELF: "putting color in the
    search as the first thing is not how a stylist would actually search and shop... I would never lead with
    color. Always lead with the item, and once she is inside the store she selects color."** This is right, and
    it's a real UX/search-engine insight, not just a preference: a color WORD sitting in free text is fragile —
    the store's engine can silently ignore it or rank it loosely (her own "red wrap dress" that opened to
    neither red nor wrapped dresses) — while a real color FILTER is a genuine constraint the engine enforces.
    **Rebuilt the `SHAPE` rule inside `_shopRules()`** (the shared function behind EVERY shopping surface,
    unchanged since her original six-screenshot session in August): searches now lead with the ITEM, never a
    color, UNLESS color is genuinely the point (she's asked for one directly, or the piece itself is explicitly
    about color). The color-FILTER mechanism (Nordstrom/Macy's/Bloomingdales, built earlier this session) needed
    no new instruction — `getStoreUrl` already applies it automatically whenever a search's first word happens
    to be a recognized color, so it "just works" the moment color genuinely belongs in a search.
  - ⭐ **HER OWN REFINEMENT, and it's a genuinely sharp distinction: a metal preference narrowed to ONE metal
    (only gold, only silver) is a real constraint, closer to her never-wear list than a soft lean — but "all
    metals" or "no preference" should show her everything.** Found this ALREADY EXISTS as `prefs.jewelry`
    (Gold/Silver/Rose Gold/Mixed metals/No preference, multi-select) — just never had this distinction encoded.
    `getPrefsForPrompt()`'s jewelry line now computes it explicitly rather than leaving the model to infer from
    a raw string: a single selected metal → "This is an absolute constraint, same weight as her never-wear
    list"; anything broader → "Never force one metal into a jewelry search."
  - ⚠️ **A DELIBERATE, NAMED EXCEPTION to the standing "every name detail must be in the search" rule
    (2026-07-29):** the card NAME can still describe a real piece's actual color (that's honest, not vague) —
    but the SEARCH now doesn't have to repeat it, since a real stylist doesn't lead a search with color either.
    Every OTHER name detail (style, silhouette, fabric) still must transfer to the search unchanged.
  - **Verified: `searchtune.js` Part 3 updated deliberately, not silenced** — two assertions pinned the OLD
    color-first phrasing and correctly failed on this change; replaced with assertions on the new "lead with the
    ITEM, not a color" rule, the name/search color exception, and the conditional (not hardcoded) jewelry-metal
    wording. Re-verified live with `prefs.jewelry='Gold'` (absolute constraint) and `'Gold, Silver'` (never
    forced) — both render correctly.
  - ▶ **Same standing caveat as every prompt-tuning change today: no live model test was possible in this
    sandbox (no `ANTHROPIC_API_KEY`).** Prompt CONTENT is verified correct; whether the model reliably follows
    the new "lead with the item" default is unproven until she retests live — same pattern as Work-appropriate
    dresses, which needed a second, stronger pass before it actually landed.
- ✅ **THE WARDROBE-IDEAS CATEGORY-BLEED FIX IS BUILT, the long-parked 2026-07-31 conversation, finally had.**
  Her original catch: starring "White tops" pulled dressy/going-out tops and tanks into its Ideas carousel —
  because `_wardrobeIdeaGen()` only ever sent the model the ONE item name, with no idea those are already
  separate checklist rows in the same Tops category. Walked her through the real Tops category (7 items) and
  she confirmed the fix for the three color-generic ones:
  1. **`_WDR_IDEA_EXCLUDE`, a small hand-reviewed map**, id → sibling ids to keep out of its Ideas. White tops,
     Black tops and Tops in your favorite colors all exclude Print tops, Tank tops/Camisoles, Professional
     blouses and Dressy or going-out tops. ⚠️ **Deliberately NOT auto-derived from the checklist structure** —
     she is the taxonomy authority (the same standing rule as the store table) and a wrong auto-exclusion would
     silently hide real results with no way to notice. Extend it only after talking a category through with
     her; nothing else in the other 9 categories was touched.
  2. **The color-fallback gap she spotted herself, unprompted: "if she has not refined, would it pick general
     popular colors?"** Traced it in the code with her — no, it wouldn't. `getPrefsForPrompt()` only adds a
     colors line when `prefs.colorsLove` has data; with nothing saved, "Tops in your favorite colors" reached
     the model with zero color signal, "her favorite" undefined. Now an explicit fallback line fires only in
     that case: show a believable spread across colors, never guess at a personal favorite.
  3. **Her ask, and it shaped the whole build: nudge her toward Refine "without getting her off track from
     shopping."** `.wdr-colorhint`, one quiet italic whisper line, sits AFTER the 4 real Ideas cards inside the
     expand panel — never before them, never blocking, matching her own value-first product principle (never
     make her earn the value). "Add yours in Refine your Preferences" link → `openPrefs()`. No dismiss/stamp
     needed: it just self-clears the moment `colorsLove` has data, so it can never nag past being useful. Sized
     13.5px `#4a463e` — the SAME readable ink just established for the Trending card this same session.
     ⚠️ **The link started gold, then she asked for green to signal the Refine page — checked contrast before
     picking one, and none of her four existing Refine-page greens actually cleared 4.5:1 against this card's
     cream background** (best was her chip-selected text green at 4.47, just short). Shipped `#256b2b`, a
     modest darkening of that same chip green, same family, 5.69:1.
  - Verified live in Chromium, intercepting the real fetch call: White tops' prompt carries all 4 exclusion
    names and no color line · unrefined "favorite colors" carries the fallback line AND renders the whisper ·
    refined "favorite colors" carries her real `Colors she loves` line and the whisper is gone. Contrast 8.19:1
    at 390/360/320, zero overflow, zero JS errors.
  - ✅ **SECOND CATEGORY DONE THE SAME SESSION: Work-appropriate dresses.** Her live-testing catch: its Ideas
    were surfacing "strapless gowns or too short" pieces. Diagnosed as TWO separate problems, not one:
    (a) the same sibling-bleed bug as Tops — Cocktail dresses and Formal gowns are the strapless-gown source,
    Sundresses the too-short/too-casual source, added to `_WDR_IDEA_EXCLUDE['dr3']`. **Daytime casual dresses
    deliberately NOT excluded, her explicit call** ("Daytime casual is fine for work appropriate"). (b) a
    DEEPER gap unique to this item: "work-appropriate" is a judgment word, not a description, so the model had
    no concrete definition to work from at all. **New `_WDR_IDEA_DEFINE` map** (id → her own stylist criteria,
    condensed from her longer notes into one prompt line): knee-length or below, tailored/never clingy or
    sheer, modest neckline, wide/standard straps only, no slits above the knee, structured medium-weight
    fabric, muted/neutral solids or subtle prints, sleeves preferred. Same standing rule as the exclusion map —
    only items she's personally defined get one; nothing invented for the other 7 Dresses items.
  - ⚠️ **NO LIVE MODEL TEST WAS POSSIBLE THIS SESSION** — this sandbox has no `ANTHROPIC_API_KEY` (the standing
    limitation noted throughout this file; deploy previews can't spend the production key either). The prompt
    CONTENT is verified correct (exclusions + her definition both present, Daytime casual absent), but whether
    the model actually reliably HONORS the stricter definition is unproven until she spot-checks it live.
  - 🚨 **AND SHE DID TEST — first version only "a little better": a Bloomingdale's one-shoulder dress,
    spaghetti straps, satin. All three explicitly against her definition.** ▶ **DIAGNOSIS, and it's a reusable
    lesson: a rule's PLACEMENT and PHRASING carry real weight, not just its content.** The first version was a
    descriptive paragraph BEFORE the RULES list ("Work-appropriate means: ..."); the one rule that visibly
    already works in this same prompt (never-wear) is an imperative NEVER bullet living INSIDE the RULES list,
    closed with "This rule is absolute." **Rewritten to match that exact shape** — moved into RULES right after
    the never-wear bullet, and the three violations she actually SAW are now named explicitly (one-shoulder,
    spaghetti straps, satin) rather than left to fall out of a general "modest neckline" phrase. Re-verified:
    the new bullet sits immediately after the never-wear rule, carries "This rule is absolute, the same weight
    as her never-wear list," and names all three violations by word. **Awaiting her SECOND live test.**
  - ⚠️ **A STRUCTURAL CAVEAT FLAGGED TO HER, worth remembering for any future EXCLUSION-based item:** the
    "Find it" link runs a short 2-4 word search directly on the STORE's own site — the model's naming and
    rules only control what gets picked and named, never what the store's search engine actually returns on
    the results page. "Work-appropriate dresses" is unusually exposed to this because it's defined mostly by
    EXCLUSIONS (no straps, no satin, no short hems) that a short store-search box cannot encode, unlike most
    checklist items which are defined by an INCLUSION (a specific color/kind) that transfers cleanly into a
    search term. So even a flawless model pick can still get undercut by whatever the store's own search
    surfaces for a generic query. This is the same search-vs-real-inventory ceiling documented elsewhere in
    this file, just harder-hitting on this one item. ▶ **If her second test still shows violations, the next
    lever isn't more prompt rules — it's whether the SEARCH TERM itself can carry one more qualifying word
    (e.g. "sheath" or "knee-length") for exclusion-defined items specifically, trading against the standing
    "extra words hurt store ranking" rule. Discuss with her before building it, don't guess.**
  - ▶ **Nothing else in the checklist was reviewed or changed.** Bottoms/Jackets & Layers/etc. all look fairly
    well-separated by name already (jeans vs. trousers vs. skirts) but that's an impression, not her
    confirmation — ask if she's noticed bleed anywhere else while testing before assuming any of it is fine.
- ✅ **WHAT'S TRENDING CARD READABILITY FIX, her live catch mid-session** — explicitly flagged against her own
  "stop polishing" pause: *"I know we decided to stop polishing things on the app but something is bothering
  me... the italic words are so small and hard to read."* Right call to raise it anyway: readability is a
  stated standing priority for her 18-80 audience, not cosmetic polish. Two things, one screenshot:
  1. **The italic description (`.tnf`)** was 13px `#5c5648` (technically ~6.4:1 contrast — passes AA, but the
     established pattern in this file is that italic+small still reads as hard-to-read for this audience even
     when the number passes, same lesson as the A2HS whisper and Menu group labels). Now **14.5px `#4a463e`**
     (the file's established readable-ink shade, used 14 other places) — **8.19:1**.
  2. **"See ideas in your style" (`.tlf`)** was bare colored text on the left. Her ask: bigger, and moved to
     the right "to be consistent with the other wardrobe list page where the clicking buttons are on the
     right side" — she meant My List's `.wdr-see` chip (squared, gold-bordered, boxed). Gave `.tlf` the exact
     same box treatment (border/padding/background, not just color-matched) and right-aligned it on the card
     via `text-align:right` on `.wdr-tcard` with `.ttf`/`.tnf` explicitly pulled back to the left, so title and
     description stay put — only the link moves. No JS/markup changes, CSS-only.
  - Verified in real Chromium at 390/360/320: no overflow, chip never clips (169px, well inside every width),
    zero JS errors, contrast computed not assumed. Screenshot sent to her before shipping.
  - ✅✅ **FOLLOW-UP, SAME SESSION, her yes: the bottom teaser strip AND the arrows, both done.**
    1. **Teaser strip** (`.wdr-tt-note`/`.wdr-tt-see`, the narrower 205px horizontal-scroll cards at the
       bottom of My List) got the identical treatment — 12.5px → 13.5px, same darkened `#4a463e` ink, same
       8.19:1 contrast, chip boxed and moved right. ⚠️ **Different CSS mechanism than the tab fix, and it
       matters:** `.wdr-tt-card` is `display:flex;flex-direction:column`, so `text-align:right` (the trick
       used on the plain-block `.wdr-tcard`) would only affect inline content, not the item's own position —
       `align-self:flex-end` on `.wdr-tt-see` is the correct property for moving a flex ITEM to the cross-axis
       end. Text wraps to 2 lines inside the narrower chip at this width, which is honest (it was already near
       wrapping before, unchanged font size, the standing readability-over-evenness rule).
    2. **All three arrows made thicker/bigger, her ask.** The trailing `&rarr;` was a bare text glyph — same
       root problem already solved once for the wardrobe TAB arrows back on 2026-08-11 (`.wdr-tab-ar`): a
       glyph's weight comes from the font, not from font-weight or font-size, so "thicker" was never reachable
       by styling text. Replaced with a shared inline SVG (`_WDR_ARR`, stroke-width 3.2, `currentColor` so it
       always matches its button's ink) across all three: My List's `.wdr-see`, the Trending tab's `.tlf`, and
       the teaser's `.wdr-tt-see`. All three buttons converted to `inline-flex` so icon+text align cleanly.
       ⚠️ **Deliberately scoped to just these three** — `&rarr;` appears in a couple dozen other places across
       the app (Shop-this-item buttons, chat links, etc.) that were never part of this conversation; left
       untouched rather than assumed in scope.
    - ⚠️ **Verified the one invariant that actually mattered here, directly, not by assumption:** the SHOP
      column heading is centered over the Ideas chip by design (a hard-won fix from 2026-08-11), and swapping
      the glyph for a differently-sized SVG changes the chip's total width, which could shift that center.
      Measured directly at 390/375/360/320: **offset is 0.07px at every width** — the centering survives
      cleanly. Also confirmed zero overflow at 390/360/320 on both the My List rows (100 of them) and the
      Trending tab, zero JS errors throughout.
- ✅ **ABERCROMBIE FIXED.** The 2026-08-09 finding was that the "womens" KEYWORD flipped Abercrombie's search
  to the MEN'S department (their parser matches "mens" inside "womens"), so it had been left deliberately
  UNSCOPED. Cath ran a plain search, tapped **Shop By → Women's**, and pasted the resulting URL, confirming
  the correct department PARAM: `facet=gender:("Women's")&filtered=true` — same `gp` mechanism already
  verified for Amazon and the Gap family. Built into Abercrombie's `STORES` entry; per the standing rule this
  silently repairs any already-saved wishlist item too.
- ✅✅ **MACY'S AND BLOOMINGDALE'S GET REAL COLOR FILTERS — her favorite stores, her ask** ("Department
  stores are my favorites for shopping. I have the best luck in them.") She screenshotted BOTH stores'
  color-filter panels, unprompted for full URLs — a much lighter ask than the usual address-bar round trip —
  and they turned out **byte-identical** (same 16 colors, same layout): confirmation the two run on the same
  platform. All 10 of the app's existing universal colors (pink/black/white/red/blue/green/brown/purple/
  yellow/orange) map 1:1 by name, no guessing needed, plus the "tan" → "Tan/Beige" mapping she'd already
  found back in August was visibly confirmed on both panels too.
  - **Built: a new `cfp` (color-facet-PATH) mechanism**, distinct from Nordstrom's `cf` (a simple suffix
    param) because these two stores put the color in the URL PATH, not a query string:
    `bloomingdales.com/shop/featured/<hyphenated-term>/Color_normal/<Color>?ss=true`. `getStoreUrl` now
    short-circuits to this path form when the search's first word is a recognized color, and falls through
    to the normal plain `?keyword=` search (unchanged, already proven correct) for everything else — so an
    unrecognized color can never risk an empty filtered page. `_CF_PATH_COLORS` holds the shared 11-word
    map (the 10 universal colors + tan). Both `STORES` entries carry `cfp:true` + their own `cfpBase`.
  - ✅✅ **MACY'S NOW INDEPENDENTLY CONFIRMED TOO, same session.** She first tested by typing the bare word
    "Dress" into Macy's search, which Macy's redirected to a CATEGORY browse page
    (`/shop/womens/clothing/dresses/Color_normal/Black?id=5449&cm_kws=Dress`) rather than a search-results
    page — a real, different URL shape, and a genuinely useful finding on its own: **a single word that
    happens to exactly match one of a store's own category names can trigger a silent redirect**, the same
    family of trap as the Macy's autocomplete-dropdown redirect caught back in July (`cm_kws_ac`). It did
    confirm the color mechanism (`/Color_normal/Black` as a path segment) works identically on Macy's, but
    not the exact `/shop/featured/` base our app actually builds. ▶ **She then tested the app's REAL
    generated URL directly** (`macys.com/shop/featured/womens-black-midi-dress/Color_normal/Black?ss=true`,
    a multi-word phrase, not a bare category word) and confirmed: **"I checked the link you sent too and it
    worked."** Both stores are now genuinely proven, not just inferred from matching UI.
  - Verified: `bloomColor` builds to
    `bloomingdales.com/shop/featured/womens-tan-top-handle-bag/Color_normal/Tan%2FBeige?ss=true` — literally
    her own original test case #6 from the six-screenshot session back in August, now finally fixed properly.
- ✅ **KATE SPADE REMOVED FROM THE STORE TABLE, her call, without hesitation: "I agree let's take Kate Spade
  off. It was bugging me a little bit."** She doesn't like the brand and wouldn't recommend it to a client —
  and since the whole 100-store table is built from HER professional curation (she tagged every store's
  quality/style/fit herself), a brand she personally wouldn't stand behind has no place recommending itself
  as if she'd chosen it. This is the same principle as her subscription-box/rental/fast-fashion exclusions
  from 2026-07-27, applied to one more store. Removed from `STORES` in `index.html` AND from `SEARCH_DOMAINS`
  in `netlify/functions/style-ai.js` (the standing rule: a store removed from one must come out of both).
  **Checked before removing: no coverage gap left behind** — 9 stores still carry handbags (Cuyana to Gucci,
  every price tier) and 5 carry jewelry (Mejuri to Tiffany & Co.), so nothing goes thin.
- ▶ **STORE COUNT: 100 now** (was 101). Three test suites that assert the store/domain count were updated
  deliberately, not silenced — `searchtune.js` (60/60 green, incl. new assertions on the path-color mechanism
  itself), `searchchat.js` (54/54), `cowork3.js` (69/69). One real bug caught along the way: a blind
  find-replace of "101"→"100" nearly broke the crawler-block-pruning tests, which measure the count AFTER a
  store is pruned (should be one FEWER than the total, not equal to it) — caught by the tests failing, fixed
  properly with the right arithmetic, not just adjusted to pass.
- ▶ **STORE VARIETY, asked and answered:** 100 stores is plenty and deliberately tuned, not just accumulated
  — every one of the 28 style archetypes has ≥3 stores per price tier and ≥1 store per category (shoes,
  bags, jewelry, eyewear, swim, activewear, denim, dresses, workwear, foundations, outerwear), tested back in
  July when the matching system was built. Told her: a felt gap in a SPECIFIC category from her own testing
  is worth far more than "should we add more in general."
- ▶ **STILL THE ONE REAL BLOCKER, unchanged: her search-quality verdict** — "None of them are 'just right.'"
  Her own retest screenshots still haven't arrived; ask for them again. Today's fixes are genuine quality
  improvements to specific stores, not a fix for the structural search-vs-catalog gap (feeds are still the
  real cure, per the 2026-08-11 entry below).
- ▶ **DEPARTMENT-STORE COLOR FILTERING IS FULLY CLOSED** — Nordstrom, Macy's and Bloomingdale's all
  confirmed live, nothing left open on this thread.

### ⏸ WHERE 2026-08-12 PAUSED (her call: "let's save everything and pause here")
**Merged and grep-verified on main straight through the session, ending at commit `9ecb8c5`.** Working tree
clean, branch matches main exactly. In order: Abercrombie's department param · Macy's + Bloomingdale's color
filters + Kate Spade removed · Trending card readability + teaser strip + thicker arrows · the wardrobe
category-boundaries walkthrough (Tops sibling-bleed, the color-fallback whisper, Work-appropriate dresses
exclusions + her definition, strengthened to absolute + named violations after her first retest) · Bottoms/
Jackets & Layers/Activewear/Foundations/Sleepwear/Shoes all reviewed and confirmed fine as-is, no changes ·
**then the big one: "Prioritize her color preferences" found to be quietly hurting every shopping surface**,
replaced with one shared `_colorPrefRule()` — caught still-broken on her own live retest (a writing bug, listing
"tops" as a color-relevant garment kind), fixed properly · **then her deeper insight: search should lead with
the ITEM, never a color, unless color is genuinely the point** — the original August SHAPE rule rebuilt, plus
her jewelry-metal refinement (one metal = absolute constraint, multiple/no-preference = never forced).
- ▶ **THE FIRST THING TO ASK HER: how her testing went.** She said she'd test and report back; nothing here
  confirms the color/SHAPE rebuild or the Work-appropriate dresses strengthening actually landed with the
  model — both are verified correct in the PROMPT, unproven against the real model from this sandbox (no
  `ANTHROPIC_API_KEY` here, same standing limitation). Ask specifically: does Professional blouses / Tank
  tops still show hot pink or royal blue? Does a plain search (no color) actually feel more like real
  shopping? Does Work-appropriate dresses still show strapless/spaghetti-strap/satin pieces?
- ✅ **CATEGORY REVIEW: CLOSED, her call (2026-08-13): "We can cross off [the category review]. I think we
  are all good on the categories but I will keep testing."** Bags and Extras & Accessories were never
  walked through and deliberately won't be — the walkthrough track record showed guessing from category
  structure was wrong 3 of 4 times, and both real finds (Tops, Dresses) came from HER live testing anyway.
  **The standing method now: her testing IS the category review.** Reopen only if she reports a specific
  bleed; don't re-offer the walkthrough.
- ⭐⭐ **HER MOST-ASKED STYLIST QUESTIONS ARRIVED (2026-08-13, the long-waited words — stylist taxonomy,
  verbatim-ish, do not paraphrase away):**
  1. **"What is in this season?"** — her note: "That is exactly why we have What's Trending page."
  2. **"Where do you find so many stylish clothes?"** — "That's why we have the Style Star Mall."
  3. **"I have an event and I don't know what to wear. Can you help me nail the right vibe?"** — the
     clear chat-chip candidate, in her clients' own words.
  ✅ **AND THE CHIP ROTATION IS BUILT FROM THEM, same session, her picks at every step:** the fresh-chat
  chips are now `_CHIP_RING` — Dress me for an event → What's in this season? → My essentials → Shift one
  notch — with TWO ring chips showing per visit (advancing one step each fresh-chat open, `ss_chiprot`)
  plus the photo chip as the ONE permanent anchor (the door she cannot just type). ▶ **Her call that
  shaped it: "Shift one notch" STAYS but rides the rotation** — "that is a big part of how I work.
  Shifting people one standard deviation... always baby steps, never a full makeover." ▶ **Why rotation
  over a fixed 4/5: MEASURED — five fixed chips stack five rows tall at 360px** (each chip its own row on
  Display Zoom phones), and rotation keeps today's 3-chip density while keeping every question in play —
  the same feels-fresh-each-visit instinct as her weekly-loop idea. Return-conversation and photo chip
  sets untouched. ⚠️ The season chip's fuller sent question ("What's in this season? What trends should I
  know about?") is a Claude draft she hasn't reworded. Verified: new `scratchpad/chiprot.js`, 15 checks
  (ring advances + wraps across 5 visits, photo anchor always present, the event chip sends her clients'
  exact sentence, return-conversation chips unaffected, Start-fresh restores the rotation, no overflow
  390/360/320, zero JS errors).
  4. ⚠️ **The most common of all, and SHE DOES NOT WANT IT ADDRESSED IN THE APP:** clients' unhappiness/
     insecurity about size/weight — "everyone always always wants outfits that make them look slimmer /
     more flattering silhouettes." **Her explicit boundary — no chip, no feature, no copy about looking
     slimmer or body flattery.** Consistent with her 2026-07-28 rule (never mention her size range back
     to her while shopping). The app serves flattering fits silently through her styling; it never names
     bodies. Protect this in every future copy/feature decision.
- 🚨✅ **THE CHAT'S "MAKEUP FOR A DRESS" LINK BUG — her screenshots, diagnosed and FIXED (2026-08-13).**
  Her report: chat link searches "not landing the right items... sometimes completely not even close,"
  with Revolve opening on MAKEUP and Anthropologie on sneakers for two dress recommendations. ▶ **Both
  screenshots were ONE bug, ours, not the structural feeds gap: `_searchableItem`'s last-4-words
  heuristic assumed the item name sits at the END of the phrase before "from Store" — but the stylist
  writes "Satin slip midi dress in champagne or blush from Revolve", so the COLOR TAIL became the whole
  search** ("in champagne or blush" → Revolve matched blush the cosmetic; "in gold or black" → gold
  sneakers). **Fix: cut any trailing "in <shades>" clause before extracting** (the garment always
  precedes "in"), and the capture windows widened 40→60 chars so the full garment survives the cut
  ("Satin slip midi dress", not "slip midi dress"). searchchat 54 → 57, her two exact sentences as
  cases. ▶ **The honest split given to her, worth repeating: (1) fragment bug = fixed · (2) right-words-
  but-loose-results = the structural search-vs-catalog gap, feeds are the cure, don't chase with prompt
  tweaks · (3) searched answers ("Checking stores...") bypass this entirely — exact product URLs.**
  Her framing stands: not getting hung up on link quality until affiliates + her spreadsheet land.
- ⭐⭐✅ **THE STAR OF THE WEEK IS BUILT AND LIVE (2026-08-13, her design, her name):** ⚠️ **RENAMED same
  day, her call: "I like Star of the Week better than This Week's Star"** — card label, graduation
  whisper and tests all updated; internal names (`WEEK_STAR`, `.wks-*`, `ss_grad`) unchanged. **Her pick
  "C" from a three-way star render: TWIN tilted gold stars flanking the label** (the CURATED BY
  CATHERINE treatment, in gold; 17px, ±12°, soft glow) — her ask was "bigger or brighter stars," and her
  own wisdom capped it there: the real card glow-up is the product PHOTO at feeds, so only the stars
  turned up now. ✅ **The card's note is BLESSED — her words: "I actually really like the wording... I
  wouldn't change it."** It reads: "A kitten heel is the easiest polish there is. Slide it on and every
  outfit steps up a notch." Hers now, don't reword. (Original build notes follow:) the weekly return loop, shipped as a linen card on WELCOME BACK (front door — a return
  habit needs to be seen before she decides where to go) between the greeting mirror and Catherine's
  whisper. Gold star + "THIS WEEK'S STAR" label, item name in DM Serif Display, her one-line note with
  her tilted pink heart (Catherine speaking), black-lacquer + gold "Shop it" pill (the marquee action
  language on that same screen) + Save heart. **Saved stars land on Your Wishlist as "Catherine's pick"
  with the EXACT product URL** (the Edit-pick machinery, pick:true — the second deliberate never-store-
  URL exception extended to its third user). `.wks-disc` disclosure under the card — the FIRST product
  link on s-wb, so the screen needed one (the disclosure list is NINE places now; the _shopCard comment
  updated). **Mechanics: `WEEK_STAR` const + `_renderWeekStar()` from `updateWbScreen()` — changing the
  week is ONE const edit; no item set = no card, gracefully.** ▶ **HER WEEKLY RITUAL: she sends one item
  (name, store, exact link, price, her one-liner); the OUTGOING star rolls into the Style Star Edit at
  the same time — one ritual grows two features.** ⚠️ The name carries a clock: if she ever wants out of
  the weekly rhythm, RENAME the label, never let it go stale (the honesty rule). Holiday gift guide =
  this machinery in November costume, parked. ⭐ **Her stylist insight, protect it: bags/shoes/
  accessories are the perfect weekly item because they fit EVERYONE — "does not matter plus size or
  petite."** First star: **Tommy Hilfiger Claihre Kitten Heel Slide Sandal @ Nordstrom** (her link,
  canonicalized to /s/8960533 — her size/width params stripped; name verified via the live searching
  chat, Nordstrom's bot wall hides it from curl). ⚠️ **OPEN, waiting on her: the price** (unverifiable
  from sandbox, never guessed — card shows price only when set) **and the note is a flagged Claude
  draft** ("A kitten heel is the easiest polish there is...") — she rewrites in her voice. Also flagged:
  if the specific COLORWAY was her point, say so and the color param goes back. Verified: new
  `scratchpad/weekstar.js` 23 checks (render, exact-URL save → Catherine's-pick badge, AA contrast, no
  overflow 390/360/320, graceful absence, zero JS errors) · hubs 46 · e2e 29 · **affq 39→40 updated
  deliberately: the outbound-anchor census caught the new Shop it anchor exactly as designed (25→26,
  9th JS template)**. ▶ wish.js noted retired (superseded by wladd.js) — its crash in a sweep is not a
  regression.
- ✅⭐ **THE GRADUATION WHISPER IS BUILT — HER LINE ARRIVED (2026-08-13, the words waited on since
  2026-08-03):** *"You've explored it all. Remember I'm here for the everyday too, what to wear, what to
  pack, which bag. Just ask and check back for weekly updates ♥"* — with her explicit invitation to
  polish ("or something similar that nudges her visit us often"). **As built: her line nearly verbatim,
  with ONE offered change — "check back for This Week's Star" instead of "weekly updates"** (naming the
  concrete reason to return; she can swap it back with one word). ⚠️ **HER TRIM, 2026-08-13 late: the
  opening "You've explored it all." is DELETED (her call)** — the whisper now begins "Remember I'm here
  for the everyday too...". hubs 49 assertion updated with it. Mechanics: the 6th `_WB_NEXT` entry,
  `k:'grad'`, kept LAST in the array; `when()` = all five journey stops resolved (visited, ✕-skipped, or
  never eligible — checked by KEY, never index); tap = `openChat()` + `ss_grad` stamp (never again);
  ✕ rides the same `ss_nextskip` store. **hubs.js 46 → 49, updated deliberately: the old "explored
  everything → no whisper at all" assertion is superseded** — now asserts grad appears with her exact
  trio + the weekly nudge, tap lands in chat + stamps, then never again. ⚠️ **Her price arrived too:
  the first star is $89** (her own Nordstrom screenshot, Color: Black shown — base URL kept showing
  both colorways; pin black only if she asks). The card's NOTE is still Claude's flagged draft.
- ⭐⭐✅ **CATHERINE'S VOICE IS ONE VOICE NOW — HER OWN CONSISTENCY AUDIT, BUILT (2026-08-13):** she
  screenshotted her pink-heart surfaces and caught the drift herself — her voice was wearing THREE fonts
  (Lora/Fraunces/Jost), italic and upright mixed, five inks, sizes 12.5-15.5px. **THE RULE, hers now,
  written into the CSS comment at `.hm-founder`: on LIGHT paper her voice is Lora UPRIGHT 15.5px in the
  readable ink #4a463e — no italics anywhere** ("In general I don't think I like italics" — right call:
  the pink heart + serif already say "personal"; italics only cost readability on the 18-80 audience).
  Converted: Edit subtitle + item notes (gold quote marks kept — they carry the "she's speaking" signal
  without italics), Trending intro + teaser note (Fraunces→Lora), Star of the Week note, heart-tip,
  wardrobe color hint, My List closing line, portrait refine whisper, and **the Welcome founder line —
  which was the SMALLEST text of the whole set at 12.5px, on the single most important Sally sentence**
  (now 15.5, balances to 3 lines). ⚠️ **THE ROOT CAUSE FIND: Lora was loaded ITALIC-ONLY in the Google
  Fonts URL** — upright faces didn't exist on the page, which is why her voice kept ending up italic;
  the 0,* weights were added. Don't trim them. ⚠️ **The DARK Welcome Back whispers (#wbNext, #a2hs)
  deliberately stay cream Jost 14px upright** — her whisper register, tuned by her own 2026-08-09
  catches; serif thin strokes shimmer on dark at that size. **Two registers, one voice — notes on paper
  wear Lora, whispers on the dark stage wear cream.** "With love, Catherine" (Dancing Script) exempt:
  that's her handwriting, not her speaking voice. Verified: computed-style sweep across every surface at
  390/360/320 (all Lora upright 15.5 #4a463e, zero overflow; the one "missing" flag was the harness
  grabbing the teaser's hidden note copy) · searchtune 70 (heart-tip italic assertion updated
  deliberately to the new voice) · wdrworksheet 73 (the Catherine line still balances to exactly 2
  lines in Lora) · weekstar 23 · e2e 29.
  ✅ **ROUND TWO, her catch on her way out ("These don't look consistent yet?"): SEVEN stragglers her
  screenshots + a full-stylesheet italic sweep found, all converted (2026-08-13, PR #841):** the trend
  card notes `.tnf` + teaser notes `.wdr-tt-note` (Fraunces italic → Lora upright 15.5) · the wardrobe
  how-to box (Jost 13 → Lora 15.5 — it literally begins "the checklist I use in every closet
  consultation", her voice all along) · the green Refine link inside the color hint (italic dropped) ·
  the per-item worksheet notes `.wdr-note` (⚠️ the ONE deliberate size deviation: 13px, compact for the
  dense 100-row tool, but upright Lora in the readable ink now — was faint 12.5 italic #8a7a52) · her
  Refine philosophy line `.pref-philo` (upright at 19px) · the dead base `.dc-subtitle` italic cleaned.
  ⚠️ **ONE italic deliberately KEPT, flagged to her: "I'll style it, just for you" on Analyze
  (`.photo-sub`, pink #EC4899) — that is the STYLIST's voice (pink star register), not Catherine's
  paper voice; changing it belongs to a stylist-voice conversation if she ever wants one.** UI-state
  italics (chat typing, loading lines, quiz hint) untouched — machine states, not voices.
  wdrworksheet 73 · wdrcalmcheck 27 · catmark 135 green after the sweep.
- ✅⭐ **THE TWO WARDROBE TABS OPEN AND CLOSE AS SIBLINGS NOW — her pick "B with hearts" from a 3-way
  render (2026-08-13, PR #842):** My List's how-to card opens with the SAME header construction as
  Trending's CURATED BY CATHERINE — literal `.wdr-trend-by` class reuse, so the teal caps, tilted twin
  pink hearts (±12°), gap and trailing-tracking fix can physically never drift apart. ⚠️ **The header
  reads "MY CLIENT CHECKLIST" — a Claude draft, shortened from the drafted "THE CHECKLIST I USE WITH
  CLIENTS" because MEASURED: 31 chars wraps at 360/320 while Trending's 20-char header fits; ≤20 chars
  is the cap. She hasn't blessed the wording — offer "MY CLOSET CHECKLIST" if client reads wrong.**
  Header hides with the full how-to when the card collapses to brief. **And Trending gained her closing
  line under the cards (her idea + her wording, lightly set): "Check back for trend updates. This list
  changes with the seasons ♥"** — bookending both tabs (My List already closes with her intention line)
  and quietly reinforcing the weekly return loop. Voice spec applied (Lora upright 15.5 #4a463e).
  Verified: new `scratchpad/tabtops.js` 13 checks (header computed-style + heart transforms IDENTICAL
  to Trending's measured visible — the display:none-lies trap hit again and fixed in-harness · brief
  mode hides header · closing line voice/position · one line at 390/360/320, no sideways scroll) ·
  wdrworksheet 73 · wdrcalmcheck 27 · catmark 135.
  ⚠️ **AND SHE CAUGHT THE BUILD HALF-DONE on her phone (PR #844): the Trending intro never got its
  FRAME** — the render showed it boxed but only the header edit shipped — **and the how-to copy sat
  left-aligned against Trending's centered copy.** Fixed: the intro is wrapped in the SAME
  `.wdr-howto` card class (`.wdr-trend-intro`, class reuse = never drifts) and the how-to is centered.
  tabtops 13 → 15 (frame computed-style identity + centered-copy assertions). The lesson: a render is
  a PROMISE — diff the built page against the picked render before calling an option done.
- ✅ **THE HEART-TILT SWEEP, her catch on the graduation whisper's STRAIGHT heart ("I think the tilted
  is sweet and I like consistency sweeps", 2026-08-13, PR #843):** a full census found TWO straight
  hearts — the journey/graduation whisper's `.wbn-h` AND the A2HS whisper's `.a2-h` — both now tilt
  12°, and the Star note's `.wks-ch` moved 11°→12° to match its family. ▶ **THE TILT SYSTEM, now a CSS
  comment at `.wbn-h`: hearts TRAILING a sentence in her voice = 12° (the .pinkheart family) · the
  maker's-mark hearts on rows/titles (.menu-ch/.hub-ch/.st-ch) = their her-approved 11° · the
  Catherine's-pick badge = its deliberate LEFT -11° (her spec). No heart sits straight.** Verified by a
  computed-transform sweep across every heart context + a2hs 38 · weekstar 23 · hubs 49 green.
- ✅ **THE EDIT HUB-ROW SUB-LINE IS HERS NOW: "Every item selected by Catherine" (her pick, 2026-08-13),
  in all four copies** (wb-sub · hm-csub · actsub ×2). Her catch started it: "Pieces I wear and
  recommend" didn't sound right — the "I" floated in a different card than the name-anchor. ▶ **THE
  REFINED NAMING SYSTEM this settles (supersedes the 08-11 "name her once per page" rule): the two
  heart-marked rows (Edit + Trending) BOTH carry her NAME; the neighbor rows ("Stores I've chosen for
  you", "The checklist I use with clients") keep "I", borrowing from the visible name beside them.**
  Candidates were MEASURED first: her longer favorites ("What Catherine recommends and wears herself")
  wrap on Discover's fixed 212px sub; the winner fits 390+360 and wraps once on wb at 320 only (the
  standing readability-over-evenness trade). The "wears myself" story lives on inside the Edit's own
  subtitle — the row claims, the page tells. sally.js 71 → 74 updated deliberately (the ≥3-I-rows
  assertion became ≥2-I-rows + a two-named-rows check); heartnudge 20 green.
- ⚖️ **LEGAL THREAD ESCALATED (2026-08-13):** Indie Client Care answered her follow-up with a
  no-date "we've escalated and will let you know." **Cath sent a firm reply the same day** (already
  sent, reviewed after the fact): asks for a SPECIFIC date for the corrected documents (Bailey name
  fix + completed Operating Agreement, open since 08-05) or she books the call; asks whether the TWO
  trademark applications (word mark + logo) have been FILED, with serial numbers if so ("$2,100 in
  USPTO fees paid months ago" — her figure); notes it holds up EIN → bank → affiliates → launch. ⚠️
  Two small date slips in her sent version, both in her favor if challenged: LLC actually active since
  JULY 27 (not Aug 5 — that's the doc delivery date), TMs drafted since mid-JULY (not June). ▶ **Her
  inbox check pending: the "final action steps" email for the word mark that Indie said on 08-05 was
  being sent — if it arrived and awaits her signature, completing it removes their best excuse; if it
  never arrived, that's the broken commitment.** Watch for Indie's dated answer or the call booking.
  ▶ **SHE THEN SHARED THE FULL JUNE 3 → AUG 13 THREAD and the assessment was given (2026-08-13,
  end of session): her email was right, the delay is real** — paid IN FULL June 30 ($3,999 + $130 +
  $2,100), Indie promised to FILE the TMs "on or before July 24" and never did, and SHE discovered her
  own LLC approval on Sunbiz Aug 5 while they "kept a close eye." New finds from the full thread: **the
  LOGO mark has been silent since July 16** (Aug 5 named only the word mark — her email's "two
  applications" ask covers it, listen for both in the answer) · the Aug 13 booking link is amber-quinn,
  not Almira (case handed around) · her TM search verdict was "proceed but prepare for potential
  challenges," so every week unfiled is priority-date risk — fair call leverage. **The EIN one-liner
  draft is written (in chat) and SHE PAUSED before sending it: "I feel heated about this right now...
  I want to clear this energy."** Honor the pause; the line loses nothing by waiting a day. Her
  full-thread tone has been impeccable — protect that.
- ▶ **Watch for:** Almira's reply (Bailey name fix + operating-agreement blanks, sent again this morning) ·
  the Cowork curated-catalog spreadsheet (jeans category started, in progress, hers on her own timeline) ·
  her search-quality retest, still the one real blocker to sharing/testers, now with several genuine rounds
  of improvement behind it since her last verdict.

## ▶ PREVIOUS — 2026-08-11, EVENING SESSION — the clean list ships, and HER SEARCH VERDICT is the one blocker
⚠️ Date note: this was a second session on 08-11; a few in-code comments from it are stamped 2026-08-12. Same session, no missing day.

### 🚨 THE HEADLINE, HER WORDS, AND IT IS THE WHOLE SHARING QUESTION: THE SEARCHES ARE THE ONLY BLOCKER
She has done MORE testing on her own (screenshots NOT yet sent — ask for them, again): **"I am not happy with
the way the searches are turning up. None of them are 'just right'... That is the only thing"** holding her
back from sharing with friends. **Everything else she is proud of:** *"I am very proud of how it looks and how
the buttons are all functioning and I don't see anything else like it out in the world and I have searched!
All the other style apps are so annoying I can't even explain."* She knows affiliate approval → feeds should
change it and wants to see how that lands first.
- ▶ **HER OPEN QUESTION, bring the honest answer next session: "do we need to add some ChatGPT capability
  mixed in to what our search is able to do now?"** The 0c answer still holds and should be RE-GIVEN plainly:
  ChatGPT's edge is OpenAI's PRIVATE merchant catalog (retailers upload feeds directly; no door for outside
  apps) — not a smarter model, better eyes. **The same retailers hand the same feeds to the affiliate
  networks, so approval = the catalog too** (`docs/product-feeds-plan.md` is shovel-ready). Our chat already
  has the middle rung (web search over her 101 stores). Possible middle steps to DISCUSS, not build unasked:
  extending search-verification to the card surfaces (measure cost/latency honestly first — a searching call
  is 5-10¢ and 10-20s, times 6 cards), or her Cowork "Option 3 curated catalog" spec (parked, needs its
  companion spreadsheet). ⚠️ Do not oversell any of these; feeds are the cure and she knows the sequencing.
- ▶ **The step-back conversation happened and she AGREED ON ALL POINTS:** testers are the highest-value next
  thing (gated on the searches, above) · her photo for the bottom of My Story stays the favourite parked item ·
  the install-without-email-save conversation is parked · **no more visual polish until testers surface
  something** (her agreement — protect the restraint budget).

### ▶ HER DESK DAY IS THE DAY AFTER THIS SESSION — three things she named
1. **The Almira follow-up email** — her words: "Seems like I should have heard back from her by now."
   (The 08-05 two-ask reply — Bailey name fix + operating-agreement blanks — got only an acknowledgment on
   08-07, nothing substantive since.) Offer to draft it; the TM signature email and EIN sit behind her reply.
2. **The Cowork spreadsheet she has NOT started** — her words: "cowork told me I need to create a
   spreadsheet." ⚠️ ASK WHICH ONE: most likely the retailer-intelligence business fields (affiliate status /
   commission / AI priority — the 2026-07-27 decision that those live in HER spreadsheet, never in the app),
   or the Option 3 curated-catalog companion sheet. Don't guess; the two have different jobs.
3. General desk work (MailerLite items remain: "Email me my wishlist" · photo-tips email + wardrobe capture).

### ⭐⭐ THE CLEAN LIST IS LIVE (#828, grep-verified on main) — her design, her clipboard metaphor
Her brainstorm, verbatim-ish: a clean list of what she starred so the 100-item page ends "more do-able, more
actually shoppable" — *"That is most like how I would actually do this if I was working with paper and a
clipboard... I would worksheet it first, then make one clean list at the end. Then get to work looking at
links."* **Her picks, built in one day: A + B + C.**
- **A — the end-of-list payoff names her pieces:** the block that said "That's N pieces on your list" now
  writes them out — gold star · item name · category label per row, in the worksheet's own category order,
  custom additions LAST under MY ADDITIONS. Live-updating on star taps (the whole block re-renders); names
  go through `_esc` (custom names are her typing). `_wdrMyListRows()` + `.wdr-mylist` in `_wdrRenderShopEnd`.
- **B — the card is titled BUILDING MY WARDROBE** (`.wml-h`), wearing the category headers' exact 2px
  `#D8A52E` gold underline bar, so the clean list reads as the worksheet's own closing page.
- **C — Catherine's line replaced the sub, HER CALL:** "Shop them all together, in your style." is DELETED
  (survives only as a CSS comment) and **"Building your well-rounded wardrobe with intention" + her tilted
  pink `.pinkheart`** sits in its place. ▶ Her wording quietly echoes her own founder line ("created with
  love & intention ♥") — one voice, two ends of the app. **UPRIGHT 14px, her call** (the whisper readability
  lesson, re-applied by her own ear). ⚠️ **Measured: 313px in a 300px box → two BALANCED lines at every
  width, by design** (`text-wrap:balance`); the font was deliberately not shrunk to force one line. The
  wdrworksheet closing-line assertion now expects exactly 2.
- ▶ **WHY THIS ANSWERS THE 08-11 TWO-LISTS CONFUSION better than any label tweak:** the star finally has a
  VISIBLE destination — "ADD" has an answer to "add to what?". She agreed the ADD-label question feels
  settled ("I agree with you on all points"), but ⚠️ confirm on her phone. **And she affirmed the bridge:**
  "I do like that items from the wardrobe build list end up on the wishlist when she clicks the heart on the
  find" — the two-lists architecture stays.
- ▶ **Her call on the "100 items" question, HER OWN instinct: do NOT state the count at the top.** "It is a
  talking point but probably don't need to advertise that" — the possibility-map rule, applied by her. The
  only count on the page is "That's N pieces on YOUR list." Nothing was changed; nothing should be.
- ⚠️ **Flagged to her, unanswered — watch her phone reaction:** "Building" now appears twice within inches
  (the card title + her line). Offered alternate if it ever bothers her: "A well-rounded wardrobe, chosen
  with intention" (title untouched). Also for her eye: the two-line break ("Building your well-rounded /
  wardrobe with intention ♥") on real Safari.
- **Bonus, measured: ZERO item names wrap in the summary at 390/360/320** — without the star column and
  Ideas chip the names get the full card width. The tidiest text on the page.
- **Offered and NOT taken (renders exist, `mylist-{a,b,c}.png` · `mylist2-{a,b,c}.png`):** B-the-filter (a
  "My list · 6" toggle collapsing the worksheet — strongest "My List is a real place" version, parked; the
  naming tension with the MY LIST tab is the wrinkle if ever revisited) · C-up-top (summary card above the
  worksheet — grows too tall as her list grows) · "on your wardrobe list" in the lead (option 2A).
- **Verified: new `scratchpad/wdrmylist.js` 65 checks** (order, live update via real handlers, removed-item
  exclusion, XSS inert, star + heart DIMENSIONS asserted, AA contrast, no overflow, empty state) ·
  **wdrworksheet 69 → 73** (⚠️ two deliberate updates, not silences: the old sub is asserted GONE so it can't
  come back doubled, and the closing-line check measures the Catherine line at 2 balanced lines) ·
  wdrstarplace 144 · catmark 135 · wdrcalmcheck 27 all green. **Netlify: only ONE build this session.**

### 🚨 THE MEASUREMENT LESSON OF THE EVENING — A ROTATED SVG'S RECT INVENTS A PHANTOM LINE
`Range.getClientRects()` returns a rect per ELEMENT as well as per text box (the 08-10 lesson), **and the
tilted heart's rect top sits ~2px off the text line's top, so exact top-matching counted it as a second
line** — wdrworksheet failed 72/73 on a line that provably fit (258px in a 300px box). ▶ **Fix, now in both
suites: cluster rect tops within 6px — a real wrap moves ~20px (one line-height), an inline mark's skew
moves ~2px.** Also from the same evening: ⚠️ **piping a suite through `tail`/`grep` eats its exit code AND
its early output** — the "1 failed" was invisible until re-run unpiped. One file per run, no pipes on suites.

## ▶ PREVIOUS — earlier the same day (2026-08-11 morning — HER SCREENSHOT DAY: the hubs get a face, the Wardrobe List becomes a worksheet)

### 🚨 PICK UP HERE FIRST — THE TWO LISTS CONFUSED *HER*, WHICH IS THE LOUDEST SIGNAL YET (2026-08-11, her last message)
Her words at the very end of the session: *"items that I hit star on Wardrobe list page are not showing up
on my wishlist... I thought as soon as we hit the star it adds it to wishlist."* Then, after the
explanation: **"Yes I got confused with my own lists."**
- ▶ **IT IS NOT A BUG. `wardrobeWant()` writes only to `wardrobeData.items` and never touches
  `wardrobeData.wishlist`** — verified in code. That is the TWO-LISTS RULE she set on 2026-07-29 and her
  reasoning still holds: **My List holds CATEGORIES ("White tops") and answers "what is missing from my
  closet?"; Your Wishlist holds SPECIFIC PIECES (name + store + link) and answers "what did I see that I
  want to buy?"** The two are joined by **Ideas**, not by the star: star a category → tap Ideas → heart an
  actual piece → THAT lands on the wishlist.
- 🚨 **BUT THE MOST EXPERIENCED USER OF THIS APP, WHO DESIGNED BOTH LISTS HERSELF, EXPECTED THEM TO
  CONNECT.** If the author's own instinct says the star should feed the wishlist, a first-time woman has no
  chance. **Treat this as a real finding, not a support answer.**
- ⚠️ **AND TODAY'S OWN CHANGES PROBABLY FED IT, which is Claude's to own:** the star column had NO label at
  all until 2026-08-11. It now reads header **ADD**, caption **ADDED**, tooltip *"Add to my list."* The
  tooltip is technically correct (the tab really is called **My List**), but **"ADD" on its own NAMES NO
  DESTINATION** — add to what? Before today there was nothing to misread; a label was added that is
  ambiguous, and she read it the way most people would.
- ▶ **FOUR DIRECTIONS, NONE BUILT, HER CALL — and they are not equal in size:**
  1. **Name the destination in the column header** — "MY LIST" instead of "ADD". Most direct. ⚠️ It is a
     30px column, so it needs measuring (text-align:center means the CENTRE stays aligned even if the text
     is wider than the box, so alignment survives; crowding is the question).
  2. **Make the caption say WHERE** — "ON MY LIST" rather than "ADDED".
  3. **Leave the labels and let the how-to carry it** — it says "add to your closet" today, which is close
     but never mentions that a second list exists.
  4. ⚠️ **THE BIG ONE: reconsider whether TWO lists is right at all.** This is a product conversation, not
     a label tweak, and it reopens a decision she made deliberately. **Do not treat 1-3 as settling it if
     her instinct keeps pointing the other way.** Bring her the July reasoning (in the 2026-07-29 section
     below) and let her weigh it against her own lived confusion.
- ▶ **A USEFUL FRAME FOR THAT CONVERSATION:** the star and the heart are not redundant — a category and a
  product are genuinely different things, and the wishlist would become meaningless if it filled with
  "White tops". The honest question is not "merge them" but **"does she ever SEE the bridge?"** Ideas is
  the bridge and it is one tap away, but nothing on the page says so.

### ⏸ WHERE 2026-08-11 ENDED (her call: "let's ship that live and then we can save all to the .md and pause")
**NINE PRs merged and GREP-VERIFIED ON MAIN: #818–#825.** Working tree clean, branch resynced to main.
Suites at pause: **wdrworksheet 69 (new) · wdrstarplace 144 · catmark 135 · sally 70 (new) · velvet 36 ·
wdrcalmcheck 27 · heartnudge 20 (new) · nav 80 · menu 87 · hubs 46 · titlerule 19 · copy 41 · e2e 29 ·
affq 40**, all green. ⚠️ **Netlify: NINE builds today**, on top of ~19 across the two 08-10 sessions —
she topped up $10 on 08-09, **watch the meter**.
- ▶ **THE FIRST THING TO ASK HER: how the Wardrobe List feels on her phone**, because the last three
  changes shipped without her seeing them live: the readable column labels, the one-line "Shop them all
  together, in your style.", and the bigger/darker add-your-own placeholder.
- ▶ **THE ONE HONEST RISK IN TODAY'S WORK:** the Ideas chip took width from the name column, so item-name
  wrapping went 0→1 at 390, 1→3 at 360, 11→14 at 320. **No text was shrunk to buy it** (the standing
  readability call). If she finds it untidy on Display Zoom, the lever is the chip's padding, not the font.
- ▶ **HER PARKED IDEA, and she wants it:** a small photo of her at the **BOTTOM OF MY STORY** (her
  husband's suggestion). She does not have the right photo yet. ▶ A face is the strongest possible version
  of Sally's note — unfakeable in a way no typography is — so raise it when she mentions a photo.
- ▶ Offered and declined today: a per-category count on the Wardrobe List (`TOPS 2/7`).
- ▶ **Everything else on her list is unchanged and waiting on OTHERS or on HER WORDS:** the Abercrombie
  department-param URL · her search-retest screenshots · **her graduation-whisper line** · **her most-asked
  stylist questions** for the chat chips. Waiting on others: Indie Law (Bailey name fix + operating-agreement
  blanks) → TM signature email → EIN → bank → affiliate applications. Parked builds: Bloomingdale's
  colour-facet path form; the registry FIRST when affiliate approval lands.

### ⭐⭐ THE RULE OF THE DAY, PROVEN TWICE ON TWO PAGES: A BLEED AND ITS ACCENT MUST NOT BE THE SAME COLOUR
The Edit bled the EXACT `#0FA6B6` of its own CURATED BY CATHERINE lettering, and My Story bled the exact
`#F49AC1` of her hearts, both on the reasoning that page and backdrop should "speak one colour."
▶ **Her catch, and it generalises to every future full-bleed: when the BLEED and the ACCENT are the same
colour at the same saturation, THE ACCENT STOPS BEING AN ACCENT** — the lettering has nothing to stand out
from. As shipped: Edit `#0E7F8C`, My Story `#CE5C86`. **The hearts and the turquoise lettering are
UNTOUCHED** — only the backdrops moved, and `velvet.js` asserts exactly that split (bleed differs from ink,
bleed is measurably darker). Offered and not taken each time: a deeper jewel tone (heads back toward the
velvet look her wardrobe rethink retired) and a pale wash (nearly the same VALUE as the white page inside
it, so the page edge dissolves — the getting-lost failure she caught on the wishlist frame).

### ⭐⭐ SALLY'S NOTE, ANSWERED: THE HUB ROWS NOW SAY WHO IS BEHIND THEM (her ask, #820/#821)
Her question: *"In keeping with what Sally advised — what can we add to this to gently emphasize a real
person is behind this?"*
- ▶ **THE DIAGNOSIS THAT SHAPED IT, and it is the keeper: of the ten hub sub-lines, exactly ONE named a
  human.** The other nine described WHAT each feature is and hid WHO made it — and four were actively
  ambiguous about agency ("Hand-picked pieces you'll love" by whom · "Browse curated stores" by whom ·
  "Expert guidance" whose · "Upload a photo for feedback" from whom). **Implying a person and then not
  naming them is exactly how a faceless AI app reads.**
- **As shipped, on all FOUR hub surfaces** (Discover, Welcome Back, Style Portrait, Analyze results — each
  sub-line lives on 3-4 of them and all copies changed together, counted by the test):
  `Hand-picked pieces you'll love` → **`Pieces I wear and recommend`** ·
  `Browse curated stores` → **`Stores I've chosen for you`** ·
  `Your personal wardrobe checklist` → **`The checklist I use with clients`**
  ⚠️ Both new lines are LIFTED FROM HER OWN EXISTING WORDS (her Edit subtitle, her wardrobe how-to) — her
  voice moved to where it gets read, not new copy.
- ▶ **THE WORDS ARE THE LEVER, THE MARK IS THE REINFORCEMENT.** A heart is nearly invisible to a stranger
  who does not know what it means; a sentence with "I" in it is something no faceless app ever says. Her
  signature pink heart (`.hub-ch`, same pink/11° tilt as `.menu-ch`) went on the **SAME TWO ROWS the Menu
  marks** — the Edit and What's Trending — so the surfaces can never drift. ⚠️ **Deliberately NOT on the
  Mall or the Wardrobe List although those are also hers: their sub-lines now say "I" in WORDS, and a mark
  earns its place most where the words do not already carry it.** 2 of 10 rows here, 3 of 18 in the Menu.
  A maker's mark, not a sticker.
- ⚠️ **TWO THINGS DELIBERATELY LEFT ALONE, both her own rules, both asserted so they cannot creep:**
  (1) **Ask your stylist keeps "Expert guidance, anytime"** — pink heart = Catherine speaking, pink star =
  the AI stylist working on her behalf; "I" there would claim she personally answers the chat.
  (2) **What's Trending keeps "picked by Catherine", in the THIRD person** — ▶ **the page needs ONE place
  that gives a NAME. "I" is intimate but anonymous; a name is the anchor the other lines borrow from.
  Name her once, use "I" elsewhere.**
- ⚠️ **The Edit line was SHORTENED the same day** (`Pieces I wear myself and recommend` → `Pieces I wear
  and recommend`) because it wrapped on Discover, **whose sub container is a FIXED 212px at every screen
  width**. Her "&" idea fit by **0.4px** in Chromium — inside normal text-measurement variance, and the
  exact margin that wrapped her tagline on real Safari. **"I wear" already says it is personal, so
  "myself" was emphasis, not information.**
- ⚠️ **The mark's `margin-left` is 0, NOT the Menu's 5px, and that is what makes them MATCH.** `.menu-ch`
  sits in a plain BLOCK row so its margin IS the gap; the hub titles are FLEX rows already carrying a 6-7px
  gap for the arrow, so 5px stacked on top and the mark sat ~11px out (her catch). ▶ **If a gap ever looks
  wrong, measure the PARENT'S gap first — the margin is not the only thing spacing it.**

### ⭐⭐ THE WARDROBE LIST IS A WORKSHEET NOW — her favourite page, her design (#823/#824/#825)
Her words: *"I really love how this page is like a worksheet and it really is the format I use when I am
looking at a client's closet."* Her two problems: the star's meaning is explained at the TOP but never at
the POINT OF USE, and two starred rows in a row "sort of merge together looking like one color block."
1. 🚨 **THE DIVIDER WAS A BUG, NOT A PREFERENCE.** `#f0ebe0` measures **1.14:1** on the paper and
   **1.06:1** on a starred row's `#FAF1DA` fill — **between two adjacent starred rows the line effectively
   DID NOT EXIST.** Now `#D6C9A8` (1.57:1 / 1.46:1).
2. **THE COLUMN HEADING, her own metaphor finishing itself: SHOP over the Ideas control, ADD over the
   star.** ⚠️ It repeats at EVERY category on purpose — that re-teaches down a 100-row page without
   printing a caption on all 100 (the objection to the every-row version). It also labels "Ideas", which
   had never been explained anywhere.
3. **HER COMBO: the star turns gold AND says ADDED underneath, only on starred rows.** ⚠️ **Measured cost
   she accepted:** that row grows 44→53px so rows BELOW shift **9px** on tap; reserving the line on all 100
   rows instead cost **+891px** of page (~14%). ▶ **The 9px is benign because the caption grows INSIDE the
   tapped row, which keeps its top edge — nothing moves under her thumb.** Not the same as the how-to
   collapse (~100px, right where she was reading), which was deliberately deferred to the next visit.
4. **IDEAS IS A SQUARED CHIP.** ▶ **Measuring what she asked about found something bigger: the plain link
   was a 46.5 × 11.5px TAP TARGET sitting 9px from the star** — an 11.5px-tall control beside another
   control, on a 100-row list, for an audience that runs to 80. Now **68.5 × 23.5px with a 19px gap.**
   Squared not pill (matches her squared cards); a filled version was argued down for competing with
   "Shop my whole list" on the same screen.
5. ⭐ **THE STICKY WORKSHEET HEADER — Claude's idea, and her verdict: "totally your idea. That turned out
   fabulous."** The category name AND the column heading travel together (`.wdr-cathead`, `top:46px` to
   clear the MENU chip), so however deep she has scrolled she can see WHICH section she is in and WHAT the
   controls do. ⚠️ **It only works because `.ss.wardrobe-mirror` lost its `overflow:hidden` the same day —
   a clipping ancestor kills `position:sticky` SILENTLY.** Verified by walking 33 scroll positions asking
   `elementFromPoint` what is actually PAINTED at the pinned header's centre; a row never wins.
- ⚠️ **HER ALIGNMENT CATCH WAS RIGHT AT A WIDTH SHE HAD NOT LOOKED AT.** At 390 SHOP already sat exactly
  over the chip; **under 390 the ROW's gap drops 9→6px and it loses its 2px side padding**, while the
  heading kept both — sliding SHOP 5px off its column on every narrow phone. The heading's gap, padding and
  the chip's margin now all track the row's, asserted CENTRE-OVER-CENTRE at 390/375/360/320.
- ⚠️ **THE HONEST COST, no text shrunk anywhere:** the chip takes width from the name column, so wrapping
  goes 0→1 at 390, 1→3 at 360, 11→14 at 320. A narrow-width padding trim gives most of it back. 320 was
  always a losing battle on this list (15 before the 2026-07-26 trim). **A proper tap target beats an even
  list.**

### ⭐ THE DISCLOSURE LOST ITS PRONOUN, AND HOW SHE GOT THERE IS THE LESSON (#822)
`Some links may earn us a commission.` → **`Some links may earn a commission.`** (8 in-app surfaces).
She asked whether "Style Star" would read better than "us" — *"honestly there is no us, it's just me."*
**"me" was recommended** (truer, same two characters, matches the her-voice hub lines shipped the same day,
and Amazon's mandatory sentence is already first person). **She tried it and said the "me sounds worse than
us."**
- ▶ **SHE WAS RIGHT AND THE RECOMMENDATION HAD MISSED HER OBJECTION. She did not have a PRONOUN problem,
  she had a SUBJECT problem:** the sentence foregrounds her earning money, and naming her sharpens that
  rather than softening it. Making the LINKS the subject removes her from the sentence while the legal fact
  survives. ⚠️ **Weigh future copy this way: when someone dislikes a sentence, check what it is ABOUT before
  rewriting who is in it.**
- ⚠️ **ARGUED AGAINST AND NOT TAKEN, each for a real reason:** *"Some may earn a commission"* (her ask —
  "some" has NO ANTECEDENT, and it saves ~30px that was already spare) · *"Some links are affiliate links"*
  (the FTC has warned many consumers do not know the term, and this audience runs to 80) · *"Affiliate
  links help keep Style Star free"* (the best WRITING of the lot and the weakest disclosure — it never says
  a purchase generates a commission) · pairing the fact with her value-first framing (WRAPS below 375px,
  and a TWO-LINE disclosure is MORE prominent, defeating the purpose).
- ▶ **THE LINE IS AT THE FLOOR ON ALL THREE LEVERS AND SHOULD BE LEFT ALONE:** wording (shortest
  unambiguous form), frequency (once per screen carrying links), visual weight (11px at 4.6:1 — a
  disclosure that cannot be read is not a disclosure). It already had 96px of slack in the tightest
  container, **so length was never what made it feel loud.** ⚠️ The `_shopCard` comment is updated: SEVEN →
  EIGHT places, grep `may earn a commission`. Only the MALL keeps its longer founder-voice version.

### ⚠️⚠️ THE MEASUREMENT LESSONS OF 2026-08-11 — FIVE TRAPS, EACH COST REAL TIME, ALL REUSABLE
1. 🚨 **ASSERT DIMENSIONS, NOT JUST POSITIONS.** The wardrobe header star was written as `.wdr-star` — a
   class ALREADY TAKEN by the per-item row star button, whose rule sits later in the file and won the
   cascade — so it silently rendered at **30px instead of 48**. **All 88 checks passed**, because every one
   measured centring and clearance and not one measured SIZE. ▶ **When a rule sets a dimension, assert the
   dimension. And check a new class name against the file before using it on a screen that already has one.**
2. 🚨 **RASTERISE BEFORE TRUSTING RECTS.** Her phone found the same star **CUT OFF at the top**:
   `.ss.wardrobe-mirror` inherited `overflow:hidden` from the base `.ss` (whose job is clipping to 28px
   rounded corners) and sliced **11.4px** off its point. **A clipped element's rect is unchanged**, so every
   geometric check passed — and it was cut in Claude's own renders the day before, unseen.
3. 🚨 **A MEDIA QUERY ADDS NO SPECIFICITY** (a rule already written above `.wdr-tab` in this file). The
   Wardrobe List's narrow-width overrides were placed BEFORE the rules they override and did **nothing**,
   twice. ▶ **The tell is byte-identical failures across two attempts: when a fix changes NOTHING AT ALL,
   check the cascade before re-reading the values.**
4. 🚨 **A MEASUREMENT THAT RETURNS EXACTLY ZERO IS USUALLY A BROKEN HARNESS.** The first pass at her
   ADD/ADDED combo reported "difference 0.0px" for both variants — wrong twice over: `.wdr-star` was
   `height:30px` FIXED so the caption overflowed invisibly, and the 122px shift it DID report was the
   "Shop my whole list" button appearing when wantCount goes 0→1, swamping the thing under test.
5. 🚨 **NEVER ASSERT AGAINST AN ELEMENT THAT MAY BE `display:none`** — hit twice more today. The Menu heart
   measures **0** unless the drawer is opened first, and hub rows had to be DRIVEN on screen with
   `show('s-wb')` because **a hidden row yields ZERO range rects, so a "fits (0 lines)" passes the wrap
   check vacuously.** `visibleRows` and `menuOpenOk` are the guards that make those assertions real.
6. ⚠️ **CSS COMMENT BALANCE.** Twice in one day a comment was extended by pasting prose in FRONT of an
   existing rule, leaving a stray `*/` that closed it early; the next paragraph then parsed as CSS and
   swallowed the rule after it (the heart rendered BLACK at the wrong size). `sally.js` now counts `/*`
   against `*/` across the whole stylesheet.

### ▶ THE OTHER SMALL FIXES OF 2026-08-11, all from her screenshots
- **The Edit's corner star was OVERLAPPING the MENU chip** — measured on the DRAWN path (its rotated
  bounding box overstates by ~25px and would have hidden it): the tip sat **5.9px above the chip's bottom
  and 35px inside it**, on every width 320-430. `.dc-logo` margin-top 8→24px moves star and title together;
  **Back is an earlier sibling in normal flow so it does not move** (measured unchanged). Plus her ask to
  tighten CURATED BY CATHERINE → the paragraph, 16→8px.
- **"See my Style Portrait" → "See your Style Portrait"** (both places: the Welcome Back hub row and the
  twin button on the preferences-done screen). Her catch, and it is her own refined naming rule: **outside
  the page the app is POINTING AT A PLACE, so it says "your"** — even phrased as a verb. The 2026-07-31
  rule had listed this string as her-voice; **the 2026-08-10 refinement supersedes that for anything that
  names a destination.**
- **The wardrobe tab arrows now match the "Shop my whole list" arrow.** ⚠️ They were TEXT GLYPHS
  (`content:"\2190"`), so "the same size" could never have been reached by changing a font-size — a glyph's
  weight comes from the font. They are now the IDENTICAL inline SVG (`.wdr-tab-ar`, same path, 2.6 stroke,
  19px box), the left one mirrored with `scaleX(-1)`. Also brings them under the no-brand-mark-as-a-glyph rule.
- **Three readability lifts, all below the AA bar and all found by her eye:** the worksheet's SHOP/ADD
  labels (8.5px `#8a7f66` = **3.79:1** → 10.5px `#5f5647` = 6.92:1) · the add-your-own placeholder
  (`#a39c8a` = **2.73:1**, the worst text on the page → `#6b6355` = 5.93:1 at 14.5px). ▶ **The pattern is
  now three-for-three with the Menu's group labels on 08-09: a label small enough to feel like decoration
  stops being read.** ⚠️ The placeholder matters most of the three — **it is the only thing telling her she
  can add pieces of her own at all. An invitation, not a hint.**
- **"Shop them all together, in your style." holds one line** — ▶ it was never wrapping, the break was a
  **hardcoded `<br>`**, so no amount of width would ever have fixed it. Asserted so it cannot come back.

## ▶ PREVIOUS — START HERE-EST-EST-EST-EST (2026-08-10 — HER SCREENSHOT PASS: the tagline, and the MARKS get sorted)

### ⭐ THE "YOUR vs MY" VOICE RULE IS SETTLED — HER QUESTION, AND IT SHARPENS THE 2026-07-31 RULE (2026-08-10)
Her catch, and it was a genuinely confusing drift she spotted herself: *"We call it Your Wardrobe List in the HUB
and on the menu then she arrives on the page and the tab says My List... then it says Shop my whole list. So we
are using Your and My. I want to be consistent and not confusing and not annoying."*
- ▶ **THE RULE, and it is a REFINEMENT of the 2026-07-31 naming rule, not a replacement: OUTSIDE the page, the
  app is POINTING AT A PLACE → "Your." INSIDE the page, SHE OWNS IT → "My."** So the Menu row and the hub rows
  say **Your Wardrobe List** (the app handing her a door), and once she is standing in it the tab says **My List**
  and the button says **Shop my whole list** (her voice, claiming her own worksheet). That is not an
  inconsistency, it is a POINT OF VIEW change, and it is the same rule the whole app already runs on — it just
  had never been written down as a rule about WHERE the words appear.
- **So the HEADING needs neither word**, which was her own instinct: it is a title, not a pointer and not her
  speaking. ▶ **And her better idea replaced the stitched logo tag entirely: work the brand into the title** —
  **"Catherine's style Star Wardrobe List"**, falling back to **"style Star Wardrobe List"** with no name. One
  letterhead instead of two competing ones, and the possessive does the "yours" job without the word.
- ⚠️ **Deliberately NOT changed, her explicit call: the how-to paragraph stays exactly as it is.** It was offered
  and she declined ("I don't think we need to tweak the how-to").
- 🚨 **AND HER "check the slider line underneath" CAUGHT A REAL BUG THAT NO CODE CHANGE CREATED.** `.wdr-title`
  is an `inline-block` and its gold rule is `left:8%;right:8%` — **a percentage OF THE BLOCK.** ▶ **An
  inline-block that WRAPS takes the full available width**, so the moment the title went to two lines the rule
  stopped being sized by the WORDS and started being sized by the PHONE: **269px at 390, 256px at 375, 244px at
  360**, sticking out **60px past the last line**. **Fixed with an explicit break after "style Star"** (built
  from **text nodes + a `<br>` element, never `innerHTML`** — the name is user input), which makes the block's
  max-content the widest LINE: **block hugs at 222px, rule 187px, identical on every phone.** The break also
  stops the brand name splitting across lines, which the browser's own wrap would have done for a longer name.
  ⚠️ **Don't remove the forced break.** `scratchpad/titlerule.js` asserts block-hugs-widest-line, rule-inside-
  the-title, and **rule-identical-at-390/375/360** — the last one is what would fail if it regresses.
- ✅ **HER TWO LIVE CATCHES ON THE SHIPPED VERSION, both built (2026-08-10):** (1) **the rule was too short** on
  the no-name title — it was inset `left/right:8%`, now **0/0, so it is exactly as wide as the words** (252px
  under the 252px no-name title, 0px overhang; 222px under the named one, matching its first line). ⚠️
  `titlerule.js`'s assertion flipped from *rule-inside-the-words* to *rule-equals-the-words* — a deliberate
  change, recorded here so it can't read as a silenced test. (2) **the pale wishlist frame was "getting lost"**
  — ▶ **the cause is VALUE, not hue: `#FEF6D6` is nearly as light as the paper it surrounds, so its INNER edge
  dissolved and only the outer edge (against the black velvet) read at all.** Her pick from a 5-way render
  (`scratchpad/wlframe2.js` → `wlframe2.png`): **a 1px gold hairline on BOTH edges in `#C89A2C`, the crown
  heart's OWN outline stroke** — so the frame now matches the heart in CONSTRUCTION, not just colour. Offered
  and not taken: a black hairline (its outer ring merges with the velvet, redundant) and two
  deepen-the-yellow-instead options. ⚠️ **Drawn with `box-shadow` (outset ring + inset ring), never a second
  border — ZERO layout cost**, which matters because the empty-state wishing button has only 13px of headroom.
  ▶ **AND THIS SHARPENS THE ANTI-LAYERED-EDGE RULE rather than breaking it: her past retirements (the restore
  card's 4px bar, My Story's white+pink rings) were second EMPHASIS devices on something already loud. A
  hairline here is DEFINITION — it is what makes the pale band visible at all.** Weigh future edges by that
  distinction. `wlframe.js` is 24 → 32 checks (both rings present, one inset, colour == the heart's stroke, and
  the card's own drop shadow surviving the box-shadow rewrite).
- 🚨 **PR #811 (the pale-yellow wishlist frame) MERGED AN EMPTY DIFF, and she was right that it wasn't live.**
  The commit was made **on `main`** by mistake, the branch the PR was opened from never carried it, and the
  squash-merge landed a commit message with no code. **Recovered from `git reflog`** (`9da207f`) and shipped
  properly. ▶ **This is the SECOND time in one day** (see #809). **STANDING: after any PR merges, confirm the
  code with `git show origin/main:index.html | grep <the new string>` — a green merge proves nothing.**

### ⭐⭐ HER RETHINK: THE WARDROBE LIST GOES CALM — and it produced a PRODUCT RULE (2026-08-10, late)
Her words: the gold/yellow bleed and the very gold Trending frame are **"too much muchness"**, and *"I thought
the velvet black bleed/jewel box look would be beautiful but it's not turning out how I imagined... let's tone
it down and be more simplified."* She undid her own earlier picks, which is the right instinct and cost only CSS.
- ⭐ **THE RULE, and it is HERS, and it is a PRODUCT rule not a taste one: A WOMAN WHO DOES NOT LIKE YELLOW
  SHOULD NOT BE MADE TO SIT IN A YELLOW ROOM WHILE JUDGING GARMENT COLOURS.** Your Wardrobe List is a working
  TOOL. A saturated full-screen colour there (a) imposes a preference on someone whose whole reason for being in
  the app is discovering her OWN palette, and (b) genuinely shifts how she perceives the colours she is about to
  shop for. ▶ **So: colour bleeds belong on the pages that are ABOUT CATHERINE (My Story, the Edit), never on
  the tools.** Weigh every future full-bleed against this.
- ⭐ **AND THE PER-TAB FLIP WAS MOST OF THE NOISE BY ITSELF.** Switching tabs repainted the entire screen
  (gold-on-black becoming black-on-gold) — one page with two identities, changing on a tap. **The flip is gone;
  the tabs change only the content.** ⚠️ `_wdrSkin()` is kept as a **no-op that CLEARS `wdr-gold`/`wdr-black`**,
  deliberately rather than deleted, because a woman mid-session can still carry one of those classes on `<html>`
  from the previous build.
- ▶ **LEARNED FROM THE RENDERS AND REUSABLE: THE FRAME AND THE BLEED WERE ONE EFFECT, NOT TWO.** Quieten the
  bleed and the 11px frame stops reading as a jewel-box edge and starts reading as a heavy black band with a
  strip of colour outside it. That is why every middle option (linen / charcoal / greige bleed **with** the
  frame kept) looked WORSE than either extreme. **They had to go together.**
- ▶ **AND WHY THE VELVET DISAPPOINTED HER, worth remembering before proposing another one: a jewel box works
  when it holds ONE PRECIOUS THING.** Your Wishlist is arguably that. A 100-row checklist that scrolls for pages
  is not — the velvet became a long dark corridor instead of a case. **The wishlist keeps its jewel box; the
  wardrobe does not.**
- **As built (her pick D + her pick C on the stitches):** `.ss.wardrobe-mirror` loses its border, shadow and
  background, so the page sits on the app's own linen like every other working screen; the dashed stitch is
  **deleted**. ⚠️ **The stitch had to go for a reason beyond "simpler": it used to sit INSIDE a solid frame,
  where it read as stitching on paper. Once the frame went it became the only line on the page, and a 2px dark
  dashed rectangle around content is the interface convention for AN EMPTY BOX WAITING TO BE FILLED** (the
  drop-a-file-here outline) — it stopped reading as couture and started reading as unfinished. Offered and not
  taken: a **1px soft-taupe** version, which does still work if she ever wants that thread back.
- ✅ **BONUS, measured: ZERO item names wrap now at 390 / 375 / 360.** Losing the 11px frame gave the rows 22px
  back, so the narrow-phone squeeze it had caused is gone. ⚠️ Her own note shipping it: *"I am a little hesitant
  that it looks so plain, but let's go ahead live and take a look."* **Expect a follow-up either way** — every
  piece of this is one line to restore.
- Verified: new `scratchpad/wdrcalmcheck.js` **27 checks** (no frame/shadow/stitch/bleed class at three widths,
  no sideways scroll, rows keep their gap from the screen edge, and **Trending proven to be the SAME treatment
  as My List** — the assertion that would fail if the flip ever came back). Renders: `wdrcalm-{list,trend}.png`
  (the four directions) and `wdrstitch-{list,trend}.png` (the three stitch weights).

### ⏸⏸ WHERE THE 2026-08-10 EVENING SESSION PAUSED (her call: "let's pause and I will open new session")
**Merged and CURL/GREP-VERIFIED ON MAIN, six PRs: #812–#816** (the brand into the wardrobe heading + the title
rule fix · the full-width rule + the wishlist gold hairline · the double-footer hardening · the softer bleed +
flat legal frames + letterhead nudge · the whole Wardrobe List rethink). Working tree clean, branch ref matching
HEAD. Suites at pause: **velvet 26 · wdrcalmcheck 27 · catmark 132 · nav 80 · footcount 21 · titlerule 19 ·
wlframe 36 · wlfoot 13**, all green.
- ▶ **THE FIRST THING TO ASK HER: how the live pages look on her phone.** Three are new and unseen by her:
  (1) **the Wardrobe List, calm** — ⚠️ **she shipped it with a stated hesitation, "I am a little hesitant that it
  looks so plain, but let's go ahead live and take a look," so EXPECT A FOLLOW-UP.** The gentlest thing to add
  back is the **1px soft-taupe dashed stitch** (offered, not taken; every piece is one line to restore).
  (2) the **wishlist frame** with its gold hairline. (3) the **FAQ/Terms/Privacy** frames now that they are flat.
- ▶ **THE ONE LOOSE THREAD: the double footer she screenshotted on Your Wishlist.** ⚠️ **NOT REPRODUCED** — 13
  routes into the wishlist and all 20 screens came back with exactly one footer, before AND after the fix. What
  shipped is a GUARANTEE (show() hides the global footer whenever the screen owns one, plus a `:has()` CSS rule
  no JS ordering can defeat), not a diagnosis. **If she sees it again, the one useful question is WHICH PAGE SHE
  CAME FROM just before** — that is the input the sweeps cannot guess.
- ⚠️ **Netlify burned a LOT of builds today** (~19 across both sessions). She topped up $10 on 08-09; watch the
  meter, and keep batching picks into one merge the way this session did.
- ▶ **Everything else on her list is unchanged and mostly waiting on OTHERS or on HER WORDS:** the Abercrombie
  department-param URL · her search-retest screenshots (asked for three times now) · **her graduation-whisper
  line** · **her most-asked stylist questions** for the chat chips. Waiting on others: Indie Law (Bailey name fix
  + operating-agreement blanks) → TM signature email → EIN → bank → affiliate applications. Parked builds:
  Bloomingdale's colour-facet path form; the registry FIRST when affiliate approval lands.

### ⏸ WHERE 2026-08-10 ENDED — 13 fixes, 5 builds, ALL MERGED AND CURL-VERIFIED LIVE (#799–#804)
A pure her-screenshots day. **Her word on the first batch: "All of those came out looking good thank you."**
Shipped, in order: the tagline on one line + tighter My Story header · red→pink SVG hearts on Trending AND the
Edit · the stylist's pink star on the shopping loader · the wishlist empty state (smaller heart, tighter card) ·
the curated-by hearts made symmetric and tucked in · the empty state again (gold SVG heart, tighter heart
spacing, boxed + bigger wishing button) · the commission line centred · the wardrobe categories given the
Menu's gold bar.
- ▶ **THE LESSON OF THE WHOLE DAY, and it is the reusable one: THE CSS WAS CORRECT AND THE MEASUREMENTS AGREED
  WITH IT, AND HER PHONE WAS STILL RIGHT.** Three times: hearts specified `#F49AC1` rendered RED (iOS emoji
  substitution) · two gaps that measured *identical* (10.13/10.13) looked plainly uneven (trailing
  letter-spacing, invisible to advance-width rects) · a disclosure in a centred box read left-of-centre (the box
  was centred, the text inside it was not). **Every one of them was only findable by counting PAINTED PIXELS.**
  ▶ When she reports something the numbers say is fine, rasterise before arguing. She has been right every time.
- ⚠️ **THREE HEART GLYPHS FIXED, TWO DELIBERATELY LEFT** — the heart-tip `&#9825;` (U+2661, no emoji
  presentation) and the footer stars. They read correctly on her phone today; the SVG swap is the fix if either
  ever goes off-colour.
- ▶ **STILL OPEN, unchanged and all waiting on HER:** the Abercrombie department-param URL (results page → Shop
  By → Women's → paste the URL) · her search-retest screenshots (asked for twice now, never arrived) · **her
  graduation-whisper line** · **her most-asked stylist questions** for the chat chips. Waiting on others: Indie
  Law (Bailey fix + operating-agreement blanks) → TM signature email → EIN → bank → affiliate applications.
  Parked builds: Bloomingdale's colour-facet path form, and the registry FIRST when affiliate approval lands.
- ⚠️ **Netlify: 4 builds today on top of yesterday's ~11.** She topped up $10 on 08-09 — watch the meter.

### ✅ THE MENU CHIP CAME TO ASK YOUR STYLIST + MY STORY GOT HER HEART (2026-08-10, her two questions, #804)
Both started as HER questions, not asks — "I don't remember the reason why we left [the Menu] off there" and
"do you think we should put a small tilted pink heart next to the header on My Story?"
1. ▶ **THE CHAT'S MISSING CHIP HAD A STALE REASON, and measuring killed it.** The code comment said the chip
   stood down on `s-chat` because the chat has "its own tight header". **`scratchpad/chipchat.js` forced it on
   and found NO collision at all** — clears the pink star by **8px**, never touches the title or Back, at 430
   down to 320, **with no safe-area inset (the worst case, chip sits highest)**. So it was a product decision
   masquerading as a layout constraint. **Her call: add it.** ▶ **Why it matters: the chat was the LAST screen
   with no route to the rest of the app** — from a conversation she could not reach Your Wishlist without
   backing out. That is precisely the worry that produced the Menu in the first place ("she will get stuck or
   won't see everything we have to offer"). ⚠️ **Deliberate test change, not a silence: `menu.js` moves
   `s-chat` from the hides-the-chip list into SHOW_ON**, with the measurement recorded in a comment. The chip
   now hides ONLY on the two loading screens.
   - ⚠️ **ONE THING ONLY HER PHONE CAN ANSWER, flagged to her: the chip is `position:fixed` and the chat is the
     only screen with a TEXT INPUT.** iOS keyboards can misbehave with fixed elements (top-anchored ones are
     usually fine; the classic failure is bottom-anchored). **If it jumps or floats while she types, the fix is
     to hide it only while the input is focused.** Watch for her report.
2. **ONE tilted pink heart trailing the "My Story" title** — same pink, same tilt as the `.menu-ch` heart on the
   Menu row that already marks that page as hers, and the same TRAILING placement as her "With love, Catherine"
   sign-off, so **the page now bookends**. ▶ **Deliberately ONE heart, NOT flanking, and the reasoning
   generalises: flanking marks read as a LABEL announcing authorship** (the Edit's "CURATED BY CATHERINE" earns
   them because the claim is about who chose the products) — **My Story needs no announcing.** ⚠️ **Scoped to
   `#s-story`: FAQ, Privacy and Terms share the same `.story-title` class** and are asserted to have no heart.
- Verified: new `scratchpad/chipheart.js`, **140 checks** (the chip really opens the drawer from inside the
  chat, all rows reachable, closing leaves her in the conversation, the three legal pages heart-free) + menu 87 ·
  nav 80 · hubs 46.

### ✅ THE LAST TWO OF THE DAY (2026-08-10, her fourth screenshot batch)
1. **"Some links may earn us a commission." was left of centre on Shop your style.** ▶ **The box was ALREADY
   centred** (`max-width:320px` + auto margins) — **the TEXT inside it was left-aligned**, so the words sat at
   the box's left edge. `text-align:center` on `.shop-disclosure`. ⚠️ **The test now measures the painted TEXT's
   centre against its container, never the box's** — a centred box full of off-centre words passed before.
2. **The wardrobe category headers (TOPS, BOTTOMS, …) now carry the MENU's group mark** — a short 2px `#D8A52E`
   bar hugging the word (her ask, pointing at the Menu screenshot), replacing a pale full-width rule.
   ⚠️ **`display:inline-block` is what makes the bar hug**; it is `.menu-grp`'s exact pattern. **The test asserts
   the bar matches the Menu's COMPUTED colour and height**, so restyling one can never silently diverge from the
   other. Applies to every category incl. "My Additions". Verified: new `scratchpad/catmark.js` 132 checks.

### ✅ THE WISHLIST EMPTY STATE, SECOND ROUND (2026-08-10, her four asks)
Gold SVG heart replacing the red emoji one in "tap ♥ Save" (**the third emoji-trap catch of the day** — that
glyph was on the list deliberately left alone that morning; her phone overruled it) · space above the open heart
16→10px, below 9→5px · the wishing link is now a real **boxed button, 12px → 13.5px, squared 1px `#D8A52E`,
with a leading +**.
- ▶ **COPY CALL, FLAGGED TO HER AND HERS TO OVERRULE: "Or" and the trailing arrow are gone**, so it reads
  **"+ Add anything you're wishing for"** — her own approved wording on the sibling `.wl-addbtn`. "+ Or add…"
  read awkwardly and an arrow is redundant beside a leading plus. She has not objected.
- ⚠️ **MEASURED: the label needs 231px.** Trimming `.wl-empty`'s own side padding 10→4px (empty-state only, so
  the item rows keep their 12px card padding) gives the button **260px at 390 — one line with 11px headroom**.
  **At 375 and below it falls to two balanced lines DELIBERATELY**: holding 375 would need 13px with ~5px of
  margin, and the tagline fix the same morning proved a margin that thin fails on real Safari. `scratchpad/
  btnfit.js` re-runs the sweep if the wording or padding ever changes. Verified: `scratchpad/emptystate.js` 88.
- ⚠️ **HARNESS TRAP: an element screenshot includes the CARD BACKGROUND behind the glyph**, so counting every
  opaque pixel as "ink" made a perfectly gold heart read **40% gold**. Only saturated pixels count (max−min ≥ 45).

### ✅ THE CURATED-BY HEARTS MADE SYMMETRIC (2026-08-10, her catch — and the measurements lied)
Her eye: the RIGHT heart sat farther from the words than the left, on both the Edit and Trending. **Both hearts
were in identical boxes with an identical flex gap, and every box/range rect reported the two gaps as EXACTLY
equal (10.13 / 10.13).**
- ▶ **CAUSE: `letter-spacing:.2em` puts its space after the LAST letter too**, so the right heart was pushed
  2.2px farther from the final letter. **Box rects are computed from ADVANCE widths and cannot see trailing
  tracking.** Rasterising the line settled it: **12.5px left vs 14.67px right** — her eye, to the pixel.
- **Fixed with `span{margin-right:-.2em}`** (cancels exactly the trailing space) + flex gap 10→7px so both sit
  nearer the words. **Now 9.67px both sides.** ⚠️ Don't remove the negative margin. `marks3.js` grew to 65 with
  a **rasterised** symmetry assertion — a box-based one would cheerfully confirm the broken version.

### 🚨 THE EMOJI TRAP: A BARE U+2665 RENDERS AS THE **RED EMOJI** ON iOS, IGNORING YOUR CSS COLOUR
Her screenshot of What's Trending showed **red ❤️ hearts** flanking "CURATED BY CATHERINE" — but the CSS said
`color:#F49AC1` (her signature pink) with tilts, and had for months. ▶ **Cause: they were `content:"\2665"`
pseudo-elements. iOS gives U+2665 emoji presentation, which paints its own colour and ignores `color:` entirely.**
The sandbox renders it as pink text, so **this class of bug is INVISIBLE here and only shows on her phone.**
- **Fixed on BOTH surfaces** — What's Trending (`.wdr-trend-by`) **and the Style Star Edit (`.dc-tagline`), which
  had the identical bug she hadn't screenshotted yet.** Both now use the inline SVG `.pinkheart` (`.hl` tilted left
  + default tilted right), which is what every other pink heart in the app already was. The pseudo-elements are gone.
- ⚠️ **STANDING RULE: never draw a brand mark with a text glyph.** Hearts and stars that carry meaning are inline
  SVG — `.pinkheart` for her signature, the `.chat-hdr-star` polygon for the stylist. A glyph is at the mercy of
  the platform's emoji font. ▶ **Still text glyphs elsewhere and deliberately left alone** (they are decorative
  inline punctuation inside sentences, and read correctly on her phone today): the `&hearts;` in the wishlist
  empty state's "♥ Save", the heart-tip `&#9825;` (U+2661 does NOT get emoji presentation), the footer stars.
  **If she ever reports one of those looking wrong, this is the reason and the SVG is the fix.**

### ✅ THE PINK HEART CAME OFF THE SHOPPING LOADER — HER REASONING SHARPENS THE MARK SYSTEM (2026-08-10)
Her call on the "♥ shopping your style…" / "♥ shopping your list…" loading titles: **"The virtual stylist is doing
this shopping, not me, so wanted to take these hearts off."** Replaced with **the pink STAR from Ask your Stylist**
(same polygon, same `#EC4899`, asserted identical in the tests) at 18px.
- ▶ **THIS REFINES THE 2026-08-09 GOLD MARK SYSTEM, record it: gold = HERS (star = wardrobe, heart = wishlist) ·
  PINK TILTED HEART = CATHERINE HERSELF SPEAKING or curating · PINK STAR (#EC4899) = THE STYLIST, the AI persona
  doing work on her behalf · teal = the Edit family's lettering.** Her signature belongs where SHE is present (My
  Story, the Edit, Curated by Catherine, her whispers) and NOT on machine output. Weigh future marks against this.
- ⚠️ **The starred title exists ONLY WHILE LOADING** — lines ~5344/5350 restore the plain "shop your style" when
  the picks land or the call fails. **A test must sample it synchronously**; see the harness lesson below.

### ✅ THE TAGLINE HOLDS ONE LINE + A TIGHTER MY STORY HEADER (2026-08-10, her two catches)
"Align your style. Shine your light." was wrapping with **"light." stranded** on its own line, and the gap down to
"My Story" was too airy.
- ▶ **MEASURED FIRST, and the margin was the whole story: the tagline needs 277px and `.hdr`'s 2rem side padding
  left exactly 280px at 390w.** A 3px margin is INSIDE normal browser text-measurement variance — which is why it
  fit in Chromium and wrapped in Safari on her actual phone, and why it wrapped outright on every phone under 390.
- **The padding was INVISIBLE:** the tagline is centered and narrower than its box, so that space never showed; it
  only decided where the line broke. Trimmed **2rem → 0.75rem**, which buys **43px of headroom** at 390 and holds
  one line at 375 and 360. ⚠️ **Font size and letter-spacing untouched** (the readability rule). At **320 it
  genuinely cannot fit** (277 needed, 250 available), so `text-wrap:balance` was added: two balanced lines breaking
  at the SENTENCE SEAM instead of stranding "light." — the `.hm-h1` widow lever, reused.
- **The gap was 24px from three stacked paddings** (`.hdr` bottom 8 + `.inner` top 8 + `.story-wrap` top 8) →
  **10px**, scoped to `.ss.story-mirror` / `#s-story` so the tuned Welcome Back spacing is untouched.
- ▶ **Useful scope finding: the shared `.hdr` is `display:none` on nearly every screen** (each has its own
  letterhead) — of the screens tested, **only My Story shows it**. Tiny blast radius.

### ✅ YOUR WISHLIST EMPTY STATE: SMALLER OPEN HEART, TIGHTER CARD (2026-08-10, her ask)
`.we-h` **40x40 → 30x30**, and the card's vertical rhythm trimmed (padding 22/18 → 16/14, heart margin 12 → 9,
h4 9 → 7, p 15 → 13, `.we-or` 12 → 10). About 30px tighter overall; headline, Shop my style and the wishing link
all unchanged.

### ⚠️ THREE HARNESS LESSONS FROM THIS SESSION (all cost a failing run, all reusable)
1. **`Range.getClientRects()` returns a rect per text box AND per element.** The tagline contains a `<span>`, so
   ONE visual line reported as **three rects** and the first suite "found" 3 lines. **Count UNIQUE rect tops.**
2. **Never assert against an element that may be `display:none` on that screen.** The same suite failed 29 checks
   asserting the shared header on welcome/FAQ/privacy/terms, where it is deliberately hidden. **Probe first, skip
   honestly, and log which screens were skipped** so the skip can't hide a real regression.
3. **A loading-state element must be sampled SYNCHRONOUSLY, in the same `evaluate()` that triggers it.** The
   sandbox's AI call fails in ~1s and the error path restores the resting title, so sampling after a `waitForTimeout`
   reads the RESTORED state and looks exactly like the change never applied. ⚠️ Also: **`openShopStyle()` shows the
   refine nudge first for an un-refined woman**, so it never reaches the loader — drive `_openShopStyleNow(mode)`.
4. ⚠️ **Two background runs writing the same output file interleave and produce nonsense totals.** One file per run.

## ▶ PREVIOUS — START HERE-EST-EST-EST (2026-08-09 — THE WISHLIST GOT ITS OWN DOOR, her Valentino question)

### ⏸ WHERE THE 2026-08-09 SESSION PAUSED (her call: "save everything and pause here")
Everything through **PR #797** is merged and CONFIRMED LIVE (curl-verified): the two-door wishlist add,
the gold mark system, the crown + velvet + riding rod, the story velvet with the **11px** turquoise
frame (her number — coincidentally the Shop mirror's exact frame weight, the two boutique frames now
match). Working tree clean, branch resynced to main. **Her to-do recap, given to her at pause:**
1. **Her eye/phone:** the rod-rides-scroll feel + the 11px story frame, live now.
2. **Her screenshots:** the search retests she mentioned at session start never arrived — ask.
3. **Her one-tap research:** Abercrombie results page → Shop By → Women's → paste the URL (the
   department param that replaces the misfiring "womens" keyword).
4. **Waiting on HER words (don't invent):** graduation-whisper line · most-asked stylist questions.
5. **Waiting on others:** Indie Law (Bailey fix + operating-agreement blanks) → TM signature email
   (REAL, not scam) → EIN → then her bank account → affiliate applications (networks first).
6. **Desk day (MailerLite):** "Email me my wishlist" · photo-tips email + wardrobe-page capture.
7. **Content anytime:** more Trending + Edit items (New pills light automatically).
8. **Next build sessions parked:** Bloomingdale's color-facet path form (pattern proven, Macy's
   likely rides along) · the registry/shareable-wishlist (FIRST when affiliate approval lands).
9. **The gate she owns:** tester invites once searches feel dialed in to her.
⚠️ Netlify note: today burned ~11 builds; she topped up $10 mid-day — watch the credits.

### ✅ THE WELCOME BACK MIRROR GOT ITS MARQUEE PILL + THE WHISPERS ARE 14px UPRIGHT (2026-08-09, her two catches)
Her screenshot pass on Welcome Back, two catches, both built + merged same session:
1. **The portrait CTA is the MARQUEE PILL now — her pick "A" from a 4-way render** (`scratchpad/
   wbctamock.js` → `wbcta-{current,a,b,c}.png`): the old square black-bordered cream box was the only
   hard-edged rectangle on a screen of bulbs and gold (her words: *"looks very boring, something is off"*).
   As built: black lacquer pill, gold letters `#F2D889`, gold rim `#C99A2C`, radius 999. ▶ **And the verb
   is HERS: "READ your full Style Portrait"** — her horoscope framing ("let me look at my 'horoscope'...
   get in the mood to shop"); one READS a horoscope. ⚠️ The string lives TWICE: markup default + the
   `updateWbScreen` safety-net rewrite (quiz-less fallback "Take our fun style quiz" unchanged).
2. **ALL THREE WHISPERS NOW MATCH: 14px/1.6 UPRIGHT** (her catch on #wbNext: *"really small and hard to
   read"* — the same 12.5px-italic-on-dark worst case the A2HS whisper already escaped on 08-08, her pick
   "upright 14"). Applied to `#wbNext` AND its sister `.rn-body` (portrait refine strip) — **splitting them
   would reintroduce the drift she herself caught on 08-05**; hearts 12.5px, ✕ 15px. ▶ **She asked for 2
   lines; the answer is MEASURED and honest: at 14px her refine sentence holds 557px of text, a 2-line wrap
   needs the box nearly edge-to-edge and still breaks to 3 on real word boundaries — and the five rotating
   step-sentences differ in length anyway. 3 balanced lines is the design.** Her one lever if a sentence
   ever bugs her: trim the words (hers to trim). ⚠️ Don't re-shrink, don't re-italicize.
- Verified: hubs 46 · menu 87 · e2e 29 · a2hs 38 green (no suite pinned the old text/size). As-built:
  `scratchpad/wbfinal-built.png`. ⚠️ Deploy note: the #782 (stacked label) Netlify build sat >10min
  without landing; the #783 push should carry both — if the live grep still fails, her Netlify dashboard
  (Deploys tab) is the instrument.

### ⚠️ NETLIFY LESSON (2026-08-09): OUT OF BUILD CREDITS = DEPLOYS SILENTLY STALL
Mid-session, three merged PRs sat un-deployed for ~an hour while the live site served stale code — no
error reached us, the merges were green, and the site stayed up (serving the last good deploy). **Root
cause, found by Cath in her dashboard: Netlify build credits were exhausted. She added $10 and the whole
queue flushed at once.** ▶ **The diagnostic split for any future "merged but not live":** (1) curl the
live site for a string from the new deploy — if missing after ~5min, (2) it is NEVER the code; send Cath
to app.netlify.com → site → **Deploys** — a red Failed needs its log pasted; NOTHING NEW since the last
merge means credits/minutes are out (this case). ⚠️ **Every merge burns build minutes** — a
many-small-PRs day like this one (7 merges) costs 7 builds. Not a reason to batch work, just the reason
the meter ran out today of all days.

### ✅ MY STORY GOT HER VELVET TOO + THE ROD IS ZOOM-PROOF (2026-08-09, evening, her design — FIXED TWICE, final form below)
⚠️ **The first ship of both items FAILED ON HER PHONE and the fixes carry the day's two biggest lessons:**
1. **My Story velvet, FINAL FORM (her words: "Simple"):** signature pink `#F49AC1` bleeds to every
   screen edge (`html.story-velvet`, toggled in show() beside wl-velvet) and the turquoise frame is the
   STORY CARD ITSELF — `.ss.story-mirror` simplified to one plain `4px solid #0FA6B6` border, white
   paper, drop shadow only. The `.st-frame` div is DELETED. ▶ **Why: the first build was a FIXED
   viewport frame, and on her phone it sat ON TOP of the scrolling words + left a white sliver.** A
   frame that must never block text has to SCROLL WITH the text — put it on the paper, not the glass.
   ⚠️ **Her "white line" was pre-existing:** `.ss.story-mirror` already carried white+pink INSET RINGS
   (`inset 0 0 0 5px #fff, inset 0 0 0 10px #F49AC1`) from an old design — those rings were the line
   she disliked; they are gone. Don't reintroduce layered edges here. Also her earlier catch stands:
   **no shadow/highlight lines on teal against pink — they read GRAY** (small-dark-color trap).
   Blush `#F4C7D6` was offered; she picked "the darker pink" (her signature).
   - 🚨 **THE SHELL LESSON (cost one broken build, caught by suites before shipping): `.ss` is the
     APP SHELL, not a decoration.** An attempted `html.story-velvet .ss{display:none}` blanked the
     ENTIRE app (Menu chip + footer live inside it) — nav 79/80 + menu 86/87 failed instantly.
     **Never hide or replace `.ss`; restyle it per-page via the `.ss.<page>-mirror` skins.**
2. **The wishlist rod, FINAL FORM: `position:fixed;top:32px;left:0;right:0` + `_wlRodScroll`** —
   fixed to the viewport for its WIDTH (edge-to-edge on ANY device and ANY zoom), and a passive scroll
   listener translates it by `-scrollY` so it RIDES the page. ▶ **Two prior width attempts failed on
   her phone:** 100vw (shrinks under iOS page zoom) and a ±100px overhang clipped by
   `overflow-x:hidden` (also inset on her device). **Lesson (5th time today): the only edge-to-edge
   that survives iOS page zoom is viewport-fixed.** ▶ **And her immediate catch on the fixed rod: it
   didn't move on scroll — "the heart is supposed to be hanging on it so they need to slide
   together."** Hence the translate: fixed solves width, JS solves motion; raw scrollY (no clamp) so
   iOS rubber-banding keeps rod and chain glued too. ⚠️ Don't "simplify" back to pure CSS — every pure
   CSS position fails one of her two requirements. wladd asserts the ride (moved-by-exactly-scrollY,
   chain-still-meets mid-scroll, restored at top, WITH a reallyScrolled guard — an unscrollable page
   passes the delta check vacuously, caught in the proof harness). The `overflow-x:hidden` on
   wl-velvet is removed; wladd's overflow census still exempts `.wl-rod`. Proofs:
   `scratchpad/storyfix-{top,mid}.png` (frame scrolls with words, no white line), `rodfix-top.png`
   (insets 0/0). Verified: wladd 102 · nav 80 · menu 87 · e2e 29 green.
   - **My Story border thickened 4px → 6px → 8px → 11px** (her asks, three rounds; 11px was her own
     number and matches the Shop mirror's 11px black window frame — the two boutique frames now share
     one weight).
3. Same evening micro-rounds, all hers: lead box restored to the full warm sentence with "item"
   wording, centered, tucked -10px under the heart; Back top:6px; **the wishing button is SQUARED and
   says "+ Add anything you're wishing for"** (both surfaces; tracking .04em/padding 8 hold one line at
   360 — "anything" makes the from-any-store promise in one word).

### ✅✅ THE CROWN'S POLISH ROUND + HER VELVET FRAME (2026-08-09, her live catches, merged same day)
Her phone pass on the live crown produced a second round, all built + shipped:
1. **Chain 88 → 66px, heart 6px under the rail** (her "hanging too low" catch, twice — the constants
   moved twice, wladd caught the detached chain both times).
2. **Back button ABSOLUTE top-right INSIDE the paper** (`top:14px;right:-14px`). ⚠️ The first fix used
   right:-38 and pushed it into the black band ON HER PHONE — the sandbox-vs-device inset trap AGAIN
   (third time today: cream stitch, corner hearts, this). **Rule: anything near the page edge must be
   positioned relative to the PAPER (.ss) or flagged as device-verify.**
3. **`.wl-card` squared** (radius 0, her consistency call) · **wa-hint upright** · **link placeholder =
   "Copy & paste link (optional)"** (her wording, measured: fits 390/360; ≤374px padding 9→4 covers 320).
4. **The cream outer stitch DELETED** ("cannot really see it anyway") — and the corner-hearts frame idea
   died to the MENU chip covering the left corner.
5. ✅ **HER FRAME: "E with full-bleed black" — "Yes I love it, build it and ship it all."** As built:
   `html.wl-velvet` (toggled in show() beside the wishlist-mirror toggle) paints html+body `#1a1a1a` so
   the black bleeds to EVERY screen edge; `.ss.wishlist-mirror::before` is now the GOLD RAIL BAND (5px
   `#CFA02E`, inner highlight `#F7E4A6`, deep outer line) framing the paper — a gilt-framed board on
   black velvet. Mast nudged left:-17→-8 to breathe off the band. wladd 96 (velvet + band asserted).
- ▶ Framing renders kept: `frame-{a-clean,b-double,c-hearts,d-lip,e-rail,e3-bleed}.png` — D (gilded lip)
  was the offered runner-up if the velvet ever feels heavy.

### ✅✅ THE WISHLIST CROWN IS BUILT — ROD, CHAIN, HANGING HEART, her design through 7 render rounds (2026-08-09, merged #789)
Grew out of her "change the 5 crown hearts" note into a full header redesign, every step her call from renders:
**one large STRAIGHT pale-gold heart (196px) hanging from the Analyze page's gold rod by a CHAIN of real
gold ellipse links, "Your / Wishlist" STACKED inside it** (her idea — stacking lets the heart fully hold
the words), a darker-gold hairline around the pale frame (her ask), the exact ph-mast letterhead top-left
(slider dot included, goes home — nav.js now asserts `.wl-mast.go-home` for s-wishlist), **"2 pieces
saved" DELETED** (her call), and **the stitches OUTSIDE the black frame** — cream dashes on the black band
(`.wl-stitch`, fixed viewport-inset seam; `.ss.wishlist-mirror::before` is display:none now).
- ⚠️ **GEOMETRY IS PINNED BY TESTS, don't tune blind:** wladd.js asserts chain-meets-rod ≤3px, chain
  dead-center ≤0.6px, ring ENCIRCLES the rail, rod full-bleed, title inside heart, mast clear of the MENU
  chip. The chain/ring offsets are hand-tuned constants (`.wl-chain` height 88px, ring bottom +26px) tied
  to the crown's margin — **any spacing change re-runs wladd or the chain detaches invisibly** (happened
  twice this session; the tests caught it both times).
- **The interlock trick:** `.wl-ring` (full circle, z5, BEHIND the rod) + `.wl-ringf` (same geometry,
  clip-path bottom half, z7 in FRONT) = curtain-ring around the rail. The rod escapes its inset screen
  via `left:50%;width:100vw;translateX(-50%)`. Crown is 196px (EVEN) deliberately — 195 put every centered
  child on a half-pixel and she SAW it ("slightly left of the groove").
- **Chain lesson:** the heart path's dip sits 58px below its box top — a "string to the box edge" floats
  in air. The chain runs to `calc(100% - 60px)` INTO the cleft; its pattern is 2 alternating ellipse links
  per 16px (`#wlChainPat` — unique id per the Safari hidden-defs rule).
- Also in the merge: **all 7 disclosures upright** (her ask on one, applied everywhere: wl/wdr/chat/shop/
  dc ×2 — the italic is gone).
- wladd 92 · nav 80 · hubs 46 · e2e 29 · menu 87 · searchtune 57 green. As-built: `scratchpad/
  stitchout2.png` (+ the whole crown render series `crownin-*`, `crownstack-*`, `chainzoom`, `ringlock-*`).
- ▶ **She shipped it to SEE IT LIVE on her phone — expect polish notes next session** (the outer cream
  stitch especially: it reads best full-bleed on a real phone; the sandbox render underestimates it).

### ✅✅ THE GOLD MARK SYSTEM IS BUILT — HER untangle, shipped across every surface (2026-08-09)
Born from her catch: hearts are the UNIVERSAL wishlist symbol on shopping apps, but pink hearts were also
her voice — "I don't want that to get tangled." **THE CODE, hers, protect it: GOLD = HERS (gold star =
wardrobe category · gold heart = wishlist piece — one color for mine, two shapes for which list) · PINK
tilted heart = ONLY Catherine's voice · teal = the Edit family's lettering, an accent not a mark.**
- **SAVED is the MARQUEE pill — her pick "B" from a 3-way render** (`goldpop-{a,b,c}.png`; A gradient
  gold "still a polite whisper", C glow "vanishes at phone size"): gold heart + gold text on black
  lacquer, the app's own black-and-gold action language — saving a piece puts it up in lights. Her
  reasoning: flat gold-on-gold "doesn't stand out at all... I liked the pop of pink" — the black pill
  pops HARDER than pink did. ⚠️ Don't re-quieten; don't reintroduce pink save hearts.
- **As shipped:** `_wlHeartSvg` on=gold fill `#F2D889`/stroke `#C99A2C`, off=gold outline `#C8971E` ·
  `.wl-save.on` = black `#1a1a1a` + gold rim (base rule; the s-dream pink override deleted, the
  res-screen transparent exception deleted — rows get the pill too, padding 4/7) · toast heart, empty
  heart, "♥ Save" span, heart-tip ♡ all → gold family · **"Your pick"** gold heart `#E0B84C` ·
  **"Catherine's pick"** = HER SPEC: pink frame + pink heart tilted LEFT (-11°) + TURQUOISE lettering
  kept · Edit + Trending "CURATED BY CATHERINE" flanking ★ → tilted pink ♥ (her signature guards her
  curation; teal lettering stays). Wardrobe gold stars untouched; whisper/menu/signature hearts pink.
- ⚠️ **Two deliberate test updates, not silences:** searchtune's tip-heart assertion pink→gold rgb(200,
  151,30). Verified: searchtune 57 · wladd 76 · hubs 46 · e2e 29 · followups 38 green. As-built:
  `goldbuilt-{wishlist,rows,edit}.png`.
- ▶ **CROWN HEARTS PENDING HER PICK:** the 5 pink hearts atop Your Wishlist deliberately untouched —
  she wants **ONE very large pale heart** ("similar to the large pale yellow/gold star on Welcome
  Back"); render options next (inline vs backdrop-behind-title).

### ✅ CATHERINE'S SIGNATURE HEART ON THE THREE "HER" MENU ROWS (2026-08-09, her idea, shipped as rendered)
Her idea while thinking of Sally's keep-emphasizing-you-built-this note: a tiny tilted pink heart on the
Menu rows that are HER curation — **Style Star Edit · What's Trending · My Story**. She asked "or is that
too cutesy?"; the render said no (11px, tilted 11°, `#F49AC1`, 3 of 18 rows — a maker's mark, not a
sticker) and **she confirmed: "I love it exactly as you did it here."** `.menu-ch` in the static drawer
markup. ⚠️ Deliberately distinct from the outline SAVE hearts on cards (solid + tilted + decorative); only
those three rows — don't spread it. menux 28 · menu 87 · nav 80 green.
- ▶ **HER FRIEND SURVEY, same conversation (real market data, remember it):** everyone she asked uses the
  AMAZON app (ease, saved payment info); some Nordstrom (free returns). Told to her: **Amazon is the
  best-behaved store on app-capture attribution** (their app reads their own Associates tag — unlike the
  lululemon class), 24h window still applies, re-verify at application time. Strengthens eventual-Amazon
  once traffic is real; sequencing unchanged (networks first).
- ▶ **HER NEXT TWO LOOKS, queued by her:** (1) the decorative tilted hearts at the top of Your Wishlist
  (`.wl-hearts`) — "I think we need to change those," screenshot coming; (2) **a consistency audit of the
  pill iconography** — "Your pick" (gold border, pink heart) vs "Catherine's pick" (pink border, teal
  star) — "make sure we are being consistent all over." The mark system to audit against: gold star =
  wardrobe/My List · pink heart = wishlist + her signature · teal = Edit family.

### ✅ THE MARQUEE PILL GOT ITS BREATHING ROOM — her adjustment, shipped (2026-08-09)
Her critical-eye pass on the live Welcome Back: the top section felt cramped but she wants the page DENSE
("I don't want her to miss a thing" — see-everything is a stated value on this screen; weigh future air
against it). ▶ **Measured cause: the new lacquer pill sat 6px under the quote vs 19px below — the old
cream box was too quiet to crowd anything; the imbalance ARRIVED with the pill.** Offered a 2-part air
package (+12px above the pill, +8px dark gutter); **her adjustment, and it was the better call: air
INSIDE the card only, the dark gutter before the SHOP awning stays TIGHT** (the marquee and awning read
as one storefront). As shipped: `.wb-port-cta` margin-top 3 → 12px, total fold cost 12px. Renders:
`scratchpad/wbair-{before,after,hers}.png`. hubs 46 · e2e 29 green.

### ✅ THE MENU'S GROUP LABELS ARE PROMOTED — her pick "C" + the padding trim (2026-08-09)
Her two catches on a live drawer screenshot: STYLE/SHOP/BUILD/ABOUT *"too hard to read, too small, don't
stand out"* (measured: 10.5px `#8a8474` ≈ 3.5:1 on the ivory — the ONLY sub-AA text in the drawer) and
"Refine your Preferences" wrapping to 2 lines on her phone. **Rendered 4 ways** (`scratchpad/
menufontmock.js` → `menufont-{current,a,b,c}.png`): A = her font-swap idea (serif groups, Jost items) ·
B = literal block-letter items (**killed by measurement: REFINE YOUR PREFERENCES needs 195px of 176 and
wraps**) · C = items KEEP their serif, labels promoted only. **She picked C + the padding trim.**
- **As shipped:** `.menu-grp` 10.5px→12px, 600 weight, `#8a8474`→`#4a463e` (**3.5:1 → 8.99:1**), margins
  16/3→18/5; `.menu-panel` side padding 22→18px (content box 176→184px). ⚠️ Don't re-quieten the labels.
- ▶ **THE REFINE-WRAP MYSTERY, solved by measurement:** the row needs 164px and fits 176 in a standard
  browser — **it wraps on HER phone because of iOS text zoom** (Page Zoom / Dynamic Type, common in the
  18-80 audience). The trim buys ~8px headroom; the one-line floor drops 213→205px, drawer width
  unchanged at min(220px,70vw). ⚠️ menumeasure.js's 213px floor note is superseded by this.
- ✅ **AND THE GOLD BAR LANDED the same session — her pick "A" from a 3-way render** (`scratchpad/
  menugrpmock.js` → `menugrp-{a,b,c}.png`): a short 2px `#D8A52E` bar under each group name — the Your
  Wishlist title's own mark, echoing the wordmark's underline in the drawer header. B (trailing fade
  hairline) offered; C (full-width rule) argued down as a double rule against the row hairlines.
  `.menu-grp` is inline-block so the bar hugs the word. menux 28 · menu 87 · nav 80 green again.
- Verified: menux 28 · menu 87 · nav 80 green (the ✕-corner geometry survived the trim untouched).
  As-built: `scratchpad/menufont-built.png`.

### ✅ "ADD YOUR OWN PIECE" IS BUILT — THE TWO-DOOR WISHLIST ADD (2026-08-09, her ask + her explicit call)
**Her product catch, and it was a real gap:** *"If she is shopping the mall or just in her head she knows
exactly what she wants... how can she put it onto her wishlist if it is an item Style Star did not lead her
to?"* Until now the ONLY way onto Your Wishlist was a heart on a card the app rendered. Then her sharpening
question — the Valentino scenario: a black studded shoulder bag, exact, to send to her husband to buy —
"is it going to search, or take him to the exact link every time?" ▶ **Her call, verbatim-ish: "Yes I love
the two-door version, let's build it. Very important that she can put in something exact."**
- **THE TWO DOORS, both live on Your Wishlist (`#wlAdd`, under the list card, above the email ask):**
  1. **Words only** → store + name saved, link REBUILT every render exactly like an AI suggestion
     ("Find it") — a store-URL fix silently repairs it. Known store resolves to its canonical name
     ("sam edelman" → Sam Edelman); an unknown store keeps her word for it AND folds it into the search
     term so the Google Shopping fallback still knows the brand ("Hermes silk scarf"). No store at all →
     Google Shopping on the piece alone, and no empty store line renders.
  2. **A pasted product link** → the exact URL stored, **"Your pick" badge** (gold border, pink heart —
     deliberately NOT the teal "Catherine's pick"), button says **"Shop it"** and lands on THE piece every
     time. ▶ **This is the SECOND deliberate exception to the never-store-URL rule** (Edit picks were the
     first, same reasoning: an exact product page cannot be rebuilt from words). Honest trade, told to her:
     an exact link can die when the piece sells out; a search never was exact. For a registry that is the
     right trade.
- **Paste forgiveness + hygiene:** a scheme-less paste ("valentino.com/...") gets https:// prepended;
  `javascript:` and anything else non-http(s) is refused at entry with a kind message AND stripped on load
  by `_normalizeWardrobe` (`own:true` entries keep `url` only through `_wlSafeUrl`; a poisoned row falls
  back to the honest rebuilt search, never an unlinked row). ⚠️ **Tracker stripping is deliberately
  CONSERVATIVE** (`_wlCleanUrl`: utm_*, fbclid, gclid, srsltid, mc_cid, mc_eid only) — **Bloomingdale's
  `?ID=` is load-bearing and params like it MUST survive**, so nothing off that list is touched.
- **Store named from the link** when she leaves the store box empty (`_wlStoreFromUrl`): exact hostname
  match against STORES wins (each Gap-family store lives on its own subdomain so families resolve right),
  then registrable-base, then the honest bare hostname ("valentino.com" — her list, her labels).
- **Mechanics:** entries carry `own:true` (+`url` only when exact); id via `_wlMakeId` so dupes are
  refused gently ("That piece is already on your list ♡"); own adds count toward the heart-tip retirement;
  toast fires with View hidden on-list; the form never greets her already open (`openWishlist` resets);
  "Never mind" cancels; empty state gained **"Or add a piece of your own →"** under Shop-my-style (no
  collapsed button doubles it there). Everything rides `wardrobeData.wishlist` → localStorage + Supabase.
- ✅ **THE WORDING IS SETTLED AND IT IS HERS (same session, her catch + her pick):** the first draft said
  "Add your own piece" and **she caught the flaw — "sounds like something out of her closet that she
  already has,"** i.e. OWNERSHIP, which is Wardrobe List territory, when the meaning is authorship. Four
  directions were offered; **she picked the "wishing" family — the one verb that cannot be misread as her
  closet, and it rhymes with the page's own name.** As shipped (revised same day, her picks): button + empty-state link **"+ Add anything
  you're wishing for"** (SQUARED gold-outline button now, matching the squared cards + velvet frame; tracking
  .04em/padding 8 so it holds one line at 360) · form title **"Wishing for something?"** · sub **"Spotted something perfect, or
  know exactly what you want? Add it here, from any store."** ▶ **Her trim on the sub is a standing-rule
  move:** the draft ended "...even ones we don't carry" and she cut it at "from any store" — the 2026-07-31
  never-surface-the-store-boundary stance, applied by her own ear. ⚠️ Still Claude drafts (she hasn't
  flagged them): the with-a-link hint, "Add to my wishlist", "Never mind", "Your pick", the three messages.
- ⚠️ **BUTTON WIDTH IS MEASURED, not guessed:** her wording needs ~257px at the tightened 12px padding +
  .05em tracking (was 18px/.07em, which wrapped at 360) — **one line at 390 AND 360; at 320 it wraps to two
  balanced lines, deliberately** (the A2HS trade: never shrink the font on the readability audience). The
  `.wab-t` span is block-level because text-wrap:balance only works on block-level text. ▶ If 320 ever
  matters: "+ Wishing for something?" as the button label fits every width — offered, not taken.
- ▶ **AWAITING HER PICK — entry-point placement, renders made** (`scratchpad/wladdshot.js` →
  `wladd-{a,b,c,form,empty}.png`, re-rendered in her wording): **A (as built)** gold-outline pill under the
  list card · **B** ghost row inside the card bottom · **C** quiet link up top under the lead. She said
  "I love how you built this" but has not named a letter — A stands unless she says otherwise.
- ✅ **HER LIVE CATCH, fixed same session: the name field's placeholder was CUT OFF** ("The piece, e.g.
  black studded shoulder bag" needed 287px; the box's inner width is 230px at 390 — it was cut on EVERY
  phone). Now "The item, e.g. tan sandals" (her rewording of the fix: "mules" is fashion-people vocabulary, and "item" over "piece") + the link field shortened to "Exact link (optional)" (its
  "paste it here" tail was quietly cut at 360 too) + a narrow-width padding trim (≤374px: 16→10px) so
  both fit whole even at 320. ⚠️ wladd.js Part 3 now MEASURES every placeholder against its input's
  real inner width at 390/360/320 — a future placeholder cannot quietly overflow.
- **Her live test also proved the Bloomingdale's case:** her real Valentino-bag paste landed as "Your
  pick" FROM BLOOMINGDALES — the load-bearing `?ID=` param survived the conservative tracker strip.
- **Verified: new `scratchpad/wladd.js`, 64 checks** (the whole lifecycle: empty-state door, both add
  doors, canonical store naming, tracker strip vs load-bearing params, Saks named from URL, scheme
  forgiveness, javascript: refused + stripped-on-load fallback, dedupe, cancel, heart-tip stamp, email ask,
  disclosure, reload persistence through normalization, remove-all back to empty state, AA contrast on
  every new text incl. the 8.5px badge, no overflow 390/360, zero JS errors) + full 15-suite sweep green.
- ✅ **THE SAVE HEART ON COMPLETE-THE-LOOK IS LABELLED NOW — STACKED, her pick from a 3-way render
  (2026-08-09, same session):** her catch on a live screenshot: *"I don't think she will intuitively know
  that's what this heart does."* The heart-tip already teaches this (and had retired for HER — proof it
  works), but these rows were the ONE place the save control was a bare glyph (`.wl-save-t` was
  display:none for width). Rendered 3 ways (`scratchpad/heartlabelmock.js` → `heartlabel-{current,inline,
  stacked}.png`): ⚠️ **inline "♡ SAVE" fits but STEALS name width — item names crumple to four lines.**
  Stacked (8.5px caption UNDER the heart) labels the control at ZERO width cost — names wrap identically
  to bare. She picked stacked. Caption flips Save→Saved on tap (already built into `_wlSaveBtn`). ⚠️ Don't
  "tidy" it back to inline. wladd.js 64 → 76 (label visible/stacked/AA/no overflow/flips to Saved, both
  widths). ▶ Render lesson: photo-res boards are opacity:0 until the screen carries BOTH `act` AND
  `rv-open` — element shots without rv-open are black nothing.
- ▶ **WHY THIS MATTERS BEYOND ITSELF:** it is the foundation stone of her REGISTRY idea (share Your
  Wishlist like a bridal registry) — a registry only works if it can hold everything she wants, not just
  what our cards suggested. The two row kinds ARE the registry grammar: "buy exactly this" + "anything
  like this".
- ▶ **STILL PENDING FROM THIS CONVERSATION: her screenshots** — she said "I have some screenshots to
  share" (search retests, most likely) and they had not arrived yet when this was written. Ask for them.

## ▶ PREVIOUS — START HERE-EST-EST (2026-08-08, night — HER SIX SCREENSHOTS TUNED THE WHOLE SHOP SEARCH)

### ✅ THE SEARCH-TUNING PACKAGE IS BUILT FROM HER LIVE TESTING (2026-08-08, "yes let's do all 5")
Cath ran real Shop-your-style taps on her phone and sent six screenshots; each got a diagnosis and
together they produced FIVE fixes, all shipped. ▶ **Her concern, verbatim-ish: the searches "are not
turning up anything close to what I was hoping for... especially in comparison to what ChatGPT was able
to search up." The structural gap (search page vs exact product) stays until feeds — everything else was
fixable now and is fixed.**
- **Her six examples → the diagnoses:** (1) "Raspberry Belted Midi Wrap Dress" @ Anthropologie → 1 fuzzy
  blue dress (poetic color + stacked qualifiers = zero matches; stores show junk instead of "no results") ·
  (2) "Nude Patent Pointed-Toe Kitten Heel Mule" @ Sam Edelman → kitten-heel SANDALS (loose ranking; and
  the store's own banner was advertising its bestseller MULE — right store, drowned term) · (3) "Hot Pink
  Fitted Scoop-Neck Cotton Crop Top" @ Abercrombie → pale pink tanks ("hot pink" isn't a retail word) ·
  (4) "charcoal high rise slim trousers" @ Banana Republic → first result nearly EXACT but a men's suit
  pant at slot 2 (department bleed) · (5) lululemon royal blue legging → landed great BUT her installed
  lululemon app captured the tap ("kicked off" — iOS handoff, not ours to fix; the way back is the ◀
  breadcrumb or the Style Star icon, which now remembers her) · (6) "tan top handle bag" @ Bloomingdales →
  3,292 items, brown + ivory on top (big catalogs rank by popularity, color is a suggestion).
- **THE FIVE FIXES, all live:**
  1. **Retail-plain search words** (prompt, all surfaces): the color word from a store's own filter menu
     ("pink" never "raspberry"/"hot pink"; "tan" never "cognac"), 2-4 words, color + garment + at most ONE
     defining word. The TOO LONG example is her real mule case.
  2. **Honest card names**: name the KIND of piece ("Tan Kitten-Heel Mules"), never an imaginary exact
     product — ▶ **the name is a PROMISE about what the link shows; a name more detailed than the search
     lands her on less than promised, and THAT gap is what feels broken.** Every detail in the name must
     also be in the search. Replaced every "Be very specific in name" line (5 surfaces).
  3. **Women's-department scoping in `getStoreUrl`**: 42 multi-gender stores carry `w:1` → "womens "
     prepended to the term; 5 carry a VERIFIED `gp` param (**Amazon `&i=fashion-womens`, Gap family ×4
     `&department=136`** — both curl-verified serving women's results). Madewell/Mango/Revolve/Lacoste were
     already URL-scoped; women-only stores untouched. ⚠️ **DSW deliberately unflagged** (path-style
     /browse/ search might read "womens" as a category — one for her address bar). Because wishlist items
     store terms and rebuild URLs on render, **every already-saved item got the fix silently**.
  4. **URL filter research**: done for gender (above). ✅ **AND THE COLOR-FACET RESEARCH HAPPENED THE
     SAME NIGHT — her address bar, two stores, both confirmed with stripped/generalized re-pastes:**
     - **NORDSTROM IS SHIPPED (2026-08-09):** `&filterByColor=<color>` rides the existing `?keyword=`
       form (her verified paste: `sr?keyword=midi%20dress&filterByColor=pink`). Built with a safety
       catch: the filter is added ONLY when the search's first word is in `_CF_COLORS` (10 universal
       retail colors; "pink" human-verified, the rest are the basics every facet carries) — an unknown
       shade stays a plain search, so the facet can never empty a results page. Nordstrom-only until
       other stores are verified. Her personal params (postalCode/preferredStore/origin) stripped per
       the standing rule.
     - **BLOOMINGDALE'S PATTERN CONFIRMED, BUILD PARKED for a fresh session (it needs care):** filters
       live in a PATH on the /shop/featured/ form — she proved it generalizes:
       `bloomingdales.com/shop/featured/<hyphenated-term>/Color_normal/<Color>?ss=true` (e.g.
       `black-midi-dress/Color_normal/Black`, and note their color VOCABULARY is their own: tan is
       "Tan/Beige"). Macy's is the same platform — the same dance there would likely cover both.
       ⚠️ DSW also resolved by her paste: `/browse/womens%20red%20sandals` works → DSW carries `w:1`
       now (43 keyword-scoped stores; searchtune.js is 44 checks).
  5. **Precision-to-store weighting** (prompt): exact-color exact-shape pieces (esp. bags/shoes) go to
     focused stores whose search can honor them; department stores are for category browsing. ▶ Matches
     her own July stylist rule (department stores for wardrobe building, boutiques for the piece).
- **Verified: new `scratchpad/searchtune.js`, 32 checks** (every scoping class incl. saved-wishlist repair,
  all prompt rules present, 101 stores / 42 w / 5 gp, zero JS errors) + full 15-suite sweep green.
  **LIVE model check** (captured the real tuned genOutfits prompt from the page, posted to the live
  function): all 6 items came back 3-4 plain retail words, names matching searches — and the model sent a
  pink structured bag to Kate Spade over a department store, the tan-bag lesson applied on its own.
- ▶ **NEXT: Cath re-tests her six searches live.** Then judge: does "tap → a genuinely right results page"
  feel smooth? The exact-product experience is feeds territory (money-path step 7), said honestly and often.
- ⚠️ **HER FIRST RETEST (2026-08-09) FOUND TWO SCOPING EXCEPTIONS, both fixed same day (#775):**
  (1) **Abercrombie: the "womens" keyword FLIPPED their search to the MEN'S department** (her screenshot
  showed "Shop By: Men's" active — their parser apparently matches "mens" inside "womens"). Abercrombie
  is UNSCOPED now; ▶ the proper fix is a department param — ask her to tap "Shop By" → Women's on an
  A&F results page and paste the URL. (2) **Quay showed nothing** (niche 5-word eyewear search + the
  keyword = zero at a Shopify-style AND search), so **all three eyewear stores (Quay, Sunglass Hut,
  Warby Parker) are unscoped as a class** — gender bleed at a sunglasses brand is low-stakes, an empty
  page is not. **Bonus: Quay MOVED DOMAINS → quay.com** (quayaustralia.com only redirects now; store URL
  + SEARCH_DOMAINS updated per the standing rule — the Boden redirect-rot lesson). 39 keyword-scoped +
  5 param-scoped; searchtune.js is 48 checks. ▶ **Lesson for future scoping: the keyword is per-store
  EVIDENCE, not a blanket** — watch her testing for any other store that misparses it.
- ✅ Same evening, on the photo-results page: the "Your Style" pearl panel got her three catches — hub
  rows (pick "B", #772), computed equal pearls (#773), and the header in the hub voice (#774).
- ✅ **THE "HEART IT FIRST" TIP IS BUILT (2026-08-09, her wording, her pick A):** born from her app-handoff
  finds (lululemon + Nordstrom Rack apps captured taps and dropped her back at their home screens — iOS
  universal links, not fixable by us; the defense is saving BEFORE tapping out). One quiet Catherine's-whisper
  line on the two card surfaces (Shop your Style before `#shopStyleContent` + Complete the Look above
  `#pShopList`): **"Tip: heart it first ♡, then explore. Your saves will be waiting in Your Wishlist."**
  ⚠️ Her original had an em-dash ("first ♡ — then explore"); converted to a comma per the house no-dash rule
  and FLAGGED to her — restore the dash if she asks. Mechanics: `_syncHeartTip()` (called from `show()` and
  `wishToggle()`), `data-hearttip` divs, whisper voice (`.ht-tip`, italic ink + gold bolds + pink outline
  heart ♡ U+2661 — the wishlist's own mark, not the decorative solid ♥). **Retires permanently at her 2nd
  wishlist save** (`ss_hearttip` stamp — the lesson is learned even if she later empties the list; the
  never-nag family). ▶ Rendered 3 ways first (`hearttipmock.js` → `hearttip-{a,b,c}.png`); she picked the
  whisper + wrote the wording. Verified: searchtune.js 48 → 57 (both surfaces, exact wording, voice colors,
  no dashes, retires at 2, stamp permanent, never re-teaches) + hubs 46 · e2e 29 · copy 41 · followups 38 ·
  menu 87 green. As-built: `scratchpad/hearttip-built.png`.
- ▶ Parked from this conversation: the store-app handoff behavior watch (Nordstrom/Target/Amazon apps are
  pushy too — the heart-tip is the mitigation, watch her testing for how often handoffs actually bite).

### ✅ "PULL MORE IN THIS STYLE" NOW MIRRORS THE LOOK (2026-08-08, night — her seventh screenshot)
Her catch on the photo-results next-step button: it returned the SAME accessorize-this-outfit pieces as
the Complete-the-Look section above it, when what she wants is **"more clothes that look like this — 6
more midi length floral dresses."** ▶ **Her stylist principle, protect it: clients build UNIFORM looks —
people imitate what they already own and have photos of.** Mirrors, not add-ons.
- **Root cause read from the code:** look-mode `_shopStyleGen` fed the analysis's *finishing touches*
  into the generic mix-categories prompt — the model was literally handed the add-on list and told to
  vary categories. And the analysis never told shopping WHAT SHE WAS WEARING, only what was working.
- **Built:** the photo analysis now returns a 4th field **`wearing`** (2-4 plain phrases: "navy floral
  midi dress", "cream cropped button jacket") stored on `_lookCtx`; look mode gets its own MIRROR prompt
  — every piece the same KIND of garment as something she has on, ≥3 of 6 echoing the biggest piece,
  colors varied within her palette ("sisters of her look, not six copies"), **NO bags/jewelry/belts**
  (completing the look is the other button's job; the tips are deliberately NOT fed in anymore). The
  chat's look context also gains the wearing line, so "what shoes with this?" knows the dress.
- **Copy (⚠️ both are Claude drafts, she may reword):** button sub → "I'll find more pieces like the
  ones you're wearing"; look-mode page sub → "More pieces like the look you shared."
- **Verified:** searchtune.js grew 32 → 40 (wearing in prompt, mirror rules, tips NOT fed in, copy,
  schema) + hubs/cowork3/followups/e2e/copy green. **LIVE model test with a floral-midi + cream-jacket
  look: 4 floral midi dresses, 1 ivory cropped jacket, 1 blush pointed flats, zero accessories.**
- ▶ Old analyses have no `wearing` (memory-only context, so only mid-session edge): basis falls back to
  the celebrate line and the mirror rules still apply.

## ▶ PREVIOUS — START HERE-EST (2026-08-08, later same day — HER INSTALL TEST FOUND THE BIG ONE)

### 🚨 ✅ THE HOME-SCREEN APP COULDN'T REMEMBER ANYONE — THE 6-DIGIT RESTORE CODE IS BUILT (2026-08-08)
**Her live test, and it is the most important find since the restore bug:** she installed via the A2HS
whisper, opened the app icon — **quiz results, name, email all gone.** Then she requested a restore email
from inside the app and the gold button "worked" but the app still didn't know her.
- ▶ **ROOT CAUSE IS APPLE, NOT US, and it will hit EVERY iPhone user who installs:** a home-screen web app
  gets its OWN storage container, completely separate from Safari's. Her results live in Safari's
  localStorage; the installed app starts empty. **And an email link can only ever open in Safari — iOS
  gives no way to route a link into an installed web app** — so the restore email restores Safari (which
  already had her), never the app. Android is UNAFFECTED (installed app shares Chrome's storage).
- ✅ **THE FIX, her call after plain-terms options ("yes let's go ahead and do the whole thing today
  6 digits and all"): a 6-digit code in the restore email, typed into the app.** Familiar bank-code
  pattern; the gold button stays for browser users (front door), the code is the door that reaches
  inside the app.
- **Server (`user-data.js`):** the code lives INSIDE the row's data JSON as `_restore:{c,exp,tries}` —
  **no Supabase schema change needed**. Minted on a restore request, written to a new MailerLite
  subscriber field **`restore_code`** next to `restore_token`. Exchange = `GET ?email=&code=` → her data
  + a fresh save-token (same shape as the token path, so the client applies it identically).
  - ⚠️ **THE 24-HOUR CODE LIFETIME IS LOAD-BEARING, do not "tighten" it:** MailerLite sends the restore
    email at most once per person per 24h, so a second request in a day produces NO new email — the
    stored code must stay valid AND IDENTICAL to the emailed one for the whole window. That is also why
    **a still-valid code is REUSED, not re-minted**, on repeat requests (and why the cooldown is checked
    BEFORE minting — a request that sends no email must never rotate the code out from under the email
    she already has). Plaintext in the row on purpose: the DB already holds everything the code protects,
    and plaintext is what lets the reuse path re-send the same code (self-healing field writes).
  - **Security posture preserved:** 6 tries then dead, single-use (cleared the moment it works), wrong
    code / expired code / unknown address are byte-identical 401s behind an 800ms floor (the enumeration
    defense), constant-time compare, origin gate applies, `_restore` is stripped from every response and
    deleted from every client save body (unforgeable) while a save from another device carries it
    forward (a save must not invalidate the code sitting in her email). Breadcrumbs: `[restore] ca***@…
    — CODE OK / CODE FAIL: wrong code (try 2 of 6) / …` in the same masked log family.
  - **If MailerLite refuses the `restore_code` field write** (field not created yet), the send retries
    WITHOUT the code and the log names the fix — a missing field can never kill restore emails.
- **App (`index.html`):** the apply logic was refactored out of `autoRestoreFromLink` into a shared
  **`_applyRestoredRecord()`**; the Check-your-email card gained a quiet code row (label, gold-bordered
  numeric input with `inputmode=numeric` + `autocomplete=one-time-code`, black Restore button) — inside
  the card, above the welcome-email fallback line, **her even-thin-border rule untouched**. Works in
  browser too (deliberately not gated to the app). Too-short codes are caught locally; a wrong code says
  "That code didn't match. Check the newest email…" (one message for all server outcomes, because the
  server response is deliberately one outcome). Success lands her straight in her portrait, storage
  written in THE APP's own container — which is the entire point.
- **Verified: new `scratchpad/restorecode.js`, 72 checks** (real handler: mint/reuse/cooldown-no-rotate,
  exchange, single-use, 6-tries, 24h expiry, identical-body + floor timing, formatting forgiven,
  `_restore` never leaked/forgeable/wiped, origin gate; real page: code row renders 390+360, local
  validation, wrong-code path + AA contrast, right code → portrait + ss_data/ss_token/emailDone in this
  context, zero JS errors). Full sweep green: sec 89 · restorecard 48 · e2e 29 · copy 41 · followups 38 ·
  hubs 46 · menu 87 · nav 67 · cowork3 69 · searchchat 54 · affq 40 · a2hs 38 · menux 28. ⚠️ sec.js's
  Supabase stub needed `new Response(null,{status:204})` — Node's Response constructor refuses a 204
  with a body; the real Supabase is fine. Same fix baked into restorecode.js from the start.
- ✅✅ **CATH DID BOTH DESK STEPS THE SAME DAY, GUIDED STEP BY STEP, AND THE LIVE TEST PASSED: "This
  worked!"** — app icon → Find my results → email with the code → typed it → her portrait, IN the app.
  The whole chain is proven end to end on her own phone. Notes from the guided run: (a) the `restore_code`
  field was created as name "Restore Code" and MailerLite derived the `{$restore_code}` tag itself;
  (b) ⚠️ **heading sizes in the email editor are per-PARAGRAPH** — a Shift+Enter line break keeps the
  sentence and the code in ONE block, so Heading 2 swallowed both; the fix is a real Enter between them,
  then set the sentence back to Normal text (code line = Heading 2 bold, sentence = normal); (c) ⚠️ **the
  hero's "Additional text" (the sign-off below the button) VANISHED mid-edit** — recovered via the block's
  Additional text toggle (it was still ON; a Save settings re-render brought it back). Check below the
  button before leaving the editor, every time; (d) both re-enter settings survived this edit unchanged —
  first time ever; still re-check every time.
- ⚠️ **HONEST EDGE, flagged to her in chat:** a woman who took the quiz but NEVER saved by email has no
  Supabase row — nothing can carry her into the app. The whisper invites install from Welcome Back
  (local results only ≠ emailed). Worth a future conversation: nudge the email save before/alongside the
  install invitation.
- ▶ **HER TWO NEW LIST ITEMS (2026-08-08, same message):** (1) ✅ **the photo-results menu revisit is
  DONE (2026-08-09, her pick "B" from renders):** the Your Style panel's big keepsake TILES became the
  app's usual hub rows (chip icon + title + sub + shelf) INSIDE the pearl panel, which keeps its
  jewel-box identity. Rows: Style Portrait / Style Signature / Style Constellation. The `pgrid`/`pbtn`/
  `pv-*` CSS and `_renderSigThumb` are deleted; `_renderCardThumb` now feeds only the portrait screen's
  `scThumb`. ⚠️ The three row SUBS are Claude drafts, she may reword. Trade-off she accepted: the live
  mini-previews (signature chart, constellation thumb) are gone in row form; (2) the vision board —
  resolved the same evening, next entry.

### ✅ THE VISION BOARD IS DELETED (2026-08-08, evening — her explicit call, same day)
Her reasoning, verbatim-ish: *"it does not exactly align with style star and seems out of place. Like she
doesn't know what she is supposed to do with it. And also it does not lead to shopping links and it
doesn't do anything to help her enhance her style."* That is the product bar stated cleanly — ▶ **every
feature must either lead to shopping or help her style, and she must know what to DO with it.** Weigh
future features against it.
- **What went:** the portrait screen's Mood Board card (the constellation now sits alone on the striped
  curtain panel), the photo-results Mood Board tile (that `pgrid` is 3 tiles now; the odd last one spans
  the full row via `:last-child:nth-child(odd)` so there's no hole), `openVisionBoard`/`buildVisionBlob`/
  `_renderVisionThumb` + all `_vis*` helpers (~200 lines), the `vision/` folder (32 jpgs), the FAQ's
  share answer now names only the Constellation. The Constellation itself is UNTOUCHED (she never asked
  for its deletion). All recoverable from git history if ever wanted.
- **Verified:** full 14-suite sweep green after the delete (affq's known timing flake, clean on rerun);
  both script blocks parse; zero vision identifiers left.
- ▶ **HER THREE FUTURE IDEAS, recorded 2026-08-08 (conversations/brainstorms, NOT approved builds):**
  1. **A LOOKBOOK** — "vision of style ideas for her in a vision board type of way"; maybe an email,
     maybe a future premium tier (value-first rule applies: premium only after real free value). Not
     worked out in her head yet. ▶ Natural unlock: product feeds (money-path step 7) — real product
     images are what turn a collage into a lookbook that leads to shopping.
  2. **A SHAREABLE "REGISTRY"** — ⭐ **SHE RAISED THIS AGAIN 2026-08-16 AND WANTS IT REMEMBERED; see the
     EMAILABLE WISHLIST entry at the top of this file for her newer framing and the Amazon-email
     constraint.** Her wishlist, shareable like a bridal registry: birthday/holiday link
     to her spouse ("here is my wish list, with links"), Style Star earns the affiliate commission on
     purchases. She noted herself it's "exactly the same as her wish list" — a shareable VIEW of it.
     ▶ Needs a server-side public wishlist page (share token, list only — never sizes/prefs/anything
     personal) + the affiliate tags to make it earn. Strongest candidate of the three: it shows what
     the app actually does (her own bar for shareables) and monetizes other people's high-intent taps.
  3. **A FEATURED ITEM** — outfit of the day / bag of the week / shoe of the season; email or a menu
     item with a New pill; "a featured item that would make her curious." Curation is HERS (the Edit
     rule: Claude never picks products). Cheapest of the three — the Edit + New-pill machinery already
     exists; a weekly cadence is sustainable, daily is not.

## ▶ PREVIOUS (updated 2026-08-08 — menu tune, the restore card, and the EMAIL BUG SOLVED)
⚠️ **Date note: today's stamps are verified against the Netlify function log ("Aug 8") and the environment.**
The polish session recorded just below as "2026-08-08" was an earlier day (its own entry admits its stamps
drifted). **Two sections carry 08-08; the one nearer the top is the later one.** Trust the order, not the date.

### ✅ WHAT SHIPPED 2026-08-08 (two menu-drawer items, both her asks off one live screenshot)
1. **Menu drawer narrower again, 250px → `min(220px,70vw)`.** She took the offer from 08-08 ("she can go to
   ~215px before anything wraps"). ▶ **The floor is now MEASURED, not estimated: 213px** — walked the panel
   1px at a time in real Chromium with the real fonts and the "Start here" pill shown (the widest state), and
   **"Refine your Preferences" is the first row to wrap, at 212px** (its content box is 165px + 44px panel
   padding + 4px row padding = 213px). **220px was chosen deliberately over 213** — 7px of headroom so a
   webfont that fails to load and falls back to Georgia can't wrap the list. ▶ **If she ever wants the last
   7px, 213 is the hard floor and there is nothing below it without shrinking the font.**
   (`scratchpad/menumeasure.js` reruns the measurement any time a row is renamed or added.)
2. **The ✕ moved up into the top-right CORNER** (her ask; it had been vertically centered against the tall
   logo, which put it level with the middle of the wordmark). `.menu-head` is `position:relative` and
   `.menu-x` is now absolute at `top:-6px;right:-12px` — **the negative offsets eat into the panel's own
   22px padding so the glyph hugs the corner (20px in, 16px down) while the button's padding keeps the tap
   area at 37x40px**, which matters for the 18-80 audience. Same trick as the FAQ/legal Back button.
   ⚠️ Don't "tidy" the negative offsets away; they ARE the corner-hugging.
- **Verified: `scratchpad/menux.js`, 28 checks** (390/360/320 — 17 rows all one line with the pill shown, ✕
  geometry + tap size + still closes the drawer, nothing overflows the panel sideways, zero JS errors) +
  menu 82 · nav 55 · hubs 46 · e2e 29 · copy 41 · followups 38 all green. Screenshot: `scratchpad/menu-220.png`.
▶ **Still open, unchanged from 08-08:** how the A2HS whisper feels on her phone · HER graduation-whisper line ·
her most-asked stylist questions (chat chips) · Indie Law's substantive reply (name fix + operating-agreement
blanks), then the TM signature email, then the EIN.

### ✅ THE RESTORE EMAIL WAS REWRITTEN BY HER (2026-08-08, at her desk, in the MailerLite editor)
Her catch, and it is the honesty rule again: the email claimed **"Your sizes, your colors, your wardrobe
list, and anything you've added to your wishlist"** — but a restore is triggered by any saved record, and a
woman may have taken the quiz and saved WITHOUT ever refining. **The email was telling some women about
things they had never done.** Her rewrite turns the list into an invitation instead of an inventory:
*"Pick up wherever you like. Build your wardrobe list, refine your preferences, check out what's trending,
chat with your stylist, add to your wishlist, shop your style and more."*
- **Header de-shouted (her other ask):** ⭐Your Style Portrait is Waiting⭐ → **"Your Style Portrait is
  waiting"** — both emoji stars gone, sentence case, size down. It was wrapping to THREE lines on her phone,
  which was most of the loudness. ▶ **The gold star in the logo directly above it was already doing that job.**
- ▶ **A COPY RULE THAT CAME OUT OF IT, worth reusing: keep the specific noun on the HEADING and the BUTTON,
  vary the prose in between.** She asked whether to say "Style Star" instead of "Style Portrait"; the answer
  was keep Portrait, because the `?r=` link genuinely lands on `showResult()` (the portrait screen), and a
  button should name its destination. What she was hearing was the phrase appearing THREE times in a short
  email, so the middle one became "Here's your link back in, just as you asked."
- ⚠️ **EDITOR TRAPS HIT THIS SESSION, all now known:** (a) she deleted the whole hero block by accident —
  **Cmd+Z and the editor's revision-history icon both recover it**; (b) **the `{$name}` tag gets deleted with
  the text** and must be re-inserted (the app writes `fields.name`, so `{$name}` is the correct tag — and
  **never add a MailerLite fallback**, the app already writes "there" for a nameless woman); (c) **the button
  cannot be moved and you cannot type below it** — the Standard hero's slots are fixed, so the sign-off went
  in the body text ABOVE the button, which reads fine; (d) **Enter makes a new PARAGRAPH, Shift+Enter makes a
  tight line break** — that is the fix for "Founder of Style Star" sitting too far from her name, NOT the
  line-spacing control, which moves the whole block.

### ▶ WHERE THIS SESSION ENDED — THE SHORT LIST FOR NEXT TIME (2026-08-08)
**Shipped and confirmed today:** the narrower Menu + corner ✕ · the "Check your email" card (her Option C,
then her gold fix, then her even-thin-border fix) · the restore-send breadcrumbs · **the restore-email bug
SOLVED** · her rewrite of the restore email in MailerLite · **Instagram in the footer AND the Menu** ·
**the A2HS whisper made readable and honest** (her live testing, her pick "A2" — detail in item 3 below).
Her closing word on the last one: *"it looks really good."*
▶ **NEXT UP — only two things are actually open:**
1. ✅✅ **THE FOOTER AUDIT IS DONE AND LIVE (2026-08-08, evening — her from-zero rethink, built and merged).**
   She reopened it properly: *"What do we absolutely have to keep? Legally? To look legit? Easy for users?
   Smartest for profit?"* — and the answers reshaped the whole footer. **As shipped:** two balanced rows in
   ONE voice (both 14px Jost, gold ★ separators everywhere — her catch: gold stars above vs gray dots below
   "doesn't look right"), sorted by MEANING: **places to go up top (Home ★ Shop ★ [Instagram tile]),
   information below (Privacy ★ Terms ★ FAQ)**. Her calls, all recorded: **My Story CUT from footers** (lives
   in the Menu + the welcome founder line; the weakest version of the Sally signal wasn't earning its width) ·
   **FAQ moved down with the legal links** (her idea — it's the information family) · **Instagram in its REAL
   brand gradient** (her ask; the recognizable form is the gradient tile + white camera) · **tile ends the
   main row** (right position, picked from a left/middle/right render — right keeps the rhythm when a page's
   own link drops out; middle only exists on pages that keep both Home and Shop) · **no hairline** (the
   harmony fix made it unnecessary; C's gold dot was PROVEN gold by computed style but reads gray at that
   size — the small-gold lesson again). **Every page still omits its OWN link** (the original catch).
   - **Legal grounding recorded:** Privacy in the footer is effectively required (CalOPPA "conspicuously
     posted" + affiliate reviewers check for it); Terms rides with it. Both stay, now full-size.
   - ⚠️ **Each footer's Instagram gradient id is UNIQUE (`igG-<screenid>`)** — a shared id would resolve to
     a def inside a hidden screen, which Safari may refuse to paint. Don't "dedupe" them.
   - ⚠️ **The `.ig-a` negative-margin tap-target trick survives** (28x28 tap, lays out as a bare 16px tile).
   - **Verified: nav.js retuned deliberately 67 → 80 checks** (per-screen omission table for all 11 own-footer
     screens, global footer full set, My Story absent everywhere, tile ends the row on every page, unique
     gradient ids, white camera, tap size, one-line rows + no overflow 390/360/320, contrast ≥4.5 on real
     backgrounds) + full sweep green (affq's known flake, clean on rerun). Renders: `scratchpad/footmock*.js`
     → `foot3-d.png` (her pick), as-built `foot-built-{story,faq}.png`.
   - ▶ Her word on the return-loops framing, same evening: *"let's make these ideas come to fruition 💛"* —
     the registry (share Your Wishlist) is FIRST when affiliate approval lands; the featured item is the
     cheapest early build (Edit + New-pill machinery); lookbook waits for feeds.
2. **📧 The rest of the MailerLite list:** ✅ **the WELCOME email's "shouting" sub-header is DONE too
   (2026-08-08, her own edit while MailerLite was open for the restore-code work)** — both emails are now
   de-shouted. Remaining: "Email me my wishlist" · photo-tips email + email capture on the wardrobe page.
▶ **Still waiting on HER WORDS (don't invent either):** the graduation-whisper line · her most-asked stylist
questions for the chat chips. ▶ **Still waiting on OTHERS:** Indie Law's substantive reply (the Bailey name
fix + the operating-agreement blanks), then the TM signature email, then the EIN.
▶ **One open CONVERSATION, offered and not answered:** the A2HS whisper is Welcome-Back-only, so a
first-time visitor never sees it. Should a woman who just finished her quiz be invited to install too?

### ▶ DONE THIS SESSION, kept for the reasoning
3. **📱 ✅✅ THE A2HS WHISPER IS FIXED (2026-08-08) — her live testing found it, she picked "A2".**
   She found the whisper on her phone (normal Safari, not private) and **tried to TAP the app icon, the
   wording AND the inline share glyph**, not realising she had to use Safari's OWN share button. Her other
   note: *"the print is too small, very tiny hard to read."*
   - ▶ **THE FAULT IS OURS, and the lesson generalises: a control-shaped glyph sitting inline in a sentence
     reads as a BUTTON.** She tapped it because the design invited her to. ⚠️ **On iOS it can NEVER be
     tappable — Apple exposes no API to trigger Add to Home Screen** (that is exactly why Android gets the
     real `beforeinstallprompt` button and iPhone gets instructions). **So anything tappable-looking there is
     a promise the platform cannot keep.**
   - ▶ **Measured: `.a2-t` is 12.5px ITALIC cream** — italic is the worst case at that size on the dark
     background, and readability is a stated priority for the 18-80 audience.
   - **Three options rendered** (`scratchpad/a2hsmock2.js` → `a2hs2-{current,a,b,c}.png`, real iOS UA on the
     real Welcome Back screen): **A** 14px upright + two numbered steps, the glyph inside a raised "key cap"
     chip so it reads as a picture of a button ELSEWHERE · **B** bigger + a bobbing arrow pointing down at
     the real button · **C** "Show me how" expands the steps, honouring the tap she made.
   - ▶ **RECOMMENDED A. ⚠️ ARGUED AGAINST B and the reason is a real correctness point: Safari's toolbar is
     not always at the bottom** (it can be moved to the top, and Chrome on iOS differs), so "down here" would
     be confidently WRONG for some women. C was rated appealing but hides the instructions behind one more tap.
   - ✅ **BUILT AS "A2" (her pick over the 3-step A1): "if you see it sounds a little confusing."** Her ear
     was right — a conditional inside a numbered step is a wobbly instruction. As built: **her lead line kept
     in full**, then **1** Tap [share chip] in your browser's toolbar · **2** Scroll down to **Add to Home
     Screen** ♥, then a quiet grey note: *"It sits a little way down the list, under View More on some
     phones."*
   - ▶ **HER SECOND FINDING, and it is why the copy changed at all: the real iOS flow is Share → sometimes
     View More → SCROLL → Add to Home Screen.** The old two-step line undercounted it. ⚠️ **An instruction
     that undercounts is worse than none** — she follows it, doesn't see the thing, and concludes it's broken.
   - ⚠️ **"your browser's toolbar", NEVER "at the bottom of your screen."** Safari's bar can be moved to the
     top and Chrome on iOS differs. **This also corrected an inconsistency in Claude's own advice** — B was
     argued down for "down here" while A's step 1 said "at the bottom". Same fault, both fixed.
   - ✅ **HER TWO LAYOUT NOTES FROM THE LIVE SCREENSHOT, both fixed same session:** (a) **the share chip sat
     BELOW the line of text** — it was `vertical-align:-8px`; it is `vertical-align:middle` + `top:-1.7px`
     now, measured dead level (0.0px off the text line's centre). ⚠️ **Don't go back to a negative
     vertical-align.** (b) **step 2 wrapped.** ▶ **Measured, not guessed: her wording needs 271px, the step
     cap was 262px, and 286px was actually AVAILABLE at 390** — the cap was the limiter, not the screen. Cap
     raised to 292px and `#a2hs` side padding trimmed 22 → 12px, which buys 20px. **Both steps now hold ONE
     line at 390 AND 360 (Display Zoom).** ⚠️ At 320 they still wrap, deliberately — she said *"I definitely
     don't want the font any smaller"*, and shrinking type on the readability audience is the wrong trade.
     ▶ **The alternative if 320 ever matters: "Choose Add to Home Screen" needs only 232px and fits every
     width** — the "scroll down" wording duplicates the note below it anyway. Offered, not taken.
   - **Verified: `a2hs.js` grew 26 → 38 checks**, pinning the fixes so they can't regress: ≥14px, upright not
     italic, two numbered steps, the glyph inside a chip, the note naming View More, the toolbar wording, and
     — the important one — **zero elements on the iOS path that look tappable** (no anchor, no onclick, no
     `cursor:pointer`). As-built: `scratchpad/a2hs-built.png`.
   - **Android is unaffected** — it keeps its real, working "Add it now" button.
4. **📱 Also still open on the same whisper:** it is Welcome-Back-only, so a first-time visitor never sees it.
   **Offered as a conversation, not built** — should a woman who just finished her quiz be invited too?
▶ **Still waiting on HER words, unchanged:** the graduation-whisper line · her most-asked stylist questions
(the chat chips). ▶ **Still waiting on OTHERS:** Indie Law's substantive reply (the Bailey name fix + the
operating-agreement blanks), then the TM signature email, then the EIN.

### ▶ HER TWO NEW ITEMS (2026-08-08, added to the list as she moved to her desk)
**1. ✅✅ DONE, AND CONFIRMED LIVE BY CATH (2026-08-08): "I see it on the footers and the link worked."**
She picked **"Footer A"** from the
3-way render (`scratchpad/igmock.js` → `ig-{foot-inline,foot-own-line,menu-row}.png`): a **quiet 15px glyph
on the footer's second row, after Terms**, in the same `#6f6a63` ink as Privacy and Terms. Handle
**`@style_star.app`**, confirmed by her. **She then asked for the MENU ROW TOO, same session, so BOTH shipped**:
`menuInstagram()` in the About group, directly under Share Style Star (the share/follow pair belongs
together). It closes the drawer, opens her profile in a new tab with `noopener`, and leaves her on whatever
screen she was reading, exactly like `menuShare()`. ⚠️ **The drawer is 18 rows now** — "Follow on Instagram"
measures 142px, third widest, so the 213px floor is UNCHANGED and 220px still holds every row on one line.
- ⚠️ **`rel="noopener"`, deliberately NOT `"sponsored"`.** The standing rule tags outbound PRODUCT links as
  sponsored; her own Instagram is not a paid link, and marking it so would be a false signal to search
  engines and to any affiliate reviewer reading the page. **`affq.js` enforced sponsored on every
  `target="_blank"` anchor and would have failed** — it now splits social from product (25 product anchors
  still asserted, 4 new checks on the social one). **That split was a deliberate test change, not a silence.**
- ⚠️ **The negative margin on `.ig-a` is load-bearing:** `padding:6px;margin:-6px` gives a **27x27 tap
  target while the row lays out as if the glyph were a bare 15px** — the main footer row has zero width to
  spare at 360px, so the link must add nothing. Don't "tidy" it away.
- **Verified: `menu.js` grew 82 → 87 checks** (the new row opens the right handle in a new tab with noopener,
  the drawer closes, she stays put, the row sits between Share and My Story, and all 18 rows are still
  single-line) and **`nav.js` grew 55 → 67 checks** (present in all 12 footers, href/target/rel/aria-label, glyph
  size, tap size, sits inside the row, same ink as its neighbours, and no overflow at 390/360/320) + affq 40 ·
  e2e 29 · copy 41 · menu 82 · hubs 46 · followups 38 green. As-built: `scratchpad/ig-built.png`.
▶ **The ORIGINAL prep, kept because the width facts still bind any future footer change:**
⚠️ **The handle could NOT be verified from the sandbox — Instagram answers automated requests with 429** — so
it was shipped only after **Cath confirmed it opens her profile**. Same rule next time: never ship a social
link on an unverified URL.
- **The footer's main row has NO ROOM at 360px.** Measured on 2026-07-30 and still true: the row needs 246px
  and the FAQ/legal column is 248px, which is why `.sf-row` already drops its gap to 8px under 375px. **A
  fifth text link ("Instagram") would overflow on Display Zoom phones.** So in the footer it has to be either
  a small GLYPH on the quiet second row beside Privacy · Terms, or a line of its own.
- **The Menu is the cheaper home** — one row in the About group next to Share Style Star, which is where a
  "follow / share" pair belongs. ⚠️ But the drawer is already 17 rows and its tail sits below the fold.
- ▶ **Recommendation to put to her: BOTH, and they're different jobs** — a glyph in the footer (always
  present, universal convention, costs no reading) and a row in the Menu (findable by name, the mom lesson).
  Decide together; render before building either.
**2. 🧭 THE FOOTER AUDIT — her catch: "on the My Story page we have a My Story footer", and "Privacy and Terms
sitting below does not look tidy."** ▶ **BOTH CONFIRMED, and the first one is bigger than the one page she
spotted. Every footer is filled from ONE template (`_stdFootHTML`), so a screen whose own name is in the
template LINKS TO ITSELF. Eleven screens carry it and SEVEN of them self-link:**
`s-story`→My Story · `s-faq`→FAQ · `s-privacy`→Privacy · `s-terms`→Terms · `s-shop`→Shop ·
`s-wel` and `s-wb`→Home. (The other four are clean: `s-res`, `s-photo-res`, `s-wardrobe`, `s-wishlist`. A
12th footer, the global `.quiz-footer`, sits outside the screens and is fine.)
⚠️ **These are not broken — the 2026-07-31 self-link guard means tapping one doesn't kill the Back button —
they are POINTLESS, which is exactly the untidiness she's seeing.** ▶ **The fix that keeps the one-template
rule intact: `_stdFootHTML()` takes the current screen id and omits (or greys) that one link**, so nothing
can drift and every page still shows one complete footer. ⚠️ **Watch the width consequence — dropping a link
makes the row NARROWER, which is good at 360px, but the row must stay centred and not look lopsided.**
▶ **Open design question for her eye: the `.sf-row2` Privacy · Terms line.** It is a second row of quieter
12px text under a starred row, and she's right that it reads as an afterthought. Options to render: fold them
into the main row (needs the width the self-link removal frees up), keep two rows but tighten the gap and
align the widths, or give them a hairline rule above. **Renders first, her pick, same as always.**
▶ **When this happens, re-run `scratchpad/nav.js` (55 checks)** — it asserts every screen's footer is
identical and that all links navigate, so a per-screen omission WILL fail it and those assertions need
updating deliberately, not silently.

### ✅✅ SOLVED THE SAME DAY — THE RESTORE EMAIL BUG IS FIXED AND CONFIRMED (2026-08-08, at her desk)
**Root cause: MailerLite's "Allow subscribers re-enter automation" checkbox was UNCHECKED** on the
`Style Star Restore Requests` automation. Cath entered that automation once on 2026-07-29 during testing,
exited it, and **every request she made afterwards was silently refused re-entry.** She ticked it, set
**Time for re-enter = "As soon as they match the triggers"** (NOT the 1-day delay), saved, re-activated —
**and the email arrived.** 🎉
- ▶ **THE BREADCRUMBS PAID FOR THEMSELVES ON THE FIRST RUN.** The log said
  `[restore] ca***@icloud.com — GROUP JOINED — handed off to the MailerLite automation` within two minutes,
  which **cleared our function entirely** and pointed straight at MailerLite. Three days of guessing became
  one line. **KEEP THEM.**
- ▶ **The decisive numbers, and the pattern to reuse:** the automation's Activity hub read **Started 3 /
  In progress 0 / Completed 3 / Total emails sent 3**. Her join had just fired, so "Started" not moving is
  what proves the join was received and REFUSED, as opposed to never arriving. **On any future "automation
  didn't fire" question, read Started first** — it separates "MailerLite never heard us" from "MailerLite
  heard us and declined".
- ⚠️ **THIS IS THE SAME SETTING FLAGGED ON 2026-07-29** as defaulting to OFF. It was turned ON then and was
  OFF again now. Whether an edit reset it or it never saved is unknowable after the fact. ▶ **STANDING RULE:
  re-check BOTH re-entry settings after ANY edit to an automation** — they fail silently and look identical
  to working.
- ⚠️ **IT ONLY EVER BIT REPEAT REQUESTERS.** A woman asking for her results for the FIRST time enters the
  automation normally and gets her email. That is why nobody else reported it, and why it looked intermittent
  — Cath is simply the person who has asked most often.
- ⚠️ **THE DANGEROUS STEP IS THE LAST ONE: the automation must be PAUSED to edit it, then RE-ACTIVATED.**
  Left paused, NOBODY gets a restore email at all. Always confirm it reads **Active** before leaving.
- ▶ **Still true and worth remembering: the confirmation on screen can never be a delivery receipt** (the six
  200-returning no-send branches below). The log is the instrument; the inbox is not.

### ⚠️ 2026-08-08 — THE ORIGINAL REPORT AND THE READING THAT LED TO THE FIX (kept for the reasoning)
She tapped **Find my results** on `stylestar.netlify.app`, got the confirmation on screen, and **no email ever
arrived.** ▶ **The code was read this session and there is a structural finding that changes how to debug it:
the app says "we've just sent you a link" on ANY 200 — and `user-data.js` returns 200 in SIX cases where
nothing was sent.** No Supabase row for that address (deliberate — the enumeration defense) · the **5-minute
per-address cooldown** inside `sendRestoreLink` · no `MAILERLITE_API_KEY` · a MailerLite non-ok response · no
subscriber id back · no group id. **All six look identical to success from the client**, and they must: telling
her "no account here" IS the enumeration oracle closed on 2026-07-29. ⚠️ **So the confirmation can never be a
true delivery receipt, and no amount of front-end work will diagnose this — it has to be diagnosed SERVER side.**
▶ **Desk-day order, most likely first:** (1) **her subscriber's Activity log in MailerLite** — the instrument
that solved the 2026-07-29 mystery in seconds. Look for a `Style Star Restore Requests` **join** at the minute
she tapped. **A join with no send = MailerLite's 24h-per-person rule** (a platform limit, not a setting) **or
the automation itself; NO join = the function bailed before the group step**, which points at the cooldown, a
missing Supabase row for that exact address, or a MailerLite API error. (2) Confirm **which address** she typed
and that a Supabase row exists for it.
✅ **SHE SAID YES, SO THE BREADCRUMBS ARE BUILT AND LIVE (same session).** Every early return in
`sendRestoreLink` now logs **why** nothing was sent, plus the no-Supabase-row case and a lookup throw, and the
success path logs `GROUP JOINED — handed off to the MailerLite automation`. ▶ **HOW SHE READS THEM:
app.netlify.com → her site → Functions → `user-data`**, then tap the button and watch. The line looks like
`[restore] ca***@icloud.com — NO SEND: within the 5-minute per-address cooldown`. ⚠️ **The address is MASKED
on purpose** (first two letters + domain) — enough to match against what she typed, without dumping real
women's emails into a log. **The response body is byte-identical to before**, so the enumeration defense is
untouched; nothing new is exposed to the client. ▶ **The decisive split: if the log says GROUP JOINED and no
email arrived, the problem is MailerLite's (the 24h-per-person rule or the automation) — go to her Activity
log. Any other line names the bug in our own function.**

### ▶ THE "CHECK YOUR EMAIL" CONFIRMATION — HER DESIGN ASK (2026-08-08, renders made, AWAITING HER PICK)
Her words: *"the print is so tiny and hard to read and it does not stand out at all."* She asked whether it
should be a pop-up she can ✕ out of, or be wrapped/highlighted/bolder.
- ▶ **MEASURED, and her instinct is provably right: `#restoreMsg` is 12px `#777`, which is 4.29:1 on the
  welcome ivory — the ONLY text on that screen below the 4.5:1 AA bar.** Its neighbours run 5.5:1 (How It
  Works subs) to 9-10:1 (founder line, card subs). So it is not merely quiet, it is the lightest and smallest
  text on the page, at the moment it matters most. For an 18-80 audience with readability as a stated
  priority, this is a fix regardless of which styling she picks.
- ▶ **RECOMMENDED AGAINST THE POP-UP, and the reason generalises:** this is a confirmation of something she
  just did AND an instruction she still has to act on. A modal she ✕'s out of **deletes the instruction** the
  moment she dismisses it, leaving her on a screen with no record of what happened. It also contradicts her own
  2026-07-29 principle (once a form has done its job its call to action should STAND DOWN, not shout louder).
  Highlight in place, don't interrupt.
- **Three options rendered** (`scratchpad/restoremock.js` → `restore-{current,a,b,c}.png`, 2x, her preferred
  per-option format; drives the REAL sent state with the fetch stubbed to a 200): **A** bordered cream card +
  envelope chip, left-aligned · **B** no box, the Or-Explore gold divider reused as a "CHECK YOUR EMAIL"
  header with the body upsized to 13.5px ink (lightest touch, most restraint) · **C** gold left accent bar,
  16px bold headline, strongest highlight. **All three also tighten the copy** — the current version spends
  three sentences before she knows to go look — and demote "it's in your welcome email too" to a quieter line.
  ⚠️ **That fallback line must NOT be cut**: the 24h rule means a second request in a day sends nothing, and
  the welcome email is genuinely her only route back inside that window.
- ✅✅ **SHE PICKED C AND IT IS BUILT + MERGED LIVE (2026-08-08), against the recommendation of A** — her eye,
  and the ask was "make it stand out", which is exactly what C does best. As built: cream-to-gold gradient
  card, **4px gold left accent bar**, envelope glyph + **16px bold "Check your email"**, 13px body, and the
  welcome-email fallback demoted below a hairline rule. **Every line now clears AA with room** — headline
  16.98:1, body 11.34:1 (was 4.29), fallback 5.54:1, follow-up links 8.99:1.
- ▶ **BONUS FIX worth knowing: `#restoreMsg`'s inline `12px #777` was ALSO styling the plain status strings**
  ("Please enter a valid email", "One moment...", "that didn't go through") — so the error messages were just
  as unreadable as the confirmation. The inline style is gone; the base rule is now 12.5px `#4a463e` (8.99:1),
  which lifts all of them at once. ⚠️ **Don't re-quieten `#restoreMsg`** — a confirmation she cannot read is
  not a confirmation.
- ⚠️ **AND HER IMMEDIATE CATCH ON THE LIVE CARD: "I don't like the brown color... especially the line on the
  left."** The first build used **`#C8971E`** on the 4px bar and **`#8a6a14`** on the envelope — **the exact
  trap logged on 2026-08-08** (dark antique golds go brown at small sizes; the Analyze Photo hint star was the
  same lesson). **The card is now ALL ONE GOLD, `#D8A52E`** — bar, envelope and the hairline rule — which is
  the gold SHE picked for the Mall star the day before, and applying her own "all one color" principle from
  that same session. Border lifted `#D8C285` → `#DFC07A`. ▶ **Rendered against `#E0B84C` (the star gold) and a
  gold-leaf gradient before choosing** (`scratchpad/restoregold.js` → `gold-{brown,star,mall,leaf}.png`);
  `#E0B84C` washed out at 4px and the gradient bar got clipped by the card's own `overflow`, so `#D8A52E` won
  on presence. ▶ **STANDING: check any new gold against `#D8A52E` / `#E0B84C` FIRST — two of her last three
  gold complaints have been this same family.**
- ✅ **THEN SHE TOOK THE ACCENT BAR OFF ENTIRELY (same session): "just make it an even thin line all around."**
  So the card is now a plain **1px `#D8A52E` border on all four sides**, the same gold as the envelope — the
  4px left bar and the paler `#DFC07A` edge are both gone. ▶ **Her instinct is consistent with the restraint
  budget:** the bar was a second emphasis device on a card whose headline, tint and icon were already doing
  the work. ⚠️ **Don't reintroduce a heavier edge.** Four test assertions pin it (all four borders equal, 1px,
  one colour, glyph matching) so neither the bronze nor the bar can creep back.
- **Verified: `scratchpad/restorecard.js`, 48 checks** (390 + 360: card renders, headline/body sizes, accent
  border even + thin + one gold, envelope glyph, fallback line kept, ask form stands down, both links present, all four
  contrast ratios, "Try a different email" restores the form + clears the card + empties the field, no
  overflow, no sideways page scroll, zero JS errors). ⚠️ **`e2e.js` test 5 pinned the OLD exact phrase**
  ("just sent you a link") and failed on the tightened copy — the assertion was widened to `just sent (you )?a
  link`, the claim under test is unchanged. Full sweep green: sec 89 · e2e 29 · copy 41 · followups 38 ·
  hubs 46 · menu 82 · nav 55 · cowork3 69 · affq 36. As-built: `scratchpad/restore-built.png`.

### ✅ WHAT SHIPPED 2026-08-08 (one PR, #752 — five polish items from HER live screenshots, all her calls)
1. **How It Works step 2 REWORDED BY HER**: "Meet your Style Portrait" → **"Reveal your Style Portrait"**
   (her instinct; the clincher: "Meet" doubled with "Meet your stylist" on the same screen, and "Reveal"
   matches the portrait's real reveal-doors moment) · sub-line now HERS: **"Your signature style, made
   clear for you"**. Don't reword either without her. (`scratchpad/hiwcheck.js`, 12 checks.)
2. **Mall header polish**: sign moved down 13px so the star's tip clears the Menu chip by 8px — measured
   on the DRAWN path with getPointAtLength, not the rotated bounding box (the box overstates by ~25px;
   reuse that trick for any rotated-ornament vs chip question) · the star's stroke GRADIENT replaced with
   one solid gold `#D8A52E` (her call: "all one color") · gaps tightened (sign→disclosure 24→10px,
   disclosure→first category 27→13px; later categories untouched) · disclosure centered (scoped to
   #s-shop; the Edit's was already centered via inheritance). (`scratchpad/mallverify.js`, 14 checks.)
3. **Analyze Photo hint star**: `#C79A34` read BROWN at 11.5px → now `#E0B84C`, the app's true star gold
   (same as the My List stars). ▶ Lesson: dark antique golds go brown at small sizes; when Cath says a
   gold looks off, check it against #E0B84C first.
4. **Portrait screen**: breathing room above Retake the Quiz, wrapper padding-top 4→14px (the rule is
   shared with #s-photo-res but that screen overrides padding, so only the portrait moved).
5. **Menu drawer NARROWER, her ask**: `min(300px,84vw)` → **`min(250px,70vw)`**. Measured: the widest row
   (Refine your Preferences) needs 169px + 44px padding, so every one of the 17 rows keeps one line at
   390/360/320 (menu suite 82 still green). ▶ **She can go to ~215px before anything wraps** if 250 still
   feels wide — offered, awaiting her eye on the live page.
▶ **Session hygiene notes:** portrait-screen harnesses need the rnfinal.js SEED SHAPE (`userName`/
`answers`/`topArchNames`/`portrait`/`motto` — a `name`/`portrait{}` guess renders a zero-height panel),
then `show('s-res')` + class `rv-open`. ⚠️ The date stamps written mid-session say 2026-08-07; the session
was actually 2026-08-08 — same session, don't hunt for a missing day.
▶ **Still open from this session:** she never answered how the A2HS whisper feels on her phone (asked,
then testing took over) — ask again. Still waiting on HER graduation-whisper line + her most-asked
stylist questions (chat chips). And she should eyeball the narrower Menu + Mall header live.

**The next-freshest state is the ✅ 2026-08-05 entry just below the index**: the whisper voice made consistent
(her 4 catches), the ADD-TO-HOME-SCREEN whisper shipped (her words, her icon idea, no ✕, no retirement),
and the legal thread moved (LLC docs delivered + inventoried, TM word mark → final action steps, her
2-ask reply to Indie Law sent: the "Bail"→Bailey name fix + the operating-agreement blanks). ▶ **Watch
for: Indie Law's substantive reply (UPDATE 2026-08-07: Almira acknowledged the two flagged items, said
she'll look into it and respond — nothing substantive yet), the TM signature email (REAL, not scam),
then the EIN.** Still waiting on HER
words: the graduation whisper line + her list of most-asked stylist questions (chat chips). Ask how the
A2HS whisper feels on her own phone.

### ⭐ CATH'S FULL TO-DO LAYOUT (written with her before her break, 2026-07-31 — the pick-up index)
She asked for the whole landscape, big and small, to think on. **Next session: read this index, ask what
she's been thinking about, pick ONE lever.** The detailed entries live in the sections below.
1. **🎨 DESIGN SESSIONS (together, renders first):** (a) ✅ **the Welcome screen is DONE 2026-08-03** —
   "How it works" 1-2-3 shipped (her pick, Option B) and the Sally FOUNDER LINE turned out to be already
   live (see the 08-03 entry); (b) the SHAREABLE brainstorm — vision board may go, constellation "not
   what our app does", she wants a really good on-brand Instagram shareable. Brainstorm only, build
   nothing first. **(c) NEW from her 2026-08-03 question: guiding the RETURNING woman** — she wants users
   to understand the whole app; a state-aware "your next step" idea for Welcome Back is sketched in the
   08-03 entry, conversation + renders before building.
2. **💬 CONVERSATIONS (talk, not build):** wardrobe Ideas CATEGORY BOUNDARIES (her white-tops find; she
   is the taxonomy authority) · two small her-call flags: quiet brand-home links in chat next to an
   already-linked item (her Coach observation), and the "My List" tab name if it ever bothers her.
3. **🖥 DESK DAY (MailerLite):** ✅ **THE RESTORE-EMAIL BUG IS SOLVED (2026-08-08) — see the entry at the top
   of this file.** It was the automation's "Allow subscribers re-enter" checkbox, unticked; fixed and the
   email confirmed arriving. **Remaining on this list:** shrink the "shouting" sub-header in welcome +
   restore emails · "Email me my wishlist" (unblocked, better now that picks carry real products/prices) ·
   photo-tips email + email capture on the wardrobe page fit the same session.
4. **📱 HER TESTING (the quality gate only she can run):** keep testing search chat — does the try-harder
   dial convert dry runs? keep reporting bad search landings · when bored: address-bar checks on the last
   unverified stores — ✅✅ **THE PRIORITY STORE-URL AUDIT IS COMPLETE (2026-08-01, one session, all 8):
   NORDSTROM + WARBY PARKER + BELK + VUORI + ANN TAYLOR VERIFIED, SUNGLASS HUT + SKIMS + TJ MAXX FIXED.**
   Eyewear and intimates fully closed. ✅✅ **AND THE ENTIRE TAIL CLOSED 2026-08-03:** Saks Off 5th REMOVED
   (they shut their online store — table is 101 now), Lane Bryant verified, Tommy Bahama fixed (`?text=`),
   DSW fixed (path form `/browse/`, her confirming tap proved `%20` works). **EVERY store in the table is
   now verified, fixed, or proven by live use. Store-URL work is DONE.**
5. **📝 CONTENT (hers, anytime):** more What's Trending items · more Style Star Edit pieces (New pills
   light automatically) · occasional click-through of Edit links for dead ones.
6. **⏳ MONEY PATH:** waiting on Almira (official LLC confirmation → TMs → EIN) → then HER two steps
   (business bank account → affiliate applications, NETWORKS FIRST, Amazon only with real traffic) →
   then the big unlock (tags, feeds, product images/lookbook, "in your size" returns, swim stores,
   Amazon sentence).
7. **🌟 THE GATE SHE OWNS:** tester invites (the 10 named women) once the searches feel dialed in to HER.

### ✅ WHAT SHIPPED 2026-08-05 (a short session): THE WHISPER VOICE IS CONSISTENT NOW — her catch, twice over.
Cath spotted that one "next step" looked different from the others: it was the OLD portrait refine strip
(`#refineNext`, the gold-star card built 2026-07-31, four days BEFORE the whisper existed). All five Welcome
Back whispers were verified identical (one template, can't drift). She picked the whisper restyle from a
2-option render (`scratchpad/rnmock.js` → `refinestrip-{current,whisper}.png`) with two of her own fixes:
**(1) no stranded "style ♥" line** — fixed with `text-wrap:balance` on BOTH whisper texts (the `.hm-h1`
headline-widow lever, reused); **(2) the ✕ moves to the LEFT** — the Your Wishlist convention — on the
portrait strip AND `#wbNext` on Welcome Back, so every whisper matches. ▶ **Key render finding, protect it:
the portrait's `.p3` panel is IVORY (rgb 252,252,251), NOT lacquer** — the flowshot compose faked a dark
backdrop, which was misleading; a cream whisper would vanish there. So the portrait whisper is the
light-adapted voice: ink italic `#6b655a`, deeper gold link `#A0761B`, ✕ grey `#a8a294` (the wishlist ✕
grey), pink heart unchanged. **Copy = her Welcome Back refine line word for word** ("Next, add your sizes,
colors and faves. Defining preferences is how we enhance our style ♥") — the old strip's Claude-draft
wording is retired. Behavior untouched: same `ss_refinehint` never-nag, same `.rn-body`/`.rn-x` handlers
(menu.js drives them unchanged). **Two more of her catches on the as-built renders, both shipped:**
(3) the text sat off-center — an in-flow ✕ shoves the centering box sideways, so both ✕s are
`position:absolute` now with symmetric side padding (proofed centeredPx=0); ⚠️ that un-flexing quietly
killed the balance — **`text-wrap:balance` only works on BLOCK-level text**, so both whisper spans carry
`display:block`. (4) she wanted the refine whisper on TWO lines: measured with the real Jost, the
two-line threshold is **278px**, side insets trimmed to clear it (text boxes 284/286px at 390w); at 360w
(Display Zoom) it honestly falls to three balanced lines — keeping two would mean shrinking the font on
the readability audience, deliberately not done. Full sweep green, zero flakes (menu 82 · hubs 46 ·
nav 55 · e2e 29 · copy 41 · followups 38 · cowork3 69 · searchchat 54 · sec 89 · affq 36). As-built
renders: `scratchpad/rnfinal.js` → `whisperfinal-{portrait,welcomeback}.png`.
**LATER SAME DAY: THE ADD-TO-HOME-SCREEN WHISPER IS BUILT — she picked Option B from a 3-way render
(`scratchpad/a2hsmock.js` → `a2hs-{a,b,c}.png`: A card / B whisper / C bottom sheet) and the WORDING IS
HERS:** "Add Style Star as a free app to your phone. Tap [share glyph] Share, then **Add to Home Screen**
♥" (she loves the pink heart; "free app" is her value-first framing). Mechanics (`#a2hs`, above the
Welcome Back footer, below Retake): **iOS gets the two-tap instructions** (no install API exists on
iPhone; the gold bold is EMPHASIS, deliberately no underline — nothing to tap); **Chrome/Android swaps
the ending for a tappable gold "Add it now"** once `beforeinstallprompt` fires (captured, prompted on
tap, accepted → stamped); **desktop Safari etc. see NOTHING** (instructions would be false there);
never shows in standalone/installed mode (`display-mode` + `appinstalled` stamp). **Her three follow-up
calls on the renders, all built: (1) the REAL APP ICON previews above the line** (her idea —
`apple-touch-icon.png` at 46px, rounded 10.5px like the home screen will round it; she picked TOP from a
3-way icon render, `scratchpad/a2hsicon.js`); **(2) NO ✕**; **(3) NO retirement** — a 5-visit
self-retirement was built first as the no-✕ backstop, and **she explicitly removed it** ("I don't want
the retirement"): the whisper keeps gently inviting on every Welcome Back visit until she installs.
⚠️ Consequence she accepted: on iPhone, Safari can't detect a manual Add-to-Home-Screen install, so a
woman who installs but keeps visiting in the BROWSER still sees it there (the installed app itself never
shows it — standalone detection works). Told to her plainly; Apple offers no signal to close this.
Whisper family styling shared: block-level text for `text-wrap:balance`, centered true. `_syncA2hs()`
rides `updateWbScreen()` (the boot-path lesson). **Verified: `scratchpad/a2hs.js`, 26 checks** (desktop
silent, iOS wording + icon loaded/centered/rounded + no-✕ + glyphs + block, still showing on the 7th
visit + survives same-visit re-entry, faked beforeinstallprompt → "Add it now" → prompt() once →
accepted stamps + stands down, standalone silent, zero JS errors all paths) + hubs 46 · menu 82 ·
e2e 29 green after the change (full ten-suite sweep was green at #749). As-built:
`scratchpad/a2hsfinal.js` → `a2hsfinal-{iphone,android}.png`.
**Also this session: the Almira follow-up email was drafted and SENT by Cath** (LLC shows Active on Sunbiz,
Document L26000395689; asks what she needs for the TM filing + timeline to TMs and EIN; Cath cut the
registered-agent/scam-address question by her own call). ✅ **INDIE LAW REPLIED SAME DAY — see the
2026-08-05 legal update near the bottom (LLC docs delivered, TM word mark to final action steps).**

### ✅ WHAT SHIPPED 2026-07-31 (one day, PRs #702–#719): the API scare resolved (wrong login email — her
Anthropic login is GOOGLE SIGN-IN), "Checking stores..." + the try-harder search dial, Share Style Star +
Refine rows in the Menu, Privacy/Terms full-size, journey-ordered Menu + Start-here pill + first-reveal
refine nudge, the naming pass (Ask your Stylist / Your Wardrobe List / Your Wishlist + the VOICE RULE),
hub cards aligned to the Menu (Build stays), chat continuity fixed (no more "starts fresh" amnesia,
confirmed live by Cath), the Your Wishlist redesign (✕ left, row hearts retired, her B3 badge in the
Edit-family teal, header polish, honest lead copy) — **and the LLC confirmed ACTIVE on Sunbiz.** 🎉

### ✅ WHAT SHIPPED 2026-08-03 (the tail session): THE STORE TABLE IS 101 NOW — SAKS OFF 5TH REMOVED.
Cath's retail knowledge solved the sweep's one mystery: **Saks Off 5th has closed its online store entirely**,
so the "Site Offline" curl saw was LITERAL, not a bot wall. Removed everywhere: the `STORES` entry, BOTH its
aliases (`saksoff5thavenue`, `offthfth` — an alias to a missing key is the crash class from the rename lesson),
and `saksoff5th.com` out of `SEARCH_DOMAINS` in `style-ai.js`. ⚠️ **Count assertions updated 102→101 in
cowork3.js + searchchat.js — AND the derived counts don't ride a sed:** the pruned-list checks (list minus
blocked stores) moved 101→100 and 99→98 by hand; the first full-sweep run caught the one that was missed.
"Saks Fifth Avenue" (regular Saks) is untouched — Mall, luxury-routing rule, all of it. **The last 3
someday-taps happened same session:** ✅ **LANE BRYANT VERIFIED** (the app's `?q=` link worked perfectly, her
words) · 🔧 **TOMMY BAHAMA FIXED** `search?q=` → `search?text=` (the form her typed search produced; hostname
unchanged so `SEARCH_DOMAINS` needed no edit) · 🔧 **DSW FIXED — the very last store**: her typed search
produced the path form `dsw.com/browse/red+sandals` with a `+` joiner; since `getStoreUrl` emits `%20`, she
did ONE confirming tap (`/browse/red%20sandals` → real red sandals) proving both encodings work, so the app
uses the plain `u:'https://www.dsw.com/browse/'` path form with normal encoding — no special case needed
(the old `/en/us/search?q=` is retired). ✅✅ **STORE-URL WORK IS COMPLETE: all 101 stores are verified,
fixed, or proven by live use. There is no ask-Cath list anymore.** Full sweep green after the change
(cowork3 69 · searchchat 54 · menu 82 · nav 55 · e2e 29 · copy 41 · hubs 34 · followups 38 · sec 89 · affq 36;
affq flaked once on a timing check, clean on rerun). ▶ **Store-scope note for future work: every "102" in the
history below is now 101** — the standing SEARCH_DOMAINS rule is unchanged.
**LATER SAME DAY: THE WELCOME-SCREEN DESIGN SESSION HAPPENED — "HOW IT WORKS" 1-2-3 IS LIVE (her pick).**
▶ **Discovery first: the Sally FOUNDER LINE was ALREADY LIVE** — `.hm-founder` ("Hi, I'm Catherine. I've
styled women for over 20 years. I created this with love & intention ♥") shipped quietly bundled into #692
on 2026-07-30; the "parked" note here was stale. So the session was only the path. **Cath picked OPTION B
from a 4-way render** (`scratchpad/welmock.js` → `welcome-compare.png`; she asked for larger visuals — the
per-option 2x images `welcome-{current,a,b,c}.png` are the phone-readable format, use it next time): a
"How It Works" mini-section AFTER her founder line — 1 Take the style quiz · 2 Reveal your Style Portrait
(✅ REWORDED BY HER 2026-08-07 — was "Meet", which doubled with "Meet your stylist" on the same screen;
"Reveal" matches the portrait's real reveal-doors moment) · 3 Shop your style, each with a one-line sub. Built as `.hm-hiw` between `.hm-founder` and `#restoreSection`,
**header literally reuses the Or Explore divider pieces** (`.hm-divwrap`/`.hm-hair`/`.hm-divlbl`) so the
two can never drift. Gold-outline number circles (`.hiw-n`), rides the ssRise entrance at .38s. Verified
390+360 (visible, 3 rows, correct position, no overflow, zero JS errors) + full sweep green. ⚠️ **Two sub-lines
remain Claude's drafts** ("12 quick questions, no wrong answers" · "Stores and pieces picked to fit it") —
**she may reword; one string each in the markup.** ✅ Step 2's sub is HERS now (2026-08-07): "Your
signature style, made clear for you" — don't reword without her.
Note s-wel only shows to women without saved results, so the section naturally targets exactly the stranger
it's for. ⚠️ affq's B-section flaked once more (timing), green twice on rerun — a pattern now, worth a
deflake look someday.
**THE CONCIERGE ("your next step") IS APPROVED AND HER DISCOVERY ORDER IS RECORDED — renders made,
awaiting her pick (2026-08-03, evening).** Cath: "i love your concierge ideas, yes let's render those
versions". ▶ **HER ORDER, verbatim intent — this is stylist taxonomy, protect it:** Refine → Wardrobe List
→ Shop Your Style → Shop all items on Wishlist → What's Trending. **Analyze an Outfit + Ask your Stylist are
NOT journey steps — they are DAILY companions** ("always checking outfits... what to wear/what to pack/what
purse... is a constant daily thing"). Her rationale: shopping comes AFTER defining style, sizes, colors,
likes/dislikes and checking the list to see what is truly needed; trendy items sprinkle in "when she wants a
splash of current to look fresh". ▶ Design consequence: the next-step row walks her order; the daily tools
need their own kind of invitation (habit-flavored, not step-flavored) — open design question for the build.
**Renders:** `scratchpad/welbmock.js` → `nextstep-{current,a,b,c}.png` (per-option 2x, her preferred format):
A = slim "NEXT FOR YOU" card between greeting mirror and Shop mirror, with ✕ · B = first row INSIDE the Shop
mirror with a gold NEXT pill · C = Catherine's whisper, one cream italic line on the dark background under
the greeting, gold link + pink heart, with ✕. All show the Wardrobe List suggestion (draft copy: "My
checklist of 100 pieces shows what your closet is missing" / C: "100 pieces a complete closet could hold.
Heart what yours is missing"). ⚠️ Two render traps hit and fixed in the harness: escaping quotes into
&quot; inside innerHTML breaks SVG width attrs (icons explode to default size — use inline style widths);
and anything placed BETWEEN the wb mirrors sits on the DARK background, so ink-colored text is unreadable
there (C needed cream #E8E2D2).
✅✅ **SHE PICKED C AND IT IS BUILT + SHIPPED same evening — "CATHERINE'S WHISPER" IS LIVE.** Her catch on
the render: the wardrobe copy said "Heart what's missing" but **My List uses STARS** (the two-lists rule
doing its job) — fixed to "Star what's missing". **ALL FIVE LINES ARE FINAL, hers or blessed by her —
don't reword without her:** 1 Refine "Next, add your sizes, colors and faves. Defining preferences is how
we enhance our style ♥" (her rewrite) · 2 Wardrobe "Next, explore my wardrobe checklist, 100 pieces for a
well-rounded closet. Star what's missing and build yours like a pro ♥" (hers) · 3 "Next, shop your style.
Stores and pieces picked to match your Style Portrait ♥" · 4 "Next, open Your Wishlist, every piece you've
hearted in one place. Shop them all when you're ready ♥" · 5 "Next, see What's Trending, my picks of
what's in right now. A splash of current keeps your look fresh ♥" (her phrase "splash of current").
**Mechanics:** `#wbNext` between the wb mirrors (cream `#E8E2D2` italic, gold bold link `#F2D889`, pink
heart, ✕); `_WB_NEXT` walks her order; a step is done when she has VISITED the place — `ss_seen_wardrobe/
shopstyle/wishlist` stamped centrally in `show()`, trending = `ss_trending_seen` exists, refine =
`_hasRefined()`; ✕ skips that ONE step forever (`ss_nextskip` JSON) and hides the whisper for the visit
(the next visit offers the following step — instant replacement would feel like arguing with her ✕);
**the Wishlist stop only appears when wishlist.length > 0** (no dead ends); explored-everything = no
whisper at all. ⚠️ `_syncWbNext()` is called from `updateWbScreen()` NOT from show('s-wb') — the BOOT path
activates s-wb directly without show() (first test run caught exactly this). **Analyze + Chat deliberately
absent** (her daily-companions call) — a habit-flavored invitation for them is an OPEN design conversation.
Verified: hubs.js grew 34→46 (the full lifecycle: refine → wardrobe → shopstyle → wishlist-gated →
trending → nothing; ✕ persistence; zero JS errors), full sweep green all ten suites.
**HEADLINE WIDOW FIXED (her catch from the live page):** "Discover your signature style" was wrapping as
"Discover your signature / style" — one word stranded. `text-wrap:balance` on `.hm-h1` (the property
`.hm-body` already used) balances it to "Discover your / signature style" at every width, keeping the
italic phrase together. Verified 390/360/414.
▶ **HER NEXT QUESTION, SAME MESSAGE (product direction, conversation before building): "do we need
something similar once she has already taken the quiz — on the welcome back page or other places — to keep
guiding her along? I very much want our users to understand how to use the app and all its features."**
Assessment given: a surprising amount already exists (journey-ordered Menu, Start-here pill, first-reveal
refine nudge, honest routing, hub concierge order, the Menu itself born from her "she'll get stuck" worry).
The real gap named: **the Welcome Back hub treats the 3rd visit like the 30th** — nothing state-aware says
what she hasn't tried yet. Idea offered, NOT approved/built: ONE quiet state-aware "your next step" row on
Welcome Back (refined? → analyze; analyzed? → chat; etc.), one suggestion at a time, never a checklist —
plus the existing refine-hint `ss_refinehint` pattern as the template. Render options with her before
building anything.

### ▶ THE END-OF-DAY BRAINSTORM DECISIONS (2026-08-03, late — all conversation, nothing built yet)
Cath asked for open ideas ("maybe something we never even talked about"). Outcomes, each her call:
1. **CHAT SUGGESTION CHIPS ALREADY EXIST** (her memory was right): three of them at chat start —
   "Shift one notch" / "My essentials" / "Send a photo for advice" (`.chat-chip`, ~line 2672). ▶ The real
   opportunity identified: they are style-philosophy flavored; the DAILY/OCCASION flavor is missing
   ("dress me for a wedding", "pack me for a trip", "what goes with X"). **Waiting on HER list of the
   questions women actually ask her most — stylist taxonomy, do not invent.**
2. ✅✅ **"ADD TO HOME SCREEN" — BUILT AND SHIPPED 2026-08-05 (#749 + #750), the full render→pick→build
   cycle in one session.** See the 2026-08-05 entry at the top of this file for everything: her Option B
   whisper pick, HER wording, the app-icon preview (her idea), no ✕, no retirement (her explicit call),
   and the iOS/Android asymmetry as built. Nothing left to do here.
3. **Plausible walkthrough parked BY HER until after testers** ("It won't tell us anything yet" — right).
   Resurface at tester time.
4. **The search-chat "dialed in" bar: she is thinking on it this week** while testing more. Don't push;
   ask how testing went next session.
5. **She will nudge Almira this week** (TMs were "drafted and ready" July 27; a status ask is fair).
   Offered to draft the message if she wants.
6. ✅ **THE GRADUATION WHISPER IS APPROVED and SHE WANTS TO WRITE THE LINE.** After all five journey stops
   resolve, ONE final whisper hands her the daily habit (Ask your Stylist), then gone forever. Claude's
   placeholder ("You've explored it all. Remember I'm here for the everyday too, what to wear, what to
   pack, which purse. Just ask ♥") is explicitly NOT final — **wait for her line before building.**
   Mechanically: a 6th _WB_NEXT entry, when = all five done/skipped, tap → openChat() + stamp, ✕ → skip.

### ✅ WHAT SHIPPED 2026-08-01 (a light phone session with Cath): the Edit's above-the-products disclosure
shortened to the standard one-liner ("us" kept over "Style Star" — her question, talked through: matches the
app's we-voice everywhere else) and the line TUCKED against the first item (5px, measured) on BOTH the Edit
and Your Wishlist — her call from live screenshots, merged live as **#723**. And **NORDSTROM'S SEARCH URL IS
VERIFIED** (her address bar + the app's bare `?keyword=` link both confirmed) — the most important store in
the table, closed. **LATER: the MENU chip was covering the "style Star" letterhead on Refine your
preferences (+ the pref-done screen) and Analyze an Outfit — her screenshots.** Fixed with the FAQ/legal
pattern, then TUNED to her eye from the live site (#734): the Refine letterhead sits JUST below the chip
(`.pref-mast` margin-top 17px, ~6px clearance) with the Back button restored to the tight top-right via
the FAQ pattern (absolute top:5px right:8px); Analyze Photo keeps `.ph-mast` top 52px. A full-screen audit
(`chipaudit` pattern: chip rect vs every visible element, all screens, 390+360) found NOTHING else real —
the other flags are decorative rods/rails/light-effects that pass behind the chip by design. ▶ **HER
STANDING OFFER (2026-08-01): she is HAPPY to do more address-bar checks — ✅ all 3 someday-taps resolved
2026-08-03 (see the entry above); NOTHING remains, the whole table is closed.**
**EVENING: her critical-eye pass on the Analyze Photo page (#738), three decisions, all hers after honest
options:** (1) the page keeps **NO title** — "Style Star Photo Analysis" rejected as clinical lab-language;
the framed "Tap to share your photo" + "I'll style it, just for you" IS the headline and the Sally voice.
(2) **"Analyze your Outfit"** is now the name everywhere a DESTINATION is named (Menu + all 3 hub rows) —
the voice rule extended: it matches its group-mates Refine your Preferences / Ask your Stylist / Shop your
Style. The CTA button stays **"Analyze my outfit"** (her voice) and results keep "Analyze another outfit",
both deliberate. (3) **The hanging star STAYS** (the only boutique-world charm on that screen; cut decor
before content, but one still charm is inside the restraint budget). Letterhead tuning ended at `.ph-mast`
top 41px (#740, 15px chip clearance), Refine `.pref-mast` 17px with Back absolute right:13px — measured,
chip-audit clean. **Session ended here (2026-08-01 night, everything merged through #740); she'll open a
fresh chat next time.** **LATER SAME DAY: SUNGLASS HUT FIXED TOO** — her address bar produced `sunglasshut.com/?q=` (typed
search, no dropdown) and she confirmed the app's old `/us/search?q=` is DEAD (the Boden failure shape: path
retired). Store URL updated to `/?q=`; hostname unchanged so `SEARCH_DOMAINS` needed no edit. **AND WARBY
PARKER VERIFIED** — her own search leaves a bare `/search` in the address bar (the Sézane accept-but-never-
produce shape), but she pasted the app's exact `warbyparker.com/search?q=` form and confirmed real results.
**EYEWEAR IS FULLY CLOSED** (Quay + Sunglass Hut + Warby Parker, all three). Remaining address-bar asks:
SKIMS, Belk, TJ Maxx, Vuori, Ann Taylor.

### ✅ THE THIRD COWORK BRIEF SHIPPED (2026-07-31, evening — 6 items, one commit, security + bugs)
Cath pasted a third Cowork brief (security review + bug fixes). All six claims verified against the real code
first; all six built. **Two of its numbers were deliberately ADAPTED, and the reasoning matters:** the literal
"8 KB per message" cap would have killed the chat (the chat system prompt alone measures ~13-21 KB) and the
literal "100 KB body" cap would have killed Analyze an Outfit (photos are up to ~1.5 MB of base64). Shipped
instead: **100 KB applies to the NON-image part of the body, text blocks cap at 32 KB, images at 2.5 MB each,
max 3, absolute body ceiling 3.5 MB** — bounds abuse, breaks nothing real.
1. 🔒 **The search allowlist is SERVER-SIDE now** (`SEARCH_DOMAINS` in `style-ai.js`, 102 hostnames);
   client-sent `search_domains` is **ignored entirely** (it used to let a forged request search ANY domain on
   Cath's key). ⚠️ **NEW STANDING RULE: when a store is added/renamed in `STORES` (index.html), its hostname
   must ALSO be updated in `SEARCH_DOMAINS` in `netlify/functions/style-ai.js`** — nothing breaks if you
   forget, but search can't see inside that store until it's added. Also new in the function: a **rough global
   daily spend cap** (estimates each request's cost, refuses politely past `DAILY_SPEND_CAP_USD`, default
   $20/day; per-instance + in-memory like the rate limiter, a brake not bookkeeping) · a **per-instance memo of
   crawler-blocked stores** (the Gucci class of failure now costs ONE failed round trip per instance, not one
   per chat turn) · **`console.error` on search failures** so they finally show in Netlify function logs.
2. 🔒 **Chat XSS closed: ALL chat text goes through `_esc()` BEFORE `linkStores()`** — live path and
   restored-history path, plus the restored `photoThumb` attribute (only `data:image/*` reaches `src`; anything
   else renders a quiet "Photo shared earlier" chip). ⚠️ **`linkStores()` now EXPECTS escaped text** — store
   names are matched in escaped form ("H&amp;M") and unescaped before `resolveStore`/`getStoreUrl`; every
   href/label re-escapes on the way into HTML. **Each direct link's URL must now live on the NAMED store's own
   domain** (`_storeUrlMatches`, registrable-base compare) — "from Nordstrom [amazon.com/...]" discards the URL;
   the store name falls back to its normal storefront/search link, the foreign URL never becomes a tap target.
   Wishlist ids are **slug-validated in `_normalizeWardrobe`** (only the exact `slug~slug` shape `_wlMakeId`
   makes survives into onclick markup).
3. 🐛 **Routing honesty: ONE strict predicate `_hasQuizData()`** (name + 12 answers + portrait, same as
   fallbackInitialScreen) now drives `goHome`, `menuQuiz`, `menuShopStyle`, `menuRefine`, the Start-here pill
   AND the popstate no-state branch — "ss_data exists" was routing a name-only save (wishlist email ask) into a
   hollow Welcome Back. **`wbChat` and `_openShopStyleNow` only adopt a saved record with 12 real answers** —
   a name-only record used to overwrite `answers` with undefined, which bricked the chat (Send stayed disabled
   forever) and hung Shop your Style on an eternal spinner. Both repros are in the tests now.
4. 🐛 **Stream truncation is honest:** `_readChatStream` tracks `message_stop`; a stream that just ENDS (the
   ~60s platform cut) shows the fragment plus a quiet note ("That answer got cut off. Ask me to continue and
   I'll pick it right back up.", `.chat-cutoff`) and **the fragment is never persisted to ss_chat**. The chat
   fetch has a **75s AbortController timeout** and the Send button re-enables in a `finally`.
5. 🐛 **ss_chat stores ~10 KB thumbnails, never full photos** (`_chatShrinkThumb`, 160px JPEG, async; the
   on-screen bubble keeps the full-size image). Legacy full-size photos already sitting in a woman's ss_chat
   are migrated down on her next chat open. When history mentions a photo that is no longer attached, the
   system prompt gets an EARLIER PHOTOS note so the stylist asks to see it again instead of inventing details.
6. 🧭 **Navigation polish:** the self-link guard (showPhoto's pattern) added to the eight functions that lacked
   it (showStory, showFAQ, showDream, showShop, openWardrobe, showPrivacy, showTerms, openPrefs) — a footer/menu
   tap to the current page no longer kills its Back button. **The Menu drawer owns a history entry**: hardware
   Back just closes it; navigating from a row REPLACES the entry (menuGo deliberately does NOT pop first — an
   async history.back() would race the push); ✕/scrim pops it via `menuClose()`. The popstate handler also
   skips re-showing the SAME screen (kills a scroll-to-top jump). **"Find my results" disables while in flight
   and stands down only on a confirmed 200** — a network failure now says "that didn't go through" instead of
   claiming an email was sent.
- **Verified: new `scratchpad/cowork3.js`, 69 checks** (Part A runs the real function handler: server list of
  102 used regardless of client junk, all size-cap cases incl. a 22 KB system prompt and a 1.5 MB photo
  passing, the $-cap 429, blocked-store memo across requests, console.error firing; Part B in real Chromium:
  four XSS payloads inert on both render paths, domain cross-check case table, wishlist id fuzz, all name-only
  routing + the chat-brick and shop-hang repros, cut-off note shown + not saved, thumbnail size measured).
  **searchchat.js updated for the protocol change (54 checks), menu.js grew the drawer-history drive (82).**
  Full sweep green: cowork3 69 · searchchat 54 · menu 82 · nav 55 · e2e 29 · copy 41 · hubs 34 · followups 37 ·
  sec 89.

### ✅ THE FOURTH COWORK BRIEF SHIPPED (2026-07-31, late — affiliate-readiness + quiz batch, one commit)
All seven items verified against the real code, then built:
1. 🏷 **Every outbound product link now carries `rel="sponsored noopener"`** — the 8 JS-template surfaces
   (chat's four linkStores passes, _shopCard, Complete the Look, Mall cards, wishlist rows) AND the 17
   hardcoded Edit links (which had NO rel at all). ▶ **NEW STANDING RULE for Edit/Mall additions: every new
   outbound product link gets `rel="sponsored noopener"`** (added to the rules list below).
2. 🔗 **The two a.co Amazon shortlinks are canonical now**: `a.co/d/0h2VcwJc` → `amazon.com/dp/B0CWD1RYK3`
   (the stacking bangles), `a.co/d/04ATQcWA` → `amazon.com/dp/B0DWL5VV8Z` (the PRETTYGARDEN flowy maxi dress).
   Tracking params stripped per the standing rule. ▶ **Useful discovery: a.co redirects ARE reachable from
   the sandbox** (`curl -w '%{redirect_url}'` returns the full amazon URL) even though amazon.com itself is
   walled — future shortlink resolution needs no address-bar round trip.
3. 📢 **The Edit and Mall disclosures moved ABOVE the products** (Wardrobe's pattern, and the FTC-preferred
   before-the-links placement affiliate reviewers look for). Wording untouched — both keep their own longer
   founder-voice versions. Edit's sits after Cath's subtitle, Mall's after the sign, so neither reads as a
   page tagline (the 2026-07-29 placement trap).
   ✅ **UPDATE 2026-08-01, Cath's call from a live screenshot: the EDIT's version is now the standard one-liner**
   ("Some links may earn us a commission."). The long paragraph read as *"really big and cringey"* above the
   products — and it was redundant: her own subtitle ("Everything here is selected by me...") already carries
   the not-chosen-by-AI message in her voice, and "at no extra cost to you" is the same apologetic clause cut
   everywhere else on 2026-07-29. FTC/reviewers need placement + clarity, not length — placement is unchanged.
   **Only the MALL still keeps its longer founder-voice version.** The standard wording now lives in SEVEN
   places (grep `may earn us a commission` — still the edit list for Amazon's sentence at money-path step 7).
4. 📦 **`@netlify/blobs` removed from package.json** — nothing ever imported it; `"type":"module"` stays.
5. 💾 **Quiz autosave (`ss_quiz`)**: every slider move and question change saves `{answers, cur, t}`;
   restored on quiz entry AND straight back onto her question on a mid-quiz REFRESH (the browser preserves
   history.state across reload; no entrance curtain, same as deep links). ⚠️ **Resume only while FRESH
   (30 min)** — a refresh resumes exactly; a woman returning days later gets a clean quiz instead of
   question 7 of a forgotten attempt. Cleared on completion; a stale/malformed save is dropped on sight.
   `cur` and `answers` always save TOGETHER, so the old show-q1-write-slot-5 scramble stays impossible
   (followups.js test 1 updated to assert the new resume behavior, 38 checks).
6. ⬅️ **Each quiz question owns a history entry**: browser Back steps back one question instead of throwing
   her out; the on-screen back arrow rides the same stack (`prevQ` → `history.back()`), so the two can never
   disagree. Entering/resuming rebuilds the chain q0..qcur. Accepted trade-off, flagged: Back from a FRESH
   portrait now walks back through the questions rather than exiting in one press.
7. 🔗 **`/results` is a real route** (_ROUTES + netlify.toml, same pattern as the legal pages): with saved
   results it opens her portrait (strict `_hasQuizData`, honest welcome fallback + URL cleaned to `/`
   otherwise), and the portrait now shows `/results` in the address bar whenever it's open. ⚠️ Results live
   in localStorage, so the path only means something on HER device — **the share texts deliberately still
   link plain stylestar.app** (a friend following /results would land on the welcome). Same standing
   warning as the other routes: never change the path once it's been shared anywhere.
   **Bonus fix found by the new tests: browser Back from ANY deep-linked page (privacy/terms/story/faq/
   results) now lands on her real home** (Welcome Back if she has results) — the boot path restamps the
   initial history entry after fallbackInitialScreen picks the under-screen.
- **Verified: new `scratchpad/affq.js`, 36 checks** (static: all 25 outbound anchors carry the rel, ASINs
  canonical, blobs gone, toml rewrite present — the test server applies the REAL netlify.toml rules; in
  Chromium: disclosures visible above products, exit-and-return + refresh resume, stale-save fresh start,
  Back walking questions one at a time and exiting at q1, completion clearing the save, both /results
  states, in-app URL writing). **followups.js updated to 38.** Full sweep green: affq 36 · followups 38 ·
  cowork3 69 · searchchat 54 · menu 82 · nav 55 · e2e 29 · copy 41 · hubs 34 · sec 89.

## ▶ THE REST OF THE 2026-07-30/31 DETAIL (the sections the index above points into)

### ⭐ 0-NEWEST. 🧭 THE NAVIGATION FIX IS LIVE — merged as #697 + #698, and CATH LOVES IT
Cath picked **Option C** from the rendered footer comparison, then mid-build reconsidered the hamburger and
asked for one **in addition to** the footers ("the footers there is not room to list everything"). All three
pieces merged and live. **Her live reaction, verbatim-ish:** *"Oh wowww I LOVE the new menu chip top left...
so user friendly... One of my concerns has been that she will get stuck or won't see everything we have to
offer. I love this!!!"* (she liked the drawer font too). That concern — a woman getting stuck / not seeing
the offering — is the product worry the Menu answers; remember it when weighing future nav ideas.
- ✅ **HER LIVE TESTING FOUND ONE REAL BUG, fixed + merged same hour (#698):** she left a mid-way quiz via
  the new Menu and the **"1 of 12" progress bar followed her** onto the Analyze photo screen. The old exits
  (finish, back out of question 1) each hid the bar BY HAND; the new exits (Menu/logo/footer) sailed past
  those. **`show()` now owns the bar — visible on s-quiz, hidden everywhere else** — which also brings it
  back when browser Back returns her into a mid-way quiz. ▶ **The general lesson: adding new EXITS to a
  flow surfaces every piece of screen state that was only cleaned up by the OLD exits.** menu.js covers her
  exact repro (56 checks now).
1. **ONE standard footer everywhere** (replacing the eight sets): `Home ★ Shop ★ My Story ★ FAQ` + a quieter
   `Privacy · Terms` second row. ▶ **Every footer container carries `data-std-foot` and is filled at boot by
   `_stdFootHTML()` — ONE template, so the sets can physically never drift apart again. To change the footer,
   change that function and nothing else.** Containers keep their own class for placement only.
2. **Every brand logo goes home** (`.go-home` + `goHome()`): Welcome Back hub if `ss_data` exists, Welcome if
   not — the popstate branch, reused. Page-TITLE text logos (Mall sign, Edit title, "shop your style") are
   deliberately NOT tappable; only the brand marks are.
3. **The Menu** (her reversal, and it was reasoned, not a whim): the 07-29 audit ruled out a dropdown as a
   REPLACEMENT for visible nav; as an ADDITION nobody loses a path, and the footer genuinely has no room for
   all 13 destinations. ▶ **The trigger says "Menu" IN WORDS, never a bare ☰ icon — the mom lesson applied to
   the fix itself.** Fixed top-left chip (hidden on s-chat + the two loading screens); left drawer grouped in
   her hub language (Style / Shop / Build / About), Home on top, Privacy · Terms quiet at the end. Style Quiz
   routes returning women through `retakeQuiz()` (keeps her name, tracks `retake:true`), new visitors through
   `startQ()`. What's Trending lands straight on the trend tab. Drawer z 9610, deliberately BELOW the
   entrance curtain (9998). Navigating always closes it (`show()` removes `menu-open`).
- ⚠️ **Findings fixed during verification, don't undo:** (a) the FAQ/legal column is 248px at 360w and the
  main row needs 246px — zero headroom, so `[data-std-foot] .sf-row` gap drops to 8px under 375px; (b) a
  lighter quiet-row grey measured **4.4:1 on the FAQ cream and FAILED** — the quiet row keeps the main ink
  `#6f6a63` and is quiet through SIZE (12px), ~4.8:1; (c) `.faq-head/.pp-head` step down 40px so the fixed
  Menu chip never covers the letterhead logo (asserted disjoint at 390 AND 360).
- **Verified: `scratchpad/nav.js` 55 checks + `scratchpad/menu.js` 50 checks** (both drive the real app in
  Chromium: every screen's footer identical + visible, all links navigate, both goHome states, both menu
  states, contrast against real painted backgrounds, browser Back after goHome, zero JS errors), full sweep
  green (e2e 29 · copy 41 · hubs 34 · followups 37).
- ▶ **AFTER MERGE, Cath should check on her phone:** the chip position over the boutique screens (it floats
  over the framed rooms' top-left corner — fine in screenshots, her eye decides), the drawer feel, and the
  40px letterhead step-down. Any tweak is CSS-only.
- ▶ **Also this session:** the footer/logo-home comparison mockup that drove her pick lives at
  `scratchpad/navmock/` (id-scoped CSS, computed-style proof, honest 390px wrap finding on Option D).

- ✅ **HER SECOND LIVE PASS ADDED TWO MENU ROWS (#700):** she spotted that Style Portrait and Shop your
  Style were missing. Both added under the hub-mirroring groups: **Style Portrait uses `wbPortraitTap()`
  directly** (portrait if she has one, quiz if not) and **Shop your Style gets `menuShopStyle()`** with the
  same philosophy — a new visitor can't shop HER style before the app knows it, so it honestly routes to
  the quiz. ⚠️ For an un-refined returning woman, Shop your Style shows the **refine nudge first** — that is
  the hub behavior, deliberately identical; the first test run flagged it as a failure and it is not one.
  menu.js is now 61 checks (13 rows, both visitor states).
- ✅ **A 14th ROW: "Share Style Star" (2026-07-31, her ask — she wanted to send the site to one of her Jens
  without sharing her constellation/vision board).** `menuShare()` in the About group: native share sheet
  (`navigator.share`) with the plain `https://stylestar.app` link + the tagline; desktop falls back to
  clipboard copy + "Link copied!". ▶ **It shares the SITE, never her results** — a plain link carries
  nothing personal (results live in localStorage + behind the emailed token), and a test asserts no
  `?r=`/token ever rides along. Stays on the current screen; only the drawer closes. menu.js now 65 checks
  (14 rows). ⚠️ The share TEXT is the app tagline; if Cath wants friendlier wording it's one string in
  `menuShare()`.
- ✅ **A 15th ROW: "Refine your Preferences" (2026-07-31, HER CATCH while testing the share button).** It was
  a first-class row on every hub ("Add your sizes, colors and faves") and the drawer had simply missed it —
  an accident, not a decision. `menuRefine()`: `openPrefs()` for a woman with saved data, the quiz for a new
  visitor (same honest routing as Style Portrait / Shop your Style). menu.js now 67 checks (15 rows, both
  visitor states). A full audit against every screen id + hub destination found NOTHING ELSE missing:
  vision board / constellation are share overlays off the portrait (deliberate), "Restore your results"
  lives on Welcome where the woman who needs it lands anyway. ⚠️ With 15 rows the drawer's tail (Share,
  Privacy·Terms) sits below the fold on a phone — it scrolls (`overflow-y:auto`), fine, but don't add rows
  casually. ✅ **Privacy·Terms are now FULL-SIZE ROWS — Cath picked B from the rendered comparison**
  (`scratchpad/legalmock.js` → `legal-compare.png`) against Claude's recommendation of the quiet line, and
  her consistency instinct is a legitimate call for an 18-80 audience. The `.menu-legal` markup + CSS are
  GONE; the drawer is 17 rows and menu.js drives Privacy and Terms through the same loop as every other row.

### ⭐ 0-FLOW. 🧭 THE NEW-USER JOURNEY WORK (2026-07-31, from Cath's "what is the perfect flow?" question)
Her question, verbatim-ish: *"to get her to take the quiz and use the tools and get to the shopping the good
stuff what is the perfect flow? a new user might not know what to do and in what order."* The agreed journey
spine: arrive & get it → QUIZ (the foundation) → PORTRAIT (the payoff, email save) → REFINE (the step with
the least obvious reward but the biggest effect on shopping quality) → the good stuff (Shop your Style,
Wardrobe, Complete the Look) → the return loop (Analyze, Chat, Trending, Wishlist). ▶ **The app already
ENFORCES this spine via honest routing; this work makes the path VISIBLE.** She approved all four ideas;
three are BUILT and live, one is parked for a design session:
1. ✅ **Menu journey order:** the Style group now reads Style Quiz → Style Portrait → Refine your
   Preferences → Analyze an Outfit → Stylist Chat.
2. ✅ **"Start here" pill on Style Quiz** — gold, same family as the New pills (`.menu-start`,
   `#menuStartPill`), toggled in `menuOpen()`: shows ONLY when no `ss_data`, stands down forever once she
   has results.
3. ✅ **First-reveal "what's next" strip on the Style Portrait** (`#refineNext`, under the Save button):
   "Next step: make it truly yours · Add your sizes, colors and faves, so shopping fits you". Tap →
   `openPrefs()`; ✕ dismisses; either way sets `ss_refinehint` so it NEVER nags twice, and `_hasRefined()`
   keeps it away from women who already refined. `show()` owns its visibility (`_syncRefineHint()`), same
   pattern as the quiz progress bar. ⚠️ The strip's copy is Claude's draft; Cath may reword.
4. ▶ **PARKED FOR A SESSION WITH HER EYES ON IT: the Welcome-screen "How it works" 1-2-3** (Take the quiz →
   Meet your Style Portrait → Shop your style). **Do it TOGETHER with the long-parked Sally founder line**
   (both touch the welcome hero; a stranger should meet the stylist and the path in the same breath).
   Render options for her before committing — id-scoped mockup CSS, one tall labelled image.
- **Verified: menu.js is now 75 checks** (journey order asserted, pill on for fresh/off for returning, the
  strip's full lifecycle: shows un-refined, tap → s-pref, dismiss sticks across visits, refined woman never
  sees it). nav 55 · e2e 29 · hubs 34 still green. `scratchpad/flowshot.js` renders the preview
  (`flow-preview.png`) — ⚠️ the portrait's reveal DOORS (grey slabs + gold stars) cover everything until
  `#s-res` gets class `rv-open`; element screenshots of that screen are meaningless without it.
- ✅ **Share text SETTLED (2026-07-31, her words, her pick #3 of three she drafted):** "Sharing with you
  this fun style and shopping app, created by a real personal stylist." Sender's voice + the Sally
  differentiator; the link-preview card already carries the taglines, so the text no longer repeats them.
- ✅ **HUB CARDS ALIGNED TO THE MENU (2026-07-31, "let's do exactly what you suggested").** The principle
  she bought: **the Menu is the MAP (complete, journey-ordered, identical everywhere); the hubs are the
  CONCIERGE (contextual leads keep their place, but within a group the order matches the Menu).** What
  moved: portrait Shop card → Shop your style, Your Wishlist, Edit, Mall; portrait Style card → Refine,
  Analyze, Ask; photo-results Shop card → Your Wishlist, Edit, Mall (the contextual "Pull more in this
  style" above covers Shop-your-style); Welcome Back Style card (`_buildWbHubs` appends) → Portrait,
  Refine, Analyze, Ask. Kept: photo page's "Analyze another outfit" lead, WB Shop card (already matched).
  ▶ **BUILD STAYS, her decision after the analysis:** "build your wardrobe" is stylist differentiation;
  the answer to it "looking less than" is making it RICHER (the parked trending-items strip; product
  images at feeds), not dissolving it into Style/Shop. Full sweep green (menu 77 · hubs 34 · nav 55 ·
  e2e 29 · copy 41 · followups 37).

### ▶ PARKED FOR A BRAINSTORM SESSION (2026-07-31, Cath): THE SHAREABLE — vision board may go
Her words: the Vision Board *"seems irrelevant"* and she's thinking about DELETING it; the Style
Constellation is *"sort of cool but it's not a representation of what our app actually does."* She wants
**a really good, on-brand shareable** that encourages sharing on Instagram and with friends — a session of
its own, brainstorm first, no building. ▶ When it happens: the shareable should show what the app ACTUALLY
does (her point) — think portrait/archetype/motto-shaped, not abstract art; it rides the existing
`buildVisionBlob`-style share plumbing; and remember the share-text lesson (the sender's voice is part of
the shareable). **Do not delete the vision board until she says so explicitly after the brainstorm.**

### ▶ THE NAMING PASS (2026-07-31, Cath's consistency sweep — all live, and the VOICE RULE is the keeper)
Her observation: My Story is about Catherine, but the user's places were a mix of "My" and "Your". **The
rule we agreed on: when the APP names a PLACE, it says YOUR (Your Wardrobe List, Your Wishlist); when SHE
is speaking — buttons that finish "I want to..." — it stays MY ("Save my style details", "Shop my whole
list", "See my Style Portrait"). My Story stays My because that one really is Catherine speaking.** Apply
this rule to all future copy.
- **Renames, everywhere user-facing:** "Stylist Chat" → **"Ask your Stylist"** (menu; matches the hubs) ·
  "Your Wardrobe" → **"Your Wardrobe List"** (menu, 3 hub rows, page title incl. the personalized
  "_fn's Wardrobe List", FAQ, privacy policy, the wantlist AI prompt) · "My Wishlist" → **"Your Wishlist"**
  (menu, 3 hub rows, page title, the save toast "Saved to Your Wishlist").
- **Menu reorders (hers):** Shop group = Shop your Style → Your Wishlist → Style Star Edit → Style Star
  Mall (mall last); About group = **Share Style Star on top**, then My Story, FAQ.
- ⚠️ **Deliberately NOT renamed, flagged to her:** the "My List" tab inside Your Wardrobe List (her voice,
  claiming her own list — borderline under the rule, her call if it ever bothers her), and the her-voice
  buttons above. The `wardrobeData.wishlist` storage key and function names are untouched — copy only.
- **Verified:** menu.js 77 checks (labels + both new order assertions), hubs 34, copy 41, nav 55, e2e 29,
  followups 37 — all green.

### ✅ 0-RESOLVED. 💳 THE API-CREDIT SCARE IS OVER — THERE WAS NEVER A SECOND ACCOUNT (2026-07-31 morning)
The 2026-07-30 outage ("credit balance too low", every AI surface down together) ended simply: **Cath had
logged into console.anthropic.com with the wrong email.** Her real account signs in **through Google**, not
her main email — she'd forgotten, so the freshly funded "account" looked key-less and it seemed like a
two-account tangle. It wasn't. Once she signed in via Google it was one account: the funded one owns the
Netlify key. **No key swap ever happened, none was needed** — the live function probe confirmed recovery
first thing 2026-07-31. ▶ **Remember for any future console task: Cath's Anthropic login is GOOGLE
SIGN-IN.** Her setup stands: $20 credits + auto-reload with $500 limit and notifications.
- ▶ **Costs told to her (for the tester conversation later):** searching chat answer 5-10¢, everything else
  ~1¢; her 10-tester circle ≈ $10-20 for a first month; ~100 active users ≈ $30-80/mo; the searching chat
  is the cost lever if it ever needs tuning. One $100 affiliate purchase (~$3-10 commission) pays for a
  woman's whole month of AI many times over.
- ▶ The diagnostic pattern (curl the LIVE function with `Origin: https://stylestar.app`) answered in one
  call again — reuse it any time an AI surface misbehaves.

### ⭐ 0-LATEST. 🔎 THE SUEDE-BAG RE-TEST HAPPENED (2026-07-31) — honest, not yet ChatGPT-good
Cath ran the tan-suede-baguette photo test on her phone against the live search chat. **The result was an
honest dry run:** the stylist searched, could not confirm an exact tan elongated baguette on a real product
page, SAID SO plainly, and pointed her to the Mango suede collection at Nordstrom + a sensible search
strategy, ending with "Want me to try a more specific search for one of those brands?" **Her verdict: "more
honest results but still not as good as what chat came up with."** Screenshots are in the 2026-07-31 chat.
- **Read on it, told to her:** this is the honesty rule working (no invented Miu Miu this time) — but
  ChatGPT queries a merchant CATALOG and essentially can't come up dry, while web search on shape+material+
  color sometimes finds nothing it can verify. The pre-merge live test of the same scenario DID find the
  JW PEI Nova Baguette (~$79, real Nordstrom URL, 16s) — **runs vary; feeds are what buy consistency.**
  The gap is structural until product feeds (affiliate approvals). The sequencing she chose stands.
- ✅ **The "try harder" dial is ON (2026-07-31, her call: "let's do the try harder"):** the chat search
  prompt now says a dry search should be rephrased and retried — broader shape word, drop the least
  important detail, or lead with material — up to the server's max_uses of 3. The "genuinely good result
  in front of you" brake stays, so it only tries harder when it found NOTHING. Costs a few extra seconds
  + ~2¢ only on dry runs. ▶ **Watch her next few tests to see if dry runs convert into finds.**
- ✅ **The waiting message is now "Checking stores..."** (was "Checking your stores for the real thing...")
  — her call, shipped same morning with the searchchat.js assertion updated (55 checks green).
- ✅ **"Pick up our chat" AMNESIA FIXED (2026-07-31 afternoon, her screenshots).** Tapping the chip after a
  restored conversation got "I don't have a previous conversation to pick up from, since each chat starts
  fresh for me." ▶ **The code was innocent, verified by capturing the real payload in Chromium: the
  restored history WAS in the messages array.** The failure was interpretive: the model read "continue
  where we left off" as pointing at some OTHER conversation it couldn't see. Fix = a CONTINUITY block in
  the chat system prompt (history above is real and remembered; never comment on memory or fresh starts;
  carry the last topic forward). First wording still let it say "this is the start of our conversation" —
  the shipped version bans ALL memory meta-commentary, verified 3/3 against the LIVE function with a
  restored-history payload. ▶ **Lesson: when a model misbehaves, capture the real payload first — prompt
  fixes and code fixes look identical from a screenshot.** ✅ **CATH CONFIRMED IT LIVE same afternoon**
  ("Ok great that worked"): the stylist resumed with "We were looking at the suede barrel bag options...
  the Coach Suede Barrel Bag from Nordstrom (~$195) is still my top pick." Her two notes from that run:
  (1) the bare **Coach** link went to coach.com with no search — that is the deliberate "storefront door"
  behavior for store names mentioned in prose (the ITEM link was the Nordstrom one, which landed on the
  right bag); flagged to her that quieting brand-home links next to an already-linked item is a possible
  polish, her call, not built. (2) **Match precision is still the gap**: a barrel bag is not her photo's
  elongated baguette, "top pick based on shape" stretched the match bar — same structural story, feeds
  are the cure. Her verdict stands: "Chat's answer still was way better."

### ▶ CATH'S TWO NEW ITEMS (2026-07-31, parked by her — "later when I am at my desk")
1. **📧 Welcome + restore emails: shrink the sub-header line.** Her words: it *"looks too large like it is
   shouting."* Both emails get the same slight edit. This is a MAILERLITE EDITOR task, so it needs her at
   her desk; Claude's role is guidance. ⚠️ Remember the traps from 0b when she does it: re-check the
   SUBJECT after any template/design step (choosing a design overwrote it once), the hero block's slots
   are fixed (heading → text → button, sign-off lives in "Additional text"), and **never test the welcome
   automation with a previously used address — use a fresh `+` alias**, or the automation's Test button.
2. **👕 Wardrobe "Ideas" searches bleed across categories — she wants to TALK about it, not build yet.**
   Her live find (quality-gate item 6 doing its job): she put **White tops** on her list and the Ideas
   carousel offered **dressy going-out tops and tank tops** inside that search. Her point: those belong to
   ANOTHER category on the checklist, so an item's Ideas should stay in ITS lane. ▶ When this conversation
   happens, bring the mechanics: the carousel prompt is built by `_wardrobeIdeaGen()` from the item name
   alone, so "White tops" gives the model the whole tops universe; the checklist's own category structure
   (the 10 categories) is sitting right there and could scope the prompt ("everyday white tops — not
   going-out tops or tanks, those are their own list items"). **Get her definition of each category's
   boundaries first — she is the taxonomy authority, same rule as the store tags.**

### ⭐ STILL THE STANDING NEXT THINGS
The tester-invite gate stays hers (see decision 3 below). The suede-bag re-test HAPPENED (2026-07-31, see
0-latest below); the waiting-message and pace questions are now BOTH settled.

### ▶ THREE DECISIONS FROM THE 2026-07-30 WRAP-UP (recorded verbatim-ish, they gate future work)
1. ✅ **BOTH SETTLED 2026-07-31 after her live re-test.** Pace: "The wait felt fine not too long." Wording:
   the message is now **"Checking stores..."** — her call, and the reasoning matters: *"I feel like the 102
   stores is almost restricting I mean she will want us to search the whole world if she is looking for
   something."* ▶ **That is a product stance, not just copy: don't SURFACE the 102-store boundary to the
   user.** The allowlist stays (it's the brand + the money), but the woman shopping shouldn't feel walls.
   Weigh future copy against this.
2. **Navigation is the next lever** (above).
3. **HER TESTER LIST EXISTS — she named the 10 in chat for accountability:** Mom, Ellen (sister), Maryanne
   (daughter), Jen (best friend), other Jen, Peggy, Danielle, another Jen, Nikki, Jackie. (Three Jens — when
   the invite list is ever written up, distinguish them properly.) **Her stated gate for actually inviting
   them:** the searches aren't dialed in enough yet — her mom loved clicking links, but links that land badly
   would annoy testers who won't "get" that affiliates/feeds come later. That's legitimate sequencing, not
   avoidance: the gate concretely = search-chat quality proven by her own continued testing (+ eventually
   feeds). **Honor it, and revisit the invite question when she reports a genuinely good test run.**

### ⭐ 0-newest. 🔎 THE STYLIST CHAT CAN SEARCH REAL INVENTORY (built 2026-07-30, Cath's explicit call)
After the ChatGPT comparison (see the 0c input below), Cath said *"I definitely want to do this. It will add
trust and more discernment to the stylist chat."* **Built on `claude/style-star-continuation-7ul18d`, verified
by 40 new checks, NOT yet merged — she should run her suede-bag test live after merging.**
- **What it is:** the chat request now carries `search:true` + a domain allowlist, and `style-ai.js` adds the
  Anthropic **web search tool** (`web_search_20250305` on the existing `claude-sonnet-4-6`) — so the
  stylist can look at real product pages before recommending. ▶ **Every search is restricted via
  `allowed_domains` to the 102 STORES hostnames** — built client-side by `_searchDomains()` from the real
  STORES table (one source of truth, nothing to drift on a rename), validated + capped server-side.
- ⚠️ **THE BASIC SEARCH VARIANT IS DELIBERATE — do not "upgrade" it.** The newer `web_search_20260209`
  (dynamic filtering) writes code-execution rounds between searches; a live run spent 61s in that machinery
  across 5 searches WITHOUT EVER WRITING A WORD, and ▶ **the streamed function response gets hard-cut at
  ~60s** (measured twice; stream ends mid-message, `stop_reason` never arrives, page correctly shows the
  friendly error). Basic search goes query → results → answer; `max_uses` is 3 and the prompt says one
  search is usually enough, two at most. If answers ever feel slow again, look HERE first.
- ⚠️ **THE SECURITY SPLIT, keep it:** the client supplies only the domain LIST; the server builds the tool
  config itself, fixes `max_uses: 5`, validates hostnames by regex (a URL or path → 400), and **never forwards
  client-supplied `tools`** (tested). Origin gate + rate limit unchanged. Worst-case forged request = 5
  searches (~5¢) inside the same gates as any AI call.
- ▶ **SEARCH RESPONSES STREAM (SSE pass-through), and that is load-bearing twice:** (1) a searching answer can
  run past Netlify's synchronous function time limit — buffered JSON might just time out; (2) the page shows
  **"Checking stores..."** (Cath's wording, 2026-07-31) the moment a `server_tool_use` block arrives, then renders
  the reply progressively — a 15s answer feels like service, not a hang. Non-search calls (all other AI
  surfaces) are byte-for-byte unchanged; a JSON response still renders via the old path, so the page degrades
  gracefully against an old function build (tested).
- ⚠️ **CATH'S SECOND TEST EXPOSED THE REAL FLAW (2026-07-30): a store-search link WASTES the search.** The
  stylist named real-sounding items, but the tap rebuilt a SEARCH for the name — Madewell's box couldn't find
  "Brioche Mini Shoulder Bag" (6 woven bags), Revolve dumped 904 loose items. Her verdict: *"What chat gpt
  offered was way superior."* **The fix: the stylist now emits the EXACT product URL it saw, in a marker —
  "item from StoreName (~$price) [https://...]" — and `linkStores` pass 0 turns it into the tap target**
  (marker never shown; `_chatSafeUrl` allows only http(s) into the 102 store domains, incl. subdomains;
  off-list / javascript: / stray markers are stripped; everything else falls back to the classic search link).
  Restored history renders identically (same choke point). ▶ **Verified LIVE before merging:** 16s, 2
  searches, ONE excellent match (JW PEI Nova Baguette from Nordstrom ~$79) with the real product page URL,
  on-list. The prompt now also holds a match bar: shape/material/color must genuinely match, one excellent
  match beats three loose ones.
- **Prompt rules (chat only):** search only when she wants a real item / something like her photo; recommend
  ONLY items actually seen, real product name + real price, "item from StoreName (~$price) [exact URL]".
  Never invent, never pad with weak matches, never mention searching or tools.
- ⚠️ **FOUND ONLY LIVE (Cath's first test failed twice, 2026-07-30): A STORE CAN BLOCK ANTHROPIC'S CRAWLER,
  AND ONE BLOCKED DOMAIN IN `allowed_domains` FAILS THE WHOLE REQUEST** — "The following domains are not
  accessible to our user agent: ['gucci.com']". **Gucci blocks it today; which stores block is THEIR choice
  and can change any day, so it must never become a hardcoded exclusion list.** The fix is self-healing:
  the function parses the blocked domains out of the error, prunes them, and retries (max 3 calls). Search
  simply cannot see inside a blocking store; the other 101 keep working (verified live). ▶ **Debugging
  pattern that solved it in minutes: POST to the LIVE function from a script with `Origin:
  https://stylestar.app` set** — the function passes the real API error through, so the answer was one
  curl away. Sandbox stubs can never catch this class of failure.
- ⚠️ **KNOWN LIMITS, told to Cath:** ~5-10¢ and 10-20s for a searching answer; no images/stock/size (feeds
  territory); rare `pause_turn` (server loop cap) would end an answer early — accepted for v1, revisit if seen.
  ⚠️ **Live behavior is unverifiable from this sandbox** (deploy previews can't spend the production-scoped
  key), so the real test is: merge → Cath re-runs the tan-suede-baguette photo test on her phone and compares
  against the ChatGPT answer saved in the 0c section.
- **Verified by `scratchpad/searchchat.js`, 40 checks:** Part A runs the REAL function handler in Node with
  Anthropic stubbed (tool built server-side with fixed caps, domains lowercased/deduped/validated, injected
  tools dropped, SSE passed through verbatim, API error → JSON, origin gate on the search path); Part B drives
  the REAL chat UI in Chromium against a genuinely STREAMING fake endpoint (Playwright routes can't drip-feed —
  the harness http server implements the endpoint): searching status mid-stream, progressive render, final
  message linkified + saved, JSON fallback, error path, zero JS errors. Full sweep still green
  (followups 37 · e2e 29 · copy 41 · hubs 34).
- ✅ **Also this session:** My Wishlist row (live count pill + subtitle) added to the Style Portrait and photo
  results Shop hubs — Cath's ask from 2026-07-29 — via a shared `[data-wl-sub]`/`[data-wl-count]` sync
  (`scratchpad/hubs.js`, 34 checks).

## ▶ PREVIOUS SESSION NOTES (2026-07-29)

### ⭐ 0-new. ✅ THE SECOND COWORK BRIEF SHIPPED (2026-07-29, evening) — 8 follow-ups, two commits
Cath pasted a second Cowork brief (7 numbered as "seven", actually 8 items). **Every claim was verified against
the real code before building, and all 8 were accurate.** Two commits on `claude/claude-md-cowork-message-k0ve4c`:
security first, then product.
- 🔒 **COMMIT 1 (security):** (1) **The GET-by-email lookup is constant-time now** — both outcomes wait out the
  same 1200ms floor. ⚠️ **The brief asked for fire-and-forget and that was deliberately NOT done:** a Netlify
  function can be frozen the moment its response returns, so an un-awaited `sendRestoreLink()` would sometimes
  silently never send — breaking the restore email to hide a side-channel. The floor closes the stopwatch instead;
  only an unusually slow MailerLite call can peek past it (accepted tail). ▶ **Visible consequence: "Find my
  results" now takes ~1.2s to confirm.** That is the security feature working, not a slow bug. (2) **Cath can
  action a deletion from a terminal**: a valid `x-admin-secret` bypasses the origin check for DELETE only
  (constant-time compare; the exact curl command is in a comment above `isAdminReq()`). (3) **Restore links have
  a 5-min per-ADDRESS cooldown** (lives inside `sendRestoreLink`, marked before the send so concurrent requests
  can't double-send; MailerLite's 24h rule remains the backstop). (4) ⚠️ **The "one deliberate difference" from
  0a below is GONE**: the `*.netlify.app` host restriction is backported into `style-ai.js`, closing the
  free-Claude-proxy hole on Cath's API key. Deploy previews verified still working.
- **COMMIT 2 (product):** (5) **`startQ()` now resets `cur=0`** — leaving the quiz mid-way (browser Back, a
  footer link) and restarting used to show question 1 while writing answers to the wrong slots and jumping ahead;
  a scrambled-archetype bug that was live. (6) **`colorsSkip` is REMOVED — Cath's explicit call** (asked: wire a
  dislike tap state vs delete; she chose delete). Nothing could ever populate it, so every prompt promising
  "colors she skips" was a false claim to the model. The `.hate` CSS, the field, the prompt line and SEVEN prompt
  phrases are gone (one hid in the wantlist prompt with different wording, one in the chat prompt — **grep for
  the CONCEPT, not one phrasing**). A colors-to-avoid feature can return later as a considered design. (7)
  **`filterNeverWear()` is the never-wear GUARANTEE**: prompts said the rule was absolute but nothing checked
  what came back; now anything matching her never-wear chips, pattern chips, or comma-separated hard-no phrases
  is dropped before rendering, on **all five surfaces** (genOutfits, shopMyStyle, _shopStyleGen, _wardrobeIdeaGen,
  _renderShop). Chips match plural↔singular; free text matches per comma phrase, never word-by-word ("no crop
  tops" must not kill every top). ⚠️ **The brief also asked to "request a replacement" for dropped items — NOT
  built**, deliberately: a second AI round-trip per violation for a rare case, and the "Show me different options"
  refresh already covers it. She just sees 5 cards instead of 6. Revisit only if violations turn out common. (8)
  **Plausible custom events**: Quiz Started (`retake:true` on retakes) / Quiz Question (number) / Quiz Completed /
  Preferences Saved (fires when step 5 completes) / Photo Analyzed (`partial` flag) / **Product Click** — the last
  via ONE delegated listener on external links (retailer = link domain, surface = screen id), so every current
  and future shopping surface is covered without per-card wiring. **No event ever carries her answers, name, or
  email** — a test asserts it.
- **Verified: `sec.js` grew 55→89 checks** (constant-time within 150ms measured with MailerLite latency stubbed
  in, cooldown across a patched clock, terminal-curl admin cases, secret does NOT open GET, style-ai forged-host
  cases), **new `followups.js` 37 checks** in real Chromium (the quiz restart bug driven end to end, the filter
  on the real render paths, every event asserted), and **e2e 29 + copy 41 still green** (copy matters — prompts
  were edited).
- ▶ **Two things for Cath to know:** the ~1.2s "Find my results" confirm above, and **Plausible now has custom
  events** — her dashboard (plausible.io) will start showing quiz funnel + which retailers get clicked from
  which screens. Nothing to configure; events appear as they happen.

### ⭐ 0a. 🔒 `user-data.js` IS LOCKED DOWN (2026-07-29). Read before touching saving or restoring.
Cath brought two briefs back from a Cowork conversation — a security review of `user-data.js` and a privacy-copy
rewrite. **Both were accurate, checked line by line against the real code.** The security one was urgent and is
now done; the copy one is the natural next piece of work.
- ⚠️ **WHAT WAS WRONG: an email address was treated as a password.** `GET ?email=<anyone>` returned that woman's
  whole record — name, sizes, fit, shoe width, loved colours, never-wear list, portrait, wardrobe and wishlist —
  and `Access-Control-Allow-Origin: '*'` meant **any other website's JavaScript could make that call**. `POST`
  had the same gap in reverse: anyone could overwrite anyone's profile. **Only four people had saved profiles
  (Cath, her mom, her sister, her friend Jennifer), she confirmed they don't mind, so no notification was owed.**
  At real scale this would have been a genuine breach.
- **▶ THE FIX IN ONE LINE: an email now gets you a LINK, never DATA.**
  - `?token=` returns her results. `?email=` returns **the identical response whether or not the account
    exists** — otherwise the endpoint stays an enumeration oracle, a way to check who uses Style Star.
  - `POST` creating a **new** record is open (that's a first save, and it returns a token). `POST` over an
    **existing** profile needs that token. Softening: a record with no `portrait` was never a finished profile,
    so a real first save can take it over — that's the squatter case, and it is a `TODO`, not email verification.
  - Tokens now carry an **issued-at stamp and expire after 30 days**. A forwarded welcome email was previously
    permanent access. **Legacy tokens (a bare email, pre-timestamp) are still honoured** so links already sitting
    in sent welcome emails don't break; there's a `TODO` to drop that support around November.
  - **Rate limiting** on both functions (20/min per IP on `user-data`, 30/min on `style-ai`, in-memory).
- ⚠️ **ONE DELIBERATE DIFFERENCE FROM `style-ai.js`, and it matters.** Both share the origin check, but
  `style-ai` allows **any** self-reported `Host` (for deploy previews). Copying that verbatim into `user-data`
  left a hole: a non-browser client can set `Host` **and** `Origin` to its own domain and walk through.
  `user-data` now allows a self-host **only when it matches `*.netlify.app`**. **The test caught this, not
  review** — the first run "passed" the cross-origin check for the wrong reason. Previews still work (tested).
  ▶ **UPDATE, later 2026-07-29: the difference is GONE** — the restriction was backported into `style-ai.js`
  (see 0-new above), so the two checks are identical again. Keep them that way.
- ⚠️ **THE ORIGIN CHECK IS A SPEED BUMP, NOT AUTHENTICATION.** `Origin` and `Referer` are trivially forged. It
  sits **in front of** the token checks, never instead of them. Don't ever let it be the only guard.
- ▶ **THE ONE REAL BEHAVIOUR CHANGE, tell Cath if she notices it:** typing an email into "Find my results" no
  longer restores inline. It now says *"Check your email — your link back to your results is in the welcome
  email we sent you."* **That is true today** because `addToMailerLite` already writes a `restore_token` field
  on every save and the app already exchanges `?r=<token>`. The message is **identical for an address with no
  account**, on purpose. Consequence: a woman who deleted her welcome email is stuck until the on-demand send
  is wired (see 0b).
- **Client side:** one shared `saveUserRecord()` replaced five hand-rolled POSTs, so the token logic lives in
  one place. It stores `ss_token` from the first save and sends it on every later save; `autoRestoreFromLink()`
  writes it too, **so a woman restoring on a new phone can save again immediately** (tested — this was the
  regression most likely to bite).
- **Verified by two suites, 78 checks, all passing.** `scratchpad/sec.js` (55) runs the **real handler** with
  Supabase and MailerLite stubbed: no data by email, identical bodies for existing vs unknown, tampered /
  truncated / expired / legacy tokens, cross-origin and forged-Host rejection, deploy previews still working,
  another account's token not unlocking this one, rate limiting per IP. `scratchpad/e2e.js` (23) drives the
  **real `index.html` in Chromium against the real function**: save → token stored → save again → stranger
  refused → restore from the emailed link on a fresh browser context → save again from that device → expired
  link refused → zero JS errors.
- 🔎 **FOUND WHILE TESTING, pre-existing and deliberately NOT fixed** (the brief asked for a small diff):
  **`saveUserData()` and `saveUserDataPhoto()` are dead code.** They read `stayInput` / `stayName` / `stayForm`
  / `staySection`, and **none of those ids exist in the markup any more**; nothing calls either function. They
  would throw if wired to a button. Worth deleting in a tidy-up session, not in a security diff.

### ⭐ 0b. ▶ STILL OPEN AFTER THE LOCKDOWN — the two follow-ups
1. ✅ **On-demand restore email — CODE IS BUILT, waiting on ONE thing Cath does in MailerLite.**
   Cath confirmed her welcome email is triggered by **"when subscriber joins a group"**, which is the most basic
   MailerLite trigger and settles the whole approach — **no plan upgrade, and no dependency on a field-update
   trigger.** Her plan (the "Comfort plan", 500–1,000 subscribers, 10,000 emails/month) is far more than enough.
   - **How it works:** `sendRestoreLink()` writes a fresh `restore_token` onto her subscriber record, then adds
     her to a **second, separate group `Style Star Restore Requests`** — and that join is what fires the
     automation. Deliberately NOT the signups group, or asking for a link would re-send the welcome email.
   - ⚠️ **THE NON-OBVIOUS BIT: she is REMOVED from the group first, then added.** MailerLite fires the trigger
     on the *join*, so a woman already sitting in the group would ask for a link and **silently get nothing**.
     Leaving and rejoining makes every request a real join. A test asserts the DELETE happens before the POST,
     and that asking twice joins twice.
   - The group is **created via the API if it doesn't exist**, so the first request can't fail on a missing group.
   - ▶ **WHAT CATH STILL HAS TO DO (the only blocker):** build an automation in MailerLite triggered by joining
     **`Style Star Restore Requests`**, whose email links to `https://stylestar.app/?r={$restore_token}` — the
     same field her welcome email already uses.
   - ✅ **AND THE STRING HAS NOW CHANGED, because it became true.** It said *"your link is in the welcome email
     we sent you"* while the automation was still being built, then became **"we've just sent you a link"** the
     moment Cath activated it and the test passed. It **still names the welcome email as a fallback**, which is
     not padding: the 24-hour rule below means a second request in one day sends nothing, and the welcome email
     is the only route back in that window. Same principle as Amazon's required sentence and the Anthropic
     training claim: the copy tracks what is actually true, and changed the day the truth changed.
   - ✅ **CATH BUILT THE AUTOMATION (2026-07-29) AND IT IS TESTED END TO END.** She added herself to the group
     manually, the email arrived, and **the gold button landed her in her Style Portrait**. The whole chain is
     proven: request → group join → automation → token → restored results.
   - ⚠️ **MAILERLITE SENDS EACH EMAIL ONLY ONCE PER 24 HOURS PER PERSON**, and says so in the re-entry settings:
     *"If a customer is set to receive the same email again within 24 hours, they will be removed from the
     automation."* **This is a platform limit, not a setting** — it cannot be coded around. So a woman who asks
     twice in a day gets one email. Accepted deliberately: it is sane anti-spam, and the app's copy also points
     her at the welcome email, which is a real fallback inside that window. ▶ **Consequence for testing: never
     test the restore email twice in a row** — the second send is suppressed and it looks like the re-entry
     setting is broken when it isn't. Use the automation's **Test** button instead.
   - ⚠️ **TWO SETTINGS THAT FAIL SILENTLY, both found only by looking at the real screen:** *Allow subscribers
     re-enter automation* defaults to **OFF** (so each woman could get a link once, ever), and once ticked,
     *Time for re-enter* defaults to **"Add delay 1 day"** rather than "As soon as they match the triggers".
     Both are now correct. Neither would have raised any error.
   - ⚠️ **PICKING AN EXISTING EMAIL AS THE DESIGN OVERWRITES THE SUBJECT AND THE EMAIL NAME.** Cath set the
     subject correctly, then chose the welcome email as the starting design, and the first live test arrived
     titled **"Welcome to Style Star"**. **Re-check the subject AFTER choosing a template, not before.**
   - **The email body lives in a "Standard hero" block**, whose slots are fixed (heading → text → button). The
     button cannot be dragged and there is no typing below it. The sign-off goes in the block's
     **"Additional text"** toggle, which is the slot underneath the button.
   - ✅ **Picking an existing email as the design COPIES it, it does not move it.** Cath's welcome automation was
     untouched afterwards: still Active, still triggered by *Style Star Signups*, **25 completed**. Checked
     because it was the obvious thing to fear, and it was unfounded.

### ⭐ 0b-ii. ⚠️ NEVER TEST A SIGNUP EMAIL WITH A PREVIOUSLY USED ADDRESS (learned the hard way 2026-07-29)
Cath tested a fresh save with an address she had used in June and then deleted. **The restore email arrived; the
welcome email did not.** Half an hour went into suspecting the code and the welcome automation. Both were fine.
- ▶ **THE CAUSE: MailerLite's delete is a SOFT delete.** Her save did not create a subscriber, it **restored**
  the June one, *with its group memberships intact*. Her activity log showed `Subscriber was restored` and **no**
  `Added to group Style Star Signups` event — because she was already in that group from June 23.
- **The welcome automation fires on JOINING the group.** No join, no trigger, no email. Exactly the same trap
  that `sendRestoreLink()` engineers around by leaving the group before rejoining. **The welcome flow must NOT
  copy that trick** — re-welcoming an existing subscriber is wrong; this is correct behaviour, not a bug.
- ▶ **HOW TO TEST PROPERLY: use a `+` alias** (`cathellspermann+test2@gmail.com`). MailerLite treats it as a
  brand-new subscriber and it still lands in her normal inbox. **A deleted address is not a fresh address.**
- ▶ **THE DIAGNOSTIC THAT SOLVED IT, reuse it:** the subscriber's **Activity log** in MailerLite is a timestamped
  history of every group join, send, open and delete. It answered in seconds what code reading could not.
- ✅ **THEN PROVEN CLEAN: Cath re-tested with a truly fresh `+` alias and BOTH emails arrived** (welcome on save,
  restore on request). The whole email system is verified end to end with no asterisks.
- ✅ **CATH REWROTE THE WELCOME EMAIL HERSELF (2026-07-29, same day) and it shipped as written — zero copy
  notes.** It opens with the 20-years-of-real-clients line (the Sally differentiation on the FIRST touchpoint),
  then five emoji bullets that map to real features (chat / photo feedback / Mall + Edit / wardrobe checklist /
  Style Portrait), closes "You deserve to be your very own style star." Every claim checked true against the
  app. **Her copy instincts needed no editing — remember this before "improving" her words.**
  ✅ **CONFIRMED BY CATH IN THE EDITOR (2026-07-29):** the rewritten email's button still links to
  `https://stylestar.app/?r={$restore_token}` and the subject survived the rewrite. **The email system is
  fully closed out — welcome and restore both live, both verified, no open checks.**
  ▶ **Related honesty note:** tokens now expire after 30 days, so a welcome email's button quietly dies a month
  after signup. By design (forwarded email ≠ permanent access); she just requests a fresh link. **Never add a
  "keep this email forever" line to the welcome copy.**

### ▶ THE RESTORE FORM STANDS DOWN AFTER SENDING (2026-07-29, Cath's design catch)
Cath, testing on her phone: the big black **FIND MY RESULTS** button looked *"too big/too harsh"* sitting above
the quiet "check your email" note — and she asked whether it should disappear once tapped. **She was right, and
it shipped:** after a successful send, the whole ask (helper line + email field + button) hides and only the
confirmation text remains, with a **"Typed the wrong address? Try a different email"** link that restores the
cleared form (never a dead end — and it matters, because the wrong-address case is real: the message claims a
send that never happened). `showRestore()` always reopens in the asking state via `restoreAskAgain()`.
- **The principle, worth reusing:** once a form has done its job, its call to action should stand down — a loud
  button above a quiet confirmation is the loudest thing on screen at the moment it means least.
- ⚠️ **TEST LESSON (again the false-negative shape):** the first visibility assertion PASSED for the wrong
  reason — the e2e test had never called `showRestore()`, so `#restoreForm` was `display:none` and everything
  inside reported hidden. Only the *"brings the form back"* sibling check exposed it. **Assert visibility only
  after driving the UI the way she actually reaches it.**
- **`scratchpad/shot.js`** renders labelled before/after comparisons of this form (skip the `.hm-entrance`
  overlay first — it covers screenshots for ~2s). Suite is now e2e 29 checks.
- ⚠️ **AND THE REAL LESSON ABOUT TEST DATA:** the whole confusion came from testing with a *nearly* clean
  address. Almost-clean state is worse than obviously dirty state, because it fails in a way that looks like a
  code bug. **Assume nothing about an address you have used before, even once, even months ago.**

### ⭐ 0b-i. ▶ THE "there" PLACEHOLDER — leave it, but the overwrite bug is FIXED (2026-07-29)
When a woman never gives her first name, `user-data.js` writes the literal word **`there`** into her MailerLite
name field so the greeting reads *"Hi there,"* rather than *"Hi ,"*. Cath saw this on her own test email and
asked what to do.
- **DECISION: leave the behaviour.** *"Hi there,"* is warm and correct for a nameless subscriber, and the
  alternative (empty name + a MailerLite fallback value on the personalization tag) means editing her one live,
  working welcome email. Getting that wrong ships *"Hi ,"* to real women. Not worth it for something invisible.
  ▶ Her own record was simply missing a name; she set it in MailerLite by hand.
- ⚠️ **BUT A REAL BUG WAS HIDING INSIDE IT, and it is fixed.** Every save wrote the name field, so a save from a
  screen that didn't know her name would overwrite **`Sarah`** with **`there`** permanently. `nameIsSafeToWrite()`
  now looks up the existing subscriber and **refuses to let the placeholder replace a real name**; a real name
  always wins, and the placeholder may still replace an empty field or itself. Five checks cover it.
- ▶ **The general lesson, worth keeping:** a sentinel value stored in a field meant for real data is a fudge that
  works until something overwrites the real data with it. If the placeholder ever needs to go, the honest fix is
  a MailerLite fallback value, not a magic string in the database.
2. ✅ **The privacy-copy rewrite (the second Cowork brief) — APPLIED, plus CCPA and a real deletion path.**
   The diagnosis was fair and every claim checked out: the copy said *"never stored on our servers"*, *"it never
   touches our servers"*, *"no person at Style Star ever has access"* and *"your details are private (no one
   sees them)"* — and none of those survived contact with Supabase, MailerLite, Netlify Forms and a chat
   history that really does sit in `localStorage.ss_chat`. All seven replacements are in.
   - ⚠️ **ITS LINE NUMBERS HAD DRIFTED** (it cited 2450 for `.chat-privacy`, really 2547). **Matched on text.**
     Any future brief from a Cowork conversation should be assumed to have drifted the same way.
   - ✅ **THE ONE CLAIM IT ASKED US TO CHECK IS TRUE.** Anthropic's commercial terms say *"Anthropic may not
     train models on Customer Content from Services."* So the FAQ can honestly say her photos and chats are not
     used to train the AI. **Verified, not assumed** — the brief was right to flag it.
   - **Its sub-processor list was correct** and is now named in the policy: Anthropic, Supabase, MailerLite,
     Netlify, Plausible (confirmed live at `index.html` line 26).
   - ⚠️ **THE EM DASHES WERE CONVERTED TO COMMAS.** The brief's copy is full of them and the house style is no
     dashes anywhere. Watch for this on every pasted-in draft.
   - ✅ **Added a California / CCPA section** — and the honest version is *stronger* than boilerplate, because
     "we do not sell personal information, and we never have, so there is nothing to opt out of" is a real
     promise rather than a checkbox.
   - ✅ **DELETION IS NOW A MECHANISM, NOT A PROMISE.** A `DELETE` handler removes the Supabase row **and** the
     MailerLite subscriber in one call. Two ways in: **her own restore token** (self-service, ready for a button
     whenever we add one) or an **`x-admin-secret` header** matching a new **`ADMIN_SECRET` Netlify env var**,
     so Cath can action an emailed request without touching two dashboards. **Never by bare email** — that
     would let anyone delete anyone. ✅ **`ADMIN_SECRET` IS SET in Netlify — confirmed by Cath's own screenshot
     2026-07-29** (all scopes, all deploy contexts), so the admin route is fully live; nothing left to do here.
     Also visible in that screenshot: **`ANTHROPIC_API_KEY` is scoped to ONE deploy context (production)**, which
     is why deploy previews can't generate AI content ("invalid x-api-key"). That is good security posture
     (a preview can't spend her key), not a bug — don't "fix" it, and don't read dead AI features on a preview
     URL as a regression.
   - ▶ **STILL OPEN, deliberately:** there is **no in-app delete button yet**. The policy's promise ("email us")
     is now backed by one call instead of manual work, which is what the brief asked for. A self-service
     control is a small follow-up, but it is new UI on a sensitive action and **Cath should see it rendered
     before it ships**.
   - **Verified by `scratchpad/copy.js`, 41 checks** in a real Chromium: every retired promise is gone from the
     whole file, each new section actually *renders and is visible* on the right screen, the policy text is in
     the **raw served HTML** (a reviewer's bot runs no JS), no mojibake, no overflow at 360px, zero JS errors.
     ⚠️ **The preferences line is built at runtime by `renderPrefSizes()`**, so a plain `querySelector` finds
     nothing — the test renders it into a scratch node. An empty string quietly passed the "no longer says…"
     check before that was fixed, which is the classic false-negative shape.

### ⭐ 0. ✅ MY WISHLIST IS BUILT (2026-07-29). Read this before touching either list.
Cath asked for the saved list and it shipped this session, together with the naming and iconography work it
forced. **The headline: Style Star now has TWO lists and they must never be conflated again.**

| | **My List** (inside Your Wardrobe) | **My Wishlist** (new screen `s-wishlist`) |
|---|---|---|
| Holds | CATEGORIES — "White tops", "The perfect leather jacket" | SPECIFIC pieces — name + store + link |
| Mark | ⭐ **gold STAR** (`.wdr-star` / `_wdrStar()`) | ♥ **pink HEART** (`.wl-save` / `_wlSaveBtn()`) |
| Question it answers | "What's missing from my closet?" | "What did I see that I want to buy?" |
| Lifespan | durable, never expires | transient — she buys it or drops it |

- ▶ **THE NAMING CALL WAS CATH'S AND THE REASONING IS WORTH KEEPING.** She proposed "My Wishlist" for the new
  feature and "My shopping list" for the checklist. **Her first half was right and shipped; the second half was
  talked her out of, with her agreement.** Two reasons: (1) "shopping list" and "wishlist" are near-synonyms, so
  naming two things that way does none of the distinguishing work she wanted; (2) it fights the **brand framing
  rule** below — the 100 items are a possibility MAP, and "shopping list" is the most requirement-flavoured name
  available, which is exactly the framing that lands as a bill to a woman on a budget.
- ▶ **AND THE CHECKLIST DID NOT NEED RENAMING AT ALL** — the surprise of the session. The page was already
  titled *Your Wardrobe* and the tab already said *My List*. **Neither ever said "wishlist."** Only ~9 supporting
  strings did, and they were an ACCIDENT: the list once had a have/want toggle, "have" was dropped, everything
  left was a "want", and the copy drifted into "wishlist" on its own. So this was correcting a leftover, not
  renaming a considered thing. **Lesson: before renaming a feature, check whether the feature's actual NAME is
  wrong or just its supporting copy.**
- ✅ **Copy scrubbed:** "Shop my whole wishlist" → **"Shop my whole list"** (her wording), plus the count line,
  the reset warning, the loading messages, the star tooltips, the FAQ, `WISHLIST_MSGS`→`LISTSHOP_MSGS`, the
  load-bearing comments, and the shop-my-list AI prompt. `grep -i wishlist index.html` now returns only the new
  feature and one unrelated note about her retailer document.
- ✅ **Hearts became stars on My List** — Cath's own idea, and it was the right one. The heart is the universal
  "favourite" mark, so it belongs on the thing that IS favourites. **Cost nothing visually: those hearts were
  already GOLD** (`#E0B84C`), so only the shape changed, and it is now the app's own star (same path as the
  Build-hub tag and the Mall fixture). ⚠️ **Cath's decorative PINK heart is untouched** — that is her signature
  in her own voice ("With love, Catherine ♥") and is not a control. Don't confuse the two.
- **How the feature is built, and the two decisions that matter most:**
  1. **It lives on `wardrobeData.wishlist`** so it inherits the working localStorage + Supabase persistence
     (`buildFullUserData()` already ships `wardrobe` whole). No new storage system was invented.
  2. ▶ **THE URL IS NEVER STORED — only the store + search term.** `getStoreUrl()` rebuilds it on every render.
     **This means a store-URL fix silently repairs every already-saved item.** Fourteen store URLs have been
     fixed so far; storing URLs would have left women with a growing pile of links that were right on the day
     they tapped. **Keep it this way.**
- **One change covered all four AI shopping surfaces** (`_shopCard` is shared), plus Complete the Look, which
  has its own row renderer (`_renderShop`) and needed a second edit. ⚠️ **The stylist chat has NO save control
  and that is deliberate** — its links are linkified inline in prose, so there is no card to hang one on.
- ⚠️ **A REAL BUG FOUND WHILE BUILDING, and it would have destroyed data.** `wardrobeData` was only loaded from
  localStorage inside `openWardrobe()`. So a woman who saved a piece from the results screen *before* ever
  opening Your Wardrobe would have written the empty default over her whole checklist. **Fixed by loading the
  record once at boot.** A test asserts saving never clears her stars.
- **Her four design calls, all honoured:** the empty state explains how saving works and offers a way forward
  (never a dead end); a saved piece shows **the piece AND the store**; there is a ✕ on every row; and the
  **email ask lives on the page** — but only once she has actually saved something, so it reads as protecting
  work she has done rather than a toll on the way in. It never blocks the list.
- **Discoverability, given the lesson from her mom:** the save control is **LABELLED "Save"**, not a bare icon;
  a toast confirms the save AND says where it went with a **View** button; and there is a **My Wishlist row in
  the Shop hub on Welcome Back with a live count pill**.
- **Verified by `scratchpad/wish.js`, 70 checks, all passing** in a real Chromium driving the real app: star vs
  heart, all the copy, save/unsave from every surface, the same piece syncing across two cards at once,
  persistence across a reload, delete, the empty state, the email ask appearing and NOT appearing, disclosure
  contrast against the real painted background, a malformed record being sanitised, no overflow at 390px and
  360px, and zero JS errors.
- ⚠️ **THE DISCLOSURE LIST IS NOW SEVEN, NOT SIX.** My Wishlist shows links, so it carries the same line. **It
  renders only when the list has items** (nothing to disclose on an empty page). Add it to the edit list for
  Amazon's required sentence at money-path step 7.
### ▶ THE STYLE STAR EDIT CAN BE SAVED TOO (2026-07-29, same day) — and it answers the "exact item" question
Cath's follow-up was the sharpest question of the session: *"I feel like she wants to save an exact item. Not
just a search bar item from nordstrom... but an actual specific shoe she wants."* **She is right, and she had
already solved it herself without noticing: the Style Star Edit is 17 REAL product links she chose by hand.**
- ✅ **BUILT: a Save control on every Edit item**, and **generated from the markup at runtime** (`_wlDecorateEdit()`
  from `showDream()`) rather than hand-added to each of the 17 blocks. **So every Edit item she adds in future
  gets one automatically** — nothing for her to remember, and no chance a new item silently lacks one.
- ▶ **THE TWO KINDS OF SAVED PIECE ARE NOW EXPLICIT, and Cath chose to mark the difference rather than hide it**
  ("with the edit marked as my selections"):
  - **An AI suggestion** — we hold store + search term, **rebuild** a search link every render, no price, button
    says **"Find it"**. Lands on results.
  - **One of her Edit picks** — a **real product URL she chose**, so the URL IS the item and there is no formula
    to rebuild it. Carries its **price**, a gold **"Catherine's pick"** badge, and says **"Shop it"**. Lands on
    the actual piece.
  - **Why marking beats blending:** a list where one tap gives a shoe and the next gives 200 search results,
    with nothing to explain why, reads as broken. Marked, the difference becomes a feature — and her picks read
    as the most valuable rows, which they are.
- ⚠️ **THE PICKS ARE A DELIBERATE EXCEPTION TO THE "NEVER STORE THE URL" RULE.** Everything else rebuilds its
  link so a store-URL fix repairs it; a specific product link cannot be rebuilt from anything. That is fine
  because **Cath owns those links and can fix one herself** — but it means a dead Edit link stays dead in a
  woman's wishlist. Worth a periodic check of the Edit links.
- ⚠️ **`_wlRegister` must NOT resolve an Edit pick through the store table.** Their store field reads
  "Badu · Amazon" — a brand AND a retailer, not a `STORES` key. `if(item.pick)` skips `resolveStore`.
- **Security:** a stored URL comes back out of localStorage, so `_wlSafeUrl()` allows only `http(s)` — a
  hand-edited `javascript:` URL is stripped on load and no link is rendered. Tested.
- ⚠️ **LAYOUT, measured not guessed:** "Shop this item" is **209px wide inside a 232px column**, so a Save
  control can never sit beside it at any phone width. It gets **its own row** underneath, flush left, with a
  visible outline so it still reads as a real action under a big black button. **The first test asserted equal
  `top` values, which was the wrong test** (different heights, baseline-aligned) — the real finding was that it
  genuinely did not fit.
- **Verified: the suite is now 99 checks**, adding the Edit control on all 17 items, no duplicate controls after
  reopening the screen three times, the exact URL and price surviving a save and a reload, both kinds rendering
  distinctly side by side, the `javascript:` URL being stripped, and the Edit laying out cleanly at 390 and 360.

### ▶ WHAT AFFILIATE APPROVAL WILL AND WILL NOT CHANGE (asked by Cath 2026-07-29, answer worth reusing verbatim)
She asked *"will this differ once we get affiliate links?"* **Three things get conflated and they are separate:**
1. **Affiliate tags** — her tracking id on the links that already exist. A day's work. **Changes nothing about
   search-vs-product**; the same click just earns.
2. **Product feeds** — the networks send real catalogs (name, price, stock, size). **THIS is the one that turns
   a search into a specific product**, and it is a real build.
3. **The AI seeing real inventory** — needs feeds first.
▶ **So approval alone does NOT fix "exact item."** Say this plainly whenever it comes up; the Edit picks are
currently the ONLY exact items in the app. ▶ **Why the AI cannot simply emit product URLs today:** it has no
live catalog, so it would **invent** a plausible URL that 404s — strictly worse than a search, which always
lands somewhere real. ▶ **Cheaper middle step before full feeds:** many retailers accept size/colour/price
FILTERS in the search URL, so `getStoreUrl` could build a filtered search. Same address-bar research method as
the store audit.

- ▶ **CATH ASKED (2026-07-29, end of session): add the My Wishlist row to the OTHER hub pages.** It currently
  lives only in the Shop hub on **Welcome Back** (with its live count pill). She wants it on the **Style
  Portrait page and the Analyze Outfit (photo results) page** too — the other screens that carry the menu
  buttons. Natural fit: the same hub-row pattern (and `refreshTrendBadge()` shows how the pills stay honest
  across all three hubs — the What's Trending button already spans exactly these three). **Do this alongside
  or before the navigation session**, since both touch the same hub areas.
- ▶ **STILL OPEN on this feature, flagged not built:** (1) **"Email me my wishlist"** is now unblocked and is
  the natural next step — same MailerLite session as the other email work, and it is now a genuinely better
  email because her Edit picks carry real products and prices. (2) My Wishlist should join the
  **one shared footer** when the nav standardisation happens; it currently reuses the Wardrobe's footer exactly
  so it adds **zero** new footer variants to the eight that already exist. (3) Product images land here at
  money-path step 7 and would turn it into a real lookbook.
- ⚠️ **AND SAY THIS TO CATH WHEN IT COMES UP: a saved link is only as good as the search behind it.** The AI
  still does not see real inventory. Saving a link that lands badly is worse than not saving it, so **her
  homework item 6 — the quality gate — is now the highest-value thing she can do**, more so than before.

### ▶ NEW INPUT FOR THE 0c CONVERSATION (2026-07-30): CATH'S ChatGPT COMPARISON, decoded
Cath photographed a tan suede baguette bag, asked BOTH our stylist chat and ChatGPT to find one like it, and
shared the ChatGPT link. **Our stylist described the bag well but guessed** (its "Miu Miu Suede Bag" search
landed on 48 results of loafers at Nordstrom — the documented failure mode, live). **ChatGPT returned real
products with prices** (Quince $158 "closest overall", Free People $78, MANU Atelier, Parisa Wang, SIMKHAI,
Altuzarra), each linking to the actual product page.
- ▶ **HOW, decoded from its link parameters** (`utm_campaign=openai_catalog`, `utm_medium=feed`,
  `chatgpt_pla_product_feeds`): **OpenAI has built merchant PRODUCT FEEDS as platform infrastructure** —
  retailers push live catalogs into a shopping database and ChatGPT searches that, plus ordinary web search
  (it cited a People.com article and searched Reddit; "worked for 17s"). **Not a smarter model — better eyes.**
  Say this plainly whenever the comparison comes up.
- ▶ **WHAT OUR SIDE OFFERS (verified against current API docs 2026-07-30):** the Anthropic API has no shopping
  catalog, but it has a **server-side web search tool ($10 per 1,000 searches = 1¢/search, plus tokens)** and a
  **web fetch tool (free beyond tokens)**. Both support **`allowed_domains`** — ▶ meaning searches could be
  restricted to **only Cath's 102 vetted stores**, which enforces the brand at the infrastructure level
  (ChatGPT searches wherever the feeds point; we would search only where Catherine approved).
- **Honest trade-offs, told to Cath:** a searching chat answer costs ~5-10¢ instead of ~1¢ and takes 10-20s
  instead of a few; no product images/stock/size (those still need feeds); but "invented item at plausible
  store" becomes "real item the model just looked at, real price, real page".
- ▶ **THE LADDER NOW HAS FOUR RUNGS:** (1) affiliate tags (money only) · (2) **web search in the stylist —
  NEW middle rung, no approvals needed, entirely in our control** · (3) filtered search URLs · (4) product
  feeds (the full ChatGPT experience, gated behind affiliate approvals anyway). Offered, not built: a
  prototype of chat-with-search for a side-by-side comparison whenever she wants to evaluate it.

### ▶ THE FEEDS BUILD PLAN IS WRITTEN AND PARKED AT `docs/product-feeds-plan.md` (2026-07-30, Cath asked for it)
After the third live search-chat test, Cath asked the core question: *"is there a way for style star to have
access to the same info chat GPT was able to pull?"* The answer given (and she found it clarifying): **ChatGPT's
catalog is OpenAI-private — retailers upload feeds directly to them; there is no door for outside apps. But the
SAME retailers hand the SAME feeds to the affiliate networks, so the affiliate approvals at money-path step 7
are ALSO the data: one approval, two prizes (commission + catalog).** The plan doc is shovel-ready for approval
day: nightly feed ingest into Supabase → `product-search` function → chat answers from OUR catalog → cards get
real photos → "in your size" honestly returns → wishlist gets live prices. Standing rules carried over:
commission data never ranks, never-wear filters apply, the Edit stays hand-picked. **Trigger: the first
"you're approved" email from any network.** Until then, the tightened search chat is the floor (see 0-newest).
Cath brought back a full spec from Cowork — **"Option 3: your own curated catalog"** — real products she picks,
tagged by 9 style families + attrs/patterns/sizes, hard-filtered by the archetype so never-wear finally becomes
structural. It references a **companion spreadsheet that was NOT uploaded** (ask her for it if this goes ahead).
⚠️ **It is PARKED, not approved** — it is exactly the "option 3-adjacent" landscape of the 0c conversation below,
so read it WITH her, pressure-test the honest arithmetic in its Step 3 (60 items ≈ 8 hours of her time), and let
her decide. Notably it already respects today's decisions (colorsSkip stays deleted, no budget question).

### ⭐ 0c. ▶ CATH ASKED TO PARK THIS AS A TOPIC TO COVER (2026-07-29) — a CONVERSATION, not a build
**Her words:** *"I feel like I need to get more clear on what the AI searches and affiliate links can and can't
do with suggesting shoppable items."* She asked for this to go on the list explicitly so it is not lost.
**Treat it as a session of its own** — she wants to UNDERSTAND the landscape before deciding what to build, and
that is exactly the right instinct: the decision that follows it (feeds? filters? neither yet?) is expensive.
⚠️ **Do not turn this into a build proposal when it comes up.** Explain, answer her questions, and let her
choose. The full detail is in **"WHAT AFFILIATE APPROVAL WILL AND WILL NOT CHANGE"** below; this is the summary
she asked to keep, in the framing she found clear:
1. **Getting approved gets you TAGS.** A day's work, and it makes every existing click earn money — **but a
   search link stays a search link.**
2. **PRODUCT FEEDS are the thing she is actually describing**, and they are a real build: ingesting catalogs,
   matching them to what the stylist wants to suggest, keeping them fresh. **They are also the prize** — feeds
   carry size and stock, so the app could honestly say **"in your size"** again, which had to be removed from
   four places (2026-07-27) because a store search cannot filter.
3. **A cheaper middle step:** many retailers accept **filters in the search URL**, so we could send
   `blush sandals, size 8, under $150` instead of just `blush sandals`. Not a specific product, but much
   closer — and it uses **the same address-bar method she used for the store audit**, so she already knows how
   to do the research and it needs no approvals from anyone.
▶ **Useful framing for that conversation:** today the ONLY exact items in the app are **her own Edit picks**
(17 real product links she chose). Everything the AI suggests is a well-judged guess turned into a search. So
the honest question for her is not "how do we make the AI exact" but **"how much of the app should be her
curation, and how much should be search — and is option 3 enough to close the gap for the search half?"**

### 1. Cath's three access items — SHE ASKED FOR THESE FIRST, they make everything else faster
1. **MailerLite (the one that unblocks real work).** Before the email session, Cath checks whether her plan
   (paid 2026-07-21, $205.20/yr, up to 1,000 subscribers) supports **transactional or automation sends**. That
   single answer decides the whole approach. ⚠️ **She must NEVER paste an API key into chat.** The key lives in
   Netlify env vars and the function reads it server-side, exactly as `style-ai` does with the Anthropic key,
   which is how it was tested all through 2026-07-28 without ever being seen.
2. **Netlify deploy logs.** No integration needed: when a deploy fails she pastes the error text. During the
   2026-07-19 outage the true cause was one line, "Host key verification failed", and hours went into inferring
   it from outside. Optionally she can switch on **connector suggestions** in her Claude settings, which is
   currently off and blocks `SearchMcpRegistry`; then check whether an official Netlify connector exists.
3. **Browser access to retail sites — REOPENED 2026-08-01, session-dependent.** The 2026-07-28 finding (total
   network wall, requests reset before the proxy) did NOT hold in the 2026-08-01 session: `curl` fetched real
   search pages from 45+ retail sites there (see the sweep entry in 1b). So **test reachability fresh each
   session before assuming either way** — `curl -sL -o /dev/null -w '%{http_code}' https://www.everlane.com/`
   answers in one call. Bot walls (403s from ~19 stores, Gucci/Coach/Saks class) persist regardless of network;
   her address bar remains the only instrument for those.

### 1b. Finish the store URLs — CORRECTION, more is left than the 2026-07-28 wrap-up implied
✅ **NORDSTROM IS VERIFIED (2026-08-01, Cath's address bar, both directions).** Her own search produced
`nordstrom.com/sr?origin=keywordsearch&keyword=pink%20belted%20dress` — same `/sr?keyword=` shape the app
builds (`origin=` is their analytics param, correctly omitted per the strip-tracking rule) — AND she tapped
the app's bare `?keyword=` form and confirmed real pink belted dresses. The most-suggested store in the app
(25/28 exposure) is closed with evidence. ✅ **SUNGLASS HUT FIXED same day** (old `/us/search?q=` retired and
confirmed dead by her; now `/?q=`, the form her typed search produced). ✅ **WARBY PARKER VERIFIED same day**
(the app's exact `/search?q=` form confirmed in her address bar — eyewear is now fully closed: Quay,
Sunglass Hut, Warby Parker). ✅ **SKIMS FIXED same day** (the Mejuri shape: her typed search produced
`/search?query=`, and she confirmed the app's old `?q=` form shows no results — switched to `?query=`).
**Intimates is fully closed too: Soma, Spanx, SKIMS.** ✅ **BELK VERIFIED same day** (her search produced
`/search/?q=<term>&lang=default`; she confirmed the app's bare `?q=` form works WITHOUT `lang=default` —
unlike Theory, where lang is load-bearing). 🔧 **TJ MAXX FIXED same day, and it needed THREE taps:** the
app's old `/store/shop/search?q=` guess is DEAD, the main-site `?Ntt=` form would not open from outside,
and the winner is the MOBILE site her phone's own search produced — `m.tjmaxx.tjx.com/m/shop/?initSubmit=
search&Ntt=` (term appends after `Ntt=`). ⚠️ Deliberately points at the m. subdomain: shoppers are on
phones, and it is the only form proven to accept an outside search. Still under `tjmaxx.tjx.com`, so
`SEARCH_DOMAINS` (which covers subdomains) needed no edit. ✅ **VUORI VERIFIED same day, byte-identical**
(her search produced exactly the app's `vuoriclothing.com/search?q=` form — the Tory Burch shape, no
confirm tap needed). ✅ **ANN TAYLOR VERIFIED same day, the very last one** (her search produced
`/search?q=<term>&search-button=&lang=default`; she confirmed the app's bare `?q=` works — lang was
decoration like Belk's, not load-bearing like Theory's). ✅✅ **THE PRIORITY AUDIT LIST IS COMPLETE** —
every store on the ask-Cath list is verified or fixed with her own browser as the instrument. Half were
broken (Sunglass Hut dead path, SKIMS wrong param, TJ Maxx dead path — plus the 14 fixed in July), which
is the whole argument the audit was worth it. Only the deliberately-skipped long tail (below 8/28
exposure) remains, by design.
▶ **AND THE TAIL GOT A MACHINE SWEEP same day (2026-08-01, Cath's ask), because of a big environment
change: THIS SESSION'S SANDBOX CAN REACH RETAIL SITES** — curl fetched real search pages from 45+ stores
(July's total network wall is gone; the "browser access CLOSED" note below is now stale for curl, though
bot walls remain). `scratchpad/sweep2.mjs` (committed, rerunnable) fetched every not-human-verified
store's search URL with two terms. **Results (`sweep2-results.json`): 41 LIKELY OK** (search term visibly
served in the results HTML — strong evidence, incl. Talbots, Zappos, Target, Amazon, Revolve, Shopbop,
Zara, Uniqlo, LOFT, Tiffany), **19 bot-walled** (403s: Anthropologie, Free People, Coach, Saks, Neiman,
Bergdorf, Gucci, H&M, Lululemon etc. — unknowable from any sandbox, most already proven by live use),
**Lane Bryant OK-shaped** (its bot-check redirect wraps our URL already mapped to their internal search
with the term intact), **Saks Off 5th serves "Site Offline" to non-browsers** (not a broken link — but
the only store whose URL has zero evidence either way; one address-bar tap someday), **DSW + Tommy
Bahama client-side** (can't see inside from curl; both use plausible standard forms). ⚠️ Sweep lesson:
`-o /dev/stdout` breaks curl under Node execFile (write error, empty download) — let curl write to
stdout by default. **Net: nothing in the tail needs fixing today; the 3 someday-taps are Saks Off 5th,
DSW, Tommy Bahama.**
That session said "the costly half is closed". Not true then: NORDSTROM was never verified (now it is, above),
sitting at **25 of 28** exposure, the most suggested store in the app. It fell into the "cannot tell" pile
because its search renders client-side, and was then assumed fine because it is Nordstrom.
**75 of 102 stores are unconfirmed**, but they split usefully: **34 can be verified here** (their search is
server-rendered, so the vary-the-term size test works — just re-run `scratchpad/sweep.js`), and **41 need Cath's
address bar**. Do the 34 without troubling her.
⚠️ **The earlier priority ranking has a blind spot.** It counted how often a store lands in an archetype's top 20,
which UNDER-WEIGHTS category specialists: an eyewear or intimates store can be rare in the rankings and still be
the ONLY sensible pick when that category comes up. Rank by scarcity too (`scratchpad/render/remaining.js`).
⚠️ **AND THE SCARCITY LIST WAS WRONG THE FIRST TIME, corrected by Cath.** It was built by REGEX over her `c`
descriptions, so any store whose text happened to contain "bras" or "lingerie" or "sleepwear" was filed as an
intimates store. **Garnet Hill, Torrid and Lane Bryant are not intimates stores** (a natural-fibres catalogue and
two plus-size FASHION retailers that happen to carry some). **Never infer a store's category by keyword-matching
her tags; her knowledge is the authority, so ask her.**
Corrected picture: genuine intimates = **Soma** (fixed 2026-07-28), **Spanx** (verified), **SKIMS** (open) — so
that category is nearly closed already. Genuine eyewear = Sunglass Hut, Warby Parker, **Quay** (already verified).
**Ask Cath for these ~7, in order:** **Nordstrom** (25/28, by far the most important) · Sunglass Hut, Warby Parker
(two of only three eyewear stores) · SKIMS (the only unverified real intimates store) · Belk, TJ Maxx, Vuori,
Ann Taylor (by exposure). Stop there; the long tail has real diminishing returns.
▶ **Cath asked whether Claude Cowork could solve the browser gap.** Plausible and cheap to test: this sandbox
blocks retail sites at the network layer and Cowork runs elsewhere. BUT many retailers block automated browsers
specifically (403 to every header combination tried here), so it may fix the rendering problem and still hit the
bot wall. **Test: ask Cowork to open `https://www.sezane.com/us-en/search?s=pink+dress` and say whether it sees
pink dresses.** If yes, that unlocks the remaining 41 and every future store audit.

### 2. Then, the app work
- **🧭 NAVIGATION — Cath raised this 2026-07-29, AUDITED BUT NOT YET BUILT.** Her observation was right and the
  measurement is worse than she thought: the app has **EIGHT different footer link sets**, **no Home button
  anywhere** (the logo images are not even clickable), and **12+ screens whose only exit is the small grey
  `← Back`**. See the full section below for the recommendation (**not a dropdown**) before building anything.
- **📧 The two email projects, together** (same MailerLite plumbing): "Email me my wishlist" and the long-parked
  "Email me these tips & links" after a photo analysis. Needs her at a desk. **Every email links BACK INTO the
  app, never straight out to a retailer** (Amazon Associates bans affiliate links in email). Bundle in **email
  capture on the Your Wardrobe page**, a high-intent moment.
- **🖼 Vision Board real-photo curation** — its own creative session; she reacts to real imagery.
- **🛍 Shopbop's over-specific search term** — WATCHING, not tuning. `blush croc top handle bag` found nothing.
  Do not touch the rule on one example: it warns against both failure modes and tightening one risks the other.
  **Ask Cath for 5 or 6 examples in the form `item → store → what she got`** before changing anything.
- **Store URLs: Theory, Levi's, Aritzia and the rest are DONE.** See the verification status section; only a long
  tail below 8/28 exposure was never checked.

### 3. Waiting on others, nothing to do
- **Indie Law / Florida** — the LLC name, then trademarks, then EIN, bank, affiliates, then the revenue switch.

### ▶ DECIDED AND REJECTED 2026-07-28: the "why this store" line. DO NOT REBUILD IT.
It was built and tested (an optional `whyStore` on the four `_shopCard` surfaces, a rule requiring a reason true
to the store tags, verified against the live API with no flattery). **Cath then rejected it: "I changed my mind.
I think it won't help us."** Along the way she made a brand call worth keeping even though the feature is gone:
**never mention a woman's size range back to her while she is shopping** ("I don't want to remind a plus or petite
woman of her sizing in that moment"). Her sizing should guide WHICH store is chosen and never appear in the words.
Never merged, so nothing shipped. If it is ever revisited, the testing showed the model writes real reasons
happily; the objection was product, not technical.

---

## 📁 Where the history went
The session-by-session build history now lives in **`CLAUDE-archive.md`** (moved 2026-07-28, nothing deleted).
Read it for how something came to be: a design tried and rejected, why a screen looks as it does, the detail of a
build. **This file holds what is still true**: standing rules, current decisions, the store system, open threads.

## How the app is structured (important!)

The **entire front-end app lives in a single file: `index.html`.** It is a
single-page app — there are no separate HTML pages. Instead it shows/hides
"screens" using elements with `id="s-..."` (e.g. `s-wel` welcome, `s-quiz`,
`s-photo`, `s-chat`, `s-pref`, `s-res` results). All ~77 JavaScript functions
and all CSS are inline in `index.html`.

So: to change almost any feature, text, color, or layout, edit `index.html`.

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

### ▶ LEGAL UPDATE (2026-07-16): Florida REJECTED "Style Star, LLC" — new LLC name chosen, TMs to WAIT
- **What happened:** Almira (Indie Law) emailed — the state of Florida **refused "Style Star, LLC"** because it's too similar to an existing registered business, **STYLESTAR USA, INC.** (a live online clothing retailer, stylestar.us — confirmed via web search). **This does NOT affect the trademarks** — the LLC legal name and the brand/TM name do not need to match; the brand stays "Style Star," and the trademark applications are **fully drafted and cleared**, just waiting on the LLC.
- **Decision 1 — new LLC name.** Cath (with Claude's help) chose to send Almira **three ranked names**, first-available-wins: **1) Style Star by Catherine, LLC · 2) Style Star by Catherine Ellspermann, LLC · 3) Catherine Ellspermann Style, LLC.** #1 and #2 keep "Style Star" (Cath's clear preference — ties to the "real stylist behind it" north star) but MAY get refused again since "Style Star" is the exact colliding term; #2's full surname is likelier to clear; #3 is the guaranteed-clears backup. Cath asked Almira to confirm whether #1/#2 clear given the STYLESTAR USA conflict. (The binding check is Florida's Sunbiz entity database — Almira's job — not Google.)
- **Decision 2 — trademark timing: WAIT (do it cleanly).** Almira offered to file the TMs under Cath's name as an individual NOW (locks an earlier USPTO priority date, then assign to the LLC later), OR wait and file everything under the LLC once approved. **Cath chose to WAIT** — file the TMs under the LLC once the name is sorted. Rationale (Claude endorsed): the TM already cleared so there's no blocking rush; waiting avoids an extra assignment step + cost; the delay is short (~pick name → FL approval). Matches her original "file in the LLC's name to avoid a transfer" plan. (Trigger to reconsider filing-now: only if the LLC name process drags out over many weeks.)
- ✅ **Cath SENT the reply to Almira** (Claude drafted it): the 3 ranked names, the confirm-clearance ask, the "wait and file under the LLC" preference, and a light timing question (how long for LLC approval → then TM filing). **▶ AWAITING Almira's reply** — which name cleared + the timeline. When it comes back: log the confirmed LLC name + expected timeline here.
- **Emotional note (for continuity):** Cath felt genuinely disappointed reading the rejection (this is her passion/gift — setbacks land). Reframed warmly: it's a rubber-stamp technicality, the brand is untouched, and a similar name existing is quiet proof it's a real ownable brand. She rebounded to a confident shortlist + clean plan. Keep honoring the emotional thread when legal bumps happen.
- **▶ MONEY-PATH STATUS now:** legal chain is **LLC name refused → 3 ranked names sent → awaiting Almira** (which clears + timeline) → LLC approves (~days) → **EIN issued** (included in TM Max) → [Cath] open business bank account → [Cath] apply to affiliates (Amazon first) → [Claude] wire affiliate links + product images + FTC disclosure (the revenue switch; Mall/Edit earn $0 until then). None of this blocks app work.

### ▶ LEGAL UPDATE (2026-07-16, later — Almira replied: LLC name chosen, filing timeline set)
- **Almira replied.** Moving forward with Cath's **first choice: "Style Star by Catherine, LLC"** (keeps "Style Star" in the name — her clear preference). The STYLESTAR USA similarity is **not expected to affect the trademark applications**, but final LLC-name approval is up to the **state** (won't be certain until their review completes). Cath's **wait-and-file-under-the-LLC** timeline is confirmed: LLC approved first, then TMs filed under the LLC.
- **▶ TIMELINE: state response expected on or before JULY 24.** If the LLC name clears with no issues, Almira expects to **file the trademark applications on or before July 24** as well. She'll notify Cath the moment the state responds and send the TM applications for Cath's **final action steps**.
- **Nothing for Cath to do right now** — waiting on the state via Almira. **▶ NEXT to watch (~July 24):** confirmation the "Style Star by Catherine, LLC" name cleared + the TM apps arriving for Cath's final sign-off. When it lands, log the confirmed LLC + TM-filing status here, then the chain advances to **EIN issued → business bank account → affiliate applications**.

### ▶ LEGAL UPDATE (2026-07-27 — state STILL silent; Indie Law has chased them; TMs drafted and ready)
- Cath nudged Almira on **July 24**; the **Indie Client Care Team replied July 27**: Florida has **not yet responded**
  on "Style Star by Catherine, LLC," and **Indie Law has already sent the state a follow-up** to check status. They will
  be in touch **the moment approval lands** so they can immediately file the trademarks under the new LLC. Cath's
  **trademark applications are already drafted and ready** for next steps.
- **Read on it:** the only thing that slipped is the STATE's own processing time (Almira's "on or before July 24" was
  her estimate of their turnaround, not a broken commitment). Normal delay, not a red flag. **Nothing for Cath to do.**
- **▶ DECISION UNCHANGED: still WAIT** and file the TMs under the LLC (per 2026-07-16). **Revisit trigger:** if the
  state stays silent for **several more weeks**, reconsider filing the TMs under Cath's name now to lock the earlier
  USPTO priority date, then assign to the LLC later (Almira already offered this). Not there yet as of 07-27.
- **Money path is unchanged and still gated here:** state approves the LLC name → TMs filed → **EIN** issued (included
  in TM Max) → [Cath] business bank account → [Cath] affiliate applications → **[Claude] wire affiliate links + product
  images + FTC disclosure** (the revenue switch). None of this blocks app work.

### ▶ LEGAL UPDATE (2026-07-31 — 🎉 THE LLC IS CONFIRMED ACTIVE — Cath verified it on Sunbiz herself)
✅ **CONFIRMED, same morning: Cath searched search.sunbiz.org on her phone and saw it with her own eyes:
"STYLE STAR BY CATHERINE, LLC — Document Number L26000395689 — Status: Active."** Her first-choice name
cleared after all (the STYLESTAR USA, INC collision that sank "Style Star, LLC" shows as a separate active
entity on the same results page — both coexist fine). **Almira's official confirmation is still the next
event to watch for** — she said she'd file the trademarks the moment approval landed, and they're drafted
and ready. The money path is now genuinely unblocked: TMs → EIN (via Indie Law package) → [Cath] business
bank account → [Cath] affiliate applications → [Claude] the revenue switch. Screenshot in the 2026-07-31
chat. *(The section below records how the news first arrived, and the scam-wave warnings that came with it.)*
- **What happened:** Cath's HUSBAND received an SMS from an unknown 833 number: *"Style Star By Catherine, Llc is
  now registered! Getting an EIN is one of the first steps, apply here: www.einservices.org"*. **The text itself is
  a scam** (EINs are FREE from the IRS; that site is a pay-for-free-thing / data-harvesting operation) — but the
  robot can only know the LLC name by scraping **Florida's public Sunbiz records**, which strongly implies **the
  state has approved "Style Star by Catherine, LLC"** and the scrapers simply beat the official channels. Almira
  has NOT yet confirmed as of the morning of 07-31. **Status: LIKELY APPROVED, awaiting Almira's confirmation.**
- **Told to Cath:** don't click, don't reply STOP (confirms a live number), just delete/report junk. **Expect a
  WAVE of these** — fake "Certificate of Status" letters, "annual report filing" services, "labor law poster"
  invoices, by text AND paper mail, all scraped from the same public filing. **Standing rule she now knows: any
  LLC-related ask for money that isn't from Almira, the State of Florida directly, or the IRS is junk.** Her EIN
  comes through the Indie Law TM Max package; she never pays a third party for it.
- **Why the husband's phone (she asked):** Sunbiz publishes names + ADDRESSES, not phones; data brokers map the
  filing's address to household phone numbers and his is the top contact for the address. Nothing was hacked or
  leaked — public-record plumbing only. ▶ **Optional ask for Almira sometime:** what address went on the filing;
  a registered-agent address can keep the home address out of future public records.
- ▶ **Cath can self-verify in 30s:** search.sunbiz.org → Search by Entity Name → "Style Star By Catherine" →
  status "Active" = approved. (Sunbiz is Cloudflare-walled from the sandbox; her browser is the instrument.)
- ▶ **WHEN ALMIRA CONFIRMS, the chain finally advances:** TMs filed under the LLC → EIN → business bank account →
  affiliate applications — and remember the Amazon sequencing trap (180-day/3-sales clock starts at APPROVAL;
  networks first, Amazon only when there's real traffic).

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

**2026-07-26 (cont. — Wardrobe polish + ▶ REAL USER TESTING from Cath's mom: two new entry points to What's Trending — ALL SHIPPED LIVE, PRs #604–#606)**
Branch this session: `claude/style-star-9oayy3`. Short, high-value session; everything merged → live.
- ✅ **The how-to paragraph steps back after first use** (#604, the long-parked "remind me later" item). Full
  paragraph on early visits; once she's hearted **3+** items it collapses to one quiet line ("Tap the ♡ to add ·
  tap **Ideas** to shop"), reclaiming **~100px** (125px → 24px) on every later visit. Both texts live in the
  markup (`.hw-full` / `.hw-brief`), toggled by a `.brief` class on `#wdrHowto`.
  **KEY DESIGN CALL:** the state is decided **ONCE on page open** (`_wdrSyncHowto()` from `openWardrobe`), NOT on
  every heart tap — otherwise the whole list jumps under her thumb the moment she taps her third heart. So it only
  steps back on her NEXT visit, which is what "after first use" should mean.
- ✅ **"New" pill on What's Trending** (#604) — the other parked micro-feature. Mirrors the Style Star Edit pill
  exactly: `wbTrendSig()` (= `trendItems.length`) / `wbTrendHasNew()` / `markTrendSeen()` against a
  **`ss_trending_seen`** stamp. Shown on the **Trending tab** AND the **Welcome Back "Your Wardrobe" row**; clears
  the moment she opens the Trending tab (`wardrobeTab('trend')` → `markTrendSeen`). **To light it up for returning
  users, Cath just adds an item to `trendItems` — no flag to flip.**
- ✅ **Reset restores the full how-to** (#604) — a real bug **Cath caught by reasoning about it, not from a
  screenshot**: `wardrobeReset()` cleared the hearts and re-rendered but never re-evaluated the how-to, so after a
  reset the one-liner stayed until she left the page and came back. Now `wardrobeReset` calls `_wdrSyncHowto()`.
  Nice distinction worth remembering: bringing it back on **reset** is safe (the page already re-renders + scrolls,
  so a change is expected), whereas doing it on a **heart tap** would jolt the list mid-scroll.
- ✅ **Fewer item names wrap on narrow phones, with ZERO wording changes** (#604). Measured with the **real Jost
  font embedded**: at **375px and wider NOTHING wraps at all**; the four long names only wrap at **360px and
  below** — which is where anyone using **Display Zoom** lands (likely Cath herself, and common in an 18-80+
  audience). Reclaiming row gap + padding at `@media(max-width:374px)` took 360px from **4 wraps → 1** (only "Tops
  in your favorite colors" remains; **"The perfect leather jacket" now fits**). Deliberately did NOT shrink the
  font — readability beats an even list for this audience. Wider phones provably untouched (the rule can't apply
  above 374px). At 320px it's 15 → 11 (very narrow is a losing battle; fine).

### ▶ REAL USER TESTING (2026-07-26): Cath's MOM used the app — the best feedback yet
- **She LOVED it and could not stop clicking the shopping links** — even after Cath told her they aren't wired up
  yet. Strong validation of the shopping-first instinct and the Mall/Edit/Ideas flows.
- **BUT she never discovered What's Trending from the tab at the top.** She only found it via the **teaser strip
  at the bottom**. The white tab next to the black "My List" tab did not read as something she could tap.
- **DIAGNOSIS (worth keeping):** the unselected tab was `background:transparent; color:#8a8474` (light grey) —
  and in almost every interface convention **grey text = disabled**. So the pair read as "one button + one
  greyed-out label," not "a switch with two sides." The selected state was so heavy it made the unselected one
  look unavailable. Amplified for a less app-fluent user.
- **BIGGER INSIGHT: content is more discoverable than chrome.** She found it at the bottom because that's where
  the actual *trends* were (wide-leg jeans, ballet flats) — she didn't need a control, she saw clothes she wanted.
  Validates the teaser strip strongly.
- ✅ **FIX 1 — What's Trending added as a second Build-hub button** (#605, Cath's call; also fixed that Build was
  the only hub with ONE button while Shop has 3 and Style has 4, so it read empty). Added to **all three** Build
  hubs (Welcome Back, Style Portrait, Outfit results): trending-up line icon, sub "What's in right now, picked by
  Catherine", inline gold **New** pill (`.tr-new`). Calls **`openWardrobe('trend')`** → lands straight on the
  Trending tab, so a user who never notices the toggle still gets there in one tap (and it clears the pill).
  Welcome Back needed a **9th `.wb-item` + an `ICON[8]` entry** and `[0,3,6,1,2,5,4,7,8]` in the `setIcon` pass so
  its tile converts to the cream chip + charcoal line icon. `refreshTrendBadge()` drives the three inline pills and
  is called from `show()` so they stay honest everywhere.
- ✅ **FIX 2 — the unselected tab now looks tappable** (#606). Cath picked "D+E combined, wording 2" from a
  rendered comparison: **cream fill `#F5EFE2` + darker text `#3a352c` + gold border + an arrow**, plus a quiet
  **"Tap either list"** line under the tabs (`.wdr-tabhint`). Two things surfaced only once it was on the real page
  (the mockups only ever showed My List active):
  - **The arrow must flip direction.** A single `::after` arrow rendered **"MY LIST →"** in the other state —
    pointing right toward Trending while actually taking you LEFT. Now the left tab gets a leading `←`
    (`[data-tab="list"]:not(.on)::before`) and the right tab a trailing `→`, so each arrow points at the tab it
    opens. **LESSON: always render BOTH states of a toggle before shipping.**
  - **The New pill overhung the stitched frame** by ~9px (sitting on the dashes). Moved `right:-6px` → `right:3px`;
    measured −0.1px at 360px and −0.2px at 390px (just inside the stitch).
- **NET: three routes to What's Trending now** — the Build hub button, the bottom teaser strip, and the tab itself.
- ▶ **PARKED (Cath's call, revisit later): a small strip of trending ITEMS near the top of My List.** The strongest
  version of the discovery fix (she'd see wide-leg jeans, not a tab) — but it competes with the list, and we've
  already added two entry points. Hold.
- ⚠️ **TOOLING LESSONS (all cost real time this session):**
  1. **Mockup CSS MUST be id-scoped.** The first 5-option tab comparison rendered all five variants IDENTICALLY
     because per-variant `<style>` blocks used `.v .tab` selectors, which match every block on the page. Cath
     couldn't tell the options apart and said so. Fix: `#vA .tab`, `#vB .tab`… and **audit computed styles
     (`console.table`) to PROVE the variants differ before sending the image.**
  2. **One labelled image beats N separate crops.** Five small cropped strips on a phone were unreadable; a single
     tall image with each option labelled + described in-image was immediately clear.
  3. **`pkill -f "<pattern>"` kills its own shell** when the pattern appears in the running command line (exit 143)
     — it killed a heredoc mid-write and the local http server twice. Don't pkill on a self-matching pattern.
  4. **Multi-paragraph commit messages: write to a file and `git commit -F <file>`** — unescaped quotes/apostrophes
     in `-m` broke the shell and the commit silently didn't land (caught by checking `git log` before pushing).
  5. **`ss_wardrobe` seeds MUST include `pretap0:true`** or `_normalizeWardrobe()`'s migration wipes `items` and
     everything renders as an empty wishlist.
  6. After each squash-merge the branch diverges; `git checkout -B <branch> origin/main` then **force-with-lease**
     — but **verify first** with `git diff origin/<branch> origin/main --stat -- index.html` (empty = the remote
     branch is already-merged content, safe to force).
  7. The recurring stop-hook **"Unverified commit (noreply@github.com)"** fired 3× on `62db332`/`2f02946` —
     both are **GitHub's own squash-merge commits on published `main`**, authored under Cath's account.
     **Confirmed harmless; do NOT amend** (would rewrite published history and fork `main`).

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

### ▶ ALL 102 STORES NOW CARRY CATH'S OWN TAGS (finished 2026-07-27, three batches)
Cath reviewed the entire store table store by store and sent her tags in three batches (26, then 33,
then the final 43). **Every single store's price tier, style archetype, sizes carried and "best for"
is now HERS, not Claude's guess.** This is real stylist knowledge and the most valuable thing in the
table. **▶ If a new store is ever added, get her tags for it — do not invent them, and do not "tidy"
hers.**
- **Her vocabulary, kept verbatim:** price runs `$` to `$$$$` (ranges like `$$-$$$$` where a store
  spans tiers). Archetypes are her own words (Classic Sophisticate, Elevated Natural, Quiet Luxury,
  Coastal Chic, Glamorous Luxe, Modern Glam, Athletic Luxe, Playful Chic, Edgy Chic, Bohemian Chic,
  Professional Power, Trendsetter, Comfort Chic, Preppy Classic, Universal…). These are NOT the 28
  quiz archetype names, and that is fine — they are a stylist's shorthand for what a store is for.
- **"Standard" in her notes means no special ranges**, which is an empty `s:[]` here.
- **New size word this batch: `narrow`** (shoe widths). Zappos and Naturalizer carry wide AND narrow;
  DSW is wide only. Extended-size ranges are noted in the `c` description rather than the size list,
  since the app never asks a woman for that.
- **Four renames she asked for:** `Tiffany` → **Tiffany & Co.**, `Alo` → **Alo Yoga**, `Izod` →
  **IZOD**, `Net-a-Porter` → **NET-A-PORTER**. ⚠️ **A rename is a crash risk**, and this one nearly
  was: `_STORE_ALIAS` values must be REAL keys in `STORES`, or `resolveStore` returns a key with no
  entry and `STORES[key].u` throws, taking the whole page down. Aliases were updated, and
  `getStoreUrl` now guards with `key&&STORES[key]` as belt-and-braces. **Rule: rename a store → update
  its aliases → verify the OLD spelling still resolves** (the AI has years of habit calling it the old
  name).
- **Her corrections to my guesses this batch:** Target +petite, Levi's +petite, Johnny Was +petite,
  Naturalizer +narrow, Zappos +narrow, DSW wide only, plus every legacy `mid`/`luxe`/`budget` tier
  finally replaced with her `$` notation.
- **▶ THE BUSINESS FIELDS STAY OUT OF THE APP.** She proposed an 18-field "Retailer Intelligence
  Database" including Affiliate status, Commission rate and AI Priority. Agreed with her that those
  three belong in **a spreadsheet she owns** — they change HER decisions (which programs to apply to,
  which partnerships to chase), not the AI's picks. Putting commission rates in the app would quietly
  bias suggestions toward what pays best, which is exactly the opposite of the brand. The app only
  ever knows what helps a woman shop: price, style, sizes, strengths.
- **Cost consequence, worth knowing:** the fully tagged list is ~2,800 words on EVERY shopping call,
  taking a shop from ~0.4¢ to ~1.1¢. Tiny in absolute terms, but it is the concrete argument for the
  **retailer-scoring step** — score her Style Portrait against the `a` tags, send only the ~15 best
  matched stores, and the call gets both cheaper AND sharper. That is the strategic prize, deliberately
  deferred until her knowledge was in the table. It is in now.
- Verified with 99 automated checks across four suites (`verify.js` 48, `width.js` 15, `b2.js` 14,
  `b3.js` 22) driving the real functions in a browser: table shape, alias integrity, old spellings
  still resolving, unknown store falling to Google Shopping rather than throwing, her specific
  corrections, no overflow, no JS errors.

### ▶ RETAILER MATCHING IS BUILT (2026-07-27) — Cath's Fitted / Alluring / Polish scores
Cath sent a table scoring all 102 stores 1-10 on three dimensions she defined herself:
**Fitted** (how tailored/body-skimming), **Alluring** (how glamorous, feminine, sensual or
fashion-forward), **Polish** (how refined, elevated, put-together). All 102 resolved cleanly to
store keys, no gaps. Stored as `d:[fitted,alluring,polish]` **on each `STORES` entry** — one source
of truth, deliberately NOT a parallel table (a parallel table drifts out of sync on a rename,
exactly the bug class the alias fix just hit).
- **▶ THE KEY INSIGHT, and it is load-bearing: two of her dimensions are TASTE, one is QUALITY.**
  Fitted and Alluring have a different right answer for every woman, so they are what we MATCH on.
  **Polish is not taste, it is refinement, and nobody wants less of it.** Proved from her own data:
  among stores that sit in the SAME stylistic place (fitted ≤4, alluring ≤3) polish runs from
  **Jenni Kayne 10 down to Old Navy 4**; polish correlates 0.67 with price tier and only **0.16**
  with alluring; average polish rises monotonically by tier (5.4 → 7.4 → 8.5 → 9.6). So a woman who
  dresses casually wants the most refined CASUAL store, not the least refined one. **Polish RANKS
  (tie-break), it never matches.** Getting this backwards would have sent relaxed dressers to Old
  Navy and Target.
- **How her quiz maps in** (`_herDims()`): Fitted ← slider 9 (Relaxed↔Fitted). Alluring ← the mean
  of slider 2 (Natural↔Glam) and slider 11 (Modest↔Alluring), because her own definition of
  alluring is glamorous AND sensual. Sliders are 1-11, her scale is 1-10, hence the ×0.9.
- **`_rankedStores()`** sorts all 102 by `|fitted gap| + |alluring gap|`, ties broken by higher
  polish, keeps the best 46, then **adds back coverage**. Result: prompt drops **8,965 → ~4,260
  chars (52% smaller)**, so a shop goes back to roughly 0.6¢. The list is passed to the AI **in
  match order** with an instruction to favour the top and go further down only for a specialist.
- **▶ TWO COVERAGE GUARANTEES, both non-negotiable — this is where the danger is.** Trimming a
  store list can silently make a whole kind of shopping impossible. (1) `_COVER` forces at least one
  store for each of shoes / bags / jewelry / eyewear / swim / activewear / denim / dresses /
  workwear / foundations / outerwear. (2) every price tier keeps **at least 3** stores, so a woman on
  a budget never quietly ends up with one option while everyone else gets thirty. `_tierOf` reads the
  **cheapest** end of a range (Nordstrom `$$-$$$$` counts as `$$`) because the question is "could she
  buy anything here at all".
- **Before the quiz, no ranking at all.** `answers` sits at the neutral default until she moves a
  slider, so ranking a non-quiz-taker would sort against an invented profile. `_rankedStores()`
  returns the full list when `!quizTaken`, and the "ordered by fit" line is omitted.
- ⚠️ **Two real bugs caught by simulation, not by eye:** the tier top-up used an `add()` helper whose
  own test passed for stores already in the list, so it never fired (glam/edgy women were left with
  ONE budget store); and `_tierOf` originally read the *top* of a price range, which counted Amazon
  as `$$$` and understated how much a budget shopper could reach.
- Verified with `dims/rank.js`, 13 checks run against **all 28 archetypes**: zero coverage gaps and
  ≥3 stores per tier for every single one, shortlists 46-50 of 102, no duplicates, two opposite women
  share **no** top-6 store, and a very relaxed woman's top ten still averages high polish.
### ▶ TWO MORE AXES, SCORED AS INDEPENDENT PAIRS (2026-07-27, same evening)
Cath immediately asked "should we do a chart for classic/edgy too?" and then sent **Classic, Trendy,
Casual, Dressy** — as **four independent 1-10 columns, not two sliders.** That framing is hers and it
is better than what was asked for. `d` is now 7 numbers:
`[fitted, alluring, polish, classic, trendy, casual, dressy]`.
- **▶ WHY INDEPENDENT PAIRS BEAT A SINGLE AXIS, and this generalises.** Nordstrom is **8 classic AND
  7 trendy** because it genuinely serves both; Talbots is 10/1. Collapsed to one slider, a store that
  serves EVERYBODY looks identical to one that serves NOBODY (both land mid-scale). Kept as a pair,
  the score becomes "how well does this store serve HER side", which is how a stylist actually thinks:
  a 70%-classic woman wants whoever is *strongest* at classic, not whoever sits nearest a midpoint.
- **So the two kinds of dimension are used differently** (`_storeFit`): fitted/alluring are a
  **distance penalty** (subtracted), classic/trendy + casual/dressy are a **weighted preference
  score** (added), and polish rides along at ×0.15 — enough to separate two close matches toward the
  more refined, far too small to drag every woman into luxury. Her lean comes from slider 1
  (Classic↔Trendy) and slider 5 (Casual↔Dressy), each mapped to a 0-1 weight.
- **▶ THE IMPROVEMENT IS DRAMATIC AND MEASURED, not asserted.** Timeless Classic went from
  *Athleta, Banana Republic Factory, Levi's…* to **J.Crew, Vince, Levi's, J.McLaughlin, Ann Taylor,
  Theory** — the athletic store is gone from the top entirely. Vibrant Athlete went from
  *J.McLaughlin, Madewell, Boden…* to **Madewell, Vuori, Levi's, Lacoste** with Athleta in the top 8.
  Classic and trendy women now share ≤2 stores in their top 8.
- ⚠️ **A REAL RISK THE NEW AXES CREATED, caught in simulation:** the dressier a woman's taste, the
  more her best-matched stores skew expensive, because dressy correlates with price in the tags. The
  glam profile's top ten became almost all $$$$. Fixed two ways: (1) deleted the prompt line "match
  the store to her **including her budget range**" — the app never asks her budget, so that line
  promised something it could not do; (2) replaced it with an explicit instruction to **spread the
  prices** and always include something genuinely affordable. Verified: even the TOP 15 spans at least
  two price tiers for every one of the 28 archetypes.
- Verified by `dims/rank2.js`, 14 checks across all 28 archetypes. Prompt still 52% smaller.

### ▶ REVERSED THE SAME EVENING: SORT, DO NOT TRIM (2026-07-27)
Cath's priority, in her words: *"the last thing I want is for her to not get shown something she
would actually want."* That settles a trade-off I had made the other way, so the shortlist is gone —
**the AI now gets ALL 102 stores, ordered best-fit first.** Reasoning, in case it is ever revisited:
- **Sorting does 100% of the quality work**, because the prompt tells the AI to favour the top of the
  list. Trimming only ever saved money.
- **The money is under half a cent per shop** (~2,420 tokens vs ~1,150, so ~0.73¢ vs ~0.35¢). At
  1,000 women shopping five times each that is roughly **$19 a year**. Against her stated priority
  that is not a trade worth making.
- **Measurement said the trim was riskier than it looked:** for one archetype the best store in a
  whole category sat at **rank 72**, so a plain top-46 really would have lost it. The coverage rules
  patched that — and **two genuine bugs turned up in the patching apparatus** (the tier top-up never
  fired; `_tierOf` read the wrong end of a price range). **The safest code is the code not written.**
  `_COVER` and the KEEP logic are deleted; `_tierOf` stays because the tests use it.
- Verified by `dims/rank3.js` (13 checks): all 28 archetypes see all 102 stores, every category and
  price tier reachable for every archetype, ordering still discriminates hard (glam and easygoing
  share no top-6 store), and every archetype has 3+ affordable stores inside its top 20 so nobody is
  shown only luxury.
- ▶ **If cost ever genuinely matters** (it will not until there are thousands of users), the honest
  lever is not trimming the store list but caching or shortening elsewhere. Re-read this entry first.

### ▶ THE DIMENSION SET IS NOW COMPLETE — 4 PAIRS + 2 SINGLES (2026-07-27)
Cath sent the last two tables the same evening. **`d` is now 10 numbers per store:**
`[relaxed, alluring, polish, classic, trendy, casual, dressy, fitted, neutral, colorful]`
⚠️ **The order reads oddly on purpose:** `relaxed` replaced an earlier single `fitted` score in slot 0
and its partner was appended at the end. **Always go through the `_DIM_*` constants, never a bare
index.**
- **FOUR PAIRS, all weighted preference scores** (more of her own side is simply better):
  relaxed/fitted ← slider 9 · classic/trendy ← slider 1 · casual/dressy ← slider 5 ·
  neutral/colorful ← slider 7.
- **TWO SINGLES:** `alluring` is a distance PENALTY (weighted ×2.5 so one axis still counts against
  four pairs) — deliberately NOT paired, because Cath's definition is how the aesthetic *feels*, i.e.
  brand character, not a range a store spans. `polish` rides at ×0.15 as a refinement tie-break.
- **▶ STOP HERE. Do NOT score the remaining sliders.** Every axis added dilutes the others, so a bad
  mismatch on one gets averaged away, and the 12 quiz sliders are not independent (Casual↔Dressy and
  Comfort↔Style largely say the same thing). Scoring all twelve would make matching *worse*.
- **▶ OPEN QUESTION FOR CATH — BREADTH vs FIT, flagged not fixed.** A store strong on BOTH sides of
  every pair scores near the max whatever her lean is, so department stores now rise for almost
  everyone: **Nordstrom tops 20 of the 28 archetypes' top-5**, and department stores take 34% of all
  top-5 slots (36 distinct stores fill the 140 slots, so diversity is still decent). This is arguably
  correct — Nordstrom genuinely suits most women, and Cath's 10-neutral/9-colorful scoring for it is
  accurate breadth. But a stylist's value is partly sending someone somewhere specific. **Deliberately
  left alone: this is a stylist judgment, not an engineering one, and over-tuning a proxy without her
  eye is the trap.** `dims/rank3.js` now tracks the number so a regression is visible. If she wants
  specialists to lead, the one-line lever is to subtract a small "breadth" term (the store's mean
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

### ▶ THE LEGAL PAGES HAVE REAL URLs NOW (2026-07-29) — required for every affiliate application
Cath came back from a Cowork conversation with the thing nobody had noticed: **affiliate approval needs a URL for
the privacy policy, and Style Star did not have one.** The policy existed and was good — it already had an
**Affiliate links** section, which is exactly what the networks look for — but as a single-page app every "page"
is a hidden div, and `show()` called `history.pushState(state,null,'')`, that empty string meaning *leave the
address bar alone*. So there was literally nothing to paste into an application form.
- ✅ **BUILT: four real addresses** — `/privacy`, `/terms`, `/story`, `/faq`. `netlify.toml` **rewrites** them
  (status **200**, not 301) to `/index.html`, so the address bar keeps the pretty path, and a small router in
  `index.html` opens the matching screen. **The policy text is not duplicated anywhere** — one source of truth,
  and a reviewer sees the real designed page rather than a bare fallback copy.
- **How the router works, so it can be extended safely:** `_ROUTES` maps screen id → path, `_pathForScreen()`
  is what `show()` now passes to `pushState` (**every routeless screen reports `/`**, so the URL never gets
  stranded on `/story` after she navigates away), and `_screenForPath()` does the reverse for a cold landing.
  To add a page later: one entry in `_ROUTES`, one `[[redirects]]` block, one line in `_openRoute()`.
- **▶ DESIGN CALL worth keeping: the boot path runs `fallbackInitialScreen()` FIRST, then opens the deep-linked
  page on top.** That is what makes Back correct — her saved data is already in memory, so the page's own
  `privacyPrevScreen` records the real screen underneath and Back lands her on **Welcome Back if she has
  results**, the welcome screen if she doesn't. Verified both ways. It also skips the entrance curtain, since a
  2.25s star animation over a legal page someone came to *read* is wrong.
- ⚠️ **NEVER CHANGE THESE PATHS once a URL has been submitted to an affiliate network.** Written into
  `netlify.toml` and the code comment too.
- ✅ **WORDING FIX SHIPPED: the policy over-promised.** It said *"We never sell or share your personal
  information with third parties"* — but her email goes to MailerLite and her results are stored in Supabase.
  That is completely normal, and the absolute wording was the problem, not the practice. Now: *"We never sell
  your personal information, and we never share it with anyone who wants to market to you. We do share it with
  the trusted service providers who help us run Style Star…"* Accurate, and still in her voice. Date bumped to
  July 29, 2026.
- ⚠️ **THE SECOND WORDING FIX WAS DELIBERATELY NOT SHIPPED, and this was the right call.** Amazon requires the
  exact sentence *"As an Amazon Associate I earn from qualifying purchases."* **Cath is not an Amazon Associate
  yet and has no Amazon links**, so putting that sentence on a legal page today would be a false statement on
  the one page that must be true. Her existing generic disclosure (*"Style Star may earn a small commission from
  some links, at no extra cost to you"*) is present on the Edit and the Mall and is what a reviewer needs to see
  at application time. **Moved to money-path step 7, items 6 and 7** — including Amazon's 180-day / 3-sales trap.
- **Verified by `scratchpad/routes.js`, 56 checks, all passing.** A local server applies the rewrite rules read
  **from the real `netlify.toml`** (so a typo there fails the test), and a real Chromium drives the real app:
  each path opens and *visibly renders* the right screen, the address bar holds the path, the policy text is in
  the **raw served HTML** (so a reviewer's bot that runs no JS still finds it), Back works from both a new and a
  returning visitor, in-app navigation writes and clears the URL, browser Back still walks screen history,
  `_screenForPath` survives trailing slashes / capitals / `null` / lookalike paths, the four ordinary screens
  still open, the `?r=` email restore link still degrades gracefully, and there are zero JS errors.
- ▶ **STILL TO DO on the policy, low priority, flagged not fixed:** it does not name its sub-processors
  (Supabase, MailerLite, Anthropic) and has no California/CCPA section. Neither blocks affiliate approval and
  hers is already above average for an app this size. Worth asking Almira when the trademarks are done.

### ▶ EVERY SHOPPING SURFACE NOW CARRIES AN AFFILIATE DISCLOSURE (2026-07-29)
Both an FTC requirement and an approval signal: a reviewer checks that the disclosure sits **near the links**,
not only in the privacy policy.
- ⚠️ **THE FIRST AUDIT WAS WRONG, because it grepped for the wrong class names.** Searching `dc-disclosure` and
  `shop-disclosure` found only the Edit and the Mall, and produced the claim that the four AI shopping surfaces
  had nothing. **There was a third class, `shopdisc`**, already doing the job on the photo results screen. The
  true gap was four different surfaces than the ones first named. **Lesson: audit by finding every place that
  RENDERS a link (`_shopCard` call sites + the chat linkifier), then check each one — never by grepping for the
  class name you happen to remember.**
- **▶ THE SIX PLACES the wording now lives** (this is the edit list for Amazon's sentence at approval time):
  1. `.shopdisc` under **Complete the Look** (`#pShopList`, photo results) — already existed
  2. `.shopdisc` under **Shop your style** on the photo results (`#shopContentPhoto`) — already existed
  3. `.shopdisc` under **Shop your style** on the Style Portrait (`#shopContent`) — added
  4. `.shop-disclosure` on the **Shop your style / wishlist screen** (`s-shopstyle`) — added
  5. `.wdr-disclosure` **once at the top of Your Wardrobe**, below the tabs (was per-carousel; see below)
  6. `.chat-disclosure` in the **stylist chat** (the linkifier turns store names in her answers into links,
     so this screen needs one too) — added
  The Edit and the Mall keep their own longer *"nothing here is chosen by AI"* version. **Leave those alone.**
- **One wording everywhere:** *"Some links may earn us a commission."* A test asserts all six copies are
  byte-identical, so she never sees two different promises about the same thing.
- ⚠️ **SHORTENED THE SAME DAY, and the measurement is the interesting part.** Cath saw it live and said the
  two-line version felt *"a little cringe... I don't like reminding our user so much about the commissions"*,
  and asked whether it could fit on one line without going too small. **Shrinking could never have worked:**
  measured with the real DM Sans embedded, the old wording was **380px wide** while the tightest container (the
  Wardrobe Ideas carousel) is only **240–266px**. Even at 11px it was 334px. **The font was never the lever;
  the words were.** ▶ **Generalises: before offering to shrink something to fit, measure whether shrinking can
  possibly close the gap.**
- **▶ THE CLAUSE THAT WAS DOING THE DAMAGE: "at no extra cost to you."** 25 of the old 67 characters, and it is
  **not legally required** — it is convention. It was also the apologetic part, the sentence protesting slightly
  too much. Cutting it fixed the wrap AND the tone at once; nothing about compliance was traded away. The
  fuller, warmer version still lives in the **Privacy Policy, the FAQ, the Terms, the Edit and the Mall**, where
  there is room for it. **Those five keep their own longer wording — do not "unify" them with this one.**
- **Cath chose the plainest of three measured candidates** (she was shown all three rendered in the real
  carousel at her own phone width). Her pick reads most like a quiet footnote precisely because it explains
  least. Verified one line on **all six surfaces at both 390px and 360px** (`scratchpad/fitcheck.js`) — 360px
  matters because that is where Display Zoom users land, and one candidate passed at 390 and failed at 360.
- ✅ **THEN THE FREQUENCY WAS FIXED TOO (same day), because the repetition was the real problem.** Measured
  first: opening five Wardrobe items leaves **five carousels open at once and five identical notices on one
  ~7,300px page**. Cath asked for a judgement, worried only about affiliate approval. The answer given, and it
  is worth reusing: **reviewers check that a disclosure exists and is findable, not how many times it appears.**
  The norm across approved affiliate sites is one per page. Rejections come from having NONE, thin link-farm
  content, no privacy policy, or no traffic. And the FTC "repeat it" guidance is about **coverage** (someone
  landing mid-page on a long page), not about tagging every block of links.
- **▶ THE DECIDING ARGUMENT, and it generalises: every other screen already showed it once.** Wardrobe repeating
  was never a compliance decision, it was an accident of the carousel rendering per item. So the change brought
  the odd screen into line rather than carving out an exception. Now **one line at the top of Your Wardrobe**,
  and the carousels carry none.
- ⚠️ **TWO PLACEMENT TRAPS, both real, both hit:**
  1. **Directly under the "Your Wardrobe" title it read like a TAGLINE for the page** — as if the wardrobe's
     subtitle were a commission notice. Moved **below the tabs**, next to "Tap either list", where it reads as
     plain page chrome. Rendered and eyeballed before shipping; the measurement alone would not have caught it.
  2. **It must NOT go inside `.wdr-howto`.** That block collapses to one line once she has hearted 3+ items, so
     a disclosure living inside it would silently vanish for exactly the returning users who shop most. It is
     its own always-present element, and a test asserts it sits **outside both panes and before them**, so one
     copy covers My List and What's Trending alike.
- **Tests now assert the fix directly:** open five carousels, confirm five really do open, and confirm **exactly
  one** notice is visible and that the carousels carry none.
- ▶ **Trivially reversible** if a network ever asks for more: append a `.shop-disclosure` div to the html
  `_wardrobeIdeaGen()` builds, right after the `.wdr-swipe-hint`. (The old `AFFIL_NOTE` constant was deleted
  once every copy became plain markup — all six are now findable by grepping `may earn us a commission`.)
- ⚠️ **A DISCLOSURE THAT CANNOT BE READ IS NOT A DISCLOSURE.** The chat line was first styled `#9a9a9a` at
  10.5px, one notch quieter than the privacy line above it — which **measured 2.5:1 contrast and failed.** That
  instinct (a legal notice should be the quietest thing on screen) is exactly backwards, and it matters double
  for an 18-to-80 audience where readability is a stated priority. Now `#6e6e6e` at 11px, **4.6:1**, matching
  `.shop-disclosure` everywhere else. **The test measures real contrast against the real painted background on
  every surface** — a colour that looks fine on a light card can vanish on the dark results screen.
- Verified by `scratchpad/disclose.js`, **40 checks**: each of the six is present, says it plainly, occupies real
  space on screen, and clears 3:1 against whatever is actually behind it (the AI calls are stubbed, so this is a
  render + contrast test, not an API test). Plus the Edit/Mall disclosures intact, no overflow, no JS errors.
- ✅ **Also fixed: the Mall said "Net-a-Porter"** while the rest of the app had been renamed **NET-A-PORTER**.
  `mallStores` is a display list, not keyed off `STORES`, so it had drifted. Tested that all three spellings
  still resolve through `resolveStore` and that the URL still builds — **a rename is a crash risk**, per the
  alias lesson from 2026-07-27.

### ▶ NAVIGATION AUDIT (2026-07-29) — ✅ BUILT 2026-07-30 (see 0-NEWEST at top; kept for the reasoning)
She asked for "a home page button that maybe has a drop down menu for all our pages," noting the footers differ
and some pages need Back buttons to escape. **She was right, and it measures worse than she described.**
- **EIGHT different footer link sets:** Welcome / Welcome Back / global `.quiz-footer` all say *Shop · My Story ·
  FAQ*; Chat says *Edit · Quiz · FAQ*; the Mall says *Edit · My Story · FAQ*; FAQ says *My Story · Privacy ·
  Terms*; Privacy says *My Story · Terms · FAQ*; Terms says *My Story · Privacy · FAQ*.
- **There is no Home button anywhere in the app**, and the logo `<img>`s are not clickable.
- **12+ screens exit only via the small grey `← Back`** at the top right.
- **▶ RECOMMENDED, NOT a dropdown — and the reason is her own user testing.** The lesson from her mom was that a
  *visible* tab did not read as tappable. A dropdown hides navigation behind a tap **and** a mental model, which
  is the same failure mode one level deeper, and this is an 18-to-80 audience where readability is a stated
  priority. Instead: **(1) make the logo go home on every page** (already sitting top-left on the framed pages;
  the most universal convention on the web and it adds no new chrome), **(2) standardise to ONE footer** so the
  links never move, **(3) "Home" means her HUB** — Welcome Back if she has saved data, Welcome if she is new.
  ▶ **That third piece already exists in code**: the `popstate` handler has exactly that branch. Reuse it.
- **NOT BUILT YET — Cath should see the footer options rendered before anything is committed.** ⚠️ And when that
  comparison is made, remember the two rendering lessons: **id-scope the mockup CSS** (`#vA .foot`, not `.v
  .foot`) and prove the variants differ with `console.table` first, and **one tall labelled image beats N crops**.

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
   through ShareASale / Rakuten / Impact / CJ / Awin), and save Amazon until there is real traffic. Re-check the
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
