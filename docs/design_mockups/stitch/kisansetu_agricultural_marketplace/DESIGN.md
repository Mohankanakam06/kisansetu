---
name: KisanSetu Agricultural Marketplace
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f4941'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6f7a71'
  outline-variant: '#becabf'
  surface-tint: '#006d42'
  primary: '#005f39'
  on-primary: '#ffffff'
  primary-container: '#0f7a4c'
  on-primary-container: '#a6ffc8'
  inverse-primary: '#7cd9a3'
  secondary: '#006e2f'
  on-secondary: '#ffffff'
  secondary-container: '#6bff8f'
  on-secondary-container: '#007432'
  tertiary: '#754900'
  on-tertiary: '#ffffff'
  tertiary-container: '#965e00'
  on-tertiary-container: '#ffe8d1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#98f6bd'
  primary-fixed-dim: '#7cd9a3'
  on-primary-fixed: '#002111'
  on-primary-fixed-variant: '#005230'
  secondary-fixed: '#6bff8f'
  secondary-fixed-dim: '#4ae176'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005321'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  price-xl:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The design system is built on the pillars of **Trust, Efficiency, and Modernity**. It bridges the gap between traditional agriculture and modern e-commerce by utilizing a **Corporate/Modern** aesthetic characterized by high-density information layouts that remain legible and professional.

The visual style is grounded in reliability, using a "High-Trust" framework that emphasizes verified status, clear data visualization, and a sturdy grid system. The interface avoids unnecessary decorative flourishes, focusing instead on utility and clarity to serve both tech-savvy buyers and pragmatic producers. The emotional response is one of stability and professional success.

## Colors
This design system utilizes a palette rooted in agricultural growth and financial security.

- **Primary Deep Green (#0F7A4C):** Used for primary actions, brand presence, and critical navigation. It conveys authority and deep-rooted trust.
- **Success Green (#22C55E):** Reserved for positive status indicators, "Verified" badges, and stock availability.
- **Warning Amber (#F59E0B):** Used for pending transactions, low-stock warnings, and attention-required notifications.
- **Neutral Grays:** A systematic range of grays (from #F8FAFC for backgrounds to #0F172A for text) ensures high contrast and a professional, "Amazon-grade" interface density.

## Typography
The typography system uses **Inter** to achieve a neutral, systematic feel that prioritizes legibility in data-heavy environments.

A specific emphasis is placed on **Price and Quantity Display**: use `price-xl` with high-contrast neutral colors for primary product costs. Bold weights are used strategically to highlight "Available Stock" and "Farmer Ratings." For mobile devices, headlines scale down to ensure content density remains high without sacrificing clarity.

## Layout & Spacing
The layout follows a **Fluid Grid** model to accommodate various product listing types.

- **Desktop:** 12-column grid with 24px gutters. Use 4-column spans for product cards in a standard view, and 3-column spans for high-density browsing.
- **Mobile:** 2-column grid with 16px margins.
- **Rhythm:** A 4px baseline grid ensures vertical consistency. Use `md` (16px) for internal card padding and `lg` (24px) for section staggering.

## Elevation & Depth
This design system employs **Tonal Layers** supplemented by **Ambient Shadows** to create a sense of organized hierarchy.

1.  **Level 0 (Background):** #F8FAFC. The foundation for all layouts.
2.  **Level 1 (Cards):** Pure white (#FFFFFF) with a very subtle, diffused shadow (0px 2px 4px rgba(0,0,0,0.05)). This is used for product listings and info-tiles.
3.  **Level 2 (Hover/Active):** Slightly deeper shadow (0px 10px 15px rgba(0,0,0,0.1)) to indicate interactivity.
4.  **Overlays:** High-elevation shadows for modals and dropdowns to separate them from the dense marketplace grid.

## Shapes
A **Soft** shape language (roundedness level 1) is used to maintain a professional, slightly institutional feel while appearing modern and accessible.

- **Buttons & Inputs:** 0.25rem (4px) corner radius.
- **Product Cards:** 0.5rem (8px) corner radius.
- **Status Pills:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.

## Components
- **Buttons:** Primary buttons use `primary-color` with white text. Secondary buttons use a subtle gray border (#E2E8F0).
- **Product Cards:** Must include a fixed-ratio image container, a "Verified Seller" badge in the top-right, and a bold price display.
- **Status Pills:** Small, high-contrast labels for "In Stock" (Success Green), "Sold Out" (Gray), and "Transit" (Amber). Use a light tinted background of the same color at 10% opacity.
- **Input Fields:** Clean, 1px bordered boxes (#CBD5E1) that turn `primary-color` on focus. Labels sit outside the field for maximum accessibility.
- **Verified Badges:** A specific icon component using `secondary-color` to denote trust and authentication.
- **Data Tables:** Used for wholesale pricing tiers; use alternate row striping (#F1F5F9) to maintain legibility in dense data.