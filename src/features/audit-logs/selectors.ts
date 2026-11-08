import type { AuditLog, AuditLogListItem, AuditSummary } from "@/features/audit-logs/types";
import type { OrganizationDirectory } from "@/features/organizations/types";

const unknownActor = "Unknown actor";
const unknownEmail = "Not available";
const unknownRole = "Not available";
const unknownOrganization = "Unknown organization";
const unknownEntity = "Unknown entity";

export function listAuditLogs(directory: OrganizationDirectory): AuditLogListItem[] {
  return directory.auditLogs.map((log) => toAuditListItem(log, directory));
}

export function summarizeAuditLogs(logs: AuditLogListItem[]): AuditSummary {
  return {
    total: logs.length,
    successful: logs.filter((log) => log.status === "Success").length,
    failed: logs.filter((log) => log.status === "Failed").length,
    uniqueActors: new Set(logs.map((log) => log.actorId)).size,
  };
}

export function toAuditListItem(log: AuditLog, directory: OrganizationDirectory): AuditLogListItem {
  const user = directory.users.find((item) => item.id === log.actorId);
  const organization = directory.organizations.find((item) => item.id === log.organizationId);

  return {
    ...log,
    displayActorName: user?.name || log.actorName || unknownActor,
    displayActorEmail: user?.email || log.actorEmail || unknownEmail,
    displayActorRole: user?.role || log.actorRole || unknownRole,
    displayOrganizationName: organization?.name || log.organizationName || unknownOrganization,
    displayEntityName: log.entityName || unknownEntity,
    entityInDirectory: entityInDirectory(directory, log.entityId),
  };
}

function entityInDirectory(directory: OrganizationDirectory, entityId: string) {
  return (
    directory.organizations.some((item) => item.id === entityId) ||
    directory.departments.some((item) => item.id === entityId) ||
    directory.teams.some((item) => item.id === entityId) ||
    directory.users.some((item) => item.id === entityId) ||
    directory.roles.some((item) => item.id === entityId) ||
    directory.interactions.some((item) => item.id === entityId)
  );
}
