"use client";
import React, { useState } from "react";
import { apiService } from "@/services/api";
import { QualityGradeResponse } from "@/types";
import { Button, Card, Badge } from "@/components/ui";
import {
  Sparkles,
  Camera,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Eye,
} from "lucide-react";

const SAMPLE_CROPS = [
  {
    name: "Grade A Tomatoes (Fresh Harvest)",
    url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
    expectedGrade: "A",
  },
  {
    name: "Grade A Red Onions (Cured)",
    url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80",
    expectedGrade: "A",
  },
  {
    name: "Grade B Potatoes (Minor Scuffing)",
    url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80",
    expectedGrade: "B",
  },
];

export default function QualityGradingSimulator() {
  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_CROPS[0].url);
  const [isScanning, setIsScanning] = useState(false);
  const [gradeResult, setGradeResult] = useState<QualityGradeResponse | null>(null);

  const handleScan = async (photoUrl: string) => {
    setIsScanning(true);
    setGradeResult(null);
    setSelectedPhoto(photoUrl);

    try {
      const result = await apiService.gradeProducePhoto("demo-lot", photoUrl);
      setGradeResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-700">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">
              AI Vision Quality Agent
            </span>
          </div>
          <h2 className="text-xl font-bold text-soil-900 mt-1">
            Produce Quality Grading Rubric
          </h2>
          <p className="text-xs text-soil-500">
            Computer vision rubric scoring for firmness, defects, and color uniformity
          </p>
        </div>
        <Badge variant="success">Gemini Vision Live Rubric</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Photo Viewport */}
        <Card className="p-4 space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-soil-900 border border-soil-200">
            <img
              src={selectedPhoto}
              alt="Crop Sample"
              className="w-full h-full object-cover"
            />
            {isScanning && (
              <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                  <Eye className="w-6 h-6 text-emerald-300 absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="mt-3 text-xs font-mono text-emerald-300 tracking-wider">
                  SCANNING PRODUCE TEXTURE & BLEMISHES...
                </p>
              </div>
            )}
            <div className="absolute top-2 left-2">
              <span className="bg-black/60 backdrop-blur-md text-[10px] font-mono text-white px-2 py-0.5 rounded border border-white/20">
                CAM_RESOLUTION: 1080P • AI_RUBRIC_V2
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-soil-700 block">
              Try Sample Crops:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_CROPS.map((crop, idx) => (
                <button
                  key={idx}
                  onClick={() => handleScan(crop.url)}
                  disabled={isScanning}
                  className={`text-left p-2 rounded-lg border text-xs transition-all ${
                    selectedPhoto === crop.url
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500"
                      : "border-soil-200 hover:border-soil-300 bg-white text-soil-700"
                  }`}
                >
                  <p className="font-medium truncate">{crop.name.split(" ")[1]}</p>
                  <p className="text-[10px] text-soil-400">Target Grade {crop.expectedGrade}</p>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => handleScan(selectedPhoto)}
            variant="primary"
            className="w-full"
            isLoading={isScanning}
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            {isScanning ? "Analyzing Produce..." : "Re-Scan Current Photo"}
          </Button>
        </Card>

        {/* Grading Results */}
        <div className="space-y-4">
          {gradeResult ? (
            <Card className="border-emerald-200 bg-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-soil-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                    {gradeResult.grade}
                  </div>
                  <div>
                    <h3 className="font-bold text-soil-900">
                      Quality Grade {gradeResult.grade}
                    </h3>
                    <p className="text-xs text-soil-500">
                      Confidence: {((gradeResult.confidence || 0.95) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <Badge variant="gradeA">VERIFIED PREMIUM</Badge>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-soil-700 uppercase tracking-wider block">
                  Detected Quality Parameters
                </span>
                <div className="space-y-1.5">
                  {gradeResult.defects?.map((defect, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-soil-700 bg-soil-50 p-2 rounded border border-soil-100"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{defect}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50/80 rounded-lg p-3 border border-emerald-100 text-xs text-emerald-800">
                <p className="font-medium flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Buyer Quality Guarantee:
                </p>
                <p className="text-emerald-700 leading-relaxed">
                  {gradeResult.rubric_notes}
                </p>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center border-dashed border-soil-300 bg-soil-50/50">
              <Camera className="w-10 h-10 text-soil-400 mx-auto mb-2" />
              <h4 className="font-semibold text-soil-700 text-sm">Ready for Analysis</h4>
              <p className="text-xs text-soil-500 mt-1 max-w-xs mx-auto">
                Click "Re-Scan Current Photo" or choose a sample produce above to run the vision rubric agent.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
