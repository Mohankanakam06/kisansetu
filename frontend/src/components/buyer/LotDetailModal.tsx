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
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">{t("Place Wholesale Order", "थोक ऑर्डर दर्ज करें", "थोक ऑर्डर दर्ज करव")}</h2>
              {isGradeA && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5">
                  <PackageCheck className="h-3 w-3" /> {t("Certified", "प्रमाणित", "प्रमाणित")}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs font-semibold text-slate-500">
                {t("Lot", "लॉट", "लॉट")} #{lot.id} • {lot.crop_type}
              </p>
              <div className="h-3 w-px bg-slate-200"></div>
              {isGradeA ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
                  <Leaf className="h-3 w-3" /> {t("Grade A", "ग्रेड A", "ग्रेड A")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200">
                  <Check className="h-3 w-3" /> {t("Grade B", "ग्रेड B", "ग्रेड B")}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{t("Available Pooled", "उपलब्ध पूल्ड", "उपलब्ध पूल्ड")}</p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold text-slate-700 bg-white border border-slate-200">
                  {pooledCount} {t("farms", "खेत", "खेत")}
                </span>
              </div>
              <p className="text-xl font-black text-slate-900 mt-1 tabular-nums">{lot.total_quantity_kg.toLocaleString()} <span className="text-xs font-semibold text-slate-500">{t("kg", "किग्रा", "किलो")}</span></p>
            </div>
            <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-3.5 shadow-2xs">
              <p className="text-[10px] font-bold uppercase text-blue-700 tracking-wider">{t("Direct Rate", "सीधी दर", "सीधा भाव")}</p>
              <p className="text-xl font-black text-blue-950 mt-1 tabular-nums">₹{lot.price_per_kg}<span className="text-xs font-semibold text-blue-700 font-sans">/{t("kg", "किग्रा", "किलो")}</span></p>
            </div>
          </div>

          <div className="space-y-2 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-700">{t("Order Quantity", "ऑर्डर मात्रा", "ऑर्डर मात्रा")} ({t("kg", "किग्रा", "किलो")})</label>
              <div className="flex gap-1.5">
                {[100, Math.floor(maxQty / 2), maxQty].map(v => (
                  <button key={v} onClick={() => setQtyRaw(v.toString())} className="text-[10px] font-bold uppercase bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-200 transition-colors cursor-pointer">
                    {v === maxQty ? t("Max", "अधिकतम", "ज्यादा") : `${v}${t("kg", "किग्रा", "किलो")}`}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              value={qtyRaw}
              onChange={(e) => setQtyRaw(e.target.value)}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-base font-bold focus:bg-white focus:outline-none focus:ring-2 transition-all tabular-nums ${isInvalid ? "border-rose-300 bg-rose-50 text-rose-800 focus:ring-rose-200" : "border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-600 focus:ring-blue-100"}`}
              placeholder={t("Quantity in kg", "मात्रा (किग्रा में)", "मात्रा (किलो म)")}
            />
            {isInvalid && (
              <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {t(`Min ${minQty}kg. Max ${maxQty}kg available.`, `न्यूनतम ${minQty} किग्रा। अधिकतम ${maxQty} किग्रा।`, `कम से कम ${minQty} किलो। ज्यादा से ज्यादा ${maxQty} किलो।`)}
              </p>
            )}
          </div>

          {/* Pricing ledger breakdown */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 shadow-2xs">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">{t("Ledger Estimate", "लेजर सारांश", "लेजर बिबरन")}</h4>
            <div className="space-y-2 pt-0.5 text-xs">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>{t("Produce Value", "उपज मूल्य", "उपज भाव")} ({qty} kg @ ₹{lot.price_per_kg})</span>
                <span className="tabular-nums font-bold text-slate-900">₹{(qty * lot.price_per_kg).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-semibold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-blue-700" /> {t("Consolidated Logistics", "एकत्रित लॉजिस्टिक्स", "लॉजिस्टिक्स")}
                </span>
                <span className="tabular-nums font-bold">₹{(qty * 0.5).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-600">
                <span>{t("Escrow Security (1.5%)", "सुरक्षा एस्क्रो (1.5%)", "सुरक्षा एस्क्रो (1.5%)")}</span>
                <span className="tabular-nums font-bold text-slate-800">₹{Math.round(qty * lot.price_per_kg * 0.015).toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="pt-2.5 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-900 uppercase">{t("Total Settlement", "कुल राशि", "कुल राशि")}</span>
              <span className="text-xl font-extrabold text-blue-950 tabular-nums font-mono">
                ₹{Math.round(qty * lot.price_per_kg + (qty * 0.5) + (qty * lot.price_per_kg * 0.015)).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex gap-3 sticky bottom-0">
          <Button variant="outline" className="flex-1 h-11" onClick={onClose}>{t("Cancel", "रद्द करें", "रद्द करव")}</Button>
          <Button
            variant="buyer"
            className="flex-1 h-11 font-bold shadow-xs"
            isLoading={isPlacing}
            disabled={isInvalid || qty === 0}
            onClick={async () => {
              setIsPlacing(true);
              await onOrderConfirm(lot, qty);
              setIsPlacing(false);
            }}
          >
            {t("Confirm & Place Order", "पुष्टि करें और ऑर्डर दें", "पक्का करव आ ऑर्डर देव")}
          </Button>
        </div>
      </div>
    </div>
  );
}
