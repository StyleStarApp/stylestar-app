# Style Star — Project Notes

Style Star is a personal style-quiz web app ("Align your style. Shine your light.").
A user takes a quiz (and/or uploads a photo), gets an AI-generated personal style
write-up, can chat with an AI stylist, see outfit/shopping ideas, and save results
by email.

---

## ▶ NEXT SESSION — START HERE (updated 2026-07-29)

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

- ▶ **STILL OPEN on this feature, flagged not built:** (1) **"Email me my wishlist"** is now unblocked and is
  the natural next step — same MailerLite session as the other email work, and it is now a genuinely better
  email because her Edit picks carry real products and prices. (2) My Wishlist should join the
  **one shared footer** when the nav standardisation happens; it currently reuses the Wardrobe's footer exactly
  so it adds **zero** new footer variants to the eight that already exist. (3) Product images land here at
  money-path step 7 and would turn it into a real lookbook.
- ⚠️ **AND SAY THIS TO CATH WHEN IT COMES UP: a saved link is only as good as the search behind it.** The AI
  still does not see real inventory. Saving a link that lands badly is worse than not saving it, so **her
  homework item 6 — the quality gate — is now the highest-value thing she can do**, more so than before.

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
3. **Browser access to retail sites — CLOSED, do not spend time here.** Tested three ways on 2026-07-28 (through
   the proxy, without it, and with `--proxy-server` forced): the requests never even reach the proxy and are
   reset. It is the sandbox, not a setting she controls. Her address bar is the substitute and it is a good one.

### 1b. Finish the store URLs — CORRECTION, more is left than the 2026-07-28 wrap-up implied
That session said "the costly half is closed". **Not true: NORDSTROM has never been verified**, and it sits at
**25 of 28** exposure, the most suggested store in the app. It fell into the "cannot tell" pile because its search
renders client-side, and was then assumed fine because it is Nordstrom. That is an assumption, not evidence.
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

### ▶ NAVIGATION AUDIT (2026-07-29) — Cath asked for a Home button; here is what is actually wrong
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
5. Then: product images on the Edit + Mall + Your Wardrobe (turning them into real lookbooks), and confirm final
   **FTC disclosure** wording/placement with Almira.
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
