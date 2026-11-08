"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { OrganizationFormDialog } from "@/components/organizations/organization-form-dialog";
import { OrganizationsTable } from "@/components/organizations/organizations-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addOrganization,
  releaseOrganizationWrite,
  setOrganizationStatus,
  updateOrganization,
  useOrganizationDirectory,
} from "@/features/organizations/demo-store";
import {
  filterOrganizations,
  paginateOrganizations,
  sortOrganizations,
  type OrganizationSortKey,
  type SortDirection,
} from "@/features/organizations/query";
import { summarizeOrganizations } from "@/features/organizations/selectors";
import { showOrganizationToast } from "@/features/organizations/toast-store";
import { organizationStatuses } from "@/features/organizations/types";
import type {
  Organization,
  OrganizationFormValues,
  OrganizationStatus,
  OrganizationSummary,
} from "@/features/organizations/types";

export function OrganizationsScreen() {
  const directory = useOrganizationDirectory();
  const organizations = useMemo(
    () => summarizeOrganizations(directory),
    [directory],
  );
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrganizationStatus | "All">("All");
  const [sortKey, setSortKey] = useState<OrganizationSortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Organization | undefined>();
  const listRef = useRef<HTMLElement>(null);

  const filtered = useMemo(
    () => filterOrganizations(organizations, search, status),
    [organizations, search, status],
  );
  const sorted = useMemo(
    () => sortOrganizations(filtered, sortKey, sortDirection),
    [filtered, sortKey, sortDirection],
  );
  const pagination = paginateOrganizations(sorted, page);
  const counts = countByStatus(organizations);
  const filtersActive = search.trim().length > 0 || status !== "All";

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function changeStatus(value: OrganizationStatus | "All") {
    setStatus(value);
    setPage(1);
  }

  function changeSort(key: OrganizationSortKey) {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setPage(1);
  }

  function openAdd() {
    releaseOrganizationWrite();
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(organization: OrganizationSummary) {
    releaseOrganizationWrite();
    setEditing(organization);
    setDialogOpen(true);
  }

  function saveOrganization(values: OrganizationFormValues) {
    if (editing) {
      const saved = updateOrganization(editing.id, values);
      if (!saved) {
        releaseOrganizationWrite();
        return;
      }
      showOrganizationToast(`${values.name} was updated in this sample list.`);
    } else {
      const created = addOrganization(values);
      if (!created) {
        releaseOrganizationWrite();
        return;
      }
      showOrganizationToast(`${values.name} was added to this sample list.`);
      setSearch("");
      setStatus("All");
      setPage(1);
      setSortKey("createdAt");
      setSortDirection("desc");
      requestAnimationFrame(() => {
        listRef.current?.scrollIntoView({ block: "start" });
      });
    }
    releaseOrganizationWrite();
    setDialogOpen(false);
  }

  function toggleStatus(organization: OrganizationSummary) {
    const nextStatus = organization.status === "Active" ? "Inactive" : "Active";
    setOrganizationStatus(organization.id, nextStatus);
    showOrganizationToast(
      nextStatus === "Active"
        ? `${organization.name} is active in this sample list.`
        : `${organization.name} is inactive in this sample list.`,
    );
  }

  function clearFilters() {
    setSearch("");
    setStatus("All");
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Manage hospitals registered on RoundsAI. Each organization contains
          departments, clinical teams, and users.
        </p>
        <Button type="button" onClick={openAdd} className="shrink-0">
          <Plus />
          Add organization
        </Button>
      </div>
      <section
        aria-label="Sample organization counts"
        className="grid gap-3 sm:grid-cols-3"
      >
        <CountCard label="Organizations" value={organizations.length} />
        <CountCard label="Active" value={counts.Active} />
        <CountCard label="Inactive" value={counts.Inactive} />
      </section>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-1.5">
          <Label htmlFor="organization-search">Search organizations</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="organization-search"
              value={search}
              onChange={(event) => changeSearch(event.target.value)}
              placeholder="Search by name"
              className="bg-card pl-8"
            />
          </div>
        </div>
        <div className="grid gap-1.5 sm:w-48">
          <Label htmlFor="organization-status-filter">Status</Label>
          <Select
            value={status}
            onValueChange={(value) =>
              changeStatus(value as OrganizationStatus | "All")
            }
          >
            <SelectTrigger
              id="organization-status-filter"
              className="w-full bg-card"
            >
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="All">All</SelectItem>
              {organizationStatuses.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <section
        ref={listRef}
        className="scroll-mt-20 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
      >
        {organizations.length === 0 ? (
          <EmptyCopy
            title="No organizations yet"
            description="Add a hospital to this browser session. Refreshing the page restores the original sample set."
          />
        ) : pagination.items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="text-base font-semibold tracking-tight">
              No organizations match
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {status === "All"
                ? "No sample organization name matches this search."
                : `No sample organization name matches this search with status ${status}.`}{" "}
              Clear the filters to see the full list.
            </p>
            {filtersActive ? (
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <OrganizationsTable
            organizations={pagination.items}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={changeSort}
            onEdit={openEdit}
            onToggleStatus={toggleStatus}
          />
        )}
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {sorted.length === 0
              ? "0 organizations"
              : `Showing ${pagination.rangeStart}–${pagination.rangeEnd} of ${sorted.length}`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => current - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <p className="min-w-16 text-center text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.pageCount}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => current + 1)}
              disabled={pagination.page >= pagination.pageCount}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
      <OrganizationFormDialog
        open={dialogOpen}
        mode={editing ? "edit" : "add"}
        organization={editing}
        directory={directory}
        onOpenChange={setDialogOpen}
        onSubmit={saveOrganization}
      />
    </div>
  );
}

function EmptyCopy({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-6 py-16 text-center">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {value.toLocaleString("en-US")}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">Sample total</p>
    </article>
  );
}

function countByStatus(organizations: OrganizationSummary[]) {
  return organizations.reduce(
    (counts, organization) => {
      counts[organization.status] += 1;
      return counts;
    },
    { Active: 0, Inactive: 0 },
  );
}
