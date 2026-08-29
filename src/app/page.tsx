import Link from "next/link";
import {
  ArrowRight,
  Mic,
  Layers,
  ScanSearch,
  ShoppingCart,
  Route,
  Wallet,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

const agents = [
  {
    icon: Mic,
    title: "Aggregation Agent",
    desc: "Clusters nearby small listings of the same crop into a single buyer-scale lot using geo-clustering.",
    href: "/farmer",
  },
  {
    icon: ScanSearch,
    title: "Quality Grading Agent",
    desc: "AI vision grades crop photos — A/B/C with detected defects — replacing manual inspection.",
    href: "/buyer",
  },
  {
    icon: Route,
    title: "Forecast & Routing Agent",
    desc: "Demand trends per crop/region plus optimized multi-pickup delivery routes.",
    href: "/orders",
  },
  {
    icon: Wallet,
    title: "Settlement Agent",
    desc: "Instant, simulated payouts to farmers on pickup & delivery confirmation.",
    href: "/orders",
  },
];

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-brand-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-inset ring-white/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              SIH 2026 • Problem Statement 26033
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Farmers earn more.
              <br />
              <span className="text-emerald-300">Buyers pay less.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-emerald-100/90">
              KisanSetu replaces the four jobs middlemen do — aggregation, quality
              assurance, cash-flow, and logistics — with AI agents, connecting
              farmers directly to buyers. No middleman in between.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/buyer"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
              >
                <ShoppingCart className="h-4 w-4" />
                Browse the Marketplace
              </Link>
              <Link
                href="/farmer"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600/80 px-5 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/30 transition hover:bg-emerald-500"
              >
                <Mic className="h-4 w-4" />
                List Your Crop
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The 5-step value chain */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-soil-900 sm:text-3xl">
            From Farm Gate to Buyer — In Five Steps
          </h2>
          <p className="mt-2 text-soil-500">
            A fully connected flow, no intermediaries, live end-to-end.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["01", "Voice / Web Listing", "Farmer lists produce with crop, quantity, and price expectation."],
            ["02", "AI Aggregation", "Nearby small lots of the same crop cluster into one sellable lot."],
            ["03", "Quality Grading", "A photo is graded A/B/C with detected defects."],
            ["04", "Buyer Orders", "Buyer browses, filters, and places an order on the dashboard."],
            ["05", "Routing & Payout", "Route is optimized; payout simulated on pickup/delivery."],
          ].map(([n, title, desc], i) => (
            <div
              key={n}
              className={`relative rounded-xl border border-soil-200 bg-white p-5 shadow-sm ${
                i === 4 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                {n}
              </span>
              <h3 className="mt-3 font-semibold text-soil-900">{title}</h3>
              <p className="mt-1 text-sm text-soil-500">{desc}</p>
              {i < 4 && (
                <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-soil-300 lg:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Agent cards */}
      <section className="border-t border-soil-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-soil-900 sm:text-3xl">
                Four AI Agents, One Market
              </h2>
              <p className="mt-2 max-w-2xl text-soil-500">
                Each agent replaces a function the middleman once performed.
              </p>
            </div>
            <div className="hidden items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 sm:flex">
              <TrendingUp className="h-4 w-4" />
              Farmer share ↑ · Buyer price ↓
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {agents.map((agent) => (
              <a
                key={agent.title}
                href={agent.href}
                className="group rounded-xl border border-soil-200 p-5 transition hover:border-emerald-300 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                  <agent.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-soil-900">{agent.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-soil-500">{agent.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-emerald-700">
                  <Layers className="h-4 w-4" />
                  Explore demo
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}