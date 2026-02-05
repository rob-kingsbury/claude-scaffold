---
name: error-handling
description: Implement robust error handling - error boundaries, logging, monitoring, user-friendly messages. Patterns for frontend and backend.
---

# Error Handling Skill

Implement comprehensive error handling with proper logging and user experience.

## Invocation

```
/error-handling [context]
```

Contexts:
- `/error-handling api` - API error responses
- `/error-handling frontend` - React/Vue error boundaries
- `/error-handling logging` - Structured logging setup
- `/error-handling monitoring` - Error tracking (Sentry, etc.)

Or naturally: "add error handling", "set up error boundaries", "improve error messages"

## Error Handling Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│                     ERROR OCCURS                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. CATCH - Don't let errors crash the app silently         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. LOG - Record details for debugging (not to user)        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. REPORT - Send to monitoring service (production)        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. RESPOND - User-friendly message, actionable if possible │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. RECOVER - Gracefully degrade or retry if appropriate    │
└─────────────────────────────────────────────────────────────┘
```

## Error Types

### Operational Errors (Expected)

Errors that can happen in normal operation:

- Invalid user input
- Network failures
- Database connection lost
- File not found
- Permission denied
- Rate limit exceeded

**Strategy:** Handle gracefully, inform user, possibly retry.

### Programming Errors (Bugs)

Errors that indicate code problems:

- TypeError / ReferenceError
- Null pointer exceptions
- Missing required arguments
- Invalid state

**Strategy:** Log, report, fail fast in development.

---

## Backend Error Handling

### Express.js Global Error Handler

```javascript
// errors/AppError.js
class AppError extends Error {
  constructor(message, statusCode, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Common errors
class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

module.exports = { AppError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError };
```

### Error Handling Middleware

```javascript
// middleware/errorHandler.js
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  // Default values
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Something went wrong';
  let details = err.details || null;

  // Log error
  const logContext = {
    errorCode: code,
    statusCode,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };

  if (err.isOperational) {
    // Operational error - expected
    logger.warn(message, logContext);
  } else {
    // Programming error - unexpected
    logger.error(err.stack, logContext);

    // Don't leak internal errors to client in production
    if (process.env.NODE_ENV === 'production') {
      message = 'An unexpected error occurred';
      code = 'INTERNAL_ERROR';
      details = null;
    }
  }

  // Send response
  const response = {
    success: false,
    error: { code, message }
  };

  if (details) {
    response.error.details = details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
```

### Using in Routes

```javascript
const { ValidationError, NotFoundError } = require('../errors/AppError');

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Route example
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User');
  }

  res.json({ success: true, data: user });
}));

router.post('/users', asyncHandler(async (req, res) => {
  const { email, name } = req.body;

  const errors = [];
  if (!email) errors.push({ field: 'email', message: 'Email is required' });
  if (!name) errors.push({ field: 'name', message: 'Name is required' });

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  const user = await User.create({ email, name });
  res.status(201).json({ success: true, data: user });
}));
```

### Setup in App

```javascript
const express = require('express');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Routes
app.use('/api', routes);

// 404 handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.statusCode = 404;
  err.code = 'ROUTE_NOT_FOUND';
  next(err);
});

// Global error handler (must be last)
app.use(errorHandler);

// Uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, let error handler deal with it
});
```

---

## Frontend Error Handling

### React Error Boundary

```jsx
// components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);

    // Send to Sentry/LogRocket/etc.
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre>{this.state.error?.toString()}</pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Using Error Boundaries

```jsx
// App.jsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary fallback={<GlobalErrorFallback />}>
      <Header />
      <ErrorBoundary fallback={<ContentErrorFallback />}>
        <MainContent />
      </ErrorBoundary>
      <Footer />
    </ErrorBoundary>
  );
}
```

### API Error Handling Hook

```jsx
// hooks/useApiError.js
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

export function useApiError() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((err) => {
    setError(err);

    // User-friendly messages
    const messages = {
      NETWORK_ERROR: 'Unable to connect. Check your internet connection.',
      VALIDATION_ERROR: 'Please check your input and try again.',
      UNAUTHORIZED: 'Please log in to continue.',
      FORBIDDEN: "You don't have permission to do this.",
      NOT_FOUND: 'The requested resource was not found.',
      RATE_LIMITED: 'Too many requests. Please wait a moment.',
      INTERNAL_ERROR: 'Something went wrong. Please try again later.',
    };

    const message = messages[err.code] || err.message || 'An error occurred';
    toast.error(message);

    // Log for debugging
    console.error('API Error:', err);
  }, []);

  const execute = useCallback(async (apiCall) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      // Transform fetch errors
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        err.code = 'NETWORK_ERROR';
      }

      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return { error, isLoading, execute, clearError: () => setError(null) };
}
```

### Using the Hook

```jsx
function UserProfile({ userId }) {
  const { error, isLoading, execute } = useApiError();
  const [user, setUser] = useState(null);

  useEffect(() => {
    execute(async () => {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();

      if (!data.success) {
        throw data.error;
      }

      setUser(data.data);
    });
  }, [userId, execute]);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return null;

  return <div>{user.name}</div>;
}
```

