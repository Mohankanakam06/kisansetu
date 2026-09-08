"use client";

/**
 * HydrationGuard
 *
 * Browser form-filling extensions (LastPass and similar) inject extra
 * attributes such as `fdprocessedid` into the server-rendered HTML *before*
 * React hydrates. React then sees attributes on the live DOM that are absent
 * from the client tree and logs a hydration "did not match" error — even
 * though the app code is correct.
 *
 * This guard runs at module load (before hydration completes) and:
 *   1. Blocks the extension attribute from being written in the first place.
 *   2. Filters any residual React hydration warnings caused by those
 *      extension-injected attributes so the console stays clean.
 *
 * It intentionally does NOT suppress real hydration errors (genuine
 * server/client mismatches), only the ones caused by extension attributes.
 */
if (typeof window !== "undefined") {
  try {
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (
      name: string,
      value: string
    ) {
      if (name === "fdprocessedid") return;
      return originalSetAttribute.call(this, name, value);
    };
  } catch {
    /* ignore — patching is best-effort */
  }

  try {
    const originalError = console.error.bind(console);
    console.error = (...args: unknown[]) => {
      const joined = args.map(String).join(" ");
      // Only swallow the extension-injected attribute noise.
      if (joined.includes("fdprocessedid")) return;
      originalError(...args);
    };
  } catch {
    /* ignore */
  }
}

export default function HydrationGuard() {
  return null;
}
