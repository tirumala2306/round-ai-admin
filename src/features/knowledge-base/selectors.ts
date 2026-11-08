import type {
  ClinicalGuidelineRecord,
  EvidenceFormValues,
  EvidenceRecord,
  GuidelineFormValues,
  KnowledgeBase,
  KnowledgeCategoryFormValues,
  KnowledgeDocument,
  KnowledgeDocumentFormValues,
  KnowledgeFieldIssue,
  KnowledgeReviewAction,
  KnowledgeReviewStatus,
  KnowledgeSourceFormValues,
  KnowledgeTagFormValues,
} from "@/features/knowledge-base/types";

function sameName(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function issue(path: string, message: string): KnowledgeFieldIssue {
  return { path, message };
}

export function optionalUrlIssue(value: string) {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  if (!/^https?:\/\/\S+$/.test(trimmed)) {
    return "Enter an http or https URL, or leave this blank.";
  }
  return undefined;
}

export function isoDateIssue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return "Enter a publication date.";
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return "Enter a real publication date.";
  }
  return undefined;
}

export function sourceById(knowledge: KnowledgeBase, sourceId: string) {
  return knowledge.sources.find((source) => source.id === sourceId);
}

export function categoryById(knowledge: KnowledgeBase, categoryId: string) {
  return knowledge.categories.find((category) => category.id === categoryId);
}

export function tagById(knowledge: KnowledgeBase, tagId: string) {
  return knowledge.tags.find((tag) => tag.id === tagId);
}

export function categoryUsage(knowledge: KnowledgeBase, categoryId: string) {
  return {
    documents: knowledge.documents.filter((item) => item.categoryId === categoryId).length,
    guidelines: knowledge.guidelines.filter((item) => item.specialtyId === categoryId).length,
    evidence: knowledge.evidence.filter((item) => item.categoryId === categoryId).length,
  };
}

export function tagUsage(knowledge: KnowledgeBase, tagId: string) {
  return {
    documents: knowledge.documents.filter((item) => item.tagIds.includes(tagId)).length,
    guidelines: knowledge.guidelines.filter((item) => item.tagIds.includes(tagId)).length,
    evidence: knowledge.evidence.filter((item) => item.tagIds.includes(tagId)).length,
  };
}

export function categoryInUse(knowledge: KnowledgeBase, categoryId: string) {
  const usage = categoryUsage(knowledge, categoryId);
  return usage.documents + usage.guidelines + usage.evidence > 0;
}

export function tagInUse(knowledge: KnowledgeBase, tagId: string) {
  const usage = tagUsage(knowledge, tagId);
  return usage.documents + usage.guidelines + usage.evidence > 0;
}

export function selectableCategories(knowledge: KnowledgeBase, currentId?: string) {
  return knowledge.categories.filter(
    (category) => category.status === "Active" || category.id === currentId,
  );
}

export function selectableSources(knowledge: KnowledgeBase, currentId?: string) {
  return knowledge.sources.filter((source) => source.status === "Active" || source.id === currentId);
}

export function selectableTags(knowledge: KnowledgeBase, selectedIds: string[]) {
  const selected = new Set(selectedIds);
  return knowledge.tags.filter((tag) => tag.status === "Active" || selected.has(tag.id));
}

export function nextKnowledgeReviewStatus(
  status: KnowledgeReviewStatus,
  action: KnowledgeReviewAction,
): KnowledgeReviewStatus | undefined {
  if (action === "submit" && (status === "Draft" || status === "Rejected")) {
    return "Pending Review";
  }
  if (action === "approve" && status === "Pending Review") {
    return "Approved";
  }
  if (action === "reject" && status === "Pending Review") {
    return "Rejected";
  }
  if (action === "archive" && status === "Approved") {
    return "Archived";
  }
  if (action === "restore" && status === "Archived") {
    return "Draft";
  }
  return undefined;
}

export function reviewActionIssue(
  status: KnowledgeReviewStatus,
  action: KnowledgeReviewAction,
  notes: string,
) {
  if (!nextKnowledgeReviewStatus(status, action)) {
    return "That review step is not available for this record.";
  }
  if (action === "reject" && notes.trim().length === 0) {
    return "Enter reviewer notes before rejecting this record.";
  }
  if (notes.trim().length > 400) {
    return "Use 400 characters or fewer for reviewer notes.";
  }
  return undefined;
}

export function sourceFieldIssues(
  knowledge: KnowledgeBase,
  values: KnowledgeSourceFormValues,
  exceptSourceId?: string,
) {
  const issues: KnowledgeFieldIssue[] = [];
  const duplicate = knowledge.sources.some(
    (source) => source.id !== exceptSourceId && sameName(source.name, values.name),
  );
  if (duplicate) {
    issues.push(issue("name", "A knowledge source with this name is already in the sample list."));
  }
  const urlIssue = optionalUrlIssue(values.url);
  if (urlIssue) {
    issues.push(issue("url", urlIssue));
  }
  return issues;
}

