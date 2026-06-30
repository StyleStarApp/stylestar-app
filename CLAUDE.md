# Style Star — Project Notes

Style Star is a personal style-quiz web app ("Align your style. Shine your light.").
A user takes a quiz (and/or uploads a photo), gets an AI-generated personal style
write-up, can chat with an AI stylist, see outfit/shopping ideas, and save results
by email.

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

   > _Continue my Style Star project. Read CLAUDE.md and tell me where we left off.
   > We're working on branch `claude/festive-ptolemy-U8Xlb`._

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
- **Working branch:** `claude/festive-ptolemy-U8Xlb`
- **Live site:** served by Netlify (auto-deploys from `main`)
- **Emails / user data:** Supabase (stores data) + MailerLite (sends email)

## Project log

**2026-06-03 (first Claude Code session)**
- Set up the Claude GitHub App with read/write access (replaced the old
  download → upload workflow).
- Removed stale duplicate files: `index (19/21/27/31).html` and outdated
  root-level `style-ai.js` / `user-data.js` (PR #1).
- Added this `CLAUDE.md` (PR #2).
- Welcome headline copy is now "Discover your signature style" (no period).
- Iterated on the welcome headline font (`.wel-t`): DM Sans → Fraunces → Playfair
  Display (too formal) → Poppins → Lora → Marcellus → Cormorant Garamond →
  **Georgia** (warm system serif, current — no web-font load needed). The
  headers below now match it; Lora/Playfair were removed from the font link.
- Redesigned the home-screen action buttons into a horizontal row of three
  editorial cards (`.erow`/`.ecard`); card titles (`.et`) are now **Georgia**
  (were Playfair Display).
- Founder's Favorites (`s-dream`) `.dc-title`, the Privacy Policy header, and the
  Our Story title (`.story-title`) now use **Georgia** (matching the welcome headline).
- Added small top-right Back buttons on Founder's Favorites (`closeDream()`),
  Our Story (`closeStory()`), and Privacy Policy (`closePrivacy()`).
- Restyled the three home-screen `.ecard`s as square (no rounded corners)
  metallic gold gradient frames matching the shareable style card frame
  (`border-image` gold gradient on white).
- The welcome-screen "what you'll receive" block: a divider-flanked gold label
  ("WHAT YOU'LL RECEIVE") above a gold-checkmark list (Style Portrait / Style
  Fingerprint / Personalized Shopping Guidance). (Tried an airy inline gold-dot
  row but reverted to the checkmarks.)
- Gave the gold-framed `.ecard`s more horizontal padding and tighter letter-
  spacing so titles (esp. "Shop Curated Favorites") aren't tight to the frame.
- Restyled the "START MY STYLE QUIZ" button: square (no rounded corners), black
  fill, metallic gold gradient frame (matching the cards), with a gold arrow.
- Tweaked the opening-page Curated Favorites card copy (PR #4).

### Roadmap — ordered next steps (as of 2026-06-25)
> **▶ NEXT SESSION — START HERE:** the **full app design glow-up** (button/color/font
> consolidation — see the 2026-06-26 review). ✅ Email-capture rework is DONE (2026-06-26,
> PR #50). The other big app lever is the **affiliate-link architecture** once programs
> approve. These are app work and don't depend on the lawyer/affiliates, so they can
> proceed anytime. _Cath also asked me to gently keep
> her **on track / focused** each session — surface this roadmap and nudge toward the next
> step._

**Phase 1 — Legal/business foundation (in motion):**
1. Wait for Indie Law (Almira) reply → review fee total, Class 045 clearance, extra
   service fees, and EIN answer **before paying**.
2. Pay USPTO fees + $130 FL LLC fee once confirmed.
3. LLC forms (~5 biz days); both marks filed in the LLC's name.
4. Get **EIN** (free at IRS.gov, or via Indie Law) once the LLC is approved.
5. Open a **business bank account** (Truist or a no-fee online bank) with LLC docs + EIN;
   route all business income/expenses through it.

**Phase 2 — Affiliates (money priority; cleanest right after the EIN, Amazon anytime):**
6. Apply to affiliate programs — **Amazon Associates** first, then ShopStyle Collective,
   LTK, and networks (Rakuten / CJ / ShareASale / Impact).
7. [Claude] Wire affiliate links into the app + add the FTC disclosure.

**Phase 3 — Brand & app polish:**
8. [Claude] **App design glow-up** (define the vibe first, then elevate screen by screen;
   keep the logo + functionality intact).
9. Rebrand the `floridapersonalstylist` Instagram toward Style Star over time.

**Phase 4 — Cleanup (after the LLC exists):**
10. Dissolve "Your Fashion Friend" sole prop (confirm timing/taxes with accountant).
11. [Claude] Swap home address → PO Box in the email footer (when she has one).
12. [Claude] (Future) "Remember me" auto-restore link in the welcome email.

### Ideas / next time
_(running list — add to this as ideas come up)_
- **Frictionless "remember me" link for the welcome email (Cath's priority).**
  Today the welcome email's "Explore Style Star" button just opens `stylestar.app`.
  If a subscriber opens it on a *different* device/browser than they took the quiz
  on, the app doesn't auto-recognize them (their data is safe in Supabase, but they
  must use "Restore your results" and re-enter their email). Cath wants ZERO friction.
  Idea: include a personalized token/identifier in the welcome-email link so the app
  reads it on load and auto-restores the subscriber's saved results from Supabase —
  no re-entering email, even across devices. Mind privacy: use an opaque token, not
  a raw email, in the URL. (Email/automation now run through MailerLite; the link
  could carry a per-subscriber field/variable.)
  _Confirmed live 2026-06-26:_ Cath signed up in incognito, clicked the welcome email's
  "Explore Style Star" button, and the app made her take the quiz **again** — it didn't
  remember her even though she'd just entered her email. Exactly the problem to fix: the
  button should carry an **opaque token** (not the raw email) that the app reads on load to
  auto-restore her saved results (name + quiz answers) from Supabase and skip the quiz. Her
  data is safe in Supabase; the app just isn't auto-recognizing her from that click yet.
  (Cluster this with the email-capture rework + "persist user info" — all the friction items.)
- **Swap the welcome-email footer address (privacy).** The MailerLite welcome email
  currently shows Cath's home address in the footer (legally required physical
  address). Replace it with a PO Box / business address once she has one — update it
  in MailerLite (company/footer settings); it changes everywhere at once. Note:
  MailerLite locks the legal address's font size on send, so it can't be shrunk —
  the footer was made uniform instead.
- **Apply for affiliate programs (Cath's TOP money priority).** She does NOT need the
  LLC, trademark, or EIN finalized to START — most affiliate programs accept an
  individual / sole proprietor with an SSN on the W-9. (An EIN is free from IRS.gov in
  minutes if she'd rather not put her SSN on forms — not legal/tax advice; confirm with
  her attorney/accountant.) Likely fits for a styling app: **Amazon Associates** (easiest
  to start), **ShopStyle Collective**, **LTK**, and networks like **Rakuten / CJ /
  ShareASale / Impact** (Nordstrom, Revolve, Anthropologie, etc.). App to-do once she has
  links: wire affiliate URLs into the "Shop Curated Favorites" / shopping sections of
  `index.html`, and add an **FTC affiliate-disclosure** line (e.g. "As an affiliate I may
  earn from qualifying purchases") to the app + Privacy Policy.
- **Trademark + LLC (Indie Law — "TM Max" plan, $3,999 service fee already paid).**
  Decided scope (pending Almira's confirmation + exact fee total): file the **STYLE
  STAR word mark + the logo** (clean logo with star + line element, **no tagline**) in
  **Class 035** (promoting retailers / affiliate links), **Class 042** (the app / SaaS:
  style analysis + recommendations), **and Class 045** (personal stylist / fashion
  consultancy — Cath is an active stylist operating under Style Star). Form a **Florida
  LLC FIRST** (~5 biz days, $130 state fee) and file both marks **in the LLC's name** to
  avoid a later ownership transfer. Government USPTO fees (~$350/class) are **separate**
  from the $3,999 and could reach ~$2,100 for both marks × 3 classes — emailed Almira for
  the exact total + whether added classes cost extra service fees. Registration takes
  **months**; filing is quick. The earlier "$1,400 surprise" was just a **mislabeled**
  USPTO line (4 classes × 2 marks), not an extra LLC charge — resolved. Tagline ("Align
  your style. Shine your light.") reserved as a possible **separate slogan filing** later.
- **Dissolve "Your Fashion Friend" sole proprietorship** once the Style Star LLC is
  formed — Cath will run ALL styling services under Style Star now. (Confirm timing/taxes
  with her accountant.) Also gradually rebrand the `floridapersonalstylist` Instagram
  toward Style Star to consolidate the brand.
- **Business banking + EIN.** After the LLC is approved: get an **EIN** (federal tax ID —
  free at IRS.gov in ~10 min; or confirm whether Indie Law's TM Max plan includes it) and
  open a **dedicated business checking account in the LLC's name**. Keeping business +
  personal money separate protects the LLC's liability shield and keeps taxes clean. No
  need for a *different* bank — Cath banks at **Truist** (Orlando, FL) and a Truist
  *business* account is convenient (instant transfers, one app); a no-fee online business
  bank (Bluevine / Mercury / Novo / Relay) is an option to minimize fees. Sequence:
  **LLC → EIN → business account →** route all affiliate/business income through it.
- **App design "glow-up" (Cath wants this next).** Make the app look more upscale /
  artistic / editorial — elevate typography, color, spacing, texture, layout, subtle
  motion — WITHOUT changing the bones/functionality or the **logo** (logo stays the
  anchor; it's being trademarked as-is). Approach: define the aesthetic direction first
  (reference brands / mood / feeling), then apply it consistently screen by screen.
- **Open shopping "mall" page (à la Phia).** A new in-app page/directory that lists many
  curated stores, each "wired in" with Cath's affiliate links, so users browse an "open
  mall" and *any* purchase earns affiliate commission. Organize by category; include the
  FTC disclosure. Depends on affiliate approvals (Phase 2). Build as a new `s-...` screen
  in `index.html` with store cards linking out via affiliate URLs.
- **Rework the email-capture placement/UX (Cath priority — wants emails, hates friction).**
  Current capture is hard to find. Surface it at a natural, low-friction moment — e.g.
  right after the quiz, or after the "refine my preferences" (`s-pref`) step — as a gentle,
  non-annoying prompt. Decide the exact trigger; keep it elegant. (There's existing capture
  + a hidden Netlify form; find the current spot and improve prominence/timing. Cath wants
  to think on the placement.)
- **Persist the user's info so she never re-enters it.** Save name / quiz answers / email
  locally (localStorage) and via Supabase so returning visitors aren't asked again —
  reduces friction. Ties into the cross-device "remember me" auto-restore idea above. Cath
  considers this important.
- **Archetype names — refine + add descriptions (Danielle feedback, 2026-06-28).** Danielle
  took the quiz, loved it (esp. the nuance of the sliding scales). Two takeaways:
  (1) ✅ DONE — moved the archetype "notes of" tags to the TOP of the results screen (right
  under "This is <Name>", above the portrait paragraph) so the naming lands first, like a
  fun horoscope reveal. Mirrored on photo-results.
  (2) TODO next session — **rework the 21 archetype names.** Most are great; a few are
  clunky/off-pattern: "The Fit & Styled" (vague), "The Fresh Start Style" (awkward; it's the
  all-center neutral result), "The Alluring" (no noun, breaks the "The [Adj] [Noun]"
  pattern), "The Career Launcher" (sounds like a job site), "The Silhouette Savvy" (gimmicky).
  Tighten those + write a short evocative 1-line description per archetype (horoscope voice).
  **ASK CATH when we start:** should the descriptions SHOW in the app (tap an archetype to
  reveal) or just ENRICH the AI write-up behind the scenes? (She wasn't sure yet.) The
  portrait paragraph itself is good length — leave it; this is about the names/descriptions.
- **Premium paid product — personalized "vision board" / Style Guide (Cath idea, 2026-06-28).**
  Brainstorming paid offerings beyond affiliate. Risk Cath flagged: a paid product with
  specific shopping links can go out of stock → frustrated paying customer. RECOMMENDATION:
  sell the EVERGREEN part, keep live shopping free. The paid item = timeless personalized
  guidance that never expires — a beautiful **Style Guide / lookbook** (PDF or in-app): her
  archetypes + descriptions, color palette, flattering silhouettes, capsule-wardrobe
  framework, outfit formulas, shopping do's & don'ts. A mood/vision board works too IF
  framed as inspiration (no SKUs to go stale). Live affiliate shopping stays FREE + current
  in the app. Fulfillment later: emailed PDF or in-app premium unlock (e.g., Stripe). Ties
  nicely to the archetype-descriptions work (that content could feed the guide).
- **Substack / content income stream (Cath idea, 2026-06-28).** Newsletter/publishing
  platform with optional PAID subscriptions (recurring revenue); also builds audience that
  funnels to the app and can carry affiliate links. Good fit IF Cath enjoys writing
  regularly (content commitment); overlaps somewhat with the MailerLite list. Park for later.
- **▶ Monetization menu (do a dedicated strategy session when ready):** (1) affiliate
  commissions [primary, in progress, gated on LLC/EIN/bank], (2) premium personalized
  digital product (Style Guide/lookbook/vision board), (3) content subscription (Substack),
  (4) **paid 1:1 virtual styling sessions** — Cath is a certified stylist, likely the
  highest-value premium tier (book a real session through the app). Don't let monetization
  exploration derail current app work; schedule it deliberately.
- (add more ideas here)

**2026-06-23 (email setup session)**
- Set up **Plausible** analytics (script in `index.html`, verified).
- Wired signups into **MailerLite** (`user-data.js` adds them to the
  "Style Star Signups" group via `MAILERLITE_API_KEY`). Debugged a paused-Supabase
  outage along the way (Supabase now on the paid plan).
- Built a **welcome-email automation** in MailerLite (logo, Georgia/brand styling,
  copy, photo-upload bullet, Instagram link, gold "Explore Style Star" button →
  `stylestar.app`). **Activated** — sends automatically to new signups only.

**2026-06-24 → 06-25 (sender-domain authentication — ✅ COMPLETE, see 06-25 entry)**
- Problem being solved: welcome emails landed in spam / were delayed because they
  were sent "from" Cath's `cath.ellspermann@icloud.com`. You **cannot authenticate
  icloud.com** (Apple owns it) → DMARC fails → poor deliverability. Fix is to
  authenticate a domain Cath owns (`stylestar.app`) and send from
  **`hello@stylestar.app`** instead.
- DNS for `stylestar.app` is managed by **Netlify DNS** (NS1 nameservers), NOT
  GoDaddy — records must be added in Netlify (Team → DNS → stylestar.app).
- **Added MailerLite's 3 authentication records in Netlify DNS** (confirmed live in
  the records list):
  1. CNAME — Name `litesrv._domainkey` → Value `litesrv._domainkey.mlsend.com` (DKIM)
  2. TXT — Name `@` → Value `v=spf1 a mx include:_spf.mlsend.com ?all` (SPF; verified
     it's the ONLY spf1 record — no duplicates)
  3. TXT — Name `@` → Value `mailerlite-domain-verification=319d8d44c1e7893383f0abcae4521e7737968e79`
- Status when we paused: MailerLite "Check records" still showed **red ✕ (not
  detected yet)** — normal, DNS propagation takes minutes-to-hours. Waiting on it.
- Mid-setup, MailerLite **auto-disabled the "Simple welcome email" automation**
  because the sending domain (icloud.com) "is not authenticated anymore." Their
  email says to "click authenticate next to icloud.com" — **IGNORE that** (dead end,
  we don't control Apple's DNS). The correct path is the `stylestar.app` auth above.
- **TODO when stylestar.app verifies (green ✓):**
  1. Change the welcome email's **sender address** from the iCloud address to
     **`hello@stylestar.app`** (MailerLite → automation → sender settings).
  2. **Re-enable** the "Simple welcome email" automation.
  3. Send a test signup and confirm it lands in the inbox (not spam).
- **Separate open item — RECEIVING mail at `hello@stylestar.app`.** The Privacy
  Policy in `index.html` lists `hello@stylestar.app` as the contact address, but
  right now that's only set up for **sending** — there is **no mailbox**, so inbound
  mail to it would bounce. Need to set up receiving. Best fit for an Apple user:
  **iCloud+ Custom Email Domain** (adds MX records in Netlify; mail then arrives in
  Apple Mail on iPhone + Mac, and she can reply *from* hello@stylestar.app). Simpler
  free alternative: an email-forwarding service (ImprovMX / Forward Email) that
  forwards hello@stylestar.app → her existing inbox. → DONE 06-25 via iCloud+ (below).

**2026-06-25 (email auth FINISHED + inbox + welcome-email rewrite + share CTA)**
- ✅ **`stylestar.app` sender domain authenticated** in MailerLite (Account settings →
  Domains shows green "Authenticated"). The spam/deliverability problem is solved.
- ✅ **Welcome email now sends from `hello@stylestar.app`**, sender NAME **"Style Star"**
  (was Cath's iCloud address). Reply-to left unchecked so it equals the sender → replies
  go to hello@stylestar.app. Automation **re-activated**. Confirmed working by a fresh
  signup test.
  - ⚠️ Testing gotcha: the welcome automation only fires on a **first-time** join of the
    "Style Star Signups" group. To re-test, use a brand-new email — the Gmail `+alias`
    trick (`you+test1@gmail.com`, `+test2`, …) gives unlimited fresh addresses that all
    land in one inbox. Deleting a subscriber in MailerLite alone may NOT reliably
    re-trigger.
  - A scary "Something went wrong authenticating your domain stylestar.app" email arrived
    *during* DNS propagation (right after we merged SPF / added iCloud records). It
    resolved itself once DNS settled. Trust the **Domains page status**, not that email.
- ✅ **RECEIVING set up via iCloud+ Custom Email Domain.** Added Apple's records in
  Netlify DNS:
  - CNAME `sig1._domainkey` → `sig1.dkim.stylestar.app.at.icloudmailadmin.com` (DKIM)
  - MX `@` → `mx01.mail.icloud.com` & `mx02.mail.icloud.com` (both priority 10)
  - TXT `@` → `apple-domain=sZ8XqhWTR8KKPB1G` (verification)
  - **SPF MERGED** (a domain may only have ONE spf1 record): the single TXT is now
    `v=spf1 a mx include:_spf.mlsend.com include:icloud.com ~all` — keeps BOTH MailerLite
    (sending) and iCloud authorized. Netlify can't "edit" a TXT → delete + re-add. Enter
    values WITHOUT trailing dots/quotes in Netlify.
  - `hello@stylestar.app` now arrives in **Apple Mail on iPhone + Mac**, and she can reply
    *from* it (compose → tap "From" → pick hello@stylestar.app). Catch-all left **OFF**.
- ✅ **"Style Star" folder + iCloud Mail rule.** Made on **icloud.com (web)**, gear ⚙️ →
  Rules — NOT the Mac Mail app (server-side rules apply on every device). Rule: *"if a
  message is addressed to hello@stylestar.app → move to folder Style Star."* Separates
  business mail from personal.
  - Note: iCloud uses the Apple ID name as the sender name (no easy per-address sender
    name). That's fine: customer-facing mail is branded "Style Star" via MailerLite;
    personal replies come from "Catherine," which suits a founder-led brand. (If she ever
    wants a fully separate, branded business inbox, that means switching the receiving
    provider — e.g. Google Workspace / Zoho — and swapping the MX records.)
- ✅ **Rewrote / tightened the welcome-email copy.** Opening now matches the homepage
  voice: *"I'm so happy you're here. Thank you for taking our quiz. Style Star is a
  personal stylist at your fingertips, here to make shopping feel clear, easy, and fun."*
  Kept the 4 bullets + the "feel more **confident**…" closing ("confident" lives in the
  close now, removed from the opening to avoid repeating it). Framing rule Cath cares
  about: **never imply she lacked style before** — celebrate/elevate, don't "fix."
- ✅ **Link-share headline → call-to-action** (PR #45, merged → live). `<title>`,
  `og:title`, and `twitter:title` are now **"Style Star | Discover your signature
  style"** (Apple strips the "Style Star |" prefix in iMessage, showing just the CTA,
  matching the homepage headline). The share **image** (`og-image.png` — logo + "Align
  your style. Shine your light." tagline) was left UNTOUCHED. Note: messaging apps cache
  link previews, so already-sent links may show the old text for a while.

**2026-06-26 (full app review + security hardening + email-capture rework)**
- Did a **full critical review** of the live app (read all of `index.html` + both
  functions, rendered the home screen). Key takeaways for the roadmap:
  - **Profitability is the #1 gap:** the "Shop your style" AI picks link to store
    *search* URLs (e.g. `nordstrom.com/sr?keyword=...`), not products, and carry **no
    affiliate tags**. Even Founder's Favorites links aren't tagged. So the app currently
    earns ~$0 even from motivated buyers. Affiliate *approval* (Phase 2) is only half the
    job — the link-building in `index.html` must change so every outbound link carries
    her tag (and ideally deep-links to the actual product, not a search).
  - **Design glow-up target:** the results screen reads as "a pile of buttons" — 8 button
    styles, hot pink (`#E91E8C`) clashing with the gold/black brand, lots of emoji, and 5
    fonts loaded but used inconsistently. Consolidating to black + gold + one accent, one
    display serif, and reusing the thin-line SVG icons would elevate it a lot.
  - Smaller notes: 12 identical sliders (drop-off risk); restore-by-email has no
    verification.
- ✅ **Security: hardened the `style-ai` function** (PR #49, merged → live). It was an
  open proxy (`Access-Control-Allow-Origin: *`, no caller check, no token cap) — anyone
  could use it as free Claude on Cath's `ANTHROPIC_API_KEY`. Now: rejects requests not
  from stylestar.app (Origin/Referer check → 403), CORS locked to the domain, and
  `max_tokens` capped at 1024 + messages-array validation. Real app behavior unchanged
  (it only ever asks for 300–500 tokens). NOTE: a determined attacker forging headers
  isn't stopped — true rate-limiting (needs an external store like Upstash) is a possible
  later step, but this stops ~99% of drive-by abuse for free.
- ✅ **Email-capture rework** (PR #50, merged → live). Decided design (Cath's calls):
  keep the gentle, skippable "Save your results" ask after results; add a **stronger
  "Save my style profile" prompt after preferences** (the high-intent moment — she's just
  entered sizes/colors/never-wear, so "don't make me re-enter this" works for us).
  **No name asked before the quiz** (value/fun first — Cath was firm on this). New
  `s-pref-done` save block (optional first name + email, "Maybe later" skip). Safety:
  `buildFullUserData()` rebuilds the COMPLETE record (portrait + answers + prefs) from
  saved storage before any save, so updating preferences can never overwrite a returning
  visitor's portrait with empty data; already-saved users get silently re-synced.
- ✅ **Headline robustness** (same session). `.wel-t` ("Discover your signature style")
  now uses `text-wrap:balance` + `overflow-wrap:break-word` and a smaller size on
  ≤374px phones, so it always wraps cleanly. (The "cut off on iPhone" I first reported
  turned out to be largely a headless-screenshot artifact — the test browser clamps to a
  500px viewport — but the wrapping is genuinely more polished now. Worth a real-device
  glance.)
- **▶ NEXT (still app-side, no external blockers):** the **design glow-up** (button/color/
  font consolidation above) and, once affiliate programs approve, the **affiliate-link
  architecture** (the real revenue unlock).

**2026-06-27 (friction-busting session: email capture, retake, welcome email, auto-restore)**
- ✅ **After-results email capture, heavily iterated** (PRs #53–#56). A gentle bottom
  "save sheet" rises only once she's scrolled to the BOTTOM of her results + a ~2s beat
  (never rushes her reading; 22s no-scroll backup). If she dismisses it and lingers, a
  softer card slides in from the SIDE ~12s later (slower animation). Plus a discreet
  **"♡ Save my results" pin** under the fingerprint so she can save on her own terms
  anytime (choosing it suppresses the side ask). Asks greet her by name when known and
  pre-fill it. All save paths share one hardened `_persistSave()` (instant feedback,
  network timeouts, full-record rebuild). Never shown to already-saved users.
- ✅ **"Retake the quiz" now jumps straight to question 1** (PR #57) instead of bouncing
  through Welcome Back → welcome → start. Resets sliders, keeps her name, leaves saved
  data intact until she finishes.
- ✅ **Welcome email rewrite (Cath, in MailerLite).** Headline changed "Welcome to Style
  Star" → **"Your Personal Stylist Is Here ✨"** (benefit-first beats brand-first; brand
  lives in the logo + sender). Body now opens "Welcome to Style Star!" so it flows without
  repeating "here"/"personal stylist." Button stays "Explore Style Star" (clean text, no
  logo — buttons are for action; logo images are fragile in email). Once auto-restore is
  live, revisit button → "See My Style Portrait".
- ✅ **Cross-device auto-restore ("remember me") — LIVE & confirmed working** (PRs #58,
  #60). The welcome-email button carries an **opaque, encrypted token**
  (`?r={$restore_token}`, AES-256-GCM of the email via `RESTORE_SECRET`, never the raw
  email). On load the app exchanges it for her saved results and drops her straight into
  her Style Portrait — even on a new device. `user-data.js`: makeToken/readToken, stores
  token in a MailerLite `restore_token` field on save, GET accepts `?token=`. Dormant if
  `RESTORE_SECRET` unset. **Config (all done):** MailerLite field `restore_token` (tag
  `{$restore_token}`); `RESTORE_SECRET` in Netlify env; welcome-email button URL set to
  `https://stylestar.app/?r={$restore_token}` with label **"Open My Style Star"**.
  Tested cross-device — works perfectly. **Edge case handled** (PR #60): a saver with no
  quiz/portrait (browse/shop-only, or preferences-only) lands on the welcome screen with
  her name + prefs preloaded, NOT an empty portrait; `startQ()` keeps a known name so her
  eventual quiz result greets her.

**2026-06-28 (app design GLOW-UP — typography, buttons, color, contrast)**
- Did a fresh critical pass of the live screens, then locked a **design system** and
  rolled it out screen by screen (welcome screen = the north star). PRs #62–#65.
- **Typography consolidated to TWO fonts:** **Fraunces** (display serif — chosen because
  it harmonizes with the logo's high-contrast serif; compared head-to-head vs Georgia and
  vs Playfair/Didone, Fraunces won on logo-match + robustness across sizes) for all
  headings ("This is Sarah", page titles, Founder's Favorites + item names, Our Story,
  popup titles, home-card titles, welcome headline); **DM Sans** for all body/UI. Removed
  Cormorant Garamond + Noto Serif; Georgia kept only as a silent fallback. Normalized all
  font-family quoting. (Did NOT touch the logo — it's an image, being trademarked.)
- **Color/buttons:** retired hot pink (#E91E8C) brand buttons → **black primary + gold
  accents**. New `.act-btn` system: one filled-black PRIMARY per screen + uniform light
  SECONDARY buttons. (The "Hot Pink" color *swatch* in preferences stays — it's a real
  color choice.)
- **Icons + hierarchy:** replaced emoji on action buttons with refined thin-line SVG icons
  (bag/chat/camera/sliders/star/sparkle); shortened labels ("Analyze a photo"). Applied to
  results, photo-results, and Welcome Back menus. **Photo-upload screen KEEPS its 📸🪄💫
  emojis — Cath likes them there.**
- **Readability:** bumped too-light grays (#999/#bbb/#ccc) on real content (store/price
  meta, disclosure, links, secondary buttons) to accessible levels; left placeholders/
  arrows soft.
- **Glow-up REMAINING:** (1) elevate the Style Fingerprint (dense chart → keepsake),
  (2) refine ALL the line-art icons to be more custom/elegant (Cath: current ones are a bit
  plain), (3) a more elegant custom treatment for the photo-screen icon later, (4) add a
  small line-art icon to the "Retake the quiz" link (Cath wants one there, with the icon
  pass). Also retired the heavy black outline on Retake → it's now a quiet underlined link
  (#555).
- Email-fonts question: decided to **leave the welcome email as-is** (email clients mostly
  ignore custom fonts; logo image carries the brand; not worth the fuss).
- ✅ **Shop Style Star Mall** (PR #67) — NEW curated store directory (`s-shop` screen):
  ~23 stores in 5 categories from a data-driven `mallStores` array, Fraunces/gold styling,
  FTC disclosure. Footer gained a persistent **"Shop"** link. **LIVE now with plain store
  homepage links** (no real users yet besides Cath's mom/sister). **TO MONETIZE: swap each
  store's `u` to its affiliate URL once approved (one spot per store), and add product
  images then.** The "browse freely, still earn" play; complements (never overshadows) the
  personal styling.
- ✅ **Button system refinements** (PRs #68–#70). The two awkward underlined links on the
  results screen (Founder's Favorites + the mall) became a tidy **icon-on-top tile pair**
  (kept full "Founder's Favorites" wording — "Favorites" alone reads like the user's OWN
  saved items). Welcome Back reordered to mirror results (styling tools grouped; browse
  pair as tiles). **Welcome Back primary CTA changed "See my style portrait" → "Shop your
  style"** (a returning user already saw her portrait; shopping is the higher-value,
  revenue-aligned forward action; portrait demoted to an easy secondary). Framing Cath
  endorsed: the app is free/affiliate-supported, so a warm nudge toward shopping is fair
  and on-brand — as long as tone stays stylist-warm, never pushy/urgent.

### ▶ DECISION (2026-06-28): affiliate applications ON HOLD until LLC + EIN + business bank
Cath decided to **wait** on applying to affiliate programs until the **LLC, EIN, and
business bank account** are set up — so all affiliate income flows through the business
from day one (clean books / proper separation). This supersedes the earlier "Amazon
anytime" framing. So the new sequence is: **legal chain first (Almira → LLC → EIN → bank)
→ THEN apply to affiliates → THEN [Claude] wire affiliate links + product images + FTC
disclosure.** (Confirm tax-timing with her accountant; she'll also ask Almira.) None of
this blocks app work; the glow-up continues meanwhile.

**2026-06-29 (naming fixes + full FAQ rewrite)**
- ✅ **Renamed two features for clarity** (PRs #76–#77, merged → live):
  - **"Founder's Favorites" → "The Founder's Edit"** everywhere (home card, the 3 buttons,
    the `s-dream` page title, FAQ prose; footer link uses the tighter "Founder's Edit").
    Reason: "Favorites" (esp. the truncated footer link) read like the *user's own* saved
    items, which we don't have. "Edit" is editorial and clearly *hers*.
  - **"Style Fingerprint" → "Style Signature"** (welcome receive-list, results + photo-results
    `fp-lbl` labels, the shareable style-card canvas text). Ties to the homepage headline
    "Discover your signature style." NOTE: the old glow-up TODO "elevate the Style
    Fingerprint into a keepsake" is now the **Style Signature** (same task, new name).
- ✅ **Full FAQ rewrite** (PR #78, merged → live). Went from 10 → **16 questions**, edited
  with Cath line-by-line over a long session. The `s-faq` screen:
  - **Page retitled "Questions We Hear Often"**; footer link stays the short "FAQ" (recognizable).
  - Order: brand/philosophy first (What is Style Star / What if I don't know my style /
    What makes us different), then how-it-works, then trust/practical, closing on the
    **mission** ("What's the heart behind Style Star?" — "style has the power to help you
    shine your light…").
  - NEW **"Can I add Style Star to my phone like an app?"** with numbered Add-to-Home-Screen
    steps for iPhone (Safari) + Android (Chrome), incl. visual cues ("the square with an
    arrow pointing up") — Cath's family struggled to find the Share icon. Added `.faq-sub`
    + `.faq-steps` CSS.
  - Whole FAQ is **dash-free** (brand voice). Merged duplicate privacy Qs. Affiliate
    mentions kept **soft/forward-looking** (links aren't actually tagged yet).
  - Cath's voice calls honored: "discernment + our expertise is where the magic happens";
    "we're not here to tell you what's beautiful…shine a light on exactly that"; no-password
    low-friction brag; "every body, age, budget" reassurance kept (insecurity-easing).
- **📌 OPEN REMINDERS from this session (resurface next time):**
  1. **Refine FAQ wording slightly** — Cath wants a light polish pass later ("remind me").
  2. **When the paid tier launches** (vision board / Style Guide), revisit the "Is Style
     Star free?" FAQ answer so it stays accurate (it says "free to use," future-proofed).
  3. **Small-shifts / "one change makes a difference" idea** — dropped from the FAQ; Cath
     thinks it may already live in the stylist-chat advice. Verify in the chat prompt; add
     somewhere if wanted.
- Brainstorm note: Cath weighed **web app vs native app**. Conclusion (reassured): a PWA +
  "Add to Home Screen" is the right call now (no $99/yr Apple acct, no review, instant
  updates, iOS+Android, native-feel icon). Can wrap native later if it takes off — nothing
  now blocks that.

**2026-06-29 (cont. — share-link fix, home glow-up, readability, FAQ share Q, DESIGN explore)**
- ✅ **Share Style Card now carries a tappable link** (PRs #82–#83). The card-share caption
  was image-only with a dangling "Take this fun quiz →" and no URL (iOS drops the image if a
  `url:` field is passed). Fix: put `https://stylestar.app` IN the caption text (not a
  separate url field). On-device: the personalized card image AND the link both come through.
  The `https://` prefix is REQUIRED — iOS won't auto-link a bare `.app` domain. iMessage
  renders it as a tappable rich-preview card (3 bubbles total: card + caption + preview);
  Cath chose to keep that ("more info but inviting to tap"). NOTE the multi-bubble look is
  just how iOS shows image+caption; not a double-send.
- ✅ **New FAQ #6 "Can I share my results?"** (PR #84) after "What is my Style Portrait?" —
  explains the shareable Style Card + warmly invites texting/Instagram (growth lever).
  FAQ is now 17 Qs.
- ✅ **Home-screen glow-up** (PRs #85–#87): the three welcome `.ecard`s went from tall,
  cramped, heavy gold-framed columns → clean **horizontal rows** (icon → title + one-line
  desc → arrow, thin gold border). Added a quiet **"Prefer to shop first? Browse the Mall →"**
  link under the Restore line (opens `showShop()`; deliberately a quiet link, NOT a competing
  button — keeps one loud CTA). **Readability pass**: bumped home fonts (card titles 16px,
  desc 14px, links 14.5px, checklist 15px) — Cath flagged text was too small to read without
  glasses (real concern for the audience; do the same pass on results/FAQ later if asked).
- ✅ **Results action area** earlier same day (PR #81): "View Style Card / Share" were the old
  `.share-btn` style (square, heavy black border, Title Case, gold-filled icons) — rebuilt as
  matching `.act-pair` tiles → clean 2×2 grid; "What would you like to do?" set in Fraunces.

### ▶ OPEN DECISION (2026-06-29): home-screen "prettier" redesign — Cath is THINKING on it
Cath wants the opening page to look "much prettier" and noted text was too small (readability
fixed). She made a **Canva mock** (dark, full-bleed photo hero, white serif over imagery, solid
GOLD button, photo-led cards) — striking but "not exactly what I want." I flagged honest
tradeoffs: (1) dark bg + text-over-photo FIGHTS readability; (2) it lives on PHOTO sourcing
(she said she has "no idea how to get photos" — reassured: free Unsplash/Pexels flat-lays, I'd
source; she prefers **no faces** → flat-lays/objects/textures); (3) big brand shift (logo needs
white version on dark). NOTE: this env's proxy BLOCKS fetching stock images, so photo mockups
use placeholder blocks; real photos must be added another way (Cath downloads a few free ones &
sends them, or add later). Showed mockups (in scratchpad, not shipped):
  - **Example 1 — "Prettier, no photos"**: warm cream-gold card tiles, italic *signature* in
    headline, gold ✦ flourish. Real & shippable today, zero photo upkeep.
  - **Example 1 + ONE hero image** (my recommendation): the elevated design + a single hero
    photo (one image to source, not seven).
  - **Example 2 — full photo-led**: hero band + a photo on every card, bright/readable version
    of her Canva. Prettiest, but full photo commitment.
  Also explored earlier: 3 directions (Warm Editorial / Luxe Boutique / Clean Minimal) + an
  italic-"signature" headline touch. **Cath is sleeping on it — resurface these next session
  when she says "let's look at the home design examples again."** No code shipped for this;
  the app already works & reads clearly, so this is purely about how elevated + how much
  photo-upkeep she wants.
- Reminder still open: light **FAQ wording polish**; revisit "Is Style Star free?" when a paid
  tier launches; verify the small-shifts idea lives in the stylist-chat prompt.

**2026-06-30 (Tuesday — navigation/friction fixes, Style Signature, page consistency)**
- Cath did careful real-device testing and found several friction bugs; all fixed & live:
  - ✅ **Quiz "Back" at Q1** (#89): was hardcoded to s-wel; now returns to origin (Welcome
    Back / Results) via a new `quizOrigin` var set in startQ()/retakeQuiz().
  - ✅ **Photo upload "Back"** (#90) and **photo-results "Back"** (#91): same origin-forgetting
    bug (used `quizTaken?'s-res':'s-wel'`; a returning user landed on Discover). Now both use
    `photoPrevScreen` (set in showPhoto). Photo-results button renamed "Back to results"→"Back".
  - ✅ **Consistent back-scroll** (#92): returning to results from a sub-action now lands on the
    "What would you like to do?" actions (not the top) via a shared `showBack()` helper; routed
    all close/back paths through it. Fresh portrait views (quiz finish, "See my style portrait")
    still land at the top.
  - Full back-button audit done: Story/FAQ/Founder's Edit/Mall/Privacy/Chat/Prefs all already
    remembered origin; prefs Back hidden on step 0; no dead ends. Bonus: confirmed the
    **small-shifts idea IS live** in the stylist chat (the "Shift one notch" chip).
- ✅ **Style Signature**: redesigned it (readable keepsake) but **Cath preferred the ORIGINAL**
  (category left-column, endpoints under each track, no boxed card) → **reverted** (#95, byte-
  identical to original). Then tightened the gap between the spectrum words and their line
  (top:12px→7px, #96). LESSON: the original read fine on her real phone; my "too small" worry
  was partly a headless-render artifact (test browser clamps to 500px). Trust her device over
  test renders. (Other readability bumps kept: home screen, email note, Mall descriptions.)
  Cath dislikes **browns/tans of any kind** — keep palette to clean gold + neutral gray + white.
- ✅ **Five footer pages standardized** (#97–#98): Shop/Founder's Edit/Our Story/FAQ/Privacy now
  share identical top spacing (Privacy was using a 1.5rem-pad wrapper → switched to .story-wrap)
  and the same white-outline "Back" button (Our Story's was a solid-black btn-pink). Re-added the
  lost conversion nudge as a quiet **"Ready to discover your style? Take the quiz →"** link on
  Our Story, shown ONLY when arrived from the home page (`storyStartQuiz()` sets quizOrigin=s-wel).
- Feedback: **Ellen (Cath's sister) loves the Mall**, calls it a great idea, reminds Cath to
  monetize. Barb & Almira: still no reply.
- ✅ **FAQ is DONE** per Cath — removed from the open list (no more wording-polish pending).

### ▶ MASTER TO-DO LIST (saved 2026-06-30 — resurface whenever Cath asks "what's left")
**⏳ Waiting on others (no action needed from Cath):**
- Almira/Indie Law reply (fees, Class 045, extra-class fees, EIN) BEFORE paying.
- Barb's app feedback.

**💰 The money path (ordered — all affiliate income to flow through the business from day one):**
1. Almira replies → confirm fees. 2. [Cath] Pay USPTO + $130 FL LLC fee. 3. LLC forms (~5 biz
days; both marks in LLC's name). 4. [Cath] Get EIN (free, IRS.gov). 5. [Cath] Open business bank
account. 6. [Cath] Apply to affiliate programs (Amazon first, then ShopStyle/LTK/Rakuten/CJ/
ShareASale/Impact). 7. **[Claude] Wire affiliate links into the app** — swap each Mall store +
Founder's Edit `u` to the tagged affiliate URL, add product images, add FTC disclosure. (The Mall
earns $0 until step 7.)

**🎨 App & design (no blockers — do anytime):**
- **Home "prettier" redesign** — Cath mulling: Example 1 (prettier no-photos) / Example 1 + one
  hero image (Claude's rec) / Example 2 (full photo-led). Mockups in scratchpad/CLAUDE notes.
- **Refine line-art icons** — more custom/elegant; incl. a small icon on the "Retake the quiz" link.
- **Archetype names refresh + 1-line descriptions** (Danielle's feedback). ASK Cath: show in-app
  vs enrich the AI write-up.

**💡 Monetization beyond affiliates (do a dedicated strategy session):**
- Affiliate commissions (primary, above) • Premium digital product (Style Guide/lookbook/vision
  board, evergreen) • Paid 1:1 virtual styling sessions (Cath is certified — likely highest value)
  • Substack/content subscription.

**📣 Marketing plan (NEW — Cath wants to think on this):** needs a dedicated session. Levers to
explore: the share-the-Style-Card growth loop (already built), Instagram (floridapersonalstylist
→ Style Star), referrals/word-of-mouth, the Substack/content angle, email list (MailerLite).

**🧹 Later cleanup (after the LLC exists):**
- Dissolve "Your Fashion Friend" sole prop (confirm timing w/ accountant). • Rebrand the
  floridapersonalstylist IG toward Style Star. • [Claude] Swap home address → PO Box in the
  welcome-email footer (once she has one). • [Claude] Revisit "Is Style Star free?" FAQ when a
  paid tier launches.
