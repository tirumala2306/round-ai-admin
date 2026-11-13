import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ChatMetricsPage } from './ChatMetricsPage';
import { CHAT_AUDIT_ACTIONS } from '@/api/schemas';

const fetchChatMetrics = vi.fn();

vi.mock('@/api/admin', () => ({
  fetchChatMetrics: (...args: unknown[]) => fetchChatMetrics(...args),
}));

const downloadTextFile = vi.fn();
vi.mock('@/lib/format', async () => {
  const actual = await vi.importActual<typeof import('@/lib/format')>('@/lib/format');
  return {
    ...actual,
    downloadTextFile: (...args: unknown[]) => downloadTextFile(...args),
  };
});

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/settings/chat-metrics']}>
        <Routes>
          <Route path="/settings/chat-metrics" element={<ChatMetricsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ChatMetricsPage', () => {
  beforeEach(() => {
    fetchChatMetrics.mockReset();
    downloadTextFile.mockReset();
    fetchChatMetrics.mockResolvedValue({
      from: '2026-11-01',
      to: '2026-11-13',
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
      note: 'Aggregates only.',
    });
  });

  it('renders counts without message/content fields', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('chat-metrics-totals')).toHaveTextContent('5');
    });
    const table = screen.getByTestId('chat-metrics-table');
    expect(table).toHaveTextContent('2026-11-12');
    expect(table.textContent).not.toMatch(/FAKE_EXPORT|Morning huddle|"body"/i);
    // Page may mention that content is excluded; assert no PHI-like payload appears.
    expect(document.body.textContent).not.toMatch(/FAKE_EXPORT_BODY|ExponentPushToken/i);
  });

  it('exports CSV of aggregates', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByTestId('chat-metrics-table');
    await user.click(screen.getByRole('button', { name: /export csv/i }));
    expect(downloadTextFile).toHaveBeenCalled();
    const csv = downloadTextFile.mock.calls[0][1] as string;
    expect(csv).toContain('messages_posted');
    expect(csv).not.toMatch(/body|participant/i);
  });
});

describe('CHAT_AUDIT_ACTIONS', () => {
  it('includes governance and message lifecycle codes', () => {
    const values = CHAT_AUDIT_ACTIONS.map((a) => a.value);
    expect(values).toEqual(
      expect.arrayContaining([
        'chat_post',
        'chat_edit',
        'chat_delete',
        'chat_summarize_requested',
        'admin_chat_export',
        'admin_chat_purge',
        'admin_chat_legal_hold',
        'admin_chat_switch',
      ]),
    );
  });
});
