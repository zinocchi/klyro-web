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
          duration: 4000,
          style: {
            fontFamily: 'var(--font-poppins)',
            fontSize: 'var(--text-body-sm)',
            borderRadius: '16px',
            border: '1px solid var(--color-mist)',
            boxShadow: 'var(--shadow-card)',
            background: 'var(--color-snow)',
            color: 'var(--color-ink)',
            padding: '14px 16px',
          },
          classNames: {
            toast: 'items-start',
            title: 'font-medium',
            description: 'text-slate',
            actionButton: 'rounded-full bg-monday-violet text-snow',
            cancelButton: 'rounded-full bg-cloud text-slate',
            closeButton: 'border-mist bg-snow text-slate',
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
