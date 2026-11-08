"use client";

import { useState } from "react";
import { CategoriesPanel } from "@/components/knowledge-base/categories-panel";
import { DocumentsPanel } from "@/components/knowledge-base/documents-panel";
import { EvidencePanel } from "@/components/knowledge-base/evidence-panel";
import { GuidelinesPanel } from "@/components/knowledge-base/guidelines-panel";
import { OverviewPanel } from "@/components/knowledge-base/overview-panel";
import { SourcesPanel } from "@/components/knowledge-base/sources-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasPermission, isAdminRole, resolveAuthContext } from "@/features/auth/auth-service";
import { useAuthSession } from "@/features/auth/session";
import { knowledgeBaseModule, knowledgeBasePermissionId } from "@/features/knowledge-base";
import { useIsClient, useOrganizationDirectory } from "@/features/organizations/demo-store";

export function KnowledgeBaseScreen() {
  const directory = useOrganizationDirectory();
  const isClient = useIsClient();
  const userId = useAuthSession();
  const [tab, setTab] = useState("overview");
  const context = userId ? resolveAuthContext(directory, userId) : undefined;
  const allowed = Boolean(
    context && isAdminRole(context.roleName) && hasPermission(context, knowledgeBasePermissionId),
  );

  if (!isClient) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <span className="sr-only">Loading knowledge base</span>
        <div className="h-16 rounded-lg border border-border bg-card" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <section className="max-w-xl rounded-lg border border-border bg-card px-4 py-6">
        <h2 className="text-base font-semibold tracking-tight">Knowledge base is unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Manage Knowledge Base is limited to hospital administrators whose role includes that permission.
        </p>
      </section>
    );
  }

  const reviewerName = context?.user.name ?? "Hospital Admin";

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{knowledgeBaseModule.summary}</p>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto! w-full flex-wrap justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Knowledge Sources</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="guidelines">Clinical Guidelines</TabsTrigger>
          <TabsTrigger value="evidence">Evidence Library</TabsTrigger>
          <TabsTrigger value="categories">Categories & Tags</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-4">
          <OverviewPanel knowledge={directory.knowledgeBase} />
        </TabsContent>
        <TabsContent value="sources" className="pt-4">
          <SourcesPanel knowledge={directory.knowledgeBase} />
        </TabsContent>
        <TabsContent value="documents" className="pt-4">
          <DocumentsPanel knowledge={directory.knowledgeBase} reviewerName={reviewerName} />
        </TabsContent>
        <TabsContent value="guidelines" className="pt-4">
          <GuidelinesPanel knowledge={directory.knowledgeBase} reviewerName={reviewerName} />
        </TabsContent>
        <TabsContent value="evidence" className="pt-4">
          <EvidencePanel knowledge={directory.knowledgeBase} reviewerName={reviewerName} />
        </TabsContent>
        <TabsContent value="categories" className="pt-4">
          <CategoriesPanel knowledge={directory.knowledgeBase} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
