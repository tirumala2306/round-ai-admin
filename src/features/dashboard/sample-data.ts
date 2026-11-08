import type { SampleActivity, SampleOrganization } from "@/types/dashboard";

/**
 * Fictional sample data for the dashboard layout only.
 * These records are not loaded from the RoundsAI backend and are not
 * hospital, clinician, or patient data.
 */
export const SAMPLE_DATA_NOTICE =
  "Counts, organizations, and activity on this page are fictional and are not loaded from a hospital or the RoundsAI backend.";

export const sampleOrganizations: SampleOrganization[] = [
  {
    id: "meridian",
    name: "Meridian General Hospital",
    location: "Portland, OR",
    departments: 8,
    teams: 11,
    users: 64,
    status: "Active",
  },
  {
    id: "cedarline",
    name: "Cedarline Medical Center",
    location: "Austin, TX",
    departments: 6,
    teams: 8,
    users: 41,
    status: "Active",
  },
  {
    id: "westford",
    name: "Westford Community Hospital",
    location: "Denver, CO",
    departments: 4,
    teams: 5,
    users: 22,
    status: "Onboarding",
  },
  {
    id: "alder",
    name: "Alder University Hospital",
    location: "Ann Arbor, MI",
    departments: 9,
    teams: 12,
    users: 73,
    status: "Active",
  },
];

export const sampleOverview = {
  organizations: sampleOrganizations.length,
  departments: sampleOrganizations.reduce(
    (total, organization) => total + organization.departments,
    0,
  ),
  teams: sampleOrganizations.reduce(
    (total, organization) => total + organization.teams,
    0,
  ),
  users: sampleOrganizations.reduce(
    (total, organization) => total + organization.users,
    0,
  ),
};

export const sampleActivity: SampleActivity[] = [
  {
    id: "activity-cardiology",
    actor: "Maya Patel",
    action: "added the Cardiology department",
    organization: "Meridian General Hospital",
    when: "2 hours ago",
    kind: "department",
  },
  {
    id: "activity-night-float",
    actor: "James Okonkwo",
    action: "invited six clinicians to the Night Float team",
    organization: "Cedarline Medical Center",
    when: "5 hours ago",
    kind: "team",
  },
  {
    id: "activity-hospitalist-role",
    actor: "Priya Shah",
    action: "updated permissions for the Hospitalist role",
    organization: "Alder University Hospital",
    when: "Yesterday",
    kind: "role",
  },
  {
    id: "activity-duplicate-department",
    actor: "Elena Vargas",
    action: "marked a duplicate department for review",
    organization: "Westford Community Hospital",
    when: "Yesterday",
    kind: "department",
  },
  {
    id: "activity-ai-summary",
    actor: "Noah Kim",
    action: "opened the weekly AI usage summary",
    organization: "Cedarline Medical Center",
    when: "2 days ago",
    kind: "monitoring",
  },
];
