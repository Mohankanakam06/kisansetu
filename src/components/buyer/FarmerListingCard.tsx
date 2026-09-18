"use client";
import React from "react";
import { FarmerListing } from "@/types";
import { Badge, Button } from "@/components/ui";
import CropPhoto from "@/components/buyer/CropPhoto";
import { useLanguage } from "@/lib/language";
import { useFavorites } from "@/hooks/useFavorites";
import {
  MapPin,
  TrendingDown,
  CheckCircle2,
  Calendar,
  Sparkles,
  Heart,
  ShieldCheck,
  Zap,
  Info,
  Building2,
} from "lucide-react";

interface FarmerListingCardProps {
  listing: FarmerListing;
  onPayClick: (listing: FarmerListing) => void;
  onInspectClick?: (listing: FarmerListing) => void;
  isFeatured?: boolean;
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

function formatFreshness(harvestDateStr: string): string {
  if (!harvestDateStr) return "Fresh Harvest";
  try {
    const harvestDate = new Date(harvestDateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - harvestDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 0) return "Harvested Today";
    if (diffDays === 1) return "Harvested Yesterday";
    return `Harvested ${diffDays}d ago`;
  } catch {
    return "Fresh Harvest";
  }
}

export const FarmerListingCard: React.FC<FarmerListingCardProps> = ({
  listing,
  onPayClick,
  onInspectClick,
  isFeatured = false,
}) => {
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(listing.id);

  const mandiBenchmark = BENCHMARK_MANDI[listing.crop_type] || listing.price_per_kg * 1.15;
  const savingsPerKg = Math.max(0, mandiBenchmark - listing.price_per_kg);
  const savingsPercent = Math.round((savingsPerKg / mandiBenchmark) * 100);

  const gradeColors: Record<string, { bg: string; text: string; border: string }> = {
    A: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
    B: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
    C: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
    D: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
  };

  const currentGrade = gradeColors[listing.grade] || gradeColors.A;

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isFeatured
          ? "border-emerald-300 shadow-md ring-1 ring-emerald-400/30"
          : "border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5"
      }`}
    >
      {/* Top Banner & Visual Header */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        {listing.photo_url ? (
          <img
            src={listing.photo_url}
            alt={listing.crop_type}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // On image load failure, hide img tag so fallback or background shows
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <CropPhoto
            crop={listing.crop_type}
            fallbackEmoji={cropEmojis[listing.crop_type] || "🌾"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent pointer-events-none" />

        {/* Badges on Image */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-md shadow-sm ${currentGrade.bg}/90 ${currentGrade.text} ${currentGrade.border}`}
            >
              Grade {listing.grade} Certified
            </span>

            {savingsPercent > 0 && (
              <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-600/90 text-white border border-emerald-400/40 backdrop-blur-md shadow-sm flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                <span>{savingsPercent}% vs Mandi</span>
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(listing.id);
            }}
            aria-label="Save to favorites"
            className={`p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 border shadow-sm ${
              favorited
                ? "bg-rose-500/90 border-rose-400 text-white"
                : "bg-white/80 border-white/50 text-slate-700 hover:text-rose-500 hover:bg-white"
            }`}
          >
            <Heart className={`w-4 h-4 ${favorited ? "fill-white" : ""}`} />
          </button>
        </div>

        {/* Harvest Date & Farmer Tag on lower bottom of image */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-100 drop-shadow">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formatFreshness(listing.harvest_date)}</span>
          </div>

          <div className="text-xs font-bold bg-slate-900/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 text-emerald-300">
            {listing.quantity_kg.toLocaleString()} kg Avail
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          {/* Produce Name & Farmer Name */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>{cropEmojis[listing.crop_type] || "🌾"}</span>
                <span>{listing.crop_type}</span>
              </h4>

              <div className="flex items-center gap-1 text-xs text-slate-600 mt-0.5">
                <span className="font-semibold text-slate-800">{listing.farmer_name}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>

            {/* FPO Badge if present */}
            {listing.fpo_name && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-md self-start">
                <Building2 className="w-3 h-3 text-blue-600" />
                <span className="truncate max-w-[120px]">{listing.fpo_name}</span>
              </span>
            )}
          </div>

          {/* Location Details */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              {listing.address || listing.district || "Agricultural Hub, India"}
            </span>
          </div>

          {/* Defects/Attributes Pill */}
          {listing.defects && listing.defects.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {listing.defects.slice(0, 2).map((defect, i) => (
                <span
                  key={i}
                  className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"
                >
                  {defect}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Checkout Section */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900">
                  ₹{listing.price_per_kg.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ kg</span>
              </div>
              <div className="text-[11px] text-slate-400 line-through">
                Mandi: ₹{mandiBenchmark.toFixed(2)}/kg
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Save ₹{(savingsPerKg * listing.quantity_kg).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">on full lot</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onInspectClick && onInspectClick(listing)}
              className="w-full text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-1 py-2"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Specs</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => onPayClick(listing)}
              className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 py-2 group/btn"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-200 group-hover/btn:scale-110 transition-transform" />
              <span>Pay (Demo)</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerListingCard;
