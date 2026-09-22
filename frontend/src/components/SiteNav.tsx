"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Smartphone,
  ShieldCheck,
  Package,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";

interface NavItem {
  href: string;
  label: string;
  labelHi?: string;
  labelCg?: string;
  desc?: string;
  descHi?: string;
  descCg?: string;
  icon?: any;
}

// Role-specific desktop top navigation
const DESKTOP_NAV_FARMER: NavItem[] = [
  { href: "/farmer", label: "Sell Produce", labelHi: "फसल दर्ज करें", labelCg: "फसल बेचंव", icon: Sprout },
  { href: "/buyer", label: "Wholesale Lots", labelHi: "थोक लॉट बाजार", labelCg: "थोक लॉट बाजार", icon: Store },
  { href: "/pricing", label: "Dynamic Pricing", labelHi: "डायनामिक मूल्य", labelCg: "भाव इंजन", icon: TrendingUp },
  { href: "/orders", label: "Orders & Logistics", labelHi: "ऑर्डर और लॉजिस्टिक्स", labelCg: "ऑर्डर आ गाड़ी", icon: LayoutDashboard },
  { href: "/driver", label: "Pickup Audit", labelHi: "पिकअप ऑडिट", labelCg: "जांच केंद्र", icon: Layers },
  { href: "/earnings", label: "Earnings", labelHi: "कमाई", labelCg: "कमाई", icon: Wallet },
];

const DESKTOP_NAV_BUYER: NavItem[] = [
  { href: "/buyer", label: "Wholesale Lots", labelHi: "थोक लॉट बाजार", labelCg: "थोक लॉट बाजार", icon: Store },
  { href: "/pricing", label: "Dynamic Pricing", labelHi: "डायनामिक मूल्य", labelCg: "भाव इंजन", icon: TrendingUp },
  { href: "/orders", label: "Orders & Logistics", labelHi: "ऑर्डर और लॉजिस्टिक्स", labelCg: "ऑर्डर आ गाड़ी", icon: LayoutDashboard },
  { href: "/driver", label: "Pickup Audit", labelHi: "पिकअप ऑडिट", labelCg: "जांच केंद्र", icon: Layers },
];

// Categorized navigation for comprehensive Mobile & PWA drawer
const DRAWER_MARKETPLACE_FARMER: NavItem[] = [
  {
    href: "/farmer",
    label: "Sell Produce & AI Grading",
    labelHi: "फसल दर्ज करें व AI ग्रेडिंग",
    labelCg: "फसल बेचंव आ AI जांच",
    desc: "List harvest, test moisture & get fair price",
    descHi: "फसल लिस्ट करें, नमी जांचें और सही मूल्य पाएं",
    descCg: "फसल दर्ज करव, नमी नापव आ सही भाव पाव",
    icon: Sprout,
  },
  {
    href: "/buyer",
    label: "Wholesale Marketplace",
    labelHi: "थोक मंडी बाजार",
    labelCg: "थोक मंडी बाजार",
    desc: "Browse aggregated lots with guaranteed escrow",
    descHi: "सुरक्षित एस्क्रो के साथ थोक लॉट खरीदें",
    descCg: "सुरक्षित एस्क्रो संग थोक लॉट बिसाव",
    icon: Store,
  },
  {
    href: "/pricing",
    label: "Dynamic Pricing Engine",
    labelHi: "डायनामिक मूल्य इंजन",
    labelCg: "भाव इंजन",
    desc: "Real-time mandi benchmarks & quality multipliers",
    descHi: "लाइव मंडी दर और गुणवत्ता आधारित मूल्यांकन",
    descCg: "लाइव मंडी भाव आ गुणवत्ता जांच",
    icon: TrendingUp,
  },
];

