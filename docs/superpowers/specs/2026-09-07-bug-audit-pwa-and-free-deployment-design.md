# Technical Design Specification: Full Bug Audit, Native PWA & Free Online Deployment

**Date:** 2026-09-07  
**Project:** KisanSetu - Direct-to-Market Agri Platform (SIH PS 26033)  
**Status:** Approved for Implementation (Approach A - Native Next.js PWA + Free Multi-Cloud Deployment)

---

## 1. Executive Summary & Goals

This specification details the comprehensive architecture to:
1. **Harden and Audit All Code**: Eliminate edge-case bugs, null-pointer exceptions, schema mismatches, and deprecations across the FastAPI backend (`app/`) and Next.js 16 frontend (`src/app/` / `app/`).
2. **Convert to a Progressive Web App (PWA)**: Provide offline fallback, fast app-shell caching, installable home-screen experience for rural farmers and mandi buyers, and mobile app-like status/manifest capabilities using Next.js 16 App Router native metadata routes (`manifest.ts`) and a lightweight service worker (`public/sw.js`).
3. **Always-On Free Deployment Blueprint**: Establish a 100% free, zero-cost production hosting topology using Supabase (Free Tier PostgreSQL + PostGIS) + Render/Railway (Backend API) + Vercel (Frontend Next.js App Router).

---

## 2. Section 1: End-to-End Bug Audit & Hardening

### 2.1 Backend (FastAPI + PostGIS)
| Component | Issue Identified | Resolution |
|---|---|---|
| `app/routes/farmer.py` | Raw unstructured `dict` payload allowed missing `farmer_id` and caused SQL FK errors. | Added `FarmerListingRequest` Pydantic model with strict validation (`farmer_id` required, transcript/media check). |
| `app/routes/lots.py` | `if lat and lng and radius_km:` failed when coordinate was `0.0`. | Changed to explicit `if lat is not None and lng is not None and radius_km is not None:`. |
| `app/routes/quality.py` | Direct dict key access could throw unhandled 500 on malformed payload. | Added `QualityGradeRequest` Pydantic model and wrapped with proper 400/404 handling. |
| `app/routes/settlement.py` | Unvalidated `stage` string allowed values violating database constraints. | Enforced `stage in ("pickup", "delivery")` with immediate 400 error. |
| `app/agents/routing.py` | PostGIS null locations caused OpenRouteService (ORS) API call crashes. | Added automatic fallback coordinates for missing centroid/buyer locations to prevent unhandled exceptions. |
| `app/agents/quality_grading.py` | Unbounded photo downloading could cause high memory usage on bad URLs. | Added payload size validation (capped at 5MB) and strict URL validation. |
| `app/main.py` | Root endpoint metadata was missing auth endpoints. | Updated OpenAPI / root response with `/api/auth/*` route references. |

### 2.2 Frontend (Next.js 16 + React 19)
| Component | Issue Identified | Resolution |
|---|---|---|
| Auth Flow | Silent error swallow in `login/page.tsx` masked network/credential issues. | Surface backend error messages in UI; fall back to demo mode only on genuine offline/network failure. |
| Leaflet Maps | Potential SSR hydration mismatch on dynamic map components. | Ensure all Leaflet components use dynamic SSR-disabled imports with responsive placeholder skeletons. |
| Navigation Links | Nav items in `SiteNav` allowed accessing protected dashboards without active session state. | Connected `localStorage` token detection to show logged-in farmer/buyer profile badges and login shortcuts. |

---

## 3. Section 2: Native Next.js 16 PWA Architecture

### 3.1 Web App Manifest (`app/manifest.ts`)
Next.js App Router dynamically generates `/manifest.webmanifest` with:
- `name`: "KisanSetu | Direct-to-Market Agri Platform"
- `short_name`: "KisanSetu"
- `description`: "AI-powered agricultural aggregation, grading, and direct-to-buyer marketplace"
- `start_url`: "/"
- `display`: "standalone"
- `background_color`: "#064e3b" (Emerald 950)
- `theme_color`: "#047857" (Emerald 700)
- `orientation`: "portrait"
- `icons`:
  - `192x192` (`image/png`, purpose: `any`)
  - `512x512` (`image/png`, purpose: `any`)
  - `512x512` (`image/png`, purpose: `maskable`)

### 3.2 Service Worker Strategy (`public/sw.js`)
- **Precaching**: App Shell, `/offline`, critical icons, and core stylesheets on `install`.
- **Navigation (HTML pages)**: *Network-First* with instant fallback to cached `/offline` page when internet is disconnected.
- **Static Assets (`/_next/static/*`, `/icons/*`, images, fonts)**: *Stale-While-Revalidate* for instant load speeds even on 2G/3G rural networks.
- **API Requests (`/api/*`)**: *Network-Only* to preserve live mandi rates, real-time escrow balances, and active lot states.
- **Cache Invalidation**: Automatic cleanup of obsolete cache versions on `activate`.

### 3.3 Client Registration & Install Banner
- `RegisterSW.tsx`: Registers `/sw.js` safely in client runtime.
- `PWAInstallPrompt.tsx`: Listens for `beforeinstallprompt` event and displays a non-intrusive install button ("Install App for Offline Access") matching the KisanSetu design tokens.

---

## 4. Section 3: 100% Free Always-On Deployment Blueprint

### 4.1 Architecture Diagram
```
  [ Farmer / Buyer Device ]
              │
              ▼
   [ Vercel CDN (Free) ] ──── Serves Next.js 16 PWA + Turbopack Assets
              │
              ▼ (Fetch API / CORS)
   [ Render.com (Free) ] ──── FastAPI Uvicorn Web Service (Python 3.14)
              │
              ▼ (PostgreSQL Connection Pool)
   [ Supabase (Free) ] ────── Managed PostgreSQL 15 + PostGIS Extension
```

### 4.2 Step-by-Step Free Hosting Guide

#### 1. Database: Supabase (Free Tier)
- Create a free project on [supabase.com](https://supabase.com).
- Under SQL Editor, run `CREATE EXTENSION IF NOT EXISTS postgis;` followed by `migration/001_init.sql`.
- Copy the Connection String URI (`postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`).

#### 2. Backend: Render.com (Free Web Service)
- Connect repository on [render.com](https://render.com).
- **Environment**: Python 3
- **Root Directory**: `frontend` (or repository root)
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `DATABASE_URL`: *(Supabase URI from Step 1)*
  - `GEMINI_API_KEY`: *(Google AI Studio free key)*
  - `ORS_API_KEY`: *(OpenRouteService free key)*
  - `BASE_URL`: `https://your-backend.onrender.com`

#### 3. Frontend: Vercel (Free Hobby Tier)
- Import GitHub repository on [vercel.com](https://vercel.com).
- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Environment Variables**:
  - `NEXT_PUBLIC_USE_MOCK_API`: `false`
  - `NEXT_PUBLIC_API_BASE_URL`: `https://your-backend.onrender.com/api`
- Click **Deploy**. Vercel will provision an SSL-secured custom URL (`https://kisansetu.vercel.app`).

---

## 5. Verification & Acceptance Criteria

1. **Bug Audit Verification**:
   - `test_e2e_flow.py` (both E2E 8-step flow and Auth flow) passes with 100% success.
   - All API endpoints return valid HTTP 200/400/404 JSON with no uncaught 500 exceptions.
2. **PWA Verification**:
   - Next.js build passes with 33+ static routes and `/manifest.webmanifest`.
   - Service worker registers without error.
   - Simulated offline mode displays `/offline` page gracefully.
3. **Deployment Readiness**:
   - Build artifacts compile with 0 TypeScript and 0 lint errors.

