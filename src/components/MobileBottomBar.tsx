"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  LayoutDashboard,
  Sprout,
  Wallet,
  Menu,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/language";

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const handleOpenDrawer = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toggle-mobile-drawer"));
    }
  };

  const navItems = [
    {
      href: "/buyer",
      label: t("Market", "बाजार", "बाजार"),
      icon: Store,
      badge: null,
    },
    {
      href: "/orders",
      label: t("Dispatch", "लॉजिस्टिक्स", "लॉजिस्टिक्स"),
      icon: LayoutDashboard,
      badge: "LIVE",
    },
    // Center Action Button: Sell / List Produce
    {
      href: "/farmer",
      label: t("Sell", "बेचें", "बेचंव"),
      icon: Sprout,
      isCenter: true,
    },
    {
      href: "/earnings",
      label: t("Payouts", "कमाई", "कमाई"),
      icon: Wallet,
      badge: null,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Bar"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_24px_rgba(0,0,0,0.07)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex h-16 items-center justify-around px-2 relative max-w-lg mx-auto">
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all relative ${
                isActive ? "text-emerald-800 font-extrabold" : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110 text-emerald-700" : ""}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 leading-none">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-6 rounded-full bg-emerald-700" />
              )}
            </Link>
          );
        })}

        {/* Center Primary Action: List Produce Button */}
        <div className="flex flex-col items-center justify-center px-1 -mt-4">
          <Link
            href="/farmer"
            aria-label="List Produce"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white shadow-lg shadow-emerald-950/30 ring-4 ring-white active:scale-95 transition-transform"
          >
            <Sprout className="h-6 w-6" />
          </Link>
          <span className="text-[10px] font-black tracking-tight text-emerald-900 mt-1">
            + {t("List", "दर्ज", "लिखव")}
          </span>
        </div>

        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all relative ${
                isActive ? "text-emerald-800 font-extrabold" : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110 text-emerald-700" : ""}`} />
              <span className="text-[10px] tracking-tight mt-1 leading-none">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-6 rounded-full bg-emerald-700" />
              )}
            </Link>
          );
        })}

        {/* 5th Action: Menu & All Options Drawer Trigger */}
        <button
          type="button"
          onClick={handleOpenDrawer}
          aria-label={t("All Options and Functions", "सभी विकल्प और कार्य", "सब विकल्प आ काम")}
          className="flex flex-col items-center justify-center flex-1 py-1.5 transition-all text-slate-600 hover:text-emerald-800 active:scale-95 cursor-pointer font-medium"
        >
          <div className="relative">
            <Menu className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <span className="text-[10px] tracking-tight mt-1 leading-none font-bold">{t("Options", "विकल्प", "विकल्प")}</span>
        </button>
      </div>
    </nav>
  );
}
