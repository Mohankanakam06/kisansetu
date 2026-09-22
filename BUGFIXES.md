# BUGFIXES.md

| Page/Component | Bug | Fix | Status |
|---|---|---|---|
| PWAInstallPrompt | Clipping/overflow on some mobile gesture bars | Updated `pb` using `safe-area-inset-bottom` | Fixed |
| InteractiveHoverButton | Responsive animation performance/layout | Scoped hover states to `md` breakpoint | Fixed |
| Compare1 | Horizontal scroll on mobile | Mobile stacked card view added | Fixed |
| DemoModeBanner | Header/Main content overlap | Changed layout from `fixed` to `relative` | Fixed |
| FarmListingCard | Image breakage handler | Hidden broken img with style display none | Verified |
| PaymentSuccessPage | JSX unescaped entity (`farmers'`) | Escaped with `farmers&apos;` for strict TSX/linter compliance | Verified |
| BuyerPage | Unnecessary debug console logging | Cleaned noisy development console output | Verified |
| States/Fallbacks | Unverified fallback page accessibility | Audited `/states/*`, `/offline`, `/orders`, `/forbidden`, `/_not-found`, and auth pages. Verified robust Next.js routing & responsive empty state fallbacks | Verified |
| App E2E Build | Turbopack compilation | Ran `npm run build` with strict types; Next.js 16.3.3 built successfully (40/40 routes static/SSR compliant) | Verified |
| SiteNav / PWA Drawer | Incomplete / limited navigation options in mobile PWA drawer | Re-architected mobile drawer with categorized sections (Marketplace & Trade, Operations & Settlements), direct PWA app install action, language toggle (EN/HI/CG), and profile badge | Fixed |
| ProfilePage | Redundant mode switcher causing page reload loops & errors | Removed artificial "Farmer vs Buyer" toggle; replaced with universal Quick Services shortcuts for seamless access to all platform features | Fixed |
| MobileBottomBar | Navigation ergonomics in mobile PWA | Implemented universal 5-item bottom bar with center-raised "+ Sell" quick action, direct Marketplace/Orders/Earnings tabs, and options menu trigger | Fixed |
| Auth & State Pages | Destructive `window.location.href` hard refreshes | Replaced all `window.location.href` calls with client-side Next.js `useRouter().push()` and `<Link>` components to maintain in-memory state | Fixed |
| useRoleGuard | Hard redirect errors on soft client navigation | Softened client authorization checks to prevent redirect loops while preserving authenticated user state | Fixed |
| SiteNav / MobileBottomBar | Farmer-specific 'Sell Produce' prominent for Buyer Demo accounts | Made navigation dynamically role-aware via \user?.role === 'buyer'\; Buyer sees dedicated Marketplace, Dynamic Pricing, and Orders tabs without confusing farmer tools | Fixed |
