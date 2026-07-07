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

**2026-06-30 (LATER — ▶ MAJOR LEGAL MILESTONE: Almira replied, Cath paid, LLC + TM filing in motion)**
- **Almira (Indie Law) sent the long-awaited reply.** Key facts:
  - **TM Max package INCLUDES** LLC formation, **EIN** (federal tax ID), and an Operating
    Agreement. (Resolves the old open question — EIN is included, Cath does NOT do it herself.)
    Business bank account is NOT included (Cath opens it herself once LLC + EIN are ready).
  - **Class 045 added** with no extra service fee; caution level unchanged.
  - **Government filing fees = $2,100 total**, confirmed = 2 marks (word + logo) × 3 classes
    (035/042/045) × $350. (Fully resolves the old "$1,400 surprise" — math is clean.)
  - **Approved class descriptions** (USPTO pre-approved wording, must stay verbatim): 035 =
    promoting retailers via hyperlinks (affiliate/Mall); 042 = SaaS style-analysis app; 045 =
    personal stylist + fashion consulting. All three accurately fit Style Star. Almira only
    needed Cath to CONFIRM accuracy (not rephrase).
  - Timeline: filing is quick (gives an "applied-for" priority date); **USPTO registration takes
    12–24 months** — does NOT block LLC/EIN/bank/affiliates.
- ✅ **Cath PAID BOTH fees** (the $130 FL LLC filing + the $2,100 USPTO filing) and **emailed
  Almira** confirming the 3 class descriptions as written + LLC-first, both marks in the LLC's
  name. (Claude drafted the reply.) So filing is now fully in Indie Law's hands.
- ▶ **UPDATED MONEY-PATH STATUS** (supersedes steps 1–2 of the master list): steps 1 (Almira
  replies) & 2 (pay USPTO + LLC fee) are ✅ DONE. **Next:** LLC forms (~5 biz days) → EIN issued
  (included) → **[Cath] open business bank account** (Truist or no-fee online, with LLC docs +
  EIN) → **[Cath] apply to affiliate programs** (Amazon first) → **[Claude] wire affiliate links
  + product images + FTC disclosure** (the revenue switch; Mall earns $0 until then). The legal
  chain is no longer a blocker — it's just processing time now.

**2026-07-05 (▶ HOME SCREEN REDESIGN — "jewelry / dressing-room" concept SHIPPED LIVE)**
- Cath worked with an external "Design" helper on several home-screen directions (fitting-room/
  mirror, hanger, color-worlds — all explored in mockups, most parked). She landed on a **Design
  handoff** (`design_handoff_home_screen`: README spec + a `.dc.html` prototype) and asked to build
  it **exactly as specced ("option A")** — just the home/landing screen (`s-wel`).
