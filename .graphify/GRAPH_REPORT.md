# Graph Report - .  (2026-09-08)

## Corpus Check
- 114 files · ~90,901 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 387 nodes · 877 edges · 28 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: MODIFIES: 284 · contains: 207 · imports: 104 · imports_from: 90 · ON_BRANCH: 56 · PARENT_OF: 33 · rationale_for: 32 · calls: 31 · method: 20 · inherits: 11 · references: 9


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 114 · Candidates: 127
- Excluded: 2 untracked · 27461 ignored · 1 sensitive · 1 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `a6b87c1`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `Button()` - 30 edges
2. `ApiService` - 20 edges
3. `Badge()` - 15 edges
4. `Card()` - 14 edges
5. `is_redis_available()` - 10 edges
6. `delay()` - 9 edges
7. `Lot` - 7 edges
8. `LegalSection()` - 6 edges
9. `LegalParagraph()` - 6 edges
10. `cn()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `OrderCreate` --inherits--> `BaseModel`  [EXTRACTED]
  backend/main.py →   _Bridges community 1 → community 2_
- `0524d79 Add Kisan Setu project` --PARENT_OF--> `9fb29c4 Merge Kisan Setu repository with backend project`  [EXTRACTED]
  git → git  _Bridges community 0 → community 12_
- `149a4a1 Initial commit` --PARENT_OF--> `f83feb3 Initial commit: prototype frontend.`  [EXTRACTED]
  git → git  _Bridges community 0 → community 10_
- `199d00a Add Kisan Setu project` --PARENT_OF--> `b95dd39 Merge backend project into KisanSetu`  [EXTRACTED]
  git → git  _Bridges community 0 → community 6_
- `221a7f7 feat: implement redis-based caching layer with memory fallback and introduce initial agent workflows and e2e testing framework` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 14 → community 0_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (37): _call_ors_directions(), compare_individual_vs_consolidated(), optimize_route(), For the demo: Compare individual point-to-point trips vs one consolidated route., Helper to call OpenRouteService directions endpoint with snap radius for rural c, Computes a consolidated multi-pickup delivery route for an order.     Picks up, data-logistics, dev (+29 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (6): create_order(), OrderCreate, Create a new order for a lot., a6b87c1 feat: implement backend API foundation, payment integration, and frontend checkout service, ApiService, delay()

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (19): CreateOrderRequest, # NOTE: If keys are placeholders, the order creation will fail gracefully., VerifyPaymentRequest, BaseModel, get_current_user(), Register a new user (Farmer or Buyer)., Get current logged-in user details from JWT token., Generate and send a 6-digit OTP to the user's mobile number. (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (5): 9f0b33d Refactor: reorganize into clean monorepo (backend, ai, database, tests, docs) and fix import paths, f23d914 Merge pull request #1 from Mohankanakam06/dev, PRECACHE_ASSETS, payout(), Process payout for an order at pickup or delivery stage.

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (5): 55c011d Update site navigation and design enhancements, 7435c94 feat: implement core logistics and order management dashboard with AI-driven route optimization and real-time monitoring, Role, Step, Button()

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (10): 4dd9e28 feat: implement initial landing page and project structure with farmer and buyer navigation flow, 6b42c2c feat: add reusable Badge, Button, and Card UI components with tailwind utility helper, commonReasons, STATES, Badge(), BadgeProps, ButtonProps, Card() (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (3): b95dd39 Merge backend project into KisanSetu, ACCENTS, StatusPageProps

### Community 7 - "Community 7"
Cohesion: 0.20
Nodes (6): COOKIE_CATEGORIES, LEGAL_LINKS, LegalLayoutProps, LegalList(), LegalParagraph(), LegalSection()

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (17): delete_cache(), delete_otp(), get_cache(), get_chat_history(), get_otp(), is_redis_available(), Retrieve recent multi-turn chat history for a user., Save chat history for a user with default 1-hour expiration. (+9 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (7): get_conn(), get_db(), get_pool(), Retrieve a connection from the pool., Return a connection back to the pool., Context manager for safe database connections and transactions., release_conn()

### Community 10 - "Community 10"
Cohesion: 0.15
Nodes (9): f83feb3 Initial commit: prototype frontend., cropEmojis, LeafletMapProps, eslintConfig, LeafletMap, config, CreateListingRequest, CropType (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (16): CreateOrderRequest, Listing, ListingStatus, LotListingItem, LotStatus, OptimizeRouteRequest, OrderStatus, PaymentStatus (+8 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (8): LotDetailModalProps, CROPS, GRADES, LeafletMap, 9fb29c4 Merge Kisan Setu repository with backend project, c27cac1 feat: initialize frontend application structure with buyer, farmer, and orders modules and implement primary buyer marketplace interface, cropEmojis, Lot

### Community 13 - "Community 13"
Cohesion: 0.21
Nodes (8): LeafletMap, statusPillColor, initialLots, initialOrders, OptimizeRouteResponse, Order, QualityGradeResponse, SettlementPayoutResponse

### Community 14 - "Community 14"
Cohesion: 0.17
Nodes (4): 221a7f7 feat: implement redis-based caching layer with memory fallback and introduce initial agent workflows and e2e testing framework, 9f2f3c1 feat: implement service worker for PWA support and add site navigation and authentication pages, LoginState, Role

### Community 15 - "Community 15"
Cohesion: 0.17
Nodes (6): footerLinks, inter, metadata, plusJakartaSans, BeforeInstallPromptEvent, Event

### Community 16 - "Community 16"
Cohesion: 0.17
Nodes (6): CropPhotoProps, MODULE_CACHE, AVATAR_COLORS, BENCHMARK_MANDI, cropEmojis, LotCardProps

### Community 17 - "Community 17"
Cohesion: 0.18
Nodes (3): get_mock_conn(), MockConnection, MockCursor

### Community 18 - "Community 18"
Cohesion: 0.40
Nodes (9): listings, lot_listings, lots, orders, payments, price_history, quality_grades, routes (+1 more)

### Community 19 - "Community 19"
Cohesion: 0.40
Nodes (5): create_listing(), parse_listing(), Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to, Use Gemini to extract structured fields from the transcript., transcribe_audio()

### Community 20 - "Community 20"
Cohesion: 0.33
Nodes (4): get_lot(), list_lots(), List available lots with optional filters., Get a specific lot by ID with member listings.

### Community 21 - "Community 21"
Cohesion: 0.50
Nodes (4): call_tool(), create_farmer_listing(), handle_query(), Create a new produce listing from a farmer's voice or text message.      Args:

### Community 22 - "Community 22"
Cohesion: 0.40
Nodes (4): compare(), optimize(), Optimize delivery route for an order., Compare individual vs consolidated routing for demo.

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (2): Cluster active listings of the same crop into lots., run_aggregation()

### Community 24 - "Community 24"
Cohesion: 0.67
Nodes (2): process_payout(), Process payout to farmers for a fulfilled or picked-up order.     Stage:

### Community 25 - "Community 25"
Cohesion: 1.00
Nodes (2): jitter(), seed()

### Community 26 - "Community 26"
Cohesion: 0.67
Nodes (1): FAQ_ITEMS

### Community 27 - "Community 27"
Cohesion: 1.00
Nodes (1): backend

## Knowledge Gaps
- **89 isolated node(s):** `Cluster active listings of the same crop into lots.`, `Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to`, `Use Gemini to extract structured fields from the transcript.`, `Create a new produce listing from a farmer's voice or text message.      Args:`, `Helper to call OpenRouteService directions endpoint with snap radius for rural c` (+84 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 23`** (2 nodes): `Cluster active listings of the same crop into lots.`, `run_aggregation()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `process_payout()`, `Process payout to farmers for a fulfilled or picked-up order.     Stage:`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `jitter()`, `seed()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `FAQ_ITEMS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `backend`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiService` connect `Community 1` to `Community 12`, `Community 10`, `Community 13`, `Community 5`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `Button()` connect `Community 4` to `Community 6`, `Community 16`, `Community 12`, `Community 1`, `Community 0`, `Community 7`, `Community 5`, `Community 10`, `Community 13`, `Community 14`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `MockCursor` connect `Community 17` to `Community 0`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `Cluster active listings of the same crop into lots.`, `Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to`, `Use Gemini to extract structured fields from the transcript.` to the rest of the system?**
  _89 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07312925170068027 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11462450592885376 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09881422924901186 - nodes in this community are weakly interconnected._