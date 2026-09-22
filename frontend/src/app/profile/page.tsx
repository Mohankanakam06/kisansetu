"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { User, Phone, MapPin, Shield, LogOut, Sprout, Store, CheckCircle, ArrowRight, LayoutDashboard, Wallet, TrendingUp } from "lucide-react";
import { Button, Badge, Card, cn } from "@/components/ui";

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kisansetu_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        router.push("/login");
      }
    } catch (e) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("kisansetu_token");
    localStorage.removeItem("kisansetu_user");
    document.cookie = "kisansetu_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="flex bg-white shadow-2xs border border-slate-200 rounded-xl px-5 py-4 items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-700"></div>
          <span className="text-sm font-bold text-slate-700">Loading Profile...</span>
        </div>
      </div>
    );
  }

  const isFarmer = user.role === "farmer";

  return (
    <div className="flex-1 bg-[#F8FAFC] py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="p-6 sm:p-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-5">
              <div
                className="h-16 w-16 rounded-xl flex items-center justify-center text-3xl shadow-xs border bg-emerald-50 text-emerald-800 border-emerald-200"
              >
                🌾
              </div>
              <div>
                <h1 className="font-display text-2xl font-extrabold text-slate-900">{user.name || "KisanSetu User"}</h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge variant="farmer">
                    {user.phone ? `+91 ${user.phone}` : t("Verified User", "सत्यापित उपयोगकर्ता", "सत्यापित यूजर")}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 uppercase tracking-wide">
                    <CheckCircle className="h-3 w-3" /> {t("Verified KYC", "सत्यापित KYC", "सत्यापित KYC")}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200 w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              {t("Sign Out", "लॉग आउट करें", "लॉग आउट करव")}
            </Button>
          </div>

          {/* Details */}
          <div className="pb-8 border-b border-slate-100 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("Account Information", "खाता विवरण", "खाता जानकारी")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3.5 shadow-2xs">
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-500">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{t("Phone Number", "फ़ोन नंबर", "फ़ोन नंबर")}</p>
                  <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">{user.phone || "+91 98765 43210"}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3.5 shadow-2xs">
                <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-emerald-700">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{t("Protection Level", "सुरक्षा स्तर", "सुरक्षा")}</p>
                  <p className="text-sm font-bold text-emerald-900 mt-0.5">{t("NPCI Protected Settlement", "NPCI सुरक्षित भुगतान", "NPCI सुरक्षित पइसा")}</p>
                </div>
              </div>

              {((user.location && typeof user.location === "string") || (user.location && typeof user.location === "object" && user.location.address)) ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3.5 sm:col-span-2 shadow-2xs">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-500 shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{t("Primary Address", "मुख्य पता", "मुख्य पता")}</p>
                    <p className="text-sm font-medium text-slate-900 mt-0.5 leading-relaxed">
                      {typeof user.location === "string" ? user.location : user.location.address}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              {t("Quick Services", "त्वरित सेवाएं", "जल्दी काम")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/farmer"
                className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-between transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                    <Sprout className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">{t("Sell Produce", "फसल दर्ज करें", "फसल बेचंव")}</span>
                    <span className="text-[10px] text-slate-500">List crops & AI grading</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/buyer"
                className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-between transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                    <Store className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">{t("Wholesale Marketplace", "थोक बाजार", "थोक बाजार")}</span>
                    <span className="text-[10px] text-slate-500">Discover aggregated lots</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/orders"
                className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-between transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                    <LayoutDashboard className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">{t("Track Orders & Logistics", "ऑर्डर और लॉजिस्टिक्स", "ऑर्डर आ गाड़ी")}</span>
                    <span className="text-[10px] text-slate-500">Real-time status & escrow</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/earnings"
                className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-between transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-800">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">{t("Earnings & Settlements", "कमाई और भुगतान", "कमाई आ पइसा")}</span>
                    <span className="text-[10px] text-slate-500">Instant UPI disbursements</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

