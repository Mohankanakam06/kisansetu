"use client";
import React, { useState, useEffect } from "react";
import { Lot } from "@/types";
import { Button } from "@/components/ui";
import { X, Truck, IndianRupee, AlertTriangle, Sparkles } from "lucide-react";

interface LotDetailModalProps {
  lot: Lot;
  onClose: () => void;
  onOrderConfirm: (lot: Lot, qty: number) => void;
}

export default function LotDetailModal({ lot, onClose, onOrderConfirm }: LotDetailModalProps) {
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

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div>
            <h2 className="font-display text-lg font-extrabold text-slate-950">Place B2B Order</h2>
            <p className="text-xs font-medium text-slate-500">
              Lot #{lot.id} • {lot.crop_type} • Grade {lot.grade}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:text-slate-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 sm:p-4">
              <p className="text-[10px] font-black uppercase text-slate-400">Available</p>
              <p className="text-base sm:text-lg font-black text-slate-900">{lot.total_quantity_kg} kg</p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 sm:p-4">
              <p className="text-[10px] font-black uppercase text-emerald-800">Rate</p>
              <p className="text-base sm:text-lg font-black text-emerald-900">₹{lot.price_per_kg}/kg</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs sm:text-sm font-bold text-slate-900">Order Quantity (kg)</label>
              <div className="flex gap-1.5">
                {[100, 500, maxQty].map(v => (
                  <button key={v} onClick={() => setQtyRaw(v.toString())} className="text-[10px] font-black uppercase bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 hover:bg-emerald-100 hover:text-emerald-800 active:scale-95">
                    {v === maxQty ? "Max" : `${v}kg`}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              value={qtyRaw}
              onChange={(e) => setQtyRaw(e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 text-base sm:text-sm font-black focus:ring-2 focus:outline-none ${isInvalid ? "border-red-300 bg-red-50 text-red-900 ring-red-100" : "border-slate-200 bg-slate-50 text-slate-900 ring-emerald-100 focus:border-emerald-600"}`}
              placeholder="Quantity in kg"
            />
            {isInvalid && (
              <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Order must be between {minQty}kg and {maxQty}kg
              </p>
            )}
          </div>

          {/* Pricing breakdown */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-2">
            <div className="flex justify-between text-xs sm:text-sm py-1">
              <span className="text-slate-600 font-medium">Order Total</span>
              <span className="font-bold text-slate-950">₹{(qty * lot.price_per_kg).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm py-1 text-emerald-700">
              <span className="flex items-center gap-1.5 font-bold">
                <Truck className="h-4 w-4" /> Logistics Est.
              </span>
              <span className="font-bold">₹{(qty * 0.5).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 flex gap-3 sticky bottom-0">
          <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            className="flex-1 rounded-xl shadow-glow h-12"
            isLoading={isPlacing}
            disabled={isInvalid || qty === 0}
            onClick={async () => {
              setIsPlacing(true);
              await onOrderConfirm(lot, qty);
              setIsPlacing(false);
            }}
          >
            Confirm Order
          </Button>
        </div>
      </div>
    </div>
  );
}
