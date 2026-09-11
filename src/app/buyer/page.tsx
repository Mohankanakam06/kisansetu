"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Lot } from "@/types";
import { apiService } from "@/services/api";
import LotCard from "@/components/buyer/LotCard";
import LotDetailModal from "@/components/buyer/LotDetailModal";
import { Button, Card, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/language";
import {
  Search,
  ShoppingCart,
  Grid,
  Map,
  X,
  CheckCircle,
  Truck,
  Sparkles,
  ShieldCheck,
  PackageCheck,
  Filter,
  TrendingUp,
  LocateFixed,
} from "lucide-react";

// Client-only dynamic Leaflet Map to avoid SSR errors
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-medium text-sm">
      Loading interactive map...
    </div>
  ),
});

const CROPS: string[] = ["All", "Tomato", "Onion", "Potato", "Wheat", "Rice", "Soybean", "Chilli", "Cotton"];
const GRADES: string[] = ["All", "A", "B", "C"];

export default function BuyerPage() {
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kisansetu_user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === "farmer") {
          window.location.href = "/farmer";
        }
      } else {
        window.location.href = "/login";
      }
    } catch(e) {}
  }, []);

  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [orderingLot, setOrderingLot] = useState<Lot | null>(null);
  const [cropFilter, setCropFilter] = useState<string>("All");
  const [gradeFilter, setGradeFilter] = useState<string>("All");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [nearbyRadiusKm, setNearbyRadiusKm] = useState(10);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const getMyLocation = async () => {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setNearbyEnabled(true);
        setLocating(false);
      },
      () => {
        setNearbyEnabled(false);
        setLocating(false);
      }
    );
  };

  const fetchLots = async () => {
    setIsLoading(true);
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
      setLots(res.lots);
      if (res.lots.length > 0 && !selectedLot) {
        setSelectedLot(res.lots[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
    // Real-time updates for new clusters
    const interval = setInterval(() => {
      fetchLots();
    }, 15000);
    return () => clearInterval(interval);
  }, [cropFilter, gradeFilter, priceMin, priceMax, searchQuery, nearbyEnabled, nearbyRadiusKm, userLocation]);

  const clearFilters = () => {
    setCropFilter("All");
    setGradeFilter("All");
    setPriceMin("");
    setPriceMax("");
    setSearchQuery("");
  };

  const handleOrderConfirm = async (lot: Lot, qty: number) => {
    const res = await apiService.createOrder({
      buyer_id: "buyer-001",
      lot_id: lot.id,
      quantity_kg: qty,
    });
    setOrderingLot(null);
    setOrderSuccess(res);
    fetchLots();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#EBECE8]">
      {/* Mandi & The Soil Header Section */}
      <div className="border-b-2 border-[#1E1F1C] bg-[#EBECE8] py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-sm bg-[#1B4965] text-white flex items-center justify-center border-2 border-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C]">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-black text-[#1E1F1C] font-display tracking-tight">
                {t("Wholesale Produce Marketplace", "थोक उपज बाज़ार", "थोक उपज बाज़ार")}
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#52544D] max-w-2xl leading-relaxed">
              {t(
                "Directly pooled AI-certified produce lots. Compare real-time cluster data and place wholesale orders without middlemen.",
                "सीधे एकत्रित AI-प्रमाणित उपज लॉट। मध्यस्थों के बिना वास्तविक समय क्लस्टर डेटा की तुलना करें और थोक ऑर्डर दें।",
                "सीधा एकत्रित AI-प्रमाणित उपज लॉट। बिचौलिया बिना ऑर्डर करव।"
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="buyer" size="sm">
                <ShieldCheck className="h-3 w-3" /> {t("0% Broker Fee", "0% ब्रोकर शुल्क", "0% ब्रोकर शुल्क")}
              </Badge>
              <Badge variant="verified" size="sm">
                <PackageCheck className="h-3 w-3" /> {t("AI Certified Lots", "AI प्रमाणित लॉट", "AI प्रमाणित लॉट")}
              </Badge>
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-3">
            <div className="flex rounded-sm border-2 border-[#1E1F1C] bg-white p-1 shadow-[2px_2px_0_0_#1E1F1C]">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-sm transition-all cursor-pointer ${
                  viewMode === "grid" ? "bg-[#1B4965] text-white" : "text-[#1E1F1C] hover:bg-[#EBECE8]"
                }`}
              >
                <Grid className="h-3.5 w-3.5" /> {t("Grid View", "ग्रिड दृश्य", "ग्रिड")}
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-sm transition-all cursor-pointer ${
                  viewMode === "map" ? "bg-[#1B4965] text-white" : "text-[#1E1F1C] hover:bg-[#EBECE8]"
                }`}
              >
                <Map className="h-3.5 w-3.5" /> {t("Live Geo-Cluster Map", "लाइव जियो-क्लस्टर मैप", "लाइव मैप")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 shrink-0 space-y-6">
            <Card className="border-2 border-[#1E1F1C] bg-white p-5 shadow-[3px_3px_0_0_#1E1F1C] space-y-5 rounded-sm">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E1F1C]">
                <span className="text-xs font-black text-[#1E1F1C] uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#1B4965]" /> {t("Filters", "फिल्टर", "फिल्टर")}
                </span>
                {(cropFilter !== "All" || gradeFilter !== "All" || priceMin || priceMax || searchQuery) && (
                  <button onClick={clearFilters} className="text-[10px] font-black uppercase text-[#C04A22] hover:underline cursor-pointer">
                    {t("Clear All", "सभी साफ करें", "सब साफ करव")}
                  </button>
                )}
              </div>

              {/* Crop Filter */}
              <div>
                <label className="block text-[10px] font-black text-[#52544D] mb-2 uppercase tracking-wider">{t("Produce Type", "उपज प्रकार", "फसल प्रकार")}</label>
                <div className="flex flex-wrap gap-1.5">
                  {CROPS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCropFilter(c)}
                      className={`px-2.5 py-1 rounded-sm text-[11px] font-bold border-2 transition-all cursor-pointer ${
                        cropFilter === c
                          ? "bg-[#1B4965] text-white border-[#1E1F1C] shadow-[1.5px_1.5px_0_0_#1E1F1C]"
                          : "bg-[#EBECE8] text-[#1E1F1C] border-[#1E1F1C] hover:bg-white"
                      }`}
                    >
                      {c === "All" ? t("All", "सभी", "सब") : c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade Filter */}
              <div>
                <label className="block text-[10px] font-black text-[#52544D] mb-2 uppercase tracking-wider">{t("Quality Grade", "गुणवत्ता ग्रेड", "ग्रेड")}</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGradeFilter(g)}
                      className={`py-1.5 rounded-sm text-xs font-bold border-2 text-center transition-all cursor-pointer ${
                        gradeFilter === g
                          ? "bg-[#1B4965] text-white border-[#1E1F1C] shadow-[1.5px_1.5px_0_0_#1E1F1C]"
                          : "bg-[#EBECE8] text-[#1E1F1C] border-[#1E1F1C] hover:bg-white"
                      }`}
                    >
                      {g === "All" ? t("All Grades", "सभी ग्रेड", "सब ग्रेड") : `${t("Grade", "ग्रेड", "ग्रेड")} ${g}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-[10px] font-black text-[#52544D] mb-2 uppercase tracking-wider">{t("Price Range (₹/kg)", "मूल्य सीमा (₹/किग्रा)", "भाव (₹/किलो)")}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder={t("Min", "न्यूनतम", "कम")}
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full rounded-sm border-2 border-[#1E1F1C] bg-[#EBECE8] px-2.5 py-1.5 text-xs font-bold text-[#1E1F1C] focus:bg-white focus:outline-none transition-all tabular-nums"
                  />
                  <span className="text-[#1E1F1C] font-black text-xs">-</span>
                  <input
                    type="number"
                    placeholder={t("Max", "अधिकतम", "ज्यादा")}
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full rounded-sm border-2 border-[#1E1F1C] bg-[#EBECE8] px-2.5 py-1.5 text-xs font-bold text-[#1E1F1C] focus:bg-white focus:outline-none transition-all tabular-nums"
                  />
                </div>
              </div>

              {/* Nearby discovery */}
              <div>
                <label className="block text-[10px] font-black text-[#52544D] mb-2 uppercase tracking-wider">
                  {t("Nearby Lots", "पास के लॉट", "पास के लॉट")}
                </label>

                <button
                  type="button"
                  onClick={getMyLocation}
                  disabled={locating}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-sm text-xs font-bold border-2 border-[#1E1F1C] transition-all cursor-pointer ${
                    nearbyEnabled
                      ? "bg-[#d9e9f2] text-[#1B4965] shadow-[2px_2px_0_0_#1E1F1C]"
                      : "bg-[#EBECE8] text-[#1E1F1C] hover:bg-white"
                  }`}
                >
                  <LocateFixed className="h-4 w-4 text-[#1B4965]" />
                  {locating
                    ? t("Locating...", "लोकेट हो रहा...", "लोकेट होत हे...")
                    : nearbyEnabled
                      ? t(`Within ${nearbyRadiusKm}km`, `${nearbyRadiusKm}किमी के अंदर`, `${nearbyRadiusKm}किमी म`)
                      : t("Use my location", "मेरी लोकेशन", "मोर लोकेशन")}
                </button>

                {userLocation && nearbyEnabled && (
                  <div className="mt-2 flex gap-1.5">
                    {[5, 10, 20].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setNearbyRadiusKm(r)}
                        className={`flex-1 px-2 py-1 rounded-sm text-[11px] font-bold border-2 transition-all cursor-pointer ${
                          nearbyRadiusKm === r
                            ? "bg-[#1B4965] text-white border-[#1E1F1C]"
                            : "bg-[#EBECE8] text-[#1E1F1C] border-[#1E1F1C] hover:bg-white"
                        }`}
                      >
                        {r}km
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Live AI Insight Pill */}
              <div className="p-3 rounded-sm bg-[#d7e8db] border-2 border-[#1E1F1C] flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-[#386641] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-black text-[#112816] uppercase">{t("Live Cluster Insight", "लाइव क्लस्टर इनसाइट", "AI जानकारी")}</p>
                  <p className="text-[11px] font-bold text-[#112816]/80 mt-1 leading-normal">
                    {t(
                      "8 active lots ready for dispatch. Premium Grade-A clusters detected in Raipur hub today.",
                      "8 सक्रिय लॉट रवानगी के लिए तैयार हैं। आज रायपुर हब में प्रीमियम ग्रेड-A क्लस्टर उपलब्ध हैं।",
                      "8 लॉट रवानगी बर तैयार हे। रायपुर हब म प्रीमियम ग्रेड-A लॉट उपलब्ध हे।"
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </aside>

          {/* Main Area */}
          <div className="flex-1 min-w-0">
            {/* Search Input */}
            <div className="mb-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52544D]" />
              <input
                type="text"
                placeholder={t("Search produce, hub, or batch code...", "फसल, हब या बैच कोड से खोजें...", "फसल, हब या बैच कोड ले खोजव...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-sm border-2 border-[#1E1F1C] bg-white pl-10 pr-4 py-3 text-xs sm:text-sm font-bold text-[#1E1F1C] placeholder:text-[#52544D] shadow-[3px_3px_0_0_#1E1F1C] focus:outline-none transition-all"
              />
            </div>

            {/* Map View */}
            {viewMode === "map" && (
              <div className="rounded-sm border-2 border-[#1E1F1C] overflow-hidden bg-white shadow-[4px_4px_0_0_#1E1F1C] mb-8 h-[550px] relative">
                <div className="absolute top-3 left-3 z-10 bg-white px-3 py-1.5 rounded-sm border-2 border-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C] flex items-center gap-2">
                  <Map className="w-3.5 h-3.5 text-[#1B4965]" />
                  <span className="text-xs font-black text-[#1E1F1C] uppercase">{t("Live Geo-Cluster Map", "लाइव जियो-क्लस्टर मैप", "लाइव मैप")}</span>
                  <span className="w-2 h-2 rounded-full bg-[#386641] animate-ping" />
                </div>
                <LeafletMap
                  lots={lots}
                  selectedLot={selectedLot}
                  onSelectLot={(lot) => setSelectedLot(lot)}
                  height="h-full"
                />
              </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {lots.map((lot) => (
                  <LotCard
                    key={lot.id}
                    lot={lot}
                    onOrderClick={() => setOrderingLot(lot)}
                  />
                ))}
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-72 rounded-sm bg-white border-2 border-[#1E1F1C] p-4 animate-pulse shadow-[3px_3px_0_0_#1E1F1C]">
                    <div className="h-36 bg-[#EBECE8] border-2 border-[#1E1F1C] rounded-sm mb-4" />
                    <div className="h-4 bg-[#EBECE8] rounded-sm w-2/3 mb-2" />
                    <div className="h-3 bg-[#EBECE8] rounded-sm w-1/2 mb-2" />
                    <div className="h-8 bg-[#EBECE8] border-2 border-[#1E1F1C] rounded-sm w-full mt-4" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && lots.length === 0 && (
              <div className="rounded-sm border-2 border-[#1E1F1C] bg-white p-12 text-center shadow-[4px_4px_0_0_#1E1F1C]">
                <ShoppingCart className="mx-auto h-10 w-10 text-[#52544D] mb-3" />
                <h3 className="text-base font-black text-[#1E1F1C] uppercase font-display">{t("No matching produce lots", "कोई मिलती-जुलती उपज नहीं", "कोनो उपज नइ मिलिस")}</h3>
                <p className="text-xs font-bold text-[#52544D] mt-1 max-w-sm mx-auto">
                  {t("Try adjusting your filters or search for another crop cluster.", "अपने फिल्टर बदलें या किसी अन्य फसल क्लस्टर की खोज करें।", "फिल्टर बदलव या दूसर फसल खोजव।")}
                </p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={clearFilters}>
                  {t("Reset All Filters", "सभी फिल्टर रीसेट करें", "सब फिल्टर रीसेट करव")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {orderingLot && (
        <LotDetailModal
          lot={orderingLot}
          onClose={() => setOrderingLot(null)}
          onOrderConfirm={handleOrderConfirm}
        />
      )}

      {/* Success Notification */}
      {orderSuccess && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md rounded-sm bg-white text-[#1E1F1C] p-4 border-2 border-[#1E1F1C] shadow-[5px_5px_0_0_#1E1F1C] flex items-start gap-3">
          <div className="h-8 w-8 rounded-sm bg-[#d7e8db] border-2 border-[#1E1F1C] flex items-center justify-center shrink-0">
            <CheckCircle className="h-4 w-4 text-[#386641]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black uppercase text-[#1E1F1C]">{t("Order placed successfully", "ऑर्डर सफलतापूर्वक दर्ज", "ऑर्डर बढ़िया से दर्ज हो गे")}</p>
            <p className="text-xs font-bold text-[#52544D] mt-0.5">
              {t("Order ID", "ऑर्डर संख्या", "ऑर्डर नंबर")}: <span className="font-mono text-[#1E1F1C] font-bold">{orderSuccess.order_id}</span>
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Link
                href="/orders"
                className="text-xs font-black text-[#1B4965] hover:underline flex items-center gap-1"
              >
                {t("Track in Logistics →", "लॉजिस्टिक्स में ट्रैक करें →", "लॉजिस्टिक्स म देखव →")}
              </Link>
            </div>
          </div>
          <button onClick={() => setOrderSuccess(null)} className="text-[#52544D] hover:text-[#1E1F1C] p-1 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
