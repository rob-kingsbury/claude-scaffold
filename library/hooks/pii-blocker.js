#!/usr/bin/env node
/**
 * PII Blocker Hook
 * Prevents accidental commit of personally identifiable information.
 *
 * Event: PreToolUse
 * Tool: Edit, Write
 *
 * Detects:
 * - Social Security Numbers (XXX-XX-XXXX)
 * - Credit card numbers (various formats)
 * - Phone numbers (US formats)
 * - Email addresses (real-looking, not @example.com)
 * - IP addresses (non-localhost)
 *
 * Usage in .claude/settings.json:
 * {
 *   "hooks": {
 *     "PreToolUse": [{
 *       "type": "command",
 *       "command": "node .claude/hooks/pii-blocker.js",
 *       "filter": { "tool": ["Edit", "Write"] }
 *     }]
 *   }
 * }
 */

const readline = require('readline');

// File extensions to skip (binary, media, etc.)
const SKIP_EXTENSIONS = [
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp',
    '.mp3', '.mp4', '.wav', '.avi', '.mov',
    '.pdf', '.zip', '.tar', '.gz',
    '.woff', '.woff2', '.ttf', '.eot',
    '.lock', '.sum'
];

// Files/paths to skip checking
const SKIP_PATTERNS = [
    /node_modules\//i,
    /vendor\//i,
    /\.git\//i,
    /package-lock\.json$/i,
    /composer\.lock$/i,
    /yarn\.lock$/i,
    /\.min\.(js|css)$/i
];

// Patterns that indicate test/example data (allow these)
const ALLOWLIST_PATTERNS = [
    /@example\.(com|org|net)$/i,
    /@test\.(com|org|net)$/i,
    /john\.doe|jane\.doe|test\.user/i,
    /555-\d{4}/,  // 555 prefix = fake US phone numbers
    /123-45-6789/,  // Common example SSN
    /4111-?1111-?1111-?1111/,  // Test credit card
    /4242-?4242-?4242-?4242/,  // Stripe test card
    /0000-?0000-?0000-?0000/   // Obvious placeholder
];

// PII detection patterns
const PII_PATTERNS = [
    {
        name: 'Social Security Number',
        pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
        description: 'Format: XXX-XX-XXXX'
    },
    {
        name: 'Social Security Number (no dashes)',
        pattern: /\b(?<!\d)\d{9}(?!\d)\b/g,
        // Exclude years, zip codes, and other 9-digit sequences that aren't SSNs
        validator: (match) => {
            // SSNs don't start with 000 or 666 (9xx valid since 2011 randomization)
            const firstThree = match.substring(0, 3);
            return firstThree !== '000' && firstThree !== '666';
        },
        description: 'Format: XXXXXXXXX'
    },
    {
        name: 'Credit Card Number',
        // Visa, MasterCard, Amex, Discover patterns
        pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
        description: 'Visa, MasterCard, Amex, or Discover'
    },
    {
        name: 'Credit Card Number (with separators)',
        pattern: /\b(?:4[0-9]{3}|5[1-5][0-9]{2}|3[47][0-9]{2}|6(?:011|5[0-9]{2}))[-\s]?[0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4}\b/g,
        description: 'Card number with dashes or spaces'
    },
    {
        name: 'US Phone Number',
        pattern: /\b(?:\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
        description: 'Format: (XXX) XXX-XXXX or variants'
    },
    {
        name: 'Email Address (potential PII)',
        // Match emails that look like real names, not generic ones
        pattern: /\b[a-zA-Z][a-zA-Z0-9._%+-]*[a-zA-Z0-9]@(?!example\.|test\.|localhost)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi,
        description: 'Real-looking email address'
    },
    {
        name: 'IP Address (non-local)',
        // Exclude localhost, private ranges for some cases
        pattern: /\b(?!127\.0\.0\.1|0\.0\.0\.0|localhost)(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
        description: 'Non-localhost IP address'
    },
    {
        name: 'Date of Birth Pattern',
        // DOB: followed by date
        pattern: /\b(?:dob|date.?of.?birth|birth.?date)\s*[:=]\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi,
        description: 'Date of birth field'
    }
];

function shouldSkipFile(filePath) {
    if (!filePath) return true;

    // Check extension
    const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
    if (SKIP_EXTENSIONS.includes(ext)) return true;

    // Check path patterns
    for (const pattern of SKIP_PATTERNS) {
        if (pattern.test(filePath)) return true;
    }

    return false;
}

function isAllowlisted(content) {
    for (const pattern of ALLOWLIST_PATTERNS) {
        if (pattern.test(content)) return true;
    }
    return false;
}

function detectPII(content) {
    const findings = [];

    for (const pii of PII_PATTERNS) {
        const matches = content.match(pii.pattern);
        if (matches) {
            for (const match of matches) {
                // Skip if allowlisted
                if (isAllowlisted(match)) continue;

                // Run custom validator if present
                if (pii.validator && !pii.validator(match)) continue;

                // Mask the middle of the match for display
                const masked = match.length > 6
                    ? match.substring(0, 3) + '*'.repeat(match.length - 6) + match.substring(match.length - 3)
                    : '***';

                findings.push({
                    type: pii.name,
                    masked: masked,
                    description: pii.description
                });
            }
        }
    }

    // Deduplicate by type
    const unique = [];
    const seen = new Set();
    for (const finding of findings) {
        const key = `${finding.type}:${finding.masked}`;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(finding);
        }
    }

    return unique;
}

async function main() {
    const rl = readline.createInterface({ input: process.stdin });
    let input = '';

    for await (const line of rl) {
        input += line;
    }

    const event = JSON.parse(input);
    // Claude Code uses snake_case for hook event properties
    const filePath = event.tool_input?.file_path || '';
    const content = event.tool_input?.content || event.tool_input?.new_string || '';

    // Skip certain files
    if (shouldSkipFile(filePath)) {
        // Empty JSON = allow operation
        process.stdout.write('{}');
        process.exit(0);
    }

    // Skip empty content
    if (!content || content.trim() === '') {
        // Empty JSON = allow operation
        process.stdout.write('{}');
        process.exit(0);
    }

    // Detect PII
    const findings = detectPII(content);

    if (findings.length > 0) {
        const findingsList = findings
            .slice(0, 5)  // Limit to first 5
            .map(f => `  - ${f.type}: ${f.masked}`)
            .join('\n');

        const more = findings.length > 5 ? `\n  ...and ${findings.length - 5} more` : '';

        // Exit 2 blocks the operation; stderr message is shown to Claude
        console.error(`Blocked: Potential PII detected in ${filePath}\n\nFindings:\n${findingsList}${more}\n\n` +
                     `If this is test/example data, use:\n` +
                     `- @example.com for emails\n` +
                     `- 555-xxxx for phone numbers\n` +
                     `- 123-45-6789 for SSNs\n` +
                     `- 4242424242424242 for credit cards`);
        process.exit(2);
    }

    // No PII found, allow
    process.stdout.write('{}');
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
