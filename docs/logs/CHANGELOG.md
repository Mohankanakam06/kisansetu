# Change Log: KisanSetu Platform Overhaul (Sept 2026)

This release covers a comprehensive suite of fixes, feature enhancements, and UI polish implemented following a complete platform audit.

## Key Changes

### 1. PWA & UI/UX Persistence
*   **PWA Installation Prompt:** Optimized the installation flow.
    *   Added persistent `localStorage` states (`kisansetu_pwa_dismissed`, `kisansetu_pwa_installed`) to enforce a 7-day cooldown after dismissal, preventing repetitive/intrusive prompts.
    *   Fixed lifecycle handling for `beforeinstallprompt` and `appinstalled` events.

### 2. Farmer Dashboard & Live Data
*   **Live Mandi Integration:** Successfully integrated real-time benchmark pricing from the official Agmarknet dataset into the Farmer and Buyer interfaces.
*   **Fix: Temporal Dead Zone (TDZ):** Resolved `ReferenceError: Cannot access 'getCropMeta' before initialization` in `src/app/farmer/page.tsx` by correcting the lexical declaration order of helper functions.
*   **UI Polish:** Added pulsing "Live" indicators to active Mandi listings.

### 3. API & Backend Reliability
*   **TypeScript Completeness:** Added missing `apiService.verifyPayment` method to `src/services/api.ts` to satisfy interface requirements and resolve TypeErrors across the checkout workflows.
*   **Backend Resilience:** Ensured FastAPI routes (`/api/orders`, `/api/health`) are correctly mapped and synced with websocket event broadcasts for real-time order tracking.

---
Co-Authored-By: Claude Code <noreply@anthropic.com>
