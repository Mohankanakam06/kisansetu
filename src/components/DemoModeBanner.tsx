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
    <div className="fixed top-10 left-0 right-0 z-[70] flex items-center justify-center gap-2 bg-amber-500 text-white text-xs font-bold py-1.5 px-4 shadow-lg border-b border-amber-600">
      {reason === "offline" ? (
        <WifiOff className="w-3.5 h-3.5 shrink-0" />
      ) : (
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
      )}
      <span>
        ⚠️ DEMO MODE — {reason === "offline" ?
          "Backend is unreachable. Showing simulated data. No real DB or API calls are being made."
          : "NEXT_PUBLIC_USE_MOCK_API=true. Showing simulated data. No real DB or API calls are being made."
        }
      </span>
    </div>
  );
}
