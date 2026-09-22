"use client";

import { Building, DollarSign, Headphones, List, Zap, Check, X } from "lucide-react";
import React, { useState } from "react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Compare1Props {
  title?: string;
  subtitle?: string;
}

const Compare1: React.FC<Compare1Props> = ({
  title = "Compare Agricultural Platforms",
  subtitle = "Find the perfect trade platform to elevate your harvest and supply chain workflow",
}) => {
  const [activeTab, setActiveTab] = useState("traditional");

  const basePlatform = {
    name: "KisanSetu",
    icon: "🌱",
    color: "#059669",
    description:
      "Direct farmer-to-buyer decentralized marketplace powered by AI grading, automated logistics consolidation, and cryptographic escrow settlement.",
    features: {
      integration:
        "Automated 1-truck multi-farm route consolidation with GPS live tracking and driver spot-checks.",
      features:
        "AI multi-angle photo & video quality grading (Grade A/B/C/D), verified digital lot passports, and direct buyer matching.",
      pricing:
        "0% broker cut. 100% transparent direct pricing with zero hidden deductions or auction manipulation.",
      support:
        "Multilingual AI voice assistant (Hindi, Chhattisgarhi, English) with instant dispute resolution & 24/7 hotline.",
    },
  };

  const competitors = {
    traditional: {
      name: "Traditional Mandi (APMC)",
      color: "#DC2626", // Red 600
      icon: "🏪",
      description:
        "Physical yard trading relying on physical auctions, commission agents (Arhatiyas), and manual visual inspection.",
      features: {
        integration:
          "Farmers arrange individual tractor/trolley transport at high out-of-pocket costs with long unloading queues.",
        features:
          "Subjective visual glance by traders, lack of standardized quality tiers, and high risk of arbitrary rejections.",
        pricing:
          "15%–25% lost to intermediary commissions, handling fees, unloading cuts, and delayed payments (15–45 days).",
        support:
          "No formal support; dispute resolution is entirely at the mercy of local trade cartels.",
      },
    },
    middlemen: {
      name: "Village Brokers / Arhatiyas",
      color: "#EA580C", // Orange 600
      icon: "🤝",
      description:
        "Local informal intermediaries purchasing produce at farmgate with arbitrary price cuts and credit debt-traps.",
      features: {
        integration:
          "Informal farmgate pickup but farmer bears load shrinkage and weight inaccuracies without digital scale verification.",
        features:
          "No quality grading certification; entire crop is downgraded to low baseline price.",
        pricing:
          "Up to 30% below market rate; offers informal credit advances with compounding interest deductions.",
        support:
          "Unregulated informal agreements with zero legal protection or price transparency.",
      },
    },
    ecommerce: {
      name: "Centralized Agri-Tech",
      color: "#D97706", // Amber 600
      icon: "🏢",
      description:
        "Corporate procurement apps with centralized collection centers and long multi-day settlement cycles.",
      features: {
        integration:
          "Requires farmers to transport produce to distant centralized collection centers at fixed drop-off windows.",
        features:
          "Manual warehouse grading with high rejection rates after delivery has already occurred.",
        pricing:
          "8%–15% platform take-rates with 3–7 banking days settlement delays and unilateral return policies.",
        support:
          "Standard app ticketing system with long wait times and automated template replies.",
      },
    },
    contract: {
      name: "Corporate Contract Farming",
      color: "#7C3AED", // Purple 600
      icon: "📝",
      description:
        "Rigid pre-season corporate buyback agreements with stringent non-negotiable clauses.",
      features: {
        integration:
          "Corporate-scheduled logistics but strict penalties for missed delivery windows.",
        features:
          "Rigid cosmetic quality standards where minor flaws lead to severe lot disqualification.",
        pricing:
          "Fixed lock-in pricing that prevents farmers from benefiting when open market prices surge.",
        support:
          "Corporate field officers primarily enforcing contract terms rather than advocating for farmer interests.",
      },
    },
  };

  type CategoryKey =
    | "general"
    | "integration"
    | "features"
    | "pricing"
    | "support";

  const categories: {
    key: CategoryKey;
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: React.ComponentType<any>;
  }[] = [
    { key: "general", label: "Overview & Model", icon: Building },
    { key: "integration", label: "Logistics & Pickup", icon: Zap },
    { key: "features", label: "Quality Grading", icon: List },
    { key: "pricing", label: "Pricing & Settlement", icon: DollarSign },
    { key: "support", label: "Farmer Support", icon: Headphones },
  ];

  return (
    <section className="py-20 sm:py-32 bg-white relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Main Heading Section matching 5xl style */}
        <div className="mb-12 max-w-4xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
            Fair Trade Benchmark
          </div>
          <h1 className="mb-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
            {title}
          </h1>
          <p className="text-slate-600 text-lg sm:text-xl font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <TabsList className="flex w-max space-x-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
              {Object.entries(competitors).map(([key, competitor]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs flex items-center gap-2 rounded-xl px-4 py-2.5 text-slate-600 font-semibold transition-all border border-transparent data-[state=active]:border-slate-200/80"
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-md text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: competitor.color }}
                  >
                    {competitor.icon}
                  </span>
                  <span className="text-sm font-medium">{competitor.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar className="hidden" orientation="horizontal" />
          </ScrollArea>

          <Separator className="my-6" />

          {Object.entries(competitors).map(([key, competitor]) => (
            <TabsContent key={key} value={key} className="mt-0 focus-visible:outline-none">
              {/* Mobile View: Stacked Comparison Cards (No horizontal scroll required) */}
              <div className="md:hidden space-y-4">
                {/* Header summary badge */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="text-xl bg-emerald-100 border border-emerald-300 p-1.5 rounded-lg">🌱</div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Choice</span>
                      <span className="font-extrabold text-slate-900 text-sm">KisanSetu</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">VS</span>
                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Alternative</span>
                      <span className="font-bold text-slate-800 text-sm">{competitor.name}</span>
                    </div>
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm shadow-xs text-white shrink-0"
                      style={{ backgroundColor: competitor.color }}
                    >
                      {competitor.icon}
                    </div>
                  </div>
                </div>

                {/* Category Cards */}
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.key} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-150">
                        <div className="flex items-center justify-center bg-white border border-slate-200 rounded-md p-1 shadow-2xs text-slate-600">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                          {category.label}
                        </h4>
                      </div>
                      <div className="p-4 space-y-3">
                        {/* KisanSetu Item */}
                        <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span className="font-bold text-emerald-950 text-xs">KisanSetu Advantage</span>
                          </div>
                          <p className="text-xs text-slate-800 font-medium leading-relaxed pl-5.5">
                            {category.key === "general"
                              ? basePlatform.description
                              : basePlatform.features[category.key]}
                          </p>
                        </div>
                        {/* Alternative Item */}
                        <div className="p-3 rounded-lg bg-rose-50/40 border border-rose-150">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <X className="w-4 h-4 text-rose-500 shrink-0" />
                            <span className="font-semibold text-rose-900 text-xs">{competitor.name}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed pl-5.5">
                            {category.key === "general"
                              ? competitor.description
                              : competitor.features[category.key]}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View: Full Table */}
              <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 shadow-xs bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="border-r border-slate-200 p-6 font-semibold text-slate-700 w-1/4 text-sm uppercase tracking-wider">
                          Compare
                        </th>
                        <th className="min-w-[280px] border-r border-slate-200 p-6 text-left w-[37.5%] bg-emerald-50/60">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl bg-emerald-100 border border-emerald-300 p-2 rounded-xl text-emerald-800 shrink-0">
                              🌱
                            </div>
                            <div>
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200/80 text-emerald-900 uppercase">
                                Verified
                              </div>
                              <div className="text-xl font-extrabold text-emerald-950 tracking-tight">
                                KisanSetu
                              </div>
                            </div>
                          </div>
                        </th>
                        <th className="min-w-[280px] p-6 text-left w-[37.5%] bg-slate-50/40">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-lg shadow-xs text-white shrink-0"
                              style={{ backgroundColor: competitor.color }}
                            >
                              {competitor.icon}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-500 uppercase">
                                Alternative
                              </div>
                              <div className="text-xl font-bold text-slate-900">
                                {competitor.name}
                              </div>
                            </div>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {categories.map((category) => {
                        const Icon = category.icon;

                        return (
                          <tr
                            key={category.key}
                            className="hover:bg-slate-50/40 transition-colors"
                          >
                            <td className="bg-slate-50/40 border-r border-slate-200 p-6 align-top">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center bg-white border border-slate-200 rounded-lg p-2 shadow-2xs text-slate-600">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span className="font-semibold text-slate-800 text-sm">
                                  {category.label}
                                </span>
                              </div>
                            </td>
                            <td className="border-r border-slate-200 p-6 align-top bg-emerald-50/20">
                              <div className="flex items-start gap-2.5">
                                <Check className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                                <span className="text-slate-800 text-sm leading-relaxed font-medium">
                                  {category.key === "general"
                                    ? basePlatform.description
                                    : basePlatform.features[category.key]}
                                </span>
                              </div>
                            </td>
                            <td className="p-6 align-top bg-white">
                              <div className="flex items-start gap-2.5">
                                <X className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                <span className="text-slate-600 text-sm leading-relaxed">
                                  {category.key === "general"
                                    ? competitor.description
                                    : competitor.features[category.key]}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export { Compare1 };
