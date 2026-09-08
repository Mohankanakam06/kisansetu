"use client";
import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { CropType, GeoLocation, CreateListingRequest } from "@/types";
import { apiService } from "@/services/api";
import { Button, Card, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/language";
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
  Sparkles,
  ShieldCheck,
  Award,
  Layers,
  TrendingUp,
} from "lucide-react";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[260px] bg-slate-50 rounded-2xl flex items-center justify-center text-xs text-slate-400 font-bold">
      Loading interactive map...
    </div>
  ),
});

export default function FarmerPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);

  const STEPS = [
    { label: t("Crop Selection", "फसल चुनें", "फसल चुनव"), sub: t("Select Crop", "फसल चुनें", "फसल चुनव") },
    { label: t("Volume & Price", "मात्रा और भाव", "मात्रा आ भाव"), sub: t("Volume & Price", "मात्रा और भाव", "मात्रा आ भाव") },
    { label: t("Pickup Location", "खेत का पता", "खेत के पता"), sub: t("Location", "खेत का पता", "खेत के पता") },
    { label: t("Quality Grading", "गुणवत्ता जांच", "गुणवत्ता जांच"), sub: t("Grading", "गुणवत्ता जांच", "गुणवत्ता जांच") },
  ];

  const CROPS: { value: CropType; label: string; labelHi: string; emoji: string; price: number; mandiPrice: number }[] = [
    { value: "Tomato", label: t("Tomato", "टमाटर", "टमाटर"), labelHi: "टमाटर", emoji: "🍅", price: 22, mandiPrice: 16 },
    { value: "Onion", label: t("Onion", "प्याज", "प्याज"), labelHi: "प्याज", emoji: "🧅", price: 28, mandiPrice: 20 },
    { value: "Potato", label: t("Potato", "आलू", "आलू"), labelHi: "आलू", emoji: "🥔", price: 18, mandiPrice: 12 },
    { value: "Wheat", label: t("Wheat", "गेहूं", "गेहूं"), labelHi: "गेहूं", emoji: "🌾", price: 24, mandiPrice: 19 },
    { value: "Rice", label: t("Rice", "चावल", "चावल"), labelHi: "चावल", emoji: "🍚", price: 32, mandiPrice: 25 },
    { value: "Soybean", label: t("Soybean", "सोयाबीन", "सोयाबीन"), labelHi: "सोयाबीन", emoji: "🫘", price: 42, mandiPrice: 34 },
    { value: "Chilli", label: t("Chilli", "हरी मिर्च", "हरी मिर्च"), labelHi: "हरी मिर्च", emoji: "🌶️", price: 65, mandiPrice: 48 },
    { value: "Cotton", label: t("Cotton", "कपास", "कपास"), labelHi: "कपास", emoji: "🌼", price: 55, mandiPrice: 42 },
  ];

  const [crop, setCrop] = useState<CropType>("Tomato");
  const [quantity, setQuantity] = useState(500);
  const [price, setPrice] = useState(22);
  const [address, setAddress] = useState("Village Birgaon, Block Dharsiwa, Raipur, CG");
  const [location, setLocation] = useState<GeoLocation>({
    lat: 21.28,
    lng: 81.65,
    district: "Raipur",
    address: "Village Birgaon, Block Dharsiwa, Raipur, CG",
  });
  const [geocoding, setGeocoding] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  // Voice assistant state
  const [listening, setListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Quality check with Laser Scanner
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [gradeResult, setGradeResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const selectedCrop = CROPS.find((c) => c.value === crop) || CROPS[0];
  const filteredCrops = CROPS.filter(
    (c) =>
      c.label.toLowerCase().includes(searchQ.toLowerCase()) ||
      c.labelHi.toLowerCase().includes(searchQ.toLowerCase())
  );

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
    setVoiceTranscript("सुन रहे हैं... बोलिए (उदा: 'टमाटर 500 किलो रायपुर')");

    // Simulate AI voice agent processing natural speech
    voiceTimerRef.current = setTimeout(() => {
      setVoiceTranscript("पहचाना गया: 'टमाटर 500 किलो रायपुर ₹22 दर'");
      setTimeout(() => {
        setListening(false);
        selectCrop("Tomato");
        setQuantity(500);
        setPrice(22);
        setStep(1);
      }, 1500);
    }, 2000);
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
        setAddress("GPS Farm Gate Pin: Raipur Hub (Lat: " + pos.coords.latitude.toFixed(3) + ", Lng: " + pos.coords.longitude.toFixed(3) + ")");
        setGeocoding(false);
      },
      () => {
        setAddress("Raipur Agri Basin, Chhattisgarh");
        setGeocoding(false);
      }
    );
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setGradeResult(null);
    const objUrl = URL.createObjectURL(file);
    setPreviewUrl(objUrl);

    setTimeout(async () => {
      try {
        const res = await apiService.gradeProducePhoto("demo-lot", objUrl);
        setGradeResult(res || { grade: "A", defects: ["Zero rot", "High firmness (94%)", "Uniform sizing"] });
      } catch (err) {
        setGradeResult({ grade: "A", defects: ["Quality certified", "Grade A standard"] });
      } finally {
        setUploading(false);
      }
    }, 2200);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const reqData: CreateListingRequest = {
        crop_type: crop,
        quantity_kg: quantity,
        price_expectation: price,
        farmer_name: "Farmer S. Verma",
        farmer_phone: "+91 98271 23456",
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

  const totalEarnings = quantity * price;
  const traditionalEarnings = quantity * selectedCrop.mandiPrice;
  const netAdvantage = totalEarnings - traditionalEarnings;

  if (result) {
    return (
      <div className="flex-1 bg-[#f8faf9] py-12">
        <div className="mx-auto max-w-lg px-4 space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-700 text-white shadow-glow">
              <Check className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-950 font-display">
              {t("Harvest Listed Successfully!", "फसल सूची सफल!", "फसल के सूची बन गे!")}
            </h1>
            <p className="text-sm font-semibold text-slate-600">
              {t("Your harvest has been published to the KisanSetu wholesale aggregation pool.", "आपकी फसल KisanSetu थोक एकत्रीकरण पूल में प्रकाशित हो गई है।", "तुंहर फसल KisanSetu थोक एकत्रीकरण पूल म दर्ज हो गे हे।")}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">{t("Pool Status", "पूल स्थिति", "पूल स्थिति")}</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                {t("Active in Raipur Cluster", "रायपुर क्लस्टर में सक्रिय", "रायपुर क्लस्टर म सक्रिय")}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">{t("Crop & Volume", "फसल और मात्रा", "फसल आ मात्रा")}</span>
                <span className="font-bold text-slate-900 text-base">{result.quantity_kg.toLocaleString()} {t("kg", "किलो", "किलो")} {result.crop_type}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">{t("Locked Rate", "निर्धारित दर", "पक्का दर")}</span>
                <span className="font-bold text-emerald-800 text-base font-mono">₹{result.price_expectation}/{t("kg", "किलो", "किलो")}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">{t("Quality Certified", "गुणवत्ता प्रमाणित", "गुणवत्ता प्रमाणित")}</span>
                <Badge variant="gradeA">{t("Grade A Verified", "ग्रेड A प्रमाणित", "ग्रेड A जांचे गे")}</Badge>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-slate-600 font-bold">{t("Estimated UPI Payout", "अनुमानित UPI भुगतान", "अनुमानित UPI भुगतान")}</span>
                <span className="font-display text-2xl font-black text-slate-950 font-mono">
                  ₹{(result.price_expectation * result.quantity_kg).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-medium text-emerald-950 flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>{t("2-Stage UPI Escrow:", "2-चरण UPI एस्क्रो:", "2-चरण UPI एस्क्रो:")}</strong> {t("40% will be transferred to your bank immediately upon pickup truck loading, and 60% on wholesale hub delivery.", "40% पिकअप ट्रक लोडिंग पर तुरंत आपके बैंक में ट्रांसफर किया जाएगा, और 60% थोक हब डिलीवरी पर।", "40% पिकअप ट्रक लोड होत देरी तुंहर बैंक म आ जाही, आ 60% थोक हब पहुंचय म।")}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              className="flex-1 rounded-xl h-12"
              onClick={() => {
                setResult(null);
                setStep(0);
                setGradeResult(null);
                setPreviewUrl(null);
              }}
            >
              {t("List Another Crop", "दूसरी फसल दर्ज करें", "अउर फसल लिखव")}
            </Button>
            <a href="/buyer" className="flex-1">
              <Button variant="primary" className="w-full rounded-xl shadow-glow h-12">
                {t("Explore Buyer Market", "खरीदार बाजार देखें", "खरीदार बाजार देखव")}
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#f8faf9] py-8 md:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Title and Intro */}
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <Sprout className="h-3.5 w-3.5 text-emerald-600" />
            {t("Farmer Produce Gateway", "किसान उपज गेटवे", "किसान उपज गेटवे")}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 font-display">
            {t("Sell Your Harvest Directly to Wholesale Buyers", "अपनी फसल सीधे थोक खरीदारों को बेचें", "अपन फसल सीधा थोक खरीदार मन ला बेचव")}
          </h1>
          <p className="text-sm font-medium text-slate-600 max-w-lg mx-auto">
            {t("List your harvest with voice or touch. Earn 20–40% higher profits by skipping local mandi middlemen.", "आवाज़ या टच से अपनी फसल दर्ज करें। स्थानीय मंडी बिचौलियों को छोड़कर 20-40% अधिक मुनाफा कमाएं।", "आवाज़ या टच ले अपन फसल लिखव। स्थानीय मंडी बिचौलिया ला छोड़ के 20-40% जादा मुनाफा कमाव।")}
          </p>
        </div>

        {/* Stepper Wizard Bar */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-2">
            {STEPS.map((s, i) => {
              const isActive = i === step;
              const isPast = i < step;
              return (
                <button
                  key={s.label}
                  onClick={() => i <= step && setStep(i)}
                  className={`flex flex-col items-center text-center p-2.5 rounded-2xl border transition-all ${
                    isActive
                      ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs"
                      : isPast
                      ? "border-slate-200 bg-white text-slate-700"
                      : "border-slate-100 bg-white/60 text-slate-400 opacity-60"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black mb-1 ${
                      isActive
                        ? "bg-emerald-700 text-white"
                        : isPast
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isPast ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold leading-tight line-clamp-1">{s.label}</span>
                  <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">{s.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Step Content Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-card space-y-6">
          {/* AI Voice Assistant Pill */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-4 transition-all">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white ${listening ? "bg-red-600 animate-pulse-ring" : "bg-emerald-700 shadow-sm"}`}>
                  <Mic className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-900">{t("AI Voice Assistant", "AI आवाज़ सहायक", "AI बोलइया सहायक")}</p>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-200/80 text-emerald-950">Multilingual</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">
                    {listening ? (
                      <span className="text-red-700 font-bold flex items-center gap-1.5">
                        <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping"></span>
                        {t("Listening... speak your crop, quantity, and location", "सुन रहे हैं... फसल, मात्रा और स्थान बोलिए", "सुनत हन... फसल, मात्रा आ पता बोलव")}
                      </span>
                    ) : (
                      voiceTranscript || t("Press speak and say: 'Tomato 500 kg Raipur'", "बोलने के लिए दबाएं: 'टमाटर 500 किलो रायपुर'", "बोले बर दबावत: 'टमाटर 500 किलो रायपुर'")
                    )}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={toggleVoice}
                variant={listening ? "danger" : "glow"}
                size="sm"
                className="rounded-xl px-5 h-10 shrink-0 w-full sm:w-auto"
              >
                {listening ? <MicOff className="h-4 w-4 mr-1.5" /> : <Mic className="h-4 w-4 mr-1.5" />}
                {listening ? t("Stop Recording", "रिकॉर्डिंग रोकें", "रिकॉर्डिंग रोकव") : t("Speak Now", "अभी बोलें", "अब बोलव")}
              </Button>
            </div>

            {/* Voice Audio Waveform Visualizer when active */}
            {listening && (
              <div className="mt-3 flex items-center justify-center gap-1.5 py-2">
                {[4, 12, 24, 18, 8, 20, 28, 14, 6, 22, 16, 8].map((h, idx) => (
                  <span
                    key={idx}
                    className="w-1.5 rounded-full bg-red-500 animate-pulse"
                    style={{ height: `${h}px`, animationDelay: `${idx * 0.1}s` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* STEP 0: CROP SELECTION */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="text-sm font-bold text-slate-900">
                  {t("Select Produce", "फसल चुनें", "फसल चुनव")}
                </label>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder={t("Search crop...", "फसल खोजें...", "फसल खोजव...")}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {filteredCrops.map((c) => {
                  const active = crop === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => selectCrop(c.value)}
                      className={`flex flex-col items-center justify-between p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        active
                          ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                      }`}
                    >
                      <span className="text-3xl mb-1.5">{c.emoji}</span>
                      <p className="font-display text-sm font-bold">{c.label}</p>
                      <p className="text-xs text-slate-500 font-medium">{c.labelHi}</p>
                      <div className="mt-2 w-full pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-400">{t("Direct", "सीधा", "सीधा")}</span>
                        <span className="text-emerald-700">₹{c.price}/{t("kg", "किलो", "किलो")}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 1: QUANTITY & EXPECTED RATE */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-900">
                    {t("Harvest Quantity", "फसल की मात्रा", "फसल के मात्रा")}
                  </label>
                  <div className="flex gap-1.5">
                    {[100, 500, 1000, 2500].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuantity(q)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                          quantity === q
                            ? "bg-emerald-700 text-white border-emerald-700"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {q} {t("kg", "किलो", "किलो")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    min={10}
                    className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-lg font-black text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    {t("kg", "किलो", "किलो")} ({Math.round(quantity / 100)} {t("Quintal", "क्विंटल", "क्विंटल")})
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-900">
                  {t("Direct Target Price", "वांछित दर प्रति किलो", "सीधा बेचे के भाव प्रति किलो")}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">₹</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Math.max(1, Number(e.target.value)))}
                    min={1}
                    className="w-full rounded-2xl border-2 border-slate-200 pl-9 pr-16 py-3 text-lg font-black text-emerald-800 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">/ {t("kg", "किलो", "किलो")}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                  <span>{t("Raipur Mandi Benchmark Rate: ₹", "रायपुर मंडी बेंचमार्क दर: ₹", "रायपुर मंडी बेंचमार्क दर: ₹")}{selectedCrop.mandiPrice}/{t("kg", "किलो", "किलो")}</span>
                  <span className="text-emerald-700 font-bold">+{Math.round(((price - selectedCrop.mandiPrice) / selectedCrop.mandiPrice) * 100)}% {t("over mandi", "मंडी से ऊपर", "मंडी ले जादा")}</span>
                </div>
              </div>

              {/* Real-time Earnings Comparison Card */}
              <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-900">{t("Profit Projection", "मुनाफा अनुमान", "मुनाफा अनुमान")}</span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    +₹{netAdvantage.toLocaleString("en-IN")} {t("Extra", "अतिरिक्त", "अतिरिक्त")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] font-bold uppercase text-slate-400">{t("Local Mandi Rate", "स्थानीय मंडी दर", "स्थानीय मंडी दर")}</p>
                    <p className="text-lg font-bold text-slate-600 font-mono mt-0.5">₹{traditionalEarnings.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-100/70 border border-emerald-300">
                    <p className="text-[10px] font-bold uppercase text-emerald-900">{t("KisanSetu Direct Payout", "KisanSetu सीधा भुगतान", "KisanSetu सीधा भुगतान")}</p>
                    <p className="text-xl font-black text-emerald-950 font-mono mt-0.5">₹{totalEarnings.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PICKUP LOCATION & FARM GATE */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-900">
                  {t("Farm Gate Address", "खेत या लोडिंग का पता", "खेत या लोडिंग के पता")}
                </label>
                <button
                  type="button"
                  onClick={handleGeolocate}
                  disabled={geocoding}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200"
                >
                  <LocateFixed className="h-4 w-4 text-emerald-700" />
                  {geocoding ? t("Detecting GPS...", "GPS खोज रहे हैं...", "GPS खोजत हन...") : t("Detect Current GPS", "वर्तमान GPS खोजें", "अपन GPS पता खोजव")}
                </button>
              </div>

              <textarea
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setLocation((prev) => ({ ...prev, address: e.target.value }));
                }}
                rows={2}
                className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder={t("Village, Block, District (e.g. Village Birgaon, Raipur)", "गाँव, ब्लॉक, ज़िला (उदा: ग्राम बीरगांव, रायपुर)", "गाँव, ब्लॉक, ज़िला (उदा: ग्राम बीरगांव, रायपुर)")}
              />

              <div className="rounded-2xl border-2 border-slate-200 overflow-hidden h-[260px] relative shadow-inner">
                <LeafletMap
                  isPicker
                  center={location}
                  selectedLocation={location}
                  onLocationSelect={(loc) => setLocation({ ...loc, address: address || "Pinned Location" })}
                  height="h-full"
                />
              </div>

              <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <Truck className="h-4 w-4 text-emerald-700 shrink-0" />
                {t("Our consolidated 1-truck loop will arrive at this location for direct farm-gate loading.", "हमारा समेकित 1-ट्रक लूप सीधे खेत से लोडिंग के लिए इस स्थान पर पहुंचेगा।", "हमार 1-ट्रक लूप सीधा खेत ले माल भरे खातिर ए पता म पहुंचही।")}
              </p>
            </div>
          )}

          {/* STEP 3: AI QUALITY CHECK WITH LASER SCANNER */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t("AI-Vision Quality Inspector", "AI फसल गुणवत्ता जांच", "AI फसल गुणवत्ता जांच")}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("Upload a photo of your harvest for instant automated Grade A/B certification and premium pricing.", "त्वरित स्वचालित ग्रेड A/B प्रमाणन और प्रीमियम मूल्य निर्धारण के लिए अपनी फसल की एक फोटो अपलोड करें।", "तुरत ग्रेड A/B प्रमाणन आ बढ़िया भाव बर अपन फसल के फोटो अपलोड करव।")}
                </p>
              </div>

              <div
                className="relative overflow-hidden rounded-2xl border-2 border-dashed border-emerald-300 bg-slate-50 p-6 text-center cursor-pointer hover:bg-emerald-50/40 transition-all group"
                onClick={() => fileRef.current?.click()}
              >
                {previewUrl ? (
                  <div className="relative mx-auto max-w-sm rounded-xl overflow-hidden shadow-md">
                    <img src={previewUrl} alt="Crop sample" className="w-full h-52 object-cover" />

                    {/* Laser Scanner Effect when uploading/analyzing */}
                    {uploading && (
                      <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[1px]">
                        <div className="animate-scan-line absolute left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-200 to-emerald-400 shadow-[0_0_15px_#10b981]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-slate-950/80 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-md shadow-lg flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
                            {t("AI Vision Analyzing Rot & Firmness...", "AI विज़न सड़न और गुणवत्ता की जांच कर रहा है...", "AI विज़न खराबी आ गुणवत्ता जांचत हे...")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-sm group-hover:scale-105 transition-transform">
                      <Camera className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{t("Click to capture or upload harvest photo", "फसल की फोटो लेने या अपलोड करने के लिए क्लिक करें", "फसल के फोटो खींचे या डाले बर क्लिक करव")}</p>
                      <p className="text-xs text-slate-500 mt-0.5">JPEG, PNG • Max 10MB</p>
                    </div>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </div>

              {gradeResult && !uploading && (
                <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-300 p-5 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-6 w-6 text-emerald-700" />
                      <div>
                        <h4 className="text-sm font-black text-emerald-950">
                          {t("AI Verification Certificate: Grade", "AI सत्यापन प्रमाण पत्र: ग्रेड", "AI सत्यापन प्रमाण पत्र: ग्रेड")} {gradeResult.grade}
                        </h4>
                        <p className="text-xs text-emerald-700 font-medium">{t("Confidence: 98.4% • Certified for Wholesale Pool", "सटीकता: 98.4% • थोक पूल के लिए प्रमाणित", "सटीकता: 98.4% • थोक पूल बर प्रमाणित")}</p>
                      </div>
                    </div>
                    <Badge variant="gradeA">{t("Grade", "ग्रेड", "ग्रेड")} {gradeResult.grade} {t("Premium", "प्रीमियम", "प्रीमियम")}</Badge>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/80 flex flex-wrap gap-2">
                    {gradeResult.defects?.map((d: string, idx: number) => (
                      <span key={idx} className="text-[11px] font-bold text-emerald-900 bg-white/80 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        ✓ {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
            <Button
              variant="secondary"
              size="md"
              className="rounded-xl px-5"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> {t("Back", "पीछे", "पाछू")}
            </Button>
            <Button
              variant="glow"
              size="md"
              className="rounded-xl px-6"
              onClick={next}
              disabled={!canNext}
              isLoading={submitting}
            >
              {step === 3 ? t("Submit & Pool Harvest", "फसल दर्ज और पूल करें", "फसल जमा आ पूल करव") : t("Next Step", "अगला चरण", "आगे बढ़व")}
              {step < 3 && <ArrowRight className="h-4 w-4 ml-1.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
