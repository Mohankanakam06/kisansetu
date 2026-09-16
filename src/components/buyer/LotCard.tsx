"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Lot } from "@/types";
import { Badge, Button } from "@/components/ui";
import CropPhoto from "@/components/buyer/CropPhoto";
import { useLanguage } from "@/lib/language";
import {
  MapPin,
  ChevronRight,
  TrendingDown,
  Check,
  Leaf,
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

function useTradeWindow(tradeStart?: string, tradeEnd?: string) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!tradeStart && !tradeEnd) return;

    const compute = () => {
      const now = Date.now();
      const start = tradeStart ? new Date(tradeStart).getTime() : NaN;
      const end = tradeEnd ? new Date(tradeEnd).getTime() : NaN;

      if (!Number.isNaN(start) && now < start) {
        const diff = start - now;
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setLabel(`⏳ Starts in ${hrs}h ${mins}m`);
        return;
      }
      if (!Number.isNaN(end) && !Number.isNaN(start) && now >= start && now <= end) {
        const diff = end - now;
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setLabel(`⏳ Ends in ${hrs}h ${mins}m`);
        return;
      }
      if (!Number.isNaN(end) && now > end) {
        setLabel("⏳ Closed");
        return;
      }
      setLabel(null);
    };

    compute();
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, [tradeStart, tradeEnd]);

  return label;
}

export default function LotCard({ lot, isFeatured, onOrderClick }: LotCardProps) {
  const { t } = useLanguage();
  const cropEmoji = cropEmojis[lot.crop_type] || "🌿";
  const benchmarkPrice = BENCHMARK_MANDI[lot.crop_type] || lot.price_per_kg * 1.18;

  // Trading window countdown (live, updates every minute)
  const tradeWindowLabel = useTradeWindow(lot.trade_start, lot.trade_end);

  // Freshness: lots expire from the buyer pool after 24 hours
  const freshnessHoursLeft = (() => {
    try {
      if (!lot.created_at) return null;
      const created = new Date(lot.created_at).getTime();
      if (Number.isNaN(created)) return null;
      const ageMs = Date.now() - created;
      const remainingMs = 24 * 60 * 60 * 1000 - ageMs;
      const hrs = Math.ceil(remainingMs / (60 * 60 * 1000));
      return Math.max(0, hrs);
    } catch {
      return null;
    }
  })();
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
    <div className={`group relative flex flex-col rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-150 overflow-hidden`}>
      {/* Visual Image area */}
      <div className="relative h-44 bg-slate-100 overflow-hidden border-b border-slate-200">
        <CropPhoto
          crop={lot.crop_type}
          fallbackEmoji={cropEmoji}
          className="h-full w-full object-cover"
        />

        {/* Featured ribbon */}
        {isFeatured && (
          <div className="absolute top-0 right-0">
            <div className="bg-amber-500 text-amber-950 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-bl-xl shadow-xs">
              ⭐ {t("Featured", "खास", "खास")}
            </div>
          </div>
        )}

        {/* Certified Quality Grade Pill */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge variant={isGradeA ? "gradeA" : "gradeB"} size="sm" className="shadow-xs backdrop-blur-sm bg-white/90">
            {isGradeA ? <Leaf className="h-3 w-3" /> : <Check className="h-3 w-3" />}
            {isGradeA ? t("Grade A", "ग्रेड A", "ग्रेड A") : t("Grade B", "ग्रेड B", "ग्रेड B")}
          </Badge>

          {typeof freshnessHoursLeft === "number" && freshnessHoursLeft > 0 && (
            <Badge variant="neutral" size="sm" className="shadow-xs backdrop-blur-sm bg-white/90">
              ⏳ {freshnessHoursLeft}h {t("Fresh", "ताज़ा", "ताजा")}
            </Badge>
          )}
        </div>

        {/* Trading window — live countdown when trade_start/trade_end present, otherwise static fallback */}
        <div className="absolute bottom-3 right-3">
          <span className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm rounded-lg px-2.5 py-1 text-[10px] font-bold text-slate-900 border-b-2 border-b-slate-300">
            {tradeWindowLabel || "⏳ 06:00 - 10:00 AM"}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display text-lg font-bold text-slate-900">
                {lot.crop_type}
              </h3>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{lot.centroid?.district || t("Raipur Hub", "रायपुर हब", "रायपुर हब")}</span>
              <span className="text-slate-300 mx-1">•</span>
              <span className="font-semibold text-slate-600">2.4 km</span>
            </div>
          </div>
        </div>

        {/* Price & Quantity Grid */}
        <div className="mt-auto grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{t("Volume", "मात्रा", "मात्रा")}</span>
            <p className="text-sm font-extrabold text-slate-900 leading-none tabular-nums mt-1.5">{lot.total_quantity_kg.toLocaleString()} {t("kg", "किग्रा", "किलो")}</p>
          </div>
          <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-blue-700 tracking-wider flex items-center gap-1">₹ {t("Price", "मूल्य", "भाव")}</span>
            <p className="text-sm font-extrabold text-blue-950 leading-none tabular-nums mt-1.5">₹{lot.price_per_kg}<span className="text-[10px] font-semibold text-blue-700 font-sans ml-0.5">/{t("kg", "किग्रा", "किलो")}</span></p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-1">
          <Button
            size="md"
            variant="buyer"
            className="flex-1 w-full font-bold shadow-xs h-11"
            onClick={() => onOrderClick(lot)}
          >
            {t("Order Lot", "ऑर्डर करें", "ऑर्डर करव")}
          </Button>
        </div>
      </div>
    </div>
  );
}
