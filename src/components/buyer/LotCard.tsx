"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Lot } from "@/types";
import { Badge, Button } from "@/components/ui";
import CropPhoto from "@/components/buyer/CropPhoto";
import {
  MapPin,
  Truck,
  Users,
  Award,
  ChevronRight,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  Clock,
  IndianRupee,
  Layers,
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

// Benchmark mandi average rates for direct comparison
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

export default function LotCard({ lot, isFeatured = false, onOrderClick }: LotCardProps) {
  const cropEmoji = cropEmojis[lot.crop_type] || "🌿";
  const benchmarkPrice = BENCHMARK_MANDI[lot.crop_type] || lot.price_per_kg * 1.18;
  const savingsPerKg = Math.max(0, benchmarkPrice - lot.price_per_kg);
  const savingsPct = Math.round((savingsPerKg / benchmarkPrice) * 100);

  const gradeColor =
    lot.grade === "A"
      ? "bg-emerald-600 text-white"
      : lot.grade === "B"
      ? "bg-amber-600 text-white"
      : "bg-slate-700 text-white";

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-card-hover ${
        isFeatured
          ? "md:col-span-2 xl:col-span-3 flex flex-col md:flex-row bg-gradient-to-br from-white via-white to-emerald-50/20"
          : "flex flex-col"
      }`}
    >
      {/* Visual Image area */}
      <div
        className={`relative bg-slate-900 overflow-hidden shrink-0 ${
          isFeatured ? "h-56 md:w-5/12 md:h-auto" : "h-52"
        }`}
      >
        <div className="absolute inset-0">
          <CropPhoto
            crop={lot.crop_type}
            fallbackEmoji={cropEmoji}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Ambient Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black tracking-wide shadow-md ${gradeColor}`}>
            <Award className="h-3 w-3" /> Grade {lot.grade} AI Certified
          </span>
          {isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-slate-950 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-md animate-pulse">
              <Sparkles className="h-3 w-3" /> High Volume
            </span>
          )}
        </div>

        {/* Bottom Image Overlay — Farmers & Freshness */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
          {/* Overlapping Farmer Avatars */}
          <div className="flex items-center">
            <div className="flex -space-x-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white ring-2 ring-white">
                👨🏽‍🌾
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-[11px] font-bold text-white ring-2 ring-white">
                👩🏽‍🌾
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-[11px] font-bold text-white ring-2 ring-white">
                🧑🏽‍🌾
              </span>
            </div>
            <span className="ml-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
              {lot.listings_count} Pooled Farms
            </span>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 backdrop-blur">
            <Clock className="h-3 w-3" /> Ready
          </span>
        </div>
      </div>

      {/* Content / Bento Data Area */}
      <div className={`flex flex-1 flex-col p-5 sm:p-6 ${isFeatured ? "md:w-7/12" : ""}`}>
        {/* Header Title + Lot ID */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-800 transition-colors">
                {lot.crop_type} Aggregated Cluster
              </h3>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span className="truncate">
                {lot.centroid.district || "Raipur"} • {lot.centroid.address || "Chhattisgarh Cluster Hub"}
              </span>
            </div>
          </div>
          <span className="rounded-lg bg-slate-100 border border-slate-200 px-2 py-1 font-mono text-[11px] font-bold text-slate-600 shrink-0">
            #{lot.id}
          </span>
        </div>

        {/* Mandi vs KisanSetu Price Savings Callout */}
        {savingsPerKg > 0 && (
          <div className="mt-3.5 flex items-center justify-between rounded-xl bg-emerald-50/80 border border-emerald-200/80 px-3 py-2 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-emerald-900">
              <TrendingDown className="h-4 w-4 text-emerald-600 shrink-0" />
              Save ₹{savingsPerKg.toFixed(1)}/kg ({savingsPct}% cheaper)
            </span>
            <span className="text-[11px] text-slate-500">vs APMC avg ₹{benchmarkPrice}</span>
          </div>
        )}

        {/* Price / Quantity Meta Bento */}
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Lot Qty</p>
            <p className="mt-0.5 text-sm font-black text-slate-900">{lot.total_quantity_kg.toLocaleString()} kg</p>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Direct Rate</p>
            <p className="mt-0.5 text-sm font-black text-emerald-700">₹{lot.price_per_kg}<span className="text-[10px] font-semibold text-slate-500">/kg</span></p>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Value</p>
            <p className="mt-0.5 text-sm font-black text-slate-900">
              ₹{(lot.total_quantity_kg * lot.price_per_kg).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Farmer Pool Preview (for featured) */}
        {isFeatured && lot.listings && lot.listings.length > 0 && (
          <div className="mt-4 hidden md:block">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
              <Layers className="h-3.5 w-3.5 text-emerald-600" />
              Farmer Pool Breakdown (Single Consolidated Dispatch)
            </p>
            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {lot.listings.slice(0, 3).map((f) => (
                <div key={f.listing_id} className="flex items-center justify-between rounded-lg bg-white border border-slate-200/80 px-2.5 py-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                      {f.farmer_name[0]}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{f.farmer_name}</p>
                      <p className="text-[10px] text-slate-400">{f.location?.address || "Farm Gate"} • ₹{f.price_per_kg}/kg</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">{f.quantity_kg} kg</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logistics & Trust strip */}
        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <Truck className="h-3.5 w-3.5" /> Clustered Route Ready
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> UPI Escrow Lock
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex items-center gap-2.5 pt-5">
          <Link
            href={`/buyer/${lot.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:border-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
          >
            Lot Details
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Button
            size="md"
            variant="primary"
            className="flex-1 rounded-xl shadow-glow"
            onClick={() => onOrderClick(lot)}
          >
            <IndianRupee className="h-4 w-4" />
            Place B2B Order
          </Button>
        </div>
      </div>
    </div>
  );
}
