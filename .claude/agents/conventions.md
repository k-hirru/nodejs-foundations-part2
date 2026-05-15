# FlowBoard — Conventions

## Tech Stack
- **Runtime**: Node.js 20 (LTS), Alpine Docker images
- **Language**: TypeScript 5.x — see rules.md for strict-mode details
- **API framework**: Express 4.x
- **ORM**: Prisma 5.x · PostgreSQL 16
- **Queue**: BullMQ 5.x · Redis 7
- **Auth**: `jsonwebtoken` — tokens expire per `JWT_EXPIRES_IN` (default `7d`)
- **Validation**: Zod 3.x for all request bodies
- **Security middleware**: Helmet, `cors`, `express-rate-limit` + `rate-limit-redis`
- **Logging**: Winston 3.x
- **Container**: Docker + docker-compose; Nginx on port 80 → api:3000

---

## Monorepo Structure

```
api/src/
  controllers/   — request handlers; throw AppError on failure
  routes/        — Express routers; attach controllers + middleware
  middleware/    — auth guard, Zod validation wrappers, rate-limit
  errors/        — AppError, isAppError, globalErrorHandler
  lib/           — db client singleton, redis client, logger
  app.ts         — Express app; globalErrorHandler registered last
  index.ts       — entry point; binds to PORT

worker/src/
  processors/    — BullMQ job processor functions
  lib/           — redis client, logger
  index.ts       — entry point; registers queues and processors
```

**New API route**: controller in `controllers/`, router in `routes/`, mounted in `app.ts`.  
**New background job**: processor in `worker/src/processors/`, registered in `worker/src/index.ts`.

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Module file | `camelCase.ts` | `taskController.ts` |
| Class file | `PascalCase.ts` | `AppError.ts` |
| Interface | `IPascalCase` | `ITask`, `IUserPayload` |
| Type alias | `TPascalCase` | `TErrorCode`, `TUserRole` |
| Enum | `PascalCase` + `UPPER_SNAKE` values | `TaskStatus.IN_PROGRESS` |
| Route | `kebab-case` | `/api/v1/task-boards` |
| DB field | `camelCase` in Prisma model; `@map("snake_case")` only when DB column differs | |

---

## TypeScript Scaffolds

### Prefer `interface` for shapes
```typescript
interface ICreateTaskBody {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}
```

### Use `type` for unions / mapped types only
```typescript
type TErrorCode = 'TASK_NOT_FOUND' | 'UNAUTHORIZED' | 'INTERNAL_ERROR';
```

### Async handler signature
```typescript
async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // ...
  } catch (err: unknown) {
    next(err);
  }
}
```

---

## Error Handling Conventions

**AppError** — `api/src/errors/AppError.ts`
```typescript
throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
```

**isAppError** — narrow `unknown` before accessing AppError fields
```typescript
catch (err: unknown) {
  if (isAppError(err)) {
    // err.statusCode, err.code are safe here
  }
  next(err);
}
```

**globalErrorHandler** must be the LAST `app.use()` call in `app.ts`.

**Error response envelope**:
```json
{ "success": false, "message": "Task not found", "code": "TASK_NOT_FOUND" }
```

---

## API Conventions

- All routes prefixed `/api/v1/`
- **Success envelope**: `{ "success": true, "data": <T> }`
- **Error envelope**: `{ "success": false, "message": string, "code": string }`
- HTTP status policy: 200 OK · 201 Created · 400 Bad Request · 401 Unauthorized · 403 Forbidden · 404 Not Found · 422 Unprocessable Entity · 500 Internal Server Error

---

## Prisma Conventions

- Schema: `api/prisma/schema.prisma`
- Add model → `npx prisma migrate dev --name <migration-name>` (dev) or `npx prisma migrate deploy` (prod)
- After schema change: `npm run db:generate` to regenerate the client
- Prisma client singleton: `api/src/lib/db.ts` (one shared instance, not `new PrismaClient()` per request)

---

## Environment Variables

| Variable | Consumed by | Purpose |
|---|---|---|
| `POSTGRES_DB` | docker-compose postgres | Database name |
| `POSTGRES_USER` | docker-compose postgres | DB superuser |
| `POSTGRES_PASSWORD` | docker-compose postgres | DB superuser password |
| `DATABASE_URL` | api, worker | Prisma connection string |
| `REDIS_URL` | api, worker | BullMQ / ioredis connection |
| `JWT_SECRET` | api | Signs and verifies JWTs (min 32 chars) |
| `JWT_EXPIRES_IN` | api | Token lifetime (default `7d`) |
| `NODE_ENV` | api, worker | `development` or `production` |
| `PORT` | api | HTTP server port (default `3000`) |

Template: `.env.example` at repo root.

---

## Docker Workflow

```bash
# Start full stack
docker compose up --build -d

# Rebuild one service
docker compose build api && docker compose up -d --no-deps api

# Logs
docker compose logs -f api
docker compose logs -f worker

# Postgres shell
docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB

# Teardown (keep volumes)
docker compose down

# Teardown + wipe data
docker compose down -v
```

---

## Auth Conventions

- JWT verified by `authMiddleware` in `api/src/middleware/`
- Token payload shape: `IUserPayload { userId: string; email: string; iat: number; exp: number }`
- Attach decoded payload to `res.locals.user` inside the middleware

---

## Security Baseline

- **Implemented**: Helmet headers, CORS, Redis-backed rate limiting, Zod input validation, JWT auth
- **Pending**: XSS output escaping, refresh tokens, audit log, security event monitoring
