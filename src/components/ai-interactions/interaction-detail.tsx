import {
  FeedbackBadge,
  InteractionStatusBadge,
  ReviewStatusBadge,
} from "@/components/ai-interactions/interaction-badges";
import { formatCount, formatLatency, formatMoney, formatMonitoringStamp } from "@/features/ai-monitoring/format";
import type { InteractionListItem } from "@/features/ai-interactions/types";

export function InteractionDetail({ interaction }: { interaction: InteractionListItem }) {
  return (
    <div className="flex flex-col">
      <section className="grid gap-4 border-b border-border px-5 py-5 sm:grid-cols-2">
        <h3 className="sm:col-span-2 text-sm font-semibold text-foreground">Interaction information</h3>
        <Detail label="Interaction ID" value={interaction.id} />
        <Detail label="Timestamp" value={formatMonitoringStamp(interaction.timestamp)} />
        <Detail label="User" value={interaction.userName} />
        <Detail label="Organization" value={interaction.organizationName} />
        <Detail label="AI Feature" value={interaction.featureLabel} />
        <Detail label="AI Model" value={interaction.modelName} />
        <Detail label="Provider" value={interaction.provider} />
        <Detail label="Response Time" value={formatLatency(interaction.responseTimeMs)} />
        <Detail label="Input Tokens" value={formatCount(interaction.inputTokens)} />
        <Detail label="Output Tokens" value={formatCount(interaction.outputTokens)} />
        <div>
          <p className="text-xs text-muted-foreground">Interaction Status</p>
          <div className="mt-1">
            <InteractionStatusBadge status={interaction.status} />
          </div>
        </div>
      </section>
      <section className="border-b border-border px-5 py-5">
        <h3 className="text-sm font-semibold text-foreground">User question</h3>
        <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-foreground">{interaction.question}</p>
      </section>
      <section className="border-b border-border px-5 py-5">
        <h3 className="text-sm font-semibold text-foreground">AI generated response</h3>
        <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-foreground">{interaction.response}</p>
      </section>
      <section className="grid gap-4 border-b border-border px-5 py-5 sm:grid-cols-2">
        <h3 className="sm:col-span-2 text-sm font-semibold text-foreground">Response metadata</h3>
        <Detail label="Model" value={interaction.modelName} />
        <Detail label="Provider" value={interaction.provider} />
        <Detail label="Response latency" value={formatLatency(interaction.responseTimeMs)} />
        <Detail
          label="Token usage"
          value={`${formatCount(interaction.inputTokens)} in · ${formatCount(interaction.outputTokens)} out`}
        />
        <Detail label="Estimated cost" value={formatMoney(interaction.estimatedCost)} />
        <div>
          <p className="text-xs text-muted-foreground">Response status</p>
          <div className="mt-1">
            <InteractionStatusBadge status={interaction.status} />
          </div>
        </div>
        <p className="sm:col-span-2 text-xs leading-5 text-muted-foreground">
          Estimated from sample token rates. This figure is not an invoice.
        </p>
      </section>
      <section className="border-b border-border px-5 py-5">
        <h3 className="text-sm font-semibold text-foreground">Feedback</h3>
        <div className="mt-2">
          <FeedbackBadge feedback={interaction.feedback} />
        </div>
        <p className="mt-2 text-sm leading-6 text-foreground">
          {interaction.feedbackComment || "No sample comment was left with this feedback."}
        </p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Feedback records a sample user reaction. It does not mark the response as medically correct or incorrect.
        </p>
      </section>
      <section className="grid gap-4 px-5 py-5 sm:grid-cols-2">
        <h3 className="sm:col-span-2 text-sm font-semibold text-foreground">Review information</h3>
        <div>
          <p className="text-xs text-muted-foreground">Review status</p>
          <div className="mt-1">
            <ReviewStatusBadge status={interaction.reviewStatus} flagged={interaction.flagged} />
          </div>
        </div>
        <Detail label="Flag reason" value={interaction.flagReason ?? "Not flagged"} />
        <Detail
          label="Last reviewed"
          value={interaction.reviewedAt ? formatMonitoringStamp(interaction.reviewedAt) : "Not reviewed"}
        />
        <div className="sm:col-span-2">
          <p className="text-xs text-muted-foreground">Review notes</p>
          <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-foreground">
            {interaction.reviewNotes || "No review notes yet."}
          </p>
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
