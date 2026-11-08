import type {
  DepartmentListItem,
  RecordStatus,
} from "@/features/organizations/types";

export const departmentPageSize = 5;

export type DepartmentSortKey =
  | "name"
  | "organization"
  | "teams"
  | "users"
  | "status"
  | "createdAt";

export type SortDirection = "asc" | "desc";

export function filterDepartments(
  departments: DepartmentListItem[],
  search: string,
  organizationId: string | "All",
  status: RecordStatus | "All",
) {
  const query = search.trim().toLowerCase();

  return departments.filter((department) => {
    if (organizationId !== "All" && department.organizationId !== organizationId) {
      return false;
    }

    if (status !== "All" && department.status !== status) {
      return false;
    }

    if (query.length === 0) {
      return true;
    }

    return department.name.toLowerCase().includes(query);
  });
}

export function sortDepartments(
  departments: DepartmentListItem[],
  sortKey: DepartmentSortKey,
  sortDirection: SortDirection,
) {
  const direction = sortDirection === "asc" ? 1 : -1;

  return [...departments].sort((left, right) => {
    const result = compareDepartments(left, right, sortKey);
    return result * direction;
  });
}

function compareDepartments(
  left: DepartmentListItem,
  right: DepartmentListItem,
  sortKey: DepartmentSortKey,
) {
  switch (sortKey) {
    case "name":
      return left.name.localeCompare(right.name);
    case "organization":
      return left.organizationName.localeCompare(right.organizationName);
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

export function paginateDepartments(
  departments: DepartmentListItem[],
  page: number,
) {
  const pageCount = Math.max(1, Math.ceil(departments.length / departmentPageSize));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const start = (currentPage - 1) * departmentPageSize;

  return {
    page: currentPage,
    pageCount,
    items: departments.slice(start, start + departmentPageSize),
    rangeStart: departments.length === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + departmentPageSize, departments.length),
  };
}
