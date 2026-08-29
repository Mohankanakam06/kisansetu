"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Lot, CropType, QualityGrade } from "@/types";
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
} from "lucide-react";

// Client-only dynamic Leaflet Map to avoid SSR errors
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[450px] bg-soil-100 animate-pulse rounded-xl flex items-center justify-center text-soil-400">
      Loading interactive map...
    </div>
  ),
});

const CROPS: string[] = ["All", "Tomato", "Onion", "Potato", "Wheat", "Chilli"];
const GRADES: string[] = ["All", "A", "B", "C"];

export default function BuyerPage() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [orderingLot, setOrderingLot] = useState<Lot | null>(null);
  const [cropFilter, setCropFilter] = useState<string>("All");
  const [gradeFilter, setGradeFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  const fetchLots = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getLots({
        crop: cropFilter === "All" ? undefined : cropFilter,
        grade: gradeFilter === "All" ? undefined : gradeFilter,
        search: searchQuery || undefined,
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
  }, [cropFilter, gradeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLots();
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
    <div className="flex-1 bg-soil-50 flex flex-col">
      {/* Header Bar */}
      <div className="bg-white border-b border-soil-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white">
                <ShoppingCart className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Buyer Marketplace
              </span>
            </div>
            <h1 className="font-display text-2xl font-semibold text-soil-900 mt-1 sm:text-3xl">
              Aggregated Farm Produce Lots
            </h1>
            <p className="text-xs text-soil-500">
              Direct-from-farm clusters graded by AI with instant logistics routing
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="success" size="md">
              <Sparkles className="w-3.5 h-3.5" />
              Direct Farm Pricing
            </Badge>
            <Badge variant="info" size="md">
              {lots.length} Lots Available
            </Badge>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-soil-100 flex flex-wrap items-center justify-between gap-3">
          {/* Crop Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-xs font-semibold text-soil-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Crop:
            </span>
            {CROPS.map((crop) => (
              <button
                key={crop}
                onClick={() => setCropFilter(crop)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                  cropFilter === crop
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-soil-100 text-soil-700 hover:bg-soil-200"
                }`}
              >
                {crop}
              </button>
            ))}
          </div>

          {/* Grade Chips & Search */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-soil-500 mr-1">Grade:</span>
              {GRADES.map((grade) => (
                <button
                  key={grade}
                  onClick={() => setGradeFilter(grade)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
                    gradeFilter === grade
                      ? "bg-soil-900 text-white border-soil-900"
                      : "bg-white text-soil-700 border-soil-200 hover:bg-soil-50"
                  }`}
                >
                  {grade === "All" ? "All" : `Grade ${grade}`}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search district / crop..."
                className="bg-white border border-soil-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-soil-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 w-44"
              />
              <Search className="w-3.5 h-3.5 text-soil-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </form>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left List, Right Map */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Lot Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-soil-500 font-medium">
            <span>SHOWING {lots.length} AGGREGATED LOTS</span>
            <button
              onClick={fetchLots}
              className="flex items-center gap-1 text-emerald-700 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh List
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-64 rounded-xl bg-white border border-soil-200 animate-pulse"
                />
              ))}
            </div>
          ) : lots.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-soil-200 p-8">
              <ShoppingCart className="w-10 h-10 text-soil-300 mx-auto mb-2" />
              <p className="font-semibold text-soil-700">No matching lots found</p>
              <p className="text-xs text-soil-400 mt-1">
                Try loosening your filters or list new produce in the Farmer portal.
              </p>
            </div>
          ) : (
            lots.map((lot) => (
              <LotCard
                key={lot.id}
                lot={lot}
                isSelected={selectedLot?.id === lot.id}
                onClick={() => setSelectedLot(lot)}
                onOrderClick={(l) => setOrderingLot(l)}
              />
            ))
          )}
        </div>

        {/* Right Column: Sticky Interactive Map */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
          <div className="h-[550px]">
            <LeafletMap
              lots={lots}
              selectedLot={selectedLot}
              onSelectLot={(lot) => setSelectedLot(lot)}
            />
          </div>

          {selectedLot && (
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-soil-400 uppercase tracking-wider">
                    Selected Lot Info
                  </span>
                  <h4 className="font-semibold text-soil-900">
                    {selectedLot.crop_type} • {selectedLot.centroid.district}
                  </h4>
                </div>
                <Badge variant="gradeA">Grade {selectedLot.grade}</Badge>
              </div>

              <div className="text-xs text-soil-600 space-y-1">
                <p>
                  <strong>Centroid:</strong> {selectedLot.centroid.address}
                </p>
                <p>
                  <strong>Total Volume:</strong> {selectedLot.total_quantity_kg} kg across{" "}
                  {selectedLot.listings_count} smallholders
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => setOrderingLot(selectedLot)}
              >
                Order This Lot
              </Button>
            </Card>
          )}
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

      {/* Order Success Notification */}
      {orderSuccess && (
        <div className="fixed bottom-6 right-6 z-[1000] bg-emerald-900 text-white p-4 rounded-xl shadow-2xl border border-emerald-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-sm">Order Placed Successfully!</p>
            <p className="text-xs text-emerald-200">
              Order ID: {orderSuccess.order_id} • Status: {orderSuccess.status}
            </p>
          </div>
          <a
            href="/orders"
            className="ml-3 bg-white text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-100"
          >
            Track Logistics →
          </a>
          <button
            onClick={() => setOrderSuccess(null)}
            className="text-emerald-300 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
