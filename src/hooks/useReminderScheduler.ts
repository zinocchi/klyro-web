import { useEffect, useRef } from 'react';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useHabits } from '../features/habits/hooks/useHabits';
import { useNotes } from '../features/notes/hooks/useNotes';
import { createNotification } from '../features/notifications/api/notifications.api';
import { notificationKeys } from '../features/notifications/hooks/useNotifications';
import { useTasks } from '../features/tasks/hooks/useTasks';
import { parseDate, toDateKey } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';
import { playNotificationSound } from '../utils/sound';
import type { CreateNotificationRequest } from '../types/api.types';

const CHECK_MS = 30_000;
/** Reminder timestamps older than this are considered stale. */
const WINDOW_MS = 15 * 60 * 1000;
/** Repeating reminders only fire inside this local-time window. */
const ACTIVE_START_HOUR = 8;
const ACTIVE_END_HOUR = 21;
const STORAGE_KEY = 'klyro-fired-reminders';
const MAX_FIRED = 200;

function loadFired(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

/** Record the reminder key; returns false when it already fired. */
function claim(key: string): boolean {
  const fired = loadFired();
  if (fired.includes(key)) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...fired, key].slice(-MAX_FIRED)));
  return true;
}

/**
 * Sound + bordered toast + browser notification + persisted bell entry.
 * The `POST /notifications` row is what makes the bell badge tick.
 */
function fire(
  key: string,
  payload: CreateNotificationRequest,
  queryClient: QueryClient,
) {
  if (!claim(key)) return;

  playNotificationSound();
  toast.warning(payload.title, { description: payload.message });

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(payload.title, { body: payload.message });
  }

  createNotification(payload)
    .then(() => queryClient.invalidateQueries({ queryKey: notificationKeys.all }))
    .catch(() => {
      /* offline / logged out — the in-app toast already fired */
    });
}

/** True once the local clock passed `HH:mm` today. */
function pastTime(now: Date, hhmm: string): boolean {
  const [hours, minutes] = hhmm.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return false;
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  return now >= target;
}

function withinWindow(now: Date, iso: string | null): boolean {
  const at = parseDate(iso);
  if (!at) return false;
  const delta = now.getTime() - at.getTime();
  return delta >= 0 && delta <= WINDOW_MS;
}

/**
 * `reminder_interval` fires on each N-hour slot counted from 08:00, e.g. every
 * 2 hours → 08:00, 10:00, … 20:00. Only the first 15 minutes of a slot count so
 * a reload inside the hour does not re-fire it.
 */
function isIntervalSlot(now: Date, hours: number): boolean {
  const hour = now.getHours();
  if (hour < ACTIVE_START_HOUR || hour > ACTIVE_END_HOUR) return false;
  if ((hour - ACTIVE_START_HOUR) % hours !== 0) return false;
  const slot = new Date(now);
  slot.setMinutes(0, 0, 0);
  return withinWindow(now, slot.toISOString());
}

/**
 * In-app + browser reminders for tasks, habits, notes and daily finance.
 * Runs a 30s tick while the app shell is mounted; each reminder fires once per
 * id + timestamp/slot (deduplicated in localStorage).
 */
export function useReminderScheduler() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const tasks = useTasks({}).data?.tasks;
  const habits = useHabits({}).data?.habits;
  const notes = useNotes({}).data?.notes;

  const latest = useRef({ tasks, habits, notes, user, t, queryClient });

  useEffect(() => {
    latest.current = { tasks, habits, notes, user, t, queryClient };
  }, [tasks, habits, notes, user, t, queryClient]);

  useEffect(() => {
    const check = () => {
      const { tasks, habits, notes, user, t, queryClient } = latest.current;
      const now = new Date();
      const today = toDateKey(now);

      for (const task of tasks ?? []) {
        if (task.status === 'COMPLETED') continue;

        const taskPayload = {
          type: 'TASK_REMINDER' as const,
          title: t('reminders.taskTitle'),
          message: t('reminders.taskBody', { title: task.title }),
        };

        for (const iso of task.reminders ?? []) {
          if (!withinWindow(now, iso)) continue;
          fire(`task:${task.id}:${iso}`, taskPayload, queryClient);
        }

        // Legacy single reminder, still honoured for older tasks.
        if (task.reminder_at && withinWindow(now, task.reminder_at)) {
          fire(`task:${task.id}:${task.reminder_at}`, taskPayload, queryClient);
        }

        const interval = task.reminder_interval;
        if (interval && interval > 0 && isIntervalSlot(now, interval)) {
          fire(
            `task-interval:${task.id}:${today}:${now.getHours()}`,
            {
              type: 'TASK_REMINDER',
              title: t('reminders.taskTitle'),
              message: t('reminders.taskIntervalBody', {
                title: task.title,
                hours: interval,
              }),
            },
            queryClient,
          );
        }
      }

      for (const habit of habits ?? []) {
        if (!habit.reminder_time || habit.completed) continue;
        if (habit.recent_logs.includes(today)) continue;
        if (!pastTime(now, habit.reminder_time)) continue;
        fire(
          `habit:${habit.id}:${today}`,
          {
            type: 'HABIT_REMINDER',
            title: t('reminders.habitTitle'),
            message: t('reminders.habitBody', { title: habit.title }),
          },
          queryClient,
        );
      }

      for (const note of notes ?? []) {
        if (!withinWindow(now, note.remind_at)) continue;
        fire(
          `note:${note.id}:${note.remind_at}`,
          {
            type: 'NOTE_REMINDER',
            title: t('reminders.noteTitle'),
            message: note.title || t('reminders.noteBody'),
          },
          queryClient,
        );
      }

      if (user?.daily_reminder_time && pastTime(now, user.daily_reminder_time)) {
        fire(
          `daily:${today}`,
          {
            type: 'DAILY_FINANCE',
            title: t('reminders.dailyTitle'),
            message: t('reminders.dailyBody'),
          },
          queryClient,
        );
      }
    };

    check();
    const timer = setInterval(check, CHECK_MS);
    return () => clearInterval(timer);
  }, []);
}
