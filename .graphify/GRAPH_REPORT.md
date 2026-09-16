# Graph Report - .  (2026-09-16)

## Corpus Check
- 117 files · ~97,614 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 515 nodes · 1222 edges · 34 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: MODIFIES: 404 · contains: 262 · imports: 146 · imports_from: 122 · rationale_for: 79 · ON_BRANCH: 64 · calls: 52 · PARENT_OF: 41 · method: 29 · inherits: 14 · references: 9


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 117 · Candidates: 143
- Excluded: 0 untracked · 31998 ignored · 1 sensitive · 1 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `dc663d4`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `Button()` - 34 edges
2. `useLanguage()` - 21 edges
3. `Badge()` - 20 edges
4. `ApiService` - 20 edges
5. `Card()` - 19 edges
6. `cn()` - 13 edges
7. `is_redis_available()` - 10 edges
8. `delay()` - 9 edges
9. `get_db()` - 8 edges
10. `Lot` - 8 edges

## Surprising Connections (you probably didn't know these)
- `0524d79 Add Kisan Setu project` --PARENT_OF--> `9fb29c4 Merge Kisan Setu repository with backend project`  [EXTRACTED]
  git → git  _Bridges community 0 → community 2_
- `1318520 fixed some minor bugs` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 16 → community 0_
- `1318520 fixed some minor bugs` --PARENT_OF--> `1a6073e feat(ui): implement Mandi & Soil design system`  [EXTRACTED]
  git → git  _Bridges community 16 → community 12_
- `149a4a1 Initial commit` --PARENT_OF--> `f83feb3 Initial commit: prototype frontend.`  [EXTRACTED]
  git → git  _Bridges community 0 → community 9_
