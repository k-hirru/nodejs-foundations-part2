# FlowBoard — Open Decisions

These items were TBD at the start of the project. Each must be filled in before work in that area begins. Do not guess or default silently — surface the question and update this file when resolved.

---

## Decisions made — 2026-05-15

### TypeScript compiler options
**Decision**: `module: "Node16"`, `moduleResolution: "node16"`, `target: "ES2022"`, `outDir: "dist"`, `rootDir: "src"`, full strict set (`strict`, `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictPropertyInitialization`, `noImplicitReturns`, `noUncheckedIndexedAccess`, `esModuleInterop`).  
**Decided by**: Session setup, 2026-05-15.  
**Applies to**: Both `api/tsconfig.json` and `worker/tsconfig.json` — identical settings.

### Error handling pattern
**Decision**: `AppError` class in `api/src/errors/AppError.ts`. `globalErrorHandler` is the last middleware in `app.ts`. Error envelope is exactly `{ success: false, message: string, code: string }`. Stack traces suppressed when `NODE_ENV === 'production'`. Prisma errors and TypeErrors fall through to the 500 fallback.  
**Decided by**: Session setup, 2026-05-15.

### API response envelope
**Decision**: Success: `{ success: true, data: T }`. Error: `{ success: false, message: string, code: string }`. All routes prefixed `/api/v1/`.  
**Decided by**: Session setup, 2026-05-15.

### Docker infrastructure
**Decision**: Five-service stack — postgres:16-alpine, redis:7-alpine, api (build: ./api), worker (build: ./worker), nginx:alpine. OpenSSL installed in both builder and runner stages of the API image. nginx uses Docker DNS resolver (`127.0.0.11`) with runtime upstream resolution. API health check on `/health` with `start_period: 30s`. Nginx waits for `api: condition: service_healthy`.  
**Decided by**: Session setup, 2026-05-15.

### Worker keep-alive
**Decision**: Worker process stays alive via an ioredis connection. Not a fire-and-forget script — must remain running. SIGTERM handler calls `redis.disconnect()` and exits 0.  
**Decided by**: Session setup, 2026-05-15.

---

## Still open

### Pagination
**Question**: What format should paginated list endpoints use?

Options:
- Cursor-based: `{ data: T[], nextCursor: string | null }`
- Offset-based: `{ data: T[], total: number, page: number, pageSize: number }`

**Decision**: —  
**Decided by**: —  
**Date**: —

---

### Testing framework
**Question**: Jest or Vitest? Co-located (`*.test.ts`) or `__tests__/` directory?

Options:
- Jest — more ecosystem coverage, heavier setup
- Vitest — faster, native TypeScript, same API as Jest

**Decision**: —  
**Decided by**: —  
**Date**: —

---

### Coverage target
**Question**: Minimum acceptable test coverage percentage?

**Decision**: —  
**Decided by**: —  
**Date**: —

---

### Role / permission model
**Question**: Does FlowBoard need roles (`ADMIN`, `MEMBER`) or is ownership-based access sufficient?

Affects: JWT payload shape `IUserPayload`, authorization middleware, Prisma schema.

**Decision**: —  
**Decided by**: —  
**Date**: —

---

### Auth refresh tokens
**Question**: Should the API issue refresh tokens alongside access tokens?

Affects: auth controller, token storage, security posture.

**Decision**: —  
**Decided by**: —  
**Date**: —

---

### Seed data strategy
**Question**: How should development seed data be created and reset?

Options: `prisma/seed.ts` via `prisma db seed`, dedicated `npm run seed` script, or Docker init SQL.

**Decision**: —  
**Decided by**: —  
**Date**: —

---

### Prisma client singleton location
**Question**: Confirm `api/src/lib/db.ts` as the single export point for the Prisma client.

**Decision**: —  
**Decided by**: —  
**Date**: —
