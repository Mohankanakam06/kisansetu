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
    const API_BASE = "/api";
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Registration failed");
      }
      const data = await res.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("kisansetu_token", data.token);
        localStorage.setItem("kisansetu_user", JSON.stringify(data.user));
      }
      window.location.href = data.redirect || "/login";
    } catch (err: any) {
      // Offline / demo fallback: keep the app usable
      if (typeof window !== "undefined") {
        const demoUser = { name: form.name, phone: form.phone, role: form.role };
        localStorage.setItem("kisansetu_user", JSON.stringify(demoUser));
      }
      window.location.href = `/${form.role}`;
    }
  };

  return (
    <div className="flex-1 bg-[#fafbf9] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Sprout className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Join KisanSetu
          </h1>
          <p className="text-sm text-slate-600">
            The direct-to-market agricultural marketplace platform
          </p>
        </div>

        {/* Stepper */}
        <ol className="flex items-center justify-center gap-3 text-xs font-semibold">
          {[
            ["1", "Account details"],
            ["2", "Location & finish"],
          ].map(([n, label], i) => (
            <li key={n} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  (step === 0 && i === 0) || (step === 1 && i === 1)
                    ? "bg-emerald-700 text-white"
                    : i < step
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : n}
              </span>
              <span className={i <= step ? "text-slate-900 font-semibold" : "text-slate-400"}>{label}</span>
              {i === 0 && <div className="h-px w-10 bg-slate-200" />}
            </li>
          ))}
        </ol>

        {step === 0 ? (
          <form onSubmit={handleContinue} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">I am registering as a…</label>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { key: "farmer", label: "Farmer", icon: Tractor },
                    { key: "buyer", label: "Wholesale Buyer", icon: ShoppingCart },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => set("role", r.key)}
                    aria-pressed={form.role === r.key}
                    className={`flex items-center justify-center gap-2.5 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      form.role === r.key
                        ? "border-emerald-700 bg-emerald-50/50 text-emerald-900"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <r.icon className="h-4 w-4" />
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Ram Kumar Patel"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1.5">Mobile number</label>
              <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 focus-within:border-emerald-600">
                <span className="border-r border-slate-200 bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-600">+91</span>
                <Phone className="ml-3 h-4 w-4 text-slate-400" />
                <input
                  id="phone"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98765 43210"
                  className="w-full bg-transparent px-2.5 py-2.5 text-sm text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="language" className="block text-xs font-semibold text-slate-700 mb-1.5">Language</label>
                <select
                  id="language"
                  value={form.language}
                  onChange={(e) => set("language", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                >
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="cg">छत्तीसगढ़ी (Chhattisgarhi)</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="relative">
                <label htmlFor="aadhaar" className="block text-xs font-semibold text-slate-700 mb-1.5">Aadhaar (optional)</label>
                <div className="relative">
                  <Grid3X3 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="aadhaar"
                    inputMode="numeric"
                    value={form.aadhaar}
                    onChange={(e) => set("aadhaar", e.target.value.replace(/\D/g, "").slice(0, 12))}
                    placeholder="XXXX XXXX XXXX"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                <AlertCircle className="h-4 w-4" /> {error}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full py-2.5">
              Continue
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Your details are used only for identity and payout settlements.</span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            {/* Village */}
            <div className="relative">
              <label htmlFor="location" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Village / mandi area
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="location"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="Village Birgaon, Raipur"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Used for geographic aggregation of listings into buyer-scale consolidated lots.
              </p>
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                <AlertCircle className="h-4 w-4" /> {error}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full py-2.5" isLoading={submitting}>
              {submitting ? "Creating account…" : "Create account"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setStep(0)}>
              ← Back
            </Button>
            <p className="text-center text-xs text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
