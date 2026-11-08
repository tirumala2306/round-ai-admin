"use client";

import { useSyncExternalStore } from "react";
import { todayIsoDate } from "@/features/organizations/format";
import {
  hasDuplicateDepartmentName,
  hasDuplicateEmail,
  hasDuplicateOrganizationName,
  hasDuplicateTeamName,
  incompatibleTeamMembers,
  incompatibleUserTeams,
  placeDepartmentInOrganization,
} from "@/features/organizations/selectors";
import { sanitizePermissionIds } from "@/features/roles/permissions";
import { hasDuplicateRoleName } from "@/features/roles/selectors";
import type { RoleFormValues } from "@/features/roles/types";
import {
  modelFieldIssues,
  providerActivationIssue,
  providerFieldIssues,
  taskFieldIssues,
  usageLimitIssues,
  activeTasksForModel,
  activeTasksForProvider,
} from "@/features/ai-configuration/selectors";
import type {
  AiConfigStatus,
  AiConfigWriteResult,
  AiConfiguration,
  AiModel,
  AiModelFormValues,
  AiProvider,
  AiProviderFormValues,
  AiSafetyFormValues,
  AiTaskFormValues,
  AiTaskId,
  AiUsageLimitsFormValues,
} from "@/features/ai-configuration/types";
import { sampleInteractions } from "@/features/ai-interactions/sample-data";
import type { FlagReason, ReviewStatus } from "@/features/ai-interactions/types";
import { hasDuplicateClinicalTemplateName } from "@/features/clinical-templates/selectors";
import {
  categoryFieldIssues,
  documentFieldIssues,
  evidenceFieldIssues,
  guidelineFieldIssues,
  nextKnowledgeReviewStatus,
  reviewActionIssue,
  sourceFieldIssues,
  tagFieldIssues,
} from "@/features/knowledge-base/selectors";
import type {
  ClinicalGuidelineRecord,
  EvidenceFormValues,
  EvidenceRecord,
  GuidelineFormValues,
  KnowledgeActiveStatus,
  KnowledgeBase,
  KnowledgeCategory,
  KnowledgeCategoryFormValues,
  KnowledgeDocument,
  KnowledgeDocumentFormValues,
  KnowledgeReviewAction,
  KnowledgeReviewEvent,
  KnowledgeReviewStatus,
  KnowledgeSource,
  KnowledgeSourceFormValues,
  KnowledgeTag,
  KnowledgeTagFormValues,
  KnowledgeWriteResult,
} from "@/features/knowledge-base/types";
import type {
  ClinicalTemplate,
  ClinicalTemplateFormValues,
  ClinicalTemplateStatus,
} from "@/features/clinical-templates/types";
import { clinicalTemplateIssue } from "@/features/system-settings/selectors";
import {
  applicationPreferencesSchema,
  generalSettingsSchema,
  securitySettingsSchema,
  sessionSettingsSchema,
} from "@/features/system-settings/schema";
import type {
  ApplicationPreferencesFormValues,
  ClinicalWorkflowFormValues,
  GeneralSettingsFormValues,
  SecuritySettingsFormValues,
  SessionSettingsFormValues,
  SystemSettings,
  SystemSettingsWriteResult,
} from "@/features/system-settings/types";
import { sampleDirectory } from "@/features/organizations/sample-data";
import type {
  AccessRole,
  ClinicalTeam,
  Department,
  DepartmentFormValues,
  Organization,
  OrganizationDirectory,
  OrganizationFormValues,
  OrganizationStatus,
  OrganizationUser,
  RecordStatus,
  TeamFormValues,
  TeamMembership,
  UserFormValues,
} from "@/features/organizations/types";

/**
 * In-memory demo directory shared by the organization and department screens.
 * This is not an API and nothing is sent to a server.
 * A refresh restores the original sample records.
 */
let directory: OrganizationDirectory = sampleDirectory;
const listeners = new Set<() => void>();
let writeClaimed = false;

export function claimOrganizationWrite() {
  if (writeClaimed) {
    return false;
  }

  writeClaimed = true;
  return true;
}

export function releaseOrganizationWrite() {
  writeClaimed = false;
}

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return directory;
}

function getServerSnapshot() {
  return sampleDirectory;
}

const subscribeToClient = () => () => {};

export function useIsClient() {
  return useSyncExternalStore(subscribeToClient, () => true, () => false);
}

export function useOrganizationDirectory() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useOrganization(organizationId: string) {
  return useOrganizationDirectory().organizations.find(
    (organization) => organization.id === organizationId,
  );
}

export function addOrganization(
  values: OrganizationFormValues,
): Organization | undefined {
  if (hasDuplicateOrganizationName(directory, values.name)) {
    return undefined;
  }

  const today = todayIsoDate();
  const organization: Organization = {
    ...values,
    id: createOrganizationId(values.name),
    createdAt: today,
    updatedAt: today,
  };

  directory = {
    ...directory,
    organizations: [organization, ...directory.organizations],
  };
  emit();
  return organization;
}

export function updateOrganization(
  organizationId: string,
  values: OrganizationFormValues,
) {
  if (hasDuplicateOrganizationName(directory, values.name, organizationId)) {
    return false;
  }

  directory = {
    ...directory,
    organizations: directory.organizations.map((organization) =>
      organization.id === organizationId
        ? {
            ...organization,
            ...values,
            updatedAt: todayIsoDate(),
          }
        : organization,
    ),
  };
  emit();
  return true;
}

export function setOrganizationStatus(
  organizationId: string,
  status: OrganizationStatus,
) {
  directory = {
    ...directory,
    organizations: directory.organizations.map((organization) =>
      organization.id === organizationId
        ? {
            ...organization,
            status,
            updatedAt: todayIsoDate(),
          }
        : organization,
    ),
  };
  emit();
}

export function addDepartment(
  values: DepartmentFormValues,
): Department | undefined {
  if (
    !directory.organizations.some(
      (organization) => organization.id === values.organizationId,
    ) ||
    hasDuplicateDepartmentName(directory, values.organizationId, values.name)
  ) {
    return undefined;
  }

  const department: Department = {
    id: createRecordId(values.name, "department"),
    organizationId: values.organizationId,
    name: values.name,
    description: values.description,
    status: values.status,
    createdAt: todayIsoDate(),
  };

  directory = {
    ...directory,
    departments: [department, ...directory.departments],
  };
  emit();
  return department;
}

