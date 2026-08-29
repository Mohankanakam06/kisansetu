"use client";
import React, { useState } from "react";
import { Lot } from "@/types";
import { Badge, Button, Card } from "@/components/ui";
import CropPhoto from "@/components/buyer/CropPhoto";
import {
  MapPin,
  Truck,
  Users,
  Award,
  ChevronRight,
  Scale,
  Clock,
  IndianRupee,
  ExternalLink,
  Check,
} from "lucide-react";

interface LotCardProps {
  lot: Lot;
  isSelected?: boolean;
  onClick: () => void;
  onOrderClick: (lot: Lot) => void;
}

const gradeColors = {
  A: "text-emerald-600 bg-emerald-100 border-emerald-200",
  B: "text-amber-700 bg-amber-100 border-amber-200",
  C: "text-stone-700 bg-stone-100 border-stone-200",
};

const cropEmojis: Record<string, string> = {
  Tomato: "🍅",
  Onion: "🧅",
  Potato: "🥔",
  Wheat: "🌾",
  Rice: "🍚",
  Soybean: "🫘",
  Chilli: "🌶️",
};

/**
 * Deterministic avatar seeded from the farmer's name (DiceBear, no API key).
 * Falls back to a monogram chip if the SVG ever fails to load.
 */
function FarmerAvatar({ name }: { name: string }) {
  const [broken, setBroken] = useState(false);
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "•";

  if (broken) {
    return (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
        {initials}
      </div>
    );
  }

  return (
    <img
      src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`}
      alt={name}
      loading="lazy"
      onError={() => setBroken(true)}
      className="h-6 w-6 shrink-0 rounded-full bg-soil-100 object-cover ring-1 ring-soil-200"
    />
  );
}

export default function LotCard({ lot, isSelected, onClick, onOrderClick }: LotCardProps) {
  return (
    <Card
      hoverEffect={!isSelected}
      className={`cursor-pointer transition-all duration-200 relative overflow-hidden ${
        isSelected
          ? "ring-2 ring-emerald-500 border-emerald-300 bg-emerald-50/30 shadow-lg"
          : "bg-white"
      }`}
      onClick={onClick}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 animate-pulse" />
      )}

      <div className="relative space-y-4">
        {/* Header: Crop, Grade, Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <CropPhoto
                crop={lot.crop_type}
                fallbackEmoji={cropEmojis[lot.crop_type] || "🌿"}
              />
              <h3 className="font-bold text-lg text-soil-900 truncate">
                {lot.crop_type} Aggregated Lot
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={lot.grade === "A" ? "gradeA" : lot.grade === "B" ? "gradeB" : "gradeC"} size="sm">
                Grade {lot.grade}
              </Badge>
              <Badge variant="info" size="sm">
                {lot.listings_count} Farmers
              </Badge>
              <Badge variant="success" size="sm">
                Verified AI-Graded
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-soil-50/50 border border-soil-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-700">{lot.total_quantity_kg.toLocaleString()}</p>
            <p className="text-[10px] text-soil-500 uppercase tracking-wider">Total kg</p>
          </div>
          <div className="text-center border-x border-soil-200">
            <p className="text-2xl font-bold text-soil-900">₹{lot.price_per_kg}</p>
            <p className="text-[10px] text-soil-500 uppercase tracking-wider">per kg</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-600">₹{(lot.total_quantity_kg * lot.price_per_kg).toLocaleString()}</p>
            <p className="text-[10px] text-soil-500 uppercase tracking-wider">Lot Value</p>
          </div>
        </div>

        {/* Location & Aggregation Detail */}
        <div className="flex items-center gap-3 text-sm text-soil-600 border-t border-soil-100 pt-3">
          <div className="flex items-center gap-1.5 text-soil-500">
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-[180px]">
              {lot.centroid.district}, {lot.centroid.address}
            </span>
          </div>
          <span className="text-soil-300">|</span>
          <div className="flex items-center gap-1.5 text-soil-500">
            <Users className="w-4 h-4" />
            <span>{lot.listings_count} smallholders aggregated</span>
          </div>
        </div>

        {/* Farmer Breakdown Preview */}
        <div className="bg-white border border-soil-100 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-soil-700 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            Verified Farmer Pool
          </p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {lot.listings?.slice(0, 4).map((farmer) => (
              <div
                key={farmer.listing_id}
                className="flex items-center justify-between p-2 rounded border border-soil-100 hover:bg-soil-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FarmerAvatar name={farmer.farmer_name} />
                  <div className="text-left">
                    <p className="text-xs font-medium text-soil-900">{farmer.farmer_name}</p>
                    <p className="text-[10px] text-soil-500">{farmer.quantity_kg}kg · ₹{farmer.price_per_kg}/kg</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700">
                  {farmer.quantity_kg}kg
                </span>
              </div>
            ))}
            {(lot.listings_count || 0) > 4 && (
              <div className="flex items-center justify-between p-2 text-[11px] text-soil-500 border-t border-soil-100">
                <span>+{lot.listings_count - 4} more farmers in this lot</span>
                <ExternalLink className="w-3.5 h-3.5 text-soil-400" />
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-soil-100">
          <div className="flex items-center gap-3 text-xs text-soil-500">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              <span>Logistics available</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Route ~45min</span>
            </span>
            <span className="flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              <span>Fair weight</span>
            </span>
          </div>

          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onOrderClick(lot);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
          >
            <IndianRupee className="w-3.5 h-3.5 mr-1" />
            Place Order
          </Button>
        </div>
      </div>
    </Card>
  );
}