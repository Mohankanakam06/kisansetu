# Dynamic Pricing Redesign, Mobile UI/UX & PWA Install Popup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the technical "Dynamic Pricing" into a user-friendly, feature-grade "AI Fair Value Discovery" tool grounded in real-life farming and procurement scenarios; resolve mobile layout/responsiveness bugs; and completely upgrade the PWA App Install Popup with iOS/Android native installation workflows and collision-free positioning.

**Architecture:** 
- **Dynamic Pricing:** Reframe mathematical algorithmic outputs into intuitive, scenario-based value breakdowns (Farmer Uplift, Buyer Discount, Logistics Consolidation) with real-life presets (Smallholder Village Cluster, Supermarket Direct Sourcing, Perishable Express).
- **Mobile UI/UX:** Enforce viewport safe-areas (`safe-area-inset-bottom`), 44px touch targets, sticky footer clearing (`pb-24`), and fluid overflow containment.
- **PWA Installation:** Responsive bottom drawer on mobile and toast on desktop, with browser detection (native Chrome/Android `beforeinstallprompt` + iOS Safari visual "Add to Home Screen" instructions) and persistent dismissal logic.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React, WebSockets, LocalStorage.

**Spec:** Redesign grounded in real-life agri-logistics scenarios and responsive mobile-first UI/UX.

## Global Constraints
- Must maintain backward compatibility with existing backend API `/api/pricing/dynamic-margin` and `/api/mandi/historical-trends`.
- Must support English, Hindi (`hi`), and Chhattisgarhi (`cg`) through `useLanguage()`.
- Must never overflow horizontally on 320px+ viewports.
- No z-index collisions between top ticker (`z-[60]`), header (`z-50`), mobile bottom bar (`z-40`), modals (`z-[200]`), and install prompt (`z-[150]`).

---

### Task 1: Redesign DynamicPricingCard with Real-Life Agricultural Scenarios

**Files:**
- Modify: `frontend/src/components/pricing/DynamicPricingCard.tsx`
- Test: `frontend/src/components/pricing/__tests__/DynamicPricingCard.test.tsx` (or component test)

**Interfaces:**
- Consumes: `apiService.calculateDynamicMargin`, `useLanguage`, `DynamicMarginResponse`
- Produces: `DynamicPricingCard` component with real-life scenario presets, visual value breakdown, and clear farmer/buyer financial impact.

- [ ] **Step 1: Check existing tests and write component verification test**
- [ ] **Step 2: Implement Real-Life Scenario Selector and Value Breakdown in `DynamicPricingCard.tsx`**
  - Add real-world scenario presets:
    - *Scenario A: Smallholder Cluster Consolidation (5-10 Farmers Pooling Produce)*
    - *Scenario B: Grade A Supermarket Direct Route (Zero Middleman Commission)*
    - *Scenario C: Perishable Fast-Track Dispatch (Direct Cold/Ventilated Run)*
  - Replace raw technical labels with benefit-driven scenario cards:
    - Quality Reward: "+₹X/kg for verified Grade A produce (no broker downgrading)"
    - Logistics Route Dividend: "+₹X/kg saved through shared route pickups"
    - Middleman Commission Bypass: "₹X/kg returned to farmer & buyer from eliminated 25% dalali"
  - Display total lot value calculation in INR (e.g. ₹57,600 farmer payout).
- [ ] **Step 3: Verify rendering in `buyer/[lotId]` and standalone mode**
- [ ] **Step 4: Commit changes**

---

### Task 2: Redesign Dynamic Pricing Hub Page (`/pricing`) with Real-World Marketplace Context

**Files:**
- Modify: `frontend/src/app/pricing/page.tsx`

**Interfaces:**
- Consumes: `COMMODITIES`, `apiService.getLiveTicker`, `apiService.getHistoricalTrends`, `apiService.calculateDynamicMargin`
- Produces: Rebranded "KisanSetu Fair Value Discovery & Market Intelligence Hub" with interactive scenario simulation and real-world case studies.

- [ ] **Step 1: Update Hero and Header to highlight Real-Life Feature Benefits**
  - Reframe from "Pricing Engine / Formula" to "KisanSetu Fair Value Discovery™: How AI Eliminates 25% Middleman Dalali"
- [ ] **Step 2: Add Interactive Real-Life Scenario Switcher**
  - Scenario 1: *Village Cluster Aggregation (Tilda to Raipur Yard)*
  - Scenario 2: *Restaurant & Supermarket Bulk Sourcing (5,000 kg Grade A Tomato)*
  - Scenario 3: *Smallholder Fair Price Protection (Individual 500 kg Listing)*
