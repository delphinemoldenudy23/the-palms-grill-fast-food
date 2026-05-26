# The Palm's Grill & Fast Food

Modern restaurant website with online ordering, MoMo payment, delivery, WhatsApp, and admin dashboard.

**GitHub:** [github.com/delphinemoldenudy23/the-palms-grill-fast-food](https://github.com/delphinemoldenudy23/the-palms-grill-fast-food)

## Live deployment

Follow **[DEPLOY.md](./DEPLOY.md)** to get public URLs on Vercel + Render + MongoDB Atlas.

| App | Local | Production |
|-----|-------|------------|
| Customer | http://localhost:3000 | Vercel (see DEPLOY.md) |
| Admin | http://localhost:3001 | Vercel (see DEPLOY.md) |
| API | http://localhost:5000 | Render |

**MoMo Pay:** `0551720664` · **Admin:** `admin@palmsgrill.com` / `admin123`

## Quick start (local)

```bash
npm install
cd backend && npm install && node seedMenu.js && node seedAdmin.js
cd ../frontend && npm install
cd ../admin && npm install
```

Double-click **`START.bat`** or run backend + frontend + admin in 3 terminals.

## Features

- Menu with images (cart shows photos for every item)
- MoMo checkout + pay on delivery
- Admin: menu CRUD, photo upload, orders, mark MoMo paid, revenue stats
- Share on Wi‑Fi: run `SHOW-LINKS.ps1` for `http://192.168.x.x:3000`

## Contact

- **Phone:** 0551720664 · 0548270547
- **Location:** Osu Kuku Hill
- **Hours:** Mon–Sun 1 PM – 3 AM
