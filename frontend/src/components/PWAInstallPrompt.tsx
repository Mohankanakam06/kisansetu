"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Download,
  X,
  Share2,
  PlusSquare,
  Smartphone,
  Zap,
  BellRing,
  Sparkles,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/lib/language";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PWAInstallPrompt() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [installedSuccessfully, setInstalledSuccessfully] = useState(false);

  // Custom manual trigger listener
  useEffect(() => {
    const handleManualOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener("open-pwa-install", handleManualOpen);
    return () => window.removeEventListener("open-pwa-install", handleManualOpen);
  }, []);

  useEffect(() => {
    // 1. Standalone / installed check
    const checkStandalone = () => {
      const isWindowStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(isWindowStandalone);
      return isWindowStandalone;
    };

    if (checkStandalone()) return;

    // 2. iOS Safari detection
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !/crios|fxios|opios/.test(ua);
    setIsIOS(isIOSDevice);

    // 3. Dismissal Check
    try {
      const dismissedTime = localStorage.getItem("kisansetu_pwa_dismissed");
      const installedFlag = localStorage.getItem("kisansetu_pwa_installed");
      if (installedFlag === "true") {
        setIsStandalone(true);
        return;
      }
      if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 5 * 24 * 60 * 60 * 1000) {
        // Show as minimized floating badge if dismissed recently
        setIsMinimized(true);
        setIsOpen(false);
      } else {
        // Delay showing banner slightly for better UX
        const timer = setTimeout(() => {
          if (pathname === "/") setIsOpen(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsOpen(true);
    }

    // 4. Chrome / Android / Edge install prompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Auto-open the popup when prompt drops, ONLY if on the homepage and not recently dismissed
      const dismissedTime = localStorage.getItem("kisansetu_pwa_dismissed");
      const isRecentlyDismissed = dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 5 * 24 * 60 * 60 * 1000;

      if (pathname === "/" && !isRecentlyDismissed) {
        setIsMinimized(false);
        setIsOpen(true);
      }
    };

    const handleAppInstalled = () => {
      setInstalledSuccessfully(true);
      setIsStandalone(true);
      setIsOpen(false);
      setIsMinimized(false);
      try {
        localStorage.setItem("kisansetu_pwa_installed", "true");
      } catch {}
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        // Already showing iOS step-by-step drawer
        return;
      }
      return;
    }
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === "accepted") {
        setInstalledSuccessfully(true);
        setIsOpen(false);
        try {
          localStorage.setItem("kisansetu_pwa_installed", "true");
        } catch {}
      }
    } catch (err) {
      console.warn("PWA install error:", err);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    setIsMinimized(true);
    try {
      localStorage.setItem("kisansetu_pwa_dismissed", Date.now().toString());
    } catch {}
  };

  if (isStandalone || installedSuccessfully) {
    return null;
  }

  // Only show auto-popup and minimized badge on the homepage
  // Other pages can still trigger the prompt via the "open-pwa-install" custom event
  const isHomePage = pathname === "/";

  // If minimized, only show floating badge on homepage
  if (isMinimized && !isOpen) {
    if (!isHomePage) return null;
    return (
      <button
        type="button"
        onClick={() => {
          setIsMinimized(false);
          setIsOpen(true);
        }}
        aria-label={t("Open App Install Guide", "ऐप इंस्टॉल गाइड खोलें", "ऐप इंस्टॉल गाइड खोलव")}
        className="fixed bottom-20 left-4 z-[140] flex items-center gap-2 rounded-full bg-slate-900/90 text-white px-3.5 py-2 text-xs font-bold shadow-xl backdrop-blur-md border border-slate-700/60 hover:bg-emerald-800 transition-all hover:scale-105 active:scale-95"
      >
        <Smartphone className="w-4 h-4 text-emerald-400" />
        <span>{t("Install App", "ऐप इंस्टॉल करें", "ऐप डालव")}</span>
        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
      </button>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] pointer-events-none flex flex-col justify-end sm:justify-start sm:items-end p-0 sm:p-6 animate-in fade-in duration-200">
      {/* Mobile Backdrop blur overlay (transparent touch to dismiss) */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs pointer-events-auto sm:hidden"
        onClick={handleDismiss}
      />

      {/* Main Drawer / Modal Card */}
      <aside
        aria-label={t("Install KisanSetu Mobile App", "KisanSetu मोबाइल ऐप इंस्टॉल करें", "KisanSetu मोबाइल ऐप डालव")}
        className="pointer-events-auto relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden transition-all duration-300 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-5"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-850 via-emerald-800 to-teal-800 text-white p-4 sm:p-5 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner shrink-0">
                🌾
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg text-white font-display tracking-tight">
                    KisanSetu Direct PWA
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400/20 border border-emerald-300/30 text-emerald-200">
                    v2.4
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  {t(
                    "High-Speed Mobile App for Mandi Rates & Instant Payouts",
                    "मंडी भाव और त्वरित भुगतान के लिए हाई-स्पीड मोबाइल ऐप",
                    "मंडी भाव अउ झटपट पइसा बर तेज मोबाइल ऐप"
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              aria-label="Dismiss app install banner"
              className="p-1.5 rounded-full bg-black/20 text-white/80 hover:text-white hover:bg-black/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Value Highlights */}
        <div className="p-4 sm:p-5 space-y-3.5">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50/70 border border-emerald-150 rounded-xl p-2.5 text-center">
              <Zap className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-900">
                {t("Zero Lag", "सुपर फास्ट", "सुपर फास्ट")}
              </div>
              <div className="text-[9px] text-slate-500">
                {t("Works Offline", "ऑफ़लाइन मोड", "ऑफलाइन काम")}
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-150 rounded-xl p-2.5 text-center">
              <BellRing className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-900">
                {t("Live Alerts", "रेट अलर्ट", "रेट अलर्ट")}
              </div>
              <div className="text-[9px] text-slate-500">
                {t("Direct SMS & Push", "सीधे फोन पर", "सीधे फोन म")}
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-150 rounded-xl p-2.5 text-center">
              <Sparkles className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-900">
                {t("AI Cam Scan", "AI कैमरा", "AI कैमरा")}
              </div>
              <div className="text-[9px] text-slate-500">
                {t("Instant Grading", "सटीक ग्रेडिंग", "सटीक ग्रेडिंग")}
              </div>
            </div>
          </div>

          {/* iOS Safari Guided Workflow */}
          {isIOS ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5 text-xs text-slate-700">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <span>
                  {t(
                    "Install on iPhone / iPad (Safari):",
                    "iPhone / iPad (Safari) पर कैसे लगाएं:",
                    "iPhone / iPad (Safari) म कइसे लगाय:"
                  )}
                </span>
              </div>
              <ol className="space-y-2 text-[11px] text-slate-600 pl-1">
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-150 text-emerald-800 font-bold text-[10px]">
                    1
                  </span>
                  <span>
                    {t("Tap the", "नीचे", "नीचे")}{" "}
                    <strong className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-slate-200 rounded text-slate-900">
                      <Share2 className="w-3 h-3 inline" /> {t("Share", "शेयर", "शेयर")}
                    </strong>{" "}
                    {t("icon in Safari's bottom toolbar.", "बटन पर टैप करें।", "बटन म दबावा।")}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-150 text-emerald-800 font-bold text-[10px]">
                    2
                  </span>
                  <span>
                    {t("Scroll down and select", "नीचे स्क्रॉल करें और", "नीचे जाव अउ")}{" "}
                    <strong className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-slate-200 rounded text-slate-900">
                      <PlusSquare className="w-3 h-3 inline" /> {t("Add to Home Screen", "होम स्क्रीन पर जोड़ें", "होम स्क्रीन म जोड़व")}
                    </strong>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-150 text-emerald-800 font-bold text-[10px]">
                    3
                  </span>
                  <span>
                    {t("Tap", "ऊपर", "ऊपर")}{" "}
                    <strong className="px-1 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold">
                      {t("Add", "जोड़ें (Add)", "जोड़व")}
                    </strong>{" "}
                    {t("in the top right corner. Done!", "पर क्लिक करें। काम पूरा!", "म दबावा। काम होगे!")}
                  </span>
                </li>
              </ol>
            </div>
          ) : (
            /* Android / Chrome One-Tap Install Action */
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-800 hover:to-emerald-600 text-white py-3 px-4 font-bold text-sm shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-200" />
                <span>
                  {t(
                    "Install Free App (1-Tap)",
                    "फ्री ऐप इंस्टॉल करें (1-टैप)",
                    "फ्री ऐप डालव (1-टैप)"
                  )}
                </span>
              </button>
            </div>
          )}

          {/* Secondary Actions */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t("No App Store required · 1.2 MB", "प्ले स्टोर की जरूरत नहीं · 1.2 MB", "प्ले स्टोर नई लगय · 1.2 MB")}</span>
            </span>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-slate-500 hover:text-slate-800 font-medium underline underline-offset-2"
            >
              {t("Maybe later", "बाद में", "पाछू")}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
