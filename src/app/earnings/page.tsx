"use client";
import React, { useEffect, useMemo, useState } from "react";
import { apiService } from "@/services/api";
import { Card, Badge, Button } from "@/components/ui";
import {
  Download,
  Check,
  ArrowDownLeft,
  Clock,
  TrendingUp,
  Package,
  Receipt,
  IndianRupee,
  Wallet,
  ListChecks,
  ShieldCheck,
  X,
  Sparkles,
  Banknote,
} from "lucide-react";

export default function EarningsPage() {
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof apiService.getOrders>>["orders"]>([]);
  const [loading, setLoading] = useState(true);
  const [downloaded, setDownloaded] = useState(false);
  const [showReceipt, setShowReceipt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiService
      .getOrders()
      .then((res) => {
        if (!cancelled) setOrders(res.orders);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const settled = orders
      .filter((o) => o.status === "settled" || o.status === "delivered")
      .reduce((sum, o) => sum + o.total_amount, 0);
    const pending = orders
      .filter((o) => o.status === "placed" || o.status === "routed" || o.status === "picked_up")
      .reduce((sum, o) => sum + o.total_amount * 0.4, 0);
    const active = orders.filter((o) => o.status !== "settled").length;
    return { settled, pending, active };
  }, [orders]);

  const handleDownload = () => {
    const rows = [
      ["Order ID", "Crop", "Quantity (kg)", "Rate (₹/kg)", "Amount (₹)", "Status", "Date"],
      ...orders.map((o) => [
        o.id,
        o.crop_type,
        String(o.quantity_kg),
        String(o.price_per_kg),
        String(o.total_amount),
        o.status,
        new Date(o.created_at).toISOString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kisansetu-earnings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const statusTone: Record<string, "success" | "warning" | "neutral" | "info"> = {
    settled: "success",
    delivered: "success",
    picked_up: "info",
    routed: "warning",
    placed: "neutral",
  };

  const TIMELINE = [
    { label: "Order Placed", sub: "Buyer confirmed & escrow locked", stageKey: ["placed", "routed", "picked_up", "delivered", "settled"], pct: "0%" },
    { label: "Pickup Verified — 40% Advance", sub: `₹${Math.round(stats.pending).toLocaleString("en-IN")} expected`, stageKey: ["picked_up", "delivered", "settled"], pct: "40%" },
    { label: "Delivery Verified — 60% Final", sub: "After buyer QC & weigh-in", stageKey: ["delivered", "settled"], pct: "60%" },
    { label: "Fully Settled", sub: "Bank cleared • No deductions", stageKey: ["settled"], pct: "100%" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f8faf9]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 border border-emerald-300 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" /> UPI Escrow Protected Settlements
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-950">
              Farmer Earnings & Settlement
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Track payouts, view UPI receipts, and download settlement reports in one dashboard.
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-black text-white transition hover:bg-emerald-800 shadow-md active:scale-95 cursor-pointer self-start md:self-auto"
          >
            {downloaded ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            {downloaded ? "Report Downloaded!" : "Download Settlement Report"}
          </button>
        </div>

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white shadow-glow overflow-hidden relative">
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/5" />
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-100">Total Earnings YTD</p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <Wallet className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-black tracking-tight">
              ₹{stats.settled.toLocaleString("en-IN")}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-emerald-100">
              <TrendingUp className="h-3.5 w-3.5" /> +38% vs mandi middlemen
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-800">Pending Payouts</p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Clock className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-black tracking-tight text-amber-700">
              ₹{Math.round(stats.pending).toLocaleString("en-IN")}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-900">
              <Clock className="h-3.5 w-3.5" /> Stage-wise UPI release
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Active Lots</p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Package className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900">{stats.active}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
              <ListChecks className="h-3.5 w-3.5" /> {orders.length} total placed
            </div>
          </div>
        </div>

        {/* Main Grid 2-column */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left: Premium Payout Timeline */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Banknote className="h-5 w-5 text-emerald-700" /> Payout Milestone Timeline
              </h2>
              <Badge variant="verified" className="rounded-full">UPI Live</Badge>
            </div>

            <div className="relative pl-5">
              {/* Track line */}
              <div className="absolute left-[17px] top-4 bottom-4 w-[3px] rounded-full bg-gradient-to-b from-emerald-600 via-yellow-300 to-slate-200" />

              <div className="space-y-8">
                {TIMELINE.map((step, i) => {
                  const done = orders.some((o) => step.stageKey.includes(o.status));
                  return (
                    <div key={step.label} className="relative flex items-start gap-4">
                      <span
                        className={`relative z-10 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-xs font-black transition-all ${
                          done
                            ? "bg-emerald-600 text-white shadow-glow ring-4 ring-emerald-50"
                            : "border-[3px] border-slate-200 bg-white text-slate-400"
                        }`}
                      >
                        {done ? <Check className="h-4 w-4" /> : <span className="text-[10px] font-black">{step.pct}</span>}
                      </span>
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-extrabold ${done ? "text-slate-900" : "text-slate-400"}`}>{step.label}</p>
                          {done && (
                            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold border border-emerald-200">
                              ✓ Done
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{step.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simulated UPI Receipt CTA */}
            {orders.some((o) => o.status === "settled") && (
              <button
                onClick={() => setShowReceipt("latest")}
                className="w-full rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left transition hover:bg-emerald-100 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-emerald-900">View UPI Digital Receipt</p>
                    <p className="text-xs text-emerald-800/70">UTR verification • Instant download</p>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Right: Tables */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Active Listings Status Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold text-slate-900">Active Listings Status</h2>
                <Badge variant="neutral" size="sm">{orders.length} Orders</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase font-bold tracking-wider text-slate-500">
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Crop</th>
                      <th className="px-4 py-3">Quantity</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 && !loading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
                          No orders yet — list produce to start earning.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs font-bold text-slate-500">{o.id}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{o.crop_type}</td>
                          <td className="px-4 py-3 text-slate-600">{o.quantity_kg} kg</td>
                          <td className="px-4 py-3 font-black text-emerald-700">₹{o.total_amount.toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3">
                            <Badge variant={statusTone[o.status] || "neutral"} size="sm">
                              {o.status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold text-slate-900">Recent Transactions</h2>
                <span className="text-xs font-medium text-slate-500">Last 30 days</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">No transactions yet.</div>
                ) : (
                  orders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          o.status === "settled" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          <ArrowDownLeft className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{o.crop_type} settlement</p>
                          <p className="text-xs font-medium text-slate-500">
                            {new Date(o.created_at).toLocaleDateString("en-IN")} • {o.status === "settled" ? "UPI Transfer" : "Pending"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-sm font-black ${o.status === "settled" || o.status === "delivered" ? "text-emerald-700" : "text-amber-700"}`}>
                          +₹{o.total_amount.toLocaleString("en-IN")}
                        </span>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-emerald-700"
                          title="View Receipt"
                          onClick={() => setShowReceipt(o.id)}
                        >
                          <Receipt className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UPI Digital Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 p-6 text-white text-center relative">
              <button
                onClick={() => setShowReceipt(null)}
                className="absolute right-4 top-4 text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                <Check className="h-7 w-7" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Payment Successful</p>
              <p className="mt-1 font-display text-3xl font-black tracking-tight">
                ₹{stats.settled.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2 text-xs font-bold text-emerald-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Verified UPI Transaction • NPCI Protected
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                  <span className="font-medium text-slate-500">UTR Number</span>
                  <span className="font-mono font-bold text-slate-900">UTR{Date.now().toString().slice(-12)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                  <span className="font-medium text-slate-500">Method</span>
                  <span className="font-bold text-slate-900">UPI / farmer@upi</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                  <span className="font-medium text-slate-500">Timestamp</span>
                  <span className="font-bold text-slate-900">{new Date().toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                  <span className="font-medium text-slate-500">Stage</span>
                  <span className="font-bold text-emerald-800">Final (60%)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium text-slate-500">Payer</span>
                  <span className="font-bold text-slate-900">KisanSetu Escrow Pool</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-200">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-bold text-emerald-800">KisanSetu FinTech Settlement</p>
                <Sparkles className="h-4 w-4 text-emerald-600" />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <Button
                variant="primary"
                className="w-full rounded-xl"
                onClick={() => setShowReceipt(null)}
              >
                Close Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
