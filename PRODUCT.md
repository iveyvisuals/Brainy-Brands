# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** Amazon sellers spending $10,000+/month on Amazon ads, frustrated with
rising ad spend that doesn't translate into more sales, agency turnover (multiple
account managers over time), slow response times from their current agency/freelancer,
and a sense that their account has outgrown the campaign structure it was built on.
These are the people the qualification funnel (`audit.html`) is built to surface —
the audit gate passes only ad spend of $10K–$25K, $25K–$50K, or $50K+/month.

**Secondary (nurture):** Amazon sellers spending under $10K/month. They don't qualify
for the audit yet, so they're routed to a free guide opt-in and email nurture instead
of the booking calendar, with the goal of qualifying later as they scale.

## Product Purpose

Brainy Brands is Dale's fully-managed Amazon PPC/advertising service. It exists to fix
a specific, recurring problem: Amazon's default ad settings (dynamic bidding, placement
multipliers) are on by default and quietly cost sellers more per click over time. The
service manually manages bids top-down instead of letting Amazon's algorithm run
unsupervised. Success is measured concretely: 25% less ad spend while maintaining sales
and ranking (the locked guarantee language — see Evidence on Hand), plus
the revenue growth documented in the six case studies.

## Positioning

The mechanism a competing agency could not truthfully copy: manual, top-down bid
management with dynamic bidding and placement multipliers turned off, managed
personally by one person (Dale — not a pod, not a rotating junior, not an offshore
"success manager"), billed as a flat fee rather than a percentage of ad spend (so
cutting the client's spend costs the agency nothing). Backed by a specific, published
guarantee number rather than a vague promise.

## Operating Context

- Static HTML/CSS/JS site, no build tooling, no CMS — deliberately, to avoid the
  WordPress/plugin-stack problems (slow load, fragile) of the old site.
- Two distinct page groups: **main site** (has nav — Home, The Method, Services,
  Results, About Dale, FAQ, Contact) and **funnel pages** (no nav, ad-traffic
  destinations only: `guide.html`, `guide-thanks.html`, `audit.html`, `book.html`,
  `booked.html`, `not-a-fit.html`). The no-nav constraint on funnel pages is
  deliberate and must be preserved — every link out is a lost conversion.
- Traffic sources: cold Meta ads → `audit.html` gate; organic/ManyChat "AMAZON"
  keyword → `guide.html` first; ManyChat "AUDIT" keyword / warm referral →
  `audit.html` directly.
- The qualification logic in `audit.html` (ad spend, revenue, current manager fields)
  is UX only — GoHighLevel (GHL) re-runs the real gate server-side. Form `name`
  attributes are wired to GHL/ManyChat automations by a separate collaborator
  (Emanuel); changing a field name silently breaks that automation.
- **Currently pre-launch.** Per `FUNNEL-AND-SITEMAP.md`, still open as of this
  writing: CAPI (server-side conversion tracking) not yet live — this blocks sending
  real ad traffic to these pages; calendar embed URL for `book.html` still a
  placeholder pending Dale; guide PDF ("The 4 things quietly draining your Amazon ad
  budget") not finalized; VSL video embed on `index.html`/`audit.html` still a
  placeholder. (The logo has since been added, and the `results.html` testimonial
  placeholder section has since been removed rather than shipped empty.)
- Ownership split: Paolo (STC) owns copy, page structure, and funnel logic — changes
  to wording, form fields, or button destinations should be checked with him since
  Emanuel's CRM automation is built against the exact current flow. Isabella owns
  visual design. Dale is the end client / subject-matter source.

## Capabilities and Constraints

- No WordPress, no plugins — plain static files only.
- Contact form (`contact.html`) currently posts to `action="#"` — a placeholder
  pending the real GHL contact-form endpoint.
- Legal pages (`privacy.html`, `terms.html`) are structural drafts with bracketed
  placeholders, explicitly reserved for Paolo to fill in — not to be authored as
  real legal content.
- Case study figures and client names (Magic Brand, Midtown Umbrellas/Yoan, Zestt
  Organics, Temp Tooth, Patriot Crew, Emerald Plastics) are real, confirmed numbers —
  never round, paraphrase, or alter them.
- The guarantee statement ("25% less ad spend while maintaining sales and ranking —
  or you don't pay. Available to accounts spending $10K+/month on Amazon
  ads, after a qualifying audit.") is locked wording. The qualifier sentence must
  never appear without the headline number, on any page. If it changes, it changes in
  `FUNNEL-AND-SITEMAP.md` first, then everywhere at once — never page by page.

## Brand Commitments

- Name: Brainy Brands. Founder/operator: Dale — positioned by name throughout the
  site ("You'll be working with Dale. Just Dale.").
- Voice: direct, specific, allergic to vague agency-speak — leads with concrete
  numbers and named failure modes rather than generic promises.
- Head office (footer/legal): 1007 N Orange St. 4th Floor, Wilmington, Delaware 19801.

## Evidence on Hand

- Six real, locked case studies with before/after Amazon revenue figures (see
  `results.html` and `FUNNEL-AND-SITEMAP.md` for the confirmed table): Magic Brand,
  Midtown Umbrellas (Yoan), Zestt Organics, Temp Tooth, Patriot Crew, Emerald
  Plastics. Case-study logos exist for ClearShield, Patriot Crew, Emerald Plastics,
  Magic Brand, Midtown Umbrellas, Zestt Organics, and Temp Tooth in
  `images/casestudylogos/`.
- "Highest-ranked 'Amazon Expert' worldwide on Upwork" — Dale's stated credential.
- Amazon advertising certifications held directly by Dale (not a subcontractor):
  Campaign Optimization, Advertising Foundations, DSP Advanced, Marketing Cloud,
  Video Ads, Advanced Retail.
- Real Seller Central screenshots (A+ content build-outs, 3D product renders, PPC
  performance screenshots) referenced on `portfolio.html`.
- **Explicitly absent, do not fabricate:** video testimonials (placeholder section
  removed rather than shipped empty — do not reintroduce fake ones), a finalized VSL,
  a live calendar embed URL, a finalized guide PDF, real legal copy for
  privacy/terms.

## Product Principles

1. The audit gate exists to filter for people Dale can actually help — never soften
   or remove it to raise conversion volume; unqualified volume was the problem being
   solved.
2. Funnel pages convert; main-site pages inform and build trust. Never blur the two
   (e.g., don't add nav to a funnel page, don't add a hard qualification gate to a
   main-site page).
3. Every claim on the site must be a real, checkable number (case studies, the
   guarantee, certifications) — never a generic "we get results" claim standing
   alone.
4. Speed and personal attention are the product, not just marketing copy: one person
   managing the account, 24-hour response, flat fee — these operational facts should
   stay visible and specific wherever the site talks about how the service works.
5. Static-HTML simplicity is deliberate technical debt avoidance, not a limitation to
   route around — prefer plain HTML/CSS/JS solutions over introducing build tooling
   or a CMS.

## Accessibility & Inclusion

- Every form input has a real `<label>` — placeholder text does not substitute for one.
- Visible focus states required on all interactive elements (inputs currently define
  `:focus` styling — preserve or replace with an equally visible ring).
- Target 4.5:1 contrast minimum for body text against its background.
- A `.skip-link` (invisible until tabbed to) is present at the top of every page —
  keep it.
- Heading order must go h1 → h2 → h3 without skipping levels; use CSS for size
  changes, not heading-level changes.
