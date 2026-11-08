import type {
  OrganizationStatus,
  OrganizationSummary,
} from "@/features/organizations/types";

export const organizationPageSize = 5;

export type OrganizationSortKey =
  | "name"
  | "type"
  | "departments"
  | "teams"
  | "users"
  | "status"
  | "createdAt";

export type SortDirection = "asc" | "desc";

export function filterOrganizations(
  organizations: OrganizationSummary[],
  search: string,
  status: OrganizationStatus | "All",
) {
  const query = search.trim().toLowerCase();

  return organizations.filter((organization) => {
    if (status !== "All" && organization.status !== status) {
      return false;
    }

    if (query.length === 0) {
      return true;
    }

    return organization.name.toLowerCase().includes(query);
  });
}

export function sortOrganizations(
  organizations: OrganizationSummary[],
  sortKey: OrganizationSortKey,
  sortDirection: SortDirection,
) {
  const direction = sortDirection === "asc" ? 1 : -1;

  return [...organizations].sort((left, right) => {
    const result = compareOrganizations(left, right, sortKey);
    return result * direction;
  });
}

function compareOrganizations(
  left: OrganizationSummary,
  right: OrganizationSummary,
  sortKey: OrganizationSortKey,
) {
  switch (sortKey) {
    case "name":
      return left.name.localeCompare(right.name);
    case "type":
      return left.type.localeCompare(right.type);
    case "departments":
      return left.departmentCount - right.departmentCount;
    case "teams":
      return left.teamCount - right.teamCount;
    case "users":
      return left.userCount - right.userCount;
    case "status":
      return left.status.localeCompare(right.status);
    case "createdAt":
      return left.createdAt.localeCompare(right.createdAt);
  }
}

export function paginateOrganizations(
  organizations: OrganizationSummary[],
  page: number,
) {
  const pageCount = Math.max(
    1,
    Math.ceil(organizations.length / organizationPageSize),
  );
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const start = (currentPage - 1) * organizationPageSize;

  return {
    page: currentPage,
    pageCount,
    items: organizations.slice(start, start + organizationPageSize),
    rangeStart: organizations.length === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + organizationPageSize, organizations.length),
  };
}
