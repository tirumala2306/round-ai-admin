import type { AiConfiguration } from "@/features/ai-configuration/types";
import type { AiInteraction } from "@/features/ai-interactions/types";
import type { AuditLog } from "@/features/audit-logs/types";
import type { ClinicalTemplate } from "@/features/clinical-templates/types";
import type { KnowledgeBase } from "@/features/knowledge-base/types";
import type { SystemSettings } from "@/features/system-settings/types";

export const organizationTypes = ["Hospital", "Medical Center", "Clinic"] as const;

export const organizationStatuses = ["Active", "Inactive"] as const;

export type OrganizationType = (typeof organizationTypes)[number];
export type OrganizationStatus = (typeof organizationStatuses)[number];
export type RecordStatus = OrganizationStatus;

export type Organization = {
  id: string;
  name: string;
  type: OrganizationType;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  website: string;
  address: string;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
};

export type Department = {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  status: RecordStatus;
  createdAt: string;
};

export type ClinicalTeam = {
  id: string;
  organizationId: string;
  departmentId: string;
  name: string;
  description: string;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
};

export const roleTypes = ["System", "Custom"] as const;

export type RoleType = (typeof roleTypes)[number];

/** A role name stored on the user. System and custom roles share this field. */
export type UserRole = string;

export type AccessRole = {
  id: string;
  name: string;
  description: string;
  type: RoleType;
  permissionIds: string[];
  createdAt: string;
  updatedAt: string;
};

/**
 * A clinician or staff member registered to one organization.
 * Later authentication can add approval fields without changing team membership.
 */
export type OrganizationUser = {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: UserRole;
  status: RecordStatus;
  teamIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type OrganizationDirectory = {
  organizations: Organization[];
  departments: Department[];
  teams: ClinicalTeam[];
  users: OrganizationUser[];
  roles: AccessRole[];
  interactions: AiInteraction[];
  auditLogs: AuditLog[];
  clinicalTemplates: ClinicalTemplate[];
  aiConfiguration: AiConfiguration;
  knowledgeBase: KnowledgeBase;
  systemSettings: SystemSettings;
};

export type UserFormValues = {
  name: string;
  email: string;
  organizationId: string;
  role: UserRole;
  teamIds: string[];
  status: RecordStatus;
};

export type UserListItem = OrganizationUser & {
  organizationName: string;
  teamNames: string[];
  departmentIds: string[];
};

export type UserTeamMembership = {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  organizationId: string;
  organizationName: string;
  status: RecordStatus;
};

export type TeamFormValues = {
  name: string;
  organizationId: string;
  departmentId: string;
  description: string;
  status: RecordStatus;
};

export type TeamListItem = ClinicalTeam & {
  organizationName: string;
  departmentName: string;
  memberCount: number;
};

export type TeamMembership = {
  id: string;
  name: string;
  email: string;
};

export type DepartmentFormValues = {
  name: string;
  organizationId: string;
  description: string;
  status: RecordStatus;
};

export type DepartmentListItem = Department & {
  organizationName: string;
  teamCount: number;
  userCount: number;
};

export type OrganizationFormValues = {
  name: string;
  type: OrganizationType;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  website: string;
  address: string;
  status: OrganizationStatus;
};

export type OrganizationSummary = Organization & {
  departmentCount: number;
  teamCount: number;
  userCount: number;
};

export type TeamSummary = ClinicalTeam & {
  departmentName: string;
  memberCount: number;
};

export type DepartmentSummary = Department & {
  teamCount: number;
  userCount: number;
  teams: TeamSummary[];
};
