"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { DeactivateDepartmentDialog } from "@/components/departments/deactivate-department-dialog";
import { DepartmentFormDialog } from "@/components/departments/department-form-dialog";
import { DepartmentsTable } from "@/components/departments/departments-table";
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
  filterDepartments,
  paginateDepartments,
  sortDepartments,
  type DepartmentSortKey,
  type SortDirection,
} from "@/features/departments/query";
import {
  addDepartment,
  releaseOrganizationWrite,
  setDepartmentStatus,
  updateDepartment,
  useOrganizationDirectory,
} from "@/features/organizations/demo-store";
import { listDepartments } from "@/features/organizations/selectors";
import { showOrganizationToast } from "@/features/organizations/toast-store";
import { organizationStatuses } from "@/features/organizations/types";
import type {
  Department,
  DepartmentFormValues,
  DepartmentListItem,
  RecordStatus,
} from "@/features/organizations/types";

export function DepartmentsScreen() {
  const directory = useOrganizationDirectory();
  const departments = useMemo(() => listDepartments(directory), [directory]);
  const organizations = useMemo(
    () =>
      [...directory.organizations].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    [directory.organizations],
  );
  const [search, setSearch] = useState("");
  const [organizationId, setOrganizationId] = useState<string | "All">("All");
  const [status, setStatus] = useState<RecordStatus | "All">("All");
  const [sortKey, setSortKey] = useState<DepartmentSortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | undefined>();
  const [pendingDeactivation, setPendingDeactivation] = useState<
    DepartmentListItem | undefined
  >();
  const listRef = useRef<HTMLElement>(null);

  const filtered = useMemo(
    () => filterDepartments(departments, search, organizationId, status),
    [departments, search, organizationId, status],
  );
  const sorted = useMemo(
    () => sortDepartments(filtered, sortKey, sortDirection),
    [filtered, sortKey, sortDirection],
  );
  const pagination = paginateDepartments(sorted, page);
  const counts = countByStatus(departments);
  const filtersActive =
    search.trim().length > 0 || organizationId !== "All" || status !== "All";

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function changeOrganization(value: string | "All") {
    setOrganizationId(value);
    setPage(1);
  }

  function changeStatus(value: RecordStatus | "All") {
    setStatus(value);
    setPage(1);
  }

  function changeSort(key: DepartmentSortKey) {
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

  function openEdit(department: DepartmentListItem) {
    releaseOrganizationWrite();
    setEditing(department);
    setDialogOpen(true);
  }

  function saveDepartment(values: DepartmentFormValues) {
    if (editing) {
      const saved = updateDepartment(editing.id, values);
      if (!saved) {
        releaseOrganizationWrite();
        return;
      }
      showOrganizationToast(`${values.name} was updated in this sample list.`);
    } else {
      const created = addDepartment(values);
      if (!created) {
        releaseOrganizationWrite();
        return;
      }
      showOrganizationToast(`${values.name} was added to this sample list.`);
      setSearch("");
      setOrganizationId("All");
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

  function toggleStatus(department: DepartmentListItem) {
    if (department.status === "Active") {
      setPendingDeactivation(department);
      return;
    }

    setDepartmentStatus(department.id, "Active");
    showOrganizationToast(
      `${department.name} is active in this sample list.`,
    );
  }

  function confirmDeactivation() {
    if (!pendingDeactivation) {
      return;
    }

    setDepartmentStatus(pendingDeactivation.id, "Inactive");
    showOrganizationToast(
      `${pendingDeactivation.name} is inactive in this sample list.`,
    );
    setPendingDeactivation(undefined);
  }

  function clearFilters() {
    setSearch("");
    setOrganizationId("All");
    setStatus("All");
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Manage hospital departments and their clinical teams.
        </p>
        <Button type="button" onClick={openAdd} className="shrink-0">
          <Plus />
          Add department
        </Button>
      </div>
      <section
        aria-label="Sample department counts"
        className="grid gap-3 sm:grid-cols-3"
      >
        <CountCard label="Departments" value={departments.length} />
        <CountCard label="Active" value={counts.Active} />
        <CountCard label="Inactive" value={counts.Inactive} />
      </section>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="grid flex-1 gap-1.5">
          <Label htmlFor="department-search">Search departments</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="department-search"
              value={search}
              onChange={(event) => changeSearch(event.target.value)}
              placeholder="Search by name"
              className="bg-card pl-8"
            />
          </div>
        </div>
        <div className="grid gap-1.5 lg:w-64">
          <Label htmlFor="department-organization-filter">Organization</Label>
          <Select value={organizationId} onValueChange={changeOrganization}>
            <SelectTrigger
              id="department-organization-filter"
              className="w-full bg-card"
            >
              <SelectValue placeholder="All organizations" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="All">All</SelectItem>
              {organizations.map((organization) => (
                <SelectItem key={organization.id} value={organization.id}>
                  {organization.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5 lg:w-48">
          <Label htmlFor="department-status-filter">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => changeStatus(value as RecordStatus | "All")}
          >
            <SelectTrigger
              id="department-status-filter"
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
        {departments.length === 0 ? (
          <EmptyCopy
            title="No departments yet"
            description="Add a department to this browser session. Refreshing the page restores the original sample set."
          />
        ) : pagination.items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="text-base font-semibold tracking-tight">
              No departments match
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              No sample department matches these filters. Clear the filters to
              see the full list.
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
          <DepartmentsTable
            departments={pagination.items}
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
              ? "0 departments"
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
      <DepartmentFormDialog
        open={dialogOpen}
        mode={editing ? "edit" : "add"}
        department={editing}
        directory={directory}
        onOpenChange={setDialogOpen}
        onSubmit={saveDepartment}
      />
      <DeactivateDepartmentDialog
        open={pendingDeactivation !== undefined}
        departmentName={pendingDeactivation?.name}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeactivation(undefined);
          }
        }}
        onConfirm={confirmDeactivation}
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

function countByStatus(departments: DepartmentListItem[]) {
  return departments.reduce(
    (counts, department) => {
      counts[department.status] += 1;
      return counts;
    },
    { Active: 0, Inactive: 0 },
  );
}
