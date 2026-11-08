import type { Metadata } from "next";
import { AuditLogsScreen } from "@/components/audit-logs/audit-logs-screen";
import { auditLogsModule } from "@/features/audit-logs";

export const metadata: Metadata = {
  title: auditLogsModule.title,
};

export default function AuditLogsPage() {
  return <AuditLogsScreen />;
}
