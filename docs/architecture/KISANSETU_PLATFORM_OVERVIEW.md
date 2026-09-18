# KisanSetu: Agricultural Marketplace & AI-Powered Evaluator

This document outlines the core architecture and technological innovations of the KisanSetu Agricultural Marketplace, designed to replace traditional fragmented smallholder logistics with a unified, AI-orchestrated wholesale supply chain.

## 1. The Core Problem
Traditional agricultural logistics suffer from "Radial Congestion":
- Smallholders (200kg-500kg) make individual trips to mandis.
- High broker commissions (12-25%) eat into farmer net profits.
- High diesel/CO2 footprint due to inefficient, dispersed transport.
- Subjective manual quality grading leads to unfair pricing.

## 2. The KisanSetu "Evaluator Blueprint" Solution

KisanSetu aggregates, grades, routes, and settles produce via four AI-driven agent pillars:

### I. Interactive Geospatial Control Tower
- **Technology:** OpenRouteService (ORS) + PostGIS spatial clustering.
- **Function:** Aggregates fragmented supply (200kg-500kg) into wholesale lots (2,000kg+) via DBSCAN spatial clustering.
- **Visualization:** Toggleable map layers comparing radial "Traditional" trips against AI-optimized, single-truck loop circuits.

### II. Live Multilingual Voice Listing Widget
- **Technology:** HTML5 Canvas (Waveform), Sarvam AI (Speech-to-Text), Gemini (Intent Parsing).
- **Function:** Enables zero-literacy listing. Farmers speak into the app; AI parses the audio into structured crop, quantity, and price specifications.

### III. Interactive Computer Vision Quality Inspector
- **Technology:** Gemini Multimodal Vision API.
- **Function:** Standardizes grading via automated rubric analysis: detects blemish percentage, firmess index, color uniformity, and size scaling.
- **Impact:** Eliminates subjective "broker discounting" by providing an immutable, image-certified quality report.

### IV. Dynamic Profit & Impact Simulator
- **Technology:** Real-time Econometric Modeling.
- **Function:** Interactive transparency tool for farmers and buyers:
    - **Farmer Perspective:** Calculates net cash uplift (typically +18% to +35%) by removing broker middleman fees.
    - **Buyer Perspective:** Illustrates procurement cost savings via pooled logistics.
    - **ESG Impact:** Real-time calculation of fuel (diesel) and carbon (CO2) savings, quantifying the environmental footprint of the AI-clustered logistics model.

### V. 2-Stage Escrow & Settlement Settlement
- **Technology:** Razorpay/UPI Integration.
- **Function:** Milestone-gated payout: 40% released at farmgate pickup, 60% upon delivery confirmation. Enables instant liquidity compared to standard 30-day market delays.

## 3. Impact Summary (The "Live Impact" Metrics)
- **Brokerage:** 0% middleman fees (compared to industry standard 12-25%).
- **Logistics:** Up to 72% mileage reduction / CO2 savings vs. radial traditional trips.
- **Transparency:** Immutable AI-certified grade (A/B/C) eliminates visual discounting.
- **Liquidity:** Instant UPI settlement at key fulfillment milestones.
