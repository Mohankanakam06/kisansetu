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
    <div className="w-full h-full min-h-[420px] bg-[#EBECE8] border-2 border-[#1E1F1C] rounded-sm flex items-center justify-center text-[#52544D] font-bold">
      Loading dispatch control map...
    </div>
  ),
});

const statusPillColor: Record<string, string> = {
  placed: "bg-[#EBECE8] text-[#1E1F1C] border-[#1E1F1C]",
  routed: "bg-[#d9e9f2] text-[#082130] border-[#1E1F1C]",
  picked_up: "bg-[#faedd9] text-[#78350f] border-[#1E1F1C]",
  delivered: "bg-[#d7e8db] text-[#112816] border-[#1E1F1C]",
  settled: "bg-[#386641] text-white border-[#1E1F1C]",
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
    <div className="flex-1 flex flex-col bg-[#EBECE8] min-h-[calc(100vh-4rem)]">
      {/* Control Room Top Header */}
      <div className="border-b-2 border-[#1E1F1C] bg-[#EBECE8] py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#d7e8db] text-[#112816] text-[10px] font-black uppercase px-2 py-0.5 border-2 border-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C]">
                <Activity className="h-3.5 w-3.5 text-[#386641] animate-pulse" /> {t("Live Telemetry", "लाइव टेलीमेट्री", "लाइव टेलीमेट्री")}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#52544D]">
                {t("Raipur Cluster Dispatch Control", "रायपुर क्लस्टर प्रेषण नियंत्रण", "रायपुर क्लस्टर गाड़ी नियंत्रण")}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-[#1E1F1C]">
              {t("Logistics & Route Optimization Engine", "लॉजिस्टिक्स एवं मार्ग अनुकूलन इंजन", "लॉजिस्टिक्स आ रस्ता अनुकूलन इंजन")}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-3 rounded-sm border-2 border-[#1E1F1C] bg-white px-3 sm:px-4 py-2 text-xs font-black text-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C]">
              <div className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-[#1B4965]" />
                <span className="whitespace-nowrap">3 {t("Vehicles", "गाड़ियां", "गाड़ी मन")}</span>
              </div>
              <span className="text-[#C2C5BC]">|</span>
              <div className="flex items-center gap-1.5">
                <Leaf className="h-4 w-4 text-[#386641]" />
                <span className="whitespace-nowrap">-68% {t("Carbon", "कार्बन", "कार्बन")}</span>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={loadOrders} className="cursor-pointer">
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
          <div className="rounded-sm border-2 border-[#1E1F1C] bg-white p-5 shadow-[4px_4px_0_0_#1E1F1C] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#52544D]">
                  {t("Routing Comparison Engine", "रूटिंग तुलना इंजन", "रूटिंग तुलना इंजन")}
                </p>
                <h3 className="font-display text-base font-black text-[#1E1F1C]">
                  {t("AI Clustered vs Traditional Trips", "AI क्लस्टर्ड बनाम पारंपरिक यात्राएं", "AI क्लस्टर्ड बनाम पुराना तरीका")}
                </h3>
              </div>
              <Button
                variant="buyer"
                size="sm"
                disabled={!selectedOrder}
                isLoading={isOptimizing}
                onClick={() => selectedOrder && handleOptimizeRoute(selectedOrder.id)}
              >
                <Navigation className="h-4 w-4 mr-1" /> {t("Optimize", "रूट बनाएं", "रस्ता बनाव")}
              </Button>
            </div>

            {/* Toggle switch between AI and Traditional */}
            <div className="flex rounded-sm bg-[#EBECE8] p-1 border-2 border-[#1E1F1C]">
              <button
                onClick={() => setRoutingViewMode("ai_clustered")}
                className={`flex-1 rounded-sm py-1.5 px-2 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all text-center cursor-pointer ${
                  routingViewMode === "ai_clustered"
                    ? "bg-[#1B4965] text-white shadow-[1px_1px_0_0_#1E1F1C]"
                    : "text-[#52544D] hover:text-[#1E1F1C]"
                }`}
              >
                ⚡ {t("AI Clustered (1 Loop)", "AI क्लस्टर्ड (1 लूप)", "AI क्लस्टर्ड (1 लूप)")}
              </button>
              <button
                onClick={() => setRoutingViewMode("traditional")}
                className={`flex-1 rounded-sm py-1.5 px-2 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all text-center cursor-pointer ${
                  routingViewMode === "traditional"
                    ? "bg-[#C04A22] text-white shadow-[1px_1px_0_0_#1E1F1C]"
                    : "text-[#52544D] hover:text-[#1E1F1C]"
                }`}
              >
                ⚠️ {t("Traditional (4 Trips)", "पारंपरिक (4 ट्रिप)", "पुराना (4 ट्रिप)")}
              </button>
            </div>

            {/* Dynamic Comparison Cards */}
            {routingViewMode === "ai_clustered" ? (
              <div className="rounded-sm border-2 border-[#1E1F1C] bg-[#d7e8db] p-4 space-y-3 shadow-[2px_2px_0_0_#1E1F1C]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wide text-[#112816] flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-[#386641]" /> {t("Clustered Single Loop", "क्लस्टर्ड सिंगल लूप", "क्लस्टर्ड सिंगल लूप")}
                  </span>
                  <span className="rounded-sm bg-[#1E1F1C] text-white px-2 py-0.5 text-[9px] font-black uppercase">
                    72% {t("SAVINGS", "बचत", "बचत")}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-sm bg-white p-2 border-2 border-[#1E1F1C]">
                    <p className="text-[9px] font-black uppercase text-[#52544D]">{t("Total Dist.", "कुल दूरी", "कुल दूरी")}</p>
                    <p className="text-sm font-black text-[#1E1F1C] tabular-nums mt-0.5">{routeData?.distance_km || 38.4} {t("km", "किमी", "किमी")}</p>
                  </div>
                  <div className="rounded-sm bg-white p-2 border-2 border-[#1E1F1C]">
                    <p className="text-[9px] font-black uppercase text-[#52544D]">{t("Duration", "समय", "समै")}</p>
                    <p className="text-sm font-black text-[#1E1F1C] tabular-nums mt-0.5">{routeData?.duration_minutes || 64} {t("min", "मिनट", "मिनट")}</p>
                  </div>
                  <div className="rounded-sm bg-white p-2 border-2 border-[#1E1F1C]">
                    <p className="text-[9px] font-black uppercase text-[#52544D]">{t("CO₂ Saved", "CO₂ बचत", "CO₂ बचत")}</p>
                    <p className="text-sm font-black text-[#386641] tabular-nums mt-0.5">+{routeData?.carbon_saved_kg || 28.4} {t("kg", "किग्रा", "किलो")}</p>
                  </div>
                </div>
                <p className="text-[11px] font-bold text-[#112816]/90">
                  {t("Consolidates 4 separate smallholder pickups into 1 optimized electric/diesel route.", "4 अलग-अलग किसानों के पिकअप को 1 अनुकूलित वाहन रूट में समेकित करता है।", "4 अलग-अलग किसान के पिकअप ला 1 बढ़िया गाड़ी रस्ता म जमा करथे।")}
                </p>
              </div>
            ) : (
              <div className="rounded-sm border-2 border-[#1E1F1C] bg-[#faedd9] p-4 space-y-3 shadow-[2px_2px_0_0_#1E1F1C]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wide text-[#78350f] flex items-center gap-1.5">
                    <Fuel className="h-4 w-4 text-[#C04A22]" /> {t("Individual Farm Trips", "व्यक्तिगत खेत यात्राएं", "अलग-अलग खेत के फेरा")}
                  </span>
                  <span className="rounded-sm bg-[#C04A22] text-white px-2 py-0.5 text-[9px] font-black uppercase">
                    {t("HIGH COST", "उच्च लागत", "ज्यादा खर्चा")}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-sm bg-white p-2 border-2 border-[#1E1F1C]">
                    <p className="text-[9px] font-black uppercase text-[#52544D]">{t("Total Dist.", "कुल दूरी", "कुल दूरी")}</p>
                    <p className="text-sm font-black text-[#78350f] tabular-nums mt-0.5">{routeData?.individual_distance_km || 136.2} {t("km", "किमी", "किमी")}</p>
                  </div>
                  <div className="rounded-sm bg-white p-2 border-2 border-[#1E1F1C]">
                    <p className="text-[9px] font-black uppercase text-[#52544D]">{t("Duration", "समय", "समै")}</p>
                    <p className="text-sm font-black text-[#78350f] tabular-nums mt-0.5">240 {t("min", "मिनट", "मिनट")}</p>
                  </div>
                  <div className="rounded-sm bg-white p-2 border-2 border-[#1E1F1C]">
                    <p className="text-[9px] font-black uppercase text-[#52544D]">{t("Fuel Cost", "ईंधन खर्च", "तेल खर्चा")}</p>
                    <p className="text-sm font-black text-[#C04A22] tabular-nums mt-0.5">₹2,840</p>
                  </div>
                </div>
                <p className="text-[11px] font-bold text-[#78350f]">
                  {t("Every farmer independently drives to APMC mandi, causing traffic congestion & fuel waste.", "प्रत्येक किसान स्वतंत्र रूप से मंडी जाता है, जिससे भीड़भाड़ और ईंधन की बर्बादी होती है।", "हर किसान अलग-अलग मंडी जाथे, जेकर से भीड़ आ डीजल के नुकसानी होथे।")}
                </p>
              </div>
            )}
          </div>

          {/* Consolidated Orders List */}
          <div className="rounded-sm border-2 border-[#1E1F1C] bg-white p-5 shadow-[4px_4px_0_0_#1E1F1C] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#1E1F1C] pb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-black text-[#1E1F1C] uppercase">{t("Orders in Dispatch", "प्रेषण में ऑर्डर", "गाड़ी म ऑर्डर")}</h3>
                <span className="rounded-sm bg-[#EBECE8] border border-[#1E1F1C] px-1.5 py-0.2 text-[10px] font-black text-[#1E1F1C]">
                  {filteredOrders.length}
                </span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-sm border-2 border-[#1E1F1C] bg-[#EBECE8] px-2.5 py-1 text-xs font-black text-[#1E1F1C] focus:outline-none cursor-pointer"
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
                <p className="py-6 text-center text-xs font-bold text-[#52544D]">{t("No orders matching filter.", "कोई ऑर्डर नहीं मिला।", "कोनो ऑर्डर नइ मिलिस।")}</p>
              ) : (
                filteredOrders.map((ord) => {
                  const isSelected = selectedOrder?.id === ord.id;
                  return (
                    <button
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className={`w-full text-left rounded-sm border-2 p-3.5 transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#1E1F1C] bg-[#d9e9f2] shadow-[3px_3px_0_0_#1E1F1C]"
                          : "border-[#1E1F1C] bg-[#EBECE8] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] font-black text-[#52544D]">#{ord.id}</span>
                          <p className="text-xs font-black text-[#1E1F1C] truncate uppercase">
                            {ord.crop_type} {t("Lot", "लॉट", "लॉट")} · {ord.quantity_kg} {t("kg", "किग्रा", "किलो")}
                          </p>
                          <p className="text-xs font-black text-[#1B4965] mt-0.5 tabular-nums">
                            ₹{ord.total_amount.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <span className={`inline-flex items-center rounded-sm border border-[#1E1F1C] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${statusPillColor[ord.status]}`}>
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
          <div className="rounded-sm border-2 border-[#1E1F1C] bg-white shadow-[4px_4px_0_0_#1E1F1C] overflow-hidden">
            <div className="p-4 border-b-2 border-[#1E1F1C] bg-[#EBECE8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#1B4965]" />
                <h3 className="text-xs font-black uppercase tracking-wide text-[#1E1F1C]">
                  {t("Live Dispatch Geographic Tracking", "लाइव प्रेषण भौगोलिक ट्रैकिंग", "लाइव गाड़ी नक्शा ट्रैकिंग")}
                </h3>
              </div>
              {selectedOrder && (
                <span className="rounded-sm bg-[#1E1F1C] px-2.5 py-0.5 text-[10px] font-black uppercase text-white border border-[#1E1F1C]">
                  {t("Lot", "लॉट", "लॉट")} #{selectedOrder.id}
                </span>
              )}
            </div>

            <div className="p-2 relative bg-[#EBECE8]">
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
            <div className="p-3.5 bg-[#1E1F1C] text-white border-t-2 border-[#1E1F1C] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <UserCircle2 className="h-4 w-4 text-[#F4A261] shrink-0" />
                <div>
                  <p className="text-[9px] text-[#C2C5BC] font-bold uppercase">{t("Assigned Driver", "नियुक्त चालक", "चालक")}</p>
                  <p className="font-black text-white text-[11px]">Rajesh Sahu (CG-04)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#F4A261] shrink-0" />
                <div>
                  <p className="text-[9px] text-[#C2C5BC] font-bold uppercase">{t("Estimated ETA", "अनुमानित समय", "पहुंचे के समै")}</p>
                  <p className="font-black text-white text-[11px] tabular-nums">{driverETA} {t("mins remaining", "मिनट शेष", "मिनट बचे हे")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-[#d9e9f2] shrink-0" />
                <div>
                  <p className="text-[9px] text-[#C2C5BC] font-bold uppercase">{t("Reefer Pod Temp", "शीत कक्ष तापमान", "ठंडा बक्सा तापमान")}</p>
                  <p className="font-black text-white text-[11px]">+4.2°C</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-[#386641] shrink-0" />
                <div>
                  <p className="text-[9px] text-[#C2C5BC] font-bold uppercase">{t("EV Battery", "ईवी बैटरी", "बैटरी")}</p>
                  <p className="font-black text-white text-[11px] tabular-nums">84% • 140 km</p>
                </div>
              </div>
            </div>
          </div>

          {/* Waypoints & Route Timeline */}
          <div className="rounded-sm border-2 border-[#1E1F1C] bg-white p-5 shadow-[4px_4px_0_0_#1E1F1C] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[#1E1F1C] pb-2.5">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-[#1B4965]" />
                <h3 className="font-display text-sm font-black text-[#1E1F1C] uppercase">
                  {t("Route Waypoints & Pickup Progress", "रूट वेपॉइंट्स एवं पिकअप प्रगति", "रस्ता वेपॉइंट्स आ पिकअप प्रगति")}
                </h3>
              </div>
              <span className="text-[9px] font-black uppercase text-[#1B4965] bg-[#d9e9f2] px-2 py-0.5 rounded-sm border border-[#1E1F1C]">
                {t("VRP-TW Multi-Stop", "VRP-TW मल्टी-स्टॉप", "VRP-TW मल्टी-स्टॉप")}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {currentStops.map((stop: any, idx: number) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-sm border-2 border-[#1E1F1C] text-xs transition-colors ${
                    stop.status === "completed"
                      ? "bg-[#d7e8db] text-[#112816]"
                      : stop.status === "in_progress"
                      ? "bg-[#faedd9] text-[#78350f]"
                      : "bg-[#EBECE8] text-[#52544D]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-white border border-[#1E1F1C] text-[10px] font-black text-[#1E1F1C] shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-black text-[#1E1F1C] text-xs">{stop.label}</p>
                      <p className="text-[10px] font-bold text-[#52544D]">{stop.kg} • {t("Est.", "समय", "समै")}: {stop.time}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm border border-[#1E1F1C] ${
                      stop.status === "completed"
                        ? "bg-[#386641] text-white"
                        : stop.status === "in_progress"
                        ? "bg-[#C04A22] text-white animate-pulse"
                        : "bg-white text-[#52544D]"
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
            <div className="rounded-sm border-2 border-[#1E1F1C] bg-white p-5 sm:p-6 shadow-[4px_4px_0_0_#1E1F1C] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E1F1C]">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-[#1B4965]" />
                  <div>
                    <h3 className="font-display text-base font-black text-[#1E1F1C]">
                      {t("2-Stage UPI Escrow Trigger", "2-चरण UPI एस्क्रो ट्रिगर", "2-चरण UPI एस्क्रो ट्रिगर")}
                    </h3>
                    <p className="text-xs font-bold text-[#52544D]">
                      {t("Order", "ऑर्डर", "ऑर्डर")} #{selectedOrder.id} • {t("Total Escrow", "कुल एस्क्रो", "कुल एस्क्रो")}: ₹{selectedOrder.total_amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#d7e8db] border-2 border-[#1E1F1C] text-[#112816] rounded-sm">
                  {t("Escrow Locked", "एस्क्रो सुरक्षित", "एस्क्रो सुरक्षित")}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stage 1 */}
                <div className="rounded-sm border-2 border-[#1E1F1C] bg-[#faedd9] p-4 space-y-2.5 shadow-[2px_2px_0_0_#1E1F1C]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#78350f]">
                      {t("Stage 1 • Pickup Verified", "चरण 1 • पिकअप सत्यापित", "पड़ाव 1 • लोड")}
                    </span>
                    <span className="rounded-sm bg-[#C04A22] text-white px-1.5 py-0.2 text-[9px] font-black uppercase">
                      40% {t("Advance", "अग्रिम", "अग्रिम")}
                    </span>
                  </div>
                  <p className="text-base font-black text-[#1E1F1C] tabular-nums">
                    ₹{(selectedOrder.total_amount * 0.4).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] font-bold text-[#78350f] leading-tight">
                    {t("Disburses to farmer UPI upon vehicle loading scan", "वाहन लोडिंग स्कैन पर किसान के UPI में जारी", "गाड़ी म लोड होत ही किसान के UPI म ट्रांसफर")}
                  </p>
                  <div className="space-y-2 pt-1 border-t-2 border-[#1E1F1C]">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Farmer OTP (e.g. 4821)"
                        value={otpDispatch}
                        onChange={(e) => setOtpDispatch(e.target.value)}
                        className="w-full rounded-sm border-2 border-[#1E1F1C] bg-white px-2.5 py-1.5 text-xs font-mono font-black text-[#1E1F1C] placeholder:text-[#52544D] focus:outline-none"
                      />
                      <Button
                        size="sm"
                        variant="farmer"
                        className="shrink-0"
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
                      className="text-[10px] font-black text-[#C04A22] hover:underline cursor-pointer uppercase"
                    >
                      ⚡ {t("Demo Fill: 4821", "डेमो भरें: 4821", "डेमो भरव: 4821")}
                    </button>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="rounded-sm border-2 border-[#1E1F1C] bg-[#d7e8db] p-4 space-y-2.5 shadow-[2px_2px_0_0_#1E1F1C]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#112816]">
                      {t("Stage 2 • Buyer Acceptance", "चरण 2 • खरीदार स्वीकृति", "पड़ाव 2 • डिलीवरी")}
                    </span>
                    <span className="rounded-sm bg-[#386641] text-white px-1.5 py-0.2 text-[9px] font-black uppercase">
                      60% {t("Final", "अंतिम", "बाकी")}
                    </span>
                  </div>
                  <p className="text-base font-black text-[#1E1F1C] tabular-nums">
                    ₹{(selectedOrder.total_amount * 0.6).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] font-bold text-[#112816] leading-tight">
                    {t("Disburses remaining amount after QC weigh-in", "गुणवत्ता व वजन जांच के बाद शेष राशि जारी", "तौल आ गुणवत्ता जांच के बाद बाकी पईसा जारी")}
                  </p>
                  <div className="space-y-2 pt-1 border-t-2 border-[#1E1F1C]">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Buyer OTP (e.g. 9104)"
                        value={otpDelivery}
                        onChange={(e) => setOtpDelivery(e.target.value)}
                        className="w-full rounded-sm border-2 border-[#1E1F1C] bg-white px-2.5 py-1.5 text-xs font-mono font-black text-[#1E1F1C] placeholder:text-[#52544D] focus:outline-none"
                      />
                      <Button
                        size="sm"
                        variant="buyer"
                        className="shrink-0"
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
                      className="text-[10px] font-black text-[#1B4965] hover:underline cursor-pointer uppercase"
                    >
                      ⚡ {t("Demo Fill: 9104", "डेमो भरें: 9104", "डेमो भरव: 9104")}
                    </button>
                  </div>
                </div>
              </div>

              {payoutData && (
                <div className="rounded-sm border-2 border-[#1E1F1C] bg-[#d7e8db] p-4 shadow-[2px_2px_0_0_#1E1F1C] animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#112816]">
                        {t("UPI Payment Disbursed Instantly", "UPI भुगतान तुरंत ट्रांसफर हुआ", "UPI पईसा तुरंत भेज दिए गे")}
                      </p>
                      <p className="text-lg font-black text-[#112816] tabular-nums">
                        ₹{payoutData.amount.toLocaleString("en-IN")}
                      </p>
                      <p className="font-mono text-xs font-bold text-[#52544D]">UTR: {payoutData.transaction_id}</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#386641] text-white border-2 border-[#1E1F1C]">
                      <Check className="h-5 w-5" />
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
