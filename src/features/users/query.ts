import type { RecordStatus, UserListItem } from "@/features/organizations/types";

export const userPageSize = 5;

export type UserSortKey =
  | "name"
  | "email"
  | "organization"
  | "teams"
  | "role"
  | "status"
  | "createdAt";

export type SortDirection = "asc" | "desc";

export function filterUsers(
  users: UserListItem[],
  search: string,
  organizationId: string | "All",
  departmentId: string | "All",
  teamId: string | "All",
  role: string | "All",
  status: RecordStatus | "All",
) {
  const query = search.trim().toLowerCase();

  return users.filter((user) => {
    if (organizationId !== "All" && user.organizationId !== organizationId) {
      return false;
    }

    if (departmentId !== "All" && !user.departmentIds.includes(departmentId)) {
      return false;
    }

    if (teamId !== "All" && !user.teamIds.includes(teamId)) {
      return false;
    }

    if (role !== "All" && user.role !== role) {
      return false;
    }

    if (status !== "All" && user.status !== status) {
      return false;
    }

    if (query.length === 0) {
      return true;
    }

    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });
}

export function sortUsers(
  users: UserListItem[],
  sortKey: UserSortKey,
  sortDirection: SortDirection,
) {
  const direction = sortDirection === "asc" ? 1 : -1;

  return [...users].sort(
    (left, right) => compareUsers(left, right, sortKey) * direction,
  );
}

function compareUsers(left: UserListItem, right: UserListItem, sortKey: UserSortKey) {
  switch (sortKey) {
    case "name":
      return left.name.localeCompare(right.name);
    case "email":
      return left.email.localeCompare(right.email);
    case "organization":
      return left.organizationName.localeCompare(right.organizationName);
    case "teams":
      return left.teamNames.length - right.teamNames.length;
    case "role":
      return left.role.localeCompare(right.role);
    case "status":
      return left.status.localeCompare(right.status);
    case "createdAt":
      return left.createdAt.localeCompare(right.createdAt);
  }
}

export function paginateUsers(users: UserListItem[], page: number) {
  const pageCount = Math.max(1, Math.ceil(users.length / userPageSize));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const start = (currentPage - 1) * userPageSize;

  return {
    page: currentPage,
    pageCount,
    items: users.slice(start, start + userPageSize),
    rangeStart: users.length === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + userPageSize, users.length),
  };
}
