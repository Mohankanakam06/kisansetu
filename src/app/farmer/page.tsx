"use client";
import React, { useState } from "react";
import FarmerListingForm from "@/components/farmer/FarmerListingForm";
import QualityGradingSimulator from "@/components/farmer/QualityGradingSimulator";
import { Sprout, ScanSearch, Info, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui";

export default function FarmerPage() {
  const [activeTab, setActiveTab] = useState<"listing" | "grading">("listing");

  return (
    <div className="flex-1 bg-soil-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-soil-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                <Sprout className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Farmer Interface Module
              </span>
            </div>
            <h1 className="font-display text-2xl font-semibold text-soil-900 mt-2 sm:text-3xl">
              Farm-Gate Listing & AI Quality Grading
            </h1>
            <p className="text-sm text-soil-600 mt-1">
              List your harvest directly. Our geo-aggregation engine merges your listing with neighboring farms for bulk buyer bidding.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-soil-200 shadow-card">
            <div className="text-right">
              <span className="text-[11px] text-soil-400 block font-medium">AVERAGE MANDI REALIZATION</span>
              <span className="text-sm font-bold text-emerald-700">+28% vs Traditional Middleman</span>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-soil-200 gap-4">
          <button
            onClick={() => setActiveTab("listing")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "listing"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-soil-500 hover:text-soil-800"
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>1. Create Produce Listing</span>
            <Badge variant="success" size="sm">Prototype</Badge>
          </button>

          <button
            onClick={() => setActiveTab("grading")}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "grading"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-soil-500 hover:text-soil-800"
            }`}
          >
            <ScanSearch className="w-4 h-4" />
            <span>2. AI Photo Quality Grading</span>
            <Badge variant="default" size="sm">Vision Rubric</Badge>
          </button>
        </div>

        {/* Content */}
        {activeTab === "listing" ? (
          <FarmerListingForm />
        ) : (
          <QualityGradingSimulator />
        )}
      </div>
    </div>
  );
}
