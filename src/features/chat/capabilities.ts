/**
 * Chat admin capabilities as enforced by roundsai-backend today.
 * A `compliance` role / two-person approval is recommended but not implemented
 * until the client answers Q1 — UI mirrors backend only.
 */
export const CHAT_ACTIONS = [
  'view_settings',
  'toggle_chat',
  'change_retention',
  'set_legal_hold',
  'run_purge',
  'request_export',
  'view_metrics',
  'view_audit',
] as const;

export type ChatAction = (typeof CHAT_ACTIONS)[number];

/** Current backend: all chat admin routes require role=admin. */
export function canPerformChatAction(role: string | null | undefined, _action: ChatAction): boolean {
  return role === 'admin';
}

export type RoleMatrixRow = {
  action: ChatAction;
  label: string;
  admin: boolean;
  compliance: 'TBD';
  note: string;
};

/** Documented matrix for README / Settings — not a second source of truth for enforcement. */
export const CHAT_ROLE_MATRIX: RoleMatrixRow[] = [
  {
    action: 'view_settings',
    label: 'View chat settings / limits / device counts',
    admin: true,
    compliance: 'TBD',
    note: 'Counts and metadata only',
  },
  {
    action: 'toggle_chat',
    label: 'Enable / disable chat',
    admin: true,
    compliance: 'TBD',
    note: 'Type-to-confirm; audited',
  },
  {
    action: 'change_retention',
    label: 'Change retention days',
    admin: true,
    compliance: 'TBD',
    note: 'Recommend different actor than purge (SoD)',
  },
  {
    action: 'set_legal_hold',
    label: 'Set / clear legal hold',
    admin: true,
    compliance: 'TBD',
    note: 'Reason required; global scope today',
  },
  {
    action: 'run_purge',
    label: 'Run purge',
    admin: true,
    compliance: 'TBD',
    note: 'Recommend compliance or second approver (Q1)',
  },
  {
    action: 'request_export',
    label: 'Request compliance export',
    admin: true,
    compliance: 'TBD',
    note: 'Recommend compliance or second approver (Q1)',
  },
  {
    action: 'view_metrics',
    label: 'View chat metrics / CSV',
    admin: true,
    compliance: 'TBD',
    note: 'Aggregates only',
  },
  {
    action: 'view_audit',
    label: 'Filter chat audit actions',
    admin: true,
    compliance: 'TBD',
    note: 'IDs/codes only',
  },
];

/**
 * Soft separation-of-duties advisory (UI only).
 * Backend does not yet block the same admin from retention + purge.
 */
export function retentionPurgeSameActorAdvisory(
  currentUserId: string | null | undefined,
  retentionLastActorId: string | null | undefined,
): string | null {
  if (!currentUserId || !retentionLastActorId) return null;
  if (currentUserId !== retentionLastActorId) return null;
  return 'You are the last person who changed retention. Policy recommendation: a different person should run purge (not enforced until Q1).';
}
