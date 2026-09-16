import type { Metadata } from "next";
import { Barlow, Zilla_Slab } from "next/font/google";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import MobileBottomBar from "@/components/MobileBottomBar";
import RegisterSW from "@/components/RegisterSW";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import HydrationGuard from "@/components/HydrationGuard";
import DemoModeBanner from "@/components/DemoModeBanner";
import { LanguageProvider } from "@/lib/language";
import { Sprout, ShieldCheck, PhoneCall } from "lucide-react";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const zillaSlab = Zilla_Slab({
  variable: "--font-zilla-slab",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "KisanSetu | Direct-to-Market Agri Platform",
  description: "AI-powered agricultural aggregation, grading, and direct-to-buyer marketplace (SIH PS 26033)",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    title: "KisanSetu",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "color-scheme": "light",
    "theme-color": "#145937",
  },
};

const footerLinks = [
  { label: "Mandi Rates", href: "/#how-it-works" },
  { label: "AI Grading", href: "/farmer" },
  { label: "Wholesale Lots", href: "/buyer" },
  { label: "Logistics Tracking", href: "/orders" },
  { label: "Terms of Trade", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Kisan Support", href: "/support" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${barlow.variable} ${zillaSlab.variable} h-full antialiased`}>
      <body className="min-h-dvh flex flex-col bg-[#F8FAFC] text-slate-900" suppressHydrationWarning>
        <HydrationGuard />
        <LanguageProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1000] focus:rounded-md focus:bg-emerald-800 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white shadow-md"
          >
            Skip to main content
          </a>

          {/* Top APMC Mandi Live Rate Ticker */}
          <div className="fixed top-0 left-0 right-0 z-[60] bg-slate-950 text-slate-200 text-[11px] font-medium tracking-wide border-b border-slate-850 h-8 flex items-center overflow-hidden select-none">
            <div className="flex items-center gap-1.5 px-3 bg-emerald-900 text-emerald-100 font-bold shrink-0 z-10 text-[10px] uppercase tracking-wider py-1 border-r border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Live Mandi Benchmark</span>
            </div>
            <div className="overflow-hidden flex-1 relative flex items-center">
              <div className="animate-marquee whitespace-nowrap flex items-center gap-8 py-1">
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-300">Tomato (Raipur APMC):</span>
                  <span className="font-bold text-white tabular-nums">₹24.00/kg</span>
                  <span className="text-emerald-400 font-bold text-[10px]">▲ +₹2.50 (+11.6%)</span>
                </span>
                <span className="text-slate-600 font-black">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-300">Nasik Onion (Lasalgaon Yard):</span>
                  <span className="font-bold text-white tabular-nums">₹28.00/kg</span>
                  <span className="text-emerald-400 font-bold text-[10px]">▲ +₹1.00 (+3.7%)</span>
                </span>
                <span className="text-slate-600 font-black">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-300">Potato (Bhilai Rural Center):</span>
                  <span className="font-bold text-white tabular-nums">₹18.00/kg</span>
                  <span className="text-rose-400 font-bold text-[10px]">▼ -₹0.50 (-2.7%)</span>
                </span>
                <span className="text-slate-600 font-black">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-300">G4 Chilli (Tilda Yard):</span>
                  <span className="font-bold text-white tabular-nums">₹65.00/kg</span>
                  <span className="text-emerald-400 font-bold text-[10px]">▲ +₹4.00 (+6.5%)</span>
                </span>
                <span className="text-slate-600 font-black">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-300">Sharbati Wheat (Durg Hub):</span>
                  <span className="font-bold text-white tabular-nums">₹24.50/kg</span>
                  <span className="text-emerald-400 font-bold text-[10px]">▲ +₹0.80 (+3.3%)</span>
                </span>
                <span className="text-slate-600 font-black">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-300">JS 335 Soybean (Nagpur APMC):</span>
                  <span className="font-bold text-white tabular-nums">₹44.00/kg</span>
                  <span className="text-emerald-400 font-bold text-[10px]">▲ +₹1.50 (+3.5%)</span>
                </span>
                {/* Duplicate for seamless infinite loop */}
                <span className="text-slate-600 font-black">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-300">Tomato (Raipur APMC):</span>
                  <span className="font-bold text-white tabular-nums">₹24.00/kg</span>
                  <span className="text-emerald-400 font-bold text-[10px]">▲ +₹2.50 (+11.6%)</span>
                </span>
                <span className="text-slate-600 font-black">•</span>
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-300">Nasik Onion (Lasalgaon Yard):</span>
                  <span className="font-bold text-white tabular-nums">₹28.00/kg</span>
                  <span className="text-emerald-400 font-bold text-[10px]">▲ +₹1.00 (+3.7%)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Fixed top navigation */}
          <header className="fixed top-8 left-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all shadow-xs">
            <div className="mx-auto h-full w-full max-w-7xl px-3 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between gap-2 sm:gap-6">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-lg"
                >
                  <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-emerald-800 text-white font-black shadow-xs group-hover:bg-emerald-900 transition-colors">
                    <Sprout className="h-5 w-5 text-emerald-100" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xl tracking-tight text-slate-900 font-display">
                        KisanSetu
                      </span>
                      <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        DIRECT
                      </span>
                    </div>
                    <span className="hidden sm:block text-[10px] font-medium text-slate-500 tracking-normal -mt-0.5">
                      Direct-to-Buyer Agri Marketplace
                    </span>
                  </div>
                </Link>
                <SiteNav />
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <DemoModeBanner />
          <main id="main-content" className="flex-1 flex flex-col pt-[5.75rem] pb-20 md:pb-0">
            {children}
            <RegisterSW />
            <PWAInstallPrompt />
          </main>

          {/* Mobile Fixed Bottom Action Bar & Navigation */}
          <MobileBottomBar />

          {/* Institutional Trust Footer */}
          <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-700 text-white">
                      <Sprout className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-lg text-white font-display">KisanSetu</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Smart India Hackathon 2026 · PS 26033
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
                    Decentralized agricultural direct-to-buyer platform eliminating commission layers via DBSCAN geo-clustering, Gemini CV photo grading, and 2-stage milestone UPI escrow.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-slate-300">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>256-bit Bank Escrow Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-850 border border-slate-800 text-slate-300">
                    <PhoneCall className="h-4 w-4 text-emerald-400" />
                    <span>Toll-Free Helpline: 1800-180-1551</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <p>© {new Date().getFullYear()} KisanSetu Agri-Technologies. Designed for Indian Mandis & Farmer Producer Organizations.</p>
                <nav className="flex flex-wrap gap-4 text-slate-400">
                  {footerLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="hover:text-emerald-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
