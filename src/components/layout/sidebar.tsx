"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { BrandLockup } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  isNavItemActive,
  mainNavigation,
  utilityNavigation,
} from "@/config/navigation";
import { cn } from "@/lib/utils";
import type { AdminModule } from "@/types/navigation";

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 border-r border-sidebar-border bg-sidebar lg:flex",
        collapsed ? "w-[4.5rem]" : "w-64",
      )}
    >
      <SidebarPanel collapsed={collapsed} onToggle={onToggle} />
    </aside>
  );
}

export function SidebarPanel({
  collapsed,
  onToggle,
  onNavigate,
  reserveMenuClose = false,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  reserveMenuClose?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-2" : "px-4",
          reserveMenuClose && "pr-12",
        )}
      >
        <BrandLockup collapsed={collapsed} />
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <nav aria-label="Primary" className="flex flex-col gap-5 px-2 py-4">
          {mainNavigation.map((group, index) => (
            <div key={group.label} className="flex flex-col gap-1">
              {collapsed ? (
                index > 0 ? (
                  <div className="mx-auto mb-1 h-px w-6 bg-sidebar-border" />
                ) : null
              ) : (
                <p className="px-3 pb-1 text-[11px] font-medium tracking-[0.08em] text-sidebar-foreground/55 uppercase">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  active={isNavItemActive(pathname, item.href)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ))}
        </nav>
      </ScrollArea>
      <div className="shrink-0 border-t border-sidebar-border p-2">
        {utilityNavigation.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            active={isNavItemActive(pathname, item.href)}
            onNavigate={onNavigate}
          />
        ))}
        {onToggle ? (
          <Button
            type="button"
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "mt-1 text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              collapsed ? "w-full" : "w-full justify-start px-2.5",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen />
            ) : (
              <>
                <PanelLeftClose />
                Collapse
              </>
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function SidebarLink({
  item,
  collapsed,
  active,
  onNavigate,
}: {
  item: AdminModule;
  collapsed: boolean;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 items-center rounded-lg text-sm text-sidebar-foreground/80 outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        collapsed ? "justify-center" : "pr-2",
        active &&
          "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-[inset_3px_0_0_0_var(--sidebar-primary)]",
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      {collapsed ? (
        <span className="sr-only">{item.title}</span>
      ) : (
        <span className="truncate">{item.title}</span>
      )}
    </Link>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.title}
      </TooltipContent>
    </Tooltip>
  );
}
