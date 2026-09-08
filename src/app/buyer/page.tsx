"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Lot } from "@/types";
import { apiService } from "@/services/api";
import LotCard from "@/components/buyer/LotCard";
import LotDetailModal from "@/components/buyer/LotDetailModal";
import { Button } from "@/components/ui";
import {
  Search,
  ShoppingCart,
  Grid,
  Map,
  X,
  CheckCircle,
  Truck,
  SlidersHorizontal,
} from "lucide-react";

// Client-only dynamic Leaflet Map to avoid SSR errors
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-medium text-sm">
      Loading map...
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
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

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
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, [cropFilter, gradeFilter, priceMin, priceMax, searchQuery]);

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
      {/* Header */}
      <div className="border-b border-slate-200 bg-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Wholesale Produce Lots
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Directly pooled from verified local farmers in the Raipur cluster.
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  viewMode === "grid" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Grid className="h-3.5 w-3.5" /> Grid
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  viewMode === "map" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Map className="h-3.5 w-3.5" /> Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Filters</span>
                {(cropFilter !== "All" || gradeFilter !== "All" || priceMin || priceMax || searchQuery) && (
                  <button onClick={clearFilters} className="text-xs font-medium text-emerald-700 hover:text-emerald-800">
                    Reset
                  </button>
                )}
              </div>

              {/* Crop Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Produce</label>
                <div className="flex flex-wrap gap-1.5">
                  {CROPS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCropFilter(c)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        cropFilter === c
                          ? "bg-emerald-700 text-white"
                          : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grade Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Quality Grade</label>
                <div className="flex gap-2">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGradeFilter(g)}
                      className={`flex-1 py-1 rounded-md text-xs font-medium border text-center transition-colors ${
                        gradeFilter === g
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Price (₹/kg)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Area */}
          <div className="flex-1 min-w-0">
            {/* Search Input */}
            <div className="mb-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by crop or location (e.g. Tomato, Raipur)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Map View */}
            {viewMode === "map" && (
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm mb-6 h-[500px]">
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
                  <div key={n} className="h-72 rounded-2xl bg-white border border-slate-200 p-4 animate-pulse">
                    <div className="h-36 bg-slate-100 rounded-xl mb-4" />
                    <div className="h-4 bg-slate-100 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && lots.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <ShoppingCart className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                <h3 className="text-base font-semibold text-slate-900">No matching produce lots</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try clearing your filters or searching for another crop.
                </p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={clearFilters}>
                  Clear Filters
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
        <div className="fixed bottom-6 right-6 z-50 max-w-md rounded-xl bg-slate-900 text-white p-4 shadow-xl border border-slate-800 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Order placed successfully</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Order ID: <span className="font-mono text-slate-200 font-semibold">{orderSuccess.order_id}</span>
            </p>
            <div className="mt-3 flex items-center gap-2">
              <a
                href="/orders"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Track in Logistics Dashboard &rarr;
              </a>
            </div>
          </div>
          <button onClick={() => setOrderSuccess(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
