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
