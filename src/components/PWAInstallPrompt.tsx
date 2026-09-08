"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { useLanguage } from "@/lib/language";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PWAInstallPrompt() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice && "accepted" === choice.outcome) {
      setInstalled(true);
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  if (installed || !visible || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[500] w-80 rounded-2xl border border-outline-variant/80 bg-surface-container-lowest p-4 shadow-2xl animate-in slide-in-from-bottom fade-in">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-body-sm font-bold text-on-surface">{t("Install KisanSetu App", "KisanSetu ऐप इंस्टॉल करें", "KisanSetu ऐप डालव")}</p>
          <p className="text-caption text-on-surface-variant mt-0.5">
            {t("Use offline, add to home screen & get payout alerts on the go.", "ऑफ़लाइन उपयोग करें, होम स्क्रीन पर जोड़ें और भुगतान अलर्ट प्राप्त करें।", "ऑफलाइन चलाव, होम स्क्रीन म जोड़व आ पइसा के अलर्ट पाव।")}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <button
        onClick={handleInstall}
        className="mt-3 w-full rounded-lg bg-primary px-4 py-2.5 text-body-sm font-bold text-on-primary transition hover:bg-primary/90"
      >
        {t("Install Now", "अभी इंस्टॉल करें", "अभी डालव")}
      </button>
    </div>
  );
}