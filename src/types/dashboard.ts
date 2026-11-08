export type SampleOrganizationStatus = "Active" | "Onboarding" | "Inactive";

export type SampleOrganization = {
  id: string;
  name: string;
  location: string;
  departments: number;
  teams: number;
  users: number;
  status: SampleOrganizationStatus;
};

export type SampleActivityKind = "department" | "team" | "role" | "monitoring";

export type SampleActivity = {
  id: string;
  actor: string;
  action: string;
  organization: string;
  when: string;
  kind: SampleActivityKind;
};