export function updateDepartment(
  departmentId: string,
  values: DepartmentFormValues,
) {
  const current = directory.departments.find(
    (department) => department.id === departmentId,
  );

  if (
    !current ||
    !directory.organizations.some(
      (organization) => organization.id === values.organizationId,
    ) ||
    hasDuplicateDepartmentName(
      directory,
      values.organizationId,
      values.name,
      departmentId,
    )
  ) {
    return false;
  }

  const placed =
    current.organizationId === values.organizationId
      ? {
          teams: directory.teams,
          users: directory.users,
          clinicalTemplates: directory.clinicalTemplates,
        }
      : placeDepartmentInOrganization(
          directory,
          departmentId,
          values.organizationId,
        );

  directory = {
    ...directory,
    teams: placed.teams,
    users: placed.users,
    clinicalTemplates: placed.clinicalTemplates,
    departments: directory.departments.map((department) =>
      department.id === departmentId
        ? {
            ...department,
            name: values.name,
            description: values.description,
            status: values.status,
            organizationId: values.organizationId,
          }
        : department,
    ),
  };
  emit();
  return true;
}

export function setDepartmentStatus(
  departmentId: string,
  status: RecordStatus,
) {
  directory = {
    ...directory,
    departments: directory.departments.map((department) =>
      department.id === departmentId ? { ...department, status } : department,
    ),
  };
  emit();
}

export type TeamUpdateResult =
  | { ok: true; removedMembers: TeamMembership[] }
  | { ok: false; reason: "invalid" | "duplicate" }
  | { ok: false; reason: "incompatible"; members: TeamMembership[] };

export function addTeam(values: TeamFormValues): ClinicalTeam | undefined {
  const department = directory.departments.find(
    (item) => item.id === values.departmentId,
  );

  if (
    !department ||
    department.organizationId !== values.organizationId ||
    hasDuplicateTeamName(directory, values.departmentId, values.name)
  ) {
    return undefined;
  }

  const today = todayIsoDate();
  const team: ClinicalTeam = {
    id: createRecordId(values.name, "team"),
    organizationId: values.organizationId,
    departmentId: values.departmentId,
    name: values.name,
    description: values.description,
    status: values.status,
    createdAt: today,
    updatedAt: today,
  };

  directory = {
    ...directory,
    teams: [team, ...directory.teams],
  };
  emit();
  return team;
}

export function updateTeam(
  teamId: string,
  values: TeamFormValues,
  options?: { removeIncompatibleMembers?: boolean },
): TeamUpdateResult {
  const current = directory.teams.find((team) => team.id === teamId);
  const department = directory.departments.find(
    (item) => item.id === values.departmentId,
  );

  if (
    !current ||
    !department ||
    department.organizationId !== values.organizationId
  ) {
    return { ok: false, reason: "invalid" };
  }

  if (
    hasDuplicateTeamName(directory, values.departmentId, values.name, teamId)
  ) {
    return { ok: false, reason: "duplicate" };
  }

  const incompatible =
    current.organizationId === values.organizationId
      ? []
      : incompatibleTeamMembers(directory, teamId, values.organizationId);

  if (incompatible.length > 0 && !options?.removeIncompatibleMembers) {
    return { ok: false, reason: "incompatible", members: incompatible };
  }

  const removedIds = new Set(incompatible.map((member) => member.id));
  directory = {
    ...directory,
    users:
      removedIds.size === 0
        ? directory.users
        : directory.users.map((user) =>
            removedIds.has(user.id)
              ? {
                  ...user,
                  teamIds: user.teamIds.filter((id) => id !== teamId),
                }
              : user,
          ),
    teams: directory.teams.map((team) =>
      team.id === teamId
        ? {
            ...team,
            name: values.name,
            organizationId: values.organizationId,
            departmentId: values.departmentId,
            description: values.description,
            status: values.status,
            updatedAt: todayIsoDate(),
          }
        : team,
    ),
  };
  emit();
  return { ok: true, removedMembers: incompatible };
}

export function setTeamStatus(teamId: string, status: RecordStatus) {
  directory = {
    ...directory,
    teams: directory.teams.map((team) =>
      team.id === teamId
        ? { ...team, status, updatedAt: todayIsoDate() }
        : team,
    ),
  };
  emit();
}

export function addTeamMember(
  teamId: string,
  userId: string,
): "added" | "duplicate" | "wrong-organization" | "missing" {
  const team = directory.teams.find((item) => item.id === teamId);
  const user = directory.users.find((item) => item.id === userId);

  if (!team || !user) {
    return "missing";
  }

  if (user.organizationId !== team.organizationId) {
    return "wrong-organization";
  }

  if (user.teamIds.includes(teamId)) {
    return "duplicate";
  }

  directory = {
    ...directory,
    users: directory.users.map((item) =>
      item.id === userId
        ? {
            ...item,
            teamIds: [...item.teamIds, teamId],
            updatedAt: todayIsoDate(),
          }
        : item,
    ),
  };
  emit();
  return "added";
}

export function removeTeamMember(teamId: string, userId: string) {
  const user = directory.users.find((item) => item.id === userId);
  if (!user || !user.teamIds.includes(teamId)) {
    return false;
  }

  directory = {
    ...directory,
    users: directory.users.map((item) =>
      item.id === userId
        ? {
            ...item,
            teamIds: item.teamIds.filter((id) => id !== teamId),
            updatedAt: todayIsoDate(),
          }
        : item,
    ),
  };
  emit();
  return true;
}

export type UserUpdateResult =
  | { ok: true; removedTeams: { id: string; name: string }[] }
  | { ok: false; reason: "invalid" | "duplicate" }
  | {
      ok: false;
      reason: "incompatible";
      teams: { id: string; name: string }[];
    };

