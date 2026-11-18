// Shapes mirroring API.md (klyro-backend v1) — Klyro Personal Life OS.

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TargetDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
export type TransactionType = 'INCOME' | 'EXPENSE';

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
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
}

export interface Habit {
  id: string;
  title: string;
  target_days: TargetDay[];
  streak_count: number;
  created_at: string;
  completed: boolean;
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
  created_at: string;
  updated_at: string;
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

export interface CreateTaskRequest {
  title: string;
  description?: string;
  due_date?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  due_date?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface TaskQueryParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
}

export interface CreateHabitRequest {
  title: string;
  target_days: TargetDay[];
}

export interface UpdateHabitRequest {
  title?: string;
  target_days?: TargetDay[];
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
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  is_pinned?: boolean;
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
