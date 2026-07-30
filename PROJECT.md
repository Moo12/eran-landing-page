# ערן ישראלי — Project Overview

Business website for **ערן ישראלי**, a one-person iron/metal designer and manufacturer based in Israel.

## Project Components

### 1. Landing Page (`index.html`)
- Single-file site — pure HTML + CSS + JS, no build tool
- Hebrew RTL, showcases work and enables client contact
- Fetches all dynamic content (gallery, testimonials, categories) from the Express API
- Gallery: filterable slide carousel with smooth autoplay (60px/sec, pauses on hover)
- Testimonials: slide carousel (3 per page desktop, 1 mobile) — same `makeCarousel` factory as gallery
- Lightbox: full-screen image viewer with keyboard nav (ArrowLeft/Right, Escape)

**Status:** Complete — ready for client demo

### 2. API Server (`api/`)
- Express + SQLite (`node:sqlite` — built-in, no native compilation required)
- Serves `index.html`, gallery images, admin SPA, and REST API — all on port 3000
- Tables: `categories`, `gallery_items`, `testimonials`, `admin_users`
- Auth: bcryptjs + JWT (7-day tokens)
- Image uploads: Multer → `gallery/` directory, UUID filenames
- Run: `cd api && npm run dev`

**Status:** Complete

### 3. Admin Panel (`admin/`)
- Vue 3 + Vite + Tailwind v3 SPA served at `/admin/`
- Features:
  - Gallery management: upload images, edit label/category, delete — full-page lightbox with slide nav
  - Category CRUD (add/rename/delete; delete blocked if images use it)
  - Testimonials management: add/edit/delete
  - User management: add/remove admin users (cannot delete self)
  - First-run setup: open registration if no users exist; subsequent users require auth
- Build: `cd admin && npm run build` → outputs to `admin/dist/`

**Status:** Complete

---

## Dev Workflow

```bash
cd api && npm run dev      # starts Express on port 3000 (nodemon)
# open http://localhost:3000        ← landing page
# open http://localhost:3000/admin/ ← admin panel

# To rebuild admin after changes:
cd admin && npm run build
```

**Do NOT use `python3 -m http.server`** — the landing page requires the API; relative fetch URLs only work when served by Express.

---

## Deployment

### Target
- **Platform:** Node.js host with persistent disk — Render, Railway, Fly.io, or DigitalOcean VPS
- **Method:** Deploy the Express server; it serves everything (landing page + API + admin)
- **Single-server (same origin):** keep `API_BASE = ''` in `index.html`
- **Split hosting (CDN frontend + separate API):** set `API_BASE = 'https://api.yourdomain.com'` in `index.html`

### Database
- SQLite `api/data.db` — lives on the server's persistent disk
- Run `node api/seed.js` once after first deploy to seed categories, gallery, and admin user
- Default admin: `admin` / `eran2024` — **change password in production**

---

## Client

- **Name:** ערן ישראלי
- **Business:** Iron/metal design and manufacturing — one-person operation
- **Language:** Hebrew only
- **Instagram:** Source of gallery images (screenshots)
- **Placeholder data to replace before going live:**
  - Phone: `050-000-0000`
  - Email: `eran@example.com`

---

## Known Constraints / Gotchas

- **Node v26+** — `better-sqlite3` fails to compile; use `node:sqlite` (built-in) instead
- **SQLite `ALTER TABLE ADD COLUMN`** — does not accept `DEFAULT CURRENT_TIMESTAMP`; use `DEFAULT NULL` (or no default) for migrations
- **Admin SPA** must be rebuilt (`npm run build`) for changes to take effect in production
- **`esbuild` postinstall** — if blocked by npm, run `npm approve-scripts esbuild` in `admin/`
