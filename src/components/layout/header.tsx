"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SheetTrigger } from "@/components/ui/sheet";
import { getActiveModule } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { resolveAuthContext } from "@/features/auth/auth-service";
import { endDemoSession, useAuthSession } from "@/features/auth/session";
import { useIsClient, useOrganizationDirectory } from "@/features/organizations/demo-store";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const current = getActiveModule(pathname);
  const directory = useOrganizationDirectory();
  const isClient = useIsClient();
  const userId = useAuthSession();
  const account =
    isClient && userId ? resolveAuthContext(directory, userId) : undefined;
  const initials = account
    ? account.user.name
        .split(" ")
        .filter((part) => part.length > 0)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
    : "—";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <div className="min-w-0 flex-1">
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">{siteConfig.adminLabel}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">
                {current.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
          {current.title}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            readOnly
            tabIndex={-1}
            aria-label="Search administration"
            title="Search is not available yet"
            placeholder="Search administration"
            className="w-56 bg-card pl-8 lg:w-72"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Notifications"
            >
              <Bell />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground">
                Notifications
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                No live notifications. This control is visual until the
                platform is connected.
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg py-1 pr-1 pl-1 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring md:pr-2"
              aria-label={account ? `${account.user.name} account` : "Account"}
            >
              <Avatar size="sm">
                <AvatarFallback className="bg-primary text-[10px] font-medium text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-left md:block">
                <span className="block text-sm leading-4 font-medium text-foreground">
                  {account?.user.name ?? "Account"}
                </span>
                <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
                  {account?.roleName ?? "Demo session"}
                </span>
              </span>
              <ChevronDown
                className="hidden size-3.5 text-muted-foreground md:block"
                aria-hidden="true"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="px-1.5 py-1.5">
              <p className="text-sm font-medium text-foreground">
                {account?.user.name ?? "Account"}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {account
                  ? `${account.roleName} · ${account.organizationName}`
                  : "Demo session. This sign-in is not production security."}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Profile</DropdownMenuItem>
            <DropdownMenuItem disabled>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                endDemoSession();
                router.replace("/sign-in");
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
