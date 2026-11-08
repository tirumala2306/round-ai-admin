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

export function DeleteRoleDialog({
  roleName,
  assignedUsers,
  open,
  onOpenChange,
  onConfirm,
}: {
  roleName?: string;
  assignedUsers: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const blocked = assignedUsers > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {blocked ? `${roleName ?? "This role"} cannot be deleted` : `Delete ${roleName ?? "role"}?`}
          </DialogTitle>
          <DialogDescription>
            {blocked
              ? `${assignedUsers} ${assignedUsers === 1 ? "user is" : "users are"} still assigned to this role. Reassign those users before deleting it. User records stay unchanged.`
              : "This custom role will be removed from the sample list. It has no assigned users."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {blocked ? "Close" : "Cancel"}
          </Button>
          {blocked ? null : (
            <Button type="button" onClick={onConfirm}>
              Delete role
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
