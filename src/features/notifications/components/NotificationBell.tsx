import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  CheckCheck,
  ListTodo,
  PiggyBank,
  Repeat2,
  StickyNote,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS, id as idLocale } from 'date-fns/locale';
import { cn, parseDate } from '../../../lib/utils';
import type { NotificationType } from '../../../types/api.types';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../hooks/useNotifications';

const TYPE_STYLE: Record<NotificationType, { icon: LucideIcon; className: string }> = {
  BUDGET_ALERT: { icon: PiggyBank, className: 'bg-[#ffd4d4] text-ink' },
  TASK_REMINDER: { icon: ListTodo, className: 'bg-periwinkle-wash text-ink' },
  HABIT_REMINDER: { icon: Repeat2, className: 'bg-mint text-ink' },
  NOTE_REMINDER: { icon: StickyNote, className: 'bg-lavender text-ink' },
  DAILY_FINANCE: { icon: Wallet, className: 'bg-sky text-ink' },
};

export function NotificationBell() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const query = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const notifications = query.data?.notifications ?? [];
  const unread = query.data?.unread_count ?? 0;
  const locale = i18n.language === 'en' ? enUS : idLocale;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          unread > 0 ? t('notifications.ariaUnread', { count: unread }) : t('notifications.aria')
        }
        className="relative rounded-full p-3 text-slate transition-colors hover:bg-cloud hover:text-ink"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e2445c] px-1 text-[10px] font-semibold leading-none text-snow">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('notifications.title')}
          className="absolute right-0 z-50 mt-2 w-[min(calc(100vw-2rem),22rem)] overflow-hidden rounded-[24px] border border-mist bg-snow shadow-[var(--shadow-elevated)]"
        >
          <div className="flex items-center justify-between gap-2 border-b border-mist px-4 py-3">
            <h2 className="text-body-sm font-medium text-ink">{t('notifications.title')}</h2>
            <button
              type="button"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending || unread === 0}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-caption font-medium text-monday-violet transition-colors hover:bg-cloud disabled:cursor-not-allowed disabled:text-iron disabled:hover:bg-transparent"
            >
              <CheckCheck size={14} />
              {t('notifications.markAllRead')}
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {query.isPending ? (
              <p className="px-4 py-8 text-center text-caption text-iron">
                {t('common.loading')}
              </p>
            ) : query.isError ? (
              <p className="px-4 py-8 text-center text-caption text-[#e05c5c]">
                {t('notifications.loadError')}
              </p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-caption text-iron">
                {t('notifications.empty')}
              </p>
            ) : (
              <ul className="divide-y divide-pebble">
                {notifications.map((notification) => {
                  const style = TYPE_STYLE[notification.type] ?? TYPE_STYLE.DAILY_FINANCE;
                  const Icon = style.icon;
                  const createdAt = parseDate(notification.created_at);
                  return (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() =>
                          !notification.is_read && markRead.mutate(notification.id)
                        }
                        className={cn(
                          'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-cloud',
                          !notification.is_read && 'bg-cloud/60',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                            style.className,
                          )}
                        >
                          <Icon size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="min-w-0 break-words text-body-sm font-medium text-ink">
                              {notification.title}
                            </span>
                            {!notification.is_read && (
                              <span
                                aria-label={t('notifications.unread')}
                                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#e2445c]"
                              />
                            )}
                          </span>
                          <span className="mt-0.5 block break-words text-caption text-slate">
                            {notification.message}
                          </span>
                          <span className="mt-1 block text-caption text-iron">
                            {createdAt
                              ? formatDistanceToNow(createdAt, { addSuffix: true, locale })
                              : '—'}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
