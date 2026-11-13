# C0 — Team chat admin: needed by panel vs `roundsai-backend`

Checked against `src/chat.js`, `src/routes/core.js`, README (M5). **Code wins** where README was thinner.

| Needed by panel | Backend before C0 | C0 action |
|---|---|---|
| Chat enabled toggle | **Exists** — `PUT /admin/settings` `{chat_enabled}` → `admin_chat_switch` | Keep |
| Retention days (global) | **Exists** — `chat_retention_days` (1–3650), default 90 | Keep |
| Retention: patient threads vs other | **Missing** — single global setting only | **Deferred** (Q2) |
| Who changed retention / when | **Partial** — audit `admin_chat_retention` only | **Added** — surface last change on status |
| Purge dry-run / eligible count | **Missing** | **Added** — `GET /admin/chat/purge/preview` |
| Purge run | **Exists** — `POST /admin/chat/purge` (skipped under hold) | Keep; return richer status |
| Last purge (when/by/count) | **Partial** — audit only | **Added** — on status + preview |
| Legal hold (global) | **Exists** — `chat_legal_hold` boolean | Keep |
| Hold reason + history | **Missing** | **Added** — reason required when changing; `chat_hold_history` + `GET /admin/chat/hold/history` |
| Hold per channel/user | **Missing** | **Deferred** (Q3) |
| Limits (body size, rate) | **In code** — `CHAT_MAX_BODY`, `CHAT_RATE_PER_MIN` not in admin JSON | **Added** — `chat_limits` on settings (avoids clash with AI `limits`) |
| Push configured (device counts) | **Partial** — `chat_devices` table, no admin count | **Added** — registered device count (no tokens) |
| Compliance export | **Exists** — `GET /admin/chat/export?team_id=` returns **message bodies** (PHI) | **Changed** — requires `reason`; records metadata history; body still returned for **download only** |
| Export history (no content) | **Missing** | **Added** — `GET /admin/chat/export/history` |
| Chat metrics aggregates | **Missing** | **Added** — `GET /admin/chat/metrics` (counts only) |
| Rate-limit / spam rejection counts | **Missing** — 429s not audited | **Added** — audit `chat_rate_limited` / `chat_duplicate_rejected` |
| Summarize request counts | **Partial** — artifacts `summarize_chat_thread` | **Added** — counted in metrics |
| Compliance / two-person roles | **Missing** — admin only | **Deferred** (Q1) |
| Separate retention for patient channels | **Missing** | **Deferred** (Q2) |

## Conflict note (PHI)

`exportTeamChat` still returns message text in the JSON response so the panel can offer a **file download**. The panel must never render that JSON. History endpoints never include bodies.

## Endpoints added/changed in C0

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/settings` (enriched) | + `chat_limits`, `push.registered_devices`, `retention_last_change`, `legal_hold_last_change`, `last_purge` |
| PUT | `/admin/settings` | `chat_legal_hold` change requires `chat_legal_hold_reason` (or `reason`) |
| GET | `/admin/chat/purge/preview` | **new** — eligible count, hold block; optional `?days=` dry-run |
| POST | `/admin/chat/purge` | richer status (`skipped`, `last_purge`) |
| GET/POST | `/admin/chat/export` | **requires `reason`**; records `chat_export_requests` |
| GET | `/admin/chat/export/history` | **new** — metadata only |
| GET | `/admin/chat/hold/history` | **new** |
| GET | `/admin/chat/metrics?from=&to=` | **new** — daily aggregates |

Audit actions added for metrics: `chat_rate_limited`, `chat_duplicate_rejected`.

`npm test` in `roundsai-backend`: **50 pass**.

## Open questions (still unanswered — C5 documented recommendations only)

1. Who may request **exports** and run **purge** (admin, new `compliance` role, or two-person approval)?  
2. Retention period required by policy, and whether **patient threads** share the same period?  
3. Legal hold scope: **global only** (current), per user, or per channel?  
4. Export **format** and destination policy (storage / encryption)?  
5. Are **per-user** chat activity counts allowed in the panel (privacy/HR)?

C5 ships: role matrix in Settings + README, soft SoD advisory on purge, **no** invented `compliance` role until Q1.
