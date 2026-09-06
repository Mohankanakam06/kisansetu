"use client";
import React from "react";
import Link from "next/link";
import {
  LayoutGrid,
  PackageOpen,
  SearchX,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, Badge } from "@/components/ui";

const STATES: {
  key: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  accent: string;
}[] = [
  {
    key: "empty",
    label: "Empty State",
    desc: "Listings, lots or orders with nothing to show yet.",
    icon: PackageOpen,
    href: "/states/empty",
    accent: "bg-surface-container-low text-on-surface-variant",
  },
  {
    key: "noresults",
    label: "No Search Results",
    desc: "A filter/search that matched zero lots.",
    icon: SearchX,
    href: "/states/no-results",
    accent: "bg-amber-100 text-amber-700",
  },
  {
    key: "loading",
    label: "Loading State",
    desc: "Skeleton / spinner while the API responds.",
    icon: Loader2,
    href: "/states/loading",
    accent: "bg-sky-100 text-sky-700",
  },
  {
    key: "error",
    label: "Error State",
    desc: "A failed request with retry.",
    icon: AlertTriangle,
    href: "/states/error",
    accent: "bg-rose-100 text-rose-700",
  },
  {
    key: "success",
    label: "Success State",
    desc: "Listing submitted, order placed, payout disbursed.",
    icon: CheckCircle2,
    href: "/states/success",
    accent: "bg-primary/10 text-primary",
  },
  {
    key: "session",
    label: "Session Expired",
    desc: "OTP or login session timed out.",
    icon: Clock,
    href: "/states/session-expired",
    accent: "bg-amber-100 text-amber-700",
  },
];

export default function StatesGalleryPage() {
  return (
    <div className="flex-1 bg-background py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-outline-variant pb-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm">
              <LayoutGrid className="h-4 w-4" />
            </span>
            <span className="text-caption font-bold uppercase tracking-wider text-primary">
              UI States Reference
            </span>
          </div>
          <h1 className="text-headline-md text-on-surface mt-2 sm:text-headline-lg">
            UX States &amp; Messages
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Every non-happy-path state a user can hit, ready to reuse during the demo and audit.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STATES.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.key}
                href={s.href}
                className="group rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-card transition-all duration-200 hover:border-primary"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold text-on-surface group-hover:text-primary transition-colors">
                  {s.label}
                </h3>
                <p className="mt-1 text-body-sm text-on-surface-variant">{s.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-caption font-medium text-primary">
                  View example
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}

          <Card className="flex flex-col justify-center border-dashed bg-transparent shadow-none">
            <span className="text-caption text-on-surface-variant">
              Also see the{" "}
              <Link href="/forbidden" className="font-semibold text-primary hover:underline">
                403
              </Link>
              ,{" "}
              <Link href="/offline" className="font-semibold text-primary hover:underline">
                Offline
              </Link>
              , and{" "}
              <Link href="/maintenance" className="font-semibold text-primary hover:underline">
                Maintenance
              </Link>{" "}
              full-page states.
            </span>
            <Badge variant="outline" size="sm" className="mt-2 w-fit">
              Part of the KisanSetu design system
            </Badge>
          </Card>
        </div>
      </div>
    </div>
  );
}