export function addUser(values: UserFormValues): OrganizationUser | undefined {
  if (
    !directory.organizations.some(
      (organization) => organization.id === values.organizationId,
    ) ||
    hasDuplicateEmail(directory, values.email) ||
    !directory.roles.some((role) => role.name === values.role) ||
    !teamsBelongToOrganization(values.teamIds, values.organizationId)
  ) {
    return undefined;
  }

  const today = todayIsoDate();
  const user: OrganizationUser = {
    id: createRecordId(values.name, "user"),
    organizationId: values.organizationId,
    name: values.name,
    email: values.email,
    role: values.role,
    status: values.status,
    teamIds: uniqueTeamIds(values.teamIds),
    createdAt: today,
    updatedAt: today,
  };

  directory = {
    ...directory,
    users: [user, ...directory.users],
  };
  emit();
  return user;
}

export function updateUser(
  userId: string,
  values: UserFormValues,
  options?: { removeIncompatibleTeams?: boolean },
): UserUpdateResult {
  const current = directory.users.find((user) => user.id === userId);

  if (
    !current ||
    !directory.organizations.some(
      (organization) => organization.id === values.organizationId,
    ) ||
    !directory.roles.some((role) => role.name === values.role)
  ) {
    return { ok: false, reason: "invalid" };
  }

  if (hasDuplicateEmail(directory, values.email, userId)) {
    return { ok: false, reason: "duplicate" };
  }

  const incompatible = incompatibleUserTeams(
    directory,
    values.teamIds,
    values.organizationId,
  ).map((team) => ({ id: team.id, name: team.name }));

  if (incompatible.length > 0 && !options?.removeIncompatibleTeams) {
    return { ok: false, reason: "incompatible", teams: incompatible };
  }

  if (!teamsBelongToOrganization(values.teamIds, values.organizationId, true)) {
    return { ok: false, reason: "invalid" };
  }

  directory = {
    ...directory,
    users: directory.users.map((user) =>
      user.id === userId
        ? {
            ...user,
            name: values.name,
            email: values.email,
            organizationId: values.organizationId,
            role: values.role,
            status: values.status,
            teamIds: uniqueTeamIds(values.teamIds).filter((teamId) => {
              const team = directory.teams.find((item) => item.id === teamId);
              return team?.organizationId === values.organizationId;
            }),
            updatedAt: todayIsoDate(),
          }
        : user,
    ),
  };
  emit();
  return { ok: true, removedTeams: incompatible };
}

export function setUserStatus(userId: string, status: RecordStatus) {
  directory = {
    ...directory,
    users: directory.users.map((user) =>
      user.id === userId
        ? { ...user, status, updatedAt: todayIsoDate() }
        : user,
    ),
  };
  emit();
}

export type RoleUpdateResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "duplicate" | "protected" };

export type RoleDeleteResult =
  | { ok: true }
  | { ok: false; reason: "missing" | "system" | "assigned"; assignedUsers?: number };

export function addRole(values: RoleFormValues): AccessRole | undefined {
  const name = values.name.trim();
  const description = values.description.trim();

  if (name.length === 0 || description.length === 0 || hasDuplicateRoleName(directory, name)) {
    return undefined;
  }

  const today = todayIsoDate();
  const role: AccessRole = {
    id: createRecordId(name, "role"),
    name,
    description,
    type: "Custom",
    permissionIds: sanitizePermissionIds(values.permissionIds),
    createdAt: today,
    updatedAt: today,
  };

  directory = {
    ...directory,
    roles: [role, ...directory.roles],
  };
  emit();
  return role;
}

export function updateRole(roleId: string, values: RoleFormValues): RoleUpdateResult {
  const current = directory.roles.find((role) => role.id === roleId);
  const name = values.name.trim();
  const description = values.description.trim();

  if (!current || name.length === 0 || description.length === 0) {
    return { ok: false, reason: "invalid" };
  }

  if (current.type === "System" && name !== current.name) {
    return { ok: false, reason: "protected" };
  }

  if (hasDuplicateRoleName(directory, name, roleId)) {
    return { ok: false, reason: "duplicate" };
  }

  directory = {
    ...directory,
    roles: directory.roles.map((role) =>
      role.id === roleId
        ? {
            ...role,
            name,
            description,
            updatedAt: todayIsoDate(),
          }
        : role,
    ),
    users:
      name === current.name
        ? directory.users
        : directory.users.map((user) =>
            user.role === current.name ? { ...user, role: name } : user,
          ),
  };
  emit();
  return { ok: true };
}

export function setRolePermissions(roleId: string, permissionIds: string[]) {
  const current = directory.roles.find((role) => role.id === roleId);
  if (!current) {
    return false;
  }

  directory = {
    ...directory,
    roles: directory.roles.map((role) =>
      role.id === roleId
        ? {
            ...role,
            permissionIds: sanitizePermissionIds(permissionIds),
            updatedAt: todayIsoDate(),
          }
        : role,
    ),
  };
  emit();
  return true;
}

export function deleteRole(roleId: string): RoleDeleteResult {
  const current = directory.roles.find((role) => role.id === roleId);
  if (!current) {
    return { ok: false, reason: "missing" };
  }

  if (current.type === "System") {
    return { ok: false, reason: "system" };
  }

  const assignedUsers = directory.users.filter((user) => user.role === current.name).length;
  if (assignedUsers > 0) {
    return { ok: false, reason: "assigned", assignedUsers };
  }

  directory = {
    ...directory,
    roles: directory.roles.filter((role) => role.id !== roleId),
  };
  emit();
  return { ok: true };
}

export function flagInteraction(interactionId: string, reason: FlagReason, notes: string) {
  const current = directory.interactions.find((interaction) => interaction.id === interactionId);
  if (!current) {
    return false;
  }

  const reviewStatus =
    current.reviewStatus === null || current.reviewStatus === "Dismissed"
      ? "Pending Review"
      : current.reviewStatus;
  const trimmedNotes = notes.trim();

  directory = {
    ...directory,
    interactions: directory.interactions.map((interaction) =>
      interaction.id === interactionId
        ? {
            ...interaction,
            flagReason: reason,
            reviewStatus,
            reviewNotes: trimmedNotes.length > 0 ? trimmedNotes : interaction.reviewNotes,
          }
        : interaction,
    ),
  };
  emit();
  return true;
}

export function updateInteractionReview(
  interactionId: string,
  reviewStatus: ReviewStatus,
  reviewNotes: string,
) {
  const current = directory.interactions.find((interaction) => interaction.id === interactionId);
  if (!current || !current.flagReason) {
    return false;
  }

  directory = {
    ...directory,
    interactions: directory.interactions.map((interaction) =>
      interaction.id === interactionId
        ? {
            ...interaction,
            reviewStatus,
            reviewNotes: reviewNotes.trim(),
            reviewedAt: new Date().toISOString(),
          }
        : interaction,
    ),
  };
  emit();
  return true;
}

