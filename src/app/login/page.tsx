"use client";
import React, { useState } from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import {
  Sprout,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Tractor,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui";

type Role = "farmer" | "buyer";
type LoginState = "idle" | "submitting" | "otp";

const ROLE_META: Record<Role, { label: string; tagline: string; icon: LucideIcon }> = {
  farmer: {
    label: "Farmer",
    tagline: "List your harvest & get paid directly",
    icon: Tractor,
  },
  buyer: {
    label: "Buyer",
    tagline: "Browse farm-direct lots at better rates",
    icon: ShoppingCart,
  },
};

export default function LoginPage() {
  const [role, setRole] = useState<Role>("farmer");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [state, setState] = useState<LoginState>("idle");
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setError("");
    setState("submitting");
    setTimeout(() => setState("otp"), 900);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setError("Enter the 6-digit code we sent you.");
      return;
    }
    setError("");
    window.location.href = role === "farmer" ? "/farmer" : "/buyer";
  };

  if (state === "otp" || state === "submitting") {
    return (
      <div className="flex-1 bg-background flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16 w-full">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-md shadow-primary/20">
              <Sprout className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-headline-lg text-on-surface">
              {state === "submitting" ? "Sending code…" : "Verify your phone"}
            </h1>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              We texted a 6-digit code to <span className="font-semibold text-on-surface">+91 {phone}</span>
            </p>
          </div>

          {state === "submitting" ? (
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-card">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-body-sm text-on-surface-variant">Sending OTP via SMS gateway…</p>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-card space-y-3">
                <div>
                  <label htmlFor="otp" className="block text-body-sm font-semibold text-on-surface">
                    One-time password
                  </label>
                  <input
                    id="otp"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    className="mt-1.5 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-center font-mono text-price-xl tracking-[0.5em] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {error && (
                  <p className="flex items-center gap-1.5 text-caption font-medium text-error">
                    <AlertCircle className="h-3.5 w-3.5" /> {error}
                  </p>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                >
                  Verify & Sign In
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-center text-caption text-on-surface-variant">
                Didn&apos;t receive it?{" "}
                <button
                  type="button"
                  onClick={() => setState("idle")}
                  className="font-semibold text-primary hover:underline"
                >
                  Resend or use a different number
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16 w-full">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-md shadow-primary/20">
            <Sprout className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-headline-lg font-bold text-on-surface font-display">
            Welcome back to KisanSetu
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Sign in to continue to your marketplace
          </p>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-4">
          {/* Role selection */}
          <div className="rounded-2xl border border-outline-variant/80 bg-surface-container-lowest p-6 shadow-card space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(ROLE_META) as Role[]).map((r) => {
                const meta = ROLE_META[r];
                const Icon = meta.icon;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    aria-pressed={role === r}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3.5 text-body-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                      role === r
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30 shadow-sm"
                        : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary/40 hover:bg-surface-container-low"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{meta.label}</span>
                    <span className="text-[11px] font-normal leading-tight text-center text-on-surface-variant line-clamp-2">{meta.tagline}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <label htmlFor="phone" className="block text-body-sm font-semibold text-on-surface">
                Mobile number
              </label>
              <div className="mt-1.5 flex items-center rounded-lg border border-outline-variant bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary">
                <span className="pl-3 text-body-sm font-semibold text-on-surface-variant">+91</span>
                <input
                  id="phone"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98765 43210"
                  className="w-full rounded-lg border-none bg-transparent px-3 py-3 text-body-sm text-on-surface focus:outline-none"
                />
              </div>
              {error && (
                <p className="mt-2 flex items-center gap-1.5 text-caption font-medium text-error">
                  <AlertCircle className="h-3.5 w-3.5" /> {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
            >
              <Smartphone className="h-4 w-4" />
              Send OTP
            </Button>
          </div>

          {/* Password sign-in */}
          <div className="flex items-center gap-3 text-caption text-on-surface-variant">
            <div className="h-px flex-1 bg-outline-variant" />
            OR
            <div className="h-px flex-1 bg-outline-variant" />
          </div>
          <button
            type="button"
            onClick={() => setShowOtp((v) => !v)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-sm font-semibold text-on-surface transition hover:bg-surface-container-low"
          >
            {showOtp ? "Use OTP instead" : "Sign in with password"}
          </button>
          {showOtp && (
            <p className="flex items-center gap-1.5 rounded-lg bg-warning/15 px-3 py-2 text-caption text-amber-800 ring-1 ring-warning/30">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Email/password auth ships with the full backend. This demo uses OTP.
            </p>
          )}

          <p className="text-center text-body-sm text-on-surface-variant">
            New to KisanSetu?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </form>

        <div className="mt-8 flex items-center justify-center gap-3 text-caption text-on-surface-variant">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> UPI-secured
          </span>
          <span className="h-3 w-px bg-outline-variant" />
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Farmer identity verified
          </span>
        </div>
      </div>
    </div>
  );
}
