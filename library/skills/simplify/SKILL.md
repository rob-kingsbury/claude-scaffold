---
name: simplify
description: Refactor code for clarity without changing functionality. Based on Anthropic's code-simplifier.
---

# Simplify Skill

Refactor code to improve readability and maintainability without changing behavior.

## Invocation

```
/simplify [file]
```

Or naturally: "simplify this", "clean up this code", "refactor for clarity"

## Core Principle

**NEVER change what the code does—only how it does it.**

All original features, outputs, and behaviors MUST remain intact.

## What It Does

1. **Reduces nesting** with early returns
2. **Eliminates redundant variables**
3. **Improves naming** for clarity
4. **Consolidates related logic**
5. **Removes obvious comments** (code should be self-documenting)
6. **Simplifies conditionals** (but no nested ternaries)

## What It Does NOT Do

- Change functionality
- Create clever one-liners that sacrifice readability
- Remove helpful abstractions
- Combine unrelated concerns
- Optimize for line count over comprehension

## Instructions for Claude

When this skill is invoked:

### 1. Read the Target File
Read the entire file to understand context.

### 2. Identify Simplification Opportunities

**Early returns:**
```php
// Before
function process($data) {
    if ($data) {
        if ($data->isValid()) {
            // 20 lines of logic
        }
    }
}

// After
function process($data) {
    if (!$data) return;
    if (!$data->isValid()) return;

    // 20 lines of logic (no nesting)
}
```

**Redundant variables:**
```javascript
// Before
const result = getData();
return result;

// After
return getData();
```

**Improved naming:**
```javascript
// Before
const d = new Date();
const x = users.filter(u => u.a);

// After
const now = new Date();
const activeUsers = users.filter(user => user.isActive);
```

**Consolidated logic:**
```javascript
// Before
if (status === 'pending') return 'yellow';
if (status === 'active') return 'green';
if (status === 'inactive') return 'gray';

// After
const statusColors = { pending: 'yellow', active: 'green', inactive: 'gray' };
return statusColors[status] ?? 'gray';
```

### 3. Verify Behavior Unchanged

Before applying changes:
- Trace the logic path
- Confirm all edge cases handled identically
- If uncertain, don't change it

### 4. Apply Changes

Use the Edit tool to make changes.

### 5. Output Summary

```
=== SIMPLIFICATION COMPLETE ===

File: [path]

Changes:
- [line X] Early return reduced nesting
- [line Y] Renamed 'x' to 'activeUsers'
- [line Z] Consolidated status color lookup

Lines: [before] → [after] ([diff])

Behavior: UNCHANGED (verified)
```

## When NOT to Simplify

- Working code that's already clear
- Code you didn't just modify (unless explicitly asked)
- Performance-critical sections (without profiling)
- Code with complex invariants you don't fully understand

## Limit Scope

Only refine recently modified code unless explicitly asked to audit broader sections.
