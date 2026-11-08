import type { RecordStatus, TeamListItem } from "@/features/organizations/types";

export const teamPageSize = 5;

export type TeamSortKey =
  | "name"
  | "organization"
  | "department"
  | "members"
  | "status"
  | "createdAt";

export type SortDirection = "asc" | "desc";

export function filterTeams(
  teams: TeamListItem[],
  search: string,
  organizationId: string | "All",
  departmentId: string | "All",
  status: RecordStatus | "All",
) {
  const query = search.trim().toLowerCase();

  return teams.filter((team) => {
    if (organizationId !== "All" && team.organizationId !== organizationId) {
      return false;
    }

    if (departmentId !== "All" && team.departmentId !== departmentId) {
      return false;
    }

    if (status !== "All" && team.status !== status) {
      return false;
    }

    if (query.length === 0) {
      return true;
    }

    return team.name.toLowerCase().includes(query);
  });
}

export function sortTeams(
  teams: TeamListItem[],
  sortKey: TeamSortKey,
  sortDirection: SortDirection,
) {
  const direction = sortDirection === "asc" ? 1 : -1;

  return [...teams].sort(
    (left, right) => compareTeams(left, right, sortKey) * direction,
  );
}

function compareTeams(
  left: TeamListItem,
  right: TeamListItem,
  sortKey: TeamSortKey,
) {
  switch (sortKey) {
    case "name":
      return left.name.localeCompare(right.name);
    case "organization":
      return left.organizationName.localeCompare(right.organizationName);
    case "department":
      return left.departmentName.localeCompare(right.departmentName);
    case "members":
      return left.memberCount - right.memberCount;
    case "status":
      return left.status.localeCompare(right.status);
    case "createdAt":
      return left.createdAt.localeCompare(right.createdAt);
  }
}

export function paginateTeams(teams: TeamListItem[], page: number) {
  const pageCount = Math.max(1, Math.ceil(teams.length / teamPageSize));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const start = (currentPage - 1) * teamPageSize;

  return {
    page: currentPage,
    pageCount,
    items: teams.slice(start, start + teamPageSize),
    rangeStart: teams.length === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + teamPageSize, teams.length),
  };
}
