"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui";

interface NavItem {
  href: string;
  label: string;
  icon?: any;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/buyer", label: "Marketplace", icon: Store },
  { href: "/farmer", label: "Sell Produce", icon: Sprout },
  { href: "/orders", label: "Logistics", icon: LayoutDashboard },
  { href: "/earnings", label: "Earnings", icon: Wallet },
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
    <nav aria-label="Primary" className="flex flex-1 items-center justify-end gap-2 sm:gap-6">
      {/* Desktop navigation links */}
      <div className="hidden md:flex items-center gap-6">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`text-sm font-semibold transition-colors ${
                isActive
                  ? "text-emerald-800"
                  : "text-slate-600 hover:text-emerald-700"
              }`}
            >
              {item.label}
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
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 text-xs font-semibold border border-slate-200"
          >
            <Globe className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline text-[11px] font-bold uppercase">{selectedLang}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-50">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`flex w-full items-center px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    selectedLang === lang.code
                      ? "bg-emerald-50 text-emerald-800 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Login / Profile button */}
        {user ? (
          <Link
            href="/login"
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
          >
            <CircleUser className="h-4 w-4 text-emerald-700" />
            <span className="hidden sm:inline">{user.name || "My Account"}</span>
          </Link>
        ) : (
          <Link href="/login">
            <Button size="sm" variant="secondary" className="h-9 px-3 text-xs font-semibold">
              <LogIn className="h-3.5 w-3.5 mr-1" /> Sign In
            </Button>
          </Link>
        )}

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-[210] w-72 bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-emerald-800 text-lg">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1 mb-6">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon || Store;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <Link href="/login" className="w-full">
                <Button variant="primary" className="w-full justify-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  {user ? "Manage Account" : "Sign In / Register"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
