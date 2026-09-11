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
  Landmark,
  ArrowUpRight,
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
      sub: t("Bank cleared • Direct to account", "बैंक में जमा • सीधा खाते में", "बैंक म जमा • सीधा खाता म"),
      stageKey: ["settled"],
      pct: "100%",
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#EBECE8]">
      {/* Top Header */}
      <div className="border-b-2 border-[#1E1F1C] bg-[#EBECE8] py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#d7e8db] text-[#112816] text-[10px] font-black uppercase px-2 py-0.5 border-2 border-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#386641]" /> {t("UPI Escrow Protected Settlements", "UPI एस्क्रो सुरक्षित भुगतान", "UPI एस्क्रो सुरक्षित भुगतान")}
              </span>
            </div>
            <h1 className="font-display text-3xl font-black tracking-tight text-[#1E1F1C]">
              {t("Farmer Earnings & Ledger", "किसान कमाई एवं लेजर", "किसान कमाई आ बहीखाता")}
            </h1>
            <p className="text-xs font-bold text-[#52544D]">
              {t(
                "Direct farm-gate payouts, UPI settlement vouchers, and downloadable tax ledgers.",
                "सीधा खेत से भुगतान, UPI निपटान वाउचर और डाउनलोड करने योग्य लेजर।",
                "सीधा खेत ले भुगतान, UPI वाउचर आ डाउनलोड करे के लेजर।"
              )}
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-sm bg-[#1E1F1C] px-5 py-3 text-xs font-black text-white hover:bg-[#333530] transition border-2 border-[#1E1F1C] shadow-[3px_3px_0_0_#1E1F1C] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer self-start md:self-auto uppercase tracking-wide"
          >
            {downloaded ? <Check className="h-4 w-4 text-[#386641]" /> : <Download className="h-4 w-4" />}
            {downloaded
              ? t("Ledger Downloaded!", "लेजर डाउनलोड हो गया!", "लेजर डाउनलोड हो गे!")
              : t("Download Mandi Ledger", "मंडी लेजर डाउनलोड करें", "मंडी लेजर डाउनलोड करव")}
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Overview KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Settled YTD */}
          <div className="rounded-sm border-2 border-[#1E1F1C] bg-[#d7e8db] p-5 shadow-[4px_4px_0_0_#1E1F1C] text-[#112816] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#112816]">
                  {t("Total Net Settled YTD", "कुल शुद्ध निपटान (इस वर्ष)", "कुल शुद्ध कमाई (ए बछर)")}
                </p>
                <div className="h-8 w-8 rounded-sm bg-white border-2 border-[#1E1F1C] flex items-center justify-center shadow-[2px_2px_0_0_#1E1F1C]">
                  <Landmark className="h-4 w-4 text-[#1E1F1C]" />
                </div>
              </div>
              <p className="mt-3 font-display text-3xl font-black tracking-tight tabular-nums text-[#112816]">
                ₹{stats.settled.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-white border-2 border-[#1E1F1C] px-2.5 py-1 text-[11px] font-black text-[#112816] w-fit shadow-[1px_1px_0_0_#1E1F1C]">
              <TrendingUp className="h-3.5 w-3.5 text-[#386641]" /> {t("+38% vs APMC Middlemen", "मंडी बिचौलियों की तुलना में +38%", "मंडी दलाल मन ले +38% जादा")}
            </div>
          </div>

          {/* Pending Escrow */}
          <div className="rounded-sm border-2 border-[#1E1F1C] bg-[#faedd9] p-5 shadow-[4px_4px_0_0_#1E1F1C] text-[#78350f] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#78350f]">
                  {t("Locked in Escrow (In-Transit)", "एस्क्रो में सुरक्षित (पारगमन)", "एस्क्रो म जमा (रस्ता म)")}
                </p>
                <div className="h-8 w-8 rounded-sm bg-white border-2 border-[#1E1F1C] flex items-center justify-center shadow-[2px_2px_0_0_#1E1F1C]">
                  <Clock className="h-4 w-4 text-[#78350f]" />
                </div>
              </div>
              <p className="mt-3 font-display text-3xl font-black tracking-tight tabular-nums text-[#78350f]">
                ₹{Math.round(stats.pending).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-white border-2 border-[#1E1F1C] px-2.5 py-1 text-[11px] font-black text-[#78350f] w-fit shadow-[1px_1px_0_0_#1E1F1C]">
              <Clock className="h-3.5 w-3.5 text-[#C04A22]" /> {t("40% Pickup + 60% Delivery", "40% पिकअप + 60% डिलीवरी", "40% लोड + 60% डिलीवरी")}
            </div>
          </div>

          {/* Active Orders */}
          <div className="rounded-sm border-2 border-[#1E1F1C] bg-white p-5 shadow-[4px_4px_0_0_#1E1F1C] text-[#1E1F1C] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#52544D]">
                  {t("Active Produce Lots", "सक्रिय उपज लॉट्स", "चालू लॉट मन")}
                </p>
                <div className="h-8 w-8 rounded-sm bg-[#EBECE8] border-2 border-[#1E1F1C] flex items-center justify-center shadow-[2px_2px_0_0_#1E1F1C]">
                  <Package className="h-4 w-4 text-[#1E1F1C]" />
                </div>
              </div>
              <p className="mt-3 font-display text-3xl font-black tracking-tight tabular-nums text-[#1E1F1C]">{stats.active}</p>
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-[#EBECE8] border-2 border-[#1E1F1C] px-2.5 py-1 text-[11px] font-black text-[#1E1F1C] w-fit shadow-[1px_1px_0_0_#1E1F1C]">
              <ListChecks className="h-3.5 w-3.5 text-[#1E1F1C]" /> {orders.length} {t("Total Dispatches", "कुल प्रेषण", "कुल प्रेषण")}
            </div>
          </div>
        </div>

        {/* Main Grid 2-column */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left: Milestone Timeline & Instant Transfer */}
          <div className="lg:col-span-2 rounded-sm border-2 border-[#1E1F1C] bg-white p-5 sm:p-6 shadow-[4px_4px_0_0_#1E1F1C] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E1F1C]">
              <h2 className="font-display text-base font-black text-[#1E1F1C] flex items-center gap-2">
                <Banknote className="h-5 w-5 text-[#C04A22]" /> {t("Escrow Payout Timeline", "एस्क्रो भुगतान समयरेखा", "भुगतान पड़ाव समयरेखा")}
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#d7e8db] border-2 border-[#1E1F1C] text-[#112816] rounded-sm">
                {t("NPCI / UPI", "NPCI / UPI", "NPCI / UPI")}
              </span>
            </div>

            <div className="relative pl-5">
              {/* Track line */}
              <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-[#1E1F1C]" />

              <div className="space-y-6">
                {TIMELINE.map((step, i) => {
                  const done = orders.some((o) => step.stageKey.includes(o.status));
                  return (
                    <div key={i} className="relative flex items-start gap-3.5">
                      <span
                        className={`relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-sm border-2 border-[#1E1F1C] text-xs font-black transition-all ${
                          done
                            ? "bg-[#386641] text-white shadow-[2px_2px_0_0_#1E1F1C]"
                            : "bg-[#EBECE8] text-[#52544D]"
                        }`}
                      >
                        {done ? <Check className="h-4 w-4" /> : <span className="text-[10px] font-black">{step.pct}</span>}
                      </span>
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-black uppercase ${done ? "text-[#1E1F1C]" : "text-[#52544D]"}`}>{step.label}</p>
                          {done && (
                            <span className="rounded-sm bg-[#d7e8db] text-[#112816] px-1.5 py-0.2 text-[9px] font-black border border-[#1E1F1C]">
                              {t("Done", "पूरा", "पूरा")}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-[#52544D] mt-0.5">{step.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instant UPI Withdrawal Panel */}
            <div className="rounded-sm border-2 border-[#1E1F1C] bg-[#d7e8db] p-4 space-y-3 shadow-[2px_2px_0_0_#1E1F1C]">
              <div className="flex items-center justify-between border-b-2 border-[#1E1F1C] pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#1E1F1C] text-white">
                    <IndianRupee className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xs font-black text-[#112816] uppercase">
                      {t("Linked Farmer Bank VPA", "लिंक किया गया बैंक खाता", "जुड़े बैंक खाता")}
                    </h3>
                    <p className="text-[10px] text-[#112816] font-mono font-bold">farmer.kisansetu@sbi</p>
                  </div>
                </div>
                <span className="rounded-sm bg-white border border-[#1E1F1C] text-[#112816] px-1.5 py-0.5 text-[9px] font-black uppercase">
                  {t("Verified", "सत्यापित", "सत्यापित")}
                </span>
              </div>

              <div className="rounded-sm bg-white border-2 border-[#1E1F1C] p-3 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-[#52544D] uppercase">{t("Available for Payout", "निकासी योग्य राशि", "निकाले बर राशि")}</p>
                  <p className="font-display text-lg font-black text-[#1E1F1C] tabular-nums">₹{stats.settled.toLocaleString("en-IN")}</p>
                </div>
                <Button
                  size="sm"
                  variant="farmer"
                  disabled={payoutLoading || stats.settled <= 0}
                  isLoading={payoutLoading}
                  onClick={() => handleManualWithdraw(stats.settled)}
                >
                  {t("Instant Withdraw", "तत्काल निकासी", "तुरंत निकालव")}
                </Button>
              </div>
            </div>

            {/* Voucher Receipt CTA */}
            {orders.some((o) => o.status === "settled") && (
              <button
                onClick={() => setShowReceipt("latest")}
                className="w-full rounded-sm border-2 border-[#1E1F1C] bg-[#EBECE8] p-3.5 text-left transition hover:bg-white shadow-[2px_2px_0_0_#1E1F1C] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#1E1F1C] text-white border-2 border-[#1E1F1C]">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#1E1F1C] uppercase">{t("View Official Mandi Receipt", "आधिकारिक मंडी रसीद देखें", "मंडी रसीद देखव")}</p>
                    <p className="text-[10px] font-bold text-[#52544D]">{t("UTR verification • Direct credit voucher", "UTR सत्यापन • सीधा क्रेडिट वाउचर", "UTR सत्यापन • सीधा क्रेडिट वाउचर")}</p>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Right: Tables & Ledgers */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* 2-Stage Escrow Ledger Breakdown */}
            {orders.length > 0 && (
              <div className="rounded-sm border-2 border-[#1E1F1C] bg-white p-5 shadow-[4px_4px_0_0_#1E1F1C] space-y-4">
                <div className="border-b-2 border-[#1E1F1C] pb-3">
                  <h2 className="font-display text-sm font-black text-[#1E1F1C] flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#386641]" /> {t("Active Escrow Settlement Split (40/60)", "सक्रिय एस्क्रो विभाजन (40/60)", "चालू एस्क्रो बंटवारा (40/60)")}
                  </h2>
                  <p className="text-[11px] font-bold text-[#52544D] mt-0.5">
                    {t("Stage 1 (40% upon dispatch scan) + Stage 2 (60% upon buyer weigh-in)", "चरण 1 (40% प्रेषण स्कैन पर) + चरण 2 (60% खरीदार तौल पर)", "चरण 1 (40% गाड़ी लोड म) + चरण 2 (60% तौल के बाद)")}
                  </p>
                </div>

                {orders.slice(0, 3).map((o) => (
                  <div key={o.id} className="rounded-sm border-2 border-[#1E1F1C] p-3 space-y-2.5 bg-[#EBECE8]">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-black text-[#1E1F1C]">#{o.id} • {o.crop_type} ({o.quantity_kg} kg)</span>
                      <span className={`inline-flex rounded-sm border-2 border-[#1E1F1C] px-2 py-0.2 text-[9px] font-black uppercase ${
                        o.status === "settled" ? "bg-[#d7e8db] text-[#112816]" :
                        o.status === "delivered" ? "bg-[#d9e9f2] text-[#082130]" :
                        "bg-[#faedd9] text-[#78350f]"
                      }`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex h-6 rounded-sm overflow-hidden border-2 border-[#1E1F1C] bg-white">
                        <div
                          className="bg-[#C04A22] flex items-center justify-center text-[9px] font-black text-white border-r border-[#1E1F1C]"
                          style={{ width: "40%" }}
                        >
                          {(o.status === "picked_up" || o.status === "delivered" || o.status === "settled") ? "✓ 40%" : "40%"}
                        </div>
                        <div
                          className={`flex items-center justify-center text-[9px] font-black ${
                            o.status === "settled" ? "bg-[#386641] text-white" : "bg-[#EBECE8] text-[#52544D]"
                          }`}
                          style={{ width: "60%" }}
                        >
                          {o.status === "settled" ? "✓ 60%" : "60%"}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-[#C04A22]">₹{(o.total_amount * 0.4).toLocaleString("en-IN")} ({t("Dispatch 40%", "प्रेषण 40%", "लोड 40%")})</span>
                      <span className={o.status === "settled" ? "text-[#386641]" : "text-[#52544D]"}>₹{(o.total_amount * 0.6).toLocaleString("en-IN")} ({t("Final 60%", "अंतिम 60%", "बाकी 60%")})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active Listings Status Table */}
            <div className="overflow-hidden rounded-sm border-2 border-[#1E1F1C] bg-white shadow-[4px_4px_0_0_#1E1F1C]">
              <div className="p-4 border-b-2 border-[#1E1F1C] bg-[#EBECE8] flex items-center justify-between">
                <h2 className="font-display text-sm font-black text-[#1E1F1C] uppercase tracking-wide">{t("Produce Dispatch Ledger", "उपज प्रेषण लेजर", "उपज प्रेषण लेजर")}</h2>
                <span className="text-xs font-black px-2 py-0.5 bg-white border border-[#1E1F1C] rounded-sm text-[#1E1F1C]">
                  {orders.length} {t("Entries", "प्रविष्टियां", "प्रविष्टियां")}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-[#1E1F1C] bg-[#EBECE8] text-[10px] uppercase font-black tracking-wider text-[#52544D]">
                      <th className="px-4 py-2.5">{t("Lot ID", "लॉट आईडी", "लॉट आईडी")}</th>
                      <th className="px-4 py-2.5">{t("Produce", "फसल", "फसल")}</th>
                      <th className="px-4 py-2.5">{t("Weight", "वजन", "वजन")}</th>
                      <th className="px-4 py-2.5">{t("Net Amount", "शुद्ध राशि", "शुद्ध पईसा")}</th>
                      <th className="px-4 py-2.5">{t("Settlement", "निपटान स्थिति", "निपटान स्थिति")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#1E1F1C]">
                    {orders.length === 0 && !loading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-[#52544D] text-xs font-bold">
                          {t("No orders registered yet.", "अभी कोई ऑर्डर पंजीकृत नहीं है।", "अभि कोनो ऑर्डर नइ हे।")}
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="hover:bg-[#EBECE8]/50 transition-colors">
                          <td className="px-4 py-3 font-mono font-black text-[#1E1F1C]">#{o.id}</td>
                          <td className="px-4 py-3 font-black text-[#1E1F1C]">{o.crop_type}</td>
                          <td className="px-4 py-3 font-bold text-[#52544D] tabular-nums">{o.quantity_kg} {t("kg", "किग्रा", "किलो")}</td>
                          <td className="px-4 py-3 font-black text-[#112816] tabular-nums">₹{o.total_amount.toLocaleString("en-IN")}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded-sm border border-[#1E1F1C] text-[9px] font-black uppercase ${
                              o.status === "settled" ? "bg-[#d7e8db] text-[#112816]" :
                              o.status === "delivered" ? "bg-[#d9e9f2] text-[#082130]" :
                              "bg-[#faedd9] text-[#78350f]"
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Settlement Transactions */}
            <div className="overflow-hidden rounded-sm border-2 border-[#1E1F1C] bg-white shadow-[4px_4px_0_0_#1E1F1C]">
              <div className="p-4 border-b-2 border-[#1E1F1C] bg-[#EBECE8] flex items-center justify-between">
                <h2 className="font-display text-sm font-black text-[#1E1F1C] uppercase tracking-wide">{t("Recent Bank / UPI Credits", "हाल के बैंक / UPI क्रेडिट", "हाल के बैंक / UPI क्रेडिट")}</h2>
                <span className="text-[10px] font-black text-[#52544D] uppercase">{t("Direct Farm-Gate Vouchers", "सीधे फार्म-गेट वाउचर", "फार्म-गेट वाउचर")}</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto divide-y-2 divide-[#1E1F1C]">
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-[#52544D] text-xs font-bold">{t("No transactions recorded.", "कोई लेन-देन दर्ज नहीं है।", "कोनो लेन-देन नइ हे।")}</div>
                ) : (
                  orders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#EBECE8]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border-2 border-[#1E1F1C] ${
                          o.status === "settled" ? "bg-[#d7e8db] text-[#112816]" : "bg-[#faedd9] text-[#78350f]"
                        }`}>
                          <ArrowDownLeft className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-[#1E1F1C] truncate uppercase">{o.crop_type} {t("Settlement", "निपटान", "निपटान")}</p>
                          <p className="text-[10px] font-bold text-[#52544D]">
                            {new Date(o.created_at).toLocaleDateString("en-IN")} • {o.status === "settled" ? t("NPCI Settled", "NPCI पूर्ण", "NPCI पूर्ण") : t("Escrow Pending", "एस्क्रो लंबित", "बाकी")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-black tabular-nums ${o.status === "settled" || o.status === "delivered" ? "text-[#112816]" : "text-[#78350f]"}`}>
                          +₹{o.total_amount.toLocaleString("en-IN")}
                        </span>
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded-sm border border-[#1E1F1C] bg-[#EBECE8] text-[#1E1F1C] hover:bg-white cursor-pointer shadow-[1px_1px_0_0_#1E1F1C]"
                          title={t("View Receipt", "रसीद देखें", "रसीद देखव")}
                          onClick={() => setShowReceipt(o.id)}
                        >
                          <Receipt className="h-3.5 w-3.5" />
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
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#1E1F1C]/60 backdrop-blur-xs" onClick={() => setShowReceipt(null)}>
          <div className="bg-white rounded-sm w-full max-w-sm overflow-hidden border-2 border-[#1E1F1C] shadow-[6px_6px_0_0_#1E1F1C] animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#1E1F1C] p-6 text-white text-center relative border-b-2 border-[#1E1F1C]">
              <button
                onClick={() => setShowReceipt(null)}
                className="absolute right-3 top-3 text-white hover:text-[#F4A261] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-sm bg-[#386641] border border-white text-white">
                <Check className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#F4A261]">{t("Direct Bank Credit", "सीधा बैंक क्रेडिट", "सीधा बैंक क्रेडिट")}</p>
              <p className="mt-1 font-display text-3xl font-black tracking-tight tabular-nums text-white">
                ₹{stats.settled.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="p-5 space-y-3.5 bg-[#EBECE8]">
              <div className="rounded-sm bg-white border-2 border-[#1E1F1C] p-2.5 flex items-center gap-2 text-[10px] font-black uppercase text-[#112816]">
                <ShieldCheck className="h-4 w-4 text-[#386641]" />
                {t("Verified NPCI Escrow Payout", "सत्यापित NPCI एस्क्रो भुगतान", "सत्यापित NPCI एस्क्रो भुगतान")}
              </div>

              <div className="space-y-2 text-xs bg-white border-2 border-[#1E1F1C] p-3 rounded-sm font-bold">
                <div className="flex justify-between py-1 border-b border-[#1E1F1C]/20">
                  <span className="text-[#52544D]">{t("UTR Number", "UTR संख्या", "UTR नंबर")}</span>
                  <span className="font-mono font-black text-[#1E1F1C]">UTR{Date.now().toString().slice(-12)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1E1F1C]/20">
                  <span className="text-[#52544D]">{t("Beneficiary", "लाभार्थी", "खाताधारक")}</span>
                  <span className="font-black text-[#1E1F1C]">farmer.kisansetu@sbi</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1E1F1C]/20">
                  <span className="text-[#52544D]">{t("Timestamp", "समय", "समय")}</span>
                  <span className="font-black text-[#1E1F1C]">{new Date().toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1E1F1C]/20">
                  <span className="text-[#52544D]">{t("Settlement Type", "निपटान प्रकार", "तरीका")}</span>
                  <span className="font-black text-[#112816]">{t("Final Delivery (60%)", "अंतिम डिलीवरी (60%)", "डिलीवरी (60%)")}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#52544D]">{t("Middleman Cut", "बिचौलिया कमीशन", "दलाली")}</span>
                  <span className="font-black text-[#386641]">₹0 (0.00%)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#EBECE8] border-t-2 border-[#1E1F1C]">
              <Button
                variant="primary"
                className="w-full"
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
