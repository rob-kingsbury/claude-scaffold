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
 * - Credit card numbers (various formats, Luhn-validated)
 * - Phone numbers (US formats)
 * - Email addresses (real-looking, not @example.com)
 * - IP addresses (non-localhost, non-private)
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

// Patterns that indicate test/example data (allow these)
const ALLOWLIST_PATTERNS = [
    /@example\.(com|org|net)$/i,
    /@test\.(com|org|net)$/i,
    /^john\.doe@|^jane\.doe@|^test\.user@/i,
    /^555-\d{4}$/,  // 555 prefix = fake US phone numbers
    /^123-45-6789$/,  // Common example SSN
    /^4111-?1111-?1111-?1111$/,  // Test credit card
    /^4242-?4242-?4242-?4242$/,  // Stripe test card
    /^0000-?0000-?0000-?0000$/   // Obvious placeholder
];

/**
 * Luhn checksum validation for credit card numbers.
 * @param {string} number - Digits only (no separators)
 * @returns {boolean}
 */
function luhnCheck(number) {
    const digits = number.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    return sum % 10 === 0;
}

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
        validator: (match) => {
            // SSNs don't start with 000 or 666 (9xx valid since 2011 randomization)
            const firstThree = match.substring(0, 3);
            return firstThree !== '000' && firstThree !== '666';
        },
        description: 'Format: XXXXXXXXX'
    },
    {
        name: 'Credit Card Number',
        pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
        validator: (match) => luhnCheck(match),
        description: 'Visa, MasterCard, Amex, or Discover'
    },
    {
        name: 'Credit Card Number (with separators)',
        pattern: /\b(?:4[0-9]{3}|5[1-5][0-9]{2}|3[47][0-9]{2}|6(?:011|5[0-9]{2}))[-\s]?[0-9]{4}[-\s]?[0-9]{4}[-\s]?[0-9]{4}\b/g,
        validator: (match) => luhnCheck(match),
        description: 'Card number with dashes or spaces'
    },
    {
        name: 'US Phone Number',
        pattern: /\b(?:\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
        description: 'Format: (XXX) XXX-XXXX or variants'
    },
    {
        name: 'Email Address (potential PII)',
        pattern: /\b[a-zA-Z][a-zA-Z0-9._%+-]*[a-zA-Z0-9]@(?!example\.|test\.|localhost|invalid\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi,
        description: 'Real-looking email address'
    },
    {
        name: 'IP Address (non-local)',
        pattern: /\b(?!127\.0\.0\.1|0\.0\.0\.0|localhost|10\.\d|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.)(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
        description: 'Non-localhost, non-private IP address'
    },
    {
        name: 'Date of Birth Pattern',
        pattern: /\b(?:dob|date.?of.?birth|birth.?date)\s*[:=]\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi,
        description: 'Date of birth field'
    }
];

function detectPII(content) {
    const findings = [];

    for (const pii of PII_PATTERNS) {
        const matches = content.match(pii.pattern);
        if (matches) {
            for (const match of matches) {
                if (isAllowlisted(match, ALLOWLIST_PATTERNS)) continue;
                if (pii.validator && !pii.validator(match)) continue;

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

    return deduplicateFindings(findings);
}

async function main() {
    const event = await readStdin({ failClosed: true });
    const { filePath, content } = parseHookEvent(event);

    if (shouldSkipFile(filePath)) allowAndExit();
    if (!content || content.trim() === '') allowAndExit();

    const findings = detectPII(content);

    if (findings.length > 0) {
        const { list, more } = formatFindings(findings);

        blockAndExit(
            `Blocked: Potential PII detected in ${filePath}\n\nFindings:\n${list}${more}\n\n` +
            `If this is test/example data, use:\n` +
            `- @example.com for emails\n` +
            `- 555-xxxx for phone numbers\n` +
            `- 123-45-6789 for SSNs\n` +
            `- 4242424242424242 for credit cards`
        );
    }

    allowAndExit();
}

main().catch(err => {
    console.error(`pii-blocker error: ${err.message}`);
    process.exit(2);
});
