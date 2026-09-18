import React from "react";
import Link from "next/link";
import { Scale, FileText, Cookie, ShieldAlert, Accessibility } from "lucide-react";

interface LegalLayoutProps {
  title: string;
  updated: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

export function LegalSection({
  id,
  heading,
  children,
}: {
  id?: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-28 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
      <h2 id={id} className="text-headline-md text-on-surface font-semibold">
        {heading}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function LegalParagraph({ children }: { children: React.ReactNode }) {
  return <p className="text-on-surface-variant leading-relaxed">{children}</p>;
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 text-on-surface-variant">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

const LEGAL_LINKS = [
  { href: "/legal/privacy", label: "Privacy Policy", icon: FileText },
  { href: "/legal/terms", label: "Terms of Service", icon: Scale },
  { href: "/legal/cookies", label: "Cookie Policy", icon: Cookie },
  { href: "/legal/disclaimer", label: "Disclaimer", icon: ShieldAlert },
  { href: "/legal/accessibility", label: "Accessibility", icon: Accessibility },
];

export default function LegalPageLayout({
  title,
  updated,
  description,
  icon: Icon,
  children,
}: LegalLayoutProps) {
  return (
    <div className="flex-1 bg-background flex flex-col">
      {/* Header */}
      <div className="bg-surface-container-lowest border-b border-outline-variant py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-caption font-bold uppercase tracking-wider text-primary">
                KisanSetu · Legal
              </p>
              <h1 className="text-headline-lg text-on-surface font-semibold">{title}</h1>
            </div>
          </div>
          <p className="mt-3 text-body-sm text-on-surface-variant">{description}</p>
          <p className="mt-2 text-caption text-on-surface-variant">
            Last updated: <span className="font-medium text-on-surface">{updated}</span>
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Document controls (simulated on this page only) */}
        <div className="sticky top-[72px] z-30 -mx-4 mt-0 mb-6 flex items-center gap-1 overflow-x-auto border border-outline-variant bg-surface-container-lowest px-2 py-1.5 sm:mx-0 sm:rounded-xl">
          {LEGAL_LINKS.map((l) => {
            const LIcon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-caption font-medium text-on-surface-variant transition hover:bg-primary/10 hover:text-primary"
              >
                <LIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{l.label}</span>
              </Link>
            );
          })}
        </div>

        <article className="space-y-6 text-body-sm leading-relaxed text-on-surface-variant">{children}</article>

        <p className="mt-10 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 text-caption text-on-surface-variant">
          Confidentiality warning: This is demo implementation for SIH 2026 Problem Statement 26033.
          Please consult with legal counsel before deploying publicly.
        </p>
      </div>
    </div>
  );
}