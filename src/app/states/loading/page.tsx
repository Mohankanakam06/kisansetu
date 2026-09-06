"use client";
import React from "react";
import { Clock3 } from "lucide-react";
import StatusPage from "@/components/ui/StatusPage";

export default function LoadingStatePage() {
  return (
    <div className="flex-1 bg-background flex flex-col px-4 py-16">
      {/* Header */}
      <div className="mx-auto w-full max-w-3xl text-center mb-10">
        <p className="text-caption font-bold uppercase tracking-widest text-primary">
          UI Pattern · Loading State
        </p>
        <h1 className="mt-2 text-headline-md text-on-surface">
          Loading examples
        </h1>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          Patterns to show while aggregation, grading or routing is in progress.
        </p>
      </div>

      <div className="mx-auto w-full max-w-3xl space-y-6">
        {/* Spinner */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Clock3 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="mt-3 text-body-sm font-semibold text-on-surface">Optimizing your lot…</p>
          <p className="text-caption text-on-surface-variant">Aggregation agent is clustering nearby produce</p>
          <div className="mx-auto mt-5 h-1.5 w-32 overflow-hidden rounded-full bg-surface-container-low">
            <div className="h-full w-2/3 rounded-full bg-primary animate-pulse" />
          </div>
        </div>

        {/* Skeletons */}
        <div className="space-y-3">
          <p className="text-caption font-bold uppercase tracking-wider text-on-surface-variant">Skeleton cards</p>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 w-full rounded-xl border border-outline-variant bg-surface-container-lowest animate-pulse shadow-card" />
          ))}
        </div>
      </div>
    </div>
  );
}