export function dismissInteractionFlag(interactionId: string) {
  const current = directory.interactions.find((interaction) => interaction.id === interactionId);
  if (!current || !current.flagReason || current.reviewStatus === "Dismissed") {
    return false;
  }

  directory = {
    ...directory,
    interactions: directory.interactions.map((interaction) =>
      interaction.id === interactionId
        ? {
            ...interaction,
            reviewStatus: "Dismissed",
            reviewedAt: new Date().toISOString(),
          }
        : interaction,
    ),
  };
  emit();
  return true;
}

export function resetInteractions() {
  directory = {
    ...directory,
    interactions: sampleInteractions,
  };
  emit();
}

export function addClinicalTemplate(
  values: ClinicalTemplateFormValues,
): ClinicalTemplate | undefined {
  if (!clinicalTemplateValuesAreValid(values)) {
    return undefined;
  }

  const today = todayIsoDate();
  const template: ClinicalTemplate = {
    id: createRecordId(values.name, "template"),
    organizationId: values.organizationId,
    departmentId: values.departmentId,
    name: values.name.trim(),
    description: values.description.trim(),
    workflow: values.workflow.trim(),
    status: values.status,
    sections: values.sections.map((section) => ({ ...section })),
    createdAt: today,
    updatedAt: today,
  };

  directory = {
    ...directory,
    clinicalTemplates: [template, ...directory.clinicalTemplates],
  };
  emit();
  return template;
}

export function updateClinicalTemplate(
  templateId: string,
  values: ClinicalTemplateFormValues,
) {
  const current = directory.clinicalTemplates.find((template) => template.id === templateId);

  if (!current || !clinicalTemplateValuesAreValid(values, templateId)) {
    return false;
  }

  directory = {
    ...directory,
    clinicalTemplates: directory.clinicalTemplates.map((template) =>
      template.id === templateId
        ? {
            ...template,
            organizationId: values.organizationId,
            departmentId: values.departmentId,
            name: values.name.trim(),
            description: values.description.trim(),
            workflow: values.workflow.trim(),
            status: values.status,
            sections: values.sections.map((section) => ({ ...section })),
            updatedAt: todayIsoDate(),
          }
        : template,
    ),
  };
  emit();
  return true;
}

export function setClinicalTemplateStatus(
  templateId: string,
  status: ClinicalTemplateStatus,
) {
  const current = directory.clinicalTemplates.find((template) => template.id === templateId);
  if (!current) {
    return false;
  }

  directory = {
    ...directory,
    clinicalTemplates: directory.clinicalTemplates.map((template) =>
      template.id === templateId
        ? {
            ...template,
            status,
            updatedAt: todayIsoDate(),
          }
        : template,
    ),
  };
  emit();
  return true;
}

function clinicalTemplateValuesAreValid(
  values: ClinicalTemplateFormValues,
  exceptTemplateId?: string,
) {
  const organizationExists = directory.organizations.some(
    (organization) => organization.id === values.organizationId,
  );
  if (!organizationExists || values.name.trim().length === 0) {
    return false;
  }

  if (values.departmentId !== null) {
    const department = directory.departments.find((item) => item.id === values.departmentId);
    if (!department || department.organizationId !== values.organizationId) {
      return false;
    }
  }

  return !hasDuplicateClinicalTemplateName(
    directory,
    values.organizationId,
    values.name,
    exceptTemplateId,
  );
}

function teamsBelongToOrganization(
  teamIds: string[],
  organizationId: string,
  allowForeign = false,
) {
  return uniqueTeamIds(teamIds).every((teamId) => {
    const team = directory.teams.find((item) => item.id === teamId);
    if (!team) {
      return false;
    }
    return allowForeign || team.organizationId === organizationId;
  });
}

function uniqueTeamIds(teamIds: string[]) {
  return [...new Set(teamIds)];
}

export function addAiProvider(values: AiProviderFormValues): AiConfigWriteResult<AiProvider> {
  const issues = providerFieldIssues(directory.aiConfiguration, values);
  const issue = issues[0];
  if (issue) {
    return { ok: false, message: issue.message };
  }

  const today = todayIsoDate();
  const provider: AiProvider = {
    id: createRecordId(values.name, "provider"),
    name: values.name.trim(),
    identifier: values.identifier.trim().toLowerCase(),
    description: values.description.trim(),
    providerType: values.providerType,
    defaultModelId: values.defaultModelId || null,
    status: values.status,
    createdAt: today,
    updatedAt: today,
  };

  directory = {
    ...directory,
    aiConfiguration: {
      ...directory.aiConfiguration,
      providers: [provider, ...directory.aiConfiguration.providers],
    },
  };
  emit();
  return { ok: true, value: provider };
}

export function updateAiProvider(
  providerId: string,
  values: AiProviderFormValues,
): AiConfigWriteResult<AiProvider> {
  const current = directory.aiConfiguration.providers.find((provider) => provider.id === providerId);
  const issues = providerFieldIssues(directory.aiConfiguration, values, providerId);
  const issue = issues[0];
  if (!current || issue) {
    return { ok: false, message: issue?.message ?? "This sample provider could not be updated." };
  }

  const provider: AiProvider = {
    ...current,
    name: values.name.trim(),
    identifier: values.identifier.trim().toLowerCase(),
    description: values.description.trim(),
    providerType: values.providerType,
    defaultModelId: values.defaultModelId || null,
    status: values.status,
    updatedAt: todayIsoDate(),
  };

  replaceAiConfiguration({
    providers: directory.aiConfiguration.providers.map((item) =>
      item.id === providerId ? provider : item,
    ),
  });
  return { ok: true, value: provider };
}

