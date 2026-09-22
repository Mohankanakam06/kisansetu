"use client";
import React, { useState, useRef, useEffect } from "react";
import { CropType, GeoLocation, CreateListingRequest } from "@/types";
import { apiService } from "@/services/api";
import { Button, Card, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/language";
import { LiveCameraCapture } from "@/components/farmer/LiveCameraCapture";
import { PhygitalStatusCard } from "@/components/farmer/PhygitalStatusCard";
import {
  MapPin,
  Camera,
  Wheat,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Mic,
  MicOff,
  ChevronDown,
  Send,
  Loader2,
  Volume2,
  ShieldCheck,
  RefreshCw,
  Trash2,
} from "lucide-react";

export default function FarmerListingForm() {
  const { t, language } = useLanguage();
  const [formStep, setFormStep] = useState(0); // 0: form, 1: processing, 2: result
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [listing, setListing] = useState({
    cropType: "Tomato" as CropType,
    quantity: 100,
    price: 22,
    name: "Rameshwar Sahu",
    phone: "+91 98765 43210",
    location: "Village Birgaon, Raipur",
  });
  const [result, setResult] = useState<any>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [captureToken, setCaptureToken] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const recognitionRef = useRef<any>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const CROPS: { value: CropType; label: string; emoji: string; price: number }[] = [
    { value: "Tomato", label: t("Tomato (टमाटर)", "टमाटर (Tomato)", "पाताल (Tomato)"), emoji: "🍅", price: 22 },
    { value: "Onion", label: t("Onion (प्याज)", "प्याज (Onion)", "गोंदली (Onion)"), emoji: "🧅", price: 28 },
    { value: "Potato", label: t("Potato (आलू)", "आलू (Potato)", "आलू (Potato)"), emoji: "🥔", price: 18 },
    { value: "Wheat", label: t("Wheat (गेहूं)", "गेहूं (Wheat)", "गेहूं (Wheat)"), emoji: "🌾", price: 24 },
    { value: "Rice", label: t("Rice (चावल)", "धान/चावल (Rice)", "धान/चाउर (Rice)"), emoji: "🍚", price: 32 },
    { value: "Soybean", label: t("Soybean (सोयाबीन)", "सोयाबीन (Soybean)", "सोयाबीन (Soybean)"), emoji: "🫘", price: 42 },
    { value: "Chilli", label: t("Chilli (मिर्च)", "हरी मिर्च (Chilli)", "मिरचा (Chilli)"), emoji: "🌶️", price: 65 },
  ];

  // Initialize Web Speech API for native transcription
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        const langMap: Record<string, string> = {
          hi: "hi-IN",
          mr: "mr-IN",
          en: "en-IN",
          cg: "hi-IN",
          gu: "gu-IN",
          te: "te-IN",
        };
        recognition.lang = langMap[language] || "hi-IN";

        recognition.onstart = () => {
          setIsRecording(true);
          setSpeechError(null);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setTranscriptText(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsRecording(false);
          if (event.error !== "no-speech") {
            setSpeechError(event.error);
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [language]);

  const handleMicToggle = async () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecording(false);

      if (transcriptText.trim()) {
        setIsTranscribing(true);
        try {
          const parsed = await apiService.parseFarmerTranscript(transcriptText, language || "hi");
          if (parsed && parsed.success) {
            const matchedCrop = CROPS.find(
              (c) => c.value.toLowerCase() === parsed.crop_type?.toLowerCase()
            )?.value || "Tomato";

            setListing((prev) => ({
              ...prev,
              cropType: matchedCrop as CropType,
              quantity: parsed.quantity_kg || prev.quantity,
              price: parsed.price_expectation || prev.price,
            }));
          }
        } catch (err) {
          console.error("Transcript parsing error:", err);
        } finally {
          setIsTranscribing(false);
        }
      }
    } else {
      setTranscriptText("");
      setSpeechError(null);
      if (recognitionRef.current) {
        try {
          const langMap: Record<string, string> = {
            hi: "hi-IN",
            mr: "mr-IN",
            en: "en-IN",
            cg: "hi-IN",
            gu: "gu-IN",
            te: "te-IN",
          };
          recognitionRef.current.lang = langMap[language] || "hi-IN";
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (e) {
          console.warn("Could not start SpeechRecognition:", e);
          simulateVoiceInput();
        }
      } else {
        simulateVoiceInput();
      }
    }
  };

  const simulateVoiceInput = () => {
    setIsRecording(true);
    setTimeout(async () => {
      setIsRecording(false);
      setIsTranscribing(true);
      const sample = "मेरे पास 200 किलो टमाटर है, 25 रुपये किलो में बेचना है।";
      setTranscriptText(sample);
      const parsed = await apiService.parseFarmerTranscript(sample, language || "hi");
      setIsTranscribing(false);
      if (parsed) {
        setListing((prev) => ({
          ...prev,
          cropType: (parsed.crop_type as CropType) || "Tomato",
          quantity: parsed.quantity_kg || 200,
          price: parsed.price_expectation || 25,
        }));
      }
    }, 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep(1);

    const reqData: CreateListingRequest = {
      crop_type: listing.cropType,
      quantity_kg: listing.quantity,
      price_expectation: listing.price,
      farmer_name: listing.name,
      farmer_phone: listing.phone,
      location: {
        lat: 21.28 + Math.random() * 0.05,
        lng: 81.65 + Math.random() * 0.05,
        district: "Raipur",
        address: listing.location,
      },
      language: language || "hi",
      photo_url: photoPreview || undefined,
      capture_token: captureToken || undefined,
    };

    const res = await apiService.createFarmerListing(reqData);
    setResult(res);
    setFormStep(2);
  };

  if (formStep === 2 && result) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900">
            {t("Listing Submitted!", "फसल दर्ज हो गई!", "फसल दर्ज हो गेहे!")}
          </h2>
          <p className="text-sm text-slate-600">
            {t(
              "Your produce has been aggregated into a larger lot pool.",
              "आपकी उपज को बड़े क्लस्टर लॉट में शामिल कर लिया गया है।",
              "आप मन के फसल ला बड़े लॉट म जोड़ दे गेहे।"
            )}
          </p>
        </div>

        <Card className="relative overflow-hidden">
          <div className="relative space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  {t("Live Lot Aggregation Status", "लाइव लॉट एकत्रीकरण स्थिति", "लाइव लॉट स्थिति")}
                </span>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {result.quantity_kg}kg {result.crop_type} {t("Added", "जोड़ा गया", "जोड़ देहे")}
                </p>
              </div>
              <Badge variant="success">{t("Active", "सक्रिय", "सक्रिय")}</Badge>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  {t("Assigned to Lot", "आवंटित लॉट संख्या", "मिले लॉट नंबर")}
                </span>
                <span className="font-semibold text-slate-900 font-mono">
                  #{result.assigned_lot_id}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  {t("Expected Rate", "अपेक्षित दर", "भाव")}
                </span>
                <span className="font-bold text-emerald-700">₹{result.price_expectation}/kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  {t("Total Value", "कुल मूल्य", "कुल पइसा")}
                </span>
                <span className="font-bold text-slate-900">
                  ₹{(result.price_expectation * result.quantity_kg).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="h-px bg-slate-200"></div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-600">
                  {t("Aggregation Status", "एकत्रीकरण स्थिति", "स्थिति")}
                </span>
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></div>
                  {result.cluster_status}
                </div>
              </div>
            </div>

            {/* Phygital Two-Stage Workflow & Escrow Card */}
            <PhygitalStatusCard
              listingId={result.listing_id || "list-demo-01"}
              stage="pregrade"
              escrowPickupReleased={false}
              escrowFinalReleased={false}
              preGrade="A"
            />
          </div>
        </Card>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <strong>{t("AI Dispatch Note:", "AI डिस्पैच सूचना:", "AI डिस्पैच सूचना:")}</strong>{" "}
              {t(
                "Consolidated single-truck pickup route is scheduled once pool hits threshold capacity.",
                "पूल लक्ष्य तक पहुँचने के बाद 1-ट्रक पिकअप रूट स्वतः निर्धारित हो जाएगा।",
                "पूल पूरा होय के बाद 1-ट्रक पिकअप रूट अपने आप तय हो जाही।"
              )}
            </div>
          </div>
        </div>

        <Button onClick={() => setFormStep(0)} variant="outline" className="w-full">
          {t("Create Another Listing", "एक और फसल दर्ज करें", "एक अउ फसल दर्ज करव")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-emerald-700">
          <MicOff className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">
            {t("Direct Farm Gate Listing", "खेत-खलिहान से सीधी बिक्री", "खेत ले सीधा बिक्री")}
          </span>
        </div>
        <h2 className="text-2xl font-black font-display text-slate-900">
          {t("List Your Produce", "अपनी उपज दर्ज करें", "अपन फसल दर्ज करव")}
        </h2>
        <p className="text-sm text-slate-600">
          {t(
            "Enter produce details to get pooled at wholesale rates.",
            "थोक दरों पर एकत्रीकरण के लिए विवरण दर्ज करें।",
            "थोक भाव म बेचे बर फसल बिबरन भरव।"
          )}
        </p>
      </div>

      <Card className="relative overflow-hidden bg-emerald-50/50 border-emerald-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest">
                {t("Voice Auto-Fill", "आवाज़ से भरें", "आवाज ले भरव")}
              </h3>
              <p className="text-xs text-emerald-700 font-medium mt-1">
                {t("Speak your crop, quantity & price.", "अपनी फसल, मात्रा और भाव बोलें।", "अपन फसल, मात्रा अउ भाव गोठियाव।")}
              </p>
            </div>
            <button
              type="button"
              onClick={handleMicToggle}
              className={`flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 shadow-sm transition-all ${
                isRecording
                  ? "bg-red-500 text-white border-red-600 animate-pulse ring-4 ring-red-200"
                  : "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
              }`}
            >
              {isRecording ? <Volume2 className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          </div>

          {(isRecording || isTranscribing || transcriptText) && (
            <div className="bg-white rounded-xl border border-emerald-200 p-3 shadow-xs">
              {isRecording ? (
                <div className="flex flex-col items-center justify-center h-16 w-full opacity-80">
                  <canvas ref={canvasRef} width={200} height={40} className="w-full max-w-[200px]" />
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest animate-pulse mt-2">
                    {t("Listening...", "सुन रहा है...", "सुनत हे...")}
                  </p>
                </div>
              ) : isTranscribing ? (
                <div className="flex flex-col items-center justify-center h-16 gap-2">
                  <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                    {t("Parsing intent via AI...", "AI द्वारा विश्लेषण...", "AI विश्लेषण करत हे...")}
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-600 font-medium italic">"{transcriptText}"</p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5">
                      {t("Auto-filled below", "नीचे फॉर्म भर दिया गया है", "नीचे फॉर्म म भर देहे")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="relative space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              {t("What are you selling?", "आप क्या बेचना चाहते हैं?", "का फसल बेचना हे?")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Wheat className="h-5 w-5 text-slate-400" />
              </div>
              <select
                value={listing.cropType}
                onChange={(e) => {
                  const crop = CROPS.find((c) => c.value === e.target.value);
                  if (crop) setListing({ ...listing, cropType: crop.value, price: crop.price });
                }}
                className="appearance-none w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-xs hover:border-slate-300"
              >
                {CROPS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {t("Quantity (kg)", "मात्रा (किग्रा)", "मात्रा (किलो)")}
              </label>
              <input
                type="number"
                value={listing.quantity}
                onChange={(e) => setListing({ ...listing, quantity: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs transition-all"
                min={10}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {t("Expected Rate (₹/kg)", "अपेक्षित दर (₹/किग्रा)", "अपेक्षित भाव (₹/किलो)")}
              </label>
              <input
                type="number"
                value={listing.price}
                onChange={(e) => setListing({ ...listing, price: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs transition-all"
                min={1}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              {t("Pickup Location (Village / Block)", "पिकअप स्थान (गाँव / ब्लॉक)", "पिकअप स्थान (गांव / ब्लॉक)")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={listing.location}
                onChange={(e) => setListing({ ...listing, location: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              {t("Farmer Details", "किसान का विवरण", "किसान के बिबरन")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={listing.name}
                  onChange={(e) => setListing({ ...listing, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs transition-all"
                  placeholder={t("Name", "नाम", "नाव")}
                  required
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="tel"
                  value={listing.phone}
                  onChange={(e) => setListing({ ...listing, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs transition-all"
                  placeholder={t("Phone", "फ़ोन", "फ़ोन")}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Anti-Fraud In-App Live Camera Capture Section */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                {t("Crop Photo (Live AI Grading)", "फसल फोटो (लाइव AI ग्रेडिंग)", "फसल फोटो (लाइव AI ग्रेडिंग)")}
              </label>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              <span>{t("Anti-Spoofing Active", "एंटी-स्पूफिंग सक्रिय", "एंटी-धोखाधड़ी चालू")}</span>
            </div>
          </div>

          {isCameraOpen ? (
            <div className="mt-2">
              <LiveCameraCapture
                onCapture={(dataUrl, token) => {
                  setPhotoPreview(dataUrl);
                  setCaptureToken(token);
                  setIsCameraOpen(false);
                }}
                onCancel={() => setIsCameraOpen(false)}
              />
            </div>
          ) : photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-emerald-300 shadow-sm">
              <img
                src={photoPreview}
                alt="Captured Crop"
                className="w-full h-44 object-cover"
              />
              <div className="absolute top-2 left-2 bg-emerald-700/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur-xs">
                <ShieldCheck className="w-3 h-3 text-emerald-200" />
                {t("Live In-App Capture Verified", "लाइव इन-ऐप कैप्चर सत्यापित", "लाइव फोटो सत्यापित")}
              </div>
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md backdrop-blur-xs border border-white/20 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t("Retake", "दोबारा लें", "फेर लेव")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setCaptureToken(null);
                  }}
                  className="p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md backdrop-blur-xs transition cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsCameraOpen(true)}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-emerald-50/70 group"
            >
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                {t("Open Live In-App Camera", "लाइव कैमरा खोलें", "लाइव कैमरा खोलव")}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                {t(
                  "Gallery uploads disabled. 3-frame live burst verifies produce authenticity & freshness.",
                  "गैलरी से अपलोड अक्षम है। 3-फ़्रेम लाइव बर्स्ट से फसल की प्रामाणिकता जांची जाती है।",
                  "गैलरी बंद हे। 3-फ्रेम लाइव फोटो लेव।"
                )}
              </p>
            </div>
          )}
        </div>
      </Card>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="bg-white rounded-xl p-2 shadow-2xs border border-emerald-100">
            <span className="text-2xl">{CROPS.find((c) => c.value === listing.cropType)?.emoji}</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {t("Estimated Total Payout", "कुल अनुमानित भुगतान", "कुल पक्का पइसा")}
            </p>
            <p className="text-2xl font-black text-emerald-950 font-mono mt-0.5">
              ₹{(listing.quantity * listing.price).toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-emerald-700 font-semibold mt-0.5">
              {listing.quantity}kg × ₹{listing.price}/kg ({t("Direct Farm Rate", "सीधी खेत दर", "खेत के सीधा भाव")})
            </p>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full rounded-xl h-12 shadow-sm"
        isLoading={formStep === 1}
      >
        <Send className="w-4 h-4 mr-2" />
        {formStep === 1
          ? t("Processing with AI Aggregator...", "AI एग्रीगेटर के साथ प्रसंस्करण...", "AI एग्रीगेटर ले जोड़त हे...")
          : t("Submit Listing to Marketplace", "मंडी में फसल दर्ज करें", "मंडी म फसल दर्ज करव")}
      </Button>
    </form>
  );
}
