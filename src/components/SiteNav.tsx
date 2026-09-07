"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  CircleUser,
  Check,
  ChevronDown,
  LogIn,
  UserPlus,
  Compass,
  Wallet,
  LifeBuoy,
  Menu,
  X,
  Store,
  Sprout,
  LayoutDashboard,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Mic,
  ScanLine,
  TrendingUp,
  Receipt,
  Truck,
  Activity,
  FileText,
  BadgeCheck,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon?: any;
  sublabel?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/buyer", label: "Marketplace", icon: Store, sublabel: "B2B Produce Catalog" },
  { href: "/farmer", label: "Sell Produce", icon: Sprout, sublabel: "AI-Assisted Listing" },
  { href: "/orders", label: "Dashboard", icon: LayoutDashboard, sublabel: "Logistics Control Room" },
  { href: "/earnings", label: "Earnings", icon: Wallet, sublabel: "UPI Escrow Payouts" },
];

const LANGUAGES = [
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "cg", label: "छत्तीसगढ़ी (Chhattisgarhi)" },
  { code: "en", label: "English" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [selectedLang, setSelectedLang] = useState("hi");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<"farmer" | "buyer" | "logistics">("farmer");

  // Listen to mobile bottom bar toggle event
  useEffect(() => {
    const handleToggle = () => {
      setMobileMenuOpen((prev) => !prev);
    };
    window.addEventListener("toggle-mobile-drawer", handleToggle);
    return () => {
      window.removeEventListener("toggle-mobile-drawer", handleToggle);
    };
  }, []);

  // Close drawer on path change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <nav
      aria-label="Primary"
      className="flex flex-1 items-center justify-end gap-2 sm:gap-6"
    >
      {/* Desktop navigation links */}
      <div className="hidden md:flex items-center gap-6">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative py-1 text-[13px] font-bold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-sm ${
                isActive
                  ? "text-emerald-900 font-black"
                  : "text-slate-600 hover:text-emerald-900"
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-emerald-700 animate-scale-up" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 relative">
        {/* Language selector */}
        <div className="relative">
          <button
            type="button"
            aria-label="Language selector"
            onClick={() => {
              setShowLangMenu(!showLangMenu);
              setShowAccountMenu(false);
            }}
            className="flex items-center gap-1 h-9 px-2 sm:px-3 rounded-full text-slate-700 transition-colors hover:bg-slate-100 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 text-xs font-bold border border-slate-200"
          >
            <Globe className="h-4 w-4 text-emerald-700" />
            <span className="hidden sm:inline uppercase text-[11px] font-bold">{selectedLang}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Select Language
              </div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                    selectedLang === lang.code
                      ? "bg-emerald-50 font-bold text-emerald-800"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{lang.label}</span>
                  {selectedLang === lang.code && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Account selector (Desktop) */}
        <div className="relative hidden sm:block">
          <button
            type="button"
            aria-label="Account options"
            onClick={() => {
              setShowAccountMenu(!showAccountMenu);
              setShowLangMenu(false);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 hover:text-emerald-800 border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
          >
            <CircleUser className="h-5 w-5" />
          </button>

          {showAccountMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-2.5 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Account & Portals
              </div>

              <div className="space-y-0.5 px-1 py-1">
                <Link
                  href="/login"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-emerald-900"
                >
                  <LogIn className="h-4 w-4 shrink-0 text-slate-400" />
                  Sign In / Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-emerald-900"
                >
                  <UserPlus className="h-4 w-4 shrink-0 text-slate-400" />
                  Register New User
                </Link>
                <Link
                  href="/onboarding"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-emerald-900"
                >
                  <Compass className="h-4 w-4 shrink-0 text-slate-400" />
                  Onboarding Guide
                </Link>
              </div>

              <div className="mx-2 my-1 h-px bg-slate-100" />

              <div className="space-y-0.5 px-1 py-1">
                <Link
                  href="/earnings"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-50"
                >
                  <Wallet className="h-4 w-4 shrink-0 text-emerald-700" />
                  Farmer Earnings & Payouts
                </Link>
                <Link
                  href="/support"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <LifeBuoy className="h-4 w-4 shrink-0 text-slate-400" />
                  Help & FAQ
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-800 transition-colors hover:bg-slate-100 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 active:scale-95"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Comprehensive Mobile Options & Function Hub (Slide Bar Drawer) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sidebar */}
          <div className="fixed inset-y-0 right-0 z-[210] w-[88vw] max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250">
            <div>
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-950 text-white">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-white font-black text-base shadow">
                    🌾
                  </span>
                  <div>
                    <p className="font-display font-black text-sm text-white">KisanSetu Hub</p>
                    <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">All Options & Tools</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Role Switcher Pill */}
              <div className="p-3 bg-slate-50 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 px-1">Switch Portal Mode</p>
                <div className="flex rounded-xl bg-slate-200/70 p-1 gap-1">
                  <button
                    onClick={() => setActiveRole("farmer")}
                    className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
                      activeRole === "farmer" ? "bg-emerald-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    👨‍🌾 Farmer
                  </button>
                  <button
                    onClick={() => setActiveRole("buyer")}
                    className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
                      activeRole === "buyer" ? "bg-emerald-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🏢 Buyer
                  </button>
                  <button
                    onClick={() => setActiveRole("logistics")}
                    className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
                      activeRole === "logistics" ? "bg-emerald-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🚚 Logistics
                  </button>
                </div>
              </div>

              {/* Quick Agtech Tools Grid (Bento) */}
              <div className="p-4 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pb-2 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Quick Agtech Tools
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/farmer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col gap-1 rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 transition active:scale-95"
                  >
                    <div className="flex items-center justify-between">
                      <Mic className="h-4 w-4 text-emerald-700" />
                      <span className="rounded-full bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2">VOICE</span>
                    </div>
                    <p className="text-xs font-bold text-emerald-950 mt-1">Bhashini Voice</p>
                    <p className="text-[10px] text-emerald-700 font-medium leading-tight">Speak to list crops</p>
                  </Link>

                  <Link
                    href="/farmer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col gap-1 rounded-xl bg-amber-50 border border-amber-100 p-2.5 transition active:scale-95"
                  >
                    <div className="flex items-center justify-between">
                      <ScanLine className="h-4 w-4 text-amber-700" />
                      <span className="rounded-full bg-amber-600 text-white text-[9px] font-black px-1.5 py-0.2">AI VISION</span>
                    </div>
                    <p className="text-xs font-bold text-amber-950 mt-1">AI Grader</p>
                    <p className="text-[10px] text-amber-700 font-medium leading-tight">Scan produce quality</p>
                  </Link>

                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col gap-1 rounded-xl bg-blue-50 border border-blue-100 p-2.5 transition active:scale-95"
                  >
                    <div className="flex items-center justify-between">
                      <Truck className="h-4 w-4 text-blue-700" />
                      <span className="rounded-full bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.2">GIS</span>
                    </div>
                    <p className="text-xs font-bold text-blue-950 mt-1">Route Engine</p>
                    <p className="text-[10px] text-blue-700 font-medium leading-tight">1-trip clustered loop</p>
                  </Link>

                  <Link
                    href="/earnings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col gap-1 rounded-xl bg-purple-50 border border-purple-100 p-2.5 transition active:scale-95"
                  >
                    <div className="flex items-center justify-between">
                      <Receipt className="h-4 w-4 text-purple-700" />
                      <span className="rounded-full bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.2">UPI</span>
                    </div>
                    <p className="text-xs font-bold text-purple-950 mt-1">UPI Receipts</p>
                    <p className="text-[10px] text-purple-700 font-medium leading-tight">Instant settlements</p>
                  </Link>
                </div>
              </div>

              {/* Primary Navigation Links */}
              <div className="p-4 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 pb-1">Core Modules</p>
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  const Icon = item.icon || Store;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                        isActive
                          ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/10 font-extrabold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-emerald-700"}`} />
                      <div className="flex-1">
                        <p className="leading-tight">{item.label}</p>
                        <p className={`text-[11px] font-normal ${isActive ? "text-emerald-100" : "text-slate-400"}`}>
                          {item.sublabel}
                        </p>
                      </div>
                      <ArrowRight className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-300"}`} />
                    </Link>
                  );
                })}
              </div>

              {/* Account, Portals & Support Shortcuts */}
              <div className="px-4 py-2 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 pb-1">Portals & Settings</p>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <LogIn className="h-4 w-4 text-slate-400" />
                  Sign In / Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <UserPlus className="h-4 w-4 text-slate-400" />
                  Register New Account
                </Link>
                <Link
                  href="/onboarding"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Compass className="h-4 w-4 text-slate-400" />
                  Interactive Onboarding Tour
                </Link>
                <Link
                  href="/support"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  <LifeBuoy className="h-4 w-4 text-slate-400" />
                  Help Center, Support & Mandi FAQ
                </Link>
              </div>

              {/* Language Selector in Drawer */}
              <div className="p-4 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Change Language / भाषा बदलें</p>
                <div className="flex gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLang(lang.code)}
                      className={`flex-1 py-2 px-2 text-center text-xs rounded-xl font-bold border transition ${
                        selectedLang === lang.code
                          ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      {lang.label.split(" (")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer info */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/90 pb-8">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> SIH 2026 • PS 26033
                </span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 font-black border border-emerald-300">
                  APMC LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Direct Farm-to-Buyer Aggregation &amp; Escrow Platform
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
