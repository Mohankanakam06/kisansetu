"use client";
import React, { useState, useEffect } from "react";
import { Lot } from "@/types";
import { Button } from "@/components/ui";
import { useLanguage } from "@/lib/language";
import {
  X,
  Cpu,
  Leaf,
  AlertTriangle,
  Eye,
  CheckCircle2,
  ScanLine,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";

interface QualityInspectionModalProps {
  lot: Lot;
  onClose: () => void;
}

// Simulated AI vision analysis data per crop type
const AI_INSPECTION_DATA: Record<
  string,
  {
    colorVibrancy: number;
    sizeUniformity: number;
    defectDetection: { type: string; pct: number }[];
    moistureLevel: string;
    ripenessScore: number;
    overallConfidence: number;
    samplesAnalyzed: number;
    gradeBreakdown: { grade: string; pct: number }[];
  }
> = {
  Tomato: {
    colorVibrancy: 94,
    sizeUniformity: 89,
    defectDetection: [
      { type: "No visible cracks", pct: 0 },
      { type: "Minor stem blemish (1 sample)", pct: 2.1 },
    ],
    moistureLevel: "Optimal (88%)",
    ripenessScore: 91,
    overallConfidence: 96.8,
    samplesAnalyzed: 847,
    gradeBreakdown: [
      { grade: "A", pct: 78 },
      { grade: "B", pct: 16 },
      { grade: "C", pct: 5 },
      { grade: "D", pct: 1 },
    ],
  },
  Onion: {
    colorVibrancy: 91,
    sizeUniformity: 85,
    defectDetection: [
      { type: "Dry outer peel (normal)", pct: 0 },
      { type: "Minor sprout traces (3 samples)", pct: 3.4 },
    ],
    moistureLevel: "Optimal (92%)",
    ripenessScore: 95,
    overallConfidence: 94.2,
    samplesAnalyzed: 623,
    gradeBreakdown: [
      { grade: "A", pct: 72 },
      { grade: "B", pct: 20 },
      { grade: "C", pct: 7 },
      { grade: "D", pct: 1 },
    ],
  },
  Wheat: {
    colorVibrancy: 88,
    sizeUniformity: 93,
    defectDetection: [
      { type: "No foreign matter detected", pct: 0 },
      { type: "Minor chaff residue", pct: 1.2 },
    ],
    moistureLevel: "Low (11%)",
    ripenessScore: 97,
    overallConfidence: 97.5,
    samplesAnalyzed: 1204,
    gradeBreakdown: [
      { grade: "A", pct: 82 },
      { grade: "B", pct: 14 },
      { grade: "C", pct: 3 },
      { grade: "D", pct: 1 },
    ],
  },
  Potato: {
    colorVibrancy: 86,
    sizeUniformity: 91,
    defectDetection: [
      { type: "No sprouting or greening", pct: 0 },
      { type: "Minor skin scuff (5 samples)", pct: 1.8 },
    ],
    moistureLevel: "Optimal (79%)",
    ripenessScore: 94,
    overallConfidence: 95.1,
    samplesAnalyzed: 932,
    gradeBreakdown: [
      { grade: "A", pct: 76 },
      { grade: "B", pct: 18 },
      { grade: "C", pct: 5 },
      { grade: "D", pct: 1 },
    ],
  },
};

const defaultInspection = {
  colorVibrancy: 89,
  sizeUniformity: 87,
  defectDetection: [
    { type: "Standard visual scan passed", pct: 0 },
    { type: "Minor surface marks", pct: 2.5 },
  ],
  moistureLevel: "Optimal (85%)",
  ripenessScore: 90,
  overallConfidence: 93.4,
  samplesAnalyzed: 512,
  gradeBreakdown: [
    { grade: "A", pct: 70 },
    { grade: "B", pct: 22 },
    { grade: "C", pct: 7 },
    { grade: "D", pct: 1 },
  ],
};

export default function QualityInspectionModal({ lot, onClose }: QualityInspectionModalProps) {
  const { t } = useLanguage();
  const [scanning, setScanning] = useState(true);
  const [progress, setProgress] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>("overview");

  const data = AI_INSPECTION_DATA[lot.crop_type] || defaultInspection;

  // Simulate scanning animation
  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setScanning(false);
          return 100;
        }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [scanning]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "bg-emerald-500";
      case "B": return "bg-amber-500";
      case "C": return "bg-orange-500";
      case "D": return "bg-red-500";
      default: return "bg-slate-300";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-700";
    if (score >= 75) return "text-amber-700";
    return "text-red-600";
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold text-slate-950">
                {t("AI Quality Inspection", "AI गुणवत्ता निरीक्षण", "AI गुणवत्ता जांच")}
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                {lot.crop_type} {t("Lot", "लॉट", "लॉट")} #{lot.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanning Animation */}
        {scanning && (
          <div className="p-6 bg-slate-900 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ScanLine className="h-6 w-6 text-emerald-400 animate-pulse" />
                <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div>
                <p className="text-sm font-bold">{t("Multimodal Vision Analysis", "बहु-मोडल दृष्टि विश्लेषण", "AI आंख ले जांच")}</p>
                <p className="text-[11px] text-emerald-300/80 font-medium">
                  {t("Scanning produce samples...", "उपज के नमूने स्कैन हो रहे हैं...", "फसल स्कैन होत हे...")}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 font-mono text-right">{progress}%</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!scanning && (
          <div className="p-5 sm:p-6 space-y-4">
            {/* Overall Grade Badge */}
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                  {t("AI Certified Grade", "AI प्रमाणित ग्रेड", "AI प्रमाणित ग्रेड")}
                </p>
                <p className="mt-1 font-display text-3xl font-black text-emerald-900">
                  {t("Grade", "ग्रेड", "ग्रेड")} {lot.grade}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-emerald-600 uppercase">
                  {t("Confidence", "विश्वास", "भरोसा")}
                </p>
                <p className={`text-2xl font-black ${getScoreColor(data.overallConfidence)}`}>
                  {data.overallConfidence}%
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {data.samplesAnalyzed} {t("samples", "नमूने", "नमूना")}
                </p>
              </div>
            </div>

            {/* Vision Scores Accordion */}
            {[
              {
                key: "overview",
                icon: Eye,
                title: t("Vision Metrics", "दृष्टि मापदंड", "AI देखाव"),
              },
              {
                key: "grades",
                icon: Leaf,
                title: t("Grade Distribution", "ग्रेड वितरण", "ग्रेड बंटवारा"),
              },
              {
                key: "defects",
                icon: AlertTriangle,
                title: t("Defect Analysis", "दोष विश्लेषण", "खराबी जांच"),
              },
            ].map((section) => {
              const isExpanded = expandedSection === section.key;
              const SectionIcon = section.icon;
              return (
                <div key={section.key} className="rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <SectionIcon className="h-4 w-4 text-emerald-700" />
                      <span className="text-sm font-bold text-slate-900">{section.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="p-4 space-y-3 animate-in fade-in duration-150">
                      {section.key === "overview" && (
                        <div className="space-y-3">
                          {[
                            { label: t("Color Vibrancy", "रंग चमक", "रंग चमक"), value: data.colorVibrancy },
                            { label: t("Size Uniformity", "आकार एकरूपता", "आकार एकसमान"), value: data.sizeUniformity },
                            { label: t("Ripeness Score", "पकने का स्कोर", "पकने का स्कोर"), value: data.ripenessScore },
                          ].map((metric) => (
                            <div key={metric.label} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-600 font-semibold">{metric.label}</span>
                                <span className={`font-bold ${getScoreColor(metric.value)}`}>{metric.value}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    metric.value >= 90 ? "bg-emerald-500" : metric.value >= 75 ? "bg-amber-500" : "bg-red-500"
                                  }`}
                                  style={{ width: `${metric.value}%` }}
                                />
                              </div>
                            </div>
                          ))}
                          <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-100 p-3 mt-2">
                            <span className="text-xs font-semibold text-slate-600">
                              {t("Moisture Level", "नमी का स्तर", "पानी के मात्रा")}
                            </span>
                            <span className="text-xs font-bold text-emerald-700">{data.moistureLevel}</span>
                          </div>
                        </div>
                      )}
                      {section.key === "grades" && (
                        <div className="space-y-3">
                          {data.gradeBreakdown.map((g) => (
                            <div key={g.grade} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className={`h-3 w-3 rounded ${getGradeColor(g.grade)}`} />
                                  <span className="text-slate-700 font-bold">
                                    {t("Grade", "ग्रेड", "ग्रेड")} {g.grade}
                                  </span>
                                </div>
                                <span className="font-bold text-slate-900">{g.pct}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${getGradeColor(g.grade)}`}
                                  style={{ width: `${g.pct}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {section.key === "defects" && (
                        <div className="space-y-2">
                          {data.defectDetection.map((d, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-100 p-3"
                            >
                              <div className="flex items-center gap-2">
                                {d.pct === 0 ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                                )}
                                <span className="text-xs font-semibold text-slate-700">{d.type}</span>
                              </div>
                              <span className={`text-xs font-bold ${d.pct === 0 ? "text-emerald-700" : "text-amber-700"}`}>
                                {d.pct}%
                              </span>
                            </div>
                          ))}
                          <p className="text-[11px] text-slate-400 text-center pt-2">
                            {t(
                              "Inspected by KisanSetu Gemini Vision Model v2.1",
                              "KisanSetu Gemini विज़न मॉडल v2.1 द्वारा निरीक्षित",
                              "KisanSetu AI विज़न मॉडल v2.1 ले जांच करे गेहे"
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* AI Insight Footer */}
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  {t("AI Recommendation", "AI सिफारिश", "AI सलाह")}
                </p>
                <p className="text-[11px] text-emerald-800/80 mt-1 leading-relaxed">
                  {lot.grade === "A"
                    ? t(
                        "Premium lot meets export-grade standards. High color uniformity and zero critical defects detected. Recommended for immediate bulk purchase.",
                        "प्रीमियम लॉट निर्यात-ग्रेड मानकों को पूरा करता है। उच्च रंग एकरूपता और शून्य गंभीर दोष। तत्काल थोक खरीद के लिए अनुशंसित।",
                        "प्रीमियम लॉट निर्यात ग्रेड अनुसार हे। बढ़िया रंग आ कोनो खराबी नइ। तुरंत बिसाव बर अच्छा हे।"
                      )
                    : t(
                        "Good quality lot suitable for domestic wholesale. Minor cosmetic variations within acceptable thresholds. Cost-effective option.",
                        "घरेलू थोक के लिए अच्छी गुणवत्ता। छोटी-मोटी सौंदर्य भिन्नताएं स्वीकार्य सीमा के भीतर। किफायती विकल्प।",
                        "देशी थोक बर अच्छा लॉट हे। छोटी-मोटी भिन्नता हे जे सही हे। सस्ता आ बढ़िया।"
                      )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-5 sm:p-6 bg-white border-t border-slate-100 sticky bottom-0 rounded-b-3xl">
          <Button variant="primary" className="w-full rounded-xl" onClick={onClose}>
            {t("Close Inspection Report", "निरीक्षण रिपोर्ट बंद करें", "जांच रिपोर्ट बंद करव")}
          </Button>
        </div>
      </div>
    </div>
  );
}
