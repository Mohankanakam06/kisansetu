"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  CheckCircle2,
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
  ChevronRight,
  PhoneCall,
  Clock,
  CircleDot,
  FileCheck,
} from "lucide-react";
import { Button, Card, Badge, cn } from "@/components/ui";
import { useLanguage } from "@/lib/language";
import ProfitImpactSimulator from "@/components/simulator/ProfitImpactSimulator";

export default function Home() {
  const { t } = useLanguage();

  const demoPresets = [
    {
      id: "lot-101",
      name: "Raipur Tomato Cluster",
      crop: "Desi Tomato",
      qty: "2,400 kg",
      price: "₹22.00/kg",
      mandiRef: "₹16.00/kg",
      farmers: 4,
      grade: "Grade A (94%)",
      hub: "Raipur Collection Hub, CG",
      badge: "High Demand",
    },
    {
      id: "lot-102",
      name: "Nashik Red Onion Cluster",
      crop: "Red Onion",
      qty: "4,500 kg",
      price: "₹28.00/kg",
      mandiRef: "₹20.00/kg",
      farmers: 6,
      grade: "Grade A (92%)",
      hub: "Lasalgaon Yard, MH",
      badge: "1-Truck Ready",
    },
    {
      id: "lot-103",
      name: "Durg Potato Cluster",
      crop: "Chandramukhi Potato",
      qty: "3,200 kg",
      price: "₹18.00/kg",
      mandiRef: "₹12.50/kg",
      farmers: 3,
      grade: "Grade B (88%)",
      hub: "Bhilai Rural Collection Center, CG",
      badge: "Fresh Harvest",
    },
    {
      id: "lot-104",
      name: "Tilda Green Chilli",
      crop: "G4 Green Chilli",
      qty: "1,100 kg",
      price: "₹65.00/kg",
      mandiRef: "₹48.00/kg",
      farmers: 2,
      grade: "Grade A (96%)",
      hub: "Tilda Yard, CG",
      badge: "Premium Export",
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC]">
      {/* Hero Section: Asymmetric Split Hero with Live Mandi Trading Terminal */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/90 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Core Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900 shadow-2xs">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <span>Smart India Hackathon 2026 · Problem Statement 26033</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 font-display leading-[1.15]">
                {t(
                  "Direct Agri Marketplace Connecting Farmers to Wholesale Buyers.",
                  "किसानों को थोक खरीदारों से सीधे जोड़ने वाला कृषि बाज़ार।",
                  "किसान ला थोक खरीदार ले सीधा जोड़े वाला कृषि बाज़ार।"
                )}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                {t(
                  "KisanSetu groups local farm harvests into wholesale lots, provides instant quality grading from photos, optimizes 1-truck pickup routes, and ensures secure 2-stage UPI payment protection.",
                  "KisanSetu स्थानीय किसानों की फसल को थोक लॉट में जोड़ता है, फोटो से तुरंत गुणवत्ता जांच करता है, 1-ट्रक पिकअप को अनुकूलित करता है, और सुरक्षित 2-चरणीय UPI भुगतान सुनिश्चित करता है।",
                  "KisanSetu लोकल किसान के फसल ला थोक लॉट म ज़ोरथे, मोबाइल फोटो ले गुणवत्ता जांच करथे, 1-गाड़ी पिकअप रस्ता बनाथे आ सुरक्षित 2-चरण UPI पईसा ट्रांसफर पक्का करथे।"
                )}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link href="/farmer" className="sm:w-auto">
                  <Button size="lg" variant="primary" className="w-full sm:w-auto px-6 py-3 text-sm font-bold bg-emerald-800 hover:bg-emerald-900 text-white flex items-center justify-center gap-2 shadow-xs min-h-[48px]">
                    <Mic className="h-4 w-4" />
                    {t("Sell Produce", "फसल दर्ज करें", "फसल दर्ज करव")}
                  </Button>
                </Link>
                <Link href="/buyer" className="sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto px-6 py-3 text-sm font-bold bg-white border-slate-300 text-slate-800 hover:bg-slate-50 flex items-center justify-center gap-2 shadow-xs min-h-[48px]">
                    <Store className="h-4 w-4 text-emerald-800" />
                    {t("Explore Wholesale Lots", "थोक लॉट बाजार देखें", "थोक लॉट बाजार देखव")}
                  </Button>
                </Link>
              </div>

              {/* Key Trust Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xl font-black text-slate-900 font-display tabular-nums">0%</p>
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight mt-0.5">Broker Fee</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">vs 15-25% Mandi</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xl font-black text-emerald-800 font-display tabular-nums">+18%–35%</p>
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight mt-0.5">Farmer Income</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">Direct bank transfer</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xl font-black text-slate-900 font-display tabular-nums">72%</p>
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight mt-0.5">Logistics Saved</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">Single truck pickup</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xl font-black text-slate-900 font-display tabular-nums">Instant</p>
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight mt-0.5">Payment Protection</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">40% load / 60% drop</p>
                </div>
              </div>
            </div>

            {/* Right Column: Live Trading Terminal Card */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-slate-300 bg-white shadow-card overflow-hidden">
                {/* Terminal Header */}
                <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Live Mandi Aggregation Feed
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                    DBSCAN ACTIVE
                  </span>
                </div>

                {/* Terminal Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                    <span className="font-bold text-slate-700">Verified Aggregated Batches</span>
                    <span className="text-[11px] text-slate-500 font-medium">Auto-updated 2m ago</span>
                  </div>

                  <div className="space-y-2.5">
                    {demoPresets.slice(0, 3).map((item) => (
                      <Link
                        key={item.id}
                        href={`/buyer/${item.id}`}
                        className="block p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-300 transition-colors group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 font-display">
                                {item.name}
                              </span>
                              <span className="text-[10px] font-bold bg-white text-emerald-800 px-1.5 py-0.5 rounded border border-slate-200">
                                {item.grade}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              <span>{item.hub}</span>
                              <span>•</span>
                              <span>{item.farmers} Farmers Pooled</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-emerald-800 tabular-nums font-display">
                              {item.price}
                            </span>
                            <span className="block text-[10px] text-slate-500 font-medium line-through">
                              Mandi: {item.mandiRef}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-700 tabular-nums">Volume: {item.qty}</span>
                          <span className="font-bold text-emerald-800 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            Inspect Lot <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link href="/buyer" className="w-full block">
                      <Button variant="outline" size="sm" className="w-full justify-center text-xs font-bold border-slate-300 text-slate-800 hover:bg-slate-100">
                        View All 14 Active Mandi Lots ({t("Live", "लाइव", "लाइव")})
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick SIH Judge Live Demo Clusters */}
      <section className="py-6 bg-emerald-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  SIH Evaluation Presets
                </p>
                <p className="text-sm font-bold text-white font-display">
                  One-Click Access to Live Clustered Demonstrations
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {demoPresets.map((preset) => (
                <Link
                  key={preset.id}
                  href={`/buyer/${preset.id}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-800/90 hover:bg-emerald-750 text-white text-xs font-semibold border border-emerald-700/80 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <CircleDot className="h-3 w-3 text-emerald-300" />
                  <span>{preset.crop} ({preset.qty})</span>
                  <span className="text-[10px] text-emerald-200 font-bold">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Benchmark: Why KisanSetu Beats Mandis & Intermediaries */}
      <section id="how-it-works" className="py-14 lg:py-18 bg-[#F8FAFC] scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
              {t("Architectural Verification", "वास्तुकला सत्यापन", "आर्किटेक्चर सत्यापन")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              {t("Direct Comparison with Mandis & Centralized AgriTech", "पारंपरिक मंडियों एवं केंद्रीकृत एग्रीटेक से तुलना", "मंडी आ एग्रीटेक ले तुलना")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {t(
                "How KisanSetu removes middleman markups while ensuring zero-delay UPI milestone settlement.",
                "KisanSetu कैसे बिचौलियों के कमीशन को हटाकर त्वरित UPI भुगतान सुनिश्चित करता है।",
                "KisanSetu कइसे बिचौलिया के कमीशन हटा के तुरत UPI पइसा देथे।"
              )}
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-card">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-4 font-bold text-slate-800 uppercase text-[11px] tracking-wider">{t("Trade Dimension", "व्यापार आयाम", "व्यापार आयाम")}</th>
                  <th className="p-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider">{t("Traditional Mandi (APMC)", "पारंपरिक मंडी", "पारंपरिक मंडी")}</th>
                  <th className="p-4 font-bold text-slate-600 uppercase text-[11px] tracking-wider">{t("Centralized Agritech", "केंद्रीकृत एग्रीटेक", "एग्रीटेक कंपनी")}</th>
                  <th className="p-4 font-bold text-emerald-900 bg-emerald-50/80 uppercase text-[11px] tracking-wider border-l border-emerald-200">{t("KisanSetu Direct Platform", "KisanSetu डायरेक्ट", "KisanSetu")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="p-4 font-bold text-slate-900">{t("Intermediary Commission", "बिचौलिया कमीशन", "बिचौलिया कमीशन")}</td>
                  <td className="p-4 text-rose-700 font-semibold">15%–25% (Arhatiya + Traders)</td>
                  <td className="p-4 text-amber-800 font-semibold">8%–15% Platform Take-Rate</td>
                  <td className="p-4 bg-emerald-50/50 font-bold text-emerald-900 border-l border-emerald-200">
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                      0% Broker Cut (Protected Direct Settlement)
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">{t("Quality Grading & Certification", "गुणवत्ता जांच एवं ग्रेडिंग", "क्वालिटी जांच")}</td>
                  <td className="p-4 text-slate-600">Subjective visual glance by trader</td>
                  <td className="p-4 text-slate-600">Central warehouse manual grading</td>
                  <td className="p-4 bg-emerald-50/50 font-bold text-emerald-900 border-l border-emerald-200">
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                      Instant Quality Assessment (Grade A/B/C/D)
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">{t("Logistics Consolidation", "लॉजिस्टिक्स एकत्रीकरण", "गाड़ी एकत्रीकरण")}</td>
                  <td className="p-4 text-slate-600">Each farmer hires separate tractor</td>
                  <td className="p-4 text-slate-600">Central collection center haulage</td>
                  <td className="p-4 bg-emerald-50/50 font-bold text-emerald-900 border-l border-emerald-200">
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                      Consolidated 1-Truck Multi-Pickup
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">{t("Payment & Settlement Release", "सुरक्षित भुगतान एवं निपटान", "पइसा भुगतान")}</td>
                  <td className="p-4 text-rose-700 font-semibold">15–45 days delayed credit</td>
                  <td className="p-4 text-amber-800 font-semibold">3–7 banking days</td>
                  <td className="p-4 bg-emerald-50/50 font-bold text-emerald-900 border-l border-emerald-200">
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                      Instant 2-Stage UPI (40% load / 60% delivery)
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-slate-900">{t("Voice & Multilingual Accessibility", "आवाज़ एवं बहुभाषी सुविधा", "आवाज आ भाषा")}</td>
                  <td className="p-4 text-slate-600">Physical attendance required</td>
                  <td className="p-4 text-slate-600">Complex app forms only</td>
                  <td className="p-4 bg-emerald-50/50 font-bold text-emerald-900 border-l border-emerald-200">
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                      Voice Assistant (Hindi, CG, English)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* The 4 Autonomous AI Agent Pillars */}
      <section id="features" className="py-14 lg:py-18 bg-white border-y border-slate-200/90 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
              {t("Autonomous Multi-Agent Architecture", "स्वायत्त मल्टी-एजेंट प्रणाली", "4 AI एजेंट सिस्टम")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              {t("Four Specialized AI Agents Running the Entire Lifecycle", "चार विशिष्ट AI एजेंट जो संपूर्ण व्यापार चक्र संचालित करते हैं", "चार AI एजेंट जे सब काम पूरा करथे")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {t(
                "Each agent is purpose-built to solve a core bottleneck in Indian agricultural supply chains.",
                "प्रत्येक एजेंट भारतीय कृषि आपूर्ति श्रृंखला की मुख्य बाधा को हल करने के लिए बनाया गया है।",
                "हर एजेंट कृषि मंडी के समस्या ला हल करथे।"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Layers,
                number: "01",
                title: t("Spatial Aggregation Agent", "1. स्थानिक एकत्रीकरण एजेंट", "1. जमा करइया एजेंट"),
                subtitle: "PostGIS + DBSCAN",
                desc: t("Clusters smallholder harvests within a 15km local radius into 2,000kg+ wholesale lots.", "15 किमी के दायरे में छोटे किसानों की फसलों को 2,000 किग्रा+ थोक लॉट में समूहीकृत करता है।", "15 किमी इलाका म साना फसल ला 2,000+ किग्रा थोक लॉट बनाथे।"),
                metric: "15km Radius DBSCAN",
                href: "/buyer",
              },
              {
                icon: Award,
                number: "02",
                title: t("Computer Vision Quality Agent", "2. कंप्यूटर विज़न गुणवत्ता एजेंट", "2. AI क्वालिटी एजेंट"),
                subtitle: "Gemini Multimodal CV",
                desc: t("Analyzes surface defects, colorimetry, and assigns verifiable Grade A/B/C/D quality certificates.", "रंग, आकार, दोषों का पता लगाता है और सत्यापन योग्य ग्रेड A/B/C/D रेटिंग प्रदान करता है।", "रंग, आकार, खराबी जांच के ग्रेड A/B/C/D प्रमाणन देथे।"),
                metric: "94% Model Accuracy",
                href: "/farmer",
              },
              {
                icon: Truck,
                number: "03",
                title: t("Smart Routing Agent", "3. स्मार्ट रूटिंग एजेंट", "3. गाड़ी रूटिंग एजेंट"),
                subtitle: "OpenRouteService VRP",
                desc: t("Consolidates multi-farm pickup waypoints into an optimal 1-truck single loop saving 72% mileage.", "कई किसानों के पिकअप को 1-ट्रक लूप में जोड़कर 72% माइलेज और ईंधन उत्सर्जन बचाता है।", "सबो किसान के माल ला 1 गाड़ी म लोड करके 72% माइलेज बचाथे।"),
                metric: "72% Mileage Saved",
                href: "/orders",
              },
              {
                icon: Wallet,
                number: "04",
                title: t("Two-Stage Payment Agent", "4. दो-चरणीय सुरक्षित भुगतान एजेंट", "4. सुरक्षित भुगतान एजेंट"),
                subtitle: "Automated UPI Milestones",
                desc: t("Safeguards buyer payment; automatically releases 40% on dispatch and 60% on OTP-verified delivery.", "खरीदार की राशि सुरक्षित रखता है; 40% वाहन रवानगी पर और 60% डिजिटल डिलीवरी पर जारी करता है।", "खरीदार के पइसा सुरक्षित रखथे; 40% लोड म आ 60% पहुंचे म देथे।"),
                metric: "Zero Payment Delay",
                href: "/earnings",
              },
            ].map((card, i) => (
              <Link key={i} href={card.href} className="group">
                <Card variant="default" className="h-full flex flex-col justify-between p-5 border-slate-200 hover:border-emerald-500 hover:shadow-card-hover transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold border border-emerald-200 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                        <card.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        {card.number}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-display group-hover:text-emerald-900 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-[11px] font-bold text-emerald-700">{card.subtitle}</p>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {card.metric}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      View Demo <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Econometric Simulator Section */}
      <section id="savings" className="py-14 lg:py-18 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 scroll-mt-16 w-full">
        <ProfitImpactSimulator />
      </section>
    </div>
  );
}
