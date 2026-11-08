"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AiConfigConfirmDialog } from "@/components/ai-configuration/confirm-dialog";
import { Button } from "@/components/ui/button";
import { aiSafetySchema } from "@/features/ai-configuration/schema";
import type { AiSafetyFormValues, AiSafetySettings } from "@/features/ai-configuration/types";
import {
  claimOrganizationWrite,
  releaseOrganizationWrite,
  updateAiSafety,
} from "@/features/organizations/demo-store";
import { formatCreatedDate } from "@/features/organizations/format";
import { showOrganizationToast } from "@/features/organizations/toast-store";

const settings: { name: keyof AiSafetyFormValues; label: string; detail: string }[] = [
  {
    name: "requireClinicianReview",
    label: "Require clinician review before AI-generated content is accepted",
    detail: "Records the intended review step for this sample configuration.",
  },
  {
    name: "preventSignedNoteTreatment",
    label: "Prevent AI suggestions from being treated as signed clinical notes",
    detail: "Records that generated text should stay unsigned until a clinician signs it.",
  },
  {
    name: "displayAiIndicators",
    label: "Display AI-generated content indicators",
    detail: "Records that generated content should be labeled as AI-generated.",
  },
  {
    name: "requireSupportingEvidence",
    label: "Require supporting evidence where applicable",
    detail: "Records that evidence-backed answers should cite supporting material.",
  },
  {
    name: "enableFallbackWhenUnavailable",
    label: "Enable fallback when a configured model is unavailable",
    detail: "Records that a configured fallback model may be used. This screen does not call a model.",
  },
];

export function SafetyPanel({ safety }: { safety: AiSafetySettings }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState<AiSafetyFormValues | undefined>();
  const { register, handleSubmit } = useForm<AiSafetyFormValues>({
    resolver: zodResolver(aiSafetySchema),
    defaultValues: {
      requireClinicianReview: safety.requireClinicianReview,
      preventSignedNoteTreatment: safety.preventSignedNoteTreatment,
      displayAiIndicators: safety.displayAiIndicators,
      requireSupportingEvidence: safety.requireSupportingEvidence,
      enableFallbackWhenUnavailable: safety.enableFallbackWhenUnavailable,
    },
    mode: "onTouched",
  });

  function save(values: AiSafetyFormValues) {
    if (!claimOrganizationWrite()) {
      showOrganizationToast("Another sample change is still open.");
      return;
    }
    const result = updateAiSafety(values);
    releaseOrganizationWrite();
    setConfirming(false);
    if (!result.ok) {
      showOrganizationToast(result.message);
      return;
    }
    showOrganizationToast("Safety settings were updated in this sample configuration.");
  }

  return (
    <form
      className="grid max-w-3xl gap-4"
      onSubmit={handleSubmit((values) => {
        setPending(values);
        setConfirming(true);
      })}
    >
      <div className="rounded-lg border border-border bg-accent/40 px-4 py-3 text-sm leading-6 text-muted-foreground">
        These settings describe the intended administrative policy for this demo. They do not review clinical content, block a signature, or switch models. Real enforcement has to be implemented in the RoundsAI backend.
      </div>
      <p className="text-xs text-muted-foreground">Last updated {formatCreatedDate(safety.updatedAt)}.</p>
      <fieldset className="grid gap-3">
        <legend className="sr-only">Safety and guardrail settings</legend>
        {settings.map((setting) => (
          <label key={setting.name} className="flex gap-3 rounded-lg border border-border bg-card px-3 py-3">
            <input type="checkbox" className="mt-1 size-4 accent-primary" {...register(setting.name)} />
            <span>
              <span className="block text-sm font-medium">{setting.label}</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">{setting.detail}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <div>
        <Button type="submit">Save safety settings</Button>
      </div>
      <AiConfigConfirmDialog
        open={confirming}
        title="Save safety settings?"
        description="This updates the sample policy in this browser session. It does not guarantee clinical safety."
        confirmLabel="Save settings"
        onOpenChange={setConfirming}
        onConfirm={() => {
          if (pending) {
            save(pending);
          }
        }}
      />
    </form>
  );
}
