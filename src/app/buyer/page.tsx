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
    <div className="flex-1 flex flex-col bg-[#fafbf9]">
      {/* Premium Header Section */}
      <div className="border-b border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">
                {t("Wholesale Produce Marketplace", "थोक उपज बाज़ार", "थोक उपज बाज़ार")}
              </h1>
            </div>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              {t(
                "Directly pooled AI-certified produce lots. Compare real-time cluster data and place wholesale orders without middlemen.",
                "सीधे एकत्रित AI-प्रमाणित उपज लॉट। मध्यस्थों के बिना वास्तविक समय क्लस्टर डेटा की तुलना करें और थोक ऑर्डर दें।",
                "सीधा एकत्रित AI-प्रमाणित उपज लॉट। बिचौलिया बिना ऑर्डर करव।"
              )}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> {t("0% Broker Fee", "0% ब्रोकर शुल्क", "0% ब्रोकर शुल्क")}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <PackageCheck className="h-3.5 w-3.5 text-emerald-600" /> {t("AI Certified Lots", "AI प्रमाणित लॉट", "AI प्रमाणित लॉट")}
              </span>
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-xs">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  viewMode === "grid" ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Grid className="h-4 w-4" /> {t("Grid View", "ग्रिड दृश्य", "ग्रिड")}
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  viewMode === "map" ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Map className="h-4 w-4" /> {t("Live Geo-Cluster Map", "लाइव जियो-क्लस्टर मैप", "लाइव मैप")}
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
            <Card className="border-slate-200 bg-white p-6 shadow-sm space-y-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-emerald-700" /> {t("Filters", "फिल्टर", "फिल्टर")}
                </span>
                {(cropFilter !== "All" || gradeFilter !== "All" || priceMin || priceMax || searchQuery) && (
                  <button onClick={clearFilters} className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                    {t("Clear All", "सभी साफ करें", "सब साफ करव")}
                  </button>
                )}
              </div>

              {/* Crop Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">{t("Produce Type", "उपज प्रकार", "फसल प्रकार")}</label>
                <div className="flex flex-wrap gap-1.5">
                  {CROPS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCropFilter(c)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        cropFilter === c
                          ? "bg-emerald-700 text-white shadow-sm"
                          : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {c === "All" ? t("All", "सभी", "सब") : c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">{t("Quality Grade", "गुणवत्ता ग्रेड", "ग्रेड")}</label>
                <div className="flex gap-2">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGradeFilter(g)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border text-center transition-all ${
                        gradeFilter === g
                          ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {g === "All" ? t("All", "सभी", "सब") : `${t("Grade", "ग्रेड", "ग्रेड")} ${g}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">{t("Price Range (₹/kg)", "मूल्य सीमा (₹/किग्रा)", "भाव (₹/किलो)")}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder={t("Min", "न्यूनतम", "कम")}
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
                  />
                  <span className="text-slate-400 font-bold text-xs">to</span>
                  <input
                    type="number"
                    placeholder={t("Max", "अधिकतम", "ज्यादा")}
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              {/* Nearby discovery */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">
                  {t("Nearby Lots", "पास के लॉट", "पास के लॉट")}
                </label>

                <button
                  type="button"
                  onClick={getMyLocation}
                  disabled={locating}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    nearbyEnabled
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <LocateFixed className="h-4 w-4 text-emerald-700" />
                  {locating
                    ? t("Locating...", "लोकेट हो रहा...", "लोकेट होत हे...")
                    : nearbyEnabled
                      ? t(`Nearby within ${nearbyRadiusKm}km`, `आसपास ${nearbyRadiusKm}किमी`, `आसपास ${nearbyRadiusKm}किमी`)
                      : t("Use my location", "मेरी लोकेशन", "मोर लोकेशन")}
                </button>

                {userLocation && nearbyEnabled && (
                  <div className="mt-2 flex gap-2">
                    {[5, 10, 20].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setNearbyRadiusKm(r)}
                        className={`flex-1 px-2 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                          nearbyRadiusKm === r
                            ? "bg-emerald-700 text-white border-emerald-700"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {r}km
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Live AI Insight Pill */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">{t("Live AI Cluster Insight", "लाइव AI क्लस्टर इनसाइट", "AI जानकारी")}</p>
                  <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                    {t(
                      "8 active lots are ready for dispatch. 2 new premium Grade-A clusters detected in Raipur hub this morning.",
                      "8 सक्रिय लॉट रवानगी के लिए तैयार हैं। आज सुबह रायपुर हब में 2 नई प्रीमियम ग्रेड-A क्लस्टर का पता चला।",
                      "8 लॉट रवानगी बर तैयार हे। रायपुर म 2 नवा प्रीमियम ग्रेड-A लॉट आ गिस।"
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </aside>

          {/* Main Area */}
          <div className="flex-1 min-w-0">
            {/* Search Input */}
            <div className="mb-8 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder={t("Search by crop, hub, or farmer name...", "फसल, हब या किसान के नाम से खोजें...", "फसल, हब या नाम ले खोजव...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 shadow-sm transition-all"
              />
            </div>

            {/* Map View */}
            {viewMode === "map" && (
              <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-card mb-8 h-[600px] relative">
                <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                  <Map className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-slate-900">{t("Live Geo-Cluster Map", "लाइव जियो-क्लस्टर मैप", "लाइव मैप")}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-80 rounded-3xl bg-white border border-slate-200 p-6 animate-pulse shadow-sm">
                    <div className="h-40 bg-slate-100 rounded-2xl mb-5" />
                    <div className="h-5 bg-slate-100 rounded w-2/3 mb-3" />
                    <div className="h-4 bg-slate-100 rounded w-1/2 mb-2" />
                    <div className="h-8 bg-slate-100 rounded w-full mt-4" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && lots.length === 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-card">
                <ShoppingCart className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">{t("No matching produce lots", "कोई मिलती-जुलती उपज नहीं", "कोनो उपज नइ मिलिस")}</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                  {t("Try adjusting your filters or search for another crop cluster.", "अपने फिल्टर बदलें या किसी अन्य फसल क्लस्टर की खोज करें।", "फिल्टर बदलव या दूसर फसल खोजव।")}
                </p>
                <Button variant="secondary" size="sm" className="mt-6" onClick={clearFilters}>
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
        <div className="fixed bottom-6 right-6 z-50 max-w-md rounded-2xl bg-slate-900 text-white p-5 shadow-2xl border border-slate-800 flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold">{t("Order placed successfully", "ऑर्डर सफलतापूर्वक दर्ज", "ऑर्डर बढ़िया से दर्ज हो गे")}</p>
            <p className="text-xs text-slate-400 mt-1">
              {t("Order ID", "ऑर्डर संख्या", "ऑर्डर नंबर")}: <span className="font-mono text-slate-200 font-bold">{orderSuccess.order_id}</span>
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Link
                href="/orders"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                {t("Track in Logistics →", "लॉजिस्टिक्स में ट्रैक करें →", "लॉजिस्टिक्स म देखव →")}
              </Link>
            </div>
          </div>
          <button onClick={() => setOrderSuccess(null)} className="text-slate-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
