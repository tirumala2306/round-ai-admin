import { Suspense } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { AppShell } from "@/components/layout/app-shell";
import { ShellFallback } from "@/components/layout/shell-fallback";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <AppShell>
        <AuthGate>{children}</AuthGate>
      </AppShell>
    </Suspense>
  );
}
