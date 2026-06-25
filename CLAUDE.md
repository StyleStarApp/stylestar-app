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

You don't need a folder on your computer. Your whole project lives on **GitHub**
(`StyleStarApp/stylestar-app`), and this file is the shared memory between sessions.

To pick up where you left off:

1. Go to **claude.ai/code** (or open the Claude app and choose **Code**).
2. Open the project / repo: **`stylestar-app`**.
3. Start a session and just say what you want to change. Claude reads this file
   automatically, so you never have to re-explain the project.

How things "save":
- **Merging a Pull Request = saving + going live.** That's it.
- Anything merged (or pushed to a branch) is on GitHub forever and recoverable.
- The temporary chat workspace disappears between sessions — that's fine, because
  the real project is always safe on GitHub.

Quick reference:
- **Code & history:** github.com/StyleStarApp/stylestar-app
- **Live site:** served by Netlify (auto-deploys from `main`)
- **Emails / user data:** Supabase

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
- **Swap the welcome-email footer address (privacy).** The MailerLite welcome email
  currently shows Cath's home address in the footer (legally required physical
  address). Replace it with a PO Box / business address once she has one — update it
  in MailerLite (company/footer settings); it changes everywhere at once. Note:
  MailerLite locks the legal address's font size on send, so it can't be shrunk —
  the footer was made uniform instead.
- (add more ideas here)

**2026-06-23 (email setup session)**
- Set up **Plausible** analytics (script in `index.html`, verified).
- Wired signups into **MailerLite** (`user-data.js` adds them to the
  "Style Star Signups" group via `MAILERLITE_API_KEY`). Debugged a paused-Supabase
  outage along the way (Supabase now on the paid plan).
- Built a **welcome-email automation** in MailerLite (logo, Georgia/brand styling,
  copy, photo-upload bullet, Instagram link, gold "Explore Style Star" button →
  `stylestar.app`). **Activated** — sends automatically to new signups only.

**2026-06-24 (sender-domain authentication — IN PROGRESS, revisit)**
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
  forwards hello@stylestar.app → her existing inbox. Not done yet — revisit.
