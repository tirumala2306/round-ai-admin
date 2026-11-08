import { Button } from "@/components/ui/button";

export function ListFooter({
  emptyLabel,
  rangeStart,
  rangeEnd,
  total,
  page,
  pageCount,
  onPage,
}: {
  emptyLabel: string;
  rangeStart: number;
  rangeEnd: number;
  total: number;
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        {total === 0 ? emptyLabel : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => onPage(page - 1)} disabled={page <= 1}>
          Previous
        </Button>
        <p className="min-w-16 text-center text-xs text-muted-foreground">
          Page {page} of {pageCount}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPage(page + 1)}
          disabled={page >= pageCount}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
