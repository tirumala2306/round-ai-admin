"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card px-6 py-16 text-center">
      <h2 className="text-base font-semibold tracking-tight text-foreground">
        This page could not be displayed
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        The administration screen ran into a problem. Try loading it again.
      </p>
      {error.digest ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Reference {error.digest}
        </p>
      ) : null}
      <Button type="button" className="mt-6" onClick={() => reset()}>
        Try again
      </Button>
    </section>
  );
}
