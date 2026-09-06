"use client";
import React from "react";
import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui";

export default function EmptyStatePage() {
  return (
    <div className="flex-1 bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm text-center rounded-xl border border-outline-variant bg-surface-container-lowest p-10 shadow-card">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-low">
          <PackageOpen className="h-8 w-8 text-on-surface-variant" />
        </div>
        <h2 className="mt-4 text-headline-md font-semibold text-on-surface">Nothing here yet</h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          Your listing has not been created yet. When you list produce, it aggregates with nearby farms into a buyer-visible lot.
        </p>
        <Link href="/farmer">
          <Button variant="primary" className="mt-6 w-full">
            List your first produce
          </Button>
        </Link>
      </div>
    </div>
  );
}