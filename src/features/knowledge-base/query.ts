import type {
  ClinicalGuidelineRecord,
  DocumentFilters,
  EvidenceFilters,
  EvidenceRecord,
  GuidelineFilters,
  KnowledgeDocument,
} from "@/features/knowledge-base/types";

export const knowledgePageSize = 5;

export const emptyDocumentFilters: DocumentFilters = {
  search: "",
  categoryId: "All",
  sourceId: "All",
  documentType: "All",
  reviewStatus: "All",
};

export const emptyGuidelineFilters: GuidelineFilters = {
  search: "",
  specialtyId: "All",
  reviewStatus: "All",
};

export const emptyEvidenceFilters: EvidenceFilters = {
  search: "",
  categoryId: "All",
  evidenceType: "All",
  reviewStatus: "All",
};

export function filterDocuments(documents: KnowledgeDocument[], filters: DocumentFilters) {
  const query = filters.search.trim().toLowerCase();
  return documents.filter((document) => {
    if (filters.categoryId !== "All" && document.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.sourceId !== "All" && document.sourceId !== filters.sourceId) {
      return false;
    }
    if (filters.documentType !== "All" && document.documentType !== filters.documentType) {
      return false;
    }
    if (filters.reviewStatus !== "All" && document.reviewStatus !== filters.reviewStatus) {
      return false;
    }
    if (query.length === 0) {
      return true;
    }
    return document.title.toLowerCase().includes(query);
  });
}

export function filterGuidelines(guidelines: ClinicalGuidelineRecord[], filters: GuidelineFilters) {
  const query = filters.search.trim().toLowerCase();
  return guidelines.filter((guideline) => {
    if (filters.specialtyId !== "All" && guideline.specialtyId !== filters.specialtyId) {
      return false;
    }
    if (filters.reviewStatus !== "All" && guideline.reviewStatus !== filters.reviewStatus) {
      return false;
    }
    if (query.length === 0) {
      return true;
    }
    return guideline.title.toLowerCase().includes(query);
  });
}

export function filterEvidence(records: EvidenceRecord[], filters: EvidenceFilters) {
  const query = filters.search.trim().toLowerCase();
  return records.filter((record) => {
    if (filters.categoryId !== "All" && record.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.evidenceType !== "All" && record.evidenceType !== filters.evidenceType) {
      return false;
    }
    if (filters.reviewStatus !== "All" && record.reviewStatus !== filters.reviewStatus) {
      return false;
    }
    if (query.length === 0) {
      return true;
    }
    return record.title.toLowerCase().includes(query);
  });
}

export function paginateKnowledge<T>(records: T[], page: number) {
  const pageCount = Math.max(1, Math.ceil(records.length / knowledgePageSize));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const start = (currentPage - 1) * knowledgePageSize;

  return {
    page: currentPage,
    pageCount,
    items: records.slice(start, start + knowledgePageSize),
    rangeStart: records.length === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + knowledgePageSize, records.length),
  };
}
