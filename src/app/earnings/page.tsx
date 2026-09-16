"use client";
import React, { useEffect, useMemo, useState } from "react";
import { apiService } from "@/services/api";
import { Card, Badge, Button, cn } from "@/components/ui";
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
  Banknote,
  Landmark,
} from "lucide-react";

export default function EarningsPage() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof apiService.getOrders>>["orders"]>([]);
  const [loading, setLoading] = useState(true);
  const [downloaded, setDownloaded] = useState(false);
  const [showReceipt, setShowReceipt] = useState<string | null>(null);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [withdrawnAmount, setWithdrawnAmount] = useState(0);
  const [payoutHistory, setPayoutHistory] = useState<Array<{ id: string; amount: number; timestamp: string; utr: string }>>([]);

  useEffect(() => {
    try {
      const savedWithdrawn = localStorage.getItem("kisansetu_withdrawn_total");
      if (savedWithdrawn) setWithdrawnAmount(Number(savedWithdrawn));
      const savedPayouts = localStorage.getItem("kisansetu_payout_history");
      if (savedPayouts) setPayoutHistory(JSON.parse(savedPayouts));
    } catch (e) {
      console.warn("Error loading stored payouts", e);
    }
  }, []);

  const handleManualWithdraw = async (amount: number) => {
    if (amount <= 0) return;
    setPayoutLoading(true);
    setTimeout(() => {
      setPayoutLoading(false);
      const newTotal = withdrawnAmount + amount;
      const newEntry = {
        id: `PAY-${Date.now().toString().slice(-6)}`,
        amount,
        timestamp: new Date().toISOString(),
        utr: `UTR${Date.now().toString().slice(-12)}`,
      };
      const updatedHistory = [newEntry, ...payoutHistory];
      setWithdrawnAmount(newTotal);
      setPayoutHistory(updatedHistory);
      try {
        localStorage.setItem("kisansetu_withdrawn_total", String(newTotal));
        localStorage.setItem("kisansetu_payout_history", JSON.stringify(updatedHistory));
      } catch (e) {
        console.warn("Error saving payout", e);
      }
      alert(
        t(
          "Payout of ₹" + amount.toLocaleString("en-IN") + " initiated to linked UPI (UTR: " + newEntry.utr + ").",
          "लिंक किए गए UPI पर ₹" + amount.toLocaleString("en-IN") + " का भुगतान शुरू किया गया (UTR: " + newEntry.utr + ")।",
          "UPI म ₹" + amount.toLocaleString("en-IN") + " भेजे के प्रक्रिया सुरु हो गे (UTR: " + newEntry.utr + ")।"
        )
      );
    }, 1200);
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
    const available = Math.max(0, settled - withdrawnAmount);
    return { settled, pending, active, available };
  }, [orders, withdrawnAmount]);

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
      sub: t("Bank cleared • Direct to account", "बैंक में जमा • सीधा खाते में", "बैंक म जमा • सीधा खाता म"),
      stageKey: ["settled"],
      pct: "100%",
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC]">
      {/* Top Header */}
      <div className="border-b border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="verified">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                {t("UPI Escrow Protected Settlements", "UPI एस्क्रो सुरक्षित भुगतान", "UPI एस्क्रो सुरक्षित भुगतान")}
              </Badge>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {t("Farmer Earnings & Escrow Ledger", "किसान कमाई एवं लेजर", "किसान कमाई आ बहीखाता")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {t(
                "Direct farm-gate payouts, instant UPI settlement vouchers, and downloadable tax ledgers.",
                "सीधा खेत से भुगतान, UPI निपटान वाउचर और डाउनलोड करने योग्य लेजर।",
                "सीधा खेत ले भुगतान, UPI वाउचर आ डाउनलोड करे के लेजर।"
              )}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleDownload}
            className="self-start md:self-auto min-h-[44px]"
          >
            {downloaded ? <Check className="h-4 w-4 mr-1.5 text-emerald-300" /> : <Download className="h-4 w-4 mr-1.5" />}
            {downloaded
              ? t("Ledger Downloaded!", "लेजर डाउनलोड हो गया!", "लेजर डाउनलोड हो गे!")
              : t("Download Mandi Ledger", "मंडी लेजर डाउनलोड करें", "मंडी लेजर डाउनलोड करव")}
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Overview KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Settled YTD */}
          <Card className="flex flex-col justify-between border-emerald-200 bg-emerald-50/40">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                  {t("Total Net Settled YTD", "कुल शुद्ध निपटान (इस वर्ष)", "कुल शुद्ध कमाई (ए बछर)")}
                </p>
                <div className="h-9 w-9 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-800 shadow-2xs">
                  <Landmark className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold tracking-tight tabular-nums text-emerald-950">
                ₹{stats.settled.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-900 w-fit shadow-2xs">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-700" /> {t("+38% vs APMC Mandi", "मंडी की तुलना में +38%", "मंडी ले +38% जादा")}
            </div>
          </Card>

          {/* Pending Escrow */}
          <Card className="flex flex-col justify-between border-amber-200 bg-amber-50/40">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                  {t("Locked in Escrow (In-Transit)", "एस्क्रो में सुरक्षित (पारगमन)", "एस्क्रो म जमा (रस्ता म)")}
                </p>
                <div className="h-9 w-9 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-amber-800 shadow-2xs">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold tracking-tight tabular-nums text-amber-950">
                ₹{Math.round(stats.pending).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-900 w-fit shadow-2xs">
              <Clock className="h-3.5 w-3.5 text-amber-700" /> {t("40% Pickup + 60% Delivery", "40% पिकअप + 60% डिलीवरी", "40% लोड + 60% डिलीवरी")}
            </div>
          </Card>

          {/* Active Orders */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t("Active Produce Lots", "सक्रिय उपज लॉट्स", "चालू लॉट मन")}
                </p>
                <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                  <Package className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold tracking-tight tabular-nums text-slate-900">{stats.active}</p>
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 w-fit shadow-2xs">
              <ListChecks className="h-3.5 w-3.5 text-slate-600" /> {orders.length} {t("Total Dispatches", "कुल प्रेषण", "कुल प्रेषण")}
            </div>
          </Card>
        </div>

        {/* Main Grid 2-column */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left: Milestone Timeline & Instant Transfer */}
          <Card className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Banknote className="h-5 w-5 text-emerald-800" /> {t("Escrow Payout Timeline", "एस्क्रो भुगतान समयरेखा", "भुगतान पड़ाव समयरेखा")}
              </h2>
              <Badge variant="verified">NPCI / UPI</Badge>
            </div>

            <div className="relative pl-5">
              <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-200" />

              <div className="space-y-6">
                {TIMELINE.map((step, i) => {
                  const done = orders.some((o) => step.stageKey.includes(o.status));
                  return (
                    <div key={i} className="relative flex items-start gap-3.5">
                      <span
                        className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          done
                            ? "bg-emerald-800 text-white shadow-xs"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        }`}
                      >
                        {done ? <Check className="h-3.5 w-3.5" /> : <span className="text-[10px]">{step.pct}</span>}
                      </span>
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold ${done ? "text-slate-900" : "text-slate-500"}`}>{step.label}</p>
                          {done && (
                            <Badge variant="success" size="sm">
                              {t("Done", "पूरा", "पूरा")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{step.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instant UPI Withdrawal Panel */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-800 text-white shadow-xs">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-xs font-bold text-emerald-950">
                      {t("Linked Farmer Bank VPA", "लिंक किया गया बैंक खाता", "जुड़े बैंक खाता")}
                    </h3>
                    <p className="text-[11px] text-emerald-900 font-mono font-semibold">farmer.kisansetu@sbi</p>
                  </div>
                </div>
                <Badge variant="gradeA" size="sm">{t("Verified", "सत्यापित", "सत्यापित")}</Badge>
              </div>

              <div className="rounded-lg bg-white border border-emerald-200 p-3 flex items-center justify-between shadow-2xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{t("Available for Payout", "निकासी योग्य राशि", "निकाले बर राशि")}</p>
                  <p className="font-display text-lg font-extrabold text-slate-900 tabular-nums">₹{stats.available.toLocaleString("en-IN")}</p>
                </div>
                <Button
                  size="sm"
                  variant="farmer"
                  disabled={payoutLoading || stats.available <= 0}
                  isLoading={payoutLoading}
                  onClick={() => handleManualWithdraw(stats.available)}
                  className="min-h-[36px]"
                >
                  {t("Instant Withdraw", "तत्काल निकासी", "तुरंत निकालव")}
                </Button>
              </div>
            </div>

            {/* Voucher Receipt CTA */}
            {orders.some((o) => o.status === "settled") && (
              <button
                type="button"
                onClick={() => setShowReceipt("latest")}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left transition hover:bg-slate-100/80 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t("View Official Mandi Receipt", "आधिकारिक मंडी रसीद देखें", "मंडी रसीद देखव")}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{t("UTR verification • Direct credit voucher", "UTR सत्यापन • सीधा क्रेडिट वाउचर", "UTR सत्यापन • सीधा क्रेडिट वाउचर")}</p>
                  </div>
                </div>
              </button>
            )}
          </Card>

          {/* Right: Tables & Ledgers */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* 2-Stage Escrow Ledger Breakdown */}
            {orders.length > 0 && (
              <Card className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="font-display text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-800" /> {t("Active Escrow Settlement Split (40/60)", "सक्रिय एस्क्रो विभाजन (40/60)", "चालू एस्क्रो बंटवारा (40/60)")}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {t("Stage 1 (40% upon dispatch scan) + Stage 2 (60% upon buyer weigh-in)", "चरण 1 (40% प्रेषण स्कैन पर) + चरण 2 (60% खरीदार तौल पर)", "चरण 1 (40% गाड़ी लोड म) + चरण 2 (60% तौल के बाद)")}
                  </p>
                </div>

                {orders.slice(0, 3).map((o) => (
                  <div key={o.id} className="rounded-xl border border-slate-200 p-3.5 space-y-2.5 bg-slate-50/70">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-slate-900">#{o.id} • {o.crop_type} ({o.quantity_kg.toLocaleString()} kg)</span>
                      <Badge
                        variant={o.status === "settled" ? "success" : o.status === "delivered" ? "buyer" : "warning"}
                        size="sm"
                      >
                        {o.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex h-5 rounded-lg overflow-hidden border border-slate-200 bg-white">
                        <div
                          className="bg-amber-600 flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ width: "40%" }}
                        >
                          {(o.status === "picked_up" || o.status === "delivered" || o.status === "settled") ? "✓ 40%" : "40%"}
                        </div>
                        <div
                          className={`flex items-center justify-center text-[10px] font-bold ${
                            o.status === "settled" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-500"
                          }`}
                          style={{ width: "60%" }}
                        >
                          {o.status === "settled" ? "✓ 60%" : "60%"}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-amber-800">₹{(o.total_amount * 0.4).toLocaleString("en-IN")} ({t("Dispatch 40%", "प्रेषण 40%", "लोड 40%")})</span>
                      <span className={o.status === "settled" ? "text-emerald-800 font-bold" : "text-slate-500"}>₹{(o.total_amount * 0.6).toLocaleString("en-IN")} ({t("Final 60%", "अंतिम 60%", "बाकी 60%")})</span>
                    </div>
                  </div>
                ))}
              </Card>
            )}

            {/* Produce Dispatch Ledger Table */}
            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 className="font-display text-sm font-extrabold text-slate-900">{t("Produce Dispatch Ledger", "उपज प्रेषण लेजर", "उपज प्रेषण लेजर")}</h2>
                <Badge variant="neutral" size="sm">
                  {orders.length} {t("Entries", "प्रविष्टियां", "प्रविष्टियां")}
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase font-bold text-slate-500">
                      <th className="px-4 py-3">{t("Lot ID", "लॉट आईडी", "लॉट आईडी")}</th>
                      <th className="px-4 py-3">{t("Produce", "फसल", "फसल")}</th>
                      <th className="px-4 py-3">{t("Weight", "वजन", "वजन")}</th>
                      <th className="px-4 py-3">{t("Net Amount", "शुद्ध राशि", "शुद्ध पईसा")}</th>
                      <th className="px-4 py-3">{t("Settlement", "निपटान स्थिति", "निपटान स्थिति")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.length === 0 && !loading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-xs font-medium">
                          {t("No orders registered yet.", "अभी कोई ऑर्डर पंजीकृत नहीं है।", "अभि कोनो ऑर्डर नइ हे।")}
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">#{o.id}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{o.crop_type}</td>
                          <td className="px-4 py-3 font-semibold text-slate-600 tabular-nums">{o.quantity_kg.toLocaleString()} {t("kg", "किग्रा", "किलो")}</td>
                          <td className="px-4 py-3 font-extrabold text-emerald-900 tabular-nums">₹{o.total_amount.toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={o.status === "settled" ? "success" : o.status === "delivered" ? "buyer" : "warning"}
                              size="sm"
                            >
                              {o.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Recent Bank / UPI Credits + Payout History */}
            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h2 className="font-display text-sm font-extrabold text-slate-900">{t("Recent Bank / UPI Credits", "हाल के बैंक / UPI क्रेडिट", "हाल के बैंक / UPI क्रेडिट")}</h2>
                <span className="text-[11px] font-bold text-slate-500 uppercase">{t("Direct Farm-Gate Vouchers", "सीधे फार्म-गेट वाउचर", "फार्म-गेट वाउचर")}</span>
              </div>

              {payoutHistory.length > 0 && (
                <div className="p-3 bg-emerald-50/50 border-b border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase mb-2">Instant Payout History</p>
                  {payoutHistory.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex justify-between items-center text-xs font-medium text-emerald-900 py-1 border-b border-emerald-100 last:border-0">
                      <span>Withdrawn • {new Date(p.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                      <span className="font-extrabold">-₹{p.amount.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs font-medium">{t("No transactions recorded.", "कोई लेन-देन दर्ज नहीं है।", "कोनो लेन-देन नइ हे।")}</div>
                ) : (
                  orders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                          o.status === "settled" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          <ArrowDownLeft className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{o.crop_type} {t("Settlement", "निपटान", "निपटान")}</p>
                          <p className="text-[11px] font-medium text-slate-500">
                            {new Date(o.created_at).toLocaleDateString("en-IN")} • {o.status === "settled" ? t("NPCI Settled", "NPCI पूर्ण", "NPCI पूर्ण") : t("Escrow Pending", "एस्क्रो लंबित", "बाकी")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-extrabold tabular-nums ${o.status === "settled" || o.status === "delivered" ? "text-emerald-900" : "text-amber-900"}`}>
                          +₹{o.total_amount.toLocaleString("en-IN")}
                        </span>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
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
            </Card>
          </div>
        </div>
      </div>

      {/* UPI Digital Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs" onClick={() => setShowReceipt(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden border border-slate-200 shadow-xl animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-900 p-6 text-white text-center relative">
              <button
                type="button"
                onClick={() => setShowReceipt(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-xs">
                <Check className="h-6 w-6" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">{t("Direct Bank Credit", "सीधा बैंक क्रेडिट", "सीधा बैंक क्रेडिट")}</p>
              <p className="mt-1 font-display text-3xl font-extrabold tracking-tight tabular-nums text-white">
                ₹{stats.settled.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="p-5 space-y-4 bg-slate-50">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 flex items-center gap-2 text-xs font-bold text-emerald-950">
                <ShieldCheck className="h-4 w-4 text-emerald-800" />
                {t("Verified NPCI Escrow Payout", "सत्यापित NPCI एस्क्रो भुगतान", "सत्यापित NPCI एस्क्रो भुगतान")}
              </div>

              <div className="space-y-2 text-xs bg-white border border-slate-200 p-3.5 rounded-xl font-medium shadow-2xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t("UTR Number", "UTR संख्या", "UTR नंबर")}</span>
                  <span className="font-mono font-bold text-slate-900">UTR{Date.now().toString().slice(-12)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t("Beneficiary", "लाभार्थी", "खाताधारक")}</span>
                  <span className="font-bold text-slate-900">farmer.kisansetu@sbi</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t("Timestamp", "समय", "समय")}</span>
                  <span className="font-semibold text-slate-900">{new Date().toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t("Settlement Type", "निपटान प्रकार", "तरीका")}</span>
                  <span className="font-bold text-emerald-900">{t("Final Delivery (60%)", "अंतिम डिलीवरी (60%)", "डिलीवरी (60%)")}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">{t("Middleman Cut", "बिचौलिया कमीशन", "दलाली")}</span>
                  <span className="font-extrabold text-emerald-800">₹0 (0.00%)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <Button
                variant="primary"
                className="w-full h-11 font-bold shadow-xs"
                onClick={() => setShowReceipt(null)}
              >
                {t("Close Voucher", "वाउचर बंद करें", "वाउचर बंद करव")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
