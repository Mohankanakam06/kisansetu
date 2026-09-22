"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Lot } from "@/types";
import { apiService } from "@/services/api";
import LotCard from "@/components/buyer/LotCard";
import LotDetailModal from "@/components/buyer/LotDetailModal";
import { FarmerListing } from "@/types";
import { BuyerMetricsHeader } from "@/components/buyer/BuyerMetricsHeader";
import { FarmerListingCard } from "@/components/buyer/FarmerListingCard";
import { NoListingsFound } from "@/components/buyer/NoListingsFound";
import { DemoPaymentModal } from "@/components/buyer/DemoPaymentModal";
import ProfitImpactSimulator from "@/components/simulator/ProfitImpactSimulator";
import { Button, Card, Badge, cn } from "@/components/ui";
import { useLanguage } from "@/lib/language";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useFavorites } from "@/hooks/useFavorites";
import {
  Search,
  ShoppingCart,
  Grid,
  Table as TableIcon,
  Map,
  Filter,
  ShieldCheck,
  PackageCheck,
  LocateFixed,
  Sprout,
  TrendingUp,
  TrendingDown,
  Truck,
  Activity,
  Award,
  Sparkles,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Calculator,
  X,
  CheckCircle,
  Heart,
} from "lucide-react";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-600 font-semibold">
      Loading interactive map...
    </div>
  ),
});

const CROPS = ["All", "Tomato", "Onion", "Potato", "Wheat", "Rice", "Soybean", "Chilli", "Garlic", "Cotton"];
const GRADES = ["All", "A", "B", "C"];

const BENCHMARK_MANDI: Record<string, number> = {
  Tomato: 26.5,
  Onion: 32.0,
  Potato: 22.0,
  Wheat: 27.5,
  Rice: 36.0,
  Soybean: 46.5,
  Chilli: 72.0,
  Ginger: 88.0,
  Garlic: 95.0,
  Cotton: 62.0,
};

const CROP_EMOJIS: Record<string, string> = {
  Tomato: "🍅",
  Onion: "🧅",
  Potato: "🥔",
  Wheat: "🌾",
  Rice: "🍚",
  Soybean: "🫘",
  Chilli: "🌶️",
  Garlic: "🧄",
  Cotton: "🌼",
};

interface TickerItem {
  crop_type: string;
  mandi_name: string;
  price_per_kg: number;
  price_change_pct: number;
  arrival_volume: number;
  volume_unit: string;
}

