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
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#1E1F1C]/60 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose}>
      <div
        className="bg-white rounded-sm w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto border-2 border-[#1E1F1C] shadow-[6px_6px_0_0_#1E1F1C] animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[#1E1F1C] flex items-center justify-between sticky top-0 bg-[#EBECE8] z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg sm:text-xl font-black text-[#1E1F1C]">{t("Place Wholesale Order", "थोक ऑर्डर दर्ज करें", "थोक ऑर्डर दर्ज करव")}</h2>
              {isGradeA && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase text-[#112816] bg-[#d7e8db] border-2 border-[#1E1F1C] rounded-sm px-1.5 py-0.5">
                  <PackageCheck className="h-3 w-3" /> {t("Certified", "प्रमाणित", "प्रमाणित")}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs font-bold text-[#52544D]">
                {t("Lot", "लॉट", "लॉट")} #{lot.id} • {lot.crop_type}
              </p>
              <div className="h-3 border-l-2 border-[#1E1F1C]"></div>
              {isGradeA ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-sm text-[10px] font-black text-[#112816] bg-[#d7e8db] border-2 border-[#1E1F1C]">
                  <Leaf className="h-2.5 w-2.5" /> {t("Grade A", "ग्रेड A", "ग्रेड A")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-sm text-[10px] font-black text-[#78350f] bg-[#faedd9] border-2 border-[#1E1F1C]">
                  <Check className="h-2.5 w-2.5" /> {t("Grade B", "ग्रेड B", "ग्रेड B")}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="rounded-sm border-2 border-[#1E1F1C] bg-white p-1 text-[#1E1F1C] hover:bg-[#EBECE8] shadow-[2px_2px_0_0_#1E1F1C] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-sm bg-[#EBECE8] border-2 border-[#1E1F1C] p-3 shadow-[2px_2px_0_0_#1E1F1C]">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase text-[#52544D]">{t("Available Pooled", "उपलब्ध पूल्ड", "उपलब्ध पूल्ड")}</p>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-sm text-[9px] font-black text-[#1E1F1C] bg-white border border-[#1E1F1C]">
                  {pooledCount} {t("farms", "खेत", "खेत")}
                </span>
              </div>
              <p className="text-xl font-black text-[#1E1F1C] mt-1 tabular-nums">{lot.total_quantity_kg.toLocaleString()} <span className="text-xs font-bold text-[#52544D]">{t("kg", "किग्रा", "किलो")}</span></p>
            </div>
            <div className="rounded-sm bg-[#d9e9f2] border-2 border-[#1E1F1C] p-3 shadow-[2px_2px_0_0_#1E1F1C]">
              <p className="text-[10px] font-black uppercase text-[#082130]">{t("Direct Rate", "सीधी दर", "सीधा भाव")}</p>
              <p className="text-xl font-black text-[#1B4965] mt-1 tabular-nums">₹{lot.price_per_kg}<span className="text-xs font-bold text-[#1B4965]">/{t("kg", "किग्रा", "किलो")}</span></p>
            </div>
          </div>

          <div className="space-y-2 bg-white border-2 border-[#1E1F1C] rounded-sm p-3.5 shadow-[2px_2px_0_0_#1E1F1C]">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase tracking-wide text-[#1E1F1C]">{t("Order Quantity", "ऑर्डर मात्रा", "ऑर्डर मात्रा")} ({t("kg", "किग्रा", "किलो")})</label>
              <div className="flex gap-1">
                {[100, Math.floor(maxQty / 2), maxQty].map(v => (
                  <button key={v} onClick={() => setQtyRaw(v.toString())} className="text-[10px] font-black uppercase bg-[#EBECE8] border border-[#1E1F1C] px-2 py-0.5 rounded-sm text-[#1E1F1C] hover:bg-[#d9e9f2] hover:text-[#1B4965] transition-colors cursor-pointer">
                    {v === maxQty ? t("Max", "अधिकतम", "ज्यादा") : `${v}${t("kg", "किग्रा", "किलो")}`}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              value={qtyRaw}
              onChange={(e) => setQtyRaw(e.target.value)}
              className={`w-full rounded-sm border-2 px-3 py-2 text-base font-black focus:bg-white focus:outline-none transition-all tabular-nums ${isInvalid ? "border-[#C04A22] bg-[#fae8e0] text-[#C04A22]" : "border-[#1E1F1C] bg-[#EBECE8] text-[#1E1F1C]"}`}
              placeholder={t("Quantity in kg", "मात्रा (किग्रा में)", "मात्रा (किलो म)")}
            />
            {isInvalid && (
              <p className="text-[10px] font-bold text-[#C04A22] flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> {t(`Min ${minQty}kg. Max ${maxQty}kg available.`, `न्यूनतम ${minQty} किग्रा। अधिकतम ${maxQty} किग्रा।`, `कम से कम ${minQty} किलो। ज्यादा से ज्यादा ${maxQty} किलो।`)}
              </p>
            )}
          </div>

          {/* Pricing ledger breakdown */}
          <div className="rounded-sm border-2 border-[#1E1F1C] bg-[#EBECE8] p-3.5 space-y-2.5 shadow-[2px_2px_0_0_#1E1F1C]">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#52544D] border-b-2 border-[#1E1F1C] pb-1.5">{t("Ledger Estimate", "लेजर सारांश", "लेजर बिबरन")}</h4>
            <div className="space-y-1.5 pt-0.5 text-xs">
              <div className="flex justify-between font-bold text-[#1E1F1C]">
                <span>{t("Produce Value", "उपज मूल्य", "उपज भाव")} ({qty} kg @ ₹{lot.price_per_kg})</span>
                <span className="tabular-nums">₹{(qty * lot.price_per_kg).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-bold text-[#1B4965]">
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" /> {t("Consolidated Logistics", "एकत्रित लॉजिस्टिक्स", "लॉजिस्टिक्स")}
                </span>
                <span className="tabular-nums">₹{(qty * 0.5).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-bold text-[#52544D]">
                <span>{t("Escrow Security (1.5%)", "सुरक्षा एस्क्रो (1.5%)", "सुरक्षा एस्क्रो (1.5%)")}</span>
                <span className="tabular-nums">₹{Math.round(qty * lot.price_per_kg * 0.015).toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="pt-2 border-t-2 border-[#1E1F1C] flex justify-between items-center">
              <span className="text-xs font-black text-[#1E1F1C] uppercase">{t("Total Settlement", "कुल राशि", "कुल राशि")}</span>
              <span className="text-xl font-black text-[#1E1F1C] tabular-nums font-mono">
                ₹{Math.round(qty * lot.price_per_kg + (qty * 0.5) + (qty * lot.price_per_kg * 0.015)).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#EBECE8] border-t-2 border-[#1E1F1C] flex gap-2.5 sticky bottom-0">
          <Button variant="secondary" className="flex-1" onClick={onClose}>{t("Cancel", "रद्द करें", "रद्द करव")}</Button>
          <Button
            variant="buyer"
            className="flex-1"
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
