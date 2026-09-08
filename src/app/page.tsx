"use client";
import React, { useState } from "react";
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
} from "lucide-react";
import { Button, Card } from "@/components/ui";

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Sprout,
    title: "1. List by Voice or Form",
    desc: "Farmers speak in their local language or type details. Small harvests are combined into wholesale-ready lots.",
  },
  {
    step: "02",
    icon: Award,
    title: "2. Visual Quality Grading",
    desc: "A quick photo verifies uniform size, freshness, and defect percentage, assigning an objective Grade A/B.",
  },
  {
    step: "03",
    icon: Truck,
    title: "3. Consolidated Pickup",
    desc: "Single transport vehicle picks up multiple pooled farm lots along an optimized route, saving fuel and time.",
  },
  {
    step: "04",
    icon: Wallet,
    title: "4. Direct UPI Milestone Escrow",
    desc: "40% is paid upon vehicle loading at the farm gate, and the remaining 60% upon delivery confirmation.",
  },
];

const POPULAR_CROPS = [
  { name: "Tomato", icon: "🍅", mandi: "₹18/kg", direct: "₹22/kg" },
  { name: "Onion", icon: "🧅", mandi: "₹22/kg", direct: "₹28/kg" },
  { name: "Potato", icon: "🥔", mandi: "₹14/kg", direct: "₹18/kg" },
  { name: "Chilli", icon: "🌶️", mandi: "₹50/kg", direct: "₹65/kg" },
  { name: "Wheat", icon: "🌾", mandi: "₹20/kg", direct: "₹24/kg" },
];

export default function Home() {
  const [calcProduceKg, setCalcProduceKg] = useState(1000);
  const [calcCrop, setCalcCrop] = useState("Tomato");

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
    <div className="flex-1 flex flex-col bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#fafbf9] border-b border-slate-200/80 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800">
              <span>🌾 Direct Farm-to-Buyer Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-display leading-[1.15]">
              Connecting farmers directly to wholesale buyers.
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              KisanSetu aggregates smallholder produce, verifies crop quality, streamlines pickup logistics, and provides guaranteed UPI milestone payments.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/farmer">
                <Button size="lg" className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm">
                  <Sprout className="h-5 w-5 mr-2" />
                  List Your Harvest
                </Button>
              </Link>
              <Link href="/buyer">
                <Button size="lg" variant="secondary" className="font-semibold">
                  <Store className="h-5 w-5 mr-2 text-slate-600" />
                  Browse Produce Lots
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 md:py-20 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              How KisanSetu Works
            </h2>
            <p className="text-sm text-slate-600">
              A transparent, 4-step process designed for simplicity and trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2 font-display">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mandi vs KisanSetu Profit Calculator */}
      <section className="py-16 md:py-20 bg-[#fafbf9] border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Profit Calculator */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                  Estimate Your Real Earnings
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Compare traditional local mandi rates with direct pool aggregation.
                </p>
              </div>

              {/* Crop Picker buttons */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Select Produce</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(cropPrices).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCalcCrop(c)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        calcCrop === c
                          ? "bg-emerald-700 text-white"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Slider */}
              <div className="space-y-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-700">Harvest Volume</span>
                  <span className="text-sm font-bold text-slate-900">{calcProduceKg.toLocaleString()} kg</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="100"
                  value={calcProduceKg}
                  onChange={(e) => setCalcProduceKg(Number(e.target.value))}
                  className="w-full accent-emerald-700 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>200 kg</span>
                  <span>2,500 kg</span>
                  <span>5,000 kg</span>
                </div>
              </div>

              {/* Comparison Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
                  <p className="text-xs font-medium text-slate-500">Mandi Rate (~30% cuts)</p>
                  <p className="text-xl font-bold text-slate-700">
                    ₹{traditionalEarnings.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1">
                  <p className="text-xs font-medium text-emerald-800">KisanSetu Direct</p>
                  <p className="text-xl font-bold text-emerald-800">
                    ₹{kisanSetuEarnings.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold">
                    +₹{extraEarnings.toLocaleString("en-IN")} ({percentageGain}% more)
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Key Benefits */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Platform Advantages
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      title: "Higher Net Payouts",
                      desc: "Eliminate commission cuts and unauthorized tare deductions.",
                    },
                    {
                      title: "Instant 2-Stage UPI Escrow",
                      desc: "40% at farm pickup and 60% on delivery confirmation.",
                    },
                    {
                      title: "Objective AI Grading",
                      desc: "Standardized quality assessment from photos, removing arbitrary price cuts.",
                    },
                    {
                      title: "Direct Doorstep Pickup",
                      desc: "Logistics vehicle comes to your farm gate, saving individual transit costs.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Link href="/farmer" className="w-full">
                    <Button variant="primary" className="w-full py-2.5">
                      Get Started as a Farmer &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-14 bg-white">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            Ready to get started?
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Explore active produce listings or list your harvest in under a minute.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/farmer">
              <Button size="md" variant="primary">
                Farmer Portal
              </Button>
            </Link>
            <Link href="/buyer">
              <Button size="md" variant="secondary">
                Buyer Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
