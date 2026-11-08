import { Badge } from "@/components/ui/badge";
import type { KnowledgeReviewStatus } from "@/features/knowledge-base/types";

const tones: Record<KnowledgeReviewStatus, string> = {
  Draft: "font-normal text-muted-foreground",
  "Pending Review": "border-transparent bg-muted font-normal text-foreground",
  Approved: "border-transparent bg-success/10 font-normal text-success",
  Rejected: "border-transparent bg-destructive/10 font-normal text-destructive",
  Archived: "font-normal text-muted-foreground",
};

export function ReviewStatusBadge({ status }: { status: KnowledgeReviewStatus }) {
  return (
    <Badge variant="outline" className={tones[status]}>
      {status}
    </Badge>
  );
}
