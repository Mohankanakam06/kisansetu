"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // In development mode, automatically unregister any existing service worker
      // to avoid Next.js Fast Refresh / Turbopack HMR cache collisions and refresh loops
      if (process.env.NODE_ENV !== "production") {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister().then((success) => {
              if (success) {
                console.log("[KisanSetu PWA] Unregistered ServiceWorker in development mode.");
              }
            });
          });
        });
        return;
      }

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
