export default function SystemSettingsLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading system settings</span>
      <div className="h-4 w-full max-w-xl rounded bg-muted" />
      <div className="h-80 rounded-lg border border-border bg-card" />
    </div>
  );
}
