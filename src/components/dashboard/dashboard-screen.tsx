import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DashboardLiveStats } from "@/components/dashboard/live-organization-stats";
import { QuickNavigation } from "@/components/dashboard/quick-navigation";
import { dashboardModule } from "@/features/dashboard";
import { sampleActivity } from "@/features/dashboard/sample-data";

export function DashboardScreen() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground">RoundsAI administration</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            Welcome
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {dashboardModule.summary}
          </p>
        </div>
      </section>
      <DashboardLiveStats>
        <ActivityFeed activity={sampleActivity} />
      </DashboardLiveStats>
      <QuickNavigation />
    </div>
  );
}
