# Graph Report - .  (2026-09-09)

## Corpus Check
- 119 files · ~96,756 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 459 nodes · 1044 edges · 35 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: MODIFIES: 325 · contains: 230 · imports: 121 · imports_from: 109 · rationale_for: 68 · ON_BRANCH: 59 · calls: 44 · PARENT_OF: 36 · method: 29 · inherits: 14 · references: 9


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 119 · Candidates: 133
- Excluded: 4 untracked · 27604 ignored · 1 sensitive · 1 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `c4bbc0f`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `Button()` - 30 edges
2. `ApiService` - 20 edges
3. `useLanguage()` - 17 edges
4. `Badge()` - 15 edges
5. `Card()` - 14 edges
6. `is_redis_available()` - 10 edges
7. `delay()` - 9 edges
8. `get_db()` - 8 edges
9. `call_tool()` - 7 edges
10. `MockCursor` - 7 edges

## Surprising Connections (you probably didn't know these)
- `OrderCreate` --inherits--> `BaseModel`  [EXTRACTED]
  backend/main.py →   _Bridges community 22 → community 6_
- `0524d79 Add Kisan Setu project` --PARENT_OF--> `9fb29c4 Merge Kisan Setu repository with backend project`  [EXTRACTED]
  git → git  _Bridges community 0 → community 10_
- `149a4a1 Initial commit` --PARENT_OF--> `f83feb3 Initial commit: prototype frontend.`  [EXTRACTED]
  git → git  _Bridges community 0 → community 7_
- `199d00a Add Kisan Setu project` --PARENT_OF--> `b95dd39 Merge backend project into KisanSetu`  [EXTRACTED]
  git → git  _Bridges community 0 → community 9_
