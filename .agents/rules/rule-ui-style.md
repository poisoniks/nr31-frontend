---
trigger: always_on
globs: **/src/{components,pages}/**/*.{ts,tsx}
---

# Styling and UI Framework
- CSS: Exclusively use Tailwind CSS v4 utility classes. Never write custom CSS files or inline styles.
- Components: Use shadcn/ui components for complex UI elements (Tables, Modals, Forms, Dropdowns) and `lucide-react` for icons.
- Typography: Use the font Georgia globally. Headers should use serif fonts (Cinzel or Playfair Display); interface text must use clean sans-serif (Inter or Roboto).
- Theming: Implement standard Tailwind `dark:` classes via a `ThemeProvider`. Default the theme to Dark mode. Light mode exists.
- Colors: Use the Gold accent color (`#D4AF37` / `#E5B81B`). Surfaces should be White (`#FFFFFF`) to stand out from the light background tint (`#FDFBF7`).
- Effects: Use glassmorphism (`backdrop-blur-md` with semi-transparent backgrounds) for headers, modals, and overlaid cards.
- States: Use Skeleton loaders instead of generic spinners during data loading.