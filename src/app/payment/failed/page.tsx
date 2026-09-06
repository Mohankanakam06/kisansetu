"use client";
import React from "react";
import Link from "next/link";
import { XCircle, AlertCircle, RotateCcw, HelpCircle } from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";

const commonReasons = [
  { code: "UPI_LIMIT_EXCEEDED", label: "Daily UPI limit reached", fix: "Try after midnight or split into two payouts." },
  { code: "BENEFICIARY_UPI_INVALID", label: "Farmer UPI ID invalid", fix: "Update farmer's UPI in profile and retry." },
  { code: "BANK_SERVER_DOWN", label: "Bank server unavailable", fix: "Automatic retry in 5 minutes. No action needed." },
  { code: "INSUFFICIENT_ESCROW", label: "Escrow balance low", fix: "Buyer needs to fund escrow before next payout." },
];

export default function PaymentFailedPage() {
  const reason = commonReasons[Math.floor(Math.random() * commonReasons.length)];

  return (
    <div className="flex-1 bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 ring-8 ring-rose-50">
            <XCircle className="h-9 w-9 text-error" />
          </div>
          <h1 className="mt-5 text-headline-md text-on-surface sm:text-headline-lg">
            Payout Could Not Complete
          </h1>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            The settlement agent encountered an issue while disbursing funds.
          </p>
        </div>

        <Card className="mt-8 border-rose-200 bg-surface-container-lowest overflow-hidden relative">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rose-100/60 blur-2xl" />
          <div className="relative p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  Error code
                </span>
                <p className="mt-1 font-mono text-body-sm font-semibold text-on-surface">
                  {reason.code}
                </p>
              </div>
              <Badge variant="danger" size="md">
                Failed
              </Badge>
            </div>

            <div className="space-y-2 border-t border-error/20 pt-4 text-body-sm">
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3">
                <AlertCircle className="h-4 w-4 text-error shrink-0" />
                <span className="font-medium text-rose-800">{reason.label}</span>
              </div>
              <div className="flex items-start gap-2 text-on-surface-variant pl-6">
                <HelpCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-on-surface-variant" />
                <span className="text-caption">{reason.fix}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6 space-y-3">
          <Button variant="primary" className="w-full" onClick={() => window.location.reload()}>
            <RotateCcw className="h-4 w-4" /> Retry payout
          </Button>
          <Link href="/orders">
            <Button variant="outline" className="w-full">
              Check order status
            </Button>
          </Link>
        </div>

        <div className="mt-4 rounded-lg border border-warning/30 bg-warning/15 p-4 text-body-sm text-amber-800">
          <p className="font-semibold flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4" /> What happens next?
          </p>
          <ul className="mt-2 space-y-1 text-caption pl-5 list-disc">
            <li>Farmers are notified of the delay via SMS/WhatsApp.</li>
            <li>Escrowed funds remain safely held by the settlement agent.</li>
            <li>You can manually retry or wait for the automatic retry cycle.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}