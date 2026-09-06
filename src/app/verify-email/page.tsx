"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Mail, ShieldCheck, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

export default function EmailVerificationPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [resent, setResent] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) return setError("Enter the 6-digit code from your email.");
    setError("");
    setVerified(true);
  };

  return (
    <div className="flex-1 bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/25">
            <Mail className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-headline-md text-on-surface">
            {verified ? "Email verified!" : "Verify your email"}
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {verified
              ? "Your account is now fully verified."
              : "We sent a verification code to your registered email."}
          </p>
        </div>

        {verified ? (
          <div className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-center shadow-card">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <p className="text-body-sm text-on-surface-variant">
              You&apos;re all set to list produce and place orders on KisanSetu.
            </p>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-body-sm font-semibold text-on-primary transition hover:bg-primary"
            >
              Continue to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card space-y-4">
              <div>
                <label htmlFor="code" className="block text-body-sm font-semibold text-on-surface">
                  Verification code
                </label>
                <input
                  id="code"
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="mt-1.5 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-center font-mono text-headline-md tracking-[0.5em] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {error && (
                <p className="flex items-center gap-1.5 text-caption font-medium text-error">
                  <AlertCircle className="h-3.5 w-3.5" /> {error}
                </p>
              )}
              <Button type="submit" variant="primary" className="w-full">
                Verify Email
              </Button>
            </div>

            <div className="flex items-center justify-between text-caption text-on-surface-variant">
              <button
                type="button"
                onClick={() => {
                  setResent(true);
                  setTimeout(() => setResent(false), 3000);
                }}
                className="flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {resent ? "Code resent!" : "Resend code"}
              </button>
              <Link href="/login" className="font-medium hover:text-on-surface">
                Back to sign in
              </Link>
            </div>
          </form>
        )}

        <p className="mt-8 flex items-center justify-center gap-1.5 text-caption text-on-surface-variant">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          Two-step verification keeps your KisanSetu account secure.
        </p>
      </div>
    </div>
  );
}