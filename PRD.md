
```markdown
# Product Requirements Document (PRD) — Klyro Web Frontend

## 1. Overview

`klyro-web` is the desktop-first responsive web dashboard for the **Klyro Task & Habit Tracker**. It connects to `klyro-backend` (`API.md`) and focuses on structured planning, filtering, and daily execution.

## 2. Pages & User Flows

### A. Authentication (`/login`, `/register`)

- Clean centered auth cards with email & password validation via `react-hook-form` + `zod`.
- On success: save `token` and `user` to `useAuthStore`, show welcome toast, redirect to `/dashboard`.
- Public routes redirect authenticated users to `/dashboard`; protected routes redirect unauthenticated users to `/login`.

### B. Unified Daily Dashboard (`/dashboard` — Default Route)

- **Header:** Greeting with user email, today's formatted date, and quick-action buttons (`+ New Task`, `+ New Habit`).
- **Summary Cards:** Total tasks pending, completed tasks count, active habits count, and highest current habit streak.
- **Two-Column Workspace:**
  - **Left Column (Today's Habits):** Interactive list of user's habits for today (`YYYY-MM-DD`) with one-click check-in toggle and live streak flame badge.
  - **Right Column (Priority & Upcoming Tasks):** Focus list of `PENDING` and `IN_PROGRESS` tasks with quick status switcher and priority badges.

### C. Tasks Workspace (`/tasks`)

- **View Switcher:** Toggle between **List View** and **Kanban Board View** (`PENDING` | `IN_PROGRESS` | `COMPLETED`).
- **Filters:** Filter by `status`, `priority` (`LOW`, `MEDIUM`, `HIGH`), and `due_date`.
- **CRUD Operations:**
  - Create & Edit Task via a clean modal (`title`, `description`, `due_date`, `status`, `priority`).
  - Inline status change (dropdown or board column move) and delete with confirmation.

### D. Habits Tracker (`/habits`)

- **Date Navigator:** Ability to browse dates (Previous Day, Today, Next Day — formatted as `YYYY-MM-DD`) to view and check in habits for specific dates (`GET /habits?date=YYYY-MM-DD`).
- **Habit Cards:** Display habit `title`, scheduled `target_days` pills (`MON`–`SUN`), current `streak_count`, and a prominent interactive check-in button (`POST /habits/:id/check-in`).
- **CRUD Operations:** Create & Edit Habit modal (title + interactive multi-select day pills `MON` to `SUN`), plus delete habit.

## 3. Implementation Milestones

Execute strictly one phase at a time. Run `npm run build` (which runs `tsc -b && vite build`) at the end of each phase to ensure zero TypeScript or build errors:

- **Phase 1 (Core Infrastructure & Layout):** `types/api.types.ts`, `lib/utils.ts`, `lib/axios.ts`, `lib/queryClient.ts`, `stores/authStore.ts`, `components/ui/*`, `components/layout/*`, and routing skeleton in `App.tsx`.
- **Phase 2 (Authentication Flow):** `features/auth/*` (API, Zod schemas, Login & Register pages) + verify auth guard routing.
- **Phase 3 (Tasks Feature):** `features/tasks/*` (API, hooks, schemas, filters, List & Kanban Board views, Create/Edit modal).
- **Phase 4 (Habits & Unified Dashboard):** `features/habits/*` (API, hooks, date navigator, check-in toggle, Create/Edit modal) + `features/dashboard/pages/DashboardPage.tsx`.
```
