"use client";
import { WifiOff, RefreshCw } from "lucide-react";
import StatusPage from "@/components/ui/StatusPage";
import { Button } from "@/components/ui";

export default function OfflinePage() {
  return (
    <StatusPage
      icon={WifiOff}
      accent="amber"
      eyebrow="You're offline"
      title="No network connection"
      description="The harvest can wait — but nothing will load until you're back online. Check your signal and retry."
      primaryAction={{ label: "Go home", href: "/" }}
    >
      <div className="mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-3.5 w-3.5" /> Recheck connection
        </Button>
      </div>
    </StatusPage>
  );
}