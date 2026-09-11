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
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#1E1F1C]/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto border-2 border-[#1E1F1C] shadow-[6px_6px_0_0_#1E1F1C] animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[#1E1F1C] flex items-center justify-between sticky top-0 bg-[#EBECE8] z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#1E1F1C] text-white border-2 border-[#1E1F1C] shadow-[2px_2px_0_0_#1E1F1C]">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-black text-[#1E1F1C]">
                {t("AI Quality Inspection", "AI गुणवत्ता निरीक्षण", "AI गुणवत्ता जांच")}
              </h2>
              <p className="text-xs font-bold text-[#52544D]">
                {lot.crop_type} {t("Lot", "लॉट", "लॉट")} #{lot.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm border-2 border-[#1E1F1C] bg-white p-1 text-[#1E1F1C] hover:bg-[#EBECE8] shadow-[2px_2px_0_0_#1E1F1C] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scanning Animation */}
        {scanning && (
          <div className="p-5 bg-[#1E1F1C] text-white space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <ScanLine className="h-5 w-5 text-[#F4A261] animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-white">{t("Multimodal Vision Analysis", "बहु-मोडल दृष्टि विश्लेषण", "AI आंख ले जांच")}</p>
                <p className="text-[11px] text-[#F4A261] font-bold">
                  {t("Scanning produce samples...", "उपज के नमूने स्कैन हो रहे हैं...", "फसल स्कैन होत हे...")}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="h-2 bg-[#52544D] border border-white rounded-sm overflow-hidden">
                <div
                  className="h-full bg-[#386641] transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-[#EBECE8] font-mono text-right tabular-nums">{progress}%</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!scanning && (
          <div className="p-4 sm:p-5 space-y-3.5">
            {/* Overall Grade Badge */}
            <div className="flex items-center justify-between rounded-sm bg-[#d7e8db] border-2 border-[#1E1F1C] p-4 shadow-[2px_2px_0_0_#1E1F1C]">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#112816]">
                  {t("AI Certified Grade", "AI प्रमाणित ग्रेड", "AI प्रमाणित ग्रेड")}
                </p>
                <p className="mt-0.5 font-display text-2xl font-black text-[#112816]">
                  {t("Grade", "ग्रेड", "ग्रेड")} {lot.grade}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-[#112816] uppercase">
                  {t("Confidence", "विश्वास", "भरोसा")}
                </p>
                <p className="text-xl font-black text-[#112816] tabular-nums">
                  {data.overallConfidence}%
                </p>
                <p className="text-[10px] font-bold text-[#52544D]">
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
                <div key={section.key} className="rounded-sm border-2 border-[#1E1F1C] overflow-hidden bg-white shadow-[2px_2px_0_0_#1E1F1C]">
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full flex items-center justify-between p-3 bg-[#EBECE8] hover:bg-white transition-colors cursor-pointer border-b-2 border-transparent"
                  >
                    <div className="flex items-center gap-2">
                      <SectionIcon className="h-4 w-4 text-[#1E1F1C]" />
                      <span className="text-xs font-black uppercase text-[#1E1F1C]">{section.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-[#1E1F1C]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[#1E1F1C]" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="p-3.5 space-y-2.5 border-t-2 border-[#1E1F1C] animate-in fade-in duration-100">
                      {section.key === "overview" && (
                        <div className="space-y-2.5">
                          {[
                            { label: t("Color Vibrancy", "रंग चमक", "रंग चमक"), value: data.colorVibrancy },
                            { label: t("Size Uniformity", "आकार एकरूपता", "आकार एकसमान"), value: data.sizeUniformity },
                            { label: t("Ripeness Score", "पकने का स्कोर", "पकने का स्कोर"), value: data.ripenessScore },
                          ].map((metric) => (
                            <div key={metric.label} className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-[#1E1F1C]">{metric.label}</span>
                                <span className="text-[#1E1F1C] tabular-nums font-black">{metric.value}%</span>
                              </div>
                              <div className="h-2 bg-[#EBECE8] border border-[#1E1F1C] rounded-sm overflow-hidden">
                                <div
                                  className="h-full bg-[#386641]"
                                  style={{ width: `${metric.value}%` }}
                                />
                              </div>
                            </div>
                          ))}
                          <div className="flex items-center justify-between rounded-sm bg-[#EBECE8] border-2 border-[#1E1F1C] p-2.5 mt-2">
                            <span className="text-xs font-bold text-[#1E1F1C]">
                              {t("Moisture Level", "नमी का स्तर", "पानी के मात्रा")}
                            </span>
                            <span className="text-xs font-black text-[#1B4965]">{data.moistureLevel}</span>
                          </div>
                        </div>
                      )}
                      {section.key === "grades" && (
                        <div className="space-y-2">
                          {data.gradeBreakdown.map((g) => (
                            <div key={g.grade} className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <div className="flex items-center gap-1.5">
                                  <span className={`h-2.5 w-2.5 rounded-sm border border-[#1E1F1C] ${getGradeColor(g.grade)}`} />
                                  <span className="text-[#1E1F1C]">
                                    {t("Grade", "ग्रेड", "ग्रेड")} {g.grade}
                                  </span>
                                </div>
                                <span className="font-black text-[#1E1F1C] tabular-nums">{g.pct}%</span>
                              </div>
                              <div className="h-2 bg-[#EBECE8] border border-[#1E1F1C] rounded-sm overflow-hidden">
                                <div
                                  className={`h-full ${getGradeColor(g.grade)}`}
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
                              className="flex items-center justify-between rounded-sm bg-[#EBECE8] border-2 border-[#1E1F1C] p-2"
                            >
                              <div className="flex items-center gap-1.5">
                                {d.pct === 0 ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-[#386641] shrink-0" />
                                ) : (
                                  <AlertTriangle className="h-3.5 w-3.5 text-[#C04A22] shrink-0" />
                                )}
                                <span className="text-xs font-bold text-[#1E1F1C]">{d.type}</span>
                              </div>
                              <span className="text-xs font-black text-[#1E1F1C] tabular-nums">
                                {d.pct}%
                              </span>
                            </div>
                          ))}
                          <p className="text-[10px] font-bold text-[#52544D] text-center pt-1">
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
            <div className="rounded-sm bg-[#d9e9f2] border-2 border-[#1E1F1C] p-3 flex items-start gap-2.5 shadow-[2px_2px_0_0_#1E1F1C]">
              <Sparkles className="h-4 w-4 text-[#1B4965] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-black text-[#082130] uppercase">
                  {t("AI Recommendation", "AI सिफारिश", "AI सलाह")}
                </p>
                <p className="text-[11px] font-bold text-[#082130]/80 mt-0.5 leading-normal">
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
        <div className="p-4 sm:p-5 bg-[#EBECE8] border-t-2 border-[#1E1F1C] sticky bottom-0">
          <Button variant="buyer" className="w-full" onClick={onClose}>
            {t("Close Inspection Report", "निरीक्षण रिपोर्ट बंद करें", "जांच रिपोर्ट बंद करव")}
          </Button>
        </div>
      </div>
    </div>
  );
}