---

## Structured Logging

### Logger Setup (Winston)

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'app',
    environment: process.env.NODE_ENV
  },
  transports: [
    // Console for development
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development'
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : winston.format.json()
    }),
    // File for production
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' })
    ] : [])
  ]
});

module.exports = logger;
```

### Log Levels

| Level | Use Case | Example |
|-------|----------|---------|
| `error` | Errors that need attention | Database connection failed |
| `warn` | Potential issues | Deprecated API used |
| `info` | Normal operations | User logged in |
| `http` | HTTP requests | GET /api/users 200 |
| `debug` | Debugging info | Query executed in 50ms |

### Contextual Logging

```javascript
// Log with context
logger.info('User logged in', {
  userId: user.id,
  email: user.email,
  ip: req.ip,
  userAgent: req.headers['user-agent']
});

// Log errors with context
logger.error('Database query failed', {
  query: 'SELECT * FROM users WHERE id = ?',
  params: [userId],
  error: err.message,
  stack: err.stack
});
```

### Request Logging Middleware

```javascript
const morgan = require('morgan');
const logger = require('./logger');

// Morgan stream to Winston
const stream = {
  write: (message) => logger.http(message.trim())
};

// Combined format with custom tokens
app.use(morgan(':method :url :status :response-time ms - :res[content-length]', { stream }));
```

---

## Error Monitoring (Sentry)

### Setup

```javascript
// sentry.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Filter sensitive data
  beforeSend(event) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }
    return event;
  }
});

module.exports = Sentry;
```

### Express Integration

```javascript
const Sentry = require('./sentry');

// Request handler (first middleware)
app.use(Sentry.Handlers.requestHandler());

// Routes
app.use('/api', routes);

// Error handler (before your error handler)
app.use(Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Only report 500 errors to Sentry
    return error.status >= 500;
  }
}));

// Your error handler
app.use(errorHandler);
```

### Manual Error Reporting

```javascript
// Capture exception with context
Sentry.captureException(error, {
  user: { id: userId, email: userEmail },
  tags: { feature: 'checkout' },
  extra: { orderId, cartItems }
});

// Capture message
Sentry.captureMessage('Payment retry attempted', 'warning');
```

### React Integration

```jsx
// sentry.js
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
});

// Error boundary with Sentry
export const SentryErrorBoundary = Sentry.withErrorBoundary(App, {
  fallback: <ErrorFallback />,
  showDialog: true
});
```

---

## User-Friendly Error Messages

### Message Guidelines

| Error Type | Technical Message | User Message |
|------------|-------------------|--------------|
| Network | `ECONNREFUSED` | "Unable to connect. Check your internet." |
| Validation | `email must be valid` | "Please enter a valid email address." |
| Auth | `JWT expired` | "Your session expired. Please log in again." |
| Permission | `FORBIDDEN` | "You don't have access to this feature." |
| Not Found | `404 /api/user/123` | "We couldn't find what you're looking for." |
| Server | `ENOSPC` | "Something went wrong. Please try again." |

### Error Message Component

```jsx
function ErrorMessage({ error, retry }) {
  const getMessage = () => {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return {
          title: 'Connection Problem',
          message: "We couldn't reach the server. Check your internet connection.",
          action: 'Try Again',
          canRetry: true
        };
      case 'VALIDATION_ERROR':
        return {
          title: 'Invalid Input',
          message: error.message,
          action: null,
          canRetry: false
        };
      case 'UNAUTHORIZED':
        return {
          title: 'Session Expired',
          message: 'Please log in to continue.',
          action: 'Log In',
          href: '/login'
        };
      default:
        return {
          title: 'Something Went Wrong',
          message: "We're working on fixing this. Please try again later.",
          action: 'Try Again',
          canRetry: true
        };
    }
  };

  const { title, message, action, canRetry, href } = getMessage();

  return (
    <div className="error-message">
      <h3>{title}</h3>
      <p>{message}</p>
      {canRetry && retry && (
        <button onClick={retry}>{action}</button>
      )}
      {href && (
        <a href={href}>{action}</a>
      )}
    </div>
  );
}
```

---

## Output Format

```
=== ERROR HANDLING CONFIGURED ===

Backend:
- Custom error classes (AppError, ValidationError, etc.)
- Global error handler middleware
- Async route wrapper
- Structured logging (Winston)

Frontend:
- Error boundary component
- useApiError hook
- User-friendly message mapping

Monitoring:
- Sentry integration ready
- Error filtering configured

Files created:
- src/errors/AppError.js
- src/middleware/errorHandler.js
- src/utils/logger.js
- src/components/ErrorBoundary.jsx
- src/hooks/useApiError.js

Next steps:
1. Add SENTRY_DSN to .env (if using Sentry)
2. Wrap App with ErrorBoundary
3. Use asyncHandler in all routes
4. Test error scenarios
```

## Sources

- [Node.js Error Handling Best Practices](https://www.joyent.com/node-js/production/design/errors)
- [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)
- [Sentry Documentation](https://docs.sentry.io/)
- [The Twelve-Factor App: Logs](https://12factor.net/logs)
