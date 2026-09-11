"use client";
import { useEffect } from "react";

export function useRoleGuard(allowedRole: "farmer" | "buyer") {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("kisansetu_user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role !== allowedRole) {
          window.location.href = `/${user.role}`;
        }
      } else {
        window.location.href = "/login";
      }
    } catch (e) {
      window.location.href = "/login";
    }
  }, [allowedRole]);
}
