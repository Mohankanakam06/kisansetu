"use client";
import React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Store } from "lucide-react";
import { Button } from "@/components/ui";

export default function ErrorStatePage() {
  return (
    <div className="flex-1 bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm text-center rounded-xl border border-outline-variant bg-surface-container-lowest p-10 shadow-card">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
          <AlertTriangle className="h-8 w-8 text-error" />
        </div>
        <h2 className="mt-4 text-headline-md font-semibold text-on-surface">
          Couldn&apos;t load your lots
        </h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          Something went wrong on our side while fetching aggregated lots. Your details are safe — please try again.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="primary" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-1.5" /> Try again
          </Button>
          <Link href="/buyer" className="w-full">
            <Button variant="ghost" className="w-full">
              <Store className="h-4 w-4 mr-1.5" /> Back to marketplace
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}