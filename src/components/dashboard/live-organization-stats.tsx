"use client";

import type { ReactNode } from "react";
import { OrganizationOverview } from "@/components/dashboard/organization-overview";
import { StatCards } from "@/components/dashboard/stat-cards";
import { useOrganizationDirectory } from "@/features/organizations/demo-store";
import { formatLocation } from "@/features/organizations/format";
import { sampleDirectory } from "@/features/organizations/sample-data";
import { summarizeOrganizations } from "@/features/organizations/selectors";
import {
  sampleOrganizations,
  sampleOverview,
} from "@/features/dashboard/sample-data";
import { departmentsModule } from "@/features/departments";
import { organizationsModule } from "@/features/organizations";
import { teamsModule } from "@/features/teams";
import { usersModule } from "@/features/users";
import type { OrganizationSummary } from "@/features/organizations/types";
import type { SampleOrganization } from "@/types/dashboard";

const registeredIds = new Set(
  sampleDirectory.organizations.map((organization) => organization.id),
);

export function DashboardLiveStats({ children }: { children: ReactNode }) {
  const sessionOrganizations = summarizeOrganizations(
    useOrganizationDirectory(),
  ).filter((organization) => !registeredIds.has(organization.id));
  const addedRows = sessionOrganizations.map(toOverviewRow);
  const organizations = [...sampleOrganizations, ...addedRows];
  const addedDepartments = sessionOrganizations.reduce(
    (total, organization) => total + organization.departmentCount,
    0,
  );
  const addedTeams = sessionOrganizations.reduce(
    (total, organization) => total + organization.teamCount,
    0,
  );
  const addedUsers = sessionOrganizations.reduce(
    (total, organization) => total + organization.userCount,
    0,
  );

  return (
    <>
      <StatCards
        items={[
          {
            label: "Total organizations",
            value: sampleOverview.organizations + sessionOrganizations.length,
            icon: organizationsModule.icon,
          },
          {
            label: "Total departments",
            value: sampleOverview.departments + addedDepartments,
            icon: departmentsModule.icon,
          },
          {
            label: "Total clinical teams",
            value: sampleOverview.teams + addedTeams,
            icon: teamsModule.icon,
          },
          {
            label: "Total registered users",
            value: sampleOverview.users + addedUsers,
            icon: usersModule.icon,
          },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <OrganizationOverview organizations={organizations} />
        {children}
      </div>
    </>
  );
}

function toOverviewRow(organization: OrganizationSummary): SampleOrganization {
  return {
    id: organization.id,
    name: organization.name,
    location: formatLocation(organization.city, organization.state),
    departments: organization.departmentCount,
    teams: organization.teamCount,
    users: organization.userCount,
    status: organization.status,
  };
}
