import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ListTodo,
  Repeat2,
  Wallet,
  StickyNote,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useAuthStore } from '../../stores/authStore';
import { updateMe } from '../../features/auth/api/auth.api';
import { NotificationBell } from '../../features/notifications/components/NotificationBell';
import { useReminderScheduler } from '../../hooks/useReminderScheduler';
import { cn } from '../../lib/utils';
import type { Language } from '../../types/api.types';
import { KlyroIcon, KlyroLogo } from '../brand/KlyroLogo';

const NAV_ITEMS = [
  { to: '/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/tasks', key: 'nav.tasks', icon: ListTodo },
  { to: '/habits', key: 'nav.habits', icon: Repeat2 },
  { to: '/money', key: 'nav.money', icon: Wallet },
  { to: '/notes', key: 'nav.notes', icon: StickyNote },
  { to: '/settings', key: 'nav.settings', icon: Settings },
] as const;

const LANGUAGE_CODES: Language[] = ['id', 'en'];

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  useReminderScheduler();

  const language: Language = user?.language === 'en' ? 'en' : 'id';

  const switchLanguage = (next: Language) => {
    if (next === language) return;
    // Flip the UI first so the toggle feels instant, then persist the preference.
    void i18n.changeLanguage(next);
    updateMe({ language: next })
      .then((data) => setUser(data.user))
      .catch(() => toast.error(t('common.languageError')));
  };

  // Lock background scroll while the slide-over drawer is open.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const handleLogout = () => {
    logout();
    setLogoutOpen(false);
    setOpen(false);
    toast.success(t('common.loggedOut'));
    navigate('/login', { replace: true });
  };

  const languageToggle = (
    <div
      role="group"
      aria-label={t('common.changeLanguage')}
      className="flex shrink-0 items-center gap-0.5 rounded-full border border-pebble p-0.5"
    >
      {LANGUAGE_CODES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchLanguage(code)}
          aria-pressed={language === code}
          className={cn(
            'min-h-[32px] rounded-full px-3 text-caption font-medium uppercase transition-colors',
            language === code
              ? 'bg-monday-violet text-snow'
              : 'text-slate hover:bg-cloud hover:text-ink',
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );

  const navContent = (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, key, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex min-h-[44px] items-center gap-3 rounded-[6px] px-3 py-2.5 text-body-sm font-medium transition-colors',
              isActive
                ? 'bg-periwinkle text-monday-violet'
                : 'text-slate hover:bg-cloud hover:text-ink',
            )
          }
        >
          <Icon size={18} className="shrink-0" />
          {t(key)}
        </NavLink>
      ))}
    </nav>
  );

  const accountBlock = (
    <div className="border-t border-mist pt-4">
      <div className="mb-2 flex items-center gap-2">
        <KlyroIcon size={20} className="shrink-0" />
        <div className="min-w-0">
          {user?.name && (
            <p className="truncate text-body-sm font-medium text-ink">{user.name}</p>
          )}
          <p className="truncate text-caption text-iron">{user?.email}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setLogoutOpen(true)}
        className="flex min-h-[44px] w-full items-center gap-3 rounded-[6px] px-3 py-2 text-body-sm font-medium text-slate transition-colors hover:bg-cloud hover:text-ink"
      >
        <LogOut size={18} className="shrink-0" />
        {t('common.logout')}
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-cloud lg:flex-row">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-mist bg-snow px-4 py-3 lg:hidden">
        <KlyroLogo height={26} />
        <div className="flex items-center gap-1">
          <NotificationBell />
          {languageToggle}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t('nav.openNav')}
            className="-mr-2 rounded-full p-3 text-slate transition-colors hover:bg-cloud"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile slide-over drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            'absolute inset-0 bg-ink/40 transition-opacity duration-200',
            open ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            'absolute inset-y-0 left-0 flex w-[85vw] max-w-xs flex-col bg-snow p-6 shadow-[var(--shadow-elevated)] transition-transform duration-200',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="mb-8 flex items-center justify-between">
            <KlyroLogo height={28} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('nav.closeNav')}
              className="-mr-2 rounded-full p-3 text-slate transition-colors hover:bg-cloud"
            >
              <X size={22} />
            </button>
          </div>

          {navContent}
          <div className="mt-auto">{accountBlock}</div>
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-mist bg-snow p-6 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="mb-8 flex items-center justify-between gap-2">
          <KlyroLogo height={30} />
          <div className="flex items-center gap-1">
            {languageToggle}
            <NotificationBell />
          </div>
        </div>
        {navContent}
        <div className="mt-auto">{accountBlock}</div>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
        <Outlet />
      </main>

      <ConfirmModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        title={t('common.logoutTitle')}
        description={t('common.logoutDescription')}
        confirmText={t('common.logoutConfirm')}
        variant="danger"
      />
    </div>
  );
}
