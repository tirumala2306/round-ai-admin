import type { FoundationModule } from "@/types/navigation";

export function ModuleFoundation({ module }: { module: FoundationModule }) {
  const Icon = module.icon;

  return (
    <section className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        {module.summary}
      </p>
      <div className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
        <div className="mx-auto grid size-11 place-items-center rounded-lg bg-accent text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-base font-semibold tracking-tight text-foreground">
          {module.emptyTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {module.emptyDescription}
        </p>
      </div>
    </section>
  );
}
