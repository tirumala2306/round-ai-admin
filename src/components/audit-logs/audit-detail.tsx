import { AuditModuleBadge, AuditStatusBadge } from "@/components/audit-logs/audit-badges";
import { formatMonitoringStamp } from "@/features/ai-monitoring/format";
import type { AuditLogListItem } from "@/features/audit-logs/types";

export function AuditDetail({ log }: { log: AuditLogListItem }) {
  const entityHeading = log.actionType === "Create" ? "Created record" : "Entity information";

  return (
    <div className="flex flex-col">
      <section className="grid gap-4 border-b border-border px-5 py-5 sm:grid-cols-2">
        <h3 className="text-sm font-semibold text-foreground sm:col-span-2">Event information</h3>
        <Detail label="Event name" value={log.eventName} />
        <Detail label="Event ID" value={log.id} />
        <div>
          <p className="text-xs text-muted-foreground">Status</p>
          <div className="mt-1">
            <AuditStatusBadge status={log.status} />
          </div>
        </div>
        <Detail label="Action type" value={log.actionType} />
        <div>
          <p className="text-xs text-muted-foreground">Module</p>
          <div className="mt-1">
            <AuditModuleBadge module={log.module} />
          </div>
        </div>
        <Detail label="Timestamp" value={formatMonitoringStamp(log.timestamp)} />
      </section>
      <section className="grid gap-4 border-b border-border px-5 py-5 sm:grid-cols-2">
        <h3 className="text-sm font-semibold text-foreground sm:col-span-2">Actor information</h3>
        <Detail label="Actor name" value={log.displayActorName} />
        <Detail label="Email" value={log.displayActorEmail} />
        <Detail label="Role" value={log.displayActorRole} />
      </section>
      <section className="grid gap-4 border-b border-border px-5 py-5 sm:grid-cols-2">
        <h3 className="text-sm font-semibold text-foreground sm:col-span-2">{entityHeading}</h3>
        <Detail label="Entity type" value={log.entityType} />
        <Detail label="Entity name" value={log.displayEntityName} />
        <Detail label="Entity ID" value={log.entityId} />
        <Detail label="Organization" value={log.displayOrganizationName} />
        {log.entityInDirectory ? null : (
          <p className="text-xs leading-5 text-muted-foreground sm:col-span-2">
            This sample entity is not in the current directory.
          </p>
        )}
      </section>
      <section className="grid gap-4 border-b border-border px-5 py-5">
        <h3 className="text-sm font-semibold text-foreground">Additional details</h3>
        {log.description ? (
          <div>
            <p className="text-xs text-muted-foreground">Description</p>
            <p className="mt-1 text-sm leading-6 text-foreground">{log.description}</p>
          </div>
        ) : null}
        {log.ipAddress ? <Detail label="IP address" value={log.ipAddress} /> : null}
        {log.userAgent ? <Detail label="Device" value={log.userAgent} /> : null}
        <p className="text-xs leading-5 text-muted-foreground">
          IP address and device details are synthetic demo values. This history is read-only.
        </p>
      </section>
      {log.changes.length > 0 ? (
        <section className="flex flex-col gap-3 px-5 py-5">
          <h3 className="text-sm font-semibold text-foreground">Change details</h3>
          {log.changes.map((change) => (
            <div key={change.field} className="rounded-md border border-border px-3 py-3">
              <p className="text-xs text-muted-foreground">Field</p>
              <p className="mt-1 text-sm font-medium text-foreground">{change.field}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Before</p>
                  <p className="mt-1 text-sm text-foreground">{change.before}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">After</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{change.after}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : null}
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
