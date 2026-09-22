"use client";
import React from "react";
import { Badge, Card } from "@/components/ui";
import { CheckCircle, AlertTriangle, ShieldCheck, Truck, Clock } from "lucide-react";

interface PhygitalStatusCardProps {
  listingId: string;
  stage: "pregrade" | "physical_verified" | "disputed";
  escrowPickupReleased: boolean;
  escrowFinalReleased: boolean;
  preGrade: string;
  physicalGrade?: string;
}

export function PhygitalStatusCard({
  listingId,
  stage,
  escrowPickupReleased,
  escrowFinalReleased,
  preGrade,
  physicalGrade,
}: PhygitalStatusCardProps) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Phygital Progress</h3>
        <Badge variant={stage === "physical_verified" ? "success" : stage === "disputed" ? "danger" : "warning"}>
          {stage === "pregrade" ? "Pre-Grade Estimate" : stage === "physical_verified" ? "Verified" : "Disputed"}
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-1">
          <p className="text-xs text-slate-500 font-medium">Stage 1: Farmgate Pre-Grade</p>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-900">Grade {preGrade}</span>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-xs text-slate-500 font-medium">Stage 2: Physical Pickup</p>
          <div className="flex items-center gap-2">
            {stage === "physical_verified" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : stage === "disputed" ? (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            ) : (
              <Clock className="w-4 h-4 text-slate-400" />
            )}
            <span className="font-bold text-slate-900">
              {physicalGrade ? `Grade ${physicalGrade}` : "Pending Verification"}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-700">
            <Truck className="w-4 h-4 text-slate-400"/>
            <span>Escrow Tranches:</span>
        </div>
        <div className="flex gap-2">
            <Badge variant={escrowPickupReleased ? "success" : "neutral"}>50% Pickup</Badge>
            <Badge variant={escrowFinalReleased ? "success" : "neutral"}>50% Delivery</Badge>
        </div>
      </div>
    </Card>
  );
}
