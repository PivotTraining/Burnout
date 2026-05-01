# Brand assets — drop targets

BurnoutIQ is **self-contained**. It must not depend on pivottraining.us
being online for any image to render.

## Where to drop assets

### Client logos

Drop these eight files (PNG/SVG, transparent background, ~64–80px tall):

- `public/images/clients/johnson-johnson.png` — J&J
- `public/images/clients/cmsd.png` — Cleveland Metropolitan School District
- `public/images/clients/head-start.png` — Head Start
- `public/images/clients/cuny.png` — City University of New York
- `public/images/clients/espanola.svg` — Española Public Schools
- `public/images/clients/clark-county.svg` — Clark County School District
- `public/images/clients/northwest-arctic.svg` — Northwest Arctic Borough
- `public/images/clients/ch-uh.svg` — Cleveland Heights-University Heights

The `ClientLogoBar` and `ClientBadge` components prefer the image when
present and silently fall back to the typographic short label
(`J&J`, `CMSD`, etc.) if the file 404s. No code change is required when
you add real logos — just drop the files at the paths above.

### Founder + clinical photos

The `/about` page intentionally uses initials avatars (CD, JD, WW, TC)
today so the page doesn't depend on external photos. To swap in real
portraits, save them as:

- `public/images/team/chris-davis.jpg`
- `public/images/team/jazmine-davis.jpg`
- `public/images/team/whitney-ward.jpg`
- `public/images/team/tihera-clements.jpg`

then update `src/app/about/page.tsx` to render `<img>` instead of
initials. Keep aspect ratio square. Keep file size under 200 KB each.

### Whitepaper PDF

The whitepaper download is wired through `/api/whitepaper` which sends
an email with a PDF link controlled by `WHITEPAPER_PDF_URL` env var. To
self-host:

1. Save the PDF as `public/whitepaper/six-archetypes-of-burnout.pdf`
2. Set `WHITEPAPER_PDF_URL=/whitepaper/six-archetypes-of-burnout.pdf`
   (relative URL works because the email links absolute via
   `NEXT_PUBLIC_SITE_URL`).

### Open-graph image

Replace `public/og-image.png` with a 1200×630 BurnoutIQ-branded image
before launch. Currently inherits from the legacy site.