export function setAiProviderStatus(
  providerId: string,
  status: AiConfigStatus,
): AiConfigWriteResult<AiProvider> {
  const current = directory.aiConfiguration.providers.find((provider) => provider.id === providerId);
  if (!current) {
    return { ok: false, message: "This sample provider could not be updated." };
  }
  if (status === current.status) {
    return { ok: true, value: current };
  }
  if (status === "Inactive" && activeTasksForProvider(directory.aiConfiguration, providerId).length > 0) {
    return {
      ok: false,
      message: "Reassign active tasks that use this provider before pausing it.",
    };
  }
  if (status === "Active") {
    const activationIssue = providerActivationIssue(directory.aiConfiguration, current);
    if (activationIssue) {
      return { ok: false, message: activationIssue };
    }
  }

  const provider: AiProvider = { ...current, status, updatedAt: todayIsoDate() };
  replaceAiConfiguration({
    providers: directory.aiConfiguration.providers.map((item) =>
      item.id === providerId ? provider : item,
    ),
  });
  return { ok: true, value: provider };
}

export function setProviderDefaultModel(
  providerId: string,
  modelId: string,
): AiConfigWriteResult<AiProvider> {
  const config = directory.aiConfiguration;
  const provider = config.providers.find((item) => item.id === providerId);
  const model = config.models.find((item) => item.id === modelId);
  if (!provider || !model || model.providerId !== provider.id) {
    return { ok: false, message: "Select a model that belongs to this provider." };
  }
  if (provider.status === "Active" && model.status !== "Active") {
    return { ok: false, message: "The default model must be active while the provider is active." };
  }

  const next: AiProvider = { ...provider, defaultModelId: model.id, updatedAt: todayIsoDate() };
  replaceAiConfiguration({
    providers: config.providers.map((item) => (item.id === providerId ? next : item)),
  });
  return { ok: true, value: next };
}

export function addAiModel(values: AiModelFormValues): AiConfigWriteResult<AiModel> {
  const issues = modelFieldIssues(directory.aiConfiguration, values);
  const issue = issues[0];
  if (issue) {
    return { ok: false, message: issue.message };
  }

  const today = todayIsoDate();
  const model: AiModel = {
    id: createRecordId(values.name, "model"),
    providerId: values.providerId,
    name: values.name.trim(),
    description: values.description.trim(),
    capabilities: [...values.capabilities],
    status: values.status,
    createdAt: today,
    updatedAt: today,
  };

  directory = {
    ...directory,
    aiConfiguration: {
      ...directory.aiConfiguration,
      models: [model, ...directory.aiConfiguration.models],
    },
  };
  emit();
  return { ok: true, value: model };
}

export function updateAiModel(
  modelId: string,
  values: AiModelFormValues,
): AiConfigWriteResult<AiModel> {
  const current = directory.aiConfiguration.models.find((model) => model.id === modelId);
  if (!current) {
    return { ok: false, message: "This sample model could not be updated." };
  }
  if (values.providerId !== current.providerId) {
    return { ok: false, message: "A sample model stays with its provider." };
  }

  const issues = modelFieldIssues(directory.aiConfiguration, values, modelId);
  const issue = issues[0];
  if (issue) {
    return { ok: false, message: issue.message };
  }

  const model: AiModel = {
    ...current,
    name: values.name.trim(),
    description: values.description.trim(),
    capabilities: [...values.capabilities],
    status: values.status,
    updatedAt: todayIsoDate(),
  };
  replaceAiConfiguration({
    models: directory.aiConfiguration.models.map((item) => (item.id === modelId ? model : item)),
  });
  return { ok: true, value: model };
}

export function setAiModelStatus(
  modelId: string,
  status: AiConfigStatus,
): AiConfigWriteResult<AiModel> {
  const current = directory.aiConfiguration.models.find((model) => model.id === modelId);
  if (!current) {
    return { ok: false, message: "This sample model could not be updated." };
  }
  if (status === current.status) {
    return { ok: true, value: current };
  }
  if (status === "Inactive") {
    if (activeTasksForModel(directory.aiConfiguration, modelId).length > 0) {
      return {
        ok: false,
        message: "Reassign active tasks that use this model before pausing it.",
      };
    }
    if (
      directory.aiConfiguration.providers.some(
        (provider) => provider.status === "Active" && provider.defaultModelId === modelId,
      )
    ) {
      return {
        ok: false,
        message: "Choose another default model before pausing this one.",
      };
    }
  }

  const model: AiModel = { ...current, status, updatedAt: todayIsoDate() };
  replaceAiConfiguration({
    models: directory.aiConfiguration.models.map((item) => (item.id === modelId ? model : item)),
  });
  return { ok: true, value: model };
}

export function updateAiTask(
  taskId: AiTaskId,
  values: AiTaskFormValues,
): AiConfigWriteResult {
  const current = directory.aiConfiguration.tasks.find((task) => task.id === taskId);
  const issues = taskFieldIssues(directory.aiConfiguration, taskId, values);
  const issue = issues[0];
  if (!current || issue) {
    return { ok: false, message: issue?.message ?? "This sample task could not be updated." };
  }

  replaceAiConfiguration({
    tasks: directory.aiConfiguration.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            description: values.description.trim(),
            providerId: values.providerId,
            modelId: values.modelId,
            fallbackModelId: values.fallbackModelId || null,
            status: values.status,
            maxOutputTokens: values.maxOutputTokens,
            updatedAt: todayIsoDate(),
          }
        : task,
    ),
  });
  return { ok: true, value: undefined };
}

export function updateAiSafety(values: AiSafetyFormValues): AiConfigWriteResult {
  replaceAiConfiguration({
    safety: {
      ...values,
      updatedAt: todayIsoDate(),
    },
  });
  return { ok: true, value: undefined };
}

export function updateAiUsageLimits(values: AiUsageLimitsFormValues): AiConfigWriteResult {
  const issues = usageLimitIssues(directory.aiConfiguration, values);
  const issue = issues[0];
  if (issue) {
    return { ok: false, message: issue.message };
  }

  replaceAiConfiguration({
    usageLimits: {
      ...values,
      updatedAt: todayIsoDate(),
    },
  });
  return { ok: true, value: undefined };
}

function replaceAiConfiguration(patch: Partial<AiConfiguration>) {
  directory = {
    ...directory,
    aiConfiguration: {
      ...directory.aiConfiguration,
      ...patch,
    },
  };
  emit();
}

export function updateGeneralSettings(values: GeneralSettingsFormValues): SystemSettingsWriteResult {
  const parsed = generalSettingsSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the general settings." };
  }

  replaceSystemSettings({
    ...directory.systemSettings,
    general: { ...parsed.data, updatedAt: todayIsoDate() },
  });
  return { ok: true };
}

