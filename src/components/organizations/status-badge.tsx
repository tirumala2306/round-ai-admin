import { Badge } from "@/components/ui/badge";
import type { OrganizationStatus } from "@/features/organizations/types";

export function OrganizationStatusBadge({
  status,
}: {
  status: OrganizationStatus;
}) {
  if (status === "Active") {
    return (
      <Badge
        variant="outline"
        className="border-transparent bg-success/10 font-normal text-success"
      >
        Active
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="font-normal text-muted-foreground">
      Inactive
    </Badge>
  );
}
