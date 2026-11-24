import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { queryClient } from './lib/queryClient';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { PublicRoute } from './components/layout/PublicRoute';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { HabitsPage } from './features/habits/pages/HabitsPage';
import { MoneyPage } from './features/money/pages/MoneyPage';
import { NotesPage } from './features/notes/pages/NotesPage';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { TasksPage } from './features/tasks/pages/TasksPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/money" element={<MoneyPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        closeButton
        gap={12}
        offset={16}
        toastOptions={{
          duration: 5000,
          style: {
            fontFamily: 'var(--font-poppins)',
            fontSize: 'var(--text-body-sm)',
            borderRadius: '16px',
            border: '1.5px solid #6161ff',
            boxShadow: '0 8px 24px rgba(205, 208, 223, 0.55)',
            background: '#ffffff',
            color: 'var(--color-ink)',
            padding: '14px 16px',
          },
          classNames: {
            toast: 'items-start !bg-white',
            title: 'font-medium',
            description: 'text-slate',
            success: '!border-[#00c875]',
            error: '!border-[#e2445c]',
            warning: '!border-[#fdab3d]',
            info: '!border-[#6161ff]',
            actionButton: 'rounded-full bg-monday-violet text-snow',
            cancelButton: 'rounded-full bg-cloud text-slate',
            closeButton: 'border-mist bg-white text-slate',
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
