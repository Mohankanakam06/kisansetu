"use client";
import React, { useState } from "react";
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
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/buyer", label: "Marketplace" },
  { href: "/farmer", label: "Sell" },
  { href: "/orders", label: "Dashboard" },
  { href: "/earnings", label: "Earnings" },
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

  return (
    <nav
      aria-label="Primary"
      className="flex flex-1 items-center justify-end gap-6"
    >
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
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary animate-scale-up" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-3 relative">
        {/* Language selector */}
        <div className="relative">
          <button
            type="button"
            aria-label="Language selector"
            onClick={() => {
              setShowLangMenu(!showLangMenu);
              setShowAccountMenu(false);
            }}
            className="flex items-center gap-1 h-10 px-2 rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-caption font-semibold"
          >
            <Globe className="h-5 w-5" />
            <span className="hidden sm:inline uppercase">{selectedLang}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-outline-variant bg-surface-container-lowest p-1 shadow-popover z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 micro-label text-on-surface-variant border-b border-outline-variant">
                Select Language
              </div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-caption rounded-lg transition-colors ${
                    selectedLang === lang.code
                      ? "bg-primary/10 font-bold text-primary"
                      : "text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span>{lang.label}</span>
                  {selectedLang === lang.code && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Account selector */}
        <div className="relative">
          <button
            type="button"
            aria-label="Account options"
            onClick={() => {
              setShowAccountMenu(!showAccountMenu);
              setShowLangMenu(false);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <CircleUser className="h-6 w-6" />
          </button>

          {showAccountMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-popover z-50 animate-in fade-in zoom-in-95">
              <div className="px-2.5 pb-2 pt-1 micro-label text-on-surface-variant">
                Account & Portals
              </div>

              <div className="space-y-0.5 px-1.5 py-1">
                <Link
                  href="/login"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-caption font-medium text-on-surface transition-colors hover:bg-surface-container"
                >
                  <LogIn className="h-4 w-4 shrink-0 text-on-surface-variant" />
                  Sign In / Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-caption font-medium text-on-surface transition-colors hover:bg-surface-container"
                >
                  <UserPlus className="h-4 w-4 shrink-0 text-on-surface-variant" />
                  Register New User
                </Link>
                <Link
                  href="/onboarding"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-caption font-medium text-on-surface transition-colors hover:bg-surface-container"
                >
                  <Compass className="h-4 w-4 shrink-0 text-on-surface-variant" />
                  Onboarding Guide
                </Link>
              </div>

              <div className="mx-2 my-1 h-px bg-outline-variant" />

              <div className="space-y-0.5 px-1.5 py-1">
                <Link
                  href="/earnings"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-caption font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  <Wallet className="h-4 w-4 shrink-0 text-primary" />
                  Farmer Earnings & Payouts
                </Link>
                <Link
                  href="/support"
                  onClick={() => setShowAccountMenu(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-caption font-medium text-on-surface-variant transition-colors hover:bg-surface-container"
                >
                  <LifeBuoy className="h-4 w-4 shrink-0 text-on-surface-variant" />
                  Help & FAQ
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
