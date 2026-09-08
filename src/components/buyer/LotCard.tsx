"use client";
import React from "react";
import Link from "next/link";
import { Lot } from "@/types";
import { Badge, Button } from "@/components/ui";
import CropPhoto from "@/components/buyer/CropPhoto";
import {
  MapPin,
  ChevronRight,
  TrendingDown,
} from "lucide-react";

interface LotCardProps {
  lot: Lot;
  isFeatured?: boolean;
  onOrderClick: (lot: Lot) => void;
}

const cropEmojis: Record<string, string> = {
  Tomato: "🍅",
  Onion: "🧅",
  Potato: "🥔",
  Wheat: "🌾",
  Rice: "🍚",
  Soybean: "🫘",
  Chilli: "🌶️",
  Ginger: "🫞",
  Garlic: "🧄",
  Cotton: "🌼",
};

const BENCHMARK_MANDI: Record<string, number> = {
  Tomato: 26.5,
  Onion: 32.0,
  Potato: 22.0,
  Wheat: 27.5,
  Rice: 36.0,
  Soybean: 46.5,
  Chilli: 72.0,
  Ginger: 88.0,
  Garlic: 95.0,
  Cotton: 62.0,
};

export default function LotCard({ lot, onOrderClick }: LotCardProps) {
  const cropEmoji = cropEmojis[lot.crop_type] || "🌿";
  const benchmarkPrice = BENCHMARK_MANDI[lot.crop_type] || lot.price_per_kg * 1.18;
  const savingsPerKg = Math.max(0, benchmarkPrice - lot.price_per_kg);
  const savingsPct = Math.round((savingsPerKg / benchmarkPrice) * 100);

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300">
      {/* Visual Image area */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <CropPhoto
          crop={lot.crop_type}
          fallbackEmoji={cropEmoji}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Grade Pill */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
              lot.grade === "A"
                ? "bg-emerald-700 text-white"
                : lot.grade === "B"
                ? "bg-amber-600 text-white"
                : "bg-slate-700 text-white"
            }`}
          >
            Grade {lot.grade}
          </span>
        </div>

        {/* Pooled count badge */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-900/75 text-white text-xs font-medium backdrop-blur-xs">
            {lot.listings_count || 3} Farms Pooled
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              {lot.crop_type} Wholesale Lot
            </h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{lot.centroid?.district || "Raipur Hub"}</span>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-slate-400">#{lot.id}</span>
        </div>

        {/* Price & Quantity Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
          <div>
            <span className="text-[11px] font-medium text-slate-500">Available Volume</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{lot.total_quantity_kg.toLocaleString()} kg</p>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500">Direct Price</span>
            <p className="text-sm font-bold text-emerald-800 mt-0.5">
              ₹{lot.price_per_kg}<span className="text-xs font-normal text-slate-500">/kg</span>
            </p>
          </div>
        </div>

        {/* Savings Notice */}
        {savingsPerKg > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-800 font-medium bg-emerald-50/60 rounded-lg px-2.5 py-1.5 border border-emerald-100">
            <TrendingDown className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Save ₹{savingsPerKg.toFixed(1)}/kg vs APMC rate</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto pt-4 flex items-center gap-2">
          <Link
            href={`/buyer/${lot.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Details <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </Link>
          <Button
            size="sm"
            variant="primary"
            className="flex-1"
            onClick={() => onOrderClick(lot)}
          >
            Order Lot
          </Button>
        </div>
      </div>
    </div>
  );
}
