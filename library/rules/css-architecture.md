# CSS Architecture Rules

## Core Principles

```yaml
principles:
  - Mobile-first: base styles for mobile, min-width queries to enhance
  - CSS variables: all colors/spacing/fonts from design tokens
  - No !important: refactor specificity instead
  - Single source: component defined once, modifiers for variations

naming:
  block: .card, .btn, .wizard-step
  element: .card-header, .wizard-step-number  # part of block
  modifier: .btn--primary, .btn--sm           # variation
  state: .is-active, .is-loading, .has-error  # dynamic
```

---

## Mobile-First (Non-Negotiable)

```css
/* Base styles = mobile */
.component {
    padding: var(--spacing-sm);
    font-size: var(--font-size-base);
}

/* Scale UP with min-width (never max-width) */
@media (min-width: 768px) {
    .component {
        padding: var(--spacing-md);
    }
}

@media (min-width: 1024px) {
    .component {
        padding: var(--spacing-lg);
    }
}
```

**NEVER use max-width media queries.** They indicate desktop-first thinking.

---

## CSS Variables (Required)

```css
:root {
    /* Colors */
    --color-primary: #0066cc;
    --color-text-primary: #1a1a1a;
    --color-text-secondary: #666666;
    --color-bg-primary: #ffffff;
    --color-bg-secondary: #f5f5f5;
    --color-border: #e0e0e0;
    --color-success: #22c55e;
    --color-warning: #f59e0b;
    --color-error: #ef4444;

    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;

    /* Typography */
    --font-sans: system-ui, -apple-system, sans-serif;
    --font-mono: 'Fira Code', monospace;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;

    /* Borders */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 1rem;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* Dark mode */
[data-theme="dark"] {
    --color-text-primary: #f0f0f0;
    --color-text-secondary: #a0a0a0;
    --color-bg-primary: #1a1a1a;
    --color-bg-secondary: #2a2a2a;
    --color-border: #404040;
}
```

**NEVER hardcode colors or spacing.** Always use variables.

```css
/* GOOD */
color: var(--color-text-primary);
padding: var(--spacing-md);

/* BAD */
color: #333;
padding: 16px;
```

---

## Z-Index Scale

Use powers of 10 minus 1 to leave room for stacking:

```css
:root {
    --z-base: 0;
    --z-elevated: 9;      /* Badges, tooltips */
    --z-dropdown: 99;     /* Dropdowns, popovers */
    --z-sticky: 999;      /* Sticky headers */
    --z-modal: 9999;      /* Modals, dialogs */
    --z-toast: 99999;     /* Toast notifications */
}
```

**Shim values:** Use 91-98, 991-998 for stacking within a layer.

---

## BEM Naming Convention

```css
/* Block: standalone component */
.card { }
.button { }

/* Element: part of a block (double underscore) */
.card__header { }
.card__body { }
.card__footer { }

/* Modifier: variation (double hyphen) */
.button--primary { }
.button--small { }
.card--featured { }

/* State: dynamic condition (is-, has-) */
.button.is-loading { }
.card.is-expanded { }
.form.has-error { }
```

---

## File Structure Order

Within a CSS file, maintain this order:

```css
/* 1. CSS Reset & Variables */
:root { }

/* 2. Base Typography */
body { }
h1, h2, h3 { }

/* 3. Layout */
.container { }
.grid { }

/* 4. Components (alphabetical) */
.button { }
.card { }
.modal { }

/* 5. Utilities */
.sr-only { }
.text-center { }

/* 6. Animations */
@keyframes fadeIn { }

/* 7. Media Queries (consolidated at end) */
@media (min-width: 768px) { }
@media (min-width: 1024px) { }
```

---

## Component Template

```css
/* ==========================================================================
   Component: Card
   ========================================================================== */

/* Base (mobile-first) */
.card {
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
}

/* Elements */
.card__header {
    border-bottom: 1px solid var(--color-border);
    padding-bottom: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
}

.card__title {
    font-size: var(--font-size-lg);
    font-weight: 600;
}

.card__body { }

.card__footer {
    border-top: 1px solid var(--color-border);
    padding-top: var(--spacing-sm);
    margin-top: var(--spacing-md);
}

/* Modifiers */
.card--featured {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
}

/* States */
.card.is-loading {
    opacity: 0.6;
    pointer-events: none;
}

/* Responsive (at component end, not inline) */
@media (min-width: 768px) {
    .card {
        padding: var(--spacing-lg);
    }
}
```

---

## Tailwind Specifics (If Using)

```html
<!-- Mobile-first with breakpoint prefixes -->
<div class="p-4 md:p-6 lg:p-8">

<!-- State variants -->
<button class="bg-blue-500 hover:bg-blue-600 disabled:opacity-50">

<!-- Dark mode -->
<div class="bg-white dark:bg-gray-900">
```

**Icon sizing rule (Tailwind):** Never rely on parent CSS for icon sizing. Always use explicit classes:

```html
<!-- GOOD: Explicit size -->
<svg class="w-5 h-5">

<!-- BAD: Relies on parent -->
<svg>
```

Standard icon sizes:
- `w-3 h-3` (12px) - Inline indicators
- `w-4 h-4` (16px) - Buttons, form fields
- `w-5 h-5` (20px) - Header actions
- `w-6 h-6` (24px) - Navigation (default)
- `w-8 h-8` (32px) - Empty states

---

## Accessibility Requirements

- **Touch targets:** Minimum 44x44px for interactive elements
- **Color contrast:** WCAG 2.1 AA (4.5:1 for text, 3:1 for large text)
- **Focus states:** Visible focus indicators on all interactive elements
- **Reduced motion:** Respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

## Checklist

- [ ] Using CSS variables for all colors/spacing
- [ ] Mobile-first (min-width queries only)
- [ ] No `!important`
- [ ] Media queries consolidated at component end
- [ ] Z-index from scale
- [ ] BEM naming convention
- [ ] Tested light and dark themes
- [ ] Touch targets >= 44px
- [ ] Focus states visible
