"use client";
import React, { useState } from "react";
import {
  TrendingUp,
  Truck,
  Leaf,
  DollarSign,
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building2,
  Zap,
} from "lucide-react";
import { Card, Badge, Button, cn } from "@/components/ui";
import { useLanguage } from "@/lib/language";

interface CropBenchmark {
  name: string;
  emoji: string;
  farmerMandiBase: number;     // Raw mandi price offered to farmer (₹/kg)
  mandiCommissionCutPct: number; // Commission + APMC fees deducted from farmer (~14%)
  mandiTransportPerKg: number;   // Inefficient individual tractor/auto trip cost (₹/kg)
  kisanSetuFarmerPrice: number;  // Direct platform price to farmer (₹/kg)
  kisanSetuTransportPerKg: number; // Clustered 1-truck logistics cost (₹/kg)
  buyerMandiPrice: number;     // Final price buyer pays at mandi with trader margins (₹/kg)
  buyerKisanSetuPrice: number; // Direct procurement price buyer pays on platform (₹/kg)
}

const CROP_BENCHMARKS: Record<string, CropBenchmark> = {
  Tomato: {
    name: "Tomato",
    emoji: "🍅",
    farmerMandiBase: 18.0,
    mandiCommissionCutPct: 0.14,
    mandiTransportPerKg: 3.2,
    kisanSetuFarmerPrice: 22.0,
    kisanSetuTransportPerKg: 1.1,
    buyerMandiPrice: 26.5,
    buyerKisanSetuPrice: 23.5,
  },
  Onion: {
    name: "Onion",
    emoji: "🧅",
    farmerMandiBase: 22.0,
    mandiCommissionCutPct: 0.12,
    mandiTransportPerKg: 2.8,
    kisanSetuFarmerPrice: 28.0,
    kisanSetuTransportPerKg: 0.9,
    buyerMandiPrice: 32.0,
    buyerKisanSetuPrice: 29.0,
  },
  Potato: {
    name: "Potato",
    emoji: "🥔",
    farmerMandiBase: 13.0,
    mandiCommissionCutPct: 0.12,
    mandiTransportPerKg: 2.5,
    kisanSetuFarmerPrice: 18.0,
    kisanSetuTransportPerKg: 0.8,
    buyerMandiPrice: 21.0,
    buyerKisanSetuPrice: 19.0,
  },
  Chilli: {
    name: "Chilli",
    emoji: "🌶️",
    farmerMandiBase: 50.0,
    mandiCommissionCutPct: 0.15,
    mandiTransportPerKg: 4.5,
    kisanSetuFarmerPrice: 65.0,
    kisanSetuTransportPerKg: 1.5,
    buyerMandiPrice: 78.0,
    buyerKisanSetuPrice: 68.0,
  },
  Wheat: {
    name: "Wheat",
    emoji: "🌾",
    farmerMandiBase: 20.0,
    mandiCommissionCutPct: 0.10,
    mandiTransportPerKg: 2.2,
    kisanSetuFarmerPrice: 24.5,
    kisanSetuTransportPerKg: 0.7,
    buyerMandiPrice: 27.5,
    buyerKisanSetuPrice: 25.5,
  },
  Soybean: {
    name: "Soybean",
    emoji: "🫘",
    farmerMandiBase: 42.0,
    mandiCommissionCutPct: 0.11,
    mandiTransportPerKg: 3.0,
    kisanSetuFarmerPrice: 49.0,
    kisanSetuTransportPerKg: 1.0,
    buyerMandiPrice: 55.0,
    buyerKisanSetuPrice: 51.0,
  },
  Garlic: {
    name: "Garlic",
    emoji: "🧄",
    farmerMandiBase: 110.0,
    mandiCommissionCutPct: 0.16,
    mandiTransportPerKg: 6.0,
    kisanSetuFarmerPrice: 140.0,
    kisanSetuTransportPerKg: 2.0,
    buyerMandiPrice: 165.0,
    buyerKisanSetuPrice: 145.0,
  },
};

interface ProfitImpactSimulatorProps {
  initialCrop?: string;
  initialVolumeKg?: number;
  initialPerspective?: "farmer" | "buyer";
  className?: string;
}

