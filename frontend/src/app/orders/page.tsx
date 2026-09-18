"use client";
import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Order, OptimizeRouteResponse, SettlementPayoutResponse } from "@/types";
import { apiService } from "@/services/api";
import { Button, Card, Badge, Skeleton, cn } from "@/components/ui";
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
  Layers,
  Fuel,
  Leaf,
  Activity,
  Zap,
  Check,
  Thermometer,
  Battery,
  UserCircle2,
  FileText,
  AlertCircle,
} from "lucide-react";

// Client-only dynamic Leaflet Map to avoid SSR errors
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center text-slate-600 font-semibold text-xs">
      Loading dispatch control map...
    </div>
  ),
});

const statusPillBadge: Record<string, { variant: "neutral" | "farmer" | "buyer" | "verified" | "warning" | "success"; label: string }> = {
  placed: { variant: "neutral", label: "Placed" },
  routed: { variant: "buyer", label: "Routed" },
  picked_up: { variant: "warning", label: "Picked Up" },
  delivered: { variant: "verified", label: "Delivered" },
  settled: { variant: "farmer", label: "Settled" },
};

export default function OrdersPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
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
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [driverETA, setDriverETA] = useState(25); // minutes

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kisansetu_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await apiService.getOrders();
      setOrders(res.orders || []);
      if (res.orders && res.orders.length > 0 && !selectedOrder) {
        setSelectedOrder(res.orders[0]);
      }
    } catch (e: any) {
      console.error(e);
      setOrdersError(e?.message || "Failed to load orders. Please check your connection.");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (driverETA <= 0) return;
    const timer = setInterval(() => {
      setDriverETA((prev) => Math.max(0, prev - 1));
    }, 60000);
    return () => clearInterval(timer);
  }, [driverETA]);

  const handleVerifyOTP = async (type: "pickup" | "delivery") => {
    const otp = type === "pickup" ? otpDispatch : otpDelivery;
    if (!otp || otp.length < 4) return;
    setVerificationLoading(true);
    setActionError(null);
    try {
      const res = await apiService.verifyMilestoneOtp(selectedOrder?.id!, type, otp);
      setPayoutData(res);
      await loadOrders();
    } catch (e: any) {
      console.error("OTP verification failed", e);
      setActionError(e?.message || "OTP verification failed. Please try again.");
    } finally {
      setVerificationLoading(false);
      if (type === "pickup") setOtpDispatch("");
      else setOtpDelivery("");
    }
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === "All") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const handleOptimizeRoute = async (orderId: string) => {
    setIsOptimizing(true);
    setActionError(null);
    try {
      const res = await apiService.optimizeRoute(orderId);
      setRouteData(res);
      await loadOrders();
    } catch (e: any) {
      console.error(e);
      setActionError(e?.message || "Route optimization failed. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleTriggerPayout = async (orderId: string, stage: "pickup" | "delivery") => {
    setIsSettling(true);
    setActionError(null);
    try {
      const res = await apiService.triggerSettlement(orderId, stage);
      setPayoutData(res);
      await loadOrders();
    } catch (e: any) {
      console.error(e);
      setActionError(e?.message || "Payment settlement failed. Please try again.");
    } finally {
      setIsSettling(false);
    }
  };

  const currentStops = routeData?.stops || [
    { lat: 21.2514, lng: 81.6296, label: "Farm Gate 1 (Birgaon)", time: "10:30 AM", status: "completed", kg: "850 kg" },
    { lat: 21.1938, lng: 81.65, label: "Farm Gate 2 (Abhanpur)", time: "11:15 AM", status: "in_progress", kg: "1,200 kg" },
    { lat: 21.23, lng: 81.67, label: "Central Wholesale Hub (Raipur)", time: "12:45 PM", status: "pending", kg: "Drop 2,050 kg" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-[calc(100vh-4rem)]">
      {/* Control Room Top Header */}
      <div className="border-b border-slate-200 bg-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                {t("Live Telemetry", "लाइव टेलीमेट्री", "लाइव टेलीमेट्री")}
              </Badge>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t("Raipur Basin Dispatch Control", "रायपुर बेसिन प्रेषण नियंत्रण", "रायपुर क्लस्टर गाड़ी नियंत्रण")}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {t("Logistics & 1-Truck Route Dispatch Engine", "लॉजिस्टिक्स एवं 1-ट्रक रूटिंग इंजन", "लॉजिस्टिक्स आ 1-गाड़ी रस्ता इंजन")}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800">
              <div className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-blue-900" />
                <span>3 {t("Active Vehicles", "सक्रिय गाड़ियां", "गाड़ी मन")}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <Leaf className="h-4 w-4 text-emerald-800" />
                <span className="text-emerald-800">-68% {t("CO₂ Reduction", "CO₂ बचत", "CO₂ बचत")}</span>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={loadOrders} className="min-h-[38px]">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Control Room Grid */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {actionError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-center justify-between gap-3 text-rose-900">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <p className="text-xs font-semibold">{actionError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActionError(null)}
              className="border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0 min-h-[36px]"
            >
              Dismiss
            </Button>
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-8">
        {/* Left Column: Orders & Route Stats */}
        <div className="w-full xl:w-5/12 flex flex-col gap-6">
          {/* AI vs Traditional Route Comparison */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t("Routing Comparison Engine", "रूटिंग तुलना इंजन", "रूटिंग तुलना इंजन")}
                </p>
                <h3 className="font-display text-base font-extrabold text-slate-900">
                  {t("AI Clustered vs Independent Trips", "AI क्लस्टर्ड बनाम अलग यात्राएं", "AI क्लस्टर्ड बनाम अलग फेरा")}
                </h3>
              </div>
              <Button
                variant="buyer"
                size="sm"
                disabled={!selectedOrder}
                isLoading={isOptimizing}
                onClick={() => selectedOrder && handleOptimizeRoute(selectedOrder.id)}
              >
                <Navigation className="h-3.5 w-3.5 mr-1" /> {t("Optimize", "रूट बनाएं", "रस्ता बनाव")}
              </Button>
            </div>

            {/* Switch between AI and Traditional */}
            <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setRoutingViewMode("ai_clustered")}
                className={`flex-1 rounded-md py-1.5 px-2 text-xs font-bold transition-all text-center cursor-pointer ${
                  routingViewMode === "ai_clustered"
                    ? "bg-white text-blue-950 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ⚡ {t("AI Clustered (1-Truck)", "AI क्लस्टर्ड (1-ट्रक)", "AI क्लस्टर्ड (1-गाड़ी)")}
              </button>
              <button
                type="button"
                onClick={() => setRoutingViewMode("traditional")}
                className={`flex-1 rounded-md py-1.5 px-2 text-xs font-bold transition-all text-center cursor-pointer ${
                  routingViewMode === "traditional"
                    ? "bg-white text-amber-950 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ⚠️ {t("Traditional (4 Trips)", "पारंपरिक (4 ट्रिप)", "पुराना (4 ट्रिप)")}
              </button>
            </div>

            {/* Comparison Cards */}
            {routingViewMode === "ai_clustered" ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-emerald-800" /> {t("Consolidated Single Loop", "समेकित सिंगल लूप", "समेकित सिंगल लूप")}
                  </span>
                  <Badge variant="gradeA">72% {t("Savings", "बचत", "बचत")}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                    <p className="text-[10px] font-bold uppercase text-slate-500">{t("Total Dist.", "कुल दूरी", "कुल दूरी")}</p>
                    <p className="text-base font-extrabold text-slate-900 font-display tabular-nums mt-0.5">{routeData?.distance_km || 38.4} {t("km", "किमी", "किमी")}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                    <p className="text-[10px] font-bold uppercase text-slate-500">{t("Duration", "समय", "समै")}</p>
                    <p className="text-base font-extrabold text-slate-900 font-display tabular-nums mt-0.5">{routeData?.duration_minutes || 64} {t("min", "मिनट", "मिनट")}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                    <p className="text-[10px] font-bold uppercase text-slate-500">{t("CO₂ Saved", "CO₂ बचत", "CO₂ बचत")}</p>
                    <p className="text-base font-extrabold text-emerald-800 font-display tabular-nums mt-0.5">+{routeData?.carbon_saved_kg || 28.4} {t("kg", "किग्रा", "किलो")}</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-emerald-950 leading-relaxed">
                  {t("Consolidates 4 separate smallholder farm pickups into 1 optimized electric/diesel route.", "4 अलग-अलग किसानों के पिकअप को 1 अनुकूलित वाहन रूट में समेकित करता है।", "4 अलग-अलग किसान के पिकअप ला 1 बढ़िया गाड़ी रस्ता म जमा करथे।")}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Fuel className="h-4 w-4 text-amber-800" /> {t("Individual Mandi Trips", "अलग मंडी यात्राएं", "अलग-अलग मंडी फेरा")}
                  </span>
                  <Badge variant="warning">{t("High Cost", "उच्च लागत", "ज्यादा खर्चा")}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                    <p className="text-[10px] font-bold uppercase text-slate-500">{t("Total Dist.", "कुल दूरी", "कुल दूरी")}</p>
                    <p className="text-base font-extrabold text-amber-950 font-display tabular-nums mt-0.5">{routeData?.individual_distance_km || 136.2} {t("km", "किमी", "किमी")}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                    <p className="text-[10px] font-bold uppercase text-slate-500">{t("Duration", "समय", "समै")}</p>
                    <p className="text-base font-extrabold text-amber-950 font-display tabular-nums mt-0.5">240 {t("min", "मिनट", "मिनट")}</p>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                    <p className="text-[10px] font-bold uppercase text-slate-500">{t("Fuel Cost", "ईंधन खर्च", "तेल खर्चा")}</p>
                    <p className="text-base font-extrabold text-amber-950 font-display tabular-nums mt-0.5">₹2,840</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-amber-950 leading-relaxed">
                  {t("Every farmer independently drives to APMC mandi, causing traffic congestion & fuel waste.", "प्रत्येक किसान स्वतंत्र रूप से मंडी जाता है, जिससे भीड़भाड़ और ईंधन की बर्बादी होती है।", "हर किसान अलग-अलग मंडी जाथे, जेकर से भीड़ आ डीजल के नुकसानी होथे।")}
                </p>
              </div>
            )}
          </Card>

          {/* Orders List */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-extrabold text-slate-900">{t("Active Dispatch Orders", "सक्रिय प्रेषण ऑर्डर", "गाड़ी म ऑर्डर")}</h3>
                <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
                  {filteredOrders.length}
                </span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-700 cursor-pointer min-h-[36px]"
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
              {ordersLoading ? (
                <div className="space-y-3 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  ))}
                </div>
              ) : ordersError ? (
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-center space-y-2.5">
                  <p className="text-xs font-semibold text-rose-800">{ordersError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadOrders()}
                    className="border-rose-300 text-rose-800 hover:bg-rose-100 min-h-[36px]"
                  >
                    {t("Retry", "पुनः प्रयास करें", "फिर से देखव")}
                  </Button>
                </div>
              ) : filteredOrders.length === 0 ? (
                <p className="py-8 text-center text-xs font-medium text-slate-500">{t("No orders matching filter.", "कोई ऑर्डर नहीं मिला।", "कोनो ऑर्डर नइ मिलिस।")}</p>
              ) : (
                filteredOrders.map((ord) => {
                  const isSelected = selectedOrder?.id === ord.id;
                  const badgeConfig = statusPillBadge[ord.status] || { variant: "neutral", label: ord.status };
                  return (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => setSelectedOrder(ord)}
                      className={`w-full text-left rounded-xl border p-3.5 transition-all cursor-pointer ${
                        isSelected
                          ? "border-blue-700 bg-blue-50/50 shadow-xs ring-1 ring-blue-700/20"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] font-bold text-slate-500">#{ord.id}</span>
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {ord.crop_type} {t("Lot", "लॉट", "लॉट")} · {ord.quantity_kg.toLocaleString()} {t("kg", "किग्रा", "किलो")}
                          </p>
                          <p className="text-xs font-extrabold text-blue-900 mt-0.5 tabular-nums">
                            ₹{ord.total_amount.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <Badge variant={badgeConfig.variant} size="sm">
                          {badgeConfig.label}
                        </Badge>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Live Map & Escrow Milestones */}
        <div className="w-full xl:w-7/12 flex flex-col gap-6">
          {/* Leaflet Route Map */}
          <Card className="overflow-hidden p-0">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-900" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  {t("Geographic Cluster Tracking", "भौगोलिक क्लस्टर ट्रैकिंग", "गाड़ी नक्शा ट्रैकिंग")}
                </h3>
              </div>
              {selectedOrder && (
                <Badge variant="buyer" size="sm">
                  {t("Lot", "लॉट", "लॉट")} #{selectedOrder.id}
                </Badge>
              )}
            </div>

            <div className="p-2 relative bg-slate-100">
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
                routingViewMode={routingViewMode}
                showConvergenceLines={true}
                height="h-[300px] sm:h-[380px] md:h-[460px]"
              />
            </div>

            {/* Telemetry Footer */}
            <div className="p-4 bg-slate-900 text-white grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <UserCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t("Assigned Driver", "नियुक्त चालक", "चालक")}</p>
                  <p className="font-bold text-white text-xs">Rajesh Sahu (CG-04)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t("Estimated ETA", "अनुमानित समय", "पहुंचे के समै")}</p>
                  <p className="font-bold text-white text-xs tabular-nums">{driverETA} {t("mins remaining", "मिनट शेष", "मिनट बचे हे")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-blue-300 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t("Cold Pod Temp", "शीत कक्ष तापमान", "ठंडा बक्सा तापमान")}</p>
                  <p className="font-bold text-white text-xs">+4.2°C</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t("EV Battery", "ईवी बैटरी", "बैटरी")}</p>
                  <p className="font-bold text-white text-xs tabular-nums">84% • 140 km</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Waypoints */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-blue-900" />
                <h3 className="font-display text-sm font-extrabold text-slate-900">
                  {t("Route Waypoints & Pickup Progress", "रूट वेपॉइंट्स एवं पिकअप प्रगति", "रस्ता वेपॉइंट्स आ पिकअप प्रगति")}
                </h3>
              </div>
              <Badge variant="buyer" size="sm">VRP-TW Multi-Stop</Badge>
            </div>

            <div className="space-y-2 pt-1">
              {currentStops.map((stop: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-colors ${
                    stop.status === "completed"
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                      : stop.status === "in_progress"
                      ? "bg-amber-50/70 border-amber-200 text-amber-950"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white border border-slate-300 text-[10px] font-bold text-slate-900 shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{stop.label}</p>
                      <p className="text-[10px] font-semibold text-slate-500">{stop.kg} • {t("Est.", "समय", "समै")}: {stop.time}</p>
                    </div>
                  </div>
                  <Badge
                    variant={stop.status === "completed" ? "success" : stop.status === "in_progress" ? "warning" : "neutral"}
                    size="sm"
                  >
                    {stop.status === "completed" ? t("Completed", "सम्पन्न", "हो गे") : stop.status === "in_progress" ? t("En Route", "रास्ते में", "रस्ता म हे") : t("Pending", "प्रतीक्षारत", "बाकी")}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* 2-Stage UPI Payment Protection Trigger */}
          {selectedOrder && (
            <Card className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-extrabold text-slate-900">
                      {t("2-Stage Payment Protection Settlement", "2-चरण सुरक्षित भुगतान ट्रांसफर", "2-चरण सुरक्षित पईसा ट्रांसफर")}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {t("Order", "ऑर्डर", "ऑर्डर")} #{selectedOrder.id} • {t("Total Value", "कुल मूल्य", "कुल मूल्य")}: ₹{selectedOrder.total_amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <Badge variant="verified">{t("Payment Protected", "सुरक्षित भुगतान", "सुरक्षित पईसा")}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stage 1 */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                      {t("Stage 1 • Pickup Verified", "चरण 1 • पिकअप सत्यापित", "पड़ाव 1 • लोड")}
                    </span>
                    <Badge variant="warning" size="sm">40% {t("Advance", "अग्रिम", "अग्रिम")}</Badge>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900 font-display tabular-nums">
                    ₹{(selectedOrder.total_amount * 0.4).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] font-medium text-amber-950 leading-tight">
                    {t("Disburses to farmer UPI upon vehicle loading scan", "वाहन लोडिंग स्कैन पर किसान के UPI में जारी", "गाड़ी म लोड होत ही किसान के UPI म ट्रांसफर")}
                  </p>
                  <div className="space-y-2 pt-2 border-t border-amber-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Farmer OTP (4821)"
                        value={otpDispatch}
                        onChange={(e) => setOtpDispatch(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-700 min-h-[38px]"
                      />
                      <Button
                        size="sm"
                        variant="farmer"
                        className="shrink-0 min-h-[38px]"
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
                      className="text-[11px] font-bold text-amber-900 hover:underline cursor-pointer"
                    >
                      ⚡ {t("Demo Fill: 4821", "डेमो भरें: 4821", "डेमो भरव: 4821")}
                    </button>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                      {t("Stage 2 • Buyer Acceptance", "चरण 2 • खरीदार स्वीकृति", "पड़ाव 2 • डिलीवरी")}
                    </span>
                    <Badge variant="gradeA" size="sm">60% {t("Final", "अंतिम", "बाकी")}</Badge>
                  </div>
                  <p className="text-lg font-extrabold text-slate-900 font-display tabular-nums">
                    ₹{(selectedOrder.total_amount * 0.6).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] font-medium text-emerald-950 leading-tight">
                    {t("Disburses remaining amount after QC weigh-in", "गुणवत्ता व वजन जांच के बाद शेष राशि जारी", "तौल आ गुणवत्ता जांच के बाद बाकी पईसा जारी")}
                  </p>
                  <div className="space-y-2 pt-2 border-t border-emerald-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Buyer OTP (9104)"
                        value={otpDelivery}
                        onChange={(e) => setOtpDelivery(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-700 min-h-[38px]"
                      />
                      <Button
                        size="sm"
                        variant="buyer"
                        className="shrink-0 min-h-[38px]"
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
                      className="text-[11px] font-bold text-blue-900 hover:underline cursor-pointer"
                    >
                      ⚡ {t("Demo Fill: 9104", "डेमो भरें: 9104", "डेमो भरव: 9104")}
                    </button>
                  </div>
                </div>
              </div>

              {payoutData && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                        {t("UPI Payment Disbursed Instantly", "UPI भुगतान तुरंत ट्रांसफर हुआ", "UPI पईसा तुरंत भेज दिए गे")}
                      </p>
                      <p className="text-xl font-black text-emerald-800 font-display tabular-nums mt-0.5">
                        ₹{payoutData.amount.toLocaleString("en-IN")}
                      </p>
                      <p className="font-mono text-xs font-semibold text-slate-500">UTR: {payoutData.transaction_id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert(`Downloaded Ledger Voucher for UTR ${payoutData.transaction_id}`)}
                        className="min-h-[36px]"
                      >
                        <FileText className="h-3.5 w-3.5 mr-1 text-blue-900" />
                        {t("Download Ledger", "लेजर डाउनलोड", "लेजर डाउनलोड")}
                      </Button>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-xs">
                        <Check className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
