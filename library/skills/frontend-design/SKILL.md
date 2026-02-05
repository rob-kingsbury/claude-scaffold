---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use when building web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
---

# Frontend Design Skill

Create distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics.

## Invocation

```
/frontend-design [component/page description]
```

Or naturally: "design this UI", "build a landing page", "create a component"

## Design Thinking Process

Before coding, understand context and commit to a **BOLD aesthetic direction**:

### 1. Purpose
- What problem does this interface solve?
- Who uses it?
- What emotions should it evoke?

### 2. Tone (Pick ONE Extreme)

| Direction | Character | Best For |
|-----------|-----------|----------|
| Brutally Minimal | Sparse, intentional | Luxury, portfolios |
| Maximalist Chaos | Dense, layered | Creative agencies |
| Retro-Futuristic | Nostalgic tech | Gaming, media |
| Organic/Natural | Soft, flowing | Wellness, eco |
| Luxury/Refined | Elegant, spacious | Premium products |
| Playful/Toy-like | Bouncy, colorful | Consumer apps |
| Editorial/Magazine | Grid-based, typographic | Content sites |
| Brutalist/Raw | Exposed, honest | Dev tools, art |
| Art Deco/Geometric | Symmetry, gold | Events, hospitality |
| Soft/Pastel | Gentle, approachable | B2C, community |
| Industrial/Utilitarian | Functional, dense | Admin, dashboards |

### 3. Differentiation
- What makes this UNFORGETTABLE?
- What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute with precision.

## Aesthetics Guidelines

### Typography
**NEVER use:**
- Inter, Roboto, Arial, system fonts
- Safe, predictable choices

**DO use:**
- Distinctive display fonts (Space Grotesk, Clash Display, Satoshi)
- Refined body fonts (Cabinet Grotesk, General Sans, Plus Jakarta Sans)
- Unexpected pairings that create tension

### Color & Theme
- Commit to a cohesive aesthetic
- Use CSS variables for consistency
- Dominant colors with sharp accents > timid, evenly-distributed palettes
- NEVER: purple gradients on white (the AI cliché)

### Motion & Animation
- Prioritize CSS-only solutions
- Focus on high-impact moments:
  - Page load with staggered reveals
  - Scroll-triggered transformations
  - Hover states that surprise
- One well-orchestrated animation > scattered micro-interactions

### Spatial Composition
- Unexpected layouts
- Asymmetry
- Overlap
- Diagonal flow
- Grid-breaking elements
- Generous negative space OR controlled density

### Backgrounds & Visual Details
Create atmosphere:
- Gradient meshes
- Noise textures
- Geometric patterns
- Layered transparencies
- Dramatic shadows
- Decorative borders
- Custom cursors
- Grain overlays

## What NOT to Do

**NEVER create generic AI aesthetics:**
- Overused font families
- Clichéd color schemes
- Predictable component patterns
- Cookie-cutter layouts
- Same design twice

**NEVER converge** on common choices across generations.

## Implementation Examples

### Bold Maximalist (React + Tailwind)
```tsx
export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-fuchsia-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-80 h-80 bg-cyan-400 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content with diagonal composition */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-32">
        <h1 className="font-clash text-[12vw] leading-[0.85] text-white mix-blend-difference">
          BREAK
          <span className="block -translate-x-20">THE</span>
          <span className="block translate-x-32 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
            RULES
          </span>
        </h1>
      </div>

      {/* Noise overlay */}
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
    </section>
  );
}
```

### Refined Minimal (HTML + CSS)
```html
<section class="hero">
  <h1 class="hero-title">
    <span class="hero-title-line">Quiet</span>
    <span class="hero-title-line hero-title-line--accent">Excellence</span>
  </h1>
</section>

<style>
.hero {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: hsl(0 0% 98%);
}

.hero-title {
  font-family: 'Editorial New', serif;
  font-size: clamp(3rem, 15vw, 12rem);
  font-weight: 300;
  letter-spacing: -0.04em;
  line-height: 0.9;
  text-align: center;
}

.hero-title-line {
  display: block;
  opacity: 0;
  animation: fadeUp 1.2s ease-out forwards;
}

.hero-title-line--accent {
  font-style: italic;
  color: hsl(15 80% 50%);
  animation-delay: 0.2s;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
```

## Output Checklist

Before delivering:
- [ ] Clear aesthetic direction (documented)
- [ ] No generic fonts (Inter, Roboto, Arial)
- [ ] No cliché colors (purple gradients)
- [ ] At least one memorable detail
- [ ] Production-ready code
- [ ] Responsive design
- [ ] Accessibility basics (focus states, alt text)

## Match Complexity to Vision

| Vision | Implementation |
|--------|----------------|
| Maximalist | Elaborate code, extensive animations, layered effects |
| Minimalist | Restraint, precision, perfect spacing, subtle details |

Elegance = executing the vision well.

## Sources

- [Anthropic Frontend Design Skill](https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md)
- [Refactoring UI](https://www.refactoringui.com/)