const DRAWER_MARKETPLACE_BUYER: NavItem[] = [
  {
    href: "/buyer",
    label: "Wholesale Marketplace",
    labelHi: "थोक मंडी बाजार",
    labelCg: "थोक मंडी बाजार",
    desc: "Browse aggregated lots with guaranteed escrow",
    descHi: "सुरक्षित एस्क्रो के साथ थोक लॉट खरीदें",
    descCg: "सुरक्षित एस्क्रो संग थोक लॉट बिसाव",
    icon: Store,
  },
  {
    href: "/pricing",
    label: "Dynamic Pricing Engine",
    labelHi: "डायनामिक मूल्य इंजन",
    labelCg: "भाव इंजन",
    desc: "Real-time mandi benchmarks & quality multipliers",
    descHi: "लाइव मंडी दर और गुणवत्ता आधारित मूल्यांकन",
    descCg: "लाइव मंडी भाव आ गुणवत्ता जांच",
    icon: TrendingUp,
  },
  {
    href: "/farmer",
    label: "Farmer Produce Listing",
    labelHi: "फसल दर्ज करें",
    labelCg: "फसल बेचंव",
    desc: "Direct farm listings & moisture grading",
    descHi: "किसान फसल लिस्टिंग और नमी जांच",
    descCg: "किसान फसल आ नमी जांच",
    icon: Sprout,
  },
];

const DRAWER_OPERATIONS: NavItem[] = [
  {
    href: "/orders",
    label: "Orders & Logistics Tracking",
    labelHi: "ऑर्डर और वाहन ट्रैकिंग",
    labelCg: "ऑर्डर आ गाड़ी ट्रैकिंग",
    desc: "Real-time dispatch, route optimization & escrow",
    descHi: "लाइव वाहन स्थिति, रूट और एस्क्रो सुरक्षा",
    descCg: "लाइव गाड़ी स्थिति आ एस्क्रो सुरक्षा",
    icon: LayoutDashboard,
  },
  {
    href: "/driver",
    label: "Physical Quality & Pickup Audit",
    labelHi: "फिजिकल क्वालिटी व पिकअप ऑडिट",
    labelCg: "भौतिक जांच आ पिकअप केंद्र",
    desc: "Gatepass check, physical verification & weighbridge",
    descHi: "गेटपास जांच, भौतिक सत्यापन और वजन",
    descCg: "गेटपास जांच, भौतिक जांच आ वजन",
    icon: Layers,
  },
  {
    href: "/earnings",
    label: "Earnings & UPI Settlements",
    labelHi: "कमाई और UPI भुगतान",
    labelCg: "कमाई आ तुरंते UPI पइसा",
    desc: "Instant T+0 bank disbursements and payouts",
    descHi: "सीधे बैंक खाते में तुरंत UPI भुगतान",
    descCg: "सीधा बैंक खाता म तुरंते UPI भुगतान",
    icon: Wallet,
  },
];

const LANGUAGES = [
  { code: "en", label: "English", sub: "Default" },
  { code: "hi", label: "हिन्दी", sub: "Hindi" },
  { code: "cg", label: "छत्तीसगढ़ी", sub: "Chhattisgarhi" },
];