- `1bb7010 feat: KisanSetu v1.0 - Next-gen Agri-tech platform outperforming DeHaat & Ninjacart, full PWA, auto-deploy config` --PARENT_OF--> `7122065 fix: resolve extension hydration mismatch and harden backend API endpoints with offline fallbacks`  [EXTRACTED]
  git → git  _Bridges community 9 → community 4_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (55): delete_cache(), delete_otp(), get_cache(), get_chat_history(), get_otp(), is_redis_available(), Retrieve recent multi-turn chat history for a user., Save chat history for a user with default 1-hour expiration. (+47 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (8): 55c011d Update site navigation and design enhancements, 7435c94 feat: implement core logistics and order management dashboard with AI-driven route optimization and real-time monitoring, Role, Step, BadgeProps, Button(), ButtonProps, CardProps

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (6): 9f0b33d Refactor: reorganize into clean monorepo (backend, ai, database, tests, docs) and fix import paths, f23d914 Merge pull request #1 from Mohankanakam06/dev, BeforeInstallPromptEvent, Event, PRECACHE_ASSETS, OrchestratorQueryRequest

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (14): get_conn(), get_db(), get_pool(), MockConnection, MockCursor, Retrieve a connection from the pool., Return a connection back to the pool., Context manager for safe database connections and transactions. (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (3): # NOTE: If keys are placeholders, the order creation will fail gracefully., 7122065 fix: resolve extension hydration mismatch and harden backend API endpoints with offline fallbacks, c4bbc0f fix: ensure complete fallback for routing and quality endpoints

### Community 5 - "Community 5"
Cohesion: 0.20
Nodes (6): COOKIE_CATEGORIES, LEGAL_LINKS, LegalLayoutProps, LegalList(), LegalParagraph(), LegalSection()

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (15): CreateOrderRequest, VerifyPaymentRequest, BaseModel, LoginRequest, password_login(), Verify email/password and issue JWT session token (Demo Setup)., Generate and send a 6-digit OTP to the user's mobile number., Generate and send a 6-digit OTP to the user's mobile number. (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (9): f83feb3 Initial commit: prototype frontend., cropEmojis, LeafletMapProps, eslintConfig, LeafletMap, config, CreateListingRequest, CropType (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (16): CreateOrderRequest, Listing, ListingStatus, LotListingItem, LotStatus, OptimizeRouteRequest, OrderStatus, PaymentStatus (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.17
Nodes (4): 1bb7010 feat: KisanSetu v1.0 - Next-gen Agri-tech platform outperforming DeHaat & Ninjacart, full PWA, auto-deploy config, b95dd39 Merge backend project into KisanSetu, ACCENTS, StatusPageProps

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (8): LotDetailModalProps, CROPS, GRADES, LeafletMap, 9fb29c4 Merge Kisan Setu repository with backend project, c27cac1 feat: initialize frontend application structure with buyer, farmer, and orders modules and implement primary buyer marketplace interface, cropEmojis, Lot

### Community 11 - "Community 11"
Cohesion: 0.15
Nodes (7): Language, LanguageContext, LanguageContextType, useLanguage(), AuthMethod, LoginState, Role

### Community 12 - "Community 12"
Cohesion: 0.19
Nodes (14): call_tool(), cluster_active_lots(), create_farmer_listing(), grade_lot_quality(), handle_query(), optimize_delivery_route(), process_stage_payout(), Create a new produce listing from a farmer's voice or text message.      Args: (+6 more)

### Community 13 - "Community 13"
Cohesion: 0.19
Nodes (5): commonReasons, STATES, Badge(), Card(), cn()

### Community 14 - "Community 14"
Cohesion: 0.21
Nodes (8): LeafletMap, statusPillColor, initialLots, initialOrders, OptimizeRouteResponse, Order, QualityGradeResponse, SettlementPayoutResponse

### Community 15 - "Community 15"
Cohesion: 0.17
Nodes (6): CropPhotoProps, MODULE_CACHE, AVATAR_COLORS, BENCHMARK_MANDI, cropEmojis, LotCardProps

### Community 16 - "Community 16"
Cohesion: 0.27
Nodes (2): ApiService, delay()

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (5): footerLinks, inter, metadata, plusJakartaSans, LanguageProvider()

### Community 18 - "Community 18"
Cohesion: 0.18
Nodes (11): get_current_user(), _normalize_user(), Register a new user (Farmer or Buyer)., Register a new user (Farmer or Buyer)., Get current logged-in user details from JWT token., Get current logged-in user details from JWT token., Tolerate minimal/mock DB rows that may lack name/phone/role/language_pref keys., Verify 6-digit OTP and issue JWT session token. (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.18
Nodes (3): get_mock_conn(), MockConnection, MockCursor

### Community 20 - "Community 20"
Cohesion: 0.20
Nodes (10): _call_ors_directions(), compare_individual_vs_consolidated(), optimize_route(), For the demo: Compare individual point-to-point trips vs one consolidated route., For the demo: Compare individual point-to-point trips vs one consolidated route., For the demo: Compare individual point-to-point trips vs one consolidated route., Helper to call OpenRouteService directions endpoint with snap radius for rural c, Helper to call OpenRouteService directions endpoint with snap radius for rural c (+2 more)

### Community 21 - "Community 21"
Cohesion: 0.40
Nodes (9): listings, lot_listings, lots, orders, payments, price_history, quality_grades, routes (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.22
Nodes (4): create_order(), OrderCreate, Create a new order for a lot., Create a new order for a lot.

### Community 23 - "Community 23"
Cohesion: 0.32
Nodes (7): create_direct_listing(), create_listing(), parse_listing(), Directly insert a structured listing into the database., Use Gemini to extract structured fields from the transcript., Use Gemini to extract structured fields from the transcript., Use Gemini to extract structured fields from the transcript.

### Community 24 - "Community 24"
Cohesion: 0.25
Nodes (6): get_lot(), list_lots(), List available lots with optional filters., List available lots with optional filters., Get a specific lot by ID with member listings., Get a specific lot by ID with member listings.

### Community 25 - "Community 25"
Cohesion: 0.50
Nodes (4): Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to, Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a, Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a, transcribe_audio()

### Community 26 - "Community 26"
Cohesion: 0.50
Nodes (4): compare(), Compare individual vs consolidated routing for demo., Compare individual vs consolidated routing for demo., Compare individual vs consolidated routing for demo.

### Community 27 - "Community 27"
Cohesion: 0.50
Nodes (4): optimize(), Optimize delivery route for an order., Optimize delivery route for an order., Optimize delivery route for an order.

### Community 28 - "Community 28"
Cohesion: 0.50
Nodes (3): payout(), PayoutRequest, Process payout for an order at pickup or delivery stage.

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (3): Cluster active listings of the same crop into lots., Cluster active listings of the same crop into lots with transaction-level adviso, run_aggregation()

### Community 30 - "Community 30"
Cohesion: 0.67
Nodes (3): process_payout(), Process payout to farmers for a fulfilled or picked-up order.     Stage:       -, Process payout to farmers for a fulfilled or picked-up order.     Stage:       -

### Community 31 - "Community 31"
Cohesion: 1.00
Nodes (2): jitter(), seed()

### Community 32 - "Community 32"
Cohesion: 0.67
Nodes (1): QualityGradeRequest

### Community 33 - "Community 33"
Cohesion: 0.67
Nodes (1): FAQ_ITEMS

### Community 34 - "Community 34"
Cohesion: 1.00
Nodes (1): backend

## Knowledge Gaps
- **129 isolated node(s):** `Cluster active listings of the same crop into lots with transaction-level adviso`, `Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a`, `Use Gemini to extract structured fields from the transcript.`, `Directly insert a structured listing into the database.`, `Create a new produce listing from a farmer's voice or text message.      Args:` (+124 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 16`** (2 nodes): `ApiService`, `delay()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `jitter()`, `seed()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `QualityGradeRequest`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `FAQ_ITEMS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `backend`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiService` connect `Community 16` to `Community 10`, `Community 11`, `Community 7`, `Community 14`, `Community 13`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `MockCursor` connect `Community 3` to `Community 4`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `MockCursor` connect `Community 19` to `Community 0`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `Cluster active listings of the same crop into lots with transaction-level adviso`, `Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a`, `Use Gemini to extract structured fields from the transcript.` to the rest of the system?**
  _129 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05547785547785548 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.12315270935960591 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.13043478260869565 - nodes in this community are weakly interconnected._