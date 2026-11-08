"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminRole, resolveAuthContext } from "@/features/auth/auth-service";
import { endDemoSession, useAuthSession } from "@/features/auth/session";
import { useIsClient, useOrganizationDirectory } from "@/features/organizations/demo-store";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isClient = useIsClient();
  const directory = useOrganizationDirectory();
  const userId = useAuthSession();

  useEffect(() => {
    if (!isClient) {
      return;
    }

    if (!userId) {
      router.replace("/sign-in");
      return;
    }

    const context = resolveAuthContext(directory, userId);
    if (!context || !isAdminRole(context.roleName)) {
      endDemoSession();
      router.replace("/sign-in");
    }
  }, [directory, isClient, router, userId]);

  return children;
}
