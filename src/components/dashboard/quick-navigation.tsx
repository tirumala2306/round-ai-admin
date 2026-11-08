import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { adminModules } from "@/config/navigation";

export function QuickNavigation() {
  const links = adminModules.filter((item) => item.href !== "/dashboard");

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Administrative modules
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Open a section of the administration workspace
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-start gap-3 rounded-lg border border-border bg-card p-3.5 shadow-sm outline-none transition-colors hover:border-primary/25 hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {item.title}
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground group-hover:text-primary"
                    aria-hidden="true"
                  />
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
