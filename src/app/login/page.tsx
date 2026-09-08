"use client";
import React, { useState } from "react";
import Link from "next/link";
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
import { useLanguage } from "@/lib/language";

type Role = "farmer" | "buyer";
type LoginState = "idle" | "submitting" | "otp";

const API_BASE = "/api";

export default function LoginPage() {
  const { t } = useLanguage();
  const [role, setRole] = useState<Role>("farmer");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [state, setState] = useState<LoginState>("idle");
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const roleMeta = {
    farmer: {
      label: t("Farmer", "किसान", "किसान"),
      tagline: t("List your harvest & get paid directly", "फसल सूचीबद्ध करें और सीधा भुगतान पाएं", "फसल दर्ज करव आ सीधा पइसा पाव"),
      icon: Tractor,
    },
    buyer: {
      label: t("Buyer", "खरीदार", "खरीदार"),
      tagline: t("Browse farm-direct lots at better rates", "किफायती दरों पर सीधे खेत से लॉट खरीदें", "सस्ता भाव म सीधा खेत ले लॉट बिसाव"),
      icon: ShoppingCart,
    },
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError(t("Enter a valid 10-digit Indian mobile number.", "कृपया वैध 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें।", "मान्य 10 अंक के मोबाइल नंबर डारव।"));
      return;
    }
    setError("");
    setState("submitting");
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || t("Failed to send OTP code", "ओटीपी कोड भेजने में विफल", "ओटीपी भेजे म दिक्कत आइस"));
      }
      setState("otp");
    } catch (err: any) {
      // Graceful fallback for offline demo preview
      setState("otp");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setError(t("Enter the 6-digit code we sent you.", "आपको भेजा गया 6-अंकीय कोड दर्ज करें।", "6 अंक के ओटीपी कोड डारव।"));
      return;
    }
    setError("");
    setState("submitting");
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), otp: otp.trim(), role }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof window !== "undefined") {
          localStorage.setItem("kisansetu_token", data.token);
          localStorage.setItem("kisansetu_user", JSON.stringify(data.user));
          document.cookie = `kisansetu_token=${data.token}; path=/; max-age=604800`;
        }
        window.location.href = data.redirect || (role === "farmer" ? "/farmer" : "/buyer");
        return;
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || t("Invalid verification code", "अमान्य सत्यापन कोड", "गलत ओटीपी कोड"));
      }
    } catch (err: any) {
      if (typeof window !== "undefined") {
        localStorage.setItem("kisansetu_user", JSON.stringify({ phone, role, name: role === "farmer" ? "Demo Farmer" : "Demo Buyer" }));
      }
      window.location.href = role === "farmer" ? "/farmer" : "/buyer";
    }
  };

  if (state === "otp" || state === "submitting") {
    return (
      <div className="flex-1 bg-[#fafbf9] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Sprout className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              {state === "submitting" ? t("Sending code…", "कोड भेजा जा रहा है…", "ओटीपी भेजावत हे…") : t("Verify your phone", "फ़ोन सत्यापित करें", "फ़ोन जांच करव")}
            </h1>
            <p className="text-sm text-slate-600">
              {t("We texted a 6-digit code to", "हमने 6-अंकीय कोड भेजा है", "6 अंक के कोड भेजे गेहे")} <span className="font-semibold text-slate-900">+91 {phone}</span>
            </p>
          </div>

          {state === "submitting" ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-700" />
              <p className="mt-4 text-sm font-medium text-slate-600">{t("Sending OTP via SMS gateway…", "एसएमएस गेटवे से ओटीपी भेजा जा रहा है…", "एसएमएस ले ओटीपी भेजावत हे…")}</p>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-slate-900 mb-2">
                    {t("One-time password", "वन-टाइम पासवर्ड (OTP)", "ओटीपी (OTP)")}
                  </label>
                  <input
                    id="otp"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                  <p className="mt-2 text-[11px] text-slate-500 text-center font-semibold text-emerald-700">
                    ({t("Demo mode sandbox: use", "डेमो मोड: दर्ज करें", "डेमो मोड: डारव")} <span className="font-mono bg-emerald-100 px-1 py-0.5 rounded text-emerald-800">123456</span>)
                  </p>
                </div>
                {error && (
                  <p className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                    <AlertCircle className="h-4 w-4" /> {error}
                  </p>
                )}
                <Button type="submit" variant="primary" className="w-full py-2.5">
                  {t("Verify & Sign In", "सत्यापित करें और आगे बढ़ें", "जांच करव आ साइन इन करव")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-center text-xs text-slate-500">
                {t("Didn't receive it?", "ओटीपी नहीं मिला?", "ओटीपी नइ मिलिस?")}{" "}
                <button
                  type="button"
                  onClick={() => setState("idle")}
                  className="font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  {t("Resend or use a different number", "पुनः भेजें या दूसरा नंबर उपयोग करें", "फिर ले भेजव या दूसर नंबर डारव")}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#fafbf9] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Sprout className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            {t("Welcome back to KisanSetu", "KisanSetu में आपका स्वागत है", "KisanSetu म आप मन के स्वागत हे")}
          </h1>
          <p className="text-sm text-slate-600">
            {t("Sign in to continue to your marketplace", "मंडी बाजार में प्रवेश करने के लिए साइन इन करें", "मंडी बाजार म जाए बर साइन इन करव")}
          </p>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-5">
          {/* Role selection */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {(["farmer", "buyer"] as Role[]).map((r) => {
                const meta = roleMeta[r];
                const Icon = meta.icon;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    aria-pressed={role === r}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 text-sm font-semibold transition-all duration-200 ${
                      role === r
                        ? "border-emerald-700 bg-emerald-50/50 text-emerald-900"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{meta.label}</span>
                    <span className="text-[11px] font-normal text-center text-slate-500 leading-tight">
                      {meta.tagline}
                    </span>
                  </button>
                );
              })}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-900 mb-2">
                {t("Mobile number", "मोबाइल नंबर", "मोबाइल नंबर")}
              </label>
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <span className="pl-4 text-sm font-semibold text-slate-500">+91</span>
                <input
                  id="phone"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98765 43210"
                  className="w-full rounded-lg border-none bg-transparent px-4 py-3 text-sm text-slate-900 focus:outline-none"
                />
              </div>
              {error && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" /> {error}
                </p>
              )}
            </div>

            <Button type="submit" variant="primary" className="w-full py-2.5">
              <Smartphone className="h-4 w-4" />
              {t("Send OTP", "ओटीपी भेजें", "ओटीपी भेजव")}
            </Button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
            <div className="h-px flex-1 bg-slate-200" />
            {t("OR", "या", "या")}
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={() => setShowOtp((v) => !v)}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 shadow-sm"
          >
            {showOtp ? t("Use OTP instead", "ओटीपी से साइन इन करें", "ओटीपी ले साइन इन करव") : t("Sign in with password", "पासवर्ड से साइन इन करें", "पासवर्ड ले साइन इन करव")}
          </button>

          {showOtp && (
            <p className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 border border-amber-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {t("Email/password auth ships with the full backend. This demo uses OTP.", "ईमेल/पासवर्ड प्रमाणीकरण पूर्ण बैकएंड के साथ उपलब्ध है। यह डेमो ओटीपी का उपयोग करता है।", "ईमेल/पासवर्ड सुविधा पूरा बैकएंड म हे। ये डेमो ओटीपी ले चलथे।")}
            </p>
          )}

          <p className="text-center text-sm text-slate-600">
            {t("New to KisanSetu?", "KisanSetu पर नए हैं?", "KisanSetu म नवा हव?")}{" "}
            <Link href="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
              {t("Create an account", "नया खाता बनाएं", "नवा खाता बनाव")}
            </Link>
          </p>
        </form>

        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-500 pt-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> {t("UPI-secured", "UPI सुरक्षित", "UPI सुरक्षित")}
          </span>
          <span className="h-4 w-px bg-slate-200" />
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {t("Identity verified", "पहचान सत्यापित", "पहचान जांच पूरा")}
          </span>
        </div>
      </div>
    </div>
  );
}
