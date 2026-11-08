import { allPermissionIds } from "@/features/roles/permissions";
import type { RoleAssignee, RoleListItem } from "@/features/roles/types";
import type { OrganizationDirectory } from "@/features/organizations/types";

const knownPermissionIds = new Set(allPermissionIds);

export function listRoles(directory: OrganizationDirectory): RoleListItem[] {
  return directory.roles.map((role) => ({
    ...role,
    assignedUserCount: directory.users.filter((user) => user.role === role.name)
      .length,
    permissionCount: role.permissionIds.filter((id) => knownPermissionIds.has(id))
      .length,
  }));
}

export function listRoleAssignees(
  directory: OrganizationDirectory,
  roleName: string,
): RoleAssignee[] {
  return directory.users
    .filter((user) => user.role === roleName)
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      organizationName:
        directory.organizations.find((item) => item.id === user.organizationId)
          ?.name ?? "Unknown organization",
      status: user.status,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function hasDuplicateRoleName(
  directory: OrganizationDirectory,
  name: string,
  exceptRoleId?: string,
) {
  const normalized = name.trim().toLowerCase();

  return directory.roles.some(
    (role) =>
      role.id !== exceptRoleId && role.name.trim().toLowerCase() === normalized,
  );
}

export function summarizeRoles(directory: OrganizationDirectory) {
  const roles = listRoles(directory);

  return {
    total: roles.length,
    system: roles.filter((role) => role.type === "System").length,
    custom: roles.filter((role) => role.type === "Custom").length,
    assignedUsers: directory.users.filter((user) =>
      roles.some((role) => role.name === user.role),
    ).length,
  };
}
