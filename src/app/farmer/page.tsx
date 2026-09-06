"use client";
import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { CropType, GeoLocation, CreateListingRequest } from "@/types";
import { apiService } from "@/services/api";
import { Button, Card, Badge } from "@/components/ui";
import {
  Search,
  CheckCircle,
  MapPin,
  LocateFixed,
  Upload,
  Info,
  Sparkles,
  Truck,
  Check,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Mic,
  MicOff,
  Volume2,
  ScanLine,
  Eye,
  Zap,
  ShieldCheck,
  Leaf,
  Waves,
} from "lucide-react";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] bg-surface-container animate-pulse rounded-2xl flex items-center justify-center text-body-sm text-on-surface-variant font-semibold">
      Loading location map...
    </div>
  ),
});

const STEPS = [
  { label: "Crop", sub: "फसल चुनें" },
  { label: "Details", sub: "विवरण" },
  { label: "Location", sub: "खेत का पता" },
  { label: "Quality", sub: "गुणवत्ता" },
];

const CROPS: { value: CropType; label: string; emoji: string; price: number; color: string }[] = [
  { value: "Tomato", label: "Tomato (टमाटर)", emoji: "🍅", price: 22, color: "from-red-500 to-orange-500" },
  { value: "Onion", label: "Onion (प्याज)", emoji: "🧅", price: 28, color: "from-purple-500 to-pink-500" },
  { value: "Potato", label: "Potato (आलू)", emoji: "🥔", price: 18, color: "from-amber-600 to-yellow-500" },
  { value: "Wheat", label: "Wheat (गेहूं)", emoji: "🌾", price: 24, color: "from-amber-700 to-yellow-600" },
  { value: "Rice", label: "Rice (चावल)", emoji: "🍚", price: 32, color: "from-stone-400 to-stone-200" },
  { value: "Soybean", label: "Soybean (सोयाबीन)", emoji: "🫘", price: 42, color: "from-emerald-600 to-lime-500" },
  { value: "Chilli", label: "Chilli (मिर्च)", emoji: "🌶️", price: 65, color: "from-red-600 to-red-400" },
  { value: "Cotton", label: "Cotton (कपास)", emoji: "🌼", price: 55, color: "from-zinc-100 to-amber-100" },
];

const MANDI = {
  Tomato: "₹18–26",
  Onion: "₹24–32",
  Potato: "₹14–22",
  Wheat: "₹22–28",
  Rice: "₹28–36",
  Soybean: "₹38–46",
  Chilli: "₹58–72",
  Cotton: "₹50–62",
} as Record<string, string>;

