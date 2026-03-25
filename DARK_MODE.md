# Dark Mode Rules — DevTrack

## The One Rule

> **Never use `dark:` Tailwind prefix anywhere in the codebase.**
>
> All theming must be done exclusively through CSS variables defined in `globals.css`.

---

## How It Works

The theme system works by toggling a `.dark` class on `<html>`. All CSS variables are
defined in `:root` (light values) and re-declared under `.dark` (dark values). Every
component automatically picks up the correct token for the active theme.

```
:root   { --background: oklch(1 0 0); }   /* white */
.dark   { --background: oklch(0.10 0 0); } /* near-black */

/* In a component — just use the variable, no dark: needed */
.card { background: var(--background); }
```

---

## Rules

### 1. Use CSS variables, NEVER hardcoded colors

| ❌ Not allowed                 | ✅ Use instead                                         |
| ------------------------------ | ------------------------------------------------------ |
| `bg-green-500`                 | `bg-[var(--status-completed)]`                         |
| `text-yellow-800`              | `text-[var(--difficulty-medium-text)]`                 |
| `bg-red-100`                   | `bg-[var(--difficulty-hard-bg)]`                       |
| `text-green-600`               | `text-[var(--success-message-text)]`                   |
| `oklch(0.70 0.1 142)` (inline) | `var(--chart-easy)`                                    |
| `hsl(var(--background))`       | `var(--background)` — already oklch, no wrapper needed |

### 2. Never use `dark:` prefix

```tsx
// ❌ Forbidden
className = "bg-white dark:bg-gray-900";
className = "text-black dark:text-white";

// ✅ Required
className = "bg-background text-foreground"; // these auto-switch
```

### 3. If a color is used in even one place, it must be a CSS variable

Extract it to `globals.css` under `:root` with a light value and under `.dark` with a dark value.

### 4. Recharts / inline styles use `var(--token)` directly

```tsx
// ❌ Forbidden
fill = "oklch(0.70 0.1 142)";
backgroundColor: "hsl(var(--background))";

// ✅ Required
fill = "var(--chart-easy)";
backgroundColor: "var(--background)";
```

---

## Available CSS Variables

### Core

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--border`, `--input`, `--ring`
- `--destructive`

### Form Controls

- `--input-bg` — transparent in light, slight white in dark
- `--input-bg-hover` — muted in light, slightly more in dark
- `--input-bg-disabled` — disabled state

### Semantic States

- `--success`, `--success-foreground`
- `--warning`, `--warning-foreground`
- `--error`, `--error-foreground`

### Success Message (auth forms)

- `--success-message-bg`
- `--success-message-text`
- `--success-message-border`

### Difficulty Badges

- `--difficulty-easy-bg`, `--difficulty-easy-text`
- `--difficulty-medium-bg`, `--difficulty-medium-text`
- `--difficulty-hard-bg`, `--difficulty-hard-text`

### Project Status Dots

- `--status-in-progress`
- `--status-completed`
- `--status-hold`

### Chart Fills

- `--chart-easy` (green)
- `--chart-medium` (amber)
- `--chart-hard` (red)
- `--chart-1` through `--chart-5` (grayscale steps)

### Sidebar

- `--sidebar`, `--sidebar-foreground`
- `--sidebar-primary`, `--sidebar-primary-foreground`
- `--sidebar-accent`, `--sidebar-accent-foreground`
- `--sidebar-border`, `--sidebar-ring`

---

## Adding New Colors

1. **Add to `:root`** with the light value
2. **Add to `.dark`** with the dark value
3. **Add to `@theme inline`** if you need a Tailwind utility alias
4. **Use `var(--your-token)`** anywhere in the codebase

```css
/* globals.css */
:root {
  --my-new-color: oklch(0.5 0.1 200);
}
.dark {
  --my-new-color: oklch(0.7 0.1 200);
}
```

```tsx
// component
<div className="bg-[var(--my-new-color)]">...</div>
// or inline style
<div style={{ color: 'var(--my-new-color)' }}>...</div>
```

---

## Theme Toggle

The theme is managed by `hooks/useTheme.ts` and toggled via `components/shared/ThemeToggle.tsx`.

- **Storage key**: `devtrack-theme` in `localStorage`
- **Values**: `"light"`, `"dark"`, `"system"`
- **Default**: `"system"` (follows OS preference)
- The toggle button is rendered in the dashboard `Header` component.

```tsx
import { ThemeToggle } from "@/components/shared/ThemeToggle";
// Place anywhere — already handles mounting guard
<ThemeToggle />;
```
