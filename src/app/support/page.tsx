"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  Sprout,
  ShoppingCart,
  Truck,
  IndianRupee,
  ChevronRight,
} from "lucide-react";

const FAQ_ITEMS = [
  {
    icon: Sprout,
    category: "Farmers",
    items: [
      {
        q: "How do I list my produce?",
        a: "Go to Farmer Listing and tap 'Create new listing'. Enter crop type, quantity (kg), and your location. The aggregation agent automatically clusters nearby farms so buyers see one consolidated lot.",
      },
      {
        q: "What grade will my produce get?",
        a: "The grading agent assesses quality after your listing is submitted. You'll see a provisional grade (A/B/C) in your listing dashboard. Grade affects the price band buyers see.",
      },
      {
        q: "How do I get paid?",
        a: "Once the buyer confirms delivery, the settlement agent disburses payment directly to your UPI-linked bank account. You can track pending payouts in the Orders & Logistics page.",
      },
      {
        q: "How is this different from a mandi?",
        a: "KisanSetu removes the middleman. AI agents handle aggregation, quality grading, logistics routing, and payment settlement — so you get a fairer, faster deal.",
      },
    ],
  },
  {
    icon: ShoppingCart,
    category: "Buyers",
    items: [
      {
        q: "How do I find produce to buy?",
        a: "The Buyer Portal shows all aggregated lots available in your selected market area. Use filters for crop type, grade, and quantity to narrow results.",
      },
      {
        q: "Can I trust the grade shown?",
        a: "Grades are assessed by the AI grading agent using standardized criteria. If you dispute a grade, you can raise it through support within 48 hours of delivery.",
      },
      {
        q: "What happens if produce arrives damaged?",
        a: "Contact support within 48 hours with photos. The dispute resolution agent reviews evidence and issues a partial or full refund depending on the claim.",
      },
    ],
  },
  {
    icon: Truck,
    category: "Logistics",
    items: [
      {
        q: "Who handles delivery?",
        a: "The routing agent assigns logistics partners based on distance, load size, and freshness requirements. You'll see estimated delivery time when you confirm an order.",
      },
      {
        q: "Can I track my order?",
        a: "Yes. The Orders & Logistics page shows real-time status for each order — from pickup through in-transit to delivered.",
      },
    ],
  },
  {
    icon: IndianRupee,
    category: "Payments",
    items: [
      {
        q: "How are prices set?",
        a: "Prices reflect market rates adjusted for grade, freshness, and demand. There's no auction — you pay a transparent listed price.",
      },
      {
        q: "What payment methods are accepted?",
        a: "UPI (PhonePe, Google Pay, Paytm) and bank transfer. Settlements to farmers go directly to their registered UPI / bank account.",
      },
    ],
  },
];

export default function SupportPage() {
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = FAQ_ITEMS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        !query ||
        item.q.toLowerCase().includes(query.toLowerCase()) ||
        item.a.toLowerCase().includes(query.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="flex-1 bg-background py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-caption font-semibold text-primary ring-1 ring-inset ring-primary/20 mb-3">
            <HelpCircle className="h-3.5 w-3.5" />
            Help Center
          </span>
          <h1 className="text-headline-md text-on-surface sm:text-headline-lg">
            How can we help you?
          </h1>
          <p className="mt-2 text-body-sm text-on-surface-variant max-w-lg mx-auto">
            Answers to common questions about listing produce, buying lots, logistics, and payments.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 mx-auto max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search FAQs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-4 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant shadow-card focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {filtered.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.category}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="text-body-sm font-semibold text-on-surface">{cat.category}</h2>
                </div>
                <div className="space-y-2">
                  {cat.items.map((item) => {
                    const isOpen = open === item.q;
                    return (
                      <button
                        key={item.q}
                        onClick={() => setOpen(isOpen ? null : item.q)}
                        className="w-full text-left rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-card transition-all duration-200 hover:border-primary"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-body-sm font-medium text-on-surface">{item.q}</span>
                          <ChevronRight
                            className={`h-4 w-4 text-on-surface-variant shrink-0 transition-transform duration-200 ${
                              isOpen ? "rotate-90" : ""
                            }`}
                          />
                        </div>
                        {isOpen && (
                          <p className="mt-3 text-body-sm text-on-surface-variant leading-relaxed">{item.a}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-card">
              <Search className="h-8 w-8 text-on-surface-variant mx-auto" />
              <p className="mt-3 text-body-sm text-on-surface-variant">
                No FAQs match &quot;{query}&quot;. Try different keywords.
              </p>
            </div>
          )}
        </div>

        {/* Still need help? */}
        <div className="mt-10 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-center shadow-card">
          <p className="text-body-sm text-on-surface-variant font-medium">Still need help?</p>
          <p className="mt-1 text-caption text-on-surface-variant">
            This is a prototype for SIH 2026. In production, live chat and email support would be available here.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              href="/"
              className="rounded-lg bg-primary px-4 py-2 text-caption font-semibold text-on-primary shadow-sm hover:bg-primary transition-colors"
            >
              Back to marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}