# Graph Report - .  (2026-09-08)

## Corpus Check
- 118 files · ~93,182 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 415 nodes · 969 edges · 29 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: MODIFIES: 309 · contains: 215 · imports: 121 · imports_from: 107 · ON_BRANCH: 57 · rationale_for: 41 · calls: 35 · PARENT_OF: 34 · method: 29 · inherits: 12 · references: 9


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 118 · Candidates: 132
- Excluded: 4 untracked · 27408 ignored · 1 sensitive · 1 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `1bb7010`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `Button()` - 30 edges
2. `ApiService` - 20 edges
3. `useLanguage()` - 17 edges
4. `Badge()` - 15 edges
5. `Card()` - 14 edges
6. `is_redis_available()` - 10 edges
7. `delay()` - 9 edges
8. `MockCursor` - 7 edges
9. `get_db()` - 7 edges
10. `Lot` - 7 edges

## Surprising Connections (you probably didn't know these)
- `OrderCreate` --inherits--> `BaseModel`  [EXTRACTED]
  backend/main.py →   _Bridges community 3 → community 5_
- `0524d79 Add Kisan Setu project` --PARENT_OF--> `9fb29c4 Merge Kisan Setu repository with backend project`  [EXTRACTED]
  git → git  _Bridges community 2 → community 0_
- `149a4a1 Initial commit` --PARENT_OF--> `f83feb3 Initial commit: prototype frontend.`  [EXTRACTED]
  git → git  _Bridges community 2 → community 11_
- `221a7f7 feat: implement redis-based caching layer with memory fallback and introduce initial agent workflows and e2e testing framework` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 16 → community 2_
- `221a7f7 feat: implement redis-based caching layer with memory fallback and introduce initial agent workflows and e2e testing framework` --PARENT_OF--> `a6b87c1 feat: implement backend API foundation, payment integration, and frontend checkout service`  [EXTRACTED]
  git → git  _Bridges community 16 → community 4_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.10
