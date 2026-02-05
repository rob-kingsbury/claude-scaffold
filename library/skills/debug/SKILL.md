---
name: debug
description: Systematic debugging workflow for any bug, test failure, or unexpected behavior. Use when something isn't working.
---

# Debug Skill

Methodical debugging approach to identify and fix issues efficiently.

## Invocation

```
/debug [description of problem]
```

Or naturally: "debug this", "why isn't this working", "fix this error"

## The Debugging Process

### 1. REPRODUCE
Confirm you can reproduce the issue consistently.

### 2. ISOLATE
Narrow down where the problem occurs.

### 3. IDENTIFY
Find the root cause (not just symptoms).

### 4. FIX
Implement the minimal fix.

### 5. VERIFY
Confirm the fix works and doesn't break other things.

## Instructions for Claude

### Step 1: Gather Information

```
Questions to answer:
- What is the expected behavior?
- What is the actual behavior?
- When did it start happening?
- What changed recently?
- Is it reproducible? How?
- Are there error messages?
```

### Step 2: Reproduce the Issue

**For runtime errors:**
```bash
# Run the failing code
npm run dev
# or
php script.php
# or
python main.py
```

**For test failures:**
```bash
# Run specific test
npm test -- --grep "failing test name"
# or
phpunit --filter testMethodName
# or
pytest -k "test_name" -v
```

**For UI issues:**
- Open in browser
- Check console for errors
- Check network tab for failed requests

### Step 3: Isolate the Problem

**Binary search approach:**
1. Find a known working state (git commit, code version)
2. Find the broken state
3. Test halfway between
4. Repeat until you find the breaking change

```bash
# Git bisect for regression hunting
git bisect start
git bisect bad HEAD
git bisect good abc123  # known good commit
# Git will checkout middle commit, test and mark good/bad
```

**Print debugging:**
```javascript
// Add strategic logging
console.log('=== DEBUG ===');
console.log('Input:', JSON.stringify(input, null, 2));
console.log('State:', this.state);
console.log('=============');
```

**Simplify:**
- Comment out code sections
- Use hardcoded values instead of dynamic
- Test smallest possible case

### Step 4: Identify Root Cause

Common root causes:

| Symptom | Likely Cause |
|---------|--------------|
| "undefined is not a function" | Wrong import, typo, missing dependency |
| "Cannot read property of null" | Missing null check, race condition |
| Silent failure | Swallowed error, missing await |
| Works locally, fails in prod | Environment difference, missing env var |
| Intermittent failure | Race condition, timing issue |
| Works for some users | Browser/device difference, permissions |

### Step 5: Implement Fix

**Rules:**
- Fix the root cause, not symptoms
- Keep the fix minimal
- Don't refactor while fixing
- Add a test for the bug

```javascript
// BEFORE: The bug
function getUser(id) {
    return users.find(u => u.id === id).name; // crashes if not found
}

// AFTER: The fix
function getUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return null; // handle not found
    return user.name;
}

// TEST: Prevent regression
it('should return null for non-existent user', () => {
    expect(getUser('nonexistent')).toBeNull();
});
```

### Step 6: Verify Fix

1. **Reproduce the bug again** - it should be fixed
2. **Run all tests** - nothing else should break
3. **Test related functionality** - check for side effects

```bash
# Run full test suite
npm test

# Run specific tests for affected area
npm test -- --grep "user"
```

## Debugging Tools

### JavaScript/Node
```javascript
// Debugger statement
debugger;

// Console methods
console.log(value);
console.table(array);
console.trace(); // stack trace
console.time('label'); // timing
```

### PHP
```php
// Print and die
dd($variable);

// Print without dying
dump($variable);

// Xdebug (in IDE)
```

### Python
```python
# Built-in debugger
import pdb; pdb.set_trace()

# Print
print(f"DEBUG: {variable=}")

# IPython debugger (better)
import ipdb; ipdb.set_trace()
```

### Browser
- DevTools Console (errors, logs)
- Network tab (failed requests)
- Sources tab (breakpoints)
- React DevTools (component state)

## Common Bug Patterns

### Off-by-One Errors
```javascript
// Bug: skips last item
for (let i = 0; i < arr.length - 1; i++)

// Fix
for (let i = 0; i < arr.length; i++)
```

### Async/Await Missing
```javascript
// Bug: returns Promise, not value
function getData() {
    return fetch(url).then(r => r.json());
}
const data = getData(); // Promise, not data!

// Fix
const data = await getData();
```

### Reference vs Value
```javascript
// Bug: modifying original
function process(arr) {
    arr.push(item); // mutates original!
    return arr;
}

// Fix
function process(arr) {
    return [...arr, item]; // returns new array
}
```

### Null/Undefined Access
```javascript
// Bug: crashes if user is null
const name = user.profile.name;

// Fix: optional chaining
const name = user?.profile?.name ?? 'Unknown';
```

## Output Format

```markdown
# Debug Report: [Issue Description]

## Reproduction
- Steps to reproduce: [1, 2, 3]
- Reproducible: Yes/No/Intermittent

## Investigation

### Hypothesis 1: [Description]
- Test: [What I checked]
- Result: [What I found]
- Verdict: Confirmed/Ruled out

### Hypothesis 2: [Description]
...

## Root Cause
[Clear explanation of why the bug occurs]

## Fix
```diff
- old code
+ new code
```

## Verification
- [ ] Bug no longer reproduces
- [ ] All tests pass
- [ ] Added regression test
- [ ] No side effects observed

## Prevention
[How to prevent similar bugs in the future]
```

## Sources

- [Debugging Best Practices](https://jvns.ca/blog/2022/12/21/why-is-debugging-so-hard/)
- [Superpowers Skills](https://github.com/obra/superpowers)
