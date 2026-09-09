"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/language";
import {
  Globe,
  CircleUser,
  Menu,
  X,
  Store,
  Sprout,
  LayoutDashboard,
  Wallet,
  ChevronDown,
  LogIn,
  Check,
  Sparkles,
  Zap,
  TrendingUp,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui";

interface NavItem {
  href: string;
  label: string;
  labelHi?: string;
  labelCg?: string;
  icon?: any;
}

// Public links shown when user is NOT logged in
const PUBLIC_NAV: NavItem[] = [
  { href: "/#features", label: "Features", labelHi: "सुविधाएं", labelCg: "सुविधा", icon: Sparkles },
  { href: "/#how-it-works", label: "How It Works", labelHi: "कैसे काम करता है", labelCg: "कसे काम करत हे", icon: Zap },
  { href: "/#savings", label: "Savings", labelHi: "बचत", labelCg: "बचत", icon: TrendingUp },
  { href: "/about", label: "About", labelHi: "हमारे बारे में", labelCg: "हमर बारे मं", icon: Globe2 },
];

// Internal dashboard links shown when user IS logged in
const DASHBOARD_NAV: NavItem[] = [
  { href: "/buyer", label: "Marketplace", labelHi: "मंडी बाजार", labelCg: "बाजार", icon: Store },
  { href: "/farmer", label: "Sell Produce", labelHi: "फसल बेचें", labelCg: "फसल बेचंव", icon: Sprout },
  { href: "/orders", label: "Logistics", labelHi: "लॉजिस्टिक्स", labelCg: "लॉजिस्टिक्स", icon: LayoutDashboard },
  { href: "/earnings", label: "Earnings", labelHi: "कमाई और भुगतान", labelCg: "कमाई आ भुगतान", icon: Wallet },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "cg", label: "छत्तीसगढ़ी (Chhattisgarhi)" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kisansetu_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      // Ignore
    }
  }, [pathname]);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as "en" | "hi" | "cg");
    setShowLangMenu(false);
  };

  const getLabel = (item: NavItem) => {
    if (language === "hi") return item.labelHi || item.label;
    if (language === "cg") return item.labelCg || item.labelHi || item.label;
    return item.label;
  };

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

  const activeNavItems = user ? DASHBOARD_NAV : PUBLIC_NAV;

  return (
    <nav aria-label="Primary" className="flex flex-1 items-center justify-end gap-2 sm:gap-6">
      {/* Desktop navigation links */}
      <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
        {activeNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`text-xs lg:text-sm font-bold px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                isActive
                  ? "bg-emerald-100/90 text-emerald-950 font-extrabold shadow-xs"
                  : "text-slate-600 hover:text-emerald-800 hover:bg-slate-100/80"
              }`}
            >
              {getLabel(item)}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2 relative">
        {/* Language selector */}
        <div className="relative">
          <button
            type="button"
            aria-label="Language selector"
            onClick={() => {
              setShowLangMenu(!showLangMenu);
            }}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-slate-700 bg-white/90 hover:bg-emerald-50 hover:text-emerald-900 text-xs font-bold border border-slate-200 shadow-2xs transition-all"
          >
            <Globe className="h-3.5 w-3.5 text-emerald-700" />
            <span className="text-[11px] uppercase font-black">{language}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-popover z-50 animate-in fade-in zoom-in-95 duration-150">
              <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {t("Select Language", "भाषा चुनें", "भाषा चुनव")}
              </p>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                    language === lang.code
                      ? "bg-emerald-50 text-emerald-900 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{lang.label}</span>
                  {language === lang.code && <Check className="h-3.5 w-3.5 text-emerald-700" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Login / Profile button */}
        {user ? (
          <div className="flex items-center gap-1.5">
            <Link
              href="/profile"
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 text-xs font-bold shadow-2xs transition-all"
            >
              <CircleUser className="h-4 w-4 text-emerald-700" />
              <span className="hidden sm:inline max-w-[100px] truncate">{user.name || t("My Account", "मेरा खाता", "मोर खाता")}</span>
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("kisansetu_token");
                localStorage.removeItem("kisansetu_user");
                document.cookie = "kisansetu_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                window.location.href = "/login";
              }}
              className="h-9 px-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:text-red-600 text-xs font-bold shadow-2xs transition-all"
              title={t("Logout", "लॉग आउट", "लॉग आउट")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link href="/login">
            <Button size="sm" variant="primary" className="h-9 px-3.5 text-xs font-bold rounded-xl shadow-xs">
              <LogIn className="h-3.5 w-3.5 mr-1" /> {t("Sign In", "साइन इन", "साइन इन")}
            </Button>
          </Link>
        )}

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 shadow-2xs"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-[210] w-72 bg-white shadow-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold">
                    🌾
                  </div>
                  <span className="font-display font-black text-emerald-950 text-lg">KisanSetu</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-1.5 mb-6">
                {activeNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon || Store;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all ${
                        isActive
                          ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
                      <span>{getLabel(item)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center justify-between px-2 text-xs text-slate-500 font-semibold">
                <span>{t("Language:", "भाषा:", "भाषा:")}</span>
                <span className="font-bold text-slate-800 uppercase">{language}</span>
              </div>
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("kisansetu_token");
                    localStorage.removeItem("kisansetu_user");
                    document.cookie = "kisansetu_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    window.location.href = "/login";
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-bold text-red-700 shadow-2xs hover:bg-red-100 transition-all"
                >
                  <X className="h-4 w-4" />
                  {t("Sign Out", "लॉग आउट करें", "लॉग आउट करव")} ({user.name || "User"})
                </button>
              ) : (
                <Link href="/login" className="w-full block">
                  <Button variant="primary" className="w-full justify-center rounded-xl shadow-sm">
                    <LogIn className="h-4 w-4 mr-2" />
                    {t("Sign In / Register", "साइन इन / रजिस्टर", "साइन इन / रजिस्टर")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
