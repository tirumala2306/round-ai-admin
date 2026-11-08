import type { AiInteraction } from "@/features/ai-interactions/types";

export const AI_INTERACTION_SAMPLE_NOTICE =
  "These interactions are synthetic demo records kept only in this browser session. They do not include patient information, are not connected to an AI provider, and are not saved to the RoundsAI backend. Refreshing the page restores the original sample set.";

const provider = "Sample provider";
const closing = "Synthetic demonstration text only. This is not a clinical recommendation.";

function interaction(
  record: Omit<AiInteraction, "provider" | "feedbackComment" | "reviewStatus" | "flagReason" | "reviewNotes" | "reviewedAt"> &
    Partial<Pick<AiInteraction, "feedbackComment" | "reviewStatus" | "flagReason" | "reviewNotes" | "reviewedAt">>,
): AiInteraction {
  return {
    provider,
    feedbackComment: "",
    reviewStatus: null,
    flagReason: null,
    reviewNotes: "",
    reviewedAt: null,
    ...record,
  };
}

/**
 * Fixed synthetic interactions. User and organization ids match the shared sample directory.
 * One record uses unknown ids so the screen can show a safe fallback.
 */
export const sampleInteractions: AiInteraction[] = [
  interaction({
    id: "AIQ-1001",
    userId: "mer-user-patel",
    organizationId: "meridian",
    featureId: "patient-summaries",
    modelId: "rounds-clinical-v1",
    timestamp: "2026-11-05T14:20:00.000Z",
    responseTimeMs: 1820,
    inputTokens: 2400,
    outputTokens: 860,
    status: "Success",
    feedback: "Positive",
    feedbackComment: "The section headings were easy to scan in this demo.",
    question:
      "Draft a sample inpatient summary for a fictional cardiology consult list. Group overnight events, pending studies, and discharge barriers. Do not invent a patient name or record number.",
    response:
      "Sample summary\n\nOvernight: no new sample events were supplied in the prompt.\nPending: the demo list asked for studies to be named only as categories.\nDischarge barriers: follow-up section was not included because the prompt did not provide one.\n\n" +
      closing,
    reviewStatus: "Pending Review",
    flagReason: "Potentially Incomplete Response",
    reviewNotes: "Waiting for a second look at the sample summary structure.",
  }),
  interaction({
    id: "AIQ-1002",
    userId: "mer-user-okonkwo",
    organizationId: "meridian",
    featureId: "rounds-preparation",
    modelId: "rounds-notes-v1",
    timestamp: "2026-11-05T11:05:00.000Z",
    responseTimeMs: 1460,
    inputTokens: 1800,
    outputTokens: 640,
    status: "Success",
    feedback: "No Feedback",
    question:
      "Build a sample rounds outline with an overnight checklist for a fictional ward. Use headings only. Do not name a patient.",
    response:
      "Sample rounds outline\n\n1. Overnight checklist\n2. Pending items\n3. Team questions for the demo huddle\n\n" +
      closing,
  }),
  interaction({
    id: "AIQ-1003",
    userId: "mer-user-chen",
    organizationId: "meridian",
    featureId: "clinical-notes",
    modelId: "rounds-notes-v1",
    timestamp: "2026-11-05T09:40:00.000Z",
    responseTimeMs: 2100,
    inputTokens: 2100,
    outputTokens: 910,
    status: "Success",
    feedback: "Negative",
    feedbackComment: "The note structure did not match our demo template.",
    question:
      "Format a sample progress note for a fictional hospital-medicine encounter. Use the demo headings: status, plan, and follow-up. No identifiers.",
    response:
      "Sample progress note\n\nStatus: placeholder only.\nPlan: the demo template headings were requested, and this draft used a shorter layout.\nFollow-up: not supplied in the prompt.\n\n" +
      closing,
    reviewStatus: "Under Review",
    flagReason: "Response Quality Concern",
    reviewNotes: "Checking whether the demo note missed a requested heading.",
  }),
  interaction({
    id: "AIQ-1004",
    userId: "mer-user-brooks",
    organizationId: "meridian",
    featureId: "evidence-retrieval",
    modelId: "rounds-evidence-v1",
    timestamp: "2026-11-04T18:15:00.000Z",
    responseTimeMs: 980,
    inputTokens: 900,
    outputTokens: 420,
    status: "Success",
    feedback: "Positive",
    feedbackComment: "The sample evidence list was easy to scan.",
    question:
      "List sample evidence categories a resident might request before rounds. Keep the list generic and do not cite a real patient.",
    response:
      "Sample evidence categories\n\n- Guideline topic\n- Recent study type\n- Local protocol heading\n\nNo source documents were retrieved. " + closing,
  }),
  interaction({
    id: "AIQ-1005",
    userId: "ced-user-reyes",
    organizationId: "cedarline",
    featureId: "clinical-considerations",
    modelId: "rounds-clinical-v1",
    timestamp: "2026-11-04T10:00:00.000Z",
    responseTimeMs: 6400,
    inputTokens: 1600,
    outputTokens: 40,
    status: "Failed",
    feedback: "No Feedback",
    question:
      "Prepare sample clinical considerations for a fictional surgical list. Stop if the demo request cannot be completed. No identifiers.",
    response:
      "The sample response could not be completed. No clinical content was generated.\n\n" + closing,
    reviewStatus: "Pending Review",
    flagReason: "User Reported Issue",
    reviewNotes: "Sample failure reported by the user. No clinical record is attached.",
  }),
  interaction({
    id: "AIQ-1006",
    userId: "ced-user-nguyen",
    organizationId: "cedarline",
    featureId: "patient-summaries",
    modelId: "rounds-clinical-v1",
    timestamp: "2026-11-03T16:30:00.000Z",
    responseTimeMs: 1540,
    inputTokens: 2200,
    outputTokens: 780,
    status: "Success",
    feedback: "Positive",
    question:
      "Summarize a fictional pediatric ward list for a sample handoff. Mention only list categories, not children or guardians.",
    response:
      "Sample handoff summary\n\nThe fictional list was grouped into new arrivals, pending checks, and items waiting on the demo team.\n\n" +
      closing,
  }),
  interaction({
    id: "AIQ-1007",
    userId: "ced-user-hart",
    organizationId: "cedarline",
    featureId: "rounds-preparation",
    modelId: "rounds-notes-v1",
    timestamp: "2026-11-03T08:12:00.000Z",
    responseTimeMs: 1730,
    inputTokens: 1500,
    outputTokens: 700,
    status: "Success",
    feedback: "Negative",
    feedbackComment: "This outline did not match the rounds checklist in the sample prompt.",
    question:
      "Create a sample pre-rounds checklist for a fictional acute-care surgery team. Use the headings supplied in this demo prompt only.",
    response:
      "Sample checklist\n\nThe draft used a general huddle order instead of every heading in the prompt.\n\n" +
      closing,
    reviewStatus: "Reviewed",
    flagReason: "Irrelevant Response",
    reviewNotes: "Reviewed the sample outline. Original response kept.",
    reviewedAt: "2026-11-03T12:00:00.000Z",
  }),
  interaction({
    id: "AIQ-1008",
    userId: "wes-user-alvarez",
    organizationId: "westford",
    featureId: "clinical-notes",
    modelId: "rounds-notes-v1",
    timestamp: "2026-11-02T19:45:00.000Z",
    responseTimeMs: 1320,
    inputTokens: 1300,
    outputTokens: 540,
    status: "Success",
    feedback: "No Feedback",
    question:
      "Draft a sample family-medicine note skeleton. Leave every clinical field blank and label it as a demo.",
    response: "Sample note skeleton\n\nStatus: blank\nPlan: blank\nFollow-up: blank\n\n" + closing,
  }),
  interaction({
    id: "AIQ-1009",
    userId: "wes-user-cole",
    organizationId: "westford",
    featureId: "evidence-retrieval",
    modelId: "rounds-evidence-v1",
    timestamp: "2026-11-02T13:05:00.000Z",
    responseTimeMs: 5100,
    inputTokens: 800,
    outputTokens: 20,
    status: "Failed",
    feedback: "Negative",
    feedbackComment: "The retrieved excerpt did not address the sample question.",
    question:
      "Retrieve sample imaging-protocol headings for a fictional radiology huddle. Do not include a report or an accession number.",
    response: "The sample retrieval did not return a response.\n\n" + closing,
    reviewStatus: "Dismissed",
    flagReason: "Unsupported Information",
    reviewNotes: "Dismissed. The sample interaction stays in the list.",
    reviewedAt: "2026-11-02T15:30:00.000Z",
  }),
  interaction({
    id: "AIQ-1010",
    userId: "ald-user-singh",
    organizationId: "alder",
    featureId: "patient-summaries",
    modelId: "rounds-clinical-v1",
    timestamp: "2026-11-01T21:18:00.000Z",
    responseTimeMs: 1680,
    inputTokens: 2600,
    outputTokens: 990,
    status: "Success",
    feedback: "Positive",
    feedbackComment: "Clear section headings in this demo response.",
    question:
      "Write a sample oncology consult summary using only the section labels in this prompt. Do not describe a real person.",
    response:
      "Sample consult summary\n\nReason for the demo request, open questions, and next sample checkpoint were returned as headings.\n\n" +
      closing,
  }),
  interaction({
    id: "AIQ-1011",
    userId: "ald-user-berg",
    organizationId: "alder",
    featureId: "rounds-preparation",
    modelId: "rounds-clinical-v1",
    timestamp: "2026-11-01T15:02:00.000Z",
    responseTimeMs: 2010,
    inputTokens: 1900,
    outputTokens: 830,
    status: "Success",
    feedback: "No Feedback",
    question:
      "Prepare a sample stroke-service rounds sequence. Keep it as a checklist of work categories.",
    response:
      "Sample sequence\n\nNew reviews, pending studies, and team questions were listed as categories only.\n\n" +
      closing,
    reviewStatus: "Under Review",
    flagReason: "Potentially Incomplete Response",
    reviewNotes: "Comparing the sample checklist with the requested headings.",
  }),
  interaction({
    id: "AIQ-1012",
    userId: "ald-user-kim",
    organizationId: "alder",
    featureId: "clinical-considerations",
    modelId: "rounds-clinical-v1",
    timestamp: "2026-10-31T18:40:00.000Z",
    responseTimeMs: 1890,
    inputTokens: 1700,
    outputTokens: 760,
    status: "Success",
    feedback: "Negative",
    feedbackComment: "The considerations list felt too generic for the demo case.",
    question:
      "List sample considerations for a fictional multidisciplinary huddle. Stay at the level of workflow categories.",
    response:
      "Sample considerations\n\nThe draft listed communication, pending work, and follow-up as broad categories.\n\n" +
      closing,
    reviewStatus: "Pending Review",
    flagReason: "Response Quality Concern",
    reviewNotes: "Quality concern logged for the demo considerations list.",
  }),
  interaction({
    id: "AIQ-1013",
    userId: "har-user-doyle",
    organizationId: "harborlight",
    featureId: "clinical-notes",
    modelId: "rounds-notes-v1",
    timestamp: "2026-10-31T11:22:00.000Z",
    responseTimeMs: 1210,
    inputTokens: 1100,
    outputTokens: 480,
    status: "Success",
    feedback: "Positive",
    question:
      "Create a sample clinic note outline for a fictional primary-care visit. Omit any person-specific detail.",
    response: "Sample clinic outline\n\nReason, discussion topics, and next demo step were left as empty headings.\n\n" + closing,
  }),
  interaction({
    id: "AIQ-1014",
    userId: "har-user-owens",
    organizationId: "harborlight",
    featureId: "evidence-retrieval",
    modelId: "rounds-evidence-v1",
    timestamp: "2026-10-30T16:55:00.000Z",
    responseTimeMs: 2440,
    inputTokens: 1400,
    outputTokens: 610,
    status: "Success",
    feedback: "No Feedback",
    question:
      "Show sample topics a clinic panel might look up before a demo meeting. Do not attach a document or a person.",
    response: "Sample topics\n\nPrevention heading, medication-category heading, and follow-up heading.\n\n" + closing,
  }),
  interaction({
    id: "AIQ-1015",
    userId: "mer-user-patel",
    organizationId: "meridian",
    featureId: "rounds-preparation",
    modelId: "rounds-notes-v1",
    timestamp: "2026-10-30T09:10:00.000Z",
    responseTimeMs: 1575,
    inputTokens: 1750,
    outputTokens: 690,
    status: "Success",
    feedback: "Positive",
    feedbackComment: "The checklist order matched the sample prompt.",
    question:
      "Reorder a fictional cardiology rounds checklist into the sequence given in this demo prompt.",
    response: "Sample checklist order\n\nThe requested sequence was repeated as headings without adding a case.\n\n" + closing,
  }),
  interaction({
    id: "AIQ-1016",
    userId: "ced-user-reyes",
    organizationId: "cedarline",
    featureId: "patient-summaries",
    modelId: "rounds-clinical-v1",
    timestamp: "2026-10-29T20:30:00.000Z",
    responseTimeMs: 1760,
    inputTokens: 2000,
    outputTokens: 1100,
    status: "Success",
    feedback: "Negative",
    feedbackComment: "I expected a shorter summary in this sample.",
    question:
      "Give a short sample summary of a fictional surgical board. Limit it to three headings.",
    response:
      "Sample board summary\n\nThe draft used three headings and then added an extra note about missing demo details.\n\n" +
      closing,
  }),
  interaction({
    id: "AIQ-1017",
    userId: "ald-user-kim",
    organizationId: "alder",
    featureId: "evidence-retrieval",
    modelId: "rounds-evidence-v1",
    timestamp: "2026-10-22T14:00:00.000Z",
    responseTimeMs: 1390,
    inputTokens: 1000,
    outputTokens: 450,
    status: "Success",
    feedback: "No Feedback",
    question:
      "Return sample source categories for a fictional evidence huddle. Do not quote a paper or a person.",
    response: "Sample source categories\n\nReview article, practice guideline, and local protocol were named as categories only.\n\n" + closing,
    reviewStatus: "Reviewed",
    flagReason: "Irrelevant Response",
    reviewNotes: "Reviewed. The sample response remains available.",
    reviewedAt: "2026-10-23T09:00:00.000Z",
  }),
  interaction({
    id: "AIQ-1018",
    userId: "sample-removed-user",
    organizationId: "sample-removed-org",
    featureId: "patient-summaries",
    modelId: "rounds-clinical-v1",
    timestamp: "2026-10-20T12:00:00.000Z",
    responseTimeMs: 1620,
    inputTokens: 1200,
    outputTokens: 500,
    status: "Success",
    feedback: "No Feedback",
    question:
      "Summarize a fictional handoff whose sample user is no longer in the directory. Do not invent a replacement identity.",
    response: "Sample handoff\n\nThe directory no longer has this user. The interaction is kept so the screen can show a fallback label.\n\n" + closing,
  }),
  interaction({
    id: "AIQ-1019",
    userId: "har-user-doyle",
    organizationId: "harborlight",
    featureId: "clinical-considerations",
    modelId: "rounds-clinical-v1",
    timestamp: "2026-10-18T17:25:00.000Z",
    responseTimeMs: 7200,
    inputTokens: 900,
    outputTokens: 15,
    status: "Failed",
    feedback: "No Feedback",
    question:
      "List sample considerations for a fictional clinic huddle. End without a response if the demo request times out.",
    response: "The sample request timed out before a response was drafted.\n\n" + closing,
    reviewStatus: "Pending Review",
    flagReason: "User Reported Issue",
    reviewNotes: "Sample timeout reported. No patient record is attached.",
  }),
  interaction({
    id: "AIQ-1020",
    userId: "wes-user-alvarez",
    organizationId: "westford",
    featureId: "rounds-preparation",
    modelId: "rounds-notes-v1",
    timestamp: "2026-10-15T08:40:00.000Z",
    responseTimeMs: 1488,
    inputTokens: 1550,
    outputTokens: 620,
    status: "Success",
    feedback: "Positive",
    question:
      "Draft a sample morning-huddle agenda for a fictional community hospital team. Use agenda headings only.",
    response: "Sample agenda\n\nStaffing, pending work, and demo announcements were listed as headings.\n\n" + closing,
  }),
];
