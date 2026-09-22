"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  LayoutDashboard,
  Sprout,
  Wallet,
  Menu,
  Home,
  TrendingUp,
  CircleUser,
} from "lucide-react";
import { useLanguage } from "@/lib/language";

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kisansetu_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, [pathname]);

  const handleOpenDrawer = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toggle-mobile-drawer"));
    }
  };

  // Hide on standalone login / registration screens
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  // Universal navigation items
  const isMarketActive = pathname === "/buyer" || pathname.startsWith("/buyer/");
  const isOrdersActive = pathname === "/orders" || pathname.startsWith("/orders/");
  const isSellActive = pathname === "/farmer" || pathname.startsWith("/farmer/");
  const isEarningsActive = pathname === "/earnings" || pathname.startsWith("/earnings/");
  const isPricingActive = pathname === "/pricing" || pathname.startsWith("/pricing/");
  const isHomeActive = pathname === "/";

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom duration-200"
    >
      <div className="flex h-16 items-center justify-around px-2 relative max-w-lg mx-auto">
        {/* Item 1: Wholesale Marketplace */}
        <Link
          href="/buyer"
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all relative ${
            isMarketActive ? "text-emerald-800 font-extrabold" : "text-slate-500 hover:text-slate-900 font-medium"
          }`}
        >
          <div className="relative">
            <Store className={`h-5 w-5 transition-transform ${isMarketActive ? "scale-110 text-emerald-800" : ""}`} />
          </div>
          <span className="text-[10px] tracking-tight mt-1 leading-none">{t("Market", "मंडी", "मंडी")}</span>
          {isMarketActive && <span className="absolute -bottom-1 h-1 w-6 rounded-full bg-emerald-700" />}
        </Link>

        {/* Item 2: Orders / Logistics */}
        <Link
          href="/orders"
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all relative ${
            isOrdersActive ? "text-emerald-800 font-extrabold" : "text-slate-500 hover:text-slate-900 font-medium"
          }`}
        >
          <div className="relative">
            <LayoutDashboard className={`h-5 w-5 transition-transform ${isOrdersActive ? "scale-110 text-emerald-800" : ""}`} />
            <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
          </div>
          <span className="text-[10px] tracking-tight mt-1 leading-none">{t("Orders", "ऑर्डर", "ऑर्डर")}</span>
          {isOrdersActive && <span className="absolute -bottom-1 h-1 w-6 rounded-full bg-emerald-700" />}
        </Link>

        {/* Item 3 (Center Raised Action): + Sell Produce */}
        <div className="flex flex-col items-center justify-center px-1 -mt-4">
          <Link
            href="/farmer"
            aria-label={t("Sell Produce", "फसल बेचें", "फसल बेचंव")}
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white shadow-md shadow-emerald-950/20 ring-4 ring-white active:scale-95 transition-transform ${
              isSellActive ? "ring-emerald-200" : ""
            }`}
          >
            <Sprout className="h-6 w-6" />
          </Link>
          <span className="text-[10px] font-black tracking-tight text-emerald-900 mt-1">
            + {t("Sell", "बेचें", "बेचंव")}
          </span>
        </div>

        {/* Item 4: Earnings or Fair Price */}
        {user ? (
          <Link
            href="/earnings"
            className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all relative ${
              isEarningsActive ? "text-emerald-800 font-extrabold" : "text-slate-500 hover:text-slate-900 font-medium"
            }`}
          >
            <div className="relative">
              <Wallet className={`h-5 w-5 transition-transform ${isEarningsActive ? "scale-110 text-emerald-800" : ""}`} />
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none">{t("Earnings", "कमाई", "कमाई")}</span>
            {isEarningsActive && <span className="absolute -bottom-1 h-1 w-6 rounded-full bg-emerald-700" />}
          </Link>
        ) : (
          <Link
            href="/pricing"
            className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all relative ${
              isPricingActive ? "text-emerald-800 font-extrabold" : "text-slate-500 hover:text-slate-900 font-medium"
            }`}
          >
            <div className="relative">
              <TrendingUp className={`h-5 w-5 transition-transform ${isPricingActive ? "scale-110 text-emerald-800" : ""}`} />
            </div>
            <span className="text-[10px] tracking-tight mt-1 leading-none">{t("Pricing", "भाव", "भाव")}</span>
            {isPricingActive && <span className="absolute -bottom-1 h-1 w-6 rounded-full bg-emerald-700" />}
          </Link>
        )}

        {/* Item 5: Options Drawer Trigger */}
        <button
          type="button"
          onClick={handleOpenDrawer}
          aria-label={t("All Options", "सभी विकल्प", "सब विकल्प")}
          className="flex flex-col items-center justify-center flex-1 py-1.5 transition-all text-slate-600 hover:text-emerald-800 active:scale-95 cursor-pointer font-medium"
        >
          <div className="relative">
            <Menu className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-1 flex h-2 w-2 rounded-full bg-emerald-600" />
          </div>
          <span className="text-[10px] tracking-tight mt-1 leading-none font-bold">{t("Menu", "मेन्यू", "मेन्यू")}</span>
        </button>
      </div>
    </nav>
  );
}
