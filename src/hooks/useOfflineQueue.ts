import { useEffect, useState } from "react";

const QUEUE_KEY = "kisansetu_farmer_offline_queue";

export function useOfflineQueue() {
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);
  const [pendingItems, setPendingItems] = useState<any[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Load initial queue
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) setPendingItems(JSON.parse(stored));
    } catch (e) {
      console.error("Failed to load offline queue", e);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const addToQueue = (item: any) => {
    setPendingItems((prev) => {
      const next = [...prev, { ...item, timestamp: Date.now() }];
      localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const processQueue = async (processor: (item: any) => Promise<boolean>) => {
    if (isOffline || pendingItems.length === 0) return;

    const remaining: any[] = [];
    for (const item of pendingItems) {
      try {
        const success = await processor(item);
        if (!success) remaining.push(item);
      } catch (e) {
        remaining.push(item);
      }
    }

    setPendingItems(remaining);
    if (remaining.length === 0) {
      localStorage.removeItem(QUEUE_KEY);
    } else {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    }
  };

  return { isOffline, pendingItems, addToQueue, processQueue, pendingCount: pendingItems.length };
}
