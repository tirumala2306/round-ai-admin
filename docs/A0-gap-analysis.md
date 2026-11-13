# A0 — Panel needs vs `roundsai-backend` (P0)

Source: `roundsai-backend` `src/routes/*.js` + README. Checked 2026-11-13.

| Needed by panel | Backend status | Notes |
|---|---|---|
| `POST /auth/login` | **Exists** | Token TTL default 8h (`TOKEN_TTL_SECONDS`) |
| Panel roles admin (+ optional reviewer) | **Partial** | Roles: `admin`, `attending`, `resident`. `reviewer` **not added** (awaiting confirm) |
| Approver ≠ creator rule | **Missing** | Configurable SoD — **awaiting confirm** |
| `GET /admin/users` + last login / activity | **Added (P0)** | `last_login_at` + `last_activity_at` (from audit) |
| Create user / edit role / deactivate / reset password | **Exists** | `POST /admin/users`, `PATCH` (`active`, `password` ≥10) |
| Teams CRUD + members | **Exists** | create team, add/remove members |
| Audit filters + pagination | **Added (P0)** | `actor_id`, `action`, `patient_id`, `from`, `to`, `limit`, `offset` → `{rows,total,…}` |
| Audit CSV export | **Added (P0)** | `GET /admin/audit.csv` |
| Settings (AI switch, review intervals) | **Exists** | + `show_individual_learner_analytics` default **false** (P0) |
| Templates list + publish version | **Exists** | `GET/PUT /admin/templates/:key` — never in-place edit |
| Usage AI calls/tokens | **Exists** | `GET /admin/usage?since=` |
| Activity analytics by action | **Added (P0)** | `GET /admin/analytics/activity` |
| Question analytics by topic | **Added (P0)** | `GET /admin/analytics/questions` |
| Individual learner analytics | **Gated (P0)** | Only when setting on; confirm policy with owner |
| Content version history (who/when) | **Added (P0)** | `GET /admin/content/:type/:id/history` from audit |
| Template version list | **Exists** | `listTemplates()` returns all versions |
| Check-rules CRUD / draft AI / approve / retire | **Exists** | Draft-only until approve |
| Check-rules test-match endpoint | **Missing** | Panel can client-match in P3 if still absent |
| MCQ review queue + reports + status patch | **Exists** | Edit vignette text with versioning **not** supported |
| MCQ admin detail (full content) | **Added (P4)** | `GET /admin/mcqs/:id` |
| Curated reads CRUD + approve | **Partial** | Create + approve; no update/retire endpoints yet |
| Guideline updates CRUD + approve | **Partial** | Create + approve; URL not strictly required in API; no retire |
| ICD status + import docs | **Exists** | Links + `npm run import-icd` documented (P0) |
| `GET /admin/health` | **Added (P0)** | provider, model, prompt version, db_ok, ICD |
| CORS for panel origin | **Exists** | `CORS_ORIGIN` in `.env` / config |
| Chat retention / legal hold | **N/A** | Placeholder until M5 |

## Deliberately not implemented in P0 (need your answer)

1. Separate `reviewer` role + “approver ≠ creator”.
2. Whether individual learner performance views are allowed (and for whom). Setting exists but defaults OFF.