- `1a6073e feat(ui): implement Mandi & Soil design system` --ON_BRANCH--> `main`  [EXTRACTED]
  git → git  _Bridges community 12 → community 0_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (34): data-logistics, dev, main, 033b08c fix(cors): support wildcard and vercel subdomains in CORS middleware, 0524d79 Add Kisan Setu project, 133c3ae Merge branch 'dev', 149a4a1 Initial commit, 16cd71b feat(security): implement server-side api proxy for secure env variables (+26 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (42): OrderCreate, CreateOrderRequest, # NOTE: If keys are placeholders, the order creation will fail gracefully., VerifyPaymentRequest, BaseModel, a6b87c1 feat: implement backend API foundation, payment integration, and frontend checkout service, get_current_user(), hash_password() (+34 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (11): 1bb7010 feat: KisanSetu v1.0 - Next-gen Agri-tech platform outperforming DeHaat & Ninjacart, full PWA, auto-deploy config, 9fb29c4 Merge Kisan Setu repository with backend project, b95dd39 Merge backend project into KisanSetu, c27cac1 feat: initialize frontend application structure with buyer, farmer, and orders modules and implement primary buyer marketplace interface, eslintConfig, Role, Step, config (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (16): 4dd9e28 feat: implement initial landing page and project structure with farmer and buyer navigation flow, 6b42c2c feat: add reusable Badge, Button, and Card UI components with tailwind utility helper, commonReasons, CROP_BENCHMARKS, CropBenchmark, ProfitImpactSimulatorProps, STATES, Badge() (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (7): 9f0b33d Refactor: reorganize into clean monorepo (backend, ai, database, tests, docs) and fix import paths, f23d914 Merge pull request #1 from Mohankanakam06/dev, jitter(), seed(), PRECACHE_ASSETS, payout(), Process payout for an order at pickup or delivery stage.

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (14): get_conn(), get_db(), get_pool(), MockConnection, MockCursor, Retrieve a connection from the pool., Return a connection back to the pool., Context manager for safe database connections and transactions. (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (10): LotDetailModalProps, CROPS, GRADES, LeafletMap, Language, LanguageContext, LanguageContextType, useLanguage() (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (19): AI_INSPECTION_DATA, defaultInspection, QualityInspectionModalProps, CreateOrderRequest, Listing, ListingStatus, LotListingItem, LotStatus (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (3): 1ef1257 feat: KisanSetu v1.0 - Next-gen Agri-tech platform enhancements and escrow settlement features, 7122065 fix: resolve extension hydration mismatch and harden backend API endpoints with offline fallbacks, c4bbc0f fix: ensure complete fallback for routing and quality endpoints

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (12): 55c011d Update site navigation and design enhancements, 7435c94 feat: implement core logistics and order management dashboard with AI-driven route optimization and real-time monitoring, f83feb3 Initial commit: prototype frontend., LeafletMap, statusPillBadge, statusPillColor, initialLots, initialOrders (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.20
Nodes (6): COOKIE_CATEGORIES, LEGAL_LINKS, LegalLayoutProps, LegalList(), LegalParagraph(), LegalSection()

### Community 11 - "Community 11"
Cohesion: 0.16
Nodes (17): delete_cache(), delete_otp(), get_cache(), get_chat_history(), get_otp(), is_redis_available(), Retrieve recent multi-turn chat history for a user., Save chat history for a user with default 1-hour expiration. (+9 more)

### Community 12 - "Community 12"
Cohesion: 0.16
Nodes (13): 1a6073e feat(ui): implement Mandi & Soil design system, dc663d4 @ feat: Complete platform audit, polish mobile navigation & fix core flows, cropEmojis, LeafletMapProps, CropLine, FarmerPage(), LeafletMap, makeEmptyQualityState() (+5 more)

### Community 13 - "Community 13"
Cohesion: 0.19
Nodes (14): call_tool(), cluster_active_lots(), create_farmer_listing(), grade_lot_quality(), handle_query(), optimize_delivery_route(), process_stage_payout(), Create a new produce listing from a farmer's voice or text message.      Args: (+6 more)

### Community 14 - "Community 14"
Cohesion: 0.13
Nodes (9): barlow, footerLinks, inter, metadata, plusJakartaSans, zillaSlab, BeforeInstallPromptEvent, Event (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.17
Nodes (8): CropPhotoProps, MODULE_CACHE, AVATAR_COLORS, BENCHMARK_MANDI, cropEmojis, LotCard(), LotCardProps, useTradeWindow()

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (4): 1318520 fixed some minor bugs, _create_single_listing_lot(), farmer_listing(), Fallback: create a single-listing lot when aggregation clustering can't form a g

### Community 17 - "Community 17"
Cohesion: 0.27
Nodes (2): ApiService, delay()

### Community 18 - "Community 18"
Cohesion: 0.20
Nodes (10): _call_ors_directions(), compare_individual_vs_consolidated(), optimize_route(), For the demo: Compare individual point-to-point trips vs one consolidated route., For the demo: Compare individual point-to-point trips vs one consolidated route., For the demo: Compare individual point-to-point trips vs one consolidated route., Helper to call OpenRouteService directions endpoint with snap radius for rural c, Helper to call OpenRouteService directions endpoint with snap radius for rural c (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.40
Nodes (9): listings, lot_listings, lots, orders, payments, price_history, quality_grades, routes (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.22
Nodes (7): BUYER_NAV, DASHBOARD_NAV, FARMER_NAV, LANGUAGES, NAV_ITEMS, NavItem, PUBLIC_NAV

### Community 21 - "Community 21"
Cohesion: 0.32
Nodes (7): create_direct_listing(), create_listing(), parse_listing(), Directly insert a structured listing into the database., Use Gemini to extract structured fields from the transcript., Use Gemini to extract structured fields from the transcript., Use Gemini to extract structured fields from the transcript.

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (3): create_order(), Create a new order for a lot., Create a new order for a lot.

### Community 23 - "Community 23"
Cohesion: 0.25
Nodes (5): 221a7f7 feat: implement redis-based caching layer with memory fallback and introduce initial agent workflows and e2e testing framework, 9f2f3c1 feat: implement service worker for PWA support and add site navigation and authentication pages, AuthMethod, LoginState, Role

### Community 24 - "Community 24"
Cohesion: 0.50
Nodes (4): Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to, Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a, Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a, transcribe_audio()

### Community 25 - "Community 25"
Cohesion: 0.50
Nodes (4): compare(), Compare individual vs consolidated routing for demo., Compare individual vs consolidated routing for demo., Compare individual vs consolidated routing for demo.

### Community 26 - "Community 26"
Cohesion: 0.50
Nodes (4): optimize(), Optimize delivery route for an order., Optimize delivery route for an order., Optimize delivery route for an order.

### Community 27 - "Community 27"
Cohesion: 0.67
Nodes (3): config, decodeJwtPayload(), middleware()

### Community 28 - "Community 28"
Cohesion: 0.67
Nodes (3): Cluster active listings of the same crop into lots., Cluster active listings of the same crop into lots with transaction-level adviso, run_aggregation()

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (3): process_payout(), Process payout to farmers for a fulfilled or picked-up order.     Stage:       -, Process payout to farmers for a fulfilled or picked-up order.     Stage:

### Community 30 - "Community 30"
Cohesion: 0.67
Nodes (3): get_lot(), Get a specific lot by ID with member listings., Get a specific lot by ID with member listings.

### Community 31 - "Community 31"
Cohesion: 0.67
Nodes (3): list_lots(), List available lots with optional filters., List available lots with optional filters and 24-hour freshness time limit.

### Community 32 - "Community 32"
Cohesion: 0.67
Nodes (1): FAQ_ITEMS

### Community 34 - "Community 34"
Cohesion: 1.00
Nodes (1): backend

## Knowledge Gaps
- **157 isolated node(s):** `Cluster active listings of the same crop into lots with transaction-level adviso`, `Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a`, `Use Gemini to extract structured fields from the transcript.`, `Directly insert a structured listing into the database.`, `Create a new produce listing from a farmer's voice or text message.      Args:` (+152 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 17`** (2 nodes): `ApiService`, `delay()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `FAQ_ITEMS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `backend`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ApiService` connect `Community 17` to `Community 6`, `Community 2`, `Community 12`, `Community 9`, `Community 3`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `MockCursor` connect `Community 5` to `Community 8`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `Cluster active listings of the same crop into lots with transaction-level adviso`, `Call Speech-to-Text pipeline (Sarvam / Bhashini / Fallback).     Falls back to a`, `Use Gemini to extract structured fields from the transcript.` to the rest of the system?**
  _157 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07102040816326531 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05314009661835749 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08080808080808081 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1028225806451613 - nodes in this community are weakly interconnected._