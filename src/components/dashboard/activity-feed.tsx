import { Activity, Layers, ShieldCheck, Users } from "lucide-react";
import type { SampleActivity, SampleActivityKind } from "@/types/dashboard";
import type { LucideIcon } from "lucide-react";

const activityIcons: Record<SampleActivityKind, LucideIcon> = {
  department: Layers,
  team: Users,
  role: ShieldCheck,
  monitoring: Activity,
};

export function ActivityFeed({ activity }: { activity: SampleActivity[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">
          Recent administrative activity
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Fictional sample events
        </p>
      </div>
      <ol>
        {activity.map((item) => {
          const Icon = activityIcons[item.kind];

          return (
            <li
              key={item.id}
              className="flex gap-3 border-b border-border px-4 py-3 last:border-0"
            >
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-accent text-primary">
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-5 text-foreground">
                  <span className="font-medium">{item.actor}</span>{" "}
                  {item.action}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.when} · {item.organization}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
