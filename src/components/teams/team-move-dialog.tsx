"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TeamMembership } from "@/features/organizations/types";

export function TeamMoveDialog({
  open,
  teamName,
  organizationName,
  members,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  teamName: string;
  organizationName: string;
  members: TeamMembership[];
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Members cannot move with {teamName}</DialogTitle>
          <DialogDescription>
            These people belong to another organization. Their organization
            will not be changed. Remove them from this team before moving it
            to {organizationName}.
          </DialogDescription>
        </DialogHeader>
        <ul className="max-h-48 overflow-y-auto rounded-lg border border-border text-sm">
          {members.map((member) => (
            <li key={member.id} className="border-b border-border px-3 py-2 last:border-0">
              <p className="font-medium">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.email}</p>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm}>
            Remove members and move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
