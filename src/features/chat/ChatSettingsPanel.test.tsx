import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ChatSettingsPanel } from './ChatSettingsPanel';
import { ChatDashboardCard } from './ChatDashboardCard';
import type { AdminSettings } from '@/api/schemas';

const settingsBase: AdminSettings = {
  ai_enabled: true,
  review_intervals_days: [1, 3, 7],
  provider: 'mock',
  model: 'mock-1',
  prompt_version: 'v1',
  limits: { max_calls_per_user_per_day: 200, max_context_facts: 300 },
  chat_enabled: true,
  chat_retention_days: 90,
  chat_legal_hold: false,
  chat_limits: { max_message_body: 4000, rate_per_minute: 30 },
  push: { registered_devices: 2 },
  retention_last_change: null,
  legal_hold_last_change: null,
  last_purge: null,
};

const updateSettings = vi.fn();
const fetchPurgePreview = vi.fn();
const fetchHoldHistory = vi.fn();

vi.mock('@/api/admin', () => ({
  fetchSettings: vi.fn(),
  updateSettings: (...args: unknown[]) => updateSettings(...args),
  fetchPurgePreview: (...args: unknown[]) => fetchPurgePreview(...args),
  fetchHoldHistory: (...args: unknown[]) => fetchHoldHistory(...args),
}));

function renderPanel(settings: AdminSettings = settingsBase) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <ChatSettingsPanel settings={settings} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ChatSettingsPanel', () => {
  beforeEach(() => {
    updateSettings.mockReset();
    fetchPurgePreview.mockReset();
    fetchHoldHistory.mockReset();
    fetchPurgePreview.mockResolvedValue({
      retention_days: 90,
      configured_retention_days: 90,
      cutoff: '2026-01-01T00:00:00.000Z',
      eligible_count: 3,
      blocked: false,
      blocked_reason: null,
      last_purge: null,
    });
    fetchHoldHistory.mockResolvedValue({ rows: [], total: 0, limit: 20, offset: 0 });
  });

  it('shows limits and device counts without tokens or message fields', async () => {
    renderPanel();
    await waitFor(() => {
      expect(screen.getByTestId('push-device-count')).toHaveTextContent('2');
    });
    expect(screen.getByText(/4000 chars/i)).toBeInTheDocument();
    expect(screen.getByText(/30 \/ min/i)).toBeInTheDocument();
    expect(screen.getByText(/device tokens are never shown/i)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/ExponentPushToken|fcm_reg_|message body|PHI content/i);
  });

  it('requires type-to-confirm before disabling chat', async () => {
    const user = userEvent.setup();
    updateSettings.mockResolvedValue({ ok: true, chat_enabled: false });
    renderPanel();

    await user.click(screen.getByRole('button', { name: 'Disable chat' }));
    const dialog = screen.getByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Disable chat' });
    expect(confirm).toBeDisabled();
    await user.type(within(dialog).getByLabelText(/type/i), 'DISABLE CHAT');
    expect(confirm).toBeEnabled();
    await user.click(confirm);
    await waitFor(() => {
      expect(updateSettings).toHaveBeenCalledWith({ chat_enabled: false });
    });
  });

  it('requires reason and type-to-confirm for legal hold', async () => {
    const user = userEvent.setup();
    updateSettings.mockResolvedValue({ ok: true, chat_legal_hold: true });
    renderPanel();

    await user.click(screen.getByRole('button', { name: 'Set hold' }));
    const dialog = screen.getByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Set hold' });
    expect(confirm).toBeDisabled();
    await user.type(within(dialog).getByLabelText(/reason/i), 'Subpoena SAMPLE-001');
    await user.type(within(dialog).getByLabelText(/type/i), 'SET HOLD');
    expect(confirm).toBeEnabled();
    await user.click(confirm);
    await waitFor(() => {
      expect(updateSettings).toHaveBeenCalledWith({
        chat_legal_hold: true,
        chat_legal_hold_reason: 'Subpoena SAMPLE-001',
      });
    });
  });

  it('renders hold history reasons without message content', async () => {
    fetchHoldHistory.mockResolvedValue({
      rows: [
        {
          id: 'h1',
          at: '2026-11-01T12:00:00.000Z',
          actor_id: 'u-admin',
          hold: true,
          reason: 'Litigation SAMPLE hold',
        },
      ],
      total: 1,
      limit: 20,
      offset: 0,
    });
    renderPanel();
    await waitFor(() => {
      expect(screen.getByTestId('hold-history')).toHaveTextContent('Litigation SAMPLE hold');
    });
    expect(screen.getByTestId('hold-history').textContent).not.toMatch(/Morning huddle|clinical note/i);
  });

  it('warns retention change with dry-run eligible count', async () => {
    const user = userEvent.setup();
    fetchPurgePreview.mockResolvedValue({
      retention_days: 30,
      configured_retention_days: 90,
      cutoff: '2026-10-01T00:00:00.000Z',
      eligible_count: 12,
      blocked: false,
      last_purge: null,
    });
    updateSettings.mockResolvedValue({ ok: true, chat_retention_days: 30 });
    renderPanel();

    const input = screen.getByLabelText(/days/i);
    await user.clear(input);
    await user.type(input, '30');
    await waitFor(() => {
      expect(screen.getByTestId('retention-preview-count')).toHaveTextContent('12');
    });
    await user.click(screen.getByRole('button', { name: 'Change retention' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toMatch(/permanently delete/i);
    expect(dialog.textContent).toMatch(/12/);
  });
});

describe('ChatDashboardCard', () => {
  it('shows status badges and links to settings without content', () => {
    render(
      <MemoryRouter>
        <ChatDashboardCard
          settings={{
            ...settingsBase,
            chat_legal_hold: true,
            legal_hold_last_change: {
              at: '2026-11-01T12:00:00.000Z',
              actor_id: 'u-admin',
            },
          }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('chat-dashboard-card')).toHaveTextContent('Enabled');
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByTestId('chat-dashboard-card')).toHaveTextContent('90 days');
    expect(screen.getByRole('link', { name: /open chat settings/i })).toHaveAttribute(
      'href',
      '/settings#chat',
    );
    expect(screen.getByRole('link', { name: /chat metrics/i })).toHaveAttribute(
      'href',
      '/settings/chat-metrics',
    );
    expect(screen.getByText(/purge is blocked/i)).toBeInTheDocument();
  });
});
