import type { RoleType } from "@/features/organizations/types";
import type { RoleListItem } from "@/features/roles/types";

export const rolePageSize = 5;

export type RoleSortKey =
  | "name"
  | "description"
  | "type"
  | "users"
  | "permissions"
  | "updatedAt";

export type SortDirection = "asc" | "desc";

export function filterRoles(
  roles: RoleListItem[],
  search: string,
  roleType: RoleType | "All",
) {
  const query = search.trim().toLowerCase();

  return roles.filter((role) => {
    if (roleType !== "All" && role.type !== roleType) {
      return false;
    }

    if (query.length === 0) {
      return true;
    }

    return role.name.toLowerCase().includes(query);
  });
}

export function sortRoles(
  roles: RoleListItem[],
  sortKey: RoleSortKey,
  sortDirection: SortDirection,
) {
  const direction = sortDirection === "asc" ? 1 : -1;

  return [...roles].sort(
    (left, right) => compareRoles(left, right, sortKey) * direction,
  );
}

function compareRoles(left: RoleListItem, right: RoleListItem, sortKey: RoleSortKey) {
  switch (sortKey) {
    case "name":
      return left.name.localeCompare(right.name);
    case "description":
      return left.description.localeCompare(right.description);
    case "type":
      return left.type.localeCompare(right.type);
    case "users":
      return left.assignedUserCount - right.assignedUserCount;
    case "permissions":
      return left.permissionCount - right.permissionCount;
    case "updatedAt":
      return left.updatedAt.localeCompare(right.updatedAt);
  }
}

export function paginateRoles(roles: RoleListItem[], page: number) {
  const pageCount = Math.max(1, Math.ceil(roles.length / rolePageSize));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const start = (currentPage - 1) * rolePageSize;

  return {
    page: currentPage,
    pageCount,
    items: roles.slice(start, start + rolePageSize),
    rangeStart: roles.length === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + rolePageSize, roles.length),
  };
}
