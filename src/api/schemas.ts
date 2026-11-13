import { z } from 'zod';

export const panelRoles = ['admin', 'reviewer'] as const;
export type PanelRole = (typeof panelRoles)[number];

export const userRoles = ['resident', 'attending', 'admin'] as const;
export type UserRole = (typeof userRoles)[number];

export const loginResponseSchema = z.object({
  token: z.string(),
  expires_in: z.number(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
  }),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const meSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.string(),
  active: z.union([z.boolean(), z.number()]).optional(),
  teams: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  ai_enabled: z.boolean().optional(),
  chat_enabled: z.boolean().optional(),
});

export type Me = z.infer<typeof meSchema>;

export const adminHealthSchema = z.object({
  status: z.string(),
  time: z.string(),
  provider: z.string(),
  model: z.string().nullable().optional(),
  prompt_version: z.string(),
  db_ok: z.boolean(),
  icd_loaded: z.boolean(),
  ai_enabled: z.boolean().optional(),
  icd: z.record(z.string(), z.unknown()).optional(),
});

export const adminUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.string(),
  active: z.union([z.boolean(), z.number()]),
  created_at: z.string(),
  last_login_at: z.string().nullable().optional(),
  last_activity_at: z.string().nullable().optional(),
  teams: z.array(z.string()),
});

export const adminUsersSchema = z.array(adminUserSchema);
export type AdminUser = z.infer<typeof adminUserSchema>;

export const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.array(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  })),
});

export const teamsSchema = z.array(teamSchema);
export type Team = z.infer<typeof teamSchema>;

export const okSchema = z.object({ ok: z.boolean() }).passthrough();

export const createUserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
});

export const createTeamResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const chatAuditMetaSchema = z.object({
  at: z.string(),
  actor_id: z.string().nullable().optional(),
  detail: z.unknown().optional(),
}).nullable().optional();

export const settingsSchema = z.object({
  ai_enabled: z.boolean(),
  review_intervals_days: z.array(z.number()),
  show_individual_learner_analytics: z.boolean().optional(),
  provider: z.string(),
  model: z.string().nullable().optional(),
  prompt_version: z.string(),
  features: z.record(z.string(), z.unknown()).optional(),
  limits: z.object({
    max_calls_per_user_per_day: z.number(),
    max_context_facts: z.number(),
  }),
  cors_origin: z.string().optional(),
  chat_enabled: z.boolean().optional(),
  chat_retention_days: z.number().optional(),
  chat_legal_hold: z.boolean().optional(),
  chat_limits: z.object({
    max_message_body: z.number(),
    rate_per_minute: z.number(),
  }).optional(),
  push: z.object({
    registered_devices: z.number(),
    note: z.string().optional(),
  }).optional(),
  retention_last_change: chatAuditMetaSchema,
  legal_hold_last_change: chatAuditMetaSchema,
  last_purge: chatAuditMetaSchema,
}).passthrough();

export type AdminSettings = z.infer<typeof settingsSchema>;

export const purgePreviewSchema = z.object({
  retention_days: z.number(),
  configured_retention_days: z.number().optional(),
  cutoff: z.string(),
  eligible_count: z.number(),
  blocked: z.boolean(),
  blocked_reason: z.string().nullable().optional(),
  last_purge: chatAuditMetaSchema,
  note: z.string().optional(),
}).passthrough();

export type PurgePreview = z.infer<typeof purgePreviewSchema>;

export const purgeResultSchema = z.object({
  purged: z.number(),
  skipped: z.boolean().optional(),
  reason: z.string().optional(),
  retention_days: z.number().optional(),
  cutoff: z.string().optional(),
  last_purge: chatAuditMetaSchema,
}).passthrough();

export type PurgeResult = z.infer<typeof purgeResultSchema>;

export const holdHistoryRowSchema = z.object({
  id: z.string(),
  at: z.string(),
  actor_id: z.string().nullable().optional(),
  hold: z.boolean(),
  reason: z.string(),
});

