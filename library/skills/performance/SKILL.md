---
name: performance
description: Performance analysis and optimization for web applications. Identifies bottlenecks and provides actionable fixes for frontend and backend performance.
---

# Performance Skill

Analyze and optimize application performance systematically.

## Invocation

```
/performance [analyze|frontend|backend|database] [target]
```

Or naturally: "optimize this", "why is it slow", "improve performance"

## Commands

| Command | Description |
|---------|-------------|
| `/performance analyze` | Full performance audit |
| `/performance frontend` | Frontend-specific analysis |
| `/performance backend` | Backend/API analysis |
| `/performance database` | Database query optimization |

## Performance Checklist

### Frontend Performance

```yaml
critical_path:
  - [ ] Minimize render-blocking resources
  - [ ] Inline critical CSS
  - [ ] Defer non-critical JavaScript
  - [ ] Optimize Largest Contentful Paint (LCP)

assets:
  - [ ] Images optimized (WebP, proper sizing)
  - [ ] Lazy loading for below-fold images
  - [ ] CSS/JS minified and compressed
  - [ ] Fonts subset and preloaded

caching:
  - [ ] Browser caching headers set
  - [ ] Service worker for static assets
  - [ ] CDN for static resources

javascript:
  - [ ] Bundle size analyzed
  - [ ] Code splitting implemented
  - [ ] Tree shaking enabled
  - [ ] No memory leaks
```

### Backend Performance

```yaml
api_responses:
  - [ ] Response times < 200ms (p95)
  - [ ] Gzip/Brotli compression enabled
  - [ ] Appropriate caching headers
  - [ ] Pagination for large datasets

code_efficiency:
  - [ ] N+1 queries eliminated
  - [ ] Expensive operations cached
  - [ ] Background jobs for heavy processing
  - [ ] Connection pooling configured

infrastructure:
  - [ ] Appropriate server resources
  - [ ] Load balancing if needed
  - [ ] Database read replicas if needed
  - [ ] CDN for API responses where appropriate
```

### Database Performance

```yaml
queries:
  - [ ] All queries use indexes
  - [ ] No SELECT *
  - [ ] Appropriate JOIN strategy
  - [ ] Query execution plans reviewed

indexes:
  - [ ] Indexes on foreign keys
  - [ ] Composite indexes for common queries
  - [ ] No unused indexes
  - [ ] Regular index maintenance

schema:
  - [ ] Appropriate data types
  - [ ] Normalized where appropriate
  - [ ] Denormalized for read performance
  - [ ] Partitioning for large tables
```

## Instructions for Claude

### analyze Command

1. **Gather metrics:**
   ```
   === PERFORMANCE ANALYSIS ===

   Frontend:
   - First Contentful Paint: 1.8s (target: < 1.0s)
   - Largest Contentful Paint: 3.2s (target: < 2.5s)
   - Total Bundle Size: 1.2MB (target: < 500KB)

   Backend:
   - Average API response: 340ms (target: < 200ms)
   - Slowest endpoint: GET /api/reports (1.2s)
   - Database queries per request: 12 avg

   Database:
   - Slow queries: 3 identified
   - Missing indexes: 2 suggested
   - Table sizes: orders (2.1M rows), users (50K rows)
   ```

2. **Identify bottlenecks:**
   ```
   TOP BOTTLENECKS:

   1. [HIGH] GET /api/reports - 1.2s response
      - Cause: Full table scan on orders table
      - Fix: Add index on orders(created_at, status)

   2. [MEDIUM] JavaScript bundle - 1.2MB
      - Cause: Moment.js (300KB), lodash full import
      - Fix: Use date-fns, import specific lodash functions

   3. [MEDIUM] N+1 on user profiles
      - Cause: Loop fetching avatar for each user
      - Fix: Eager load avatars with users query
   ```

3. **Provide fixes:**
   - Specific code changes
   - Configuration updates
   - Architecture recommendations

### frontend Command

