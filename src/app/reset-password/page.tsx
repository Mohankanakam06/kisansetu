"use client";
import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
      return setError("Include at least one letter and one number.");
    if (password !== confirm) return setError("Passwords don't match.");
    setError("");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 900);
  };

  return (
    <div className="flex-1 bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/25">
            <KeyRound className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-headline-md text-on-surface">
            {done ? "Password updated" : "Set a new password"}
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {done
              ? "You can now sign in with your new password."
              : "Choose a strong password you don't use elsewhere."}
          </p>
        </div>

        {done ? (
          <div className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-center shadow-card">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-body-sm font-semibold text-on-primary transition hover:bg-primary"
            >
              Sign in with new password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card">
            <div>
              <label htmlFor="password" className="block text-body-sm font-semibold text-on-surface">
                New password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 pr-10 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface-variant"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-body-sm font-semibold text-on-surface">
                Confirm new password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="confirm"
                  type={show ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 pr-10 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-caption font-medium text-error">
                <AlertCircle className="h-3.5 w-3.5" /> {error}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>

            <Link
              href="/login"
              className="block text-center text-body-sm font-semibold text-primary hover:underline"
            >
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}