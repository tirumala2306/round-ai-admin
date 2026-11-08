import { todayIsoDate } from "@/features/organizations/format";
import type {
  DepartmentListItem,
  DepartmentSummary,
  OrganizationDirectory,
  OrganizationSummary,
  OrganizationUser,
  TeamListItem,
  TeamMembership,
  UserListItem,
  UserTeamMembership,
} from "@/features/organizations/types";

export function summarizeOrganizations(
  directory: OrganizationDirectory,
): OrganizationSummary[] {
  return directory.organizations.map((organization) => ({
    ...organization,
    departmentCount: directory.departments.filter(
      (department) => department.organizationId === organization.id,
    ).length,
    teamCount: directory.teams.filter(
      (team) => team.organizationId === organization.id,
    ).length,
    userCount: directory.users.filter(
      (user) => user.organizationId === organization.id,
    ).length,
  }));
}

export function summarizeDepartments(
  directory: OrganizationDirectory,
  organizationId: string,
): DepartmentSummary[] {
  const departments = directory.departments.filter(
    (department) => department.organizationId === organizationId,
  );
  const teams = directory.teams.filter(
    (team) => team.organizationId === organizationId,
  );
  const users = directory.users.filter(
    (user) => user.organizationId === organizationId,
  );

  return departments.map((department) => {
    const departmentTeams = teams.filter(
      (team) => team.departmentId === department.id,
    );
    const teamIds = new Set(departmentTeams.map((team) => team.id));

    return {
      ...department,
      teamCount: departmentTeams.length,
      userCount: users.filter((user) =>
        user.teamIds.some((teamId) => teamIds.has(teamId)),
      ).length,
      teams: departmentTeams.map((team) => ({
        ...team,
        departmentName: department.name,
        memberCount: users.filter((user) => user.teamIds.includes(team.id))
          .length,
      })),
    };
  });
}

export function listDepartments(
  directory: OrganizationDirectory,
): DepartmentListItem[] {
  return directory.departments.map((department) => {
    const departmentTeams = directory.teams.filter(
      (team) => team.departmentId === department.id,
    );
    const teamIds = new Set(departmentTeams.map((team) => team.id));
    const organization = directory.organizations.find(
      (item) => item.id === department.organizationId,
    );

    return {
      ...department,
      organizationName: organization?.name ?? "Unknown organization",
      teamCount: departmentTeams.length,
      userCount: directory.users.filter((user) =>
        user.teamIds.some((teamId) => teamIds.has(teamId)),
      ).length,
    };
  });
}

export function listTeams(directory: OrganizationDirectory): TeamListItem[] {
  return directory.teams.map((team) => {
    const organization = directory.organizations.find(
      (item) => item.id === team.organizationId,
    );
    const department = directory.departments.find(
      (item) => item.id === team.departmentId,
    );

    return {
      ...team,
      organizationName: organization?.name ?? "Unknown organization",
      departmentName: department?.name ?? "Unknown department",
      memberCount: directory.users.filter(
        (user) =>
          user.organizationId === team.organizationId &&
          user.teamIds.includes(team.id),
      ).length,
    };
  });
}

export function listUsers(directory: OrganizationDirectory): UserListItem[] {
  return directory.users.map((user) => {
    const teams = directory.teams.filter(
      (team) =>
        team.organizationId === user.organizationId &&
        user.teamIds.includes(team.id),
    );
    const organization = directory.organizations.find(
      (item) => item.id === user.organizationId,
    );

    return {
      ...user,
      organizationName: organization?.name ?? "Unknown organization",
      teamNames: teams.map((team) => team.name),
      departmentIds: [...new Set(teams.map((team) => team.departmentId))],
    };
  });
}

export function listUserTeams(
  directory: OrganizationDirectory,
  userId: string,
): UserTeamMembership[] {
  const user = directory.users.find((item) => item.id === userId);
  if (!user) {
    return [];
  }

  return directory.teams
    .filter(
      (team) =>
        team.organizationId === user.organizationId &&
        user.teamIds.includes(team.id),
    )
    .map((team) => ({
      id: team.id,
      name: team.name,
      departmentId: team.departmentId,
      departmentName:
        directory.departments.find((item) => item.id === team.departmentId)
          ?.name ?? "Unknown department",
      organizationId: team.organizationId,
      organizationName:
        directory.organizations.find((item) => item.id === team.organizationId)
          ?.name ?? "Unknown organization",
      status: team.status,
    }));
}

