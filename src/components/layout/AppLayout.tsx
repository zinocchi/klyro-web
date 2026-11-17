import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListTodo, Repeat2, LogOut, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';
import { KlyroIcon, KlyroLogo } from '../brand/KlyroLogo';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/habits', label: 'Habits', icon: Repeat2 },
] as const;

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/login', { replace: true });
  };

  const navContent = (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-[6px] px-3 py-2.5 text-body-sm font-medium transition-colors',
              isActive
                ? 'bg-periwinkle text-monday-violet'
                : 'text-slate hover:bg-cloud hover:text-ink',
            )
          }
        >
          <Icon size={18} className="shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  const logoutButton = (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2 text-body-sm font-medium text-slate transition-colors hover:bg-cloud hover:text-ink"
    >
      <LogOut size={18} className="shrink-0" />
      Log out
    </button>
  );

  return (
    <div className="flex min-h-screen flex-col bg-cloud lg:flex-row">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-mist bg-snow px-4 py-3 lg:hidden">
        <KlyroLogo height={26} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          className="rounded-full p-2 text-slate transition-colors hover:bg-cloud"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="border-b border-mist bg-snow px-4 py-4 lg:hidden">
          {navContent}
          <div className="mt-4 border-t border-mist pt-4">
            <p className="mb-2 truncate text-caption text-iron">{user?.email}</p>
            {logoutButton}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-mist bg-snow p-6 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="mb-8 flex items-center">
          <KlyroLogo height={30} />
        </div>
        {navContent}
        <div className="mt-auto border-t border-mist pt-4">
          <div className="mb-2 flex items-center gap-2">
            <KlyroIcon size={20} className="shrink-0" />
            <p className="min-w-0 truncate text-caption text-iron">{user?.email}</p>
          </div>
          {logoutButton}
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}
