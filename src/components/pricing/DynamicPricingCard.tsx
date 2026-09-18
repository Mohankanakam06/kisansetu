"use client";

import React, { useEffect, useState } from "react";
import { apiService, DynamicMarginResponse } from "@/services/api";
import { useLanguage } from "@/lib/language";
import {
  TrendingUp,
  Truck,
  Award,
  Users,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  BadgeIndianRupee,
  Leaf,
} from "lucide-react";

interface DynamicPricingCardProps {
  crop: string;
  quantity: number;
  grade: string;
  score?: number;
  distance?: number;
  basePrice?: number;
}

type ScenarioKey = "cluster" | "supermarket" | "express";

interface ScenarioConfig {
  key: ScenarioKey;
  emoji: string;
  labelEn: string;
  labelHi: string;
  labelCg: string;
  descEn: string;
  descHi: string;
  descCg: string;
  /** multipliers applied on top of base API factors */
  qualityMult: number;
  volumeMult: number;
  logisticsMult: number;
}

const SCENARIOS: ScenarioConfig[] = [
  {
    key: "cluster",
    emoji: "🌾",
    labelEn: "Cluster Aggregation",
    labelHi: "समूह संग्रह",
    labelCg: "समूह जमा",
    descEn: "5–10 smallholders pooling produce into one consolidated truckload",
    descHi: "5–10 छोटे किसान एक ट्रक में उपज एकत्र करते हैं",
    descCg: "5–10 नान किसान एक ट्रक म उपज जमा करथें",
    qualityMult: 1.0,
    volumeMult: 1.25,
    logisticsMult: 1.2,
  },
  {
    key: "supermarket",
    emoji: "🏪",
    labelEn: "Grade A Supermarket Direct",
    labelHi: "सुपरमार्केट सीधा ग्रेड A",
    labelCg: "सुपरमार्केट सीधा ग्रेड A",
    descEn: "Premium verified harvest direct to wholesale buyer — 0% broker cut",
    descHi: "सत्यापित फसल सीधे थोक खरीदार को — 0% दलाली",
    descCg: "जांचे फसल सीधा थोक खरीददार ला — 0% दलाली",
    qualityMult: 1.35,
    volumeMult: 1.1,
    logisticsMult: 1.0,
  },
  {
    key: "express",
    emoji: "🚚",
    labelEn: "Express Fresh Route",
    labelHi: "एक्सप्रेस फ्रेश रूट",
    labelCg: "एक्सप्रेस फ्रेश रूट",
    descEn: "High-speed direct transport minimising transit spoilage",
    descHi: "तेज़ सीधा परिवहन — पारगमन में कम नुकसान",
    descCg: "जल्दी सीधा ट्रांसपोर्ट — रास्ता म कम बर्बादी",
    qualityMult: 1.0,
    volumeMult: 1.0,
    logisticsMult: 1.5,
  },
];

/** Middleman share rate assumed for comparison (25% of base mandi price) */
const MIDDLEMAN_RATE = 0.25;

