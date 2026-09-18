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
  LogOut,
  Check,
  TrendingUp,
  Layers,
  Scale,
  Sparkles,
  Award,
  Smartphone,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";

interface NavItem {
  href: string;
  label: string;
  labelHi?: string;
  labelCg?: string;
  icon?: any;
}

// Links shown when user is NOT logged in
const PUBLIC_NAV: NavItem[] = [
  { href: "/pricing", label: "Dynamic Pricing", labelHi: "डायनामिक मूल्य", labelCg: "भाव इंजन", icon: TrendingUp },
  { href: "/buyer", label: "Wholesale Marketplace", labelHi: "थोक बाजार", labelCg: "थोक बाजार", icon: Store },
  { href: "/#how-it-works", label: "Mandi Comparison", labelHi: "मंडी तुलना", labelCg: "मंडी तुलना", icon: Scale },
];

// Role-specific navigation items
const FARMER_NAV: NavItem[] = [
  { href: "/farmer", label: "Sell Produce", labelHi: "फसल दर्ज करें", labelCg: "फसल बेचंव", icon: Sprout },
  { href: "/pricing", label: "Dynamic Pricing", labelHi: "डायनामिक मूल्य", labelCg: "भाव इंजन", icon: TrendingUp },
  { href: "/orders", label: "Pickup & Logistics", labelHi: "पिकअप और वाहन", labelCg: "पिकअप आ गाड़ी", icon: LayoutDashboard },
  { href: "/earnings", label: "Earnings & UPI", labelHi: "कमाई और UPI", labelCg: "कमाई आ पइसा", icon: Wallet },
];

const BUYER_NAV: NavItem[] = [
  { href: "/buyer", label: "Wholesale Lots", labelHi: "थोक लॉट बाजार", labelCg: "थोक लॉट बाजार", icon: Store },
  { href: "/pricing", label: "Dynamic Pricing", labelHi: "डायनामिक मूल्य", labelCg: "भाव इंजन", icon: TrendingUp },
  { href: "/orders", label: "Orders & Escrow", labelHi: "ऑर्डर और एस्क्रो", labelCg: "ऑर्डर आ एस्क्रो", icon: LayoutDashboard },
];

