"use client";
import React from "react";
import { SearchX, FilterX, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

interface NoListingsFoundProps {
  onClearFilters: () => void;
  onSwitchToPools?: () => void;
  hasActiveFilters?: boolean;
}

export const NoListingsFound: React.FC<NoListingsFoundProps> = ({
  onClearFilters,
  onSwitchToPools,
  hasActiveFilters = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm max-w-xl mx-auto my-6">
      <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
        <SearchX className="w-8 h-8 text-emerald-600" />
      </div>

      <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
        {hasActiveFilters ? "No matching farmer listings found" : "No active listings right now"}
      </h3>

      <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
        {hasActiveFilters
          ? "We couldn't find any direct farmer lots matching your selected crop, district, or price filters. Try resetting the filters or lowering minimum bounds."
          : "Local farmers are currently harvesting fresh batches. Check back in a few minutes or browse our aggregated wholesale pools."}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center gap-2 border-slate-300 hover:bg-slate-50 text-slate-700"
          >
            <FilterX className="w-4 h-4 text-slate-500" />
            <span>Reset All Filters</span>
          </Button>
        )}

        {onSwitchToPools && (
          <Button
            variant="primary"
            onClick={onSwitchToPools}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <span>View Wholesale Pools</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default NoListingsFound;
