#!/usr/bin/env node
/**
 * Secrets Blocker Hook
 * Prevents accidental commit of API keys, passwords, and other secrets.
 *
 * Event: PreToolUse
 * Tool: Edit, Write
 *
 * Detects:
 * - AWS access keys and secrets
 * - GitHub/GitLab tokens
 * - Stripe API keys
 * - Generic API keys (high-entropy strings)
 * - Private keys (RSA, DSA, EC, PGP)
 * - Database connection strings with passwords
 * - Password assignments in code
 * - JWT tokens
 * - OAuth tokens and refresh tokens
 *
 * Usage in .claude/settings.json:
 * {
 *   "hooks": {
 *     "PreToolUse": [{
 *       "type": "command",
 *       "command": "node .claude/hooks/secrets-blocker.js",
 *       "filter": { "tool": ["Edit", "Write"] }
 *     }]
 *   }
 * }
 */

const {
    readStdin,
    parseHookEvent,
    shouldSkipFile,
    isAllowlisted,
    deduplicateFindings,
    formatFindings,
    allowAndExit,
    blockAndExit
} = require('./hook-utils');

// Extra skip patterns for secrets (beyond base set)
const EXTRA_SKIP_PATTERNS = [
    /\.example$/i,
    /\.sample$/i,
    /\.template$/i
];

// Allowlisted patterns (placeholder/example values)
const ALLOWLIST_PATTERNS = [
    /^your[_-]?(api)?[_-]?key$/i,
    /^xxx+$/i,
    /^placeholder$/i,
    /^changeme$/i,
    /^secret$/i,
    /^password$/i,
    /^sk[_-]test[_-]/i,    // Stripe test keys
    /^pk[_-]test[_-]/i,    // Stripe test keys
    /^example$/i,
    /^test[_-]?key$/i,
    /^dummy$/i,
    /^fake$/i,
    /^sample$/i,
    /^demo$/i,
    /<[^>]+>/,             // Template placeholders like <YOUR_KEY>
    /\$\{[^}]+\}/,         // Variable interpolation ${VAR}
    /\{\{[^}]+\}\}/,       // Mustache/Handlebars {{ var }}
    /process\.env\./i,     // Environment variable references
    /getenv\(/i,           // PHP getenv()
    /os\.environ/i,        // Python os.environ
];

