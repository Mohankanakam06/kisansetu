# Graph Report - .  (2026-09-16)

## Corpus Check
- 157 files · ~3,72,561 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 495 nodes · 750 edges · 50 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: contains: 272 · imports: 152 · imports_from: 127 · rationale_for: 73 · calls: 65 · method: 36 · inherits: 14 · references: 11


## Input Scope
- Requested: auto
- Resolved: all (source: default-auto)
- Included files: 157 · Candidates: recursive
- Excluded: 0 untracked · 0 ignored · 1 sensitive · 0 missing committed
## God Nodes (most connected - your core abstractions)
1. `Button()` - 34 edges
2. `useLanguage()` - 21 edges
3. `ApiService` - 21 edges
4. `Badge()` - 20 edges
5. `Card()` - 19 edges
6. `cn()` - 13 edges
7. `is_redis_available()` - 10 edges
8. `delay()` - 9 edges
9. `Lot` - 8 edges
10. `call_tool()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Bug Audit, PWA & Free Deployment Design Spec` --references--> `Bug Audit and PWA Conversion Report`  [EXTRACTED]
  frontend/docs/superpowers/specs/2026-09-07-bug-audit-pwa-and-free-deployment-design.md → frontend/docs/BUG_AUDIT.md
- `KisanSetu Progress Log` --references--> `KisanSetu Platform Architecture`  [EXTRACTED]
  frontend/docs/PROGRESS_LOG.md → frontend/README.md

