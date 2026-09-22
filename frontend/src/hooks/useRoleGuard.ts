"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useRoleGuard(allowedRole?: "farmer" | "buyer") {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kisansetu_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setIsAuthorized(true);
      } else {
        // Fallback for demo/guest access or soft redirect
        setUser(null);
        setIsAuthorized(true);
      }
    } catch {
      setUser(null);
      setIsAuthorized(true);
    } finally {
      setIsLoading(false);
    }
  }, [router, allowedRole]);

  return { isAuthorized, isLoading, user };
}

