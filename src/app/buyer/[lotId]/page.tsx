"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lot } from "@/types";
import { apiService } from "@/services/api";
import { Badge, Button, Card } from "@/components/ui";
import CropPhoto from "@/components/buyer/CropPhoto";
import {
  ArrowLeft,
  MapPin,
  Scale,
  BadgeCheck,
  Truck,
  Wallet,
  Users,
  Check,
  Clock,
  IndianRupee,
  ShieldCheck,
  Award,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

const cropEmojis: Record<string, string> = {
  Tomato: "🍅",
  Onion: "🧅",
  Potato: "🥔",
  Wheat: "🌾",
  Rice: "🍚",
  Soybean: "🫘",
  Chilli: "🌶️",
  Ginger: "🫞",
  Garlic: "🧄",
  Cotton: "🌼",
};

export default function LotDetailPage() {
  const { lotId } = useParams<{ lotId: string }>();
  const router = useRouter();
  const [lot, setLot] = useState<Lot | null>(null);
  const [loading, setLoading] = useState(true);
  const [qtyRaw, setQtyRaw] = useState<string>("0");
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const qty = Math.max(0, parseInt(qtyRaw) || 0);

  useEffect(() => {
    let cancelled = false;
    if (!lotId) return;
    setLoading(true);
    apiService
      .getLotById(String(lotId))
      .then((res) => {
        if (!cancelled) {
          setLot(res as Lot | null);
          if (res) setQtyRaw(String((res as Lot).total_quantity_kg));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lotId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 bg-[#f8faf9]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" />
          <p className="text-xs font-bold text-slate-500">Loading lot information…</p>
        </div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 sm:px-6 py-24 bg-[#f8faf9]">
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Lot not found</h1>
        <p className="text-sm text-slate-500">No lot with ID “{lotId}” was found in the active pool.</p>
        <Link href="/buyer">
          <Button variant="primary" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  const cropEmoji = cropEmojis[lot.crop_type] || "🌿";
  const minOrder = Math.min(100, lot.total_quantity_kg);
  const maxOrder = lot.total_quantity_kg;
  const totalValue = lot.total_quantity_kg * lot.price_per_kg;
  const orderTotal = Math.min(qty, lot.total_quantity_kg) * lot.price_per_kg;
  const isInvalid = qty < minOrder || qty > maxOrder;

  const handleOrder = async (fullLot: boolean) => {
    const q = fullLot ? lot.total_quantity_kg : Math.min(Math.max(qty, minOrder), lot.total_quantity_kg);
    setOrdering(true);
    try {
      const res = await apiService.createOrder({
        buyer_id: "buyer-001",
        lot_id: lot.id,
        quantity_kg: q,
      });
      setOrderSuccess(res.order_id);
    } catch (e) {
      console.error(e);
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8faf9]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Link
          href="/buyer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace
        </Link>

        {/* Grade + ID Tag */}
        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full bg-emerald-600 text-white px-3 py-1 text-xs font-black shadow-sm flex items-center gap-1">
            <Award className="h-3.5 w-3.5" /> AI Certified • Grade {lot.grade}
          </span>
          <span className="rounded-lg bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-xs font-bold text-slate-600">
            Lot #{lot.id}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 min-w-0 flex flex-col gap-6">
            {/* Title & Hub info */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                {lot.crop_type} Aggregated Cluster Lot
              </h1>
              <p className="mt-1.5 text-sm text-slate-600">
                Sourced directly from {lot.listings_count} verified smallholders in {lot.centroid.district}. Inspected and graded by KisanSetu AI vision model.
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative h-[280px] sm:h-[380px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-card">
              <CropPhoto
                crop={lot.crop_type}
                fallbackEmoji={cropEmoji}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-3 py-1 text-xs font-bold text-slate-900 shadow">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Verified Clustered Batch
              </div>
            </div>

            {/* Bento Detail Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Location */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Cluster Origin & Centroid
                </p>
                <p className="mt-2 text-base font-bold text-slate-900">{lot.centroid.district} Hub</p>
                <p className="text-xs text-slate-500 mt-0.5">{lot.centroid.address || "Raipur Agricultural Basin"}</p>
                <p className="mt-2 font-mono text-[11px] text-slate-400">
                  {lot.centroid.lat.toFixed(4)}, {lot.centroid.lng.toFixed(4)}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                  <Truck className="w-4 h-4" />
                  Consolidated 1-truck pickup route
                </div>
              </div>

              {/* Quality Verification */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  Quality Verification
                </p>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">AI Quality Grade</span>
                    <span className="font-bold text-emerald-700">Grade {lot.grade} Premium</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Defects Detected</span>
                    <span className="font-bold text-slate-900">
                      {lot.defects && lot.defects.length > 0 ? lot.defects.join(", ") : "0% (Zero Rot / Uniform)"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Listings Pooled</span>
                    <span className="font-bold text-slate-900">{lot.listings_count} Smallholders</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contributing Farmers */}
            {lot.listings && lot.listings.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-3">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Contributing Smallholders ({lot.listings_count})
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {lot.listings.map((f) => {
                    const pct = ((f.quantity_kg / lot.total_quantity_kg) * 100).toFixed(1);
                    return (
                      <div
                        key={f.listing_id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                            {f.farmer_name[0]}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900">{f.farmer_name}</p>
                            <p className="text-[11px] text-slate-500">
                              {f.quantity_kg} kg · {pct}% of lot pool
                            </p>
                          </div>
                        </div>
                        <span className="font-black text-emerald-700">{f.quantity_kg} kg</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Checkout Card (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-card flex flex-col gap-4">
              {orderSuccess ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-glow">
                    <Check className="h-7 w-7" />
                  </span>
                  <h2 className="font-display text-xl font-black text-slate-900">Order Confirmed!</h2>
                  <p className="text-xs text-slate-500">
                    Order ID: <span className="font-mono font-bold text-slate-900">{orderSuccess}</span>
                  </p>
                  <Link href="/orders" className="w-full mt-2">
                    <Button variant="primary" className="w-full rounded-xl shadow-glow">
                      Track Logistics Dispatch →
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => setOrderSuccess(null)}>
                    Order another
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Direct Farm Settlement Rate</p>
                    <p className="mt-1 font-display text-3xl font-black text-slate-900">
                      ₹{lot.price_per_kg.toLocaleString("en-IN")}
                      <span className="text-xs font-semibold text-slate-500"> / kg</span>
                    </p>
                    <p className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> Direct pricing • No middleman commission
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Available Lot Weight</span>
                      <span className="font-bold text-slate-900">{lot.total_quantity_kg} kg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Minimum Order</span>
                      <span className="font-bold text-slate-900">{minOrder} kg</span>
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">Order Quantity (kg)</label>
                      <div className="flex gap-1">
                        {[minOrder, 500, maxOrder].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setQtyRaw(String(v))}
                            className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-emerald-100 hover:text-emerald-800"
                          >
                            {v === maxOrder ? "Max" : `${v}kg`}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="number"
                      min={minOrder}
                      max={maxOrder}
                      value={qtyRaw}
                      onChange={(e) => setQtyRaw(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-bold focus:outline-none ${
                        isInvalid
                          ? "border-red-300 bg-red-50 text-red-900"
                          : "border-slate-200 bg-slate-50 text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                      }`}
                    />
                    {isInvalid && (
                      <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> Order must be between {minOrder}kg and {maxOrder}kg
                      </p>
                    )}
                  </div>

                  <div className="border-t border-dashed border-slate-200 pt-3">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Order Value</span>
                      <span className="font-display text-lg font-black text-emerald-800">
                        ₹{(qty * lot.price_per_kg).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Button
                      variant="primary"
                      className="w-full rounded-xl shadow-glow"
                      disabled={ordering || isInvalid || qty === 0}
                      isLoading={ordering}
                      onClick={() => handleOrder(true)}
                    >
                      <IndianRupee className="w-4 h-4 mr-1" />
                      Place Order for Full Lot ({lot.total_quantity_kg}kg)
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                      disabled={ordering || isInvalid || qty === 0}
                      onClick={() => handleOrder(false)}
                    >
                      Order Custom Qty ({qty}kg)
                    </Button>
                  </div>

                  <p className="flex items-center gap-1.5 justify-center text-[11px] font-medium text-slate-400 text-center">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    Consolidated dispatch • Delivery within 24–48h
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
