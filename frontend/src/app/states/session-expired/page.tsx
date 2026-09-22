"use client";
import React from "react";
import Link from "next/link";
import { Clock, LogIn, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";

export default function SessionExpiredPage() {
  return (
    <div className="flex-1 bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm text-center rounded-xl border border-outline-variant bg-surface-container-lowest p-10 shadow-card">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="mt-4 text-headline-md font-semibold text-on-surface">
          Session expired
        </h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          Your sign-in timed out to keep your account secure. Sign in again — your lots and orders are saved.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/login" className="w-full">
            <Button variant="primary" className="w-full">
              <LogIn className="h-4 w-4 mr-1.5" /> Sign in again
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Go home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}