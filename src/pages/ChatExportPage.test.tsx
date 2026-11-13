import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ChatExportPage } from './ChatExportPage';

const fetchTeams = vi.fn();
const fetchExportHistory = vi.fn();
const downloadChatExport = vi.fn();

vi.mock('@/api/admin', () => ({
  fetchTeams: (...args: unknown[]) => fetchTeams(...args),
  fetchExportHistory: (...args: unknown[]) => fetchExportHistory(...args),
}));

vi.mock('@/features/chat/exportDownload', () => ({
  downloadChatExport: (...args: unknown[]) => downloadChatExport(...args),
  abortPendingChatExports: vi.fn(),
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
      <MemoryRouter initialEntries={['/settings/chat-export']}>
        <Routes>
          <Route path="/settings/chat-export" element={<ChatExportPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ChatExportPage', () => {
  beforeEach(() => {
    fetchTeams.mockReset();
    fetchExportHistory.mockReset();
    downloadChatExport.mockReset();
    fetchTeams.mockResolvedValue([{ id: 't1', name: 'Team SAMPLE', members: [] }]);
    fetchExportHistory.mockResolvedValue({
      rows: [
        {
          id: 'exp1',
          at: '2026-11-01T10:00:00.000Z',
          actor_id: 'u-admin',
          reason: 'Quarterly SAMPLE export',
          team_id: 't1',
          channel_count: 1,
          message_count: 2,
          format: 'json',
        },
      ],
      total: 1,
      limit: 50,
      offset: 0,
    });
  });

  it('shows PHI warning and history without message content', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('phi-warning')).toHaveTextContent(/Contains PHI/i);
    });
    const hist = await screen.findByTestId('export-history');
    expect(hist).toHaveTextContent('Quarterly SAMPLE export');
    expect(hist).toHaveTextContent('2');
    expect(hist.textContent).not.toMatch(/FAKE_EXPORT_BODY|Morning huddle/i);
  });

  it('requires reason and type-to-confirm; never renders download payload', async () => {
    const user = userEvent.setup();
    downloadChatExport.mockResolvedValue({
      filename: 'roundsai-chat-export-t1-2026-11-13.json',
      bytes: 128,
      cacheControl: 'no-store',
    });
    renderPage();
    await screen.findByLabelText(/team/i);

    const requestBtn = screen.getByRole('button', { name: /request download/i });
    expect(requestBtn).toBeDisabled();
    await user.type(screen.getByLabelText(/reason/i), 'Litigation SAMPLE-001');
    expect(requestBtn).toBeEnabled();

    await user.click(requestBtn);
    const dialog = screen.getByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: /download file/i });
    expect(confirm).toBeDisabled();
    await user.type(within(dialog).getByLabelText(/type/i), 'EXPORT');
    await user.click(confirm);

    await waitFor(() => {
      expect(downloadChatExport).toHaveBeenCalledWith(
        expect.objectContaining({
          teamId: 't1',
          reason: 'Litigation SAMPLE-001',
        }),
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId('export-status')).toHaveTextContent(/not opened/i);
    });
    expect(document.body.textContent).not.toMatch(/FAKE_EXPORT_BODY_DO_NOT_RENDER/);
  });
});
