"use client";
import { useState, useEffect, useCallback } from "react";

const FAVORITES_STORAGE_KEY = "kisansetu_favorites";
const FAVORITES_EVENT = "kisansetu:favorites-updated";

function getStoredFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getStoredFavorites());

    const handleUpdate = () => {
      setFavorites(getStoredFavorites());
    };

    window.addEventListener(FAVORITES_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const toggleFavorite = useCallback((lotId: string) => {
    if (!lotId || typeof window === "undefined") return false;
    try {
      const current = getStoredFavorites();
      const exists = current.includes(lotId);
      const updated = exists ? current.filter((id) => id !== lotId) : [...current, lotId];
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      setFavorites(updated);
      window.dispatchEvent(new Event(FAVORITES_EVENT));
      return !exists;
    } catch {
      return false;
    }
  }, []);

  const isFavorite = useCallback(
    (lotId: string) => favorites.includes(lotId),
    [favorites]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    favoritesCount: favorites.length,
  };
}
