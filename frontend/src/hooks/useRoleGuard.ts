"use client";
import { useEffect, useState } from "react";

export function useRoleGuard(allowedRole: "farmer" | "buyer") {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("kisansetu_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.role !== allowedRole) {
          window.location.href = `/${parsed.role}`;
          return;
        }
        setUser(parsed);
        setIsAuthorized(true);
      } else {
        window.location.href = "/login";
        return;
      }
    } catch (e) {
      window.location.href = "/login";
      return;
    } finally {
      setIsLoading(false);
    }
  }, [allowedRole]);

  return { isAuthorized, isLoading, user };
}