// Secret detection patterns
const SECRET_PATTERNS = [
    // AWS
    {
        name: 'AWS Access Key ID',
        pattern: /\b(AKIA[0-9A-Z]{16})\b/g,
        description: 'AWS access key (starts with AKIA)'
    },
    {
        name: 'AWS Secret Access Key',
        pattern: /\b([A-Za-z0-9/+=]{40})\b/g,
        context: /aws[_-]?secret|secret[_-]?access[_-]?key/i,
        description: 'AWS secret key (40 char base64)'
    },

    // GitHub
    {
        name: 'GitHub Personal Access Token',
        pattern: /\b(ghp_[A-Za-z0-9]{36})\b/g,
        description: 'GitHub PAT (starts with ghp_)'
    },
    {
        name: 'GitHub OAuth Token',
        pattern: /\b(gho_[A-Za-z0-9]{36})\b/g,
        description: 'GitHub OAuth (starts with gho_)'
    },
    {
        name: 'GitHub App Token',
        pattern: /\b(ghu_[A-Za-z0-9]{36}|ghs_[A-Za-z0-9]{36})\b/g,
        description: 'GitHub App token'
    },

    // GitLab
    {
        name: 'GitLab Token',
        pattern: /\b(glpat-[A-Za-z0-9_-]{20,})\b/g,
        description: 'GitLab personal access token'
    },

    // Stripe
    {
        name: 'Stripe Live Secret Key',
        pattern: /\b(sk_live_[A-Za-z0-9]{24,})\b/g,
        description: 'Stripe live secret key'
    },
    {
        name: 'Stripe Live Publishable Key',
        pattern: /\b(pk_live_[A-Za-z0-9]{24,})\b/g,
        description: 'Stripe live publishable key'
    },

    // Slack
    {
        name: 'Slack Token',
        pattern: /\b(xox[baprs]-[0-9A-Za-z-]{10,})\b/g,
        description: 'Slack API token'
    },

    // Discord
    {
        name: 'Discord Token',
        pattern: /\b([MN][A-Za-z0-9]{23,}\.[\w-]{6}\.[\w-]{27})\b/g,
        description: 'Discord bot/user token'
    },

    // Twilio
    {
        name: 'Twilio API Key',
        pattern: /\b(SK[0-9a-fA-F]{32})\b/g,
        description: 'Twilio API key'
    },

    // SendGrid
    {
        name: 'SendGrid API Key',
        pattern: /\b(SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43})\b/g,
        description: 'SendGrid API key'
    },

    // Generic high-entropy
    {
        name: 'Generic API Key',
        pattern: /\b(?:api[_-]?key|apikey|api[_-]?secret|secret[_-]?key)\s*[:=]\s*['"]?([A-Za-z0-9_-]{20,})['"]?/gi,
        description: 'Generic API key assignment'
    },

    // Private Keys
    {
        name: 'Private Key',
        pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi,
        description: 'RSA/DSA/EC private key'
    },
    {
        name: 'PGP Private Key',
        pattern: /-----BEGIN\s+PGP\s+PRIVATE\s+KEY\s+BLOCK-----/gi,
        description: 'PGP private key block'
    },

    // Database connection strings
    {
        name: 'Database Connection String',
        pattern: /(?:mysql|postgres|postgresql|mongodb|redis):\/\/[^:]+:([^@\s]+)@/gi,
        description: 'Database URL with password'
    },

    // Password assignments
    {
        name: 'Password Assignment',
        pattern: /\b(?:password|passwd|pwd)\s*[:=]\s*['"]([^'"]{8,})['"]/gi,
        validator: (match) => {
            const lower = match.toLowerCase();
            return !['password', 'changeme', 'secret', 'test', 'example', 'placeholder'].some(p => lower.includes(p));
        },
        description: 'Hardcoded password'
    },

    // JWT tokens
    {
        name: 'JWT Token',
        pattern: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
        description: 'JSON Web Token'
    },

    // OAuth tokens
    {
        name: 'Bearer Token',
        pattern: /\bBearer\s+([A-Za-z0-9_-]{20,})\b/gi,
        description: 'Bearer authentication token'
    },

    // Google
    {
        name: 'Google API Key',
        pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g,
        description: 'Google API key'
    },

    // Firebase
    {
        name: 'Firebase Key',
        pattern: /\bAAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]{140}\b/g,
        description: 'Firebase Cloud Messaging key'
    },

    // npm
    {
        name: 'npm Token',
        pattern: /\b(npm_[A-Za-z0-9]{36})\b/g,
        description: 'npm access token'
    },

    // Heroku
    {
        name: 'Heroku API Key',
        pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
        context: /heroku/i,
        description: 'Heroku API key (UUID format)'
    }
];

function detectSecrets(content, filePath) {
    const findings = [];

    for (const secret of SECRET_PATTERNS) {
        // If pattern requires context, check for it first
        if (secret.context && !secret.context.test(content)) {
            continue;
        }

        const matches = content.match(secret.pattern);
        if (matches) {
            for (const match of matches) {
                // Extract the actual secret (may be in a capture group)
                const actual = match.replace(/^.*[:=]\s*['"]?/, '').replace(/['"]?\s*$/, '');

                if (isAllowlisted(actual, ALLOWLIST_PATTERNS) || isAllowlisted(match, ALLOWLIST_PATTERNS)) continue;
                if (secret.validator && !secret.validator(actual)) continue;

                // Mask for display
                const toMask = actual.length > 8 ? actual : match;
                const masked = toMask.length > 10
                    ? toMask.substring(0, 4) + '*'.repeat(Math.min(toMask.length - 8, 16)) + toMask.substring(toMask.length - 4)
                    : '***';

                findings.push({
                    type: secret.name,
                    masked: masked,
                    description: secret.description
                });
            }
        }
    }

    return deduplicateFindings(findings);
}

async function main() {
    const event = await readStdin({ failClosed: true });
    const { filePath, content } = parseHookEvent(event);

    if (shouldSkipFile(filePath, EXTRA_SKIP_PATTERNS)) allowAndExit();
    if (!content || content.trim() === '') allowAndExit();

    const findings = detectSecrets(content, filePath);

    if (findings.length > 0) {
        const { list, more } = formatFindings(findings);

        blockAndExit(
            `Blocked: Potential secrets detected in ${filePath}\n\nFindings:\n${list}${more}\n\n` +
            `Best practices:\n` +
            `- Use environment variables: process.env.API_KEY\n` +
            `- Use .env files (add to .gitignore)\n` +
            `- Use secret managers (AWS Secrets Manager, Vault)\n` +
            `- For test keys, use sk_test_ or pk_test_ prefixes`
        );
    }

    allowAndExit();
}

main().catch(err => {
    console.error(`secrets-blocker error: ${err.message}`);
    process.exit(2);
});
