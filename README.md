# Kisan Setu — Agri Platform Backend

> Direct-to-Market Multi-Agent Agricultural Ecosystem  
> SIH 2026 · Problem Statement 26033

A FastAPI backend that connects farmers to markets using multi-provider AI agents, multilingual voice/text input, and multimodal crop-quality grading.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Python 3.11+ / FastAPI |
| Database | PostgreSQL (with PostGIS) |
| Cache / Queue | Redis |
| AI Providers | Google Gemini, Sarvam AI, Bhashini, OpenRouter |
| Agents | Multi-agent orchestrator (`app/agents/`) |
| Migration | SQL-based (`migration/`) |
| Persona / Docs | `persona/` (separate `.git`) |

---

## Project Structure

```
.
├── app/                  # Main application
│   ├── main.py           # FastAPI app, CORS, root HTML dashboard
│   ├── db.py             # PostgreSQL connection (psycopg2)
│   ├── agents/           # Multi-agent dispatch & logic
│   └── routes/
│       ├── orchestrator.py
│       ├── farmer.py
│       └── quality.py
├── migration/            # DB migrations
├── persona/              # Persona / documentation repo (submodule-like)
├── .env                  # Environment (see below)
├── .venv/                # Virtual environment
└── README.md             # This file
```

---

## Environment Variables

Copy or edit `.env` with your values:

```bash
DATABASE_URL=postgresql://postgres:Shy%40m9101@localhost:5432/kisan_setu
REDIS_URL=redis://localhost:6379/0

# AI / LLM Keys
GEMINI_API_KEY=your_key_here
SARVAM_API_KEY=your_key_here
BHASHINI_API_KEY=your_key_here
OPENROUTER_API_KEY=sk-or-v1-...
```

### Security Note
- `.env` is loaded at startup but should be added to `.gitignore` for production.
- The current `.env` contains live credentials; rotate them before public deployment.

---

## Quick Start

```bash
# 1. Create / activate virtual env
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt  # if present; else pip install fastapi uvicorn psycopg2-binary redis python-dotenv

# 3. Start services (PostgreSQL + Redis must be running)
#    DB should have database: kisan_setu

# 4. Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Visit `http://localhost:8000/` for the live dashboard or `/docs` for Swagger UI.

---

## Key Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` | Landing page / status dashboard |
| GET | `/health` | Health check |
| POST | `/api/orchestrator/query` | Intent classification & agent dispatch (Gemini) |
| POST | `/api/farmer/listing` | Multilingual STT → produce listing (PostGIS) |
| POST | `/api/quality/grade` | Image grading (A/B/C) via multimodal AI |

---

## Agents & Architecture

`app/agents/` contains the multi-agent orchestration layer.
- **Orchestrator**: Routes user intents to the right agent.
- **Farmer**: Handles multilingual voice/text input and produce listings.
- **Quality**: Processes crop images for grading.

Providers are abstracted so swapping Gemini ↔ OpenRouter ↔ Sarvam is configurable via env / agent config.

---

## Database

- `app/db.py` connects via `psycopg2` using `DATABASE_URL`.
- PostGIS extensions expected for geospatial produce listings.
- Migrations live in `migration/`; apply with `psql` or a migration tool.

---

## Conventions

- CORS is open (`*`) for cross-origin web clients — restrict in production.
- Root endpoint serves a self-contained HTML dashboard (no external build step required for status checks).
- Persona / documentation lives in `persona/` with its own `.git`.

---

## License / Attribution

Built for SIH 2026 (Problem Statement 26033).  
Contact: project team via `persona/` docs.

---

*Last updated: 2026-09-06*
