"use client";
import { ShieldX } from "lucide-react";
import StatusPage from "@/components/ui/StatusPage";

export default function ForbiddenPage() {
  return (
    <StatusPage
      code="403"
      icon={ShieldX}
      accent="rose"
      eyebrow="Access denied"
      title="You don't have permission to view this"
      description="This page is restricted to certain user roles. If you believe this is a mistake, contact support."
      primaryAction={{ label: "Back to marketplace", href: "/buyer" }}
      secondaryAction={{ label: "Go home", href: "/" }}
    />
  );
}