export default function SiteNav() {
  const router = useRouter();
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

  const getDesc = (item: NavItem) => {
    if (!item.desc) return "";
    if (language === "hi") return item.descHi || item.desc;
    if (language === "cg") return item.descCg || item.descHi || item.desc;
    return item.desc;
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

  const handleLogout = () => {
    localStorage.removeItem("kisansetu_token");
    localStorage.removeItem("kisansetu_user");
    document.cookie = "kisansetu_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    setMobileMenuOpen(false);
    router.push("/login");
  };

  const isBuyer = user?.role === "buyer";
  const desktopNav = isBuyer ? DESKTOP_NAV_BUYER : DESKTOP_NAV_FARMER;
  const drawerMarketplace = isBuyer ? DRAWER_MARKETPLACE_BUYER : DRAWER_MARKETPLACE_FARMER;

  return (
    <nav aria-label="Primary Navigation" className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
      {/* Desktop navigation links */}
      <div className="hidden lg:flex items-center gap-1">
        {desktopNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`text-xs xl:text-sm font-semibold px-2.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive
                  ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 shadow-2xs"
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
              <CircleUser className="h-4 w-4 text-emerald-700" />
              <span className="hidden sm:inline max-w-[120px] truncate font-bold text-slate-900">{user.name || t("Profile", "प्रोफ़ाइल", "प्रोफ़ाइल")}</span>
            </Link>
            <button
              onClick={handleLogout}
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
              <LogIn className="h-3.5 w-3.5 mr-1" /> {t("Sign In", "साइन इन", "साइन इन")}
            </Button>
          </Link>
        )}

        {/* Mobile / PWA Hamburger Options Button */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 transition-colors hover:bg-slate-50 shadow-2xs cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile & PWA Options Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-[210] w-[340px] max-w-[90vw] bg-white border-l border-slate-200 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
                    <Sprout className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-extrabold text-slate-900 text-lg leading-none">KisanSetu</span>
                    <span className="text-[10px] text-emerald-800 font-bold mt-0.5 uppercase tracking-wide">
                      {t("Direct Agri Network", "सीधा कृषि नेटवर्क", "सीधा कृषि नेटवर्क")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User status card */}
              {user ? (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <CircleUser className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{user.name || "KisanSetu User"}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{user.phone ? `+91 ${user.phone}` : "Verified Account"}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-md"
                  >
                    {t("Profile", "प्रोफ़ाइल", "प्रोफ़ाइल")}
                  </Link>
                </div>
              ) : null}
            </div>

            {/* Drawer Body with Categorized Options */}
            <div className="p-5 space-y-6 flex-1">
              {/* Category 1: Marketplace & Trade */}
              <div className="space-y-2">
                <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("Marketplace & Trade", "मंडी और व्यापार", "मंडी आ व्यापार")}
                </p>
                <div className="space-y-1.5">
                  {drawerMarketplace.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-all border ${
                          isActive
                            ? "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-2xs"
                            : "bg-white border-slate-200/80 text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isActive ? "bg-emerald-200/60 text-emerald-900" : "bg-slate-100 text-slate-600"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block">{getLabel(item)}</span>
                          <span className="text-[10px] text-slate-500 leading-tight mt-0.5 block">{getDesc(item)}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Category 2: Operations & Logistics */}
              <div className="space-y-2">
                <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("Logistics & Settlements", "लॉजिस्टिक्स और भुगतान", "लॉजिस्टिक्स आ पइसा")}
                </p>
                <div className="space-y-1.5">
                  {DRAWER_OPERATIONS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-all border ${
                          isActive
                            ? "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-2xs"
                            : "bg-white border-slate-200/80 text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isActive ? "bg-emerald-200/60 text-emerald-900" : "bg-slate-100 text-slate-600"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block">{getLabel(item)}</span>
                          <span className="text-[10px] text-slate-500 leading-tight mt-0.5 block">{getDesc(item)}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Category 3: PWA Mobile App & Tools */}
              <div className="space-y-2">
                <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("Mobile Experience & PWA", "मोबाइल अनुभव व PWA", "मोबाइल अनुभव व PWA")}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("open-pwa-install"));
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-700 text-white shadow-xs hover:from-emerald-900 hover:to-emerald-800 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/15 text-white">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold block">{t("Install Mobile App", "मोबाइल ऐप इंस्टॉल करें", "मोबाइल ऐप डालव")}</span>
                      <span className="text-[10px] text-emerald-100 block">Fast offline access & push notifications</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
                    PWA
                  </span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-slate-200 bg-slate-50/70 space-y-4">
              {/* Language Selector */}
              <div className="space-y-2">
                <span className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("Select Language", "भाषा चुनें", "भाषा चुनव")}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex flex-col items-center justify-center rounded-lg border py-2 text-xs font-semibold transition-colors cursor-pointer min-h-[42px] ${
                        language === lang.code
                          ? "bg-emerald-800 text-white border-emerald-900 font-bold shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-bold text-xs">{lang.label}</span>
                      <span className="text-[9px] opacity-80">{lang.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sign In / Sign Out */}
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-3 text-xs font-bold text-rose-800 hover:bg-rose-100 transition-colors min-h-[44px] cursor-pointer shadow-2xs"
                >
                  <LogOut className="h-4 w-4" />
                  {t("Sign Out", "लॉग आउट करें", "लॉग आउट करव")}
                </button>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full block">
                  <Button variant="primary" className="w-full justify-center bg-emerald-800 hover:bg-emerald-900 text-white min-h-[44px] shadow-xs">
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
