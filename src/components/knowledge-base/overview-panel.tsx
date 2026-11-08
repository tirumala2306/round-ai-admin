import { ReviewStatusBadge } from "@/components/knowledge-base/review-badge";
import { knowledgeReviewStatuses } from "@/features/knowledge-base";
import { summarizeKnowledge } from "@/features/knowledge-base/selectors";
import type { KnowledgeBase } from "@/features/knowledge-base/types";
import { formatCreatedDate } from "@/features/organizations/format";

export function OverviewPanel({ knowledge }: { knowledge: KnowledgeBase }) {
  const summary = summarizeKnowledge(knowledge);
  const distribution = knowledgeReviewStatuses.map((status) => ({
    status,
    count: knowledge.documents.filter((document) => document.reviewStatus === status).length,
  }));

  return (
    <div className="grid gap-6">
      <section aria-label="Sample knowledge counts" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <CountCard label="Total Documents" value={summary.totalDocuments} />
        <CountCard label="Approved Documents" value={summary.approvedDocuments} />
        <CountCard label="Pending Review" value={summary.pendingReview} />
        <CountCard label="Clinical Guidelines" value={summary.guidelineCount} />
        <CountCard label="Active Knowledge Sources" value={summary.activeSources} />
      </section>
      <p className="text-sm leading-6 text-muted-foreground">
        Counts are demo totals for this browser session. Pending Review counts documents only. Approval does not
        clinically verify a record.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Recently added documents</h2>
          <ul className="mt-3 grid gap-3">
            {summary.recentDocuments.map((document) => (
              <li key={document.id} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{document.title}</p>
                  <p className="text-xs text-muted-foreground">Uploaded {formatCreatedDate(document.uploadedAt)}</p>
                </div>
                <ReviewStatusBadge status={document.reviewStatus} />
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Recently reviewed documents</h2>
          <ul className="mt-3 grid gap-3">
            {summary.recentlyReviewed.map(({ document, reviewedAt }) => (
              <li key={document.id} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{document.title}</p>
                  <p className="text-xs text-muted-foreground">Reviewed {formatCreatedDate(reviewedAt)}</p>
                </div>
                <ReviewStatusBadge status={document.reviewStatus} />
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Documents by category</h2>
          <ul className="mt-3 grid gap-2">
            {summary.documentsByCategory.map((category) => (
              <li key={category.id} className="flex items-center justify-between text-sm">
                <span>{category.name}</span>
                <span className="tabular-nums text-muted-foreground">{category.count}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Document review status</h2>
          <ul className="mt-3 grid gap-2">
            {distribution.map((item) => (
              <li key={item.status} className="flex items-center justify-between gap-3 text-sm">
                <ReviewStatusBadge status={item.status} />
                <span className="tabular-nums text-muted-foreground">{item.count}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value.toLocaleString("en-US")}</p>
      <p className="mt-1 text-xs text-muted-foreground">Sample total</p>
    </article>
  );
}
