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
  Truck,
  Check,
  ArrowLeft,
  ArrowRight,
  Mic,
  MicOff,
  Camera,
  Sprout,
} from "lucide-react";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[240px] bg-slate-50 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
      Loading map...
    </div>
  ),
});

const STEPS = [
  { label: "Crop", sub: "फसल" },
  { label: "Quantity & Price", sub: "मात्रा और दर" },
  { label: "Pickup Location", sub: "पता" },
  { label: "Quality Check", sub: "गुणवत्ता" },
];

const CROPS: { value: CropType; label: string; emoji: string; price: number }[] = [
  { value: "Tomato", label: "Tomato (टमाटर)", emoji: "🍅", price: 22 },
  { value: "Onion", label: "Onion (प्याज)", emoji: "🧅", price: 28 },
  { value: "Potato", label: "Potato (आलू)", emoji: "🥔", price: 18 },
  { value: "Wheat", label: "Wheat (गेहूं)", emoji: "🌾", price: 24 },
  { value: "Rice", label: "Rice (चावल)", emoji: "🍚", price: 32 },
  { value: "Soybean", label: "Soybean (सोयाबीन)", emoji: "🫘", price: 42 },
  { value: "Chilli", label: "Chilli (मिर्च)", emoji: "🌶️", price: 65 },
  { value: "Cotton", label: "Cotton (कपास)", emoji: "🌼", price: 55 },
];

const MANDI: Record<string, string> = {
  Tomato: "₹18–26",
  Onion: "₹24–32",
  Potato: "₹14–22",
  Wheat: "₹22–28",
  Rice: "₹28–36",
  Soybean: "₹38–46",
  Chilli: "₹58–72",
  Cotton: "₹50–62",
};

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

  // Voice assistant
  const [listening, setListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Quality check
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
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

  const toggleVoice = () => {
    if (listening) {
      setListening(false);
      if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
      return;
    }
    setListening(true);
    setVoiceTranscript("");
    voiceTimerRef.current = setTimeout(() => setVoiceTranscript("टमाटर, 20 क्विंटल, रायपुर"), 1200);
    setTimeout(() => {
      setListening(false);
      selectCrop("Tomato");
      setQuantity(2000);
    }, 1800);
  };

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
        setAddress("Current GPS Location (Raipur)");
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
      }
    }, 800);
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
    step === 0 ? true : step === 1 ? quantity > 0 && price > 0 : step === 2 ? address.trim().length > 0 : true;

  const next = () => {
    if (step === 3) handleSubmit();
    else setStep(step + 1);
  };

  if (result) {
    return (
      <div className="flex-1 bg-[#fafbf9] py-12">
        <div className="mx-auto max-w-md px-4 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
              <Check className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">Listing Created</h1>
            <p className="text-sm text-slate-600">Your harvest has been pooled for buyers.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500">Status</span>
              <Badge variant="success">Active in Pool</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Crop & Volume</span>
                <span className="font-semibold text-slate-900">{result.quantity_kg} kg {result.crop_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expected Rate</span>
                <span className="font-semibold text-emerald-800">₹{result.price_expectation}/kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Est. Total Payout</span>
                <span className="font-bold text-slate-900">₹{(result.price_expectation * result.quantity_kg).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setResult(null);
                setStep(0);
                setGradeResult(null);
                setPreviewUrl(null);
              }}
            >
              List Another
            </Button>
            <a href="/buyer" className="flex-1">
              <Button variant="primary" className="w-full">
                View in Market
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#fafbf9] py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            List Your Harvest
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Fill in your crop details to connect directly with wholesale buyers.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-6 flex justify-between border-b border-slate-200 pb-4">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  i === step
                    ? "bg-emerald-700 text-white"
                    : i < step
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={`text-xs font-semibold mt-1.5 ${i === step ? "text-slate-900" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Voice Helper Bar */}
          <div className="mb-6 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 p-3">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-emerald-700" />
              <span className="text-xs font-medium text-slate-700">
                {listening ? "Listening (बोलिए)..." : voiceTranscript || "Voice assistant: Speak in Hindi or English"}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleVoice}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                listening
                  ? "bg-red-600 text-white"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {listening ? "Stop" : "Speak"}
            </button>
          </div>

          {/* STEP 1: Crop Selection */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search produce (टमाटर, आलू)..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {filteredCrops.map((c) => {
                  const active = crop === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => selectCrop(c.value)}
                      className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                        active
                          ? "border-emerald-700 bg-emerald-50/50 text-emerald-900"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="text-2xl mb-1">{c.emoji}</span>
                      <span className="text-xs font-bold leading-tight">{c.label.split(" (")[0]}</span>
                      <span className="text-[11px] text-slate-500 mt-1">₹{c.price}/kg</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Quantity & Price */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Quantity (kg)</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min={10}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
                />
                <div className="flex gap-2 pt-1">
                  {[50, 100, 500, 1000].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                        quantity === q
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {q}kg
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Expected Rate (₹/kg)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  min={1}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
                />
                <p className="text-[11px] text-slate-500">Raipur benchmark mandi rate: {MANDI[crop] || "₹20–30"}/kg</p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600">Estimated Total Value</span>
                <span className="text-base font-bold text-emerald-800">
                  ₹{(price * quantity).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Location */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700">Farm Gate Address</label>
                <button
                  type="button"
                  onClick={handleGeolocate}
                  disabled={geocoding}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <LocateFixed className="h-3.5 w-3.5" />
                  {geocoding ? "Detecting..." : "Use Current GPS"}
                </button>
              </div>

              <textarea
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setLocation((prev) => ({ ...prev, address: e.target.value }));
                }}
                rows={2}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                placeholder="Enter village, block, district..."
              />

              <div className="rounded-xl border border-slate-200 overflow-hidden h-[240px]">
                <LeafletMap
                  isPicker
                  center={location}
                  selectedLocation={location}
                  onLocationSelect={(loc) => setLocation({ ...loc, address: address || "Pinned Location" })}
                  height="h-full"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Quality Check */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-700">Produce Photo (Optional Quality Check)</p>
                <p className="text-[11px] text-slate-500">Upload a clear photo of your crop to earn a Grade A/B certified tag.</p>
              </div>

              <div
                className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Crop" className="mx-auto h-40 object-cover rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="h-8 w-8 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">Click to upload photo</span>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </div>

              {uploading && (
                <p className="text-xs text-center text-slate-500">Analyzing crop quality...</p>
              )}

              {gradeResult && !uploading && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-900">
                      Quality Verified: Grade {gradeResult.grade}
                    </span>
                  </div>
                  <Badge variant="gradeA">Grade {gradeResult.grade}</Badge>
                </div>
              )}
            </div>
          )}

          {/* Stepper Navigation */}
          <div className="mt-6 flex justify-between border-t border-slate-100 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={next}
              disabled={!canNext}
              isLoading={submitting}
            >
              {step === 3 ? "Submit Listing" : "Continue"}
              {step < 3 && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
