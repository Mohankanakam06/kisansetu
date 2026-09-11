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
  Sparkles,
  Zap,
  TrendingUp,
  Globe2,
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
  { href: "/#features", label: "Features", labelHi: "सुविधाएं", labelCg: "सुविधा", icon: Sparkles },
  { href: "/#how-it-works", label: "How It Works", labelHi: "कैसे काम करता है", labelCg: "कसे काम करत हे", icon: Zap },
  { href: "/#savings", label: "Savings", labelHi: "बचत", labelCg: "बचत", icon: TrendingUp },
  { href: "/about", label: "About", labelHi: "हमारे बारे में", labelCg: "हमर बारे मं", icon: Globe2 },
];

// Role-specific navigation items
const FARMER_NAV: NavItem[] = [
  { href: "/farmer", label: "Sell Produce", labelHi: "फसल बेचें", labelCg: "फसल बेचंव", icon: Sprout },
  { href: "/orders", label: "Logistics", labelHi: "लॉजिस्टिक्स", labelCg: "लॉजिस्टिक्स", icon: LayoutDashboard },
  { href: "/earnings", label: "Earnings", labelHi: "कमाई और भुगतान", labelCg: "कमाई आ भुगतान", icon: Wallet },
];

const BUYER_NAV: NavItem[] = [
  { href: "/buyer", label: "Marketplace", labelHi: "मंडी बाजार", labelCg: "बाजार", icon: Store },
  { href: "/orders", label: "My Orders", labelHi: "मेरे ऑर्डर", labelCg: "मोर ऑर्डर", icon: LayoutDashboard },
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

  const activeNavItems = !user
    ? PUBLIC_NAV
    : user.role === "buyer"
    ? BUYER_NAV
    : FARMER_NAV;

  const isFarmer = user?.role === "farmer";
  const isBuyer = user?.role === "buyer";

  return (
    <nav aria-label="Primary" className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
      {/* Desktop navigation links */}
      <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
        {activeNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`text-xs lg:text-sm font-bold px-3 py-1.5 rounded-sm border-2 transition-all ${
                isActive
                  ? isBuyer
                    ? "bg-[#1B4965] text-white border-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C]"
                    : "bg-[#C04A22] text-white border-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C]"
                  : "border-transparent text-[#1E1F1C] hover:border-[#1E1F1C] hover:bg-[#E2E4DE]"
              }`}
            >
              {getLabel(item)}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2 relative">
        {/* Role badge if logged in */}
        {user && (
          <span
            className={`hidden sm:inline-flex text-[10px] font-black uppercase px-2 py-0.5 rounded-sm border-2 border-[#1E1F1C] ${
              isBuyer ? "bg-[#d9e9f2] text-[#1B4965]" : "bg-[#fae8e0] text-[#C04A22]"
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
            onClick={() => {
              setShowLangMenu(!showLangMenu);
            }}
            className="flex items-center gap-1.5 h-9 px-2.5 rounded-sm text-[#1E1F1C] bg-white text-xs font-bold border-2 border-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5 text-[#1E1F1C]" />
            <span className="text-[11px] uppercase font-black">{language}</span>
            <ChevronDown className="h-3 w-3 opacity-80" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-sm border-2 border-[#1E1F1C] bg-white p-2 shadow-[4px_4px_0_0_#1E1F1C] z-50 animate-in fade-in zoom-in-95 duration-100">
              <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#52544D] border-b-2 border-[#E2E4DE]">
                {t("Select Language", "भाषा चुनें", "भाषा चुनव")}
              </p>
              <div className="mt-1 space-y-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-xs font-bold rounded-sm border transition-colors cursor-pointer ${
                      language === lang.code
                        ? "bg-[#EBECE8] text-[#1E1F1C] border-[#1E1F1C]"
                        : "border-transparent text-[#1E1F1C] hover:bg-[#EBECE8]"
                    }`}
                  >
                    <span>{lang.label}</span>
                    {language === lang.code && <Check className="h-3.5 w-3.5 text-[#1E1F1C]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Login / Profile button */}
        {user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="flex items-center gap-1.5 h-9 px-3 rounded-sm border-2 border-[#1E1F1C] bg-white text-[#1E1F1C] hover:bg-[#EBECE8] text-xs font-bold shadow-[2px_2px_0_0_#1E1F1C] transition-all"
            >
              <CircleUser className="h-4 w-4 text-[#1E1F1C]" />
              <span className="hidden sm:inline max-w-[100px] truncate">{user.name || t("My Account", "मेरा खाता", "मोर खाता")}</span>
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("kisansetu_token");
                localStorage.removeItem("kisansetu_user");
                document.cookie = "kisansetu_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                window.location.href = "/login";
              }}
              className="flex items-center gap-1.5 h-9 px-2.5 rounded-sm border-2 border-[#1E1F1C] bg-[#fae8e0] text-[#C04A22] hover:bg-[#f7d6c8] text-xs font-bold shadow-[2px_2px_0_0_#1E1F1C] transition-all cursor-pointer"
              title={t("Logout", "लॉग आउट", "लॉग आउट")}
            >
              <LogOut className="h-3.5 w-3.5 text-[#C04A22]" />
              <span className="hidden sm:inline">{t("Logout", "लॉग आउट", "लॉग आउट")}</span>
            </button>
          </div>
        ) : (
          <Link href="/login">
            <Button size="sm" variant="primary" className="h-9 px-3.5 text-xs font-bold">
              <LogIn className="h-3.5 w-3.5 mr-1" /> {t("Sign In", "साइन इन", "साइन इन")}
            </Button>
          </Link>
        )}

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-sm border-2 border-[#1E1F1C] bg-white text-[#1E1F1C] transition-colors hover:bg-[#EBECE8] shadow-[2px_2px_0_0_#1E1F1C]"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div
            className="fixed inset-0 bg-[#1E1F1C]/60 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-[210] w-72 bg-[#EBECE8] border-l-2 border-[#1E1F1C] p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-[#1E1F1C]">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-sm bg-[#C04A22] border-2 border-[#1E1F1C] flex items-center justify-center text-white font-bold">
                    🌾
                  </div>
                  <span className="font-display font-black text-[#1E1F1C] text-lg">KisanSetu</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-sm border-2 border-[#1E1F1C] bg-white text-[#1E1F1C]">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {user && (
                <div className="mb-4">
                  <Badge variant={isBuyer ? "buyer" : "farmer"} size="sm" className="w-full justify-center">
                    {isBuyer ? "Buyer Mode Active" : "Farmer Mode Active"}
                  </Badge>
                </div>
              )}

              <div className="space-y-2 mb-6">
                {activeNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon || Store;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-sm border-2 text-sm font-bold transition-all ${
                        isActive
                          ? isBuyer
                            ? "bg-[#1B4965] text-white border-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C]"
                            : "bg-[#C04A22] text-white border-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C]"
                          : "border-transparent text-[#1E1F1C] hover:bg-white hover:border-[#1E1F1C]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{getLabel(item)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="border-t-2 border-[#1E1F1C] pt-4 space-y-3">
              <div className="flex items-center justify-between px-2 text-xs text-[#52544D] font-bold">
                <span>{t("Language:", "भाषा:", "भाषा:")}</span>
                <span className="font-black text-[#1E1F1C] uppercase">{language}</span>
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
                  className="w-full flex items-center justify-center gap-2 rounded-sm border-2 border-[#1E1F1C] bg-[#fae8e0] py-2.5 text-xs font-black text-[#C04A22] shadow-[2px_2px_0_0_#1E1F1C] hover:bg-[#f7d6c8] transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  {t("Sign Out", "लॉग आउट करें", "लॉग आउट करव")} ({user.name || "User"})
                </button>
              ) : (
                <Link href="/login" className="w-full block">
                  <Button variant="primary" className="w-full justify-center">
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
