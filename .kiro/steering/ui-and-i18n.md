---
inclusion: fileMatch
fileMatchPattern: "src/{components,pages}/**"
---

# UI Styling & Internationalization

## Styling

- **Tailwind CSS v4 only** — no custom CSS files, no inline styles
- Use `dark:` classes via `ThemeProvider`; default theme is **dark mode**
- **Colors**: Gold accent `#D4AF37` / `#E5B81B`; white surfaces `#FFFFFF` on light tint `#FDFBF7`
- **Typography**: Georgia globally; headers → Cinzel or Playfair Display (serif); UI text → Inter or Roboto (sans-serif)
- **Effects**: Glassmorphism (`backdrop-blur-md` + semi-transparent bg) for headers, modals, overlaid cards
- **Loading states**: Skeleton loaders — never generic spinners
- **Icons**: `lucide-react` only
- **Complex UI** (Tables, Modals, Forms, Dropdowns): shadcn/ui patterns + `class-variance-authority`

## Interactivity

- Every interactable element (buttons, links, selects, toggles, clickable rows, etc.) **must** have `cursor-pointer` applied

## Internationalization

- All static text via `useTranslation()` hook — never hardcode strings in JSX
- Translation keys live in `src/locales/en/translation.json` and `src/locales/uk/translation.json`
- Both locale files must be updated together whenever new text is added
- Supported languages: `en` (fallback), `uk`
- Missing key placeholder: `"Localize me!"` (debug mode active in dev)