const LANGUAGES = [
  { code: "en", label: "English", sub: "Default" },
  { code: "hi", label: "हिन्दी", sub: "Hindi" },
  { code: "cg", label: "छत्तीसगढ़ी", sub: "Chhattisgarhi" },
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
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
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

  // Allow MobileBottomBar "Options" button to open the drawer
  useEffect(() => {
    const toggle = () => setMobileMenuOpen((prev) => !prev);
    window.addEventListener("toggle-mobile-drawer", toggle);
    return () => window.removeEventListener("toggle-mobile-drawer", toggle);
  }, []);

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

  const activeNavItems = !user
    ? PUBLIC_NAV
    : user.role === "buyer"
    ? BUYER_NAV
    : FARMER_NAV;

  const isFarmer = user?.role === "farmer";
  const isBuyer = user?.role === "buyer";

  return (
    <nav aria-label="Primary Navigation" className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
      {/* Desktop navigation links */}
      <div className="hidden md:flex items-center gap-1">
        {activeNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`text-xs lg:text-sm font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive
                  ? isBuyer
                    ? "bg-blue-50 text-blue-900 font-bold border border-blue-200 shadow-2xs"
                    : "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent"
              }`}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-500" />}
              <span>{getLabel(item)}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2 relative">
        {/* Role badge if logged in */}
        {user && (
          <span
            className={`hidden sm:inline-flex text-[11px] font-bold uppercase tracking-tight px-2.5 py-1 rounded-md border ${
              isBuyer ? "bg-blue-50 text-blue-900 border-blue-200" : "bg-emerald-50 text-emerald-900 border-emerald-200"
            }`}
          >
            {isBuyer ? "Buyer Mode" : "Farmer Mode"}
          </span>
        )}

        {/* Language selector */}
        <div className="relative">
          <button
            type="button"
            aria-label="Language selector"
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-slate-800 bg-white text-xs font-semibold border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-[11px] uppercase font-bold tracking-wide">
              {language === "hi" ? "हिन्दी" : language === "cg" ? "छ.ग." : "EN"}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 ml-0.5" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                {t("Select Language", "भाषा चुनें", "भाषा चुनव")}
              </p>
              <div className="mt-1 space-y-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      language === lang.code
                        ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs">{lang.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{lang.sub}</span>
                    </div>
                    {language === lang.code && <Check className="h-4 w-4 text-emerald-700 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Login / Profile button */}
        {user ? (
          <div className="flex items-center gap-1.5">
            <Link
              href="/profile"
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
            >
              <CircleUser className="h-4 w-4 text-slate-600" />
              <span className="hidden sm:inline max-w-[110px] truncate">{user.name || t("Account", "खाता", "खाता")}</span>
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("kisansetu_token");
                localStorage.removeItem("kisansetu_user");
                document.cookie = "kisansetu_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                window.location.href = "/login";
              }}
              className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer"
              title={t("Logout", "लॉग आउट", "लॉग आउट")}
            >
              <LogOut className="h-3.5 w-3.5 text-rose-700" />
              <span className="hidden sm:inline">{t("Logout", "लॉग आउट", "लॉग आउट")}</span>
            </button>
          </div>
        ) : (
          <Link href="/login">
            <Button size="sm" variant="primary" className="h-9 px-3.5 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg">
              <LogIn className="h-3.5 w-3.5 mr-1" /> {t("Sign In / Register", "साइन इन / रजिस्टर", "साइन इन / रजिस्टर")}
            </Button>
          </Link>
        )}

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 transition-colors hover:bg-slate-50 shadow-2xs"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-[210] w-80 max-w-[85vw] bg-white border-l border-slate-200 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold">
                    <Sprout className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-black text-slate-900 text-lg">KisanSetu</span>
                    <span className="text-[10px] text-slate-500 font-medium">Direct Agri Marketplace</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {user && (
                <div>
                  <Badge variant={isBuyer ? "buyer" : "farmer"} size="md" className="w-full justify-center py-1.5">
                    {isBuyer ? "Buyer Mode Active" : "Farmer Mode Active"}
                  </Badge>
                </div>
              )}

              <div className="space-y-1.5">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("Navigation", "नेविगेशन", "नेविगेशन")}
                </p>
                {activeNavItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  const Icon = item.icon || Store;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-semibold transition-colors min-h-[44px] ${
                        isActive
                          ? isBuyer
                            ? "bg-blue-50 text-blue-900 font-bold border border-blue-200"
                            : "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? (isBuyer ? "text-blue-800" : "text-emerald-800") : "text-slate-400"}`} />
                      <span>{getLabel(item)}</span>
                    </Link>
                  );
                })}

                {/* Minimal PWA App Install option */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("open-pwa-install"));
                    }
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200 transition-colors min-h-[44px] cursor-pointer mt-2"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-emerald-700" />
                    <span>{t("Install Mobile App", "मोबाइल ऐप इंस्टॉल करें", "मोबाइल ऐप डालव")}</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-200/70 text-emerald-900">
                    PWA
                  </span>
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-5 space-y-4">
              <div className="space-y-2">
                <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t("Language Selection:", "भाषा चयन:", "भाषा चुनव:")}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex flex-col items-center justify-center rounded-lg border py-2 text-xs font-semibold transition-colors cursor-pointer min-h-[44px] ${
                        language === lang.code
                          ? "bg-emerald-800 text-white border-emerald-900"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-bold">{lang.label}</span>
                      <span className="text-[9px] opacity-80">{lang.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
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
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 py-3 text-xs font-bold text-rose-800 hover:bg-rose-100 transition-colors min-h-[44px] cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  {t("Sign Out", "लॉग आउट करें", "लॉग आउट करव")} ({user.name || "User"})
                </button>
              ) : (
                <Link href="/login" className="w-full block">
                  <Button variant="primary" className="w-full justify-center bg-emerald-800 hover:bg-emerald-900 text-white min-h-[44px]">
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
