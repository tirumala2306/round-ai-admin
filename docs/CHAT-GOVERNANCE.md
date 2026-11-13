# Chat governance (admin panel)

## PHI rule

The panel **never renders** message text, patient-thread channel titles, or participant conversations.  
Compliance **export** is the only exception: a **file download** only (never previewed/parsed into UI state). Blob URLs are revoked immediately; idle logout aborts in-flight downloads.

## Role matrix (enforced today)

Backend chat admin routes require **`role=admin`**. The panel only admits `admin` (and planned `reviewer` for other content — not chat). There is **no** `compliance` role yet.

| Action | admin | compliance / 2-person (recommended) |
|---|---|---|
| Toggle chat | yes | TBD (Q1) |
| Change retention | yes | TBD — should not also run purge |
| Set / clear legal hold | yes | TBD |
| Run purge | yes | **Recommend** compliance or second approver |
| Request export | yes | **Recommend** compliance or second approver |
| View metrics / audit filters | yes | TBD |

UI shows soft SoD advisories where useful; **backend must enforce** any hard SoD after Q1.

## Screens

| Path | Purpose |
|---|---|
| `/settings#chat` | Toggle, retention, hold + history, limits, push counts |
| `/settings/chat-purge` | Guarded purge (count confirm + destroy ack) |
| `/settings/chat-export` | Export request + history; download-only |
| `/settings/chat-metrics` | Daily aggregates + CSV |
| `/audit` | Chat action filter presets |

## Export handling

1. Required **reason**; scope = team (backend today); format = JSON.  
2. Persistent warning: *Contains PHI. Handle under your organization's policy.*  
3. `POST /admin/chat/export` → opaque blob → save file → `URL.revokeObjectURL`.  
4. Do not open/parse content in the browser; refresh **export history** for metadata.  
5. `Cache-Control: no-store` (backend + fetch `cache: 'no-store'`).  
6. Logout / idle timeout aborts pending exports.

## Open policy questions

1. Who may export / purge (admin vs `compliance` vs two-person)?  
2. Retention period; same for patient threads?  
3. Hold scope beyond global?  
4. Export formats / destination / encryption?  
5. Per-user chat activity counts allowed?

See also `docs/C0-chat-gap-analysis.md`.