export function updateApplicationPreferences(
  values: ApplicationPreferencesFormValues,
): SystemSettingsWriteResult {
  const parsed = applicationPreferencesSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the application preferences." };
  }

  replaceSystemSettings({
    ...directory.systemSettings,
    preferences: { ...parsed.data, updatedAt: todayIsoDate() },
  });
  return { ok: true };
}

export function updateSessionSettings(values: SessionSettingsFormValues): SystemSettingsWriteResult {
  const parsed = sessionSettingsSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the session settings." };
  }

  replaceSystemSettings({
    ...directory.systemSettings,
    session: { ...parsed.data, updatedAt: todayIsoDate() },
  });
  return { ok: true };
}

export function updateSecuritySettings(values: SecuritySettingsFormValues): SystemSettingsWriteResult {
  const parsed = securitySettingsSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the security settings." };
  }

  replaceSystemSettings({
    ...directory.systemSettings,
    security: { ...parsed.data, updatedAt: todayIsoDate() },
  });
  return { ok: true };
}

export function updateClinicalWorkflowSettings(
  organizationId: string,
  values: ClinicalWorkflowFormValues,
): SystemSettingsWriteResult {
  const message = clinicalTemplateIssue(directory.clinicalTemplates, organizationId, values);
  if (message) {
    return { ok: false, message };
  }

  replaceSystemSettings({
    ...directory.systemSettings,
    clinical: { ...values, updatedAt: todayIsoDate() },
  });
  return { ok: true };
}

function replaceSystemSettings(settings: SystemSettings) {
  directory = {
    ...directory,
    systemSettings: settings,
  };
  emit();
}

function replaceKnowledgeBase(patch: Partial<KnowledgeBase>) {
  directory = {
    ...directory,
    knowledgeBase: {
      ...directory.knowledgeBase,
      ...patch,
    },
  };
  emit();
}

function firstKnowledgeIssue(issues: { message: string }[]) {
  return issues[0]?.message;
}

function uniqueIds(ids: string[]) {
  return [...new Set(ids)];
}

export function addKnowledgeSource(
  values: KnowledgeSourceFormValues,
): KnowledgeWriteResult<KnowledgeSource> {
  const message = firstKnowledgeIssue(sourceFieldIssues(directory.knowledgeBase, values));
  if (message) {
    return { ok: false, message };
  }

  const today = todayIsoDate();
  const source: KnowledgeSource = {
    id: createRecordId(values.name, "source"),
    name: values.name.trim(),
    sourceType: values.sourceType,
    description: values.description.trim(),
    url: values.url.trim(),
    status: values.status,
    createdAt: today,
    updatedAt: today,
  };
  replaceKnowledgeBase({ sources: [source, ...directory.knowledgeBase.sources] });
  return { ok: true, value: source };
}

export function updateKnowledgeSource(
  sourceId: string,
  values: KnowledgeSourceFormValues,
): KnowledgeWriteResult<KnowledgeSource> {
  const current = directory.knowledgeBase.sources.find((source) => source.id === sourceId);
  const message = firstKnowledgeIssue(sourceFieldIssues(directory.knowledgeBase, values, sourceId));
  if (!current || message) {
    return { ok: false, message: message ?? "This sample source could not be updated." };
  }

  const source: KnowledgeSource = {
    ...current,
    name: values.name.trim(),
    sourceType: values.sourceType,
    description: values.description.trim(),
    url: values.url.trim(),
    status: values.status,
    updatedAt: todayIsoDate(),
  };
  replaceKnowledgeBase({
    sources: directory.knowledgeBase.sources.map((item) => (item.id === sourceId ? source : item)),
  });
  return { ok: true, value: source };
}

export function setKnowledgeSourceStatus(
  sourceId: string,
  status: KnowledgeActiveStatus,
): KnowledgeWriteResult<KnowledgeSource> {
  const current = directory.knowledgeBase.sources.find((source) => source.id === sourceId);
  if (!current) {
    return { ok: false, message: "This sample source could not be updated." };
  }
  if (current.status === status) {
    return { ok: true, value: current };
  }

  const source: KnowledgeSource = { ...current, status, updatedAt: todayIsoDate() };
  replaceKnowledgeBase({
    sources: directory.knowledgeBase.sources.map((item) => (item.id === sourceId ? source : item)),
  });
  return { ok: true, value: source };
}

export function addKnowledgeCategory(
  values: KnowledgeCategoryFormValues,
): KnowledgeWriteResult<KnowledgeCategory> {
  const message = firstKnowledgeIssue(categoryFieldIssues(directory.knowledgeBase, values));
  if (message) {
    return { ok: false, message };
  }

  const today = todayIsoDate();
  const category: KnowledgeCategory = {
    id: createRecordId(values.name, "category"),
    name: values.name.trim(),
    description: values.description.trim(),
    status: values.status,
    createdAt: today,
    updatedAt: today,
  };
  replaceKnowledgeBase({ categories: [category, ...directory.knowledgeBase.categories] });
  return { ok: true, value: category };
}

export function updateKnowledgeCategory(
  categoryId: string,
  values: KnowledgeCategoryFormValues,
): KnowledgeWriteResult<KnowledgeCategory> {
  const current = directory.knowledgeBase.categories.find((category) => category.id === categoryId);
  const message = firstKnowledgeIssue(categoryFieldIssues(directory.knowledgeBase, values, categoryId));
  if (!current || message) {
    return { ok: false, message: message ?? "This sample category could not be updated." };
  }

  const category: KnowledgeCategory = {
    ...current,
    name: values.name.trim(),
    description: values.description.trim(),
    status: values.status,
    updatedAt: todayIsoDate(),
  };
  replaceKnowledgeBase({
    categories: directory.knowledgeBase.categories.map((item) =>
      item.id === categoryId ? category : item,
    ),
  });
  return { ok: true, value: category };
}

export function setKnowledgeCategoryStatus(
  categoryId: string,
  status: KnowledgeActiveStatus,
): KnowledgeWriteResult<KnowledgeCategory> {
  const current = directory.knowledgeBase.categories.find((category) => category.id === categoryId);
  if (!current) {
    return { ok: false, message: "This sample category could not be updated." };
  }

  return updateKnowledgeCategory(categoryId, {
    name: current.name,
    description: current.description,
    status,
  });
}

