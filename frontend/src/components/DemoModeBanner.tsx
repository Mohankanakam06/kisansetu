"use client";
import React, { useEffect, useState } from "react";
import { AlertTriangle, Wifi, WifiOff } from "lucide-react";

/**
 * DemoModeBanner — displayed when the app is running in demo/offline mode
 * either because NEXT_PUBLIC_USE_MOCK_API=true or because the backend
 * was unreachable on (recent) health checks.
 */
export default function DemoModeBanner() {
  const [visible, setVisible] = useState(false);
  const [reason, setReason] = useState<"env" | "offline">("env");

  useEffect(() => {
    let cancelled = false;

    // 1) Explicit mock flag: always show
    if (process.env.NEXT_PUBLIC_USE_MOCK_API === "true") {
      setVisible(true);
      setReason("env");
      return;
    }

    // 2) Otherwise, probe backend health and keep retrying briefly.
    const probe = async (): Promise<boolean> => {
      try {
        const res = await fetch("/api/health", { method: "GET", signal: AbortSignal.timeout(4000) });
        return res.ok;
      } catch {
        return false;
      }
    };

    let attempts = 0;
    const maxAttempts = 10;
    const retryMs = 3000;

    const tick = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      attempts++;
      const ok = await probe();
      if (cancelled) return;

      if (ok) {
        setVisible(false);
        return;
      }

      setVisible(true);
      setReason("offline");

      // Stop after max attempts.
      if (attempts >= maxAttempts) return;
    };

    // Initial check + retries.
    tick();
    const intervalId = window.setInterval(() => {
      if (attempts >= maxAttempts) {
        window.clearInterval(intervalId);
        return;
      }
      tick();
    }, retryMs);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="relative w-full z-[40] flex items-start sm:items-center justify-center gap-2 bg-amber-50 text-amber-900 text-[11px] font-bold py-2 px-4 sm:px-8 border-b-2 border-amber-200">
      <div className="flex items-center gap-2 mt-0.5 sm:mt-0">
        {reason === "offline" ? (
          <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
        )}
      </div>
      <span className="leading-snug flex-1">
        ⚠️ DEMO MODE — {reason === "offline" ?
          "Backend is unreachable. Showing simulated data."
          : "Showing simulated data. No real DB or API calls are being made."
        }
      </span>
      <button
        onClick={() => setVisible(false)}
        className="p-1 -mr-2 text-amber-700/70 hover:text-amber-900 bg-amber-100/50 hover:bg-amber-200/50 rounded transition-colors"
        aria-label="Dismiss demo banner"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  );
}
