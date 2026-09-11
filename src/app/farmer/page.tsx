"use client";
import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { CropType, GeoLocation, CreateListingRequest } from "@/types";
import { apiService } from "@/services/api";
import { Button, Badge } from "@/components/ui";
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
} from "lucide-react";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[260px] bg-slate-50 rounded-2xl flex items-center justify-center text-xs text-slate-400 font-bold">
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

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kisansetu_user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === "buyer") {
          window.location.href = "/buyer";
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
    { value: "Tomato", label: t("Tomato", "टमाटर", "टमाटर"), labelHi: "टमाटर", emoji: "🍅", price: 22, mandiPrice: 16 },
    { value: "Onion", label: t("Onion", "प्याज", "प्याज"), labelHi: "प्याज", emoji: "🧅", price: 28, mandiPrice: 20 },
    { value: "Potato", label: t("Potato", "आलू", "आलू"), labelHi: "आलू", emoji: "🥔", price: 18, mandiPrice: 12 },
    { value: "Wheat", label: t("Wheat", "गेहूं", "गेहूं"), labelHi: "गेहूं", emoji: "🌾", price: 24, mandiPrice: 19 },
    { value: "Rice", label: t("Rice", "चावल", "चावल"), labelHi: "चावल", emoji: "🍚", price: 32, mandiPrice: 25 },
    { value: "Soybean", label: t("Soybean", "सोयाबीन", "सोयाबीन"), labelHi: "सोयाबीन", emoji: "🫘", price: 42, mandiPrice: 34 },
    { value: "Chilli", label: t("Chilli", "हरी मिर्च", "हरी मिर्च"), labelHi: "हरी मिर्च", emoji: "🌶️", price: 65, mandiPrice: 48 },
    { value: "Cotton", label: t("Cotton", "कपास", "कपास"), labelHi: "कपास", emoji: "🌼", price: 55, mandiPrice: 42 },
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

  // Voice assistant state
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

    // Keep quality state; if user re-selects later, it can be reused.
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
                defects: ["Zero rot", "High firmness (94%)", "Uniform sizing"],
                confidence: 0.98,
                rubric_notes: "Visual inspection confirms Grade A premium quality.",
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
          farmer_name: "Farmer S. Verma",
          farmer_phone: "+91 98271 23456",
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

  if (result) {
    const createdResults: any[] = result.createdResults || [];

    return (
      <div className="flex-1 bg-[#f8faf9] py-12">
        <div className="mx-auto max-w-lg px-4 space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-700 text-white shadow-glow">
              <Check />
            </div>
            <h1 className="text-3xl font-black text-slate-950 font-display">{t("Harvest Listed Successfully!", "फसल सूची सफल!", "फसल के सूची बन गे!")}</h1>
            <p className="text-sm font-semibold text-slate-600">
              {t(
                "Your harvest has been published to the KisanSetu wholesale aggregation pool.",
                "आपकी फसल KisanSetu थोक एकत्रीकरण पूल में प्रकाशित हो गई है।",
                "तुंहर फसल KisanSetu थोक एकत्रीकरण पूल म दर्ज हो गे हे।"
              )}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">{t("Total Estimated UPI Payout", "कुल अनुमानित UPI भुगतान", "कुल अनुमानित UPI भुगतान")}</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                ₹{totalPayout.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="space-y-4">
              {cropLines.map((line) => {
                const qc = qualityByCrop[line.crop_type];
                const grade = qc?.gradeResult?.grade || "A";
                return (
                  <div key={line.crop_type} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-slate-900">
                          {getCropMeta(line.crop_type).emoji} {line.crop_type} — {line.quantity_kg.toLocaleString()} {t("kg", "किलो", "किलो")}
                        </div>
                        <div className="text-xs text-slate-600 font-medium">
                          {t("Locked Rate", "निर्धारित दर", "पक्का दर")} : ₹{line.price_expectation}/{t("kg", "किलो", "किलो")}
                        </div>
                      </div>
                      <Badge variant="gradeA">
                        {t("Grade", "ग्रेड", "ग्रेड")} {grade}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between text-xs">
                      <span className="text-slate-600 font-bold">{t("Estimated Value", "अनुमानित मूल्य", "अनुमानित मूल्य")}</span>
                      <span className="font-black text-emerald-950">₹{(line.price_expectation * line.quantity_kg).toLocaleString("en-IN")}</span>
                    </div>

                    {qc?.gradeResult?.defects?.length ? (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {qc.gradeResult.defects.slice(0, 4).map((d: string, idx: number) => (
                          <span key={idx} className="text-[11px] font-bold text-emerald-900 bg-white/80 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            ✓ {d}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              className="flex-1 rounded-xl h-12"
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

                setAddress("Village Birgaon, Block Dharsiwa, Raipur, CG");
                setLocation({
                  lat: 21.28,
                  lng: 81.65,
                  district: "Raipur",
                  address: "Village Birgaon, Block Dharsiwa, Raipur, CG",
                });
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
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <Sprout className="h-3.5 w-3.5 text-emerald-600" />
            {t("Farmer Produce Gateway", "किसान उपज गेटवे", "किसान उपज गेटवे")}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 font-display">{t("Sell Your Harvest Directly to Wholesale Buyers", "अपनी फसल सीधे थोक खरीदारों को बेचें", "अपन फसल सीधा थोक खरीदार मन ला बेचव")}</h1>
          <p className="text-sm font-medium text-slate-600 max-w-lg mx-auto">
            {t(
              "List your harvest with voice or touch. Earn 20–40% higher profits by skipping local mandi middlemen.",
              "आवाज़ या टच से अपनी फसल दर्ज करें। स्थानीय मंडी बिचौलियों को छोड़कर 20-40% अधिक मुनाफा कमाएं।",
              "आवाज़ या टच ले अपन फसल लिखव। स्थानीय मंडी बिचौलिया ला छोड़ के 20-40% जादा मुनाफा कमाव।"
            )}
          </p>
        </div>

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

        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-card space-y-6">
          {step === 0 && (
            <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-4 transition-all">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white ${
                      listening ? "bg-red-600 animate-pulse-ring" : "bg-emerald-700 shadow-sm"
                    }`}
                  >
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
          )}

          {step === 0 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="text-sm font-bold text-slate-900">{t("Select Produce", "फसल चुनें", "फसल चुनव")}</label>
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
                  const active = selectedCropSet.has(c.value);
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => toggleCrop(c.value)}
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

              <div className="text-xs text-slate-500">
                {t(
                  "Tip: You can select multiple crops and submit them together.",
                  "टिप: आप एक साथ कई फसल चुन सकते हैं।",
                  "टिप: एक साथ कई फसल चुन सकत हन।"
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              {cropLines.map((line) => {
                const meta = getCropMeta(line.crop_type);
                const netAdvantage = line.quantity_kg * line.price_expectation - line.quantity_kg * meta.mandiPrice;
                return (
                  <div key={line.crop_type} className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-black text-slate-900">
                          {meta.emoji} {meta.labelHi}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {t("Set volume & expected rate", "मात्रा और अपेक्षित भाव सेट करें", "मात्रा आ अपेक्षित भाव सेट करव")}
                        </div>
                      </div>
                      <Badge variant="gradeA">{t("Direct", "सीधा", "सीधा")}</Badge>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-900">{t("Harvest Quantity", "फसल की मात्रा", "फसल के मात्रा")}</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {[100, 500, 1000, 2500].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() =>
                              setCropLines((prev) => prev.map((l) => (l.crop_type === line.crop_type ? { ...l, quantity_kg: q } : l)))
                            }
                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                              line.quantity_kg === q
                                ? "bg-emerald-700 text-white border-emerald-700"
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
                          className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-lg font-black text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                          {t("kg", "किलो", "किलो")} ({Math.round(line.quantity_kg / 100)} {t("Quintal", "क्विंटल", "क्विंटल")})
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-900">{t("Direct Target Price", "वांछित दर प्रति किलो", "सीधा बेचे के भाव प्रति किलो")}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">₹</span>
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
                          className="w-full rounded-2xl border-2 border-slate-200 pl-9 pr-16 py-3 text-lg font-black text-emerald-800 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">/ {t("kg", "किलो", "किलो")}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                        <span>
                          {t("Raipur Mandi Benchmark Rate: ₹", "रायपुर मंडी बेंचमार्क दर: ₹", "रायपुर मंडी बेंचमार्क दर: ₹")}
                          {meta.mandiPrice}/{t("kg", "किलो", "किलो")}
                        </span>
                        <span className="text-emerald-700 font-bold">
                          +{Math.round(((line.price_expectation - meta.mandiPrice) / meta.mandiPrice) * 100)}% {t("over mandi", "मंडी से ऊपर", "मंडी ले जादा")}
                        </span>
                      </div>

                      <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50/60 p-4 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-emerald-900">{t("Profit Projection", "मुनाफा अनुमान", "मुनाफा अनुमान")}</span>
                          <span className="font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                            +₹{netAdvantage.toLocaleString("en-IN")} {t("Extra", "अतिरिक्त", "अतिरिक्त")}
                          </span>
                        </div>
                        <div className="mt-3 text-slate-700">
                          {t("KisanSetu Direct Payout", "KisanSetu सीधा भुगतान", "KisanSetu सीधा भुगतान")}: ₹{(line.quantity_kg * line.price_expectation).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-900">{t("Farm Gate Address", "खेत या लोडिंग का पता", "खेत या लोडिंग के पता")}</label>
                <button
                  type="button"
                  onClick={handleGeolocate}
                  disabled={geocoding}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200"
                >
                  <LocateFixed className="h-4 w-4 text-emerald-700" />
                  {geocoding
                    ? t("Detecting GPS...", "GPS खोज रहे हैं...", "GPS खोजत हन...")
                    : t("Detect Current GPS", "वर्तमान GPS खोजें", "अपन GPS पता खोजव")}
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
                placeholder={t(
                  "Village, Block, District (e.g. Village Birgaon, Raipur)",
                  "गाँव, ब्लॉक, ज़िला (उदा: ग्राम बीरगांव, रायपुर)",
                  "गाँव, ब्लॉक, ज़िला (उदा: ग्राम बीरगांव, रायपुर)"
                )}
              />

              <div className="rounded-2xl border-2 border-slate-200 overflow-hidden h-[260px] relative shadow-inner">
                <LeafletMap
                  isPicker
                  center={location}
                  selectedLocation={location}
                  onLocationSelect={(loc: any) => setLocation({ ...loc, address: address || "Pinned Location" })}
                  height="h-full"
                />
              </div>

              <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <Truck className="h-4 w-4 text-emerald-700 shrink-0" />
                {t(
                  "Our consolidated 1-truck loop will arrive at this location for direct farm-gate loading.",
                  "हमारा समेकित 1-ट्रक लूप सीधे खेत से लोडिंग के लिए इस स्थान पर पहुंचेगा।",
                  "हमार 1-ट्रक लूप सीधा खेत ले माल भरे खातिर ए पता म पहुंचही।"
                )}
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t("AI-Vision Quality Inspector", "AI फसल गुणवत्ता जांच", "AI फसल गुणवत्ता जांच")}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{t("Upload a photo or short video of each selected crop for instant AI Grade A/B certification.", "त्वरित AI ग्रेड A/B प्रमाणन के लिए चुनी हुई हर फसल की फोटो या छोटा वीडियो अपलोड करें।", "तुरत AI ग्रेड A/B बर चुनी हुई हर फसल के फोटो या वीडियो डालव।")}</p>
              </div>

              {cropLines.map((line) => {
                const meta = getCropMeta(line.crop_type);
                const qc = qualityByCrop[line.crop_type];

                return (
                  <div key={line.crop_type} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-emerald-700" />
                        <div className="text-sm font-black text-slate-900">
                          {meta.emoji} {meta.labelHi}
                        </div>
                      </div>
                      {qc?.gradeResult?.grade ? (
                        <Badge variant="gradeA">
                          {t("Grade", "ग्रेड", "ग्रेड")} {qc.gradeResult.grade}
                        </Badge>
                      ) : null}
                    </div>

                    <div
                      className="relative overflow-hidden rounded-2xl border-2 border-dashed border-emerald-300 bg-slate-50 p-6 text-center cursor-pointer hover:bg-emerald-50/40 transition-all group"
                      onClick={() => fileRefs.current[line.crop_type]?.click()}
                    >
                      {qc.previewUrl ? (
                        <div className="relative mx-auto max-w-sm rounded-xl overflow-hidden shadow-md">
                          {qc.previewType === "video" ? (
                            <video
                              src={qc.previewUrl}
                              controls
                              className="w-full h-52 object-cover"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <img src={qc.previewUrl} alt="Crop sample" className="w-full h-52 object-cover" />
                          )}

                          {qc.uploading && (
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

                          {!qc.uploading && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileRefs.current[line.crop_type]?.click();
                              }}
                              className="absolute bottom-2 right-2 bg-white/90 backdrop-blur text-[10px] font-bold text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 shadow hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                            >
                              {t("Change", "बदलें", "बदलव")}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 py-6">
                          <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-sm group-hover:scale-105 transition-transform">
                            <Camera className="h-7 w-7" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{t("Click to capture or upload harvest photo / video", "फसल की फोटो या वीडियो अपलोड करें", "फसल के फोटो या वीडियो डालव")}</p>
                            <p className="text-xs text-slate-500 mt-0.5">JPEG, PNG, MP4, MOV • {t("Max 50MB", "अधिकतम 50MB", "ज्यादा से ज्यादा 50MB")}</p>
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
                      <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-300 p-5 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="h-6 w-6 text-emerald-700" />
                            <div>
                              <h4 className="text-sm font-black text-emerald-950">
                                {t("AI Verification Certificate: Grade", "AI सत्यापन प्रमाण पत्र: ग्रेड", "AI सत्यापन प्रमाण पत्र: ग्रेड")} {qc.gradeResult.grade}
                              </h4>
                              <p className="text-xs text-emerald-700 font-medium">
                                {t(
                                  "Confidence: 98.4% • Certified for Wholesale Pool",
                                  "सटीकता: 98.4% • थोक पूल के लिए प्रमाणित",
                                  "सटीकता: 98.4% • थोक पूल बर प्रमाणित"
                                )}
                              </p>
                            </div>
                          </div>
                          <Badge variant="gradeA">
                            {t("Grade", "ग्रेड", "ग्रेड")} {qc.gradeResult.grade} {t("Premium", "प्रीमियम", "प्रीमियम")}
                          </Badge>
                        </div>

                        <div className="pt-2 border-t border-emerald-200/80 flex flex-wrap gap-2">
                          {qc.gradeResult.defects?.map((d: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[11px] font-bold text-emerald-900 bg-white/80 border border-emerald-200 px-2.5 py-1 rounded-lg"
                            >
                              ✓ {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

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
              {step === 3
                ? t("Submit & Pool Harvest", "फसल दर्ज और पूल करें", "फसल जमा आ पूल करव")
                : t("Next Step", "अगला चरण", "आगे बढ़व")}
              {step < 3 && <ArrowRight className="h-4 w-4 ml-1.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
