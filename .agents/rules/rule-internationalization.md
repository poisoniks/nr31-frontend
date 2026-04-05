---
trigger: glob
globs: **/*.{ts,tsx}
---

# Internationalization (i18n)
- Library: Use `react-i18next`.
- Translation usage: All static text in components must use the `useTranslation()` hook. Example: `t('login.submit')`.
- Hardcoded text: Never hardcode strings directly into the JSX. Always map them to `/src/locales/{en,uk}/translation.json`.