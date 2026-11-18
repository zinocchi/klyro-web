---

#### 2. `klyro-web/PRD.md`
```markdown
# Product Requirements Document (PRD) — Klyro Personal Life OS (Web)

## 1. Overview
`klyro-web` is a responsive, mobile-friendly Personal Life OS web application connecting to `klyro-backend` (`API.md`). It unifies daily execution across **Tasks**, **Habits**, **Money Management**, and **Quick Notes**.

## 2. Pages & Core Features

### A. Authentication (`/login`, `/register`)
- **Register:** Collects `name` (min 2 chars), `email`, and `password` (min 8 chars).
- **Login:** Authenticates user, persists `token` and `user` (with `name`) in Zustand, and redirects to `/dashboard`.

### B. Unified Daily Dashboard (`/dashboard` — Default Route)
- **Personal Header:** Greets user by `user.name` (e.g., `"Halo, {user.name}"`), displays today's date, and provides responsive quick-action pill buttons (`+ Task`, `+ Habit`, `+ Transaksi`, `+ Note`).
- **4 Pastel Summary Cards (`DESIGN.md` style):**
  1. Pending Tasks count (`--color-sky` `#abf0ff` surface)
  2. Today's Habits completed ratio (`--color-mint` `#bcfe90` surface)
  3. Current Month Balance in IDR (`--color-lavender` `#eddff7` surface)
  4. Pinned Notes count (`--color-aqua` `#d1faff` surface)
- **Daily Focus Grid (Responsive 2-Column on Desktop, Stacked on Mobile):**
  - Today's Habits quick check-in list + active streak badge.
  - Priority / Pending Tasks list with quick status toggle.
  - Recent Transactions preview + Pinned Notes preview.

### C. Tasks Workspace (`/tasks`)
- **View Toggle:** List View & Kanban Board View (`PENDING`, `IN_PROGRESS`, `COMPLETED`).
- **Filters:** Filter by `status`, `priority` (`LOW`, `MEDIUM`, `HIGH`), and `due_date` (`YYYY-MM-DD`).
- **CRUD:** Create/Edit modal, quick status change, and delete.

### D. Habits Tracker (`/habits`)
- **Date Navigator:** Browse dates (`YYYY-MM-DD`) with quick reset to Today.
- **Habit Cards:** Title, `MON`–`SUN` target day pills, `streak_count`, and interactive check-in toggle button (`POST /habits/:id/check-in`).
- **CRUD:** Create/Edit habit modal with multi-select day pills (`MON`–`SUN`), and delete.

### E. Money Management (`/money`)
- **Month Selector:** Filter transactions and summary by month (`YYYY-MM`, defaults to current month).
- **Summary Cards:** Total Income (`INCOME`), Total Expense (`EXPENSE`), and Net Balance (`balance`) formatted in Rupiah (`Rp`).
- **Filters & List:** Filter by `type` (`INCOME` / `EXPENSE`) and `category`. Clean responsive transaction rows showing category badge, note, date, and color-coded Rupiah amount.
- **CRUD:** Create/Edit transaction modal (`type`, `amount` integer Rupiah, `category` presets + custom input, `note`, `date`).

### F. Quick Notes (`/notes`)
- **Search & Filter:** Real-time/debounced search bar (`?search=`) and toggle filter for Pinned notes (`?is_pinned=true`).
- **Notes Grid:** Responsive card grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) displaying pinned notes first, with one-click Pin/Unpin toggle, Edit modal, and Delete button.

## 3. Implementation Milestones
Execute strictly one phase at a time and verify each phase with `npm run build`:
- **Phase 1 (Foundation & Responsive Shell):** `DESIGN.md` tokens in `index.html` & `src/index.css`, `types/api.types.ts`, `lib/*` (including `formatIDR`), `stores/authStore.ts`, `components/ui/*`, and responsive `AppLayout` (desktop sidebar + mobile drawer).
- **Phase 2 (Auth Flow):** `features/auth/*` (`LoginPage`, `RegisterPage` with `name`) + route guards.
- **Phase 3 (Tasks & Habits):** `features/tasks/*` and `features/habits/*` (fully responsive).
- **Phase 4 (Money & Notes):** `features/money/*` and `features/notes/*` (fully responsive).
- **Phase 5 (Unified Dashboard & Polish):** `features/dashboard/pages/DashboardPage.tsx` integrating all 4 modules + final responsive layout audit.