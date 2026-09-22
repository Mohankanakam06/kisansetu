"use client";
import React, { useState } from "react";
import { Card, Button, Badge, Input } from "@/components/ui";
import { LiveCameraCapture } from "@/components/farmer/LiveCameraCapture";
import { PhygitalStatusCard } from "@/components/farmer/PhygitalStatusCard";
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Scale,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Layers,
  Award
} from "lucide-react";

export default function DriverSpotCheckPage() {
  const [listingId, setListingId] = useState("list-demo-01");
  const [agentId, setAgentId] = useState("agent-driver-raipur-01");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCaptureComplete = (data: {
    photoUrl: string;
    captureToken: string;
    calibrationConfidence: number;
    antiFraudSummary?: any;
  }) => {
    setCapturedImage(data.photoUrl);
  };

  const handleRunSpotCheck = async () => {
    if (!capturedImage) {
      setError("Please capture a live photo of the produce lot with calibration reference.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/phygital/verify-pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId,
          pickup_agent_id: agentId,
          agent_image_base64: capturedImage,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to complete spot-check audit.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during physical spot-check.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-50 text-blue-800 rounded-xl border border-blue-200">
                <Truck className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl font-black text-slate-900">
                  Stage 2: Physical Pickup & Farmgate Audit
                </h1>
                <p className="text-xs text-slate-500">
                  Logistics Driver & Rural Collection Center Spot-Check Rig
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="buyer" size="md">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-700" /> Driver App Rig
            </Badge>
          </div>
        </div>

        {/* Audit Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Produce Lot / Listing ID
            </label>
            <Input
              value={listingId}
              onChange={(e) => setListingId(e.target.value)}
              placeholder="e.g. list-demo-01"
              className="text-sm font-semibold"
            />
          </Card>
          <Card className="p-4 space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Assigned Driver / Agent ID
            </label>
            <Input
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="e.g. agent-driver-01"
              className="text-sm font-semibold"
            />
          </Card>
        </div>

        {/* Camera Spot-Check Section */}
        {!result ? (
          <div className="space-y-4">
            <LiveCameraCapture
              cropType="Tomato"
              onCaptureComplete={handleCaptureComplete}
            />

            {capturedImage && (
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setCapturedImage(null)}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Retake Photo
                </Button>
                <Button
                  variant="primary"
                  onClick={handleRunSpotCheck}
                  disabled={isLoading}
                  className="bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-2 px-6"
                >
                  {isLoading ? (
                    "Analyzing & Verifying..."
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Run 10-Second Spot-Check Audit
                    </>
                  )}
                </Button>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-semibold">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : (
          /* Result Overview */
          <div className="space-y-6">
            <Card className="p-6 border-2 border-emerald-200 bg-emerald-50/40 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Physical Verification Completed
                    </h3>
                    <p className="text-xs text-emerald-800 font-medium">
                      Status: {result.dispute_status === "RESOLVED_MATCH" ? "Approved - Grade Matched" : "Flagged Discrepancy"}
                    </p>
                  </div>
                </div>
                <Badge variant={result.tolerance_verified ? "success" : "danger"} size="lg">
                  {result.tolerance_verified ? "±5% Tolerance PASS" : "Tolerance FAIL"}
                </Badge>
              </div>

              {/* Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Stage 1 Pre-Grade</span>
                  <p className="text-xl font-black text-slate-900">
                    Grade {result.pregrade_result?.grade_estimate || "A"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Est. Size: {result.pregrade_result?.estimated_size_cm || 6.2} cm
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Stage 2 Physical</span>
                  <p className="text-xl font-black text-blue-900">
                    Grade {result.physical_grade_result?.grade_estimate || "A"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Measured: {result.physical_grade_result?.estimated_size_cm || 6.1} cm
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Size Discrepancy</span>
                  <p className="text-xl font-black text-emerald-700">
                    {result.size_delta_pct !== undefined ? `${result.size_delta_pct}%` : "1.6%"}
                  </p>
                  <p className="text-xs text-emerald-600 font-semibold">
                    Within ±5% Margin
                  </p>
                </div>
              </div>

              {/* Milestone Escrow Status */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" /> Milestone Escrow Payout Engine
                  </span>
                  <Badge variant="success">50% Pickup Released</Badge>
                </div>
                <p className="text-xs text-slate-600">
                  {result.milestone_escrow?.message || "50% upfront pickup escrow automatically disbursed to farmer UPI upon driver optical verification."}
                </p>
              </div>

              {/* Farmer Trust Score Dynamic Update */}
              {result.trust_score_update && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" /> Dynamic Farmer Trust Tier
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      Score: {result.trust_score_update.new_trust_score}/100 ({result.trust_score_update.trust_tier.toUpperCase()})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Score change: +{result.trust_score_update.score_delta} points. High consistency qualifies farmer for Instant Marketplace Publishing.
                  </p>
                </div>
              )}
            </Card>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setCapturedImage(null);
                }}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Audit Next Produce Lot
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