export function hasDuplicateEmail(
  directory: OrganizationDirectory,
  email: string,
  exceptUserId?: string,
) {
  const normalized = email.trim().toLowerCase();

  return directory.users.some(
    (user) =>
      user.id !== exceptUserId && user.email.trim().toLowerCase() === normalized,
  );
}

export function incompatibleUserTeams(
  directory: OrganizationDirectory,
  teamIds: string[],
  organizationId: string,
) {
  return directory.teams
    .filter(
      (team) => teamIds.includes(team.id) && team.organizationId !== organizationId,
    )
    .map((team) => ({
      id: team.id,
      name: team.name,
      email: "",
    }));
}

export function hasDuplicateTeamName(
  directory: OrganizationDirectory,
  departmentId: string,
  name: string,
  exceptTeamId?: string,
) {
  const normalized = name.trim().toLowerCase();

  return directory.teams.some(
    (team) =>
      team.departmentId === departmentId &&
      team.id !== exceptTeamId &&
      team.name.trim().toLowerCase() === normalized,
  );
}

export function listTeamMembers(
  directory: OrganizationDirectory,
  teamId: string,
): OrganizationUser[] {
  const team = directory.teams.find((item) => item.id === teamId);
  if (!team) {
    return [];
  }

  return directory.users.filter(
    (user) =>
      user.organizationId === team.organizationId &&
      user.teamIds.includes(team.id),
  );
}

export function incompatibleTeamMembers(
  directory: OrganizationDirectory,
  teamId: string,
  organizationId: string,
): TeamMembership[] {
  return directory.users
    .filter(
      (user) =>
        user.teamIds.includes(teamId) && user.organizationId !== organizationId,
    )
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
}

export function hasDuplicateDepartmentName(
  directory: OrganizationDirectory,
  organizationId: string,
  name: string,
  exceptDepartmentId?: string,
) {
  const normalized = name.trim().toLowerCase();

  return directory.departments.some(
    (department) =>
      department.organizationId === organizationId &&
      department.id !== exceptDepartmentId &&
      department.name.trim().toLowerCase() === normalized,
  );
}

/**
 * Moves a department's clinical teams to another organization.
 * People on those teams move with the department. A person belongs to one
 * organization, so memberships on teams that remain elsewhere are removed.
 * Department-specific templates follow the department and receive a new updatedAt.
 * Organization-wide templates stay put.
 */
export function placeDepartmentInOrganization(
  directory: OrganizationDirectory,
  departmentId: string,
  organizationId: string,
) {
  const movedTeamIds = new Set(
    directory.teams
      .filter((team) => team.departmentId === departmentId)
      .map((team) => team.id),
  );
  const teams = directory.teams.map((team) =>
    movedTeamIds.has(team.id) ? { ...team, organizationId } : team,
  );
  const users = directory.users.map((user) => {
    if (!user.teamIds.some((teamId) => movedTeamIds.has(teamId))) {
      return user;
    }

    return {
      ...user,
      organizationId,
      teamIds: user.teamIds.filter((teamId) => {
        const team = teams.find((item) => item.id === teamId);
        return team?.organizationId === organizationId;
      }),
    };
  });
  const movedOn = todayIsoDate();
  const clinicalTemplates = directory.clinicalTemplates.map((template) =>
    template.departmentId === departmentId
      ? { ...template, organizationId, updatedAt: movedOn }
      : template,
  );

  return { teams, users, clinicalTemplates };
}

export function hasDuplicateOrganizationName(
  directory: OrganizationDirectory,
  name: string,
  exceptOrganizationId?: string,
) {
  const normalized = name.trim().toLowerCase();

  return directory.organizations.some(
    (organization) =>
      organization.id !== exceptOrganizationId &&
      organization.name.trim().toLowerCase() === normalized,
  );
}
