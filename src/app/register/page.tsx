"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Sprout,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  Grid3X3,
  CheckCircle2,
  AlertCircle,
  Tractor,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui";

export default function RegisterPage() {
  const [step, setStep] = useState<0 | 1>(0);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    role: "farmer" as "farmer" | "buyer",
    language: "hi",
    location: "",
    aadhaar: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const validateStep0 = () => {
    if (form.name.trim().length < 3) return "Enter your full name.";
    if (!/^[6-9]\d{9}$/.test(form.phone)) return "Enter a valid 10-digit mobile number.";
    if (form.aadhaar && form.aadhaar.replace(/\s/g, "").length !== 12)
      return "Aadhaar must be 12 digits (optional).";
    return "";
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep0();
    if (err) return setError(err);
    setError("");
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.location.trim()) return setError("Enter your village / market area.");
    setError("");
    setSubmitting(true);
    // Simulated registration — real impl hits POST /api/auth/register
    await new Promise((r) => setTimeout(r, 900));
    window.location.href = "/login";
  };

  return (
    <div className="flex-1 bg-background flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16 w-full">
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/25">
            <Sprout className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-headline-lg font-bold text-on-surface font-display">
            Join KisanSetu
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            The direct-to-market agri platform · SIH 26033
          </p>
        </div>

        {/* Stepper */}
        <ol className="mb-8 flex items-center justify-center gap-3 text-caption font-semibold">
          {[
            ["0", "Account details"],
            ["1", "Verify & finish"],
          ].map(([n, label], i) => (
            <li key={n} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-caption font-bold transition-all ${
                  (step === 0 && i === 0) || (step === 1 && i === 1)
                    ? "bg-primary text-on-primary shadow-sm"
                    : i < step
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : n}
              </span>
              <span className={i <= step ? "text-on-surface font-semibold" : "text-on-surface-variant"}>{label}</span>
              {i === 0 && <div className="h-px w-10 bg-outline-variant/60" />}
            </li>
          ))}
        </ol>

        {step === 0 ? (
          <form onSubmit={handleContinue} className="space-y-5 rounded-2xl border border-outline-variant/80 bg-surface-container-lowest p-6 sm:p-8 shadow-card">
            {/* Role */}
            <div>
              <label className="block text-body-sm font-semibold text-on-surface mb-2">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { key: "farmer", label: "Farmer", icon: Tractor },
                    { key: "buyer", label: "Buyer", icon: ShoppingCart },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => set("role", r.key)}
                    aria-pressed={form.role === r.key}
                    className={`flex items-center justify-center gap-2.5 rounded-xl border px-4 py-3 text-body-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                      form.role === r.key
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30 shadow-sm"
                        : "border-outline-variant text-on-surface-variant hover:border-primary/40 hover:bg-surface-container-low"
                    }`}
                  >
                    <r.icon className="h-4.5 w-4.5" />
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <label htmlFor="name" className="block text-body-sm font-semibold text-on-surface">Full name</label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <input
                  id="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Ram Kumar Patel"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-2.5 pl-9 pr-3 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-body-sm font-semibold text-on-surface">Mobile number</label>
              <div className="mt-1.5 flex items-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary">
                <span className="border-r border-outline-variant bg-background px-3 py-2.5 text-body-sm font-semibold text-on-surface-variant">+91</span>
                <Phone className="ml-3 h-4 w-4 text-on-surface-variant" />
                <input
                  id="phone"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98765 43210"
                  className="w-full bg-transparent px-2 py-2.5 text-body-sm text-on-surface focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="language" className="block text-body-sm font-semibold text-on-surface">Language</label>
                <select
                  id="language"
                  value={form.language}
                  onChange={(e) => set("language", e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="cg">छत्तीसगढ़ी (Chhattisgarhi)</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="relative">
                <label htmlFor="aadhaar" className="block text-body-sm font-semibold text-on-surface">Aadhaar (optional)</label>
                <div className="relative mt-1.5">
                  <Grid3X3 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    id="aadhaar"
                    inputMode="numeric"
                    value={form.aadhaar}
                    onChange={(e) => set("aadhaar", e.target.value.replace(/\D/g, "").slice(0, 12))}
                    placeholder="XXXX XXXX XXXX"
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-2.5 pl-9 pr-3 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-caption font-medium text-error">
                <AlertCircle className="h-3.5 w-3.5" /> {error}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1.5 text-caption text-on-surface-variant">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Your details are used only for identity & payout, never sold to intermediaries.
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-outline-variant/80 bg-surface-container-lowest p-6 sm:p-8 shadow-card">
            {/* Village */}
            <div className="relative">
              <label htmlFor="location" className="block text-body-sm font-semibold text-on-surface">
                Village / mandi area
              </label>
              <div className="relative mt-1.5">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <input
                  id="location"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="Village Birgaon, Raipur"
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-2.5 pl-9 pr-3 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <p className="mt-1 text-caption text-on-surface-variant">
                Used for geo-aggregation of your listings into buyer-scale lots.
              </p>
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-caption font-medium text-error">
                <AlertCircle className="h-3.5 w-3.5" /> {error}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
              {submitting ? "Creating account…" : "Create account"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setStep(0)}>
              ← Back
            </Button>
            <p className="text-center text-caption text-on-surface-variant">
              By signing up you agree to the{" "}
              <Link href="/legal/terms" className="text-primary hover:underline">Terms of Service</Link> and{" "}
              <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}