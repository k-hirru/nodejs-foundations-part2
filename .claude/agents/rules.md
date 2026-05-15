# FlowBoard — Hard Rules

These are non-negotiable. No exceptions, no overrides.

## TypeScript
- No implicit `any`. Every variable, parameter, and return type must be annotated or unambiguously inferred.
- No `@ts-ignore` and no `as any`. If a cast is genuinely needed, use `as unknown as T` and leave a comment explaining why.
- No non-null assertions (`!`) outside test files.
- `unknown` over `any` for caught errors in `catch` blocks.
- All async functions return `Promise<T>` with an explicit `T`.
- All function parameters and return types are annotated — including callbacks, middleware, and arrow functions.
- `npx tsc --noEmit` must pass with zero errors before every commit.

## Secrets and configuration
- Never hardcode secrets, passwords, connection strings, or API keys in source files.
- All credentials live in `.env` (gitignored). `.env.example` holds the template with placeholder values.
- Never commit a `.env` file.

## Error handling
- Never swallow errors silently. Always propagate via `throw new AppError(...)` or `next(error)`.
- Use `isAppError` to narrow caught errors before accessing `AppError`-specific fields.
- Stack traces must not appear in production responses (`process.env['NODE_ENV'] !== 'production'` guard).

## Logging and privacy
- Never log PII: no emails, passwords, tokens, names, or any personal data in log output.
- Never log raw JWT tokens.

## Database
- No raw SQL. Prisma only. If `$executeRaw` is ever required, it must use parameterized inputs — never string interpolation.
- Validate all user input with Zod before it reaches the database layer.

## Response discipline
- Never call `next()` after a response has been sent.
- Every route handler must either send a response or call `next(error)` — no silent exits.
