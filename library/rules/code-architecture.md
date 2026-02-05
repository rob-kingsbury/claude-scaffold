# Code Architecture Rules

## Core Principles

```yaml
principles:
  - Security: Validate input, escape output, auth on sensitive endpoints
  - DRY: Extract repeated code to shared functions
  - KISS: Simple solutions over complex ones
  - Clarity: Choose readable code over clever code
  - Separation: Backend=logic/data, Frontend=presentation/interaction
```

## Code Simplifier Principles

Based on [Anthropic's Code-Simplifier](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-simplifier/agents/code-simplifier.md).

### 1. Preserve Functionality (Non-negotiable)
- NEVER change what the code does—only how it does it
- All original features, outputs, and behaviors MUST remain intact
- If unsure, don't change it

### 2. Enhance Clarity

**DO:**
- Reduce unnecessary complexity and nesting
- Use early returns to flatten code
- Eliminate redundant variables
- Improve variable/function names
- Consolidate related logic
- Remove comments that describe obvious code

**DON'T:**
- Use nested ternaries (prefer if/else or switch)
- Prioritize "fewer lines" over readability
- Create overly clever one-liners
- Remove helpful abstractions
- Combine too many concerns into one function

### 3. Avoid Over-Simplification

Do NOT:
- Reduce code clarity or maintainability
- Create "write-only" code (hard to understand later)
- Make code harder to debug or extend
- Remove abstractions that improve organization
- Prioritize line count over comprehension

### 4. Focus Scope
- Only refine recently modified code unless explicitly asked
- Leave working code alone if it's clear and functional

---

## PHP Standards

```php
// Database helper pattern
$student = dbQueryOne("SELECT * FROM students WHERE id = ?", [$id]);

// API response - always this format
echo json_encode(['success' => true, 'data' => $result]);
echo json_encode(['success' => false, 'error' => 'Message']);

// Early return pattern
function processSubmission($id) {
    $submission = dbQueryOne("SELECT * FROM submissions WHERE id = ?", [$id]);
    if (!$submission) {
        return ['success' => false, 'error' => 'Not found'];
    }

    // Main logic here
    return ['success' => true, 'data' => $submission];
}
```

### PHP Rules
- Use prepared statements for ALL database queries
- No raw `$_GET`, `$_POST` without validation
- Escape output with `htmlspecialchars()` for HTML
- Classes use PascalCase, methods use camelCase

---

## JavaScript Standards

```javascript
// Namespace everything (vanilla JS)
window.AppName = window.AppName || {};

// Event delegation (preferred)
container.addEventListener('click', e => {
    if (e.target.matches('.delete-btn')) handleDelete(e.target.dataset.id);
});

// Async/await with error handling
async function fetchData(endpoint) {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data;
    } catch (e) {
        showToast(e.message, 'error');
        throw e;
    }
}

// CONFIG object for magic values
const CONFIG = {
    debounceDelay: 300,
    maxRetries: 3,
    animationDuration: 200
};
```

### JavaScript Rules
- Namespace globals to prevent pollution
- Use event delegation on parent containers
- Use async/await with try/catch
- No inline `<script>` tags in templates

---

## TypeScript Standards

```typescript
// Explicit types for function signatures
function processUser(id: string): Promise<User | null> {
    // ...
}

// Use interfaces for object shapes
interface User {
    id: string;
    email: string;
    createdAt: Date;
}

// Zod for runtime validation
const userSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
});
```

---

## React Standards

```tsx
// Component structure
export function ComponentName({ prop1, prop2 }: Props) {
    // 1. Hooks first
    const [state, setState] = useState();
    const { data } = useQuery();

    // 2. Derived values
    const computed = useMemo(() => ..., [deps]);

    // 3. Effects
    useEffect(() => { ... }, [deps]);

    // 4. Handlers
    const handleClick = () => { ... };

    // 5. Early returns for loading/error states
    if (isLoading) return <Loading />;
    if (error) return <Error message={error} />;

    // 6. Main render
    return ( ... );
}
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `UserService` |
| Functions/methods | camelCase | `getUser()` |
| CSS classes | kebab-case | `user-card` |
| Database columns | snake_case | `created_at` |
| Files (components) | PascalCase | `UserCard.tsx` |
| Files (utilities) | kebab-case | `format-date.ts` |
| Constants | UPPER_SNAKE | `MAX_FILE_SIZE` |
| Environment vars | UPPER_SNAKE | `DATABASE_URL` |

---

## Security Checklist

- [ ] All user input validated before use
- [ ] Database queries use prepared statements / parameterized
- [ ] Output escaped appropriately for context (HTML, JSON, URL)
- [ ] API endpoints check authentication where needed
- [ ] No credentials or secrets in code
- [ ] File uploads validated (type, size, name)
- [ ] No path traversal vulnerabilities (`../`)
- [ ] CSRF protection on state-changing requests
- [ ] Rate limiting on sensitive endpoints

---

## Quality Checklist

- [ ] No duplicated code (DRY)
- [ ] Using appropriate helpers/utilities
- [ ] Standard response format for APIs
- [ ] Try/catch error handling
- [ ] Naming follows conventions
- [ ] No inline styles/scripts
- [ ] Early returns reduce nesting
