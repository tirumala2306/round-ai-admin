import Image from "next/image";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-2">
      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 inline-flex h-12 items-center rounded-lg bg-foreground px-3">
            <Image
              src="/roundsai-wordmark.png"
              alt={siteConfig.name}
              width={2172}
              height={724}
              unoptimized
              priority
              className="h-8 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
      <aside className="flex min-h-64 items-center bg-foreground px-6 py-10 text-sidebar-foreground sm:px-10 lg:min-h-svh lg:px-14">
        <div className="mx-auto flex w-full max-w-lg flex-col items-start gap-6">
          <div className="w-full rounded-lg bg-sidebar-accent/40 p-6">
            <Image
              src="/roundsai-brand-visual.png"
              alt=""
              width={1536}
              height={1024}
              unoptimized
              className="mx-auto h-auto max-h-72 w-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Smarter Clinical Operations</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-sidebar-foreground/80">
              Manage organizations, clinical teams, and AI-powered workflows from one administrative
              workspace.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
