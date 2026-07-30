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

## Repository

- **GitHub:** https://github.com/Moo12/eran-landing-page (private)
- **Clone:** `git clone git@github.com:Moo12/eran-landing-page.git`
- **Branch:** `main`

## Dev Workflow

```bash
cd api && npm run dev      # starts Express on port 3000 (nodemon)
# open http://localhost:3000        <- landing page
# open http://localhost:3000/admin/ <- admin panel

# To rebuild admin after changes:
cd admin && npm run build
```

Do NOT open `index.html` directly or use `python3 -m http.server` — relative fetch URLs only work when served by Express.

---

## Deployment

### Server
- **Live URL:** https://eran-art.mottomation.com
- **Host:** DigitalOcean Ubuntu VPS at `174.138.105.11`
- **App path:** `/var/www/eran-landing-page`
- **Internal port:** 4000 (ports 3000 and 3001 were taken by other apps)
- **Process manager:** PM2 (keeps the Express server running, auto-restarts on crash/reboot)
- **Reverse proxy:** nginx (port 80/443 → 4000), config at `/etc/nginx/sites-available/eran-art.mottomation.com.conf`
- **SSL:** Let's Encrypt cert for `eran-art.mottomation.com`

### First-time setup (run on server)
```bash
git clone git@github.com:Moo12/eran-landing-page.git /var/www/eran-landing-page
cd /var/www/eran-landing-page
cd api && npm install --omit=dev && node seed.js && cd ..
cd admin && npm install && npm run build && cd ..
pm2 start api/index.js --name eran-landing-page
pm2 save && pm2 startup
```

### Updating after a code push
```bash
ssh root@174.138.105.11
cd /var/www/eran-landing-page && git pull
cd admin && npm install && npm run build && cd ..
pm2 restart eran-landing-page
```

### Database
- SQLite `api/data.db` lives on the server's persistent disk (gitignored)
- Run `node api/seed.js` once on first deploy to seed categories, gallery, and admin user
- Default admin: `admin` / `eran2024` — **change password before going live**

---

## Client

- **Name:** ערן ישראלי
- **Business:** Iron/metal design and manufacturing — one-person operation
- **Language:** Hebrew only
- **Instagram:** Source of gallery images (screenshots)
- **Placeholder data to replace before going live:**
  - Phone: `050-000-0000`
  - `eran@example.com`Email: `eran@example.com`

---

## Known Constraints / Gotchas

- **Node v26+** — `better-sqlite3` fails to compile; use `node:sqlite` (built-in) instead
- **SQLite ALTER TABLE ADD COLUMN** — does not accept `DEFAULT CURRENT_TIMESTAMP`; omit the default (NULL) in migrations
- **Admin SPA** must be rebuilt (`npm run build`) after any admin source change
- **esbuild postinstall** — if blocked by npm, run `npm approve-scripts esbuild` in `admin/`
