---
inclusion: fileMatch
fileMatchPattern: "src/{components,pages}/**"
---

# Forms, Modals & Error Handling

## Modal Windows

- All modals **must** use `src/components/ui/Modal.tsx` as the parent wrapper — never build a custom overlay from scratch
- Pass `title`, `onClose`, and optionally `contentClassName` props
- Modal content goes as `children`

## Forms

- Mandatory fields must be visually marked with ` *` appended to their label text
- Example: `{t('events.edit.title_placeholder')} *`
- Validate required fields before submission; show inline error messages on failure

## Localized Entity Fields

- Any entity field that holds localized content (e.g. `name`, `description` as `Record<string, string>`) must be editable per-locale using a `<LocaleTabBar>` tab switcher above the input
- Pattern (from `EventCreateModal`):
  ```tsx
  const [titleLocale, setTitleLocale] = useState(lang);
  // ...
  <LocaleTabBar activeLocale={titleLocale} onLocaleChange={setTitleLocale} />
  <input value={title[titleLocale] || ''} onChange={(e) => setTitle({ ...title, [titleLocale]: e.target.value })} />
  ```
- Before saving, fill any empty locale values with the first non-empty value so no locale is left blank

## Error Handling

- Always use `getErrorMessage(error, t)` from `src/utils/errorUtils.ts` to extract user-facing error messages from API errors
- Never display raw error objects or generic fallback strings directly — route all errors through `getErrorMessage`
- Surface errors via `useUIStore.setError(message)` to trigger the global red toast notification
- Example:
  ```ts
  import { getErrorMessage } from '@/utils/errorUtils';
  import { useUIStore } from '@/store/useUIStore';

  const { setError } = useUIStore();
  // ...
  } catch (err) {
      setError(getErrorMessage(err, t));
  }
  ```

## UI Testing

- Use **Playwright MCP** for all UI testing
- Write tests that interact with the rendered UI (clicks, form fills, assertions on visible text/state)
