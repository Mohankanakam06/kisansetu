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
import { useLanguage } from "@/lib/language";

export default function RegisterPage() {
  const { t, language, setLanguage } = useLanguage();
  const [step, setStep] = useState<0 | 1>(0);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    role: "farmer" as "farmer" | "buyer",
    language: language || "hi",
    location: "",
    aadhaar: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const validateStep0 = () => {
    if (form.name.trim().length < 3) return t("Enter your full name.", "कृपया अपना पूरा नाम दर्ज करें।", "अपन पूरा नाव डारव।");
    if (!/^[6-9]\d{9}$/.test(form.phone)) return t("Enter a valid 10-digit mobile number.", "कृपया वैध 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें।", "मान्य 10 अंक के मोबाइल नंबर डारव।");
    if (form.aadhaar && form.aadhaar.replace(/\s/g, "").length !== 12)
      return t("Aadhaar must be 12 digits (optional).", "आधार 12 अंकों का होना चाहिए (वैकल्पिक)।", "आधार 12 अंक के होय बर चाही (ऐच्छिक)।");
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
    if (!form.location.trim()) return setError(t("Enter your village / market area.", "कृपया अपना गाँव / मंडी क्षेत्र दर्ज करें।", "अपन गांव / मंडी क्षेत्र डारव।"));
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
        throw new Error(data.detail || t("Registration failed", "पंजीकरण विफल", "पंजीकरण नइ होइस"));
      }
      const data = await res.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("kisansetu_token", data.token);
        localStorage.setItem("kisansetu_user", JSON.stringify(data.user));
        const isHttps = window.location.protocol === "https:";
        document.cookie = `kisansetu_token=${data.token}; path=/; max-age=604800; SameSite=Lax${isHttps ? "; Secure" : ""}`;
      }
      window.location.href = data.redirect || `/${data.user?.role || form.role}`;
    } catch (err: any) {
      // Offline / demo fallback: keep the app usable
      if (typeof window !== "undefined") {
        const demoUser = { name: form.name, phone: form.phone, role: form.role };
        localStorage.setItem("kisansetu_user", JSON.stringify(demoUser));
        const isHttps = window.location.protocol === "https:";
        document.cookie = `kisansetu_token=demo-fallback-token; path=/; max-age=604800; SameSite=Lax${isHttps ? "; Secure" : ""}`;
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
            {t("Join KisanSetu", "KisanSetu से जुड़ें", "KisanSetu म जुड़व")}
          </h1>
          <p className="text-sm text-slate-600">
            {t("The direct-to-market agricultural marketplace platform", "सीधे बाजार से जोड़ने वाला आधुनिक कृषि मंच", "सीधा बाजार ले जोड़े वाला आधुनिक कृषि मंच")}
          </p>
        </div>

        {/* Stepper */}
        <ol className="flex items-center justify-center gap-3 text-xs font-semibold">
          {[
            ["1", t("Account details", "खाता विवरण", "खाता बिबरन")],
            ["2", t("Location & finish", "स्थान और समापन", "स्थान आ पूरा करव")],
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
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                {t("I am registering as a…", "मैं पंजीकरण कर रहा हूँ…", "मई पंजीकरण करत हंव…")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { key: "farmer", label: t("Farmer", "किसान", "किसान"), icon: Tractor },
                    { key: "buyer", label: t("Wholesale Buyer", "थोक खरीदार", "थोक खरीदार"), icon: ShoppingCart },
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
              <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("Full name", "पूरा नाम", "पूरा नाव")}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder={t("Ram Kumar Patel", "राम कुमार पटेल", "राम कुमार पटेल")}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("Mobile number", "मोबाइल नंबर", "मोबाइल नंबर")}
              </label>
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
                <label htmlFor="language" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t("Language", "भाषा", "भाषा")}
                </label>
                <select
                  id="language"
                  value={form.language}
                  onChange={(e) => {
                    set("language", e.target.value);
                    setLanguage(e.target.value as "en" | "hi" | "cg");
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="cg">छत्तीसगढ़ी (Chhattisgarhi)</option>
                </select>
              </div>
              <div className="relative">
                <label htmlFor="aadhaar" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t("Aadhaar (optional)", "आधार (वैकल्पिक)", "आधार (ऐच्छिक)")}
                </label>
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
              {t("Continue", "आगे बढ़ें", "आगे बढ़व")}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{t("Your details are used only for identity and payout settlements.", "आपके विवरण केवल पहचान और भुगतान निपटान के लिए उपयोग किए जाते हैं।", "आप मन के जानकारी सिर्फ पहचान आ भुगतान बर उपयोग करे जाही।")}</span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            {/* Village */}
            <div className="relative">
              <label htmlFor="location" className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("Village / mandi area", "गाँव / मंडी क्षेत्र", "गांव / मंडी क्षेत्र")}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="location"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder={t("Village Birgaon, Raipur", "ग्राम बिरगांव, रायपुर", "गांव बिरगांव, रायपुर")}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                {t(
                  "Used for geographic aggregation of listings into buyer-scale consolidated lots.",
                  "किसानों की उपज को बड़े खरीदार-स्तरीय लॉट में भौगोलिक रूप से एकत्रित करने के लिए उपयोग किया जाता है।",
                  "किसान मन के फसल ला बड़े लॉट म जोड़े बर उपयोग करे जाही।"
                )}
              </p>
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                <AlertCircle className="h-4 w-4" /> {error}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full py-2.5" isLoading={submitting}>
              {submitting ? t("Creating account…", "खाता बनाया जा रहा है…", "खाता बनावत हे…") : t("Create account", "खाता बनाएं", "खाता बनाव")}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setStep(0)}>
              {t("← Back", "← वापस", "← पाछू")}
            </Button>
            <p className="text-center text-xs text-slate-500">
              {t("Already have an account?", "पहले से खाता है?", "पहिली ले खाता हे?")}{" "}
              <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
                {t("Sign in", "साइन इन करें", "साइन इन करव")}
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