function classificationIssues(
  knowledge: KnowledgeBase,
  categoryId: string,
  sourceId: string,
  tagIds: string[],
  currentCategoryId?: string,
  currentSourceId?: string,
) {
  const issues: KnowledgeFieldIssue[] = [];
  const category = categoryById(knowledge, categoryId);
  if (!category || (category.status !== "Active" && category.id !== currentCategoryId)) {
    issues.push(issue("categoryId", "Select an active category."));
  }
  const source = sourceById(knowledge, sourceId);
  if (!source || (source.status !== "Active" && source.id !== currentSourceId)) {
    issues.push(issue("sourceId", "Select an active knowledge source."));
  }
  const unknownTag = tagIds.some((tagId) => !tagById(knowledge, tagId));
  if (unknownTag) {
    issues.push(issue("tagIds", "Choose tags from this sample list."));
  }
  return issues;
}

export function documentFieldIssues(
  knowledge: KnowledgeBase,
  values: KnowledgeDocumentFormValues,
  exceptDocumentId?: string,
) {
  const current = knowledge.documents.find((item) => item.id === exceptDocumentId);
  const issues: KnowledgeFieldIssue[] = [];
  if (current?.reviewStatus === "Archived") {
    issues.push(issue("title", "Restore this archived record before editing it."));
  }
  const duplicate = knowledge.documents.some(
    (item) => item.id !== exceptDocumentId && sameName(item.title, values.title),
  );
  if (duplicate) {
    issues.push(issue("title", "A document with this title is already in the sample list."));
  }
  const dateIssue = isoDateIssue(values.publicationDate);
  if (dateIssue) {
    issues.push(issue("publicationDate", dateIssue));
  }
  const urlIssue = optionalUrlIssue(values.referenceUrl);
  if (urlIssue) {
    issues.push(issue("referenceUrl", urlIssue));
  }
  issues.push(
    ...classificationIssues(
      knowledge,
      values.categoryId,
      values.sourceId,
      values.tagIds,
      current?.categoryId,
      current?.sourceId,
    ),
  );
  return issues;
}

export function guidelineFieldIssues(
  knowledge: KnowledgeBase,
  values: GuidelineFormValues,
  exceptGuidelineId?: string,
) {
  const current = knowledge.guidelines.find((item) => item.id === exceptGuidelineId);
  const issues: KnowledgeFieldIssue[] = [];
  if (current?.reviewStatus === "Archived") {
    issues.push(issue("title", "Restore this archived record before editing it."));
  }
  const duplicate = knowledge.guidelines.some(
    (item) => item.id !== exceptGuidelineId && sameName(item.title, values.title),
  );
  if (duplicate) {
    issues.push(issue("title", "A guideline with this title is already in the sample list."));
  }
  const dateIssue = isoDateIssue(values.publicationDate);
  if (dateIssue) {
    issues.push(issue("publicationDate", dateIssue));
  }
  const urlIssue = optionalUrlIssue(values.referenceUrl);
  if (urlIssue) {
    issues.push(issue("referenceUrl", urlIssue));
  }
  const category = categoryById(knowledge, values.specialtyId);
  if (!category || (category.status !== "Active" && category.id !== current?.specialtyId)) {
    issues.push(issue("specialtyId", "Select an active specialty."));
  }
  const source = sourceById(knowledge, values.sourceId);
  if (!source || (source.status !== "Active" && source.id !== current?.sourceId)) {
    issues.push(issue("sourceId", "Select an active knowledge source."));
  }
  if (values.tagIds.some((tagId) => !tagById(knowledge, tagId))) {
    issues.push(issue("tagIds", "Choose tags from this sample list."));
  }
  return issues;
}

export function evidenceFieldIssues(
  knowledge: KnowledgeBase,
  values: EvidenceFormValues,
  exceptEvidenceId?: string,
) {
  const current = knowledge.evidence.find((item) => item.id === exceptEvidenceId);
  const issues: KnowledgeFieldIssue[] = [];
  if (current?.reviewStatus === "Archived") {
    issues.push(issue("title", "Restore this archived record before editing it."));
  }
  const duplicate = knowledge.evidence.some(
    (item) => item.id !== exceptEvidenceId && sameName(item.title, values.title),
  );
  if (duplicate) {
    issues.push(issue("title", "An evidence record with this title is already in the sample list."));
  }
  const urlIssue = optionalUrlIssue(values.referenceUrl);
  if (urlIssue) {
    issues.push(issue("referenceUrl", urlIssue));
  }
  const category = categoryById(knowledge, values.categoryId);
  if (!category || (category.status !== "Active" && category.id !== current?.categoryId)) {
    issues.push(issue("categoryId", "Select an active category."));
  }
  if (values.tagIds.some((tagId) => !tagById(knowledge, tagId))) {
    issues.push(issue("tagIds", "Choose tags from this sample list."));
  }
  return issues;
}