export function DynamicPricingCard({
  crop,
  quantity,
  grade,
  score = 85.0,
  distance = 25.0,
  basePrice,
}: DynamicPricingCardProps) {
  const { t, language } = useLanguage();
  const [data, setData] = useState<DynamicMarginResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>("cluster");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiService
      .calculateDynamicMargin({
        crop_type: crop,
        quantity_kg: quantity,
        quality_grade: grade,
        quality_score: score,
        distance_km: distance,
        base_mandi_price: basePrice,
      })
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Dynamic Margin Error:", err);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [crop, quantity, grade, score, distance, basePrice]);

  if (loading) {
    return (
      <div className="bg-white border border-emerald-100 rounded-2xl p-4 animate-pulse flex flex-col gap-4">
        <div className="h-4 bg-emerald-50 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-8 bg-emerald-50 rounded-xl" />
          ))}
        </div>
        <div className="h-24 bg-gray-50 rounded-xl w-full" />
      </div>
    );
  }

  if (!data) return null;

  const f = data.factors;
  const scenario = SCENARIOS.find((s) => s.key === activeScenario)!;

  // Compute scenario-adjusted per-kg figures
  const qualityBonus = f.quality_premium.impact_inr * scenario.qualityMult;
  const volumeBonus = f.volume_efficiency.impact_inr * scenario.volumeMult;
  const logisticsBonus =
    ((f.logistics_saving.farmer_share_inr + f.logistics_saving.buyer_share_inr) / 2) *
    scenario.logisticsMult;
  const mandiRupeeCut = data.base_mandi_price * MIDDLEMAN_RATE;

  // Farmer per-kg and total
  const farmerPerKg =
    data.base_mandi_price +
    qualityBonus +
    volumeBonus +
    f.logistics_saving.farmer_share_inr * scenario.logisticsMult;
  const farmerTotal = farmerPerKg * quantity;

  // Buyer per-kg and savings vs mandi
  const buyerPerKg =
    data.base_mandi_price +
    qualityBonus -
    f.logistics_saving.buyer_share_inr * scenario.logisticsMult;
  const buyerSavingsVsMandi = data.base_mandi_price * (1 + MIDDLEMAN_RATE) - buyerPerKg;
  const buyerSavingsPct =
    ((buyerSavingsVsMandi / (data.base_mandi_price * (1 + MIDDLEMAN_RATE))) * 100);

  // Shared logistics dividend (returned from eliminated empty return trips)
  const sharedLogisticsDividend = logisticsBonus * quantity;

  const fmt = (n: number) =>
    "₹" + Math.round(n).toLocaleString("en-IN");

  const fmtKg = (n: number) =>
    (n >= 0 ? "+" : "") + "₹" + Math.abs(n).toFixed(2);

  return (
    <div className="bg-white border border-emerald-200 shadow-sm rounded-2xl overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-5 py-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <TrendingUp size={16} className="opacity-90" />
              <h3 className="text-[15px] font-bold leading-tight">
                {t(
                  "KisanSetu Fair Value Discovery™",
                  "किसानसेतु उचित मूल्य खोज™",
                  "किसानसेतु उचित दाम खोज™"
                )}
              </h3>
            </div>
            <p className="text-[11px] text-emerald-100 leading-snug">
              {t(
                "Eliminating 25% middleman commission • Direct-to-market transparent valuation",
                "25% दलाल कमीशन समाप्त • सीधे बाज़ार में पारदर्शी मूल्यांकन",
                "25% दलाली खतम • सीधा बाज़ार म साफ दाम"
              )}
            </p>
          </div>
          <div className="flex-shrink-0 bg-white/20 rounded-full px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1">
            <CheckCircle2 size={12} />
            {t("AI Verified", "AI सत्यापित", "AI जांचा")}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {/* Scenario Selector */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            {t("Choose Your Scenario", "अपना परिदृश्य चुनें", "आपन परिस्थिति चुनव")}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {SCENARIOS.map((sc) => {
              const label =
                language === "hi" ? sc.labelHi : language === "cg" ? sc.labelCg : sc.labelEn;
              const desc =
                language === "hi" ? sc.descHi : language === "cg" ? sc.descCg : sc.descEn;
              const isActive = activeScenario === sc.key;
              return (
                <button
                  key={sc.key}
                  onClick={() => setActiveScenario(sc.key)}
                  className={`flex flex-col items-center text-center gap-1 rounded-xl border-2 px-2 py-2.5 transition-all cursor-pointer ${
                    isActive
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-slate-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                  }`}
                  title={desc}
                >
                  <span className="text-xl leading-none">{sc.emoji}</span>
                  <span
                    className={`text-[10px] font-bold leading-tight ${
                      isActive ? "text-emerald-800" : "text-slate-700"
                    }`}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
          {/* Active scenario description */}
          <p className="text-[11px] text-slate-500 mt-2 text-center italic">
            {language === "hi"
              ? scenario.descHi
              : language === "cg"
              ? scenario.descCg
              : scenario.descEn}
          </p>
        </div>

        {/* 3 Benefit Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* Farmer Direct Advantage */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Leaf size={14} className="text-emerald-600" />
              <p className="text-[10px] font-bold uppercase text-emerald-800">
                {t("Farmer Advantage", "किसान लाभ", "किसान फायदा")}
              </p>
            </div>
            <p className="text-xl font-black text-emerald-900">{fmt(farmerTotal)}</p>
            <p className="text-[10px] text-emerald-700 mt-0.5">
              {fmt(farmerPerKg)}/{t("kg total payout", "किग्रा कुल भुगतान", "किलो कुल भुगतान")}
            </p>
            <div className="mt-2 space-y-0.5 text-[10px] text-slate-600">
              <div className="flex justify-between">
                <span>{t("Mandi Benchmark", "मंडी आधार", "मंडी आधार")}</span>
                <span className="font-semibold">₹{data.base_mandi_price.toFixed(2)}/kg</span>
              </div>
              <div className="flex justify-between">
                <span>{t("Quality Reward", "गुणवत्ता बोनस", "गुणवत्ता इनाम")}</span>
                <span className="font-semibold text-emerald-700">{fmtKg(qualityBonus)}/kg</span>
              </div>
              <div className="flex justify-between">
                <span>{t("Route Dividend", "रूट लाभांश", "रूट लाभांश")}</span>
                <span className="font-semibold text-emerald-700">
                  {fmtKg(f.logistics_saving.farmer_share_inr * scenario.logisticsMult)}/kg
                </span>
              </div>
            </div>
          </div>

          {/* Buyer Direct Savings */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ShoppingBag size={14} className="text-blue-600" />
              <p className="text-[10px] font-bold uppercase text-blue-800">
                {t("Buyer Savings", "खरीदार बचत", "खरीददार बचत")}
              </p>
            </div>
            <p className="text-xl font-black text-blue-900">
              -{buyerSavingsPct.toFixed(1)}%
            </p>
            <p className="text-[10px] text-blue-700 mt-0.5">
              {t("vs. Mandi Terminal Rate", "मंडी दर से कम", "मंडी दर से कम")}
            </p>
            <div className="mt-2 space-y-0.5 text-[10px] text-slate-600">
              <div className="flex justify-between">
                <span>{t("Farm-Gate Price", "खेत-मूल्य", "खेत-भाव")}</span>
                <span className="font-semibold">₹{buyerPerKg.toFixed(2)}/kg</span>
              </div>
              <div className="flex justify-between">
                <span>{t("Mandi + Dalali", "मंडी + दलाली", "मंडी + दलाली")}</span>
                <span className="font-semibold text-slate-500 line-through">
                  ₹{(data.base_mandi_price * (1 + MIDDLEMAN_RATE)).toFixed(2)}/kg
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("You Save", "आपकी बचत", "आप बचाव")}</span>
                <span className="font-semibold text-blue-700">{fmtKg(buyerSavingsVsMandi)}/kg</span>
              </div>
            </div>
          </div>

          {/* Shared Logistics Savings */}
          <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Truck size={14} className="text-orange-600" />
              <p className="text-[10px] font-bold uppercase text-orange-800">
                {t("Logistics Saving", "लॉजिस्टिक्स बचत", "ट्रांसपोर्ट बचत")}
              </p>
            </div>
            <p className="text-xl font-black text-orange-900">{fmt(sharedLogisticsDividend)}</p>
            <p className="text-[10px] text-orange-700 mt-0.5">
              {t("50:50 shared route dividend", "50:50 साझा मार्ग लाभांश", "50:50 रूट बचत")}
            </p>
            <div className="mt-2 space-y-0.5 text-[10px] text-slate-600">
              <div className="flex justify-between">
                <span>{t("Farmer Share", "किसान हिस्सा", "किसान हिस्सा")}</span>
                <span className="font-semibold text-emerald-700">
                  {fmt(f.logistics_saving.farmer_share_inr * scenario.logisticsMult * quantity)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("Buyer Share", "खरीदार हिस्सा", "खरीददार हिस्सा")}</span>
                <span className="font-semibold text-blue-700">
                  {fmt(f.logistics_saving.buyer_share_inr * scenario.logisticsMult * quantity)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("Empty Trip Saved", "खाली ट्रिप बची", "खाली ट्रिप बचाय")}</span>
                <span className="font-semibold text-orange-700">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Factor Breakdown – plain language */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            {t("How Your Price is Built", "आपका मूल्य कैसे बना", "आपके दाम कइसे बनिस")}
          </p>
          <div className="space-y-2">
            {/* Base Market Value */}
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <BadgeIndianRupee size={16} className="text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800">
                  {t("Base Market Value", "आधार बाज़ार मूल्य", "आधार बाज़ार दाम")}
                </p>
                <p className="text-[10px] text-slate-500 leading-snug">
                  {t(
                    "Real-time APMC Mandi Modal benchmark rate",
                    "रियल-टाइम APMC मंडी मोडल बेंचमार्क दर",
                    "रियल-टाइम APMC मंडी बेंचमार्क दर"
                  )}
                </p>
              </div>
              <span className="text-sm font-bold text-slate-800 flex-shrink-0">
                ₹{data.base_mandi_price.toFixed(2)}/kg
              </span>
            </div>

            {/* Quality Reward */}
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Award size={16} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-800">
                  {t("Quality Reward", "गुणवत्ता इनाम", "गुणवत्ता इनाम")} — {t("Grade", "ग्रेड", "ग्रेड")}{" "}
                  {grade}
                </p>
                <p className="text-[10px] text-emerald-700 leading-snug">
                  {t(
                    "AI camera-graded produce protects you from arbitrary broker downgrading",
                    "AI कैमरा से ग्रेड की फसल — मनमाने ब्रोकर डाउनग्रेड से सुरक्षा",
                    "AI कैमरा से ग्रेड — मनमाना डाउनग्रेड से बचाव"
                  )}
                </p>
              </div>
              <span className="text-sm font-bold text-emerald-700 flex-shrink-0">
                {fmtKg(qualityBonus)}/kg
              </span>
            </div>

            {/* Group Volume Dividend */}
            <div className="flex items-center gap-3 rounded-xl bg-purple-50 border border-purple-100 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Users size={16} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-purple-800">
                  {t("Group Volume Dividend", "समूह वॉल्यूम लाभांश", "समूह वॉल्यूम लाभांश")}
                </p>
                <p className="text-[10px] text-purple-700 leading-snug">
                  {t(
                    "Logistics efficiency from consolidated pickup — shared savings",
                    "एकत्रित पिकअप से लॉजिस्टिक्स दक्षता — साझा बचत",
                    "एकत्रित पिकअप से कम लागत — साझा बचत"
                  )}
                </p>
              </div>
              <span className="text-sm font-bold text-purple-700 flex-shrink-0">
                {fmtKg(volumeBonus)}/kg
              </span>
            </div>

            {/* Middleman Cut Eliminated */}
            <div className="flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <span className="text-rose-600 text-sm font-black">✂</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-rose-800">
                  {t("Middleman Cut Eliminated", "दलाल कमीशन समाप्त", "दलाल कमीशन खतम")}
                </p>
                <p className="text-[10px] text-rose-700 leading-snug">
                  {t(
                    "25% traditional mandi broker commission returned to farmers & buyers",
                    "25% पारंपरिक मंडी दलाल कमीशन किसानों और खरीदारों को वापस",
                    "25% पुरानी मंडी दलाली किसान अउ खरीददार ला वापस"
                  )}
                </p>
              </div>
              <span className="text-sm font-bold text-rose-700 flex-shrink-0">
                +₹{mandiRupeeCut.toFixed(2)}/kg
              </span>
            </div>
          </div>
        </div>

        {/* Financial Summary Footer */}
        <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 text-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 mb-2">
            {t("Your Total Financial Impact", "आपका कुल वित्तीय प्रभाव", "आपके कुल पैसा असर")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-emerald-200">
                {t("Farmer Total Payout", "किसान कुल भुगतान", "किसान कुल भुगतान")}
              </p>
              <p className="text-2xl font-black">{fmt(farmerTotal)}</p>
              <p className="text-[10px] text-emerald-300">
                ↑ +{data.farmer_uplift_pct.toFixed(1)}%{" "}
                {t("vs Mandi", "मंडी से अधिक", "मंडी से जाड़ा")}
              </p>
            </div>
            <div className="border-l border-white/20 pl-3">
              <p className="text-[10px] text-emerald-200">
                {t("Buyer Total Cost", "खरीदार कुल लागत", "खरीददार कुल लागत")}
              </p>
              <p className="text-2xl font-black">{fmt(buyerPerKg * quantity)}</p>
              <p className="text-[10px] text-emerald-300">
                ↓ -{buyerSavingsPct.toFixed(1)}%{" "}
                {t("vs Mandi Rate", "मंडी दर से कम", "मंडी दर से कम")}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between">
            <span className="text-[11px] text-emerald-200">
              {quantity.toLocaleString("en-IN")} kg · {t("Lot", "लॉट", "लॉट")} · {crop}
            </span>
            <a
              href={`/pricing?crop=${encodeURIComponent(crop)}&grade=${encodeURIComponent(grade)}`}
              className="text-[11px] font-bold text-white hover:text-emerald-100 flex items-center gap-1 underline underline-offset-2"
            >
              {t("Market Forecaster Hub", "बाज़ार पूर्वानुमान हब", "बाज़ार अनुमान हब")}
              <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
