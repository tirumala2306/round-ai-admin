import { Badge } from "@/components/ui/badge";
import { auditLogsModule } from "@/features/audit-logs";
import { auditAsOf } from "@/features/audit-logs/types";
import { formatMonitoringStamp } from "@/features/ai-monitoring/format";

export function AuditHeader() {
  return (
    <div className="max-w-2xl">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge variant="outline">Demo data</Badge>
        <p className="text-xs text-muted-foreground">Sample snapshot · {formatMonitoringStamp(auditAsOf)}</p>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{auditLogsModule.summary}</p>
    </div>
  );
}
