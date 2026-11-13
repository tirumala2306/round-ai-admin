import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/auth/AuthContext';
import { RequireAuth } from '@/auth/RequireAuth';
import { AppShell } from '@/components/layout/AppShell';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { AuditPage } from '@/pages/AuditPage';
import { CheckRuleEditorPage } from '@/pages/CheckRuleEditorPage';
import { CheckRulesPage } from '@/pages/CheckRulesPage';
import { CuratedReadsPage } from '@/pages/CuratedReadsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { GuidelineUpdatesPage } from '@/pages/GuidelineUpdatesPage';
import { IcdPage } from '@/pages/IcdPage';
import { QuestionDetailPage } from '@/pages/QuestionDetailPage';
import { QuestionsPage } from '@/pages/QuestionsPage';
import { ChatExportPage } from '@/pages/ChatExportPage';
import { ChatMetricsPage } from '@/pages/ChatMetricsPage';
import { ChatPurgePage } from '@/pages/ChatPurgePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { SignInPage } from '@/pages/SignInPage';
import { TemplateEditorPage } from '@/pages/TemplateEditorPage';
import { TemplatesPage } from '@/pages/TemplatesPage';
import { UsersPage } from '@/pages/UsersPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/sign-in" element={<SignInPage />} />
            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/templates/:key/edit" element={<TemplateEditorPage />} />
                <Route path="/reminders" element={<CheckRulesPage />} />
                <Route path="/reminders/:id" element={<CheckRuleEditorPage />} />
                <Route path="/questions" element={<QuestionsPage />} />
                <Route path="/questions/:id" element={<QuestionDetailPage />} />
                <Route path="/curated-reads" element={<CuratedReadsPage />} />
                <Route path="/guidelines" element={<GuidelineUpdatesPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/icd" element={<IcdPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/chat-purge" element={<ChatPurgePage />} />
                <Route path="/settings/chat-export" element={<ChatExportPage />} />
                <Route path="/settings/chat-metrics" element={<ChatMetricsPage />} />
                <Route path="/audit" element={<AuditPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
