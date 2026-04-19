---
inclusion: always
---

# Nr.31 FKR Regiment Portal — Project Overview

This is the frontend for the **31st Feldkanonenregiment (Nr.31 FKR)** web portal — a Ukrainian military community organization. Built with React 19 + TypeScript + Vite.

## Tech Stack

- **React 19** — functional components and hooks only
- **TypeScript 5.9** — strict typing throughout
- **Vite 7** — build tool with `@` alias pointing to `/src`
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin, no custom CSS
- **Zustand 5** — global state (`useAuthStore`, `useUIStore`)
- **React Router 7** — client-side routing
- **Axios** — centralized instance at `src/api/axiosConfig.ts`
- **react-i18next** — i18n with EN/UK locales
- **openapi-typescript** — auto-generated API types in `src/api/types.ts`
- **jwt-decode** — decode JWT payload for user/authorities
- **lucide-react** — icons

## Dev Commands

```bash
npm run dev           # Vite dev server (port 5173, proxies /api → localhost:8080)
npm run build         # tsc -b && vite build
npm run lint          # ESLint
npm run generate-api  # Regenerate src/api/types.ts from backend OpenAPI spec
```

## Environment

- `VITE_API_BASE_URL` — backend base URL (defaults to `/api`)
- Dev proxy: `/api` → `http://localhost:8080`
- Config source of truth: `src/config/environment.ts`
