# Design handoff — Brainy Brands site

For Isabella. From Paolo.

The copy, page structure, and funnel logic are done and signed off. The visual
design is not — that's yours. This file is just the "here's what you're walking
into" so you don't have to reverse-engineer my markup.

---

## What's here

```
brainyamz-site/
├── index.html          Home
├── method.html         The Method
├── results.html        Results / case studies
├── about.html          About Dale
├── faq.html            FAQ
├── contact.html        Contact form
├── guide.html          Funnel — free guide opt-in
├── guide-thanks.html   Funnel — guide delivered
├── audit.html          Funnel — qualification form  ← the important one
├── book.html           Funnel — calendar
├── booked.html         Funnel — booking confirmed
├── not-a-fit.html      Funnel — off-ramp
├── privacy.html        Legal
├── terms.html          Legal
├── css/style.css       All styling, one file
├── FUNNEL-AND-SITEMAP.md   How the funnel works
└── DESIGN-NOTES.md         This file
```

Open `index.html` in a browser — it all works right now, just plain.

---

## Start here: the variables

Top of `css/style.css` there's a `:root` block with every color, font, and spacing
value in the site. Change those and everything updates at once. That's the fast
90% of a restyle:

```css
--color-accent: #1b4d3e;   /* buttons and links */
--font-body: ...;          /* system font placeholder */
--wrap: 1080px;            /* page width */
```

The colors and fonts in there right now are placeholders I made up. Replace them
with the real brand palette once the logo is done. Nothing is precious.

---

## Two things I'd ask you not to change

**1. The funnel pages have no nav on purpose.**

`guide.html`, `guide-thanks.html`, `audit.html`, `book.html`, `booked.html`, and
`not-a-fit.html` deliberately have no navigation menu. People land on these
straight from a Meta ad. Every link out is a person who doesn't fill in the form.
Style them however you want, but please don't add the nav back.

**2. The guarantee wording is locked.**

Anywhere you see this block:

> 25% less ad spend while maintaining sales and ranking.
> Available to accounts spending $10K+/month on Amazon ads, after a
> qualifying audit.

The second sentence has to stay attached to the first. It's a legal thing, not a
copy preference — the number without the qualifier is a bait-and-switch problem.
Make it look however you like, just keep the two together.

Same for the case study numbers on `results.html`. Those are real client figures
and the spellings are confirmed (Zestt Organics, Midtown Umbrellas / Yoan). Don't
round them to make them fit a layout.

---

## Classes you'll actually use

I kept it small on purpose.

| Class | What it does |
|---|---|
| `.wrap` | Centered container, max-width from `--wrap` |
| `.prose` | Constrains line length for readable text |
| `.lede` | The larger intro paragraph under a heading |
| `.eyebrow` | Small uppercase label above a heading |
| `.btn` / `.btn-secondary` / `.btn-block` | Buttons |
| `.grid` / `.grid-2` | Auto-fitting card grids |
| `.card` | Bordered box |
| `.callout` | The tinted guarantee panel |
| `.stat` / `.stat-label` | Big number + label on case studies |
| `.section-alt` | Alternate background band |
| `.video-embed` | 16:9 placeholder box |
| `.funnel` | Narrower container on funnel pages |

If you'd rather rip all of this out and use Tailwind or your own system, go for
it — just keep the HTML structure and the form `name` attributes intact, because
Emanuel is wiring the CRM to those.

---

## Placeholders waiting on assets

Search the files for `[` and you'll find them all. Currently:

- **Logo** — text placeholder in `<a class="logo">` in every header. Swap for the
  image when it's ready. (The old one was 184×108px, so anything you make is an
  upgrade.)
- **VSL** — `index.html` and `audit.html`, in `.video-embed` divs
- **Dale's photo** — `about.html`
- **Testimonial videos** — `results.html`, 3 slots. These may not arrive before
  launch. If they don't, delete that whole section rather than shipping empty
  boxes.
- **Calendar embed** — `book.html`, waiting on the URL from Dale
- **Legal blanks** — `privacy.html` and `terms.html` have `[BRACKETED]` items I
  need real answers for. Leave those to me.

---

## Notes on the old site

Things that were broken on the WordPress version, so we don't repeat them:

- The Contact Us button went nowhere
- The FAQ still had lorem ipsum on it
- It loaded slowly (NitroPack on top of WordPress)
- The brand video was a WhatsApp-compressed export

Which is the argument for keeping this as static HTML. It's fast by default and
there's no plugin stack to break. If you build in a tool that exports static
files, that's fine — just no WordPress.

---

## Accessibility — small stuff, please keep it

Not a big lift, just don't undo it:

- Every input has a real `<label>`. Placeholder text is not a label.
- Focus states are defined in the CSS (`.field input:focus`). If you restyle
  inputs, keep a visible focus ring.
- Contrast: aim for 4.5:1 on body text against its background. Whatever palette
  you land on, run it through a contrast checker once.
- There's a `.skip-link` at the top of each page. It's invisible until tabbed to.
  Leave it in.
- Heading order goes h1 → h2 → h3 without skipping. If you need a size change,
  change the CSS, not the tag.

---

## Questions

Anything about layout or visuals — your call, you don't need to ask.

Anything that changes wording, form fields, or where a button goes — check with
me first, because Emanuel's CRM automation is built against this exact flow and
changing a field name breaks it silently.
