"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { OrganizationToast } from "@/components/organizations/organization-toast";
import { Sidebar, SidebarPanel } from "@/components/layout/sidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <TooltipProvider>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="flex min-h-svh bg-background">
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((value) => !value)}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header />
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                {children}
              </div>
            </main>
          </div>
        </div>
        <SheetContent
          side="left"
          className="w-72 gap-0 bg-sidebar p-0 text-sidebar-foreground sm:max-w-72"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Administration sections</SheetDescription>
          </SheetHeader>
          <SidebarPanel
            collapsed={false}
            reserveMenuClose
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
      <OrganizationToast />
    </TooltipProvider>
  );
}