export default function BuyerPage() {
  const { t } = useLanguage();
  const { isAuthorized, isLoading: isAuthLoading, user: currentUser } = useRoleGuard("buyer");
  const { favorites, isFavorite, favoritesCount } = useFavorites();
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

    const [activeTab, setActiveTab] = useState<"farmer_listings" | "wholesale_pools">("farmer_listings");
  const [farmerListings, setFarmerListings] = useState<FarmerListing[]>([]);
  const [isLoadingFarmerListings, setIsLoadingFarmerListings] = useState(true);
  const [demoPaymentItem, setDemoPaymentItem] = useState<FarmerListing | Lot | null>(null);
  const [isDemoPaymentOpen, setIsDemoPaymentOpen] = useState(false);

  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [orderingLot, setOrderingLot] = useState<Lot | null>(null);
  const [simulatorCrop, setSimulatorCrop] = useState<string | null>(null);
  const [orderSuccessNotice, setOrderSuccessNotice] = useState<string | null>(null);

  const [cropFilter, setCropFilter] = useState("All");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "volume_desc" | "grade">("volume_desc");
  const [isLoadingLots, setIsLoadingLots] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table" | "map">("grid");

  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [nearbyRadiusKm, setNearbyRadiusKm] = useState(15);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  // Live APMC Ticker State
  const [tickerData, setTickerData] = useState<TickerItem[]>([
    { crop_type: "Tomato", mandi_name: "Raipur APMC", price_per_kg: 22.5, price_change_pct: 2.3, arrival_volume: 1200, volume_unit: "qtl" },
    { crop_type: "Onion", mandi_name: "Lasalgaon", price_per_kg: 28.0, price_change_pct: -1.2, arrival_volume: 4500, volume_unit: "qtl" },
    { crop_type: "Potato", mandi_name: "Bhilai-Durg", price_per_kg: 18.0, price_change_pct: 0.8, arrival_volume: 3200, volume_unit: "qtl" },
    { crop_type: "Chilli", mandi_name: "Tilda Mandi", price_per_kg: 65.0, price_change_pct: -3.1, arrival_volume: 300, volume_unit: "qtl" },
    { crop_type: "Paddy", mandi_name: "Dhamtari", price_per_kg: 21.0, price_change_pct: 1.4, arrival_volume: 8600, volume_unit: "qtl" },
    { crop_type: "Wheat", mandi_name: "Sehore APMC", price_per_kg: 24.5, price_change_pct: -0.5, arrival_volume: 5200, volume_unit: "qtl" },
  ]);

  // Fetch Live Mandi Prices from Agmarknet API (data.gov.in)
  useEffect(() => {
    async function loadLiveMandiPrices() {
      try {
        const res = await apiService.getMandiPrices({ limit: 15 });
        if (res && res.records && res.records.length > 0) {
          const items: TickerItem[] = res.records.slice(0, 10).map((r: any) => {
            const minKg = r.min_price_kg || (r.min_price ? r.min_price / 100 : 0);
            const maxKg = r.max_price_kg || (r.max_price ? r.max_price / 100 : 0);
            const modalKg = r.modal_price_kg || (r.modal_price ? r.modal_price / 100 : (minKg + maxKg) / 2);
            const changePct = minKg > 0 && maxKg > minKg
              ? Number((((modalKg - minKg) / minKg) * 10).toFixed(1))
              : 0.5;

            return {
              crop_type: r.commodity,
              mandi_name: r.market ? `${r.market.replace(/ APMC| Market|\(.*\)/gi, "")}` : "APMC",
              price_per_kg: modalKg > 0 ? modalKg : 25,
              price_change_pct: changePct,
              arrival_volume: Math.round(modalKg * 45) || 1200,
              volume_unit: "qtl"
            };
          });
          if (items.length > 0) {
            setTickerData(items);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch live mandi prices from Agmarknet", err);
      }
    }
    loadLiveMandiPrices();
  }, []);

  // WebSocket for Live APMC Mandi Ticker
  const handleTickerMessage = useCallback((msg: any) => {
    if (msg?.type === "apmc_ticker" && Array.isArray(msg.data)) {
      setTickerData(msg.data);
    }
  }, []);

  const { isConnected: isTickerConnected } = useWebSocket("ws/ticker", handleTickerMessage);

    const fetchFarmerListings = useCallback(async () => {
    setIsLoadingFarmerListings(true);
    try {
      const res = await apiService.getFarmerListings({
        crop: cropFilter === "All" ? undefined : cropFilter,
        search: searchQuery || undefined,
        minPrice: priceMin ? Number(priceMin) : undefined,
        maxPrice: priceMax ? Number(priceMax) : undefined,
        sort: sortBy !== "grade" ? sortBy : undefined
      });
      if (res.success && res.listings) {
        setFarmerListings(res.listings);
      }
    } catch (e) {
      console.warn("Failed to fetch farmer listings", e);
    } finally {
      setIsLoadingFarmerListings(false);
    }
  }, [cropFilter, searchQuery, priceMin, priceMax, sortBy]);

  useEffect(() => {
    fetchFarmerListings();
  }, [fetchFarmerListings]);

  const fetchLots = useCallback(async () => {
    setIsLoadingLots(true);
    setFetchError(null);
    try {
      const res = await apiService.getLots({
        crop: cropFilter === "All" ? undefined : cropFilter,
        grade: gradeFilter === "All" ? undefined : gradeFilter,
        search: searchQuery || undefined,
        minPrice: priceMin ? Number(priceMin) : undefined,
        maxPrice: priceMax ? Number(priceMax) : undefined,
        lat: nearbyEnabled && userLocation ? userLocation.lat : undefined,
        lng: nearbyEnabled && userLocation ? userLocation.lng : undefined,
        radiusKm: nearbyEnabled && userLocation ? nearbyRadiusKm : undefined,
      });
      setLots(res.lots || []);
    } catch (err: any) {
      console.error(err);
      setFetchError(err?.message || "Failed to load wholesale lots. Please check your connection.");
    } finally {
      setIsLoadingLots(false);
    }
  }, [cropFilter, gradeFilter, searchQuery, priceMin, priceMax, nearbyEnabled, userLocation, nearbyRadiusKm]);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  // WebSocket for Live Orders & Pool updates
  const handleOrderWSMessage = useCallback((msg: any) => {
    if (msg?.type === "order_placed" || msg?.type === "pool_updated") {
      fetchLots();
      fetchFarmerListings();
    }
  }, [fetchLots]);

  useWebSocket("ws/orders", handleOrderWSMessage, currentUser?.id || "buyer-01");

  const getMyLocation = async () => {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearbyEnabled(true);
        setLocating(false);
      },
      () => {
        setNearbyEnabled(false);
        setLocating(false);
      }
    );
  };

  const handleOrderConfirmed = async (lot: Lot, qty: number) => {
    try {
      await apiService.createOrder({
        buyer_id: currentUser?.id || "buyer-01",
        lot_id: lot.id,
        quantity_kg: qty,
      });
      setSelectedLot(null);
      setOrderSuccessNotice(`Order placed successfully for ${qty}kg ${lot.crop_type}! Secured with payment protection.`);
      fetchLots();
      setTimeout(() => setOrderSuccessNotice(null), 8000);
    } catch (e) {
      console.error("Order creation failed", e);
    }
  };

  // Sorted and Processed Lots
  const processedLots = useMemo(() => {
    let list = [...lots];
    if (showOnlyFavorites) {
      list = list.filter((l) => favorites.includes(l.id));
    }
    return list.sort((a, b) => {
      if (sortBy === "price_asc") return a.price_per_kg - b.price_per_kg;
      if (sortBy === "price_desc") return b.price_per_kg - a.price_per_kg;
      if (sortBy === "volume_desc") return b.total_quantity_kg - a.total_quantity_kg;
      if (sortBy === "grade") return a.grade.localeCompare(b.grade);
      return 0;
    });
  }, [lots, sortBy, showOnlyFavorites, favorites]);

  if (isAuthLoading) {
    return (
      <div className="flex-1 bg-[#F8FAFC] flex flex-col items-center justify-center py-24 gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" aria-label="Loading" />
        <p className="text-sm font-semibold text-slate-500">{t("Verifying access…", "पहुंच सत्यापित हो रही है…", "पहुंच जांचत हन…")}</p>
      </div>
    );
  }
  if (!isAuthorized) return null;

  // Debug log exactly as requested by user instructions
  console.log("[Buyer Dashboard] Raw farmer listings array before rendering:", farmerListings);

  return (
    <div className="flex-1 bg-[#F8FAFC] py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Live APMC Mandi Price Ticker Bar */}
        <div className="bg-slate-900 text-white rounded-xl shadow-xs overflow-hidden border border-slate-800">
          <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isTickerConnected ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isTickerConnected ? "bg-emerald-500" : "bg-amber-500"}`}></span>
              </span>
              <span className="font-bold uppercase tracking-wider text-slate-300">
                {t("Live APMC Mandi Benchmark Ticker", "लाइव APMC मंडी बेंचमार्क टिकर", "लाइव मंडी भाव टिकर")}
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                ({isTickerConnected ? "Real-Time WebSocket Feed" : "Simulated Feed"})
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              {t("Tap commodity to filter", "फिल्टर करने के लिए टैप करें", "फिल्टर करे बर टैप करव")}
            </span>
          </div>

          <div className="p-2.5 overflow-x-auto scrollbar-none flex items-center gap-3 text-xs">
            {tickerData.map((item, idx) => {
              const isPositive = item.price_change_pct >= 0;
              const emoji = CROP_EMOJIS[item.crop_type] || "🌾";
              const isSelected = cropFilter.toLowerCase() === item.crop_type.toLowerCase();

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCropFilter(isSelected ? "All" : item.crop_type)}
                  className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-950 border-emerald-500 text-emerald-100 ring-1 ring-emerald-400"
                      : "bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-200"
                  }`}
                >
                  <span className="text-base">{emoji}</span>
                  <div className="text-left">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-100">{item.crop_type}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({item.mandi_name})</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="font-bold text-emerald-400">₹{item.price_per_kg.toFixed(1)}/kg</span>
                      <span
                        className={`text-[10px] font-bold flex items-center ${
                          isPositive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isPositive ? <TrendingUp className="h-3 w-3 mr-0.5 inline" /> : <TrendingDown className="h-3 w-3 mr-0.5 inline" />}
                        {isPositive ? "+" : ""}{item.price_change_pct}%
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Order Success Toast Banner */}
        {orderSuccessNotice && (
          <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-950 rounded-xl p-4 flex items-center justify-between shadow-md animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-emerald-950">{t("Wholesale Order Placed & Routed!", "थोक ऑर्डर दर्ज और रूट किया गया!", "ऑर्डर पक्का हो गे!")}</p>
                <p className="text-xs text-emerald-800 font-medium">{orderSuccessNotice}</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setOrderSuccessNotice(null)}>
              <X className="h-4 w-4 text-emerald-900" />
            </Button>
          </div>
        )}

        {/* Top Buyer Metrics Header */}
        <BuyerMetricsHeader 
          totalListings={farmerListings.length + processedLots.length}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          farmerCount={farmerListings.length}
          poolCount={processedLots.length}
        />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="buyer" className="gap-1 font-bold">
                <Sprout className="h-3.5 w-3.5" />
                {t("Wholesale Procurement Hub", "थोक खरीद केंद्र", "थोक खरीद केंद्र")}
              </Badge>
              <Badge variant="success" className="gap-1 font-mono text-[10px]">
                <ShieldCheck className="h-3 w-3" />
                {t("100% Payment Protection", "100% सुरक्षित भुगतान सुरक्षा", "सुरक्षित भुगतान")}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
              {t("Direct-to-Farmer Clustered Lots", "सीधे किसान-एकत्रित लॉट", "सीधा किसान-एकत्रित लॉट")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {t(
                "Procure verified, single-truck pooled harvest lots. Save 12–20% commission & freight versus traditional mandi sourcing.",
                "सत्यापित, 1-ट्रक पूल्ड फसल खरीदें। पारंपरिक मंडी से 12-20% कमीशन व मालभाड़ा बचाएं।",
                "सत्यापित, 1-गाड़ी पूल्ड फसल खरीदव। मंडी ले 12-20% दलाली आ भाड़ा बचावा।"
              )}
            </p>
          </div>

          {activeTab === "wholesale_pools" && (
          <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 border border-slate-300 shadow-xs self-start md:self-auto">
            <Button
              variant={viewMode === "grid" ? "buyer" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="gap-1.5 h-9"
            >
              <Grid className="h-4 w-4" />
              <span className="hidden sm:inline">{t("Grid Cards", "कार्ड", "कार्ड")}</span>
            </Button>
            <Button
              variant={viewMode === "table" ? "buyer" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="gap-1.5 h-9"
            >
              <TableIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t("Dense Comparison", "तुलनात्मक तालिका", "तुलना तालिका")}</span>
            </Button>
            <Button
              variant={viewMode === "map" ? "buyer" : "ghost"}
              size="sm"
              onClick={() => setViewMode("map")}
              className="gap-1.5 h-9"
            >
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">{t("Regional Map", "मैप", "मैप")}</span>
            </Button>
          </div>
        )}
        </div>

        {/* Quick Filter Bubbles (Zepto / Blinkit style) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => {
              setShowOnlyFavorites(false);
              setCropFilter("All");
            }}
            className={`shrink-0 h-9 px-4 rounded-full text-xs font-bold border transition-colors ${
              !showOnlyFavorites && cropFilter === "All"
                ? "bg-slate-900 border-slate-900 text-white"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {t("All Lots", "सभी लॉट", "सबो लॉट")}
          </button>
          <button
            onClick={() => setShowOnlyFavorites((prev) => !prev)}
            className={`shrink-0 h-9 px-4 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-colors ${
              showOnlyFavorites
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${showOnlyFavorites ? "fill-rose-500 text-rose-500" : ""}`} />
            {t("Liked / Saved", "पसंद किए गए", "पसंद करे")} ({favoritesCount})
          </button>

          <div className="w-px h-5 bg-slate-300 mx-1 shrink-0" />

          {CROPS.filter(c => c !== "All").map((c) => {
            const isActive = cropFilter === c && !showOnlyFavorites;
            return (
              <button
                key={c}
                onClick={() => {
                  setShowOnlyFavorites(false);
                  setCropFilter(c);
                }}
                className={`shrink-0 h-9 px-3 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{CROP_EMOJIS[c] || ""}</span>
                <span>{c}</span>
              </button>
            );
          })}
        </div>

        {/* Filters and Controls */}
        <Card className="p-4 space-y-3 bg-white border border-slate-200 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={t("Search by crop, hub, or lot #...", "फसल, केंद्र या लॉट खोजें...", "फसल खोजव...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 rounded-lg border border-slate-300 pl-10 pr-3 text-xs font-semibold text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-700"
              />
            </div>

            {/* Crop Selector */}
            <div>
              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="w-full h-11 rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-700"
              >
                {CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? t("All Crops", "सभी फसलें", "सबो फसल") : `${CROP_EMOJIS[c] || ""} ${c}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Selector */}
            <div>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full h-11 rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-700"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g === "All" ? t("All Quality Grades", "सभी ग्रेड", "सबो ग्रेड") : `Grade ${g} Certified`}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <div>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full h-11 rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-700"
              >
                <option value="volume_desc">{t("Highest Volume (kg)", "सर्वाधिक मात्रा", "सबले जादा मात्रा")}</option>
                <option value="price_asc">{t("Lowest Price (₹/kg)", "कम दाम (₹/किलो)", "कम दाम")}</option>
                <option value="price_desc">{t("Highest Price (₹/kg)", "उच्च दाम (₹/किलो)", "जादा दाम")}</option>
                <option value="grade">{t("Top Certified Quality", "शीर्ष गुणवत्ता", "बढ़िया क्वालिटी")}</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <Button
                variant={nearbyEnabled ? "buyer" : "outline"}
                onClick={getMyLocation}
                disabled={locating}
                className="w-full h-11 text-xs font-bold justify-center"
              >
                <LocateFixed className="h-4 w-4 mr-1.5" />
                {locating
                  ? t("Locating GPS...", "GPS खोज रहे हैं...", "GPS खोजत हन...")
                  : nearbyEnabled
                  ? `${t("Within", "दायरा", "दायरा")} ${nearbyRadiusKm}km`
                  : t("Filter Near Me", "पास के लॉट", "पास के लॉट")}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-600 font-semibold">
              {t("Found", "उपलब्ध", "उपलब्ध")}{" "}
              <strong className="text-slate-900 font-black">{processedLots.length}</strong>{" "}
              {t("clustered wholesale lots ready for pickup.", "एकत्रित लॉट पिकअप हेतु तैयार।", "लॉट पिकअप बर तैयार हे।")}
            </span>

            {(cropFilter !== "All" || gradeFilter !== "All" || searchQuery || nearbyEnabled || showOnlyFavorites) && (
              <button
                type="button"
                onClick={() => {
                  setCropFilter("All");
                  setGradeFilter("All");
                  setSearchQuery("");
                  setNearbyEnabled(false);
                  setShowOnlyFavorites(false);
                }}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
              >
                {t("Clear All Filters", "सभी फ़िल्टर हटाएं", "सबो फिल्टर हटाव")}
              </button>
            )}
          </div>
        </Card>

        {fetchError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-900">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <p className="text-xs font-semibold">{fetchError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLots()}
              className="border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0"
            >
              {t("Retry Connection", "पुनः प्रयास करें", "फिर से देखव")}
            </Button>
          </div>
        )}

        {/* CONTENT AREA BASED ON VIEW MODE */}

        {/* 0. DIRECT FARMER LISTINGS */}
        {activeTab === "farmer_listings" && (
          <div>
            {isLoadingFarmerListings ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-80 bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-4">
                    <div className="h-40 bg-slate-200 rounded-xl"></div>
                    <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-10 bg-slate-200 rounded mt-auto"></div>
                  </div>
                ))}
              </div>
            ) : farmerListings.length === 0 ? (
              <NoListingsFound 
                onClearFilters={() => {
                  setCropFilter("All");
                  setSearchQuery("");
                }}
                hasActiveFilters={cropFilter !== "All" || searchQuery.length > 0}
                onSwitchToPools={() => setActiveTab("wholesale_pools")}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {farmerListings.map((listing) => (
                  <FarmerListingCard
                    key={listing.id}
                    listing={listing}
                    onPayClick={(l) => { setDemoPaymentItem(l); setIsDemoPaymentOpen(true); }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 1. GRID CARDS VIEW */}
        {activeTab === "wholesale_pools" && viewMode === "grid" && (
          <div>
            {isLoadingLots ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-72 bg-white rounded-xl border border-slate-200 p-4 animate-pulse space-y-4">
                    <div className="h-32 bg-slate-200 rounded-lg"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : processedLots.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center font-bold">
                  <PackageCheck className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{t("No matching wholesale lots found", "कोई लॉट नहीं मिला", "कोई लॉट नइ मिलिस")}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {t("Try adjusting your crop filter, search radius, or clearing search keywords.", "फ़िल्टर या खोज दायरा बदल कर पुनः प्रयास करें।", "फिल्टर बदल के खोजव।")}
                </p>
                <Button variant="outline" size="sm" onClick={() => { setCropFilter("All"); setGradeFilter("All"); setSearchQuery(""); }}>
                  {t("Reset Filters", "फ़िल्टर रीसेट करें", "फिल्टर रीसेट करव")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedLots.map((lot) => (
                  <LotCard
                    key={lot.id}
                    lot={lot}
                    onOrderClick={() => setSelectedLot(lot)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. DENSE COMPARATIVE TABLE VIEW */}
        {activeTab === "wholesale_pools" && viewMode === "table" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">{t("Crop & Lot ID", "फसल एवं लॉट ID", "फसल आ लॉट")}</th>
                    <th className="py-3 px-3">{t("Grade", "ग्रेड", "ग्रेड")}</th>
                    <th className="py-3 px-3">{t("Available Volume", "मात्रा (किलो / क्विंटल)", "मात्रा")}</th>
                    <th className="py-3 px-3">{t("KisanSetu Direct Rate", "किसानसेतु दर", "किसानसेतु दर")}</th>
                    <th className="py-3 px-3">{t("Mandi Comparison & Savings", "मंडी तुलना एवं बचत", "मंडी बचत")}</th>
                    <th className="py-3 px-3">{t("Logistics Loop", "1-ट्रक लॉजिस्टिक्स", "गाड़ी लूप")}</th>
                    <th className="py-3 px-4 text-right">{t("Procurement Actions", "खरीद कार्रवाई", "कार्रवाई")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                  {processedLots.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500 font-medium">
                        {t("No wholesale lots found matching your filter criteria.", "कोई लॉट नहीं मिला।", "कोई लॉट नइ मिलिस।")}
                      </td>
                    </tr>
                  ) : (
                    processedLots.map((lot) => {
                      const benchmark = BENCHMARK_MANDI[lot.crop_type] || lot.price_per_kg * 1.18;
                      const savingsPerKg = Math.max(0, benchmark - lot.price_per_kg);
                      const savingsPct = Math.round((savingsPerKg / benchmark) * 100);
                      const totalLotSavings = savingsPerKg * lot.total_quantity_kg;
                      const emoji = CROP_EMOJIS[lot.crop_type] || "🌾";

                      return (
                        <tr key={lot.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Crop & Lot ID */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl p-1 bg-slate-100 rounded-lg border border-slate-200">{emoji}</span>
                              <div>
                                <div className="font-bold text-slate-900 font-display flex items-center gap-1.5">
                                  <span>{lot.crop_type}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">#{lot.id}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">
                                  {lot.centroid.district || "Raipur Hub"}, {lot.centroid.address || "Chhattisgarh"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Grade */}
                          <td className="py-3.5 px-3">
                            <Badge variant={lot.grade === "A" ? "gradeA" : "warning"} size="sm" className="font-bold">
                              Grade {lot.grade}
                            </Badge>
                          </td>

                          {/* Volume & Pooled Farmers */}
                          <td className="py-3.5 px-3">
                            <div>
                              <div className="font-black text-slate-900 tabular-nums">
                                {lot.total_quantity_kg.toLocaleString("en-IN")} {t("kg", "किलो", "किलो")}
                              </div>
                              <div className="text-[11px] text-slate-500 font-semibold tabular-nums">
                                ({(lot.total_quantity_kg / 100).toFixed(1)} {t("Quintal", "क्विंटल", "क्विंटल")})
                              </div>
                              <div className="text-[10px] text-emerald-800 font-bold mt-0.5">
                                • {lot.listings_count || 3} {t("farmers pooled", "किसान शामिल", "किसान शामिल")}
                              </div>
                            </div>
                          </td>

                          {/* Target Price */}
                          <td className="py-3.5 px-3">
                            <div className="font-black text-base text-emerald-800 tabular-nums font-display">
                              ₹{lot.price_per_kg.toFixed(2)}
                              <span className="text-[10px] font-normal text-slate-500">/{t("kg", "किलो", "किलो")}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium tabular-nums">
                              {t("Lot Value", "कुल मूल्य", "कुल मूल्य")}: ₹{(lot.price_per_kg * lot.total_quantity_kg).toLocaleString("en-IN")}
                            </div>
                          </td>

                          {/* Mandi Benchmark & Net Savings */}
                          <td className="py-3.5 px-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center text-[10px] font-bold text-emerald-900 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                                  Save {savingsPct}% vs Mandi
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium">
                                Mandi Benchmark: ₹{benchmark.toFixed(1)}/kg
                              </div>
                              <div className="text-[10px] text-emerald-800 font-bold tabular-nums">
                                Net Lot Margin: +₹{Math.round(totalLotSavings).toLocaleString("en-IN")}
                              </div>
                            </div>
                          </td>

                          {/* 1-Truck Logistics */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Truck className="h-4 w-4 text-blue-700 shrink-0" />
                              <div>
                                <span className="text-[11px] font-bold text-slate-900 block">{t("1-Truck Loop", "1-ट्रक लूप", "1-गाड़ी लूप")}</span>
                                <span className="text-[10px] text-blue-800 font-semibold">{t("Single Pickup Hub", "एकल पिकअप केंद्र", "एकल पिकअप")}</span>
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSimulatorCrop(lot.crop_type)}
                                className="h-8 text-[11px] font-bold px-2.5"
                                title="Simulate Wholesale Profit Impact"
                              >
                                <Calculator className="h-3.5 w-3.5 mr-1 text-slate-600" />
                                {t("ROI", "बचत", "बचत")}
                              </Button>
                              <Button
                                size="sm"
                                variant="buyer"
                                onClick={() => setSelectedLot(lot)}
                                className="h-8 text-[11px] font-bold px-3 shadow-xs"
                              >
                                <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                                {t("Order", "ऑर्डर", "ऑर्डर")}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. REGIONAL GEOGRAPHIC MAP VIEW */}
        {activeTab === "wholesale_pools" && viewMode === "map" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-300 overflow-hidden h-[500px] relative shadow-xs">
              <LeafletMap
                center={userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : { lat: 21.28, lng: 81.65 }}
                lots={processedLots}
                selectedLot={selectedLot}
                onSelectLot={setSelectedLot}
                selectedLocation={
                  nearbyEnabled && userLocation
                    ? { lat: userLocation.lat, lng: userLocation.lng, address: "Buyer Procurement Point" }
                    : null
                }
                height="h-full"
              />
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-950 font-semibold">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-800" />
                <span>{t("Showing collection hub locations for all aggregated regional wholesale lots.", "सभी एकत्रित क्षेत्रीय लॉट के संग्रह केंद्र प्रदर्शित हैं।", "सबो क्षेत्रीय लॉट के संग्रह केंद्र दिखत हे।")}</span>
              </div>
              <span className="font-mono text-blue-900">{processedLots.length} {t("Hubs Active", "केंद्र सक्रिय", "केंद्र सक्रिय")}</span>
            </div>
          </div>
        )}

        {/* Embedded Profit Simulator Modal */}
        {simulatorCrop && (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setSimulatorCrop(null)}
          >
            <div
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 relative animate-in zoom-in-95 duration-150 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-800" />
                  <h2 className="text-xl font-bold text-slate-900 font-display">
                    {t("Wholesale Procurement Profit & Margin Simulator", "थोक खरीद लाभ एवं मार्जिन सिमुलेटर", "थोक खरीद बचत सिमुलेटर")}
                  </h2>
                </div>
                <button
                  onClick={() => setSimulatorCrop(null)}
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <ProfitImpactSimulator
                initialCrop={simulatorCrop}
                initialPerspective="buyer"
                initialVolumeKg={5000}
              />
            </div>
          </div>
        )}

        {/* Lot Order Modal */}
        {selectedLot && (
          <LotDetailModal
            lot={selectedLot}
            onClose={() => setSelectedLot(null)}
            onOrderConfirm={(lot, qty) => handleOrderConfirmed(lot, qty)}
          />
        )}

        <DemoPaymentModal 
          isOpen={isDemoPaymentOpen}
          onClose={() => { setIsDemoPaymentOpen(false); setDemoPaymentItem(null); }}
          item={demoPaymentItem}
          onSuccess={(res) => {
            fetchFarmerListings();
            fetchLots();
            setOrderSuccessNotice(`Demo Escrow Authorized! Transaction: ${res.transaction_id}`);
          }}
        />
      </div>
    </div>
  );
}
