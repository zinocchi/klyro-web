import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListTodo, Repeat2, LogOut, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/habits', label: 'Habits', icon: Repeat2 },
] as const;

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block rounded-full bg-[var(--gradient-prism)]"
      style={{ width: size, height: size }}
    />
  );
}

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
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-cloud">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-mist bg-snow p-6 lg:flex">
        <div className="mb-8 flex items-center gap-2">
          <LogoMark />
          <span className="text-subheading font-bold text-ink">Klyro</span>
        </div>
        {navContent}
        <div className="mt-auto border-t border-mist pt-4">
          <p className="mb-2 truncate text-caption text-iron">{user?.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2 text-body-sm font-medium text-slate transition-colors hover:bg-cloud hover:text-ink"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="flex items-center justify-between border-b border-mist bg-snow px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <LogoMark size={24} />
          <span className="text-subheading font-bold text-ink">Klyro</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          className="rounded-full p-2 text-slate hover:bg-cloud"
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
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-[6px] px-3 py-2 text-body-sm font-medium text-slate hover:bg-cloud hover:text-ink"
            >
              <LogOut size={18} />
              Log out
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}
