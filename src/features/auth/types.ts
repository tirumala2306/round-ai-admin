import type { AccessRole, OrganizationUser } from "@/features/organizations/types";

/**
 * Role names that may enter this admin workspace.
 * "Hospital Admin" is the existing sample role.
 * "Super Admin" is recognized for a later account. No sample user has that role.
 */
export const adminRoleNames = ["Hospital Admin", "Super Admin"] as const;

export type AdminRoleName = (typeof adminRoleNames)[number];

export type AuthContext = {
  user: OrganizationUser;
  organizationName: string;
  roleName: string;
  role: AccessRole | undefined;
  permissionIds: string[];
};

export type DemoSignInResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid" | "not-admin"; message: string };

export type DemoResetResult =
  | { ok: true; message: string }
  | { ok: false; message: string };
