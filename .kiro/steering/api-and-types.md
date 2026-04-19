---
inclusion: fileMatch
fileMatchPattern: "src/api/**"
---

# API Layer & Type Policy

## Axios Instance

Use the centralized instance from `src/api/axiosConfig.ts` — never use native `fetch` or create a new `axios` instance.

## API Modules

One file per domain under `src/api/`:
- `authApi.ts`, `adminApi.ts`, `calendarApi.ts`, `rosterApi.ts`, `libraryApi.ts`, `accessApi.ts`, `configApi.ts`, `localeApi.ts`

Each module exports typed async functions with explicit return types.

## Type Policy

- **All types come from `src/api/types.ts`** — generated via `npm run generate-api` from the backend OpenAPI spec
- Never create custom interfaces for request/response objects; update the backend schema instead
- Reference types via indexed access:
  ```ts
  type LoginRequest = paths['/api/v1/auth/login']['post']['requestBody']['content']['application/json'];
  type UserDTO = components['schemas']['UserDTO'];
  ```
- Use `Pick<>` or `Omit<>` when a component needs a subset of a generated type

## URL Convention

All API paths are relative (e.g., `/api/v1/auth/login`). The base URL is set in `axiosConfig.ts` from `env.API_BASE_URL`.
