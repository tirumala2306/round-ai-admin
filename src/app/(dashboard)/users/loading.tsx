export default function UsersLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading users</span>
      <div className="h-4 w-full max-w-xl rounded bg-muted" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-20 rounded-lg border border-border bg-card"
          />
        ))}
      </div>
      <div className="h-80 rounded-lg border border-border bg-card" />
    </div>
  );
}
