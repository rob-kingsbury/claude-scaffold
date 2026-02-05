# API Design Rules

**DO NOT REMOVE** - These rules ensure consistent, well-designed REST APIs.

## Core Principles

```yaml
principles:
  - Consistency: Same patterns everywhere
  - Predictability: Developers can guess endpoints
  - Simplicity: Don't over-engineer
  - Documentation: Every endpoint documented
```

## URL Structure

### Resource Naming

```
# Good - nouns, plural, lowercase, kebab-case
GET /users
GET /users/123
GET /users/123/orders
GET /order-items

# Bad
GET /getUsers           # verb in URL
GET /User               # singular, capitalized
GET /user_orders        # snake_case
GET /users/123/getOrders # verb in URL
```

### Hierarchy

```
# Collection
GET    /users           # List all users
POST   /users           # Create user

# Single resource
GET    /users/123       # Get user 123
PUT    /users/123       # Replace user 123
PATCH  /users/123       # Update user 123
DELETE /users/123       # Delete user 123

# Nested resources (max 2 levels deep)
GET    /users/123/orders        # User's orders
POST   /users/123/orders        # Create order for user
GET    /users/123/orders/456    # Specific order

# Avoid deep nesting - use query params instead
GET /orders?user_id=123         # Better than /users/123/orders/456/items
```

### Query Parameters

```
# Filtering
GET /users?status=active&role=admin

# Sorting
GET /users?sort=created_at&order=desc
GET /users?sort=-created_at              # Alternative: prefix with -

# Pagination
GET /users?page=2&per_page=20
GET /users?offset=20&limit=20            # Alternative

# Field selection
GET /users?fields=id,name,email

# Search
GET /users?q=john
GET /users?search=john                   # Alternative
```

## HTTP Methods

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Retrieve resource(s) | Yes | Yes |
| POST | Create resource | No | No |
| PUT | Replace resource entirely | Yes | No |
| PATCH | Update resource partially | Yes* | No |
| DELETE | Remove resource | Yes | No |

*PATCH should be idempotent when possible.

### Method Usage

```
# GET - always safe, never modifies data
GET /users/123

# POST - create new resource, return 201 + Location header
POST /users
Location: /users/124

# PUT - replace entire resource (send all fields)
PUT /users/123
{ "name": "John", "email": "john@example.com", "role": "admin" }

# PATCH - partial update (send only changed fields)
PATCH /users/123
{ "role": "admin" }

# DELETE - remove resource
DELETE /users/123
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-20T10:30:00Z"
  }
}
```

### Collection Response

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "John" },
    { "id": 2, "name": "Jane" }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "name", "message": "Name is required" }
    ]
  }
}
```

## HTTP Status Codes

### Success (2xx)

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE (no response body) |

### Client Errors (4xx)

| Code | Meaning | When to Use |
|------|---------|-------------|
| 400 | Bad Request | Invalid JSON, missing required fields |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry, version conflict |
| 422 | Unprocessable Entity | Validation errors (alternative to 400) |
| 429 | Too Many Requests | Rate limit exceeded |

### Server Errors (5xx)

| Code | Meaning | When to Use |
|------|---------|-------------|
| 500 | Internal Server Error | Unexpected server error |
| 502 | Bad Gateway | Upstream service error |
| 503 | Service Unavailable | Maintenance, overload |

## Versioning

### URL Versioning (Recommended)

```
GET /api/v1/users
GET /api/v2/users
```

### Header Versioning (Alternative)

```
GET /api/users
Accept: application/vnd.myapp.v1+json
```

### Version Rules

1. Don't break existing clients
2. Deprecate before removing
3. Support at least 2 versions
4. Document breaking changes

## Authentication

### Bearer Token (Recommended)

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### API Key (Simple Services)

```
X-API-Key: your-api-key
# Or in query param (less secure)
GET /users?api_key=your-api-key
```

### Response for Auth Errors

```json
// 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}

