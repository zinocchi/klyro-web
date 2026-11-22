// Shapes mirroring API.md (klyro-backend v2) — Klyro Personal Life OS.

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TargetDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type Language = 'id' | 'en';
export type NotificationType =
  | 'BUDGET_ALERT'
  | 'TASK_REMINDER'
  | 'HABIT_REMINDER'
  | 'NOTE_REMINDER'
  | 'DAILY_FINANCE';

export const TASK_STATUSES: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
export const TASK_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];
export const TARGET_DAYS: TargetDay[] = [
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN',
];
export const TRANSACTION_TYPES: TransactionType[] = ['INCOME', 'EXPENSE'];
export const LANGUAGES: Language[] = ['id', 'en'];

/* ---------- Envelope ---------- */

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: ApiFieldError[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/* ---------- Entities ---------- */

export interface User {
  id: string;
  email: string;
  name: string;
  /** Integer rupiah ≥ 0, or `null` when unset. */
  monthly_budget: number | null;
  language: Language;
  /** `HH:mm` 24-hour, or `null`. */
  daily_reminder_time: string | null;
  created_at: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  /** Max 100 entries. */
  subtasks: Subtask[];
  /** ISO-8601 datetime, or `null`. */
  reminder_at: string | null;
  created_at: string;
}

export interface Habit {
  id: string;
  title: string;
  target_days: TargetDay[];
  streak_count: number;
  best_streak: number;
  /** `HH:mm` 24-hour, or `null`. */
  reminder_time: string | null;
  created_at: string;
  completed: boolean;
  /** `YYYY-MM-DD` completed logs of the last 30 days (WIB), ascending. */
  recent_logs: string[];
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  /** Integer rupiah, no decimals. */
  amount: number;
  category: string;
  note: string | null;
  date: string;
  created_at: string;
}

export interface TransactionSummary {
  /** `YYYY-MM` */
  month: string;
  total_income: number;
  total_expense: number;
  balance: number;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  /** String ≤ 50 chars, or `null`. */
  tag: string | null;
  /** ISO-8601 datetime, or `null`. */
  remind_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

/* ---------- Requests ---------- */

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  /** Integer rupiah ≥ 0, or `null` to clear. */
  monthly_budget?: number | null;
  language?: Language;
  /** `HH:mm`, or `null` to clear. */
  daily_reminder_time?: string | null;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  due_date?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  subtasks?: Subtask[];
  reminder_at?: string | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  due_date?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  subtasks?: Subtask[];
  reminder_at?: string | null;
}

export interface TaskQueryParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  search?: string;
}

export interface CreateHabitRequest {
  title: string;
  target_days: TargetDay[];
  reminder_time?: string | null;
}

export interface UpdateHabitRequest {
  title?: string;
  target_days?: TargetDay[];
  reminder_time?: string | null;
}

export interface HabitQueryParams {
  date?: string;
}

export interface CheckInRequest {
  date: string;
}

export interface CreateTransactionRequest {
  type: TransactionType;
  amount: number;
  category: string;
  note?: string;
  date?: string;
}

export interface UpdateTransactionRequest {
  type?: TransactionType;
  amount?: number;
  category?: string;
  note?: string;
  date?: string;
}

export interface TransactionQueryParams {
  type?: TransactionType;
  category?: string;
  /** `YYYY-MM` */
  month?: string;
}

export interface TransactionSummaryQueryParams {
  /** `YYYY-MM` — defaults to the current month server-side. */
  month?: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  is_pinned?: boolean;
  tag?: string | null;
  remind_at?: string | null;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  is_pinned?: boolean;
  tag?: string | null;
  remind_at?: string | null;
}

export interface NoteQueryParams {
  is_pinned?: boolean;
  search?: string;
}

/* ---------- Response payloads ---------- */

export interface AuthData {
  user: User;
  token: string;
}

export interface UserData {
  user: User;
}

export interface TasksData {
  tasks: Task[];
}

export interface TaskData {
  task: Task;
}

export interface HabitsData {
  habits: Habit[];
}

export interface HabitData {
  habit: Habit;
}

export interface CheckInData {
  habit: Habit;
  log: HabitLog;
}

export interface TransactionsData {
  transactions: Transaction[];
}

export interface TransactionData {
  transaction: Transaction;
}

export interface TransactionSummaryData {
  summary: TransactionSummary;
}

export interface NotesData {
  notes: Note[];
}

export interface NoteData {
  note: Note;
}

export interface DeletedData {
  id: string;
}

export interface HealthData {
  status: string;
}

export interface NotificationsData {
  notifications: AppNotification[];
  unread_count: number;
}

export interface NotificationData {
  notification: AppNotification;
}

export interface NotificationsReadAllData {
  updated: number;
}
