"use client";

import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { aiTimeRangeOptions, monitoringAsOf } from "@/features/ai-monitoring/catalog";
import { formatMonitoringStamp } from "@/features/ai-monitoring/format";
import type { AiTimeRange } from "@/features/ai-monitoring/types";
import type { Organization } from "@/features/organizations/types";

export function MonitoringHeader({
  range,
  organizationId,
  organizations,
  onRangeChange,
  onOrganizationChange,
  onRefresh,
}: {
  range: AiTimeRange;
  organizationId: string;
  organizations: Organization[];
  onRangeChange: (range: AiTimeRange) => void;
  onOrganizationChange: (organizationId: string) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline">Demo data</Badge>
            <p className="text-xs text-muted-foreground">
              Sample snapshot · {formatMonitoringStamp(monitoringAsOf)}
            </p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Monitor AI activity, model performance, reliability and estimated usage costs across RoundsAI.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onRefresh} className="shrink-0 bg-card">
          <RefreshCw />
          Refresh demo data
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
        <div className="grid gap-1.5">
          <Label htmlFor="ai-time-range">Time range</Label>
          <Select
            value={range}
            onValueChange={(value) => {
              if (aiTimeRangeOptions.some((option) => option.id === value)) {
                onRangeChange(value as AiTimeRange);
              }
            }}
          >
            <SelectTrigger id="ai-time-range" className="w-full bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {aiTimeRangeOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="ai-organization">Organization</Label>
          <Select value={organizationId} onValueChange={onOrganizationChange}>
            <SelectTrigger id="ai-organization" className="w-full bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All organizations</SelectItem>
              {[...organizations]
                .sort((left, right) => left.name.localeCompare(right.name))
                .map((organization) => (
                  <SelectItem key={organization.id} value={organization.id}>
                    {organization.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
