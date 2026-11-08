export default function AuditLogsLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading audit logs</span>
      <div className="h-16 rounded-lg bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 rounded-lg border border-border bg-card" />
        ))}
      </div>
      <div className="h-96 rounded-lg border border-border bg-card" />
    </div>
  );
}
