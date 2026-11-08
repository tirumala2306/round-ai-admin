import { Badge } from "@/components/ui/badge";
import type { SampleOrganization, SampleOrganizationStatus } from "@/types/dashboard";

export function OrganizationOverview({
  organizations,
}: {
  organizations: SampleOrganization[];
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">
          Organization overview
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Fictional sample hospitals
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <caption className="sr-only">
            Fictional sample organizations for the dashboard preview
          </caption>
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
              <th scope="col" className="px-4 py-2.5 font-medium">
                Organization
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Location
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">
                Departments
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">
                Teams
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">
                Users
              </th>
              <th scope="col" className="px-4 py-2.5 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((organization) => (
              <tr
                key={organization.id}
                className="border-b border-border last:border-0"
              >
                <th
                  scope="row"
                  className="px-4 py-3 text-left text-sm font-medium text-foreground"
                >
                  {organization.name}
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  {organization.location}
                </td>
                <td className="px-4 py-3 text-right text-foreground tabular-nums">
                  {organization.departments}
                </td>
                <td className="px-4 py-3 text-right text-foreground tabular-nums">
                  {organization.teams}
                </td>
                <td className="px-4 py-3 text-right text-foreground tabular-nums">
                  {organization.users}
                </td>
                <td className="px-4 py-3">
                  <DashboardStatusBadge status={organization.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DashboardStatusBadge({ status }: { status: SampleOrganizationStatus }) {
  if (status === "Active") {
    return (
      <Badge variant="outline" className="border-transparent bg-success/10 font-normal text-success">
        Active
      </Badge>
    );
  }

  if (status === "Onboarding") {
    return (
      <Badge variant="outline" className="border-transparent bg-warning/15 font-normal text-warning">
        Onboarding
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="font-normal text-muted-foreground">
      Inactive
    </Badge>
  );
}
