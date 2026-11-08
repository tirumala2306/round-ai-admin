import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { timeRangeLabel } from "@/features/ai-monitoring/catalog";
import type { AiTimeRange } from "@/features/ai-monitoring/types";

export function MonitoringHero({
  range,
  activeModels,
  catalogModels,
}: {
  range: AiTimeRange;
  activeModels: number;
  catalogModels: number;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(14rem,0.8fr)]">
        <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6">
          <div className="max-w-xl">
            <Badge variant="outline" className="font-normal">
              Demo data
            </Badge>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
              RoundsAI Intelligence Overview
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Monitor the health, performance and usage of AI-powered clinical workflows.
            </p>
          </div>
          <dl className="grid gap-4 sm:grid-cols-3">
            <Indicator label="AI Services Status" value="Not connected" detail="No AI provider is linked" />
            <Indicator
              label="Active Models"
              value={String(activeModels)}
              detail={`${catalogModels} sample models in the catalog`}
            />
            <Indicator
              label="Monitoring Period"
              value={timeRangeLabel(range)}
              detail="Sample window ending Nov 5, 2026"
            />
          </dl>
        </div>
        <div className="relative flex min-h-52 items-center justify-center overflow-hidden bg-background lg:min-h-full">
          <Image
            src="/roundsai-brand-visual.png"
            alt=""
            width={1536}
            height={1024}
            unoptimized
            className="h-full max-h-72 w-full object-contain object-center"
          />
        </div>
      </div>
    </section>
  );
}

function Indicator({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd>
      <dd className="mt-0.5 text-xs text-muted-foreground">{detail}</dd>
    </div>
  );
}
