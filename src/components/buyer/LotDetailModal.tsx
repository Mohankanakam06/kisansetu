"use client";
import React, { useState, useEffect } from "react";
import { Lot } from "@/types";
import { Button } from "@/components/ui";
import { useLanguage } from "@/lib/language";
import { X, Truck, AlertTriangle, Leaf, Check, PackageCheck } from "lucide-react";

interface LotDetailModalProps {
  lot: Lot;
  onClose: () => void;
  onOrderConfirm: (lot: Lot, qty: number) => void;
}

export default function LotDetailModal({ lot, onClose, onOrderConfirm }: LotDetailModalProps) {
  const { t } = useLanguage();
  const [qtyRaw, setQtyRaw] = useState<string>(lot.total_quantity_kg.toString());
  const [isPlacing, setIsPlacing] = useState(false);
  const qty = Math.max(0, parseInt(qtyRaw) || 0);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const maxQty = lot.total_quantity_kg;
  const minQty = Math.min(100, maxQty);
  const isInvalid = qty < minQty || qty > maxQty;

  const isGradeA = lot.grade === "A";
  const pooledCount = lot.listings_count || 3;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-extrabold text-slate-950">{t("Place B2B Order", "B2B ऑर्डर दर्ज करें", "B2B ऑर्डर दर्ज करव")}</h2>
              {isGradeA && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5">
                  <PackageCheck className="h-2.5 w-2.5" /> {t("Certified", "प्रमाणित", "प्रमाणित")}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs font-semibold text-slate-500">
                {t("Lot", "लॉट", "लॉट")} #{lot.id} • {lot.crop_type}
              </p>
              <div className="h-3 border-l border-slate-300"></div>
              {isGradeA ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black text-emerald-800 bg-emerald-100">
                  <Leaf className="h-2.5 w-2.5" /> {t("Grade A", "ग्रेड A", "ग्रेड A")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-800 bg-amber-100">
                  <Check className="h-2.5 w-2.5" /> {t("Grade B", "ग्रेड B", "ग्रेड B")}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:text-slate-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase text-slate-500">{t("Available Pooled", "उपलब्ध पूल्ड", "उपलब्ध पूल्ड")}</p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-600 bg-slate-200">
                  {pooledCount} {t("farms", "खेत", "खेत")}
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{lot.total_quantity_kg.toLocaleString()} <span className="text-sm font-bold text-slate-500">{t("kg", "किग्रा", "किलो")}</span></p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase text-emerald-800">{t("KisanSetu Direct Rate", "KisanSetu सीधी दर", "KisanSetu सीधा भाव")}</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-900 mt-1">₹{lot.price_per_kg}<span className="text-sm font-bold text-emerald-700">/{t("kg", "किग्रा", "किलो")}</span></p>
            </div>
          </div>

          <div className="space-y-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-900">{t("Order Quantity", "ऑर्डर मात्रा", "ऑर्डर मात्रा")} ({t("kg", "किग्रा", "किलो")})</label>
              <div className="flex gap-1.5">
                {[100, Math.floor(maxQty / 2), maxQty].map(v => (
                  <button key={v} onClick={() => setQtyRaw(v.toString())} className="text-[10px] font-black uppercase bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 hover:bg-emerald-100 hover:text-emerald-800 transition-colors active:scale-95">
                    {v === maxQty ? t("Max", "अधिकतम", "ज्यादा") : `${v}${t("kg", "किग्रा", "किलो")}`}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              value={qtyRaw}
              onChange={(e) => setQtyRaw(e.target.value)}
              className={`w-full rounded-xl border-2 px-4 py-3 text-base sm:text-lg font-black focus:ring-2 focus:outline-none transition-all ${isInvalid ? "border-red-300 bg-red-50 text-red-900 ring-red-100" : "border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-500 focus:bg-white focus:ring-emerald-100"}`}
              placeholder={t("Quantity in kg", "मात्रा (किग्रा में)", "मात्रा (किलो म)")}
            />
            {isInvalid && (
              <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> {t(`Minimum ${minQty}kg required. Maximum ${maxQty}kg available.`, `न्यूनतम ${minQty} किग्रा आवश्यक। अधिकतम ${maxQty} किग्रा उपलब्ध।`, `कम से कम ${minQty} किलो चाही। ज्यादा से ज्यादा ${maxQty} किलो हे।`)}
              </p>
            )}
          </div>

          {/* Pricing breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">{t("Order Summary", "ऑर्डर सारांश", "ऑर्डर बिबरन")}</h4>
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-sm py-1">
                <span className="text-slate-600 font-medium">{t("Produce Value", "उपज मूल्य", "उपज के भाव")} ({qty} {t("kg", "किग्रा", "किलो")} @ ₹{lot.price_per_kg})</span>
                <span className="font-bold text-slate-900">₹{(qty * lot.price_per_kg).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm py-1 text-emerald-700">
                <span className="flex items-center gap-1.5 font-bold">
                  <Truck className="h-4 w-4" /> {t("AI Logistics & Routing Est.", "AI लॉजिस्टिक्स एवं रूटिंग अनुमान", "AI लॉजिस्टिक्स आ रूटिंग अनुमान")}
                </span>
                <span className="font-bold">₹{(qty * 0.5).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm py-1 text-slate-500">
                <span className="font-medium">{t("KisanSetu Trust Escrow (1.5%)", "KisanSetu सुरक्षा एस्क्रो (1.5%)", "KisanSetu सुरक्षा एस्क्रो (1.5%)")}</span>
                <span className="font-bold">₹{Math.round(qty * lot.price_per_kg * 0.015).toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm font-black text-slate-900 uppercase">{t("Total Estimate", "कुल अनुमानित राशि", "कुल अनुमानित राशि")}</span>
              <span className="text-2xl font-black text-slate-950 font-mono">
                ₹{Math.round(qty * lot.price_per_kg + (qty * 0.5) + (qty * lot.price_per_kg * 0.015)).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 bg-white border-t border-slate-100 flex gap-3 sticky bottom-0 rounded-b-3xl">
          <Button variant="secondary" className="flex-1 rounded-xl h-12" onClick={onClose}>{t("Cancel", "रद्द करें", "रद्द करव")}</Button>
          <Button
            variant="primary"
            className="flex-1 rounded-xl shadow-sm h-12"
            isLoading={isPlacing}
            disabled={isInvalid || qty === 0}
            onClick={async () => {
              setIsPlacing(true);
              await onOrderConfirm(lot, qty);
              setIsPlacing(false);
            }}
          >
            {t("Confirm & Order", "पुष्टि करें और ऑर्डर दें", "पक्का करव आ ऑर्डर देव")}
          </Button>
        </div>
      </div>
    </div>
  );
}