// 403 Forbidden
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this resource"
  }
}
```

## Pagination

### Offset-Based (Simple)

```
GET /users?page=2&per_page=20

Response:
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 2,
    "per_page": 20,
    "total_pages": 5
  },
  "links": {
    "first": "/users?page=1&per_page=20",
    "prev": "/users?page=1&per_page=20",
    "next": "/users?page=3&per_page=20",
    "last": "/users?page=5&per_page=20"
  }
}
```

### Cursor-Based (Large Datasets)

```
GET /users?cursor=eyJpZCI6MTIzfQ&limit=20

Response:
{
  "data": [...],
  "meta": {
    "has_more": true,
    "next_cursor": "eyJpZCI6MTQzfQ"
  }
}
```

## Error Handling

### Standard Error Codes

```
VALIDATION_ERROR     - Input validation failed
NOT_FOUND            - Resource not found
UNAUTHORIZED         - Authentication required
FORBIDDEN            - Not authorized for this action
CONFLICT             - Resource conflict (duplicate)
RATE_LIMITED         - Too many requests
INTERNAL_ERROR       - Server error (generic)
SERVICE_UNAVAILABLE  - Maintenance or overload
```

### Validation Errors

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Must be a valid email address"
      },
      {
        "field": "password",
        "code": "TOO_SHORT",
        "message": "Must be at least 8 characters"
      }
    ]
  }
}
```

## Rate Limiting

### Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

### 429 Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "retry_after": 60
  }
}
```

## Special Endpoints

### Actions (Non-CRUD Operations)

```
# Use POST for actions
POST /users/123/activate
POST /orders/456/cancel
POST /reports/generate

# Or verb at end of resource
POST /users/123/send-verification-email
```

### Batch Operations

```
# Batch create
POST /users/batch
{ "users": [{...}, {...}, {...}] }

# Batch update
PATCH /users/batch
{ "ids": [1, 2, 3], "updates": { "status": "active" } }

# Batch delete
DELETE /users/batch
{ "ids": [1, 2, 3] }
```

### Search Endpoint

```
# Complex search with POST body
POST /users/search
{
  "filters": {
    "status": "active",
    "role": ["admin", "moderator"],
    "created_at": { "gte": "2024-01-01" }
  },
  "sort": { "field": "created_at", "order": "desc" },
  "page": 1,
  "per_page": 20
}
```

## Documentation Standards

### Each Endpoint Must Document

1. **Method & URL** - `GET /users/{id}`
2. **Description** - What it does
3. **Authentication** - Required? What scopes?
4. **Parameters** - Path, query, body
5. **Request example** - Sample request
6. **Response example** - Sample response
7. **Error codes** - Possible errors
8. **Rate limits** - If applicable

### OpenAPI Example

```yaml
/users/{id}:
  get:
    summary: Get user by ID
    description: Retrieve a single user by their unique identifier
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: integer
    responses:
      200:
        description: User found
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      404:
        description: User not found
```

## Checklist

Before deploying an API endpoint:

- [ ] URL follows naming conventions
- [ ] Correct HTTP method used
- [ ] Response format is consistent
- [ ] Error responses include code and message
- [ ] Validation errors list all fields
- [ ] Authentication checked if required
- [ ] Rate limiting configured
- [ ] Pagination implemented for collections
- [ ] Documentation written
- [ ] Examples tested

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Verbs in URLs | Use nouns: `/users` not `/getUsers` |
| Inconsistent naming | Pick one style and stick to it |
| Missing error details | Always include field-level errors |
| 200 for errors | Use proper status codes |
| No pagination | Always paginate collections |
| Breaking changes | Version the API |
| No rate limiting | Add from the start |

## Sources

- [REST API Design Best Practices](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/)
- [HTTP Status Codes](https://httpstatuses.com/)
- [JSON:API Specification](https://jsonapi.org/)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
