# FlowBoard

Production-grade task management API. Monorepo: `api/` (Express + Prisma) and `worker/` (BullMQ processors).

## Agent files
| File | Contains |
|---|---|
| `.claude/agents/rules.md` | Hard rules — read before writing any code |
| `.claude/agents/conventions.md` | Naming, scaffolds, API patterns, error handling, Docker |
| `.claude/agents/decisions.md` | Open TBD questions — check before starting work in that area |

---

## Task routing

| Task | Where to look first |
|---|---|
| New API route | `conventions.md` → Monorepo Structure, API Conventions, Error Handling |
| New DB model | `conventions.md` → Prisma Conventions |
| New background job | `conventions.md` → Monorepo Structure (worker section) |
| Error handling | `conventions.md` → Error Handling Conventions + `rules.md` |
| Security concern | `rules.md` → Security section + `conventions.md` → Security Baseline |
| TypeScript issue | `rules.md` → TypeScript section |
| Docker / infra change | `conventions.md` → Docker Workflow |
| Anything TBD | `decisions.md` — do not guess, surface the question |

---

## Before writing code

1. Read `rules.md` — especially if touching auth, DB, or error paths.
2. Check `decisions.md` — if the work touches a TBD area, stop and surface the question.
3. Run `npx tsc --noEmit` in `api/` and `worker/` to confirm clean baseline.

---

## End-of-session checklist

Run this after every session that changes code, config, or architecture.
For each item — fix it if it's broken, update the doc if it's missing.

- [ ] `npx tsc --noEmit` passes with zero errors in `api/` and `worker/`
- [ ] No secrets in committed files — all credentials in `.env` (gitignored)
- [ ] Every new env var is in `.env.example` and in `conventions.md` → Environment Variables table
- [ ] Every new route returns the standard envelope (`{ success, data }` or `{ success, message, code }`)
- [ ] `globalErrorHandler` remains the last middleware in `api/src/app.ts`
- [ ] Any resolved TBD is updated in `decisions.md` with decision, decider, and date
- [ ] Any new naming or API pattern that differs from conventions is added to `conventions.md`

---

## Quick start

```bash
cp .env.example .env          # fill in real values
docker compose up --build -d
docker compose ps             # all 5 services healthy
curl http://localhost/health  # { "success": true, "message": "OK" }
```
