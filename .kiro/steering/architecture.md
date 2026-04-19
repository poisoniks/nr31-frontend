---
inclusion: always
---

# Architecture & Code Conventions

## Project Structure

```
src/
  api/          # Axios instance + domain API modules
  components/   # Reusable UI (ui/, auth/, events/, admin/, library/, layout/)
  pages/        # Route-level components (admin/ for sub-pages)
  hooks/        # Custom React hooks
  store/        # Zustand stores
  utils/        # Pure helper functions
  locales/      # i18n JSON files (en/, uk/)
  config/       # environment.ts — single source of truth for env vars
```

Never place a file outside its designated folder. Use `@/` absolute imports (alias for `/src`).

## Components

- Functional components only, explicit `interface` for props
- No class components, no `React.FC` unless needed for generic props
- Feature components live in `src/components/<domain>/`
- Generic reusable UI lives in `src/components/ui/`

## State Management

- **Zustand** for all global state — do not use React Context for global concerns
- `useAuthStore` — JWT tokens, decoded user payload, `isAuthenticated`, `login()`, `logout()`
- `useUIStore` — global error state for toast notifications
- Tokens stored in `localStorage`; user decoded via `jwt-decode`

## Routing & Auth

- React Router v7, all routes defined in `src/App.tsx`
- Authenticated pages wrapped in `<ProtectedRoute>` — redirects to `/` if not authenticated
- Permission-gated UI wrapped in `<RequirePermission permission="...">` — checks `user.authorities[]` from JWT
- On 401, Axios interceptor attempts token refresh; on failure clears tokens and redirects to `/login`

## Code Quality

- Write complete, production-ready code — no TODOs, no placeholders, no mock logic
- Always handle edge cases: token refresh failures, API errors (red toast via `useUIStore`), empty states
- All API errors surface via `useUIStore.setError(message)`
