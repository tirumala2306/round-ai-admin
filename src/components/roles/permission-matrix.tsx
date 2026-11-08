"use client";

import { permissionCategories } from "@/features/roles/permissions";

export function PermissionMatrix({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (permissionIds: string[]) => void;
}) {
  const selected = new Set(selectedIds);
  const total = permissionCategories.reduce(
    (count, category) => count + category.permissions.length,
    0,
  );

  function togglePermission(permissionId: string) {
    if (selected.has(permissionId)) {
      onChange(selectedIds.filter((id) => id !== permissionId));
      return;
    }
    onChange([...selectedIds, permissionId]);
  }

  function toggleCategory(categoryId: string) {
    const category = permissionCategories.find((item) => item.id === categoryId);
    if (!category) {
      return;
    }
    const ids = category.permissions.map((permission) => permission.id);
    const allSelected = ids.every((id) => selected.has(id));
    if (allSelected) {
      onChange(selectedIds.filter((id) => !ids.includes(id)));
      return;
    }
    onChange([...new Set([...selectedIds, ...ids])]);
  }

  function selectAll() {
    onChange(
      permissionCategories.flatMap((category) =>
        category.permissions.map((permission) => permission.id),
      ),
    );
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedIds.length} of {total} permissions selected
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
            onClick={selectAll}
          >
            Select all
          </button>
          <button
            type="button"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
            onClick={clearAll}
          >
            Clear all
          </button>
        </div>
      </div>
      <div className="grid gap-3">
        {permissionCategories.map((category) => {
          const ids = category.permissions.map((permission) => permission.id);
          const selectedCount = ids.filter((id) => selected.has(id)).length;
          const allSelected = selectedCount === ids.length;
          const partiallySelected = selectedCount > 0 && !allSelected;

          return (
            <section key={category.id} className="overflow-hidden rounded-lg border border-border">
              <header className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-3 py-2.5">
                <label className="flex min-w-0 items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    className="size-4"
                    checked={allSelected}
                    ref={(node) => {
                      if (node) {
                        node.indeterminate = partiallySelected;
                      }
                    }}
                    onChange={() => toggleCategory(category.id)}
                    aria-label={`Select all ${category.label} permissions`}
                  />
                  <span>{category.label}</span>
                </label>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {selectedCount} of {ids.length}
                </span>
              </header>
              <ul className="grid gap-1 p-2 sm:grid-cols-2">
                {category.permissions.map((permission) => (
                  <li key={permission.id}>
                    <label className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-accent">
                      <input
                        type="checkbox"
                        className="mt-0.5 size-4"
                        checked={selected.has(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                      />
                      <span className="text-sm">{permission.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
