# Product Requirements Document
## Direct-to-Market Agri Platform — SIH 2026, PS 26033

This document is the single source of truth for this build. Place it at the repo root as `PRD.md` and point every AI IDE (Claude Code, Antigravity, etc.) at it before starting work — each agent session should read this file first.

---

## 1. Problem & Goal

**Problem Statement 26033** (Ministry of Consumer Affairs, Food & Public Distribution, DoCA): multiple intermediaries reduce farmer earnings and raise consumer prices.

**What we're building:** a marketplace that doesn't just remove middlemen but replaces the four functions they actually perform, each as an AI agent:

| Middleman function | Our replacement |
|---|---|
| Aggregating small lots into buyer-scale volume | Aggregation agent |
| Quality assurance / trust | Quality-grading agent (AI vision) |
| Cash-flow / instant payment to farmer | Settlement agent |
| Logistics | Forecast & routing agent |

**Definition of done for the hackathon demo:** a farmer lists produce by voice → it gets aggregated with nearby listings → gets photo-graded → a buyer finds it on a dashboard, orders it → a route is computed → payout is simulated. All five steps must run live, end to end, even if individual pieces are simplified.

---

## 2. System Architecture

```
Farmer (voice/WhatsApp) ──┐
                           ├──▶ Orchestrator (Claude/Gemini, tool-calling) ──▶ Buyer dashboard
Buyer (web) ───────────────┘              │
                                           ├──▶ Aggregation agent
                                           ├──▶ Quality-grading agent
                                           ├──▶ Forecast & routing agent
                                           └──▶ Settlement agent
                                                       │
                                           Data & maps layer (Postgres+PostGIS, Redis)
```

- **Orchestrator**: receives every request, classifies intent, calls the right agent(s) as tools, holds session state, returns a response.
- **Farmer interface agent**: voice/text → structured listing `{crop, quantity_kg, location, price_expectation}`.
- **Aggregation agent**: geo-clusters same-crop active listings into a sellable "lot."
- **Quality-grading agent**: photo → `{grade, defects}` via vision model + rubric prompt.
- **Forecast & routing agent**: demand trend per crop/region + multi-pickup route for an order.
- **Settlement agent**: simulated payout on pickup confirm / delivery confirm.

---

## 3. Tech Stack & Required Software

Install these before writing any code:

| Tool | Purpose | Notes |
|---|---|---|
| Node.js 20+ / npm or pnpm | Frontend tooling | For Next.js dashboard |
| Python 3.11+ / pip or poetry | Backend | FastAPI |
| PostgreSQL 15+ with PostGIS extension | Primary DB | `CREATE EXTENSION postgis;` after install |
| pgvector extension | Vector store for price-history RAG | Same Postgres instance |
| Redis | Session/cache for orchestrator | Local install or Docker |
| Docker + Docker Compose (recommended) | Spin up Postgres+PostGIS+Redis with one command | Avoids each teammate configuring DB locally |
| Git + a shared GitHub repo | Version control | See Section 6 |
| Google Antigravity (free) or Claude Code / Cursor | AI IDE for building | Point it at this PRD.md |
| Postman or Thunder Client (VS Code ext) | Manual API testing | For verifying contracts between people |

**AI/API accounts to create (all free-tier):**
- Google AI Studio account → Gemini API key (orchestrator + vision grading)
- OpenRouter account → API key (backup/text agents, optional)
- Bhashini API access (Govt of India, developer signup) → speech-to-text/translation
- OpenRouteService account → free API key (routing)
- Razorpay test-mode account → test API keys (settlement simulation)

Put all keys in a `.env` file at repo root — **never commit this file.** Commit a `.env.example` with empty placeholders instead.

---

## 4. Database Schema

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'buyer')),
  language_pref TEXT DEFAULT 'hi',
  location GEOGRAPHY(POINT),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES users(id),
  crop_type TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  price_expectation NUMERIC,
  location GEOGRAPHY(POINT) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'clustered', 'sold')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_type TEXT NOT NULL,
  total_quantity_kg NUMERIC NOT NULL,
  grade TEXT,
  centroid GEOGRAPHY(POINT),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'ordered', 'delivered')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lot_listings (
  lot_id UUID REFERENCES lots(id),
  listing_id UUID REFERENCES listings(id),
  PRIMARY KEY (lot_id, listing_id)
);

