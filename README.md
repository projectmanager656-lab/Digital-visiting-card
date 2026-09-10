# Digital Visiting Card App

Built for **AASHA-SM Technologies Pvt. Ltd.** — a client-facing digital business card
product: each client gets a mobile-first card page with a unique link and QR code,
one-tap Save Contact / WhatsApp / Call / Directions buttons, and social links.

This build implements everything in sections 1, 2, 3, 4.1–4.4 and 4.6 of the spec
(admin form, public card page, QR generation, vCard + WhatsApp/Call buttons, three
industry themes, per-field toggles). Section 4.5 (view-count analytics) is included
as a basic counter. What's **not** wired up yet is real Firebase — see below.

## Running it

```bash
npm install
npm run dev       # local dev server
npm run build      # production build -> dist/
```

Works completely standalone — no API keys or accounts needed to try it. Cards are
stored in the browser's `localStorage`, so data is per-browser, not shared across
devices yet (that's what the Firebase step below fixes).

## How it's organized

```
src/
  data/store.js         <- all card CRUD (currently localStorage; see below)
  utils/vcard.js         <- builds the .vcf file for "Save Contact"
  utils/image.js          <- resizes/compresses uploaded photos before storing
  themes/themes.js         <- the 3 color themes (gold / bloom / harvest)
  components/CardBody.jsx   <- the actual card layout — shared by the live
                               preview in the admin form AND the public page,
                               so they can never drift out of sync
  components/Icons.jsx       <- small inline SVG icon set (no icon library needed)
  components/FormBits.jsx     <- toggle switch / labeled field / input primitives
  pages/Dashboard.jsx          <- admin: list all cards, create/edit/delete/copy link
  pages/CardForm.jsx            <- admin: create/edit a card with field toggles
  pages/PublicCard.jsx           <- the public card at /card/:slug
```

## Routes

| Route | Purpose |
|---|---|
| `/` | Admin dashboard — list of all cards |
| `/new` | Create a new card |
| `/edit/:id` | Edit an existing card |
| `/card/:slug` | The public card a client's customers actually see |

## What's built vs. what the spec still asks for

**Done:**
- Admin form with per-field show/hide toggles (spec section 4.6 design note)
- Public card page: photo, name, designation, business, logo, Save Contact (vCard),
  WhatsApp Me, Call Now, Get Directions, social icons, tagline, hours, reviews link
- Auto-generated QR code per card (shareable in-app)
- 3 themes matching the spec's suggested industries: **Gold** (jewellery/boutique),
  **Bloom** (salon/studio), **Harvest** (restaurant/cafe)
- Slug uniqueness check, live preview while editing, basic view counter

**Left for the next pass (needs real backend decisions, not just more code):**
- Swap `src/data/store.js` from localStorage to Firebase Firestore — every function
  in that file is already shaped like a Firestore call on purpose (see the comment
  at the top of the file), so this is a rewrite of ~5 small functions, not a redesign
- Firebase Storage for photo/logo uploads instead of embedding them as base64 (the
  base64 approach works fine for a handful of clients but won't scale)
- Client self-service login (today the admin form has no auth — it's meant to be
  used by your team, per the spec's "initially filled by the team" note)
- Downloadable QR **image file** (currently shareable/viewable in-app; wiring up a
  PNG/SVG download button is a small addition once you're ready)
- Deploying to Firebase Hosting / Vercel with a real domain (`smtech.in/card/...`)

## Notes on the themes

Each business type in the spec maps to a theme:
- Gold/Jewellery → **Gold** theme (deep charcoal + antique gold)
- Salon → **Bloom** theme (blush pink, soft rounded)
- Restaurant → **Harvest** theme (forest green + warm cream, menu-card feel)

Add a 4th theme by adding one object to `THEMES` in `src/themes/themes.js` — nothing
else needs to change.
