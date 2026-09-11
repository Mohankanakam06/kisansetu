"use client";
import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { CropType, GeoLocation, CreateListingRequest } from "@/types";
import { apiService } from "@/services/api";
import { Button, Badge, Card } from "@/components/ui";
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
    <div className="w-full h-[260px] bg-[#E2E4DE] border-2 border-[#1E1F1C] rounded-sm flex items-center justify-center text-xs text-[#1E1F1C] font-bold">
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
      <div className="flex-1 bg-[#EBECE8] py-12">
        <div className="mx-auto max-w-lg px-4 space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-sm border-2 border-[#1E1F1C] bg-[#386641] text-white shadow-[3px_3px_0_0_#1E1F1C]">
              <Check className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black text-[#1E1F1C] font-display uppercase tracking-tight">{t("Harvest Listed Successfully!", "फसल सूची सफल!", "फसल के सूची बन गे!")}</h1>
            <p className="text-sm font-semibold text-[#52544D]">
              {t(
                "Your harvest has been published to the KisanSetu wholesale aggregation pool.",
                "आपकी फसल KisanSetu थोक एकत्रीकरण पूल में प्रकाशित हो गई है।",
                "तुंहर फसल KisanSetu थोक एकत्रीकरण पूल म दर्ज हो गे हे।"
              )}
            </p>
          </div>

          <Card className="space-y-5 bg-white">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E1F1C]">
              <span className="text-xs font-black uppercase tracking-wider text-[#52544D]">{t("Total Estimated UPI Payout", "कुल अनुमानित UPI भुगतान", "कुल अनुमानित UPI भुगतान")}</span>
              <Badge variant="verified">
                ₹{totalPayout.toLocaleString("en-IN")}
              </Badge>
            </div>

            <div className="space-y-4">
              {cropLines.map((line) => {
                const qc = qualityByCrop[line.crop_type];
                const grade = qc?.gradeResult?.grade || "A";
                return (
                  <div key={line.crop_type} className="rounded-sm border-2 border-[#1E1F1C] bg-[#F7F7F6] p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-[#1E1F1C]">
                          {getCropMeta(line.crop_type).emoji} {line.crop_type} — {line.quantity_kg.toLocaleString()} {t("kg", "किलो", "किलो")}
                        </div>
                        <div className="text-xs text-[#52544D] font-bold">
                          {t("Locked Rate", "निर्धारित दर", "पक्का दर")} : ₹{line.price_expectation}/{t("kg", "किलो", "किलो")}
                        </div>
                      </div>
                      <Badge variant="gradeA">
                        {t("Grade", "ग्रेड", "ग्रेड")} {grade}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t-2 border-[#1E1F1C] flex justify-between text-xs mt-2">
                      <span className="text-[#52544D] font-bold">{t("Estimated Value", "अनुमानित मूल्य", "अनुमानित मूल्य")}</span>
                      <span className="font-black text-[#1E1F1C]">₹{(line.price_expectation * line.quantity_kg).toLocaleString("en-IN")}</span>
                    </div>

                    {qc?.gradeResult?.defects?.length ? (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {qc.gradeResult.defects.slice(0, 4).map((d: string, idx: number) => (
                          <span key={idx} className="text-[11px] font-bold text-[#1E1F1C] bg-[#E2E4DE] border border-[#1E1F1C] px-2.5 py-1 rounded-sm">
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
              className="flex-1 h-12"
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
              <Button variant="farmer" className="w-full h-12">
                {t("Explore Buyer Market", "खरीदार बाजार देखें", "खरीदार बाजार देखव")}
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#EBECE8] py-8 md:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-8 text-center space-y-2">
          <Badge variant="farmer" className="mb-2">
            <Sprout className="h-3.5 w-3.5 mr-1" />
            {t("Farmer Produce Gateway", "किसान उपज गेटवे", "किसान उपज गेटवे")}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1E1F1C] font-display tracking-tight uppercase">
            {t("Sell Your Harvest Directly to Wholesale Buyers", "अपनी फसल सीधे थोक खरीदारों को बेचें", "अपन फसल सीधा थोक खरीदार मन ला बेचव")}
          </h1>
          <p className="text-sm font-bold text-[#52544D] max-w-lg mx-auto tabular-nums">
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
                  className={`flex flex-col items-center text-center p-2.5 rounded-sm border-2 transition-all ${
                    isActive
                      ? "border-[#1E1F1C] bg-[#C04A22] text-[#EBECE8] shadow-[3px_3px_0_0_#1E1F1C]"
                      : isPast
                      ? "border-[#1E1F1C] bg-white text-[#1E1F1C]"
                      : "border-[#C2C5BC] bg-white/60 text-[#52544D] opacity-60"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black mb-1 border border-current ${
                      isActive
                        ? "bg-[#1E1F1C] text-white"
                        : isPast
                        ? "bg-[#C04A22] text-white border-none"
                        : "bg-transparent text-[#52544D]"
                    }`}
                  >
                    {isPast ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold leading-tight line-clamp-1">{s.label}</span>
                  <span className="text-[10px] opacity-80 font-bold hidden sm:inline">{s.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 bg-white">
          {step === 0 && (
            <div className={`relative overflow-hidden rounded-sm border-2 border-[#1E1F1C] p-4 transition-all shadow-[inset_0_3px_6px_rgba(0,0,0,0.1)] ${listening ? 'bg-[#fae8e0]' : 'bg-[#F7F7F6]'}`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-sm text-white font-black border-2 border-[#1E1F1C] ${
                      listening ? "bg-red-600 animate-pulse border-red-950" : "bg-[#C04A22] shadow-[2px_2px_0_0_#1E1F1C]"
                    }`}
                  >
                    <Mic className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black uppercase tracking-wider text-[#1E1F1C]">{t("AI Voice Assistant", "AI आवाज़ सहायक", "AI बोलइया सहायक")}</p>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-[#1E1F1C] text-[#EBECE8]">Multilingual</span>
                    </div>
                    <p className="text-sm font-bold text-[#1E1F1C] mt-0.5">
                      {listening ? (
                        <span className="text-[#C04A22] font-black flex items-center gap-1.5">
                          <span className="flex h-2 w-2 rounded-full bg-[#1E1F1C] animate-ping"></span>
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
                  variant={listening ? "danger" : "farmer"}
                  size="sm"
                  className="px-5 shrink-0 w-full sm:w-auto"
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
                      className="w-1.5 rounded-sm bg-[#C04A22] animate-pulse"
                      style={{ height: `${h}px`, animationDelay: `${idx * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#1E1F1C]">
                <label className="text-sm font-black uppercase text-[#1E1F1C] tracking-wide">{t("Select Produce", "फसल चुनें", "फसल चुनव")}</label>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52544D]" />
                  <input
                    type="text"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder={t("Search crop...", "फसल खोजें...", "फसल खोजव...")}
                    className="w-full rounded-sm border-2 border-[#1E1F1C] bg-white pl-9 pr-4 py-1.5 text-xs font-bold text-[#1E1F1C] focus:outline-none focus:ring-2 focus:ring-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C]"
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
                      className={`flex flex-col items-center justify-between p-4 rounded-sm border-2 text-center transition-all cursor-pointer ${
                        active
                          ? "border-[#1E1F1C] bg-[#fae8e0] shadow-[3px_3px_0_0_#1E1F1C] translate-x-[-1px] translate-y-[-1px]"
                          : "border-[#1E1F1C] bg-white hover:bg-[#F7F7F6] text-[#1E1F1C] hover:shadow-[3px_3px_0_0_#1E1F1C]"
                      }`}
                    >
                      <span className="text-3xl mb-1.5">{c.emoji}</span>
                      <p className="font-display text-sm font-bold text-[#1E1F1C]">{c.label}</p>
                      <p className="text-[10px] uppercase font-bold text-[#52544D]">{c.labelHi}</p>
                      <div className="mt-2 w-full pt-1.5 border-t-2 border-[#1E1F1C] flex items-center justify-between text-[10px] font-black uppercase tabular-nums">
                        <span className="text-[#1E1F1C]">{t("Direct", "सीधा", "सीधा")}</span>
                        <span className="text-[#386641]">₹{c.price}/{t("kg", "किलो", "किलो")}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] font-bold text-[#52544D] italic pt-2">
                {t(
                  "Tip: You can select multiple crops and submit them together.",
                  "टिप: आप एक साथ कई फसल चुन सकते हैं।",
                  "टिप: एक साथ कई फसल चुन सकत हन।"
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm font-black uppercase text-[#1E1F1C] px-1 pb-3 border-b-2 border-[#1E1F1C]">
                <span>{t("Selected Crops:", "चुनी गई फसलें:", "चुनी गई फसल मन:")}</span>
                <div className="flex gap-1.5 flex-wrap">
                  {cropLines.map((l) => {
                    const cm = getCropMeta(l.crop_type);
                    return (
                      <span key={l.crop_type} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#1E1F1C] text-[#EBECE8] text-[10px] font-bold">
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
                  <div key={line.crop_type} className="rounded-sm border-2 border-[#1E1F1C] bg-white p-4 space-y-4 shadow-[3px_3px_0_0_#1E1F1C]">
                    <div className="flex items-start justify-between pb-3 border-b border-[#1E1F1C]">
                      <div>
                        <div className="text-base font-display font-black text-[#1E1F1C]">
                          {meta.emoji} {meta.labelHi} ({meta.label})
                        </div>
                        <div className="text-[10px] uppercase text-[#52544D] font-bold">
                          {t("Set volume & expected rate", "मात्रा और अपेक्षित भाव सेट करें", "मात्रा आ अपेक्षित भाव सेट करव")}
                        </div>
                      </div>
                      <Badge variant="farmer">{t("Direct", "सीधा", "सीधा")}</Badge>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-wider text-[#1E1F1C]">{t("Harvest Quantity", "फसल की मात्रा", "फसल के मात्रा")}</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {[100, 500, 1000, 2500].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() =>
                              setCropLines((prev) => prev.map((l) => (l.crop_type === line.crop_type ? { ...l, quantity_kg: q } : l)))
                            }
                            className={`px-3 py-1.5 rounded-sm text-xs font-bold border-2 transition-colors ${
                              line.quantity_kg === q
                                ? "bg-[#1E1F1C] text-white border-[#1E1F1C]"
                                : "bg-[#F7F7F6] text-[#1E1F1C] border-[#1E1F1C] hover:bg-[#E2E4DE]"
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
                          className="w-full rounded-sm border-2 border-[#1E1F1C] px-4 py-2.5 text-lg font-black tabular-nums text-[#1E1F1C] bg-[#F7F7F6] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1E1F1C]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#52544D]">
                          {t("kg", "किलो", "किलो")} ({Math.round(line.quantity_kg / 100)} {t("Quintal", "क्विंटल", "क्विंटल")})
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-wider text-[#1E1F1C]">{t("Direct Target Price", "वांछित दर प्रति किलो", "सीधा बेचे के भाव प्रति किलो")}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-[#1E1F1C]">₹</span>
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
                          className="w-full rounded-sm border-2 border-[#1E1F1C] pl-9 pr-16 py-2.5 text-lg font-black text-[#C04A22] tabular-nums bg-[#F7F7F6] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1E1F1C]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#52544D]">/ {t("kg", "किलो", "किलो")}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#1E1F1C] font-bold px-1 tabular-nums">
                        <span>
                          {t("Raipur Mandi Benchmark Rate: ₹", "रायपुर मंडी बेंचमार्क दर: ₹", "रायपुर मंडी बेंचमार्क दर: ₹")}
                          {meta.mandiPrice}/{t("kg", "किलो", "किलो")}
                        </span>
                        <span className="text-[#386641] font-black uppercase tracking-wider">
                          +{Math.round(((line.price_expectation - meta.mandiPrice) / meta.mandiPrice) * 100)}% {t("over mandi", "मंडी से ऊपर", "मंडी ले जादा")}
                        </span>
                      </div>

                      <div className="rounded-sm border-2 border-[#1E1F1C] bg-[#d7e8db] p-3 shadow-[2px_2px_0_0_#1E1F1C] text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-[#112816] uppercase tracking-wider">{t("Profit Projection", "मुनाफा अनुमान", "मुनाफा अनुमान")}</span>
                          <span className="font-black tabular-nums text-[#1E1F1C] bg-white border border-[#1E1F1C] px-2 py-0.5 rounded-sm shadow-[1px_1px_0_0_#1E1F1C]">
                            +₹{netAdvantage.toLocaleString("en-IN")} {t("Extra", "अतिरिक्त", "अतिरिक्त")}
                          </span>
                        </div>
                        <div className="mt-2 text-[#112816] font-bold border-t border-[#1E1F1C] pt-2 flex justify-between tabular-nums">
                          <span>{t("KisanSetu Direct Payout", "KisanSetu सीधा भुगतान", "KisanSetu सीधा भुगतान")}:</span>
                          <span className="font-black">₹{(line.quantity_kg * line.price_expectation).toLocaleString("en-IN")}</span>
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
              <div className="flex justify-between items-center pb-3 border-b-2 border-[#1E1F1C]">
                <label className="text-sm font-black uppercase tracking-wider text-[#1E1F1C]">{t("Farm Gate Address", "खेत या लोडिंग का पता", "खेत या लोडिंग के पता")}</label>
                <button
                  type="button"
                  onClick={handleGeolocate}
                  disabled={geocoding}
                  className="text-[10px] font-black uppercase text-[#1E1F1C] flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white border-2 border-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C] hover:bg-[#E2E4DE] transition-colors cursor-pointer"
                >
                  <LocateFixed className="h-3 w-3" />
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
                className="w-full rounded-sm border-2 border-[#1E1F1C] px-4 py-3 text-sm font-bold text-[#1E1F1C] bg-[#F7F7F6] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1E1F1C]"
                placeholder={t(
                  "Village, Block, District (e.g. Village Birgaon, Raipur)",
                  "गाँव, ब्लॉक, ज़िला (उदा: ग्राम बीरगांव, रायपुर)",
                  "गाँव, ब्लॉक, ज़िला (उदा: ग्राम बीरगांव, रायपुर)"
                )}
              />

              <div className="rounded-sm border-2 border-[#1E1F1C] overflow-hidden h-[260px] relative shadow-[inset_0_3px_6px_rgba(30,31,28,0.1)]">
                <LeafletMap
                  isPicker
                  center={location}
                  selectedLocation={location}
                  onLocationSelect={(loc: any) => setLocation({ ...loc, address: address || "Pinned Location" })}
                  height="h-full"
                />
              </div>

              <div className="p-3 bg-[#1B4965]/10 border-2 border-[#1B4965] rounded-sm flex items-start gap-2.5">
                <Truck className="h-5 w-5 text-[#1B4965] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#082130] font-bold">
                  {t(
                    "Our consolidated 1-truck loop will arrive at this location for direct farm-gate loading.",
                    "हमारा समेकित 1-ट्रक लूप सीधे खेत से लोडिंग के लिए इस स्थान पर पहुंचेगा।",
                    "हमार 1-ट्रक लूप सीधा खेत ले माल भरे खातिर ए पता म पहुंचही।"
                  )}
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="pb-3 border-b-2 border-[#1E1F1C]">
                <h3 className="text-sm font-black uppercase text-[#1E1F1C] tracking-wide">{t("AI-Vision Quality Inspector", "AI फसल गुणवत्ता जांच", "AI फसल गुणवत्ता जांच")}</h3>
                <p className="text-[11px] font-bold text-[#52544D] mt-1">{t("Upload a photo or short video of each selected crop for instant AI Grade A/B certification.", "त्वरित AI ग्रेड A/B प्रमाणन के लिए चुनी हुई हर फसल की फोटो या छोटा वीडियो अपलोड करें।", "तुरत AI ग्रेड A/B बर चुनी हुई हर फसल के फोटो या वीडियो डालव।")}</p>
              </div>

              {cropLines.map((line) => {
                const meta = getCropMeta(line.crop_type);
                const qc = qualityByCrop[line.crop_type];

                return (
                  <div key={line.crop_type} className="pt-2">
                    <div className="flex items-center justify-between mb-3 border-b border-[#E2E4DE] pb-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-[#1E1F1C]" />
                        <div className="text-sm font-display font-black text-[#1E1F1C]">
                          {meta.emoji} {meta.labelHi} ({meta.label})
                        </div>
                      </div>
                      {qc?.gradeResult?.grade ? (
                        <Badge variant="verified">
                          {t("Grade", "ग्रेड", "ग्रेड")} {qc.gradeResult.grade}
                        </Badge>
                      ) : null}
                    </div>

                    <div
                      className="relative overflow-hidden rounded-sm border-2 border-dashed border-[#1E1F1C] bg-[#F7F7F6] p-4 sm:p-6 text-center cursor-pointer hover:bg-[#EBECE8] transition-all group"
                      onClick={() => fileRefs.current[line.crop_type]?.click()}
                    >
                      {qc.previewUrl ? (
                        <div className="relative mx-auto rounded-sm border-2 border-[#1E1F1C] overflow-hidden shadow-[2px_2px_0_0_#1E1F1C]">
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
                            <div className="absolute inset-0 bg-[#1E1F1C]/40 backdrop-blur-[2px]">
                              <div className="animate-scan-line absolute left-0 right-0 h-1.5 bg-[#386641] shadow-[0_0_20px_4px_#386641] border-y border-[#EBECE8]" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-[#1E1F1C] text-white text-xs font-black uppercase tracking-wider border-2 border-[#EBECE8] px-4 py-2.5 rounded-sm shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-[#EBECE8] animate-spin" />
                                  {t("AI Vision Analyzing...", "AI विज़न जांच कर रहा है...", "AI विज़न जांचत हे...")}
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
                              className="absolute bottom-2 right-2 bg-white text-[10px] font-black uppercase text-[#1E1F1C] px-2.5 py-1 rounded-sm border-2 border-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C] hover:bg-[#EBECE8] transition-colors cursor-pointer"
                            >
                              {t("Change", "बदलें", "बदलव")}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 py-4 sm:py-6">
                          <div className="h-12 w-12 rounded-sm bg-white border-2 border-[#1E1F1C] flex items-center justify-center text-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C] group-hover:-translate-y-1 transition-transform">
                            <Camera className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-[#1E1F1C] uppercase tracking-wide">{t("Upload crop photo/video", "फसल की फोटो/वीडियो अपलोड करें", "फसल के फोटो/वीडियो डालव")}</p>
                            <p className="text-[10px] text-[#52544D] font-bold mt-1 uppercase">JPEG, PNG, MP4 • {t("Max 50MB", "अधिकतम 50MB", "ज्यादा से ज्यादा 50MB")}</p>
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
                      <div className="mt-4 rounded-sm bg-white border-2 border-[#1E1F1C] p-4 sm:p-5 space-y-4 shadow-[4px_4px_0_0_#1E1F1C]">
                        <div className="flex items-start justify-between pb-3 border-b-2 border-[#1E1F1C]">
                          <div className="flex items-start gap-2.5">
                            <div className="h-8 w-8 rounded-sm bg-[#1E1F1C] text-white flex items-center justify-center shrink-0">
                              <Award className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="text-[13px] font-black uppercase tracking-wide text-[#1E1F1C]">
                                {t("AI Certificate", "AI प्रमाण पत्र", "AI प्रमाण पत्र")}
                              </h4>
                              <p className="text-[10px] text-[#52544D] font-bold uppercase tabular-nums">
                                {t(
                                  "Confidence: " + ((qc.gradeResult.confidence || 0.98) * 100).toFixed(1) + "%",
                                  "सटीकता: " + ((qc.gradeResult.confidence || 0.98) * 100).toFixed(1) + "%",
                                  "सटीकता: " + ((qc.gradeResult.confidence || 0.98) * 100).toFixed(1) + "%"
                                )}
                              </p>
                            </div>
                          </div>
                          <Badge variant="verified">
                            {t("Grade", "ग्रेड", "ग्रेड")} {qc.gradeResult.grade}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[11px] font-black uppercase tracking-wide text-[#1E1F1C]">
                          <div className="bg-[#F7F7F6] p-2.5 rounded-sm border-2 border-[#1E1F1C] shadow-[1px_1px_0_0_#1E1F1C]">
                            <span className="block text-[9px] text-[#52544D] mb-0.5">{t("Crop Detected", "पहचानी गई फसल", "पहचानी गई फसल")}</span>
                            {qc.gradeResult.crop_detected || line.crop_type}
                          </div>
                          <div className="bg-[#d7e8db] p-2.5 rounded-sm border-2 border-[#1E1F1C] shadow-[1px_1px_0_0_#1E1F1C]">
                            <span className="block text-[9px] text-[#112816] mb-0.5">{t("Score", "स्कोर", "स्कोर")}</span>
                            {((qc.gradeResult.confidence || 0.98) * 100).toFixed(1)}%
                          </div>
                        </div>

                        {qc.gradeResult.defects?.length > 0 && (
                          <div className="pt-3 border-t-2 border-dashed border-[#1E1F1C] space-y-1.5">
                            <p className="text-[10px] font-black text-[#C04A22] uppercase tracking-wider">{t("Defects Found", "पाई गई खामियां", "पाई गई खामियां")}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {qc.gradeResult.defects.map((d: string, idx: number) => (
                                <span key={idx} className="text-[10px] font-bold text-[#1E1F1C] bg-[#fae8e0] border border-[#1E1F1C] px-2 py-0.5 rounded-sm">
                                  ✗ {d}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {qc.gradeResult.passed_items?.length > 0 && (
                          <div className="pt-2.5 space-y-1.5">
                            <p className="text-[10px] font-black text-[#386641] uppercase tracking-wider">{t("Good Items", "अच्छी आइटम", "अच्छी आइटम")}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {qc.gradeResult.passed_items.map((d: string, idx: number) => (
                                <span key={idx} className="text-[10px] font-bold text-[#1E1F1C] bg-[#d7e8db] border border-[#1E1F1C] px-2 py-0.5 rounded-sm">
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

          <div className="pt-6 border-t-2 border-[#1E1F1C] flex items-center justify-between gap-3 font-bold">
            <Button
              variant="outline"
              className="flex-1 max-w-[120px]"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> {t("Back", "पीछे", "पाछू")}
            </Button>
            <Button
              variant="farmer"
              className="flex-1 capitalize text-sm"
              onClick={next}
              disabled={!canNext}
              isLoading={submitting}
            >
              {step === 3
                ? t("Submit & Pool Harvest", "फसल दर्ज और पूल करें", "फसल जमा आ पूल करव")
                : t("Continue", "आगे बढ़ें", "आगे बढ़व")}
              {step < 3 && <ArrowRight className="h-4 w-4 ml-1.5" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