CREATE TABLE quality_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID REFERENCES lots(id),
  grade TEXT NOT NULL,
  defects JSONB,
  photo_url TEXT,
  graded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID REFERENCES lots(id),
  buyer_id UUID REFERENCES users(id),
  quantity_kg NUMERIC NOT NULL,
  status TEXT DEFAULT 'placed' CHECK (status IN ('placed', 'routed', 'picked_up', 'delivered', 'settled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  route_geojson JSONB,
  distance_km NUMERIC,
  eta TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  farmer_id UUID REFERENCES users(id),
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial_paid', 'settled')),
  paid_at TIMESTAMPTZ
);

CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_type TEXT NOT NULL,
  region TEXT NOT NULL,
  date DATE NOT NULL,
  avg_price NUMERIC NOT NULL,
  embedding VECTOR(768)
);
```

---

## 5. API Contract

All endpoints under `/api`. Every response is JSON. This is the contract Person B and Person C build against from hour one, before Person A's real implementation exists — mock these shapes exactly.

**`POST /api/orchestrator/query`**
Request: `{ "user_id": "uuid", "message": "string", "message_type": "text|voice|image", "media_url": "string|null" }`
Response: `{ "intent": "string", "agent_called": "string", "result": {} }`

**`POST /api/farmer/listing`**
Request: `{ "farmer_id": "uuid", "transcript": "string", "language": "hi|cg|en" }`
Response: `{ "listing_id": "uuid", "crop_type": "string", "quantity_kg": number, "price_expectation": number, "location": {"lat": number, "lng": number} }`

**`GET /api/lots?crop=&grade=&lat=&lng=&radius_km=`**
Response: `{ "lots": [ { "id": "uuid", "crop_type": "string", "total_quantity_kg": number, "grade": "string", "centroid": {"lat": number, "lng": number} } ] }`

**`POST /api/quality/grade`**
Request: `{ "lot_id": "uuid", "photo_url": "string" }`
Response: `{ "grade": "A|B|C", "defects": ["string"] }`

**`POST /api/orders`**
Request: `{ "buyer_id": "uuid", "lot_id": "uuid", "quantity_kg": number }`
Response: `{ "order_id": "uuid", "status": "placed" }`

**`POST /api/routing/optimize`**
Request: `{ "order_id": "uuid" }`
Response: `{ "route_geojson": {}, "distance_km": number, "eta": "ISO8601", "stops": [{"listing_id": "uuid", "lat": number, "lng": number}] }`

**`POST /api/settlement/payout`**
Request: `{ "order_id": "uuid", "stage": "pickup|delivery" }`
Response: `{ "payment_status": "partial_paid|settled", "amount": number }`

---

## 6. Roles & Deliverables

### Person A — AI agents & backend core
- Set up FastAPI project, apply the schema in Section 4 as migrations
- Build the orchestrator: Gemini/Claude tool-calling wired to the other 4 agents
- Build the farmer-interface agent (Bhashini → structured listing)
- Build the quality-grading agent (vision call + rubric prompt)
- Implement `/api/orchestrator/query`, `/api/farmer/listing`, `/api/quality/grade`
- **First deliverable, hour 1:** schema applied + this PRD's API contract confirmed/adjusted with the team

### Person B — Frontend & farmer-facing flow
- Next.js + Tailwind buyer dashboard: browse `/api/lots`, filter by crop/grade/location, place order via `/api/orders`
- Leaflet map showing lot locations
- Farmer-facing interface: web voice-recorder page (WhatsApp Business API only if time allows)
- Build against the mocked JSON shapes in Section 5 until Person A's endpoints are live

### Person C — Logistics, data & integration
- Aggregation agent: PostGIS clustering query, populates `lots` and `lot_listings`
- Forecast & routing agent: OpenRouteService/OR-Tools call, implements `/api/routing/optimize`
- Settlement agent (mocked): implements `/api/settlement/payout`
- Seed data: fake farmers, buyers, listings, price_history rows for a realistic demo
- Owns integration checkpoints and the final end-to-end dry run

---

## 7. Git Workflow

1. One shared GitHub repo, created by anyone, others added as collaborators immediately.
2. Branches: `main` (always demo-able), `dev` (integration branch), `frontend`, `backend`, `data-logistics`.
3. Everyone commits to their own branch, opens a PR into `dev` at each checkpoint (suggest: hour 4, hour 10, hour 20 for a ~24-36hr hackathon).
4. Whoever opens a PR that touches a shared file (schema, contract) pings the other two before merging — schema/contract changes are the main source of conflicts.
5. Resolve merge conflicts together live, not solo — they're usually contract drift (a field renamed, a status value added) and take minutes to fix when the person who made the change is present.
6. Merge `dev` → `main` only when the full flow (Section 1's definition of done) runs end to end.
7. Keep `.env` out of git; commit `.env.example` with empty keys so everyone knows what's needed.

---

## 8. MVP Scope (build this, nothing more, until it works)

- Farmer listing via voice (live Bhashini call, or a cached fallback response for demo safety)
- 3-4 listings aggregating into one visible lot
- One photo → grade demo
- Buyer dashboard: browse, filter, order
- One route-optimization example with a visible before/after (individual trips vs. consolidated)

**Stretch only after the above works:** real WhatsApp integration, multilingual live demo, visible farmer payout timeline, demand-forecast chart.
