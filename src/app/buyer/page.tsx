"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Lot } from "@/types";
import { apiService } from "@/services/api";
import LotCard from "@/components/buyer/LotCard";
import LotDetailModal from "@/components/buyer/LotDetailModal";
import ProfitImpactSimulator from "@/components/simulator/ProfitImpactSimulator";
import { Button, Card, Badge, cn } from "@/components/ui";
import { useLanguage } from "@/lib/language";
import {
  Search,
  ShoppingCart,
  Grid,
  Map,
  Filter,
  ShieldCheck,
  PackageCheck,
  LocateFixed,
  Sprout,
  TrendingUp,
} from "lucide-react";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-600 font-semibold">
      Loading interactive map...
    </div>
  ),
});

const CROPS = ["All", "Tomato", "Onion", "Potato", "Wheat", "Rice", "Soybean", "Chilli", "Cotton"];
const GRADES = ["All", "A", "B", "C"];

export default function BuyerPage() {
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kisansetu_user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === "farmer") window.location.href = "/farmer";
      } else {
        window.location.href = "/login";
      }
    } catch(e) {}
  }, []);

  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [orderingLot, setOrderingLot] = useState<Lot | null>(null);
  const [cropFilter, setCropFilter] = useState("All");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [nearbyRadiusKm, setNearbyRadiusKm] = useState(10);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const getMyLocation = async () => {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearbyEnabled(true);
        setLocating(false);
      },
      () => { setNearbyEnabled(false); setLocating(false); }
    );
  };

  const fetchLots = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getLots({
        crop: cropFilter === "All" ? undefined : cropFilter,
        grade: gradeFilter === "All" ? undefined : gradeFilter,
        search: searchQuery || undefined,
        minPrice: priceMin ? Number(priceMin) : undefined,
        maxPrice: priceMax ? Number(priceMax) : undefined,
        lat: nearbyEnabled && userLocation ? userLocation.lat : undefined,
        lng: nearbyEnabled && userLocation ? userLocation.lng : undefined,
        radiusKm: nearbyEnabled && userLocation ? nearbyRadiusKm : undefined,
      });
      setLots(res.lots);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchLots();
    const interval = setInterval(fetchLots, 15000);
    return () => clearInterval(interval);
  }, [cropFilter, gradeFilter, priceMin, priceMax, searchQuery, nearbyEnabled, nearbyRadiusKm, userLocation]);

  return (
    <div className="flex-1 bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="space-y-1">
            <Badge variant="buyer" className="mb-2">
              <Sprout className="h-3.5 w-3.5 mr-1" />
              {t("Wholesale Marketplace", "थोक उपज बाज़ार", "थोक बाज़ार")}
            </Badge>
            <h1 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              {t("Pooled AI-Certified Produce", "एकीकृत AI-प्रमाणित उपज", "एकीकृत AI-प्रमाणित उपज")}
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              {t("Directly pooled AI-certified produce lots. No middlemen.", "सीधे एकत्रित AI-प्रमाणित उपज लॉट। बिचौलिया मुक्त।", "सीधा एकत्रित उपज लॉट। बिचौलिया मुक्त।")}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200">
            <Button
              variant={viewMode === "grid" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="gap-2"
            >
              <Grid className="h-4 w-4" /> {t("Lots", "लॉट", "लॉट")}
            </Button>
            <Button
              variant={viewMode === "map" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("map")}
              className="gap-2"
            >
              <Map className="h-4 w-4" /> {t("Map", "मैप", "मैप")}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={t("Search...", "खोजें...", "खोजव...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 rounded-lg border border-slate-300 pl-10 pr-4 text-sm font-medium focus:border-emerald-700"
              />
            </div>
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="h-11 rounded-lg border border-slate-300 px-3 text-sm font-medium focus:border-emerald-700"
            >
              {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="h-11 rounded-lg border border-slate-300 px-3 text-sm font-medium focus:border-emerald-700"
            >
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <Button
              variant={nearbyEnabled ? "buyer" : "outline"}
              onClick={getMyLocation}
              disabled={locating}
              className="h-11"
            >
              <LocateFixed className="h-4 w-4 mr-2" />
              {nearbyEnabled ? t("Near Me: 10km", "मेरे पास: 10किमी", "पास म: 10किमी") : t("Near Me", "मेरे पास", "पास म")}
            </Button>
          </div>
        </Card>

        {/* Content Area */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lots.map((lot) => (
              <LotCard key={lot.id} lot={lot} onOrderClick={() => setSelectedLot(lot)} />
            ))}
          </div>
        ) : (
           <div className="rounded-xl border border-slate-200 overflow-hidden h-[500px]">
             <LeafletMap center={{ lat: 21.28, lng: 81.65 }} lots={lots} onSelectLot={setSelectedLot} height="h-full" />
          </div>
        )}
      </div>

      {selectedLot && (
        <LotDetailModal
          lot={selectedLot}
          onClose={() => setSelectedLot(null)}
          onOrderConfirm={() => setOrderingLot(selectedLot)}
        />
      )}
    </div>
  );
}