## Hyperedges (group relationships)
- **KisanSetu Agricultural Supply Chain and Monetization Pipeline** — home_four_pillars_workflow, list_crop_wizard_page, logistics_orders_page, earnings_settlement_page, marketplace_browse_page [INFERRED 0.88]
- **AI Quality Grading and Trust Assurance System** — list_crop_ai_quality_step, lot_detail_quality_report, lot_detail_refined_verification_log [INFERRED 0.90]
- **Multi-Farmer Crop Aggregation and Logistics Dispatch** — logistics_consolidated_orders, lot_detail_contributing_farmers, earnings_active_listings_table [INFERRED 0.85]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (20): commonReasons, AuthMethod, LoginState, Role, Role, Step, CROP_BENCHMARKS, CropBenchmark (+12 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (19): barlow, footerLinks, inter, metadata, plusJakartaSans, zillaSlab, BeforeInstallPromptEvent, Event (+11 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (16): create_order(), OrderCreate, Create a new order for a lot., Create a new order for a lot., Create a new order for a lot., get_mock_conn(), MockConnection, MockCursor (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (17): delete_cache(), delete_otp(), get_cache(), get_chat_history(), get_otp(), is_redis_available(), Retrieve recent multi-turn chat history for a user., Save chat history for a user with default 1-hour expiration. (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.20
Nodes (6): COOKIE_CATEGORIES, LEGAL_LINKS, LegalLayoutProps, LegalList(), LegalParagraph(), LegalSection()

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (13): LeafletMap, statusPillBadge, statusPillColor, initialLots, initialOrders, CreateOrderRequest, Listing, OptimizeRouteResponse (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (14): CreateListingRequest, CropType, ListingStatus, LotListingItem, LotStatus, OptimizeRouteRequest, OrderStatus, PaymentStatus (+6 more)

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (8): broadcast_apmc_ticker(), ConnectionManager, Anonymous endpoint just for APMC Market Ticker., Personalized endpoint for farmers/buyers to get order and pool updates., Thread-safe and sync-friendly helper to emit websocket events., start_ticker_task(), websocket_ticker_endpoint(), websocket_user_endpoint()

### Community 8 - "Community 8"
Cohesion: 0.21
Nodes (13): call_tool(), cluster_active_lots(), create_farmer_listing(), grade_lot_quality(), handle_query(), optimize_delivery_route(), process_stage_payout(), Create a new produce listing from a farmer's voice or text message.      Args: (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (8): CropPhotoProps, MODULE_CACHE, AVATAR_COLORS, BENCHMARK_MANDI, cropEmojis, LotCard(), LotCardProps, useTradeWindow()

### Community 10 - "Community 10"
Cohesion: 0.26
Nodes (2): ApiService, delay()

### Community 12 - "Community 12"
Cohesion: 0.17
Nodes (2): ACCENTS, StatusPageProps

### Community 13 - "Community 13"
Cohesion: 0.20
Nodes (8): get_conn(), get_db(), get_pool(), MockConnection, Retrieve a connection from the pool., Context manager for safe database connections and transactions., Retrieve a connection from the pool, with MockDB fallback., Context manager for safe database connections and transactions.

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (6): LotDetailModalProps, AI_INSPECTION_DATA, defaultInspection, QualityInspectionModalProps, cropEmojis, Lot

### Community 15 - "Community 15"
Cohesion: 0.20
Nodes (8): BENCHMARK_MANDI, CROP_EMOJIS, CROPS, GRADES, LeafletMap, TickerItem, useRoleGuard(), useWebSocket()

### Community 16 - "Community 16"
Cohesion: 0.24
Nodes (9): create_direct_listing(), create_listing(), parse_listing(), Directly insert a structured listing into the database., Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to, Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a, Use Gemini to extract structured fields from the transcript., Use Gemini to extract structured fields from the transcript. (+1 more)

### Community 17 - "Community 17"
Cohesion: 0.24
Nodes (9): _call_ors_directions(), compare_individual_vs_consolidated(), optimize_route(), For the demo: Compare individual point-to-point trips vs one consolidated route., For the demo: Compare individual point-to-point trips vs one consolidated route., Helper to call OpenRouteService directions endpoint with snap radius for rural c, Helper to call OpenRouteService directions endpoint with snap radius for rural c, Computes a consolidated multi-pickup delivery route for an order.     Picks up (+1 more)

### Community 18 - "Community 18"
Cohesion: 0.40
Nodes (9): listings, lot_listings, lots, orders, payments, price_history, quality_grades, routes (+1 more)

### Community 19 - "Community 19"
Cohesion: 0.28
Nodes (7): CropLine, FarmerPage(), LeafletMap, makeEmptyQualityState(), PreviewType, QualityState, useOfflineQueue()

### Community 20 - "Community 20"
Cohesion: 0.25
Nodes (6): get_lot(), list_lots(), List available lots with optional filters., List available lots with optional filters and 24-hour freshness time limit., Get a specific lot by ID with member listings., Get a specific lot by ID with member listings.

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (7): compare(), optimize(), OptimizeRequest, Optimize delivery route for an order., Optimize delivery route for an order., Compare individual vs consolidated routing for demo., Compare individual vs consolidated routing for demo.

### Community 22 - "Community 22"
Cohesion: 0.29
Nodes (7): _normalize_user(), Verify 6-digit OTP and issue JWT session token., Tolerate minimal/mock DB rows that may lack name/phone/role/language_pref keys., Verify 6-digit OTP and issue JWT session token., Tolerate minimal/mock DB rows that may lack name/phone/role/language_pref keys., Verify 6-digit OTP and issue JWT session token., verify_otp()

### Community 23 - "Community 23"
Cohesion: 0.33
Nodes (1): MockCursor

### Community 24 - "Community 24"
Cohesion: 0.33
Nodes (3): CreateOrderRequest, # NOTE: If keys are placeholders, the order creation will fail gracefully., VerifyPaymentRequest

### Community 25 - "Community 25"
Cohesion: 0.53
Nodes (5): BaseModel, LoginRequest, RegisterRequest, SendOtpRequest, VerifyOtpRequest

### Community 26 - "Community 26"
Cohesion: 0.33
Nodes (6): hash_password(), Register a new user (Farmer or Buyer)., Register a new user (Farmer or Buyer)., Hash password using PBKDF2-HMAC-SHA256 with a random salt., Register a new user (Farmer or Buyer) with optional Email & Password credentials, register_user()

### Community 27 - "Community 27"
Cohesion: 0.40
Nodes (5): _create_single_listing_lot(), farmer_listing(), FarmerListingRequest, LocationModel, Fallback: create a single-listing lot when aggregation clustering can't form a g

### Community 28 - "Community 28"
Cohesion: 0.40
Nodes (3): cropEmojis, LeafletMapProps, GeoLocation

### Community 29 - "Community 29"
Cohesion: 0.50
Nodes (3): Cluster active listings of the same crop into lots., Cluster active listings of the same crop into lots with transaction-level adviso, run_aggregation()

### Community 30 - "Community 30"
Cohesion: 0.50
Nodes (3): process_payout(), Process payout to farmers for a fulfilled or picked-up order.     Stage:, Process payout to farmers for a fulfilled or picked-up order.     Stage:

### Community 31 - "Community 31"
Cohesion: 0.50
Nodes (4): get_current_user(), Get current logged-in user details from JWT token., Get current logged-in user details from JWT token., Get current logged-in user details from JWT token.

### Community 32 - "Community 32"
Cohesion: 0.50
Nodes (4): password_login(), Verify email/password and issue JWT session token., Verify password against stored salt$hash or legacy plain string., verify_password()

### Community 33 - "Community 33"
Cohesion: 0.50
Nodes (4): Generate and send a 6-digit OTP to the user's mobile number., Generate and send a 6-digit OTP to the user's mobile number., Generate and send a 6-digit OTP to the user's mobile number., send_otp()

### Community 34 - "Community 34"
Cohesion: 0.50
Nodes (3): payout(), PayoutRequest, Process payout for an order at pickup or delivery stage.

### Community 35 - "Community 35"
Cohesion: 0.67
Nodes (3): config, decodeJwtPayload(), middleware()

### Community 36 - "Community 36"
Cohesion: 0.67
Nodes (3): Return a connection back to the pool., Return a connection to the pool or close mock., release_conn()

### Community 37 - "Community 37"
Cohesion: 1.00
Nodes (2): jitter(), seed()

### Community 38 - "Community 38"
Cohesion: 0.67
Nodes (1): OrchestratorQueryRequest

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (1): QualityGradeRequest

### Community 40 - "Community 40"
Cohesion: 0.67
Nodes (1): FAQ_ITEMS

### Community 42 - "Community 42"
Cohesion: 1.00
Nodes (2): Bug Audit and PWA Conversion Report, Bug Audit, PWA & Free Deployment Design Spec

### Community 44 - "Community 44"
Cohesion: 1.00
Nodes (1): eslintConfig

### Community 46 - "Community 46"
Cohesion: 1.00
Nodes (1): nextConfig

### Community 47 - "Community 47"
Cohesion: 1.00
Nodes (1): config

### Community 48 - "Community 48"
Cohesion: 1.00
Nodes (2): KisanSetu Progress Log, KisanSetu Platform Architecture

### Community 49 - "Community 49"
Cohesion: 1.00
Nodes (1): PRECACHE_ASSETS

### Community 52 - "Community 52"
Cohesion: 1.00
Nodes (1): Next.js App Router Rules

### Community 55 - "Community 55"
Cohesion: 1.00
Nodes (1): Graphify Knowledge Graph Rules

### Community 57 - "Community 57"
Cohesion: 1.00
Nodes (1): KisanSetu Design System Specification

### Community 59 - "Community 59"
Cohesion: 1.00
Nodes (1): Person C Completion Report & Roadmap

## Knowledge Gaps
- **163 isolated node(s):** `Cluster active listings of the same crop into lots with transaction-level adviso`, `Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a`, `Use Gemini to extract structured fields from the transcript.`, `Directly insert a structured listing into the database.`, `Create a new produce listing from a farmer's voice or text message.      Args:` (+158 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 10`** (2 nodes): `ApiService`, `delay()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (2 nodes): `ACCENTS`, `StatusPageProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `MockCursor`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (2 nodes): `jitter()`, `seed()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `OrchestratorQueryRequest`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `QualityGradeRequest`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `FAQ_ITEMS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (2 nodes): `Bug Audit and PWA Conversion Report`, `Bug Audit, PWA & Free Deployment Design Spec`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `eslintConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `nextConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (2 nodes): `KisanSetu Progress Log`, `KisanSetu Platform Architecture`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `PRECACHE_ASSETS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (1 nodes): `Next.js App Router Rules`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `Graphify Knowledge Graph Rules`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (1 nodes): `KisanSetu Design System Specification`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (1 nodes): `Person C Completion Report & Roadmap`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Button()` connect `Community 0` to `Community 9`, `Community 14`, `Community 15`, `Community 1`, `Community 4`, `Community 6`, `Community 19`, `Community 5`, `Community 12`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `ApiService` connect `Community 10` to `Community 15`, `Community 0`, `Community 6`, `Community 19`, `Community 5`, `Community 14`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `OptimizeRequest` connect `Community 21` to `Community 25`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `Cluster active listings of the same crop into lots with transaction-level adviso`, `Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a`, `Use Gemini to extract structured fields from the transcript.` to the rest of the system?**
  _163 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05454545454545454 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07130124777183601 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0659536541889483 - nodes in this community are weakly interconnected._