export function categoryFieldIssues(
  knowledge: KnowledgeBase,
  values: KnowledgeCategoryFormValues,
  exceptCategoryId?: string,
) {
  const issues: KnowledgeFieldIssue[] = [];
  const duplicate = knowledge.categories.some(
    (category) => category.id !== exceptCategoryId && sameName(category.name, values.name),
  );
  if (duplicate) {
    issues.push(issue("name", "A category with this name is already in the sample list."));
  }
  if (
    values.status === "Inactive" &&
    exceptCategoryId &&
    categoryInUse(knowledge, exceptCategoryId)
  ) {
    issues.push(
      issue(
        "status",
        "Reassign documents, guidelines, or evidence that use this category before disabling it.",
      ),
    );
  }
  return issues;
}

export function tagFieldIssues(
  knowledge: KnowledgeBase,
  values: KnowledgeTagFormValues,
  exceptTagId?: string,
) {
  const issues: KnowledgeFieldIssue[] = [];
  const duplicate = knowledge.tags.some(
    (tag) => tag.id !== exceptTagId && sameName(tag.name, values.name),
  );
  if (duplicate) {
    issues.push(issue("name", "A tag with this name is already in the sample list."));
  }
  if (values.status === "Inactive" && exceptTagId && tagInUse(knowledge, exceptTagId)) {
    issues.push(
      issue("status", "Reassign records that use this tag before disabling it."),
    );
  }
  return issues;
}

export function toSourceFormValues(source: KnowledgeBase["sources"][number]): KnowledgeSourceFormValues {
  return {
    name: source.name,
    sourceType: source.sourceType,
    description: source.description,
    url: source.url,
    status: source.status,
  };
}

export function toCategoryFormValues(category: KnowledgeBase["categories"][number]): KnowledgeCategoryFormValues {
  return { name: category.name, description: category.description, status: category.status };
}

export function toTagFormValues(tag: KnowledgeBase["tags"][number]): KnowledgeTagFormValues {
  return { name: tag.name, status: tag.status };
}

export function toDocumentFormValues(document: KnowledgeDocument): KnowledgeDocumentFormValues {
  return {
    title: document.title,
    description: document.description,
    documentType: document.documentType,
    categoryId: document.categoryId,
    tagIds: [...document.tagIds],
    sourceId: document.sourceId,
    referenceUrl: document.referenceUrl,
    version: document.version,
    publicationDate: document.publicationDate,
  };
}

export function toGuidelineFormValues(guideline: ClinicalGuidelineRecord): GuidelineFormValues {
  return {
    title: guideline.title,
    description: guideline.description,
    specialtyId: guideline.specialtyId,
    publishingOrganization: guideline.publishingOrganization,
    publicationDate: guideline.publicationDate,
    version: guideline.version,
    sourceId: guideline.sourceId,
    referenceUrl: guideline.referenceUrl,
    tagIds: [...guideline.tagIds],
  };
}

export function toEvidenceFormValues(record: EvidenceRecord): EvidenceFormValues {
  return {
    title: record.title,
    authors: record.authors,
    journal: record.journal,
    publicationYear: record.publicationYear,
    doi: record.doi,
    pmid: record.pmid,
    referenceUrl: record.referenceUrl,
    evidenceType: record.evidenceType,
    categoryId: record.categoryId,
    tagIds: [...record.tagIds],
  };
}

export function latestReviewDate(history: { reviewedAt: string }[]) {
  return history.reduce((latest, event) => (event.reviewedAt > latest ? event.reviewedAt : latest), "");
}

export function summarizeKnowledge(knowledge: KnowledgeBase) {
  const pendingReview = knowledge.documents.filter((item) => item.reviewStatus === "Pending Review").length;
  const recentDocuments = [...knowledge.documents]
    .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt) || left.title.localeCompare(right.title))
    .slice(0, 4);
  const recentlyReviewed = [...knowledge.documents]
    .map((document) => ({ document, reviewedAt: latestReviewDate(document.reviewHistory) }))
    .filter((item) => item.reviewedAt.length > 0)
    .sort(
      (left, right) =>
        right.reviewedAt.localeCompare(left.reviewedAt) ||
        left.document.title.localeCompare(right.document.title),
    )
    .slice(0, 4);
  const documentsByCategory = [...knowledge.categories]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((category) => ({
      id: category.id,
      name: category.name,
      count: knowledge.documents.filter((document) => document.categoryId === category.id).length,
    }));

  return {
    totalDocuments: knowledge.documents.length,
    approvedDocuments: knowledge.documents.filter((item) => item.reviewStatus === "Approved").length,
    pendingReview,
    guidelineCount: knowledge.guidelines.length,
    activeSources: knowledge.sources.filter((source) => source.status === "Active").length,
    recentDocuments,
    recentlyReviewed,
    documentsByCategory,
  };
}

export function tagNames(knowledge: KnowledgeBase, tagIds: string[]) {
  return tagIds.map((tagId) => tagById(knowledge, tagId)?.name ?? "Unknown tag");
}
