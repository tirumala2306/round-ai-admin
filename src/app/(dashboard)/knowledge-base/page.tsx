import type { Metadata } from "next";
import { KnowledgeBaseScreen } from "@/components/knowledge-base/knowledge-base-screen";
import { knowledgeBaseModule } from "@/features/knowledge-base";

export const metadata: Metadata = {
  title: knowledgeBaseModule.title,
};

export default function KnowledgeBasePage() {
  return <KnowledgeBaseScreen />;
}
