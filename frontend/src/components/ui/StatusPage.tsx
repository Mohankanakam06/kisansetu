"use client";
import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "./index";

interface StatusPageProps {
  icon?: LucideIcon | React.ReactNode;
  accent?: "emerald" | "amber" | "rose";
  code?: string;
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  children?: React.ReactNode;
}

const ACCENTS = {
  emerald: { ring: "ring-primary/10", bg: "bg-primary-container", icon: "text-on-primary-container" },
  amber: { ring: "ring-warning/15", bg: "bg-warning/15", icon: "text-amber-700" },
  rose: { ring: "ring-error/10", bg: "bg-error-container", icon: "text-on-error-container" },
};

export default function StatusPage({
  icon,
  accent = "emerald",
  code,
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
}: StatusPageProps) {
  const a = ACCENTS[accent];

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === "function" || typeof icon === "object") {
      const IconComp = icon as LucideIcon;
      return <IconComp className={`h-8 w-8 ${a.icon}`} />;
    }
    return null;
  };

  return (
    <div className="flex-1 bg-background flex flex-col items-center justify-center px-4 sm:px-6 py-16 w-full">
      <div className="w-full max-w-md mx-auto text-center">
        {code && (
          <p className="text-display-lg text-on-surface-variant/40 select-none">{code}</p>
        )}
        <div
          className={`mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full ${a.bg} ${a.ring} ring-8`}
        >
          {renderIcon()}
        </div>
        {eyebrow && (
          <p className="mt-4 text-caption font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
        )}
        <h1 className="mt-2 text-headline-md text-on-surface sm:text-headline-lg">{title}</h1>
        <p className="mt-2 text-body-sm text-on-surface-variant leading-relaxed">{description}</p>

        {children}

        {(primaryAction || secondaryAction) && (
          <div className="mt-8 flex flex-col gap-2">
            {primaryAction && (
              <Link href={primaryAction.href}>
                <Button variant="primary" className="w-full">
                  {primaryAction.label}
                </Button>
              </Link>
            )}
            {secondaryAction && (
              <Link href={secondaryAction.href}>
                <Button variant="outline" className="w-full">
                  {secondaryAction.label}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}