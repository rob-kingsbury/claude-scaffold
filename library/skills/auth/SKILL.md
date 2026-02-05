---
name: auth
description: Implement authentication patterns - JWT, sessions, OAuth, MFA. Security-focused with best practices for each approach.
---

# Auth Skill

Implement secure authentication with industry-standard patterns.

## Invocation

```
/auth [pattern]
```

Patterns:
- `/auth jwt` - JSON Web Token authentication
- `/auth session` - Server-side sessions
- `/auth oauth` - OAuth 2.0 / OpenID Connect
- `/auth mfa` - Multi-factor authentication
- `/auth passwordless` - Magic links / WebAuthn

Or naturally: "add authentication", "implement login", "secure the API"

## Authentication Patterns

### JWT (JSON Web Tokens)

**Best for:** APIs, SPAs, microservices, mobile apps

```
┌─────────┐     1. Login      ┌─────────┐
│  Client │ ───────────────▶ │  Server │
│         │                   │         │
│         │ ◀─────────────── │         │
└─────────┘  2. JWT + Refresh └─────────┘
     │
     │ 3. Request + JWT
     ▼
┌─────────┐
│   API   │  4. Verify JWT
└─────────┘
```

#### Token Structure

```javascript
// Header
{ "alg": "HS256", "typ": "JWT" }

// Payload (claims)
{
  "sub": "user-123",           // Subject (user ID)
  "email": "user@example.com",
  "role": "admin",
  "iat": 1704067200,           // Issued at
  "exp": 1704070800            // Expires (1 hour)
}

// Signature
HMACSHA256(base64(header) + "." + base64(payload), secret)
```

#### Implementation (Node.js)

```javascript
const jwt = require('jsonwebtoken');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Generate tokens
function generateTokens(user) {
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { sub: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
}

// Verify middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Refresh endpoint
app.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    if (payload.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Get user and generate new tokens
    const user = getUserById(payload.sub);
    const tokens = generateTokens(user);
    res.json(tokens);
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

#### JWT Security Checklist

- [ ] Use strong secret (256+ bits): `openssl rand -hex 32`
- [ ] Short access token expiry (15-60 min)
- [ ] Store refresh tokens server-side (database)
- [ ] Implement token revocation
- [ ] Use HTTPS only
- [ ] Don't store sensitive data in payload (it's base64, not encrypted)
- [ ] Validate all claims (exp, iat, iss, aud)

---

### Session-Based Auth

**Best for:** Traditional web apps, server-rendered pages

```
┌─────────┐     1. Login      ┌─────────┐
│  Client │ ───────────────▶ │  Server │
│         │                   │         │
│         │ ◀─────────────── │   │     │
└─────────┘  2. Set-Cookie    │   ▼     │
     │       (session_id)     │ ┌─────┐ │
     │                        │ │Store│ │
     │ 3. Request + Cookie    │ └─────┘ │
     ▼                        └─────────┘
┌─────────┐
│  Server │  4. Lookup session
└─────────┘
```

#### Implementation (Express + Redis)

```javascript
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  name: 'sessionId',  // Don't use default 'connect.sid'
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',  // HTTPS only
    httpOnly: true,   // No JavaScript access
    sameSite: 'lax',  // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  }
}));

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await authenticateUser(email, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Regenerate session to prevent fixation
  req.session.regenerate((err) => {
    req.session.userId = user.id;
    req.session.role = user.role;
    res.json({ success: true });
  });
});

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie('sessionId');
    res.json({ success: true });
  });
});
```

#### Session Security Checklist

- [ ] Use secure, httpOnly cookies
- [ ] Regenerate session ID after login
- [ ] Store sessions server-side (Redis, database)
- [ ] Set appropriate expiry
- [ ] Implement CSRF protection
- [ ] Use SameSite cookie attribute

---

### OAuth 2.0 / OpenID Connect

**Best for:** "Login with Google/GitHub", delegated authorization

```
┌────────┐                              ┌──────────┐
│  User  │                              │ Provider │
└────────┘                              │ (Google) │
    │                                   └──────────┘
    │ 1. Click "Login with Google"           │
    ▼                                        │