Nodes (6): 1bb7010 feat: KisanSetu v1.0 - Next-gen Agri-tech platform outperforming DeHaat & Ninjacart, full PWA, auto-deploy config, 9fb29c4 Merge Kisan Setu repository with backend project, b95dd39 Merge backend project into KisanSetu, config, ACCENTS, StatusPageProps

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (11): commonReasons, Language, LanguageContext, LanguageContextType, LanguageProvider(), useLanguage(), CropType, Badge() (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (22): data-logistics, dev, main, 033b08c fix(cors): support wildcard and vercel subdomains in CORS middleware, 0524d79 Add Kisan Setu project, 133c3ae Merge branch 'dev', 149a4a1 Initial commit, 16cd71b feat(security): implement server-side api proxy for secure env variables (+14 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (12): create_order(), OrderCreate, Create a new order for a lot., get_mock_conn(), MockConnection, MockCursor, MockDB, Step-by-step verification of the complete marketplace flow:     1. Create farme (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (25): a6b87c1 feat: implement backend API foundation, payment integration, and frontend checkout service, initialLots, initialOrders, CreateListingRequest, CreateOrderRequest, Listing, ListingStatus, Lot (+17 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (20): CreateOrderRequest, # NOTE: If keys are placeholders, the order creation will fail gracefully., VerifyPaymentRequest, BaseModel, get_current_user(), Register a new user (Farmer or Buyer)., Get current logged-in user details from JWT token., Generate and send a 6-digit OTP to the user's mobile number. (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (3): 9f0b33d Refactor: reorganize into clean monorepo (backend, ai, database, tests, docs) and fix import paths, f23d914 Merge pull request #1 from Mohankanakam06/dev, PRECACHE_ASSETS

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (12): get_conn(), get_db(), get_pool(), MockConnection, MockCursor, Retrieve a connection from the pool., Return a connection back to the pool., Context manager for safe database connections and transactions. (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.15
Nodes (12): 55c011d Update site navigation and design enhancements, 7435c94 feat: implement core logistics and order management dashboard with AI-driven route optimization and real-time monitoring, c27cac1 feat: initialize frontend application structure with buyer, farmer, and orders modules and implement primary buyer marketplace interface, cropEmojis, LeafletMapProps, LANGUAGES, NAV_ITEMS, NavItem (+4 more)

### Community 9 - "Community 9"
Cohesion: 0.20
Nodes (6): COOKIE_CATEGORIES, LEGAL_LINKS, LegalLayoutProps, LegalList(), LegalParagraph(), LegalSection()

### Community 10 - "Community 10"
Cohesion: 0.16
Nodes (17): delete_cache(), delete_otp(), get_cache(), get_chat_history(), get_otp(), is_redis_available(), Retrieve recent multi-turn chat history for a user., Save chat history for a user with default 1-hour expiration. (+9 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (10): AVATAR_COLORS, BENCHMARK_MANDI, cropEmojis, LotCardProps, LotDetailModalProps, CROPS, GRADES, LeafletMap (+2 more)

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (4): Cluster active listings of the same crop into lots., run_aggregation(), process_payout(), Process payout to farmers for a fulfilled or picked-up order.     Stage:       -

### Community 13 - "Community 13"
Cohesion: 0.17
Nodes (6): footerLinks, inter, metadata, plusJakartaSans, BeforeInstallPromptEvent, Event

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (7): 4dd9e28 feat: implement initial landing page and project structure with farmer and buyer navigation flow, 6b42c2c feat: add reusable Badge, Button, and Card UI components with tailwind utility helper, Role, Step, BadgeProps, ButtonProps, CardProps

### Community 15 - "Community 15"
Cohesion: 0.27
Nodes (2): ApiService, delay()

### Community 16 - "Community 16"
Cohesion: 0.20
Nodes (4): 221a7f7 feat: implement redis-based caching layer with memory fallback and introduce initial agent workflows and e2e testing framework, 9f2f3c1 feat: implement service worker for PWA support and add site navigation and authentication pages, LoginState, Role

### Community 17 - "Community 17"
Cohesion: 0.40
Nodes (9): listings, lot_listings, lots, orders, payments, price_history, quality_grades, routes (+1 more)

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (3): CropPhotoProps, MODULE_CACHE, cropEmojis

### Community 19 - "Community 19"
Cohesion: 0.29
Nodes (7): create_listing(), parse_listing(), Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to, Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a, Use Gemini to extract structured fields from the transcript., Use Gemini to extract structured fields from the transcript., transcribe_audio()

### Community 20 - "Community 20"
Cohesion: 0.32
Nodes (7): _call_ors_directions(), compare_individual_vs_consolidated(), optimize_route(), For the demo: Compare individual point-to-point trips vs one consolidated route., For the demo: Compare individual point-to-point trips vs one consolidated route., Helper to call OpenRouteService directions endpoint with snap radius for rural c, Computes a consolidated multi-pickup delivery route for an order.     Picks up

### Community 21 - "Community 21"
Cohesion: 0.29
Nodes (6): compare(), optimize(), Optimize delivery route for an order., Optimize delivery route for an order., Compare individual vs consolidated routing for demo., Compare individual vs consolidated routing for demo.

### Community 22 - "Community 22"
Cohesion: 0.40
Nodes (5): call_tool(), create_farmer_listing(), handle_query(), Create a new produce listing from a farmer's voice or text message.      Args:, Create a new produce listing from a farmer's voice or text message.      Args:

### Community 23 - "Community 23"
Cohesion: 0.33
Nodes (4): get_lot(), list_lots(), List available lots with optional filters., Get a specific lot by ID with member listings.

### Community 24 - "Community 24"
Cohesion: 1.00
Nodes (2): jitter(), seed()

### Community 25 - "Community 25"
Cohesion: 0.67
Nodes (2): payout(), Process payout for an order at pickup or delivery stage.

### Community 26 - "Community 26"
Cohesion: 0.67
Nodes (1): STATES

### Community 27 - "Community 27"
Cohesion: 0.67
Nodes (1): FAQ_ITEMS

### Community 28 - "Community 28"
Cohesion: 1.00
Nodes (1): backend

## Knowledge Gaps
- **101 isolated node(s):** `Cluster active listings of the same crop into lots.`, `Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a`, `Use Gemini to extract structured fields from the transcript.`, `Create a new produce listing from a farmer's voice or text message.      Args:`, `Helper to call OpenRouteService directions endpoint with snap radius for rural c` (+96 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 15`** (2 nodes): `ApiService`, `delay()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `jitter()`, `seed()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `payout()`, `Process payout for an order at pickup or delivery stage.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `STATES`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `FAQ_ITEMS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `backend`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiService` connect `Community 15` to `Community 11`, `Community 1`, `Community 8`, `Community 18`, `Community 4`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `MockCursor` connect `Community 7` to `Community 12`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `Cluster active listings of the same crop into lots.`, `Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a`, `Use Gemini to extract structured fields from the transcript.` to the rest of the system?**
  _101 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09848484848484848 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.12643678160919541 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08547008547008547 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.10541310541310542 - nodes in this community are weakly interconnected._