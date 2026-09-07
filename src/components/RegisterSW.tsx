"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("KisanSetu ServiceWorker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.error("KisanSetu ServiceWorker registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}
