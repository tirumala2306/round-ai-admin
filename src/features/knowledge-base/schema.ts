import { z } from "zod";
import {
  categoryFieldIssues,
  documentFieldIssues,
  evidenceFieldIssues,
  guidelineFieldIssues,
  sourceFieldIssues,
  tagFieldIssues,
} from "@/features/knowledge-base/selectors";
import {
  knowledgeActiveStatuses,
  knowledgeDocumentTypes,
  knowledgeEvidenceTypes,
  knowledgeSourceTypes,
  type EvidenceFormValues,
  type GuidelineFormValues,
  type KnowledgeBase,
  type KnowledgeCategoryFormValues,
  type KnowledgeDocumentFormValues,
  type KnowledgeSourceFormValues,
  type KnowledgeTagFormValues,
} from "@/features/knowledge-base/types";

const sourceObject = z.object({
  name: z.string().trim().min(1, "Enter a source name.").min(2, "Enter at least 2 characters.").max(80),
  sourceType: z.enum(knowledgeSourceTypes, "Select a source type."),
  description: z.string().trim().min(1, "Enter a description.").max(400, "Use 400 characters or fewer."),
  url: z.string().trim().max(200),
  status: z.enum(knowledgeActiveStatuses, "Select a status."),
});

const categoryObject = z.object({
  name: z.string().trim().min(1, "Enter a category name.").min(2, "Enter at least 2 characters.").max(60),
  description: z.string().trim().max(240, "Use 240 characters or fewer."),
  status: z.enum(knowledgeActiveStatuses, "Select a status."),
});

const tagObject = z.object({
  name: z.string().trim().min(1, "Enter a tag name.").min(2, "Enter at least 2 characters.").max(40),
  status: z.enum(knowledgeActiveStatuses, "Select a status."),
});

const documentObject = z.object({
  title: z.string().trim().min(1, "Enter a document title.").min(2, "Enter at least 2 characters.").max(120),
  description: z.string().trim().min(1, "Enter a description.").max(500, "Use 500 characters or fewer."),
  documentType: z.enum(knowledgeDocumentTypes, "Select a document type."),
  categoryId: z.string().min(1, "Select a category."),
  tagIds: z.array(z.string()),
  sourceId: z.string().min(1, "Select a knowledge source."),
  referenceUrl: z.string().trim().max(200),
  version: z.string().trim().min(1, "Enter a version.").max(20, "Use 20 characters or fewer."),
  publicationDate: z.string().trim().min(1, "Enter a publication date."),
});

const guidelineObject = z.object({
  title: z.string().trim().min(1, "Enter a guideline title.").min(2, "Enter at least 2 characters.").max(120),
  description: z.string().trim().min(1, "Enter a description.").max(500, "Use 500 characters or fewer."),
  specialtyId: z.string().min(1, "Select a specialty."),
  publishingOrganization: z
    .string()
    .trim()
    .min(1, "Enter a publishing organization.")
    .max(120, "Use 120 characters or fewer."),
  publicationDate: z.string().trim().min(1, "Enter a publication date."),
  version: z.string().trim().min(1, "Enter a version.").max(20, "Use 20 characters or fewer."),
  sourceId: z.string().min(1, "Select a knowledge source."),
  referenceUrl: z.string().trim().max(200),
  tagIds: z.array(z.string()),
});

const evidenceObject = z.object({
  title: z.string().trim().min(1, "Enter a title.").min(2, "Enter at least 2 characters.").max(160),
  authors: z.string().trim().min(1, "Enter the authors.").max(200, "Use 200 characters or fewer."),
  journal: z.string().trim().min(1, "Enter the journal or publishing source.").max(160),
  publicationYear: z
    .number({ error: "Enter a publication year." })
    .int("Enter a whole year.")
    .min(1900, "Enter a year from 1900 onward.")
    .max(2100, "Enter a year up to 2100."),
  doi: z.string().trim().max(80, "Use 80 characters or fewer."),
  pmid: z.string().trim().max(20, "Use 20 characters or fewer."),
  referenceUrl: z.string().trim().max(200),
  evidenceType: z.enum(knowledgeEvidenceTypes, "Select an evidence type."),
  categoryId: z.string().min(1, "Select a category."),
  tagIds: z.array(z.string()),
});

export const reviewNotesSchema = z.object({
  notes: z.string().trim().max(400, "Use 400 characters or fewer."),
});

