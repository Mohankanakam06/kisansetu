# KisanSetu (किसानसेतु): Agricultural Marketplace & AI-Powered Evaluator

This document outlines the core architecture and technological innovations of the KisanSetu platform, designed to replace traditional fragmented smallholder logistics with a unified, AI-orchestrated wholesale supply chain. It serves as a rapid onboarding and presentation blueprint.

## 1. The Core Problem
India's agricultural supply chain for smallholder farmers (< 2 hectares, representing 85% of farms) is bottlenecked by intermediaries (dalals/arhtiyas). These middlemen monopolize four functional responsibilities:
- **Radial Congestion & Fragmented Supply:** Individual farmers make inefficient, isolated trips to Mandis with small volumes (200kg-500kg).
- **Subjective Quality Grading:** Buyers visually discount crop value, resulting in unfair pricing.
- **Unoptimized Haulage:** Low-capacity, high-emission individual trips.
- **Predatory Cash Constraints:** Farmers require immediate cash loans, tying them to specific brokers taking 12-25% commission cuts.

## 2. The KisanSetu "Evaluator Blueprint" Solution

KisanSetu aggregates, grades, routes, and settles produce via four autonomous AI-driven agent pillars. 

### I. Consolidation / Aggregation Agent
- **Middleman Replacement:** Brokers pooling harvests.
- **Technical Implementation:** Uses **PostgreSQL + PostGIS (`ST_ClusterDBSCAN`)** spatial clustering. It groups fragmented supply records (200kg-500kg) within a 3–15 km geospatial radius into standardized wholesale commercial lots (2,000kg+). 
- **User Interface:** Interactive Geospatial Control Tower. Built with Leaflet, it displays CartoDB Voyager map tiles and high-res vector graphics indicating farm convergence into lot centroids.
- **Live Impact Metric:** **0% Broker Fee** directly translating to an 18–35% net income uplift for the farmer.

### II. Quality-Grading Agent & Trust Framework
- **Middleman Replacement:** Subjective human arhtiya grading.
- **Technical Implementation:** Powered by the **Google Gemini Multimodal Vision API**. It analyzes uploaded crop photos against agricultural rubrics (firmness, defect percentage, colorimetry, size distributions).
- **User Interface:** Multimodal Quality Inspector. Next.js simulated scanning viewport demonstrating a Grade A/B/C/D breakdown with detailed defect mapping. Additionally, an HTML5 Canvas-powered oscilloscope voice-to-text widget parsing Hindi/regional languages into structured listings (Crop, Qty, Price).
- **Live Impact Metric:** Eliminates subjective visual discounting, providing immutable, AI-certified trust to commercial buyers.

### III. Forecast & Routing Agent (Logistics & Transport)
- **Middleman Replacement:** Disjointed regional Mandi transport.
- **Technical Implementation:** Integrates with the **OpenRouteService (ORS) API** to solve complex Vehicle Routing Problems (VRP/TSP). Generates multi-pickup, single-truck trajectories.
- **User Interface:** Toggleable Map route comparisons tracing separate traditional radial Mandi trips vs. clustered single-loop AI routes.
- **Live Impact Metric:** A verifiable **72% fuel and CO₂ mileage reduction** (measured via real-time carbon offsets in the ESG simulator) compared to isolated farm trips.

### IV. Settlement Agent (Cash Flow & Escrow)
- **Middleman Replacement:** Mandi cash advances & predatory credit.
- **Technical Implementation:** A fully automated multi-stage Escrow pipeline via API simulations (Sandbox UPI / Razorpay Test integration).
- **User Interface:** Dynamic Milestone Ledger. Features dual-stage triggers: 40% released at farmgate pickup, 60% upon digital delivery sign-off, with downloadable UTR tax-compliant vouchers.
- **Live Impact Metric:** **Instant UPI Payouts** resolving liquidity crunches without standard 15-45 day market delays.

## 3. Technology Stack & Required API Accounts

### Frontend & Core Application
- **Framework:** Next.js 15 (React 19) App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **Geospatial UI:** Leaflet & `react-leaflet` with CartoDB Voyager tiles.
- **Capability:** Progressive Web App (PWA) with Offline Caching (`sw.js`).

### Third-Party APIs required for Live Deployment:
1. **Google Gemini API** (`GEMINI_API_KEY`): Multimodal vision grading & quality inspection rubrics. Obtain at Google AI Studio.
2. **OpenRouteService API** (`ORS_API_KEY`): Geospatial routing (Multi-stop VRP route optimization, route coordinates, times, and distances). Obtain at OpenRouteService Developer Dashboard.
3. **Database** (`DATABASE_URL`): PostgreSQL with PostGIS extension (e.g., Supabase, Neon). Required to run real spatial DB Queries (DBSCAN `ST_ClusterDBSCAN` for Aggregation).
4. **Razorpay / UPI Test Keys** (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`): Two-stage escrow ledger, handling milestone payouts to farmer accounts. Obtain at Razorpay Dashboard (Test Mode).

## 4. The Interactive Evaluator Simulation
The platform contains a dedicated **Profit & Impact Simulator Module** (`<ProfitImpactSimulator />`). This serves as our primary demonstration tool. 
It features:
- **Volume & Distance Sliders:** 200kg up to 10,000kg load testing.
- **Live ESG Carbon Tracker:** Converts saved route kilometers into Liters of Diesel and actual kilograms of CO2 saved.
- **Dual Perspectives:** Immediately switches between the "Farmer Extra Cash" metrics and the "Wholesale Buyer Logistics Savings".