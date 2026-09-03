"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Network,
  BadgeCheck,
  Truck,
  Wallet,
  Sparkles,
  MapPin,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  Mic,
  Volume2,
  Zap,
  Leaf,
  Layers,
  Award,
  ChevronRight,
  Sliders,
} from "lucide-react";
import { Button, Badge, Card } from "@/components/ui";

const howItWorks = [
  {
    step: "01",
    icon: Network,
    title: "Spatial Lot Aggregation",
    tagline: "PostGIS Geo-Clustering",
    desc: "Autonomous agent clusters micro-harvests (100–500 kg) into buyer-ready wholesale lots (2,000+ kg), overcoming smallholder volume barriers.",
    href: "/farmer",
    color: "from-emerald-600 to-teal-700",
    pill: "Replaces Middleman Aggregator",
  },
  {
    step: "02",
    icon: BadgeCheck,
    title: "AI Computer Vision Grading",
    tagline: "Standardized Grade A/B/C",
    desc: "Deep vision models inspect skin texture, diameter (55-65mm), color uniformity, and fungal defects within seconds to eliminate subjective mandi deductions.",
    href: "/farmer",
    color: "from-blue-600 to-indigo-700",
    pill: "Replaces Arbitrary Quality Cuts",
  },
  {
    step: "03",
    icon: Truck,
    title: "Dynamic Consolidated Routing",
    tagline: "Multi-Stop Milk-Run",
    desc: "Logistics agent computes shortest multi-pickup route from farm gates directly to distribution centers, saving 68% travel distance and fuel.",
    href: "/orders",
    color: "from-amber-600 to-orange-700",
    pill: "Cuts Transport Overhead",
  },
  {
    step: "04",
    icon: Wallet,
    title: "2-Stage Milestone Escrow",
    tagline: "Instant UPI Payouts",
    desc: "Smart escrow triggers 40% payment on farm pickup and remaining 60% upon delivery confirmation, eliminating traditional 30-day cheque delays.",
    href: "/earnings",
    color: "from-emerald-700 to-green-800",
    pill: "Guarantees Zero Default Risk",
  },
];

const POPULAR_CROPS = [
  { name: "Tomato", icon: "🍅", count: "2,400 kg", mandi: "₹24/kg", direct: "₹22/kg", trend: "+11.6%" },
  { name: "Onion", icon: "🧅", count: "4,500 kg", mandi: "₹28/kg", direct: "₹27/kg", trend: "+3.7%" },
  { name: "Potato", icon: "🥔", count: "3,200 kg", mandi: "₹18/kg", direct: "₹17.5/kg", trend: "-2.7%" },
  { name: "Chilli", icon: "🌶️", count: "1,100 kg", mandi: "₹65/kg", direct: "₹62/kg", trend: "+6.5%" },
  { name: "Wheat", icon: "🌾", count: "5,000 kg", mandi: "₹24.5/kg", direct: "₹23.5/kg", trend: "+3.3%" },
  { name: "Soybean", icon: "🫘", count: "3,800 kg", mandi: "₹44/kg", direct: "₹42/kg", trend: "+3.5%" },
];

