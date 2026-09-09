"use client";
import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Order, OptimizeRouteResponse, SettlementPayoutResponse } from "@/types";
import { apiService } from "@/services/api";
import { Button, Card, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/language";
import {
  Truck,
  Route,
  Wallet,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  IndianRupee,
  Navigation,
  Package,
  Settings,
  Search,
  Layers,
  History,
  X,
  Fuel,
  Leaf,
  Activity,
  Zap,
  Check,
  Thermometer,
  Battery,
  UserCircle2,
  Lock,
} from "lucide-react";

// Client-only dynamic Leaflet Map to avoid SSR errors
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-500 font-semibold">
      Loading dispatch control map...
    </div>
  ),
});

const statusPillColor: Record<string, string> = {
  placed: "bg-slate-100 text-slate-700 border-slate-200",
  routed: "bg-blue-100 text-blue-800 border-blue-200",
  picked_up: "bg-amber-100 text-amber-900 border-amber-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  settled: "bg-emerald-700 text-white border-emerald-700",
};

export default function OrdersPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [routeData, setRouteData] = useState<OptimizeRouteResponse | null>(null);
  const [payoutData, setPayoutData] = useState<SettlementPayoutResponse | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [routingViewMode, setRoutingViewMode] = useState<"ai_clustered" | "traditional">("ai_clustered");
  const [otpDispatch, setOtpDispatch] = useState("");
  const [otpDelivery, setOtpDelivery] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [driverETA, setDriverETA] = useState(25); // minutes

  const loadOrders = async () => {
    try {
      const res = await apiService.getOrders();
      setOrders(res.orders);
      if (res.orders.length > 0 && !selectedOrder) {
        setSelectedOrder(res.orders[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Simulate driver ETA countdown
  useEffect(() => {
    if (driverETA <= 0) return;
    const timer = setInterval(() => {
      setDriverETA((prev) => Math.max(0, prev - 1));
    }, 60000); // 1 min
    return () => clearInterval(timer);
  }, [driverETA]);

  const handleVerifyOTP = async (type: "pickup" | "delivery") => {
    const otp = type === "pickup" ? otpDispatch : otpDelivery;
    if (!otp || otp.length < 4) return;
    setVerificationLoading(true);
    // Simulate verification
    setTimeout(() => {
      if (type === "pickup") {
        handleTriggerPayout(selectedOrder?.id!, "pickup");
      } else {
        handleTriggerPayout(selectedOrder?.id!, "delivery");
      }
      setVerificationLoading(false);
      if (type === "pickup") setOtpDispatch("");
      else setOtpDelivery("");
    }, 1500);
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === "All") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const handleOptimizeRoute = async (orderId: string) => {
    setIsOptimizing(true);
    try {
      const res = await apiService.optimizeRoute(orderId);
      setRouteData(res);
      await loadOrders();
    } catch (e) {
      console.error(e);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleTriggerPayout = async (orderId: string, stage: "pickup" | "delivery") => {
    setIsSettling(true);
    try {
      const res = await apiService.triggerSettlement(orderId, stage);
      setPayoutData(res);
      await loadOrders();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSettling(false);
    }
  };

  const currentStops = routeData?.stops || [
    { lat: 21.2514, lng: 81.6296, label: "Mandi Pickup Point 1 (Birgaon)", time: "10:30 AM", status: "completed", kg: "850 kg" },
    { lat: 21.1938, lng: 81.65, label: "Village Farm Pickup 2 (Abhanpur)", time: "11:15 AM", status: "in_progress", kg: "1,200 kg" },
    { lat: 21.23, lng: 81.67, label: "Central Buyer Hub (Raipur Mandi)", time: "12:45 PM", status: "pending", kg: "Drop 2,050 kg" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f8faf9] min-h-[calc(100vh-4rem)]">
      {/* Control Room Top Header */}
      <div className="border-b border-slate-200 bg-white py-5 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 border border-emerald-300">
                <Activity className="h-3.5 w-3.5 text-emerald-600 animate-pulse" /> {t("Live Telemetry", "लाइव टेलीमेट्री", "लाइव टेलीमेट्री")}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t("Raipur Cluster Dispatch Control", "रायपुर क्लस्टर प्रेषण नियंत्रण", "रायपुर क्लस्टर गाड़ी नियंत्रण")}
              </span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-emerald-950">
              {t("Logistics & Route Optimization Engine", "लॉजिस्टिक्स एवं मार्ग अनुकूलन इंजन", "लॉजिस्टिक्स आ रस्ता अनुकूलन इंजन")}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:px-4 py-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-emerald-700" />
                <span className="whitespace-nowrap">3 {t("Vehicles", "गाड़ियां", "गाड़ी मन")}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <Leaf className="h-4 w-4 text-emerald-600" />
                <span className="whitespace-nowrap">-68% {t("Carbon", "कार्बन", "कार्बन")}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={loadOrders} className="rounded-xl">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Control Room Grid */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col xl:flex-row gap-8">
        {/* Left Column: Consolidated Orders & Route Stats */}
        <div className="w-full xl:w-5/12 flex flex-col gap-6">
          {/* AI vs Traditional Route Comparison Bento */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
                  {t("Routing Comparison Engine", "रूटिंग तुलना इंजन", "रूटिंग तुलना इंजन")}
                </p>
                <h3 className="font-display text-base font-bold text-slate-900">
                  {t("AI Clustered vs Traditional Trips", "AI क्लस्टर्ड बनाम पारंपरिक यात्राएं", "AI क्लस्टर्ड बनाम पुराना तरीका")}
                </h3>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedOrder}
                isLoading={isOptimizing}
                onClick={() => selectedOrder && handleOptimizeRoute(selectedOrder.id)}
                className="rounded-xl shadow-glow"
              >
                <Navigation className="h-4 w-4 mr-1" /> {t("Optimize", "रूट बनाएं", "रस्ता बनाव")}
              </Button>
            </div>

            {/* Toggle switch between AI and Traditional */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setRoutingViewMode("ai_clustered")}
                className={`flex-1 rounded-lg py-2 px-1 text-[11px] sm:text-xs font-bold transition-all text-center leading-tight ${
                  routingViewMode === "ai_clustered"
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ✨ {t("AI Clustered (1 Trip)", "AI क्लस्टर्ड (1 ट्रिप)", "AI क्लस्टर्ड (1 ट्रिप)")}
              </button>
              <button
                onClick={() => setRoutingViewMode("traditional")}
                className={`flex-1 rounded-lg py-2 px-1 text-[11px] sm:text-xs font-bold transition-all text-center leading-tight ${
                  routingViewMode === "traditional"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ⚠️ {t("Traditional (4 Trips)", "पारंपरिक (4 ट्रिप)", "पुराना (4 ट्रिप)")}
              </button>
            </div>

            {/* Dynamic Comparison Cards */}
            {routingViewMode === "ai_clustered" ? (
              <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-800 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-emerald-600" /> {t("Clustered Single Loop", "क्लस्टर्ड सिंगल लूप", "क्लस्टर्ड सिंगल लूप")}
                  </span>
                  <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-black">
                    72% {t("SAVINGS", "बचत", "बचत")}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white p-2 border border-emerald-100">
                    <p className="text-[10px] font-bold text-slate-400">{t("Total Dist.", "कुल दूरी", "कुल दूरी")}</p>
                    <p className="text-base font-black text-emerald-900">{routeData?.distance_km || 38.4} {t("km", "किमी", "किमी")}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-emerald-100">
                    <p className="text-[10px] font-bold text-slate-400">{t("Duration", "समय", "समै")}</p>
                    <p className="text-base font-black text-emerald-900">{routeData?.duration_minutes || 64} {t("min", "मिनट", "मिनट")}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-emerald-100">
                    <p className="text-[10px] font-bold text-slate-400">{t("CO₂ Saved", "CO₂ बचत", "CO₂ बचत")}</p>
                    <p className="text-base font-black text-emerald-600">+{routeData?.carbon_saved_kg || 28.4} {t("kg", "किग्रा", "किलो")}</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-emerald-800/80">
                  {t("Consolidates 4 separate smallholder pickups into 1 optimized electric/diesel route.", "4 अलग-अलग किसानों के पिकअप को 1 अनुकूलित वाहन रूट में समेकित करता है।", "4 अलग-अलग किसान के पिकअप ला 1 बढ़िया गाड़ी रस्ता म जमा करथे।")}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-amber-800 flex items-center gap-1.5">
                    <Fuel className="h-4 w-4 text-amber-600" /> {t("Individual Farm Trips", "व्यक्तिगत खेत यात्राएं", "अलग-अलग खेत के फेरा")}
                  </span>
                  <span className="rounded-full bg-amber-600 text-white px-2 py-0.5 text-[10px] font-black">
                    {t("HIGH COST", "उच्च लागत", "ज्यादा खर्चा")}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white p-2 border border-amber-100">
                    <p className="text-[10px] font-bold text-slate-400">{t("Total Dist.", "कुल दूरी", "कुल दूरी")}</p>
                    <p className="text-base font-black text-amber-900">{routeData?.individual_distance_km || 136.2} {t("km", "किमी", "किमी")}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-amber-100">
                    <p className="text-[10px] font-bold text-slate-400">{t("Duration", "समय", "समै")}</p>
                    <p className="text-base font-black text-amber-900">240 {t("min", "मिनट", "मिनट")}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-amber-100">
                    <p className="text-[10px] font-bold text-slate-400">{t("Fuel Cost", "ईंधन खर्च", "तेल खर्चा")}</p>
                    <p className="text-base font-black text-amber-900">₹2,840</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-amber-800/80">
                  {t("Every farmer independently drives to APMC mandi, causing traffic congestion & fuel waste.", "प्रत्येक किसान स्वतंत्र रूप से मंडी जाता है, जिससे भीड़भाड़ और ईंधन की बर्बादी होती है।", "हर किसान अलग-अलग मंडी जाथे, जेकर से भीड़ आ डीजल के नुकसानी होथे।")}
                </p>
              </div>
            )}
          </div>

          {/* Consolidated Orders List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-slate-900">{t("Orders in Dispatch", "प्रेषण में ऑर्डर", "गाड़ी म ऑर्डर")}</h3>
                <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
                  {filteredOrders.length}
                </span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600"
              >
                <option value="All">{t("All Status", "सभी स्थिति", "सब स्थिति")}</option>
                <option value="placed">{t("Placed", "दर्ज", "दर्ज")}</option>
                <option value="routed">{t("Routed", "रूट बना", "रस्ता बन गे")}</option>
                <option value="picked_up">{t("Picked Up", "पिकअप हुआ", "उठा ले गे")}</option>
                <option value="delivered">{t("Delivered", "पहुंच गया", "पहुंच गे")}</option>
                <option value="settled">{t("Settled", "भुगतान पूरा", "पैसा मिल गे")}</option>
              </select>
            </div>

            <div className="space-y-2.5">
              {filteredOrders.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">{t("No orders matching filter.", "कोई ऑर्डर नहीं मिला।", "कोनो ऑर्डर नइ मिलिस।")}</p>
              ) : (
                filteredOrders.map((ord) => {
                  const isSelected = selectedOrder?.id === ord.id;
                  return (
                    <button
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500/20"
                          : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-mono text-[11px] font-bold text-slate-400">#{ord.id}</span>
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {ord.crop_type} {t("Lot", "लॉट", "लॉट")} · {ord.quantity_kg} {t("kg", "किग्रा", "किलो")}
                          </p>
                          <p className="text-xs font-black text-emerald-700 mt-1">
                            ₹{ord.total_amount.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusPillColor[ord.status]}`}>
                          {ord.status}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Map & Interactive Milestones */}
        <div className="w-full xl:w-7/12 flex flex-col gap-6">
          {/* Leaflet Route Map */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-700" />
                <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-800">
                  {t("Live Dispatch Geographic Tracking", "लाइव प्रेषण भौगोलिक ट्रैकिंग", "लाइव गाड़ी नक्शा ट्रैकिंग")}
                </h3>
              </div>
              {selectedOrder && (
                <span className="rounded-full bg-emerald-800 px-3 py-1 text-xs font-bold text-white shadow-xs">
                  {t("Active Lot", "सक्रिय लॉट", "चालू लॉट")} #{selectedOrder.id}
                </span>
              )}
            </div>

            <div className="p-2 relative bg-slate-50">
              <LeafletMap
                lots={orders.map((o) => ({
                  id: o.lot_id,
                  crop_type: o.crop_type,
                  total_quantity_kg: o.quantity_kg,
                  price_per_kg: Math.round(o.total_amount / (o.quantity_kg || 1)),
                  grade: "A",
                  listings_count: 3,
                  status: "open",
                  centroid: { lat: 21.2514, lng: 81.6296 },
                  created_at: new Date().toISOString(),
                }))}
                selectedLot={
                  selectedOrder
                    ? {
                        id: selectedOrder.lot_id,
                        crop_type: selectedOrder.crop_type,
                        total_quantity_kg: selectedOrder.quantity_kg,
                        price_per_kg: Math.round(selectedOrder.total_amount / (selectedOrder.quantity_kg || 1)),
                        grade: "A",
                        listings_count: 3,
                        status: "open",
                        centroid: { lat: 21.2514, lng: 81.6296 },
                        created_at: new Date().toISOString(),
                      }
                    : null
                }
                routeGeojson={routeData?.route_geojson}
                stops={currentStops}
                height="h-[300px] sm:h-[380px] md:h-[460px]"
              />
            </div>

            {/* Live Vehicle Telemetry Banner */}
            <div className="p-4 bg-slate-900 text-white border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <UserCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">{t("Assigned Driver", "नियुक्त चालक", "चालक")}</p>
                  <p className="font-bold text-slate-100">Rajesh Sahu (CG-04)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">{t("Estimated ETA", "अनुमानित समय", "पहुंचे के समै")}</p>
                  <p className="font-bold text-slate-100">{driverETA} {t("mins remaining", "मिनट शेष", "मिनट बचे हे")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-blue-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">{t("Reefer Pod Temp", "शीत कक्ष तापमान", "ठंडा बक्सा तापमान")}</p>
                  <p className="font-bold text-slate-100">+4.2°C (Optimal)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">{t("EV Battery / Range", "ईवी बैटरी", "बैटरी")}</p>
                  <p className="font-bold text-slate-100">84% • 140 km</p>
                </div>
              </div>
            </div>
          </div>

          {/* Waypoints & Route Timeline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-emerald-700" />
                <h3 className="font-display text-sm font-bold text-slate-900">
                  {t("Route Waypoints & Pickup Progress", "रूट वेपॉइंट्स एवं पिकअप प्रगति", "रस्ता वेपॉइंट्स आ पिकअप प्रगति")}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {t("VRP-TW Single Loop", "VRP-TW सिंगल लूप", "VRP-TW सिंगल लूप")}
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {currentStops.map((stop: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-colors ${
                    stop.status === "completed"
                      ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                      : stop.status === "in_progress"
                      ? "bg-amber-50/70 border-amber-300 text-amber-950"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-800 shrink-0 shadow-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{stop.label}</p>
                      <p className="text-[10px] text-slate-500">{stop.kg} • {t("Estimated", "अनुमानित", "समै")}: {stop.time}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      stop.status === "completed"
                        ? "bg-emerald-600 text-white"
                        : stop.status === "in_progress"
                        ? "bg-amber-500 text-white animate-pulse"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {stop.status === "completed" ? t("Done", "सम्पन्न", "हो गे") : stop.status === "in_progress" ? t("En Route", "रास्ते में", "रस्ता म हे") : t("Pending", "प्रतीक्षारत", "बाकी")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Settlement & Milestones Bar */}
          {selectedOrder && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-emerald-700" />
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      {t("2-Stage UPI Escrow Trigger", "2-चरण UPI एस्क्रो ट्रिगर", "2-चरण UPI एस्क्रो ट्रिगर")}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t("Order", "ऑर्डर", "ऑर्डर")} #{selectedOrder.id} • {t("Total Escrow", "कुल एस्क्रो", "कुल एस्क्रो")}: ₹{selectedOrder.total_amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <Badge variant="verified">{t("Escrow Locked", "एस्क्रो सुरक्षित", "एस्क्रो सुरक्षित")}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stage 1 */}
                <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                      {t("Stage 1 • Pickup Verified", "चरण 1 • पिकअप सत्यापित", "पड़ाव 1 • गाड़ी म लोड")}
                    </span>
                    <span className="rounded-full bg-amber-600 text-white px-2 py-0.5 text-[10px] font-bold">
                      40% {t("Advance", "अग्रिम", "अग्रिम")}
                    </span>
                  </div>
                  <p className="text-base font-black text-slate-900">
                    ₹{(selectedOrder.total_amount * 0.4).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-slate-600 leading-tight">
                    {t("Disburses to farmer UPI upon vehicle loading scan", "वाहन लोडिंग स्कैन पर किसान के UPI में जारी", "गाड़ी म लोड होत ही किसान के UPI म ट्रांसफर")}
                  </p>
                  <div className="space-y-2 pt-1 border-t border-amber-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Farmer OTP (e.g. 4821)"
                        value={otpDispatch}
                        onChange={(e) => setOtpDispatch(e.target.value)}
                        className="w-full rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold px-3 shrink-0"
                        disabled={verificationLoading || isSettling}
                        isLoading={verificationLoading}
                        onClick={() => handleVerifyOTP("pickup")}
                      >
                        {t("Disburse", "जारी करें", "भेजव")}
                      </Button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpDispatch("4821")}
                      className="text-[10px] font-bold text-amber-800 hover:underline"
                    >
                      ⚡ {t("Demo Quick-fill: 4821", "डेमो भरें: 4821", "डेमो भरव: 4821")}
                    </button>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                      {t("Stage 2 • Buyer Acceptance", "चरण 2 • खरीदार स्वीकृति", "पड़ाव 2 • खरीदार ले मिल गे")}
                    </span>
                    <span className="rounded-full bg-emerald-700 text-white px-2 py-0.5 text-[10px] font-bold">
                      60% {t("Final", "अंतिम", "बाकी")}
                    </span>
                  </div>
                  <p className="text-base font-black text-slate-900">
                    ₹{(selectedOrder.total_amount * 0.6).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-slate-600 leading-tight">
                    {t("Disburses remaining amount after QC weigh-in", "गुणवत्ता व वजन जांच के बाद शेष राशि जारी", "तौल आ गुणवत्ता जांच के बाद बाकी पईसा जारी")}
                  </p>
                  <div className="space-y-2 pt-1 border-t border-emerald-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Buyer OTP (e.g. 9104)"
                        value={otpDelivery}
                        onChange={(e) => setOtpDelivery(e.target.value)}
                        className="w-full rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        className="rounded-lg text-xs font-bold px-3 shrink-0 shadow-sm"
                        disabled={verificationLoading || isSettling}
                        isLoading={verificationLoading}
                        onClick={() => handleVerifyOTP("delivery")}
                      >
                        {t("Release", "स्वीकारें", "स्वीकार करव")}
                      </Button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpDelivery("9104")}
                      className="text-[10px] font-bold text-emerald-800 hover:underline"
                    >
                      ⚡ {t("Demo Quick-fill: 9104", "डेमो भरें: 9104", "डेमो भरव: 9104")}
                    </button>
                  </div>
                </div>
              </div>

              {payoutData && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                        {t("UPI Payment Disbursed Instantly", "UPI भुगतान तुरंत ट्रांसफर हुआ", "UPI पईसा तुरंत भेज दिए गे")}
                      </p>
                      <p className="text-lg font-black text-emerald-950">
                        ₹{payoutData.amount.toLocaleString("en-IN")}
                      </p>
                      <p className="font-mono text-xs font-bold text-slate-600">UTR: {payoutData.transaction_id}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
                      <Check className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
