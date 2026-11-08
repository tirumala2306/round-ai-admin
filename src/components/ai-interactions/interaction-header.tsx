"use client";

import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aiInteractionsModule } from "@/features/ai-interactions";
import { interactionAsOf } from "@/features/ai-interactions/types";
import { formatMonitoringStamp } from "@/features/ai-monitoring/format";

export function InteractionHeader({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-2xl">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="outline">Demo data</Badge>
          <p className="text-xs text-muted-foreground">
            Sample snapshot · {formatMonitoringStamp(interactionAsOf)}
          </p>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{aiInteractionsModule.summary}</p>
      </div>
      <Button type="button" variant="outline" onClick={onRefresh} className="shrink-0 bg-card">
        <RefreshCw />
        Refresh demo data
      </Button>
    </div>
  );
}
