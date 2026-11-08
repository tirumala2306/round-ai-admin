"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AiConfigConfirmDialog } from "@/components/ai-configuration/confirm-dialog";
import { FormField } from "@/components/ai-configuration/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { aiUsageSample } from "@/features/ai-configuration/sample-data";
import { createAiUsageSchema } from "@/features/ai-configuration/schema";
import type { AiConfiguration, AiUsageLimitsFormValues } from "@/features/ai-configuration/types";
import {
  claimOrganizationWrite,
  releaseOrganizationWrite,
  updateAiUsageLimits,
} from "@/features/organizations/demo-store";
import { formatCreatedDate } from "@/features/organizations/format";
import { showOrganizationToast } from "@/features/organizations/toast-store";

export function UsagePanel({ config }: { config: AiConfiguration }) {
  const limits = config.usageLimits;
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState<AiUsageLimitsFormValues | undefined>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AiUsageLimitsFormValues>({
    resolver: zodResolver(createAiUsageSchema(config)),
    defaultValues: {
      maxTokensPerRequest: limits.maxTokensPerRequest,
      dailyUsageThreshold: limits.dailyUsageThreshold,
      monthlyUsageThreshold: limits.monthlyUsageThreshold,
      warningThresholdPercent: limits.warningThresholdPercent,
      usageAlertsEnabled: limits.usageAlertsEnabled,
    },
    mode: "onTouched",
  });

  function save(values: AiUsageLimitsFormValues) {
    if (!claimOrganizationWrite()) {
      showOrganizationToast("Another sample change is still open.");
      return;
    }
    const result = updateAiUsageLimits(values);
    releaseOrganizationWrite();
    setConfirming(false);
    if (!result.ok) {
      showOrganizationToast(result.message);
      return;
    }
    showOrganizationToast("Usage limits were updated in this sample configuration.");
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-lg border border-border bg-accent/40 px-4 py-3 text-sm leading-6 text-muted-foreground">
        The figures below are a fixed demo snapshot from {aiUsageSample.asOfLabel}. They are separate from the limits you configure and are not read from a provider or a billing system.
      </div>
      <section aria-label="Sample usage snapshot" className="grid gap-3 sm:grid-cols-3">
        <Metric label="Tokens today" value={aiUsageSample.tokensToday} />
        <Metric label="Tokens this month" value={aiUsageSample.tokensThisMonth} />
        <Metric label="Requests today" value={aiUsageSample.requestsToday} />
      </section>
      <form
        className="grid max-w-xl gap-4"
        onSubmit={handleSubmit((values) => {
          setPending(values);
          setConfirming(true);
        })}
      >
        <p className="text-xs text-muted-foreground">Limits last updated {formatCreatedDate(limits.updatedAt)}.</p>
        <FormField
          label="Maximum tokens per request"
          htmlFor="usage-max-tokens"
          error={errors.maxTokensPerRequest?.message}
          required
        >
          <Input id="usage-max-tokens" type="number" min={1} step={1} {...register("maxTokensPerRequest", { valueAsNumber: true })} />
        </FormField>
        <FormField label="Daily usage threshold" htmlFor="usage-daily" error={errors.dailyUsageThreshold?.message} required>
          <Input id="usage-daily" type="number" min={1} step={1} {...register("dailyUsageThreshold", { valueAsNumber: true })} />
        </FormField>
        <FormField
          label="Monthly usage threshold"
          htmlFor="usage-monthly"
          error={errors.monthlyUsageThreshold?.message}
          required
        >
          <Input id="usage-monthly" type="number" min={1} step={1} {...register("monthlyUsageThreshold", { valueAsNumber: true })} />
        </FormField>
        <FormField
          label="Warning threshold"
          htmlFor="usage-warning"
          error={errors.warningThresholdPercent?.message}
          required
          hint="Percent of a daily or monthly threshold that should raise a sample alert."
        >
          <Input
            id="usage-warning"
            type="number"
            min={1}
            max={100}
            step={1}
            {...register("warningThresholdPercent", { valueAsNumber: true })}
          />
        </FormField>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-primary" {...register("usageAlertsEnabled")} />
          Enable usage alerts
        </label>
        <div>
          <Button type="submit">Save usage limits</Button>
        </div>
      </form>
      <AiConfigConfirmDialog
        open={confirming}
        title="Save usage limits?"
        description="This updates the sample thresholds in this browser session. It does not bill an account or read provider usage."
        confirmLabel="Save limits"
        onOpenChange={setConfirming}
        onConfirm={() => {
          if (pending) {
            save(pending);
          }
        }}
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value.toLocaleString("en-US")}</p>
      <p className="mt-1 text-xs text-muted-foreground">Demo snapshot</p>
    </article>
  );
}
