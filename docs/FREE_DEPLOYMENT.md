# KisanSetu Free Deployment Guide

Deploy KisanSetu (backend + frontend) to **100% free** hosting with always-accessible URLs.

---

## Architecture Overview

| Layer | Service | Free Tier |
|---|---|---|
| **Database** | Supabase (PostgreSQL + PostGIS) | 500 MB storage, 50K monthly active rows |
| **Backend API** | Render | 750 hrs/month, spins down after 15 min inactivity |
| **Frontend (PWA)** | Vercel | 100 GB bandwidth, auto-deploy from GitHub |
| **CI/CD** | GitHub | Unlimited public repos |

> **Note:** Render's free tier auto-sleeps after 15 min of no traffic. First request after sleep takes ~30s to wake up. For a demo/college project this is fine. If you need always-on, Render's $7/mo "Starter" plan removes the sleep.

---

## Step 1: Push Code to GitHub

```bash
cd "D:\claude\Claude Code Projects\PS 33"

# Initialize git (if not already)
git init
git add .
git commit -m "KisanSetu v1.0: Full marketplace + PWA + auth"

# Create a new public repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/kisansetu.git
git branch -M main
git push -u origin main
```

---

## Step 2: Database — Supabase

1. Go to [supabase.com](https://supabase.com) → Sign up with GitHub
2. Click **New Project**:
   - Name: `kisansetu`
   - Database password: choose a strong one (save it)
   - Region: **Mumbai** (closest to India)
3. Once created, go to **SQL Editor** and run your full migration:
   - Paste contents of `migration/001_init.sql`
   - Click **Run**
4. Copy the **Connection string** (URI format) from **Settings → Database → Connection string → URI**:
   ```
   postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```
5. Save this as `DATABASE_URL` — you'll need it for both backend and frontend.

---

## Step 3: Backend — Render

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **New → Web Service**
3. Connect your `kisansetu` GitHub repo
4. Configure:
   - **Name:** `kisansetu-api`
   - **Runtime:** Python 3
   - **Build Command:**
     ```
     pip install -r requirements.txt
     ```
   - **Start Command:**
     ```
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type:** Free
5. Add **Environment Variables** (click "Advanced" → "Add Environment Variable" for each):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Your Supabase connection URI from Step 2 |
   | `GEMINI_API_KEY` | (your key) |
   | `SARVAM_API_KEY` | (your key) |
   | `BHASHINI_API_KEY` | (your key) |
   | `OPENROUTER_API_KEY` | (your key) |
   | `ORS_API_KEY` | (your key) |
   | `REDIS_URL` | (your key, or skip if not using caching) |
   | `JWT_SECRET` | (generate with `python -c "import secrets; print(secrets.token_hex(32))"`) |
   | `CORS_ORIGINS` | `https://kisansetu.vercel.app,http://localhost:3000` |

6. Click **Create Web Service**
7. Render auto-deploys. Once green, your backend URL will be:
   ```
   https://kisansetu-api.onrender.com
   ```
8. Verify:
   ```bash
   curl https://kisansetu-api.onrender.com/
   curl https://kisansetu-api.onrender.com/api/lots
   ```

---

## Step 4: Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Add New → Project**
3. Import your `kisansetu` repo
4. Framework Preset: **Next.js** (auto-detected)
5. **Root Directory:** `frontend` (since the repo root contains both backend + frontend)
6. Add **Environment Variables**:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_BASE_URL` | `https://kisansetu-api.onrender.com` |
   | `NEXT_PUBLIC_USE_MOCK_API` | `false` |
   | `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | (optional, for live maps) |

7. Click **Deploy**
8. Once deployed, your frontend URL will be:
   ```
   https://kisansetu.vercel.app
   ```

---

## Step 5: Verify End-to-End

Open `https://kisansetu.vercel.app` in your phone browser:

1. **PWA Install:** Tap the "Install KisanSetu App" prompt → adds to home screen
2. **Auth Flow:** Login → Enter phone number → Receive OTP → Enter OTP → Redirects to farmer/buyer dashboard
3. **E2E Marketplace:**
   - Farmer: Voice listing → Lot created → Aggregation clusters
   - Quality: Upload photo → AI grading (A/B/C/D)
   - Buyer: Browse lots → Place order
   - Routing: Optimize delivery route
   - Settlement: Payout triggered on delivery confirmation
4. **Offline Mode:** Turn off WiFi → navigate → see `/offline` fallback page → reconnect → auto-recovers

---

## Free Tier Limitations & Tips

| Limitation | Workaround |
|---|---|
| **Render sleeps after 15 min** | First request takes ~30s. For demo day, open the app 5 min before your presentation |
| **Supabase 500 MB** | Enough for thousands of lots/orders. Delete test data regularly |
| **Vercel 100 GB bandwidth** | More than enough for a college project |
| **No custom domain on free tier** | Use the `.vercel.app` and `.onrender.com` URLs |
| **Gemini API quotas** | Free tier has 60 RPM. Cache grading results to avoid hitting limits |

---

## Quick Deploy Commands (Reference)

```bash
# Backend health check
curl -s https://kisansetu-api.onrender.com/ | python -m json.tool

# Test auth
curl -X POST https://kisansetu-api.onrender.com/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","role":"farmer"}'

# Test lots
curl -s https://kisansetu-api.onrender.com/api/lots | python -m json.tool
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Backend returns 502 | Check Render logs → likely missing env var or import error |
| Frontend shows blank | Check Vercel build logs → ensure root directory is `frontend` |
| CORS error | Add your Vercel URL to `CORS_ORIGINS` env var on Render |
| Auth fails | Ensure `JWT_SECRET` is set on both Render AND if backend issues tokens, verify with `/api/auth/me` |
| PWA not installing | Must be served over HTTPS (Vercel/Render both provide this) |
| Offline page not loading | Clear old SW: DevTools → Application → Service Workers → Unregister → Reload |
