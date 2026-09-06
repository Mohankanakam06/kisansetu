"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/components/ui";

interface CropPhotoProps {
  /** Crop name used for the Pexels search and the cache key, e.g. "Tomato". */
  crop: string;
  /** Emoji shown as the fallback while loading / if the photo lookup fails. */
  fallbackEmoji: string;
  className?: string;
}

// In-memory cache: instant across re-renders / navigation within this session.
const MODULE_CACHE = new Map<string, string>();

// localStorage mirror: survives reloads so a crop is only fetched from Pexels once.
const STORAGE_KEY = "kisansetu:crop-photos";

function readCachedPhoto(who: string): string | null {
  if (MODULE_CACHE.has(who)) return MODULE_CACHE.get(who)!;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, string>;
      for (const [key, value] of Object.entries(parsed)) {
        MODULE_CACHE.set(key, value);
      }
      return parsed[who] ?? null;
    }
  } catch {
    // Corrupt cache — ignore and re-fetch.
  }
  return null;
}

function writeCachedPhoto(who: string, url: string) {
  MODULE_CACHE.set(who, url);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    parsed[who] = url;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Storage quota / privacy mode — in-memory cache still covers this session.
  }
}

export default function CropPhoto({ crop, fallbackEmoji, className }: CropPhotoProps) {
  const normalized = crop.toLowerCase();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Cache hit → render immediately, never refetch the same crop.
    const cached = readCachedPhoto(normalized);
    if (cached) {
      setPhotoUrl(cached);
      return () => {
        cancelled = true;
      };
    }

    fetch(`/api/crop-photo?query=${encodeURIComponent(normalized)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data: { url?: string }) => {
        if (cancelled || !data.url) return;
        setPhotoUrl(data.url);
        writeCachedPhoto(normalized, data.url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [normalized]);

  // Photo failed to load (e.g. remote URL rotated) → fall back to the emoji.
  if (photoUrl && !failed) {
    return (
      <img
        src={photoUrl}
        alt={`${crop} produce`}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn(
          "h-14 w-14 shrink-0 rounded-xl border border-outline-variant bg-surface-container-lowest object-cover shadow-sm",
          className
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-container text-headline-md",
        className
      )}
      aria-hidden="true"
    >
      {fallbackEmoji}
    </span>
  );
}