# Frontend Architecture & Coding Rules (`klyro-web`)

## 1. Tech Stack & Libraries
- **Framework:** React 19 + TypeScript + Vite.
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss";` + `@theme` tokens from `DESIGN.md` in `src/index.css`), `lucide-react` icons, `clsx` + `tailwind-merge` (`cn()`).
- **Routing:** `react-router-dom` v7.
- **Client State:** `zustand` (persisted `token` & `user` including `name`).
- **Server State & HTTP:** `@tanstack/react-query` + `axios`.
- **Forms & Validation:** `react-hook-form` + `zod` + `@hookform/resolvers`.
- **Utilities:** `sonner` (toast notifications) + `date-fns`.

## 2. API & Design Grounding
- Strictly match every endpoint, request payload, query parameter, and JSON response wrapper (`data.user`, `data.tasks`, `data.habits`, `data.transactions`, `data.summary`, `data.notes`) defined in `API.md`.
- Strictly follow colors, Poppins typography, border radii (`160px` pill buttons, `24px` cards, `6px` inputs/badges), shadows, and surface rules in `DESIGN.md`.

## 3. Feature-Based Folder Structure
```text
src/
├── components/
│   ├── layout/         # AppLayout (responsive sidebar + mobile drawer), ProtectedRoute, PublicRoute
│   └── ui/             # Button, Input, Select, Card, Badge, Modal, Spinner, EmptyState
├── features/
│   ├── auth/           # api/, schemas/, pages/ (LoginPage, RegisterPage with name)
│   ├── dashboard/      # pages/DashboardPage.tsx (Daily Life OS Command Center)
│   ├── tasks/          # api/, hooks/, schemas/, components/, pages/TasksPage.tsx
│   ├── habits/         # api/, hooks/, schemas/, components/, pages/HabitsPage.tsx
│   ├── money/          # api/, hooks/, schemas/, components/, pages/MoneyPage.tsx
│   └── notes/          # api/, hooks/, schemas/, components/, pages/NotesPage.tsx
├── lib/
│   ├── axios.ts        # Configured Axios instance with Bearer token & 401 interceptors
│   ├── queryClient.ts  # TanStack QueryClient config
│   └── utils.ts        # cn(), formatIDR() for Rupiah currency, date formatters
├── stores/
│   └── authStore.ts    # Zustand persisted store (token, user: { id, name, email, created_at })
├── types/
│   └── api.types.ts    # Strict TypeScript interfaces matching API.md
├── App.tsx
└── main.tsx