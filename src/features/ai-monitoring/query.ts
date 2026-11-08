import type { AiErrorStatus, AiErrorType, MonitoringErrorRecord } from "@/features/ai-monitoring/types";

export const aiErrorPageSize = 5;

export function filterMonitoringErrors(
  errors: MonitoringErrorRecord[],
  search: string,
  errorType: AiErrorType | "All",
  organizationId: string | "All",
  status: AiErrorStatus | "All",
) {
  const query = search.trim().toLowerCase();

  return errors.filter((error) => {
    if (errorType !== "All" && error.errorType !== errorType) {
      return false;
    }
    if (organizationId !== "All" && error.organizationId !== organizationId) {
      return false;
    }
    if (status !== "All" && error.errorStatus !== status) {
      return false;
    }
    if (query.length === 0) {
      return true;
    }
    return [error.errorId, error.organizationName, error.featureLabel, error.modelName, error.errorType]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    rangeStart: items.length === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + pageSize, items.length),
  };
}
