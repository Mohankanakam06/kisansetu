"use client";
import React from "react";
import { Leaf, Users, TrendingDown, RefreshCw, Layers, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui";

interface BuyerMetricsHeaderProps {
  totalListings: number;
  totalFpos?: number;
  avgSavingsPercent?: number;
  isLiveSyncing?: boolean;
  activeTab: "farmer_listings" | "wholesale_pools";
  onTabChange: (tab: "farmer_listings" | "wholesale_pools") => void;
  farmerCount?: number;
  poolCount?: number;
}

export const BuyerMetricsHeader: React.FC<BuyerMetricsHeaderProps> = ({
  totalListings,
  totalFpos = 14,
  avgSavingsPercent = 16.5,
  isLiveSyncing = true,
  activeTab,
  onTabChange,
  farmerCount = 0,
  poolCount = 0,
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1: Total Listings */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-700 uppercase tracking-wider">Active Listings</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{totalListings} Lots</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <Leaf className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Connected FPOs */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-700 uppercase tracking-wider">Certified FPOs</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{totalFpos} Cooperatives</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Middleman Savings */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-700 uppercase tracking-wider">Avg. Direct Savings</div>
            <div className="text-xl font-bold text-emerald-800 mt-0.5">+{avgSavingsPercent}% <span className="text-xs font-normal text-slate-700">vs Mandi</span></div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Realtime Sync status */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-sm hover:shadow transition-shadow flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-700 uppercase tracking-wider">Network Status</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {isLiveSyncing ? "Live Escrow Ready" : "Offline Sandbox"}
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Primary Marketplace Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTabChange("farmer_listings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "farmer_listings"
                ? "bg-white text-emerald-900 shadow-sm border border-emerald-100"
                : "text-slate-800 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <UserCheck className={`w-4 h-4 ${activeTab === "farmer_listings" ? "text-emerald-700" : "text-slate-600"}`} />
            <span>Direct Farmer Produce</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === "farmer_listings" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
            }`}>
              {farmerCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange("wholesale_pools")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "wholesale_pools"
                ? "bg-white text-emerald-900 shadow-sm border border-emerald-100"
                : "text-slate-800 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Layers className={`w-4 h-4 ${activeTab === "wholesale_pools" ? "text-emerald-700" : "text-slate-600"}`} />
            <span>Wholesale Clustered Pools</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === "wholesale_pools" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
            }`}>
              {poolCount}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50/80 border border-emerald-200/60 rounded-lg text-[11px] font-medium text-emerald-800">
          <span>🛡️ KisanSetu Sandbox Escrow</span>
          <span className="text-emerald-600">•</span>
          <span>Zero Gateway Fees</span>
        </div>
      </div>
    </div>
  );
};

export default BuyerMetricsHeader;
