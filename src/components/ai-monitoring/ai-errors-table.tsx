"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { aiErrorTypeOptions } from "@/features/ai-monitoring/catalog";
import { formatCount, formatLatency, formatMoney, formatMonitoringStamp } from "@/features/ai-monitoring/format";
import { aiErrorPageSize, filterMonitoringErrors, paginateItems } from "@/features/ai-monitoring/query";
import type { AiErrorStatus, AiErrorType, MonitoringErrorRecord } from "@/features/ai-monitoring/types";
import type { Organization } from "@/features/organizations/types";

const statuses: AiErrorStatus[] = ["Open", "Acknowledged", "Resolved"];

export function AiErrorsTable({
  errors,
  organizations,
}: {
  errors: MonitoringErrorRecord[];
  organizations: Organization[];
}) {
  const [search, setSearch] = useState("");
  const [errorType, setErrorType] = useState<AiErrorType | "All">("All");
  const [organizationId, setOrganizationId] = useState<string | "All">("All");
  const [status, setStatus] = useState<AiErrorStatus | "All">("All");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string>();

  const filtered = filterMonitoringErrors(errors, search, errorType, organizationId, status);
  const pagination = paginateItems(filtered, page, aiErrorPageSize);
  const selected = errors.find((error) => error.errorId === selectedId);

  return (
    <section className="min-w-0 rounded-lg border border-border bg-card shadow-sm">
      <header className="border-b border-border px-4 py-4">
        <h2 className="text-base font-semibold tracking-tight">AI errors</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Synthetic failure records only. They do not include patient names, records, or clinical content.
        </p>
      </header>
      <div className="grid gap-3 border-b border-border p-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="grid gap-1.5 md:col-span-2 xl:col-span-1">
          <Label htmlFor="ai-error-search">Search errors</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="ai-error-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by id, feature, or model"
              className="bg-card pl-8"
            />
          </div>
        </div>
        <FilterSelect
          id="ai-error-type"
          label="Error type"
          value={errorType}
          onChange={(value) => {
            setErrorType(value as AiErrorType | "All");
            setPage(1);
          }}
          options={[{ value: "All", label: "All types" }, ...aiErrorTypeOptions.map((type) => ({ value: type, label: type }))]}
        />
        <FilterSelect
          id="ai-error-organization"
          label="Organization"
          value={organizationId}
          onChange={(value) => {
            setOrganizationId(value);
            setPage(1);
          }}
          options={[
            { value: "All", label: "All organizations" },
            ...[...organizations]
              .sort((left, right) => left.name.localeCompare(right.name))
              .map((organization) => ({ value: organization.id, label: organization.name })),
          ]}
        />
        <FilterSelect
          id="ai-error-status"
          label="Status"
          value={status}
          onChange={(value) => {
            setStatus(value as AiErrorStatus | "All");
            setPage(1);
          }}
          options={[{ value: "All", label: "All statuses" }, ...statuses.map((item) => ({ value: item, label: item }))]}
        />
      </div>
      {filtered.length === 0 ? (
        <p className="px-4 py-8 text-sm text-muted-foreground">
          {errors.length === 0
            ? "No sample errors in this view."
            : "No sample errors match these filters."}
        </p>
      ) : (
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <caption className="sr-only">Synthetic AI error records for the current filters.</caption>
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Error ID</th>
                <th className="px-4 py-2.5 font-medium">Timestamp</th>
                <th className="px-4 py-2.5 font-medium">Organization</th>
                <th className="px-4 py-2.5 font-medium">AI feature</th>
                <th className="px-4 py-2.5 font-medium">Model</th>
                <th className="px-4 py-2.5 font-medium">Error type</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {pagination.items.map((error) => (
                <tr key={error.errorId} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{error.errorId}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatMonitoringStamp(error.occurredAt)}</td>
                  <td className="px-4 py-3">{error.organizationName}</td>
                  <td className="px-4 py-3">{error.featureLabel}</td>
                  <td className="px-4 py-3">{error.modelName}</td>
                  <td className="px-4 py-3">{error.errorType}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={error.errorStatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button type="button" variant="outline" size="sm" onClick={() => setSelectedId(error.errorId)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {filtered.length === 0
            ? "0 errors"
            : `Showing ${pagination.rangeStart}–${pagination.rangeEnd} of ${filtered.length}`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage(pagination.page - 1)}
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
            onClick={() => setPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.pageCount}
          >
            Next
          </Button>
        </div>
      </div>
      <Dialog open={selected !== undefined} onOpenChange={(open) => !open && setSelectedId(undefined)}>
        <DialogContent className="sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.errorId}</DialogTitle>
                <DialogDescription>
                  Sample error detail. This record is not from a live provider and contains no patient information.
                </DialogDescription>
              </DialogHeader>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Detail label="Timestamp" value={formatMonitoringStamp(selected.occurredAt)} />
                <Detail label="Status" value={selected.errorStatus} />
                <Detail label="Organization" value={selected.organizationName} />
                <Detail label="AI feature" value={selected.featureLabel} />
                <Detail label="Model" value={selected.modelName} />
                <Detail label="Provider" value={selected.provider} />
                <Detail label="Error type" value={selected.errorType} />
                <Detail label="Latency" value={formatLatency(selected.latencyMs)} />
                <Detail label="Input tokens" value={formatCount(selected.inputTokens)} />
                <Detail label="Output tokens" value={formatCount(selected.outputTokens)} />
                <Detail label="Estimated cost" value={formatMoney(selected.estimatedCost)} />
                <Detail label="Request ID" value={selected.requestId} />
              </dl>
              <p className="text-sm leading-6 text-muted-foreground">{selected.errorDetail}</p>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedId(undefined)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function StatusBadge({ status }: { status: AiErrorStatus }) {
  if (status === "Resolved") {
    return (
      <Badge variant="outline" className="border-transparent bg-success/10 font-normal text-success">
        Resolved
      </Badge>
    );
  }

  if (status === "Acknowledged") {
    return (
      <Badge variant="outline" className="border-transparent bg-warning/15 font-normal text-warning">
        Acknowledged
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="font-normal">
      Open
    </Badge>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}
