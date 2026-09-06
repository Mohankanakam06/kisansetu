"use client";
import React from "react";
import { SearchX, RefreshCw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui";

export default function NoResultsPage() {
  return (
    <div className="flex-1 bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm text-center rounded-xl border border-outline-variant bg-surface-container-lowest p-10 shadow-card">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <SearchX className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="mt-4 text-headline-md font-semibold text-on-surface">
          No matching lots found
        </h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          We couldn&apos;t find any aggregated lots for &quot;wheat&quot; in Raipur with grade&nbsp;A. Try loosening your filters.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <SlidersHorizontal className="h-4 w-4" /> Clear filters
          </Button>
          <Button variant="ghost" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" /> Search again
          </Button>
        </div>
      </div>
    </div>
  );
}