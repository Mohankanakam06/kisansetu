"use client";
import React, { useState } from "react";
import { Lot } from "@/types";
import { apiService } from "@/services/api";
import { Button, Card } from "@/components/ui";
import {
  IndianRupee,
  Truck,
  MapPin,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface LotDetailModalProps {
  lot: Lot;
  onClose: () => void;
  onOrderConfirm: (lot: Lot, qty: number) => void;
}

export default function LotDetailModal({ lot, onClose, onOrderConfirm }: LotDetailModalProps) {
  const [qty, setQty] = useState(lot.total_quantity_kg);
  const [isPlacing, setIsPlacing] = useState(false);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-soil-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-soil-900">Order Lot {lot.crop_type}</h2>
          <button onClick={onClose} className="text-soil-400 hover:text-soil-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-soil-50 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-soil-500 uppercase">Available Quantity</span>
              <p className="text-xl font-bold text-soil-900">{lot.total_quantity_kg} kg</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl space-y-1 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Settlement Rate</span>
              <p className="text-xl font-bold text-emerald-700">₹{lot.price_per_kg} / kg</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-soil-800">Order Quantity (kg)</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-full bg-white border border-soil-300 rounded-lg px-4 py-3 text-lg font-bold text-soil-900 focus:ring-2 focus:ring-emerald-500 shadow-sm"
              max={lot.total_quantity_kg}
              min={100}
            />
          </div>

          <div className="bg-white border rounded-xl p-4 border-soil-100 shadow-sm">
            <div className="flex justify-between py-2 border-b border-soil-100">
              <span className="text-soil-600">Order Total</span>
              <span className="font-bold text-soil-900">₹{(qty * lot.price_per_kg).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-2 text-emerald-700">
              <span className="flex items-center gap-1 font-semibold">
                <Truck className="w-4 h-4" /> Logistics Estimate
              </span>
              <span className="font-bold">₹{(qty * 0.5).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-soil-50 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            className="flex-1 shadow-lg shadow-emerald-500/20"
            isLoading={isPlacing}
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
