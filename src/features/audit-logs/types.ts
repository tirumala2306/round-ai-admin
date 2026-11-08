export const auditModules = [
  "Organizations",
  "Departments",
  "Clinical Teams",
  "Users",
  "Roles & Permissions",
  "AI Monitoring",
  "AI Interactions",
  "Settings",
] as const;

export type AuditModule = (typeof auditModules)[number];

export const auditActionTypes = [
  "Create",
  "Update",
  "Delete",
  "Activate",
  "Deactivate",
  "Review",
  "Assign",
] as const;

export type AuditActionType = (typeof auditActionTypes)[number];

export const auditStatuses = ["Success", "Failed"] as const;

export type AuditStatus = (typeof auditStatuses)[number];

export const auditDateRanges = ["all", "24h", "7d", "30d"] as const;

export type AuditDateRange = (typeof auditDateRanges)[number];

/** Sample clock shared with AI Monitoring so server and browser windows match. */
export const auditAsOf = "2026-11-05T17:00:00.000Z";

export type AuditChange = {
  field: string;
  before: string;
  after: string;
};

/**
 * One immutable administrative event.
 * actorId and organizationId point at the shared directory.
 * Names are recorded snapshots so a later API can return the row on its own.
 */
export type AuditLog = {
  id: string;
  eventName: string;
  actionType: AuditActionType;
  module: AuditModule;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  organizationId: string;
  organizationName: string;
  entityType: string;
  entityId: string;
  entityName: string;
  description: string;
  status: AuditStatus;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  changes: AuditChange[];
};

export type AuditLogListItem = AuditLog & {
  displayActorName: string;
  displayActorEmail: string;
  displayActorRole: string;
  displayOrganizationName: string;
  displayEntityName: string;
  entityInDirectory: boolean;
};

export type AuditSummary = {
  total: number;
  successful: number;
  failed: number;
  uniqueActors: number;
};

export type AuditFilters = {
  search: string;
  organizationId: string;
  module: AuditModule | "All";
  actionType: AuditActionType | "All";
  status: AuditStatus | "All";
  range: AuditDateRange;
};
