"use client";
import { useState } from "react";
import { Cookie } from "lucide-react";
import LegalPageLayout, { LegalSection, LegalParagraph, LegalList } from "@/components/legal/LegalPageLayout";
import { Button } from "@/components/ui";

const COOKIE_CATEGORIES = [
  {
    key: "necessary",
    name: "Strictly necessary",
    desc: "Session tokens, OTP flow, and security. These keep you logged in and safe.",
    default: true,
    required: true,
  },
  {
    key: "functional",
    name: "Functional",
    desc: "Remember language (हिन्दी / छत्तीसगढ़ी / English) and location so forms are pre-filled.",
    default: true,
    required: false,
  },
  {
    key: "analytics",
    name: "Analytics & performance",
    desc: "Help us understand which features (grading, routing) are used most during the demo.",
    default: false,
    required: false,
  },
];

export default function CookiePolicyPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    necessary: true,
    functional: true,
    analytics: false,
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key: string) => {
    if (key === "necessary") return;
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  return (
    <LegalPageLayout
      title="Cookie Policy"
      updated="August 29, 2026"
      description="How KisanSetu uses cookies and how you can manage them."
      icon={Cookie}
    >
      <LegalSection id="what" heading="1. What are cookies?">
        <LegalParagraph>
          Cookies are small text files stored on your device that help websites function and
          remember your preferences. We use them sparingly — this demo only sets what it needs to
          run.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="manage" heading="2. Manage your preferences">
        <LegalParagraph>
          Use the toggles below to decide which cookie categories you allow. Turning something off
          may affect how well personalized features work.
        </LegalParagraph>

        <div className="space-y-3 pt-1">
          {COOKIE_CATEGORIES.map((c) => (
            <div key={c.key} className="flex items-start justify-between gap-4 rounded-lg border border-outline-variant p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-on-surface text-body-sm">{c.name}</p>
                  {c.required && (
                    <span className="rounded bg-surface-container-low px-1.5 py-0.5 text-[10px] font-bold uppercase text-on-surface-variant">
                      Always on
                    </span>
                  )}
                </div>
                <p className="mt-1 text-caption text-on-surface-variant">{c.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[c.key]}
                aria-label={`Toggle ${c.name}`}
                onClick={() => toggle(c.key)}
                disabled={c.required}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  prefs[c.key] ? "bg-primary" : "bg-outline-variant"
                } ${c.required ? "opacity-60" : "cursor-pointer"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface-container-lowest shadow transition-all ${
                    prefs[c.key] ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            <Button variant="primary" size="md" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
              {saved ? "Preferences saved" : "Save preferences"}
            </Button>
            <Button variant="outline" size="md" onClick={() => setPrefs({ necessary: true, functional: true, analytics: false })}>
              Reset
            </Button>
          </div>
        </div>
      </LegalSection>

      <LegalSection id="table" heading="3. Cookies we may use">
        <LegalList
          items={[
            <>Session cookie — required to keep your OTP/login session alive during the demo.</>,
            <>Language preference cookie — remembers your chosen language across pages.</>,
            <>Aggregation state cookie — keeps your in-progress listing stable as you go through the flow.</>,
            <>Analytics cookies — only set if you enable the analytics category above.</>,
          ]}
        />
      </LegalSection>

      <LegalSection id="details" heading="4. Contact">
        <LegalParagraph>
          Questions about cookies? Email{" "}
          <span className="font-semibold text-on-surface">privacy@kisansetu.example.in</span>.
        </LegalParagraph>
      </LegalSection>
    </LegalPageLayout>
  );
}