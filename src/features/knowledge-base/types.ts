export const knowledgeSourceTypes = [
  "Citation index",
  "Public health guidance",
  "Hospital library",
  "Internal documents",
] as const;

export const knowledgeActiveStatuses = ["Active", "Inactive"] as const;

export const knowledgeDocumentTypes = [
  "Reference summary",
  "Hospital policy",
  "Education outline",
  "Source index",
] as const;

export const knowledgeEvidenceTypes = [
  "Clinical Study",
  "Systematic Review",
  "Meta-analysis",
  "Clinical Guideline",
  "Research Article",
] as const;

export const knowledgeReviewStatuses = [
  "Draft",
  "Pending Review",
  "Approved",
  "Rejected",
  "Archived",
] as const;

export const knowledgeReviewActions = ["submit", "approve", "reject", "archive", "restore"] as const;

/** Existing hospital-admin permission set gains this id. No new role is created. */
export const knowledgeBasePermissionId = "knowledge.manage";

export type KnowledgeSourceType = (typeof knowledgeSourceTypes)[number];
export type KnowledgeActiveStatus = (typeof knowledgeActiveStatuses)[number];
export type KnowledgeDocumentType = (typeof knowledgeDocumentTypes)[number];
export type KnowledgeEvidenceType = (typeof knowledgeEvidenceTypes)[number];
export type KnowledgeReviewStatus = (typeof knowledgeReviewStatuses)[number];
export type KnowledgeReviewAction = (typeof knowledgeReviewActions)[number];

export type KnowledgeReviewEvent = {
  id: string;
  status: KnowledgeReviewStatus;
  notes: string;
  reviewedAt: string;
  reviewerName: string;
};

export type KnowledgeSource = {
  id: string;
  name: string;
  sourceType: KnowledgeSourceType;
  description: string;
  url: string;
  status: KnowledgeActiveStatus;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeCategory = {
  id: string;
  name: string;
  description: string;
  status: KnowledgeActiveStatus;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeTag = {
  id: string;
  name: string;
  status: KnowledgeActiveStatus;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeDocument = {
  id: string;
  title: string;
  description: string;
  documentType: KnowledgeDocumentType;
  categoryId: string;
  tagIds: string[];
  sourceId: string;
  referenceUrl: string;
  version: string;
  publicationDate: string;
  reviewStatus: KnowledgeReviewStatus;
  reviewerNotes: string;
  reviewHistory: KnowledgeReviewEvent[];
  uploadedAt: string;
  updatedAt: string;
};

export type ClinicalGuidelineRecord = {
  id: string;
  title: string;
  description: string;
  specialtyId: string;
  publishingOrganization: string;
  publicationDate: string;
  version: string;
  sourceId: string;
  referenceUrl: string;
  tagIds: string[];
  reviewStatus: KnowledgeReviewStatus;
  reviewerNotes: string;
  lastReviewedAt: string;
  reviewHistory: KnowledgeReviewEvent[];
  createdAt: string;
  updatedAt: string;
};

export type EvidenceRecord = {
  id: string;
  title: string;
  authors: string;
  journal: string;
  publicationYear: number;
  doi: string;
  pmid: string;
  referenceUrl: string;
  evidenceType: KnowledgeEvidenceType;
  categoryId: string;
  tagIds: string[];
  reviewStatus: KnowledgeReviewStatus;
  reviewerNotes: string;
  reviewHistory: KnowledgeReviewEvent[];
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeBase = {
  sources: KnowledgeSource[];
  categories: KnowledgeCategory[];
  tags: KnowledgeTag[];
  documents: KnowledgeDocument[];
  guidelines: ClinicalGuidelineRecord[];
  evidence: EvidenceRecord[];
};

export type KnowledgeSourceFormValues = {
  name: string;
  sourceType: KnowledgeSourceType;
  description: string;
  url: string;
  status: KnowledgeActiveStatus;
};

export type KnowledgeCategoryFormValues = {
  name: string;
  description: string;
  status: KnowledgeActiveStatus;
};

export type KnowledgeTagFormValues = {
  name: string;
  status: KnowledgeActiveStatus;
};

export type KnowledgeDocumentFormValues = {
  title: string;
  description: string;
  documentType: KnowledgeDocumentType;
  categoryId: string;
  tagIds: string[];
  sourceId: string;
  referenceUrl: string;
  version: string;
  publicationDate: string;
};

export type GuidelineFormValues = {
  title: string;
  description: string;
  specialtyId: string;
  publishingOrganization: string;
  publicationDate: string;
  version: string;
  sourceId: string;
  referenceUrl: string;
  tagIds: string[];
};

export type EvidenceFormValues = {
  title: string;
  authors: string;
  journal: string;
  publicationYear: number;
  doi: string;
  pmid: string;
  referenceUrl: string;
  evidenceType: KnowledgeEvidenceType;
  categoryId: string;
  tagIds: string[];
};

export type KnowledgeWriteResult<T = undefined> =
  | { ok: true; value: T }
  | { ok: false; message: string };

export type KnowledgeFieldIssue = {
  path: string;
  message: string;
};

export type DocumentFilters = {
  search: string;
  categoryId: string;
  sourceId: string;
  documentType: string;
  reviewStatus: string;
};

export type GuidelineFilters = {
  search: string;
  specialtyId: string;
  reviewStatus: string;
};

export type EvidenceFilters = {
  search: string;
  categoryId: string;
  evidenceType: string;
  reviewStatus: string;
};
