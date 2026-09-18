"use client";
import { Construction } from "lucide-react";
import StatusPage from "@/components/ui/StatusPage";

export default function MaintenancePage() {
  return (
    <StatusPage
      icon={Construction}
      accent="amber"
      eyebrow="Breaking new ground"
      title="We're down for maintenance"
      description="KisanSetu is briefly unavailable for scheduled improvements (e.g. aggregation tuning, map tile updates). We'll be back within the hour."
      primaryAction={{ label: "Return home", href: "/" }}
      secondaryAction={{ label: "Try marketplace anyway", href: "/buyer" }}
    />
  );
}