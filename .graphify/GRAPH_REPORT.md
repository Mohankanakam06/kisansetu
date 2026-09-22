# Graph Report - .  (2026-09-22)

## Corpus Check
- 230 files · ~3,96,844 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 970 nodes · 1768 edges · 90 communities detected
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output
- Edge kinds: contains: 479 · MODIFIES: 306 · imports: 226 · imports_from: 198 · rationale_for: 183 · calls: 107 · ON_BRANCH: 90 · PARENT_OF: 67 · method: 55 · inherits: 34 · uses: 12 · references: 11


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 230 · Candidates: 263
- Excluded: 0 untracked · 38154 ignored · 0 sensitive · 3 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `e82788f`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `Button()` - 39 edges
2. `ApiService` - 30 edges
3. `Badge()` - 26 edges
4. `useLanguage()` - 25 edges
5. `Card()` - 22 edges
6. `cn()` - 15 edges
7. `delay()` - 12 edges
8. `is_redis_available()` - 10 edges
9. `cn()` - 9 edges
10. `Lot` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Use Gemini to extract structured fields from the transcript.` --rationale_for--> `parse_listing()`  [EXTRACTED]
  frontend/ai/agents/farmer_interface.py → ai/agents/farmer_interface.py
- `Retrieve a connection from the pool, with MockDB fallback.` --rationale_for--> `get_conn()`  [EXTRACTED]
  frontend/backend/db.py → backend/db.py
- `Return a connection to the pool or close mock.` --rationale_for--> `release_conn()`  [EXTRACTED]
  frontend/backend/db.py → backend/db.py
- `Context manager for safe database connections and transactions.` --rationale_for--> `get_db()`  [EXTRACTED]
  frontend/backend/db.py → backend/db.py
- `Create a new order for a lot.` --rationale_for--> `create_order()`  [EXTRACTED]
  frontend/backend/main.py → backend/main.py

## Hyperedges (group relationships)
- **KisanSetu Agricultural Supply Chain and Monetization Pipeline** — home_four_pillars_workflow, list_crop_wizard_page, logistics_orders_page, earnings_settlement_page, marketplace_browse_page [INFERRED 0.88]
- **AI Quality Grading and Trust Assurance System** — list_crop_ai_quality_step, lot_detail_quality_report, lot_detail_refined_verification_log [INFERRED 0.90]
- **Multi-Farmer Crop Aggregation and Logistics Dispatch** — logistics_consolidated_orders, lot_detail_contributing_farmers, earnings_active_listings_table [INFERRED 0.85]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (49): App main alias shim for Render / deployment hosts., App alias shim for Render / deployment hosts., data-logistics, dev, main, 033b08c fix(cors): support wildcard and vercel subdomains in CORS middleware, 0524d79 Add Kisan Setu project, 093f648 feat(pricing): redesign DynamicPricingCard with real-life agri-logistics scenarios (+41 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (28): barlow, footerLinks, inter, metadata, plusJakartaSans, viewport, zillaSlab, 2138c17 fix(ui): dynamic role-aware navigation for buyer and farmer accounts (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (11): 5aa42a4 fix(ui): unify pwa navbar, remove buggy mode-switch, use soft routing, AuthMethod, LoginState, Role, Role, Step, BadgeProps, Button() (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (32): get_current_user(), hash_password(), _normalize_user(), password_login(), Hash password using PBKDF2-HMAC-SHA256 with a random salt., Verify password against stored salt$hash or legacy plain string., Verify 6-digit OTP and issue JWT session token., Tolerate minimal/mock DB rows that may lack name/phone/role/language_pref keys. (+24 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (23): useWebSocket(), LeafletMap, statusPillBadge, statusPillColor, DynamicPricingCardProps, ScenarioConfig, ScenarioKey, SCENARIOS (+15 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (12): LotDetailModalProps, BeforeInstallPromptEvent, Event, Language, LanguageContext, LanguageContextType, useLanguage(), CROP_BENCHMARKS (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (23): DemoPaymentModal(), DemoPaymentModalProps, DemoPaymentService, CreateOrderRequest, DemoPaymentRequest, DemoPaymentResponse, FarmerListing, Listing (+15 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (4): ffd1c7c chore: consolidate repos, clean duplicates, restructure project layout, PRECACHE_ASSETS, ACCENTS, StatusPageProps

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (9): Cluster active listings of the same crop into lots., Cluster active listings of the same crop into lots with transaction-level adviso, run_aggregation(), exec_geo_fallback(), Run PostGIS geometry statement; if PostGIS extension is not installed,     rollb, 1bb7010 feat: KisanSetu v1.0 - Next-gen Agri-tech platform outperforming DeHaat & Ninjacart, full PWA, auto-deploy config, 1ef1257 feat: KisanSetu v1.0 - Next-gen Agri-tech platform enhancements and escrow settlement features, 7122065 fix: resolve extension hydration mismatch and harden backend API endpoints with offline fallbacks (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (23): delete_cache(), delete_otp(), get_cache(), get_chat_history(), get_otp(), is_redis_available(), Retrieve recent multi-turn chat history for a user., Save chat history for a user with default 1-hour expiration. (+15 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (18): AngleCapture, LiveCameraCapture(), LiveCameraCaptureProps, CropLine, FarmerPage(), LeafletMap, makeEmptyQualityState(), PreviewType (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (8): App package alias shim for Render / deployment hosts., 9f0b33d Refactor: reorganize into clean monorepo (backend, ai, database, tests, docs) and fix import paths, f23d914 Merge pull request #1 from Mohankanakam06/dev, jitter(), seed(), payout(), Process payout for an order at pickup or delivery stage., Process payout for an order at pickup or delivery stage.      Moves money, so

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (7): commonReasons, PhygitalStatusCard(), PhygitalStatusCardProps, STATES, Badge(), Card(), Input

### Community 13 - "Community 13"
Cohesion: 0.14
Nodes (16): Run migrations in 'offline' mode.      This configures the context with just a U, Run migrations in 'online' mode.      In this scenario we need to create an Engi, run_migrations_offline(), run_migrations_online(), Geography, Listing, Lot, LotListing (+8 more)

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (15): OrderCreate, CreateOrderRequest, demo_checkout(), # NOTE: If keys are placeholders, the order creation will fail gracefully., Isolated simulated payment and escrow gateway for demo & hackathon walkthroughs., # NOTE: payload.order_id is Razorpay's order id, not our internal orders.id., VerifyPaymentRequest, BaseModel (+7 more)

### Community 15 - "Community 15"
Cohesion: 0.16
Nodes (2): ApiService, delay()

### Community 16 - "Community 16"
Cohesion: 0.14
Nodes (11): DynamicMarginEngine, get_dynamic_ticker_stream(), KisanSetu NeuroMargin: 3-Tier Dynamic Pricing Engine & Temporal Forecaster =====, Explainable Microeconomic Dynamic Pricing & Margin Allocation Engine.     Disint, Calculate fair dynamic pricing, farmer payout, buyer cost, and XAI factor breakd, Generate real-time ticker stream items backed by the STLAttLSTM prediction engin, STL-AttLSTM (Seasonal-Trend Decomposition with Multi-Head Temporal Attention)., Fourier series approximation of bi-annual harvest and lean season cycles. (+3 more)

### Community 17 - "Community 17"
Cohesion: 0.12
Nodes (5): get_mock_demo_conn(), MockDemoConnection, MockDemoCursor, Mock cursor for demo payment tests that handles INSERT/RETURNING patterns., Mock connection that provides MockDemoCursor and no-op transaction methods.

### Community 18 - "Community 18"
Cohesion: 0.20
Nodes (6): COOKIE_CATEGORIES, LEGAL_LINKS, LegalLayoutProps, LegalList(), LegalParagraph(), LegalSection()

### Community 19 - "Community 19"
Cohesion: 0.19
Nodes (11): broadcast_apmc_ticker(), ConnectionManager, Anonymous endpoint just for APMC Market Ticker., Anonymous endpoint just for APMC Market Ticker., Personalized endpoint for farmers/buyers to get order and pool updates., Personalized endpoint for farmers/buyers to get order and pool updates., Thread-safe and sync-friendly helper to emit websocket events., Thread-safe and sync-friendly helper to emit websocket events. (+3 more)

### Community 20 - "Community 20"
Cohesion: 0.13
Nodes (13): get_order(), global_exception_handler(), http_exception_handler(), list_orders(), List orders. With auth enforced, buyers only see their own orders., List orders. With auth enforced, buyers only see their own orders., Return FastAPI's crafted ``detail`` and mirror it into the error envelope., Get order details. With auth enforced, buyers can only read their own orders. (+5 more)

### Community 21 - "Community 21"
Cohesion: 0.13
Nodes (13): 1318520 fixed some minor bugs, 183c849 polish: agri-fintech design system overhaul - visual refresh + components + TS fixes, 1a6073e feat(ui): implement Mandi & Soil design system, 97766c8 feat: Mandi Live Data Integration, PWA Prompt fix & TypeScript strictness cleanup, d3a8003 feat: implement user registration module with database schema, backend auth routes, and frontend page, dc663d4 @ feat: Complete platform audit, polish mobile navigation & fix core flows, FarmerListingRequest, get_farmer_listings() (+5 more)

### Community 22 - "Community 22"
Cohesion: 0.17
Nodes (9): cn(), Button, ButtonProps, buttonVariants, Input, InputProps, Label, labelVariants (+1 more)

### Community 23 - "Community 23"
Cohesion: 0.16
Nodes (10): BuyerMetricsHeader(), BuyerMetricsHeaderProps, NoListingsFound(), NoListingsFoundProps, BENCHMARK_MANDI, CROP_EMOJIS, CROPS, GRADES (+2 more)

### Community 24 - "Community 24"
Cohesion: 0.22
Nodes (8): Compare1(), Compare1Props, ScrollArea, ScrollBar, Separator, TabsContent, TabsList, TabsTrigger

### Community 25 - "Community 25"
Cohesion: 0.17
Nodes (13): get_conn(), get_db(), get_pool(), Initialize or return the threaded PostgreSQL connection pool., Retrieve a connection from the pool., Return a connection back to the pool., Retrieve a real connection from the pool. Raises if unavailable., Return a connection to the pool. (+5 more)

### Community 26 - "Community 26"
Cohesion: 0.19
Nodes (12): calculate_dynamic_margin(), DynamicMarginRequest, get_historical_trends(), get_live_ticker(), predict_crop_price(), PricePredictRequest, FastAPI Router for KisanSetu NeuroMargin Dynamic Pricing Engine. Provides endpoi, Fetch historical 14-day trend and 7-day future projections with STL decompositio (+4 more)

### Community 27 - "Community 27"
Cohesion: 0.17
Nodes (3): get_mock_conn(), MockConnection, MockCursor

### Community 28 - "Community 28"
Cohesion: 0.25
Nodes (10): decode_image_bytes(), get_genai_client(), grade_photo(), Dynamically get or initialize Google GenAI Client with active environment key., Unified Grade Entrypoint.     Executes Gemini 2.0 Flash Vision (if key configure, Decode raw bytes, base64 data URL, or plain base64 string to OpenCV BGR image., Classical Computer Vision Produce Grading & Anti-Fraud Inspection Pipeline., Safely persist quality grade to DB if connection available. (+2 more)

### Community 29 - "Community 29"
Cohesion: 0.18
Nodes (10): get_lifecycle_status(), get_trust_profile(), PhysicalPickupVerificationRequest, pregrade_listing(), PregradeRegistrationRequest, Ticket 2.1: Register Produce Pregrade via Tier 1 AI inspection., Ticket 2.1, 2.2, 2.3:     Driver/Agent spot-check on physical pickup.     - Meas, Ticket 2.3: Farmer dynamic trust score profile and verification audit trail. (+2 more)

### Community 30 - "Community 30"
Cohesion: 0.29
Nodes (10): call_openrouter_chat(), call_openrouter_structured(), call_openrouter_vision(), get_openrouter_api_key(), Call OpenRouter to extract or generate structured JSON output.     Cleans markdo, Call OpenRouter multimodal vision model for produce grading and inspection., Remove a leading/trailing ```json fence that models sometimes add., Retrieve active OpenRouter API key dynamically from environment. (+2 more)

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (10): analyze_screen_recapture(), decode_image(), detect_moire_pattern(), detect_screen_bezel(), detect_specular_glare(), Accepts raw bytes, base64 data URL, or standard base64 string and returns OpenCV, Main classical CV entrypoint combining Moiré FFT, Glare HSV, and Bezel contour a, Analyzes 2D Fast Fourier Transform (FFT) spectrum of the image to detect     hig (+2 more)

