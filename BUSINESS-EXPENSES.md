# Style Star — Business Expense Log

> ⚠️ **Not tax advice.** This is a running record for Cath's own bookkeeping and for her
> accountant. Keep the receipt / confirmation email for every line. Your accountant will
> advise how each is deducted (startup costs, software, legal, etc.) and whether to
> reimburse yourself from the business account or record personal-card spend as an
> owner investment once the LLC bank account is open.

## How to use this
1. Add **every** business expense here as it happens (date, vendor, what it's for, amount).
2. The fastest way to catch the recurring ones: **scan your credit-card / bank statements**
   for repeating charges, and open each service's **billing page** to see your plan + price.
3. Once the **business bank account is open**, run all business expenses through it and keep
   business + personal money separate (protects the LLC, simplifies taxes).

---

## ✅ Confirmed — Legal & Formation (paid on Cath's personal card)
| Date | Vendor | What it's for | Amount | Frequency | Receipt? |
|------|--------|---------------|--------|-----------|----------|
| (confirm) | Indie Law | TM Max package (trademark + LLC formation service) | $3,999.00 | one-time | find email |
| 2026-06-30 | Indie Law / LawPay | Florida LLC state filing fee | $130.00 | one-time | LawPay email |
| 2026-06-30 | Indie Law / LawPay | USPTO trademark filing fees (2 marks × 3 classes × $350) | $2,100.00 | one-time | LawPay email |

**Legal subtotal so far: $6,229.00**

---

## ✅ Confirmed — Software & services (paid on Cath's personal card)
| Date paid | Vendor | What it's for | Amount | Frequency | Renews | Notes |
|-----------|--------|---------------|--------|-----------|--------|-------|
| 2026-07-21 | **MailerLite** | Email list + welcome-email automation | **$205.20** | annual | ~2027-07-21 | Covers up to **1,000 subscribers** — must upgrade the plan when the list grows past that (see ⚠️ below). |
| 2026-07-17 | **Plausible** | Website analytics | **$90.00** | annual | ~2027-07-17 | |
| (recurring) | **Netlify** | Hosting + serverless functions | **$33.00** | monthly | — | ≈ $396/yr |
| (recurring) | **Claude Max** | The subscription used to build the app | **$249.99** | monthly | — | ≈ $3,000/yr |

> ⚠️ **MailerLite 1,000-subscriber cap.** The current $205.20/yr plan covers up to 1,000
> subscribers. **Once we launch, watch the subscriber count** — when it approaches 1,000 the
> plan must be upgraded to the next tier (MailerLite pricing scales by subscriber count). Check
> the subscriber number in the MailerLite dashboard (or the "Style Star Signups" group).
> **▶ Post-launch to-do: set a reminder to review subscriber numbers periodically so the upgrade
> isn't a surprise.**

---

## 🔍 To verify — Software & services (check each billing page + your statements)
Amounts below are *rough typical ranges* to help you find them — **replace with your actual charges.**

| Vendor | What it's for | Typical cost | Status to confirm |
|--------|---------------|--------------|-------------------|
| **Anthropic (Claude API)** | Powers the AI write-ups, stylist chat, photo analysis (`ANTHROPIC_API_KEY`) | usage-based, roughly **10-15¢ per woman** who uses the app fully (see below) | **PAID — check console.anthropic.com → Usage** (a SEPARATE account from Claude Max) |
| **Supabase** | Stores user data (the `users` table) | ~$25/mo (Pro) | **PAID** — CLAUDE.md notes you're on the paid plan; verify exact amount |
| **GoDaddy** | Domain / website registration (Cath to look up cost) | ? | **▶ LOOK UP** — Cath to check the GoDaddy billing/statement for the annual cost |
| **GitHub** | Code hosting (the repo) | free, or ~$4/mo (Pro/paid) | **▶ LOOK UP** — Cath unsure if she pays; check the GitHub billing page |
| **Domain — stylestar.app** | Your web address (annual registration) | ~$12–25/yr | **PAID** — confirm the registrar (Netlify DNS hosts it, but who is the registrar — GoDaddy?) |
| **iCloud+** | Custom email domain for hello@stylestar.app | ~$1–3/mo (part of your Apple plan) | **PAID** (bundled in iCloud+) |
| **Canva** | Design (mockups, graphics) | free, or ~$13/mo Pro | verify (free or Pro?) |

---

## 🤖 What the app's AI actually costs (measured 2026-07-27)

**Two different Anthropic bills, easy to confuse:**
- **Claude Max, $249.99/mo, billed at claude.ai** — Cath's own subscription for *building* the app.
  Flat fee, unaffected by how many people use Style Star.
- **Claude API, pay-per-use, billed at console.anthropic.com** — what the *app* spends when a woman
  takes the quiz, shops, uploads a photo, or chats. This is the one that grows with real users.
  **▶ Check spend at console.anthropic.com → Usage.**

The app runs on **Claude Sonnet 4.6**: **$3 per million words-in, $15 per million words-out**
(tokens, roughly ¾ of a word each). In practice that is fractions of a cent per action:

| What she does | Cost | How we know |
|---|---|---|
| Shop your style (6 picks) | **~0.9¢** | measured on a real call |
| Wardrobe "Ideas" (4 options) | ~0.7¢ | estimated |
| Shop my whole wishlist (16 picks) | ~1.9¢ | estimated |
| Analyze an outfit (includes the photo) | ~1.9¢ | estimated |
| Quiz Style Portrait | ~1¢ | estimated |
| One stylist chat message | ~1.4¢ | estimated, grows with conversation length |

**A woman who does everything ≈ 10-15¢.** So **1,000 women ≈ $100-150**, and that only happens if
1,000 women actually use it. Today it is Cath, her mom and her sister, so the bill is a few dollars.

⚠️ **The one real risk: the API runs on prepaid credits.** If the balance hits zero, every AI feature
in the app stops working (the quiz, chat, photo analysis, all shopping) while the site stays up.
**Turn on auto-reload, or check the balance before any launch or press.**

📌 Note: the fully tagged 102-store list pushed a shop from ~0.4¢ to about **0.9¢**. A shortlist was
built that would have halved it again, then deliberately removed: it saved under half a cent per shop
(roughly $19 a year at 1,000 active women) at the risk of hiding a store a woman would have wanted.
Not a trade worth making at this scale. The stores are now sorted best-fit-first instead of trimmed,
which delivers the quality gain with nothing hidden.

---

## 💵 Recurring-cost snapshot (confirmed items only — rough annualized)
Helps see the ongoing "burn." Update as amounts get confirmed.

| Vendor | Monthly | Annualized |
|--------|---------|------------|
| Claude Max | $249.99 | ~$3,000 |
| Netlify | $33.00 | ~$396 |
| MailerLite | — | $205.20 |
| Plausible | — | $90.00 |
| **Confirmed recurring total** | **~$283/mo + annuals** | **≈ $3,691/yr** |

*(Not yet included: Anthropic API usage, Supabase, GoDaddy, GitHub, iCloud+, Canva — add once confirmed.)*

---

## 📝 Other / to consider
- Any stock photos, premium fonts, or future tools (e.g., Stripe fees when a paid tier launches).
- The old **"Your Fashion Friend"** sole-prop costs (separate business — keep distinct).

## Notes
- **Pre-account spend:** until the business bank account exists, business costs are on Cath's
  personal card. Document them here; your accountant will reimburse/record them correctly later.
- **Recurring vs one-time:** the software services renew monthly/annually — worth a note in your
  calendar so renewals aren't a surprise.