export const holdHistorySchema = z.object({
  rows: z.array(holdHistoryRowSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type HoldHistoryRow = z.infer<typeof holdHistoryRowSchema>;

export const exportHistoryRowSchema = z.object({
  id: z.string(),
  at: z.string(),
  actor_id: z.string(),
  reason: z.string(),
  team_id: z.string().nullable().optional(),
  channel_count: z.number(),
  message_count: z.number(),
  format: z.string(),
});

export const exportHistorySchema = z.object({
  rows: z.array(exportHistoryRowSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type ExportHistoryRow = z.infer<typeof exportHistoryRowSchema>;

export const chatMetricsDaySchema = z.object({
  day: z.string(),
  active_channels: z.number(),
  messages_posted: z.number(),
  summarize_requests: z.number(),
  push_registrations: z.number(),
  rate_limit_rejections: z.number(),
  spam_rejections: z.number(),
});

export const chatMetricsSchema = z.object({
  from: z.string(),
  to: z.string(),
  days: z.array(chatMetricsDaySchema),
  totals: z.object({
    active_channels: z.number(),
    messages_posted: z.number(),
    summarize_requests: z.number(),
    push_registrations: z.number(),
    rate_limit_rejections: z.number(),
    spam_rejections: z.number(),
  }),
  note: z.string().optional(),
}).passthrough();

export type ChatMetrics = z.infer<typeof chatMetricsSchema>;
export type ChatMetricsDay = z.infer<typeof chatMetricsDaySchema>;

/** Audit action filter presets for chat governance (IDs/codes only). */
export const CHAT_AUDIT_ACTIONS = [
  { value: 'chat_post', label: 'chat_post' },
  { value: 'chat_edit', label: 'chat_edit' },
  { value: 'chat_delete', label: 'chat_delete' },
  { value: 'chat_summarize_requested', label: 'chat_summarize_requested' },
  { value: 'admin_chat_export', label: 'admin_chat_export' },
  { value: 'admin_chat_purge', label: 'admin_chat_purge' },
  { value: 'admin_chat_legal_hold', label: 'admin_chat_legal_hold (set/cleared)' },
  { value: 'admin_chat_switch', label: 'admin_chat_switch' },
  { value: 'admin_chat_retention', label: 'admin_chat_retention' },
  { value: 'chat_rate_limited', label: 'chat_rate_limited' },
  { value: 'chat_duplicate_rejected', label: 'chat_duplicate_rejected' },
  { value: 'chat_device_register', label: 'chat_device_register' },
] as const;

export const usageRowSchema = z.object({
  user_id: z.string().optional(),
  email: z.string(),
  day: z.string(),
  calls: z.number(),
  input_tokens: z.number(),
  output_tokens: z.number(),
});

export const usageSchema = z.array(usageRowSchema);
export type UsageRow = z.infer<typeof usageRowSchema>;

export const activityRowSchema = z.object({
  actor_id: z.string().nullable(),
  action: z.string(),
  count: z.number(),
});

export const activityResponseSchema = z.object({
  rows: z.array(activityRowSchema),
  note: z.string().optional(),
});

export const questionTopicStatSchema = z.object({
  topic: z.string(),
  attempts: z.number(),
  pct_correct: z.number().nullable().optional(),
  avg_seconds: z.number().nullable().optional(),
  reported_count: z.number().optional(),
}).passthrough();

export const questionIndividualStatSchema = z.object({
  user_id: z.string(),
  email: z.string(),
  topic: z.string(),
  attempts: z.number(),
  pct_correct: z.number().nullable().optional(),
  avg_seconds: z.number().nullable().optional(),
}).passthrough();

export const questionAnalyticsSchema = z.object({
  by_topic: z.array(questionTopicStatSchema),
  individuals: z.array(questionIndividualStatSchema).nullable().optional(),
  individual_learner_analytics: z.boolean().optional(),
  note: z.string().optional(),
});

export const icdStatusSchema = z.object({
  count: z.number(),
  fy: z.string().nullable().optional(),
  fts: z.boolean().optional(),
  demo_only: z.boolean().optional(),
  import: z.string().optional(),
  links: z.object({
    cdc: z.string().optional(),
    cms: z.string().optional(),
  }).optional(),
}).passthrough();

export type IcdStatus = z.infer<typeof icdStatusSchema>;

export const auditRowSchema = z.object({
  id: z.number(),
  at: z.string(),
  actor_id: z.string().nullable(),
  action: z.string(),
  patient_id: z.string().nullable().optional(),
  artifact_id: z.string().nullable().optional(),
  detail: z.unknown().nullable().optional(),
});

export const auditPageSchema = z.object({
  rows: z.array(auditRowSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type AuditRow = z.infer<typeof auditRowSchema>;
export type AuditPage = z.infer<typeof auditPageSchema>;

export const PROMPT_KINDS = ['exam', 'review', 'lab', 'imaging', 'med'] as const;
export type PromptKind = (typeof PROMPT_KINDS)[number];

export const checkRulePromptSchema = z.object({
  text: z.string(),
  kind: z.string(),
});

export const checkRuleMatchSchema = z.object({
  problem_keywords: z.array(z.string()).default([]),
  icd_prefixes: z.array(z.string()).default([]),
});

export const checkRuleCompareSchema = z.object({
  fact_label_keywords: z.array(z.string()),
  lookback_days: z.number(),
}).nullable();

export const checkRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.number().optional(),
  status: z.string(),
  match: checkRuleMatchSchema.optional(),
  prompts: z.array(checkRulePromptSchema).optional(),
  compare: checkRuleCompareSchema.optional().nullable(),
  created_by: z.string().nullable().optional(),
  approved_by: z.string().nullable().optional(),
  approved_at: z.string().nullable().optional(),
  ai_drafted: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  frame: z.string().optional(),
}).passthrough();

export const checkRulesSchema = z.array(checkRuleSchema);
export type CheckRule = z.infer<typeof checkRuleSchema>;

export const mcqQueueItemSchema = z.object({
  id: z.string(),
  status: z.string(),
  topic: z.string().optional(),
  topic_key: z.string().optional().nullable(),
  difficulty: z.string().optional().nullable(),
  stage: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  created_by: z.string().optional().nullable(),
  approved_by: z.string().optional().nullable(),
  approved_at: z.string().optional().nullable(),
  created_at: z.string().optional(),
}).passthrough();

export const mcqQueueSchema = z.array(mcqQueueItemSchema);
export type McqQueueItem = z.infer<typeof mcqQueueItemSchema>;

export const mcqDetailSchema = z.object({
  id: z.string(),
  topic: z.string(),
  topic_key: z.string().optional().nullable(),
  difficulty: z.string().optional().nullable(),
  stage: z.string().optional().nullable(),
  status: z.string(),
  source: z.string().optional().nullable(),
  created_by: z.string().optional().nullable(),
  approved_by: z.string().optional().nullable(),
  approved_at: z.string().optional().nullable(),
  created_at: z.string().optional(),
  content: z.record(z.string(), z.unknown()),
  validation: z.unknown().nullable().optional(),
}).passthrough();

export type McqDetail = z.infer<typeof mcqDetailSchema>;

export const mcqStatusResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
  approved_by: z.string().nullable().optional(),
  approved_at: z.string().nullable().optional(),
});

export const mcqReportSchema = z.object({
  id: z.string(),
  mcq_id: z.string(),
  note: z.string().nullable().optional(),
  created_at: z.string(),
  topic: z.string().optional(),
  status: z.string().optional(),
}).passthrough();

export const mcqReportsSchema = z.array(mcqReportSchema);

export const curatedReadSchema = z.object({
  id: z.string(),
  topic: z.string(),
  topic_key: z.string().optional(),
  title: z.string(),
  citation: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  pmid: z.string().nullable().optional(),
  why_it_matters: z.string().nullable().optional(),
  added_by: z.string().optional(),
  approved: z.union([z.boolean(), z.number()]),
  approved_by: z.string().nullable().optional(),
  approved_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
}).passthrough();

export const curatedReadsSchema = z.array(curatedReadSchema);
export type CuratedRead = z.infer<typeof curatedReadSchema>;

export const guidelineUpdateSchema = z.object({
  id: z.string(),
  topic: z.string(),
  topic_key: z.string().optional(),
  organization: z.string(),
  title: z.string(),
  published_date: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  summary_by_admin: z.string().nullable().optional(),
  status: z.string(),
  added_by: z.string().optional(),
  approved_by: z.string().nullable().optional(),
  approved_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
}).passthrough();

export const guidelineUpdatesSchema = z.array(guidelineUpdateSchema);
export type GuidelineUpdate = z.infer<typeof guidelineUpdateSchema>;

export const TEMPLATE_SOURCES = [
  'clinician_history',
  'clinician_subjective',
  'clinician_exam',
  'clinician_update',
  'clinician_support',
  'clinician_plan',
  'facts',
  'facts_and_exam',
] as const;

export type TemplateSource = (typeof TEMPLATE_SOURCES)[number];

export const templateSectionSchema = z.object({
  key: z.string(),
  title: z.string(),
  source: z.string(),
});

export const templateVersionSchema = z.object({
  key: z.string(),
  version: z.number(),
  title: z.string(),
  sections: z.array(templateSectionSchema),
  active: z.union([z.boolean(), z.number()]),
  created_at: z.string(),
});

export const templatesSchema = z.array(templateVersionSchema);
export type TemplateVersion = z.infer<typeof templateVersionSchema>;
export type TemplateSection = z.infer<typeof templateSectionSchema>;

export const publishTemplateResponseSchema = z.object({
  key: z.string(),
  version: z.number(),
});

export function isPanelRole(role: string): role is PanelRole {
  return (panelRoles as readonly string[]).includes(role);
}

export function isActiveFlag(v: boolean | number): boolean {
  return v === true || v === 1;
}
