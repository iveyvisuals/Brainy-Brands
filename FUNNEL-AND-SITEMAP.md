# Brainy Brands — Sitemap and Funnel Flow

Last updated: Aug 6, 2026
Owner: Paolo (STC)
Build: static HTML, no WordPress. Isabella designs on top. Emanuel wires GHL/ManyChat.

---

## The one-sentence version

Cold Meta traffic lands on a page, gets told exactly what Dale fixes, and hits a short
qualification form. People spending $10K+/mo on Amazon ads see the calendar. Everyone
else gets the free guide and goes into email nurture instead of onto Dale's calendar.

---

## Sitemap

**Main site** (nav visible)

| Page | File | Purpose |
|---|---|---|
| Home | `index.html` | Main entry. Problem → method → proof → audit CTA. |
| The Method | `method.html` | How manual top-down bidding works and why dynamic bidding costs you. |
| Results | `results.html` | The six case studies with real numbers. |
| About Dale | `about.html` | Single account manager, 24-hr response, no % of ad spend. |
| FAQ | `faq.html` | Objections, guarantee terms, pricing model, what happens on the call. |
| Contact | `contact.html` | For people who don't want a call yet. |

**Funnel pages** (no nav, no exits — these are ad destinations)

| Page | File | Purpose |
|---|---|---|
| Free guide opt-in | `guide.html` | Lead magnet landing page. Email capture. |
| Guide thank-you | `guide-thanks.html` | Delivers guide + soft pitch to the audit. |
| Audit qualification | `audit.html` | The gate. Short form, decides who sees the calendar. |
| Book the audit | `book.html` | Calendar embed. Only reachable by passing `audit.html`. |
| Booking confirmed | `booked.html` | Prep instructions so the call isn't wasted. |
| Not a fit (yet) | `not-a-fit.html` | Graceful off-ramp → free guide instead. |

**Legal** (footer only)

| Page | File |
|---|---|
| Privacy Policy | `privacy.html` |
| Terms | `terms.html` |

---

## The flow

### Path A — Cold ad traffic (main path, all 14 launch ads)

```
Meta ad
  ↓
audit.html  (qualification form)
  ↓
  ├── PASS  → book.html  → booked.html
  │           (calendar)    (prep + no-show reduction)
  │
  └── FAIL  → not-a-fit.html
              ↓
              guide.html → guide-thanks.html → email nurture
```

**Why the gate comes first:** Dale's 2024 campaign produced leads at $17–70 but only
~10% were real qualified calls. The gate is the fix. Fewer bookings, but they're bookings
Dale actually wants.

### Path B — Guide-first traffic (organic + ManyChat "AMAZON" keyword)

```
Organic Reel / carousel → comment "AMAZON"
  ↓
ManyChat DM with link
  ↓
guide.html → guide-thanks.html → email nurture → audit.html → book.html
```

### Path C — Warm / referral / ManyChat "AUDIT" keyword

```
"AUDIT" comment → ManyChat DM → audit.html → book.html
```

Same gate. No exceptions. If Dale wants to hand someone a direct calendar link,
that's a manual GHL link, not a site page.

---

## Qualification logic (`audit.html`)

Five fields. Do not add more — every extra field costs bookings.

1. **Name** — text, required
2. **Work email** — email, required
3. **Monthly Amazon ad spend** — select, required
   - Under $5K/mo
   - $5K – $10K/mo
   - $10K – $25K/mo
   - $25K – $50K/mo
   - $50K+/mo
4. **Monthly Amazon revenue** — select, required
   - Under $50K/mo
   - $50K – $100K/mo
   - $100K – $500K/mo
   - $500K+/mo
5. **Who manages your ads now?** — select, required
   - Nobody / I do it myself
   - An agency
   - A freelancer / VA
   - In-house team

**PASS rule:** ad spend is `$10K – $25K`, `$25K – $50K`, or `$50K+`
**FAIL rule:** ad spend is `Under $5K` or `$5K – $10K`

