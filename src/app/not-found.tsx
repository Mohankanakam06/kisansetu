"use client";
import { FileQuestion } from "lucide-react";
import StatusPage from "@/components/ui/StatusPage";

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      icon={FileQuestion}
      accent="amber"
      eyebrow="Page not found"
      title="This patch of internet isn't productive"
      description="The page you're looking for doesn't exist or may have been moved to a different lot."
      primaryAction={{ label: "Back to marketplace", href: "/buyer" }}
      secondaryAction={{ label: "Return home", href: "/" }}
    />
  );
}