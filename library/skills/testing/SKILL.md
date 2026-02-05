---
name: testing
description: Testing strategy and implementation. Covers unit, integration, and E2E testing patterns for reliable software.
---

# Testing Skill

Comprehensive testing strategies and implementation patterns.

## Invocation

```
/testing [strategy|unit|integration|e2e|coverage]
```

Or naturally: "write tests for this", "testing strategy", "improve coverage"

## Commands

| Command | Description |
|---------|-------------|
| `/testing strategy` | Design testing approach for project |
| `/testing unit <file>` | Write unit tests for file |
| `/testing integration` | Integration testing patterns |
| `/testing e2e` | End-to-end testing setup |
| `/testing coverage` | Analyze and improve coverage |

## Testing Pyramid

```
        /\
       /  \      E2E Tests (Few)
      /----\     - Critical user journeys
     /      \    - Slow, expensive
    /--------\
   /          \  Integration Tests (Some)
  /------------\ - API endpoints, database
 /              \- Component interactions
/----------------\
                  Unit Tests (Many)
                  - Fast, isolated
                  - Business logic
```

## Test Types

### Unit Tests
- Test single functions/methods in isolation
- Mock external dependencies
- Fast execution (< 1ms per test)
- High coverage of business logic

### Integration Tests
- Test component interactions
- Real database (test instance)
- API endpoint testing
- Moderate execution time

### E2E Tests
- Test complete user flows
- Real browser automation
- Slowest but most realistic
- Cover critical paths only

## Instructions for Claude

### strategy Command

1. **Analyze project structure:**
   ```
   === TESTING STRATEGY ===

   Project: E-commerce API
   Stack: Node.js, Express, PostgreSQL

   Current State:
   - Tests: 45 unit, 12 integration, 0 E2E
   - Coverage: 62%
   - CI: GitHub Actions

   Recommended Testing Stack:
   - Unit: Jest
   - Integration: Jest + Supertest
   - E2E: Playwright
   - Mocking: Jest mocks + MSW
   ```

2. **Identify testing priorities:**
   ```
   PRIORITY AREAS:

   High (Business Critical):
   - Payment processing
   - User authentication
   - Order management

   Medium (Core Features):
   - Product search
   - Cart operations
   - User profiles

   Lower (Supporting):
   - Admin reports
   - Email templates
   - Logging utilities
   ```

3. **Recommend test distribution:**
   ```
   RECOMMENDED DISTRIBUTION:

   Unit Tests:
   - lib/payment.js (currently 0%, target 90%)
   - lib/auth.js (currently 45%, target 85%)
   - lib/orders.js (currently 30%, target 80%)

   Integration Tests:
   - POST /api/checkout (not tested)
   - Auth flow (partial)
   - Order lifecycle (not tested)

   E2E Tests:
   - Complete purchase flow
   - User registration/login
   - Password reset
   ```

### unit Command

Write unit tests following AAA pattern:

```javascript
// Example: Testing a price calculator

describe('PriceCalculator', () => {
  describe('calculateTotal', () => {
    it('calculates total for single item', () => {
      // Arrange
      const calculator = new PriceCalculator();
      const items = [{ price: 10.00, quantity: 2 }];

      // Act
      const total = calculator.calculateTotal(items);

      // Assert
      expect(total).toBe(20.00);
    });

    it('applies percentage discount correctly', () => {
      // Arrange
      const calculator = new PriceCalculator();
      const items = [{ price: 100.00, quantity: 1 }];
      const discount = { type: 'percentage', value: 10 };

      // Act
      const total = calculator.calculateTotal(items, discount);

      // Assert
      expect(total).toBe(90.00);
    });

    it('throws error for negative quantities', () => {
      // Arrange
      const calculator = new PriceCalculator();
      const items = [{ price: 10.00, quantity: -1 }];

      // Act & Assert
      expect(() => calculator.calculateTotal(items))
        .toThrow('Quantity must be positive');
    });
  });
});
```

### integration Command

