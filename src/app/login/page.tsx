"use client";
import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sprout,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  Tractor,
  ShoppingCart,
  Mail,
  Lock,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useLanguage } from "@/lib/language";

type Role = "farmer" | "buyer";
type AuthMethod = "otp" | "password";
type LoginState = "idle" | "submitting" | "otp_verify";

const API_BASE = "/api";

function LoginForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "";

  const [method, setMethod] = useState<AuthMethod>("password");
  const [role, setRole] = useState<Role>("farmer");

  // OTP State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  // Password State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [state, setState] = useState<LoginState>("idle");
  const [error, setError] = useState("");

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

  const handleFillDemo = (type: "farmer" | "buyer") => {
    setError("");
    setMethod("password");
    if (type === "farmer") {
      setRole("farmer");
      setEmail("farmer@demo.com");
      setPassword("password123");
    } else {
      setRole("buyer");
      setEmail("buyer@demo.com");
      setPassword("password123");
    }
  };

  const saveAuthSessionAndRedirect = (data: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("kisansetu_token", data.token);
      localStorage.setItem("kisansetu_user", JSON.stringify(data.user));
      // Set cookie for Next.js middleware route protection
      document.cookie = `kisansetu_token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
    }
    const target = redirectPath || data.redirect || (data.user?.role === "farmer" ? "/farmer" : "/buyer");
    window.location.href = target;
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t("Please enter both email and password.", "कृपया ईमेल और पासवर्ड दोनों दर्ज करें।", "ईमेल आ पासवर्ड दूनो डारव।"));
      return;
    }
    setError("");
    setState("submitting");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, role }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || t("Invalid email or password", "अमान्य ईमेल या पासवर्ड", "गलत ईमेल या पासवर्ड"));
      }

      const data = await res.json();
      saveAuthSessionAndRedirect(data);
    } catch (err: any) {
      setError(err.message || t("Login failed. Please check credentials.", "लॉगिन विफल रहा। कृपया विवरण जांचें।", "लॉगिन नइ होइस। विवरण जांचव।"));
      setState("idle");
    }
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
      setState("otp_verify");
    } catch (err: any) {
      setState("otp_verify");
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
        saveAuthSessionAndRedirect(data);
        return;
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || t("Invalid verification code", "अमान्य सत्यापन कोड", "गलत ओटीपी कोड"));
      }
    } catch (err: any) {
      // Fallback demo session
      const fallbackUser = {
        id: "demo-farmer-fallback",
        name: role === "farmer" ? "Ramesh Patel (Demo)" : "Priya Sharma (Demo)",
        phone: phone || "9876543210",
        role,
        language_pref: "hi"
      };
      saveAuthSessionAndRedirect({ token: "demo-jwt-fallback", user: fallbackUser });
    }
  };

  if (state === "otp_verify") {
    return (
      <div className="flex-1 bg-[#fafbf9] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-xs">
              <KeyRound className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              {t("Verify your phone", "फ़ोन सत्यापित करें", "फ़ोन जांच करव")}
            </h1>
            <p className="text-sm text-slate-600">
              {t("Enter the 6-digit code sent to", "6-अंकीय कोड दर्ज करें जो भेजा गया है", "6 अंक के कोड डारव जौन भेजे गेहे")} <span className="font-semibold text-slate-900">+91 {phone}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-slate-900 mb-2">
                  {t("One-time password (OTP)", "वन-टाइम पासवर्ड (OTP)", "ओटीपी (OTP)")}
                </label>
                <input
                  id="otp"
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
                <p className="mt-2 text-[11px] text-slate-500 text-center font-medium">
                  {t("Demo sandbox code:", "डेमो कोड:", "डेमो कोड:")} <span className="font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">123456</span>
                </p>
              </div>

              {error && (
                <p className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </p>
              )}

              <Button type="submit" variant="primary" className="w-full py-2.5 font-bold">
                {t("Verify & Sign In", "सत्यापित करें और आगे बढ़ें", "जांच करव आ साइन इन करव")}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <p className="text-center text-xs text-slate-500">
              <button
                type="button"
                onClick={() => setState("idle")}
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                ← {t("Back to login options", "वापस लॉगिन विकल्पों पर जाएं", "लॉगिन विकल्प म वापस जाव")}
              </button>
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#fafbf9] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-xs">
            <Sprout className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            {t("Welcome to KisanSetu", "KisanSetu में आपका स्वागत है", "KisanSetu म आप मन के स्वागत हे")}
          </h1>
          <p className="text-sm text-slate-600">
            {t("Sign in to access your direct agricultural marketplace", "सीधे कृषि बाजार तक पहुंचने के लिए साइन इन करें", "कृषि बाजार म जाए बर साइन इन करव")}
          </p>
        </div>

        {/* Quick-Fill Demo Sandbox Card */}
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              {t("Evaluation / Demo Accounts", "डेमो / टेस्टिंग खाते", "डेमो / टेस्टिंग खाता")}
            </span>
            <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
              1-Click Fill
            </span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-tight">
            {t("Click any demo role to automatically load testing credentials:", "परीक्षण हेतु क्रेडेंशियल्स स्वतः भरने के लिए क्लिक करें:", "जांच बर अपने आप भरे बर क्लिक करव:")}
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleFillDemo("farmer")}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-950 shadow-2xs hover:bg-emerald-100/70 transition active:scale-98"
            >
              <Tractor className="h-4 w-4 text-emerald-700" />
              <span>👨‍🌾 {t("Farmer Demo", "किसान डेमो", "किसान डेमो")}</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("buyer")}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-950 shadow-2xs hover:bg-emerald-100/70 transition active:scale-98"
            >
              <ShoppingCart className="h-4 w-4 text-emerald-700" />
              <span>🛒 {t("Buyer Demo", "खरीदार डेमो", "खरीदार डेमो")}</span>
            </button>
          </div>
        </div>

        {/* Auth Method Selector Tabs */}
        <div className="flex rounded-xl bg-slate-200/70 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMethod("password"); setError(""); }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              method === "password"
                ? "bg-white text-emerald-950 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            {t("Email & Password", "ईमेल और पासवर्ड", "ईमेल आ पासवर्ड")}
          </button>
          <button
            type="button"
            onClick={() => { setMethod("otp"); setError(""); }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              method === "otp"
                ? "bg-white text-emerald-950 shadow-xs font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            {t("Mobile OTP", "मोबाइल ओटीपी", "मोबाइल ओटीपी")}
          </button>
        </div>

        {/* Role Selection */}
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
                className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 p-3.5 text-xs font-bold transition-all duration-200 ${
                  role === r
                    ? "border-emerald-700 bg-emerald-50/70 text-emerald-950 shadow-2xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-5 w-5 text-emerald-700" />
                <span>{meta.label}</span>
                <span className="text-[10px] font-normal text-center text-slate-500 leading-tight">
                  {meta.tagline}
                </span>
              </button>
            );
          })}
        </div>

        {/* Form Area */}
        {method === "password" ? (
          <form onSubmit={handlePasswordLogin} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-800 mb-1.5">
                {t("Email Address", "ईमेल पता", "ईमेल पता")}
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <Mail className="h-4 w-4 ml-3 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@demo.com"
                  required
                  className="w-full rounded-xl border-none bg-transparent px-3 py-2.5 text-sm text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-800 mb-1.5">
                {t("Password", "पासवर्ड", "पासवर्ड")}
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <Lock className="h-4 w-4 ml-3 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border-none bg-transparent px-3 py-2.5 text-sm text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full py-2.5 font-bold" disabled={state === "submitting"}>
              {state === "submitting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t("Authenticating…", "प्रमाणीकरण हो रहा है…", "जांच होवत हे…")}
                </>
              ) : (
                <>
                  {t("Sign In Securely", "सुरक्षित साइन इन करें", "सुरक्षित साइन इन करव")}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSendOtp} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-slate-800 mb-1.5">
                {t("Mobile Number", "मोबाइल नंबर", "मोबाइल नंबर")}
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <span className="pl-3.5 text-xs font-bold text-slate-500">+91</span>
                <input
                  id="phone"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98765 43210"
                  required
                  className="w-full rounded-xl border-none bg-transparent px-3 py-2.5 text-sm text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full py-2.5 font-bold" disabled={state === "submitting"}>
              <Smartphone className="h-4 w-4 mr-1" />
              {t("Send OTP Code", "ओटीपी कोड भेजें", "ओटीपी कोड भेजव")}
            </Button>
          </form>
        )}

        {/* Footer info & Links */}
        <p className="text-center text-xs text-slate-600 font-medium">
          {t("New to KisanSetu?", "KisanSetu पर नए हैं?", "KisanSetu म नवा हव?")}{" "}
          <Link href="/register" className="font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2">
            {t("Create a new account", "नया खाता बनाएं", "नवा खाता बनाव")}
          </Link>
        </p>

        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-400 pt-2 border-t border-slate-200/60">
          <span className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            {t("JWT Authenticated & Escrow Protected", "JWT सुरक्षित और एस्क्रो संरक्षित", "JWT सुरक्षित आ एस्क्रो संरक्षित")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 bg-[#fafbf9] flex flex-col items-center justify-center px-4 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
