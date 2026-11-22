import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useHabits } from '../features/habits/hooks/useHabits';
import { useNotes } from '../features/notes/hooks/useNotes';
import { useTasks } from '../features/tasks/hooks/useTasks';
import { parseDate, toDateKey } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';

const CHECK_MS = 30_000;
/** Reminder timestamps older than this are considered stale. */
const WINDOW_MS = 15 * 60 * 1000;
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

function fire(key: string, title: string, body: string) {
  if (!claim(key)) return;
  toast(title, { description: body });
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
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
 * In-app + browser reminders for tasks, habits, notes and daily finance.
 * Runs a 30s tick while the app shell is mounted; each reminder fires once per
 * id + timestamp/day slot (deduplicated in localStorage).
 */
export function useReminderScheduler() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const tasks = useTasks({}).data?.tasks;
  const habits = useHabits({}).data?.habits;
  const notes = useNotes({}).data?.notes;

  const latest = useRef({ tasks, habits, notes, user, t });

  useEffect(() => {
    latest.current = { tasks, habits, notes, user, t };
  }, [tasks, habits, notes, user, t]);

  useEffect(() => {
    const check = () => {
      const { tasks, habits, notes, user, t } = latest.current;
      const now = new Date();
      const today = toDateKey(now);

      for (const task of tasks ?? []) {
        if (task.status === 'COMPLETED' || !withinWindow(now, task.reminder_at)) continue;
        fire(
          `task:${task.id}:${task.reminder_at}`,
          t('reminders.taskTitle'),
          t('reminders.taskBody', { title: task.title }),
        );
      }

      for (const habit of habits ?? []) {
        if (!habit.reminder_time || habit.completed) continue;
        if (habit.recent_logs.includes(today)) continue;
        if (!pastTime(now, habit.reminder_time)) continue;
        fire(
          `habit:${habit.id}:${today}`,
          t('reminders.habitTitle'),
          t('reminders.habitBody', { title: habit.title }),
        );
      }

      for (const note of notes ?? []) {
        if (!withinWindow(now, note.remind_at)) continue;
        fire(
          `note:${note.id}:${note.remind_at}`,
          t('reminders.noteTitle'),
          note.title || t('reminders.noteBody'),
        );
      }

      if (user?.daily_reminder_time && pastTime(now, user.daily_reminder_time)) {
        fire(`daily:${today}`, t('reminders.dailyTitle'), t('reminders.dailyBody'));
      }
    };

    check();
    const timer = setInterval(check, CHECK_MS);
    return () => clearInterval(timer);
  }, []);
}
