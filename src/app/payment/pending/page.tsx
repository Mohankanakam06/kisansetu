"use client";
import React from "react";
import Link from "next/link";
import { Loader2, Clock, IndianRupee, ArrowRight, Bell } from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";

export default function PaymentPendingPage() {
  return (
    <div className="flex-1 bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 ring-8 ring-amber-50">
            <Loader2 className="h-9 w-9 animate-spin text-amber-600" />
          </div>
          <h1 className="mt-5 text-headline-md text-on-surface sm:text-headline-lg">
            Payout Processing
          </h1>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            Your settlement is being processed by the payment gateway.
            <br />
            This usually takes under a minute.
          </p>
        </div>

        <Card className="mt-8 border-warning/30 bg-surface-container-lowest overflow-hidden relative">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-100/60 blur-2xl" />
          <div className="relative space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Stage 2 · Delivery payout
                </span>
                <p className="mt-1 flex items-center gap-1.5 text-headline-lg font-bold text-on-surface">
                  <IndianRupee className="h-6 w-6 text-amber-600" />
                  <span className="tnum">21,120</span>
                </p>
              </div>
              <Badge variant="warning" size="md">
                <Clock className="h-3 w-3" /> Pending
              </Badge>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-low">
                <div className="h-full w-1/3 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <div className="flex justify-between text-[11px] text-on-surface-variant">
                <span>Initiated</span>
                <span className="font-semibold text-amber-700">Gateway processing…</span>
                <span>Disbursed</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-outline-variant pt-4 text-body-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Razorpay transaction</span>
                <span className="font-mono text-caption font-semibold text-on-surface">TXN-SIH-GW-8X2K9A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Beneficiaries</span>
                <span className="font-medium text-on-surface">4 farmers · UPI</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6 space-y-3">
          <Button variant="primary" className="w-full" onClick={() => (window.location.href = "/payment/success")}>
            I&apos;ll check the status
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center gap-1.5 text-caption text-on-surface-variant">
            <Bell className="h-3.5 w-3.5" />
            We&apos;ll SMS you the instant the payout lands.
          </div>
        </div>

        <Link
          href="/orders"
          className="mt-4 flex items-center justify-center gap-1.5 text-body-sm font-semibold text-primary hover:underline"
        >
          Back to order tracking
        </Link>
      </div>
    </div>
  );
}