# Eran Israeli — Landing Page

Single-file static landing page for **ערן ישראלי**, a one-person iron/metal designer and manufacturer based in Israel.

## Stack
- Pure HTML + CSS + JS inline in `index.html` — no build tool, no framework
- Hebrew RTL (`dir="rtl"` on `<html>`, `direction: rtl` on `body`)
- Font: Heebo from Google Fonts
- **Backend**: Express + SQLite (`node:sqlite`) in `api/` — serves `index.html`, gallery images, admin SPA, and REST API on port 3000
- **Admin panel**: Vue 3 + Vite + Tailwind in `admin/` — built SPA served at `/admin/`
- Local dev: `cd api && npm run dev` → open `http://localhost:3000` (do NOT use the Python server — it can't serve the API)
- Deployment: deploy the Node.js Express server (e.g. Render, Railway, Fly.io). For a separate API host, set `API_BASE` in `index.html` to the absolute API URL.

## File structure
```
index.html          ← entire site (CSS + HTML + JS); fetches all data from API
eran-profile.png    ← hero full-cover background + about section photo
gallery/            ← product images (seeded + uploaded via admin)
  railing-ornate.png, staircase-1.png, staircase-2.png   → category: railings
  shelf-mesh.png, table-glass.png, stools-display.png,
  table-glass-2.png, table-bases.png, tables-round.png,
  furniture-showroom.png                                  → category: furniture
  chair-outdoor.png, sofa-outdoor.png                     → category: garden
  panel-large.png                                         → category: special
api/
  index.js          ← Express server (port 3000)
  db.js             ← node:sqlite setup + migrations
  seed.js           ← seeds categories, gallery, testimonials, admin user
  data.db           ← SQLite database (gitignored)
  routes/           ← auth, gallery, categories, testimonials
admin/
  src/              ← Vue 3 SPA (Vite + Tailwind)
  dist/             ← built SPA (gitignored, served at /admin/)
```

## API_BASE in index.html
`const API_BASE = ''` at the top of the `<script>` block.
- `''` = same origin (works when Express serves the page — local dev and production on a single server)
- Set to an absolute URL (e.g. `'https://api.yourdomain.com'`) if hosting the API separately from the frontend.

## Color palette (CSS variables)
```css
--iron-dark: #1e2530    /* dark nav/stat backgrounds */
--iron-mid:  #3a4555    /* mid-tone elements */
--iron-light: #5a6880
--iron-gray:  #8a9ab0
--gold:       #b8964e   /* primary accent — dividers, borders, labels */
--gold-light: #d4af6a   /* hero text, hover states */
--text-dark:  #0f1520
--text-mid:   #2e3d52
--text-light: #5a6880
```

Body background: fixed vertical gradient `#f2f5f8```````` → ````````#e2eaf2```````` → ````````#cdd8e6```````` → #b8c8d8` (light to steel-blue).

## Key CSS notes
- `direction: ltr` is explicitly set on `.carousel-wrap` to override RTL inheritance so carousel buttons appear left/right correctly
- Section backgrounds are semi-transparent horizontal gradients over the fixed body background (glass-morphism feel)
- `#testimonials` has a dark `rgba(18,28,45,0.93)` background — white text inside
- Hamburger nav triggers at `max-width: 768px`; mobile carousel (1 item) also at `768px`
- Shared carousel CSS: `.carousel-wrap`, `.carousel-viewport`, `.carousel-track`, `.carousel-btn`, `.carousel-dots`, `.carousel-dot`, `.carousel-counter` — used by both gallery and testimonials
- Gallery items: `.gallery-item { flex: 0 0 calc(33.333% - 10px) }` (desktop), `100%` on mobile
- Testimonial items: `.testimonial-item { flex: 0 0 calc(33.333% - 10px) }` (desktop), `100%` on mobile

## makeCarousel factory (JS)
Single factory function in `index.html` that creates self-contained carousel instances. Both gallery and testimonials use it.

```js
const carousel = makeCarousel({
  trackId, prevId, nextId,
  counterId,   // optional — shows "X–Y מתוך N" text counter
  dotsId,      // optional — renders clickable dot indicators
  getVisible,  // () => number of visible items (responsive)
  gap,         // px gap between items (default 14)
  autoplay,    // pixels/second for continuous scroll (0 = off)
});
// Returns: { build(items, renderFn), slide(dir), jump(idx), reset() }
```

- `build()` rebuilds track HTML, resets position, re-starts autoplay
- `slide(dir)` / `jump(idx)` use CSS transition for animated discrete jumps
- Autoplay uses `requestAnimationFrame` for pixel-by-pixel smooth flow; loop-back is 1-frame instant
- Hover on `.carousel-wrap` pauses autoplay; mouse-leave resumes from current position

### Gallery carousel
- `getVisible: () => window.innerWidth <= 768 ? 1 : 3`
- `autoplay: 60` (60px/sec continuous scroll, pauses on hover)
- Filter buttons call `buildTrack()` which calls `galleryCarousel.build(filteredItems(), renderFn)`
- Resize handler (debounced 150ms) calls `galleryCarousel.reset()` and `testimonialCarousel.reset()`

### Testimonials carousel
- `getVisible: () => window.innerWidth <= 768 ? 1 : 3`
- No autoplay, dots only (no text counter)

## Lightbox
- Full-screen overlay with prev/next nav and keyboard support (ArrowLeft/Right, Escape)
- Navigates within the currently filtered item set

## Hamburger nav
- Button `#navHamburger` toggles `.open` on itself and `#navLinks`
- `.open` on `#navLinks` switches it from `display:none` to `display:flex` (column dropdown)
- Animates 3 spans into an X when open
- Any nav link click closes the menu

## Sections (in order)
1. `<nav>` — fixed, 64px, glass background
2. `.hero` — full-viewport, `eran-profile.png` as cover background + dark overlay
3. `#about` — 2-col grid (text + photo); photo hidden on mobile
4. `#gallery` — filter buttons + carousel (autoplay) + lightbox
5. `#testimonials` — dark section, 3-card slide carousel (1 on mobile)
6. `#contact` — 2-col grid (info + form)
7. `<footer>` — dark, single line

## SQLite migration note
`admin_users` was created without `created_at` in early DBs. `api/db.js` runs a migration:
```js
db.exec("ALTER TABLE admin_users ADD COLUMN created_at DATETIME");
```
`ALTER TABLE ADD COLUMN` in SQLite does NOT support `DEFAULT CURRENT_TIMESTAMP` (non-constant default) — omit the default and let it be NULL for existing rows.
## Repository
- **GitHub:** https://github.com/Moo12/eran-landing-page (private)
- **Remote:** `git@github.com:Moo12/eran-landing-page.git` (SSH)

## Client context
- Client: ערן ישראלי
- Language: Hebrew only
- Placeholder contact details (phone/email) need to be replaced with real ones before going live
- Gallery images are screenshots from client's Instagram
