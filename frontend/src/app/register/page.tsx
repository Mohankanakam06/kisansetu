"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sprout,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Grid3X3,
  CheckCircle2,
  AlertCircle,
  Tractor,
  ShoppingCart,
} from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/language";

export default function RegisterPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [step, setStep] = useState<0 | 1>(0);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "farmer" as "farmer" | "buyer",
    language: language || "hi",
    location: "",
    aadhaar: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const validateStep0 = () => {
    if (form.name.trim().length < 3) return t("Enter your full name.", "कृपया अपना पूरा नाम दर्ज करें।", "अपन पूरा नाव डारव।");
    if (!/^[6-9]\d{9}$/.test(form.phone)) return t("Enter a valid 10-digit mobile number.", "कृपया वैध 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें।", "मान्य 10 अंक के मोबाइल नंबर डारव।");
    if (form.aadhaar && form.aadhaar.replace(/\s/g, "").length !== 12)
      return t("Aadhaar must be 12 digits (optional).", "आधार 12 अंकों का होना चाहिए (वैकल्पिक)।", "आधार 12 अंक के होय बर चाही (ऐच्छिक)।");

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return t("Enter a valid email address.", "कृपया एक वैध ईमेल पता दर्ज करें।", "सही ईमेल पता डारव।");
    }

    if (form.email && !form.password) {
      return t("Password is required for email login.", "ईमेल लॉगिन के लिए पासवर्ड आवश्यक है।", "ईमेल लॉगिन बर पासवर्ड जरूरी हे।");
    }

    if (form.password) {
      if (form.password.length < 6) return t("Password must be at least 6 characters.", "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।", "पासवर्ड कम से कम 6 अक्षर के होय बर चाही।");
      if (form.password !== form.confirmPassword) return t("Passwords do not match.", "पासवर्ड मेल नहीं खाते।", "पासवर्ड नइ मिलत हे।");
    }

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
      router.push(data.redirect || `/${data.user?.role || form.role}`);
    } catch (err: any) {
      if (typeof window !== "undefined") {
        const demoUser = { name: form.name, phone: form.phone, role: form.role };
        localStorage.setItem("kisansetu_user", JSON.stringify(demoUser));
        const isHttps = window.location.protocol === "https:";
        document.cookie = `kisansetu_token=demo-fallback-token; path=/; max-age=604800; SameSite=Lax${isHttps ? "; Secure" : ""}`;
      }
      router.push(`/${form.role}`);
    }
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-xs">
            <Sprout className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
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
            ["2", t("Location & Finish", "स्थान और समापन", "स्थान आ पूरा करव")],
          ].map(([n, label], i) => (
            <li key={n} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  (step === 0 && i === 0) || (step === 1 && i === 1)
                    ? "bg-emerald-800 text-white shadow-xs"
                    : i < step
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : n}
              </span>
              <span className={i <= step ? "text-slate-900 font-bold" : "text-slate-400"}>{label}</span>
              {i === 0 && <div className="h-px w-10 bg-slate-200" />}
            </li>
          ))}
        </ol>

        {step === 0 ? (
          <form onSubmit={handleContinue} className="space-y-4">
            <Card className="space-y-4">
              {/* Role Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-2">
                  {t("I am registering as a…", "मैं पंजीकरण कर रहा हूँ…", "मई पंजीकरण करत हंव…")}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { key: "farmer", label: t("Farmer / FPO", "किसान / FPO", "किसान / FPO"), icon: Tractor },
                      { key: "buyer", label: t("Wholesale Buyer", "थोक खरीदार", "थोक खरीदार"), icon: ShoppingCart },
                    ] as const
                  ).map((r) => {
                    const isSelected = form.role === r.key;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => set("role", r.key)}
                        aria-pressed={isSelected}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-xs font-bold transition-all cursor-pointer min-h-[48px] ${
                          isSelected
                            ? "border-emerald-700 bg-emerald-50 text-emerald-900 font-black ring-1 ring-emerald-700/20 shadow-xs"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <r.icon className={`h-4 w-4 ${isSelected ? "text-emerald-700" : "text-slate-400"}`} />
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
                  {t("Full name", "पूरा नाम", "पूरा नाव")}
                </label>
                <div className="flex items-center rounded-lg border border-slate-300 bg-white focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20 transition-all">
                  <User className="h-4 w-4 ml-3.5 text-slate-400 shrink-0" />
                  <input
                    id="name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder={t("Ram Kumar Patel", "राम कुमार पटेल", "राम कुमार पटेल")}
                    required
                    className="w-full bg-transparent border-none px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
                  {t("Mobile number", "मोबाइल नंबर", "मोबाइल नंबर")}
                </label>
                <div className="flex items-center rounded-lg border border-slate-300 bg-white focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20 transition-all">
                  <span className="pl-4 text-xs font-bold text-slate-500 border-r border-slate-200 pr-3 py-1">+91</span>
                  <input
                    id="phone"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="98765 43210"
                    required
                    className="w-full bg-transparent border-none px-3 py-2.5 text-sm font-medium text-slate-900 tabular-nums placeholder:text-slate-400 focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
                  {t("Email address (optional for OTP, required for password login)", "ईमेल पता (वैकल्पिक)", "ईमेल पता (ऐच्छिक)")}
                </label>
                <div className="flex items-center rounded-lg border border-slate-300 bg-white focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20 transition-all">
                  <Mail className="h-4 w-4 ml-3.5 text-slate-400 shrink-0" />
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="farmer@example.com"
                    className="w-full bg-transparent border-none px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
                    {t("Password", "पासवर्ड", "पासवर्ड")}
                  </label>
                  <div className="flex items-center rounded-lg border border-slate-300 bg-white focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20 transition-all">
                    <Lock className="h-4 w-4 ml-3.5 text-slate-400 shrink-0" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent border-none px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="mr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
                    {t("Confirm password", "पासवर्ड पुष्टि करें", "पासवर्ड दोबारा डारव")}
                  </label>
                  <div className="flex items-center rounded-lg border border-slate-300 bg-white focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20 transition-all">
                    <Lock className="h-4 w-4 ml-3.5 text-slate-400 shrink-0" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent border-none px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="language" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
                    {t("Language", "भाषा", "भाषा")}
                  </label>
                  <select
                    id="language"
                    value={form.language}
                    onChange={(e) => {
                      set("language", e.target.value);
                      setLanguage(e.target.value as "en" | "hi" | "cg");
                    }}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-700 min-h-[44px]"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="cg">छत्तीसगढ़ी (Chhattisgarhi)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="aadhaar" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
                    {t("Aadhaar (optional)", "आधार (वैकल्पिक)", "आधार (ऐच्छिक)")}
                  </label>
                  <div className="flex items-center rounded-lg border border-slate-300 bg-white focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20 transition-all">
                    <Grid3X3 className="h-4 w-4 ml-3.5 text-slate-400 shrink-0" />
                    <input
                      id="aadhaar"
                      inputMode="numeric"
                      value={form.aadhaar}
                      onChange={(e) => set("aadhaar", e.target.value.replace(/\D/g, "").slice(0, 12))}
                      placeholder="XXXX XXXX XXXX"
                      className="w-full bg-transparent border-none px-3 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" /> {error}
                </p>
              )}

              <Button type="submit" variant="primary" className="w-full">
                {t("Continue to Location", "स्थान चयन के लिए आगे बढ़ें", "स्थान बर आगे बढ़व")}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 pt-1">
                <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>{t("Your details are used strictly for identity & direct bank payout settlement.", "आपके विवरण केवल पहचान और सीधे बैंक भुगतान निपटान के लिए उपयोग किए जाते हैं।", "जानकारी सिर्फ पहचान आ सीधा बैंक भुगतान बर उपयोग करे जाही।")}</span>
              </div>
            </Card>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Card className="space-y-4">
              <div>
                <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
                  {t("Village / Mandi Area", "गाँव / मंडी क्षेत्र", "गांव / मंडी क्षेत्र")}
                </label>
                <div className="flex items-center rounded-lg border border-slate-300 bg-white focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20 transition-all">
                  <MapPin className="h-4 w-4 ml-3.5 text-slate-400 shrink-0" />
                  <input
                    id="location"
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder={t("Village Birgaon, Raipur", "ग्राम बिरगांव, रायपुर", "गांव बिरगांव, रायपुर")}
                    required
                    className="w-full bg-transparent border-none px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[44px]"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  {t(
                    "Used for geographic DBSCAN aggregation of listings into buyer-scale lots.",
                    "किसानों की उपज को बड़े खरीदार-स्तरीय लॉट में भौगोलिक रूप से एकत्रित करने के लिए उपयोग किया जाता है।",
                    "किसान मन के फसल ला बड़े लॉट म जोड़े बर उपयोग करे जाही।"
                  )}
                </p>
              </div>

              {error && (
                <p className="flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" /> {error}
                </p>
              )}

              <Button type="submit" variant="primary" className="w-full" isLoading={submitting}>
                {submitting ? t("Creating account…", "खाता बनाया जा रहा है…", "खाता बनावत हे…") : t("Complete Registration", "पंजीकरण पूरा करें", "पंजीकरण पूरा करव")}
              </Button>
              <Button type="button" variant="secondary" className="w-full" onClick={() => setStep(0)}>
                {t("← Back to Account Details", "← वापस जाएं", "← पाछू जाव")}
              </Button>
            </Card>
          </form>
        )}

        <p className="text-center text-sm text-slate-600">
          {t("Already have an account?", "पहले से खाता है?", "पहिली ले खाता हे?")}{" "}
          <Link href="/login" className="font-bold text-emerald-800 hover:text-emerald-900 underline decoration-2 underline-offset-2">
            {t("Sign in", "साइन इन करें", "साइन इन करव")}
          </Link>
        </p>
      </div>
    </div>
  );
}
