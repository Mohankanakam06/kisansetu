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
  weight: ["300", "400", "500", "600", "700"],
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
    "theme-color": "#047857",
  },
};

const footerLinks = [
  { label: "About Us", href: "/" },
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Help Center", href: "/support" },
  { label: "Contact", href: "/support" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${barlow.variable} ${zillaSlab.variable} h-full antialiased`}>
      <body className="min-h-dvh flex flex-col bg-surface text-on-background" suppressHydrationWarning>
        <HydrationGuard />
        <LanguageProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1000] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-body-sm focus:font-semibold focus:text-on-primary"
          >
            Skip to main content
          </a>

          {/* Top APMC Mandi Live Rate Ticker */}
          <div className="fixed top-0 left-0 right-0 z-[60] bg-[#1E1F1C] text-[#EBECE8] text-[11px] font-semibold tracking-wide border-b-2 border-[#1E1F1C] h-8 flex items-center overflow-hidden">
            <div className="flex items-center gap-1.5 px-2 sm:px-3 bg-[#F4A261] text-[#1E1F1C] font-black shrink-0 z-10 text-[10px] uppercase tracking-wider py-1 border-r-2 border-[#1E1F1C]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C04A22] animate-ping inline-block" />
              <span className="hidden sm:inline">Live Mandi Rates</span>
              <span className="sm:hidden">Rates</span>
            </div>
            <div className="overflow-hidden flex-1 relative flex items-center">
              <div className="animate-marquee whitespace-nowrap flex items-center gap-8 py-1">
                <span className="flex items-center gap-1.5">
                  <span>🍅 Tomato (Raipur Mandi):</span>
                  <span className="font-black text-white">₹24/kg</span>
                  <span className="text-[#386641] font-black text-[10px]">▲ +₹2.50 (+11.6%)</span>
                </span>
                <span className="text-[#52544D] font-black">•</span>
                <span className="flex items-center gap-1.5">
                  <span>🧅 Onion (Lasalgaon APMC):</span>
                  <span className="font-black text-white">₹28/kg</span>
                  <span className="text-[#386641] font-black text-[10px]">▲ +₹1.00 (+3.7%)</span>
                </span>
                <span className="text-[#52544D] font-black">•</span>
                <span className="flex items-center gap-1.5">
                  <span>🥔 Potato (Bhilai Rural):</span>
                  <span className="font-black text-white">₹18/kg</span>
                  <span className="text-[#C04A22] font-black text-[10px]">▼ -₹0.50 (-2.7%)</span>
                </span>
                <span className="text-[#52544D] font-black">•</span>
                <span className="flex items-center gap-1.5">
                  <span>🌶️ Chilli (Tilda APMC):</span>
                  <span className="font-black text-white">₹65/kg</span>
                  <span className="text-[#386641] font-black text-[10px]">▲ +₹4.00 (+6.5%)</span>
                </span>
                <span className="text-[#52544D] font-black">•</span>
                <span className="flex items-center gap-1.5">
                  <span>🌾 Wheat (Durg Center):</span>
                  <span className="font-black text-white">₹24.50/kg</span>
                  <span className="text-[#386641] font-black text-[10px]">▲ +₹0.80 (+3.3%)</span>
                </span>
                <span className="text-[#52544D] font-black">•</span>
                <span className="flex items-center gap-1.5">
                  <span>🫘 Soybean (Nagpur Hub):</span>
                  <span className="font-black text-white">₹44/kg</span>
                  <span className="text-[#386641] font-black text-[10px]">▲ +₹1.50 (+3.5%)</span>
                </span>
                {/* Duplicate for seamless infinite loop */}
                <span className="text-[#52544D] font-black">•</span>
                <span className="flex items-center gap-1.5">
                  <span>🍅 Tomato (Raipur Mandi):</span>
                  <span className="font-black text-white">₹24/kg</span>
                  <span className="text-[#386641] font-black text-[10px]">▲ +₹2.50 (+11.6%)</span>
                </span>
                <span className="text-[#52544D] font-black">•</span>
                <span className="flex items-center gap-1.5">
                  <span>🧅 Onion (Lasalgaon APMC):</span>
                  <span className="font-black text-white">₹28/kg</span>
                  <span className="text-[#386641] font-black text-[10px]">▲ +₹1.00 (+3.7%)</span>
                </span>
                <span className="text-[#52544D] font-black">•</span>
                <span className="flex items-center gap-1.5">
                  <span>🥔 Potato (Bhilai Rural):</span>
                  <span className="font-black text-white">₹18/kg</span>
                  <span className="text-[#C04A22] font-black text-[10px]">▼ -₹0.50 (-2.7%)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Fixed top navigation */}
          <header className="fixed top-8 left-0 z-50 w-full border-b-2 border-[#1E1F1C] bg-[#EBECE8]/95 backdrop-blur-md shadow-none transition-all">
            <div className="mx-auto h-full w-full max-w-7xl px-3 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between gap-2 sm:gap-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 sm:gap-2.5 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C04A22] rounded-lg"
                >
                  <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-sm bg-[#C04A22] text-white font-black text-lg sm:text-xl border-2 border-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C]">
                    🌾
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-xl tracking-tight text-[#1E1F1C] font-display group-hover:text-[#C04A22] transition-colors">
                      KisanSetu
                    </span>
                    <span className="hidden sm:block text-[9px] font-bold text-[#52544D] tracking-widest uppercase -mt-0.5">
                      Direct Market
                    </span>
                  </div>
                </Link>
                <SiteNav />
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <DemoModeBanner />
          <main id="main-content" className="flex-1 flex flex-col pt-[5.75rem] pb-24 md:pb-0">
            {children}
            <RegisterSW />
            <PWAInstallPrompt />
          </main>

          {/* Mobile Fixed Bottom Action Bar & Navigation */}
          <MobileBottomBar />

          {/* Footer */}
          <footer className="bg-surface-container-lowest border-t border-outline-variant/60 py-10 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <Link href="/" className="flex items-center gap-2">
                  <img
                    src="/logo.png"
                    alt="KisanSetu logo"
                    className="h-10 w-auto rounded-lg object-contain"
                  />
                  <span className="font-extrabold text-lg text-primary font-display">KisanSetu</span>
                </Link>
                <p className="mt-2 text-caption text-on-surface-variant">
                  © {new Date().getFullYear()} KisanSetu Agricultural Marketplace. SIH 26033. All rights reserved.
                </p>
              </div>
              <nav className="flex flex-wrap gap-6 font-label-bold text-label-bold">
                {footerLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
