import { Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { InteractionListItem } from "@/features/ai-interactions/types";

export function InteractionStatusBadge({ status }: { status: InteractionListItem["status"] }) {
  if (status === "Success") {
    return (
      <Badge variant="outline" className="border-transparent bg-success/10 font-normal text-success">
        Success
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="font-normal">
      Failed
    </Badge>
  );
}

export function FeedbackBadge({ feedback }: { feedback: InteractionListItem["feedback"] }) {
  if (feedback === "Positive") {
    return (
      <Badge variant="outline" className="border-transparent bg-success/10 font-normal text-success">
        Positive
      </Badge>
    );
  }

  if (feedback === "Negative") {
    return (
      <Badge variant="destructive" className="font-normal">
        Negative
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="font-normal text-muted-foreground">
      No Feedback
    </Badge>
  );
}

export function ReviewStatusBadge({
  status,
  flagged,
}: {
  status: InteractionListItem["reviewStatus"];
  flagged?: boolean;
}) {
  if (status === "Pending Review") {
    return (
      <Badge variant="outline" className="border-transparent bg-warning/15 font-normal text-warning">
        {flagged ? <Flag className="size-3" aria-hidden="true" /> : null}
        Pending Review
      </Badge>
    );
  }

  if (status === "Under Review") {
    return (
      <Badge variant="outline" className="border-transparent bg-brand/30 font-normal text-foreground">
        {flagged ? <Flag className="size-3" aria-hidden="true" /> : null}
        Under Review
      </Badge>
    );
  }

  if (status === "Reviewed") {
    return (
      <Badge variant="outline" className="border-transparent bg-success/10 font-normal text-success">
        Reviewed
      </Badge>
    );
  }

  if (status === "Dismissed") {
    return (
      <Badge variant="outline" className="font-normal text-muted-foreground">
        Dismissed
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="font-normal text-muted-foreground">
      Not flagged
    </Badge>
  );
}
