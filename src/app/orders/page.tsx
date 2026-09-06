"use client";
import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Order, OptimizeRouteResponse, SettlementPayoutResponse } from "@/types";
import { apiService } from "@/services/api";
import { Button, Card, Badge } from "@/components/ui";
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [routeData, setRouteData] = useState<OptimizeRouteResponse | null>(null);
  const [payoutData, setPayoutData] = useState<SettlementPayoutResponse | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [routingViewMode, setRoutingViewMode] = useState<"ai_clustered" | "traditional">("ai_clustered");

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

  return (
    <div className="flex-1 flex flex-col bg-[#f8faf9] min-h-[calc(100vh-4rem)]">
      {/* Control Room Top Header */}
      <div className="border-b border-slate-200 bg-white py-5 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 border border-emerald-300">
                <Activity className="h-3.5 w-3.5 text-emerald-600 animate-pulse" /> Live Telemetry
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Raipur Cluster Dispatch Control
              </span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-emerald-950">
              Logistics & Route Optimization Engine
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:px-4 py-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-emerald-700" />
                <span className="whitespace-nowrap">3 Vehicles</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <Leaf className="h-4 w-4 text-emerald-600" />
                <span className="whitespace-nowrap">-68% Carbon</span>
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
                  Routing Comparison Engine
                </p>
                <h3 className="font-display text-base font-bold text-slate-900">
                  AI Clustered vs Traditional Trips
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
                <Navigation className="h-4 w-4 mr-1" /> Optimize
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
                ✨ AI Clustered (1 Trip)
              </button>
              <button
                onClick={() => setRoutingViewMode("traditional")}
                className={`flex-1 rounded-lg py-2 px-1 text-[11px] sm:text-xs font-bold transition-all text-center leading-tight ${
                  routingViewMode === "traditional"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ⚠️ Traditional (4 Trips)
              </button>
            </div>

            {/* Dynamic Comparison Cards */}
            {routingViewMode === "ai_clustered" ? (
              <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-800 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-emerald-600" /> Clustered Single Loop
                  </span>
                  <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-black">
                    72% SAVINGS
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white p-2 border border-emerald-100">
                    <p className="text-[10px] font-bold text-slate-400">Total Dist.</p>
                    <p className="text-base font-black text-emerald-900">{routeData?.distance_km || 38.4} km</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-emerald-100">
                    <p className="text-[10px] font-bold text-slate-400">Duration</p>
                    <p className="text-base font-black text-emerald-900">{routeData?.duration_minutes || 64} min</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-emerald-100">
                    <p className="text-[10px] font-bold text-slate-400">CO₂ Saved</p>
                    <p className="text-base font-black text-emerald-600">+{routeData?.carbon_saved_kg || 28.4} kg</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-emerald-800/80">
                  Consolidates 4 separate smallholder pickups into 1 optimized electric/diesel route.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-amber-800 flex items-center gap-1.5">
                    <Fuel className="h-4 w-4 text-amber-600" /> Individual Farm Trips
                  </span>
                  <span className="rounded-full bg-amber-600 text-white px-2 py-0.5 text-[10px] font-black">
                    HIGH COST
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white p-2 border border-amber-100">
                    <p className="text-[10px] font-bold text-slate-400">Total Dist.</p>
                    <p className="text-base font-black text-amber-900">{routeData?.individual_distance_km || 136.2} km</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-amber-100">
                    <p className="text-[10px] font-bold text-slate-400">Duration</p>
                    <p className="text-base font-black text-amber-900">240 min</p>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-amber-100">
                    <p className="text-[10px] font-bold text-slate-400">Fuel Cost</p>
                    <p className="text-base font-black text-amber-900">₹2,840</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-amber-800/80">
                  Every farmer independently drives to APMC mandi, causing traffic congestion &amp; fuel waste.
                </p>
              </div>
            )}
          </div>

          {/* Consolidated Orders List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-slate-900">Orders in Dispatch</h3>
                <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
                  {filteredOrders.length}
                </span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600"
              >
                <option value="All">All Status</option>
                <option value="placed">Placed</option>
                <option value="routed">Routed</option>
                <option value="picked_up">Picked Up</option>
                <option value="delivered">Delivered</option>
                <option value="settled">Settled</option>
              </select>
            </div>

            <div className="space-y-2.5">
              {filteredOrders.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No orders matching filter.</p>
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
                            {ord.crop_type} Lot · {ord.quantity_kg} kg
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
                  Live Dispatch Geographic Tracking
                </h3>
              </div>
              {selectedOrder && (
                <span className="rounded-full bg-emerald-800 px-3 py-1 text-xs font-bold text-white shadow-xs">
                  Active Lot #{selectedOrder.id}
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
                stops={
                  routeData?.stops || [
                    { lat: 21.2514, lng: 81.6296, label: "Mandi Pickup Point 1 (Birgaon)" },
                    { lat: 21.1938, lng: 81.65, label: "Village Farm Pickup 2 (Abhanpur)" },
                    { lat: 21.23, lng: 81.67, label: "Central Buyer Hub (Raipur)" },
                  ]
                }
                height="h-[300px] sm:h-[380px] md:h-[460px]"
              />
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
                      2-Stage UPI Escrow Trigger
                    </h3>
                    <p className="text-xs text-slate-500">
                      Order #{selectedOrder.id} • Total Escrow: ₹{selectedOrder.total_amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <Badge variant="verified">Escrow Locked</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleTriggerPayout(selectedOrder.id, "pickup")}
                  disabled={isSettling}
                  className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 text-left transition hover:bg-amber-100/70 active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                      Stage 1 • Pickup Verified
                    </span>
                    <span className="rounded-full bg-amber-600 text-white px-2 py-0.5 text-[10px] font-bold">
                      40% Advance
                    </span>
                  </div>
                  <p className="mt-2 text-base font-black text-slate-900">
                    ₹{(selectedOrder.total_amount * 0.4).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">Disburses to farmer UPI upon vehicle loading scan</p>
                </button>

                <button
                  onClick={() => handleTriggerPayout(selectedOrder.id, "delivery")}
                  disabled={isSettling}
                  className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 text-left transition hover:bg-emerald-100/70 active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                      Stage 2 • Buyer Acceptance
                    </span>
                    <span className="rounded-full bg-emerald-700 text-white px-2 py-0.5 text-[10px] font-bold">
                      60% Final
                    </span>
                  </div>
                  <p className="mt-2 text-base font-black text-slate-900">
                    ₹{(selectedOrder.total_amount * 0.6).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">Disburses remaining amount after QC weigh-in</p>
                </button>
              </div>

              {payoutData && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                        UPI Payment Disbursed Instantly
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
