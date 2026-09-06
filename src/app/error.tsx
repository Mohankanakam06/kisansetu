"use client";
import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import StatusPage from "@/components/ui/StatusPage";
import { Button } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[KisanSetu] Application error:", error);
  }, [error]);

  return (
    <div className="flex-1 bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <p className="text-6xl font-semibold text-on-surface-variant select-none">500</p>
        <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 ring-8 ring-rose-50">
          <AlertTriangle className="h-8 w-8 text-error" />
        </div>
        <p className="mt-4 text-caption font-bold uppercase tracking-widest text-primary">
          Something went wrong
        </p>
        <h1 className="mt-2 text-headline-md text-on-surface sm:text-headline-lg">
          We hit an unexpected error
        </h1>
        <p className="mt-2 text-body-sm text-on-surface-variant leading-relaxed">
          Our team has been notified. Please try again in a moment, or return to the marketplace.
        </p>
        <div className="mt-8 flex flex-col gap-2">
          <Button variant="primary" className="w-full" onClick={reset}>
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Go home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}