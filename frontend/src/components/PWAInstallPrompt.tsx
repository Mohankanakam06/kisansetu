"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Download,
  X,
  Share2,
  PlusSquare,
  Smartphone,
  ChevronUp,
  Sprout,
  Wifi,
  Zap,
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
        setIsMinimized(true);
        setIsOpen(false);
      } else {
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
    if (!deferredPrompt) return;
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

  if (isStandalone || installedSuccessfully) return null;

  const isHomePage = pathname === "/";

  // Minimized floating pill — homepage only
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
        className="fixed bottom-20 left-4 z-[140] flex items-center gap-2 rounded-full bg-slate-900 text-white px-3.5 py-2 text-xs font-semibold shadow-lg border border-slate-700 hover:bg-slate-800 transition-colors active:scale-95"
      >
        <Smartphone className="w-3.5 h-3.5 text-slate-300" />
        <span>{t("Install App", "ऐप इंस्टॉल करें", "ऐप डालव")}</span>
        <ChevronUp className="w-3 h-3 text-slate-500" />
      </button>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] pointer-events-none flex flex-col justify-end sm:justify-start sm:items-end p-0 sm:p-6">
      {/* Backdrop — mobile only */}
      <div
        className="fixed inset-0 bg-slate-950/30 backdrop-blur-xs pointer-events-auto sm:hidden"
        onClick={handleDismiss}
      />

      {/* Drawer card */}
      <aside
        aria-label={t("Install KisanSetu App", "KisanSetu ऐप इंस्टॉल करें", "KisanSetu ऐप डालव")}
        className="pointer-events-auto relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-xl border border-slate-200 shadow-2xl overflow-hidden pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center shrink-0">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-display">
                {t("Install KisanSetu", "KisanSetu इंस्टॉल करें", "KisanSetu डालव")}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t("Add to your home screen", "होम स्क्रीन में जोड़ें", "होम स्क्रीन म जोड़व")}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Benefits — compact list */}
        <div className="px-5 pb-4">
          <ul className="space-y-2">
            <li className="flex items-center gap-2.5 text-xs text-slate-600">
              <Zap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{t("Faster loads, works offline", "तेज़ लोड, ऑफ़लाइन चलता है", "तेज़ लोड, ऑफ़लाइन चलथे")}</span>
            </li>
            <li className="flex items-center gap-2.5 text-xs text-slate-600">
              <Wifi className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{t("Live mandi rate alerts", "लाइव मंडी भाव अलर्ट", "लाइव मंडी भाव अलर्ट")}</span>
            </li>
            <li className="flex items-center gap-2.5 text-xs text-slate-600">
              <Smartphone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{t("No app store needed", "प्ले स्टोर की ज़रूरत नहीं", "प्ले स्टोर नई लगय")}</span>
            </li>
          </ul>
        </div>

        {/* Action */}
        <div className="px-5 pb-5">
          {isIOS ? (
            /* iOS Safari step-by-step */
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
              <p className="text-xs font-semibold text-slate-700">
                {t("Install via Safari:", "Safari से इंस्टॉल करें:", "Safari ले इंस्टॉल करव:")}
              </p>
              <ol className="space-y-2 text-[11px] text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">1</span>
                  <span>
                    {t("Tap", "नीचे", "नीचे")}{" "}
                    <strong className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-slate-200 rounded text-slate-800">
                      <Share2 className="w-3 h-3 inline" /> {t("Share", "शेयर", "शेयर")}
                    </strong>{" "}
                    {t("in the toolbar", "बटन दबाएं", "बटन दबावा")}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">2</span>
                  <span>
                    {t("Select", "चुनें", "चुनव")}{" "}
                    <strong className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-slate-200 rounded text-slate-800">
                      <PlusSquare className="w-3 h-3 inline" /> {t("Add to Home Screen", "होम स्क्रीन पर जोड़ें", "होम स्क्रीन म जोड़व")}
                    </strong>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">3</span>
                  <span>
                    {t("Tap", "दबाएं", "दबावा")}{" "}
                    <strong className="px-1 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">{t("Add", "जोड़ें", "जोड़व")}</strong>
                  </span>
                </li>
              </ol>
            </div>
          ) : (
            /* Android / Chrome / Edge one-tap install */
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white py-2.5 px-4 font-semibold text-sm transition-colors active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t("Install App", "ऐप इंस्टॉल करें", "ऐप डालव")}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full mt-2 text-center text-xs text-slate-400 hover:text-slate-600 font-medium py-1.5 transition-colors"
          >
            {t("Not now", "अभी नहीं", "अभी नहीं")}
          </button>
        </div>
      </aside>
    </div>
  );
}
