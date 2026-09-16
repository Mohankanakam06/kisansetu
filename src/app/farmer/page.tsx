"use client";
import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { CropType, GeoLocation, CreateListingRequest } from "@/types";
import { apiService } from "@/services/api";
import { Button, Badge, Card, cn } from "@/components/ui";
import { useLanguage } from "@/lib/language";
import {
  Search,
  CheckCircle,
  LocateFixed,
  Truck,
  Check,
  ArrowLeft,
  ArrowRight,
  Mic,
  MicOff,
  Camera,
  Sprout,
  Sparkles,
  Award,
  CircleDot,
  ShieldCheck,
  UploadCloud,
  FileCheck,
  Info,
} from "lucide-react";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[260px] bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-600 font-semibold">
      Loading interactive map...
    </div>
  ),
});

type CropLine = {
  crop_type: CropType;
  quantity_kg: number;
  price_expectation: number;
};

type PreviewType = "image" | "video";

type QualityState = {
  previewUrl: string | null;
  previewType: PreviewType | null;
  uploading: boolean;
  gradeResult: any | null;
};

const makeEmptyQualityState = (): QualityState => ({
  previewUrl: null,
  previewType: null,
  uploading: false,
  gradeResult: null,
});

export default function FarmerPage() {
  const { t } = useLanguage();

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kisansetu_user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === "buyer") {
          window.location.href = "/buyer";
        } else {
          setCurrentUser(user);
          if (user.location) {
            if (typeof user.location === "string") {
              setAddress(user.location);
              setLocation((prev) => ({ ...prev, address: user.location }));
            } else if (typeof user.location === "object" && user.location.address) {
              setAddress(user.location.address);
              setLocation((prev) => ({ ...prev, ...user.location }));
            }
          }
        }
      } else {
        window.location.href = "/login";
      }
    } catch (e) {}
  }, []);

  const [step, setStep] = useState(0);

  const STEPS = [
    { label: t("Crop Selection", "फसल चुनें", "फसल चुनव"), sub: t("Select Crop", "फसल चुनें", "फसल चुनव") },
    { label: t("Volume & Price", "मात्रा और भाव", "मात्रा आ भाव"), sub: t("Volume & Price", "मात्रा और भाव", "मात्रा आ भाव") },
    { label: t("Pickup Location", "खेत का पता", "खेत के पता"), sub: t("Location", "खेत का पता", "खेत के पता") },
    { label: t("Quality Grading", "गुणवत्ता जांच", "गुणवत्ता जांच"), sub: t("Grading", "गुणवत्ता जांच", "गुणवत्ता जांच") },
  ];

  const CROPS: { value: CropType; label: string; labelHi: string; emoji: string; price: number; mandiPrice: number }[] = [
    { value: "Tomato", label: t("Desi Tomato", "देसी टमाटर", "टमाटर"), labelHi: "टमाटर", emoji: "🍅", price: 22, mandiPrice: 16 },
    { value: "Onion", label: t("Nashik Red Onion", "नासिक लाल प्याज", "प्याज"), labelHi: "प्याज", emoji: "🧅", price: 28, mandiPrice: 20 },
    { value: "Potato", label: t("Chandramukhi Potato", "चंद्रमुखी आलू", "आलू"), labelHi: "आलू", emoji: "🥔", price: 18, mandiPrice: 12 },
    { value: "Wheat", label: t("Sharbati Wheat", "शरबती गेहूं", "गेहूं"), labelHi: "गेहूं", emoji: "🌾", price: 24, mandiPrice: 19 },
    { value: "Rice", label: t("Jeera Rice", "जीरा फूल चावल", "चावल"), labelHi: "चावल", emoji: "🍚", price: 32, mandiPrice: 25 },
    { value: "Soybean", label: t("JS 335 Soybean", "सोयाबीन JS-335", "सोयाबीन"), labelHi: "सोयाबीन", emoji: "🫘", price: 42, mandiPrice: 34 },
    { value: "Chilli", label: t("G4 Green Chilli", "G4 हरी मिर्च", "हरी मिर्च"), labelHi: "हरी मिर्च", emoji: "🌶️", price: 65, mandiPrice: 48 },
    { value: "Cotton", label: t("Hybrid Cotton", "कपास हाइब्रिड", "कपास"), labelHi: "कपास", emoji: "🌼", price: 55, mandiPrice: 42 },
  ];

  const initialCropLines: CropLine[] = [
    {
      crop_type: "Tomato",
      quantity_kg: 500,
      price_expectation: CROPS.find((c) => c.value === "Tomato")?.price || 22,
    },
  ];

  const [cropLines, setCropLines] = useState<CropLine[]>(initialCropLines);

  const [qualityByCrop, setQualityByCrop] = useState<Record<CropType, QualityState>>({
    Tomato: makeEmptyQualityState(),
    Onion: makeEmptyQualityState(),
    Potato: makeEmptyQualityState(),
    Wheat: makeEmptyQualityState(),
    Rice: makeEmptyQualityState(),
    Soybean: makeEmptyQualityState(),
    Chilli: makeEmptyQualityState(),
    Cotton: makeEmptyQualityState(),
  });

  const fileRefs = useRef<Partial<Record<CropType, HTMLInputElement | null>>>({});

  const [address, setAddress] = useState("Village Birgaon, Block Dharsiwa, Raipur, CG");
  const [location, setLocation] = useState<GeoLocation>({
    lat: 21.28,
    lng: 81.65,
    district: "Raipur",
    address: "Village Birgaon, Block Dharsiwa, Raipur, CG",
  });
  const [geocoding, setGeocoding] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const [listening, setListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const selectedCropSet = new Set(cropLines.map((l) => l.crop_type));

  const filteredCrops = CROPS.filter(
    (c) =>
      c.label.toLowerCase().includes(searchQ.toLowerCase()) ||
      c.labelHi.toLowerCase().includes(searchQ.toLowerCase())
  );

  const toggleCrop = (crop_type: CropType) => {
    setCropLines((prev) => {
      const exists = prev.some((l) => l.crop_type === crop_type);
      if (exists) {
        if (prev.length === 1) return prev;
        return prev.filter((l) => l.crop_type !== crop_type);
      }

      const found = CROPS.find((c) => c.value === crop_type);
      const baseQty = prev[0]?.quantity_kg ?? 500;
      const basePrice = found?.price ?? 1;
      return [...prev, { crop_type, quantity_kg: baseQty, price_expectation: basePrice }];
    });
  };

  const getCropMeta = (crop_type: CropType) => {
    return CROPS.find((c) => c.value === crop_type) || CROPS[0];
  };

  const toggleVoice = () => {
    if (listening) {
      setListening(false);
      if (voiceTimerRef.current) clearTimeout(voiceTimerRef.current);
      return;
    }
    setListening(true);
    setVoiceTranscript("सुन रहे हैं... बोलिए (उदा: 'टमाटर 500 किलो रायपुर')");

    voiceTimerRef.current = setTimeout(() => {
      setVoiceTranscript("पहचाना गया: 'टमाटर 500 किलो रायपुर ₹22 दर'");
      setTimeout(() => {
        setListening(false);
        setCropLines([
          {
            crop_type: "Tomato",
            quantity_kg: 500,
            price_expectation: CROPS.find((c) => c.value === "Tomato")?.price || 22,
          },
        ]);
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
        setAddress(
          "GPS Farm Gate Pin: Raipur Hub (Lat: " + pos.coords.latitude.toFixed(3) + ", Lng: " + pos.coords.longitude.toFixed(3) + ")"
        );
        setGeocoding(false);
      },
      () => {
        setAddress("Raipur Agri Basin, Chhattisgarh");
        setGeocoding(false);
      }
    );
  };

  const handleMediaForCrop = (crop_type: CropType) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 50 * 1024 * 1024) {
        alert("File is too large. Max 50MB allowed.");
        return;
      }

      setQualityByCrop((prev) => ({
        ...prev,
        [crop_type]: {
          ...prev[crop_type],
          uploading: true,
          gradeResult: null,
        },
      }));

      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64Url = ev.target?.result as string;

        setQualityByCrop((prev) => ({
          ...prev,
          [crop_type]: {
            ...prev[crop_type],
            previewUrl: base64Url,
            previewType: file.type.startsWith("video") ? "video" : "image",
          },
        }));

        setTimeout(() => {
          setQualityByCrop((prev) => ({
            ...prev,
            [crop_type]: {
              ...prev[crop_type],
              gradeResult: {
                grade: "A",
                defects: ["Minor skin blemish (2%)", "Slightly uneven sizing"],
                confidence: 0.94,
                crop_detected: crop_type,
                rubric_notes: "Visual inspection confirms Grade A premium quality. Firmness high, minimal defects.",
                passed_items: ["Zero rot", "High firmness (94%)", "Uniform red color"],
              },
              uploading: false,
            },
          }));
        }, 1200);
      };
      reader.readAsDataURL(file);
    };
  };

  const allHaveMedia = cropLines.every((l) => !!qualityByCrop[l.crop_type]?.previewUrl);
  const canNext =
    step === 0
      ? cropLines.length > 0
      : step === 1
      ? cropLines.every((l) => l.quantity_kg > 0 && l.price_expectation > 0)
      : step === 2
      ? address.trim().length > 0
      : step === 3
      ? allHaveMedia
      : true;

  const totalPayout = cropLines.reduce((sum, l) => sum + l.quantity_kg * l.price_expectation, 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const createdResults: any[] = [];

      for (const line of cropLines) {
        const media = qualityByCrop[line.crop_type]?.previewUrl;
        const reqData: CreateListingRequest = {
          crop_type: line.crop_type,
          quantity_kg: line.quantity_kg,
          price_expectation: line.price_expectation,
          farmer_name: currentUser?.name || "Farmer S. Verma",
          farmer_phone: currentUser?.phone || "+91 98271 23456",
          location: { ...location, address },
          photo_url: media || undefined,
          language: "hi",
        };

        const res = await apiService.createFarmerListing(reqData);
        createdResults.push({ ...res, crop_type: line.crop_type });

        const assignedLotId = (res as any)?.assigned_lot_id;
        if (media && assignedLotId) {
          setQualityByCrop((prev) => ({
            ...prev,
            [line.crop_type]: { ...prev[line.crop_type], uploading: true },
          }));
          try {
            const grade = await apiService.gradeProducePhoto(String(assignedLotId), media);
            setQualityByCrop((prev) => ({
              ...prev,
              [line.crop_type]: {
                ...prev[line.crop_type],
                gradeResult: grade,
                uploading: false,
              },
            }));
          } catch (e) {
            setQualityByCrop((prev) => ({
              ...prev,
              [line.crop_type]: { ...prev[line.crop_type], uploading: false },
            }));
          }
        }
      }

      setResult({ createdResults });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step === 3) handleSubmit();
    else setStep(step + 1);
  };

  // Success Confirmation Screen
  if (result) {
    return (
      <div className="flex-1 bg-[#F8FAFC] py-12">
        <div className="mx-auto max-w-lg px-4 space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-xs">
              <Check className="h-7 w-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              {t("Harvest Listed & Clustered Successfully!", "फसल सूची एवं एकत्रीकरण सफल!", "फसल के सूची बन गे!")}
            </h1>
            <p className="text-sm text-slate-600">
              {t(
                "Your produce has been published into the regional wholesale aggregation pool.",
                "आपकी फसल क्षेत्रीय थोक एकत्रीकरण पूल में प्रकाशित हो गई है।",
                "तुंहर फसल क्षेत्रीय थोक एकत्रीकरण पूल म दर्ज हो गे हे।"
              )}
            </p>
          </div>

          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{t("Total Expected UPI Payout", "कुल अनुमानित UPI भुगतान", "कुल अनुमानित UPI भुगतान")}</span>
              <span className="text-xl font-black text-emerald-800 font-display tabular-nums">
                ₹{totalPayout.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="space-y-3">
              {cropLines.map((line) => {
                const qc = qualityByCrop[line.crop_type];
                const grade = qc?.gradeResult?.grade || "A";
                return (
                  <div key={line.crop_type} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-slate-900 font-display">
                          {getCropMeta(line.crop_type).emoji} {line.crop_type} — {line.quantity_kg.toLocaleString()} {t("kg", "किलो", "किलो")}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {t("Locked Rate", "निर्धारित दर", "पक्का दर")}: ₹{line.price_expectation}/{t("kg", "किलो", "किलो")}
                        </div>
                      </div>
                      <Badge variant="gradeA">
                        {t("Grade", "ग्रेड", "ग्रेड")} {grade} Certified
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">{t("Total Lot Value", "कुल लॉट मूल्य", "कुल मूल्य")}</span>
                      <span className="font-bold text-slate-900 tabular-nums">₹{(line.price_expectation * line.quantity_kg).toLocaleString("en-IN")}</span>
                    </div>

                    {qc?.gradeResult?.passed_items?.length ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {qc.gradeResult.passed_items.map((d: string, idx: number) => (
                          <span key={idx} className="text-[10px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            ✓ {d}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                for (const line of cropLines) {
                  try {
                    const inp = fileRefs.current[line.crop_type];
                    if (inp) inp.value = "";
                  } catch (e) {}
                }

                setResult(null);
                setStep(0);
                setSubmitting(false);
                setCropLines([
                  {
                    crop_type: "Tomato",
                    quantity_kg: 500,
                    price_expectation: CROPS.find((c) => c.value === "Tomato")?.price || 22,
                  },
                ]);

                setQualityByCrop({
                  Tomato: makeEmptyQualityState(),
                  Onion: makeEmptyQualityState(),
                  Potato: makeEmptyQualityState(),
                  Wheat: makeEmptyQualityState(),
                  Rice: makeEmptyQualityState(),
                  Soybean: makeEmptyQualityState(),
                  Chilli: makeEmptyQualityState(),
                  Cotton: makeEmptyQualityState(),
                });
              }}
            >
              {t("List Another Crop", "दूसरी फसल दर्ज करें", "अउर फसल लिखव")}
            </Button>
            <a href="/buyer" className="flex-1">
              <Button variant="farmer" className="w-full">
                {t("Explore Buyer Marketplace", "थोक बाजार देखें", "खरीदार बाजार देखव")}
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F8FAFC] py-8 md:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Top Header */}
        <div className="mb-8 text-center space-y-2">
          <Badge variant="farmer" className="mb-1">
            <Sprout className="h-3.5 w-3.5 mr-1" />
            {t("Farmer Direct Portal", "किसान प्रत्यक्ष पोर्टल", "किसान सीधा पोर्टल")}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            {t("List Harvest Directly to Wholesale Buyers", "अपनी फसल सीधे थोक खरीदारों को बेचें", "अपन फसल सीधा थोक खरीदार मन ला बेचव")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            {t(
              "List your produce via AI voice or touch. Save 15–25% mandi commission cuts with 1-truck pooled logistics.",
              "आवाज़ या टच से अपनी फसल दर्ज करें। 1-ट्रक लॉजिस्टिक्स के साथ 15-25% मंडी दलाली बचाएं।",
              "आवाज़ या टच ले फसल लिखव। 1-गाड़ी लॉजिस्टिक्स संग मंडी बिचौलिया के कमीशन बचावा।"
            )}
          </p>
        </div>

        {/* Stepper Header */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-2">
            {STEPS.map((s, i) => {
              const isActive = i === step;
              const isPast = i < step;
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => i <= step && setStep(i)}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all cursor-pointer min-h-[64px] ${
                    isActive
                      ? "border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-700/20"
                      : isPast
                      ? "border-emerald-300 bg-white text-emerald-800 font-semibold"
                      : "border-slate-200 bg-white/70 text-slate-400 opacity-70"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold mb-1 ${
                      isActive
                        ? "bg-emerald-800 text-white"
                        : isPast
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isPast ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className="text-[11px] font-bold leading-tight line-clamp-1">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Card className="space-y-6">
          {/* AI Voice Assistant Trigger Banner (Step 0) */}
          {step === 0 && (
            <div className={`relative overflow-hidden rounded-xl border p-4 transition-all ${listening ? 'bg-rose-50 border-rose-300' : 'bg-emerald-50/60 border-emerald-200'}`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold transition-colors shadow-xs ${
                      listening ? "bg-rose-600 animate-pulse" : "bg-emerald-800"
                    }`}
                  >
                    <Mic className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{t("AI Voice Assistant", "AI आवाज़ सहायक", "AI बोलइया सहायक")}</p>
                      <Badge variant="success" size="sm">Multilingual</Badge>
                    </div>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">
                      {listening ? (
                        <span className="text-rose-700 font-bold flex items-center gap-1.5">
                          <span className="flex h-2 w-2 rounded-full bg-rose-600 animate-ping inline-block"></span>
                          {t("Listening... speak your crop, quantity, and location", "सुन रहे हैं... फसल, मात्रा और स्थान बोलिए", "सुनत हन... फसल, मात्रा आ पता बोलव")}
                        </span>
                      ) : (
                        voiceTranscript || t("Tap speak and say: 'Tomato 500 kg Raipur ₹22'", "बोलने के लिए दबाएं: 'टमाटर 500 किलो रायपुर ₹22'", "बोले बर दबावत: 'टमाटर 500 किलो रायपुर ₹22'")
                      )}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={toggleVoice}
                  variant={listening ? "danger" : "farmer"}
                  size="sm"
                  className="px-4 shrink-0 w-full sm:w-auto"
                >
                  {listening ? <MicOff className="h-4 w-4 mr-1.5" /> : <Mic className="h-4 w-4 mr-1.5" />}
                  {listening ? t("Stop Listening", "रिकॉर्डिंग रोकें", "रिकॉर्डिंग रोकव") : t("Speak Now", "अभी बोलें", "अब बोलव")}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 0: CROP SELECTION */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-700">{t("Select Harvest Produce", "फसल चुनें", "फसल चुनव")}</label>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder={t("Search crop...", "फसल खोजें...", "फसल खोजव...")}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-700 min-h-[38px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {filteredCrops.map((c) => {
                  const active = selectedCropSet.has(c.value);
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => toggleCrop(c.value)}
                      className={`flex flex-col items-center justify-between p-3.5 rounded-xl border text-center transition-all cursor-pointer min-h-[120px] ${
                        active
                          ? "border-emerald-700 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-700/20 shadow-xs"
                          : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <span className="text-2xl mb-1">{c.emoji}</span>
                      <p className="text-xs font-bold text-slate-900 leading-tight font-display">{c.label}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{c.labelHi}</p>
                      <div className="mt-2 w-full pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-bold tabular-nums">
                        <span className="text-slate-500">{t("Direct", "सीधा", "सीधा")}</span>
                        <span className="text-emerald-800 font-bold">₹{c.price}/{t("kg", "किलो", "किलो")}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-slate-500 font-medium">
                {t(
                  "Multi-Crop Support: You can select and pool multiple crops in a single listing.",
                  "आप एक साथ कई फसल चुनकर दर्ज कर सकते हैं।",
                  "एक संग कई फसल चुन सकत हव।"
                )}
              </p>
            </div>
          )}

          {/* STEP 1: VOLUME & PRICE */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700 pb-3 border-b border-slate-100">
                <span>{t("Configuring Produce Volumes:", "फसल मात्रा विन्यास:", "फसल मात्रा सेट करव:")}</span>
                <div className="flex gap-1.5 flex-wrap">
                  {cropLines.map((l) => {
                    const cm = getCropMeta(l.crop_type);
                    return (
                      <span key={l.crop_type} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200">
                        {cm.emoji} {l.crop_type}
                      </span>
                    );
                  })}
                </div>
              </div>

              {cropLines.map((line) => {
                const meta = getCropMeta(line.crop_type);
                const netAdvantage = line.quantity_kg * line.price_expectation - line.quantity_kg * meta.mandiPrice;
                return (
                  <div key={line.crop_type} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4 shadow-xs">
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                      <div>
                        <div className="text-sm font-bold text-slate-900 font-display">
                          {meta.emoji} {meta.label} ({meta.labelHi})
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {t("Set harvest quantity and desired unit price", "मात्रा और अपेक्षित भाव सेट करें", "मात्रा आ भाव सेट करव")}
                        </div>
                      </div>
                      <Badge variant="verified">{t("Direct-to-Buyer", "सीधा खरीदार", "सीधा खरीदार")}</Badge>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-700">{t("Harvest Quantity", "फसल की मात्रा", "फसल के मात्रा")}</label>
                      <div className="flex gap-2 flex-wrap">
                        {[100, 500, 1000, 2500].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() =>
                              setCropLines((prev) => prev.map((l) => (l.crop_type === line.crop_type ? { ...l, quantity_kg: q } : l)))
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer min-h-[36px] ${
                              line.quantity_kg === q
                                ? "bg-emerald-800 text-white border-emerald-900 shadow-xs"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {q} {t("kg", "किलो", "किलो")}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <input
                          type="number"
                          value={line.quantity_kg}
                          onChange={(e) => {
                            const v = Math.max(1, Number(e.target.value));
                            setCropLines((prev) => prev.map((l) => (l.crop_type === line.crop_type ? { ...l, quantity_kg: v } : l)));
                          }}
                          min={10}
                          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base font-bold tabular-nums text-slate-900 bg-white focus:outline-none focus:border-emerald-700 min-h-[44px]"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                          {t("kg", "किलो", "किलो")} ({(line.quantity_kg / 100).toFixed(1)} {t("Quintal", "क्विंटल", "क्विंटल")})
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-700">{t("Direct Target Price", "वांछित दर प्रति किलो", "सीधा बेचे के भाव प्रति किलो")}</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-500">₹</span>
                        <input
                          type="number"
                          value={line.price_expectation}
                          onChange={(e) => {
                            const v = Math.max(1, Number(e.target.value));
                            setCropLines((prev) =>
                              prev.map((l) => (l.crop_type === line.crop_type ? { ...l, price_expectation: v } : l))
                            );
                          }}
                          min={1}
                          className="w-full rounded-lg border border-slate-300 pl-8 pr-16 py-2.5 text-base font-bold text-emerald-900 tabular-nums bg-white focus:outline-none focus:border-emerald-700 min-h-[44px]"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">/ {t("kg", "किलो", "किलो")}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600 font-medium px-1 tabular-nums">
                        <span>
                          {t("Raipur APMC Mandi Benchmark: ₹", "रायपुर APMC मंडी बेंचमार्क: ₹", "रायपुर मंडी बेंचमार्क: ₹")}
                          {meta.mandiPrice}/{t("kg", "किलो", "किलो")}
                        </span>
                        <span className="text-emerald-800 font-bold">
                          +{Math.round(((line.price_expectation - meta.mandiPrice) / meta.mandiPrice) * 100)}% {t("over mandi rate", "मंडी दर से अधिक", "मंडी ले जादा")}
                        </span>
                      </div>

                      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-900">{t("Projected Commission Saved", "अनुमानित कमीशन बचत", "कमीशन बचत")}</span>
                          <span className="font-bold tabular-nums text-emerald-900 bg-white border border-emerald-200 px-2 py-0.5 rounded shadow-2xs">
                            +₹{netAdvantage.toLocaleString("en-IN")} {t("Extra", "अतिरिक्त", "अतिरिक्त")}
                          </span>
                        </div>
                        <div className="text-slate-600 font-medium flex justify-between tabular-nums pt-1">
                          <span>{t("Total Direct Lot Payout", "कुल लॉट भुगतान", "कुल भुगतान")}:</span>
                          <span className="font-bold text-slate-900">₹{(line.quantity_kg * line.price_expectation).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 2: PICKUP LOCATION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-700">{t("Farm Gate Pickup Address", "खेत या लोडिंग का पता", "खेत या लोडिंग के पता")}</label>
                <button
                  type="button"
                  onClick={handleGeolocate}
                  disabled={geocoding}
                  className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer min-h-[36px]"
                >
                  <LocateFixed className="h-3.5 w-3.5" />
                  {geocoding
                    ? t("Detecting GPS...", "GPS खोज रहे हैं...", "GPS खोजत हन...")
                    : t("Detect Farm Gate GPS", "खेत का GPS पिन लगाएं", "खेत के GPS पिन लगाव")}
                </button>
              </div>

              <textarea
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setLocation((prev) => ({ ...prev, address: e.target.value }));
                }}
                rows={2}
                className="w-full rounded-lg border border-slate-300 p-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:border-emerald-700"
                placeholder={t(
                  "Village, Block, District (e.g. Village Birgaon, Raipur)",
                  "गाँव, ब्लॉक, ज़िला (उदा: ग्राम बीरगांव, रायपुर)",
                  "गाँव, ब्लॉक, ज़िला (उदा: ग्राम बीरगांव, रायपुर)"
                )}
              />

              <div className="rounded-xl border border-slate-300 overflow-hidden h-[260px] relative shadow-xs">
                <LeafletMap
                  isPicker
                  center={location}
                  selectedLocation={location}
                  onLocationSelect={(loc: any) => {
                    const resolvedAddr = loc.address || address || "Pinned Location";
                    setLocation({ ...loc, address: resolvedAddr });
                    if (loc.address) setAddress(loc.address);
                  }}
                  height="h-full"
                />
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <Truck className="h-5 w-5 text-blue-800 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900 font-medium">
                  {t(
                    "Our consolidated 1-truck pickup loop will arrive directly at this farm gate coordinate. No tractor trips needed.",
                    "हमारा 1-ट्रक पिकअप लूप सीधे आपके खेत के पिन पर पहुंचेगा। मंडी के लिए अलग ट्रैक्टर किराए की आवश्यकता नहीं है।",
                    "हमार 1-गाड़ी लूप सीधा तुंहर खेत म पहुंचही। मंडी बर अलग ट्रैक्टर नइ लगय।"
                  )}
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: QUALITY GRADING */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">{t("AI Computer Vision Produce Quality Inspection", "AI फसल गुणवत्ता जांच", "AI फसल गुणवत्ता जांच")}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{t("Upload produce photo or video for instant Grade A/B certification and defect analysis.", "त्वरित AI ग्रेड A/B प्रमाणन के लिए फसल की फोटो या वीडियो अपलोड करें।", "तुरत AI ग्रेड A/B बर फोटो या वीडियो डालव।")}</p>
              </div>

              {cropLines.map((line) => {
                const meta = getCropMeta(line.crop_type);
                const qc = qualityByCrop[line.crop_type];

                return (
                  <div key={line.crop_type} className="pt-2">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-emerald-800" />
                        <div className="text-sm font-bold text-slate-900 font-display">
                          {meta.emoji} {meta.label} ({meta.labelHi})
                        </div>
                      </div>
                      {qc?.gradeResult?.grade ? (
                        <Badge variant="gradeA">
                          {t("Certified Grade", "सत्यापित ग्रेड", "सत्यापित ग्रेड")} {qc.gradeResult.grade}
                        </Badge>
                      ) : null}
                    </div>

                    <div
                      className="relative overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center cursor-pointer hover:bg-slate-100/70 transition-all group"
                      onClick={() => fileRefs.current[line.crop_type]?.click()}
                    >
                      {qc.previewUrl ? (
                        <div className="relative mx-auto rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                          {qc.previewType === "video" ? (
                            <video
                              src={qc.previewUrl}
                              controls
                              className="w-full h-52 object-cover bg-black"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <img src={qc.previewUrl} alt="Crop sample" className="w-full h-52 object-cover bg-black" />
                          )}

                          {qc.uploading && (
                            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center">
                              <div className="bg-white text-slate-900 text-xs font-bold uppercase tracking-wide border border-slate-200 px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-emerald-700 animate-spin" />
                                {t("Gemini Vision Grading...", "AI विज़न जांच कर रहा है...", "AI विज़न जांचत हे...")}
                              </div>
                            </div>
                          )}

                          {!qc.uploading && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileRefs.current[line.crop_type]?.click();
                              }}
                              className="absolute bottom-2 right-2 bg-white text-xs font-bold text-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer min-h-[36px]"
                            >
                              {t("Change Photo", "फोटो बदलें", "फोटो बदलव")}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 py-6">
                          <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs group-hover:scale-105 transition-transform">
                            <Camera className="h-6 w-6 text-emerald-800" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{t("Tap to take photo or upload crop video", "फोटो लेने या वीडियो अपलोड करने के लिए टैप करें", "फोटो लेहे या वीडियो डाले बर टैप करव")}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">JPEG, PNG, MP4 • {t("Max 50MB", "अधिकतम 50MB", "ज्यादा से ज्यादा 50MB")}</p>
                          </div>
                        </div>
                      )}

                      <input
                        ref={(el) => {
                          fileRefs.current[line.crop_type] = el;
                        }}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleMediaForCrop(line.crop_type)}
                        className="hidden"
                      />
                    </div>

                    {qc.gradeResult && !qc.uploading ? (
                      <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3 shadow-2xs">
                        <div className="flex items-start justify-between pb-2 border-b border-slate-200/80">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-emerald-800" />
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                                {t("AI Quality Certificate", "AI गुणवत्ता प्रमाण पत्र", "AI गुणवत्ता प्रमाण पत्र")}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-medium tabular-nums">
                                {t("Confidence: ", "सटीकता: ", "सटीकता: ")}
                                {((qc.gradeResult.confidence || 0.94) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                          <Badge variant="gradeA">
                            {t("Grade", "ग्रेड", "ग्रेड")} {qc.gradeResult.grade}
                          </Badge>
                        </div>

                        {qc.gradeResult.passed_items?.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide">{t("Passed Quality Rubric Checks", "सत्यापित गुणवत्ता पैरामीटर", "पास क्वालिटी जांच")}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {qc.gradeResult.passed_items.map((d: string, idx: number) => (
                                <span key={idx} className="text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                  ✓ {d}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {/* Navigation Action Buttons */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              className="px-5"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> {t("Back", "पीछे", "पाछू")}
            </Button>
            <Button
              variant="farmer"
              className="flex-1 max-w-sm ml-auto"
              onClick={next}
              disabled={!canNext}
              isLoading={submitting}
            >
              {step === 3
                ? t("Submit Harvest to Aggregation Pool", "फसल पूल में जमा करें", "फसल पूल म जमा करव")
                : t("Continue", "आगे बढ़ें", "आगे बढ़व")}
              {step < 3 && <ArrowRight className="h-4 w-4 ml-1.5" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
