---
name: interface-design
description: Systematic UI design with principle-based decisions, design tokens, and cross-session consistency. Use when building consistent design systems or component libraries.
---

# Interface Design Skill

Systematic UI design through principle-based decisions, automatic memory, and cross-session consistency.

## Invocation

```
/interface-design [init|status|audit|extract]
```

Or naturally: "establish design system", "audit this UI", "extract patterns"

## Commands

| Command | Description |
|---------|-------------|
| `/interface-design init` | Start with design principles |
| `/interface-design status` | Display current system |
| `/interface-design audit [path]` | Validate code against system |
| `/interface-design extract` | Identify patterns from existing code |

## Core Philosophy

### Decisions Compound
A single spacing choice becomes an established pattern. A depth strategy becomes visual identity.

### Consistency Over Perfection
A coherent system with acceptable values outperforms scattered interfaces with theoretically optimal values.

### Memory Enables Iteration
Documented decisions allow intentional evolution rather than accidental drift.

## Design Directions

Choose ONE direction for your project:

| Direction | Character | Spacing | Colors | Best For |
|-----------|-----------|---------|--------|----------|
| **Precision & Density** | Tight, technical | 4-8-12-16px | Cool neutrals | Admin dashboards, dev tools |
| **Warmth & Approachability** | Generous, soft | 8-16-24-32px | Warm tones | Consumer apps, collaboration |
| **Sophistication & Trust** | Refined, layered | 12-24-48px | Cool + gold accents | Finance, enterprise B2B |
| **Boldness & Clarity** | High contrast | 8-16-32px | Primaries + black | Modern dashboards |
| **Utility & Function** | Muted density | 4-8-16px | Muted palette | GitHub-style tools |
| **Data & Analysis** | Chart-optimized | 8-12-16-24px | Sequential scales | Analytics, BI platforms |

## System File Structure

Save design decisions to `.interface-design/system.md`:

```markdown
# Design System

## Direction
Sophistication & Trust

## Tokens

### Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 48px

### Colors
```css
:root {
  --color-primary: hsl(220 70% 50%);
  --color-secondary: hsl(35 80% 55%);
  --color-surface: hsl(220 15% 98%);
  --color-surface-elevated: hsl(0 0% 100%);
  --color-text: hsl(220 15% 15%);
  --color-text-muted: hsl(220 10% 45%);
  --color-border: hsl(220 15% 90%);
}
```

### Typography
- Font: 'Plus Jakarta Sans', sans-serif
- Base: 16px
- Scale: 1.25 (Major Third)
- Weights: 400, 500, 600

### Depth
- Subtle: 0 1px 2px rgba(0,0,0,0.05)
- Elevated: 0 4px 12px rgba(0,0,0,0.08)
- Floating: 0 12px 32px rgba(0,0,0,0.12)

## Patterns

### Buttons
- Primary: filled, bold text
- Secondary: outlined
- Ghost: text only
- Height: 36px (sm), 40px (md), 48px (lg)
- Padding: 12px 16px

### Cards
- Border-radius: 12px
- Padding: 24px
- Background: var(--color-surface-elevated)
- Shadow: var(--shadow-elevated)
```

## Instructions for Claude

### init Command

1. Ask about project context:
   - What type of application?
   - Who are the users?
   - Any existing brand guidelines?

2. Recommend a design direction based on answers

3. Generate initial `system.md` with:
   - Direction
   - Color tokens (CSS variables)
   - Spacing scale
   - Typography settings
   - Depth/shadow tokens

4. Create `.interface-design/system.md` file

### status Command

1. Read `.interface-design/system.md`
2. Display current tokens and patterns
3. Show usage statistics if available

### audit Command

1. Read target file(s)
2. Compare against system.md tokens
3. Flag violations:
   - Hardcoded colors (should use variables)
   - Off-scale spacing (should use tokens)
   - Missing focus states
   - Inconsistent typography

Output:
```
=== INTERFACE AUDIT ===

File: src/components/Card.tsx

Violations:
- Line 12: Hardcoded color #333 (use var(--color-text))
- Line 18: 13px spacing (use 12px or 16px from scale)
- Line 25: Missing focus-visible state

Suggestions:
- Extract repeated shadow to CSS variable
- Add aria-label to icon button
```

### extract Command

1. Scan existing codebase
2. Identify recurring values:
   - Colors
   - Spacing
   - Font sizes
   - Border radii
   - Shadows

3. Generate proposed system.md based on patterns

## Component Templates

### Button (React + Tailwind)
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'border border-border hover:bg-surface',
  ghost: 'hover:bg-surface',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4',
  lg: 'h-12 px-6 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children
}: ButtonProps) {
  return (
    <button className={cn(
      'inline-flex items-center justify-center rounded-lg font-medium',
      'transition-colors focus-visible:outline-none focus-visible:ring-2',
      variants[variant],
      sizes[size]
    )}>
      {children}
    </button>
  );
}
```

### Card
```tsx
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'rounded-xl bg-surface-elevated p-6 shadow-elevated',
      className
    )}>
      {children}
    </div>
  );
}
```

## Tailwind Config Integration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--color-primary) / <alpha-value>)',
        surface: 'hsl(var(--color-surface) / <alpha-value>)',
        // ... map all CSS variables
      },
      spacing: {
        // Use system spacing scale
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        elevated: 'var(--shadow-elevated)',
        floating: 'var(--shadow-floating)',
      },
    },
  },
};
```

## Sources

- [Interface Design Plugin](https://github.com/Dammyjay93/interface-design)
- [Tailwind UI](https://tailwindui.com/)
- [Radix UI](https://www.radix-ui.com/)
