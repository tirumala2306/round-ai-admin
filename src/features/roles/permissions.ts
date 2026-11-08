export type PermissionDefinition = {
  id: string;
  label: string;
};

export type PermissionCategory = {
  id: string;
  label: string;
  permissions: PermissionDefinition[];
};

export const permissionCategories: PermissionCategory[] = [
  {
    id: "organizations",
    label: "Organizations",
    permissions: [
      { id: "organizations.view", label: "View Organizations" },
      { id: "organizations.create", label: "Create Organizations" },
      { id: "organizations.edit", label: "Edit Organizations" },
      { id: "organizations.status", label: "Activate / Deactivate Organizations" },
    ],
  },
  {
    id: "departments",
    label: "Departments",
    permissions: [
      { id: "departments.view", label: "View Departments" },
      { id: "departments.create", label: "Create Departments" },
      { id: "departments.edit", label: "Edit Departments" },
      { id: "departments.status", label: "Activate / Deactivate Departments" },
    ],
  },
  {
    id: "teams",
    label: "Clinical Teams",
    permissions: [
      { id: "teams.view", label: "View Clinical Teams" },
      { id: "teams.create", label: "Create Clinical Teams" },
      { id: "teams.edit", label: "Edit Clinical Teams" },
      { id: "teams.members", label: "Manage Team Members" },
      { id: "teams.status", label: "Activate / Deactivate Clinical Teams" },
    ],
  },
  {
    id: "users",
    label: "Users",
    permissions: [
      { id: "users.view", label: "View Users" },
      { id: "users.create", label: "Create Users" },
      { id: "users.edit", label: "Edit Users" },
      { id: "users.memberships", label: "Manage Team Memberships" },
      { id: "users.status", label: "Activate / Deactivate Users" },
    ],
  },
  {
    id: "roles",
    label: "Roles & Permissions",
    permissions: [
      { id: "roles.view", label: "View Roles" },
      { id: "roles.create", label: "Create Roles" },
      { id: "roles.edit", label: "Edit Roles" },
      { id: "roles.permissions", label: "Manage Permissions" },
      { id: "roles.delete", label: "Delete Custom Roles" },
    ],
  },
  {
    id: "ai-monitoring",
    label: "AI Monitoring",
    permissions: [
      { id: "ai-monitoring.usage", label: "View AI Usage" },
      { id: "ai-monitoring.performance", label: "View AI Performance" },
      { id: "ai-monitoring.errors", label: "View AI Errors" },
      { id: "ai-monitoring.cost", label: "View AI Cost Metrics" },
    ],
  },
  {
    id: "ai-questions",
    label: "AI Questions & Interactions",
    permissions: [
      { id: "ai-questions.view", label: "View AI Interactions" },
      { id: "ai-questions.details", label: "View Conversation Details" },
      { id: "ai-questions.review", label: "Review AI Responses" },
      { id: "ai-questions.flag", label: "Flag AI Responses" },
    ],
  },
  {
    id: "audit-logs",
    label: "Audit Logs",
    permissions: [
      { id: "audit-logs.view", label: "View Audit Logs" },
      { id: "audit-logs.filter", label: "Filter Audit Logs" },
      { id: "audit-logs.export", label: "Export Audit Logs" },
    ],
  },
  {
    id: "knowledge",
    label: "Knowledge Base",
    permissions: [{ id: "knowledge.manage", label: "Manage Knowledge Base" }],
  },
  {
    id: "settings",
    label: "Settings",
    permissions: [
      { id: "settings.view", label: "View Settings" },
      { id: "settings.general", label: "Edit General Settings" },
      { id: "settings.ai", label: "Manage AI Configuration" },
    ],
  },
];

export const allPermissionIds = permissionCategories.flatMap((category) =>
  category.permissions.map((permission) => permission.id),
);

const allowedPermissionIds = new Set(allPermissionIds);

export function sanitizePermissionIds(permissionIds: string[]) {
  return [...new Set(permissionIds.filter((id) => allowedPermissionIds.has(id)))];
}

export function countEnabledCategories(permissionIds: string[]) {
  const selected = new Set(permissionIds);
  return permissionCategories.filter((category) =>
    category.permissions.some((permission) => selected.has(permission.id)),
  ).length;
}

const physicianPermissionIds = [
  "organizations.view",
  "departments.view",
  "teams.view",
  "teams.members",
  "users.view",
  "ai-monitoring.usage",
  "ai-monitoring.performance",
  "ai-monitoring.errors",
  "ai-questions.view",
  "ai-questions.details",
  "ai-questions.review",
  "audit-logs.view",
  "audit-logs.filter",
  "settings.view",
];

const residentPermissionIds = [
  "organizations.view",
  "departments.view",
  "teams.view",
  "users.view",
  "ai-questions.view",
  "ai-questions.details",
  "audit-logs.view",
];

const clinicalStaffPermissionIds = [
  "teams.view",
  "users.view",
  "ai-questions.view",
  "settings.view",
];

export const defaultRolePermissions = {
  hospitalAdmin: allPermissionIds,
  physician: physicianPermissionIds,
  resident: residentPermissionIds,
  clinicalStaff: clinicalStaffPermissionIds,
};
