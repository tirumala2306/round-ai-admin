export function ShellFallback() {
  return (
    <div className="flex min-h-svh bg-background">
      <div className="hidden w-64 border-r border-sidebar-border bg-sidebar lg:block" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-16 border-b border-border bg-card" />
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto h-48 w-full max-w-7xl rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
