"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { apiService } from "@/services/api";
import { QualityGradeResponse } from "@/types";
import { Button, Card, Badge } from "@/components/ui";
import { useLanguage } from "@/lib/language";
import { compressImageFile } from "@/lib/imageCompression";
import {
  Sparkles,
  Camera,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Eye,
  UploadCloud,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function QualityGradingSimulator() {
  const { t } = useLanguage();

  const SAMPLE_CROPS = [
    {
      name: t("Grade A Tomatoes (Fresh Harvest)", "ग्रेड A टमाटर (ताजा फसल)", "ग्रेड A पाताल (ताजा फसल)"),
      labelShort: t("Tomatoes", "टमाटर", "पाताल"),
      cropType: "Tomato",
      url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
      expectedGrade: "A",
    },
    {
      name: t("Grade A Red Onions (Cured)", "ग्रेड A लाल प्याज (सूखा)", "ग्रेड A लाल गोंदली (सूखा)"),
      labelShort: t("Onions", "प्याज", "गोंदली"),
      cropType: "Onion",
      url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80",
      expectedGrade: "A",
    },
    {
      name: t("Grade B Potatoes (Minor Scuffing)", "ग्रेड B आलू (मामूली दाग)", "ग्रेड B आलू (मामूली दाग)"),
      labelShort: t("Potatoes", "आलू", "आलू"),
      cropType: "Potato",
      url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80",
      expectedGrade: "B",
    },
    {
      name: t("Anti-Fraud Test (Screen Recapture)", "धोखाधड़ी जांच (स्क्रीन फोटो)", "धोखाधड़ी जांच (स्क्रीन फोटो)"),
      labelShort: t("Fraud Test", "स्क्रीन फोटो", "धोखा टेस्ट"),
      cropType: "Tomato",
      url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80&screen=recapture-moire-test",
      expectedGrade: "REJECTED",
    },
  ];

  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_CROPS[0].url);
  const [selectedCropType, setSelectedCropType] = useState(SAMPLE_CROPS[0].cropType);
  const [isScanning, setIsScanning] = useState(false);
  const [gradeResult, setGradeResult] = useState<QualityGradeResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleScan = async (photoUrl: string, cropType: string = "Tomato") => {
    setIsScanning(true);
    setGradeResult(null);
    setSelectedPhoto(photoUrl);
    setSelectedCropType(cropType);

    try {
      const result = await apiService.gradeProducePhoto("demo-lot", photoUrl, cropType);
      setGradeResult(result);
    } catch (e) {
      console.error("Grading failed:", e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.type.startsWith("image")) {
        const compressed = await compressImageFile(file, 1280, 0.82);
        handleScan(compressed.dataUrl, selectedCropType);
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          handleScan(dataUrl, selectedCropType);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Image upload compression failed:", err);
    }
  };

  const isRejected = gradeResult?.grade === "REJECTED" || gradeResult?.is_produce === false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-700">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">
              {t("AI Vision Quality Agent (Ticket 1.1)", "AI विज़न गुणवत्ता एजेंट (टिकट 1.1)", "AI विज़न गुणवत्ता एजेंट")}
            </span>
          </div>
          <h2 className="text-2xl font-black font-display text-slate-900 mt-1">
            {t("Produce Quality Grading Rubric", "फसल गुणवत्ता ग्रेडिंग रूब्रिक", "फसल गुणवत्ता जांच")}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {t(
              "Computer vision rubric scoring for firmness, defects, color uniformity, and anti-fraud screen detection",
              "मजबूती, दोषों, रंग एकरूपता और स्क्रीन धोखाधड़ी पहचान के लिए कंप्यूटर विज़न स्कोरिंग",
              "मजबूती, दाग-धब्बा आ स्क्रीन फोटो धोखाधड़ी जांच"
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">OpenCV + Gemini Live</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Photo Viewport */}
        <Card className="p-4 space-y-4">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner">
            <img
              src={selectedPhoto}
              alt="Crop Sample"
              className="w-full h-full object-cover"
            />
            {isScanning && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                  <Eye className="w-6 h-6 text-white absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="mt-3 text-xs font-mono text-emerald-200 tracking-wider">
                  {t("SCANNING PRODUCE TEXTURE & BLEMISHES...", "फसल बनावट और दाग-धब्बों की स्कैनिंग जारी...", "फसल के बनावट आ दाग-धब्बा जांचत हे...")}
                </p>
              </div>
            )}
            <div className="absolute top-2 left-2">
              <span className="bg-slate-950/70 backdrop-blur-md text-[10px] font-mono text-white px-2 py-0.5 rounded border border-white/20">
                CAM_RESOLUTION: 1080P • AI_RUBRIC_V2
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                {t("Try Sample Benchmarks:", "नमूना फसलें देखें:", "नमूना फसल देखव:")}
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_CROPS.map((crop, idx) => (
                <button
                  key={idx}
                  onClick={() => handleScan(crop.url, crop.cropType)}
                  disabled={isScanning}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    selectedPhoto === crop.url
                      ? crop.expectedGrade === "REJECTED"
                        ? "border-rose-600 bg-rose-50 text-rose-950 ring-1 ring-rose-600 font-bold"
                        : "border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600 font-bold"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600"
                  }`}
                >
                  <p className="font-bold truncate">{crop.labelShort}</p>
                  <p
                    className={`text-[10px] font-mono ${
                      crop.expectedGrade === "REJECTED" ? "text-rose-600 font-bold" : "text-slate-500"
                    }`}
                  >
                    {crop.expectedGrade === "REJECTED" ? "Spoof Test" : `Target ${crop.expectedGrade}`}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => handleScan(selectedPhoto, selectedCropType)}
            variant="primary"
            className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white"
            isLoading={isScanning}
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            {isScanning ? t("Analyzing Produce...", "फसल का विश्लेषण जारी...", "फसल के जांच जारी हे...") : t("Re-Scan Current Photo", "वर्तमान फोटो पुनः स्कैन करें", "फोटो फिर ले स्कैन करव")}
          </Button>
        </Card>

        {/* Grading Results */}
        <div className="space-y-4">
          {gradeResult ? (
            <Card
              className={`space-y-4 ${
                isRejected ? "border-rose-300 bg-rose-50/40" : "border-emerald-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl text-white flex items-center justify-center font-bold text-2xl shadow-sm ${
                      isRejected ? "bg-rose-600" : "bg-emerald-700"
                    }`}
                  >
                    {isRejected ? <ShieldAlert className="w-7 h-7" /> : gradeResult.grade}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {isRejected
                        ? t("Produce Rejected", "फसल अस्वीकृत", "फसल फेल")
                        : `${t("Quality Grade", "गुणवत्ता ग्रेड", "गुणवत्ता ग्रेड")} ${gradeResult.grade}`}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {t("Confidence:", "सटीकता:", "सटीकता:")} {((gradeResult.confidence || 0.95) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <Badge variant={isRejected ? "danger" : "success"}>
                  {isRejected ? t("ANTI-SPOOF FLAG", "धोखाधड़ी जांच", "धोखा फ्लैग") : t("VERIFIED PREMIUM", "सत्यापित प्रीमियम", "जांच प्रमाणित")}
                </Badge>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  {isRejected
                    ? t("Audit Defect Reasons", "दोष विवरण", "खराबी विवरण")
                    : t("Detected Quality Parameters", "पहचाने गए गुणवत्ता पैरामीटर", "गुणवत्ता पैरामीटर")}
                </span>
                <div className="space-y-1.5">
                  {gradeResult.defects?.map((defect, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-xs font-medium p-2.5 rounded-lg border ${
                        isRejected
                          ? "text-rose-900 bg-rose-100/60 border-rose-200"
                          : "text-slate-800 bg-slate-50 border-slate-200"
                      }`}
                    >
                      {isRejected ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span>{defect}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`rounded-xl p-3.5 border text-xs ${
                  isRejected
                    ? "bg-rose-100/70 border-rose-300 text-rose-950"
                    : "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                }`}
              >
                <p
                  className={`font-bold flex items-center gap-1.5 mb-1 ${
                    isRejected ? "text-rose-900" : "text-emerald-900"
                  }`}
                >
                  {isRejected ? (
                    <ShieldAlert className="w-4 h-4 text-rose-700" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  )}
                  {isRejected
                    ? t("Anti-Fraud Security Guarantee:", "सुरक्षा गारंटी:", "सुरक्षा गारंटी:")
                    : t("Buyer Quality Guarantee:", "खरीदार गुणवत्ता गारंटी:", "खरीदार गुणवत्ता गारंटी:")}
                </p>
                <p className="leading-relaxed">{gradeResult.rubric_notes}</p>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center border-dashed border-slate-200 bg-slate-50 rounded-2xl">
              <Camera className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">{t("Ready for Analysis", "विश्लेषण के लिए तैयार", "जांच बर तैयार")}</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {t("Click \"Re-Scan Current Photo\" or choose a sample produce above to run the vision rubric agent.", "विज़न रूब्रिक एजेंट चलाने के लिए ऊपर एक नमूना फसल चुनें या \"वर्तमान फोटो पुनः स्कैन करें\" पर क्लिक करें।", "विज़न जांच खातिर ऊपर कोई नमूना फसल चुनव या फोटो स्कैन करव।")}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
