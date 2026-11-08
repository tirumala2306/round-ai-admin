import { Badge } from "@/components/ui/badge";
import type { AuditLogListItem } from "@/features/audit-logs/types";

export function AuditStatusBadge({ status }: { status: AuditLogListItem["status"] }) {
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

export function AuditModuleBadge({ module }: { module: AuditLogListItem["module"] }) {
  return (
    <Badge variant="outline" className="font-normal">
      {module}
    </Badge>
  );
}
