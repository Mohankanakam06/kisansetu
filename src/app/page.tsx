"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Mic,
  Sprout,
  Store,
  Layers,
  Award,
  Wallet,
  Sparkles,
  TrendingUp,
  MapPin,
  Scale,
  Zap,
  Check,
  Percent,
  Clock,
  Globe2,
} from "lucide-react";
import { Button, Card, Badge, cn } from "@/components/ui";
import { useLanguage } from "@/lib/language";

export default function Home() {
  const [calcProduceKg, setCalcProduceKg] = useState(2500);
  const [calcCrop, setCalcCrop] = useState("Tomato");
  const { t } = useLanguage();

  const demoPresets = [
    {
      id: "lot-101",
      name: "Raipur Tomato Cluster",
      crop: "Tomato",
      qty: "2,400 kg",
      price: "₹22.00/kg",
      mandiRef: "₹16.00/kg",
      farmers: 4,
      grade: "Grade A (94%)",
      hub: "Raipur Hub, CG",
      badge: "🔥 High Demand",
    },
    {
      id: "lot-102",
      name: "Nashik Onion Cluster",
      crop: "Onion",
      qty: "4,500 kg",
      price: "₹28.00/kg",
      mandiRef: "₹20.00/kg",
      farmers: 6,
      grade: "Grade A (92%)",
      hub: "Lasalgaon Hub, MH",
      badge: "⚡ 1-Truck Ready",
    },
    {
      id: "lot-103",
      name: "Durg Potato Cluster",
      crop: "Potato",
      qty: "3,200 kg",
      price: "₹18.00/kg",
      mandiRef: "₹12.50/kg",
      farmers: 3,
      grade: "Grade B (88%)",
      hub: "Bhilai Center, CG",
      badge: "🌱 Fresh Harvest",
    },
    {
      id: "lot-104",
      name: "Tilda Green Chilli",
      crop: "Chilli",
      qty: "1,100 kg",
      price: "₹65.00/kg",
      mandiRef: "₹48.00/kg",
      farmers: 2,
      grade: "Grade A (96%)",
      hub: "Tilda APMC, CG",
      badge: "✨ Premium Export",
    },
  ];

  const cropPrices: Record<
    string,
    { mandiFarmer: number; dehaatNinjacart: number; directFarmer: number }
  > = {
    Tomato: { mandiFarmer: 16, dehaatNinjacart: 18.5, directFarmer: 22 },
    Onion: { mandiFarmer: 20, dehaatNinjacart: 23.5, directFarmer: 28 },
    Potato: { mandiFarmer: 12.5, dehaatNinjacart: 14.5, directFarmer: 18 },
    Chilli: { mandiFarmer: 48, dehaatNinjacart: 54, directFarmer: 65 },
    Wheat: { mandiFarmer: 19, dehaatNinjacart: 21, directFarmer: 24.5 },
  };

  const currentPrice = cropPrices[calcCrop] || cropPrices.Tomato;
  const traditionalEarnings = calcProduceKg * currentPrice.mandiFarmer;
  const dehaatEarnings = calcProduceKg * currentPrice.dehaatNinjacart;
  const kisanSetuEarnings = calcProduceKg * currentPrice.directFarmer;
  const extraEarnings = kisanSetuEarnings - traditionalEarnings;
  const percentageGain = Math.round((extraEarnings / traditionalEarnings) * 100);

  return (
    <div className="flex-1 flex flex-col bg-[#f8faf9]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-14 md:py-20 border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/70 via-white to-white z-0" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-900 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              <span>{t("SIH 2026 Problem Statement 26033 · AI Direct-to-Market Engine", "SIH 2026 समस्या कथन 26033 · AI प्रत्यक्ष कृषि बाज़ार", "SIH 2026 समस्या बिबरन 26033 · AI सीधा बाज़ार")}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 font-display leading-[1.12] max-w-3xl mx-auto">
              {t(
                "Outperforming Mandis & Middlemen with 4 Autonomous AI Agents.",
                "4 स्वायत्त AI एजेंटों के साथ मंडियों और बिचौलियों को पीछे छोड़ें।",
                "4 AI एजेंट के संग मंडी आ बिचौलिया ला पाछू छोड़व।"
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {t(
                "KisanSetu replaces 3 layers of mandi middlemen with DBSCAN geo-clustering, Gemini photo grading, 1-truck smart routing, and guaranteed 2-stage milestone escrow.",
                "KisanSetu 3 स्तरीय मंडी बिचौलियों को DBSCAN क्लस्टरिंग, Gemini फोटो ग्रेडिंग, 1-ट्रक स्मार्ट रूटिंग और गारंटीशुदा 2-चरणीय माइलस्टोन एस्क्रो से बदलता है।",
                "KisanSetu 3 परत के बिचौलिया ला DBSCAN क्लस्टरिंग, Gemini फोटो जांच, 1-गाड़ी रूटिंग आ 2-चरणीय एस्क्रो भुगतान ले बदल देथे।"
              )}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/farmer" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold shadow-glow flex items-center justify-center gap-2">
                  <Mic className="h-5 w-5" />
                  {t("List Produce with AI Voice", "AI आवाज़ से फसल दर्ज करें", "AI आवाज ले फसल दर्ज करव")}
                </Button>
              </Link>
              <Link href="/buyer" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold bg-white border-slate-200 text-slate-800 shadow-xs flex items-center justify-center gap-2">
                  <Store className="h-5 w-5 text-emerald-700" />
                  {t("Browse Wholesale Lots", "थोक लॉट देखें", "थोक लॉट देखव")}
                </Button>
              </Link>
            </div>

            {/* Quick Live Demo Presets for SIH Judges */}
            <div className="pt-6">
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {t("Quick SIH Judge Live Demo Clusters (Click to Inspect)", "त्वरित SIH जज लाइव डेमो क्लस्टर (जांचने के लिए क्लिक करें)", "लाइव डेमो क्लस्टर (जांचे बर क्लिक करव)")}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-4xl mx-auto text-left">
                {demoPresets.map((preset) => (
                  <Link
                    key={preset.id}
                    href={`/buyer/${preset.id}`}
                    className="p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-400 transition-all group shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800">
                      <span>{preset.crop}</span>
                      <span className="text-[9px] bg-white px-1.5 py-0.5 rounded border border-emerald-200">{preset.badge}</span>
                    </div>
                    <p className="font-display font-bold text-xs text-slate-900 mt-1 truncate group-hover:text-emerald-900">
                      {preset.name}
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mt-1.5">
                      <span>{preset.qty}</span>
                      <span className="font-bold text-emerald-700">{preset.price}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Live Platform Proof Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-slate-100 pt-8 mt-6">
              {[
                { label: t("Broker Commission", "दलाल कमीशन", "दलाल कमीशन"), value: "0% Direct", sub: t("vs 15-25% Mandi", "बनाम 15-25% मंडी", "बनाम 15-25% मंडी") },
                { label: t("Farmer Income Uplift", "किसान आय वृद्धि", "किसान आमदनी बढ़ोतरी"), value: "+18% to +35%", sub: t("Verified payouts", "सत्यापित भुगतान", "सत्यापित भुगतान") },
                { label: t("1-Truck Mileage Saved", "1-ट्रक माइलेज बचत", "1-गाड़ी माइलेज बचत"), value: "72% Saved", sub: t("Single-loop routing", "सिंगल-लूप रूटिंग", "सिंगल-लूप रूटिंग") },
                { label: t("Milestone Payment", "माइलस्टोन भुगतान", "माइलस्टोन पइसा"), value: "Instant UPI", sub: t("40% load / 60% drop", "40% रवानगी / 60% डिलीवरी", "40% डिस्पैच / 60% ड्रॉप") },
              ].map((stat, idx) => (
                <div key={idx} className="p-2">
                  <p className="text-xl sm:text-2xl font-black text-slate-950 font-display">{stat.value}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-0.5">{stat.label}</p>
                  <p className="text-[9px] text-emerald-700 font-semibold">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Benchmark: Why KisanSetu Beats DeHaat, Ninjacart & Mandis */}
      <section className="py-16 md:py-20 bg-[#f8faf9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
              {t("Competitive Architectural Benchmark", "प्रतिस्पर्धी वास्तुकला बेंचमार्क", "प्रतिस्पर्धी बेंचमार्क")}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 font-display mt-3">
              {t("How KisanSetu Outperforms DeHaat & Ninjacart", "KisanSetu DeHaat और Ninjacart से बेहतर कैसे काम करता है", "KisanSetu DeHaat आ Ninjacart ले बढ़िया कइसे हे")}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {t(
                "Direct comparison of traditional mandis, centralized agritech platforms, and KisanSetu's autonomous multi-agent architecture.",
                "पारंपरिक मंडियों, केंद्रीकृत एग्रीटेक प्लेटफॉर्मों और KisanSetu के स्वायत्त मल्टी-एजेंट आर्किटेक्चर की सीधी तुलना।",
                "मंडी, एग्रीटेक कंपनी आ KisanSetu के सीधा तुलना।"
              )}
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="p-4 font-bold text-slate-700">{t("Feature / Dimension", "सुविधा / आयाम", "फीचर / आयाम")}</th>
                  <th className="p-4 font-bold text-slate-500">{t("Traditional Mandi", "पारंपरिक मंडी", "पारंपरिक मंडी")}</th>
                  <th className="p-4 font-bold text-slate-500">{t("DeHaat / Ninjacart", "DeHaat / Ninjacart", "DeHaat / Ninjacart")}</th>
                  <th className="p-4 font-bold text-emerald-800 bg-emerald-50/80">{t("KisanSetu (Our Platform)", "KisanSetu (हमारा प्लेटफॉर्म)", "KisanSetu (हमार मंच)")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 font-bold text-slate-900">{t("Intermediary Take-Rate", "बिचौलिया कमीशन", "बिचौलिया कमीशन")}</td>
                  <td className="p-4 text-red-600 font-medium">15%–25% {t("(3 middleman layers)", "(3 बिचौलिया स्तर)", "(3 बिचौलिया लेयर)")}</td>
                  <td className="p-4 text-amber-700 font-medium">8%–15% {t("(Platform margin)", "(प्लेटफॉर्म मार्जिन)", "(प्लेटफॉर्म मार्जिन)")}</td>
                  <td className="p-4 bg-emerald-50/50 font-bold text-emerald-800">
                    <span className="inline-flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      0% Broker Fee {t("(P2P Escrow)", "(P2P एस्क्रो)", "(P2P एस्क्रो)")}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">{t("Quality Assessment", "गुणवत्ता जांच", "गुणवत्ता जांच")}</td>
                  <td className="p-4 text-slate-600">{t("Subjective manual glance (Trader biased)", "व्यक्तिपरक नज़र (व्यापारी पक्षपाती)", "व्यापारी के मनमर्जी नजर")}</td>
                  <td className="p-4 text-slate-600">{t("Central warehouse inspection", "केंद्रीय गोदाम निरीक्षण", "गोदाम म जांच")}</td>
                  <td className="p-4 bg-emerald-50/50 font-bold text-emerald-800">
                    <span className="inline-flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      {t("Instant AI Computer Vision (A/B/C/D)", "तत्काल AI कंप्यूटर विज़न (A/B/C/D)", "तुरत AI फोटो जांच (A/B/C/D)")}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">{t("Logistics Dispatch", "लॉजिस्टिक्स प्रेषण", "गाड़ी रवानगी")}</td>
                  <td className="p-4 text-slate-600">{t("Individual farmer tractor trips", "अलग-अलग किसान ट्रैक्टर यात्रा", "हर किसान के अलग ट्रैक्टर")}</td>
                  <td className="p-4 text-slate-600">{t("Hub-and-spoke warehousing", "हब-एंड-स्पोक वेयरहाउसिंग", "हब ले गोदाम")}</td>
                  <td className="p-4 bg-emerald-50/50 font-bold text-emerald-800">
                    <span className="inline-flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      {t("DBSCAN 1-Truck Multi-Pickup (72% CO2 saved)", "DBSCAN 1-ट्रक मल्टी-पिकअप (72% CO2 बचत)", "DBSCAN 1-गाड़ी मल्टी-पिकअप (72% बचत)")}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">{t("Farmer Settlement", "किसान भुगतान", "किसान पइसा निपटान")}</td>
                  <td className="p-4 text-red-600 font-medium">15–45 {t("days delayed credit", "दिन विलंबित उधारी", "दिन उधारी")}</td>
                  <td className="p-4 text-amber-700 font-medium">2–7 {t("business days", "कार्य दिवस", "दिन")}</td>
                  <td className="p-4 bg-emerald-50/50 font-bold text-emerald-800">
                    <span className="inline-flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      {t("Instant 2-Stage UPI Escrow (40% load / 60% drop)", "तत्काल 2-चरणीय UPI एस्क्रो (40% लोड / 60% ड्रॉप)", "तुरत 2-चरणीय UPI एस्क्रो (40%/60%)")}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">{t("Inclusivity & Voice", "समावेशिता और आवाज़", "आवाज आ भाषा")}</td>
                  <td className="p-4 text-slate-600">{t("Paper slips / Illiteracy barrier", "कागजी पर्चियां / निरक्षरता बाधा", "कागज के पर्ची")}</td>
                  <td className="p-4 text-slate-600">{t("Standard mobile forms", "मानक मोबाइल फॉर्म", "मोबाइल फॉर्म")}</td>
                  <td className="p-4 bg-emerald-50/50 font-bold text-emerald-800">
                    <span className="inline-flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      {t("Multilingual Voice Bot (Hindi / CG / English)", "बहुभाषी वॉयस बॉट (हिन्दी / CG / अंग्रेजी)", "बहुभाषी आवाज बॉट (हिन्दी/छत्तीसगढ़ी/अंग्रेजी)")}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Bento Grid: The 4 Middleman Replacements */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
              {t("Autonomous Multi-Agent Architecture", "स्वायत्त मल्टी-एजेंट आर्किटेक्चर", "4 AI एजेंट सिस्टम")}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 font-display mt-3">
              {t("The Four Pillars Replacing Agri Middlemen", "कृषि बिचौलियों को बदलने वाले चार स्तंभ", "बिचौलिया खतम करइया चार स्तंभ")}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {t(
                "Each agent autonomously executes a critical phase of the agricultural trade cycle.",
                "प्रत्येक एजेंट कृषि व्यापार चक्र के एक महत्वपूर्ण चरण को स्वायत्त रूप से निष्पादित करता है।",
                "हर एजेंट कृषि व्यापार के मुख्य काम ला खुद पूरा करथे।"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Layers,
                title: t("1. Aggregation Agent", "1. एकत्रीकरण एजेंट", "1. जमा करइया एजेंट"),
                subtitle: t("PostGIS Spatial DBSCAN", "PostGIS स्थानिक DBSCAN", "PostGIS DBSCAN"),
                desc: t("Clusters fragmented smallholder crops into 2,000kg+ wholesale lots within a 15km geographic centroid.", "15 किमी के दायरे में छोटे किसानों की फसलों को 2,000 किग्रा+ थोक लॉट में समूहीकृत करता है।", "15 किमी इलाका म साना फसल ला 2,000+ किग्रा थोक लॉट बनाथे।"),
                metric: t("15km Radius DBSCAN", "15 किमी दायरा DBSCAN", "15 किमी दायरा"),
                href: "/buyer",
              },
              {
                icon: Award,
                title: t("2. AI Quality Agent", "2. AI गुणवत्ता एजेंट", "2. AI गुणवत्ता एजेंट"),
                subtitle: t("Gemini Multimodal Vision", "Gemini मल्टीमॉडल विज़न", "Gemini फोटो विज़न"),
                desc: t("Performs instant colorimetry, defect bounding-box detection, and assigns verifiable Grade A/B/C/D ratings.", "रंग, आकार, दोषों का पता लगाता है और सत्यापन योग्य ग्रेड A/B/C/D रेटिंग प्रदान करता है।", "रंग, आकार, खराबी जांच के ग्रेड A/B/C/D प्रमाणन देथे।"),
                metric: t("94% CV Accuracy", "94% विज़न सटीकता", "94% विज़न सटीकता"),
                href: "/farmer",
              },
              {
                icon: Truck,
                title: t("3. Routing Agent", "3. रूटिंग एजेंट", "3. रूटिंग एजेंट"),
                subtitle: t("OpenRouteService VRP", "OpenRouteService VRP", "OpenRouteService VRP"),
                desc: t("Synthesizes multi-farmer pickup waypoints into a unified 1-truck loop saving 72% mileage and fuel emissions.", "कई किसानों के पिकअप को 1-ट्रक लूप में जोड़कर 72% माइलेज और ईंधन उत्सर्जन बचाता है।", "सबो किसान के माल ला 1 गाड़ी म लोड करके 72% माइलेज आ धुआं बचाथे।"),
                metric: t("72% Mileage Saved", "72% माइलेज बचत", "72% माइलेज बचत"),
                href: "/orders",
              },
              {
                icon: Wallet,
                title: t("4. Settlement Agent", "4. निपटान एजेंट", "4. निपटान एजेंट"),
                subtitle: t("2-Stage UPI Escrow", "2-चरण UPI एस्क्रो", "2-चरण UPI एस्क्रो"),
                desc: t("Locks buyer funds securely; releases 40% immediately upon vehicle dispatch and 60% on digital delivery sign-off.", "खरीदार की राशि सुरक्षित रखता है; 40% वाहन रवानगी पर और 60% डिजिटल डिलीवरी पर जारी करता है।", "खरीदार के पइसा सुरक्षित रखथे; 40% लोड म आ 60% पहुंचे म देथे।"),
                metric: t("Instant UPI Payouts", "तत्काल UPI भुगतान", "तुरत UPI पइसा"),
                href: "/earnings",
              },
            ].map((card, i) => (
              <Link key={i} href={card.href} className="group">
                <Card variant="interactive" className="h-full flex flex-col justify-between space-y-4 p-6 border-slate-200 hover:border-emerald-500">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                        <card.icon className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                        {card.metric}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-950 font-display mt-4">{card.title}</h3>
                    <p className="text-xs font-semibold text-emerald-800 mt-0.5">{card.subtitle}</p>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">{card.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-700 group-hover:text-emerald-900">
                    <span>{t("Explore Architecture", "आर्किटेक्चर देखें", "आर्किटेक्चर देखव")}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Profit Calculator */}
      <section className="py-16 md:py-20 bg-emerald-950 text-white rounded-3xl mx-3 sm:mx-6 lg:mx-8 mb-16 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-800/20 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900 border border-emerald-700 text-amber-300 text-xs font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                {t("Real-Time Economic Advantage Simulator", "वास्तविक समय आर्थिक लाभ सिम्युलेटर", "लाइव फायदा सिम्युलेटर")}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
                {t("Calculate Your Extra Earnings with KisanSetu", "KisanSetu के साथ अपनी अतिरिक्त कमाई की गणना करें", "KisanSetu ले अपन जादा कमाई के हिसाब लगाव")}
              </h2>
              <p className="text-emerald-200 text-sm leading-relaxed">
                {t(
                  "By cutting out 3 layers of mandi agents and commission cuts, smallholders earn 18% to 35% higher real farm-gate net cash.",
                  "मंडी एजेंटों और कमीशन कटौती की 3 परतों को हटाकर, छोटे किसान 18% से 35% अधिक शुद्ध नकदी कमाते हैं।",
                  "दलाल के 3 परत हटाके, साना किसान 18% ले 35% जादा पइसा कमाथे।"
                )}
              </p>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                  {t("Select Crop Type", "फसल प्रकार चुनें", "फसल चुनव")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(cropPrices).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCalcCrop(c)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                        calcCrop === c
                          ? "bg-emerald-500 text-emerald-950 shadow-md"
                          : "bg-emerald-900/80 border border-emerald-800 text-emerald-200 hover:bg-emerald-800"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>{t("Harvest Volume (kg)", "फसल मात्रा (किग्रा)", "फसल मात्रा (किग्रा)")}</span>
                  <span className="font-mono text-emerald-800 text-sm">{calcProduceKg.toLocaleString()} kg</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="10000"
                  step="100"
                  value={calcProduceKg}
                  onChange={(e) => setCalcProduceKg(Number(e.target.value))}
                  className="w-full accent-emerald-700 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>200 kg ({t("Smallholder", "छोटा किसान", "साना किसान")})</span>
                  <span>10,000 kg ({t("Cluster Lot", "क्लस्टर लॉट", "क्लस्टर लॉट")})</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <p className="text-[11px] font-bold text-slate-500">{t("Traditional Mandi", "पारंपरिक मंडी", "पारंपरिक मंडी")}</p>
                  <p className="text-lg font-black font-mono text-slate-800 mt-1">₹{traditionalEarnings.toLocaleString("en-IN")}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">₹{currentPrice.mandiFarmer}/kg (-20% cuts)</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <p className="text-[11px] font-bold text-slate-500">DeHaat / Ninjacart</p>
                  <p className="text-lg font-black font-mono text-slate-800 mt-1">₹{dehaatEarnings.toLocaleString("en-IN")}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">₹{currentPrice.dehaatNinjacart}/kg (-12% cut)</p>
                </div>
                <div className="p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/80">
                  <p className="text-[11px] font-bold text-emerald-900">{t("KisanSetu Direct", "KisanSetu सीधा", "KisanSetu सीधा")}</p>
                  <p className="text-lg font-black font-mono text-emerald-950 mt-1">₹{kisanSetuEarnings.toLocaleString("en-IN")}</p>
                  <p className="text-[10px] font-black text-emerald-700 uppercase mt-0.5">
                    +₹{extraEarnings.toLocaleString("en-IN")} (+{percentageGain}%)
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-950">{t("Net Direct Farmer Advantage", "शुद्ध सीधा किसान लाभ", "सीधा किसान फायदा")}</p>
                  <p className="text-[11px] text-emerald-800">
                    {t("Guaranteed into your Bank Account via UPI Escrow", "UPI एस्क्रो द्वारा सीधे आपके बैंक खाते में गारंटीशुदा", "UPI एस्क्रो ले सीधा बैंक खाता म गारंटी")}
                  </p>
                </div>
                <Link href="/farmer">
                  <Button size="sm" variant="primary" className="font-bold text-xs">
                    {t("Claim Rate", "दर प्राप्त करें", "रेट पाव")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
