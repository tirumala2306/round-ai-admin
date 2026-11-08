export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <div className="space-y-2">
        <div className="h-4 w-36 rounded bg-muted" />
        <div className="h-6 w-40 rounded bg-muted" />
        <div className="h-4 w-full max-w-xl rounded bg-muted" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-24 rounded-lg border border-border bg-card"
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-80 rounded-lg border border-border bg-card" />
        <div className="h-80 rounded-lg border border-border bg-card" />
      </div>
    </div>
  );
}
