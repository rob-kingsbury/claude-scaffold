# Database Query Rules

**DO NOT REMOVE** - These rules prevent query errors from column name mismatches.

## Before Writing ANY Database Query

1. **Read `.claude/schema.md` first** - This is the authoritative schema reference
2. **Verify column names exist** - Never assume a column exists
3. **Use exact column names** - Copy from schema.md, don't guess

## Golden Rules

### 1. Always Use Prepared Statements

```php
// GOOD: Parameterized query
$user = dbQueryOne("SELECT * FROM users WHERE id = ?", [$id]);

// BAD: String interpolation (SQL injection risk)
$user = dbQueryOne("SELECT * FROM users WHERE id = $id");
```

```javascript
// GOOD: Parameterized (Supabase)
const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId);

// GOOD: Prepared statement (raw SQL)
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### 2. Validate Before Querying

```php
// Validate input type
$id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
if ($id === false) {
    return jsonError('Invalid ID');
}

// Then query
$user = dbQueryOne("SELECT * FROM users WHERE id = ?", [$id]);
```

### 3. Use Specific Column Names

```sql
-- GOOD: Explicit columns
SELECT id, name, email, created_at FROM users WHERE id = ?

-- BAD: SELECT * (fragile, wastes bandwidth)
SELECT * FROM users WHERE id = ?
```

### 4. Handle NULL Properly

```sql
-- GOOD: Explicit NULL check
SELECT * FROM users WHERE deleted_at IS NULL

-- BAD: Equality check (never matches NULL)
SELECT * FROM users WHERE deleted_at = NULL
```

---

## Common Pitfalls

| Issue | Wrong | Correct |
|-------|-------|---------|
| Computed columns | `SELECT name FROM table` (if no `name` column) | `SELECT CONCAT(first, ' ', last) as name` |
| Aliases | Using aliased column in WHERE | Use original column name |
| Case sensitivity | MySQL: case-insensitive, PostgreSQL: case-sensitive | Always use consistent casing |
| Boolean columns | `WHERE active = 'true'` | `WHERE active = true` or `WHERE active = 1` |

---

## After ANY Schema Change

When schema changes:

1. **Update `.claude/schema.md`** with new columns/tables
2. **Search all files** for affected table queries:
   ```bash
   grep -rn "FROM table_name" src/
   grep -rn "JOIN table_name" src/
   ```
3. **Fix any queries** using old column names
4. **Test affected pages/endpoints**

---

## Query Patterns

### Pagination

```sql
-- Offset-based (simple, but slow for large offsets)
SELECT * FROM posts
ORDER BY created_at DESC
LIMIT 20 OFFSET 40

-- Cursor-based (efficient for large datasets)
SELECT * FROM posts
WHERE created_at < ?
ORDER BY created_at DESC
LIMIT 20
```

### Soft Deletes

```sql
-- Always filter soft-deleted records
SELECT * FROM users WHERE deleted_at IS NULL

-- Include soft-deleted (admin views)
SELECT * FROM users -- no filter

-- Only soft-deleted (trash view)
SELECT * FROM users WHERE deleted_at IS NOT NULL
```

### Aggregations

```sql
-- Count with condition
SELECT
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
FROM users

-- Group with HAVING
SELECT user_id, COUNT(*) as order_count
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 5
```

### Joins

```sql
-- INNER JOIN (only matching records)
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id

-- LEFT JOIN (all left records, matching right)
SELECT u.name, COALESCE(COUNT(o.id), 0) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
```

---

## ORM Guidelines (Laravel/Eloquent)

```php
// GOOD: Use scopes for reusable filters
User::active()->get();

// GOOD: Eager load relationships
User::with('posts')->get();

// BAD: N+1 query problem
$users = User::all();
foreach ($users as $user) {
    echo $user->posts->count(); // Query per user!
}
```

---

## Supabase/PostgreSQL Specifics

```typescript
// Row Level Security - always applied
const { data } = await supabase
    .from('posts')
    .select('*'); // RLS filters to user's posts automatically

// Bypass RLS (service role only)
const { data } = await supabaseAdmin
    .from('posts')
    .select('*');

// Full-text search
const { data } = await supabase
    .from('posts')
    .select('*')
    .textSearch('content', 'search terms');
```

---

## Performance Checklist

- [ ] Indexed columns used in WHERE clauses
- [ ] No SELECT * in production queries
- [ ] Pagination on list queries
- [ ] Eager loading for relationships (no N+1)
- [ ] EXPLAIN ANALYZE run on slow queries
- [ ] Connection pooling configured

---

## Security Checklist

- [ ] All queries use prepared statements
- [ ] User input validated before querying
- [ ] Row-level security or ownership checks
- [ ] Sensitive columns excluded from SELECT
- [ ] Rate limiting on expensive queries
- [ ] No raw SQL from user input
