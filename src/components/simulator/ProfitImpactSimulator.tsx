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
  // Traditional Mandi:
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
  const mandiBuyerTotalCost = volumeKg * crop.buyerMandiPrice + (volumeKg * 1.5); // Add handling charges
  const kisanSetuBuyerTotalCost = volumeKg * crop.buyerKisanSetuPrice + (volumeKg * crop.kisanSetuTransportPerKg);
  const buyerSavings = Math.round(mandiBuyerTotalCost - kisanSetuBuyerTotalCost);
  const buyerSavingsPct = Math.round((buyerSavings / (mandiBuyerTotalCost || 1)) * 100);

  // --- 3. Environmental / Logistics Impact (ESG Metrics) ---
  // Traditional: 4 separate small diesel vehicles (each doing 2-way trips)
  const numFarmers = Math.max(2, Math.ceil(volumeKg / 750));
  const traditionalTotalTripKm = numFarmers * distanceKm * 2;
  const traditionalDieselLiters = Math.round(traditionalTotalTripKm * 0.18); // ~18L per 100km small commercial
  const traditionalCO2Kg = Math.round(traditionalDieselLiters * 2.68); // 2.68 kg CO2 per liter diesel

  // KisanSetu: 1 Single Clustered Multi-Pickup Medium Truck
  const kisanSetuTotalTripKm = Math.round(distanceKm * 1.35 * 2); // 35% loop detour factor
  const kisanSetuDieselLiters = Math.round(kisanSetuTotalTripKm * 0.22); // ~22L per 100km 10T truck
  const kisanSetuCO2Kg = Math.round(kisanSetuDieselLiters * 2.68);

  const co2SavedKg = Math.max(0, traditionalCO2Kg - kisanSetuCO2Kg);
  const co2SavedPct = Math.round((co2SavedKg / (traditionalCO2Kg || 1)) * 100);
  const dieselSavedLiters = Math.max(0, traditionalDieselLiters - kisanSetuDieselLiters);

  return (
    <div
      className={cn(
        "rounded-sm border-2 border-[#1E1F1C] bg-[#EBECE8] shadow-[4px_4px_0_0_#1E1F1C] overflow-hidden",
        className
      )}
    >
      {/* Top Header Bar with Perspective Switcher */}
      <div className="bg-[#1E1F1C] text-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#F4A261] animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F4A261]">
              {t("Live Econometric Simulator", "लाइव आर्थिक सिम्युलेटर", "लाइव फायदा सिम्युलेटर")}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white mt-1">
            {perspective === "farmer"
              ? t("Farmer Net Cash Uplift Calculator", "किसान शुद्ध नकदी वृद्धि कैलकुलेटर", "किसान शुद्ध पइसा कैलकुलेटर")
              : t("Wholesale Buyer Procurement Savings", "थोक खरीदार खरीद बचत", "थोक खरीदार बचत")}
          </h3>
        </div>

        {/* Perspective Toggle Buttons */}
        <div className="flex items-center bg-[#2C2E2B] p-1 rounded-sm border border-[#52544D]">
          <button
            onClick={() => setPerspective("farmer")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-black uppercase rounded-xs transition-all flex items-center gap-1.5",
              perspective === "farmer"
                ? "bg-[#386641] text-white shadow-[1px_1px_0_0_#1E1F1C]"
                : "text-[#C2C5BC] hover:text-white"
            )}
          >
            <UserCheck className="w-3.5 h-3.5" />
            {t("Farmer View", "किसान दृष्टिकोण", "किसान नजरिया")}
          </button>
          <button
            onClick={() => setPerspective("buyer")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-black uppercase rounded-xs transition-all flex items-center gap-1.5",
              perspective === "buyer"
                ? "bg-[#1B4965] text-white shadow-[1px_1px_0_0_#1E1F1C]"
                : "text-[#C2C5BC] hover:text-white"
            )}
          >
            <Building2 className="w-3.5 h-3.5" />
            {t("Buyer View", "खरीदार दृष्टिकोण", "व्यापारी नजरिया")}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Column (Inputs) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Crop Selector Chips */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-[#1E1F1C] flex items-center justify-between mb-2">
              <span>{t("Select Crop Type", "फसल प्रकार चुनें", "फसल चुनव")}</span>
              <span className="text-[10px] font-bold text-[#52544D]">
                {Object.keys(CROP_BENCHMARKS).length} {t("Commodities", "फसलें", "फसल")}
              </span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Object.entries(CROP_BENCHMARKS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCrop(key)}
                  className={cn(
                    "p-2 rounded-sm border-2 text-xs font-black flex flex-col items-center justify-center gap-1 transition-all",
                    selectedCrop === key
                      ? "border-[#1E1F1C] bg-[#F4A261] text-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C]"
                      : "border-[#1E1F1C] bg-white text-[#1E1F1C] hover:bg-[#FDF6E2]"
                  )}
                >
                  <span className="text-base">{item.emoji}</span>
                  <span className="truncate w-full text-center text-[10px]">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Volume Slider */}
          <div className="bg-white p-4 rounded-sm border-2 border-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#1E1F1C]">
                {perspective === "farmer"
                  ? t("Harvest Batch Quantity", "फसल मात्रा (किग्रा)", "फसल मात्रा (किग्रा)")
                  : t("Order Procurement Volume", "ऑर्डर खरीद मात्रा", "खरीद मात्रा")}
              </span>
              <span className="font-mono font-black text-sm px-2 py-0.5 bg-[#EBECE8] border border-[#1E1F1C] rounded-sm text-[#1E1F1C]">
                {volumeKg.toLocaleString()} kg ({ (volumeKg / 100).toFixed(1) } Qtl)
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="10000"
              step="100"
              value={volumeKg}
              onChange={(e) => setVolumeKg(Number(e.target.value))}
              className="w-full accent-[#386641] h-2 bg-[#EBECE8] rounded-sm cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-black uppercase text-[#52544D]">
              <span>200 kg (Smallholder)</span>
              <span>5,000 kg (Truckload)</span>
              <span>10,000 kg</span>
            </div>
          </div>

          {/* Distance to Market Hub Slider */}
          <div className="bg-white p-4 rounded-sm border-2 border-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#1E1F1C]">
                {t("Distance to Regional Hub / Mandi", "मंडी / हब की दूरी", "मंडी ले दूरी")}
              </span>
              <span className="font-mono font-black text-sm px-2 py-0.5 bg-[#EBECE8] border border-[#1E1F1C] rounded-sm text-[#1E1F1C]">
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
              className="w-full accent-[#1B4965] h-2 bg-[#EBECE8] rounded-sm cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-black uppercase text-[#52544D]">
              <span>10 km (Local)</span>
              <span>75 km (Inter-District)</span>
              <span>150 km</span>
            </div>
          </div>
        </div>

        {/* Right Output Column (Dynamic Results & ESG Benchmarks) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Comparison Financial Cards */}
          {perspective === "farmer" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Traditional Mandi */}
              <div className="bg-white p-4 rounded-sm border-2 border-[#C04A22] shadow-[3px_3px_0_0_#C04A22] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#FFEBE6] text-[#C04A22] rounded-xs border border-[#C04A22]">
                      Traditional Mandi Cut
                    </span>
                    <span className="text-xs font-bold text-[#52544D]">~₹{mandiRealRatePerKg}/kg net</span>
                  </div>
                  <p className="text-xs text-[#52544D] font-bold">Gross Mandi Value: ₹{mandiGrossRevenue.toLocaleString("en-IN")}</p>
                  <p className="text-[11px] text-[#C04A22] font-semibold mt-1">
                    - ₹{Math.round(mandiCommissionCut).toLocaleString("en-IN")} (14% Commission/APMC fee)
                  </p>
                  <p className="text-[11px] text-[#C04A22] font-semibold">
                    - ₹{Math.round(mandiLogisticsCost).toLocaleString("en-IN")} ({numFarmers} Separate Tractor trips)
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t-2 border-dashed border-[#FFEBE6]">
                  <span className="text-[10px] uppercase font-black text-[#52544D]">Net Farmer Payout:</span>
                  <p className="text-2xl font-black font-mono text-[#C04A22]">
                    ₹{Math.round(mandiNetFarmerIncome).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* KisanSetu Direct */}
              <div className="bg-[#F4F9F4] p-4 rounded-sm border-2 border-[#386641] shadow-[3px_3px_0_0_#386641] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#386641] text-white rounded-xs border border-[#1E1F1C]">
                      KisanSetu Direct (0% Fee)
                    </span>
                    <span className="text-xs font-black text-[#386641]">~₹{kisanSetuRealRatePerKg}/kg net</span>
                  </div>
                  <p className="text-xs text-[#1E1F1C] font-bold">Guaranteed Rate: ₹{kisanSetuGrossRevenue.toLocaleString("en-IN")}</p>
                  <p className="text-[11px] text-[#386641] font-bold mt-1">
                    ✓ 0% Middleman / Trader Commission
                  </p>
                  <p className="text-[11px] text-[#386641] font-bold">
                    ✓ Shared 1-Truck Loop (-₹{Math.round(kisanSetuLogisticsCost).toLocaleString("en-IN")})
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t-2 border-dashed border-[#386641]/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-black text-[#386641]">Net Direct Payout:</span>
                      <p className="text-2xl font-black font-mono text-[#386641]">
                        ₹{Math.round(kisanSetuNetFarmerIncome).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase bg-[#386641] text-white px-2 py-1 rounded-sm">
                        +{farmerPercentageGain}% Uplift
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Buyer Mandi Landed */}
              <div className="bg-white p-4 rounded-sm border-2 border-[#52544D] shadow-[3px_3px_0_0_#52544D] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#EBECE8] text-[#52544D] rounded-xs border border-[#52544D]">
                    Mandi Broker Procurement
                  </span>
                  <p className="text-xs text-[#52544D] font-bold mt-2">Mandi Rate: ₹{crop.buyerMandiPrice}/kg</p>
                  <p className="text-[11px] text-[#C04A22] font-semibold mt-1">
                    + 8-12% Multi-layer Trader Margin
                  </p>
                  <p className="text-[11px] text-[#C04A22] font-semibold">
                    + Unstandardized grading sorting risk
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t-2 border-dashed border-[#52544D]/30">
                  <span className="text-[10px] uppercase font-black text-[#52544D]">Total Landed Procurement:</span>
                  <p className="text-2xl font-black font-mono text-[#1E1F1C]">
                    ₹{Math.round(mandiBuyerTotalCost).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Buyer KisanSetu Landed */}
              <div className="bg-[#F0F7FA] p-4 rounded-sm border-2 border-[#1B4965] shadow-[3px_3px_0_0_#1B4965] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#1B4965] text-white rounded-xs border border-[#1E1F1C]">
                      KisanSetu Pooled Lots
                    </span>
                    <span className="text-xs font-black text-[#1B4965]">₹{crop.buyerKisanSetuPrice}/kg</span>
                  </div>
                  <p className="text-xs text-[#1E1F1C] font-bold mt-1">AI Grade-Certified Batch (94%+ accuracy)</p>
                  <p className="text-[11px] text-[#1B4965] font-bold mt-1">
                    ✓ Direct from Clustered Farm Gates
                  </p>
                  <p className="text-[11px] text-[#1B4965] font-bold">
                    ✓ Consolidated Delivery to Your Warehouse
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t-2 border-dashed border-[#1B4965]/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-black text-[#1B4965]">Total Direct Cost:</span>
                      <p className="text-2xl font-black font-mono text-[#1B4965]">
                        ₹{Math.round(kisanSetuBuyerTotalCost).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase bg-[#1B4965] text-white px-2 py-1 rounded-sm">
                        Save ₹{buyerSavings.toLocaleString("en-IN")} (-{buyerSavingsPct}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Highlights & ESG Impact Metric Banner */}
          <div className="bg-white p-4 rounded-sm border-2 border-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C]">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-4 h-4 text-[#386641]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#1E1F1C]">
                {t("Green Logistics & Carbon Reduction Benchmark", "हरित रसद और कार्बन कटौती बेंचमार्क", "ग्रीन लॉजिस्टिक्स आ कार्बन बचत")}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-sm bg-[#EBECE8] border border-[#1E1F1C]">
                <p className="text-[10px] font-black uppercase text-[#52544D]">{t("CO₂ Emissions Saved", "CO₂ उत्सर्जन बचत", "CO₂ बचत")}</p>
                <p className="text-lg font-black font-mono text-[#386641] mt-0.5">{co2SavedKg} kg</p>
                <p className="text-[9px] font-bold text-[#52544D]">-{co2SavedPct}% vs individual trips</p>
              </div>
              <div className="p-2.5 rounded-sm bg-[#EBECE8] border border-[#1E1F1C]">
                <p className="text-[10px] font-black uppercase text-[#52544D]">{t("Diesel Fuel Saved", "डीजल ईंधन बचत", "डीजल बचत")}</p>
                <p className="text-lg font-black font-mono text-[#1B4965] mt-0.5">{dieselSavedLiters} L</p>
                <p className="text-[9px] font-bold text-[#52544D]">{traditionalDieselLiters}L → {kisanSetuDieselLiters}L</p>
              </div>
              <div className="p-2.5 rounded-sm bg-[#FDF6E2] border border-[#1E1F1C]">
                <p className="text-[10px] font-black uppercase text-[#1E1F1C]">{t("Farmer Net Gain", "किसान शुद्ध लाभ", "किसान फायदा")}</p>
                <p className="text-lg font-black font-mono text-[#386641] mt-0.5">+₹{farmerExtraCash.toLocaleString("en-IN")}</p>
                <p className="text-[9px] font-black text-[#386641]">+{farmerPercentageGain}% directly via UPI</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