export default function FarmerPage() {
  const [step, setStep] = useState(0);
  const [crop, setCrop] = useState<CropType>("Tomato");
  const [quantity, setQuantity] = useState(100);
  const [price, setPrice] = useState(22);
  const [address, setAddress] = useState("Village Birgaon, Raipur");
  const [location, setLocation] = useState<GeoLocation>({
    lat: 21.28,
    lng: 81.65,
    district: "Raipur",
    address: "Village Birgaon, Raipur",
  });
  const [geocoding, setGeocoding] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  // Voice assistant sim
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Grading
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [gradeResult, setGradeResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const selectedCrop = CROPS.find((c) => c.value === crop) || CROPS[0];
  const filteredCrops = CROPS.filter((c) => c.label.toLowerCase().includes(searchQ.toLowerCase()));

  const selectCrop = (c: CropType) => {
    setCrop(c);
    const found = CROPS.find((x) => x.value === c);
    if (found) setPrice(found.price);
  };

  // Simulate Bhashini voice flow
  const toggleVoice = () => {
    if (listening) {
      setListening(false);
      if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
      return;
    }
    setVoiceOpen(true);
    setListening(true);
    setVoiceTranscript("");
    // simulate STT
    voiceTimerRef.current = setTimeout(() => setVoiceTranscript("टमाटर..."), 600);
    setTimeout(() => setVoiceTranscript("टमाटर, 20 क्विंटल..."), 1300);
    setTimeout(() => {
      setVoiceTranscript("टमाटर, 20 क्विंटल, रायपुर — बीस क्विंटल टमाटर");
      setListening(false);
    }, 2100);
    setTimeout(() => {
      selectCrop("Tomato");
      setQuantity(2000);
    }, 2300);
  };

  useEffect(() => {
    if (!uploading) return;
    setScanProgress(0);
    const id = setInterval(() => setScanProgress((p) => (p >= 92 ? 92 : p + 9)), 120);
    return () => clearInterval(id);
  }, [uploading]);

  const handleGeolocate = () => {
    if (!("geolocation" in navigator)) {
      setAddress("Geolocation not available — enter address manually.");
      return;
    }
    setGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation((prev) => ({
          ...prev,
          lat: parseFloat(pos.coords.latitude.toFixed(5)),
          lng: parseFloat(pos.coords.longitude.toFixed(5)),
        }));
        setAddress("Current GPS location");
        setGeocoding(false);
      },
      () => {
        setAddress("Could not fetch location — enter address manually.");
        setGeocoding(false);
      }
    );
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setGradeResult(null);
    setPreviewUrl(URL.createObjectURL(file));
    setTimeout(async () => {
      try {
        const res = await apiService.gradeProducePhoto("demo-lot", URL.createObjectURL(file));
        setGradeResult(res);
      } catch (err) {
        console.error(err);
      } finally {
        setUploading(false);
        setScanProgress(100);
      }
    }, 900);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const reqData: CreateListingRequest = {
        crop_type: crop,
        quantity_kg: quantity,
        price_expectation: price,
        farmer_name: "Farmer",
        farmer_phone: "+91 98765 43210",
        location: { ...location, address },
        photo_url: previewUrl || undefined,
        language: "hi",
      };
      const res = await apiService.createFarmerListing(reqData);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const canNext =
    step === 0 ? true : step === 1 ? quantity > 0 && price > 0 : step === 2 ? address.trim().length > 0 : step === 3 ? !!gradeResult && !uploading : true;

  const next = () => {
    if (step === 3) handleSubmit();
    else setStep(step + 1);
  };

  if (result) {
    return (
      <div className="flex-1 bg-surface py-8">
        <div className="mx-auto max-w-lg px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-glow animate-pulse-glow">
              <Check className="h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-emerald-950">Listing Live!</h1>
            <p className="text-sm text-slate-600">Your produce has been pooled into a verified buyer lot. Settlement is protected by UPI escrow.</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">Live Lot Aggregation</p>
                <p className="mt-1 font-display text-lg font-bold text-slate-900">
                  {result.quantity_kg} kg {result.crop_type} Added
                </p>
                <p className="text-xs text-slate-500">Pooling with nearby farms • Raipur Cluster</p>
              </div>
              <Badge variant="success" className="rounded-full">● Active</Badge>
            </div>
            <div className="mt-5 space-y-2.5 border-t border-dashed border-slate-200 pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Assigned Lot</span>
                <span className="font-mono font-bold text-slate-900">{result.assigned_lot_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Your Rate</span>
                <span className="font-bold text-emerald-700">₹{result.price_expectation}/kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Est. Value</span>
                <span className="font-bold text-slate-900">₹{(result.price_expectation * result.quantity_kg).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-sm font-medium text-emerald-800">
                <Sparkles className="h-4 w-4 shrink-0" />
                {result.cluster_status}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setResult(null);
                setStep(0);
                setGradeResult(null);
                setPreviewUrl(null);
              }}
            >
              Create Another
            </Button>
            <a href="/buyer" className="flex-1">
              <Button variant="primary" className="w-full">
                <Truck className="w-4 h-4" />
                View Marketplace
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#f8faf9] py-6 sm:py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Page header — premium */}
        <div className="mb-6 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5" /> Farmer Verified • APMC Raipur Hub
          </div>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-950">
            List Your Harvest in 60 seconds
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
            Speak in your language or tap to select — AI grades quality instantly and pools your lot with nearby farms for the best buyer price.
          </p>
        </div>

        {/* Premium stepper */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm">
          <div className="relative">
            <div className="absolute top-[18px] left-4 sm:left-6 right-4 sm:right-6 h-1.5 rounded-full bg-slate-100" />
            <div
              className="absolute top-[18px] left-4 sm:left-6 h-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all duration-500"
              style={{ width: `calc(${(step / 3) * 100}% - 2rem)` }}
            />
            <div className="relative flex justify-between">
              {STEPS.map((s, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <div key={s.label} className="flex flex-col items-center gap-1 bg-white px-1">
                    <div
                      className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-xs font-black transition-all ${
                        done
                          ? "bg-emerald-700 text-white shadow-md"
                          : active
                          ? "bg-emerald-700 text-white shadow-glow ring-3 ring-emerald-100 scale-105"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : i + 1}
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-bold leading-none ${i <= step ? "text-emerald-900" : "text-slate-400"}`}>{s.label}</span>
                    <span className="text-[10px] font-medium leading-none text-slate-400 hidden sm:block">{s.sub}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Trust strip */}
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 sm:px-2.5 sm:py-1">
              <Leaf className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600" /> No commission
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 sm:px-2.5 sm:py-1 text-amber-800">
              <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> UPI payout in 24h
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 sm:px-2.5 sm:py-1 text-emerald-800">
              <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> AI grading 94%
            </span>
          </div>
        </div>

        {/* Wizard card */}
        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card p-0">
          {/* Voice bar — persistent */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-amber-50/50 px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-white shrink-0">
                <Waves className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold tracking-wide text-emerald-900">Bhashini Voice Assistant</p>
                <p className="text-[11px] font-medium text-slate-600 truncate">बोलकर बताइए — "टमाटर, 20 क्विंटल, रायपुर"</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleVoice}
              className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition-all active:scale-95 shrink-0 ${
                listening ? "bg-red-600 text-white shadow-lg animate-pulse" : "bg-emerald-700 text-white shadow-md hover:bg-emerald-800"
              }`}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {listening ? "Listening…" : "Tap to Speak"}
              {!listening && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white animate-ping" />}
            </button>
          </div>

          {voiceOpen && (
            <div className="mx-4 sm:mx-6 mt-4 rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5" /> {listening ? "सुन रहा है…" : "समझ गया ✓"}
                </span>
                <button onClick={() => setVoiceOpen(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">
                  Dismiss
                </button>
              </div>
              {/* Waveform */}
              <div className="mt-3 flex items-center gap-1 h-8">
                {Array.from({ length: 20 }).map((_, i) => (
                  <span
                    key={i}
                    className={`flex-1 rounded-full ${listening ? "bg-emerald-500 animate-pulse" : "bg-emerald-200"}`}
                    style={{
                      height: listening ? `${12 + Math.sin(i * 1.2) * 10 + Math.random() * 14}px` : "8px",
                      animationDelay: `${i * 40}ms`,
                      transition: "height 120ms ease",
                    }}
                  />
                ))}
              </div>
              <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
                <p className="text-sm font-semibold text-slate-900 min-h-[1.25rem]">{voiceTranscript || (listening ? "…" : "—")}</p>
                {!listening && voiceTranscript && (
                  <p className="mt-1 text-xs text-emerald-700 font-medium">✓ Auto-filled: Tomato • 2000 kg • Raipur — tap Continue</p>
                )}
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Powered by Bhashini — Hindi, Chhattisgarhi & English supported</p>
            </div>
          )}

          <div className="p-5 sm:p-7">
            {/* STEP 1 — Crop */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900">What are you harvesting?</h2>
                  <p className="text-xs text-slate-500 mt-1">Tap a crop — or use voice. Prices shown are live Raipur mandi reference.</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Search crops… टमाटर, प्याज…"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
                  />
                </div>

                {/* Horizontal tactile scroll on mobile, grid on desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {filteredCrops.map((c) => {
                    const active = crop === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => selectCrop(c.value)}
                        className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.97] ${
                          active
                            ? "border-emerald-600 bg-emerald-50 shadow-glow"
                            : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm"
                        }`}
                      >
                        {active && <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-emerald-600" />}
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-xl shadow-sm`}>{c.emoji}</div>
                        <p className="mt-3 text-sm font-extrabold leading-none text-slate-900">{c.label.split(" (")[0]}</p>
                        <p className="text-[11px] font-medium text-slate-500">{c.label.match(/\(.+\)/)?.[0]}</p>
                        <span className="mt-2 inline-flex items-center rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                          ₹{c.price}/kg
                        </span>
                      </button>
                    );
                  })}
                </div>
                {filteredCrops.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No crops found.</p>}
              </div>
            )}

            {/* STEP 2 — Details */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900">Quantity & Price</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Selling <span className="font-bold text-emerald-700">{selectedCrop.emoji} {selectedCrop.label.split(" (")[0]}</span> • Raipur mandi today {MANDI[crop]}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-700">Quantity (kg)</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      min={1}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base sm:text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
                    />
                    <div className="flex gap-1.5">
                      {[50, 100, 500, 1000].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setQuantity(q)}
                          className={`rounded-full px-3 py-1.5 text-xs font-bold border ${quantity === q ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"}`}
                        >
                          {q}kg
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-700">Expected Price (₹/kg)</label>
                    <div className="flex items-center gap-2">
                      <span className="flex h-[46px] items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-black text-white">₹</span>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        min={1}
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base sm:text-sm font-bold text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
                      />
                    </div>
                    <p className="text-[11px] font-medium text-slate-500">You can negotiate after buyer inquiry — this is your ask price.</p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-amber-200 text-amber-600">
                    <Info className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-900">Market Insight</p>
                    <p className="mt-1 text-sm leading-relaxed text-amber-900/80">
                      Mandi range for {crop}: <span className="font-bold text-amber-900">{MANDI[crop] || "₹20–40"}</span>/kg. Your ask ₹{price}/kg is{" "}
                      {price < selectedCrop.price - 2 ? "below" : price > selectedCrop.price + 4 ? "above" : "right in line with"} market — competitive pricing gets bids 2.3× faster.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 text-white shadow-glow">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                    <TrendingUp className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Estimated Lot Value</p>
                    <p className="font-display text-2xl font-black tracking-tight">₹{(price * quantity).toLocaleString("en-IN")}</p>
                    <p className="text-xs font-medium text-emerald-100">{quantity} kg × ₹{price}/kg • Payout via UPI escrow</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 — Location */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900">Where to pick up?</h2>
                  <p className="text-xs text-slate-500 mt-1">Pin your farm — we cluster nearby lots to cut transport cost by up to 40%.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-600">Farm / Pick-up Point</label>
                    <Button type="button" variant="outline" size="sm" onClick={handleGeolocate} disabled={geocoding} className="rounded-full">
                      <LocateFixed className="h-4 w-4" />
                      {geocoding ? "Detecting GPS…" : "Use GPS"}
                    </Button>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                    <LeafletMap
                      isPicker
                      center={location}
                      selectedLocation={location}
                      onLocationSelect={(loc) => setLocation({ ...loc, address: address || "Pinned Location" })}
                      height="h-[240px] sm:h-[280px] md:h-[320px]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-600">Detailed Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setLocation((prev) => ({ ...prev, address: e.target.value }));
                    }}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
                    placeholder="Village, block, district… e.g. Birgaon, Abhanpur, Raipur"
                  />
                  <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)} • {location.district || "Raipur"} district
                  </p>
                </div>
              </div>
            )}

            {/* STEP 4 — Quality — scanner */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900">Snap your produce</h2>
                  <p className="text-xs text-slate-500 mt-1">AI grades size, color & defects in seconds — no typing needed.</p>
                </div>

                <div
                  className={`relative overflow-hidden rounded-2xl border-2 ${previewUrl ? "border-emerald-300 bg-slate-900" : "border-dashed border-slate-300 bg-slate-50 hover:bg-white hover:border-emerald-400"} transition-colors`}
                  onClick={() => !previewUrl && fileRef.current?.click()}
                >
                  {previewUrl ? (
                    <div className="relative">
                      <img src={previewUrl} alt="Crop preview" className="h-[260px] sm:h-[320px] w-full object-cover" />
                      {/* Viewfinder overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Corner brackets */}
                        <span className="absolute left-3 top-3 h-6 w-6 border-l-[3px] border-t-[3px] border-white/90 rounded-tl-lg" />
                        <span className="absolute right-3 top-3 h-6 w-6 border-r-[3px] border-t-[3px] border-white/90 rounded-tr-lg" />
                        <span className="absolute left-3 bottom-3 h-6 w-6 border-l-[3px] border-b-[3px] border-white/90 rounded-bl-lg" />
                        <span className="absolute right-3 bottom-3 h-6 w-6 border-r-[3px] border-b-[3px] border-white/90 rounded-br-lg" />
                        {/* Scanning laser */}
                        {uploading && (
                          <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-scan" />
                        )}
                        {/* Bounding boxes — show after scan */}
                        {!uploading && gradeResult && (
                          <>
                            <div className="absolute left-[18%] top-[22%] h-[34%] w-[28%] rounded-lg border-2 border-emerald-400 bg-emerald-400/10 shadow-[0_0_0_2px_rgba(16,185,129,0.35)]">
                              <span className="absolute -top-5 left-0 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Tomato • 57mm</span>
                            </div>
                            <div className="absolute right-[20%] top-[28%] h-[26%] w-[22%] rounded-lg border-2 border-amber-400 bg-amber-400/10">
                              <span className="absolute -top-5 left-0 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">Blemish • 4%</span>
                            </div>
                            <div className="absolute left-[42%] bottom-[18%] h-[22%] w-[18%] rounded-lg border-2 border-emerald-400 bg-emerald-400/10">
                              <span className="absolute -bottom-5 left-0 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Uniform</span>
                            </div>
                          </>
                        )}
                        {/* Top HUD */}
                        <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                            <ScanLine className="h-3.5 w-3.5 text-emerald-300" /> {uploading ? "AI SCANNING…" : "KISAN VISION • ON-DEVICE"}
                          </span>
                          <span className="rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-black text-white">LIVE</span>
                        </div>
                        {/* Bottom action */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewUrl(null);
                              setGradeResult(null);
                            }}
                            className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow hover:bg-white"
                          >
                            Retake
                          </button>
                          {!uploading && gradeResult && (
                            <span className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-black text-white shadow">Grade {gradeResult.grade} ✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center cursor-pointer">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                        <Upload className="h-6 w-6" />
                      </span>
                      <p className="font-bold text-slate-900">Tap to capture or upload</p>
                      <p className="text-xs text-slate-500 max-w-xs">Use your camera — AI detects size, ripeness & blemishes automatically. Supports JPG, PNG.</p>
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                        <ScanLine className="h-3.5 w-3.5 text-emerald-600" /> AI Vision Grader
                      </span>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
                </div>

                {uploading && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-emerald-900">Analyzing texture, color & blemishes…</p>
                        <p className="text-xs text-emerald-700">On-device vision • No data leaves your phone</p>
                      </div>
                      <span className="text-xs font-black text-emerald-700">{scanProgress}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white border border-emerald-100">
                      <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                    </div>
                  </div>
                )}

                {gradeResult && !uploading && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 text-white shadow-glow">
                      <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-black text-emerald-700 shadow"> {gradeResult.grade}</div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">AI Quality Grade</p>
                          <p className="font-display text-xl font-black">Grade {gradeResult.grade} — Premium</p>
                          <p className="text-xs font-medium text-emerald-100">Confidence {((gradeResult.confidence || 0.95) * 100).toFixed(0)}% • Verified by Kisan Vision</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600">Detected Parameters</p>
                      <div className="mt-2 grid gap-2">
                        {gradeResult.defects?.map((d: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800">
                            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                            {d}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wizard nav */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
              <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0} className="rounded-full">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button variant="primary" onClick={next} disabled={!canNext} isLoading={submitting} className="rounded-full px-6 shadow-glow">
                {step === 3 ? (
                  <>Submit to Marketplace</>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        <p className="mt-4 text-center text-[11px] font-medium text-slate-400">SIH PS 26033 • Direct-to-Market • Escrow protected • Raipur, Chhattisgarh</p>
      </div>
    </div>
  );
}
