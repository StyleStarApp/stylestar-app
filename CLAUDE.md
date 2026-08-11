# Style Star — Project Notes

Style Star is a personal style-quiz web app ("Align your style. Shine your light.").
A user takes a quiz (and/or uploads a photo), gets an AI-generated personal style
write-up, can chat with an AI stylist, see outfit/shopping ideas, and save results
by email.

---

## ▶ NEXT SESSION — START HERE (2026-08-11 — HER SCREENSHOT DAY: the hubs get a face, the Wardrobe List becomes a worksheet)

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
  2. **A SHAREABLE "REGISTRY"** — her wishlist, shareable like a bridal registry: birthday/holiday link
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
