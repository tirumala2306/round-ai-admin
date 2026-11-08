"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  dismissOrganizationToast,
  useOrganizationToast,
} from "@/features/organizations/toast-store";

export function OrganizationToast() {
  const toast = useOrganizationToast();

  if (!toast) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 w-[min(24rem,calc(100vw-2rem))]">
      <div
        className="pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm"
        role="status"
      >
        <p className="flex-1 leading-5">{toast.message}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Dismiss notification"
          onClick={dismissOrganizationToast}
        >
          <X />
        </Button>
      </div>
    </div>
  );
}
