---
name: refactor
description: Code refactoring patterns and techniques. Safely improve code structure without changing behavior.
---

# Refactor Skill

Systematically improve code structure while preserving behavior.

## Invocation

```
/refactor [analyze|extract|rename|inline] [target]
```

Or naturally: "refactor this", "extract this to a function", "clean up this code"

## Commands

| Command | Description |
|---------|-------------|
| `/refactor analyze <file>` | Identify refactoring opportunities |
| `/refactor extract <selection>` | Extract to function/method/component |
| `/refactor rename <symbol>` | Rename with all references |
| `/refactor inline <function>` | Inline function body |

## Golden Rules

1. **Never refactor and add features simultaneously**
2. **Tests must pass before AND after**
3. **Small, incremental changes**
4. **Commit after each successful refactoring**

## Common Refactoring Patterns

### Extract Function

```javascript
// Before: Long function with mixed concerns
function processOrder(order) {
  // Validation (lines 1-15)
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must have items');
  }
  if (!order.customerId) {
    throw new Error('Customer ID required');
  }

  // Calculate totals (lines 16-30)
  let subtotal = 0;
  for (const item of order.items) {
    subtotal += item.price * item.quantity;
  }
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // Save order (lines 31-45)
  // ...
}

// After: Extracted functions
function validateOrder(order) {
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must have items');
  }
  if (!order.customerId) {
    throw new Error('Customer ID required');
  }
}

function calculateOrderTotals(items) {
  const subtotal = items.reduce((sum, item) =>
    sum + item.price * item.quantity, 0
  );
  const tax = subtotal * 0.1;
  return { subtotal, tax, total: subtotal + tax };
}

function processOrder(order) {
  validateOrder(order);
  const totals = calculateOrderTotals(order.items);
  // Save order...
}
```

### Replace Conditional with Polymorphism

```javascript
// Before: Switch statement
function calculateShipping(order) {
  switch (order.shippingMethod) {
    case 'standard':
      return order.weight * 0.5;
    case 'express':
      return order.weight * 1.5 + 10;
    case 'overnight':
      return order.weight * 3 + 25;
    default:
      throw new Error('Unknown shipping method');
  }
}

// After: Strategy pattern
const shippingStrategies = {
  standard: (order) => order.weight * 0.5,
  express: (order) => order.weight * 1.5 + 10,
  overnight: (order) => order.weight * 3 + 25
};

function calculateShipping(order) {
  const strategy = shippingStrategies[order.shippingMethod];
  if (!strategy) throw new Error('Unknown shipping method');
  return strategy(order);
}
```

### Replace Magic Numbers with Constants

```javascript
// Before: Magic numbers
function isEligibleForDiscount(customer) {
  return customer.orderCount >= 10 && customer.totalSpent >= 500;
}

// After: Named constants
const LOYALTY_ORDER_THRESHOLD = 10;
const LOYALTY_SPEND_THRESHOLD = 500;

function isEligibleForDiscount(customer) {
  return customer.orderCount >= LOYALTY_ORDER_THRESHOLD
      && customer.totalSpent >= LOYALTY_SPEND_THRESHOLD;
}
```

### Flatten Nested Conditionals

```javascript
// Before: Deeply nested
function processPayment(payment) {
  if (payment) {
    if (payment.amount > 0) {
      if (payment.method === 'card') {
        if (payment.card.isValid()) {
          return chargeCard(payment);
        } else {
          throw new Error('Invalid card');
        }
      } else {
        return processOtherPayment(payment);
      }
    } else {
      throw new Error('Amount must be positive');
    }
  } else {
    throw new Error('Payment required');
  }
}

// After: Guard clauses with early returns
function processPayment(payment) {
  if (!payment) {
    throw new Error('Payment required');
  }
  if (payment.amount <= 0) {
    throw new Error('Amount must be positive');
  }
  if (payment.method !== 'card') {
    return processOtherPayment(payment);
  }
  if (!payment.card.isValid()) {
    throw new Error('Invalid card');
  }

  return chargeCard(payment);
}
```

### Extract Component (React)

```jsx
// Before: Monolithic component
function UserDashboard({ user }) {
  return (
    <div className="dashboard">
      <div className="user-header">
        <img src={user.avatar} alt={user.name} />
        <h1>{user.name}</h1>
        <p>{user.email}</p>
      </div>
      <div className="stats">
        <div className="stat">
          <span className="stat-value">{user.orderCount}</span>
          <span className="stat-label">Orders</span>
        </div>
        <div className="stat">
          <span className="stat-value">${user.totalSpent}</span>
          <span className="stat-label">Total Spent</span>
        </div>
      </div>
      {/* ... more sections */}
    </div>
  );
}

// After: Extracted components
function UserHeader({ user }) {
  return (
    <div className="user-header">
      <img src={user.avatar} alt={user.name} />
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function UserStats({ user }) {
  return (
    <div className="stats">
      <StatCard value={user.orderCount} label="Orders" />
      <StatCard value={`$${user.totalSpent}`} label="Total Spent" />
    </div>
  );
}

function UserDashboard({ user }) {
  return (
    <div className="dashboard">
      <UserHeader user={user} />
      <UserStats user={user} />
    </div>
  );
}
```

## Instructions for Claude

### analyze Command

```
=== REFACTORING ANALYSIS ===

File: src/services/orderService.js

Code Smells Detected:

1. LONG FUNCTION (processOrder, 89 lines)
   - Multiple responsibilities
   - Suggested: Extract validation, calculation, persistence

2. DUPLICATE CODE (lines 45-52, 78-85)
   - Same discount calculation in two places
   - Suggested: Extract calculateDiscount()

3. MAGIC NUMBERS
   - Line 23: 0.1 (tax rate)
   - Line 67: 500 (discount threshold)
   - Suggested: Extract to constants

4. DEEP NESTING (lines 30-50)
   - 4 levels of nested conditionals
   - Suggested: Guard clauses with early returns

5. DEAD CODE (lines 92-105)
   - Function legacyProcess() never called
   - Suggested: Remove if confirmed unused

Complexity Score: 7/10 (Needs refactoring)
```

### extract Command

1. Identify the code to extract
2. Determine inputs and outputs
3. Create new function/method
4. Replace original code with call
5. Verify tests pass

### rename Command

1. Find all references to symbol
2. Preview changes
3. Apply rename across codebase
4. Update imports/exports
5. Verify no broken references

## Refactoring Checklist

Before refactoring:
- [ ] Tests exist and pass
- [ ] Code is in version control
- [ ] Understand current behavior

During refactoring:
- [ ] One change at a time
- [ ] Run tests after each change
- [ ] Commit frequently

After refactoring:
- [ ] All tests still pass
- [ ] Behavior unchanged
- [ ] Code more readable
- [ ] No new complexity introduced

## When NOT to Refactor

- No tests exist (write tests first)
- Under time pressure for a release
- Code is being replaced soon
- You don't understand what it does
- It ain't broke (and you're not adding features)

## Sources

- [Refactoring (Martin Fowler)](https://refactoring.com/)
- [Clean Code (Robert Martin)](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
- [Refactoring Guru](https://refactoring.guru/)
