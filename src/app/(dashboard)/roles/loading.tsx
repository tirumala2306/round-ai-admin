export default function RolesLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading roles</span>
      <div className="h-4 w-full max-w-xl rounded bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-20 rounded-lg border border-border bg-card" />
        ))}
      </div>
      <div className="h-80 rounded-lg border border-border bg-card" />
    </div>
  );
}
