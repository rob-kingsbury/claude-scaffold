---
name: db-migrate
description: Database migration management - create, run, and rollback migrations safely. Supports schema versioning and data migrations.
---

# Database Migration Skill

Manage database schema changes safely with version-controlled migrations.

## Invocation

```
/db-migrate [create|up|down|status|diff] [name]
```

Or naturally: "create a migration", "run migrations", "rollback last migration"

## Commands

| Command | Description |
|---------|-------------|
| `/db-migrate create <name>` | Create new migration file |
| `/db-migrate up` | Run pending migrations |
| `/db-migrate down [n]` | Rollback n migrations (default: 1) |
| `/db-migrate status` | Show migration status |
| `/db-migrate diff` | Compare schema to migrations |

## Migration File Structure

```
migrations/
├── 001_create_users_table.sql
├── 002_add_email_verified_column.sql
├── 003_create_sessions_table.sql
└── ...
```

Or with timestamps:
```
migrations/
├── 20240115_100000_create_users_table.sql
├── 20240116_143000_add_email_verified.sql
└── ...
```

## Migration Templates

### SQL Migration (Plain SQL)

```sql
-- migrations/001_create_users_table.sql
-- UP
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- DOWN
DROP TABLE IF EXISTS users;
```

### PHP Migration (Laravel-style)

```php
<?php
// migrations/2024_01_15_100000_create_users_table.php

return new class extends Migration {
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('password');
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

### JavaScript Migration (Knex-style)

```javascript
// migrations/001_create_users_table.js
exports.up = function(knex) {
    return knex.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('email').unique().notNullable();
        table.string('password_hash').notNullable();
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
```

## Instructions for Claude

### create Command

1. **Determine migration type:**
   - Schema change (CREATE, ALTER, DROP)
   - Data migration (UPDATE, INSERT)
   - Index change (CREATE INDEX, DROP INDEX)

2. **Generate migration file:**
   ```
   Creating migration: add_status_to_orders

   File: migrations/004_add_status_to_orders.sql

   -- UP
   ALTER TABLE orders
   ADD COLUMN status ENUM('pending', 'processing', 'shipped', 'delivered')
   DEFAULT 'pending' AFTER total;

   CREATE INDEX idx_orders_status ON orders(status);

   -- DOWN
   DROP INDEX idx_orders_status ON orders;
   ALTER TABLE orders DROP COLUMN status;
   ```

3. **Safety checks:**
   - Warn about destructive operations
   - Suggest data backup for data migrations
   - Flag potential long-running operations

### up Command

1. **Check migration status:**
   ```
   Checking migrations...

   Pending: 2 migrations
   - 003_add_user_roles.sql
   - 004_add_status_to_orders.sql
   ```

2. **Run migrations:**
   ```
   Running: 003_add_user_roles.sql... OK (0.12s)
   Running: 004_add_status_to_orders.sql... OK (0.08s)

   Completed: 2 migrations applied
   ```

3. **Update schema documentation:**
   - Refresh `.claude/schema.md` after migrations
   - Note any new tables/columns

### down Command

1. **Show what will be rolled back:**
   ```
   Rolling back 1 migration:
   - 004_add_status_to_orders.sql

   This will:
   - Drop column: orders.status
   - Drop index: idx_orders_status

   Continue? [y/N]
   ```

2. **Execute rollback:**
   ```
   Rolling back: 004_add_status_to_orders.sql... OK

   Rolled back 1 migration
   ```

### status Command

```
=== MIGRATION STATUS ===

Applied (4):
  001_create_users_table.sql          2024-01-15 10:00:00
  002_create_sessions_table.sql       2024-01-15 10:01:00
  003_add_user_roles.sql              2024-01-16 14:30:00
  004_add_status_to_orders.sql        2024-01-17 09:15:00

Pending (0):
  (none)

Database: my_database
Migration table: schema_migrations
```

### diff Command

Compare current database schema against migration history:

```
=== SCHEMA DIFF ===

In database but not in migrations:
- Table: temp_import_data (consider cleanup or migration)
- Column: users.legacy_id (added manually?)

In migrations but not in database:
- Index: idx_orders_created_at (migration failed?)

Recommendation:
- Create migration for users.legacy_id if intentional
- Drop temp_import_data or document its purpose
- Re-run migration 003 to create missing index
```

## Best Practices

### DO
- One logical change per migration
- Always include DOWN migration
- Test migrations on copy of production data
- Use transactions where supported
- Name migrations descriptively

### DON'T
- Modify already-applied migrations
- Put multiple unrelated changes in one file
- Forget to update schema documentation
- Run untested migrations in production

## Data Migration Example

```sql
-- migrations/005_migrate_user_status.sql
-- UP
-- First, add the new column
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';

-- Then migrate data from old boolean
UPDATE users SET status = CASE
    WHEN is_active = 1 THEN 'active'
    WHEN is_deleted = 1 THEN 'deleted'
    ELSE 'inactive'
END;

-- Finally, drop old columns
ALTER TABLE users DROP COLUMN is_active;
ALTER TABLE users DROP COLUMN is_deleted;

-- DOWN
ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1;
ALTER TABLE users ADD COLUMN is_deleted TINYINT(1) DEFAULT 0;

UPDATE users SET
    is_active = CASE WHEN status = 'active' THEN 1 ELSE 0 END,
    is_deleted = CASE WHEN status = 'deleted' THEN 1 ELSE 0 END;

ALTER TABLE users DROP COLUMN status;
```

## Integration

After running migrations, always:
1. Update `.claude/schema.md`
2. Test affected queries
3. Commit migration files

## Sources

- [Flyway](https://flywaydb.org/)
- [Laravel Migrations](https://laravel.com/docs/migrations)
- [Knex.js Migrations](https://knexjs.org/guide/migrations.html)
