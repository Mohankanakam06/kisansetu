"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, IndianRupee, ArrowRight, Receipt, Download } from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";
import { apiService } from "@/services/api";

export default function PaymentSuccessPage() {
  const [payout, setPayout] = useState<{
    transaction_id: string;
    amount: number;
    payment_status: string;
    timestamp: string;
    farmer_payouts?: Array<{ farmer_name: string; amount: number }>;
  } | null>(null);

  useEffect(() => {
    // Simulate a just-completed settlement for the demo
    (async () => {
      const res = await apiService.triggerSettlement("ord-901", "delivery");
      setPayout({
        transaction_id: res.transaction_id,
        amount: res.amount,
        payment_status: res.payment_status,
        timestamp: res.timestamp,
        farmer_payouts: res.farmer_payouts,
      });
    })();
  }, []);

  return (
    <div className="flex-1 bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/10">
            <CheckCircle2 className="h-9 w-9 text-primary" />
          </div>
          <h1 className="mt-5 text-headline-md text-on-surface sm:text-headline-lg">
            Settlement Successful
          </h1>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            The delivery payout has been disbursed to farmers' UPI accounts.
          </p>
        </div>

        <Card className="mt-8 border-outline-variant bg-gradient-to-br from-primary/10 to-surface-container-lowest overflow-hidden relative">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Amount disbursed
                </span>
                <p className="mt-1 flex items-center gap-1 text-display-lg font-bold text-on-surface">
                  <IndianRupee className="h-7 w-7 text-primary" />
                  <span className="tnum">{payout ? payout.amount.toLocaleString("en-IN") : "…"}</span>
                </p>
              </div>
              <Badge variant="success" size="md">
                Payment Settled
              </Badge>
            </div>

            <div className="space-y-2 border-t border-outline-variant pt-4 text-body-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Transaction reference</span>
                <span className="font-mono text-caption font-semibold text-on-surface">
                  {payout?.transaction_id ?? "…"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Status</span>
                <span className="font-semibold text-primary uppercase">{payout?.payment_status ?? "…"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Settled on</span>
                <span className="font-medium text-on-surface">
                  {payout ? new Date(payout.timestamp).toLocaleString("en-IN") : "…"}
                </span>
              </div>
            </div>

            {payout?.farmer_payouts && (
              <div className="space-y-2 border-t border-outline-variant pt-4">
                <span className="text-caption font-bold uppercase tracking-wider text-primary">
                  Breakdown by farmer
                </span>
                {payout.farmer_payouts.map((fp, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-surface-container-lowest/80 px-3 py-2 text-body-sm border border-outline-variant">
                    <span className="font-medium text-on-surface">{fp.farmer_name}</span>
                    <span className="font-semibold text-primary tnum">₹{fp.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4" /> Download invoice
          </Button>
          <Link href="/orders">
            <Button variant="primary" className="w-full">
              View order status
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Link
          href="/buyer"
          className="mt-4 flex items-center justify-center gap-1.5 text-body-sm font-semibold text-primary hover:underline"
        >
          <Receipt className="h-4 w-4" /> Back to marketplace
        </Link>
      </div>
    </div>
  );
}