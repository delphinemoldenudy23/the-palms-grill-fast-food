# Deploy Palm's Grill (public links)

Repo: [github.com/delphinemoldenudy23/the-palms-grill-fast-food](https://github.com/delphinemoldenudy23/the-palms-grill-fast-food)

## What you will get

| Site | Host |
|------|------|
| **Customer website** | Vercel → `https://your-site.vercel.app` |
| **Admin dashboard** | Vercel → `https://your-admin.vercel.app` |
| **API + images** | Render → `https://palms-grill-api.onrender.com` |
| **Database** | MongoDB Atlas (free) |

**MoMo:** `0551720664`

---

## Step 1 — MongoDB Atlas (free)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → create cluster (free).
2. Database Access → add user + password.
3. Network Access → **Allow access from anywhere** (`0.0.0.0/0`) for cloud hosting.
4. Connect → Drivers → copy connection string, e.g.  
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/palms-grill?retryWrites=true&w=majority`

---

## Step 2 — Backend on Render

1. [render.com](https://render.com) → **New +** → **Blueprint** → connect GitHub repo.
2. Or **Web Service** → repo → **Root Directory:** `backend`
3. **Build:** `npm install` · **Start:** `npm start`
4. Environment variables:

| Key | Value |
|-----|--------|
| `MONGODB_URI` | your Atlas connection string |
| `JWT_SECRET` | long random string |
| `CORS_ORIGINS` | `https://YOUR-FRONTEND.vercel.app,https://YOUR-ADMIN.vercel.app` |
| `API_BASE_URL` | `https://palms-grill-api.onrender.com` (your Render URL) |

5. Deploy → copy URL, e.g. `https://palms-grill-api.onrender.com`

6. In Render **Shell** (or locally with Atlas connected):

```bash
node seedMenu.js
node seedAdmin.js
```

---

## Step 3 — Customer site on Vercel

1. [vercel.com](https://vercel.com) → Import GitHub repo.
2. **Root Directory:** `frontend`
3. Environment variable:

```
NEXT_PUBLIC_API_URL=https://palms-grill-api.onrender.com
```

4. Deploy → copy URL (e.g. `https://palms-grill.vercel.app`).

---

## Step 4 — Admin on Vercel

1. New Vercel project → same repo.
2. **Root Directory:** `admin`
3. Same env:

```
NEXT_PUBLIC_API_URL=https://palms-grill-api.onrender.com
```

4. Deploy → copy admin URL.

5. Update Render `CORS_ORIGINS` with both Vercel URLs → redeploy API.

---

## Step 5 — Test

- Customer: open Vercel frontend URL → add to cart (images show) → MoMo checkout.
- Admin: Vercel admin URL → login `admin@palmsgrill.com` / `admin123` → orders & **Mark MoMo paid**.

---

## Custom domain (optional)

- Vercel: Settings → Domains → add `palmsgrill.com`
- Point DNS to Vercel; use same `NEXT_PUBLIC_API_URL`

---

## Push code to GitHub

```bash
cd the-palms-grill-fast-food-main
git init
git remote add origin https://github.com/delphinemoldenudy23/the-palms-grill-fast-food.git
git add .
git commit -m "MoMo payment, cart images fix, production deploy config"
git branch -M main
git push -u origin main
```

If the repo already has history: `git pull origin main --rebase` then push.