That's it. Revenue and current-manager fields do not gate anything — they're for Dale's
call prep and for segmenting the nurture sequence. Keep them, but don't let them block.

**Important:** the client-side JS in `audit.html` is a UX convenience, not security.
Emanuel should re-run this rule server-side in GHL before the calendar invite fires.
Anyone can bypass the JS and hit `book.html` directly.

---

## What Emanuel needs to wire in GHL

**On qualification form submit (PASS):**
- Create/update contact, tag `audit-qualified`
- Add to pipeline stage: `Audit Booked — Pending`
- Redirect to `book.html`

**On qualification form submit (FAIL):**
- Create/update contact, tag `below-floor`
- Add to the guide nurture sequence, NOT the audit sequence
- Redirect to `not-a-fit.html`

**On calendar booking confirmed:**
- Move to pipeline stage `Audit Scheduled`
- Fire the prep sequence: confirmation email immediately, reminder 24 hrs out,
  reminder 1 hr out, SMS 1 hr out
- This is the no-show fix — the current 3-emails-over-5-days-then-stop automation
  has no booking-specific track at all

**On guide opt-in:**
- Tag `guide-downloaded`, deliver the PDF
- Nurture sequence needs an escalation step past Day 5. Current automation dead-ends.

**Speed-to-lead:** any `audit-qualified` contact that hasn't booked within 15 minutes
should trigger a Slack notification to Dale. The 21-leads-sitting-125-days problem was
a routing problem, not a lead problem.

---

## Tracking

Every form needs a distinct event. Pixel alone will undercount — CAPI must be live
before these pages get ad traffic.

| Event | Fires on |
|---|---|
| `Lead` | Guide opt-in submit |
| `SubmitApplication` | Qualification form submit (PASS only) |
| `Schedule` | Calendar booking confirmed |

Do not fire `Lead` on a FAIL submit. It teaches the pixel to find people below the floor,
which is exactly the problem we're fixing.

UTM convention on all ad links: `?utm_source=meta&utm_medium=paid&utm_campaign={campaign}&utm_content={ad_name}`

---

## Guarantee language — locked

The only approved public phrasing, used identically on every page:

> **25% less ad spend while maintaining sales and ranking — or you don't pay.**
> Available to accounts spending $10K+/month on Amazon ads, after a qualifying audit.

Rules:
- The qualifier sentence is not optional. It appears everywhere the number appears.
- Do not use any "scaling toward 50%" claim. It was removed to avoid over-promising.
  Never use the old 30% figure from the retired VSL — it carried different conditions
  and mixing them is a bait-and-switch exposure.
- If Dale asks to change this, it changes in `FUNNEL-AND-SITEMAP.md` first, then
  everywhere at once. Not page by page.

---

## Case study numbers — locked

Confirmed spellings and figures. Do not paraphrase or round.

| Client | Result |
|---|---|
| Magic Brand | $0 → $450K/month in 4 months |
| Midtown Umbrellas (Yoan) | $6K → $300K/month in 3 months |
| Zestt Organics | $50K → $110K/month in 2 months, 40% ad spend cut |
| Temp Tooth | $90K → $120K/month, 70% ad spend cut |
| Patriot Crew | $174K → $388K/month |
| Emerald Plastics | Cold launch → $6,545/month by month two, units up 164% |

---

## Open items before launch

- [ ] CAPI live (Emanuel) — blocks ad traffic to these pages
- [ ] Calendar embed URL from Dale — placeholder in `book.html`
- [ ] Guide PDF finalized: "The 4 things quietly draining your Amazon ad budget"
- [ ] VSL embed for `index.html` and `audit.html` — placeholder in place
- [ ] Video testimonials — placeholder slots on `results.html`
- [ ] Logo from Isabella — text placeholder in header right now
- [ ] Privacy/terms reviewed — current versions are structural drafts, not legal advice
