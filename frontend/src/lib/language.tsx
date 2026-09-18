"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "hi" | "cg";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kisansetu_lang") as Language;
      if (saved && ["en", "hi", "cg"].includes(saved)) {
        setLanguageState(saved);
      }
    } catch (e) {}

    const handleCustomEvent = (e: any) => {
      if (e.detail && ["en", "hi", "cg"].includes(e.detail)) {
        setLanguageState(e.detail);
      }
    };

    window.addEventListener("kisansetu-lang", handleCustomEvent);
    return () => window.removeEventListener("kisansetu-lang", handleCustomEvent);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("kisansetu_lang", lang);
      window.dispatchEvent(new CustomEvent("kisansetu-lang", { detail: lang }));
    } catch (e) {}
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);

  const t = (en: string, hi?: string, cg?: string) => {
    if (ctx.language === "hi") return hi || en;
    if (ctx.language === "cg") return cg || hi || en;
    return en;
  };

  return { language: ctx.language, setLanguage: ctx.setLanguage, t };
}
