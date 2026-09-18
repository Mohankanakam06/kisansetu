"use client";
import React from "react";
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
          <Button variant="primary" onClick={() => (window.location.href = "/login")}>
            <LogIn className="h-4 w-4" /> Sign in again
          </Button>
          <Button variant="ghost" onClick={() => (window.location.href = "/")}>
            <ArrowLeft className="h-4 w-4" /> Go home
          </Button>
        </div>
      </div>
    </div>
  );
}