# KisanSetu — Comprehensive UI/UX and Functional Bug Audit Report (Phase 4 Deliverable)

**Date**: September 2026  
**Project**: KisanSetu (Smart India Hackathon 2026 · PS 26033)  
**Frontend**: Next.js 16.3.3 App Router, React 19, Tailwind CSS v4, PWA  
**Backend**: Python FastAPI, PostGIS, Gemini AI Vision, ORS VRP  

---

## 1. Complete Issue Matrix

| # | Route / Component | Issue Description | Severity | Category |
| :--- | :--- | :--- | :--- | :--- |
| **01** | `api/crop-photo/route.ts` & `CropPhoto.tsx` | Next.js API route `/api/crop-photo` returns HTTP 501 when `PEXELS_API_KEY` is not set, generating console errors and failed network roundtrips for produce cards. | **Critical** | Functional / Visual |
| **02** | `buyer/[lotId]/page.tsx` → `payment/checkout/page.tsx` | Custom bid quantities / partial lot purchases can cause escrow 40/60 milestone breakdown calculations to desynchronize during client-side hydration. | **Critical** | Functional |
| **03** | `farmer/page.tsx`, `buyer/page.tsx`, `login/page.tsx` | Role guards evaluate purely in client-side `useEffect`, causing a brief Flash of Unauthenticated Content (FOUC) before redirecting. | **High** | Functional / Security |
| **04** | `orders/page.tsx` | 2-Stage Escrow milestone OTP verification runs simulated state transitions without calling the backend settlement API when online. | **High** | Functional |
| **05** | `buyer/page.tsx` & `LeafletMap.tsx` | When switching to Map view with active "Near Me (10km)" or crop filters, LeafletMap maintains static Raipur center without auto-fitting bounds to filtered markers. | **High** | Functional / UX |
| **06** | `FarmerListingForm.tsx` | HTML5 Canvas audio waveform animation does not cancel `requestAnimationFrame` on unmount or tab switch, resulting in background memory leaks. | **Medium** | Functional / Performance |
| **07** | `earnings/page.tsx` | Instant UPI payout withdrawal status updates in local state only and resets upon browser refresh in demo mode. | **Medium** | Functional / UX |
| **08** | `buyer/LotCard.tsx` | Freshness countdown timer calculation can produce `NaN` if `lot.created_at` timestamp format is missing ISO offset. | **Medium** | Functional |
| **09** | `SiteNav.tsx` | Mobile navigation drawer links don't visually highlight active dynamic sub-routes (e.g., active highlight missing when viewing `/buyer/lot-101`). | **Medium** | UX |
| **10** | `lib/language.tsx` | Several logistics telemetry metrics, EV battery levels, and UTR labels lack Hindi and Chhattisgarhi translations and default to English. | **Medium** | UX / Localization |
| **11** | `manifest.ts` / PWA | PWA manifest references PNG icons that may 404 if the icons folder is missing; fallback SVGs should be provided. | **Medium** | PWA / Functional |
| **12** | `components/ui/button.tsx` | Custom variant buttons (`buyer`, `farmer`) lack visible focus-visible ring styles for WCAG AA keyboard navigation compliance. | **Medium** | Accessibility |
| **13** | `components/ui/badge.tsx` | Contrast ratio on amber/gold badges (`#78350F` on `#FEF3C7`) is borderline on low-nit mobile screens under direct sunlight. | **Low** | Accessibility / Visual |
| **14** | `ProfitImpactSimulator.tsx` | Range slider thumb on mobile touch devices lacks active scale transform feedback for tactile feel. | **Low** | UX / Visual |
| **15** | `DemoModeBanner.tsx` | Backend health check retry interval runs every 10s continuously even when tab is backgrounded. | **Low** | Performance |

---

## 2. Root Cause Analyses for Critical & High Severity Issues

### 1. Pexels API Proxy 501 Response (`api/crop-photo/route.ts`)
* **Root Cause:** When `PEXELS_API_KEY` is not present in environment variables, the server route returns HTTP 501. While `CropPhoto.tsx` falls back to crop emoji, every card on `/buyer` and `/farmer` triggers unnecessary failed network requests and log noise.
* **Remediation:** Provide instant deterministic high-quality SVG/WebP fallback assets for standard Indian crops (Tomato, Onion, Potato, Wheat, Rice, Soybean, Chilli, Cotton) and return clean 200 responses with curated asset URLs when external API keys are absent.

### 2. Escrow Milestone Discrepancy on Partial Lot Orders (`buyer/[lotId]/page.tsx` & `checkout/page.tsx`)
* **Root Cause:** When custom bid quantities are passed in URL search parameters to `/payment/checkout`, initial default values (`2400 kg`) could be used for milestone calculation if hydration takes longer than expected.
* **Remediation:** Implement hydration-safe search parameter synchronization, guaranteeing that the 40% dispatch payout (`₹ Amount * 0.40`) and 60% delivery payout (`₹ Amount * 0.60`) always match the exact ordered volume.

### 3. Client-Side Role Redirection Flashes (`login/page.tsx`, `farmer/page.tsx`, `buyer/page.tsx`)
* **Root Cause:** Authentication checks evaluated purely inside `useEffect` after initial DOM render, causing a 50–150ms visual flash of unauthorized pages.
* **Remediation:** Add an immediate rendering blocker in top-level page shells that renders a full-screen branded skeleton/spinner until role verification completes.

### 4. Orders Milestone Settlement Synchronization (`orders/page.tsx`)
* **Root Cause:** OTP verification in `orders/page.tsx` relied on a mock `setTimeout` without attempting to dispatch to `apiService.verifyMilestoneOtp` or sync status with the backend.
* **Remediation:** Connect `handleVerifyOTP` to `apiService.verifyMilestoneOtp(orderId, milestone, otp)` with transparent offline fallback to demo mode.

### 5. LeafletMap Viewport Bounds on Filter / Geolocation (`buyer/page.tsx`, `LeafletMap.tsx`)
* **Root Cause:** `LeafletMap` initialized with a static `center={[21.28, 81.65]}` and lacked a reactive effect listening to changes in the `lots` prop array or user GPS location to call `map.fitBounds()`.
* **Remediation:** Add an internal Leaflet `MapController` sub-component that calculates bounding boxes around all active lot centroids and calls `map.fitBounds()` whenever lots or filter coordinates change.

---

## 3. Prioritized Fix Order

* **Group 1: Core Functional & Data Flow Fixes** (Issues 01, 02, 03, 04)
* **Group 2: Geospatial & Map Quality** (Issues 05, 08)
* **Group 3: UI/UX, Touch Targets, PWA & Localization** (Issues 06, 07, 09, 10, 11, 12, 13, 14, 15)

---

**Phase 5 Fix Gate:** As instructed, all code modifications are on hold pending your review and approval of this Phase 4 deliverable.
