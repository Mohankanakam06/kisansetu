"use client";
import React, { useEffect, useMemo, useState } from "react";
import { apiService } from "@/services/api";
import { Card, Badge, Button } from "@/components/ui";
import { useLanguage } from "@/lib/language";
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
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof apiService.getOrders>>["orders"]>([]);
  const [loading, setLoading] = useState(true);
  const [downloaded, setDownloaded] = useState(false);
  const [showReceipt, setShowReceipt] = useState<string | null>(null);
  const [payoutLoading, setPayoutLoading] = useState(false);

  const handleManualWithdraw = async (amount: number) => {
    setPayoutLoading(true);
    // Simulate API payout trigger
    setTimeout(() => {
      setPayoutLoading(false);
      alert(t("Payout of ₹" + amount.toLocaleString("en-IN") + " initiated to linked UPI.", "लिंक किए गए UPI पर ₹" + amount.toLocaleString("en-IN") + " का भुगतान शुरू किया गया।", "UPI म ₹" + amount.toLocaleString("en-IN") + " भेजे के प्रक्रिया सुरु हो गे।"));
    }, 1500);
  };

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
    {
      label: t("Order Placed", "ऑर्डर दर्ज हुआ", "ऑर्डर दर्ज हो गे"),
      sub: t("Buyer confirmed & escrow locked", "खरीदार ने पुष्टि की और एस्क्रो लॉक हुआ", "खरीदार पक्का करिस आ एस्क्रो लॉक हो गे"),
      stageKey: ["placed", "routed", "picked_up", "delivered", "settled"],
      pct: "0%",
    },
    {
      label: t("Pickup Verified — 40% Advance", "पिकअप सत्यापित — 40% अग्रिम", "पिकअप सत्यापित — 40% अग्रिम"),
      sub: `₹${Math.round(stats.pending).toLocaleString("en-IN")} ${t("expected", "अपेक्षित", "आने वाला")}`,
      stageKey: ["picked_up", "delivered", "settled"],
      pct: "40%",
    },
    {
      label: t("Delivery Verified — 60% Final", "डिलीवरी सत्यापित — 60% अंतिम", "डिलीवरी सत्यापित — 60% बाकी"),
      sub: t("After buyer QC & weigh-in", "खरीदार की गुणवत्ता और वजन जांच के बाद", "खरीदार के जांच आ तौल के बाद"),
      stageKey: ["delivered", "settled"],
      pct: "60%",
    },
    {
      label: t("Fully Settled", "पूर्ण निपटान", "पूरा भुगतान"),
      sub: t("Bank cleared • No deductions", "बैंक में जमा • कोई कटौती नहीं", "बैंक म जमा • कोनो कटौती नइ"),
      stageKey: ["settled"],
      pct: "100%",
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f8faf9]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 border border-emerald-300 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" /> {t("UPI Escrow Protected Settlements", "UPI एस्क्रो सुरक्षित भुगतान", "UPI एस्क्रो सुरक्षित भुगतान")}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-950">
              {t("Farmer Earnings & Settlement", "किसान कमाई एवं निपटान", "किसान कमाई आ निपटान")}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {t(
                "Track payouts, view UPI receipts, and download settlement reports in one dashboard.",
                "भुगतान ट्रैक करें, UPI रसीदें देखें, और निपटान रिपोर्ट डाउनलोड करें।",
                "भुगतान ट्रैक करव, UPI रसीद देखव, आ निपटान रिपोर्ट डाउनलोड करव।"
              )}
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-black text-white transition hover:bg-emerald-800 shadow-md active:scale-95 cursor-pointer self-start md:self-auto"
          >
            {downloaded ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            {downloaded
              ? t("Report Downloaded!", "रिपोर्ट डाउनलोड हो गई!", "रिपोर्ट डाउनलोड हो गे!")
              : t("Download Settlement Report", "निपटान रिपोर्ट डाउनलोड करें", "निपटान रिपोर्ट डाउनलोड करव")}
          </button>
        </div>

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white shadow-glow overflow-hidden relative">
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/5" />
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-100">
                {t("Total Earnings YTD", "कुल कमाई (इस वर्ष)", "कुल कमाई (ए बछर)")}
              </p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <Wallet className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-black tracking-tight">
              ₹{stats.settled.toLocaleString("en-IN")}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-emerald-100">
              <TrendingUp className="h-3.5 w-3.5" /> {t("+38% vs mandi middlemen", "मंडी बिचौलियों की तुलना में +38%", "मंडी दलाल मन ले +38% जादा")}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-800">
                {t("Pending Payouts", "लंबित भुगतान", "बाकी भुगतान")}
              </p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Clock className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-black tracking-tight text-amber-700">
              ₹{Math.round(stats.pending).toLocaleString("en-IN")}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-900">
              <Clock className="h-3.5 w-3.5" /> {t("Stage-wise UPI release", "चरणबद्ध UPI भुगतान", "पड़ाव दर पड़ाव UPI भुगतान")}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {t("Active Lots", "सक्रिय लॉट्स", "चालू लॉट मन")}
              </p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Package className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900">{stats.active}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
              <ListChecks className="h-3.5 w-3.5" /> {orders.length} {t("total placed", "कुल दर्ज", "कुल दर्ज")}
            </div>
          </div>
        </div>

        {/* Main Grid 2-column */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left: Premium Payout Timeline */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Banknote className="h-5 w-5 text-emerald-700" /> {t("Payout Milestone Timeline", "भुगतान मील का पत्थर समयरेखा", "भुगतान पड़ाव समयरेखा")}
              </h2>
              <Badge variant="verified" className="rounded-full">{t("UPI Live", "UPI लाइव", "UPI लाइव")}</Badge>
            </div>

            <div className="relative pl-5">
              {/* Track line */}
              <div className="absolute left-[17px] top-4 bottom-4 w-[3px] rounded-full bg-gradient-to-b from-emerald-600 via-yellow-300 to-slate-200" />

              <div className="space-y-8">
                {TIMELINE.map((step, i) => {
                  const done = orders.some((o) => step.stageKey.includes(o.status));
                  return (
                    <div key={i} className="relative flex items-start gap-4">
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
                              {t("✓ Done", "✓ पूरा", "✓ पूरा")}
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

            {/* Instant UPI Withdrawal Panel */}
            <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-emerald-950">
                      {t("Instant Bank / UPI Transfer", "तत्काल बैंक / UPI ट्रांसफर", "तुरंत बैंक / UPI ट्रांसफर")}
                    </h3>
                    <p className="text-[11px] text-emerald-800 font-mono">VPA: farmer.kisansetu@sbi</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-200 text-emerald-900 px-2 py-0.5 text-[10px] font-black uppercase">
                  {t("Active", "सक्रिय", "चालू")}
                </span>
              </div>

              <div className="rounded-xl bg-white border border-emerald-200 p-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t("Available for Payout", "निकासी योग्य राशि", "निकाले बर राशि")}</p>
                  <p className="font-display text-lg font-black text-slate-900">₹{stats.settled.toLocaleString("en-IN")}</p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="rounded-xl text-xs font-bold px-4 shadow-sm"
                  disabled={payoutLoading || stats.settled <= 0}
                  isLoading={payoutLoading}
                  onClick={() => handleManualWithdraw(stats.settled)}
                >
                  {t("Withdraw to UPI", "UPI में निकालें", "UPI म निकालव")}
                </Button>
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
                    <p className="text-sm font-extrabold text-emerald-900">{t("View UPI Digital Receipt", "UPI डिजिटल रसीद देखें", "UPI डिजिटल रसीद देखव")}</p>
                    <p className="text-xs text-emerald-800/70">{t("UTR verification • Instant download", "UTR सत्यापन • तुरंत डाउनलोड", "UTR सत्यापन • तुरंत डाउनलोड")}</p>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Right: Tables */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* 2-Stage Escrow Explainer: Interactive 40/60 Breakdown */}
            {orders.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card space-y-4">
                <div>
                  <h2 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-700" /> {t("Smart Escrow Settlement Breakdown", "स्मार्ट एस्क्रो निपटान ब्यौरा", "स्मार्ट एस्क्रो निपटान ब्यौरा")}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {t("Visualizing the 40% (Dispatch) + 60% (Delivery) escrow flow for the latest orders", "नवीनतम ऑर्डरों के लिए 40% (प्रेषण) + 60% (डिलीवरी) एस्क्रो प्रवाह का चित्रण", "नवा ऑर्डर मन बर 40% (प्रेषण) + 60% (डिलीवरी) एस्क्रो प्रवाह")}
                  </p>
                </div>

                {orders.slice(0, 3).map((o) => (
                  <div key={o.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[11px] font-bold text-slate-500">#{o.id} • {o.crop_type}</span>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                        o.status === "settled" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                        o.status === "delivered" ? "bg-blue-100 text-blue-800 border-blue-300" :
                        "bg-amber-100 text-amber-800 border-amber-300"
                      }`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex h-7 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="bg-amber-500 flex items-center justify-center text-[10px] font-black text-white"
                          style={{ width: "40%" }}
                        >
                          {(o.status === "picked_up" || o.status === "delivered" || o.status === "settled") ? "✓ 40%" : "40%"}
                        </div>
                        <div
                          className={`flex items-center justify-center text-[10px] font-black ${
                            o.status === "settled" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                          }`}
                          style={{ width: "60%" }}
                        >
                          {o.status === "settled" ? "✓ 60%" : "60%"}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-amber-800">₹{(o.total_amount * 0.4).toLocaleString("en-IN")} ({t("Dispatch Advance", "प्रेषण अग्रिम", "प्रेषण अग्रिम")})</span>
                      <span className={o.status === "settled" ? "text-emerald-700" : "text-slate-400"}>₹{(o.total_amount * 0.6).toLocaleString("en-IN")} ({t("Final", "अंतिम", "बाकी")})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active Listings Status Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold text-slate-900">{t("Active Listings Status", "सक्रिय लिस्टिंग स्थिति", "चालू लिस्टिंग स्थिति")}</h2>
                <Badge variant="neutral" size="sm">{orders.length} {t("Orders", "ऑर्डर", "ऑर्डर")}</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase font-bold tracking-wider text-slate-500">
                      <th className="px-4 py-3">{t("Order", "ऑर्डर", "ऑर्डर")}</th>
                      <th className="px-4 py-3">{t("Crop", "फसल", "फसल")}</th>
                      <th className="px-4 py-3">{t("Quantity", "मात्रा", "मात्रा")}</th>
                      <th className="px-4 py-3">{t("Amount", "राशि", "पईसा")}</th>
                      <th className="px-4 py-3">{t("Status", "स्थिति", "स्थिति")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 && !loading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
                          {t("No orders yet — list produce to start earning.", "अभी कोई ऑर्डर नहीं है — कमाई शुरू करने के लिए उपज सूचीबद्ध करें।", "अभि कोनो ऑर्डर नइ हे — कमाई सुरु करे बर फसल लिस्ट करव।")}
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs font-bold text-slate-500">{o.id}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{o.crop_type}</td>
                          <td className="px-4 py-3 text-slate-600">{o.quantity_kg} {t("kg", "किग्रा", "किलो")}</td>
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
                <h2 className="font-display text-sm font-bold text-slate-900">{t("Recent Transactions", "हाल के लेन-देन", "हाल के लेन-देन")}</h2>
                <span className="text-xs font-medium text-slate-500">{t("Last 30 days", "पिछले 30 दिन", "पाछू 30 दिन")}</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">{t("No transactions yet.", "अभी कोई लेन-देन नहीं है।", "अभि कोनो लेन-देन नइ हे।")}</div>
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
                          <p className="text-sm font-bold text-slate-900 truncate">{o.crop_type} {t("settlement", "निपटान", "निपटान")}</p>
                          <p className="text-xs font-medium text-slate-500">
                            {new Date(o.created_at).toLocaleDateString("en-IN")} • {o.status === "settled" ? t("UPI Transfer", "UPI ट्रांसफर", "UPI ट्रांसफर") : t("Pending", "लंबित", "बाकी")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-sm font-black ${o.status === "settled" || o.status === "delivered" ? "text-emerald-700" : "text-amber-700"}`}>
                          +₹{o.total_amount.toLocaleString("en-IN")}
                        </span>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-emerald-700"
                          title={t("View Receipt", "रसीद देखें", "रसीद देखव")}
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
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowReceipt(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
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
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">{t("Payment Successful", "भुगतान सफल", "भुगतान सफल")}</p>
              <p className="mt-1 font-display text-3xl font-black tracking-tight">
                ₹{stats.settled.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2 text-xs font-bold text-emerald-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                {t("Verified UPI Transaction • NPCI Protected", "सत्यापित UPI लेन-देन • NPCI संरक्षित", "सत्यापित UPI लेन-देन • NPCI सुरक्षित")}
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                  <span className="font-medium text-slate-500">{t("UTR Number", "UTR संख्या", "UTR नंबर")}</span>
                  <span className="font-mono font-bold text-slate-900">UTR{Date.now().toString().slice(-12)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                  <span className="font-medium text-slate-500">{t("Method", "विधि", "तरीका")}</span>
                  <span className="font-bold text-slate-900">UPI / farmer@upi</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                  <span className="font-medium text-slate-500">{t("Timestamp", "समय", "समय")}</span>
                  <span className="font-bold text-slate-900">{new Date().toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                  <span className="font-medium text-slate-500">{t("Stage", "चरण", "पड़ाव")}</span>
                  <span className="font-bold text-emerald-800">{t("Final (60%)", "अंतिम (60%)", "बाकी (60%)")}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium text-slate-500">{t("Payer", "भुगतानकर्ता", "भुगतान करे वाला")}</span>
                  <span className="font-bold text-slate-900">{t("KisanSetu Escrow Pool", "KisanSetu एस्क्रो पूल", "KisanSetu एस्क्रो पूल")}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-200">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-bold text-emerald-800">{t("KisanSetu FinTech Settlement", "KisanSetu फिनटेक निपटान", "KisanSetu फिनटेक निपटान")}</p>
                <Sparkles className="h-4 w-4 text-emerald-600" />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <Button
                variant="primary"
                className="w-full rounded-xl"
                onClick={() => setShowReceipt(null)}
              >
                {t("Close Receipt", "रसीद बंद करें", "रसीद बंद करव")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
