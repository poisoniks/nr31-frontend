---
trigger: always_on
---

# Directory Structure
Enforce strict absolute imports (or clear relative paths) following this structure:
- `/src/api` - Axios instance and API call functions. All paths must be relative (e.g., `/api/auth/login`).
- `/src/components` - Reusable UI components (buttons, navbar, RequirePermission).
- `/src/pages` - Route-level page components.
- `/src/locales` - i18n JSON files.
- `/src/hooks` - Custom React hooks.
- `/src/store` - Zustand store.
- `/src/utils` - Helper functions (e.g., JWT decoding).
- `/public` - all publicly available resources like icons, images, etc.
Never place a new file outside of its designated folder.