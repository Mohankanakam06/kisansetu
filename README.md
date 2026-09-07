# KisanSetu — Direct-to-Market Agri Platform

> AI-powered agricultural aggregation, grading, and direct-to-buyer marketplace  
> SIH 2026 · Problem Statement 26033

A full-stack platform connecting farmers to buyers using multi-agent AI orchestration, multilingual voice/text input, multimodal crop-quality grading, route optimization, and automated settlement.

---

## Repository Structure

```
kisansetu/
├── frontend/              # Next.js 16 App Router (React 19, Tailwind, PWA)
│   ├── src/
│   │   ├── app/           # App Router pages (/, /login, /farmer, /buyer, /orders, etc.)
│   │   ├── components/    # Shared React components (SiteNav, LeafletMap, PWAInstallPrompt)
│   │   ├── services/      # API client layer (api.ts)
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets (icons, logos, sw.js)
│   ├── package.json       # Node.js dependencies
│   ├── next.config.ts     # Next.js configuration
│   └── tsconfig.json      # TypeScript configuration
│
├── backend/               # FastAPI Python server
│   ├── main.py            # FastAPI app entry point, CORS, orders endpoints
│   ├── db.py              # PostgreSQL connection (psycopg2 + PostGIS)
│   ├── routes/            # API route handlers
│   │   ├── auth.py        # Phone OTP + JWT authentication
│   │   ├── farmer.py      # Farmer listing creation (voice/text)
│   │   ├── lots.py        # Lot browsing, geofilter, aggregation trigger
│   │   ├── quality.py     # AI quality grading endpoint
│   │   ├── routing.py     # Route optimization (ORS)
│   │   ├── settlement.py  # Payout settlement processing
│   │   └── orchestrator.py# Multi-agent query dispatcher
│   └── requirements.txt   # Python dependencies
│
├── ai/                    # AI/ML agents
│   └── agents/
│       ├── aggregations.py    # DBSCAN clustering via PostGIS
│       ├── farmer_interface.py# Multilingual STT → structured listing
│       ├── quality_grading.py # Gemini Vision crop grading (A/B/C/D)
│       ├── routing.py         # OpenRouteService route optimization
│       ├── settlement.py      # Payout calculation engine
│       └── orchestrator.py    # Gemini tool-calling orchestrator
│
├── database/              # Database schema & seeding
│   ├── migrations/
│   │   └── 001_init.sql   # Full schema (users, listings, lots, orders, payments + PostGIS)
│   └── seed.py            # Sample data seeder
│
├── tests/                 # Python test suite (pytest)
│   ├── test_e2e_flow.py   # Full 8-step E2E marketplace test (mocked, hermetic)
│   ├── test_aggregation.py# Aggregation unit test (needs live DB)
│   ├── test_routing.py    # Routing unit test (needs live DB)
│   ├── test_settlement.py # Settlement unit test (needs live DB)
│   └── test_ors.py        # ORS integration test
│
├── scripts/               # Utility & debug scripts
│   ├── generate-pwa-icons.py  # PWA icon generator (Pillow)
│   ├── check_db.py        # Database connectivity check
│   ├── check_constraint.py# DB constraint inspector
│   ├── debug_coords.py    # Coordinate debugging tool
│   ├── debug_ors.py       # ORS API debugging tool
│   └── demo_cache/        # Cached demo order data
│
├── docs/                  # Documentation
│   ├── BUG_AUDIT.md       # Full bug audit report (9 issues fixed)
│   ├── FREE_DEPLOYMENT.md # Deployment guide (Supabase + Render + Vercel)
│   ├── PRD.md             # Product Requirements Document
│   ├── PERSON_C_COMPLETION_REPORT.md
│   └── roadmap_status.html
│
├── config/                # Environment configuration templates
│   └── (copy .env files here for reference)
│
├── .env                   # Backend env vars (gitignored)
├── .env.local             # Frontend env vars (gitignored)
├── .env.example           # Template for required env vars
└── .gitignore
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16.3.3 (Turbopack), React 19, Tailwind CSS 4 |
| Backend | Python 3.14+ / FastAPI |
| Database | PostgreSQL + PostGIS |
| AI Providers | Google Gemini (Vision + LLM), Sarvam AI, Bhashini |
| Routing | OpenRouteService (ORS) |
| Auth | Phone OTP + JWT (HS256) |
| PWA | Custom Service Worker, Web App Manifest |

---

## Quick Start

### Backend
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, GEMINI_API_KEY, ORS_API_KEY, JWT_SECRET

# Run the database migration (requires PostgreSQL + PostGIS)
psql $DATABASE_URL < database/migrations/001_init.sql

# Start the API server
uvicorn backend.main:app --reload --port 8000
```

### Frontend
```bash
# Install Node.js dependencies
npm install

# Set up frontend env
# Edit .env.local → NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Start the dev server
npm run dev
```

### Run Tests
```bash
# Hermetic E2E tests (no database needed)
py -m pytest tests/test_e2e_flow.py -v -s

# Full suite (requires live PostgreSQL)
py -m pytest tests/ -v
```

---

## Key API Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/send-otp` | Send OTP to phone number |
| POST | `/api/auth/verify-otp` | Verify OTP, receive JWT token |
| POST | `/api/auth/register` | Register new farmer/buyer |
| GET | `/api/auth/me` | Get current user (Bearer token) |
| POST | `/api/farmer/listing` | Create produce listing (voice/text) |
| GET | `/api/lots` | Browse aggregated lots (with geofilter) |
| POST | `/api/quality/grade` | AI crop quality grading |
| POST | `/api/orders` | Place a buyer order |
| POST | `/api/routing/optimize` | Optimize delivery route |
| POST | `/api/settlement/payout` | Process farmer payout |

---

## Where to Add New Code

| What you're building | Where to put it |
|---|---|
| New frontend page | `frontend/src/app/your-page/page.tsx` |
| New React component | `frontend/src/components/YourComponent.tsx` |
| New API route | `backend/routes/your_route.py` (+ register in `backend/main.py`) |
| New AI agent | `ai/agents/your_agent.py` |
| New DB migration | `database/migrations/002_your_change.sql` |
| New test | `tests/test_your_feature.py` |

---

## Deployment

See [`docs/FREE_DEPLOYMENT.md`](docs/FREE_DEPLOYMENT.md) for a complete free-tier deployment guide using:
- **Supabase** (PostgreSQL + PostGIS)
- **Render** (FastAPI backend)
- **Vercel** (Next.js frontend + PWA)

---

*Built for Smart India Hackathon 2026 · PS 26033*  
*Last updated: 2026-09-07*
