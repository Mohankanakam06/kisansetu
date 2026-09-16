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
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                {t("AI Quality Inspection", "AI गुणवत्ता निरीक्षण", "AI गुणवत्ता जांच")}
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                {lot.crop_type} {t("Lot", "लॉट", "लॉट")} #{lot.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scanning Animation */}
        {scanning && (
          <div className="p-6 bg-slate-900 text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ScanLine className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">{t("Multimodal Vision Analysis", "बहु-मोडल दृष्टि विश्लेषण", "AI आंख ले जांच")}</p>
                <p className="text-xs text-emerald-400 font-medium mt-0.5">
                  {t("Scanning produce samples...", "उपज के नमूने स्कैन हो रहे हैं...", "फसल स्कैन होत हे...")}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-100 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 font-mono text-right tabular-nums font-bold">{progress}%</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!scanning && (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Overall Grade Badge */}
            <div className="flex items-center justify-between rounded-xl bg-emerald-50/80 border border-emerald-200 p-4 shadow-2xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  {t("AI Certified Grade", "AI प्रमाणित ग्रेड", "AI प्रमाणित ग्रेड")}
                </p>
                <p className="mt-0.5 font-display text-2xl font-extrabold text-emerald-950">
                  {t("Grade", "ग्रेड", "ग्रेड")} {lot.grade}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-emerald-800 uppercase">
                  {t("Confidence", "विश्वास", "भरोसा")}
                </p>
                <p className="text-xl font-extrabold text-emerald-950 tabular-nums">
                  {data.overallConfidence}%
                </p>
                <p className="text-[11px] font-medium text-emerald-700">
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
                <div key={section.key} className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <SectionIcon className="h-4 w-4 text-slate-700" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800">{section.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="p-4 space-y-3 border-t border-slate-200 animate-in fade-in duration-100">
                      {section.key === "overview" && (
                        <div className="space-y-3">
                          {[
                            { label: t("Color Vibrancy", "रंग चमक", "रंग चमक"), value: data.colorVibrancy },
                            { label: t("Size Uniformity", "आकार एकरूपता", "आकार एकसमान"), value: data.sizeUniformity },
                            { label: t("Ripeness Score", "पकने का स्कोर", "पकने का स्कोर"), value: data.ripenessScore },
                          ].map((metric) => (
                            <div key={metric.label} className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-slate-700">{metric.label}</span>
                                <span className="text-slate-900 tabular-nums font-bold">{metric.value}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-600 rounded-full"
                                  style={{ width: `${metric.value}%` }}
                                />
                              </div>
                            </div>
                          ))}
                          <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 p-3 mt-2">
                            <span className="text-xs font-semibold text-slate-700">
                              {t("Moisture Level", "नमी का स्तर", "पानी के मात्रा")}
                            </span>
                            <span className="text-xs font-bold text-blue-900">{data.moistureLevel}</span>
                          </div>
                        </div>
                      )}
                      {section.key === "grades" && (
                        <div className="space-y-2.5">
                          {data.gradeBreakdown.map((g) => (
                            <div key={g.grade} className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <div className="flex items-center gap-2">
                                  <span className={`h-2.5 w-2.5 rounded-full ${getGradeColor(g.grade)}`} />
                                  <span className="text-slate-800">
                                    {t("Grade", "ग्रेड", "ग्रेड")} {g.grade}
                                  </span>
                                </div>
                                <span className="font-bold text-slate-900 tabular-nums">{g.pct}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getGradeColor(g.grade)} rounded-full`}
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
                              className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 p-2.5"
                            >
                              <div className="flex items-center gap-2">
                                {d.pct === 0 ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                                )}
                                <span className="text-xs font-medium text-slate-800">{d.type}</span>
                              </div>
                              <span className="text-xs font-bold text-slate-900 tabular-nums">
                                {d.pct}%
                              </span>
                            </div>
                          ))}
                          <p className="text-[11px] font-medium text-slate-500 text-center pt-2">
                            {t(
                              "Inspected by KisanSetu AI Vision Engine",
                              "KisanSetu AI विज़न इंजन द्वारा निरीक्षित",
                              "KisanSetu AI विज़न इंजन ले जांच करे गेहे"
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
            <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-3.5 flex items-start gap-3 shadow-2xs">
              <Sparkles className="h-5 w-5 text-blue-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                  {t("AI Recommendation", "AI सिफारिश", "AI सलाह")}
                </p>
                <p className="text-[11px] font-medium text-blue-900/90 mt-1 leading-relaxed">
                  {lot.grade === "A"
                    ? t(
                        "Premium lot meets standard quality requirements. Color uniformity high, zero critical defects. Recommended for bulk purchase.",
                        "प्रीमियम लॉट मानक गुणवत्ता आवश्यकताओं को पूरा करता है। उच्च रंग एकरूपता, शून्य गंभीर दोष। थोक खरीद के लिए उपयुक्त।",
                        "प्रीमियम लॉट मानक अनुसार हे। बढ़िया रंग, कोनो खराबी नइ। थोक बिसाव बर अच्छा हे।"
                      )
                    : t(
                        "Standard quality lot suitable for domestic wholesale. Minor cosmetic variations within acceptable limits.",
                        "घरेलू थोक के लिए मानक गुणवत्ता। छोटी-मोटी सौंदर्य भिन्नताएं स्वीकार्य सीमा के भीतर।",
                        "घरेलू थोक बर ठीक लॉट हे। छोटी-मोटी भिन्नता हे जे चलहि।"
                      )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 sticky bottom-0">
          <Button variant="buyer" className="w-full h-11 font-bold shadow-xs" onClick={onClose}>
            {t("Close Inspection Report", "निरीक्षण रिपोर्ट बंद करें", "जांच रिपोर्ट बंद करव")}
          </Button>
        </div>
      </div>
    </div>
  );
}