```javascript
// Example: Testing API endpoint

describe('POST /api/orders', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Setup test database
    await db.migrate.latest();
    testUser = await createTestUser();
    authToken = generateToken(testUser);
  });

  afterAll(async () => {
    await db.destroy();
  });

  beforeEach(async () => {
    // Clean orders table between tests
    await db('orders').delete();
  });

  it('creates order with valid items', async () => {
    // Arrange
    const orderData = {
      items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 }
      ],
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        zip: '12345'
      }
    };

    // Act
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send(orderData);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.orderId).toBeDefined();

    // Verify database state
    const order = await db('orders')
      .where('id', response.body.data.orderId)
      .first();
    expect(order.user_id).toBe(testUser.id);
    expect(order.status).toBe('pending');
  });

  it('rejects order without authentication', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({ items: [] });

    expect(response.status).toBe(401);
  });

  it('rejects order with invalid product', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        items: [{ productId: 99999, quantity: 1 }]
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Product not found');
  });
});
```

### e2e Command

```javascript
// Example: Playwright E2E test

import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('complete purchase flow', async ({ page }) => {
    // Add item to cart
    await page.goto('/products/1');
    await page.click('button:has-text("Add to Cart")');
    await expect(page.locator('.cart-count')).toHaveText('1');

    // Go to checkout
    await page.click('a:has-text("Cart")');
    await page.click('button:has-text("Checkout")');

    // Fill shipping
    await page.fill('[name="address"]', '123 Test St');
    await page.fill('[name="city"]', 'Test City');
    await page.fill('[name="zip"]', '12345');
    await page.click('button:has-text("Continue")');

    // Fill payment (test card)
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.fill('[name="expiry"]', '12/25');
    await page.fill('[name="cvc"]', '123');

    // Complete order
    await page.click('button:has-text("Place Order")');

    // Verify success
    await expect(page).toHaveURL(/\/orders\/\d+/);
    await expect(page.locator('h1')).toContainText('Order Confirmed');
  });
});
```

### coverage Command

```
=== COVERAGE ANALYSIS ===

Overall: 62% (Target: 80%)

By Directory:
- lib/         78% ████████░░
- api/         65% ███████░░░
- utils/       89% █████████░
- services/    45% █████░░░░░ ⚠️

Uncovered Critical Paths:
1. lib/payment.js:45-67 (refund processing)
2. api/orders.js:120-145 (order cancellation)
3. services/email.js:23-89 (entire file)

Recommendations:
1. Add tests for payment refunds (high risk)
2. Test order cancellation edge cases
3. Mock email service for testing
```

## Testing Patterns

### Factory Pattern

```javascript
// tests/factories/user.js
export function createUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    createdAt: new Date(),
    ...overrides
  };
}

// Usage in tests
const user = createUser({ role: 'admin' });
```

### Test Fixtures

```javascript
// tests/fixtures/orders.js
export const validOrder = {
  items: [
    { productId: 1, quantity: 2, price: 29.99 }
  ],
  shipping: {
    method: 'standard',
    address: { /* ... */ }
  }
};

export const invalidOrder = {
  items: [] // Empty cart
};
```

### Mock Patterns

```javascript
// Mocking external API
jest.mock('../lib/stripe', () => ({
  createCharge: jest.fn().mockResolvedValue({
    id: 'ch_test123',
    status: 'succeeded'
  })
}));

// Mocking database
jest.mock('../lib/db', () => ({
  query: jest.fn(),
  transaction: jest.fn(cb => cb({ query: jest.fn() }))
}));
```

## Framework Quick Reference

| Framework | Stack | Command |
|-----------|-------|---------|
| Jest | Node.js | `npm test` |
| Vitest | Vite/Vue/React | `npm test` |
| PHPUnit | PHP | `./vendor/bin/phpunit` |
| Pytest | Python | `pytest` |
| Playwright | E2E (any) | `npx playwright test` |
| Cypress | E2E (any) | `npx cypress run` |

## Sources

- [Testing JavaScript](https://testingjavascript.com/)
- [Playwright Docs](https://playwright.dev/)
- [Jest Docs](https://jestjs.io/)
- [The Art of Unit Testing](https://www.manning.com/books/the-art-of-unit-testing-third-edition)
