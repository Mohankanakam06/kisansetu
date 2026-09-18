"use client";
import React from "react";
import Link from "next/link";
import { CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";

export default function SuccessStatePage() {
  return (
    <div className="flex-1 bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center rounded-xl border border-outline-variant bg-surface-container-lowest p-10 shadow-card">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mt-4 text-headline-md text-on-surface">
          Listing submitted!
        </h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          Your 2,400 kg of wheat has been added and will aggregate with nearby farms into a buyer-visible lot.
        </p>

        <div className="mt-6 rounded-lg bg-surface-container-lowest border border-outline-variant p-4 text-left">
          <dl className="space-y-2 text-body-sm">
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Reference ID</dt>
              <dd className="font-mono text-on-surface">KS-2408-7741</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Est. grade</dt>
              <dd className="text-primary font-semibold">A (provisional)</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Status</dt>
              <dd className="text-on-surface">Queued for grading</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Link href="/farmer">
            <Button variant="primary" className="w-full">
              <FileText className="h-4 w-4" /> Track this listing
            </Button>
          </Link>
          <Link href="/buyer">
            <Button variant="ghost" className="w-full">
              Keep browsing <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}