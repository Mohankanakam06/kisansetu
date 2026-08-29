import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Sprout, ShoppingCart, Truck, ShieldCheck } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KisanSetu | Direct-to-Market Agri Platform",
  description: "AI-powered agricultural aggregation, grading, and direct-to-buyer marketplace (SIH PS 26033)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-soil-50 text-soil-900">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-soil-200 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-lg text-soil-900 leading-none block">
                  Kisan<span className="text-emerald-600">Setu</span>
                </span>
                <span className="text-[10px] text-soil-500 font-medium tracking-tight">
                  Direct Agri Marketplace
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/buyer"
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-soil-700 hover:bg-soil-100 hover:text-soil-900 transition-colors"
              >
                <ShoppingCart className="h-4 w-4 text-emerald-600" />
                <span>Buyer Portal</span>
              </Link>

              <Link
                href="/farmer"
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-soil-700 hover:bg-soil-100 hover:text-soil-900 transition-colors"
              >
                <Sprout className="h-4 w-4 text-emerald-600" />
                <span>Farmer Listing</span>
              </Link>

              <Link
                href="/orders"
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-soil-700 hover:bg-soil-100 hover:text-soil-900 transition-colors"
              >
                <Truck className="h-4 w-4 text-emerald-600" />
                <span>Orders & Logistics</span>
              </Link>
            </nav>

            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                SIH 26033 Demo Mode
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Footer */}
        <footer className="border-t border-soil-200 bg-white py-4 text-center text-xs text-soil-500">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Direct-to-Market Agri Platform • Ministry of Consumer Affairs (PS 26033)</span>
            <span className="text-soil-400">Next.js + Tailwind + Leaflet Prototype</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
