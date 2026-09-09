"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lot } from "@/types";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui";
import { useLanguage } from "@/lib/language";
import CropPhoto from "@/components/buyer/CropPhoto";
import QualityInspectionModal from "@/components/buyer/QualityInspectionModal";
import {
  ArrowLeft,
  MapPin,
  BadgeCheck,
  Truck,
  Users,
  Check,
  CheckCircle2,
  IndianRupee,
  ShieldCheck,
  Award,
  Sparkles,
  AlertTriangle,
  Gavel,
  ScanSearch,
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
    const { t } = useLanguage();
  const [lot, setLot] = useState<Lot | null>(null);
  const [loading, setLoading] = useState(true);
  const [qtyRaw, setQtyRaw] = useState<string>("0");
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [showInspection, setShowInspection] = useState(false);
  const [bidPrice, setBidPrice] = useState<string>("");
  const [bidPlaced, setBidPlaced] = useState(false);
  const [bidding, setBidding] = useState(false);

  const qty = Math.max(0, parseInt(qtyRaw) || 0);

  useEffect(() => {
    let cancelled = false;
    if (!lotId) return;
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
          <p className="text-xs font-bold text-slate-500">
            {t("Loading lot information…", "लॉट जानकारी लोड हो रही है…", "लॉट के जानकारी लोड होत हे…")}
          </p>
        </div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 sm:px-6 py-24 bg-[#f8faf9]">
        <h1 className="font-display text-2xl font-extrabold text-slate-900">
          {t("Lot not found", "लॉट नहीं मिला", "लॉट नइ मिलिस")}
        </h1>
        <p className="text-sm text-slate-500">
          {t(`No lot with ID “${lotId}” was found in the active pool.`, `सक्रिय पूल में आईडी “${lotId}” वाला कोई लॉट नहीं मिला।`, `सक्रिय पूल म आईडी “${lotId}” वाला कोनो लॉट नइ मिलिस।`)}
        </p>
        <Link href="/buyer">
          <Button variant="primary" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("Back to Marketplace", "वापस मंडी बाजार", "बाजार वापस जाव")}
          </Button>
        </Link>
      </div>
    );
  }

  const cropEmoji = cropEmojis[lot.crop_type] || "🌿";
  const minOrder = Math.min(100, lot.total_quantity_kg);
  const maxOrder = lot.total_quantity_kg;
      const isInvalid = qty < minOrder || qty > maxOrder;

  const handleBid = async () => {
    if (!bidPrice || Number(bidPrice) <= 0) return;
    setBidding(true);
    // Simulate API call
    setTimeout(() => {
      setBidding(false);
      setBidPlaced(true);
    }, 1500);
  };

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
          {t("Back to Marketplace", "वापस मंडी बाजार", "बाजार वापस जाव")}
        </Link>

        {/* Grade + ID Tag */}
        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full bg-emerald-600 text-white px-3 py-1 text-xs font-black shadow-sm flex items-center gap-1">
            <Award className="h-3.5 w-3.5" /> {t("AI Certified", "AI प्रमाणित", "AI प्रमाणित")} • {t("Grade", "ग्रेड", "ग्रेड")} {lot.grade}
          </span>
          <span className="rounded-lg bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-xs font-bold text-slate-600">
            {t("Lot", "लॉट", "लॉट")} #{lot.id}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 min-w-0 flex flex-col gap-6">
            {/* Title & Hub info */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                {lot.crop_type} {t("Aggregated Cluster Lot", "एकत्रित क्लस्टर लॉट", "जुरियाय क्लस्टर लॉट")}
              </h1>
              <p className="mt-1.5 text-sm text-slate-600">
                {t(
                  `Sourced directly from ${lot.listings_count} verified smallholders in ${lot.centroid.district}. Inspected and graded by KisanSetu AI vision model.`,
                  `${lot.centroid.district} के ${lot.listings_count} सत्यापित किसानों से सीधे प्राप्त। KisanSetu AI विज़न मॉडल द्वारा जांचा और ग्रेड किया गया।`,
                  `${lot.centroid.district} के ${lot.listings_count} किसान मन ले सीधा प्राप्त। KisanSetu AI विज़न ले जांच करे गेहे।`
                )}
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
                {t("Verified Clustered Batch", "सत्यापित क्लस्टर्ड बैच", "सत्यापित क्लस्टर्ड बैच")}
              </div>
            </div>

            {/* Bento Detail Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Location */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {t("Cluster Origin & Centroid", "क्लस्टर उत्पत्ति और केंद्र", "क्लस्टर उत्पत्ति आ केंद्र")}
                </p>
                <p className="mt-2 text-base font-bold text-slate-900">{lot.centroid.district} {t("Hub", "हब", "हब")}</p>
                <p className="text-xs text-slate-500 mt-0.5">{lot.centroid.address || t("Raipur Agricultural Basin", "रायपुर कृषि क्षेत्र", "रायपुर कृषि क्षेत्र")}</p>
                <p className="mt-2 font-mono text-[11px] text-slate-400">
                  {lot.centroid.lat.toFixed(4)}, {lot.centroid.lng.toFixed(4)}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                  <Truck className="w-4 h-4" />
                  {t("Consolidated 1-truck pickup route", "समेकित 1-ट्रक पिकअप रूट", "1-ट्रक पिकअप रूट")}
                </div>
              </div>

              {/* Quality Verification */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card relative">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  {t("Quality Verification", "गुणवत्ता सत्यापन", "गुणवत्ता जांच")}
                </p>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t("AI Quality Grade", "AI गुणवत्ता ग्रेड", "AI गुणवत्ता ग्रेड")}</span>
                    <span className="font-bold text-emerald-700">{t("Grade", "ग्रेड", "ग्रेड")} {lot.grade} {t("Premium", "प्रीमियम", "प्रीमियम")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t("Defects Detected", "खामियां मिलीं", "खराबी मिलीस")}</span>
                    <span className="font-bold text-slate-900">
                      {lot.defects && lot.defects.length > 0 ? lot.defects.join(", ") : t("0% (Zero Rot / Uniform)", "0% (कोई सड़न नहीं / एकसमान)", "0% (कोनो सड़न नइ / एक्के जइसन)")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t("Listings Pooled", "पूल्ड किसान", "जुड़े किसान")}</span>
                    <span className="font-bold text-slate-900">{lot.listings_count} {t("Smallholders", "किसान", "किसान मन")}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 transition-colors"
                    onClick={() => setShowInspection(true)}
                  >
                    <ScanSearch className="h-4 w-4 mr-1.5" />
                    {t("Inspect Quality (AI Vision)", "गुणवत्ता जांचें (AI विज़न)", "गुणवत्ता जांचव (AI विज़न)")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Contributing Farmers */}
            {lot.listings && lot.listings.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-3">
                  <Users className="w-4 h-4 text-emerald-600" />
                  {t("Contributing Smallholders", "योगदानकर्ता किसान", "जुड़े किसान मन")} ({lot.listings_count})
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
                              {f.quantity_kg} {t("kg", "किग्रा", "किलो")} · {pct}% {t("of lot pool", "लॉट पूल का", "लॉट पूल के")}
                            </p>
                          </div>
                        </div>
                        <span className="font-black text-emerald-700">{f.quantity_kg} {t("kg", "किग्रा", "किलो")}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Checkout Card (4 cols) */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-card flex flex-col gap-4 mt-8 lg:mt-0">
              {orderSuccess ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-glow">
                    <Check className="h-7 w-7" />
                  </span>
                  <h2 className="font-display text-xl font-black text-slate-900">
                    {t("Order Confirmed!", "ऑर्डर की पुष्टि हो गई!", "ऑर्डर पक्का हो गे!")}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {t("Order ID:", "ऑर्डर आईडी:", "ऑर्डर आईडी:")} <span className="font-mono font-bold text-slate-900">{orderSuccess}</span>
                  </p>
                  <Link href="/orders" className="w-full mt-2">
                    <Button variant="primary" className="w-full rounded-xl shadow-glow">
                      {t("Track Logistics Dispatch →", "लॉजिस्टिक्स प्रेषण ट्रैक करें →", "लॉजिस्टिक्स गाड़ी ट्रैक करव →")}
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => setOrderSuccess(null)}>
                    {t("Order another", "दूसरा ऑर्डर दें", "अउ ऑर्डर करव")}
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {t("Direct Farm Settlement Rate", "सीधी खेत निपटान दर", "सीधा खेत भाव")}
                    </p>
                    <p className="mt-1 font-display text-3xl font-black text-slate-900">
                      ₹{lot.price_per_kg.toLocaleString("en-IN")}
                      <span className="text-xs font-semibold text-slate-500"> /{t("kg", "किग्रा", "किलो")}</span>
                    </p>
                    <p className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> {t("Direct pricing • No middleman commission", "सीधा मूल्य • कोई बिचौलिया कमीशन नहीं", "सीधा भाव • कोनो दलाली नइ")}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">{t("Available Lot Weight", "उपलब्ध लॉट वजन", "उपलब्ध लॉट वजन")}</span>
                      <span className="font-bold text-slate-900">{lot.total_quantity_kg} {t("kg", "किग्रा", "किलो")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">{t("Minimum Order", "न्यूनतम ऑर्डर", "कम से कम ऑर्डर")}</span>
                      <span className="font-bold text-slate-900">{minOrder} {t("kg", "किग्रा", "किलो")}</span>
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">
                        {t("Order Quantity", "ऑर्डर मात्रा", "ऑर्डर मात्रा")} ({t("kg", "किग्रा", "किलो")})
                      </label>
                      <div className="flex gap-1.5">
                        {[minOrder, 500, maxOrder].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setQtyRaw(String(v))}
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] sm:text-[10px] font-bold text-slate-700 hover:bg-emerald-100 hover:text-emerald-800 active:scale-95 transition-all"
                          >
                            {v === maxOrder ? t("Max", "अधिकतम", "ज्यादा") : `${v}${t("kg", "किग्रा", "किलो")}`}
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
                        <AlertTriangle className="h-3.5 w-3.5" /> {t(`Order must be between ${minOrder}kg and ${maxOrder}kg`, `ऑर्डर ${minOrder} किग्रा और ${maxOrder} किग्रा के बीच होना चाहिए`, `ऑर्डर ${minOrder} किलो ले ${maxOrder} किलो के बीच होना चाही`)}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-dashed border-slate-200 pt-3">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>{t("Order Value", "ऑर्डर मूल्य", "ऑर्डर भाव")}</span>
                      <span className="font-display text-lg font-black text-emerald-800">
                        ₹{(qty * lot.price_per_kg).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Direct Bidding / Dynamic Pricing Negotiation */}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <Gavel className="w-3.5 h-3.5 text-amber-600" />
                        <span>{t("Counter-Offer / Bid", "काउंटर ऑफर / बोली", "बोली लगाव")}</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-100/80 px-2 py-0.5 rounded-full">
                        {t("Direct to Pool", "सीधे पूल को", "सीधा किसान पूल")}
                      </span>
                    </div>
                    {bidPlaced ? (
                      <div className="rounded-xl bg-emerald-100/80 border border-emerald-300 p-2.5 text-center">
                        <p className="text-xs font-bold text-emerald-900 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          {t("Bid Submitted at ₹", "बोली दर्ज की गई ₹", "बोली दर्ज होगे ₹")}{bidPrice}/{t("kg", "किग्रा", "किलो")}
                        </p>
                        <p className="text-[10px] text-emerald-700 mt-0.5">
                          {t("Farmers notified via SMS / IVR alert", "किसानों को एसएमएस / आईवीआर से सूचित किया गया", "किसान मन ला SMS / फोन ले सूचना दे दिए गेहे")}
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                          <input
                            type="number"
                            placeholder={`${lot.price_per_kg - 2}`}
                            value={bidPrice}
                            onChange={(e) => setBidPrice(e.target.value)}
                            className="w-full rounded-xl border border-amber-200 bg-white pl-7 pr-3 py-2 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="rounded-xl bg-amber-600 text-white hover:bg-amber-700 text-xs px-3 font-bold shrink-0"
                          disabled={bidding || !bidPrice || Number(bidPrice) <= 0}
                          isLoading={bidding}
                          onClick={handleBid}
                        >
                          {t("Place Bid", "बोली लगाएं", "बोली लगाव")}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-2">
                    <Link
                      href={`/payment/checkout?lotId=${lot.id}&crop=${encodeURIComponent(
                        `${lot.crop_type} (Grade ${lot.grade})`
                      )}&qty=${lot.total_quantity_kg}&price=${lot.price_per_kg}&amount=${
                        lot.total_quantity_kg * lot.price_per_kg
                      }`}
                      className="block w-full"
                    >
                      <Button
                        variant="primary"
                        className="w-full rounded-xl shadow-glow"
                        disabled={ordering}
                      >
                        <IndianRupee className="w-4 h-4 mr-1" />
                        {t("Buy Full Lot", "पूरा लॉट खरीदें", "पूरा लॉट बिसाव")} ({lot.total_quantity_kg}{t("kg", "किग्रा", "किलो")}) • ₹{(lot.total_quantity_kg * lot.price_per_kg).toLocaleString("en-IN")}
                      </Button>
                    </Link>
                    <Link
                      href={`/payment/checkout?lotId=${lot.id}&crop=${encodeURIComponent(
                        `${lot.crop_type} (Grade ${lot.grade})`
                      )}&qty=${qty}&price=${lot.price_per_kg}&amount=${
                        qty * lot.price_per_kg
                      }`}
                      className={`block w-full ${isInvalid || qty === 0 ? "pointer-events-none opacity-50" : ""}`}
                    >
                      <Button
                        variant="outline"
                        className="w-full rounded-xl"
                        disabled={ordering || isInvalid || qty === 0}
                      >
                        {t("Buy Custom Qty", "कस्टम मात्रा खरीदें", "मनपसंद मात्रा बिसाव")} ({qty}{t("kg", "किग्रा", "किलो")}) • ₹{(qty * lot.price_per_kg).toLocaleString("en-IN")}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs font-semibold text-slate-600 hover:text-emerald-800"
                      disabled={ordering || isInvalid || qty === 0}
                      isLoading={ordering}
                      onClick={() => handleOrder(false)}
                    >
                      {t("Reserve Lot (Pay Later on Dispatch)", "लॉट आरक्षित करें (प्रेषण पर भुगतान)", "लॉट बुक करव (गाड़ी चले म भुगतान)")}
                    </Button>
                  </div>

                  <p className="flex items-center gap-1.5 justify-center text-[11px] font-medium text-slate-400 text-center">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    {t("Consolidated dispatch • Delivery within 24–48h", "समेकित प्रेषण • 24–48 घंटों में डिलीवरी", "समेकित प्रेषण • 24–48 घंटा म डिलीवरी")}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Vision Quality Inspection Modal */}
      {showInspection && (
        <QualityInspectionModal lot={lot} onClose={() => setShowInspection(false)} />
      )}
    </div>
  );
}
