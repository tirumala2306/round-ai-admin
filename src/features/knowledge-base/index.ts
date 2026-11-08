import { Library } from "lucide-react";
import type { FoundationModule } from "@/types/navigation";

export const knowledgeBaseModule = {
  title: "Knowledge Base",
  href: "/knowledge-base",
  icon: Library,
  description: "Sample clinical reference metadata.",
  summary:
    "Manage fictional clinical reference metadata for this browser session. Approval is administrative only and does not clinically verify a record. No files are stored and no outside library is contacted.",
  emptyTitle: "No knowledge records",
  emptyDescription:
    "Knowledge records in this demo stay in the browser and are not saved to the RoundsAI backend.",
} satisfies FoundationModule;

export { sampleKnowledgeBase } from "@/features/knowledge-base/sample-data";
export {
  emptyDocumentFilters,
  emptyEvidenceFilters,
  emptyGuidelineFilters,
  filterDocuments,
  filterEvidence,
  filterGuidelines,
  knowledgePageSize,
  paginateKnowledge,
} from "@/features/knowledge-base/query";
export {
  categoryById,
  categoryInUse,
  categoryUsage,
  latestReviewDate,
  nextKnowledgeReviewStatus,
  selectableCategories,
  selectableSources,
  selectableTags,
  sourceById,
  summarizeKnowledge,
  tagById,
  tagInUse,
  tagNames,
  tagUsage,
  toCategoryFormValues,
  toDocumentFormValues,
  toEvidenceFormValues,
  toGuidelineFormValues,
  toSourceFormValues,
  toTagFormValues,
} from "@/features/knowledge-base/selectors";
export {
  createEvidenceSchema,
  createGuidelineSchema,
  createKnowledgeCategorySchema,
  createKnowledgeDocumentSchema,
  createKnowledgeSourceSchema,
  createKnowledgeTagSchema,
  emptyEvidenceForm,
  emptyGuidelineForm,
  emptyKnowledgeCategoryForm,
  emptyKnowledgeDocumentForm,
  emptyKnowledgeSourceForm,
  emptyKnowledgeTagForm,
  rejectNotesSchema,
  reviewNotesSchema,
} from "@/features/knowledge-base/schema";
export {
  knowledgeActiveStatuses,
  knowledgeBasePermissionId,
  knowledgeDocumentTypes,
  knowledgeEvidenceTypes,
  knowledgeReviewActions,
  knowledgeReviewStatuses,
  knowledgeSourceTypes,
} from "@/features/knowledge-base/types";
export type {
  ClinicalGuidelineRecord,
  DocumentFilters,
  EvidenceFilters,
  EvidenceFormValues,
  EvidenceRecord,
  GuidelineFilters,
  GuidelineFormValues,
  KnowledgeBase,
  KnowledgeCategory,
  KnowledgeCategoryFormValues,
  KnowledgeDocument,
  KnowledgeDocumentFormValues,
  KnowledgeReviewAction,
  KnowledgeReviewStatus,
  KnowledgeSource,
  KnowledgeSourceFormValues,
  KnowledgeTag,
  KnowledgeTagFormValues,
  KnowledgeWriteResult,
} from "@/features/knowledge-base/types";
