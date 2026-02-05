---
name: tdd
description: Test-Driven Development workflow enforcing Red-Green-Refactor cycle. Use when implementing new features or fixing bugs.
---

# Test-Driven Development Skill

Enforce the Red-Green-Refactor cycle for all feature development.

## Invocation

```
/tdd [feature description]
```

Or naturally: "use TDD for this", "test first", "red green refactor"

## The TDD Cycle

### 1. RED Phase (Write Failing Test)

**Goal:** Write a test that fails because the feature doesn't exist yet.

```
Write a FAILING test for [feature].
Do NOT write implementation yet.
The test should reference functions/methods that don't exist.
```

**Checklist:**
- [ ] Test describes expected behavior
- [ ] Test uses Arrange-Act-Assert pattern
- [ ] Test name clearly states what's being tested
- [ ] Running tests produces RED (failure)

### 2. GREEN Phase (Minimal Implementation)

**Goal:** Write the minimum code to make the test pass.

```
Implement the MINIMUM code to make these tests pass.
Only write enough code to pass the current tests.
Do not over-engineer or add features not covered by tests.
```

**Checklist:**
- [ ] All tests pass (GREEN)
- [ ] No extra code beyond what tests require
- [ ] No premature optimization

### 3. REFACTOR Phase (Improve Code)

**Goal:** Clean up the code while keeping tests green.

```
Refactor the implementation to improve code quality.
Tests MUST stay green after refactoring.
Focus on: readability, DRY, naming, structure.
```

**Checklist:**
- [ ] All tests still pass
- [ ] Code is cleaner/more readable
- [ ] No behavior changes

## Instructions for Claude

When this skill is invoked:

### Step 1: Understand the Feature
- Parse the feature description
- Identify edge cases and error conditions
- List the behaviors to test

### Step 2: RED Phase
```javascript
// Create test file
// Example: tests/feature.test.js

describe('Feature', () => {
    it('should [expected behavior]', () => {
        // Arrange
        const input = ...;

        // Act
        const result = featureFunction(input);

        // Assert
        expect(result).toBe(expected);
    });

    it('should handle edge case', () => {
        // Test edge cases
    });

    it('should throw on invalid input', () => {
        // Test error handling
    });
});
```

- Run tests to confirm they FAIL
- Output: "RED: X tests failing as expected"

### Step 3: GREEN Phase
- Write minimal implementation
- Run tests to confirm they PASS
- Output: "GREEN: All X tests passing"

### Step 4: REFACTOR Phase
- Identify improvement opportunities
- Apply refactoring
- Run tests to confirm still GREEN
- Output: "REFACTOR: Code improved, all tests still passing"

### Step 5: Repeat
- If more behaviors needed, return to RED phase
- Continue until feature is complete

## Test Patterns

### Arrange-Act-Assert (AAA)
```javascript
it('should calculate total with tax', () => {
    // Arrange
    const cart = new Cart();
    cart.addItem({ price: 100 });

    // Act
    const total = cart.getTotal({ includeTax: true });

    // Assert
    expect(total).toBe(113); // 100 + 13% tax
});
```

### Given-When-Then (BDD)
```javascript
describe('Given a cart with items', () => {
    describe('When calculating total with tax', () => {
        it('Then should include 13% tax', () => {
            // ...
        });
    });
});
```

## Anti-Patterns to Avoid

| Bad | Good |
|-----|------|
| Writing implementation first | Always write test first |
| Combining RED + GREEN phases | Separate into distinct steps |
| Skipping REFACTOR phase | Always complete all three phases |
| Testing implementation details | Test behavior, not internals |
| Large tests with many assertions | One concept per test |

## Framework-Specific Notes

### JavaScript/TypeScript
- Jest, Vitest, or Mocha
- Use `describe`/`it` blocks
- Mock external dependencies

### PHP
- PHPUnit
- Use `@test` annotations or `test` prefix
- Mock database with in-memory SQLite

### Python
- pytest
- Use `test_` prefix
- Fixtures for setup

## Output Format

```
=== TDD: [Feature Name] ===

RED Phase:
- Created tests/feature.test.js
- 3 tests written
- Status: FAILING (as expected)

GREEN Phase:
- Created src/feature.js
- Minimal implementation
- Status: ALL PASSING

REFACTOR Phase:
- Extracted helper function
- Improved variable names
- Status: ALL PASSING

Coverage: 100% for new code
```

## Integration with TodoWrite

Track each phase as separate todos:
1. [RED] Write failing tests for [feature]
2. [GREEN] Implement [feature] to pass tests
3. [REFACTOR] Clean up [feature] implementation

## Sources

- [TDD with Claude Code Guide](https://github.com/FlorianBruniaux/claude-code-ultimate-guide)
- [Claude Flow TDD](https://github.com/ruvnet/claude-flow/wiki/CLAUDE-MD-TDD)
- [TDD Guard](https://github.com/nizos/tdd-guard)
