---
trigger: always_on
globs: **/*.{ts,tsx}
---

# React Architecture & Syntax
- Framework: Use React 19 functional components and hooks.
- State: Use Zustand for global state management (e.g., authentication). Use React Context only when strictly necessary.
- Data Fetching: Use the centralized Axios instance from `src/api/axiosConfig.ts`. Never use the native `fetch` API.
- Interceptors: Ensure the Axios request interceptor attaches `Authorization: Bearer <token>`, and the response interceptor handles 401 token refreshes.
- Routing: Use React Router v6. All protected routes must be wrapped in the `<ProtectedRoute>` component.
- Permissions: Elements requiring specific roles must be wrapped in `<RequirePermission permission="...">`.
- Tokens: Extract the `authorities` array via `jwt-decode` and store the Access Token in memory or `localStorage`.