export default function Home() {
  const [calcProduceKg, setCalcProduceKg] = useState(1500);
  const [calcCrop, setCalcCrop] = useState("Tomato");

  // Dynamic profit calculation
  const cropPrices: Record<string, { mandiFarmer: number; directFarmer: number }> = {
    Tomato: { mandiFarmer: 16, directFarmer: 22 },
    Onion: { mandiFarmer: 20, directFarmer: 28 },
    Potato: { mandiFarmer: 12, directFarmer: 18 },
    Chilli: { mandiFarmer: 48, directFarmer: 65 },
    Wheat: { mandiFarmer: 19, directFarmer: 24 },
  };

  const currentPrice = cropPrices[calcCrop] || cropPrices.Tomato;
  const traditionalEarnings = calcProduceKg * currentPrice.mandiFarmer;
  const kisanSetuEarnings = calcProduceKg * currentPrice.directFarmer;
  const extraEarnings = kisanSetuEarnings - traditionalEarnings;
  const percentageGain = Math.round((extraEarnings / traditionalEarnings) * 100);

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white py-16 md:py-24 border-b border-emerald-800/40">
        {/* Ambient decorative lighting */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-800/40 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-emerald-300 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>SIH 2026 PS 26033 &middot; Direct-to-Market Agri OS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] font-display">
                Eliminate Middlemen.
                <br />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">
                  Automate the Value Chain.
                </span>
              </h1>

              <p className="max-w-2xl text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal">
                KisanSetu replaces traditional mandi intermediaries with 4 coordinated AI agents:
                <strong className="text-white font-semibold"> Spatial Lot Aggregation</strong>,
                <strong className="text-white font-semibold"> Vision Quality Grading</strong>,
                <strong className="text-white font-semibold"> Consolidated Routing</strong>, and
                <strong className="text-white font-semibold"> 2-Stage UPI Milestone Escrow</strong>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/farmer">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black shadow-lg shadow-amber-900/30 text-base"
                  >
                    <Mic className="h-5 w-5 mr-1.5 text-slate-950" />
                    List Harvest (Voice / Form)
                  </Button>
                </Link>
                <Link href="/buyer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-emerald-400/50 bg-emerald-900/30 text-emerald-100 hover:bg-emerald-800/50 hover:text-white backdrop-blur-sm font-bold text-base"
                  >
                    Browse Wholesale Lots
                    <ArrowRight className="h-4 w-4 ml-1.5 text-emerald-300" />
                  </Button>
                </Link>
              </div>

              {/* Live Aggregated Harvest Ticker Chips */}
              <div className="pt-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <span>Live Clustered Lots Ready for Dispatch</span>
                  <span className="text-[11px] text-emerald-300/80 font-normal">Auto-aggregated by PostGIS</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CROPS.map((crop) => (
                    <Link
                      key={crop.name}
                      href="/buyer"
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-700/50 bg-emerald-900/50 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-emerald-100 transition-all hover:bg-emerald-800 hover:border-emerald-400 active:scale-95"
                    >
                      <span className="text-base">{crop.icon}</span>
                      <span>{crop.name}</span>
                      <span className="text-emerald-300 font-bold">({crop.count})</span>
                      <span className="text-[10px] rounded bg-emerald-800/80 px-1 py-0.2 text-emerald-300">
                        {crop.direct}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Interactive AI Agent Architecture Showcase */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-emerald-700/60 bg-emerald-900/60 backdrop-blur-xl p-6 shadow-2xl shadow-emerald-950/60 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                      Live AI Agent Pipeline
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-800 px-2.5 py-0.5 text-[11px] font-mono font-bold text-emerald-200 border border-emerald-700">
                    ID: LOT-101 (Active)
                  </span>
                </div>

                {/* Card 1: Aggregation Pool */}
                <div className="rounded-2xl border border-emerald-800 bg-emerald-950/70 p-4 space-y-2 hover:border-emerald-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl">
                        🍅
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Tomato Aggregation Cluster</p>
                        <p className="text-xs text-emerald-300">Dharsiwa Center · 4 Farmers Merged</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-amber-400">2,400 kg</p>
                      <p className="text-[11px] text-emerald-300">₹22 / kg direct</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex -space-x-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-bold text-white ring-2 ring-emerald-950">RS</span>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-700 text-[10px] font-bold text-white ring-2 ring-emerald-950">DV</span>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-700 text-[10px] font-bold text-white ring-2 ring-emerald-950">LP</span>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-white ring-2 ring-emerald-950">+1</span>
                    </div>
                    <span className="text-[11px] text-emerald-300/90 font-medium">4 smallholders combined into bulk buyer lot</span>
                  </div>
                </div>

                {/* Card 2: AI Vision Grading */}
                <div className="rounded-2xl border border-emerald-800 bg-emerald-950/70 p-4 space-y-2.5 hover:border-emerald-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <BadgeCheck className="h-5 w-5 text-emerald-400" />
                      <div>
                        <p className="text-sm font-bold text-white">AI Vision Grading</p>
                        <p className="text-xs text-emerald-300">Gemini Vision 2.0 Rubric</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-400/30">
                      Grade A (96% Match)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-200 bg-emerald-900/60 p-2 rounded-xl border border-emerald-800/80">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Uniform 55-65mm diameter &middot; 0% fungal defects &middot; Firm</span>
                  </div>
                </div>

                {/* Card 3: Logistics & UPI Payout */}
                <div className="rounded-2xl border border-emerald-800 bg-emerald-950/70 p-4 space-y-2.5 hover:border-emerald-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Truck className="h-5 w-5 text-amber-400" />
                      <div>
                        <p className="text-sm font-bold text-white">Consolidated Pickup</p>
                        <p className="text-xs text-emerald-300">4 stops → Mowa Cold Mandi Hub</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-900/80 px-2 py-0.5 rounded-md">
                      🌱 -18.2 kg CO₂
                    </span>
                  </div>
                  <div className="border-t border-emerald-800/80 pt-2 flex items-center justify-between text-xs">
                    <span className="text-emerald-300 font-medium">UPI 2-Stage Escrow:</span>
                    <span className="font-extrabold text-amber-300">₹52,800 Disbursed to 4 Farmers</span>
                  </div>
                </div>

                <Link
                  href="/orders"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition-all shadow-md active:scale-95"
                >
                  <Zap className="h-4 w-4 text-amber-300" />
                  Live Demo: Track Active Route &amp; UPI Settlement &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Agent Pillars (Middlemen Replacement Grid) */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="rounded-full bg-emerald-100 text-emerald-900 px-3.5 py-1 text-xs font-bold uppercase tracking-wider border border-emerald-300">
              The 4 Core AI Agents
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
              Replacing What Middlemen Actually Do
            </h2>
            <p className="text-base text-slate-600">
              Rather than just a basic listing board, KisanSetu automates the four economic functions of agricultural intermediaries through autonomous agents.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {howItWorks.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-emerald-500 hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr ${item.color} text-white shadow-md`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <span className="text-3xl font-black text-slate-200 font-display">
                        {item.step}
                      </span>
                    </div>

                    <div className="mt-6 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                        {item.tagline}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 font-display">
                        {item.title}
                      </h3>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-slate-600 font-normal">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
                    <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                      {item.pill}
                    </span>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 group-hover:text-emerald-600 transition-colors"
                    >
                      <span>Try this agent live</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Farmer Profit Calculator & Mandi Comparison */}
      <section className="py-16 md:py-24 bg-slate-100 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Profit Calculator */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="rounded-full bg-emerald-100 text-emerald-900 px-3 py-1 text-xs font-bold uppercase tracking-wider border border-emerald-300">
                  Interactive Mandi Calculator
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">
                  See the Real Earnings Difference
                </h2>
                <p className="text-sm text-slate-600">
                  Compare traditional commission agent payouts with KisanSetu direct pool aggregation for your harvest volume.
                </p>
              </div>

              {/* Crop Picker buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Crop</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(cropPrices).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCalcCrop(c)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        calcCrop === c
                          ? "bg-emerald-800 text-white shadow-md shadow-emerald-950/20"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Slider */}
              <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Harvest Quantity (kg)</span>
                  <span className="text-base font-black text-emerald-900 font-mono">{calcProduceKg.toLocaleString()} kg</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="10000"
                  step="100"
                  value={calcProduceKg}
                  onChange={(e) => setCalcProduceKg(Number(e.target.value))}
                  className="w-full accent-emerald-800 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                  <span>200 kg (Smallholder)</span>
                  <span>5,000 kg</span>
                  <span>10,000 kg (Bulk Harvest)</span>
                </div>
              </div>

              {/* Comparison Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 space-y-1">
                  <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Traditional Mandi</p>
                  <p className="text-2xl font-black text-slate-800 font-display">
                    ₹{traditionalEarnings.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-red-700 font-medium">After 30% middleman cut &amp; transit loss</p>
                </div>

                <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 space-y-1 shadow-sm">
                  <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">KisanSetu Direct</p>
                  <p className="text-2xl font-black text-emerald-900 font-display">
                    ₹{kisanSetuEarnings.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-bold">
                    +₹{extraEarnings.toLocaleString("en-IN")} (+{percentageGain}%) extra payout
                  </p>
                </div>
              </div>
            </div>

            {/* Right: SIH Value Comparison Matrix */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-card space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display">
                      Why Direct Aggregation Wins
                    </h3>
                    <p className="text-xs text-slate-500">
                      Measurable impact on farmer livelihoods and buyer efficiency
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      label: "Price Realization",
                      mandi: "Farmer receives ~₹16/kg on tomato",
                      kisan: "Farmer receives ₹22/kg (+37% higher)",
                    },
                    {
                      label: "Payment Timing",
                      mandi: "15 to 45 days delayed cheque/slips",
                      kisan: "Instant 2-stage UPI (40% pickup / 60% delivery)",
                    },
                    {
                      label: "Quality Evaluation",
                      mandi: "Subjective deductions by commission agents",
                      kisan: "Objective AI vision rubric with Grade A/B/C certification",
                    },
                    {
                      label: "Logistics Optimization",
                      mandi: "Individual tractors travelling independently",
                      kisan: "Dynamic consolidated multi-stop route (-68% fuel)",
                    },
                  ].map((row, i) => (
                    <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs space-y-1">
                      <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                        {row.label}
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <span className="text-red-700 line-through opacity-80">{row.mandi}</span>
                        <span className="text-emerald-800 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          {row.kisan}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Link href="/farmer" className="w-full">
                    <Button variant="primary" className="w-full py-3">
                      Start Listing Produce Now &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-14 bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black font-display">
            Ready to experience the SIH 2026 Live Prototype?
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-emerald-200">
            Step through the farmer listing flow, browse the buyer marketplace, trigger logistics routing, and disburse simulated UPI milestones.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/farmer">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black">
                Enter Farmer Portal
              </Button>
            </Link>
            <Link href="/buyer">
              <Button size="lg" variant="outline" className="border-emerald-400/40 text-white hover:bg-emerald-800">
                Enter Buyer Portal
              </Button>
            </Link>
            <Link href="/orders">
              <Button size="lg" variant="outline" className="border-emerald-400/40 text-white hover:bg-emerald-800">
                Logistics &amp; Settlement Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
