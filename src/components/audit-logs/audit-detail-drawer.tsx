"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AuditDetail } from "@/components/audit-logs/audit-detail";
import type { AuditLogListItem } from "@/features/audit-logs/types";
import { showOrganizationToast } from "@/features/organizations/toast-store";

function copyWithSelection(value: string) {
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "-9999px";
  document.body.append(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  return copied;
}

export function AuditDetailDrawer({
  log,
  open,
  onOpenChange,
}: {
  log?: AuditLogListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  async function copyEventId() {
    if (!log) {
      return;
    }
    try {
      await navigator.clipboard.writeText(log.id);
      showOrganizationToast("Event ID copied.");
      return;
    } catch {
      const copied = copyWithSelection(log.id);
      showOrganizationToast(copied ? "Event ID copied." : "The event ID could not be copied.");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="border-b border-border px-5 py-4 pr-12">
          <SheetTitle>{log?.eventName ?? "Audit event"}</SheetTitle>
          <SheetDescription>
            Synthetic sample event for administrative review. This record cannot be edited or deleted.
          </SheetDescription>
        </SheetHeader>
        {log ? (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3">
              <p className="text-sm font-medium text-foreground">{log.id}</p>
              <Button type="button" variant="outline" size="sm" onClick={copyEventId}>
                <Copy />
                Copy event ID
              </Button>
            </div>
            <AuditDetail log={log} />
          </>
        ) : (
          <p className="px-5 py-6 text-sm text-muted-foreground">This sample event is no longer in the list.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
