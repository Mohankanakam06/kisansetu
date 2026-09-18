"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Lot } from "@/types";
import { Badge, Button } from "@/components/ui";
import CropPhoto from "@/components/buyer/CropPhoto";
import { useLanguage } from "@/lib/language";
import { useFavorites } from "@/hooks/useFavorites";
import {
  MapPin,
  TrendingDown,
  Check,
  Leaf,
  Heart,
  Truck,
  Users,
  Sparkles,
  ArrowRight,
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

function safeParseDate(d: any): number | null {
  if (!d) return null;
  if (typeof d === "number") return d > 1e11 ? d : d * 1000;
  let s = String(d).trim();
  if (!s) return null;
  if (!s.includes("T") && s.includes(" ")) {
    s = s.replace(" ", "T");
  }
  const ts = new Date(s).getTime();
  return Number.isNaN(ts) ? null : ts;
}

function useTradeWindow(tradeStart?: string, tradeEnd?: string) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!tradeStart && !tradeEnd) return;

    const compute = () => {
      const now = Date.now();
      const start = safeParseDate(tradeStart) ?? NaN;
      const end = safeParseDate(tradeEnd) ?? NaN;

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
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isLikedAnim, setIsLikedAnim] = useState(false);

  const liked = isFavorite(lot.id);
  const cropEmoji = cropEmojis[lot.crop_type] || "🌿";
  const benchmarkPrice = BENCHMARK_MANDI[lot.crop_type] || Math.round(lot.price_per_kg * 1.18);
  const savingsPerKg = Math.max(0, benchmarkPrice - lot.price_per_kg);
  const savingsPct = Math.round((savingsPerKg / benchmarkPrice) * 100);

  // Trading window countdown
  const tradeWindowLabel = useTradeWindow(lot.trade_start, lot.trade_end);

  // Freshness countdown
  const freshnessHoursLeft = (() => {
    try {
      const created = safeParseDate(lot.created_at);
      if (!created) return 18; // default fallback
      const ageMs = Date.now() - created;
      const remainingMs = 24 * 60 * 60 * 1000 - ageMs;
      const hrs = Math.ceil(remainingMs / (60 * 60 * 1000));
      return Math.max(1, hrs);
    } catch {
      return 18;
    }
  })();

  const isGradeA = lot.grade === "A";
  const pooledCount = lot.listings_count || (lot.listings?.length ?? 3);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLikedAnim(true);
    toggleFavorite(lot.id);
    setTimeout(() => setIsLikedAnim(false), 300);
  };

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200 overflow-hidden">
      {/* Visual Image Banner with Badges & Like Button */}
      <div className="relative h-48 w-full bg-gradient-to-b from-slate-100 to-slate-200 overflow-hidden">
        <CropPhoto
          crop={lot.crop_type}
          fallbackEmoji={cropEmoji}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Badges overlay: Grade & Freshness */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-sm backdrop-blur-md ${
              isGradeA
                ? "bg-emerald-600 text-white"
                : "bg-amber-500 text-white"
            }`}
          >
            {isGradeA ? <Leaf className="h-3 w-3" /> : <Check className="h-3 w-3" />}
            {isGradeA ? t("Grade A Certified", "ग्रेड A प्रमाणित", "ग्रेड A प्रमाणित") : t("Grade B Standard", "ग्रेड B मानक", "ग्रेड B मानक")}
          </span>

          {freshnessHoursLeft > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-md shadow-xs border border-slate-200/60">
              ⏳ {freshnessHoursLeft}h {t("Fresh", "ताज़ा", "ताजा")}
            </span>
          )}
        </div>

        {/* Interactive Like / Wishlist Button (Blinkit / Zepto / Amazon Style) */}
        <button
          type="button"
          onClick={handleHeartClick}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 z-20 h-9 w-9 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all duration-150 cursor-pointer ${
            liked
              ? "bg-rose-50 text-rose-600 border border-rose-200 scale-105"
              : "bg-white/90 text-slate-500 hover:text-rose-500 hover:bg-white border border-slate-200/80"
          } ${isLikedAnim ? "scale-125" : ""}`}
        >
          <Heart
            className={`h-4.5 w-4.5 transition-colors ${
              liked ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>

        {/* Savings Ribbon */}
        {savingsPct > 0 && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="bg-rose-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-md shadow-sm uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {savingsPct}% {t("Savings vs Mandi", "बचत मंडी तुलना", "मंडी ले बचत")}
            </span>
          </div>
        )}

        {/* Trading Window Countdown */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="bg-slate-900/85 text-slate-100 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-slate-700">
            {tradeWindowLabel || "⚡ 06:00 - 10:00 AM"}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Crop Title, Lot ID & Location */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/buyer/${lot.id}`}
              className="group-hover:text-blue-700 transition-colors"
            >
              <h3 className="font-display text-lg font-black text-slate-900 leading-snug truncate">
                {lot.crop_type}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-700 truncate">
                {lot.centroid?.district || t("Raipur Agri Basin", "रायपुर क्षेत्र", "रायपुर क्षेत्र")}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-[11px] text-slate-400">#{lot.id}</span>
            </div>
          </div>

          {/* Pooled Farms Badge */}
          <div className="shrink-0 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-center">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
              <Users className="h-3 w-3 text-emerald-600" />
              <span>{pooledCount} {t("Farms", "खेत", "खेत")}</span>
            </div>
          </div>
        </div>

        {/* Volume & Logistics Badge */}
        <div className="mt-3 flex items-center justify-between text-xs bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/80">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              {t("Pooled Volume", "उपलब्ध मात्रा", "उपलब्ध मात्रा")}
            </span>
            <p className="text-sm font-black text-slate-900 tabular-nums">
              {lot.total_quantity_kg.toLocaleString()} {t("kg", "किग्रा", "किलो")}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              {t("Logistics", "लॉजिस्टिक्स", "गाड़ी रूट")}
            </span>
            <p className="text-xs font-bold text-emerald-700 flex items-center justify-end gap-1">
              <Truck className="h-3.5 w-3.5" />
              {t("1-Truck Loop", "1-ट्रक लूप", "1-गाड़ी लूप")}
            </p>
          </div>
        </div>

        {/* Clear Wholesale Pricing Section (No confusing dynamic pricing) */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t("Direct Farm Rate", "सीधा खेत भाव", "सीधा खेत भाव")}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                ₹{lot.price_per_kg}
              </span>
              <span className="text-xs font-bold text-slate-500">
                /{t("kg", "किग्रा", "किलो")}
              </span>
            </div>
          </div>

          {/* Mandi Benchmark comparison */}
          {benchmarkPrice > lot.price_per_kg && (
            <div className="text-right">
              <span className="text-[10px] font-medium text-slate-400 block">
                {t("Mandi Benchmark", "मंडी भाव", "मंडी भाव")}: <span className="line-through">₹{benchmarkPrice}</span>
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-emerald-100">
                {t("Save", "बचत", "बचत")} ₹{savingsPerKg}/{t("kg", "किग्रा", "किलो")}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons (Mobile-first 44px height) */}
        <div className="mt-4 grid grid-cols-2 gap-2 pt-1">
          <Link
            href={`/buyer/${lot.id}`}
            className="w-full inline-flex items-center justify-center h-11 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all"
          >
            {t("View Details", "विवरण देखें", "बिबरन देखव")}
          </Link>
          <Button
            size="md"
            variant="buyer"
            className="w-full h-11 rounded-xl font-bold text-xs shadow-sm active:scale-[0.98] transition-all"
            onClick={() => onOrderClick(lot)}
          >
            {t("Order Lot", "ऑर्डर करें", "ऑर्डर करव")}
          </Button>
        </div>
      </div>
    </div>
  );
}
