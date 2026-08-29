"use client";
import React, { useState, useEffect } from "react";
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
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [routeData, setRouteData] = useState<OptimizeRouteResponse | null>(null);
  const [payoutData, setPayoutData] = useState<SettlementPayoutResponse | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

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
    <div className="flex-1 bg-soil-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-soil-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                <Truck className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Logistics & Settlement Agent Hub
              </span>
            </div>
            <h1 className="font-display text-2xl font-semibold text-soil-900 mt-2 sm:text-3xl">
              Multi-Pickup Routing & Instant Payouts
            </h1>
            <p className="text-sm text-soil-600 mt-1">
              OR-Tools / OpenRouteService consolidated logistics with stage-wise automated UPI farmer settlement
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="success">
              <ShieldCheck className="w-3.5 h-3.5" />
              Smart Contract Escrow
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Orders List */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-bold text-sm text-soil-700 uppercase tracking-wider">
              Placed Orders ({orders.length})
            </h3>

            {orders.map((ord) => (
              <Card
                key={ord.id}
                hoverEffect
                onClick={() => setSelectedOrder(ord)}
                className={`cursor-pointer transition-all ${
                  selectedOrder?.id === ord.id
                    ? "ring-2 ring-emerald-500 border-emerald-300 bg-emerald-50/20"
                    : "bg-white"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-soil-400 font-semibold">{ord.id}</span>
                      <h4 className="font-bold text-soil-900">{ord.crop_type} Lot</h4>
                    </div>
                    <Badge
                      variant={
                        ord.status === "settled"
                          ? "success"
                          : ord.status === "routed"
                          ? "info"
                          : "warning"
                      }
                      size="sm"
                    >
                      {ord.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-soil-50 rounded-lg px-3">
                    <div>
                      <span className="text-soil-400 block">Quantity</span>
                      <span className="font-bold text-soil-800">{ord.quantity_kg} kg</span>
                    </div>
                    <div>
                      <span className="text-soil-400 block">Order Value</span>
                      <span className="font-bold text-emerald-700">₹{ord.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Right Column: Routing & Payout Action Hub */}
          <div className="lg:col-span-8 space-y-6">
            {selectedOrder ? (
              <>
                {/* 1. Logistics Routing Module */}
                <Card className="space-y-6 border-soil-200">
                  <div className="flex items-center justify-between border-b border-soil-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <Route className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-soil-900">
                          Multi-Pickup Logistics Route Optimization
                        </h3>
                        <p className="text-xs text-soil-500">
                          Consolidates individual farmer gate pickups into one optimal truck route
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isOptimizing}
                      onClick={() => handleOptimizeRoute(selectedOrder.id)}
                    >
                      <Navigation className="w-3.5 h-3.5 mr-1" />
                      {routeData ? "Re-Optimize Route" : "Compute Optimal Route"}
                    </Button>
                  </div>

                  {routeData ? (
                    <div className="space-y-6 animate-in fade-in">
                      {/* Efficiency Metric Callout */}
                      <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-900 to-emerald-800 text-white">
                        <div>
                          <span className="text-[11px] text-emerald-300 block uppercase font-bold">Consolidated Route</span>
                          <p className="text-2xl font-bold">{routeData.distance_km} km</p>
                          <span className="text-[10px] text-emerald-200">ETA: {routeData.duration_minutes} mins</span>
                        </div>
                        <div className="border-x border-emerald-700/60 px-4">
                          <span className="text-[11px] text-emerald-300 block uppercase font-bold">Separate Trips</span>
                          <p className="text-2xl font-bold line-through text-emerald-400/80">
                            {routeData.individual_distance_km} km
                          </p>
                          <span className="text-[10px] text-emerald-200">Traditional logistics</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-emerald-300 block uppercase font-bold">Distance Saved</span>
                          <p className="text-2xl font-bold text-amber-300">
                            -{(routeData.individual_distance_km! - routeData.distance_km).toFixed(1)} km
                          </p>
                          <span className="text-[10px] text-emerald-200">
                            🌱 {routeData.carbon_saved_kg}kg CO₂ emission prevented
                          </span>
                        </div>
                      </div>

                      {/* Waypoints Sequence */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-soil-700 uppercase tracking-wider">
                          Consolidated Pickup Sequence ({routeData.stops.length} Stops)
                        </h4>
                        <div className="space-y-2">
                          {routeData.stops.map((stop, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-lg border border-soil-200 bg-white text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-soil-100 font-bold text-soil-700 flex items-center justify-center">
                                  {idx + 1}
                                </div>
                                <div>
                                  <span className="font-bold text-soil-900">{stop.farmer_name}</span>
                                  <span className="text-soil-400 block">{stop.address}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant={stop.stop_type === "delivery" ? "info" : "success"} size="sm">
                                  {stop.stop_type === "delivery" ? "Destination Hub" : `Pickup ${stop.quantity_kg}kg`}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-soil-50 rounded-xl border border-dashed border-soil-300">
                      <Route className="w-8 h-8 text-soil-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-soil-700">Route not yet computed</p>
                      <p className="text-xs text-soil-400 mt-1">
                        Click "Compute Optimal Route" to run the OpenRouteService solver.
                      </p>
                    </div>
                  )}
                </Card>

                {/* 2. Instant Settlement Agent Module */}
                <Card className="space-y-6 border-soil-200">
                  <div className="flex items-center justify-between border-b border-soil-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-soil-900">
                          Instant Farmer Settlement Simulator
                        </h3>
                        <p className="text-xs text-soil-500">
                          Simulate milestone-based UPI payouts directly to farmers upon pickup & delivery
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="harvest"
                        size="sm"
                        isLoading={isSettling}
                        onClick={() => handleTriggerPayout(selectedOrder.id, "pickup")}
                      >
                        <IndianRupee className="w-3.5 h-3.5 mr-1" />
                        Stage 1: 40% Pickup Payout
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={isSettling}
                        onClick={() => handleTriggerPayout(selectedOrder.id, "delivery")}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Stage 2: 60% Final Settlement
                      </Button>
                    </div>
                  </div>

                  {payoutData ? (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                            Live Payment Gateway Payout
                          </span>
                          <h4 className="font-bold text-emerald-950 text-lg">
                            ₹{payoutData.amount.toLocaleString()} Disbursed
                          </h4>
                          <p className="text-xs font-mono text-emerald-700 mt-0.5">
                            Transaction Ref: {payoutData.transaction_id}
                          </p>
                        </div>
                        <Badge variant="success" size="md">
                          UPI DISBURSED LIVE
                        </Badge>
                      </div>

                      {/* Farmer Breakdowns */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-soil-700 uppercase tracking-wider block">
                          Individual Farmer Direct Beneficiary Accounts:
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {payoutData.farmer_payouts?.map((fp, i) => (
                            <div
                              key={i}
                              className="p-3 bg-white rounded-lg border border-soil-200 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-soil-900 block">{fp.farmer_name}</span>
                                <span className="text-soil-400 font-mono text-[10px]">{fp.upi_id}</span>
                              </div>
                              <span className="font-bold text-emerald-700 text-sm">
                                ₹{fp.amount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-soil-50 rounded-xl border border-dashed border-soil-300">
                      <Wallet className="w-8 h-8 text-soil-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-soil-700">No payouts triggered for this order</p>
                      <p className="text-xs text-soil-400 mt-1">
                        Use the buttons above to simulate milestone-based farm-gate payouts.
                      </p>
                    </div>
                  )}
                </Card>
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-soil-200">
                <p className="text-soil-500 font-semibold">Select an order from the left to view logistics and payouts</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