### Community 32 - "Community 32"
Cohesion: 0.27
Nodes (6): call_tool(), handle_query(), 221a7f7 feat: implement redis-based caching layer with memory fallback and introduce initial agent workflows and e2e testing framework, a6b87c1 feat: implement backend API foundation, payment integration, and frontend checkout service, MockDB, setup_mock_db()

### Community 33 - "Community 33"
Cohesion: 0.20
Nodes (6): AI_INSPECTION_DATA, defaultInspection, QualityInspectionModalProps, cropEmojis, LeafletMapProps, Lot

### Community 34 - "Community 34"
Cohesion: 0.40
Nodes (9): listings, lot_listings, lots, orders, payments, price_history, quality_grades, routes (+1 more)

### Community 35 - "Community 35"
Cohesion: 0.22
Nodes (9): CaptureTokenResponse, create_capture_session(), Unified Tier 1 Anti-Fraud Pipeline (Tickets 1.1 - 1.5):     1. Verify signed cap, Ticket 1.1: Generate a short-lived signed capture-session token.     Called when, Verify that the token was signed by us and hasn't expired.     Raises HTTPExcept, UnifiedUploadValidationRequest, UnifiedValidationResult, validate_upload() (+1 more)

### Community 36 - "Community 36"
Cohesion: 0.28
Nodes (8): create_direct_listing(), create_listing(), parse_listing(), Directly insert a structured listing into the database., Directly insert a structured listing into the database., Use Gemini to extract structured fields from the transcript., Use Gemini to extract structured fields from the transcript., Extract structured crop, quantity, and price from voice transcript using OpenRou

