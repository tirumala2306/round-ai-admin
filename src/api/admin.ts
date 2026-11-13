import { apiRequest } from './client';
import {
  activityResponseSchema,
  adminHealthSchema,
  adminUsersSchema,
  auditPageSchema,
  checkRuleSchema,
  checkRulesSchema,
  createTeamResponseSchema,
  createUserResponseSchema,
  curatedReadSchema,
  curatedReadsSchema,
  guidelineUpdateSchema,
  guidelineUpdatesSchema,
  icdStatusSchema,
  mcqDetailSchema,
  mcqQueueSchema,
  mcqReportsSchema,
  mcqStatusResponseSchema,
  okSchema,
  publishTemplateResponseSchema,
  questionAnalyticsSchema,
  chatMetricsSchema,
  exportHistorySchema,
  holdHistorySchema,
  purgePreviewSchema,
  purgeResultSchema,
  settingsSchema,
  teamsSchema,
  templatesSchema,
  usageSchema,
  type TemplateSection,
  type UserRole,
} from './schemas';
import { getToken } from './token';
import { mapApiError } from './errors';

const baseUrl = () => (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

function qs(params: Record<string, string | number | undefined | null>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export const fetchHealth = () => apiRequest('/admin/health', adminHealthSchema);
export const fetchSettings = () => apiRequest('/admin/settings', settingsSchema);
export const fetchUsers = () => apiRequest('/admin/users', adminUsersSchema);
export const fetchTeams = () => apiRequest('/admin/teams', teamsSchema);
export const fetchUsage = (since?: string) =>
  apiRequest(`/admin/usage${qs({ since })}`, usageSchema);

export function fetchActivity(params: { since?: string; until?: string; user_id?: string } = {}) {
  return apiRequest(`/admin/analytics/activity${qs(params)}`, activityResponseSchema);
}

export function fetchQuestionAnalytics() {
  return apiRequest('/admin/analytics/questions', questionAnalyticsSchema);
}

export function fetchIcdStatus() {
  return apiRequest('/admin/icd', icdStatusSchema);
}

export function updateSettings(body: Record<string, unknown>) {
  return apiRequest('/admin/settings', okSchema, { method: 'PUT', body });
}

/** Counts only — never returns message text. Optional `days` dry-runs a proposed retention. */
export function fetchPurgePreview(days?: number) {
  return apiRequest(`/admin/chat/purge/preview${qs({ days })}`, purgePreviewSchema);
}

export function runChatPurge() {
  return apiRequest('/admin/chat/purge', purgeResultSchema, { method: 'POST', body: {} });
}

export function fetchHoldHistory(params: { limit?: number; offset?: number } = {}) {
  return apiRequest(`/admin/chat/hold/history${qs(params)}`, holdHistorySchema);
}

export function fetchExportHistory(params: { limit?: number; offset?: number } = {}) {
  return apiRequest(`/admin/chat/export/history${qs(params)}`, exportHistorySchema);
}

export function fetchChatMetrics(params: { from?: string; to?: string } = {}) {
  return apiRequest(`/admin/chat/metrics${qs(params)}`, chatMetricsSchema);
}

export function createUser(body: {
  email: string;
  name: string;
  role: UserRole;
  password: string;
  team_ids?: string[];
}) {
  return apiRequest('/admin/users', createUserResponseSchema, { method: 'POST', body });
}

export function patchUser(
  id: string,
  body: { name?: string; role?: UserRole; active?: boolean; password?: string },
) {
  return apiRequest(`/admin/users/${id}`, okSchema, { method: 'PATCH', body });
}

export function createTeam(name: string) {
  return apiRequest('/admin/teams', createTeamResponseSchema, { method: 'POST', body: { name } });
}

export function addTeamMember(teamId: string, userId: string) {
  return apiRequest(`/admin/teams/${teamId}/members`, okSchema, {
    method: 'POST',
    body: { user_id: userId },
  });
}

export function removeTeamMember(teamId: string, userId: string) {
  return apiRequest(`/admin/teams/${teamId}/members/${userId}`, okSchema, { method: 'DELETE' });
}

export function fetchAudit(params: {
  actor_id?: string;
  action?: string;
  patient_id?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}) {
  return apiRequest(`/admin/audit${qs(params)}`, auditPageSchema);
}

export async function fetchAuditCsv(params: {
  actor_id?: string;
  action?: string;
  patient_id?: string;
  from?: string;
  to?: string;
  limit?: number;
}) {
  const token = getToken();
  const res = await fetch(`${baseUrl()}/admin/audit.csv${qs(params)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const text = await res.text();
    let body: unknown = text;
    try { body = JSON.parse(text); } catch { /* keep text */ }
    throw mapApiError(res.status, body);
  }
  return res.text();
}

export const fetchDraftRules = () =>
  apiRequest('/admin/check-rules?status=draft', checkRulesSchema);
export const fetchUnreviewedMcqs = () =>
  apiRequest('/admin/mcqs?status=ai_generated_unreviewed&limit=200', mcqQueueSchema);
export const fetchReportedMcqs = () =>
  apiRequest('/admin/mcqs?status=reported&limit=200', mcqQueueSchema);

export function fetchMcqQueue(params: {
  status?: string;
  topic?: string;
  source?: string;
  limit?: number;
} = {}) {
  return apiRequest(`/admin/mcqs${qs(params)}`, mcqQueueSchema);
}

export function fetchMcqDetail(id: string) {
  return apiRequest(`/admin/mcqs/${encodeURIComponent(id)}`, mcqDetailSchema);
}

export function patchMcqStatus(id: string, status: 'approved' | 'retired' | 'ai_generated_unreviewed') {
  return apiRequest(`/admin/mcqs/${encodeURIComponent(id)}`, mcqStatusResponseSchema, {
    method: 'PATCH',
    body: { status },
  });
}

export function fetchMcqReports() {
  return apiRequest('/admin/mcq-reports', mcqReportsSchema);
}

export function fetchCuratedReads(approved?: boolean) {
  const q =
    approved === undefined ? '' : qs({ approved: approved ? '1' : '0' });
  return apiRequest(`/admin/curated-reads${q}`, curatedReadsSchema);
}

export function createCuratedRead(body: Record<string, unknown>) {
  return apiRequest('/admin/curated-reads', curatedReadSchema, { method: 'POST', body });
}

export function approveCuratedRead(id: string) {
  return apiRequest(`/admin/curated-reads/${encodeURIComponent(id)}/approve`, curatedReadSchema, {
    method: 'POST',
    body: {},
  });
}

export function fetchGuidelineUpdates(status?: string) {
  return apiRequest(`/admin/guideline-updates${qs({ status })}`, guidelineUpdatesSchema);
}

export function createGuidelineUpdate(body: Record<string, unknown>) {
  return apiRequest('/admin/guideline-updates', guidelineUpdateSchema, { method: 'POST', body });
}

export function approveGuidelineUpdate(id: string) {
  return apiRequest(
    `/admin/guideline-updates/${encodeURIComponent(id)}/approve`,
    guidelineUpdateSchema,
    { method: 'POST', body: {} },
  );
}

export const fetchTemplates = () => apiRequest('/admin/templates', templatesSchema);

export function publishTemplate(key: string, body: { title: string; sections: TemplateSection[] }) {
  return apiRequest(`/admin/templates/${encodeURIComponent(key)}`, publishTemplateResponseSchema, {
    method: 'PUT',
    body,
  });
}

export function fetchCheckRules(status?: string) {
  return apiRequest(`/admin/check-rules${qs({ status })}`, checkRulesSchema);
}

export function fetchCheckRule(id: string) {
  return apiRequest(`/admin/check-rules/${encodeURIComponent(id)}`, checkRuleSchema);
}

export function createCheckRule(body: Record<string, unknown>) {
  return apiRequest('/admin/check-rules', checkRuleSchema, { method: 'POST', body });
}

export function updateCheckRule(id: string, body: Record<string, unknown>) {
  return apiRequest(`/admin/check-rules/${encodeURIComponent(id)}`, checkRuleSchema, {
    method: 'PUT',
    body,
  });
}

export function draftCheckRuleWithAi(condition: string) {
  return apiRequest('/admin/check-rules/draft', checkRuleSchema, {
    method: 'POST',
    body: { condition },
  });
}

export function approveCheckRule(id: string) {
  return apiRequest(`/admin/check-rules/${encodeURIComponent(id)}/approve`, checkRuleSchema, {
    method: 'POST',
    body: {},
  });
}

export function retireCheckRule(id: string) {
  return apiRequest(`/admin/check-rules/${encodeURIComponent(id)}/retire`, checkRuleSchema, {
    method: 'POST',
    body: {},
  });
}
