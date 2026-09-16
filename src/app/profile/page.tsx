"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language";
import { User, Phone, MapPin, Shield, LogOut, ArrowRightLeft, Sprout, Store, CheckCircle } from "lucide-react";
import { Button, Badge } from "@/components/ui";

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
    window.location.href = "/login";
  };

  const handleSwitchRole = (newRole: "farmer" | "buyer") => {
    if (!user) return;
    const updatedUser = { ...user, role: newRole };
    localStorage.setItem("kisansetu_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    if (newRole === "farmer") {
      router.push("/farmer");
    } else {
      router.push("/buyer");
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E1F1C]"></div>
      </div>
    );
  }

  const isFarmer = user.role === "farmer";

  return (
    <div className="min-h-screen bg-[#F4F5F0] py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="bg-white border-2 border-[#1E1F1C] rounded-sm p-6 shadow-[4px_4px_0_0_#1E1F1C]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#EBECE8]">
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 rounded-sm border-2 border-[#1E1F1C] flex items-center justify-center text-2xl shadow-[2px_2px_0_0_#1E1F1C] ${isFarmer ? "bg-[#fae8e0] text-[#C04A22]" : "bg-[#d9e9f2] text-[#1B4965]"}`}>
                {isFarmer ? "🌾" : "🏪"}
              </div>
              <div>
                <h1 className="font-display text-2xl font-black text-[#1E1F1C]">{user.name || "User"}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={isFarmer ? "farmer" : "buyer"}>
                    {isFarmer ? t("Farmer Account", "किसान खाता", "किसान खाता") : t("Buyer / Trader Account", "व्यापारी खाता", "व्यापारी खाता")}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-300">
                    <CheckCircle className="h-3 w-3" /> {t("Verified", "सत्यापित", "सत्यापित")}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={handleLogout}
              className="text-[#C04A22] border-[#C04A22] hover:bg-[#fae8e0] w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              {t("Sign Out", "लॉग आउट करें", "लॉग आउट करव")}
            </Button>
          </div>

          {/* Account Details */}
          <div className="py-6 space-y-4 border-b-2 border-[#EBECE8]">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#52544D]">
              {t("Account Information", "खाता विवरण", "खाता जानकारी")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[#EBECE8] border border-[#1E1F1C] rounded-sm flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#52544D]" />
                <div>
                  <p className="text-[10px] font-bold text-[#52544D] uppercase">{t("Phone Number", "फ़ोन नंबर", "फ़ोन नंबर")}</p>
                  <p className="text-sm font-black text-[#1E1F1C]">{user.phone || "+91 98765 43210"}</p>
                </div>
              </div>

              <div className="p-3 bg-[#EBECE8] border border-[#1E1F1C] rounded-sm flex items-center gap-3">
                <Shield className="h-4 w-4 text-[#52544D]" />
                <div>
                  <p className="text-[10px] font-bold text-[#52544D] uppercase">{t("Account Security", "सुरक्षा स्तर", "सुरक्षा")}</p>
                  <p className="text-sm font-black text-[#1E1F1C]">{t("Escrow Protected", "एस्क्रो संरक्षित", "एस्क्रो सुरक्षित")}</p>
                </div>
              </div>

              {user.location && (
                <div className="p-3 bg-[#EBECE8] border border-[#1E1F1C] rounded-sm flex items-center gap-3 sm:col-span-2">
                  <MapPin className="h-4 w-4 text-[#52544D]" />
                  <div>
                    <p className="text-[10px] font-bold text-[#52544D] uppercase">{t("Farm Gate / Warehouse Address", "पता", "पता")}</p>
                    <p className="text-sm font-bold text-[#1E1F1C]">{user.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Role Switching for Demo & Fast Testing */}
          <div className="pt-6 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#52544D]">
              {t("Switch Mode / Role", "मोड बदलें (परीक्षण)", "मोड बदलव")}
            </h2>
            <p className="text-xs text-[#52544D]">
              {t(
                "You can toggle between Farmer (Sell Produce) and Buyer (Marketplace) views seamlessly.",
                "आप फसल बेचने वाले किसान और व्यापारी मोड के बीच आसानी से बदल सकते हैं।",
                "फसल बेचेया किसान आ व्यापारी मोड म बदल सकत हव।"
              )}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleSwitchRole("farmer")}
                className={`p-3 rounded-sm border-2 font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                  isFarmer
                    ? "bg-[#fae8e0] border-[#C04A22] text-[#C04A22] shadow-[2px_2px_0_0_#C04A22]"
                    : "bg-white border-[#1E1F1C] text-[#1E1F1C] hover:bg-[#EBECE8]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sprout className="h-4 w-4" />
                  <span className="text-xs">{t("Farmer Mode", "किसान मोड", "किसान मोड")}</span>
                </div>
                {isFarmer && <CheckCircle className="h-4 w-4" />}
              </button>

              <button
                onClick={() => handleSwitchRole("buyer")}
                className={`p-3 rounded-sm border-2 font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                  !isFarmer
                    ? "bg-[#d9e9f2] border-[#1B4965] text-[#1B4965] shadow-[2px_2px_0_0_#1B4965]"
                    : "bg-white border-[#1E1F1C] text-[#1E1F1C] hover:bg-[#EBECE8]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  <span className="text-xs">{t("Buyer Mode", "व्यापारी मोड", "व्यापारी मोड")}</span>
                </div>
                {!isFarmer && <CheckCircle className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
