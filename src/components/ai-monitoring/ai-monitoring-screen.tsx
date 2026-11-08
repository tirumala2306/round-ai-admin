"use client";

import { useMemo, useState } from "react";
import { AiCostSection } from "@/components/ai-monitoring/ai-cost-section";
import { AiErrorsTable } from "@/components/ai-monitoring/ai-errors-table";
import { AiPerformanceSection } from "@/components/ai-monitoring/ai-performance-section";
import { AiUsageChart, FeatureUsageChart } from "@/components/ai-monitoring/ai-usage-chart";
import { MonitoringHeader } from "@/components/ai-monitoring/monitoring-header";
import { MonitoringHero } from "@/components/ai-monitoring/monitoring-hero";
import { MonitoringKpiCards } from "@/components/ai-monitoring/monitoring-kpi-cards";
import { OrganizationUsageChart } from "@/components/ai-monitoring/organization-usage-chart";
import { aiModels } from "@/features/ai-monitoring/catalog";
import { sampleAiRequests } from "@/features/ai-monitoring/sample-data";
import { buildMonitoringView } from "@/features/ai-monitoring/selectors";
import type { AiFeatureId, AiModelId, AiTimeRange } from "@/features/ai-monitoring/types";
import { useOrganizationDirectory } from "@/features/organizations/demo-store";
import { showOrganizationToast } from "@/features/organizations/toast-store";

export function AiMonitoringScreen() {
  const directory = useOrganizationDirectory();
  const [range, setRange] = useState<AiTimeRange>("7d");
  const [organizationId, setOrganizationId] = useState("all");
  const [featureId, setFeatureId] = useState<AiFeatureId | "all">("all");
  const [modelId, setModelId] = useState<AiModelId | "all">("all");
  const [errorResetKey, setErrorResetKey] = useState(0);

  const view = useMemo(
    () =>
      buildMonitoringView(sampleAiRequests, directory, {
        range,
        organizationId,
        featureId,
        modelId,
      }),
    [directory, featureId, modelId, organizationId, range],
  );

  function toggleFeature(nextFeatureId: AiFeatureId) {
    setFeatureId((current) => (current === nextFeatureId ? "all" : nextFeatureId));
  }

  function toggleModel(nextModelId: AiModelId) {
    setModelId((current) => (current === nextModelId ? "all" : nextModelId));
  }

  function toggleOrganization(nextOrganizationId: string) {
    setOrganizationId((current) => (current === nextOrganizationId ? "all" : nextOrganizationId));
  }

  function refreshDemoData() {
    setRange("7d");
    setOrganizationId("all");
    setFeatureId("all");
    setModelId("all");
    setErrorResetKey((current) => current + 1);
    showOrganizationToast("Sample monitoring data was reloaded. No AI service was contacted.");
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <MonitoringHeader
        range={range}
        organizationId={organizationId}
        organizations={directory.organizations}
        onRangeChange={setRange}
        onOrganizationChange={setOrganizationId}
        onRefresh={refreshDemoData}
      />
      <MonitoringHero
        range={range}
        activeModels={view.summary.activeModels}
        catalogModels={aiModels.length}
      />
      <MonitoringKpiCards summary={view.summary} previous={view.previous} />
      <AiUsageChart buckets={view.buckets} total={view.summary.total} />
      <div className="grid gap-3 xl:grid-cols-2">
        <OrganizationUsageChart
          organizations={view.organizations}
          selectedId={organizationId}
          onSelect={toggleOrganization}
        />
        <FeatureUsageChart features={view.features} selectedId={featureId} onSelect={toggleFeature} />
      </div>
      <AiPerformanceSection
        summary={view.summary}
        buckets={view.buckets}
        models={view.models}
        selectedModelId={modelId}
        onSelectModel={toggleModel}
      />
      <AiErrorsTable key={errorResetKey} errors={view.errors} organizations={directory.organizations} />
      <AiCostSection
        summary={view.summary}
        buckets={view.buckets}
        models={view.costByModel}
        organizations={view.costByOrganization}
      />
    </div>
  );
}
