import type { LucideIcon } from "lucide-react";

export function StatCards({
  items,
}: {
  items: { label: string; value: number; icon: LucideIcon }[];
}) {
  return (
    <section aria-label="Sample totals" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.label}
            className="rounded-lg border border-border bg-card px-4 py-3.5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <span className="grid size-8 place-items-center rounded-lg bg-accent text-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
              {item.value.toLocaleString("en-US")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Sample total</p>
          </article>
        );
      })}
    </section>
  );
}
