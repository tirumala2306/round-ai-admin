# RoundsAI Admin Panel

Internal web panel for hospital administrators (and, if approved later, physician reviewers).  
**Separate from the Flutter mobile app.** Never displays patient clinical content / PHI (compliance chat export is download-only — never rendered).

## Stack

| Dependency | Why |
|---|---|
| React + TypeScript + Vite | SPA build, fast HMR, typed UI |
| React Router | Client routes + auth guards |
| TanStack Query | Server state / caching for admin APIs |
| Zod | Validate API responses before use |
| Tailwind CSS v4 | Layout / theming (light+dark via `prefers-color-scheme`) |
| Vitest + Testing Library | Unit/component tests |
| MSW | Optional mock API (`VITE_USE_MSW=true`) without backend |
| lucide-react / cva / clsx | Icons + class helpers |

No new chat-phase npm dependencies.

## Setup

```bash
cp .env.example .env
npm install
npm run dev          # http://localhost:5173
npm test
npm run build
```

### Env

- `VITE_API_BASE_URL` — backend origin, no trailing slash (e.g. `http://localhost:8080`)
- `VITE_USE_MSW=true` — run against MSW handlers instead of a live backend

### Backend CORS

In `roundsai-backend` `.env`:

```env
CORS_ORIGIN=http://localhost:5173
```

Production: HTTPS origins; prefer same parent domain.

## Security

- Sign-in via `POST /auth/login`. Only `admin` (and future `reviewer` if added) may enter.
- Access token **in memory only** (no `localStorage` / `sessionStorage`).
- Token TTL follows backend (`expires_in`, default 8h). Idle timeout **15 minutes** signs out and **aborts in-flight chat exports**.
- `401` → sign-in. `403` → “Not allowed for your role”.
- Destructive / impactful actions use type-to-confirm (AI kill switch, chat toggle, retention, hold, purge, export, deactivate, publish, retire).
- Approvals require an explicit responsibility checkbox.
- Content rendered as **text** only (no untrusted HTML).
- No response logging; no third-party analytics in the bundle.
- Chat export: opaque file download, immediate blob URL revoke, `cache: 'no-store'`.

## Role matrix (current)

| Capability | admin | resident/attending | reviewer (TBD) | compliance (TBD) |
|---|---|---|---|---|
| Use this panel | yes | no | TBD | — |
| Users / teams / AI kill switch / settings | yes | no | no (planned) | — |
| Templates, rules, questions, curated, guidelines | yes | no | yes (planned) | — |
| Audit / usage / ICD | yes | no | TBD | — |
| Toggle chat / retention / legal hold | yes | no | no | TBD (Q1) |
| Run chat purge | yes | no | no | **Recommend** yes / 2-person (Q1) |
| Request chat export (PHI file) | yes | no | no | **Recommend** yes / 2-person (Q1) |
| Chat metrics (aggregates) | yes | no | TBD | TBD |

Backend enforces `admin` on chat admin APIs. Soft SoD advisory when the same user who last changed retention opens purge — **not** hard-blocked until Q1. Details: [`docs/CHAT-GOVERNANCE.md`](docs/CHAT-GOVERNANCE.md).

## Screens

1. Sign-in  
2. Dashboard — AI kill switch, usage, needs-action, health, **chat status card**  
3. Users & teams (audit/chat actor links via `?highlight=`)  
4. Note templates (+ publish new version)  
5. Reminder rules (+ AI draft, test match, approve/retire)  
6. Question bank (+ reports)  
7. Curated reads (high-yield)  
8. Guideline updates  
9. Usage & analytics  
10. **Chat metrics** (`/settings/chat-metrics`) — aggregates + CSV  
11. ICD status (import CLI docs)  
12. Settings — AI, intervals, learner analytics, **Chat** (toggle / retention / hold), **role matrix**  
13. **Chat purge** (`/settings/chat-purge`) — guarded  
14. **Chat export** (`/settings/chat-export`) — download-only + history  
15. Audit log (+ CSV + chat action filters)

## Chat governance (summary)

- No message content, patient channel titles, or conversations in the UI.  
- Export = file download only; history shows who/when/scope/reason/counts.  
- Purge blocked in UI under legal hold; type exact eligible count + destroy checkbox.  
- Metrics: daily counts only; per-user deferred (Q5).  

Full write-up: [`docs/CHAT-GOVERNANCE.md`](docs/CHAT-GOVERNANCE.md). Gap table: [`docs/C0-chat-gap-analysis.md`](docs/C0-chat-gap-analysis.md).

## Accessibility

- Skip link to main content  
- Keyboard-focusable controls with visible `:focus-visible` rings  
- Form labels on inputs; dialogs use `role="dialog"` / `aria-modal` / `aria-describedby`  
- Confirm dialogs: Escape to close, backdrop click, restore focus  
- Status badges + text (not color alone); `role="alert"` / `role="status"` where appropriate  
- `prefers-reduced-motion` respected  
- Laptop/tablet responsive layout with horizontal nav on small screens  

## Deployment notes

- Static host of `dist/` behind **HTTPS**  
- Strict **CSP**: no inline scripts, no third-party analytics  
- Set `VITE_API_BASE_URL` at build time; never embed secrets  
- Backend `CORS_ORIGIN` must match the panel origin  
- Recommend headers: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Cache-Control` for HTML as appropriate  
- Treat downloaded chat exports as PHI under org policy (encryption / storage — Q4)

## Phase status

- **P0–P5 complete** (core admin panel).  
- **Chat M6 C0–C5 complete** (gap analysis + backend admin gaps, settings/dashboard, purge, export, metrics/audit, roles/docs).  
- See `docs/A0-gap-analysis.md`, `docs/DELIVERY.md`, `docs/CHAT-GOVERNANCE.md`.

## Open product questions (still for the client)

1. Introduce `reviewer` role + approver ≠ creator?  
2. Who may see individual learner analytics?  
3. Activity UI: counts only vs timeline (never clinical text)?  
4. Admin/approver onboarding (passwords vs SSO later)?  
5. Production domains for panel + API?  
6. **Chat:** who may export/purge (admin vs `compliance` vs two-person)?  
7. **Chat:** retention policy + patient threads same period?  
8. **Chat:** legal hold scope beyond global?  
9. **Chat:** export format / destination / encryption?  
10. **Chat:** per-user activity counts allowed (privacy/HR)?
