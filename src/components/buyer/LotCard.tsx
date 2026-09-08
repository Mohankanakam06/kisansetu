"use client";
import React from "react";
import Link from "next/link";
import { Lot } from "@/types";
import { Badge, Button } from "@/components/ui";
import CropPhoto from "@/components/buyer/CropPhoto";
import { useLanguage } from "@/lib/language";
import {
  MapPin,
  ChevronRight,
  TrendingDown,
  Sprout,
  Check,
  Leaf,
  PackageCheck,
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

// Deterministic farmer avatar palettes for the pooled stack
const AVATAR_COLORS = ["bg-emerald-600", "bg-amber-500", "bg-teal-600", "bg-forest-700", "bg-lime-600", "bg-green-700"];

export default function LotCard({ lot, isFeatured, onOrderClick }: LotCardProps) {
  const { t } = useLanguage();
  const cropEmoji = cropEmojis[lot.crop_type] || "🌿";
  const benchmarkPrice = BENCHMARK_MANDI[lot.crop_type] || lot.price_per_kg * 1.18;
  const savingsPerKg = Math.max(0, benchmarkPrice - lot.price_per_kg);
  const savingsPct = Math.round((savingsPerKg / benchmarkPrice) * 100);

  const pooledCount = lot.listings_count || 3;
  const farmerInitials = (lot.listings || []).map((l) =>
    (l.farmer_name || "F").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
  );
  // Fall back to deterministic initials when listing detail isn't loaded
  const initials = farmerInitials.length
    ? farmerInitials.slice(0, 4)
    : Array.from({ length: Math.min(pooledCount, 4) }, (_, i) => `F${i + 1}`);

  const isGradeA = lot.grade === "A";
  const volumeProgress = Math.min(100, Math.round((lot.total_quantity_kg / 5000) * 100));

  return (
    <div className={`group relative flex flex-col rounded-2xl border bg-white overflow-hidden shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover ${isFeatured ? "border-emerald-300 ring-2 ring-emerald-100" : "border-slate-200 hover:border-emerald-300"}`}>
      {/* Visual Image area */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <CropPhoto
          crop={lot.crop_type}
          fallbackEmoji={cropEmoji}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Featured ribbon */}
        {isFeatured && (
          <div className="absolute top-0 right-0">
            <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
              ⭐ {t("Featured Lot", "विशेष लॉट", "खास लॉट")}
            </div>
          </div>
        )}

        {/* Certified Quality Grade Pill */}
        <div className="absolute top-3 left-3">
          {isGradeA ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black text-white bg-gradient-to-r from-emerald-700 to-[#005f39] shadow-sm">
              <Leaf className="h-3 w-3" /> {t("Grade A", "ग्रेड A", "ग्रेड A")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white bg-amber-600 shadow-sm">
              <Check className="h-3 w-3" /> {t("Grade B", "ग्रेड B", "ग्रेड B")}
            </span>
          )}
        </div>

        {/* Pooled Farm Stack (avatars) */}
        <div className="absolute bottom-3 left-3 flex items-center">
          <div className="flex -space-x-2">
            {initials.map((ini, i) => (
              <span
                key={i}
                className={`h-6 w-6 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} ring-2 ring-white flex items-center justify-center text-[8px] font-black text-white shadow-sm`}
              >
                {ini}
              </span>
            ))}
          </div>
          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full bg-slate-900/75 text-white text-[10px] font-bold backdrop-blur-xs">
            {pooledCount} {t("smallholders pooled", "किसान जुड़े हैं", "किसान मन जुड़े हे")}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display text-base font-bold text-slate-900">
                {lot.crop_type} {t("Wholesale Lot", "थोक लॉट", "थोक लॉट")}
              </h3>
              {isGradeA && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5">
                  <PackageCheck className="h-2.5 w-2.5" /> {t("Certified", "प्रमाणित", "प्रमाणित")}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{lot.centroid?.district || t("Raipur Hub", "रायपुर हब", "रायपुर हब")}</span>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-slate-400">#{lot.id}</span>
        </div>

        {/* Price & Quantity Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
          <div>
            <span className="text-[11px] font-medium text-slate-500">{t("Available Volume", "उपलब्ध मात्रा", "उपलब्ध मात्रा")}</span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{lot.total_quantity_kg.toLocaleString()} {t("kg", "किग्रा", "किलो")}</p>
            {/* Volume progress bar */}
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full ${isGradeA ? "bg-emerald-600" : "bg-amber-500"}`}
                style={{ width: `${volumeProgress}%` }}
              />
            </div>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500">{t("Direct Price", "सीधा मूल्य", "सीधा भाव")}</span>
            <p className="text-sm font-bold text-emerald-800 mt-0.5">
              ₹{lot.price_per_kg}<span className="text-xs font-normal text-slate-500">/{t("kg", "किग्रा", "किलो")}</span>
            </p>
            {savingsPerKg > 0 && (
              <p className="text-[10px] font-black text-emerald-700 mt-0.5">{savingsPct}% {t("below APMC", "मंडी से सस्ता", "मंडी ले सस्ता")}</p>
            )}
          </div>
        </div>

        {/* APMC Price Comparison Pill */}
        {savingsPerKg > 0 && (
          <div className="mt-3 flex items-center justify-between gap-1.5 text-xs rounded-lg px-2.5 py-1.5 border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
            <span className="flex items-center gap-1.5 text-emerald-900 font-bold">
              <TrendingDown className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              {t("Save", "बचत", "बचत")} ₹{savingsPerKg.toFixed(1)}/{t("kg vs Mandi", "किग्रा मंडी की तुलना में", "किलो मंडी के तुलना म")}
            </span>
            <span className="text-[10px] font-black uppercase text-emerald-600 bg-white border border-emerald-100 rounded-full px-2 py-0.5">
              ₹{benchmarkPrice.toFixed(1)} {t("APMC", "मंडी", "मंडी")}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto pt-4 flex items-center gap-2">
          <Link
            href={`/buyer/${lot.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            {t("Details", "विवरण", "बिबरन")} <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </Link>
          <Button
            size="sm"
            variant="primary"
            className="flex-1 shadow-sm"
            onClick={() => onOrderClick(lot)}
          >
            {t("Order Lot", "ऑर्डर करें", "ऑर्डर करव")}
          </Button>
        </div>
      </div>
    </div>
  );
}
