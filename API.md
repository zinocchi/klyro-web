# Klyro API — Frontend Contract

Base URL: `http://localhost:3000/api/v1` (dev)

## Envelope

Every response is JSON with the same shape.

Success:
```json
{ "success": true, "message": "Tasks retrieved successfully", "data": { "tasks": [] } }
```
Error:
```json
{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "Invalid email address" }] }
```
`errors` only appears on `400` validation failures. Always check `success`, not just the HTTP status.

## Auth

Send `Authorization: Bearer *** on every protected route. Token TTL 7 days.

| Method | Path | Auth | Body / Query |
|---|---|---|---|
| GET | `/health` | – | – |
| POST | `/auth/register` | – | `{ name, email, password }` (name ≥ 2, password ≥ 8) |
| POST | `/auth/login` | – | `{ email, password }` |
| GET | `/auth/me` | Bearer | – |
| PATCH | `/auth/me` | Bearer | `{ name?, monthly_budget?, language?, daily_reminder_time? }` |
| PATCH | `/auth/password` | Bearer | `{ current_password, new_password }` (new_password ≥ 8) |
| GET | `/tasks` | Bearer | `?status=&priority=&due_date=YYYY-MM-DD&search=` |
| POST | `/tasks` | Bearer | `{ title, description?, due_date?, status?, priority?, subtasks?, reminder_at? }` |
| PATCH | `/tasks/:id` | Bearer | any of `title, description, due_date, status, priority, subtasks, reminder_at` |
| DELETE | `/tasks/:id` | Bearer | – |
| GET | `/habits` | Bearer | `?date=YYYY-MM-DD` (default: today UTC) |
| POST | `/habits` | Bearer | `{ title, target_days, reminder_time? }` |
| PATCH | `/habits/:id` | Bearer | `{ title?, target_days?, reminder_time? }` |
| DELETE | `/habits/:id` | Bearer | – |
| POST | `/habits/:id/check-in` | Bearer | `{ date: YYYY-MM-DD }` |
| GET | `/transactions` | Bearer | `?type=&category=&month=YYYY-MM` |
| GET | `/transactions/summary` | Bearer | `?month=YYYY-MM` (default: current month) |
| POST | `/transactions` | Bearer | `{ type, amount, category, note?, date? }` |
| PATCH | `/transactions/:id` | Bearer | any of `type, amount, category, note, date` |
| DELETE | `/transactions/:id` | Bearer | – |
| GET | `/notes` | Bearer | `?is_pinned=true\|false&search=` |
| POST | `/notes` | Bearer | `{ title, content, is_pinned?, tag?, remind_at? }` |
| PATCH | `/notes/:id` | Bearer | any of `title, content, is_pinned, tag, remind_at` |
| DELETE | `/notes/:id` | Bearer | – |
| GET | `/notifications` | Bearer | – |
| PATCH | `/notifications/:id/read` | Bearer | – |
| PATCH | `/notifications/read-all` | Bearer | – |

Enums: `status` `PENDING|IN_PROGRESS|COMPLETED` · `priority` `LOW|MEDIUM|HIGH` · `target_days` `MON|TUE|WED|THU|FRI|SAT|SUN` (min 1, unique) · `type` (transaction) `INCOME|EXPENSE` · `language` `id|en` · notification `type` `BUDGET_ALERT|TASK_REMINDER|HABIT_REMINDER|NOTE_REMINDER|DAILY_FINANCE`.

## Field formats

- `reminder_time` / `daily_reminder_time`: `"HH:mm"` 24-hour (e.g. `"07:30"`), or `null`.
- `reminder_at` / `remind_at`: ISO-8601 datetime string (e.g. `"2026-11-25T09:00:00.000Z"`), or `null`.
- `subtasks`: array of `{ id: string, title: string, completed: boolean }` (max 100).
- `monthly_budget`: integer rupiah ≥ 0, or `null`.
- `tag`: string ≤ 50 chars, or `null`.

## Time zone rules

- "Today" for validation is **WIB** (`Asia/Jakarta`, UTC+7).
- `POST /transactions` and `POST /habits/:id/check-in` reject a `date` **greater than today WIB** with `400` and message `"Cannot log future dates"`.

## Responses

`POST /auth/register` → `201`
```json
{ "success": true, "message": "User registered successfully",
  "data": { "user": { "id": "uuid", "email": "a@b.c", "name": "Fikri",
            "monthly_budget": null, "language": "id", "daily_reminder_time": null,
            "created_at": "2026-11-16T04:21:38.086Z" },
            "token": "eyJhbGciOi..." } }