export default function ProfitImpactSimulator({
  initialCrop = "Tomato",
  initialVolumeKg = 3000,
  initialPerspective = "farmer",
  className = "",
}: ProfitImpactSimulatorProps) {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<string>(initialCrop);
  const [volumeKg, setVolumeKg] = useState<number>(initialVolumeKg);
  const [perspective, setPerspective] = useState<"farmer" | "buyer">(initialPerspective);
  const [distanceKm, setDistanceKm] = useState<number>(45);

  const crop = CROP_BENCHMARKS[selectedCrop] || CROP_BENCHMARKS.Tomato;

  // --- 1. Farmer Perspective Economics ---
  const mandiGrossRevenue = volumeKg * crop.farmerMandiBase;
  const mandiCommissionCut = mandiGrossRevenue * crop.mandiCommissionCutPct;
  const mandiLogisticsCost = volumeKg * crop.mandiTransportPerKg * (distanceKm / 40);
  const mandiNetFarmerIncome = Math.max(0, mandiGrossRevenue - mandiCommissionCut - mandiLogisticsCost);
  const mandiRealRatePerKg = (mandiNetFarmerIncome / volumeKg).toFixed(2);

  // KisanSetu Direct:
  const kisanSetuGrossRevenue = volumeKg * crop.kisanSetuFarmerPrice;
  const kisanSetuLogisticsCost = volumeKg * crop.kisanSetuTransportPerKg * (distanceKm / 40);
  const kisanSetuNetFarmerIncome = kisanSetuGrossRevenue - kisanSetuLogisticsCost;
  const kisanSetuRealRatePerKg = (kisanSetuNetFarmerIncome / volumeKg).toFixed(2);

  const farmerExtraCash = Math.round(kisanSetuNetFarmerIncome - mandiNetFarmerIncome);
  const farmerPercentageGain = Math.round((farmerExtraCash / (mandiNetFarmerIncome || 1)) * 100);

  // --- 2. Buyer Perspective Economics ---
  const mandiBuyerTotalCost = volumeKg * crop.buyerMandiPrice + (volumeKg * 1.5);
  const kisanSetuBuyerTotalCost = volumeKg * crop.buyerKisanSetuPrice + (volumeKg * crop.kisanSetuTransportPerKg);
  const buyerSavings = Math.round(mandiBuyerTotalCost - kisanSetuBuyerTotalCost);
  const buyerSavingsPct = Math.round((buyerSavings / (mandiBuyerTotalCost || 1)) * 100);

  // --- 3. Environmental / Logistics Impact (ESG Metrics) ---
  const numFarmers = Math.max(2, Math.ceil(volumeKg / 750));
  const traditionalTotalTripKm = numFarmers * distanceKm * 2;
  const traditionalDieselLiters = Math.round(traditionalTotalTripKm * 0.18);
  const traditionalCO2Kg = Math.round(traditionalDieselLiters * 2.68);

  const kisanSetuTotalTripKm = Math.round(distanceKm * 1.35 * 2);
  const kisanSetuDieselLiters = Math.round(kisanSetuTotalTripKm * 0.22);
  const kisanSetuCO2Kg = Math.round(kisanSetuDieselLiters * 2.68);

  const co2SavedKg = Math.max(0, traditionalCO2Kg - kisanSetuCO2Kg);
  const co2SavedPct = Math.round((co2SavedKg / (traditionalCO2Kg || 1)) * 100);
  const dieselSavedLiters = Math.max(0, traditionalDieselLiters - kisanSetuDieselLiters);

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white shadow-card overflow-hidden",
        className
      )}
    >
      {/* Header Bar with Perspective Switcher */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              {t("Live Econometric Simulator", "लाइव आर्थिक सिम्युलेटर", "लाइव फायदा सिम्युलेटर")}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-white mt-1">
            {perspective === "farmer"
              ? t("Farmer Net Payout & Commission Calculator", "किसान शुद्ध लाभ एवं कमीशन बचत कैलकुलेटर", "किसान शुद्ध पइसा कैलकुलेटर")
              : t("Wholesale Buyer Landed Cost Optimizer", "थोक खरीदार खरीद बचत कैलकुलेटर", "थोक खरीदार बचत")}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {t(
              "Compare real APMC mandi settlement vs. KisanSetu 0%-broker direct aggregation and 1-truck pooled logistics.",
              "वास्तविक APMC मंडी निपटान बनाम KisanSetu 0% ब्रोकर प्रत्यक्ष एकत्रीकरण की तुलना करें।",
              "मंडी के खर्चा आ KisanSetu के फायदा के सीधा तुलना करव।"
            )}
          </p>
        </div>

        {/* Perspective Toggle Buttons */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setPerspective("farmer")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer",
              perspective === "farmer"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-slate-300 hover:text-white"
            )}
          >
            <UserCheck className="w-4 h-4 text-emerald-300" />
            {t("Farmer View", "किसान दृष्टिकोण", "किसान नजरिया")}
          </button>
          <button
            type="button"
            onClick={() => setPerspective("buyer")}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer",
              perspective === "buyer"
                ? "bg-blue-800 text-white shadow-xs"
                : "text-slate-300 hover:text-white"
            )}
          >
            <Building2 className="w-4 h-4 text-blue-300" />
            {t("Buyer View", "खरीदार दृष्टिकोण", "व्यापारी नजरिया")}
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Control Column (Inputs) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Crop Selector Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t("Select Crop Type", "फसल प्रकार चुनें", "फसल चुनव")}
              </label>
              <span className="text-[11px] font-semibold text-slate-500">
                {Object.keys(CROP_BENCHMARKS).length} {t("APMC Commodities", "फसलें", "फसल")}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Object.entries(CROP_BENCHMARKS).map(([key, item]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setSelectedCrop(key)}
                  className={cn(
                    "p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer",
                    selectedCrop === key
                      ? "border-emerald-700 bg-emerald-50 text-emerald-950 font-black shadow-xs ring-1 ring-emerald-700/20"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  )}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="truncate w-full text-center text-[11px]">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Volume Slider */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-700 tracking-wide">
                {perspective === "farmer"
                  ? t("Harvest Batch Volume", "फसल मात्रा (किग्रा)", "फसल मात्रा (किग्रा)")
                  : t("Procurement Order Volume", "ऑर्डर खरीद मात्रा", "खरीद मात्रा")}
              </span>
              <span className="font-mono font-bold text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 shadow-2xs tabular-nums">
                {volumeKg.toLocaleString()} kg ({(volumeKg / 100).toFixed(1)} Qtl)
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="10000"
              step="100"
              value={volumeKg}
              onChange={(e) => setVolumeKg(Number(e.target.value))}
              className="w-full accent-emerald-800 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
              <span>200 kg (Smallholder)</span>
              <span>3,000 kg (Aggregated)</span>
              <span>10,000 kg (Wholesale)</span>
            </div>
          </div>

          {/* Distance to Market Hub Slider */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-700 tracking-wide">
                {t("Distance to Regional Hub / Mandi", "मंडी / हब की दूरी", "मंडी ले दूरी")}
              </span>
              <span className="font-mono font-bold text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 shadow-2xs tabular-nums">
                {distanceKm} km
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-full accent-emerald-800 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
              <span>10 km (Local Yard)</span>
              <span>45 km (Centroid Hub)</span>
              <span>150 km (Terminal APMC)</span>
            </div>
          </div>
        </div>

        {/* Right Output Column (Dynamic Results & ESG Benchmarks) */}
        <div className="lg:col-span-7 space-y-5">
          {perspective === "farmer" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Traditional Mandi */}
              <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-50 text-rose-800 rounded-md border border-rose-200">
                      Traditional Mandi Breakdown
                    </span>
                    <span className="text-xs font-semibold text-slate-500 tabular-nums">~₹{mandiRealRatePerKg}/kg net</span>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">Gross Benchmark: ₹{mandiGrossRevenue.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-rose-700 font-medium mt-1">
                    - ₹{Math.round(mandiCommissionCut).toLocaleString("en-IN")} (14% Commission/Cess)
                  </p>
                  <p className="text-xs text-rose-700 font-medium">
                    - ₹{Math.round(mandiLogisticsCost).toLocaleString("en-IN")} ({numFarmers} Separate Tractor trips)
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-rose-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Net Farmer Payout:</span>
                  <p className="text-2xl font-black text-rose-700 font-display tabular-nums mt-0.5">
                    ₹{Math.round(mandiNetFarmerIncome).toLocaleString("en-IN")}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">15–30 days delayed credit</span>
                </div>
              </div>

              {/* KisanSetu Direct */}
              <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-300 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-800 text-white rounded-md">
                      KisanSetu Direct (0% Broker)
                    </span>
                    <span className="text-xs font-bold text-emerald-900 tabular-nums">~₹{kisanSetuRealRatePerKg}/kg net</span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold">Contract Rate: ₹{kisanSetuGrossRevenue.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-emerald-800 font-semibold mt-1">
                    ✓ 0% Middleman / Trader Commission
                  </p>
                  <p className="text-xs text-emerald-800 font-semibold">
                    ✓ Clustered 1-Truck Loop (-₹{Math.round(kisanSetuLogisticsCost).toLocaleString("en-IN")})
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-emerald-200/80">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-800">Net Direct Payout:</span>
                      <p className="text-2xl font-black text-emerald-900 font-display tabular-nums mt-0.5">
                        ₹{Math.round(kisanSetuNetFarmerIncome).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-black uppercase bg-emerald-800 text-white px-2.5 py-1 rounded-md shadow-2xs">
                        +{farmerPercentageGain}% Uplift
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium block mt-1">Instant 2-stage milestone UPI escrow</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Buyer Mandi Landed */}
              <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                    Mandi Broker Procurement
                  </span>
                  <p className="text-xs text-slate-600 font-semibold mt-2.5">Quoted Yard Rate: ₹{crop.buyerMandiPrice}/kg</p>
                  <p className="text-xs text-rose-700 font-medium mt-1">
                    + 8-12% Multi-layer Trader Margin
                  </p>
                  <p className="text-xs text-rose-700 font-medium">
                    + Uncertified grading sorting risk
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Total Landed Cost:</span>
                  <p className="text-2xl font-black text-slate-900 font-display tabular-nums mt-0.5">
                    ₹{Math.round(mandiBuyerTotalCost).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Buyer KisanSetu Landed */}
              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-300 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-900 text-white rounded-md">
                      KisanSetu Consolidated Lots
                    </span>
                    <span className="text-xs font-bold text-blue-900 tabular-nums">₹{crop.buyerKisanSetuPrice}/kg</span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold">AI Grade-Certified Batch (94%+ accuracy)</p>
                  <p className="text-xs text-blue-800 font-semibold mt-1">
                    ✓ Direct from Clustered Farm Gates
                  </p>
                  <p className="text-xs text-blue-800 font-semibold">
                    ✓ Single Truckload Delivery to Warehouse
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-blue-200/80">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-900">Total Landed Cost:</span>
                      <p className="text-2xl font-black text-blue-950 font-display tabular-nums mt-0.5">
                        ₹{Math.round(kisanSetuBuyerTotalCost).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-black uppercase bg-blue-900 text-white px-2.5 py-1 rounded-md shadow-2xs">
                        Save ₹{buyerSavings.toLocaleString("en-IN")} (-{buyerSavingsPct}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Highlights & ESG Impact Metric Banner */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {t("Green Logistics & Carbon Reduction Benchmark", "हरित रसद और कार्बन कटौती बेंचमार्क", "ग्रीन लॉजिस्टिक्स आ कार्बन बचत")}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-500">{t("CO₂ Emissions Saved", "CO₂ उत्सर्जन बचत", "CO₂ बचत")}</p>
                <p className="text-lg font-black text-emerald-800 font-display tabular-nums mt-0.5">{co2SavedKg} kg</p>
                <p className="text-[10px] font-semibold text-slate-500">-{co2SavedPct}% vs separate trips</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold uppercase text-slate-500">{t("Diesel Fuel Saved", "डीजल ईंधन बचत", "डीजल बचत")}</p>
                <p className="text-lg font-black text-blue-900 font-display tabular-nums mt-0.5">{dieselSavedLiters} L</p>
                <p className="text-[10px] font-semibold text-slate-500">{traditionalDieselLiters}L → {kisanSetuDieselLiters}L</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
                <p className="text-[10px] font-bold uppercase text-emerald-900">{t("Farmer Net Gain", "किसान शुद्ध लाभ", "किसान फायदा")}</p>
                <p className="text-lg font-black text-emerald-800 font-display tabular-nums mt-0.5">+₹{farmerExtraCash.toLocaleString("en-IN")}</p>
                <p className="text-[10px] font-bold text-emerald-700">+{farmerPercentageGain}% direct UPI</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