┌────────┐  2. Redirect to provider   ┌──────┴─────┐
│  App   │ ─────────────────────────▶ │  Auth URL  │
└────────┘                            └────────────┘
    │                                        │
    │         3. User approves               │
    │                                        │
    │  4. Redirect back with code     ┌──────┴─────┐
    │ ◀───────────────────────────── │  Callback  │
    │                                 └────────────┘
    │  5. Exchange code for tokens
    ▼
┌────────┐  6. Get user info          ┌──────────┐
│  App   │ ─────────────────────────▶ │ Provider │
└────────┘                            └──────────┘
```

#### Implementation (Passport.js)

```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    // Find or create user
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0]?.value
      });
    }

    return done(null, user);
  }
));

// Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);
```

#### OAuth Security Checklist

- [ ] Use state parameter to prevent CSRF
- [ ] Verify token signatures
- [ ] Store client secrets securely
- [ ] Request minimal scopes
- [ ] Handle token refresh
- [ ] Implement proper logout (revoke tokens)

---

### Multi-Factor Authentication (MFA)

#### TOTP (Time-based One-Time Password)

```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generate secret for user
app.post('/mfa/setup', requireAuth, async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `MyApp (${req.user.email})`,
    issuer: 'MyApp'
  });

  // Store secret (encrypted) in database
  await User.update(req.user.id, {
    mfaSecret: encrypt(secret.base32),
    mfaEnabled: false  // Not enabled until verified
  });

  // Generate QR code for authenticator app
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  res.json({ qrCode, secret: secret.base32 });
});

// Verify and enable MFA
app.post('/mfa/verify', requireAuth, async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user.id);

  const verified = speakeasy.totp.verify({
    secret: decrypt(user.mfaSecret),
    encoding: 'base32',
    token,
    window: 1  // Allow 1 step tolerance
  });

  if (!verified) {
    return res.status(400).json({ error: 'Invalid code' });
  }

  await User.update(req.user.id, { mfaEnabled: true });
  res.json({ success: true });
});

// Login with MFA
app.post('/login', async (req, res) => {
  const { email, password, mfaToken } = req.body;
  const user = await authenticateUser(email, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.mfaEnabled) {
    if (!mfaToken) {
      return res.json({ requiresMfa: true });
    }

    const verified = speakeasy.totp.verify({
      secret: decrypt(user.mfaSecret),
      encoding: 'base32',
      token: mfaToken,
      window: 1
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid MFA code' });
    }
  }

  // Generate session/JWT
  const tokens = generateTokens(user);
  res.json(tokens);
});
```

---

### Password Security

#### Hashing with bcrypt

```javascript
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// Hash password
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // Validate password strength
  if (!isStrongPassword(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters with uppercase, lowercase, and number'
    });
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({ email, password: hashedPassword });

  res.status(201).json({ id: user.id });
});
```

#### Password Requirements

```javascript
function isStrongPassword(password) {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  return (
    password.length >= minLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber
    // hasSpecial - optional, depends on policy
  );
}
```

---

## Security Best Practices

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts
  message: { error: 'Too many login attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/login', loginLimiter, loginHandler);
```

### Account Lockout

```javascript
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;  // 15 minutes

async function handleFailedLogin(user) {
  user.failedAttempts = (user.failedAttempts || 0) + 1;
  user.lastFailedAttempt = new Date();

  if (user.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    user.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
  }

  await user.save();
}

async function isAccountLocked(user) {
  if (!user.lockedUntil) return false;
  if (new Date() > user.lockedUntil) {
    // Unlock account
    user.lockedUntil = null;
    user.failedAttempts = 0;
    await user.save();
    return false;
  }
  return true;
}
```

### Security Headers

```javascript
const helmet = require('helmet');
app.use(helmet());

// Or manually:
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

---

## Output Format

```
=== AUTH CONFIGURED ===

Pattern: JWT with refresh tokens
Files created:
- src/middleware/auth.js
- src/routes/auth.js
- src/utils/tokens.js

Endpoints:
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout

Security features:
- [x] Password hashing (bcrypt)
- [x] Rate limiting (5/15min)
- [x] Token expiry (15min access, 7d refresh)
- [ ] MFA (optional, run /auth mfa)

Required env vars:
- JWT_SECRET (generate: openssl rand -hex 32)

Next steps:
1. Add JWT_SECRET to .env
2. Create user model with password field
3. Test login flow
```

## Sources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [OAuth 2.0 Security Best Practices](https://oauth.net/2/security-best-practices/)