```

`POST /auth/login` → `200` → `data.user` + `data.token` (same `user` shape as above).

`GET /auth/me` → `200` → `data.user` = `{ id, email, name, monthly_budget, language, daily_reminder_time, created_at }`.

`PATCH /auth/me` → `200` → `data.user` (updated profile). At least one field required; unreferenced fields unchanged.

`PATCH /auth/password` → `200` → `data: {}`. Wrong `current_password` → `401` with message `"Current password is incorrect"`.

`GET /tasks` → `200` → `data.tasks[]` = `{ id, user_id, title, description, due_date, status, priority, subtasks, reminder_at, created_at }`, ordered `due_date` asc (null last), then `created_at` desc. `search` matches `title` or `description`, case-insensitive.

`POST /tasks` → `201` → `data.task` (`subtasks` defaults to `[]`, `reminder_at` defaults to `null`).

`PATCH /tasks/:id` → `200` → `data.task`. `DELETE /tasks/:id` → `200` → `data: { id }`.

`GET /habits` → `200`
```json
{ "success": true, "message": "Habits retrieved successfully",
  "data": { "habits": [{ "id": "uuid", "title": "Morning run", "target_days": ["MON"],
            "streak_count": 3, "best_streak": 5, "reminder_time": "06:00",
            "created_at": "...", "completed": false,
            "recent_logs": ["2026-11-10", "2026-11-12", "2026-11-16"] }] } }
```
`completed` reflects the requested `date` only. `recent_logs` = `YYYY-MM-DD` of completed logs within the last 30 days (WIB), ascending.

`POST /habits` → `201` → `data.habit` (`streak_count: 0`, `best_streak: 0`, `reminder_time` null unless sent).

`POST /habits/:id/check-in` → `200`
```json
{ "success": true, "message": "Habit check-in toggled successfully",
  "data": { "habit": { "...": "...", "streak_count": 1, "best_streak": 1 },
            "log": { "id": "uuid", "habit_id": "uuid", "date": "2026-11-16T00:00:00.000Z", "completed": true } } }
```
Toggles: missing → `true`, `true` → `false`, `false` → `true`. `streak_count` is recalculated from consecutive completed days up to the check-in date; `best_streak = max(best_streak, streak_count)`. Future date → `400 Cannot log future dates`.

`GET /transactions` → `200` → `data.transactions[]` = `{ id, user_id, type, amount, category, note, date, created_at }`, ordered `date` desc then `created_at` desc. `amount` is integer rupiah (no decimals); `date` is `YYYY-MM-DD` midnight UTC. `month` (`YYYY-MM`) filters a whole calendar month.

`GET /transactions/summary` → `200`
```json
{ "success": true, "message": "Transaction summary retrieved successfully",
  "data": { "summary": { "month": "2026-11", "total_income": 8000000, "total_expense": 155000, "balance": 7845000 } } }
```
`month` omitted → current month. Empty month → all zeros.

`POST /transactions` → `201` → `data.transaction`. `date` omitted → today (UTC). `amount` must be a positive integer ≤ 1e12. Future `date` → `400 Cannot log future dates`. When `type: EXPENSE` and the user has `monthly_budget > 0`, a `BUDGET_ALERT` notification is created automatically once spending for that month crosses 80% and once for 100% (deduplicated per month + threshold).

Example:
```json
{ "success": true, "message": "Transaction created successfully",
  "data": { "transaction": { "id": "uuid", "user_id": "uuid", "type": "EXPENSE",
            "amount": 35000, "category": "Makan", "note": "Bakso",
            "date": "2026-11-10T00:00:00.000Z", "created_at": "..." } } }
```

`PATCH /transactions/:id` → `200` → `data.transaction`. `DELETE /transactions/:id` → `200` → `data: { id }`.

`GET /notes` → `200` → `data.notes[]` = `{ id, user_id, title, content, is_pinned, tag, remind_at, created_at, updated_at }`, pinned first then `updated_at` desc. `search` matches `title` or `content`, case-insensitive.

`POST /notes` → `201` → `data.note` (`content` min 1 char, `is_pinned` defaults to `false`, `tag`/`remind_at` default to `null`). `PATCH /notes/:id` → `200` → `data.note` (`updated_at` bumped). `DELETE /notes/:id` → `200` → `data: { id }`.

`GET /notifications` → `200`
```json
{ "success": true, "message": "Notifications retrieved successfully",
  "data": { "notifications": [{ "id": "uuid", "user_id": "uuid", "type": "BUDGET_ALERT",
            "title": "Budget warning", "message": "Your expenses for 2026-11 have reached 85% ...",
            "is_read": false, "created_at": "..." }],
            "unread_count": 1 } }
```
Ordered `created_at` desc, limit 50.

`PATCH /notifications/:id/read` → `200` → `data.notification` (`is_read: true`). Not found / other user → `404`.

`PATCH /notifications/read-all` → `200` → `data: { updated: 3 }` (count of rows flipped).

## Errors

| Status | Meaning |
|---|---|
| 400 | Validation failed (`errors[]` present), malformed JSON, or `Cannot log future dates` |
| 401 | Missing/expired/invalid token, bad login, or wrong `current_password` |
| 403 | Origin blocked by CORS |
| 404 | Resource not found **or belongs to another user** |
| 409 | Email already registered |
| 429 | Rate limit hit (auth endpoints: 30 / 15 min / IP) |
| 500 | Unexpected server error |
| 503 | Health check: database down |

## CORS

Allowed browser origins come from `CORS_ORIGIN` (comma-separated). Dev default: `http://localhost:5173`, `http://localhost:3000`, `http://localhost:8080`. Requests without an `Origin` header (curl, mobile) are always allowed.

## Quick check

```bash
curl -s http://localhost:3000/api/v1/health
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"Password123"}'
```
