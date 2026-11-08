import type { AccessRole, RecordStatus } from "@/features/organizations/types";

export type RoleFormValues = {
  name: string;
  description: string;
  permissionIds: string[];
};

export type RoleListItem = AccessRole & {
  assignedUserCount: number;
  permissionCount: number;
};

export type RoleAssignee = {
  id: string;
  name: string;
  email: string;
  organizationName: string;
  status: RecordStatus;
};
