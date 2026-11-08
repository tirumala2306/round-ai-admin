"use client";

import type { ReactNode } from "react";
import { Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RowActions({
  viewLabel,
  editLabel,
  editDisabled = false,
  onView,
  onEdit,
  children,
}: {
  viewLabel: string;
  editLabel: string;
  editDisabled?: boolean;
  onView: () => void;
  onEdit: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-nowrap items-center justify-end gap-1">
      <Button type="button" variant="ghost" size="icon-sm" aria-label={viewLabel} onClick={onView}>
        <Eye />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={editLabel}
        onClick={onEdit}
        disabled={editDisabled}
      >
        <Pencil />
      </Button>
      {children}
    </div>
  );
}
