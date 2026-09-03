"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Sprout,
  Tractor,
  ShoppingCart,
  Mic,
  MapPin,
  Camera,
  Wallet,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui";

type Role = "farmer" | "buyer";
type Step = "role" | "details" | "done";

export default function OnboardingPage() {
  const [role, setRole] = useState<Role>("farmer");
  const [step, setStep] = useState<Step>("role");
  const [village, setVillage] = useState("");
  const [crop, setCrop] = useState("");
  const [upi, setUpi] = useState("");

  const farmerSteps = [
    { icon: Mic, title: "List your produce", desc: "Speak or fill a simple form. No agent needed." },
    { icon: MapPin, title: "Get aggregated", desc: "We cluster your lot with nearby farms for bulk buyers." },
    { icon: Camera, title: "AI quality grading", desc: "Snap a photo — get an A/B/C grade instantly." },
    { icon: Wallet, title: "Get paid on pickup", desc: "40% at pickup, 60% at delivery — straight to your UPI." },
  ];

  const buyerSteps = [
    { icon: MapPin, title: "Browse farm-direct lots", desc: "See aggregated clusters with live farm pricing." },
    { icon: Camera, title: "Trust the AI grade", desc: "Every lot is photo-graded by vision AI." },
    { icon: Wallet, title: "Pay farmers directly", desc: "Stage-wise settlement, no middleman margins." },
    { icon: ShoppingCart, title: "Track from gate to hub", desc: "One optimized route consolidates all pickups." },
  ];

  const currentSteps = role === "farmer" ? farmerSteps : buyerSteps;

  return (
    <div className="flex-1 bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2 text-caption font-semibold text-on-surface-variant">
          <span className={step !== "role" ? "text-primary" : ""}>Role</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className={step === "details" ? "text-primary" : ""}>Details</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className={step === "done" ? "text-primary" : ""}>Done</span>
        </div>

        {step === "role" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/25">
                <Sprout className="h-7 w-7" />
              </div>
              <h1 className="mt-4 text-headline-md text-on-surface">
                Welcome to KisanSetu
              </h1>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                How will you use the marketplace?
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    key: "farmer" as Role,
                    label: "I'm a farmer",
                    desc: "List produce, get AI-graded, receive direct farm-gate payments.",
                    icon: Tractor,
                  },
                  {
                    key: "buyer" as Role,
                    label: "I'm a buyer",
                    desc: "Buy farm-direct aggregated lots at better rates with reliable quality.",
                    icon: ShoppingCart,
                  },
                ]
              ).map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={`group rounded-xl border-2 bg-surface-container-lowest p-5 text-left transition ${
                    role === r.key
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-outline-variant hover:border-primary"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg transition group-hover:bg-primary group-hover:text-on-primary ${
                      role === r.key ? "bg-primary text-on-primary" : "bg-primary/10 text-primary"
                    }`}
                  >
                    <r.icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-3 font-semibold text-on-surface">{r.label}</h2>
                  <p className="mt-1 text-body-sm text-on-surface-variant">{r.desc}</p>
                </button>
              ))}
            </div>

            <Button variant="primary" className="w-full" onClick={() => setStep("details")}>
              Continue as {role === "farmer" ? "Farmer" : "Buyer"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === "details" && (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <h1 className="text-headline-md text-on-surface">
                {role === "farmer" ? "Where do you farm?" : "Where do you source from?"}
              </h1>
              <p className="mt-1 text-body-sm text-on-surface-variant">Help us serve you better. You can edit this anytime.</p>
            </div>

            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card space-y-4">
              <div>
                <label htmlFor="village" className="block text-body-sm font-semibold text-on-surface">
                  {role === "farmer" ? "Village / farm location" : "Primary market area"}
                </label>
                <input
                  id="village"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Village Birgaon, Raipur"
                  className="mt-1.5 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {role === "farmer" ? (
                <>
                  <div>
                    <label htmlFor="crop" className="block text-body-sm font-semibold text-on-surface">
                      Main crop you grow
                    </label>
                    <select
                      id="crop"
                      value={crop}
                      onChange={(e) => setCrop(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {["", "Tomato", "Onion", "Potato", "Wheat", "Rice", "Soybean", "Chilli"].map((c) => (
                        <option key={c} value={c}>
                          {c || "Select a crop…"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="upi" className="block text-body-sm font-semibold text-on-surface">
                      UPI ID for payouts
                    </label>
                    <input
                      id="upi"
                      value={upi}
                      onChange={(e) => setUpi(e.target.value)}
                      placeholder="yourname@okaxis"
                      className="mt-1.5 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="mt-1 text-caption text-on-surface-variant">
                      Settlement agent pushes payouts here on pickup & delivery.
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <label htmlFor="biz" className="block text-body-sm font-semibold text-on-surface">
                    Business or organization name
                  </label>
                  <input
                    id="biz"
                    placeholder="e.g. Raipur Mandi Traders"
                    className="mt-1.5 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
            </div>

            <Button variant="primary" className="w-full" onClick={() => setStep("done")}>
              Finish setup
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep("role")}>
              ← Back
            </Button>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h1 className="mt-4 text-headline-md text-on-surface">
                You&apos;re all set!
              </h1>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                Here&apos;s what you can do as a {role === "farmer" ? "farmer" : "buyer"} today.
              </p>
            </div>

            <ol className="space-y-3">
              {currentSteps.map((s) => (
                <li key={s.title} className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-card">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-body-sm font-semibold text-on-surface">{s.title}</h3>
                    <p className="text-caption text-on-surface-variant">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Link
              href={role === "farmer" ? "/farmer" : "/buyer"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-body-sm font-semibold text-on-primary shadow-lg shadow-primary/20 transition hover:bg-primary"
            >
              {role === "farmer" ? "List my first produce" : "Browse marketplace"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}