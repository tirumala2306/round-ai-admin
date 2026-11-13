import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ChatPurgePage } from './ChatPurgePage';

const fetchSettings = vi.fn();
const fetchPurgePreview = vi.fn();
const runChatPurge = vi.fn();

vi.mock('@/api/admin', () => ({
  fetchSettings: (...args: unknown[]) => fetchSettings(...args),
  fetchPurgePreview: (...args: unknown[]) => fetchPurgePreview(...args),
  runChatPurge: (...args: unknown[]) => runChatPurge(...args),
}));

vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u-admin', email: 'admin@rounds.test', name: 'Admin', role: 'admin' },
    ready: true,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/settings/chat-purge']}>
        <Routes>
          <Route path="/settings/chat-purge" element={<ChatPurgePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ChatPurgePage', () => {
  beforeEach(() => {
    fetchSettings.mockReset();
    fetchPurgePreview.mockReset();
    runChatPurge.mockReset();
    fetchSettings.mockResolvedValue({
      ai_enabled: true,
      review_intervals_days: [1, 3, 7],
      provider: 'mock',
      prompt_version: 'v1',
      limits: { max_calls_per_user_per_day: 200, max_context_facts: 300 },
      chat_enabled: true,
      chat_retention_days: 90,
      chat_legal_hold: false,
      last_purge: null,
    });
  });

  it('blocks run under legal hold and explains why', async () => {
    fetchSettings.mockResolvedValue({
      ai_enabled: true,
      review_intervals_days: [1, 3, 7],
      provider: 'mock',
      prompt_version: 'v1',
      limits: { max_calls_per_user_per_day: 200, max_context_facts: 300 },
      chat_retention_days: 90,
      chat_legal_hold: true,
    });
    fetchPurgePreview.mockResolvedValue({
      retention_days: 90,
      cutoff: '2026-08-01T00:00:00.000Z',
      eligible_count: 7,
      blocked: true,
      blocked_reason: 'legal_hold',
      last_purge: null,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('purge-blocked')).toBeInTheDocument();
    });
    expect(screen.getByTestId('purge-blocked')).toHaveTextContent(/legal hold/i);
    expect(screen.getByRole('button', { name: /run purge/i })).toBeDisabled();
    expect(document.body.textContent).not.toMatch(/Morning huddle|clinical note/i);
  });

  it('requires typing the exact eligible count and destroy checkbox', async () => {
    const user = userEvent.setup();
    fetchPurgePreview.mockResolvedValue({
      retention_days: 90,
      cutoff: '2026-08-01T00:00:00.000Z',
      eligible_count: 7,
      blocked: false,
      blocked_reason: null,
      last_purge: {
        at: '2026-10-01T00:00:00.000Z',
        actor_id: 'u-admin',
        detail: { purged: 2 },
      },
    });
    runChatPurge.mockResolvedValue({
      purged: 7,
      skipped: false,
      retention_days: 90,
      last_purge: {
        at: '2026-11-13T01:00:00.000Z',
        actor_id: 'u-admin',
        detail: { purged: 7 },
      },
    });

    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('purge-eligible-count')).toHaveTextContent('7');
    });

    await user.click(screen.getByRole('button', { name: /run purge/i }));
    const dialog = screen.getByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Purge now' });
    expect(confirm).toBeDisabled();

    await user.type(within(dialog).getByLabelText(/type/i), '7');
    expect(confirm).toBeDisabled();

    await user.click(within(dialog).getByTestId('purge-destroy-ack'));
    expect(confirm).toBeEnabled();

    await user.click(confirm);
    await waitFor(() => {
      expect(runChatPurge).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByTestId('purge-audit-note')).toHaveTextContent(/7 message/);
    });
    expect(screen.getByTestId('purge-audit-note').textContent).toMatch(/admin_chat_purge/);
  });

  it('shows last purge metadata without content fields', async () => {
    fetchPurgePreview.mockResolvedValue({
      retention_days: 90,
      cutoff: '2026-08-01T00:00:00.000Z',
      eligible_count: 0,
      blocked: false,
      last_purge: {
        at: '2026-10-01T12:00:00.000Z',
        actor_id: 'u-admin',
        detail: { purged: 4 },
      },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('u-admin')).toBeInTheDocument();
    });
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /run purge/i })).toBeDisabled();
    expect(JSON.stringify(document.body.textContent)).not.toMatch(/"body"|channel title/i);
  });

  it('shows soft SoD advisory when current user last changed retention', async () => {
    fetchSettings.mockResolvedValue({
      ai_enabled: true,
      review_intervals_days: [1, 3, 7],
      provider: 'mock',
      prompt_version: 'v1',
      limits: { max_calls_per_user_per_day: 200, max_context_facts: 300 },
      chat_retention_days: 90,
      chat_legal_hold: false,
      retention_last_change: { at: '2026-11-01T00:00:00.000Z', actor_id: 'u-admin' },
    });
    fetchPurgePreview.mockResolvedValue({
      retention_days: 90,
      cutoff: '2026-08-01T00:00:00.000Z',
      eligible_count: 3,
      blocked: false,
      last_purge: null,
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('purge-sod-advisory')).toHaveTextContent(/different person/i);
    });
  });
});
