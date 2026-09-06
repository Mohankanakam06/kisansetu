from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routes import orchestrator, farmer, quality

app = FastAPI(title="Agri Platform Backend", version="1.0.0")

# Enable CORS so web clients can access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orchestrator.router)
app.include_router(farmer.router)
app.include_router(quality.router)

@app.get("/", response_class=HTMLResponse)
def root():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kisan Setu - Agri Platform Backend</title>
        <style>
            :root {
                --bg: #0f172a;
                --card-bg: #1e293b;
                --text-main: #f8fafc;
                --text-muted: #94a3b8;
                --accent: #22c55e;
                --accent-blue: #3b82f6;
                --border: #334155;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background-color: var(--bg);
                color: var(--text-main);
                margin: 0;
                padding: 40px 20px;
                display: flex;
                justify-content: center;
            }
            .container {
                max-width: 900px;
                width: 100%;
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
            }
            .badge {
                background: rgba(34, 197, 94, 0.15);
                color: var(--accent);
                padding: 6px 14px;
                border-radius: 9999px;
                font-size: 0.85rem;
                font-weight: 600;
                display: inline-block;
                margin-bottom: 12px;
                border: 1px solid rgba(34, 197, 94, 0.3);
            }
            h1 { margin: 0 0 10px; font-size: 2.2rem; font-weight: 700; }
            p.sub { color: var(--text-muted); margin: 0 0 25px; font-size: 1.05rem; }
            .btn-group { display: flex; gap: 12px; justify-content: center; margin-bottom: 30px; }
            .btn {
                background: var(--accent);
                color: #000;
                padding: 10px 20px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                transition: opacity 0.2s;
            }
            .btn-secondary {
                background: var(--card-bg);
                color: var(--text-main);
                border: 1px solid var(--border);
            }
            .btn:hover { opacity: 0.85; }
            .card {
                background: var(--card-bg);
                border: 1px solid var(--border);
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 20px;
            }
            .card h3 { margin: 0 0 14px; font-size: 1.2rem; color: var(--accent-blue); }
            .endpoint-list { list-style: none; padding: 0; margin: 0; }
            .endpoint-item {
                display: flex;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid var(--border);
                font-family: monospace;
                font-size: 0.95rem;
            }
            .endpoint-item:last-child { border-bottom: none; }
            .method {
                font-weight: 700;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                margin-right: 12px;
                min-width: 50px;
                text-align: center;
            }
            .post { background: #166534; color: #86efac; }
            .get { background: #1e40af; color: #93c5fd; }
            .path { color: #e2e8f0; flex: 1; }
            .desc { color: var(--text-muted); font-family: sans-serif; font-size: 0.85rem; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="badge">● Server Active & Healthy</span>
                <h1>🌾 Kisan Setu - Agri Platform</h1>
                <p class="sub">Direct-to-Market Multi-Agent Agricultural Ecosystem (SIH 2026, PS 26033)</p>
                <div class="btn-group">
                    <a class="btn" href="/docs" target="_blank">📖 Open Interactive Swagger UI (/docs)</a>
                    <a class="btn btn-secondary" href="/redoc" target="_blank">📑 View ReDoc</a>
                </div>
            </div>

            <div class="card">
                <h3>🚀 Live Registered Endpoints</h3>
                <div class="endpoint-list">
                    <div class="endpoint-item">
                        <span class="method get">GET</span>
                        <span class="path">/health</span>
                        <span class="desc">System health & database verification</span>
                    </div>
                    <div class="endpoint-item">
                        <span class="method post">POST</span>
                        <span class="path">/api/orchestrator/query</span>
                        <span class="desc">Gemini-driven intent classification & agent dispatch</span>
                    </div>
                    <div class="endpoint-item">
                        <span class="method post">POST</span>
                        <span class="path">/api/farmer/listing</span>
                        <span class="desc">Voice/Text multilingual STT & PostGIS produce listing</span>
                    </div>
                    <div class="endpoint-item">
                        <span class="method post">POST</span>
                        <span class="path">/api/quality/grade</span>
                        <span class="desc">Multimodal crop image quality grading (A/B/C)</span>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/health")
def health():
    return {"status": "ok"} 