export function addKnowledgeTag(values: KnowledgeTagFormValues): KnowledgeWriteResult<KnowledgeTag> {
  const message = firstKnowledgeIssue(tagFieldIssues(directory.knowledgeBase, values));
  if (message) {
    return { ok: false, message };
  }

  const today = todayIsoDate();
  const tag: KnowledgeTag = {
    id: createRecordId(values.name, "tag"),
    name: values.name.trim(),
    status: values.status,
    createdAt: today,
    updatedAt: today,
  };
  replaceKnowledgeBase({ tags: [tag, ...directory.knowledgeBase.tags] });
  return { ok: true, value: tag };
}

export function updateKnowledgeTag(
  tagId: string,
  values: KnowledgeTagFormValues,
): KnowledgeWriteResult<KnowledgeTag> {
  const current = directory.knowledgeBase.tags.find((tag) => tag.id === tagId);
  const message = firstKnowledgeIssue(tagFieldIssues(directory.knowledgeBase, values, tagId));
  if (!current || message) {
    return { ok: false, message: message ?? "This sample tag could not be updated." };
  }

  const tag: KnowledgeTag = {
    ...current,
    name: values.name.trim(),
    status: values.status,
    updatedAt: todayIsoDate(),
  };
  replaceKnowledgeBase({
    tags: directory.knowledgeBase.tags.map((item) => (item.id === tagId ? tag : item)),
  });
  return { ok: true, value: tag };
}

export function setKnowledgeTagStatus(
  tagId: string,
  status: KnowledgeActiveStatus,
): KnowledgeWriteResult<KnowledgeTag> {
  const current = directory.knowledgeBase.tags.find((tag) => tag.id === tagId);
  if (!current) {
    return { ok: false, message: "This sample tag could not be updated." };
  }

  return updateKnowledgeTag(tagId, { name: current.name, status });
}

export function addKnowledgeDocument(
  values: KnowledgeDocumentFormValues,
): KnowledgeWriteResult<KnowledgeDocument> {
  const message = firstKnowledgeIssue(documentFieldIssues(directory.knowledgeBase, values));
  if (message) {
    return { ok: false, message };
  }

  const today = todayIsoDate();
  const document: KnowledgeDocument = {
    id: createRecordId(values.title, "document"),
    title: values.title.trim(),
    description: values.description.trim(),
    documentType: values.documentType,
    categoryId: values.categoryId,
    tagIds: uniqueIds(values.tagIds),
    sourceId: values.sourceId,
    referenceUrl: values.referenceUrl.trim(),
    version: values.version.trim(),
    publicationDate: values.publicationDate,
    reviewStatus: "Draft",
    reviewerNotes: "",
    reviewHistory: [],
    uploadedAt: today,
    updatedAt: today,
  };
  replaceKnowledgeBase({ documents: [document, ...directory.knowledgeBase.documents] });
  return { ok: true, value: document };
}

export function updateKnowledgeDocument(
  documentId: string,
  values: KnowledgeDocumentFormValues,
): KnowledgeWriteResult<KnowledgeDocument> {
  const current = directory.knowledgeBase.documents.find((item) => item.id === documentId);
  const message = firstKnowledgeIssue(documentFieldIssues(directory.knowledgeBase, values, documentId));
  if (!current || message) {
    return { ok: false, message: message ?? "This sample document could not be updated." };
  }

  const document: KnowledgeDocument = {
    ...current,
    title: values.title.trim(),
    description: values.description.trim(),
    documentType: values.documentType,
    categoryId: values.categoryId,
    tagIds: uniqueIds(values.tagIds),
    sourceId: values.sourceId,
    referenceUrl: values.referenceUrl.trim(),
    version: values.version.trim(),
    publicationDate: values.publicationDate,
    updatedAt: todayIsoDate(),
  };
  replaceKnowledgeBase({
    documents: directory.knowledgeBase.documents.map((item) => (item.id === documentId ? document : item)),
  });
  return { ok: true, value: document };
}

export function reviewKnowledgeDocument(
  documentId: string,
  action: KnowledgeReviewAction,
  notes: string,
  reviewerName: string,
): KnowledgeWriteResult<KnowledgeDocument> {
  const current = directory.knowledgeBase.documents.find((item) => item.id === documentId);
  const reviewed = reviewKnowledgeRecord(
    current,
    "This sample document could not be updated.",
    action,
    notes,
    reviewerName,
  );
  if (!reviewed.ok) {
    return reviewed;
  }

  replaceKnowledgeBase({
    documents: directory.knowledgeBase.documents.map((item) =>
      item.id === documentId ? reviewed.record : item,
    ),
  });
  return { ok: true, value: reviewed.record };
}

export function addClinicalGuideline(
  values: GuidelineFormValues,
): KnowledgeWriteResult<ClinicalGuidelineRecord> {
  const message = firstKnowledgeIssue(guidelineFieldIssues(directory.knowledgeBase, values));
  if (message) {
    return { ok: false, message };
  }

  const today = todayIsoDate();
  const guideline: ClinicalGuidelineRecord = {
    id: createRecordId(values.title, "guideline"),
    title: values.title.trim(),
    description: values.description.trim(),
    specialtyId: values.specialtyId,
    publishingOrganization: values.publishingOrganization.trim(),
    publicationDate: values.publicationDate,
    version: values.version.trim(),
    sourceId: values.sourceId,
    referenceUrl: values.referenceUrl.trim(),
    tagIds: uniqueIds(values.tagIds),
    reviewStatus: "Draft",
    reviewerNotes: "",
    lastReviewedAt: "",
    reviewHistory: [],
    createdAt: today,
    updatedAt: today,
  };
  replaceKnowledgeBase({ guidelines: [guideline, ...directory.knowledgeBase.guidelines] });
  return { ok: true, value: guideline };
}

