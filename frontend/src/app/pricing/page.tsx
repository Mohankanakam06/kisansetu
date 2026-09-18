"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiService, DynamicMarginResponse, HistoricalTrendsResponse } from "@/services/api";
import { TickerItem } from "@/types";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Button, Card, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/language";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ShieldCheck,
  Scale,
  Truck,
  Package,
  Award,
  Snowflake,
  CheckCircle2,
  RefreshCw,
  Sliders,
  DollarSign,
  Layers,
  Radio,
  ExternalLink,
  ChevronRight,
  BarChart3,
  HelpCircle,
  Clock,
  MapPin,
  Check,
  Info,
  Sprout,
  Users,
  Building2,
  UserCheck,
} from "lucide-react";

const COMMODITIES = [
  { name: "Tomato", hindi: "टमाटर", defaultBase: 24.0, mandi: "Raipur APMC", state: "Chhattisgarh" },
  { name: "Onion", hindi: "प्याज", defaultBase: 28.0, mandi: "Lasalgaon APMC", state: "Maharashtra" },
  { name: "Potato", hindi: "आलू", defaultBase: 18.0, mandi: "Agra APMC", state: "Uttar Pradesh" },
  { name: "Wheat", hindi: "गेहूं", defaultBase: 25.5, mandi: "Khanna APMC", state: "Punjab" },
  { name: "Rice", hindi: "धान / चावल", defaultBase: 38.0, mandi: "Karnal APMC", state: "Haryana" },
  { name: "Chilli", hindi: "मिर्च", defaultBase: 68.0, mandi: "Guntur APMC", state: "Andhra Pradesh" },
  { name: "Soybean", hindi: "सोयाबीन", defaultBase: 45.0, mandi: "Indore APMC", state: "Madhya Pradesh" },
  { name: "Cotton", hindi: "कपास", defaultBase: 62.0, mandi: "Rajkot APMC", state: "Gujarat" },
];

type ScenarioKey = "cluster" | "supermarket" | "smallholder";

interface ScenarioConfig {
  label: string;
  labelHi: string;
  labelCg: string;
  icon: string;
  tagline: string;
  taglineHi: string;
  taglineCg: string;
  crop: string;
  quantity: number;
  grade: string;
  score: number;
  distance: number;
  basePrice: number;
  storyTitle: string;
  storyTitleHi: string;
  storyTitleCg: string;
  storyText: string;
  storyTextHi: string;
  storyTextCg: string;
  farmerUplift: string;
  buyerDiscount: string;
}

