---
name: api-docs
description: Generate comprehensive API documentation from code. Supports OpenAPI/Swagger, markdown, and inline JSDoc/PHPDoc formats.
---

# API Documentation Skill

Generate and maintain API documentation automatically from your codebase.

## Invocation

```
/api-docs [generate|update|validate] [path]
```

Or naturally: "document this API", "generate API docs", "update the swagger spec"

## Commands

| Command | Description |
|---------|-------------|
| `/api-docs generate` | Create new documentation from code |
| `/api-docs update` | Update existing docs with changes |
| `/api-docs validate` | Check docs match implementation |

## Supported Formats

### OpenAPI/Swagger (JSON/YAML)

```yaml
openapi: 3.0.3
info:
  title: Project API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      responses:
        '200':
          description: Success
```

### Markdown API Reference

```markdown
## Endpoints

### GET /api/users

List all users with optional filtering.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| page | int | No | Page number (default: 1) |
| limit | int | No | Items per page (default: 20) |

**Response:**
```json
{
  "data": [...],
  "pagination": {...}
}
```
```

### Inline Documentation

**PHP (PHPDoc):**
```php
/**
 * Get user by ID
 *
 * @api GET /api/users/{id}
 * @param int $id User ID
 * @return array User data
 * @throws NotFoundException
 */
```

**JavaScript (JSDoc):**
```javascript
/**
 * Fetch user by ID
 * @route GET /api/users/:id
 * @param {string} id - User ID
 * @returns {Promise<User>} User object
 */
```

## Instructions for Claude

### generate Command

1. **Scan for API endpoints:**
   - PHP: Look for route handlers, controllers
   - Node: Express routes, handlers
   - Python: FastAPI, Flask routes

2. **Extract information for each endpoint:**
   - HTTP method and path
   - Request parameters (path, query, body)
   - Request/response schemas
   - Authentication requirements
   - Example requests/responses

3. **Generate documentation:**
   ```
   docs/
   ├── api/
   │   ├── openapi.yaml      # OpenAPI spec
   │   ├── README.md         # Human-readable overview
   │   └── endpoints/
   │       ├── users.md
   │       ├── auth.md
   │       └── ...
   ```

4. **Include:**
   - Base URL and authentication
   - Rate limits if applicable
   - Error response formats
   - Pagination patterns

### update Command

1. Compare existing docs against current code
2. Identify new/changed/removed endpoints
3. Update affected documentation
4. Flag breaking changes

### validate Command

1. Parse existing documentation
2. Compare against actual implementation
3. Report discrepancies:
   ```
   === API DOCUMENTATION VALIDATION ===

   MISSING from docs:
   - POST /api/users/bulk (added in users.php:142)

   OUTDATED:
   - GET /api/users - missing 'status' parameter

   REMOVED from code:
   - DELETE /api/legacy/cleanup (still documented)
   ```

## Output Template

```markdown
# API Reference

Base URL: `https://api.example.com/v1`

## Authentication

All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

## Endpoints

### Users

#### List Users
`GET /users`

Returns paginated list of users.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page |
| status | string | all | Filter by status |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Invalid or missing token |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 422 | Invalid input data |
```

## Integration

### With OpenAPI Tools

Generated OpenAPI specs work with:
- Swagger UI for interactive docs
- Postman for API testing
- Code generators for client SDKs

### Keeping Docs Updated

Add to your workflow:
```yaml
# .claude/workflows.yaml
api-docs:
  triggers: ["update api docs", "document api"]
  steps:
    - skill: api-docs update
    - commit: "docs: update API documentation"
```

## Sources

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [JSDoc](https://jsdoc.app/)
- [PHPDoc](https://docs.phpdoc.org/)
