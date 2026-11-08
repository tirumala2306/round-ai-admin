"use client";

import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function BrandLockup({
  collapsed = false,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  const lockup = (
    <Link
      href="/dashboard"
      aria-label={`${siteConfig.name} ${siteConfig.adminLabel}`}
      className={cn(
        "flex items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        collapsed ? "justify-center" : "w-full",
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center overflow-hidden",
          collapsed ? "size-10" : "h-11 w-full max-w-[11.5rem]",
        )}
      >
        <Image
          src="/roundsai-wordmark.png"
          alt=""
          width={2172}
          height={724}
          unoptimized
          priority
          className="h-full w-full object-contain"
        />
      </span>
    </Link>
  );

  if (!collapsed) {
    return lockup;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{lockup}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {siteConfig.name}
      </TooltipContent>
    </Tooltip>
  );
}