- ✅ **Rebuilt the welcome screen to the Design spec** and shipped it live (PRs #105–#112). The look:
  a **gold star "pendant"** hanging from a **chrome clothing-rack rail** (S-hook + gold earring loop),
  inside a **brushed-chrome "mirror" frame**, on a **black/cream "curtain-stripe" backdrop**; a dark
  **gold-framed CTA** with an **in-place shimmer**; three **"chrome-shelf" explore cards** (Analyze an
  outfit / Ask your stylist / Style Star Edit) with tap-press feedback; footer **SHOP ★ OUR STORY ★ FAQ**.
- **Implementation notes (for whoever picks this up):**
  - All scoped to `#s-wel` with an `.hm-*` class namespace + a dedicated `<style>` block; the rest of
    the app is untouched. Adds fonts **DM Serif Display + Jost** (scoped to this screen only).
  - Every button stays wired to the existing functions: `startQ`, `showRestore`/`restoreResults`,
    `showShop`, `startPhoto`, `openChat`, `showDream`, footer `showShop/showStory/showFAQ`.
  - The screen has its **own footer + logo**, so the shared global `.hdr` header and `.quiz-footer`
    are **hidden on `s-wel`** (in `show()` + `fallbackInitialScreen()`) and return on every other screen.
  - Logo: `logo.png` is a solid **white-background** square (the old "white box" bug). Made a
    **transparent** version **`logo-star.png`** (white→alpha, cropped to content) — used inside the star.
  - Tap feedback on the cards uses JS touch handlers (`.hm-tapped` class) because iOS Safari
    suppresses `:active`; also a global empty `touchstart` listener as a fallback.
- **Long real-device polish loop with Cath** (all live): logo sized to fit inside the star (settled
  ~60px, "as large as possible but not bumping the gold edges"); curtain stripes made **even + wider**,
  **black at top and bottom** (58→66px bands); **clothing rack widened + raised** so posts touch the
  black up top; footer text **larger/darker with gold ★ separators**; CTA shimmer changed from a
  traveling sweep to an **in-place glimmer** (her call).
- Cath **loves it** ("looks really good"). My honest overall review (she agreed): concept is strong &
  ownable, craft is high, warm-not-cold — a real leap for the first impression.
- ▶ **NEXT DESIGN STEP (flagged, not started): carry the new look INWARD.** Right now only the home
  screen has the chrome/gold/pendant world + DM Serif Display/Jost fonts; the inner pages (quiz,
  results, chat, Mall, footer pages) still use the older Fraunces/DM Sans look → a visible "wow → oh"
  gap after the first tap. Eventually bring a few cues (chrome/gold accents, display font, CTA style)
  into the inner screens so the whole app feels like one place. Also still open (Cath's call): the
  three bright **icon-tile colors** (red/pink/teal) are the one element that sits apart from the
  gold/chrome palette — kept per "option A"; could unify to one accent later if she wants.
- Being explored next: a **subtle in-place "glamorous" shimmer on the chrome mirror frame** (Cath's
  idea) — must stay slower/softer than the CTA shimmer so they don't compete.

**2026-07-05 (cont. — ▶ HOME ENTRANCE REVEAL shipped: closet doors + permanent gold rail)**
- Cath worked with the external "Design" helper again and sent a handoff (`StyleStar-Entrance`:
  a spec `.md` + a self-contained `.bundle.html` reference). Instruction: "Match this reference
  exactly — copy the inline values verbatim, and make sure the gold rail stays on the home page,
  not just during the animation." Built it onto the live `s-wel` welcome screen and **merged → live**.
- **What it is:** a first-open reveal. Brushed **closet doors** (dark wood `linear-gradient(105deg,#242019…)`,
  solid `#C79A34` gold frame — NOT a filled gold panel, gold handles) sit closed with **two gold
  door-stars** near the seam; the stars twinkle (sparkle), the doors **swing open** (3D rotateY,
  hinged on the OUTER edges, tiny unlatch + settle overshoot), a **warm glow** sweeps the center seam,
  the two stars **fly up and merge into the logo star** with a gold **bloom**, and the content
  (headline → subhead → CTA → explore) **rises in** behind them. Faint **motes** drift in the beam.
- **Permanent gold rail:** the thin gold bar across the top (`linear-gradient(180deg,#FBF1C2…#8a6a17)`)
  lives in the home markup (child of `#s-wel`), NOT the overlay — so the hanging rack reads as mounted
  to it and it stays after the reveal. This was the design helper's #1 emphasis.
- **Implementation notes (for whoever picks this up):**
  - All scoped to `#s-wel` with `.hm-*` classes (matches the existing home namespace). The home content
    is wrapped in a new `.hm-room` (scales .95→1 during the reveal); the reveal overlay `.hm-entrance`
    is a separate `position:fixed` full-viewport layer (doors/veil/glow/motes/flying-stars/burst).
  - Reveal is driven by classes on `#s-wel`: `ss-anim` (armed) → `ss-play` (full) or `ss-play ss-fast`
    (compressed ~0.7s return) → `ss-done` (stable terminal state; overlay torn down to `display:none`).
    `maybePlayEntrance()` fires only when `s-wel` is the FIRST screen shown; **full on first open,
    fast thereafter**, gated by `localStorage 'ss_entrance_seen'`.
  - **Flying-star merge is computed in JS** (`getBoundingClientRect` of the logo → CSS vars `--mx/--my`)
    so the stars land dead-centre on the logo at any screen size — the reference's fixed phone-frame
    pixel coords wouldn't line up on the responsive web app.
  - **Honors `prefers-reduced-motion`** (skips straight to the settled home) and always removes the
    fixed overlay afterward so it never blocks taps (verified `elementFromPoint` on the CTA).
  - Returning users with saved data land on **Welcome Back (`s-wb`)**, so they don't see the doors —
    the reveal is a first-impression thing tied to `s-wel`.
  - Verified in Chromium at multiple beats (closed / mid-swing / merge / open / settled) for first-open,
    fast-return, and reduced-motion; gold rail persists in all.
- **Desktop note:** on a phone (the PWA, the real audience) the doors fill the screen perfectly; on a
  desktop browser they cover the whole window (wider than the 480px app column) — dramatic, acceptable.
- **▶ PARKED for later (Cath wants to discuss): the entrance SOUND.** The spec asked for a soft wardrobe
  **whoosh** on the door swing (~0.55s) + a gentle sparkle **chime** on the star-merge (~1.6s), first
  open only, honoring the mute switch. **Left OUT for now** — phone browsers block auto-playing audio on
  a page that opens itself (no user tap yet), so it wouldn't fire on first open anyway. Revisit: maybe
  tie a chime to a tap, or accept it only plays from the second (tap-initiated) interaction onward.

**2026-07-05 (cont. — entrance reveal: always full + now plays for Welcome Back too)**
- **Entrance now plays the FULL long reveal on EVERY open, for all visitors.** Removed the
  shortened "fast" return-visit variant and its `localStorage 'ss_entrance_seen'` gate; the
  `ss-fast` class is never added anymore (the CSS rules for it are now dead/unused). The
  `prefers-reduced-motion` skip is unchanged.
- **Entrance now also plays over Welcome Back (`s-wb`)**, not just the welcome screen — reversing the
  old "returning users don't see the doors" behavior above (that note is now superseded). Cath's call:
  give returning users the same first-impression moment. Implementation:
  - The reveal is now driven by classes on **`document.body`** (was `#s-wel`), and the closet-door
    **overlay is a single shared element** moved out of `#s-wel` to sit as a sibling of the screens
    (child of `.inner`), so it renders over whichever of `s-wel`/`s-wb` is the first screen. All the
    reveal CSS was rekeyed `#s-wel.ss-*` → `body.ss-*`.
  - **Welcome Back gained the same hanging-star pendant** (clothing-rack rail + hook + gold star with
    the `logo-star.png`) at the top, wrapped in `.hm-room`, so the two flying stars have a real star to
    merge into (the star-merge finale needs an on-screen target; `s-wb` had none). Its halo gradient id
    is `starHaloWB` (distinct from the home's `starHaloHome`).
  - To avoid a double logo, the shared global `.hdr` header logo is now **hidden on `s-wb`** too (it was
    already hidden on `s-wel`); both screens show their own hanging star instead. Updated in both
    `show()` and `fallbackInitialScreen()`. The global `.quiz-footer` still shows on `s-wb` (unchanged).
  - `maybePlayEntrance()` now targets whichever of `s-wel`/`s-wb` is active, finds that screen's star as
    the merge target, and adds/removes the `ss-*` classes on `<body>`.
  - Verified in Chromium at closed / doors-open / star-merge / settled beats for BOTH s-wel (no
    regression) and s-wb (new), plus reduced-motion (skips the reveal, content fully visible) on s-wb.

**2026-07-06 (▶ WELCOME BACK redesign — "lit vanity" mirror, from Design handoff)**
- Design sent a handoff (`StyleStar-WelcomeBack-EXACT.html` + `HANDOFF - Welcome Back.md`, in the
  scratchpad). Rebuilt the Welcome Back screen (`s-wb`) to match it exactly, keeping the reveal +
  functions we already had (reconcile, not wipe).
- **The look:** same dressing-room curtain background + gold rail as Home, the hanging gold star
  pendant, then a silver-framed **"lit vanity" greeting mirror** (warm bulbs flickering + breathing
  down each inner edge, one-time light sweep) with **"Welcome back, {firstName}!"** in DM Serif
  Display; a recessed shelf edge; then an **actions mirror** — the black/gold **"Shop your style"**
  CTA (gold shimmer, same as Home's) over **six Home-style silver shelves**: Analyze an Outfit (red),
  Ask Your Stylist (pink), Shop Style Star Edit (teal), See my Style Portrait / Refine your
  Preferences / Shop the Mall (black chips, gold line-art); a compact black/gold **Retake the Quiz**;
  and the **SHOP ★ OUR STORY ★ FAQ ★ PRIVACY** footer (black text, gold-star separators).
- **Two live badges (data-driven, hide when empty — handoff §3):**
  - *Shop Style Star Edit → "NEW"* — real & working. Signature = the number of `.dc-item`s in the
    Edit; if it's grown since her last visit (or she's never opened it) the gold NEW pill shows, and
    it clears the moment she opens the Edit (`markEditSeen` stamps `ss_edit_seen`). So when you add
    items to the Edit, returning users automatically see NEW — no manual flag needed.
  - *Ask Your Stylist → unread count* — wired to a real `ss_unread_replies` counter (caps at `9+`,
    cleared when she opens the chat via `markStylistRead`). BUT the stylist chat is instant/synchronous
    today, so nothing increments it yet → the badge correctly stays hidden. It's real plumbing ready
    for a future async/notification-reply feature; **until that exists it will never light up.**
    (Flagged for Cath — decide later what a "reply" is, or leave dormant.)
  - First name binds from her saved data (`ss_data.userName`, first token); unknown name collapses to
    a clean "Welcome back!".
- **Implementation notes:** all scoped to `#s-wb` with a `.wb-*` namespace; dropped the mock's phone
  bezel/status bar. Entrance reveal still plays over WB — the pendant star is the flying-star merge
  target; the rise-in content wrapper is `.wbx` (reveal rules repointed `#s-wb .wb` → `.wbx`). The
  global `.quiz-footer` is now **hidden on `s-wb` too** (WB has its own footer) — supersedes the old
  "quiz-footer still shows on s-wb" note. Footer placed on the mirror's cream (not free on the curtain)
  so black text stays readable — Cath's readability priority. Verified in Chromium: named + no-name
  greeting, badges on/off + `9+` cap, reveal doors→star-merge, CTA always present, no double footer.
- **Home (handoff §4):** the two asks — gold rail + black-text/gold-star footer — were **already in
  place** from the entrance-reveal work, so Home needed no change; confirmed by screenshot. The two
  screens now read as one product.
- ✅ **Pendant polish pass** (Cath's real-device notes, same day): lifted the clothing-rack up so the
  chrome **bracket posts touch the gold rail** (closed the dark gap); **squared the rod's side tips**
  (were rounded); reworked the **S-hook** so its upper curl **hooks securely over the rod** and the
  lower curl **threads through the gold jump-ring** on the star; and **deleted the black recess bar**
  that sat between the greeting mirror and the actions mirror. All scoped to `#s-wb` (Home's pendant is
  a separate structure inside its mirror — left untouched; offer to match it if she wants).
  - Follow-ups (all merged): S-hook now curls **onto** the rod (was floating above) and threads the
    **top** gold ring (star hangs from the lower ring); shelf-action labels bumped 14→16→**18px** and
    bottom-aligned so they **sit down on the shelves**; footer links 9.5→**12px** (Cath: "perfect");
    greeting mirror — the two lines are now **one sentence per line** (13px, sat a little lower) and
    **"Welcome back, {name}!" dropped down** to give the star breathing room; the vanity **bulbs now
    twinkle** (per-bulb opacity pulse, staggered/out-of-sync) instead of a single whole-column breathe.
- ✅ **Navigation pass — top-right "← Back" on every sub-screen** (Cath: easy, non-frustrating nav is a
  priority). Style Portrait (`s-res`) + Preferences (`s-pref`) got a top-right Back returning to the
  origin (portrait's only shows when arrived from a menu via `loadSaved`, not on a fresh quiz result;
  prefs returns to `prefReturnScreen`). Analyze-an-outfit upload (`s-photo`) + photo results
  (`s-photo-res`) got the same (return via `photoPrevScreen`). Everything else already had one:
  Story/FAQ/Privacy/Style Star Edit/Mall have "← Back", the stylist chat has "Done". Reusable `.top-back`
  style. The quiz keeps its per-question Back (deliberately no one-tap "exit quiz" — protects completion);
  the after-prefs save prompt needs none. No dead ends anywhere now.
- ✅ **Footers consolidated to `Shop · Our Story · FAQ` on EVERY screen** (Cath's call). Removed
  **Style Star Edit** from all footers and removed **Privacy** from the footer nav. Rationale (Cath
  agreed): a footer link is an invite to explore; Privacy is a legal/trust link people only seek at the
  email moment — and it's already surfaced there (every email-capture form: "We'll never share your
  email · Privacy Policy") **and** in the FAQ ("Is my information private?" links the full policy). So
  Privacy stays fully reachable without cluttering the editorial footer. "Shop" stays in every footer
  (Cath always wants the Mall findable). Home/WB have their own gold-star footers; inner pages use the
  shared `.quiz-footer`; all three now match. Dropped the dead `footEdit`/`footPrivacy` toggle code.
- ▶ Still open from the earlier design step: carry the chrome/gold/DM-Serif look further INWARD (quiz,
  results, chat, Mall, footer pages) so there's no "wow → oh" after the first inner tap.

**2026-07-06 (cont. — ▶ RESULTS + PHOTO-RESULTS redesign: "reveal moment" boards — SHIPPED LIVE)**
- Design sent a handoff (`results-handoff/`: `HANDOFF - Results.md` + `StyleStar-Results-EXACT.html`)
  for the **Style Portrait screen (`#s-res`)** — the third screen in the app-wide glow-up after Home and
  Welcome Back. Built it to match exactly, then carried the SAME look to the **photo/outfit results
  (`#s-photo-res`)** so the whole results experience reads as one screen. Merged → live (PR #154).
- **The look:** a dark, spotlit "reveal moment." The screen opens as a **closed beveled chrome mirror**
  with two gold stars; while the portrait is composed the **stars spin** (this IS the loading state — it
  replaced the old spinner screen on both the quiz and photo paths), then the **doors swing open** onto
  three "boards" floating in a warm pool of light:
  1. **Portrait clipboard** (`.p1`) — black-lacquer board held by a gold clamp; logo, engraved "YOUR
     STYLE PORTRAIT" / "YOUR OUTFIT ANALYSIS" label, the name (italic), the archetype "notes of…"
     (now inline, gold-dot `·` separators — was `.flav-tag` chips), and the portrait paragraph.
  2. **Style Signature card** (`.p2`) — wider board with gold corner studs; the 12 spectra plot their
     gold dots in (re-skinned `buildChart()`/`buildPhotoChart()` from `.fp-row` → `.sig-row`, **same 12
     values**).
  3. **Actions card** (`.p3`) — light card: "What would you like to do?", a gold-framed heart **Save my
     results**, a View Style Card / Share pair, the "chrome-shelf" action rows (Refine prefs, the gold
     **Shop your style / Shop this style** hero w/ shimmer, Analyze an outfit, Ask your stylist, Style
     Star Edit, Shop the Mall), a **"Keep your portrait"** email save block, Retake, and the
     Shop ★ Our Story ★ FAQ footer.
- **Implementation notes (for whoever picks this up):**
  - The board + reveal CSS is shared via a **`.res-screen` class** (NOT scoped to `#s-res`), and BOTH
    `#s-res` and `#s-photo-res` carry it — so the two screens are guaranteed identical and there's one
    copy of the CSS. Fonts (DM Serif Display / Fraunces / Jost) were already loaded.
  - Each results screen is a **dark full-bleed panel** that breaks out of the `.inner` padding
    (negative margins). The shared global `.hdr` header + `.quiz-footer` are **hidden on `s-res` and
    `s-photo-res`** (each has its own logo + footer), same as Home/WB — done in `show()`.
  - **Reveal state machine** = classes toggled in JS on the screen element: `.rv-compose` (closed doors,
    stars looping, boards hidden — the loading state) → `.rv-open` (doors swing + fade, boards rise, sig
    dots plot) → `.rv-done` (static terminal state; doors `display:none`). Dropping to `.rv-done` after
    ~3.4s is what stops the reveal **replaying when you return via Back** (re-showing a screen with
    lingering `.rv-open` animations would otherwise restart them). Honors `prefers-reduced-motion`.
  - Helpers are generalized to a screen id: `_resShowCompose(id)` (shows the closed/loading doors),
    `_playResReveal(fromCompose,id)` (opens), and `saveResKeep(nameId,emailId,msgId)`. The quiz path:
    `genResult()` now calls `_resShowCompose('s-res')` instead of `show('s-load')`, then `showResult()`
    opens. Photo path: `analyzePhoto()`/`retryPhoto()` call `_resShowCompose('s-photo-res')`, then
    `runPhotoAnalysis()` opens. `s-load` is KEPT (still used by the `?r=` restore-token page-load path).
  - The reveal **doors are `position:fixed; inset:0`** children of each screen (so only the active
    screen's render), `pointer-events:none` (never block taps), distinct SVG gradient ids per screen.
    On desktop they fill the whole window (wider than the 480px app column) — same accepted behavior as
    the Home entrance; on a phone it's perfect.
  - **Photo edge cases handled:** the "show me your full outfit" (`partial`) and error/timeout branches
    **hide the signature board + the "notes of" label** (`_photoSig(false)`) and drop their button
    ("Share a full outfit photo" / "Try again") onto the clipboard via a `#pAltAction` slot — so there's
    never an empty signature card. Success shows the full three boards.
  - **Save flow fully preserved.** The heart opens the existing bottom **save sheet**
    (`openSaveSheetManual`); the "Keep your portrait/results" block reuses the hardened `_persistSave()`
    core via `saveResKeep()`; the gentle auto-rise save sheet (`scheduleSaveSheet`) still fires; the old
    `staySection`/`staySectionPhoto` + `save-pin` blocks were removed from these two screens (their now-
    orphaned `saveUserData`/`saveUserDataPhoto` funcs are harmless dead code). `emailDone` hides the heart
    + keep block.
  - Every button re-pointed to its EXISTING handler — no functionality changed; this was design-only.
    Top-right Back (`resBack` on `s-res`, `showBack(photoPrevScreen)` on `s-photo-res`) preserved;
    `showBack` now scrolls to `.p3-lead` (was `.whatsnext-title`) when returning to a results screen.
  - Verified in Chromium for BOTH screens: closed → stars spinning → doors open → boards rise → settled
    (`rv-done`); shelves navigate; taps pass through after the reveal; Back doesn't replay; keep-save
    validation; photo success + partial (signature hidden, button on clipboard) all correct; no JS errors.
- **This closes most of the "▶ carry the look INWARD" TODO** — Home, Welcome Back, Style Portrait, and
  Outfit results now all share the chrome/gold/DM-Serif world. **Still inner-page work left:** the
  **quiz** screens, the **stylist chat**, the **Mall**, and the **footer pages** (Story/FAQ/Privacy/Edit)
  still use the older Fraunces/DM-Sans look — bring the cues there next for full consistency.
- The shareable **Style Card canvas** was left untouched (it's drawn separately); worth a real-device
  glance that it still looks right after this.

**2026-07-07 (▶ "Analyze an outfit" REIMAGINED — from a 2nd portrait → a styling session)**
- Cath's insight (spot-on): the photo feature *promised* feedback + styling tips + shopping ideas, but
  actually produced **another Style Portrait + 12-slider signature** from one photo — duplicating (and
  cheapening) the quiz's big identity reveal, and never delivering real tips or shoppable ideas. Reframe
  we agreed on: **the quiz = identity ("who you are"); the photo = action ("help me with what I'm wearing
  right now")**. Showed her a tap-through concept mockup (in scratchpad `photo-redesign.html`); she loved
  it and approved every piece.
- ✅ **Rebuilt the outfit result as a warm, ADDITIVE styling session** (same reveal-moment boards; new job):
  1. **What's Working** (clipboard `.p1`) — a genuine, specific celebration. Greeting "Styling your look,
     {name}", an optional **occasion pill**, then "✦ What's working" + the celebrate paragraph.
  2. **Finishing Touches** (`.p2` `#pTipsBoard`) — 2-3 numbered ADDITIVE tips (add a third piece / elevate
     the shoe / define the waist). Framed as *elevate*, never *fix* — nothing to feel bad about (Cath's
     safety priority).
  3. **Complete the Look** (`.p2.p2b` `#pShopBoard`) — 3-4 specific shoppable pieces that PAIR with what
     she's wearing (the jacket/shoes/belt/jewelry the tips call for), each a `getStoreUrl` search link +
     FTC disclosure. Her highest-intent buying moment.
- ✅ **Optional "Where are you headed?" occasion picker** on the upload screen (`s-photo`): chips
  Work / Date night / Weekend / Event / Just for fun + a "Skip — just style it" link. Stored in
  `photoOccasion`, passed into the prompt so tips + shopping tailor to the moment; fully skippable (zero
  friction). New fns `pickOccasion`/`skipOccasion`/`resetOccasion` (reset on every `showPhoto()`).
- **Under the hood:** `runPhotoAnalysis()` prompt fully rewritten → returns
  `{celebrate, tips[], shop[]}` (+ the `partial` "show me your full outfit" branch, now keyed on
  `celebrate`). New render helpers `_renderTips`/`_renderShop`; `_photoSig`→**`_photoBoards(on)`** shows/
  hides the tips+shop boards + "what's working" label together (hidden on partial/error). `max_tokens`
  300→**800** for the richer JSON. **Retired** the 12-slider chart on the photo path (`buildPhotoChart`/
  `getPhotoArch`/`#pChart`/`#pSigBoard`/`#pft` removed) — that identity belongs to the quiz.
- **Removed from the photo actions** (`.p3`): the **"View Style Card / Share" pair** (the photo card drew
  the now-gone signature/archetype identity — it would've fallen back to the *quiz's* data, which is
  wrong) and the **"Shop this style" hero** (redundant now that "Complete the Look" is the shopping).
  Kept: Save, Ask about this look, Refine preferences, Analyze another outfit, Style Star Edit, Shop the
  Mall. (Orphaned `saveStyleCard('photo')`/`sharePhotoResults`/`genOutfits('photo')` fns are now unused
  dead code but harmless.) **NOTE for Cath:** this drops the *share-your-outfit-card* growth loop on the
  photo path — flag if she wants a redesigned share for outfits later.
- **KEPT the current button name "Analyze an outfit"** per Cath (revisit later if a warmer name is wanted).
  Shop links are still untagged search URLs (same as the Mall) → become real revenue when affiliates
  approve.
- Verified in Chromium (stubbed AI): upload screen with occasion chips + selected/skip states; results
  render all three boards + actions correctly in the settled reveal state; no JS errors. **Worth a real-
  device glance + a live end-to-end test** (real photo through the Netlify function) before/after merge.

**2026-07-07 (cont. — honest "save" on the outfit screen + quiz-aware chat)**
- Cath spotted that "Save my results" on the outfit screen was a hollow promise: the save flow
  (`buildFullUserData`) only persists the QUIZ profile (name/answers/archetypes/portrait/prefs) + email —
  it does NOT save the photo's celebrate/tips/shop (those are ephemeral, generated live). So a quiz-SKIPPER
  who goes straight to photo analysis had nothing real to "save." Also flagged: the "Complete the Look"
  links open in a new tab (`target="_blank"`), so the analysis page stays intact while she shops link by
  link — it only disappears if she fully closes/reloads the app (that cross-visit gap is what a future
  "email me these tips" feature would fill). Agreed plan = ship the honest fixes (1-3) now; park the
  email-the-tips feature (#4) for a dedicated MailerLite/transactional-email session.
- ✅ **1-3 shipped (all quiz-awareness driven by the existing `quizTaken` flag + `topArchNames`):**
  1. **Honest save on the outfit results** (`_photoSaveArea()`): if she's taken the quiz → show the
     profile save with truthful copy — heart button "Save my style profile", keep block retitled
     "Come back anytime / Save your details so Style Star remembers you on any device / Save & remember me".
     If she has NOT taken the quiz → hide the save entirely and show a gold-framed **quiz-nudge card**
     (`#photoQuizNudge`: "Want everything styled to you? Take our fun style quiz →" → `startQ()`). "Retake
     the Quiz" is also hidden for skippers (they never took it). Partial/error hides the whole save area.
  2. **Removed the auto-rising save sheet on the photo path** (dropped `scheduleSaveSheet()` from
     `runPhotoAnalysis`) — it over-promised "save your results" for a page that doesn't save the outfit.
  3. **Stylist chat is now quiz-aware** (`sendChat` system prompt): it no longer hardcodes "who has taken
     the Style Star quiz." Quiz-takers → their real slider/archetype/prefs profile (as before). Skippers →
     told she hasn't taken it, give great general advice, and may ONCE gently invite her to our fun quiz
     when natural (never pushy, never repeated, never blocks the answer).
- Verified both states in Chromium (stubbed): skipper sees the quiz-nudge card + no save + no retake;
  quiz-taker sees the honest profile save; no JS errors.
- ▶ **STILL TO DO (#4, parked — needs backend): "✉️ Email me these tips & links."** Send the celebrate +
  finishing touches + shop links to her inbox — the real "save," a genuine conversion lever (shoppable
  links waiting in her inbox), and honest email capture. Needs a MailerLite transactional/automation email
  wired up (dedicated session). Framing stays: shopping in-app is the hero; email is the "keep these for
  later" safety net, not a competing CTA.
- ✅ **Removed the FTC disclosure from the "Complete the Look" board** (Cath's call — read as cringy). It
  was also *premature/inaccurate*: no affiliate programs are approved yet, so the links earn $0 and there's
  no affiliate relationship to disclose. ⚠️ **MUST RETURN when affiliate links go live** — fold into
  money-path step 7 ("[Claude] wire affiliate links + FTC disclosure"). FTC wants the disclosure **clear +
  conspicuous, NEXT TO the links** — the FAQ mention alone is NOT sufficient once links are tagged. When it
  returns, use a softer, on-brand line (e.g. "Some links may earn us a small commission, at no cost to
  you.") not the stiff "As an affiliate…" phrasing. Same disclosure still sits in the **Mall** (`s-shop`) —
  left as-is for now; same "premature now, must return when tagged" logic applies there too. (Confirm
  disclosure placement with Almira/Indie Law when applying to programs.)
