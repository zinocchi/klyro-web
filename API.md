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

Send `Authorization: Bearer <token>` on every protected route. Token TTL 7 days.

| Method | Path | Auth | Body / Query |
|---|---|---|---|
| GET | `/health` | – | – |
| POST | `/auth/register` | – | `{ email, password }` (password ≥ 8) |
| POST | `/auth/login` | – | `{ email, password }` |
| GET | `/auth/me` | Bearer | – |
| GET | `/tasks` | Bearer | `?status=&priority=&due_date=YYYY-MM-DD` |
| POST | `/tasks` | Bearer | `{ title, description?, due_date?, status?, priority? }` |
| PATCH | `/tasks/:id` | Bearer | any of `title, description, due_date, status, priority` |
| DELETE | `/tasks/:id` | Bearer | – |
| GET | `/habits` | Bearer | `?date=YYYY-MM-DD` (default: today UTC) |
| POST | `/habits` | Bearer | `{ title, target_days }` |
| PATCH | `/habits/:id` | Bearer | `{ title?, target_days? }` |
| DELETE | `/habits/:id` | Bearer | – |
| POST | `/habits/:id/check-in` | Bearer | `{ date: YYYY-MM-DD }` |

Enums: `status` `PENDING|IN_PROGRESS|COMPLETED` · `priority` `LOW|MEDIUM|HIGH` · `target_days` `MON|TUE|WED|THU|FRI|SAT|SUN` (min 1, unique).

## Responses

`POST /auth/register` → `201`
```json
{ "success": true, "message": "User registered successfully",
  "data": { "user": { "id": "uuid", "email": "a@b.c", "created_at": "2026-11-16T04:21:38.086Z" },
            "token": "eyJhbGciOi..." } }
```

`GET /auth/me` → `200` → `data.user` = `{ id, email, created_at }`.

`GET /tasks` → `200` → `data.tasks[]` = `{ id, user_id, title, description, due_date, status, priority, created_at }`, ordered `due_date` asc (null last), then `created_at` desc.

`POST /tasks` → `201` → `data.task`.

`PATCH /tasks/:id` → `200` → `data.task`. `DELETE /tasks/:id` → `200` → `data: { id }`.

`GET /habits` → `200`
```json
{ "success": true, "message": "Habits retrieved successfully",
  "data": { "habits": [{ "id": "uuid", "title": "Morning run", "target_days": ["MON"], "streak_count": 3, "created_at": "...", "completed": false }] } }
```
`completed` reflects the requested `date` only.

`POST /habits` → `201` → `data.habit` (`streak_count: 0`).

`POST /habits/:id/check-in` → `200`
```json
{ "success": true, "message": "Habit check-in toggled successfully",
  "data": { "habit": { "...": "...", "streak_count": 1 },
            "log": { "id": "uuid", "habit_id": "uuid", "date": "2026-11-16T00:00:00.000Z", "completed": true } } }
```
Toggles: missing → `true`, `true` → `false`, `false` → `true`. `streak_count` is recalculated from consecutive completed days up to the check-in date.

## Errors

| Status | Meaning |
|---|---|
| 400 | Validation failed (`errors[]` present) or malformed JSON |
| 401 | Missing/expired/invalid token, or bad login |
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