const SCENARIOS: Record<ScenarioKey, ScenarioConfig> = {
  cluster: {
    label: "Village Cluster Aggregation",
    labelHi: "ग्राम क्लस्टर एकत्रीकरण",
    labelCg: "गाँव क्लस्टर एकत्रीकरण",
    icon: "🌾",
    tagline: "5–10 smallholders pool produce into a consolidated truckload (Tilda to Raipur Yard)",
    taglineHi: "5–10 छोटे किसान मिलकर पूरा ट्रकलोड तैयार करते हैं (तिल्दा से रायपुर मंडी)",
    taglineCg: "5–10 किसान मिलके पूरा गाड़ी भर फसल जोड़थें (तिल्दा ले रायपुर मंडी)",
    crop: "Tomato",
    quantity: 4800,
    grade: "B",
    score: 78,
    distance: 28,
    basePrice: 24.0,
    storyTitle: "Case Study: Tilda Block Cluster, Raipur District",
    storyTitleHi: "केस स्टडी: तिल्दा ब्लॉक क्लस्टर, रायपुर",
    storyTitleCg: "केस स्टडी: तिल्दा क्लस्टर, रायपुर",
    storyText: "8 smallholder farmers with 400–800 kg each pooled into a single 4,800 kg pickup. Eliminating empty return trips reduced freight by ₹1.20/kg, returning ₹5,760 in shared transport dividends.",
    storyTextHi: "8 छोटे किसानों (400-800 किलो प्रत्येक) ने मिलकर 4,800 किलो की लॉट बनाई। साझा परिवहन से प्रति किलो ₹1.20 मालभाड़ा बचा, जिससे कुल ₹5,760 का अतिरिक्त लाभ हुआ।",
    storyTextCg: "8 किसान मिलके 4,800 किलो के लॉट बनाईन। गाड़ी भाड़ा म प्रति किलो ₹1.20 बचिस, कुल ₹5,760 जादा मिलिस।",
    farmerUplift: "+18.4%",
    buyerDiscount: "-12.5%",
  },
  supermarket: {
    label: "Grade A Supermarket Direct",
    labelHi: "सुपरमार्केट सीधी आपूर्ति",
    labelCg: "सुपरमार्केट सीधा सप्लाई",
    icon: "🏪",
    tagline: "5,000 kg premium Grade A harvest direct to retail buyer with 0% middleman commission",
    taglineHi: "5,000 किलो प्रीमियम ग्रेड A फसल सीधे थोक खरीदार को — 0% दलाली",
    taglineCg: "5,000 किलो ग्रेड A टमाटर सीधा थोक खरीदार ल — 0% दलाली",
    crop: "Tomato",
    quantity: 5000,
    grade: "A",
    score: 94,
    distance: 22,
    basePrice: 24.0,
    storyTitle: "Case Study: Direct Farm-Gate Supply to Supermarket Chain",
    storyTitleHi: "केस स्टडी: सुपरमार्केट को फार्म-गेट से सीधी आपूर्ति",
    storyTitleCg: "केस स्टडी: सुपरमार्केट ल सीधा खेत ले सप्लाई",
    storyText: "Farmer Producer Organization delivered AI-verified Grade A tomatoes directly to a supermarket chain. Buyer saved ₹5.80/kg vs terminal mandi retail while farmer received ₹4.20/kg above local mandi floor.",
    storyTextHi: "FPO ने AI-सत्यापित ग्रेड A टमाटर सीधे सुपरमार्केट को दिए। खरीदार को मंडी की तुलना में ₹5.80/किलो बचत हुई और किसान को ₹4.20/किलो अधिक दाम मिला।",
    storyTextCg: "FPO ह ग्रेड A टमाटर सीधा सुपरमार्केट ल दिस। खरीदार ल ₹5.80/किलो बचत होइस आ किसान ल ₹4.20/किलो जादा भाव मिलिस।",
    farmerUplift: "+24.2%",
    buyerDiscount: "-16.8%",
  },
  smallholder: {
    label: "Smallholder Price Protection",
    labelHi: "छोटे किसान मूल्य संरक्षण",
    labelCg: "छोटे किसान रेट सुरक्षा",
    icon: "👨‍🌾",
    tagline: "Individual 500 kg listing protected from arbitrary broker distress downgrades",
    taglineHi: "500 किलो व्यक्तिगत उपज — दलालों की मनमानी कटौती और औने-पौने दामों से सुरक्षा",
    taglineCg: "500 किलो खुद के उपज — दलाल मन के मनमानी भाव ले पूरी सुरक्षा",
    crop: "Tomato",
    quantity: 500,
    grade: "B",
    score: 72,
    distance: 15,
    basePrice: 24.0,
    storyTitle: "Case Study: Single Farmer Listing in Durg District",
    storyTitleHi: "केस स्टडी: दुर्ग जिले के किसान की व्यक्तिगत लिस्टिंग",
    storyTitleCg: "केस स्टडी: दुर्ग के किसान के लिस्टिंग",
    storyText: "A farmer with 500 kg listed on KisanSetu. AI camera verified grade B+ (72/100). Received ₹26.50/kg vs ₹19.00/kg offered at local yard — a ₹3,750 net gain on a single harvest.",
    storyTextHi: "एक किसान ने 500 किलो टमाटर लिस्ट किया। AI कैमरे ने ग्रेड B+ (72/100) प्रमाणित किया। स्थानीय दलाल के ₹19 के मुकाबले ₹26.50/किलो मिला — एक फसल पर ₹3,750 अधिक।",
    storyTextCg: "एक किसान 500 किलो टमाटर लिस्ट करिस। AI ग्रेड B+ (72/100) दिस। दलाल के ₹19 के बदला ₹26.50/किलो मिलिस — कुल ₹3,750 जादा फायदा।",
    farmerUplift: "+15.2%",
    buyerDiscount: "-9.0%",
  },
};

function PricingHubContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();

  const queryCrop = searchParams.get("crop") || "Tomato";
  const queryGrade = searchParams.get("grade") || "A";

  // Active state for Forecaster and Calculator
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>("cluster");
  const [selectedCrop, setSelectedCrop] = useState<string>(queryCrop);
  const [lotQuantity, setLotQuantity] = useState<number>(4800);
  const [qualityGrade, setQualityGrade] = useState<string>(queryGrade);
  const [qualityScore, setQualityScore] = useState<number>(queryGrade === "A" ? 92 : queryGrade === "B" ? 78 : 55);
  const [transportDistance, setTransportDistance] = useState<number>(28);
  const [customBasePrice, setCustomBasePrice] = useState<number>(24.0);

  // Live WebSocket Ticker State
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [lastTickerUpdate, setLastTickerUpdate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLastTickerUpdate(new Date());
  }, []);

  // Margin Engine calculation state
  const [marginData, setMarginData] = useState<DynamicMarginResponse | null>(null);
  const [marginLoading, setMarginLoading] = useState<boolean>(true);

  // Historical and Forecasting trend curve state
  const [trendData, setTrendData] = useState<HistoricalTrendsResponse | null>(null);
  const [trendLoading, setTrendLoading] = useState<boolean>(true);

  // Handle Scenario Preset click
  const handleScenarioSelect = (key: ScenarioKey) => {
    setActiveScenario(key);
    const s = SCENARIOS[key];
    setSelectedCrop(s.crop);
    setLotQuantity(s.quantity);
    setQualityGrade(s.grade);
    setQualityScore(s.score);
    setTransportDistance(s.distance);
    setCustomBasePrice(s.basePrice);
  };

  // Handle WebSocket broadcast messages for Ticker
  const handleTickerWS = (msg: any) => {
    if (msg && msg.type === "apmc_ticker" && Array.isArray(msg.data)) {
      setTickerItems(msg.data);
      setLastTickerUpdate(new Date());
    }
  };

  const { isConnected: wsConnected } = useWebSocket("ws/ticker", handleTickerWS);

  // Initial fetch of ticker and trends
  useEffect(() => {
    apiService.getLiveTicker().then((res) => {
      if (res && res.items) setTickerItems(res.items);
    });
  }, []);

  // Update base price when crop changes
  useEffect(() => {
    const matched = COMMODITIES.find((c) => c.name.toLowerCase() === selectedCrop.toLowerCase());
    if (matched) {
      setCustomBasePrice(matched.defaultBase);
    }
  }, [selectedCrop]);

  // Fetch forecast trend curves when crop changes
  useEffect(() => {
    let active = true;
    setTrendLoading(true);
    apiService.getHistoricalTrends(selectedCrop).then((res) => {
      if (active) {
        setTrendData(res);
        setTrendLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [selectedCrop]);

  // Recalculate Dynamic Margin when inputs change
  useEffect(() => {
    let active = true;
    setMarginLoading(true);
    apiService
      .calculateDynamicMargin({
        crop_type: selectedCrop,
        quantity_kg: lotQuantity,
        quality_grade: qualityGrade,
        quality_score: qualityScore,
        distance_km: transportDistance,
        base_mandi_price: customBasePrice,
      })
      .then((res) => {
        if (active) {
          setMarginData(res);
          setMarginLoading(false);
        }
      })
      .catch((err) => {
        console.error("Margin calc error:", err);
        setMarginLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCrop, lotQuantity, qualityGrade, qualityScore, transportDistance, customBasePrice]);

  // SVG Chart points calculation
  const chartPoints = useMemo(() => {
    if (!trendData || !trendData.points || trendData.points.length === 0) return null;
    const pts = trendData.points;
    const prices = pts.map((p) => p.price);
    const minP = Math.min(...prices) * 0.95;
    const maxP = Math.max(...prices) * 1.05;
    const range = maxP - minP || 1;

    const width = 600;
    const height = 180;
    const padding = 20;

    const coords = pts.map((p, idx) => {
      const x = padding + (idx / (pts.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((p.price - minP) / range) * (height - 2 * padding);
      return { x, y, ...p };
    });

    const historicalCoords = coords.filter((c) => c.type === "historical" || c.type === "current");
    const forecastCoords = coords.filter((c) => c.type === "current" || c.type === "forecast");

    const histPath = historicalCoords.reduce((acc, c, i) => `${acc} ${i === 0 ? "M" : "L"} ${c.x},${c.y}`, "");
    const futPath = forecastCoords.reduce((acc, c, i) => `${acc} ${i === 0 ? "M" : "L"} ${c.x},${c.y}`, "");

    return { coords, histPath, futPath, minP, maxP };
  }, [trendData]);

  const f = marginData?.factors;
  const currentScenario = SCENARIOS[activeScenario];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 pt-6 font-sans">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                🌾 {t("KisanSetu Fair Value Discovery™", "KisanSetu उचित मूल्य निर्धारण™", "KisanSetu सही रेट इंजन™")}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500">
                Agmarknet APMC Benchmarks • 0% Broker Commission • 2-Stage Milestone Escrow
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-display">
              {t("KisanSetu Fair Value Discovery™", "KisanSetu उचित मूल्य खोज केंद्र", "KisanSetu सही भाव खोज केंद्र")}
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              {t(
                "How AI finds fair prices by eliminating the 25% middleman dalali — connecting farmers directly to wholesale buyers with guaranteed Mandi floors, camera quality grading, and shared logistics savings.",
                "AI द्वारा बिचौलियों के 25% कमीशन को समाप्त कर किसान और थोक खरीदार को सीधे जोड़ने वाला पारदर्शी मूल्य इंजन। न्यूनतम मंडी बेंचमार्क, कैमरा ग्रेडिंग और साझा लॉजिस्टिक्स बचत की गारंटी।",
                "AI के माध्यम ले 25% दलाली ल खतम करके किसान आ थोक खरीदार ल सीधा जोड़इया सही रेट इंजन। मंडी बेंचमार्क आ कैमरा ग्रेडिंग के संग।"
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm text-xs font-mono text-slate-600">
              <Radio className={`h-3.5 w-3.5 ${wsConnected ? "text-emerald-500 animate-pulse" : "text-amber-500"}`} />
              <span>{wsConnected ? "Live Mandi Feed" : "Polling Feed"}</span>
            </div>

            <Link href="/farmer">
              <Button
                variant="outline"
                size="sm"
                className="bg-emerald-800 hover:bg-emerald-900 text-white border-emerald-800 text-xs font-semibold gap-1.5"
              >
                <Sprout className="h-3.5 w-3.5" />
                {t("List Produce (AI Graded)", "फसल लिस्ट करें (AI ग्रेडिंग)", "फसल लिस्ट करव")}
              </Button>
            </Link>
          </div>
        </div>

        {/* 3-Column Core Value Pillar Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white border border-emerald-100 p-4 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <span>🌾 {t("Farmer Direct Advantage", "किसान का सीधा फायदा", "किसान के सीधा फायदा")}</span>
              <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono text-[11px] font-bold text-emerald-700">
                +15% to +25%
              </span>
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              ₹24.00 – ₹32.00<span className="text-xs font-normal text-slate-500">/kg net</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal">
              {t(
                "Guaranteed APMC Mandi floor + AI quality bonus + route consolidation dividend. Paid in 48 hrs.",
                "मंडी फ्लोर रेट + AI क्वालिटी बोनस + परिवहन बचत। 48 घंटे में भुगतान।",
                "मंडी भाव + AI क्वालिटी बोनस + गाड़ी भाड़ा बचत। 48 घंटा म पइसा।"
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-blue-100 p-4 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-blue-700 uppercase tracking-wider">
              <span>🏪 {t("Buyer Direct Savings", "खरीदार की सीधी बचत", "खरीदार के बचत")}</span>
              <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono text-[11px] font-bold text-blue-700">
                -10% to -18%
              </span>
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              ₹22.50 – ₹28.00<span className="text-xs font-normal text-slate-500">/kg landed</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal">
              {t(
                "Farm-gate procurement at wholesale rates below terminal market retail. Zero commission agents.",
                "टर्मिनल मंडी से सस्ती सीधी फार्म-गेट खरीद। कोई आढ़तिया या दलाली नहीं।",
                "खेत ले सीधा खरीद मंडी ले सस्ता। कोई दलाली नई।"
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-purple-100 p-4 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-purple-700 uppercase tracking-wider">
              <span>🤝 {t("Shared Logistics Dividend", "साझा परिवहन लाभांश", "साझा गाड़ी बचत")}</span>
              <span className="bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-mono text-[11px] font-bold text-purple-700">
                50:50 Split
              </span>
            </div>
            <div className="text-xl font-black text-slate-900 font-mono">
              +₹1.20 – ₹2.40<span className="text-xs font-normal text-slate-500">/kg saved</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal">
              {t(
                "Eliminates empty return truck trips by consolidating village pickups along common transport corridors.",
                "गाँव के पिकअप को एक साथ जोड़कर खाली लौटने वाले ट्रकों का खर्च खत्म करता है।",
                "गाँव के फसल ल एक गाड़ी म जोड़के खाली गाड़ी के खर्चा बचाथे।"
              )}
            </p>
          </div>
        </div>

        {/* REAL-LIFE AGRICULTURAL SCENARIO PRESETS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                {t("Real-Life Marketplace Scenarios", "वास्तविक कृषि परिदृश्य", "असली खेती के परिदृश्य")}
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {t(
                  "Explore How Fair Value Discovery Operates in Real Farming Situations",
                  "देखें वास्तविक खेती में फेयर वैल्यू डिस्कवरी कैसे काम करती है",
                  "देखव असली खेती म फेयर वैल्यू कइसे काम करथे"
                )}
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              {t("Click a preset to simulate live factors", "लाइव प्रभाव देखने के लिए क्लिक करें", "लाइव देखे बर क्लिक करव")}
            </span>
          </div>

          {/* Scenario Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(["cluster", "supermarket", "smallholder"] as const).map((key) => {
              const sc = SCENARIOS[key];
              const isSelected = activeScenario === key;
              const label = language === "hi" ? sc.labelHi : language === "cg" ? sc.labelCg : sc.label;
              const tagline = language === "hi" ? sc.taglineHi : language === "cg" ? sc.taglineCg : sc.tagline;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleScenarioSelect(key)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative group ${
                    isSelected
                      ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200 shadow-sm"
                      : "bg-white border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{sc.icon}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isSelected
                          ? "bg-emerald-600 text-white font-black"
                          : "bg-slate-100 text-emerald-700 border border-slate-200"
                      }`}
                    >
                      {sc.farmerUplift} Farmer Gain
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold mb-1 transition-colors ${isSelected ? "text-emerald-900" : "text-slate-800 group-hover:text-emerald-800"}`}>
                    {label}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{tagline}</p>
                </button>
              );
            })}
          </div>

          {/* Active Scenario Case Study Callout */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase tracking-wider text-[11px]">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {language === "hi"
                  ? currentScenario.storyTitleHi
                  : language === "cg"
                  ? currentScenario.storyTitleCg
                  : currentScenario.storyTitle}
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {language === "hi"
                ? currentScenario.storyTextHi
                : language === "cg"
                ? currentScenario.storyTextCg
                : currentScenario.storyText}
            </p>
          </div>
        </div>

        {/* Real-Time APMC Mandi Ticker Strip */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t("Live Mandi Price Discovery (APMC Benchmarks)", "लाइव मंडी भाव (APMC बेंचमार्क)", "लाइव मंडी भाव")}
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                Synced Real-Time
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono" suppressHydrationWarning>
              {mounted && lastTickerUpdate ? `Updated: ${lastTickerUpdate.toLocaleTimeString()}` : "Syncing live data..."}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {tickerItems.map((item) => {
              const isPositive = (item.change_24h_pct ?? item.price_change_pct ?? 0) >= 0;
              const isSelected = item.crop_type.toLowerCase() === selectedCrop.toLowerCase();
              return (
                <button
                  key={item.crop_type}
                  onClick={() => setSelectedCrop(item.crop_type)}
                  className={`p-3 rounded-xl border text-left transition-all relative group cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200 shadow-sm"
                      : "bg-white border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                    <span className="truncate">{item.crop_type}</span>
                    <span
                      className={`flex items-center text-[10px] font-mono font-bold ${
                        isPositive ? "text-emerald-600" : "text-rose-500"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {(item.change_24h_pct ?? item.price_change_pct ?? 0).toFixed(1)}%
                    </span>
                  </div>

                  <div className="text-lg font-black text-slate-900 font-mono">
                    ₹{item.price_per_kg.toFixed(2)}
                    <span className="text-[10px] font-normal text-slate-500">/kg</span>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 truncate">
                    <span className="truncate">{item.mandi || item.mandi_name || "APMC Yard"}</span>
                    {item.predicted_trend_7d === "up" ? (
                      <ArrowUpRight className="h-3 w-3 text-emerald-500 shrink-0" />
                    ) : item.predicted_trend_7d === "down" ? (
                      <ArrowDownRight className="h-3 w-3 text-rose-500 shrink-0" />
                    ) : (
                      <span className="text-slate-400">─</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Forecaster & Trend Projection */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                {t("Mandi Benchmark Forecaster & 7-Day Trend", "मंडी भाव पूर्वानुमान एवं 7-दिवसीय ट्रेंड", "मंडी भाव 7 दिन के पूर्वानुमान")}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {selectedCrop} — {t("14-Day Past Prices & 7-Day Projected Trend", "14 दिन का पिछला भाव एवं 7 दिन का अनुमान", "14 दिन के पिछिला भाव आ 7 दिन के अनुमान")}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1 rounded-lg font-mono">
                Agmarknet Historicals
              </span>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg font-mono">
                Multi-Mandi ML Model
              </span>
            </div>
          </div>

          {/* SVG Line Chart — light-themed */}
          <div className="relative">
            {chartPoints ? (
              <div className="w-full overflow-x-auto">
                <svg viewBox="0 0 600 180" className="w-full h-44 sm:h-52 select-none overflow-visible">
                  {/* Horizontal Grid lines */}
                  {[0.25, 0.5, 0.75].map((pct, i) => (
                    <line
                      key={i}
                      x1="20"
                      y1={180 * pct}
                      x2="580"
                      y2={180 * pct}
                      stroke="#E2E8F0"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Historical Solid Line */}
                  <path
                    d={chartPoints.histPath}
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Future Forecast Dashed Line */}
                  <path
                    d={chartPoints.futPath}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3"
                    strokeDasharray="5 3"
                    strokeLinecap="round"
                  />

                  {/* Data Points */}
                  {chartPoints.coords.map((pt, idx) => {
                    const isFut = pt.type === "forecast";
                    const isCurr = pt.type === "current";
                    return (
                      <g key={idx} className="group cursor-pointer">
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isCurr ? 5 : isFut ? 3.5 : 2.5}
                          fill={isCurr ? "#059669" : isFut ? "#10B981" : "#94A3B8"}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <title>{`${pt.date} (${pt.type}): ₹${pt.price.toFixed(2)}/kg`}</title>
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-slate-500 text-xs">
                <RefreshCw className="h-4 w-4 animate-spin mr-2 text-emerald-500" /> Loading price forecast...
              </div>
            )}

            {/* Chart Legend */}
            <div className="flex flex-wrap items-center justify-between text-xs pt-3 border-t border-slate-100 text-slate-500 gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-5 bg-slate-400 rounded-sm inline-block" />
                  Past 14 Days Actuals
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-5 bg-emerald-500 rounded-sm inline-block" />
                  7-Day Projected Trend
                </span>
              </div>
              <div className="font-mono text-emerald-700 font-semibold">
                Expected 7-Day Movement: +{trendData?.expected_7d_change_pct ?? 4.8}%
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Fair Value Calculator & Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {t("Fair Value Calculator", "उचित मूल्य कैलकुलेटर", "उचित रेट कैलकुलेटर")}
                </h3>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                Interactive
              </span>
            </div>

            {/* Parameter: Produce Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {t("Commodity Crop", "फसल प्रकार", "फसल चुनव")}
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
              >
                {COMMODITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.hindi}) — {c.mandi}
                  </option>
                ))}
              </select>
            </div>

            {/* Parameter: Lot Quantity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {t("Consolidated Lot Weight (kg)", "लॉट कुल वजन (किलो)", "लॉट के कुल वजन")}
                </span>
                <span className="font-mono font-bold text-emerald-700">
                  {lotQuantity.toLocaleString()} kg ({((lotQuantity / 1000).toFixed(1))} MT)
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={lotQuantity}
                onChange={(e) => setLotQuantity(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>100 kg (Smallholder)</span>
                <span>5,000 kg (Truckload)</span>
                <span>10,000 kg (Cluster)</span>
              </div>
            </div>

            {/* Parameter: Quality Grade & Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {t("Quality Grade & AI Score", "गुणवत्ता ग्रेड और AI स्कोर", "क्वालिटी ग्रेड आ स्कोर")}
                </span>
                <span className="font-mono font-bold text-emerald-700">
                  Grade {qualityGrade} ({qualityScore}/100)
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {(["A", "B", "C", "D"] as const).map((grd) => (
                  <button
                    key={grd}
                    type="button"
                    onClick={() => {
                      setQualityGrade(grd);
                      setQualityScore(grd === "A" ? 92 : grd === "B" ? 78 : grd === "C" ? 55 : 35);
                    }}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      qualityGrade === grd
                        ? grd === "A"
                          ? "bg-emerald-50 border-emerald-400 text-emerald-800 ring-1 ring-emerald-300"
                          : grd === "B"
                          ? "bg-blue-50 border-blue-400 text-blue-800 ring-1 ring-blue-300"
                          : grd === "C"
                          ? "bg-amber-50 border-amber-400 text-amber-800 ring-1 ring-amber-300"
                          : "bg-rose-50 border-rose-400 text-rose-800 ring-1 ring-rose-300"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    Grade {grd}
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter: Consolidated Logistics Distance */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {t("Consolidated Route Distance", "परिवहन दूरी (किमी)", "गाड़ी के दूरी")}
                </span>
                <span className="font-mono font-bold text-emerald-700">{transportDistance} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={transportDistance}
                onChange={(e) => setTransportDistance(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>5 km (Local)</span>
                <span>50 km (Regional)</span>
                <span>200 km (Inter-district)</span>
              </div>
            </div>

            {/* Parameter: Base Mandi Price Override */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {t("Guaranteed Mandi Benchmark (₹/kg)", "मंडी आधार मूल्य (रु/किलो)", "मंडी आधार भाव")}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const matched = COMMODITIES.find((c) => c.name === selectedCrop);
                    if (matched) setCustomBasePrice(matched.defaultBase);
                  }}
                  className="text-[10px] text-emerald-600 hover:underline font-mono"
                >
                  Reset Benchmark
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={customBasePrice}
                  onChange={(e) => setCustomBasePrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-7 pr-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                />
              </div>
            </div>
          </div>

          {/* Value Breakdown & Financial Impact Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {marginData ? (
              <div className="space-y-6">
                {/* Hero Financial Payout Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Farmer Uplift Card */}
                  <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                        {t("Direct Farmer Payout", "किसान का सीधा भुगतान", "किसान के सीधा पइसा")}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                        +{marginData.farmer_uplift_pct.toFixed(1)}% Uplift
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-emerald-900 font-mono">
                        ₹{marginData.farmer_payout_kg.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-500">/kg</span>
                    </div>

                    <div className="pt-2 border-t border-emerald-100 text-xs text-slate-600 flex justify-between font-mono">
                      <span>Total Lot Farmer Payout:</span>
                      <span className="font-bold text-emerald-800">
                        ₹{marginData.total_farmer_payout.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Buyer Savings Card */}
                  <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                        {t("Wholesale Buyer Landed Rate", "थोक खरीद मूल्य", "थोक खरीद रेट")}
                      </span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                        -{marginData.buyer_savings_pct.toFixed(1)}% vs Mandi
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-blue-900 font-mono">
                        ₹{marginData.recommended_price_kg.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-500">/kg</span>
                    </div>

                    <div className="pt-2 border-t border-blue-100 text-xs text-slate-600 flex justify-between font-mono">
                      <span>Total Lot Procurement:</span>
                      <span className="font-bold text-blue-800">
                        ₹{marginData.total_lot_value.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* How Your Fair Value Is Calculated */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        {t("How Your Fair Value Is Calculated", "उचित मूल्य की गणना कैसे होती है", "सही रेट कइसे बनथे")}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {t("Transparent AI pricing — every factor explained", "पारदर्शी मूल्य निर्धारण — प्रत्येक घटक स्पष्ट", "पारदर्शी रेट — सब घटक साफ")}
                      </p>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      0% Hidden Cuts
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Baseline */}
                    <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <Scale className="h-4 w-4 text-slate-500 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-800">
                            {t("Guaranteed Mandi Benchmark", "न्यूनतम मंडी बेंचमार्क", "मंडी आधार भाव")}
                          </span>
                          <p className="text-[10px] text-slate-500">
                            Official APMC modal price — farmers never sell below this floor
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-sm">₹{customBasePrice.toFixed(2)}/kg</span>
                    </div>

                    {/* Quality Factor */}
                    {f && (
                      <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-2.5">
                          <Award className="h-4 w-4 text-blue-500 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-800">
                              {t("AI Camera Quality Reward", "AI कैमरा गुणवत्ता बोनस", "AI कैमरा क्वालिटी इनाम")}
                            </span>
                            <p className="text-[10px] text-slate-500">
                              Grade {qualityGrade} ({qualityScore}/100) — protects farmers from arbitrary broker downgrading
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-mono font-bold text-sm ${
                            f.quality_premium.impact_inr >= 0 ? "text-emerald-600" : "text-rose-500"
                          }`}
                        >
                          {f.quality_premium.impact_inr >= 0 ? "+" : ""}₹{f.quality_premium.impact_inr.toFixed(2)}/kg
                        </span>
                      </div>
                    )}

                    {/* Volume Factor */}
                    {f && (
                      <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-2.5">
                          <Package className="h-4 w-4 text-purple-500 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-800">
                              {t("Group Volume Dividend", "समूह मात्रा लाभांश", "समूह वजन फायदा")}
                            </span>
                            <p className="text-[10px] text-slate-500">
                              Efficiency dividend from {lotQuantity.toLocaleString()} kg consolidated truckload
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-emerald-600 text-sm">
                          +₹{f.volume_efficiency.impact_inr.toFixed(2)}/kg
                        </span>
                      </div>
                    )}

                    {/* Logistics Dividend */}
                    {f && (
                      <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-2.5">
                          <Truck className="h-4 w-4 text-amber-500 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-800">
                              {t("Route Consolidation Savings", "रूट एकत्रीकरण बचत", "गाड़ी बचत")}
                            </span>
                            <p className="text-[10px] text-slate-500">
                              Shared transport saving: Farmer (+₹{f.logistics_saving.farmer_share_inr.toFixed(2)}) / Buyer (-₹
                              {f.logistics_saving.buyer_share_inr.toFixed(2)})
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-emerald-600 text-sm">
                          +₹{f.logistics_saving.saving_per_kg.toFixed(2)}/kg
                        </span>
                      </div>
                    )}

                    {/* Perishability Decay */}
                    {f && (
                      <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-2.5">
                          <Snowflake className="h-4 w-4 text-cyan-500 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-800">
                              {t("Transit Risk & Spoilage Allowance", "परिवहन जोखिम व ताजगी भत्ता", "परिवहन जोखिम छूट")}
                            </span>
                            <p className="text-[10px] text-slate-500">
                              Perishable transit decay factor over {transportDistance} km route
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-rose-500 text-sm">
                          ₹{f.perishability_penalty.impact_inr.toFixed(2)}/kg
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                    <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      {marginData.explainability.summary}
                    </p>
                  </div>
                </div>

                {/* ₹1,00,000 Harvest Comparison: Traditional Mandi vs KisanSetu */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {t("₹1,00,000 Harvest Comparison: Traditional Mandi vs KisanSetu", "₹1,00,000 की फसल: पारंपरिक मंडी बनाम KisanSetu", "₹1,00,000 के फसल: दलाल बनाम KisanSetu")}
                    </h4>
                    <span className="text-[10px] text-emerald-700 font-mono">Real-World Case</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Traditional Middleman */}
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-rose-800">Traditional Mandi Brokerage</p>
                          <span className="text-[10px] bg-white text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                            -25% Lost
                          </span>
                        </div>
                        <ul className="space-y-1.5 text-slate-600">
                          <li className="flex items-center gap-1.5 text-rose-700">
                            <span>✕</span> 25-30% middleman brokerage & dalali
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="text-rose-500">✕</span> Arbitrary grading (farmer downgraded)
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="text-rose-500">✕</span> Delayed credit payouts (30-60 days)
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="text-rose-500">✕</span> Empty return tractor freight cost
                          </li>
                        </ul>
                      </div>

                      <div className="pt-3 border-t border-rose-200 space-y-0.5">
                        <span className="text-[10px] text-slate-500">Net Farmer Payout on ₹1,00,000 Harvest:</span>
                        <div className="text-xl font-black text-rose-600 font-mono">
                          ₹75,000
                        </div>
                        <span className="text-[10px] text-rose-500">Paid in 30–60 days on credit</span>
                      </div>
                    </div>

                    {/* KisanSetu Platform */}
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-emerald-800">KisanSetu Direct Platform</p>
                          <span className="text-[10px] bg-white text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                            +₹17,000 Gain
                          </span>
                        </div>
                        <ul className="space-y-1.5 text-slate-700">
                          <li className="flex items-center gap-1.5 text-emerald-700">
                            <Check className="h-3.5 w-3.5" /> 4% transparent platform fee only
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5 text-emerald-600" /> Objective AI camera grading (no cuts)
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5 text-emerald-600" /> 2-Stage milestone escrow protection
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5 text-emerald-600" /> Multi-pickup route consolidation
                          </li>
                        </ul>
                      </div>

                      <div className="pt-3 border-t border-emerald-200 space-y-0.5">
                        <span className="text-[10px] text-slate-500">Net Farmer Payout on ₹1,00,000 Harvest:</span>
                        <div className="text-xl font-black text-emerald-700 font-mono">
                          ₹92,000 <span className="text-xs text-emerald-600 font-bold">(+22.7% more)</span>
                        </div>
                        <span className="text-[10px] text-emerald-600">Paid in 48 hours via Milestone Escrow</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DynamicPricingHubPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <div className="flex items-center gap-2 font-mono text-xs">
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
            Loading KisanSetu Fair Value Discovery...
          </div>
        </div>
      }
    >
      <PricingHubContent />
    </Suspense>
  );
}
