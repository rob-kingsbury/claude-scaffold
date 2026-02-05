---
name: accessibility
description: Accessibility (a11y) auditing and remediation. Ensures WCAG compliance and inclusive design for all users.
---

# Accessibility Skill

Ensure your application is usable by everyone through WCAG compliance.

## Invocation

```
/accessibility [audit|fix|report] [path]
```

Or naturally: "check accessibility", "fix a11y issues", "make this accessible"

## Commands

| Command | Description |
|---------|-------------|
| `/accessibility audit` | Full WCAG audit |
| `/accessibility fix <file>` | Fix issues in specific file |
| `/accessibility report` | Generate compliance report |

## WCAG 2.1 Quick Reference

### Level A (Minimum)

| Criterion | Requirement |
|-----------|-------------|
| 1.1.1 | Non-text content has text alternatives |
| 1.3.1 | Info and relationships are programmatic |
| 1.4.1 | Color is not only visual means |
| 2.1.1 | All functionality keyboard accessible |
| 2.4.1 | Bypass blocks (skip links) |
| 4.1.1 | Valid HTML parsing |
| 4.1.2 | Name, role, value for UI components |

### Level AA (Standard Target)

| Criterion | Requirement |
|-----------|-------------|
| 1.4.3 | Contrast ratio 4.5:1 (text), 3:1 (large) |
| 1.4.4 | Text resizable to 200% |
| 1.4.10 | Content reflows at 320px |
| 2.4.6 | Headings and labels describe purpose |
| 2.4.7 | Focus is visible |
| 3.2.3 | Navigation is consistent |
| 3.2.4 | Components identified consistently |

## Common Issues & Fixes

### Images

```html
<!-- BAD: No alt text -->
<img src="chart.png">

<!-- BAD: Uninformative alt -->
<img src="chart.png" alt="image">

<!-- GOOD: Descriptive alt -->
<img src="chart.png" alt="Sales chart showing 40% growth in Q4 2024">

<!-- GOOD: Decorative image -->
<img src="decorative-swirl.png" alt="" role="presentation">
```

### Forms

```html
<!-- BAD: No label -->
<input type="email" placeholder="Email">

<!-- GOOD: Explicit label -->
<label for="email">Email address</label>
<input type="email" id="email" name="email" aria-describedby="email-hint">
<span id="email-hint">We'll never share your email</span>

<!-- GOOD: Error handling -->
<input type="email" id="email" aria-invalid="true" aria-describedby="email-error">
<span id="email-error" role="alert">Please enter a valid email address</span>
```

### Buttons & Links

```html
<!-- BAD: Non-descriptive -->
<a href="/report">Click here</a>
<button>Submit</button>

<!-- GOOD: Descriptive -->
<a href="/report">View quarterly sales report</a>
<button>Submit contact form</button>

<!-- BAD: Div as button -->
<div onclick="submit()">Submit</div>

<!-- GOOD: Actual button -->
<button type="submit">Submit</button>

<!-- GOOD: Icon button with label -->
<button aria-label="Close dialog">
  <svg aria-hidden="true">...</svg>
</button>
```

### Headings

```html
<!-- BAD: Skipped heading levels -->
<h1>Page Title</h1>
<h3>Section</h3>  <!-- Skipped h2! -->

<!-- GOOD: Proper hierarchy -->
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>

<!-- BAD: Using heading for styling -->
<h4 class="small-text">Not actually a heading</h4>

<!-- GOOD: Use CSS for styling -->
<p class="small-text">Not a heading</p>
```

### Focus Management

```css
/* BAD: Removing focus indicator */
:focus {
  outline: none;
}

/* GOOD: Custom focus indicator */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* GOOD: Enhanced for dark backgrounds */
.dark-section :focus-visible {
  outline-color: white;
  box-shadow: 0 0 0 4px rgba(255,255,255,0.3);
}
```

### Color Contrast

```css
/* BAD: Low contrast (2.5:1) */
.muted-text {
  color: #999;  /* on white background */
}

/* GOOD: Meets AA (4.5:1) */
.muted-text {
  color: #767676;  /* on white background */
}

/* GOOD: For large text (3:1 minimum) */
.large-heading {
  color: #949494;  /* Acceptable for 24px+ bold */
}
```

## Instructions for Claude

### audit Command

1. **Scan for issues by category:**

   ```
   === ACCESSIBILITY AUDIT ===

   Critical (Level A violations):
   - 12 images missing alt text
   - 3 form inputs without labels
   - 2 buttons with no accessible name

   Serious (Level AA violations):
   - 8 text elements with insufficient contrast
   - 5 missing focus indicators
   - 1 page missing skip link

   Moderate:
   - 15 links with generic text ("click here", "read more")
   - 3 tables missing headers
   ```

2. **Provide specific file:line references:**

   ```
   ISSUES BY FILE:

   src/pages/Home.jsx:
   - Line 24: <img> missing alt attribute
   - Line 45: Button has no accessible name
   - Line 67: Form input missing label

   src/components/Card.jsx:
   - Line 12: Contrast ratio 3.2:1 (needs 4.5:1)
   ```

### fix Command

1. **Read the file**
2. **Apply fixes systematically:**

   ```
   Fixing: src/pages/Home.jsx

   Fixed 3 issues:
   - Line 24: Added alt="Featured product showcase"
   - Line 45: Added aria-label="Close modal"
   - Line 67: Added <label> element with for attribute
   ```

3. **Verify fixes don't break functionality**

### report Command

Generate WCAG compliance report:

```markdown
# Accessibility Compliance Report

**Project:** Example App
**Date:** 2024-01-15
**Standard:** WCAG 2.1 Level AA

## Summary

| Level | Pass | Fail | N/A |
|-------|------|------|-----|
| A | 23 | 2 | 5 |
| AA | 11 | 3 | 2 |

## Passing Criteria

### 1.1.1 Non-text Content
Status: PASS
All images have appropriate alt text.

### 2.1.1 Keyboard
Status: PASS
All interactive elements are keyboard accessible.

## Failing Criteria

### 1.4.3 Contrast (Minimum)
Status: FAIL
8 text elements below 4.5:1 contrast ratio.

Affected:
- .muted-text class (3.2:1)
- .placeholder text (2.8:1)

### 2.4.7 Focus Visible
Status: FAIL
Custom focus styles missing on 5 components.

## Recommendations

1. Update color palette to meet contrast requirements
2. Add focus-visible styles to all interactive elements
3. Implement skip link for keyboard navigation
```

## Testing Tools

### Automated
- axe DevTools
- Lighthouse
- WAVE
- Pa11y

### Manual Testing
- Keyboard-only navigation
- Screen reader (NVDA, VoiceOver, JAWS)
- Zoom to 200%
- Color contrast checkers

## Quick Keyboard Test

1. Tab through entire page - can you reach everything?
2. Press Enter/Space - do buttons and links work?
3. Press Escape - do modals close?
4. Arrow keys - do dropdowns and menus work?
5. Can you see where focus is at all times?

## Sources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Deque University](https://dequeuniversity.com/)
