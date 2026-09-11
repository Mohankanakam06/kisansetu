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

export default function LotCard({ lot, isFeatured, onOrderClick }: LotCardProps) {
  const { t } = useLanguage();
  const cropEmoji = cropEmojis[lot.crop_type] || "🌿";
  const benchmarkPrice = BENCHMARK_MANDI[lot.crop_type] || lot.price_per_kg * 1.18;

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
    <div className={`group relative flex flex-col rounded-sm bg-white border-2 border-[#1E1F1C] shadow-[3px_3px_0_0_#1E1F1C] p-0 transition-all duration-150`}>
      {/* Visual Image area */}
      <div className="relative h-40 bg-[#EBECE8] overflow-hidden border-b-2 border-[#1E1F1C]">
        <CropPhoto
          crop={lot.crop_type}
          fallbackEmoji={cropEmoji}
          className="h-full w-full object-cover"
        />

        {/* Featured ribbon */}
        {isFeatured && (
          <div className="absolute top-0 right-0">
            <div className="bg-[#F4A261] text-[#1E1F1C] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-bl-sm border-l-2 border-b-2 border-[#1E1F1C]">
              ⭐ {t("Featured", "खास", "खास")}
            </div>
          </div>
        )}

        {/* Certified Quality Grade Pill */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          <Badge variant={isGradeA ? "gradeA" : "gradeB"} size="sm">
            {isGradeA ? <Leaf className="h-3 w-3" /> : <Check className="h-3 w-3" />}
            {isGradeA ? t("Grade A", "ग्रेड A", "ग्रेड A") : t("Grade B", "ग्रेड B", "ग्रेड B")}
          </Badge>

          {typeof freshnessHoursLeft === "number" && freshnessHoursLeft > 0 && (
            <Badge variant="neutral" size="sm">
              ⏳ {freshnessHoursLeft}h {t("Fresh", "ताज़ा", "ताजा")}
            </Badge>
          )}
        </div>

        {/* Trading window (mockup: dynamic from lot data ideally) */}
        <div className="absolute bottom-2 right-2">
            <span className="bg-[#EBECE8] border-2 border-[#1E1F1C] rounded-sm px-2 py-0.5 text-[10px] font-black text-[#1E1F1C]">
                ⏳ 06:00 - 10:00 AM
            </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display text-base font-bold text-[#1E1F1C]">
                {lot.crop_type}
              </h3>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-[#52544D]">
              <MapPin className="h-3.5 w-3.5 text-[#C04A22] shrink-0" />
              <span>{lot.centroid?.district || t("Raipur Hub", "रायपुर हब", "रायपुर हब")}</span>
              <span className="text-[#C2C5BC]">|</span>
              <span>2.4 km</span>
            </div>
          </div>
        </div>

        {/* Price & Quantity Grid */}
        <div className="mt-auto grid grid-cols-2 gap-2 mb-4">
          <div className="bg-[#EBECE8] border-2 border-[#1E1F1C] p-2 rounded-sm">
            <span className="text-[10px] font-black uppercase text-[#52544D]">{t("Volume", "मात्रा", "मात्रा")}</span>
            <p className="text-sm font-black text-[#1E1F1C] leading-none tabular-nums mt-1">{lot.total_quantity_kg.toLocaleString()} {t("kg", "किग्रा", "किलो")}</p>
          </div>
          <div className="bg-[#EBECE8] border-2 border-[#1E1F1C] p-2 rounded-sm">
            <span className="text-[10px] font-black uppercase text-[#52544D]">{t("Price", "मूल्य", "भाव")}</span>
            <p className="text-sm font-black text-[#1B4965] leading-none tabular-nums mt-1">₹{lot.price_per_kg}<span className="text-[10px] font-bold text-[#52544D]">/{t("kg", "किग्रा", "किलो")}</span></p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="buyer"
            className="flex-1 w-full"
            onClick={() => onOrderClick(lot)}
          >
            {t("Order Lot", "ऑर्डर करें", "ऑर्डर करव")}
          </Button>
        </div>
      </div>
    </div>
  );
}
