# Final delivery summary (P0–P5 + Chat M6 C0–C5)

## What changed

### Panel (`roundsai-admin` / `round_ai_admin`)

Rebuilt as **Vite + React + TypeScript** (previous Next.js admin discarded). Implements the internal admin surfaces against `roundsai-backend` APIs:

- Auth: in-memory token, role gate (`admin`), idle logout, typed API client + Zod, error mapping  
- Dashboard, users/teams, settings, audit (+ CSV)  
- Note templates (versioned publish)  
- Reminder rules (draft/approve/retire, AI draft, client test-match)  
- Question bank, curated reads, guideline updates  
- Usage/analytics, ICD status  
- **Chat (M6):** settings + dashboard card, guarded purge, compliance export (download-only), metrics + CSV, audit chat filters, role matrix + soft SoD advisory  
- A11y polish (skip link, focus, Escape/backdrop dialogs, reduced motion), README / governance docs  

### Backend (`roundsai-backend`) additions used by the panel

- Audit filters/pagination/CSV; user last login/activity  
- `/admin/health`; analytics activity + questions; gated individual learner setting  
- Content history helper; ICD links on `/admin/icd`  
- **`GET /admin/mcqs/:id`** for admin question detail  
- **Chat admin:** enriched settings (`chat_limits`, push device counts, last change metadata), purge preview (`?days=`), hold reason/history, export reason/history, metrics aggregates, `chat_summarize_requested` audit  

## What is mocked

- MSW handlers under `src/mocks/` when `VITE_USE_MSW=true` (login, health, settings, core admin lists, templates, rules, MCQs, curated, guidelines, analytics, ICD, audit CSV, **chat purge/export/hold/metrics**).  
- Sufficient for UI development without a live API; not a full fidelity substitute for `npm test` on the backend.

## Intentionally incomplete / deferred

| Item | Notes |
|---|---|
| `reviewer` role + SoD | Not implemented — awaiting confirm |
| `compliance` / two-person for purge+export | Documented + soft advisory only — **Q1** |
| Hard SoD (retention actor ≠ purge actor) | UI advisory only until backend enforces |
| Per-channel / per-user legal hold | Global only — **Q3** |
| Patient-specific retention | Same global days — **Q2** |
| Extra export formats / destinations | JSON download only — **Q4** |
| Per-user chat metrics | Deferred — **Q5** |
| MCQ text edit + versioning | No backend support; UI actions are status-only |
| Curated/guideline update/retire | Create + approve only on API |
| Check-rule clinical notes field | Not in schema; tip to put citation in name |
| ICD file upload | CLI import only |
| Individual learner analytics | Setting exists; defaults OFF |

## Verify

```bash
# backend
CORS_ORIGIN=http://localhost:5173 npm start
npm test

# panel
npm run dev
npm test
npm run build
```

Demo admin: `admin@rounds.test` / `ChangeMe-12345`

## Docs

- [`CHAT-GOVERNANCE.md`](./CHAT-GOVERNANCE.md) — roles, export handling, PHI  
- [`C0-chat-gap-analysis.md`](./C0-chat-gap-analysis.md) — endpoint gap table  
- [`A0-gap-analysis.md`](./A0-gap-analysis.md) — earlier admin gaps  