1. **Analyze bundle:**
   ```
   BUNDLE ANALYSIS:

   Total: 1.2MB (gzipped: 380KB)

   Largest dependencies:
   - moment.js: 287KB (replace with date-fns: 12KB)
   - lodash: 72KB (use specific imports)
   - chart.js: 65KB (lazy load)
   - react-icons: 45KB (import specific icons)
   ```

2. **Check Core Web Vitals:**
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

3. **Recommend optimizations:**
   ```javascript
   // Before: imports entire lodash
   import _ from 'lodash';

   // After: import specific functions
   import debounce from 'lodash/debounce';
   import throttle from 'lodash/throttle';
   ```

### backend Command

1. **Profile endpoints:**
   ```
   ENDPOINT PERFORMANCE:

   Fast (< 100ms):
   - GET /api/user/me (45ms)
   - POST /api/auth/login (78ms)

   Acceptable (100-200ms):
   - GET /api/products (156ms)
   - POST /api/orders (189ms)

   Slow (> 200ms):
   - GET /api/reports (1.2s) ⚠️
   - GET /api/analytics/dashboard (890ms) ⚠️
   ```

2. **Check for common issues:**
   - Missing caching
   - Synchronous operations that could be async
   - Unnecessary database queries
   - Large payload responses

### database Command

1. **Analyze slow queries:**
   ```sql
   -- SLOW QUERY IDENTIFIED
   -- Execution time: 2.3s
   -- Rows scanned: 2,100,000

   SELECT * FROM orders
   WHERE created_at > '2024-01-01'
   AND status = 'pending';

   -- RECOMMENDED FIX
   -- Add composite index:
   CREATE INDEX idx_orders_created_status
   ON orders(created_at, status);

   -- Expected improvement: 2.3s → 0.05s
   ```

2. **Check index usage:**
   ```
   INDEX ANALYSIS:

   Missing indexes:
   - orders(created_at, status) - used by 15 queries
   - sessions(user_id, expires_at) - used by 8 queries

   Unused indexes (candidates for removal):
   - idx_users_legacy_id - 0 uses in 30 days
   - idx_orders_old_status - 0 uses in 30 days
   ```

## Optimization Patterns

### Caching Strategy

```php
// Before: Query on every request
function getPopularProducts() {
    return db_query("SELECT * FROM products ORDER BY sales DESC LIMIT 10");
}

// After: Cache for 5 minutes
function getPopularProducts() {
    $cacheKey = 'popular_products';
    $cached = cache_get($cacheKey);

    if ($cached) return $cached;

    $products = db_query("SELECT * FROM products ORDER BY sales DESC LIMIT 10");
    cache_set($cacheKey, $products, 300);

    return $products;
}
```

### N+1 Query Fix

```php
// Before: N+1 queries
$orders = db_query("SELECT * FROM orders WHERE user_id = ?", [$userId]);
foreach ($orders as &$order) {
    $order['items'] = db_query("SELECT * FROM order_items WHERE order_id = ?", [$order['id']]);
}

// After: Single query with JOIN
$orders = db_query("
    SELECT o.*, oi.product_id, oi.quantity, oi.price
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = ?
", [$userId]);
```

### Pagination

```php
// Before: Load everything
$users = db_query("SELECT * FROM users");

// After: Paginate
$page = $_GET['page'] ?? 1;
$limit = 20;
$offset = ($page - 1) * $limit;

$users = db_query("SELECT * FROM users LIMIT ? OFFSET ?", [$limit, $offset]);
$total = db_query_one("SELECT COUNT(*) as count FROM users")['count'];
```

## Tools Integration

- **Frontend:** Lighthouse, WebPageTest, Bundle Analyzer
- **Backend:** Xdebug, Blackfire, New Relic
- **Database:** EXPLAIN ANALYZE, slow query log, pt-query-digest

## Sources

- [web.dev Performance](https://web.dev/performance/)
- [High Performance MySQL](https://www.oreilly.com/library/view/high-performance-mysql/9781492080503/)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