export const rejectNotesSchema = z.object({
  notes: z
    .string()
    .trim()
    .min(1, "Enter reviewer notes.")
    .max(400, "Use 400 characters or fewer."),
});

export function createKnowledgeSourceSchema(knowledge: KnowledgeBase, exceptSourceId?: string) {
  return sourceObject.superRefine((values, context) => {
    for (const fieldIssue of sourceFieldIssues(knowledge, values as KnowledgeSourceFormValues, exceptSourceId)) {
      context.addIssue({ code: "custom", path: [fieldIssue.path], message: fieldIssue.message });
    }
  });
}

export function createKnowledgeCategorySchema(knowledge: KnowledgeBase, exceptCategoryId?: string) {
  return categoryObject.superRefine((values, context) => {
    for (const fieldIssue of categoryFieldIssues(
      knowledge,
      values as KnowledgeCategoryFormValues,
      exceptCategoryId,
    )) {
      context.addIssue({ code: "custom", path: [fieldIssue.path], message: fieldIssue.message });
    }
  });
}

export function createKnowledgeTagSchema(knowledge: KnowledgeBase, exceptTagId?: string) {
  return tagObject.superRefine((values, context) => {
    for (const fieldIssue of tagFieldIssues(knowledge, values as KnowledgeTagFormValues, exceptTagId)) {
      context.addIssue({ code: "custom", path: [fieldIssue.path], message: fieldIssue.message });
    }
  });
}

export function createKnowledgeDocumentSchema(knowledge: KnowledgeBase, exceptDocumentId?: string) {
  return documentObject.superRefine((values, context) => {
    for (const fieldIssue of documentFieldIssues(
      knowledge,
      values as KnowledgeDocumentFormValues,
      exceptDocumentId,
    )) {
      context.addIssue({ code: "custom", path: [fieldIssue.path], message: fieldIssue.message });
    }
  });
}

export function createGuidelineSchema(knowledge: KnowledgeBase, exceptGuidelineId?: string) {
  return guidelineObject.superRefine((values, context) => {
    for (const fieldIssue of guidelineFieldIssues(knowledge, values as GuidelineFormValues, exceptGuidelineId)) {
      context.addIssue({ code: "custom", path: [fieldIssue.path], message: fieldIssue.message });
    }
  });
}

export function createEvidenceSchema(knowledge: KnowledgeBase, exceptEvidenceId?: string) {
  return evidenceObject.superRefine((values, context) => {
    for (const fieldIssue of evidenceFieldIssues(knowledge, values as EvidenceFormValues, exceptEvidenceId)) {
      context.addIssue({ code: "custom", path: [fieldIssue.path], message: fieldIssue.message });
    }
  });
}

export function emptyKnowledgeSourceForm(): KnowledgeSourceFormValues {
  return {
    name: "",
    sourceType: "Citation index",
    description: "",
    url: "",
    status: "Active",
  };
}

export function emptyKnowledgeCategoryForm(): KnowledgeCategoryFormValues {
  return { name: "", description: "", status: "Active" };
}

export function emptyKnowledgeTagForm(): KnowledgeTagFormValues {
  return { name: "", status: "Active" };
}

export function emptyKnowledgeDocumentForm(knowledge: KnowledgeBase): KnowledgeDocumentFormValues {
  return {
    title: "",
    description: "",
    documentType: "Reference summary",
    categoryId: selectableDefault(knowledge.categories),
    tagIds: [],
    sourceId: selectableDefault(knowledge.sources),
    referenceUrl: "",
    version: "",
    publicationDate: "",
  };
}

export function emptyGuidelineForm(knowledge: KnowledgeBase): GuidelineFormValues {
  return {
    title: "",
    description: "",
    specialtyId: selectableDefault(knowledge.categories),
    publishingOrganization: "",
    publicationDate: "",
    version: "",
    sourceId: selectableDefault(knowledge.sources),
    referenceUrl: "",
    tagIds: [],
  };
}

export function emptyEvidenceForm(knowledge: KnowledgeBase): EvidenceFormValues {
  return {
    title: "",
    authors: "",
    journal: "",
    publicationYear: 2024,
    doi: "",
    pmid: "",
    referenceUrl: "",
    evidenceType: "Clinical Study",
    categoryId: selectableDefault(knowledge.categories),
    tagIds: [],
  };
}

function selectableDefault(records: { id: string; status: string }[]) {
  return records.find((record) => record.status === "Active")?.id ?? "";
}