- [ ] **Step 3: Enhance the Mandi Price Forecaster & Historical Chart**
  - Responsive chart container with touch tooltip markers and clear trend predictions.
- [ ] **Step 4: Update Side-by-Side Disintermediation Comparison**
  - Concrete real-life numbers showing a ₹1,00,000 harvest comparison: Traditional Mandi vs KisanSetu.
- [ ] **Step 5: Verify build and responsiveness**
- [ ] **Step 6: Commit changes**

---

### Task 3: Overhaul App Install Popup (`PWAInstallPrompt.tsx`) with iOS & Android Workflows

**Files:**
- Modify: `frontend/src/components/PWAInstallPrompt.tsx`
- Modify: `frontend/src/app/layout.tsx`

**Interfaces:**
- Consumes: `beforeinstallprompt` event, iOS Safari `navigator.userAgent` & `standalone` check, `useLanguage`
- Produces: Non-intrusive, high-conversion PWA Install component with mobile bottom sheet layout, iOS step-by-step visual instructions, and desktop pill.

- [ ] **Step 1: Implement iOS Safari detection and mobile drawer UX in `PWAInstallPrompt.tsx`**
  - Detect Android/Chrome (`deferredPrompt`) vs iOS Safari (`/iphone|ipad|ipod/.test(ua) && !window.navigator.standalone`).
  - Mobile bottom sheet design with backdrop blur, rounded-t-3xl, non-overlapping placement above `MobileBottomBar`.
  - Step-by-step iOS instructions with custom icons:
    1. Tap the **Share** button (`⎋` / Share icon) in Safari's bottom toolbar.
    2. Scroll and tap **"Add to Home Screen"** (`⊞`).
    3. Open KisanSetu directly from your home screen!
  - 1-tap install button for Android/Chrome.
- [ ] **Step 2: Add PWA Feature Highlights**
  - ⚡ Instant offline access & fast loading
  - 🔔 Real-time mandi price & payout alerts
  - 📦 One-tap order & logistics tracking
- [ ] **Step 3: Add Smart Dismiss & Manual Trigger support**
  - Allow user to dismiss for 7 days or minimize to a discreet floating "Get App" badge.
- [ ] **Step 4: Verify mobile bottom placement without layout shift**
- [ ] **Step 5: Commit changes**

---

### Task 4: Fix Mobile Layout and UI/UX Navigation Bugs

**Files:**
- Modify: `frontend/src/components/MobileBottomBar.tsx`
- Modify: `frontend/src/components/SiteNav.tsx`
- Modify: `frontend/src/app/layout.tsx`
- Modify: `frontend/src/app/globals.css`

**Interfaces:**
- Consumes: `useLanguage`, `usePathname`, local user session
- Produces: Polished, glitch-free mobile navigation and layout container.

- [ ] **Step 1: Fix Mobile Layout Spacing & Safe Areas in `layout.tsx` and `globals.css`**
  - Add safe-area padding utilities: `pb-[calc(4.5rem+env(safe-area-inset-bottom))]` on main mobile view.
  - Fix top fixed header + ticker height coordination so page content is never hidden behind navigation.
  - Add `overflow-x-clip` to body to prevent accidental horizontal bouncing on mobile.
- [ ] **Step 2: Enhance `MobileBottomBar.tsx`**
  - Add active tab indicator with subtle glow and haptic-feel feedback.
  - Support guest / unauthenticated mobile navigation (Home, Marketplace, Pricing, Sign In) so mobile guests have smooth navigation before logging in.
  - Prevent touch collision between bottom bar and sticky page action bars (e.g. checkout / filter buttons).
- [ ] **Step 3: Fix `SiteNav.tsx` Mobile Drawer**
  - Improve mobile drawer animation, touch targets (min 48px), and close triggers.
- [ ] **Step 4: Commit changes**

---

### Task 5: End-to-End Verification & Mobile Viewport Smoke Test

**Files:**
- Run test scripts & curl / browser verification

- [ ] **Step 1: Test Next.js build (`npm run build`)**
- [ ] **Step 2: Smoke test `/pricing`, `/buyer`, `/farmer`, and mobile drawer on mobile viewport dimensions (360x740, 390x844)**
- [ ] **Step 3: Verify Dynamic Pricing scenario switches and calculations**
- [ ] **Step 4: Verify PWA install prompt behavior on simulated iOS/Android**
- [ ] **Step 5: Final review and commit**
