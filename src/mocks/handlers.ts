import { http, HttpResponse } from 'msw';

const base = () => (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const adminUser = {
  id: 'u-admin',
  name: 'Admin',
  email: 'admin@rounds.test',
  role: 'admin',
  active: 1,
  created_at: '2026-01-01T00:00:00.000Z',
  last_login_at: '2026-11-13T00:00:00.000Z',
  last_activity_at: '2026-11-13T00:00:00.000Z',
  teams: ['t1'],
};

let aiEnabled = true;
let chatEnabled = true;
let chatRetentionDays = 90;
let chatLegalHold = false;
let holdHistory: {
  id: string;
  at: string;
  actor_id: string;
  hold: boolean;
  reason: string;
}[] = [];
let pushDevices = 2;
let lastPurge: { at: string; actor_id: string; detail: Record<string, unknown> } | null = null;
let eligibleCount = 3;
let exportHistory: {
  id: string;
  at: string;
  actor_id: string;
  reason: string;
  team_id: string;
  channel_count: number;
  message_count: number;
  format: string;
}[] = [];

function chatSettingsPayload() {
  return {
    chat_enabled: chatEnabled,
    chat_retention_days: chatRetentionDays,
    chat_legal_hold: chatLegalHold,
    chat_limits: { max_message_body: 4000, rate_per_minute: 30 },
    push: {
      registered_devices: pushDevices,
      note: 'Device count only. Tokens are stored as hashes and never returned.',
    },
    retention_last_change: null as null | { at: string; actor_id: string; detail: { days: number } },
    legal_hold_last_change: holdHistory[0]
      ? {
          at: holdHistory[0].at,
          actor_id: holdHistory[0].actor_id,
          detail: { hold: holdHistory[0].hold, reason: holdHistory[0].reason },
        }
      : null,
    last_purge: lastPurge,
  };
}

export const handlers = [
  http.post(`${base()}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (body.email === 'resident@rounds.test') {
      return HttpResponse.json({
        token: 'mock-res',
        expires_in: 28800,
        user: { id: 'u-res', name: 'Res', email: body.email, role: 'resident' },
      });
    }
    if (body.email !== 'admin@rounds.test' || body.password !== 'ChangeMe-12345') {
      return HttpResponse.json(
        { error: { code: 'bad_credentials', message: 'Invalid email or password' } },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      token: 'mock-admin-token',
      expires_in: 28800,
      user: { id: adminUser.id, name: adminUser.name, email: adminUser.email, role: 'admin' },
    });
  }),

  http.get(`${base()}/me`, ({ request }) => {
    if (!request.headers.get('Authorization')?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: { code: 'unauthenticated', message: 'Sign in required' } }, { status: 401 });
    }
    return HttpResponse.json({
      ...adminUser,
      teams: [{ id: 't1', name: 'Team A' }],
      ai_enabled: aiEnabled,
      chat_enabled: chatEnabled,
    });
  }),

  http.get(`${base()}/admin/health`, () =>
    HttpResponse.json({
      status: 'ok',
      time: new Date().toISOString(),
      provider: 'mock',
      model: 'mock-1',
      prompt_version: '2026-11-v2',
      db_ok: true,
      icd_loaded: true,
      ai_enabled: aiEnabled,
    }),
  ),

  http.get(`${base()}/admin/settings`, () =>
    HttpResponse.json({
      ai_enabled: aiEnabled,
      review_intervals_days: [1, 3, 7],
      show_individual_learner_analytics: false,
      provider: 'mock',
      model: 'mock-1',
      prompt_version: '2026-11-v2',
      features: { considerations: false },
      limits: { max_calls_per_user_per_day: 200, max_context_facts: 300 },
      cors_origin: 'http://localhost:5173',
      ...chatSettingsPayload(),
    }),
  ),

  http.put(`${base()}/admin/settings`, async ({ request }) => {
    const body = (await request.json()) as {
      ai_enabled?: boolean;
      chat_enabled?: boolean;
      chat_retention_days?: number;
      chat_legal_hold?: boolean;
      chat_legal_hold_reason?: string;
      reason?: string;
    };
    if (body.ai_enabled !== undefined) aiEnabled = !!body.ai_enabled;
    if (body.chat_enabled !== undefined) chatEnabled = !!body.chat_enabled;
    if (body.chat_retention_days !== undefined) {
      chatRetentionDays = Number(body.chat_retention_days);
    }
    if (body.chat_legal_hold !== undefined) {
      const next = !!body.chat_legal_hold;
      if (next !== chatLegalHold) {
        const reason = String(body.chat_legal_hold_reason ?? body.reason ?? '').trim();
        if (reason.length < 3) {
          return HttpResponse.json(
            { error: { code: 'reason_required', message: 'A reason is required when changing legal hold' } },
            { status: 400 },
          );
        }
        chatLegalHold = next;
        holdHistory = [
          {
            id: `hold-${holdHistory.length + 1}`,
            at: new Date().toISOString(),
            actor_id: adminUser.id,
            hold: next,
            reason,
          },
          ...holdHistory,
        ];
      }
    }
    return HttpResponse.json({ ok: true, ...chatSettingsPayload(), ai_enabled: aiEnabled });
  }),

  http.get(`${base()}/admin/chat/purge/preview`, ({ request }) => {
    const daysParam = new URL(request.url).searchParams.get('days');
    const days = daysParam ? Number(daysParam) : chatRetentionDays;
    const count = daysParam ? (days < 30 ? 12 : 3) : eligibleCount;
    return HttpResponse.json({
      retention_days: days,
      configured_retention_days: chatRetentionDays,
      cutoff: new Date(Date.now() - days * 86400_000).toISOString(),
      eligible_count: count,
      blocked: chatLegalHold,
      blocked_reason: chatLegalHold ? 'legal_hold' : null,
      last_purge: lastPurge,
      note: 'Counts only. No message content is returned.',
    });
  }),

  http.post(`${base()}/admin/chat/purge`, () => {
    if (chatLegalHold) {
      return HttpResponse.json({
        purged: 0,
        skipped: true,
        reason: 'legal_hold',
        retention_days: chatRetentionDays,
        last_purge: lastPurge,
      });
    }
    const purged = eligibleCount;
    eligibleCount = 0;
    lastPurge = {
      at: new Date().toISOString(),
      actor_id: adminUser.id,
      detail: { purged, cutoff_day: new Date().toISOString().slice(0, 10) },
    };
    return HttpResponse.json({
      purged,
      skipped: false,
      retention_days: chatRetentionDays,
      cutoff: lastPurge.detail.cutoff_day,
      last_purge: lastPurge,
    });
  }),

  http.get(`${base()}/admin/chat/hold/history`, () =>
    HttpResponse.json({
      rows: holdHistory,
      total: holdHistory.length,
      limit: 50,
      offset: 0,
    }),
  ),

  http.post(`${base()}/admin/chat/export`, async ({ request }) => {
    const body = (await request.json()) as { team_id?: string; reason?: string };
    const reason = String(body.reason || '').trim();
    if (reason.length < 3) {
      return HttpResponse.json(
        { error: { code: 'reason_required', message: 'Export reason is required' } },
        { status: 400 },
      );
    }
    const teamId = String(body.team_id || '');
    if (!teamId) {
      return HttpResponse.json(
        { error: { code: 'team_required', message: 'team_id is required' } },
        { status: 400 },
      );
    }
    const exportId = `exp-${exportHistory.length + 1}`;
    const at = new Date().toISOString();
    exportHistory = [
      {
        id: exportId,
        at,
        actor_id: adminUser.id,
        reason,
        team_id: teamId,
        channel_count: 1,
        message_count: 2,
        format: 'json',
      },
      ...exportHistory,
    ];
    // PHI payload for download-only — never rendered by the panel.
    return HttpResponse.json(
      {
        export_id: exportId,
        exported_at: at,
        team_id: teamId,
        reason,
        channel_count: 1,
        message_count: 2,
        format: 'json',
        notice: 'Compliance export. Protect as PHI.',
        channels: [
          {
            channel: { id: 'ch-sample', name: 'general', type: 'team', patient_id: null, archived: false },
            messages: [
              {
                seq: 1,
                id: 'm-sample',
                channel_id: 'ch-sample',
                sender_id: adminUser.id,
                body: 'FAKE_EXPORT_BODY_DO_NOT_RENDER',
                parent_id: null,
                created_at: at,
                edited_at: null,
                deleted_at: null,
              },
            ],
          },
        ],
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }),

  http.get(`${base()}/admin/chat/export/history`, () =>
    HttpResponse.json({
      rows: exportHistory,
      total: exportHistory.length,
      limit: 50,
      offset: 0,
    }),
  ),

  http.get(`${base()}/admin/chat/metrics`, ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from') || '2026-11-01';
    const to = url.searchParams.get('to') || '2026-11-13';
    return HttpResponse.json({
      from,
      to,
      days: [
        {
          day: '2026-11-12',
          active_channels: 2,
          messages_posted: 5,
          summarize_requests: 1,
          push_registrations: 1,
          rate_limit_rejections: 0,
          spam_rejections: 1,
        },
      ],
      totals: {
        active_channels: 2,
        messages_posted: 5,
        summarize_requests: 1,
        push_registrations: 1,
        rate_limit_rejections: 0,
        spam_rejections: 1,
      },
      note: 'Aggregates only. No message text, channel titles, or participant lists.',
    });
  }),

  http.get(`${base()}/admin/users`, () => HttpResponse.json([adminUser])),
  http.get(`${base()}/admin/teams`, () =>
    HttpResponse.json([{ id: 't1', name: 'Team A', members: [{ id: adminUser.id, name: adminUser.name, email: adminUser.email }] }]),
  ),
  http.get(`${base()}/admin/usage`, () =>
    HttpResponse.json([
      { user_id: adminUser.id, email: adminUser.email, day: new Date().toISOString().slice(0, 10), calls: 3, input_tokens: 100, output_tokens: 50 },
    ]),
  ),
  http.get(`${base()}/admin/check-rules`, ({ request }) => {
    const status = new URL(request.url).searchParams.get('status');
    const all = [
      {
        id: 'r1',
        name: 'Pyelo draft',
        status: 'draft',
        version: 1,
        ai_drafted: false,
        match: { problem_keywords: ['pyelo'], icd_prefixes: ['N10'] },
        prompts: [{ text: 'Check CVA tenderness', kind: 'exam' }],
        compare: null,
        frame: 'Prompt for your consideration',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'r2',
        name: 'Pneumonia approved',
        status: 'approved',
        version: 1,
        ai_drafted: false,
        approved_by: adminUser.id,
        approved_at: '2026-02-01T00:00:00.000Z',
        match: { problem_keywords: ['pneumonia'], icd_prefixes: ['J18'] },
        prompts: [{ text: 'Review oxygen requirement', kind: 'review' }],
        compare: null,
        frame: 'Prompt for your consideration',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-02-01T00:00:00.000Z',
      },
    ];
    return HttpResponse.json(status ? all.filter((r) => r.status === status) : all);
  }),
  http.get(`${base()}/admin/check-rules/:id`, ({ params }) => {
    if (params.id === 'r2') {
      return HttpResponse.json({
        id: 'r2',
        name: 'Pneumonia approved',
        status: 'approved',
        version: 1,
        match: { problem_keywords: ['pneumonia'], icd_prefixes: ['J18'] },
        prompts: [{ text: 'Review oxygen requirement', kind: 'review' }],
        compare: null,
        frame: 'Prompt for your consideration',
        approved_by: adminUser.id,
        approved_at: '2026-02-01T00:00:00.000Z',
      });
    }
    return HttpResponse.json({
      id: String(params.id),
      name: 'Pyelo draft',
      status: 'draft',
      version: 1,
      match: { problem_keywords: ['pyelo'], icd_prefixes: ['N10'] },
      prompts: [{ text: 'Check CVA tenderness', kind: 'exam' }],
      compare: null,
      frame: 'Prompt for your consideration',
      ai_drafted: false,
    });
  }),
  http.post(`${base()}/admin/check-rules`, async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json({
      id: 'r-new',
      name: body.name,
      status: 'draft',
      version: 1,
      match: { problem_keywords: [], icd_prefixes: [] },
      prompts: [],
      ai_drafted: false,
      frame: 'Prompt for your consideration',
    });
  }),
  http.post(`${base()}/admin/check-rules/draft`, async ({ request }) => {
    const body = (await request.json()) as { condition?: string };
    return HttpResponse.json({
      id: 'r-ai',
      name: `AI draft: ${body.condition || 'condition'}`,
      status: 'draft',
      version: 1,
      ai_drafted: true,
      match: { problem_keywords: [String(body.condition || '').toLowerCase()], icd_prefixes: [] },
      prompts: [{ text: 'Review clinically', kind: 'review' }],
      compare: null,
      frame: 'Prompt for your consideration',
    });
  }),
  http.put(`${base()}/admin/check-rules/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: String(params.id),
      status: 'draft',
      version: 1,
      frame: 'Prompt for your consideration',
      ...body,
      name: body.name || 'Updated',
    });
  }),
  http.post(`${base()}/admin/check-rules/:id/approve`, ({ params }) =>
    HttpResponse.json({
      id: String(params.id),
      status: 'approved',
      approved_by: adminUser.id,
      approved_at: new Date().toISOString(),
      name: 'Approved rule',
      match: { problem_keywords: ['x'], icd_prefixes: [] },
      prompts: [{ text: 'Prompt', kind: 'exam' }],
      frame: 'Prompt for your consideration',
    }),
  ),
  http.post(`${base()}/admin/check-rules/:id/retire`, ({ params }) =>
    HttpResponse.json({
      id: String(params.id),
      status: 'retired',
      name: 'Retired rule',
      match: { problem_keywords: [], icd_prefixes: [] },
      prompts: [],
      frame: 'Prompt for your consideration',
    }),
  ),
  http.get(`${base()}/admin/mcqs`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const all = [
      {
        id: 'm1',
        status: 'ai_generated_unreviewed',
        topic: 'aki',
        difficulty: 'medium',
        source: 'ai_generated',
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'm2',
        status: 'reported',
        topic: 'aki',
        difficulty: 'hard',
        source: 'ai_generated',
        created_at: '2026-01-02T00:00:00.000Z',
      },
    ];
    if (!status) return HttpResponse.json(all.filter((m) => m.status === 'ai_generated_unreviewed' || m.status === 'reported'));
    return HttpResponse.json(all.filter((m) => m.status === status));
  }),
  http.get(`${base()}/admin/mcqs/:id`, ({ params }) =>
    HttpResponse.json({
      id: String(params.id),
      topic: 'aki',
      status: 'ai_generated_unreviewed',
      source: 'ai_generated',
      difficulty: 'medium',
      created_at: '2026-01-01T00:00:00.000Z',
      content: {
        vignette: 'A patient with rising creatinine.',
        question: 'Next step?',
        options: { A: 'IV fluids', B: 'Dialysis', C: 'Ignore', D: 'CT', E: 'Nothing' },
        answer: 'A',
        explanation: 'Supportive care first.',
        option_explanations: { A: 'Correct', B: 'Too soon', C: 'Wrong', D: 'Wrong', E: 'Wrong' },
        learning_objective: 'AKI initial management',
        references: [{ pmid: '12345678' }],
      },
      validation: { ok: true },
    }),
  ),
  http.patch(`${base()}/admin/mcqs/:id`, async ({ params, request }) => {
    const body = (await request.json()) as { status?: string };
    return HttpResponse.json({
      id: String(params.id),
      status: body.status || 'approved',
      approved_by: body.status === 'approved' ? adminUser.id : null,
      approved_at: body.status === 'approved' ? new Date().toISOString() : null,
    });
  }),
  http.get(`${base()}/admin/mcq-reports`, () =>
    HttpResponse.json([
      { id: 'ir1', mcq_id: 'm2', note: 'Ambiguous stem', created_at: '2026-01-03T00:00:00.000Z', topic: 'aki', status: 'reported' },
    ]),
  ),
  http.get(`${base()}/admin/curated-reads`, () =>
    HttpResponse.json([
      {
        id: 'c1',
        topic: 'pneumonia',
        title: 'CAP landmark',
        citation: 'NEJM',
        pmid: '9990001',
        why_it_matters: 'Core teaching',
        approved: 0,
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ]),
  ),
  http.post(`${base()}/admin/curated-reads`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: 'c-new', approved: 0, ...body });
  }),
  http.post(`${base()}/admin/curated-reads/:id/approve`, ({ params }) =>
    HttpResponse.json({
      id: String(params.id),
      topic: 'pneumonia',
      title: 'CAP landmark',
      approved: 1,
      approved_by: adminUser.id,
      approved_at: new Date().toISOString(),
    }),
  ),
  http.get(`${base()}/admin/guideline-updates`, ({ request }) => {
    const status = new URL(request.url).searchParams.get('status');
    const all = [
      {
        id: 'g1',
        topic: 'sepsis',
        organization: 'SSC',
        title: 'Bundle update',
        status: 'draft',
        url: 'https://example.com/guideline',
        summary_by_admin: 'Review lactate timing',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ];
    return HttpResponse.json(status ? all.filter((g) => g.status === status) : all);
  }),
  http.post(`${base()}/admin/guideline-updates`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: 'g-new', status: 'draft', ...body });
  }),
  http.post(`${base()}/admin/guideline-updates/:id/approve`, ({ params }) =>
    HttpResponse.json({
      id: String(params.id),
      topic: 'sepsis',
      organization: 'SSC',
      title: 'Bundle update',
      status: 'approved',
      url: 'https://example.com/guideline',
      approved_by: adminUser.id,
      approved_at: new Date().toISOString(),
    }),
  ),
  http.get(`${base()}/admin/audit`, () =>
    HttpResponse.json({
      rows: [{
        id: 1,
        at: new Date().toISOString(),
        actor_id: adminUser.id,
        action: 'login',
        patient_id: null,
        artifact_id: null,
        detail: null,
      }],
      total: 1,
      limit: 50,
      offset: 0,
    }),
  ),
  http.get(`${base()}/admin/audit.csv`, () =>
    HttpResponse.text('id,at,actor_id,action,patient_id,artifact_id,detail\n1,2026-11-13,u-admin,login,,,\n', {
      headers: { 'Content-Type': 'text/csv; charset=utf-8' },
    }),
  ),

  http.get(`${base()}/admin/templates`, () =>
    HttpResponse.json([
      {
        key: 'progress',
        version: 1,
        title: 'Progress note',
        active: 1,
        created_at: '2026-01-01T00:00:00.000Z',
        sections: [
          { key: 'subjective', title: 'Subjective', source: 'clinician_subjective' },
          { key: 'objective', title: 'Objective', source: 'facts_and_exam' },
          { key: 'assessment_plan', title: 'Assessment and Plan', source: 'clinician_plan' },
        ],
      },
    ]),
  ),

  http.put(`${base()}/admin/templates/:key`, async ({ params, request }) => {
    const body = (await request.json()) as { title?: string; sections?: unknown[] };
    if (!body.sections?.length) {
      return HttpResponse.json(
        { error: { code: 'sections_required', message: 'sections required' } },
        { status: 400 },
      );
    }
    return HttpResponse.json({ key: String(params.key), version: 2 });
  }),

  http.get(`${base()}/admin/analytics/activity`, () =>
    HttpResponse.json({
      rows: [{ actor_id: adminUser.id, action: 'login', count: 3 }],
      note: 'Action counts only — audit never stores clinical text.',
    }),
  ),

  http.get(`${base()}/admin/analytics/questions`, () =>
    HttpResponse.json({
      by_topic: [{ topic: 'aki', attempts: 4, pct_correct: 50, avg_seconds: 30, reported_count: 1 }],
      individuals: null,
      individual_learner_analytics: false,
      note: 'Topic-level aggregates by default.',
    }),
  ),

  http.get(`${base()}/admin/icd`, () =>
    HttpResponse.json({
      count: 12,
      fy: 'demo',
      fts: true,
      demo_only: true,
      import: 'npm run import-icd -- <order-file> --fy=YYYY --replace',
      links: {
        cdc: 'https://www.cdc.gov/nchs/icd/icd-10-cm/files.html',
        cms: 'https://www.cms.gov/medicare/coding-billing/icd-10-codes',
      },
    }),
  ),
];