### Community 37 - "Community 37"
Cohesion: 0.22
Nodes (9): _call_ors_directions(), compare_individual_vs_consolidated(), optimize_route(), For the demo: Compare individual point-to-point trips vs one consolidated route., For the demo: Compare individual point-to-point trips vs one consolidated route., Helper to call OpenRouteService directions endpoint with snap radius for rural c, Helper to call OpenRouteService directions endpoint with snap radius for rural c, Computes a consolidated multi-pickup delivery route for an order.     Picks up (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.22
Nodes (8): LoginRequest, Resolve the caller's identity, enforcing JWT auth when REQUIRE_AUTH is on., Dependency factory that additionally checks the caller's role.      Roles are, RegisterRequest, require_auth(), require_role(), SendOtpRequest, VerifyOtpRequest

### Community 39 - "Community 39"
Cohesion: 0.32
Nodes (7): get_target_url(), keep_alive_worker(), ping_health_endpoint(), Keep-Alive Background Task for Free Tier Deployments (Render, Fly.io, Railway)., Determine the public health endpoint to ping., Perform a lightweight HTTP GET to /api/health., Continuous async loop pinging the server every PING_INTERVAL_SECONDS.

### Community 40 - "Community 40"
Cohesion: 0.29
Nodes (6): AVATAR_COLORS, BENCHMARK_MANDI, cropEmojis, LotCard(), LotCardProps, useTradeWindow()

### Community 41 - "Community 41"
Cohesion: 0.29
Nodes (4): useFavorites(), BENCHMARK_MANDI, cropEmojis, DynamicPricingCard()

### Community 42 - "Community 42"
Cohesion: 0.36
Nodes (7): calibrate_and_measure_produce(), decode_image(), detect_aruco_marker(), detect_coin_marker(), Detects ArUco marker from DICT_4X4_50 or DICT_6X6_250 dictionary.     Returns pi, Fallback circular marker / standard coin detector using Hough Circles., Measures real-world physical diameter in centimeters and extracts calibrated RGB

### Community 43 - "Community 43"
Cohesion: 0.32
Nodes (7): decode_image_bgr(), decode_image_pil(), image_to_bytes(), Shared image decoding helpers.  Several services (calibration, screen-recapture, Normalise ``bytes`` / data URL / plain base64 into raw image bytes.      Returns, Decode any accepted input to an OpenCV BGR image, or ``None`` on failure., Decode any accepted input to a PIL image, or ``None`` on failure.

### Community 44 - "Community 44"
Cohesion: 0.36
Nodes (7): check_duplicate_image(), compute_phash(), get_pil_image(), hamming_distance(), Computes a 64-bit Discrete Cosine Transform (DCT) based perceptual hash.     Res, Computes the Hamming distance between two hex string hashes., Compares the incoming image pHash against the internal database.     If the mini

### Community 45 - "Community 45"
Cohesion: 0.38
Nodes (6): _env_bool(), is_demo_mode(), Runtime configuration flags for the Kisan Setu backend.  Two independent switche, True when missing infra/credentials should fall back to demo data., True when JWT authentication must be enforced on protected routes., require_auth_enforced()

### Community 46 - "Community 46"
Cohesion: 0.29
Nodes (2): ensure_sample_listing(), Ensure at least one sample listing exists for testing retrieval endpoints.

### Community 47 - "Community 47"
Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 48 - "Community 48"
Cohesion: 0.33
Nodes (6): create_order(), Create a new order for a lot., Create a new order for a lot., Create a new order for a lot., Create a new order for a lot., Create a new order for a lot.

### Community 49 - "Community 49"
Cohesion: 0.33
Nodes (2): CropPhotoProps, MODULE_CACHE

### Community 50 - "Community 50"
Cohesion: 0.40
Nodes (5): BENCHMARK_MANDI, cropEmojis, FarmerListingCard(), FarmerListingCardProps, formatFreshness()

### Community 51 - "Community 51"
Cohesion: 0.33
Nodes (3): fd97ae6 feat: implement e2e bug fixes, pwa enhancements, driver portal, and keep-alive worker, InteractiveHoverButton, InteractiveHoverButtonProps

### Community 52 - "Community 52"
Cohesion: 0.40
Nodes (3): compressImageFile(), CompressionResult, QualityGradeResponse

### Community 53 - "Community 53"
Cohesion: 0.33
Nodes (6): Generate and send a 6-digit OTP to the user's mobile number., Generate and send a 6-digit OTP to the user's mobile number., Generate and send a 6-digit OTP to the user's mobile number., Generate and send a 6-digit OTP to the user's mobile number., Generate and send a 6-digit OTP to the user's mobile number., send_otp()

### Community 56 - "Community 56"
Cohesion: 0.40
Nodes (4): Stage 1: Farmer upload -> Runs Tier 1 AI pipeline -> Generates tentative pregrad, Stage 2: Driver / Agent scans produce on physical arrival.     1. Measures physi, register_pregrade(), verify_physical_pickup()

### Community 57 - "Community 57"
Cohesion: 0.50
Nodes (4): calculate_trust_update(), get_farmer_trust(), Retrieve current trust score and tier policy for a farmer.     Defaults to 70.0, Ticket 2.3: Dynamically updates farmer trust score on physical verification.

### Community 58 - "Community 58"
Cohesion: 0.70
Nodes (4): check_endpoint(), log(), Comprehensive E2E Endpoint Audit Script for KisanSetu., run_all_tests()

### Community 59 - "Community 59"
Cohesion: 0.40
Nodes (3): BaseProps, DIRECTIONS, PATTERN_BACKGROUND_SPEED

### Community 60 - "Community 60"
Cohesion: 0.50
Nodes (4): Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to, Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a, Call Speech-to-Text pipeline (Groq Whisper / Sarvam / Bhashini / Fallback)., transcribe_audio()

### Community 61 - "Community 61"
Cohesion: 0.50
Nodes (4): get_lot(), Get a specific lot by ID with member listings., Get a specific lot by ID with member listings., Get a specific lot by ID with member listings.

### Community 62 - "Community 62"
Cohesion: 0.50
Nodes (4): list_lots(), List available lots with optional filters., List available lots with optional filters and 24-hour freshness time limit., List available lots with optional filters and 24-hour freshness time limit.

### Community 63 - "Community 63"
Cohesion: 0.50
Nodes (4): compare(), Compare individual vs consolidated routing for demo., Compare individual vs consolidated routing for demo., Compare individual vs consolidated routing for demo.

### Community 64 - "Community 64"
Cohesion: 0.50
Nodes (4): optimize(), Optimize delivery route for an order., Optimize delivery route for an order., Optimize delivery route for an order.

### Community 65 - "Community 65"
Cohesion: 0.83
Nodes (3): get_decimal_from_dms(), haversine(), validate()

### Community 66 - "Community 66"
Cohesion: 0.67
Nodes (3): config, decodeJwtPayload(), proxy()

### Community 68 - "Community 68"
Cohesion: 0.50
Nodes (4): Step-by-step verification of the complete marketplace flow:     1. Create farme, Step-by-step verification of the complete marketplace flow:     1. Create farme, Step-by-step verification of the complete marketplace flow:     1. Create farmer, test_full_end_to_end_flow()

### Community 69 - "Community 69"
Cohesion: 0.50
Nodes (4): Test the authentication workflow matching the frontend design:     1. Send OTP, Test the authentication workflow matching the frontend design:     1. Send OTP, Test the authentication workflow matching the frontend design:     1. Send OTP f, test_auth_flow()

### Community 70 - "Community 70"
Cohesion: 0.50
Nodes (1): initial_schema  Revision ID: 001_initial_schema Revises: Create Date: 2026-09-18

### Community 71 - "Community 71"
Cohesion: 0.67
Nodes (3): process_payout(), Process payout to farmers for a fulfilled or picked-up order.     Stage:, Process payout to farmers for a fulfilled or picked-up order.     Stage:

### Community 72 - "Community 72"
Cohesion: 0.67
Nodes (2): get_mandi_prices(), Fetch live or cached Mandi prices from Agmarknet.     Returns standard benchmark

### Community 73 - "Community 73"
Cohesion: 0.67
Nodes (1): FAQ_ITEMS

### Community 75 - "Community 75"
Cohesion: 1.00
Nodes (2): Bug Audit and PWA Conversion Report, Bug Audit, PWA & Free Deployment Design Spec

### Community 76 - "Community 76"
Cohesion: 1.00
Nodes (1): eslintConfig

### Community 77 - "Community 77"
Cohesion: 1.00
Nodes (1): nextConfig

### Community 78 - "Community 78"
Cohesion: 1.00
Nodes (1): config

### Community 79 - "Community 79"
Cohesion: 1.00
Nodes (1): nextConfig

### Community 80 - "Community 80"
Cohesion: 1.00
Nodes (1): config

### Community 81 - "Community 81"
Cohesion: 1.00
Nodes (2): KisanSetu Progress Log, KisanSetu Platform Architecture

### Community 82 - "Community 82"
Cohesion: 1.00
Nodes (1): Next.js App Router Rules

### Community 83 - "Community 83"
Cohesion: 1.00
Nodes (1): Create a new produce listing from a farmer's voice or text message.      Args:

### Community 84 - "Community 84"
Cohesion: 1.00
Nodes (1): Create a new produce listing from a farmer's voice or text message.      Args:

### Community 85 - "Community 85"
Cohesion: 1.00
Nodes (1): Cluster active unstructured listings into aggregated wholesale lots.      Args

### Community 86 - "Community 86"
Cohesion: 1.00
Nodes (1): Grade crop quality (Grade A, B, C) via Computer Vision for a specific lot.

### Community 87 - "Community 87"
Cohesion: 1.00
Nodes (1): Optimize a multi-pickup delivery route for a given order.      Args:

### Community 88 - "Community 88"
Cohesion: 1.00
Nodes (1): Process escrow payout for farmers in a specific stage (pickup or delivery).

### Community 89 - "Community 89"
Cohesion: 1.00
Nodes (1): backend

### Community 90 - "Community 90"
Cohesion: 1.00
Nodes (1): Graphify Knowledge Graph Rules

### Community 91 - "Community 91"
Cohesion: 1.00
Nodes (1): KisanSetu Design System Specification

### Community 92 - "Community 92"
Cohesion: 1.00
Nodes (1): Person C Completion Report & Roadmap

### Community 93 - "Community 93"
Cohesion: 1.00
Nodes (1): Fallback: create a single-listing lot when aggregation clustering can't form a g

## Knowledge Gaps
- **333 isolated node(s):** `Cluster active listings of the same crop into lots with transaction-level adviso`, `Call Speech-to-Text pipeline (Groq Whisper / Sarvam / Bhashini / Fallback).`, `Extract structured crop, quantity, and price from voice transcript using OpenRou`, `Directly insert a structured listing into the database.`, `Dynamically get or initialize Google GenAI Client with active environment key.` (+328 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 15`** (2 nodes): `ApiService`, `delay()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (2 nodes): `ensure_sample_listing()`, `Ensure at least one sample listing exists for testing retrieval endpoints.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (2 nodes): `CropPhotoProps`, `MODULE_CACHE`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (1 nodes): `initial_schema  Revision ID: 001_initial_schema Revises: Create Date: 2026-09-18`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (2 nodes): `get_mandi_prices()`, `Fetch live or cached Mandi prices from Agmarknet.     Returns standard benchmark`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (1 nodes): `FAQ_ITEMS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (2 nodes): `Bug Audit and PWA Conversion Report`, `Bug Audit, PWA & Free Deployment Design Spec`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (1 nodes): `eslintConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (1 nodes): `nextConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (1 nodes): `nextConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (2 nodes): `KisanSetu Progress Log`, `KisanSetu Platform Architecture`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (1 nodes): `Next.js App Router Rules`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (1 nodes): `Create a new produce listing from a farmer's voice or text message.      Args:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (1 nodes): `Create a new produce listing from a farmer's voice or text message.      Args:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (1 nodes): `Cluster active unstructured listings into aggregated wholesale lots.      Args`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (1 nodes): `Grade crop quality (Grade A, B, C) via Computer Vision for a specific lot.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (1 nodes): `Optimize a multi-pickup delivery route for a given order.      Args:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (1 nodes): `Process escrow payout for farmers in a specific stage (pickup or delivery).`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 89`** (1 nodes): `backend`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (1 nodes): `Graphify Knowledge Graph Rules`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (1 nodes): `KisanSetu Design System Specification`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (1 nodes): `Person C Completion Report & Roadmap`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (1 nodes): `Fallback: create a single-listing lot when aggregation clustering can't form a g`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiService` connect `Community 15` to `Community 23`, `Community 12`, `Community 5`, `Community 10`, `Community 52`, `Community 41`, `Community 4`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `Cluster active listings of the same crop into lots with transaction-level adviso`, `Call Speech-to-Text pipeline (Groq Whisper / Sarvam / Bhashini / Fallback).`, `Extract structured crop, quantity, and price from voice transcript using OpenRou` to the rest of the system?**
  _333 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08350168350168351 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08235294117647059 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.08172043010752689 - nodes in this community are weakly interconnected._