"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Lot } from "@/types";
import { apiService } from "@/services/api";
import LotCard from "@/components/buyer/LotCard";
import LotDetailModal from "@/components/buyer/LotDetailModal";
import { Button, Badge, Card } from "@/components/ui";
import {
  Search,
  Filter,
  ShoppingCart,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  CheckCircle,
  Grid,
  Map,
  X,
  TrendingDown,
  ShieldCheck,
  Truck,
  Leaf,
  Layers,
  ArrowRight,
} from "lucide-react";

// Client-only dynamic Leaflet Map to avoid SSR errors
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[450px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-500 font-semibold">
      Loading interactive cluster map...
    </div>
  ),
});

const CROPS: string[] = ["All", "Tomato", "Onion", "Potato", "Wheat", "Rice", "Soybean", "Chilli", "Cotton"];
const GRADES: string[] = ["All", "A", "B", "C"];

export default function BuyerPage() {
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
  const [viewMode, setViewMode] = useState<"split" | "grid" | "map">("split");
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  const fetchLots = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getLots({
        crop: cropFilter === "All" ? undefined : cropFilter,
        grade: gradeFilter === "All" ? undefined : gradeFilter,
        search: searchQuery || undefined,
        minPrice: priceMin ? Number(priceMin) : undefined,
        maxPrice: priceMax ? Number(priceMax) : undefined,
      });
      setLots(res.lots);
      if (res.lots.length > 0 && !selectedLot) {
        setSelectedLot(res.lots[0]);
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, [cropFilter, gradeFilter, priceMin, priceMax, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLots();
  };

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

  const featuredLot = lots[0];
  const remainingLots = lots.slice(1);

  // Compute aggregate totals for marketplace stats
  const totalQuantityKg = lots.reduce((acc, l) => acc + (l.total_quantity_kg || 0), 0);
  const totalFarmersPooled = lots.reduce((acc, l) => acc + (l.listings_count || 0), 0);

  return (
    <div className="flex-1 flex flex-col bg-[#f8faf9]">
      {/* Top Marketplace Header Banner */}
      <div className="border-b border-slate-200 bg-white pt-6 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 border border-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" /> Institutional & Retail Hub
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  APMC Raipur Clustered Basin
                </span>
              </div>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-950">
                Aggregated Farm Produce Marketplace
              </h1>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                Source directly from AI-pooled farmer clusters. Guaranteed Grade A/B quality, consolidated pickup routes, and transparent UPI milestone escrow.
              </p>
            </div>

            {/* Live Agtech KPI Pills */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Active Lots</p>
                <p className="font-display text-lg font-extrabold text-emerald-950">{lots.length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Volume Pooled</p>
                <p className="font-display text-lg font-extrabold text-slate-900">{(totalQuantityKg / 1000).toFixed(1)} MT</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Farmers</p>
                <p className="font-display text-lg font-extrabold text-amber-950">{totalFarmersPooled || 24}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Marketplace Workspace */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden xl:block w-72 flex-shrink-0 sticky top-28 self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-emerald-700" /> Filter Lots
                </span>
                {(cropFilter !== "All" || gradeFilter !== "All" || priceMin || priceMax) && (
                  <button onClick={clearFilters} className="text-xs font-bold text-emerald-700 hover:text-emerald-800">
                    Reset
                  </button>
                )}
              </div>

              {/* Crop Type */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2.5">
                  Produce Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CROPS.map((c) => {
                    const active = cropFilter === c;
                    return (
                      <button
                        key={c}
                        onClick={() => setCropFilter(c)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                          active
                            ? "bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30"
                            : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Quality Grade */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2.5">
                  AI Quality Grade
                </label>
                <div className="space-y-2">
                  {GRADES.map((g) => (
                    <label
                      key={g}
                      className="flex items-center justify-between rounded-xl border border-slate-200/80 px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="grade"
                          value={g}
                          checked={gradeFilter === g}
                          onChange={() => setGradeFilter(g)}
                          className="w-4 h-4 accent-emerald-700"
                        />
                        {g === "All" ? "All Grades" : `Grade ${g} (${g === "A" ? "Premium" : g === "B" ? "Standard" : "Commercial"})`}
                      </span>
                      {g === "A" && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">Top Tier</span>}
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Price Range */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2.5">
                  Price Filter (₹/kg)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <span className="text-slate-400 font-bold">–</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Instant Action CTA in Sidebar */}
              <div className="rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 p-4 text-white">
                <p className="text-xs font-extrabold tracking-wide uppercase text-emerald-300">Procure in Bulk?</p>
                <p className="mt-1 text-xs text-emerald-100/90 leading-relaxed">
                  Need customized clustering over 10 MT? Connect with our Raipur Logistics Hub coordinator.
                </p>
                <a
                  href="/support"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/30 backdrop-blur"
                >
                  Contact Hub Manager <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Search Bar & View Mode Switcher */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search lots by crop or district… e.g. Tomato, Raipur, Durg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
                />
              </form>

              {/* View switchers */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                  <button
                    onClick={() => setViewMode("split")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      viewMode === "split" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Split View
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      viewMode === "grid" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Grid className="h-3.5 w-3.5 inline mr-1" /> Grid
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      viewMode === "map" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Map className="h-3.5 w-3.5 inline mr-1" /> Map
                  </button>
                </div>

                <Button variant="outline" size="sm" onClick={fetchLots} className="rounded-xl">
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
                </Button>
              </div>
            </div>

            {/* Interactive Leaflet Map (In Split or Map view) */}
            {(viewMode === "split" || viewMode === "map") && (
              <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 shadow-card bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Map className="h-3.5 w-3.5 text-emerald-700" /> Clustered Lot Geographic Coordinates
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">Tap pin to preview batch cluster</span>
                </div>
                <LeafletMap
                  lots={lots}
                  selectedLot={selectedLot}
                  onSelectLot={(lot) => setSelectedLot(lot)}
                  height={viewMode === "map" ? "h-[580px]" : "h-[360px]"}
                />
              </div>
            )}

            {/* Grid of Lot Cards */}
            {(viewMode === "split" || viewMode === "grid") && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {featuredLot && (
                  <LotCard
                    key={featuredLot.id}
                    lot={featuredLot}
                    isFeatured
                    onOrderClick={() => setOrderingLot(featuredLot)}
                  />
                )}
                {remainingLots.map((lot) => (
                  <LotCard
                    key={lot.id}
                    lot={lot}
                    onOrderClick={() => setOrderingLot(lot)}
                  />
                ))}
              </div>
            )}

            {/* Shimmer Skeleton Loading */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-80 rounded-2xl bg-white border border-slate-200 p-5 animate-pulse flex flex-col justify-between">
                    <div className="h-44 rounded-xl bg-slate-200" />
                    <div className="space-y-2 mt-4">
                      <div className="h-5 w-3/4 rounded bg-slate-200" />
                      <div className="h-4 w-1/2 rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && lots.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-3 font-display text-lg font-bold text-slate-900">No matching produce lots found</h3>
                <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                  Try adjusting your price or crop filters, or view all available clusters.
                </p>
                <Button variant="primary" className="mt-6 rounded-xl" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Dialog Modal */}
      {orderingLot && (
        <LotDetailModal
          lot={orderingLot}
          onClose={() => setOrderingLot(null)}
          onOrderConfirm={handleOrderConfirm}
        />
      )}

      {/* Order Success Toast Notification */}
      {orderSuccess && (
        <div className="fixed bottom-6 right-6 z-[1000] max-w-md rounded-2xl bg-emerald-950 text-white p-5 shadow-2xl border border-emerald-800 flex items-start gap-3.5 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold tracking-tight">Order Placed & Escrow Locked!</p>
            <p className="mt-0.5 text-xs text-emerald-200">
              Order ID: <span className="font-mono font-bold text-white">{orderSuccess.order_id}</span>
            </p>
            <div className="mt-3 flex items-center gap-2">
              <a
                href="/orders"
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
              >
                <Truck className="h-3.5 w-3.5" /> View Logistics Route →
              </a>
              <button
                onClick={() => setOrderSuccess(null)}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button onClick={() => setOrderSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
