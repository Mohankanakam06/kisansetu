# Graph Report - .  (2026-09-09)

## Corpus Check
- 123 files · ~1,01,636 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 484 nodes · 1111 edges · 33 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: MODIFIES: 354 · contains: 240 · imports: 127 · imports_from: 116 · rationale_for: 78 · ON_BRANCH: 60 · calls: 47 · PARENT_OF: 37 · method: 29 · inherits: 14 · references: 9


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 123 · Candidates: 137
- Excluded: 0 untracked · 27720 ignored · 1 sensitive · 1 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `1ef1257`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `Button()` - 32 edges
2. `ApiService` - 20 edges
3. `useLanguage()` - 19 edges
4. `Badge()` - 15 edges
5. `Card()` - 15 edges
6. `is_redis_available()` - 10 edges
7. `delay()` - 9 edges
8. `get_db()` - 8 edges
9. `Lot` - 8 edges
10. `call_tool()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `0524d79 Add Kisan Setu project` --PARENT_OF--> `9fb29c4 Merge Kisan Setu repository with backend project`  [EXTRACTED]
  git → git  _Bridges community 0 → community 1_
- `149a4a1 Initial commit` --PARENT_OF--> `f83feb3 Initial commit: prototype frontend.`  [EXTRACTED]
  git → git  _Bridges community 0 → community 15_
- `1bb7010 feat: KisanSetu v1.0 - Next-gen Agri-tech platform outperforming DeHaat & Ninjacart, full PWA, auto-deploy config` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 6 → community 0_
- `1bb7010 feat: KisanSetu v1.0 - Next-gen Agri-tech platform outperforming DeHaat & Ninjacart, full PWA, auto-deploy config` --PARENT_OF--> `7122065 fix: resolve extension hydration mismatch and harden backend API endpoints with offline fallbacks`  [EXTRACTED]
  git → git  _Bridges community 6 → community 4_
- `1ef1257 feat: KisanSetu v1.0 - Next-gen Agri-tech platform enhancements and escrow settlement features` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 4 → community 0_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (32): data-logistics, dev, main, 033b08c fix(cors): support wildcard and vercel subdomains in CORS middleware, 0524d79 Add Kisan Setu project, 133c3ae Merge branch 'dev', 149a4a1 Initial commit, 16cd71b feat(security): implement server-side api proxy for secure env variables (+24 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (14): 4dd9e28 feat: implement initial landing page and project structure with farmer and buyer navigation flow, 6b42c2c feat: add reusable Badge, Button, and Card UI components with tailwind utility helper, 7435c94 feat: implement core logistics and order management dashboard with AI-driven route optimization and real-time monitoring, 9fb29c4 Merge Kisan Setu repository with backend project, c27cac1 feat: initialize frontend application structure with buyer, farmer, and orders modules and implement primary buyer marketplace interface, commonReasons, STATES, Badge() (+6 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (30): get_current_user(), hash_password(), LoginRequest, _normalize_user(), password_login(), Verify 6-digit OTP and issue JWT session token., Register a new user (Farmer or Buyer)., Verify email/password and issue JWT session token (Demo Setup). (+22 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (24): LeafletMap, statusPillColor, initialLots, initialOrders, CreateOrderRequest, Listing, ListingStatus, LotListingItem (+16 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (5): # NOTE: If keys are placeholders, the order creation will fail gracefully., 1ef1257 feat: KisanSetu v1.0 - Next-gen Agri-tech platform enhancements and escrow settlement features, 7122065 fix: resolve extension hydration mismatch and harden backend API endpoints with offline fallbacks, c4bbc0f fix: ensure complete fallback for routing and quality endpoints, QualityGradeRequest

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (14): get_conn(), get_db(), get_pool(), MockConnection, MockCursor, Retrieve a connection from the pool., Return a connection back to the pool., Context manager for safe database connections and transactions. (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (9): 1bb7010 feat: KisanSetu v1.0 - Next-gen Agri-tech platform outperforming DeHaat & Ninjacart, full PWA, auto-deploy config, Language, LanguageContext, LanguageContextType, useLanguage(), AuthMethod, LoginState, Role (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (6): 9f0b33d Refactor: reorganize into clean monorepo (backend, ai, database, tests, docs) and fix import paths, 9f2f3c1 feat: implement service worker for PWA support and add site navigation and authentication pages, f23d914 Merge pull request #1 from Mohankanakam06/dev, jitter(), seed(), PRECACHE_ASSETS

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (11): get_mock_conn(), MockConnection, MockCursor, MockDB, Step-by-step verification of the complete marketplace flow:     1. Create farme, Step-by-step verification of the complete marketplace flow:     1. Create farme, Test the authentication workflow matching the frontend design:     1. Send OTP, Test the authentication workflow matching the frontend design:     1. Send OTP (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.20
Nodes (6): COOKIE_CATEGORIES, LEGAL_LINKS, LegalLayoutProps, LegalList(), LegalParagraph(), LegalSection()

### Community 10 - "Community 10"
Cohesion: 0.16
Nodes (17): delete_cache(), delete_otp(), get_cache(), get_chat_history(), get_otp(), is_redis_available(), Retrieve recent multi-turn chat history for a user., Save chat history for a user with default 1-hour expiration. (+9 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (7): footerLinks, inter, metadata, plusJakartaSans, BeforeInstallPromptEvent, Event, LanguageProvider()

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (11): OrderCreate, CreateOrderRequest, VerifyPaymentRequest, BaseModel, FarmerListingRequest, LocationModel, OrchestratorQueryRequest, OptimizeRequest (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.19
Nodes (14): call_tool(), cluster_active_lots(), create_farmer_listing(), grade_lot_quality(), handle_query(), optimize_delivery_route(), process_stage_payout(), Create a new produce listing from a farmer's voice or text message.      Args: (+6 more)

### Community 14 - "Community 14"
Cohesion: 0.15
Nodes (8): LotDetailModalProps, CROPS, GRADES, LeafletMap, AI_INSPECTION_DATA, defaultInspection, QualityInspectionModalProps, Lot

### Community 15 - "Community 15"
Cohesion: 0.21
Nodes (8): 55c011d Update site navigation and design enhancements, f83feb3 Initial commit: prototype frontend., cropEmojis, LeafletMapProps, LeafletMap, CreateListingRequest, CropType, GeoLocation

### Community 16 - "Community 16"
Cohesion: 0.17
Nodes (6): CropPhotoProps, MODULE_CACHE, AVATAR_COLORS, BENCHMARK_MANDI, cropEmojis, LotCardProps

### Community 17 - "Community 17"
Cohesion: 0.27
Nodes (2): ApiService, delay()

### Community 18 - "Community 18"
Cohesion: 0.20
Nodes (10): _call_ors_directions(), compare_individual_vs_consolidated(), optimize_route(), For the demo: Compare individual point-to-point trips vs one consolidated route., For the demo: Compare individual point-to-point trips vs one consolidated route., For the demo: Compare individual point-to-point trips vs one consolidated route., Helper to call OpenRouteService directions endpoint with snap radius for rural c, Helper to call OpenRouteService directions endpoint with snap radius for rural c (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.20
Nodes (5): create_order(), Create a new order for a lot., Create a new order for a lot., 221a7f7 feat: implement redis-based caching layer with memory fallback and introduce initial agent workflows and e2e testing framework, a6b87c1 feat: implement backend API foundation, payment integration, and frontend checkout service

### Community 20 - "Community 20"
Cohesion: 0.40
Nodes (9): listings, lot_listings, lots, orders, payments, price_history, quality_grades, routes (+1 more)

### Community 21 - "Community 21"
Cohesion: 0.32
Nodes (7): create_direct_listing(), create_listing(), parse_listing(), Directly insert a structured listing into the database., Use Gemini to extract structured fields from the transcript., Use Gemini to extract structured fields from the transcript., Use Gemini to extract structured fields from the transcript.

### Community 22 - "Community 22"
Cohesion: 0.50
Nodes (4): Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to, Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a, Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a, transcribe_audio()

### Community 23 - "Community 23"
Cohesion: 0.50
Nodes (2): Role, Step

### Community 24 - "Community 24"
Cohesion: 0.50
Nodes (4): compare(), Compare individual vs consolidated routing for demo., Compare individual vs consolidated routing for demo., Compare individual vs consolidated routing for demo.

### Community 25 - "Community 25"
Cohesion: 0.50
Nodes (4): optimize(), Optimize delivery route for an order., Optimize delivery route for an order., Optimize delivery route for an order.

### Community 26 - "Community 26"
Cohesion: 0.67
Nodes (3): Cluster active listings of the same crop into lots., Cluster active listings of the same crop into lots with transaction-level adviso, run_aggregation()

### Community 27 - "Community 27"
Cohesion: 0.67
Nodes (3): process_payout(), Process payout to farmers for a fulfilled or picked-up order.     Stage:       -, Process payout to farmers for a fulfilled or picked-up order.     Stage:       -

### Community 28 - "Community 28"
Cohesion: 0.67
Nodes (3): get_lot(), Get a specific lot by ID with member listings., Get a specific lot by ID with member listings.

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (3): list_lots(), List available lots with optional filters., List available lots with optional filters.

### Community 30 - "Community 30"
Cohesion: 0.67
Nodes (1): config

### Community 31 - "Community 31"
Cohesion: 0.67
Nodes (1): FAQ_ITEMS

### Community 32 - "Community 32"
Cohesion: 1.00
Nodes (1): backend

## Knowledge Gaps
- **143 isolated node(s):** `Cluster active listings of the same crop into lots with transaction-level adviso`, `Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a`, `Use Gemini to extract structured fields from the transcript.`, `Directly insert a structured listing into the database.`, `Create a new produce listing from a farmer's voice or text message.      Args:` (+138 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 17`** (2 nodes): `ApiService`, `delay()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `Role`, `Step`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `FAQ_ITEMS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `backend`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiService` connect `Community 17` to `Community 14`, `Community 6`, `Community 1`, `Community 15`, `Community 3`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `MockCursor` connect `Community 5` to `Community 4`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `Cluster active listings of the same crop into lots with transaction-level adviso`, `Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a`, `Use Gemini to extract structured fields from the transcript.` to the rest of the system?**
  _143 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06464646464646465 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11498257839721254 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07741935483870968 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09885057471264368 - nodes in this community are weakly interconnected._