export function updateClinicalGuideline(
  guidelineId: string,
  values: GuidelineFormValues,
): KnowledgeWriteResult<ClinicalGuidelineRecord> {
  const current = directory.knowledgeBase.guidelines.find((item) => item.id === guidelineId);
  const message = firstKnowledgeIssue(guidelineFieldIssues(directory.knowledgeBase, values, guidelineId));
  if (!current || message) {
    return { ok: false, message: message ?? "This sample guideline could not be updated." };
  }

  const guideline: ClinicalGuidelineRecord = {
    ...current,
    title: values.title.trim(),
    description: values.description.trim(),
    specialtyId: values.specialtyId,
    publishingOrganization: values.publishingOrganization.trim(),
    publicationDate: values.publicationDate,
    version: values.version.trim(),
    sourceId: values.sourceId,
    referenceUrl: values.referenceUrl.trim(),
    tagIds: uniqueIds(values.tagIds),
    updatedAt: todayIsoDate(),
  };
  replaceKnowledgeBase({
    guidelines: directory.knowledgeBase.guidelines.map((item) =>
      item.id === guidelineId ? guideline : item,
    ),
  });
  return { ok: true, value: guideline };
}

export function reviewClinicalGuideline(
  guidelineId: string,
  action: KnowledgeReviewAction,
  notes: string,
  reviewerName: string,
): KnowledgeWriteResult<ClinicalGuidelineRecord> {
  const current = directory.knowledgeBase.guidelines.find((item) => item.id === guidelineId);
  const reviewed = reviewKnowledgeRecord(
    current,
    "This sample guideline could not be updated.",
    action,
    notes,
    reviewerName,
  );
  if (!reviewed.ok) {
    return reviewed;
  }

  const guideline: ClinicalGuidelineRecord = {
    ...reviewed.record,
    lastReviewedAt: reviewed.record.updatedAt,
  };
  replaceKnowledgeBase({
    guidelines: directory.knowledgeBase.guidelines.map((item) =>
      item.id === guidelineId ? guideline : item,
    ),
  });
  return { ok: true, value: guideline };
}

export function addEvidenceRecord(values: EvidenceFormValues): KnowledgeWriteResult<EvidenceRecord> {
  const message = firstKnowledgeIssue(evidenceFieldIssues(directory.knowledgeBase, values));
  if (message) {
    return { ok: false, message };
  }

  const today = todayIsoDate();
  const record: EvidenceRecord = {
    id: createRecordId(values.title, "evidence"),
    title: values.title.trim(),
    authors: values.authors.trim(),
    journal: values.journal.trim(),
    publicationYear: values.publicationYear,
    doi: values.doi.trim(),
    pmid: values.pmid.trim(),
    referenceUrl: values.referenceUrl.trim(),
    evidenceType: values.evidenceType,
    categoryId: values.categoryId,
    tagIds: uniqueIds(values.tagIds),
    reviewStatus: "Draft",
    reviewerNotes: "",
    reviewHistory: [],
    createdAt: today,
    updatedAt: today,
  };
  replaceKnowledgeBase({ evidence: [record, ...directory.knowledgeBase.evidence] });
  return { ok: true, value: record };
}

export function updateEvidenceRecord(
  evidenceId: string,
  values: EvidenceFormValues,
): KnowledgeWriteResult<EvidenceRecord> {
  const current = directory.knowledgeBase.evidence.find((item) => item.id === evidenceId);
  const message = firstKnowledgeIssue(evidenceFieldIssues(directory.knowledgeBase, values, evidenceId));
  if (!current || message) {
    return { ok: false, message: message ?? "This sample evidence record could not be updated." };
  }

  const record: EvidenceRecord = {
    ...current,
    title: values.title.trim(),
    authors: values.authors.trim(),
    journal: values.journal.trim(),
    publicationYear: values.publicationYear,
    doi: values.doi.trim(),
    pmid: values.pmid.trim(),
    referenceUrl: values.referenceUrl.trim(),
    evidenceType: values.evidenceType,
    categoryId: values.categoryId,
    tagIds: uniqueIds(values.tagIds),
    updatedAt: todayIsoDate(),
  };
  replaceKnowledgeBase({
    evidence: directory.knowledgeBase.evidence.map((item) => (item.id === evidenceId ? record : item)),
  });
  return { ok: true, value: record };
}

export function reviewEvidenceRecord(
  evidenceId: string,
  action: KnowledgeReviewAction,
  notes: string,
  reviewerName: string,
): KnowledgeWriteResult<EvidenceRecord> {
  const current = directory.knowledgeBase.evidence.find((item) => item.id === evidenceId);
  const reviewed = reviewKnowledgeRecord(
    current,
    "This sample evidence record could not be updated.",
    action,
    notes,
    reviewerName,
  );
  if (!reviewed.ok) {
    return reviewed;
  }

  replaceKnowledgeBase({
    evidence: directory.knowledgeBase.evidence.map((item) =>
      item.id === evidenceId ? reviewed.record : item,
    ),
  });
  return { ok: true, value: reviewed.record };
}

function reviewKnowledgeRecord<
  T extends {
    id: string;
    reviewStatus: KnowledgeReviewStatus;
    reviewerNotes: string;
    reviewHistory: KnowledgeReviewEvent[];
    updatedAt: string;
  },
>(
  record: T | undefined,
  missingMessage: string,
  action: KnowledgeReviewAction,
  notes: string,
  reviewerName: string,
): { ok: false; message: string } | { ok: true; record: T } {
  if (!record) {
    return { ok: false, message: missingMessage };
  }

  const message = reviewActionIssue(record.reviewStatus, action, notes);
  if (message) {
    return { ok: false, message };
  }

  const reviewStatus = nextKnowledgeReviewStatus(record.reviewStatus, action);
  if (!reviewStatus) {
    return { ok: false, message: "That review step is not available for this record." };
  }

  const trimmed = notes.trim();
  const today = todayIsoDate();
  const event: KnowledgeReviewEvent = {
    id: createRecordId(action, "review"),
    status: reviewStatus,
    notes: trimmed,
    reviewedAt: today,
    reviewerName: reviewerName.trim() || "Hospital Admin",
  };

  return {
    ok: true,
    record: {
      ...record,
      reviewStatus,
      reviewerNotes: trimmed,
      reviewHistory: [...record.reviewHistory, event],
      updatedAt: today,
    },
  };
}

function createOrganizationId(name: string) {
  return createRecordId(name, "organization");
}

function createRecordId(name: string, prefix: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return `${slug || prefix}-${Date.now().toString(36)}`;
}
