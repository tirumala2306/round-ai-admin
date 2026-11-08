import type { AccessRole } from "@/features/organizations/types";
import { defaultRolePermissions } from "@/features/roles/permissions";

export const sampleRoles: AccessRole[] = [
  {
    id: "role-hospital-admin",
    name: "Hospital Admin",
    description: "Full administrative access for hospital operations in RoundsAI.",
    type: "System",
    permissionIds: [...defaultRolePermissions.hospitalAdmin],
    createdAt: "2023-09-01",
    updatedAt: "2023-09-01",
  },
  {
    id: "role-physician",
    name: "Physician",
    description:
      "Clinical access for attending physicians, including team membership and AI review.",
    type: "System",
    permissionIds: [...defaultRolePermissions.physician],
    createdAt: "2023-09-01",
    updatedAt: "2023-09-01",
  },
  {
    id: "role-resident",
    name: "Resident",
    description: "Supervised clinical access for physicians in training.",
    type: "System",
    permissionIds: [...defaultRolePermissions.resident],
    createdAt: "2024-03-21",
    updatedAt: "2024-03-21",
  },
  {
    id: "role-clinical-staff",
    name: "Clinical Staff",
    description: "Day-to-day access for nurses and other clinical support staff.",
    type: "System",
    permissionIds: [...defaultRolePermissions.clinicalStaff],
    createdAt: "2024-03-22",
    updatedAt: "2024-03-22",
  },
];
