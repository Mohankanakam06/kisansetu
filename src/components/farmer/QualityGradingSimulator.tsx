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
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <span className="text-caption font-bold uppercase tracking-widest">
              AI Vision Quality Agent
            </span>
          </div>
          <h2 className="text-headline-md text-on-surface mt-1">
            Produce Quality Grading Rubric
          </h2>
          <p className="text-caption text-on-surface-variant">
            Computer vision rubric scoring for firmness, defects, and color uniformity
          </p>
        </div>
        <Badge variant="success">Gemini Vision Live Rubric</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Photo Viewport */}
        <Card className="p-4 space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-inverse-surface border border-outline-variant">
            <img
              src={selectedPhoto}
              alt="Crop Sample"
              className="w-full h-full object-cover"
            />
            {isScanning && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <Eye className="w-6 h-6 text-on-surface absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="mt-3 text-caption font-mono text-white/80 tracking-wider">
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
            <span className="text-label-bold text-on-surface block">
              Try Sample Crops:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_CROPS.map((crop, idx) => (
                <button
                  key={idx}
                  onClick={() => handleScan(crop.url)}
                  disabled={isScanning}
                  className={`text-left p-2 rounded-lg border text-caption transition-all ${
                    selectedPhoto === crop.url
                      ? "border-primary bg-primary/10 text-on-surface ring-1 ring-primary"
                      : "border-outline-variant hover:border-outline bg-surface-container-lowest text-on-surface-variant"
                  }`}
                >
                  <p className="font-medium truncate">{crop.name.split(" ")[1]}</p>
                  <p className="text-[10px] text-on-surface-variant">Target Grade {crop.expectedGrade}</p>
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
            <Card className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-headline-md shadow-md">
                    {gradeResult.grade}
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">
                      Quality Grade {gradeResult.grade}
                    </h3>
                    <p className="text-caption text-on-surface-variant">
                      Confidence: {((gradeResult.confidence || 0.95) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <Badge variant="gradeA">VERIFIED PREMIUM</Badge>
              </div>

              <div className="space-y-2">
                <span className="text-caption font-bold text-on-surface uppercase tracking-wider block">
                  Detected Quality Parameters
                </span>
                <div className="space-y-1.5">
                  {gradeResult.defects?.map((defect, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-body-sm text-on-surface bg-surface-container-low p-2 rounded border border-outline-variant"
                    >
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      <span>{defect}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-secondary-container/40 rounded-lg p-3 border border-secondary-fixed/50 text-body-sm text-amber-800">
                <p className="font-medium flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Buyer Quality Guarantee:
                </p>
                <p className="text-on-surface-variant leading-relaxed">
                  {gradeResult.rubric_notes}
                </p>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center border-dashed border-outline-variant bg-surface-container-low">
              <Camera className="w-10 h-10 text-on-surface-variant mx-auto mb-2" />
              <h4 className="font-semibold text-on-surface text-body-md">Ready for Analysis</h4>
              <p className="text-caption text-on-surface-variant mt-1 max-w-xs mx-auto">
                Click "Re-Scan Current Photo" or choose a sample produce above to run the vision rubric agent.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
